#!/usr/bin/env python3
"""
Indiana Fever 2026 -> ICS feed generator.

Reads:  src/schedule.json
Writes: src/fever-2026.ics  (RFC 5545, with America/New_York VTIMEZONE)

Subscribers see auto-updates because:
- Each event has a stable UID per game (date + opponent)
- Calendar apps re-fetch the ICS URL on REFRESH-INTERVAL (we set PT12H)
- When schedule.json changes, regenerated events replace prior versions

Run:    python3 generate_ics.py
"""
import json
import hashlib
from datetime import datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "schedule.json"
OUT = HERE / "fever-2026.ics"

# Embedded VTIMEZONE for America/New_York covers Fever broadcast times.
# Calendar clients render in subscriber's local time automatically.
VTZ_NY = """BEGIN:VTIMEZONE
TZID:America/New_York
X-LIC-LOCATION:America/New_York
BEGIN:STANDARD
DTSTART:19701101T020000
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:19700308T020000
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
END:VTIMEZONE"""


def fmt_dt(date_str: str, time_str: str) -> str:
    """'2026-05-22' + '19:30'  ->  '20260522T193000'"""
    return f"{date_str.replace('-', '')}T{time_str.replace(':', '')}00"


def event_uid(game: dict) -> str:
    """Stable per-game UID so re-imports overwrite rather than duplicate."""
    slug = game["opponent"].lower().replace(" ", "").replace(".", "")
    return f"fever-{game['date']}-{slug}@feverbot.local"


def fold_line(line: str) -> str:
    """RFC 5545 line folding: continuation lines start with one space."""
    if len(line.encode("utf-8")) <= 75:
        return line
    parts = []
    while len(line.encode("utf-8")) > 75:
        cut = 73
        while len(line[:cut].encode("utf-8")) > 73:
            cut -= 1
        parts.append(line[:cut])
        line = " " + line[cut:]
    parts.append(line)
    return "\n".join(parts)


def escape_text(s: str) -> str:
    """Escape ICS TEXT-typed values."""
    return (
        s.replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\n", "\\n")
    )


def build_event(game: dict, dtstamp: str) -> str:
    dtstart = fmt_dt(game["date"], game["tipoff_local"])
    start_dt = datetime.strptime(dtstart, "%Y%m%dT%H%M%S")
    end_dt = start_dt + timedelta(hours=2, minutes=30)
    dtend = end_dt.strftime("%Y%m%dT%H%M%S")

    vs_at = "vs" if game["home_away"] == "home" else "@"
    summary = f"Fever {vs_at} {game['opponent']}"

    description = (
        f"Indiana Fever {vs_at} {game['opponent']}\n"
        f"Tipoff: {game['tipoff_local']} ET\n"
        f"Watch on: {game['channel']}\n"
        f"Venue: {game['venue']}\n"
        f"\n"
        f"Schedule auto-updates daily via Fever Bot."
    )

    lines = [
        "BEGIN:VEVENT",
        fold_line(f"UID:{event_uid(game)}"),
        f"DTSTAMP:{dtstamp}",
        f"DTSTART;TZID=America/New_York:{dtstart}",
        f"DTEND;TZID=America/New_York:{dtend}",
        fold_line(f"SUMMARY:{escape_text(summary)}"),
        fold_line(f"DESCRIPTION:{escape_text(description)}"),
        fold_line(f"LOCATION:{escape_text(game['venue'])}"),
        "CATEGORIES:WNBA,Indiana Fever",
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "END:VEVENT",
    ]
    return "\n".join(lines)


def main():
    data = json.loads(SRC.read_text())
    games = data["games"]

    dtstamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    header = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Fever Bot//Indiana Fever 2026//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        fold_line("X-WR-CALNAME:Indiana Fever 2026"),
        fold_line(
            "X-WR-CALDESC:Every Indiana Fever game with channel and tipoff. "
            "Auto-updates daily via Fever Bot."
        ),
        "X-WR-TIMEZONE:America/New_York",
        "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
        "X-PUBLISHED-TTL:PT12H",
        VTZ_NY,
    ]

    body = [build_event(g, dtstamp) for g in games]
    footer = ["END:VCALENDAR"]

    out_text = "\n".join(header + body + footer) + "\n"
    # RFC 5545 mandates CRLF line endings
    out_text = out_text.replace("\n", "\r\n")

    OUT.write_text(out_text, encoding="utf-8")

    # Fingerprint so the scheduled task can detect actual changes
    fp = hashlib.sha256(out_text.encode("utf-8")).hexdigest()[:16]
    (HERE / ".last_ics_fingerprint").write_text(fp)

    print(f"Wrote {OUT}")
    print(f"  events:      {len(games)}")
    print(f"  bytes:       {OUT.stat().st_size}")
    print(f"  fingerprint: {fp}")
    print(f"  next game:   {games[0]['date']} {games[0]['tipoff_local']} ET — {games[0]['opponent']}")


if __name__ == "__main__":
    main()
