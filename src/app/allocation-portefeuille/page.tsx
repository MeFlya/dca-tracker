import type { Metadata } from "next";
import Link from "next/link";
import { AllocationClient } from "./AllocationClient";
import { JsonLd } from "@/components/ui/JsonLd";
import { Disclaimer } from "@/components/ui/Disclaimer";
import {
  SourcesReferences,
  type SourceItem,
} from "@/components/ui/SourcesReferences";
import { ETF_LIST } from "@/lib/etf-config";
import {
  EXPECTED_RETURN_BY_REGION as R,
  HISTORICAL_RETURNS_PERIOD,
  PORTFOLIO_PRESETS,
  REGION_RETURN_SOURCES,
  ROLLING_10Y_CALC,
  SMALL_CAP_VS_USA_10Y,
  START_POINT_EXAMPLE,
  blendPortfolio,
  type RegionReturnSource,
} from "@/lib/portfolio";

// ─── Chiffres — corrigé le 29/09/2026 ──────────────────────────────────────
//
// La page citait des rendements non sourcés (« MSCI World 7,5 %/an, S&P 500
// 9 %/an… » attribués à des LTCMA Vanguard/JP Morgan, « ~7-9 %/an », « ce mix
// produit historiquement ~7 % net ») et « ~1 500 à 3 700 entreprises dans 23 à
// 49 pays ». Les rendements sont désormais INTERPOLÉS depuis
// REGION_RETURN_SOURCES (src/lib/portfolio.ts : indice, période, source et
// date de chaque chiffre), y compris les chiffres 10 ans et les fourchettes
// sur 10 ans glissants ; l'exemple 2000-2003 et la comparaison petites
// capitalisations sur 10 ans viennent de START_POINT_EXAMPLE et
// SMALL_CAP_VS_USA_10Y (même fichier). La page ne peut plus diverger de
// l'outil. Les autres chiffres (1 280 constituants, 3 759 positions) sont
// écrits ici et sourcés dans SOURCES, en bas de fichier.

/** « 6,6 %/an », espace insécable. */
const pct = (n: number) => `${n.toFixed(1).replace(".", ",")}\u00a0%/an`;
const P = HISTORICAL_RETURNS_PERIOD.label;
/** Même période, en début de phrase : « Du 29/12/2000 au 31/08/2026 ». */
const PCap = P.charAt(0).toUpperCase() + P.slice(1);
/** « −1,6 % » ou « +14,4 % », signe typographique, espace insécable. */
const signed = (n: number) =>
  `${n < 0 ? "−" : "+"}${Math.abs(n).toFixed(1).replace(".", ",")}\u00a0%`;
/** « 43,8 % » (valeur absolue d'une baisse). */
const loss = (n: number) => `${Math.abs(n).toFixed(1).replace(".", ",")}\u00a0%`;
/** « 11,72 %/an », deux décimales, pour les chiffres cités tels que publiés. */
const pct2 = (n: number) => `${n.toFixed(2).replace(".", ",")}\u00a0%/an`;

/** Chiffre 10 ans publié par la fiche MSCI : casse le build s'il manque. */
function tenYear(src: RegionReturnSource): string {
  if (src.tenYearPublishedPct === undefined) {
    throw new Error(`Chiffre 10 ans absent pour ${src.referenceIndex}`);
  }
  return pct(src.tenYearPublishedPct);
}

/** Fourchette 10 ans glissants : casse le build si elle manque. */
function rolling(src: RegionReturnSource): { min: string; max: string } {
  if (!src.rolling10y) {
    throw new Error(`Fourchette 10 ans absente pour ${src.referenceIndex}`);
  }
  return { min: signed(src.rolling10y.min), max: signed(src.rolling10y.max) };
}
const WORLD_10Y_RANGE = rolling(REGION_RETURN_SOURCES.monde);

/**
 * Moyenne historique pondérée (avant frais) d'un préréglage, calculée par le
 * même moteur que l'outil. Casse le build si le préréglage pointe vers un ETF
 * absent du catalogue (c'est déjà arrivé avec IUSN).
 */
