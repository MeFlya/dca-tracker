import type { Metadata } from "next";
import { SimulatorPageClient } from "./SimulatorPageClient";
import { getUserSubscription, isPremium } from "@/lib/subscription";
import { JsonLd } from "@/components/ui/JsonLd";
import { runSimulation, formatEur } from "@/lib/simulator";
import { paramsFromSearch } from "@/lib/simulation-params";

// CTR (audit 07/2026) : « gratuit » en tête — tous les concurrents de la SERP
// l'affichent — et un title court qui ne se fait pas tronquer (~55 car. utiles).
const TITLE = "Simulateur DCA ETF gratuit : 3 scénarios, sans inscription";
const DESCRIPTION =
  "Versement mensuel, durée, rendement : projection immédiate avec intérêts composés et 3 scénarios de marché. Gratuit, sans inscription, formules publiques.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/simulateur" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/simulateur",
    type: "website",
    // OG image générée par convention via simulateur/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Simulez vos versements mensuels en ETF avec les intérêts composés. 3 scénarios, graphique interactif, export PDF. Gratuit.",
  },
};

// Reading searchParams here marks the route as dynamic, which is what we want —
// the simulator output depends on the URL params. Bots get the real numbers
// in the initial HTML instead of "Chargement de la simulation…".
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SimulateurPage({ searchParams }: Props) {
  // Le plan est décidé ICI, côté serveur, et descendu en prop.
  // Avant, SimulatorPageClient le lisait via useUser().publicMetadata côté
  // navigateur : falsifiable en une ligne de console. Seul le booléen traverse,
  // aucune donnée personnelle.
  //
  // Repli en « gratuit » si la lecture échoue : /simulateur est la page à plus
  // fort trafic du site et elle doit rester servie même si l'authentification
  // est indisponible. Le sens du repli est le bon — un incident n'ouvre jamais
  // une fonctionnalité payante.
  const premium = await getUserSubscription()
    .then((sub) => isPremium(sub.plan))
    .catch(() => false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

  // ── Server-side computation of the simulation ─────────────────────────────
  // Params from URL → paramsFromSearch → runSimulation. All pure, all SSR-safe.
  const raw = await searchParams;
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string") search.set(k, v);
    else if (Array.isArray(v) && v[0]) search.set(k, v[0]);
  }
  const shareParams = paramsFromSearch(search);
  const initialOutput = runSimulation({
    ...shareParams.input,
    annualInflationPct: shareParams.inflationEnabled
      ? shareParams.input.annualInflationPct
      : undefined,
  });

  const { input, base } = initialOutput;
  const gains = base.finalValue - base.totalInvested;
  const multiplier = base.totalInvested > 0 ? base.finalValue / base.totalInvested : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <a href="/" className="hover:text-gray-600 transition-colors">Accueil</a>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Simulateur DCA</span>
      </nav>

      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {/* Le H1 doit porter le SUJET de la page, pas la promesse
              émotionnelle : il reprend l'intention de recherche (« simulateur
              DCA », « ETF ») que l'ancien « Projetez votre futur financier » ne
              contenait nulle part. La promesse vit dans le sous-titre. */}
          Simulateur DCA : combien vaudra votre investissement en ETF ?
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Ajustez les curseurs — votre projection se met à jour en temps réel.
          Basé sur la mécanique des intérêts composés et les données historiques ETF.
        </p>
      </div>

      {/* ── No-JS fallback ───────────────────────────────────────────────── */}
      {/* Only visible when JS is disabled. Regular users see SimulatorPageClient. */}
      <noscript>
        <div className="mb-8 rounded-2xl bg-amber-50 border border-amber-200 p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">
            JavaScript désactivé — affichage statique
          </p>
          <p className="text-sm text-amber-800 leading-relaxed mb-4">
            Activez JavaScript pour ajuster les paramètres en temps réel. Voici
            la projection calculée avec les paramètres par défaut ou ceux fournis
            dans l&apos;URL.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-amber-900">
            <div className="bg-white/60 rounded-lg p-3">
              <span className="font-semibold">Versement :</span>{" "}
              {input.monthlyAmount.toLocaleString("fr-FR")} €/mois pendant{" "}
              {input.durationYears} ans
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <span className="font-semibold">Hypothèses :</span> rendement{" "}
              {input.annualReturnPct} %/an · frais {input.annualFeesPct} %/an
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <span className="font-semibold">Capital investi :</span>{" "}
              {formatEur(base.totalInvested)}
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <span className="font-semibold">Valeur finale estimée :</span>{" "}
              <span className="text-emerald-700">{formatEur(base.finalValue)}</span>
              {" "}· gains {formatEur(gains)} · × {multiplier.toFixed(1)}
            </div>
          </div>
        </div>
      </noscript>

      {/* Interactive simulator — hydrates with serverComputedOutput as initial state */}
      <SimulatorPageClient initialOutput={initialOutput} isPremium={premium} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Simulateur DCA ETF",
          url: `${siteUrl}/simulateur`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web browser",
          browserRequirements: "Requires JavaScript",
          inLanguage: "fr-FR",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          },
          description:
            "Simulateur DCA ETF : projetez votre portefeuille avec intérêts composés, frais annuels et inflation. Calcul transparent, hypothèses vérifiables, sans inscription.",
        }}
      />
    </div>
  );
}
