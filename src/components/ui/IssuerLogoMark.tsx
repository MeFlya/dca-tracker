// Logo de l'émetteur d'un ETF (Amundi, iShares, Vanguard, Invesco, SPDR).
//
// Même approche que BrokerLogoMark : logos officiels (marques de leurs
// détenteurs) en usage nominatif, hébergés localement (/public/logos/issuers).
// Émetteur déduit du nom de l'ETF. Repli wordmark de marque si pas de logo.

import { cn } from "@/lib/utils";

type Issuer = { label: string; color: string; logo?: string };

const ISSUERS: Record<string, Issuer> = {
  amundi: { label: "Amundi", color: "#1d4ed8", logo: "/logos/issuers/amundi.png" },
  ishares: { label: "iShares", color: "#0f172a", logo: "/logos/issuers/ishares.png" },
  vanguard: { label: "Vanguard", color: "#96151d", logo: "/logos/issuers/vanguard.png" },
  invesco: { label: "Invesco", color: "#003087", logo: "/logos/issuers/invesco.png" },
  spdr: { label: "SPDR", color: "#c8102e" }, // pas de logo HD → wordmark
};

/** Déduit l'émetteur depuis le nom de l'ETF (ex. "Amundi MSCI World..."). */
export function issuerSlugFromName(name: string): string {
  const n = (name ?? "").toLowerCase();
  if (n.includes("ishares")) return "ishares";
  if (n.includes("vanguard")) return "vanguard";
  if (n.includes("spdr")) return "spdr";
  if (n.includes("invesco")) return "invesco";
  if (n.includes("amundi") || n.includes("lyxor")) return "amundi";
  return "";
}

export function issuerLabelFromName(name: string): string {
  return ISSUERS[issuerSlugFromName(name)]?.label ?? "";
}

export function IssuerLogoMark({
  name,
  slug,
  height = 28,
  className,
}: {
  /** Nom complet de l'ETF (l'émetteur en est déduit). */
  name?: string;
  /** Ou slug d'émetteur explicite. */
  slug?: string;
  height?: number;
  className?: string;
}) {
  const key = slug ?? issuerSlugFromName(name ?? "");
  const issuer = ISSUERS[key];
  if (!issuer) return null;

  // Logo officiel dans une tuile blanche (comme BrokerLogoMark)
  if (issuer.logo) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg shrink-0 overflow-hidden bg-white border border-slate-200/80 shadow-sm",
          className,
        )}
        style={{ height, width: height }}
        title={issuer.label}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={issuer.logo}
          alt={`Logo ${issuer.label}`}
          width={height}
          height={height}
          loading="lazy"
          className="w-full h-full object-contain p-1"
        />
      </span>
    );
  }

  // Repli wordmark de marque (ex. SPDR)
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-lg shrink-0 select-none px-2", className)}
      style={{
        height,
        backgroundColor: issuer.color,
        color: "#fff",
        fontSize: Math.round(height * 0.36),
        fontWeight: 700,
      }}
      title={issuer.label}
    >
      {issuer.label}
    </span>
  );
}
