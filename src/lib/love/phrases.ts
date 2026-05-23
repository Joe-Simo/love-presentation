import type {
  CompromiseLevel,
  DeckLengthChoice,
  DramaLevel,
  LoveOccasion,
  LoveSlide,
  PresentationAsset,
  PresentationVibe,
} from "@/lib/love/types";
import { createLoveMetrics } from "@/lib/love/metrics";

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
  deckLength?: DeckLengthChoice;
  dramaLevel?: DramaLevel;
  compromiseLevel?: CompromiseLevel;
  occasion?: LoveOccasion;
  insideJoke?: string;
  assets: PresentationAsset[];
};

type PhrasePack = {
  opener: string[];
  claims: string[];
  captions: string[];
  verdicts: string[];
  compliments: string[];
  risks: string[];
  logistics: string[];
  closings: string[];
};

type SlideContext = {
  senderName: string;
  recipientName: string;
  couple: string;
  compatibility: string;
  dramaLevel: DramaLevel;
  occasion: LoveOccasion;
  pack: PhrasePack;
  pick: <Value>(values: Value[]) => Value;
};

const phrasePacks: Record<PresentationVibe, PhrasePack> = {
  boardroom: {
    opener: [
      "A legally questionable presentation about obvious compatibility.",
      "Prepared by an internal committee of one very biased person.",
      "The numbers were reviewed and the flirting forecast is aggressive.",
      "A formal memo concerning an informal amount of staring.",
    ],
    claims: [
      "Current projections show a dangerous amount of smiling near each other.",
      "Independent auditors found the vibe to be statistically loud.",
      "The agenda says casual, but the evidence says please stop being adorable.",
      "Relationship KPI: laughing at bad jokes is trending upward.",
      "The spreadsheet requested privacy after seeing the chemistry column.",
    ],
    captions: [
      "Exhibit A: suspiciously good lighting and emotional damages.",
      "This photo has been entered into the official cute record.",
      "The committee refuses to explain why this works. It simply does.",
      "Visual evidence has been reviewed and everyone is acting normal poorly.",
    ],
    verdicts: [
      "Recommendation: approve immediately, with snacks.",
      "Risk level: cute enough to concern finance.",
      "Final note: the spreadsheet blushed.",
      "Status: approved by a suspiciously invested committee.",
      "Action item: more time together, fewer fake excuses.",
    ],
    compliments: [
      "This pairing has excellent 'we have a bit' energy.",
      "The eye contact forecast is severe but manageable.",
      "The room agrees this is not subtle, but it is effective.",
      "The evidence suggests a rare case of mutual nonsense tolerance.",
    ],
    risks: [
      "Known vulnerability: one cute text can disrupt a full afternoon.",
      "Primary risk: becoming the couple everyone quietly roots for.",
      "Operational concern: goodbye may now require three additional minutes.",
      "Exposure level: dangerously close to making plans two weekends out.",
    ],
    logistics: [
      "Procurement note: snacks must be shared, but fries remain negotiable.",
      "Calendar note: 'soon' is not a measurable unit, but the court accepts it.",
      "Budget impact: more coffee, more gas, more 'one more episode.'",
      "Meeting minutes: they looked at each other and everyone became annoying.",
    ],
    closings: [
      "No pressure. Except from the deck, which is being very persuasive.",
      "The presentation rests its case and requests a follow-up date.",
      "Please direct all objections to the heart, which is unavailable.",
      "This concludes the formal portion. The flirting may continue.",
    ],
  },
  chaos: {
    opener: [
      "This presentation has no legal basis, only vibes and evidence.",
      "Warning: the following slides may cause giggling and poor decision-making.",
      "A chaotic investigation into why this is obviously a good idea.",
      "The deck tried to stay calm. It failed immediately.",
    ],
    claims: [
      "The chemistry department called. They said, respectfully, calm down.",
      "Multiple witnesses reported excessive main-character behavior.",
      "The universe left a sticky note that said, 'yeah, this tracks.'",
      "Emergency alert: two people have been caught being cute again.",
      "The group chat has reviewed the matter and is not neutral.",
    ],
    captions: [
      "This image is doing too much, and frankly we support it.",
      "Forensic analysis confirms: dangerously charming.",
      "A rare documented case of two people making sense by accident.",
      "The pixels are biased. The prosecution has no further questions.",
    ],
    verdicts: [
      "Conclusion: suspicious, compelling, probably adorable.",
      "Case status: open, but only because the drama is entertaining.",
      "Final ruling: extremely guilty of being cute.",
      "Verdict: emotionally loud, visually admissible.",
      "Recommendation: proceed, but hydrate.",
    ],
    compliments: [
      "This is the kind of chemistry that makes a calendar nervous.",
      "Every casual interaction has the energy of a season finale.",
      "The vibes are sprinting. No one approved this pace.",
      "The evidence is cute in a way that feels almost illegal.",
    ],
    risks: [
      "Known issue: one compliment may cause a system-wide smile outage.",
      "Drama level: high, but somehow still tasteful.",
      "Risk assessment: leaving is not recommended by anyone fun.",
      "The timeline is unstable and full of suspicious little moments.",
    ],
    logistics: [
      "Breaking news: dinner plans have become personality development.",
      "Inventory check: two people, one bit, unlimited side quests.",
      "Protocol update: if they say 'be normal,' nobody believes them.",
      "Scheduling note: five minutes may become three hours without warning.",
    ],
    closings: [
      "The deck has made its case. Everyone can stop pretending.",
      "Please collect your dramatic evidence and your emotional damages.",
      "The final slide would like to apologize for nothing.",
      "Further cuteness will be handled in a separate incident report.",
    ],
  },
  sincere: {
    opener: [
      "A small presentation about a big little feeling.",
      "This is mostly sweet, but a few jokes escaped supervision.",
      "A tender case for two people being very good trouble together.",
      "A soft memo about someone being extremely easy to adore.",
    ],
    claims: [
      "The best evidence is how easy it is to imagine more ordinary days together.",
      "There is a calm little logic here, even when the jokes are doing cartwheels.",
      "Some people feel like a favorite song you forgot you knew.",
      "The strongest data point is how safe the silence feels.",
      "A tiny future keeps appearing in the margins.",
    ],
    captions: [
      "Soft evidence, respectfully submitted.",
      "A tiny reminder that someone is very easy to root for.",
      "This photo has excellent 'keep this person around' energy.",
      "A quiet little exhibit with suspicious emotional weight.",
    ],
    verdicts: [
      "Final answer: worth the butterflies.",
      "Recommendation: more time, more laughing, better snacks.",
      "Conclusion: the heart committee approves.",
      "Status: sweet, with a small roast attached.",
      "Finding: this person is a good kind of trouble.",
    ],
    compliments: [
      "The evidence suggests comfort, chemistry, and extremely specific jokes.",
      "There is a gentle kind of gravity here.",
      "This feels like someone becoming a favorite place.",
      "The little things are doing most of the convincing.",
    ],
    risks: [
      "Known vulnerability: remembering tiny details and acting casual about it.",
      "Risk level: soft smile in public, immediate loss of credibility.",
      "Primary concern: missing them after approximately four seconds.",
      "Exposure level: saying 'no big deal' while it is clearly a big deal.",
    ],
    logistics: [
      "Care note: bring snacks, patience, and one very specific inside joke.",
      "Calendar note: ordinary days are expected to perform unusually well.",
      "Budget impact: small surprises and unnecessary coffee runs.",
      "Meeting minutes: everyone pretended not to notice the smile.",
    ],
    closings: [
      "No pressure. Just a very calm recommendation to keep choosing this.",
      "The presentation rests its case softly and with snacks.",
      "Please direct all objections to the butterflies.",
      "This concludes the slide deck. The feeling may continue.",
    ],
  },
};

