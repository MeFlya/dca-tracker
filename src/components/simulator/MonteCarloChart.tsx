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

function MCAreaChart({ data, height = 300 }: { data: MonteCarloDataPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
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

/**
 * Réponse de /api/simulator/monte-carlo.
 *
 * Le plan est décidé par le serveur. Un visiteur non payant reçoit la variante
 * `premium: false`, qui ne contient QU'UNE valeur — ni le jeu de données du
 * graphique, ni la médiane, ni le 90e percentile, ni la probabilité.
 * Ce n'est pas de l'affichage conditionnel : ces champs n'existent pas dans la
 * réponse réseau.
 */
export type MonteCarloResponse =
  | { premium: true; result: MonteCarloResult }
  | { premium: false; teaser: { finalP10: number; totalInvested: number } };

export function MonteCarloChart({
  data,
  isPremium,
  input,
}: {
  data: MonteCarloResponse | null;
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

      {!data ? (
        <div className="mt-5 h-[220px] rounded-xl bg-gray-50 animate-pulse" aria-hidden />
      ) : data.premium ? (
        <PremiumView result={data.result} />
      ) : (
        <TeaserView teaser={data.teaser} input={input} />
      )}
    </div>
  );
}

/** Vue payante : le graphique complet et les quatre indicateurs. */
function PremiumView({ result }: { result: MonteCarloResult }) {
  return (
    <>
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

      <MCAreaChart data={result.data} height={300} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        <KpiCard label="Pire cas (10e percentile)" value={formatEur(result.finalP10)} color="text-orange-500" />
        <KpiCard label="Médiane (50e)" value={formatEur(result.finalP50)} color="text-blue-600" />
        <KpiCard label="Meilleur cas (90e)" value={formatEur(result.finalP90)} color="text-emerald-600" />
        <KpiCard
          label="Probabilité de plus-value"
          value={`${result.probabilityPositive} %`}
          color={result.probabilityPositive >= 80 ? "text-emerald-600" : "text-orange-500"}
        />
      </div>
      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        Simulation stochastique (GBM) — ne constitue pas un conseil en investissement.
        Les rendements passés ne préjugent pas des rendements futurs.
      </p>
    </>
  );
}

/**
 * Vue non payante.
 *
 * Remplace le graphique flouté d'avant. Un flou dit « il y a quelque chose » ;
 * un chiffre vrai, calculé pour la stratégie affichée à l'écran, dit ce que
 * l'outil apporte — et c'est bien plus vendeur. On en montre UN seul, le pire
 * cas réaliste, parce que c'est celui qui répond à la question que les gens se
 * posent vraiment avant d'engager de l'argent sur vingt ans.
 */
function TeaserView({
  teaser,
  input,
}: {
  teaser: { finalP10: number; totalInvested: number };
  input?: SimulatorInput;
}) {
  const couvre = teaser.finalP10 >= teaser.totalInvested;

  return (
    <div className="mt-5">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Votre pire cas réaliste sur 1 000 marchés simulés
        </p>
        <p className="font-display text-5xl sm:text-6xl font-bold text-gray-900 tabular-nums leading-none tracking-tight">
          {formatEur(teaser.finalP10)}
        </p>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
          {couvre ? (
            <>
              Même dans les 10&nbsp;% de marchés les plus défavorables, votre
              stratégie couvre les {formatEur(teaser.totalInvested)} que vous
              aurez versés.
            </>
          ) : (
            <>
              Dans les 10&nbsp;% de marchés les plus défavorables, vous seriez
              sous les {formatEur(teaser.totalInvested)} versés. C&apos;est
              précisément le chiffre à connaître avant de s&apos;engager.
            </>
          )}
        </p>

        <div className="mt-5 pt-5 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Premium ajoute la médiane, le meilleur cas, la probabilité
            d&apos;être en plus-value et la courbe année par année.
          </p>
          <a
            href={buildUpgradeUrl("monte-carlo", input)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Voir les trois autres chiffres →
          </a>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        Simulation stochastique (GBM) — ne constitue pas un conseil en investissement.
      </p>
    </div>
  );
}
