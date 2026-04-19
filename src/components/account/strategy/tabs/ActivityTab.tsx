"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
} from "lucide-react";
import { formatEur } from "@/lib/simulator";
import { theoreticalValueAtMonth } from "@/lib/strategy-math";
import { useStrategy } from "../StrategyContext";
import { ContributionsCompact } from "../components/ContributionsList";
import { formatMonthLabel, monthsBetween } from "../components/utils";

type SortOrder = "newest" | "oldest";

export function ActivityTab() {
  const { strategy, entries, openLogModal, openMonthDetail } = useStrategy();
  const [sort, setSort] = useState<SortOrder>("newest");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const sorted = useMemo(() => {
    const asc = [...entries].sort((a, b) => a.month.localeCompare(b.month));
    return sort === "newest" ? asc.reverse() : asc;
  }, [entries, sort]);

  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
        <p className="text-sm text-gray-500 mb-4">
          Aucune activité enregistrée pour le moment.
        </p>
        <button
          onClick={() => openLogModal()}
          className="btn-primary text-sm px-5 py-2 inline-flex items-center gap-1.5 btn-lift"
        >
          <Plus size={14} />
          Enregistrer un mois
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header: sort + add */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowUpDown size={14} />
          {sort === "newest" ? "Plus récent d'abord" : "Plus ancien d'abord"}
        </button>

        <button
          onClick={() => openLogModal()}
          className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-1.5 btn-lift"
        >
          <Plus size={14} />
          Enregistrer un mois
        </button>
      </div>

      {/* Month list */}
      <div className="space-y-2">
        {sorted.map((entry) => {
          const monthIndex = monthsBetween(strategy.startMonth, entry.month);
          const theoretical = theoreticalValueAtMonth(strategy.input, monthIndex);
          const delta = entry.portfolioValue - theoretical;
          const status: "ahead" | "behind" | "neutral" =
            Math.abs(delta) < 10 ? "neutral" : delta > 0 ? "ahead" : "behind";
          const isOpen = expanded[entry.month];

          return (
            <MonthCard
              key={entry.month}
              month={entry.month}
              invested={entry.invested}
              portfolioValue={entry.portfolioValue}
              contributionCount={entry.contributions.length}
              delta={delta}
              status={status}
              note={entry.note}
              isOpen={!!isOpen}
              onToggle={() =>
                setExpanded((s) => ({ ...s, [entry.month]: !s[entry.month] }))
              }
              onDetail={() => openMonthDetail(entry.month)}
              contributionsCompact={
                <ContributionsCompact contributions={entry.contributions} />
              }
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Month card ───────────────────────────────────────────────────────────────

function MonthCard({
  month,
  invested,
  portfolioValue,
  contributionCount,
  delta,
  status,
  note,
  isOpen,
  onToggle,
  onDetail,
  contributionsCompact,
}: {
  month: string;
  invested: number;
  portfolioValue: number;
  contributionCount: number;
  delta: number;
  status: "ahead" | "behind" | "neutral";
  note?: string;
  isOpen: boolean;
  onToggle: () => void;
  onDetail: () => void;
  contributionsCompact: React.ReactNode;
}) {
  const StatusIcon = status === "ahead" ? ArrowUp : status === "behind" ? ArrowDown : Minus;
  const statusColor =
    status === "ahead"
      ? "text-emerald-600"
      : status === "behind"
      ? "text-orange-500"
      : "text-gray-400";

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden hover:border-gray-200 transition-colors">
      {/* Row header (always visible) */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 capitalize">
              {formatMonthLabel(month)}
            </span>
            {note && <MessageSquare size={12} className="text-gray-300 shrink-0" aria-label="commentaire" />}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {contributionCount} contribution{contributionCount > 1 ? "s" : ""} ·{" "}
            {formatEur(invested)} investi
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 tabular-nums">
              {formatEur(portfolioValue)}
            </p>
            <p className={`text-xs font-semibold tabular-nums ${statusColor} inline-flex items-center gap-0.5 justify-end w-full`}>
              <StatusIcon size={11} />
              {delta >= 0 ? "+" : ""}
              {formatEur(delta)}
            </p>
          </div>
          {isOpen ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-50 animate-fade-in">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Contributions
              </p>
              {contributionsCompact}
            </div>

            {note && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Note
                </p>
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  « {note} »
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={onDetail}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Voir le détail complet →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
