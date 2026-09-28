// ISIN → Twelve Data symbol mapping.
//
// Produit par l'audit `scripts/audit-twelve-data.ts` (22/04/2026).
// Pour chaque ETF de notre catalogue, indique le symbole Twelve Data le
// plus pertinent (priorité Euronext Paris > Amsterdam > XETRA > LSE > US).
//
// IMPORTANT : ne pas modifier sans relancer l'audit (`npx tsx
// scripts/audit-twelve-data.ts`). Twelve Data peut renommer un ticker
// suite à un changement d'émetteur (ex: rachat Lyxor → Amundi 2022).
//
// 28/09/2026 : les clés PCEU et RS2K ont été réalignées sur les ISIN corrigés
// du catalogue (table de vérité ETF) — les anciennes clés (LU1681049328,
// LU1681038755) étaient fausses, et ce fichier étant indexé par ISIN, ces deux
// ETF n'auraient plus trouvé leur cours. Les tdSymbol n'ont pas changé.
// Les commentaires de nom ont été alignés sur les noms officiels.
// WPEA, DCAM, PAEEM et PSP5, entrés au catalogue ce jour-là, n'ont PAS de
// mapping : leur symbole Twelve Data n'a pas été audité. Sans mapping, le
// fournisseur Twelve Data renvoie « Cours non disponible » (le fournisseur
// par défaut, Yahoo Finance, n'utilise pas ce fichier).

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
  "LU1681043599": { // CW8 — Amundi MSCI World Swap UCITS ETF EUR Acc
    tdSymbol: "CW8",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },
  "IE00B4L5Y983": { // IWDA — iShares Core MSCI World UCITS ETF USD (Acc)
    // (28/09/2026 : « ex-EWLD.PA » retiré — EWLD est un autre fonds, Amundi)
    tdSymbol: "IWDA",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Amsterdam",
  },
  "IE00BK5BQT80": { // VWCE — Vanguard FTSE All-World UCITS ETF (USD) Accumulating
    tdSymbol: "VWCE",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Amsterdam",
  },

  // ── S&P 500 ──────────────────────────────────────────────────────────
  "LU1681048804": { // 500 — Amundi S&P 500 Swap UCITS ETF EUR Acc (non éligible PEA)
    // (28/09/2026 : « ex-SP5 » retiré — non confirmé par la table de vérité)
    tdSymbol: "500",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },
  "IE00B5BMR087": { // CSPX — iShares Core S&P 500 UCITS ETF USD (Acc)
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
  "IE00B3XXRP09": { // VUSA — Vanguard S&P 500 UCITS ETF (USD) Distributing
    tdSymbol: "VUSA",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Amsterdam",
  },

  // ── Nasdaq-100 ───────────────────────────────────────────────────────
  "LU1681038243": { // ANX — Amundi Nasdaq-100 Swap UCITS ETF EUR Acc (non éligible PEA)
    tdSymbol: "ANX",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },
  "US46090E1038": { // QQQ — Invesco QQQ Trust, Series 1
    tdSymbol: "QQQ",
    tdExchange: "NASDAQ",
    currency: "USD",
    displayExchange: "NASDAQ",
  },

  // ── Émergents ────────────────────────────────────────────────────────
  "LU1681045370": { // AEEM — Amundi MSCI Emerging Markets Swap UCITS ETF EUR Acc (non éligible PEA)
    // (28/09/2026 : « ex-PAEEM » retiré — faux, PAEEM est un autre fonds, FR0013412020)
    tdSymbol: "AEEM",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },

  // ── Europe ───────────────────────────────────────────────────────────
  "FR0013412038": { // PCEU — Amundi PEA MSCI Europe UCITS ETF Acc
    // (28/09/2026 : clé LU1681049328 et « STOXX Europe 600 » faux — table de vérité)
    tdSymbol: "PCEU",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },

  // ── Small Cap ────────────────────────────────────────────────────────
  "LU1681038672": { // RS2K — Amundi Russell 2000 UCITS ETF EUR Acc
    // (28/09/2026 : clé LU1681038755 introuvable et « MSCI Russell 2000 » faux — table de vérité)
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
  "LU1681038912": { // JPNK — Amundi JPX-Nikkei 400 UCITS ETF EUR Acc (non éligible PEA)
    // (28/09/2026 : « Japan TOPIX » faux, l'indice est le JPX-Nikkei 400 — table de vérité)
    tdSymbol: "JPNK",
    tdExchange: "Euronext",
    currency: "EUR",
    displayExchange: "Euronext Paris",
  },

  // ── Obligations ──────────────────────────────────────────────────────
  "FR0010754200": { // C3M — Amundi Euro Government Bond 0-6 M UCITS ETF Acc (quasi monétaire)
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
