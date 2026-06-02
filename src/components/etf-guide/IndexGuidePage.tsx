// Rendu partagé des pages "nom d'indice" (/etf-msci-world, /etf-sp500, /etf-nasdaq).
// Server component — réutilise EducationalHeader, ArticleByline, SourcesReferences,
// JsonLd. Données : src/lib/etf-index-guides.ts.

import Link from "next/link";
import { Globe, Landmark, Cpu, Check, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EducationalHeader } from "@/components/ui/EducationalHeader";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import { JsonLd } from "@/components/ui/JsonLd";
import type { IndexGuide } from "@/lib/etf-index-guides";

const ICONS: Record<IndexGuide["icon"], LucideIcon> = {
  Globe,
  Landmark,
  Cpu,
};

const CANONICAL_ORIGIN = "https://dcatracker.fr";

export function IndexGuidePage({ guide }: { guide: IndexGuide }) {
  const Icon = ICONS[guide.icon];
  const url = `/${guide.slug}`;

  // CTA → simulateur pré-réglé avec les hypothèses de cet indice (frais réels
  // + rendement de base raisonnable). L'user ajuste tout ensuite.
  const s = guide.simulator;
  const simHref = `/simulateur?monthly=${s.monthly}&years=${s.years}&return=${s.returnPct}&fees=${s.feesPct}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: `${CANONICAL_ORIGIN}/` },
          { name: "Comparatifs ETF", url: `${CANONICAL_ORIGIN}/comparatif-etf` },
          { name: `ETF ${guide.indexName}` },
        ]}
      />

      {/* Breadcrumb visible */}
      <nav
        aria-label="Fil d'ariane"
        className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap"
      >
        <Link href="/" className="hover:text-gray-700 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <Link href="/comparatif-etf" className="hover:text-gray-700 transition-colors">Comparatifs ETF</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-700" aria-current="page">ETF {guide.indexName}</span>
      </nav>

      <EducationalHeader
        icon={Icon}
        eyebrow={guide.eyebrow}
        title={guide.h1}
        subtitle={guide.subtitle}
      />

      <ArticleByline
        publishedAt={guide.publishedAt}
        updatedAt={guide.updatedAt}
        readingMinutes={guide.readingMinutes}
        url={url}
        headline={guide.h1}
        description={guide.metaDescription}
      />

      {/* ── Qu'est-ce que l'indice ──────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Qu&apos;est-ce que l&apos;indice {guide.indexName} ?
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          {guide.whatItIs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* ── Les trackers ────────────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Les ETF {guide.indexName} (PEA et CTO)
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Les ETF éligibles PEA d&apos;abord, puis ceux réservés au compte-titres.
        </p>

        <div className="space-y-3">
          {guide.trackers.map((t) => (
            <div
              key={t.ticker}
              className={`rounded-2xl border p-5 ${
                t.recommended
                  ? "border-primary-200 bg-primary-50/40 ring-1 ring-primary-100"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-base font-bold text-gray-900">{t.ticker}</span>
                    {t.recommended && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary-700 bg-primary-100 border border-primary-200 px-1.5 py-0.5 rounded">
                        <Check size={10} strokeWidth={3} /> Recommandé
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{t.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      t.pea
                        ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                        : "text-slate-600 bg-slate-50 border-slate-200"
                    }`}
                  >
                    {t.envelope}
                  </span>
                  <span className="text-xs font-bold text-gray-900 tabular-nums bg-gray-100 px-2 py-0.5 rounded-full">
                    TER {t.ter}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-1">{t.note}</p>
              <p className="text-xs text-gray-400">
                {t.issuer} · Réplication {t.replication.toLowerCase()}
                {t.isin ? ` · ${t.isin}` : ""}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Données indicatives revues en juin 2026. Les TER et encours évoluent —
          vérifiez toujours le Document d&apos;Informations Clés (DIC) de
          l&apos;émetteur avant d&apos;investir.
        </p>
      </section>

      {/* ── Verdict ─────────────────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Notre verdict</h2>
        <div className="space-y-3">
          {guide.verdict.map((v, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5">
              <p className="text-sm font-bold text-primary-700 mb-1.5">{v.label}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── À retenir ───────────────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">À retenir</h2>
        <ul className="space-y-3">
          {guide.keyPoints.map((k, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" strokeWidth={2.5} />
              <span className="text-sm text-gray-600 leading-relaxed">{k}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── CTA simulateur (pré-réglé pour l'indice) ────────────────────────── */}
      <section className="mb-12 rounded-2xl bg-primary-600 p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Combien rapporte un DCA sur le {guide.indexName} ?
        </h2>
        <p className="text-primary-200 text-sm mb-6 leading-relaxed">
          Le simulateur s&apos;ouvre <strong className="text-white">pré-réglé pour
          le {guide.indexName}</strong> (frais {s.feesPct.toString().replace(".", ",")} %
          du tracker PEA, hypothèse de base {s.returnPct} %/an). Ajustez le
          versement, la durée et le rendement à votre guise.
        </p>
        <Link href={simHref} className="btn-secondary text-sm px-5 py-2.5 inline-flex">
          Simuler mon DCA {guide.indexName} →
        </Link>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
        <div className="space-y-4">
          {guide.faq.map(({ q, a }) => (
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
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Pour aller plus loin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {guide.related.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
            >
              <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                {r.label}
              </span>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-600 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      <SourcesReferences sources={guide.sources} />

      {/* FAQ schema */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faq.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
    </div>
  );
}
