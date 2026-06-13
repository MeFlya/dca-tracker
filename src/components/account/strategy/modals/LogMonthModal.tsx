"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { formatEur } from "@/lib/simulator";
import { currentMonth } from "@/lib/strategy-math";
import type { Contribution, MonthlyEntry } from "@/lib/user-strategy";
import { useStrategy } from "../StrategyContext";
import { ContributionsEditableList } from "../components/ContributionsList";

function newId(): string {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function LogMonthModal() {
  const { strategy, entries, logModalState, closeLogModal, upsertEntry } = useStrategy();
  const { open, initialEntry } = logModalState;

  const isEdit = !!initialEntry;
  const defaultMonthly = strategy.input.monthlyAmount;

  const [month, setMonth] = useState<string>(
    initialEntry?.month ?? currentMonth(),
  );
  const [contributions, setContributions] = useState<Contribution[]>(() => {
    if (initialEntry?.contributions?.length) {
      return initialEntry.contributions;
    }
    const date = `${initialEntry?.month ?? currentMonth()}-${String(new Date().getDate()).padStart(2, "0")}`;
    return [
      { id: newId(), date, amount: defaultMonthly, note: undefined },
    ];
  });
  const [portfolioValue, setPortfolioValue] = useState<string>(
    initialEntry ? String(initialEntry.portfolioValue) : "",
  );
  const [note, setNote] = useState<string>(initialEntry?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalContribAmount = useMemo(
    () => contributions.reduce((s, c) => s + (Number.isFinite(c.amount) ? c.amount : 0), 0),
    [contributions],
  );

  // Cohérence : total réellement investi (capital de départ + tous les
  // versements, ce mois inclus) pour détecter une saisie aberrante ("1 €").
  const startingCapital = Math.max(strategy.input.startingCapital ?? 0, 0);
  const investedBaseline = useMemo(() => {
    const priorContrib = entries
      .filter((e) => e.month !== month)
      .reduce((s, e) => s + e.invested, 0);
    return startingCapital + priorContrib + totalContribAmount;
  }, [entries, month, startingCapital, totalContribAmount]);

  const pvNum = parseFloat(portfolioValue);
  const pvWarning = useMemo(() => {
    if (!portfolioValue || isNaN(pvNum) || pvNum <= 0 || investedBaseline <= 0) return null;
    if (pvNum < investedBaseline * 0.4) {
      return `${formatEur(pvNum)} semble très bas face à vos ${formatEur(investedBaseline)} investis. Saisissez la valeur TOTALE en euros de votre portefeuille (toutes lignes confondues), pas un nombre de parts.`;
    }
    if (pvNum > investedBaseline * 5) {
      return `${formatEur(pvNum)} semble très élevé face à vos ${formatEur(investedBaseline)} investis. Vérifiez le montant saisi.`;
    }
    return null;
  }, [portfolioValue, pvNum, investedBaseline]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      setError("Mois invalide.");
      return;
    }

    const pv = parseFloat(portfolioValue);
    if (isNaN(pv) || pv <= 0) {
      setError("La valeur du portefeuille doit être supérieure à 0.");
      return;
    }

    if (!contributions.length) {
      setError("Ajoutez au moins une contribution.");
      return;
    }

    for (const c of contributions) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date) || !c.date.startsWith(month + "-")) {
        setError(`Date de contribution invalide : ${c.date}`);
        return;
      }
      if (!Number.isFinite(c.amount) || c.amount < 0) {
        setError("Montant de contribution invalide.");
        return;
      }
    }

    setSaving(true);
    const ok = await upsertEntry({
      month,
      contributions: contributions.map((c) => ({
        id: c.id,
        date: c.date,
        amount: Number(c.amount),
        note: c.note?.trim() || undefined,
      })),
      portfolioValue: pv,
      note: note.trim() || undefined,
    });
    setSaving(false);

    if (!ok) {
      setError("Erreur lors de l'enregistrement.");
      return;
    }
    closeLogModal();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-8 bg-black/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-md animate-slide-up my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">
              {isEdit ? "Modifier ce mois" : "Enregistrer un mois"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Versements et valeur portefeuille
            </p>
          </div>
          <button
            onClick={closeLogModal}
            className="text-gray-500 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Month */}
          <div>
            <label
              htmlFor="log-month"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Mois
            </label>
            <input
              id="log-month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              disabled={isEdit}
              className="input-field w-full disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {isEdit && (
              <p className="text-[11px] text-gray-500 mt-1">
                Le mois n&apos;est pas modifiable — supprimez et recréez si nécessaire.
              </p>
            )}
          </div>

          {/* Contributions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Contributions
              </label>
              <span className="text-xs text-gray-500 tabular-nums">
                Total : <strong className="text-gray-900">{formatEur(totalContribAmount)}</strong>
              </span>
            </div>
            <ContributionsEditableList
              contributions={contributions}
              month={month}
              onChange={setContributions}
            />
          </div>

          {/* Portfolio value */}
          <div>
            <label
              htmlFor="log-portfolio"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Valeur totale de votre portefeuille (€)
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
            <p className="text-[11px] text-gray-500 mt-1">
              Le montant total en euros affiché sur votre compte courtier,
              toutes lignes confondues — pas un nombre de parts.
            </p>
            {pvWarning && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-1.5 leading-snug" role="status">
                {pvWarning}
              </p>
            )}
          </div>

          {/* Monthly note */}
          <div>
            <label
              htmlFor="log-note"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Commentaire du mois <span className="text-gray-500 font-normal">(optionnel)</span>
            </label>
            <textarea
              id="log-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex : marché volatile, gros versement exceptionnel, rééquilibrage…"
              rows={2}
              maxLength={500}
              className="input-field w-full resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={closeLogModal}
              className="btn-secondary flex-1 text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 text-sm disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
