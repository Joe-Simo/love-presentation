"use client";

import {
  CopyIcon,
  ExternalLinkIcon,
  LinkIcon,
  PlusIcon,
  RotateCcwIcon,
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

  return (
    <main className="min-h-dvh bg-[#fbfbf8] text-[#171714]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="border-b pb-4">
          <div>
            <p className="text-xl font-semibold leading-none">Love Presentation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Funny share links with optional image URLs and no upload storage.
            </p>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
          <section className="rounded-lg border bg-background p-4 shadow-sm">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="senderName">Sender</FieldLabel>
                <Input
                  id="senderName"
                  value={senderName}
                  onChange={(event) => {
                    setSenderName(event.target.value);
                    setShare(null);
                  }}
                  maxLength={48}
                  placeholder="Your name"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="recipientName">Recipient</FieldLabel>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(event) => {
                    setRecipientName(event.target.value);
                    setShare(null);
                  }}
                  maxLength={48}
                  placeholder="Their name"
                />
              </Field>

              <Field>
                <FieldLabel>Presentation energy</FieldLabel>
                <div className="grid gap-2">
                  {VIBE_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={vibe === option.value ? "default" : "outline"}
                      className="h-auto justify-start whitespace-normal py-2 text-left"
                      onClick={() => {
                        setVibe(option.value);
                        setShare(null);
                      }}
                    >
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
                <FieldLabel>Image URLs</FieldLabel>
                <div className="grid gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="url"
                        value={url}
                        onChange={(event) => setImageUrl(index, event.target.value)}
                        placeholder="https://example.com/photo.jpg"
                      />
                      {imageUrls.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
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
                  {usedImageUrls}/{MAX_IMAGE_URLS} optional HTTPS image URLs.
                </FieldDescription>
              </Field>

              <Separator />

              <Button
                disabled={!canCreate}
                onClick={createPresentation}
                className="h-10 w-full"
              >
                <LinkIcon data-icon="inline-start" />
                Create private link
              </Button>

              {share && (
                <div className="flex flex-col gap-3 rounded-lg border bg-[#f7f7f4] p-3">
                  <p className="break-all text-sm font-medium">{share.shareUrl}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={copyShareLink}>
                      <CopyIcon data-icon="inline-start" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(share.shareUrl, "_blank", "noopener,noreferrer")
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
              )}
            </FieldGroup>
          </section>

          <PresentationPlayer
            presentation={share?.presentation ?? previewPresentation}
            className="shadow-sm"
          />
        </div>
      </div>
    </main>
  );
}
