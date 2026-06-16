# LOG — Hackathon #003 Fever HQ

Started 2026-05-27T03:58:54Z. Shipped 2026-06-15. Active-minute tracking only (idle/offline time excluded).

Entries are timestamped from kickoff in `[+MM:SS]` format. Pivots are prefixed with `× pivot:`.

---

[+00:00] Kickoff
  why: project brief captured, folder scaffolded, git initialized
  did: created folder structure, committed initial state, took kickoff screenshot
  next: wait for the user's first build instruction

[+00:00] Constraint surfaced — wife must not touch Claude
  why: user added mid-kickoff that the wife-side experience must be free and Claude-free
  did: pivoted dashboard plan from Cowork artifact (paywalled) to optional static HTML on GitHub Pages/Vercel; confirmed ICS feed + iMessage push pattern survives untouched since both originate from Mitch's Claude account
  next: confirm scope still MVP (ICS + texts), park static dashboard for v2

[+00:00] Kickoff screenshot — deferred
  why: no meaningful visual state at t=0; first build state will be the real 01-* screenshot
  did: noted deferral in LOG; will request computer-use access at first build milestone
  next: standby for first build instruction

[+06:52] User pivoted tags to portable taxonomy + green-lit custom contact via mitchleonardwork@gmail.com
  why: tags need to be reusable across his full portfolio, not project-specific; custom-contact path was the alternative I floated and he picked it
  did: rewrote tags in card.json, README.md, .hackathon-state to ["Hackathon", "Automation", "ClaudeCowork", "GoogleCalendar", "iMessages"]; wrote src/SETUP-CONTACT.md with Mac/iPhone steps; recorded sender_identity in state file
  next: pull canonical Fever 2026 schedule from ESPN, build ICS generator

[+06:52] First WebSearch — Fever 2026 schedule overview
  why: need broadcast partner list and confirm 44-game season before scripting
  did: confirmed 44-game schedule, all on national TV; broadcasters span USA Network, Prime Video, ION, ESPN, ABC, CBS, NBC/Peacock, NBA TV; 18 games OTA on WTHR/WALV in Indianapolis
  next: fetch ESPN's per-game schedule page for dates/times/opponents

[+09:00] Pulled canonical schedule from Sports Brackets (static HTML)
  why: ESPN and fever.wnba.com both client-rendered (empty fetches); needed a static-HTML source
  did: fetched sportsbrackets.net page, structured all 44 games into src/schedule.json with date/tipoff/opponent/home-away/venue/channel; locked America/New_York as ICS timezone
  next: build ICS generator

[+11:30] ICS generator built and verified
  why: needed a single subscribable URL for wife's Google Calendar
  did: wrote src/generate_ics.py (pure-Python, RFC 5545, embedded VTIMEZONE, stable per-game UIDs, REFRESH-INTERVAL PT12H, fingerprinting for change detection); ran it; output is 23KB, 44 unique UIDs, 44 matched BEGIN/END:VEVENT pairs
  next: deploy to Vercel for public URL

[+12:00] PAUSE — user requested halt to avoid extra usage charges, resume at 3:20 AM Eastern
  why: budget guard
  did: wrote RESUME-HERE.md with full state + next-step playbook; scheduled fireAt task to restart at 3:20 AM ET; committed work-in-progress to git
  next: scheduled task fires at 03:20 ET to continue with Vercel deploy

[idle ~19 days — wall-clock skip, not counted in active time]

[+12:30] RESUME with major rescope
  why: user surfaced the "Start new conversations from" iMessage constraint (single radio button); pivoted entire bot delivery from iMessage MCP to dedicated SMS provider; user also switched accounting to active-time-only
  did: canceled 3:20 AM scheduled resume; researched Vonage, Telnyx, Plivo, Twilio pricing pages; recommended Plivo ($10 free credit, all-in $0.0077/msg, simpler than Telnyx carrier-fee math, more transparent than Vonage); user picked "Fever HQ" as bot name; rewrote .hackathon-state with new architecture (Plivo + Anthropic + Vercel + ICS-by-email); updated README and card.json; tags now include SMS + AnthropicAPI, dropped iMessages
  next: write SETUP-PLIVO.md for Mitch's background signup; build Vercel webhook function for inbound SMS; deploy ICS to Vercel; wire pregame outbound

