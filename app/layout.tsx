import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/lib/content";
import { THEMES, themeStyle } from "@/lib/themes";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://depaulai.org"),
  title: "DePaul AI",
  description: site.hero.tagline,
  openGraph: {
    title: "DePaul AI",
    description: site.hero.tagline,
    images: ["/dai-logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: THEMES[site.theme].tokens.bg,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme={site.theme}
      style={themeStyle(site.theme)}
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
