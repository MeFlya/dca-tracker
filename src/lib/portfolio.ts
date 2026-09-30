/**
 * Multi-ETF portfolio blending.
 *
 * Lets the user combine multiple ETFs with weights to compute :
 * - Weighted-average historical index return (per region, see below)
 * - Weighted-average TER
 * - Per-ETF breakdown (monthly amount, position size, contribution to return)
 *
 * Then this can be fed into runSimulation() for a DCA projection.
 *
 * IMPORTANT — what we model and what we don't :
 * - We assume a CONSTANT allocation : monthly contributions are split
 *   pro-rata across all ETFs at each step. We do NOT model rebalancing
 *   over time (winning ETFs become overweight, the user manually
 *   rebalances or doesn't).
 * - We use a STATIC return-by-region map : the HISTORICAL annualised return
 *   of a reference index per region, over one common period. It is NOT a
 *   forecast. Real returns are path-dependent and vary a lot from one decade
 *   to the next (see `rolling10y` below).
 * - The weighted average of per-region returns is an order of magnitude, not
 *   the real historical return of the mix : rebalancing, volatility and
 *   correlations between ETFs are not modelled. Currency hedging cost is not
 *   modelled either.
 *
 * ─── Rendements par région — corrigé le 29/09/2026 ─────────────────────────
 *
 * L'ancienne table (monde 7,5 / usa 9,0 / europe 6,0 / émergents 8,0 /
 * japon 5,0 / small-cap 8,5 / obligations 3,0) était dite « CONSERVATIVE »
 * et justifiée par des phrases non sourcées (« MSCI World 30-yr CAGR ≈ 7-8 % »,
 * « S&P 500 real returns ≈ 9-10 % », qui confondait réel et nominal et citait
 * un chiffre en dollars, « Bloomberg Aggregate »). Mesurée sur la période
 * ci-dessous, elle était au contraire PLUS OPTIMISTE que l'historique sur cinq
 * poches sur sept (monde, usa, europe, japon, obligations).
 *
 * Elle est remplacée par des rendements annualisés historiques, tous sur la
 * MÊME période, du 29/12/2000 au 31/08/2026 (25,7 ans), en euros :
 * - actions : indices MSCI « net » = dividendes nets de retenue à la source
 *   réinvestis. « Net » ne veut dire ni « après frais de l'ETF » ni « après
 *   impôt français » : soustraire le TER dans blendPortfolio reste cohérent ;
 * - monétaire : EONIA puis €STR (BCE), capitalisés au jour le jour.
 *
 * Deux chiffres sont publiés tels quels par MSCI (monde, émergents). Les autres
 * sont calculés par nos soins (annualisation jours/365) à partir des niveaux
 * de fin de mois officiels de MSCI ; la méthode reproduit à 0,01 point près
 * chaque chiffre publié qu'on a pu comparer (World 6,64 ; EM 8,26 ; ACWI 6,59 ;
 * 10 ans Europe 9,31 et Japon 9,12 ; MSCI USA en USD 8,52 ; World Small Cap
 * brut 8,90 ; USA Small Cap USD 10,28). Fichiers de travail recontrôlés le
 * 29/09/2026.
 *
 * Le point de départ pèse lourd : depuis le 31/12/1998, MSCI publie 7,33 %/an
 * pour le Monde, 5,59 % pour l'Europe et 5,18 % pour le Japon. Et le classement
 * des régions dépend de la période : du 29/12/2000 au 31/03/2003, le MSCI USA
 * en euros a perdu 43,8 % et le MSCI EM 26,1 % (START_POINT_EXAMPLE, calcul
 * sur les niveaux mensuels MSCI) ; sur les 10 dernières années, l'ordre
 * émergents / monde s'inverse. (Corrigé le 29/09/2026 : ce commentaire disait
 * « fin 2000 = sommet américain, creux émergent », sans source et inexact —
 * le MSCI USA en euros a encore pris 6 % jusqu'en mai 2001.) L'interface ne
 * doit donc jamais classer les régions ni parler de « rendement attendu ».
 *
 * Règle : une région sans chiffre sourcé garde une valeur prudente, mais avec
 * `sourced: false` et la mention « hypothèse non sourcée » ; l'interface
 * l'affiche comme telle. Au 29/09/2026, les sept régions sont sourcées.
 */

import type { ETFConfig, ETFRegion } from "./etf-config";

