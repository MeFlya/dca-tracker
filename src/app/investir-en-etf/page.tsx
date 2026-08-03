import type { Metadata } from "next";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import Link from "next/link";
import { EmailCapture } from "@/components/ui/EmailCapture";

const TITLE = "Comment investir en ETF chaque mois — Guide DCA débutants";
const DESCRIPTION =
  "Guide pratique pour investir en ETF avec des versements mensuels réguliers (DCA). Quel ETF choisir, PEA ou CTO, combien investir, comment automatiser — tout ce qu'il faut savoir pour démarrer.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/investir-en-etf" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/investir-en-etf",
    type: "article",
    images: [{ url: "https://dcatracker.fr/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "DCA ETF : guide complet pour débutants. Quel ETF, PEA ou CTO, combien investir, comment automatiser.",
  },
};

const STEPS = [
  {
    num: "01",
    title: "Comprendre ce qu'est un ETF",
    content: (
      <>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Un ETF (Exchange Traded Fund) est un fonds coté en bourse qui réplique
          un indice de marché. Au lieu de choisir des actions une par une, vous
          achetez une part qui représente des centaines ou des milliers
          d&apos;entreprises à la fois.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          L&apos;ETF MSCI World, par exemple, vous expose à plus de 1 500
          entreprises dans 23 pays développés — en un seul achat, avec des frais
          de gestion annuels souvent inférieurs à 0,40 %.
        </p>
      </>
    ),
  },
  {
    num: "02",
    title: "Choisir son premier ETF",
    content: (
      <>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Pour débuter avec une stratégie DCA, la recommandation la plus courante
          est un <strong>ETF MSCI World ou FTSE All-World</strong> : diversification
          mondiale maximale, TER faible, liquidité élevée.
        </p>
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm space-y-2">
          <p className="font-semibold text-gray-800">Les 3 ETF MSCI World les plus utilisés en France :</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { symbol: "CW8", name: "Amundi MSCI World", ter: "0,38 %", pea: true },
              { symbol: "IWDA", name: "iShares Core MSCI World", ter: "0,20 %", pea: false },
              { symbol: "VWCE", name: "Vanguard FTSE All-World", ter: "0,22 %", pea: false },
            ].map((etf) => (
              <Link
                key={etf.symbol}
                href={`/etf/${etf.symbol}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{etf.symbol}</span>
                <span className="text-gray-500 flex-1 px-3 truncate">{etf.name}</span>
                <span className="text-xs text-gray-500 shrink-0">TER {etf.ter}</span>
                {etf.pea && (
                  <span className="ml-2 shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-100 text-primary-700">PEA</span>
                )}
              </Link>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Pour un premier investissement, un seul de ces ETF suffit.
          La sur-diversification avec plusieurs ETF similaires est une erreur courante.
        </p>
      </>
    ),
  },
  {
    num: "03",
    title: "Ouvrir la bonne enveloppe fiscale",
    content: (
      <>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          En France, vous avez deux options principales : le{" "}
          <strong>PEA (Plan d&apos;Épargne en Actions)</strong> et le{" "}
          <strong>CTO (Compte-Titres Ordinaire)</strong>. Le choix entre les deux
          a un impact direct sur votre fiscalité.
        </p>
        <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 text-sm">
          <p className="font-semibold text-primary-800 mb-1">
            Pour la majorité des débutants : commencez par le PEA.
          </p>
          <p className="text-primary-700">
            Après 5 ans, vos gains ne sont taxés qu&apos;à 18,6 % (prélèvements
            sociaux uniquement), contre 31,4 % en CTO. Sur 20 ans de DCA, la
            différence peut représenter plusieurs milliers d&apos;euros.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
          <Link
            href="/pea-ou-cto"
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline"
          >
            Guide complet PEA vs CTO →
          </Link>
          <Link
            href="/comparatif"
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline"
          >
            Comparer les courtiers →
          </Link>
        </div>
      </>
    ),
  },
  {
    num: "04",
    title: "Définir votre versement mensuel",
    content: (
      <>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Le montant idéal est celui que vous pouvez investir <strong>chaque mois
          sans avoir à le retirer</strong> — même en cas de baisse de marché.
          Il vaut mieux commencer avec 50 €/mois et tenir que commencer avec
          500 €/mois et paniquer au premier krach.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Une règle simple : investissez ce qui reste après avoir constitué
          votre épargne de précaution (3 à 6 mois de dépenses en liquidité).
        </p>
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm">
          <p className="font-semibold text-gray-700 mb-2">L&apos;effet des intérêts composés dans le temps :</p>
          <div className="space-y-1.5">
            {[
              { monthly: "100 €", years: 20, result: "51 000 €" },
              { monthly: "200 €", years: 20, result: "102 000 €" },
              { monthly: "500 €", years: 20, result: "255 000 €" },
            ].map((row) => (
              <div key={row.monthly} className="flex justify-between text-gray-600">
                <span>{row.monthly}/mois pendant {row.years} ans à 7 %/an</span>
                <span className="font-semibold text-gray-900">≈ {row.result}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">Projections hypothétiques, rendement brut 7 %/an constant. TER non déduit.</p>
        </div>
        <Link
          href="/simulateur"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline"
        >
          Calculer votre propre scénario →
        </Link>
      </>
    ),
  },
  {
    num: "05",
    title: "Automatiser et ne pas toucher à rien",
    content: (
      <>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Le DCA fonctionne parce qu&apos;il enlève les décisions émotionnelles.
          Configurez un virement automatique vers votre PEA ou CTO le jour
          après votre virement de salaire, puis passez votre ordre d&apos;achat
          mensuel.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          La règle d&apos;or : <strong>ne regardez pas votre portefeuille chaque
          semaine</strong>. Les marchés baissent parfois de 30, 40, 50 % — c&apos;est
          normal sur 20 ans. Les investisseurs qui paniquent et vendent au plus
          bas sont ceux qui perdent. Ceux qui continuent leurs versements
          réguliers achètent plus de parts au prix bas.
        </p>
      </>
    ),
  },
];

const MISTAKES = [
  {
    title: "Diversifier avec trop d'ETF",
    body: "CW8 + EWLD + VWCE, c'est la même chose en triple. Un seul ETF MSCI World suffit pour un portefeuille diversifié à l'échelle mondiale.",
  },
  {
    title: "Essayer de timer le marché",
    body: "\"Je vais attendre que ça baisse pour commencer.\" Le meilleur moment pour commencer est maintenant. Le second meilleur moment aussi.",
  },
  {
    title: "Arrêter ses versements en cas de baisse",
    body: "C'est exactement le contraire de ce qu'il faudrait faire. Une baisse de marché signifie que vous achetez plus de parts avec le même argent.",
  },
  {
    title: "Oublier l'enveloppe fiscale",
    body: "Investir dans un CTO quand le PEA était accessible peut coûter des milliers d'euros d'impôts sur 20 ans.",
  },
];

export default function InvestirEnETFPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Investir en ETF</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Comment investir en ETF chaque mois : le guide pour débutants
      </h1>
      <p className="text-lg text-gray-500 mb-12 leading-relaxed">
        Investir régulièrement en bourse n&apos;est pas réservé aux experts.
        Avec quelques décisions simples — le bon ETF, la bonne enveloppe, un
        virement automatique — vous pouvez construire un portefeuille solide sur
        le long terme. Voici comment.
      </p>

      <ArticleByline
        publishedAt="2026-04-18"
        updatedAt="2026-06-10"
        readingMinutes={7}
        url="/investir-en-etf"
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* ── Steps ──────────────────────────────────────────────────────── */}
      <div className="space-y-12 mb-16">
        {STEPS.map((step) => (
          <section key={step.num}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-primary-700 font-mono tracking-widest">
                Étape {step.num}
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h2>
            {step.content}
          </section>
        ))}
      </div>

      {/* ── CTA simulateur ─────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-7 mb-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <p className="text-white font-semibold text-lg mb-1">
            Projetez votre plan DCA
          </p>
          <p className="text-primary-200 text-sm leading-snug">
            Entrez votre versement mensuel et visualisez la projection sur
            20 ans — avec les frais réels de votre ETF.
          </p>
        </div>
        <Link
          href="/simulateur"
          className="btn-white-primary shrink-0"
        >
          Ouvrir le simulateur →
        </Link>
      </div>

      {/* ── Erreurs à éviter ───────────────────────────────────────────── */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Les 4 erreurs à éviter quand on commence
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MISTAKES.map((m) => (
            <div key={m.title} className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
              <p className="text-sm font-semibold text-amber-800 mb-1.5">❌ {m.title}</p>
              <p className="text-sm text-amber-700 leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Liens utiles ───────────────────────────────────────────────── */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Pour aller plus loin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/strategie-dca",           label: "La stratégie DCA expliquée",                sub: "Comment lisser le risque avec des versements réguliers" },
            { href: "/meilleurs-etf-debutants", label: "Meilleurs ETF pour débutants",              sub: "Notre sélection commentée avec critères de choix" },
            { href: "/interets-composes",       label: "Les intérêts composés",                     sub: "Visualiser la puissance du temps sur votre portefeuille" },
            { href: "/pea-ou-cto",              label: "PEA ou CTO : le comparatif complet",        sub: "Quelle enveloppe fiscale choisir ?" },
            { href: "/comparer-etf",            label: "Comparer les ETF",                          sub: "CW8, EWLD, VWCE, SP5, ANX côte à côte" },
            { href: "/simulateur",              label: "Simulateur DCA",                            sub: "Projetez vos versements mensuels" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col gap-0.5 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group"
            >
              <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                {link.label} →
              </span>
              <span className="text-xs text-gray-500">{link.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Legal ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-12">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Avertissement :</strong> Ce guide est à caractère éducatif et
          informatif. Il ne constitue pas un conseil en investissement financier
          personnalisé. Les performances passées ne préjugent pas des performances
          futures. Investir comporte un risque de perte en capital. Consultez un
          conseiller en gestion de patrimoine (CGP) ou un CIF agréé AMF avant
          toute décision d&apos;investissement.
        </p>
      </div>

      {/* ── Email capture ──────────────────────────────────────────────── */}

      <SourcesReferences
        sources={[
          {
            label: "MSCI World Index — performance historique",
            url: "https://www.msci.com/indexes/index/990100",
            publisher: "MSCI Inc.",
            note: "Base des hypothèses de rendement utilisées dans les simulations (~7 %/an net réel).",
          },
          {
            label: "Espace épargnants — comprendre les ETF",
            url: "https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/produits-collectifs/fonds-indiciels-cotes-etf",
            publisher: "Autorité des marchés financiers (AMF)",
          },
          {
            label: "Plan d'Épargne en Actions — fiscalité",
            url: "https://www.service-public.fr/particuliers/vosdroits/F2385",
            publisher: "service-public.fr",
            note: "Exonération d'IR après 5 ans — l'enveloppe de référence pour un DCA long terme.",
          },
          {
            label: "Indice des prix à la consommation",
            url: "https://www.insee.fr/fr/statistiques/2122401",
            publisher: "INSEE",
            note: "Référence pour l'impact de l'inflation sur la valeur réelle des projections.",
          },
        ]}
      />

      <EmailCapture variant="card" source="guide_etf_debutant" />

      {/* JSON-LD Article : émis par ArticleByline (dédoublonné, audit 07/2026). */}
    </div>
  );
}
