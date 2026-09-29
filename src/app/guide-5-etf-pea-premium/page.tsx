import type { Metadata } from "next";
import Link from "next/link";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import { ecartCapital, HYPOTHESES_COMPARATIFS } from "@/lib/ecart-frais";

const TITLE = "5 ETF Premium pour PEA : la cheat sheet 2026";
// Description réécrite le 28/09/2026 : « souvent retenus par les investisseurs
// long terme » était une affirmation de popularité que rien ne mesurait.
const DESCRIPTION =
  "Cheat sheet 2026 : 5 ETF éligibles PEA vérifiés (WPEA, SPEA, PCEU, PUST, PAEEM) — ISIN, TER, indice répliqué, points d'attention.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guide-5-etf-pea-premium" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/guide-5-etf-pea-premium",
    type: "article",
    images: [{ url: "https://dcatracker.fr/og-image.jpg", width: 1200, height: 630 }],
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
  why: string;
  watchOut: string;
  role: string;
}

// ─── LA SÉLECTION, REFAITE LE 28/09/2026 ─────────────────────────────────────
//
// Ce qui était faux, d'après la table de vérité ETF du 28/09/2026 (documents
// des émetteurs recoupés avec justETF, Boursorama et Euronext) :
//   · 500 (LU1681048804), ANX (LU1681038243) et AEEM (LU1681045370) étaient
//     présentés comme éligibles PEA. Aucun ne l'est — le reporting Amundi du
//     31/08/2026 indique « Compte-titres, Assurance-vie ». Trois lignes sur
//     cinq d'une page intitulée « ETF pour PEA ».
//   · PCEU était décrit comme « Amundi STOXX Europe 600 », LU1681049328,
//     0,07 %. C'est l'Amundi PEA MSCI Europe, FR0013412038, 0,15 %.
//   · CW8 occupait la brique monde alors que WPEA et DCAM répliquent le même
//     indice à 0,20 % contre 0,38 % — contraire au critère « TER bas » que la
//     page annonce elle-même.
//   · « Seule option PEA pour le Nasdaq-100 » : faux deux fois (ANX n'est pas
//     PEA, et PUST n'est pas la seule ligne Nasdaq-100 éligible).
//   · « 20-31,4 % » : coquille d'un remplacement global 30 % → 31,4 %.
//
// Les chiffres de composition d'indice (« ~70 % US », « >50 % tech »,
// « ~75 % Asie »…) ont été retirés : la table ne permet pas de les vérifier.
//
// ⚠️ L'email envoyé à chaque inscrit (src/lib/email-provider.ts, ETFS) reprend
// cette sélection : symbole, ISIN, TER et rôle doivent y être IDENTIQUES, et
// l'indice le même (en version courte). Toute modification ici se reporte
// là-bas.
const ETFS: ETFRow[] = [
  {
    rank: 1,
    symbol: "WPEA",
    isin: "IE0002XZSHO1",
    name: "iShares MSCI World Swap PEA UCITS ETF EUR (Acc)",
    index: "MSCI World — grandes et moyennes capitalisations des pays développés",
    ter: "0,20 %",
    // 29/09/2026 : encours chiffrés (2,1 et 1,4 Md€) retirés — la table et
    // justETF donnent des montants différents (part ou fonds ?, fait
    // encours-a-trancher). Les deux sources s'accordent sur le classement.
    why: "Le MSCI World éligible PEA le moins cher de notre sélection : 0,20 %, à égalité avec DCAM. Entre les deux, WPEA a le plus gros encours au 31 août 2026 (nos sources concordent sur ce classement, pas encore sur les montants) — c'est ce critère qui le place ici. Face à CW8 (0,38 %), même indice pour presque deux fois moins de frais.",
    watchOut: "Aucun pays émergent : le MSCI World ne couvre que les pays développés, d'où PAEEM en n° 5. Fonds récent, lancé le 26/03/2024. DCAM (Amundi PEA Monde, FR001400U5Q4) est l'équivalent direct, au même TER de 0,20 %.",
    role: "Cœur de portefeuille",
  },
  {
    rank: 2,
    symbol: "SPEA",
    isin: "IE000DQLYVB9",
    name: "iShares S&P 500 Swap PEA UCITS ETF EUR (Acc)",
    index: "S&P 500 — 500 grandes entreprises américaines",
    ter: "0,10 %",
    why: "Le S&P 500 éligible PEA le moins cher de notre sélection : 0,10 %. PSP5 (Amundi PEA S&P 500, FR0011871128) fait le même travail à 0,12 %. Piège à connaître : l'Amundi S&P 500 Swap (mnémonique 500) n'est PAS éligible au PEA.",
    // 29/09/2026 : « Encours non vérifié » taisait le point faible de SPEA,
    // alors que la page pose le critère « un gros encours réduit le risque de
    // fermeture ». justETF (1 source) le donne très loin derrière PSP5 au
    // 31/08/2026 (faits etf-pea-spea, encours-a-trancher) : signalé sans
    // chiffre, faute de recoupement.
    watchOut: "Petit fonds : d'après justETF, l'encours de SPEA est très inférieur à celui de PSP5 au 31 août 2026, et SPEA est récent (lancé le 29/05/2025). Un fonds de petite taille est plus exposé au risque de fermeture : PSP5 (0,12 %), bien plus gros, est l'alternative si ce point vous importe. Les actions américaines sont déjà présentes dans WPEA : ajouter SPEA revient à surpondérer les mêmes sociétés, pas à diversifier.",
    role: "Surpondération US",
  },
  {
    rank: 3,
    symbol: "PCEU",
    isin: "FR0013412038",
    name: "Amundi PEA MSCI Europe UCITS ETF Acc",
    index: "MSCI Europe — grandes et moyennes capitalisations des pays développés européens",
    ter: "0,15 %",
    why: "La brique Europe de la sélection : l'indice MSCI Europe pour 0,15 % de frais. Elle sert à donner à l'Europe plus de poids qu'elle n'en a dans le MSCI World.",
    watchOut: "Encours non vérifié dans notre table. L'Europe est déjà présente dans WPEA : PCEU ne remplace pas le cœur monde, elle en déplace le centre de gravité.",
    role: "Diversification Europe",
  },
  {
    rank: 4,
    symbol: "PUST",
    isin: "FR0011871110",
    name: "Amundi PEA Nasdaq-100 UCITS ETF Acc",
    index: "Nasdaq-100 — les 100 plus grandes sociétés non financières cotées au Nasdaq, très orienté technologie",
    ter: "0,30 %",
    // 29/09/2026 : encours chiffré (1,17 Md€) retiré — écart table / justETF
    // non tranché (fait encours-a-trancher).
    why: "Le Nasdaq-100 dans un PEA pour 0,30 %. L'Amundi Nasdaq-100 Swap (ANX), moins cher, n'est PAS éligible au PEA. PUST n'est pas la seule ligne Nasdaq-100 éligible (il existe par exemple PNAS) : c'est celle dont nous avons vérifié les données.",
    watchOut: "Une ligne concentrée, surtout sur la technologie : au-delà de 20 à 30 % du portefeuille, c'est elle qui dicte les variations de l'ensemble. Une bonne partie de ses sociétés figure déjà dans WPEA et SPEA : l'ajouter concentre, ça ne diversifie pas.",
    role: "Boost croissance",
  },
  {
    rank: 5,
    symbol: "PAEEM",
    isin: "FR0013412020",
    name: "Amundi PEA Emergent (MSCI Emerging) ESG Transition UCITS ETF Acc",
    index: "MSCI Emerging Markets, variante ESG Transition — grandes et moyennes capitalisations des pays émergents",
    ter: "0,30 %",
    why: "Les pays émergents, absents du MSCI World, dans un PEA. L'Amundi MSCI Emerging Markets Swap (AEEM), à 0,20 %, n'est PAS éligible au PEA : PAEEM est l'ETF émergents éligible d'Amundi.",
    watchOut: "Il ne réplique pas l'indice émergents standard mais sa variante ESG Transition : composition et performance s'en écartent, dans un sens ou dans l'autre. Encours non vérifié dans notre table. GPEA (Amundi PEA Global, MSCI ACWI, 0,30 %) réunit développés et émergents en une ligne, mais le fonds n'existe que depuis le 06/07/2026.",
    role: "Satellite émergents",
  },
];

