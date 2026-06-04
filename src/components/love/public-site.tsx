"use client";

import { gsap } from "gsap";
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  HeartIcon,
  LinkIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { createPresentationShareUrl } from "@/lib/love/create-presentation";
import {
  parseImageUrlText,
  sanitizeImageUrls,
} from "@/lib/love/share";
import { firstGrapheme } from "@/lib/love/text";
import type {
  CompromiseLevel,
  DramaLevel,
  PresentationVibe,
} from "@/lib/love/types";

type WindowId = "compose" | "preview" | "status";
type FieldErrors = {
  senderName?: string;
  recipientName?: string;
  imageUrls?: string;
};

type ToneOption = {
  value: PresentationVibe;
  label: string;
  description: string;
};

const toneOptions: ToneOption[] = [
  {
    value: "boardroom",
    label: "Boardroom",
    description: "Formal memo.",
  },
  {
    value: "chaos",
    label: "Chaotic",
    description: "Zero chill.",
  },
  {
    value: "sincere",
    label: "Soft Roast",
    description: "Warm proof.",
  },
];

const proofItems: Array<{
  label: string;
  value: string;
  icon: typeof LockKeyholeIcon;
}> = [
  {
    label: "Privacy",
    value: "URL-only",
    icon: LockKeyholeIcon,
  },
  {
    label: "Media",
    value: "No uploads",
    icon: ShieldCheckIcon,
  },
  {
    label: "Output",
    value: "One link",
    icon: LinkIcon,
  },
];

const compromiseOptions: Array<{
  value: CompromiseLevel;
  label: string;
}> = [
  {
    value: "objective",
    label: "Objective",
  },
  {
    value: "suspicious",
    label: "Suspicious",
  },
  {
    value: "compromised",
    label: "Compromised",
  },
  {
    value: "unwell",
    label: "Unwell",
  },
];

