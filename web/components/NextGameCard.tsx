"use client";

import { motion, useReducedMotion } from "motion/react";
import { Television, MapPin } from "@phosphor-icons/react";
import {
  type Game,
  dateLabelCt,
  tipoffTimeOnlyCt,
  channelWithYouTubeTV,
  shortVenue,
  vsOrAt,
  msUntilTipoff,
} from "@/lib/schedule";
import { useEffect, useState } from "react";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "TIPOFF";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function NextGameCard({ game }: { game: Game }) {
  const reduce = useReducedMotion();
  const [ms, setMs] = useState(msUntilTipoff(game));

  useEffect(() => {
    const t = setInterval(() => setMs(msUntilTipoff(game)), 60_000);
    return () => clearInterval(t);
  }, [game]);

  return (
    <motion.section
      className={`relative overflow-hidden rounded-[16px] bg-fever-navy-soft/70 border border-white/8 p-5${reduce ? "" : " card-reveal"}`}
    >
      {/* Top metadata strip */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] tracking-[0.22em] font-mono uppercase text-paper/55">
          Next Game
        </span>
        <span className="text-[10px] tracking-[0.22em] font-mono uppercase text-fever-gold tabular">
          {formatCountdown(ms)}
        </span>
      </div>

      {/* Matchup headline */}
      <h2 className="font-display text-4xl md:text-5xl tracking-tight leading-[0.95] text-balance">
        Fever{" "}
        <span className="text-fever-gold">
          {vsOrAt(game)}
        </span>{" "}
        {game.opponent}
      </h2>

      {/* Date row */}
      <p className="mt-3 text-paper/75 text-sm">
        {dateLabelCt(game)} · <span className="tabular text-paper">{tipoffTimeOnlyCt(game)}</span>
      </p>

      {/* Channel + venue meta */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="flex items-start gap-2.5">
          <Television
            size={18}
            weight="duotone"
            className="text-fever-gold mt-0.5 shrink-0"
          />
          <div>
            <p className="text-[10px] tracking-[0.18em] font-mono uppercase text-paper/45 mb-0.5">
              Channel
            </p>
            <p className="text-sm text-paper leading-tight">
              {channelWithYouTubeTV(game.channel)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MapPin
            size={18}
            weight="duotone"
            className="text-fever-gold mt-0.5 shrink-0"
          />
          <div>
            <p className="text-[10px] tracking-[0.18em] font-mono uppercase text-paper/45 mb-0.5">
              Venue
            </p>
            <p className="text-sm text-paper leading-tight">
              {shortVenue(game.venue)}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
