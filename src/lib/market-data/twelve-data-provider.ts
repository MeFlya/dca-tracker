// Twelve Data market data provider.
//
// Free tier: 800 requests/day, 8 requests/minute.
// Paid plans: 55+ requests/minute.
//
// We always pre-resolve our internal symbol (e.g. "CW8.PA") to the Twelve
// Data symbol via ISIN_TO_TWELVE_DATA, then call /quote which returns
// price + currency + percent change + datetime in a single call (more
// efficient than /price + /quote separately).
//
// Errors are deliberate non-fatal: the API call returns null + error
// message in MarketDataResult. UI code should hide the price block in
// that case (no "mode démo" fallback unless the provider is explicitly
// switched back to mock).

import {
  IMarketDataProvider,
  AssetQuote,
  MarketDataResult,
  BatchMarketDataResult,
} from "./types";
import { quoteCache } from "./cache";
import { getETFBySymbol } from "@/lib/etf-config";
import { getTwelveDataMapping, TwelveDataMapping } from "./symbol-map";

const BASE_URL = "https://api.twelvedata.com";

// ── Rate limiter ──────────────────────────────────────────────────────
// Twelve Data free tier = 8 req/min. We enforce 8s between requests
// (concurrency 1) to stay safe. For paid plans, set TWELVE_DATA_INTERVAL_MS
// to a lower value (e.g. 1100 for 55 req/min plans).
const INTERVAL_MS = parseInt(
  process.env.TWELVE_DATA_INTERVAL_MS ?? "8000",
  10
);

/**
 * Single-concurrency throttled queue. Calls run sequentially with at
 * least INTERVAL_MS between starts. No external deps.
 */
class Throttle {
  private lastStart = 0;
  private chain: Promise<unknown> = Promise.resolve();

  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const run = async (): Promise<T> => {
      const now = Date.now();
      const wait = Math.max(0, this.lastStart + INTERVAL_MS - now);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      this.lastStart = Date.now();
      return fn();
    };
    // Chain so concurrent callers are serialized
    const next = this.chain.then(run, run) as Promise<T>;
    this.chain = next.catch(() => undefined);
    return next;
  }
}

const throttle = new Throttle();

// ── Twelve Data response shape ────────────────────────────────────────
interface TwelveDataQuoteResponse {
  symbol?: string;
  name?: string;
  exchange?: string;
  currency?: string;
  datetime?: string;       // "2026-04-22 17:30:00"
  timestamp?: number;      // Unix seconds
  close?: string;          // last price as string
  change?: string;         // absolute daily change
  percent_change?: string; // percent (no % sign)
  is_market_open?: boolean;

  // Error envelope (when status is "error")
  status?: "ok" | "error";
  code?: number;
  message?: string;
}

