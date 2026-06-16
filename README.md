# Hackathon #003 — Fever HQ

> A personalized Indiana Fever superfan PWA for one very devoted fan. iOS push notifications, conversational chat, auto-syncing calendar. About $3/year of infrastructure.

**Status:** Shipped
**Started:** 2026-05-27T03:58:54Z
**Shipped:** 2026-06-15
**Active build time:** ~90 minutes (idle time excluded)
**Live:** https://feverhq.mitchleonard.com
**Repo:** https://github.com/mitchleonard/fever-hq
**Tags:** Hackathon, AI Chatbot, API

## Context

My wife is a Caitlin Clark and Indiana Fever superfan. Keeping up with every game means jumping between ESPN, Yahoo Sports, the team site, and her own calendar — and none of those apps are built for one team or one fan. She isn't techy. She just wants the right info to land in front of her at the right time, on the device she already uses.

## What it does

- iOS push notifications 15 minutes before every Fever tipoff, with opponent, broadcast channel (with YouTube TV availability called out when carried), and Central-Time tipoff
- Conversational chat that knows the 2026 schedule, channels, venues, and tipoff times — sports-radio voice, no filler
- ICS calendar feed she subscribes to once in Google Calendar; the feed auto-syncs when the WNBA shifts the schedule mid-season
- Season-aware: push during May-Oct, dormant Nov-Apr with email fallback
- Installable to her iPhone home screen via Safari (iOS 16.4+ Web Push)
- Live at feverhq.mitchleonard.com behind a custom subdomain

## Original idea → final product

The first idea was an **iMessage bot** — texts from "Fever HQ" 15 minutes before every tipoff, branded as a contact she'd save like any other person. Two walls killed it:

1. **Personal vs. enterprise on iMessage.** Each Apple ID is limited to a single "Start new conversations from" identity. Any bot send would have read as coming from me, not from Fever HQ. Apple Business Chat would have fixed this, but it requires Apple's business registration program — out of reach for a personal project.
2. **The SMS-provider route was budget-prohibitive.** Twilio's path required $20 upfront plus ~$15 in A2P 10DLC brand and campaign registration — about $35 before sending a single message, then ~$20/year ongoing. Plivo rejected my new custom-domain email at signup. WhatsApp Sandbox's 24-hour messaging window broke pregame outbound. For one user, none of it penciled out.

So the project pivoted to a **custom PWA on mitchleonard.com** — zero phone numbers, zero KYC, full visual branding, and $3/year all-in.

Full nine-option channel evaluation in `CHANNEL-DECISION.md`.

## Folder map

| File | Purpose |
|---|---|
| `CHANNEL-DECISION.md` | The nine-option channel evaluation memo. Portfolio-ready research artifact. |
| `LOG.md` | Active-minute log of every meaningful step and every pivot |
| `INVENTORY.md` | MCPs, connectors, APIs, skills used |
| `transcript.md` | Prompt + decision trail |
| `web/` | The shipped PWA (Next.js 15 + Tailwind v4) |
| `web/DEPLOY-PWA.md` | 8-step deploy runbook (followed for the live site) |
| `src/` | Legacy Python prototypes from the v1-v3 SMS path. Kept as historical record. |
| `project-page/content.md` | Drop-in case study for mitchleonard.com/projects |
| `project-page/preview.png` | Social share / index card thumbnail |
| `project-page/card.json` | Index-card metadata |
| `project-page/site-entry.js` | Drop-in entry for `data/caseStudies.js` on mitchleonard.com |

## Built

- Active build time: ~90 minutes across multiple sessions (idle time excluded)
- Stack: Next.js 15, Tailwind v4, Anthropic Claude Haiku 4.5, Vercel serverless, Web Push API, Phosphor icons, Motion, Cloudflare Email Routing
- Annual cost: ~$3/year (Anthropic API only; everything else free)
- Pivots: 5 (iMessage → Plivo → Twilio → WhatsApp Sandbox → PWA)
