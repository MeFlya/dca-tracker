"use client";

import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpgradePromptProps {
  /** Short name of the gated feature, e.g. "Sauvegarde de simulation" */
  feature: string;
  /** One sentence explaining why it's worth it */
  description?: string;
  /** How the prompt is displayed */
  variant?: "inline" | "card" | "banner";
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UpgradePrompt({
  feature,
  description,
  variant = "inline",
  className = "",
}: UpgradePromptProps) {
  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-600 text-white">
          Premium
        </span>
        <Link
          href="/tarifs"
          className="text-xs font-medium text-gray-500 hover:text-gray-700 underline transition-colors"
        >
          Débloquer {feature}
        </Link>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border text-sm border-primary-100 bg-primary-50 text-primary-700 ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <LockIcon className="w-4 h-4 shrink-0 opacity-60" />
          <span className="font-medium truncate">{feature}</span>
          {description && (
            <span className="text-xs opacity-70 hidden sm:inline truncate">
              — {description}
            </span>
          )}
        </div>
        <Link
          href="/tarifs"
          className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          Voir Premium →
        </Link>
      </div>
    );
  }

  // card variant
  return (
    <div
      className={`rounded-2xl border p-5 border-primary-100 bg-primary-50 text-primary-700 ${className}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary-100">
          <LockIcon className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm text-gray-900">{feature}</p>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-primary-600 text-white">
              Premium
            </span>
          </div>
          {description && (
            <p className="text-xs opacity-80 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <Link
        href="/tarifs"
        className="w-full text-center block text-sm font-semibold py-2 px-4 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
      >
        Découvrir Premium →
      </Link>
    </div>
  );
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}
