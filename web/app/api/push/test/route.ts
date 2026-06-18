/**
 * Fires an immediate test push to every configured subscriber. Lets you
 * verify the whole pipeline (VAPID, subscription, service worker) works
 * without waiting for an actual game to enter its 15-minute pregame window.
 *
 * Auth: same Bearer ${CRON_SECRET} as the other ops endpoints.
 */
import webpush from "web-push";
import { getPushSubscribers } from "@/lib/pushSubscribers";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = req.headers.get("Authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  if (!expected || auth !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const subscribers = getPushSubscribers();
  if (subscribers.length === 0) {
    return Response.json({
      status: "no-subscription",
      note: "No subscriber env vars set (WIFE_PUSH_SUBSCRIPTION_JSON / TESTER_PUSH_SUBSCRIPTION_JSON).",
    });
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.VAPID_CONTACT_EMAIL ?? "mailto:fever@hq.local";
  if (!vapidPublic || !vapidPrivate) {
    return Response.json({ status: "no-vapid", note: "VAPID keys not set." });
  }
  webpush.setVapidDetails(contact, vapidPublic, vapidPrivate);

  const payload = JSON.stringify({
    title: "🏀 Fever HQ test push",
    body: "If you see this, push notifications are wired up correctly.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "fever-hq-test",
    data: { url: "/" },
  });

  const recipients = await Promise.all(
    subscribers.map(async ({ label, subscription }) => {
      try {
        await webpush.sendNotification(subscription, payload);
        return { label, status: "sent" };
      } catch (e) {
        return {
          label,
          status: "send-error",
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }),
  );

  return Response.json({ status: "done", recipients });
}
