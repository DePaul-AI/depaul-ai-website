import "server-only";
import { THEMES, THEME_IDS, type ThemeId } from "../../themes";
import type { Announcement, Countdown, Post, SiteEvent, SiteLink } from "../content/schema";

/**
 * Slack modal definitions. Each modal's `callback_id` maps to a handler in
 * lib/slack/handlers.ts. Field values come back keyed by block_id, with every
 * input element using action_id "v".
 */

export type ModalKind = "event" | "post" | "link" | "countdown" | "announce" | "theme" | "logo";

export type ModalMeta = {
  /** Channel the modal was opened from, so we can confirm there. */
  channel?: string;
  /** Set when editing an existing item. */
  id?: string;
  /** An image already in Slack to attach (from the "Post to website" shortcut). */
  fileId?: string;
};

type Block = Record<string, unknown>;

const plain = (text: string) => ({ type: "plain_text", text, emoji: true });
const unix = (iso?: string) => (iso ? Math.floor(Date.parse(iso) / 1000) : undefined);

function textInput(
  id: string,
  label: string,
  opts: { initial?: string; optional?: boolean; multiline?: boolean; max?: number; hint?: string; placeholder?: string } = {},
): Block {
  return {
    type: "input",
    block_id: id,
    optional: opts.optional ?? false,
    label: plain(label),
    ...(opts.hint ? { hint: plain(opts.hint) } : {}),
    element: {
      type: "plain_text_input",
      action_id: "v",
      multiline: opts.multiline ?? false,
      ...(opts.max ? { max_length: opts.max } : {}),
      ...(opts.initial ? { initial_value: opts.initial } : {}),
      ...(opts.placeholder ? { placeholder: plain(opts.placeholder) } : {}),
    },
  };
}

function urlInput(id: string, label: string, opts: { initial?: string; optional?: boolean; hint?: string } = {}): Block {
  return {
    type: "input",
    block_id: id,
    optional: opts.optional ?? true,
    label: plain(label),
    ...(opts.hint ? { hint: plain(opts.hint) } : {}),
    element: {
      type: "url_text_input",
      action_id: "v",
      ...(opts.initial ? { initial_value: opts.initial } : {}),
      placeholder: plain("https://"),
    },
  };
}

function dateTimeInput(id: string, label: string, opts: { initial?: string; optional?: boolean; hint?: string } = {}): Block {
  const initial = unix(opts.initial);
  return {
    type: "input",
    block_id: id,
    optional: opts.optional ?? false,
    label: plain(label),
    ...(opts.hint ? { hint: plain(opts.hint) } : {}),
    element: {
      type: "datetimepicker",
      action_id: "v",
      ...(initial ? { initial_date_time: initial } : {}),
    },
  };
}

const IMAGE_TYPES = ["png", "jpg", "jpeg", "gif", "webp"];

function imageInput(id: string, label: string, opts: { optional?: boolean; hint?: string } = {}): Block {
  return {
    type: "input",
    block_id: id,
    optional: opts.optional ?? true,
    label: plain(label),
    ...(opts.hint ? { hint: plain(opts.hint) } : {}),
    element: { type: "file_input", action_id: "v", filetypes: IMAGE_TYPES, max_files: 1 },
  };
}

/** Image upload, plus a "remove" checkbox when the item already has one. */
function imageBlocks(label: string, existing?: string, attached?: boolean): Block[] {
  if (attached) {
    return [{ type: "context", elements: [{ type: "mrkdwn", text: ":frame_with_picture: The image from the message will be included." }] }];
  }
  const blocks = [imageInput("image", label, { hint: existing ? "Leave empty to keep the current image." : "PNG, JPG, GIF or WebP, under 8 MB." })];
  if (existing) {
    blocks.push({
      type: "input",
      block_id: "remove_image",
      optional: true,
      label: plain("Current image"),
      element: { type: "checkboxes", action_id: "v", options: [{ text: plain("Remove the current image"), value: "yes" }] },
    });
  }
  return blocks;
}

function modal(kind: ModalKind, title: string, submit: string, blocks: Block[], meta: ModalMeta) {
  return {
    type: "modal",
    callback_id: kind,
    private_metadata: JSON.stringify(meta),
    title: plain(title),
    submit: plain(submit),
    close: plain("Cancel"),
    blocks,
  };
}

const liveNote: Block = {
  type: "context",
  elements: [{ type: "mrkdwn", text: "Changes go live on the website a couple of minutes after you save." }],
};