/** Période commune à tous les rendements historiques de la table. */
export const HISTORICAL_RETURNS_PERIOD = {
  start: "29/12/2000",
  end: "31/08/2026",
  /** Pour une phrase : « du 29/12/2000 au 31/08/2026 ». */
  label: "du 29/12/2000 au 31/08/2026",
  /** Date des données (fin de période). */
  dataDate: "31/08/2026",
  /** Pour les fenêtres de 10 ans glissants : « entre fin 2000 et août 2026 ». */
  span: "entre fin 2000 et août 2026",
} as const;

/**
 * Fourchettes « sur 10 ans glissants » (champ `rolling10y`) : ce sont des
 * CALCULS DCA Tracker, pas des chiffres publiés par MSCI. Méthode : niveaux de
 * fin de mois officiels MSCI (EUR, net, service indexmaster, au 31/08/2026),
 * rendement annualisé (jours/365) sur chaque fenêtre de 120 mois comprise dans
 * la période, soit 189 fenêtres dont le départ va de fin décembre 2000 à fin
 * août 2016. MSCI World : plus bas −1,556 %/an (31/01/2001 → 31/01/2011), plus
 * haut +14,378 %/an (31/08/2011 → 31/08/2021). Recontrôlé le 29/09/2026.
 */
export const ROLLING_10Y_CALC = {
  windows: 189,
  /** Pour l'interface. */
  shortLabel: "calcul DCA Tracker sur les niveaux MSCI",
  /** Pour une phrase complète. */
  longLabel:
    "calcul DCA Tracker sur les niveaux mensuels MSCI, fenêtres de 10 ans comprises dans la période",
  sourceUrl:
    "https://app2.msci.com/products/service/index/indexmaster/getLevelDataForGraph?currency_symbol=EUR&index_variant=NETR&start_date=20001229&end_date=20260831&data_frequency=END_OF_MONTH&index_codes=990100",
} as const;

/**
 * Effet du point de départ, illustré par un fait daté (remplace, le
 * 29/09/2026, l'explication non sourcée « fin 2000, les émergents étaient bas
 * et les actions américaines au sommet de la bulle internet »).
 * Calcul DCA Tracker sur les niveaux de fin de mois MSCI (EUR, net) :
 * MSCI USA (984000) 132,908 → 74,631 = −43,85 % ; MSCI Emerging Markets
 * (891800) 100,000 → 73,899 = −26,10 %. Recontrôlé le 29/09/2026.
 */
export const START_POINT_EXAMPLE = {
  from: "29/12/2000",
  to: "31/03/2003",
  usaPct: -43.8,
  emergentsPct: -26.1,
  /** Niveaux de fin de mois du MSCI Emerging Markets (891800), EUR, net. */
  emergentsLevelsUrl:
    "https://app2.msci.com/products/service/index/indexmaster/getLevelDataForGraph?currency_symbol=EUR&index_variant=NETR&start_date=20001229&end_date=20260831&data_frequency=END_OF_MONTH&index_codes=891800",
} as const;

/**
 * Petites capitalisations américaines contre marché américain large, sur
 * 10 ans : l'ordre s'inverse par rapport à la période 2000-2026. Chiffres
 * publiés, fiche MSCI USA Small Cap Index (USD), « Index Performance — Gross
 * Returns », colonne « 10 Yr », au 31/08/2026 (téléchargée et relue le
 * 29/09/2026). En euros, dividendes nets (calcul sur les niveaux MSCI) :
 * 10,73 %/an contre 14,31 %/an — même sens.
 */
export const SMALL_CAP_VS_USA_10Y = {
  smallCapPct: 11.72,
  usaPct: 15.35,
  currency: "USD",
  returnType: "brut (dividendes bruts réinvestis)",
  dataDate: "31/08/2026",
  sourceName:
    "MSCI — Index Factsheet MSCI USA Small Cap Index (USD), « Index Performance — Gross Returns », colonne « 10 Yr »",
  sourceUrl: "https://www.msci.com/documents/10199/255599/msci-usa-smallcap.pdf",
} as const;

