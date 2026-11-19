import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { site } from "./content";
import { logoFor } from "./themes";

const MIME: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

/** The active logo's bytes, read from /public at build time (for icons). */
export async function activeLogoFile() {
  const src = logoFor(site.theme, site.logos);
  const [dir, name] = src.startsWith("/uploads/") ? ["uploads", src.slice(9)] : ["logos", src.slice(7)];
  const bytes = await readFile(path.join(process.cwd(), "public", dir, path.basename(name)));
  return { bytes, mime: MIME[path.extname(name)] ?? "application/octet-stream" };
}

export function dataUri({ bytes, mime }: { bytes: Buffer; mime: string }) {
  return `data:${mime};base64,${bytes.toString("base64")}`;
}
