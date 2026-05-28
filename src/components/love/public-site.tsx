"use client";

import { gsap } from "gsap";
import {
  ArrowRightIcon,
  CheckIcon,
  ClipboardIcon,
  CopyIcon,
  ExternalLinkIcon,
  HeartIcon,
  ImageIcon,
  LinkIcon,
  LockKeyholeIcon,
  MonitorIcon,
  SparklesIcon,
  TerminalIcon,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createSharePayload,
  encodeSharePayload,
} from "@/lib/love/share";
import type {
  CompromiseLevel,
  DramaLevel,
  PresentationVibe,
} from "@/lib/love/types";

type WindowId = "compose" | "preview" | "status";

type ToneOption = {
  value: PresentationVibe;
  label: string;
  description: string;
};

const toneOptions: ToneOption[] = [
  {
    value: "boardroom",
    label: "Boardroom",
    description: "Very official.",
  },
  {
    value: "chaos",
    label: "Chaotic",
    description: "Legally unstable.",
  },
  {
    value: "sincere",
    label: "Soft Roast",
    description: "Sweet, with notes.",
  },
];

const compromiseOptions: Array<{
  value: CompromiseLevel;
  label: string;
  terminalLine: string;
}> = [
  {
    value: "objective",
    label: "Objective",
    terminalLine: "neutrality intact",
  },
  {
    value: "suspicious",
    label: "Suspicious",
    terminalLine: "chemistry detected",
  },
  {
    value: "compromised",
    label: "Compromised",
    terminalLine: "presenter bias likely",
  },
  {
    value: "unwell",
    label: "Unwell",
    terminalLine: "legal has concerns",
  },
];

const methodItems = [
  {
    icon: LockKeyholeIcon,
    title: "Private by design",
    body: "The deck lives in the URL. There is no account, upload queue, or romantic CRM.",
  },
  {
    icon: TerminalIcon,
    title: "Local generation",
    body: "The jokes are templates, not AI. The judgment is still questionable.",
  },
  {
    icon: LinkIcon,
    title: "Shareable output",
    body: "Send one link. Receive one reaction. Possibly several follow-up texts.",
  },
];

const evidenceRows = [
  ["PROJECT", "Private love deck"],
  ["ROLE", "Biased presenter"],
  ["STATUS", "Approved, unfortunately"],
] as const;