export function PublicLoveSite() {
  const rootRef = useRef<HTMLElement>(null);
  const [activeWindow, setActiveWindow] = useState<WindowId>("compose");
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("");
  const [vibe, setVibe] = useState<PresentationVibe>("boardroom");
  const [compromiseIndex, setCompromiseIndex] = useState(2);
  const [shareUrl, setShareUrl] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [heroArtFailed, setHeroArtFailed] = useState(false);
  const senderInputRef = useRef<HTMLInputElement>(null);
  const recipientInputRef = useRef<HTMLInputElement>(null);
  const imageUrlsDetailsRef = useRef<HTMLDetailsElement>(null);
  const imageUrlsInputRef = useRef<HTMLTextAreaElement>(null);

  const compromise = compromiseOptions[compromiseIndex] ?? compromiseOptions[2];
  const selectedTone =
    toneOptions.find((option) => option.value === vibe) ?? toneOptions[0];
  const recipientLabel = recipientName.trim() || "Recipient";
  const photoCount = parseImageUrlText(imageUrlsText).length;
  const initials = `${firstGrapheme(senderName)}+${firstGrapheme(recipientName)}`;
  const senderError = fieldErrors.senderName ?? "";
  const recipientError = fieldErrors.recipientName ?? "";
  const imageUrlsError = fieldErrors.imageUrls ?? "";
  const canCreate =
    senderName.trim().length > 0 && recipientName.trim().length > 0;
  const previewIndex = Math.min(compromiseIndex + 3, 7);
  const previewCopy = previewCopyFor(vibe, compromise.value, recipientLabel);
  const photoSummary = imageUrlsError
    ? "Fix photo links"
    : photoCount > 0
      ? `${photoCount} linked`
      : "No uploads required";

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) return;

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

  function clearFieldError(field: keyof FieldErrors) {
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  async function createPresentation() {
    if (isCreating) return;

    setSubmitAttempted(true);

    const validation = validatePublicFields({
      senderName,
      recipientName,
      imageUrlsText,
    });

    setFieldErrors(validation.errors);

    if (Object.keys(validation.errors).length > 0) {
      requestAnimationFrame(() => {
        if (validation.errors.senderName) {
          senderInputRef.current?.focus();
          return;
        }

        if (validation.errors.recipientName) {
          recipientInputRef.current?.focus();
          return;
        }

        if (validation.errors.imageUrls) {
          if (imageUrlsDetailsRef.current) {
            imageUrlsDetailsRef.current.open = true;
          }

          imageUrlsInputRef.current?.focus();
        }
      });
      return;
    }

    setIsCreating(true);

    try {
      const nextShareUrl = await createPresentationShareUrl({
        senderName: senderName.trim(),
        recipientName: recipientName.trim(),
        vibe,
        deckLength: "7",
        dramaLevel: dramaFromCompromise(compromise.value),
        compromiseLevel: compromise.value,
        occasion: "just-because",
        insideJoke: "",
        imageUrls: validation.imageUrls,
      });

      setShareUrl(nextShareUrl);
      setActiveWindow("status");
      toast.success("Link created");
      requestAnimationFrame(() => {
        document
          .querySelector(".public-love-status-window")
          ?.scrollIntoView({
            block: "center",
            behavior: prefersReducedMotion() ? "auto" : "smooth",
          });
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't create link. Try again.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function copyShareUrl() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy. Select the link below.");
    }
  }

  return (
    <main ref={rootRef} className="public-love-site">
      <a className="public-love-skip" href="#compose">
        Skip to creator
      </a>

      <header className="public-love-nav" data-public-love-reveal>
        <a className="public-love-brand" href="#top" aria-label="Love Presentation">
          <span className="public-love-brand-mark" aria-hidden="true">
            <HeartIcon fill="currentColor" />
          </span>
          <span>Love Presentation</span>
        </a>

        <nav className="public-love-nav-actions" aria-label="Primary navigation">
          <a
            className="public-love-nav-link"
            href="https://github.com/Joe-Simo/love-presentation"
            rel="noreferrer"
            target="_blank"
          >
            Source
            <ExternalLinkIcon aria-hidden="true" />
          </a>
          <a className="public-love-nav-action" href="#compose">
            Create Link
            <ArrowRightIcon aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section id="top" className="public-love-hero" aria-label="Public love presentation creator">
        <div className="public-love-hero-copy">
          <p className="public-love-eyebrow" data-public-love-reveal>
            <SparklesIcon aria-hidden="true" />
            Private case-file generator
          </p>
          <h1 data-public-love-reveal>
            <span>Love</span>
            <span>Presentation</span>
          </h1>
          <p className="public-love-hero-line" data-public-love-reveal>
            Make a private deck that says the quiet part in slides.
          </p>
          <p className="public-love-subcopy" data-public-love-reveal>
            Add two names, choose the emotional temperature, and send one
            self-contained link.
          </p>

          <div className="public-love-proof" aria-label="Product details" data-public-love-reveal>
            {proofItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="public-love-proof-item">
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              );
            })}
          </div>

          <div className="public-love-actions" data-public-love-reveal>
            <a className="public-love-button public-love-button-primary" href="#compose">
              Create Link
              <ArrowRightIcon aria-hidden="true" />
            </a>
          </div>
        </div>

        <div
          id="create"
          className="public-love-stage"
          aria-label="Interactive love presentation windows"
          data-public-love-reveal
        >
          <div className="public-love-stage-header">
            <span>Workspace</span>
            <strong>Draft / Preview / Share</strong>
          </div>

          <WindowShell
            id="compose"
            title="Create"
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
                <span>Case Details</span>
                <span>Step 01</span>
              </div>

              <div className="public-love-field-grid">
                <label className="public-love-field" htmlFor="public-love-sender">
                  <span>From</span>
                  <Input
                    id="public-love-sender"
                    ref={senderInputRef}
                    name="senderName"
                    className="public-love-input"
                    value={senderName}
                    onChange={(event) => {
                      setSenderName(event.target.value);
                      clearFieldError("senderName");
                      resetShare();
                    }}
                    maxLength={48}
                    placeholder="Joseph"
                    autoComplete="name"
                    aria-invalid={senderError ? true : undefined}
                    aria-describedby={
                      senderError ? "public-love-sender-error" : undefined
                    }
                  />
                  {senderError ? (
                    <small
                      id="public-love-sender-error"
                      className="public-love-field-error"
                    >
                      {senderError}
                    </small>
                  ) : null}
                </label>
                <label className="public-love-field" htmlFor="public-love-recipient">
                  <span>To</span>
                  <Input
                    id="public-love-recipient"
                    ref={recipientInputRef}
                    name="recipientName"
                    className="public-love-input"
                    value={recipientName}
                    onChange={(event) => {
                      setRecipientName(event.target.value);
                      clearFieldError("recipientName");
                      resetShare();
                    }}
                    maxLength={48}
                    placeholder="Antoneta"
                    autoComplete="off"
                    aria-invalid={recipientError ? true : undefined}
                    aria-describedby={
                      recipientError ? "public-love-recipient-error" : undefined
                    }
                  />
                  {recipientError ? (
                    <small
                      id="public-love-recipient-error"
                      className="public-love-field-error"
                    >
                      {recipientError}
                    </small>
                  ) : null}
                </label>
              </div>

              <details
                ref={imageUrlsDetailsRef}
                className="public-love-photo-details"
                data-invalid={imageUrlsError ? true : undefined}
              >
                <summary>
                  <span>Add optional photos</span>
                  <small>{photoSummary}</small>
                </summary>
                <label className="public-love-photo-field" htmlFor="public-love-image-urls">
                  <span>Photo links</span>
                  <textarea
                    id="public-love-image-urls"
                    ref={imageUrlsInputRef}
                    name="imageUrls"
                    className="public-love-textarea"
                    value={imageUrlsText}
                    onChange={(event) => {
                      setImageUrlsText(event.target.value);
                      clearFieldError("imageUrls");
                      resetShare();
                    }}
                    rows={2}
                    placeholder="Paste HTTPS image links, one per line"
                    aria-invalid={imageUrlsError ? true : undefined}
                    aria-describedby={
                      imageUrlsError
                        ? "public-love-image-urls-error"
                        : "public-love-image-urls-helper"
                    }
                  />
                  {imageUrlsError ? (
                    <small
                      id="public-love-image-urls-error"
                      className="public-love-field-error"
                    >
                      {imageUrlsError}
                    </small>
                  ) : (
                    <small
                      id="public-love-image-urls-helper"
                      className="public-love-field-helper"
                    >
                      Use direct HTTPS image links. They stay in the shared URL.
                    </small>
                  )}
                </label>
              </details>

              <fieldset className="public-love-tone-field">
                <legend>Tone</legend>
                <div className="public-love-tone-list">
                  {toneOptions.map((option) => (
                    <label
                      key={option.value}
                      className="public-love-tone"
                      data-selected={vibe === option.value}
                    >
                      <input
                        type="radio"
                        name="presentationVibe"
                        value={option.value}
                        checked={vibe === option.value}
                        onChange={() => {
                          setVibe(option.value);
                          resetShare();
                        }}
                      />
                      <span className="public-love-tone-check" aria-hidden="true">
                        <CheckIcon />
                      </span>
                      <span>{option.label}</span>
                      <small>{option.description}</small>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="public-love-range-field" htmlFor="public-love-compromise">
                <span>Emotional compromise</span>
                <output
                  className="public-love-range-value"
                  htmlFor="public-love-compromise"
                  aria-live="polite"
                >
                  {compromise.label}
                </output>
                <input
                  id="public-love-compromise"
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
                disabled={isCreating}
                aria-busy={isCreating}
                aria-describedby={
                  submitAttempted && !canCreate
                    ? "public-love-submit-help"
                    : undefined
                  }
              >
                {isCreating ? (
                  <span className="public-love-submit-spinner" aria-hidden="true" />
                ) : null}
                <span>Create Link</span>
                <ArrowRightIcon aria-hidden="true" />
              </button>
              {submitAttempted && !canCreate ? (
                <p id="public-love-submit-help" className="public-love-submit-help">
                  Add both names to create a link.
                </p>
              ) : null}
            </form>
          </WindowShell>

          <WindowShell
            id="preview"
            title="Preview"
            activeWindow={activeWindow}
            className="public-love-preview-window"
            onActivate={setActiveWindow}
          >
            <div className="public-love-preview-toolbar">
              <span>Slide {String(previewIndex).padStart(2, "0")} / 07</span>
              <span className="public-love-progress-dots" aria-hidden="true">
                {Array.from({ length: 7 }, (_, index) => (
                  <i key={index} data-active={index === previewIndex - 1} />
                ))}
              </span>
            </div>

            <div className="public-love-art-frame" data-public-love-float>
              {heroArtFailed ? (
                <div
                  className="public-love-art-fallback"
                  aria-label="Love Presentation preview"
                >
                  <span>{initials}</span>
                  <p>Love Presentation</p>
                </div>
              ) : (
                <Image
                  src="/love-public/love-presentation-art.png"
                  alt="Love Presentation preview deck."
                  width={1586}
                  height={992}
                  sizes="(max-width: 900px) 100vw, 570px"
                  priority
                  onError={() => setHeroArtFailed(true)}
                />
              )}
              <div className="public-love-art-label">
                <span>{initials}</span>
                <span>
                  {photoCount > 0
                    ? `${photoCount} photo${photoCount === 1 ? "" : "s"}`
                    : recipientLabel}
                </span>
              </div>
            </div>
            <div className="public-love-preview-copy" aria-live="polite">
              <span>{selectedTone.label}</span>
              <strong>{previewCopy.title}</strong>
              <p>{previewCopy.body}</p>
            </div>
          </WindowShell>

          <WindowShell
            id="status"
            title="Link"
            activeWindow={activeWindow}
            className="public-love-status-window"
            onActivate={setActiveWindow}
            status={shareUrl ? "Ready" : undefined}
          >
            <div className="public-love-share-box">
              <span>{shareUrl ? "Link Ready" : "Create Link First"}</span>
              {shareUrl ? (
                <div className="public-love-share-ready">
                  <input
                    className="public-love-share-url"
                    value={shareUrl}
                    readOnly
                    aria-label="Share link"
                    onFocus={(event) => event.currentTarget.select()}
                  />
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
                </div>
              ) : (
                <span className="public-love-share-empty">
                  Waiting for a generated link.
                </span>
              )}
            </div>
          </WindowShell>
        </div>
      </section>
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
      id={id}
      className={`public-love-window ${className}`}
      data-active={isActive}
      aria-label={`${title} window`}
    >
      <div className="public-love-window-bar">
        <button
          className="public-love-window-activate"
          type="button"
          onClick={() => onActivate(id)}
          aria-label={`Activate ${title} window`}
        >
          <span className="public-love-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <strong>{title}</strong>
        </button>
        <span className="public-love-window-status">
          {status ?? ""}
        </span>
      </div>
      {children}
    </article>
  );
}

function dramaFromCompromise(value: CompromiseLevel): DramaLevel {
  if (value === "objective") return "modest";
  if (value === "unwell") return "unwell";

  return "dramatic";
}

function validatePublicFields({
  senderName,
  recipientName,
  imageUrlsText,
}: {
  senderName: string;
  recipientName: string;
  imageUrlsText: string;
}) {
  const errors: FieldErrors = {};

  if (senderName.trim().length === 0) {
    errors.senderName = "From name is required.";
  } else if (/[<>{}[\]\\]/.test(senderName)) {
    errors.senderName = "Remove markup characters.";
  }

  if (recipientName.trim().length === 0) {
    errors.recipientName = "To name is required.";
  } else if (/[<>{}[\]\\]/.test(recipientName)) {
    errors.recipientName = "Remove markup characters.";
  }

  let imageUrls: string[] = [];

  try {
    imageUrls = sanitizeImageUrls(parseImageUrlText(imageUrlsText));
  } catch {
    errors.imageUrls = "Use HTTPS image links, one per line.";
  }

  return { errors, imageUrls };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function previewCopyFor(
  vibe: PresentationVibe,
  compromise: CompromiseLevel,
  recipientName: string,
) {
  if (compromise === "objective") {
    return {
      title: `${recipientName}, documented clearly.`,
      body:
        vibe === "sincere"
          ? "Warm slides with just enough proof."
          : "A clean deck with measured affection.",
    };
  }

  if (compromise === "unwell") {
    return {
      title: `${recipientName}, this got serious.`,
      body:
        vibe === "chaos"
          ? "High drama. Zero chill. Fully intentional."
          : "Affection under obvious emotional pressure.",
    };
  }

  if (compromise === "suspicious") {
    return {
      title: `${recipientName}, something is happening.`,
      body: "Slightly too much evidence, presented nicely.",
    };
  }

  return {
    title: `${recipientName}, the case is strong.`,
    body:
      vibe === "boardroom"
        ? "Polished enough to look official."
        : "A soft roast with a real ending.",
  };
}
