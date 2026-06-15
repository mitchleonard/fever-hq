# Fever HQ PWA — deploy runbook

End-to-end, you-with-Claude-walking-you-through-it. ~15 minutes from cold start to your wife getting her first push notification.

## Step 0 — Local sanity (~3 min)

```bash
cd web
npm install
npm run vapid   # generates VAPID keys, prints them to terminal
```

Copy the three lines that print into `web/.env.local`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BL...
VAPID_PRIVATE_KEY=...
VAPID_CONTACT_EMAIL=mailto:mitch@mitchleonard.com
```

Add your Anthropic key to the same `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Run the dev server to eyeball it:
```bash
npm run dev
# open http://localhost:3000
```

You should see Fever HQ with the next-game card (Toronto Tempo, Tuesday Jun 16, 6:00 PM CT on NBA TV) and a chat input.

## Step 1 — Push to GitHub (~2 min)

```bash
cd /Users/mitchellleonard/Desktop/Claude/hackathons/001-fever-bot-20260526
git init  # if not already
git add web/
git commit -m "Fever HQ PWA — initial scaffold"
# Create a new GitHub repo (any name, fever-hq is good)
git remote add origin git@github.com:YOUR_USERNAME/fever-hq.git
git branch -M main
git push -u origin main
```

## Step 2 — Vercel deploy (~3 min)

1. Go to https://vercel.com/new
2. Import the GitHub repo you just pushed
3. **Root directory: `web`** (critical — the Next.js app is in /web, not at repo root)
4. Framework preset: Next.js (auto-detected)
5. Click Deploy. First deploy fails because env vars are missing — that's fine.

## Step 3 — Set env vars in Vercel (~2 min)

Project Settings → Environment Variables. Paste:

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BL... (from Step 0)
VAPID_PRIVATE_KEY=... (from Step 0)
VAPID_CONTACT_EMAIL=mailto:mitch@mitchleonard.com
CRON_SECRET=<generate a random 32-char string, e.g. via `openssl rand -hex 16`>
```

Leave `WIFE_PUSH_SUBSCRIPTION_JSON` blank for now — we fill it in Step 5.

Then Project → Deployments → Redeploy.

## Step 4 — Custom domain (~3 min, optional but recommended)

Vercel Project → Settings → Domains → Add `feverhq.mitchleonard.com` (or whatever subdomain you want). Vercel gives you the CNAME record. Add it at your DNS host (Cloudflare / Namecheap / wherever). Propagation: 1-10 min.

If you skip this, your URL is the `*.vercel.app` Vercel assigns. Works fine — the portfolio piece is stronger with a custom subdomain.

## Step 5 — Your wife's onboarding (~2 min, in person)

On her iPhone, opened in Safari:

1. Visit your Fever HQ URL.
2. After ~2 seconds, the gold "Install Fever HQ" prompt appears at the bottom.
3. She taps the iOS Share icon → Add to Home Screen → Add.
4. New "Fever HQ" icon on her home screen (Fever Navy + Gold FH monogram).
5. Tap the icon to open in standalone mode.
6. Tap into the Schedule view (top right).
7. Tap "Turn on game-day alerts" → iOS asks for notification permission → Allow.

At this point, her phone POSTs her push subscription to your `/api/push/subscribe`. The endpoint logs the subscription JSON to your Vercel logs.

## Step 6 — Grab her subscription, set the env var (~1 min)

In Vercel: Project → Logs. Find the most recent `[push/subscribe] received subscription:` line. Copy the JSON block that follows.

Vercel Settings → Environment Variables → add:
```
WIFE_PUSH_SUBSCRIPTION_JSON=<paste the full JSON, single line>
```

Redeploy.

## Step 7 — Manual test the cron (~30 sec)

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR_VERCEL_URL/api/cron/pregame
```

You'll see one of:
- `{"status": "no-imminent-game"}` — no game in the next 75 min
- `{"status": "queued", "minutes_out": 47}` — game coming, cron will fire on next tick
- `{"status": "sent", ...}` — push fired

Vercel Hobby accounts only allow daily Vercel Cron runs, so the app does not
ship with a Vercel-managed 15-minute cron. For automatic pregame checks on
Hobby, point an external scheduler (cron-job.org, GitHub Actions, etc.) at this
same URL every 15 minutes with the Authorization header. If you upgrade the
Vercel project to Pro, add this cron back to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/pregame",
      "schedule": "0,15,30,45 * * * *"
    }
  ]
}
```

## Step 8 — Calendar piece (~30 sec)

Send your wife one text:
```
Add this to your Google Calendar for every Fever game (paste this link in the "Add by URL" field):

https://YOUR_VERCEL_URL/api/ics
```

She pastes once. Google Calendar pulls fresh every 12 hours. Done forever.

## Ongoing maintenance

When the Fever schedule changes (channel swaps, postponements, playoff seeding):
1. Edit `web/data/schedule.json` with the new game data
2. `git commit && git push`
3. Vercel auto-redeploys
4. Her Google Calendar picks up the change on next refresh
5. The bot uses the new data immediately on her next chat message
6. Pregame texts use the new data on the next cron tick

## Off-season (Nov 1 onward)

`lib/season.ts` returns `email` for Nov-Apr. The cron checks this first and short-circuits to `{"status": "off-season"}` without sending any push. Zero ongoing cost during dormancy except the Vercel free plan (free) and the Anthropic API for any chat messages she sends (~pennies).

When May 1 rolls around, the system reactivates automatically. No code change needed.

## Cost summary

| Item | Cost |
|---|---|
| Vercel Hobby | Free |
| GitHub repo | Free |
| Domain DNS | $0 (using existing mitchleonard.com) |
| Anthropic API | ~$1-5/year at realistic chat volume |
| Web Push | Free (browser standard) |
| **Total annual** | **~$1-5/year** |
