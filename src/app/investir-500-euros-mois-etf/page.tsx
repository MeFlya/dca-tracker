import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE =
  "Investir 500€ par mois en ETF : simulation sur 10, 20 et 30 ans";
const DESCRIPTION =
  "500€/mois en ETF sur 20 ans = 260 500€. Simulation complète avec 3 scénarios, projection retraite, impact des frais et fiscalité PEA vs CTO.";
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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Investir 500€ par mois en ETF" }],
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
      { y: 10, final: "77 500 €", pct: "+29 %" },
      { y: 15, final: "132 500 €", pct: "+47 %" },
      { y: 20, final: "206 500 €", pct: "+72 %" },
      { y: 25, final: "304 700 €", pct: "+103 %" },
      { y: 30, final: "418 500 €", pct: "+133 %" },
    ],
  },
  {
    label: "Réaliste",
    rate: "7 %/an",
    color: "text-primary-700",
    bg: "bg-primary-50 border-primary-100",
    highlight: true,
    rows: [
      { y: 10, final: "86 500 €", pct: "+44 %" },
      { y: 15, final: "158 700 €", pct: "+76 %" },
      { y: 20, final: "260 500 €", pct: "+117 %" },
      { y: 25, final: "405 300 €", pct: "+170 %" },
      { y: 30, final: "610 500 €", pct: "+239 %" },
    ],
  },
  {
    label: "Optimiste",
    rate: "9 %/an",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
    rows: [
      { y: 10, final: "97 000 €", pct: "+62 %" },
      { y: 15, final: "193 500 €", pct: "+115 %" },
      { y: 20, final: "334 000 €", pct: "+178 %" },
      { y: 25, final: "531 200 €", pct: "+254 %" },
      { y: 30, final: "911 500 €", pct: "+406 %" },
    ],
  },
];

const FAQ = [
  {
    q: "Combien vaut 500€ par mois investi en ETF sur 20 ans ?",
    a: "Avec un rendement annuel moyen de 7 % (proche de la performance historique d'un ETF MSCI World), 500€/mois pendant 20 ans donnent environ 260 500€. Vous aurez versé 120 000€ ; les 140 500€ restants viennent des intérêts composés. À 5 %/an, le capital final est d'environ 206 500€ ; à 9 %/an, il grimpe à 334 000€.",
  },
  {
    q: "Est-ce que 500€ par mois permet d'atteindre l'indépendance financière ?",
    a: "Partiellement, oui. Avec la règle des 4 % (retrait annuel sûr sur un portefeuille ETF), un capital de 500 000€ génère environ 20 000€/an de rente — soit ~1 650€/mois. À 500€/mois investis sur 25 ans à 7 %/an, vous atteignez ce niveau et pouvez envisager une autonomie partielle ou compléter votre retraite. Ce n'est pas la retraite anticipée complète, mais c'est un complément significatif.",
  },
  {
    q: "PEA ou CTO pour investir 500€ par mois ?",
    a: "Le PEA est presque toujours préférable pour un résident français. Plafond de versement : 150 000€ — atteint en 25 ans à 500€/mois. Fiscalité après 5 ans : 17,2 % de prélèvements sociaux uniquement, vs 30 % de flat tax sur CTO. Sur 20 ans avec ~140 000€ de gains, cette différence représente environ 18 000€ économisés. Si vous atteignez le plafond du PEA, continuez en CTO.",
  },
  {
    q: "Quel impact si j'augmente à 600€/mois ?",
    a: "100€/mois supplémentaires sur 20 ans à 7 %/an = environ 52 000€ de capital final en plus. Autrement dit : chaque 100€/mois ajoutés maintenant se transforment en ~52 000€ dans 20 ans. C'est l'effet combiné du temps et des intérêts composés. Augmenter progressivement vos versements (au fil de vos augmentations) est l'un des leviers les plus puissants.",
  },
  {
    q: "Que se passe-t-il si j'arrête après 10 ans ?",
    a: "Si vous versez 500€/mois pendant 10 ans (60 000€ investis) puis laissez l'argent fructifier 10 ans de plus sans nouveaux versements, à 7 %/an vous finissez à environ 170 300€ au bout de 20 ans — vs 260 500€ si vous aviez continué. Écart : ~90 000€. La moitié droite de la courbe est la plus productive : c'est là que les intérêts composés travaillent le plus.",
  },
];

