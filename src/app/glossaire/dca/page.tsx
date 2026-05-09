import type { Metadata } from "next";
import Link from "next/link";
import { Repeat } from "lucide-react";
import { JsonLd } from "@/components/ui/JsonLd";
import { EducationalHeader } from "@/components/ui/EducationalHeader";

const TITLE = "Qu'est-ce que le DCA (Dollar Cost Averaging) ?";
const DESCRIPTION =
  "Définition du DCA : investir le même montant à intervalles réguliers pour lisser le prix d'achat. Avantages, inconvénients, exemples chiffrés sur 20 ans.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/glossaire/dca" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/glossaire/dca",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Le DCA est-il plus rentable qu'un investissement en une seule fois ?",
    a: "Statistiquement, investir une grosse somme d'un coup (lump-sum) bat le DCA 2 fois sur 3 sur les marchés haussiers longs. Le DCA est moins optimal en rendement moyen, mais il lisse le risque de timing et le stress psychologique. Pour un salarié qui épargne mensuellement, la question ne se pose pas : son flux de revenus force naturellement un DCA.",
  },
  {
    q: "Quelle fréquence pour un DCA : mensuelle ou hebdomadaire ?",
    a: "Une fréquence mensuelle est optimale dans 95 % des cas. Les différences de performance entre hebdomadaire et mensuel sont marginales sur 20 ans (moins de 1 % d'écart). Le coût psychologique et les frais éventuels rendent le mensuel plus efficace.",
  },
  {
    q: "Faut-il arrêter son DCA en cas de baisse du marché ?",
    a: "Non — au contraire. C'est pendant les baisses que le DCA capte ses meilleures opportunités : chaque versement achète davantage de parts. Arrêter pendant une baisse détruit l'avantage principal du DCA.",
  },
  {
    q: "Combien faut-il investir par mois pour que le DCA soit pertinent ?",
    a: "Il n'y a pas de minimum : même 50 €/mois bénéficient pleinement des intérêts composés sur 20-30 ans. L'important est la régularité, pas le montant initial. Vous pouvez augmenter progressivement au fil de vos augmentations de revenus.",
  },
];

export default function DCAGlossaryPage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: "DCA — Dollar Cost Averaging",
          description: DESCRIPTION,
          url: `${siteUrl}/glossaire/dca`,
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
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <Link href="/glossaire" className="hover:text-gray-600 transition-colors">Glossaire</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">DCA</span>
      </nav>

      {/* Hero */}
      <EducationalHeader
        icon={Repeat}
        eyebrow="Glossaire DCA"
        title="Qu'est-ce que le DCA (Dollar Cost Averaging) ?"
        subtitle="Le DCA est une méthode d'investissement qui consiste à acheter le même montant d'un actif à intervalles réguliers — peu importe son prix. En français, on parle aussi d'investissement progressif ou d'achats échelonnés."
      />

      {/* Quick definition */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-700 mb-2">
          Définition courte
        </p>
        <p className="text-base text-gray-900 leading-relaxed">
          Le DCA est une stratégie d&apos;investissement régulier : un montant
          fixe, à des dates fixes, sur le même actif. Elle lisse le prix moyen
          d&apos;achat et supprime la question du timing de marché.
        </p>
      </div>

      {/* Section: example */}
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
        Exemple concret
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Vous décidez d&apos;investir <strong>200 €/mois</strong> dans un ETF
        MSCI World (type CW8) pendant 20 ans.
      </p>
      <ul className="space-y-2 mb-6">
        <li className="flex items-start gap-2 text-gray-700">
          <span className="text-primary-600 font-bold">·</span>
          <span><strong>Versements totaux</strong> : 200 × 12 × 20 = 48 000 €</span>
        </li>
        <li className="flex items-start gap-2 text-gray-700">
          <span className="text-primary-600 font-bold">·</span>
          <span>
            <strong>Capital attendu</strong> à un rendement historique de 7 %/an net :
            ~102 000 €
          </span>
        </li>
        <li className="flex items-start gap-2 text-gray-700">
          <span className="text-primary-600 font-bold">·</span>
          <span>
            <strong>Gain généré</strong> : ~54 000 €, soit plus que vos versements
            eux-mêmes.
          </span>
        </li>
      </ul>
      <p className="text-sm text-gray-500 leading-relaxed mb-8">
        Ces 54 000 € viennent des intérêts composés : chaque versement génère
        un rendement qui s&apos;ajoute au capital, qui génère à son tour du
        rendement, etc.
      </p>

      {/* Section: why */}
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
        Pourquoi faire du DCA plutôt qu&apos;investir d&apos;un coup ?
      </h2>
      <div className="space-y-4 text-gray-700 leading-relaxed mb-8">
        <p>
          <strong>1. Vous lissez le risque de timing.</strong> Personne ne peut
          prédire si le marché est au plus haut ou au plus bas. En achetant
          régulièrement, vous capturez le prix moyen sur la période — sans
          pari.
        </p>
        <p>
          <strong>2. Vous profitez des baisses.</strong> Quand les cours
          chutent, le même versement achète plus de parts. Mécaniquement, votre
          prix de revient baisse.
        </p>
        <p>
          <strong>3. C&apos;est psychologiquement soutenable.</strong> Les
          investisseurs qui arrêtent leur plan en période de correction
          détruisent leurs rendements long-terme. Un DCA automatisé supprime la
          tentation.
        </p>
      </div>

      {/* Section: limits */}
      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
        Les limites du DCA
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Le DCA n&apos;est pas magique. Sur les marchés haussiers longs, un
        investissement en une fois (<em>lump-sum</em>) surperforme le DCA dans{" "}
        <strong>environ 2/3 des cas historiques</strong>, simplement parce que
        l&apos;argent est exposé au marché plus tôt. Le DCA est une stratégie
        de réduction du risque, pas de maximisation du rendement.
      </p>
      <p className="text-gray-700 leading-relaxed mb-8">
        En pratique, la plupart des investisseurs salariés font du DCA par
        défaut : ils investissent ce qu&apos;ils épargnent chaque mois. La
        vraie question est donc rarement &laquo; DCA ou lump-sum &raquo;, mais
        plutôt &laquo; combien investir &raquo; et &laquo; pendant combien de
        temps &raquo;.
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
              <span className="text-gray-500 group-open:rotate-180 transition-transform" aria-hidden>▾</span>
            </summary>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center mb-10">
        <p className="text-base font-bold text-gray-900 mb-2">
          Simulez votre DCA en 10 secondes
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Entrez un montant mensuel, une durée et un rendement cible. Voyez
          instantanément votre projection sur 20 ou 30 ans.
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
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Articles liés
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/glossaire/etf" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">ETF</p>
            <p className="text-xs text-gray-500">L&apos;instrument idéal pour faire du DCA à faibles frais.</p>
          </Link>
          <Link href="/glossaire/interets-composes" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Intérêts composés</p>
            <p className="text-xs text-gray-500">Le moteur qui rend le DCA puissant sur le long terme.</p>
          </Link>
          <Link href="/strategie-dca" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">Stratégie DCA complète</p>
            <p className="text-xs text-gray-500">Comment construire et maintenir une stratégie DCA sur 20 ans.</p>
          </Link>
          <Link href="/pea-ou-cto" className="rounded-xl border border-gray-100 bg-white p-4 card-hover">
            <p className="text-sm font-semibold text-gray-900 mb-1">PEA ou CTO ?</p>
            <p className="text-xs text-gray-500">Dans quelle enveloppe fiscale loger votre DCA.</p>
          </Link>
        </div>
      </div>
    </article>
  );
}
