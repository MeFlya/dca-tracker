// ETF configuration — update symbols and metadata here without touching UI code.

export type ETFRegion =
  | "monde"
  | "usa"
  | "europe"
  | "emergents"
  | "japon"
  | "small-cap"
  | "obligations";

export interface ETFConfig {
  symbol: string;           // API symbol (e.g. "CW8.PA")
  displaySymbol: string;    // Short label for UI (e.g. "CW8")
  /** Short, recognizable name of the underlying index — what investors
   *  actually search for. e.g. "MSCI World", "S&P 500", "Nasdaq 100".
   *  Display this prominently and keep displaySymbol as a small badge. */
  indexLabel: string;
  name: string;
  description: string;      // Plain-language explanation for non-experts
  category: string;
  ter: number;              // Total Expense Ratio in %
  replicationMethod: string;
  distributionPolicy: "Capitalisant" | "Distribuant";
  isin?: string;
  peaEligible: boolean;     // Whether the ETF can be held in a French PEA
  /**
   * Fonds domicilié aux États-Unis, sans document d'informations clés (DIC).
   * Le règlement européen PRIIPs impose ce document pour vendre un produit à
   * un particulier ; l'émetteur américain ne le publie pas, et les courtiers
   * de l'UE refusent donc l'achat à la clientèle non professionnelle.
   * Jusqu'au 28/09/2026 le site présentait SPY et QQQ comme des ETF « à loger
   * en compte-titres » : un lecteur qui suivait la fiche se heurtait au refus
   * de son courtier.
   */
  sansDicUE?: true;
  region: ETFRegion;
}