const proceduralKickers = [
  "Exhibit",
  "Internal Memo",
  "Relationship Audit",
  "Emergency Finding",
  "Tiny Evidence",
  "Compliance Review",
  "Soft Launch",
  "Witness Statement",
  "Risk Note",
  "Quarterly Feeling",
  "Discovery",
  "Appendix",
];

const subjects = [
  "the chemistry",
  "the eye contact",
  "the shared jokes",
  "the goodbye ritual",
  "the group chat evidence",
  "the tiny details",
  "the snack alignment",
  "the playlist overlap",
  "the calendar behavior",
  "the smile frequency",
  "the voice note energy",
  "the casual touching of arms",
  "the dinner math",
  "the inside joke economy",
  "the screenshot risk",
];

const suspiciousActions = [
  "requires formal review",
  "has exceeded normal thresholds",
  "is louder than expected",
  "keeps appearing in the data",
  "has become difficult to ignore",
  "is behaving like a plot point",
  "refuses to look casual",
  "is trending in a concerning direction",
  "has left the committee giggling",
  "is giving main exhibit energy",
  "cannot be explained by weather",
  "has made neutrality impossible",
];

const evidenceLines = [
  "A neutral observer would have questions. Fortunately, none were invited.",
  "The record shows repeated incidents of smiling with very little provocation.",
  "This was filed under coincidence until the coincidences started flirting.",
  "Attempts to downplay the situation were reviewed and rejected.",
  "The numbers are fake, but the conclusion is emotionally accurate.",
  "Several moments were marked casual despite behaving like evidence.",
  "The committee tried to be normal and immediately lost funding.",
  "This has the suspicious texture of a very specific favorite person.",
  "One could call this friendship, but the deck has follow-up questions.",
  "There is no need to panic. There is only a need to admit the obvious.",
  "The room noted a vibe shift and quietly updated the minutes.",
  "No one asked for this level of charm, yet here it is.",
];

