import Link from "next/link";
import { HeroDemoCard } from "./HeroDemoCard";

// Hero reste un server component pour la perf SSR. Toute l'interactivité
// (toggles montant/durée + courbe live) est isolée dans <HeroDemoCard />,
// le seul "use client" du Hero. Les chiffres ne sont plus dur-codés ici —
// ils sont calculés côté client à chaque toggle.

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50/60 border-b border-slate-200/60">
      {/* Ambient grid — slightly stronger than before for depth */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#1d4ed8 1px, transparent 1px), linear-gradient(to right, #1d4ed8 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />

      {/* Floating gradient orb — single blur to keep compositor cost low.
          AmbientBackground (layout) already provides page-wide "liquid" feel
          via CSS radial-gradients (0 filter cost). This single orb accents
          the Hero specifically — the rest of the ambience is free. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-primary-400/30 blur-3xl animate-float-a" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* ── Left column: copy + CTAs ───────────────────────────────── */}
          <div className="lg:col-span-7">
            {/* Badge — dot "breathes" to signal live/active */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-medium mb-6">
              <span className="relative w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 animate-breathe">
                <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-50" />
              </span>
              Le cockpit DCA pour investisseurs long-terme
            </div>

            {/* H1 — no colored span. A hyperlink-looking emphasis ("votre argent"
                in text-primary-600) was weakening the headline. The size already
                does the work; keeping the accent would compete with CTAs.
                Hérite automatiquement de Fraunces (display font) via globals.css. */}
            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-gray-900 leading-[1.1] mb-5">
              Combien peut valoir votre argent dans 20 ans ?
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-xl">
              Simulez votre stratégie DCA, sauvegardez-la, puis suivez votre
              progression mois après mois. Hypothèses transparentes, trois
              scénarios de marché, zéro jargon.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/simulateur"
                className="btn-primary group text-base px-6 py-3"
              >
                Voir ce que vaut mon argent
                <span aria-hidden className="arrow-nudge">→</span>
              </Link>
              <Link
                href="/simulateur"
                className="btn-secondary text-base px-6 py-3"
              >
                Tester avec 200 €/mois
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              {[
                "Sans inscription",
                "Formules vérifiables",
                "Hypothèses transparentes",
                "Gratuit",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckIcon />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right column: interactive demo card ─────────────────────
              Client component isolé — gère toggles montant + durée et
              recalcule la projection live. */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <HeroDemoCard />
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-gain-dark"
    >
      <circle cx="8" cy="8" r="7" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M5 8.5l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
