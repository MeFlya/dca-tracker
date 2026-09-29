// Galerie d'aperçus visuels des fonctionnalités Premium.
//
// Pourquoi : un user gratuit qui lit "Analyse Monte Carlo (1 000 scénarios)"
// dans un tableau ne SAIT pas à quoi ça ressemble ni pourquoi ça vaut le coup.
// Cette section montre des mockups haute-fidélité de chaque feature → l'user
// VOIT la valeur avant de payer. C'est un levier de conversion direct.
//
// Choix : mockups construits en SVG/CSS (pas des captures d'écran) → responsive,
// on-brand, zéro maintenance quand l'UI réelle évolue. On pourra les remplacer
// par de vraies captures plus tard si on veut.
//
// Interactivité (sans JS) : card-hover (lift au survol), mockup qui zoome
// légèrement au group-hover, lignes des graphiques qui se dessinent au mount
// (animate-draw-line), points d'arrivée qui pulsent (SMIL). Donne un effet
// "vivant" sans alourdir (pas de "use client").

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { runBacktest, getAvailableRange, formatMonthFr } from "@/lib/backtest";
import { runMonteCarlo } from "@/lib/monte-carlo";
import { paramsFromSearch } from "@/lib/simulation-params";
import {
  computeFiscalComparison,
  formatFiscalEur,
  tauxAffiche,
} from "@/lib/fiscal/pea-cto";
import { currentYear } from "@/lib/strategy-math";

// ─── Mockup 1 : Suivi mensuel (le moat) ──────────────────────────────────────

function TrackingMockup() {
  return (
    <div className="w-full h-full bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Votre suivi · Mois 8
          </p>
          <p className="text-sm font-bold text-gray-900 tabular-nums">2 680 €</p>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full transition-transform group-hover:scale-105">
          +3,2 % vs projection
        </span>
      </div>
      <svg viewBox="0 0 200 64" className="w-full flex-1" preserveAspectRatio="none" aria-hidden>
        {/* Projeté (pointillé gris) */}
        <polyline
          points="4,54 32,49 60,44 88,38 116,31 144,25 172,18 196,12"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        {/* Réel (bleu plein) — se dessine au mount */}
        <polyline
          points="4,53 32,47 60,41 88,33 116,27 144,20 172,12 196,5"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-draw-line"
        />
        {[
          [4, 53], [32, 47], [60, 41], [88, 33], [116, 27], [144, 20], [172, 12],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.8" fill="#2563eb" />
        ))}
        {/* Point d'arrivée + ping */}
        <circle cx="196" cy="5" r="3" fill="#2563eb" />
        <circle cx="196" cy="5" r="3" fill="none" stroke="#2563eb" strokeWidth="1.5">
          <animate attributeName="r" from="3" to="9" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 border-t-2 border-blue-600 inline-block" /> Réel
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 border-t-2 border-dashed border-gray-300 inline-block" /> Projeté
        </span>
      </div>
    </div>
  );
}

// ─── Mockup 2 : Monte Carlo ──────────────────────────────────────────────────
//
// Calculé par runMonteCarlo (serveur, déterministe) sur les paramètres par
// défaut du simulateur (200 €/mois, 20 ans, 7 %/an, frais du CW8). Jusqu'au
// 29/09/2026, la maquette affichait « 68k€ · 102k€ · 158k€ » et « 87 % de
// plus-value », dessinés à la main : aucune combinaison de paramètres ne les
// reproduisait, et « 87 % de plus-value » se lisait comme un gain de 87 %.

const MOCK_MC = paramsFromSearch(new URLSearchParams()).input;

/** « 86 k€ » : milliers d'euros arrondis, espace insécable. */
const kEur = (v: number) => `${Math.round(v / 1000).toLocaleString("fr-FR")}\u00a0k€`;

function monteCarloMockData() {
  const mc = runMonteCarlo(MOCK_MC);
  // Courbes annuelles p10 / p50 / p90, mises à l'échelle du viewBox 200 × 64.
  const vmax = Math.max(...mc.data.map((d) => d.p90));
  const pas = 192 / Math.max(1, mc.data.length);
  const point = (i: number, v: number) =>
    `${Math.round((4 + i * pas) * 10) / 10} ${Math.round((60 - (v / vmax) * 54) * 10) / 10}`;
  const courbe = (cle: "p10" | "p50" | "p90") =>
    "M" + [point(0, 0), ...mc.data.map((d, i) => point(i + 1, d[cle]))].join(" L");
  const bas = [point(0, 0), ...mc.data.map((d, i) => point(i + 1, d.p10))];
  const cone = `${courbe("p90")} L${bas.reverse().join(" L")} Z`;
  return {
    hypothese: `${MOCK_MC.monthlyAmount} €/mois · ${MOCK_MC.durationYears} ans · ${MOCK_MC.annualReturnPct} %/an`,
    p10: kEur(mc.finalP10),
    p50: kEur(mc.finalP50),
    p90: kEur(mc.finalP90),
    part: `${mc.probabilityPositive} % des scénarios en plus-value`,
    p10Ligne: courbe("p10"),
    p50Ligne: courbe("p50"),
    p90Ligne: courbe("p90"),
    cone,
  };
}

