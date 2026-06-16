"""
Fever HQ — Vercel serverless function that serves the ICS feed dynamically.

GET /api/ics   ->   text/calendar with the latest fever-2026.ics rendered from
                    schedule.json. No caching headers — Google Calendar pulls
                    on its own refresh interval.

This way the daily refresh is just: update schedule.json + git push.
No re-deploy needed for the calendar to update on her end (Vercel rebuilds
on git push automatically).
"""
from __future__ import annotations
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import generate_ics  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        # Reuse the same generator the local script uses, but capture to memory
        # so we don't have to write to disk in a serverless function.
        from io import StringIO
        import contextlib

        # generate_ics.main() writes to a file. Re-implement the bytes path inline.
        import json
        from datetime import datetime, timezone

        data = json.loads(generate_ics.SRC.read_text())
        dtstamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        header = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Fever HQ//Indiana Fever 2026//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            generate_ics.fold_line("X-WR-CALNAME:Indiana Fever 2026"),
            generate_ics.fold_line(
                "X-WR-CALDESC:Every Indiana Fever game with channel and tipoff. "
                "Auto-updates via Fever HQ."
            ),
            "X-WR-TIMEZONE:America/New_York",
            "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
            "X-PUBLISHED-TTL:PT12H",
            generate_ics.VTZ_NY,
        ]
        body = [generate_ics.build_event(g, dtstamp) for g in data["games"]]
        footer = ["END:VCALENDAR"]
        out = ("\n".join(header + body + footer) + "\n").replace("\n", "\r\n")
        payload = out.encode("utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "text/calendar; charset=utf-8")
        self.send_header(
            "Content-Disposition", 'inline; filename="fever-2026.ics"'
        )
        self.send_header("Cache-Control", "public, max-age=3600")
        self.end_headers()
        self.wfile.write(payload)
