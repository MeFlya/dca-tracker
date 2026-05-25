import type { Metadata } from "next";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { EducationalHeader } from "@/components/ui/EducationalHeader";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";

const TITLE = "PEA ou CTO en 2026 : comparatif fiscal complet pour vos ETF";
const DESCRIPTION =
  "PEA vs compte-titres ordinaire pour vos ETF : fiscalité (17,2 % vs 30 %), plafond (150 000 €), ETF éligibles (CW8, EWLD, AEEM) et recommandation chiffrée selon votre profil.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pea-ou-cto" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/pea-ou-cto",
    type: "article",
    // OG image générée par convention via pea-ou-cto/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "PEA ou CTO pour vos ETF ? Comparatif fiscal, ETF éligibles et recommandation concrète.",
  },
};

// ─── Comparison data ──────────────────────────────────────────────────────────

const ROWS = [
  { label: "Plafond de versements",  pea: "150 000 €",              cto: "Illimité"                },
  { label: "Fiscalité avant 5 ans",  pea: "30 % (flat tax)",        cto: "30 % (flat tax)"         },
  { label: "Fiscalité après 5 ans",  pea: "17,2 % (PS uniquement)", cto: "30 % (flat tax)"         },
  { label: "ETF éligibles",          pea: "EU uniquement",           cto: "Monde entier"            },
  { label: "Retraits",               pea: "Libres après 5 ans",      cto: "Toujours libres"         },
  { label: "Durée idéale",           pea: "Long terme (≥ 5 ans)",    cto: "Toute durée"             },
  { label: "Idéal pour",            pea: "DCA MSCI World long terme", cto: "ETF US, diversification" },
];

const ETF_PEA = [
  { symbol: "CW8",   name: "Amundi MSCI World",              ter: "0,38 %", note: "Réplication synthétique — le plus populaire en PEA" },
  { symbol: "IWDA",  name: "iShares Core MSCI World",        ter: "0,20 %", note: "Réplication physique optimisée — sans risque de contrepartie" },
  { symbol: "500",   name: "Amundi S&P 500",                 ter: "0,15 %", note: "S&P 500 en PEA grâce à la réplication synthétique" },
  { symbol: "ANX",   name: "Amundi Nasdaq-100",              ter: "0,23 %", note: "Seule option PEA pour s'exposer au Nasdaq-100" },
  { symbol: "AEEM",  name: "Amundi MSCI Emerging Markets",   ter: "0,20 %", note: "Marchés émergents accessibles en PEA via swap" },
  { symbol: "PCEU",  name: "Amundi STOXX Europe 600",        ter: "0,07 %", note: "600 grandes capitalisations européennes — frais minimaux" },
];

const ETF_CTO = [
  { symbol: "VWCE", name: "Vanguard FTSE All-World",   ter: "0,22 %", note: "Développés + émergents — CTO ou assurance-vie uniquement" },
  { symbol: "CSPX", name: "iShares Core S&P 500",      ter: "0,07 %", note: "S&P 500 physique, le moins cher d'Europe — CTO uniquement" },
  { symbol: "SPY",  name: "SPDR S&P 500 ETF Trust",    ter: "0,09 %", note: "Coté à New York — CTO uniquement" },
  { symbol: "QQQ",  name: "Invesco Nasdaq-100 ETF",    ter: "0,20 %", note: "Coté à New York — CTO uniquement" },
];

const FAQ = [
  {
    q: "Peut-on avoir à la fois un PEA et un CTO ?",
    a: "Oui. On ne peut détenir qu'un seul PEA par personne, mais vous pouvez très bien ouvrir un CTO en complément pour les ETF non éligibles PEA ou pour dépasser le plafond de 150 000 €.",
  },
  {
    q: "Que se passe-t-il si je retire de l'argent avant 5 ans sur un PEA ?",
    a: "Un retrait avant 5 ans entraîne la clôture automatique du PEA et l'imposition des gains au taux de 30 % (flat tax). Après 5 ans, vous pouvez retirer sans fermer le compte et sans payer d'impôt sur le revenu — seuls les prélèvements sociaux (17,2 %) s'appliquent.",
  },
  {
    q: "Quels ETF MSCI World sont éligibles au PEA ?",
    a: "Les ETF cotés sur des marchés européens (Euronext Paris, XETRA…) qui respectent les critères de l'AMF sont éligibles. CW8 (Amundi) et EWLD (iShares) sont les deux références MSCI World les plus utilisées dans un PEA. VWCE (Vanguard FTSE All-World) est également éligible.",
  },
  {
    q: "Le PEA est-il adapté si j'investis plus de 150 000 € ?",
    a: "Au-delà du plafond de versements de 150 000 €, vous ne pouvez plus alimenter votre PEA. Les gains continuent de croître, mais tout versement supplémentaire doit se faire via un CTO. La stratégie classique : maximiser le PEA d'abord, puis ouvrir un CTO.",
  },
];

