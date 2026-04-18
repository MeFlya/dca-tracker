import { NextRequest, NextResponse } from "next/server";
import { getMarketDataProvider, isDemo } from "@/lib/market-data";
import { ETF_LIST } from "@/lib/etf-config";

// GET /api/market-data?symbols=CW8.PA,VWCE.DE
// GET /api/market-data  → returns all configured ETFs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolsParam = searchParams.get("symbols");

  const symbols = symbolsParam
    ? symbolsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : ETF_LIST.map((e) => e.symbol);

  if (symbols.length === 0) {
    return NextResponse.json(
      { error: "Aucun symbole fourni" },
      { status: 400 }
    );
  }

  if (symbols.length > 10) {
    return NextResponse.json(
      { error: "Maximum 10 symboles par requête" },
      { status: 400 }
    );
  }

  try {
    const provider = getMarketDataProvider();
    const batch = await provider.getQuotes(symbols);

    return NextResponse.json({
      ...batch,
      provider: provider.name,
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
