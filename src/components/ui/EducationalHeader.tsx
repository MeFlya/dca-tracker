// Bloc d'en-tête décoratif pour les pages éducatives (/glossaire, /pea-ou-cto,
// /interets-composes, /strategie-dca, etc.).
//
// Ajoute une "ancre visuelle" en haut de page sans nécessiter d'illustration
// dédiée par sujet. Composé d'une icône Lucide centrée dans un badge
// circulaire avec halo accent, sur fond gradient subtil. Plus mémorable
// qu'un simple H1 nu.
//
// Si on veut pousser plus loin, on peut créer plus tard des SVG custom par
// page (genre une calculatrice pour /interets-composes, un coffre pour /pea-ou-cto)
// — mais ce composant générique fournit déjà un saut visuel notable.

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Theme accent — défaut "accent" (teal). "primary" pour bleu cohérent
   *  avec contexte primary lourd. */
  accent?: "accent" | "primary";
  className?: string;
}

export function EducationalHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  accent = "accent",
  className,
}: Props) {
  const palette = accent === "accent"
    ? {
        gradient: "from-accent-50 via-white to-accent-50/30",
        ringBg: "bg-accent-50",
        ringBorder: "border-accent-200",
        iconText: "text-accent-700",
        eyebrowText: "text-accent-700",
      }
    : {
        gradient: "from-primary-50 via-white to-primary-50/30",
        ringBg: "bg-primary-50",
        ringBorder: "border-primary-200",
        iconText: "text-primary-700",
        eyebrowText: "text-primary-700",
      };

  return (
    <header
      className={cn(
        "relative rounded-3xl border border-slate-200/60 bg-gradient-to-br p-8 sm:p-10 mb-10 overflow-hidden",
        palette.gradient,
        className
      )}
    >
      {/* Texture dot grid subtile */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          color: accent === "accent" ? "#0d9488" : "#1d4ed8",
        }}
        aria-hidden
      />

      <div className="relative flex items-center gap-5 sm:gap-6 flex-wrap">
        {/* Badge icon avec halo */}
        <div className="relative shrink-0">
          <span
            aria-hidden
            className={cn(
              "absolute -inset-2 rounded-2xl blur-md opacity-40",
              accent === "accent" ? "bg-accent-300" : "bg-primary-300"
            )}
          />
          <div
            className={cn(
              "relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center",
              palette.ringBg,
              palette.ringBorder
            )}
          >
            <Icon size={28} className={palette.iconText} strokeWidth={1.75} />
          </div>
        </div>

        {/* Title block */}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-widest mb-1.5",
                palette.eyebrowText
              )}
            >
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
