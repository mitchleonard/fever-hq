/**
 * Fever HQ — ICS feed generator (TS port of generate_ics.py).
 *
 * Pure-string generator. RFC 5545 compliant. Embedded VTIMEZONE for ET source.
 * Calendar clients (Google, Apple) will display in the subscriber's local zone.
 */
import { schedule, type Game } from "./schedule";

const VTZ_NY = `BEGIN:VTIMEZONE
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
END:VTIMEZONE`;

function fmtDt(date: string, time: string): string {
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function addMinutes(dt: string, minutes: number): string {
  // dt format: YYYYMMDDTHHMMSS
  const y = parseInt(dt.slice(0, 4), 10);
  const mo = parseInt(dt.slice(4, 6), 10) - 1;
  const d = parseInt(dt.slice(6, 8), 10);
  const h = parseInt(dt.slice(9, 11), 10);
  const mi = parseInt(dt.slice(11, 13), 10);
  const date = new Date(Date.UTC(y, mo, d, h, mi));
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    "00"
  );
}

function eventUid(g: Game): string {
  const slug = g.opponent.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
  return `fever-${g.date}-${slug}@feverhq.local`;
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remainder = line;
  while (remainder.length > 75) {
    parts.push(remainder.slice(0, 73));
    remainder = " " + remainder.slice(73);
  }
  parts.push(remainder);
  return parts.join("\n");
}

function buildEvent(g: Game, dtstamp: string): string {
  const dtstart = fmtDt(g.date, g.tipoff_local);
  const dtend = addMinutes(dtstart, 150);
  const vsAt = g.home_away === "home" ? "vs" : "@";
  const summary = `Fever ${vsAt} ${g.opponent}`;
  const description =
    `Indiana Fever ${vsAt} ${g.opponent}\n` +
    `Tipoff: ${g.tipoff_local} ET\n` +
    `Watch on: ${g.channel}\n` +
    `Venue: ${g.venue}\n` +
    `\n` +
    `Schedule auto-updates via Fever HQ.`;
  return [
    "BEGIN:VEVENT",
    foldLine(`UID:${eventUid(g)}`),
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=America/New_York:${dtstart}`,
    `DTEND;TZID=America/New_York:${dtend}`,
    foldLine(`SUMMARY:${escapeText(summary)}`),
    foldLine(`DESCRIPTION:${escapeText(description)}`),
    foldLine(`LOCATION:${escapeText(g.venue)}`),
    "CATEGORIES:WNBA,Indiana Fever",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
  ].join("\n");
}

export function generateIcs(): string {
  const dtstamp =
    new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d+/, "")
      .slice(0, 15) + "Z";
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fever HQ//Indiana Fever 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine("X-WR-CALNAME:Indiana Fever 2026"),
    foldLine(
      "X-WR-CALDESC:Every Indiana Fever game with channel and tipoff. Auto-updates via Fever HQ.",
    ),
    "X-WR-TIMEZONE:America/New_York",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
    VTZ_NY,
  ];
  const body = schedule.games.map((g) => buildEvent(g, dtstamp));
  const footer = ["END:VCALENDAR"];
  const text = [...header, ...body, ...footer].join("\n") + "\n";
  return text.replace(/\n/g, "\r\n");
}
