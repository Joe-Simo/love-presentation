"use client";

/* eslint-disable @next/next/no-img-element */

import { gsap } from "gsap";
import { ArrowLeftIcon, ArrowRightIcon, LinkIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
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

  if (!slide) {
    return null;
  }

  return (
    <section
      className={cn(
        "relative isolate min-h-[560px] overflow-hidden rounded-lg border bg-[#f7f7f4]",
        shared && "min-h-dvh rounded-none border-0",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-95">
        <DeckScene
          activeIndex={safeActiveIndex}
          total={presentation.slides.length}
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#f7f7f4_0%,rgba(247,247,244,0.92)_34%,rgba(247,247,244,0.16)_100%)]" />

      <div className="relative z-10 flex min-h-[inherit] flex-col justify-between p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-md bg-background/80">
            {presentation.senderName} for {presentation.recipientName}
          </Badge>
          <span className="flex items-center gap-1.5">
            <LinkIcon data-icon="inline-start" />
            No upload storage
          </span>
        </div>

        <div
          ref={slideRef}
          className="my-10 grid max-w-5xl items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(280px,0.72fr)]"
        >
          <article className="max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase text-[#c44b37]">
              {slide.kicker}
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-[0.96] tracking-normal text-[#171714] sm:text-6xl lg:text-7xl">
              {slide.title}
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-[#4d4c47] sm:text-lg">
              {slide.body}
            </p>
            <p className="mt-7 inline-flex max-w-xl rounded-md border bg-background/85 px-3 py-2 text-sm font-medium text-[#171714] shadow-sm">
              {slide.verdict}
            </p>
          </article>

          <div className="relative min-h-[250px]">
            {visibleImage ? (
              <div className="relative aspect-[4/5] max-h-[430px] overflow-hidden rounded-lg border bg-background shadow-sm">
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
              <div className="flex aspect-[4/5] max-h-[430px] items-center justify-center rounded-lg border bg-background/55 p-6 text-center text-sm text-muted-foreground shadow-sm">
                The evidence board is warming up.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Progress value={progress}>
            <ProgressLabel>
              Slide {safeActiveIndex + 1} of {presentation.slides.length}
            </ProgressLabel>
            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
              {Math.round(progress)}%
            </span>
          </Progress>

          <div className="flex items-center justify-between gap-3">
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
