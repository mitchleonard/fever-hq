/**
 * Fever HQ — schedule data + helpers.
 *
 * Schedule source: schedule.json, all times in EASTERN TIME (broadcaster convention).
 * Display: always Central Time (CT) for the user.
 */
import scheduleData from "@/data/schedule.json";

export type Game = {
  date: string;          // YYYY-MM-DD
  tipoff_local: string;  // HH:MM in ET
  opponent: string;
  home_away: "home" | "away";
  venue: string;
  channel: string;
};

export type Schedule = {
  season: number;
  team: string;
  team_short: string;
  source: string;
  source_last_updated: string;
  games: Game[];
};

export const schedule = scheduleData as Schedule;

/** Tipoff as a UTC Date object, treating tipoff_local as America/New_York. */
export function tipoffUtc(game: Game): Date {
  // ET in summer = UTC-4, in winter = UTC-5. WNBA season is May-Oct = UTC-4.
  // For October games, DST ends first Sunday of November, so still ET=UTC-4.
  // Safe assumption for the whole regular season.
  const [hh, mm] = game.tipoff_local.split(":").map(Number);
  const [yyyy, mo, dd] = game.date.split("-").map(Number);
  // Construct UTC explicitly: ET = UTC - 4 during DST
  return new Date(Date.UTC(yyyy, mo - 1, dd, hh + 4, mm, 0));
}

/** Tipoff formatted in CT (Central). */
export function tipoffCt(game: Game): string {
  const utc = tipoffUtc(game);
  return utc.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function tipoffTimeOnlyCt(game: Game): string {
  const utc = tipoffUtc(game);
  return utc.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) + " CT";
}

export function dateLabelCt(game: Game): string {
  const utc = tipoffUtc(game);
  return utc.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** All games tipping off after `now`. */
export function upcomingGames(now: Date = new Date()): Game[] {
  return schedule.games.filter((g) => tipoffUtc(g).getTime() > now.getTime());
}

/** Past games (most-recent first). */
export function pastGames(now: Date = new Date()): Game[] {
  return schedule.games
    .filter((g) => tipoffUtc(g).getTime() <= now.getTime())
    .reverse();
}

export function nextGame(now: Date = new Date()): Game | null {
  return upcomingGames(now)[0] ?? null;
}

export function lastGame(now: Date = new Date()): Game | null {
  return pastGames(now)[0] ?? null;
}

/** Returns ms until tipoff. Negative if game has started/passed. */
export function msUntilTipoff(game: Game, now: Date = new Date()): number {
  return tipoffUtc(game).getTime() - now.getTime();
}

export function shortChannel(channel: string): string {
  // Trim "X / Y" to first channel only for compact display
  return channel.split("/")[0].trim();
}

/**
 * Networks carried on YouTube TV's base plan as of June 2026.
 * Source: tv.youtube.com/learn channel list.
 */
const YOUTUBE_TV_NETWORKS = new Set([
  "NBA TV",
  "ESPN",
  "ESPN2",
  "ABC",
  "CBS",
  "NBC",
  "ION",
  "USA Network",
  "FX",
  "MeTV",
]);

/** Returns true if any network in the channel string is on YouTube TV. */
export function isOnYouTubeTV(channel: string): boolean {
  const networks = channel.split("/").map((s) => s.trim());
  return networks.some((n) => YOUTUBE_TV_NETWORKS.has(n));
}

/**
 * Display channel name with YouTube TV indicator appended when carried.
 * Example: "NBA TV / WTHR" -> "NBA TV · YouTube TV"
 *          "Prime Video"  -> "Prime Video"
 */
export function channelWithYouTubeTV(channel: string): string {
  const primary = shortChannel(channel);
  return isOnYouTubeTV(channel) ? `${primary} · YouTube TV` : primary;
}

export function shortVenue(venue: string): string {
  return venue.split(",")[0].trim();
}

export function vsOrAt(game: Game): "vs" | "@" {
  return game.home_away === "home" ? "vs" : "@";
}
