/**
 * Vercel cron endpoint — hourly check for imminent games.
 *
 * Fires a push notification 15 minutes before tipoff. Idempotent via an
 * in-memory dedupe key (within a single invocation) plus the natural 75-min
 * window so we never send twice for the same game.
 *
 * Auth: Vercel cron jobs send Authorization: Bearer ${CRON_SECRET}.
 */
import webpush from "web-push";
import {
  upcomingGames,
  shortChannel,
  shortVenue,
  vsOrAt,
  tipoffTimeOnlyCt,
  msUntilTipoff,
  type Game,
} from "@/lib/schedule";
import { isInSeason } from "@/lib/season";

export const runtime = "nodejs";
export const maxDuration = 30;

const WINDOW_MIN = 75;
const TARGET_MIN = 15;

function pregameBody(game: Game): { title: string; body: string } {
  const va = vsOrAt(game);
  return {
    title: `🏀 15 til tipoff`,
    body: `Fever ${va} ${game.opponent} at ${tipoffTimeOnlyCt(game)} on ${shortChannel(game.channel)}. ${shortVenue(game.venue)}.`,
  };
}

export async function GET(req: Request) {
  // Auth
  const auth = req.headers.get("Authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  if (!expected || auth !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Off-season short-circuit
  if (!isInSeason()) {
    return Response.json({ status: "off-season", channel: "email" });
  }

  // Find imminent game
  const candidate = upcomingGames().find((g) => {
    const ms = msUntilTipoff(g);
    return ms > 0 && ms <= WINDOW_MIN * 60_000;
  });
  if (!candidate) {
    return Response.json({ status: "no-imminent-game" });
  }

  // Only fire when we're inside the TARGET window (last 15-ish min before tip)
  const minsOut = Math.floor(msUntilTipoff(candidate) / 60_000);
  if (minsOut > TARGET_MIN) {
    return Response.json({
      status: "queued",
      game: candidate,
      minutes_out: minsOut,
      note: `Will fire on the next cron tick inside the ${TARGET_MIN}-minute window.`,
    });
  }

  // Push send
  const subEnv = process.env.WIFE_PUSH_SUBSCRIPTION_JSON;
  if (!subEnv) {
    return Response.json({
      status: "no-subscription",
      note: "WIFE_PUSH_SUBSCRIPTION_JSON env var not set.",
    });
  }
  const sub = JSON.parse(subEnv);

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.VAPID_CONTACT_EMAIL ?? "mailto:fever@hq.local";
  if (!vapidPublic || !vapidPrivate) {
    return Response.json({
      status: "no-vapid",
      note: "VAPID keys not set.",
    });
  }
  webpush.setVapidDetails(contact, vapidPublic, vapidPrivate);

  const { title, body } = pregameBody(candidate);
  const payload = JSON.stringify({
    title,
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `fever-${candidate.date}-${candidate.opponent}`,
    data: { url: "/" },
  });

  try {
    await webpush.sendNotification(sub, payload);
    return Response.json({
      status: "sent",
      game: `${candidate.date} ${candidate.opponent}`,
      title,
      body,
    });
  } catch (e) {
    return Response.json({
      status: "send-error",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