export interface RegionReturnSource {
  /** Rendement annualisé historique, en %/an, tel que publié ou calculé (2 décimales). */
  annualizedPct: number;
  /**
   * true : chiffre sourcé et daté. false : « hypothèse non sourcée », valeur
   * prudente à vérifier, que l'interface doit signaler comme telle.
   */
  sourced: boolean;
  /** Libellé de la poche dans l'interface (la région « obligations » y est monétaire). */
  regionLabel: string;
  /** Indice de référence dont on affiche l'historique (pas toujours l'indice exact des ETF). */
  referenceIndex: string;
  period: string;
  currency: "EUR";
  /** Type de rendement : net (dividendes nets réinvestis) ou brut. */
  returnType: string;
  /** « publie » : chiffre publié par la source. « calcule » : annualisé par nos soins à partir de ses niveaux. */
  method: "publie" | "calcule";
  /** Source courte, pour l'interface. */
  shortSource: string;
  /** Source complète. */
  sourceName: string;
  sourceUrl: string;
  /** Date des données. */
  dataDate: string;
  /**
   * Rendement annualisé sur 10 ans glissants : plus bas et plus haut observés
   * sur la période. CALCUL DCA Tracker (voir ROLLING_10Y_CALC), jamais un
   * chiffre publié par MSCI. Absent pour le monétaire, dont la dispersion est
   * donnée dans `dispersionNote`.
   */
  rolling10y?: { min: number; max: number };
  /**
   * Rendement annualisé sur les 10 ans au `dataDate`, tel que publié par la
   * fiche MSCI en euros (net), colonne « 10 Yr ». Absent si la fiche n'existe
   * pas en euros.
   */
  tenYearPublishedPct?: number;
  /** Dispersion en une phrase courte, quand `rolling10y` ne s'applique pas. */
  dispersionNote?: string;
}

/**
 * Rendement historique par région, avec sa source. C'est LA table de
 * référence : EXPECTED_RETURN_BY_REGION en est dérivée.
 */
