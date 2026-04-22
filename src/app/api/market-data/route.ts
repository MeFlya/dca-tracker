import { NextRequest, NextResponse } from "next/server";
import { getMarketDataProvider, isDemo } from "@/lib/market-data";
import { ETF_LIST } from "@/lib/etf-config";

// GET /api/market-data?symbols=CW8.PA,VWCE.DE
// GET /api/market-data?isin=LU1681043599
// GET /api/market-data?isin=LU1681043599,IE00B4L5Y983
// GET /api/market-data  → returns all configured ETFs

// Snake-case provider name for API consumers (third-party scripts, debugging)
const PROVIDER_SOURCE: Record<string, string> = {
  YahooFinance: "yahoo_finance",
  TwelveData: "twelve_data",
  AlphaVantage: "alpha_vantage",
  Mock: "mock",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolsParam = searchParams.get("symbols");
  const isinParam = searchParams.get("isin");

  let symbols: string[];

  if (isinParam) {
    // Resolve ISIN(s) to our internal symbols via ETF_LIST
    const requestedIsins = isinParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    symbols = requestedIsins
      .map((isin) => ETF_LIST.find((e) => e.isin === isin)?.symbol)
      .filter((s): s is string => !!s);

    if (symbols.length === 0) {
      return NextResponse.json(
        { error: `Aucun ETF trouvé pour les ISIN fournis : ${isinParam}` },
        { status: 404 }
      );
    }
  } else if (symbolsParam) {
    symbols = symbolsParam.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    symbols = ETF_LIST.map((e) => e.symbol);
  }

  if (symbols.length === 0) {
    return NextResponse.json(
      { error: "Aucun symbole fourni" },
      { status: 400 }
    );
  }

  if (symbols.length > 16) {
    return NextResponse.json(
      { error: "Maximum 16 symboles par requête" },
      { status: 400 }
    );
  }

  try {
    const provider = getMarketDataProvider();
    const batch = await provider.getQuotes(symbols);

    return NextResponse.json({
      ...batch,
      provider: provider.name,
      source: PROVIDER_SOURCE[provider.name] ?? provider.name.toLowerCase(),
      isDemo: isDemo(),
    });
  } catch (err) {
    console.error("[/api/market-data] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erreur interne lors de la récupération des données" },
      { status: 500 }
    );
  }
}