const tinyJokes = [
  "someone is pretending not to care and doing a bad job",
  "the butterflies have requested better management",
  "the heart is acting like it has tenure",
  "the calendar has started making assumptions",
  "the committee is two compliments away from collapse",
  "the flirting forecast includes scattered nonsense",
  "the evidence is wearing a tiny suit and lying poorly",
  "the vibe has entered the building with paperwork",
  "the snack budget is no longer optional",
  "the plot has become suspiciously wholesome",
  "the room is trying to be professional and failing",
  "the deck has developed opinions",
];

const titleOpeners = [
  "A formal concern:",
  "Breaking finding:",
  "Important update:",
  "For the record:",
  "The committee notes:",
  "An issue has emerged:",
  "Please observe:",
  "Filed quietly:",
  "Statistically speaking:",
  "With respect:",
];

const verdictPrefixes = [
  "Finding",
  "Verdict",
  "Recommendation",
  "Status",
  "Committee note",
  "Risk level",
  "Final answer",
  "Action item",
];

const verdictBodies = [
  "approved with snacks",
  "emotionally admissible",
  "cute enough to escalate",
  "deeply suspicious, unfortunately",
  "worth additional meetings",
  "not normal, but excellent",
  "requires more time together",
  "too charming to dismiss",
  "biased but compelling",
  "romantically inconvenient",
  "softly devastating",
  "approved by zero neutral parties",
];

const metricNames = [
  "laugh retention",
  "smile frequency",
  "text anticipation",
  "goodbye delay",
  "inside joke velocity",
  "snack compatibility",
  "comfort index",
  "cute incident rate",
  "eye contact variance",
  "mutual nonsense tolerance",
];

const metricOutcomes = [
  "up and to the right",
  "above forecast",
  "statistically annoying",
  "quietly impressive",
  "too high for casual language",
  "pending emotional review",
  "dangerously adorable",
  "operating outside normal limits",
  "showing suspicious momentum",
  "approved, then approved again",
];

const occasionSlides: Record<LoveOccasion, Omit<LoveSlide, "id">[]> = {
  "just-because": [
    {
      kicker: "Unrequested Memo",
      title: "Just because is enough.",
      body: "No birthday. No holiday. No board approval. Just a person being very easy to like.",
      verdict: "Occasion approved retroactively.",
    },
    {
      kicker: "Small Filing",
      title: "The reason is obvious.",
      body: "Sometimes the whole agenda is: look at this person. Ridiculous. Excellent.",
      verdict: "No further justification needed.",
    },
  ],
  anniversary: [
    {
      kicker: "Annual Review",
      title: "Another year of this nonsense.",
      body: "The committee reviewed the year and found excessive laughing, suspicious loyalty, and several excellent memories.",
      verdict: "Renewal strongly recommended.",
    },
    {
      kicker: "Milestone Report",
      title: "Still somehow not tired of each other.",
      body: "This is statistically impressive and emotionally inconvenient for everyone who enjoys being cynical.",
      verdict: "Anniversary status: very approved.",
    },
  ],
  "date-night": [
    {
      kicker: "Tonight's Agenda",
      title: "Date night requires evidence.",
      body: "Dinner is optional. Eye contact is likely. Pretending to be casual will not survive discovery.",
      verdict: "Schedule the follow-up.",
    },
    {
      kicker: "Evening Brief",
      title: "Romance has entered the calendar.",
      body: "The plan includes food, laughing, and one person saying they are not dressed up when they absolutely are.",
      verdict: "Proceed with unreasonable charm.",
    },
  ],
  birthday: [
    {
      kicker: "Birthday Filing",
      title: "A person worth celebrating.",
      body: "The evidence includes being cute, being difficult to replace, and somehow improving the room.",
      verdict: "Cake is legally required.",
    },
    {
      kicker: "Celebration Memo",
      title: "Another year of being a problem.",
      body: "A beautiful problem. A funny problem. A problem this deck formally recommends keeping.",
      verdict: "Birthday committee approves.",
    },
  ],
  apology: [
    {
      kicker: "Peace Offering",
      title: "This deck comes in peace.",
      body: "The presenter requests reduced charges, increased forgiveness, and possibly snacks.",
      verdict: "Apology submitted with flair.",
    },
    {
      kicker: "Damage Control",
      title: "Regret has entered the chat.",
      body: "The committee admits mistakes were made, mostly by the committee, who is also very fond of you.",
      verdict: "Mercy is encouraged.",
    },
  ],
};

