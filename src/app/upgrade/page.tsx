import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passer Premium — DCA Tracker",
  robots: { index: false, follow: false },
};

// ─── Feature config ───────────────────────────────────────────────────────────

type FeatureKey = "monte-carlo" | "save-strategy" | "pdf-export" | "ab-comparison";

const FEATURES: Record<FeatureKey, {
  plan: "Premium" | "Pro";
  planColor: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  benefit: string;
  example: string;
}> = {
  "monte-carlo": {
    plan: "Premium",
    planColor: "bg-primary-600",
    icon: "📊",
    title: "Analyse Monte Carlo",
    subtitle: "1 000 marchés simulés, pas juste un scénario moyen",
    description:
      "L'analyse Monte Carlo simule 1 000 trajectoires de marché différentes pour votre stratégie. Vous voyez la distribution complète des résultats possibles — pas juste une projection optimiste.",
    benefit:
      "Comprenez le vrai risque de votre stratégie : dans le pire scénario, combien vous reste-t-il ? Dans le meilleur ? Quelle est la probabilité d'être en plus-value après 20 ans ?",
    example:
      "Pour 200 €/mois sur 20 ans : pire cas réaliste ≈ 68 000 € · médiane ≈ 102 000 € · meilleur cas ≈ 158 000 €",
  },
  "save-strategy": {
    plan: "Premium",
    planColor: "bg-primary-600",
    icon: "💾",
    title: "Sauvegarder ma stratégie",
    subtitle: "Suivez votre progression dans le temps",
    description:
      "Sauvegardez votre stratégie DCA et enregistrez votre portefeuille chaque mois. Le dashboard compare votre progression réelle à la projection théorique.",
    benefit:
      "Transformez le simulateur en outil de suivi personnel. Savoir si vous êtes en avance ou en retard sur votre plan est la différence entre une stratégie suivie et une stratégie abandonnée.",
    example:
      "Mois 6 — Valeur théorique : 1 247 € · Votre portefeuille : 1 380 € → En avance de +133 €",
  },
  "pdf-export": {
    plan: "Premium",
    planColor: "bg-primary-600",
    icon: "📄",
    title: "Export PDF professionnel",
    subtitle: "Sans filigrane, prêt à partager",
    description:
      "Exportez votre simulation complète en PDF propre, sans filigrane DCA Tracker. Inclut les 3 scénarios, le graphique de projection et les hypothèses détaillées.",
    benefit:
      "Partagez vos projections avec votre conseiller, votre partenaire ou archivez-les pour les comparer dans le futur. Un document soigné, pas un export amateur.",
    example:
      "PDF 2 pages : résumé + graphique de projection · Paramètres visibles · Hypothèses transparentes",
  },
  "ab-comparison": {
    plan: "Pro",
    planColor: "bg-slate-800",
    icon: "⚖️",
    title: "Comparaison A vs B",
    subtitle: "Simulez deux stratégies en parallèle",
    description:
      "Comparez deux stratégies DCA côte à côte : différents montants, durées ou rendements. Voyez instantanément l'impact de chaque paramètre sur le résultat final.",
    benefit:
      "Répondez aux vraies questions : investir 200 €/mois pendant 25 ans vaut-il mieux que 300 €/mois pendant 20 ans ? Quel impact si j'augmente mon rendement cible de 1 % ?",
    example:
      "Stratégie A : 200 €/mois · 20 ans · 7 % → 102 000 € vs Stratégie B : 300 €/mois · 15 ans · 7 % → 98 000 €",
  },
};

const FALLBACK_FEATURE = FEATURES["monte-carlo"];

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = {
  searchParams: Promise<{ feature?: string }>;
};

export default async function UpgradePage({ searchParams }: Props) {
  const { feature } = await searchParams;
  const key = (feature ?? "") as FeatureKey;
  const feat = FEATURES[key] ?? FALLBACK_FEATURE;

  const isPro = feat.plan === "Pro";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">

        {/* Back link */}
        <Link
          href="/simulateur"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour au simulateur
        </Link>

        {/* Plan badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full text-white ${feat.planColor}`}>
            {feat.plan}
            {isPro && <span className="opacity-80">— 9,90 €/mois</span>}
            {!isPro && <span className="opacity-80">— 4,90 €/mois</span>}
          </span>
        </div>

        {/* Hero */}
        <div className="text-5xl mb-5">{feat.icon}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{feat.title}</h1>
        <p className="text-lg text-gray-500 mb-8 leading-relaxed">{feat.subtitle}</p>

        {/* Description */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 mb-5 shadow-sm">
          <p className="text-gray-700 leading-relaxed mb-5">{feat.description}</p>

          {/* Example block */}
          <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3">
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1">
              Exemple
            </p>
            <p className="text-sm text-primary-800 leading-relaxed">{feat.example}</p>
          </div>
        </div>

        {/* Benefit */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 mb-8">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            Pourquoi ça change tout
          </p>
          <p className="text-emerald-900 leading-relaxed">{feat.benefit}</p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/tarifs${isPro ? "#pro" : "#premium"}`}
            className="btn-primary text-base px-8 py-3.5 text-center"
          >
            Passer {feat.plan} — {isPro ? "9,90 €" : "4,90 €"}/mois →
          </Link>
          <Link
            href="/simulateur"
            className="btn-secondary text-base px-6 py-3.5 text-center"
          >
            Continuer en Gratuit
          </Link>
        </div>

        {/* Trust line */}
        <p className="text-xs text-gray-400 mt-5 text-center">
          Sans engagement · Annulation à tout moment · Accès immédiat
        </p>

        {/* Other premium features teaser */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {feat.plan} inclut aussi
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(FEATURES)
              .filter(([k, f]) => k !== key && f.plan === feat.plan)
              .map(([k, f]) => (
                <Link
                  key={k}
                  href={`/upgrade?feature=${k}`}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
                >
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {f.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.subtitle}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
