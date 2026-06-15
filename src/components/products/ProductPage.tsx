// Rendu partagé des pages produit (/produits/[slug]).
// Server component — structure : hero (nom, tagline, prix, CTA), abstract,
// features, contenu détaillé, pour qui / pas pour qui (honnêteté = conversion
// qualifiée), FAQ (+ schema), cross-sell, schema.org Product.
//
// Emplacements visuels : le bloc <ProductVisualPlaceholder /> réserve
// l'espace des captures d'écran des produits (fournies par Maël plus tard)
// avec une hauteur FIXE — zéro CLS quand les vraies images arriveront
// (next/image avec width/height aux mêmes dimensions).

import Link from "next/link";
import { Check, X, FileText, Table2, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { JsonLd } from "@/components/ui/JsonLd";
import { AuroraSweep } from "@/components/ui/AuroraSweep";
import { ProductBuyButton } from "./ProductBuyButton";
import { getProductPriceId, PRODUCT_LIST, type Product } from "@/lib/products";

const CANONICAL_ORIGIN = "https://dcatracker.fr";

const PRODUCT_ICONS: Record<string, LucideIcon> = {
  "template-suivi-dca": Table2,
  "guide-demarrer-dca": FileText,
  "bundle-dca": Package,
};

function ProductVisualPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="h-[320px] rounded-2xl border border-gray-200 bg-gradient-to-br from-primary-50/50 via-white to-slate-50 flex items-center justify-center"
      aria-hidden
    >
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  );
}

