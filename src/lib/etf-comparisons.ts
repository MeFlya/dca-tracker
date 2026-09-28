// ETF vs ETF comparison data for /comparatif-etf/*.
// Static educational content. TER CW8/WPEA/DCAM re-vérifiés via fiches
// émetteurs lors de la création des pages indice.
//
// 28/09/2026 — tous les duels relus contre la table de vérité ETF (émetteurs
// d'un côté, justETF/Boursorama/Euronext de l'autre). Corrigé : ISIN et nom de
// WPEA (IE0006WW1TQ4 était un Xtrackers ex-USA hors PEA), ISIN de PSP5 (celui
// de PE500), ESE attribué à Amundi (c'est BNP Paribas), TER d'ESE 0,15 → 0,14 %,
// TER de VWCE 0,22 → 0,14 %, AEEM présenté comme éligible PEA (il ne l'est
// pas : c'est PAEEM), PSP5 dit « le moins cher » (SPEA est à 0,10 %), et les
// encours/liquidités/classements qu'aucune source n'étaye.

import { ecartFiscalEnviron, impotCTOEnviron, impotPEAEnviron } from "@/lib/impot-affiche";

// HYPOTHESES_COMPARATIFS : le versement mensuel des phrases ajoutées le
// 28/09/2026 est lu à la même source que le calcul, pas recopié à la main.
import { gainsBruts, HYPOTHESES_COMPARATIFS, capitalPour, coutFrais, ecartCapital, gainsPour } from "@/lib/ecart-frais";

/**
 * Mois de dernière revérification des TER et caractéristiques, format YYYY-MM.
 * Exporté et affiché publiquement — cf. commentaire de BROKERS_REVIEWED_ON.
 */
export const ETF_COMPARISONS_REVIEWED_ON = "2026-09";

// Couverture du MSCI World : « ~1 500 sociétés » corrigé en « ~1 300 » le
// 28/09/2026 (14 occurrences). Source : fiche MSCI World Index (msci.com,
// consultée ce jour) — 1 280 constituants, 23 pays développés. Le nombre bouge
// à chaque revue trimestrielle, d'où l'arrondi.
// Performance figures are approximate — always verify on live data sources
// before investment decisions.

export type ETFSide = {
  heading: string;             // "MSCI World" / "CW8 (Amundi MSCI World)"
  subheading?: string;         // small subtitle, e.g. the ISIN or issuer
  type: "Indice" | "ETF";
  coverage: string;            // scope of the index/ETF
  issuer?: string;             // ETF-only
  ter: string;                 // annual fees
  replication?: string;        // "Physique" | "Synthétique"
  distribution?: string;       // "Capitalisant" | "Distribuant"
  currency?: string;           // "USD" | "EUR"
  peaEligible: string; // "Oui", "Non", or nuanced ("Oui (via synthétique)")
  strongPoint: string;         // headline pro
  weakPoint: string;           // headline con
};

/**
 * TER d'un côté en nombre, ou null s'il n'est pas exploitable.
 *
 * Volontairement STRICT : n'accepte que la forme exacte « 0,20 %/an ». Les
 * pages qui opposent deux INDICES écrivent « WPEA, DCAM : 0,20 % · CW8 :
 * 0,38 % » — plusieurs produits, pas le TER d'un seul. Une regex permissive du
 * type /(\d+,\d+)\s*%/ en tirerait 0,20 et préremplirait un simulateur avec le
 * TER d'un ETF que la page ne compare pas. Ici, un format inattendu renvoie
 * null et l'appelant retombe sur un comportement générique — jamais sur un
 * chiffre deviné.
 */
export function terNumerique(side: ETFSide): number | null {
  const m = /^(\d+),(\d{1,2}) %\/an$/.exec(side.ter.trim());
  if (!m) return null;
  return Number(`${m[1]}.${m[2]}`);
}

/** Le TER le plus bas du duel, quand les DEUX côtés sont exploitables. */
export function terLePlusBas(c: ETFComparison): number | null {
  const g = terNumerique(c.left);
  const d = terNumerique(c.right);
  return g == null || d == null ? null : Math.min(g, d);
}

export type UseCase = {
  profile: string;             // short persona label
  winner: "left" | "right" | "both";
  explanation: string;
};

export type ETFComparison = {
  slug: string;
  left: ETFSide;
  right: ETFSide;
  title: string;               // H1
  metaTitle: string;
  metaDescription: string;
  /**
   * Dates ISO affichées publiquement par ArticleByline et émises en
   * datePublished / dateModified.
   *
   * ⚠️ CE SONT DES AFFIRMATIONS FACTUELLES, pas un levier de référencement.
   * Elles ont été relevées dans l'historique git, duel par duel : date du
   * commit qui a introduit le slug pour `publishedAt`, date du dernier commit
   * ayant réellement modifié CE bloc pour `updatedAt` — pas la date du dernier
   * commit touchant le fichier, qui les daterait toutes du même jour et serait
   * faux pour sept d'entre elles.
   *
   * Antidote au réflexe : quand on met une page à jour, on bouge `updatedAt`.
   * Quand on ne la met PAS à jour, on n'y touche pas. Une date de fraîcheur
   * mensongère est un chiffre inventé, et ce site n'en publie pas.
   * `node scripts/verifier-dates-comparatifs.mjs` compare ces valeurs à git.
   */
  publishedAt: string;
  updatedAt: string;
  verdict: string;              // 2-sentence verdict
  intro: string;                // 1-paragraph intro
  keyDifferences: { criterion: string; leftValue: string; rightValue: string }[];
  useCases: UseCase[];
  analysis: string;             // longer prose analysis
  faq: { q: string; a: string }[];
  tags: string[];               // e.g. ["PEA", "débutant"]
};

// ─── MSCI World vs S&P 500 ────────────────────────────────────────────────────

const MSCI_WORLD_VS_SP500: ETFComparison = {
  slug: "msci-world-vs-sp500",
  publishedAt: "2026-04-19",
  updatedAt: "2026-09-28",
  title: "MSCI World vs S&P 500 : quel indice pour votre DCA ?",
  metaTitle: "MSCI World ou S&P 500 : lequel pour un DCA en ETF ?",
  metaDescription:
    "MSCI World ou S&P 500 ? Comparaison détaillée : couverture, TER, PEA, performance historique, profil d'investisseur. Guide clair pour choisir en 2026.",

  left: {
    heading: "MSCI World",
    subheading: "Indice des marchés développés",
    type: "Indice",
    coverage: "~1 300 sociétés sur 23 pays développés",
    // Était « ETF à partir de 0,12 % (EWLD, WPEA) » : EWLD est à 0,38 % et
    // WPEA à 0,20 % (table de vérité ETF, 28/09/2026). Aucun des deux à 0,12 %.
    ter: "WPEA, DCAM : 0,20 % · CW8 : 0,38 %",
    peaEligible: "Oui",
    strongPoint: "Diversification mondiale automatique",
    weakPoint: "Pas d'exposition aux marchés émergents",
  },

  right: {
    heading: "S&P 500",
    subheading: "Indice des 500 plus grandes capitalisations américaines",
    type: "Indice",
    coverage: "500 plus grandes sociétés cotées aux États-Unis",
    // « À partir de 0,07 % » citait CSPX et VUSA, tous deux HORS PEA, sur une
    // page dont la question est le PEA. On donne les deux enveloppes (28/09/2026).
    ter: "PEA : SPEA 0,10 %, PSP5 0,12 % · CTO : CSPX 0,07 %",
    peaEligible: "Oui (via ETF synthétiques : PSP5, SPEA, ESE)",
    strongPoint: "Frais plus bas · performance historique forte",
    weakPoint: "Concentration sur un seul pays",
  },

  verdict:
    "MSCI World pour la diversification mondiale automatique. S&P 500 pour la concentration US ciblée avec des frais plus bas. Attention : le MSCI World est déjà composé à ~70 % d'actions américaines — la différence réelle est souvent plus faible qu'on ne l'imagine.",

  intro:
    "MSCI World et S&P 500 sont les deux indices les plus utilisés pour un DCA en ETF. Ils sont souvent présentés comme opposés alors qu'ils se chevauchent largement : le MSCI World contient environ 70 % d'actions américaines, la quasi-totalité de la composition du S&P 500 s'y retrouve. Comprendre cette nuance est la clé du choix.",

  keyDifferences: [
    { criterion: "Nombre de sociétés", leftValue: "~1 500", rightValue: "500" },
    { criterion: "Couverture géographique", leftValue: "23 pays développés", rightValue: "États-Unis uniquement" },
    { criterion: "Poids des États-Unis", leftValue: "~70 %", rightValue: "100 %" },
    // Fourchettes recalées sur les ETF de la table de vérité (28/09/2026) :
    // MSCI World de 0,20 % (WPEA, DCAM, IWDA) à 0,38 % (CW8, EWLD) — l'ancien
    // « 0,12 % » ne correspondait à aucun ETF cité ; S&P 500 de 0,07 % (CSPX,
    // VUSA) à 0,15 % (Amundi S&P 500, hors PEA).
    { criterion: "TER typique", leftValue: "0,20 à 0,38 %", rightValue: "0,07 à 0,15 %" },
    { criterion: "Éligibilité PEA", leftValue: "Oui (ex : WPEA, DCAM, CW8)", rightValue: "Oui (ex : PSP5, SPEA, ESE)" },
    { criterion: "Performance 10 ans", leftValue: "~9-11 %/an brut", rightValue: "~11-13 %/an brut" },
    { criterion: "Volatilité", leftValue: "Légèrement inférieure (diversification)", rightValue: "Légèrement supérieure (concentration)" },
  ],

  useCases: [
    {
      profile: "Débutant voulant la simplicité maximale",
      winner: "left",
      explanation:
        "Un seul ETF MSCI World couvre l'exposition mondiale avec un bon équilibre. Pas besoin de se poser la question 'faut-il ajouter de l'Europe ou du Japon ?' — c'est déjà inclus.",
    },
    {
      profile: "Investisseur convaincu de la domination US long-terme",
      winner: "right",
      explanation:
        "Si vous pensez que les États-Unis continueront à surperformer, un S&P 500 seul est plus cohérent et moins cher. Les 70 % d'US dans le MSCI World sont déjà présents — choisir le S&P 500 pur est un pari assumé.",
    },
    {
      profile: "Budget très serré (sensibilité TER)",
      winner: "right",
      explanation:
        // Les fourchettes étaient fausses (« 0,12 %–0,40 % » côté MSCI World) et
        // « 5-7 % de capital final » était une estimation à la main, non tirée
        // du moteur. Corrigé le 28/09/2026 : TER de la table, écart calculé.
        `Dans un PEA, les ETF S&P 500 les moins chers de notre sélection coûtent moins que les MSCI World : SPEA à 0,10 % et PSP5 à 0,12 %, contre 0,20 % pour WPEA et DCAM (le PE500, variante « Screened », est à 0,25 %). Ce 0,10 point d'écart vaut environ ${ecartCapital(0.2, 0.1)} € de capital final sur 20 ans à ${HYPOTHESES_COMPARATIFS.monthlyAmount} €/mois et 7 %/an.`,
    },
    {
      profile: "Peur de la concentration géographique",
      winner: "left",
      explanation:
        // Citait AEEM, qui n'est PAS éligible au PEA (reporting Amundi 31/08/2026).
        // L'équivalent PEA est PAEEM — table de vérité ETF, 28/09/2026.
        "Le MSCI World reste très exposé aux US (~70 %), mais intègre aussi Japon, Royaume-Uni, France, Allemagne, Suisse, Canada, Australie. Ajouter un ETF émergents en complément est souvent la stratégie de diversification finale — PAEEM dans un PEA ; AEEM, lui, n'y est pas éligible.",
    },
  ],

  analysis:
    "Sur la dernière décennie, le S&P 500 a surperformé le MSCI World d'environ 1-2 % par an en moyenne, principalement grâce à la performance exceptionnelle des grandes tech américaines (Apple, Microsoft, Nvidia, etc.). Cela ne garantit rien pour l'avenir — les décennies précédentes (années 1970-2000) ont parfois vu l'Europe et le Japon surperformer les États-Unis. Le MSCI World est un hedge naturel contre ce risque de rotation géographique : vous captez la surperformance US quand elle est là, sans être 100 % exposé si elle s'inverse. Pour la majorité des investisseurs DCA long-terme, un MSCI World simple suffit et libère du cerveau. Ceux qui ont une conviction forte ajoutent une surpondération (S&P 500, émergents, small caps) en complément.",

  faq: [
    {
      q: "Peut-on combiner MSCI World et S&P 500 dans son portefeuille ?",
      a: "Techniquement oui, mais l'utilité est limitée — le MSCI World contient déjà ~70 % de S&P 500. Ajouter un S&P 500 à côté d'un MSCI World revient à surpondérer les États-Unis, ce qui peut être une stratégie assumée (double-down sur les US) mais pas une vraie diversification. Mieux vaut choisir l'un ou l'autre, ou ajouter des marchés émergents si on veut diversifier.",
    },
    {
      q: "Quel est le meilleur ETF MSCI World éligible PEA ?",
      // Réponse réécrite le 28/09/2026 (table de vérité ETF). Faux : le nom de
      // WPEA (« iShares Core MSCI World » est IWDA, hors PEA) ; EWLD « à TER
      // compétitif » alors qu'il est à 0,38 %, comme CW8 dont il est la part
      // distribuante. Retirés faute de source : « le plus connu », « encours
      // important », « disponible partout ».
      a: "Dans notre sélection, deux ETF sont les moins chers : WPEA (iShares MSCI World Swap PEA, lancé en 2024) et DCAM (Amundi PEA Monde, lancé en 2025), tous deux à 0,20 % de TER. CW8 (Amundi MSCI World Swap), la ligne historique, coûte 0,38 %. EWLD est la part distribuante du même fonds que CW8, au même TER de 0,38 %. Les quatre répliquent le MSCI World ; à indice identique, le TER et les frais d'ordre de votre courtier font la différence.",
    },
    {
      q: "Peut-on avoir un ETF S&P 500 dans un PEA ?",
      // Faux jusqu'au 28/09/2026 (table de vérité ETF) : ESE est édité par BNP
      // Paribas, pas Amundi, et son TER est de 0,14 % ; PE500 est un Amundi (pas
      // BNP Paribas), à 0,25 %, et il réplique un S&P 500 filtré ESG, pas le
      // S&P 500. « Les plus connus » : classement sans source, retiré.
      a: "Oui, via des ETF synthétiques qui répliquent le S&P 500 avec un swap. Dans notre sélection : SPEA (iShares) à 0,10 % de TER, PSP5 (Amundi) à 0,12 % et ESE (BNP Paribas Easy) à 0,14 %. PE500 (Amundi) est aussi éligible, mais il suit une version filtrée ESG du S&P 500 et coûte 0,25 %. Les ETF S&P 500 physiques libellés en USD (CSPX, VUSA) ne sont pas éligibles PEA : ils se logent en compte-titres.",
    },
    {
      q: "Un seul ETF suffit-il vraiment pour toute une vie d'investissement ?",
      // « Pour 90 % des investisseurs » et « bat statistiquement la grande
      // majorité des portefeuilles » retirés le 28/09/2026 : aucune source.
      a: "Pour la plupart des épargnants, oui. Un ETF MSCI World maintenu 20 ou 30 ans dans un PEA fait déjà l'essentiel : ~1 300 entreprises de 23 pays, des frais bas, rien à arbitrer. Chaque ligne ajoutée apporte surtout des occasions de se tromper — doublons, rééquilibrages oubliés, paris sectoriels.",
    },
  ],

  tags: ["PEA", "MSCI World", "S&P 500"],
};

