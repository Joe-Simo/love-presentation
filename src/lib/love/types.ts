export type PresentationVibe = "boardroom" | "chaos" | "sincere";
export type DeckLengthChoice =
  | "random"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10";
export type DramaLevel = "modest" | "dramatic" | "unwell";
export type LoveOccasion =
  | "just-because"
  | "anniversary"
  | "date-night"
  | "birthday"
  | "apology";

export type PresentationAsset = {
  id: string;
  url: string;
  width: number;
  height: number;
};

export type LoveSlide = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  verdict: string;
  imageAssetId?: string;
};

export type PublicPresentation = {
  id: string;
  senderName: string;
  recipientName: string;
  vibe: PresentationVibe;
  seed: string;
  createdAt: string;
  assets: PresentationAsset[];
  slides: LoveSlide[];
};

export type SharePayload = {
  v: 1;
  senderName: string;
  recipientName: string;
  vibe: PresentationVibe;
  seed: string;
  createdAt: string;
  deckLength?: DeckLengthChoice;
  dramaLevel?: DramaLevel;
  occasion?: LoveOccasion;
  insideJoke?: string;
  imageUrls: string[];
};