const dramaCopy: Record<
  DramaLevel,
  {
    title: string;
    body: string;
    verdict: string;
  }
> = {
  modest: {
    title: "A small amount of drama.",
    body: "The feelings are present, properly seated, and using indoor voices.",
    verdict: "Drama setting: tasteful.",
  },
  dramatic: {
    title: "The drama is proportional.",
    body: "By proportional, the presenter means slightly theatrical and legally defensible.",
    verdict: "Drama setting: approved.",
  },
  unwell: {
    title: "The room is emotionally unwell.",
    body: "The committee has reviewed the evidence and will need a minute, possibly a chair, definitely a snack.",
    verdict: "Drama setting: maximum.",
  },
};

export function createSlides(input: SlideInput): LoveSlide[] {
  if (input.compromiseLevel) {
    return createCompromiseArc(input);
  }

  const random = createDeterministicRandom(
    `${input.seed}:${input.senderName}:${input.recipientName}:${input.vibe}`,
  );
  const pack = phrasePacks[input.vibe];
  const pick = <Value>(values: Value[]) =>
    values[Math.floor(random() * values.length)] as Value;
  const senderName = input.senderName.trim();
  const recipientName = input.recipientName.trim();
  const couple = `${senderName} + ${recipientName}`;
  const sameName =
    senderName.toLowerCase() === recipientName.toLowerCase();
  const compatibility = getCompatibilityScore(senderName, recipientName);
  const deckLength = input.deckLength ?? "random";
  const dramaLevel = input.dramaLevel ?? "dramatic";
  const occasion = input.occasion ?? "just-because";
  const insideJoke = input.insideJoke?.trim();
  const targetCount = resolveDeckLength(deckLength, random);
  const middleSlots = Math.max(targetCount - 3, 0);
  const context: SlideContext = {
    senderName,
    recipientName,
    couple,
    compatibility,
    dramaLevel,
    occasion,
    pack,
    pick,
  };

  const requiredMiddle: LoveSlide[] = [];
  if (insideJoke) {
    requiredMiddle.push({
      id: "inside-joke",
      kicker: "Inside Joke",
      title: `"${insideJoke}" has been entered into evidence.`,
      body: "No one else needs to understand it. That is how the committee knows it is working.",
      verdict: "Private bit: accepted.",
    });
  }

  const imageSlides = input.assets.slice(0, 5).map((asset, index) => ({
    id: `photo-${asset.id}`,
    kicker: `Exhibit ${String.fromCharCode(65 + index)}`,
    title: pick(pack.captions),
    body: `${recipientName}, please observe the attached evidence and try to act normal.`,
    verdict: pick(pack.verdicts),
    imageAssetId: asset.id,
  }));

  if (imageSlides[0]) {
    requiredMiddle.push(imageSlides[0]);
  }

  if (occasion !== "just-because" || requiredMiddle.length < middleSlots) {
    const occasionSlide = pick(occasionSlides[occasion]);
    requiredMiddle.push({
      id: `occasion-${occasion}`,
      ...occasionSlide,
    });
  }

  if (requiredMiddle.length < middleSlots) {
    requiredMiddle.push({
      id: "drama",
      kicker: "Drama Dial",
      title: dramaCopy[dramaLevel].title,
      body: dramaCopy[dramaLevel].body,
      verdict: dramaCopy[dramaLevel].verdict,
    });
  }

  const candidates: LoveSlide[] = [
    ...imageSlides,
    ...buildProceduralSlides(context, 42),
    {
      id: "chemistry",
      kicker: "Exhibit A",
      title: "Suspicious chemistry.",
      body: pick(pack.claims),
      verdict: pick(pack.verdicts),
    },
    {
      id: "risk",
      kicker: "Risk Assessment",
      title: "Leaving is not recommended.",
      body: pick(pack.risks),
      verdict: pick(pack.verdicts),
    },
    {
      id: "compliment",
      kicker: "Character Witness",
      title: `${recipientName} is not helping the case.`,
      body: pick(pack.compliments),
      verdict: "Witness credibility: emotionally compromised.",
    },
    {
      id: "logistics",
      kicker: "Operational Notes",
      title: "The little things are suspicious.",
      body: pick(pack.logistics),
      verdict: "Tiny details: admissible.",
    },
    {
      id: "drama",
      kicker: "Drama Dial",
      title: dramaCopy[dramaLevel].title,
      body: dramaCopy[dramaLevel].body,
      verdict: dramaCopy[dramaLevel].verdict,
    },
    {
      id: "forecast",
      kicker: "Forecast",
      title: "Feelings trend upward.",
      body: `${pick(pack.claims)} Trend line refuses to calm down.`,
      verdict: "Outlook: emotionally expensive.",
    },
    {
      id: "flaw",
      kicker: "Minor Concern",
      title: `${senderName} may be biased.`,
      body: "The presenter denies this allegation while building an entire slideshow about it.",
      verdict: "Bias level: charmingly severe.",
    },
    {
      id: "committee",
      kicker: "Committee Finding",
      title: "The objections are weak.",
      body: "Most counterarguments were just nervous laughter wearing a little tie.",
      verdict: "Motion to be adorable: carried.",
    },
    {
      id: "future",
      kicker: "Forward Statement",
      title: "More chapters seem likely.",
      body: "No one is saying forever on slide seven. The deck is simply looking at the data and smiling.",
      verdict: "Future risk: promising.",
    },
  ];

  const middleSlides = collectUniqueSlides([
    ...requiredMiddle,
    ...shuffle(candidates, random),
  ]).slice(0, middleSlots);

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
    ...middleSlides,
    {
      id: "closing",
      kicker: "Final Slide",
      title: `${senderName} formally requests more ${recipientName} time`,
      body: pick(pack.closings),
      verdict: sameName ? "Final answer: self-love wins." : pick(pack.verdicts),
    },
  ];
}