export default function Investir500Page() {
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
        <span className="text-gray-600">Investir 500 €/mois en ETF</span>
      </nav>

      {/* Hero */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Investir 500 € par mois en ETF
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-8">
        Simulation complète d&apos;un versement mensuel de 500 € dans un ETF
        type MSCI World, sur 10 à 30 ans, avec intérêts composés. Projections
        à 5, 7 et 9 %/an — les bornes réalistes pour un portefeuille ETF
        diversifié.
      </p>

      {/* Flagship result */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-6 sm:p-8 mb-10 text-white">
        <p className="text-xs font-semibold text-primary-200 uppercase tracking-wider mb-2">
          Scénario réaliste — 20 ans
        </p>
        <p className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight mb-2">
          260 500 €
        </p>
        <p className="text-sm text-primary-100 leading-relaxed">
          500 €/mois pendant 20 ans à 7 %/an. Vous aurez versé{" "}
          <strong>120 000 €</strong>. Les{" "}
          <strong>140 500 €</strong> restants viennent des intérêts composés.
        </p>
        <Link
          href="/simulateur?monthly=500&years=20&return=7&fees=0.3"
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
              <tr><td className="px-3 py-2">1 000 €/mois</td><td className="px-3 py-2 font-semibold tabular-nums">300 000 €</td><td className="px-3 py-2 text-gray-500">~22 ans à 7 %/an</td></tr>
              <tr><td className="px-3 py-2">1 500 €/mois</td><td className="px-3 py-2 font-semibold tabular-nums">450 000 €</td><td className="px-3 py-2 text-gray-500">~27 ans à 7 %/an</td></tr>
              <tr><td className="px-3 py-2">2 000 €/mois</td><td className="px-3 py-2 font-semibold tabular-nums">600 000 €</td><td className="px-3 py-2 text-gray-500">~30 ans à 7 %/an</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
          Ces projections sont théoriques et supposent un rendement annuel
          moyen constant — la réalité est plus volatile. Utilisez le
          simulateur avec l&apos;analyse Monte Carlo pour stress-tester votre
          stratégie contre 1 000 scénarios réels.
        </p>
      </div>

      {/* Fees impact */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        L&apos;impact des frais (souvent sous-estimé)
      </h2>
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Frais annuels</th>
              <th className="text-right px-3 py-2 font-semibold">Capital final (20 ans, 7 %)</th>
              <th className="text-right px-3 py-2 font-semibold">Écart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr><td className="px-3 py-2">0,1 % (meilleurs ETF)</td><td className="px-3 py-2 text-right font-semibold tabular-nums">265 400 €</td><td className="px-3 py-2 text-right text-emerald-600 tabular-nums">référence</td></tr>
            <tr><td className="px-3 py-2">0,3 %</td><td className="px-3 py-2 text-right font-semibold tabular-nums">260 500 €</td><td className="px-3 py-2 text-right text-gray-500 tabular-nums">−4 900 €</td></tr>
            <tr><td className="px-3 py-2">0,5 %</td><td className="px-3 py-2 text-right font-semibold tabular-nums">255 700 €</td><td className="px-3 py-2 text-right text-orange-600 tabular-nums">−9 700 €</td></tr>
            <tr><td className="px-3 py-2">1 % (fonds actif typique)</td><td className="px-3 py-2 text-right font-semibold tabular-nums">244 000 €</td><td className="px-3 py-2 text-right text-red-600 tabular-nums">−21 400 €</td></tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-10">
        Sur 20 ans, chaque 0,1 % de frais supplémentaire coûte environ 4 800 €.
        Privilégiez les ETF à TER inférieur à 0,3 % — types CW8 (0,38 %), ESE
        (0,15 %), EWLD (0,20 %).
      </p>

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
          href="/simulateur?monthly=500&years=20&return=7&fees=0.3"
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
    </article>
  );
}
