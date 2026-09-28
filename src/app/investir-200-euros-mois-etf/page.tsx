import type { Metadata } from "next";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import Link from "next/link";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";
import { EtapeSuivante } from "@/components/ui/EtapeSuivante";
import { RenvoiProduit } from "@/components/products/RenvoiProduit";
import { CeQuAuraitDonne } from "@/components/backtest/CeQuAuraitDonne";
import { SerieMontants } from "@/components/money/SerieMontants";
import { runSimulation, SCENARIO_DELTA } from "@/lib/simulator";
import { ETF_LIST, TER_REFERENCE_SIMULATEUR } from "@/lib/etf-config";
import { PFU_RATE, SOCIAL_CHARGES_RATE } from "@/lib/fiscal/pea-cto";
import {
  impotPEA,
  impotCTO,
  netApresPEA,
  netApresCTO,
  ecartFiscal,
} from "@/lib/impot-affiche";

// ─── Moteur ───────────────────────────────────────────────────────────────────
//
// Correctif du 28/09/2026. Jusqu'ici, chaque montant de la page était écrit à
// la main, calculé avec un TER de 0,20 % (104 200 € à 20 ans), alors que le
// bouton « Simuler » ouvrait le simulateur avec un autre réglage : le lecteur
// cliquait et tombait sur un autre chiffre. Le tableau des frais, lui,
// attribuait 0,12 % à CW8 et EWLD — la table de vérité du 28/09/2026 (émetteur
// + justETF) donne 0,38 % pour les deux. Désormais UN SEUL TER, celui du lien
// vers le simulateur, et tous les montants sortent de runSimulation.

const MENSUEL = 200;
const RENDEMENT = 7;
const DUREE = 20;
const INFLATION = 2;
const TER = TER_REFERENCE_SIMULATEUR;

/** WPEA et DCAM : 0,20 % d'après la table de vérité du 28/09/2026. Absents
 *  d'ETF_LIST, donc posés ici, et seulement pour la ligne de comparaison. */
const TER_MONDE_PEA_BAS =
  ETF_LIST.find((e) => e.displaySymbol === "WPEA")?.ter ?? 0.2;

const SIMULATEUR_HREF = `/simulateur?monthly=${MENSUEL}&years=${DUREE}&return=${RENDEMENT}&fees=${TER}`;

