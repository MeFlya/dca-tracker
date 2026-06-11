import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";
import { PricingCards } from "./PricingCards";
import { LifetimePricingCard } from "./LifetimePricingCard";
import { PremiumFeatureShowcase } from "@/components/tarifs/PremiumFeatureShowcase";
import { PaymentBadge } from "@/components/ui/PaymentBadge";
import { Testimonials } from "@/components/home/Testimonials";
import { LiveSocialProof } from "@/components/home/LiveSocialProof";

const TITLE = "Tarifs — DCA Tracker";
const DESCRIPTION =
  "Plan Gratuit et Premium. Simulez votre stratégie DCA en ETF gratuitement, upgradez pour le Monte Carlo, le suivi mensuel et la comparaison A vs B.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tarifs" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/tarifs", type: "website" },
};

// ─── Only real, shipped features ─────────────────────────────────────────────

const COMPARISON_SECTIONS = [
  // Le suivi mensuel en 1er — c'est ce qui justifie l'abonnement récurrent
  {
    category: "Suivi mensuel",
    rows: [
      { feature: "Suivi de stratégie mois après mois",      free: false,       premium: true   },
      { feature: "Insights automatiques (réel vs projection)", free: false,    premium: true   },
      { feature: "Email mensuel personnalisé",              free: false,       premium: true   },
      { feature: "Streak de mois consécutifs",              free: false,       premium: true   },
      { feature: "Simulations sauvegardées",                free: false,       premium: "10"   },
    ],
  },
  // La fiscalité en 2e — gros levier acquisition mai/juin
  {
    category: "Fiscalité",
    rows: [
      { feature: "Calculateur fiscal PEA vs CTO",           free: true,        premium: true   },
      { feature: "Comparaison net après impôt sur 30 ans",  free: true,        premium: true   },
      { feature: "Récap fiscal annuel (cases 2042 et 2074 calculées)", free: false, premium: true },
      { feature: "Suivi année par année des plus-values",   free: false,       premium: true   },
    ],
  },
  {
    category: "Simulateur",
    rows: [
      { feature: "Simulation DCA mensuelle",               free: true,        premium: true   },
      { feature: "3 scénarios (conservateur/base/optimiste)", free: true,     premium: true   },
      { feature: "Durée jusqu'à 30 ans",                   free: true,        premium: true   },
      { feature: "Intégration TER automatique",            free: true,        premium: true   },
      { feature: "Analyse Monte Carlo (1 000 scénarios)",  free: false,       premium: true   },
      { feature: "Backtest historique (DCA sur données réelles MSCI World)", free: false, premium: true },
      { feature: "Comparaison de scénarios A vs B",        free: false,       premium: true   },
    ],
  },
  {
    category: "ETF & Marchés",
    rows: [
      { feature: "Accès à tous les ETF",                   free: true,        premium: true   },
      { feature: "Fiches ETF détaillées",                  free: true,        premium: true   },
      { feature: "Données de marché (délai ~15 min)",      free: true,        premium: true   },
    ],
  },
  {
    category: "Export & Partage",
    rows: [
      { feature: "Lien de partage de simulation",          free: true,        premium: true   },
      { feature: "Export PDF",                             free: "Filigrané", premium: "Propre" },
    ],
  },
  {
    category: "Guides & Support",
    rows: [
      { feature: "Guides PEA / CTO / fiscalité",           free: true,        premium: true   },
      { feature: "Support par email",                      free: false,       premium: true   },
    ],
  },
];

