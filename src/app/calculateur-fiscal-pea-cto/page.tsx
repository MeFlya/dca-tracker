import type { Metadata } from "next";
import Link from "next/link";
import { CalculatorClient } from "./CalculatorClient";
import { JsonLd } from "@/components/ui/JsonLd";
import { Disclaimer } from "@/components/ui/Disclaimer";

const TITLE = "Calculateur fiscal PEA vs CTO — Comparez l'impôt sur vos ETF";
const DESCRIPTION =
  "Combien d'impôt sur votre DCA ETF en PEA ou en CTO ? Calculateur instantané : règle des 5 ans, plafond 150 000 €, PFU 30 %, prélèvements sociaux. Gratuit, sans inscription.";
const CANONICAL = "/calculateur-fiscal-pea-cto";

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
    q: "PEA ou CTO : lequel paie le moins d'impôts ?",
    a: "Sur l'investissement long-terme en ETF (≥ 5 ans), le PEA paie nettement moins : 17,2 % de prélèvements sociaux uniquement, contre 30 % de PFU sur le CTO. La différence est importante : pour 50 000 € de plus-values sur 20 ans, vous économisez environ 6 400 € en PEA. Le PEA est donc le compte à privilégier en premier, dans la limite de son plafond de versement (150 000 €).",
  },
  {
    q: "Comment fonctionne la règle des 5 ans du PEA ?",
    a: "À l'ouverture, le PEA est imposé comme un CTO classique (30 % PFU sur les plus-values) si vous clôturez avant 5 ans. À partir de la 5e année exacte (jour pour jour), les plus-values ne supportent plus que les prélèvements sociaux (17,2 %) en cas de retrait. C'est pourquoi il est conseillé d'ouvrir un PEA même sans verser dessus immédiatement : le compteur démarre à l'ouverture, pas au premier versement.",
  },
  {
    q: "Quel est le plafond de versement du PEA ?",
    a: "Le plafond de versement du PEA classique est de 150 000 € (300 000 € pour un couple marié/pacsé avec deux PEA). Ce plafond concerne les versements cumulés, pas la valorisation du portefeuille. Vous pouvez avoir un PEA qui vaut 400 000 € avec 150 000 € versés — la valorisation au-delà du plafond reste autorisée et fiscalement avantageuse.",
  },
  {
    q: "Que faire quand on dépasse le plafond du PEA ?",
    a: "Une fois le plafond de 150 000 € atteint, vos versements supplémentaires doivent aller sur un autre compte. Le CTO est le choix le plus simple. Vous pouvez aussi explorer le PEA-PME (plafond séparé de 225 000 €, ETF éligibles plus restreints) et l'assurance-vie (cadre fiscal différent, frais plus élevés). Notre calculateur affiche automatiquement la combinaison optimale PEA + CTO quand vos versements dépassent 150 000 €.",
  },
  {
    q: "Quelle différence entre PFU et option pour l'IR ?",
    a: "Le PFU (Prélèvement Forfaitaire Unique) à 30 % est appliqué par défaut à toutes les plus-values mobilières. Vous pouvez opter pour l'imposition au barème progressif de l'IR (+ 17,2 % de prélèvements sociaux) si votre tranche marginale d'imposition (TMI) est inférieure à 12,8 % — ce qui est rare pour les épargnants concernés. Notre calculateur applique le PFU 30 % qui est le cas par défaut majoritaire.",
  },
  {
    q: "Les ETF World comme CW8 ou VWCE sont-ils éligibles au PEA ?",
    a: "Oui pour les ETF synthétiques qui répliquent un indice mondial via des swaps avec des actions européennes. CW8 (Amundi MSCI World) est éligible PEA grâce à sa réplication synthétique. VWCE (Vanguard FTSE All-World) en revanche n'est PAS éligible PEA car en réplication physique sur des actions hors UE — il doit être logé en CTO. Pour le PEA, choisissez des ETF explicitement marqués \"éligibles PEA\".",
  },
  {
    q: "Cette simulation tient-elle compte des dividendes ?",
    a: "Notre calculateur modélise les ETF accumulants (CW8, VWCE, IWDA), majoritaires dans les stratégies DCA long-terme. Les dividendes y sont automatiquement réinvestis dans le fonds — vous ne les recevez pas en cash, donc aucun événement fiscal pendant la durée de détention. Pour des ETF distribuants (qui versent des dividendes en cash), la fiscalité serait différente : sur CTO, les dividendes seraient taxés annuellement à 30 % PFU. Sur PEA, ils restent exonérés tant qu'ils ne sont pas retirés.",
  },
];

