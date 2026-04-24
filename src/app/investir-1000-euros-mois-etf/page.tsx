import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE =
  "Investir 1 000€ par mois en ETF : simulation FIRE et indépendance financière";
const DESCRIPTION =
  "1 000€/mois en ETF sur 20 ans = 521 000€. Simulation FIRE complète : retraite anticipée, règle des 4%, projection sur 10/20/30 ans avec intérêts composés.";
const CANONICAL = "/investir-1000-euros-mois-etf";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "article",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Investir 1 000€ par mois en ETF" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const SCENARIOS = [
  {
    label: "Prudent",
    rate: "5 %/an",
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-100",
    rows: [
      { y: 10, final: "155 000 €", pct: "+29 %" },
      { y: 15, final: "265 000 €", pct: "+47 %" },
      { y: 20, final: "413 000 €", pct: "+72 %" },
      { y: 25, final: "609 400 €", pct: "+103 %" },
      { y: 30, final: "837 000 €", pct: "+133 %" },
    ],
  },
  {
    label: "Réaliste",
    rate: "7 %/an",
    color: "text-primary-700",
    bg: "bg-primary-50 border-primary-100",
    highlight: true,
    rows: [
      { y: 10, final: "173 000 €", pct: "+44 %" },
      { y: 15, final: "317 400 €", pct: "+76 %" },
      { y: 20, final: "521 000 €", pct: "+117 %" },
      { y: 25, final: "810 700 €", pct: "+170 %" },
      { y: 30, final: "1 221 000 €", pct: "+239 %" },
    ],
  },
  {
    label: "Optimiste",
    rate: "9 %/an",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
    rows: [
      { y: 10, final: "194 000 €", pct: "+62 %" },
      { y: 15, final: "387 000 €", pct: "+115 %" },
      { y: 20, final: "668 000 €", pct: "+178 %" },
      { y: 25, final: "1 062 400 €", pct: "+254 %" },
      { y: 30, final: "1 823 000 €", pct: "+406 %" },
    ],
  },
];

const FAQ = [
  {
    q: "Combien vaut 1 000€ par mois investi en ETF sur 20 ans ?",
    a: "Avec un rendement annuel moyen de 7 % (proche de la performance historique d'un ETF MSCI World sur longue période), 1 000€/mois pendant 20 ans donnent environ 521 000€. Vous aurez versé 240 000€ ; les 281 000€ restants viennent des intérêts composés. À 5 %/an, le capital final est d'environ 413 000€ ; à 9 %/an, il atteint 668 000€.",
  },
  {
    q: "Est-ce que 1 000€ par mois permet d'atteindre le FIRE (retraite anticipée) ?",
    a: "Oui, c'est l'un des montants de référence pour le mouvement FIRE (Financial Independence, Retire Early) en France. Avec la règle des 4 %, un capital de 750 000€ génère 30 000€/an de rente (~2 500€/mois) — un revenu viable pour beaucoup. À 1 000€/mois investis, vous atteignez ce seuil en ~24 ans à 7 %/an. Avec un rendement optimiste de 9 %, c'est accessible en 22 ans.",
  },
  {
    q: "Quel ETF choisir pour 1 000€ par mois ?",
    a: "Pour un versement de ce niveau, la simplicité reste la meilleure stratégie : un seul ETF MSCI World bien capitalisé (CW8 sur PEA, VWCE sur CTO) suffit. Certains investisseurs ajoutent 10-20 % d'ETF émergents (AEEM, PAEEM) pour diversifier, ou un ETF Small Cap (WSML) pour le facteur taille. Au-delà de 2-3 lignes, la complexité dépasse l'apport marginal.",
  },
  {
    q: "Vais-je dépasser le plafond du PEA ?",
    a: "Oui — le plafond du PEA (150 000€ de versements cumulés) est atteint en 12,5 ans à 1 000€/mois. Stratégie recommandée : maximiser le PEA d'abord, puis ouvrir un CTO en complément pour continuer les versements. Le PEA conserve son avantage fiscal même quand vous n'alimentez plus — les gains continuent de capitaliser sans friction fiscale. Vous pouvez aussi ouvrir une assurance-vie en parallèle pour la transmission.",
  },
  {
    q: "Quel impact de la fiscalité sur 20 ans ?",
    a: "Énorme. Sur 521 000€ de capital final avec 281 000€ de gains : en PEA après 5 ans, prélèvements sociaux 17,2 % sur gains = ~48 000€ d'impôt. En CTO avec flat tax 30 % : ~84 000€. Écart : 36 000€ sur 20 ans. C'est pour ça qu'on commence toujours par saturer le PEA — la différence se chiffre en années de versements économisés.",
  },
];

