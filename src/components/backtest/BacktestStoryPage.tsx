// Renderer des pages "backtest célèbre" (/backtest-covid-2020, etc.).
// Server component PUR : les chiffres sont calculés au build (runBacktest sur
// le dataset statique), le graphique est un SVG rendu côté serveur — zéro JS
// client, zéro recharts, zéro coût Core Web Vitals. Les pages se régénèrent
// à chaque deploy (le dataset est rafraîchi mensuellement par GitHub Action).

import Link from "next/link";
import { TrendingDown, ArrowRight, History } from "lucide-react";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import { JsonLd } from "@/components/ui/JsonLd";
import { AuroraSweep } from "@/components/ui/AuroraSweep";
import { CountUp } from "@/components/ui/CountUp";
import {
  formatEurBacktest,
  formatMonthFr,
  type BacktestSeriesPoint,
} from "@/lib/backtest";
import type { ComputedStory } from "@/lib/backtest-stories";

const CANONICAL_ORIGIN = "https://dcatracker.fr";

// ─── SVG chart server-rendered ────────────────────────────────────────────────
// Polyline valeur (bleue, aire) + capital investi (gris pointillé). Statique,
// accessible (role=img + aria-label), aucun JS.

function StoryChart({ series }: { series: BacktestSeriesPoint[] }) {
  const W = 600;
  const H = 220;
  const PAD = 10;
  const maxV = Math.max(...series.map((p) => p.value));
  const x = (i: number) => PAD + (i / (series.length - 1)) * (W - 2 * PAD);
  const y = (v: number) => H - PAD - (v / maxV) * (H - 2 * PAD);

  const valuePts = series
    .map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(" ");
  const investedPts = series
    .map((p, i) => `${x(i).toFixed(1)},${y(p.invested).toFixed(1)}`)
    .join(" ");
  const areaPts = `${valuePts} ${x(series.length - 1).toFixed(1)},${(H - PAD).toFixed(1)} ${x(0).toFixed(1)},${(H - PAD).toFixed(1)}`;

  const first = series[0];
  const last = series[series.length - 1];

  return (
    <figure className="rounded-2xl border border-gray-100 bg-white p-5">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Évolution du portefeuille de ${formatMonthFr(first.month)} à ${formatMonthFr(last.month)} : ${formatEurBacktest(last.invested)} investis, ${formatEurBacktest(last.value)} de valeur finale.`}
      >
        <defs>
          <linearGradient id="storyArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPts} fill="url(#storyArea)" />
        <polyline
          points={investedPts}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <polyline
          points={valuePts}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <figcaption className="flex items-center justify-between mt-3 text-[11px] text-gray-500">
        <span>{formatMonthFr(first.month)}</span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-blue-600 inline-block" />
            Portefeuille
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-gray-400 inline-block" />
            Investi
          </span>
        </span>
        <span>{formatMonthFr(last.month)}</span>
      </figcaption>
    </figure>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function BacktestStoryPage({ story }: { story: ComputedStory }) {
  const { def, result, endMonth } = story;
  const url = `/${def.slug}`;
  const gainPositive = result.gainAbs >= 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: `${CANONICAL_ORIGIN}/` },
          { name: "Backtest", url: `${CANONICAL_ORIGIN}/backtest` },
          { name: def.h1 },
        ]}
      />

      <nav
        aria-label="Fil d'ariane"
        className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap"
      >
        <Link href="/" className="hover:text-gray-700 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <Link href="/backtest" className="hover:text-gray-700 transition-colors">Backtest</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-700" aria-current="page">{def.eyebrow}</span>
      </nav>

      <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 mb-3 flex items-center gap-1.5">
        <History size={14} aria-hidden />
        {def.eyebrow}
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {def.h1}
      </h1>

      <ArticleByline
        publishedAt="2026-06-10"
        updatedAt="2026-06-10"
        readingMinutes={5}
        url={url}
        headline={def.h1}
        description={def.metaDescription(result)}
      />

      <p className="text-lg text-gray-600 leading-relaxed mb-8">
        {def.intro(result)}
      </p>

      {/* ── KPIs réels ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">Capital investi</p>
          <p className="text-lg font-bold tabular-nums text-gray-900">
            {formatEurBacktest(result.totalInvested)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{result.monthsInvested} mois</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">Valeur aujourd&apos;hui</p>
          <p className="text-lg font-bold tabular-nums text-primary-700">
            <CountUp value={result.finalValue} as="eur" />
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{formatMonthFr(endMonth)}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">Gain</p>
          <p className={`text-lg font-bold tabular-nums ${gainPositive ? "text-emerald-700" : "text-red-600"}`}>
            {gainPositive ? "+" : ""}{result.gainPct.toFixed(1).replace(".", ",")} %
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {gainPositive ? "+" : ""}{formatEurBacktest(result.gainAbs)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">TRI annualisé</p>
          <p className="text-lg font-bold tabular-nums text-emerald-700">
            {result.irrAnnualPct === null
              ? "—"
              : `${result.irrAnnualPct >= 0 ? "+" : ""}${result.irrAnnualPct.toFixed(2).replace(".", ",")} %`}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">par an</p>
        </div>
      </div>

      {/* ── Chart SVG (zéro JS) ─────────────────────────────────────────────── */}
      <div className="mb-10">
        <StoryChart series={result.series} />
      </div>

      {/* ── Récit ───────────────────────────────────────────────────────────── */}
      {def.sections.map((s) => (
        <section key={s.title} className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{s.title}</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            {s.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      ))}

      {/* ── Drawdown + leçon ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 mb-10">
        <div className="flex items-start gap-3">
          <TrendingDown size={20} className="text-amber-700 shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-amber-900 leading-relaxed">{def.lesson(result)}</p>
        </div>
      </div>

      {/* ── CTA backtest personnalisé ───────────────────────────────────────── */}
      <section className="relative overflow-hidden mb-12 rounded-2xl bg-primary-600 p-8 text-center">
        <AuroraSweep />
        <div className="relative">
          <h2 className="text-xl font-bold text-white mb-2">
            Et avec VOS chiffres ?
          </h2>
          <p className="text-primary-200 text-sm mb-6 leading-relaxed max-w-md mx-auto">
            Le backtest interactif rejoue votre montant et votre période sur les
            mêmes données réelles — TRI, pire creux et courbe mois par mois.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/backtest" className="btn-white-primary">
              Tester mon propre scénario
              <ArrowRight size={14} aria-hidden />
            </Link>
            <Link
              href="/simulateur"
              className="text-sm font-medium text-primary-100 hover:text-white underline underline-offset-4 transition-colors"
            >
              ou projeter l&apos;avenir avec le simulateur
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
        <div className="space-y-4">
          {def.faq(result).map(({ q, a }) => (
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
          {[
            { href: "/backtest", label: "Backtest interactif", sub: "Votre montant, votre période — sur les mêmes données" },
            { href: "/etf-msci-world", label: "ETF MSCI World", sub: "CW8, WPEA, DCAM : lequel choisir en PEA" },
            { href: "/strategie-dca", label: "La stratégie DCA", sub: "Pourquoi la régularité bat le timing" },
            { href: "/interets-composes", label: "Intérêts composés", sub: "Le moteur mathématique derrière ces chiffres" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-gray-100 bg-white p-4 card-hover"
            >
              <p className="text-sm font-semibold text-gray-900 mb-1">{l.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{l.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Méthodo + disclaimer ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 mb-10">
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>Méthodologie</strong> — calcul sur les clôtures mensuelles
          réelles du MSCI World en euros (proxy : iShares Core MSCI World,
          IWDA, coté sur Euronext Amsterdam), achat en fin de mois, données
          mises à jour mensuellement. Ne tient pas compte du TER de l&apos;ETF
          (~0,20 %/an), des frais de courtage ni de la fiscalité. Les
          performances passées ne préjugent pas des performances futures —
          outil pédagogique, pas un conseil en investissement.{" "}
          <Link href="/methodologie" className="underline hover:text-gray-900 transition-colors">
            Méthodologie détaillée
          </Link>
          .
        </p>
      </div>

      <SourcesReferences
        sources={[
          {
            label: "MSCI World Index — méthodologie et historique",
            url: "https://www.msci.com/indexes/index/990100",
            publisher: "MSCI Inc.",
          },
          {
            label: "iShares Core MSCI World UCITS ETF (IWDA) — fiche officielle",
            url: "https://www.ishares.com/fr/individual/fr",
            publisher: "BlackRock — iShares",
            note: "Série de prix utilisée comme proxy de l'indice en euros.",
          },
          {
            label: "Espace épargnants — comprendre les ETF",
            url: "https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/produits-collectifs/fonds-indiciels-cotes-etf",
            publisher: "Autorité des marchés financiers (AMF)",
          },
        ]}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: def.faq(result).map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
    </div>
  );
}
