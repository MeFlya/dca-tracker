import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { PricingCards } from "./PricingCards";

const TITLE = "Tarifs — DCA Tracker";
const DESCRIPTION =
  "Plan Gratuit, Premium et Pro. Simulez votre stratégie DCA en ETF gratuitement, upgradez pour les fonctions avancées : sauvegarde, calculateur fiscal, suivi de portefeuille.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tarifs" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/tarifs",
    type: "website",
  },
};

// ─── Feature comparison table data ───────────────────────────────────────────

const COMPARISON_SECTIONS = [
  {
    category: "Simulateur",
    rows: [
      { feature: "Simulation DCA mensuelle",              free: true,  premium: true,  pro: true  },
      { feature: "3 scénarios (conservateur/base/optimiste)", free: true, premium: true, pro: true },
      { feature: "Durée jusqu'à 30 ans",                  free: true,  premium: true,  pro: true  },
      { feature: "Intégration TER automatique",           free: true,  premium: true,  pro: true  },
      { feature: "Comparaison de scénarios A vs B",       free: false, premium: "soon", pro: "soon" },
      { feature: "Simulation multi-ETF pondérée",         free: false, premium: false,  pro: "soon" },
      { feature: "Monte Carlo (1 000+ scénarios)",        free: false, premium: false,  pro: "soon" },
    ],
  },
  {
    category: "ETF & Marchés",
    rows: [
      { feature: "Accès à tous les ETF",                  free: true,  premium: true,  pro: true  },
      { feature: "Fiches ETF détaillées",                 free: true,  premium: true,  pro: true  },
      { feature: "Données de marché (délai 15 min)",      free: true,  premium: true,  pro: true  },
      { feature: "Données en temps réel",                 free: false, premium: "soon", pro: "soon" },
    ],
  },
  {
    category: "Sauvegarde & Compte",
    rows: [
      { feature: "Simulation sans compte requis",         free: true,  premium: true,  pro: true  },
      { feature: "Simulations sauvegardées",              free: false, premium: "10 slots (bientôt)", pro: "Illimité (bientôt)" },
      { feature: "Suivi de portefeuille réel",            free: false, premium: false,  pro: "soon" },
    ],
  },
  {
    category: "Export & Partage",
    rows: [
      { feature: "Lien de partage de simulation",         free: true,  premium: true,  pro: true  },
      { feature: "Export PDF",                            free: "Filigrané", premium: "Propre", pro: "Propre" },
    ],
  },
  {
    category: "Fiscalité",
    rows: [
      { feature: "Guides PEA / CTO / fiscalité",          free: true,  premium: true,  pro: true  },
      { feature: "Calculateur d'avantage fiscal PEA/CTO", free: false, premium: "soon", pro: "soon" },
      { feature: "Récapitulatif fiscal annuel",           free: false, premium: false,  pro: "soon" },
    ],
  },
  {
    category: "Notifications & Support",
    rows: [
      { feature: "Rappels DCA automatiques par email",    free: false, premium: "soon", pro: "soon" },
      { feature: "Support par email",                     free: false, premium: true,  pro: true  },
      { feature: "Support prioritaire",                   free: false, premium: false,  pro: true  },
      { feature: "Accès anticipé nouvelles fonctions",    free: false, premium: false,  pro: true  },
    ],
  },
];

