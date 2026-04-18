import {
  IMarketDataProvider,
  AssetQuote,
  MarketDataResult,
  BatchMarketDataResult,
} from "./types";

// Realistic-looking demo quotes for display when no API key is configured.
// Values are illustrative only — never present these as real market prices.
const MOCK_QUOTES: Record<string, AssetQuote> = {
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
};

export class MockProvider implements IMarketDataProvider {
  readonly name = "Mock (Demo)";

  async getQuote(symbol: string): Promise<MarketDataResult> {
    const quote = MOCK_QUOTES[symbol] ?? null;
    const error = quote ? null : `Symbole inconnu en mode démo : ${symbol}`;
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
