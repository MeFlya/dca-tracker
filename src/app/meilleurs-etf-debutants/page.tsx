import type { Metadata } from "next";
import Link from "next/link";
import { ETF_LIST } from "@/lib/etf-config";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE = "Meilleurs ETF pour débutants en 2026 : notre sélection commentée";
const DESCRIPTION =
  "Quel ETF choisir pour commencer à investir en bourse ? Notre sélection des meilleurs ETF pour débutants en France : MSCI World, S&P 500, FTSE All-World — avec TER, éligibilité PEA et recommandations claires.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/meilleurs-etf-debutants" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/meilleurs-etf-debutants",
    type: "article",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Meilleurs ETF débutants — DCA Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// ─── ETF selection for beginners ──────────────────────────────────────────────

const TOP_PICKS = [
  {
    symbol: "CW8",
    name: "Amundi MSCI World UCITS ETF",
    ter: 0.38,
    pea: true,
    replication: "Synthétique",
    index: "MSCI World (~1 500 entreprises, 23 pays développés)",
    verdict: "Le choix n°1 pour un débutant en France",
    verdictClass: "bg-primary-50 border-primary-100 text-primary-800",
    tagClass: "bg-primary-600 text-white",
    tag: "Recommandé #1",
    why: [
      "Éligible PEA — fiscalité la plus avantageuse disponible en France",
      "Liquidité maximale sur Euronext Paris — largement disponible chez tous les courtiers français",
      "1 500 entreprises dans 23 pays = diversification mondiale immédiate en un seul ETF",
      "Politique capitalisante — dividendes réinvestis automatiquement, intérêts composés optimaux",
    ],
    watchOut: "La réplication synthétique (swap) introduit un risque de contrepartie faible mais réel. Encadré à 10 % par la réglementation UCITS.",
  },
  {
    symbol: "EWLD",
    name: "iShares MSCI World UCITS ETF",
    ter: 0.20,
    pea: true,
    replication: "Physique optimisé",
    index: "MSCI World (~1 500 entreprises, 23 pays développés)",
    verdict: "La meilleure alternative physique au CW8",
    verdictClass: "bg-blue-50 border-blue-100 text-blue-800",
    tagClass: "bg-blue-600 text-white",
    tag: "Alternative physique",
    why: [
      "TER inférieur au CW8 (0,20 % vs 0,38 %) — moins cher sur le long terme",
      "Réplication physique — le fonds détient réellement les actions, sans risque de contrepartie",
      "Également éligible PEA malgré la réplication physique (structure UCITS irlandaise)",
      "BlackRock (iShares) : le plus grand gestionnaire d'actifs au monde",
    ],
    watchOut: "Liquidité légèrement inférieure au CW8 sur Euronext Paris. Le spread peut être plus large sur de petits volumes.",
  },
  {
    symbol: "VWCE",
    name: "Vanguard FTSE All-World UCITS ETF",
    ter: 0.22,
    pea: false,
    replication: "Physique optimisé",
    index: "FTSE All-World (~3 700 entreprises, 49 pays)",
    verdict: "La diversification maximale pour compte-titres ou assurance-vie",
    verdictClass: "bg-slate-50 border-slate-200 text-slate-800",
    tagClass: "bg-slate-600 text-white",
    tag: "Diversification maximale",
    why: [
      "Pays développés ET émergents — ~3 700 entreprises dans 49 pays en un seul ETF",
      "Inclut Chine, Inde, Brésil, Taiwan, Corée du Sud — marchés exclus du MSCI World",
      "Vanguard : pionnier de l'investissement passif, structure coopérative, frais structurellement bas",
      "Réplication physique complète — transparence totale sur les positions détenues",
    ],
    watchOut: "Non éligible PEA. À loger en CTO ou assurance-vie. La pondération émergents (~12 %) augmente la volatilité.",
  },
  {
    symbol: "SP5",
    name: "Amundi S&P 500 UCITS ETF",
    ter: 0.15,
    pea: true,
    replication: "Synthétique",
    index: "S&P 500 (500 plus grandes entreprises américaines)",
    verdict: "Le S&P 500 en PEA — pour parier sur les États-Unis",
    verdictClass: "bg-amber-50 border-amber-100 text-amber-800",
    tagClass: "bg-amber-500 text-white",
    tag: "S&P 500 PEA",
    why: [
      "TER le plus bas de notre sélection (0,15 %) — excellent rapport qualité/coût",
      "Le S&P 500 est l'indice de référence mondial — 80 % de la capitalisation boursière américaine",
      "Éligible PEA via réplication synthétique — unique avantage d'Amundi",
      "Capitalisant — composé automatiquement sans friction fiscale dans le PEA",
    ],
    watchOut: "Concentration géographique 100 % américaine. Forte surpondération technologique (~35 % de l'indice). Moins diversifié qu'un ETF monde.",
  },
];