export const REGION_RETURN_SOURCES: Record<ETFRegion, RegionReturnSource> = {
  // MSCI World (EUR, net) — 6,64 %/an du 29/12/2000 au 31/08/2026, publié.
  // Source : MSCI, Index Factsheet MSCI World Index (EUR), tableau « Index
  // Performance — Net Returns », colonne « Since Dec 29, 2000 », au 31/08/2026.
  // Même fiche : 10 ans 12,53 %/an ; MSCI ACWI 6,59 %/an depuis le 29/12/2000
  // (repère plus juste pour VWCE, qui suit le FTSE All-World).
  // 10 ans glissants (calcul) : de −1,6 % (01/2001 → 01/2011) à +14,4 %
  // (08/2011 → 08/2021).
  monde: {
    annualizedPct: 6.64,
    sourced: true,
    regionLabel: "monde",
    referenceIndex: "MSCI World",
    period: HISTORICAL_RETURNS_PERIOD.label,
    currency: "EUR",
    returnType: "net, dividendes réinvestis, avant frais de l'ETF",
    method: "publie",
    shortSource: "MSCI, fiche officielle",
    sourceName:
      "MSCI — Index Factsheet MSCI World Index (EUR), « Index Performance — Net Returns », colonne « Since Dec 29, 2000 »",
    sourceUrl:
      "https://www.msci.com/documents/10199/890dd84d-3750-4656-87f2-1229ed5a5d6e",
    dataDate: "31/08/2026",
    rolling10y: { min: -1.6, max: 14.4 },
    tenYearPublishedPct: 12.53,
  },
  // MSCI USA (EUR, net), utilisé à la place du S&P 500 — 7,62 %/an, calculé.
  // Source : MSCI, niveaux de fin de mois de l'indice 984000 (MSCI USA), EUR,
  // variante NETR, service indexmaster, au 31/08/2026. MSCI ne publie pas de
  // fiche MSCI USA en euros ; le même calcul en USD reproduit la fiche
  // officielle USD (8,52 %/an depuis le 29/12/2000).
  // Le S&P 500 en EUR n'a pas pu être obtenu (spglobal.com renvoie une 403) :
  // à vérifier avant d'afficher « S&P 500 ». Ce chiffre ne représente pas les
  // ETF Nasdaq-100 de la région (PUST, ANX, QQQ).
  // 10 ans glissants (calcul) : de −3,2 % à +18,1 %/an.
  usa: {
    annualizedPct: 7.62,
    sourced: true,
    regionLabel: "États-Unis",
    referenceIndex: "MSCI USA",
    period: HISTORICAL_RETURNS_PERIOD.label,
    currency: "EUR",
    returnType: "net, dividendes réinvestis, avant frais de l'ETF",
    method: "calcule",
    shortSource: "calcul sur les niveaux MSCI",
    sourceName:
      "MSCI — niveaux de fin de mois de l'indice MSCI USA (code 984000), EUR, net (service indexmaster) ; annualisation DCA Tracker",
    sourceUrl:
      "https://app2.msci.com/products/service/index/indexmaster/getLevelDataForGraph?currency_symbol=EUR&index_variant=NETR&start_date=20001229&end_date=20260831&data_frequency=END_OF_MONTH&index_codes=984000",
    dataDate: "31/08/2026",
    rolling10y: { min: -3.2, max: 18.1 },
  },
  // MSCI Europe (EUR, net) — 4,87 %/an, calculé.
  // Source : MSCI, niveaux de fin de mois de l'indice 990500 (MSCI Europe),
  // EUR, NETR, au 31/08/2026. Contrôle : fiche officielle MSCI Europe Index
  // (EUR) au 31/08/2026 (https://www.msci.com/documents/10199/255599/msci-europe-index-eur-net.pdf),
  // dont le chiffre 10 ans (9,31 %/an) est reproduit exactement ; la fiche ne
  // donne pas de colonne « depuis 2000 » (depuis le 31/12/1998 : 5,59 %/an).
  // 10 ans glissants (calcul) : de −0,4 % à +10,8 %/an.
  europe: {
    annualizedPct: 4.87,
    sourced: true,
    regionLabel: "Europe",
    referenceIndex: "MSCI Europe",
    period: HISTORICAL_RETURNS_PERIOD.label,
    currency: "EUR",
    returnType: "net, dividendes réinvestis, avant frais de l'ETF",
    method: "calcule",
    shortSource: "calcul sur les niveaux MSCI",
    sourceName:
      "MSCI — niveaux de fin de mois de l'indice MSCI Europe (code 990500), EUR, net (service indexmaster) ; annualisation DCA Tracker",
    sourceUrl:
      "https://app2.msci.com/products/service/index/indexmaster/getLevelDataForGraph?currency_symbol=EUR&index_variant=NETR&start_date=20001229&end_date=20260831&data_frequency=END_OF_MONTH&index_codes=990500",
    dataDate: "31/08/2026",
    rolling10y: { min: -0.4, max: 10.8 },
    tenYearPublishedPct: 9.31,
  },
  // MSCI Emerging Markets (EUR, net) — 8,26 %/an, publié.
  // Source : MSCI, Index Factsheet MSCI Emerging Markets Index (EUR), « Index
  // Performance — Net Returns », colonne « Since Dec 29, 2000 », au 31/08/2026.
  // 10 ans : 8,83 %/an (contre 12,53 % pour le MSCI World : l'ordre s'inverse).
  // PAEEM suit une variante « ESG Transition » de l'indice, pas l'indice
  // standard ; AEEM suit l'indice standard.
  // 10 ans glissants (calcul) : de +2,8 % à +15,2 %/an.
  emergents: {
    annualizedPct: 8.26,
    sourced: true,
    regionLabel: "émergents",
    referenceIndex: "MSCI Emerging Markets",
    period: HISTORICAL_RETURNS_PERIOD.label,
    currency: "EUR",
    returnType: "net, dividendes réinvestis, avant frais de l'ETF",
    method: "publie",
    shortSource: "MSCI, fiche officielle",
    sourceName:
      "MSCI — Index Factsheet MSCI Emerging Markets Index (EUR), « Index Performance — Net Returns », colonne « Since Dec 29, 2000 »",
    sourceUrl:
      "https://www.msci.com/documents/10199/255599/msci-emerging-markets-index-eur-net.pdf",
    dataDate: "31/08/2026",
    rolling10y: { min: 2.8, max: 15.2 },
    tenYearPublishedPct: 8.83,
  },
  // MSCI Japan (EUR, net), utilisé à la place du JPX-Nikkei 400 (JPNK) —
  // 4,08 %/an, calculé.
  // Source : MSCI, niveaux de fin de mois de l'indice 939200 (MSCI Japan), EUR,
  // NETR, au 31/08/2026. Contrôle : fiche officielle MSCI Japan Index (EUR) au
  // 31/08/2026 (https://www.msci.com/resources/factsheets/index_fact_sheet/msci-japan-index-eur-net.pdf),
  // chiffre 10 ans (9,12 %/an) reproduit exactement ; depuis le 31/12/1998 :
  // 5,18 %/an. Aucune série JPX-Nikkei 400 en euros n'a été consultée.
  // 10 ans glissants (calcul) : de −4,6 % à +10,2 %/an.
  japon: {
    annualizedPct: 4.08,
    sourced: true,
    regionLabel: "Japon",
    referenceIndex: "MSCI Japan",
    period: HISTORICAL_RETURNS_PERIOD.label,
    currency: "EUR",
    returnType: "net, dividendes réinvestis, avant frais de l'ETF",
    method: "calcule",
    shortSource: "calcul sur les niveaux MSCI",
    sourceName:
      "MSCI — niveaux de fin de mois de l'indice MSCI Japan (code 939200), EUR, net (service indexmaster) ; annualisation DCA Tracker",
    sourceUrl:
      "https://app2.msci.com/products/service/index/indexmaster/getLevelDataForGraph?currency_symbol=EUR&index_variant=NETR&start_date=20001229&end_date=20260831&data_frequency=END_OF_MONTH&index_codes=939200",
    dataDate: "31/08/2026",
    rolling10y: { min: -4.6, max: 10.2 },
    tenYearPublishedPct: 9.12,
  },
  // MSCI USA Small Cap (EUR, net), utilisé à la place du Russell 2000 (RS2K,
  // petites capitalisations AMÉRICAINES) — 8,91 %/an, calculé.
  // Source : MSCI, niveaux de fin de mois de l'indice 106229 (MSCI USA Small
  // Cap), EUR, NETR, au 31/08/2026. Le calcul en USD brut reproduit la fiche
  // officielle (10,28 %/an depuis le 29/12/2000). L'historique du Russell 2000
  // en euros n'a pas pu être obtenu.
  // 10 ans glissants (calcul) : de +1,8 % à +19,1 %/an.
  "small-cap": {
    annualizedPct: 8.91,
    sourced: true,
    regionLabel: "petites capitalisations",
    referenceIndex: "MSCI USA Small Cap",
    period: HISTORICAL_RETURNS_PERIOD.label,
    currency: "EUR",
    returnType: "net, dividendes réinvestis, avant frais de l'ETF",
    method: "calcule",
    shortSource: "calcul sur les niveaux MSCI",
    sourceName:
      "MSCI — niveaux de fin de mois de l'indice MSCI USA Small Cap (code 106229), EUR, net (service indexmaster) ; annualisation DCA Tracker",
    sourceUrl:
      "https://app2.msci.com/products/service/index/indexmaster/getLevelDataForGraph?currency_symbol=EUR&index_variant=NETR&start_date=20001229&end_date=20260831&data_frequency=END_OF_MONTH&index_codes=106229",
    dataDate: "31/08/2026",
    rolling10y: { min: 1.8, max: 19.1 },
  },
  // Monétaire en euros (la seule ligne de la région est C3M, fonds quasi
  // monétaire, pas des obligations longues) — 1,39 %/an, calculé.
  // Taux : EONIA jusqu'au 30/09/2019, puis €STR à partir du 01/10/2019,
  // capitalisés au jour le jour (base exact/360), annualisés (jours/365).
  // Rendement brut (taux de placement, avant frais de l'ETF).
  // Sources : BCE, Data Portal, séries EST.B.EU000A2X2A25.WT (€STR) et
  // EON.D.EONIA_TO.RATE (https://data-api.ecb.europa.eu/service/data/EON/D.EONIA_TO.RATE).
  // Proxy de l'indice FTSE Eurozone Government Bill 0-6 Month suivi par C3M,
  // dont l'historique propre n'a pas été consulté.
  // Selon la période : 3,18 %/an (2001-2008), 0,41 % (2009-2014), −0,39 %
  // (2015-2021, taux négatifs), 2,28 % (2022 → 08/2026). €STR au 31/08/2026 :
  // 2,185 %.
  obligations: {
    annualizedPct: 1.39,
    sourced: true,
    regionLabel: "monétaire",
    referenceIndex: "taux monétaire en euros (EONIA puis €STR)",
    period: HISTORICAL_RETURNS_PERIOD.label,
    currency: "EUR",
    returnType: "brut, taux au jour le jour capitalisé, avant frais de l'ETF",
    method: "calcule",
    shortSource: "calcul sur les taux BCE",
    sourceName:
      "BCE — Data Portal, séries EONIA (jusqu'au 30/09/2019) puis €STR (depuis le 01/10/2019) ; capitalisation DCA Tracker",
    sourceUrl:
      "https://data-api.ecb.europa.eu/service/data/EST/B.EU000A2X2A25.WT",
    dataDate: "31/08/2026",
    dispersionNote: "négatif de 2015 à 2021 (−0,4\u00a0%/an)",
  },
};

