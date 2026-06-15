import { AppHeader } from "@/components/AppHeader";
import { NextGameCard } from "@/components/NextGameCard";
import { ChatInterface } from "@/components/ChatInterface";
import { InstallPrompt } from "@/components/InstallPrompt";
import { RegisterSW } from "@/components/RegisterSW";
import { CourtRule } from "@/components/CourtRule";
import { nextGame } from "@/lib/schedule";

export default function HomePage() {
  const next = nextGame();

  return (
    <div className="flex flex-col min-h-[100dvh] bg-fever-navy-deep">
      <AppHeader />

      {/* Above-chat surface: persistent next-game card */}
      {next && (
        <div className="mx-auto w-full max-w-2xl px-5 pt-4">
          <NextGameCard game={next} />
          <CourtRule className="mt-5 opacity-50" />
        </div>
      )}

      {/* Chat takes the remaining height */}
      <main className="flex-1 mx-auto w-full max-w-2xl flex flex-col min-h-0">
        <ChatInterface />
      </main>

      <RegisterSW />
      <InstallPrompt />
    </div>
  );
}
