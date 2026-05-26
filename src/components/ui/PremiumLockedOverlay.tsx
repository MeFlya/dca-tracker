"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  /** Headline visible above the description, e.g. "Ce graphique montre les 1 000 marchés possibles." */
  title: string;
  /** Body content under the title — accepts JSX for inline emphasis (<strong>, <span>...). */
  description: ReactNode;
  /** Label of the primary CTA button, e.g. "Débloquer l'analyse de risque →" */
  ctaLabel: string;
  /** Destination of the CTA (typically `buildUpgradeUrl(feature, input)`). */
  ctaHref: string;
  /** Optional sober line under the description, used for soft justification. */
  fineprint?: string;
}

/**
 * Dark "Premium" lock overlay shared by every gated visual (Monte Carlo chart,
 * A/B scenario comparison, future paywall-style locks).
 *
 * DA grammar (kept in sync with PremiumFix in ConversionBlocks and
 * UpgradePrompt card/banner variants):
 *  - slate-950 background with subtle dot pattern + radial blue glow
 *  - Lock icon in a primary-500/20 capsule
 *  - "Premium" pill in primary-500
 *  - Inverted CTA: white bg, slate-950 text
 *
 * The overlay is semi-transparent (`bg-slate-950/95`) and uses `backdrop-blur-sm`
 * so the blurred content behind it stays visible — the proof there's something
 * to unlock.
 */
export function PremiumLockedOverlay({
  title,
  description,
  ctaLabel,
  ctaHref,
  fineprint,
}: Props) {
  return (
    <div
      role="dialog"
      aria-label={`Contenu Premium verrouillé : ${title}`}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-slate-950/95 backdrop-blur-sm overflow-hidden"
    >
      {/* Dot texture (Premium identity) */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden
      />
      {/* Soft blue glow */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(59, 130, 246, 0.35), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative text-center max-w-sm px-6">
        {/* Lock capsule */}
        <div
          className="w-12 h-12 rounded-2xl bg-primary-500/20 border border-primary-400/30 flex items-center justify-center mx-auto mb-4"
          aria-hidden
        >
          <Lock size={20} strokeWidth={1.8} className="text-primary-300" />
        </div>

        {/* Premium pill */}
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center bg-primary-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
            Premium
          </span>
        </div>

        <p className="font-bold text-white text-base mb-2 leading-snug">
          {title}
        </p>
        <p className="text-sm text-slate-300 mb-1 leading-relaxed">
          {description}
        </p>
        {fineprint && (
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            {fineprint}
          </p>
        )}

        <Link
          href={ctaHref}
          className={`inline-block bg-white text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors ${fineprint ? "" : "mt-4"}`}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