/**
 * Rendement annualisé historique par région, en %/an, avant frais de l'ETF,
 * arrondi à 0,1 point. Dérivé de REGION_RETURN_SOURCES (sources et période
 * ci-dessus).
 *
 * Le nom « EXPECTED » est historique : ce n'est PAS une prévision, c'est le
 * rendement passé de l'indice de référence du 29/12/2000 au 31/08/2026, que le
 * simulateur utilise comme hypothèse centrale.
 */
export const EXPECTED_RETURN_BY_REGION = Object.fromEntries(
  (Object.keys(REGION_RETURN_SOURCES) as ETFRegion[]).map((region) => [
    region,
    Math.round(REGION_RETURN_SOURCES[region].annualizedPct * 10) / 10,
  ]),
) as Record<ETFRegion, number>;
// monde 6,6 · usa 7,6 · europe 4,9 · emergents 8,3 · japon 4,1 ·
// small-cap 8,9 · obligations (monétaire) 1,4

export interface ReturnCaveat {
  /** Précision affichée sous la ligne de l'ETF. */
  text: string;
  /**
   * true : le chiffre utilisé ne représente PAS l'indice suivi par l'ETF (pas
   * une simple approximation). La ligne compte alors comme une « hypothèse non
   * sourcée, à vérifier », au même titre qu'une région `sourced: false`.
   */
  unsourced: boolean;
}

