"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PresentationPlayer } from "@/components/love/presentation-player";
import {
  decodeSharePayload,
  presentationFromPayload,
} from "@/lib/love/share";
import type { PublicPresentation } from "@/lib/love/types";

export function SharedPresentation() {
  const [presentation, setPresentation] = useState<PublicPresentation | null>(
    null,
  );
  const [hasReadHash, setHasReadHash] = useState(false);

  useEffect(() => {
    const readHash = () => {
      const token = window.location.hash.slice(1);
      const payload = decodeSharePayload(token);

      setPresentation(payload ? presentationFromPayload(payload) : null);
      setHasReadHash(true);
    };

    readHash();
    window.addEventListener("hashchange", readHash);

    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  if (!hasReadHash) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-center">
        <p className="text-copy-14 text-muted-foreground">Opening presentation...</p>
      </main>
    );
  }

  if (!presentation) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-center">
        <div className="material-medium w-full max-w-sm p-5">
          <h1 className="text-heading-20">This deck is gone</h1>
          <p className="text-copy-14 mt-2 text-pretty text-muted-foreground">
            This deck link is incomplete or broken.
          </p>
          <Button className="mt-5" nativeButton={false} render={<Link href="/" />}>
            Make a new one
          </Button>
        </div>
      </main>
    );
  }

  return <PresentationPlayer presentation={presentation} shared />;
}
