// Repère visuel de la zone/catégorie d'un ETF : drapeau pour les régions
// géographiques (USA, Europe, Japon), pictogramme pour les autres (Monde,
// émergents, small caps, obligations). Donne au comparateur le fini d'un
// vrai outil (façon JustETF / Curvo).

import type { ETFRegion } from "@/lib/etf-config";
import { cn } from "@/lib/utils";

const LABELS: Record<ETFRegion, string> = {
  monde: "Monde",
  usa: "USA",
  europe: "Europe",
  emergents: "Émergents",
  japon: "Japon",
  "small-cap": "Small caps",
  obligations: "Obligations",
};

const FLAGS: Partial<Record<ETFRegion, string>> = {
  usa: "/flags/us.svg",
  europe: "/flags/eu.svg",
  japon: "/flags/jp.svg",
};

export function regionLabel(region: ETFRegion): string {
  return LABELS[region] ?? region;
}

function Glyph({ region, size }: { region: ETFRegion; size: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (region) {
    case "monde":
      return (
        <svg {...common} className="text-primary-600">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
        </svg>
      );
    case "emergents":
      return (
        <svg {...common} className="text-emerald-600">
          <circle cx="12" cy="12" r="9" />
          <path d="M7 14l3-3 2 2 4-5" />
        </svg>
      );
    case "small-cap":
      return (
        <svg {...common} className="text-amber-600">
          <rect x="4" y="13" width="5" height="7" rx="1" />
          <rect x="10" y="9" width="5" height="11" rx="1" />
          <rect x="16" y="5" width="4" height="15" rx="1" />
        </svg>
      );
    case "obligations":
      return (
        <svg {...common} className="text-slate-500">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 10h8M8 14h5" />
        </svg>
      );
    default:
      return (
        <svg {...common} className="text-primary-600">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

export function RegionMark({
  region,
  size = 18,
  withLabel = false,
  className,
}: {
  region: ETFRegion;
  size?: number;
  withLabel?: boolean;
  className?: string;
}) {
  const flag = FLAGS[region];
  const mark = flag ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flag}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="rounded-[3px] object-cover shrink-0 ring-1 ring-black/5"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <Glyph region={region} size={size} />
    </span>
  );

  if (!withLabel) return <span className={className}>{mark}</span>;
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {mark}
      <span>{LABELS[region]}</span>
    </span>
  );
}
