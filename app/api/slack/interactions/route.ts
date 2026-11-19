import { after } from "next/server";
import { verifySlackRequest, channelAllowed, userAllowed } from "@/lib/slack/verify";
import { notify, respond, siteUrl } from "@/lib/slack/api";
import { draftFromMessage, handleSubmission, openModal, removeItem, type ItemRef } from "@/lib/slack/handlers";
import type { ModalKind, ModalMeta, StateValues } from "@/lib/slack/views";

/**
 * Handles everything interactive: modal submissions, the Edit/Remove buttons
 * from `/dai list`, and the "Post to website" message shortcut.
 */

type Payload = {
  type: string;
  trigger_id?: string;
  callback_id?: string;
  response_url?: string;
  user: { id: string; username?: string; name?: string };
  channel?: { id: string };
  message?: { text?: string; files?: { id: string; mimetype?: string; size?: number }[] };
  actions?: { action_id: string; value?: string }[];
  view?: {
    callback_id: string;
    private_metadata?: string;
    state: { values: StateValues };
  };
};

const KINDS: ModalKind[] = ["event", "post", "link", "countdown", "announce", "theme", "logo"];

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySlackRequest(raw, request.headers)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(new URLSearchParams(raw).get("payload") ?? "{}") as Payload;
  const user = payload.user?.id;
  const by = `(via Slack, @${payload.user?.username ?? payload.user?.name ?? user})`;

  if (!userAllowed(user)) return denied(payload);

  // ---- a modal form was submitted --------------------------------------------
  if (payload.type === "view_submission" && payload.view) {
    const kind = payload.view.callback_id as ModalKind;
    if (!KINDS.includes(kind)) return empty();
    const meta = JSON.parse(payload.view.private_metadata || "{}") as ModalMeta;
    const result = handleSubmission(kind, payload.view.state.values, meta, by);

    if ("errors" in result) {
      return Response.json({ response_action: "errors", errors: result.errors });
    }
    after(async () => {
      try {
        const done = await result.apply();
        await notify(meta.channel, user, `:white_check_mark: <@${user}> ${done}. Live on <${siteUrl()}|the site> in a couple of minutes.`);
      } catch (err) {
        await notify(undefined, user, `:warning: Your website change didn't save: ${(err as Error).message}`);
      }
    });
    return empty(); // closes the modal
  }

  // Everything below starts from a channel, so enforce the channel allowlist.
  const channel = payload.channel?.id;
  if (!channelAllowed(channel)) return denied(payload);

  // ---- "Post to website" message shortcut ------------------------------------
  if (payload.type === "message_action" && payload.callback_id === "post_to_website") {
    const { fileId, ...draft } = draftFromMessage(payload.message?.text ?? "", payload.message?.files);
    await openModal("post", payload.trigger_id!, { channel, fileId }, draft);
    return empty();
  }

  // ---- Edit / Remove buttons from /dai list ----------------------------------
  if (payload.type === "block_actions" && payload.actions?.[0]) {
    const action = payload.actions[0];
    const ref = JSON.parse(action.value ?? "{}") as ItemRef;

    if (action.action_id === "edit") {
      const kind: ModalKind = ref.key === "events" ? "event" : ref.key === "posts" ? "post" : "link";
      await openModal(kind, payload.trigger_id!, { channel, id: ref.id });
      return empty();
    }

    if (action.action_id === "remove") {
      after(async () => {
        try {
          const done = await removeItem(ref, by);
          await notify(channel, user, `:wastebasket: <@${user}> ${done} from <${siteUrl()}|the site>.`);
        } catch (err) {
          if (payload.response_url) await respond(payload.response_url, { text: `:warning: ${(err as Error).message}`, replace_original: false });
        }
      });
      return empty();
    }
  }

  return empty();
}

function denied(payload: Payload) {
  if (payload.type === "view_submission") {
    after(() => notify(undefined, payload.user.id, "You don't have permission to edit the website."));
    return empty();
  }
  if (payload.response_url) {
    after(() => respond(payload.response_url!, { text: "You don't have permission to edit the website here.", replace_original: false }));
  }
  return empty();
}

function empty() {
  return new Response(null, { status: 200 });
}
