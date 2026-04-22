import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";
import { BROKER_LIST } from "@/lib/brokers";

const TITLE =
  "Comparatif des meilleurs courtiers pour un DCA ETF en 2026";
const DESCRIPTION =
  "Trade Republic, Boursorama Bourse, Fortuneo : comparaison des courtiers adaptés à un investissement DCA ETF en France. Frais, PEA, mobile, régulation.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/comparatif" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/comparatif",
    type: "website",
  },
};

export default function ComparatifHubPage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url: `${siteUrl}/comparatif`,
        }}
      />

      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Comparatif brokers</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
        Quel courtier pour un DCA ETF en 2026 ?
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-10">
        Le choix du courtier détermine combien de frais vous allez payer sur
        20-30 ans. Sur un DCA mensuel, même 0,2 % de frais en plus peuvent
        coûter plusieurs milliers d&apos;euros. Voici les 3 options les plus
        pertinentes pour un investisseur français.
      </p>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-10">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold text-gray-500 w-1/3">Courtier</th>
              <th className="px-4 py-3 font-semibold text-gray-500">PEA</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Frais d&apos;ordre</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Épargne auto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {BROKER_LIST.map((b) => (
              <tr key={b.slug} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/comparatif/${b.slug}`}
                    className="font-semibold text-gray-900 hover:text-primary-700 transition-colors"
                  >
                    {b.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{b.tagline}</p>
                </td>
                <td className="px-4 py-3">
                  {b.specs.pea ? (
                    <span className="text-emerald-600 font-semibold">Oui</span>
                  ) : (
                    <span className="text-gray-400">Non</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700 text-xs leading-relaxed">
                  {b.specs.orderFeesText.split(" · ").map((part, idx) => (
                    <span key={idx} className={idx === 0 ? "" : "block text-[11px] text-emerald-700 font-semibold"}>
                      {idx > 0 && "↳ "}{part}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold ${
                      b.specs.savingsPlan === "Oui"
                        ? "text-emerald-600"
                        : b.specs.savingsPlan === "Partielle"
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    {b.specs.savingsPlan}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed cards */}
      <h2 className="text-xl font-bold text-gray-900 mb-5">Les courtiers en détail</h2>
      <div className="space-y-4 mb-10">
        {BROKER_LIST.map((b) => (
          <Link
            key={b.slug}
            href={`/comparatif/${b.slug}`}
            className="group block rounded-2xl border border-gray-100 bg-white p-5 card-hover"
          >
            <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
              <p className="text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                {b.name}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                {b.specs.pea && (
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">PEA</span>
                )}
                {b.specs.cto && (
                  <span className="bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-full font-semibold">CTO</span>
                )}
                {b.specs.assuranceVie && (
                  <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">Assurance-vie</span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-2">{b.tagline}</p>
            <p className="text-xs font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
              Lire l&apos;avis complet →
            </p>
          </Link>
        ))}
      </div>

      {/* How to choose */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Comment choisir</h2>
      <div className="space-y-3 mb-10">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            DCA mensuel low-cost, mobile-first
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>Trade Republic</strong> — l&apos;épargne programmée ETF à
            0 € de frais est imbattable sur le long terme, et le PEA est
            disponible depuis 2023.
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Écosystème complet (banque + bourse + AV)
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>Boursorama Bourse</strong> — si vous voulez tout
            centraliser dans une banque en ligne française, avec accès à une
            assurance-vie multi-supports.
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Courtier français à prix compétitifs
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>Fortuneo</strong> — bon compromis qualité / frais, filiale
            Crédit Mutuel Arkéa avec PEA, CTO et assurance-vie en un seul
            compte.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center">
        <p className="text-base font-bold text-gray-900 mb-2">
          Simulez votre DCA avant d&apos;ouvrir un compte
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          L&apos;impact des frais se mesure sur 20 ans. Entrez vos paramètres
          et comparez différents niveaux de frais dans le simulateur.
        </p>
        <Link
          href="/simulateur"
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          Ouvrir le simulateur →
        </Link>
      </div>

      {/* Legal */}
      <p className="mt-10 text-[11px] text-gray-400 leading-relaxed text-center">
        Ce comparatif est fourni à titre informatif et ne constitue pas un
        conseil en investissement. DCA Tracker n&apos;est affilié à aucun des
        courtiers présentés. Tarifs et conditions à vérifier sur les sites
        officiels avant ouverture de compte.
      </p>
    </div>
  );
}
