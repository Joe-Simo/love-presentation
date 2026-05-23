"use client";

import { gsap } from "gsap";
import {
  ArrowRightIcon,
  Building2Icon,
  CopyIcon,
  HeartIcon,
  ImageIcon,
  Link2Icon,
  LockKeyholeIcon,
  SendIcon,
  SparklesIcon,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createSharePayload,
  encodeSharePayload,
} from "@/lib/love/share";
import type {
  CompromiseLevel,
  DeckLengthChoice,
  DramaLevel,
  LoveOccasion,
  PresentationVibe,
} from "@/lib/love/types";
import { cn } from "@/lib/utils";

type ShareState = {
  shareUrl: string;
};

type PreviewSlide = {
  slideNumber: string;
  kicker: string;
  title: string;
  lines: string[];
  verdict: string;
  stamp: string;
};

const toneOptions: Array<{
  value: PresentationVibe;
  label: string;
  description: string;
  icon: typeof Building2Icon;
}> = [
  {
    value: "boardroom",
    label: "Boardroom",
    description: "Very official.",
    icon: Building2Icon,
  },
  {
    value: "chaos",
    label: "Chaotic",
    description: "A little unhinged.",
    icon: SendIcon,
  },
  {
    value: "sincere",
    label: "Soft Roast",
    description: "Sweet, but honest.",
    icon: HeartIcon,
  },
];

const compromiseLevels: Array<{
  value: CompromiseLevel;
  label: string;
  preview: PreviewSlide;
}> = [
  {
    value: "objective",
    label: "Objective",
    preview: {
      slideNumber: "03",
      kicker: "Observation",
      title: "Possible compatibility.",
      lines: [
        "These two people appear compatible.",
        "Further review is recommended.",
        "The committee remains calm for now.",
      ],
      verdict: "Compatible, allegedly.",
      stamp: "REVIEWED",
    },
  },
  {
    value: "suspicious",
    label: "Suspicious",
    preview: {
      slideNumber: "03",
      kicker: "Exhibit A",
      title: "Suspicious chemistry.",
      lines: [
        "They laugh at the same dumb stuff.",
        "They finish each other's sentences.",
        "The science is not explaining this one.",
      ],
      verdict: "Highly suspicious.",
      stamp: "SUSPICIOUS",
    },
  },
  {
    value: "compromised",
    label: "Compromised",
    preview: {
      slideNumber: "03",
      kicker: "Finding",
      title: "Neutrality has left.",
      lines: [
        "The presenter can no longer remain objective.",
        "The committee has developed feelings.",
        "The minutes now include blushing.",
      ],
      verdict: "Bias confirmed.",
      stamp: "BIASED",
    },
  },
  {
    value: "unwell",
    label: "Emotionally Unwell",
    preview: {
      slideNumber: "03",
      kicker: "Exhibit A",
      title: "Suspicious chemistry.",
      lines: [
        "They laugh at the same dumb stuff.",
        "They finish each other's sentences.",
        "The science is not explaining this one.",
      ],
      verdict: "Highly suspicious.",
      stamp: "APPROVED, UNFORTUNATELY",
    },
  },
];

const deckLengthOptions: Array<{
  value: DeckLengthChoice;
  label: string;
}> = [
  { value: "random", label: "Random 5-10" },
  { value: "5", label: "5 slides" },
  { value: "6", label: "6 slides" },
  { value: "7", label: "7 slides" },
  { value: "8", label: "8 slides" },
  { value: "9", label: "9 slides" },
  { value: "10", label: "10 slides" },
];

const dramaOptions: Array<{
  value: DramaLevel;
  label: string;
}> = [
  { value: "modest", label: "Modest" },
  { value: "dramatic", label: "Dramatic" },
  { value: "unwell", label: "Unwell" },
];

