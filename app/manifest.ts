import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content/live";
import { THEMES } from "@/themes";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { site } = await getContent();
  const bg = THEMES[site.theme].background;
  return {
    name: "DePaul AI",
    short_name: "DePaul AI",
    description: site.hero.tagline,
    start_url: "/",
    display: "standalone",
    background_color: bg,
    theme_color: bg,
    icons: [
      { src: "/icon", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
