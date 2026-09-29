import type { Metadata } from "next";
import Link from "next/link";
import { ETF_LIST, getETFBySymbol } from "@/lib/etf-config";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import { EtapeSuivante } from "@/components/ui/EtapeSuivante";
import { formatTer } from "@/lib/utils";
import { ecartCapital, HYPOTHESES_COMPARATIFS } from "@/lib/ecart-frais";

// CTR (audit 07/2026) : le title mettait en avant IWDA/VWCE (non éligibles
// PEA — hors intent du débutant FR) et contredisait la meta. Title aligné
// sur le verdict de la page.
// La requête réelle est « quel etf choisir pour débuter », pas « meilleur ETF
// pour débuter » : le titre reprend la formulation exacte, la seconde moitié
// garde le verdict tranché.
const TITLE = "Quel ETF choisir pour débuter en 2026 ? Un seul suffit";
const DESCRIPTION =
  // ⚠️ La meta décrit les sections qui EXISTENT (5 critères, 4 ETF, 3 étapes).
  // L'ancienne promettait « les erreurs de débutant à éviter » — la page n'a
  // jamais eu cette section. Une meta qui promet ce que la page ne contient pas
  // fait remonter l'utilisateur dans les résultats, ce qui coûte plus cher que
  // le clic gagné.
  "Un seul ETF MSCI World éligible PEA suffit : WPEA ou DCAM à 0,20 %. Les 5 critères qui comptent, notre sélection de 4 ETF, et comment commencer.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/meilleurs-etf-debutants" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/meilleurs-etf-debutants",
    type: "article",
    images: [{ url: "https://dcatracker.fr/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// ─── ETF selection for beginners ──────────────────────────────────────────────
//
// ─── SÉLECTION REFAITE LE 28/09/2026 ─────────────────────────────────────────
//
// Ce qui était faux, d'après la table de vérité ETF du 28/09/2026 (documents
// des émetteurs recoupés avec justETF, Boursorama et Euronext) :
//   · « 500 — Amundi S&P 500 », présenté « ✓ PEA éligible » : il ne l'est pas
//     (reporting Amundi du 31/08/2026 : « Compte-titres, Assurance-vie »).
//     Remplacé par SPEA, le S&P 500 éligible PEA le moins cher de la table.
//   · « TER le plus bas de notre sélection (0,15 %) » : c'était le TER d'un
//     ETF hors PEA. Dans la sélection actuelle, le plus bas est SPEA à 0,10 %.
//   · CW8 « Recommandé #1 » et « choix par défaut » alors que la meta de la
//     page et nos comparatifs concluent l'inverse : WPEA et DCAM répliquent le
//     même indice à 0,20 % contre 0,38 %. La page se contredisait.
//   · VWCE à 0,22 % : ses frais sont de 0,14 %.
//   · « Le CW8 ou VWCE », cités comme « ETF MSCI World » : VWCE réplique le
//     FTSE All-World.
// Retirés faute de pouvoir les vérifier : nombres d'entreprises et de pays des
// indices, poids des émergents ou de la tech, « le plus grand gestionnaire au
// monde », « le plus liquide », prix de part de CW8.

interface Pick {
  symbol: string;
  name: string;
  ter: number;
  pea: boolean;
  /** Absente quand la table de vérité ne la documente pas — on n'affiche pas
   *  une donnée qu'on n'a pas vérifiée. */
  replication?: string;
  index: string;
  verdict: string;
  verdictClass: string;
  tagClass: string;
  tag: string;
  why: string[];
  watchOut: string;
  /** Page du site qui détaille cet ETF, quand il n'a pas (encore) de fiche
   *  /etf/[symbole] : un lien vers une fiche absente mène à une 404. */
  detail?: { href: string; label: string };
}

const TOP_PICKS: Pick[] = [
  {
    symbol: "WPEA",
    name: "iShares MSCI World Swap PEA UCITS ETF EUR (Acc)",
    ter: 0.20,
    pea: true,
    replication: "Synthétique (swap)",
    index: "MSCI World (grandes et moyennes capitalisations des pays développés)",
    verdict: "Le choix n°1 pour un débutant en PEA",
    verdictClass: "bg-primary-50 border-primary-100 text-primary-800",
    tagClass: "bg-primary-600 text-white",
    tag: "Notre choix n°1",
    why: [
      "0,20 % de frais contre 0,38 % pour CW8 : le même indice, presque deux fois moins cher",
      "Éligible PEA — après 5 ans, seuls les prélèvements sociaux de 18,6 % s'appliquent aux gains",
      // 29/09/2026 : montants d'encours (2,1 et 1,4 Md€) retirés — la table et
      // justETF divergent (part ou fonds ?, fait encours-a-trancher) ; les deux
      // s'accordent sur le classement WPEA > DCAM.
      "Un encours plus important que celui de DCAM, son équivalent chez Amundi",
      "Capitalisant, avec une part sous 10 € : un petit versement mensuel achète des parts entières",
    ],
    // 29/09/2026 : « encadré par la réglementation UCITS » précisé et sourcé
    // (CMF art. R214-21, fait ucits-contrepartie-10pc).
    watchOut: "Fonds récent (lancé le 26/03/2024). La réplication synthétique (swap) introduit un risque de contrepartie faible mais réel, plafonné par la réglementation : au plus 10 % de l'actif du fonds sur une même banque contrepartie. Aucun pays émergent : le MSCI World ne couvre que les pays développés.",
    detail: { href: "/comparatif-etf/cw8-vs-wpea", label: "Comparatif CW8 vs WPEA →" },
  },
  {
    symbol: "DCAM",
    name: "Amundi PEA Monde (MSCI World) UCITS ETF Acc",
    ter: 0.20,
    pea: true,
    index: "MSCI World (grandes et moyennes capitalisations des pays développés)",
    verdict: "L'équivalent d'Amundi, au même prix",
    verdictClass: "bg-blue-50 border-blue-100 text-blue-800",
    tagClass: "bg-blue-600 text-white",
    tag: "Alternative PEA",
    why: [
      "Même indice et même TER (0,20 %) que WPEA",
      "Part sous 10 € : adaptée aux petits versements mensuels",
      "Capitalisant — dividendes réinvestis automatiquement",
    ],
    watchOut: "Le plus jeune des deux (lancé le 04/03/2025), avec un encours plus petit que WPEA. À frais égaux, ce qui départage WPEA et DCAM tient surtout aux frais d'ordre du courtier.",
    detail: { href: "/comparatif-etf/wpea-vs-dcam", label: "Comparatif WPEA vs DCAM →" },
  },
  {
    symbol: "SPEA",
    name: "iShares S&P 500 Swap PEA UCITS ETF EUR (Acc)",
    ter: 0.10,
    pea: true,
    replication: "Synthétique (swap)",
    index: "S&P 500 (500 grandes entreprises américaines)",
    verdict: "Le S&P 500 en PEA — pour parier sur les États-Unis",
    verdictClass: "bg-amber-50 border-amber-100 text-amber-800",
    tagClass: "bg-amber-500 text-white",
    tag: "S&P 500 PEA",
    why: [
      "TER le plus bas de notre sélection : 0,10 %",
      "Éligible PEA — contrairement à l'Amundi S&P 500 Swap (mnémonique 500), qui ne l'est pas",
      "Alternatives éligibles : PSP5 (Amundi, 0,12 %) et ESE (BNP Paribas, 0,14 %)",
      "Capitalisant — dividendes réinvestis automatiquement",
    ],
    // 29/09/2026 : « encours non vérifié » taisait sa petite taille : justETF
    // (1 source) le place très loin derrière PSP5 au 31/08/2026 (faits
    // etf-pea-spea, encours-a-trancher). Signalé sans chiffre.
    watchOut: "100 % américain : moins diversifié qu'un ETF monde. Les actions américaines sont déjà dans WPEA et DCAM : ajouter SPEA à l'un d'eux surpondère des sociétés déjà détenues. Fonds récent (lancé le 29/05/2025) et encore petit : d'après justETF, son encours est très inférieur à celui de PSP5 au 31/08/2026, et un petit fonds est plus exposé au risque de fermeture.",
    detail: { href: "/comparatif-etf/ese-vs-psp5", label: "Comparatif ESE vs PSP5 →" },
  },
  {
    symbol: "VWCE",
    name: "Vanguard FTSE All-World UCITS ETF (USD) Accumulating",
    ter: 0.14,
    pea: false,
    index: "FTSE All-World (pays développés et émergents)",
    verdict: "Hors PEA : le monde entier en une ligne",
    verdictClass: "bg-slate-50 border-slate-200 text-slate-800",
    tagClass: "bg-slate-600 text-white",
    tag: "Compte-titres",
    why: [
      "Pays développés ET émergents en un seul ETF — les émergents sont absents du MSCI World",
      "0,14 % de frais",
      "Capitalisant — dividendes réinvestis automatiquement",
    ],
    watchOut: "Non éligible PEA : il se loge en compte-titres, où les gains supportent le PFU de 31,4 %, contre 18,6 % de prélèvements sociaux dans un PEA de plus de 5 ans. En PEA, GPEA (Amundi PEA Global, MSCI ACWI, 0,30 %) couvre aussi développés et émergents, mais le fonds n'existe que depuis le 06/07/2026.",
    detail: { href: "/comparatif-etf/vwce-vs-wpea", label: "Comparatif VWCE vs WPEA →" },
  },
];

/** Vrai quand l'ETF a une fiche /etf/[symbole] — sinon le lien serait une 404. */
function aUneFiche(symbol: string): boolean {
  return getETFBySymbol(symbol) !== undefined;
}

const CRITERIA = [
  {
    title: "Frais (TER)",
    icon: "💶",
    // 29/09/2026 : « 0,07 % vs 1,5 % (fonds actif) … une différence
    // considérable » : ni le 1,5 % des fonds actifs ni l'écart n'étaient
    // sourcés. Le 1,5 % devient une hypothèse d'illustration et l'écart est
    // CALCULÉ par le moteur (ecartCapital, faits BT-24 et BT-26). Le TER est
    // prélevé au jour le jour sur l'actif, pas « chaque année » (ter-definition).
    body: `Le TER (Total Expense Ratio, ou frais courants) est prélevé au jour le jour sur l'actif du fonds : la performance affichée en est déjà nette. Sur la durée, l'écart pèse lourd : avec ${HYPOTHESES_COMPARATIFS.monthlyAmount} € par mois pendant ${HYPOTHESES_COMPARATIFS.durationYears} ans et un rendement brut hypothétique de ${HYPOTHESES_COMPARATIFS.annualReturnPct} % par an, des frais de 1,5 % par an au lieu de 0,20 % laissent environ ${ecartCapital(1.5, 0.2)} € de moins. Visez moins de 0,5 % pour un ETF passif.`,
  },
  {
    title: "Diversification",
    icon: "🌍",
    body: "Un ETF MSCI World couvre les grandes et moyennes capitalisations de tous les pays développés. Un ETF S&P 500 : 500 entreprises d'un seul pays. Plus la couverture est large, moins votre portefeuille dépend d'une entreprise ou d'un marché spécifique.",
  },
  {
    title: "Éligibilité PEA",
    icon: "🏛️",
    body: "Pour les résidents français, le PEA est l'enveloppe fiscale la plus avantageuse. Après 5 ans, vos plus-values sont exonérées d'impôt sur le revenu (seuls les 18,6 % de prélèvements sociaux s'appliquent vs 31,4 % en flat tax sur CTO).",
  },
  {
    title: "Politique de distribution",
    icon: "🔄",
    body: "Un ETF capitalisant réinvestit automatiquement les dividendes. C'est optimal pour le DCA long terme : les dividendes s'ajoutent à votre capital et composent sans intervention ni friction fiscale annuelle.",
  },
  {
    title: "Liquidité",
    icon: "📊",
    body: "La liquidité détermine à quel prix vous pouvez acheter ou vendre. Un ETF très liquide a un faible écart acheteur/vendeur (spread). Sur des montants modestes, préférez les ETF à fort volume quotidien.",
  },
];

const FAQ = [
  {
    q: "Quel est le meilleur ETF pour commencer en bourse avec un petit budget ?",
    a: "Un ETF MSCI World éligible PEA à 0,20 % de frais : WPEA (iShares) ou DCAM (Amundi). Tous deux sont capitalisants et leur part coûte moins de 10 €, ce qui permet d'investir de petites sommes chaque mois. CW8 réplique le même indice, mais à 0,38 %.",
  },
  {
    q: "Faut-il choisir CW8, WPEA ou DCAM ?",
    // 29/09/2026 : « cet écart de 0,18 point se retrouve tel quel dans la
    // performance » était faux — le TER exclut notamment les frais de swap ;
    // l'écart réel est l'écart de suivi (fait ter-definition). Montants
    // d'encours retirés (écart table / justETF non tranché).
    a: "Les trois répliquent le MSCI World et sont éligibles PEA. WPEA et DCAM coûtent presque deux fois moins cher (0,20 % contre 0,38 % pour CW8) : pour de nouveaux achats, ils ont l'avantage. Cet écart de frais de 0,18 point par an pèse sur la performance, mais ne s'y retrouve pas forcément au centième près : ce qui la sépare vraiment, c'est l'écart de suivi (tracking difference) de chaque ETF, qui intègre aussi des coûts absents du TER, comme les frais de swap. Entre WPEA et DCAM, WPEA a le plus gros encours ; les deux ont une part sous 10 €.",
  },
  {
    q: "Un seul ETF suffit-il pour un portefeuille débutant ?",
    a: "Oui, et c'est souvent la meilleure approche. Un ETF monde — WPEA ou DCAM (MSCI World) en PEA, VWCE (FTSE All-World) en compte-titres — offre une diversification mondiale suffisante pour un investisseur particulier. Ajouter des ETF crée de la complexité et du risque de chevauchement (overlap) sans améliorer nécessairement la diversification. Commencez simple, puis complexifiez si vous avez des raisons précises de le faire.",
  },
  {
    q: "Peut-on investir en ETF avec 50 € par mois ?",
    // 28/09/2026 (grilles courtiers en vigueur) : « fractions d'ETF » chez
    // Trade Republic non confirmées pour le PEA ; « Boursorama, Fortuneo…
    // acceptent des ordres à partir de 50 à 100 € » faux pour BoursoBank
    // (200 € minimum par ordre d'ETF, brochure du 04/09/2026).
    a: "Oui, mais pas chez tous les courtiers. Chez Trade Republic, un plan d'investissement programmé s'exécute sans frais d'achat ; dans le PEA, vérifiez dans l'application s'il achète des fractions de parts ou seulement des parts entières. Chez Fortuneo, il n'y a pas de minimum d'ordre sur Euronext et, en tarif Starter, le premier ordre du mois est gratuit jusqu'à 500 €, mais il faut déposer 100 € à l'ouverture et passer l'ordre soi-même. Chez BoursoBank, selon la brochure tarifaire du 4 septembre 2026, un ordre d'ETF doit faire au moins 200 € : un versement de 50 € par mois n'y est possible qu'avec le Plan d'Épargne, qui investit dans des fonds maison. Le montant mensuel importe moins que la régularité sur le long terme.",
  },
  {
    q: "Quelle est la différence entre ETF et fonds actifs ?",
    // 29/09/2026 : « plus de 80 % des fonds actifs sous-performent… » et
    // « frais 5 à 10 fois plus élevés » retirés : aucune source sur la page ni
    // dans le dossier de vérification (même défaut que le « 90 % des
    // investisseurs » retiré au commit b9292fa). La fourchette de TER citée
    // est celle des ETF vérifiés (fait selection-pea-fourchette-ter).
    a: "Un ETF passif suit mécaniquement un indice (MSCI World, S&P 500) sans chercher à le battre. Un fonds actif essaie de sélectionner des titres pour surperformer l'indice. Pour y parvenir, il doit d'abord regagner ses propres frais de gestion — ceux des 13 ETF éligibles au PEA que nous avons vérifiés vont de 0,10 % à 0,38 % par an — et rien ne garantit qu'il y arrive. Comparez toujours les frais courants indiqués dans le document d'informations clés (DIC) des deux produits.",
  },
  {
    q: "Comment acheter mon premier ETF ?",
    a: "1) Ouvrez un PEA chez un courtier en ligne (BoursoBank, Trade Republic, Fortuneo). 2) Effectuez un virement. 3) Recherchez l'ETF par son ISIN (ex. IE0002XZSHO1 pour WPEA) : c'est lui, pas le nom, qui identifie le fonds. 4) Passez un ordre au marché ou à cours limité. Le premier ordre prend généralement moins de 5 minutes.",
  },
];

export default function MeilleursETFDebutantsPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

  // Get ETFs from config to show full list at bottom
  // 500, ANX et AEEM retirés le 28/09/2026 : cette liste les affichait avec un
  // badge « PEA » alors qu'aucun des trois n'est éligible (table de vérité ETF).
  const allETFs = ETF_LIST.filter((e) => ["CW8", "IWDA", "VWCE", "CSPX", "PCEU"].includes(e.displaySymbol));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      }} />

      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: "/" },
          { name: "Meilleurs ETF débutants" },
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Meilleurs ETF débutants</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Meilleurs ETF pour débutants : notre sélection pour 2026
      </h1>
      <p className="text-lg text-gray-500 mb-4 leading-relaxed">
        Vous voulez investir en bourse mais vous ne savez pas quel ETF
        choisir ? Pas de jargon superflu : voici les ETF que nous
        recommandons aux débutants en France, avec les critères de
        sélection et les points d&apos;attention pour chacun.
      </p>
      <p className="text-base text-gray-500 mb-6 leading-relaxed">
        Une fois à l&apos;aise avec cette short-list, notre{" "}
        <Link href="/guide-5-etf-pea-premium" className="text-primary-700 font-medium hover:underline">
          guide 5 ETF Premium pour PEA
        </Link>
        {" "}propose une sélection plus avancée, avec critères de tri et
        allocations types.
      </p>

      <ArticleByline
        publishedAt="2026-04-20"
        updatedAt="2026-09-28"
        readingMinutes={11}
        url="/meilleurs-etf-debutants"
        headline={TITLE}
        description={DESCRIPTION}
      />

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
        <p className="text-gray-600 leading-relaxed mb-4">
          Avant de présenter notre sélection, voici les critères qui
          guident nos recommandations — et qui permettent d&apos;évaluer
          n&apos;importe quel ETF par soi-même.
        </p>
        <p className="text-gray-600 leading-relaxed mb-6">
          Le premier critère, et de loin le plus impactant, est le cadre
          fiscal :{" "}
          <Link href="/pea-ou-cto" className="text-primary-700 font-medium hover:underline">
            PEA ou CTO
          </Link>
          {" "}conditionne l&apos;univers d&apos;ETF accessibles avant même la
          question du TER ou de l&apos;indice répliqué. Pour les fonds que nous
          avons vérifiés, notre{" "}
          <Link href="/etf-eligibles-pea" className="text-primary-700 font-medium hover:underline">
            liste des ETF éligibles au PEA, vérifiés un par un
          </Link>
          , donne leur ISIN et leur statut.
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
                {aUneFiche(etf.symbol) ? (
                  <Link
                    href={`/etf/${etf.symbol}`}
                    className="shrink-0 w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:border-primary-200 transition-colors shadow-sm"
                  >
                    <span className="text-sm font-bold text-gray-800">{etf.symbol}</span>
                  </Link>
                ) : (
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold text-gray-800">{etf.symbol}</span>
                  </div>
                )}
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
                        Hors PEA (CTO)
                      </span>
                    )}
                  </div>
                  {aUneFiche(etf.symbol) ? (
                    <Link href={`/etf/${etf.symbol}`} className="text-base font-bold text-gray-900 hover:text-primary-700 transition-colors leading-tight block">
                      {etf.name}
                    </Link>
                  ) : (
                    <p className="text-base font-bold text-gray-900 leading-tight">{etf.name}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">{etf.index}</p>
                </div>
              </div>

              {/* Key stats */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="bg-white/70 rounded-lg px-3 py-1.5 text-center">
                  <p className="text-xs text-gray-500">TER</p>
                  <p className="text-sm font-bold text-gray-900">{formatTer(etf.ter)}</p>
                </div>
                {etf.replication && (
                  <div className="bg-white/70 rounded-lg px-3 py-1.5 text-center">
                    <p className="text-xs text-gray-500">Réplication</p>
                    <p className="text-sm font-bold text-gray-900">{etf.replication}</p>
                  </div>
                )}
                <div className="bg-white/70 rounded-lg px-3 py-1.5 text-center">
                  <p className="text-xs text-gray-500">Distribution</p>
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
                {aUneFiche(etf.symbol) && (
                  <Link
                    href={`/etf/${etf.symbol}`}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 underline transition-colors"
                  >
                    Fiche détaillée {etf.symbol} →
                  </Link>
                )}
                {etf.detail && (
                  <Link
                    href={etf.detail.href}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 underline transition-colors"
                  >
                    {etf.detail.label}
                  </Link>
                )}
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

        {/* Maillage vers les duels détaillés (audit 07/2026) — ancres
            descriptives vers les pages money en position page 2. */}
        <p className="text-sm text-gray-600 leading-relaxed mt-6 rounded-xl bg-slate-50 border border-slate-200/70 px-4 py-3">
          Vous hésitez entre deux World éligibles PEA ? Nos duels détaillés
          tranchent :{" "}
          <Link href="/comparatif-etf/cw8-vs-wpea" className="text-primary-700 font-medium hover:underline">
            CW8 vs WPEA (le verdict frais)
          </Link>{" "}
          et{" "}
          <Link href="/comparatif-etf/wpea-vs-dcam" className="text-primary-700 font-medium hover:underline">
            WPEA vs DCAM (le match des 0,20 %)
          </Link>
          .
        </p>
      </section>

      {/* ── Section 4: Tableau récapitulatif ──────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Tableau comparatif de notre sélection (et de CW8)
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Les écarts de TER paraissent minimes (0,10 % à 0,38 %), mais sur
          20 ans de capitalisation, l&apos;effet sur le capital final est
          loin d&apos;être négligeable — c&apos;est la mécanique des{" "}
          <Link href="/interets-composes" className="text-primary-700 font-medium hover:underline">
            intérêts composés
          </Link>
          {" "}qui amplifie chaque dixième de point de frais payé en trop.
        </p>
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
                { symbol: "WPEA", ter: "0,20 %", pea: true,  cover: "Pays développés (MSCI World)", ideal: "Premier ETF en PEA" },
                { symbol: "DCAM", ter: "0,20 %", pea: true,  cover: "Pays développés (MSCI World)", ideal: "Premier ETF en PEA" },
                { symbol: "SPEA", ter: "0,10 %", pea: true,  cover: "500 grandes entreprises américaines", ideal: "S&P 500 en PEA" },
                { symbol: "VWCE", ter: "0,14 %", pea: false, cover: "Développés + émergents (FTSE All-World)", ideal: "Monde entier en CTO" },
                { symbol: "CW8",  ter: "0,38 %", pea: true,  cover: "Pays développés (MSCI World)", ideal: "Même indice que WPEA, plus cher" },
              ].map((row, i) => (
                <tr key={row.symbol} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 font-bold text-gray-900 border-b border-gray-50">
                    {aUneFiche(row.symbol) ? (
                      <Link href={`/etf/${row.symbol}`} className="hover:text-primary-600 transition-colors">
                        {row.symbol}
                      </Link>
                    ) : (
                      row.symbol
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-700 border-b border-gray-50">{row.ter}</td>
                  <td className="px-3 py-3 text-center border-b border-gray-50">
                    {row.pea
                      ? <span className="text-gain-default font-semibold">✓ Oui</span>
                      : <span className="text-gray-500">Non</span>
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
        <p className="text-gray-600 leading-relaxed mb-6">
          Choisir un ETF n&apos;est qu&apos;une partie de l&apos;équation : la
          méthode d&apos;achat compte tout autant. Pour un débutant, la{" "}
          <Link href="/strategie-dca" className="text-primary-700 font-medium hover:underline">
            stratégie DCA
          </Link>
          {" "}— versements mensuels fixes, quel que soit le niveau du marché —
          reste l&apos;approche la plus simple et la plus robuste à tenir dans
          la durée.
        </p>
        <div className="space-y-4">
          {[
            {
              n: "1",
              title: "Choisir votre enveloppe : PEA ou CTO",
              body: "Si vous résidez en France et visez un horizon 5+ ans, ouvrez un PEA en premier. La fiscalité après 5 ans (18,6 % vs 31,4 %) justifie presque toujours ce choix pour les ETF monde.",
              link: { href: "/pea-ou-cto", label: "Comprendre la différence PEA / CTO →" },
            },
            {
              n: "2",
              title: "Choisir votre ETF de départ",
              body: "Un seul ETF suffit pour commencer. Pour un PEA, WPEA ou DCAM : le MSCI World à 0,20 %, contre 0,38 % pour CW8. Pour un CTO, VWCE ajoute les pays émergents. Inutile de diversifier davantage au départ.",
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
      {/* data-nosearch (recherche interne, 28/09/2026) : liste de liens vers
          les 19 fiches, à 84 % faite de noms de fonds. Indexée, elle sortait
          sur toute recherche par nom de fonds (« iShares Core MSCI World »),
          devant les pages qui en parlent vraiment. Le titre suivant est le h2
          de la FAQ : rien d'autre ne change de passage. */}
      <section data-nosearch="" className="mb-14">
        {/* 29/09/2026 : « Tous les ETF disponibles » alors que la liste est
            filtrée (allETFs, 5 fiches sur le catalogue), et « les ETF les plus
            utilisés par les investisseurs particuliers » sans aucune mesure
            derrière. Le titre dit ce que la liste est ; le nombre est lu sur
            la liste elle-même, pas écrit. */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          D&apos;autres fiches ETF de notre base
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {allETFs.length} fiches détaillées, éligibles au PEA ou non (la
          mention PEA l&apos;indique) : description, forces et points
          d&apos;attention. Le comparateur, lui, réunit tous les ETF suivis par
          DCA Tracker.
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
                <p className="text-xs text-gray-500">{etf.category} · TER {formatTer(etf.ter)}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {etf.peaEligible && (
                  <span className="text-xs text-gain-default font-semibold">PEA</span>
                )}
                <span className="text-gray-500 group-hover:text-primary-400 transition-colors">→</span>
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
                <span className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
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

      <EtapeSuivante />

      <SourcesReferences
        sources={[
          {
            label: "Amundi ETF — DCAM et CW8 / EWLD",
            url: "https://www.amundietf.fr/fr/particuliers",
            publisher: "Amundi ETF",
            note: "Documents officiels de DCAM et du fonds de CW8 (part capitalisante) et EWLD (part distribuante), ainsi que PSP5. Vérifiés le 28/09/2026.",
          },
          {
            // 29/09/2026 : https://www.ishares.com menait à l'annuaire mondial
            // de BlackRock. Remplacé par les deux fiches produit, vérifiées.
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
            label: "justETF — fiche SPEA (IE000DQLYVB9)",
            url: "https://www.justetf.com/fr/etf-profile.html?isin=IE000DQLYVB9",
            publisher: "justETF",
            note: "Source de recoupement, notamment pour la taille du fonds au 31/08/2026. Consulté le 28/09/2026.",
          },
          {
            // 29/09/2026 : fr.vanguard/professional/produits/etf → 404.
            // Remplacé par le DIC français de VWCE (IE00BK5BQT80).
            label: "Vanguard FTSE All-World UCITS ETF (VWCE) — document d'informations clés",
            url: "https://fund-docs.vanguard.com/ie00bk5bqt80_priipskid_fr.pdf",
            publisher: "Vanguard",
            note: "DIC en français, daté du 28/07/2026. Consulté le 28/09/2026.",
          },
          {
            // 29/09/2026 : la page AMF « fonds-indiciels-cotes-etf » → 404.
            label: "Les ETF : caractéristiques, état des lieux et analyse des risques (étude, février 2017)",
            url: "https://www.amf-france.org/sites/institutionnel/files/contenu_simple/lettre_ou_cahier/risques_tendances/Les%20ETF%20%20caracteristiques,%20etat%20des%20lieux%20et%20analyse%20des%20risques%20-%20Le%20cas%20du%20marche%20francais.pdf",
            publisher: "Autorité des marchés financiers (AMF)",
            note: "Réplication physique et synthétique (swap), risque de contrepartie. Consulté le 28/09/2026.",
          },
          {
            // 29/09/2026 : la page ESMA citée (404) ne portait pas sur UCITS.
            // Le plafond de contrepartie invoqué plus haut est dans le CMF.
            label: "Code monétaire et financier, art. R214-21 — risque de contrepartie d'un OPCVM",
            url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000027797309",
            publisher: "Légifrance",
            note: "10 % de l'actif par contrepartie établissement de crédit, 5 % dans les autres cas. Consulté le 28/09/2026.",
          },
        ]}
      />

      <EmailCapture source="guide_meilleurs_etf_debutants" />
    </div>
  );
}
