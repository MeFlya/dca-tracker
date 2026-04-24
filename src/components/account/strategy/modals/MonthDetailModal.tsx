"use client";

import { useState } from "react";
import { X, Pencil, Trash2, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { formatEur } from "@/lib/simulator";
import { theoreticalValueAtMonth } from "@/lib/strategy-math";
import { useStrategy } from "../StrategyContext";
import { ContributionsReadOnlyList } from "../components/ContributionsList";
import { formatMonthLabel, monthsBetween } from "../components/utils";

export function MonthDetailModal() {
  const {
    strategy,
    entries,
    detailMonth,
    closeMonthDetail,
    openLogModal,
    deleteEntry,
  } = useStrategy();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!detailMonth) return null;

  const entry = entries.find((e) => e.month === detailMonth);
  if (!entry) return null;

  const monthIndex = monthsBetween(strategy.startMonth, entry.month);
  const theoretical = theoreticalValueAtMonth(strategy.input, monthIndex);
  const delta = entry.portfolioValue - theoretical;
  const status: "ahead" | "behind" | "neutral" =
    Math.abs(delta) < 10 ? "neutral" : delta > 0 ? "ahead" : "behind";

  const statusMeta = {
    ahead: {
      label: `En avance de +${formatEur(delta)}`,
      Icon: ArrowUp,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    behind: {
      label: `En retard de ${formatEur(Math.abs(delta))}`,
      Icon: ArrowDown,
      cls: "bg-orange-50 text-orange-700 border-orange-200",
    },
    neutral: {
      label: "Sur la trajectoire",
      Icon: Minus,
      cls: "bg-gray-50 text-gray-700 border-gray-200",
    },
  }[status];

  async function handleDelete() {
    if (!entry) return;
    setDeleting(true);
    const ok = await deleteEntry(entry.month);
    if (ok) {
      closeMonthDetail();
    } else {
      setDeleting(false);
    }
  }

  function handleEdit() {
    if (!entry) return;
    openLogModal(entry);
    closeMonthDetail();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-8 bg-black/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-lg animate-slide-up my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
              Mois
            </p>
            <h3 className="font-bold text-gray-900 text-lg capitalize">
              {formatMonthLabel(entry.month)}
            </h3>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusMeta.cls}`}
              >
                <statusMeta.Icon size={12} />
                {statusMeta.label}
              </span>
            </div>
          </div>
          <button
            onClick={closeMonthDetail}
            className="text-gray-500 hover:text-gray-600 transition-colors shrink-0"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Kpi label="Investi ce mois" value={formatEur(entry.invested)} />
            <Kpi
              label={entry.contributions.length > 1 ? "Contributions" : "Contribution"}
              value={String(entry.contributions.length)}
            />
            <Kpi label="Portefeuille" value={formatEur(entry.portfolioValue)} />
            <Kpi label="Théorique" value={formatEur(theoretical)} muted />
          </div>

          {/* Contributions list */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Contributions détaillées
            </p>
            <ContributionsReadOnlyList contributions={entry.contributions} />
          </div>

          {/* Note */}
          {entry.note && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Commentaire du mois
              </p>
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  « {entry.note} »
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {!confirmDelete ? (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={handleEdit}
                className="btn-secondary flex-1 text-sm inline-flex items-center justify-center gap-1.5"
              >
                <Pencil size={14} />
                Modifier
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center justify-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl border border-red-100 transition-colors"
              >
                <Trash2 size={14} />
                Supprimer
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4">
              <p className="text-sm font-semibold text-red-900 mb-2">
                Supprimer ce mois ?
              </p>
              <p className="text-xs text-red-700 mb-3">
                Toutes les contributions et le commentaire seront perdus. Action
                irréversible.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="btn-secondary flex-1 text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                >
                  {deleting ? "Suppression…" : "Confirmer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
      <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-tight">
        {label}
      </p>
      <p
        className={`text-sm font-bold tabular-nums mt-0.5 ${muted ? "text-gray-500" : "text-gray-900"}`}
      >
        {value}
      </p>
    </div>
  );
}
