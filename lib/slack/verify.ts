import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Checks that a request really came from Slack.
 * https://api.slack.com/authentication/verifying-requests-from-slack
 *
 * When a check fails, the reason is logged (never the secret itself) so a
 * misconfigured host shows up clearly in its logs.
 */
export function verifySlackRequest(rawBody: string, headers: Headers): boolean {
  const reason = signatureProblem(rawBody, headers);
  if (reason) console.warn(`Rejected Slack request: ${reason}`);
  return !reason;
}

function signatureProblem(rawBody: string, headers: Headers): string | null {
  // Trim: a stray space or newline pasted into the host's variables would
  // otherwise make every signature mismatch.
  const secret = process.env.SLACK_SIGNING_SECRET?.trim();
  if (!secret) return "SLACK_SIGNING_SECRET is not set on this server";

  const timestamp = headers.get("x-slack-request-timestamp");
  const signature = headers.get("x-slack-signature");
  if (!timestamp || !signature) return "missing Slack signature headers (not a request from Slack)";

  // Reject anything older than five minutes to block replays.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 60 * 5) return "request timestamp is too old";

  const expected =
    "v0=" + createHmac("sha256", secret).update(`v0:${timestamp}:${rawBody}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length === b.length && timingSafeEqual(a, b)) return null;
  return "signature mismatch: SLACK_SIGNING_SECRET doesn't match the Slack app's Signing Secret";
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