export const ETF_LIST: ETFConfig[] = [

  // ─── Correction du catalogue, 28/09/2026 ──────────────────────────────────
  // Chaque nom, ISIN, TER, indice et statut PEA ci-dessous a été recoupé avec
  // la table de vérité du 28/09/2026 (émetteurs d'un côté, justETF /
  // Boursorama / Euronext de l'autre). Le catalogue présentait 500, ANX, AEEM
  // et JPNK comme éligibles au PEA : les reportings Amundi du 31/08/2026 les
  // donnent « Compte-titres, Assurance-vie ». Un lecteur qui recopiait l'ISIN
  // pour son PEA passait un ordre sur un fonds que son courtier refuse.
  // Le champ `symbol` des entrées existantes n'a PAS été touché : il alimente
  // les cours et les portefeuilles enregistrés des utilisateurs.

  // ── MSCI World — marché développé mondial ─────────────────────────────────

  {
    symbol: "CW8.PA",
    displaySymbol: "CW8",
    indexLabel: "MSCI World",
    // Nom corrigé le 28/09/2026 (était « Amundi MSCI World UCITS ETF ») :
    // nom officiel d'après la table de vérité.
    name: "Amundi MSCI World Swap UCITS ETF EUR Acc",
    // Description corrigée le 28/09/2026 : elle vantait des « frais bas ». À
    // 0,38 %, CW8 est le MSCI World éligible PEA le plus cher du catalogue
    // (WPEA et DCAM sont à 0,20 %).
    description:
      "Suit l'indice MSCI World (grandes entreprises des pays développés), éligible PEA : il détient un panier d'actions européennes et échange sa performance contre celle du MSCI World (réplication synthétique par swap). Pas le moins cher : à 0,38 % de frais, il coûte près du double de WPEA ou DCAM (0,20 %), qui suivent le même indice dans le même PEA.",
    category: "Actions monde développé",
    ter: 0.38,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681043599",
    peaEligible: true,
    region: "monde",
  },
  {
    // Ajouté le 28/09/2026 d'après la table de vérité. Réplication : le nom
    // officiel du fonds contient « Swap ».
    symbol: "WPEA.PA",
    displaySymbol: "WPEA",
    indexLabel: "MSCI World",
    name: "iShares MSCI World Swap PEA UCITS ETF EUR (Acc)",
    description:
      "Le MSCI World dans le PEA, chez iShares, par réplication synthétique (swap). Frais de 0,20 %, contre 0,38 % pour le CW8 sur le même indice. Lancé en mars 2024 et coté à Paris depuis avril 2024 ; une part vaut moins de 10 €, ce qui laisse investir de petits montants chaque mois.",
    category: "Actions monde développé",
    ter: 0.2,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "IE0002XZSHO1",
    peaEligible: true,
    region: "monde",
  },
  {
    // Ajouté le 28/09/2026 d'après la table de vérité. Réplication : la table
    // ne la donne pas ; « synthétique » est déduit du statut PEA — un fonds
    // qui doit détenir 75 % d'actions européennes ne peut livrer le MSCI World
    // (très majoritairement hors Europe) que par un swap.
    symbol: "DCAM.PA",
    displaySymbol: "DCAM",
    indexLabel: "MSCI World",
    name: "Amundi PEA Monde (MSCI World) UCITS ETF Acc",
    description:
      "Le MSCI World dans le PEA, chez Amundi, à 0,20 % de frais — le même indice que le CW8, du même émetteur, pour environ moitié moins de frais. Lancé en mars 2025 ; une part vaut moins de 10 €, ce qui laisse investir de petits montants chaque mois.",
    category: "Actions monde développé",
    ter: 0.2,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "FR001400U5Q4",
    peaEligible: true,
    region: "monde",
  },
  {
    // Le symbole EWLD.PA a été remplacé ici par IWDA.AS (Twelve Data ne
    // listait pas EWLD). Commentaire corrigé le 28/09/2026 : il affirmait que
    // le listing IWDA « couvre le même fonds (même ISIN) » qu'EWLD. Faux
    // d'après la table de vérité : EWLD est un fonds AMUNDI (LU2655993207,
    // part distribuante du fonds de CW8, éligible PEA) ; IWDA est un fonds
    // iShares physique (IE00B4L5Y983), non éligible PEA. Ce ne sont pas les
    // mêmes fonds.
    symbol: "IWDA.AS",
    displaySymbol: "IWDA",
    indexLabel: "MSCI World",
    name: "iShares Core MSCI World UCITS ETF USD (Acc)",
    description:
      "Alternative à réplication physique au CW8, également exposée au MSCI World, sans le risque de contrepartie d'un swap. Non éligible PEA — à loger en CTO ou assurance-vie. Pour le MSCI World dans un PEA : WPEA, DCAM ou CW8.",
    category: "Actions monde développé",
    ter: 0.2,
    replicationMethod: "Physique optimisé",
    distributionPolicy: "Capitalisant",
    isin: "IE00B4L5Y983",
    peaEligible: false,
    region: "monde",
  },

  // ── FTSE All-World — monde entier (développés + émergents) ───────────────

  {
    symbol: "VWCE.DE",
    displaySymbol: "VWCE",
    indexLabel: "FTSE All-World",
    // Nom et TER corrigés le 28/09/2026 d'après la table de vérité : le TER
    // affiché (0,22 %) était périmé, il est de 0,14 %.
    name: "Vanguard FTSE All-World UCITS ETF (USD) Accumulating",
    description:
      "Couverture la plus large : pays développés ET émergents dans un seul ETF, pour 0,14 % de frais. Réplication physique, non éligible PEA — à loger en CTO ou assurance-vie.",
    category: "Actions monde (tous pays)",
    ter: 0.14,
    replicationMethod: "Physique optimisé",
    distributionPolicy: "Capitalisant",
    isin: "IE00BK5BQT80",
    peaEligible: false,
    region: "monde",
  },

  // ── S&P 500 — grandes capitalisations américaines ─────────────────────────

  {
    // Commentaire corrigé le 28/09/2026 : il affirmait que ce fonds était
    // l'ex-Lyxor SP5 « même ISIN ». La table de vérité ne le confirme pas ;
    // l'affirmation est retirée. L'URL /etf/SP5 redirige toujours ici.
    symbol: "500.PA",
    displaySymbol: "500",
    indexLabel: "S&P 500",
    // Corrigé le 28/09/2026 : présenté comme « version PEA-éligible » et
    // peaEligible: true. Faux — reporting Amundi du 31/08/2026 : « Éligibilité :
    // Compte-titres, Assurance-vie ». Nom officiel d'après la table.
    name: "Amundi S&P 500 Swap UCITS ETF EUR Acc",
    description:
      "Le S&P 500 par Amundi, en réplication synthétique, à 0,15 % de frais. NON éligible au PEA (compte-titres ou assurance-vie seulement). Pour le S&P 500 dans un PEA : PSP5 (Amundi, 0,12 %), SPEA (iShares, 0,10 %) ou ESE (BNP Paribas, 0,14 %).",
    category: "Actions USA (S&P 500)",
    ter: 0.15,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681048804",
    peaEligible: false,
    region: "usa",
  },
  {
    // Ajouté le 28/09/2026 d'après la table de vérité. Réplication : la table
    // ne la donne pas ; « synthétique » est déduit du statut PEA — un fonds
    // qui doit détenir 75 % d'actions européennes ne peut livrer un indice
    // 100 % américain que par un swap.
    symbol: "PSP5.PA",
    displaySymbol: "PSP5",
    indexLabel: "S&P 500",
    name: "Amundi PEA S&P 500 UCITS ETF Acc",
    description:
      "Le S&P 500 dans le PEA, chez Amundi, à 0,12 % de frais. C'est l'équivalent éligible PEA du « 500 » d'Amundi, qui ne l'est pas. Les 500 plus grandes entreprises américaines, dividendes réinvestis.",
    category: "Actions USA (S&P 500)",
    ter: 0.12,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "FR0011871128",
    peaEligible: true,
    region: "usa",
  },
  {
    symbol: "CSPX.L",
    displaySymbol: "CSPX",
    indexLabel: "S&P 500",
    // Nom corrigé le 28/09/2026 d'après la table. Description : « le moins
    // cher d'Europe » retiré — seule notre sélection a été vérifiée.
    name: "iShares Core S&P 500 UCITS ETF USD (Acc)",
    description:
      "Le S&P 500 en réplication physique, coté à Londres en USD, à 0,07 % de frais — le TER le plus bas de notre sélection sur cet indice, à égalité avec le VUSA. Non éligible PEA — à loger en CTO. Pour le S&P 500 dans un PEA : PSP5, SPEA ou ESE.",
    category: "Actions USA (S&P 500)",
    ter: 0.07,
    replicationMethod: "Physique complet",
    distributionPolicy: "Capitalisant",
    isin: "IE00B5BMR087",
    peaEligible: false,
    region: "usa",
  },
  {
    symbol: "SPY",
    displaySymbol: "SPY",
    indexLabel: "S&P 500",
    name: "SPDR S&P 500 ETF Trust",
    // Hors table de vérité du 28/09/2026 : TER et ISIN non recoupés.
    // « L'ETF le plus échangé au monde » retiré le 28/09/2026 : la fiche
    // détaillée l'avait déjà retiré faute de pouvoir le recouper.
    description:
      "Le plus ancien ETF sur le S&P 500 (1993), celui dont on cite la performance. Fonds américain sans DIC : en principe inaccessible à un particulier de l'UE. Équivalents UCITS : CSPX ou VUSA en compte-titres, PSP5, SPEA ou ESE dans un PEA.",
    category: "Actions USA (S&P 500)",
    ter: 0.0945,
    replicationMethod: "Physique complet",
    distributionPolicy: "Distribuant",
    isin: "US78462F1030",
    peaEligible: false,
    sansDicUE: true,
    region: "usa",
  },
  {
    symbol: "VUSA.AS",
    displaySymbol: "VUSA",
    indexLabel: "S&P 500",
    // Corrigé le 28/09/2026 d'après la table : le VUSA est la part
    // DISTRIBUANTE (« Distributing »), le catalogue le disait capitalisant.
    // « Frais parmi les plus bas du marché » retiré : seule notre sélection a
    // été vérifiée.
    name: "Vanguard S&P 500 UCITS ETF (USD) Distributing",
    description:
      "ETF S&P 500 de Vanguard coté à Amsterdam, à 0,07 % de frais — autant que le CSPX. Réplication physique. Part distribuante : les dividendes sont versés, donc imposables chaque année en compte-titres. Non éligible PEA ; pour le S&P 500 dans un PEA : PSP5, SPEA ou ESE.",
    category: "Actions USA (S&P 500)",
    ter: 0.07,
    replicationMethod: "Physique complet",
    distributionPolicy: "Distribuant",
    isin: "IE00B3XXRP09",
    peaEligible: false,
    region: "usa",
  },

  // ── Nasdaq-100 — technologie américaine ──────────────────────────────────

  {
    // Ajouté le 28/09/2026 d'après la table de vérité : le Nasdaq-100 ÉLIGIBLE
    // PEA d'Amundi. Sans lui, le guide « Nasdaq 100 en PEA » présélectionnait
    // ANX, qui ne l'est pas. Réplication : la table ne la donne pas ;
    // « synthétique » est déduit du statut PEA, comme pour DCAM et PAEEM.
    // ⚠️ Ce n'est PAS « le seul » Nasdaq-100 éligible PEA : d'autres lignes
    // existent. Ne jamais écrire le contraire.
    symbol: "PUST.PA",
    displaySymbol: "PUST",
    indexLabel: "Nasdaq-100",
    name: "Amundi PEA Nasdaq-100 UCITS ETF Acc",
    description:
      "Le Nasdaq-100 — les 100 plus grandes valeurs non financières du Nasdaq, très orientées technologie — dans le PEA, chez Amundi, à 0,30 % de frais. Environ 1,2 milliard d'euros d'encours fin août 2026. Une exposition concentrée, à réserver à une part minoritaire d'un portefeuille.",
    category: "Actions technologie US",
    ter: 0.3,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "FR0011871110",
    peaEligible: true,
    region: "usa",
  },
  {
    symbol: "ANX.PA",
    displaySymbol: "ANX",
    indexLabel: "Nasdaq 100",
    // Corrigé le 28/09/2026 : présenté comme « seule solution PEA-éligible »
    // et peaEligible: true. Double faute — reporting Amundi du 31/08/2026 :
    // « Éligibilité : Compte-titres, Assurance-vie » ; et des lignes Nasdaq-100
    // éligibles PEA existent (PUST, PNAS). Nom officiel d'après la table.
    name: "Amundi Nasdaq-100 Swap UCITS ETF EUR Acc",
    description:
      "Le Nasdaq-100 — les 100 plus grandes valeurs non financières du Nasdaq, très orientées technologie — par Amundi, en réplication synthétique, à 0,23 % de frais. NON éligible au PEA (compte-titres ou assurance-vie seulement). Pour le Nasdaq-100 dans un PEA : PUST (Amundi PEA Nasdaq-100, 0,30 %).",
    category: "Actions Tech USA (Nasdaq-100)",
    ter: 0.23,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681038243",
    peaEligible: false,
    region: "usa",
  },
  {
    symbol: "QQQ",
    displaySymbol: "QQQ",
    indexLabel: "Nasdaq 100",
    // Nom et TER corrigés le 28/09/2026 d'après la table : frais passés de
    // 0,20 % à 0,18 % le 22/12/2025.
    name: "Invesco QQQ Trust, Series 1",
    description:
      "La version américaine historique du Nasdaq-100, à 0,18 % de frais, distribuant et libellé en USD. Fonds américain sans DIC : en principe inaccessible à un particulier de l'UE. Équivalents UCITS : CNDX ou ANX en compte-titres, PUST dans un PEA.",
    category: "Actions Tech USA (Nasdaq-100)",
    ter: 0.18,
    replicationMethod: "Physique complet",
    distributionPolicy: "Distribuant",
    isin: "US46090E1038",
    peaEligible: false,
    sansDicUE: true,
    region: "usa",
  },

  // ── Marchés émergents ─────────────────────────────────────────────────────

  {
    // Ajouté le 28/09/2026 d'après la table de vérité : l'ETF émergents
    // ÉLIGIBLE PEA d'Amundi. Jusqu'ici /etf/PAEEM redirigeait vers AEEM, un
    // autre fonds, non éligible. Réplication : la table ne la donne pas ;
    // « synthétique » est déduit du statut PEA (un fonds tenu à 75 %
    // d'actions européennes ne peut livrer les émergents que par un swap).
    symbol: "PAEEM.PA",
    displaySymbol: "PAEEM",
    indexLabel: "Marchés émergents",
    name: "Amundi PEA Emergent (MSCI Emerging) ESG Transition UCITS ETF Acc",
    description:
      "Les marchés émergents (Chine, Inde, Taïwan, Corée du Sud, Brésil…) dans le PEA, chez Amundi, à 0,30 % de frais. L'indice suivi est une variante « ESG Transition » du MSCI Emerging Markets, pas l'indice standard. Complète un ETF MSCI World pour couvrir aussi les pays émergents.",
    category: "Actions marchés émergents",
    ter: 0.3,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "FR0013412020",
    peaEligible: true,
    region: "emergents",
  },
  {
    // Commentaire corrigé le 28/09/2026 : il présentait AEEM comme
    // « ex-Lyxor PAEEM ». Faux d'après la table : PAEEM est un AUTRE fonds
    // (FR0013412020, éligible PEA) ; AEEM (LU1681045370) ne l'est pas —
    // reporting Amundi du 31/08/2026 : « Compte-titres, Assurance-vie ».
    symbol: "AEEM.PA",
    displaySymbol: "AEEM",
    indexLabel: "Marchés émergents",
    name: "Amundi MSCI Emerging Markets Swap UCITS ETF EUR Acc",
    description:
      "Les marchés émergents (Chine, Inde, Taïwan, Corée du Sud, Brésil…) via l'indice MSCI Emerging Markets, en réplication synthétique, à 0,20 % de frais. NON éligible au PEA (compte-titres ou assurance-vie seulement). Pour les émergents dans un PEA : PAEEM (Amundi PEA Emergent, 0,30 %).",
    category: "Actions marchés émergents",
    ter: 0.2,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681045370",
    peaEligible: false,
    region: "emergents",
  },

  // ── Europe ────────────────────────────────────────────────────────────────

  {
    // Corrigé le 28/09/2026 d'après la table de vérité. Le catalogue donnait
    // « STOXX Europe 600 », ISIN LU1681049328 et TER 0,07 % : TOUT FAUX. PCEU
    // suit le MSCI Europe, ISIN FR0013412038, TER 0,15 %.
    symbol: "PCEU.PA",
    displaySymbol: "PCEU",
    indexLabel: "MSCI Europe",
    name: "Amundi PEA MSCI Europe UCITS ETF Acc",
    description:
      "Exposition aux grandes et moyennes entreprises des pays développés d'Europe, via l'indice MSCI Europe, à 0,15 % de frais. Éligible PEA. Sert à renforcer la part européenne d'un portefeuille déjà investi sur le MSCI World.",
    category: "Actions Europe (MSCI Europe)",
    ter: 0.15,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "FR0013412038",
    peaEligible: true,
    region: "europe",
  },

  // ── Small Cap ─────────────────────────────────────────────────────────────

  {
    // Corrigé le 28/09/2026 d'après la table de vérité : l'ISIN affiché
    // (LU1681038755) est introuvable ; le bon est LU1681038672, part EUR Acc.
    // Le nom disait « MSCI Russell 2000 » : l'indice est le Russell 2000, sans
    // rapport avec MSCI.
    symbol: "RS2K.PA",
    displaySymbol: "RS2K",
    indexLabel: "Russell 2000",
    name: "Amundi Russell 2000 UCITS ETF EUR Acc",
    description:
      "Exposition à environ 2 000 petites capitalisations américaines via l'indice Russell 2000, en réplication synthétique, éligible PEA, à 0,35 % de frais. Complément du S&P 500 pour ajouter les petites entreprises américaines, avec un risque plus élevé.",
    category: "Actions petites caps USA",
    ter: 0.35,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681038672",
    peaEligible: true,
    region: "small-cap",
  },
  // Note: l'ancienne entrée "SMAE — Amundi MSCI Europe Small Cap" a été
  // supprimée le 22/04/2026. Son ISIN (LU1681038672) pointait en réalité sur
  // le même fonds que RS2K, et le nom était incorrect — c'était un doublon
  // trompeur. Précision du 28/09/2026 (table de vérité) : LU1681038672 est la
  // part EUR Acc du Russell 2000 — PAS une part couverte (« EUR-hedged »,
  // comme l'écrivait cette note) — et c'est désormais l'ISIN de RS2K. Un vrai
  // ETF Europe Small Cap pourra être ajouté ultérieurement (candidat : ZPRS /
  // SPDR MSCI Europe Small Cap Value Weighted, ISIN IE00BSPLC413, non PEA —
  // non recoupé par la table du 28/09/2026).
  // Note (2026-05-08) : IUSN (iShares MSCI World Small Cap, IE00BF4RFH31)
  // retiré du sitemap. Niche faible volume FR, réservé CTO, pas de detail
  // content rédigé → page tombait sur le template thin et était classée
  // "détectée non indexée" par Google. Pas de redirect (pas de successeur
  // direct) — Google va la drop naturellement.

  // ── Japon ─────────────────────────────────────────────────────────────────

  {
    // Corrigé le 28/09/2026 d'après la table de vérité : le catalogue
    // annonçait l'indice TOPIX, un TER de 0,20 % et l'éligibilité PEA. Ce
    // fonds suit le JPX-Nikkei 400 (PAS le TOPIX), coûte 0,18 % et n'est PAS
    // éligible PEA. L'ancien commentaire « ex-Lyxor LYYA » n'est pas confirmé
    // par la table ; il est retiré (l'URL /etf/LYYA redirige toujours ici).
    symbol: "JPNK.PA",
    displaySymbol: "JPNK",
    indexLabel: "JPX-Nikkei 400",
    name: "Amundi JPX-Nikkei 400 UCITS ETF EUR Acc",
    description:
      "Exposition au marché japonais via l'indice JPX-Nikkei 400 (400 entreprises japonaises), à 0,18 % de frais. NON éligible au PEA — compte-titres ou assurance-vie. Complément géographique pour diversifier hors États-Unis et Europe.",
    category: "Actions Japon",
    ter: 0.18,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681038912",
    peaEligible: false,
    region: "japon",
  },

  // ── Obligataire — allocation défensive ────────────────────────────────────

  {
    // Corrigé le 28/09/2026 d'après la table de vérité : présenté comme un
    // « ETF obligataire sur les emprunts d'État » distribuant. C3M est un fonds
    // QUASI MONÉTAIRE (bons du Trésor zone euro à moins de 6 mois, indice FTSE
    // Eurozone Government Bill 0-6 Month), en part capitalisante (« Acc »).
    // L'ancien commentaire « ex-Lyxor OBLI » n'est pas confirmé par la table ;
    // il est retiré (l'URL /etf/OBLI redirige toujours ici).
    symbol: "C3M.PA",
    displaySymbol: "C3M",
    indexLabel: "Bons du Trésor euro 0-6 mois",
    name: "Amundi Euro Government Bond 0-6 M UCITS ETF Acc",
    description:
      "Fonds quasi monétaire : il détient des bons du Trésor des États de la zone euro qui arrivent à échéance dans moins de 6 mois (indice FTSE Eurozone Government Bill 0-6 Month). C'est une poche de liquidités peu volatile, pas un fonds d'obligations longues dont le prix varie fortement avec les taux. Non éligible PEA — CTO ou assurance-vie.",
    category: "Quasi-monétaire zone euro",
    ter: 0.14,
    replicationMethod: "Physique optimisé",
    distributionPolicy: "Capitalisant",
    isin: "FR0010754200",
    peaEligible: false,
    region: "obligations",
  },
];

