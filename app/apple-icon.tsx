import { ImageResponse } from "next/og";
import { activeLogoFile, dataUri } from "@/lib/logo-file";

// Home-screen icon (iOS needs a PNG), rendered from the active logo.
// Follows the live theme, refreshed with the rest of the site.
export const revalidate = 900;
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  let logo = await activeLogoFile();
  // The renderer can't read GIF/WebP uploads; use the theme's default logo instead.
  if (logo.mime === "image/gif" || logo.mime === "image/webp") logo = await activeLogoFile({ defaultOnly: true });
  return new ImageResponse(<img src={dataUri(logo)} width={180} height={180} alt="" />, size);
}
