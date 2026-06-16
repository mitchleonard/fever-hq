"""
Fever HQ — Twilio outbound wrapper.

Single send_sms() entry point. Env-driven config. Provider-portable shape —
if Twilio ever gets too expensive we swap this module for plivo_send.py
with the same interface.

Required env vars:
  TWILIO_ACCOUNT_SID
  TWILIO_AUTH_TOKEN
  TWILIO_FROM_NUMBER     # the Fever HQ number, e.g. +13175551234

Optional:
  TWILIO_FORCE_TEST_TO   # if set, ALL sends route here instead of `to_number`.
                         # set this to Mitch's number during dev. unset for prod.
"""
from __future__ import annotations
import os
from typing import Optional


class SmsError(Exception):
    """Anything that goes wrong on the way to the carrier."""


def send_sms(to_number: str, body: str, *, dry_run: bool = False) -> dict:
    """Send an SMS via Twilio.

    Args:
        to_number: E.164 format (+13175551234).
        body:      Message body. SMS is 160 chars; longer messages auto-segment
                   and bill per segment.
        dry_run:   If True, validate everything but don't actually hit Twilio.
                   Useful for unit-level tests.

    Returns:
        dict with {sid, to, from, status, billed_segments}.

    Raises:
        SmsError on any failure.
    """
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    from_number = os.environ.get("TWILIO_FROM_NUMBER")

    if not dry_run and not (account_sid and auth_token and from_number):
        raise SmsError(
            "Missing Twilio env vars. Need TWILIO_ACCOUNT_SID, "
            "TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER."
        )
    # In dry-run, fill in placeholders so the rest of validation still runs
    from_number = from_number or "+1_DRY_RUN_FROM"

    # Safety net for development: redirect every send to the developer's
    # own number until that override is explicitly unset.
    forced_to = os.environ.get("TWILIO_FORCE_TEST_TO")
    actual_to = forced_to if forced_to else to_number

    if not actual_to.startswith("+"):
        raise SmsError(f"to_number must be E.164 with leading + : {actual_to!r}")

    body = body.strip()
    if not body:
        raise SmsError("Empty SMS body — refusing to send.")

    # SMS segments: 160 chars for GSM-7, fewer for unicode. Soft-cap at 320
    # (two segments) so we don't accidentally fire a multi-dollar single text.
    if len(body) > 320:
        raise SmsError(
            f"SMS body too long ({len(body)} chars > 320 cap). "
            "Trim before sending or raise the cap deliberately."
        )

    if dry_run:
        return {
            "sid": "DRY_RUN",
            "to": actual_to,
            "from": from_number,
            "status": "dry_run",
            "billed_segments": (len(body) // 160) + 1,
            "redirected": bool(forced_to),
        }

    try:
        from twilio.rest import Client  # lazy import keeps cold-start small
    except ImportError as e:
        raise SmsError(
            "twilio package not installed — add 'twilio' to requirements.txt"
        ) from e

    client = Client(account_sid, auth_token)
    try:
        msg = client.messages.create(to=actual_to, from_=from_number, body=body)
    except Exception as e:
        raise SmsError(f"Twilio API error: {e}") from e

    return {
        "sid": msg.sid,
        "to": actual_to,
        "from": from_number,
        "status": msg.status,
        "billed_segments": int(getattr(msg, "num_segments", 1) or 1),
        "redirected": bool(forced_to),
    }
