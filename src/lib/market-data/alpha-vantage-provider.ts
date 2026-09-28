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
//
// 28/09/2026 : clés réalignées sur les symboles du catalogue (etf-config.ts)
// et noms alignés sur la table de vérité ETF. L'ancienne table portait des
// symboles retirés (EWLD.PA, SP5.PA, OBLI.PA, LYYA.PA, SMAE.PA, IUSN.DE) et
// des noms faux : « STOXX Europe 600 » pour PCEU (MSCI Europe), « MSCI
// Russell 2000 » pour RS2K (Russell 2000), « Japan TOPIX » pour JPNK
// (JPX-Nikkei 400), et le nom de l'AEEM sous PAEEM.PA (deux fonds distincts).
const SYMBOL_NAMES: Record<string, string> = {
  // MSCI World
  "CW8.PA": "Amundi MSCI World Swap UCITS ETF EUR Acc",
  "WPEA.PA": "iShares MSCI World Swap PEA UCITS ETF EUR (Acc)",
  "DCAM.PA": "Amundi PEA Monde (MSCI World) UCITS ETF Acc",
  "IWDA.AS": "iShares Core MSCI World UCITS ETF USD (Acc)",
  // FTSE All-World
  "VWCE.DE": "Vanguard FTSE All-World UCITS ETF (USD) Accumulating",
  // S&P 500
  "500.PA": "Amundi S&P 500 Swap UCITS ETF EUR Acc",
  "PSP5.PA": "Amundi PEA S&P 500 UCITS ETF Acc",
  "CSPX.L": "iShares Core S&P 500 UCITS ETF USD (Acc)",
  SPY: "SPDR S&P 500 ETF Trust",
  "VUSA.AS": "Vanguard S&P 500 UCITS ETF (USD) Distributing",
  // Nasdaq-100
  "ANX.PA": "Amundi Nasdaq-100 Swap UCITS ETF EUR Acc",
  QQQ: "Invesco QQQ Trust, Series 1",
  // Emerging Markets
  "PUST.PA": "Amundi PEA Nasdaq-100 UCITS ETF Acc",
  "PAEEM.PA": "Amundi PEA Emergent (MSCI Emerging) ESG Transition UCITS ETF Acc",
  "AEEM.PA": "Amundi MSCI Emerging Markets Swap UCITS ETF EUR Acc",
  // Europe
  "PCEU.PA": "Amundi PEA MSCI Europe UCITS ETF Acc",
  // Small Cap
  "RS2K.PA": "Amundi Russell 2000 UCITS ETF EUR Acc",
  // Japan
  "JPNK.PA": "Amundi JPX-Nikkei 400 UCITS ETF EUR Acc",
  // Quasi-monétaire
  "C3M.PA": "Amundi Euro Government Bond 0-6 M UCITS ETF Acc",
};

const EXCHANGE_MAP: Record<string, string> = {
  ".PA": "Euronext Paris",
  ".DE": "Xetra",
  ".L": "London Stock Exchange",
  ".AS": "Euronext Amsterdam",
};

function inferExchange(symbol: string): string {
  for (const [suffix, exchange] of Object.entries(EXCHANGE_MAP)) {
    if (symbol.endsWith(suffix)) return exchange;
  }
  return "NYSE/NASDAQ";
}

function inferCurrency(symbol: string): string {
  if (symbol.endsWith(".PA") || symbol.endsWith(".DE") || symbol.endsWith(".AS")) return "EUR";
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
    for (const symbol of symbols) {
      results[symbol] = await this.getQuote(symbol);
    }

    return { results, fetchedAt: new Date().toISOString() };
  }
}
