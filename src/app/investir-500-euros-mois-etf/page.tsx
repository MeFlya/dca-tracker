import type { Metadata } from "next";
import { ETF_LIST, TER_REFERENCE_SIMULATEUR } from "@/lib/etf-config";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";
import { EtapeSuivante } from "@/components/ui/EtapeSuivante";
import { RenvoiProduit } from "@/components/products/RenvoiProduit";
import { CeQuAuraitDonne } from "@/components/backtest/CeQuAuraitDonne";
import { SerieMontants } from "@/components/money/SerieMontants";
import { runSimulation, SCENARIO_DELTA } from "@/lib/simulator";
import {
  PEA_DEPOSIT_CAP_EUR,
  PFU_RATE,
  SOCIAL_CHARGES_RATE,
} from "@/lib/fiscal/pea-cto";
import {
  impotPEA,
  impotCTO,
  netApresPEA,
  netApresCTO,
  ecartFiscal,
  ecartFiscalEnviron,
} from "@/lib/impot-affiche";

// ─── Moteur ───────────────────────────────────────────────────────────────────
//
// Correctif du 28/09/2026. Tous les montants de la page étaient écrits à la
// main, calculés sans aucun frais (260 500 € à 20 ans), alors que le
// bouton « Simuler » ouvre le simulateur avec le TER de CW8 : le lecteur
// cliquait et tombait sur un autre chiffre. Désormais UN SEUL TER, celui du
// lien vers le simulateur, et chaque projection sort de runSimulation.

const MENSUEL = 500;
const RENDEMENT = 7;
const DUREE = 20;
const TER = TER_REFERENCE_SIMULATEUR;

/** WPEA et DCAM : 0,20 % d'après la table de vérité du 28/09/2026. Lu dans
 *  ETF_LIST pour suivre la config ; la valeur de repli est la même. */
const TER_MONDE_PEA_BAS =
  ETF_LIST.find((e) => e.displaySymbol === "WPEA")?.ter ?? 0.2;

const SIMULATEUR_HREF = `/simulateur?monthly=${MENSUEL}&years=${DUREE}&return=${RENDEMENT}&fees=${TER}`;

function sim(years: number, fees = TER, monthly = MENSUEL) {
  return runSimulation({
    monthlyAmount: monthly,
    durationYears: years,
    annualReturnPct: RENDEMENT,
    annualFeesPct: fees,
  });
}

/** 97753 → « 97 753 ». Séparateur de milliers en espace, comme le reste du site. */
const fmt = (v: number) =>
  String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
/** Une projection à vingt ans ne se donne pas à l'euro : centaine la plus proche. */
const environ = (v: number) => Math.round(v / 100) * 100;
const eur = (v: number) => `${fmt(environ(v))} €`;
const signe = (v: number) =>
  v === 0 ? "—" : `${v > 0 ? "+" : "−"}${fmt(Math.abs(environ(v)))} €`;
const pctGain = (final: number, verse: number) =>
  `+${Math.round(((final - verse) / verse) * 100)} %`;
/** 0.186 → « 18,6 » : les taux viennent du barème, jamais écrits à la main. */
const taux = (t: number) => (t * 100).toFixed(1).replace(".", ",").replace(/,0$/, "");
/** 0.38 → « 0,38 ». */
const terAffiche = (t: number) => t.toFixed(2).replace(".", ",");
/** 2.24 → « 2,2 ». */
const unDecimal = (v: number) => v.toFixed(1).replace(".", ",");

// Scénario central : 20 ans. Le capital est arrondi à la centaine AVANT de
// calculer le gain et l'impôt, pour que « versé + gain = capital » et
// « capital − impôt = net » restent vrais à l'œil sur la page.
const S20 = sim(DUREE);
const FINAL_20 = environ(S20.base.finalValue);
const VERSE_20 = S20.base.totalInvested;
const GAIN_20 = FINAL_20 - VERSE_20;

// Écart d'impôt PEA / CTO sur ce gain, exprimé en mois de versements.
const MOIS_ECONOMISES = Math.floor((GAIN_20 * (PFU_RATE - SOCIAL_CHARGES_RATE)) / MENSUEL);

