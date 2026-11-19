import { z } from "zod";
import { THEME_IDS } from "../../themes";

/**
 * Every piece of editable site content is described here.
 * The JSON files in /content are validated against these schemas at build
 * time (so a bad edit fails the deploy instead of breaking the live site)
 * and again by the Slack bot before it commits anything.
 */

const url = z.url({ protocol: /^https?$/, message: "Must be a full http(s) URL" });
const isoDate = z.iso.datetime({ offset: true, message: "Must be an ISO date-time" });
/** An image uploaded through Slack, stored in public/uploads. */
export const UPLOAD_PATTERN = /^\/uploads\/[a-z0-9-]+\.(png|jpe?g|gif|webp)$/;
const upload = z.string().regex(UPLOAD_PATTERN, "Must be an uploaded image path");

const id = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only");

export const linkSchema = z.object({
  id,
  label: z.string().min(1).max(60),
  url,
});

export const countdownSchema = z.object({
  label: z.string().min(1).max(80),
  target: isoDate,
  link: url.optional(),
});

export const announcementSchema = z.object({
  text: z.string().min(1).max(160),
  link: url.optional(),
});

export const siteSchema = z.object({
  /** The live theme: a folder in themes/, e.g. "fall-2026". Set with `/dai theme`. */
  theme: z.enum(THEME_IDS),
  /** Logos uploaded with `/dai logo`, per theme. Themes without one use their default. */
  logos: z.partialRecord(z.enum(THEME_IDS), upload).default({}),
  hero: z.object({
    title: z.string().min(1),
    tagline: z.string().min(1),
  }),
  /** Thin banner at the very top of the page. null = hidden. */
  announcement: announcementSchema.nullable(),
  /** Main countdown. null = count down to the next upcoming event instead. */
  countdown: countdownSchema.nullable(),
  /** Pinned link buttons (join form, Discord, etc). */
  links: z.array(linkSchema),
  socials: z.object({
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
  }),
});

export const eventSchema = z.object({
  id,
  title: z.string().min(1).max(120),
  start: isoDate,
  end: isoDate.optional(),
  location: z.string().max(120).optional(),
  description: z.string().max(1000).optional(),
  /** RSVP / details link */
  link: url.optional(),
  /** Flyer or photo */
  image: upload.optional(),
});

export const postSchema = z.object({
  id,
  title: z.string().min(1).max(140),
  body: z.string().max(2000).optional(),
  link: url.optional(),
  image: upload.optional(),
  date: isoDate,
});

export const eventsSchema = z.array(eventSchema);
export const postsSchema = z.array(postSchema);

export type Site = z.infer<typeof siteSchema>;
export type SiteLink = z.infer<typeof linkSchema>;
export type Countdown = z.infer<typeof countdownSchema>;
export type Announcement = z.infer<typeof announcementSchema>;
export type SiteEvent = z.infer<typeof eventSchema>;
export type Post = z.infer<typeof postSchema>;

/** Maps each content file to its schema. Paths are relative to the repo root. */
export const CONTENT_FILES = {
  site: { path: "content/site.json", schema: siteSchema },
  events: { path: "content/events.json", schema: eventsSchema },
  posts: { path: "content/posts.json", schema: postsSchema },
} as const;

export type ContentKey = keyof typeof CONTENT_FILES;
export type ContentData = {
  site: Site;
  events: SiteEvent[];
  posts: Post[];
};

/** When an event is over. Without an explicit end, it's treated as running for two hours. */
export function eventEnd(e: Pick<SiteEvent, "start" | "end">) {
  return e.end ? Date.parse(e.end) : Date.parse(e.start) + 2 * 60 * 60 * 1000;
}
