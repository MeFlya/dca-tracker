// Normalized asset quote — provider-agnostic shape
export interface AssetQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;        // absolute daily change
  changePercent: number; // percent daily change
  currency: string;
  exchange: string;
  lastUpdated: string;   // ISO 8601
  isDelayed: boolean;    // true if data is not real-time
}

export interface MarketDataResult {
  quote: AssetQuote | null;
  error: string | null;
  fromCache: boolean;
}

export interface BatchMarketDataResult {
  results: Record<string, MarketDataResult>;
  fetchedAt: string; // ISO 8601
}

// Provider contract — swap implementations without touching callers
export interface IMarketDataProvider {
  name: string;
  getQuote(symbol: string): Promise<MarketDataResult>;
  getQuotes(symbols: string[]): Promise<BatchMarketDataResult>;
}