/**
 * Précision à afficher quand l'ETF ne suit pas exactement l'indice de
 * référence de sa région. null si l'ETF suit l'indice de référence.
 *
 * Corrigé le 29/09/2026 : la précision Nasdaq-100 affirmait que l'historique
 * de cet indice depuis 2000 « est très différent » de celui du MSCI USA, sans
 * qu'aucune série Nasdaq-100 ait été consultée (on ignore même le sens de
 * l'écart). Elle dit désormais ce qui est vérifié, et marque la ligne comme
 * non sourcée pour que l'alerte de la moyenne pondérée se déclenche.
 */
export function historicalReturnCaveat(etf: ETFConfig): ReturnCaveat | null {
  const index = etf.indexLabel.toLowerCase();
  if (index.includes("nasdaq")) {
    return {
      text: "Hypothèse non sourcée, à vérifier : l'outil utilise le chiffre du MSCI USA, qui ne représente pas le Nasdaq-100. L'historique du Nasdaq-100 n'a pas été vérifié par DCA Tracker ; il peut s'écarter fortement de celui du MSCI USA.",
      unsourced: true,
    };
  }
  if (index === "s&p 500") {
    return {
      text: "Chiffre du MSCI USA : l'historique du S&P 500 en euros n'a pas été vérifié ; les deux indices sont proches sans être identiques.",
      unsourced: false,
    };
  }
  if (index === "ftse all-world") {
    return {
      text: "VWCE suit le FTSE All-World, qui inclut les émergents : le MSCI ACWI (6,6 %/an sur la même période, fiche MSCI) en est un repère plus proche.",
      unsourced: false,
    };
  }
  if (etf.displaySymbol === "PAEEM") {
    return {
      text: "PAEEM suit une variante ESG de l'indice émergents : son historique peut s'en écarter.",
      unsourced: false,
    };
  }
  if (index === "russell 2000") {
    return {
      text: "L'historique du Russell 2000 en euros n'a pas pu être obtenu : chiffre de l'équivalent MSCI le plus proche.",
      unsourced: false,
    };
  }
  if (index === "jpx-nikkei 400") {
    return {
      text: "Aucune série JPX-Nikkei 400 en euros n'a été consultée : chiffre du MSCI Japan, une approximation du marché japonais.",
      unsourced: false,
    };
  }
  if (etf.region === "obligations") {
    return {
      text: "Approximation : taux monétaire de la BCE, pas l'historique de l'indice de bons du Trésor suivi par l'ETF.",
      unsourced: false,
    };
  }
  return null;
}

/**
 * true si le chiffre historique utilisé pour cet ETF n'est pas vérifié : région
 * sans chiffre sourcé, ou indice que le chiffre de la région ne représente pas
 * (Nasdaq-100).
 */
export function isHistoricalReturnUnverified(etf: ETFConfig): boolean {
  return (
    !REGION_RETURN_SOURCES[etf.region].sourced ||
    historicalReturnCaveat(etf)?.unsourced === true
  );
}

export interface PortfolioItem {
  etf: ETFConfig;
  /** Weight as a percentage (0-100). Should sum to 100 across the portfolio. */
  weight: number;
}

