import { ImageResponse } from "next/og";

// Next.js App Router convention: this file auto-populates og:image for the
// /a-propos route. Size, contentType, and alt below are read by Next.
export const runtime = "edge";
export const alt = "Maël, créateur de DCA Tracker — DCA depuis janvier 2025";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 60%, #dbeafe 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top — logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            ↗
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "26px", fontWeight: 700, color: "#111827" }}>
              DCA
            </span>
            <span style={{ fontSize: "26px", fontWeight: 400, color: "#6b7280" }}>
              Tracker
            </span>
          </div>
        </div>

        {/* Center — main title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#1d4ed8",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            À propos
          </div>
          <div
            style={{
              fontSize: "96px",
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            Maël
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 500,
              color: "#374151",
              lineHeight: 1.2,
              maxWidth: "900px",
            }}
          >
            Créateur de DCA Tracker
          </div>
        </div>

        {/* Bottom — meta line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "24px",
            color: "#6b7280",
            fontWeight: 500,
          }}
        >
          <span>DCA depuis janvier 2025</span>
          <span style={{ color: "#d1d5db" }}>·</span>
          <span>Lille</span>
          <span style={{ color: "#d1d5db" }}>·</span>
          <span>Indépendant</span>
        </div>
      </div>
    ),
    size,
  );
}
