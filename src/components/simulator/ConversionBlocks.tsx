"use client";

import Link from "next/link";
import { runSimulation, formatEur } from "@/lib/simulator";
import type { SimulatorOutput, SimulatorInput, MonthlyDataPoint } from "@/lib/simulator";

// ─── URL helper ───────────────────────────────────────────────────────────────

function buildSimUrl(input: SimulatorInput): string {
  const p = new URLSearchParams({
    monthly: String(input.monthlyAmount),
    years: String(input.durationYears),
    return: String(input.annualReturnPct),
    fees: String(input.annualFeesPct),
  });
  return `/simulateur?${p.toString()}`;
}

// ─── Milestone helpers ────────────────────────────────────────────────────────

const MILESTONES = [1_000_000, 500_000, 250_000, 100_000, 50_000, 25_000, 10_000];

/** Pick the highest round milestone ≤ finalValue (and > 0). */
function pickMilestone(finalValue: number): number | null {
  return MILESTONES.find((m) => m <= finalValue) ?? null;
}

/** First year index at which portfolioValue crosses target. null if never. */
function yearReaching(data: MonthlyDataPoint[], target: number): number | null {
  for (const p of data) {
    if (p.portfolioValue >= target) return p.year;
  }
  return null;
}

// ─── Main wrapper ─────────────────────────────────────────────────────────────

export function ConversionBlocks({ output }: { output: SimulatorOutput }) {
  return (
    <div className="space-y-3">
      <LossBlock output={output} />
      <TimeShiftBlock output={output} />
      <ErrorBlock output={output} />
    </div>
  );
}

// ─── 1. LOSS BLOCK ────────────────────────────────────────────────────────────

function LossBlock({ output }: { output: SimulatorOutput }) {
  const { input } = output;
  const current = output.base.finalValue;

  const optimizedInput: SimulatorInput = {
    ...input,
    monthlyAmount: input.monthlyAmount + 50,
  };
  const optimized = runSimulation(optimizedInput);
  const gap = optimized.base.finalValue - current;

  if (gap <= 0) return null;

  return (
    <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-5">
      <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3">
        💸 Vous laissez de l&apos;argent sur la table
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-500">Sans optimisation</span>
          <span className="text-sm font-semibold text-gray-700 tabular-nums">
            {formatEur(current)}
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t border-red-100 pt-2">
          <span className="text-sm text-emerald-700 font-semibold">
            Avec +50&nbsp;€/mois
          </span>
          <span className="text-base font-bold text-emerald-700 tabular-nums">
            {formatEur(optimized.base.finalValue)}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-red-200 px-4 py-3 mb-4">
        <p className="text-sm font-semibold text-gray-900">
          👉 Différence :{" "}
          <span className="text-xl font-bold text-red-700 tabular-nums">
            +{formatEur(gap)}
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          C&apos;est un café par jour. Voilà ce qu&apos;il devient sur {input.durationYears} ans.
        </p>
      </div>

      <Link
        href={buildSimUrl(optimizedInput)}
        className="btn-primary w-full text-sm px-5 py-2.5 inline-flex items-center justify-center"
      >
        Voir mon vrai potentiel →
      </Link>
    </div>
  );
}

// ─── 2. TIME SHIFT BLOCK ──────────────────────────────────────────────────────

function TimeShiftBlock({ output }: { output: SimulatorOutput }) {
  const { input } = output;
  const milestone = pickMilestone(output.base.finalValue);
  if (!milestone) return null;

  const yearCurrent = yearReaching(output.base.monthlyData, milestone);
  if (yearCurrent === null) return null;

  // Optimization: if fees are reducible, reduce by 0.2 pp (better ETF); else +50 €/mois.
  const canReduceFees = input.annualFeesPct > 0.2;
  const optimizedInput: SimulatorInput = canReduceFees
    ? { ...input, annualFeesPct: Math.max(0.1, input.annualFeesPct - 0.2) }
    : { ...input, monthlyAmount: input.monthlyAmount + 50 };

  const optimized = runSimulation(optimizedInput);
  const yearOptimized = yearReaching(optimized.base.monthlyData, milestone);
  if (yearOptimized === null || yearOptimized >= yearCurrent) return null;

  const yearsLost = yearCurrent - yearOptimized;
  const baseYear = new Date().getFullYear();
  const calCurrent = baseYear + yearCurrent;
  const calOpt = baseYear + yearOptimized;

  const optimizationLabel = canReduceFees
    ? `en baissant vos frais de 0,2&nbsp;%`
    : `avec +50&nbsp;€/mois`;

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-5">
      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
        ⏳ Vous perdez des années
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-500">
            À ce rythme — {formatEur(milestone)} atteints en
          </span>
          <span className="text-sm font-semibold text-gray-700 tabular-nums">
            {calCurrent}
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t border-amber-100 pt-2">
          <span
            className="text-sm text-emerald-700 font-semibold"
            dangerouslySetInnerHTML={{
              __html: `En optimisant (${optimizationLabel})`,
            }}
          />
          <span className="text-base font-bold text-emerald-700 tabular-nums">
            {calOpt}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-amber-200 px-4 py-3 mb-4">
        <p className="text-sm font-semibold text-gray-900">
          👉 Vous perdez{" "}
          <span className="text-xl font-bold text-amber-700 tabular-nums">
            {yearsLost} année{yearsLost > 1 ? "s" : ""}
          </span>{" "}
          de votre vie d&apos;investisseur.
        </p>
      </div>

      <Link
        href={buildSimUrl(optimizedInput)}
        className="btn-primary w-full text-sm px-5 py-2.5 inline-flex items-center justify-center"
      >
        Gagner ces {yearsLost} année{yearsLost > 1 ? "s" : ""} →
      </Link>
    </div>
  );
}