export interface PortfolioBreakdownRow {
  etf: ETFConfig;
  weight: number;
  /** Monthly amount allocated to this ETF (€). */
  monthlyAmount: number;
  /**
   * Historical annualised return of the region's reference index
   * (EXPECTED_RETURN_BY_REGION), before ETF fees. Not a forecast.
   */
  expectedReturn: number;
  /** TER of this ETF (% per year). */
  ter: number;
  /** Contribution to the blended return (= weight × expectedReturn / 100). */
  returnContribution: number;
  /** Contribution to the blended TER (= weight × ter / 100). */
  terContribution: number;
}

export interface BlendedPortfolio {
  /** Sum of weights — should equal 100 if portfolio is well-formed. */
  totalWeight: number;
  /** True if totalWeight is within 0.01 of 100. */
  isBalanced: boolean;
  /**
   * Weighted average of the historical index returns (% per year), before
   * fees. An order of magnitude, not the mix's real historical return, and
   * not a forecast.
   */
  blendedReturn: number;
  /** Weighted TER (% per year). */
  blendedTer: number;
  /** Same average after ETF fees (= blendedReturn − blendedTer). */
  blendedNetReturn: number;
  /** Per-ETF breakdown, ordered same as input. */
  breakdown: PortfolioBreakdownRow[];
  /** True if any ETF in the portfolio is NOT PEA-eligible. */
  hasNonPeaEtf: boolean;
  /**
   * Symboles des ETF dont le chiffre historique n'est pas vérifié (voir
   * isHistoricalReturnUnverified). Non vide : la moyenne pondérée repose en
   * partie sur une hypothèse non sourcée, et l'interface doit le dire.
   */
  unverifiedSymbols: string[];
}

/**
 * Compute the blended portfolio from items + monthly amount.
 *
 * If the weights don't sum to 100 (e.g. user sliding mid-edit), we use
 * the weights as-is for breakdown, but flag isBalanced = false. The
 * UI should guide the user back to 100.
 */
export function blendPortfolio(
  items: PortfolioItem[],
  monthlyAmount: number
): BlendedPortfolio {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const isBalanced = Math.abs(totalWeight - 100) < 0.01;

  let blendedReturn = 0;
  let blendedTer = 0;
  let hasNonPeaEtf = false;

  const breakdown: PortfolioBreakdownRow[] = items.map((item) => {
    const expectedReturn = EXPECTED_RETURN_BY_REGION[item.etf.region];
    const ter = item.etf.ter;
    const monthlyAllocated = (item.weight / 100) * monthlyAmount;

    const returnContribution = (item.weight / 100) * expectedReturn;
    const terContribution = (item.weight / 100) * ter;

    blendedReturn += returnContribution;
    blendedTer += terContribution;
    if (!item.etf.peaEligible) hasNonPeaEtf = true;

    return {
      etf: item.etf,
      weight: item.weight,
      monthlyAmount: monthlyAllocated,
      expectedReturn,
      ter,
      returnContribution,
      terContribution,
    };
  });

  // Round to 2-3 decimals at the source — prevents float drift from leaking
  // into every display site (e.g. "7.149999999 %" instead of "7.15 %").
  // The DCA simulation engine uses these as inputs so rounding here avoids
  // the noise everywhere downstream.
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const round3 = (n: number) => Math.round(n * 1000) / 1000;

  return {
    totalWeight,
    isBalanced,
    blendedReturn: round2(blendedReturn),
    blendedTer: round3(blendedTer),
    blendedNetReturn: round2(blendedReturn - blendedTer),
    breakdown,
    hasNonPeaEtf,
    unverifiedSymbols: items
      .filter((i) => i.weight > 0 && isHistoricalReturnUnverified(i.etf))
      .map((i) => i.etf.displaySymbol),
  };
}

/**
 * Auto-rebalance weights so they sum to exactly 100.
 * Strategy : scale each weight pro-rata to the current total.
 * If totalWeight is 0, evenly distribute.
 */
export function rebalanceToHundred(items: PortfolioItem[]): PortfolioItem[] {
  if (items.length === 0) return [];
  const total = items.reduce((s, i) => s + i.weight, 0);
  if (total === 0) {
    // Even split
    const even = 100 / items.length;
    return items.map((i) => ({ ...i, weight: even }));
  }
  const scaled = items.map((i) => ({
    ...i,
    weight: (i.weight / total) * 100,
  }));
  // Round each to 1 decimal, then fix the residual on the last item to ensure
  // the sum is exactly 100 (rounding can otherwise leave 99.9 or 100.1).
  const rounded = scaled.map((i, idx) =>
    idx < scaled.length - 1
      ? { ...i, weight: Math.round(i.weight * 10) / 10 }
      : i
  );
  const sumAllButLast = rounded
    .slice(0, -1)
    .reduce((s, i) => s + i.weight, 0);
  rounded[rounded.length - 1] = {
    ...rounded[rounded.length - 1],
    weight: Math.round((100 - sumAllButLast) * 10) / 10,
  };
  return rounded;
}

