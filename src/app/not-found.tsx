import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md rounded-lg border bg-card p-5 shadow-sm">
        <h1 className="text-xl font-semibold">Deck not found.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That link does not point to a deck we can open.
        </p>
        <Button className="mt-5" render={<Link href="/" />}>
          Make a new one
        </Button>
      </div>
    </main>
  );
}
