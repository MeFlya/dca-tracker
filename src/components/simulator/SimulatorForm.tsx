"use client";

import { useState, useEffect, useCallback } from "react";
import { SimulatorInput } from "@/lib/simulator";
import { SliderInput } from "@/components/ui/SliderInput";

interface SimulatorFormProps {
  /** Called on every value change — no submit click required */
  onChange: (input: SimulatorInput, inflationEnabled: boolean) => void;
  defaultValues?: Partial<SimulatorInput>;
  /** Explicitly control whether the inflation row starts toggled on.
   *  When omitted, derived from defaultValues.annualInflationPct !== undefined. */
  defaultInflationEnabled?: boolean;
}

const DEFAULTS: SimulatorInput = {
  monthlyAmount: 200,
  durationYears: 20,
  annualReturnPct: 7,
  annualFeesPct: 0.3,
  annualInflationPct: undefined,
};

export function SimulatorForm({
  onChange,
  defaultValues,
  defaultInflationEnabled,
}: SimulatorFormProps) {
  const [values, setValues] = useState<SimulatorInput>({
    ...DEFAULTS,
    ...defaultValues,
  });
  const [showInflation, setShowInflation] = useState(
    defaultInflationEnabled ?? (defaultValues?.annualInflationPct !== undefined)
  );

  // Fire onChange whenever values or inflation toggle change
  useEffect(() => {
    onChange(
      {
        ...values,
        annualInflationPct: showInflation
          ? (values.annualInflationPct ?? 2)
          : undefined,
      },
      showInflation
    );
  }, [values, showInflation, onChange]);

  const set = useCallback(
    (key: keyof SimulatorInput) => (v: number) => {
      setValues((prev) => ({ ...prev, [key]: v }));
    },
    []
  );

  const handleReset = () => {
    setValues(DEFAULTS);
    setShowInflation(false);
  };

  const toggleInflation = (checked: boolean) => {
    setShowInflation(checked);
    if (checked && values.annualInflationPct === undefined) {
      setValues((prev) => ({ ...prev, annualInflationPct: 2 }));
    }
  };

  return (
    <div className="card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-lg">Paramètres</h2>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
          title="Réinitialiser les valeurs par défaut"
        >
          Réinitialiser
        </button>
      </div>

      {/* Net return preview badge */}
      <NetReturnBadge
        gross={values.annualReturnPct}
        fees={values.annualFeesPct}
      />

      {/* Fields */}
      <div className="space-y-7">
        <SliderInput
          label="Versement mensuel"
          value={values.monthlyAmount}
          min={25}
          max={5000}
          step={25}
          unit="€"
          hint="Montant que vous investissez chaque mois, régulièrement."
          formatDisplay={(v) =>
            new Intl.NumberFormat("fr-FR").format(v)
          }
          onChange={set("monthlyAmount")}
        />

        <SliderInput
          label="Durée de l'investissement"
          value={values.durationYears}
          min={1}
          max={40}
          step={1}
          unit="ans"
          hint="Votre horizon de placement. Plus c'est long, plus les intérêts composés ont d'effet."
          onChange={set("durationYears")}
        />

        <SliderInput
          label="Rendement annuel brut"
          value={values.annualReturnPct}
          min={1}
          max={15}
          step={0.1}
          unit="%"
          hint="Rendement attendu avant frais. Le MSCI World a affiché ~7–8 %/an sur 30 ans (dividendes inclus)."
          onChange={set("annualReturnPct")}
        />

        <SliderInput
          label="Frais annuels (TER)"
          value={values.annualFeesPct}
          min={0}
          max={2}
          step={0.01}
          unit="%"
          hint="Frais de gestion de votre ETF. CW8 : 0,38 %. VWCE : 0,22 %. SPY : 0,09 %."
          onChange={set("annualFeesPct")}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Inflation toggle + slider */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer group w-fit">
          {/* Custom toggle */}
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
              showInflation ? "bg-primary-600" : "bg-gray-200"
            }`}
            onClick={() => toggleInflation(!showInflation)}
            role="switch"
            aria-checked={showInflation}
            aria-label="Activer le calcul en pouvoir d'achat réel (déduire l'inflation)"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") toggleInflation(!showInflation);
            }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
                showInflation ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
            Intégrer l&apos;inflation
          </span>
        </label>

        {showInflation && (
          <div className="pl-1 animate-fade-in">
            <SliderInput
              label="Inflation annuelle estimée"
              value={values.annualInflationPct ?? 2}
              min={0}
              max={10}
              step={0.1}
              unit="%"
              hint="Affiche la valeur réelle en euros d'aujourd'hui. BCE cible 2 %/an."
              onChange={set("annualInflationPct")}
            />
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
        Mise à jour en temps réel
      </div>
    </div>
  );
}

/** Small inline badge showing net return = gross - fees */
function NetReturnBadge({ gross, fees }: { gross: number; fees: number }) {
  const net = Math.max(gross - fees, 0);
  const netStr = net.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary-50 border border-primary-100">
      <span className="text-xs text-primary-700 font-medium">
        Rendement net après frais
      </span>
      <span className="text-sm font-bold text-primary-800 tabular-nums">
        {netStr} %<span className="font-normal text-primary-700">/an</span>
      </span>
    </div>
  );
}
