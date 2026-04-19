import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE = "Intérêts composés — Définition, formule et exemple concret";
const DESCRIPTION =
  "Les intérêts composés expliqués simplement : comment vos gains génèrent eux-mêmes des gains. Formule, exemple chiffré, et impact sur un DCA de 20 ans.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/glossaire/interets-composes" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/glossaire/interets-composes",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Quelle est la différence entre intérêts simples et intérêts composés ?",
    a: "Intérêts simples : les gains sont calculés uniquement sur le capital initial. Si vous avez 10 000 € à 5 %/an, vous gagnez 500 €/an pendant toute la durée. Intérêts composés : les gains se rajoutent au capital et génèrent eux-mêmes des gains. Les 500 € de la 1ʳᵉ année deviennent capital, qui produit 525 € la 2ᵉ année, etc. Sur 30 ans, l'écart est énorme : 10 000 € à 5 % composé donne ~43 000 € vs 25 000 € en intérêts simples.",
  },
  {
    q: "Comment maximiser l'effet des intérêts composés ?",
    a: "Trois leviers : (1) commencer tôt — chaque année de retard coûte des dizaines de milliers d'euros sur 30 ans ; (2) augmenter la durée — les intérêts composés accélèrent massivement après 15-20 ans ; (3) minimiser les frais — 1 % de frais en moins sur 30 ans peut représenter 30 % de capital final en plus.",
  },
  {
    q: "Quel est l'impact de la fiscalité sur les intérêts composés ?",
    a: "Si la fiscalité s'applique chaque année (ex. CTO avec prélèvements sur dividendes), elle ampute les intérêts composés en continu. En revanche, dans un PEA ou une assurance-vie, les gains se capitalisent sans friction fiscale jusqu'au retrait — ce qui renforce mécaniquement l'effet boule de neige. Sur 20 ans, un PEA peut produire ~15-20 % de capital final en plus qu'un CTO équivalent.",
  },
  {
    q: "À partir de quelle durée les intérêts composés deviennent-ils significatifs ?",
    a: "L'effet est faible les 5 premières années, visible entre 10 et 15 ans, et spectaculaire après 20 ans. Sur un DCA de 200 €/mois à 7 %, au bout de 20 ans, plus de la moitié du capital final vient des intérêts — pas de vos versements. C'est le fameux point de bascule.",
  },
];

