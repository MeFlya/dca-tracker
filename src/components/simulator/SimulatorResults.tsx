import { SimulatorOutput, formatEur, formatPct } from "@/lib/simulator";
import { StatCard } from "@/components/ui/StatCard";
import { PortfolioChart } from "./PortfolioChart";
import { GainsDonutChart } from "./GainsDonutChart";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { cn } from "@/lib/utils";

interface SimulatorResultsProps {
  output: SimulatorOutput;
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
        "rounded-2xl border p-5 flex flex-col gap-3",
        isMain
          ? "border-primary-200 bg-primary-50 shadow-card"
          : "border-gray-100 bg-white shadow-card"
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
        <span className="text-xs text-gray-400">
          {scenario.annualReturnPct} % / an brut
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Valeur finale</p>
          <p className="text-xl font-bold text-gray-900 tabular-nums">
            {formatEur(scenario.finalValue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Gain total</p>
          <p
            className={cn(
              "text-xl font-bold tabular-nums",
              scenario.totalGain >= 0 ? "text-gain" : "text-loss"
            )}
          >
            {formatEur(scenario.totalGain)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Investi</p>
          <p className="text-sm font-semibold text-gray-700 tabular-nums">
            {formatEur(scenario.totalInvested)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Rendement</p>
          <p
            className={cn(
              "text-sm font-semibold tabular-nums",
              scenario.gainPercent >= 0 ? "text-gain" : "text-loss"
            )}
          >
            {formatPct(scenario.gainPercent)}
          </p>
        </div>
      </div>

      {scenario.inflationAdjustedValue !== undefined && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Valeur réelle (€ d&apos;aujourd&apos;hui)
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

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Montant investi"
          value={formatEur(base.totalInvested)}
          sub={`${input.monthlyAmount} €/mois × ${input.durationYears} ans`}
        />
        <StatCard
          label="Valeur projetée (base)"
          value={formatEur(base.finalValue)}
          accent="primary"
          sub={`Rendement net : ${(input.annualReturnPct - input.annualFeesPct).toFixed(2)} %/an`}
        />
        <StatCard
          label="Gain projeté"
          value={formatEur(base.totalGain)}
          accent="gain"
          sub={`+${base.gainPercent.toFixed(1)} % sur le capital investi`}
        />
        {base.inflationAdjustedValue !== undefined ? (
          <StatCard
            label="Valeur réelle estimée"
            value={formatEur(base.inflationAdjustedValue)}
            sub={`Après inflation ${input.annualInflationPct} %/an`}
          />
        ) : (
          <StatCard
            label="Durée"
            value={`${input.durationYears} ans`}
            sub={`${input.durationYears * 12} versements mensuels`}
          />
        )}
      </div>

      {/* Charts row: donut (composition) + area chart (journey over time) */}
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
        <h3 className="font-semibold text-gray-900 mb-3">
          Scénarios comparés
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScenarioCard scenario={conservative} />
          <ScenarioCard scenario={base} isMain />
          <ScenarioCard scenario={optimistic} />
        </div>
      </div>

      {/* Assumptions */}
      <div className="card bg-gray-50 border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Hypothèses de calcul
        </h4>
        <ul className="text-xs text-gray-500 space-y-1 leading-relaxed">
          <li>
            • Versement de <strong>{formatEur(input.monthlyAmount)}</strong> en
            début de mois, capitalisé mensuellement
          </li>
          <li>
            • Rendement net ={" "}
            <strong>
              {input.annualReturnPct} % − {input.annualFeesPct} % (frais) ={" "}
              {(input.annualReturnPct - input.annualFeesPct).toFixed(2)} %/an
            </strong>
          </li>
          <li>
            • Scénario conservateur / optimiste :{" "}
            <strong>±2 points de pourcentage</strong> par rapport au scénario de
            base
          </li>
          <li>
            • Rendement constant sur toute la durée (simplification — les
            marchés sont volatils)
          </li>
          {input.annualInflationPct && (
            <li>
              • Valeur réelle calculée en déflatant par{" "}
              <strong>{input.annualInflationPct} % / an</strong> sur{" "}
              {input.durationYears} ans
            </li>
          )}
        </ul>
      </div>

      <Disclaimer />
    </div>
  );
}
