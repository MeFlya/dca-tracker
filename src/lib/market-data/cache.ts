// Simple in-process TTL cache — sufficient for MVP serverless functions.
// TODO (premium): Replace with Redis/Upstash for persistent caching across instances.

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttlMs: number;

  constructor(ttlSeconds: number) {
    this.ttlMs = ttlSeconds * 1000;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.store.clear();
  }
}

// Default TTL: 60 minutes. Pour un produit DCA long-terme (horizon 20 ans),
// rafraîchir les cours chaque heure suffit largement et permet de tenir
// largement dans le free tier Twelve Data (~16 fetch/h max au lieu de
// ~192 avec l'ancien TTL de 5 min). Override via env si besoin.
const DEFAULT_TTL = parseInt(process.env.MARKET_DATA_CACHE_TTL ?? "3600", 10);
export const quoteCache = new TTLCache<unknown>(DEFAULT_TTL);
