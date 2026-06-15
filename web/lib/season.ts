/**
 * Fever HQ — season detector (port of Python season.py).
 *
 * Active channel:
 *   SMS/Push:  May 1 - Oct 31 (WNBA regular + playoff months)
 *   Email:     Nov 1 - Apr 30 (dormant)
 *
 * For the PWA, "sms" means push notifications are sent.
 * "email" means push is suppressed and a once-a-week digest email goes out instead.
 */

const SMS_MONTHS = new Set([5, 6, 7, 8, 9, 10]);

export type Channel = "sms" | "email";

export function activeChannel(date: Date = new Date()): Channel {
  const override = process.env.FEVER_HQ_CHANNEL_OVERRIDE;
  if (override === "sms" || override === "email") return override;
  // getMonth() is 0-indexed
  return SMS_MONTHS.has(date.getMonth() + 1) ? "sms" : "email";
}

export function isInSeason(date: Date = new Date()): boolean {
  return activeChannel(date) === "sms";
}

export function nextSeasonStart(today: Date = new Date()): Date {
  const year = today.getMonth() + 1 < 5 ? today.getFullYear() : today.getFullYear() + 1;
  return new Date(Date.UTC(year, 4, 1)); // May 1
}
