import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE = "Qu'est-ce qu'un ETF ? Définition, fonctionnement et exemples";
const DESCRIPTION =
  "Définition d'un ETF (Exchange-Traded Fund) : fonds indiciel coté en bourse qui réplique un indice à frais très bas. Guide complet pour débutants.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/glossaire/etf" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/glossaire/etf",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Quelle est la différence entre un ETF et un fonds classique ?",
    a: "Un ETF se négocie en bourse comme une action, à toute heure de la journée. Un fonds classique (OPCVM) se traite à la valeur de clôture journalière, via votre banque. Surtout, les ETF ont des frais de gestion beaucoup plus bas : 0,1 à 0,3 %/an pour un ETF indiciel, contre 1,5 à 2,5 %/an pour un fonds actif traditionnel.",
  },
  {
    q: "Les ETF sont-ils risqués ?",
    a: "Un ETF porte le même risque que son indice sous-jacent. Un ETF MSCI World est exposé aux ~1 500 plus grandes sociétés mondiales — le risque est diversifié géographiquement et sectoriellement. Un ETF sur un seul pays ou secteur est plus concentré donc plus volatil. Comme tout investissement en actions, la valeur peut baisser à court terme.",
  },
  {
    q: "Peut-on loger des ETF dans un PEA ?",
    a: "Seuls les ETF éligibles PEA peuvent être logés dedans — c'est-à-dire les ETF dont au moins 75 % des actifs sont européens, ou les ETF synthétiques qui répliquent des indices non-européens via swap. Exemples éligibles : CW8 (MSCI World), ESE (S&P 500 synthétique). Les ETF US classiques (VWCE, VTI) ne sont pas éligibles.",
  },
  {
    q: "Combien d'ETF faut-il détenir ?",
    a: "Un seul ETF monde diversifié (type MSCI World) suffit largement pour démarrer. La vraie diversification vient du nombre de sociétés dans l'indice, pas du nombre d'ETF. Certains investisseurs ajoutent un ETF émergents (20 %) pour compléter le MSCI World (qui est principalement pays développés). Au-delà, on complexifie pour peu de gains.",
  },
];

