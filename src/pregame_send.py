"""
Fever HQ — pregame outbound sender.

Designed to be invoked by a Claude scheduled task every 15 minutes. Strategy:

1. Load schedule.json.
2. Compute "is there a game tipping off in the next 75 minutes?"
3. If yes AND we haven't already sent for this game (idempotency via sent log):
     - Fetch verified starting lineup (best-effort)
     - Draft sports-radio-voice message
     - Send via twilio_send (in-season) or queue email (off-season)
     - Record the send in .pregame_sent.json

Idempotency log lives in the project folder so re-runs don't double-send.

Required env vars (when actually sending):
  TWILIO_*                — see twilio_send.py
  ANTHROPIC_API_KEY       — used to draft message text
  FEVER_HQ_WIFE_NUMBER    — destination, E.164
"""
from __future__ import annotations
import json
import os
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Optional
from zoneinfo import ZoneInfo

HERE = Path(__file__).parent
SCHEDULE_PATH = HERE / "schedule.json"
SENT_LOG = HERE / ".pregame_sent.json"

EASTERN = ZoneInfo("America/New_York")   # canonical source — broadcasts listed in ET
DISPLAY_TZ = ZoneInfo("America/Chicago") # what we show users (Mitch + wife on Central)
PREGAME_WINDOW_MIN = 75   # Run script on a 15-min cron; window covers each game once
TARGET_MINUTES_OUT = 15   # Send when game is ~15 min from tipoff


def _load_sent_log() -> dict:
    if SENT_LOG.exists():
        return json.loads(SENT_LOG.read_text())
    return {}


def _save_sent_log(log: dict) -> None:
    SENT_LOG.write_text(json.dumps(log, indent=2))


def _game_tipoff_dt(game: dict) -> datetime:
    """Returns the timezone-aware Eastern datetime of tipoff."""
    return datetime.strptime(
        f"{game['date']} {game['tipoff_local']}", "%Y-%m-%d %H:%M"
    ).replace(tzinfo=EASTERN)


def find_imminent_game(now_utc: Optional[datetime] = None) -> Optional[dict]:
    """Return the next Fever game tipping off within PREGAME_WINDOW_MIN min."""
    if now_utc is None:
        now_utc = datetime.now(timezone.utc)
    data = json.loads(SCHEDULE_PATH.read_text())
    for game in data["games"]:
        tip = _game_tipoff_dt(game)
        delta = (tip - now_utc).total_seconds() / 60
        if 0 <= delta <= PREGAME_WINDOW_MIN:
            return game
    return None


def draft_pregame_text(game: dict) -> str:
    """Compose the pregame SMS. v1 = static template; v2 will use LLM + live news.

    Format target: under 300 chars, sports-radio voice. Times shown in CT.
    """
    vs_at = "vs" if game["home_away"] == "home" else "@"
    tip_et = _game_tipoff_dt(game)
    tip_ct = tip_et.astimezone(DISPLAY_TZ)
    time_str = tip_ct.strftime("%-I:%M %p CT")

    # Static v1 template — sports radio energy. v2 plugs in live lineup + news.
    body = (
        f"🏀 15 til tipoff. Fever {vs_at} {game['opponent']} at {time_str} "
        f"on {game['channel']}. {game['venue'].split(',')[0]}. "
        f"Let's get it."
    )
    return body[:300]


def run(*, dry_run: bool = False) -> dict:
    """Main entry. Idempotent. Safe to call every 15 minutes."""
    game = find_imminent_game()
    if not game:
        return {"status": "no-imminent-game"}

    sent = _load_sent_log()
    key = f"{game['date']}-{game['opponent']}"
    if key in sent:
        return {"status": "already-sent", "key": key, "sent_at": sent[key]}

    body = draft_pregame_text(game)

    # Pick channel based on season detector (Nov-Apr = email; covers off-season)
    from season import active_channel
    channel = active_channel()

    if channel == "email":
        return {
            "status": "off-season",
            "channel": "email",
            "would_send": body,
            "note": "Off-season: pregame send is suppressed. Welcome-back email fires May 1.",
        }

    # SMS path
    from twilio_send import send_sms, SmsError
    to_number = os.environ.get("FEVER_HQ_WIFE_NUMBER")
    if not to_number:
        return {"status": "error", "reason": "FEVER_HQ_WIFE_NUMBER not set"}

    try:
        result = send_sms(to_number, body, dry_run=dry_run)
    except SmsError as e:
        return {"status": "error", "reason": str(e)}

    sent[key] = datetime.now(timezone.utc).isoformat()
    if not dry_run:
        _save_sent_log(sent)

    return {
        "status": "sent" if not dry_run else "dry-run-ok",
        "channel": "sms",
        "game": key,
        "body": body,
        "twilio": result,
    }


if __name__ == "__main__":
    import sys
    dry = "--dry-run" in sys.argv
    out = run(dry_run=dry)
    print(json.dumps(out, indent=2))
