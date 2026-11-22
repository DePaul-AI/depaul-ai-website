import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getContent } from "./content/live";
import { readUpload } from "./content/store";
import { logoFor } from "../themes";

const MIME: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

/**
 * The active logo's bytes (for the favicon and app icon).
 * `defaultOnly` skips a logo uploaded with `/dai logo`.
 */
export async function activeLogoFile({ defaultOnly = false } = {}) {
  const { site } = await getContent();
  const src = logoFor(site.theme, defaultOnly ? {} : site.logos);
  // src is "/uploads/<file>", "/media/<file>" or "/themes/<theme>/<file>".
  // Building paths from fixed folder names keeps the bundler from tracing the
  // whole project.
  const parts = src.split("/").filter(Boolean).map((p) => path.basename(p));
  const mime = MIME[path.extname(src)] ?? "application/octet-stream";
  if (parts[0] === "uploads" || parts[0] === "media") {
    const bytes = await readUpload(parts[1]);
    if (bytes) return { bytes, mime };
    // An upload that can't be read falls back to the theme's default logo.
    return activeLogoFile({ defaultOnly: true });
  }
  const bytes = await readFile(path.join(process.cwd(), "public", "themes", parts[1], parts[2]));
  return { bytes, mime };
}

export function dataUri({ bytes, mime }: { bytes: Buffer; mime: string }) {
  return `data:${mime};base64,${bytes.toString("base64")}`;
}
