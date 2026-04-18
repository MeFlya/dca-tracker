import {
  IMarketDataProvider,
  AssetQuote,
  MarketDataResult,
  BatchMarketDataResult,
} from "./types";

// Realistic-looking demo quotes for display when no API key is configured.
// Values are illustrative only — never present these as real market prices.
// All prices and changes are approximations for UI demonstration.
const MOCK_QUOTES: Record<string, AssetQuote> = {
  // ── MSCI World ────────────────────────────────────────────────────────────
  "CW8.PA": {
    symbol: "CW8.PA",
    name: "Amundi MSCI World UCITS ETF",
    price: 438.72,
    change: 2.14,
    changePercent: 0.49,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "EWLD.PA": {
    symbol: "EWLD.PA",
    name: "iShares MSCI World UCITS ETF",
    price: 12.43,
    change: -0.08,
    changePercent: -0.64,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── FTSE All-World ────────────────────────────────────────────────────────
  "VWCE.DE": {
    symbol: "VWCE.DE",
    name: "Vanguard FTSE All-World UCITS ETF",
    price: 123.86,
    change: 0.54,
    changePercent: 0.44,
    currency: "EUR",
    exchange: "Xetra",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── S&P 500 ───────────────────────────────────────────────────────────────
  "SP5.PA": {
    symbol: "SP5.PA",
    name: "Amundi S&P 500 UCITS ETF",
    price: 27.18,
    change: 0.23,
    changePercent: 0.86,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "CSPX.L": {
    symbol: "CSPX.L",
    name: "iShares Core S&P 500 UCITS ETF",
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
    name: "Vanguard S&P 500 UCITS ETF",
    price: 103.68,
    change: 0.81,
    changePercent: 0.79,
    currency: "EUR",
    exchange: "Euronext Amsterdam",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Nasdaq-100 ────────────────────────────────────────────────────────────
  "ANX.PA": {
    symbol: "ANX.PA",
    name: "Amundi Nasdaq-100 UCITS ETF",
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
    name: "Invesco Nasdaq-100 ETF",
    price: 462.87,
    change: 1.93,
    changePercent: 0.42,
    currency: "USD",
    exchange: "NASDAQ",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Emerging Markets ──────────────────────────────────────────────────────
  "PAEEM.PA": {
    symbol: "PAEEM.PA",
    name: "Amundi MSCI Emerging Markets UCITS ETF",
    price: 8.42,
    change: -0.06,
    changePercent: -0.71,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Europe ────────────────────────────────────────────────────────────────
  "PCEU.PA": {
    symbol: "PCEU.PA",
    name: "Amundi STOXX Europe 600 UCITS ETF",
    price: 38.74,
    change: 0.31,
    changePercent: 0.81,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Bonds ─────────────────────────────────────────────────────────────────
  "OBLI.PA": {
    symbol: "OBLI.PA",
    name: "Amundi Euro Government Bond UCITS ETF",
    price: 89.24,
    change: 0.12,
    changePercent: 0.13,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Small Cap ─────────────────────────────────────────────────────────────
  "RS2K.PA": {
    symbol: "RS2K.PA",
    name: "Amundi MSCI Russell 2000 UCITS ETF",
    price: 18.64,
    change: 0.28,
    changePercent: 1.53,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "SMAE.PA": {
    symbol: "SMAE.PA",
    name: "Amundi MSCI Europe Small Cap UCITS ETF",
    price: 28.42,
    change: -0.18,
    changePercent: -0.63,
    currency: "EUR",
    exchange: "Euronext Paris",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  "IUSN.DE": {
    symbol: "IUSN.DE",
    name: "iShares MSCI World Small Cap UCITS ETF",
    price: 11.24,
    change: 0.09,
    changePercent: 0.81,
    currency: "EUR",
    exchange: "Xetra",
    lastUpdated: new Date().toISOString(),
    isDelayed: true,
  },
  // ── Japan ─────────────────────────────────────────────────────────────────
  "LYYA.PA": {
    symbol: "LYYA.PA",
    name: "Amundi Japan TOPIX UCITS ETF",
    price: 45.32,
    change: -0.54,
    changePercent: -1.18,
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
