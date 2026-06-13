"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useStrategy } from "./StrategyContext";
import { formatEur } from "@/lib/simulator";
import { formatMonthLabel } from "./components/utils";
import { StrategySetupWizard } from "@/components/account/StrategySetupWizard";

export function StrategyHeader() {
  const { strategy, monthsElapsed } = useStrategy();
  const { input, startMonth, allocation } = strategy;
  const [editing, setEditing] = useState(false);

  const startingCapital = Math.max(input.startingCapital ?? 0, 0);

  return (
    <>
      <header className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8 shadow-card-lg">
        {/* Texture + halo (langage premium de la home) */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,_#fff_1px,_transparent_1px)] [background-size:22px_22px]"
        />
        <div
          aria-hidden
          className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary-500/20 blur-3xl"
        />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-300 mb-2">
              Ma stratégie DCA
            </p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
              <span className="tabular-nums">{formatEur(input.monthlyAmount)}/mois</span>
              <span className="text-slate-600 mx-2 font-light">·</span>
              <span className="tabular-nums">{input.durationYears} ans</span>
              <span className="text-slate-600 mx-2 font-light">·</span>
              <span className="tabular-nums">{input.annualReturnPct} %/an</span>
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Démarrée en {formatMonthLabel(startMonth)} · {monthsElapsed} mois écoulé{monthsElapsed > 1 ? "s" : ""}
              {startingCapital > 0 && (
                <> · {formatEur(startingCapital)} de capital initial</>
              )}
            </p>

            {allocation && allocation.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {allocation.map((a) => (
                  <span
                    key={a.displaySymbol}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-200 bg-white/5 border border-white/10 rounded-full px-2.5 py-1"
                  >
                    {a.displaySymbol}
                    <span className="text-slate-400 font-normal">{Math.round(a.weight)} %</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setEditing(true)}
            className="shrink-0 inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl backdrop-blur-sm transition-colors"
          >
            <SlidersHorizontal size={15} />
            Modifier
          </button>
        </div>
      </header>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-8 bg-black/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl my-auto animate-slide-up">
            <StrategySetupWizard initial={strategy} onCancel={() => setEditing(false)} />
          </div>
        </div>
      )}
    </>
  );
}