function createCompromiseArc(input: SlideInput): LoveSlide[] {
  const random = createDeterministicRandom(
    `${input.seed}:${input.senderName}:${input.recipientName}:${input.vibe}:${input.compromiseLevel}`,
  );
  const pack = phrasePacks[input.vibe];
  const pick = <Value>(values: Value[]) =>
    values[Math.floor(random() * values.length)] as Value;
  const senderName = input.senderName.trim();
  const recipientName = input.recipientName.trim();
  const sameName =
    senderName.toLowerCase() === recipientName.toLowerCase();
  const metrics = createLoveMetrics(senderName, recipientName);
  const deckLength = input.deckLength ?? "7";
  const targetCount = resolveDeckLength(deckLength, random);
  const dramaLevel = input.dramaLevel ?? "dramatic";
  const occasion = input.occasion ?? "just-because";
  const insideJoke = input.insideJoke?.trim();
  const compromiseLevel = input.compromiseLevel ?? "suspicious";
  const compromise = compromiseArcCopy[compromiseLevel];
  const firstAsset = input.assets[0];

  const baseSlides: LoveSlide[] = [
    {
      id: "cover",
      kicker: "Opening Statement",
      title: sameName
        ? "This appears to be self-love"
        : "This is a normal presentation.",
      body: sameName
        ? "Valid. The committee respects the confidence."
        : `At least, that was the original plan. ${senderName} has prepared a very neutral review for ${recipientName}.`,
      verdict: sameName
        ? "Finding: self-love is approved without further review."
        : "Neutrality status: pending.",
    },
    {
      id: "compromised-presenter",
      kicker: "Disclosure",
      title: "The presenter is compromised.",
      body: compromise.presenter,
      verdict:
        compromiseLevel === "objective"
          ? "Bias warning: low, for now."
          : "Bias warning: severe.",
    },
    {
      id: "chemistry",
      kicker: "Exhibit A",
      title: "Suspicious chemistry.",
      body: compromise.chemistry,
      verdict: "Highly suspicious.",
    },
    {
      id: "relationship-kpi",
      kicker: "Relationship KPI",
      title: "The numbers are not helping.",
      body: [
        `Compatibility Index: ${metrics.compatibility}%`,
        `Bad joke tolerance: ${metrics.badJokeTolerance}%`,
        `Snack compatibility: ${metrics.snackAlignment}%`,
        `Cuteness Risk: ${metrics.cuteRisk}`,
        `Leaving Recommendation: ${metrics.leavingRecommendation}`,
      ].join("\n"),
      verdict: `Bias Warning: ${metrics.biasWarning}.`,
    },
    {
      id: "witness-statement",
      kicker: "Witness Statement",
      title: "Several witnesses confirm the problem.",
      body: insideJoke
        ? `Several witnesses confirm they are annoying in the best way. The phrase "${insideJoke}" has also been entered into evidence.`
        : "Several witnesses confirm they are annoying in the best way. Nobody is neutral enough to object.",
      verdict: "Witness credibility: emotionally compromised.",
      imageAssetId: firstAsset?.id,
    },
    {
      id: "risk-assessment",
      kicker: "Risk Assessment",
      title: "Separation is not recommended.",
      body: compromise.risk,
      verdict: "Risk level: adorable and inconvenient.",
    },
    {
      id: "final-ruling",
      kicker: "Final Ruling",
      title: "Guilty of being suspiciously adorable.",
      body: sameName
        ? "The court finds this relationship with yourself valid, dramatic, and properly documented."
        : `The court finds ${senderName} and ${recipientName} guilty of being suspiciously adorable.`,
      verdict: "Accept ruling. Appeal with snacks.",
    },
  ];

  if (targetCount <= baseSlides.length) {
    return [
      ...baseSlides.slice(0, Math.max(targetCount - 1, 1)),
      baseSlides[baseSlides.length - 1] as LoveSlide,
    ];
  }

  const context: SlideContext = {
    senderName,
    recipientName,
    couple: `${senderName} + ${recipientName}`,
    compatibility: metrics.compatibility,
    dramaLevel,
    occasion,
    pack,
    pick,
  };
  const imageSlides = input.assets.slice(1, 5).map((asset, index) => ({
    id: `photo-${asset.id}`,
    kicker: `Exhibit ${String.fromCharCode(66 + index)}`,
    title: pick(pack.captions),
    body: `${recipientName}, please observe the attached evidence and try to act normal.`,
    verdict: pick(pack.verdicts),
    imageAssetId: asset.id,
  }));
  const extraCandidates = collectUniqueSlides([
    ...(insideJoke
      ? [
          {
            id: "inside-joke",
            kicker: "Inside Joke",
            title: `"${insideJoke}" has been entered into evidence.`,
            body: "No one else needs to understand it. That is how the committee knows it is working.",
            verdict: "Private bit: accepted.",
          },
        ]
      : []),
    {
      id: `occasion-${occasion}`,
      ...pick(occasionSlides[occasion]),
    },
    {
      id: "drama",
      kicker: "Drama Dial",
      title: dramaCopy[dramaLevel].title,
      body: dramaCopy[dramaLevel].body,
      verdict: dramaCopy[dramaLevel].verdict,
    },
    ...imageSlides,
    ...shuffle(buildProceduralSlides(context, 12), random),
  ]);

  return [
    ...baseSlides.slice(0, -1),
    ...extraCandidates.slice(0, targetCount - baseSlides.length),
    baseSlides[baseSlides.length - 1] as LoveSlide,
  ];
}

