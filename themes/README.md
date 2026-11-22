# Themes

Each quarter has its own theme, named `[quarter]-[year]` (`fall-2026`, `winter-2027`, …).
The site wears one at a time (set from Slack with `/dai theme <name>`), and past
event cards are drawn in the theme of the quarter they happened in.

## What's in a theme folder

```
themes/fall-2026/
  theme.ts     name, DePaul calendar dates, light/dark, logo path
  styles.css   everything visual: colors, fonts, how cards/buttons/titles look
  Hero.tsx     optional: decorative art behind the hero, and/or a custom title
public/themes/fall-2026/
  logo.png     the quarter's logo (logo.svg is fine too)
  …            any images the styles use (textures, etc.)
```

## Making next quarter's theme

1. **Copy a folder.** Duplicate the theme closest to what you want, e.g.
   `themes/fall-2026` → `themes/fall-2027`, and `public/themes/fall-2026` → `public/themes/fall-2027`.
2. **Edit `theme.ts`.** Update `label`, `season`, the `dates` from
   [DePaul's academic calendar](https://academics.depaul.edu/calendar/), `background`
   (same as `--bg` in your styles), and `logo`.
3. **Edit `styles.css`.** Change the first line inside `@scope` to your folder name:
   `@scope ([data-theme="fall-2027"]) to ([data-theme])`. Then go wild. Start with the
   palette block at the top; the rest restyles shared classes like `.card`, `.btn-primary`,
   `.section-title`, `.countdown-box`, `.hero-title`, `.date-tile`. Rename any
   `@keyframes` so they don't clash with other themes (prefix them with the folder name).
4. **Register it** (one line each):
   - `themes/index.ts`: import `./fall-2027/theme` and add it to `THEMES`
   - `themes/styles.css`: `@import "./fall-2027/styles.css";`
   - `themes/hero.tsx`: only if you made a `Hero.tsx`
5. **Logo.** Drop the official logo in `public/themes/fall-2027/logo.png`. No logo yet?
   Add the quarter to `scripts/generate-logos.mjs` and run `npm run logos` for a
   placeholder. Remember the brand rule: the DAI wordmark is always Open Sauce Sans Bold;
   only its color and background change.
6. **Try it locally** with `npm run dev`, setting `"theme": "fall-2027"` in
   `content/site.json`, and check the Past events tab too.
7. **Ship it**: open a pull request. Once it's deployed, switch the live site with
   `/dai theme fall-2027` in Slack.

## Rules of thumb

- **Keep everything inside your theme's `@scope` block.** That's what stops your styles from
  leaking into other quarters' past event cards (and theirs into yours).
- **Use the palette variables** (`--bg`, `--surface`, `--fg`, `--muted`, `--accent`, …) and
  Tailwind's theme colors (`bg-surface`, `text-muted`, …) rather than hard-coding colors in markup.
- **Fonts** are loaded in `app/fonts.ts`; a theme picks them by setting `--font-body` and
  `--font-heading` in its palette block.
  A theme can also bring its own: put `.woff2` files in `public/themes/<quarter>/fonts/`
  and declare them with `@font-face` at the top of its `styles.css` (see `winter-2027`).
  Name the family something unique so it can't clash with another quarter's.
- **Old themes stay.** Don't delete a past quarter's folder: its past events still use it.
