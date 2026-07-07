"use client";

import { useReducedMotion } from "motion/react";

const PROMPTS = [
  "When's the next game?",
  "What channel tonight?",
  "Who plays this weekend?",
  "When's Caitlin back home?",
];

type Props = {
  onPick: (prompt: string) => void;
};

export function SuggestedPrompts({ onPick }: Props) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-wrap gap-2">
      {PROMPTS.map((p, i) => (
        <button
          key={p}
          onClick={() => onPick(p)}
          style={reduce ? undefined : { animationDelay: `${0.1 + i * 0.05}s` }}
          className={`px-3.5 py-2 rounded-full text-sm bg-white/5 border border-white/10 text-paper/85 hover:bg-fever-gold hover:text-fever-navy-deep hover:border-fever-gold transition-colors active:scale-[0.98]${reduce ? "" : " prompt-reveal"}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
