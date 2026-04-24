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
    // bg-slate-950 (Premium identity), radial glow primary derrière le
    // chiffre uniquement — pas un fond saturé bleu qui écrase la page.
    // Dot grid + radial glow pour garder la cohérence TrackingPitch.
    <div className="relative rounded-2xl bg-slate-950 text-white shadow-lg overflow-hidden">
      {/* Dot grid texture */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />
      {/* Radial halo — centered behind the big number. No blur filter. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(500px circle at 50% 40%, rgba(59, 130, 246, 0.25), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative p-6">
        {/* Context line */}
        <p className="text-slate-400 text-sm mb-3">
          En investissant{" "}
          <span className="font-semibold text-white">
            {input.monthlyAmount.toLocaleString("fr-FR")} €/mois
          </span>{" "}
          pendant{" "}
          <span className="font-semibold text-white">{input.durationYears} ans</span>
          {" "}·{" "}
          rendement {input.annualReturnPct} %/an
        </p>

        {/* Big number — text-white over the radial halo. */}
        <div className="mb-1">
          <p className="text-5xl font-bold tabular-nums tracking-tight text-white">
            {formatEur(base.finalValue)}
          </p>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          Scénario moyen basé sur un rendement estimé de {input.annualReturnPct}&nbsp;%/an
        </p>

        {/* Stats row — glass tiles consistent with TrackingPitch */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Capital investi" value={formatEur(base.totalInvested)} />
          <Stat label="Gains générés" value={`+ ${formatEur(gains)}`} highlight />
          <Stat label="Multiplicateur" value={`× ${multiplier.toFixed(1)}`} highlight />
        </div>
      </div>

      {/* Psychological upgrade trigger — glass bar at bottom */}
      <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-300 leading-snug">
          Vous voyez le résultat{" "}
          <span className="text-white font-semibold">moyen</span>.
          {" "}Mais dans la réalité, les marchés ne sont jamais moyens.
        </p>
        <Link
          href="#monte-carlo"
          className="shrink-0 bg-white text-slate-950 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap"
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
    <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-center backdrop-blur-sm">
      <p className="text-[10px] text-slate-400 leading-tight mb-1">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${highlight ? "text-emerald-400" : "text-slate-100"}`}>
        {value}
      </p>
    </div>
  );
}
