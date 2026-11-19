/**
 * What every theme declares in its theme.ts. Everything visual (colors,
 * fonts, how cards and buttons look) lives in the theme's styles.css instead.
 */
export type ThemeConfig = {
  /** Shown in Slack and on archived cards, e.g. "Fall 2026" */
  label: string;
  /** Hero eyebrow, e.g. "Fall Quarter 2026" */
  season: string;
  /**
   * The quarter on DePaul's academic calendar, as Chicago dates (inclusive).
   * Past events dated inside this range are shown in this theme.
   * Leave out for themes that aren't tied to a quarter.
   */
  dates?: { start: string; end: string };
  /** Light or dark: used for the browser's UI colors. */
  scheme: "light" | "dark";
  /** Page background (must match --bg in styles.css): phone status bar and app icon. */
  background: string;
  /** Default logo, under public/. Can be replaced per theme with `/dai logo`. */
  logo: string;
};

export const defineTheme = (t: ThemeConfig) => t;
