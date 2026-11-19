import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { CONTENT_FILES, type ContentData, type ContentKey } from "./schema";

/**
 * Reads and writes the JSON files in /content, plus uploaded images in
 * public/uploads.
 *
 * - In production everything is read from and committed to GitHub, which
 *   triggers a redeploy (about a minute until the change is live). A change
 *   and its image land in one commit.
 * - With CONTENT_STORE=local (the default in `npm run dev` without a
 *   GITHUB_TOKEN) the files on disk are edited directly.
 */

type Mutator<K extends ContentKey> = (current: ContentData[K]) => ContentData[K];

/** A binary file to add alongside a content change, e.g. an uploaded image. */
export type Upload = { publicPath: string; bytes: Buffer };

export type CommitResult = { commitUrl?: string };

const isLocalStore = () =>
  process.env.CONTENT_STORE === "local" ||
  (!process.env.GITHUB_TOKEN && process.env.NODE_ENV !== "production");

export async function readContent<K extends ContentKey>(key: K): Promise<ContentData[K]> {
  const { schema } = CONTENT_FILES[key];
  const raw = isLocalStore() ? await fs.readFile(localPath(key), "utf8") : await readGitHub(key);
  return schema.parse(JSON.parse(raw)) as ContentData[K];
}

/**
 * Applies `mutate` to the latest version of a content file and saves it,
 * together with any uploads. The result is validated before anything is written.
 */
export async function updateContent<K extends ContentKey>(
  key: K,
  mutate: Mutator<K>,
  message: string,
  uploads: Upload[] = [],
): Promise<CommitResult> {
  const { schema, path: filePath } = CONTENT_FILES[key];

  if (isLocalStore()) {
    const current = schema.parse(JSON.parse(await fs.readFile(localPath(key), "utf8"))) as ContentData[K];
    const next = schema.parse(mutate(current));
    for (const u of uploads) {
      await fs.writeFile(path.join(process.cwd(), "public", "uploads", path.basename(u.publicPath)), u.bytes);
    }
    await fs.writeFile(localPath(key), serialize(next));
    return {};
  }

  // Upload image blobs once; they don't change between retries.
  const blobs = await Promise.all(
    uploads.map(async (u) => ({
      path: `public${u.publicPath}`,
      sha: await createBlob(u.bytes.toString("base64"), "base64"),
    })),
  );

  // Build one commit on top of the branch head. If someone else committed in
  // the meantime the ref update is rejected, so start over from the new head.
  for (let attempt = 0; ; attempt++) {
    const head = await gh<{ object: { sha: string } }>(`git/ref/heads/${branch()}`);
    const parent = head.object.sha;
    const commit = await gh<{ tree: { sha: string } }>(`git/commits/${parent}`);

    const current = schema.parse(JSON.parse(await readGitHub(key, parent))) as ContentData[K];
    const next = schema.parse(mutate(current));
    const contentBlob = await createBlob(serialize(next), "utf-8");

    const tree = await gh<{ sha: string }>("git/trees", "POST", {
      base_tree: commit.tree.sha,
      tree: [...blobs, { path: filePath, sha: contentBlob }].map((b) => ({
        path: b.path,
        sha: b.sha,
        mode: "100644",
        type: "blob",
      })),
    });
    const created = await gh<{ sha: string; html_url: string }>("git/commits", "POST", {
      message,
      tree: tree.sha,
      parents: [parent],
      author: { name: "DePaul AI Bot", email: "bot@users.noreply.github.com" },
    });

    const res = await github(`git/refs/heads/${branch()}`, "PATCH", { sha: created.sha, force: false });
    if (res.ok) return { commitUrl: created.html_url };
    if (res.status === 422 && attempt < 3) continue;
    throw new Error(`GitHub update failed (${res.status}): ${await res.text()}`);
  }
}

function serialize(data: unknown) {
  return JSON.stringify(data, null, 2) + "\n";
}

// Scoped to /content so the bundler doesn't trace the whole project.
function localPath(key: ContentKey) {
  return path.join(process.cwd(), "content", path.basename(CONTENT_FILES[key].path));
}

function branch() {
  return process.env.GITHUB_BRANCH || "main";
}

async function readGitHub(key: ContentKey, ref = branch()) {
  const data = await gh<{ content: string }>(
    `contents/${CONTENT_FILES[key].path}?ref=${encodeURIComponent(ref)}`,
  );
  return Buffer.from(data.content, "base64").toString("utf8");
}

async function createBlob(content: string, encoding: "utf-8" | "base64") {
  return (await gh<{ sha: string }>("git/blobs", "POST", { content, encoding })).sha;
}

async function gh<T>(endpoint: string, method = "GET", body?: unknown): Promise<T> {
  const res = await github(endpoint, method, body);
  if (!res.ok) throw new Error(`GitHub ${method} ${endpoint.split("?")[0]} failed (${res.status}): ${await res.text()}`);
  return res.json() as Promise<T>;
}

function github(endpoint: string, method = "GET", body?: unknown) {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) throw new Error("GITHUB_REPO and GITHUB_TOKEN must be set");
  const api = process.env.GITHUB_API_URL || "https://api.github.com";
  return fetch(`${api}/repos/${repo}/${endpoint}`, {
    method,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
