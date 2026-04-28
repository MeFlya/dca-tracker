"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SliderInput } from "@/components/ui/SliderInput";
import { runSimulation, formatEur } from "@/lib/simulator";
import {
  computeFiscalComparison,
  formatFiscalEur,
  PEA_DEPOSIT_CAP_EUR,
} from "@/lib/fiscal/pea-cto";

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULTS = {
  monthlyAmount: 200,
  durationYears: 20,
  annualReturnPct: 7,
  annualFeesPct: 0.3,
};

// ─── Component ──────────────────────────────────────────────────────────────

export function CalculatorClient() {
  const [monthlyAmount, setMonthlyAmount] = useState(DEFAULTS.monthlyAmount);
  const [durationYears, setDurationYears] = useState(DEFAULTS.durationYears);
  const [annualReturnPct, setAnnualReturnPct] = useState(
    DEFAULTS.annualReturnPct
  );
  const [annualFeesPct, setAnnualFeesPct] = useState(DEFAULTS.annualFeesPct);

  // Run the DCA simulation to get the gross final value (= the same engine
  // as /simulateur), then feed into the fiscal calculator.
  const { totalInvested, finalValue, comparison } = useMemo(() => {
    const sim = runSimulation({
      monthlyAmount,
      durationYears,
      annualReturnPct,
      annualFeesPct,
    });
    const totalInvested = sim.base.totalInvested;
    const finalValue = sim.base.finalValue;
    const comparison = computeFiscalComparison({
      totalInvested,
      finalValue,
      holdingYears: durationYears,
    });
    return { totalInvested, finalValue, comparison };
  }, [monthlyAmount, durationYears, annualReturnPct, annualFeesPct]);

  const reset = () => {
    setMonthlyAmount(DEFAULTS.monthlyAmount);
    setDurationYears(DEFAULTS.durationYears);
    setAnnualReturnPct(DEFAULTS.annualReturnPct);
    setAnnualFeesPct(DEFAULTS.annualFeesPct);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
      {/* Inputs */}
      <div className="card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-lg">
            Vos paramètres
          </h2>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
            title="Réinitialiser les valeurs par défaut"
          >
            Réinitialiser
          </button>
        </div>

        <SliderInput
          label="Versement mensuel"
          value={monthlyAmount}
          min={25}
          max={5000}
          step={25}
          unit="€"
          hint="Montant que vous investissez chaque mois."
          formatDisplay={(v) => new Intl.NumberFormat("fr-FR").format(v)}
          onChange={setMonthlyAmount}
        />

        <SliderInput
          label="Durée de l'investissement"
          value={durationYears}
          min={1}
          max={40}
          step={1}
          unit="ans"
          hint="La règle des 5 ans du PEA s'applique automatiquement."
          onChange={setDurationYears}
        />

        <SliderInput
          label="Rendement annuel brut"
          value={annualReturnPct}
          min={1}
          max={15}
          step={0.1}
          unit="%"
          hint="Avant frais. Le MSCI World a affiché ~7-8 %/an sur 30 ans."
          onChange={setAnnualReturnPct}
        />

        <SliderInput
          label="Frais annuels (TER)"
          value={annualFeesPct}
          min={0}
          max={2}
          step={0.01}
          unit="%"
          hint="CW8 : 0,38 %. VWCE : 0,22 %. SPY : 0,09 %."
          onChange={setAnnualFeesPct}
        />

        {/* Footer summary */}
        <div className="pt-4 border-t border-slate-100 text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Total investi</span>
            <span className="font-semibold tabular-nums text-gray-900">
              {formatEur(totalInvested)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Valeur finale (avant impôt)</span>
            <span className="font-semibold tabular-nums text-gray-900">
              {formatEur(finalValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Hero — winner + delta */}
        <WinnerHero comparison={comparison} />

        {/* PEA cap warning if applicable */}
        {comparison.peaCapExceeded && comparison.optimalMix && (
          <CapWarning
            totalInvested={totalInvested}
            mix={comparison.optimalMix}
          />
        )}

        {/* PEA + CTO side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AccountCard
            kind="pea"
            durationYears={durationYears}
            result={comparison.pea}
          />
          <AccountCard
            kind="cto"
            durationYears={durationYears}
            result={comparison.cto}
          />
        </div>

        {/* Premium nudge — fiscal annual recap (Premium-only) */}
        <PremiumNudge />
      </div>
    </div>
  );
}

// ─── Winner hero ────────────────────────────────────────────────────────────

function WinnerHero({
  comparison,
}: {
  comparison: ReturnType<typeof computeFiscalComparison>;
}) {
  const peaWins = comparison.peaAdvantageEur > 0;
  const advantageEur = Math.abs(comparison.peaAdvantageEur);
  const advantagePct = Math.abs(comparison.peaAdvantagePct);

  return (
    <div className="relative rounded-2xl bg-slate-950 p-6 overflow-hidden">
      {/* Dot grid texture (premium identity) */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(500px circle at 30% 50%, rgba(59, 130, 246, 0.22), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-300 mb-2">
          Comparaison fiscale
        </p>
        {advantageEur < 1 ? (
          <p className="text-2xl font-bold text-white leading-tight">
            Aucune différence (pas de plus-value imposable)
          </p>
        ) : (
          <>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
              Le {peaWins ? "PEA" : "CTO"} vous fait économiser{" "}
              <span className="text-emerald-400 tabular-nums">
                {formatFiscalEur(advantageEur)}
              </span>
            </h3>
            <p className="text-slate-300 text-sm">
              Soit{" "}
              <span className="font-semibold text-white">
                + {advantagePct.toFixed(1)} %
              </span>{" "}
              de net après impôt vs l&apos;autre compte. Pour la même
              stratégie, juste en choisissant le bon support fiscal.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Account card (PEA or CTO) ───────────────────────────────────────────────

function AccountCard({
  kind,
  result,
  durationYears,
}: {
  kind: "pea" | "cto";
  result: ReturnType<typeof computeFiscalComparison>["pea"];
  durationYears: number;
}) {
  const isPea = kind === "pea";
  const peaUnder5 = isPea && durationYears < 5;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {isPea ? "PEA" : "CTO"}
        </p>
        {peaUnder5 && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded">
            ⚠️ avant 5 ans
          </span>
        )}
      </div>

      <p className="text-3xl font-bold text-gray-900 tabular-nums mb-1 animate-fade-in" key={result.netFinalValue}>
        {formatFiscalEur(result.netFinalValue)}
      </p>
      <p className="text-xs text-gray-500 mb-4">
        Net après impôt
      </p>

      <div className="space-y-1.5 text-sm border-t border-slate-100 pt-3">
        <Row label="Plus-values brutes" value={formatFiscalEur(result.capitalGain)} />
        <Row
          label={`Impôt (${(result.taxRate * 100).toFixed(1).replace(".", ",")} %)`}
          value={`− ${formatFiscalEur(result.taxDue)}`}
          valueClass="text-red-600"
        />
        <Row
          label="Plus-value nette"
          value={formatFiscalEur(result.netGain)}
          bold
        />
      </div>

      <p className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-gray-500 leading-relaxed">
        {result.taxRuleLabel}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-gray-900",
  bold = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-gray-500 text-xs">{label}</span>
      <span
        className={`tabular-nums ${valueClass} ${bold ? "font-bold" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Cap warning + optimal mix ──────────────────────────────────────────────

function CapWarning({
  totalInvested,
  mix,
}: {
  totalInvested: number;
  mix: NonNullable<ReturnType<typeof computeFiscalComparison>["optimalMix"]>;
}) {
  const overflow = totalInvested - PEA_DEPOSIT_CAP_EUR;
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5">
      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        ⚠️ Plafond PEA dépassé
      </p>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        Vous avez versé{" "}
        <span className="font-semibold tabular-nums">
          {formatFiscalEur(totalInvested)}
        </span>{" "}
        au total — soit{" "}
        <span className="font-semibold text-amber-600 tabular-nums">
          {formatFiscalEur(overflow)}
        </span>{" "}
        au-delà du plafond du PEA (150 000 €). La combinaison optimale est
        de remplir le PEA puis de placer l&apos;excédent en CTO.
      </p>

      <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4 mb-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">PEA (max 150 000 €)</p>
            <p className="text-lg font-bold text-gray-900 tabular-nums">
              {formatFiscalEur(mix.peaPortion.netFinalValue)}
            </p>
            <p className="text-[11px] text-gray-500">net après impôt</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">CTO (excédent)</p>
            <p className="text-lg font-bold text-gray-900 tabular-nums">
              {formatFiscalEur(mix.ctoPortion.netFinalValue)}
            </p>
            <p className="text-[11px] text-gray-500">net après impôt</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
        <span className="text-sm font-semibold text-emerald-800">
          Total combiné net
        </span>
        <span className="text-lg font-bold text-emerald-700 tabular-nums">
          {formatFiscalEur(mix.totalNetFinalValue)}
        </span>
      </div>
    </div>
  );
}

// ─── Premium nudge — placeholder for future "annual fiscal recap" feature ──

function PremiumNudge() {
  return (
    <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-5 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden
      />
      <div
        className="absolute -top-16 -right-16 w-48 h-48 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(59, 130, 246, 0.35), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center bg-primary-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
              Premium
            </span>
            <p className="text-sm font-semibold text-white">
              Récap fiscal annuel pour votre déclaration
            </p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Suivez chaque année vos plus-values, dividendes et impôt à payer.
            Synthèse PDF avec les montants à reporter dans vos cases 2042
            et 2074.
          </p>
        </div>
        <Link
          href="/tarifs"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-100 transition-colors shrink-0"
        >
          Voir Premium
        </Link>
      </div>
    </div>
  );
}
