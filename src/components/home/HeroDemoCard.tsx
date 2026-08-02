"use client";

// Mini-simulateur interactif rendu dans le Hero. Remplace la card statique
// précédente (chiffres dur-codés) par un composant cliquable qui recalcule
// instantanément les valeurs et redessine la courbe à chaque toggle.
//
// Pas d'appel à src/lib/simulator.ts — on utilise la formule de
// capitalisation mensuelle directement (4 valeurs à calculer, c'est trivial).
// Évite de charger le simulateur complet (avec scénarios, Monte Carlo, etc.)
// dans le bundle de la home.
//
// Wow factor : les chiffres et la courbe répondent au clic en < 100ms.
// Le visiteur voit immédiatement que le site est un OUTIL, pas une page
// marketing.

import { useState } from "react";
import Link from "next/link";
import { TER_REFERENCE_SIMULATEUR } from "@/lib/etf-config";

const MONTHLY_OPTIONS = [100, 200, 500, 1000] as const;
const YEARS_OPTIONS = [10, 20, 30] as const;

type Monthly = (typeof MONTHLY_OPTIONS)[number];
type Years = (typeof YEARS_OPTIONS)[number];

// Capitalisation mensuelle, taux annuel net, versements en début de période
// (multiplication par (1 + rm) pour l'effet "annuité due"). Cohérent avec
// la convention DEMO précédente (200 €/mois × 20 ans × 7 % → ~102 094 €).
function compute(monthly: number, years: number) {
  const r = 0.07;
  const rm = Math.pow(1 + r, 1 / 12) - 1;
  const months = years * 12;
  const factor = ((Math.pow(1 + rm, months) - 1) / rm) * (1 + rm);
  const projected = monthly * factor;
  const invested = monthly * months;
  const gains = projected - invested;
  return {
    invested,
    projected,
    gains,
    gainPct: (gains / invested) * 100,
    multiplier: projected / invested,
    gainsShare: (gains / projected) * 100,
  };
}

// Round to nearest 100 €, then format en "X XXX €" français.
function fmtEur(n: number): string {
  const rounded = Math.round(n / 100) * 100;
  return rounded.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? "+ " : "";
  return `${sign}${Math.round(n)} %`;
}

function fmtMultiplier(n: number): string {
  return `× ${n.toFixed(2).replace(".", ",")}`;
}

// 3 paths SVG hardcodés selon la durée. Plus la durée est longue, plus la
// courbe est exponentielle (les intérêts composés s'accélèrent en fin de
// période). viewBox="0 0 280 80" — y=80 bas, y=0 haut.
const SVG_PATHS: Record<Years, { line: string; area: string; endX: number; endY: number }> = {
  10: {
    // Quasi-linéaire — gainShare ~30 %
    line: "M 0 72 C 60 68, 130 60, 200 50 S 260 42, 280 38",
    area: "M 0 72 C 60 68, 130 60, 200 50 S 260 42, 280 38 L 280 80 L 0 80 Z",
    endX: 280,
    endY: 38,
  },
  20: {
    // Modérément exponentielle — gainShare ~53 %
    line: "M 0 70 C 40 68, 80 60, 120 48 S 200 22, 280 8",
    area: "M 0 70 C 40 68, 80 60, 120 48 S 200 22, 280 8 L 280 80 L 0 80 Z",
    endX: 280,
    endY: 8,
  },
  30: {
    // Fortement exponentielle — gainShare ~69 %
    line: "M 0 76 C 60 74, 110 70, 160 60 S 230 18, 280 0",
    area: "M 0 76 C 60 74, 110 70, 160 60 S 230 18, 280 0 L 280 80 L 0 80 Z",
    endX: 280,
    endY: 0,
  },
};

