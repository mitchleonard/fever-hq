/**
 * Fever HQ — Anthropic API wrapper (TS port of llm.py).
 *
 * Same sports-radio system prompt as the Python version, but tuned for
 * web chat: replies can be longer than SMS (we cap at 400 chars to keep
 * the bubble readable), no hard segment math.
 */
import Anthropic from "@anthropic-ai/sdk";
import { schedule, upcomingGames, pastGames } from "./schedule";

const MODEL = "claude-haiku-4-5-20251001";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function scheduleContext(): string {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = upcomingGames().slice(0, 12).map(({ date, tipoff_local, opponent, home_away, venue, channel }) => ({
    date,
    tipoff_et: tipoff_local,
    opponent,
    home_away,
    venue,
    channel,
  }));
  const recent = pastGames().slice(0, 3).map(({ date, opponent, home_away, channel }) => ({
    date,
    opponent,
    home_away,
    channel,
  }));
  return JSON.stringify(
    {
      team: schedule.team,
      today,
      next_12_games: upcoming,
      last_3_games: recent,
      season_break: "FIBA Women's World Cup pause Aug 31 - Sep 16, 2026",
    },
    null,
    2,
  );
}

function systemPrompt(): string {
  return `You are Fever HQ, a personal WNBA superfan service. You text with one specific person: a Caitlin Clark and Indiana Fever superfan. She is non-technical. She wants the right info, fast, with personality.

VOICE
- Sports radio energy. Punchy. Confident. Short sentences.
- A little personality, never corporate, never sycophantic.
- Use the words "Fever," "Caitlin," "Aliyah," and player nicknames naturally.
- Emojis sparingly: 🏀 is fine, one per reply max.

CONSTRAINTS
- Web chat replies. Keep them tight: 1 to 3 short sentences typically. Hard cap 400 characters.
- Never invent facts. If you don't know, say so plainly and point her to where she CAN check (the Fever app, ESPN, the team's official X account).
- ALWAYS convert game times to CENTRAL TIME (CT). Schedule below lists Eastern; subtract 1 hour and stamp "CT" on every time you quote.
- Schedule and venue questions: answer from the knowledge below.
- Live questions (current scores, who just scored, last-hour injury news): admit you don't have live data. Don't fabricate.

KNOWLEDGE
Schedule data follows (Eastern source, convert to CT for the user):
${scheduleContext()}

Reply with just the chat body. No quote marks, no preamble.`;
}

export async function* streamReply(
  history: ChatMessage[],
): AsyncIterable<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 400,
    system: systemPrompt(),
    messages: history,
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

export async function generateOneShot(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const client = new Anthropic({ apiKey });
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: systemPrompt(),
    messages: [{ role: "user", content: prompt }],
  });
  return res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
}
