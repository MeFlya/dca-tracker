// ISIN → Twelve Data symbol mapping.
//
// Produit par l'audit `scripts/audit-twelve-data.ts` (22/04/2026).
// Pour chaque ETF de notre catalogue, indique le symbole Twelve Data le
// plus pertinent (priorité Euronext Paris > Amsterdam > XETRA > LSE > US).
//
// IMPORTANT : ne pas modifier sans relancer l'audit (`npx tsx
// scripts/audit-twelve-data.ts`). Twelve Data peut renommer un ticker
// suite à un changement d'émetteur (ex: rachat Lyxor → Amundi 2022).

export interface TwelveDataMapping {
  /** Symbol exact à utiliser dans l'API Twelve Data (sans suffixe d'exchange) */
  tdSymbol: string;
  /** Exchange Twelve Data (utilisé pour disambiguer si le symbole est listé sur plusieurs bourses) */
  tdExchange: string;
  /** Devise de cotation sur cet exchange — sert pour l'affichage si l'API ne la renvoie pas */
  currency: "EUR" | "USD" | "GBP" | "CHF";
  /** Libellé humain de la bourse (UI) */
  displayExchange: string;
}

export const ISIN_TO_TWELVE_DATA: Record<string, TwelveDataMapping> = {
  // ── Monde ────────────────────────────────────────────────────────────
  "LU1681043599": { // CW8 — Amundi MSCI World
    tdSymbol: "CW8",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },
  "IE00B4L5Y983": { // IWDA — iShares Core MSCI World (ex-EWLD.PA)
    tdSymbol: "IWDA",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Amsterdam",
  },
  "IE00BK5BQT80": { // VWCE — Vanguard FTSE All-World
    tdSymbol: "VWCE",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Amsterdam",
  },

  // ── S&P 500 ──────────────────────────────────────────────────────────
  "LU1681048804": { // 500 — Amundi S&P 500 (ex-SP5)
    tdSymbol: "500",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },
  "IE00B5BMR087": { // CSPX — iShares Core S&P 500
    tdSymbol: "CSPX",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Amsterdam",
  },
  "US78462F1030": { // SPY — SPDR S&P 500
    tdSymbol: "SPY",
    tdExchange: "NYSE",
    currency: "USD",
    displayExchange: "NYSE",
  },
  "IE00B3XXRP09": { // VUSA — Vanguard S&P 500
    tdSymbol: "VUSA",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Amsterdam",
  },

  // ── Nasdaq-100 ───────────────────────────────────────────────────────
  "LU1681038243": { // ANX — Amundi Nasdaq-100
    tdSymbol: "ANX",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },
  "US46090E1038": { // QQQ — Invesco Nasdaq-100
    tdSymbol: "QQQ",
    tdExchange: "NASDAQ",
    currency: "USD",
    displayExchange: "NASDAQ",
  },

  // ── Émergents ────────────────────────────────────────────────────────
  "LU1681045370": { // AEEM — Amundi MSCI Emerging Markets (ex-PAEEM)
    tdSymbol: "AEEM",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },

  // ── Europe ───────────────────────────────────────────────────────────
  "LU1681049328": { // PCEU — Amundi STOXX Europe 600
    tdSymbol: "PCEU",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },

  // ── Small Cap ────────────────────────────────────────────────────────
  "LU1681038755": { // RS2K — Amundi MSCI Russell 2000
    tdSymbol: "RS2K",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },
  "IE00BF4RFH31": { // IUSN — iShares MSCI World Small Cap (XETRA EUR par choix)
    tdSymbol: "IUSN",
    tdExchange: "XETR",
    currency: "EUR",
    displayExchange: "Xetra",
  },

  // ── Japon ────────────────────────────────────────────────────────────
  "LU1681038912": { // JPNK — Amundi Japan TOPIX (ex-LYYA)
    tdSymbol: "JPNK",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },

  // ── Obligations ──────────────────────────────────────────────────────
  "FR0010754200": { // C3M — Amundi Euro Government Bond (ex-OBLI)
    tdSymbol: "C3M",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },
};

/** Returns the Twelve Data mapping for an ISIN, or undefined if not covered. */
export function getTwelveDataMapping(isin: string): TwelveDataMapping | undefined {
  return ISIN_TO_TWELVE_DATA[isin];
}
