import { activeLogoFile, dataUri } from "@/lib/logo-file";

// The favicon follows the active theme's logo.
export const size = { width: 512, height: 512 };
export const contentType = "image/svg+xml";

export default async function Icon() {
  const logo = await activeLogoFile();
  // Uploaded logos may be PNG/JPG; wrap them in an SVG so the type is constant.
  const body =
    logo.mime === "image/svg+xml"
      ? logo.bytes
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><image href="${dataUri(logo)}" width="512" height="512" preserveAspectRatio="xMidYMid slice"/></svg>`;
  return new Response(body, { headers: { "Content-Type": contentType } });
}
