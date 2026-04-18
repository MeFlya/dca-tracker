"use client";

import type { SimulatorOutput } from "@/lib/simulator";
import type { MonteCarloResult } from "@/lib/monte-carlo";
import { formatEur } from "@/lib/simulator";

interface Props {
  output: SimulatorOutput;
  mc: MonteCarloResult;
}

export function SimulatorHero({ output, mc }: Props) {
  const { base, input } = output;
  const multiplier = base.totalInvested > 0
    ? base.finalValue / base.totalInvested
    : 1;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-blue-600 p-6 text-white shadow-lg">
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
      <p className="text-primary-300 text-sm mb-5">
        valeur projetée · scénario de base
        {multiplier > 1 && (
          <span className="ml-2 text-emerald-300 font-semibold">
            × {multiplier.toFixed(1)} votre mise
          </span>
        )}
      </p>

      {/* Distribution chips from Monte Carlo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Chip label="Pire cas réaliste" value={formatEur(mc.finalP10)} dim />
        <Chip label="Scénario médian" value={formatEur(mc.finalP50)} />
        <Chip label="Meilleur cas réaliste" value={formatEur(mc.finalP90)} highlight />
        <Chip
          label="Probabilité de gain"
          value={`${mc.probabilityPositive} %`}
          highlight={mc.probabilityPositive >= 85}
        />
      </div>

      <p className="text-primary-300/70 text-xs mt-3">
        Distribition issue de 1 000 simulations Monte Carlo · pas une garantie de rendement
      </p>
    </div>
  );
}

function Chip({
  label,
  value,
  dim = false,
  highlight = false,
}: {
  label: string;
  value: string;
  dim?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-2.5 text-center ${
        highlight
          ? "bg-white/20 ring-1 ring-white/30"
          : dim
          ? "bg-black/20"
          : "bg-white/10"
      }`}
    >
      <p className="text-[10px] text-primary-200 leading-tight mb-1">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${highlight ? "text-white" : "text-primary-100"}`}>
        {value}
      </p>
    </div>
  );
}
