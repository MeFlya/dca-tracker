import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";
import { PricingCards } from "./PricingCards";
import { PaymentBadge } from "@/components/ui/PaymentBadge";
import { Testimonials } from "@/components/home/Testimonials";

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
  {
    category: "Simulateur",
    rows: [
      { feature: "Simulation DCA mensuelle",               free: true,        premium: true   },
      { feature: "3 scénarios (conservateur/base/optimiste)", free: true,     premium: true   },
      { feature: "Durée jusqu'à 30 ans",                   free: true,        premium: true   },
      { feature: "Intégration TER automatique",            free: true,        premium: true   },
      { feature: "Analyse Monte Carlo (1 000 scénarios)",  free: false,       premium: true   },
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
    category: "Suivi & Sauvegarde",
    rows: [
      { feature: "Simulation sans compte requis",          free: true,        premium: true   },
      { feature: "Suivi mensuel de stratégie",             free: false,       premium: true   },
      { feature: "Simulations sauvegardées",               free: false,       premium: "10"   },
      { feature: "Emails mensuels de suivi",               free: false,       premium: true   },
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
    category: "Guides",
    rows: [
      { feature: "Guides PEA / CTO / fiscalité",           free: true,        premium: true   },
    ],
  },
  {
    category: "Support",
    rows: [
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
    a: "Tout ce que le plan Gratuit inclut, plus : Monte Carlo (1 000 scénarios), suivi mensuel de stratégie avec insights, comparaison A/B de deux stratégies, 10 simulations sauvegardées, export PDF sans filigrane, et emails mensuels personnalisés.",
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
      <span className="flex justify-center text-gray-300">
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
    <div className="py-12">
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

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center mb-16">
        <nav aria-label="Fil d'ariane" className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
          <span aria-hidden>/</span>
          <span className="text-gray-600" aria-current="page">Tarifs</span>
        </nav>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">Tarifs</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Commencez gratuitement. 7 jours Premium offerts.
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Le simulateur DCA et tous les guides restent gratuits pour toujours.
          Essayez Premium 7 jours sans frais — annulation en 1 clic si ça ne
          vous convient pas.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <PricingCards />
        <PaymentBadge />
      </div>

      {/* Feature comparison table */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Comparaison détaillée des fonctions
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 bg-gray-50 font-medium text-gray-400 border-b border-gray-100 w-2/3" />
                <th className="text-center px-4 py-3 bg-gray-50 font-semibold text-gray-600 border-b border-gray-100">Gratuit</th>
                <th className="text-center px-4 py-3 bg-primary-50 font-bold text-primary-700 border-b border-primary-100">Premium</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_SECTIONS.map((section) => (
                <>
                  <tr key={`cat-${section.category}`} className="bg-gray-50/80">
                    <td colSpan={3} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      {section.category}
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr key={row.feature} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">{row.feature}</td>
                      <td className="px-4 py-3"><CellValue value={row.free} /></td>
                      <td className="px-4 py-3 bg-primary-50/30"><CellValue value={row.premium} /></td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Why we built this */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8">
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

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Questions fréquentes</h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none">
                {q}
                <span className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
