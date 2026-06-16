# Welcome email — one-time send to wife

**Subject:** Your Fever season just got easier 🏀

**From:** Mitch (your personal Gmail — feels native, not from the bot)
**To:** Wife's email
**Body:**

---

Hey love —

Made you something. A little service called **Fever HQ** that keeps every Indiana Fever game on your calendar automatically and texts you 15 minutes before tipoff so you never miss one.

**Step 1 (15 seconds):** Add the Fever schedule to your Google Calendar.

Tap this link on your phone, then "Add by URL" when Google Calendar opens:

👉 **[YOUR_VERCEL_URL]/fever-2026.ics**

Every game shows up on your calendar with the opponent, tipoff time, and TV channel. Updates automatically when the schedule changes — playoffs, postponements, channel swaps. You never have to do anything again.

**Step 2:** Save this number to your contacts as **Fever HQ** 🏀

📱 **[YOUR_TWILIO_NUMBER]**

That's the texting bot. It'll text you 15 minutes before every Fever game with the matchup, channel, and tipoff time *in Central Time*. You can text it questions too — "when's next?", "what channel tonight?", "who plays Saturday?" — and it'll answer. (Use a Fever logo or Caitlin headshot for the contact photo so you spot it immediately.)

**That's it.** I'll text you from Fever HQ in a few minutes to introduce yourself.

Go Fever 💛

Mitch

---

## Notes for Mitch (don't include in email)

- Wait to fire the welcome SMS until *after* she's opened this email and saved the contact. Otherwise the first text comes from an unknown number with no context.
- The intro SMS body lives at `src/intro-sms.txt` — send it manually with one of the test scripts after she confirms.
- If she's not on Gmail (or you'd rather not screenshot the link), the ICS URL also works pasted into Apple Calendar (File → New Calendar Subscription) on her Mac if she has one.
- The Step 2 contact-save prompt is the moment that turns the bot from "random number" into a named service in her life. Don't skip the contact-photo nudge — it's the polish that beats ESPN.
