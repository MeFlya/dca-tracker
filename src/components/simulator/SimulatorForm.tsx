"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Zap, Target } from "lucide-react";
import { SimulatorInput } from "@/lib/simulator";
import { ETF_LIST, TER_REFERENCE_SIMULATEUR, type ETFConfig } from "@/lib/etf-config";
import { SliderInput } from "@/components/ui/SliderInput";
import {
  PortfolioPicker,
  type PortfolioPickerValue,
} from "@/components/simulator/PortfolioPicker";
import {
  PORTFOLIO_PRESETS,
  REGION_RETURN_SOURCES,
  ROLLING_10Y_CALC,
  type PortfolioItem,
} from "@/lib/portfolio";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SimulatorMode = "rapid" | "portfolio";

interface SimulatorFormProps {
  /** Called on every value change — no submit click required */
  onChange: (input: SimulatorInput, inflationEnabled: boolean) => void;
  /** Optional callback when in portfolio mode — gives parent the items so
   *  it can serialize them in the URL `etfs=...` param. */
  onPortfolioChange?: (items: PortfolioItem[] | null) => void;
  defaultValues?: Partial<SimulatorInput>;
  /** Explicitly control whether the inflation row starts toggled on. */
  defaultInflationEnabled?: boolean;
  /** Initial mode — defaults to "rapid". Set to "portfolio" if URL has ?etfs=. */
  defaultMode?: SimulatorMode;
  /** Initial portfolio items — used when defaultMode = "portfolio". */
  defaultPortfolio?: PortfolioItem[];
  /** Called on mount and whenever the mode changes (libellé du résultat). */
  onModeChange?: (mode: SimulatorMode) => void;
}

const DEFAULTS: SimulatorInput = {
  monthlyAmount: 200,
  durationYears: 20,
  annualReturnPct: 7,
  annualFeesPct: TER_REFERENCE_SIMULATEUR, // même source que les liens — voir simulation-params.ts
  annualInflationPct: undefined,
};

/** « 6,64 » : décimales données, virgule française. */
const fr = (n: number, digits: number) => n.toFixed(digits).replace(".", ",");
/** « −1,6 % » ou « +14,4 % », signe typographique. */
const signedPct = (n: number) =>
  `${n < 0 ? "−" : "+"}${fr(Math.abs(n), 1)}\u00a0%`;

// Corrigé le 29/09/2026 : l'aide disait « Rendement attendu avant frais. Le
// MSCI World a affiché ~7–8 %/an sur 30 ans (dividendes inclus) » — phrase non
// sourcée (ni devise, ni net/brut, ni dates), déjà retirée de portfolio.ts, et
// contredite par la fiche MSCI (6,64 %/an en euros depuis le 29/12/2000).
// Repère interpolé depuis REGION_RETURN_SOURCES.monde. Décision : le 7 % par
// défaut du mode rapide (simulation-params, HYPOTHESES_COMPARATIFS) reste une
// hypothèse de travail assumée — de nombreux montants publiés sur le site en
// dépendent (97 753 € pour 200 €/mois sur 20 ans, etc.) — et l'aide le dit ; le mode « Mes ETF », lui, part de la
// moyenne historique des indices, d'où un résultat différent pour un même ETF.
const WORLD = REGION_RETURN_SOURCES.monde;
const RETURN_HINT = `Hypothèse de rendement avant frais, pas une prévision. Les ${fr(DEFAULTS.annualReturnPct, 0)}\u00a0%/an proposés par défaut sont une hypothèse de travail ; le mode « Mes ETF » part, lui, de la moyenne historique des indices. Pour repère : ${WORLD.referenceIndex} en euros, dividendes nets réinvestis, ${fr(WORLD.annualizedPct, 2)}\u00a0%/an ${WORLD.period} (${WORLD.shortSource})${
  WORLD.rolling10y
    ? ` ; sur 10 ans glissants dans cette période, de ${signedPct(WORLD.rolling10y.min)} à ${signedPct(WORLD.rolling10y.max)}/an selon le mois de départ (${ROLLING_10Y_CALC.shortLabel})`
    : ""
}.`;

