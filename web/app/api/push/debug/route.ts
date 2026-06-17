/**
 * Diagnostic endpoint for the push pipeline. Reuses CRON_SECRET for auth
 * so no new credential is needed. Reports whether the subscription and
 * VAPID keys are actually configured server-side, without leaking the
 * full subscription (just the push service host).
 */
export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = req.headers.get("Authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  if (!expected || auth !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const subEnv = process.env.WIFE_PUSH_SUBSCRIPTION_JSON;
  let subscriptionValid = false;
  let subscriptionEndpointHost: string | null = null;
  if (subEnv) {
    try {
      const sub = JSON.parse(subEnv);
      if (typeof sub?.endpoint === "string") {
        subscriptionValid = true;
        subscriptionEndpointHost = new URL(sub.endpoint).host;
      }
    } catch {
      subscriptionValid = false;
    }
  }

  return Response.json({
    subscription_configured: Boolean(subEnv),
    subscription_valid: subscriptionValid,
    subscription_endpoint_host: subscriptionEndpointHost,
    vapid_public_configured: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    vapid_private_configured: Boolean(process.env.VAPID_PRIVATE_KEY),
  });
}
