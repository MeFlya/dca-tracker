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

// Encours et prix de part de WPEA et DCAM, lus à une seule source (30/09/2026) :
// le verdict, les cartes et le tableau ne peuvent plus diverger.
import { TAILLE_ETF } from "@/lib/sources-etf";

// Comparatifs du 09/10/2026 (cw8-vs-dcam, gpea-vs-dcam) : encours et prix de
// part publiés par Amundi, à la même date pour les deux fonds d'un duel, et
// documents de l'émetteur cités sous le tableau. Voir sources-etf.ts.
import {
  DOCUMENTS_AMUNDI_2026_10,
  TAILLE_AMUNDI_8_OCTOBRE,
  encoursEnviron,
  prixPartEnviron,
  type FicheCitee,
} from "@/lib/sources-etf";
import { PLAFOND_ORDRE_PEA } from "@/lib/brokers";
import { dateEnToutesLettres } from "@/lib/etf-pea-verifies";

const WPEA_TAILLE = TAILLE_ETF.WPEA;
const DCAM_TAILLE = TAILLE_ETF.DCAM;

/**
 * Mois de dernière revérification des TER et caractéristiques, format YYYY-MM.
 * Exporté et affiché publiquement — cf. commentaire de BROKERS_REVIEWED_ON.
 */
export const ETF_COMPARISONS_REVIEWED_ON = "2026-09";

// Couverture du MSCI World : « ~1 500 sociétés » corrigé en « ~1 300 » le
// 28/09/2026 (14 occurrences). Source : fiche MSCI World Index (msci.com,
// consultée ce jour) — 1 280 constituants, 23 pays développés. Le nombre bouge
// à chaque revue trimestrielle, d'où l'arrondi.
// 30/09/2026 : quatre « 1 500 » avaient échappé à cette correction (deux
// tableaux, une FAQ, un cas d'usage) ; corrigés.
//
// 30/09/2026 — relevé des citations par les assistants IA (29/09/2026) : les
// pages citées donnent la réponse d'abord, chiffrée, datée et sourcée. Le
// gabarit place désormais le verdict avant l'introduction, ajoute l'encours
// (justETF) et le prix de part (table de vérité) de WPEA et DCAM (TAILLE_ETF), les liens
// vers la fiche de chaque fonds (FICHE_ETF) et, pour les duels entre deux ETF
// du PEA, les frais d'un ordre chez trois courtiers (FRAIS_ORDRE_ETF_PEA). Les
// huit pages changent : `updatedAt` passe au 30/09/2026 pour les huit.
//
// 30/09/2026 (relecture de conformité) : les huit pages repassées en entier.
// Le site n'a pas le statut de conseiller en investissements financiers :
// retirés les ordres (« prenez », « basculez », « combinez », « conservez-le
// et concentrez… »), les seuils personnels sans source (« si votre encours
// CW8 est sous 10 000 euros, basculer »), « le meilleur choix », « le seul des
// deux », « stratégie optimale ». Les phrases décrivent, au conditionnel ou
// chiffres à l'appui. Le plafond de contrepartie suit l'article R214-21 du
// code monétaire et financier (10 % de l'actif pour un établissement de
// crédit, 5 % sinon ; fait ucits-contrepartie-10pc), comme le guide MSCI World.
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
  /**
   * Vérification propre au duel (09/10/2026), affichée sous le tableau à la
   * place de celle du 28/09/2026 : date, émetteur, sources de recoupement et
   * documents cités. Absent pour les huit premiers duels, dont la note ne
   * change pas.
   */
  verification?: {
    /** Date ISO du relevé. */
    le: string;
    /** « d'Amundi » — complète « vérifiés … sur les documents ». */
    aupres: string;
    /** « justETF et Boursorama » */
    recoupeSur: string;
    sources: { symbole: string; fiche: FicheCitee }[];
  };
  /**
   * Liens vers les duels voisins, rendus après l'analyse (09/10/2026). Texte
   * d'ancre descriptif ; liens sortants seulement, rien n'est ajouté aux
   * pages ciblées en dehors du bloc automatique « Autres comparatifs ».
   */
  voirAussi?: { avant: string; ancre: string; href: string; apres?: string }[];
  /**
   * Présent : le tableau « Frais d'un ordre sur ces ETF selon le courtier »
   * n'est pas affiché. La valeur dit pourquoi (non affichée). Posé le
   * 09/10/2026 sur cw8-vs-dcam et gpea-vs-dcam, le temps de reporter la
   * grille BoursoBank du 5 octobre 2026 dans FRAIS_ORDRE_ETF_PEA ; retiré le
   * même jour, une fois la grille reportée. Aucun duel ne l'emploie : il sert
   * la prochaine fois qu'une grille change avant d'être relue.
   */
  sansFraisOrdre?: string;
};

// ─── MSCI World vs S&P 500 ────────────────────────────────────────────────────

const MSCI_WORLD_VS_SP500: ETFComparison = {
  slug: "msci-world-vs-sp500",
  publishedAt: "2026-04-19",
  updatedAt: "2026-09-30",
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

  // 30/09/2026 : le verdict ouvrait sur « MSCI World pour la diversification »,
  // sans un chiffre. Il donne maintenant la couverture de chaque indice et les
  // frais dans un PEA (table de vérité ETF, fiche MSCI au 31/08/2026) — même
  // fond : le World diversifie, le S&P 500 coûte moins et se concentre.
  verdict:
    "Le MSCI World couvre environ 1\u00a0300 sociétés de 23 pays développés\u00a0; le S&P 500, 500 sociétés américaines, avec des ETF moins chers dans un PEA (SPEA à 0,10\u00a0%, PSP5 à 0,12\u00a0%, contre 0,20\u00a0% pour WPEA et DCAM). L'écart entre les deux est plus faible qu'on ne l'imagine\u00a0: les États-Unis pèsent déjà 72,14\u00a0% du MSCI World au 31 août 2026, selon MSCI.",

  intro:
    "MSCI World et S&P 500 sont les deux indices les plus utilisés pour un DCA en ETF. Ils sont souvent présentés comme opposés alors qu'ils se chevauchent largement : le MSCI World contient environ 72 % d'actions américaines (72,14 % au 31/08/2026 selon MSCI), la quasi-totalité de la composition du S&P 500 s'y retrouve. Comprendre cette nuance est la clé du choix.",

  keyDifferences: [
    { criterion: "Nombre de sociétés", leftValue: "~1 300 (1 280 au 31/08/2026)", rightValue: "500" },
    { criterion: "Couverture géographique", leftValue: "23 pays développés", rightValue: "États-Unis uniquement" },
    { criterion: "Poids des États-Unis", leftValue: "~72 % (31/08/2026)", rightValue: "100 %" },
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
        "Si vous pensez que les États-Unis continueront à surperformer, un S&P 500 seul est plus cohérent et moins cher. Les quelque 72 % d'actions américaines du MSCI World sont déjà présents — choisir le S&P 500 pur est un pari assumé.",
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
        "Le MSCI World reste très exposé aux US (environ 72 % au 31/08/2026), mais intègre aussi Japon, Royaume-Uni, France, Allemagne, Suisse, Canada, Australie. Ajouter un ETF émergents en complément est souvent la stratégie de diversification finale — PAEEM dans un PEA ; AEEM, lui, n'y est pas éligible.",
    },
  ],

  analysis:
    "Sur la dernière décennie, le S&P 500 a surperformé le MSCI World d'environ 1-2 % par an en moyenne, principalement grâce à la performance exceptionnelle des grandes tech américaines (Apple, Microsoft, Nvidia, etc.). Cela ne garantit rien pour l'avenir — les décennies précédentes (années 1970-2000) ont parfois vu l'Europe et le Japon surperformer les États-Unis. Le MSCI World est un hedge naturel contre ce risque de rotation géographique : vous captez la surperformance US quand elle est là, sans être 100 % exposé si elle s'inverse. Pour la majorité des investisseurs DCA long-terme, un MSCI World simple suffit et libère du cerveau. Ceux qui ont une conviction forte ajoutent une surpondération (S&P 500, émergents, small caps) en complément.",

  faq: [
    {
      q: "Peut-on combiner MSCI World et S&P 500 dans son portefeuille ?",
      a: "Techniquement oui, mais l'utilité est limitée — le MSCI World contient déjà environ 72 % d'actions américaines (72,14 % au 31/08/2026 selon MSCI). Ajouter un S&P 500 à côté d'un MSCI World revient à surpondérer les États-Unis, ce qui peut être une stratégie assumée (double-down sur les US) mais pas une vraie diversification. Choisir l'un ou l'autre évite ce doublon\u00a0; pour diversifier au-delà, ce sont les marchés émergents qui ajoutent des pays absents des deux indices.",
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
  updatedAt: "2026-09-30",
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
    { criterion: "Nombre de lignes", leftValue: "~1 300", rightValue: "500" },
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
        `Sur 20 ans à 200 €/mois, 0,24 % de TER en moins représente environ ${ecartCapital(0.38, 0.14)} € de capital final en plus. Si vous êtes à l'aise avec la concentration US (environ 72 % du CW8 de toute façon), ESE est le moins cher des deux. Dans un PEA, PSP5 (0,12 %) et SPEA (0,10 %) répliquent le même S&P 500 pour encore moins.`,
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
      a: "La réplication synthétique utilise un swap avec une contrepartie bancaire (souvent la maison-mère de l'émetteur). Le risque de contrepartie est réel mais plafonné par la réglementation européenne des fonds (UCITS)\u00a0: l'exposition à une même contrepartie ne peut pas dépasser 10\u00a0% de l'actif du fonds quand c'est un établissement de crédit, 5\u00a0% dans les autres cas.",
    },
    {
      q: "Peut-on transférer des parts de CW8 vers ESE dans un PEA ?",
      a: "Non, il faut vendre puis racheter — mais à l'intérieur du PEA, les plus-values sont capitalisées sans friction fiscale tant que vous ne retirez pas de l'argent du PEA. Vous pouvez donc basculer d'un ETF à l'autre sans impact fiscal immédiat. Les frais d'ordre s'appliquent en revanche à chaque transaction.",
    },
    {
      q: "Quelle est la différence entre capitalisant et distribuant ?",
      a: "Un ETF capitalisant (comme CW8 et ESE) réinvestit automatiquement les dividendes dans l'ETF. Un distribuant verse les dividendes en cash sur votre compte. Dans un PEA, les dividendes versés par un distribuant restent dans le plan sans être imposés tant qu'on ne retire rien\u00a0; un capitalisant évite simplement d'avoir à les réinvestir soi-même.",
    },
  ],

  tags: ["PEA", "CW8", "ESE", "Amundi"],
};

// ─── VWCE vs CW8 ──────────────────────────────────────────────────────────────