export function PublicLoveSite() {
  const rootRef = useRef<HTMLElement>(null);
  const [activeWindow, setActiveWindow] = useState<WindowId>("compose");
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [vibe, setVibe] = useState<PresentationVibe>("boardroom");
  const [compromiseIndex, setCompromiseIndex] = useState(2);
  const [shareUrl, setShareUrl] = useState("");

  const compromise = compromiseOptions[compromiseIndex] ?? compromiseOptions[2];
  const recipientLabel = recipientName.trim() || "Recipient";
  const initials = `${initialFor(senderName)}+${initialFor(recipientName)}`;
  const canCreate =
    senderName.trim().length > 0 && recipientName.trim().length > 0;

  const terminalLines = useMemo(
    () => [
      "$ love-presentation generate",
      `✓ tone: ${toneOptions.find((option) => option.value === vibe)?.label ?? "Boardroom"}`,
      `✓ compromise: ${compromise.terminalLine}`,
      "✓ storage: none",
      shareUrl ? "✓ private link ready" : "• awaiting two names",
    ],
    [compromise.terminalLine, shareUrl, vibe],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-public-love-reveal]",
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          ease: "power3.out",
          stagger: 0.055,
        },
      );

      gsap.to("[data-public-love-float]", {
        y: -8,
        duration: 3.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, root);

    return () => context.revert();
  }, []);

  function resetShare() {
    if (shareUrl) {
      setShareUrl("");
    }
  }

  function createPresentation() {
    if (!canCreate) return;

    try {
      const payload = createSharePayload({
        senderName,
        recipientName,
        vibe,
        deckLength: "7",
        dramaLevel: dramaFromCompromise(compromise.value),
        compromiseLevel: compromise.value,
        occasion: "just-because",
        insideJoke: "",
        imageUrls: [],
        seed: crypto.randomUUID(),
      });
      const token = encodeSharePayload(payload);
      const nextUrl = new URL("/p", window.location.origin);
      nextUrl.hash = token;

      setShareUrl(nextUrl.toString());
      setActiveWindow("status");
      toast.success("Private link created.");
    } catch {
      toast.error("The committee rejected those inputs.");
    }
  }

  async function copyShareUrl() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied.");
    } catch {
      toast.error("Clipboard declined to participate.");
    }
  }

  return (
    <main ref={rootRef} className="public-love-site">
      <header className="public-love-nav" data-public-love-reveal>
        <a className="public-love-brand" href="#top" aria-label="Love Presentation">
          <span className="public-love-brand-mark" aria-hidden="true">
            <HeartIcon fill="currentColor" />
          </span>
          <span>Love Presentation</span>
        </a>

        <nav className="public-love-links" aria-label="Primary navigation">
          <a href="#create">Create</a>
          <a href="#evidence">Evidence</a>
          <a href="#method">Method</a>
          <a href="#privacy">Privacy</a>
        </nav>

        <a
          className="public-love-source"
          href="https://github.com/Joe-Simo/love-presentation"
          rel="noreferrer"
          target="_blank"
        >
          <GithubMark />
          Source
        </a>
      </header>

      <section id="top" className="public-love-hero" aria-label="Public love presentation creator">
        <div className="public-love-hero-copy">
          <p className="public-love-command" data-public-love-reveal>
            $ love-presentation new
          </p>
          <h1 data-public-love-reveal>Love Presentation</h1>
          <p className="public-love-hero-line" data-public-love-reveal>
            Emotionally compromised presentation software.
          </p>
          <p className="public-love-subcopy" data-public-love-reveal>
            Make a private slideshow link for someone who deserves evidence,
            but not a whole notes-app essay.
          </p>

          <div className="public-love-actions" data-public-love-reveal>
            <a className="public-love-button public-love-button-primary" href="#create">
              Create private link
              <ArrowRightIcon aria-hidden="true" />
            </a>
            <a className="public-love-button public-love-button-secondary" href="#evidence">
              View the evidence
            </a>
          </div>

          <div className="public-love-proof-strip" data-public-love-reveal>
            <span>
              <LockKeyholeIcon aria-hidden="true" />
              No account
            </span>
            <span>
              <ImageIcon aria-hidden="true" />
              No uploads
            </span>
            <span>
              <SparklesIcon aria-hidden="true" />
              No committee
            </span>
          </div>
        </div>

        <div
          id="create"
          className="public-love-stage"
          aria-label="Interactive love presentation windows"
          data-public-love-reveal
        >
          <WindowShell
            id="compose"
            title="New case"
            activeWindow={activeWindow}
            className="public-love-compose-window"
            onActivate={setActiveWindow}
          >
            <form
              className="public-love-compose-form"
              onSubmit={(event) => {
                event.preventDefault();
                createPresentation();
              }}
            >
              <div className="public-love-case-helper">
                <span>Two names. One biased deck. No database.</span>
                <span>⌘N</span>
              </div>

              <div className="public-love-field-grid">
                <label className="public-love-field">
                  <span>From</span>
                  <input
                    value={senderName}
                    onChange={(event) => {
                      setSenderName(event.target.value);
                      resetShare();
                    }}
                    maxLength={48}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
                <label className="public-love-field">
                  <span>To</span>
                  <input
                    value={recipientName}
                    onChange={(event) => {
                      setRecipientName(event.target.value);
                      resetShare();
                    }}
                    maxLength={48}
                    placeholder="Their name"
                    autoComplete="off"
                  />
                </label>
              </div>

              <fieldset className="public-love-tone-field">
                <legend>Tone</legend>
                <div className="public-love-tone-list">
                  {toneOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={vibe === option.value}
                      className="public-love-tone"
                      data-selected={vibe === option.value}
                      onClick={() => {
                        setVibe(option.value);
                        resetShare();
                      }}
                    >
                      <span>{option.label}</span>
                      <small>{option.description}</small>
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="public-love-range-field">
                <span>Emotional compromise</span>
                <input
                  type="range"
                  min={0}
                  max={compromiseOptions.length - 1}
                  step={1}
                  value={compromiseIndex}
                  onChange={(event) => {
                    setCompromiseIndex(Number(event.target.value));
                    resetShare();
                  }}
                />
              </label>
              <div className="public-love-range-labels" aria-hidden="true">
                {compromiseOptions.map((option, index) => (
                  <span
                    key={option.value}
                    data-active={index === compromiseIndex}
                  >
                    {option.label}
                  </span>
                ))}
              </div>

              <button
                className="public-love-submit"
                type="submit"
                disabled={!canCreate}
              >
                Create private link
                <ArrowRightIcon aria-hidden="true" />
              </button>
            </form>
          </WindowShell>

          <WindowShell
            id="preview"
            title={`Preview — ${recipientLabel.toLowerCase()}`}
            activeWindow={activeWindow}
            className="public-love-preview-window"
            onActivate={setActiveWindow}
          >
            <div className="public-love-preview-toolbar">
              <span>03 / 07</span>
              <span className="public-love-progress-dots" aria-hidden="true">
                {Array.from({ length: 7 }, (_, index) => (
                  <i key={index} data-active={index === 2} />
                ))}
              </span>
            </div>

            <div className="public-love-art-frame" data-public-love-float>
              <Image
                src="/love-public/love-presentation-art.png"
                alt="Generated monochrome glass presentation windows with a small black heart."
                width={1536}
                height={864}
                priority
              />
              <div className="public-love-art-label">
                <span>{initials}</span>
                <span>compatibility memo</span>
              </div>
            </div>
          </WindowShell>

          <WindowShell
            id="status"
            title="love-presentation"
            activeWindow={activeWindow}
            className="public-love-status-window"
            onActivate={setActiveWindow}
            status="OK"
          >
            <div className="public-love-terminal" aria-live="polite">
              {terminalLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="public-love-share-box">
              <span>{shareUrl ? "Private link ready" : "Link appears here"}</span>
              {shareUrl ? (
                <div className="public-love-share-actions">
                  <button type="button" onClick={copyShareUrl}>
                    <CopyIcon aria-hidden="true" />
                    Copy
                  </button>
                  <a href={shareUrl} target="_blank" rel="noreferrer">
                    Open
                    <ExternalLinkIcon aria-hidden="true" />
                  </a>
                </div>
              ) : (
                <span className="public-love-share-empty">No one has been accused yet.</span>
              )}
            </div>
          </WindowShell>
        </div>
      </section>

      <section id="evidence" className="public-love-section public-love-evidence">
        <div className="public-love-section-heading" data-public-love-reveal>
          <span>Selected case file</span>
          <h2>A generated deck about two people behaving suspiciously well together.</h2>
        </div>

        <div className="public-love-evidence-grid">
          <div className="public-love-evidence-panel" data-public-love-reveal>
            {evidenceRows.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="public-love-case-card" data-public-love-reveal>
            <div className="public-love-case-card-header">
              <span>Slide 03</span>
              <span>Case file</span>
            </div>
            <h3>Suspicious chemistry.</h3>
            <p>
              They laugh at the same dumb stuff. The science is not explaining
              this one.
            </p>
            <div>
              <CheckIcon aria-hidden="true" />
              <span>Verdict: approved, unfortunately.</span>
            </div>
          </div>
        </div>
      </section>

      <section id="method" className="public-love-section public-love-method">
        <div className="public-love-section-heading" data-public-love-reveal>
          <span>Method</span>
          <h2>Three steps. Zero drama.</h2>
        </div>

        <div className="public-love-method-grid">
          {methodItems.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} data-public-love-reveal>
                <Icon aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="privacy" className="public-love-section public-love-privacy">
        <div className="public-love-privacy-copy" data-public-love-reveal>
          <span>Privacy note</span>
          <h2>Your deck lives in the link.</h2>
          <p>
            Love Presentation keeps the URL-only share model: no login, no
            uploads, no database. Public software. Private feelings.
          </p>
        </div>

        <div className="public-love-privacy-window" data-public-love-reveal>
          <div>
            <MonitorIcon aria-hidden="true" />
            <span>runtime</span>
            <strong>browser</strong>
          </div>
          <div>
            <ClipboardIcon aria-hidden="true" />
            <span>storage</span>
            <strong>none</strong>
          </div>
          <div>
            <LinkIcon aria-hidden="true" />
            <span>output</span>
            <strong>one private URL</strong>
          </div>
        </div>
      </section>

      <footer className="public-love-footer" data-public-love-reveal>
        <p>Open source by one emotionally compromised developer.</p>
        <a
          href="https://github.com/Joe-Simo/love-presentation"
          target="_blank"
          rel="noreferrer"
        >
          View source
          <ExternalLinkIcon aria-hidden="true" />
        </a>
      </footer>
    </main>
  );
}

function WindowShell({
  id,
  title,
  activeWindow,
  className,
  children,
  onActivate,
  status,
}: {
  id: WindowId;
  title: string;
  activeWindow: WindowId;
  className: string;
  children: ReactNode;
  onActivate: (id: WindowId) => void;
  status?: string;
}) {
  const isActive = activeWindow === id;

  return (
    <article
      className={`public-love-window ${className}`}
      data-active={isActive}
      onClick={() => onActivate(id)}
      onFocus={() => onActivate(id)}
      tabIndex={0}
      aria-label={`${title} window`}
    >
      <div className="public-love-window-bar">
        <span className="public-love-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <strong>{title}</strong>
        <span>{status ?? (isActive ? "active" : "idle")}</span>
      </div>
      {children}
    </article>
  );
}

function initialFor(value: string) {
  const trimmed = value.trim();

  return trimmed ? trimmed.slice(0, 1).toUpperCase() : "?";
}

function dramaFromCompromise(value: CompromiseLevel): DramaLevel {
  if (value === "objective") return "modest";
  if (value === "unwell") return "unwell";

  return "dramatic";
}

function GithubMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.52 2.86 8.35 6.83 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.33 9.33 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.06 10.06 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
    </svg>
  );
}