export class TwelveDataProvider implements IMarketDataProvider {
  readonly name = "TwelveData";
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      // Should never happen — factory checks before instantiating, but
      // guard anyway in case of misuse.
      throw new Error("TwelveDataProvider requires a non-empty apiKey");
    }
    this.apiKey = apiKey;
  }

  async getQuote(symbol: string): Promise<MarketDataResult> {
    // Resolve our internal symbol → ETF → ISIN → Twelve Data mapping
    const etf = getETFBySymbol(symbol);
    if (!etf) {
      return {
        quote: null,
        error: `ETF inconnu dans le catalogue : ${symbol}`,
        fromCache: false,
      };
    }
    if (!etf.isin) {
      return {
        quote: null,
        error: `ETF sans ISIN dans le catalogue : ${symbol}`,
        fromCache: false,
      };
    }
    const mapping = getTwelveDataMapping(etf.isin);
    if (!mapping) {
      // Not covered by Twelve Data — UI should hide the price section
      return {
        quote: null,
        error: `Cours non disponible pour cet ETF`,
        fromCache: false,
      };
    }

    // Cache key includes provider prefix so we don't collide with AlphaVantage
    const cacheKey = `td:${etf.isin}`;
    const cached = quoteCache.get(cacheKey) as AssetQuote | null;
    if (cached) {
      return { quote: cached, error: null, fromCache: true };
    }

    // Throttled fetch — respects the rate limit even under burst load
    return throttle.enqueue(() => this.fetchAndCache(symbol, etf.name, mapping, cacheKey));
  }

  private async fetchAndCache(
    internalSymbol: string,
    name: string,
    mapping: TwelveDataMapping,
    cacheKey: string
  ): Promise<MarketDataResult> {
    const url = new URL(`${BASE_URL}/quote`);
    url.searchParams.set("symbol", `${mapping.tdSymbol}:${mapping.tdExchange}`);
    url.searchParams.set("apikey", this.apiKey);
    // ⚠️ Sans ce paramètre, l'API renvoie `datetime` dans le fuseau de la PLACE
    // de cotation, et le code plus bas l'interprétait comme de l'UTC en lui
    // ajoutant un « Z » — l'horodatage était donc faux de l'offset de la place
    // (2 h pour Amsterdam en été). Ce n'est pas cosmétique : `lastUpdated`
    // s'affiche au visiteur (« Mis à jour : … ») ET sert à calculer l'âge de la
    // donnée dans /api/health/market-data, donc à décider si elle est périmée.
    // On demande explicitement de l'UTC : l'hypothèse devient vraie au lieu
    // d'être rattrapée.
    url.searchParams.set("timezone", "UTC");

    try {
      const res = await fetch(url.toString(), { cache: "no-store" });

      // Rate limited — return stale cache if any, never fall back to mock
      if (res.status === 429) {
        const stale = quoteCache.get(cacheKey) as AssetQuote | null;
        console.warn(
          `[twelve-data] Rate limited (429) for ${internalSymbol} — serving ${stale ? "stale cache" : "no data"}`
        );
        return {
          quote: stale,
          error: stale ? null : "Rate limit Twelve Data — réessayez dans une minute",
          fromCache: !!stale,
        };
      }

      if (!res.ok) {
        return this.handleError(internalSymbol, cacheKey, `HTTP ${res.status}`);
      }

      const json = (await res.json()) as TwelveDataQuoteResponse;

      if (json.status === "error" || json.code) {
        return this.handleError(
          internalSymbol,
          cacheKey,
          json.message ?? `Twelve Data code ${json.code}`
        );
      }

      if (!json.close) {
        return this.handleError(internalSymbol, cacheKey, "Réponse Twelve Data incomplète");
      }

      const price = parseFloat(json.close);
      const change = json.change ? parseFloat(json.change) : 0;
      const changePercent = json.percent_change ? parseFloat(json.percent_change) : 0;

      // `timestamp` est un epoch : il ne dépend d'aucun fuseau, on le préfère
      // toujours. `datetime` n'est utilisable QUE parce que la requête impose
      // timezone=UTC (voir plus haut) — sans ça, lui ajouter un « Z » serait
      // une invention.
      let lastUpdated: string;
      if (json.timestamp) {
        lastUpdated = new Date(json.timestamp * 1000).toISOString();
      } else if (json.datetime) {
        lastUpdated = new Date(json.datetime.replace(" ", "T") + "Z").toISOString();
      } else {
        // Dernier recours : l'heure de la requête, pas celle de la cotation.
        // Fait paraître la donnée plus fraîche qu'elle n'est — acceptable
        // seulement parce que les deux champs précédents manquent rarement.
        lastUpdated = new Date().toISOString();
      }

      const quote: AssetQuote = {
        symbol: json.symbol ?? mapping.tdSymbol,
        name: json.name ?? name,
        price,
        change,
        changePercent,
        currency: json.currency ?? mapping.currency,
        exchange: mapping.displayExchange,
        lastUpdated,
        isDelayed: true, // Twelve Data free tier is delayed ~15 min
      };

      quoteCache.set(cacheKey, quote);
      return { quote, error: null, fromCache: false };
    } catch (err) {
      return this.handleError(
        internalSymbol,
        cacheKey,
        err instanceof Error ? err.message : "Erreur réseau"
      );
    }
  }

  /** Network/parse errors — fall back to cache if available, never mock. */
  private handleError(
    internalSymbol: string,
    cacheKey: string,
    message: string
  ): MarketDataResult {
    const stale = quoteCache.get(cacheKey) as AssetQuote | null;
    if (stale) {
      console.warn(
        `[twelve-data] ${message} for ${internalSymbol} — serving stale cache`
      );
      return { quote: stale, error: null, fromCache: true };
    }
    console.error(`[twelve-data] ${message} for ${internalSymbol} — no cache available`);
    return { quote: null, error: message, fromCache: false };
  }

  async getQuotes(symbols: string[]): Promise<BatchMarketDataResult> {
    // Each call is throttled internally; Promise.all parallelism is fine
    // because the throttle serializes them. Caller sees results in input order.
    const entries = await Promise.all(
      symbols.map(async (s) => [s, await this.getQuote(s)] as const)
    );
    const results: BatchMarketDataResult["results"] = {};
    for (const [s, r] of entries) results[s] = r;
    return { results, fetchedAt: new Date().toISOString() };
  }
}
