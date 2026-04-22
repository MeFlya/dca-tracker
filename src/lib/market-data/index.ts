import { IMarketDataProvider } from "./types";
import { AlphaVantageProvider } from "./alpha-vantage-provider";
import { YahooFinanceProvider } from "./yahoo-finance-provider";
import { MockProvider } from "./mock-provider";

export * from "./types";

// Factory — reads environment variables and returns the right provider.
// Add new providers here without changing any caller code.
//
// Default = "yahoo_finance" : gratuit, sans clé, couvre tous les ETF du
// catalogue. Twelve Data nécessite un plan payant pour les bourses EU
// (cf chore commit "keep twelve_data provider as inactive fallback").
function createProvider(): IMarketDataProvider {
  const providerName = process.env.MARKET_DATA_PROVIDER ?? "yahoo_finance";
  const avKey = process.env.ALPHA_VANTAGE_API_KEY ?? "";

  switch (providerName) {
    case "yahoo_finance":
      return new YahooFinanceProvider();

    case "alpha_vantage":
      if (!avKey) {
        console.warn(
          "[market-data] ALPHA_VANTAGE_API_KEY is not set. Falling back to mock provider."
        );
        return new MockProvider();
      }
      return new AlphaVantageProvider(avKey);

    case "mock":
    default:
      return new MockProvider();
  }
}

// Singleton for the lifetime of the serverless function instance
let _provider: IMarketDataProvider | null = null;

export function getMarketDataProvider(): IMarketDataProvider {
  if (!_provider) {
    _provider = createProvider();
  }
  return _provider;
}

/**
 * True when no real provider is configured (= mock data is being served).
 * UI components use this to show a "mode démo" banner. Returns false as
 * soon as a real provider has been properly configured (key if needed).
 */
export function isDemo(): boolean {
  const providerName = process.env.MARKET_DATA_PROVIDER ?? "yahoo_finance";
  const avKey = process.env.ALPHA_VANTAGE_API_KEY ?? "";

  if (providerName === "yahoo_finance") return false;
  if (providerName === "alpha_vantage" && avKey) return false;
  return true;
}
