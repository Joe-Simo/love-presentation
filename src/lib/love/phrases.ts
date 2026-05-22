import type {
  LoveSlide,
  PresentationAsset,
  PresentationVibe,
} from "@/lib/love/types";

export const VIBE_OPTIONS: Array<{
  value: PresentationVibe;
  label: string;
  description: string;
}> = [
  {
    value: "boardroom",
    label: "Boardroom",
    description: "Very official. Deeply unserious.",
  },
  {
    value: "chaos",
    label: "Chaotic",
    description: "Fast, dramatic, slightly unhinged.",
  },
  {
    value: "sincere",
    label: "Soft roast",
    description: "Sweet first, goofy immediately after.",
  },
];

type SlideInput = {
  senderName: string;
  recipientName: string;
  vibe: PresentationVibe;
  seed: string;
  assets: PresentationAsset[];
};

const phrasePacks: Record<
  PresentationVibe,
  {
    opener: string[];
    claims: string[];
    captions: string[];
    verdicts: string[];
  }
> = {
  boardroom: {
    opener: [
      "A legally questionable presentation about obvious compatibility.",
      "Prepared by an internal committee of one very biased person.",
      "The numbers were reviewed and the flirting forecast is aggressive.",
    ],
    claims: [
      "Current projections show a dangerous amount of smiling near each other.",
      "Independent auditors found the vibe to be statistically loud.",
      "The agenda says casual, but the evidence says please stop being adorable.",
    ],
    captions: [
      "Exhibit A: suspiciously good lighting and emotional damages.",
      "This photo has been entered into the official cute record.",
      "The committee refuses to explain why this works. It simply does.",
    ],
    verdicts: [
      "Recommendation: approve immediately, with snacks.",
      "Risk level: cute enough to concern finance.",
      "Final note: the spreadsheet blushed.",
    ],
  },
  chaos: {
    opener: [
      "This presentation has no legal basis, only vibes and evidence.",
      "Warning: the following slides may cause giggling and poor decision-making.",
      "A chaotic investigation into why this is obviously a good idea.",
    ],
    claims: [
      "The chemistry department called. They said, respectfully, calm down.",
      "Multiple witnesses reported excessive main-character behavior.",
      "The universe left a sticky note that said, 'yeah, this tracks.'",
    ],
    captions: [
      "This image is doing too much, and frankly we support it.",
      "Forensic analysis confirms: dangerously charming.",
      "A rare documented case of two people making sense by accident.",
    ],
    verdicts: [
      "Conclusion: suspicious, compelling, probably adorable.",
      "Case status: open, but only because the drama is entertaining.",
      "Final ruling: extremely guilty of being cute.",
    ],
  },
  sincere: {
    opener: [
      "A small presentation about a big little feeling.",
      "This is mostly sweet, but a few jokes escaped supervision.",
      "A tender case for two people being very good trouble together.",
    ],
    claims: [
      "The best evidence is how easy it is to imagine more ordinary days together.",
      "There is a calm little logic here, even when the jokes are doing cartwheels.",
      "Some people feel like a favorite song you forgot you knew.",
    ],
    captions: [
      "Soft evidence, respectfully submitted.",
      "A tiny reminder that someone is very easy to root for.",
      "This photo has excellent 'keep this person around' energy.",
    ],
    verdicts: [
      "Final answer: worth the butterflies.",
      "Recommendation: more time, more laughing, better snacks.",
      "Conclusion: the heart committee approves.",
    ],
  },
};

export function createSlides(input: SlideInput): LoveSlide[] {
  const random = createDeterministicRandom(
    `${input.seed}:${input.senderName}:${input.recipientName}:${input.vibe}`,
  );
  const pack = phrasePacks[input.vibe];
  const pick = (values: string[]) => values[Math.floor(random() * values.length)];
  const couple = `${input.senderName} + ${input.recipientName}`;
  const sameName =
    input.senderName.trim().toLowerCase() ===
    input.recipientName.trim().toLowerCase();
  const compatibility = getCompatibilityScore(
    input.senderName,
    input.recipientName,
  );
  const imageSlides = input.assets.slice(0, 5).map((asset, index) => ({
    id: `photo-${asset.id}`,
    kicker: `Exhibit ${String.fromCharCode(65 + index)}`,
    title: pick(pack.captions),
    body: `${input.recipientName}, please observe the attached evidence and try to act normal.`,
    verdict: pick(pack.verdicts),
    imageAssetId: asset.id,
  }));

  return [
    {
      id: "cover",
      kicker: "Love Presentation",
      title: sameName
        ? "This appears to be self-love"
        : `Why ${couple} is suspiciously perfect`,
      body: sameName
        ? "Valid. The committee respects the confidence."
        : pick(pack.opener),
      verdict: sameName
        ? "Finding: self-love is approved without further review."
        : "Prepared with confidence, zero chill, and tasteful typography.",
    },
    {
      id: "compatibility",
      kicker: "Compatibility Forecast",
      title: `Compatibility is ${compatibility}% and refusing to be subtle`,
      body: `${pick(pack.claims)} Bias warning: generated by someone clearly involved.`,
      verdict: sameName ? "Self-love status: valid." : pick(pack.verdicts),
    },
    ...imageSlides,
    {
      id: "closing",
      kicker: "Final Slide",
      title: `${input.senderName} formally requests more ${input.recipientName} time`,
      body: "No pressure. Except from the deck, which is being very persuasive.",
      verdict: pick(pack.verdicts),
    },
  ];
}

function createDeterministicRandom(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return () => {
    hash += 0x6d2b79f5;
    let value = hash;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function getCompatibilityScore(senderName: string, recipientName: string) {
  const input = `${senderName.trim().toLowerCase()}:${recipientName
    .trim()
    .toLowerCase()}`;
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (88 + (Math.abs(hash) % 117) / 10).toFixed(1);
}