// ─── CW8 vs ESE ───────────────────────────────────────────────────────────────

const CW8_VS_ESE: ETFComparison = {
  slug: "cw8-vs-ese",
  publishedAt: "2026-04-19",
  updatedAt: "2026-09-28",
  title: "CW8 vs ESE : quel ETF pour votre PEA ?",
  // 28/09/2026 — le titre et la meta affirmaient « les deux ETF PEA les plus
  // populaires / les plus utilisés en France » (classement sans source) et
  // attribuaient ESE à Amundi : il est édité par BNP Paribas (table de vérité).
  metaTitle: "CW8 ou ESE : MSCI World ou S&P 500 dans votre PEA ?",
  metaDescription:
    "CW8 (Amundi MSCI World) ou ESE (BNP Paribas S&P 500) ? Deux ETF PEA comparés : TER 0,38 % contre 0,14 %, couverture, diversification, performance.",

  left: {
    heading: "CW8",
    subheading: "Amundi MSCI World Swap UCITS ETF EUR Acc — ISIN LU1681043599",
    type: "ETF",
    coverage: "MSCI World — ~1 300 sociétés développées",
    issuer: "Amundi ETF",
    ter: "0,38 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Diversification mondiale dans un PEA",
    weakPoint: "TER élevé par rapport aux alternatives récentes",
  },

  right: {
    heading: "ESE",
    subheading: "BNP Paribas Easy S&P 500 UCITS ETF — ISIN FR0011550185",
    type: "ETF",
    coverage: "S&P 500 — 500 plus grandes capitalisations américaines",
    issuer: "BNP Paribas Easy",
    ter: "0,14 %/an", // était 0,15 % — 0,14 % d'après la table de vérité ETF (28/09/2026)
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "TER très bas · éligible PEA",
    weakPoint: "Exposition concentrée sur un seul pays",
  },

  verdict:
    // « Environ 5-7 % de capital final » était une estimation à la main : le
    // moteur donne un écart de l'ordre de 3 %. Remplacé par le montant calculé
    // (28/09/2026), avec le TER d'ESE corrigé.
    `ESE est moins cher (TER 0,14 % vs 0,38 %) et concentré sur les États-Unis. CW8 est plus diversifié mondialement mais plus cher. Sur 20 ans à ${HYPOTHESES_COMPARATIFS.monthlyAmount} €/mois et 7 %/an, l'écart de TER représente environ ${ecartCapital(0.38, 0.14)} € de capital final. Les deux sont capitalisants et éligibles PEA.`,

  intro:
    // « Tous deux édités par Amundi » : faux, ESE est un ETF BNP Paribas Easy.
    // « Les plus utilisés » : classement sans source. Corrigé le 28/09/2026.
    "CW8 et ESE sont deux ETF éligibles au PEA. L'un est édité par Amundi (CW8), l'autre par BNP Paribas (ESE) ; tous deux sont capitalisants et synthétiques. La différence tient à ce qu'ils répliquent : le monde développé (CW8) ou uniquement les États-Unis (ESE). Leur niveau de TER diffère aussi nettement.",

  keyDifferences: [
    { criterion: "Indice sous-jacent", leftValue: "MSCI World", rightValue: "S&P 500" },
    { criterion: "TER", leftValue: "0,38 %/an", rightValue: "0,14 %/an" },
    { criterion: "Émetteur", leftValue: "Amundi", rightValue: "BNP Paribas" },
    { criterion: "Nombre de lignes", leftValue: "~1 500", rightValue: "500" },
    { criterion: "Couverture géographique", leftValue: "23 pays développés", rightValue: "États-Unis" },
    { criterion: "Éligibilité PEA", leftValue: "Oui", rightValue: "Oui" },
    { criterion: "Politique de revenus", leftValue: "Capitalisant", rightValue: "Capitalisant" },
    { criterion: "Réplication", leftValue: "Synthétique", rightValue: "Synthétique" },
    { criterion: "Impact TER sur 20 ans (200 €/mois, 7 %)", leftValue: `${coutFrais(0.38)} €`, rightValue: `${coutFrais(0.14)} €` },
  ],

  useCases: [
    {
      profile: "Vous voulez un seul ETF pour toute votre vie",
      winner: "left",
      explanation:
        // « La position unique la plus diversifiée disponible en PEA » : faux
        // depuis GPEA (MSCI ACWI, émergents inclus, éligible PEA) — table de
        // vérité ETF, 28/09/2026. Et WPEA/DCAM font le même MSCI World moins cher.
        "Entre les deux, CW8 est de loin le plus diversifié : ~1 300 sociétés dans 23 pays, contre 500 sociétés américaines. Si vous cherchez la simplicité maximale et ne voulez plus toucher à votre portefeuille pendant 20-30 ans, c'est un choix solide — sachant que WPEA et DCAM répliquent le même MSCI World à 0,20 % au lieu de 0,38 %.",
    },
    {
      profile: "Vous êtes sensible aux frais cumulés",
      winner: "right",
      explanation:
        `Sur 20 ans à 200 €/mois, 0,24 % de TER en moins représente environ ${ecartCapital(0.38, 0.14)} € de capital final en plus. Si vous êtes à l'aise avec la concentration US (~70 % du CW8 de toute façon), ESE est le moins cher des deux. Dans un PEA, PSP5 (0,12 %) et SPEA (0,10 %) répliquent le même S&P 500 pour encore moins.`,
    },
    {
      profile: "Vous voulez combiner les deux",
      winner: "both",
      explanation:
        // Deux erreurs corrigées le 28/09/2026 : AEEM n'est PAS éligible au PEA
        // (l'équivalent PEA est PAEEM, table de vérité ETF) ; et un mix S&P 500 +
        // émergents n'est pas un « MSCI World + émergents » — il manque l'Europe
        // et le Japon.
        "Une approche courante : ESE comme cœur (70 %) + un ETF Europe (PCEU, 0,15 %) ou émergents (PAEEM, 0,30 %) pour diversifier (30 %), tous éligibles PEA. Les frais moyens restent sous les 0,38 % de CW8, mais ce mix n'est pas un MSCI World : ESE + PAEEM laisse de côté l'Europe et le Japon, ESE + PCEU notamment le Japon. Et il faut rééquilibrer à la main.",
    },
    {
      profile: "Vous débutez et n'avez pas d'avis tranché",
      winner: "left",
      explanation:
        "Entre les deux, CW8 est le pari le plus large : la diversification intrinsèque réduit le risque d'avoir fait 'le mauvais choix'. Vous pouvez toujours ajuster dans 2-3 ans si vous voulez. Le TER supplémentaire est le prix de la tranquillité d'esprit — un prix que WPEA et DCAM (même MSCI World, 0,20 %) ne font pas payer.",
    },
  ],

  analysis:
    "La question CW8 vs ESE se résume souvent à ça : êtes-vous OK avec l'hypothèse implicite du MSCI World (les US resteront dominants sans être absolument tout) ou voulez-vous parier clairement sur l'Amérique ? ESE est clairement un pari géographique. CW8 est un panier plus 'neutre'. Notons que de nouveaux ETF MSCI World éligibles PEA sont apparus avec des TER bien plus bas que CW8 : WPEA (iShares MSCI World Swap PEA UCITS ETF, lancé en 2024) et DCAM (Amundi PEA Monde, lancé en 2025), tous deux à 0,20 %. Si vous ouvrez votre PEA aujourd'hui, ils coûtent moins cher que CW8 pour la même exposition. CW8 reste pertinent pour les investisseurs déjà positionnés qui ne veulent pas disperser leur encours sur plusieurs lignes.",

  faq: [
    {
      q: "WPEA est-il meilleur que CW8 ?",
      // Nom de WPEA faux (« iShares Core MSCI World » est IWDA, hors PEA) et
      // « a plus d'encours » sans source sur l'encours de CW8. Corrigé le
      // 28/09/2026 d'après la table de vérité ETF.
      a: "WPEA (iShares MSCI World Swap PEA UCITS ETF EUR (Acc), ISIN IE0002XZSHO1) a un TER de 0,20 % contre 0,38 % pour CW8, tout en répliquant le même indice. Pour une nouvelle position, il coûte donc presque deux fois moins cher en frais annuels — tout comme DCAM, au même TER. CW8 reste la référence historique, mais son TER est son point faible.",
    },
    {
      q: "Les ETF synthétiques sont-ils risqués ?",
      a: "La réplication synthétique utilise un swap avec une contrepartie bancaire (souvent la maison-mère de l'émetteur). Le risque de contrepartie est réel mais encadré par la réglementation UCITS, qui limite l'exposition à 10 % et impose du collatéral. En pratique, les ETF synthétiques majeurs (ESE, CW8) n'ont jamais causé de pertes aux porteurs depuis leur création. Ce n'est pas un risque qu'il faut sur-pondérer dans la décision.",
    },
    {
      q: "Peut-on transférer des parts de CW8 vers ESE dans un PEA ?",
      a: "Non, il faut vendre puis racheter — mais à l'intérieur du PEA, les plus-values sont capitalisées sans friction fiscale tant que vous ne retirez pas de l'argent du PEA. Vous pouvez donc basculer d'un ETF à l'autre sans impact fiscal immédiat. Les frais d'ordre s'appliquent en revanche à chaque transaction.",
    },
    {
      q: "Quelle est la différence entre capitalisant et distribuant ?",
      a: "Un ETF capitalisant (comme CW8 et ESE) réinvestit automatiquement les dividendes dans l'ETF. Un distribuant verse les dividendes en cash sur votre compte. En PEA, le capitalisant est généralement préféré : pas d'imposition annuelle sur les dividendes, et l'effet intérêts composés est optimal.",
    },
  ],

  tags: ["PEA", "CW8", "ESE", "Amundi"],
};

