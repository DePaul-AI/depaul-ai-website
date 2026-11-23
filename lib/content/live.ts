import "server-only";
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { bundledContent, type ContentData } from ".";
import { canReadLive, readContent } from "./store";

/**
 * The site's content, read live from GitHub (or local files in dev) rather
 * than baked in at build time, so a change from Slack shows up in seconds
 * without a redeploy.
 *
 * Reads are cached under the "content" tag. The Slack bot expires that tag
 * right after it commits (refreshSite below), and a GitHub webhook can too
 * (app/api/revalidate). The cache also refreshes on its own every few
 * minutes as a safety net for edits made any other way.
 */

const CONTENT_TAG = "content";

// The last content that loaded and validated. If GitHub is down or a file is
// invalid, the site keeps serving this instead of erroring.
let lastGood: ContentData | null = null;

async function readAll(): Promise<ContentData> {
  const [site, events, posts] = await Promise.all([readContent("site"), readContent("events"), readContent("posts")]);
  return { site, events, posts };
}

const loadContent = unstable_cache(
  async (): Promise<ContentData> => {
    // No GitHub token (e.g. building on a machine without one): use the
    // content that was built with the site.
    if (!canReadLive()) return bundledContent;
    try {
      lastGood = await readAll();
      return lastGood;
    } catch (err) {
      console.error("Couldn't load live content; serving the last good version:", err);
      return lastGood ?? bundledContent;
    }
  },
  ["site-content"],
  { tags: [CONTENT_TAG], revalidate: 300 },
);

export function getContent(): Promise<ContentData> {
  // In `npm run dev`, skip the cache so hand-edits to content/*.json show
  // up on the next refresh.
  if (process.env.NODE_ENV === "development" && canReadLive()) return readAll();
  return loadContent();
}

/**
 * Makes the next page view rebuild with the latest content. Expires the
 * cached content immediately (so the very next visitor sees the change)
 * and marks every page for regeneration.
 */
export function refreshSite() {
  try {
    revalidateTag(CONTENT_TAG, { expire: 0 });
    revalidatePath("/", "layout");
  } catch (err) {
    // Outside a request (e.g. a script) there's nothing to refresh.
    console.warn("Couldn't refresh the site cache:", err);
  }
}
