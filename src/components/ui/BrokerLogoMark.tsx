// Badge d'identification broker — wordmark + couleur de marque officielle.
//
// ⚠️ NOT le logo officiel — recréer la typographie custom et le design des
// logos serait reproduire leur propriété intellectuelle (marques déposées).
// On affiche uniquement : (1) le nom de marque en police neutre,
// (2) la couleur de marque comme background. Couleurs et noms étant des
// "faits" identifiants, c'est légal et c'est exactement ce que font les
// comparateurs avant accord de partenariat.
//
// Quand DCA Tracker formalisera ses affiliations brokers, chaque broker
// fournira un brand kit officiel (SVG logo + autorisation d'usage). À ce
// moment-là, swap ce composant pour rendre les vrais logos via next/image.

import { cn } from "@/lib/utils";

interface BrokerLogoMarkProps {
  slug: string;
  /** Hauteur du badge en pixels. La largeur s'ajuste selon la longueur
   *  du wordmark — pas de carré rigide. */
  height?: number;
  className?: string;
}

interface BadgeStyle {
  /** Texte affiché — généralement le nom de marque ou une variante courte. */
  wordmark: string;
  /** Couleur de fond — couleur de marque officielle (fait public). */
  bg: string;
  /** Couleur du texte. */
  text: string;
  /** Tracking optionnel pour ajuster le wordmark. */
  letterSpacing?: string;
  /** Font weight optionnel. */
  fontWeight?: number;
}

const BADGES: Record<string, BadgeStyle> = {
  "trade-republic": {
    wordmark: "Trade Republic",
    bg: "#0a0a0a",
    text: "#ffffff",
    letterSpacing: "-0.01em",
    fontWeight: 600,
  },
  "boursorama-bourse": {
    wordmark: "Boursorama",
    bg: "#ec4899",
    text: "#ffffff",
    letterSpacing: "-0.01em",
    fontWeight: 700,
  },
  fortuneo: {
    wordmark: "Fortuneo",
    bg: "#dc2626",
    text: "#ffffff",
    letterSpacing: "-0.01em",
    fontWeight: 700,
  },
  // Fallback générique
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
  const badge = BADGES[slug] ?? BADGES.default;
  // Font-size ajusté pour la hauteur du badge — viser ~38 % de la hauteur.
  const fontSize = Math.round(height * 0.38);
  const paddingX = Math.round(height * 0.32);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-lg shrink-0 select-none whitespace-nowrap",
        className
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
        // Police système neutre — ne tente PAS de reproduire la typographie
        // custom des marques. C'est un identifiant générique, pas un logo.
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif',
      }}
      aria-label={badge.wordmark}
    >
      {badge.wordmark}
    </div>
  );
}
