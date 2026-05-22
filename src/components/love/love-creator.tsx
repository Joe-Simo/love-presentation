"use client";

import {
  ArrowUpRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  HeartHandshakeIcon,
  ImageIcon,
  LinkIcon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MAX_IMAGE_URLS } from "@/lib/love/config";
import { createSlides, VIBE_OPTIONS } from "@/lib/love/phrases";
import {
  createSharePayload,
  encodeSharePayload,
  presentationFromPayload,
  sanitizeImageUrls,
} from "@/lib/love/share";
import type {
  PresentationAsset,
  PresentationVibe,
  PublicPresentation,
} from "@/lib/love/types";
import { PresentationPlayer } from "@/components/love/presentation-player";

type ShareState = {
  shareUrl: string;
  presentation: PublicPresentation;
};

export function LoveCreator() {
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [vibe, setVibe] = useState<PresentationVibe>("boardroom");
  const [imageUrls, setImageUrls] = useState([""]);
  const [share, setShare] = useState<ShareState | null>(null);
  const [previewCreatedAt] = useState(() => new Date());

  const previewImageUrls = useMemo(() => {
    try {
      return sanitizeImageUrls(imageUrls);
    } catch {
      return imageUrls
        .map((url) => url.trim())
        .filter((url) => url.startsWith("https://"))
        .slice(0, MAX_IMAGE_URLS);
    }
  }, [imageUrls]);

  const previewAssets: PresentationAsset[] = useMemo(
    () =>
      previewImageUrls.map((url, index) => ({
        id: `preview-${index}`,
        url,
        width: 1200,
        height: 1500,
      })),
    [previewImageUrls],
  );

  const previewPresentation = useMemo<PublicPresentation>(() => {
    const sender = senderName.trim() || "Sender";
    const recipient = recipientName.trim() || "Recipient";
    const seed = `${sender}:${recipient}:${vibe}:${previewImageUrls.join(",")}`;

    return {
      id: "preview",
      senderName: sender,
      recipientName: recipient,
      vibe,
      seed,
      createdAt: previewCreatedAt.toISOString(),
      assets: previewAssets,
      slides: createSlides({
        senderName: sender,
        recipientName: recipient,
        vibe,
        seed,
        assets: previewAssets,
      }),
    };
  }, [
    previewAssets,
    previewCreatedAt,
    previewImageUrls,
    recipientName,
    senderName,
    vibe,
  ]);

  function setImageUrl(index: number, value: string) {
    setImageUrls((current) =>
      current.map((url, currentIndex) =>
        currentIndex === index ? value : url,
      ),
    );
    setShare(null);
  }

  function addImageUrl() {
    setImageUrls((current) =>
      current.length >= MAX_IMAGE_URLS ? current : [...current, ""],
    );
  }

  function removeImageUrl(index: number) {
    setImageUrls((current) => {
      const next = current.filter((_, currentIndex) => currentIndex !== index);
      return next.length > 0 ? next : [""];
    });
    setShare(null);
  }

  function createPresentation() {
    try {
      const payload = createSharePayload({
        senderName,
        recipientName,
        vibe,
        imageUrls,
        seed: crypto.randomUUID(),
      });
      const token = encodeSharePayload(payload);
      const shareUrl = new URL("/p", window.location.origin);
      shareUrl.hash = token;

      setShare({
        shareUrl: shareUrl.toString(),
        presentation: presentationFromPayload(payload),
      });
      toast.success("Private link created.");
    } catch {
      toast.error("Use names and optional HTTPS image URLs only.");
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

  const usedImageUrls = imageUrls.filter((url) => url.trim().length > 0).length;
  const canCreate =
    senderName.trim().length > 0 && recipientName.trim().length > 0;
  const activePresentation = share?.presentation ?? previewPresentation;

  return (
    <main className="min-h-dvh bg-[#f4f1ea] text-[#171714]">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 pb-5 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 -mx-4 border-b bg-[#f4f1ea]/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <a
              href="#builder"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] sm:text-sm sm:tracking-[0.18em]"
            >
              <HeartHandshakeIcon data-icon="inline-start" />
              Love Presentation
            </a>
            <nav className="grid grid-cols-3 rounded-lg border bg-[#fffdf8]/80 p-1 text-sm shadow-sm sm:flex sm:items-center sm:gap-1">
              <a
                href="#builder"
                className="rounded-md px-3 py-1.5 text-center text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                Build
              </a>
              <a
                href="#preview"
                className="rounded-md px-3 py-1.5 text-center text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                Preview
              </a>
              <a
                href="#share"
                className="rounded-md px-3 py-1.5 text-center text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                Share
              </a>
            </nav>
          </div>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(320px,430px)_minmax(0,1fr)]">
          <section
            id="builder"
            className="scroll-mt-28 overflow-hidden rounded-lg border bg-[#fffdf8] shadow-[0_24px_80px_rgba(22,20,17,0.08)] lg:sticky lg:top-[76px]"
          >
            <div className="border-b p-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#b94735]">
                Creator
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-[0.95] tracking-normal">
                Build the case.
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                No account. No uploads. Just names, a tone, optional image URLs,
                and one private hash link.
              </p>
            </div>

            <div className="p-5">
              <FieldGroup>
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="senderName">Names</FieldLabel>
                    <span className="text-xs text-muted-foreground">
                      {senderName.trim().length > 0 &&
                      recipientName.trim().length > 0
                        ? "Ready"
                        : "Required"}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <Input
                      id="senderName"
                      value={senderName}
                      onChange={(event) => {
                        setSenderName(event.target.value);
                        setShare(null);
                      }}
                      maxLength={48}
                      placeholder="Sender"
                      className="h-11 bg-background"
                    />
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={(event) => {
                        setRecipientName(event.target.value);
                        setShare(null);
                      }}
                      maxLength={48}
                      placeholder="Recipient"
                      className="h-11 bg-background"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel>Presentation energy</FieldLabel>
                  <div className="grid gap-2">
                    {VIBE_OPTIONS.map((option, index) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={vibe === option.value ? "default" : "outline"}
                        aria-pressed={vibe === option.value}
                        className="h-auto justify-start whitespace-normal py-3 text-left"
                        onClick={() => {
                          setVibe(option.value);
                          setShare(null);
                        }}
                      >
                        <span className="mr-1 flex size-6 shrink-0 items-center justify-center rounded-md border border-current/20 text-xs tabular-nums">
                          {index + 1}
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span>{option.label}</span>
                          <span className="text-xs font-normal opacity-70">
                            {option.description}
                          </span>
                        </span>
                      </Button>
                    ))}
                  </div>
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Image URLs</FieldLabel>
                    <span className="text-xs text-muted-foreground">
                      {usedImageUrls}/{MAX_IMAGE_URLS}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="url"
                          value={url}
                          onChange={(event) =>
                            setImageUrl(index, event.target.value)
                          }
                          placeholder="https://example.com/photo.jpg"
                          className="h-10 bg-background"
                        />
                        {imageUrls.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-lg"
                            aria-label="Remove image URL"
                            onClick={() => removeImageUrl(index)}
                          >
                            <XIcon />
                          </Button>
                        )}
                      </div>
                    ))}
                    {imageUrls.length < MAX_IMAGE_URLS && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addImageUrl}
                        className="w-full"
                      >
                        <PlusIcon data-icon="inline-start" />
                        Add image URL
                      </Button>
                    )}
                  </div>
                  <FieldDescription>
                    Optional HTTPS images appear as evidence slides.
                  </FieldDescription>
                </Field>

                <Separator />

                <div id="share" className="flex scroll-mt-28 flex-col gap-3">
                  <Button
                    disabled={!canCreate}
                    onClick={createPresentation}
                    className="h-11 w-full"
                  >
                    <LinkIcon data-icon="inline-start" />
                    Create private link
                  </Button>

                  {share ? (
                    <div className="flex flex-col gap-3 border-t pt-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Share link ready</p>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#dff2e6] px-2 py-1 text-xs font-medium text-[#1f5b37]">
                          <SparklesIcon data-icon="inline-start" />
                          Private hash
                        </span>
                      </div>
                      <p className="truncate rounded-md border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
                        {share.shareUrl}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" onClick={copyShareLink}>
                          <CopyIcon data-icon="inline-start" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            window.open(
                              share.shareUrl,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          <ExternalLinkIcon data-icon="inline-start" />
                          Open
                        </Button>
                        <Button variant="outline" onClick={() => setShare(null)}>
                          <RotateCcwIcon data-icon="inline-start" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-2">
                        <ImageIcon data-icon="inline-start" />
                        URL images only
                      </span>
                      <span className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-2">
                        <ArrowUpRightIcon data-icon="inline-start" />
                        Opens at /p#
                      </span>
                    </div>
                  )}
                </div>
              </FieldGroup>
            </div>
          </section>

          <section id="preview" className="min-w-0 scroll-mt-28">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-sm font-medium">Live deck</p>
                <p className="text-xs text-muted-foreground">
                  {activePresentation.slides.length} slides generated locally
                </p>
              </div>
              <a
                href="#builder"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
              >
                Edit
              </a>
            </div>
            <PresentationPlayer
              presentation={activePresentation}
              className="shadow-[0_30px_100px_rgba(22,20,17,0.12)]"
            />
          </section>
        </div>
      </div>
    </main>
  );
}
