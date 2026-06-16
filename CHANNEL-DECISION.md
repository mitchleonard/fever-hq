# Choosing the Channel: The SMS Hunt Behind Fever HQ

*Hackathon #003 research artifact. Captures the nine messaging paths I evaluated, what killed each one, and how the project pivoted from an iMessage bot to a custom PWA hosted on my own domain. Final product live at feverhq.mitchleonard.com.*

---

## TL;DR

I assumed SMS was the answer when I started this project. Native, instant, universal. My wife already gets texts on her iPhone, so she'd save Fever HQ as a contact and pregame alerts would land 15 minutes before tipoff.

I was wrong about the easy part.

Seven messaging paths and one carrier-mandate-shaped wall later, I shipped Fever HQ as a custom-branded PWA at `mitchleonard.com/feverhq` instead. Total annual cost dropped from ~$20/year (Twilio) to ~$3/year (Vercel free tier + Anthropic API). Portfolio writeup got sharper, not weaker.

Here's how I got there.

---

## The Problem

One user (my wife). Non-technical. iPhone. Wants reliable game-day pings, the Fever broadcast channel, and information about the team that beats ESPN at her specific use case. Free or near-free. No new app to learn. Branded as "Fever HQ," not as me.

## The Criteria

I scored every option against six things:

1. **Out-of-pocket cost** to get to first send
2. **Annual cost** to keep running
3. **Setup friction** on my side
4. **Onboarding friction** on her side
5. **Pregame push works** without a 24-hour rolling window
6. **Branded sender identity** she can save to contacts

## What I Tried

### 1. iMessage via Mac AppleScript

The first idea. Run a scheduled AppleScript on my Mac that fires pregame iMessages to my wife, identified as "Fever HQ" rather than from me. Cost: $0.

**What killed it:** iMessage's "Start new conversations from" setting is a single radio button per Apple ID. Either every new conversation routes from my personal number, or from a Fever HQ-style email alias, but not both. Sending the bot's pregame texts from my personal identity made every message arrive as if from me. The brand collapsed.

A workaround exists using a second Apple ID on a separate device. Friction defeated the simplicity goal.

### 2. Twilio

The industry standard. Best documentation, best Python SDK, the name a hiring manager recognizes on a resume. Outbound SMS at ~$0.0083 per message, $1.15/month per number.

**What killed it (for this project):** the upfront cost. Twilio's free trial restricts you to verified destination numbers only. To send freely to my wife — let alone for a hobby project — required a $20 minimum top-up plus A2P 10DLC registration (~$15 in brand and campaign fees). About $35-40 before sending a single message, then ~$20/year ongoing. For a personal project, that's enough friction to ask whether SMS is the right answer at all.

I came back to Twilio twice in this evaluation. Each time the math pushed me to look further.

### 3. Plivo

Cheaper than Twilio. $10 free credit at signup, no credit card required, transparent all-in pricing at $0.0077 per SMS, $0.80/month for a number. The signup flow looked clean.

**What killed it:** Plivo's signup filter rejected my custom email domain (`mitch@mitchleonard.com`, set up via ImprovMX as a free forwarder). Their domain reputation system flagged either the forwarder MX records or the recently-activated domain age. Support could whitelist with a 24-48 hour review, but I'd burned enough time chasing free SMS that the next option was looking better than the wait.

### 4. Telnyx

Lower per-message rates than Plivo at $0.004 base plus carrier surcharges that landed around $0.008 total. Self-serve signup. Decent docs.

**What killed it:** the carrier-fee math. Telnyx prices the base rate cheaply, then bills T-Mobile, Verizon, AT&T surcharges on top. The "cheap" rate becomes calculator work once you account for destination network. For a single-recipient hobby project, the savings against Plivo were dollars per year. Not worth the cognitive overhead.

### 5. Vonage

Enterprise-positioned. Pricing for individual SMS is hidden behind a "Contact sales" form.

**What killed it:** a vendor that won't quote SMS rates publicly is selling to enterprise IT, not to me. Out in the first 30 seconds of research.

### 6. Twilio WhatsApp Sandbox

Free for any volume. Two-way conversational. No phone number purchase. No 10DLC. Setup in five minutes.

**What killed it:** WhatsApp's 24-hour messaging window. Meta's policy lets you send freeform messages only within 24 hours of the recipient's last message to you. After that, you can only send pre-approved "template messages."

For Fever HQ, the entire value is pregame texts firing 15 minutes before tipoff, typically more than 24 hours after my wife's last interaction with the bot. A specific message tag exists for sports event reminders that works around this, but Twilio's sandbox doesn't fully support custom templates. The core feature was broken in the channel's free tier.

### 7. Facebook Messenger

