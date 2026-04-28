"use client";

/**
 * Compact portfolio picker for the simulator's "Mes ETF" mode.
 * Reuses the math from /allocation-portefeuille but with a slimmer UI
 * (no donut, no preset cards, just a focused ETF list with weight sliders).
 *
 * Emits onChange whenever the allocation changes — both the items themselves
 * and the inferred (blendedReturn, blendedTer) so the simulator can drive
 * its DCA engine.
 */

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { ETFConfig } from "@/lib/etf-config";
import {
  blendPortfolio,
  rebalanceToHundred,
  PORTFOLIO_PRESETS,
  type PortfolioItem,
  type BlendedPortfolio,
} from "@/lib/portfolio";

const COLORS = [
  "#1d4ed8",
  "#0ea5e9",
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
];

export interface PortfolioPickerValue {
  items: PortfolioItem[];
  blend: BlendedPortfolio;
}

interface Props {
  etfs: ETFConfig[];
  initialItems: PortfolioItem[];
  monthlyAmount: number;
  onChange: (value: PortfolioPickerValue) => void;
}

export function PortfolioPicker({
  etfs,
  initialItems,
  monthlyAmount,
  onChange,
}: Props) {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);

  // Recompute + bubble up on every change. Parent controls only the
  // blended return + ter that feed the DCA engine.
  const updateItems = (next: PortfolioItem[]) => {
    setItems(next);
    onChange({ items: next, blend: blendPortfolio(next, monthlyAmount) });
  };

  const blend = blendPortfolio(items, monthlyAmount);

  const setItemWeight = (idx: number, weight: number) =>
    updateItems(items.map((it, i) => (i === idx ? { ...it, weight } : it)));

  const removeItem = (idx: number) =>
    updateItems(items.filter((_, i) => i !== idx));

  const addItem = (etf: ETFConfig) => {
    if (items.find((i) => i.etf.displaySymbol === etf.displaySymbol)) return;
    if (items.length >= 5) return;
    updateItems([...items, { etf, weight: 0 }]);
  };

  const autoBalance = () => updateItems(rebalanceToHundred(items));

  const applyPreset = (presetId: string) => {
    const preset = PORTFOLIO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const newItems = preset.allocation
      .map(({ displaySymbol, weight }) => {
        const etf = etfs.find((e) => e.displaySymbol === displaySymbol);
        return etf ? { etf, weight } : null;
      })
      .filter((x): x is PortfolioItem => x !== null);
    updateItems(newItems);
  };

  const availableEtfs = etfs.filter(
    (e) => !items.find((i) => i.etf.displaySymbol === e.displaySymbol)
  );

  return (
    <div className="space-y-4">
      {/* Quick presets — compact pills */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Allocations rapides</p>
        <div className="flex flex-wrap gap-1.5">
          {PORTFOLIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200/70 bg-white hover:border-primary-300 hover:bg-primary-50/40 transition-colors"
              title={preset.description}
            >
              {preset.name.replace(/\s\([^)]*\)/, "")}
            </button>
          ))}
        </div>
      </div>

      {/* Total weight indicator */}
      <div
        className={`rounded-xl border px-3 py-2 text-xs flex items-center justify-between ${
          blend.isBalanced
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        <span className="font-medium">
          {blend.isBalanced
            ? "Allocation équilibrée"
            : `Total ${blend.totalWeight.toFixed(1)} % (cible 100 %)`}
        </span>
        {!blend.isBalanced && (
          <button
            type="button"
            onClick={autoBalance}
            className="font-bold underline hover:no-underline"
          >
            Auto-balance
          </button>
        )}
      </div>

      {/* ETF rows */}
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <CompactRow
            key={item.etf.displaySymbol}
            item={item}
            color={COLORS[idx % COLORS.length]}
            monthlyAllocated={blend.breakdown[idx]?.monthlyAmount ?? 0}
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

      {/* Inferred metrics — read-only badges */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Rendement attendu (brut)</span>
          <span className="font-semibold tabular-nums text-gray-900">
            {blend.blendedReturn.toFixed(2).replace(".", ",")} %/an
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">TER pondéré</span>
          <span className="font-semibold tabular-nums text-gray-900">
            {blend.blendedTer.toFixed(3).replace(".", ",")} %/an
          </span>
        </div>
        <div className="flex justify-between pt-1.5 border-t border-slate-200/70">
          <span className="text-gray-700 font-medium">Net après frais</span>
          <span className="font-bold tabular-nums text-primary-700">
            {blend.blendedNetReturn.toFixed(2).replace(".", ",")} %/an
          </span>
        </div>
        {blend.hasNonPeaEtf && (
          <p className="text-[11px] text-amber-700 leading-relaxed pt-1.5 border-t border-slate-200/70 flex items-start gap-1.5">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            <span>Ce mix contient un ETF non éligible PEA — à loger en CTO.</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Compact row ─────────────────────────────────────────────────────────────

function CompactRow({
  item,
  color,
  monthlyAllocated,
  onWeightChange,
  onRemove,
  canRemove,
}: {
  item: PortfolioItem;
  color: string;
  monthlyAllocated: number;
  onWeightChange: (w: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-3">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 truncate leading-tight">
            {item.etf.indexLabel}
          </p>
          <p className="text-[11px] text-gray-500 leading-tight">
            {item.etf.displaySymbol} · TER {item.etf.ter.toString().replace(".", ",")} %
          </p>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Retirer ${item.etf.displaySymbol}`}
            className="shrink-0 w-6 h-6 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-gray-500">Poids</span>
          <span className="font-semibold tabular-nums text-gray-900">
            {item.weight.toFixed(1)} %
            <span className="text-gray-500 font-normal ml-1.5">
              ({Math.round(monthlyAllocated)} €/mois)
            </span>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={item.weight}
          onChange={(e) => onWeightChange(parseFloat(e.target.value))}
          aria-label={`Poids de ${item.etf.displaySymbol}`}
          className="w-full slider"
          style={
            {
              "--slider-fill-pct": `${item.weight}%`,
              "--slider-color": color,
            } as React.CSSProperties
          }
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
        className="w-full text-left rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-3 py-2 hover:border-primary-300 hover:bg-primary-50/30 transition-colors flex items-center justify-between text-sm"
      >
        <span className="font-medium text-gray-700">+ Ajouter un ETF</span>
        <span className="text-xs text-gray-500">{etfs.length} dispo.</span>
      </button>
      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-card-lg">
          {etfs.map((etf) => (
            <button
              key={etf.displaySymbol}
              type="button"
              onClick={() => {
                onSelect(etf);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
            >
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <span className="font-bold text-xs text-gray-900">
                  {etf.indexLabel}
                </span>
                <span className="text-[10px] text-gray-500">
                  TER {etf.ter.toString().replace(".", ",")} %
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug truncate">
                {etf.displaySymbol} · {etf.peaEligible ? "PEA" : "CTO"}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
