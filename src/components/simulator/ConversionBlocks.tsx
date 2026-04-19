"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  TrendingDown,
  Clock,
  AlertTriangle,
  ArrowRight,
  Check,
} from "lucide-react";
import { runSimulation, formatEur } from "@/lib/simulator";
import type { SimulatorOutput, SimulatorInput, MonthlyDataPoint } from "@/lib/simulator";
import { buildUpgradeUrl } from "@/lib/upgrade-link";

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

// ─── Premium fix sub-block ────────────────────────────────────────────────────
// Bridges emotional pain ("you lose X") to actionable Premium features.
// Rendered below each block's CTA.

function PremiumFix({ bullets }: { bullets: string[] }) {
  return (
    <div className="mt-4 rounded-xl bg-primary-50/60 border border-primary-100 px-4 py-3">
      <p className="text-xs font-bold text-primary-800 mb-2.5 flex items-center gap-2">
        <span className="inline-flex items-center bg-primary-600 text-white px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
          Premium
        </span>
        <span className="uppercase tracking-wider text-primary-700">vous permet de :</span>
      </p>
      <ul className="space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-primary-900 leading-relaxed">
            <Check size={14} className="text-primary-600 mt-0.5 shrink-0" strokeWidth={2.5} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main wrapper ─────────────────────────────────────────────────────────────

export function ConversionBlocks({ output }: { output: SimulatorOutput }) {
  const { user } = useUser();
  const plan = (user?.publicMetadata?.plan as string) ?? "free";
  const isPremium = plan === "premium";

  return (
    <div className="space-y-3">
      <LossBlock output={output} isPremium={isPremium} />
      <TimeShiftBlock output={output} isPremium={isPremium} />
      <ErrorBlock output={output} isPremium={isPremium} />
    </div>
  );
}

/** CTA routing: Premium → /account, Free → /upgrade?feature=... */
function ctaHref(isPremium: boolean, feature: string, input: SimulatorInput): string {
  if (isPremium) return "/account";
  return buildUpgradeUrl(feature, input);
}

// ─── 1. LOSS BLOCK ────────────────────────────────────────────────────────────

function LossBlock({ output, isPremium }: { output: SimulatorOutput; isPremium: boolean }) {
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
    <div className="rounded-2xl border border-red-100 bg-red-50/30 p-5">
      <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <TrendingDown size={14} />
        Vous laissez de l&apos;argent sur la table
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

      <div className="rounded-xl bg-white border border-red-100 px-4 py-3 mb-4">
        <p className="text-sm font-semibold text-gray-900">
          Différence :{" "}
          <span className="text-xl font-bold text-red-700 tabular-nums">
            +{formatEur(gap)}
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          C&apos;est un café par jour. Voilà ce qu&apos;il devient sur {input.durationYears} ans.
        </p>
      </div>

      <Link
        href={ctaHref(isPremium, "save-strategy", input)}
        className="btn-primary w-full text-sm px-5 py-2.5 inline-flex items-center justify-center btn-lift"
      >
        {isPremium ? "Ouvrir mon dashboard" : "Voir mon vrai potentiel"}
        <ArrowRight size={14} className="ml-1" />
      </Link>

      <PremiumFix
        bullets={[
          "Sauvegarder et comparer 10 variantes de votre stratégie",
          "Monte Carlo : vérifier que +50 €/mois tient face à la volatilité réelle",
          "Suivre mois après mois le potentiel effectivement gagné",
        ]}
      />
    </div>
  );
}

// ─── 2. TIME SHIFT BLOCK ──────────────────────────────────────────────────────

function TimeShiftBlock({ output, isPremium }: { output: SimulatorOutput; isPremium: boolean }) {
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
    <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Clock size={14} />
        Vous perdez des années
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

      <div className="rounded-xl bg-white border border-amber-100 px-4 py-3 mb-4">
        <p className="text-sm font-semibold text-gray-900">
          Vous perdez{" "}
          <span className="text-xl font-bold text-amber-700 tabular-nums">
            {yearsLost} année{yearsLost > 1 ? "s" : ""}
          </span>{" "}
          de votre vie d&apos;investisseur.
        </p>
      </div>

      <Link
        href={ctaHref(isPremium, "save-strategy", input)}
        className="btn-primary w-full text-sm px-5 py-2.5 inline-flex items-center justify-center btn-lift"
      >
        {isPremium
          ? "Ouvrir mon dashboard"
          : `Gagner ces ${yearsLost} année${yearsLost > 1 ? "s" : ""}`}
        <ArrowRight size={14} className="ml-1" />
      </Link>

      <PremiumFix
        bullets={[
          "Suivre chaque mois si vous tenez ce nouveau cap",
          "Comparer votre portefeuille réel vs votre projection",
          `Bilan mensuel automatique : êtes-vous toujours sur ces ${yearsLost} année${yearsLost > 1 ? "s" : ""} gagnée${yearsLost > 1 ? "s" : ""} ?`,
        ]}
      />
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
      icon: "",
      title: "Frais ETF trop élevés",
      desc: `Vos frais sont à ${input.annualFeesPct.toString().replace(".", ",")}&nbsp;%. Les meilleurs ETF du marché sont à 0,1&nbsp;%. Sur ${input.durationYears} ans, chaque 0,1&nbsp;% compte.`,
      optimized: { ...input, annualFeesPct: 0.1 },
      ctaLabel: "Corriger cette erreur",
    });
  }

  if (input.durationYears < 20) {
    errors.push({
      id: "duration",
      icon: "",
      title: "Horizon trop court",
      desc: `Vous projetez sur ${input.durationYears} ans seulement. Les intérêts composés accélèrent massivement après 20 ans — c&apos;est là que le DCA devient puissant.`,
      optimized: { ...input, durationYears: input.durationYears + 5 },
      ctaLabel: "Voir avec 5 ans de plus",
    });
  }

  if (input.monthlyAmount < 200) {
    errors.push({
      id: "monthly",
      icon: "",
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
      icon: "",
      title: "Rendement non validé par la volatilité",
      desc: `Votre projection de ${input.annualReturnPct}&nbsp;%/an suppose que tout se passe bien. Les marchés ne sont pas linéaires. Monte Carlo teste votre stratégie contre 1 000 scénarios réels.`,
      optimized: input,
      ctaLabel: "Valider avec Monte Carlo",
      ctaHref: "/upgrade?feature=monte-carlo",
    });
  }

  return errors;
}

