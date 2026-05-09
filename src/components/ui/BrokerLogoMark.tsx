// Marque visuelle stylisée par broker — rendue inline en SVG.
//
// ⚠️ Pas un logo officiel. Pour des raisons de licence/marque, on n'utilise
// pas les logos réels des brokers (qui sont leur propriété intellectuelle).
// À la place, on rend une "marque" stylisée : monogramme + couleur signature
// associée à chaque broker, créant un identifiant visuel reconnaissable
// sans risque de contrefaçon.
//
// Si DCA Tracker établit un partenariat formel avec un broker (affiliation
// validée), on pourra remplacer la marque par leur logo officiel via leur
// kit de marque. En attendant, ce composant affiche un mark neutre qui
// fonctionne sur les pages /comparatif/* et dans <InvestCTA />.

import { cn } from "@/lib/utils";

interface BrokerLogoMarkProps {
  slug: string;
  size?: number;
  className?: string;
}

interface MarkStyle {
  initials: string;
  bg: string;
  text: string;
}

const MARKS: Record<string, MarkStyle> = {
  "trade-republic": {
    initials: "TR",
    bg: "#0f172a",
    text: "#ffffff",
  },
  "boursorama-bourse": {
    initials: "Bo",
    bg: "#ec4899",
    text: "#ffffff",
  },
  fortuneo: {
    initials: "F",
    bg: "#dc2626",
    text: "#ffffff",
  },
  // Fallback générique
  default: {
    initials: "?",
    bg: "#64748b",
    text: "#ffffff",
  },
};

export function BrokerLogoMark({
  slug,
  size = 40,
  className,
}: BrokerLogoMarkProps) {
  const mark = MARKS[slug] ?? MARKS.default;
  // Font size relatif à la taille du mark (60 % du diamètre)
  const fontSize = Math.round(size * 0.42);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-xl shrink-0 font-bold tracking-tight select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: mark.bg,
        color: mark.text,
        fontSize,
      }}
      aria-hidden
    >
      {mark.initials}
    </div>
  );
}
