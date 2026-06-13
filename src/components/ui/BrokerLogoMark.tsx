// Marque d'identification d'un courtier.
//
// Affiche le LOGO officiel du courtier (icône de marque) dans une tuile
// blanche arrondie — usage nominatif pour identifier/comparer, pratique
// standard d'un comparateur. Les logos sont la propriété de leurs détenteurs ;
// récupérés depuis les domaines officiels et hébergés localement (/public/logos).
// Si un partenariat est formalisé, remplacer par le SVG du press-kit fourni.
//
// Fallback : pour un slug sans fichier logo, on retombe sur un badge wordmark
// neutre (nom + couleur de marque), qui ne reproduit aucune typographie custom.

import { cn } from "@/lib/utils";

interface BrokerLogoMarkProps {
  slug: string;
  /** Côté de la tuile carrée du logo, en pixels (la hauteur du wordmark en fallback). */
  height?: number;
  className?: string;
}

/** Logos officiels hébergés localement (icônes de marque, fond clair). */
const LOGOS: Record<string, { src: string; alt: string }> = {
  "trade-republic": { src: "/logos/trade-republic.png", alt: "Logo Trade Republic" },
  "boursorama-bourse": { src: "/logos/boursorama-bourse.png", alt: "Logo Boursorama / BoursoBank" },
  fortuneo: { src: "/logos/fortuneo.png", alt: "Logo Fortuneo" },
};

interface BadgeStyle {
  wordmark: string;
  bg: string;
  text: string;
  letterSpacing?: string;
  fontWeight?: number;
}

const BADGES: Record<string, BadgeStyle> = {
  default: {
    wordmark: "—",
    bg: "#64748b",
    text: "#ffffff",
    fontWeight: 600,
  },
};

export function BrokerLogoMark({
  slug,
  height = 36,
  className,
}: BrokerLogoMarkProps) {
  const logo = LOGOS[slug];

  // ── Logo officiel ──────────────────────────────────────────────────────────
  if (logo) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg shrink-0 overflow-hidden bg-white border border-slate-200/80 shadow-sm",
          className,
        )}
        style={{ height, width: height }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo.src}
          alt={logo.alt}
          width={height}
          height={height}
          loading="lazy"
          className="w-full h-full object-contain p-1"
        />
      </span>
    );
  }

  // ── Fallback wordmark (slug sans logo) ───────────────────────────────────────
  const badge = BADGES[slug] ?? BADGES.default;
  const fontSize = Math.round(height * 0.38);
  const paddingX = Math.round(height * 0.32);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-lg shrink-0 select-none whitespace-nowrap",
        className,
      )}
      style={{
        height,
        backgroundColor: badge.bg,
        color: badge.text,
        fontSize,
        fontWeight: badge.fontWeight ?? 600,
        letterSpacing: badge.letterSpacing,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif',
      }}
      aria-label={badge.wordmark}
    >
      {badge.wordmark}
    </div>
  );
}
