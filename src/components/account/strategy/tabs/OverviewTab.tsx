"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUp,
  ArrowDown,
  Plus,
  Target,
  Sparkles,
} from "lucide-react";
import { runSimulation, formatEur } from "@/lib/simulator";
import {
  computeInterestSnapshot,
  computeYearOverYear,
  theoreticalValueAtMonth,
  nextStreakMilestone,
} from "@/lib/strategy-math";
import { useStrategy } from "../StrategyContext";
import { MetricCard } from "../components/MetricCard";
import { formatMonthLabel, monthsBetween } from "../components/utils";

function milestoneLabel(n: number): string {
  switch (n) {
    case 3: return "Premier trimestre";
    case 6: return "Semestre complet";
    case 12: return "1 an complet";
    case 24: return "2 ans de régularité";
    default: return `${n} mois`;
  }
}

export function OverviewTab() {
  const { strategy, entries, insights, monthsElapsed, openLogModal } = useStrategy();

  if (!entries.length || !insights) {
    return <EmptyOverview />;
  }

  const latest = entries[entries.length - 1];
  const theoretical = theoreticalValueAtMonth(
    strategy.input,
    Math.max(monthsElapsed, 1),
  );
  const insight = insights;

  return (
    <div className="space-y-5">
      {/* ── KPI grid ─────────────────────────────────────────────────────── */}
      <section>
        <SectionLabel>Vue d&apos;ensemble</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <MetricCard
            label="Investi"
            value={formatEur(insight.totalInvested)}
            subvalue={`${insight.totalContributionCount} contribution${insight.totalContributionCount > 1 ? "s" : ""}`}
          />
          <MetricCard
            label="Portefeuille"
            value={formatEur(insight.currentPortfolioValue)}
            subvalue={`au ${formatMonthLabel(latest.month)}`}
          />
          <MetricCard
            label="Gain total"
            value={
              insight.totalGain >= 0
                ? `+${formatEur(insight.totalGain)}`
                : `−${formatEur(Math.abs(insight.totalGain))}`
            }
            tone={insight.totalGain >= 0 ? "positive" : "negative"}
            subvalue={`${insight.gainSharePct.toFixed(1)} % de la valeur`}
          />
          <MetricCard
            label="Performance"
            value={`${insight.performancePct >= 0 ? "+" : ""}${insight.performancePct.toFixed(1)} %`}
            tone={insight.performancePct >= 0 ? "positive" : "negative"}
            subvalue={`${insight.monthsAhead} mois en avance · ${insight.monthsBehind} en retard`}
          />
        </div>
      </section>

      {/* ── Streak + current vs theoretical ──────────────────────────────── */}
      <section>
        <SectionLabel>Progression actuelle</SectionLabel>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
          {/* Streak pill */}
          {insight.currentStreak > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-bold px-3 py-1.5 rounded-full">
                <Flame size={14} />
                {insight.currentStreak} mois consécutif{insight.currentStreak > 1 ? "s" : ""}
              </span>
              {nextStreakMilestone(insight.currentStreak) && (
                <span className="text-xs text-gray-500 leading-snug">
                  Plus que{" "}
                  <strong className="text-gray-900">
                    {nextStreakMilestone(insight.currentStreak)! - insight.currentStreak} mois
                  </strong>{" "}
                  pour débloquer{" "}
                  <em className="text-gray-700 not-italic">
                    &ldquo;{milestoneLabel(nextStreakMilestone(insight.currentStreak)!)}&rdquo;
                  </em>
                </span>
              )}
            </div>
          )}

          {/* Theoretical vs actual */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">
                Théorique (mois {Math.max(monthsElapsed, 1)})
              </p>
              <p className="text-xl font-bold text-gray-500 tabular-nums">
                {formatEur(theoretical)}
              </p>
            </div>
            <div className="rounded-xl bg-primary-50/60 border border-primary-100 px-4 py-3">
              <p className="text-[11px] text-primary-600 uppercase tracking-wide mb-0.5">
                Votre portefeuille
              </p>
              <p className="text-xl font-bold text-primary-900 tabular-nums">
                {formatEur(insight.currentPortfolioValue)}
              </p>
            </div>
          </div>

          {/* Delta chip */}
          {latest && (() => {
            const delta = latest.portfolioValue - theoretical;
            const ahead = delta >= 0;
            const Icon = ahead ? ArrowUp : ArrowDown;
            return (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                  ahead
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-orange-50 text-orange-700 border border-orange-200"
                }`}
              >
                <Icon size={14} />
                {ahead
                  ? `En avance de +${formatEur(delta)}`
                  : `En retard de ${formatEur(Math.abs(delta))}`}
              </div>
            );
          })()}

          {/* Log CTA */}
          <button
            onClick={() => openLogModal()}
            className="btn-primary w-full sm:w-auto text-sm px-4 py-2.5 inline-flex items-center justify-center gap-1.5 btn-lift"
          >
            <Plus size={14} />
            Enregistrer un mois
          </button>
        </div>
      </section>

      {/* ── Contextual coach insight ────────────────────────────────────── */}
      <ActionInsight />

      {/* ── Long-term projection ────────────────────────────────────────── */}
      <LongTermProjection />

      {/* ── This month recap ────────────────────────────────────────────── */}
      <MonthRecapBlock />

      {/* ── Year-over-year ──────────────────────────────────────────────── */}
      <YearOverYearBlock />

      {/* ── Progression chart ───────────────────────────────────────────── */}
      {entries.length >= 2 && <ProgressionChart />}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
      {children}
    </p>
  );
}

// ─── Sub-blocks ───────────────────────────────────────────────────────────────

function ActionInsight() {
  const { strategy, entries, monthsElapsed, openLogModal } = useStrategy();
  if (!entries.length) return null;

  const latest = entries[entries.length - 1];
  const theoretical = theoreticalValueAtMonth(
    strategy.input,
    Math.max(monthsElapsed, 1),
  );
  const delta = latest.portfolioValue - theoretical;
  const ahead = delta >= 0;

  return (
    <section>
      <SectionLabel>Conseil du mois</SectionLabel>
      <div
        className={`rounded-2xl border px-5 py-5 ${
          ahead
            ? "bg-emerald-50/50 border-emerald-100"
            : "bg-amber-50/50 border-amber-100"
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              ahead
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {ahead ? <Sparkles size={18} /> : <Target size={18} />}
          </div>
          <div className="flex-1">
            <p
              className={`text-base font-bold leading-snug ${
                ahead ? "text-emerald-900" : "text-amber-900"
              }`}
            >
              {ahead
                ? `Vous êtes en avance de +${formatEur(delta)}`
                : `Vous êtes en retard de ${formatEur(Math.abs(delta))}`}
            </p>
            <p
              className={`text-sm leading-relaxed mt-1 ${
                ahead ? "text-emerald-800" : "text-amber-800"
              }`}
            >
              {ahead
                ? "Continuez à ce rythme — vous êtes au-dessus de votre projection théorique."
                : "Un simple rattrapage ce mois peut vous remettre sur la bonne trajectoire."}
            </p>
          </div>
        </div>

        <button
          onClick={() => openLogModal()}
          className={`text-sm font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 btn-lift transition-colors ${
            ahead
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-amber-600 hover:bg-amber-700 text-white"
          }`}
        >
          {ahead ? "Continuer ce mois" : "Rattraper ce mois"}
          <ArrowUp size={14} className="-rotate-45" />
        </button>
      </div>
    </section>
  );
}

function LongTermProjection() {
  const { strategy } = useStrategy();
  const sim = runSimulation(strategy.input);
  const finalValue = sim.base.finalValue;
  const totalInvested = sim.base.totalInvested;
  const totalGain = sim.base.totalGain;

  // End year of the strategy
  const [sy] = strategy.startMonth.split("-").map(Number);
  const endYear = sy + strategy.input.durationYears;

  return (
    <section>
      <SectionLabel>Projection actuelle</SectionLabel>
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <p className="text-sm text-gray-500 mb-1">
          Si vous continuez ainsi, à la fin de votre plan :
        </p>
        <p className="text-3xl font-bold text-gray-900 tabular-nums leading-tight mb-1">
          {formatEur(finalValue)}{" "}
          <span className="text-base font-semibold text-gray-400">en {endYear}</span>
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Dont{" "}
          <strong className="text-emerald-700 tabular-nums">
            {formatEur(totalGain)}
          </strong>{" "}
          générés par les intérêts composés · sur{" "}
          <span className="tabular-nums">{formatEur(totalInvested)}</span> investis
          au total.
        </p>
      </div>
    </section>
  );
}

function MonthRecapBlock() {
  const { entries } = useStrategy();
  const snap = computeInterestSnapshot(entries);
  if (!snap) return null;

  const positive = snap.interest >= 0;

  return (
    <section>
      <SectionLabel>Ce mois</SectionLabel>
      <div
        className={`rounded-2xl border px-5 py-4 flex items-start gap-3 ${
          positive
            ? "bg-emerald-50/50 border-emerald-100"
            : "bg-orange-50/60 border-orange-100"
        }`}
      >
        {positive ? (
          <TrendingUp size={20} className="text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <TrendingDown size={20} className="text-orange-500 shrink-0 mt-0.5" />
        )}
        <div>
          <p
            className={`text-sm font-semibold mb-1 ${
              positive ? "text-emerald-900" : "text-orange-900"
            }`}
          >
            {positive
              ? "Ce mois, votre argent a travaillé pour vous."
              : "Mois baissier — le DCA continue."}
          </p>
          <p
            className={`text-sm leading-relaxed ${
              positive ? "text-emerald-800" : "text-orange-800"
            }`}
          >
            {positive ? (
              <>
                <strong className="tabular-nums">+{formatEur(snap.interest)}</strong>{" "}
                générés sans effort, en plus de vos {formatEur(snap.invested)}{" "}
                versés.
              </>
            ) : (
              <>
                Le marché a retiré{" "}
                <strong className="tabular-nums">
                  {formatEur(Math.abs(snap.interest))}
                </strong>{" "}
                ce mois. Vos {formatEur(snap.invested)} versés continuent
                d&apos;acheter à prix réduit.
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

function YearOverYearBlock() {
  const { entries } = useStrategy();
  const yoy = computeYearOverYear(entries);
  if (!yoy) return null;

  const positive = yoy.delta >= 0;
  const Icon = positive ? ArrowUp : ArrowDown;

  return (
    <section>
      <SectionLabel>Année sur année</SectionLabel>
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 px-5 py-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-blue-600" />
          <p className="text-sm font-semibold text-gray-900">
            Comparaison sur 12 mois
          </p>
          <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">
            débloqué
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 capitalize">
              {formatMonthLabel(yoy.previousYearMonth)}
            </p>
            <p className="text-lg font-bold text-gray-500 tabular-nums">
              {formatEur(yoy.previousValue)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 capitalize">
              {formatMonthLabel(yoy.currentMonth)}
            </p>
            <p className="text-lg font-bold text-gray-900 tabular-nums">
              {formatEur(yoy.currentValue)}
            </p>
          </div>
        </div>

        <p
          className={`text-sm font-semibold flex items-center gap-1.5 ${
            positive ? "text-emerald-700" : "text-orange-600"
          }`}
        >
          <Icon size={14} />
          {positive ? "+" : ""}
          {yoy.growthPct.toFixed(1)} % sur 1 an
          <span className="text-gray-500 font-normal">
            ({positive ? "+" : ""}
            {formatEur(yoy.delta)})
          </span>
        </p>
      </div>
    </section>
  );
}

function ProgressionChart() {
  const { strategy, entries } = useStrategy();

  const sorted = [...entries].sort((a, b) => a.month.localeCompare(b.month));
  const data = sorted.map((entry) => {
    const i = monthsBetween(strategy.startMonth, entry.month);
    return {
      label: formatMonthLabel(entry.month, true),
      actual: entry.portfolioValue,
      theoretical: theoreticalValueAtMonth(strategy.input, i),
    };
  });

  return (
    <section>
      <SectionLabel>Progression dans le temps</SectionLabel>
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)} k` : `${v}`)}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                formatEur(value),
                name === "actual" ? "Portefeuille" : "Théorique",
              ]}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="transparent"
              fill="url(#actualGrad)"
            />
            <Line
              type="monotone"
              dataKey="theoretical"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name="theoretical"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb", r: 3 }}
              activeDot={{ r: 5 }}
              name="actual"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-5 mt-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-6 border-t-2 border-blue-600 inline-block" />
            <span className="text-gray-600">Votre portefeuille</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 border-t-2 border-gray-400 border-dashed inline-block" />
            <span className="text-gray-600">Projection théorique</span>
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Empty state (0 entries) ──────────────────────────────────────────────────

function EmptyOverview() {
  const { strategy, openLogModal } = useStrategy();

  return (
    <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-slate-50 to-primary-50/40 p-8 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white border border-primary-100 flex items-center justify-center">
        <Plus size={24} className="text-primary-600" strokeWidth={2.5} />
      </div>
      <p className="text-lg font-bold text-gray-900 mb-1.5">
        Commencez votre suivi mensuel
      </p>
      <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto mb-5">
        Enregistrez votre premier mois pour voir votre avance ou retard sur la
        projection, les intérêts composés générés, et votre progression dans le
        temps.
      </p>
      <p className="text-xs text-gray-400 mb-5">
        Versement estimé : {formatEur(strategy.input.monthlyAmount)}/mois
      </p>
      <button
        onClick={() => openLogModal()}
        className="btn-primary text-sm px-6 py-2.5 inline-flex items-center justify-center btn-lift"
      >
        Enregistrer mon premier mois
      </button>
    </div>
  );
}
