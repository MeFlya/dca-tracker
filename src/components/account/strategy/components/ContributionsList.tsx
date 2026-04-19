"use client";

import { Trash2, Plus } from "lucide-react";
import type { Contribution } from "@/lib/user-strategy";
import { formatFullDate, formatDayMonth } from "./utils";
import { formatEur } from "@/lib/simulator";

// ─── Read-only view (used in MonthDetailModal) ────────────────────────────────

export function ContributionsReadOnlyList({
  contributions,
}: {
  contributions: Contribution[];
}) {
  if (!contributions.length) {
    return (
      <p className="text-sm text-gray-400 italic">
        Aucune contribution enregistrée ce mois.
      </p>
    );
  }

  const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-1.5">
      {sorted.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-gray-50 border border-gray-100"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">{formatFullDate(c.date)}</p>
            {c.note && (
              <p className="text-xs text-gray-500 italic mt-0.5 truncate">
                {c.note}
              </p>
            )}
          </div>
          <p className="text-sm font-bold text-gray-900 tabular-nums shrink-0">
            {formatEur(c.amount)}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Editable list (used in LogMonthModal) ────────────────────────────────────

export function ContributionsEditableList({
  contributions,
  month,
  onChange,
}: {
  contributions: Contribution[];
  month: string; // "YYYY-MM"
  onChange: (next: Contribution[]) => void;
}) {
  function updateField(
    index: number,
    field: "date" | "amount" | "note",
    value: string,
  ) {
    const next = [...contributions];
    const item = { ...next[index] };
    if (field === "amount") {
      item.amount = value === "" ? 0 : Number(value);
    } else if (field === "note") {
      item.note = value || undefined;
    } else {
      item[field] = value;
    }
    next[index] = item;
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(contributions.filter((_, i) => i !== index));
  }

  function addNew() {
    const defaultDate = `${month}-${String(new Date().getDate()).padStart(2, "0")}`;
    // If month is the current month, use today's date; else use the 15th
    const todayDate = new Date();
    const currentMonthStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, "0")}`;
    const date = month === currentMonthStr ? defaultDate : `${month}-15`;

    onChange([
      ...contributions,
      {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date,
        amount: 0,
      },
    ]);
  }

  return (
    <div className="space-y-2">
      {contributions.map((c, i) => (
        <div
          key={c.id}
          className="rounded-lg border border-gray-100 bg-gray-50/50 p-3"
        >
          <div className="grid grid-cols-[110px_1fr_28px] gap-2 items-start">
            <input
              type="date"
              value={c.date}
              min={`${month}-01`}
              max={`${month}-31`}
              onChange={(e) => updateField(i, "date", e.target.value)}
              required
              className="input-field !py-2 !px-2 text-xs"
              aria-label={`Date contribution ${i + 1}`}
            />
            <input
              type="number"
              min="0"
              step="1"
              value={c.amount || ""}
              onChange={(e) => updateField(i, "amount", e.target.value)}
              placeholder="Montant €"
              required
              className="input-field !py-2 !px-2 text-sm tabular-nums"
              aria-label={`Montant contribution ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="text-gray-300 hover:text-red-500 transition-colors p-1.5"
              aria-label="Supprimer cette contribution"
              disabled={contributions.length === 1}
            >
              <Trash2 size={15} />
            </button>
          </div>
          <input
            type="text"
            value={c.note ?? ""}
            onChange={(e) => updateField(i, "note", e.target.value)}
            placeholder="Libellé (optionnel) — ex : ordre mensuel"
            maxLength={80}
            className="input-field !py-1.5 !px-2 text-xs mt-2 w-full"
            aria-label={`Libellé contribution ${i + 1}`}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addNew}
        className="w-full rounded-lg border border-dashed border-primary-200 bg-primary-50/40 text-primary-700 text-xs font-semibold py-2 hover:bg-primary-50 hover:border-primary-300 transition-colors inline-flex items-center justify-center gap-1.5"
      >
        <Plus size={14} />
        Ajouter une contribution
      </button>
    </div>
  );
}

// ─── Compact preview (for Activity tab MonthCard) ─────────────────────────────

export function ContributionsCompact({
  contributions,
}: {
  contributions: Contribution[];
}) {
  if (!contributions.length) return null;
  const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-wrap gap-1.5">
      {sorted.map((c) => (
        <span
          key={c.id}
          title={c.note ? `${formatDayMonth(c.date)} · ${c.note}` : formatDayMonth(c.date)}
          className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md text-[11px] text-gray-600"
        >
          <span className="text-gray-400">{formatDayMonth(c.date)}</span>
          <span className="font-semibold tabular-nums">{formatEur(c.amount)}</span>
        </span>
      ))}
    </div>
  );
}
