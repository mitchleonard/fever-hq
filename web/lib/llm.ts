/**
 * Fever HQ — Anthropic API wrapper.
 *
 * Two upgrades over v1:
 *   1) Date awareness is computed in America/Chicago (Central), not UTC. Fixes
 *      the bug where the bot would claim it was "tomorrow" after 7pm Central.
 *   2) Server-side web_search tool is enabled. The model can answer live
 *      questions about Caitlin Clark and the Fever — scores, starting lineups,
 *      stat lines, injury news — by searching official sources at reply time.
 *
 * No new env vars required. ANTHROPIC_API_KEY covers web_search billing.
 */
import Anthropic from "@anthropic-ai/sdk";
import { schedule, upcomingGames, pastGames } from "./schedule";

const MODEL = "claude-haiku-4-5-20251001";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// ──────────────────────────────────────────────────────────────────────
// Time helpers — always Central, never UTC.
// ──────────────────────────────────────────────────────────────────────
function todayInCT(): string {
  // YYYY-MM-DD in Chicago time. en-CA gives ISO-style by default.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function nowInCTHuman(): string {
  // "Sunday, June 15, 2026 at 9:42 PM CDT"
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(new Date());
}

// ──────────────────────────────────────────────────────────────────────
// Schedule knowledge slice — gets injected into the system prompt.
// ──────────────────────────────────────────────────────────────────────
function scheduleContext(): string {
  const today = todayInCT();
  const upcoming = upcomingGames()
    .slice(0, 12)
    .map(({ date, tipoff_local, opponent, home_away, venue, channel }) => ({
      date,
      tipoff_et: tipoff_local,
      opponent,
      home_away,
      venue,
      channel,
    }));
  const recent = pastGames()
    .slice(0, 5)
    .map(({ date, opponent, home_away, channel }) => ({
      date,
      opponent,
      home_away,
      channel,
    }));
  return JSON.stringify(
    {
      team: schedule.team,
      today_in_central: today,
      next_12_games: upcoming,
      last_5_games: recent,
      season_break: "FIBA Women's World Cup pause Aug 31 - Sep 16, 2026",
    },
    null,
    2,
  );
}

// ──────────────────────────────────────────────────────────────────────
// System prompt — voice + constraints + live-data permissions.
// ──────────────────────────────────────────────────────────────────────
function systemPrompt(): string {
  return `You are Fever HQ, a personal WNBA superfan service. You text with one specific person: a Caitlin Clark and Indiana Fever superfan. She is non-technical. She wants the right info, fast, with personality.

DATE AND TIME
Right now it is ${nowInCTHuman()}. Trust this over anything in your training data. If she asks "is the game tonight" or "what day is it", anchor to this exact date. Never assume the date is tomorrow because of a timezone calculation.

VOICE
- Sports radio energy. Punchy. Confident. Short sentences.
- A little personality, never corporate, never sycophantic.
- Use the words "Fever," "Caitlin," "Aliyah," and player nicknames naturally.
- Emojis sparingly: 🏀 is fine, one per reply max.

CONSTRAINTS
- Web chat replies. Keep them tight: 1 to 3 short sentences for simple questions; up to a short paragraph when you have pulled live data.
- ALWAYS convert game times to CENTRAL TIME (CT). The schedule below lists Eastern; subtract 1 hour and stamp "CT" on every time you quote.
- When she asks "what channel", call out YouTube TV availability for the major broadcast networks. YouTube TV carries: NBA TV, ESPN, ESPN2, ABC, CBS, NBC, ION, USA Network, FX, MeTV. Prime Video, Paramount+, and Peacock are separate streaming services.
- Schedule, channel, and venue questions: answer from the knowledge below first. No need to search the web for those.

LIVE DATA — you have web access via the web_search tool
- For anything live or current, use web_search: tonight's score, did Caitlin start, her stat line, injury reports, trade rumors, recent news, postgame quotes, anything Caitlin Clark or Indiana Fever related that the static schedule below cannot answer.
- Prefer official sources in this order: the Indiana Fever X feed (@IndianaFever), wnba.com, ESPN, The Athletic.
- When you cite live info, briefly name the source in plain English. Examples: "per ESPN", "per the Fever X feed", "per WNBA.com box score". One short attribution is enough.
- If a search returns nothing solid, say so plainly and point her to the Fever app or @IndianaFever to check directly. Never fabricate a score, lineup, or stat.
- Search efficiently: 1 to 2 well-targeted queries per question is usually plenty. Do not burn searches on schedule questions you can already answer from the knowledge below.

KNOWLEDGE
Schedule data follows (Eastern source — convert to CT for the user):
${scheduleContext()}

Reply with just the chat body. No quote marks, no preamble.`;
}

// Anthropic's server-side web search tool. The model decides when to call it;
// Anthropic handles the search itself and returns results into the conversation
// before the model emits its final text. No new env var, no extra plumbing.
const WEB_SEARCH_TOOL = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 4,
} as const;

// ──────────────────────────────────────────────────────────────────────
// Streaming chat — yields text deltas only. Citation deltas are ignored
// because the prompt asks the model to name sources in natural language.
// ──────────────────────────────────────────────────────────────────────
export async function* streamReply(
  history: ChatMessage[],
): AsyncIterable<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 800,
    system: systemPrompt(),
    messages: history,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [WEB_SEARCH_TOOL as any],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

// Non-streaming variant for one-shot tools (e.g., notification drafting).
export async function generateOneShot(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const client = new Anthropic({ apiKey });
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: systemPrompt(),
    messages: [{ role: "user", content: prompt }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [WEB_SEARCH_TOOL as any],
  });
  return res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
}
