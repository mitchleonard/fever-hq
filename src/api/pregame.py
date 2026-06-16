"""
Fever HQ — Vercel cron endpoint that fires pregame texts.

Wired in vercel.json as a cron triggered hourly. Each invocation calls
pregame_send.run(); the idempotency log inside the module prevents
double-sends across hours.

Security: Vercel cron jobs hit this endpoint with `Authorization: Bearer
${CRON_SECRET}`. We reject anything else so randos can't trigger sends.

Env vars required:
  CRON_SECRET             — random string set in Vercel + provided by Vercel
                            when it calls the cron URL
  + all the vars used by pregame_send (TWILIO_*, ANTHROPIC_API_KEY, etc.)
"""
from __future__ import annotations
import os
import sys
import json
from http.server import BaseHTTPRequestHandler
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from pregame_send import run as pregame_run  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def _check_auth(self) -> bool:
        expected = os.environ.get("CRON_SECRET")
        if not expected:
            # Permit only if explicitly disabled — never in prod
            return os.environ.get("CRON_AUTH_DISABLED") == "1"
        sent = self.headers.get("Authorization", "")
        return sent == f"Bearer {expected}"

    def do_GET(self):  # noqa: N802 — Vercel runtime
        if not self._check_auth():
            self.send_response(401)
            self.end_headers()
            self.wfile.write(b"unauthorized")
            return

        try:
            result = pregame_run()
        except Exception as e:
            result = {"status": "error", "reason": str(e)}

        body = json.dumps(result).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)
