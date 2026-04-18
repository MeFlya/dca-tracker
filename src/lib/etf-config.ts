// ETF configuration — update symbols and metadata here without touching UI code.

export interface ETFConfig {
  symbol: string;           // API symbol (e.g. "CW8.PA")
  displaySymbol: string;    // Short label for UI (e.g. "CW8")
  name: string;
  description: string;      // Plain-language explanation for non-experts
  category: string;
  ter: number;              // Total Expense Ratio in %
  replicationMethod: string;
  distributionPolicy: "Capitalisant" | "Distribuant";
  isin?: string;
  peaEligible: boolean;     // Whether the ETF can be held in a French PEA
}

export const ETF_LIST: ETFConfig[] = [

  // ── MSCI World — marché développé mondial ─────────────────────────────────

  {
    symbol: "CW8.PA",
    displaySymbol: "CW8",
    name: "Amundi MSCI World UCITS ETF",
    description:
      "Suit l'indice MSCI World (~1 500 grandes entreprises des pays développés). L'un des ETF monde les plus populaires en France grâce à ses frais bas et son éligibilité PEA via réplication synthétique.",
    category: "Actions monde développé",
    ter: 0.38,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681043599",
    peaEligible: true,
  },
  {
    symbol: "EWLD.PA",
    displaySymbol: "EWLD",
    name: "iShares MSCI World UCITS ETF",
    description:
      "Alternative à réplication physique au CW8, également exposée au MSCI World. Convient aux investisseurs qui préfèrent éviter le risque de contrepartie des swaps, tout en conservant l'éligibilité PEA.",
    category: "Actions monde développé",
    ter: 0.2,
    replicationMethod: "Physique optimisé",
    distributionPolicy: "Capitalisant",
    isin: "IE00B4L5Y983",
    peaEligible: true,
  },

  // ── FTSE All-World — monde entier (développés + émergents) ───────────────

  {
    symbol: "VWCE.DE",
    displaySymbol: "VWCE",
    name: "Vanguard FTSE All-World UCITS ETF",
    description:
      "Couverture la plus large : pays développés ET émergents, soit ~3 700 entreprises dans 49 pays. Idéal pour une diversification maximale en un seul ETF. Réplication physique — à loger en CTO ou assurance-vie.",
    category: "Actions monde (tous pays)",
    ter: 0.22,
    replicationMethod: "Physique optimisé",
    distributionPolicy: "Capitalisant",
    isin: "IE00BK5BQT80",
    peaEligible: false,
  },

  // ── S&P 500 — grandes capitalisations américaines ─────────────────────────

  {
    symbol: "SP5.PA",
    displaySymbol: "SP5",
    name: "Amundi S&P 500 UCITS ETF",
    description:
      "Version PEA-éligible du S&P 500 par Amundi. Réplication synthétique permettant d'accéder aux 500 plus grandes entreprises américaines dans le cadre fiscal avantageux du PEA. TER très compétitif à 0,15 %.",
    category: "Actions USA (S&P 500)",
    ter: 0.15,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681048804",
    peaEligible: true,
  },
  {
    symbol: "CSPX.L",
    displaySymbol: "CSPX",
    name: "iShares Core S&P 500 UCITS ETF",
    description:
      "L'ETF S&P 500 physique le moins cher d'Europe (TER 0,07 %), coté à Londres en USD. Réplique fidèlement les 500 plus grandes capitalisations américaines. Non éligible PEA — à loger en CTO.",
    category: "Actions USA (S&P 500)",
    ter: 0.07,
    replicationMethod: "Physique complet",
    distributionPolicy: "Capitalisant",
    isin: "IE00B5BMR087",
    peaEligible: false,
  },
  {
    symbol: "SPY",
    displaySymbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    description:
      "L'ETF le plus échangé au monde. Référence absolue pour l'exposition aux actions US — mais distribuant, libellé en USD et non éligible PEA. Plutôt utilisé comme référence ou sur CTO.",
    category: "Actions USA (S&P 500)",
    ter: 0.0945,
    replicationMethod: "Physique complet",
    distributionPolicy: "Distribuant",
    isin: "US78462F1030",
    peaEligible: false,
  },

  // ── Nasdaq-100 — technologie américaine ──────────────────────────────────

  {
    symbol: "ANX.PA",
    displaySymbol: "ANX",
    name: "Amundi Nasdaq-100 UCITS ETF",
    description:
      "Seule solution PEA-éligible pour s'exposer au Nasdaq-100 — les 100 plus grandes valeurs tech américaines (Apple, Microsoft, Nvidia…). Réplication synthétique par Amundi, le n°1 européen de la gestion d'actifs.",
    category: "Actions Tech USA (Nasdaq-100)",
    ter: 0.23,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681038243",
    peaEligible: true,
  },
  {
    symbol: "QQQ",
    displaySymbol: "QQQ",
    name: "Invesco Nasdaq-100 ETF",
    description:
      "La version américaine historique du Nasdaq-100. Très liquide avec des frais raisonnables, mais distribuant, libellé en USD et non éligible PEA. Référence de performance tech aux États-Unis.",
    category: "Actions Tech USA (Nasdaq-100)",
    ter: 0.2,
    replicationMethod: "Physique complet",
    distributionPolicy: "Distribuant",
    isin: "US46090E1038",
    peaEligible: false,
  },

  // ── Marchés émergents ─────────────────────────────────────────────────────

  {
    symbol: "PAEEM.PA",
    displaySymbol: "PAEEM",
    name: "Amundi MSCI Emerging Markets UCITS ETF",
    description:
      "Exposition aux marchés émergents (Chine, Inde, Taïwan, Corée du Sud, Brésil…) via PEA grâce à la réplication synthétique d'Amundi. Complète idéalement un ETF MSCI World pour une diversification mondiale complète.",
    category: "Actions marchés émergents",
    ter: 0.2,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681045370",
    peaEligible: true,
  },

  // ── Europe ────────────────────────────────────────────────────────────────

  {
    symbol: "PCEU.PA",
    displaySymbol: "PCEU",
    name: "Amundi STOXX Europe 600 UCITS ETF",
    description:
      "Exposition large à l'économie européenne via les 600 plus grandes capitalisations des 17 principaux pays d'Europe (ASML, LVMH, Novo Nordisk, Shell, Nestlé…). TER ultra-compétitif à 0,07 %. Éligible PEA.",
    category: "Actions Europe (STOXX 600)",
    ter: 0.07,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681049328",
    peaEligible: true,
  },

  // ── Obligataire — allocation défensive ────────────────────────────────────

  {
    symbol: "OBLI.PA",
    displaySymbol: "OBLI",
    name: "Amundi Euro Government Bond UCITS ETF",
    description:
      "ETF obligataire sur les emprunts d'État de la zone euro. Offre une composante défensive dans un portefeuille multi-actifs — contrepoids à la volatilité des ETF actions. Non éligible PEA (obligations), à loger en CTO ou assurance-vie.",
    category: "Obligations zone euro",
    ter: 0.14,
    replicationMethod: "Physique optimisé",
    distributionPolicy: "Distribuant",
    isin: "FR0010754200",
    peaEligible: false,
  },
];

export function getETFBySymbol(symbol: string): ETFConfig | undefined {
  return ETF_LIST.find((e) => e.symbol === symbol || e.displaySymbol === symbol);
}
