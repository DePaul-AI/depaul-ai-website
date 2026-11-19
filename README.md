<p align="center">
  <img src="public/dai-logo.png" alt="DePaul AI Logo" width="120" />
</p>

<h1 align="center">DePaul AI — Official Website</h1>

<p align="center">
  <a href="https://www.depaulai.org">https://depaulai.org/</a>
</p>

---

The site is built so that **nobody has to touch code to keep it current**. Events,
the main countdown, news updates, pinned links, the top banner, the seasonal
theme and the logo are all edited from Slack with `/dai`.

## Updating the site (for board members)

In the website channel in Slack:

| Command | What it does |
| --- | --- |
| `/dai event` | Add an event (name, time, place, description, RSVP link, flyer image) |
| `/dai post` | Share an update on the news feed, optionally with a link and image |
| `/dai countdown` | Set the big countdown at the top. `/dai countdown clear` makes it follow the next event automatically |
| `/dai announce` | Show a banner across the top of the site. `/dai announce clear` removes it |
| `/dai link` | Pin a link button (join form, Discord, …) |
| `/dai theme` | Switch the seasonal theme. Also works as `/dai theme winter` |
| `/dai logo` | Upload the logo for a theme. `/dai logo reset` goes back to the theme's built-in logo |
| `/dai list` | See what's on the site, with **Edit** and **Remove** buttons |
| `/dai` | Help |

You can also hover any Slack message → **⋯** → **Post to website** to turn it into
an update (the first line becomes the headline, the first link becomes the link, and
an attached image comes along).

Changes go live about a minute after you save. The bot confirms each change in the channel.

**Past events** move into the "Past events" list on their own. Nothing needs cleaning up.

## How it works

```
Slack /dai ──► /api/slack/* (this Next.js app) ──► commits to content/*.json on GitHub
                                                            │
                                     hosting redeploys on push ◄┘
```

- All editable content lives in [`content/`](content): `site.json` (theme, logos, hero,
  countdown, banner, links), `events.json`, and `posts.json`. You can also edit these
  directly on GitHub.
- Images uploaded in Slack are saved to `public/uploads/` in the same commit as the change
  that uses them.
- Every file is checked against [`lib/content/schema.ts`](lib/content/schema.ts) both by the
  bot before it commits and by the build. A bad edit fails the build, and the last good
  version stays live.
- Every change is a git commit like `content: added event "…" (via Slack, @name)`, so
  there's a full history and anything can be reverted.
- Times are shown in Chicago time.

### Themes and logos

Each quarter gets its own look, not just its own colors:

| Theme | Look |
| --- | --- |
| `fall` | Newspaper cut-outs and handmade collage: ransom-note title, tape, clippings, ink stamp |
| `winter` | Liquid metal with a cyber edge: chrome type, mercury blobs, grid, HUD readouts |
| `spring` | Color explosion, a louder remix of the original pastel logo: sticker type, confetti, chunky cards |
| `summer`, `midnight` | Simple glow themes (summer break / off-season) |

A theme is made of:

- **Colors** in [`lib/themes.ts`](lib/themes.ts) (the id there is what `/dai theme` lists)
- **Styles** in `app/themes/<theme>.css`. Components use shared classes (`.card`,
  `.btn-primary`, `.section-title`, `.countdown-box`, `.hero-title`…) defined in
  [`app/globals.css`](app/globals.css), and each theme restyles them under
  `[data-theme="<theme>"]`. Fonts are picked there too (all loaded in [`app/fonts.ts`](app/fonts.ts)).
- **Hero decoration** in [`app/themes/Decor.tsx`](app/themes/Decor.tsx) (optional; falls back to a soft glow)
- **A default logo** at `public/logos/<theme>.svg`

Logos follow the theme: switching to winter shows the winter logo, favicon included.
Upload a replacement for any theme with `/dai logo`; the built-in SVG is used when
there's no upload. To redesign a built-in logo, replace its SVG file.

To add a theme: add colors in `lib/themes.ts`, a logo SVG in `public/logos/`, and
optionally a CSS file (imported in `app/layout.tsx`) and a `Decor` entry.

## One-time setup

1. **Deploy** the repo to Vercel (or any host that runs Next.js and redeploys on push to `main`).
2. **GitHub token**: create a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new)
   (or one owned by a bot account) with access to **only this repository** and
   **Contents: Read and write**. If `main` has branch protection that blocks direct pushes,
   allow this token's account to bypass it, or point `GITHUB_BRANCH` at a branch that deploys.
3. **Slack app**: at [api.slack.com/apps](https://api.slack.com/apps), choose **Create New App →
   From an app manifest** and paste [`slack/manifest.yml`](slack/manifest.yml). Install it to
   the workspace, then `/invite @website` in the website channel.
4. **Environment variables**: set these on the host (see [`.env.example`](.env.example)):
   - `SLACK_SIGNING_SECRET` (Slack app → Basic Information)
   - `SLACK_BOT_TOKEN` (Slack app → OAuth & Permissions, starts with `xoxb-`)
   - `SLACK_ALLOWED_CHANNELS`: the website channel's ID (channel details → bottom of the About tab)
   - `SLACK_ALLOWED_USERS` *(optional)*: limit editing to specific people
   - `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`
   - `SITE_URL`

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without a `GITHUB_TOKEN`, the bot edits the files in `content/` on your machine directly
(`CONTENT_STORE=local`). To try it against real Slack locally, expose your dev server with a
tunnel (e.g. `ngrok http 3000`) and point a test Slack app's URLs at it.

## Contributing

**Not a member of DePaul AI?** _(note: there is a good chance your changes will not be merged)_

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Push to your fork and open a pull request

**Member of DePaul AI?**

1. Clone the repository
2. Create a new branch
3. Make your changes
4. Push to the repository and open a pull request
