const TRUST_POINTS = [
  {
    icon: "🔢",
    title: "Formules vérifiables",
    body: "Le calcul de capitalisation mensuelle est documenté et auditable. Pas de magie, pas d'algorithme opaque.",
  },
  {
    icon: "⚠️",
    title: "Simulations étiquetées",
    body: "Chaque résultat affiché est clairement identifié comme hypothétique. Jamais de données simulées présentées comme réelles.",
  },
  {
    icon: "📡",
    title: "Source des données",
    body: "L'origine et le délai de chaque donnée de marché sont toujours affichés. Mode démo visible si aucune clé API n'est configurée.",
  },
  {
    icon: "🚫",
    title: "Pas de conseil personnalisé",
    body: "DCA Tracker est un outil informatif. Il ne remplace pas un conseiller financier agréé (CGP, CIF).",
  },
];

export function TrustSection() {
  return (
    <section className="py-20 bg-slate-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Transparent par conception
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            La confiance se construit avec l&apos;honnêteté, pas avec des
            promesses de rendement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_POINTS.map((p) => (
            <div key={p.title} className="flex flex-col gap-3">
              <span className="text-2xl">{p.icon}</span>
              <h3 className="font-semibold text-gray-900 text-sm">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