const FAQ = [
  {
    q: "Quand les fonctions Premium seront-elles disponibles ?",
    a: "Le lancement du plan Premium est prévu courant 2025. Rejoignez la liste d'accès anticipé pour être notifié en premier et potentiellement bénéficier d'un tarif de lancement préférentiel.",
  },
  {
    q: "Le plan Gratuit va-t-il devenir payant ou limité ?",
    a: "Non. Le simulateur DCA, les guides éducatifs et la comparaison ETF resteront gratuits et complets. Notre modèle est freemium : le Premium ajoute des fonctions avancées sans retirer ce qui existe déjà.",
  },
  {
    q: "Quelle est la différence entre Premium et Pro ?",
    a: "Premium est conçu pour l'investisseur régulier qui veut sauvegarder ses simulations, obtenir des PDF propres et optimiser sa fiscalité. Pro ajoute des outils d'analyse avancés (Monte Carlo, suivi de portefeuille réel, récapitulatif fiscal annuel) pour les investisseurs avec un portefeuille plus conséquent.",
  },
  {
    q: "Peut-on annuler à tout moment ?",
    a: "Oui. Pas d'engagement, pas de frais de résiliation. Si vous choisissez l'abonnement annuel, vous conservez l'accès jusqu'à la fin de la période payée.",
  },
  {
    q: "Mes données sont-elles protégées ?",
    a: "Vos données de simulation ne sont jamais vendues à des tiers. L'hébergement est en Europe. La création de compte sera optionnelle — vous pourrez continuer à simuler sans compte sur le plan Gratuit.",
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
  if (value === "soon") {
    return (
      <span className="flex justify-center">
        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Bientôt</span>
      </span>
    );
  }
  // String value
  return (
    <span className="flex justify-center text-xs font-medium text-gray-600">{value}</span>
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
        "name": TITLE,
        "description": DESCRIPTION,
        "url": `${siteUrl}/tarifs`,
        "provider": { "@type": "Organization", "name": "DCA Tracker", "url": siteUrl },
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      }} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center mb-16">
        <nav aria-label="Fil d'ariane" className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
          <span aria-hidden>/</span>
          <span className="text-gray-600" aria-current="page">Tarifs</span>
        </nav>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
          Tarifs
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Commencez gratuitement. Upgradez quand vous êtes prêt.
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Le simulateur DCA et tous les guides restent gratuits pour toujours.
          Le Premium débloque les fonctions qui font la différence sur le long terme.
        </p>
      </div>

      {/* ── Pricing cards ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <PricingCards />
      </div>

      {/* ── "En construction" notice ──────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Transparence :</strong> DCA Tracker est en développement actif. Les plans Premium et Pro sont en cours de construction —{" "}
            les fonctions marquées{" "}
            <span className="inline-flex items-center mx-1">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Bientôt</span>
            </span>{" "}
            seront disponibles progressivement en 2025. Rejoindre la liste d&apos;accès anticipé vous garantit d&apos;être notifié en premier et de bénéficier du tarif de lancement.
          </p>
        </div>
      </div>

      {/* ── Feature comparison table ──────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Comparaison détaillée des fonctions
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 bg-gray-50 font-medium text-gray-400 border-b border-gray-100 w-1/2"></th>
                <th className="text-center px-4 py-3 bg-gray-50 font-semibold text-gray-600 border-b border-gray-100">Gratuit</th>
                <th className="text-center px-4 py-3 bg-primary-50 font-bold text-primary-700 border-b border-primary-100">Premium</th>
                <th className="text-center px-4 py-3 bg-slate-800 font-bold text-white border-b border-slate-700">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_SECTIONS.map((section) => (
                <>
                  <tr key={`cat-${section.category}`} className="bg-gray-50/80">
                    <td colSpan={4} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      {section.category}
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr key={row.feature} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">{row.feature}</td>
                      <td className="px-4 py-3"><CellValue value={row.free} /></td>
                      <td className="px-4 py-3 bg-primary-50/30"><CellValue value={row.premium} /></td>
                      <td className="px-4 py-3 bg-slate-50"><CellValue value={row.pro} /></td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Why we built this ─────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Pourquoi un outil payant ?
          </h2>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              DCA Tracker est développé de manière indépendante — sans
              investisseurs, sans publicité, sans revente de données. Pour
              maintenir et améliorer l&apos;outil sur le long terme, un
              modèle économique viable est nécessaire.
            </p>
            <p>
              Notre engagement : le simulateur, les guides et la comparaison
              ETF restent <strong>gratuits et complets pour toujours</strong>.
              Le Premium finance le développement de fonctions plus complexes
              (sauvegarde, calculateur fiscal, suivi de portefeuille) qui
              demandent une infrastructure dédiée.
            </p>
            <p>
              Les prix sont volontairement bas — moins d&apos;un café par mois
              pour Premium — parce que notre audience investit déjà
              intelligemment, en ETF à faibles frais. Il serait contradictoire
              de vous facturer une fortune.
            </p>
          </div>
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Questions fréquentes
        </h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl border border-gray-100 bg-white overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none">
                {q}
                <span className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                {a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* ── Waitlist email capture ─────────────────────────────────────────── */}
      <div id="acces-anticipe" className="max-w-3xl mx-auto px-4 sm:px-6 mb-12">
        <div className="rounded-2xl bg-primary-600 p-8 text-center mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-300 mb-2">
            Accès anticipé Premium & Pro
          </p>
          <h2 className="text-2xl font-bold text-white mb-3">
            Rejoignez la liste d&apos;accès anticipé
          </h2>
          <p className="text-primary-200 text-sm leading-relaxed mb-6">
            Soyez parmi les premiers à accéder aux fonctions Premium.
            Les membres de la liste anticipée bénéficieront d&apos;un
            tarif de lancement préférentiel.
          </p>
        </div>
        <EmailCapture source="pricing_waitlist" />
      </div>

    </div>
  );
}
