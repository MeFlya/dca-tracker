import {
  IMarketDataProvider,
  AssetQuote,
  MarketDataResult,
  BatchMarketDataResult,
} from "./types";

// Realistic-looking demo quotes for display when no API key is configured.
// Values are illustrative only — never present these as real market prices.
// All prices and changes are approximations for UI demonstration.
//
// 28/09/2026 : clés réalignées sur les symboles du catalogue (etf-config.ts).
// Le mock était resté sur des symboles retirés (EWLD.PA, SP5.PA, OBLI.PA,
// LYYA.PA, SMAE.PA, IUSN.DE) : IWDA, 500, AEEM, JPNK et C3M tombaient sur
// « Cours non disponible » en mode démo. Noms alignés sur la table de vérité
// ETF ; WPEA, DCAM, PAEEM et PSP5 ajoutés. « PAEEM.PA » portait le nom de
// l'AEEM : c'est un autre fonds (éligible PEA), il a maintenant le sien.
const MOCK_QUOTES: Record<string, AssetQuote> = {
  // ── MSCI World ──────────────────────────────────────────────────────────────
  "CW8.PA": {
    symbol: "CW8.PA",
    name: "Amundi MSCI World Swap UCITS ETF EUR Acc",
    price: 438.72,
    change: 2.14,
    changePercent: 0.49,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "WPEA.PA": {
    symbol: "WPEA.PA",
    name: "iShares MSCI World Swap PEA UCITS ETF EUR (Acc)",
    price: 6.95,
    change: 0.03,
    changePercent: 0.43,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "DCAM.PA": {
    symbol: "DCAM.PA",
    name: "Amundi PEA Monde (MSCI World) UCITS ETF Acc",
    price: 6.12,
    change: 0.03,
    changePercent: 0.49,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "IWDA.AS": {
    symbol: "IWDA.AS",
    name: "iShares Core MSCI World UCITS ETF USD (Acc)",
    price: 98.40,
    change: 0.45,
    changePercent: 0.46,
    currency: "EUR",
    exchange: "Euronext Amsterdam",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── FTSE All-World ──────────────────────────────────────────────────────────
  "VWCE.DE": {
    symbol: "VWCE.DE",
    name: "Vanguard FTSE All-World UCITS ETF (USD) Accumulating",
    price: 123.86,
    change: 0.54,
    changePercent: 0.44,
    currency: "EUR",
    exchange: "Xetra",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── S&P 500 ─────────────────────────────────────────────────────────────────
  "500.PA": {
    symbol: "500.PA",
    name: "Amundi S&P 500 Swap UCITS ETF EUR Acc",
    price: 27.18,
    change: 0.23,
    changePercent: 0.86,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "PSP5.PA": {
    symbol: "PSP5.PA",
    name: "Amundi PEA S&P 500 UCITS ETF Acc",
    price: 48.30,
    change: 0.41,
    changePercent: 0.86,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "CSPX.L": {
    symbol: "CSPX.L",
    name: "iShares Core S&P 500 UCITS ETF USD (Acc)",
    price: 547.30,
    change: -4.12,
    changePercent: -0.75,
    currency: "USD",
    exchange: "London Stock Exchange",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  SPY: {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    price: 541.23,
    change: -3.17,
    changePercent: -0.58,
    currency: "USD",
    exchange: "NYSE Arca",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "VUSA.AS": {
    symbol: "VUSA.AS",
    name: "Vanguard S&P 500 UCITS ETF (USD) Distributing",
    price: 103.68,
    change: 0.81,
    changePercent: 0.79,
    currency: "EUR",
    exchange: "Euronext Amsterdam",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Nasdaq-100 ──────────────────────────────────────────────────────────────
  "ANX.PA": {
    symbol: "ANX.PA",
    name: "Amundi Nasdaq-100 Swap UCITS ETF EUR Acc",
    price: 455.64,
    change: 3.87,
    changePercent: 0.86,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  QQQ: {
    symbol: "QQQ",
    name: "Invesco QQQ Trust, Series 1",
    price: 462.87,
    change: 1.93,
    changePercent: 0.42,
    currency: "USD",
    exchange: "NASDAQ",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Emerging Markets ────────────────────────────────────────────────────────
  "PUST.PA": {
    symbol: "PUST.PA",
    name: "Amundi PEA Nasdaq-100 UCITS ETF Acc",
    price: 91.2,
    change: 0.64,
    changePercent: 0.71,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "PAEEM.PA": {
    symbol: "PAEEM.PA",
    name: "Amundi PEA Emergent (MSCI Emerging) ESG Transition UCITS ETF Acc",
    price: 8.42,
    change: -0.06,
    changePercent: -0.71,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "AEEM.PA": {
    symbol: "AEEM.PA",
    name: "Amundi MSCI Emerging Markets Swap UCITS ETF EUR Acc",
    price: 5.38,
    change: -0.04,
    changePercent: -0.74,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Europe ──────────────────────────────────────────────────────────────────
  "PCEU.PA": {
    symbol: "PCEU.PA",
    name: "Amundi PEA MSCI Europe UCITS ETF Acc",
    price: 38.74,
    change: 0.31,
    changePercent: 0.81,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Small Cap ───────────────────────────────────────────────────────────────
  "RS2K.PA": {
    symbol: "RS2K.PA",
    name: "Amundi Russell 2000 UCITS ETF EUR Acc",
    price: 18.64,
    change: 0.28,
    changePercent: 1.53,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Japan ───────────────────────────────────────────────────────────────────
  "JPNK.PA": {
    symbol: "JPNK.PA",
    name: "Amundi JPX-Nikkei 400 UCITS ETF EUR Acc",
    price: 45.32,
    change: -0.54,
    changePercent: -1.18,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Quasi-monétaire ─────────────────────────────────────────────────────────
  "C3M.PA": {
    symbol: "C3M.PA",
    name: "Amundi Euro Government Bond 0-6 M UCITS ETF Acc",
    price: 89.24,
    change: 0.01,
    changePercent: 0.01,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
};

export class MockProvider implements IMarketDataProvider {
  readonly name = "Mock (Demo)";

  async getQuote(symbol: string): Promise<MarketDataResult> {
    const quote = MOCK_QUOTES[symbol] ?? null;
    const error = quote ? null : `Cours non disponible en mode démo`;
    return { quote, error, fromCache: false };
  }

  async getQuotes(symbols: string[]): Promise<BatchMarketDataResult> {
    const results: BatchMarketDataResult["results"] = {};
    for (const symbol of symbols) {
      results[symbol] = await this.getQuote(symbol);
    }
    return { results, fetchedAt: new Date().toISOString() };
  }
}
