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
| `/dai theme` | Switch the site's theme. Also works as `/dai theme winter-2027` |
| `/dai logo` | Upload the logo for a theme. `/dai logo reset` goes back to the theme's built-in logo |
| `/dai list` | See what's on the site, with **Edit** and **Remove** buttons |
| `/dai` | Help |

You can also hover any Slack message → **⋯** → **Post to website** to turn it into
an update (the first line becomes the headline, the first link becomes the link, and
an attached image comes along).

Changes go live a couple of minutes after you save (the host rebuilds the site). The bot confirms each change in the channel.

**Past events** move to the **Past events** tab on their own, and each card keeps the look of the
quarter it happened in (based on each theme's DePaul calendar dates). You can add past events too:
pick a past date in `/dai event`.

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

### Themes: one per quarter

Every quarter gets its own theme, named `[quarter]-[year]`, so Fall 2026 and Fall 2027 can
look completely different. Each one is a folder in [`themes/`](themes):

| Theme | Look |
| --- | --- |
| `spring-2026` | Soft pastel color field from the Spring 2026 logo, frosted-glass cards |
| `fall-2026` | Torn-paper collage: autumn foliage, black construction paper, magazine pages, ransom letters |
| `winter-2027` | Liquid metal with a cyber edge: chrome type, mercury blobs, grid, HUD readouts |
| `spring-2027` | Color explosion (direction still TBD) |
| `off-season` | Quiet dark glow, for breaks or before a quarter's theme is ready |

**Making next quarter's theme:** see [`themes/README.md`](themes/README.md). It's a copy of
an existing folder plus three one-line registrations.

**Brand rule:** the "DAI" wordmark in the logo (and the "DePaul AI" name in the header) is
always **Open Sauce Sans Bold**, at the same size and position. A quarter's logo may only change
its color and the artwork behind it. Quarters with an official logo ship it as
`public/themes/<quarter>/logo.png`; for the rest, [`scripts/generate-logos.mjs`](scripts/generate-logos.mjs)
(`npm run logos`) draws a placeholder from the same Open Sauce letterforms. Any quarter's logo
can also be replaced from Slack with `/dai logo`. The favicon follows the active logo.

## One-time setup

1. **Deploy** on any host that runs `npm run build` + `npm start` and redeploys on every push to
   the production branch (including the bot's commits). The site runs on **Railway**; see
   [Hosting on Railway](#hosting-on-railway). Each change made from Slack is one rebuild.
2. **GitHub token**: create a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new)
   (or one owned by a bot account) with access to **only this repository** and
   **Contents: Read and write**. If `main` has branch protection that blocks direct pushes,
   allow this token's account to bypass it, or point `GITHUB_BRANCH` at a branch that deploys.
3. **Slack app**: at [api.slack.com/apps](https://api.slack.com/apps), choose **Create New App →
   From an app manifest** and paste [`slack/manifest.yml`](slack/manifest.yml). Install it to
   the workspace, then `/invite @website` in the website channel.
4. **Environment variables**: set these on the host and redeploy so they take effect
   (see [`.env.example`](.env.example)):
   - `SLACK_SIGNING_SECRET` (Slack app → Basic Information)
   - `SLACK_BOT_TOKEN` (Slack app → OAuth & Permissions, starts with `xoxb-`)
   - `SLACK_ALLOWED_CHANNELS`: the website channel's ID (channel details → bottom of the About tab)
   - `SLACK_ALLOWED_USERS` *(optional)*: limit editing to specific people
   - `GITHUB_TOKEN`, `GITHUB_REPO`, and `GITHUB_BRANCH` (the branch the host deploys to production)
   - `SITE_URL`: the public address, e.g. `https://depaulai.org` (also used at build time for link previews)
   - Never set `CONTENT_STORE=local` in production: hosts like Railway wipe the disk on every deploy.

### Hosting on Railway

- **Service**: New Project → Deploy from GitHub repo → this repo, production branch `main`.
  Railway detects Next.js and runs `npm run build` / `npm start`; `next start` listens on
  Railway's `PORT` automatically. Node is pinned to >=20.9 in `package.json`.
- **Variables**: add everything above under the service's **Variables** tab.
- **Domain**: Settings → Networking → **Custom Domain** → `depaulai.org` (and `www.depaulai.org`),
  then add the DNS records Railway shows at your registrar. A root domain needs a registrar that
  supports CNAME flattening / ALIAS records (e.g. Cloudflare); otherwise use `www` and redirect
  the root to it.
- **Slack**: point **Slash Commands → /dai** at `https://depaulai.org/api/slack/commands` and
  **Interactivity & Shortcuts** at `https://depaulai.org/api/slack/interactions`. Opening either
  URL in a browser should show *405 Method Not Allowed*, which means it's live.
- **Serverless vs. server**: Railway runs one long-lived Node server, so there are no cold
  starts and the Slack bot's background work (`after()`) isn't subject to function time limits.


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
