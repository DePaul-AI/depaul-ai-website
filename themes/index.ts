/**
 * All site themes, one per quarter ([quarter]-[year]).
 *
 * To add a quarter (e.g. fall-2027), see themes/README.md. In short:
 *   1. copy a theme folder and rename it
 *   2. add it to THEMES below, to themes/styles.css, and (if it has hero art) to themes/hero.tsx
 *   3. switch to it from Slack with `/dai theme fall-2027`
 *
 * This file is data only, so the Slack bot can use it too.
 */
import fall2026 from "./fall-2026/theme";
import winter2027 from "./winter-2027/theme";
import spring2026 from "./spring-2026/theme";
import spring2027 from "./spring-2027/theme";
import offSeason from "./off-season/theme";

export const THEMES = {
  "spring-2026": spring2026,
  "fall-2026": fall2026,
  "winter-2027": winter2027,
  "spring-2027": spring2027,
  "off-season": offSeason,
} as const;

export type ThemeId = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as [ThemeId, ...ThemeId[]];

const chicagoDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" });

/**
 * The quarter theme a date falls in, by each theme's DePaul calendar dates.
 * Returns undefined for breaks between quarters.
 */
export function themeForDate(iso: string): ThemeId | undefined {
  const day = chicagoDate.format(new Date(iso)); // YYYY-MM-DD
  return THEME_IDS.find((id) => {
    const d = THEMES[id].dates;
    return d && day >= d.start && day <= d.end;
  });
}

/** A theme's logo: the one uploaded with `/dai logo`, or its default. */
export function logoFor(id: ThemeId, uploaded: Partial<Record<ThemeId, string>> = {}) {
  return uploaded[id] ?? THEMES[id].logo;
}