// ─── VWCE vs CW8 ──────────────────────────────────────────────────────────────

const VWCE_VS_CW8: ETFComparison = {
  slug: "vwce-vs-cw8",
  publishedAt: "2026-04-19",
  updatedAt: "2026-09-28",
  title: "VWCE vs CW8 : FTSE All-World ou MSCI World ?",
  metaTitle: "VWCE ou CW8 : quel ETF mondial choisir selon votre compte",
  metaDescription:
    "VWCE (Vanguard FTSE All-World) ou CW8 (Amundi MSCI World) ? Comparatif des deux ETF mondiaux : émergents inclus, PEA, TER, performance. Guide 2026.",

  left: {
    heading: "VWCE",
    subheading: "Vanguard FTSE All-World UCITS ETF (USD) Accumulating — ISIN IE00BK5BQT80",
    type: "ETF",
    coverage: "FTSE All-World — ~3 700 sociétés (développés + émergents)",
    issuer: "Vanguard",
    // Était 0,22 % : périmé. 0,14 % d'après la table de vérité ETF (28/09/2026).
    // VWCE est donc NETTEMENT moins cher que CW8 — tout le texte a été relu.
    ter: "0,14 %/an",
    replication: "Physique (échantillonnée)",
    distribution: "Capitalisant",
    currency: "USD",
    peaEligible: "Non",
    strongPoint: "Diversification maximale (émergents inclus) · émetteur Vanguard",
    weakPoint: "Non éligible PEA · libellé en USD",
  },

  right: {
    heading: "CW8",
    subheading: "Amundi MSCI World Swap UCITS ETF EUR Acc — ISIN LU1681043599",
    type: "ETF",
    coverage: "MSCI World — ~1 300 sociétés développées uniquement",
    issuer: "Amundi",
    ter: "0,38 %/an",
    replication: "Synthétique",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Éligible PEA · bon véhicule fiscal en France",
    weakPoint: "Pas de marchés émergents · TER plus de deux fois supérieur (0,38 % vs 0,14 %)",
  },

  verdict:
    // « La plupart des investisseurs français… » : affirmation sans source,
    // retirée le 28/09/2026. Le TER de VWCE (0,14 %) est désormais chiffré.
    "Si vous investissez via un PEA, CW8 est le seul des deux qui y entre — VWCE n'y est pas éligible (et WPEA ou DCAM y répliquent le même MSCI World à 0,20 %). Sur un CTO, VWCE bat CW8 sur la diversification (émergents inclus) et sur le TER (0,14 % contre 0,38 %). Un schéma simple : le PEA d'abord avec un MSCI World éligible, puis VWCE sur un CTO en complément.",

  intro:
    "VWCE et CW8 sont tous deux des ETF 'monde' populaires, mais ils sont très différents : VWCE couvre marchés développés ET émergents (~3 700 sociétés), CW8 couvre uniquement les marchés développés (~1 300 sociétés). Et VWCE n'est pas éligible PEA. Le choix dépend donc avant tout de l'enveloppe fiscale.",

  keyDifferences: [
    { criterion: "Indice", leftValue: "FTSE All-World", rightValue: "MSCI World" },
    { criterion: "Marchés émergents", leftValue: "Oui (~10-12 %)", rightValue: "Non" },
    { criterion: "TER", leftValue: "0,14 %/an", rightValue: "0,38 %/an" },
    { criterion: "Éligibilité PEA", leftValue: "Non (CTO uniquement)", rightValue: "Oui" },
    { criterion: "Réplication", leftValue: "Physique échantillonnée", rightValue: "Synthétique" },
    { criterion: "Émetteur", leftValue: "Vanguard (réputation excellente)", rightValue: "Amundi" },
    { criterion: "Politique de revenus", leftValue: "Capitalisant", rightValue: "Capitalisant" },
    { criterion: "Devise", leftValue: "USD (couverture change non nécessaire)", rightValue: "EUR" },
  ],

  useCases: [
    {
      profile: "Vous débutez avec un PEA uniquement",
      winner: "right",
      explanation:
        // Avec le TER de VWCE corrigé (0,14 %), CW8 perd AUSSI sur les frais :
        // la phrase le dit désormais, chiffres du moteur à l'appui (28/09/2026).
        `CW8 est votre seule option réaliste entre les deux — VWCE n'est pas éligible PEA. Vous perdez l'exposition émergents et vous payez plus de frais (0,38 % contre 0,14 %, soit environ ${ecartCapital(0.38, 0.14)} € sur 20 ans à ${HYPOTHESES_COMPARATIFS.monthlyAmount} €/mois), mais vous gagnez le bénéfice fiscal du PEA (18,6 % vs 31,4 % à la sortie), qui pèse environ ${ecartFiscalEnviron(gainsBruts(0.38))} € sur la même période. L'avantage fiscal l'emporte.`,
    },
    {
      profile: "Vous investissez sur un CTO",
      winner: "left",
      explanation:
        "Sur un CTO, VWCE est généralement préférable : TER bien plus bas (0,14 % vs 0,38 %), diversification plus large (émergents inclus), et Vanguard a une réputation solide en tant qu'émetteur. Le fait qu'il soit en USD n'est pas un problème — le risque de change est plutôt un bénéfice diversifiant.",
    },
    {
      profile: "Vous combinez PEA + CTO",
      winner: "both",
      explanation:
        "Stratégie optimale : saturer le PEA avec CW8 ou WPEA (150 000 € de versements), puis ouvrir un CTO avec VWCE pour les versements supplémentaires. Vous bénéficiez de la fiscalité PEA tant que possible, et de la diversification émergents via VWCE au-delà.",
    },
    {
      profile: "Vous voulez la diversification maximale possible",
      winner: "left",
      explanation:
        // « Le plus diversifié des ETF monde » : classement sans source, et le
        // PEA a désormais son ETF monde entier, GPEA (table de vérité ETF,
        // 28/09/2026). Réécrit sans superlatif.
        "Des deux, VWCE est le plus diversifié : ~3 700 sociétés, 49 pays, développés + émergents, en un seul ticker. Dans un PEA, l'équivalent le plus proche est GPEA (Amundi PEA Global, indice MSCI ACWI, émergents inclus, 0,30 %), créé en juillet 2026.",
    },
  ],

  analysis:
    "Le vrai débat VWCE vs CW8 n'existe que si vous avez un CTO ouvert ou si vous saturez votre PEA. Pour la majorité des investisseurs français en phase d'accumulation, le PEA est prioritaire (fiscalité bien meilleure après 5 ans), donc CW8 ou WPEA gagnent par défaut. La question devient intéressante quand on dépasse le plafond PEA (150 000 € de versements — atteint en 62 ans à 200 €/mois, mais en 12 ans à 1 000 €/mois). Si vous pensez dépasser ce plafond dans votre horizon d'investissement, VWCE est une excellente option pour prolonger sur CTO. À noter : l'exposition émergents (~10 % du VWCE) ajoute un petit gain de diversification mais aussi de volatilité — les marchés émergents ont historiquement sous-performé les développés sur les 10 dernières années.",

  faq: [
    {
      q: "VWCE est-il vraiment plus diversifié que CW8 ?",
      a: "Oui — le FTSE All-World couvre environ 3 700 sociétés sur 49 pays, contre environ 1 500 sur 23 pays pour le MSCI World. La différence vient principalement des marchés émergents (~10-12 % du VWCE) : Chine, Inde, Taïwan, Corée du Sud, Brésil, etc. Ces pays ne sont pas inclus dans le MSCI World.",
    },
    {
      q: "Pourquoi VWCE n'est-il pas éligible PEA ?",
      a: "Un ETF est éligible au PEA s'il détient au moins 75 % d'actions de sociétés européennes. VWCE est physique et détient réellement des actions majoritairement non européennes (notamment américaines) : il ne remplit pas le critère. CW8 le remplit autrement : il détient un panier d'actions européennes et échange sa performance, par un swap, contre celle du MSCI World. Mais être synthétique ne suffit pas — les ETF S&P 500, Nasdaq-100 et émergents « Swap » d'Amundi (500, ANX, AEEM) le sont aussi, et ne sont pas éligibles.",
    },
    {
      q: "Faut-il avoir peur du risque de change avec VWCE ?",
      a: "VWCE est libellé en USD mais peut se négocier en EUR selon la bourse. Le risque de change existe à court terme mais il est neutre sur le long terme : les devises fluctuent autour de leur juste valeur. Sur 20 ans, l'effet moyen du change est proche de zéro, et vous êtes déjà exposé au dollar via les entreprises américaines dans le MSCI World. Ne pas s'en soucier pour un DCA long-terme.",
    },
    {
      q: "Peut-on acheter VWCE chez Trade Republic / Boursorama / Fortuneo ?",
      a: "Oui, VWCE est disponible chez la quasi-totalité des courtiers européens. Chez Trade Republic, il est dans le catalogue d'épargne programmée gratuite (0 € de frais par versement). Chez Boursorama et Fortuneo, frais d'ordre standards s'appliquent.",
    },
  ],

  tags: ["CTO", "VWCE", "CW8", "Vanguard"],
};