function presetHistoricalReturn(id: string): string {
  const preset = PORTFOLIO_PRESETS.find((p) => p.id === id);
  if (!preset) throw new Error(`Préréglage introuvable : ${id}`);
  const items = preset.allocation.map(({ displaySymbol, weight }) => {
    const etf = ETF_LIST.find((e) => e.displaySymbol === displaySymbol);
    if (!etf) {
      throw new Error(`Préréglage ${id} : ${displaySymbol} absent du catalogue`);
    }
    return { etf, weight };
  });
  return pct(blendPortfolio(items, 0).blendedReturn);
}

const TITLE = "Allocation de portefeuille ETF : construisez votre mix";
const DESCRIPTION =
  "Combinez 2 à 5 ETF, ajustez les poids : TER moyen et rendement historique pondéré de leurs indices, de fin 2000 à août 2026 (MSCI, BCE). Gratuit.";
const CANONICAL = "/allocation-portefeuille";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "website",
    images: [{ url: "https://dcatracker.fr/og-image.jpg", width: 1200, height: 630 }],
  },
};

const FAQ = [
  {
    q: "Combien d'ETF faut-il dans un portefeuille DCA ?",
    // Corrigé le 29/09/2026 : « ~1 500 à 3 700 entreprises dans 23 à 49 pays »
    // n'était pas sourcé. 1 280 : fiche MSCI World au 31/08/2026 ; 3 759 :
    // justETF, fiche VWCE au 31/08/2026. Le nombre de pays du FTSE All-World
    // n'a pas été vérifié : retiré.
    a: "Il n'y a pas de nombre idéal. Un seul ETF mondial est déjà très diversifié : le MSCI World regroupe environ 1 300 grandes et moyennes entreprises de 23 pays développés (1 280 au 31/08/2026 selon la fiche MSCI), et le FTSE All-World y ajoute les pays émergents (l'ETF VWCE détenait 3 759 positions au 31/08/2026 selon justETF). Ajouter 1 ou 2 ETF complémentaires (émergents, petites capitalisations, monétaire) modifie le profil du portefeuille mais alourdit le suivi. Chaque ligne supplémentaire doit apporter une exposition que les autres n'ont pas ; sinon, elle ajoute de la complexité sans diversifier davantage.",
  },
  {
    q: "Faut-il intégrer les marchés émergents ?",
    // Corrigé le 28/09/2026 d'après la table de vérité ETF : le « mix CW8 +
    // AEEM » était présenté comme une option PEA, or AEEM n'est pas éligible
    // au PEA (l'équivalent éligible est PAEEM), et VWCE non plus. Le « ~10 % de
    // la capitalisation mondiale » a été retiré : la table ne permet pas de le
    // vérifier.
    // Corrigé le 29/09/2026 : « ~7-9 %/an » n'était pas sourcé. Chiffres
    // 10 ans (8,83 % émergents, 12,53 % World) : fiches MSCI en euros au
    // 31/08/2026, colonne « 10 Yr ».
    // Corrigé le 29/09/2026 : « Fin 2000, les émergents étaient bas et les
    // actions américaines au sommet de la bulle internet » n'était pas sourcé
    // et inexact (sommet en mars 2000 ; MSCI USA en euros encore +6 % jusqu'en
    // mai 2001 ; MSCI EM −26,1 % ensuite jusqu'en mars 2003). Remplacé par un
    // fait calculé et daté (START_POINT_EXAMPLE). Chiffres 10 ans interpolés.
    a: `Le MSCI World seul exclut les pays émergents (Chine, Inde, Brésil, etc.). Ajouter une part d'émergents donne une exposition plus complète au marché mondial, avec une volatilité plus élevée. ${PCap}, en euros, le MSCI Emerging Markets a rapporté ${pct(R.emergents)} contre ${pct(R.monde)} pour le MSCI World ; mais sur les 10 ans au ${REGION_RETURN_SOURCES.emergents.dataDate}, l'ordre s'inverse (${tenYear(REGION_RETURN_SOURCES.emergents)} contre ${tenYear(REGION_RETURN_SOURCES.monde)} ; fiches MSCI en euros). Le classement dépend du point de départ : du ${START_POINT_EXAMPLE.from} au ${START_POINT_EXAMPLE.to}, le MSCI USA en euros a perdu ${loss(START_POINT_EXAMPLE.usaPct)} et le MSCI Emerging Markets ${loss(START_POINT_EXAMPLE.emergentsPct)} (calcul DCA Tracker sur les niveaux mensuels MSCI, dividendes nets réinvestis). En PEA, le mix se fait avec un MSCI World (WPEA ou DCAM à 0,20 %, CW8 à 0,38 %) et PAEEM (0,30 %) — l'Amundi MSCI Emerging Markets Swap (AEEM) n'est PAS éligible au PEA. GPEA (Amundi PEA Global, MSCI ACWI, 0,30 %) réunit les deux en une ligne éligible, mais le fonds n'existe que depuis le 06/07/2026. Hors PEA, le FTSE All-World (VWCE) intègre aussi émergents et développés en un seul ETF.`,
  },
  {
    q: "Le portefeuille 70/20/10, c'est quoi exactement ?",
    // Corrigé le 29/09/2026 : « ce mix produit historiquement ~7 % net »
    // n'était pas sourcé, et la poche de 10 % (C3M) est monétaire, pas
    // obligataire. La moyenne affichée est calculée par blendPortfolio.
    a: `Un exemple d'allocation en trois poches : 70 % d'actions des pays développés (MSCI World), 20 % d'émergents et 10 % de monétaire. Dans l'outil, cette dernière poche est C3M, un fonds quasi monétaire (bons du Trésor de la zone euro à moins de 6 mois), pas un fonds d'obligations longues, et il n'est pas éligible au PEA. Cette poche peu volatile amortit une partie des baisses mais rapporte peu : ${pct(R.obligations)} ${P} pour le taux monétaire en euros (EONIA puis €STR, BCE), avec un rendement négatif de 2015 à 2021. Nous n'avons pas de rendement historique vérifié pour ce mix en DCA : la moyenne pondérée de ses indices sur la même période (${presetHistoricalReturn("world-em-bond-70-20-10")} avant frais) n'en donne qu'un ordre de grandeur, pas une prévision.`,
  },
  {
    q: "Faut-il ajouter des obligations en DCA long-terme ?",
    // Corrigé le 29/09/2026 : « beaucoup d'études (incluant Vanguard)
    // recommandent 100 % actions » et les fourchettes « 5-10 ans », « 20-40 % »
    // n'étaient pas sourcées : retirées.
    a: `Il n'existe pas de proportion valable pour tout le monde : elle dépend de l'horizon, du moment où l'on aura besoin de l'argent et de la capacité à supporter une baisse. Sur longue période, les actions ont rapporté davantage, au prix de fortes baisses en chemin : ${P}, en euros, ${pct(R.monde)} pour le MSCI World (dividendes réinvestis) contre ${pct(R.obligations)} pour le taux monétaire en euros (EONIA puis €STR). À l'approche de la date de retrait, une part moins volatile réduit le risque de devoir vendre en pleine baisse (risque de séquence). L'outil ne propose pas d'obligations longues, seulement un fonds quasi monétaire (C3M) ; nous n'avons pas vérifié de chiffre historique pour les obligations longues.`,
  },
  {
    q: "Comment rééquilibrer mon portefeuille ?",
    a: "Le rééquilibrage consiste à ramener vos poids cibles quand un ETF devient surpondéré (par exemple après une forte hausse). Trois méthodes : (1) versement seul — diriger les nouvelles contributions vers l'ETF sous-pondéré ; (2) calendaire — vendre/acheter une fois par an pour revenir aux poids cibles ; (3) seuil — déclencher dès qu'un ETF dérive de plus de 5 %. La méthode (1) est la moins coûteuse fiscalement (pas de PV imposable) et la plus simple en DCA.",
  },
  {
    q: "Quels ETF sont éligibles au PEA ?",
    // Corrigé le 28/09/2026 d'après la table de vérité ETF : 500 (S&P 500) et
    // AEEM (émergents) étaient donnés en exemple d'ETF éligibles PEA. Aucun des
    // deux ne l'est (reporting Amundi du 31/08/2026 : « Compte-titres,
    // Assurance-vie »). SPY, absent de la table, remplacé par CSPX.
    a: "Le PEA n'accepte que les ETF investis à plus de 75 % en actions de sociétés de l'UE ou de l'EEE. Les ETF synthétiques (réplication par swap) respectent cette règle en détenant des actions européennes tout en répliquant un indice mondial : WPEA, DCAM ou CW8 (MSCI World), SPEA, PSP5 ou ESE (S&P 500), PUST (Nasdaq-100), PCEU (Europe), PAEEM (émergents). Mais un swap ne rend pas éligible à lui seul : les Amundi S&P 500 Swap (500), Nasdaq-100 Swap (ANX) et MSCI Emerging Markets Swap (AEEM) ne le sont PAS. Les ETF physiques comme VWCE, IWDA, CSPX ne sont pas éligibles non plus — il faut les loger en CTO. Notre comparateur affiche le statut PEA de chaque ETF.",
  },
  {
    // Corrigé le 29/09/2026 : l'ancienne liste (MSCI World 7,5 %, S&P 500 9 %…)
    // était attribuée à des LTCMA Vanguard et JP Morgan sans référence, et
    // n'était pas « conservatrice » : sur 2001-2026, elle dépassait
    // l'historique sur cinq poches sur sept. Tout est interpolé depuis
    // REGION_RETURN_SOURCES.
    // 29/09/2026 : la fourchette −1,6 / +14,4 était écrite en dur, présentée
    // après « publiés par MSCI » et datée « selon l'année de départ » : c'est un
    // calcul DCA Tracker, par mois de départ, limité à 2000-2026 — dit ainsi.
    q: "Le rendement pondéré affiché : sur quoi est-il basé ?",
    a: `Sur le rendement annualisé historique d'un indice de référence par région, en euros, ${P}, avant frais des ETF : monde, MSCI World ${pct(R.monde)} ; États-Unis, MSCI USA ${pct(R.usa)} (le S&P 500 en euros n'a pas été vérifié) ; Europe, MSCI Europe ${pct(R.europe)} ; émergents, MSCI Emerging Markets ${pct(R.emergents)} ; Japon, MSCI Japan ${pct(R.japon)} ; petites capitalisations américaines, MSCI USA Small Cap ${pct(R["small-cap"])} ; monétaire, EONIA puis €STR ${pct(R.obligations)}. Pour les actions, ce sont des indices MSCI « net », dividendes nets de retenue à la source réinvestis. Les rendements du MSCI World et du MSCI Emerging Markets sur cette période sont publiés par MSCI ; les autres, comme toutes les fourchettes sur 10 ans, sont calculés par nos soins à partir des niveaux mensuels officiels de MSCI et des taux de la BCE. Le point de départ compte beaucoup : sur les ${ROLLING_10Y_CALC.windows} fenêtres de 10 ans comprises dans cette période, le MSCI World a fait de ${WORLD_10Y_RANGE.min} à ${WORLD_10Y_RANGE.max}/an selon le mois de départ (${ROLLING_10Y_CALC.shortLabel}). La moyenne pondérée n'est qu'un ordre de grandeur, pas le rendement réel du mix. Ce n'est pas une prévision : les performances passées ne préjugent pas des performances futures.`,
  },
];

