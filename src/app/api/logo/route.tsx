// Static brand logo (512×512 PNG) — referenced by the Organization JSON-LD
// in layout.tsx so Google can use it in search results and the Knowledge Panel.
//
// Requirements (Google structured data):
// - Format: PNG (not SVG)
// - Square or near-square
// - ≥ 112×112 px (we use 512 for high-res device support)
// - Crawlable, stable URL

import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "420px",
            height: "420px",
            background: "#1d4ed8",
            borderRadius: "96px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="320"
            height="320"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 21 Q9 21 13 15 Q17 9 22 6.5"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="22" cy="6.5" r="2.8" fill="white" />
          </svg>
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );

  // Long-lived cache — the logo is stable.
  response.headers.set(
    "Cache-Control",
    "public, max-age=86400, s-maxage=604800, immutable"
  );
  return response;
}
