import { z } from "zod";
import {
  MAX_INSIDE_JOKE_LENGTH,
  MAX_IMAGE_URL_LENGTH,
  MAX_IMAGE_URLS,
  MAX_NAME_LENGTH,
  MAX_SHARE_TOKEN_LENGTH,
} from "@/lib/love/config";

const cleanName = z
  .string()
  .trim()
  .min(1, "Names cannot be empty.")
  .max(MAX_NAME_LENGTH, `Names must be ${MAX_NAME_LENGTH} characters or fewer.`)
  .regex(/^[^<>{}[\]\\]+$/, "Names cannot contain markup or script characters.");

export const vibeSchema = z.enum(["boardroom", "chaos", "sincere"]);
export const compromiseLevelSchema = z.enum([
  "objective",
  "suspicious",
  "compromised",
  "unwell",
]);
export const deckLengthSchema = z.enum([
  "random",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
]);
export const dramaLevelSchema = z.enum(["modest", "dramatic", "unwell"]);
export const loveOccasionSchema = z.enum([
  "just-because",
  "anniversary",
  "date-night",
  "birthday",
  "apology",
]);

const cleanInsideJoke = z
  .string()
  .trim()
  .max(
    MAX_INSIDE_JOKE_LENGTH,
    `Inside jokes must be ${MAX_INSIDE_JOKE_LENGTH} characters or fewer.`,
  )
  .regex(/^[^<>{}[\]\\]*$/, "Inside jokes cannot contain markup characters.");

export const isoDateSchema = z.iso.datetime({ offset: true });

export const externalImageUrlSchema = z
  .string()
  .trim()
  .max(MAX_IMAGE_URL_LENGTH, "Image URLs are too long.")
  .url("Enter a valid image URL.")
  .refine((value) => new URL(value).protocol === "https:", {
    message: "Image URLs must use HTTPS.",
  });

export const imageUrlsSchema = z
  .array(externalImageUrlSchema)
  .max(MAX_IMAGE_URLS, `Use no more than ${MAX_IMAGE_URLS} image URLs.`);

export const shareTokenSchema = z
  .string()
  .min(1)
  .max(MAX_SHARE_TOKEN_LENGTH)
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid share link.");

export const sharePayloadSchema = z.object({
  v: z.literal(1),
  senderName: cleanName,
  recipientName: cleanName,
  vibe: vibeSchema,
  seed: z.string().min(1).max(128),
  createdAt: isoDateSchema,
  deckLength: deckLengthSchema.optional(),
  dramaLevel: dramaLevelSchema.optional(),
  compromiseLevel: compromiseLevelSchema.optional(),
  occasion: loveOccasionSchema.optional(),
  insideJoke: cleanInsideJoke.optional(),
  imageUrls: imageUrlsSchema,
});

export const creatorFieldsSchema = sharePayloadSchema.pick({
  senderName: true,
  recipientName: true,
  vibe: true,
  deckLength: true,
  dramaLevel: true,
  compromiseLevel: true,
  occasion: true,
  insideJoke: true,
  imageUrls: true,
});
