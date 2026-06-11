// Hub /produits — les produits digitaux en paiement unique.
// Positionnement : capte les "non" au SaaS (les gens qui veulent du
// Excel/PDF sans abonnement). Lien discret depuis le bas de /tarifs.

import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Table2, Package, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { JsonLd } from "@/components/ui/JsonLd";
import { PRODUCT_LIST } from "@/lib/products";

const TITLE = "Produits — Cockpit DCA (suivi PEA) & guide pour démarrer";
const DESCRIPTION =
  "Nos ressources en paiement unique, sans abonnement : le Cockpit DCA (tableau de bord Excel/Google Sheets pour piloter votre PEA), le guide PDF pour démarrer le DCA en France, et le pack complet. Livraison immédiate, facture automatique.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/produits" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/produits",
    type: "website",
    siteName: "DCA Tracker",
  },
};

const ICONS: Record<string, LucideIcon> = {
  "template-suivi-dca": Table2,
  "guide-demarrer-dca": FileText,
  "bundle-dca": Package,
};

export default function ProduitsHubPage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url: `${siteUrl}/produits`,
        }}
      />

      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Produits</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
        Ressources en paiement unique
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-10">
        Pas d&apos;abonnement, pas de compte requis : vous achetez, vous
        recevez vos fichiers par email, ils sont à vous. Mises à jour incluses.
      </p>

      <div className="space-y-4 mb-12">
        {PRODUCT_LIST.map((p) => {
          const Icon = ICONS[p.id] ?? FileText;
          const isBundle = p.id === "bundle-dca";
          return (
            <Link
              key={p.id}
              href={`/produits/${p.slug}`}
              className={`group block rounded-2xl border p-6 card-hover ${
                isBundle
                  ? "border-primary-200 bg-primary-50/40 ring-1 ring-primary-100"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700">
                  <Icon size={20} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                    <p className="text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {p.shortName}
                      {isBundle && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-primary-700 bg-primary-100 border border-primary-200 px-1.5 py-0.5 rounded">
                          Meilleure valeur
                        </span>
                      )}
                    </p>
                    <p className="shrink-0 text-lg font-bold text-gray-900 tabular-nums">
                      {p.priceEur} €
                      {/* Omnibus : le barré doit être qualifié (somme des
                          prix séparés, PAS un ancien prix). */}
                      {p.compareAtEur && (
                        <span className="ml-2 text-sm font-normal text-gray-400">
                          <span className="line-through">{p.compareAtEur} €</span>{" "}
                          séparément
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{p.tagline}</p>
                  <ul className="space-y-1">
                    {p.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-gray-500">
                        <Check size={12} className="text-emerald-600 mt-0.5 shrink-0" strokeWidth={2.5} aria-hidden />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Transparence vs l'app */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong>Quelle différence avec l&apos;application ?</strong> Ces
          produits sont autonomes : un fichier que vous possédez, sans
          abonnement. L&apos;app{" "}
          <Link href="/tarifs" className="underline hover:text-gray-900">
            DCA Tracker Premium
          </Link>{" "}
          automatise le suivi (saisie guidée, Monte Carlo, backtest, récap
          fiscal) pour 4,90 €/mois. Beaucoup commencent par le template et
          passent à l&apos;app plus tard — ou l&apos;inverse.
        </p>
      </div>
    </div>
  );
}
