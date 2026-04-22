// Shared template for /investir-{amount}-euros-mois-etf OG images.
// Used by each route's opengraph-image.tsx — provides a consistent visual
// that differentiates only by the amount shown.
//
// Note: runtime / size / contentType must be declared directly in each
// opengraph-image.tsx file (Next.js static analyzer doesn't follow
// re-exports). This helper only provides the rendering function.

import { ImageResponse } from "next/og";

interface MoneyPageOgInput {
  /** Monthly investment amount in euros (e.g. 300) */
  monthlyAmount: number;
  /** Final value after 20 years at 7%/year (pre-computed, for the headline) */
  projection20Years: string;
}

export async function renderMoneyPageOg({
  monthlyAmount,
  projection20Years,
}: MoneyPageOgInput) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          background:
            "linear-gradient(135deg, #1e40af 0%, #1d4ed8 55%, #2563eb 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header — logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "11px",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            ↗
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "22px", fontWeight: 700 }}>DCA</span>
            <span style={{ fontSize: "22px", fontWeight: 400, opacity: 0.7 }}>
              Tracker
            </span>
          </div>
        </div>

        {/* Center — main pitch */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: 500,
              opacity: 0.75,
              lineHeight: 1,
            }}
          >
            Investir
          </div>
          <div
            style={{
              fontSize: "140px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              display: "flex",
              alignItems: "baseline",
              gap: "14px",
            }}
          >
            {monthlyAmount.toLocaleString("fr-FR")}
            <span style={{ fontSize: "56px", fontWeight: 500, opacity: 0.8 }}>
              €/mois
            </span>
          </div>
          <div
            style={{
              fontSize: "38px",
              fontWeight: 500,
              lineHeight: 1.2,
              opacity: 0.85,
              maxWidth: "1000px",
              marginTop: "12px",
            }}
          >
            En ETF pendant 20 ans ={" "}
            <span
              style={{
                fontWeight: 700,
                color: "#86efac",
              }}
            >
              {projection20Years}
            </span>
          </div>
        </div>

        {/* Footer — source + URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "20px",
            opacity: 0.7,
            fontWeight: 500,
          }}
        >
          <span>Simulation DCA · intérêts composés · hypothèses transparentes</span>
          <span>dcatracker.fr</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
