import "server-only";
import { z } from "zod";
import { readContent, updateContent } from "../content/store";
import { makeId } from "../content/ids";
import {
  announcementSchema,
  countdownSchema,
  eventSchema,
  linkSchema,
  postSchema,
  type ContentKey,
} from "../content/schema";
import { THEMES, THEME_IDS, type ThemeId } from "../../themes";
import { esc, siteUrl, slack } from "./api";
import { fetchSlackImage, isUsableImage } from "./files";
import {
  announceModal,
  countdownModal,
  eventModal,
  checked,
  field,
  fileField,
  linkModal,
  logoModal,
  postModal,
  themeModal,
  type ModalKind,
  type ModalMeta,
  type StateValues,
} from "./views";

// ---- opening modals --------------------------------------------------------

export async function openModal(
  kind: ModalKind,
  triggerId: string,
  meta: ModalMeta,
  prefill?: Record<string, string | undefined>,
) {
  const view = await buildModal(kind, meta, prefill);
  const res = await slack("views.open", { trigger_id: triggerId, view });
  if (!res.ok) throw new Error(`Couldn't open the form (${res.error})`);
}

async function buildModal(kind: ModalKind, meta: ModalMeta, prefill?: Record<string, string | undefined>) {
  switch (kind) {
    case "event": {
      const existing = meta.id ? (await readContent("events")).find((e) => e.id === meta.id) : undefined;
      return eventModal(meta, existing);
    }
    case "post": {
      const existing = meta.id ? (await readContent("posts")).find((p) => p.id === meta.id) : undefined;
      return postModal(meta, existing ?? prefill);
    }
    case "link": {
      const existing = meta.id ? (await readContent("site")).links.find((l) => l.id === meta.id) : undefined;
      return linkModal(meta, existing);
    }
    case "countdown":
      return countdownModal(meta, (await readContent("site")).countdown);
    case "announce":
      return announceModal(meta, (await readContent("site")).announcement);
    case "theme":
      return themeModal(meta, (await readContent("site")).theme);
    case "logo": {
      const site = await readContent("site");
      return logoModal(meta, site.theme, site.logos);
    }
  }
}

// ---- handling submissions --------------------------------------------------

export type Submission =
  | { errors: Record<string, string> }
  | { apply: () => Promise<string> };

/**
 * Validates a submitted modal. Returns field errors (shown inline in Slack)
 * or a function that saves the change and returns a confirmation message.
 * Validation happens synchronously because Slack wants an answer in 3s.
 */
