"use client";

import Link from "next/link";
import type { SimulatorOutput } from "@/lib/simulator";
import { formatEur } from "@/lib/simulator";

interface Props {
  output: SimulatorOutput;
}

export function SimulatorHero({ output }: Props) {
  const { base, input } = output;
  const multiplier = base.totalInvested > 0
    ? base.finalValue / base.totalInvested
    : 1;
  const gains = base.finalValue - base.totalInvested;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-blue-600 text-white shadow-lg overflow-hidden">
      <div className="p-6">
        {/* Context line */}
        <p className="text-primary-200 text-sm mb-3">
          En investissant{" "}
          <span className="font-semibold text-white">
            {input.monthlyAmount.toLocaleString("fr-FR")} €/mois
          </span>{" "}
          pendant{" "}
          <span className="font-semibold text-white">{input.durationYears} ans</span>
          {" "}·{" "}
          rendement {input.annualReturnPct} %/an
        </p>

        {/* Big number */}
        <div className="mb-1">
          <p className="text-5xl font-bold tabular-nums tracking-tight">
            {formatEur(base.finalValue)}
          </p>
        </div>
        <p className="text-primary-300 text-sm mb-6">
          Scénario moyen basé sur un rendement estimé de {input.annualReturnPct}&nbsp;%/an
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Capital investi" value={formatEur(base.totalInvested)} />
          <Stat label="Gains générés" value={`+ ${formatEur(gains)}`} highlight />
          <Stat label="Multiplicateur" value={`× ${multiplier.toFixed(1)}`} highlight />
        </div>
      </div>

      {/* Psychological upgrade trigger */}
      <div className="border-t border-white/10 bg-black/20 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-primary-200 leading-snug">
          Vous voyez le résultat{" "}
          <span className="text-white font-semibold">moyen</span>.
          {" "}Mais dans la réalité, les marchés ne sont jamais moyens.
        </p>
        <Link
          href="#monte-carlo"
          className="shrink-0 bg-white text-primary-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors whitespace-nowrap"
        >
          Voir tous les scénarios →
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2.5 text-center">
      <p className="text-[10px] text-primary-200 leading-tight mb-1">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${highlight ? "text-emerald-300" : "text-primary-100"}`}>
        {value}
      </p>
    </div>
  );
}