const FAQ = [
  {
    q: "Comment fonctionne l'essai gratuit de 7 jours ?",
    a: "Vous activez Premium sans frais pendant 7 jours. Vous gardez le contrôle total : si vous annulez avant la fin du 7e jour, aucun prélèvement n'a lieu. Après les 7 jours, votre abonnement démarre au tarif choisi (mensuel ou annuel). Un moyen de paiement est requis pour confirmer l'essai, mais n'est débité qu'à l'issue de la période gratuite.",
  },
  {
    q: "Le plan Gratuit va-t-il devenir limité ?",
    a: "Non. Le simulateur DCA, les guides éducatifs et la comparaison ETF restent gratuits et complets. Notre modèle est freemium : le Premium ajoute des fonctions avancées sans rien retirer au plan Gratuit.",
  },
  {
    q: "Qu'est-ce que j'obtiens avec Premium ?",
    a: "Deux fonctions principales qui justifient l'abonnement : (1) le suivi mensuel de votre stratégie réelle — vous comparez chaque mois votre portefeuille au plan théorique, avec des insights automatiques et un email récapitulatif ; (2) le récap fiscal annuel — une synthèse PDF qui calcule les montants à reporter dans les cases 2042 et 2074 de votre déclaration. En complément : Monte Carlo (1 000 scénarios), comparaison A/B, 10 simulations sauvegardées, export PDF sans filigrane et support email.",
  },
  {
    q: "Le récap fiscal annuel : qu'est-ce que ça contient exactement ?",
    a: "Pour chaque année fiscale, une synthèse PDF qui contient : vos plus-values réalisées (PEA et CTO), les prélèvements applicables (PFU 30 % ou 17,2 % selon durée de détention), les montants à reporter dans les cases 2042 et 2074 de votre déclaration, et un export en CSV. Le calculateur PEA vs CTO public donne déjà un aperçu — la version Premium suit votre situation réelle année après année. Cette synthèse est une aide à la déclaration, pas un document fiscal officiel — elle ne remplace pas l'IFU fourni par votre courtier ni la consultation d'un expert-comptable pour les cas complexes.",
  },
  {
    q: "Les simulations sauvegardées sont-elles accessibles sur tous mes appareils ?",
    a: "Les sauvegardes sont actuellement stockées sur votre appareil (localStorage). L'accès cross-device via votre compte est sur notre roadmap.",
  },
  {
    q: "Peut-on annuler à tout moment ?",
    a: "Oui. Pas d'engagement, pas de frais de résiliation. Si vous choisissez l'abonnement annuel, vous conservez l'accès jusqu'à la fin de la période payée.",
  },
  {
    q: "Mes données sont-elles protégées ?",
    a: "Vos données de simulation ne sont jamais vendues à des tiers. L'hébergement est en Europe. La création de compte est optionnelle — vous pouvez simuler sans compte sur le plan Gratuit.",
  },
  {
    q: "Le pricing inclut-il la TVA ?",
    a: "Oui, tous les prix affichés sont TTC (TVA française de 20 % incluse).",
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="flex justify-center">
        <svg className="w-4 h-4 text-gain-default" viewBox="0 0 16 16" fill="none" aria-label="Inclus">
          <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
          <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="flex justify-center text-gray-500">
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-label="Non inclus">
          <path d="M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex justify-center text-xs font-semibold text-gray-700">{value}</span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TarifsPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: TITLE,
        description: DESCRIPTION,
        url: `${siteUrl}/tarifs`,
        provider: { "@type": "Organization", name: "DCA Tracker", url: siteUrl },
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }} />

      {/* ── Premium section — hero + pricing cards on dark (émotionnel) ──
          Wrapped in a single opaque slate-950 section so the AmbientBackground
          mesh can't leak through. Same visual language as TrackingPitch
          (dot grid + radial glow) for brand coherence. */}
      <section className="relative bg-slate-950 pt-12 pb-20 overflow-hidden">
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />
        {/* Radial glows (no blur filter → cheap) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: [
              "radial-gradient(800px circle at 15% 20%, rgba(59, 130, 246, 0.18), transparent 55%)",
              "radial-gradient(900px circle at 85% 75%, rgba(99, 102, 241, 0.15), transparent 55%)",
            ].join(", "),
          }}
          aria-hidden
        />

        {/* Hero */}
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center mb-16">
          <nav aria-label="Fil d'ariane" className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-8">
            <Link href="/" className="hover:text-slate-200 transition-colors">Accueil</Link>
            <span aria-hidden>/</span>
            <span className="text-slate-200" aria-current="page">Tarifs</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-300 mb-3">Tarifs</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Suivez votre DCA. Optimisez votre fiscalité.
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Le simulateur reste gratuit pour toujours. Premium ajoute le{" "}
            <strong className="text-white">suivi mensuel</strong> de votre
            stratégie réelle et le{" "}
            <strong className="text-white">récap fiscal annuel</strong> pour
            votre déclaration — 7 jours d&apos;essai sans frais.
          </p>
          {/* 3 mini-points qui résument les 3 vrais bénéfices Premium */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="w-1 h-1 rounded-full bg-primary-400" />
              Suivi mensuel automatique
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="w-1 h-1 rounded-full bg-primary-400" />
              Récap fiscal cases 2042 + 2074
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="w-1 h-1 rounded-full bg-primary-400" />
              Monte Carlo 1 000 scénarios
            </span>
          </div>
        </div>

        {/* Lifetime Deal — feature-flagged, returns null when disabled */}
        <LifetimePricingCard />

        {/* Pricing cards */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <PricingCards />
          <PaymentBadge />
        </div>
      </section>

      {/* ── Analytical section — white opaque (fonctionnel/lecture) ──
          Clean cut from dark → white for a premium "layered" feel. */}
      <section className="relative bg-white py-20">
        {/* Aperçus visuels des features Premium — la preuve concrète AVANT
            le tableau comparatif (qui reste dry). Levier de conversion : le
            free voit à quoi ça ressemble. */}
        <PremiumFeatureShowcase />

        {/* Séparateur galerie ↔ tableau comparatif — ligne dégradée discrète */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
        </div>

        {/* Feature comparison table */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Comparaison détaillée des fonctions
          </h2>
          {/* overflow-x-auto (pas hidden) : la table comparative déborde sur
              mobile — elle doit scroller horizontalement, pas être coupée. */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-card">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 bg-white font-medium text-gray-500 border-b border-slate-200 w-2/3" />
                  <th className="text-center px-4 py-3 bg-white font-semibold text-gray-700 border-b border-slate-200">
                    Gratuit
                  </th>
                  <th className="text-center px-4 py-3 bg-slate-950 font-bold text-white border-b border-slate-950 relative">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-breathe" />
                      Premium
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_SECTIONS.map((section) => (
                  <React.Fragment key={`cat-${section.category}`}>
                    <tr className="bg-slate-50">
                      <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-slate-200/60">
                        {section.category}
                      </td>
                    </tr>
                    {section.rows.map((row) => (
                      <tr key={row.feature} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors bg-white">
                        <td className="px-4 py-3 text-gray-700">{row.feature}</td>
                        <td className="px-4 py-3"><CellValue value={row.free} /></td>
                        <td className="px-4 py-3 bg-slate-950/5"><CellValue value={row.premium} /></td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Why we built this — opaque white card on white section */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
          <div className="rounded-2xl bg-white border border-slate-200/70 shadow-card p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pourquoi un outil payant ?</h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                DCA Tracker est développé de manière indépendante — sans investisseurs, sans publicité, sans revente de données. Pour maintenir et améliorer l&apos;outil sur le long terme, un modèle économique viable est nécessaire.
              </p>
              <p>
                Notre engagement : le simulateur, les guides et la comparaison ETF restent{" "}
                <strong>gratuits et complets pour toujours</strong>. Le Premium finance le développement de fonctions plus complexes qui demandent une infrastructure dédiée.
              </p>
              <p>
                Les prix sont volontairement bas — moins d&apos;un café par mois pour Premium — parce que notre audience investit déjà intelligemment, en ETF à faibles frais. Il serait contradictoire de vous facturer une fortune.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials — auto-hidden until populated */}
        <Testimonials />

        {/* Social proof — auto-hidden quand stats <5 users (LiveSocialProof) */}
        <LiveSocialProof />

        {/* FAQ — mt-16 pour aérer après LiveSocialProof (qui a sa propre
            border-y et pas de margin-bottom interne, sinon "trop collé"). */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border border-slate-200/70 bg-white shadow-card overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none">
                  {q}
                  <span className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50">{a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* Teaser produits one-shot — POSITIONNEMENT DÉLIBÉRÉ en toute fin de
            page : capte les "non" à l'abonnement au moment où ils repartent,
            sans distraire les hésitants du funnel Premium au-dessus.
            Ne JAMAIS remonter ce bloc au niveau des cartes de prix. */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-16">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-sm font-bold text-gray-900 mb-1.5">
              Pas prêt pour un abonnement ?
            </p>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed max-w-md mx-auto">
              Template de suivi DCA (Excel/Google Sheets) et guide pour
              démarrer — en paiement unique, sans compte.
            </p>
            <Link
              href="/produits"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 underline-offset-4 hover:underline transition-colors"
            >
              Voir les ressources en paiement unique →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
