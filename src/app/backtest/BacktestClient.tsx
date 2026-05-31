"use client";

// Page client du backtest historique.
//
// UX :
//   - Tous les users (Free + Premium) peuvent configurer librement le backtest
//     (versement, date début, date fin, scénarios rapides). C'est le seul moyen
//     d'engager émotionnellement l'user avec son propre cas.
//   - Au moment d'afficher les RÉSULTATS :
//      - Premium → on lance runBacktest() et on affiche KPIs + graphique.
//      - Free → on affiche un bloc dark Premium ("Débloquer pour voir le résultat"
//        avec aperçu d'1 KPI flou pour teaser).
//
// Note design : on n'a pas grisé les inputs eux-mêmes — c'est plus engageant
// de laisser l'user composer son propre scénario, puis de butter sur le mur
// au moment de découvrir le chiffre.

import { useState, useMemo, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Lock, TrendingDown, TrendingUp, Calendar, Target } from "lucide-react";
import {
  runBacktest,
  formatEurBacktest,
  formatMonthFr,
  type BacktestResult,
} from "@/lib/backtest";
import { track } from "@/lib/analytics";
import { PremiumTrialLink } from "@/components/checkout/PremiumTrialLink";

// ─── Quick scenarios ─────────────────────────────────────────────────────────
// Les périodes sont calculées dynamiquement par rapport au mois courant et
// au max disponible dans le dataset (passé en prop maxMonth).

interface QuickScenarioDef {
  /** Identifiant analytics (sera tracké tel quel). */
  id: string;
  /** Label affiché. */
  label: string;
  /** Description courte sous le label. */
  hint: string;
  /** Calcule la date de début YYYY-MM en fonction du maxMonth dispo. */
  computeStart: (maxMonth: string, minMonth: string) => string;
}

