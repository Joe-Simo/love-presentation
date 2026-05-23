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
    expect(first.length).toBeGreaterThanOrEqual(5);
    expect(first.length).toBeLessThanOrEqual(10);
    expect(first.some((slide) => slide.imageAssetId === "asset_1")).toBe(true);
  });

  test("builds configurable decks from a larger procedural slide pool", () => {
    const slides = createSlides({
      senderName: "Joe",
      recipientName: "Ana",
      vibe: "chaos",
      seed: "custom-seed",
      deckLength: "10",
      dramaLevel: "unwell",
      occasion: "anniversary",
      insideJoke: "the soup incident",
      assets: [],
    });
    const differentSeedSlides = createSlides({
      senderName: "Joe",
      recipientName: "Ana",
      vibe: "chaos",
      seed: "another-seed",
      deckLength: "10",
      dramaLevel: "unwell",
      occasion: "anniversary",
      insideJoke: "the soup incident",
      assets: [],
    });

    expect(slides).toHaveLength(10);
    expect(slides.some((slide) => slide.id === "inside-joke")).toBe(true);
    expect(slides.some((slide) => slide.id === "occasion-anniversary")).toBe(
      true,
    );
    expect(slides.some((slide) => slide.title.includes("emotionally unwell"))).toBe(
      true,
    );
    expect(differentSeedSlides).not.toEqual(slides);
  });

  test("creates broad variation across seeded decks without remote AI", () => {
    const titles = new Set<string>();
    const vibes = ["boardroom", "chaos", "sincere"] as const;
    const dramaLevels = ["modest", "dramatic", "unwell"] as const;
    const occasions = [
      "anniversary",
      "date-night",
      "birthday",
      "apology",
      "just-because",
    ] as const;

    for (let index = 0; index < 40; index += 1) {
      const slides = createSlides({
        senderName: "Joe",
        recipientName: "Ana",
        vibe: vibes[index % vibes.length],
        seed: `seed-${index}`,
        deckLength: "10",
        dramaLevel: dramaLevels[index % dramaLevels.length],
        occasion: occasions[index % occasions.length],
        insideJoke: index % 2 === 0 ? "the soup incident" : "",
        assets: [],
      });

      for (const slide of slides) {
        titles.add(slide.title);
      }
    }

    expect(titles.size).toBeGreaterThanOrEqual(50);
  });

  test("adds local compatibility scoring and same-name self-love copy", () => {
    const slides = createSlides({
      senderName: "Sam",
      recipientName: "sam",
      vibe: "boardroom",
      seed: "fixed",
      assets: [],
    });

    expect(slides[0]?.title).toBe("This appears to be self-love");
    expect(slides[1]?.title).toMatch(
      /^Compatibility is \d{2}\.\d% and refusing to be subtle$/,
    );
    expect(slides[1]?.verdict).toBe("Self-love status: valid.");
  });

  test("validates names without accepting markup characters", () => {
    expect(() =>
      creatorFieldsSchema.parse({
        senderName: "Joe",
        recipientName: "<script>",
        vibe: "boardroom",
        deckLength: "random",
        dramaLevel: "dramatic",
        occasion: "just-because",
        insideJoke: "",
        imageUrls: [],
      }),
    ).toThrow();
    expect(() =>
      creatorFieldsSchema.parse({
        senderName: "Joe",
        recipientName: "Ana",
        vibe: "boardroom",
        deckLength: "7",
        dramaLevel: "dramatic",
        occasion: "date-night",
        insideJoke: "<b>cute</b>",
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
      deckLength: "8",
      dramaLevel: "modest",
      occasion: "birthday",
      insideJoke: "the hat",
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
    expect(presentationFromPayload(payload).slides).toHaveLength(8);
  });

  test("rejects malformed share tokens", () => {
    expect(decodeSharePayload("../bad")).toBeNull();
    expect(decodeSharePayload("not-json")).toBeNull();
  });
});
