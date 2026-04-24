import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import type { ETFComparison, ETFSide, UseCase } from "@/lib/etf-comparisons";
import { ETF_COMPARISON_LIST } from "@/lib/etf-comparisons";
import { JsonLd } from "@/components/ui/JsonLd";

function PEAPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const positive = normalized.startsWith("oui");
  const negative = normalized.startsWith("non");
  const cls = positive
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : negative
    ? "bg-orange-50 text-orange-700 border-orange-200"
    : "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border ${cls}`}>
      PEA : {value}
    </span>
  );
}

function SideCard({ side, accent }: { side: ETFSide; accent: "left" | "right" }) {
  const border = accent === "left" ? "border-primary-200 bg-primary-50/30" : "border-amber-200 bg-amber-50/30";
  const labelColor = accent === "left" ? "text-primary-700" : "text-amber-700";

  return (
    <div className={`rounded-2xl border-2 p-5 ${border}`}>
      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${labelColor}`}>
        {side.type}
      </p>
      <h3 className="text-lg font-bold text-gray-900 mb-0.5 leading-tight">
        {side.heading}
      </h3>
      {side.subheading && (
        <p className="text-xs text-gray-500 mb-3">{side.subheading}</p>
      )}

      <dl className="space-y-1.5 text-sm mb-3">
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500 shrink-0">Couverture</dt>
          <dd className="text-gray-900 text-right">{side.coverage}</dd>
        </div>
        {side.issuer && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Émetteur</dt>
            <dd className="text-gray-900 text-right">{side.issuer}</dd>
          </div>
        )}
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">TER</dt>
          <dd className="text-gray-900 font-semibold tabular-nums text-right">{side.ter}</dd>
        </div>
        {side.replication && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Réplication</dt>
            <dd className="text-gray-900 text-right">{side.replication}</dd>
          </div>
        )}
        {side.distribution && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Distribution</dt>
            <dd className="text-gray-900 text-right">{side.distribution}</dd>
          </div>
        )}
        {side.currency && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Devise</dt>
            <dd className="text-gray-900 text-right">{side.currency}</dd>
          </div>
        )}
      </dl>

      <PEAPill value={side.peaEligible} />

      <div className="mt-4 space-y-1.5 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          <strong className="text-emerald-700">Point fort :</strong> {side.strongPoint}
        </p>
        <p className="text-xs text-gray-500">
          <strong className="text-orange-700">Point faible :</strong> {side.weakPoint}
        </p>
      </div>
    </div>
  );
}

function UseCaseCard({ useCase, leftName, rightName }: { useCase: UseCase; leftName: string; rightName: string }) {
  const winnerLabel =
    useCase.winner === "both"
      ? "Les deux"
      : useCase.winner === "left"
      ? leftName
      : rightName;
  const winnerCls =
    useCase.winner === "both"
      ? "bg-primary-50 text-primary-700 border-primary-100"
      : useCase.winner === "left"
      ? "bg-primary-50 text-primary-700 border-primary-100"
      : "bg-amber-50 text-amber-800 border-amber-100";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
        <p className="text-sm font-semibold text-gray-900">{useCase.profile}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${winnerCls}`}>
          → {winnerLabel}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{useCase.explanation}</p>
    </div>
  );
}

export function ETFComparisonPage({ comparison }: { comparison: ETFComparison }) {
  const siteUrl = "https://dcatracker.fr";
  const canonical = `/comparatif-etf/${comparison.slug}`;
  const otherComparisons = ETF_COMPARISON_LIST.filter((c) => c.slug !== comparison.slug);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: comparison.metaTitle,
          description: comparison.metaDescription,
          url: `${siteUrl}${canonical}`,
          author: { "@type": "Organization", name: "DCA Tracker" },
          publisher: { "@type": "Organization", name: "DCA Tracker", url: siteUrl },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: comparison.faq.map(({ q, a }) => ({
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
        <Link href="/comparatif-etf" className="hover:text-gray-600 transition-colors">Comparatifs ETF</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600 truncate" aria-current="page">
          {comparison.left.heading} vs {comparison.right.heading}
        </span>
      </nav>

      {/* Hero */}
      <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">
        Comparatif ETF
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {comparison.title}
      </h1>
      <p className="text-base text-gray-600 leading-relaxed mb-10">
        {comparison.intro}
      </p>

      {/* Verdict callout */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-6 mb-10 text-white">
        <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary-200">
          Verdict en 2 phrases
        </p>
        <p className="text-base leading-relaxed">{comparison.verdict}</p>
      </div>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 relative">
        <SideCard side={comparison.left} accent="left" />
        <SideCard side={comparison.right} accent="right" />
        {/* VS divider */}
        <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-100 items-center justify-center text-gray-500 shadow-sm">
          <ArrowLeftRight size={14} />
        </div>
      </div>

      {/* Key differences table */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Différences clés point par point
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-10">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Critère</th>
              <th className="text-left px-4 py-3 font-semibold text-primary-700">{comparison.left.heading}</th>
              <th className="text-left px-4 py-3 font-semibold text-amber-700">{comparison.right.heading}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comparison.keyDifferences.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-4 py-3 text-gray-500">{row.criterion}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{row.leftValue}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{row.rightValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Use cases */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Lequel choisir selon votre profil ?
      </h2>
      <div className="space-y-3 mb-10">
        {comparison.useCases.map((uc, i) => (
          <UseCaseCard
            key={i}
            useCase={uc}
            leftName={comparison.left.heading}
            rightName={comparison.right.heading}
          />
        ))}
      </div>

      {/* Long-form analysis */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Analyse approfondie</h2>
      <p className="text-base text-gray-700 leading-relaxed mb-10">
        {comparison.analysis}
      </p>

      {/* FAQ */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
      <div className="space-y-3 mb-10">
        {comparison.faq.map(({ q, a }) => (
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
          Simulez l&apos;impact du TER sur 20 ans
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          0,2 % de TER en plus ou en moins sur 20 ans, c&apos;est des milliers
          d&apos;euros d&apos;écart. Testez votre scénario dans le simulateur.
        </p>
        <Link
          href="/simulateur?monthly=200&years=20&return=7&fees=0.25"
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          Ouvrir le simulateur →
        </Link>
      </div>

      {/* Other comparisons */}
      <div className="pt-8 border-t border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Autres comparatifs
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {otherComparisons.map((c) => (
            <Link
              key={c.slug}
              href={`/comparatif-etf/${c.slug}`}
              className="rounded-xl border border-gray-100 bg-white p-4 card-hover"
            >
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {c.left.heading} vs {c.right.heading}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {c.verdict}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Legal */}
      <p className="mt-10 text-[11px] text-gray-500 leading-relaxed">
        Cet article est fourni à titre informatif et ne constitue pas un conseil
        en investissement personnalisé. Les performances historiques ne préjugent
        pas des performances futures. TER et caractéristiques sont indicatifs et
        susceptibles d&apos;évoluer — vérifiez toujours les DICI/KID à jour chez
        l&apos;émetteur avant tout investissement.
      </p>
    </article>
  );
}
