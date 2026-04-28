"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Strategy, MonthlyEntry } from "@/lib/user-strategy";
import {
  compileRecap,
  type AccountType,
  type RecapData,
} from "@/lib/fiscal/recap";
import { formatFiscalEur } from "@/lib/fiscal/pea-cto";

interface Props {
  strategy: Strategy;
  entries: MonthlyEntry[];
  selectedYear: number;
  availableYears: number[];
  firstName: string | null;
}

export function RecapFiscalClient({
  strategy,
  entries,
  selectedYear,
  availableYears,
  firstName,
}: Props) {
  // Account type — defaults to PEA (most common for FR DCA investors)
  const [accountType, setAccountType] = useState<AccountType>("PEA");

  // Sale form state — empty by default. User fills if they sold this year.
  const [saleEnabled, setSaleEnabled] = useState(false);
  const [grossAmount, setGrossAmount] = useState<string>("");
  const [investedPortion, setInvestedPortion] = useState<string>("");
  const [saleDate, setSaleDate] = useState<string>("");

  const recap: RecapData = useMemo(() => {
    const grossNum = parseFloat(grossAmount.replace(",", "."));
    const investedNum = parseFloat(investedPortion.replace(",", "."));
    const saleValid =
      saleEnabled &&
      Number.isFinite(grossNum) &&
      grossNum > 0 &&
      Number.isFinite(investedNum) &&
      investedNum > 0;

    return compileRecap({
      strategy,
      entries,
      year: selectedYear,
      accountType,
      sale: saleValid
        ? {
            grossAmountSold: grossNum,
            investedPortionSold: investedNum,
            date: saleDate || undefined,
          }
        : undefined,
    });
  }, [
    strategy,
    entries,
    selectedYear,
    accountType,
    saleEnabled,
    grossAmount,
    investedPortion,
    saleDate,
  ]);

  return (
    <>
      {/* ── Top controls (year + account type + print) — hidden when printing ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8 print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-2">
            Récap fiscal annuel
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Année fiscale {selectedYear}
          </h1>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          {/* Year selector */}
          <div>
            <label
              htmlFor="year-select"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Année
            </label>
            <YearLinks
              years={availableYears}
              selectedYear={selectedYear}
            />
          </div>

          {/* Account type selector */}
          <div>
            <label
              htmlFor="account-type"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Compte
            </label>
            <div
              id="account-type"
              className="inline-flex rounded-xl border border-slate-200/70 bg-white p-0.5"
              role="tablist"
              aria-label="Type de compte"
            >
              {(["PEA", "CTO"] as AccountType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={accountType === t}
                  onClick={() => setAccountType(t)}
                  className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                    accountType === t
                      ? "bg-slate-950 text-white"
                      : "text-gray-700 hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Print button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M5 3h6v3H5V3zm-1 4h8a1 1 0 0 1 1 1v4h-2v-2H4v2H2V8a1 1 0 0 1 1-1zm1 4h6v2H5v-2z"
                fill="currentColor"
              />
            </svg>
            Imprimer / PDF
          </button>
        </div>
      </div>

      {/* ── Print-only header — visible only when printing ── */}
      <div className="hidden print:block mb-8 pb-4 border-b border-slate-300">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
          DCA Tracker · Récap fiscal annuel
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          {firstName ? `${firstName} — ` : ""}Année fiscale {selectedYear} ({accountType})
        </h1>
      </div>

      {/* ── Snapshot of the year ── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Synthèse de l&apos;année
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Stat
            label="Total versé en"
            suffix={String(selectedYear)}
            value={formatFiscalEur(recap.contributedThisYear)}
          />
          <Stat
            label="Cumul versé fin"
            suffix={String(selectedYear)}
            value={formatFiscalEur(recap.cumulativeContributedToYearEnd)}
            sub={
              recap.peaCapReachedThisYear
                ? "⚠️ Plafond PEA 150 000 € atteint"
                : undefined
            }
          />
          <Stat
            label="Valeur portefeuille fin"
            suffix={String(selectedYear)}
            value={
              recap.yearEndPortfolioValue !== null
                ? formatFiscalEur(recap.yearEndPortfolioValue)
                : "Non renseignée"
            }
          />
          <Stat
            label="Plus-value latente"
            value={
              recap.latentGain !== null
                ? formatFiscalEur(recap.latentGain)
                : "—"
            }
            sub="Non taxable tant que pas vendu"
            valueColor={
              recap.latentGain !== null && recap.latentGain >= 0
                ? "text-emerald-700"
                : recap.latentGain !== null
                ? "text-red-600"
                : undefined
            }
          />
        </div>
      </section>

      {/* ── Sale form (the only thing that creates a tax event) ── */}
      <section className="mb-10 rounded-2xl border border-slate-200/70 bg-slate-50 p-5 print:hidden">
        <div className="flex items-start gap-3 mb-4">
          <input
            id="sale-enabled"
            type="checkbox"
            checked={saleEnabled}
            onChange={(e) => setSaleEnabled(e.target.checked)}
            className="mt-1 w-4 h-4 accent-primary-600 cursor-pointer"
          />
          <label htmlFor="sale-enabled" className="cursor-pointer flex-1">
            <p className="font-semibold text-gray-900 mb-1">
              J&apos;ai vendu une partie ou la totalité en {selectedYear}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Cochez si vous avez réalisé une vente cette année — c&apos;est
              le seul cas où une plus-value imposable est déclarée. Les
              versements DCA seuls ne génèrent pas d&apos;impôt.
            </p>
          </label>
        </div>

        {saleEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200/70">
            <Input
              label="Date de vente"
              id="sale-date"
              type="date"
              value={saleDate}
              onChange={setSaleDate}
              hint="Optionnel"
            />
            <Input
              label="Montant brut vendu (€)"
              id="gross-amount"
              type="text"
              inputMode="decimal"
              value={grossAmount}
              onChange={setGrossAmount}
              hint="Cash reçu de la cession (avant impôt)"
            />
            <Input
              label="Capital investi correspondant (€)"
              id="invested-portion"
              type="text"
              inputMode="decimal"
              value={investedPortion}
              onChange={setInvestedPortion}
              hint="Coût d'achat des parts vendues (votre IFU le précise)"
            />
          </div>
        )}
      </section>

      {/* ── Sale impact + declaration guide (only if sale active) ── */}
      {recap.saleResult && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Impact fiscal de la vente
          </h2>
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <Row
                label="Plus-value réalisée"
                value={formatFiscalEur(recap.saleResult.capitalGain)}
              />
              <Row
                label={`Impôt (${(recap.saleResult.taxRate * 100).toFixed(1).replace(".", ",")} %)`}
                value={`− ${formatFiscalEur(recap.saleResult.taxDue)}`}
                valueColor="text-red-600"
              />
              <Row
                label="Net après impôt"
                value={formatFiscalEur(recap.saleResult.netReceived)}
                bold
                valueColor="text-gray-900"
              />
            </div>
            <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-gray-500">
              Règle appliquée : {recap.saleResult.taxRuleLabel}
            </p>
          </div>

          {/* Declaration guide */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Guide de déclaration
          </h2>
          <div className="space-y-4">
            {recap.saleResult.declarationGuide.form2074.applicable && (
              <DeclCard
                form="2074"
                subtitle="Détail des plus-values mobilières"
                amount={formatFiscalEur(
                  recap.saleResult.declarationGuide.form2074.plusValueAmount
                )}
                amountLabel="Plus-value à reporter"
                note={recap.saleResult.declarationGuide.form2074.note}
              />
            )}
            {recap.saleResult.declarationGuide.form2042.map((c) => (
              <DeclCard
                key={c.caseId}
                form={`2042 case ${c.caseId}`}
                subtitle={c.label}
                amount={formatFiscalEur(c.amount)}
                amountLabel="Montant à reporter"
                note={c.note}
              />
            ))}
            {!recap.saleResult.declarationGuide.form2074.applicable &&
              recap.saleResult.declarationGuide.form2042.length === 0 && (
                <p className="text-sm text-gray-600">
                  Aucune déclaration de plus-value requise (pas de gain ou
                  cession en moins-value).
                </p>
              )}
          </div>
        </section>
      )}

      {/* ── Disclaimer (always visible, important legal copy) ── */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-8 text-xs text-amber-900 leading-relaxed">
        <p className="font-semibold mb-1">
          ⚠️ Cette synthèse est une aide à la déclaration, pas un document
          fiscal officiel.
        </p>
        <p>
          Les chiffres sont calculés à partir du suivi que vous tenez sur DCA
          Tracker. Pour la déclaration finale, utilisez l&apos;
          <strong>IFU</strong> (Imprimé Fiscal Unique) fourni par votre
          courtier comme document de référence — il fait foi auprès de la
          DGFiP. En cas de doute (cessions multiples, options PFU vs IR,
          dividendes, fiscalité internationale), consultez un
          expert-comptable ou un conseiller en gestion de patrimoine.
        </p>
      </section>

      {/* ── Stuff to know (educational, helps print readability) ── */}
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 print:border-slate-300">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          À savoir pour votre déclaration {selectedYear}
        </h2>
        <ul className="text-sm text-gray-700 space-y-2 leading-relaxed">
          <li>
            <strong>Les versements DCA seuls ne sont pas taxables.</strong>{" "}
            Vous payez de l&apos;impôt uniquement quand vous vendez et
            réalisez une plus-value.
          </li>
          <li>
            <strong>PEA &lt; 5 ans</strong> : clôture taxée au PFU 30 % comme
            un CTO. <strong>PEA ≥ 5 ans</strong> : seulement les prélèvements
            sociaux 17,2 % à la sortie.
          </li>
          <li>
            <strong>CTO</strong> : PFU 30 % constant sur les plus-values
            réalisées (12,8 % IR + 17,2 % social), peu importe la durée.
          </li>
          <li>
            <strong>Plafond PEA</strong> : 150 000 € de versements cumulés.
            La valorisation au-delà reste autorisée et avantageuse.
          </li>
          <li>
            <strong>IFU</strong> : votre courtier vous l&apos;envoie chaque
            année (généralement en mars). Il contient les chiffres officiels
            à reporter.
          </li>
        </ul>
      </section>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Stat({
  label,
  suffix,
  value,
  sub,
  valueColor = "text-gray-900",
}: {
  label: string;
  suffix?: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {label}
        {suffix && <span className="text-gray-400"> {suffix}</span>}
      </p>
      <p className={`text-2xl font-bold tabular-nums ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function Input({
  id,
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: "decimal" | "text" | "numeric";
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
      {hint && <p className="mt-1 text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}

function Row({
  label,
  value,
  valueColor = "text-gray-900",
  bold = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p
        className={`text-lg tabular-nums ${valueColor} ${bold ? "font-bold" : "font-semibold"}`}
      >
        {value}
      </p>
    </div>
  );
}

function DeclCard({
  form,
  subtitle,
  amount,
  amountLabel,
  note,
}: {
  form: string;
  subtitle: string;
  amount: string;
  amountLabel: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5">
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-0.5">
            Formulaire {form}
          </p>
          <p className="text-sm font-semibold text-gray-900">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{amountLabel}</p>
          <p className="text-xl font-bold text-gray-900 tabular-nums">{amount}</p>
        </div>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed border-t border-slate-100 pt-3">
        {note}
      </p>
    </div>
  );
}

// ─── Year link selector — uses ?year= query so the page can be re-fetched ──

function YearLinks({
  years,
  selectedYear,
}: {
  years: number[];
  selectedYear: number;
}) {
  if (years.length === 1) {
    return (
      <div className="inline-flex items-center px-4 py-1.5 rounded-xl border border-slate-200/70 bg-white text-sm font-semibold text-gray-700">
        {years[0]}
      </div>
    );
  }
  return (
    <div className="inline-flex rounded-xl border border-slate-200/70 bg-white p-0.5">
      {years.map((y) => (
        <Link
          key={y}
          href={`/account/recap-fiscal?year=${y}`}
          className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            y === selectedYear
              ? "bg-slate-950 text-white"
              : "text-gray-700 hover:bg-slate-50"
          }`}
        >
          {y}
        </Link>
      ))}
    </div>
  );
}
