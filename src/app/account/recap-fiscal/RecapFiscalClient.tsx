"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Strategy, MonthlyEntry } from "@/lib/user-strategy";
import {
  compileRecap,
  dateFr,
  type AccountType,
  type RecapData,
} from "@/lib/fiscal/recap";
import {
  formatFiscalEur,
  PEA_DEPOSIT_CAP_EUR,
  tauxAffiche,
} from "@/lib/fiscal/pea-cto";

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
  // PEA : le retrait a clôturé le plan. Seule une clôture rend déclarable la
  // perte d'un plan de plus de 5 ans.
  const [cloture, setCloture] = useState(false);
  // PEA : date du premier versement, qui fait partir le délai de 5 ans.
  // Vide = premier versement enregistré dans le suivi.
  const [peaFirstDeposit, setPeaFirstDeposit] = useState<string>("");

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
      peaFirstDepositDate: peaFirstDeposit || undefined,
      sale: saleValid
        ? {
            grossAmountSold: grossNum,
            investedPortionSold: investedNum,
            date: saleDate || undefined,
            cloture: accountType === "PEA" && cloture,
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
    cloture,
    peaFirstDeposit,
  ]);

  const isPea = accountType === "PEA";
  const anciennete = recap.anciennetePea;
  const irTaux = recap.bareme.cto.pfu - recap.bareme.cto.sociaux;

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
                ? `⚠️ Plafond PEA ${formatFiscalEur(PEA_DEPOSIT_CAP_EUR)} atteint`
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
              {isPea
                ? `J'ai retiré de l'argent de mon PEA en ${selectedYear}`
                : `J'ai vendu une partie ou la totalité en ${selectedYear}`}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {isPea ? (
                <>
                  Cochez si vous avez fait un retrait du plan cette année.
                  Vendre des titres à l&apos;intérieur du PEA sans retirer
                  l&apos;argent n&apos;est pas imposable : seul un retrait
                  l&apos;est. Les versements DCA seuls ne génèrent pas
                  d&apos;impôt.
                </>
              ) : (
                <>
                  Cochez si vous avez réalisé une vente cette année — c&apos;est
                  le seul cas où une plus-value imposable est déclarée. Les
                  versements DCA seuls ne génèrent pas d&apos;impôt.
                </>
              )}
            </p>
          </label>
        </div>

        {saleEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200/70">
            <Input
              label={isPea ? "Date du retrait" : "Date de vente"}
              id="sale-date"
              type="date"
              value={saleDate}
              onChange={setSaleDate}
              hint={
                isPea
                  ? `Obligatoire : elle fixe l'ancienneté du plan (règle des 5 ans) et doit tomber en ${selectedYear}`
                  : "Optionnel"
              }
            />
            <Input
              label={isPea ? "Montant brut retiré (€)" : "Montant brut vendu (€)"}
              id="gross-amount"
              type="text"
              inputMode="decimal"
              value={grossAmount}
              onChange={setGrossAmount}
              hint={
                isPea
                  ? "Avant les prélèvements retenus par votre établissement"
                  : "Cash reçu de la cession (avant impôt)"
              }
            />
            <Input
              label={
                isPea
                  ? "Versements correspondant au retrait (€)"
                  : "Capital investi correspondant (€)"
              }
              id="invested-portion"
              type="text"
              inputMode="decimal"
              value={investedPortion}
              onChange={setInvestedPortion}
              hint={
                isPea
                  ? // BOFiP BOI-RPPM-RCM-40-50-40, § 240 : les versements sont
                    // « diminué[s] du montant des sommes déjà retenues à ce
                    // titre lors des précédents retraits ». Jusqu'au 29/09/2026,
                    // la formule omettait ce terme et comptait deux fois les
                    // versements dès le deuxième retrait.
                    "Retrait partiel : montant retiré × (total versé − versements déjà pris en compte lors de vos retraits précédents) ÷ valeur du plan le jour du retrait. Retrait total : total versé − versements déjà pris en compte lors des retraits précédents. Votre établissement l'indique sur le relevé du retrait."
                  : "Coût d'achat des parts vendues (votre IFU le précise)"
              }
            />
            {isPea && (
              <div className="sm:col-span-3 flex items-start gap-3">
                <input
                  id="pea-cloture"
                  type="checkbox"
                  checked={cloture}
                  onChange={(e) => setCloture(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer"
                />
                <label htmlFor="pea-cloture" className="cursor-pointer text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold">Retrait total : ce retrait a clôturé le plan.</span>{" "}
                  Utile si le retrait est en perte : après 5 ans, seule la
                  clôture du plan permet de déclarer la perte.
                </label>
              </div>
            )}
            {isPea && (
              <div className="sm:col-span-3">
                <Input
                  label="Date du premier versement sur ce PEA"
                  id="pea-first-deposit"
                  type="date"
                  value={peaFirstDeposit}
                  onChange={setPeaFirstDeposit}
                  hint={
                    anciennete?.source === "suivi" && anciennete.premierVersement
                      ? `Par défaut : votre premier versement enregistré, le ${dateFr(anciennete.premierVersement)}. Le délai de 5 ans court à partir du premier versement sur le PEA : si le vôtre est plus ancien, indiquez sa date.`
                      : anciennete?.source === "suivi-mois" && anciennete.premierVersement
                        ? `Votre suivi ne donne que le mois du premier versement (${dateFr(anciennete.premierVersement)}). Le délai de 5 ans court à partir de sa date exacte : indiquez-la si le calcul le demande.`
                        : anciennete?.source === "saisie"
                          ? "C'est cette date qui fait partir le délai de 5 ans."
                          : anciennete?.source === "capital-anterieur"
                            ? `Votre stratégie inclut ${formatFiscalEur(recap.capitalAnterieur)} de capital déjà investi avant le début du suivi : votre premier versement sur le PEA est plus ancien que votre suivi. Indiquez sa date, c'est elle qui fait partir le délai de 5 ans.`
                            : "Aucun versement enregistré dans votre suivi. Le délai de 5 ans court à partir du premier versement sur le PEA : indiquez sa date."
                  }
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Sale entered but not computable: say why instead of guessing ── */}
      {recap.saleNonCalculee && (
        <section className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 leading-relaxed">
          <p className="font-semibold mb-1">Calcul impossible en l&apos;état</p>
          <p>{recap.saleNonCalculee}</p>
        </section>
      )}

      {/* ── Sale impact + declaration guide (only if sale active) ── */}
      {recap.saleResult && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isPea ? "Impact fiscal du retrait" : "Impact fiscal de la vente"}
          </h2>
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <Row
                label={isPea ? "Gain net du retrait" : "Plus-value réalisée"}
                value={formatFiscalEur(recap.saleResult.capitalGain)}
              />
              <Row
                label={recap.saleResult.taxLabel}
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
              Règle appliquée ({isPea ? "retrait" : "vente"} en {selectedYear}) :{" "}
              {recap.saleResult.taxRuleLabel}
              {anciennete?.premierVersement && (
                <>
                  {" "}· Premier versement sur le PEA :{" "}
                  {dateFr(anciennete.premierVersement)}
                </>
              )}
              .
              {recap.saleResult.paiementNote && ` ${recap.saleResult.paiementNote}`}
            </p>
          </div>

          {/* Declaration guide */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Guide de déclaration
          </h2>
          <div className="space-y-4">
            {recap.saleResult.declarationGuide.rienADeclarer && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 leading-relaxed">
                {recap.saleResult.declarationGuide.rienADeclarer}
              </div>
            )}
            {recap.saleResult.declarationGuide.form2042.map((c) => (
              <DeclCard
                key={c.caseId}
                form={`${c.form} case ${c.caseId}`}
                subtitle={c.label}
                amount={formatFiscalEur(c.amount)}
                amountLabel="Montant à reporter"
                note={c.note}
              />
            ))}
            {recap.saleResult.declarationGuide.form2074.applicable && (
              <DeclCard
                form="2074"
                subtitle={
                  recap.saleResult.declarationGuide.form2074.obligatoire
                    ? "Détail des plus-values mobilières"
                    : "Détail des plus-values mobilières — facultative dans le cas simple"
                }
                amount={formatFiscalEur(
                  Math.abs(recap.saleResult.declarationGuide.form2074.plusValueAmount)
                )}
                amountLabel={
                  recap.saleResult.declarationGuide.form2074.plusValueAmount < 0
                    ? "Moins-value"
                    : "Plus-value"
                }
                note={recap.saleResult.declarationGuide.form2074.note}
              />
            )}
          </div>
        </section>
      )}

      {/* ── Hypothèses et limites propres à ce récap ── */}
      {recap.avertissements.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-4 text-xs text-amber-900 leading-relaxed">
          <ul className="space-y-1">
            {recap.avertissements.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
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
            L&apos;imposition vient d&apos;une vente avec plus-value sur un
            CTO, ou d&apos;un retrait d&apos;argent d&apos;un PEA. Vendre
            des titres à l&apos;intérieur du PEA sans rien retirer n&apos;est
            pas imposable.
          </li>
          {recap.baremeConnu ? (
            <>
              <li>
                <strong>PEA de moins de 5 ans</strong> : un retrait fait en{" "}
                {selectedYear} supporte {tauxAffiche(irTaux)} % d&apos;impôt
                (ligne 3VT) et {tauxAffiche(recap.bareme.pea.sociaux)} % de
                prélèvements sociaux, et clôture en principe le plan.{" "}
                <strong>PEA de 5 ans ou plus</strong> : seulement{" "}
                {tauxAffiche(recap.bareme.pea.sociaux)} % de prélèvements
                sociaux, retenus par l&apos;établissement ; rien à déclarer.
              </li>
              <li>
                <strong>Délai de 5 ans</strong> : il court à partir de la date
                du premier versement sur le PEA, pas de l&apos;année civile.
              </li>
              <li>
                <strong>CTO</strong> : PFU de{" "}
                {tauxAffiche(recap.bareme.cto.pfu)} % sur les plus-values
                réalisées en {selectedYear} ({tauxAffiche(irTaux)} %
                d&apos;impôt + {tauxAffiche(recap.bareme.cto.sociaux)} % de
                prélèvements sociaux), quelle que soit la durée de détention.
              </li>
            </>
          ) : (
            <li>
              Les règles d&apos;avant 2018 (avant le prélèvement forfaitaire
              unique) ne sont pas modélisées : fiez-vous à l&apos;IFU de votre
              établissement.
            </li>
          )}
          <li>
            <strong>Plafond PEA</strong> :{" "}
            {formatFiscalEur(PEA_DEPOSIT_CAP_EUR)} de versements cumulés.
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
        {suffix && <span className="text-gray-500"> {suffix}</span>}
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
