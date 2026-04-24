"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ScenarioResult, formatEur } from "@/lib/simulator";

interface GainsDonutChartProps {
  base: ScenarioResult;
}

const COLORS = {
  invested: "#94a3b8", // slate-400 — neutral, "money you moved"
  gains: "#059669",    // gain green — matches StatCard gain accent
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-card-lg px-4 py-3 text-sm">
      <span style={{ color: entry.payload.fill }} className="font-semibold">
        {entry.name}
      </span>
      <span className="ml-3 text-gray-900 font-bold tabular-nums">
        {formatEur(entry.value)}
      </span>
    </div>
  );
}

export function GainsDonutChart({ base }: GainsDonutChartProps) {
  const { totalInvested, totalGain, finalValue } = base;

  // Guard: if gains are negative, show invested only with a muted gain segment
  const gainValue = Math.max(totalGain, 0);
  const investedPct = finalValue > 0 ? (totalInvested / finalValue) * 100 : 100;
  const gainPct = 100 - investedPct;

  const data = [
    { name: "Montant investi", value: totalInvested, fill: COLORS.invested },
    { name: "Gains projetés",  value: gainValue,     fill: COLORS.gains },
  ];

  return (
    <div className="card flex flex-col gap-5">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">
          Répartition de votre projection
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Part du capital versé vs croissance estimée
        </p>
      </div>

      {/* Donut + center label */}
      <div className="relative mx-auto w-full max-w-[200px]">
        <ResponsiveContainer width="100%" height={200}>
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
              animationDuration={600}
              animationEasing="ease-out"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center overlay — absolute positioned over the donut hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-lg font-bold text-gray-900 tabular-nums leading-tight">
            {formatEur(finalValue)}
          </span>
          <span className="text-[10px] text-gray-500 font-medium mt-0.5">
            Valeur finale
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5">
        <LegendRow
          color={COLORS.invested}
          label="Montant investi"
          amount={formatEur(totalInvested)}
          pct={investedPct}
        />
        <LegendRow
          color={COLORS.gains}
          label="Gains projetés"
          amount={totalGain >= 0 ? formatEur(gainValue) : "—"}
          pct={gainPct}
          highlight
        />
      </div>

      {/* Multiplier callout — only shown when meaningful */}
      {totalGain > 0 && finalValue / totalInvested >= 1.1 && (
        <div className="pt-3 border-t border-gray-50 flex items-baseline justify-between">
          <span className="text-xs text-gray-500">Multiplicateur</span>
          <span className="text-sm font-bold text-gain-dark tabular-nums">
            ×{(finalValue / totalInvested).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

function LegendRow({
  color,
  label,
  amount,
  pct,
  highlight,
}: {
  color: string;
  label: string;
  amount: string;
  pct: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Color swatch */}
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Label + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-medium text-gray-600 truncate">
            {label}
          </span>
          <span
            className={`text-xs font-bold tabular-nums ml-2 shrink-0 ${
              highlight ? "text-gain-dark" : "text-gray-700"
            }`}
          >
            {amount}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct.toFixed(1)}%`, backgroundColor: color }}
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5 tabular-nums text-right">
          {pct.toFixed(1)} %
        </p>
      </div>
    </div>
  );
}