// ─── Preset portfolios — common allocations for educational pre-fill ────────

/** « 11,72 » : deux décimales, virgule française. */
const fr2 = (n: number) => n.toFixed(2).replace(".", ",");

export interface PortfolioPreset {
  id: string;
  name: string;
  description: string;
  /** Slugs (= displaySymbol or symbol prefix) and their weights. */
  allocation: Array<{ displaySymbol: string; weight: number }>;
}

export const PORTFOLIO_PRESETS: PortfolioPreset[] = [
  {
    id: "world-100",
    name: "MSCI World seul (100 %)",
    description:
      "Le portefeuille le plus simple : un seul ETF mondial. Diversifié sur ~1 300 entreprises, 23 pays développés.",
    allocation: [{ displaySymbol: "CW8", weight: 100 }],
  },
  // Corrigé le 28/09/2026 : les deux préréglages « émergents » utilisaient
  // AEEM, qui n'est PAS éligible PEA (reporting Amundi du 31/08/2026, version
  // pour professionnels : « Enveloppe fiscale : - »). Remplacé par PAEEM,
  // l'équivalent éligible PEA d'après la table de vérité ETF — le site est
  // centré sur le PEA.
  {
    id: "world-em-80-20",
    name: "Monde + émergents (80/20)",
    description:
      "Ajoute une part de marchés émergents, plus volatils, au monde développé : 80 % MSCI World, 20 % marchés émergents — les deux éligibles PEA.",
    allocation: [
      { displaySymbol: "CW8", weight: 80 },
      { displaySymbol: "PAEEM", weight: 20 },
    ],
  },
  // Description corrigée le 28/09/2026 : les « 10 % obligations » sont C3M,
  // un fonds quasi monétaire (bons du Trésor zone euro à moins de 6 mois,
  // table de vérité ETF), non éligible PEA — pas des obligations longues.
  {
    id: "world-em-bond-70-20-10",
    name: "Diversifié 70/20/10",
    description:
      "Trois piliers : 70 % monde développé, 20 % émergents, 10 % en fonds quasi monétaire (C3M : bons du Trésor de la zone euro à moins de 6 mois). C'est une poche de liquidités peu volatile, pas des obligations longues. C3M n'est pas éligible PEA : ce portefeuille demande un compte-titres ou une assurance-vie à côté.",
    allocation: [
      { displaySymbol: "CW8", weight: 70 },
      { displaySymbol: "PAEEM", weight: 20 },
      { displaySymbol: "C3M", weight: 10 },
    ],
  },
  // Corrigé le 28/09/2026 : ce préréglage pointait sur IUSN, retiré du
  // catalogue le 08/05/2026. Le préréglage se chargeait donc avec CW8 seul à
  // 90 % — un portefeuille qui ne faisait pas 100 %. Remplacé par RS2K, la
  // seule ligne petites capitalisations du catalogue (Russell 2000, éligible
  // PEA d'après la table de vérité) ; la description dit désormais ce qu'il
  // contient réellement : des small caps AMÉRICAINES, pas mondiales.
  // 29/09/2026 : la description ne montrait que la période favorable aux
  // petites capitalisations ; elle donne aussi les 10 ans, où l'ordre
  // s'inverse (SMALL_CAP_VS_USA_10Y, fiche MSCI au 31/08/2026).
  {
    id: "world-smallcap-90-10",
    name: "Monde + small caps US (90/10)",
    description:
      `Un tilt vers les petites entreprises : 90 % MSCI World pour la base, 10 % petites capitalisations américaines (Russell 2000). Depuis fin 2000, elles ont fait mieux que le marché américain large (MSCI USA Small Cap contre MSCI USA). Sur les 10 ans au ${SMALL_CAP_VS_USA_10Y.dataDate}, l'ordre s'inverse : ${fr2(SMALL_CAP_VS_USA_10Y.smallCapPct)}\u00a0%/an contre ${fr2(SMALL_CAP_VS_USA_10Y.usaPct)}\u00a0%/an (en dollars, dividendes bruts, fiche MSCI USA Small Cap Index). Aucune garantie pour la suite. Les deux éligibles PEA.`,
    allocation: [
      { displaySymbol: "CW8", weight: 90 },
      { displaySymbol: "RS2K", weight: 10 },
    ],
  },
];