// ─── CW8 vs WPEA ──────────────────────────────────────────────────────────────
// Requête GSC captée : 15 impressions/mois, 0 clic. Capter ce trafic latent.
// WPEA = iShares MSCI World Swap PEA UCITS ETF EUR (Acc), ISIN IE0002XZSHO1,
// lancé le 26/03/2024 et coté à Paris le 03/04/2024 — alternative récente au
// CW8 historique d'Amundi, avec un TER presque deux fois plus bas.
//
// ⚠️ CORRIGÉ LE 28/09/2026 (table de vérité ETF) : la fiche donnait à WPEA
// l'ISIN IE0006WW1TQ4 — celui d'un Xtrackers MSCI World ex USA, NON éligible
// au PEA —, le nom « iShares Core MSCI World » (c'est IWDA, hors PEA) et un
// lancement « fin 2024 » (c'est mars 2024). Retirés faute de source : encours
// et liquidité de CW8, « leader mondial », « présent chez tous les courtiers ».

const CW8_VS_WPEA: ETFComparison = {
  slug: "cw8-vs-wpea",
  publishedAt: "2026-05-25",
  updatedAt: "2026-09-28",
  title: "CW8 vs WPEA : quel ETF MSCI World pour votre PEA ?",
  // Le titre portait « (vs DCAM) » pour couvrir la SERP 3-way (audit 07/2026).
  // Retiré : le CTR mesuré était de 0,5 %, DCAM a sa propre page, et la
  // parenthèse diluait le match principal — qui est aussi la requête la plus
  // volumineuse du site. L'intent DCAM reste couvert par la meta, qui n'a pas
  // la même contrainte de longueur.
  // « sauf dans deux cas précis » n'est pas une accroche : la page contient
  // exactement deux profils où CW8 l'emporte (encours CW8 existant, recherche
  // de simplicité). Si un troisième est ajouté, corriger ce titre.
  metaTitle: "CW8 vs WPEA : WPEA gagne, sauf dans deux cas précis",
  metaDescription:
    `WPEA à 0,20 % bat CW8 à 0,38 % : ~${ecartCapital(0.38, 0.2)} € d'écart sur 20 ans à 200 €/mois. Les deux cas où garder CW8, et où se place DCAM.`,

  left: {
    heading: "CW8",
    subheading: "Amundi MSCI World Swap UCITS ETF EUR Acc — ISIN LU1681043599",
    type: "ETF",
    coverage: "MSCI World — ~1 300 sociétés des 23 pays développés",
    issuer: "Amundi ETF",
    ter: "0,38 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Référence historique du MSCI World en PEA · la ligne la plus ancienne des trois (face à WPEA et DCAM)",
    weakPoint: "TER de 0,38 % — près du double de WPEA et DCAM (0,20 %)",
  },

  right: {
    heading: "WPEA",
    subheading: "iShares MSCI World Swap PEA UCITS ETF EUR (Acc) — ISIN IE0002XZSHO1",
    type: "ETF",
    coverage: "MSCI World — ~1 300 sociétés des 23 pays développés",
    issuer: "iShares (BlackRock)",
    ter: "0,20 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "TER presque deux fois inférieur au CW8 · ≈ 2,1 Md€ d'encours fin août 2026",
    weakPoint: "ETF récent (lancé en mars 2024) — historique plus court que CW8",
  },

  verdict:
    `WPEA gagne sur les frais (0,20 % vs 0,38 %) pour la même exposition MSCI World et la même éligibilité PEA. Sur 20 ans à 200 €/mois et 7 %/an net, ces 0,18 % de TER en moins représentent environ ${ecartCapital(0.38, 0.2)} € de capital final supplémentaire. CW8 garde l'avantage de l'antériorité. Pour une ouverture de position en 2026, WPEA — comme DCAM, au même TER — coûte moins cher que CW8 pour une exposition identique.`,

  intro:
    "Pendant des années, CW8 (Amundi MSCI World) a été l'ETF de référence pour s'exposer au monde développé dans un PEA français. En mars 2024, iShares a lancé WPEA — un MSCI World éligible au PEA, coté à Paris depuis avril 2024, à un TER presque deux fois plus bas. Deux ETF qui répliquent le même indice, avec des frais qui changent significativement la performance à long terme. Voici comment trancher.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "MSCI World", rightValue: "MSCI World (identique)" },
    { criterion: "Émetteur", leftValue: "Amundi", rightValue: "iShares (BlackRock)" },
    { criterion: "TER", leftValue: "0,38 %/an", rightValue: "0,20 %/an" },
    // Les lignes « Encours » et « Liquidité » comparaient CW8 et WPEA sans
    // aucune source pour CW8 ; retirées le 28/09/2026. L'ISIN, lui, est vérifié.
    { criterion: "ISIN", leftValue: "LU1681043599", rightValue: "IE0002XZSHO1" },
    { criterion: "Éligibilité PEA", leftValue: "Oui", rightValue: "Oui" },
    { criterion: "Réplication", leftValue: "Synthétique", rightValue: "Synthétique" },
    { criterion: "Distribution", leftValue: "Capitalisant", rightValue: "Capitalisant" },
    { criterion: "Impact TER sur 20 ans (200 €/mois, 7 %)", leftValue: `${coutFrais(0.38)} €`, rightValue: `${coutFrais(0.2)} €` },
  ],

  useCases: [
    {
      profile: "Vous ouvrez votre PEA en 2026",
      winner: "right",
      explanation:
        "WPEA coûte moins cher pour la même chose : même indice, près de la moitié des frais — DCAM aussi, au même TER. Sur un horizon 20-30 ans, l'écart de TER se traduit directement en capital final. L'argument de la liquidité compte peu pour un investisseur DCA long terme qui passe des ordres mensuels de quelques centaines d'euros.",
    },
    {
      profile: "Vous avez déjà du CW8 dans votre PEA",
      winner: "left",
      explanation:
        "Inutile de tout basculer dans la précipitation. Vous pouvez arrêter d'alimenter CW8 et orienter vos versements suivants vers WPEA — votre encours CW8 historique continue de capitaliser. Bascule complète seulement si vous avez peu de plus-values latentes (les frais d'ordre pour vendre + racheter peuvent dépasser l'économie de TER sur petits montants).",
    },
    {
      profile: "Vous valorisez la simplicité maximale",
      winner: "left",
      explanation:
        // « Se trouve partout, disponible chez tous les courtiers » : aucune
        // source ; retiré le 28/09/2026. Le cas d'usage reste : c'est le
        // catalogue du courtier qui tranche.
        "CW8 est la plus ancienne des lignes MSCI World du PEA citées ici. Si votre courtier ne propose ni WPEA ni DCAM, ou les facture plus cher à l'ordre, CW8 fonctionne : même indice, même éligibilité. C'est un compromis confort/coût.",
    },
    {
      profile: "Vous êtes pure performance",
      winner: "right",
      explanation:
        "TER plus bas + même indice = surperformance mécanique sur le long terme. iShares est aussi un émetteur de référence (filiale de BlackRock). Aucune raison rationnelle de payer 90 % de frais en plus pour exactement la même exposition.",
    },
  ],

  analysis:
    `Avant 2024, les ETF MSCI World éligibles au PEA étaient ceux d'Amundi, CW8 et sa part distribuante EWLD, à 0,38 %. iShares a lancé WPEA en 2024 sur exactement le même indice, à 0,20 % — et Amundi a lancé DCAM en mars 2025 au même tarif. Pour qui démarre aujourd'hui, le calcul est net : 0,18 % de TER en moins par an, ça représente environ ${ecartCapital(0.38, 0.2)} € de capital final en plus sur 20 ans (à 7 %/an, aux hypothèses du tableau). Pour qui a déjà construit une position CW8 significative, la question est plus nuancée : vendre génère des frais d'ordre + casse l'historique de la ligne — pas critique en PEA (zéro friction fiscale tant qu'on ne retire pas) mais demande un calcul cas par cas. La règle de pouce : si votre encours CW8 est < 10 000 €, basculer reste avantageux long terme. Au-delà, garder CW8 et alimenter WPEA pour les versements futurs.`,

  faq: [
    {
      q: "WPEA est-il vraiment équivalent à CW8 ?",
      a: "Oui, sur l'exposition : même indice MSCI World, même couverture (~1 300 sociétés, 23 pays développés), même politique capitalisante, même éligibilité PEA via réplication synthétique. La seule vraie différence est le TER (0,20 % vs 0,38 %) et l'émetteur (iShares vs Amundi). En termes de risque sous-jacent, ils sont substituables.",
    },
    {
      q: "Pourquoi WPEA est-il moins cher que CW8 ?",
      // « Le plus gros gestionnaire d'ETF au monde » : classement sans source,
      // retiré le 28/09/2026.
      a: "Parce qu'il est arrivé face à des concurrents installés : iShares l'a lancé en 2024 à 0,20 %, contre 0,38 % pour les ETF MSCI World éligibles PEA d'Amundi (CW8, EWLD). Amundi a ensuite lancé DCAM, en mars 2025, au même TER de 0,20 %. Avantage pour les investisseurs particuliers.",
    },
    {
      q: "WPEA est-il disponible chez tous les courtiers ?",
      // La liste de courtiers n'avait pas de source ; retirée le 28/09/2026.
      a: "WPEA est coté sur Euronext Paris depuis avril 2024, mais sa présence dépend du catalogue de chaque courtier. À vérifier avant d'ouvrir la position — certaines banques traditionnelles tardent à référencer les ETF récents —, en contrôlant l'ISIN dans l'écran d'ordre : IE0002XZSHO1. Si non disponible, demandez-le au service client : la pression utilisateur fait souvent débloquer.",
    },
    {
      q: "Le risque de contrepartie est-il identique entre CW8 et WPEA ?",
      a: "Les deux utilisent une réplication synthétique par swap. Le risque de contrepartie est encadré par la réglementation UCITS (limite à 10 % de l'actif net) et collatéralisé. En pratique, ni Amundi ni iShares n'ont causé de pertes de ce type à leurs porteurs. Le risque est équivalent et négligeable pour un investisseur particulier.",
    },
    {
      q: "Vaut-il le coup de vendre mon CW8 pour racheter du WPEA ?",
      a: "Cela dépend de votre encours et de votre horizon. Sous 10 000 € d'encours CW8 + horizon 15+ ans : oui, l'économie de TER cumulée justifie la bascule (en PEA, la vente n'a aucun coût fiscal). Au-dessus de 10 000 € ou horizon < 10 ans : pas urgent, vous pouvez simplement orienter vos versements futurs vers WPEA et laisser CW8 capitaliser de son côté.",
    },
    {
      q: "Et DCAM dans tout ça ?",
      // Cette réponse tranchait le duel WPEA/DCAM — qui a sa propre page.
      // Mesuré sur 90 jours : cette page captait 60 impressions sur les
      // requêtes « dcam vs wpea » / « wpea vs dcam » / « wpea ou dcam », que
      // /comparatif-etf/wpea-vs-dcam sert mieux (position 6,6 contre 8,3).
      // La cannibalisation était RÉCIPROQUE, pas subie : on rend ce qu'on
      // prenait avant de réclamer ce qu'on nous prend.
      a: "DCAM joue dans la même catégorie que WPEA — même TER de 0,20 %, même réplication synthétique, même éligibilité PEA — et le départager demande d'entrer dans le détail de l'encours et de la disponibilité chez les courtiers. C'est le sujet de notre comparatif WPEA vs DCAM, qui tranche la question. Pour ce qui nous occupe ici, retenez que les deux battent CW8 sur les frais.",
    }
  ],

  tags: ["PEA", "CW8", "WPEA", "DCAM", "MSCI World", "iShares", "Amundi"],
};

