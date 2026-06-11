import type { Metadata } from "next";
import Link from "next/link";
import { AllocationClient } from "./AllocationClient";
import { JsonLd } from "@/components/ui/JsonLd";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { ETF_LIST } from "@/lib/etf-config";

const TITLE = "Allocation portefeuille ETF — Construisez et simulez votre mix";
const DESCRIPTION =
  "Combinez 2 à 5 ETF avec leurs poids et voyez en temps réel votre rendement attendu, vos frais pondérés et la projection sur 30 ans. Presets 80/20, 70/20/10, monde + small caps. Gratuit, sans inscription.";
const CANONICAL = "/allocation-portefeuille";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "website",
    images: [{ url: "https://dcatracker.fr/og-image.jpg", width: 1200, height: 630 }],
  },
};

const FAQ = [
  {
    q: "Combien d'ETF faut-il dans un portefeuille DCA ?",
    a: "Un seul ETF mondial (MSCI World ou FTSE All-World) suffit largement pour la majorité des investisseurs débutants — il couvre déjà ~1 500 à 3 700 entreprises dans 23 à 49 pays. Au-delà, ajouter 1 à 2 ETF complémentaires (émergents, small caps, obligations) peut affiner le profil mais multiplie le suivi. Plus de 5 ETF n'apporte que rarement un avantage net après frais et complexité.",
  },
  {
    q: "Faut-il intégrer les marchés émergents ?",
    a: "Le MSCI World seul exclut les pays émergents (Chine, Inde, Brésil, etc.) — soit ~10 % de la capitalisation mondiale. Ajouter 10-20 % d'émergents donne une exposition plus complète au marché global. La volatilité est plus élevée mais les retours long-terme historiques sont comparables (~7-9 %/an). Le FTSE All-World (VWCE) intègre déjà émergents + développés en un seul ETF — alternative pratique au mix CW8 + AEEM.",
  },
  {
    q: "Le portefeuille 70/20/10, c'est quoi exactement ?",
    a: "Une allocation classique : 70 % d'actions monde développé (MSCI World), 20 % d'émergents, 10 % d'obligations. Conçue pour les profils long-terme qui veulent une diversification équilibrée. Les 10 % obligations apportent de la stabilité en cas de baisse boursière prolongée. Sur 20-30 ans en DCA, ce mix produit historiquement ~7 % net.",
  },
  {
    q: "Faut-il ajouter des obligations en DCA long-terme ?",
    a: "Pour un horizon de 25 ans et plus, beaucoup d'études (incluant Vanguard) recommandent 100 % actions car les obligations sous-performent à très long terme. À l'approche de l'horizon de retrait (5-10 ans avant), introduire 20-40 % d'obligations réduit le risque de séquence (vendre dans un marché baissier). En DCA actif (encore en phase d'accumulation), c'est souvent superflu.",
  },
  {
    q: "Comment rééquilibrer mon portefeuille ?",
    a: "Le rééquilibrage consiste à ramener vos poids cibles quand un ETF devient sur-pondéré (ex: après une forte hausse). Trois méthodes : (1) versement seul — diriger les nouvelles contributions vers l'ETF sous-pondéré ; (2) calendaire — vendre/acheter une fois par an pour ramener au target ; (3) seuil — déclencher dès qu'un ETF dérive de plus de 5 %. La méthode (1) est la moins coûteuse fiscalement (pas de PV imposable) et la plus simple en DCA.",
  },
  {
    q: "Quels ETF sont éligibles au PEA ?",
    a: "Le PEA n'accepte que les ETF investis à au moins 75 % en actions de l'UE. Les ETF synthétiques (réplication par swap) contournent cette règle légalement et permettent d'accéder à des indices mondiaux : CW8 (MSCI World), 500 (S&P 500 d'Amundi), AEEM (Émergents). Les ETF physiques comme VWCE, IWDA, SPY ne sont PAS éligibles PEA — il faut les loger en CTO. Notre comparateur affiche le statut PEA de chaque ETF.",
  },
  {
    q: "Le rendement attendu pondéré : sur quoi est-il basé ?",
    a: "Sur les retours historiques long-terme par région (sources : MSCI, et les Long-Term Capital Market Assumptions de Vanguard et JP Morgan) : MSCI World 7,5 %/an, S&P 500 9 %/an, Émergents 8 %/an, Europe 6 %/an, Japon 5 %/an, Small Caps 8,5 %/an, Obligations 3 %/an. Ces chiffres sont conservateurs — la performance réelle dépend du timing, de l'inflation et des cycles de marché. Aucune garantie sur le futur.",
  },
];