export default function AllocationPortefeuillePage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    // Wrapper bg-white opaque — page de calcul/lecture, fond calme
    // qui stoppe le leak AmbientBackground.
    <div className="bg-white">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Allocation portefeuille ETF",
          url: `${siteUrl}${CANONICAL}`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web browser",
          inLanguage: "fr-FR",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          },
          description:
            "Construisez un portefeuille pondéré de 2 à 5 ETF : TER moyen et rendement historique pondéré de leurs indices (MSCI, BCE), puis simulation DCA.",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Fil d'ariane"
          className="flex items-center gap-2 text-sm text-gray-500 mb-3"
        >
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <span className="text-gray-700" aria-current="page">
            Allocation portefeuille
          </span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
            Construire un portefeuille
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Mixez plusieurs ETF, voyez votre rendement pondéré
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            Choisissez 2 à 5 ETF, ajustez les poids, et obtenez en temps réel
            le TER moyen et le rendement historique pondéré de leurs indices.
            Projetez ensuite l&apos;allocation dans le simulateur, ou comparez
            à un MSCI World seul pour mesurer la différence.
          </p>
        </header>

        {/* Calculator (interactive) */}
        <AllocationClient etfs={ETF_LIST} />

        {/* SEO content + FAQ */}
        <section className="mt-20 space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pourquoi diversifier au-delà du MSCI World ?
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
              {/* Corrigé le 29/09/2026 : « ~1 500 grandes entreprises » et
                  « standard de facto pour la majorité » n'étaient pas
                  sourcés. 1 280 : fiche MSCI World au 31/08/2026. */}
              <p>
                Le MSCI World est déjà très diversifié : environ 1 300 grandes
                et moyennes entreprises de 23 pays développés (1 280 au
                31/08/2026 selon la fiche MSCI). Mais il a deux angles morts :
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  {/* Corrigé le 28/09/2026 (table de vérité ETF) : AEEM était
                      proposé comme ETF émergents sans préciser qu'il n'est pas
                      éligible au PEA ; « ~10 % du capital mondial » retiré,
                      invérifiable. */}
                  <strong>Pas de marchés émergents</strong> (Chine, Inde,
                  Brésil). Ajouter un ETF Émergents (PAEEM en PEA — AEEM,
                  lui, n&apos;est pas éligible) ou passer au FTSE All-World
                  (VWCE, hors PEA, qui intègre les deux).
                </li>
                <li>
                  <strong>Pas de petites capitalisations</strong> : le MSCI
                  World ne contient que des grandes et moyennes
                  capitalisations. Un ETF de petites capitalisations les
                  ajoute, par exemple RS2K (Russell 2000, petites
                  capitalisations américaines, éligible PEA). {PCap}, en euros,
                  les petites capitalisations américaines (MSCI USA Small Cap)
                  ont rapporté {pct(R["small-cap"])} contre {pct(R.usa)} pour
                  le marché américain large (MSCI USA) : un écart propre à
                  cette période, sans garantie qu&apos;il se reproduise. Sur
                  les 10 ans au {SMALL_CAP_VS_USA_10Y.dataDate}, l&apos;ordre
                  s&apos;inverse : {pct2(SMALL_CAP_VS_USA_10Y.smallCapPct)}{" "}
                  contre {pct2(SMALL_CAP_VS_USA_10Y.usaPct)} (MSCI USA Small
                  Cap contre MSCI USA, en dollars, dividendes bruts, fiche MSCI
                  USA Small Cap Index).
                  {/* 29/09/2026 : seule la période favorable aux petites
                      capitalisations était montrée ; la fiche MSCI donne
                      l'inverse sur 10 ans (SMALL_CAP_VS_USA_10Y). */}
                  {/* Corrigé le 28/09/2026 (table de vérité ETF) : RS2K était
                      rangé dans les « small caps mondiales » ; il réplique le
                      Russell 2000, un indice américain. IUSN retiré : absent
                      de la table, non vérifié. */}
                </li>
              </ul>
              <p>
                À l&apos;inverse, multiplier les ETF complique le suivi et
                augmente le coût de rééquilibrage : chaque ligne ajoutée doit
                apporter une exposition que les autres n&apos;ont pas.
              </p>
              {/* 01/10/2026 : renvoi vers /suivi-pea-excel (brief du
                  01/10/2026, lien n° 4). */}
              <p>
                Avec deux ou trois lignes, ce suivi revient à comparer chaque
                mois le poids réel de chaque ETF à sa cible, et à diriger le
                versement vers ceux qui sont en dessous. Voir comment{" "}
                <Link href="/suivi-pea-excel#versement-du-mois" className="text-primary-700 font-medium hover:underline">
                  construire ce tableau de suivi dans Excel ou Google Sheets
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Corrigé le 29/09/2026 : les « rendements attendus » 7,6 / 6,9 /
              7,6 % étaient écrits à la main depuis l'ancienne table non
              sourcée. Ils sont maintenant calculés par blendPortfolio. */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PresetCard
                title="Monde + émergents (80/20)"
                description="80 % MSCI World, 20 % marchés émergents (PAEEM) : les deux éligibles PEA."
                return_={presetHistoricalReturn("world-em-80-20")}
              />
              <PresetCard
                title="Diversifié 70/20/10"
                description="70 % monde développé, 20 % émergents, 10 % monétaire (C3M, non éligible PEA)."
                return_={presetHistoricalReturn("world-em-bond-70-20-10")}
              />
              <PresetCard
                title="Monde + small caps US (90/10)"
                description="90 % MSCI World, 10 % petites capitalisations américaines (RS2K, Russell 2000)."
                return_={presetHistoricalReturn("world-smallcap-90-10")}
              />
            </div>
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              Moyenne pondérée des rendements annualisés des indices de
              référence, en euros, avant frais des ETF, {P} (sources
              ci-dessous). Un ordre de grandeur, pas le rendement réel de ces
              portefeuilles ni une prévision : les performances passées ne
              préjugent pas des performances futures.
            </p>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Questions fréquentes
            </h2>
            <div className="space-y-3">
              {FAQ.map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-2xl border border-slate-200/70 bg-white shadow-card overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-slate-50 transition-colors list-none">
                    {q}
                    <span className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                      ▾
                    </span>
                  </summary>
                  <div className="px-5 pb-4 pt-1 text-sm text-gray-700 leading-relaxed border-t border-gray-50">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Internal linking */}
          <div data-nosearch="" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/simulateur"
              className="group rounded-2xl border border-slate-200/70 bg-white p-5 hover:border-primary-200 transition-colors"
            >
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
                Étape suivante
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                Simuler le DCA en détail →
              </p>
              <p className="text-sm text-gray-600">
                Une fois votre allocation choisie, projetez sur 30 ans avec
                3 scénarios.
              </p>
            </Link>
            <Link
              href="/calculateur-fiscal-pea-cto"
              className="group rounded-2xl border border-slate-200/70 bg-white p-5 hover:border-primary-200 transition-colors"
            >
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
                Pour aller plus loin
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                Calculateur fiscal PEA vs CTO →
              </p>
              <p className="text-sm text-gray-600">
                Comparez l&apos;impôt selon le compte que vous choisissez.
              </p>
            </Link>
          </div>

          <SourcesReferences
            sources={SOURCES}
            intro="Les rendements historiques de l'outil et les chiffres de cette page viennent de ces sources ; chacune permet de vérifier le chiffre cité."
          />

          <Disclaimer />
        </section>
      </div>
    </div>
  );
}

