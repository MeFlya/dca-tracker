// Dynamic favicon — generated server-side at build time via next/og.
// Reproduces the LogoMark visual (blue square + upward trend curve + dot)
// so the favicon stays in sync with the in-page logo.
//
// Auto-served by Next.js at /icon (and exposed as <link rel="icon"> in
// the document head). Replaces the missing /favicon.ico that was logging
// a 404 on every page load (cf Lighthouse Best Practices audit).

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1d4ed8",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Upward trend curve (white) — approximated with a rotated div */}
        <svg
          width="26"
          height="26"
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
    ),
    { ...size }
  );
}
