"use client";

import dynamic from "next/dynamic";
import { SimulatorOutput, formatEur, formatPct } from "@/lib/simulator";
import { StatCard } from "@/components/ui/StatCard";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { cn } from "@/lib/utils";

// Charts recharts en import dynamique (ssr: false) — recharts pèse lourd
// (~100 kB+ dans le bundle) et les charts ne servent qu'après hydratation.
// Le code-splitting sort recharts du JS initial de /simulateur (AUDIT P1).
// Les placeholders ont une hauteur FIXE calquée sur le rendu final
// (card + header + chart 340/200) → pas de CLS au swap.
const PortfolioChart = dynamic(
  () => import("./PortfolioChart").then((m) => m.PortfolioChart),
  {
    ssr: false,
    loading: () => (
      <div className="card h-[452px]" aria-busy="true" aria-label="Chargement du graphique">
        <div className="h-4 w-48 rounded bg-gray-100 mb-2" />
        <div className="h-3 w-64 rounded bg-gray-50 mb-6" />
        <div className="h-[340px] rounded-xl bg-gray-50" />
      </div>
    ),
  },
);

const GainsDonutChart = dynamic(
  () => import("./GainsDonutChart").then((m) => m.GainsDonutChart),
  {
    ssr: false,
    loading: () => (
      <div className="card h-[380px]" aria-busy="true" aria-label="Chargement du graphique">
        <div className="h-4 w-40 rounded bg-gray-100 mb-2" />
        <div className="h-3 w-52 rounded bg-gray-50 mb-6" />
        <div className="mx-auto h-[200px] w-[200px] rounded-full bg-gray-50" />
      </div>
    ),
  },
);

interface SimulatorResultsProps {
  output: SimulatorOutput;
}

// Nombres à la française (30/09/2026) : ces cartes sont désormais dans le
// HTML initial de /simulateur, celui que lisent les robots, qui y trouvaient
// « 6.62 %/an » et « 0.38 % ». Les taux saisis (7,5 %, 2,5 %…) passent aussi
// par ici, avec au plus 2 décimales comme le formulaire.
function nombreFr(n: number, decimales?: number): string {
  return n.toLocaleString(
    "fr-FR",
    decimales === undefined
      ? { maximumFractionDigits: 2 }
      : { minimumFractionDigits: decimales, maximumFractionDigits: decimales }
  );
}

