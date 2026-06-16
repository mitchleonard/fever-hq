# DEPRECATED — see SETUP-TWILIO.md

This checklist is from v2 (Plivo). Architecture pivoted to v3 (Twilio). Use `SETUP-TWILIO.md` instead.

Old content preserved below for LOG / portfolio writeup.

---

# Fever HQ — Plivo signup checklist (v2 — deprecated)

While I build the webhook + integration, knock these out in the background. Total time: ~10 minutes if no 10DLC snag.

## Step 1 — Sign up (3 min)

- [ ] Go to https://plivo.com/signup
- [ ] Sign up with `mitchleonardwork@gmail.com` (or whichever — doesn't matter, it's your account only)
- [ ] Verify email
- [ ] You'll land in the Plivo Console. The $10 free credit is auto-applied.

## Step 2 — Buy a phone number (2 min)

- [ ] Console → **Phone Numbers → Buy Number**
- [ ] Country: United States. Type: Local (10DLC). Capability: **SMS** (you don't need voice).
- [ ] Search area code **317** (Indianapolis) — for Fever HQ brand consistency
- [ ] If no 317 numbers are available: try 463 (also Indy) or 765 (Indiana). Last resort, any US local.
- [ ] Buy it. ~$0.80–$1.15/month. The first month comes out of your $10 credit.
- [ ] **Send me back: the full phone number** in format `+13175551234`.

## Step 3 — Heads-up on 10DLC registration (this is the only landmine)

US carriers now require "10DLC" registration for any application-to-person SMS — even hobby projects. Without it, your messages get filtered or blocked, especially by T-Mobile and AT&T.

Plivo walks you through it in the Console under **Messaging → 10DLC**:

- [ ] Register a **Brand**: use "Fever HQ" or your real name + "personal project"
- [ ] Register a **Campaign**: use case = "Low Volume Mixed" (personal notifications). Throughput ~1 msg/sec is plenty.
- [ ] Approval is usually within 24 hours. Brand registration costs ~$4/one-time, campaign ~$10/one-time, billed against your credit.

**Honest read:** if you skip 10DLC, the bot works for testing to your own number for a day or two before carriers start filtering. If you want this to actually keep running long-term, do the registration. I'll structure the code so it can send the moment your number is live, with or without 10DLC approval.

## Step 4 — Grab your API credentials (1 min)

- [ ] Console → **Account → Profile** (or the top-right account icon)
- [ ] Copy your **Auth ID** (starts with `MA...`) and **Auth Token** (looks like a long random string)
- [ ] Send those to me. *I'll handle them like secrets — they go in Vercel env vars only, never committed to git.*

## Step 5 — One more thing: your Anthropic API key

- [ ] Go to https://console.anthropic.com → API Keys → Create Key
- [ ] Name it "fever-hq-prod" or whatever
- [ ] Copy the `sk-ant-...` value
- [ ] Send to me — also goes in Vercel env, never git

## What you should send me when ready

```
Plivo number:        +1...
Plivo Auth ID:       MA...
Plivo Auth Token:    (long string)
Anthropic API key:   sk-ant-...
Your iMessage #:     +1... (for the test send target, not wife's)
Wife's mobile #:     +1... (don't send until I confirm test passed)
Wife's email:        ... (for the one-time ICS subscribe link)
```

I'll wire everything in Vercel env vars, deploy, and the first thing it does is text *you* — never her — until you greenlight.

## Time check
Your part: ~10 min (plus 24h waiting for 10DLC if you do it)
My part: building in parallel — webhook code, ICS hosting, scheduled jobs