export default function PEAouCTOPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: "/" },
          { name: "PEA ou CTO" },
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">PEA ou CTO</span>
      </nav>

      <EducationalHeader
        icon={Landmark}
        eyebrow="Fiscalité"
        title="PEA ou CTO : quelle enveloppe pour investir en ETF ?"
        subtitle="Avant d'acheter votre premier ETF, vous devrez choisir une enveloppe fiscale. Ce choix a un impact direct sur vos impôts — et sur les ETF auxquels vous avez accès. Voici tout ce qu'il faut savoir."
      />

      <ArticleByline
        publishedAt="2026-04-12"
        updatedAt="2026-05-25"
        readingMinutes={12}
        url="/pea-ou-cto"
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* ── Section 1: Comparaison ─────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          PEA vs CTO : le comparatif
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 bg-gray-50 font-semibold text-gray-500 border-b border-gray-100 w-1/2"></th>
                <th className="text-center px-4 py-3 bg-primary-50 font-bold text-primary-700 border-b border-primary-100">PEA</th>
                <th className="text-center px-4 py-3 bg-gray-50 font-semibold text-gray-600 border-b border-gray-100">CTO</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 text-gray-600 font-medium border-b border-gray-50">{row.label}</td>
                  <td className="px-4 py-3 text-center text-primary-700 font-semibold border-b border-gray-50">{row.pea}</td>
                  <td className="px-4 py-3 text-center text-gray-600 border-b border-gray-50">{row.cto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 2: Avantage fiscal PEA ────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          L&apos;avantage fiscal du PEA après 5 ans
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          C&apos;est le principal argument du PEA : après 5 ans de détention, vos
          plus-values sont exonérées d&apos;impôt sur le revenu. Vous ne payez
          que les prélèvements sociaux à 17,2 % — contre 30 % en flat tax sur un
          CTO (12,8 % d&apos;impôt + 17,2 % de PS).
        </p>
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 mb-4">
          <p className="text-sm font-semibold text-primary-800 mb-2">Exemple concret</p>
          <p className="text-sm text-primary-700 leading-relaxed">
            Vous investissez 200 € par mois pendant 20 ans à 7 %/an.
            Gain projeté : ~54 000 €. Sur ce gain :<br />
            <span className="font-semibold">• PEA (&gt;5 ans) :</span> 54 000 × 17,2 % = <strong>9 288 € d&apos;impôts</strong><br />
            <span className="font-semibold">• CTO :</span> 54 000 × 30 % = <strong>16 200 € d&apos;impôts</strong><br />
            Soit <strong>6 912 € économisés</strong> grâce au PEA.{" "}
            <Link href="/simulateur" className="underline hover:text-primary-900 transition-colors">
              Calculez votre propre scénario →
            </Link>
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Après 5 ans, les retraits partiels sont possibles sans fermer le PEA —
          vous conservez l&apos;antériorité fiscale sur le solde restant.
        </p>
      </section>

      {/* ── Section 3: ETF éligibles PEA ──────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Quels ETF sont éligibles au PEA ?
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Pour être éligible au PEA, un ETF doit être coté sur un marché européen
          et respecter les critères de l&apos;AMF. Les ETF MSCI World et FTSE
          All-World sont accessibles via réplication synthétique (swap) ou
          physique avec domiciliation européenne.
        </p>

        <h3 className="text-base font-semibold text-gray-900 mb-3">
          ✅ ETF éligibles PEA (recommandés)
        </h3>
        <div className="space-y-3 mb-8">
          {ETF_PEA.map((etf) => (
            <div key={etf.symbol} className="flex items-start gap-4 p-4 rounded-xl border border-green-100 bg-green-50/50">
              <Link
                href={`/etf/${etf.symbol}`}
                className="shrink-0 w-12 h-12 rounded-xl bg-white border border-green-100 flex items-center justify-center hover:border-primary-200 transition-colors"
              >
                <span className="text-xs font-bold text-gray-800">{etf.symbol}</span>
              </Link>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  <Link href={`/etf/${etf.symbol}`} className="hover:text-primary-600 transition-colors">
                    {etf.name}
                  </Link>
                  <span className="ml-2 text-xs font-normal text-gray-500">TER {etf.ter}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{etf.note}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-3">
          ❌ ETF non éligibles PEA (CTO uniquement)
        </h3>
        <div className="space-y-3">
          {ETF_CTO.map((etf) => (
            <div key={etf.symbol} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <Link
                href={`/etf/${etf.symbol}`}
                className="shrink-0 w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:border-primary-200 transition-colors"
              >
                <span className="text-xs font-bold text-gray-800">{etf.symbol}</span>
              </Link>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  <Link href={`/etf/${etf.symbol}`} className="hover:text-primary-600 transition-colors">
                    {etf.name}
                  </Link>
                  <span className="ml-2 text-xs font-normal text-gray-500">TER {etf.ter}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{etf.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Quand choisir quoi ─────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Quand choisir le PEA, quand choisir le CTO ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-3">Choisissez le PEA si…</p>
            <ul className="space-y-2.5">
              {[
                "Vous investissez à long terme (≥ 5 ans)",
                "Vous visez le MSCI World ou le FTSE All-World",
                "Vous voulez minimiser votre fiscalité sur les gains",
                "Vos versements totaux resteront sous 150 000 €",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-primary-800">
                  <span className="shrink-0 text-primary-700 font-bold mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Choisissez le CTO si…</p>
            <ul className="space-y-2.5">
              {[
                "Vous voulez acheter des ETF US (SPY, QQQ…)",
                "Vous avez déjà atteint le plafond PEA de 150 000 €",
                "Vous avez besoin de flexibilité totale sur les retraits",
                "Vous compensez des moins-values avec des plus-values",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="shrink-0 text-gray-500 font-bold mt-0.5">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Section 5: Recommandation ──────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Notre recommandation
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            Pour la <strong>majorité des investisseurs DCA français</strong> qui
            souhaitent investir sur le long terme avec des versements mensuels :
          </p>
          <ol className="space-y-3 mb-4">
            <li className="flex gap-3 text-sm text-gray-700">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Ouvrez un <strong>PEA</strong> et commencez à investir sur <strong>CW8 ou EWLD</strong> (MSCI World, TER faible, PEA éligible).</span>
            </li>
            <li className="flex gap-3 text-sm text-gray-700">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Si vous voulez des ETF US (SPY, QQQ) ou si vous avez dépassé 150 000 €, <strong>ajoutez un CTO</strong> en complément.</span>
            </li>
            <li className="flex gap-3 text-sm text-gray-700">
              <span className="shrink-0 w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Ne touchez pas à votre PEA pendant 5 ans pour bénéficier de l&apos;avantage fiscal maximum.</span>
            </li>
          </ol>
          <p className="text-xs text-gray-500">
            Ces informations sont à caractère éducatif et ne constituent pas un conseil en investissement personnalisé.
            Consultez un CGP ou CIF agréé AMF pour toute décision patrimoniale.
          </p>
        </div>
      </section>

      {/* ── CTA simulateur ─────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-7 mb-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <p className="text-white font-semibold text-lg mb-1">
            Simulez votre DCA sur le MSCI World
          </p>
          <p className="text-primary-200 text-sm leading-snug">
            200 €/mois pendant 20 ans à 7 %/an → 102 000 € projetés.
            Calculez votre propre scénario en quelques secondes.
          </p>
        </div>
        <Link
          href="/simulateur"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary-700 font-semibold text-sm hover:bg-primary-50 transition-colors"
        >
          Ouvrir le simulateur →
        </Link>
      </div>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Questions fréquentes
        </h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-xl border border-gray-100 p-5">
              <p className="font-semibold text-gray-900 text-sm mb-2">{item.q}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sources & références ───────────────────────────────────────── */}
      <SourcesReferences
        sources={[
          {
            label: "Plan d'Épargne en Actions (PEA) — règles et fiscalité",
            url: "https://www.service-public.fr/particuliers/vosdroits/F2385",
            publisher: "service-public.fr",
            note: "Plafond 150 000 €, exonération d'IR après 5 ans, prélèvements sociaux 17,2 %.",
          },
          {
            label: "Imposition des plus-values mobilières (CTO)",
            url: "https://www.service-public.fr/particuliers/vosdroits/F1404",
            publisher: "service-public.fr",
            note: "Prélèvement forfaitaire unique (PFU/Flat Tax) à 30 % sur CTO.",
          },
          {
            label: "Guide pratique du PEA",
            url: "https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/marches-financiers-et-produits-financiers/plan-depargne-en-actions-pea",
            publisher: "Autorité des marchés financiers (AMF)",
          },
          {
            label: "Code monétaire et financier — articles L221-30 et suivants",
            url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072026/LEGISCTA000006153523/",
            publisher: "Légifrance",
            note: "Cadre légal du PEA — éligibilité, fonctionnement, conditions de clôture.",
          },
          {
            label: "BoFiP — Régime fiscal du PEA",
            url: "https://bofip.impots.gouv.fr/bofip/3220-PGP.html",
            publisher: "Bulletin Officiel des Finances Publiques",
          },
        ]}
      />

      {/* ── Email capture ──────────────────────────────────────────────── */}
      <EmailCapture variant="card" source="guide_pea_cto" />

      {/* ── JSON-LD ────────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITLE,
            description: DESCRIPTION,
            url: `${siteUrl}/pea-ou-cto`,
            inLanguage: "fr-FR",
            publisher: {
              "@type": "Organization",
              name: "DCA Tracker",
              url: siteUrl,
            },
            mainEntity: {
              "@type": "FAQPage",
              mainEntity: FAQ.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            },
          }),
        }}
      />
    </div>
  );
}
