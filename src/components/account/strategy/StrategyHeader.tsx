"use client";

import { useStrategy } from "./StrategyContext";
import { formatEur } from "@/lib/simulator";
import { formatMonthLabel } from "./components/utils";

export function StrategyHeader() {
  const { strategy, monthsElapsed } = useStrategy();
  const { input, startMonth } = strategy;

  return (
    <header className="rounded-2xl border border-primary-100 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Ma stratégie DCA
          </p>
          <p className="text-lg font-bold text-gray-900 leading-tight">
            <span className="tabular-nums">{formatEur(input.monthlyAmount)}/mois</span>
            <span className="text-gray-300 mx-2 font-light">·</span>
            <span className="tabular-nums">{input.durationYears} ans</span>
            <span className="text-gray-300 mx-2 font-light">·</span>
            <span className="tabular-nums">{input.annualReturnPct} %/an</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Démarrée en {formatMonthLabel(startMonth)} · {monthsElapsed} mois écoulés
          </p>
        </div>
      </div>
    </header>
  );
}
