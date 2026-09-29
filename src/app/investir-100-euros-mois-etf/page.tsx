import type { Metadata } from "next";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import Link from "next/link";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";
import { EtapeSuivante } from "@/components/ui/EtapeSuivante";
import { CeQuAuraitDonne } from "@/components/backtest/CeQuAuraitDonne";
import { SerieMontants } from "@/components/money/SerieMontants";
import { runSimulation } from "@/lib/simulator";
import { TER_REFERENCE_SIMULATEUR } from "@/lib/etf-config";
import { PFU_RATE, SOCIAL_CHARGES_RATE } from "@/lib/fiscal/pea-cto";
import {
  ecartFiscal,
  ecartFiscalEnviron,
  impotCTO,
  impotPEA,
  netApresCTO,
  netApresPEA,
} from "@/lib/impot-affiche";

const TITLE =
  // Le format « = X € en 20 ans » verrouillait sur un seul horizon alors que
  // les requêtes réelles portent aussi sur 10 et 30 ans, que la page couvre.
  // Le chiffre passe dans la meta, qui a la place de le porter.
  "Investir 100 €/mois en ETF : combien après 10, 20, 30 ans ?";
const CANONICAL = "/investir-100-euros-mois-etf";

// ─── Projection : calculée par le moteur, jamais écrite ───────────────────────
//
// Corrigé le 28/09/2026. Tous les montants de cette page (hero, meta, tableaux,
// FAQ, bloc fiscal) étaient écrits à la main, calculés avec un TER de 0,20 %
// ou 0,12 % selon l'endroit, alors que le lien « Simuler » de la même page
// ouvrait le simulateur à 0,20 % et que l'ETF de référence du site, CW8, coûte
// 0,38 %/an (table de vérité du 28/09/2026). Le lecteur qui cliquait tombait
// sur un autre chiffre que celui de la page. Désormais : UN seul TER,
// TER_REFERENCE_SIMULATEUR, pour la page ET le lien, et chaque montant sort de
// runSimulation.

const MENSUEL = 100;
const RENDEMENT = 7; // %/an avant frais — l'hypothèse centrale du simulateur
const TER = TER_REFERENCE_SIMULATEUR;
const HORIZON_MAX = 30;

/** Une seule simulation sur 30 ans : les points à 10, 20 ans sont les mêmes
 *  que ceux d'une simulation plus courte (même trajectoire mois par mois). */
const SIM = runSimulation({
  monthlyAmount: MENSUEL,
  durationYears: HORIZON_MAX,
  annualReturnPct: RENDEMENT,
  annualFeesPct: TER,
});

const LIEN_SIMULATEUR = `/simulateur?monthly=${MENSUEL}&years=20&return=${RENDEMENT}&fees=${TER}`;