function MonteCarloMockup() {
  const d = monteCarloMockData();
  return (
    <div className="w-full h-full bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
        1 000 marchés possibles · {d.hypothese}
      </p>
      <svg viewBox="0 0 200 64" className="w-full flex-1" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="mcMockArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {/* Cône de dispersion p10–p90 (runMonteCarlo) */}
        <path d={d.cone} fill="url(#mcMockArea)" />
        {/* p90 (scénario favorable) */}
        <path d={d.p90Ligne} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* p50 (médiane) — se dessine au mount */}
        <path d={d.p50Ligne} fill="none" stroke="#2563eb" strokeWidth="2" className="animate-draw-line" />
        {/* p10 (scénario défavorable) */}
        <path d={d.p10Ligne} fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2.5">
        <div className="flex gap-2.5 text-[10px]">
          <span className="text-orange-500 font-semibold tabular-nums">{d.p10}</span>
          <span className="text-blue-600 font-semibold tabular-nums">{d.p50}</span>
          <span className="text-emerald-600 font-semibold tabular-nums">{d.p90}</span>
        </div>
        <span className="text-[11px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full transition-transform group-hover:scale-105">
          {d.part}
        </span>
      </div>
    </div>
  );
}

// ─── Mockup 3 : Backtest historique ──────────────────────────────────────────
//
// Contrairement aux autres aperçus, celui-ci n'est pas dessiné à la main : la
// courbe et les chiffres sortent de runBacktest, sur la série publiée, pour le
// DCA que raconte /backtest-depuis-2010 (200 €/mois depuis janvier 2010).
// Jusqu'au 28/09/2026, il affichait « TRI 13 %/an · pire creux traversé −34 %
// (mars 2020) » : un chiffre en séance que le moteur, qui travaille en
// clôtures mensuelles, ne peut pas produire — présenté comme un résultat de
// l'outil qu'on vend.

const MOCK_BACKTEST = { monthlyAmount: 200, startMonth: "2010-01" } as const;

/** Un chiffre à une décimale, en typographie française : « 12,6 ». */
const un = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function backtestMockData() {
  const { max } = getAvailableRange();
  const r = runBacktest({ ...MOCK_BACKTEST, endMonth: max });
  // Courbe de la valeur du portefeuille, mise à l'échelle du viewBox 200 × 64.
  const vmax = Math.max(...r.series.map((p) => p.value));
  const pas = 192 / (r.series.length - 1);
  const pts = r.series.map((p, i) => ({
    month: p.month,
    x: Math.round((4 + i * pas) * 10) / 10,
    y: Math.round((58 - (p.value / vmax) * 52) * 10) / 10,
  }));
  const ligne = "M" + pts.map((p) => `${p.x} ${p.y}`).join(" L");
  const dd = r.maxDrawdown;
  const creux = dd ? pts.find((p) => p.month === dd.troughMonth) : undefined;
  return {
    periode: `${MOCK_BACKTEST.startMonth.slice(0, 4)} → ${max.slice(0, 4)}`,
    gain: `${r.gainPct >= 0 ? "+" : "−"}${Math.round(Math.abs(r.gainPct)).toLocaleString("fr-FR")} %`,
    tri: r.irrAnnualPct === null ? null : `${un(r.irrAnnualPct)} %/an`,
    recul: dd ? { pct: `−${un(dd.pct)} %`, mois: formatMonthFr(dd.troughMonth) } : null,
    ligne,
    aire: `${ligne} L196 64 L4 64 Z`,
    creux,
    fin: pts[pts.length - 1],
  };
}

function BacktestMockup() {
  const d = backtestMockData();
  return (
    <div className="w-full h-full bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          DCA réel · {d.periode}
        </p>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full tabular-nums transition-transform group-hover:scale-105">
          {d.gain}
        </span>
      </div>
      <svg viewBox="0 0 200 64" className="w-full flex-1" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="btMockArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Valeur réelle du portefeuille, mois par mois (runBacktest) */}
        <path d={d.aire} fill="url(#btMockArea)" />
        <path
          d={d.ligne}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-line"
        />
        {/* Marqueur du pire recul de la valeur */}
        {d.creux && <circle cx={d.creux.x} cy={d.creux.y} r="2.5" fill="#f97316" />}
        {/* Point d'arrivée + ping */}
        <circle cx={d.fin.x} cy={d.fin.y} r="3" fill="#2563eb" />
        <circle cx={d.fin.x} cy={d.fin.y} r="3" fill="none" stroke="#2563eb" strokeWidth="1.5">
          <animate attributeName="r" from="3" to="9" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
      {/* Mêmes libellés que l'outil (/backtest) : « Pire recul de la valeur »
          est le maxDrawdown, versements compris — pas une perte en séance. */}
      <p className="text-[10px] text-gray-500 mt-2">
        {d.tri && (
          <>
            TRI <strong className="text-gray-700">{d.tri}</strong>
          </>
        )}
        {d.tri && d.recul && " · "}
        {d.recul && (
          <>
            pire recul de la valeur{" "}
            <strong className="text-orange-600">{d.recul.pct}</strong> ({d.recul.mois})
          </>
        )}
      </p>
    </div>
  );
}