export function handleSubmission(
  kind: ModalKind,
  values: StateValues,
  meta: ModalMeta,
  /** Attribution for the commit message, e.g. "(via Slack, @name)" */
  by: string,
): Submission {
  const f = (id: string) => field(values, id);
  const verb = meta.id ? "updated" : "added";

  switch (kind) {
    case "event": {
      const parsed = check(eventSchema, {
        id: meta.id ?? makeId(f("title") ?? ""),
        title: f("title"),
        start: f("start"),
        end: f("end"),
        location: f("location"),
        description: f("description"),
        link: f("link"),
      });
      if ("errors" in parsed) return parsed;
      const event = parsed.data;
      if (event.end && Date.parse(event.end) <= Date.parse(event.start)) {
        return { errors: { end: "End time must be after the start time." } };
      }
      const image = imageChoice(values, meta);
      if ("errors" in image) return image;
      return {
        apply: async () => {
          const upload = image.fileId ? await fetchSlackImage(image.fileId, event.title) : undefined;
          await updateContent(
            "events",
            (list) => upsert(list, { ...event, image: resolveImage(list.find((e) => e.id === event.id)?.image, upload, image.remove) }),
            `content: ${verb} event "${event.title}" ${by}`,
            upload ? [upload] : [],
          );
          return `${verb} event *${esc(event.title)}*`;
        },
      };
    }

    case "post": {
      const parsed = check(postSchema, {
        id: meta.id ?? makeId(f("title") ?? ""),
        title: f("title"),
        body: f("body"),
        link: f("link"),
        date: new Date().toISOString(),
      });
      if ("errors" in parsed) return parsed;
      const post = parsed.data;
      const image = imageChoice(values, meta);
      if ("errors" in image) return image;
      return {
        apply: async () => {
          const upload = image.fileId ? await fetchSlackImage(image.fileId, post.title) : undefined;
          await updateContent(
            "posts",
            (list) => {
              const prev = list.find((p) => p.id === post.id);
              // Editing keeps the original publish date.
              return upsert(list, { ...post, date: prev?.date ?? post.date, image: resolveImage(prev?.image, upload, image.remove) });
            },
            `content: ${meta.id ? "updated" : "published"} update "${post.title}" ${by}`,
            upload ? [upload] : [],
          );
          return `${meta.id ? "updated" : "published"} *${esc(post.title)}*`;
        },
      };
    }

    case "link": {
      const parsed = check(linkSchema, {
        id: meta.id ?? makeId(f("label") ?? ""),
        label: f("label"),
        url: f("url"),
      });
      if ("errors" in parsed) return parsed;
      const link = parsed.data;
      return {
        apply: async () => {
          await updateContent(
            "site",
            (site) => ({ ...site, links: upsert(site.links, link) }),
            `content: ${meta.id ? "updated" : "pinned"} link "${link.label}" ${by}`,
          );
          return `${meta.id ? "updated" : "pinned"} the link *${esc(link.label)}*`;
        },
      };
    }

    case "countdown": {
      const parsed = check(countdownSchema, { label: f("label"), target: f("target"), link: f("link") });
      if ("errors" in parsed) return parsed;
      const countdown = parsed.data;
      if (Date.parse(countdown.target) <= Date.now()) {
        return { errors: { target: "Pick a time in the future." } };
      }
      return {
        apply: async () => {
          await updateContent("site", (site) => ({ ...site, countdown }), `content: set countdown to "${countdown.label}" ${by}`);
          return `set the main countdown to *${esc(countdown.label)}*`;
        },
      };
    }

    case "announce": {
      const parsed = check(announcementSchema, { text: f("text"), link: f("link") });
      if ("errors" in parsed) return parsed;
      const announcement = parsed.data;
      return {
        apply: async () => {
          await updateContent("site", (site) => ({ ...site, announcement }), `content: set banner ${by}`);
          return `put up the banner “${esc(announcement.text)}”`;
        },
      };
    }

    case "theme": {
      const theme = f("theme") as ThemeId | undefined;
      if (!theme || !THEME_IDS.includes(theme)) return { errors: { theme: "Pick a theme." } };
      return { apply: () => setTheme(theme, by) };
    }

    case "logo": {
      const theme = f("theme") as ThemeId | undefined;
      if (!theme || !THEME_IDS.includes(theme)) return { errors: { theme: "Pick a theme." } };
      const file = fileField(values, "image");
      if (!file) return { errors: { image: "Upload an image." } };
      if (!isUsableImage(file)) return { errors: { image: "Use a PNG, JPG, GIF or WebP under 8 MB." } };
      return {
        apply: async () => {
          const upload = await fetchSlackImage(file.id, `logo-${theme}`);
          await updateContent(
            "site",
            (site) => ({ ...site, logos: { ...site.logos, [theme]: upload.publicPath } }),
            `content: new ${theme} logo ${by}`,
            [upload],
          );
          return `uploaded a new *${THEMES[theme].label}* logo`;
        },
      };
    }
  }
}

export async function setTheme(theme: ThemeId, by: string) {
  await updateContent(
    "site",
    (site) => ({ ...site, theme }),
    `content: switch theme to ${theme} ${by}`,
  );
  return `switched the site theme to *${THEMES[theme].label}*`;
}

export async function resetLogo(theme: ThemeId | undefined, by: string) {
  let which: ThemeId = theme ?? "off-season";
  await updateContent("site", (site) => {
    which = theme ?? site.theme;
    const logos = { ...site.logos };
    delete logos[which];
    return { ...site, logos };
  }, `content: reset ${theme ?? "current"} logo to default ${by}`);
  return `reset the *${THEMES[which].label}* logo to the built-in one`;
}

export async function clearSiteField(fieldName: "countdown" | "announcement", by: string) {
  await updateContent("site", (site) => ({ ...site, [fieldName]: null }), `content: clear ${fieldName} ${by}`);
  return fieldName === "countdown"
    ? "cleared the custom countdown — it now counts down to the next event"
    : "took down the site banner";
}

// ---- removing ---------------------------------------------------------------

export type ItemRef = { key: Exclude<ContentKey, "site"> | "links"; id: string };

export async function removeItem({ key, id }: ItemRef, by: string): Promise<string> {
  let removed: string | undefined;
  if (key === "links") {
    await updateContent("site", (site) => {
      removed = site.links.find((l) => l.id === id)?.label;
      return { ...site, links: site.links.filter((l) => l.id !== id) };
    }, `content: remove link ${id} ${by}`);
  } else {
    const drop = <T extends { id: string; title: string }>(list: T[]) => {
      removed = list.find((x) => x.id === id)?.title;
      return list.filter((x) => x.id !== id);
    };
    const message = `content: remove ${key === "events" ? "event" : "update"} ${id} ${by}`;
    if (key === "events") await updateContent("events", drop, message);
    else await updateContent("posts", drop, message);
  }
  if (!removed) throw new Error(`Nothing with id \`${id}\` found — it may already be gone.`);
  return `removed *${esc(removed)}*`;
}

/** Finds which list an id belongs to, for `/dai remove <id>`. */
export async function findItem(id: string): Promise<ItemRef | null> {
  const [events, posts, site] = await Promise.all([readContent("events"), readContent("posts"), readContent("site")]);
  if (events.some((e) => e.id === id)) return { key: "events", id };
  if (posts.some((p) => p.id === id)) return { key: "posts", id };
  if (site.links.some((l) => l.id === id)) return { key: "links", id };
  return null;
}

