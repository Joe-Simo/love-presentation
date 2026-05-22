"use client";

/* eslint-disable @next/next/no-img-element */

import { gsap } from "gsap";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  LinkIcon,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressLabel,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { PublicPresentation } from "@/lib/love/types";
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

  if (!slide) {
    return null;
  }

  return (
    <section
      className={cn(
        "relative isolate min-h-[680px] overflow-hidden rounded-lg border bg-[#f8f4ec]",
        shared && "min-h-dvh rounded-none border-0",
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
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-md bg-background/80">
            {presentation.senderName} for {presentation.recipientName}
          </Badge>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
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
                      "w-6 border-[#171714] bg-[#171714] sm:w-7",
                  )}
                />
              ))}
            </div>
            <span className="flex items-center gap-1.5">
              <LinkIcon data-icon="inline-start" />
              Hash link
            </span>
          </div>
        </div>

        <div
          ref={slideRef}
          className="grid flex-1 items-center gap-7 py-6 sm:py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.62fr)] xl:gap-12"
        >
          <article className="max-w-3xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-[#b94735]">
              {slide.kicker}
            </p>
            <h1
              className={cn(
                "max-w-[12ch] text-balance text-4xl font-semibold leading-[0.94] tracking-normal text-[#171714] sm:text-5xl xl:text-6xl",
                shared && "sm:text-6xl xl:text-7xl",
              )}
            >
              {slide.title}
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-[#4d4c47] sm:text-lg">
              {slide.body}
            </p>
            <p className="mt-7 inline-flex max-w-xl items-center gap-1.5 rounded-md border bg-[#fffdf8]/90 px-3 py-2 text-sm font-medium text-[#171714] shadow-sm">
              <BadgeCheckIcon data-icon="inline-start" />
              {slide.verdict}
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
                  <span>{slide.kicker}</span>
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
                    <span className="text-[#fffdf8]/60">chemistry</span>
                    <span>validated</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/15 pt-2">
                    <span className="text-[#fffdf8]/60">drama</span>
                    <span>tasteful</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-[#fffdf8]/88 p-3 shadow-sm backdrop-blur">
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
        </div>
      </div>
    </section>
  );
}
