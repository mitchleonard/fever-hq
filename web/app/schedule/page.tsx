import Link from "next/link";
import { CaretLeft, CalendarPlus, Television } from "@phosphor-icons/react/dist/ssr";
import { AppHeader } from "@/components/AppHeader";
import { CourtRule } from "@/components/CourtRule";
import { PushOptIn } from "@/components/PushOptIn";
import {
  upcomingGames,
  pastGames,
  dateLabelCt,
  tipoffTimeOnlyCt,
  channelWithYouTubeTV,
  vsOrAt,
  type Game,
} from "@/lib/schedule";

function GameRow({ game, played }: { game: Game; played?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3.5 ${
        played ? "opacity-50" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] tracking-[0.22em] font-mono uppercase text-paper/45 mb-0.5 tabular">
          {dateLabelCt(game).split(",")[0]}
        </p>
        <p className="font-display text-2xl tracking-tight leading-none text-paper">
          <span className="text-fever-gold">{vsOrAt(game)}</span> {game.opponent}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm tabular text-paper">{tipoffTimeOnlyCt(game)}</p>
        <p className="text-[11px] text-paper/55 flex items-center justify-end gap-1 mt-0.5">
          <Television size={11} weight="duotone" className="text-fever-gold" />
          {channelWithYouTubeTV(game.channel)}
        </p>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const upcoming = upcomingGames();
  const past = pastGames().slice(0, 5);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-fever-navy-deep pb-12">
      <AppHeader />

      <main className="mx-auto w-full max-w-2xl px-5 pt-6 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-paper/60 text-sm hover:text-fever-gold transition-colors"
        >
          <CaretLeft size={14} weight="bold" /> Chat
        </Link>

        {/* Push opt-in lives at the top of schedule since this is where she lands after installing */}
        <PushOptIn />

        {/* Calendar subscribe CTA */}
        <a
          href="/api/ics"
          className="block rounded-[12px] bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CalendarPlus
              size={20}
              weight="duotone"
              className="text-fever-gold shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm text-paper">Add every game to Google Calendar</p>
              <p className="text-xs text-paper/55 mt-0.5">
                Subscribe once, auto-syncs forever.
              </p>
            </div>
          </div>
        </a>

        {/* Upcoming section */}
        <section>
          <h2 className="font-display text-3xl tracking-tight leading-none mb-1">
            Upcoming
          </h2>
          <p className="text-[11px] tracking-[0.2em] font-mono uppercase text-paper/45 mb-3">
            {upcoming.length} games · all times CT
          </p>
          <CourtRule className="opacity-40 mb-1" />
          <div className="divide-y divide-white/8">
            {upcoming.map((g) => (
              <GameRow key={`${g.date}-${g.opponent}`} game={g} />
            ))}
          </div>
        </section>

        {/* Recent results section */}
        {past.length > 0 && (
          <section>
            <h2 className="font-display text-3xl tracking-tight leading-none mb-1">
              Recent
            </h2>
            <p className="text-[11px] tracking-[0.2em] font-mono uppercase text-paper/45 mb-3">
              Last {past.length} games
            </p>
            <CourtRule className="opacity-40 mb-1" />
            <div className="divide-y divide-white/8">
              {past.map((g) => (
                <GameRow key={`p-${g.date}-${g.opponent}`} game={g} played />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
