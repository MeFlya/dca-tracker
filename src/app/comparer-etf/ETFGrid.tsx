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

export function ETFGrid({ etfs, quotes }: ETFGridProps) {
  const [region, setRegion] = useState<ETFRegion | "tous">("tous");
  const [peaOnly, setPeaOnly] = useState(false);
  const [maxTer, setMaxTer] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return etfs.filter((e) => {
      if (region !== "tous" && e.region !== region) return false;
      if (peaOnly && !e.peaEligible) return false;
      if (maxTer !== null && e.ter > maxTer) return false;
      return true;
    });
  }, [etfs, region, peaOnly, maxTer]);

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