// Plafond de versements du PEA, atteint en N ans à 500 €/mois.
const ANS_PLAFOND_PEA = PEA_DEPOSIT_CAP_EUR / (MENSUEL * 12);

// Commencer dans 5 ans : 15 ans de versements au lieu de 20.
const FINAL_15 = environ(sim(DUREE - 5).base.finalValue);
const VERSE_15 = sim(DUREE - 5).base.totalInvested;
const PERTE_RETARD = FINAL_20 - FINAL_15;
const MOINS_VERSE = VERSE_20 - VERSE_15;
const INTERETS_PERDUS = PERTE_RETARD - MOINS_VERSE;

// Arrêter après 10 ans : le capital de l'année 10 continue seul 10 ans de
// plus, sans nouveau versement.
const FINAL_10 = sim(10).base.finalValue;
const ARRET_10 = runSimulation({
  monthlyAmount: 0,
  durationYears: DUREE - 10,
  annualReturnPct: RENDEMENT,
  annualFeesPct: TER,
  startingCapital: FINAL_10,
}).base.finalValue;

// 100 €/mois de plus pendant 20 ans : ce que ces 100 € deviennent seuls.
const PLUS_100 = sim(DUREE, TER, 100).base.finalValue;

// Écart de frais sur 20 ans à 500 €/mois : 0,1 point, puis WPEA/DCAM vs CW8.
const ECART_01_POINT =
  sim(DUREE, TER_MONDE_PEA_BAS).base.finalValue -
  sim(DUREE, TER_MONDE_PEA_BAS + 0.1).base.finalValue;
// Sur les capitaux arrondis, pour tomber juste avec le tableau des frais.
const ECART_WPEA_CW8 =
  environ(sim(DUREE, TER_MONDE_PEA_BAS).base.finalValue) - FINAL_20;

const TITLE =
  "Investir 500 €/mois en ETF : combien après 10, 20, 30 ans ?";
const DESCRIPTION =
  // L'ancienne meta donnait toute la réponse dans l'extrait Google (260 500 €,
  // calculé sans les frais que le simulateur applique). Le chiffre reste,
  // calculé ; la raison de cliquer est ce que l'extrait ne peut pas livrer.
  `500 €/mois en ETF : ≈ ${eur(FINAL_20)} en 20 ans à 7 %/an. Et ce que le même effort aurait vraiment donné depuis 2008, krach compris.`;
const CANONICAL = "/investir-500-euros-mois-etf";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "article",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// Les trois rendements sont ceux du simulateur (7 %/an ± SCENARIO_DELTA), pour
// que les tableaux et l'écran du simulateur affichent les mêmes nombres.
const DUREES_SCENARIOS = [10, 15, 20, 25, 30] as const;
const SIMS_SCENARIOS = DUREES_SCENARIOS.map((y) => ({ y, s: sim(y) }));

