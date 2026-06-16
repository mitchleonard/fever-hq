# RESUME HERE — Hackathon #001 Fever HQ

**Current state:** code complete, awaiting Mitch's external signups for deploy.
**Active build time so far:** ~45 min cumulative.
**Architecture (v3, final for MVP):** Twilio SMS in-season + Gmail email off-season + Vercel serverless + Anthropic Claude Haiku 4.5.

## What's done

### Code (all in `src/`, all dry-run tested)
- `schedule.json` — canonical 2026 Fever schedule (44 games, all times ET)
- `generate_ics.py` — RFC 5545 ICS generator
- `season.py` — date-based SMS/email channel selector
- `twilio_send.py` — outbound SMS wrapper w/ TWILIO_FORCE_TEST_TO safety
- `llm.py` — Anthropic Haiku 4.5 wrapper, sports-radio voice, schedule-aware
- `pregame_send.py` — 75-min imminent-game detector, idempotent send logic
- `api/sms.py` — Vercel inbound webhook (Twilio signature validation)
- `api/ics.py` — Vercel dynamic ICS endpoint
- `api/pregame.py` — Vercel cron-triggered pregame fire (hourly, idempotent)
- `vercel.json` — routes + cron config
- `requirements.txt` — anthropic + twilio
- `.env.example` — full env template

### Docs
- `SETUP-TWILIO.md` — 7-step Twilio + Anthropic + Vercel signup
- `welcome-email.md` — one-time email to wife with ICS link + bot intro
- `intro-sms.txt` — first bot text body
- `DEPLOY.md` — 7-step deploy runbook for once creds are ready

## What blocks ship

Everything below is on Mitch:

1. Sign up for Twilio, upgrade past trial, buy 317 number, register 10DLC. Send back: Account SID + Auth Token + the number.
2. Create Anthropic API key. Send back: `sk-ant-...`
3. Create Vercel account + import the `src/` folder as a project.
4. Send back: his own phone number (test target), wife's phone (final target, DON'T USE YET), wife's email.
5. Follow `DEPLOY.md` end-to-end with Claude assistance.

## What Claude does at resume

1. Read this file first.
2. Confirm Mitch's creds are in hand (via prompt).
3. Walk him through `DEPLOY.md` Steps 1-7 interactively.
4. Run E2E test: pregame text fires to Mitch's number; inbound reply works.
5. Flip `TWILIO_FORCE_TEST_TO` to unset.
6. Send wife the welcome email (via Gmail MCP if connected, otherwise hand off the markdown).
7. Run ship phase: fill `project-page/content.md` execution bullets, take final screenshot, update card.json, git commit, present files.

## Open architecture decisions to revisit at v2

- Live news/score lookup at SMS reply time (currently bot says "check the Fever app" — adding fresh-data tool use would make it dramatically better)
- Automated weekly schedule re-scrape (currently manual edit of schedule.json on changes)
- Custom domain (`fever-hq.mitchleonard.com` reads great in portfolio)
- Voice mode via Twilio Voice + Anthropic (she calls Fever HQ and asks "what's the score?")
- MMS lineup graphics 30 min pregame ("here's tonight's starting 5")

These are explicitly OUT of MVP scope. Logged for the portfolio writeup's "future work" section.
