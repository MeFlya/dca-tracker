import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ETF_LIST, getETFBySymbol, type ETFConfig } from "@/lib/etf-config";
import type { AccountType } from "@/lib/broker-config";
import { getETFDetailContent } from "@/lib/etf-detail-content";
import { getMarketDataProvider, isDemo, libelleFournisseur } from "@/lib/market-data";
import { formatCurrency, formatPercent, formatPercentSansSigne, formatDate, formatTer } from "@/lib/utils";
import { DemoBadge, DelayedBadge } from "@/components/ui/Disclaimer";
import { InvestCTA } from "@/components/ui/InvestCTA";
import { RenvoiProduit } from "@/components/products/RenvoiProduit";
import { IssuerLogoMark } from "@/components/ui/IssuerLogoMark";
import { RegionMark } from "@/components/ui/RegionMark";
import { cn } from "@/lib/utils";
import { lienListePea } from "@/lib/etf-pea-verifies";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { JsonLd } from "@/components/ui/JsonLd";
import { reponseFiche } from "@/lib/reponse-fiche-etf";
import { FICHE_ETF, FICHES_ETF_MAJ_LE } from "@/lib/sources-etf";
import { ETF_COMPARISON_LIST } from "@/lib/etf-comparisons";

// ─── Dates de publication des fiches (30/09/2026) ──────────────────────────
//
// Pour la byline et le JSON-LD Article, ajoutés ce jour-là (les fiches n'en
// avaient pas : ni date, ni auteur). Relevées dans git, fiche par fiche : le
// commit qui a créé l'URL /etf/<mnémonique>. Le commit du 23/04/2026
// (mnémoniques Lyxor renommés) a créé IWDA, 500, AEEM, JPNK et C3M ; WPEA,
// DCAM, PSP5, PUST et PAEEM sont entrés au catalogue le 28/09/2026. PAEEM :
// une fiche de ce nom a existé du 18 au 23/04/2026, puis l'URL a redirigé
// vers AEEM, un autre fonds, jusqu'au 28/09 — la fiche actuelle date de là.
// Un ETF ajouté au catalogue sans sa date casse le build, plutôt que de
// publier une date inventée.
const PUBLIEE_LE: Record<string, string> = {
  CW8: "2026-04-18",
  VWCE: "2026-04-18",
  CSPX: "2026-04-18",
  SPY: "2026-04-18",
  VUSA: "2026-04-18",
  ANX: "2026-04-18",
  QQQ: "2026-04-18",
  PCEU: "2026-04-18",
  RS2K: "2026-04-18",
  IWDA: "2026-04-23",
  "500": "2026-04-23",
  AEEM: "2026-04-23",
  JPNK: "2026-04-23",
  C3M: "2026-04-23",
  WPEA: "2026-09-28",
  DCAM: "2026-09-28",
  PSP5: "2026-09-28",
  PUST: "2026-09-28",
  PAEEM: "2026-09-28",
};
for (const e of ETF_LIST) {
  if (!PUBLIEE_LE[e.displaySymbol]) {
    throw new Error(
      `etf/[symbol]/page.tsx : pas de date de publication pour ${e.displaySymbol}. ` +
        "Relevez-la dans git (commit qui crée l'entrée) et ajoutez-la à PUBLIEE_LE.",
    );
  }
}

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

  const title = titreFiche(etf);
  const description = descriptionFiche(etf);

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
      description,
    },
  };
}

// Sorties de generateMetadata le 30/09/2026, INCHANGÉES : la page s'en sert
// aussi pour le JSON-LD Article (headline, description), qui doit dire la même
// chose que le <title> et la meta.
function titreFiche(etf: ETFConfig): string {
  // CTR (analyse GSC juin 2026) : la requête ticker nu ("cw8" : 143 imp/mois,
  // pos 14) ne cliquait pas sur l'ancien title technique ("— Nom complet :
  // analyse et simulation DCA"). Nouveau pattern : ticker + indice d'abord,
  // puis l'intention de recherche (frais, avis, alternatives) au lieu des
  // specs sèches (ISIN/réplication → reléguées au corps de page).
  // Gabarit volontairement court : `indexLabel` peut être long (« Obligations
  // EUR (court terme) »), et c'est lui qui faisait dépasser 60 caractères sur
  // C3M, AEEM et PCEU. Le millésime est porté par la meta description.
  return `ETF ${etf.displaySymbol} (${etf.indexLabel}) : frais et avis`;
}