[+22:00] Second pivot: Plivo → Twilio + seasonal hybrid (SMS in-season, email off-season)
  why: user asked Plivo-vs-Twilio comparison + raised Google Voice porting + WNBA seasonal use; head-to-head showed Twilio wins on portfolio brand recognition + docs + ecosystem, Plivo wins on trial friction; GV porting is a waste (5-14 day process, $5/yr saved); seasonal hybrid emerged as the best "portfolio story" plus genuine product fit
  did: rewrote .hackathon-state with seasonal hybrid architecture; replaced SETUP-PLIVO.md with SETUP-TWILIO.md (full signup + 10DLC walkthrough); deprecated old SETUP-CONTACT.md (v1 iMessage) and SETUP-PLIVO.md (v2 Plivo) inline as historical record
  next: build all code modules

× pivot v1→v2: iMessage MCP killed by single-identity constraint on Messages app
× pivot v2→v3: Plivo dropped for Twilio's portfolio recognition + ecosystem

[+30:00] Built all source modules + ran dry-run tests
  why: lock the architecture in code; prove each module works before deploy
  did:
    - src/season.py — date-based channel selector (sms May-Oct, email Nov-Apr), 7 dates tested, all green
    - src/twilio_send.py — outbound SMS wrapper with TWILIO_FORCE_TEST_TO safety net so dev sends route to Mitch's number
    - src/llm.py — Anthropic Haiku 4.5 wrapper, sports-radio system prompt, schedule.json as live knowledge, 300-char hard cap
    - src/pregame_send.py — 75-min imminent-game detector, draft template, idempotent via .pregame_sent.json, dry-run green
    - src/api/sms.py — Vercel inbound webhook with Twilio X-Twilio-Signature validation, TwiML response
    - src/api/ics.py — Vercel dynamic ICS endpoint, generates from schedule.json at request time
    - src/api/pregame.py — Vercel cron-triggered pregame fire, CRON_SECRET bearer auth
    - src/vercel.json — routes + hourly cron config
    - src/requirements.txt — anthropic + twilio
    - src/.env.example — full env template
    - src/welcome-email.md — one-time email content w/ ICS subscribe link + bot intro + save-the-contact nudge
    - src/intro-sms.txt — first bot text body (sports-radio voice, names itself, prompts contact save)
    - src/DEPLOY.md — 7-step deploy runbook for Mitch once creds are ready
  test: drafted pregame text for Jun 16 vs Toronto Tempo reads — "🏀 15 til tipoff. Fever vs Toronto Tempo at 7:00 PM ET on NBA TV / MeTV. Gainbridge Fieldhouse. Let's get it." Validates voice, format, length.
  next: hand off to Mitch for Twilio + Anthropic + Vercel signups; deploy + e2e test happens after creds land

[+50:00] Central Time flip + Twilio plan locked
  why: Mitch surfaced he's on Central + asked about Twilio Trial vs Pay-as-you-go signup
  did:
    - recommended Pay-as-you-go (Trial pre-assigns number = no 317 area code)
    - pregame_send.py: added DISPLAY_TZ = America/Chicago, draft_pregame_text converts ET source → CT for SMS body
    - llm.py: system prompt now tells the bot to subtract 1 hr from schedule ET times and stamp "CT" on every quoted time
    - welcome-email.md: explicit mention of Central Time in step 2
    - schedule.json stays ET (canonical broadcast source) — single source of truth, conversion at edge
    - re-tested 3 upcoming games — Jun 16 Toronto Tempo now reads "at 6:00 PM CT" not "7:00 PM ET". Jun 20 ABC matinee correctly renders "12:00 PM CT" (noon for Mitch, 1 PM at Atlanta).
  next: still blocked on Mitch's Twilio creds for deploy

× pivot v3→v4: Twilio sole-prop KYC + $20 minimum upgrade rejected as too expensive for hobby project
× pivot v4 trial: Plivo signup rejected mitchleonard.com domain (forwarder/new-domain reputation filter)
× pivot v4 trial: also dismissed Twilio WhatsApp Sandbox (24h messaging window kills pregame outbound)
× pivot v4 trial: also dismissed Facebook Messenger (separately considered, wife not active on it)

