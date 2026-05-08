import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Mail,
  Flame,
  Check,
} from "lucide-react";

const BULLETS = [
  {
    Icon: TrendingUp,
    title: "Réel vs projection, chaque mois",
    text: "Voyez instantanément si vous êtes en avance ou en retard sur votre plan.",
  },
  {
    Icon: Calendar,
    title: "Comparaison 12 mois",
    text: "Après 1 an de suivi, voyez votre progression année sur année — un indicateur impossible à reproduire ailleurs.",
  },
  {
    Icon: BarChart3,
    title: "Monte Carlo",
    text: "1 000 scénarios de marché simulés pour voir le pire cas, le meilleur, et votre probabilité de gain.",
  },
  {
    Icon: Mail,
    title: "Email mensuel",
    text: "Résumé personnalisé le 1ᵉʳ de chaque mois. Vos chiffres, vos insights, rien d'autre.",
  },
  {
    Icon: Flame,
    title: "Série de mois",
    text: "Un streak qui se construit mois après mois — jamais interrompre devient l'objectif.",
  },
];

export function TrackingPitch() {
  return (
    <section className="relative py-28 md:py-32 bg-slate-950 overflow-hidden">
      {/* Ambient effect — radial-gradient based (no blur() filter = cheap).
          On dark bg, colored glows at control points simulate the orb look
          without the compositor cost. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            "radial-gradient(900px circle at 10% 15%, rgba(59, 130, 246, 0.25), transparent 50%)",
            "radial-gradient(700px circle at 90% 85%, rgba(99, 102, 241, 0.20), transparent 55%)",
          ].join(", "),
        }}
        aria-hidden
      />
      {/* Subtle dot grid for texture */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-primary-300 uppercase tracking-widest mb-3">
            Au-delà du simulateur
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Un cockpit qui grandit avec votre DCA
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Une simulation vous donne une trajectoire théorique. Un suivi
            mensuel vous donne votre progression réelle. La différence change
            vos décisions.
          </p>
        </div>

        {/* Visual: mockup-ish card on left, bullets on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
          {/* Left: visual mockup — pops bright against the dark section.
              Halo underneath for extra emphasis. */}
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary-500/30 via-indigo-400/20 to-sky-400/20 blur-2xl pointer-events-none"
              aria-hidden
            />
            <div className="relative rounded-2xl border border-slate-200/60 bg-white p-6 shadow-card-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Suivi de stratégie
              </p>
              <span className="text-xs text-gray-500">Mois 6</span>
            </div>

            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-gray-900">200 €/mois</span>
              {" · "}20 ans{" · "}7 %/an
            </p>

            {/* Streak pill */}
            <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-bold px-3 py-1.5 rounded-full mb-5">
              <Flame size={14} />
              6 mois consécutifs
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
                  Théorique
                </p>
                <p className="text-lg font-bold text-gray-500 tabular-nums">
                  1 247 €
                </p>
              </div>
              <div className="rounded-xl bg-primary-50/60 border border-primary-100 px-3 py-2.5">
                <p className="text-[10px] text-primary-600 uppercase tracking-wide mb-0.5">
                  Votre portefeuille
                </p>
                <p className="text-lg font-bold text-primary-900 tabular-nums">
                  1 380 €
                </p>
              </div>
            </div>

            {/* Insight */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp size={14} />
              En avance de +133 €
            </div>
            </div>
          </div>

          {/* Right: bullet list — on dark bg now */}
          <div>
            <ul className="space-y-5">
              {BULLETS.map(({ Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-primary-500/15 border border-primary-400/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                    <Icon size={16} className="text-primary-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-0.5 leading-snug">
                      {title}
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA — glass-morphic on dark */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="inline-flex items-center text-[10px] font-bold bg-primary-500 text-white px-2 py-0.5 rounded uppercase tracking-wide">
              Premium
            </span>
            <span className="text-xs text-slate-400">
              7 jours gratuits · annulable en 1 clic
            </span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white mb-4 leading-snug">
            Essayez le suivi complet pendant 7 jours
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link
              href="/tarifs"
              className="btn-primary text-sm px-6 py-2.5 btn-lift"
            >
              Essayer Premium — 7 jours gratuits
            </Link>
            <Link
              href="/simulateur"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-sm transition-colors btn-lift"
            >
              Rester sur le simulateur gratuit
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Check size={12} className="text-emerald-400" />
              Pas de carte requise après l&apos;essai
            </span>
            <span className="inline-flex items-center gap-1">
              <Check size={12} className="text-emerald-400" />
              4,90 €/mois ensuite
            </span>
            <span className="inline-flex items-center gap-1">
              <Check size={12} className="text-emerald-400" />
              Vos données vous appartiennent
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
