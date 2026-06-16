# Fever HQ — deploy runbook

Once you have Twilio number + creds + Anthropic key + Vercel account, you'll do this. ~10 minutes start to finish.

## Step 1 — Create the Vercel project (3 min)

- [ ] Push the `src/` folder to a new GitHub repo named `fever-hq` (private is fine)
- [ ] In Vercel: **New Project → Import** from GitHub → pick `fever-hq`
- [ ] Framework preset: **Other**
- [ ] Root directory: `src` (because our code lives there, not at repo root)
- [ ] Build & dev settings: leave defaults (the `vercel.json` handles routing)
- [ ] **Skip deploy** for now — finish env vars first

## Step 2 — Set env vars in Vercel (3 min)

Project → **Settings → Environment Variables**. Add each one for all environments (Production, Preview, Development):

```
TWILIO_ACCOUNT_SID         AC_yours
TWILIO_AUTH_TOKEN          your_token
TWILIO_FROM_NUMBER         +1...
ANTHROPIC_API_KEY          sk-ant-...
FEVER_HQ_WIFE_NUMBER       +1...
TWILIO_FORCE_TEST_TO       +1_YOUR_OWN_NUMBER     # delete this AFTER end-to-end test passes
CRON_SECRET                <generate a random 32-char string>
```

## Step 3 — First deploy (2 min)

- [ ] Vercel → Project → **Deploy** (or push another commit)
- [ ] Wait for green check
- [ ] Note your production URL: `https://fever-hq-<hash>.vercel.app`
- [ ] Add a custom domain later if you want — `fever-hq.mitchleonard.com` reads great in the portfolio

## Step 4 — Wire the Twilio webhook (1 min)

- [ ] Twilio Console → **Phone Numbers → Manage → Active Numbers**
- [ ] Click your Fever HQ number
- [ ] Under **Messaging**: A message comes in → Webhook → `https://YOUR_VERCEL_URL/sms` → HTTP POST
- [ ] Save

## Step 5 — End-to-end test (1 min)

While `TWILIO_FORCE_TEST_TO` is still your own number:

- [ ] From your phone, text your Fever HQ number: "when's the next game"
- [ ] Should get a reply within 5 seconds in sports-radio voice
- [ ] Try a pregame trigger: visit `https://YOUR_VERCEL_URL/cron/pregame` with `Authorization: Bearer YOUR_CRON_SECRET` in the headers (use `curl -H` or Postman). Should respond with one of: sent, no-imminent-game, already-sent.
- [ ] If a game is within 75 min: you'll get the pregame text on your own number (because of FORCE_TEST_TO)

## Step 6 — Flip to production (30 sec)

After you've confirmed:
- [ ] Inbound replies work
- [ ] The pregame text reads right
- [ ] The Fever HQ contact saved on her phone with a photo

Then:
- [ ] Vercel → Settings → Environment Variables → **DELETE** `TWILIO_FORCE_TEST_TO`
- [ ] Send her the welcome email from `src/welcome-email.md` (replace `[YOUR_VERCEL_URL]` and `[YOUR_TWILIO_NUMBER]` placeholders)
- [ ] After she opens the email and saves the contact, manually fire the intro SMS:
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" \
    "https://YOUR_VERCEL_URL/cron/pregame"
  ```
  …actually that's the cron — for the intro, you can just text from your own Fever HQ console in Twilio, or run `pregame_send.py` locally with an override body. Easiest: open Twilio Console → Phone Numbers → your number → Send Test SMS → paste the contents of `src/intro-sms.txt`.

## Step 7 — Verify the calendar piece (2 min)

- [ ] Open `https://YOUR_VERCEL_URL/fever-2026.ics` in your browser — should download a 23KB ICS file
- [ ] On your own Google Calendar: **+ Other calendars → From URL** → paste the URL → Add
- [ ] Confirm Fever games show up in your calendar
- [ ] If yes — the URL works. Drop it into the welcome email to your wife.

## When schedule changes happen

The Fever schedule mutates a few times a season (channel swaps, postponements, playoff seeding). To update:

1. Edit `src/schedule.json` with the new game data
2. Commit + push to GitHub
3. Vercel auto-redeploys
4. Wife's Google Calendar pulls the updated ICS on its 12-hour refresh interval

You can also automate this via a weekly Claude scheduled task that re-scrapes Sports Brackets and opens a PR — left as a v2 optimization.

## Hibernation (Nov 1)

The `season.py` detector auto-switches to email at Nov 1. The Vercel cron keeps running but `pregame_send.run()` returns `{"status": "off-season"}` and never sends SMS. Zero ongoing cost during dormancy except the $1.15/mo Twilio number rental.

If you want truly zero off-season cost:
- Release the Twilio number Oct 31
- Repurchase a new one each May 1 (different area code is fine; wife re-saves contact, minor friction)
- Saves ~$7/year

Recommendation: keep the number all year. The continuity is worth the $7.