// ─── Registry ─────────────────────────────────────────────────────────────────

// ─── WPEA vs DCAM ─────────────────────────────────────────────────────────────

// ⚠️ RÉÉCRIT LE 28/09/2026 — l'ancienne fiche reposait sur deux faits faux.
//
// 1. L'ISIN de WPEA était IE0006WW1TQ4, qui est celui du « Xtrackers MSCI World
//    ex USA UCITS ETF 1C », non éligible au PEA. Le vrai : IE0002XZSHO1.
// 2. Tout le verdict tenait sur le prix de part : « DCAM à ~5 € contre quelques
//    centaines d'euros pour WPEA ». Au 28/09/2026, WPEA cote ~7,07 € et DCAM
//    ~6,26 € (Boursorama ; VL émetteur 7,08 € au 25/09 et 6,16 € au 31/08). Les
//    deux sont sous 10 € : le prix de part ne départage rien.
//
// C'était la page n°1 du site (84 clics en 90 jours). Un lecteur qui recopiait
// l'ISIN achetait un autre fonds, hors PEA.
//
// Vérifié le 28/09/2026 par deux familles de sources indépendantes : pages et
// DIC des émetteurs (blackrock.com/fr, amundietf.fr) d'une part, justETF,
// Boursorama et Euronext d'autre part. Aucun cours précis n'est affiché dans la
// page : il se périmerait. Seul le seuil « sous 10 € » l'est, et il tient large.
const WPEA_VS_DCAM: ETFComparison = {
  slug: "wpea-vs-dcam",
  publishedAt: "2026-06-10",
  updatedAt: "2026-09-28",
  title: "WPEA vs DCAM : quel MSCI World à 0,20 % pour votre PEA ?",
  // Les deux formulations « vs » et « ou » sont recherchées : « ou » dans le
  // titre, « vs » conservé dans le H1 de la page (champ `title` ci-dessus).
  // Le metaTitle est CONSERVÉ : c'est celui de la page au meilleur CTR du site,
  // et il reste vrai — le détail qui décide n'est plus le prix de part, c'est
  // le courtier.
  metaTitle: "WPEA ou DCAM : égalité technique, un détail décide",
  metaDescription:
    "Même indice, même TER de 0,20 %, deux parts sous 10 € : le prix ne départage pas. Ce qui compte : encours, ancienneté, frais d'ordre de votre courtier.",

  left: {
    heading: "WPEA",
    subheading: "iShares MSCI World Swap PEA UCITS ETF EUR (Acc) — ISIN IE0002XZSHO1",
    type: "ETF",
    coverage: "MSCI World — ~1 300 sociétés des 23 pays développés",
    issuer: "iShares (BlackRock)",
    ter: "0,20 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Le plus ancien des deux (lancé en mars 2024) · le plus gros encours (≈ 2,1 Md€ fin août 2026)",
    weakPoint: "Aucun avantage de frais ni d'indice sur DCAM : l'écart est pratique, pas financier",
  },

  right: {
    heading: "DCAM",
    subheading: "Amundi PEA Monde (MSCI World) UCITS ETF Acc — ISIN FR001400U5Q4",
    type: "ETF",
    coverage: "MSCI World — ~1 300 sociétés des 23 pays développés",
    issuer: "Amundi",
    ter: "0,20 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "≈ 1,4 Md€ d'encours en dix-huit mois (fin août 2026) · fonds de droit français",
    weakPoint: "Le plus récent (mars 2025) — historique de réplication plus court",
  },

  verdict:
    "Égalité sur tout ce qui fait la performance : même indice MSCI World, même TER de 0,20 %, même réplication synthétique, même éligibilité PEA — et deux parts sous 10 €, donc aucune différence de souplesse pour un petit versement mensuel. Ce qui les sépare est secondaire : WPEA a un an d'historique de plus et un encours plus gros (≈ 2,1 Md€ contre ≈ 1,4 Md€ fin août 2026). Le vrai départage est chez votre courtier : prenez celui qu'il propose avec les frais d'ordre les plus bas, et gardez-le.",

  intro:
    "C'est le duel le plus récent du PEA : iShares a lancé WPEA en 2024, face aux ETF MSCI World d'Amundi facturés 0,38 %, et Amundi a lancé DCAM en mars 2025 — même indice, même 0,20 %. Pour l'investisseur, c'est une excellente nouvelle : la concurrence a divisé les frais par près de deux par rapport au CW8 historique (0,38 %). Reste à choisir entre deux jumeaux.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "MSCI World", rightValue: "MSCI World (identique)" },
    { criterion: "TER", leftValue: "0,20 %/an", rightValue: "0,20 %/an (identique)" },
    { criterion: "Émetteur", leftValue: "iShares (BlackRock)", rightValue: "Amundi (Crédit Agricole)" },
    { criterion: "Lancement", leftValue: "Mars 2024 (cotation à Paris en avril)", rightValue: "Mars 2025" },
    { criterion: "Prix de part", leftValue: "Sous 10 €", rightValue: "Sous 10 € — aucun écart utile" },
    { criterion: "Encours (fin août 2026)", leftValue: "≈ 2,1 Md€", rightValue: "≈ 1,4 Md€" },
    { criterion: "Domicile du fonds", leftValue: "Irlande", rightValue: "France" },
    { criterion: "Réplication", leftValue: "Synthétique", rightValue: "Synthétique" },
    { criterion: "Éligibilité PEA", leftValue: "Oui", rightValue: "Oui" },
  ],

  useCases: [
    {
      profile: "DCA de petits montants (50-200 €/mois)",
      winner: "both",
      explanation:
        "Les deux parts cotent sous 10 € : même un petit versement mensuel s'investit presque entièrement, avec l'un comme avec l'autre. Prenez celui que votre courtier facture le moins cher à l'ordre.",
    },
    {
      profile: "Courtier avec achat fractionné (Trade Republic…)",
      winner: "both",
      explanation:
        "Avec l'achat fractionné, le prix de part ne compte plus du tout. Choisissez celui qui est disponible avec les frais d'ordre les plus bas chez votre courtier.",
    },
    {
      profile: "Préférence pour la diversification des émetteurs",
      winner: "left",
      explanation:
        "Si votre portefeuille est déjà très exposé à Amundi (CW8, PSP5, PUST…), prendre l'émetteur concurrent répartit le risque opérationnel — un argument de confort plus que de performance.",
    },
    {
      profile: "Investisseur qui veut le maximum d'antériorité et d'encours",
      winner: "left",
      explanation:
        "WPEA a un an d'historique de plus et l'encours le plus élevé des deux. C'est court dans les deux cas, mais si l'historique vous rassure, WPEA a l'avantage — en sachant que les deux émetteurs sont des géants éprouvés.",
    },
  ],

  analysis:
    "Ce duel illustre la meilleure dynamique possible pour les épargnants : la concurrence par les frais. Jusqu'en 2024, les ETF MSCI World éligibles PEA étaient facturés 0,38 % (CW8, EWLD). WPEA est arrivé à 0,20 %, puis DCAM au même tarif en 2025. Sur la performance, n'attendez aucune différence significative : même indice, même mécanisme de swap encadré par UCITS, même TER. Les écarts de suivi se joueront au centième de pourcent. La décision est donc logistique : disponibilité et frais d'ordre chez VOTRE courtier. Si vous détenez du CW8 acheté avant 2024, il n'y a pas urgence à vendre (pas de friction fiscale en PEA, mais pas de raison de payer 0,38 % sur vos NOUVEAUX versements non plus — basculez simplement vos achats futurs vers WPEA ou DCAM).",

  faq: [
    {
      q: "WPEA et DCAM ont-ils exactement la même performance ?",
      a: "En théorie oui : même indice MSCI World, même TER de 0,20 %, même réplication synthétique. En pratique, de micro-écarts de suivi (qualité du swap, coûts de rééquilibrage) peuvent apparaître, de l'ordre du centième de pourcent par an. Aucun des deux n'a d'avantage structurel sur l'autre.",
    },
    {
      q: "Je détiens déjà du CW8 : dois-je vendre pour acheter WPEA ou DCAM ?",
      a: "Pas nécessairement. Dans un PEA, vendre du CW8 pour racheter du WPEA/DCAM n'a pas de coût fiscal, mais génère des frais d'ordre. La stratégie la plus simple : conserver le CW8 existant et diriger vos nouveaux versements vers WPEA ou DCAM (0,20 % au lieu de 0,38 %). À gros encours, un arbitrage complet peut se justifier — faites le calcul frais d'ordre contre économie de TER.",
    },
    {
      q: "Le prix de part change-t-il quelque chose entre les deux ?",
      a: "Non. Les deux parts cotent sous 10 €, si bien que même un petit versement mensuel s'investit presque intégralement dans l'un comme dans l'autre. Et le prix de part n'a aucun effet sur la performance : c'est seulement une question de granularité d'achat.",
    },
    {
      q: "Quels sont les ISIN à vérifier avant de passer l'ordre ?",
      a: "WPEA : IE0002XZSHO1 (iShares MSCI World Swap PEA UCITS ETF EUR (Acc)). DCAM : FR001400U5Q4 (Amundi PEA Monde (MSCI World) UCITS ETF Acc). Vérifiez toujours l'ISIN dans l'écran d'ordre de votre courtier : un mnémonique proche peut désigner un autre fonds, parfois non éligible au PEA.",
    },
    {
      q: "Les deux sont-ils éligibles au PEA chez tous les courtiers ?",
      a: "Les deux sont éligibles au PEA — c'est écrit dans leur document d'informations clés. En pratique, la disponibilité dépend du catalogue de votre courtier. Vérifiez aussi les frais d'ordre, qui peuvent différer d'un ETF à l'autre chez un même courtier.",
    },
  ],

  tags: ["PEA", "MSCI World", "frais"],
};