export default function AllocationPortefeuillePage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    // Wrapper bg-white opaque — page de calcul/lecture, fond calme
    // qui stoppe le leak AmbientBackground.
    <div className="bg-white">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Allocation portefeuille ETF",
          url: `${siteUrl}${CANONICAL}`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web browser",
          inLanguage: "fr-FR",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          },
          description:
            "Construisez un portefeuille pondéré de 2 à 5 ETF, simulez le rendement et le TER blendé sur 30 ans en DCA.",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Fil d'ariane"
          className="flex items-center gap-2 text-sm text-gray-500 mb-3"
        >
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <span className="text-gray-700" aria-current="page">
            Allocation portefeuille
          </span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
            Construire un portefeuille
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Mixez plusieurs ETF, voyez votre rendement pondéré
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            Choisissez 2 à 5 ETF, ajustez les poids, et obtenez en temps réel
            le TER moyen, le rendement attendu et la projection sur 30 ans.
            Comparez à un mono-ETF MSCI World pour mesurer la différence.
          </p>
        </header>

        {/* Calculator (interactive) */}
        <AllocationClient etfs={ETF_LIST} />

        {/* SEO content + FAQ */}
        <section className="mt-20 space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pourquoi diversifier au-delà du MSCI World ?
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                Le MSCI World est le standard de facto pour la majorité des
                investisseurs DCA français. Il couvre ~1 500 grandes
                entreprises de 23 pays développés — déjà très diversifié. Mais
                il a deux angles morts :
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Pas de marchés émergents</strong> (Chine, Inde,
                  Brésil) : ~10 % du capital mondial absent. Ajouter un ETF
                  Émergents (AEEM, PAEEM) ou passer au FTSE All-World (VWCE,
                  qui intègre les deux).
                </li>
                <li>
                  <strong>Sous-pondération des small caps</strong> : le MSCI
                  World ne contient que des grandes capitalisations. Ajouter
                  10 % de small caps mondiales (IUSN, RS2K) capte le premium
                  historique observé sur ce segment.
                </li>
              </ul>
              <p>
                À l&apos;inverse, multiplier les ETF complique le suivi et
                augmente le coût de rééquilibrage. <strong>2 à 3 ETF</strong>{" "}
                est généralement le sweet spot pour la majorité des profils.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PresetCard
              title="80/20 Monde + Émergents"
              description="Ajoute la croissance émergente sans trop de volatilité."
              return_="7,6 %"
            />
            <PresetCard
              title="70/20/10 Diversifié"
              description="Le mix équilibré 3 piliers — actions monde, émergents, obligations."
              return_="6,9 %"
            />
            <PresetCard
              title="90/10 Small Caps"
              description="MSCI World + 10 % small caps pour capter le premium historique."
              return_="7,6 %"
            />
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Questions fréquentes
            </h2>
            <div className="space-y-3">
              {FAQ.map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-2xl border border-slate-200/70 bg-white shadow-card overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-slate-50 transition-colors list-none">
                    {q}
                    <span className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                      ▾
                    </span>
                  </summary>
                  <div className="px-5 pb-4 pt-1 text-sm text-gray-700 leading-relaxed border-t border-gray-50">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Internal linking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/simulateur"
              className="group rounded-2xl border border-slate-200/70 bg-white p-5 hover:border-primary-200 transition-colors"
            >
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
                Étape suivante
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                Simuler le DCA en détail →
              </p>
              <p className="text-sm text-gray-600">
                Une fois votre allocation choisie, projetez sur 30 ans avec
                3 scénarios.
              </p>
            </Link>
            <Link
              href="/calculateur-fiscal-pea-cto"
              className="group rounded-2xl border border-slate-200/70 bg-white p-5 hover:border-primary-200 transition-colors"
            >
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
                Pour aller plus loin
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                Calculateur fiscal PEA vs CTO →
              </p>
              <p className="text-sm text-gray-600">
                Comparez l&apos;impôt selon le compte que vous choisissez.
              </p>
            </Link>
          </div>

          <Disclaimer />
        </section>
      </div>
    </div>
  );
}

// ─── Sub-component for the preset cards in the SEO content section ──────────

function PresetCard({
  title,
  description,
  return_,
}: {
  title: string;
  description: string;
  return_: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5">
      <p className="font-semibold text-gray-900 mb-1">{title}</p>
      <p className="text-xs text-gray-600 leading-relaxed mb-3">{description}</p>
      <div className="flex items-baseline justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-gray-500">Rendement attendu</span>
        <span className="text-sm font-bold text-primary-700 tabular-nums">
          {return_}/an
        </span>
      </div>
    </div>
  );
}
