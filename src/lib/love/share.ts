import { MAX_IMAGE_URLS } from "@/lib/love/config";
import { createSlides } from "@/lib/love/phrases";
import {
  imageUrlsSchema,
  sharePayloadSchema,
  shareTokenSchema,
} from "@/lib/love/schema";
import type {
  PresentationAsset,
  PublicPresentation,
  SharePayload,
} from "@/lib/love/types";

export function createSharePayload(input: {
  senderName: string;
  recipientName: string;
  vibe: SharePayload["vibe"];
  deckLength?: SharePayload["deckLength"];
  dramaLevel?: SharePayload["dramaLevel"];
  occasion?: SharePayload["occasion"];
  insideJoke?: string;
  imageUrls: string[];
  seed: string;
  createdAt?: string;
}): SharePayload {
  return sharePayloadSchema.parse({
    v: 1,
    senderName: input.senderName,
    recipientName: input.recipientName,
    vibe: input.vibe,
    seed: input.seed,
    createdAt: input.createdAt ?? new Date().toISOString(),
    deckLength: input.deckLength,
    dramaLevel: input.dramaLevel,
    occasion: input.occasion,
    insideJoke: sanitizeOptionalText(input.insideJoke),
    imageUrls: sanitizeImageUrls(input.imageUrls),
  });
}

export function sanitizeImageUrls(values: string[]) {
  const imageUrls = values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .slice(0, MAX_IMAGE_URLS);

  return imageUrlsSchema.parse(imageUrls);
}

export function presentationFromPayload(
  payload: SharePayload,
): PublicPresentation {
  const parsed = sharePayloadSchema.parse(payload);
  const assets: PresentationAsset[] = parsed.imageUrls.map((url, index) => ({
    id: `image-${index}`,
    url,
    width: 1200,
    height: 1500,
  }));

  return {
    id: parsed.seed,
    senderName: parsed.senderName,
    recipientName: parsed.recipientName,
    vibe: parsed.vibe,
    seed: parsed.seed,
    createdAt: parsed.createdAt,
    assets,
    slides: createSlides({
      senderName: parsed.senderName,
      recipientName: parsed.recipientName,
      vibe: parsed.vibe,
      seed: parsed.seed,
      deckLength: parsed.deckLength,
      dramaLevel: parsed.dramaLevel,
      occasion: parsed.occasion,
      insideJoke: parsed.insideJoke,
      assets,
    }),
  };
}

export function encodeSharePayload(payload: SharePayload) {
  const parsed = sharePayloadSchema.parse(payload);
  return shareTokenSchema.parse(
    bytesToBase64Url(new TextEncoder().encode(JSON.stringify(parsed))),
  );
}

export function decodeSharePayload(token: string) {
  const parsedToken = shareTokenSchema.safeParse(token);

  if (!parsedToken.success) {
    return null;
  }

  try {
    const json = new TextDecoder().decode(base64UrlToBytes(parsedToken.data));
    const parsedPayload = sharePayloadSchema.safeParse(JSON.parse(json));

    return parsedPayload.success ? parsedPayload.data : null;
  } catch {
    return null;
  }
}

function bytesToBase64Url(bytes: Uint8Array) {
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(bytes).toString("base64")
      : btoa(String.fromCharCode(...bytes));

  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function sanitizeOptionalText(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function base64UrlToBytes(value: string) {
  const base64 = value
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64");
  }

  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}