function ScenarioCard({
  scenario,
  isMain,
}: {
  scenario: SimulatorOutput["base"];
  isMain?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 flex flex-col gap-3 card-hover",
        isMain
          ? "border-primary-200 bg-primary-50 shadow-card"
          : "border-slate-200/70 bg-white shadow-card"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            isMain ? "text-primary-600" : "text-gray-500"
          )}
        >
          {scenario.label}
        </span>
        <span className="text-xs text-gray-500">
          {nombreFr(scenario.annualReturnPct)}&nbsp;%/an brut
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Capital final</p>
          <p className="text-xl font-bold text-gray-900 tabular-nums">
            {formatEur(scenario.finalValue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Gains</p>
          <p
            className={cn(
              "text-xl font-bold tabular-nums",
              scenario.totalGain >= 0 ? "text-gain-dark" : "text-loss-dark"
            )}
          >
            {formatEur(scenario.totalGain)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Capital investi</p>
          <p className="text-sm font-semibold text-gray-700 tabular-nums">
            {formatEur(scenario.totalInvested)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Performance</p>
          <p
            className={cn(
              "text-sm font-semibold tabular-nums",
              scenario.gainPercent >= 0 ? "text-gain-dark" : "text-loss-dark"
            )}
          >
            {formatPct(scenario.gainPercent)}
          </p>
        </div>
      </div>

      {scenario.inflationAdjustedValue !== undefined && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Pouvoir d&apos;achat équivalent (€ d&apos;aujourd&apos;hui)
          </p>
          <p className="text-sm font-medium text-gray-700 tabular-nums">
            {formatEur(scenario.inflationAdjustedValue)}
          </p>
        </div>
      )}
    </div>
  );
}

export function SimulatorResults({ output }: SimulatorResultsProps) {
  const { base, conservative, optimistic, input } = output;
  const netReturn = input.annualReturnPct - input.annualFeesPct;

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Capital investi"
          value={formatEur(base.totalInvested)}
          sub={`${input.monthlyAmount} €/mois × ${input.durationYears} ans`}
        />
        <StatCard
          label="Valeur estimée"
          value={formatEur(base.finalValue)}
          accent="primary"
          sub={`Rendement net\u00a0: ${nombreFr(netReturn, 2)}\u00a0%/an`}
        />
        <StatCard
          label="Gains potentiels"
          value={formatEur(base.totalGain)}
          accent="gain"
          sub={`${formatPct(base.gainPercent)} sur capital investi`}
        />
        {base.inflationAdjustedValue !== undefined ? (
          <StatCard
            label="Valeur réelle estimée"
            value={formatEur(base.inflationAdjustedValue)}
            sub={`Après inflation ${nombreFr(input.annualInflationPct ?? 0)}\u00a0%/an`}
          />
        ) : (
          <StatCard
            label="Durée"
            value={`${input.durationYears} ans`}
            sub={`${input.durationYears * 12} versements mensuels`}
          />
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[288px_1fr] gap-6 items-start">
        <GainsDonutChart base={base} />
        <PortfolioChart
          base={base}
          conservative={conservative}
          optimistic={optimistic}
        />
      </div>

      {/* 3 scenarios */}
      <div>
        <div className="flex items-baseline gap-2 mb-3">
          <h3 className="font-semibold text-gray-900">3 scénarios comparés</h3>
          <span className="text-xs text-gray-500">± 2 % autour de votre hypothèse</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScenarioCard scenario={conservative} />
          <ScenarioCard scenario={base} isMain />
          <ScenarioCard scenario={optimistic} />
        </div>
      </div>

      {/* Assumptions — collapsed, less prominent */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-600 transition-colors list-none w-fit">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 group-open:rotate-90 transition-transform shrink-0" aria-hidden>
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Hypothèses de calcul
        </summary>
        <div className="mt-3 card bg-gray-50 border-gray-100">
          <ul className="text-xs text-gray-500 space-y-1 leading-relaxed">
            <li>
              • Versement de <strong>{formatEur(input.monthlyAmount)}</strong> en début de mois, capitalisé mensuellement
            </li>
            <li>
              • Rendement net = <strong>{nombreFr(input.annualReturnPct)}&nbsp;% − {nombreFr(input.annualFeesPct)}&nbsp;% (frais TER) = {nombreFr(netReturn, 2)}&nbsp;%/an</strong>
            </li>
            <li>
              • Scénario conservateur / optimiste : <strong>±2 points de pourcentage</strong> par rapport au scénario de base
            </li>
            <li>
              • Rendement constant sur toute la durée (simplification — les marchés sont volatils)
            </li>
            <li>
              {/* 30/09/2026 : cette ligne citait « ~7–8 %/an sur 30 ans » pour le
                  MSCI World, sans source ni date. Invisible des robots tant que la
                  page se chargeait en JavaScript, elle est dans le HTML initial
                  depuis la suppression de loading.tsx : le repère sourcé est celui
                  de l'en-tête (REGION_RETURN_SOURCES), pas un chiffre de mémoire. */}
              • Basé sur la mécanique des intérêts composés&nbsp;: un rendement constant appliqué chaque mois, pas les cours réels (le backtest, lui, rejoue les cours historiques)
            </li>
            {input.annualInflationPct && (
              <li>
                • Valeur réelle calculée en déflatant par <strong>{nombreFr(input.annualInflationPct)}&nbsp;%/an</strong> sur {input.durationYears} ans
              </li>
            )}
          </ul>
        </div>
      </details>

      <Disclaimer />
    </div>
  );
}