export default function CalculateurFiscalPage() {
  const siteUrl = "https://dcatracker.fr";

  return (
    // Wrapper bg-white opaque pour stopper le leak AmbientBackground.
    // Page de calcul = analytique/lecture, fond calme et lisible.
    <div className="bg-white">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Calculateur fiscal PEA vs CTO",
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
            "Comparez l'impôt sur vos plus-values ETF en PEA vs CTO. Règle des 5 ans, plafond 150 000 €, PFU 30 % vs prélèvements sociaux 17,2 %.",
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            Calculateur fiscal PEA vs CTO
          </span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
            Calculateur fiscal
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            PEA ou CTO : combien d&apos;impôt sur votre DCA ETF ?
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            Entrez votre stratégie d&apos;investissement, on calcule en temps
            réel le net après impôt sur PEA et sur CTO — règle des 5 ans,
            plafond 150 000 €, PFU et prélèvements sociaux compris.
          </p>
        </header>

        {/* Calculator */}
        <CalculatorClient />

        {/* SEO content + FAQ */}
        <section className="mt-20 space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Comprendre la fiscalité PEA vs CTO en 60 secondes
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                Quand vous vendez vos ETF en plus-value, l&apos;État prélève
                une part de votre gain. Le taux dépend du compte sur lequel
                vous avez investi : <strong>PEA</strong> ou{" "}
                <strong>CTO (Compte-Titres Ordinaire)</strong>. Sur un horizon
                long-terme (≥ 5 ans), la différence est{" "}
                <strong>significative</strong>.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>PEA après 5 ans</strong> : seuls les prélèvements
                  sociaux s&apos;appliquent (17,2 %). C&apos;est le compte
                  fiscalement le plus avantageux pour le DCA ETF long-terme.
                </li>
                <li>
                  <strong>PEA avant 5 ans</strong> : si vous clôturez avant
                  les 5 ans, vous payez le PFU complet à 30 %. Dans ce cas, le
                  PEA n&apos;a plus d&apos;intérêt fiscal vs CTO.
                </li>
                <li>
                  <strong>CTO</strong> : PFU 30 % flat (12,8 % IR + 17,2 % CSG)
                  sur toutes les plus-values, peu importe la durée de
                  détention.
                </li>
                <li>
                  <strong>Plafond PEA : 150 000 €</strong> de versements (pas
                  de la valeur du portefeuille). Au-delà, l&apos;excédent va
                  forcément en CTO.
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-6">
            <h3 className="font-bold text-gray-900 mb-2">Exemple concret</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              200 €/mois × 20 ans = 48 000 € versés. À 7 %/an net, le
              portefeuille atteint environ <strong>102 000 €</strong>, soit{" "}
              <strong>54 000 € de plus-values</strong>.
            </p>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>
                <strong>En PEA</strong> (≥ 5 ans) : 54 000 € × 17,2 % ={" "}
                <strong>9 288 €</strong> d&apos;impôt → net{" "}
                <strong>92 712 €</strong>
              </li>
              <li>
                <strong>En CTO</strong> : 54 000 € × 30 % ={" "}
                <strong>16 200 €</strong> d&apos;impôt → net{" "}
                <strong>85 800 €</strong>
              </li>
              <li className="pt-1.5 border-t border-slate-200/70 mt-1.5 font-semibold text-primary-700">
                → Avantage PEA : <strong>+6 912 €</strong> (+ 8 % de net)
              </li>
            </ul>
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

          {/* Internal linking + disclaimer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/simulateur"
              className="group rounded-2xl border border-slate-200/70 bg-white p-5 hover:border-primary-200 transition-colors"
            >
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
                Étape suivante
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                Simuler votre DCA en détail →
              </p>
              <p className="text-sm text-gray-600">
                3 scénarios sur 30 ans, intérêts composés, choix d&apos;ETF.
              </p>
            </Link>
            <Link
              href="/pea-ou-cto"
              className="group rounded-2xl border border-slate-200/70 bg-white p-5 hover:border-primary-200 transition-colors"
            >
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
                Pour aller plus loin
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                PEA ou CTO : guide complet →
              </p>
              <p className="text-sm text-gray-600">
                Frais, plafond, ETF éligibles, cas pratiques.
              </p>
            </Link>
          </div>

          <Disclaimer />
        </section>
      </div>
    </div>
  );
}
