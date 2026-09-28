import type { Metadata } from "next";
import { TER_REFERENCE_SIMULATEUR } from "@/lib/etf-config";
import { runSimulation } from "@/lib/simulator";
import { paramsFromSearch } from "@/lib/simulation-params";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE = "Simulateur retraite : combien investir par mois ?";
const DESCRIPTION =
  "Combien investir par mois pour sa retraite en ETF : tableaux par âge de départ, règle des 4 % et la rente en euros d'aujourd'hui, pas en euros futurs.";
const CANONICAL = "/simulateur-retraite";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "article",
    images: [{ url: "https://dcatracker.fr/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
//
// ⚠️ RÉÉCRIT LE 28/09/2026 — deux défauts qui se cumulaient.
//
// 1. Toutes les projections étaient écrites à la main, à 7 % par an SANS frais,
//    alors que le reste du site calcule à 7 % MOINS les frais de référence (ceux
//    de CW8) — et que le bouton « Simuler » de cette même page ouvrait le
//    simulateur AVEC ces frais. Le même effort donnait un chiffre ici et un autre
//    un clic plus loin.
// 2. La FAQ affirmait que ces chiffres étaient « nets d'inflation », donc en
//    pouvoir d'achat d'aujourd'hui. C'est faux : ce sont des euros FUTURS. Sur
//    40 ans à 2 % d'inflation, un euro de 2066 vaut moins de la moitié d'un euro
//    d'aujourd'hui. Une page qui dit à un lecteur de 25 ans « vous aurez 2 500 €
//    de rente » sans ajouter « soit ~1 100 € d'aujourd'hui » lui vend un chiffre
//    qu'il ne touchera pas.
//
// Tout est désormais calculé par le moteur du simulateur, et chaque rente est
// donnée aussi en euros d'aujourd'hui, avec l'inflation par défaut du simulateur
// (la même formule que /methodologie : valeur / (1 + inflation)^années).
const RENDEMENT_BRUT = 7;
const INFLATION_PCT = paramsFromSearch(new URLSearchParams()).input.annualInflationPct ?? 2;
const TAUX_RETRAIT = 0.04; // règle des 4 %

/** Capital projeté par le moteur, même convention que tout le site. */
function capitalProjete(mensuel: number, annees: number): number {
  return runSimulation({
    monthlyAmount: mensuel,
    durationYears: annees,
    annualReturnPct: RENDEMENT_BRUT,
    annualFeesPct: TER_REFERENCE_SIMULATEUR,
  }).base.finalValue;
}
/** Ramène un montant futur en euros d'aujourd'hui. */
function enEurosDAujourdhui(montant: number, annees: number): number {
  return montant / Math.pow(1 + INFLATION_PCT / 100, annees);
}
/** Rente mensuelle d'un capital par la règle des 4 %. */
const renteMensuelle = (capital: number) => (capital * TAUX_RETRAIT) / 12;
/**
 * Versement mensuel nécessaire pour atteindre un capital. Sans capital de
 * départ, le résultat du moteur est proportionnel au versement : une règle de
 * trois sur le résultat pour 1 € suffit, sans recherche itérative.
 */
function versementPour(capitalVise: number, annees: number): number {
  return capitalVise / capitalProjete(1, annees);
}
/** Année (depuis le début) où le capital franchit un seuil, lue dans le moteur. */
function anneesPourAtteindre(mensuel: number, capitalVise: number, max = 60): number | null {
  const pts = runSimulation({
    monthlyAmount: mensuel,
    durationYears: max,
    annualReturnPct: RENDEMENT_BRUT,
    annualFeesPct: TER_REFERENCE_SIMULATEUR,
  }).base.monthlyData;
  const p = pts.find((x) => x.portfolioValue >= capitalVise);
  return p ? p.year : null;
}

const eur = (v: number, pas = 100) =>
  (Math.round(v / pas) * pas).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";

function ligne(mensuel: number, annees: number) {
  const capital = capitalProjete(mensuel, annees);
  const rente = renteMensuelle(capital);
  return {
    monthly: mensuel,
    capital: eur(capital, 1000),
    rente: `${eur(rente, 10)}/mois`,
    renteAujourdhui: `${eur(enEurosDAujourdhui(rente, annees), 10)}/mois`,
  };
}

const AGE_START_SCENARIOS = [
  { startAge: 25, retireAge: 65, years: 40, montants: [100, 200, 300, 500, 1000] },
  { startAge: 35, retireAge: 65, years: 30, montants: [100, 200, 300, 500, 1000] },
  { startAge: 45, retireAge: 65, years: 20, montants: [100, 200, 300, 500, 1000] },
  { startAge: 55, retireAge: 67, years: 12, montants: [100, 200, 500, 1000, 2000] },
].map((sc) => ({ ...sc, rows: sc.montants.map((m) => ligne(m, sc.years)) }));

// Les repères utilisés dans le texte de la page, calculés une fois.
const RENTE_CIBLE = 2500;
const CAPITAL_CIBLE = (RENTE_CIBLE * 12) / TAUX_RETRAIT;
const VERSEMENT_25_ANS = versementPour(CAPITAL_CIBLE, 40);
const VERSEMENT_35_ANS = versementPour(CAPITAL_CIBLE, 30);
const RENTE_CIBLE_AUJOURDHUI_40 = enEurosDAujourdhui(RENTE_CIBLE, 40);
const EFFORT_300_30_ANS = capitalProjete(300, 30);
const EFFORT_300_40_ANS = capitalProjete(300, 40);
const EFFORT_300_45_A_65 = capitalProjete(300, 20);
const AGE_SEUIL_300 = anneesPourAtteindre(300, CAPITAL_CIBLE);
const AGE_SEUIL_500 = anneesPourAtteindre(500, CAPITAL_CIBLE);

// Capital needed for a target monthly income via the 4% rule
const RENTE_TABLE = [
  { rente: "500 €/mois", capital: "150 000 €", comment: "Complément léger de retraite" },
  { rente: "1 000 €/mois", capital: "300 000 €", comment: "Renforce une retraite modeste" },
  { rente: "1 500 €/mois", capital: "450 000 €", comment: "Complément significatif" },
  { rente: "2 000 €/mois", capital: "600 000 €", comment: "Rente confortable" },
  { rente: "2 500 €/mois", capital: "750 000 €", comment: "Seuil FIRE classique en France" },
  { rente: "3 500 €/mois", capital: "1 050 000 €", comment: "Autonomie financière complète" },
];

const FAQ = [
  {
    q: "Le DCA sur ETF peut-il remplacer le PER (Plan d'Épargne Retraite) ?",
    a: "Non, ce sont deux outils complémentaires. Le PER offre une déduction fiscale à l'entrée (votre versement réduit votre revenu imposable) mais l'argent est bloqué jusqu'à la retraite. Le DCA en PEA est plus flexible (disponible à tout moment après 5 ans) et offre une fiscalité excellente après 5 ans. Stratégie typique : PEA en priorité (liquidité), PER si tranche marginale d'imposition élevée (économie d'impôt immédiate).",
  },
  {
    q: "Est-ce que 300 €/mois suffisent pour ma retraite ?",
    a: `Cela dépend de votre âge de départ. En commençant à 25 ans, 300 €/mois pendant 40 ans donnent environ ${eur(EFFORT_300_40_ANS, 1000)} — une rente de ${eur(renteMensuelle(EFFORT_300_40_ANS), 10)}/mois par la règle des 4 %, soit ${eur(enEurosDAujourdhui(renteMensuelle(EFFORT_300_40_ANS), 40), 10)}/mois en euros d'aujourd'hui. En commençant à 45 ans, le même effort donne ${eur(EFFORT_300_45_A_65, 1000)} : un complément, pas un revenu principal. Le levier, c'est le temps.`,
  },
  {
    q: "Combien faut-il pour être 'libre financièrement' en France ?",
    a: `La règle des 4 % appliquée à un capital de ${eur(CAPITAL_CIBLE, 1000)} donne ${eur(RENTE_CIBLE, 10)}/mois : c'est le seuil souvent cité par le mouvement FIRE. À 300 €/mois investis dès 25 ans, on l'atteint${AGE_SEUIL_300 ? ` vers ${25 + AGE_SEUIL_300} ans` : " au-delà de 60 ans d'effort"} ; à 500 €/mois, ${AGE_SEUIL_500 ? `vers ${25 + AGE_SEUIL_500} ans` : "au-delà de 60 ans d'effort"}. Mais ce seuil est exprimé en euros de l'époque : dans 40 ans, ${eur(RENTE_CIBLE, 10)}/mois auront le pouvoir d'achat d'environ ${eur(RENTE_CIBLE_AUJOURDHUI_40, 10)} aujourd'hui, à ${INFLATION_PCT} % d'inflation par an.`,
  },
  {
    q: "La règle des 4 % est-elle toujours valable aujourd'hui ?",
    a: "La règle des 4 % vient du Trinity Study (USA, années 1990). Elle indique qu'un portefeuille diversifié (60 % actions / 40 % obligations) supporte un retrait annuel de 4 % pendant 30 ans avec très faible probabilité d'épuisement. C'est une approximation, pas une garantie. Des études récentes suggèrent de prendre 3,5 % pour être plus sûr, ou d'adopter un retrait variable selon la performance. À utiliser comme ordre de grandeur, pas comme plan exact.",
  },
  {
    q: "Faut-il arrêter d'investir une fois à la retraite ?",
    a: "Non, mais on ajuste. En phase de décumulation, on réduit progressivement la part actions (ETF monde) pour augmenter les obligations et le cash — c'est la 'glide path'. Un portefeuille 100 % MSCI World est idéal pour accumuler à 30 ans, mais trop volatil pour vivre des retraits à 70 ans. Envisagez de passer à 60/40 actions/obligations dans les 5-10 ans précédant la retraite.",
  },
  {
    q: "L'inflation est-elle prise en compte dans ces simulations ?",
    a: `Oui, et c'est la colonne à regarder. Les capitaux et les rentes de cette page sont calculés en euros de l'époque où vous les toucherez : ce sont des euros FUTURS. La colonne « en euros d'aujourd'hui » les ramène au pouvoir d'achat actuel, avec ${INFLATION_PCT} % d'inflation par an — la même hypothèse que le simulateur. Sur 40 ans, cela divise un montant par plus de deux. Les projections supposent ${RENDEMENT_BRUT} % de rendement par an avant frais, dont on retranche ${TER_REFERENCE_SIMULATEUR.toLocaleString("fr-FR")} % de frais : c'est une hypothèse de travail, pas une promesse.`,
  },
  {
    q: "Le PEA est-il plafonné — comment faire si je dépasse 150 000 € ?",
    a: "Le plafond de versement du PEA est de 150 000 € (susceptible d'être relevé). À 500 €/mois, vous l'atteignez en 25 ans. La stratégie classique : saturer le PEA d'abord (meilleure fiscalité), puis basculer les versements supplémentaires vers un CTO ou une assurance-vie multi-supports (fiscalité intéressante après 8 ans + abattement transmission). Le PEA continue à fructifier sans friction fiscale même quand vous n'alimentez plus.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SimulateurRetraitePage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          url: `${siteUrl}${CANONICAL}`,
          author: { "@type": "Organization", name: "DCA Tracker" },
          publisher: { "@type": "Organization", name: "DCA Tracker", url: siteUrl },
        }}
      />
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
        <span className="text-gray-600" aria-current="page">Simulateur de retraite</span>
      </nav>

      {/* Hero */}
      <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">
        Simulateur
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Préparer sa retraite avec un DCA en ETF
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-8">
        Combien investir par mois pour avoir 2 000 € de rente à la retraite ?
        Cette page vous donne les chiffres concrets selon votre âge de départ —
        en euros de l&apos;époque ET en euros d&apos;aujourd&apos;hui, parce que
        c&apos;est le second qui dit ce que vous pourrez vraiment acheter — avec
        la règle des 4 % pour estimer la rente.
      </p>

      {/* Flagship block */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-6 sm:p-8 mb-12 text-white">
        <p className="text-xs font-semibold text-primary-200 uppercase tracking-wider mb-2">
          Exemple type
        </p>
        <p className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight mb-2">
          2 500 €/mois
        </p>
        <p className="text-sm text-primary-100 leading-relaxed mb-4">
          C&apos;est la rente que génère un capital de {eur(CAPITAL_CIBLE, 1000)}{" "}
          via la règle des 4 %. Pour l&apos;atteindre à 65 ans, il faut environ
          <strong> {eur(VERSEMENT_25_ANS, 10)}/mois </strong> dès 25 ans, ou
          <strong> {eur(VERSEMENT_35_ANS, 10)}/mois </strong> si vous démarrez à 35 ans.
          Attention : ce sont des euros de {new Date().getFullYear() + 40}. En pouvoir d&apos;achat
          d&apos;aujourd&apos;hui, cette rente vaudrait environ{" "}
          <strong>{eur(RENTE_CIBLE_AUJOURDHUI_40, 10)}/mois</strong>.
        </p>
        <Link
          href={`/simulateur?monthly=300&years=40&return=${RENDEMENT_BRUT}&fees=${TER_REFERENCE_SIMULATEUR}&inflationOn=1`}
          className="btn-white-primary btn-lift"
        >
          Simuler ma propre retraite →
        </Link>
      </div>

      {/* Règle des 4 % */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        La règle des 4 % : de quoi parle-t-on ?
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        La règle des 4 % est la méthode la plus utilisée pour transformer un
        capital investi en <strong>rente mensuelle durable</strong>. Elle dit
        qu&apos;un portefeuille diversifié peut supporter un retrait annuel de
        4 % de sa valeur initiale pendant au moins 30 ans sans risque
        significatif d&apos;épuisement.
      </p>
      <p className="text-gray-700 leading-relaxed mb-6">
        Concrètement : pour 1 000 € de rente mensuelle, il faut
        <strong> 300 000 € de capital</strong>. Pour 2 500 €/mois :
        <strong> 750 000 €</strong>. Cette règle n&apos;est pas un contrat, mais
        c&apos;est l&apos;ordre de grandeur communément admis.
      </p>

      {/* Rente table */}
      <h3 className="text-lg font-bold text-gray-900 mb-3">
        Quelle rente vise-t-on ? Voici le capital nécessaire
      </h3>
      <div className="overflow-x-auto rounded-xl border border-gray-100 mb-12">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Rente mensuelle</th>
              <th className="text-left px-4 py-3 font-semibold">Capital nécessaire</th>
              <th className="text-left px-4 py-3 font-semibold">Positionnement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {RENTE_TABLE.map((r) => (
              <tr key={r.rente} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900 tabular-nums">{r.rente}</td>
                <td className="px-4 py-3 text-primary-700 font-bold tabular-nums">{r.capital}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{r.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Age-based tables */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Combien faut-il investir selon l&apos;âge où vous commencez ?
      </h2>
      <p className="text-gray-700 leading-relaxed mb-8">
        Le levier principal n&apos;est pas le montant, c&apos;est le{" "}
        <strong>temps</strong>. Plus vous commencez tôt, plus les intérêts
        composés travaillent pour vous. Voici les chiffres pour différents
        âges de départ, avec un rendement moyen net de 7 %/an.
      </p>

      <div className="space-y-6 mb-12">
        {AGE_START_SCENARIOS.map((scenario) => (
          <div
            key={scenario.startAge}
            className={`rounded-2xl border px-5 py-5 ${
              scenario.startAge <= 35
                ? "border-primary-100 bg-primary-50/30"
                : "border-gray-100 bg-white"
            }`}
          >
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
              <p className="text-base font-bold text-gray-900">
                Départ à {scenario.startAge} ans, retraite à {scenario.retireAge} ans
              </p>
              <span className="text-xs text-gray-500 tabular-nums">
                {scenario.years} ans d&apos;investissement
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="text-left font-semibold py-1">Versement mensuel</th>
                    <th className="text-right font-semibold py-1">Capital à la retraite</th>
                    <th className="text-right font-semibold py-1">Rente possible (4 %)</th>
                    <th className="text-right font-semibold py-1">En € d&apos;aujourd&apos;hui</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scenario.rows.map((r) => (
                    <tr key={r.monthly}>
                      <td className="py-1.5 text-gray-700 tabular-nums">
                        {r.monthly} €/mois
                      </td>
                      <td className="py-1.5 text-right font-bold text-gray-900 tabular-nums">
                        {r.capital}
                      </td>
                      <td className="py-1.5 text-right text-primary-700 font-semibold tabular-nums">
                        {r.rente}
                      </td>
                      <td className="py-1.5 text-right text-gray-500 tabular-nums">
                        {r.renteAujourdhui}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* The time lever */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Commencer 10 ans plus tôt change tout
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Exemple concret : 300 €/mois pendant 30 ans donnent environ{" "}
        <strong>{eur(EFFORT_300_30_ANS, 1000)}</strong>. Les mêmes 300 €/mois
        pendant 40 ans donnent <strong>{eur(EFFORT_300_40_ANS, 1000)}</strong>.
        Dix ans de plus, et le capital est multiplié par{" "}
        {(EFFORT_300_40_ANS / EFFORT_300_30_ANS).toLocaleString("fr-FR", { maximumFractionDigits: 1 })}.
      </p>
      <p className="text-gray-700 leading-relaxed mb-12">
        Ce n&apos;est pas magique — c&apos;est mathématique. Les intérêts
        composés accélèrent exponentiellement au-delà de 20 ans. Commencer à
        25 ans plutôt qu&apos;à 35 ans ne double pas l&apos;effort : ça le
        transforme.
      </p>

      {/* Enveloppes fiscales */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Quelle enveloppe fiscale pour la retraite ?
      </h2>
      <div className="space-y-4 mb-12">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            PEA — Plan d&apos;Épargne en Actions
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Plafond 150 000 € de versements. Après 5 ans, plus-values exonérées
            d&apos;impôt (18,6 % de prélèvements sociaux uniquement vs 31,4 %
            flat tax en CTO). <strong>Option par défaut</strong> pour
            commencer — liquidité + fiscalité excellente.
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            PER — Plan d&apos;Épargne Retraite
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Déduction fiscale à l&apos;entrée : vos versements réduisent votre
            revenu imposable. Intéressant si votre tranche marginale est ≥ 30 %.
            Argent bloqué jusqu&apos;à la retraite (sauf exceptions : achat RP,
            accidents de la vie). <strong>En complément du PEA</strong>, pas en
            remplacement.
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Assurance-vie multi-supports
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Utile pour la <strong>transmission</strong> (abattement de 152 500 €
            par bénéficiaire avant 70 ans) et comme <strong>3ᵉ poche</strong>{" "}
            une fois le PEA saturé. Après 8 ans : abattement annuel de 4 600 €
            (9 200 € pour un couple) sur les gains + fiscalité réduite.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 sm:p-8 mb-12">
        <p className="text-base font-bold text-gray-900 mb-2">
          Simulez votre propre projection
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Tous les chiffres de cette page sont génériques. Utilisez le
          simulateur avec vos paramètres réels (âge, montant que vous pouvez
          épargner, horizon) pour obtenir une projection sur mesure — avec les
          3 scénarios de marché et l&apos;analyse Monte Carlo en Premium.
        </p>
        <Link
          href={`/simulateur?monthly=300&years=30&return=7&fees=${TER_REFERENCE_SIMULATEUR}`}
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          Ouvrir le simulateur →
        </Link>
      </div>

      {/* FAQ */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
      <div className="space-y-3 mb-12">
        {FAQ.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-xl border border-gray-100 bg-white p-4 open:bg-gray-50/50"
          >
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-900">{q}</span>
              <span className="text-gray-500 group-open:rotate-180 transition-transform" aria-hidden>▾</span>
            </summary>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Articles liés
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/investir-500-euros-mois-etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Investir 500 €/mois</p>
            <p className="text-xs text-gray-500">Simulation détaillée + FIRE.</p>
          </Link>
          <Link href="/investir-en-etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Investir en ETF — guide complet</p>
            <p className="text-xs text-gray-500">Tout pour bien démarrer son DCA en ETF.</p>
          </Link>
          <Link href="/interets-composes" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Intérêts composés</p>
            <p className="text-xs text-gray-500">Le moteur des projections retraite.</p>
          </Link>
          <Link href="/pea-ou-cto" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">PEA ou CTO ?</p>
            <p className="text-xs text-gray-500">L&apos;enveloppe fiscale par défaut.</p>
          </Link>
        </div>
      </div>

      {/* Disclaimer outil (E-E-A-T YMYL) — pattern "outil" : transparence sur
          la méthode + limites, plutôt qu'une byline d'article. */}
      <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>Outil pédagogique</strong> — les projections supposent un
          rendement constant et ne tiennent pas compte de la volatilité réelle
          des marchés ni de votre situation personnelle. Elles ne constituent
          pas un conseil en investissement.{" "}
          <Link href="/methodologie" className="underline hover:text-gray-900 transition-colors">
            Voir les formules et hypothèses détaillées
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
