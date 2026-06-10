import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";
import { GLOSSARY_TERM_LIST } from "@/lib/glossary-terms";

const TITLE = "Glossaire DCA — 15 termes clés de l'investissement ETF";
const DESCRIPTION =
  "PEA, CTO, TER, PFU, drawdown, TRI, réplication synthétique… Les 15 définitions essentielles pour comprendre le DCA et l'investissement ETF, avec exemples chiffrés et sans jargon inutile.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/glossaire" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/glossaire",
    type: "website",
  },
};

// Les 3 fondamentaux gardent leurs pages riches dédiées ; les 12 autres
// termes viennent de lib/glossary-terms (data-driven, route [slug]).
const CORE_ENTRIES = [
  {
    slug: "dca",
    term: "DCA — Dollar Cost Averaging",
    summary:
      "Investissement progressif : acheter le même montant à intervalles réguliers, indépendamment du prix du marché.",
  },
  {
    slug: "etf",
    term: "ETF — Exchange-Traded Fund",
    summary:
      "Fonds indiciel coté en bourse, qui réplique un panier d'actions ou d'obligations à faibles frais.",
  },
  {
    slug: "interets-composes",
    term: "Intérêts composés",
    summary:
      "Mécanisme par lequel les gains génèrent eux-mêmes des gains. Effet boule de neige sur le long terme.",
  },
];

const CATEGORIES = [
  "Enveloppes & fiscalité",
  "Frais & mécanique des ETF",
  "Stratégie & risque",
] as const;

export default function GlossaryHubPage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url: `${siteUrl}/glossaire`,
        }}
      />

      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Glossaire</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
        Glossaire DCA
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-10">
        Les définitions essentielles pour comprendre l&apos;investissement
        progressif en ETF. Explications claires, exemples concrets, sans jargon
        inutile.
      </p>

      {/* Les 3 fondamentaux — pages riches dédiées */}
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        Les fondamentaux
      </p>
      <div className="space-y-3 mb-10">
        {CORE_ENTRIES.map((e) => (
          <Link
            key={e.slug}
            href={`/glossaire/${e.slug}`}
            className="group block rounded-2xl border border-gray-100 bg-white p-5 card-hover"
          >
            <p className="text-base font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">
              {e.term}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">{e.summary}</p>
          </Link>
        ))}
      </div>

      {/* Les 12 termes data-driven, groupés par catégorie */}
      {CATEGORIES.map((cat) => (
        <div key={cat} className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            {cat}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GLOSSARY_TERM_LIST.filter((t) => t.category === cat).map((t) => (
              <Link
                key={t.slug}
                href={`/glossaire/${t.slug}`}
                className="group block rounded-2xl border border-gray-100 bg-white p-4 card-hover"
              >
                <p className="text-sm font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors leading-snug">
                  {t.term}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">{t.shortDef}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          Prêt à appliquer ces concepts ?
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Lancez une simulation DCA et voyez l&apos;effet des intérêts composés
          sur votre épargne.
        </p>
        <Link
          href="/simulateur"
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          Ouvrir le simulateur →
        </Link>
      </div>
    </div>
  );
}
