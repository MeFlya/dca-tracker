"use client";

import { useState } from "react";
import Link from "next/link";
import { runSimulation, formatEur } from "@/lib/simulator";
import type { SimulatorInput } from "@/lib/simulator";
import { buildUpgradeUrl } from "@/lib/upgrade-link";

// ─── Mini slider row ──────────────────────────────────────────────────────────

function Field({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  scenarioName,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  /** Discriminator for the aria-label so screen readers can tell A vs B sliders apart */
  scenarioName: string;
}) {
  // Compose a screen-reader-only label that includes the scenario name + the
  // visible label, e.g. "Scénario A — Versement mensuel". Without this, axe
  // flags 8 type=range inputs as having no accessible name (one per
  // scenario × 4 fields). Visible UI is unchanged — the <span> above
  // remains the visual label for sighted users.
  const ariaLabel = `${scenarioName} — ${label}`;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-900 tabular-nums">
          {value.toLocaleString("fr-FR")} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary-600 h-1.5"
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value.toLocaleString("fr-FR")} ${unit}`}
      />
    </div>
  );
}

// ─── Mini scenario form ────────────────────────────────────────────────────────

type ScenInput = {
  monthlyAmount: number;
  durationYears: number;
  annualReturnPct: number;
  annualFeesPct: number;
};

function ScenForm({
  label,
  color,
  values,
  onChange,
}: {
  label: string;
  color: string;
  values: ScenInput;
  onChange: (v: ScenInput) => void;
}) {
  function set(k: keyof ScenInput) {
    return (v: number) => onChange({ ...values, [k]: v });
  }
  return (
    <div className={`flex-1 rounded-2xl border-2 ${color} p-4 space-y-3`}>
      <p className="font-bold text-sm text-gray-900">{label}</p>
      <Field scenarioName={label} label="Versement mensuel" value={values.monthlyAmount} min={50} max={5000} step={50} unit="€" onChange={set("monthlyAmount")} />
      <Field scenarioName={label} label="Durée (ans)" value={values.durationYears} min={1} max={30} step={1} unit="ans" onChange={set("durationYears")} />
      <Field scenarioName={label} label="Rendement annuel" value={values.annualReturnPct} min={0} max={15} step={0.5} unit="%" onChange={set("annualReturnPct")} />
      <Field scenarioName={label} label="Frais (TER)" value={values.annualFeesPct} min={0} max={2} step={0.05} unit="%" onChange={set("annualFeesPct")} />
    </div>
  );
}

// ─── Lock overlay ─────────────────────────────────────────────────────────────

function LockedOverlay({ input }: { input?: SimulatorInput }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-2xl bg-white/75 backdrop-blur-sm">
      <div className="text-center max-w-xs px-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-slate-700" aria-hidden>
            <rect x="5" y="11" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <p className="font-bold text-gray-900 mb-1">Comparez deux stratégies</p>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          200 €/mois pendant 20 ans vs 300 €/mois pendant 15 ans — lequel
          produit le plus ? Comparez en temps réel côte à côte.
        </p>
        <Link
          href={buildUpgradeUrl("ab-comparison", input)}
          className="inline-block bg-slate-900 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Débloquer avec Premium →
        </Link>
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

const DEFAULT_A: ScenInput = { monthlyAmount: 200, durationYears: 20, annualReturnPct: 7, annualFeesPct: 0.3 };
const DEFAULT_B: ScenInput = { monthlyAmount: 400, durationYears: 20, annualReturnPct: 7, annualFeesPct: 0.3 };

export function ScenarioComparison({ isPremium, input }: { isPremium: boolean; input?: SimulatorInput }) {
  const [a, setA] = useState<ScenInput>(DEFAULT_A);
  const [b, setB] = useState<ScenInput>(DEFAULT_B);

  const simA = runSimulation({ ...a, annualInflationPct: undefined });
  const simB = runSimulation({ ...b, annualInflationPct: undefined });

  const diffEur = simB.base.finalValue - simA.base.finalValue;
  const diffPct = simA.base.finalValue > 0
    ? ((simB.base.finalValue - simA.base.finalValue) / simA.base.finalValue) * 100
    : 0;
  const bIsBetter = diffEur >= 0;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">Comparaison A vs B</h3>
            <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Premium</span>
          </div>
          <p className="text-xs text-gray-500">Comparez deux stratégies d&apos;investissement indépendantes</p>
        </div>
      </div>

      <div className="relative mt-4">
        {/* Content — always rendered, blurred if not Pro */}
        <div className={isPremium ? "" : "blur-sm pointer-events-none select-none"}>
          {/* Scenarios side by side */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <ScenForm label="Scénario A" color="border-blue-200" values={isPremium ? a : DEFAULT_A} onChange={setA} />
            <ScenForm label="Scénario B" color="border-slate-300" values={isPremium ? b : DEFAULT_B} onChange={setB} />
          </div>

          {/* Results */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-center">
              <p className="text-xs text-blue-400 mb-1 font-medium">Capital final A</p>
              <p className="text-lg font-bold text-blue-700 tabular-nums">
                {formatEur(simA.base.finalValue)}
              </p>
              <p className="text-xs text-blue-400 mt-1">{a.durationYears} ans</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-400 mb-1 font-medium">Capital final B</p>
              <p className="text-lg font-bold text-slate-700 tabular-nums">
                {formatEur(simB.base.finalValue)}
              </p>
              <p className="text-xs text-slate-400 mt-1">{b.durationYears} ans</p>
            </div>
            <div className={`rounded-xl border p-4 text-center ${bIsBetter ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"}`}>
              <p className={`text-xs mb-1 font-medium ${bIsBetter ? "text-emerald-400" : "text-orange-400"}`}>
                Différence (B − A)
              </p>
              <p className={`text-lg font-bold tabular-nums ${bIsBetter ? "text-emerald-700" : "text-orange-600"}`}>
                {diffEur >= 0 ? "+" : ""}{formatEur(diffEur)}
              </p>
              <p className={`text-xs mt-1 font-medium ${bIsBetter ? "text-emerald-500" : "text-orange-500"}`}>
                {diffPct >= 0 ? "+" : ""}{diffPct.toFixed(1)} %
              </p>
            </div>
          </div>
        </div>

        {!isPremium && <LockedOverlay input={input} />}
      </div>
    </div>
  );
}
