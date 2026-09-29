import type { Metadata } from "next";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import Link from "next/link";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";
import { EtapeSuivante } from "@/components/ui/EtapeSuivante";
import { CeQuAuraitDonne } from "@/components/backtest/CeQuAuraitDonne";
import { SerieMontants } from "@/components/money/SerieMontants";
import { runSimulation, SCENARIO_DELTA } from "@/lib/simulator";
import { runMonteCarlo } from "@/lib/monte-carlo";
import { TER_REFERENCE_SIMULATEUR, getETFBySymbol } from "@/lib/etf-config";
import { PEA_DEPOSIT_CAP_EUR } from "@/lib/fiscal/pea-cto";

// ─── Moteur ───────────────────────────────────────────────────────────────────
//
// Correctif du 28/09/2026. Jusqu'ici, chaque montant de la page était écrit à
// la main (156 300 € à 20 ans, 366 300 € à 30 ans…) avec une formule qui
// n'était pas celle du moteur — même à 0 % de frais, le moteur ne les
// redonne pas —, alors que la note sous le tableau annonçait « TER 0,20 % »
// et que le bouton « Simuler » ouvrait le simulateur avec fees=0.2 : le
// lecteur qui cliquait tombait sur un autre résultat. Désormais UN SEUL TER, celui du lien vers le simulateur
// (TER_REFERENCE_SIMULATEUR, le TER de CW8), et tous les montants — tableau,
// hero, FAQ, comparaison A/B, objectif retraite, Monte Carlo — sortent du
// moteur.

const MENSUEL = 300;
const RENDEMENT = 7;
const DUREE = 20;
const TER = TER_REFERENCE_SIMULATEUR;

const SIMULATEUR_HREF = `/simulateur?monthly=${MENSUEL}&years=${DUREE}&return=${RENDEMENT}&fees=${TER}`;

function sim(years: number, monthly = MENSUEL) {
  return runSimulation({
    monthlyAmount: monthly,
    durationYears: years,
    annualReturnPct: RENDEMENT,
    annualFeesPct: TER,
  });
}

/** 97753 → « 97 753 ». Séparateur de milliers en espace, comme le reste du site. */
const fmt = (v: number) =>
  String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
/** Une projection à vingt ans ne se donne pas à l'euro : centaine la plus proche. */
const environ = (v: number) => Math.round(v / 100) * 100;
const eur = (v: number) => `${fmt(environ(v))} €`;
const pctGain = (final: number, verse: number) =>
  `+${Math.round(((final - verse) / verse) * 100)} %`;
/** 0.38 → « 0,38 ». */
const terAffiche = (t: number) => t.toFixed(2).replace(".", ",");

// Scénario central : 20 ans. Le capital est arrondi à la centaine AVANT de
// calculer le gain, pour que « versé + gain = capital » reste vrai à l'œil.
const S20 = sim(DUREE).base;
const FINAL_20 = environ(S20.finalValue);
const VERSE_20 = S20.totalInvested;
const GAIN_20 = FINAL_20 - VERSE_20;

const S30 = sim(30).base;
const FINAL_30 = environ(S30.finalValue);

// Tableau 3 scénarios × 5 horizons. Les trois rendements sont ceux du
// simulateur (7 %/an ± SCENARIO_DELTA), pour que le tableau et l'écran du
// simulateur affichent les mêmes nombres.
const HORIZONS = [10, 15, 20, 25, 30] as const;
const LIGNES_TABLEAU = HORIZONS.map((y) => {
  const s = sim(y);
  return {
    y,
    inv: eur(s.base.totalInvested),
    p5: eur(s.conservative.finalValue),
    p7: eur(s.base.finalValue),
    p9: eur(s.optimistic.finalValue),
    highlight: y === DUREE,
  };
});

// Stratégie A (300 €/mois, 20 ans) contre B (400 €/mois, 15 ans) : le même
// total versé. L'ancien écart (29 400 €) ne sortait pas du moteur.
const MENSUEL_B = 400;
const DUREE_B = 15;
const SB = sim(DUREE_B, MENSUEL_B).base;
const FINAL_B = environ(SB.finalValue);
const VERSE_B = SB.totalInvested;
const ECART_AB = FINAL_20 - FINAL_B;