function sim(years: number, fees = TER) {
  return runSimulation({
    monthlyAmount: MENSUEL,
    durationYears: years,
    annualReturnPct: RENDEMENT,
    annualFeesPct: fees,
    annualInflationPct: INFLATION,
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

// Scénario central : 20 ans. Le capital est arrondi à la centaine AVANT de
// calculer le gain et l'impôt, pour que « versé + gain = capital » et
// « capital − impôt = net » restent vrais à l'œil sur la page.
const S20 = sim(DUREE).base;
const FINAL_20 = environ(S20.finalValue);
const VERSE_20 = S20.totalInvested;
const GAIN_20 = FINAL_20 - VERSE_20;

// Commencer dans 5 ans : 15 ans de versements au lieu de 20.
const S15 = sim(DUREE - 5).base;
const FINAL_15 = environ(S15.finalValue);
const PERTE_RETARD = FINAL_20 - FINAL_15;
const MOINS_VERSE = VERSE_20 - S15.totalInvested;

// Inflation à 2 %/an : valeur des euros de dans 20 ans en euros d'aujourd'hui.
const REEL_20 = S20.inflationAdjustedValue ?? S20.finalValue;

// Versement augmenté de 10 % par an. Le moteur ne sait faire qu'un versement
// constant : on l'enchaîne année par année, le capital de fin d'année servant
// de capital de départ à la suivante. L'ancienne FAQ annonçait « plus de
// 130 000 €, soit 25 000 € de plus » : faux, puisque le total versé à lui seul
// dépasse ces 130 000 € (calcul du 28/09/2026).
function versementCroissant() {
  let capital = 0;
  let verse = 0;
  let mensuel = MENSUEL;
  for (let an = 0; an < DUREE; an++) {
    mensuel = MENSUEL * Math.pow(1.1, an);
    capital = runSimulation({
      monthlyAmount: mensuel,
      durationYears: 1,
      annualReturnPct: RENDEMENT,
      annualFeesPct: TER,
      startingCapital: capital,
    }).base.finalValue;
    verse += mensuel * 12;
  }
  return { capital, verse, dernierMensuel: mensuel };
}
const CROISSANT = versementCroissant();

const TITLE =
  "Investir 200 €/mois en ETF : combien après 10, 20, 30 ans ?";
const DESCRIPTION =
  // L'ancienne meta donnait toute la réponse dans l'extrait Google (et avec
  // un TER de 0,20 % que le simulateur n'utilisait pas). Le chiffre reste,
  // calculé ; la raison de cliquer est ce que l'extrait ne peut pas livrer.
  `200 €/mois en ETF : ≈ ${eur(FINAL_20)} en 20 ans à 7 %/an. Et ce que le même effort aurait vraiment donné depuis 2008, krach compris.`;
const CANONICAL = "/investir-200-euros-mois-etf";

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

// Les trois rendements sont ceux du simulateur (7 %/an ± SCENARIO_DELTA), pour
// que la matrice et l'écran du simulateur affichent les mêmes nombres.
const DUREES_MATRICE = [10, 20, 30] as const;
const SIMS_MATRICE = DUREES_MATRICE.map((y) => ({ y, s: sim(y) }));

const MATRIX = (
  [
    { cle: "conservative", label: "Pessimiste", color: "text-orange-600", delta: -SCENARIO_DELTA },
    { cle: "base", label: "Réaliste", color: "text-primary-700", delta: 0 },
    { cle: "optimistic", label: "Optimiste", color: "text-emerald-700", delta: SCENARIO_DELTA },
  ] as const
).map(({ cle, label, color, delta }) => ({
  rate: `${RENDEMENT + delta} %/an`,
  label,
  color,
  years: SIMS_MATRICE.map(({ y, s }) => ({
    y,
    final: eur(s[cle].finalValue),
    pct: pctGain(s[cle].finalValue, s[cle].totalInvested),
  })),
}));

const S20_PESSIMISTE = SIMS_MATRICE[1].s.conservative;
const S20_OPTIMISTE = SIMS_MATRICE[1].s.optimistic;

const FAQ = [
  {
    q: "Combien vaut 200€/mois en ETF après 20 ans ?",
    // « référence historique MSCI World » retiré le 28/09/2026 : 7 %/an est
    // une hypothèse de la page, pas une donnée vérifiée.
    a: `Avec une hypothèse de rendement moyen de 7 %/an et ${terAffiche(TER)} % de frais annuels (TER de CW8), 200 €/mois pendant 20 ans donnent environ ${eur(FINAL_20)}. Vous avez versé ${eur(VERSE_20)} de votre poche ; les ${eur(GAIN_20)} restants viennent des intérêts composés. À ${RENDEMENT - SCENARIO_DELTA} %/an, le résultat tombe à environ ${eur(S20_PESSIMISTE.finalValue)} ; à ${RENDEMENT + SCENARIO_DELTA} %/an, il atteint environ ${eur(S20_OPTIMISTE.finalValue)}.`,
  },
  {
    q: "L'inflation réduit-elle vraiment les gains ?",
    a: `Oui, l'inflation érode le pouvoir d'achat du capital final. Avec ${INFLATION} %/an d'inflation sur 20 ans, ${eur(FINAL_20)} nominaux valent environ ${eur(REEL_20)} en euros d'aujourd'hui, soit tout de même un gain réel de ${pctGain(REEL_20, VERSE_20)} sur la mise. Le simulateur a un paramètre inflation pour faire le calcul sur vos propres chiffres.`,
  },
  {
    q: `DCA à 200€/mois ou mettre ${fmt(VERSE_20)}€ d'un coup (lump sum) ?`,
    a: `Statistiquement, le lump sum surperforme le DCA environ 2/3 du temps sur les marchés longs et haussiers. Mais le DCA élimine le risque de mauvais timing. Avec ${eur(VERSE_20)} disponibles d'un coup, l'investissement immédiat a l'avantage statistique ; le DCA achète la tranquillité face à un mauvais point d'entrée. Pour un salarié qui investit depuis son revenu mensuel, la question ne se pose pas : le DCA est la seule stratégie praticable.`,
  },
  {
    q: "Peut-on augmenter progressivement son versement ?",
    a: `Oui, c'est une pratique courante : le versement suit l'évolution du salaire. En partant de 200 € et en augmentant de 10 % chaque année, le versement mensuel atteint environ ${fmt(Math.round(CROISSANT.dernierMensuel / 10) * 10)} € la 20e année. Total versé : environ ${eur(CROISSANT.verse)}, pour un capital final d'environ ${eur(CROISSANT.capital)} (7 %/an, TER ${terAffiche(TER)} %), contre ${eur(FINAL_20)} à 200 € fixes. L'essentiel de l'écart vient de ce qui a été versé en plus, pas d'un effet magique.`,
  },
  {
    // Tarifs de courtiers retirés le 28/09/2026 (« ordres à partir de 0,99 € »,
    // « 1 € par ordre », « 0 € en plan programmé ») : absents de la table de
    // vérité, ils ne peuvent être ni confirmés ni datés.
    q: "Quel courtier pour investir 200€/mois en ETF ?",
    a: "À 200 €/mois, trois critères comptent : pas de frais de tenue de compte, des frais d'ordre faibles rapportés au versement (1 € de frais sur 200 €, c'est déjà 0,5 % de chaque achat), et la disponibilité des ETF MSCI World éligibles au PEA (WPEA, DCAM, CW8). Les tarifs changent souvent : notre comparatif des courtiers les détaille.",
  },
];

export default function Investir200EurosMoisPage() {
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
          Investir 200€/mois en ETF
        </span>
      </nav>

      {/* H1 + intro */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Investir 200€ par mois en ETF : simulation complète
      </h1>
      <p className="text-lg text-gray-500 mb-12 leading-relaxed">
        200€ par mois. Un montant accessible pour de nombreux salariés.
        Investi régulièrement en ETF sur 20 ans à 7 % de rendement et{" "}
        {terAffiche(TER)} % de frais annuels, ce versement donne environ{" "}
        <strong className="text-gray-700">{eur(FINAL_20)}</strong>, dont{" "}
        <strong className="text-gray-700">{eur(GAIN_20)} générés par les marchés</strong>{" "}
        sans effort supplémentaire. Voici la simulation dans tous ses détails,
        puis ce que 200 €/mois auraient réellement donné sur les vrais cours.
      </p>

      <ArticleByline
        publishedAt="2026-04-19"
        updatedAt="2026-09-28"
        readingMinutes={7}
        url="/investir-200-euros-mois-etf"
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* ── Bloc résultat mis en avant ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-8 text-white mb-14">
        <p className="text-primary-200 text-sm font-medium mb-2">
          200€/mois · 20 ans · 7%/an · TER {terAffiche(TER)} %
        </p>
        <p className="text-5xl font-bold tabular-nums mb-1">{eur(FINAL_20)}</p>
        <p className="text-primary-200 text-sm mb-6">
          dont {eur(VERSE_20)} que vous avez versés, et {eur(GAIN_20)} que
          les marchés ont générés à votre place
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-primary-200 text-xs mb-1">Capital investi</p>
            <p className="font-bold text-base">{eur(VERSE_20)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-primary-200 text-xs mb-1">Gain marché</p>
            <p className="font-bold text-base text-emerald-300">+{eur(GAIN_20)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-primary-200 text-xs mb-1">Performance</p>
            <p className="font-bold text-base text-emerald-300">{pctGain(FINAL_20, VERSE_20)}</p>
          </div>
        </div>
      </div>

      {/* ── Section 1 : Matrice scénarios × durées ────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          La matrice complète : 3 scénarios × 3 durées
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Personne ne connaît le rendement futur des marchés. La bonne
          approche : simuler les trois cas de figure et décider en
          connaissance de cause.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Scénario
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  10 ans
                  <span className="block text-xs font-normal text-gray-500">
                    investi {eur(SIMS_MATRICE[0].s.base.totalInvested)}
                  </span>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  20 ans
                  <span className="block text-xs font-normal text-gray-500">
                    investi {eur(SIMS_MATRICE[1].s.base.totalInvested)}
                  </span>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  30 ans
                  <span className="block text-xs font-normal text-gray-500">
                    investi {eur(SIMS_MATRICE[2].s.base.totalInvested)}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row, i) => (
                <tr
                  key={row.rate}
                  className={row.label === "Réaliste" ? "bg-primary-50/60" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-4 border-b border-gray-50">
                    <span className={`font-bold ${row.color}`}>
                      {row.label}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {row.rate}
                    </span>
                  </td>
                  {row.years.map(({ y, final, pct }) => (
                    <td
                      key={y}
                      className="px-4 py-4 text-right border-b border-gray-50"
                    >
                      <span className={`font-bold text-base block ${row.color}`}>
                        {final}
                      </span>
                      <span className="text-xs text-gray-500">{pct}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          {/* « Les rendements historiques du MSCI World se situent autour de
              7-8 %/an sur 30 ans » retiré le 28/09/2026 : chiffre non sourcé,
              absent de la table de vérité. */}
          Projections nettes de {terAffiche(TER)} % de frais annuels (TER de
          CW8), le même réglage que le simulateur. 7 %/an est une hypothèse de
          rendement constant, pas une promesse : les marchés n&apos;avancent
          jamais en ligne droite. Le bloc « ce qu&apos;auraient réellement
          donné 200 €/mois », plus bas, rejoue les vrais cours depuis 2008.
        </p>
      </section>

      {/* ── Section 2 : Coût du retard ────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Commencer maintenant vs dans 5 ans : le vrai coût
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5 sm:col-span-2">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-3">
              Commencer aujourd&apos;hui · 20 ans
            </p>
            <p className="text-3xl font-bold text-primary-700 mb-1">
              {eur(FINAL_20)}
            </p>
            <p className="text-xs text-gray-500">dont {eur(VERSE_20)} investis</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Attendre 5 ans · 15 ans
            </p>
            <p className="text-3xl font-bold text-gray-600 mb-1">{eur(FINAL_15)}</p>
            <p className="text-xs text-gray-500">dont {eur(S15.totalInvested)} investis</p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            5 ans d&apos;attente = {eur(PERTE_RETARD)} de moins
          </p>
          <p className="text-sm text-amber-700 leading-relaxed">
            En attendant 5 ans, on verse {eur(MOINS_VERSE)} de moins, mais on
            finit avec {eur(PERTE_RETARD)} de capital en moins. La différence
            ({eur(PERTE_RETARD - MOINS_VERSE)}) correspond
            aux gains que les marchés auraient générés pendant ces 5 ans
            supplémentaires. Le temps est l&apos;ingrédient le plus précieux
            de l&apos;investissement.
          </p>
        </div>
      </section>

      {/* ── Section 3 : Effet des frais ───────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          L&apos;ennemi silencieux : l&apos;impact des frais sur 20 ans
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Pour un versement de 200€/mois sur 20 ans, voici ce que chaque
          niveau de frais annuels (TER) vous coûte réellement :
        </p>
        <div className="space-y-3">
          {/* Correctif du 28/09/2026 : la ligne de référence donnait
              « CW8, EWLD — 0,12 % ». Table de vérité : 0,38 % pour les deux
              (même fonds Amundi, EWLD en est la part distribuante). Les
              étiquettes « fonds actif standard » (0,50 %) et « assurance-vie
              classique » (1 %) attribuaient un niveau de frais non vérifié à
              toute une catégorie : on garde les niveaux, sans l'étiquette. */}
          {[
            {
              label: "MSCI World éligible PEA à frais bas (WPEA, DCAM)",
              ter: TER_MONDE_PEA_BAS,
              color: "text-emerald-700",
              bg: "bg-white border-gray-100",
            },
            {
              label: "Amundi MSCI World Swap (CW8, et EWLD en part distribuante)",
              ter: TER,
              color: "text-primary-700",
              bg: "bg-primary-50 border-primary-100",
            },
            {
              label: "Un produit à 0,50 %/an de frais",
              ter: 0.5,
              color: "text-orange-600",
              bg: "bg-white border-gray-100",
            },
            {
              label: "Un produit à 1 %/an de frais",
              ter: 1,
              color: "text-red-600",
              bg: "bg-white border-gray-100",
            },
          ]
            .map((row) => {
              const capital = sim(DUREE, row.ter).base.finalValue;
              const ecart = environ(capital) - FINAL_20;
              return {
                ...row,
                final: eur(capital),
                note: row.ter === TER ? "Référence de la page" : `${signe(ecart)} vs CW8`,
              };
            })
            .map((row) => (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${row.bg}`}
            >
              <div>
                <p className={`font-semibold text-sm ${row.color}`}>
                  {row.label}
                </p>
                <p className="text-xs text-gray-500">TER : {terAffiche(row.ter)} %</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-bold tabular-nums ${row.color}`}>
                  {row.final}
                </p>
                <p className={`text-xs font-semibold ${row.color}`}>
                  {row.note}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Sur 20 ans avec 200€/mois, passer de {terAffiche(TER_MONDE_PEA_BAS)} %
          à 1 % de frais annuels représente{" "}
          <strong className="text-gray-700">
            {/* Écart des deux lignes ARRONDIES ci-dessus, pour que la
                soustraction tombe juste à l'œil. */}
            {eur(
              environ(sim(DUREE, TER_MONDE_PEA_BAS).base.finalValue) -
                environ(sim(DUREE, 1).base.finalValue)
            )}{" "}
            de différence
          </strong>.
          Les frais bas ne sont pas un détail — c&apos;est une décision
          financière majeure.
        </p>
      </section>

      {/* ── CTA Simulateur ────────────────────────────────────────────────── */}
      <section className="mb-14 rounded-2xl bg-primary-600 p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Ajustez selon votre situation réelle
        </h2>
        <p className="text-primary-200 text-sm mb-6 leading-relaxed max-w-md mx-auto">
          Modifiez le versement, la durée, l&apos;inflation et les frais.
          Les 3 scénarios se recalculent instantanément. Vous pouvez aussi
          comparer deux stratégies côte à côte.
        </p>
        <Link
          href={SIMULATEUR_HREF}
          className="btn-secondary text-sm px-6 py-2.5 inline-flex"
        >
          Simuler avec 200€/mois →
        </Link>
        <p className="mt-4 text-primary-300 text-xs">
          Gratuit · Sans inscription · Export PDF disponible
        </p>
      </section>

      {/* ── Section 4 : Fiscalité ─────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          La fiscalité : ce que vous gardez vraiment
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          {eur(FINAL_20)} en PEA après 20 ans. Mais combien reste-t-il
          réellement au moment du retrait ?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
            <p className="font-bold text-primary-700 mb-3">PEA — après 5 ans</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Capital final</span>
                <span className="font-bold text-gray-900">{fmt(FINAL_20)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plus-value</span>
                <span className="font-medium text-gray-700">{fmt(GAIN_20)} €</span>
              </div>
              <div className="flex justify-between">
                {/* 17,2 % corrigé le 28/09/2026 : taux lu dans le barème
                    (LFSS 2026), montant calculé par impot-affiche. */}
                <span className="text-gray-500">Prélèvements sociaux ({taux(SOCIAL_CHARGES_RATE)} %)</span>
                <span className="font-medium text-orange-600">−{impotPEA(GAIN_20)} €</span>
              </div>
              <div className="flex justify-between border-t border-primary-100 pt-2">
                <span className="font-semibold text-primary-700">Net en poche</span>
                <span className="font-bold text-primary-700">{netApresPEA(FINAL_20, GAIN_20)} €</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="font-bold text-gray-700 mb-3">CTO</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Capital final</span>
                <span className="font-bold text-gray-900">{fmt(FINAL_20)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plus-value imposable</span>
                <span className="font-medium text-gray-700">{fmt(GAIN_20)} €</span>
              </div>
              <div className="flex justify-between">
                {/* 30 % corrigé le 28/09/2026 : PFU du barème 2026. */}
                <span className="text-gray-500">PFU ({taux(PFU_RATE)} %)</span>
                <span className="font-medium text-orange-600">−{impotCTO(GAIN_20)} €</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-semibold text-gray-700">Net en poche</span>
                <span className="font-bold text-gray-700">{netApresCTO(FINAL_20, GAIN_20)} €</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Avantage PEA : +{ecartFiscal(GAIN_20)} € sur 20 ans
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {/* « Ouvrir un PEA maintenant (même vide) » corrigé le 28/09/2026 :
                l'antériorité fiscale court à partir du premier versement, pas
                d'une ouverture sans dépôt (service-public.fr, F2385). */}
            Pour un résident français qui investit en ETF éligibles, le PEA
            est l&apos;enveloppe la moins taxée. Le délai des 5 ans court à
            partir du premier versement : un petit premier dépôt suffit à le
            déclencher, bien avant d&apos;investir pour de bon.{" "}
            <Link
              href="/pea-ou-cto"
              className="text-primary-600 underline hover:text-primary-700 transition-colors"
            >
              Guide complet PEA vs CTO →
            </Link>
          </p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <CeQuAuraitDonne monthlyAmount={200} />
      <SerieMontants courant={200} />

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
              href: "/investir-100-euros-mois-etf",
              title: "Simulation avec 100€/mois",
              desc: "Même approche pour un budget plus modeste.",
            },
            {
              href: "/investir-300-euros-mois-etf",
              title: "Simulation avec 300€/mois",
              desc: "Accélérer sa trajectoire vers l'indépendance financière.",
            },
            {
              href: "/strategie-dca",
              title: "La stratégie DCA complète",
              desc: "Principes, exemples, erreurs à éviter.",
            },
            {
              href: "/interets-composes",
              title: "Les intérêts composés expliqués",
              desc: "Comprendre la mécanique derrière ces projections.",
            },
            {
              href: "/meilleurs-etf-debutants",
              title: "Quels ETF choisir ?",
              desc: "Notre sélection avec comparatif TER et liquidité.",
            },
            {
              href: "/pea-ou-cto",
              title: "PEA ou CTO ?",
              desc: "Quelle enveloppe pour 200€/mois — guide détaillé.",
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


      <EtapeSuivante montantMensuel={200} />

      <RenvoiProduit contexte="Une fois le premier versement passé, la difficulté n'est plus le calcul : c'est de tenir le rythme, et de savoir chaque mois quelle ligne renforcer pour rester sur la répartition qu'on s'était fixée." />

      <SourcesReferences
        sources={[
          {
            label: "MSCI World Index — performance historique",
            url: "https://www.msci.com/indexes/index/990100",
            publisher: "MSCI Inc.",
            // « ~7 %/an net réel » corrigé le 28/09/2026 : les 7 %/an de la
            // page sont une hypothèse NOMINALE, avant frais et avant inflation.
            note: "Indice suivi par les ETF monde cités. Les 7 %/an des projections sont une hypothèse nominale, avant frais et avant inflation.",
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

      <EmailCapture source="simulation_200" />
    </div>
  );
}
