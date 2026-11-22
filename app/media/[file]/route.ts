import path from "node:path";
import { readUpload } from "@/lib/content/store";

/**
 * Serves images uploaded through Slack. They're committed to git at
 * public/uploads/<file>, but content commits don't trigger a redeploy, so
 * new files are fetched from GitHub on first request. File names are unique
 * (a random suffix is added on upload), so they can be cached forever.
 */

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

// Small in-memory cache so repeat views don't hit GitHub.
const cache = new Map<string, Buffer>();
const MAX_CACHED = 100;

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const file = path.basename((await params).file);
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type || !/^[a-z0-9-]+\.[a-z]+$/.test(file)) return new Response("Not found", { status: 404 });

  let bytes = cache.get(file);
  if (!bytes) {
    bytes = (await readUpload(file)) ?? undefined;
    if (!bytes) return new Response("Not found", { status: 404 });
    if (cache.size >= MAX_CACHED) cache.delete(cache.keys().next().value!);
    cache.set(file, bytes);
  }

  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
