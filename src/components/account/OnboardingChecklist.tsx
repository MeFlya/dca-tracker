"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ArrowRight, Lock } from "lucide-react";

// localStorage key set by SimulatorPageClient on first page load.
// Used here to detect "step 2 done" even when the user hasn't yet saved
// a strategy (which only Premium can do). Survives across sessions on
// the same device — acceptable tradeoff for an onboarding signal.
const SIMULATED_FLAG_KEY = "dca_has_simulated";

type StepStatus = "done" | "current" | "locked";

type Step = {
  number: number;
  title: string;
  description: string;
  status: StepStatus;
  cta?: { label: string; href: string };
};

interface Props {
  isPremium: boolean;
  hasStrategy: boolean;
  firstName?: string;
}

/**
 * Post-signup onboarding checklist shown on /account when the user hasn't
 * yet completed the full activation flow (signup → simulate → save strategy).
 * Renders different step states depending on plan + data.
 *
 * Client component: reads localStorage to detect whether the user has
 * opened the simulator at least once — otherwise step 2 would stay
 * "current" indefinitely for free users who can't save a strategy.
 */
export function OnboardingChecklist({ isPremium, hasStrategy, firstName }: Props) {
  // Read the "has simulated" flag on mount. Default false during SSR so
  // the initial render matches the server (no hydration mismatch). The
  // component re-renders once the flag is read from localStorage.
  const [hasSimulated, setHasSimulated] = useState(false);

  useEffect(() => {
    try {
      setHasSimulated(localStorage.getItem(SIMULATED_FLAG_KEY) === "1");
    } catch {
      // Private mode / storage disabled — leave as false
    }
  }, []);

  const steps = buildSteps({ isPremium, hasStrategy, hasSimulated });
  const completed = steps.filter((s) => s.status === "done").length;

  return (
    <section className="rounded-2xl border border-primary-100 bg-white overflow-hidden mb-6">
      {/* Hero illustration — courbe DCA stylisée évoquant le "voyage
          d'investissement" du new user. Fond gradient bleu pâle, courbe
          ascendante avec milestone dots et endpoint qui pulse.
          Pas d'image externe — SVG inline, rapide, accessible. */}
      <OnboardingIllustration completed={completed} total={steps.length} />

      <div className="p-6 sm:p-8 pt-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <p className="text-xs font-semibold text-accent-700 uppercase tracking-wider mb-1">
              Premiers pas
            </p>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {firstName
                ? `Bienvenue, ${firstName}`
                : "Bienvenue sur DCA Tracker"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              3 étapes pour démarrer votre suivi DCA.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-24">
              <div
                className="bg-primary-600 h-1.5 rounded-full transition-all"
                style={{ width: `${(completed / steps.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 tabular-nums">
              {completed}/{steps.length}
            </span>
          </div>
        </div>

      {/* Steps */}
      <div className="space-y-2.5">
        {steps.map((step) => (
          <StepRow key={step.number} step={step} />
        ))}
      </div>

      {/* Free user upgrade teaser — dark premium theme pour cohérence
          avec le reste du site (TrackingPitch, Premium card, PremiumFix). */}
      {!isPremium && (
        <div className="relative mt-6 rounded-xl bg-slate-950 border border-slate-800 p-5 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
            aria-hidden
          />
          <div
            className="absolute -top-16 -right-16 w-48 h-48 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(59, 130, 246, 0.35), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative flex items-start gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center bg-primary-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                  Premium
                </span>
                <p className="text-sm font-semibold text-white">
                  Débloquez le suivi mensuel
                </p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Essai gratuit 7 jours · sauvegarde de stratégie, Monte Carlo,
                comparaison A/B.
              </p>
            </div>
            <Link
              href="/tarifs"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-100 transition-colors btn-lift shrink-0"
            >
              Essayer Premium 7 jours
            </Link>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}

// ─── Onboarding illustration ─────────────────────────────────────────────────
//
// SVG inline custom — courbe DCA stylisée évoquant le voyage d'investissement.
// Pas une icône Lucide générique, pas une stock photo : un dessin spécifique
// au produit. 3 milestone dots correspondent aux 3 étapes (compte créé,
// simulation lancée, stratégie sauvegardée). Le dot actif est plus grand.
//
// Responsive : full-width, height fixe 140px (bon ratio sur mobile et desktop).
// Performance : SVG inline, pas d'image à fetcher, animations CSS only.

function OnboardingIllustration({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  // Position du "you are here" sur la courbe selon progression
  const progress = completed / total;
  const dotX = 60 + progress * 480; // de 60 à 540 sur viewBox 600
  // Approximation visuelle de la y position sur la courbe (y diminue avec progress)
  const dotY = 110 - progress * 80;

  return (
    <div className="relative w-full h-[140px] bg-gradient-to-br from-primary-50/60 via-white to-accent-50/40 border-b border-primary-100 overflow-hidden">
      {/* Dot grid texture subtile en arrière-plan */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#1d4ed8 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
        aria-hidden
      />
      <svg
        viewBox="0 0 600 140"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="onboardingArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="onboardingStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        {/* Aire sous la courbe */}
        <path
          d="M 0 120 C 100 118, 180 110, 260 90 S 440 50, 600 20 L 600 140 L 0 140 Z"
          fill="url(#onboardingArea)"
        />
        {/* Courbe principale — animation draw on mount */}
        <path
          d="M 0 120 C 100 118, 180 110, 260 90 S 440 50, 600 20"
          fill="none"
          stroke="url(#onboardingStroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="animate-draw-line"
        />

        {/* 3 milestone dots — un par étape, position fixe */}
        {[
          { x: 60,  y: 116, label: "Compte" },
          { x: 300, y: 78,  label: "Simulation" },
          { x: 540, y: 30,  label: "Stratégie" },
        ].map((m, i) => {
          const reached = i < completed;
          return (
            <g key={i}>
              <circle
                cx={m.x}
                cy={m.y}
                r="4"
                fill={reached ? "#0d9488" : "#cbd5e1"}
                className="animate-fade-in"
                style={{ animationDelay: `${600 + i * 200}ms` }}
              />
              {reached && (
                <circle
                  cx={m.x}
                  cy={m.y}
                  r="4"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="1.5"
                  opacity="0.4"
                >
                  <animate attributeName="r" from="4" to="10" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}

        {/* "You are here" dot — position fonction de progress */}
        <circle
          cx={dotX}
          cy={dotY}
          r="6"
          fill="#1d4ed8"
          className="animate-fade-in"
          style={{ animationDelay: "1200ms" }}
        />
        <circle
          cx={dotX}
          cy={dotY}
          r="6"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="2"
        >
          <animate attributeName="r" from="6" to="14" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Caption en bas — contextualise visuellement l'illustration */}
      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-gray-400 pointer-events-none">
        <span>Aujourd&apos;hui</span>
        <span>Votre progression</span>
        <span>Long terme</span>
      </div>
    </div>
  );
}

// ─── Steps logic ──────────────────────────────────────────────────────────────

function buildSteps({
  isPremium,
  hasStrategy,
  hasSimulated,
}: {
  isPremium: boolean;
  hasStrategy: boolean;
  hasSimulated: boolean;
}): Step[] {
  // Having a saved strategy implies the user has simulated at least once.
  const simulated = hasSimulated || hasStrategy;

  // Step 1 is always complete — they signed up to reach this screen.
  const step1: Step = {
    number: 1,
    title: isPremium ? "Compte Premium créé" : "Compte créé",
    description: isPremium
      ? "Vous avez accès à toutes les fonctions Premium."
      : "Vous pouvez simuler librement.",
    status: "done",
  };

  // Step 2: "launched first simulation" — marked done as soon as the user
  // has opened the simulator page (tracked via localStorage flag set in
  // SimulatorPageClient on mount).
  const step2: Step = simulated
    ? {
        number: 2,
        title: "Première simulation lancée",
        description:
          "Vous avez exploré le simulateur. Ajustez les curseurs pour tester d'autres scénarios à tout moment.",
        status: "done",
      }
    : {
        number: 2,
        title: "Lancez votre première simulation",
        description:
          "Entrez un montant mensuel et une durée. Voyez votre projection sur 20-30 ans en 10 secondes.",
        status: "current",
        cta: { label: "Ouvrir le simulateur", href: "/simulateur" },
      };

  // Step 3: depends on plan + state
  if (!isPremium) {
    // Free plan: step 3 is always locked (save strategy requires Premium)
    const step3: Step = {
      number: 3,
      title: "Sauvegardez votre stratégie",
      description:
        "Suivi mensuel, comparaison réel vs projection, Monte Carlo. Disponible avec Premium.",
      status: "locked",
    };
    return [step1, step2, step3];
  }

  // Premium without strategy: step 3 becomes current once simulation is done
  if (!hasStrategy) {
    const step3: Step = {
      number: 3,
      title: "Sauvegardez votre stratégie",
      description:
        "Depuis le simulateur, cliquez sur 'Sauvegarder ma stratégie' pour démarrer le tracking mensuel.",
      status: simulated ? "current" : "locked",
      cta: simulated
        ? { label: "Ouvrir le simulateur", href: "/simulateur" }
        : undefined,
    };
    return [step1, step2, step3];
  }

  // Premium + has strategy (shouldn't really render this — StrategyTracker replaces it)
  const step3Done: Step = {
    number: 3,
    title: "Stratégie sauvegardée",
    description:
      "Votre stratégie est prête. Enregistrez votre premier mois pour activer le suivi.",
    status: "done",
  };
  return [step1, step2, step3Done];
}

// ─── Step row component ───────────────────────────────────────────────────────

function StepRow({ step }: { step: Step }) {
  const { number, title, description, status, cta } = step;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
        status === "done"
          ? "border-emerald-100 bg-emerald-50/40"
          : status === "current"
          ? "border-primary-200 bg-primary-50/40"
          : "border-gray-100 bg-gray-50/60"
      }`}
    >
      {/* Status icon */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          status === "done"
            ? "bg-emerald-600 text-white"
            : status === "current"
            ? "bg-primary-600 text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        {status === "done" ? (
          <Check size={16} strokeWidth={3} />
        ) : status === "locked" ? (
          <Lock size={14} strokeWidth={2.2} />
        ) : (
          <span className="text-sm font-bold tabular-nums">{number}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-tight mb-0.5 ${
            status === "locked" ? "text-gray-500" : "text-gray-900"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-xs leading-relaxed ${
            status === "locked" ? "text-gray-500" : "text-gray-500"
          }`}
        >
          {description}
        </p>

        {/* CTA (only for current step) */}
        {status === "current" && cta && (
          <Link
            href={cta.href}
            className="mt-2.5 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
          >
            {cta.label}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
