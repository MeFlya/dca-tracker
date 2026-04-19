"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Coins,
  Sparkles,
  MessageSquare,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatEur } from "@/lib/simulator";
import {
  theoreticalValueAtMonth,
  monthsElapsed,
  currentMonth,
  computeStreak,
  nextStreakMilestone,
  computeInterestSnapshot,
  computeYearOverYear,
} from "@/lib/strategy-math";
import { BADGES, computeEarnedBadges, nextBadge } from "@/lib/badges";
import type { StrategyData, MonthlyEntry, Strategy } from "@/lib/user-strategy";
import type { SimulatorInput } from "@/lib/simulator";

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatMonthLabel(month: string, short = false): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("fr-FR", {
    month: short ? "short" : "long",
    year: "numeric",
  });
}

function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm) + 1;
}

// ─── Log Month Modal ──────────────────────────────────────────────────────────

function LogMonthModal({
  onClose,
  onSaved,
  defaultMonthly,
}: {
  onClose: () => void;
  onSaved: () => void;
  defaultMonthly: number;
}) {
  const [month, setMonth] = useState(currentMonth());
  const [invested, setInvested] = useState(String(defaultMonthly));
  const [portfolioValue, setPortfolioValue] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const inv = parseFloat(invested);
    const pv = parseFloat(portfolioValue);

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      setError("Mois invalide. Format attendu : AAAA-MM.");
      return;
    }
    if (isNaN(inv) || inv < 0) {
      setError("Le montant investi doit être positif.");
      return;
    }
    if (isNaN(pv) || pv <= 0) {
      setError("La valeur du portefeuille doit être supérieure à 0.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/strategy/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          invested: inv,
          portfolioValue: pv,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      onSaved();
      onClose();
    } catch {
      setError("Erreur lors de l'enregistrement.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Enregistrer un mois</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
          Données disponibles dans votre application courtier : montant viré ce
          mois et valeur actuelle du portefeuille.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="log-month">
              Mois
            </label>
            <input
              id="log-month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="log-invested">
              Investi ce mois (€)
            </label>
            <input
              id="log-invested"
              type="number"
              min="0"
              step="1"
              value={invested}
              onChange={(e) => setInvested(e.target.value)}
              placeholder={String(defaultMonthly)}
              required
              autoFocus
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="log-portfolio">
              Valeur du portefeuille (€)
            </label>
            <input
              id="log-portfolio"
              type="number"
              min="0"
              step="1"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(e.target.value)}
              placeholder="1 450"
              required
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="log-note">
              Commentaire du mois <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              id="log-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex : gros versement ce mois, marché volatile…"
              rows={2}
              maxLength={500}
              className="input-field w-full resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Stats KPI strip ──────────────────────────────────────────────────────────

function StrategyStats({ strategy, entries }: { strategy: Strategy; entries: MonthlyEntry[] }) {
  const startDate = formatMonthLabel(strategy.startMonth, true);
  const monthsLogged = entries.length;
  const totalInvested = entries.reduce((sum, e) => sum + e.invested, 0);
  const latestPortfolio = entries.length
    ? entries[entries.length - 1].portfolioValue
    : 0;
  const totalGain = latestPortfolio - totalInvested;
  const perfPct =
    totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const cells = [
    { label: "Début", value: startDate },
    { label: "Mois suivis", value: String(monthsLogged) },
    { label: "Total investi", value: formatEur(totalInvested) },
    {
      label: "Gain total",
      value: totalGain >= 0 ? `+${formatEur(totalGain)}` : `−${formatEur(Math.abs(totalGain))}`,
      positive: totalGain >= 0,
      muted: monthsLogged === 0,
    },
    {
      label: "Performance",
      value: monthsLogged === 0 ? "—" : `${perfPct >= 0 ? "+" : ""}${perfPct.toFixed(1)} %`,
      positive: perfPct >= 0,
      muted: monthsLogged === 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
      {cells.map((c, i) => (
        <div
          key={i}
          className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5"
        >
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 leading-tight">
            {c.label}
          </p>
          <p
            className={`text-sm font-bold tabular-nums leading-tight ${
              c.muted
                ? "text-gray-300"
                : c.positive === true
                ? "text-emerald-700"
                : c.positive === false
                ? "text-orange-600"
                : "text-gray-900"
            }`}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Streak block ─────────────────────────────────────────────────────────────

function milestoneLabel(n: number): string {
  switch (n) {
    case 3: return "Premier trimestre";
    case 6: return "Semestre complet";
    case 12: return "1 an complet";
    case 24: return "2 ans de régularité";
    default: return `${n} mois`;
  }
}

function StreakBlock({ entries }: { entries: MonthlyEntry[] }) {
  if (!entries.length) return null;

  const streak = computeStreak(entries.map((e) => e.month));

  if (streak === 0) {
    return (
      <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 mb-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-orange-900">Série interrompue</p>
          <p className="text-xs text-orange-700 mt-0.5">
            Reprenez en enregistrant ce mois pour relancer votre série.
          </p>
        </div>
      </div>
    );
  }

  const next = nextStreakMilestone(streak);

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-bold px-3 py-1.5 rounded-full">
        <Flame size={14} className="shrink-0" />
        {streak} mois consécutif{streak > 1 ? "s" : ""}
      </span>
      {next && (
        <span className="text-xs text-gray-500 leading-snug">
          Plus que{" "}
          <strong className="text-gray-900">{next - streak} mois</strong>{" "}
          pour débloquer <em className="text-gray-700 not-italic">&ldquo;{milestoneLabel(next)}&rdquo;</em>
        </span>
      )}
    </div>
  );
}

// ─── Interest snapshot ────────────────────────────────────────────────────────

function InterestSnapshot({ entries }: { entries: MonthlyEntry[] }) {
  const snap = computeInterestSnapshot(entries);
  if (!snap) return null;

  if (snap.interest >= 0) {
    return (
      <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 px-4 py-3 mb-4 flex items-start gap-3">
        <TrendingUp size={18} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-900 mb-0.5">
            Ce mois sans effort
          </p>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Les intérêts composés ont ajouté{" "}
            <strong className="text-emerald-900">+{formatEur(snap.interest)}</strong>{" "}
            à votre portefeuille. Vous avez versé {formatEur(snap.invested)},
            votre portefeuille a gagné {formatEur(snap.delta)}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-orange-50/60 border border-orange-100 px-4 py-3 mb-4 flex items-start gap-3">
      <TrendingDown size={18} className="text-orange-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-orange-900 mb-0.5">
          Mois baissier — le DCA fait son travail
        </p>
        <p className="text-xs text-orange-800 leading-relaxed">
          Le marché a retiré{" "}
          <strong className="text-orange-900">{formatEur(Math.abs(snap.interest))}</strong>{" "}
          ce mois. C&apos;est exactement le moment où vos{" "}
          {formatEur(snap.invested)} achètent plus de parts à prix réduit.
        </p>
      </div>
    </div>
  );
}

// ─── Insight chip ─────────────────────────────────────────────────────────────

function InsightChip({ actual, theoretical }: { actual: number; theoretical: number }) {
  const delta = actual - theoretical;
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
      <Icon size={14} className="shrink-0" />
      {ahead
        ? `En avance de +${formatEur(delta)}`
        : `En retard de ${formatEur(Math.abs(delta))}`}
    </div>
  );
}

// ─── Year-over-year block ─────────────────────────────────────────────────────

function YearOverYearBlock({ entries }: { entries: MonthlyEntry[] }) {
  const yoy = computeYearOverYear(entries);
  if (!yoy) return null;

  const positive = yoy.delta >= 0;
  const Icon = positive ? ArrowUp : ArrowDown;

  return (
    <div className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 px-4 py-4 mb-4">
      <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Calendar size={16} className="text-blue-600" />
        Comparaison sur 12 mois
        <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">
          débloqué
        </span>
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
            {formatMonthLabel(yoy.previousYearMonth)}
          </p>
          <p className="text-lg font-bold text-gray-500 tabular-nums">
            {formatEur(yoy.previousValue)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
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
          ({positive ? "+" : ""}{formatEur(yoy.delta)})
        </span>
      </p>
    </div>
  );
}

// ─── Progression chart ────────────────────────────────────────────────────────

function ProgressionChart({
  strategy,
  entries,
}: {
  strategy: Strategy;
  entries: MonthlyEntry[];
}) {
  if (entries.length < 2) return null;

  const sorted = [...entries].sort((a, b) => a.month.localeCompare(b.month));
  const data = sorted.map((entry) => {
    const monthsFromStart = monthsBetween(strategy.startMonth, entry.month);
    const theoretical = theoreticalValueAtMonth(strategy.input, monthsFromStart);
    return {
      label: formatMonthLabel(entry.month, true),
      actual: entry.portfolioValue,
      theoretical,
    };
  });

  return (
    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Progression
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
            tickFormatter={(v) =>
              v >= 1000 ? `${Math.round(v / 1000)} k` : `${v}`
            }
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
            name="actual"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-5 mt-2 text-xs">
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
  );
}

// ─── History ──────────────────────────────────────────────────────────────────

function EntryHistory({
  entries,
  strategy,
}: {
  entries: MonthlyEntry[];
  strategy: Strategy;
}) {
  const recent = [...entries].reverse().slice(0, 6);
  if (!recent.length) return null;

  return (
    <div className="mt-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Historique
      </p>
      <div className="space-y-1.5">
        {recent.map((e) => {
          const months = monthsBetween(strategy.startMonth, e.month);
          const theoretical = theoreticalValueAtMonth(strategy.input, months);
          const delta = e.portfolioValue - theoretical;
          return (
            <div key={e.month} className="py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  {formatMonthLabel(e.month)}
                  {e.note && (
                    <MessageSquare
                      size={12}
                      className="text-gray-300"
                      aria-label="commentaire"
                    />
                  )}
                </span>
                <span className="font-semibold text-gray-900 tabular-nums">
                  {formatEur(e.portfolioValue)}
                </span>
                <span
                  className={`text-xs font-medium tabular-nums ${
                    delta >= 0 ? "text-emerald-600" : "text-orange-500"
                  }`}
                >
                  {delta >= 0 ? "+" : ""}
                  {formatEur(delta)}
                </span>
              </div>
              {e.note && (
                <p className="text-xs text-gray-500 italic mt-1 pl-0.5">
                  « {e.note} »
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Badge section ────────────────────────────────────────────────────────────

function BadgeSection({ entries }: { entries: MonthlyEntry[] }) {
  const earned = computeEarnedBadges(entries);
  const next = nextBadge(entries);
  const count = earned.size;

  return (
    <div className="mt-5 pt-5 border-t border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={12} />
          Badges
        </p>
        <span className="text-xs text-gray-400 tabular-nums">
          {count}/{BADGES.length} débloqués
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {BADGES.map((badge) => {
          const isEarned = earned.has(badge.id);
          return (
            <div
              key={badge.id}
              title={`${badge.label} — ${badge.desc}`}
              className={`aspect-square flex flex-col items-center justify-center gap-0.5 rounded-xl border text-center px-1 py-2 ${
                isEarned
                  ? "bg-amber-50 border-amber-200 animate-badge-pop"
                  : "bg-gray-50 border-gray-100 opacity-40 grayscale"
              }`}
            >
              <span className="text-xl leading-none">{badge.icon}</span>
              <span
                className={`text-[9px] leading-tight font-semibold ${
                  isEarned ? "text-amber-900" : "text-gray-400"
                }`}
              >
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>

      {next && (
        <p className="mt-3 text-xs text-gray-500 leading-snug">
          Prochain :{" "}
          <strong className="text-gray-900">
            {next.badge.icon} {next.badge.label}
          </strong>
          {" · "}
          <span className="text-gray-400">{next.progressText}</span>
        </p>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  input,
  onLog,
}: {
  input: SimulatorInput;
  onLog: () => void;
}) {
  return (
    <div className="mt-2 rounded-xl bg-gradient-to-br from-slate-50 to-primary-50/40 border border-primary-100 p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white border border-primary-100 flex items-center justify-center">
        <Coins size={22} className="text-primary-600" />
      </div>
      <p className="text-base font-bold text-gray-900 mb-1">
        Commencez votre suivi mensuel
      </p>
      <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-sm mx-auto">
        Enregistrez votre premier mois pour voir votre avance ou retard,
        les intérêts composés générés, et votre progression dans le temps.
      </p>
      <p className="text-xs text-gray-400 mb-5">
        Versement estimé : {formatEur(input.monthlyAmount)}/mois
      </p>
      <button
        onClick={onLog}
        className="btn-primary text-sm px-5 py-2.5 inline-flex items-center justify-center btn-lift"
      >
        Enregistrer mon premier mois →
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StrategyTracker() {
  const [data, setData] = useState<StrategyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/strategy");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
        <div className="h-16 bg-gray-50 rounded" />
      </div>
    );
  }

  if (!data?.strategy) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 animate-fade-in">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Suivi de stratégie
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Aucune stratégie sauvegardée. Simulez votre DCA et cliquez sur{" "}
          <strong className="text-gray-700">Sauvegarder ma stratégie</strong>{" "}
          pour commencer le suivi.
        </p>
        <a href="/simulateur" className="btn-primary text-sm px-4 py-2 inline-block btn-lift">
          Ouvrir le simulateur →
        </a>
      </div>
    );
  }

  const { strategy, entries } = data;
  const { input, startMonth } = strategy;
  const elapsed = monthsElapsed(startMonth);
  const theoretical = theoreticalValueAtMonth(input, Math.max(elapsed, 1));
  const latestEntry = entries.length ? entries[entries.length - 1] : null;
  const isEmpty = entries.length === 0;

  return (
    <>
      {showModal && (
        <LogMonthModal
          onClose={() => setShowModal(false)}
          onSaved={fetchData}
          defaultMonthly={input.monthlyAmount}
        />
      )}

      <div className="rounded-2xl border border-primary-100 bg-white p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Suivi de stratégie
          </h2>
          <span className="text-xs text-gray-400">
            Mois {Math.max(elapsed, 1)}
          </span>
        </div>

        {/* Strategy params */}
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-semibold text-gray-900">
            {formatEur(input.monthlyAmount)}/mois
          </span>
          {" · "}
          {input.durationYears} ans
          {" · "}
          {input.annualReturnPct} %/an
        </p>

        {/* KPI strip */}
        <StrategyStats strategy={strategy} entries={entries} />

        {isEmpty ? (
          <EmptyState input={input} onLog={() => setShowModal(true)} />
        ) : (
          <>
            {/* Streak */}
            <StreakBlock entries={entries} />

            {/* Values row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-[11px] text-gray-400 mb-1">Valeur théorique</p>
                <p className="text-xl font-bold text-gray-900 tabular-nums">
                  {formatEur(theoretical)}
                </p>
              </div>
              <div className="rounded-xl px-4 py-3 border bg-gray-50 border-gray-100">
                <p className="text-[11px] text-gray-400 mb-1">Votre portefeuille</p>
                <p className="text-xl font-bold text-gray-900 tabular-nums">
                  {latestEntry ? formatEur(latestEntry.portfolioValue) : "—"}
                </p>
              </div>
            </div>

            {/* Insight */}
            {latestEntry && (
              <div className="mb-4">
                <InsightChip actual={latestEntry.portfolioValue} theoretical={theoretical} />
              </div>
            )}

            {/* Interest snapshot (requires 2 consecutive entries) */}
            <InterestSnapshot entries={entries} />

            {/* Year-over-year (requires 12+ months) */}
            <YearOverYearBlock entries={entries} />

            {/* Progression chart (requires 2+ entries) */}
            <ProgressionChart strategy={strategy} entries={entries} />

            {/* Log button */}
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary text-sm px-4 py-2.5 w-full sm:w-auto mt-5 btn-lift"
            >
              Enregistrer ce mois →
            </button>

            {/* History */}
            <EntryHistory entries={entries} strategy={strategy} />
          </>
        )}

        {/* Badges — always visible */}
        <BadgeSection entries={entries} />
      </div>
    </>
  );
}
