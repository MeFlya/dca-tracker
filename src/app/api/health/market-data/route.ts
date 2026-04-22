// Health check endpoint for the market data provider.
//
// GET /api/health/market-data
//
// Pour vérifier manuellement (ou via un cron de monitoring externe type
// UptimeRobot, BetterUptime…) que le provider actuel répond bien et
// retourne des données fraîches.
//
// Réponse :
//   200 OK  : provider OK, cours fetché, données fraîches (< 7 jours)
//   503     : provider en erreur OU données obsolètes (Yahoo bug, ETF
//             non tradé depuis longtemps, marché fermé prolongé, etc.)
//
// Endpoint testé : CW8 (LU1681043599) — l'ETF de référence du catalogue,
// toujours liquide, devrait être tradé chaque jour ouvré.

import { NextResponse } from "next/server";
import { getMarketDataProvider } from "@/lib/market-data";

export const dynamic = "force-dynamic"; // jamais de cache CDN sur un health check

const REFERENCE_SYMBOL = "CW8.PA"; // CW8 — Amundi MSCI World, ETF de référence
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

interface HealthResponse {
  status: "ok" | "degraded" | "down";
  provider: string;
  reference_symbol: string;
  fetched: boolean;
  stale: boolean;
  price?: number;
  currency?: string;
  last_updated?: string;
  age_hours?: number;
  error?: string;
  checked_at: string;
}

export async function GET() {
  const provider = getMarketDataProvider();
  const checkedAt = new Date().toISOString();

  let result;
  try {
    result = await provider.getQuote(REFERENCE_SYMBOL);
  } catch (err) {
    const body: HealthResponse = {
      status: "down",
      provider: provider.name,
      reference_symbol: REFERENCE_SYMBOL,
      fetched: false,
      stale: false,
      error: err instanceof Error ? err.message : String(err),
      checked_at: checkedAt,
    };
    return NextResponse.json(body, { status: 503 });
  }

  if (!result.quote) {
    const body: HealthResponse = {
      status: "down",
      provider: provider.name,
      reference_symbol: REFERENCE_SYMBOL,
      fetched: false,
      stale: false,
      error: result.error ?? "Aucune cotation retournée",
      checked_at: checkedAt,
    };
    return NextResponse.json(body, { status: 503 });
  }

  const ageMs = Date.now() - new Date(result.quote.lastUpdated).getTime();
  const ageHours = Math.round((ageMs / (1000 * 60 * 60)) * 10) / 10;
  const stale = ageMs > STALE_THRESHOLD_MS;

  const body: HealthResponse = {
    status: stale ? "degraded" : "ok",
    provider: provider.name,
    reference_symbol: REFERENCE_SYMBOL,
    fetched: true,
    stale,
    price: result.quote.price,
    currency: result.quote.currency,
    last_updated: result.quote.lastUpdated,
    age_hours: ageHours,
    checked_at: checkedAt,
  };

  // 503 si données obsolètes (probablement marché fermé > 1 semaine,
  // OU bug provider, OU ETF retiré). Permet à un monitoring de tirer la
  // sonnette d'alarme automatiquement.
  return NextResponse.json(body, { status: stale ? 503 : 200 });
}