const VWCE_VS_CW8: ETFComparison = {
  slug: "vwce-vs-cw8",
  publishedAt: "2026-04-19",
  updatedAt: "2026-09-30",
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
    // 30/09/2026 : « le seul des deux » et « un schéma simple : le PEA
    // d'abord… » (une consigne) reformulés en description.
    "Dans un PEA, CW8 est éligible et VWCE ne l'est pas (WPEA et DCAM y suivent aussi le MSCI World, à 0,20\u00a0%). Sur un compte-titres (CTO), VWCE devance CW8 sur la diversification (émergents inclus) et sur le TER (0,14\u00a0% contre 0,38\u00a0%). Les deux peuvent se compléter\u00a0: un MSCI World éligible dans le PEA, VWCE dans un compte-titres.",

  intro:
    "VWCE et CW8 sont tous deux des ETF 'monde' populaires, mais ils sont très différents : VWCE couvre marchés développés ET émergents (~3 700 sociétés), CW8 couvre uniquement les marchés développés (~1 300 sociétés). Et VWCE n'est pas éligible PEA. Le choix dépend donc avant tout de l'enveloppe fiscale.",

  keyDifferences: [
    { criterion: "Indice", leftValue: "FTSE All-World", rightValue: "MSCI World" },
    { criterion: "Marchés émergents", leftValue: "Oui (~10-12 %)", rightValue: "Non" },
    { criterion: "TER", leftValue: "0,14 %/an", rightValue: "0,38 %/an" },
    { criterion: "Éligibilité PEA", leftValue: "Non (CTO uniquement)", rightValue: "Oui" },
    { criterion: "Réplication", leftValue: "Physique échantillonnée", rightValue: "Synthétique" },
    // 30/09/2026 : « réputation excellente » était un avis sans source.
    { criterion: "Émetteur", leftValue: "Vanguard", rightValue: "Amundi" },
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
        // 30/09/2026 : « votre seule option réaliste » reformulé.
        `Dans un PEA, CW8 est éligible et VWCE ne l'est pas. Avec CW8, l'exposition aux émergents disparaît et les frais montent (0,38\u00a0% contre 0,14\u00a0%, soit environ ${ecartCapital(0.38, 0.14)}\u00a0€ sur 20 ans à ${HYPOTHESES_COMPARATIFS.monthlyAmount}\u00a0€/mois), mais le PEA taxe moins les gains (18,6\u00a0% contre 31,4\u00a0% à la sortie), un écart d'environ ${ecartFiscalEnviron(gainsBruts(0.38))}\u00a0€ sur la même période. Aux hypothèses de cette page, l'avantage fiscal pèse plus lourd que l'écart de frais.`,
    },
    {
      profile: "Vous investissez sur un CTO",
      winner: "left",
      explanation:
        // 30/09/2026 : « généralement préférable », la réputation de Vanguard et
        // « le change, plutôt un bénéfice » étaient des avis sans source.
        "Sur un CTO, VWCE a l'avantage sur les deux critères de cette page\u00a0: un TER plus bas (0,14\u00a0% contre 0,38\u00a0%) et une diversification plus large (émergents inclus). Sa cotation en dollars ne change pas son exposition\u00a0: ce sont les devises des sociétés détenues qui comptent.",
    },
    {
      profile: "Vous combinez PEA + CTO",
      winner: "both",
      explanation:
        // 30/09/2026 : « Stratégie optimale : saturer le PEA… » était une consigne.
        "Une façon de combiner les deux\u00a0: remplir d'abord le PEA (150 000 € de versements au plus) avec un MSCI World éligible — CW8, ou WPEA et DCAM à 0,20\u00a0% —, puis un compte-titres avec VWCE pour les versements au-delà. La fiscalité du PEA s'applique ainsi au plus grand montant possible, et VWCE ajoute les émergents au-delà du plafond.",
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
    "Le vrai débat VWCE vs CW8 n'existe que si vous avez un CTO ouvert ou si vous saturez votre PEA. Pour la majorité des investisseurs français en phase d'accumulation, le PEA est prioritaire (fiscalité bien meilleure après 5 ans), donc CW8 ou WPEA gagnent par défaut. La question devient intéressante quand on dépasse le plafond PEA (150 000 € de versements — atteint au bout de 62 ans et demi à 200 €/mois, mais de 12 ans et demi à 1 000 €/mois). Si vous pensez dépasser ce plafond dans votre horizon d'investissement, VWCE est une option pour prolonger sur CTO. À noter : l'exposition émergents (~10 % du VWCE) ajoute un petit gain de diversification mais aussi de volatilité — les marchés émergents ont historiquement sous-performé les développés sur les 10 dernières années.",

  faq: [
    {
      q: "VWCE est-il vraiment plus diversifié que CW8 ?",
      a: "Oui — le FTSE All-World couvre environ 3 700 sociétés sur 49 pays, contre environ 1 300 sur 23 pays pour le MSCI World (1 280 au 31/08/2026 selon MSCI). La différence vient principalement des marchés émergents (~10-12 % du VWCE) : Chine, Inde, Taïwan, Corée du Sud, Brésil, etc. Ces pays ne sont pas inclus dans le MSCI World.",
    },
    {
      q: "Pourquoi VWCE n'est-il pas éligible PEA ?",
      a: "Un ETF est éligible au PEA s'il détient plus de 75 % d'actions de sociétés de l'UE ou de l'EEE (l'Espace économique européen). VWCE est physique et détient réellement des actions majoritairement non européennes (notamment américaines) : il ne remplit pas le critère. CW8 le remplit autrement : il détient un panier d'actions européennes et échange sa performance, par un swap, contre celle du MSCI World. Mais être synthétique ne suffit pas — les ETF S&P 500, Nasdaq-100 et émergents « Swap » d'Amundi (500, ANX, AEEM) le sont aussi, et ne sont pas éligibles.",
    },
    {
      q: "Faut-il avoir peur du risque de change avec VWCE ?",
      // 30/09/2026 : « neutre sur le long terme », « effet moyen proche de zéro
      // sur 20 ans » (sans source) et « Ne pas s'en soucier » (une consigne)
      // retirés ; reste ce qui se vérifie.
      a: "VWCE est libellé en USD mais peut se négocier en EUR selon la bourse. Sa devise de cotation ne change pas son exposition\u00a0: le risque de change vient des devises des sociétés détenues, surtout le dollar. CW8 y est exposé aussi, puisque les États-Unis pèsent 72,14\u00a0% du MSCI World au 31 août 2026, selon MSCI.",
    },
    {
      // 28/09/2026 (grilles courtiers) : la présence de VWCE dans les plans
      // Trade Republic n'est pas vérifiée ; BoursoBank est le nom actuel.
      q: "Peut-on acheter VWCE chez Trade Republic / BoursoBank / Fortuneo ?",
      a: "Oui, VWCE est disponible chez la quasi-totalité des courtiers européens, en compte-titres. Chez Trade Republic, un plan d'investissement programmé s'exécute sans frais d'achat, et un ordre ponctuel coûte 1 € : vérifiez dans l'application que VWCE est proposé en plan. Chez BoursoBank et Fortuneo, les frais d'ordre du compte-titres s'appliquent.",
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
  updatedAt: "2026-09-30",
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
    // 30/09/2026 : « deux fois inférieur » n'est pas français.
    strongPoint: `TER presque deux fois moins élevé que celui de CW8 · ${WPEA_TAILLE.encours} d'encours ${WPEA_TAILLE.encoursAu}`,
    weakPoint: "ETF récent (lancé en mars 2024) — historique plus court que CW8",
  },

  verdict:
    `WPEA gagne sur les frais (0,20 % vs 0,38 %) pour la même exposition MSCI World et la même éligibilité PEA. Sur 20 ans à 200 €/mois et 7 %/an net, ces 0,18 % de TER en moins représentent environ ${ecartCapital(0.38, 0.2)} € de capital final supplémentaire. CW8 garde l'avantage de l'antériorité. Pour une ouverture de position en 2026, WPEA — comme DCAM, au même TER — coûte moins cher que CW8 pour une exposition identique.`,

  intro:
    "Pendant des années, CW8 (Amundi MSCI World) a été l'ETF de référence pour s'exposer au monde développé dans un PEA français. En mars 2024, iShares a lancé WPEA — un MSCI World éligible au PEA, coté à Paris depuis avril 2024, aujourd'hui à un TER presque deux fois plus bas. Deux ETF qui répliquent le même indice, avec des frais qui changent significativement la performance à long terme. Voici comment trancher.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "MSCI World", rightValue: "MSCI World (identique)" },
    { criterion: "Émetteur", leftValue: "Amundi", rightValue: "iShares (BlackRock)" },
    { criterion: "TER", leftValue: "0,38 %/an", rightValue: "0,20 %/an" },
    // Les lignes « Encours » et « Liquidité » comparaient CW8 et WPEA sans
    // aucune source pour CW8 ; retirées le 28/09/2026. L'ISIN, lui, est vérifié.
    { criterion: "ISIN", leftValue: "LU1681043599", rightValue: "IE0002XZSHO1" },
    // 30/09/2026 : prix de part (table de vérité) et encours (justETF) de WPEA.
    // Pour CW8, la table ne donne ni l'un ni l'autre : la case le dit, au lieu
    // d'un chiffre repris d'un autre site (3,5, 5,8 ou 6,4 Md€ selon la page).
    // 09/10/2026 : le tableau des frais d'ordre de cette page cite désormais
    // le prix d'une part de CW8 publié par Amundi (8/10/2026), pour dire qu'un
    // achat de 200 € n'en achète pas une entière ; la case le donne aussi, au
    // lieu de « Non vérifié par le site ». L'encours reste non vérifié ici.
    { criterion: "Prix de part", leftValue: `${prixPartEnviron(TAILLE_AMUNDI_8_OCTOBRE.CW8)} le ${dateEnToutesLettres(TAILLE_AMUNDI_8_OCTOBRE.CW8.au)} selon ${TAILLE_AMUNDI_8_OCTOBRE.CW8.source}`, rightValue: `Sous 10\u00a0€ (${WPEA_TAILLE.prixPart} le ${WPEA_TAILLE.prixAu})` },
    { criterion: "Encours", leftValue: "Non vérifié par le site", rightValue: `${WPEA_TAILLE.encours} ${WPEA_TAILLE.encoursAu}` },
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
        // 30/09/2026 : « orienter vos versements vers WPEA », « bascule complète
        // seulement si… » étaient des consignes ; et les plus-values latentes ne
        // coûtent rien à arbitrer dans un PEA. La phrase décrit.
        "Rien n'oblige à vendre\u00a0: l'encours CW8 continue de capitaliser, et dans le PEA, un arbitrage ne déclenche pas d'impôt. Pour les versements suivants, WPEA et DCAM coûtent 0,20\u00a0% par an contre 0,38\u00a0%. Vendre pour racheter coûte deux frais d'ordre, à mettre en regard de l'écart de TER sur le montant concerné\u00a0: sur un petit montant, les frais d'ordre peuvent dépasser l'économie.",
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
        // 30/09/2026 : « aucune raison rationnelle de payer… » (une consigne) et
        // « émetteur de référence » (sans source) retirés.
        "À indice identique, l'écart de TER se retrouve mécaniquement dans la performance, année après année\u00a0: CW8 coûte 90\u00a0% de plus que WPEA (0,38\u00a0% contre 0,20\u00a0% par an) pour la même exposition.",
    },
  ],

  // 30/09/2026 : la « règle de pouce » (basculer sous 10 000 euros d'encours,
  // garder au-delà) était un seuil personnel sans source ; retirée.
  analysis:
    `Avant 2024, les ETF MSCI World éligibles au PEA étaient ceux d'Amundi, CW8 et sa part distribuante EWLD, à 0,38 %. iShares a lancé WPEA en 2024 sur exactement le même indice, à 0,20 % — et Amundi a lancé DCAM en mars 2025 au même tarif. Pour qui démarre aujourd'hui, le calcul est net : 0,18 % de TER en moins par an, ça représente environ ${ecartCapital(0.38, 0.2)} € de capital final en plus sur 20 ans (à 7 %/an, aux hypothèses du tableau). Pour qui a déjà construit une position CW8, la question est plus nuancée\u00a0: vendre coûte des frais d'ordre, sans impôt tant que l'argent reste dans le PEA. Le calcul se fait cas par cas\u00a0: frais de la vente et du rachat d'un côté, écart de TER de 0,18 point par an sur le montant concerné de l'autre.`,

  faq: [
    {
      q: "WPEA est-il vraiment équivalent à CW8 ?",
      a: "Oui, sur l'exposition : même indice MSCI World, même couverture (~1 300 sociétés, 23 pays développés), même politique capitalisante, même éligibilité PEA via réplication synthétique. Les différences tiennent au TER (0,20\u00a0% contre 0,38\u00a0%), à l'émetteur (iShares contre Amundi) et à l'ancienneté\u00a0: WPEA n'existe que depuis mars 2024. En termes de risque sous-jacent, ils sont substituables.",
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
      a: "WPEA est coté sur Euronext Paris depuis avril 2024, mais sa présence dépend du catalogue de chaque courtier. À vérifier avant d'ouvrir la position — certaines banques traditionnelles tardent à référencer les ETF récents —, en contrôlant l'ISIN dans l'écran d'ordre : IE0002XZSHO1. S'il n'y figure pas, le service client du courtier peut dire s'il est prévu de le référencer.",
    },
    {
      q: "Le risque de contrepartie est-il identique entre CW8 et WPEA ?",
      // 30/09/2026 : « 10 % de l'actif net » corrigé (R214-21) ; « aucune perte »
      // et « négligeable » n'avaient pas de source.
      a: "Les deux utilisent une réplication synthétique par swap. Le risque de contrepartie est plafonné par la réglementation européenne des fonds (UCITS)\u00a0: l'exposition à une même contrepartie ne peut pas dépasser 10\u00a0% de l'actif du fonds quand c'est un établissement de crédit, 5\u00a0% dans les autres cas. Le même plafond s'applique aux deux.",
    },
    {
      q: "Vaut-il le coup de vendre mon CW8 pour racheter du WPEA ?",
      // 30/09/2026 : les seuils (10 000 euros, 15 ans, 10 ans) n'avaient pas de
      // source et répondaient à la place du lecteur. La réponse donne les
      // éléments du calcul, pas son résultat.
      a: "Cela dépend du montant, des frais d'ordre de votre courtier et de votre horizon\u00a0: le site ne peut pas trancher à votre place. Dans un PEA, vendre du CW8 pour racheter du WPEA ne déclenche pas d'impôt. Le coût, ce sont deux frais d'ordre (au plus 0,5\u00a0% du montant chacun, plafond légal) et l'écart entre prix d'achat et de vente. En face, l'écart de TER est de 0,18 point par an sur le montant arbitré. Garder CW8 reste possible\u00a0: il continue de suivre le même indice.",
    },
    {
      q: "Et DCAM dans tout ça ?",
      // Cette réponse tranchait le duel WPEA/DCAM — qui a sa propre page.
      // Mesuré sur 90 jours : cette page captait 60 impressions sur les
      // requêtes « dcam vs wpea » / « wpea vs dcam » / « wpea ou dcam », que
      // /comparatif-etf/wpea-vs-dcam sert mieux (position 6,6 contre 8,3).
      // La cannibalisation était RÉCIPROQUE, pas subie : on rend ce qu'on
      // prenait avant de réclamer ce qu'on nous prend.
      a: "DCAM joue dans la même catégorie que WPEA — même TER de 0,20 %, même réplication synthétique, même éligibilité PEA — et le départager demande d'entrer dans le détail de l'encours et de la disponibilité chez les courtiers. C'est le sujet de notre comparatif WPEA vs DCAM. Ici, il suffit de noter que les deux coûtent moins que CW8 en frais annuels (0,20\u00a0% contre 0,38\u00a0%).",
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
  updatedAt: "2026-09-30",
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
    strongPoint: `Le plus ancien des deux (lancé en mars 2024) · le plus gros encours (${WPEA_TAILLE.encours} ${WPEA_TAILLE.encoursAu})`,
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
    strongPoint: `${DCAM_TAILLE.encours} d'encours ${DCAM_TAILLE.encoursAu}, dix-huit mois après son lancement · fonds de droit français`,
    weakPoint: "Le plus récent (mars 2025) — historique de réplication plus court",
  },

  // 30/09/2026 : dates de lancement et encours chiffrés (montant justETF
  // arrondi, daté et sourcé, voir sources-etf.ts). La dernière phrase disait
  // « prenez celui qu'il propose avec les frais d'ordre les plus bas » : un
  // ordre, sur un site qui n'a pas le statut de conseiller. Elle renvoie
  // désormais au tableau des frais d'ordre, qui décrit sans classer.
  verdict:
    `Égalité sur tout ce qui fait la performance\u00a0: même indice MSCI World, même TER de 0,20\u00a0% par an, même réplication synthétique, même éligibilité au PEA, et deux parts sous 10\u00a0€, donc aucune différence de souplesse pour un petit versement mensuel. Ce qui les sépare est secondaire\u00a0: WPEA a un an d'historique de plus (lancé le 26 mars 2024, DCAM le 4 mars 2025) et un encours plus gros, ${WPEA_TAILLE.encours} contre ${DCAM_TAILLE.encours} ${WPEA_TAILLE.encoursAu}. Le vrai départage est chez votre courtier\u00a0: la disponibilité de chaque ligne et le coût d'un ordre, détaillé plus bas pour trois courtiers.`,

  intro:
    "C'est le duel le plus récent du PEA : iShares a lancé WPEA en 2024, face aux ETF MSCI World d'Amundi facturés 0,38 %, et Amundi a lancé DCAM en mars 2025 — même indice, même 0,20 %. Pour l'investisseur, c'est une excellente nouvelle : la concurrence a divisé les frais par près de deux par rapport au CW8 historique (0,38 %). Reste à choisir entre deux jumeaux.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "MSCI World", rightValue: "MSCI World (identique)" },
    { criterion: "TER", leftValue: "0,20 %/an", rightValue: "0,20 %/an (identique)" },
    { criterion: "Émetteur", leftValue: "iShares (BlackRock)", rightValue: "Amundi (Crédit Agricole)" },
    { criterion: "Lancement", leftValue: "Mars 2024 (cotation à Paris en avril)", rightValue: "Mars 2025" },
    // 30/09/2026 : ordre de grandeur daté, jamais au centime (règle 2 de la table).
    { criterion: "Prix de part", leftValue: `Sous 10\u00a0€ (${WPEA_TAILLE.prixPart} le ${WPEA_TAILLE.prixAu})`, rightValue: `Sous 10\u00a0€ (${DCAM_TAILLE.prixPart} le ${DCAM_TAILLE.prixAu}) — aucun écart utile` },
    // 29/09/2026 : « ≈ 2,1 Md€ / ≈ 1,4 Md€ » — la table et justETF divergent
    // (encours-a-trancher). Le « plus de 1 Md€ » qui les remplaçait était vrai
    // mais vague ; 30/09/2026 : montant justETF arrondi, daté et sourcé.
    { criterion: "Encours", leftValue: `${WPEA_TAILLE.encours} ${WPEA_TAILLE.encoursAu} (le plus gros)`, rightValue: `${DCAM_TAILLE.encours} ${DCAM_TAILLE.encoursAu}` },
    { criterion: "Domicile du fonds", leftValue: "Irlande", rightValue: "France" },
    { criterion: "Réplication", leftValue: "Synthétique", rightValue: "Synthétique" },
    { criterion: "Éligibilité PEA", leftValue: "Oui", rightValue: "Oui" },
  ],

  useCases: [
    {
      profile: "DCA de petits montants (50-200 €/mois)",
      winner: "both",
      explanation:
        // 30/09/2026 : « Prenez celui que… » était un ordre ; la phrase décrit.
        "Les deux parts cotent sous 10\u00a0€\u00a0: même un petit versement mensuel s'investit presque entièrement, avec l'un comme avec l'autre. Ce qui les départage alors, c'est ce que votre courtier facture pour un ordre.",
    },
    {
      // 28/09/2026 : « Trade Republic » en exemple d'achat fractionné, sur deux
      // ETF de PEA — or rien d'officiel ne confirme les fractions dans son PEA.
      profile: "Courtier avec achat fractionné",
      winner: "both",
      explanation:
        "Avec l'achat fractionné, le prix de part ne compte plus du tout : restent la disponibilité de chaque ligne et les frais d'ordre chez votre courtier. Dans un PEA, vérifiez auprès de votre courtier que les fractions y sont bien proposées.",
    },
    {
      profile: "Préférence pour la diversification des émetteurs",
      winner: "left",
      explanation:
        // 30/09/2026 : « prendre l'émetteur concurrent » se lisait comme une consigne.
        "Si votre portefeuille est déjà très exposé à Amundi (CW8, PSP5, PUST…), un fonds d'un autre émetteur répartit le risque opérationnel — un argument de confort plus que de performance.",
    },
    {
      profile: "Investisseur qui veut le maximum d'antériorité et d'encours",
      winner: "left",
      explanation:
        "WPEA a un an d'historique de plus et l'encours le plus élevé des deux. C'est court dans les deux cas, mais si l'historique vous rassure, WPEA a l'avantage — en sachant que les deux émetteurs sont des géants éprouvés.",
    },
  ],

  // 30/09/2026 : « la meilleure dynamique possible » (superlatif), « n'attendez
  // aucune différence » et « basculez simplement vos achats futurs vers WPEA
  // ou DCAM » (une consigne d'achat nominative) retirés ; la phrase décrit.
  analysis:
    "Ce duel montre ce que la concurrence fait aux frais. Jusqu'en 2024, les ETF MSCI World éligibles au PEA étaient facturés 0,38\u00a0% (CW8, EWLD). WPEA, lancé en 2024, est aujourd'hui à 0,20\u00a0%, comme DCAM, arrivé en 2025. Sur la performance, aucune différence significative n'est à attendre\u00a0: même indice, même mécanisme de swap encadré par la réglementation européenne des fonds (UCITS), même TER. Les écarts de suivi, entre chaque fonds et son indice, devraient se jouer au centième de point. Ce qui les départage est donc pratique\u00a0: la disponibilité de chaque ligne et les frais d'ordre chez votre courtier. Pour du CW8 acheté avant 2024, rien n'oblige à vendre, et un arbitrage dans le PEA ne déclenche pas d'impôt\u00a0; pour les nouveaux versements, CW8 coûte toujours 0,38\u00a0% par an, contre 0,20\u00a0% pour WPEA et DCAM, sur le même indice.",

  faq: [
    {
      q: "WPEA et DCAM ont-ils exactement la même performance ?",
      a: "En théorie oui : même indice MSCI World, même TER de 0,20 %, même réplication synthétique. En pratique, de micro-écarts de suivi (qualité du swap, coûts de rééquilibrage) peuvent apparaître, de l'ordre du centième de pourcent par an. Aucun des deux n'a d'avantage structurel sur l'autre.",
    },
    {
      q: "Je détiens déjà du CW8 : dois-je vendre pour acheter WPEA ou DCAM ?",
      // 30/09/2026 : « conserver… et diriger vos nouveaux versements vers WPEA
      // ou DCAM », « faites le calcul » : des consignes. La réponse décrit.
      a: "Rien n'y oblige. Dans un PEA, vendre du CW8 pour racheter du WPEA ou du DCAM ne déclenche pas d'impôt, mais coûte deux frais d'ordre. Garder le CW8 existant reste possible\u00a0: il suit le même indice. Pour de nouveaux versements, WPEA et DCAM coûtent 0,20\u00a0% par an contre 0,38\u00a0% pour CW8. Un arbitrage complet se juge sur le montant concerné\u00a0: frais d'ordre de la vente et du rachat d'un côté, écart de TER de l'autre.",
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
      a: "Les deux sont éligibles au PEA — c'est écrit dans leur document d'informations clés. En pratique, la disponibilité dépend du catalogue de votre courtier. Les frais d'ordre peuvent aussi différer d'un ETF à l'autre chez un même courtier, quand l'un fait partie d'une gamme à frais réduits\u00a0: le tableau des frais d'ordre, plus haut, le signale.",
    },
  ],

  tags: ["PEA", "MSCI World", "frais"],
};