function shiftMonth(month: string, deltaMonths: number): string {
  const [y, m] = month.split("-").map(Number);
  const total = y * 12 + (m - 1) + deltaMonths;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

const QUICK_SCENARIOS: QuickScenarioDef[] = [
  {
    id: "since_inception",
    label: "DCA depuis 2010",
    hint: "15+ ans, le scénario long terme",
    computeStart: (_max, min) => {
      // Au plus tôt = janvier de l'année qui suit minMonth (ex: min=2009-08 → 2010-01)
      const year = Number(min.slice(0, 4)) + 1;
      return `${year}-01`;
    },
  },
  {
    id: "since_covid",
    label: "DCA depuis COVID",
    hint: "Mars 2020, le pire timing perçu",
    computeStart: () => "2020-03",
  },
  {
    id: "since_inflation_2022",
    label: "DCA depuis 2022",
    hint: "Crise inflation + Ukraine",
    computeStart: () => "2022-01",
  },
  {
    id: "rolling_10_years",
    label: "DCA 10 ans glissants",
    hint: "Les 10 dernières années",
    computeStart: (max) => shiftMonth(max, -120),
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  isPremium: boolean;
  minMonth: string; // YYYY-MM (borne basse du dataset, ex: "2009-08")
  maxMonth: string; // YYYY-MM (borne haute, ex: "2026-05")
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BacktestClient({ isPremium, minMonth, maxMonth }: Props) {
  // Default : DCA depuis 2015 (10 ans), 200 €/mois — scénario "moyen" engageant
  const [monthlyAmount, setMonthlyAmount] = useState(200);
  const [startMonth, setStartMonth] = useState(() =>
    shiftMonth(maxMonth, -120),
  );
  const [endMonth, setEndMonth] = useState(maxMonth);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = useCallback(() => {
    setError(null);
    track({
      name: "backtest_started",
      props: {
        monthly_amount: monthlyAmount,
        start_date: startMonth,
        end_date: endMonth,
      },
    });
    try {
      const r = runBacktest({ monthlyAmount, startMonth, endMonth });
      setResult(r);
      track({
        name: "backtest_completed",
        props: {
          monthly_amount: monthlyAmount,
          months_invested: r.monthsInvested,
          gain_pct: Number(r.gainPct.toFixed(2)),
          irr_pct: r.irrAnnualPct === null ? null : Number(r.irrAnnualPct.toFixed(2)),
        },
      });
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Erreur de calcul");
    }
  }, [monthlyAmount, startMonth, endMonth]);

  const handleQuickScenario = useCallback(
    (scenario: QuickScenarioDef) => {
      const newStart = scenario.computeStart(maxMonth, minMonth);
      setStartMonth(newStart);
      setEndMonth(maxMonth);
      track({
        name: "backtest_quick_scenario_used",
        props: { scenario_name: scenario.id },
      });
      // L'user verra le formulaire mis à jour ; il clique encore "Lancer"
      // (pour qu'il voie bien le lien intention → action).
    },
    [maxMonth, minMonth],
  );

  const handleLockedCtaClick = useCallback(() => {
    track({ name: "backtest_premium_locked_cta_clicked" });
  }, []);

  // Conversions YYYY-MM ⇔ <input type="month">
  // Les <input type="month"> attendent exactement YYYY-MM, donc rien à
  // convertir, juste à clamp les bornes.
  const minInput = minMonth;
  const maxInput = maxMonth;

  return (
    <div className="space-y-6">
      {/* ── Quick scenarios ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Scénarios populaires
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_SCENARIOS.map((sc) => {
            const startForScenario = sc.computeStart(maxMonth, minMonth);
            const isActive = startMonth === startForScenario && endMonth === maxMonth;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleQuickScenario(sc)}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  isActive
                    ? "border-primary-300 bg-primary-50/60"
                    : "border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/30"
                }`}
              >
                <p
                  className={`text-sm font-semibold leading-tight ${
                    isActive ? "text-primary-800" : "text-gray-900"
                  }`}
                >
                  {sc.label}
                </p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{sc.hint}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label
              htmlFor="bt-amount"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
            >
              Versement mensuel (€)
            </label>
            <input
              id="bt-amount"
              type="number"
              min={10}
              max={20000}
              step={10}
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-base font-semibold tabular-nums focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
            />
          </div>

          <div>
            <label
              htmlFor="bt-start"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
            >
              Date de début
            </label>
            <input
              id="bt-start"
              type="month"
              min={minInput}
              max={maxInput}
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-base font-semibold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
            />
          </div>

          <div>
            <label
              htmlFor="bt-end"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2"
            >
              Date de fin
            </label>
            <input
              id="bt-end"
              type="month"
              min={minInput}
              max={maxInput}
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-base font-semibold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
            />
          </div>
        </div>

        <div className="mt-6">
          {isPremium ? (
            <button
              type="button"
              onClick={handleRun}
              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center text-base px-6 py-3"
            >
              Lancer le backtest →
            </button>
          ) : (
            <PremiumTrialLink
              label="Débloquer le backtest historique"
              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center text-base px-6 py-3"
              fineprint="7 jours d'essai gratuit · Annulation en 1 clic"
              fineprintClassName="text-xs text-gray-500 mt-3"
              onClick={handleLockedCtaClick}
            />
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
      </section>

      {/* ── Results (Premium) or Paywall (Free) ─────────────────────────── */}
      {isPremium ? (
        result ? (
          <BacktestResults result={result} />
        ) : (
          <PreviewHint />
        )
      ) : (
        <PremiumPreview onCtaClick={handleLockedCtaClick} />
      )}
    </div>
  );
}

// ─── Sub: Results (Premium) ──────────────────────────────────────────────────

function BacktestResults({ result }: { result: BacktestResult }) {
  const chartData = useMemo(
    () =>
      result.series.map((p) => ({
        month: p.month,
        Investi: Math.round(p.invested),
        Portefeuille: Math.round(p.value),
      })),
    [result.series],
  );

  const gainPositive = result.gainAbs >= 0;

  return (
    <section className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Capital investi"
          value={formatEurBacktest(result.totalInvested)}
          sub={`${result.monthsInvested} mois`}
        />
        <KpiCard
          label="Valeur finale"
          value={formatEurBacktest(result.finalValue)}
          sub="à date de fin"
          accent="primary"
        />
        <KpiCard
          label="Gain"
          value={`${gainPositive ? "+" : ""}${formatEurBacktest(result.gainAbs)}`}
          sub={`${gainPositive ? "+" : ""}${result.gainPct.toFixed(1)} %`}
          accent={gainPositive ? "emerald" : "red"}
        />
        <KpiCard
          label="TRI annualisé"
          value={
            result.irrAnnualPct === null
              ? "—"
              : `${result.irrAnnualPct >= 0 ? "+" : ""}${result.irrAnnualPct.toFixed(2)} %`
          }
          sub="par an"
          accent={
            result.irrAnnualPct !== null && result.irrAnnualPct < 0 ? "red" : "emerald"
          }
        />
      </div>

      {/* Drawdown */}
      {result.maxDrawdown && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <div className="flex items-start gap-3">
            <TrendingDown
              size={20}
              className="text-amber-700 shrink-0 mt-0.5"
              aria-hidden
            />
            <div>
              <p className="text-sm font-bold text-amber-900 mb-1">
                Pire creux traversé en route :{" "}
                <span className="tabular-nums">
                  −{result.maxDrawdown.pct.toFixed(1)} %
                </span>
              </p>
              <p className="text-sm text-amber-800 leading-relaxed">
                De {formatMonthFr(result.maxDrawdown.peakMonth)} (pic) à{" "}
                {formatMonthFr(result.maxDrawdown.troughMonth)} (creux). C&apos;est
                la pire perte papier que vous auriez vue à un moment donné, sans
                vendre.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary-600" aria-hidden />
          Évolution mois par mois
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          La courbe pleine = votre portefeuille. La pointillée = ce que vous
          avez investi cumulé. L&apos;écart entre les deux = vos gains
          (intérêts composés).
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="btGradPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              minTickGap={40}
              tickFormatter={(v: string) => v.slice(0, 4)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${Math.round(v / 1000)} k€` : `${v} €`
              }
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const inv = payload.find((p) => p.dataKey === "Investi");
                const port = payload.find((p) => p.dataKey === "Portefeuille");
                return (
                  <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 min-w-[200px]">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                      {typeof label === "string" ? formatMonthFr(label) : label}
                    </p>
                    {port && (
                      <p className="text-sm font-semibold flex justify-between gap-4">
                        <span className="text-primary-700">Portefeuille</span>
                        <span className="tabular-nums">
                          {formatEurBacktest(Number(port.value))}
                        </span>
                      </p>
                    )}
                    {inv && (
                      <p className="text-sm flex justify-between gap-4 mt-1">
                        <span className="text-gray-500">Investi</span>
                        <span className="tabular-nums text-gray-600">
                          {formatEurBacktest(Number(inv.value))}
                        </span>
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              height={28}
              iconType="line"
              wrapperStyle={{ fontSize: 12, color: "#64748b" }}
            />
            <Area
              type="monotone"
              dataKey="Investi"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
            />
            <Area
              type="monotone"
              dataKey="Portefeuille"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#btGradPortfolio)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// ─── Sub: KpiCard ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "neutral" | "primary" | "emerald" | "red";
}) {
  const accentClass =
    accent === "primary"
      ? "text-primary-700"
      : accent === "emerald"
        ? "text-emerald-700"
        : accent === "red"
          ? "text-red-600"
          : "text-gray-900";
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold tabular-nums leading-tight ${accentClass}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Sub: PreviewHint (Premium connecté mais n'a pas encore cliqué) ─────────

function PreviewHint() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <Target size={28} className="text-gray-400 mx-auto mb-3" aria-hidden />
      <p className="text-sm font-semibold text-gray-700 mb-1">
        Configurez votre scénario puis lancez le backtest.
      </p>
      <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
        Astuce : essayez un scénario populaire en haut, ou tapez un versement
        mensuel et une période. Le calcul est instantané.
      </p>
    </div>
  );
}

// ─── Sub: PremiumPreview (Free user — paywall dark) ──────────────────────────

function PremiumPreview({ onCtaClick }: { onCtaClick: () => void }) {
  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-7 overflow-hidden">
      {/* Dot texture */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden
      />
      {/* Soft blue glow */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(59, 130, 246, 0.35), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-primary-500/20 border border-primary-400/30 flex items-center justify-center">
            <Lock size={16} className="text-primary-300" strokeWidth={1.8} />
          </div>
          <span className="inline-flex items-center bg-primary-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
            Premium
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 leading-tight">
          Ce que vous verrez avec Premium
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-5 max-w-xl">
          Le résultat exact de votre DCA sur les vraies données historiques —
          capital investi, valeur finale, gain, TRI annualisé, pire creux
          traversé, et la courbe mois par mois.
        </p>

        <ul className="space-y-2.5 mb-6 text-sm text-slate-200">
          <li className="flex items-start gap-2">
            <Calendar
              size={14}
              className="text-primary-400 mt-1 shrink-0"
              aria-hidden
            />
            <span>
              <strong className="text-white">Période libre</strong> : depuis
              2009, par mois, jusqu&apos;à aujourd&apos;hui.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp
              size={14}
              className="text-primary-400 mt-1 shrink-0"
              aria-hidden
            />
            <span>
              <strong className="text-white">TRI calculé</strong> + drawdown
              maximum traversé sans vendre.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Target
              size={14}
              className="text-primary-400 mt-1 shrink-0"
              aria-hidden
            />
            <span>
              <strong className="text-white">4 scénarios populaires</strong> en
              1 clic : depuis 2010, COVID, 2022, 10 ans glissants.
            </span>
          </li>
        </ul>

        <PremiumTrialLink
          label="Débloquer le backtest historique"
          className="inline-flex items-center justify-center bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          fineprint="7 jours d'essai gratuit · Annulation en 1 clic"
          fineprintClassName="text-xs text-slate-400 mt-3"
          onClick={onCtaClick}
        />
      </div>
    </div>
  );
}
