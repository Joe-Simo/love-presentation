import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";
import {
  createPresentationResponseSchema,
  creatorFieldsSchema,
} from "@/lib/love/schema";
import { createSharePayload, encodeSharePayload } from "@/lib/love/share";

export async function POST(request: Request) {
  const verification = await verifyHumanRequest();

  if (verification === "bot") {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  if (verification === "unavailable") {
    return NextResponse.json(
      { error: "Bot verification is unavailable." },
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

async function verifyHumanRequest() {
  try {
    const verification = await checkBotId();

    return verification.isBot ? "bot" : "human";
  } catch (error) {
    console.error(
      "BotID verification failed.",
      error instanceof Error ? error.message : error,
    );

    return "unavailable";
  }
}

async function readJson(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}