// ─── IWDA vs CW8 ──────────────────────────────────────────────────────────────

const IWDA_VS_CW8: ETFComparison = {
  slug: "iwda-vs-cw8",
  publishedAt: "2026-06-10",
  updatedAt: "2026-09-30",
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

  // 30/09/2026 : « Si votre PEA n'est pas plein : MSCI World en PEA (et
  // plutôt WPEA ou DCAM) » était une consigne ; la fin du verdict décrit.
  verdict:
    `Le match n'est pas « physique vs synthétique » mais « PEA vs CTO » — et le PEA gagne presque toujours. Sur 20 ans à 200 €/mois (≈ ${capitalPour(0)} € avant frais, dont ≈ ${gainsPour(0)} € de gains), la fiscalité PEA (18,6 %) économise environ ${ecartFiscalEnviron(gainsBruts(0))} € d'impôt par rapport au CTO (PFU 31,4 %). Cet écart écrase largement les 0,18 % de TER d'avantage d'IWDA. Tant que le PEA n'est pas plein, un MSCI World y est donc moins taxé qu'en CTO\u00a0; pour de nouveaux achats, WPEA et DCAM y coûtent 0,20\u00a0% par an, contre 0,38\u00a0% pour CW8. IWDA garde un intérêt en CTO une fois le PEA plafonné, ou pour qui tient à la réplication physique.`,

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
    // 30/09/2026 : « 10 % max » sans son cas (R214-21 : 10 % pour un
    // établissement de crédit, 5 % sinon).
    { criterion: "Risque de contrepartie", leftValue: "Aucun (détention directe)", rightValue: "Plafonné par les règles européennes des fonds (UCITS)\u00a0: 10\u00a0% de l'actif par établissement de crédit, 5\u00a0% sinon" },
  ],

  useCases: [
    {
      profile: "PEA non plafonné (moins de 150 000 € de versements)",
      winner: "right",
      explanation:
        "L'avantage fiscal du PEA (18,6 % vs 31,4 % sur les gains) écrase l'écart de TER. Et pour de nouveaux achats en PEA, WPEA et DCAM (0,20\u00a0%) coûtent encore moins que CW8 — même enveloppe, frais presque divisés par deux.",
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
        "Si le mécanisme de swap vous dérange par principe, IWDA détient réellement les actions de l'indice (environ 1 300). C'est un confort psychologique légitime — mais il se paie 13 points de fiscalité en sortant du PEA.",
    },
    {
      profile: "Expatriation prévue / situation fiscale non française",
      winner: "left",
      explanation:
        "Le PEA est un dispositif fiscal français. Si vous prévoyez de quitter la France à moyen terme, l'avantage PEA s'érode et la portabilité d'un CTO avec IWDA peut être préférable. Cas particulier — à valider avec un conseiller.",
    },
  ],

  // 30/09/2026 : « même le pire ETF… bat IWDA » (superlatif) et « la
  // hiérarchie de décision correcte » (une consigne) reformulés.
  analysis:
    `La comparaison IWDA vs CW8 est l'exemple type d'une optimisation au mauvais étage. L'écart de TER (0,18 %) représente environ ${ecartCapital(0.38, 0.2)} € sur 20 ans à 200 €/mois. L'écart d'enveloppe fiscale (18,6 % vs 31,4 % sur ~${gainsPour(0.38)} € de gains) en représente environ ${ecartFiscalEnviron(gainsBruts(0.38))} € — et il s'applique APRÈS l'effet des frais. Autrement dit\u00a0: aux hypothèses de cette page, même CW8, à 0,38\u00a0%, fait mieux qu'IWDA en CTO pour un résident fiscal français qui n'a pas plafonné son PEA. Dans l'ordre de ce qui pèse sur le résultat\u00a0: 1) l'enveloppe (18,6\u00a0% contre 31,4\u00a0% sur les gains), 2) les frais à l'intérieur de l'enveloppe (0,20\u00a0% pour WPEA et DCAM, 0,38\u00a0% pour CW8), 3) la réplication, qui est un critère de confort. Le swap des ETF synthétiques est encadré par la réglementation européenne des fonds (UCITS)\u00a0: l'exposition à une même contrepartie est plafonnée à 10\u00a0% de l'actif quand c'est un établissement de crédit, 5\u00a0% sinon — un risque réel, sans commune mesure avec 13 points de fiscalité.`,

  faq: [
    {
      q: "IWDA peut-il être logé dans un PEA ?",
      a: "Non. IWDA est en réplication physique : il détient majoritairement des actions non européennes (environ 72 % d'actions américaines), ce qui le rend incompatible avec les règles du PEA. Seuls les ETF World à réplication synthétique (CW8, WPEA, DCAM, EWLD…) sont éligibles PEA.",
    },
    {
      q: "Le TER plus bas d'IWDA ne compense-t-il jamais la fiscalité ?",
      a: `Sur les hypothèses classiques (20 ans, 200 €/mois, 7 %/an), non : l'économie de TER (~${ecartCapital(0.38, 0.2)} €) reste inférieure au surcoût fiscal du CTO (~${ecartFiscalEnviron(gainsBruts(0.38))} €). Et ce raisonnement compare IWDA au CW8 (0,38 %) — face à WPEA ou DCAM (0,20 % en PEA), IWDA n'a plus aucun avantage de frais, il ne reste que le débat physique vs synthétique.`,
    },
    {
      q: "La réplication synthétique est-elle dangereuse ?",
      // 30/09/2026 : plafond précisé (R214-21) ; « jamais matérialisé en 20 ans »
      // et la collatéralisation quotidienne n'avaient pas de source.
      a: "Le swap introduit un risque de contrepartie, que la réglementation européenne des fonds (UCITS) plafonne\u00a0: l'exposition à une même contrepartie ne peut pas dépasser 10\u00a0% de l'actif du fonds quand c'est un établissement de crédit, 5\u00a0% dans les autres cas. C'est un risque réel, mais borné.",
    },
    {
      q: "Et en assurance-vie ?",
      a: "IWDA (ou des fonds World équivalents) est disponible dans certaines assurances-vie en unités de compte. La fiscalité de l'AV après 8 ans (abattement annuel + taux réduit) peut s'approcher de celle du PEA, mais les frais d'UC (0,5-1 %/an de frais de gestion du contrat) dégradent souvent le bilan. Dans un PEA, après 5 ans, seuls les prélèvements sociaux de 18,6\u00a0% s'appliquent aux gains.",
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
  updatedAt: "2026-09-30",
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

  // 30/09/2026 : « Règle simple : … PSP5 est le moins cher ; sinon… » se
  // lisait comme une consigne ; même contenu, au conditionnel.
  verdict:
    `PSP5 gagne sur le papier (0,12 % vs 0,14 %) mais l'écart réel est minime : environ ${ecartCapital(0.14, 0.12)} € sur 20 ans à 200 €/mois. À ce niveau, vos frais d'ordre et la disponibilité chez votre courtier pèsent plus lourd que le TER. Si votre courtier propose les deux aux mêmes conditions, PSP5 coûte un peu moins\u00a0; sinon, ce sont les frais de transaction de chacun qui les départagent. Et un troisième S&P 500 éligible PEA, SPEA (iShares), descend à 0,10 %.`,

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
        "PSP5 à 0,12 % est le moins cher des deux. Si votre courtier le référence aux mêmes frais d'ordre qu'ESE, l'écart de 0,02 point joue en sa faveur — et SPEA (iShares), à 0,10\u00a0%, coûte encore moins.",
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
        // 30/09/2026 : « Prenez le moins cher en frais d'ordre… » était un ordre,
        // qui se lisait comme la consigne de prendre le courtier le moins cher
        // du tableau des frais d'ordre ajouté juste au-dessus.
        "Sur de petits ordres réguliers, le spread est négligeable et les deux font le même travail. Ce qui les départage alors, ce sont les frais d'ordre de chacun chez votre courtier.",
    },
  ],

  // 30/09/2026 : « choisissez vite, investissez tôt » (une consigne) et les
  // équivalences sans calcul (« un mois de retard à investir ») retirées.
  analysis:
    `Ce match illustre la notion de seuil de pertinence des frais. Passer de 0,38 % à 0,20 % (CW8 → WPEA) économise ~${ecartCapital(0.38, 0.2)} € sur 20 ans : ça vaut une décision. Passer de 0,14 % à 0,12 % en économise ~${ecartCapital(0.14, 0.12)} € : c'est réel, mais d'autres coûts absents du TER peuvent peser autant, comme les frais d'ordre ou l'écart entre prix d'achat et de vente. Autrement dit, entre deux ETF aussi proches, l'écart de frais ne justifie pas de longues hésitations. Rappel utile\u00a0: le S&P 500 en PEA passe par la réplication synthétique (les actions américaines ne sont pas éligibles en direct), mécanisme encadré par la réglementation européenne des fonds (UCITS). Et si vous hésitez encore entre S&P 500 et MSCI World, c'est une décision plus structurante que ESE vs PSP5 — le World contient déjà environ 72 % d'actions américaines.`,

  faq: [
    {
      q: "ESE ou PSP5 : lequel performe le mieux ?",
      a: `Même indice, même mécanisme : la différence théorique est l'écart de TER (0,02 %/an en faveur de PSP5), soit ~${ecartCapital(0.14, 0.12)} € sur 20 ans à 200 €/mois. Les écarts de tracking réels peuvent ponctuellement inverser ce classement une année donnée. En pratique : équivalents.`,
    },
    {
      q: "Pourquoi pas un S&P 500 physique comme CSPX ou VUSA ?",
      a: "CSPX (iShares) et VUSA (Vanguard) sont des ETF S&P 500 physiques à 0,07\u00a0% — mais ils ne sont PAS éligibles PEA (actions américaines détenues en direct). Ils se logent en CTO ou assurance-vie. En PEA, la réplication synthétique est le passage obligé pour le S&P 500.",
    },
    {
      q: "Et SPEA, le S&P 500 d'iShares pour le PEA ?",
      a: `SPEA (iShares S&P 500 Swap PEA UCITS ETF EUR (Acc), ISIN IE000DQLYVB9), lancé le 29 mai 2025, réplique le même S&P 500 à 0,10 % de TER : le moins cher des S&P 500 éligibles PEA de notre sélection. Face à PSP5, l'écart vaut environ ${ecartCapital(0.12, 0.1)} € sur 20 ans aux hypothèses de cette page — le même ordre de grandeur que l'écart ESE/PSP5.`,
    },
    {
      q: "Puis-je détenir ESE et PSP5 en même temps ?",
      // 30/09/2026 : « conservez-le et concentrez vos nouveaux versements »
      // était une consigne.
      a: "Techniquement oui, mais c'est inutile\u00a0: ils répliquent le même indice. Détenir les deux n'apporte aucune diversification, seulement de la complexité, et en détenir déjà un ne donne aucune raison d'acheter l'autre.",
    },
    {
      q: "S&P 500 ou MSCI World pour mon PEA ?",
      // 30/09/2026 : un « ! » et « le World est souvent recommandé » (sans
      // source, et une recommandation) retirés.
      a: "C'est une question plus structurante que ESE contre PSP5. Le MSCI World est composé d'environ 72\u00a0% d'actions américaines (72,14\u00a0% au 31/08/2026 selon MSCI) mais ajoute le Japon, l'Europe, le Canada… Le S&P 500 pur est un pari assumé sur la poursuite de la domination américaine. Le S&P 500 concentre le risque sur un pays, le MSCI World le répartit sur 23 pays développés\u00a0: le détail est dans notre comparatif MSCI World vs S&P 500.",
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
  updatedAt: "2026-09-30",
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
    // 30/09/2026 : « l'enveloppe fiscale la plus avantageuse de France » :
    // superlatif sans source. Remplacé par le taux, qui se vérifie.
    strongPoint: "MSCI World à 0,20\u00a0% dans un PEA (18,6\u00a0% de prélèvements sur les gains après 5 ans)",
    weakPoint: "Pas d'exposition aux marchés émergents (Chine, Inde, Brésil…)",
  },

  // 30/09/2026 : « dans la grande majorité des cas » (sans source) et « VWCE
  // redevient le meilleur choix » (superlatif) reformulés.
  verdict:
    `Pour un résident fiscal français avec un PEA non plafonné, WPEA l'emporte aux hypothèses de cette page\u00a0: l'avantage fiscal du PEA (18,6 % vs 31,4 % sur les gains, soit ≈ ${ecartFiscalEnviron(gainsBruts(0.2))} € sur 20 ans à 200 €/mois) dépasse largement le bénéfice attendu des ~10 % d'émergents de VWCE — et aussi son avantage de frais (0,14 % contre 0,20 %, ≈ ${ecartCapital(0.2, 0.14)} € sur la même période). Et si les émergents vous tiennent à cœur, l'association WPEA + PAEEM (émergents éligibles PEA) approche l'exposition All-World… en restant dans le PEA. En CTO (PEA plein) ou en assurance-vie, cet avantage fiscal disparaît, et VWCE garde ses atouts de frais et de diversification.`,

  intro:
    "VWCE, c'est tout le marché mondial, émergents compris, en un seul fonds Vanguard. WPEA est le MSCI World optimisé pour le PEA français. Le débat « faut-il les émergents ? » est légitime — mais pour un investisseur français, il est presque toujours tranché par un facteur que les comparatifs européens ignorent : l'enveloppe fiscale.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "FTSE All-World (~3 700 sociétés)", rightValue: "MSCI World (~1 300 sociétés)" },
    { criterion: "Marchés émergents", leftValue: "Oui (~10 % de l'indice)", rightValue: "Non" },
    { criterion: "TER", leftValue: "0,14 %/an", rightValue: "0,20 %/an" },
    { criterion: `Écart de frais — 20 ans à ${HYPOTHESES_COMPARATIFS.monthlyAmount} €/mois`, leftValue: `≈ ${ecartCapital(0.2, 0.14)} € de capital final en plus`, rightValue: "Référence" },
    { criterion: "Réplication", leftValue: "Physique optimisée", rightValue: "Synthétique (swap)" },
    { criterion: "Éligibilité PEA", leftValue: "Non", rightValue: "Oui" },
    // 30/09/2026 : même principe que sur cw8-vs-wpea — WPEA documenté, VWCE non.
    { criterion: "Encours", leftValue: "Non vérifié par le site", rightValue: `${WPEA_TAILLE.encours} ${WPEA_TAILLE.encoursAu}` },
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
        // 30/09/2026 : « Combinez… » était un ordre.
        "L'association WPEA (~90\u00a0%) + PAEEM (Amundi PEA Emergent ESG Transition, éligible PEA, 0,30\u00a0%) (~10\u00a0%) approche l'exposition All-World en conservant la fiscalité PEA — PAEEM suit une variante « ESG Transition » du MSCI Emerging Markets, pas l'indice standard. Un ordre de plus par mois, quelques milliers d'euros d'impôt en moins à l'arrivée. (AEEM, l'autre ETF émergents d'Amundi, n'est pas éligible au PEA.)",
    },
    {
      profile: "PEA plafonné ou non-résident",
      winner: "left",
      explanation:
        "Sans l'avantage PEA, VWCE retrouve ses atouts\u00a0: développés et émergents, réplication physique, TER plus bas que WPEA (0,14 %), un seul fonds à gérer en CTO.",
    },
    {
      profile: "Allergie au synthétique",
      winner: "left",
      explanation:
        "WPEA est synthétique (obligatoire pour l'éligibilité PEA d'un indice mondial). Si vous refusez le swap par principe, VWCE physique en CTO est l'alternative cohérente — en connaissance du surcoût fiscal.",
    },
  ],

  analysis:
    `Les comparatifs européens de VWCE ne tiennent jamais compte du PEA — c'est pourtant le facteur décisif pour un investisseur français. Posons les ordres de grandeur sur 20 ans à 200 €/mois et 7 %/an : capital avant frais ≈ ${capitalPour(0)} €, dont ≈ ${gainsPour(0)} € de gains. En PEA (WPEA), prélèvements sociaux de 18,6 % ≈ ${impotPEAEnviron(gainsBruts(0))} €. En CTO (VWCE), PFU de 31,4 % ≈ ${impotCTOEnviron(gainsBruts(0))} €. L'écart (~${ecartFiscalEnviron(gainsBruts(0))} €) représente plusieurs fois l'avantage de frais de VWCE (0,14 % contre 0,20 %, ≈ ${ecartCapital(0.2, 0.14)} €) et l'impact espéré des émergents : sur les 30 dernières années, développés et émergents ont alterné les périodes de sur/sous-performance, sans gagnant structurel — et les émergents ne pèsent que ~10 % de l'All-World, diluant leur effet. Ce que montrent ces ordres de grandeur\u00a0: l'enveloppe pèse plus que l'indice. Tant que le PEA n'est pas plein, WPEA (ou WPEA + PAEEM) y profite des 18,6\u00a0%\u00a0; au-delà, VWCE en CTO garde ses atouts de frais et de diversification.`,

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
      // 30/09/2026 : « la stratégie habituelle : conserver… et diriger les
      // nouveaux versements vers… » (une consigne, sans source) reformulée.
      a: "Vendre déclencherait l'imposition immédiate des plus-values latentes (PFU 31,4\u00a0%). Garder le VWCE existant évite cet impôt, et rien n'empêche de faire les nouveaux versements dans un PEA (WPEA, DCAM…) jusqu'à son plafond. Au-delà de ces principes, la réponse dépend des montants\u00a0: un conseiller peut faire le calcul avec vous.",
    },
  ],

  tags: ["PEA", "CTO", "MSCI World", "All-World", "émergents"],
};