/** Default portfolio when user switches to portfolio mode without prior selection. */
function defaultPortfolioItems(etfs: ETFConfig[]): PortfolioItem[] {
  const preset = PORTFOLIO_PRESETS.find((p) => p.id === "world-em-80-20")!;
  return preset.allocation
    .map(({ displaySymbol, weight }) => {
      const etf = etfs.find((e) => e.displaySymbol === displaySymbol);
      return etf ? { etf, weight } : null;
    })
    .filter((x): x is PortfolioItem => x !== null);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SimulatorForm({
  onChange,
  onPortfolioChange,
  defaultValues,
  defaultInflationEnabled,
  defaultMode = "rapid",
  defaultPortfolio,
  onModeChange,
}: SimulatorFormProps) {
  const [mode, setMode] = useState<SimulatorMode>(defaultMode);

  // Le résultat (SimulatorHero) doit savoir si le rendement vient de la
  // moyenne historique des indices (mode portefeuille) ou d'une saisie.
  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);
  const [values, setValues] = useState<SimulatorInput>({
    ...DEFAULTS,
    ...defaultValues,
  });
  const [showInflation, setShowInflation] = useState(
    defaultInflationEnabled ?? defaultValues?.annualInflationPct !== undefined
  );

  // Snapshot of the current portfolio items (only meaningful in mode === "portfolio").
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(
    defaultPortfolio && defaultPortfolio.length > 0
      ? defaultPortfolio
      : defaultPortfolioItems(ETF_LIST)
  );

  // Track whether we've sent the URL update for the portfolio yet.
  // Avoid spamming URL changes on the same allocation.
  const lastSerializedRef = useRef<string>("");

  // Fire onChange whenever values OR mode-driven derived values change.
  // In rapid mode → use values.annualReturnPct + values.annualFeesPct.
  // In portfolio mode → those fields are overridden by the blended values
  // computed by PortfolioPicker (we keep the rapid values in state for the
  // round-trip when user switches back).
  useEffect(() => {
    onChange(
      {
        ...values,
        annualInflationPct: showInflation
          ? values.annualInflationPct ?? 2
          : undefined,
      },
      showInflation
    );
  }, [values, showInflation, onChange]);

  // When user changes portfolio in picker, blend → override return/TER in state.
  const handlePortfolioChange = useCallback(
    (v: PortfolioPickerValue) => {
      setPortfolio(v.items);
      // Override return + TER with blended values
      setValues((prev) => ({
        ...prev,
        annualReturnPct: v.blend.blendedReturn,
        annualFeesPct: v.blend.blendedTer,
      }));
      // Notify parent for URL serialization (only if balanced AND items present)
      if (onPortfolioChange) {
        if (v.blend.isBalanced && v.items.length > 0) {
          const sig = v.items
            .map((i) => `${i.etf.displaySymbol}:${i.weight.toFixed(1)}`)
            .join(",");
          if (sig !== lastSerializedRef.current) {
            lastSerializedRef.current = sig;
            onPortfolioChange(v.items);
          }
        } else if (lastSerializedRef.current !== "") {
          // Unbalanced or empty → clear the URL param
          lastSerializedRef.current = "";
          onPortfolioChange(null);
        }
      }
    },
    [onPortfolioChange]
  );

  // Switching mode side-effects
  const switchMode = useCallback(
    (next: SimulatorMode) => {
      setMode(next);
      if (next === "rapid") {
        // Reset to manual values — clear the picker overrides
        if (onPortfolioChange) {
          lastSerializedRef.current = "";
          onPortfolioChange(null);
        }
        // Restore typical defaults if the user comes back to rapid mode
        setValues((prev) => ({
          ...prev,
          annualReturnPct: defaultValues?.annualReturnPct ?? DEFAULTS.annualReturnPct,
          annualFeesPct: defaultValues?.annualFeesPct ?? DEFAULTS.annualFeesPct,
        }));
      } else {
        // Switching to portfolio — sync the URL with the current portfolio
        // (the useEffect in handlePortfolioChange path will fire on next render)
        if (onPortfolioChange && portfolio.length > 0) {
          const sig = portfolio
            .map((i) => `${i.etf.displaySymbol}:${i.weight.toFixed(1)}`)
            .join(",");
          lastSerializedRef.current = sig;
          onPortfolioChange(portfolio);
        }
      }
    },
    [defaultValues, onPortfolioChange, portfolio]
  );

  const set = useCallback(
    (key: keyof SimulatorInput) => (v: number) => {
      setValues((prev) => ({ ...prev, [key]: v }));
    },
    []
  );

  const handleReset = () => {
    setValues(DEFAULTS);
    setShowInflation(false);
    if (mode === "portfolio") switchMode("rapid");
  };

  const toggleInflation = (checked: boolean) => {
    setShowInflation(checked);
    if (checked && values.annualInflationPct === undefined) {
      setValues((prev) => ({ ...prev, annualInflationPct: 2 }));
    }
  };

  return (
    <div className="card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-lg">Paramètres</h2>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
          title="Réinitialiser les valeurs par défaut"
        >
          Réinitialiser
        </button>
      </div>

      {/* Mode toggle */}
      <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-1 grid grid-cols-2 gap-1">
        <ModeButton
          active={mode === "rapid"}
          onClick={() => switchMode("rapid")}
          Icon={Zap}
          label="Rapide"
          hint="Valeurs directes"
        />
        <ModeButton
          active={mode === "portfolio"}
          onClick={() => switchMode("portfolio")}
          Icon={Target}
          label="Mes ETF"
          hint="Choisir les ETF"
        />
      </div>

      {/* Net return preview badge */}
      <NetReturnBadge
        gross={values.annualReturnPct}
        fees={values.annualFeesPct}
      />

      {/* Always-shown fields (versement + durée) */}
      <div className="space-y-7">
        <SliderInput
          label="Versement mensuel"
          value={values.monthlyAmount}
          min={25}
          max={5000}
          step={25}
          unit="€"
          hint="Montant que vous investissez chaque mois, régulièrement."
          formatDisplay={(v) =>
            new Intl.NumberFormat("fr-FR").format(v)
          }
          onChange={set("monthlyAmount")}
        />

        <SliderInput
          label="Durée de l'investissement"
          value={values.durationYears}
          min={1}
          max={40}
          step={1}
          unit="ans"
          hint="Votre horizon de placement. Plus c'est long, plus les intérêts composés ont d'effet."
          onChange={set("durationYears")}
        />

        {/* Mode-specific section : sliders rendement/TER en mode rapide,
            picker ETF en mode portfolio */}
        {mode === "rapid" ? (
          <>
            <SliderInput
              label="Rendement annuel brut"
              value={values.annualReturnPct}
              min={1}
              max={15}
              step={0.1}
              unit="%"
              hint={RETURN_HINT}
              onChange={set("annualReturnPct")}
            />

            {/* 28/09/2026 : VWCE 0,22 % → 0,14 % ; SPY retiré (absent de la table de
                vérité ETF) ; WPEA et DCAM ajoutés. */}
            <SliderInput
              label="Frais annuels (TER)"
              value={values.annualFeesPct}
              min={0}
              max={2}
              step={0.01}
              unit="%"
              hint="Frais de gestion de votre ETF. WPEA, DCAM : 0,20 %. CW8 : 0,38 %. VWCE : 0,14 %."
              onChange={set("annualFeesPct")}
            />
          </>
        ) : (
          <div className="animate-fade-in">
            <p className="text-xs font-semibold text-gray-700 mb-3">
              Composition de votre portefeuille
            </p>
            <PortfolioPicker
              etfs={ETF_LIST}
              initialItems={portfolio}
              monthlyAmount={values.monthlyAmount}
              onChange={handlePortfolioChange}
            />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Inflation toggle + slider */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer group w-fit">
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
              showInflation ? "bg-primary-600" : "bg-gray-200"
            }`}
            onClick={() => toggleInflation(!showInflation)}
            role="switch"
            aria-checked={showInflation}
            aria-label="Activer le calcul en pouvoir d'achat réel (déduire l'inflation)"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") toggleInflation(!showInflation);
            }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
                showInflation ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
            Intégrer l&apos;inflation
          </span>
        </label>

        {showInflation && (
          <div className="pl-1 animate-fade-in">
            <SliderInput
              label="Inflation annuelle estimée"
              value={values.annualInflationPct ?? 2}
              min={0}
              max={10}
              step={0.1}
              unit="%"
              hint="Affiche la valeur réelle en euros d'aujourd'hui. BCE cible 2 %/an."
              onChange={set("annualInflationPct")}
            />
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
        Mise à jour en temps réel
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ModeButton({
  active,
  onClick,
  Icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-center px-3 py-2 rounded-lg transition-colors ${
        active
          ? "bg-white text-slate-950 shadow-card"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      <span className="flex items-center justify-center gap-1.5 text-sm font-semibold">
        <Icon size={14} className={active ? "text-primary-600" : "text-gray-500"} />
        {label}
      </span>
      <span className="block text-[10px] text-gray-500 mt-0.5">{hint}</span>
    </button>
  );
}

/** Small inline badge showing net return = gross - fees */
function NetReturnBadge({ gross, fees }: { gross: number; fees: number }) {
  const net = Math.max(gross - fees, 0);
  const netStr = net.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary-50 border border-primary-100">
      <span className="text-xs text-primary-700 font-medium">
        Hypothèse de rendement après frais
      </span>
      <span className="text-sm font-bold text-primary-800 tabular-nums">
        {netStr}&nbsp;%<span className="font-normal text-primary-700">/an</span>
      </span>
    </div>
  );
}
