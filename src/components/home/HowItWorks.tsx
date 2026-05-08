import Link from "next/link";
import { Sliders, LineChart, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Entrez vos paramètres",
    description:
      "Montant mensuel, durée, rendement cible. 3 nombres suffisent pour obtenir une projection réaliste.",
    Icon: Sliders,
  },
  {
    number: "02",
    title: "Voyez votre projection",
    description:
      "Capital final, intérêts composés, 3 scénarios de marché (prudent, réaliste, optimiste). Hypothèses transparentes, formules vérifiables.",
    Icon: LineChart,
  },
  {
    number: "03",
    title: "Suivez votre progression",
    description:
      "Sauvegardez votre stratégie et enregistrez vos versements chaque mois. Voyez votre portefeuille réel vs votre projection, mois après mois.",
    Icon: CheckCircle2,
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-accent-700 uppercase tracking-widest mb-3">
            Comment ça marche
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            De la simulation au pilotage réel
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Le simulateur vous donne une projection. Le suivi mensuel vous
            donne la réalité. Ensemble, vous savez toujours où vous en êtes.
          </p>
        </div>

        {/* 3-step grid — staggered entrance (80ms per step = 240ms total) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map(({ number, title, description, Icon }, i) => (
            <div
              key={number}
              className="relative rounded-2xl border border-slate-200/70 bg-white p-6 card-hover animate-slide-up stagger-child"
              style={{ ["--i" as string]: i }}
            >
              {/* Number badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Icon size={18} className="text-primary-600" />
                </div>
                <span className="text-xs font-bold text-gray-500 tabular-nums tracking-wider">
                  {number}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/simulateur"
            className="btn-primary text-base px-6 py-3 inline-block btn-lift"
          >
            Lancer ma simulation →
          </Link>
          <p className="text-xs text-gray-500 mt-3">
            Sans inscription · 60 secondes · Hypothèses vérifiables
          </p>
        </div>
      </div>
    </section>
  );
}
