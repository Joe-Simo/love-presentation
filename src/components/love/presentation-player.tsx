"use client";

/* eslint-disable @next/next/no-img-element */

import { gsap } from "gsap";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  LinkIcon,
  SparklesIcon,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressLabel,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { createLoveMetrics } from "@/lib/love/metrics";
import { firstGrapheme } from "@/lib/love/text";
import type { LoveSlide, PublicPresentation } from "@/lib/love/types";
import { DeckScene } from "@/components/love/deck-scene";

type PresentationPlayerProps = {
  presentation: PublicPresentation;
  className?: string;
  shared?: boolean;
};

export function PresentationPlayer({
  presentation,
  className,
  shared = false,
}: PresentationPlayerProps) {
  return (
    <PresentationPlayerDeck
      key={presentation.id}
      presentation={presentation}
      className={className}
      shared={shared}
    />
  );
}

function PresentationPlayerDeck({
  presentation,
  className,
  shared = false,
}: PresentationPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [worseLevel, setWorseLevel] = useState(0);
  const [imageLoadAttempts, setImageLoadAttempts] = useState<
    Record<string, 0 | 1 | 2>
  >({});
  const [loadedImageKeys, setLoadedImageKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const slideRef = useRef<HTMLDivElement>(null);
  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(presentation.slides.length - 1, 0),
  );
  const slide = presentation.slides[safeActiveIndex] ?? presentation.slides[0];
  const image = slide?.imageAssetId
    ? presentation.assets.find((asset) => asset.id === slide.imageAssetId)
    : undefined;
  const imageLoadAttempt = image ? imageLoadAttempts[image.id] ?? 0 : 0;
  const visibleImage = image && imageLoadAttempt < 2 ? image : undefined;
  const imageLoadKey = visibleImage
    ? `${visibleImage.id}-${imageLoadAttempt}`
    : "";
  const imageLoaded = imageLoadKey ? loadedImageKeys.has(imageLoadKey) : false;
  const senderInitial = firstGrapheme(presentation.senderName);
  const recipientInitial = firstGrapheme(presentation.recipientName);
  const slideProgress =
    presentation.slides.length > 1
      ? (safeActiveIndex / (presentation.slides.length - 1)) * 100
      : 100;
  const progressMax = Math.max(presentation.slides.length, 1);
  const progressValue = Math.min(safeActiveIndex + 1, progressMax);
  const progressPercent = Math.round((progressValue / progressMax) * 100);
  const objectivity = Math.max(0, Math.round(100 - slideProgress));
  const metrics = createLoveMetrics(
    presentation.senderName,
    presentation.recipientName,
  );
  const displaySlide = slide
    ? intensifySlide(slide, worseLevel, presentation, safeActiveIndex)
    : null;
  const isFinalSlide = safeActiveIndex === presentation.slides.length - 1;

  useLayoutEffect(() => {
    const target = slideRef.current;
    if (!target) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const animation = gsap.fromTo(
      target,
      { autoAlpha: 0, y: 18, rotateX: 2 },
      { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.55, ease: "power3.out" },
    );

    return () => {
      animation.kill();
    };
  }, [presentation.id, safeActiveIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;

      if (isInteractiveKeyTarget(target)) {
        return;
      }

      if (event.key === " " || event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((current) =>
          Math.min(presentation.slides.length - 1, current + 1),
        );
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((current) => Math.max(0, current - 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [presentation.slides.length]);

  useEffect(() => {
    if (!visibleImage || imageLoaded) return;

    const timeout = window.setTimeout(() => {
      setImageLoadAttempts((current) => {
        const currentAttempt = current[visibleImage.id] ?? 0;

        if (currentAttempt !== imageLoadAttempt) {
          return current;
        }

        return {
          ...current,
          [visibleImage.id]: imageLoadAttempt === 0 ? 1 : 2,
        };
      });
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [imageLoadAttempt, imageLoaded, visibleImage]);

  if (!slide || !displaySlide) {
    return null;
  }

  return (
    <section
      className={cn(
        "material-medium relative isolate border bg-background",
        shared
          ? "min-h-dvh overflow-x-hidden overflow-y-auto rounded-none border-0"
          : "min-h-[680px] overflow-hidden",
        className,
      )}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {`Slide ${safeActiveIndex + 1} of ${presentation.slides.length}: ${
          displaySlide.title
        }${worseLevel > 0 ? ` — intensity ${worseLevel}` : ""}`}
      </p>
      <div className="absolute inset-0 opacity-70">
        <DeckScene
          activeIndex={safeActiveIndex}
          total={presentation.slides.length}
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_0%,rgba(255,255,255,0.96)_37%,rgba(255,255,255,0.34)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0))]" />

      <div
        className={cn(
          "relative z-10 flex min-h-[inherit] flex-col justify-between p-3 sm:p-7",
          shared && "pb-28 sm:pb-7",
        )}
      >
        {isFinalSlide ? <FinalConfetti /> : null}
        <div className="text-label-13 grid gap-3 text-muted-foreground sm:flex sm:items-center sm:justify-between">
          <Badge variant="outline" className="max-w-full bg-background/80">
            {presentation.senderName} for {presentation.recipientName}
          </Badge>
          <div className="flex min-w-0 items-center justify-between gap-3 sm:flex-none sm:justify-end">
            <div className="flex w-full items-center justify-between gap-1 sm:w-auto sm:justify-end sm:gap-1.5">
              {presentation.slides.map((currentSlide, index) => (
                <button
                  key={currentSlide.id}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={safeActiveIndex === index ? "step" : undefined}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "grid size-7 place-items-center rounded-[var(--radius-geist-base)] border border-transparent text-foreground transition-[background-color,border-color,box-shadow] focus-geist hover:border-border hover:bg-muted sm:size-8",
                    safeActiveIndex === index && "border-border bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "block h-2 w-2 rounded-full border border-foreground/25 bg-background transition-[width,background-color,border-color]",
                      safeActiveIndex === index &&
                        "w-4 border-foreground bg-foreground sm:w-5",
                    )}
                  />
                </button>
              ))}
            </div>
            <span className="hidden items-center gap-1.5 sm:flex">
              <LinkIcon data-icon="inline-start" />
              Shared deck
            </span>
          </div>
        </div>

        <div
          ref={slideRef}
          className="grid flex-1 items-center gap-4 py-4 sm:gap-7 sm:py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.62fr)] xl:gap-12"
        >
          <article className="min-w-0 max-w-3xl">
            <p className="text-label-12 mb-4 uppercase text-muted-foreground">
              {displaySlide.kicker}
            </p>
            <h1
              className={cn(
                "max-w-[14ch] [overflow-wrap:anywhere] text-balance text-4xl font-semibold leading-[0.98] tracking-normal text-foreground sm:max-w-[12ch] sm:text-5xl sm:leading-[0.94] xl:text-6xl",
                shared && "sm:text-6xl xl:text-7xl",
              )}
            >
              {displaySlide.title}
            </h1>
            <p className="text-copy-16 mt-6 max-w-xl whitespace-pre-line text-pretty text-muted-foreground">
              {displaySlide.body}
            </p>
            <p className="text-label-14 mt-7 inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-[var(--radius-geist-base)] border bg-background/90 px-3 py-2 text-foreground shadow-sm sm:max-w-xl">
              <BadgeCheckIcon data-icon="inline-start" />
              {displaySlide.verdict}
            </p>
          </article>

          <div className="relative min-h-[250px]">
            {visibleImage ? (
              <div className="material-medium relative mx-auto aspect-[4/5] w-full max-w-[240px] overflow-hidden bg-background sm:ml-auto sm:max-w-[320px] 2xl:max-w-[380px]">
                {!imageLoaded ? (
                  <div className="text-label-13 absolute inset-0 z-10 grid place-items-center bg-background text-muted-foreground">
                    Loading photo...
                  </div>
                ) : null}
                <img
                  key={imageLoadKey}
                  src={visibleImage.url}
                  alt={`Photo evidence for ${presentation.recipientName}`}
                  className={cn(
                    "size-full object-cover transition-opacity",
                    imageLoaded ? "opacity-100" : "opacity-0",
                  )}
                  decoding="async"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setImageLoadAttempts((current) => ({
                      ...current,
                      [visibleImage.id]: imageLoadAttempt === 0 ? 1 : 2,
                    }))
                  }
                  onLoad={(event) => {
                    if (
                      event.currentTarget.naturalWidth === 0 ||
                      event.currentTarget.naturalHeight === 0
                    ) {
                      setImageLoadAttempts((current) => ({
                        ...current,
                        [visibleImage.id]: imageLoadAttempt === 0 ? 1 : 2,
                      }));
                      return;
                    }

                    setLoadedImageKeys((current) => {
                      const next = new Set(current);
                      next.add(imageLoadKey);
                      return next;
                    });
                  }}
                />
              </div>
            ) : (
              <div className="mx-auto flex aspect-[4/5] w-full max-w-[240px] flex-col justify-between overflow-hidden rounded-[var(--radius-geist-raised)] border border-border bg-foreground p-5 text-background shadow-[var(--geist-shadow-medium)] sm:ml-auto sm:max-w-[320px] 2xl:max-w-[380px]">
                <div className="text-label-12 flex items-center justify-between uppercase text-background/60">
                  <span>LP-01</span>
                  <span>{displaySlide.kicker}</span>
                </div>
                <div className="text-center">
                  <p className="text-[4.5rem] font-semibold leading-none tracking-normal sm:text-[6rem]">
                    {senderInitial}
                    <span className="text-background/70">+</span>
                    {recipientInitial}
                  </p>
                  <p className="text-copy-14 mt-3 text-background/70">
                    compatibility memo
                  </p>
                </div>
                <div className="text-copy-14 grid gap-2">
                  <div className="flex items-center justify-between border-t border-white/15 pt-2">
                    <span className="text-background/60">compatibility</span>
                    <span>{metrics.compatibility}%</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/15 pt-2">
                    <span className="text-background/60">leaving</span>
                    <span>{metrics.leavingRecommendation}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "material-small bg-background/88 p-2.5 backdrop-blur sm:p-3",
            shared &&
              "fixed inset-x-3 bottom-3 z-20 sm:sticky sm:inset-x-auto sm:bottom-3",
          )}
        >
          <div className="love-objectivity-meter">
            <span>Objectivity</span>
            <div aria-hidden="true">
              <i style={{ width: `${objectivity}%` }} />
            </div>
            <strong>{objectivity}%</strong>
          </div>

          <Progress
            value={progressValue}
            max={progressMax}
            aria-label="Slide progress"
          >
            <ProgressLabel>
              Slide {safeActiveIndex + 1} of {presentation.slides.length}
            </ProgressLabel>
            <span className="text-label-14 ml-auto text-muted-foreground tabular-nums">
              {progressPercent}%
            </span>
          </Progress>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
            <Button
              className="justify-self-start"
              variant="outline"
              onClick={() => setActiveIndex(Math.max(0, safeActiveIndex - 1))}
              disabled={safeActiveIndex === 0}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Back
            </Button>
            <Button
              className="justify-self-center px-2 sm:px-2.5"
              variant="outline"
              onClick={() =>
                setWorseLevel((current) => Math.min(current + 1, 5))
              }
            >
              <SparklesIcon data-icon="inline-start" />
              Make it worse
            </Button>
            <Button
              className="justify-self-end"
              onClick={() =>
                setActiveIndex(
                  Math.min(presentation.slides.length - 1, safeActiveIndex + 1),
                )
              }
              disabled={safeActiveIndex === presentation.slides.length - 1}
            >
              Next
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
          {worseLevel >= 5 ? (
            <p className="text-label-12 mt-2 text-center text-destructive">
              Legal has asked us to stop.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function intensifySlide(
  slide: LoveSlide,
  worseLevel: number,
  presentation: PublicPresentation,
  activeIndex: number,
): LoveSlide {
  if (worseLevel <= 0) {
    return slide;
  }

  const additions = [
    "The chemistry is becoming difficult to ignore.",
    "The committee is no longer emotionally stable.",
    "This presentation has stopped being objective and started being a cry for help.",
    "Legal has asked us to stop, which the presenter has interpreted as encouragement.",
    "The room is now taking deep breaths and still voting yes.",
  ];
  const level = Math.min(worseLevel, additions.length);
  const isFinalSlide = activeIndex === presentation.slides.length - 1;

  return {
    ...slide,
    title:
      level >= 3 && isFinalSlide
        ? "Final ruling. Nobody is handling this well."
        : slide.title,
    body: [slide.body, ...additions.slice(0, level)].join("\n\n"),
    verdict:
      level >= 4
        ? "Verdict: approved, unfortunately, dramatically."
        : slide.verdict,
  };
}

function isInteractiveKeyTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      [
        "a",
        "button",
        "input",
        "textarea",
        "select",
        "summary",
        "[contenteditable='true']",
        "[role='button']",
        "[role='link']",
        "[role='menuitem']",
      ].join(","),
    ),
  );
}

function FinalConfetti() {
  return (
    <div className="love-final-confetti" aria-hidden="true">
      {Array.from({ length: 10 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