const compromiseArcCopy: Record<
  CompromiseLevel,
  {
    presenter: string;
    chemistry: string;
    risk: string;
  }
> = {
  objective: {
    presenter:
      "The presenter remains calm, organized, and suspiciously proud of this deck.",
    chemistry:
      "These two people appear compatible. Further review is recommended before anyone starts smiling too much.",
    risk: "If separated, both parties will probably be fine, though the room may become noticeably less charming.",
  },
  suspicious: {
    presenter:
      "Objectivity left shortly after the first smile. Further analysis may contain affectionate language.",
    chemistry:
      "They laugh at the same dumb stuff.\nThey finish each other's sentences.\nThe science is not explaining this one.",
    risk: "If separated, both parties may become dramatically less fun. The committee considers this avoidable.",
  },
  compromised: {
    presenter:
      "The presenter can no longer be trusted to remain neutral. The committee has developed feelings.",
    chemistry:
      "The chemistry has become statistically inconvenient.\nBad joke tolerance is trending upward.\nNeutral observers were not invited.",
    risk: "If separated, the forecast includes unnecessary longing, lower snack morale, and worse anecdotes.",
  },
  unwell: {
    presenter:
      "Quarterly feelings review has gone off the rails. Legal has asked everyone to stop using the word destiny.",
    chemistry:
      "They laugh at the same dumb stuff.\nThey finish each other's sentences.\nThe science is not explaining this one.",
    risk: "Leaving is denied. The committee is crying, the graph is biased, and the snacks have chosen a side.",
  },
};

