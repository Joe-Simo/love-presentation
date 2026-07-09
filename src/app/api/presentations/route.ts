import { checkBotId } from "botid/server";
import type { IncomingHttpHeaders } from "node:http";
import { NextResponse } from "next/server";
import {
  createPresentationResponseSchema,
  creatorFieldsSchema,
} from "@/lib/love/schema";
import { createSharePayload, encodeSharePayload } from "@/lib/love/share";

type HumanVerification =
  | {
      status: "human";
    }
  | {
      status: "bot";
    }
  | {
      status: "unavailable";
      code: "botid_requires_vercel_oidc" | "botid_verification_unavailable";
      message: string;
    };

export async function POST(request: Request) {
  const verification = await verifyHumanRequest(request);

  if (verification.status === "bot") {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  if (verification.status === "unavailable") {
    return NextResponse.json(
      {
        error: verification.message,
        code: verification.code,
      },
      { status: 503 },
    );
  }

  const body = await readJson(request);
  const fields = creatorFieldsSchema.safeParse(body);

  if (!fields.success) {
    return NextResponse.json(
      { error: "Invalid presentation request." },
      { status: 400 },
    );
  }

  const payload = createSharePayload({
    ...fields.data,
    seed: crypto.randomUUID(),
  });
  const response = createPresentationResponseSchema.parse({
    token: encodeSharePayload(payload),
  });

  return NextResponse.json(response);
}

async function verifyHumanRequest(request: Request): Promise<HumanVerification> {
  const oidcToken =
    request.headers.get("x-vercel-oidc-token") ?? process.env.VERCEL_OIDC_TOKEN;

  if (requiresVercelOidcToken(oidcToken)) {
    return {
      status: "unavailable",
      code: "botid_requires_vercel_oidc",
      message: "Bot verification is not configured for this deployment.",
    };
  }

  try {
    const verification = await checkBotId({
      advancedOptions: {
        headers: headersForBotId(request),
        ...(oidcToken ? { vercelOidcToken: oidcToken } : {}),
      },
    });

    return verification.isBot ? { status: "bot" } : { status: "human" };
  } catch (error) {
    console.error(
      "BotID verification failed.",
      error instanceof Error ? error.message : error,
    );

    return {
      status: "unavailable",
      code: "botid_verification_unavailable",
      message: "Bot verification is unavailable.",
    };
  }
}

function requiresVercelOidcToken(oidcToken: string | null | undefined) {
  const isProductionRuntime = process.env.NODE_ENV === "production";
  const isVercelRuntime = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

  return isProductionRuntime && !isVercelRuntime && !oidcToken;
}

function headersForBotId(request: Request): IncomingHttpHeaders {
  const headers: IncomingHttpHeaders = {};
  const url = new URL(request.url);

  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  headers.host ??= url.host;
  headers.url = request.url;
  headers["x-method"] = request.method;
  headers["x-path"] = url.pathname;

  return headers;
}

async function readJson(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}
