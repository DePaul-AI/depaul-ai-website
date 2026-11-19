/**
 * Seasonal themes. The active one is picked by `theme` in content/site.json
 * (or `/dai theme` in Slack).
 *
 * To add a theme: add an entry below. The id must be lowercase. It shows up
 * in the Slack theme picker automatically.
 */

export type ThemeTokens = {
  /** Page background */
  bg: string;
  /** Cards and raised surfaces */
  surface: string;
  /** Hairline borders */
  line: string;
  /** Primary text */
  fg: string;
  /** Secondary text */
  muted: string;
  /** Buttons, highlights, countdown digits */
  accent: string;
  /** Text drawn on top of `accent` */
  accentFg: string;
  /** Three colors for the soft gradient glow behind the hero */
  glow: [string, string, string];
};

export type Theme = {
  label: string;
  /** Short line shown in the footer, e.g. "Fall Quarter" */
  season: string;
  scheme: "light" | "dark";
  tokens: ThemeTokens;
};

export const THEMES = {
  fall: {
    label: "Fall",
    season: "Fall Quarter",
    scheme: "dark",
    tokens: {
      bg: "#140e0b",
      surface: "#1e1612",
      line: "#3a2b22",
      fg: "#fbf3ea",
      muted: "#c2ab98",
      accent: "#f29b38",
      accentFg: "#1b0f05",
      glow: ["#c2410c", "#9f1239", "#ca8a04"],
    },
  },
  winter: {
    label: "Winter",
    season: "Winter Quarter",
    scheme: "dark",
    tokens: {
      bg: "#0a0f1a",
      surface: "#111a2b",
      line: "#23324d",
      fg: "#eef4ff",
      muted: "#9fb0cc",
      accent: "#8fd3ff",
      accentFg: "#04121f",
      glow: ["#1d4ed8", "#6d28d9", "#0e7490"],
    },
  },
  spring: {
    label: "Spring",
    season: "Spring Quarter",
    scheme: "light",
    tokens: {
      bg: "#fbf8f3",
      surface: "#ffffff",
      line: "#eadfd6",
      fg: "#2a1d24",
      muted: "#75636c",
      accent: "#c2417a",
      accentFg: "#ffffff",
      glow: ["#f9a8d4", "#86efac", "#fde68a"],
    },
  },
  summer: {
    label: "Summer",
    season: "Summer Session",
    scheme: "light",
    tokens: {
      bg: "#fffaf0",
      surface: "#ffffff",
      line: "#f0e2c8",
      fg: "#1f2328",
      muted: "#66605a",
      accent: "#0f8f8a",
      accentFg: "#ffffff",
      glow: ["#fdba74", "#5eead4", "#fde047"],
    },
  },
  midnight: {
    label: "Midnight (off-season)",
    season: "DePaul AI",
    scheme: "dark",
    tokens: {
      bg: "#0a0a0f",
      surface: "#13131b",
      line: "#26263a",
      fg: "#ffffff",
      muted: "#a3a3b8",
      accent: "#6aa8ff",
      accentFg: "#050a14",
      glow: ["#1e3a8a", "#86198f", "#0f766e"],
    },
  },
} as const satisfies Record<string, Theme>;

export type ThemeId = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as [ThemeId, ...ThemeId[]];

/** CSS custom properties for a theme, ready to drop into a `style` prop. */
export function themeStyle(id: ThemeId): Record<string, string> {
  const t = THEMES[id].tokens;
  return {
    "--bg": t.bg,
    "--surface": t.surface,
    "--line": t.line,
    "--fg": t.fg,
    "--muted": t.muted,
    "--accent": t.accent,
    "--accent-fg": t.accentFg,
    "--glow-1": t.glow[0],
    "--glow-2": t.glow[1],
    "--glow-3": t.glow[2],
    colorScheme: THEMES[id].scheme,
  };
}
