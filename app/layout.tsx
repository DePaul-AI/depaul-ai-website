import type { Metadata, Viewport } from "next";
import { site } from "@/lib/content";
import { THEMES } from "@/themes";
import { fontVariables } from "./fonts";
// The brand typeface. The logo and the "DePaul AI" wordmark are always Open Sauce.
import "@fontsource/open-sauce-sans/700.css";
import "./globals.css";
import "@/themes/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://depaulai.org"),
  title: "DePaul AI",
  description: site.hero.tagline,
  openGraph: {
    title: "DePaul AI",
    description: site.hero.tagline,
  },
};

export const viewport: Viewport = {
  themeColor: THEMES[site.theme].background,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme={site.theme} className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