// Objectif retraite par la règle des 4 % : capital = rente annuelle / 4 %.
// La durée est lue dans la trajectoire du moteur (première année où le
// capital dépasse la cible) au lieu d'être estimée à la main — les anciennes
// durées (~20, ~28, ~33 ans) ne tenaient pas compte des frais.
const TAUX_RETRAIT = 0.04;
const TRAJECTOIRE = sim(60).base.monthlyData;
function anneesPour(cible: number): number | undefined {
  return TRAJECTOIRE.find((p) => p.portfolioValue >= cible)?.year;
}
const renteMensuelle = (capital: number) =>
  Math.round((capital * TAUX_RETRAIT) / 12 / 10) * 10;

const FIRE_TABLE = [
  { rente: 500, note: "Complément de retraite confortable" },
  { rente: 1000, note: "Remplace un revenu partiel" },
  { rente: 1500, note: "Autonomie financière complète" },
].map(({ rente, note }) => {
  const capital = (rente * 12) / TAUX_RETRAIT;
  const annees = anneesPour(capital);
  return {
    rente: `${fmt(rente)} €/mois`,
    capital: `${fmt(capital)} €`,
    duree: annees ? `~${annees} ans` : "—",
    annees,
    note,
  };
});
const FIRE_1000 = FIRE_TABLE[1];

// Monte Carlo : le même moteur, la même amorce et les mêmes paramètres que
// l'analyse du simulateur (fees = TER), donc les mêmes percentiles que ce que
// le lecteur voit après avoir cliqué. Les anciens chiffres (≈ 98 000 /
// 148 000 / 218 000 €) étaient écrits à la main.
const MC = runMonteCarlo({
  monthlyAmount: MENSUEL,
  durationYears: DUREE,
  annualReturnPct: RENDEMENT,
  annualFeesPct: TER,
  startingCapital: 0,
});

/** Plafond de versements du PEA atteint au bout de N années à 300 €/mois. */
const ANS_PLAFOND_PEA = (PEA_DEPOSIT_CAP_EUR / (MENSUEL * 12))
  .toFixed(1)
  .replace(".", ",");

/** TER lus dans le catalogue, lui-même aligné sur la table de vérité du 28/09/2026. */
const terDe = (sym: string, repli: number) =>
  terAffiche(getETFBySymbol(sym)?.ter ?? repli);

const TITLE =
  "Investir 300 €/mois en ETF : combien après 10, 20, 30 ans ?";
const DESCRIPTION =
  // L'ancienne meta donnait toute la réponse dans l'extrait Google (et un
  // chiffre que le simulateur ne redonnait pas). Le chiffre reste, calculé ;
  // la raison de cliquer est ce que l'extrait ne peut pas livrer.
  `300 €/mois en ETF : ≈ ${eur(FINAL_20)} en 20 ans à 7 %/an. Et ce que le même effort aurait vraiment donné depuis 2008, krach compris.`;
const CANONICAL = "/investir-300-euros-mois-etf";

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

