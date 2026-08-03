// Galerie d'aperçus visuels des fonctionnalités Premium.
//
// Pourquoi : un user gratuit qui lit "Analyse Monte Carlo (1 000 scénarios)"
// dans un tableau ne SAIT pas à quoi ça ressemble ni pourquoi ça vaut le coup.
// Cette section montre des mockups haute-fidélité de chaque feature → l'user
// VOIT la valeur avant de payer. C'est un levier de conversion direct.
//
// Choix : mockups construits en SVG/CSS (pas des captures d'écran) → responsive,
// on-brand, zéro maintenance quand l'UI réelle évolue. On pourra les remplacer
// par de vraies captures plus tard si on veut.
//
// Interactivité (sans JS) : card-hover (lift au survol), mockup qui zoome
// légèrement au group-hover, lignes des graphiques qui se dessinent au mount
// (animate-draw-line), points d'arrivée qui pulsent (SMIL). Donne un effet
// "vivant" sans alourdir (pas de "use client").

import Link from "next/link";
import { Sparkles } from "lucide-react";

// ─── Mockup 1 : Suivi mensuel (le moat) ──────────────────────────────────────

function TrackingMockup() {
  return (
    <div className="w-full h-full bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Votre suivi · Mois 8
          </p>
          <p className="text-sm font-bold text-gray-900 tabular-nums">2 680 €</p>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full transition-transform group-hover:scale-105">
          +3,2 % vs projection
        </span>
      </div>
      <svg viewBox="0 0 200 64" className="w-full flex-1" preserveAspectRatio="none" aria-hidden>
        {/* Projeté (pointillé gris) */}
        <polyline
          points="4,54 32,49 60,44 88,38 116,31 144,25 172,18 196,12"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        {/* Réel (bleu plein) — se dessine au mount */}
        <polyline
          points="4,53 32,47 60,41 88,33 116,27 144,20 172,12 196,5"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-draw-line"
        />
        {[
          [4, 53], [32, 47], [60, 41], [88, 33], [116, 27], [144, 20], [172, 12],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.8" fill="#2563eb" />
        ))}
        {/* Point d'arrivée + ping */}
        <circle cx="196" cy="5" r="3" fill="#2563eb" />
        <circle cx="196" cy="5" r="3" fill="none" stroke="#2563eb" strokeWidth="1.5">
          <animate attributeName="r" from="3" to="9" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 border-t-2 border-blue-600 inline-block" /> Réel
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 border-t-2 border-dashed border-gray-300 inline-block" /> Projeté
        </span>
      </div>
    </div>
  );
}

// ─── Mockup 2 : Monte Carlo ──────────────────────────────────────────────────

function MonteCarloMockup() {
  return (
    <div className="w-full h-full bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
        1 000 marchés possibles
      </p>
      <svg viewBox="0 0 200 64" className="w-full flex-1" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="mcMockArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {/* Cône de dispersion p10–p90 */}
        <path
          d="M4 34 C 70 30, 130 22, 196 6 L 196 40 C 130 38, 70 36, 4 35 Z"
          fill="url(#mcMockArea)"
        />
        {/* p90 (meilleur cas) */}
        <path d="M4 34 C 70 28, 130 18, 196 6" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* p50 (médiane) — se dessine au mount */}
        <path d="M4 35 C 70 32, 130 26, 196 20" fill="none" stroke="#2563eb" strokeWidth="2" className="animate-draw-line" />
        {/* p10 (pire cas) */}
        <path d="M4 36 C 70 36, 130 36, 196 40" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex gap-2.5 text-[10px]">
          <span className="text-orange-500 font-semibold tabular-nums">68k€</span>
          <span className="text-blue-600 font-semibold tabular-nums">102k€</span>
          <span className="text-emerald-600 font-semibold tabular-nums">158k€</span>
        </div>
        <span className="text-[11px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full transition-transform group-hover:scale-105">
          87 % de plus-value
        </span>
      </div>
    </div>
  );
}

// ─── Mockup 3 : Backtest historique ──────────────────────────────────────────