function ErrorBlock({ output, isPremium }: { output: SimulatorOutput; isPremium: boolean }) {
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

  // Premium users → /account. Free → /upgrade?feature=monte-carlo (error = risk/validation).
  const href = isPremium ? "/account" : ctaHref(false, "monte-carlo", output.input);

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/30 p-5">
      <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <AlertTriangle size={14} />
        Erreur fréquente détectée
      </p>

      <p className="text-base font-bold text-gray-900 mb-1.5">{err.title}</p>
      <p
        className="text-sm text-gray-600 mb-4 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: err.desc }}
      />

      {impact > 0 && (
        <div className="rounded-xl bg-white border border-red-100 px-4 py-3 mb-4">
          <p className="text-sm font-semibold text-gray-900">
            Impact estimé :{" "}
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
        className="btn-primary w-full text-sm px-5 py-2.5 inline-flex items-center justify-center btn-lift"
      >
        {isPremium ? "Ouvrir mon dashboard" : err.ctaLabel}
        <ArrowRight size={14} className="ml-1" />
      </Link>

      <PremiumFix
        bullets={[
          "Monte Carlo teste votre stratégie contre 1 000 scénarios de marché",
          "Voir le pire cas réaliste (pas juste la moyenne optimiste)",
          "Connaître votre probabilité exacte d'être en plus-value",
        ]}
      />
    </div>
  );
}