const FAQ = [
  {
    q: "Peut-on viser l'indépendance financière avec 300€/mois ?",
    // Corrigé le 28/09/2026 : l'ancienne réponse disait « 28 ans » (calcul
    // sans frais) et « retirer 1 000 €/mois indéfiniment sans toucher au
    // principal » — faux, et contredit par la réponse suivante : la règle des
    // 4 % vise 30 ans de retraits, principal compris.
    a: `Oui, si l'horizon est suffisamment long. Avec 300 €/mois, 7 %/an de rendement et ${terAffiche(TER)} % de frais annuels, le capital dépasse ${FIRE_1000.capital} au bout d'environ ${FIRE_1000.annees ?? "—"} ans. Selon la règle des 4 %, ce capital permet de retirer ${FIRE_1000.rente} pendant une trentaine d'années. C'est la base du mouvement FIRE (Financial Independence, Retire Early) appliquée à la réalité d'un salarié français.`,
  },
  {
    q: "La règle des 4% est-elle fiable ?",
    // Date et « taux de succès de 96 % » retirés le 28/09/2026 : ni l'un ni
    // l'autre ne figure dans les sources vérifiées de la page.
    a: "La règle des 4 % vient d'une étude américaine dite « Trinity » : un portefeuille diversifié (actions + obligations) dont on retire 4 %/an a tenu 30 ans dans la plupart des périodes testées sur les données historiques américaines. C'est une approximation utile, pas une garantie. L'analyse Monte Carlo du simulateur (Premium) simule 1 000 marchés possibles et donne la distribution des résultats, pas une seule ligne.",
  },
  {
    q: "300€/mois en PEA : est-ce compatible avec le plafond ?",
    a: `Oui. Le plafond de versement du PEA est de ${fmt(PEA_DEPOSIT_CAP_EUR)} €. À 300 €/mois, il est atteint au bout de ${ANS_PLAFOND_PEA} ans de versements, bien au-delà de la plupart des horizons d'investissement. Au-delà du plafond, les versements peuvent continuer sur un compte-titres, sur le même indice.`,
  },
  {
    q: "Quels ETF choisir pour 300€/mois ?",
    // Corrigé le 28/09/2026 d'après la table de vérité (émetteurs + justETF) :
    // l'ancienne réponse proposait « AEEM ou PAEEM » comme si c'était
    // interchangeable — AEEM n'est PAS éligible au PEA (reporting Amundi du
    // 31/08/2026), PAEEM l'est. WSML retiré : absent de la table de vérité.
    // Les MSCI World PEA à 0,20 % (WPEA, DCAM) n'étaient pas cités.
    a: `Un seul ETF monde suffit à porter un DCA. Sur PEA, WPEA et DCAM (${terDe("WPEA", 0.2)} % de frais annuels) et CW8 (${terDe("CW8", 0.38)} %) répliquent tous le MSCI World. VWCE (FTSE All-World, ${terDe("VWCE", 0.14)} %) n'est pas éligible au PEA : il se loge sur un compte-titres. Certains investisseurs ajoutent une poche marchés émergents, par exemple 80 % MSCI World + 20 % émergents : sur PEA, l'ETF émergents éligible de notre sélection est PAEEM ; AEEM, l'ETF émergents « Swap » d'Amundi, n'est pas éligible au PEA. D'autres ajoutent une poche de petites capitalisations. Ces ajouts ne changent pas la mécanique du DCA : ils se décident une fois la base en place.`,
  },
  {
    q: "Comment comparer deux stratégies différentes (300€/mois 20 ans vs 400€/mois 15 ans) ?",
    a: "C'est exactement pour ça qu'existe la fonctionnalité de comparaison A vs B du simulateur. Avec Premium, vous saisissez deux scénarios indépendants et voyez côte à côte quel capital final chacun produit — avec la différence en euros et en pourcentage calculée automatiquement.",
  },
];

