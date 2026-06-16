# INVENTORY — Hackathon #003 Fever HQ — Tools used

Every MCP, connector, API, and skill touched during the build. First-touch only — duplicates are not logged.

## MCPs / Connectors

- **WebSearch** — pulled Fever 2026 schedule overview, validated broadcast lineups
- **web_fetch (Cowork sandbox)** — scraped canonical schedule from Sports Brackets static HTML
- **Vercel MCP** — `mcp__3d296a12-*` — team discovery, deploy target for ICS + webhook
- **Scheduled Tasks** — `mcp__scheduled-tasks__*` — paused/resumed the hackathon, will power daily ICS refresh + hourly pregame check

## APIs / external services

- **Twilio SMS API** — dedicated 317-area-code phone number, outbound pregame texts, inbound webhook for two-way bot — final selection after evaluating Telnyx, Vonage, Plivo. Won on portfolio brand recognition + best Python SDK + best docs.
- **Anthropic API** — Claude Haiku 4.5 powers the conversational bot replies
- **Sports Brackets** — canonical 2026 Fever schedule source (44 games)

## Skills

- **hackathon** — running the project — `anthropic-skills:hackathon`

## Local tooling

- **Python 3** — pure-Python ICS generator (RFC 5545 compliant, embedded VTIMEZONE)
- **Vercel serverless (Python)** — hosts ICS endpoint + Plivo inbound webhook
