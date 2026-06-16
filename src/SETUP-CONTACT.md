# DEPRECATED — see SETUP-TWILIO.md

This checklist is from v1 (iMessage path). Architecture pivoted to v3 (Twilio SMS + Anthropic + email hybrid). Use `SETUP-TWILIO.md` instead.

Old content preserved below for the LOG / portfolio writeup.

---

# Fever Bot — Custom contact setup checklist (v1 — deprecated)

Goal: send pregame iMessages from `mitchleonardwork@gmail.com` so on your wife's phone they appear from a custom "Fever Bot" contact, not from your personal number.

## Mitch — do these in order

- [ ] **1. Add the email to your Apple ID**
  Mac → System Settings → Apple ID → Sign-In & Security → Email & Phone Numbers → Add Email.
  Enter `mitchleonardwork@gmail.com`. Check inbox for Apple's verification code. Enter it.

- [ ] **2. Enable iMessage on the email**
  Messages app → Settings (⌘,) → iMessage tab.
  Under **"You can be reached for messages at"**, check the new email.
  Under **"Start new conversations from"**, select `mitchleonardwork@gmail.com`. This is the critical bit — it controls the From identity on outbound sends.

- [ ] **3. Create the contact on her iPhone**
  Wife's iPhone → Contacts → New Contact.
  Name: `Fever Bot` (or whatever you want her to see).
  Email field: `mitchleonardwork@gmail.com`.
  Add Photo → tap → Photos → pick a Fever logo or Caitlin Clark headshot (grab from indianafever.com or her camera roll).
  Save.

- [ ] **4. Confirm back to Claude: "contact ready"**
  Claude will fire a test iMessage to YOUR number first. Once you confirm the test arrived from the Fever Bot contact name (not from "Mitch"), we flip the send target to your wife's number.

## Fallback if step 1 won't verify

Some Gmail aliases get hung up on Apple's verification. If that happens:
- Go to appleid.apple.com → Create Your Apple ID with `mitchleonardwork@gmail.com`.
- Sign in to Messages on your Mac (or a second device) with this new Apple ID.
- Use that device as the bot's sender. Everything else above still applies.

## What this gets you

- Texts arrive from "Fever Bot" with a custom photo, not from "Mitch"
- She can long-press → block/mute the bot independently if she ever wants to
- Reads as a separate thread in her Messages app — closest thing to Apple Business Chat without the business registration
- Your personal iMessage thread with her stays clean

## Time estimate
~5 min if Apple verifies the email cleanly. ~10 min on the fallback path.