// ---- /dai list --------------------------------------------------------------

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export async function listBlocks() {
  const [events, posts, site] = await Promise.all([readContent("events"), readContent("posts"), readContent("site")]);
  const now = Date.now();
  const upcoming = events
    .filter((e) => Date.parse(e.end ?? e.start) >= now)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    .slice(0, 8);
  const recent = [...posts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 6);
  const links = site.links.slice(0, 6);

  const blocks: Record<string, unknown>[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: [
          `*Theme:* ${THEMES[site.theme].label}`,
          `*Countdown:* ${site.countdown ? `${esc(site.countdown.label)} — ${fmt(site.countdown.target)}` : "_next event (automatic)_"}`,
          `*Banner:* ${site.announcement ? esc(site.announcement.text) : "_none_"}`,
          `<${siteUrl()}|View the site>`,
        ].join("\n"),
      },
    },
  ];

  const item = (ref: ItemRef, text: string, editable = true) => [
    { type: "section", text: { type: "mrkdwn", text } },
    {
      type: "actions",
      elements: [
        ...(editable
          ? [{ type: "button", text: { type: "plain_text", text: "Edit" }, action_id: "edit", value: JSON.stringify(ref) }]
          : []),
        {
          type: "button",
          text: { type: "plain_text", text: "Remove" },
          style: "danger",
          action_id: "remove",
          value: JSON.stringify(ref),
          confirm: {
            title: { type: "plain_text", text: "Remove from the site?" },
            text: { type: "mrkdwn", text: "This takes it off the website. It stays in the GitHub history if you need it back." },
            confirm: { type: "plain_text", text: "Remove" },
            deny: { type: "plain_text", text: "Keep it" },
          },
        },
      ],
    },
  ];

  const header = (text: string) => ({ type: "header", text: { type: "plain_text", text } });

  blocks.push(header(`Upcoming events (${upcoming.length})`));
  if (!upcoming.length) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: "None yet — add one with `/dai event`." }] });
  for (const e of upcoming) blocks.push(...item({ key: "events", id: e.id }, `*${esc(e.title)}*\n${fmt(e.start)}${e.location ? ` · ${esc(e.location)}` : ""}`));

  blocks.push(header("Latest updates"));
  if (!recent.length) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: "None yet — share one with `/dai post`." }] });
  for (const p of recent) blocks.push(...item({ key: "posts", id: p.id }, `*${esc(p.title)}*\n${fmt(p.date)}`));

  blocks.push(header("Pinned links"));
  if (!links.length) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: "None yet — pin one with `/dai link`." }] });
  for (const l of links) blocks.push(...item({ key: "links", id: l.id }, `*${esc(l.label)}*\n${esc(l.url)}`));

  return blocks;
}

// ---- helpers ------------------------------------------------------------------

/** Which image the user picked in a form: a new upload, removal, or keep. */
function imageChoice(values: StateValues, meta: ModalMeta): { fileId?: string; remove: boolean } | { errors: Record<string, string> } {
  const file = fileField(values, "image");
  if (file && !isUsableImage(file)) return { errors: { image: "Use a PNG, JPG, GIF or WebP under 8 MB." } };
  return { fileId: file?.id ?? meta.fileId, remove: checked(values, "remove_image") };
}

function resolveImage(previous: string | undefined, upload: { publicPath: string } | undefined, remove: boolean) {
  if (upload) return upload.publicPath;
  return remove ? undefined : previous;
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
}

function check<T>(schema: z.ZodType<T>, input: unknown): { data: T } | { errors: Record<string, string> } {
  const res = schema.safeParse(input);
  if (res.success) return { data: res.data };
  const errors: Record<string, string> = {};
  for (const issue of res.error.issues) {
    const key = String(issue.path[0] ?? "title");
    errors[key] ??= issue.code === "invalid_type" ? "This field is required." : issue.message;
  }
  return { errors };
}

/** Turns a Slack message (mrkdwn) into a draft update for the website. */
export function draftFromMessage(text: string, files: { id: string; mimetype?: string; size?: number }[] = []) {
  const urls: string[] = [];
  const clean = text
    .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, (_, url: string, label: string) => (urls.push(url), label))
    .replace(/<(https?:\/\/[^>]+)>/g, (_, url: string) => (urls.push(url), url))
    .replace(/<[@#!][^>]*>/g, "")
    .replace(/[*_~]/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
  const [first = "", ...rest] = clean.split("\n");
  const title = first.length > 140 ? first.slice(0, 137) + "…" : first;
  return {
    title,
    body: (first.length > 140 ? clean : rest.join("\n").trim()).slice(0, 2000) || undefined,
    link: urls[0],
    /** First image attached to the message, if any. */
    fileId: files.find(isUsableImage)?.id,
  };
}
