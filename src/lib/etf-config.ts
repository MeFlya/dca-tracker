// ETF configuration — update symbols and metadata here without touching UI code.
// TODO (premium): Move to a CMS or database to allow admin editing.

export interface ETFConfig {
  symbol: string;          // API symbol (e.g. "CW8.PA")
  displaySymbol: string;   // Short label for UI (e.g. "CW8")
  name: string;
  description: string;     // Plain-language explanation for non-experts
  category: string;
  ter: number;             // Total Expense Ratio in % (informational)
  replicationMethod: string;
  distributionPolicy: "Capitalisant" | "Distribuant";
  isin?: string;
}

export const ETF_LIST: ETFConfig[] = [
  {
    symbol: "CW8.PA",
    displaySymbol: "CW8",
    name: "Amundi MSCI World UCITS ETF",
    description:
      "Suit l'indice MSCI World, qui regroupe environ 1 500 grandes entreprises des pays développés. L'un des ETF monde les plus populaires en France grâce à ses frais très bas.",
    category: "Actions monde développé",
    ter: 0.38,
    replicationMethod: "Synthétique (swap)",
    distributionPolicy: "Capitalisant",
    isin: "LU1681043599",
  },
  {
    symbol: "EWLD.PA",
    displaySymbol: "EWLD",
    name: "iShares MSCI World UCITS ETF",
    description:
      "Alternative physique au CW8, également exposée au MSCI World. Convient aux investisseurs qui préfèrent la réplication physique pour éviter le risque de contrepartie.",
    category: "Actions monde développé",
    ter: 0.2,
    replicationMethod: "Physique optimisé",
    distributionPolicy: "Capitalisant",
    isin: "IE00B4L5Y983",
  },
  {
    symbol: "VWCE.DE",
    displaySymbol: "VWCE",
    name: "Vanguard FTSE All-World UCITS ETF",
    description:
      "Couverture la plus large parmi les ETF populaires : pays développés ET émergents, soit environ 3 700 entreprises. Idéal pour une diversification maximale en un seul ETF.",
    category: "Actions monde (tous pays)",
    ter: 0.22,
    replicationMethod: "Physique optimisé",
    distributionPolicy: "Capitalisant",
    isin: "IE00BK5BQT80",
  },
  {
    symbol: "SPY",
    displaySymbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    description:
      "L'ETF le plus échangé au monde. Réplique le S&P 500, l'indice des 500 plus grandes entreprises américaines. Référence absolue pour l'exposition aux actions US.",
    category: "Actions USA",
    ter: 0.0945,
    replicationMethod: "Physique complet",
    distributionPolicy: "Distribuant",
    isin: "US78462F1030",
  },
  {
    symbol: "QQQ",
    displaySymbol: "QQQ",
    name: "Invesco Nasdaq-100 ETF",
    description:
      "Exposé aux 100 plus grandes entreprises non-financières du Nasdaq, très orienté technologie (Apple, Microsoft, Nvidia…). Potentiel de rendement élevé avec une volatilité plus forte.",
    category: "Actions Tech USA (Nasdaq-100)",
    ter: 0.2,
    replicationMethod: "Physique complet",
    distributionPolicy: "Distribuant",
    isin: "US46090E1038",
  },
];

export function getETFBySymbol(symbol: string): ETFConfig | undefined {
  return ETF_LIST.find((e) => e.symbol === symbol || e.displaySymbol === symbol);
}
