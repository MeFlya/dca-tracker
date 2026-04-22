// Yahoo Finance market data provider.
//
// Utilise la lib `yahoo-finance2` (v3+, API class-based) qui scrape
// l'API web non-officielle de Yahoo Finance. Gratuit, sans clé, couverture
// excellente (Euronext, XETRA, LSE, NYSE, Nasdaq) — mais fragile en
// théorie : Yahoo peut changer son endpoint à tout moment. Garde-fous :
//   - Cache 60 min pour limiter l'exposition aux pannes
//   - Sur erreur, fallback systématique sur le cache (même expiré)
//   - Endpoint /api/health/market-data pour pinger manuellement
//
// Référence : https://github.com/gadicc/node-yahoo-finance2

import YahooFinance from "yahoo-finance2";
import {
  IMarketDataProvider,
  AssetQuote,
  MarketDataResult,
  BatchMarketDataResult,
} from "./types";
import { quoteCache } from "./cache";
import { getETFBySymbol } from "@/lib/etf-config";

// Single instance — la lib est stateful sur ses notices et son cache interne.
// Suppress 'yahooSurvey' : Yahoo affiche un nag screen qui pollue les logs
// au premier appel. Logué une seule fois au démarrage du process pour que
// si on voit un autre type de notice un jour, on sache que la suppression
// n'a pas été contournée.
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
console.info(
  "[yahoo-finance] Initialized with suppressNotices=['yahooSurvey'] " +
    "(survey nag suppressed; other notices still surface)."
);

// Sécurité : nombre d'erreurs consécutives au-delà duquel on considère
// que Yahoo est down (changement d'endpoint, blocage IP, etc.). Au-delà,
// on log une erreur explicite et on sert systématiquement le cache.
const SYSTEMIC_ERROR_THRESHOLD = 5;

// Subset of fields we use from yahooFinance.quote() — plus permissive than
// the lib's full Quote type, since some fields are venue-dependent.
interface YahooQuote {
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketTime?: number | Date; // unix seconds OR Date object depending on lib version
  currency?: string;
  fullExchangeName?: string;
  exchange?: string;
  longName?: string;
  shortName?: string;
  symbol?: string;
}

export class YahooFinanceProvider implements IMarketDataProvider {
  readonly name = "YahooFinance";
  private consecutiveErrors = 0;

  async getQuote(symbol: string): Promise<MarketDataResult> {
    const etf = getETFBySymbol(symbol);
    if (!etf) {
      return {
        quote: null,
        error: `ETF inconnu dans le catalogue : ${symbol}`,
        fromCache: false,
      };
    }

    // Cache key on ISIN if available (more stable than ticker which can rebrand)
    const cacheKey = `yf:${etf.isin ?? symbol}`;
    const cached = quoteCache.get(cacheKey) as AssetQuote | null;
    if (cached) {
      return { quote: cached, error: null, fromCache: true };
    }

    return this.fetchAndCache(symbol, etf.name, cacheKey);
  }

  private async fetchAndCache(
    internalSymbol: string,
    fallbackName: string,
    cacheKey: string
  ): Promise<MarketDataResult> {
    try {
      // The yahoo-finance2 lib handles retries + error normalization internally.
      // We pass our internal symbol directly (already in Yahoo format like CW8.PA).
      const raw = (await yahooFinance.quote(internalSymbol)) as unknown as
        | YahooQuote
        | YahooQuote[];

      // .quote() returns either an object or an array depending on input
      const q: YahooQuote | undefined = Array.isArray(raw) ? raw[0] : raw;

      if (!q || typeof q.regularMarketPrice !== "number") {
        return this.handleError(
          internalSymbol,
          cacheKey,
          "Réponse Yahoo Finance incomplète (pas de prix)"
        );
      }

      // regularMarketTime peut être un Date OU un number (Unix seconds)
      // selon la version de la lib. Normalise en ISO 8601.
      let lastUpdated: string;
      const t = q.regularMarketTime;
      if (t instanceof Date) {
        lastUpdated = t.toISOString();
      } else if (typeof t === "number") {
        // Yahoo renvoie des SECONDES Unix → multiplier par 1000
        lastUpdated = new Date(t * 1000).toISOString();
      } else {
        lastUpdated = new Date().toISOString();
      }

      // Note : on garde fullExchangeName UNIQUEMENT en interne pour le debug.
      // L'UI affiche juste "Mis à jour il y a Xh" — pas le nom de la bourse,
      // qui peut être verbeux côté Yahoo ("NasdaqGS" vs "Nasdaq").
      const quote: AssetQuote = {
        symbol: q.symbol ?? internalSymbol,
        name: q.longName ?? q.shortName ?? fallbackName,
        price: q.regularMarketPrice,
        change: q.regularMarketChange ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
        currency: q.currency ?? "EUR",
        exchange: q.fullExchangeName ?? q.exchange ?? "—",
        lastUpdated,
        isDelayed: true, // Yahoo free / unofficial = delayed
      };

      quoteCache.set(cacheKey, quote);
      this.consecutiveErrors = 0; // success → reset systemic error counter
      return { quote, error: null, fromCache: false };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      return this.handleError(internalSymbol, cacheKey, message);
    }
  }

  private handleError(
    internalSymbol: string,
    cacheKey: string,
    message: string
  ): MarketDataResult {
    this.consecutiveErrors += 1;

    // Au-delà du seuil, log une erreur explicite (visible dans Vercel logs).
    if (this.consecutiveErrors >= SYSTEMIC_ERROR_THRESHOLD) {
      console.error(
        `[yahoo-finance] SYSTEMIC FAILURE detected (${this.consecutiveErrors} ` +
          `consecutive errors). Yahoo endpoint may have changed. ` +
          `Last error: ${message}. Serving stale cache only.`
      );
    }

    const stale = quoteCache.get(cacheKey) as AssetQuote | null;
    if (stale) {
      console.warn(
        `[yahoo-finance] ${message} for ${internalSymbol} — serving stale cache`
      );
      return { quote: stale, error: null, fromCache: true };
    }

    console.warn(
      `[yahoo-finance] ${message} for ${internalSymbol} — no cache available`
    );
    return { quote: null, error: message, fromCache: false };
  }

  async getQuotes(symbols: string[]): Promise<BatchMarketDataResult> {
    // yahoo-finance2 supporte le batch en passant un array, mais l'API
    // est moins stable et certaines erreurs partielles sont silencieuses.
    // On préfère N appels en parallèle — la lib gère ses propres retries et
    // ne bloque pas sur le rate limit Yahoo (informel, pas de quota strict).
    const entries = await Promise.all(
      symbols.map(async (s) => [s, await this.getQuote(s)] as const)
    );
    const results: BatchMarketDataResult["results"] = {};
    for (const [s, r] of entries) results[s] = r;
    return { results, fetchedAt: new Date().toISOString() };
  }
}
