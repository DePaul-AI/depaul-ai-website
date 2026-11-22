import { createHmac, timingSafeEqual } from "node:crypto";
import { refreshSite } from "@/lib/content/live";

/**
 * GitHub webhook: when content is edited directly on GitHub (not through
 * Slack), refresh the site right away instead of waiting for the cache to
 * expire. Optional. Set it up in the repo's Settings → Webhooks (see README),
 * with GITHUB_WEBHOOK_SECRET as the secret.
 */
export async function POST(request: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
  if (!secret) return new Response("Webhook not configured", { status: 404 });

  const raw = await request.text();
  const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
  const given = request.headers.get("x-hub-signature-256") ?? "";
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    console.warn("Rejected GitHub webhook: signature mismatch");
    return new Response("Invalid signature", { status: 401 });
  }

  refreshSite();
  return Response.json({ refreshed: true });
}
