"use client";

// Onboarding guidé de la stratégie DCA (Premium).
// Sert à la création (aucune stratégie) ET à l'édition ("Modifier ma stratégie").
// 4 étapes : plan mensuel → point de départ (capital + date) → ETF/allocation →
// récap. Réutilise SliderInput et PortfolioPicker (mêmes briques que le
// simulateur). Persiste l'allocation, le capital de départ et la date de début —
// les 3 trous identifiés dans l'audit.

import { useState, useMemo } from "react";
import { Check, ArrowRight, ArrowLeft, Wallet, CalendarClock, PieChart, ClipboardCheck, X } from "lucide-react";
import { SliderInput } from "@/components/ui/SliderInput";
import { PortfolioPicker, type PortfolioPickerValue } from "@/components/simulator/PortfolioPicker";
import { ETF_LIST } from "@/lib/etf-config";
import { PORTFOLIO_PRESETS, blendPortfolio, type PortfolioItem } from "@/lib/portfolio";
import { runSimulation, formatEur } from "@/lib/simulator";
import { currentMonth } from "@/lib/strategy-math";
import type { Strategy } from "@/lib/user-strategy";
import { track } from "@/lib/analytics";

const STEPS = [
  { key: "plan", label: "Votre plan", Icon: Wallet },
  { key: "start", label: "Point de départ", Icon: CalendarClock },
  { key: "etfs", label: "Vos ETF", Icon: PieChart },
  { key: "recap", label: "Récapitulatif", Icon: ClipboardCheck },
] as const;

function buildItemsFromAllocation(
  allocation: { displaySymbol: string; weight: number }[],
): PortfolioItem[] {
  return allocation
    .map(({ displaySymbol, weight }) => {
      const etf = ETF_LIST.find((e) => e.displaySymbol === displaySymbol);
      return etf ? { etf, weight } : null;
    })
    .filter((x): x is PortfolioItem => x !== null);
}

