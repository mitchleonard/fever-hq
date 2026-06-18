/**
 * Diagnostic endpoint for the push pipeline. Reuses CRON_SECRET for auth
 * so no new credential is needed. Reports which subscribers and VAPID
 * keys are actually configured server-side, without leaking the full
 * subscription (just the push service host per subscriber).
 */
import { getPushSubscribers } from "@/lib/pushSubscribers";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = req.headers.get("Authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  if (!expected || auth !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const subscribers = getPushSubscribers().map(({ label, subscription }) => ({
    label,
    endpoint_host: new URL(subscription.endpoint).host,
  }));

  return Response.json({
    subscribers,
    subscriber_count: subscribers.length,
    vapid_public_configured: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    vapid_private_configured: Boolean(process.env.VAPID_PRIVATE_KEY),
  });
}
