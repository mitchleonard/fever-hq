# TRANSCRIPT — Hackathon #003 Fever HQ

Prompt-by-prompt narrative across the kickoff, multiple pivots, and final ship.

---

[+00:00] User:
My wife is obsessed with Caitlin Clark and the Indiana Fever. I want to make a hackathon project out of this ask: Create Google calendar invites for ever Fever game, inviting her to them with details on the team who's playing the fever, what channel to watch the game, time zone calculated time of tipoff, etc. The calendar invites must auto-update when there are changes. She's not super techy so keep this simple. I then want to create a messaging bot that will text her 15 mins before each game with top pre-game news and the starting player roster. All facts must be verified and accurate when sent to her and the texts should be fun while also keeping content to the most important info. As a plus up, create this as a separate contact similar to a Business iMessage chat so it can act as a WNBA bot with interactivity and ability to see updates that beats any other form of app like ESPN or Yahoo Sports since those are too complicated and complex.

Claude:
Flagged the honest architecture read — ICS subscription feed is the cleanest auto-update path; pregame texts run from a Claude scheduled task; Apple Business Chat requires Apple business registration so it's a v2, with three credible workarounds. Captured brief via AskUserQuestion. Locked: name "Fever Bot", scope MVP (ICS + texts), 60-min budget, sports-radio voice.

---

[+00:00] User:
On the user side, my wife does not use Claude and this should be free.

Claude:
Pivoted the dashboard plan from a Cowork artifact (paywalled) to a static HTML page parked on free hosting (GitHub Pages / Vercel) — outside MVP scope. ICS feed and iMessage pushes are unaffected; both originate from Mitch's Claude account, and the wife only receives an iCal subscription URL and inbound iMessages on her existing phone.