export default function Investir1000Page() {
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
        <span className="text-gray-600">Investir 1 000 €/mois en ETF</span>
      </nav>

      {/* Hero */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Investir 1 000 € par mois en ETF
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-8">
        Simulation complète d&apos;un versement mensuel de 1 000 € dans un ETF
        type MSCI World, avec les intérêts composés, sur 10 à 30 ans. À ce
        niveau d&apos;épargne, le FIRE (Financial Independence, Retire Early)
        devient un objectif concret sur 20-25 ans.
      </p>

      {/* Flagship result */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-6 sm:p-8 mb-10 text-white">
        <p className="text-xs font-semibold text-primary-200 uppercase tracking-wider mb-2">
          Scénario réaliste — 20 ans
        </p>
        <p className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight mb-2">
          521 000 €
        </p>
        <p className="text-sm text-primary-100 leading-relaxed">
          1 000 €/mois pendant 20 ans à 7 %/an. Vous aurez versé{" "}
          <strong>240 000 €</strong>. Les{" "}
          <strong>281 000 €</strong> restants viennent des intérêts composés —
          soit plus que vos versements eux-mêmes.
        </p>
        <Link
          href="/simulateur?monthly=1000&years=20&return=7&fees=0.3"
          className="mt-5 inline-block bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl btn-lift"
        >
          Simuler ma propre version →
        </Link>
      </div>

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
        ))}
      </div>

      {/* FIRE angle */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        FIRE : combien pour une indépendance financière ?
      </h2>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-10">
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Avec la <strong>règle des 4 %</strong> (taux de retrait annuel sûr),
          voici ce que représente votre capital final en termes de rente
          mensuelle perpétuelle :
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Rente mensuelle</th>
                <th className="text-left px-3 py-2 font-semibold">Capital nécessaire</th>
                <th className="text-left px-3 py-2 font-semibold">Durée à 1 000 €/mois, 7 %/an</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-3 py-2">1 500 €/mois</td><td className="px-3 py-2 font-semibold tabular-nums">450 000 €</td><td className="px-3 py-2 text-gray-500">~18 ans</td></tr>
              <tr><td className="px-3 py-2">2 500 €/mois (FIRE)</td><td className="px-3 py-2 font-semibold tabular-nums">750 000 €</td><td className="px-3 py-2 text-gray-500">~24 ans</td></tr>
              <tr><td className="px-3 py-2">3 500 €/mois</td><td className="px-3 py-2 font-semibold tabular-nums">1 050 000 €</td><td className="px-3 py-2 text-gray-500">~28 ans</td></tr>
              <tr><td className="px-3 py-2">5 000 €/mois</td><td className="px-3 py-2 font-semibold tabular-nums">1 500 000 €</td><td className="px-3 py-2 text-gray-500">~32 ans</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
          La règle des 4 % est une approximation issue du Trinity Study. Elle
          suppose un portefeuille diversifié et un horizon de retrait de 30 ans.
          L&apos;analyse Monte Carlo du simulateur permet de stress-tester
          cette hypothèse contre 1 000 scénarios historiques.
        </p>
      </div>

      {/* PEA plafond */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        À 1 000 €/mois, le plafond du PEA arrive vite
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Le PEA plafonne les versements cumulés à <strong>150 000 €</strong>.
        À 1 000 €/mois, vous l&apos;atteignez en <strong>12 ans et 6 mois</strong>.
      </p>
      <p className="text-gray-700 leading-relaxed mb-4">
        <strong>Stratégie standard :</strong>
      </p>
      <ol className="list-decimal pl-6 space-y-2 text-gray-700 leading-relaxed mb-10">
        <li>
          Année 1-12 : saturez votre PEA en priorité (fiscalité optimale).
        </li>
        <li>
          Année 13+ : basculez les nouveaux versements vers un CTO. Votre PEA
          continue de fructifier sans friction fiscale jusqu&apos;au retrait.
        </li>
        <li>
          Optionnel : ouvrez une <em>assurance-vie en ETF</em> en parallèle
          pour la transmission (fiscalité avantageuse après 8 ans, abattement
          succession).
        </li>
      </ol>

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
          Simulez votre trajectoire FIRE
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Entrez vos paramètres — montant, durée, rendement cible, frais. Voyez
          la projection complète avec les 3 scénarios et l&apos;analyse Monte
          Carlo.
        </p>
        <Link
          href="/simulateur?monthly=1000&years=20&return=7&fees=0.3"
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          Ouvrir le simulateur →
        </Link>
      </div>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Articles liés</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/investir-500-euros-mois-etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Investir 500 €/mois</p>
            <p className="text-xs text-gray-500">Simulation pour un budget intermédiaire.</p>
          </Link>
          <Link href="/investir-300-euros-mois-etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Investir 300 €/mois</p>
            <p className="text-xs text-gray-500">Le montant de référence pour démarrer.</p>
          </Link>
          <Link href="/pea-ou-cto" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">PEA ou CTO ?</p>
            <p className="text-xs text-gray-500">Optimiser votre fiscalité à ce niveau de versement.</p>
          </Link>
          <Link href="/meilleurs-etf-debutants" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Meilleurs ETF</p>
            <p className="text-xs text-gray-500">Les ETF recommandés pour un DCA long-terme.</p>
          </Link>
        </div>
      </div>
    </article>
  );
}
