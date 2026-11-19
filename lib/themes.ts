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
    // Newspaper cut-outs and handmade collage
    label: "Fall",
    season: "Fall Quarter",
    scheme: "light",
    tokens: {
      bg: "#ebe3d2",
      surface: "#f8f4ea",
      line: "#c8baa0",
      fg: "#1c1814",
      muted: "#5e5448",
      accent: "#c2471b",
      accentFg: "#fff8ef",
      glow: ["#d4572a", "#e0a526", "#7a2e1a"],
    },
  },
  winter: {
    // Liquid metal with a cyber edge: blue, silver, white
    label: "Winter",
    season: "Winter Quarter",
    scheme: "dark",
    tokens: {
      bg: "#05080f",
      surface: "#0b1220",
      line: "#22324a",
      fg: "#eef4ff",
      muted: "#93a5c2",
      accent: "#a9d1ff",
      accentFg: "#04101f",
      glow: ["#2563eb", "#94a3b8", "#0ea5e9"],
    },
  },
  spring: {
    // Color explosion (a louder remix of the original pastel logo)
    label: "Spring",
    season: "Spring Quarter",
    scheme: "light",
    tokens: {
      bg: "#fff6ec",
      surface: "#ffffff",
      line: "#f0d9c8",
      fg: "#1d1030",
      muted: "#6b5a73",
      accent: "#ff2d87",
      accentFg: "#ffffff",
      glow: ["#ff2d87", "#ffd400", "#00b8ff"],
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

/**
 * The logo for a theme: the one uploaded with `/dai logo`, or the theme's
 * built-in design in public/logos/<theme>.svg.
 */
export function logoFor(id: ThemeId, custom: Partial<Record<ThemeId, string>> = {}): string {
  return custom[id] ?? `/logos/${id}.svg`;
}

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
