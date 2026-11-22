import "server-only";
import { slack } from "./api";
import type { Upload } from "../content/store";

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};
const MAX_BYTES = 8 * 1024 * 1024;

type SlackFile = { id: string; name?: string; mimetype?: string; size?: number; url_private_download?: string };

/** Whether a Slack file looks like an image we can put on the site. */
export function isUsableImage(f: { mimetype?: string; size?: number }) {
  return !!f.mimetype && f.mimetype in EXT && (f.size ?? 0) <= MAX_BYTES;
}

/**
 * Downloads an image someone uploaded in Slack and returns it ready to commit
 * as <name>-<random>.<ext> (served at /media/<file>).
 */
export async function fetchSlackImage(fileId: string, name: string): Promise<Upload> {
  const info = await slack<{ file: SlackFile }>("files.info", { file: fileId });
  if (!info.ok) throw new Error(`couldn't read the uploaded image (${info.error})`);
  const file = info.file;
  if (!file.mimetype || !(file.mimetype in EXT)) throw new Error("the image must be a PNG, JPG, GIF or WebP");
  if ((file.size ?? 0) > MAX_BYTES) throw new Error("the image must be under 8 MB");

  const res = await fetch(file.url_private_download!, {
    headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
  });
  // Without the files:read scope Slack answers with an HTML login page instead.
  if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) {
    throw new Error(`couldn't download the image (${res.status}) — does the Slack app have the files:read scope?`);
  }
  const bytes = Buffer.from(await res.arrayBuffer());

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "image";
  const suffix = Math.random().toString(36).slice(2, 8);
  return { file: `${slug}-${suffix}.${EXT[file.mimetype]}`, bytes };
}