// ─── Sub-component for the preset cards in the SEO content section ──────────

function PresetCard({
  title,
  description,
  return_,
}: {
  title: string;
  description: string;
  return_: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5">
      <p className="font-semibold text-gray-900 mb-1">{title}</p>
      <p className="text-xs text-gray-600 leading-relaxed mb-3">{description}</p>
      <div className="flex items-baseline justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-gray-500">
          Moyenne historique des indices
        </span>
        <span className="text-sm font-bold text-primary-700 tabular-nums">
          {return_}
        </span>
      </div>
    </div>
  );
}

// ─── Sources ─────────────────────────────────────────────────────────────────
//
// Les sept premières viennent de REGION_RETURN_SOURCES (une par région) ; les
// suivantes appuient les autres chiffres de la page.

const SOURCES: SourceItem[] = [
  ...Object.values(REGION_RETURN_SOURCES)
    .filter((src) => src.sourced)
    .map((src) => ({
      label: src.sourceName,
      url: src.sourceUrl,
      publisher: src.sourceUrl.includes("ecb.europa.eu")
        ? "Banque centrale européenne"
        : "MSCI",
      note: `${src.referenceIndex.charAt(0).toUpperCase()}${src.referenceIndex.slice(1)} : ${src.annualizedPct.toFixed(2).replace(".", ",")}\u00a0%/an ${src.period}, en euros, rendement ${src.returnType} (${src.method === "publie" ? "chiffre publié" : "calcul DCA Tracker"}) ; données au ${src.dataDate}.`,
    })),
  {
    label:
      "Calcul DCA Tracker — rendements annualisés sur 10 ans glissants, à partir des niveaux de fin de mois MSCI (EUR, net)",
    url: ROLLING_10Y_CALC.sourceUrl,
    publisher: "MSCI (niveaux) ; calcul DCA Tracker",
    note: `${ROLLING_10Y_CALC.windows} fenêtres de 10 ans comprises dans la période ${P}, départ de fin décembre 2000 à fin août 2016. MSCI World : de ${WORLD_10Y_RANGE.min} à ${WORLD_10Y_RANGE.max}/an selon le mois de départ. Même calcul pour les autres indices MSCI de l'outil (niveaux cités plus haut). Aucune fiche MSCI ne publie ces fourchettes.`,
  },
  {
    label:
      "Calcul DCA Tracker — MSCI USA et MSCI Emerging Markets, niveaux de fin de mois (EUR, net)",
    url: START_POINT_EXAMPLE.emergentsLevelsUrl,
    publisher: "MSCI (niveaux) ; calcul DCA Tracker",
    note: `Du ${START_POINT_EXAMPLE.from} au ${START_POINT_EXAMPLE.to} : MSCI USA ${signed(START_POINT_EXAMPLE.usaPct)}, MSCI Emerging Markets ${signed(START_POINT_EXAMPLE.emergentsPct)} (niveaux du MSCI USA : lien plus haut ; ce lien : MSCI Emerging Markets).`,
  },
  {
    label: SMALL_CAP_VS_USA_10Y.sourceName,
    url: SMALL_CAP_VS_USA_10Y.sourceUrl,
    publisher: "MSCI",
    note: `10 ans au ${SMALL_CAP_VS_USA_10Y.dataDate}, en dollars, rendement ${SMALL_CAP_VS_USA_10Y.returnType} : MSCI USA Small Cap ${pct2(SMALL_CAP_VS_USA_10Y.smallCapPct)}, MSCI USA ${pct2(SMALL_CAP_VS_USA_10Y.usaPct)}.`,
  },
  {
    label: "BCE — Data Portal, série EONIA (EON.D.EONIA_TO.RATE)",
    url: "https://data-api.ecb.europa.eu/service/data/EON/D.EONIA_TO.RATE",
    publisher: "Banque centrale européenne",
    note: "Taux au jour le jour utilisé jusqu'au 30/09/2019, avant l'€STR.",
  },
  {
    label: "MSCI — Index Factsheet MSCI World Index (USD)",
    url: "https://www.msci.com/documents/10199/255599/msci-world-index.pdf",
    publisher: "MSCI",
    note: "1 280 constituants, grandes et moyennes capitalisations de 23 pays développés ; données au 31/08/2026.",
  },
  {
    label: "MSCI — Index Factsheet MSCI Europe Index (EUR, net)",
    url: "https://www.msci.com/documents/10199/255599/msci-europe-index-eur-net.pdf",
    publisher: "MSCI",
    note: `Contrôle du calcul : ${tenYear(REGION_RETURN_SOURCES.europe)} sur 10 ans, reproduit ; données au ${REGION_RETURN_SOURCES.europe.dataDate}.`,
  },
  {
    label: "MSCI — Index Factsheet MSCI Japan Index (EUR, net)",
    url: "https://www.msci.com/resources/factsheets/index_fact_sheet/msci-japan-index-eur-net.pdf",
    publisher: "MSCI",
    note: `Contrôle du calcul : ${tenYear(REGION_RETURN_SOURCES.japon)} sur 10 ans, reproduit ; données au ${REGION_RETURN_SOURCES.japon.dataDate}.`,
  },
  {
    label: "justETF — fiche Vanguard FTSE All-World UCITS ETF (VWCE)",
    url: "https://www.justetf.com/fr/etf-profile.html?isin=IE00BK5BQT80",
    publisher: "justETF",
    note: "3 759 positions au 31/08/2026.",
  },
];
