import type { Era } from "./content/schema";
import type { ThemeId } from "./themes";

/**
 * Eras: which theme the site wore when. Past events are shown in the look of
 * the quarter they happened in.
 *
 * Eras come from content/site.json. `/dai theme` records them automatically,
 * and they can be corrected by hand there. Dates outside every recorded era
 * fall back to DePaul's usual quarter months.
 */

const MONTH_FMT = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "numeric", year: "numeric" });

function chicagoMonthYear(iso: string) {
  const parts = MONTH_FMT.formatToParts(new Date(iso));
  return {
    month: Number(parts.find((p) => p.type === "month")!.value),
    year: Number(parts.find((p) => p.type === "year")!.value),
  };
}

const SHORT: Record<ThemeId, string> = {
  fall: "Fall",
  winter: "Winter",
  spring: "Spring",
  summer: "Summer",
  midnight: "Break",
};

/** "Fall 2026", "Winter 2027" (a winter starting in December belongs to the next year). */
export function eraLabel(theme: ThemeId, startIso: string) {
  const { month, year } = chicagoMonthYear(startIso);
  return `${SHORT[theme]} ${theme === "winter" && month === 12 ? year + 1 : year}`;
}

/** Usual DePaul quarter for a date, when no recorded era covers it. */
function fallbackTheme(iso: string): { theme: ThemeId; label: string } {
  const { month, year } = chicagoMonthYear(iso);
  if (month >= 9 && month <= 11) return { theme: "fall", label: `Fall ${year}` };
  if (month === 12) return { theme: "winter", label: `Winter ${year + 1}` };
  if (month <= 3) return { theme: "winter", label: `Winter ${year}` };
  if (month <= 6) return { theme: "spring", label: `Spring ${year}` };
  return { theme: "summer", label: `Summer ${year}` };
}

export function eraFor(iso: string, eras: Era[]): { theme: ThemeId; label: string } {
  const t = Date.parse(iso);
  // Latest-starting match wins, so a hand-added era can override an older one.
  for (let i = eras.length - 1; i >= 0; i--) {
    const e = eras[i];
    if (t >= Date.parse(e.start) && (!e.end || t < Date.parse(e.end))) return { theme: e.theme, label: e.label };
  }
  return fallbackTheme(iso);
}

const WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Updates the era history when the site switches theme. Quick back-and-forth
 * switches (an era under a week old) are treated as corrections rather than
 * a new quarter, so trying a theme out doesn't pollute the archive.
 */
export function recordThemeSwitch(eras: Era[], theme: ThemeId, now = new Date()): Era[] {
  const nowIso = now.toISOString();
  const list = eras.map((e) => ({ ...e }));
  const open = list.at(-1);
  const isOpen = open && (!open.end || Date.parse(open.end) > now.getTime());

  if (open && isOpen && open.theme === theme) return list;

  if (open && isOpen && now.getTime() - Date.parse(open.start) < WEEK) {
    const prev = list.at(-2);
    if (prev && prev.theme === theme && prev.end === open.start) {
      // Switched away and straight back: undo the detour.
      list.pop();
      delete prev.end;
      return list;
    }
    open.theme = theme;
    open.label = eraLabel(theme, open.start);
    return list;
  }

  if (open && isOpen) open.end = nowIso;
  list.push({ theme, label: eraLabel(theme, nowIso), start: nowIso });
  return list;
}
