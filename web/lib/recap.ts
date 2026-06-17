import { unstable_cache } from "next/cache";
import { lastGame, tipoffUtc, type Game } from "./schedule";
import { getGameRecap, type GameRecap } from "./llm";

const RECAP_MAX_AGE_MS = 4 * 24 * 60 * 60 * 1000; // 4 days
const RECAP_REVALIDATE_SECONDS = 30 * 60; // 30 min

/** Last game's recap, cached for 30 min and only fetched while the game
 * is recent. Returns null once a game is more than 4 days old (off-topic
 * for the home screen, and avoids spending API calls on stale games). */
export async function getCachedLastGameRecap(): Promise<{
  game: Game;
  recap: GameRecap;
} | null> {
  const game = lastGame();
  if (!game) return null;
  if (Date.now() - tipoffUtc(game).getTime() > RECAP_MAX_AGE_MS) return null;

  const cached = unstable_cache(
    () => getGameRecap(game),
    ["last-game-recap", game.date, game.opponent],
    { revalidate: RECAP_REVALIDATE_SECONDS },
  );

  const recap = await cached();
  if (!recap) return null;
  return { game, recap };
}