// ─── 3. ERROR BLOCK ───────────────────────────────────────────────────────────

type ErrorDef = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  optimized: SimulatorInput;
  ctaLabel: string;
  ctaHref?: string; // override (e.g. /upgrade for volatility error)
};

function detectErrors(input: SimulatorInput): ErrorDef[] {
  const errors: ErrorDef[] = [];

  if (input.annualFeesPct > 0.2) {
    errors.push({
      id: "fees",
      icon: "💰",
      title: "Frais ETF trop élevés",
      desc: `Vos frais sont à ${input.annualFeesPct.toString().replace(".", ",")}&nbsp;%. Les meilleurs ETF du marché sont à 0,1&nbsp;%. Sur ${input.durationYears} ans, chaque 0,1&nbsp;% compte.`,
      optimized: { ...input, annualFeesPct: 0.1 },
      ctaLabel: "Corriger cette erreur",
    });
  }

  if (input.durationYears < 20) {
    errors.push({
      id: "duration",
      icon: "⏰",
      title: "Horizon trop court",
      desc: `Vous projetez sur ${input.durationYears} ans seulement. Les intérêts composés accélèrent massivement après 20 ans — c&apos;est là que le DCA devient puissant.`,
      optimized: { ...input, durationYears: input.durationYears + 5 },
      ctaLabel: "Voir avec 5 ans de plus",
    });
  }

  if (input.monthlyAmount < 200) {
    errors.push({
      id: "monthly",
      icon: "📉",
      title: "Versement prudent",
      desc: `${input.monthlyAmount}&nbsp;€/mois, c&apos;est un bon début — mais +100&nbsp;€ maintenant change radicalement le résultat final.`,
      optimized: { ...input, monthlyAmount: input.monthlyAmount + 100 },
      ctaLabel: "Voir avec +100 €/mois",
    });
  }

  // Fallback: optimistic return not validated by volatility → push Monte Carlo.
  if (errors.length === 0 && input.annualReturnPct >= 6) {
    errors.push({
      id: "volatility",
      icon: "⚠️",
      title: "Rendement non validé par la volatilité",
      desc: `Votre projection de ${input.annualReturnPct}&nbsp;%/an suppose que tout se passe bien. Les marchés ne sont pas linéaires. Monte Carlo teste votre stratégie contre 1 000 scénarios réels.`,
      optimized: input,
      ctaLabel: "Valider avec Monte Carlo",
      ctaHref: "/upgrade?feature=monte-carlo",
    });
  }

  return errors;
}

function ErrorBlock({ output }: { output: SimulatorOutput }) {
  const errors = detectErrors(output.input);
  if (!errors.length) return null;

  // Pick the error with the largest optimization impact.
  const scored = errors.map((err) => {
    if (err.ctaHref) return { err, impact: 0 }; // fixed-target errors (no sim impact)
    const opt = runSimulation(err.optimized);
    return { err, impact: opt.base.finalValue - output.base.finalValue };
  });
  scored.sort((a, b) => b.impact - a.impact);
  const { err, impact } = scored[0];

  const href = err.ctaHref ?? buildSimUrl(err.optimized);

  return (
    <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-5">
      <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3">
        ⚠️ Erreur fréquente détectée
      </p>

      <p className="text-base font-bold text-gray-900 mb-1.5">
        {err.icon} {err.title}
      </p>
      <p
        className="text-sm text-gray-600 mb-4 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: err.desc }}
      />

      {impact > 0 && (
        <div className="rounded-xl bg-white border border-red-200 px-4 py-3 mb-4">
          <p className="text-sm font-semibold text-gray-900">
            👉 Impact estimé :{" "}
            <span className="text-xl font-bold text-red-700 tabular-nums">
              −{formatEur(impact)}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            C&apos;est ce que cette erreur vous coûte sur {output.input.durationYears} ans.
          </p>
        </div>
      )}

      <Link
        href={href}
        className="btn-primary w-full text-sm px-5 py-2.5 inline-flex items-center justify-center"
      >
        {err.ctaLabel} →
      </Link>
    </div>
  );
}