// ─── Duels du 09/10/2026 : CW8 vs DCAM, GPEA vs DCAM ──────────────────────────
//
// Pourquoi ces deux paires (Search Console, 28 jours au 06/10/2026) :
// · CW8/DCAM : environ 95 impressions sur quatre variantes (« cw8 vs dcam »,
//   « dcam vs cw8 », « cw8 ou dcam », « dcam ou cw8 »), servies en position
//   6 à 10 par des pages qui ne leur sont pas consacrées. 51 impressions avec
//   CW8 en premier contre 44 : slug cw8-vs-dcam, convention du site
//   (cw8-vs-wpea, cw8-vs-ese). Le metaTitle met DCAM en tête et dit « ou »
//   pour couvrir l'autre ordre, sans créer une seconde URL pour la même paire.
// · GPEA/DCAM : 15 impressions, position 6,5 ; GPEA a été créé le 06/07/2026,
//   même schéma que la paire WPEA/DCAM (fonds récents, peu de concurrence).
//
// Une intention par URL : wpea-vs-dcam = les deux jumeaux à 0,20 % (iShares ou
// Amundi) ; cw8-vs-wpea = quitter CW8 pour iShares ; cw8-vs-dcam = rester chez
// Amundi et passer à sa part à 0,20 % ; gpea-vs-dcam = World ou ACWI. Les H1
// ne contiennent pas « WPEA » : ils s'affichent au pied de wpea-vs-dcam.
// Après la surveillance de wpea-vs-dcam (~23/10/2026), lot séparé : retirer
// « et où se place DCAM » de la meta de cw8-vs-wpea et faire pointer sa FAQ
// « Et DCAM dans tout ça ? » aussi vers cw8-vs-dcam.
//
// Tous les faits viennent de private-assets/raw/geo/faits-cw8-dcam-gpea-
// 2026-10-09.json (émetteur, recoupé sur justETF et Boursorama, relevé le
// 09/10/2026), relus le 09/10/2026. Ce qui n'y figure pas n'est pas écrit :
// ni part totale des émergents dans le MSCI ACWI (Amundi ne la publie pas),
// ni performance de GPEA, ni « depuis 2009 » sans préciser que la classe
// actuelle de CW8 date de 2018. PAEEM (TER, variante « ESG Transition ») :
// catalogue du site, table de vérité du 28/09/2026.
// Amundi publie un « nombre de composants » : une société cotée sous deux
// lignes (Alphabet A et C) compte deux fois. On écrit donc « titres ».
// ⚠️ CW8 : son DIC du 28/04/2026 ne mentionne pas le PEA. La preuve citée est
// la ligne « Enveloppe fiscale » du reporting pour professionnels, ou la page
// amundietf.fr — jamais « c'est écrit dans son DIC ».
// ⚠️ GPEA : aucun reporting mensuel publié au 09/10/2026 (404). Preuve
// d'éligibilité : DIC du 06/07/2026, prospectus, page amundietf.fr. À relire
// au premier reporting (fin octobre ou novembre 2026).
// Frais d'ordre : le tableau par courtier, masqué un temps (sansFraisOrdre),
// est affiché depuis le report de la grille BoursoBank du 5/10/2026 dans
// brokers.ts (09/10/2026) : CW8, DCAM et GPEA y sont tous trois dans la gamme
// Boursomarkets. Aucun tarif de courtier n'est écrit ici.

