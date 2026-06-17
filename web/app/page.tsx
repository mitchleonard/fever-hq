import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";
import { NextGameCard } from "@/components/NextGameCard";
import { LastGameRecap } from "@/components/LastGameRecap";
import { ChatInterface } from "@/components/ChatInterface";
import { InstallPrompt } from "@/components/InstallPrompt";
import { RegisterSW } from "@/components/RegisterSW";
import { CourtRule } from "@/components/CourtRule";
import { nextGame } from "@/lib/schedule";

// This page reads the current time on every request (nextGame(), the
// recap freshness check). Without this, Next.js statically prerenders it
// once at build/deploy time and the "next game" freezes at whatever was
// upcoming when the last deploy happened.
export const dynamic = "force-dynamic";

export default function HomePage() {
  const next = nextGame();

  return (
    <div className="flex flex-col min-h-[100dvh] bg-fever-navy-deep">
      <AppHeader />

      {/* Above-chat surface: persistent next-game card + last-game recap */}
      {next && (
        <div className="mx-auto w-full max-w-2xl px-5 pt-4">
          <NextGameCard game={next} />
          <CourtRule className="mt-5 opacity-50" />
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl px-5">
        <Suspense fallback={null}>
          <LastGameRecap />
        </Suspense>
      </div>

      {/* Chat takes the remaining height */}
      <main className="flex-1 mx-auto w-full max-w-2xl flex flex-col min-h-0">
        <ChatInterface />
      </main>

      <RegisterSW />
      <InstallPrompt />
    </div>
  );
}