// ─── Mockup 4 : Récap fiscal annuel ──────────────────────────────────────────
// Compact (espacement serré) pour tenir dans la hauteur fixe sans déborder.
//
// Calculé par computeFiscalComparison (CTO, 1 240 € de plus-value, barème de
// l'année en cours), avec les lignes que le récap affiche pour ce cas. Jusqu'au
// 29/09/2026 : « À reporter case 2074 : 372 € », soit l'impôt à l'ancien PFU
// de 30 %, sous une ligne « 31,4 % » — alors que la 2074 reçoit la
// plus-value, pas l'impôt, et que « case 2042 » ne nomme aucune case.

const MOCK_FISCAL = { prixAchat: 10_000, prixVente: 11_240 } as const;

function fiscalMockData() {
  const annee = currentYear();
  const { cto } = computeFiscalComparison({
    totalInvested: MOCK_FISCAL.prixAchat,
    finalValue: MOCK_FISCAL.prixVente,
    holdingYears: 0,
    annee,
  });
  const gain = formatFiscalEur(cto.capitalGain);
  return {
    annee,
    rows: [
      { label: "Plus-value réalisée (CTO)", value: gain },
      { label: "2042 C, case 3VG", value: gain },
      { label: "2074 (facultative dans le cas simple)", value: gain },
      {
        label: `Impôt et prélèvements (${tauxAffiche(cto.taxRate)} %)`,
        value: formatFiscalEur(cto.taxDue),
      },
    ],
  };
}

function FiscalMockup() {
  const { annee, rows } = fiscalMockData();
  return (
    <div className="w-full h-full bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-gray-900">Récap fiscal {annee}</p>
        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded transition-transform group-hover:scale-105">
          PDF
        </span>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`flex items-center justify-between gap-2 text-[11px] ${
              i === rows.length - 1 ? "pt-1.5 border-t border-slate-100" : ""
            }`}
          >
            <span className="text-gray-500">{r.label}</span>
            <span className="font-semibold text-gray-900 tabular-nums">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({
  mockup,
  title,
  desc,
  badge,
}: {
  mockup: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 shadow-card card-hover">
      {/* Zone mockup — hauteur fixe pour aligner la grille. Le mockup zoome
          légèrement au survol de la carte (interactivité douce). */}
      <div className="h-[172px] mb-4 rounded-xl bg-gradient-to-br from-primary-50/50 via-white to-slate-50 p-3">
        <div className="w-full h-full transition-transform duration-200 group-hover:scale-[1.015]">
          {mockup}
        </div>
      </div>
      <div className="px-1 pb-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {badge && (
            <span className="text-[9px] font-bold uppercase tracking-wide text-primary-700 bg-primary-100 border border-primary-200 px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Public ───────────────────────────────────────────────────────────────────

export function PremiumFeatureShowcase() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <div className="text-center mb-10">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary-700 mb-3">
          <Sparkles size={14} />
          Concrètement
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          À quoi ressemble Premium
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
          Pas juste une ligne dans un tableau — voici ce que vous débloquez
          vraiment, et pourquoi ça change votre façon de piloter votre DCA.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FeatureCard
          mockup={<TrackingMockup />}
          title="Suivi mensuel de votre stratégie"
          badge="Le cœur de Premium"
          desc="Chaque mois, comparez votre portefeuille réel à votre projection théorique. Vous savez si vous êtes en avance, en retard, et de combien — avec un email récap automatique."
        />
        <FeatureCard
          mockup={<MonteCarloMockup />}
          title="Analyse Monte Carlo"
          desc="1 000 trajectoires de marché simulées avec une volatilité supposée de 15 %/an. Vous voyez un scénario défavorable réaliste, un scénario favorable et la part des scénarios qui finissent en plus-value."
        />
        <FeatureCard
          mockup={<BacktestMockup />}
          title="Backtest historique"
          badge="Nouveau"
          desc="Ce qu'aurait VRAIMENT donné votre DCA sur les données réelles du MSCI World depuis 2008 — krach de 2008, COVID et 2022 inclus. TRI calculé, pire creux affiché. Pas une projection théorique : du réel."
        />
        <FeatureCard
          mockup={<FiscalMockup />}
          title="Récap fiscal annuel"
          desc="Pour une vente ou un retrait que vous saisissez, une synthèse PDF calcule l'impôt au barème de l'année et les montants à reporter (2042 C, et 2074 si besoin), selon votre situation PEA ou CTO."
        />
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500 mb-4">
          Et aussi : comparaison A vs B, 10 simulations sauvegardées, export PDF
          sans filigrane, support email.
        </p>
        <Link
          href="#premium"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
        >
          Voir les tarifs Premium ↑
        </Link>
      </div>
    </section>
  );
}
