/**
 * Stores the wife's push subscription so the cron can target her.
 *
 * MVP: single-user. The endpoint logs the subscription JSON to the response
 * body so Mitch can copy it into the WIFE_PUSH_SUBSCRIPTION_JSON env var
 * in Vercel. (A v2 would persist to Upstash Redis or Vercel KV.)
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  let sub: unknown;
  try {
    sub = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }
  const payload = JSON.stringify(sub, null, 2);
  console.log("[push/subscribe] received subscription:\n" + payload);
  return new Response(
    JSON.stringify({
      ok: true,
      message: "Subscription received. Mitch will wire it server-side.",
      copyToEnv: payload,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}
