import { TIME_ZONE, type SiteEvent } from "./content";

const part = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleString("en-US", { timeZone: TIME_ZONE, ...opts });

export const monthShort = (iso: string) => part(iso, { month: "short" });
export const dayOfMonth = (iso: string) => part(iso, { day: "numeric" });
export const weekday = (iso: string) => part(iso, { weekday: "long" });
export const time = (iso: string) => part(iso, { hour: "numeric", minute: "2-digit" });
export const longDate = (iso: string) =>
  part(iso, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
export const shortDate = (iso: string) => part(iso, { month: "short", day: "numeric", year: "numeric" });

export function timeRange(e: SiteEvent) {
  return e.end ? `${time(e.start)} – ${time(e.end)}` : time(e.start);
}

/** "Add to Google Calendar" link for an event. */
export function googleCalendarUrl(e: SiteEvent) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const end = e.end ?? new Date(Date.parse(e.start) + 2 * 60 * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(e.start)}/${stamp(end)}`,
    ctz: TIME_ZONE,
  });
  if (e.description || e.link) params.set("details", [e.description, e.link].filter(Boolean).join("\n\n"));
  if (e.location) params.set("location", e.location);
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Current year in Chicago, for "Fall Quarter 2026". */
export const currentYear = () => part(new Date().toISOString(), { year: "numeric" });
