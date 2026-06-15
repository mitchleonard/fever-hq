import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-fever-navy-deep px-6 text-center">
      <Wordmark size="lg" className="mb-6" />
      <p className="font-display text-3xl tracking-tight text-paper mb-2">
        Off the court.
      </p>
      <p className="text-paper/60 text-sm max-w-xs mb-8">
        That page does not exist. Try the next game or the full schedule.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-fever-gold text-fever-navy-deep px-5 py-2.5 font-medium text-sm active:scale-[0.98] transition-transform"
        >
          Next game
        </Link>
        <Link
          href="/schedule"
          className="rounded-full bg-white/10 text-paper px-5 py-2.5 font-medium text-sm active:scale-[0.98] transition-transform"
        >
          Schedule
        </Link>
      </div>
    </div>
  );
}