function buildProceduralSlides(context: SlideContext, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const mode = index % 7;

    if (mode === 0) {
      return {
        id: `generated-audit-${index}`,
        kicker: `${context.pick(proceduralKickers)} ${index + 1}`,
        title: `${context.pick(titleOpeners)} ${context.pick(subjects)} ${context.pick(
          suspiciousActions,
        )}.`,
        body: context.pick(evidenceLines),
        verdict: `${context.pick(verdictPrefixes)}: ${context.pick(
          verdictBodies,
        )}.`,
      };
    }

    if (mode === 1) {
      const metric = context.pick(metricNames);
      return {
        id: `generated-kpi-${index}`,
        kicker: "Relationship KPI",
        title: `${metric} is ${context.pick(metricOutcomes)}.`,
        body: `${context.senderName} and ${context.recipientName} have created a data problem the deck is choosing to call romance.`,
        verdict: `${context.pick(verdictPrefixes)}: ${context.pick(
          verdictBodies,
        )}.`,
      };
    }

    if (mode === 2) {
      return {
        id: `generated-warning-${index}`,
        kicker: "Warning Label",
        title: `Side effect may include ${context.pick(tinyJokes)}.`,
        body: `${context.pick(context.pack.risks)} This is not medical advice, but it is very nosy.`,
        verdict: `${context.pick(verdictPrefixes)}: proceed with charm.`,
      };
    }

    if (mode === 3) {
      return {
        id: `generated-witness-${index}`,
        kicker: "Witness Statement",
        title: `${context.recipientName} has been described as a problem.`,
        body: `To clarify, the problem is being too easy for ${context.senderName} to adore. The witness stands by this wording.`,
        verdict: `${context.pick(verdictPrefixes)}: ${context.pick(
          verdictBodies,
        )}.`,
      };
    }

    if (mode === 4) {
      return {
        id: `generated-memo-${index}`,
        kicker: "Internal Memo",
        title: `${context.couple} requires a follow-up meeting.`,
        body: `${context.pick(context.pack.logistics)} Attendance is mandatory unless someone gets nervous, which also counts.`,
        verdict: `${context.pick(verdictPrefixes)}: calendar suspicious.`,
      };
    }

    if (mode === 5) {
      return {
        id: `generated-score-${index}`,
        kicker: "Fake Science",
        title: `${context.compatibility}% compatibility, with a margin of flirty error.`,
        body: `The lab used names, vibes, ${context.pick(subjects)}, and one deeply unserious formula.`,
        verdict: `${context.pick(verdictPrefixes)}: fake number, real point.`,
      };
    }

    return {
      id: `generated-roast-${index}`,
      kicker: "Soft Roast",
      title: `${context.senderName} is trying to be normal.`,
      body: `Unfortunately, ${context.pick(tinyJokes)}. The deck recommends honesty and maybe better posture.`,
      verdict: `${context.pick(verdictPrefixes)}: normal attempt denied.`,
    };
  });
}

function collectUniqueSlides(slides: LoveSlide[]) {
  const seen = new Set<string>();
  const uniqueSlides: LoveSlide[] = [];

  for (const slide of slides) {
    if (seen.has(slide.id)) continue;

    seen.add(slide.id);
    uniqueSlides.push(slide);
  }

  return uniqueSlides;
}

function resolveDeckLength(
  deckLength: DeckLengthChoice,
  random: () => number,
) {
  if (deckLength !== "random") {
    return Number(deckLength);
  }

  return 5 + Math.floor(random() * 6);
}

function shuffle<Value>(values: Value[], random: () => number) {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex] as Value, next[index] as Value];
  }

  return next;
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