export default function ETFGlossaryPage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: "ETF — Exchange-Traded Fund",
          description: DESCRIPTION,
          url: `${siteUrl}/glossaire/etf`,
          inDefinedTermSet: `${siteUrl}/glossaire`,
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

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <Link href="/glossaire" className="hover:text-gray-600 transition-colors">Glossaire</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">ETF</span>
      </nav>

      {/* Hero */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Qu&apos;est-ce qu&apos;un ETF ?
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-10">
        Un <strong>ETF</strong> (<em>Exchange-Traded Fund</em>) est un fonds
        indiciel coté en bourse. Il regroupe un panier de dizaines ou
        centaines d&apos;actions, et se négocie comme une action classique. En
        français, on parle aussi de <strong>tracker</strong>.
      </p>

      {/* Quick definition */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-700 mb-2">
          Définition courte
        </p>
        <p className="text-base text-gray-900 leading-relaxed">
          Un ETF réplique passivement un indice boursier (CAC 40, S&amp;P 500,
          MSCI World…) en détenant les mêmes actions que l&apos;indice, dans
          les mêmes proportions. Les frais de gestion sont très bas (0,1 à
          0,3 %/an) parce qu&apos;il n&apos;y a pas de gérant qui choisit les
          actions.
        </p>
      </div>

      {/* Section: how it works */}
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
        Comment fonctionne un ETF
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Prenons l&apos;exemple de l&apos;ETF <strong>CW8</strong> (Amundi MSCI
        World), qui suit l&apos;indice MSCI World :
      </p>
      <ul className="space-y-2 mb-6">
        <li className="flex items-start gap-2 text-gray-700">
          <span className="text-primary-600 font-bold">·</span>
          <span>Il détient des actions des ~1 500 plus grandes entreprises mondiales (Apple, Microsoft, Nestlé, LVMH, etc.).</span>
        </li>
        <li className="flex items-start gap-2 text-gray-700">
          <span className="text-primary-600 font-bold">·</span>
          <span>Quand vous achetez une part de CW8, vous possédez une fraction de chacune de ces 1 500 entreprises.</span>
        </li>
        <li className="flex items-start gap-2 text-gray-700">
          <span className="text-primary-600 font-bold">·</span>
          <span>Les frais annuels (TER) sont de 0,38 % — contre 1,5 à 2,5 %/an pour un fonds actif classique.</span>
        </li>
        <li className="flex items-start gap-2 text-gray-700">
          <span className="text-primary-600 font-bold">·</span>
          <span>L&apos;ETF est éligible PEA, ce qui le rend fiscalement très intéressant pour les résidents français.</span>
        </li>
      </ul>

      {/* Section: why DCA on ETF */}
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
        Pourquoi les ETF sont parfaits pour un DCA
      </h2>
      <div className="space-y-4 text-gray-700 leading-relaxed mb-8">
        <p>
          <strong>1. Frais très bas.</strong> Sur 20-30 ans, chaque 0,1 % de
          frais en moins représente des milliers d&apos;euros gagnés. Les ETF
          sont 10 à 20 fois moins chers que les fonds actifs.
        </p>
        <p>
          <strong>2. Diversification instantanée.</strong> Un seul ETF MSCI
          World = exposition à 1 500 sociétés sur 23 pays développés. Pas besoin
          de piocher les bonnes actions.
        </p>
        <p>
          <strong>3. Liquidité.</strong> Un ETF se vend et s&apos;achète
          instantanément aux heures d&apos;ouverture des marchés.
          Transparence totale sur le prix.
        </p>
        <p>
          <strong>4. Simplicité.</strong> Un versement mensuel automatique sur
          un ETF large (MSCI World, S&amp;P 500) suffit largement pour 90 % des
          investisseurs particuliers.
        </p>
      </div>

      {/* Section: example ETFs */}
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
        ETF populaires pour un investisseur français
      </h2>
      <div className="overflow-x-auto mb-8 rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-600">Ticker</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-600">Indice</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-600">TER</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-600">PEA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr><td className="px-3 py-2 font-mono">CW8</td><td className="px-3 py-2">MSCI World</td><td className="px-3 py-2 tabular-nums">0,38 %</td><td className="px-3 py-2">✓</td></tr>
            <tr><td className="px-3 py-2 font-mono">ESE</td><td className="px-3 py-2">S&amp;P 500</td><td className="px-3 py-2 tabular-nums">0,15 %</td><td className="px-3 py-2">✓</td></tr>
            <tr><td className="px-3 py-2 font-mono">VWCE</td><td className="px-3 py-2">FTSE All-World</td><td className="px-3 py-2 tabular-nums">0,22 %</td><td className="px-3 py-2">✗</td></tr>
            <tr><td className="px-3 py-2 font-mono">AEEM</td><td className="px-3 py-2">MSCI Emerging Markets</td><td className="px-3 py-2 tabular-nums">0,20 %</td><td className="px-3 py-2">✓</td></tr>
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
        Questions fréquentes
      </h2>
      <div className="space-y-3 mb-10">
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

      {/* CTA */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center mb-10">
        <p className="text-base font-bold text-gray-900 mb-2">
          Simulez un DCA sur ETF
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Projettez ce que donne un versement mensuel sur un ETF MSCI World
          ou S&amp;P 500 sur 20-30 ans.
        </p>
        <Link
          href="/simulateur"
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          Lancer une simulation →
        </Link>
      </div>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Articles liés
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/glossaire/dca" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">DCA</p>
            <p className="text-xs text-gray-500">La méthode la plus simple pour investir régulièrement en ETF.</p>
          </Link>
          <Link href="/glossaire/interets-composes" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Intérêts composés</p>
            <p className="text-xs text-gray-500">Le moteur qui rend les ETF puissants sur le long terme.</p>
          </Link>
          <Link href="/meilleurs-etf-debutants" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Meilleurs ETF débutants</p>
            <p className="text-xs text-gray-500">Sélection des ETF les plus simples pour démarrer.</p>
          </Link>
          <Link href="/comparer-etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Comparer les ETF</p>
            <p className="text-xs text-gray-500">Outil de comparaison avec frais, performances et éligibilité PEA.</p>
          </Link>
        </div>
      </div>
    </article>
  );
}
