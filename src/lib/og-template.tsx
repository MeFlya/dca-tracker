// Shared template for OG images across the site.
//
// Two variants reflect the existing visual language :
// - "light" : pale blue → white gradient, navy-on-light text (cf /a-propos)
// - "dark"  : deep blue gradient, white text + emerald accent (cf /investir-* OGs)
//
// Note (Next.js gotcha): runtime / size / contentType MUST be declared in each
// route's opengraph-image.tsx file — Next's static analyzer does NOT follow
// re-exports. This helper only provides the rendering function.

import { ImageResponse } from "next/og";

export type OgVariant = "light" | "dark";

export interface OgTemplateInput {
  variant: OgVariant;
  /** Small uppercase tag above the title (e.g. "Tarifs", "Comparatif"). */
  eyebrow?: string;
  /** Big main headline. Keep short — 2 to 6 words ideally. */
  title: string;
  /** Secondary line under the title — 1 sentence, ~5–12 words. */
  subtitle?: string;
  /** Optional accented value displayed as a "stat box" on the right. */
  accent?: { label: string; value: string };
  /** Footer left side ("dcatracker.fr" rendered on the right automatically). */
  footerLeft?: string;
}

const SIZE = { width: 1200, height: 630 };

export async function renderOgTemplate(input: OgTemplateInput) {
  const isDark = input.variant === "dark";

  const palette = isDark
    ? {
        background:
          "linear-gradient(135deg, #1e40af 0%, #1d4ed8 55%, #2563eb 100%)",
        text: "#ffffff",
        textSoft: "rgba(255,255,255,0.75)",
        textMuted: "rgba(255,255,255,0.6)",
        eyebrow: "rgba(255,255,255,0.85)",
        logoBg: "rgba(255,255,255,0.15)",
        logoText: "#ffffff",
        brandPrimary: "#ffffff",
        brandSecondary: "rgba(255,255,255,0.7)",
        accentBg: "rgba(134, 239, 172, 0.15)",
        accentBorder: "rgba(134, 239, 172, 0.5)",
        accentText: "#86efac",
      }
    : {
        background:
          "linear-gradient(135deg, #eff6ff 0%, #ffffff 60%, #dbeafe 100%)",
        text: "#111827",
        textSoft: "#374151",
        textMuted: "#6b7280",
        eyebrow: "#1d4ed8",
        logoBg: "#1d4ed8",
        logoText: "#ffffff",
        brandPrimary: "#111827",
        brandSecondary: "#6b7280",
        accentBg: "#eff6ff",
        accentBorder: "#bfdbfe",
        accentText: "#1d4ed8",
      };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          background: palette.background,
          fontFamily: "sans-serif",
          color: palette.text,
        }}
      >
        {/* Header — logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: palette.logoBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: palette.logoText,
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            ↗
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: palette.brandPrimary,
              }}
            >
              DCA
            </span>
            <span
              style={{
                fontSize: "26px",
                fontWeight: 400,
                color: palette.brandSecondary,
              }}
            >
              Tracker
            </span>
          </div>
        </div>

        {/* Center — title block */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "48px",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {input.eyebrow && (
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 600,
                  color: palette.eyebrow,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {input.eyebrow}
              </div>
            )}
            <div
              style={{
                fontSize: "84px",
                fontWeight: 700,
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
                color: palette.text,
              }}
            >
              {input.title}
            </div>
            {input.subtitle && (
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 500,
                  color: palette.textSoft,
                  lineHeight: 1.25,
                  maxWidth: "900px",
                  marginTop: "8px",
                }}
              >
                {input.subtitle}
              </div>
            )}
          </div>

          {/* Right — optional stat box */}
          {input.accent && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                padding: "28px 32px",
                borderRadius: "20px",
                background: palette.accentBg,
                border: `2px solid ${palette.accentBorder}`,
                minWidth: "260px",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: palette.eyebrow,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {input.accent.label}
              </div>
              <div
                style={{
                  fontSize: "56px",
                  fontWeight: 700,
                  color: palette.accentText,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {input.accent.value}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "20px",
            color: palette.textMuted,
            fontWeight: 500,
          }}
        >
          <span>{input.footerLeft ?? "Outil pédagogique · Hypothèses transparentes"}</span>
          <span>dcatracker.fr</span>
        </div>
      </div>
    ),
    SIZE,
  );
}
