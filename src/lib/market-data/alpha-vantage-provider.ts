import {
  IMarketDataProvider,
  AssetQuote,
  MarketDataResult,
  BatchMarketDataResult,
} from "./types";
import { quoteCache } from "./cache";

// Alpha Vantage free tier: https://www.alphavantage.co/documentation/
// 25 requests/day, 5 requests/min on free plan.
// Set ALPHA_VANTAGE_API_KEY in .env.local to activate.

interface AlphaVantageGlobalQuote {
  "Global Quote": {
    "01. symbol": string;
    "02. open": string;
    "03. high": string;
    "04. low": string;
    "05. price": string;
    "06. volume": string;
    "07. latest trading day": string;
    "08. previous close": string;
    "09. change": string;
    "10. change percent": string;
  };
}

// Static name mapping — Alpha Vantage doesn't return human-readable names on free tier
const SYMBOL_NAMES: Record<string, string> = {
  "CW8.PA": "Amundi MSCI World UCITS ETF",
  "EWLD.PA": "iShares MSCI World UCITS ETF",
  "VWCE.DE": "Vanguard FTSE All-World UCITS ETF",
  SPY: "SPDR S&P 500 ETF Trust",
  QQQ: "Invesco Nasdaq-100 ETF",
};

const EXCHANGE_MAP: Record<string, string> = {
  ".PA": "Euronext Paris",
  ".DE": "Xetra",
  ".L": "London Stock Exchange",
};

function inferExchange(symbol: string): string {
  for (const [suffix, exchange] of Object.entries(EXCHANGE_MAP)) {
    if (symbol.endsWith(suffix)) return exchange;
  }
  return "NYSE/NASDAQ";
}

function inferCurrency(symbol: string): string {
  if (symbol.endsWith(".PA") || symbol.endsWith(".DE")) return "EUR";
  if (symbol.endsWith(".L")) return "GBP";
  return "USD";
}

export class AlphaVantageProvider implements IMarketDataProvider {
  readonly name = "AlphaVantage";
  private apiKey: string;
  private baseUrl = "https://www.alphavantage.co/query";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(symbol: string): Promise<MarketDataResult> {
    const cacheKey = `av:${symbol}`;
    const cached = quoteCache.get(cacheKey) as AssetQuote | null;
    if (cached) {
      return { quote: cached, error: null, fromCache: true };
    }

    try {
      const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${this.apiKey}`;
      const res = await fetch(url, { next: { revalidate: 300 } });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = (await res.json()) as AlphaVantageGlobalQuote;
      const raw = json["Global Quote"];

      if (!raw || !raw["05. price"]) {
        throw new Error(`No data returned for symbol ${symbol}`);
      }

      const price = parseFloat(raw["05. price"]);
      const change = parseFloat(raw["09. change"]);
      const changePercent = parseFloat(
        raw["10. change percent"].replace("%", "")
      );

      const quote: AssetQuote = {
        symbol: raw["01. symbol"],
        name: SYMBOL_NAMES[symbol] ?? symbol,
        price,
        change,
        changePercent,
        currency: inferCurrency(symbol),
        exchange: inferExchange(symbol),
        lastUpdated: new Date(raw["07. latest trading day"]).toISOString(),
        isDelayed: true, // Alpha Vantage free tier is end-of-day
      };

      quoteCache.set(cacheKey, quote);
      return { quote, error: null, fromCache: false };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { quote: null, error: message, fromCache: false };
    }
  }

  async getQuotes(symbols: string[]): Promise<BatchMarketDataResult> {
    const results: BatchMarketDataResult["results"] = {};

    // Sequential to respect rate limits on free tier
    // TODO (premium): Parallelize with a paid API key
    for (const symbol of symbols) {
      results[symbol] = await this.getQuote(symbol);
    }

    return { results, fetchedAt: new Date().toISOString() };
  }
}