function BacktestMockup() {
  return (
    <div className="w-full h-full bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          DCA réel · 2010 → 2025
        </p>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full tabular-nums transition-transform group-hover:scale-105">
          +187 %
        </span>
      </div>
      <svg viewBox="0 0 200 64" className="w-full flex-1" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="btMockArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Courbe avec un vrai creux (COVID) puis reprise — montre que c'est du réel */}
        <path
          d="M4 52 C 30 48, 45 44, 60 42 C 70 41, 74 52, 84 50 C 100 47, 120 30, 150 22 C 170 16, 185 10, 196 6 L 196 64 L 4 64 Z"
          fill="url(#btMockArea)"
        />
        <path
          d="M4 52 C 30 48, 45 44, 60 42 C 70 41, 74 52, 84 50 C 100 47, 120 30, 150 22 C 170 16, 185 10, 196 6"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-draw-line"
        />
        {/* Marqueur du creux COVID */}
        <circle cx="80" cy="50" r="2.5" fill="#f97316" />
        {/* Point d'arrivée + ping */}
        <circle cx="196" cy="6" r="3" fill="#2563eb" />
        <circle cx="196" cy="6" r="3" fill="none" stroke="#2563eb" strokeWidth="1.5">
          <animate attributeName="r" from="3" to="9" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
      <p className="text-[10px] text-gray-500 mt-2">
        TRI <strong className="text-gray-700">13 %/an</strong> · pire creux traversé{" "}
        <strong className="text-orange-600">−34 %</strong> (mars 2020)
      </p>
    </div>
  );
}

// ─── Mockup 4 : Récap fiscal annuel ──────────────────────────────────────────
// Compact (espacement serré) pour tenir dans la hauteur fixe sans déborder.

function FiscalMockup() {
  const rows = [
    { label: "Plus-values réalisées", value: "1 240 €" },
    { label: "À reporter case 2042", value: "1 240 €" },
    { label: "À reporter case 2074", value: "372 €" },
    { label: "Prélèvement (PFU)", value: "31,4 %" },
  ];
  return (
    <div className="w-full h-full bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-gray-900">Récap fiscal 2026</p>
        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded transition-transform group-hover:scale-105">
          PDF
        </span>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`flex items-center justify-between text-[11px] ${
              i === rows.length - 1 ? "pt-1.5 border-t border-slate-100" : ""
            }`}
          >
            <span className="text-gray-500">{r.label}</span>
            <span className="font-semibold text-gray-900 tabular-nums">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({
  mockup,
  title,
  desc,
  badge,
}: {
  mockup: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 shadow-card card-hover">
      {/* Zone mockup — hauteur fixe pour aligner la grille. Le mockup zoome
          légèrement au survol de la carte (interactivité douce). */}
      <div className="h-[172px] mb-4 rounded-xl bg-gradient-to-br from-primary-50/50 via-white to-slate-50 p-3">
        <div className="w-full h-full transition-transform duration-200 group-hover:scale-[1.015]">
          {mockup}
        </div>
      </div>
      <div className="px-1 pb-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {badge && (
            <span className="text-[9px] font-bold uppercase tracking-wide text-primary-700 bg-primary-100 border border-primary-200 px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Public ───────────────────────────────────────────────────────────────────

export function PremiumFeatureShowcase() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      <div className="text-center mb-10">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary-700 mb-3">
          <Sparkles size={14} />
          Concrètement
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          À quoi ressemble Premium
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
          Pas juste une ligne dans un tableau — voici ce que vous débloquez
          vraiment, et pourquoi ça change votre façon de piloter votre DCA.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FeatureCard
          mockup={<TrackingMockup />}
          title="Suivi mensuel de votre stratégie"
          badge="Le cœur de Premium"
          desc="Chaque mois, comparez votre portefeuille réel à votre projection théorique. Vous savez si vous êtes en avance, en retard, et de combien — avec un email récap automatique."
        />
        <FeatureCard
          mockup={<MonteCarloMockup />}
          title="Analyse Monte Carlo"
          desc="1 000 trajectoires de marché simulées avec la vraie volatilité des ETF. Vous voyez votre pire cas réaliste, votre meilleur cas, et votre probabilité exacte d'être en plus-value."
        />
        <FeatureCard
          mockup={<BacktestMockup />}
          title="Backtest historique"
          badge="Nouveau"
          desc="Ce qu'aurait VRAIMENT donné votre DCA sur les données réelles du MSCI World depuis 2009 — COVID et 2022 inclus. TRI calculé, pire creux affiché. Pas une projection théorique : du réel."
        />
        <FeatureCard
          mockup={<FiscalMockup />}
          title="Récap fiscal annuel"
          desc="Une synthèse PDF qui calcule pour vous les montants à reporter dans les cases 2042 et 2074, avec les bons prélèvements (PFU / PS) selon votre situation PEA ou CTO."
        />
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500 mb-4">
          Et aussi : comparaison A vs B, 10 simulations sauvegardées, export PDF
          sans filigrane, support email.
        </p>
        <Link
          href="#premium"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
        >
          Voir les tarifs Premium ↑
        </Link>
      </div>
    </section>
  );
}
