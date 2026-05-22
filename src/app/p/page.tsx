import type { Metadata } from "next";
import { SharedPresentation } from "@/components/love/shared-presentation";

export const metadata: Metadata = {
  title: "Love Presentation",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SharedPresentationPage() {
  return <SharedPresentation />;
}
