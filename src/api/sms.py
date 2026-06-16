"""
Fever HQ — Vercel serverless function for inbound SMS.

Twilio POSTs here when wife (or anyone) texts the Fever HQ number.

Request:  application/x-www-form-urlencoded with From, To, Body fields.
Response: TwiML XML — Twilio sends the <Message> back as the SMS reply.

Security: validates X-Twilio-Signature header so randos can't hit this URL
and burn Anthropic credits.

Env vars required (set in Vercel project settings):
  TWILIO_AUTH_TOKEN        — for signature validation
  ANTHROPIC_API_KEY        — for reply generation
"""
from __future__ import annotations
import os
import sys
import urllib.parse
import base64
import hmac
import hashlib
from http.server import BaseHTTPRequestHandler
from pathlib import Path

# Local package import — src/ is on the path in Vercel build
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from llm import reply as generate_reply  # noqa: E402


def _twilio_signature_valid(url: str, params: dict, signature: str, auth_token: str) -> bool:
    """RFC: Twilio signs the full URL + sorted form params with HMAC-SHA1."""
    if not signature or not auth_token:
        return False
    sorted_kv = "".join(f"{k}{v}" for k, v in sorted(params.items()))
    payload = (url + sorted_kv).encode("utf-8")
    expected = base64.b64encode(
        hmac.new(auth_token.encode("utf-8"), payload, hashlib.sha1).digest()
    ).decode("ascii")
    return hmac.compare_digest(expected, signature)


def _twiml(message: str) -> bytes:
    safe = (
        message.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    )
    body = (
        f'<?xml version="1.0" encoding="UTF-8"?>'
        f"<Response><Message>{safe}</Message></Response>"
    )
    return body.encode("utf-8")


class handler(BaseHTTPRequestHandler):
    def do_POST(self):  # noqa: N802 — Vercel runtime contract
        length = int(self.headers.get("Content-Length") or 0)
        raw_body = self.rfile.read(length).decode("utf-8") if length else ""
        params = dict(urllib.parse.parse_qsl(raw_body, keep_blank_values=True))

        # Twilio sends From, To, Body. We use Body for the LLM input.
        signature = self.headers.get("X-Twilio-Signature", "")
        host = self.headers.get("Host", "")
        scheme = "https"  # Vercel always serves HTTPS
        url = f"{scheme}://{host}{self.path}"

        auth_token = os.environ.get("TWILIO_AUTH_TOKEN", "")
        if not _twilio_signature_valid(url, params, signature, auth_token):
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b"forbidden: bad signature")
            return

        body_text = params.get("Body", "").strip()
        try:
            reply_text = generate_reply(body_text)
        except Exception as e:  # never crash on the LLM path — wife gets SOMETHING
            reply_text = (
                "Fever HQ glitched for a sec — try again in a minute. "
                "Or text 'next' for the next game."
            )
            sys.stderr.write(f"LLM error: {e}\n")

        self.send_response(200)
        self.send_header("Content-Type", "application/xml; charset=utf-8")
        self.end_headers()
        self.wfile.write(_twiml(reply_text))
