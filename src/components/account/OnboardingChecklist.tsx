import Link from "next/link";
import { Check, ArrowRight, Lock } from "lucide-react";

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
 */
export function OnboardingChecklist({ isPremium, hasStrategy, firstName }: Props) {
  const steps = buildSteps({ isPremium, hasStrategy });
  const completed = steps.filter((s) => s.status === "done").length;

  return (
    <section className="rounded-2xl border border-primary-100 bg-white p-6 sm:p-8 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
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

      {/* Free user upgrade teaser (only when not premium and step 1 done) */}
      {!isPremium && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                Débloquez le suivi mensuel
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Essai gratuit 7 jours · sauvegarde de stratégie, Monte Carlo,
                comparaison A/B.
              </p>
            </div>
            <Link
              href="/tarifs"
              className="btn-primary text-sm px-4 py-2 btn-lift shrink-0"
            >
              Essayer Premium 7 jours
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Steps logic ──────────────────────────────────────────────────────────────

function buildSteps({
  isPremium,
  hasStrategy,
}: {
  isPremium: boolean;
  hasStrategy: boolean;
}): Step[] {
  // Step 1 is always complete — they signed up to reach this screen.
  const step1: Step = {
    number: 1,
    title: isPremium ? "Compte Premium créé" : "Compte créé",
    description: isPremium
      ? "Vous avez accès à toutes les fonctions Premium."
      : "Vous pouvez simuler librement.",
    status: "done",
  };

  // Step 2: run first simulation
  const step2: Step = {
    number: 2,
    title: "Lancez votre première simulation",
    description:
      "Entrez un montant mensuel et une durée. Voyez votre projection sur 20-30 ans en 10 secondes.",
    status: "current",
    cta: { label: "Ouvrir le simulateur", href: "/simulateur" },
  };

  // Step 3: depends on plan
  if (!isPremium) {
    const step3: Step = {
      number: 3,
      title: "Sauvegardez votre stratégie",
      description:
        "Suivi mensuel, comparaison réel vs projection, Monte Carlo. Disponible avec Premium.",
      status: "locked",
    };
    return [step1, step2, step3];
  }

  // Premium users
  if (!hasStrategy) {
    const step3: Step = {
      number: 3,
      title: "Sauvegardez votre stratégie",
      description:
        "Depuis le simulateur, cliquez sur 'Sauvegarder ma stratégie' pour démarrer le tracking mensuel.",
      status: "current",
      cta: { label: "Ouvrir le simulateur", href: "/simulateur" },
    };
    return [step1, step2, step3];
  }

  // Premium + has strategy (shouldn't really render this — OverviewTab's EmptyState handles it)
  const step3Done: Step = {
    number: 3,
    title: "Stratégie sauvegardée",
    description: "Votre stratégie est prête. Enregistrez votre premier mois pour activer le suivi.",
    status: "done",
  };
  return [
    step1,
    { ...step2, status: "done" },
    step3Done,
  ];
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
            : "bg-gray-200 text-gray-400"
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
            status === "locked" ? "text-gray-400" : "text-gray-900"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-xs leading-relaxed ${
            status === "locked" ? "text-gray-400" : "text-gray-500"
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
