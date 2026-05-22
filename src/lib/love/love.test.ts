import { describe, expect, test } from "bun:test";
import { createSlides } from "@/lib/love/phrases";
import { creatorFieldsSchema, shareTokenSchema } from "@/lib/love/schema";
import {
  createSharePayload,
  decodeSharePayload,
  encodeSharePayload,
  presentationFromPayload,
  sanitizeImageUrls,
} from "@/lib/love/share";
import type { PresentationAsset } from "@/lib/love/types";

const assets: PresentationAsset[] = [
  {
    id: "asset_1",
    url: "https://example.com/demo.webp",
    width: 1000,
    height: 1200,
  },
];

describe("love presentation generation", () => {
  test("generates deterministic slides from the same seed", () => {
    const first = createSlides({
      senderName: "Joe",
      recipientName: "Ana",
      vibe: "chaos",
      seed: "fixed",
      assets,
    });
    const second = createSlides({
      senderName: "Joe",
      recipientName: "Ana",
      vibe: "chaos",
      seed: "fixed",
      assets,
    });

    expect(second).toEqual(first);
    expect(first.some((slide) => slide.imageAssetId === "asset_1")).toBe(true);
  });

  test("validates names without accepting markup characters", () => {
    expect(() =>
      creatorFieldsSchema.parse({
        senderName: "Joe",
        recipientName: "<script>",
        vibe: "boardroom",
        imageUrls: [],
      }),
    ).toThrow();
  });

  test("accepts only HTTPS image URLs", () => {
    expect(sanitizeImageUrls(["", " https://example.com/photo.jpg "])).toEqual([
      "https://example.com/photo.jpg",
    ]);
    expect(() => sanitizeImageUrls(["http://example.com/photo.jpg"])).toThrow();
    expect(() => sanitizeImageUrls(["data:image/svg+xml;base64,abc"])).toThrow();
  });

  test("round-trips self-contained share links", () => {
    const payload = createSharePayload({
      senderName: "Joe",
      recipientName: "Ana",
      vibe: "sincere",
      seed: "fixed-seed",
      createdAt: "2026-01-01T00:00:00.000Z",
      imageUrls: ["https://example.com/photo.jpg"],
    });
    const token = encodeSharePayload(payload);
    const decoded = decodeSharePayload(token);

    expect(shareTokenSchema.safeParse(token).success).toBe(true);
    expect(decoded).toEqual(payload);
    expect(presentationFromPayload(payload).assets[0]?.url).toBe(
      "https://example.com/photo.jpg",
    );
  });

  test("rejects malformed share tokens", () => {
    expect(decodeSharePayload("../bad")).toBeNull();
    expect(decodeSharePayload("not-json")).toBeNull();
  });
});
