"""
Fever HQ — Anthropic API wrapper for bot replies.

Loads schedule.json as live knowledge, builds a sports-radio system prompt,
calls Haiku 4.5, returns text trimmed to SMS-friendly length.

Required env vars:
  ANTHROPIC_API_KEY

Honest scope note:
  v1 answers schedule-based questions ("when's next game?", "who plays
  Saturday?", "what channel?") from schedule.json. Live "did Caitlin score 30
  tonight?" / "who started?" questions require fresh data — added as tool-use
  in v2. v1 explicitly tells the user when it doesn't have live data and
  points them to where they CAN check.
"""
from __future__ import annotations
import os
import json
from datetime import date, datetime
from pathlib import Path
from typing import Optional


MODEL = "claude-haiku-4-5-20251001"
SCHEDULE_PATH = Path(__file__).parent / "schedule.json"

SYSTEM_PROMPT_TEMPLATE = """\
You are Fever HQ, a personal WNBA superfan service texting one specific
person: a die-hard Caitlin Clark / Indiana Fever fan. She is not technical.
She wants the right info, fast, with personality.

VOICE
- Sports radio energy. Punchy. Confident. Short sentences.
- A little personality, never sycophantic, never corporate.
- Use the words "Fever," "Caitlin," "Aliyah," and player nicknames naturally.
- Emojis sparingly: maybe one per message. 🏀 is fine. Skip the rest.

CONSTRAINTS
- You are sending SMS. Hard cap: 300 characters. Aim for 1-2 segments.
- Never invent facts. If you don't know — say so plainly and tell her where
  to check (the Fever app, ESPN, the team's X account).
- ALWAYS convert game times to CENTRAL TIME (CT) when replying. The schedule
  data below is listed in Eastern Time (broadcaster convention), but the user
  is on Central — subtract 1 hour from any time you quote. Always end times
  with "CT" so she knows which zone you mean.
- You can answer schedule-based questions from your knowledge below.
- You CANNOT answer live questions (current scores, who scored what tonight,
  injury news from the last hour) — admit it cleanly.

KNOWLEDGE: 2026 Indiana Fever schedule
Today's date: {today}
Schedule data (all times below are EASTERN — convert to CT before showing user):
{schedule_json}

FALLBACK PHRASES (use freely)
- For live questions: "I don't have live game info — pull up the Fever app
  for the latest. I'll text you 15 mins before tipoff every game."
- For unknown players: "Not sure on that one — Fever roster updates I don't
  catch live."
- For off-topic: stay on Fever. Politely redirect.

Reply ONLY with the SMS body. No quote marks, no preamble.
"""


def _load_schedule_summary() -> str:
    data = json.loads(SCHEDULE_PATH.read_text())
    today = date.today()
    # Trim to upcoming + last 3 games — keep prompt small
    upcoming = []
    recent = []
    for g in data["games"]:
        gdate = datetime.strptime(g["date"], "%Y-%m-%d").date()
        if gdate >= today:
            upcoming.append(g)
        else:
            recent.append(g)
    payload = {
        "team": data["team"],
        "next_10_games": upcoming[:10],
        "last_3_games": recent[-3:] if recent else [],
        "season_break": "FIBA Women's World Cup pause Aug 31 - Sep 16, 2026",
    }
    return json.dumps(payload, indent=2)


def reply(user_message: str, *, dry_run: bool = False) -> str:
    """Generate a bot reply for an inbound text.

    Returns SMS-ready text. Trims to 300 chars even if model exceeds.
    """
    user_message = (user_message or "").strip()
    if not user_message:
        return "🏀 Hey! Text me 'next' for the next game or 'when' for tipoff time."

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        today=date.today().isoformat(),
        schedule_json=_load_schedule_summary(),
    )

    if dry_run:
        # Don't hit the API. Useful for unit tests.
        return f"[dry_run] would have generated reply for: {user_message[:80]}"

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY env var not set")

    try:
        from anthropic import Anthropic
    except ImportError as e:
        raise RuntimeError("anthropic package not installed") from e

    client = Anthropic(api_key=api_key)
    response = client.messages.create(
        model=MODEL,
        max_tokens=256,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    text = "".join(
        block.text for block in response.content if hasattr(block, "text")
    ).strip()

    # Hard cap to 300 chars — never let the model bust the segment cap
    if len(text) > 300:
        text = text[:297].rstrip() + "..."
    return text