export default function Investir300EurosMoisPage() {
  return (
    // Wrapper opaque bg-white pour stopper le leak AmbientBackground mesh.
    // Page longue de lecture → fond calme et lisible.
    <div className="bg-white">
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
          Investir 300€/mois en ETF
        </span>
      </nav>

      {/* H1 + intro */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Investir 300€ par mois en ETF : simulation et objectif retraite
      </h1>
      <p className="text-lg text-gray-500 mb-12 leading-relaxed">
        300€ par mois est le versement qui, sur 20 à 30 ans, ouvre des
        possibilités concrètes d&apos;indépendance financière. À 7 % de
        rendement annuel et {terAffiche(TER)} % de frais sur 20 ans, ce
        montant donne environ{" "}
        <strong className="text-gray-700">{eur(FINAL_20)}</strong>, dont{" "}
        {eur(GAIN_20)} produits par les marchés. Sur 30 ans, ce capital
        atteint environ{" "}
        <strong className="text-gray-700">{eur(FINAL_30)}</strong>. Voici la
        simulation complète, avec l&apos;objectif retraite intégré, puis ce
        que 300 €/mois auraient réellement donné sur les vrais cours.
      </p>

      <ArticleByline
        publishedAt="2026-04-19"
        updatedAt="2026-09-28"
        readingMinutes={8}
        url="/investir-300-euros-mois-etf"
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* ── Bloc résultat mis en avant — slate-950 + radial halo (Premium
          identity, cohérent avec SimulatorHero et TrackingPitch). ─────── */}
      <div className="relative rounded-2xl bg-slate-950 p-8 text-white mb-14 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(600px circle at 50% 30%, rgba(59, 130, 246, 0.22), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <p className="text-slate-400 text-sm font-medium mb-2">
            300€/mois · 20 ans · 7%/an · TER {terAffiche(TER)} %
          </p>
          <p className="text-5xl font-bold tabular-nums mb-1 text-white">{eur(FINAL_20)}</p>
          <p className="text-slate-400 text-sm mb-6">
            dont {eur(VERSE_20)} versés — et {eur(GAIN_20)} générés par les marchés
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-slate-400 text-xs mb-1">Capital investi</p>
              <p className="font-bold text-white">{eur(VERSE_20)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-slate-400 text-xs mb-1">Gain marché</p>
              <p className="font-bold text-emerald-400">+{eur(GAIN_20)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-slate-400 text-xs mb-1">Performance</p>
              <p className="font-bold text-emerald-400">{pctGain(FINAL_20, VERSE_20)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-slate-400 text-xs mb-1">Sur 30 ans</p>
              <p className="font-bold text-emerald-400">{eur(FINAL_30)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 1 : Tableau complet ───────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Simulation complète : 3 scénarios sur 5 horizons
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Capital investi : 300€ × 12 mois × durée.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Durée
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Investi
                </th>
                <th className="text-right px-4 py-3 font-semibold text-orange-500 border-b border-gray-100">
                  {RENDEMENT - SCENARIO_DELTA} %/an
                </th>
                <th className="text-right px-4 py-3 font-semibold text-primary-600 border-b border-gray-100">
                  {RENDEMENT} %/an
                </th>
                <th className="text-right px-4 py-3 font-semibold text-emerald-600 border-b border-gray-100">
                  {RENDEMENT + SCENARIO_DELTA} %/an
                </th>
              </tr>
            </thead>
            <tbody>
              {LIGNES_TABLEAU.map((row, i) => (
                <tr
                  key={row.y}
                  className={row.highlight ? "bg-primary-50/60 font-semibold" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-50 font-semibold">
                    {row.y} ans
                    {row.highlight && (
                      <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">
                        référence
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 border-b border-gray-50">
                    {row.inv}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-600 font-semibold border-b border-gray-50">
                    {row.p5}
                  </td>
                  <td className="px-4 py-3 text-right text-primary-700 font-bold border-b border-gray-50">
                    {row.p7}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-semibold border-b border-gray-50">
                    {row.p9}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500">
          {/* « TER 0,20 %/an » : faux jusqu'au 28/09/2026, les montants
              ne sortaient pas du moteur et le lien Simuler portait 0,2. */}
          Rendements nets de {terAffiche(TER)} % de frais annuels (TER de
          CW8), les mêmes que dans le simulateur. Hors inflation et fiscalité.
          Les rendements passés ne garantissent pas les performances futures.
        </p>
      </section>

      {/* ── Section 2 : Objectif retraite + FIRE ──────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Objectif retraite : combien de temps faut-il ?
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          La règle des 4% est une approximation utilisée dans la planification
          de l&apos;indépendance financière : un portefeuille peut être retiré
          à 4%/an sans s&apos;épuiser sur 30 ans, selon les données historiques.
        </p>
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 mb-6">
          <p className="text-sm font-semibold text-primary-800 mb-2">
            Comment lire ce tableau
          </p>
          <p className="text-sm text-primary-700 leading-relaxed">
            Capital cible = rente mensuelle souhaitée × 300.
            Exemple : pour {FIRE_1000.rente} de rente, il faut{" "}
            {FIRE_1000.capital} de capital. Avec 300 €/mois à 7 %/an
            ({terAffiche(TER)} % de frais), ce capital est atteint en environ{" "}
            {FIRE_1000.annees ?? "—"} ans.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Rente souhaitée
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Capital cible
                </th>
                <th className="text-right px-4 py-3 font-semibold text-primary-600 border-b border-gray-100">
                  Durée (7 %/an, TER {terAffiche(TER)} %)
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Usage typique
                </th>
              </tr>
            </thead>
            <tbody>
              {FIRE_TABLE.map((row, i) => (
                <tr
                  key={row.rente}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-3 font-bold text-gray-900 border-b border-gray-50">
                    {row.rente}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 border-b border-gray-50">
                    {row.capital}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary-700 border-b border-gray-50">
                    {row.duree}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs border-b border-gray-50">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Ce que ces chiffres signifient concrètement
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Un salarié de 30 ans qui commence à investir 300 €/mois
            aujourd&apos;hui atteindrait environ {eur(FINAL_20)} à 50 ans (avec
            7 %/an) — soit environ{" "}
            <strong>
              {fmt(renteMensuelle(FINAL_20))} €/mois de rente via la règle des 4 %
            </strong>
            . Cela ne remplace pas un salaire complet, mais complète
            significativement la retraite par répartition. À 60 ans (30 ans
            d&apos;investissement), le capital atteint environ {eur(FINAL_30)},
            soit <strong>{fmt(renteMensuelle(FINAL_30))} €/mois de rente</strong>.
          </p>
        </div>
      </section>

      {/* ── CTA Simulateur — slate-950 glass (mirror TrackingPitch) ───── */}
      <section className="relative mb-14 rounded-2xl bg-slate-950 p-8 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(500px circle at 50% 40%, rgba(59, 130, 246, 0.2), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <h2 className="text-xl font-bold text-white mb-2">
            Projetez votre horizon retraite personnalisé
          </h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed max-w-md mx-auto">
            Ajustez le versement, la durée et les frais selon votre situation.
            Pour les utilisateurs Premium : l&apos;analyse Monte Carlo simule
            1 000 marchés possibles et donne la distribution réelle de vos
            résultats — pas juste une ligne optimiste.
          </p>
          <Link
            href={SIMULATEUR_HREF}
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-950 font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Simuler avec 300€/mois →
          </Link>
          <p className="mt-4 text-slate-400 text-xs">
            Gratuit · 3 scénarios · Export PDF · Analyse Monte Carlo en Premium
          </p>
        </div>
      </section>

      {/* ── Section 3 : Comparaison A vs B ───────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          300€/mois 20 ans vs 400€/mois 15 ans : lequel gagne ?
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Une question courante : vaut-il mieux investir plus longtemps avec
          moins, ou moins longtemps avec plus ? La simulation chiffrée surprend
          souvent.
        </p>
        {/* 2 cards siblings au même traitement visuel (bg-white + border
            slate-200/70). Différenciation de A via un pill "Recommandée"
            uniquement. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Stratégie A
              </p>
              {/* « Recommandée » remplacé le 28/09/2026 : le site décrit et
                  compare, il ne recommande pas (pas de statut CIF). */}
              <span className="inline-flex items-center bg-primary-50 text-primary-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-primary-100 uppercase tracking-wide">
                Plus gros capital
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              300€/mois · <strong>20 ans</strong>
            </p>
            <p className="text-3xl font-bold text-primary-700 mb-1 tabular-nums">
              {eur(FINAL_20)}
            </p>
            <p className="text-xs text-gray-500">
              total investi : {eur(VERSE_20)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Stratégie B
            </p>
            <p className="text-sm text-gray-600 mb-1">
              {MENSUEL_B}€/mois · <strong>{DUREE_B} ans</strong>
            </p>
            <p className="text-3xl font-bold text-gray-700 mb-1 tabular-nums">
              {eur(FINAL_B)}
            </p>
            <p className="text-xs text-gray-500">
              total investi : {eur(VERSE_B)}
            </p>
          </div>
        </div>
        {/* Insight callout — container neutre, amber UNIQUEMENT sur un
            petit pill d'ouverture. */}
        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3">
            <span>⚡ Insight</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Même montant total investi — mais {eur(ECART_AB)} d&apos;écart
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Les deux stratégies impliquent {eur(VERSE_20)} de versements totaux.
            Pourtant, A bat B d&apos;environ {eur(ECART_AB)} — uniquement grâce à {DUREE - DUREE_B} ans
            supplémentaires de capitalisation. Le temps, pas le montant,
            est le paramètre le plus puissant de l&apos;investissement
            à long terme.
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Comparez vos propres stratégies en temps réel avec la{" "}
          <Link
            href="/simulateur"
            className="text-primary-600 underline hover:text-primary-700 transition-colors"
          >
            fonctionnalité A vs B du simulateur →
          </Link>
        </p>
      </section>

      {/* ── Section 4 : Incertitude / Monte Carlo ─────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          L&apos;incertitude des marchés : pourquoi 7% n&apos;est pas garanti
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Ces projections utilisent un rendement annuel moyen fixe. En
          réalité, les marchés sont volatils : certaines années +20%,
          d&apos;autres −30%. L&apos;ordre de ces rendements change
          significativement le résultat final.
        </p>
        {/* 3 tiles siblings au même traitement (bg-white + border slate-200/70).
            La couleur ne vit QUE sur la valeur et sur le label de percentile,
            jamais sur le fond de la tile. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Pire cas (10e percentile)",
              value: `≈ ${eur(MC.finalP10)}`,
              sub: "1 marché sur 10",
              color: "text-orange-600",
            },
            {
              label: "Médiane (50e percentile)",
              value: `≈ ${eur(MC.finalP50)}`,
              sub: "résultat médian",
              color: "text-primary-700",
            },
            {
              label: "Meilleur cas (90e percentile)",
              value: `≈ ${eur(MC.finalP90)}`,
              sub: "1 marché sur 10",
              color: "text-emerald-700",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="card-dense text-center"
            >
              <p className="text-xs text-gray-500 mb-2 leading-snug">
                {s.label}
              </p>
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>
                {s.value}
              </p>
              <p className={`text-xs mt-1 ${s.color}`}>{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Ces chiffres viennent d&apos;une analyse Monte Carlo
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            L&apos;analyse Monte Carlo simule 1 000 marchés différents avec
            une volatilité supposée de 15 %/an, un ordre de grandeur pour un
            ETF actions monde, et les mêmes {terAffiche(TER)} % de frais que
            le reste de la page. Elle donne une distribution de résultats —
            bien plus utile qu&apos;une seule projection à 7 %.
          </p>
          <Link
            href={SIMULATEUR_HREF}
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            Voir l&apos;analyse Monte Carlo dans le simulateur →
          </Link>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <CeQuAuraitDonne monthlyAmount={300} />
      <SerieMontants courant={300} />

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
              desc: "Le point d'entrée pour commencer petit.",
            },
            {
              href: "/investir-200-euros-mois-etf",
              title: "Simulation avec 200€/mois",
              desc: "La simulation complète pour un budget intermédiaire.",
            },
            {
              href: "/strategie-dca",
              title: "La stratégie DCA expliquée",
              desc: "Principes, avantages, erreurs courantes.",
            },
            {
              href: "/interets-composes",
              title: "Les intérêts composés",
              desc: "La mécanique derrière l'accélération du capital.",
            },
            {
              href: "/pea-ou-cto",
              title: "PEA ou CTO pour 300€/mois",
              desc: "Fiscalité, plafonds, comparatif complet.",
            },
            {
              href: "/meilleurs-etf-debutants",
              title: "Quels ETF choisir ?",
              desc: "CW8, VWCE, PAEEM — notre sélection commentée.",
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


      <EtapeSuivante montantMensuel={300} />

      <SourcesReferences
        sources={[
          {
            label: "MSCI World Index — performance historique",
            url: "https://www.msci.com/indexes/index/990100",
            publisher: "MSCI Inc.",
            // « ~7 %/an net réel » retiré le 28/09/2026 : les simulations
            // sont nominales (avant inflation), nettes du seul TER, et 7 %/an
            // est une hypothèse de la page, pas une donnée MSCI vérifiée.
            note: "Indice répliqué par les ETF monde cités (WPEA, DCAM, CW8). Les 7 %/an des simulations sont une hypothèse, pas une performance garantie.",
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

      <EmailCapture source="simulation_300" />
      </div>
    </div>
  );
}
