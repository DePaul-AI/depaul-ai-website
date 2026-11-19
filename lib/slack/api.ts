import "server-only";

/** Minimal Slack Web API client — we only need a handful of methods. */
export async function slack<T = Record<string, unknown>>(
  method: string,
  body: Record<string, unknown>,
): Promise<T & { ok: boolean; error?: string }> {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) console.error(`Slack ${method} failed:`, data.error, data.response_metadata);
  return data;
}

/** Post to the channel the change came from; fall back to a DM if the bot isn't in it. */
export async function notify(channel: string | undefined, user: string, text: string) {
  try {
    if (channel) {
      const res = await slack("chat.postMessage", { channel, text, unfurl_links: false });
      if (res.ok) return;
    }
    await slack("chat.postMessage", { channel: user, text, unfurl_links: false });
  } catch (err) {
    // A failed confirmation shouldn't look like a failed save.
    console.error("Slack notify failed:", err);
  }
}

/** Reply to a slash command or button click using its response_url. */
export async function respond(
  responseUrl: string,
  message: Record<string, unknown> & { text: string },
) {
  try {
    await fetch(responseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response_type: "ephemeral", ...message }),
    });
  } catch (err) {
    console.error("Slack respond failed:", err);
  }
}

export function siteUrl() {
  return (process.env.SITE_URL || "https://depaulai.org").replace(/\/$/, "");
}

/** Escape user text for Slack mrkdwn. */
export function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
