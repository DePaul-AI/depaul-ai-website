import siteJson from "@/content/site.json";
import eventsJson from "@/content/events.json";
import postsJson from "@/content/posts.json";
import {
  siteSchema,
  eventsSchema,
  postsSchema,
  eventEnd,
  type Countdown,
} from "./schema";

export * from "./schema";

/** All dates on the site are shown in Chicago time. */
export const TIME_ZONE = "America/Chicago";

// Parsed once per build. A schema error here fails the build, which keeps the
// last good deployment live instead of shipping a broken page.
export const site = siteSchema.parse(siteJson);
export const events = eventsSchema.parse(eventsJson);
export const posts = postsSchema.parse(postsJson);

export function splitEvents(now = Date.now()) {
  const sorted = [...events].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  return {
    upcoming: sorted.filter((e) => eventEnd(e) >= now),
    past: sorted.filter((e) => eventEnd(e) < now).reverse(),
  };
}

export function sortedPosts() {
  return [...posts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/**
 * The hero countdown: the one set explicitly in site.json, or else the next
 * event that hasn't started yet. Returns null if there's nothing to count to.
 */
export function activeCountdown(now = Date.now()): Countdown | null {
  if (site.countdown && Date.parse(site.countdown.target) > now) return site.countdown;
  const next = splitEvents(now).upcoming.find((e) => Date.parse(e.start) > now);
  return next ? { label: next.title, target: next.start, link: next.link } : null;
}
