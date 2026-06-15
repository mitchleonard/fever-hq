"use client";

import { motion, useReducedMotion } from "motion/react";

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
        <motion.button
          key={p}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.1 + i * 0.05,
            ease: [0.16, 1, 0.3, 1],
          }}
          onClick={() => onPick(p)}
          className="px-3.5 py-2 rounded-full text-sm bg-white/5 border border-white/10 text-paper/85 hover:bg-fever-gold hover:text-fever-navy-deep hover:border-fever-gold transition-colors active:scale-[0.98]"
        >
          {p}
        </motion.button>
      ))}
    </div>
  );
}