/** 48877 → « 48 877 ». Séparateur de milliers en espace, comme le reste du site. */
function nombre(v: number): string {
  return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Arrondi d'affichage d'une valeur projetée : à la centaine au-dessus de
 * 10 000 €, à la dizaine en dessous. Une projection ne se donne pas à l'euro,
 * mais la première année ne doit pas s'arrondir à zéro gain.
 */
function arrondi(v: number): number {
  const pas = Math.abs(v) >= 10_000 ? 100 : 10;
  return Math.round(v / pas) * pas;
}

/** Arrondi « environ » pour les écarts cités dans la prose. */
function environ(v: number): number {
  const pas = Math.abs(v) >= 1000 ? 100 : 10;
  return Math.round(v / pas) * pas;
}

/** 0.38 → « 0,38 % ». */
function pctTer(ter: number): string {
  return `${ter.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
}

/** 0.186 → « 18,6 ». Le taux est lu dans fiscal/pea-cto.ts, jamais recopié. */
function taux(t: number): string {
  return (Math.round(t * 1000) / 10).toLocaleString("fr-FR");
}

type Scenario = typeof SIM.base;

/**
 * Point d'une trajectoire à une année donnée. Le gain est la différence des
 * deux nombres AFFICHÉS : « versé + gain = capital » reste vrai à l'écran.
 */
function point(s: Scenario, annee: number) {
  const d = s.monthlyData.find((m) => m.year === annee);
  if (!d) throw new Error(`Pas de point à ${annee} ans`);
  const final = arrondi(d.portfolioValue);
  return {
    invested: d.invested,
    final,
    gain: final - d.invested,
    pct: Math.round(((d.portfolioValue - d.invested) / d.invested) * 100),
  };
}

const P5 = point(SIM.base, 5);
const P15 = point(SIM.base, 15);
const P20 = point(SIM.base, 20);
const P30 = point(SIM.base, 30);

/** Gains de marché produits entre la 20e et la 30e année. */
const GAIN_DECENNIE_20_30 = P30.gain - P20.gain;

/** Capital final à 20 ans pour un TER donné, mêmes hypothèses que la page. */
function capital20(ter: number): number {
  return runSimulation({
    monthlyAmount: MENSUEL,
    durationYears: 20,
    annualReturnPct: RENDEMENT,
    annualFeesPct: ter,
  }).base.finalValue;
}

// TER de WPEA et DCAM : 0,20 %/an (table de vérité du 28/09/2026, émetteurs
// et justETF). Ces deux lignes ne sont pas dans le catalogue etf-config.
const TER_WPEA_DCAM = 0.2;

const DESCRIPTION =
  // Corrigé le 28/09/2026 : l'ancienne meta donnait la réponse entière dans
  // l'extrait Google (« 52 100 € en 20 ans dont 28 100 € de gains », calculés
  // à 0,20 % de frais) et ne laissait aucune raison de cliquer. Le chiffre
  // vient du moteur ; la promesse est le bloc sur les vrais cours depuis 2008.
  `${MENSUEL} €/mois en ETF : ≈ ${nombre(P20.final)} € en 20 ans à ${RENDEMENT} %/an avant frais. Et ce que le même effort aurait vraiment donné depuis 2008, krach compris.`;

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
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// ─── Données ──────────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    label: "Pessimiste",
    sim: SIM.conservative,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-100",
  },
  {
    label: "Réaliste",
    sim: SIM.base,
    color: "text-primary-700",
    bg: "bg-primary-50 border-primary-100",
    highlight: true,
  },
  {
    label: "Optimiste",
    sim: SIM.optimistic,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
  },
];

const YEARLY = [1, 3, 5, 10, 15, 20, 25, 30].map((year) => ({
  year,
  ...point(SIM.base, year),
}));

// Corrigé le 28/09/2026 : la ligne de référence était « ETF indiciel (CW8,
// EWLD) — 0,12 % ». Faux deux fois d'après la table de vérité : CW8 et EWLD
// coûtent 0,38 %/an, et EWLD est émis par Amundi (part distribuante du fonds
// de CW8), pas par iShares. Les libellés « fonds actif classique » et
// « assurance-vie générique » attribuaient un niveau de frais à des catégories
// entières sans source : ils deviennent de simples niveaux de frais.
const FRAIS = [
  { type: "WPEA, DCAM (MSCI World, PEA)", ter: TER_WPEA_DCAM },
  { type: "CW8 (MSCI World, PEA)", ter: TER },
  { type: "Fonds à 0,50 %/an de frais", ter: 0.5 },
  { type: "Fonds à 1 %/an de frais", ter: 1 },
].map((r) => {
  const final = capital20(r.ter);
  return {
    ...r,
    final: arrondi(final),
    cout: environ(capital20(0) - final),
  };
});

const ECART_BAS_HAUT = environ(capital20(TER_WPEA_DCAM) - capital20(1));
const ECART_WPEA_CW8 = environ(capital20(TER_WPEA_DCAM) - capital20(TER));

const FAQ = [
  {
    q: "100€ par mois, est-ce vraiment suffisant pour investir ?",
    a: `Oui. Il n'y a pas de minimum pour démarrer une stratégie DCA. ${MENSUEL} €/mois pendant 20 ans, à ${RENDEMENT} %/an avant ${pctTer(TER)} de frais, donnent environ ${nombre(P20.final)} € — dont ${nombre(P20.gain)} € produits par les marchés, pour ${nombre(P20.invested)} € versés. Ce qui compte, c'est la régularité, pas le montant.`,
  },
  {
    // Corrigé le 28/09/2026 : la réponse présentait « l'EWLD (iShares MSCI
    // World) » et des frais « ≈ 0,12 à 0,20 % ». D'après la table de vérité,
    // EWLD est un fonds Amundi, CW8 et EWLD coûtent 0,38 %/an ; les MSCI World
    // PEA à 0,20 % sont WPEA et DCAM. Le nombre d'entreprises, absent de la
    // table, est retiré.
    q: "Quel ETF choisir pour investir 100€ par mois ?",
    a: `Un seul ETF MSCI World suffit pour démarrer. Parmi les lignes éligibles au PEA qui suivent cet indice : WPEA (iShares, ${pctTer(TER_WPEA_DCAM)}/an), DCAM (Amundi, ${pctTer(TER_WPEA_DCAM)}/an) et CW8 (Amundi, ${pctTer(TER)}/an). Même indice, deux niveaux de frais : sur 20 ans à ${MENSUEL} €/mois, l'écart entre ${pctTer(TER_WPEA_DCAM)} et ${pctTer(TER)} vaut environ ${nombre(ECART_WPEA_CW8)} €. Les parts de WPEA et DCAM valent moins de 10 €, ce qui permet de placer la quasi-totalité de ${MENSUEL} € chaque mois.`,
  },
  {
    // Corrigé le 28/09/2026 : 17,2 % et « 3 500 à 5 000 € » (calculés sur
    // l'ancien taux et un gain faux) → taux 2026 de fiscal/pea-cto.ts et
    // écart calculé par impot-affiche.ts.
    q: "PEA ou CTO pour investir 100€ par mois ?",
    a: `Après 5 ans, les gains d'un PEA ne supportent que les prélèvements sociaux (${taux(SOCIAL_CHARGES_RATE)} %) ; ceux d'un CTO, le PFU (${taux(PFU_RATE)} %). Sur les ${nombre(P20.gain)} € de gains de la projection à 20 ans, l'écart est d'environ ${ecartFiscalEnviron(P20.gain)} €. Condition : un ETF éligible au PEA — pour le MSCI World, par exemple WPEA, DCAM ou CW8 ; IWDA et VWCE n'y entrent pas.`,
  },
  {
    q: "Quand verra-t-on vraiment les effets des intérêts composés ?",
    a: `Les premières années semblent peu spectaculaires : à 5 ans, ${nombre(P5.invested)} € versés valent environ ${nombre(P5.final)} € (+${P5.pct} %). À 20 ans, ${nombre(P20.invested)} € versés valent environ ${nombre(P20.final)} € (+${P20.pct} %). Entre la 20e et la 30e année, les marchés produisent à eux seuls environ ${nombre(GAIN_DECENNIE_20_30)} € de gains — ${GAIN_DECENNIE_20_30 > P20.gain ? "plus que sur les vingt premières années réunies" : "presque autant que sur les vingt premières années"}.`,
  },
  {
    q: "Que se passe-t-il si je saute un mois ?",
    a: "Rien de dramatique sur 20 ans. Rater un ou deux versements ponctuellement n'affecte presque pas le résultat final. Ce qui compte, c'est de ne pas interrompre la stratégie durablement — surtout en période de baisse des marchés, qui sont précisément les moments où le DCA est le plus avantageux.",
  },
];

