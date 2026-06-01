import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-center">
      <div className="material-medium w-full max-w-sm p-5">
        <h1 className="text-heading-20">Deck not found.</h1>
        <p className="text-copy-14 mt-2 text-pretty text-muted-foreground">
          That link does not point to a deck we can open.
        </p>
        <Button className="mt-5" nativeButton={false} render={<Link href="/" />}>
          Make a new one
        </Button>
      </div>
    </main>
  );
}