const SELECTION_CRITERIA = [
  {
    title: "Éligible PEA",
    // Réécrit le 28/09/2026 : « coté en Europe » n'a jamais été le critère, et
    // la réplication synthétique ne suffit pas — 500, ANX et AEEM sont des
    // swaps et ne sont pas éligibles.
    detail: "Vérifié sur la documentation de l'émetteur, puis recoupé sur justETF, Boursorama et Euronext. Le nom ne suffit pas : chez Amundi, les versions « Swap » du S&P 500, du Nasdaq-100 et des émergents ne sont pas éligibles, leurs versions « PEA » le sont.",
  },
  {
    title: "TER bas",
    detail: `Frais courants annuels inférieurs à 0,40 %, et le moins cher quand deux ETF répliquent le même indice. Entre 0,38 % (CW8) et 0,20 % (WPEA), l'écart atteint environ ${ecartCapital(0.38, 0.2)} € sur ${HYPOTHESES_COMPARATIFS.durationYears} ans à ${HYPOTHESES_COMPARATIFS.monthlyAmount} €/mois et ${HYPOTHESES_COMPARATIFS.annualReturnPct} %/an.`,
  },
  {
    title: "Encours",
    // Le seuil « supérieurs à 500 M€ » a été retiré le 28/09/2026 : la table de
    // vérité ne donne l'encours que de WPEA, DCAM et PUST. Affirmer que les
    // cinq le dépassent aurait été deviner.
    // 29/09/2026 : même ces trois encours divergent entre la table et justETF
    // (part ou fonds ?) : aucun montant publié tant que ce n'est pas tranché.
    detail: "Un gros encours réduit le risque de fermeture du fonds. Quand deux ETF se valent sur les frais, le plus gros encours l'emporte. Les montants d'encours diffèrent selon les sources (encours de la part ou du fonds entier ?) : tant que l'écart n'est pas tranché, sur cette page, nous n'en publions aucun et signalons seulement les écarts nets, comme la petite taille de SPEA.",
  },
  {
    title: "Capitalisant",
    detail: "Les dividendes sont réinvestis dans le fonds : rien à réinvestir à la main. Les cinq ETF retenus sont des parts capitalisantes (Acc).",
  },
];