// ─── IWDA vs CW8 ──────────────────────────────────────────────────────────────

const IWDA_VS_CW8: ETFComparison = {
  slug: "iwda-vs-cw8",
  publishedAt: "2026-06-10",
  updatedAt: "2026-09-28",
  title: "IWDA vs CW8 : physique en CTO ou synthétique en PEA ?",
  metaTitle: "IWDA ou CW8 : CTO ou PEA pour votre MSCI World ?",
  metaDescription:
    `IWDA (physique, CTO) ou CW8 (synthétique, PEA) ? Même indice MSCI World, mais l'enveloppe change tout : ~${ecartFiscalEnviron(gainsBruts(0.38))} € d'impôt en moins en PEA sur 20 ans à 200 €/mois. Le vrai match est fiscal — comparatif complet.`,

  left: {
    heading: "IWDA",
    subheading: "iShares Core MSCI World UCITS ETF USD (Acc) — ISIN IE00B4L5Y983",
    type: "ETF",
    coverage: "MSCI World — ~1 300 sociétés des 23 pays développés",
    issuer: "iShares (BlackRock)",
    ter: "0,20 %/an",
    replication: "Physique optimisée",
    distribution: "Capitalisant",
    currency: "USD (cotation EUR sur Euronext Amsterdam)",
    peaEligible: "Non — CTO ou assurance-vie uniquement",
    // « L'un des plus gros ETF d'Europe » : classement sans source, retiré le
    // 28/09/2026 (table de vérité ETF).
    strongPoint: "Réplication physique (détient réellement les actions) · TER 0,20 %",
    weakPoint: "Non éligible PEA → fiscalité CTO (PFU 31,4 %) sur les gains",
  },

  right: {
    heading: "CW8",
    subheading: "Amundi MSCI World Swap UCITS ETF EUR Acc — ISIN LU1681043599",
    type: "ETF",
    coverage: "MSCI World — ~1 300 sociétés des 23 pays développés",
    issuer: "Amundi",
    ter: "0,38 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Éligible PEA → 18,6 % de prélèvements après 5 ans au lieu de 31,4 %",
    // « Le plus élevé des MSCI World » : EWLD est au même 0,38 %, et le marché
    // entier n'a pas été vérifié. Corrigé le 28/09/2026.
    weakPoint: "TER de 0,38 % — WPEA et DCAM répliquent le même indice en PEA à 0,20 %",
  },

  verdict:
    `Le match n'est pas « physique vs synthétique » mais « PEA vs CTO » — et le PEA gagne presque toujours. Sur 20 ans à 200 €/mois (≈ ${capitalPour(0)} € avant frais, dont ≈ ${gainsPour(0)} € de gains), la fiscalité PEA (18,6 %) économise environ ${ecartFiscalEnviron(gainsBruts(0))} € d'impôt par rapport au CTO (PFU 31,4 %). Cet écart écrase largement les 0,18 % de TER d'avantage d'IWDA. Si votre PEA n'est pas plein : MSCI World en PEA (et plutôt WPEA ou DCAM à 0,20 % que CW8 pour de nouveaux achats). IWDA se justifie en CTO une fois le PEA plafonné, ou si la réplication physique est une exigence personnelle.`,

  intro:
    "IWDA est la référence européenne du MSCI World : réplication physique, TER de 0,20 %. CW8 est la référence française en PEA. Beaucoup de débutants comparent leurs TER et concluent qu'IWDA est « meilleur » — en oubliant que l'enveloppe fiscale pèse plusieurs fois plus lourd que les frais dans le résultat final. Voici le vrai calcul.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "MSCI World", rightValue: "MSCI World (identique)" },
    { criterion: "Réplication", leftValue: "Physique optimisée", rightValue: "Synthétique (swap)" },
    { criterion: "TER", leftValue: "0,20 %/an", rightValue: "0,38 %/an" },
    { criterion: "Éligibilité PEA", leftValue: "Non", rightValue: "Oui" },
    { criterion: "Fiscalité des gains (après 5 ans)", leftValue: "PFU 31,4 % (CTO)", rightValue: "18,6 % (PEA)" },
    { criterion: "Impact fiscal — 20 ans à 200 €/mois", leftValue: `≈ ${impotCTOEnviron(gainsBruts(0.2))} € de prélèvements`, rightValue: `≈ ${impotPEAEnviron(gainsBruts(0.38))} € de prélèvements` },
    // Ligne « Encours » retirée le 28/09/2026 : ni « l'un des plus gros
    // d'Europe » ni « ~5-6 Md€ » pour CW8 n'ont de source. L'ISIN est vérifié.
    { criterion: "ISIN", leftValue: "IE00B4L5Y983", rightValue: "LU1681043599" },
    { criterion: "Risque de contrepartie", leftValue: "Aucun (détention directe)", rightValue: "Encadré à 10 % max (UCITS)" },
  ],

  useCases: [
    {
      profile: "PEA non plafonné (moins de 150 000 € de versements)",
      winner: "right",
      explanation:
        "L'avantage fiscal du PEA (18,6 % vs 31,4 % sur les gains) écrase l'écart de TER. Et pour de NOUVEAUX achats en PEA, WPEA ou DCAM (0,20 %) font encore mieux que CW8 — même enveloppe, frais divisés par deux.",
    },
    {
      profile: "PEA plafonné, on continue d'investir",
      winner: "left",
      explanation:
        "Une fois les 150 000 € de versements PEA atteints, le CTO devient la suite logique — et IWDA y est une option de référence : physique, 0,20 %, même MSCI World.",
    },
    {
      profile: "Exigence de réplication physique",
      winner: "left",
      explanation:
        "Si le mécanisme de swap vous dérange par principe, IWDA détient réellement les ~1 500 actions de l'indice. C'est un confort psychologique légitime — mais il se paie 13 points de fiscalité en sortant du PEA.",
    },
    {
      profile: "Expatriation prévue / situation fiscale non française",
      winner: "left",
      explanation:
        "Le PEA est un dispositif fiscal français. Si vous prévoyez de quitter la France à moyen terme, l'avantage PEA s'érode et la portabilité d'un CTO avec IWDA peut être préférable. Cas particulier — à valider avec un conseiller.",
    },
  ],

  analysis:
    `La comparaison IWDA vs CW8 est l'exemple type d'une optimisation au mauvais étage. L'écart de TER (0,18 %) représente environ ${ecartCapital(0.38, 0.2)} € sur 20 ans à 200 €/mois. L'écart d'enveloppe fiscale (18,6 % vs 31,4 % sur ~${gainsPour(0.38)} € de gains) en représente environ ${ecartFiscalEnviron(gainsBruts(0.38))} € — et il s'applique APRÈS l'effet des frais. Autrement dit : même le pire ETF MSCI World du PEA bat IWDA en CTO pour un résident fiscal français qui n'a pas plafonné son PEA. La hiérarchie de décision correcte : 1) l'enveloppe (PEA d'abord), 2) les frais à l'intérieur de l'enveloppe (WPEA/DCAM 0,20 % plutôt que CW8 0,38 % pour de nouveaux achats), 3) la réplication, qui est un critère de confort. Le swap des ETF synthétiques est encadré par UCITS (exposition de contrepartie limitée à 10 %, collatéralisée en pratique quotidiennement) — un risque réel mais faible, sans commune mesure avec 13 points de fiscalité.`,

  faq: [
    {
      q: "IWDA peut-il être logé dans un PEA ?",
      a: "Non. IWDA est en réplication physique : il détient majoritairement des actions non européennes (~70 % US), ce qui le rend incompatible avec les règles du PEA. Seuls les ETF World à réplication synthétique (CW8, WPEA, DCAM, EWLD…) sont éligibles PEA.",
    },
    {
      q: "Le TER plus bas d'IWDA ne compense-t-il jamais la fiscalité ?",
      a: `Sur les hypothèses classiques (20 ans, 200 €/mois, 7 %/an), non : l'économie de TER (~${ecartCapital(0.38, 0.2)} €) reste inférieure au surcoût fiscal du CTO (~${ecartFiscalEnviron(gainsBruts(0.38))} €). Et ce raisonnement compare IWDA au CW8 (0,38 %) — face à WPEA ou DCAM (0,20 % en PEA), IWDA n'a plus aucun avantage de frais, il ne reste que le débat physique vs synthétique.`,
    },
    {
      q: "La réplication synthétique est-elle dangereuse ?",
      a: "Le swap introduit un risque de contrepartie, mais la réglementation UCITS le limite à 10 % de l'actif et les émetteurs le collatéralisent en pratique quotidiennement. En 20 ans d'ETF synthétiques européens, ce risque ne s'est jamais matérialisé en perte pour les porteurs. Il est raisonnable de le considérer comme faible — sans le nier.",
    },
    {
      q: "Et en assurance-vie ?",
      a: "IWDA (ou des fonds World équivalents) est disponible dans certaines assurances-vie en unités de compte. La fiscalité de l'AV après 8 ans (abattement annuel + taux réduit) peut s'approcher de celle du PEA, mais les frais d'UC (0,5-1 %/an de frais de gestion du contrat) dégradent souvent le bilan. Le PEA reste l'enveloppe la plus efficace pour un DCA actions long terme.",
    },
  ],

  tags: ["PEA", "CTO", "MSCI World", "réplication"],
};

