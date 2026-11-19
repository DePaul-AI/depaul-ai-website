import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { THEMES } from "@/themes";

export default function manifest(): MetadataRoute.Manifest {
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
