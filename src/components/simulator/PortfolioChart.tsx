"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ScenarioResult, formatEur } from "@/lib/simulator";

interface PortfolioChartProps {
  base: ScenarioResult;
  conservative: ScenarioResult;
  optimistic: ScenarioResult;
}

interface ChartDataPoint {
  year: number;
  invested: number;
  conservateur: number;
  base: number;
  optimiste: number;
}

function buildChartData(
  base: ScenarioResult,
  conservative: ScenarioResult,
  optimistic: ScenarioResult
): ChartDataPoint[] {
  return base.monthlyData.map((pt, i) => ({
    year: pt.year,
    invested: pt.invested,
    conservateur: conservative.monthlyData[i]?.portfolioValue ?? 0,
    base: pt.portfolioValue,
    optimiste: optimistic.monthlyData[i]?.portfolioValue ?? 0,
  }));
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-card-lg p-4 min-w-[200px]">
      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        Année {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-6 text-sm mb-1">
          <span style={{ color: entry.color }} className="font-medium">
            {entry.name}
          </span>
          <span className="text-gray-900 font-semibold tabular-nums">
            {formatEur(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PortfolioChart({
  base,
  conservative,
  optimistic,
}: PortfolioChartProps) {
  const data = buildChartData(base, conservative, optimistic);

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-1">
        Évolution du portefeuille
      </h3>
      <p className="text-xs text-gray-400 mb-6">
        Projection hypothétique — pas une garantie de rendement
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradOpt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCons" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            formatter={(value) =>
              value.charAt(0).toUpperCase() + value.slice(1)
            }
          />
          <Area
            type="monotone"
            dataKey="invested"
            name="Investi"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="none"
          />
          <Area
            type="monotone"
            dataKey="conservateur"
            name="Conservateur"
            stroke="#6b7280"
            strokeWidth={1.5}
            fill="url(#gradCons)"
          />
          <Area
            type="monotone"
            dataKey="base"
            name="Base"
            stroke="#1d4ed8"
            strokeWidth={2}
            fill="url(#gradBase)"
          />
          <Area
            type="monotone"
            dataKey="optimiste"
            name="Optimiste"
            stroke="#059669"
            strokeWidth={1.5}
            fill="url(#gradOpt)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
