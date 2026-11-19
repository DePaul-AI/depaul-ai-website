import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Checks that a request really came from Slack.
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackRequest(rawBody: string, headers: Headers): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) return false;

  const timestamp = headers.get("x-slack-request-timestamp");
  const signature = headers.get("x-slack-signature");
  if (!timestamp || !signature) return false;

  // Reject anything older than five minutes to block replays.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 60 * 5) return false;

  const expected =
    "v0=" + createHmac("sha256", secret).update(`v0:${timestamp}:${rawBody}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

function list(name: string) {
  return (process.env[name] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** If SLACK_ALLOWED_CHANNELS is set, the bot only responds in those channels. */
export function channelAllowed(channelId: string | undefined) {
  const allowed = list("SLACK_ALLOWED_CHANNELS");
  return allowed.length === 0 || (!!channelId && allowed.includes(channelId));
}

/** If SLACK_ALLOWED_USERS is set, only those people can make changes. */
export function userAllowed(userId: string | undefined) {
  const allowed = list("SLACK_ALLOWED_USERS");
  return allowed.length === 0 || (!!userId && allowed.includes(userId));
}
