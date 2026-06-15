import Link from "next/link";
import { Wordmark } from "./Wordmark";

/**
 * Persistent top bar. Minimal — wordmark + a single status pill.
 * Pill shows "LIVE" during games eventually; for v1, just the date.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 bg-fever-navy-deep/80 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto max-w-2xl px-5 py-3 flex items-center justify-between">
        <Link href="/" className="block" aria-label="Fever HQ home">
          <Wordmark size="sm" />
        </Link>
        <Link
          href="/schedule"
          className="text-[10px] tracking-[0.2em] font-mono uppercase text-paper/60 hover:text-fever-gold transition-colors"
        >
          Schedule
        </Link>
      </div>
    </header>
  );
}
