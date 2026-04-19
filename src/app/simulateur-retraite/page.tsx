import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE =
  "Simulateur de retraite DCA : combien investir par mois pour ma retraite ?";
const DESCRIPTION =
  "Simulez votre retraite avec un DCA en ETF : calcul du capital nécessaire, règle des 4 %, tableaux selon l'âge de départ. Guide complet pour préparer sa retraite.";
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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Simulateur de retraite" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

// Computed at 7%/an net, classic DCA monthly compounding
const AGE_START_SCENARIOS = [
  {
    startAge: 25,
    retireAge: 65,
    years: 40,
    rows: [
      { monthly: 100, capital: "263 000 €", rente: "880 €/mois" },
      { monthly: 200, capital: "527 000 €", rente: "1 760 €/mois" },
      { monthly: 300, capital: "790 000 €", rente: "2 630 €/mois" },
      { monthly: 500, capital: "1 316 000 €", rente: "4 390 €/mois" },
      { monthly: 1000, capital: "2 633 000 €", rente: "8 780 €/mois" },
    ],
  },
  {
    startAge: 35,
    retireAge: 65,
    years: 30,
    rows: [
      { monthly: 100, capital: "122 000 €", rente: "410 €/mois" },
      { monthly: 200, capital: "244 000 €", rente: "815 €/mois" },
      { monthly: 300, capital: "366 000 €", rente: "1 220 €/mois" },
      { monthly: 500, capital: "610 000 €", rente: "2 035 €/mois" },
      { monthly: 1000, capital: "1 221 000 €", rente: "4 070 €/mois" },
    ],
  },
  {
    startAge: 45,
    retireAge: 65,
    years: 20,
    rows: [
      { monthly: 100, capital: "52 100 €", rente: "175 €/mois" },
      { monthly: 200, capital: "104 200 €", rente: "345 €/mois" },
      { monthly: 300, capital: "156 300 €", rente: "520 €/mois" },
      { monthly: 500, capital: "260 500 €", rente: "870 €/mois" },
      { monthly: 1000, capital: "521 000 €", rente: "1 740 €/mois" },
    ],
  },
  {
    startAge: 55,
    retireAge: 67,
    years: 12,
    rows: [
      { monthly: 100, capital: "18 100 €", rente: "60 €/mois" },
      { monthly: 200, capital: "36 200 €", rente: "120 €/mois" },
      { monthly: 500, capital: "90 500 €", rente: "300 €/mois" },
      { monthly: 1000, capital: "181 000 €", rente: "605 €/mois" },
      { monthly: 2000, capital: "362 000 €", rente: "1 210 €/mois" },
    ],
  },
];

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
    a: "Cela dépend de votre âge de départ. En commençant à 25 ans, 300 €/mois sur 40 ans donnent environ 790 000 € au total — une rente mensuelle de ~2 630 € en plus de votre retraite de base. En commençant à 45 ans, le même effort donne ~156 000 € (rente 520 €/mois) : plus un complément qu'un revenu principal. Le levier temps est énorme.",
  },
  {
    q: "Combien faut-il pour être 'libre financièrement' en France ?",
    a: "La règle des 4 % appliquée à un capital de 750 000 € donne 2 500 €/mois — proche du revenu médian français. C'est le seuil FIRE (Financial Independence, Retire Early) souvent cité. À 300 €/mois investis dès 25 ans, vous atteignez ce seuil vers 63 ans. À 500 €/mois dès 25 ans, vers 56 ans. Le chiffre 'coûte' varie selon votre train de vie réel.",
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
    a: "Les rendements annoncés (7 %/an net) sont déjà 'nets d'inflation' sur la performance historique des ETF MSCI World — environ 10 %/an bruts moins 2-3 % d'inflation moyenne. Les chiffres de rente futurs sont donc exprimés en pouvoir d'achat d'aujourd'hui. Vérifiez dans le simulateur si vous voulez être plus prudent avec un rendement net de 5-6 %.",
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

      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
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
        Cette page vous donne les chiffres concrets selon votre âge de départ,
        avec des tableaux basés sur la performance historique des ETF mondiaux
        et la règle des 4 % pour estimer votre future rente.
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
          C&apos;est la rente que génère un capital de 750 000 €
          via la règle des 4 %. Pour l&apos;atteindre à 65 ans, il faut environ
          <strong> 300 €/mois </strong> dès 25 ans, ou
          <strong> 650 €/mois </strong> si vous démarrez à 35 ans.
        </p>
        <Link
          href="/simulateur?monthly=300&years=40&return=7&fees=0.3"
          className="inline-block bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl btn-lift"
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
                <thead className="text-[11px] uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="text-left font-semibold py-1">Versement mensuel</th>
                    <th className="text-right font-semibold py-1">Capital à la retraite</th>
                    <th className="text-right font-semibold py-1">Rente possible (4 %)</th>
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
        Exemple concret : 300 €/mois à 7 %/an pendant 30 ans donnent environ{" "}
        <strong>366 000 €</strong>. Les mêmes 300 €/mois pendant 40 ans
        donnent <strong>790 000 €</strong>. Dix ans de plus = 2 fois plus.
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
            d&apos;impôt (17,2 % de prélèvements sociaux uniquement vs 30 %
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
          href="/simulateur?monthly=300&years=30&return=7&fees=0.3"
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
              <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden>▾</span>
            </summary>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Articles liés
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/investir-500-euros-mois-etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Investir 500 €/mois</p>
            <p className="text-xs text-gray-500">Simulation détaillée + FIRE.</p>
          </Link>
          <Link href="/investir-1000-euros-mois-etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Investir 1 000 €/mois</p>
            <p className="text-xs text-gray-500">Objectif indépendance financière.</p>
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
    </article>
  );
}