const occasionOptions: Array<{
  value: LoveOccasion;
  label: string;
}> = [
  { value: "just-because", label: "Just because" },
  { value: "anniversary", label: "Anniversary" },
  { value: "date-night", label: "Date night" },
  { value: "birthday", label: "Birthday" },
  { value: "apology", label: "Apology" },
];

export function LoveCreator() {
  const [senderName, setSenderName] = useState("Joseph");
  const [recipientName, setRecipientName] = useState("Antoneta");
  const [vibe, setVibe] = useState<PresentationVibe>("boardroom");
  const [compromiseLevel, setCompromiseLevel] =
    useState<CompromiseLevel>("unwell");
  const [deckLength, setDeckLength] = useState<DeckLengthChoice>("7");
  const [dramaLevel, setDramaLevel] = useState<DramaLevel>("dramatic");
  const [occasion, setOccasion] = useState<LoveOccasion>("just-because");
  const [insideJoke, setInsideJoke] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("");
  const [share, setShare] = useState<ShareState | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);

  const compromiseIndex = compromiseLevels.findIndex(
    (level) => level.value === compromiseLevel,
  );
  const safeCompromiseIndex = Math.max(compromiseIndex, 0);
  const preview =
    compromiseLevels[safeCompromiseIndex]?.preview ??
    compromiseLevels[1].preview;
  const isSelfLove =
    normalizeName(senderName) !== "" &&
    normalizeName(senderName) === normalizeName(recipientName);
  const canCreate =
    senderName.trim().length > 0 && recipientName.trim().length > 0;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-reveal]",
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.055,
        },
      );

      const media = gsap.matchMedia();

      media.add("(min-width: 761px)", () => {
        gsap.to(card, {
          y: -8,
          rotate: -0.65,
          duration: 3.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }, root);

    return () => context.revert();
  }, []);

  useLayoutEffect(() => {
    const target = cardContentRef.current;
    if (!target) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const animation = gsap.fromTo(
      target,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out" },
    );

    return () => {
      animation.kill();
    };
  }, [compromiseLevel]);

  function createPresentation() {
    try {
      const payload = createSharePayload({
        senderName,
        recipientName,
        vibe,
        deckLength,
        dramaLevel,
        compromiseLevel,
        occasion,
        insideJoke,
        imageUrls: splitImageUrls(imageUrlsText),
        seed: crypto.randomUUID(),
      });
      const token = encodeSharePayload(payload);
      const shareUrl = new URL("/p", window.location.origin);
      shareUrl.hash = token;

      setShare({
        shareUrl: shareUrl.toString(),
      });
      animateStamp();
      toast.success("Deck created.");
    } catch {
      toast.error("Check the names and photo links.");
    }
  }

  async function copyShareLink() {
    if (!share) return;

    try {
      await navigator.clipboard.writeText(share.shareUrl);
      toast.success("Link copied.");
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  function animateStamp() {
    const stamp = stampRef.current;
    if (!stamp) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    gsap.fromTo(
      stamp,
      { scale: 1.42, rotate: -16, y: -32, autoAlpha: 0 },
      {
        scale: 1,
        rotate: -7,
        y: 0,
        autoAlpha: 1,
        duration: 0.52,
        ease: "back.out(2.1)",
      },
    );
  }

  function showNextPreview() {
    const next =
      compromiseLevels[(safeCompromiseIndex + 1) % compromiseLevels.length];
    setCompromiseLevel(next.value);
    setShare(null);
    animateStamp();
  }

  return (
    <main ref={rootRef} className="love-home">
      <header className="love-nav" data-reveal>
        <a className="love-brand" href="#top" aria-label="Love Presentation">
          <HeartIcon className="love-brand-icon" fill="none" />
          <span>Love Presentation</span>
        </a>
        <nav className="love-nav-links" aria-label="Primary navigation">
          <a href="#how">How it works</a>
          <a href="#samples">Samples</a>
          <a href="#about">About</a>
        </nav>
        <a
          className="love-source"
          href="https://github.com/Joe-Simo/love-presentation"
          rel="noreferrer"
          target="_blank"
        >
          <GithubMark />
          <span>Open Source</span>
        </a>
      </header>

      <section id="top" className="love-hero" aria-label="Love deck creator">
        <div className="love-copy">
          <div className="love-eyebrow" data-reveal>
            <span>A very serious presentation</span>
            <span>About a very unserious amount of love.</span>
          </div>

          <h1 className="love-title" data-reveal>
            <span>Make a love deck.</span>
            <span>Try not to look</span>
            <em>desperate.</em>
          </h1>

          <p className="love-subtitle" data-reveal>
            A tiny free app for making private slideshow links about why two
            people are suspiciously perfect together.
          </p>

          <form
            className="love-form"
            data-reveal
            onSubmit={(event) => {
              event.preventDefault();
              createPresentation();
            }}
          >
            <div className="love-name-grid">
              <label className="love-field">
                <span>From</span>
                <input
                  value={senderName}
                  onChange={(event) => {
                    setSenderName(event.target.value);
                    setShare(null);
                  }}
                  maxLength={48}
                  autoComplete="name"
                />
              </label>
              <label className="love-field">
                <span>To</span>
                <input
                  value={recipientName}
                  onChange={(event) => {
                    setRecipientName(event.target.value);
                    setShare(null);
                  }}
                  maxLength={48}
                  autoComplete="off"
                />
              </label>
            </div>

            <fieldset className="love-tone-field">
              <legend>Tone</legend>
              <div className="love-tone-grid">
                {toneOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = vibe === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn("love-tone", selected && "is-selected")}
                      aria-pressed={selected}
                      onClick={() => {
                        setVibe(option.value);
                        setShare(null);
                      }}
                    >
                      <span className="love-radio" aria-hidden="true">
                        {selected ? <span /> : null}
                      </span>
                      <Icon aria-hidden="true" />
                      <span className="love-tone-copy">
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="love-compromise-field">
              <legend>Emotional compromise</legend>
              <input
                aria-label="Emotional compromise"
                type="range"
                min={0}
                max={compromiseLevels.length - 1}
                step={1}
                value={safeCompromiseIndex}
                onChange={(event) => {
                  const next =
                    compromiseLevels[Number(event.target.value)] ??
                    compromiseLevels[1];
                  setCompromiseLevel(next.value);
                  setShare(null);
                }}
              />
              <div className="love-compromise-labels" aria-hidden="true">
                {compromiseLevels.map((level) => (
                  <span
                    key={level.value}
                    className={level.value === compromiseLevel ? "is-active" : ""}
                  >
                    {level.label}
                  </span>
                ))}
              </div>
            </fieldset>

            <label className="love-field love-image-field">
              <span>
                Optional image URL <small>(https://...)</small>
              </span>
              <span className="love-image-input">
                <input
                  value={imageUrlsText}
                  onChange={(event) => {
                    setImageUrlsText(event.target.value);
                    setShare(null);
                  }}
                  placeholder="https://example.com/your-photo.jpg"
                />
                <ImageIcon aria-hidden="true" />
              </span>
            </label>

            <button
              className="love-submit"
              type="submit"
              disabled={!canCreate}
            >
              <span>Create private link</span>
              <ArrowRightIcon aria-hidden="true" />
            </button>

            <div className="love-privacy">
              <LockKeyholeIcon aria-hidden="true" />
              <span>
                No account. No uploads. No database.{" "}
                <strong>No committee approval.</strong>
              </span>
            </div>

            {isSelfLove ? (
              <p className="love-self-note">
                This appears to be self-love. Valid.
              </p>
            ) : null}

            {share ? (
              <div className="love-share-result" role="status">
                <p>Your deck is ready.</p>
                <button type="button" onClick={copyShareLink}>
                  <CopyIcon aria-hidden="true" />
                  Copy
                </button>
                <a href={share.shareUrl} target="_blank" rel="noreferrer">
                  Open
                </a>
              </div>
            ) : null}

            <details className="love-advanced">
              <summary>Advanced nonsense</summary>
              <div className="love-custom-grid">
                <label className="love-field">
                  <span>Slides</span>
                  <select
                    value={deckLength}
                    onChange={(event) => {
                      setDeckLength(event.target.value as DeckLengthChoice);
                      setShare(null);
                    }}
                  >
                    {deckLengthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="love-field">
                  <span>Occasion</span>
                  <select
                    value={occasion}
                    onChange={(event) => {
                      setOccasion(event.target.value as LoveOccasion);
                      setShare(null);
                    }}
                  >
                    {occasionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="love-field">
                  <span>Drama</span>
                  <select
                    value={dramaLevel}
                    onChange={(event) => {
                      setDramaLevel(event.target.value as DramaLevel);
                      setShare(null);
                    }}
                  >
                    {dramaOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="love-field love-wide-field">
                <span>Inside joke</span>
                <input
                  value={insideJoke}
                  onChange={(event) => {
                    setInsideJoke(event.target.value);
                    setShare(null);
                  }}
                  maxLength={96}
                  placeholder="e.g. the soup incident"
                />
              </label>
            </details>
          </form>
        </div>

        <div className="love-preview-zone" data-reveal>
          <HeartIcon className="love-floating-heart" aria-hidden="true" />
          <div className="love-card-wrap">
            <article ref={cardRef} className="love-preview-card">
              <div className="love-card-meta">
                <span>
                  Slide <strong>{preview.slideNumber}</strong> / 07
                </span>
                <span>Case file #2025-LOVE-001</span>
              </div>

              <div ref={cardContentRef} aria-live="polite">
                <p className="love-card-kicker">{preview.kicker}</p>
                <h2>{preview.title}</h2>
                <div className="love-card-rule" />

                <div className="love-card-body">
                  {preview.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                <div className="love-card-verdict">
                  <p>Verdict:</p>
                  <strong>{preview.verdict}</strong>
                </div>
              </div>

              <div ref={stampRef} className="love-stamp" aria-hidden="true">
                {preview.stamp.split(", ").map((line) => (
                  <span key={line}>{line}</span>
                ))}
                <HeartIcon />
              </div>
            </article>

            <button
              type="button"
              className="love-next"
              aria-label="Preview next slide"
              onClick={showNextPreview}
            >
              <ArrowRightIcon aria-hidden="true" />
            </button>
          </div>

          <div className="love-dots" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <span
                key={index}
                className={index === 2 ? "is-active" : ""}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="love-notes" aria-label="Project details">
        <div id="how" className="love-note" data-reveal>
          <LockKeyholeIcon aria-hidden="true" />
          <div>
            <h2>Private by design</h2>
            <p>
              Your deck lives in the link. We don&apos;t store your love crimes.
            </p>
          </div>
        </div>
        <div id="samples" className="love-note" data-reveal>
          <Link2Icon aria-hidden="true" />
          <div>
            <h2>Share anywhere</h2>
            <p>
              Send the link and prepare for smiles, tears, or negotiations.
            </p>
          </div>
        </div>
        <div id="about" className="love-note" data-reveal>
          <SparklesIcon aria-hidden="true" />
          <div>
            <h2>Yours, not theirs</h2>
            <p>
              Edit anytime. Regenerate. Make it more dramatic.
            </p>
          </div>
        </div>
      </section>

      <footer className="love-footer" data-reveal>
        <p>
          Open source with <HeartIcon aria-hidden="true" /> by one emotionally
          compromised developer.
        </p>
      </footer>
    </main>
  );
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function splitImageUrls(value: string) {
  return value
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function GithubMark() {
  return (
    <svg
      aria-hidden="true"
      className="love-github"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.52 2.86 8.35 6.83 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.33 9.33 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.06 10.06 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
    </svg>
  );
}