const DEFAULT_ALLOCATION = PORTFOLIO_PRESETS.find((p) => p.id === "world-100")?.allocation ?? [
  { displaySymbol: "CW8", weight: 100 },
];

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function StrategySetupWizard({
  initial,
  onCancel,
}: {
  initial?: Strategy;
  onCancel?: () => void;
}) {
  const isEdit = !!initial;

  const [step, setStep] = useState(0);
  const [monthlyAmount, setMonthlyAmount] = useState(initial?.input.monthlyAmount ?? 200);
  const [durationYears, setDurationYears] = useState(initial?.input.durationYears ?? 20);
  const [startingCapital, setStartingCapital] = useState(initial?.input.startingCapital ?? 0);
  const [startMonth, setStartMonth] = useState(initial?.startMonth ?? currentMonth());

  const [picker, setPicker] = useState<PortfolioPickerValue>(() => {
    const items = initial?.allocation?.length
      ? buildItemsFromAllocation(initial.allocation)
      : buildItemsFromAllocation(DEFAULT_ALLOCATION);
    return { items, blend: blendPortfolio(items, initial?.input.monthlyAmount ?? 200) };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const thisMonth = currentMonth();

  // Projection finale pour le récap.
  const projection = useMemo(() => {
    const input = {
      monthlyAmount,
      durationYears,
      annualReturnPct: picker.blend.blendedReturn,
      annualFeesPct: picker.blend.blendedTer,
      startingCapital,
    };
    return runSimulation(input).base;
  }, [monthlyAmount, durationYears, picker.blend, startingCapital]);

  async function handleSubmit() {
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            monthlyAmount,
            durationYears,
            annualReturnPct: Math.round(picker.blend.blendedReturn * 100) / 100,
            annualFeesPct: Math.round(picker.blend.blendedTer * 1000) / 1000,
            startingCapital: Math.max(startingCapital, 0),
          },
          startMonth,
          allocation: picker.items.map((i) => ({
            displaySymbol: i.etf.displaySymbol,
            weight: Math.round(i.weight * 10) / 10,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      track({ name: isEdit ? "edit_strategy" : "create_strategy", props: { monthly: monthlyAmount, years: durationYears, etfs: picker.items.length } });
      // Reload pour remonter la nouvelle stratégie côté serveur (le provider
      // garde son state initial sinon).
      window.location.assign("/account");
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setSaving(false);
    }
  }

  const StepIcon = STEPS[step].Icon;
  const canNext =
    step === 0 ? monthlyAmount > 0 && durationYears > 0
    : step === 2 ? picker.items.length > 0 && picker.blend.isBalanced
    : true;

  return (
    <div className="card-primary">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 mb-2">
            {isEdit ? "Modifier ma stratégie" : "Configurons votre stratégie"}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {STEPS[step].label}
          </h2>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            aria-label="Fermer"
            className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Stepper */}
      <ol className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.key} className="flex items-center gap-2 flex-1 last:flex-none">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 transition-colors ${
                  done
                    ? "bg-primary-600 text-white"
                    : active
                      ? "bg-primary-100 text-primary-700 ring-2 ring-primary-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <Check size={15} strokeWidth={3} /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span className={`h-0.5 flex-1 rounded-full ${done ? "bg-primary-600" : "bg-gray-100"}`} />
              )}
            </li>
          );
        })}
      </ol>

      {/* Step body */}
      <div className="min-h-[280px]">
        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-sm text-gray-600 leading-relaxed flex items-start gap-2">
              <StepIcon size={16} className="text-primary-600 mt-0.5 shrink-0" />
              Combien comptez-vous investir, et sur combien de temps ? Vous
              pourrez tout modifier plus tard.
            </p>
            <SliderInput
              label="Montant investi chaque mois"
              value={monthlyAmount}
              min={10}
              max={2000}
              step={10}
              unit="€/mois"
              hint="Le versement régulier au cœur de votre DCA."
              onChange={setMonthlyAmount}
            />
            <SliderInput
              label="Pendant combien d'années ?"
              value={durationYears}
              min={1}
              max={40}
              step={1}
              unit="ans"
              hint="Votre horizon d'investissement. Le DCA donne le meilleur sur le long terme."
              onChange={setDurationYears}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-sm text-gray-600 leading-relaxed flex items-start gap-2">
              <StepIcon size={16} className="text-primary-600 mt-0.5 shrink-0" />
              Vous investissez déjà ? Indiquez ce que vous avez mis jusqu&apos;ici
              et depuis quand — sinon laissez à zéro et sur ce mois-ci.
            </p>
            <SliderInput
              label="Capital déjà investi (optionnel)"
              value={startingCapital}
              min={0}
              max={100000}
              step={500}
              unit="€"
              hint="Le total que vous avez déjà placé avant de commencer le suivi. Évite d'apparaître « en retard » dès le départ."
              formatDisplay={(v) => v.toLocaleString("fr-FR")}
              onChange={setStartingCapital}
            />
            <div>
              <label htmlFor="setup-start-month" className="block text-sm font-medium text-gray-700 mb-1.5">
                Depuis quand investissez-vous ?
              </label>
              <input
                id="setup-start-month"
                type="month"
                value={startMonth}
                max={thisMonth}
                onChange={(e) => setStartMonth(e.target.value || thisMonth)}
                className="input-field w-full"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Laissez sur ce mois si vous démarrez maintenant.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-gray-600 leading-relaxed flex items-start gap-2">
              <StepIcon size={16} className="text-primary-600 mt-0.5 shrink-0" />
              Choisissez vos ETF. Le rendement et les frais de votre projection
              sont calculés à partir de cette allocation.
            </p>
            <PortfolioPicker
              etfs={ETF_LIST}
              initialItems={picker.items}
              monthlyAmount={monthlyAmount}
              onChange={setPicker}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-gray-600 leading-relaxed flex items-start gap-2">
              <StepIcon size={16} className="text-primary-600 mt-0.5 shrink-0" />
              Tout est prêt. Vous pourrez modifier ces paramètres à tout moment
              depuis votre tableau de bord.
            </p>

            <dl className="rounded-2xl border border-slate-200/70 divide-y divide-slate-100 overflow-hidden">
              <RecapRow label="Versement mensuel" value={`${formatEur(monthlyAmount)} / mois`} />
              <RecapRow label="Horizon" value={`${durationYears} ans`} />
              {startingCapital > 0 && (
                <RecapRow label="Capital déjà investi" value={formatEur(startingCapital)} />
              )}
              <RecapRow label="Depuis" value={monthLabel(startMonth)} />
              <RecapRow
                label="Allocation"
                value={picker.items.map((i) => `${i.etf.displaySymbol} ${Math.round(i.weight)} %`).join(" · ")}
              />
              <RecapRow
                label="Rendement net estimé"
                value={`${picker.blend.blendedNetReturn.toFixed(2).replace(".", ",")} %/an`}
              />
            </dl>

            <div className="rounded-2xl bg-primary-50/60 border border-primary-100 p-5 text-center">
              <p className="text-xs text-primary-700 uppercase tracking-wide font-semibold mb-1">
                Projection à {durationYears} ans
              </p>
              <p className="font-display text-3xl font-bold text-primary-900 tabular-nums">
                {formatEur(projection.finalValue)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                dont <strong className="text-gain-dark">{formatEur(projection.totalGain)}</strong> d&apos;intérêts composés
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-4" role="alert">{error}</p>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-slate-100">
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="btn-secondary text-sm"
            disabled={saving}
          >
            <ArrowLeft size={15} />
            Retour
          </button>
        ) : onCancel ? (
          <button onClick={onCancel} className="btn-secondary text-sm" disabled={saving}>
            Annuler
          </button>
        ) : (
          <span />
        )}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => canNext && setStep((s) => s + 1)}
            disabled={!canNext}
            className="btn-primary text-sm"
          >
            Continuer
            <ArrowRight size={15} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving} className="btn-primary text-sm">
            {saving ? "Enregistrement…" : isEdit ? "Mettre à jour ma stratégie" : "Lancer mon suivi"}
            {!saving && <Check size={15} strokeWidth={3} />}
          </button>
        )}
      </div>
    </div>
  );
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900 text-right">{value}</dd>
    </div>
  );
}
