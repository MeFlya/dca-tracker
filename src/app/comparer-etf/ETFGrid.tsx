"use client";

import { useState, useMemo } from "react";
import { ETFConfig, ETFRegion } from "@/lib/etf-config";
import { AssetQuote } from "@/lib/market-data/types";
import { ETFCard } from "@/components/etf/ETFCard";

interface ETFGridProps {
  etfs: ETFConfig[];
  quotes: Record<string, { quote: AssetQuote | null; error: string | null }>;
}

const REGIONS: { value: ETFRegion | "tous"; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "monde", label: "Monde" },
  { value: "usa", label: "USA" },
  { value: "europe", label: "Europe" },
  { value: "emergents", label: "Émergents" },
  { value: "japon", label: "Japon" },
  { value: "small-cap", label: "Small Cap" },
  { value: "obligations", label: "Obligations" },
];

// Beginner-friendly sort: MSCI World FR (CW8) → MSCI World IE (EWLD) →
// S&P 500 eligible PEA (ESE/SP5) → rest by TER ascending.
// Rationale: this is the ~80% case for a French DCA beginner — diversified,
// PEA-eligible, low TER. Ordering them first reduces analysis paralysis.
const BEGINNER_PRIORITY = ["CW8", "EWLD", "ESE", "SP5"] as const;

type SortMode = "recommande" | "ter" | "alpha";

const SORT_MODES: { value: SortMode; label: string }[] = [
  { value: "recommande", label: "Recommandé débutant" },
  { value: "ter", label: "TER croissant" },
  { value: "alpha", label: "Alphabétique" },
];

function sortEtfs(etfs: ETFConfig[], mode: SortMode): ETFConfig[] {
  const arr = [...etfs];
  switch (mode) {
    case "recommande": {
      const priorityIdx = (e: ETFConfig) => {
        const idx = BEGINNER_PRIORITY.indexOf(
          e.displaySymbol as (typeof BEGINNER_PRIORITY)[number]
        );
        return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
      };
      return arr.sort((a, b) => {
        const pa = priorityIdx(a);
        const pb = priorityIdx(b);
        if (pa !== pb) return pa - pb;
        // Secondary sort: TER ascending within same priority bucket
        return a.ter - b.ter;
      });
    }
    case "ter":
      return arr.sort((a, b) => a.ter - b.ter);
    case "alpha":
      return arr.sort((a, b) => a.displaySymbol.localeCompare(b.displaySymbol));
  }
}

export function ETFGrid({ etfs, quotes }: ETFGridProps) {
  const [region, setRegion] = useState<ETFRegion | "tous">("tous");
  const [peaOnly, setPeaOnly] = useState(false);
  const [maxTer, setMaxTer] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("recommande");

  const filtered = useMemo(() => {
    const matched = etfs.filter((e) => {
      if (region !== "tous" && e.region !== region) return false;
      if (peaOnly && !e.peaEligible) return false;
      if (maxTer !== null && e.ter > maxTer) return false;
      return true;
    });
    return sortEtfs(matched, sortMode);
  }, [etfs, region, peaOnly, maxTer, sortMode]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Region chips */}
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRegion(r.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                region === r.value
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

        {/* PEA toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setPeaOnly((v) => !v)}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              peaOnly ? "bg-primary-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                peaOnly ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-sm text-gray-600 font-medium">PEA uniquement</span>
        </label>

        {/* TER filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">TER ≤</span>
          {([null, 0.2, 0.3, 0.5] as (number | null)[]).map((v) => (
            <button
              key={String(v)}
              onClick={() => setMaxTer(v)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                maxTer === v
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {v === null ? "Tous" : `${v}%`}
            </button>
          ))}
        </div>

        {/* Count */}
        <span className="ml-auto text-sm text-gray-400 hidden sm:block">
          {filtered.length} ETF{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Sort bar — positioned below filters, subtle */}
      <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
        <span className="text-gray-500">Trier&nbsp;:</span>
        {SORT_MODES.map((s) => (
          <button
            key={s.value}
            onClick={() => setSortMode(s.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              sortMode === s.value
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium mb-1">Aucun ETF ne correspond aux filtres</p>
          <button
            onClick={() => { setRegion("tous"); setPeaOnly(false); setMaxTer(null); }}
            className="text-sm text-primary-600 hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((etf) => {
            const result = quotes[etf.symbol];
            return (
              <ETFCard
                key={etf.symbol}
                etf={etf}
                quote={result?.quote}
                error={result?.error}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
