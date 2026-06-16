# Fever HQ — Twilio + Anthropic signup checklist

While I build the integration, knock these out in the background. Total: ~12 minutes.

> **Note:** This supersedes `SETUP-PLIVO.md`. Provider decision: **Twilio** (portfolio brand recognition + best docs).

## Step 1 — Sign up for Twilio (3 min)

- [ ] Go to https://www.twilio.com/try-twilio
- [ ] Sign up with `mitchleonardwork@gmail.com` (or any email — doesn't matter, it's your account)
- [ ] Verify your email + your personal cell (Twilio requires phone verification — use *your* number, not your wife's)
- [ ] Project name: **Fever HQ**
- [ ] Twilio gives you ~$15 in trial credit. Tag the account product as "SMS."

## Step 2 — Upgrade past the trial restriction (2 min)

Twilio's trial only lets you send to verified numbers. To send freely (including to your wife) you have to **upgrade**:

- [ ] Console → **Billing** → **Upgrade**
- [ ] Pay-as-you-go, **$20 minimum top-up**. This is the line item I told you about — it's the cost of bypassing the verification friction.
- [ ] Credit card required at upgrade.

## Step 3 — Buy a phone number (2 min)

- [ ] Console → **Phone Numbers → Manage → Buy a number**
- [ ] Country: United States. Capabilities: **SMS** (you don't need voice or MMS yet)
- [ ] Try area code **317** (Indianapolis) for Fever HQ brand consistency
- [ ] Backup area codes: **463**, **765** (also Indiana)
- [ ] Buy. ~$1.15/month. First month from your top-up.
- [ ] **Send me the full number** in format `+13175551234`

## Step 4 — Register A2P 10DLC (the only landmine — 15 min once, then wait)

US carriers require 10DLC registration for any application-to-person SMS. Without it your messages get filtered, especially T-Mobile.

Twilio walks you through it: **Messaging → Regulatory Compliance → A2P 10DLC**

- [ ] Register a **Brand**: Sole Proprietor profile, your name, your address. One-time ~$4 fee.
- [ ] Register a **Campaign**: Use case = **Low Volume Mixed**. Description: "Personal notification service for one recipient — WNBA game alerts and informational replies."  One-time ~$15 fee. Throughput ~1 msg/sec.
- [ ] Approval: usually 24h, occasionally 48h.

**Honest read:** if you skip 10DLC, the bot works for testing for a few days before T-Mobile starts blocking. If your wife is on T-Mobile, you need this. If she's on Verizon or AT&T, you have more leeway but should still register.

I'll build the code so it can send the moment your number is live, before 10DLC clears.

## Step 5 — Grab your Twilio credentials (1 min)

- [ ] Console home page (top right): **Account SID** (`AC...`) and **Auth Token** (click to reveal)
- [ ] Send these to me. *Goes into Vercel env vars only — never committed to git.*

## Step 6 — Anthropic API key (2 min)

- [ ] https://console.anthropic.com → **API Keys** → **Create Key**
- [ ] Name: `fever-hq-prod`
- [ ] Copy the `sk-ant-...` value
- [ ] Send to me — also Vercel env, never git
- [ ] Set a usage limit on the key: $5/month is plenty for this volume. Console → Settings → Limits.

## Step 7 — Vercel account (2 min) — only if you don't have one

- [ ] https://vercel.com/signup → Continue with GitHub
- [ ] Free Hobby plan is plenty for this
- [ ] I'll deploy under your `mitchleonards-projects-c174884e` team

## What you should send me when ready

```
Twilio Number:       +1...
Twilio Account SID:  AC...
Twilio Auth Token:   (32-char string)
Anthropic API key:   sk-ant-...
Your iMessage #:     +1... (test send target — never wife's)
Wife's mobile #:     +1... (NOT sent until you confirm test passed)
Wife's email:        ... (for one-time ICS subscribe link)
Wife's carrier:      Verizon / T-Mobile / AT&T (affects 10DLC urgency)
```

## What I'll have ready when you get back

- Vercel webhook function for inbound SMS (Twilio → Anthropic → reply)
- Pregame outbound send module (cron-fired 15 min before tipoff)
- Season detector (SMS active May-Oct, email Nov-Apr)
- Welcome email template (ICS subscribe link + bot introduction)
- ICS hosting endpoint
- All deployed pending your credentials going into Vercel env vars

Total active build time (mine): ~25–30 min. Yours can run in parallel.
