/**
 * Hero art per theme: an optional `Decor` (decorative layer behind the hero)
 * and an optional `Title` (a custom treatment of the site title). Themes
 * without an entry get a plain title on their background.
 */
import type { ThemeId } from ".";
import * as fall2026 from "./fall-2026/Hero";
import * as winter2027 from "./winter-2027/Hero";
import * as spring2026 from "./spring-2026/Hero";
import * as spring2027 from "./spring-2027/Hero";
import * as offSeason from "./off-season/Hero";

type HeroArt = {
  Decor?: () => React.ReactNode;
  Title?: (props: { title: string }) => React.ReactNode;
};

export const HERO: Partial<Record<ThemeId, HeroArt>> = {
  "fall-2026": fall2026,
  "winter-2027": winter2027,
  "spring-2026": spring2026,
  "spring-2027": spring2027,
  "off-season": offSeason,
};