/** Encours et prix de part : Amundi, 8 octobre 2026, pour les trois fonds. */
const TAILLE = TAILLE_AMUNDI_8_OCTOBRE;
const { monthlyAmount: VERSEMENT, durationYears: DUREE, annualReturnPct: RENDEMENT } = HYPOTHESES_COMPARATIFS;

/** « au 8 octobre 2026 selon Amundi » */
const auSelon = (t: { au: string; source: string }) => `au ${dateEnToutesLettres(t.au)} selon ${t.source}`;
/** « 2026-10-08 » → « 8/10/2026 », pour les intitulés du tableau. */
const dateCourte = (iso: string) => {
  const [a, m, j] = iso.split("-");
  return `${Number(j)}/${m}/${a}`;
};
/** « (8/10/2026, Amundi) » */
const dateSource = (t: { au: string; source: string }) => `(${dateCourte(t.au)}, ${t.source})`;

/**
 * Arbitrage CW8 → DCAM au plafond légal des frais d'ordre en PEA : vente et
 * rachat coûtent au plus 2 × 0,5 % du montant ; l'écart de TER rapporte
 * 0,18 point par an sur ce montant. 1 % / 0,18 % ≈ 5,6 ans. Hors écart entre
 * prix d'achat et de vente, et hors effet de la capitalisation.
 */
