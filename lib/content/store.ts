import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { CONTENT_FILES, type ContentData, type ContentKey } from "./schema";

/**
 * Reads and writes the JSON files in /content.
 *
 * - In production the files are read from and committed to GitHub, which
 *   triggers a redeploy (about a minute until the change is live).
 * - With CONTENT_STORE=local (handy for `npm run dev`) the files on disk are
 *   edited directly, so you can try the Slack bot without a GitHub token.
 */

type Mutator<K extends ContentKey> = (current: ContentData[K]) => ContentData[K];

export type CommitResult = { commitUrl?: string };

const isLocalStore = () =>
  process.env.CONTENT_STORE === "local" ||
  (!process.env.GITHUB_TOKEN && process.env.NODE_ENV !== "production");

export async function readContent<K extends ContentKey>(key: K): Promise<ContentData[K]> {
  const { schema } = CONTENT_FILES[key];
  const raw = isLocalStore() ? await readLocal(key) : (await readGitHub(key)).text;
  return schema.parse(JSON.parse(raw)) as ContentData[K];
}

/**
 * Applies `mutate` to the latest version of a content file and saves it.
 * The result is validated before anything is written.
 */
export async function updateContent<K extends ContentKey>(
  key: K,
  mutate: Mutator<K>,
  message: string,
): Promise<CommitResult> {
  const { schema, path: filePath } = CONTENT_FILES[key];

  if (isLocalStore()) {
    const current = schema.parse(JSON.parse(await readLocal(key))) as ContentData[K];
    const next = schema.parse(mutate(current));
    await fs.writeFile(localPath(key), serialize(next));
    return {};
  }

  // Someone else may commit between our read and write; GitHub rejects the
  // write if the file's sha changed, so re-read and retry a few times.
  for (let attempt = 0; ; attempt++) {
    const { text, sha } = await readGitHub(key);
    const current = schema.parse(JSON.parse(text)) as ContentData[K];
    const next = schema.parse(mutate(current));
    const res = await github(`contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: Buffer.from(serialize(next)).toString("base64"),
        sha,
        branch: branch(),
        committer: { name: "DePaul AI Bot", email: "bot@users.noreply.github.com" },
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { commit?: { html_url?: string } };
      return { commitUrl: data.commit?.html_url };
    }
    if ((res.status === 409 || res.status === 422) && attempt < 3) continue;
    throw new Error(`GitHub write failed (${res.status}): ${await res.text()}`);
  }
}

function serialize(data: unknown) {
  return JSON.stringify(data, null, 2) + "\n";
}

async function readLocal(key: ContentKey) {
  return fs.readFile(localPath(key), "utf8");
}

// Scoped to /content so the bundler doesn't trace the whole project.
function localPath(key: ContentKey) {
  return path.join(process.cwd(), "content", path.basename(CONTENT_FILES[key].path));
}

function branch() {
  return process.env.GITHUB_BRANCH || "main";
}

async function readGitHub(key: ContentKey) {
  const res = await github(
    `contents/${CONTENT_FILES[key].path}?ref=${encodeURIComponent(branch())}`,
  );
  if (!res.ok) throw new Error(`GitHub read failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { content: string; sha: string };
  return { text: Buffer.from(data.content, "base64").toString("utf8"), sha: data.sha };
}

function github(endpoint: string, init: RequestInit = {}) {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) throw new Error("GITHUB_REPO and GITHUB_TOKEN must be set");
  const api = process.env.GITHUB_API_URL || "https://api.github.com";
  return fetch(`${api}/repos/${repo}/${endpoint}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
  });
}
