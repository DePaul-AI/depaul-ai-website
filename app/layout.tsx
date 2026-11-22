import type { Metadata, Viewport } from "next";
import { getContent } from "@/lib/content/live";
import { THEMES } from "@/themes";
import { fontVariables } from "./fonts";
// The brand typeface. The logo and the "DePaul AI" wordmark are always Open Sauce.
import "@fontsource/open-sauce-sans/700.css";
import "./globals.css";
import "@/themes/styles.css";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  return {
    metadataBase: new URL(process.env.SITE_URL || "https://depaulai.org"),
    title: "DePaul AI",
    description: site.hero.tagline,
    openGraph: { title: "DePaul AI", description: site.hero.tagline },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { site } = await getContent();
  return { themeColor: THEMES[site.theme].background };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { site } = await getContent();
  return (
    <html lang="en" data-theme={site.theme} className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
