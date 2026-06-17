import { Trophy } from "@phosphor-icons/react/dist/ssr";
import { getCachedLastGameRecap } from "@/lib/recap";
import { dateLabelCt, vsOrAt } from "@/lib/schedule";

export async function LastGameRecap() {
  const data = await getCachedLastGameRecap();
  if (!data) return null;
  const { game, recap } = data;

  return (
    <section className="rounded-[16px] bg-white/5 border border-white/8 p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] tracking-[0.22em] font-mono uppercase text-paper/55">
          Last Game · {dateLabelCt(game).split(",")[0]}
        </span>
        <span
          className={`text-[10px] tracking-[0.22em] font-mono uppercase tabular ${
            recap.result === "W" ? "text-fever-gold" : "text-paper/50"
          }`}
        >
          {recap.result === "W" ? "WIN" : "LOSS"} · {recap.score}
        </span>
      </div>

      <h3 className="font-display text-2xl tracking-tight leading-none mb-2">
        Fever <span className="text-fever-gold">{vsOrAt(game)}</span> {game.opponent}
      </h3>

      <p className="text-sm text-paper/75 leading-snug">{recap.summary}</p>

      {recap.top_scorers.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Trophy size={13} weight="duotone" className="text-fever-gold" />
            <p className="text-[10px] tracking-[0.18em] font-mono uppercase text-paper/45">
              Top Scorers
            </p>
          </div>
          <div className="space-y-1.5">
            {recap.top_scorers.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-paper">{p.name}</span>
                <span className="text-paper/60 tabular">
                  {p.pts} pts
                  {p.reb != null ? ` · ${p.reb} reb` : ""}
                  {p.ast != null ? ` · ${p.ast} ast` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