const FRAIS_ALLER_RETOUR_PLAFOND = `${(2 * PLAFOND_ORDRE_PEA * 100).toLocaleString("fr-FR")} %`;
const ANNEES_AMORTISSEMENT_PLAFOND = ((2 * PLAFOND_ORDRE_PEA) / ((0.38 - 0.2) / 100)).toLocaleString("fr-FR", {
  maximumFractionDigits: 1,
});

/**
 * Versements nécessaires pour une part entière de CW8. La phrase qui l'emploie
 * (« un versement n'en achète pas une entière ») n'est vraie que si le
 * versement des hypothèses est sous le prix d'une part : sinon, le build
 * s'arrête plutôt que de publier une phrase fausse.
 */
if (VERSEMENT >= TAILLE.CW8.vlEur) {
  throw new Error(
    "etf-comparisons.ts (cw8-vs-dcam) : le versement des hypothèses dépasse le prix d'une part de CW8 — réécrire le cas « petit versement mensuel ».",
  );
}
const VERSEMENTS_POUR_UNE_PART_CW8 = Math.ceil(TAILLE.CW8.vlEur / VERSEMENT);

/** Rapport des encours DCAM / GPEA au 08/10/2026 (environ 23). */
const RAPPORT_ENCOURS_DCAM_GPEA = Math.round(TAILLE.DCAM.encoursMEur / TAILLE.GPEA.encoursMEur);

const CW8_VS_DCAM: ETFComparison = {
  slug: "cw8-vs-dcam",
  publishedAt: "2026-10-09",
  updatedAt: "2026-10-09",
  title: "CW8 vs DCAM : le MSCI World d'Amundi à 0,38 % ou à 0,20 % ?",
  metaTitle: "DCAM ou CW8 : même MSCI World Amundi, 0,20 % contre 0,38 %",
  // Pas d'écart en euros ici : ecartCapital(0.38, 0.2) donnerait le même
  // montant que la meta de cw8-vs-wpea. Les angles propres à la page : prix
  // d'une part et durée d'amortissement d'un arbitrage, tous deux calculés.
  metaDescription:
    `Même indice, même émetteur : DCAM coûte 0,20 % par an, CW8 0,38 %. Une part à ${prixPartEnviron(TAILLE.CW8)} contre ${prixPartEnviron(TAILLE.DCAM)}, un arbitrage amorti en ${ANNEES_AMORTISSEMENT_PLAFOND} ans au plus.`,

  left: {
    heading: "CW8",
    subheading: "Amundi MSCI World Swap UCITS ETF EUR Acc — ISIN LU1681043599",
    type: "ETF",
    coverage: "MSCI World — 1\u00a0248 titres de 23 pays développés (7 octobre 2026)",
    issuer: "Amundi",
    ter: "0,38 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: `Historique depuis juin 2009 · ${encoursEnviron(TAILLE.CW8)} d'encours pour cette part ${auSelon(TAILLE.CW8)}`,
    weakPoint: "Frais de 0,38\u00a0% par an, contre 0,20\u00a0% pour DCAM sur le même indice",
  },

  right: {
    heading: "DCAM",
    subheading: "Amundi PEA Monde (MSCI World) UCITS ETF Acc — ISIN FR001400U5Q4",
    type: "ETF",
    coverage: "MSCI World — 1\u00a0248 titres de 23 pays développés (7 octobre 2026)",
    issuer: "Amundi",
    ter: "0,20 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Frais de 0,20\u00a0% par an, pour le même indice et le même émetteur que CW8",
    weakPoint: "Créé le 4 mars 2025\u00a0: un peu plus d'un an et demi d'historique",
  },

  verdict:
    `À exposition identique (même MSCI World, même émetteur, même réplication par swap, tous deux éligibles au PEA), DCAM coûte 0,20\u00a0% par an contre 0,38\u00a0% pour CW8 (documents d'informations clés du 28 avril 2026, vérifiés le 9 octobre 2026)\u00a0: pour de nouveaux versements, DCAM revient moins cher. Les chiffres publiés vont dans le même sens\u00a0: sur un an au 30 septembre 2026, CW8 a fait 0,42 point de moins que son indice, DCAM 0,18 point (reportings Amundi). Pour un CW8 déjà détenu, un arbitrage dans le PEA ne déclenche aucun impôt\u00a0: il coûte deux frais d'ordre et l'écart entre prix d'achat et de vente.`,

  intro:
    "CW8 est la ligne historique d'Amundi sur le MSCI World\u00a0: sa première valeur liquidative date du 16 juin 2009, et sa classe actuelle a été créée le 18 avril 2018. Le 4 mars 2025, le même émetteur a créé DCAM, sur le même indice, pour un peu plus de la moitié des frais. Ni l'indice ni l'émetteur ne changent\u00a0: la question est de savoir ce que vaut l'écart de frais, et ce que coûte le passage de l'un à l'autre dans un PEA. Reste une différence de structure\u00a0: CW8 est une SICAV de droit luxembourgeois, DCAM un fonds commun de placement de droit français.",

  // Cellules courtes (09/10/2026) : la date et la source vont dans l'intitulé,
  // et pas de ligne ISIN (dans les cartes et la FAQ) : sinon le tableau
  // déborde à 390 px de large (deux ISIN de 12 caractères insécables).
  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "MSCI World, dividendes nets réinvestis, en euros", rightValue: "MSCI World (identique)" },
    { criterion: "Émetteur", leftValue: "Amundi", rightValue: "Amundi (identique)" },
    { criterion: "TER", leftValue: "0,38\u00a0%/an", rightValue: "0,20\u00a0%/an" },
    { criterion: "Écart avec l'indice sur un an au 30/09/2026 (Amundi)", leftValue: "−0,42 point", rightValue: "−0,18 point" },
    { criterion: "Régularité du suivi (écart-type) sur un an au 30/09/2026", leftValue: "0,03\u00a0%", rightValue: "0,03\u00a0%" },
    { criterion: "Domicile et structure", leftValue: "Luxembourg, SICAV", rightValue: "France, fonds commun de placement" },
    { criterion: "Historique", leftValue: "Depuis juin 2009\u00a0; classe actuelle d'avril 2018", rightValue: "Créé le 4 mars 2025, coté le 11 mars" },
    { criterion: `Prix d'une part ${dateSource(TAILLE.CW8)}`, leftValue: prixPartEnviron(TAILLE.CW8), rightValue: prixPartEnviron(TAILLE.DCAM) },
    { criterion: `Encours de la part ${dateSource(TAILLE.CW8)}`, leftValue: encoursEnviron(TAILLE.CW8), rightValue: encoursEnviron(TAILLE.DCAM) },
    { criterion: "Réplication", leftValue: "Synthétique (swap)", rightValue: "Synthétique (swap)" },
    { criterion: "Éligibilité PEA", leftValue: "Oui", rightValue: "Oui" },
    { criterion: `Impact TER sur ${DUREE} ans (${VERSEMENT} €/mois, ${RENDEMENT}\u00a0%)`, leftValue: `${coutFrais(0.38)} €`, rightValue: `${coutFrais(0.2)} €` },
  ],

  useCases: [
    {
      profile: "Premier MSCI World dans votre PEA",
      winner: "right",
      explanation:
        `À indice, émetteur et éligibilité identiques, DCAM facture 0,18 point de moins par an. Aux hypothèses de cette page (${VERSEMENT} €/mois pendant ${DUREE} ans, ${RENDEMENT}\u00a0%/an), cet écart représente environ ${ecartCapital(0.38, 0.2)} € de capital final.`,
    },
    {
      // « both » : sur un site non-CIF, un badge « CW8 » adressé à un
      // détenteur se lirait comme « gardez-le ».
      profile: "Du CW8 déjà détenu",
      winner: "both",
      explanation:
        "Même émetteur, même indice\u00a0: passer à DCAM ne diversifie rien, cela ne change que les frais et la forme juridique du fonds. CW8 suit le MSCI World aussi régulièrement que DCAM (même écart-type de suivi sur un an au 30 septembre 2026, selon Amundi). Deux voies coexistent\u00a0: garder la ligne et faire les versements suivants sur DCAM, ou arbitrer, dont le coût est détaillé dans l'analyse plus bas.",
    },
    {
      profile: "Petit versement mensuel, sans achat fractionné",
      winner: "right",
      explanation:
        `Une part de CW8 valait ${prixPartEnviron(TAILLE.CW8)} ${auSelon(TAILLE.CW8)}\u00a0: un versement de ${VERSEMENT} € n'en achète pas une entière, il en faut ${VERSEMENTS_POUR_UNE_PART_CW8} pour une part. Une part de DCAM valait ${prixPartEnviron(TAILLE.DCAM)}\u00a0: le versement s'investit presque entièrement chaque mois.`,
    },
    {
      profile: "Plus long historique, plus gros encours",
      winner: "left",
      explanation:
        `CW8 publie une valeur liquidative depuis juin 2009, et sa part gérait ${encoursEnviron(TAILLE.CW8)} ${auSelon(TAILLE.CW8)}, contre ${encoursEnviron(TAILLE.DCAM)} pour DCAM, créé en mars 2025. L'ancienneté ne change ni l'indice ni le cadre du swap\u00a0: les deux sont des fonds européens (OPCVM) soumis aux mêmes plafonds de contrepartie.`,
    },
  ],

  analysis:
    `Amundi propose deux ETF sur le même MSCI World dans le PEA, à deux niveaux de frais. CW8, antérieur à l'arrivée des ETF à 0,20\u00a0%, facture 0,38\u00a0% par an selon son DIC du 28 avril 2026\u00a0; DCAM, créé en mars 2025, 0,20\u00a0%. Leurs reportings du 30 septembre 2026 montrent un suivi aussi régulier l'un que l'autre (0,03\u00a0% d'écart-type entre le fonds et son indice sur un an, ce que le reporting appelle « tracking error ») et un retard annuel sur l'indice proche de leurs frais\u00a0: −0,42 point pour CW8, −0,18 point pour DCAM. Passer de l'un à l'autre ne change ni l'indice ni l'émetteur\u00a0: surtout les frais, et la forme juridique du fonds. L'argument de la diversification entre émetteurs, qui vaut face à un fonds iShares, ne joue pas ici. Le calcul d'un arbitrage tient en deux nombres. D'un côté, la vente et le rachat coûtent au plus ${FRAIS_ALLER_RETOUR_PLAFOND} du montant arbitré au plafond légal de 0,5\u00a0% par ordre (souvent moins, selon le courtier), plus l'écart entre prix d'achat et de vente. De l'autre, l'écart de frais rapporte 0,18 point par an sur ce même montant. Au plafond, l'économie met environ ${ANNEES_AMORTISSEMENT_PLAFOND} ans à couvrir les frais d'ordre\u00a0; avec des frais d'ordre plus bas, moins longtemps. Les performances passées ne préjugent pas des performances futures.`,

  voirAussi: [
    { avant: "Si vous envisagez de quitter CW8 pour un autre émetteur\u00a0:", ancre: "CW8 vs WPEA, le MSCI World d'iShares face à CW8", href: "/comparatif-etf/cw8-vs-wpea" },
    { avant: "Si l'hésitation porte sur les deux ETF MSCI World à 0,20\u00a0%\u00a0:", ancre: "WPEA vs DCAM, iShares ou Amundi", href: "/comparatif-etf/wpea-vs-dcam" },
    { avant: "Pour ajouter les pays émergents dans une seule ligne\u00a0:", ancre: "GPEA vs DCAM, MSCI ACWI ou MSCI World", href: "/comparatif-etf/gpea-vs-dcam" },
  ],

  faq: [
    {
      q: "CW8 et DCAM ont-ils la même performance ?",
      a: "Ils suivent le même indice, donc la même trajectoire, à leurs frais près. Sur un an au 30 septembre 2026, le MSCI World a fait 19,21\u00a0%, DCAM 19,03\u00a0% et CW8 18,79\u00a0%, selon les reportings Amundi\u00a0: 0,24 point d'écart entre les deux, du même ordre que leur différence de frais (0,18 point). Les performances passées ne préjugent pas des performances futures.",
    },
    {
      q: "Pourquoi Amundi a-t-il deux ETF MSCI World dans le PEA ?",
      a: "Ce sont deux fonds distincts, chacun avec ses frais fixés dans son document d'informations clés. CW8 est une SICAV luxembourgeoise gérée par Amundi Luxembourg, dont la classe actuelle date d'avril 2018, à 0,38\u00a0%\u00a0; DCAM, un fonds commun de placement français géré par Amundi Asset Management, créé en mars 2025, à 0,20\u00a0%. Les documents de l'émetteur consultés (DIC et reportings) donnent les frais de chacun, pas la raison de l'écart.",
    },
    {
      // Propre à cette paire (09/10/2026) : même émetteur, rien à
      // diversifier, durée d'amortissement calculée. La trame « impôt, deux
      // frais d'ordre » de cw8-vs-wpea n'est reprise qu'en une phrase.
      q: "Faut-il vendre son CW8 pour acheter du DCAM ?",
      a: `Le site ne peut pas trancher à votre place\u00a0: la réponse dépend du montant, de votre courtier et de votre horizon. Ce qui est propre à ce cas\u00a0: CW8 et DCAM ont le même émetteur et le même indice, donc l'arbitrage ne change pas ce que vous détenez, seulement les frais, soit 0,18 point par an sur le montant arbitré. En face, deux frais d'ordre, au plus 0,5\u00a0% du montant chacun dans un PEA (article D221-111-1 du code monétaire et financier), et l'écart entre prix d'achat et de vente\u00a0; pas d'impôt tant que l'argent reste dans le plan. Au plafond légal, l'économie met environ ${ANNEES_AMORTISSEMENT_PLAFOND} ans à couvrir ces frais, moins chez un courtier moins cher.`,
    },
    {
      q: "Peut-on garder son CW8 et verser sur DCAM ?",
      a: "Oui. Les deux lignes cohabitent dans le même PEA. Elles suivent le même indice\u00a0: la seconde n'ajoute aucune diversification, seulement une ligne de plus à suivre. Les nouveaux versements sont facturés 0,20\u00a0% par an au lieu de 0,38\u00a0%, et l'encours de CW8 garde ses frais.",
    },
    {
      q: "CW8 et DCAM sont-ils bien éligibles au PEA ?",
      a: "Oui, tous les deux. Les reportings Amundi du 30 septembre 2026, dans leur version pour professionnels, portent la mention « Eligible au PEA » sur la ligne « Enveloppe fiscale », pour CW8 comme pour DCAM. Le document d'informations clés de DCAM le dit aussi\u00a0; celui de CW8 ne parle pas du PEA, et c'est sa page sur amundietf.fr qui indique « Eligibilité au PEA\u00a0: Oui ».",
    },
    {
      q: "Quels ISIN saisir pour ne pas se tromper de fonds ?",
      a: "CW8\u00a0: LU1681043599 (Amundi MSCI World Swap UCITS ETF EUR Acc). DCAM\u00a0: FR001400U5Q4 (Amundi PEA Monde (MSCI World) UCITS ETF Acc). Les deux premières lettres disent le pays du fonds\u00a0: LU pour le Luxembourg, FR pour la France.",
    },
  ],

  tags: ["PEA", "CW8", "DCAM", "MSCI World", "Amundi"],

  // Boursorama affiche 0,28 % de « frais de gestion maximum » pour CW8
  // (09/10/2026) : il ne recoupe donc pas son TER, seulement ISIN et PEA.
  verification: {
    le: "2026-10-09",
    aupres: "d'Amundi",
    recoupeSur: "justETF, et sur Boursorama pour l'ISIN et l'éligibilité",
    sources: [
      { symbole: "CW8", fiche: DOCUMENTS_AMUNDI_2026_10.CW8_DIC },
      { symbole: "CW8", fiche: DOCUMENTS_AMUNDI_2026_10.CW8_REPORTING },
      { symbole: "CW8", fiche: DOCUMENTS_AMUNDI_2026_10.CW8_PAGE },
      { symbole: "DCAM", fiche: DOCUMENTS_AMUNDI_2026_10.DCAM_DIC },
      { symbole: "DCAM", fiche: DOCUMENTS_AMUNDI_2026_10.DCAM_REPORTING },
      { symbole: "DCAM", fiche: DOCUMENTS_AMUNDI_2026_10.DCAM_PAGE },
    ],
  },

};

