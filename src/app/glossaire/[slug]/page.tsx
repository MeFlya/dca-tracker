// Route dynamique du glossaire — rend les termes data-driven de
// src/lib/glossary-terms.ts. Les 3 entrées historiques (dca, etf,
// interets-composes) restent des pages statiques dédiées : en App Router,
// les routes statiques ont priorité sur [slug].

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Check, ArrowRight } from "lucide-react";
import { getGlossaryTerm, GLOSSARY_TERM_LIST } from "@/lib/glossary-terms";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { JsonLd } from "@/components/ui/JsonLd";

const CANONICAL_ORIGIN = "https://dcatracker.fr";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return GLOSSARY_TERM_LIST.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return { title: "Terme introuvable — DCA Tracker" };

  const canonical = `/glossaire/${term.slug}`;
  return {
    title: term.metaTitle,
    description: term.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: term.metaTitle,
      description: term.metaDescription,
      url: canonical,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: term.metaTitle,
      description: term.metaDescription,
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const url = `/glossaire/${term.slug}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: `${CANONICAL_ORIGIN}/` },
          { name: "Glossaire", url: `${CANONICAL_ORIGIN}/glossaire` },
          { name: term.term },
        ]}
      />

      <nav
        aria-label="Fil d'ariane"
        className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap"
      >
        <Link href="/" className="hover:text-gray-700 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <Link href="/glossaire" className="hover:text-gray-700 transition-colors">Glossaire</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-700" aria-current="page">{term.term}</span>
      </nav>

      <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 mb-3 flex items-center gap-1.5">
        <BookOpen size={14} aria-hidden />
        Glossaire · {term.category}
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {term.term}
      </h1>

      {/* Définition courte mise en avant — la réponse immédiate (et le
          candidat featured snippet). */}
      <p className="text-lg text-gray-700 leading-relaxed mb-6 pl-4 border-l-4 border-primary-200">
        {term.shortDef}
      </p>

      <ArticleByline
        publishedAt="2026-06-10"
        updatedAt="2026-06-10"
        readingMinutes={3}
        url={url}
        headline={term.term}
        description={term.metaDescription}
      />

      {/* ── Définition ──────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="space-y-4 text-gray-600 leading-relaxed">
          {term.definition.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* ── En pratique ─────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          En pratique pour votre DCA
        </h2>
        <div className="space-y-3">
          {term.inPractice.map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
              <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" strokeWidth={2.5} aria-hidden />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{item.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Exemple chiffré ─────────────────────────────────────────────────── */}
      {term.example && (
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 mb-10">
          <p className="text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
            Exemple chiffré
          </p>
          <p className="text-sm text-primary-900 leading-relaxed">{term.example}</p>
        </div>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Questions fréquentes</h2>
        <div className="space-y-4">
          {term.faq.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl border border-gray-100 bg-white overflow-hidden"
            >
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

      {/* ── Pour aller plus loin ────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Pour aller plus loin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {term.related.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
            >
              <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors leading-snug">
                {r.label}
              </span>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-600 shrink-0 transition-colors" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Retour glossaire ────────────────────────────────────────────────── */}
      <Link
        href="/glossaire"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        ← Tous les termes du glossaire
      </Link>

      {/* Schema : DefinedTerm + FAQPage */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: term.term,
          description: term.shortDef,
          url: `${CANONICAL_ORIGIN}${url}`,
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            name: "Glossaire DCA Tracker",
            url: `${CANONICAL_ORIGIN}/glossaire`,
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: term.faq.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
    </div>
  );
}
