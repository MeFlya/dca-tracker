"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonteCarloResult, MonteCarloDataPoint } from "@/lib/monte-carlo";
import { formatEur } from "@/lib/simulator";
import type { SimulatorInput } from "@/lib/simulator";
import { buildUpgradeUrl } from "@/lib/upgrade-link";
import { PremiumLockedOverlay } from "@/components/ui/PremiumLockedOverlay";

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function MCTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const p90 = payload.find((p) => p.name === "p90");
  const p50 = payload.find((p) => p.name === "p50");
  const p10 = payload.find((p) => p.name === "p10");
  const invested = payload.find((p) => p.name === "invested");

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-4 min-w-[220px]">
      <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
        Année {label}
      </p>
      {p90 && (
        <div className="flex justify-between gap-6 text-sm mb-1">
          <span className="text-emerald-600 font-medium">Meilleur cas (90e)</span>
          <span className="font-semibold tabular-nums">{formatEur(p90.value)}</span>
        </div>
      )}
      {p50 && (
        <div className="flex justify-between gap-6 text-sm mb-1">
          <span className="text-blue-600 font-medium">Médiane (50e)</span>
          <span className="font-semibold tabular-nums">{formatEur(p50.value)}</span>
        </div>
      )}
      {p10 && (
        <div className="flex justify-between gap-6 text-sm mb-1">
          <span className="text-orange-500 font-medium">Pire cas (10e)</span>
          <span className="font-semibold tabular-nums">{formatEur(p10.value)}</span>
        </div>
      )}
      {invested && (
        <div className="flex justify-between gap-6 text-sm mt-2 pt-2 border-t border-gray-100">
          <span className="text-gray-500 font-medium">Capital investi</span>
          <span className="font-semibold tabular-nums text-gray-500">{formatEur(invested.value)}</span>
        </div>
      )}
    </div>
  );
}

// ─── KPI row ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

// ─── Lock overlay for free users ──────────────────────────────────────────────
// Uses the shared dark Premium overlay (PremiumLockedOverlay) so the DA stays
// in sync with ScenarioComparison and any future paywall.

function LockedOverlay({ input }: { input?: SimulatorInput }) {
  return (
    <PremiumLockedOverlay
      title="Ce graphique montre les 1 000 marchés possibles."
      description={
        <>
          Dans le{" "}
          <span className="font-semibold text-orange-400">pire scénario</span>,
          combien vous reste-t-il ? Dans le{" "}
          <span className="font-semibold text-emerald-400">meilleur</span> ?
          Quelle est la probabilité que vous soyez en plus-value ?
        </>
      }
      fineprint="Le résultat moyen ne suffit pas pour piloter une vraie stratégie."
      ctaLabel="Débloquer l'analyse de risque →"
      ctaHref={buildUpgradeUrl("monte-carlo", input)}
    />
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────

function MCAreaChart({ data }: { data: MonteCarloDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="mcGradP90" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="mcGradP50" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="mcGradP10" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickFormatter={(v) => `${v} an${v > 1 ? "s" : ""}`}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickFormatter={(v) =>
            v >= 1000 ? `${Math.round(v / 1000)} k€` : `${v} €`
          }
        />
        <Tooltip content={<MCTooltip />} />
        <Area
          type="monotone"
          dataKey="invested"
          name="invested"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="none"
        />
        <Area
          type="monotone"
          dataKey="p90"
          name="p90"
          stroke="#10b981"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="url(#mcGradP90)"
        />
        <Area
          type="monotone"
          dataKey="p50"
          name="p50"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#mcGradP50)"
        />
        <Area
          type="monotone"
          dataKey="p10"
          name="p10"
          stroke="#f97316"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="url(#mcGradP10)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function MonteCarloChart({
  result,
  isPremium,
  input,
}: {
  result: MonteCarloResult;
  isPremium: boolean;
  input?: SimulatorInput;
}) {
  return (
    <div id="monte-carlo" className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">Analyse Monte Carlo</h3>
            <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Premium
            </span>
          </div>
          <p className="text-xs text-gray-500">
            1&nbsp;000 marchés possibles simulés · volatilité historique ETF ≈ 15&nbsp;%/an
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 mb-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-8 border-t-2 border-emerald-500 border-dashed inline-block" />
          Meilleur cas (90e percentile)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-8 border-t-2 border-blue-600 inline-block" />
          Médiane (50e)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-8 border-t-2 border-orange-400 border-dashed inline-block" />
          Pire cas (10e percentile)
        </span>
      </div>

      {/* Chart — blurred for free users */}
      <div className="relative">
        <div className={isPremium ? "" : "blur-sm pointer-events-none select-none"}>
          <MCAreaChart data={result.data} />
        </div>
        {!isPremium && <LockedOverlay input={input} />}
      </div>

      {/* KPI row — only for Premium */}
      {isPremium && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <KpiCard
              label="Pire cas (10e percentile)"
              value={formatEur(result.finalP10)}
              color="text-orange-500"
            />
            <KpiCard
              label="Médiane (50e)"
              value={formatEur(result.finalP50)}
              color="text-blue-600"
            />
            <KpiCard
              label="Meilleur cas (90e)"
              value={formatEur(result.finalP90)}
              color="text-emerald-600"
            />
            <KpiCard
              label="Probabilité de plus-value"
              value={`${result.probabilityPositive} %`}
              color={result.probabilityPositive >= 80 ? "text-emerald-600" : "text-orange-500"}
            />
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            Simulation stochastique (GBM) — ne constitue pas un conseil en investissement. Les rendements passés ne préjugent pas des rendements futurs.
          </p>
        </>
      )}
    </div>
  );
}