const ALLOCATION_EXAMPLES = [
  {
    profile: "Simple — 1 ETF",
    description: "Une seule ligne : le monde développé.",
    rows: [{ etf: "WPEA (MSCI World)", weight: "100 %" }],
  },
  {
    profile: "Équilibré — 2 ETF",
    description: "Ajoute les pays émergents, absents du MSCI World.",
    rows: [
      { etf: "WPEA (MSCI World)", weight: "85 %" },
      { etf: "PAEEM (Émergents)", weight: "15 %" },
    ],
  },
  {
    profile: "Croissance — 3 ETF",
    description: "Cœur monde plus une part de Nasdaq-100 : plus concentré, plus volatil.",
    rows: [
      { etf: "WPEA (MSCI World)", weight: "60 %" },
      { etf: "PUST (Nasdaq-100)", weight: "25 %" },
      { etf: "PAEEM (Émergents)", weight: "15 %" },
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
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
          5 ETF Premium pour PEA en 2026
        </h1>
        <p className="mt-5 text-lg text-gray-600 leading-relaxed">
          Cinq ETF éligibles au PEA, un par brique — monde, États-Unis,
          Europe, technologie, émergents — retenus sur quatre critères :
          éligibilité vérifiée, frais, encours, capitalisation. Avec leur ISIN,
          leur indice et leurs limites concrètes. Pour une vue d&apos;ensemble plus
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
        updatedAt="2026-09-28"
        readingMinutes={6}
        url="/guide-5-etf-pea-premium"
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* Erratum du 28/09/2026 — la page et l'email de la cheat sheet ont
          diffusé trois ETF non éligibles PEA. Un lecteur qui a recopié
          l'ancienne liste doit pouvoir le savoir en arrivant ici. */}
      <aside
        aria-label="Correction du 28 septembre 2026"
        className="mb-12 rounded-2xl border border-amber-200 bg-amber-50 p-5"
      >
        <p className="text-sm font-semibold text-amber-900 mb-1">
          Correction du 28 septembre 2026
        </p>
        <p className="text-sm text-amber-900 leading-relaxed">
          La version précédente de cette fiche, et l&apos;email envoyé aux
          inscrits, présentaient comme éligibles au PEA trois ETF qui ne le
          sont pas : l&apos;Amundi S&amp;P 500 Swap (500), l&apos;Amundi
          Nasdaq-100 Swap (ANX) et l&apos;Amundi MSCI Emerging Markets Swap
          (AEEM). La ligne Europe (PCEU) portait un nom, un indice, un ISIN et
          des frais faux. Les cinq ETF ci-dessous ont été vérifiés un par un
          auprès des émetteurs, puis recoupés sur justETF, Boursorama et
          Euronext. Au moment de passer un ordre, c&apos;est l&apos;ISIN, pas
          le nom, qui identifie le fonds. Les autres ETF d&apos;actions
          contrôlés ce jour-là, éligibles ou non, sont dans notre{" "}
          <Link href="/etf-eligibles-pea" className="font-semibold underline underline-offset-2 hover:text-amber-950">
            liste des ETF éligibles au PEA vérifiés
          </Link>
          .
        </p>
      </aside>

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
                {/* « Réplication » remplacé le 28/09/2026 : la table de vérité
                    ne la documente pas pour PCEU, PUST et PAEEM, et
                    l'afficher pour les uns et pas les autres aurait laissé
                    croire à une donnée manquante par oubli. L'éligibilité,
                    elle, est vérifiée pour les cinq. */}
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">PEA</dt>
                <dd className="text-gray-900 mt-0.5">Éligible</dd>
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
          Du plus simple au plus concentré. Des exemples de combinaison, pas
          des recommandations. Dans chacun, DCAM peut remplacer WPEA : même
          indice, même TER.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Si vous détenez déjà CW8 (0,38 %), notre comparatif{" "}
          <Link href="/comparatif-etf/cw8-vs-wpea" className="text-primary-700 font-medium hover:underline">
            CW8 vs WPEA
          </Link>
          {" "}chiffre ce que coûte l&apos;écart de frais sur 20 ans et dit
          dans quels cas garder la ligne existante.
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
            note: "Documents officiels de PCEU, PUST, PAEEM, ainsi que DCAM et PSP5 cités en alternative. Vérifiés le 28/09/2026.",
          },
          {
            // 29/09/2026 : https://www.ishares.com redirigeait vers l'annuaire
            // mondial de BlackRock, pas vers WPEA ni SPEA. Remplacé par les
            // deux fiches produit, vérifiées (ISIN et TER).
            label: "iShares MSCI World Swap PEA UCITS ETF (WPEA) — fiche produit",
            url: "https://www.blackrock.com/fr/particuliers/products/335178/ishares-msci-world-swap-pea-ucits-etf",
            publisher: "BlackRock — iShares",
            note: "Document officiel de l'émetteur. Consulté le 28/09/2026.",
          },
          {
            label: "iShares S&P 500 Swap PEA UCITS ETF (SPEA) — fiche produit",
            url: "https://www.blackrock.com/fr/particuliers/products/342916/ishares-s-p-500-swap-pea-ucits-etf",
            publisher: "BlackRock — iShares",
            note: "Document officiel de l'émetteur. Consulté le 28/09/2026.",
          },
          {
            label: "justETF — fiches ETF",
            url: "https://www.justetf.com/fr/",
            publisher: "justETF",
            note: "Source de recoupement : ISIN, TER et éligibilité PEA, comparés aux documents des émetteurs, ainsi que la taille relative des fonds (encours au 31/08/2026). Consulté le 28/09/2026.",
          },
          {
            label: "Plan d'Épargne en Actions — règles d'éligibilité",
            url: "https://www.service-public.fr/particuliers/vosdroits/F2385",
            publisher: "service-public.fr",
            // 29/09/2026 : « au moins 75 % d'actions de sociétés européennes »
            // → plus de 75 %, sociétés de l'UE ou de l'EEE (CMF L221-31, fait
            // pea-regle-75). Le texte de loi est ajouté juste en dessous.
            note: "Conditions pour qu'un fonds soit éligible au PEA : plus de 75 % de son actif en actions de sociétés ayant leur siège dans l'Union européenne ou l'Espace économique européen (le Royaume-Uni et la Suisse n'en font pas partie), y compris pour un ETF synthétique.",
          },
          {
            label: "Code monétaire et financier, art. L221-31 — titres éligibles au PEA",
            url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051218125",
            publisher: "Légifrance",
            note: "Le texte de la règle des 75 %. Consulté le 28/09/2026.",
          },
          {
            // 29/09/2026 : la page AMF « fonds-indiciels-cotes-etf » renvoie une
            // 404. Remplacée par l'étude AMF sur les ETF, qui décrit les
            // réplications physique et synthétique (swap).
            label: "Les ETF : caractéristiques, état des lieux et analyse des risques (étude, février 2017)",
            url: "https://www.amf-france.org/sites/institutionnel/files/contenu_simple/lettre_ou_cahier/risques_tendances/Les%20ETF%20%20caracteristiques,%20etat%20des%20lieux%20et%20analyse%20des%20risques%20-%20Le%20cas%20du%20marche%20francais.pdf",
            publisher: "Autorité des marchés financiers (AMF)",
            note: "Le mécanisme de swap, qui permet à un ETF de détenir des actions européennes tout en répliquant un indice monde ou américain. Un swap ne rend pas éligible à lui seul : 500, ANX et AEEM sont des swaps non éligibles. Consulté le 28/09/2026.",
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
          className="btn-white-primary"
        >
          Construire mon allocation →
        </Link>
      </section>
    </div>
  );
}
