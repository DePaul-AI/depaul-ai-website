import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { site } from "./content";
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
 * The active logo's bytes, read from /public at build time (for icons).
 * `defaultOnly` skips a logo uploaded with `/dai logo`.
 */
export async function activeLogoFile({ defaultOnly = false } = {}) {
  const src = logoFor(site.theme, defaultOnly ? {} : site.logos);
  // src is "/uploads/<file>" or "/themes/<theme>/<file>". Building the path from
  // fixed folder names keeps the bundler from tracing the whole project.
  const parts = src.split("/").filter(Boolean).map((p) => path.basename(p));
  const file =
    parts[0] === "uploads"
      ? path.join(process.cwd(), "public", "uploads", parts[1])
      : path.join(process.cwd(), "public", "themes", parts[1], parts[2]);
  const bytes = await readFile(file);
  return { bytes, mime: MIME[path.extname(file)] ?? "application/octet-stream" };
}

export function dataUri({ bytes, mime }: { bytes: Buffer; mime: string }) {
  return `data:${mime};base64,${bytes.toString("base64")}`;
}
