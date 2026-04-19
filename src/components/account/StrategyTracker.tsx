"use client";

import { useState, useEffect, useCallback } from "react";
import { formatEur } from "@/lib/simulator";
import {
  theoreticalValueAtMonth,
  monthsElapsed,
  currentMonth,
  computeStreak,
  nextStreakMilestone,
  computeInterestSnapshot,
} from "@/lib/strategy-math";
import type { StrategyData, MonthlyEntry } from "@/lib/user-strategy";
import type { SimulatorInput } from "@/lib/simulator";

// ─── Log Month Modal ──────────────────────────────────────────────────────────

function LogMonthModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [invested, setInvested] = useState("");
  const [portfolioValue, setPortfolioValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const inv = parseFloat(invested);
    const pv = parseFloat(portfolioValue);
    if (isNaN(inv) || isNaN(pv) || inv < 0 || pv < 0) {
      setError("Valeurs invalides.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/strategy/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: currentMonth(), invested: inv, portfolioValue: pv }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Enregistrer ce mois</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Investi ce mois (€)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={invested}
              onChange={(e) => setInvested(e.target.value)}
              placeholder="200"
              required
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Valeur du portefeuille (€)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(e.target.value)}
              placeholder="1 450"
              required
              className="input-field w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              Valeur actuelle affichée dans votre application courtier.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

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
      <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 mb-4">
        <p className="text-sm font-semibold text-orange-900">💔 Série interrompue</p>
        <p className="text-xs text-orange-700 mt-0.5">
          Reprenez en enregistrant ce mois pour relancer votre série.
        </p>
      </div>
    );
  }

  const next = nextStreakMilestone(streak);

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-bold px-3 py-1.5 rounded-full">
        🔥 {streak} mois consécutif{streak > 1 ? "s" : ""}
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
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 mb-4">
        <p className="text-sm font-semibold text-emerald-900 mb-0.5">
          💸 Ce mois sans effort
        </p>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Les intérêts composés ont ajouté{" "}
          <strong className="text-emerald-900">+{formatEur(snap.interest)}</strong>{" "}
          à votre portefeuille. Vous avez versé {formatEur(snap.invested)},
          votre portefeuille a gagné {formatEur(snap.delta)}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 mb-4">
      <p className="text-sm font-semibold text-orange-900 mb-0.5">
        📉 Mois baissier — le DCA fait son travail
      </p>
      <p className="text-xs text-orange-800 leading-relaxed">
        Le marché a retiré{" "}
        <strong className="text-orange-900">{formatEur(Math.abs(snap.interest))}</strong>{" "}
        ce mois. C&apos;est exactement le moment où vos{" "}
        {formatEur(snap.invested)} achètent plus de parts à prix réduit.
      </p>
    </div>
  );
}

// ─── Insight chip ─────────────────────────────────────────────────────────────

function InsightChip({ actual, theoretical }: { actual: number; theoretical: number }) {
  const delta = actual - theoretical;
  const ahead = delta >= 0;
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
        ahead
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-orange-50 text-orange-700 border border-orange-200"
      }`}
    >
      <span>{ahead ? "↑" : "↓"}</span>
      {ahead
        ? `En avance de +${formatEur(delta)}`
        : `En retard de ${formatEur(Math.abs(delta))}`}
    </div>
  );
}

// ─── History table ────────────────────────────────────────────────────────────

function EntryHistory({ entries, input }: { entries: MonthlyEntry[]; input: SimulatorInput }) {
  const recent = [...entries].reverse().slice(0, 6);
  if (!recent.length) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Historique
      </p>
      <div className="space-y-1.5">
        {recent.map((e) => {
          const [y, m] = e.month.split("-").map(Number);
          const months = (y - parseInt(entries[0]?.month.split("-")[0] ?? "0")) * 12 +
            (m - parseInt(entries[0]?.month.split("-")[1] ?? "0")) + 1;
          const theoretical = theoreticalValueAtMonth(input, months);
          const delta = e.portfolioValue - theoretical;
          return (
            <div key={e.month} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-500">{formatMonthLabel(e.month)}</span>
              <span className="font-semibold text-gray-900 tabular-nums">{formatEur(e.portfolioValue)}</span>
              <span className={`text-xs font-medium tabular-nums ${delta >= 0 ? "text-emerald-600" : "text-orange-500"}`}>
                {delta >= 0 ? "+" : ""}{formatEur(delta)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
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

  useEffect(() => { fetchData(); }, [fetchData]);

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
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Suivi de stratégie
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Aucune stratégie sauvegardée. Simulez votre DCA et cliquez sur{" "}
          <strong className="text-gray-700">Sauvegarder ma stratégie</strong> pour commencer le suivi.
        </p>
        <a href="/simulateur" className="btn-primary text-sm px-4 py-2 inline-block">
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

  return (
    <>
      {showModal && (
        <LogMonthModal
          onClose={() => setShowModal(false)}
          onSaved={fetchData}
        />
      )}

      <div className="rounded-2xl border border-primary-100 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Suivi de stratégie
          </h2>
          <span className="text-xs text-gray-400">
            Mois {Math.max(elapsed, 1)}
          </span>
        </div>

        {/* Strategy params */}
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-semibold text-gray-900">{formatEur(input.monthlyAmount)}/mois</span>
          {" · "}{input.durationYears} ans{" · "}{input.annualReturnPct} %/an
        </p>

        {/* Streak */}
        <StreakBlock entries={entries} />

        {/* Values row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-[11px] text-gray-400 mb-1">Valeur théorique</p>
            <p className="text-xl font-bold text-gray-900 tabular-nums">{formatEur(theoretical)}</p>
          </div>
          <div className={`rounded-xl px-4 py-3 border ${latestEntry ? "bg-gray-50 border-gray-100" : "bg-gray-50 border-dashed border-gray-200"}`}>
            <p className="text-[11px] text-gray-400 mb-1">Votre portefeuille</p>
            {latestEntry ? (
              <p className="text-xl font-bold text-gray-900 tabular-nums">{formatEur(latestEntry.portfolioValue)}</p>
            ) : (
              <p className="text-sm text-gray-300 italic">non renseigné</p>
            )}
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

        {/* Log button */}
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-sm px-4 py-2 w-full sm:w-auto"
        >
          Enregistrer ce mois →
        </button>

        {/* History */}
        {entries.length > 0 && (
          <EntryHistory entries={entries} input={input} />
        )}
      </div>
    </>
  );
}