Free for any volume. Branded sender (Facebook Page profile). Rich UI for buttons. The 24-hour window applies but Meta's `CONFIRMED_EVENT_UPDATE` message tag is built for sports event notifications, which would have cleared the constraint.

**What killed it:** my wife doesn't open Messenger regularly. Branded sender only matters if she sees the message.

### 8. Email (the runner-up)

Truly free. Wife already lives in her iPhone Mail app. Pregame emails arrive with native push notifications already attached. Two-way conversations possible via Gmail polling on a Claude scheduled task.

**Why this stayed alive as the fallback:** the 15-minute inbound reply latency was real but acceptable for schedule questions. The portfolio writeup would have been honest ("zero infrastructure cost") if less visually striking.

This was the runner-up. If the PWA path had failed, I'd have shipped this.

### 9. PWA on mitchleonard.com (the answer)

A custom-built Progressive Web App at my own domain. Web Push notifications work natively on iOS 16.4+ (March 2023 onward). Add to Home Screen makes it look and behave like an installed app. Anthropic API powers the chat. ICS calendar feed lives at the same domain.

**Why it won:** every criterion above except "needs a one-time Add to Home Screen step" came up better than any SMS path. $0 setup. Vercel Hobby is free. Anthropic API at one-user volume runs ~$1-5/year. The sender identity is fully branded: Fever Navy and Gold, real Fever HQ wordmark, custom app icon on her home screen, custom domain in the URL bar. Pregame push notifications work without any 24-hour window. The case study writeup says "custom PWA on my own domain" instead of "subscribed to a Twilio number."

## The Matrix

| Option | Setup cost | Annual cost | Branded sender | Pregame push works | Her onboarding | Portfolio strength |
|---|---|---|---|---|---|---|
| iMessage automation | $0 | $0 | No (sender = me) | One-way only | None | Weak |
| Twilio SMS | $35-40 | ~$20 | Yes | Yes | None | Strong |
| Plivo SMS | ~$4 | ~$10 | Yes | Yes | None | Decent |
| Telnyx SMS | ~$4 | ~$8 | Yes | Yes | None | Decent |
| Vonage SMS | Unknown | Unknown | Yes | Yes | None | Weak |
| Twilio WhatsApp Sandbox | $0 | $0 | Partial | **Broken (24h rule)** | She uses WhatsApp | Decent |
| Facebook Messenger | $0 | $0 | Yes | Yes (tagged) | She uses Messenger | Decent |
| Email | $0 | ~$1-5 | Partial | Yes | None | Decent |
| **PWA on mitchleonard.com** | **$0** | **~$1-5** | **Yes (full)** | **Yes** | **One Add to Home Screen** | **Strongest** |

## The Decision

A PWA on my own domain wins on every dimension that matters for a portfolio project. The trade is one Add to Home Screen step on my wife's phone, which I walked her through in person. In exchange:

- Zero phone numbers, zero KYC paperwork, zero carrier reviews
- Real iOS push notifications via the Web Push API
- Conversational chat with full Anthropic Claude Haiku 4.5 access
- Full visual branding (Fever Navy, Fever Gold, Bebas Neue display, custom wordmark, custom app icon)
- The calendar piece via ICS feed at the same domain
- Lives at `mitchleonard.com/feverhq`, which means every recruiter clicking my portfolio sees a working product, not a screenshot

## Three Things I'd Tell Another Team

**Free SMS providers exist, but the signup gates are real.** US carriers fine SMS providers heavily for spam, so every provider (Twilio, Plivo, Telnyx, Bandwidth, Sinch) gates hobby accounts with KYC and 10DLC registration. There is no clever path around this. It's a carrier mandate, not a vendor choice.

**The WhatsApp 24-hour rule is the single most important constraint to know about messaging APIs.** It eliminates WhatsApp Sandbox and Facebook Messenger for use cases that need scheduled outbound to inactive users. Meta's message-tag workaround exists but requires business verification you may not want to pursue for a hobby project.

**A PWA is a serious alternative when the user will accept one install.** iOS Web Push has been production-viable since iOS 16.4 (March 2023). For personal projects, internal tools, and "build once for one user" use cases, the math is hard to beat. Most builders default to SMS without running the comparison.

## What this took

About 90 minutes of evaluation across one build session. Four formally-rejected providers, two channel pivots (iMessage → SMS provider → PWA), one runner-up (email) held in reserve, and one final answer that beat the original assumption on every criterion that mattered.

The point: when the obvious answer keeps hitting walls, the question to ask is whether the obvious answer was the right one. Not whether the next provider will be friendlier than the last.

---

*Full build artifacts, source code, and deploy runbook in this repo. Live product at `mitchleonard.com/feverhq` (deploy in progress at time of writing).*