// ─── ESE vs PSP5 ──────────────────────────────────────────────────────────────

// ⚠️ CORRIGÉ LE 28/09/2026 (table de vérité ETF). La fiche donnait à PSP5
// l'ISIN FR0013412285, qui est celui de PE500 (Amundi PEA S&P 500 Screened,
// filtre ESG, 0,25 %) : un lecteur qui le recopiait achetait un autre fonds.
// Le vrai : FR0011871128. Aussi faux : TER d'ESE 0,15 % (c'est 0,14 %), PSP5
// « le TER le plus bas du S&P 500 en PEA » (SPEA est à 0,10 %), et la part
// « ~30 € », la liquidité et la diffusion d'ESE, qu'aucune source n'étaye.
const ESE_VS_PSP5: ETFComparison = {
  slug: "ese-vs-psp5",
  publishedAt: "2026-06-10",
  updatedAt: "2026-09-28",
  title: "ESE vs PSP5 : quel ETF S&P 500 pour votre PEA ?",
  metaTitle: "ESE ou PSP5 : quel ETF S&P 500 choisir en PEA en 2026 ?",
  metaDescription:
    `PSP5 (Amundi, 0,12 %) ou ESE (BNP Paribas, 0,14 %) ? ~${ecartCapital(0.14, 0.12)} € d'écart sur 20 ans à 200 €/mois : vos frais d'ordre comptent plus. Et SPEA fait 0,10 %.`,

  left: {
    heading: "ESE",
    subheading: "BNP Paribas Easy S&P 500 UCITS ETF — ISIN FR0011550185",
    type: "ETF",
    coverage: "S&P 500 — les 500 plus grandes sociétés cotées américaines",
    issuer: "BNP Paribas Asset Management",
    ter: "0,14 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Émetteur BNP Paribas : une alternative à Amundi et iShares · TER de 0,14 %",
    weakPoint: "TER légèrement supérieur à PSP5 (0,14 % vs 0,12 %)",
  },

  right: {
    heading: "PSP5",
    subheading: "Amundi PEA S&P 500 UCITS ETF Acc — ISIN FR0011871128",
    type: "ETF",
    coverage: "S&P 500 — les 500 plus grandes sociétés cotées américaines",
    issuer: "Amundi",
    ter: "0,12 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Le TER le plus bas des deux (0,12 %)",
    weakPoint: "Pas le moins cher du S&P 500 en PEA : SPEA (iShares) fait 0,10 %",
  },

  verdict:
    `PSP5 gagne sur le papier (0,12 % vs 0,14 %) mais l'écart réel est minime : environ ${ecartCapital(0.14, 0.12)} € sur 20 ans à 200 €/mois. À ce niveau, vos frais d'ordre et la disponibilité chez votre courtier pèsent plus lourd que le TER. Règle simple : si votre courtier propose les deux aux mêmes conditions, PSP5 est le moins cher ; sinon, c'est celui qui vous coûte le moins en frais de transaction qui l'emporte. Et un troisième S&P 500 éligible PEA, SPEA (iShares), descend à 0,10 %.`,

  intro:
    "Pour s'exposer au S&P 500 dans un PEA, ESE (BNP Paribas) et PSP5 (Amundi) sont deux ETF synthétiques à frais bas, à 0,02 point d'écart. Un troisième, SPEA (iShares, lancé en mai 2025), fait encore moins cher à 0,10 %. Contrairement au match CW8 vs WPEA où l'écart de frais était massif (près de ×2), ici tous sont déjà très bon marché — le choix se joue sur des détails.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "S&P 500", rightValue: "S&P 500 (identique)" },
    { criterion: "TER", leftValue: "0,14 %/an", rightValue: "0,12 %/an" },
    { criterion: "Émetteur", leftValue: "BNP Paribas AM", rightValue: "Amundi" },
    { criterion: "Impact TER — 20 ans à 200 €/mois", leftValue: "Référence", rightValue: `≈ +${ecartCapital(0.14, 0.12)} € de capital final` },
    // « Liquidité / spread » et « Prix de part ~30 € » : aucune source ;
    // remplacés le 28/09/2026 par l'ISIN, le critère à vérifier avant l'ordre.
    { criterion: "ISIN", leftValue: "FR0011550185", rightValue: "FR0011871128" },
    { criterion: "Réplication", leftValue: "Synthétique", rightValue: "Synthétique" },
    { criterion: "Éligibilité PEA", leftValue: "Oui", rightValue: "Oui" },
  ],

  useCases: [
    {
      profile: "Optimisation maximale des frais",
      winner: "right",
      explanation:
        "PSP5 à 0,12 % est le moins cher des deux. Si votre courtier le référence aux mêmes frais d'ordre qu'ESE, il n'y a pas de raison de payer 0,02 % de plus — et SPEA (iShares), à 0,10 %, va encore plus loin.",
    },
    {
      profile: "Courtier au catalogue limité",
      winner: "left",
      explanation:
        "Si PSP5 n'est pas disponible (ou avec des frais d'ordre supérieurs) chez votre courtier et qu'ESE l'est, l'écart de 0,02 point de TER ne justifie pas de changer de courtier.",
    },
    {
      profile: "Gros ordres ponctuels (lump sum)",
      // Donnait l'avantage à ESE sur une « liquidité supérieure » sans source.
      winner: "both",
      explanation:
        "Sur un ordre important, le spread (écart achat/vente) compte plus que 0,02 point de TER annuel. L'écart affiché des deux lignes au moment de l'ordre départage mieux que leur TER, et un ordre à cours limité évite d'acheter au mauvais prix.",
    },
    {
      profile: "DCA mensuel automatisé",
      winner: "both",
      explanation:
        "Sur de petits ordres réguliers, le spread est négligeable et les deux conviennent parfaitement. Prenez le moins cher en frais d'ordre chez votre courtier, et n'y pensez plus.",
    },
  ],

  analysis:
    `Ce match illustre la notion de seuil de pertinence des frais. Passer de 0,38 % à 0,20 % (CW8 → WPEA) économise ~${ecartCapital(0.38, 0.2)} € sur 20 ans : ça vaut une décision. Passer de 0,14 % à 0,12 % en économise ~${ecartCapital(0.14, 0.12)} € : c'est réel, mais du même ordre de grandeur que quelques années de frais d'ordre, un spread défavorable répété, ou un mois de retard à investir. Autrement dit : choisissez vite, investissez tôt — l'erreur coûteuse serait de passer trois mois à hésiter entre deux excellents ETF. Rappel utile : le S&P 500 en PEA passe par la réplication synthétique (les actions américaines ne sont pas éligibles en direct), mécanisme encadré par UCITS. Et si vous hésitez encore entre S&P 500 et MSCI World, c'est une décision plus structurante que ESE vs PSP5 — le World contient déjà ~70 % de S&P 500.`,

  faq: [
    {
      q: "ESE ou PSP5 : lequel performe le mieux ?",
      a: `Même indice, même mécanisme : la différence théorique est l'écart de TER (0,02 %/an en faveur de PSP5), soit ~${ecartCapital(0.14, 0.12)} € sur 20 ans à 200 €/mois. Les écarts de tracking réels peuvent ponctuellement inverser ce classement une année donnée. En pratique : équivalents.`,
    },
    {
      q: "Pourquoi pas un S&P 500 physique comme CSPX ou VUSA ?",
      a: "CSPX (iShares) et VUSA (Vanguard) sont d'excellents ETF S&P 500 physiques à 0,07 % — mais ils ne sont PAS éligibles PEA (actions américaines détenues en direct). Ils se logent en CTO ou assurance-vie. En PEA, la réplication synthétique est le passage obligé pour le S&P 500.",
    },
    {
      q: "Et SPEA, le S&P 500 d'iShares pour le PEA ?",
      a: `SPEA (iShares S&P 500 Swap PEA UCITS ETF EUR (Acc), ISIN IE000DQLYVB9), lancé le 29 mai 2025, réplique le même S&P 500 à 0,10 % de TER : le moins cher des S&P 500 éligibles PEA de notre sélection. Face à PSP5, l'écart vaut environ ${ecartCapital(0.12, 0.1)} € sur 20 ans aux hypothèses de cette page — le même ordre de grandeur que l'écart ESE/PSP5.`,
    },
    {
      q: "Puis-je détenir ESE et PSP5 en même temps ?",
      a: "Techniquement oui, mais c'est inutile : ils répliquent le même indice. Détenir les deux n'apporte aucune diversification — uniquement de la complexité. Si vous avez déjà l'un, conservez-le et concentrez vos nouveaux versements sur un seul.",
    },
    {
      q: "S&P 500 ou MSCI World pour mon PEA ?",
      a: "Question plus importante que ESE vs PSP5 ! Le MSCI World est composé à ~70 % de S&P 500 mais ajoute le Japon, l'Europe, le Canada… Le S&P 500 pur est un pari assumé sur la poursuite de la domination américaine. Pour la simplicité maximale d'un débutant, le World est souvent recommandé — voir notre comparatif MSCI World vs S&P 500.",
    },
  ],

  tags: ["PEA", "S&P 500", "frais"],
};

// ─── VWCE vs WPEA ─────────────────────────────────────────────────────────────