function descriptionFiche(etf: ETFConfig): string {
  // Description refaite le 28/09/2026. L'ancienne (197 à 240 caractères, donc
  // tronquée par Google sur les 19 fiches) posait « Faut-il l'acheter en
  // 2026 ? » — une promesse de conseil que le site ne peut pas tenir sans
  // statut CIF — et disait « réservé au CTO » pour SPY et QQQ, qu'un
  // particulier de l'UE ne peut pas acheter du tout (pas de DIC, voir
  // sansDicUE). Gabarit court, sans le nom complet (jusqu'à 60 caractères) :
  // le ticker et l'indice suffisent à reconnaître le fonds.
  const ter = etf.ter.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
  const enveloppe = etf.sansDicUE
    ? "sans DIC, inaccessible aux particuliers de l'UE"
    : etf.peaEligible
      ? "éligible PEA"
      : "hors PEA";
  return (
    `${etf.displaySymbol} (${etf.indexLabel}) : ${ter} % de frais, ${enveloppe}, ` +
    `${etf.distributionPolicy.toLowerCase()}. ISIN, limites, équivalents et DCA simulé avec ses frais.`
  );
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
  // 09/10/2026 : les comparatifs où cet ETF est l'un des deux côtés, avec
  // leur H1 comme texte de lien (« cw8 vs dcam » était servi par cette fiche,
  // sans lien vers la page dédiée).
  const comparatifs = ETF_COMPARISON_LIST.filter(
    (c) => c.left.heading === etf.displaySymbol || c.right.heading === etf.displaySymbol,
  );
  const lienPea = lienListePea(etf.displaySymbol);
  const reponse = reponseFiche(etf);
  const ficheSource = FICHE_ETF[etf.displaySymbol];

  const etfAccountType: AccountType = etf.peaEligible ? "PEA" : "CTO";

  // Simulator URL pre-filled with this ETF's typical return + fees
  const suggestedReturn = detail?.suggestedReturn ?? 7;
  // Mode "Rapide" (valeurs directes) avec frais réels + rendement de référence.
  const simulatorUrl = `/simulateur?monthly=200&years=20&return=${suggestedReturn}&fees=${etf.ter}`;
  // Mode "Mes ETF" : ouvre le simulateur avec CET ETF sélectionné à 100 %.
  const portfolioUrl = `/simulateur?etfs=${etf.displaySymbol}:100&monthly=200&years=20`;

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
            <IssuerLogoMark name={etf.name} height={48} className="shrink-0" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {etf.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-xs font-bold text-primary-700 tracking-tight">
                  {etf.displaySymbol}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  <RegionMark region={etf.region} size={14} />
                  {etf.indexLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {etf.category}
                </span>
                {/* Statut PEA (29/09/2026) : ce qu'un lecteur français cherche
                    d'abord, et qu'aucune pastille ne disait. Le lien mène à
                    l'endroit de la liste vérifiée qui parle de CE fonds : son
                    groupe d'indice s'il est éligible, sa carte et son
                    équivalent PEA s'il ne l'est pas. Un fonds absent de la
                    liste (C3M, SPY) garde la pastille, sans lien : elle
                    mènerait à une page qui ne parle pas de lui. */}
                {lienPea ? (
                  <Link
                    href={lienPea}
                    title="Liste vérifiée des ETF éligibles au PEA"
                    className={cn(
                      "px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-colors",
                      etf.peaEligible
                        ? "text-emerald-700 bg-emerald-50 border-emerald-100 hover:border-emerald-300"
                        : "text-slate-600 bg-slate-50 border-slate-200 hover:border-slate-300",
                    )}
                  >
                    {etf.peaEligible ? "Éligible PEA" : "Hors PEA"}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full border text-xs font-semibold",
                      etf.peaEligible
                        ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                        : "text-slate-600 bg-slate-50 border-slate-200",
                    )}
                  >
                    {etf.peaEligible ? "Éligible PEA" : "Hors PEA"}
                  </span>
                )}
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
          <MetricCell label="TER" value={formatTer(etf.ter)} highlight />
          <MetricCell label="Réplication" value={etf.replicationMethod} />
          <MetricCell label="Distribution" value={etf.distributionPolicy} />
          {etf.isin && <MetricCell label="ISIN" value={etf.isin} mono />}
          {quote?.exchange && <MetricCell label="Bourse" value={quote.exchange} />}
        </div>
      </header>

      {/* ── Signature, date et JSON-LD Article (30/09/2026) ────────────── */}
      <ArticleByline
        publishedAt={PUBLIEE_LE[etf.displaySymbol]}
        updatedAt={FICHES_ETF_MAJ_LE}
        url={`/etf/${etf.displaySymbol}`}
        headline={titreFiche(etf)}
        description={descriptionFiche(etf)}
        className="mb-4"
      />

      {/* ── La réponse d'abord (30/09/2026) ─────────────────────────────────
          Première phrase : le statut PEA — avec l'ISIN et le TER pour un
          fonds éligible ; pour un fonds qui ne l'est pas, les équivalents
          vérifiés de même indice (règle 4 de la table), dits comme une
          correspondance, pas comme un conseil. Tout est lu dans les données
          vérifiées : voir reponse-fiche-etf.ts. */}
      <div className="mb-6">
        <p className="text-base text-gray-800 leading-relaxed">
          <strong className="font-semibold text-gray-900">{reponse.statut}</strong>
          {reponse.equivalents && (
            <>
              {" "}{reponse.equivalents.intro}{" "}
              {reponse.equivalents.fonds.map((f, i) => (
                <span key={f.symbole}>
                  {i > 0 && (i === reponse.equivalents!.fonds.length - 1 ? " et " : ", ")}
                  <Link href={f.href} className="font-semibold text-primary-700 hover:underline">
                    {f.symbole}
                  </Link>{" "}
                  ({f.ter})
                </span>
              ))}
              {/* « d'indice » ou « approchée » (VWCE, émergents) : 30/09/2026. */}
              &nbsp;: {reponse.equivalents.correspondance}, pas une recommandation.
            </>
          )}
          {reponse.sansEquivalent && <> {reponse.sansEquivalent}</>}
          {reponse.precisions.map((p) => (
            <span key={p}> {p}</span>
          ))}
        </p>
        <p className="mt-2 text-xs text-gray-500 leading-relaxed">
          {reponse.verification}{" "}
          <Link href={reponse.lienListe} className="underline underline-offset-2 hover:text-gray-700">
            Liste vérifiée des ETF éligibles au PEA
          </Link>
          {ficheSource && (
            <>
              {" · "}
              <a
                href={ficheSource.url}
                target="_blank"
                rel="noopener"
                className="underline underline-offset-2 hover:text-gray-700"
              >
                {ficheSource.libelle}
              </a>
            </>
          )}
          .
        </p>
      </div>

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
              {/* <h3>, pas <p> (28/09/2026) : la recherche interne découpe les
                  pages à chaque h2/h3. En <p>, les trois cartes étaient rangées
                  sous « Ce qu'il suit » et coupées à 1 600 caractères — sur
                  CW8, tout « Points d'attention » disparaissait de l'index.
                  Même apparence : les utilitaires écrasent la base h3
                  (taille, graisse, tracking-tight). */}
              <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                À qui il convient
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                {detail.suitableFor}
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── DCA CTA band ───────────────────────────────────────────────── */}
      {/* data-nosearch (recherche interne, 28/09/2026) : un appel à l'action
          n'est pas un contenu. Sans lui, « Simuler un DCA sur CW8… ou en
          valeurs directes » se collait au passage « À qui il convient ». */}
      <div data-nosearch="" className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-7 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <p className="text-white font-semibold text-lg mb-1">
            Simuler un DCA sur {etf.displaySymbol}
          </p>
          {/* {" "} explicite : en JSX, le retour à la ligne après
              l'expression ne produit aucune espace — le HTML affichait
              « avec CW8déjà sélectionné » sur les 19 fiches. */}
          <p className="text-primary-200 text-sm leading-snug">
            Le simulateur s&apos;ouvre en mode « Mes ETF » avec {etf.displaySymbol}{" "}
            déjà sélectionné. Frais réels ({formatTer(etf.ter)}) pris en compte.
          </p>
        </div>
        <div className="shrink-0 flex flex-col sm:items-end gap-2">
          <Link
            href={portfolioUrl}
            className="btn-white-primary"
          >
            Simuler avec {etf.displaySymbol} →
          </Link>
          <Link
            href={simulatorUrl}
            className="text-xs font-medium text-primary-100 hover:text-white underline underline-offset-4 transition-colors"
          >
            ou en valeurs directes
          </Link>
        </div>
      </div>

      {/* ── Données de marché ──────────────────────────────────────────── */}
      {quote && (
        <div data-nosearch="" className="card mb-10 bg-gray-50 border-gray-100">
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
              : "Données différées (fin de journée). Source : " + libelleFournisseur(provider.name) + "."}
          </p>
        </div>
      )}

      {/* ── FAQ (30/09/2026) ────────────────────────────────────────────────
          Deux ou trois questions, calculées sur les données vérifiées
          (reponse-fiche-etf.ts) : l'éligibilité, les frais, l'équivalent PEA
          ou les autres ETF du même indice. <details> ouverts, comme sur les
          comparatifs : une réponse repliée est une réponse qu'on ne lit pas. */}
      <section aria-labelledby="faq-etf" className="mb-10">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: reponse.faq.map(({ q, a }) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }}
        />
        <h2 id="faq-etf" className="text-lg font-semibold text-gray-900 mb-4">
          Questions fréquentes sur {etf.displaySymbol}
        </h2>
        <div className="space-y-3">
          {reponse.faq.map(({ q, a }) => (
            <details
              key={q}
              open
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
      </section>

      {/* ── Renvoi vers le guide (29/09/2026) ──────────────────────────────
          Seulement sur les fiches d'ETF éligibles au PEA : le guide est bâti
          autour du PEA et vérifie un par un 13 ETF éligibles, dont les huit
          de ce catalogue. Sur un fonds hors PEA — SPY et QQQ, qu'un
          particulier de l'UE ne peut pas acheter, C3M, quasi-monétaire —
          une phrase sur « l'acheter » pousserait vers ce que le guide ne
          traite pas.
          Au conditionnel (« si vous le retenez ») : sur CW8, le plus cher
          des MSCI World éligibles de notre sélection, une phrase qui tient
          l'achat pour acquis serait un conseil déguisé.
          Placé après les données de marché, pas contre le bandeau
          simulateur : collés, ses deux liens et celui-ci faisaient trois
          appels au même endroit. */}
      {etf.peaEligible && (
        <RenvoiProduit
          produit="guide-demarrer-dca"
          contexte={
            `${etf.displaySymbol} est éligible au PEA. Si vous le retenez, c'est son ISIN` +
            `${etf.isin ? `, ${etf.isin},` : ""} qu'on saisit chez le courtier. ` +
            `Avant ce premier ordre, il reste à ouvrir un PEA et à choisir un courtier dont les frais conviennent à votre montant.`
          }
          className="mb-10"
        />
      )}

      {/* ── Comparatifs de cet ETF ─────────────────────────────────────── */}
      {/* data-nosearch : comme « Autres ETF », ce bloc nomme d'autres fonds. */}
      {comparatifs.length > 0 && (
        <section data-nosearch="" data-reveal aria-labelledby="comparatifs-etf-heading" className="mb-10">
          <h2 id="comparatifs-etf-heading" className="text-base font-semibold text-gray-700 mb-4">
            Comparatifs avec {etf.displaySymbol}
          </h2>
          <ul className="space-y-2">
            {comparatifs.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/comparatif-etf/${c.slug}`}
                  className="text-sm font-medium text-primary-700 hover:underline"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Autres ETF ─────────────────────────────────────────────────── */}
      {/* data-nosearch (recherche interne, 28/09/2026) : cette liste nomme
          les 18 autres fonds. Indexée, elle faisait remonter les 19 fiches
          sur toute recherche par nom d'indice ou d'émetteur (« Russell
          2000 » : places 2 à 10, toutes vers ce bloc, sans le terme). */}
      <section data-nosearch="" data-reveal aria-labelledby="autres-etf-heading" className="mb-10">
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
      {/* data-nosearch, comme <Disclaimer /> : la liste ci-dessus exclue, ce
          texte n'aurait plus de titre au-dessus de lui et se collerait au
          dernier passage de contenu — « CGP » ou « conseiller financier »
          renverraient alors les 19 fiches. */}
      <footer data-nosearch="" className="p-4 rounded-xl bg-amber-50 border border-amber-200">
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
    // data-nosearch comme le cours lui-même : l'état « indisponible » du
    // moment du build n'a pas à rester dans l'index jusqu'au déploiement
    // suivant.
    return (
      <div data-nosearch="" className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 self-start">
        Cours indisponible
      </div>
    );
  }
  if (!quote) return null;

  const positive = quote.changePercent >= 0;
  return (
    <div data-nosearch="" className="text-right shrink-0">
      <p className="text-2xl font-bold text-gray-900 tabular-nums">
        {formatCurrency(quote.price, quote.currency)}
      </p>
      <p
        className={cn(
          "text-sm font-semibold tabular-nums mt-0.5",
          positive ? "text-gain-dark" : "text-loss-dark"
        )}
      >
        {positive ? "▲" : "▼"} {formatPercentSansSigne(quote.changePercent)}
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
      {/* <h3> : voir « À qui il convient » plus haut (recherche interne). */}
      <h3 className={cn("text-xs font-semibold uppercase tracking-wider", iconColor)}>
        {title}
      </h3>
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