export default function CompoundInterestGlossaryPage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: "Intérêts composés",
          description: DESCRIPTION,
          url: `${siteUrl}/glossaire/interets-composes`,
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
        <span className="text-gray-600" aria-current="page">Intérêts composés</span>
      </nav>

      {/* Hero */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Les intérêts composés
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-10">
        Les <strong>intérêts composés</strong> sont le mécanisme par lequel vos
        gains génèrent eux-mêmes des gains. Sur le long terme, ils dépassent
        souvent vos versements en volume — c&apos;est ce qui rend
        l&apos;investissement progressif puissant.
      </p>

      {/* Quick definition */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-700 mb-2">
          Définition courte
        </p>
        <p className="text-base text-gray-900 leading-relaxed">
          Un intérêt composé est un intérêt qui se réinvestit automatiquement
          dans le capital. L&apos;année suivante, l&apos;intérêt se calcule sur
          un capital plus élevé. Et ainsi de suite — d&apos;où l&apos;effet
          exponentiel.
        </p>
      </div>

      {/* Formula */}
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
        La formule
      </h2>
      <div className="rounded-xl bg-gray-50 border border-gray-100 px-6 py-5 mb-4 font-mono text-center text-base">
        V = C × (1 + r)<sup>n</sup>
      </div>
      <ul className="space-y-1 text-sm text-gray-600 mb-8">
        <li><strong>V</strong> = valeur finale</li>
        <li><strong>C</strong> = capital initial</li>
        <li><strong>r</strong> = taux de rendement annuel (ex. 0,07 pour 7 %)</li>
        <li><strong>n</strong> = nombre d&apos;années</li>
      </ul>

      {/* Example */}
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
        Exemple concret : DCA 200 €/mois sur 20 ans
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Avec un rendement annuel moyen de 7 % (cohérent avec la performance
        historique d&apos;un ETF MSCI World net d&apos;inflation) :
      </p>
      <div className="rounded-xl border border-gray-100 bg-white p-5 mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-600">Année</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600">Versements cumulés</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600">Capital</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600">Gain</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr><td className="px-3 py-2">1</td><td className="px-3 py-2 text-right tabular-nums">2 400 €</td><td className="px-3 py-2 text-right tabular-nums">2 488 €</td><td className="px-3 py-2 text-right tabular-nums text-emerald-600">+88 €</td></tr>
            <tr><td className="px-3 py-2">5</td><td className="px-3 py-2 text-right tabular-nums">12 000 €</td><td className="px-3 py-2 text-right tabular-nums">14 365 €</td><td className="px-3 py-2 text-right tabular-nums text-emerald-600">+2 365 €</td></tr>
            <tr><td className="px-3 py-2">10</td><td className="px-3 py-2 text-right tabular-nums">24 000 €</td><td className="px-3 py-2 text-right tabular-nums">34 819 €</td><td className="px-3 py-2 text-right tabular-nums text-emerald-600">+10 819 €</td></tr>
            <tr><td className="px-3 py-2">15</td><td className="px-3 py-2 text-right tabular-nums">36 000 €</td><td className="px-3 py-2 text-right tabular-nums">63 558 €</td><td className="px-3 py-2 text-right tabular-nums text-emerald-600">+27 558 €</td></tr>
            <tr className="bg-primary-50/30 font-semibold">
              <td className="px-3 py-2">20</td><td className="px-3 py-2 text-right tabular-nums">48 000 €</td><td className="px-3 py-2 text-right tabular-nums">102 094 €</td><td className="px-3 py-2 text-right tabular-nums text-emerald-700">+54 094 €</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-8">
        À la fin des 20 ans, le capital <strong>dépasse</strong> les versements
        eux-mêmes. Les 54 094 € de gain ne viennent pas de votre poche — ils
        viennent de vos gains qui ont produit eux-mêmes des gains, année après
        année.
      </p>

      {/* Key insight */}
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
        Le cap des 20 ans
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Regardez la progression : entre l&apos;année 10 et l&apos;année 20,
        votre capital double presque — pas parce que vous versez plus, mais
        parce que l&apos;effet composé accélère. C&apos;est pour cela que
        <strong> commencer tôt </strong> vaut beaucoup plus
        que <strong> investir beaucoup</strong>.
      </p>
      <p className="text-gray-700 leading-relaxed mb-8">
        Démarrer votre DCA 5 ans plus tard coûte environ 20 à 25 % du capital
        final. C&apos;est la décision la plus importante — et elle est
        totalement sous votre contrôle.
      </p>

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
          Simulez l&apos;effet des intérêts composés sur votre DCA
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Entrez un montant mensuel, une durée, un rendement. Le simulateur
          calcule la courbe exponentielle année par année.
        </p>
        <Link
          href="/simulateur"
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          Ouvrir le simulateur →
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
            <p className="text-xs text-gray-500">La méthode qui exploite les intérêts composés automatiquement.</p>
          </Link>
          <Link href="/glossaire/etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">ETF</p>
            <p className="text-xs text-gray-500">Les instruments à frais bas qui maximisent l&apos;effet composé.</p>
          </Link>
          <Link href="/interets-composes" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Article long-format</p>
            <p className="text-xs text-gray-500">Exploration complète des intérêts composés dans un DCA.</p>
          </Link>
          <Link href="/pea-ou-cto" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">PEA ou CTO ?</p>
            <p className="text-xs text-gray-500">Comment l&apos;enveloppe fiscale amplifie ou freine l&apos;effet composé.</p>
          </Link>
        </div>
      </div>
    </article>
  );
}
