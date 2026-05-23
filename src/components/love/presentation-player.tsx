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
  const [failedImageIds, setFailedImageIds] = useState<ReadonlySet<string>>(
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
  const visibleImage = image && !failedImageIds.has(image.id) ? image : undefined;
  const senderInitial = presentation.senderName.slice(0, 1).toUpperCase();
  const recipientInitial = presentation.recipientName.slice(0, 1).toUpperCase();
  const progress =
    presentation.slides.length > 1
      ? (safeActiveIndex / (presentation.slides.length - 1)) * 100
      : 100;
  const objectivity = Math.max(0, Math.round(100 - progress));
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
      const tagName =
        target instanceof HTMLElement ? target.tagName.toLowerCase() : "";

      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
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

  if (!slide || !displaySlide) {
    return null;
  }

  return (
    <section
      className={cn(
        "relative isolate rounded-lg border bg-[#f8f4ec]",
        shared
          ? "min-h-dvh overflow-x-hidden overflow-y-auto rounded-none border-0"
          : "min-h-[680px] overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-70">
        <DeckScene
          activeIndex={safeActiveIndex}
          total={presentation.slides.length}
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#f8f4ec_0%,rgba(248,244,236,0.96)_37%,rgba(248,244,236,0.36)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,253,248,0.95),rgba(255,253,248,0))]" />

      <div className="relative z-10 flex min-h-[inherit] flex-col justify-between p-4 sm:p-7">
        {isFinalSlide ? <FinalConfetti /> : null}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-md bg-background/80">
            {presentation.senderName} for {presentation.recipientName}
          </Badge>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3 sm:flex-none">
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {presentation.slides.map((currentSlide, index) => (
                <button
                  key={currentSlide.id}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={safeActiveIndex === index ? "step" : undefined}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "size-2 rounded-full border border-[#171714]/25 bg-background transition-all sm:size-2.5",
                    safeActiveIndex === index &&
                      "w-5 border-[#171714] bg-[#171714] sm:w-7",
                  )}
                />
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
          className="grid flex-1 items-center gap-5 py-5 sm:gap-7 sm:py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.62fr)] xl:gap-12"
        >
          <article className="min-w-0 max-w-3xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-[#b94735]">
              {displaySlide.kicker}
            </p>
            <h1
              className={cn(
                "max-w-[14ch] [overflow-wrap:anywhere] text-balance text-4xl font-semibold leading-[0.98] tracking-normal text-[#171714] sm:max-w-[12ch] sm:text-5xl sm:leading-[0.94] xl:text-6xl",
                shared && "sm:text-6xl xl:text-7xl",
              )}
            >
              {displaySlide.title}
            </h1>
            <p className="mt-6 max-w-xl whitespace-pre-line text-pretty text-base leading-7 text-[#4d4c47] sm:text-lg">
              {displaySlide.body}
            </p>
            <p className="mt-7 inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-md border bg-[#fffdf8]/90 px-3 py-2 text-sm font-medium text-[#171714] shadow-sm sm:max-w-xl">
              <BadgeCheckIcon data-icon="inline-start" />
              {displaySlide.verdict}
            </p>
          </article>

          <div className="relative min-h-[250px]">
            {visibleImage ? (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-lg border bg-background shadow-[0_22px_70px_rgba(22,20,17,0.14)] sm:ml-auto sm:max-w-[360px] xl:max-w-[380px]">
                <img
                  src={visibleImage.url}
                  alt={`Photo evidence for ${presentation.recipientName}`}
                  className="size-full object-cover"
                  decoding="async"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImageIds((current) => {
                      const next = new Set(current);
                      next.add(visibleImage.id);
                      return next;
                    })
                  }
                />
              </div>
            ) : (
              <div className="mx-auto flex aspect-[4/5] w-full max-w-[280px] flex-col justify-between rounded-lg border bg-[#171714] p-5 text-[#fffdf8] shadow-[0_22px_70px_rgba(22,20,17,0.18)] sm:ml-auto sm:max-w-[360px] xl:max-w-[380px]">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[#fffdf8]/60">
                  <span>LP-01</span>
                  <span>{displaySlide.kicker}</span>
                </div>
                <div className="text-center">
                  <p className="text-[4.5rem] font-semibold leading-none tracking-normal sm:text-[6rem]">
                    {senderInitial}
                    <span className="text-[#d95d48]">+</span>
                    {recipientInitial}
                  </p>
                  <p className="mt-3 text-sm text-[#fffdf8]/70">
                    compatibility memo
                  </p>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between border-t border-white/15 pt-2">
                    <span className="text-[#fffdf8]/60">compatibility</span>
                    <span>{metrics.compatibility}%</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/15 pt-2">
                    <span className="text-[#fffdf8]/60">leaving</span>
                    <span>{metrics.leavingRecommendation}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-[#fffdf8]/88 p-3 shadow-sm backdrop-blur">
          <div className="love-objectivity-meter">
            <span>Objectivity</span>
            <div aria-hidden="true">
              <i style={{ width: `${objectivity}%` }} />
            </div>
            <strong>{objectivity}%</strong>
          </div>

          <Progress value={progress}>
            <ProgressLabel>
              Slide {safeActiveIndex + 1} of {presentation.slides.length}
            </ProgressLabel>
            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
              {Math.round(progress)}%
            </span>
          </Progress>

          <div className="mt-3 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setActiveIndex(Math.max(0, safeActiveIndex - 1))}
              disabled={safeActiveIndex === 0}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setWorseLevel((current) => Math.min(current + 1, 5))
              }
            >
              <SparklesIcon data-icon="inline-start" />
              Make it worse
            </Button>
            <Button
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
            <p className="mt-2 text-center text-xs text-[#b94735]">
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

function FinalConfetti() {
  return (
    <div className="love-final-confetti" aria-hidden="true">
      {Array.from({ length: 10 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