export function getETFBySymbol(symbol: string): ETFConfig | undefined {
  return ETF_LIST.find((e) => e.symbol === symbol || e.displaySymbol === symbol);
}

/**
 * TER de référence pour préremplir le simulateur depuis une page générique.
 *
 * ─── Pourquoi une constante dérivée et non un nombre écrit ──────────────────
 *
 * Six liens du site passaient `fees=0.3` au simulateur. Or 0,30 % n'était le
 * TER d'AUCUN ETF du catalogue d'alors — qui allait de 0,07 % à 0,38 % sans
 * jamais passer par 0,30. C'était la même classe de défaut que le `fees=0.25`
 * retiré des pages de comparaison : un chiffre plausible, choisi au jugé, sur
 * un site dont l'argument est que ses chiffres sont vérifiables.
 * (Précision du 28/09/2026 : PAEEM, ajouté ce jour-là, coûte 0,30 % ; le
 * raisonnement tient — un chiffre choisi au jugé reste un chiffre au jugé.)
 *
 * ─── Pourquoi CW8 et pas le moins cher ──────────────────────────────────────
 *
 * Arbitrage de Maël, le 2 août 2026 : c'est le MSCI World le plus détenu en
 * France, le seul du catalogue éligible au PEA à cette date (WPEA et DCAM, à
 * 0,20 %, y sont entrés le 28/09/2026), et celui que le site décrit
 * lui-même par « gros encours, liquidité, présence chez tous les courtiers ».
 * Une projection par défaut doit refléter ce que les gens DÉTIENNENT, pas ce
 * qu'on leur recommanderait d'acheter — sinon elle flatte le résultat, et un
 * lecteur qui possède du CW8 verrait une projection qui n'est pas la sienne.
 * Prendre 0,20 % aurait embelli la courbe de 2 000 € sur vingt ans.
 *
 * Lu dans le catalogue plutôt que recopié : le jour où le TER de CW8 change,
 * les six liens suivent. C'est tout l'objet de l'exercice.
 */
export const TER_REFERENCE_SIMULATEUR =
  ETF_LIST.find((e) => e.displaySymbol === "CW8")?.ter ?? 0.38;
