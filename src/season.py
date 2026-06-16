"""
Fever HQ — season detector.

Returns which delivery channel is active based on today's date:
- 'sms'   during WNBA active months (May 1 - Oct 31)
- 'email' during dormant months (Nov 1 - Apr 30)

Single source of truth for season state — every sender imports this.

Override for testing: set FEVER_HQ_CHANNEL_OVERRIDE=sms|email in env.
"""
from __future__ import annotations
import os
from datetime import date


SMS_MONTHS = {5, 6, 7, 8, 9, 10}  # May through October


def active_channel(today: date | None = None) -> str:
    """Returns 'sms' or 'email' for the current (or given) date.

    Honors FEVER_HQ_CHANNEL_OVERRIDE env var for testing.
    """
    override = os.environ.get("FEVER_HQ_CHANNEL_OVERRIDE", "").lower().strip()
    if override in ("sms", "email"):
        return override

    if today is None:
        today = date.today()
    return "sms" if today.month in SMS_MONTHS else "email"


def is_in_season(today: date | None = None) -> bool:
    return active_channel(today) == "sms"


def next_season_start(today: date | None = None) -> date:
    """Returns the next May 1. Used for off-season 'see you in May' messaging."""
    if today is None:
        today = date.today()
    year = today.year if today.month < 5 else today.year + 1
    return date(year, 5, 1)


if __name__ == "__main__":
    # Quick smoke test
    from datetime import date as _d
    cases = [
        (_d(2026, 5, 1), "sms"),
        (_d(2026, 6, 14), "sms"),
        (_d(2026, 10, 31), "sms"),
        (_d(2026, 11, 1), "email"),
        (_d(2027, 1, 15), "email"),
        (_d(2027, 4, 30), "email"),
        (_d(2027, 5, 1), "sms"),
    ]
    for d, expected in cases:
        got = active_channel(d)
        assert got == expected, f"{d}: expected {expected}, got {got}"
        print(f"  {d} -> {got} OK")
    print(f"Next season start from 2026-12-15: {next_season_start(_d(2026, 12, 15))}")
    print(f"Next season start from 2026-03-15: {next_season_start(_d(2026, 3, 15))}")
    print("season.py: all checks passed")