const SCENARIOS = (
  [
    { cle: "conservative", label: "Prudent", delta: -SCENARIO_DELTA, color: "text-orange-600", bg: "bg-orange-50 border-orange-100", highlight: false },
    { cle: "base", label: "Réaliste", delta: 0, color: "text-primary-700", bg: "bg-primary-50 border-primary-100", highlight: true },
    { cle: "optimistic", label: "Optimiste", delta: SCENARIO_DELTA, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", highlight: false },
  ] as const
).map(({ cle, label, delta, color, bg, highlight }) => ({
  label,
  rate: `${RENDEMENT + delta} %/an`,
  color,
  bg,
  highlight,
  rows: SIMS_SCENARIOS.map(({ y, s }) => ({
    y,
    final: eur(s[cle].finalValue),
    pct: pctGain(s[cle].finalValue, s[cle].totalInvested),
  })),
}));

const S20_PRUDENT = SIMS_SCENARIOS[2].s.conservative.finalValue;
const S20_OPTIMISTE = SIMS_SCENARIOS[2].s.optimistic.finalValue;

// Progression année par année à 7 %/an, lue dans le moteur (versement en
// début de mois, frais déduits). L'ancien tableau appliquait la formule
// FV = 500 × ((1+r/12)^(12y) − 1) / (r/12) sans aucun frais (28/09/2026).
const S30 = sim(30).base;
const YEARLY_PROGRESSION = [1, 5, 10, 15, 20, 25, 30].map((year) => {
  const point = S30.monthlyData.find((d) => d.year === year)!;
  const value = environ(point.portfolioValue);
  return {
    year,
    invested: `${fmt(point.invested)} €`,
    value: `${fmt(value)} €`,
    gains: signe(value - point.invested),
  };
});
const FINAL_30 = environ(S30.finalValue);
const VERSE_30 = S30.totalInvested;
const MULTIPLE_20_30 = FINAL_30 / FINAL_20;

// Règle des 4 % : capital nécessaire pour une rente donnée, puis nombre
// d'années de versements pour l'atteindre, demandé au moteur. L'ancien
// tableau (22, 27, 30 ans) et la FAQ (« 500 000 € en 25 ans ») étaient
// calculés sans frais (28/09/2026).
function anneesPour(capitalVise: number): number {
  let y = 1;
  while (y < 60 && sim(y).base.finalValue < capitalVise) y++;
  return y;
}
const RENTES = [1000, 1500, 2000].map((mensuelle) => {
  const capital = (mensuelle * 12) / 0.04;
  return { mensuelle, capital, annees: anneesPour(capital) };
});
const CAPITAL_FIRE = 500_000;
const RENTE_FIRE_AN = CAPITAL_FIRE * 0.04;

// Tableau des frais : le TER du simulateur (CW8), celui de WPEA/DCAM, un
// plancher à 0,10 % et 1 %. L'ancien tableau prenait 0,3 % comme ligne
// « 260 500 € », soit le capital SANS frais : il ne correspondait à aucune
// ligne réelle (28/09/2026).
const FRAIS = [
  { ter: 0.1, label: "0,10 %" },
  { ter: TER_MONDE_PEA_BAS, label: `${terAffiche(TER_MONDE_PEA_BAS)} % (WPEA, DCAM)` },
  { ter: TER, label: `${terAffiche(TER)} % (CW8, TER du simulateur)` },
  { ter: 1, label: "1 %" },
].map(({ ter, label }) => ({ label, final: environ(sim(DUREE, ter).base.finalValue) }));
const FRAIS_REF = FRAIS[0].final;

const FAQ = [
  {
    q: "Combien vaut 500€ par mois investi en ETF sur 20 ans ?",
    // « proche de la performance historique d'un ETF MSCI World » retiré le
    // 28/09/2026 : 7 %/an est une hypothèse de la page, pas une donnée vérifiée.
    a: `Avec une hypothèse de rendement moyen de 7 %/an et ${terAffiche(TER)} % de frais annuels (TER de CW8), 500 €/mois pendant 20 ans donnent environ ${eur(FINAL_20)}. Vous avez versé ${eur(VERSE_20)} ; les ${eur(GAIN_20)} restants viennent des intérêts composés. À ${RENDEMENT - SCENARIO_DELTA} %/an, le capital final est d'environ ${eur(S20_PRUDENT)} ; à ${RENDEMENT + SCENARIO_DELTA} %/an, il atteint environ ${eur(S20_OPTIMISTE)}.`,
  },
  {
    q: "Est-ce que 500€ par mois permet d'atteindre l'indépendance financière ?",
    a: `Partiellement. Avec la règle des 4 % (retrait annuel de 4 % du capital), ${fmt(CAPITAL_FIRE)} € de capital donnent environ ${fmt(RENTE_FIRE_AN)} €/an, soit environ ${fmt(Math.round(RENTE_FIRE_AN / 12 / 10) * 10)} €/mois. À 500 €/mois et 7 %/an (TER ${terAffiche(TER)} %), il faut environ ${anneesPour(CAPITAL_FIRE)} ans de versements pour atteindre ce capital. Ce n'est pas une retraite anticipée complète, c'est un complément de revenu significatif.`,
  },
  {
    q: "PEA ou CTO pour investir 500€ par mois ?",
    a: `Pour un résident français, le PEA l'emporte presque toujours sur ce montant. Plafond de versement : ${fmt(PEA_DEPOSIT_CAP_EUR)} €, atteint en ${ANS_PLAFOND_PEA} ans à 500 €/mois. Fiscalité après 5 ans : ${taux(SOCIAL_CHARGES_RATE)} % de prélèvements sociaux uniquement, contre ${taux(PFU_RATE)} % de flat tax sur un CTO. Sur 20 ans avec environ ${eur(GAIN_20)} de gains, la différence représente environ ${ecartFiscalEnviron(GAIN_20)} € d'impôt en moins. Une fois le plafond du PEA atteint, les versements suivants passent sur un CTO.`,
  },
  {
    q: "Quel impact si j'augmente à 600€/mois ?",
    a: `100 €/mois supplémentaires sur 20 ans à 7 %/an (TER ${terAffiche(TER)} %) = environ ${eur(PLUS_100)} de capital final en plus, pour ${eur(sim(DUREE, TER, 100).base.totalInvested)} versés. C'est l'effet combiné du temps et des intérêts composés : augmenter ses versements au fil des hausses de revenu est l'un des leviers les plus puissants.`,
  },
  {
    q: "Que se passe-t-il si j'arrête après 10 ans ?",
    a: `Avec 500 €/mois pendant 10 ans (${eur(sim(10).base.totalInvested)} versés), puis 10 ans sans nouveau versement, le capital atteint environ ${eur(ARRET_10)} au bout de 20 ans à 7 %/an (TER ${terAffiche(TER)} %), contre ${eur(FINAL_20)} en continuant. Écart : environ ${eur(FINAL_20 - environ(ARRET_10))}. La seconde moitié de la période est la plus productive : c'est là que les intérêts composés travaillent le plus.`,
  },
  {
    q: "Quels ETF concrets pour investir 500€/mois en PEA ?",
    // Corrigé le 28/09/2026 d'après la table de vérité (émetteurs + justETF) :
    // l'Amundi 500 (LU1681048804) et AEEM (LU1681045370) étaient présentés
    // comme éligibles au PEA — ils ne le sont pas (reporting Amundi du
    // 31/08/2026 : compte-titres et assurance-vie). « Imbattable côté frais »
    // et « l'un des rares ETF émergents éligibles » retirés : non vérifiables.
    a: `En PEA, les ETF MSCI World de notre sélection sont WPEA et DCAM (TER ${terAffiche(TER_MONDE_PEA_BAS)} %) et CW8 (TER ${terAffiche(TER)} %). IWDA, lui, n'est PAS éligible au PEA : il se loge en CTO. Pour ajouter une part d'actions américaines, les S&P 500 éligibles PEA de notre sélection sont SPEA (TER 0,10 %, le moins cher des trois), PSP5 (0,12 %) et ESE (0,14 %) ; l'Amundi S&P 500 « 500 » n'est pas éligible PEA. Pour les pays émergents, l'ETF éligible PEA est PAEEM (Amundi PEA Emergent ESG Transition, TER 0,30 %) ; AEEM ne l'est pas. Autre option : GPEA (Amundi PEA Global, MSCI ACWI, émergents inclus, TER 0,30 %), qui couvre le monde entier en une seule ligne.`,
  },
  {
    q: "Faut-il privilégier un seul gros versement mensuel ou fractionner ?",
    // « Les études montrent un écart de moins de 0,1 % » retiré le 28/09/2026 :
    // aucune source citée ni vérifiable.
    a: "À 500 €/mois, fractionner en deux versements de 250 € (le 1er et le 15, par exemple) lisse très légèrement le point d'entrée, mais double les ordres passés, donc les frais de courtage éventuels. Sur 20 ans, ce qui pèse est la régularité des versements, pas leur date dans le mois : un versement automatique calé sur la date de paie est le plus simple à tenir.",
  },
];

export default function Investir500Page() {
  const siteUrl = "https://dcatracker.fr";

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />

      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600">Investir 500 €/mois en ETF</span>
      </nav>

      {/* Hero */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Investir 500 € par mois en ETF
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-8">
        Simulation complète d&apos;un versement mensuel de 500 € dans un ETF
        type MSCI World, sur 10 à 30 ans, avec intérêts composés et{" "}
        {terAffiche(TER)} % de frais annuels. Projections à{" "}
        {RENDEMENT - SCENARIO_DELTA}, {RENDEMENT} et{" "}
        {RENDEMENT + SCENARIO_DELTA} %/an — les trois scénarios du
        simulateur.
      </p>

      <ArticleByline
        publishedAt="2026-04-19"
        updatedAt="2026-09-28"
        readingMinutes={8}
        url="/investir-500-euros-mois-etf"
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* Flagship result */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-6 sm:p-8 mb-10 text-white">
        <p className="text-xs font-semibold text-primary-200 uppercase tracking-wider mb-2">
          Scénario réaliste — 20 ans
        </p>
        <p className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight mb-2">
          {eur(FINAL_20)}
        </p>
        <p className="text-sm text-primary-100 leading-relaxed">
          500 €/mois pendant 20 ans à 7 %/an, TER {terAffiche(TER)} %. Vous
          aurez versé <strong>{eur(VERSE_20)}</strong>. Les{" "}
          <strong>{eur(GAIN_20)}</strong> restants viennent des intérêts
          composés.
        </p>
        <Link
          href={SIMULATEUR_HREF}
          className="btn-white-primary mt-5 btn-lift"
        >
          Simuler ma propre version →
        </Link>
      </div>

      {/* Capacité d'épargne — angle "à qui ça parle" */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        500 €/mois : à partir de quel revenu c&apos;est réaliste ?
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        L&apos;effort d&apos;épargne se mesure en pourcentage du revenu net,
        pas en valeur absolue. Voici les profils-type pour qui 500 €/mois
        correspond à un taux d&apos;épargne sain (ni trop ambitieux, ni
        sous-utilisé) :
      </p>
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">Revenu net mensuel</th>
                <th className="text-right px-4 py-2.5 font-semibold">500 € représente</th>
                <th className="text-left px-4 py-2.5 font-semibold">Niveau d&apos;effort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-2.5 text-gray-700">2 000 €</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-orange-600">25 %</td>
                <td className="px-4 py-2.5 text-orange-600">Très ambitieux — possible mais demande un budget serré</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-gray-700">3 000 €</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-amber-600">17 %</td>
                <td className="px-4 py-2.5 text-amber-700">Engagé — un budget suivi de près</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="px-4 py-2.5 text-gray-700">4 000 €</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-700">12,5 %</td>
                <td className="px-4 py-2.5 text-emerald-700 font-medium">Confortable — taux d&apos;épargne sain</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-gray-700">5 000 €+</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-700">≤ 10 %</td>
                <td className="px-4 py-2.5 text-gray-600">Modéré — une marge reste disponible</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* « Taux d'épargne médian ≈ 15 % (INSEE, 2024) » retiré le 28/09/2026 :
          chiffre non sourcé précisément et non vérifié. */}
      <p className="text-xs text-gray-500 leading-relaxed mb-10">
        500 €/mois constituent un objectif atteignable pour un revenu net
        entre 3 000 € et 4 500 €, c&apos;est-à-dire un cadre solo en région
        ou un couple double-revenu moyen. Au-delà, chaque tranche de 100 €
        supplémentaires représente environ {eur(PLUS_100)} de plus à 20 ans
        (7 %/an, TER {terAffiche(TER)} %).
      </p>

      {/* Scenarios grid */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Projection selon votre horizon et votre rendement cible
      </h2>
      <div className="space-y-3 mb-10">
        {SCENARIOS.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border px-5 py-5 ${s.bg} ${s.highlight ? "ring-2 ring-primary-500 ring-offset-2" : ""}`}
          >
            <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
              <p className={`text-base font-bold ${s.color}`}>
                {s.label} — <span className="font-semibold">{s.rate}</span>
              </p>
              {s.highlight && (
                <span className="text-[10px] font-bold bg-primary-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Scénario central
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="text-left font-semibold py-1">Durée</th>
                    <th className="text-right font-semibold py-1">Capital final</th>
                    <th className="text-right font-semibold py-1">Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {s.rows.map((r) => (
                    <tr key={r.y}>
                      <td className="py-1.5 text-gray-600">{r.y} ans</td>
                      <td className="py-1.5 text-right font-semibold text-gray-900 tabular-nums">{r.final}</td>
                      <td className={`py-1.5 text-right text-xs tabular-nums font-medium ${s.color}`}>{r.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Yearly progression — concrete, year-by-year breakdown */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        La progression année par année (scénario 7 %/an)
      </h2>
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">
        Voici l&apos;effet des intérêts composés sur 30 ans, avec{" "}
        {terAffiche(TER)} % de frais annuels. Notez la moitié droite de la
        courbe : entre l&apos;année 20 et l&apos;année 30, le capital est
        multiplié par {unDecimal(MULTIPLE_20_30)} — alors que vous ne versez
        que {fmt(VERSE_30 - VERSE_20)} € de plus.
      </p>
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">Année</th>
                <th className="text-right px-4 py-2.5 font-semibold">Total versé</th>
                <th className="text-right px-4 py-2.5 font-semibold">Capital final</th>
                <th className="text-right px-4 py-2.5 font-semibold">Intérêts composés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {YEARLY_PROGRESSION.map((y) => (
                <tr
                  key={y.year}
                  className={y.year === 20 ? "bg-primary-50/40" : undefined}
                >
                  <td className="px-4 py-2.5 text-gray-700 font-medium">{y.year} {y.year > 1 ? "ans" : "an"}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600 tabular-nums">{y.invested}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-900 tabular-nums">{y.value}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-700 tabular-nums font-medium">{y.gains}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mb-10">
        Calculs du simulateur : capitalisation mensuelle, frais déduits.
        À l&apos;année 30, sur les {fmt(FINAL_30)} € de capital, vous
        n&apos;aurez versé que {fmt(VERSE_30)} € de votre
        propre poche — le reste est intégralement généré par les intérêts
        composés. C&apos;est ce qui rend le DCA puissant uniquement sur le
        long terme.
      </p>

      {/* FIRE angle */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Ce que 500 €/mois peut vous offrir à long terme
      </h2>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-10">
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          En appliquant la <strong>règle des 4 %</strong> (taux de retrait
          annuel considéré comme sûr sur un portefeuille ETF) à votre capital
          final :
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Rente mensuelle visée</th>
                <th className="text-left px-3 py-2 font-semibold">Capital nécessaire</th>
                <th className="text-left px-3 py-2 font-semibold">Durée à 500 €/mois</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RENTES.map((r) => (
                <tr key={r.mensuelle}>
                  <td className="px-3 py-2">{fmt(r.mensuelle)} €/mois</td>
                  <td className="px-3 py-2 font-semibold tabular-nums">{fmt(r.capital)} €</td>
                  <td className="px-3 py-2 text-gray-500">~{r.annees} ans à 7 %/an</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
          Ces projections sont théoriques et supposent un rendement annuel
          moyen constant, frais de {terAffiche(TER)} % déduits — la réalité
          est plus volatile. L&apos;analyse Monte Carlo du simulateur
          confronte la même stratégie à 1 000 marchés simulés.
        </p>
      </div>

      {/* Fees impact */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        L&apos;impact des frais (souvent sous-estimé)
      </h2>
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Frais annuels</th>
                <th className="text-right px-3 py-2 font-semibold">Capital final (20 ans, 7 %)</th>
                <th className="text-right px-3 py-2 font-semibold">Écart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {FRAIS.map((f, i) => (
                <tr key={f.label}>
                  <td className="px-3 py-2">{f.label}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{fmt(f.final)} €</td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums ${
                      i === 0 ? "text-emerald-600" : i === FRAIS.length - 1 ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    {i === 0 ? "référence" : signe(f.final - FRAIS_REF)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Corrigé le 28/09/2026 d'après la table de vérité : l'ancien texte
          conseillait « les ETF à TER inférieur à 0,3 % — types CW8 (0,38 %),
          500 (0,15 %), IWDA (0,20 %) ». CW8 dépasse ce seuil ; 500 et IWDA ne
          sont pas éligibles au PEA. */}
      <p className="text-sm text-gray-600 leading-relaxed mb-10">
        Sur 20 ans à 500 €/mois, chaque 0,1 point de frais supplémentaire
        coûte environ {eur(ECART_01_POINT)}. Parmi les ETF MSCI World
        éligibles au PEA de notre sélection, WPEA et DCAM sont à{" "}
        {terAffiche(TER_MONDE_PEA_BAS)} %, CW8 à {terAffiche(TER)} % : un
        écart d&apos;environ {eur(ECART_WPEA_CW8)} sur la période. IWDA
        (0,20 %) n&apos;est pas éligible au PEA : il se loge en CTO.
      </p>

      {/* PEA vs CTO sur 20 ans */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        PEA ou CTO sur 20 ans : ça change combien ?
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        Au scénario réaliste ({eur(FINAL_20)} au bout de 20 ans, dont{" "}
        {eur(GAIN_20)} de plus-values), le choix de l&apos;enveloppe fiscale fait une vraie
        différence sur le net qui finit dans votre poche :
      </p>
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">Enveloppe</th>
                <th className="text-right px-4 py-2.5 font-semibold">Plus-values</th>
                <th className="text-right px-4 py-2.5 font-semibold">Imposition</th>
                <th className="text-right px-4 py-2.5 font-semibold">Net après impôt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-emerald-50/40">
                <td className="px-4 py-2.5">
                  <p className="text-gray-700 font-medium">PEA (≥ 5 ans)</p>
                  <p className="text-xs text-gray-500">Prélèvements sociaux uniquement</p>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{eur(GAIN_20)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-emerald-700 font-medium">−{impotPEA(GAIN_20)} € ({taux(SOCIAL_CHARGES_RATE)} %)</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-gray-900">{netApresPEA(FINAL_20, GAIN_20)} €</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5">
                  <p className="text-gray-700 font-medium">CTO</p>
                  <p className="text-xs text-gray-500">Flat tax (PFU) {taux(PFU_RATE)} %</p>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{eur(GAIN_20)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-red-600 font-medium">−{impotCTO(GAIN_20)} € ({taux(PFU_RATE)} %)</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-gray-900">{netApresCTO(FINAL_20, GAIN_20)} €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-2">
        <strong className="text-emerald-700">Économie via PEA : {ecartFiscal(GAIN_20)} €</strong> sur 20 ans —
        l&apos;équivalent de {MOIS_ECONOMISES} mois de versements à 500 €/mois,
        par le seul choix de l&apos;enveloppe.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        <strong>Attention au plafond du PEA</strong> : {fmt(PEA_DEPOSIT_CAP_EUR)} € de
        versements maximum. À 500 €/mois, il est atteint en{" "}
        <strong>{ANS_PLAFOND_PEA} ans exactement</strong>. Au-delà, les
        versements suivants passent sur un CTO, imposé au PFU.
      </p>
      <Link
        href="/calculateur-fiscal-pea-cto"
        className="inline-flex items-center gap-1 text-sm text-primary-700 font-semibold hover:text-primary-800 transition-colors mb-10"
      >
        Calculer pour vos chiffres exacts →
      </Link>

      {/* Coût de l'attente */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Le coût de l&apos;attente : commencer maintenant vs dans 5 ans
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        L&apos;intuition trompe ici. Reporter de 5 ans le démarrage de votre
        DCA ne coûte pas seulement les {fmt(MOINS_VERSE)} € que vous n&apos;avez pas
        versés sur cette période — ça coûte beaucoup plus, parce que ces
        premières années sont celles où les intérêts composés ont le plus de
        temps pour travailler.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
            Vous démarrez maintenant
          </p>
          <p className="text-3xl font-bold text-emerald-900 tabular-nums mb-1">{eur(FINAL_20)}</p>
          <p className="text-xs text-emerald-800 leading-relaxed">
            500 €/mois × 20 ans à 7 %/an, TER {terAffiche(TER)} %. Versé :{" "}
            {eur(VERSE_20)}. Gains : {eur(GAIN_20)}.
          </p>
        </div>
        <div className="rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-5">
          <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">
            Vous démarrez dans 5 ans
          </p>
          <p className="text-3xl font-bold text-orange-900 tabular-nums mb-1">{eur(FINAL_15)}</p>
          <p className="text-xs text-orange-800 leading-relaxed">
            500 €/mois × 15 ans à 7 %/an, sur le même horizon de 20 ans
            (5 ans d&apos;attente + 15 ans de DCA). Versé : {eur(VERSE_15)}.
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-2">
        {/* « 3 fois cette somme » corrigé le 28/09/2026 : le rapport vient
            désormais du moteur, frais inclus. */}
        <strong className="text-red-600">Coût de 5 ans d&apos;attente : {eur(PERTE_RETARD)}</strong> de
        capital final perdu. Vous économisez {fmt(MOINS_VERSE)} € de
        versements, mais vous renoncez à environ {eur(INTERETS_PERDUS)}{" "}
        d&apos;intérêts composés non générés, soit{" "}
        <strong>{unDecimal(INTERETS_PERDUS / MOINS_VERSE)} fois cette somme</strong>.
      </p>
      <p className="text-sm text-gray-500 leading-relaxed mb-10">
        C&apos;est mathématique : les premiers euros versés sont ceux qui ont
        le plus de temps devant eux pour fructifier. Un euro versé à
        l&apos;année 1 vaut bien plus à terme qu&apos;un euro versé à
        l&apos;année 6 — même avec le même horizon final.
      </p>

      <CeQuAuraitDonne monthlyAmount={500} />
      <SerieMontants courant={500} />

      {/* FAQ */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
      <div className="space-y-3 mb-10">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group rounded-xl border border-gray-100 bg-white p-4 open:bg-gray-50/50">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-900">{q}</span>
              <span className="text-gray-500 group-open:rotate-180 transition-transform" aria-hidden>▾</span>
            </summary>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center mb-10">
        <p className="text-base font-bold text-gray-900 mb-2">
          Simulez votre stratégie personnelle
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Ajustez montant, durée, rendement et frais. Voyez la projection
          instantanément — avec les 3 scénarios et l&apos;impact des intérêts
          composés.
        </p>
        <Link
          href={SIMULATEUR_HREF}
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          Ouvrir le simulateur →
        </Link>
      </div>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Articles liés</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/investir-300-euros-mois-etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Investir 300 €/mois</p>
            <p className="text-xs text-gray-500">La même simulation pour un versement plus modeste.</p>
          </Link>
          <Link href="/investir-en-etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Investir en ETF — guide complet</p>
            <p className="text-xs text-gray-500">Choisir le montant, la durée, l&apos;enveloppe — tout y est.</p>
          </Link>
          <Link href="/pea-ou-cto" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">PEA ou CTO ?</p>
            <p className="text-xs text-gray-500">Choisir la bonne enveloppe pour votre DCA.</p>
          </Link>
          <Link href="/meilleurs-etf-debutants" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Meilleurs ETF débutants</p>
            <p className="text-xs text-gray-500">La sélection recommandée pour un DCA long-terme.</p>
          </Link>
        </div>
      </div>

      <EtapeSuivante montantMensuel={500} />

      <RenvoiProduit contexte="Ces projections supposent des versements tenus mois après mois pendant des années. Le jour où ça commence, la question n'est plus « combien à la fin » mais « combien de parts j'achète ce mois-ci, et où en est mon allocation »." />

      <SourcesReferences
        sources={[
          {
            label: "MSCI World Index — performance historique",
            url: "https://www.msci.com/indexes/index/990100",
            publisher: "MSCI Inc.",
            // « ~7 %/an net réel » retiré le 28/09/2026 : les projections
            // appliquent 7 %/an nominal, avant frais, et c'est une hypothèse.
            note: "Indice suivi par les ETF MSCI World cités. Le 7 %/an des projections est une hypothèse, pas une performance garantie.",
          },
          {
            label: "Espace épargnants — comprendre les ETF",
            url: "https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/produits-collectifs/fonds-indiciels-cotes-etf",
            publisher: "Autorité des marchés financiers (AMF)",
          },
          {
            label: "Plan d'Épargne en Actions — fiscalité",
            url: "https://www.service-public.fr/particuliers/vosdroits/F2385",
            publisher: "service-public.fr",
            note: "Exonération d'IR après 5 ans — l'enveloppe de référence pour un DCA long terme.",
          },
          {
            label: "Indice des prix à la consommation",
            url: "https://www.insee.fr/fr/statistiques/2122401",
            publisher: "INSEE",
            note: "Référence pour l'impact de l'inflation sur la valeur réelle des projections.",
          },
        ]}
      />

    </article>
  );
}
