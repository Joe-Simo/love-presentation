import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md rounded-lg border bg-card p-5 shadow-sm">
        <h1 className="text-xl font-semibold">This deck is gone.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It either expired, was deleted, or never existed.
        </p>
        <Button className="mt-5" render={<Link href="/" />}>
          Make a new one
        </Button>
      </div>
    </main>
  );
}
