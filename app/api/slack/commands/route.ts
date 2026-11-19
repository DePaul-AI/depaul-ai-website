import { after } from "next/server";
import { verifySlackRequest, channelAllowed, userAllowed } from "@/lib/slack/verify";
import { notify, respond, siteUrl } from "@/lib/slack/api";
import { clearSiteField, findItem, listBlocks, openModal, removeItem, resetLogo, setTheme } from "@/lib/slack/handlers";
import { THEMES, THEME_IDS, type ThemeId } from "@/themes";

/**
 * Handles the `/dai` slash command. Slack needs an answer within 3 seconds,
 * so anything slow (GitHub commits) runs in `after()` and reports back via
 * response_url / a channel message.
 */

const HELP = [
  "*Update the DePaul AI website from Slack*",
  "`/dai event` — add an event",
  "`/dai post` — share an update or link on the news feed",
  "`/dai countdown` — set the big countdown (`/dai countdown clear` to follow the next event)",
  "`/dai announce` — banner across the top of the site (`/dai announce clear` to remove)",
  "`/dai link` — pin a link button (join form, Discord, …)",
  `\`/dai theme\` — switch the seasonal theme (${THEME_IDS.join(", ")})`,
  "`/dai logo` — upload the logo for a theme (`/dai logo reset` to use the built-in one)",
  "`/dai list` — see what's on the site, edit or remove things",
  "",
  "_Tip: on any message, choose ⋯ → *Post to website* to turn it into an update._",
].join("\n");

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySlackRequest(raw, request.headers)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const p = new URLSearchParams(raw);
  const channel = p.get("channel_id") ?? undefined;
  const user = p.get("user_id") ?? "";
  const by = `(via Slack, @${p.get("user_name") ?? user})`;
  const triggerId = p.get("trigger_id") ?? "";
  const responseUrl = p.get("response_url") ?? "";
  const [sub = "help", ...rest] = (p.get("text") ?? "").trim().split(/\s+/);
  const arg = rest.join(" ").toLowerCase();

  if (!channelAllowed(channel)) {
    return reply("The website bot only works in the website channel.");
  }
  if (!userAllowed(user)) {
    return reply("You're not on the list of people who can edit the website — ask a board member to add you.");
  }

  // Run a slow change after responding, then confirm in the channel.
  const later = (work: () => Promise<string>) => {
    after(async () => {
      try {
        const done = await work();
        await notify(channel, user, `:white_check_mark: <@${user}> ${done}. Live on <${siteUrl()}|the site> in a couple of minutes.`);
      } catch (err) {
        await respond(responseUrl, { text: `:warning: That didn't save: ${(err as Error).message}` });
      }
    });
    return reply("On it…");
  };

  try {
    switch (sub.toLowerCase()) {
      case "event":
      case "events":
        await openModal("event", triggerId, { channel });
        return empty();
      case "post":
      case "news":
      case "update":
        await openModal("post", triggerId, { channel });
        return empty();
      case "link":
      case "links":
        await openModal("link", triggerId, { channel });
        return empty();
      case "countdown":
        if (arg === "clear") return later(() => clearSiteField("countdown", by));
        await openModal("countdown", triggerId, { channel });
        return empty();
      case "announce":
      case "banner":
        if (arg === "clear") return later(() => clearSiteField("announcement", by));
        await openModal("announce", triggerId, { channel });
        return empty();
      case "theme":
        if (arg) {
          if (!(arg in THEMES)) return reply(`Unknown theme \`${arg}\`. Try one of: ${THEME_IDS.join(", ")}`);
          return later(() => setTheme(arg as ThemeId, by));
        }
        await openModal("theme", triggerId, { channel });
        return empty();
      case "logo":
        if (arg.startsWith("reset")) {
          const theme = arg.split(" ")[1];
          if (theme && !(theme in THEMES)) return reply(`Unknown theme \`${theme}\`. Try one of: ${THEME_IDS.join(", ")}`);
          return later(() => resetLogo(theme as ThemeId | undefined, by));
        }
        await openModal("logo", triggerId, { channel });
        return empty();
      case "list":
        // Reading from GitHub can be slow, so send the list via response_url.
        after(async () => {
          try {
            await respond(responseUrl, { text: "What's on the website", blocks: await listBlocks() });
          } catch (err) {
            await respond(responseUrl, { text: `:warning: Couldn't load the list: ${(err as Error).message}` });
          }
        });
        return reply("Loading…");
      case "remove":
      case "delete": {
        if (!arg) return reply("Usage: `/dai remove <id>` — or use the Remove buttons in `/dai list`.");
        return later(async () => {
          const ref = await findItem(arg);
          if (!ref) throw new Error(`nothing with id \`${arg}\` is on the site`);
          return removeItem(ref, by);
        });
      }
      default:
        return reply(HELP);
    }
  } catch (err) {
    return reply(`:warning: ${(err as Error).message}`);
  }
}

function reply(text: string) {
  return Response.json({ response_type: "ephemeral", text });
}

function empty() {
  return new Response(null, { status: 200 });
}
