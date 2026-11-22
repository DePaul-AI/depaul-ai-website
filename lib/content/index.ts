import siteJson from "@/content/site.json";
import eventsJson from "@/content/events.json";
import postsJson from "@/content/posts.json";
import {
  siteSchema,
  eventsSchema,
  postsSchema,
  eventEnd,
  type ContentData,
  type Countdown,
  type Post,
  type SiteEvent,
} from "./schema";

export * from "./schema";

/** All dates on the site are shown in Chicago time. */
export const TIME_ZONE = "America/Chicago";

/**
 * The content files as they were when the site was built. The live site reads
 * the latest content from GitHub instead (see live.ts) and only falls back to
 * this if GitHub can't be reached. Parsing here also means a broken content
 * file fails the build.
 */
export const bundledContent: ContentData = {
  site: siteSchema.parse(siteJson),
  events: eventsSchema.parse(eventsJson),
  posts: postsSchema.parse(postsJson),
};

export function splitEvents(events: SiteEvent[], now = Date.now()) {
  const sorted = [...events].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  return {
    upcoming: sorted.filter((e) => eventEnd(e) >= now),
    past: sorted.filter((e) => eventEnd(e) < now).reverse(),
  };
}

export function sortedPosts(posts: Post[]) {
  return [...posts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/**
 * The hero countdown: the one set explicitly in site.json, or else the next
 * event that hasn't started yet. Returns null if there's nothing to count to.
 */
export function activeCountdown({ site, events }: ContentData, now = Date.now()): Countdown | null {
  if (site.countdown && Date.parse(site.countdown.target) > now) return site.countdown;
  const next = splitEvents(events, now).upcoming.find((e) => Date.parse(e.start) > now);
  return next ? { label: next.title, target: next.start, link: next.link } : null;
}