const CRITERIA = [
  {
    title: "Frais (TER)",
    icon: "💶",
    body: "Le TER (Total Expense Ratio) est déduit automatiquement de la performance du fonds chaque année. Un TER de 0,07 % vs 1,5 % (fonds actif) représente sur 30 ans une différence considérable sur votre capital final. Visez moins de 0,5 % pour un ETF passif.",
  },
  {
    title: "Diversification",
    icon: "🌍",
    body: "Un ETF MSCI World couvre 1 500 entreprises dans 23 pays. Un ETF S&P 500 : 500 entreprises dans un seul pays. Plus la couverture est large, moins votre portefeuille dépend d'une entreprise ou d'un marché spécifique.",
  },
  {
    title: "Éligibilité PEA",
    icon: "🏛️",
    body: "Pour les résidents français, le PEA est l'enveloppe fiscale la plus avantageuse. Après 5 ans, vos plus-values sont exonérées d'impôt sur le revenu (seuls les 17,2 % de prélèvements sociaux s'appliquent vs 30 % en flat tax sur CTO).",
  },
  {
    title: "Politique de distribution",
    icon: "🔄",
    body: "Un ETF capitalisant réinvestit automatiquement les dividendes. C'est optimal pour le DCA long terme : les dividendes s'ajoutent à votre capital et composent sans intervention ni friction fiscale annuelle.",
  },
  {
    title: "Liquidité",
    icon: "📊",
    body: "La liquidité détermine à quel prix vous pouvez acheter ou vendre. Un ETF très liquide (comme le CW8 sur Euronext Paris) a un faible écart acheteur/vendeur (spread). Sur des montants modestes, préférez les ETF à fort volume quotidien.",
  },
];

const FAQ = [
  {
    q: "Quel est le meilleur ETF pour commencer en bourse avec un petit budget ?",
    a: "Le CW8 (Amundi MSCI World) est le point de départ recommandé pour la grande majorité des débutants en France. Il est éligible PEA, disponible chez tous les courtiers français, capitalisant, et offre une diversification immédiate sur 1 500 entreprises mondiales. Disponible à partir d'environ 400 € la part sur Euronext Paris — ou en fraction chez Trade Republic.",
  },
  {
    q: "Faut-il choisir CW8 ou EWLD ?",
    a: "Les deux couvrent l'indice MSCI World et sont éligibles PEA. EWLD a un TER légèrement inférieur (0,20 % vs 0,38 %) et une réplication physique. CW8 est plus liquide et plus répandu. Sur le long terme, la différence de performance devrait être marginale. Si votre courtier propose les deux à frais de transaction identiques, EWLD a un léger avantage théorique côté frais.",
  },
  {
    q: "Un seul ETF suffit-il pour un portefeuille débutant ?",
    a: "Oui, et c'est souvent la meilleure approche. Un ETF MSCI World comme CW8 ou VWCE offre une diversification mondiale suffisante pour un investisseur particulier. Ajouter des ETF crée de la complexité et du risque de chevauchement (overlap) sans améliorer nécessairement la diversification. Commencez simple, puis complexifiez si vous avez des raisons précises de le faire.",
  },
  {
    q: "Peut-on investir en ETF avec 50 € par mois ?",
    a: "Oui. Trade Republic permet les investissements programmés à partir de 1 € et propose des fractions d'ETF. Boursorama, Fortuneo et la plupart des courtiers français acceptent des ordres à partir de 50 à 100 €. Le montant mensuel importe moins que la régularité sur le long terme.",
  },
  {
    q: "Quelle est la différence entre ETF et fonds actifs ?",
    a: "Un ETF passif suit mécaniquement un indice (MSCI World, S&P 500) sans chercher à le battre. Un fonds actif essaie de sélectionner des titres pour surperformer l'indice. En pratique, plus de 80 % des fonds actifs sous-performent leur indice de référence sur 10 ans, et leurs frais sont 5 à 10 fois plus élevés qu'un ETF passif.",
  },
  {
    q: "Comment acheter mon premier ETF ?",
    a: "1) Ouvrez un PEA chez un courtier en ligne (Boursorama, Trade Republic, Fortuneo). 2) Effectuez un virement. 3) Recherchez l'ETF par son symbole (ex. CW8) ou son ISIN (LU1681043599). 4) Passez un ordre au marché ou à cours limité. Le premier ordre prend généralement moins de 5 minutes.",
  },
];

export default function MeilleursETFDebutantsPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

  // Get ETFs from config to show full list at bottom
  const allETFs = ETF_LIST.filter((e) => ["CW8", "EWLD", "VWCE", "SP5", "ANX", "PAEEM", "PCEU"].includes(e.displaySymbol));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": TITLE,
        "description": DESCRIPTION,
        "url": `${siteUrl}/meilleurs-etf-debutants`,
        "author": { "@type": "Organization", "name": "DCA Tracker" },
        "publisher": { "@type": "Organization", "name": "DCA Tracker", "url": siteUrl },
        "inLanguage": "fr",
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      }} />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Meilleurs ETF débutants</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Meilleurs ETF pour débutants : notre sélection pour 2026
      </h1>
      <p className="text-lg text-gray-500 mb-12 leading-relaxed">
        Vous voulez investir en bourse mais vous ne savez pas quel ETF
        choisir ? Pas de jargon superflu : voici les ETF que nous
        recommandons aux débutants en France, avec les critères de
        sélection et les points d&apos;attention pour chacun.
      </p>

      {/* ── Section 1: Disclaimer ──────────────────────────────────────────── */}
      <div className="disclaimer-banner mb-10">
        <strong>Avertissement :</strong> cette sélection est informative et ne
        constitue pas un conseil en investissement personnalisé. Tout
        investissement en bourse comporte un risque de perte en capital.
        Consultez un conseiller financier agréé avant toute décision.
      </div>

      {/* ── Section 2: Critères de sélection ─────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Les 5 critères d&apos;un bon ETF pour débutant
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Avant de présenter notre sélection, voici les critères qui
          guident nos recommandations — et que vous devriez utiliser pour
          évaluer n&apos;importe quel ETF par vous-même.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CRITERIA.map((c) => (
            <div key={c.title} className="p-4 rounded-xl border border-gray-100 bg-white">
              <p className="font-semibold text-gray-900 text-sm mb-2">
                {c.icon} {c.title}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Notre sélection ────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Notre sélection : 4 ETF pour débutants
        </h2>
        <div className="space-y-6">
          {TOP_PICKS.map((etf) => (
            <div key={etf.symbol} className={`rounded-2xl border p-6 ${etf.verdictClass}`}>

              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <Link
                  href={`/etf/${etf.symbol}`}
                  className="shrink-0 w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:border-primary-200 transition-colors shadow-sm"
                >
                  <span className="text-sm font-bold text-gray-800">{etf.symbol}</span>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${etf.tagClass}`}>
                      {etf.tag}
                    </span>
                    {etf.pea && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        ✓ PEA éligible
                      </span>
                    )}
                    {!etf.pea && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        CTO / Assurance-vie
                      </span>
                    )}
                  </div>
                  <Link href={`/etf/${etf.symbol}`} className="text-base font-bold text-gray-900 hover:text-primary-700 transition-colors leading-tight block">
                    {etf.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{etf.index}</p>
                </div>
              </div>

              {/* Key stats */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="bg-white/70 rounded-lg px-3 py-1.5 text-center">
                  <p className="text-xs text-gray-400">TER</p>
                  <p className="text-sm font-bold text-gray-900">{etf.ter} %</p>
                </div>
                <div className="bg-white/70 rounded-lg px-3 py-1.5 text-center">
                  <p className="text-xs text-gray-400">Réplication</p>
                  <p className="text-sm font-bold text-gray-900">{etf.replication}</p>
                </div>
                <div className="bg-white/70 rounded-lg px-3 py-1.5 text-center">
                  <p className="text-xs text-gray-400">Distribution</p>
                  <p className="text-sm font-bold text-gray-900">Capitalisant</p>
                </div>
              </div>

              {/* Verdict */}
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Pourquoi on le recommande
              </p>
              <ul className="space-y-1 mb-4">
                {etf.why.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 shrink-0 mt-0.5">✓</span>
                    {w}
                  </li>
                ))}
              </ul>

              {/* Watch out */}
              <div className="rounded-xl bg-white/50 border border-white/80 p-3 mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-1">⚠ Point d&apos;attention</p>
                <p className="text-xs text-gray-600 leading-relaxed">{etf.watchOut}</p>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/etf/${etf.symbol}`}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 underline transition-colors"
                >
                  Fiche détaillée {etf.symbol} →
                </Link>
                <Link
                  href={`/simulateur?fees=${etf.ter}`}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  Simuler avec cet ETF →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Tableau récapitulatif ──────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Tableau comparatif de notre sélection
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">ETF</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-500 border-b border-gray-100">TER</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-500 border-b border-gray-100">PEA</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-500 border-b border-gray-100">Couverture</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-500 border-b border-gray-100">Idéal pour</th>
              </tr>
            </thead>
            <tbody>
              {[
                { symbol: "CW8",  ter: "0,38 %", pea: true,  cover: "1 500 titres / 23 pays développés", ideal: "Premier ETF en PEA" },
                { symbol: "EWLD", ter: "0,20 %", pea: true,  cover: "1 500 titres / 23 pays développés", ideal: "Alternative physique PEA" },
                { symbol: "VWCE", ter: "0,22 %", pea: false, cover: "3 700 titres / 49 pays", ideal: "Diversification maximale CTO" },
                { symbol: "SP5",  ter: "0,15 %", pea: true,  cover: "500 grandes caps américaines", ideal: "S&P 500 en PEA" },
              ].map((row, i) => (
                <tr key={row.symbol} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 font-bold text-gray-900 border-b border-gray-50">
                    <Link href={`/etf/${row.symbol}`} className="hover:text-primary-600 transition-colors">
                      {row.symbol}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-center text-gray-700 border-b border-gray-50">{row.ter}</td>
                  <td className="px-3 py-3 text-center border-b border-gray-50">
                    {row.pea
                      ? <span className="text-gain-default font-semibold">✓ Oui</span>
                      : <span className="text-gray-400">Non</span>
                    }
                  </td>
                  <td className="px-3 py-3 text-center text-gray-600 border-b border-gray-50 text-xs">{row.cover}</td>
                  <td className="px-3 py-3 text-center text-gray-600 border-b border-gray-50 text-xs">{row.ideal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 5: Comment commencer ──────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comment commencer en 3 étapes
        </h2>
        <div className="space-y-4">
          {[
            {
              n: "1",
              title: "Choisir votre enveloppe : PEA ou CTO",
              body: "Si vous résidez en France et visez un horizon 5+ ans, ouvrez un PEA en premier. La fiscalité après 5 ans (17,2 % vs 30 %) justifie presque toujours ce choix pour les ETF monde.",
              link: { href: "/pea-ou-cto", label: "Comprendre la différence PEA / CTO →" },
            },
            {
              n: "2",
              title: "Choisir votre ETF de départ",
              body: "Un seul ETF suffit pour commencer. Pour un PEA, le CW8 est le choix par défaut. Pour un CTO, le VWCE offre la couverture la plus large. Inutile de diversifier davantage au départ.",
              link: { href: "/comparer-etf", label: "Comparer tous les ETF disponibles →" },
            },
            {
              n: "3",
              title: "Définir et automatiser votre versement mensuel",
              body: "Décidez d'un montant que vous pouvez maintenir durablement. Programmez un virement automatique le jour de votre salaire. L'automatisation supprime le biais comportemental — et vous évite de procrastiner.",
              link: { href: "/simulateur", label: "Simuler ma stratégie DCA →" },
            },
          ].map((step) => (
            <div key={step.n} className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-white">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-700">{step.n}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-2">{step.body}</p>
                <Link href={step.link.href} className="text-xs font-semibold text-primary-600 hover:text-primary-700 underline transition-colors">
                  {step.link.label}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Simulator CTA ─────────────────────────────────────────────────── */}
      <section className="mb-14 rounded-2xl bg-primary-600 p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Projetez votre investissement avec notre simulateur
        </h2>
        <p className="text-primary-200 text-sm mb-6 leading-relaxed">
          Choisissez un ETF, fixez un montant mensuel et visualisez
          votre projection sur 10, 20 ou 30 ans — avec trois scénarios
          de marché et les frais réels de chaque ETF.
        </p>
        <Link href="/simulateur" className="btn-secondary text-sm px-5 py-2.5 inline-flex">
          Lancer le simulateur →
        </Link>
        <p className="text-primary-300 text-xs mt-3">Sans inscription · Résultats en 30 secondes</p>
      </section>

      {/* ── All ETFs list ─────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Tous les ETF disponibles sur DCA Tracker
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Notre base couvre les ETF les plus utilisés par les investisseurs
          particuliers en France. Chaque fiche inclut la description détaillée,
          les forces et points d&apos;attention.
        </p>
        <div className="space-y-2">
          {allETFs.map((etf) => (
            <Link
              key={etf.displaySymbol}
              href={`/etf/${etf.displaySymbol}`}
              className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-primary-100 hover:bg-primary-50/20 transition-all"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:border-primary-100 transition-colors">
                <span className="text-xs font-bold text-gray-700">{etf.displaySymbol}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors truncate">
                  {etf.name}
                </p>
                <p className="text-xs text-gray-400">{etf.category} · TER {etf.ter} %</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {etf.peaEligible && (
                  <span className="text-xs text-gain-default font-semibold">PEA</span>
                )}
                <span className="text-gray-300 group-hover:text-primary-400 transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/comparer-etf" className="text-sm font-semibold text-primary-600 hover:text-primary-700 underline transition-colors">
            Comparer tous les ETF en détail →
          </Link>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Questions fréquentes
        </h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl border border-gray-100 bg-white overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none">
                {q}
                <span className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                {a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Internal links ────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Pour aller plus loin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: "/strategie-dca",     title: "La stratégie DCA expliquée",       desc: "Comment investir régulièrement et lisser le risque de marché." },
            { href: "/interets-composes", title: "Les intérêts composés",             desc: "Visualiser la puissance du temps et des rendements réinvestis." },
            { href: "/pea-ou-cto",        title: "PEA ou CTO pour vos ETF ?",        desc: "L'impact fiscal concret et la recommandation selon votre profil." },
            { href: "/investir-en-etf",   title: "Comment investir en ETF",           desc: "Le guide pas à pas pour passer votre premier ordre en bourse." },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group p-4 rounded-xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all"
            >
              <p className="font-semibold text-sm text-gray-900 group-hover:text-primary-700 mb-1 transition-colors">
                {link.title} →
              </p>
              <p className="text-xs text-gray-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <EmailCapture source="guide_meilleurs_etf_debutants" />
    </div>
  );
}
