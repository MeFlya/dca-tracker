import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ETF_LIST, getETFBySymbol } from "@/lib/etf-config";
import type { AccountType } from "@/lib/broker-config";
import { getETFDetailContent } from "@/lib/etf-detail-content";
import { getMarketDataProvider, isDemo } from "@/lib/market-data";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { DemoBadge, DelayedBadge } from "@/components/ui/Disclaimer";
import { InvestCTA } from "@/components/ui/InvestCTA";
import { cn } from "@/lib/utils";

// ─── Static generation ───────────────────────────────────────────────────────

export function generateStaticParams() {
  return ETF_LIST.map((etf) => ({ symbol: etf.displaySymbol }));
}

export const revalidate = 300;

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  const etf = getETFBySymbol(symbol);
  if (!etf) return { title: "ETF introuvable" };

  const isinStr = etf.isin ? `, ISIN ${etf.isin}` : "";
  const title = `ETF ${etf.displaySymbol} — ${etf.name} : analyse et simulation DCA`;
  const description =
    `Simulez le DCA sur ${etf.displaySymbol} (${etf.name}). ` +
    `${etf.category}, TER ${etf.ter} %, réplication ${etf.replicationMethod.toLowerCase()}, ` +
    `${etf.distributionPolicy.toLowerCase()}${isinStr}. ` +
    `Projection long terme avec intérêts composés, hypothèses transparentes.`;

  return {
    title,
    description,
    alternates: { canonical: `/etf/${etf.displaySymbol}` },
    openGraph: {
      title,
      description,
      url: `/etf/${etf.displaySymbol}`,
      type: "website",
      // OG image générée dynamiquement par convention via etf/[symbol]/opengraph-image.tsx
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `${etf.displaySymbol} · TER ${etf.ter} % · ${etf.replicationMethod} · ${etf.distributionPolicy}${etf.isin ? ` · ${etf.isin}` : ""}. Simulateur DCA intégré.`,
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ETFDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const etf = getETFBySymbol(symbol);
  if (!etf) notFound();

  const detail = getETFDetailContent(etf.displaySymbol);
  const provider = getMarketDataProvider();
  const { results } = await provider.getQuotes([etf.symbol]);
  const result = results[etf.symbol];
  const quote = result?.quote ?? null;
  const demo = isDemo();

  const otherETFs = ETF_LIST.filter((e) => e.displaySymbol !== etf.displaySymbol);

  const etfAccountType: AccountType = etf.peaEligible ? "PEA" : "CTO";

  // Simulator URL pre-filled with this ETF's typical return + fees
  const suggestedReturn = detail?.suggestedReturn ?? 7;
  const simulatorUrl = `/simulateur?monthly=200&years=20&return=${suggestedReturn}&fees=${etf.ter}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Fil d'ariane">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <Link href="/comparer-etf" className="hover:text-gray-600 transition-colors">Comparer les ETF</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-700 font-medium">{etf.displaySymbol}</span>
      </nav>

      {/* ── Hero card — focal point de la page ETF (.card-primary) ──────── */}
      <header className="card-primary mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          {/* Left: identity */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary-700 tracking-tight">
                {etf.displaySymbol}
              </span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {etf.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {etf.category}
                </span>
                {demo && <DemoBadge />}
                {!demo && quote?.isDelayed && <DelayedBadge />}
              </div>
            </div>
          </div>

          {/* Right: price */}
          <PriceBlock quote={quote} error={result?.error ?? null} />
        </div>

        {/* Key metrics bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5 border-t border-gray-50">
          <MetricCell label="TER" value={`${etf.ter} %`} highlight />
          <MetricCell label="Réplication" value={etf.replicationMethod} />
          <MetricCell label="Distribution" value={etf.distributionPolicy} />
          {etf.isin && <MetricCell label="ISIN" value={etf.isin} mono />}
          {quote?.exchange && <MetricCell label="Bourse" value={quote.exchange} />}
        </div>
      </header>

      {/* ── Description courte ─────────────────────────────────────────── */}
      <p className="text-base text-gray-600 leading-relaxed mb-10 border-l-4 border-primary-200 pl-5">
        {etf.description}
      </p>

      {/* ── Ce qu'il suit ──────────────────────────────────────────────── */}
      {detail && (
        <>
          <ContentSection title="Ce qu'il suit" icon="📈">
            {detail.whatItTracks.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-sm text-gray-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </ContentSection>

          {/* ── 3-col insight cards ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <InsightCard
              title="Pourquoi le choisir ?"
              icon="✓"
              iconColor="text-gain-dark"
              borderColor="border-green-100"
              bgColor="bg-green-50"
              items={detail.whyChooseIt}
              itemColor="text-gain-dark"
            />
            <InsightCard
              title="Points d'attention"
              icon="⚠"
              iconColor="text-amber-500"
              borderColor="border-amber-100"
              bgColor="bg-amber-50"
              items={detail.watchOut}
              itemColor="text-amber-700"
            />
            <div className="card flex flex-col gap-3 border-blue-100 bg-blue-50">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                À qui il convient
              </p>
              <p className="text-sm text-blue-800 leading-relaxed">
                {detail.suitableFor}
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── DCA CTA band ───────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-7 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <p className="text-white font-semibold text-lg mb-1">
            Simuler le DCA sur {etf.displaySymbol}
          </p>
          <p className="text-primary-200 text-sm leading-snug">
            Projetez votre investissement mensuel sur cet ETF avec le rendement
            historique de référence ({suggestedReturn} %/an) et les frais réels ({etf.ter} %).
          </p>
        </div>
        <Link
          href={simulatorUrl}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary-700 font-semibold text-sm hover:bg-primary-50 transition-colors"
        >
          Ouvrir le simulateur →
        </Link>
      </div>

      {/* ── Données de marché ──────────────────────────────────────────── */}
      {quote && (
        <div className="card mb-10 bg-gray-50 border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Données de marché
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <DataPoint label="Cours" value={formatCurrency(quote.price, quote.currency)} />
            <DataPoint
              label="Variation"
              value={formatPercent(quote.changePercent)}
              valueClass={quote.changePercent >= 0 ? "text-gain-dark font-semibold" : "text-loss-dark font-semibold"}
            />
            <DataPoint label="Devise" value={quote.currency} />
            <DataPoint label="Mis à jour" value={formatDate(quote.lastUpdated)} />
          </div>
          <p className="mt-3 text-[11px] text-gray-500">
            {demo
              ? "Mode démo — données illustratives, pas des cours réels."
              : "Données différées (fin de journée). Source : " + provider.name + "."}
          </p>
        </div>
      )}

      {/* ── Autres ETF ─────────────────────────────────────────────────── */}
      <section aria-labelledby="autres-etf-heading" className="mb-10">
        <h2
          id="autres-etf-heading"
          className="text-base font-semibold text-gray-700 mb-4"
        >
          Comparer avec d&apos;autres ETF
        </h2>
        <div className="flex flex-wrap gap-3">
          {otherETFs.map((other) => (
            <Link
              key={other.symbol}
              href={`/etf/${other.displaySymbol}`}
              className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50 transition-all duration-150"
            >
              <span className="text-xs font-bold text-gray-900 group-hover:text-primary-700">
                {other.displaySymbol}
              </span>
              <span className="text-xs text-gray-500 group-hover:text-primary-700 truncate max-w-[140px]">
                {other.name}
              </span>
            </Link>
          ))}
          <Link
            href="/comparer-etf"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500 hover:text-primary-600 hover:border-primary-200 transition-colors"
          >
            Voir la comparaison complète →
          </Link>
        </div>
      </section>

      {/* ── Invest CTA ─────────────────────────────────────────────────── */}
      <InvestCTA accountType={etfAccountType} className="mb-8" />

      {/* ── Legal ──────────────────────────────────────────────────────── */}
      <footer className="p-4 rounded-xl bg-amber-50 border border-amber-200">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Avertissement :</strong> Les informations présentées sur cette
          page sont à caractère éducatif et informatif. Elles ne constituent pas
          un conseil en investissement financier personnalisé. Les performances
          passées ne présagent pas des performances futures. Les données de marché
          sont indicatives et peuvent être différées. Consultez un conseiller
          financier agréé (CGP/CIF) avant toute décision d&apos;investissement.
        </p>
      </footer>
    </div>
  );
}

// ─── Sub-components (page-scoped, not exported) ──────────────────────────────

function PriceBlock({
  quote,
  error,
}: {
  quote: NonNullable<
    Awaited<
      ReturnType<Awaited<ReturnType<typeof getMarketDataProvider>>["getQuote"]>
    >["quote"]
  > | null;
  error: string | null;
}) {
  if (error) {
    return (
      <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 self-start">
        Cours indisponible
      </div>
    );
  }
  if (!quote) return null;

  const positive = quote.changePercent >= 0;
  return (
    <div className="text-right shrink-0">
      <p className="text-2xl font-bold text-gray-900 tabular-nums">
        {formatCurrency(quote.price, quote.currency)}
      </p>
      <p
        className={cn(
          "text-sm font-semibold tabular-nums mt-0.5",
          positive ? "text-gain-dark" : "text-loss-dark"
        )}
      >
        {positive ? "▲" : "▼"} {formatPercent(Math.abs(quote.changePercent))}
        <span className="text-gray-500 font-normal ml-1 text-xs">
          ({positive ? "+" : ""}{formatCurrency(quote.change, quote.currency)})
        </span>
      </p>
    </div>
  );
}

function MetricCell({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-semibold text-gray-800",
          mono && "font-mono text-xs",
          highlight && "text-primary-700"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ContentSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
        <span aria-hidden>{icon}</span>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function InsightCard({
  title,
  icon,
  iconColor,
  borderColor,
  bgColor,
  items,
  itemColor,
}: {
  title: string;
  icon: string;
  iconColor: string;
  borderColor: string;
  bgColor: string;
  items: string[];
  itemColor: string;
}) {
  return (
    <div className={cn("rounded-2xl border p-5 flex flex-col gap-3", borderColor, bgColor)}>
      <p className={cn("text-xs font-semibold uppercase tracking-wider", iconColor)}>
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className={cn("shrink-0 mt-0.5 text-xs font-bold", iconColor)}>
              {icon}
            </span>
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DataPoint({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">
        {label}
      </p>
      <p className={cn("text-sm font-medium text-gray-800 tabular-nums", valueClass)}>
        {value}
      </p>
    </div>
  );
}
