"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { ETFConfig } from "@/lib/etf-config";
import {
  blendPortfolio,
  rebalanceToHundred,
  PORTFOLIO_PRESETS,
  type PortfolioItem,
  type BlendedPortfolio,
} from "@/lib/portfolio";
import { runSimulation, formatEur } from "@/lib/simulator";
import { SliderInput } from "@/components/ui/SliderInput";

// ─── Color palette for the donut — matches site primary tones ───────────────

const ALLOCATION_COLORS = [
  "#1d4ed8", // primary-700
  "#0ea5e9", // sky-500
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#f59e0b", // amber-500
];

const DEFAULTS = {
  monthlyAmount: 500,
  durationYears: 20,
};

// ─── Component ───────────────────────────────────────────────────────────────

export function AllocationClient({ etfs }: { etfs: ETFConfig[] }) {
  const [monthlyAmount, setMonthlyAmount] = useState(DEFAULTS.monthlyAmount);
  const [durationYears, setDurationYears] = useState(DEFAULTS.durationYears);

  // Initialize with the 80/20 preset (most balanced default)
  const [items, setItems] = useState<PortfolioItem[]>(() => {
    const preset = PORTFOLIO_PRESETS.find((p) => p.id === "world-em-80-20")!;
    return preset.allocation
      .map(({ displaySymbol, weight }) => {
        const etf = etfs.find((e) => e.displaySymbol === displaySymbol);
        return etf ? { etf, weight } : null;
      })
      .filter((x): x is PortfolioItem => x !== null);
  });

  // Compute blended portfolio
  const blend: BlendedPortfolio = useMemo(
    () => blendPortfolio(items, monthlyAmount),
    [items, monthlyAmount]
  );

  // Run DCA simulation with blended params (gross return + TER)
  const simulation = useMemo(() => {
    if (!blend.isBalanced) return null;
    return runSimulation({
      monthlyAmount,
      durationYears,
      annualReturnPct: blend.blendedReturn,
      annualFeesPct: blend.blendedTer,
    });
  }, [blend, monthlyAmount, durationYears]);

  // Comparison: same DCA but with a single MSCI World (CW8) ETF
  const worldOnlySimulation = useMemo(() => {
    return runSimulation({
      monthlyAmount,
      durationYears,
      annualReturnPct: 7.5,
      annualFeesPct: 0.38,
    });
  }, [monthlyAmount, durationYears]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const setItemWeight = (idx: number, weight: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, weight } : item))
    );
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const addItem = (etf: ETFConfig) => {
    if (items.find((i) => i.etf.displaySymbol === etf.displaySymbol)) return;
    if (items.length >= 5) return;
    // New ETF gets 0 weight initially — user must rebalance
    setItems((prev) => [...prev, { etf, weight: 0 }]);
  };

  const autoBalance = () => {
    setItems((prev) => rebalanceToHundred(prev));
  };

  const applyPreset = (presetId: string) => {
    const preset = PORTFOLIO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const newItems = preset.allocation
      .map(({ displaySymbol, weight }) => {
        const etf = etfs.find((e) => e.displaySymbol === displaySymbol);
        return etf ? { etf, weight } : null;
      })
      .filter((x): x is PortfolioItem => x !== null);
    setItems(newItems);
  };

  const availableEtfs = etfs.filter(
    (e) => !items.find((i) => i.etf.displaySymbol === e.displaySymbol)
  );

  return (
    <div className="space-y-6">
      {/* ── Presets row ──────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Démarrer avec un preset
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PORTFOLIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="text-left rounded-2xl border border-slate-200/70 bg-white p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
            >
              <p className="font-semibold text-sm text-gray-900 mb-1">
                {preset.name}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── 2-column layout: portfolio editor (left) + results (right) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* LEFT: Portfolio editor + simulation params */}
        <div className="space-y-6">
          {/* Simulation params */}
          <div className="card space-y-5">
            <h2 className="font-semibold text-gray-900 text-lg">
              Paramètres de simulation
            </h2>
            <SliderInput
              label="Versement mensuel"
              value={monthlyAmount}
              min={50}
              max={5000}
              step={50}
              unit="€"
              hint="Montant total réparti entre tous vos ETF chaque mois."
              formatDisplay={(v) => new Intl.NumberFormat("fr-FR").format(v)}
              onChange={setMonthlyAmount}
            />
            <SliderInput
              label="Durée"
              value={durationYears}
              min={1}
              max={40}
              step={1}
              unit="ans"
              hint="Horizon de placement DCA."
              onChange={setDurationYears}
            />
          </div>

          {/* Portfolio editor */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold text-gray-900 text-lg">
                Vos ETF ({items.length}/5)
              </h2>
              {!blend.isBalanced && (
                <button
                  type="button"
                  onClick={autoBalance}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                >
                  ⚡ Rééquilibrer à 100 %
                </button>
              )}
            </div>

            {/* Total weight indicator */}
            <div
              className={`rounded-xl border p-3 text-sm flex items-center justify-between ${
                blend.isBalanced
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <span className="font-medium">Total des poids</span>
              <span className="font-bold tabular-nums">
                {blend.totalWeight.toFixed(1)} %{" "}
                {blend.isBalanced ? "✓" : "(doit faire 100 %)"}
              </span>
            </div>

            {/* ETF list with weight sliders */}
            <div className="space-y-3">
              {items.map((item, idx) => (
                <EtfRow
                  key={item.etf.displaySymbol}
                  item={item}
                  color={ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length]}
                  monthlyAllocated={blend.breakdown[idx]?.monthlyAmount ?? 0}
                  expectedReturn={blend.breakdown[idx]?.expectedReturn ?? 0}
                  onWeightChange={(w) => setItemWeight(idx, w)}
                  onRemove={() => removeItem(idx)}
                  canRemove={items.length > 1}
                />
              ))}
            </div>

            {/* Add ETF dropdown */}
            {items.length < 5 && availableEtfs.length > 0 && (
              <AddEtfDropdown etfs={availableEtfs} onSelect={addItem} />
            )}
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="space-y-4">
          {/* Donut */}
          <AllocationDonut
            blend={blend}
            colors={ALLOCATION_COLORS}
            monthlyAmount={monthlyAmount}
          />

          {/* Blended stats */}
          <BlendedStats blend={blend} />

          {/* Simulation result + comparison vs MSCI World */}
          {simulation && blend.isBalanced && (
            <SimulationResult
              simulation={simulation}
              worldOnlySimulation={worldOnlySimulation}
              durationYears={durationYears}
            />
          )}

          {/* Premium nudge */}
          <PremiumNudge />
        </div>
      </div>
    </div>
  );
}

// ─── EtfRow ──────────────────────────────────────────────────────────────────

function EtfRow({
  item,
  color,
  monthlyAllocated,
  expectedReturn,
  onWeightChange,
  onRemove,
  canRemove,
}: {
  item: PortfolioItem;
  color: string;
  monthlyAllocated: number;
  expectedReturn: number;
  onWeightChange: (w: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-4">
      <div className="flex items-start gap-3 mb-3">
        <span
          className="w-3 h-3 rounded-full shrink-0 mt-1"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <p className="font-bold text-sm text-gray-900">
              {item.etf.displaySymbol}
            </p>
            <p className="text-xs text-gray-500">
              TER {item.etf.ter.toString().replace(".", ",")} % · Rendement
              attendu {expectedReturn.toFixed(1).replace(".", ",")} %
            </p>
          </div>
          <p className="text-xs text-gray-600 leading-snug mt-0.5">
            {item.etf.name}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {item.etf.peaEligible ? (
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                PEA
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                CTO uniquement
              </span>
            )}
            <span className="text-[10px] text-gray-500">{item.etf.region}</span>
          </div>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Retirer ${item.etf.displaySymbol}`}
            className="shrink-0 w-7 h-7 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Weight slider */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor={`weight-${item.etf.displaySymbol}`}
            className="text-xs font-medium text-gray-600"
          >
            Poids dans le portefeuille
          </label>
          <span className="text-sm font-bold tabular-nums text-gray-900">
            {item.weight.toFixed(1)} %{" "}
            <span className="text-gray-500 text-xs font-normal">
              ({formatEur(monthlyAllocated)}/mois)
            </span>
          </span>
        </div>
        <input
          id={`weight-${item.etf.displaySymbol}`}
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={item.weight}
          onChange={(e) => onWeightChange(parseFloat(e.target.value))}
          className="w-full slider"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${item.weight}%, #e2e8f0 ${item.weight}%, #e2e8f0 100%)`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Add ETF dropdown ────────────────────────────────────────────────────────

function AddEtfDropdown({
  etfs,
  onSelect,
}: {
  etfs: ETFConfig[];
  onSelect: (etf: ETFConfig) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-3 hover:border-primary-300 hover:bg-primary-50/30 transition-colors flex items-center justify-between"
      >
        <span className="text-sm font-medium text-gray-700">
          + Ajouter un ETF
        </span>
        <span className="text-xs text-gray-500">
          {etfs.length} disponibles
        </span>
      </button>
      {open && (
        <div className="absolute z-10 left-0 right-0 mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-card-lg">
          {etfs.map((etf) => (
            <button
              key={etf.displaySymbol}
              type="button"
              onClick={() => {
                onSelect(etf);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
            >
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <span className="font-bold text-sm text-gray-900">
                  {etf.displaySymbol}
                </span>
                <span className="text-xs text-gray-500">
                  TER {etf.ter.toString().replace(".", ",")} %
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-snug">{etf.name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AllocationDonut ─────────────────────────────────────────────────────────

function AllocationDonut({
  blend,
  colors,
  monthlyAmount,
}: {
  blend: BlendedPortfolio;
  colors: string[];
  monthlyAmount: number;
}) {
  const data = blend.breakdown.map((row, idx) => ({
    name: row.etf.displaySymbol,
    value: row.weight,
    fill: colors[idx % colors.length],
    monthlyAmount: row.monthlyAmount,
  }));

  return (
    <div className="card flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">
          Allocation du portefeuille
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Répartition des {formatEur(monthlyAmount)}/mois
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="85%"
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={3}
              stroke="#ffffff"
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={400}
              animationEasing="ease-out"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-xl font-bold text-gray-900 tabular-nums leading-tight">
            {blend.breakdown.length}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            ETF
          </span>
        </div>
      </div>
    </div>
  );
}

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { fill: string; monthlyAmount: number };
  }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-card-lg px-3 py-2 text-xs">
      <p
        style={{ color: entry.payload.fill }}
        className="font-bold mb-0.5"
      >
        {entry.name}
      </p>
      <p className="text-gray-700">
        {entry.value.toFixed(1)} % ·{" "}
        <span className="tabular-nums">
          {formatEur(entry.payload.monthlyAmount)}/mois
        </span>
      </p>
    </div>
  );
}

// ─── BlendedStats ────────────────────────────────────────────────────────────

function BlendedStats({ blend }: { blend: BlendedPortfolio }) {
  return (
    <div className="card space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm">
        Caractéristiques pondérées
      </h3>
      <div className="space-y-2.5">
        <StatRow
          label="Rendement attendu (brut)"
          value={`${blend.blendedReturn.toFixed(2).replace(".", ",")} %/an`}
        />
        <StatRow
          label="TER pondéré"
          value={`${blend.blendedTer.toFixed(3).replace(".", ",")} %/an`}
        />
        <StatRow
          label="Rendement net après frais"
          value={`${blend.blendedNetReturn.toFixed(2).replace(".", ",")} %/an`}
          bold
        />
      </div>
      {blend.hasNonPeaEtf && (
        <div className="pt-3 border-t border-slate-100 text-xs text-amber-700 leading-relaxed">
          ⚠️ Ce portefeuille contient au moins un ETF non éligible PEA — il
          devra être logé en CTO ou en assurance-vie.
        </div>
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span
        className={`tabular-nums ${bold ? "font-bold text-primary-700 text-base" : "font-semibold text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── SimulationResult ────────────────────────────────────────────────────────

function SimulationResult({
  simulation,
  worldOnlySimulation,
  durationYears,
}: {
  simulation: ReturnType<typeof runSimulation>;
  worldOnlySimulation: ReturnType<typeof runSimulation>;
  durationYears: number;
}) {
  const { base } = simulation;
  const worldFinalValue = worldOnlySimulation.base.finalValue;
  const advantage = base.finalValue - worldFinalValue;
  const advantagePct = (advantage / worldFinalValue) * 100;
  const portfolioBeats = advantage > 0;

  return (
    <div className="relative rounded-2xl bg-slate-950 p-5 overflow-hidden">
      {/* Premium identity textures */}
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
            "radial-gradient(400px circle at 30% 50%, rgba(59, 130, 246, 0.22), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-300 mb-2">
          Projection sur {durationYears} ans
        </p>
        <p
          key={base.finalValue}
          className="text-3xl font-bold text-white tabular-nums animate-fade-in mb-1"
        >
          {formatEur(base.finalValue)}
        </p>
        <p className="text-sm text-slate-300 mb-4">
          Capital investi : {formatEur(base.totalInvested)} · Gains :{" "}
          <span className="text-emerald-400">
            +{formatEur(base.totalGain)}
          </span>
        </p>

        {/* Comparison vs MSCI World only */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-3">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
            vs MSCI World seul
          </p>
          {Math.abs(advantage) < 100 ? (
            <p className="text-sm text-slate-300">
              ≈ équivalent à un MSCI World seul
            </p>
          ) : (
            <p className="text-sm">
              <span
                className={
                  portfolioBeats ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"
                }
              >
                {portfolioBeats ? "+" : ""}
                {formatEur(advantage)}
              </span>{" "}
              <span className="text-slate-300">
                ({portfolioBeats ? "+" : ""}
                {advantagePct.toFixed(1).replace(".", ",")} %)
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PremiumNudge ────────────────────────────────────────────────────────────

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
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center bg-primary-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
            Premium
          </span>
          <p className="text-sm font-semibold text-white">
            Sauvegarder ce portefeuille
          </p>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Suivez la dérive de votre allocation mois après mois et recevez
          des alertes de rééquilibrage quand un ETF dépasse de plus de 5 %
          son poids cible.
        </p>
        <Link
          href="/tarifs"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-100 transition-colors"
        >
          Voir Premium
        </Link>
      </div>
    </div>
  );
}
