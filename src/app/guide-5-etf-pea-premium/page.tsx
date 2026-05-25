import type { Metadata } from "next";
import Link from "next/link";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";

const TITLE = "5 ETF Premium pour PEA : la cheat sheet 2026";
const DESCRIPTION =
  "Cheat sheet 2026 : 5 ETF éligibles PEA souvent retenus par les investisseurs long terme — critères de sélection, TER, indice répliqué, points d'attention.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guide-5-etf-pea-premium" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/guide-5-etf-pea-premium",
    type: "article",
    images: [{ url: "https://dcatracker.fr/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

interface ETFRow {
  rank: number;
  symbol: string;
  isin: string;
  name: string;
  index: string;
  ter: string;
  replication: string;
  why: string;
  watchOut: string;
  role: string;
}

const ETFS: ETFRow[] = [
  {
    rank: 1,
    symbol: "CW8",
    isin: "LU1681043599",
    name: "Amundi MSCI World UCITS ETF",
    index: "MSCI World — ~1 500 grandes capitalisations des pays développés (US, Europe, Japon…)",
    ter: "0,38 %",
    replication: "Synthétique (swap)",
    why: "Le standard pour démarrer un PEA. Une seule ligne suffit pour répliquer la quasi-totalité du marché développé. AUM massif, liquidité élevée, le couteau suisse de l'investisseur long terme.",
    watchOut: "Pas d'exposition aux marchés émergents (~10 % du PIB mondial). À compléter avec AEEM si vous voulez la couverture totale.",
    role: "Cœur de portefeuille",
  },
  {
    rank: 2,
    symbol: "500",
    isin: "LU1681048804",
    name: "Amundi S&P 500 UCITS ETF",
    index: "S&P 500 — les 500 plus grandes capitalisations américaines",
    ter: "0,15 %",
    replication: "Synthétique (swap)",
    why: "Le seul moyen logiquement viable d'avoir le S&P 500 dans un PEA, avec un TER agressif (0,15 %). Concentré sur le marché actions le plus performant historiquement.",
    watchOut: "Concentration géographique 100 % US. Recouvrement partiel avec CW8 (~70 % de MSCI World est en valeurs US). Évitez de cumuler les deux à 50/50.",
    role: "Surpondération US",
  },
  {
    rank: 3,
    symbol: "PCEU",
    isin: "LU1681049328",
    name: "Amundi STOXX Europe 600 UCITS ETF",
    index: "STOXX Europe 600 — 600 grandes capitalisations européennes (ASML, LVMH, Nestlé, Novo Nordisk…)",
    ter: "0,07 %",
    replication: "Synthétique (swap)",
    why: "Le TER le plus bas de notre sélection PEA (0,07 %). Permet de surpondérer l'Europe sans exposition au taux de change USD/EUR — utile si vous trouvez le marché US trop cher.",
    watchOut: "Performance historique inférieure au S&P 500. À utiliser comme satellite, pas comme cœur de portefeuille.",
    role: "Diversification Europe",
  },
  {
    rank: 4,
    symbol: "ANX",
    isin: "LU1681038243",
    name: "Amundi Nasdaq-100 UCITS ETF",
    index: "Nasdaq 100 — 100 plus grandes valeurs tech américaines (Apple, Microsoft, Nvidia, Amazon…)",
    ter: "0,23 %",
    replication: "Synthétique (swap)",
    why: "Seule option PEA pour s'exposer au Nasdaq-100. Capture la croissance tech US — moteur principal de la performance de la décennie 2010-2020.",
    watchOut: "Volatilité élevée et concentration sectorielle (>50 % tech). Sensible aux taux d'intérêt. Ne dépassez pas 20-30 % du portefeuille.",
    role: "Boost croissance",
  },
  {
    rank: 5,
    symbol: "AEEM",
    isin: "LU1681045370",
    name: "Amundi MSCI Emerging Markets UCITS ETF",
    index: "MSCI Emerging Markets — Chine, Inde, Taïwan, Corée du Sud, Brésil…",
    ter: "0,20 %",
    replication: "Synthétique (swap)",
    why: "Diversification géographique vers les marchés émergents, accessible en PEA grâce au swap. Complète CW8 pour une couverture proche de l'indice MSCI ACWI.",
    watchOut: "Volatilité plus élevée que les développés. Forte concentration Asie (~75 %). Performance décevante depuis 2010 — pari long terme.",
    role: "Satellite émergents",
  },
];

const SELECTION_CRITERIA = [
  {
    title: "Éligible PEA",
    detail: "Coté en Europe et conforme au quota d'investissement européen (souvent obtenu via réplication synthétique pour les indices US/monde).",
  },
  {
    title: "TER bas",
    detail: "Frais courants annuels inférieurs à 0,40 %. Sur 30 ans, 0,2 % de frais en moins, c'est ~6 % de capital final en plus.",
  },
  {
    title: "AUM élevé",
    detail: "Encours sous gestion supérieurs à 500 M€. Réduit le risque de fermeture du fonds et garantit une bonne liquidité.",
  },
  {
    title: "Capitalisant",
    detail: "Les dividendes sont automatiquement réinvestis dans le fonds — fiscalement plus simple en PEA et évite les frottements.",
  },
];

const ALLOCATION_EXAMPLES = [
  {
    profile: "Simple — 1 ETF",
    description: "Pour ceux qui ne veulent pas se prendre la tête.",
    rows: [{ etf: "CW8 (MSCI World)", weight: "100 %" }],
  },
  {
    profile: "Équilibré — 2 ETF",
    description: "Couvre développés + émergents en gardant la simplicité.",
    rows: [
      { etf: "CW8 (MSCI World)", weight: "85 %" },
      { etf: "AEEM (Émergents)", weight: "15 %" },
    ],
  },
  {
    profile: "Croissance — 3 ETF",
    description: "Cœur monde + boost US tech, profil offensif.",
    rows: [
      { etf: "CW8 (MSCI World)", weight: "60 %" },
      { etf: "ANX (Nasdaq 100)", weight: "25 %" },
      { etf: "AEEM (Émergents)", weight: "15 %" },
    ],
  },
];

export default function GuideCinqETFPEAPremiumPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: "/" },
          { name: "Guide — 5 ETF Premium pour PEA" },
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="mb-6 text-xs text-gray-500">
        <Link href="/" className="hover:text-gray-900">Accueil</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-700">Guide — 5 ETF Premium pour PEA</span>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <span className="inline-block text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full mb-4">
          Cheat sheet 2026 — édition gratuite
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
          5 ETF Premium pour PEA en 2026
        </h1>
        <p className="mt-5 text-lg text-gray-600 leading-relaxed">
          Une sélection courte de 5 ETF éligibles PEA fréquemment retenus
          par les investisseurs long terme — avec leurs critères, TER, indice
          répliqué et limites concrètes. Pour une vue d&apos;ensemble plus
          large des face-à-face possibles, voyez d&apos;abord nos{" "}
          <Link href="/comparatif-etf" className="text-primary-700 font-medium hover:underline">
            comparatifs ETF
          </Link>
          {" "}thématiques.
        </p>
        <p className="mt-3 text-sm text-gray-500">
          Outil pédagogique — pas de conseil en investissement.
        </p>
      </header>

      <ArticleByline
        publishedAt="2026-04-29"
        updatedAt="2026-05-25"
        readingMinutes={6}
        url="/guide-5-etf-pea-premium"
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* Selection criteria */}
      <section aria-labelledby="criteres" className="mb-12 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 id="criteres" className="text-xl font-bold text-gray-900 mb-1">
          Comment ces 5 ETF ont été sélectionnés
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Quatre filtres simples et objectifs.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          Le critère du TER est le plus mécanique : sur le très long terme,
          chaque dixième de point de frais en moins est un dixième de point qui
          continue de produire des{" "}
          <Link href="/interets-composes" className="text-primary-700 font-medium hover:underline">
            intérêts composés
          </Link>
          {" "}à votre profit — d&apos;où l&apos;impact démesuré des frais à 20
          ou 30 ans.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {SELECTION_CRITERIA.map((c) => (
            <div key={c.title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {c.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The 5 ETFs */}
      <section aria-labelledby="etfs" className="mb-12 space-y-5">
        <h2 id="etfs" className="text-2xl font-bold text-gray-900">
          La sélection des 5 ETF
        </h2>

        {ETFS.map((etf) => (
          <article
            key={etf.symbol}
            className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-7"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold">
                    {etf.rank}
                  </span>
                  <span className="font-mono text-sm font-bold text-gray-900">
                    {etf.symbol}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {etf.isin}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 leading-snug">
                  {etf.name}
                </h3>
              </div>
              <span className="shrink-0 text-xs font-medium text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                {etf.role}
              </span>
            </div>

            {/* Specs */}
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 mb-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">TER</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{etf.ter}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Réplication</dt>
                <dd className="text-gray-900 mt-0.5">{etf.replication}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution</dt>
                <dd className="text-gray-900 mt-0.5">Capitalisant</dd>
              </div>
            </dl>

            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              <span className="font-medium text-gray-900">Indice :</span> {etf.index}
            </p>

            <div className="rounded-xl bg-gray-50 p-4 mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Pourquoi il est dans la sélection
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{etf.why}</p>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-xs font-semibold text-amber-900 mb-1">
                Point d&apos;attention
              </p>
              <p className="text-sm text-amber-900 leading-relaxed">{etf.watchOut}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Allocation examples */}
      <section aria-labelledby="allocations" className="mb-12">
        <h2 id="allocations" className="text-2xl font-bold text-gray-900 mb-2">
          3 façons concrètes de combiner ces ETF
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Du plus simple au plus diversifié — choisissez selon votre profil.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Si vous hésitez encore entre les deux MSCI World les plus utilisés en
          PEA aujourd&apos;hui, notre comparatif{" "}
          <Link href="/comparatif-etf/cw8-vs-wpea" className="text-primary-700 font-medium hover:underline">
            CW8 vs WPEA
          </Link>
          {" "}chiffre l&apos;impact du TER sur 20 ans et donne un verdict
          opérationnel selon votre situation.
        </p>

        <div className="space-y-4">
          {ALLOCATION_EXAMPLES.map((ex) => (
            <div
              key={ex.profile}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {ex.profile}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{ex.description}</p>
              <div className="space-y-2">
                {ex.rows.map((row) => (
                  <div
                    key={row.etf}
                    className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-gray-50"
                  >
                    <span className="text-gray-900 font-medium">{row.etf}</span>
                    <span className="font-mono font-bold text-primary-700">{row.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-primary-200 bg-primary-50/50 p-5">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold text-gray-900">Construire votre allocation sur mesure :</span>{" "}
            l&apos;outil <Link href="/allocation-portefeuille" className="text-primary-700 font-medium hover:underline">allocation portefeuille</Link>{" "}
            permet de pondérer librement plusieurs ETF et de simuler le résultat sur 10, 20 ou 30 ans.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-2">À lire avant d&apos;agir</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Cette sélection est <strong>pédagogique</strong>, pas un conseil
          en investissement personnalisé. Les ETF présentés sont fréquemment
          cités, mais le choix dépend toujours de votre situation, horizon et
          tolérance au risque. Les performances passées ne préjugent pas des
          performances futures. Investir comporte un risque de perte en
          capital — consultez un conseiller financier agréé avant toute
          décision.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Avant d&apos;allouer le moindre euro, assurez-vous aussi d&apos;avoir
          tranché la question{" "}
          <Link href="/pea-ou-cto" className="text-primary-700 font-medium hover:underline">
            PEA ou CTO
          </Link>
          {" "}— ces 5 ETF étant tous éligibles PEA, le cadre fiscal du PEA
          conditionne directement leur intérêt à long terme.
        </p>
      </section>

      {/* Sources */}
      <SourcesReferences
        sources={[
          {
            label: "Catalogue ETF Amundi — éligibles PEA",
            url: "https://www.amundietf.fr/fr/particuliers",
            publisher: "Amundi ETF",
            note: "Factsheets officielles : CW8 (MSCI World), PE500 (S&P 500), AEEM (MSCI Emerging Markets).",
          },
          {
            label: "BNP Paribas Easy — ETF éligibles PEA",
            url: "https://www.bnpparibas-am.fr/particulier/",
            publisher: "BNP Paribas Asset Management",
          },
          {
            label: "Plan d'Épargne en Actions — règles d'éligibilité",
            url: "https://www.service-public.fr/particuliers/vosdroits/F2385",
            publisher: "service-public.fr",
            note: "Conditions pour qu'un ETF soit éligible au PEA (75 % d'actions UE ou réplication synthétique conforme).",
          },
          {
            label: "Comprendre les ETF synthétiques (swap)",
            url: "https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/produits-collectifs/fonds-indiciels-cotes-etf",
            publisher: "Autorité des marchés financiers (AMF)",
            note: "Le mécanisme de swap qui permet aux ETF World/EM d'être PEA-compatibles.",
          },
        ]}
      />

      {/* CTA */}
      <section className="mt-12 rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Testez ces ETF dans le simulateur
        </h2>
        <p className="text-primary-100 mb-6">
          Visualisez l&apos;impact sur 10, 20 ou 30 ans, avec versements
          mensuels et intérêts composés.
        </p>
        <Link
          href="/allocation-portefeuille"
          className="inline-block bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Construire mon allocation →
        </Link>
      </section>
    </div>
  );
}