const GPEA_VS_DCAM: ETFComparison = {
  slug: "gpea-vs-dcam",
  publishedAt: "2026-10-09",
  updatedAt: "2026-10-09",
  title: "GPEA vs DCAM : les émergents valent-ils 0,10 point de frais ?",
  metaTitle: "GPEA ou DCAM : monde entier à 0,30 % ou MSCI World à 0,20 %",
  metaDescription:
    "GPEA (MSCI ACWI, 0,30 %) ajoute les pays émergents à DCAM (MSCI World, 0,20 %) : ce qu'ils changent, l'encours, l'ancienneté, l'option DCAM + PAEEM.",

  left: {
    heading: "GPEA",
    subheading: "Amundi PEA Global (MSCI ACWI) UCITS ETF Acc — ISIN FR0014017NX3",
    type: "ETF",
    coverage: "MSCI ACWI — 2\u00a0413 titres, pays développés et émergents (7 octobre 2026)",
    issuer: "Amundi",
    ter: "0,30 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Pays développés et pays émergents dans une seule ligne du PEA",
    weakPoint: `Créé le 6 juillet 2026\u00a0: aucune performance publiée par Amundi, ${encoursEnviron(TAILLE.GPEA)} d'encours ${auSelon(TAILLE.GPEA)}`,
  },

  right: {
    heading: "DCAM",
    subheading: "Amundi PEA Monde (MSCI World) UCITS ETF Acc — ISIN FR001400U5Q4",
    type: "ETF",
    coverage: "MSCI World — 1\u00a0248 titres de 23 pays développés (7 octobre 2026)",
    issuer: "Amundi",
    ter: "0,20 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: `Frais de 0,20\u00a0% par an · ${encoursEnviron(TAILLE.DCAM)} d'encours ${auSelon(TAILLE.DCAM)}`,
    weakPoint: "Aucun pays émergent\u00a0: Taïwan, la Corée du Sud, la Chine, l'Inde ou le Brésil en sont absents",
  },

  verdict:
    `GPEA ajoute les pays émergents au MSCI World de DCAM pour 0,10 point de frais de plus (0,30\u00a0% contre 0,20\u00a0% par an, documents d'informations clés vérifiés le 9 octobre 2026), mais n'a encore ni un an d'historique ni performance publiée par Amundi. Les deux sont des ETF Amundi du PEA de même structure\u00a0: fonds français, réplication par swap, capitalisation. Le MSCI ACWI de GPEA compte 2\u00a0413 titres contre 1\u00a0248 pour le MSCI World de DCAM au 7 octobre 2026, selon Amundi. GPEA n'existe que depuis le 6 juillet 2026, et son encours (${encoursEnviron(TAILLE.GPEA)}) est environ ${RAPPORT_ENCOURS_DCAM_GPEA} fois plus petit que celui de DCAM (${encoursEnviron(TAILLE.DCAM)}) au ${dateEnToutesLettres(TAILLE.GPEA.au)}\u00a0: le choix porte sur l'envie d'avoir les émergents dans une seule ligne, pas sur un historique que GPEA n'a pas encore.`,

  intro:
    "GPEA (Amundi PEA Global) a été créé le 6 juillet 2026 et coté à Paris le 15 juillet. Il suit le MSCI ACWI, qui réunit les pays développés et les pays émergents. DCAM (Amundi PEA Monde), créé par le même émetteur le 4 mars 2025, suit le MSCI World, limité aux pays développés. Même émetteur, même structure, même réplication par swap\u00a0: la différence est l'indice, et elle coûte 0,10 point de frais par an. Reste à voir ce que les émergents changent au portefeuille.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "MSCI ACWI (pays développés et émergents)", rightValue: "MSCI World (pays développés seulement)" },
    { criterion: "Nombre de titres (7/10/2026, Amundi)", leftValue: "2\u00a0413", rightValue: "1\u00a0248" },
    { criterion: "Poids des États-Unis (7/10/2026, Amundi)", leftValue: "64,73\u00a0%", rightValue: "73,54\u00a0%" },
    { criterion: "Pays émergents, exemples (7/10/2026)", leftValue: "Taïwan 3,56\u00a0%, Corée du Sud 2,54\u00a0%, Chine 2,32\u00a0%, Inde 1,25\u00a0%, Brésil 0,55\u00a0%", rightValue: "Aucun" },
    { criterion: "TER", leftValue: "0,30\u00a0%/an (estimation du DIC)", rightValue: "0,20\u00a0%/an" },
    { criterion: "Création", leftValue: "6 juillet 2026 (coté le 15 juillet)", rightValue: "4 mars 2025 (coté le 11 mars)" },
    { criterion: "Écart avec l'indice sur un an au 30/09/2026", leftValue: "Non publié (moins d'un an)", rightValue: "−0,18 point" },
    { criterion: `Encours ${dateSource(TAILLE.GPEA)}`, leftValue: encoursEnviron(TAILLE.GPEA), rightValue: encoursEnviron(TAILLE.DCAM) },
    { criterion: `Prix d'une part ${dateSource(TAILLE.GPEA)}`, leftValue: prixPartEnviron(TAILLE.GPEA), rightValue: prixPartEnviron(TAILLE.DCAM) },
    { criterion: "Structure", leftValue: "Fonds français, swap", rightValue: "Fonds français, swap (identique)" },
    { criterion: "Éligibilité PEA", leftValue: "Oui (DIC du 6 juillet 2026)", rightValue: "Oui" },
    { criterion: `Impact TER sur ${DUREE} ans (${VERSEMENT} €/mois, ${RENDEMENT}\u00a0%)`, leftValue: `${coutFrais(0.3)} €`, rightValue: `${coutFrais(0.2)} €` },
  ],

  useCases: [
    {
      profile: "Une seule ligne pour les pays développés et émergents",
      winner: "left",
      explanation:
        "GPEA met dans une seule ligne du PEA ce que DCAM laisse de côté\u00a0: Taïwan (3,56\u00a0% de son indice au 7 octobre 2026), la Corée du Sud (2,54\u00a0%), la Chine (2,32\u00a0%), l'Inde (1,25\u00a0%), le Brésil (0,55\u00a0%)… Aucun rééquilibrage à faire entre deux fonds\u00a0: c'est l'indice qui fixe les poids.",
    },
    {
      profile: "Frais au plus bas",
      winner: "right",
      explanation:
        `DCAM coûte 0,10 point de moins par an. Aux hypothèses de cette page (${VERSEMENT} €/mois pendant ${DUREE} ans, ${RENDEMENT}\u00a0%/an), cet écart représente environ ${ecartCapital(0.3, 0.2)} € de capital final, à mettre en regard de ce que les émergents rapporteront, que personne ne connaît d'avance.`,
    },
    {
      profile: "Besoin d'un historique publié",
      winner: "right",
      explanation:
        "DCAM publie ses chiffres chaque mois\u00a0: écart de −0,18 point avec son indice sur un an au 30 septembre 2026, pour un suivi régulier (0,03\u00a0% d'écart-type, ce que le reporting Amundi appelle « tracking error »). Pour GPEA, Amundi n'affiche aucune performance avant un an d'historique, et aucun reporting mensuel n'est publié au 9 octobre 2026.",
    },
    {
      profile: "DCAM déjà détenu, envie d'ajouter les émergents",
      winner: "both",
      explanation:
        "Deux voies coexistent. Passer à GPEA, ce qui change l'indice et relève les frais de 0,10 point. Ou garder DCAM et ajouter un ETF émergents éligible au PEA, comme PAEEM (Amundi, 0,30\u00a0%)\u00a0: les frais moyens restent entre 0,20 et 0,30\u00a0%, d'autant plus près de 0,20\u00a0% que la part des émergents est petite, mais il faut fixer et rééquilibrer soi-même la part de chaque ligne. Et PAEEM suit une variante « ESG Transition » de l'indice MSCI des pays émergents, pas l'indice standard\u00a0: DCAM + PAEEM n'est pas le MSCI ACWI de GPEA.",
    },
  ],

  analysis:
    "Le MSCI ACWI, c'est le MSCI World plus les pays émergents. L'effet le plus visible est une moindre concentration sur les États-Unis\u00a0: 64,73\u00a0% de l'indice de GPEA au 7 octobre 2026, contre 73,54\u00a0% du MSCI World de DCAM, selon Amundi. Les pays développés restent largement majoritaires\u00a0; parmi les émergents, Taïwan pèse 3,56\u00a0%, la Corée du Sud 2,54\u00a0%, la Chine 2,32\u00a0%, l'Inde 1,25\u00a0%. GPEA est éligible au PEA malgré ses actions non européennes par le même mécanisme que DCAM\u00a0: le fonds détient au moins 75\u00a0% d'actions de sociétés de l'Union européenne et échange leur performance, par un swap, contre celle de son indice. Sur le prix, l'écart est de 0,10 point par an, et les 0,30\u00a0% de GPEA sont encore une estimation, faute d'une année complète d'existence. Sur l'ancienneté, GPEA part de zéro\u00a0: ni performance ni écart de suivi publiés par Amundi au 9 octobre 2026. Son premier reporting mensuel dira comment il suit son indice. Les performances passées ne préjugent pas des performances futures.",

  voirAussi: [
    { avant: "Pour départager les deux ETF MSCI World à 0,20\u00a0% d'émetteurs différents\u00a0:", ancre: "WPEA vs DCAM, iShares ou Amundi", href: "/comparatif-etf/wpea-vs-dcam" },
    { avant: "Si vous détenez déjà l'ancien MSCI World d'Amundi\u00a0:", ancre: "CW8 vs DCAM, ce que coûte le passage à 0,20\u00a0%", href: "/comparatif-etf/cw8-vs-dcam" },
    { avant: "Si c'est entre CW8 et le MSCI World d'iShares\u00a0:", ancre: "CW8 vs WPEA", href: "/comparatif-etf/cw8-vs-wpea" },
  ],

  faq: [
    {
      q: "Quelle différence entre le MSCI World et le MSCI ACWI ?",
      a: "Le MSCI World couvre les grandes et moyennes entreprises des 23 pays développés\u00a0: 1\u00a0248 titres au 7 octobre 2026. Le MSCI ACWI (All Country World Index) y ajoute celles des pays émergents\u00a0: 2\u00a0413 titres à la même date, selon Amundi (une société cotée sous deux lignes, comme Alphabet, compte deux fois). Les États-Unis pèsent 64,73\u00a0% du MSCI ACWI, contre 73,54\u00a0% du MSCI World.",
    },
    {
      q: "Comment GPEA peut-il être éligible au PEA avec des pays émergents ?",
      a: "Par réplication synthétique. D'après son document d'informations clés du 6 juillet 2026, le fonds investit au moins 75\u00a0% de ses actifs en actions de sociétés de l'Union européenne, ce qui le rend éligible au PEA, et un swap lui verse la performance du MSCI ACWI. La preuve qu'on cite d'habitude pour un ETF Amundi, la ligne « Enveloppe fiscale » de son reporting mensuel pour professionnels, n'existe pas encore pour GPEA\u00a0: aucun reporting n'est publié au 9 octobre 2026. Son DIC, son prospectus et sa page sur amundietf.fr (« Eligibilité au PEA\u00a0: Oui ») le disent.",
    },
    {
      q: "DCAM + PAEEM, est-ce la même chose que GPEA ?",
      a: "Pas tout à fait. PAEEM (Amundi PEA Emergent, 0,30\u00a0%) suit une variante « ESG Transition » de l'indice MSCI des pays émergents, pas l'indice standard\u00a0: DCAM + PAEEM ne reproduit donc pas le MSCI ACWI. Il faut aussi choisir soi-même la part de chaque ligne et la rééquilibrer. En frais, le mélange coûte entre 0,20 et 0,30\u00a0% selon cette part\u00a0; GPEA coûte 0,30\u00a0% pour l'indice complet, sans rééquilibrage à faire.",
    },
    {
      q: "Faut-il vendre son DCAM pour passer à GPEA ?",
      a: "Le site ne peut pas trancher à votre place. Dans un PEA, vendre DCAM pour racheter GPEA ne déclenche pas d'impôt\u00a0; cela coûte deux frais d'ordre et l'écart entre prix d'achat et de vente. À la différence d'un arbitrage entre deux MSCI World, ce passage change l'indice détenu et augmente les frais de 0,10 point par an\u00a0: il se juge sur l'envie d'avoir les émergents, pas sur une économie.",
    },
    {
      q: "Pourquoi aucune performance n'est-elle affichée pour GPEA ?",
      a: "Parce que le fonds a moins d'un an. Sa page sur amundietf.fr indique que les performances ne s'afficheront qu'avec plus d'un an d'historique, et aucun reporting mensuel n'est publié au 9 octobre 2026. DCAM, lui, publie un reporting chaque mois\u00a0: −0,18 point d'écart avec son indice sur un an au 30 septembre 2026.",
    },
    {
      q: "Et GPEA face à WPEA ?",
      a: "WPEA (iShares) suit le même MSCI World que DCAM, au même tarif de 0,20\u00a0% par an\u00a0: face à GPEA, la comparaison est la même qu'avec DCAM, les émergents d'un côté, 0,10 point de frais de l'autre. Ce qui sépare WPEA de DCAM est l'objet de notre comparatif WPEA vs DCAM.",
    },
  ],

  tags: ["PEA", "MSCI ACWI", "MSCI World", "émergents", "Amundi"],

  verification: {
    le: "2026-10-09",
    aupres: "d'Amundi",
    recoupeSur: "justETF et Boursorama",
    sources: [
      { symbole: "GPEA", fiche: DOCUMENTS_AMUNDI_2026_10.GPEA_DIC },
      { symbole: "GPEA", fiche: DOCUMENTS_AMUNDI_2026_10.GPEA_PAGE },
      { symbole: "DCAM", fiche: DOCUMENTS_AMUNDI_2026_10.DCAM_DIC },
      { symbole: "DCAM", fiche: DOCUMENTS_AMUNDI_2026_10.DCAM_REPORTING },
      { symbole: "DCAM", fiche: DOCUMENTS_AMUNDI_2026_10.DCAM_PAGE },
    ],
  },

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
  // 09/10/2026 — ajoutés EN FIN de registre : l'ordre des huit premiers
  // dans le hub et dans « Autres comparatifs » ne bouge pas.
  [CW8_VS_DCAM.slug]: CW8_VS_DCAM,
  [GPEA_VS_DCAM.slug]: GPEA_VS_DCAM,
};

export const ETF_COMPARISON_LIST: ETFComparison[] = Object.values(ETF_COMPARISONS);

export function getETFComparison(slug: string): ETFComparison | null {
  return ETF_COMPARISONS[slug] ?? null;
}
