import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lovepresentation.com"),
  title: "Love Presentation",
  description:
    "Emotionally compromised presentation software for private love slideshow links.",
  openGraph: {
    title: "Love Presentation",
    description:
      "Emotionally compromised presentation software for private love slideshow links.",
    url: "https://lovepresentation.com",
    siteName: "Love Presentation",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