// ⚠️ CORRIGÉ LE 28/09/2026 (table de vérité ETF). Trois faits faux :
// 1. WPEA portait l'ISIN IE0006WW1TQ4 (un Xtrackers ex USA, hors PEA) et le
//    nom « iShares Core MSCI World » (c'est IWDA). Vrai : IE0002XZSHO1.
// 2. TER de VWCE 0,22 % : périmé, c'est 0,14 %. VWCE est donc MOINS cher que
//    WPEA (0,20 %) — le texte le dit désormais, et montre que l'écart de frais
//    (calculé) reste loin derrière l'écart fiscal.
// 3. « WPEA + AEEM » pour répliquer VWCE en PEA : AEEM n'est PAS éligible au
//    PEA. L'ETF émergents éligible d'Amundi est PAEEM (0,30 %).
const VWCE_VS_WPEA: ETFComparison = {
  slug: "vwce-vs-wpea",
  publishedAt: "2026-06-10",
  updatedAt: "2026-09-28",
  title: "VWCE vs WPEA : All-World en CTO ou MSCI World en PEA ?",
  metaTitle: "VWCE ou WPEA : All-World ou MSCI World pour votre DCA ?",
  metaDescription:
    "VWCE ajoute les marchés émergents (~10 %) mais se loge en CTO (31,4 % d'impôt). WPEA s'arrête aux pays développés mais profite du PEA (18,6 %). Sur 20 ans, la fiscalité l'emporte presque toujours — comparatif chiffré.",

  left: {
    heading: "VWCE",
    subheading: "Vanguard FTSE All-World UCITS ETF (USD) Accumulating — ISIN IE00BK5BQT80",
    type: "ETF",
    coverage: "FTSE All-World — ~3 700 sociétés, pays développés ET émergents (49 pays)",
    issuer: "Vanguard",
    ter: "0,14 %/an",
    replication: "Physique optimisée",
    distribution: "Capitalisant",
    currency: "USD (cotation EUR disponible)",
    peaEligible: "Non — CTO ou assurance-vie uniquement",
    strongPoint: "Développés + émergents en un seul ETF · TER plus bas que WPEA (0,14 % vs 0,20 %)",
    weakPoint: "Non éligible PEA → PFU 31,4 % sur les gains en CTO",
  },

  right: {
    heading: "WPEA",
    subheading: "iShares MSCI World Swap PEA UCITS ETF EUR (Acc) — ISIN IE0002XZSHO1",
    type: "ETF",
    coverage: "MSCI World — ~1 300 sociétés des 23 pays développés (pas d'émergents)",
    issuer: "iShares (BlackRock)",
    ter: "0,20 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "MSCI World à 0,20 % dans l'enveloppe fiscale la plus avantageuse de France",
    weakPoint: "Pas d'exposition aux marchés émergents (Chine, Inde, Brésil…)",
  },

  verdict:
    `Pour un résident fiscal français avec un PEA non plafonné, WPEA gagne dans la grande majorité des cas : l'avantage fiscal du PEA (18,6 % vs 31,4 % sur les gains, soit ≈ ${ecartFiscalEnviron(gainsBruts(0.2))} € sur 20 ans à 200 €/mois) dépasse largement le bénéfice attendu des ~10 % d'émergents de VWCE — et aussi son avantage de frais (0,14 % contre 0,20 %, ≈ ${ecartCapital(0.2, 0.14)} € sur la même période). Et si les émergents vous tiennent à cœur, l'association WPEA + PAEEM (émergents éligibles PEA) approche l'exposition All-World… en restant dans le PEA. VWCE redevient le meilleur choix en CTO (PEA plein) ou en assurance-vie.`,

  intro:
    "VWCE, c'est tout le marché mondial, émergents compris, en un seul fonds Vanguard. WPEA est le MSCI World optimisé pour le PEA français. Le débat « faut-il les émergents ? » est légitime — mais pour un investisseur français, il est presque toujours tranché par un facteur que les comparatifs européens ignorent : l'enveloppe fiscale.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "FTSE All-World (~3 700 sociétés)", rightValue: "MSCI World (~1 300 sociétés)" },
    { criterion: "Marchés émergents", leftValue: "Oui (~10 % de l'indice)", rightValue: "Non" },
    { criterion: "TER", leftValue: "0,14 %/an", rightValue: "0,20 %/an" },
    { criterion: `Écart de frais — 20 ans à ${HYPOTHESES_COMPARATIFS.monthlyAmount} €/mois`, leftValue: `≈ ${ecartCapital(0.2, 0.14)} € de capital final en plus`, rightValue: "Référence" },
    { criterion: "Réplication", leftValue: "Physique optimisée", rightValue: "Synthétique (swap)" },
    { criterion: "Éligibilité PEA", leftValue: "Non", rightValue: "Oui" },
    { criterion: "Fiscalité des gains (après 5 ans)", leftValue: "PFU 31,4 % (CTO)", rightValue: "18,6 % (PEA)" },
    { criterion: "Impact fiscal — 20 ans à 200 €/mois", leftValue: `≈ ${impotCTOEnviron(gainsBruts(0.14))} € de prélèvements`, rightValue: `≈ ${impotPEAEnviron(gainsBruts(0.2))} € de prélèvements` },
    { criterion: "Équivalent émergents en PEA", leftValue: "—", rightValue: "Approché via WPEA + PAEEM (~90/10)" },
  ],

  useCases: [
    {
      profile: "PEA non plafonné, simplicité maximale",
      winner: "right",
      explanation:
        "WPEA seul en PEA : la fiscalité fait plus pour votre patrimoine que les ~10 % d'émergents manquants. Le MSCI World a historiquement délivré des rendements proches de l'All-World, avec une volatilité légèrement inférieure.",
    },
    {
      profile: "Conviction émergents, PEA disponible",
      winner: "right",
      explanation:
        "Combinez WPEA (~90 %) + PAEEM (Amundi PEA Emergent ESG Transition, éligible PEA, 0,30 %) (~10 %) : vous approchez l'exposition All-World en conservant la fiscalité PEA — PAEEM suit une variante « ESG Transition » du MSCI Emerging Markets, pas l'indice standard. Un ordre de plus par mois, quelques milliers d'euros d'impôt en moins à l'arrivée. (AEEM, l'autre ETF émergents d'Amundi, n'est pas éligible au PEA.)",
    },
    {
      profile: "PEA plafonné ou non-résident",
      winner: "left",
      explanation:
        "Sans l'avantage PEA, VWCE redevient l'option de référence : développés et émergents, réplication physique, TER plus bas que WPEA (0,14 %), un seul fonds à gérer en CTO.",
    },
    {
      profile: "Allergie au synthétique",
      winner: "left",
      explanation:
        "WPEA est synthétique (obligatoire pour l'éligibilité PEA d'un indice mondial). Si vous refusez le swap par principe, VWCE physique en CTO est l'alternative cohérente — en connaissance du surcoût fiscal.",
    },
  ],

  analysis:
    `Les comparatifs européens de VWCE ne tiennent jamais compte du PEA — c'est pourtant le facteur décisif pour un investisseur français. Posons les ordres de grandeur sur 20 ans à 200 €/mois et 7 %/an : capital avant frais ≈ ${capitalPour(0)} €, dont ≈ ${gainsPour(0)} € de gains. En PEA (WPEA), prélèvements sociaux de 18,6 % ≈ ${impotPEAEnviron(gainsBruts(0))} €. En CTO (VWCE), PFU de 31,4 % ≈ ${impotCTOEnviron(gainsBruts(0))} €. L'écart (~${ecartFiscalEnviron(gainsBruts(0))} €) représente plusieurs fois l'avantage de frais de VWCE (0,14 % contre 0,20 %, ≈ ${ecartCapital(0.2, 0.14)} €) et l'impact espéré des émergents : sur les 30 dernières années, développés et émergents ont alterné les périodes de sur/sous-performance, sans gagnant structurel — et les émergents ne pèsent que ~10 % de l'All-World, diluant leur effet. Conclusion pragmatique : l'enveloppe d'abord, l'indice ensuite. WPEA (ou WPEA + PAEEM) en PEA tant qu'il n'est pas plein ; VWCE en CTO au-delà. Les deux stratégies sont excellentes — c'est l'ordre qui compte.`,

  faq: [
    {
      q: "VWCE est-il éligible au PEA ?",
      a: "Non. VWCE est en réplication physique et détient majoritairement des actions non européennes, ce qui l'exclut du PEA. Il se loge en compte-titres ordinaire ou, selon les contrats, en assurance-vie. En PEA, l'exposition mondiale passe par les ETF synthétiques : WPEA, DCAM, CW8 pour les pays développés, GPEA (MSCI ACWI) pour le monde entier, émergents inclus.",
    },
    {
      q: "Comment répliquer VWCE dans un PEA ?",
      // GPEA ajouté le 28/09/2026 : fonds créé le 06/07/2026, MSCI ACWI,
      // éligible PEA (table de vérité ETF). « Avec deux ETF » n'était plus
      // la seule voie.
      a: "Avec un seul ETF : GPEA (Amundi PEA Global, indice MSCI ACWI, émergents inclus, 0,30 %), lancé en juillet 2026 — donc sans historique. Son indice n'est pas le FTSE All-World de VWCE, mais il couvre lui aussi développés et émergents. Ou avec deux ETF : WPEA (MSCI World, pays développés) pour ~90 % et PAEEM (Amundi PEA Emergent, éligible PEA, 0,30 %) pour ~10 %. Cette combinaison approxime l'exposition FTSE All-World de VWCE tout en conservant la fiscalité PEA — PAEEM suit une variante « ESG Transition » du MSCI Emerging Markets. Attention : AEEM, souvent cité, n'est PAS éligible au PEA. Notre outil d'allocation permet de simuler ce portefeuille.",
    },
    {
      q: "Les émergents ne vont-ils pas surperformer et inverser le calcul ?",
      a: "C'est possible — mais il faudrait une surperformance massive et durable des émergents pour que ~10 % d'allocation compensent 13 points de fiscalité sur la totalité des gains. Historiquement, développés et émergents alternent les cycles sans gagnant de long terme évident. Et l'option WPEA + PAEEM capture ce scénario sans sacrifier le PEA.",
    },
    {
      q: "J'ai déjà du VWCE en CTO : dois-je vendre pour passer en PEA ?",
      a: "Vendre déclencherait l'imposition immédiate des plus-values latentes (PFU 31,4 %) — souvent contre-productif. La stratégie habituelle : conserver le VWCE existant et diriger les NOUVEAUX versements vers le PEA (WPEA/DCAM) jusqu'au plafond. Cas par cas selon les montants — un conseiller peut affiner.",
    },
  ],

  tags: ["PEA", "CTO", "MSCI World", "All-World", "émergents"],
};

export const ETF_COMPARISONS: Record<string, ETFComparison> = {
  [MSCI_WORLD_VS_SP500.slug]: MSCI_WORLD_VS_SP500,
  [CW8_VS_ESE.slug]: CW8_VS_ESE,
  [VWCE_VS_CW8.slug]: VWCE_VS_CW8,
  [CW8_VS_WPEA.slug]: CW8_VS_WPEA,
  [WPEA_VS_DCAM.slug]: WPEA_VS_DCAM,
  [IWDA_VS_CW8.slug]: IWDA_VS_CW8,
  [ESE_VS_PSP5.slug]: ESE_VS_PSP5,
  [VWCE_VS_WPEA.slug]: VWCE_VS_WPEA,
};

export const ETF_COMPARISON_LIST: ETFComparison[] = Object.values(ETF_COMPARISONS);

export function getETFComparison(slug: string): ETFComparison | null {
  return ETF_COMPARISONS[slug] ?? null;
}