export function ProductPage({ product }: { product: Product }) {
  const Icon = PRODUCT_ICONS[product.id] ?? FileText;
  const available = getProductPriceId(product) !== null;
  const url = `/produits/${product.slug}`;
  const others = PRODUCT_LIST.filter((p) => p.id !== product.id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: `${CANONICAL_ORIGIN}/` },
          { name: "Produits", url: `${CANONICAL_ORIGIN}/produits` },
          { name: product.shortName },
        ]}
      />

      <nav
        aria-label="Fil d'ariane"
        className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap"
      >
        <Link href="/" className="hover:text-gray-700 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <Link href="/produits" className="hover:text-gray-700 transition-colors">Produits</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-700" aria-current="page">{product.shortName}</span>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 mb-3 flex items-center gap-1.5">
          <Icon size={14} aria-hidden />
          Paiement unique · accès à vie
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          {product.name}
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">{product.tagline}</p>

        <div className={`flex items-baseline gap-3 ${product.priceNote ? "mb-2" : "mb-6"}`}>
          <span className="text-4xl font-bold text-gray-900 tabular-nums">
            {product.priceEur} €
          </span>
          {product.compareAtEur && (
            <span className="text-lg text-gray-400 line-through tabular-nums">
              {product.compareAtEur} €
            </span>
          )}
          <span className="text-sm text-gray-500">
            TTC · une seule fois
            {product.compareAtEur ? " · vs achetés séparément" : ""}
          </span>
        </div>
        {product.priceNote && (
          <p className="text-sm font-medium text-amber-700 mb-6">
            {product.priceNote}
          </p>
        )}

        <ProductBuyButton
          productId={product.id}
          priceEur={product.priceEur}
          available={available}
        />
        <p className="mt-3 text-xs text-gray-500">
          Satisfait ou remboursé 14 jours · livraison immédiate par email ·
          facture automatique
        </p>
      </header>

      {/* ── Visuel (placeholder hauteur fixe — capture produit à venir) ────── */}
      <div className="mb-10">
        <ProductVisualPlaceholder label={`Aperçu — ${product.shortName}`} />
      </div>

      {/* ── Abstract ────────────────────────────────────────────────────────── */}
      <section data-reveal className="mb-10">
        <div className="space-y-4 text-gray-600 leading-relaxed">
          {product.abstract.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section data-reveal className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          Ce que vous obtenez
        </h2>
        <ul className="space-y-3">
          {product.features.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <Check size={16} className="text-emerald-600 mt-1 shrink-0" strokeWidth={2.5} aria-hidden />
              <span className="text-sm text-gray-700 leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Contenu détaillé ────────────────────────────────────────────────── */}
      <section data-reveal className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          Ce qu&apos;il y a dedans
        </h2>
        <div className="space-y-3">
          {product.contents.map((c) => (
            <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-5">
              <p className="text-sm font-bold text-gray-900 mb-1">{c.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pour qui / pas pour qui ─────────────────────────────────────────── */}
      <section data-reveal className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
              C&apos;est pour vous si
            </p>
            <ul className="space-y-2.5">
              {product.forWho.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-emerald-900">
                  <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" strokeWidth={2.5} aria-hidden />
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Passez votre chemin si
            </p>
            <ul className="space-y-2.5">
              {product.notForWho.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <X size={14} className="text-gray-400 mt-0.5 shrink-0" strokeWidth={2.5} aria-hidden />
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Comparatif « eux vs nous » (différenciation vs gratuit) ─────────── */}
      {product.comparison && (
        <section data-reveal className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Pourquoi pas un outil gratuit ?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            {product.comparison.intro}
          </p>
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="w-1/2 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    {product.comparison.themLabel}
                  </th>
                  <th scope="col" className="w-1/2 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary-700 border-b border-gray-200 bg-primary-50/50">
                    {product.comparison.usLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {product.comparison.rows.map((row) => (
                  <tr key={row.us} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-4 py-3.5 align-top text-gray-500 leading-relaxed">
                      <span className="flex items-start gap-2">
                        <X size={14} className="text-gray-400 mt-0.5 shrink-0" strokeWidth={2.5} aria-hidden />
                        {row.them}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-top text-gray-800 leading-relaxed bg-primary-50/30">
                      <span className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" strokeWidth={2.5} aria-hidden />
                        {row.us}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── 2e CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden mb-12 rounded-2xl bg-primary-600 p-8 text-center">
        <AuroraSweep />
        <div className="relative">
          <h2 className="text-xl font-bold text-white mb-2">{product.shortName}</h2>
          <p className="text-primary-200 text-sm mb-6">
            {product.priceEur} € · paiement unique · livraison immédiate par email
          </p>
          <div className="flex justify-center">
            <ProductBuyButton
              productId={product.id}
              priceEur={product.priceEur}
              available={available}
              className="btn-white-primary text-base px-8 py-3.5"
            />
          </div>
          <p className="mt-3 text-xs text-primary-200">
            Satisfait ou remboursé 14 jours
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section data-reveal className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
        <div className="space-y-4">
          {product.faq.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none">
                {q}
                <span aria-hidden className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                {a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Cross-sell ──────────────────────────────────────────────────────── */}
      <section data-reveal className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Voir aussi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {others.map((p) => (
            <Link
              key={p.id}
              href={`/produits/${p.slug}`}
              className="rounded-xl border border-gray-100 bg-white p-4 card-hover"
            >
              <p className="text-sm font-semibold text-gray-900 mb-1">{p.shortName}</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">{p.tagline}</p>
              <p className="text-sm font-bold text-primary-700 tabular-nums">{p.priceEur} €</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Note transparence (anti-cannibalisation honnête) ────────────────── */}
      <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-6">
        Vous préférez un suivi automatique plutôt qu&apos;un fichier à remplir ?
        Notre application{" "}
        <Link href="/tarifs" className="underline hover:text-gray-700">
          DCA Tracker Premium
        </Link>{" "}
        fait le suivi, le Monte Carlo et le récap fiscal pour vous (essai 7
        jours). Les produits de cette page sont autonomes et n&apos;exigent
        aucun abonnement.
      </p>

      {/* Schema.org Product */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.metaDescription,
          url: `${CANONICAL_ORIGIN}${url}`,
          brand: { "@type": "Brand", name: "DCA Tracker" },
          offers: {
            "@type": "Offer",
            price: product.priceEur.toFixed(2),
            priceCurrency: "EUR",
            availability: available
              ? "https://schema.org/InStock"
              : "https://schema.org/PreOrder",
            url: `${CANONICAL_ORIGIN}${url}`,
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: product.faq.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
    </div>
  );
}
