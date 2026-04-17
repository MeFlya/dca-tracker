import { IMarketDataProvider } from "./types";
import { AlphaVantageProvider } from "./alpha-vantage-provider";
import { MockProvider } from "./mock-provider";

export * from "./types";

// Factory — reads environment variables and returns the right provider.
// Add new providers here without changing any caller code.
function createProvider(): IMarketDataProvider {
  const providerName = process.env.MARKET_DATA_PROVIDER ?? "mock";
  const avKey = process.env.ALPHA_VANTAGE_API_KEY ?? "";

  switch (providerName) {
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

export function isDemo(): boolean {
  const providerName = process.env.MARKET_DATA_PROVIDER ?? "mock";
  const avKey = process.env.ALPHA_VANTAGE_API_KEY ?? "";
  return providerName === "mock" || !avKey;
}
