import type { Metadata } from "next";
import { PublicLoveSite } from "@/components/love/public-site";
import "../love-public.css";

export const metadata: Metadata = {
  title: "Prototype | Love Presentation",
  description:
    "A Vercel-inspired public prototype for funny private love presentation links.",
};

export default function PrototypePage() {
  return <PublicLoveSite />;
}