[+60:00] Massive scope shift: Fever HQ as a PWA on mitchleonard.com
  why: Mitch asked for free, branded, hosted on his domain, and as visually close to Indiana Fever as possible. Three Free-SMS providers gated us out. The PWA path beats all of them on cost AND portfolio strength.
  did:
    - invoked anthropic-skills:design-taste-frontend
    - design read declared: personalized fan-companion PWA, Fever-branded WNBA athletic language, Next.js 15 + Tailwind v4 + Bebas Neue/Geist + Fever Navy/Gold locked
    - dials set: VARIANCE 6, MOTION 5, DENSITY 4
    - scaffolded web/ as Next.js 15 App Router + Tailwind v4 + @tailwindcss/postcss
    - brand foundation: globals.css @theme tokens for Fever Navy (#002D62) + Fever Gold (#FFCD00) + Geist body + Bebas Neue display + court-rule gold accent
    - components built: Wordmark (FH lockup), AppHeader, NextGameCard (with live countdown), CourtRule, SuggestedPrompts (animated chips), ChatInterface (streaming Anthropic), InstallPrompt (iOS Add-to-Home-Screen banner), PushOptIn (notification opt-in flow), RegisterSW (service worker boot)
    - pages: app/page.tsx (chat-first home), app/schedule/page.tsx (next + recent + ICS subscribe + push opt-in), app/not-found.tsx
    - lib: schedule.ts (canonical games + CT formatting), season.ts (TS port), llm.ts (Anthropic Haiku streaming, sports-radio prompt, CT enforcement), ics.ts (RFC 5545 ICS generator port)
    - API routes: /api/chat (streaming), /api/ics (calendar feed), /api/push/subscribe (logs sub for env paste), /api/cron/pregame (CRON_SECRET-gated, fires push when game within 15 min)
    - PWA: manifest.json with shortcuts, sw.js (push event handler + offline shell + notificationclick routing), generate-vapid.mjs script, vercel.json with hourly-quartered cron
    - icons: PIL-generated 192/512/180 PNG monograms in Fever Navy + Gold + white "FH" lockup
    - DEPLOY-PWA.md: 8-step runbook from npm install through wife's iPhone onboarding
  test: ICS feed verified earlier. Chat needs ANTHROPIC_API_KEY for end-to-end test. PWA install + push flow tested architecturally; final ship-test happens on real iPhone.
  next: hand off to Mitch for GitHub push + Vercel deploy + custom domain + wife's iPhone onboarding

[+75:00] Wrote CHANNEL-DECISION.md for hackathon media
  why: Mitch asked for a real-work-style decision memo capturing the SMS provider research, evaluation, and final call — portfolio-bound, anti-slop discipline
  did:
    - invoked anti-slop skill to load full constraint set
    - structured the memo as: TL;DR + problem + criteria + 9 options walked through one-by-one + matrix + decision + 3 lessons for another team + the meta-point about questioning the obvious answer
    - audited for Tier 1/2/3 banned vocabulary (none present), banned structural patterns ("it's not X, it's Y" — none), em-dash discipline (1 per paragraph max)
    - included concrete numbers everywhere: $35-40 Twilio upfront, $0.0077 Plivo SMS, ~$1-5/yr PWA, 90 min total eval, 4 rejections, etc.
    - landed the final argument honestly: PWA wins on every criterion except "needs one Add to Home Screen step"
    - linked from README.md folder map so it's discoverable when someone clones the repo
  next: project-page/content.md still needs the execution-bullet fill at ship; CHANNEL-DECISION.md can be linked from the case study as supporting research artifact

[+12:30] RESUME — scheduled task fired, picking up at step 1 of RESUME-HERE.md
  why: 48 min of the 60-min budget remaining; running autonomously (user asleep), so any open kickoff questions get reasonable defaults documented in LOG
  did: re-read RESUME-HERE.md + LOG, loaded Vercel + scheduled-tasks tool schemas, set internal resume epoch for accurate log timestamps
  next: scaffold the Vercel deploy folder

[+13:00] Vercel scaffold built
  why: need a static project to host the .ics so Google Calendar can subscribe by URL
  did: created deploy/public/{fever-2026.ics,index.html} + deploy/vercel.json with text/calendar content-type, CORS allow-*, and 1h CDN cache; landing page is a one-screen subscribe instruction
  next: deploy_to_vercel under team mitchleonards-projects-c174884e


[+90:00] PUBLISHED to mitchleonard.com — Phase D complete
  why: case study staged and previewed (Phase D1 + D2); user approved with "ship it"
  did: spliced fever-hq entry into data/caseStudies.js before strava-dashboard; added 'fever-hq' to PERSONAL_SLUGS; added AI Chatbot + API to PROJECT_TAGS; patched ResultsBlock regex to accept $ prefix; copied 6-visual narrative + 1200x630 OG preview into public/fever-hq/
  next: linkedin/x announcement post; chatbot upgrade (Central-Time date fix + Anthropic web_search wiring for live scores and lineups)