export function HeroDemoCard() {
  const [monthly, setMonthly] = useState<Monthly>(200);
  const [years, setYears] = useState<Years>(20);

  const s = compute(monthly, years);
  const path = SVG_PATHS[years];
  // Clé composite — sert à re-monter les valeurs animées à chaque toggle.
  const k = `${monthly}-${years}`;

  return (
    <div className="relative w-full max-w-sm">
      {/* Halo lumineux derrière la card */}
      <div
        className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary-400/30 via-primary-300/10 to-sky-300/20 blur-2xl opacity-80 pointer-events-none"
        aria-hidden
      />
      <div className="relative w-full bg-white rounded-2xl border border-slate-200/70 shadow-card-lg p-5 select-none animate-slide-up">

        {/* Toggles — montant + durée. Compacts pour ne pas écraser le contenu. */}
        <div className="space-y-2 mb-5 pb-5 border-b border-gray-100">
          <ToggleRow
            label="Montant"
            options={MONTHLY_OPTIONS}
            value={monthly}
            onChange={setMonthly}
            renderOption={(v) => `${v} €`}
          />
          <ToggleRow
            label="Durée"
            options={YEARS_OPTIONS}
            value={years}
            onChange={setYears}
            renderOption={(v) => `${v} ans`}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-0.5">
              Projection
            </p>
            <p
              key={`label-${k}`}
              className="text-sm font-semibold text-gray-700 leading-snug animate-fade-in"
            >
              {monthly}&nbsp;€/mois · {years}&nbsp;ans · 7&nbsp;%/an net
            </p>
          </div>
          <span
            key={`pct-${k}`}
            className="shrink-0 mt-0.5 px-2 py-0.5 rounded-lg bg-primary-50 text-primary-600 text-[11px] font-semibold tabular-nums animate-fade-in"
          >
            {fmtPct(s.gainPct)}
          </span>
        </div>

        {/* 3 stat boxes — re-animation sur change via key composite */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <DemoStat key={`inv-${k}`}  label="Investis" value={fmtEur(s.invested)}  color="gray" />
          <DemoStat key={`proj-${k}`} label="Projetés" value={fmtEur(s.projected)} color="blue" />
          <DemoStat key={`gain-${k}`} label="Gains"    value={`+ ${fmtEur(s.gains)}`} color="green" />
        </div>

        {/* Mini chart — courbe redessinée à chaque toggle de durée */}
        <div className="mb-4">
          <div className="flex justify-between text-[11px] text-gray-500 mb-2">
            <span>Croissance sur {years}&nbsp;ans</span>
            <span key={`share-${k}`} className="tabular-nums animate-fade-in">
              {Math.round(s.gainsShare)}&nbsp;% d&apos;intérêts
            </span>
          </div>
          <svg
            key={`chart-${years}`}
            viewBox="0 0 280 80"
            className="w-full h-20"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="heroChartArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="heroChartStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            {/* Aire sous la courbe */}
            <path
              d={path.area}
              fill="url(#heroChartArea)"
              className="animate-fade-in"
              style={{ animationDelay: "400ms", animationDuration: "500ms" }}
            />
            {/* Ligne tracée */}
            <path
              d={path.line}
              fill="none"
              stroke="url(#heroChartStroke)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-draw-line"
            />
            {/* Point d'arrivée + ping */}
            <circle
              cx={path.endX}
              cy={path.endY}
              r="4"
              fill="#1d4ed8"
              className="animate-fade-in"
              style={{ animationDelay: "1000ms", animationDuration: "400ms" }}
            />
            <circle
              cx={path.endX}
              cy={path.endY}
              r="4"
              fill="none"
              stroke="#1d4ed8"
              strokeWidth="2"
              className="animate-fade-in"
              style={{ animationDelay: "1000ms", animationDuration: "400ms" }}
            >
              <animate attributeName="r" from="4" to="10" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.6" to="0" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Multiplier row */}
        <div className="flex items-center justify-between py-3 border-t border-gray-50">
          <span className="text-xs text-gray-500">Multiplicateur du capital</span>
          <span
            key={`mult-${k}`}
            className="text-sm font-bold text-gray-900 tabular-nums animate-fade-in"
          >
            {fmtMultiplier(s.multiplier)}
          </span>
        </div>

        {/* CTA — passe les params actuels au simulateur */}
        <Link
          href={`/simulateur?monthly=${monthly}&years=${years}&return=7&fees=${TER_REFERENCE_SIMULATEUR}`}
          className="group mt-1 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-semibold transition-colors duration-150"
        >
          Tester avec mes chiffres
          <span aria-hidden className="arrow-nudge">→</span>
        </Link>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleRow<T extends number>({
  label,
  options,
  value,
  onChange,
  renderOption,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  renderOption: (v: T) => string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 w-14 shrink-0">
        {label}
      </span>
      <div className="flex-1 flex gap-1 bg-gray-100/70 rounded-lg p-0.5">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`flex-1 text-[11px] font-semibold py-1 rounded-md tabular-nums transition-all duration-150 ${
                active
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              aria-pressed={active}
            >
              {renderOption(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DemoStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "gray" | "blue" | "green";
}) {
  const accent =
    color === "blue" ? "border-t-primary-400" :
    color === "green" ? "border-t-gain/60" :
    "border-t-gray-300";

  const valueColor =
    color === "blue" ? "text-primary-700" :
    color === "green" ? "text-gain-dark" :
    "text-gray-700";

  return (
    <div className={`rounded-xl border-t-2 border border-gray-100 bg-gray-50 p-2.5 animate-fade-in ${accent}`}>
      <p className="text-[10px] text-gray-500 mb-1 leading-none">{label}</p>
      <p className={`text-sm font-bold tabular-nums leading-tight ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}
