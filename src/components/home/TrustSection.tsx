// Icon tiles uniformisés : 1 seul bg (bg-primary-500/10) pour les 4.
// Les icônes SVG gardent leurs strokes individuels (variety discrète,
// intentionnelle sur le détail). Alignement visuel immédiat avec les
// icônes des sections TrackingPitch et PremiumFix.
const TRUST_POINTS = [
  {
    icon: <FormulaIcon />,
    title: "Formules vérifiables",
    body: "Le calcul de capitalisation mensuelle est documenté et auditable. Pas de magie, pas d'algorithme opaque.",
  },
  {
    icon: <LabelIcon />,
    title: "Simulations clairement étiquetées",
    body: "Chaque résultat est identifié comme hypothétique. Jamais de données simulées présentées comme des cours réels.",
  },
  {
    icon: <SourceIcon />,
    title: "Source des données affichée",
    body: "L'origine et le délai de chaque donnée de marché sont toujours visibles. Mode démo explicite sans clé API.",
  },
  {
    icon: <ShieldIcon />,
    title: "Pas de conseil personnalisé",
    body: "DCA Tracker projette et suit votre stratégie. Il ne remplace pas un conseiller financier agréé (CGP, CIF).",
  },
] as const;

export function TrustSection() {
  return (
    <section className="py-20 bg-slate-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-700 mb-3">
            Nos engagements
          </p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Transparent par conception
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            La confiance se construit avec l&apos;honnêteté, pas avec des
            promesses de rendement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST_POINTS.map((p) => (
            <div key={p.title} className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                {p.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function FormulaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 6h12M4 10h8M4 14h6" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15" cy="13.5" r="2.5" stroke="#1d4ed8" strokeWidth="1.5" />
      <path d="M17 15.5l1.5 1.5" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LabelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 0 1.414l-5.586 5.586a1 1 0 0 1-1.414 0L3.293 9.707A1 1 0 0 1 3 9V5Z"
        stroke="#b45309"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1" fill="#b45309" />
    </svg>
  );
}

function SourceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="#7c3aed" strokeWidth="1.5" />
      <path d="M3 8h14" stroke="#7c3aed" strokeWidth="1.5" />
      <path d="M7 12h6" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 14.5h4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5L4 5v5c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V5L10 2.5Z"
        stroke="#059669"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10.5l1.5 1.5 3-3"
        stroke="#059669"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
