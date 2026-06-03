import { createPresentationResponseSchema } from "@/lib/love/schema";
import type { CreatorFields } from "@/lib/love/schema";

export async function createPresentationShareUrl(input: CreatorFields) {
  const response = await fetch("/api/presentations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(errorMessageForStatus(response.status));
  }

  const parsed = createPresentationResponseSchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Couldn't create link. Try again.");
  }

  const shareUrl = new URL("/p", window.location.origin);
  shareUrl.hash = parsed.data.token;

  return shareUrl.toString();
}

function errorMessageForStatus(status: number) {
  if (status === 403) {
    return "Access denied.";
  }

  if (status === 400) {
    return "Check the names and photo links, then try again.";
  }

  if (status === 503) {
    return "Bot verification is unavailable. Try again later.";
  }

  return "Couldn't create link. Try again.";
}