export function eventModal(meta: ModalMeta, e?: SiteEvent) {
  return modal("event", e ? "Edit event" : "Add event", e ? "Save" : "Add event", [
    textInput("title", "Event name", { initial: e?.title, max: 120, placeholder: "Intro to LLMs workshop" }),
    dateTimeInput("start", "Starts", { initial: e?.start, hint: "Uses your Slack time zone. Past dates work too: they go in the archive, styled like that quarter." }),
    dateTimeInput("end", "Ends", { initial: e?.end, optional: true }),
    textInput("location", "Where", { initial: e?.location, optional: true, max: 120, placeholder: "CDM 222, Loop Campus" }),
    textInput("description", "Description", { initial: e?.description, optional: true, multiline: true, max: 1000 }),
    urlInput("link", "RSVP or details link", { initial: e?.link }),
    ...imageBlocks("Flyer or photo", e?.image),
    liveNote,
  ], meta);
}

export function postModal(meta: ModalMeta, p?: Partial<Post>) {
  return modal("post", p?.id ? "Edit update" : "Share an update", p?.id ? "Save" : "Publish", [
    textInput("title", "Headline", { initial: p?.title, max: 140, placeholder: "Applications for winter board are open" }),
    textInput("body", "Details", { initial: p?.body, optional: true, multiline: true, max: 2000 }),
    urlInput("link", "Link", { initial: p?.link, hint: "Instagram post, article, form, recording…" }),
    ...imageBlocks("Image", p?.image, !!meta.fileId),
    liveNote,
  ], meta);
}

export function linkModal(meta: ModalMeta, l?: SiteLink) {
  return modal("link", l ? "Edit link" : "Pin a link", l ? "Save" : "Pin link", [
    textInput("label", "Button text", { initial: l?.label, max: 60, placeholder: "Join our Discord" }),
    urlInput("url", "URL", { initial: l?.url, optional: false }),
    liveNote,
  ], meta);
}

export function countdownModal(meta: ModalMeta, c?: Countdown | null) {
  return modal("countdown", "Main countdown", "Set countdown", [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "The big countdown at the top of the site. If you don't set one (or it passes), it counts down to the next upcoming event. Use `/dai countdown clear` to go back to that.",
      },
    },
    textInput("label", "Counting down to", { initial: c?.label, max: 80, placeholder: "Winter Quarter kickoff" }),
    dateTimeInput("target", "Date and time", { initial: c?.target }),
    urlInput("link", "Button link", { initial: c?.link }),
    liveNote,
  ], meta);
}

export function announceModal(meta: ModalMeta, a?: Announcement | null) {
  return modal("announce", "Site banner", "Show banner", [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "A short line pinned to the very top of the site. Remove it with `/dai announce clear`.",
      },
    },
    textInput("text", "Banner text", { initial: a?.text, max: 160, placeholder: "Board applications close Friday!" }),
    urlInput("link", "Link", { initial: a?.link }),
    liveNote,
  ], meta);
}

export function themeModal(meta: ModalMeta, current: ThemeId) {
  const option = (id: ThemeId) => ({ text: plain(THEMES[id].label), value: id });
  return modal("theme", "Site theme", "Switch theme", [
    {
      type: "input",
      block_id: "theme",
      label: plain("Theme"),
      element: {
        type: "static_select",
        action_id: "v",
        options: THEME_IDS.map(option),
        initial_option: option(current),
      },
    },
    liveNote,
  ], meta);
}

export function logoModal(meta: ModalMeta, current: ThemeId, custom: Partial<Record<ThemeId, string>>) {
  const option = (id: ThemeId) => ({
    text: plain(`${THEMES[id].label}${custom[id] ? " (custom logo)" : ""}`),
    value: id,
  });
  return modal("logo", "Seasonal logo", "Upload logo", [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Each theme has its own logo, so switching themes switches the logo too. Upload a square image (at least 512×512, PNG with a transparent or filled background). To go back to a theme's built-in logo, use `/dai logo reset`.",
      },
    },
    {
      type: "input",
      block_id: "theme",
      label: plain("For which theme"),
      element: { type: "static_select", action_id: "v", options: THEME_IDS.map(option), initial_option: option(current) },
    },
    imageInput("image", "Logo image", { optional: false }),
    liveNote,
  ], meta);
}

// ---- reading submitted values ----------------------------------------------

type StateValues = Record<string, Record<string, {
  value?: string | null;
  selected_date_time?: number | null;
  selected_option?: { value: string } | null;
  selected_options?: { value: string }[] | null;
  files?: { id: string; mimetype?: string; size?: number }[] | null;
}>>;

/** The uploaded file in a file_input, if any. */
export function fileField(values: StateValues, id: string) {
  return values[id]?.v?.files?.[0];
}

export function checked(values: StateValues, id: string) {
  return (values[id]?.v?.selected_options?.length ?? 0) > 0;
}

export function field(values: StateValues, id: string): string | undefined {
  const v = values[id]?.v;
  if (!v) return undefined;
  if (v.selected_date_time) return new Date(v.selected_date_time * 1000).toISOString();
  if (v.selected_option) return v.selected_option.value;
  const s = v.value?.trim();
  return s ? s : undefined;
}

export type { StateValues };
