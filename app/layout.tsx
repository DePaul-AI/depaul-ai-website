import type { Metadata, Viewport } from "next";
import { site } from "@/lib/content";
import { THEMES, themeStyle } from "@/lib/themes";
import { fontVariables } from "./fonts";
import "./globals.css";
import "./themes/fall.css";
import "./themes/winter.css";
import "./themes/spring.css";

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
  themeColor: THEMES[site.theme].tokens.bg,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme={site.theme} style={themeStyle(site.theme)} className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