export default function Investir100EurosMoisPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      {/* Breadcrumb */}
      <nav
        aria-label="Fil d'ariane"
        className="flex items-center gap-2 text-sm text-gray-500 mb-8"
      >
        <Link href="/" className="hover:text-gray-600 transition-colors">
          Accueil
        </Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">
          Investir 100€/mois en ETF
        </span>
      </nav>

      {/* H1 + intro */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Investir 100€ par mois en ETF : simulation sur 10, 20 et 30 ans
      </h1>
      <p className="text-lg text-gray-500 mb-12 leading-relaxed">
        100€ par mois vous semble peu ? Les chiffres disent le contraire.
        Grâce aux intérêts composés, ce montant modeste devient{" "}
        <strong className="text-gray-700">
          environ {nombre(P20.final)} € en 20 ans
        </strong>{" "}
        — dont {nombre(P20.gain)} € générés par les marchés, pas par votre
        effort. Voici la simulation complète, puis{" "}
        <a
          href="#ce-qu-aurait-donne"
          className="underline hover:text-gray-700 transition-colors"
        >
          ce que le même effort aurait réellement donné depuis 2008
        </a>
        , krach compris.
      </p>

      <ArticleByline
        publishedAt="2026-04-19"
        updatedAt="2026-09-28"
        readingMinutes={8}
        url="/investir-100-euros-mois-etf"
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* ── Section 1 : Hypothèses ─────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Les hypothèses de la simulation
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Une simulation n&apos;est utile que si ses paramètres sont
          transparents. Voici ce que nous utilisons :
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Versement mensuel", value: `${MENSUEL} €` },
            { label: "ETF de référence", value: "CW8 (MSCI World)" },
            // Corrigé le 28/09/2026 : « 0,20 %/an » alors que les chiffres
            // étaient calculés à un autre TER. C'est désormais celui de CW8,
            // lu dans le catalogue, et le même que le lien vers le simulateur.
            { label: "Frais TER", value: `${pctTer(TER)}/an` },
            { label: "Capital initial", value: "0 €" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center"
            >
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5">
          <p className="text-sm font-semibold text-primary-800 mb-1">
            Sur le rendement annuel
          </p>
          {/* Corrigé le 28/09/2026 : « Le MSCI World a rendu en moyenne 7 à
              8 %/an sur les 30 dernières années » — affirmation que la table
              de vérité ne permet pas de vérifier, retirée. Le rendement est
              présenté pour ce qu'il est : une hypothèse, confrontée plus bas
              aux vrais cours. */}
          <p className="text-sm text-primary-700 leading-relaxed">
            <strong>{RENDEMENT} %/an avant frais</strong> est une hypothèse de
            travail, pas une moyenne garantie. Nous simulons 3 scénarios (
            {SIM.conservative.annualReturnPct} %, {SIM.base.annualReturnPct} %,{" "}
            {SIM.optimistic.annualReturnPct} %) pour couvrir les marchés atones,
            normaux et favorables. Ce ne sont pas des promesses : pour voir ce
            qu&apos;a donné la réalité, avec ses krachs, le bloc{" "}
            <a
              href="#ce-qu-aurait-donne"
              className="underline hover:text-primary-800 transition-colors"
            >
              « ce qu&apos;auraient réellement donné {MENSUEL} €/mois »
            </a>{" "}
            rejoue les vrais cours depuis 2008.
          </p>
        </div>
      </section>

      {/* ── Section 2 : Tableau des 3 scénarios ───────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Résultats : 3 scénarios sur 10, 20 et 30 ans
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Capital investi = {MENSUEL} € × 12 mois × nombre d&apos;années. Le
          reste est généré par les marchés, après {pctTer(TER)}/an de frais
          (TER de CW8).
        </p>

        <div className="space-y-4">
          {SCENARIOS.map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border p-5 ${s.bg}${s.highlight ? " ring-2 ring-primary-200" : ""}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={`font-bold text-base ${s.color}`}>
                    {s.label}
                  </span>
                  {s.highlight && (
                    <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold">
                      hypothèse centrale
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  {s.sim.annualReturnPct} %/an
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[10, 20, 30].map((annee) => {
                  const data = point(s.sim, annee);
                  return (
                    <div key={annee} className="bg-white/70 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1 font-medium">
                        {annee} ans
                      </p>
                      <p className={`text-lg font-bold tabular-nums ${s.color}`}>
                        {nombre(data.final)} €
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        investi : {nombre(data.invested)} €
                      </p>
                      <p className="text-xs font-semibold text-gray-600 mt-0.5">
                        +{data.pct} %
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3 : Progression année par année ───────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          La progression année par année (scénario {RENDEMENT} %)
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Les premières années semblent lentes. Puis la courbe s&apos;emballe.
          C&apos;est l&apos;effet boule de neige des intérêts composés.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Année
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Capital investi
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Capital total
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Gain marché
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Perf.
                </th>
              </tr>
            </thead>
            <tbody>
              {YEARLY.map((row, i) => (
                <tr
                  key={row.year}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-50">
                    {row.year} an{row.year > 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 border-b border-gray-50">
                    {nombre(row.invested)} €
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 border-b border-gray-50">
                    {nombre(row.final)} €
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium border-b border-gray-50">
                    {nombre(row.gain)} €
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-semibold border-b border-gray-50">
                    +{row.pct} %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            La décennie qui change tout
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            De l&apos;année 1 à l&apos;année 20, les marchés génèrent{" "}
            <strong>{nombre(P20.gain)} €</strong> de gains. De l&apos;année 20
            à l&apos;année 30, ils en génèrent{" "}
            <strong>{nombre(GAIN_DECENNIE_20_30)} €</strong> supplémentaires —
            pour le même versement mensuel. Plus la base de
            capital est grande, plus les intérêts composés s&apos;accélèrent.
          </p>
        </div>
      </section>

      {/* ── Section 4 : Coût de l'attente ─────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Le coût de l&apos;attente : commencer maintenant vs dans 5 ans
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          L&apos;argument le plus courant pour ne pas commencer :
          &ldquo;J&apos;attendrai d&apos;avoir plus d&apos;argent.&rdquo;
          Voici ce que cette attente coûte réellement.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-3">
              Commencer aujourd&apos;hui
            </p>
            <p className="text-sm text-gray-600 mb-1">
              {MENSUEL} €/mois × <strong>20 ans</strong>
            </p>
            <p className="text-2xl font-bold text-primary-700 mb-1">
              {nombre(P20.final)} €
            </p>
            <p className="text-xs text-gray-500">
              dont {nombre(P20.invested)} € investis
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Attendre 5 ans
            </p>
            <p className="text-sm text-gray-600 mb-1">
              {MENSUEL} €/mois × <strong>15 ans</strong>
            </p>
            <p className="text-2xl font-bold text-gray-700 mb-1">
              {nombre(P15.final)} €
            </p>
            <p className="text-xs text-gray-500">
              dont {nombre(P15.invested)} € investis
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            Le bilan de 5 ans d&apos;attente
          </p>
          <p className="text-sm text-amber-700 leading-relaxed">
            En attendant 5 ans, le capital final baisse de{" "}
            <strong>{nombre(P20.final - P15.final)} €</strong>. Pourtant,
            seuls {nombre(P20.invested - P15.invested)} € ont été épargnés en
            moins. Les {nombre(P20.gain - P15.gain)} € restants sont des gains
            manqués — de l&apos;argent que les marchés auraient généré, et qui
            ne sera pas là.
          </p>
        </div>
      </section>

      {/* ── Section 5 : Impact des frais ──────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          L&apos;impact des frais : {pctTer(TER_WPEA_DCAM)} vs 1 % sur 20 ans
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Les frais de gestion (TER) sont prélevés chaque année sur
          l&apos;encours. Ils semblent négligeables — jusqu&apos;à ce
          qu&apos;on les simule sur 20 ans.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Type de fonds
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  TER
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Capital final (20 ans)
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Coût des frais (vs 0 %)
                </th>
              </tr>
            </thead>
            <tbody>
              {FRAIS.map((row, i) => (
                <tr
                  key={row.type}
                  className={i === 0 ? "bg-primary-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-50">
                    {row.type}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 border-b border-gray-50">
                    {pctTer(row.ter)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 border-b border-gray-50">
                    {nombre(row.final)} €
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold border-b border-gray-50 ${i === 0 ? "text-primary-600" : "text-orange-500"}`}>
                    −{nombre(row.cout)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Entre un ETF à {pctTer(TER_WPEA_DCAM)} et un fonds à 1 %, l&apos;écart
          atteint environ {nombre(ECART_BAS_HAUT)} € sur 20 ans pour{" "}
          {MENSUEL} €/mois. Et entre WPEA ou DCAM et CW8 — le même indice —,
          environ {nombre(ECART_WPEA_CW8)} €. Les simulations de cette page
          sont faites au TER de CW8, le plus élevé des trois : elles ne
          flattent pas le résultat.
        </p>
      </section>

      {/* ── CTA Simulateur ────────────────────────────────────────────────── */}
      <section className="mb-14 rounded-2xl bg-primary-600 p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Simulez votre propre projection
        </h2>
        <p className="text-primary-200 text-sm mb-6 leading-relaxed max-w-md mx-auto">
          Ces chiffres sont basés sur des hypothèses moyennes. Ajustez le
          versement, la durée et le rendement selon votre situation réelle.
          La simulation se met à jour en temps réel.
        </p>
        <Link
          href={LIEN_SIMULATEUR}
          className="btn-secondary text-sm px-6 py-2.5 inline-flex"
        >
          Ouvrir le simulateur avec 100€/mois →
        </Link>
        <p className="mt-4 text-primary-300 text-xs">
          Gratuit · Sans inscription · 3 scénarios comparés
        </p>
      </section>

      {/* ── Section 6 : PEA vs CTO ────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          PEA ou CTO : ça change combien sur 20 ans ?
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          L&apos;enveloppe fiscale change significativement le résultat net
          après impôts. Sur 20 ans avec {MENSUEL} €/mois à {RENDEMENT} %/an :
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
            <p className="font-bold text-primary-700 mb-3">Plan Épargne en Actions (PEA)</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Capital final</span>
                <span className="font-bold text-gray-900">
                  {nombre(P20.final)} €
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gains à la sortie (après 5 ans)</span>
                <span className="font-medium text-gray-700">
                  {nombre(P20.gain)} €
                </span>
              </div>
              <div className="flex justify-between">
                {/* Corrigé le 28/09/2026 : 17,2 % → taux 2026 de
                    fiscal/pea-cto.ts, montant calculé par impot-affiche.ts. */}
                <span className="text-gray-500">
                  Imposition (prélèv. sociaux {taux(SOCIAL_CHARGES_RATE)} %)
                </span>
                <span className="font-medium text-orange-600">
                  − {impotPEA(P20.gain)} €
                </span>
              </div>
              <div className="flex justify-between border-t border-primary-100 pt-2">
                <span className="font-semibold text-primary-700">Net en poche</span>
                <span className="font-bold text-primary-700">
                  {netApresPEA(P20.final, P20.gain)} €
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="font-bold text-gray-700 mb-3">Compte-Titres Ordinaire (CTO)</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Capital final</span>
                <span className="font-bold text-gray-900">
                  {nombre(P20.final)} €
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gains imposables</span>
                <span className="font-medium text-gray-700">
                  {nombre(P20.gain)} €
                </span>
              </div>
              <div className="flex justify-between">
                {/* Corrigé le 28/09/2026 : PFU 30 % → taux 2026. */}
                <span className="text-gray-500">
                  Imposition (PFU {taux(PFU_RATE)} %)
                </span>
                <span className="font-medium text-orange-600">
                  − {impotCTO(P20.gain)} €
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-semibold text-gray-700">Net en poche</span>
                <span className="font-bold text-gray-700">
                  {netApresCTO(P20.final, P20.gain)} €
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Avantage PEA : +{ecartFiscal(P20.gain)} € sur 20 ans
          </p>
          {/* Corrigé le 28/09/2026 : le texte donnait une consigne (« ouvrez
              un PEA dès maintenant — même sans y mettre d'argent ») que le
              site n'a pas à donner, sur un point de délai non sourcé. Il
              décrit désormais d'où vient l'écart et sa condition. */}
          <p className="text-sm text-gray-600 leading-relaxed">
            L&apos;écart vient des seuls taux : {taux(PFU_RATE)} % −{" "}
            {taux(SOCIAL_CHARGES_RATE)} % = {taux(PFU_RATE - SOCIAL_CHARGES_RATE)}{" "}
            points sur chaque euro de gain. Il suppose un PEA détenu plus de 5
            ans et un ETF éligible (par exemple WPEA, DCAM ou CW8 pour le MSCI
            World) : une
            sortie avant 5 ans est imposée au PFU, comme un CTO.
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Calcul simplifié. La fiscalité réelle dépend de votre situation
          personnelle.{" "}
          <Link
            href="/pea-ou-cto"
            className="underline hover:text-gray-600 transition-colors"
          >
            Voir le guide complet PEA vs CTO →
          </Link>
        </p>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <CeQuAuraitDonne monthlyAmount={100} />
      <SerieMontants courant={100} />

      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl border border-gray-100 bg-white overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none">
                {q}
                <span className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                {a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Liens internes ────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Continuez votre exploration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              href: "/investir-200-euros-mois-etf",
              title: "Simulation avec 200€/mois",
              desc: "Capital doublé, même principe — voir ce que change le montant.",
            },
            {
              href: "/investir-300-euros-mois-etf",
              title: "Simulation avec 300€/mois",
              desc: "L'horizon retraite avec un versement plus confortable.",
            },
            {
              href: "/strategie-dca",
              title: "La stratégie DCA expliquée",
              desc: "DCA vs lump sum, comment démarrer, les erreurs à éviter.",
            },
            {
              href: "/meilleurs-etf-debutants",
              title: "Quels ETF choisir ?",
              desc: "Notre sélection commentée pour une stratégie DCA efficace.",
            },
            {
              href: "/pea-ou-cto",
              title: "PEA ou CTO ?",
              desc: "Comparatif complet pour choisir la bonne enveloppe fiscale.",
            },
            {
              href: "/interets-composes",
              title: "Les intérêts composés",
              desc: "La mécanique derrière ces projections, expliquée simplement.",
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group p-4 rounded-xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all"
            >
              <p className="font-semibold text-sm text-gray-900 group-hover:text-primary-700 mb-1 transition-colors">
                {link.title} →
              </p>
              <p className="text-xs text-gray-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>


      <EtapeSuivante montantMensuel={100} />

      <SourcesReferences
        sources={[
          {
            label: "MSCI World Index — performance historique",
            url: "https://www.msci.com/indexes/index/990100",
            publisher: "MSCI Inc.",
            // Corrigé le 28/09/2026 : « ~7 %/an net réel » — la simulation
            // applique 7 %/an AVANT frais et avant inflation, pas un net réel.
            note: "Indice suivi par les ETF cités. Les 7 %/an des simulations sont une hypothèse, avant frais et avant inflation.",
          },
          {
            // 29/09/2026 : la page AMF « fonds-indiciels-cotes-etf » renvoie une
            // 404. Remplacée par l'étude AMF sur les ETF, vérifiée.
            label: "Les ETF : caractéristiques, état des lieux et analyse des risques (étude, février 2017)",
            url: "https://www.amf-france.org/sites/institutionnel/files/contenu_simple/lettre_ou_cahier/risques_tendances/Les%20ETF%20%20caracteristiques,%20etat%20des%20lieux%20et%20analyse%20des%20risques%20-%20Le%20cas%20du%20marche%20francais.pdf",
            publisher: "Autorité des marchés financiers (AMF)",
            note: "Consulté le 28/09/2026.",
          },
          {
            label: "Plan d'Épargne en Actions — fiscalité",
            url: "https://www.service-public.fr/particuliers/vosdroits/F2385",
            publisher: "service-public.fr",
            note: "Exonération d'IR après 5 ans — l'enveloppe de référence pour un DCA long terme.",
          },
          {
            // 29/09/2026 : /fr/statistiques/2122401 répondait HTTP 404. Remplacé
            // par la définition INSEE de l'IPC (vérifiée, mise à jour le 04/02/2026).
            label: "Indice des prix à la consommation (IPC) — définition",
            url: "https://www.insee.fr/fr/metadonnees/definition/c1557",
            publisher: "INSEE",
            note: "L'IPC est l'instrument de mesure de l'inflation en France : c'est lui qui sert à passer d'un montant nominal à un montant réel. Consultée le 28/09/2026.",
          },
        ]}
      />

      <EmailCapture source="simulation_100" />
    </div>
  );
}
