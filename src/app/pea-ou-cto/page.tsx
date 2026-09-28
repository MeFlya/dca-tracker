import type { Metadata } from "next";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { EducationalHeader } from "@/components/ui/EducationalHeader";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import { getETFBySymbol } from "@/lib/etf-config";
import { runSimulation } from "@/lib/simulator";
import { capitalPour, gainsPour, HYPOTHESES_COMPARATIFS } from "@/lib/ecart-frais";
import { ecartFiscal, impotCTO, impotPEA } from "@/lib/impot-affiche";

const TITLE = "PEA ou CTO en 2026 : comparatif fiscal complet pour vos ETF";
const DESCRIPTION =
  "PEA ou compte-titres pour vos ETF : fiscalité (18,6 % vs 31,4 %), plafond de 150 000 €, ETF éligibles (WPEA, DCAM, CW8) et l'écart d'impôt sur 20 ans.";

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
  { label: "Fiscalité avant 5 ans",  pea: "31,4 % (flat tax)",        cto: "31,4 % (flat tax)"         },
  { label: "Fiscalité après 5 ans",  pea: "18,6 % (PS uniquement)", cto: "31,4 % (flat tax)"         },
  { label: "ETF éligibles",          pea: "EU uniquement",           cto: "Monde entier"            },
  { label: "Retraits",               pea: "Libres après 5 ans",      cto: "Toujours libres"         },
  { label: "Durée idéale",           pea: "Long terme (≥ 5 ans)",    cto: "Toute durée"             },
  { label: "Idéal pour",            pea: "DCA MSCI World long terme", cto: "ETF US, diversification" },
];

// ─── LISTES REFAITES LE 28/09/2026 ───────────────────────────────────────────
//
// Ce qui était faux, d'après la table de vérité ETF du 28/09/2026 (documents
// des émetteurs recoupés avec justETF, Boursorama et Euronext) :
//   · Sous « ETF éligibles PEA » figuraient IWDA, 500, ANX et AEEM. Aucun des
//     quatre n'est éligible (reporting Amundi du 31/08/2026 pour les trois
//     Amundi : « Compte-titres, Assurance-vie »). Quatre lignes sur six.
//   · PCEU : « Amundi STOXX Europe 600 » à 0,07 % → Amundi PEA MSCI Europe,
//     0,15 %.
//   · « Seule option PEA pour le Nasdaq-100 » (ANX) : ANX n'est pas éligible,
//     et PUST n'est pas la seule ligne Nasdaq-100 éligible.
//   · VWCE à 0,22 % → 0,14 %. QQQ à 0,20 % → 0,18 % (baisse du 22/12/2025).
//   · « CSPX, le moins cher d'Europe » et « CW8, le plus populaire en PEA » :
//     classements que rien ne vérifie, retirés.
//   · SPY retiré : absent de la table de vérité, ses frais n'ont pas été
//     vérifiés.
// Les trois Amundi non éligibles passent dans la liste hors PEA, avec leur
// équivalent éligible : c'est exactement le piège où tombait la page.

interface EtfLigne {
  symbol: string;
  name: string;
  ter: string;
  note: string;
}

const ETF_PEA: EtfLigne[] = [
  { symbol: "WPEA",  name: "iShares MSCI World Swap PEA",             ter: "0,20 %", note: "MSCI World — le moins cher de notre sélection sur cet indice, à égalité avec DCAM" },
  { symbol: "DCAM",  name: "Amundi PEA Monde (MSCI World)",           ter: "0,20 %", note: "MSCI World — même indice et même TER que WPEA, part sous 10 €" },
  { symbol: "CW8",   name: "Amundi MSCI World Swap",                  ter: "0,38 %", note: "MSCI World en réplication synthétique — même indice que WPEA et DCAM, presque deux fois plus cher. EWLD est sa part distribuante" },
  { symbol: "SPEA",  name: "iShares S&P 500 Swap PEA",                ter: "0,10 %", note: "S&P 500 — PSP5 (Amundi, 0,12 %) et ESE (BNP Paribas, 0,14 %) sont aussi éligibles" },
  { symbol: "PUST",  name: "Amundi PEA Nasdaq-100",                   ter: "0,30 %", note: "Nasdaq-100 — pas la seule ligne éligible sur cet indice (PNAS l'est aussi)" },
  { symbol: "PCEU",  name: "Amundi PEA MSCI Europe",                  ter: "0,15 %", note: "Grandes et moyennes capitalisations des pays développés européens" },
  { symbol: "PAEEM", name: "Amundi PEA Emergent ESG Transition",      ter: "0,30 %", note: "Pays émergents, dans la variante ESG Transition du MSCI Emerging Markets" },
];

const ETF_CTO: EtfLigne[] = [
  { symbol: "500",  name: "Amundi S&P 500 Swap",                ter: "0,15 %", note: "Le piège : Amundi, synthétique, et pourtant non éligible PEA. Équivalents PEA : SPEA, PSP5, ESE" },
  { symbol: "ANX",  name: "Amundi Nasdaq-100 Swap",             ter: "0,23 %", note: "Non éligible PEA. Équivalent PEA : PUST" },
  { symbol: "AEEM", name: "Amundi MSCI Emerging Markets Swap",  ter: "0,20 %", note: "Non éligible PEA. Équivalent PEA : PAEEM" },
  { symbol: "IWDA", name: "iShares Core MSCI World",            ter: "0,20 %", note: "Réplication physique — non éligible PEA. Équivalents PEA : WPEA, DCAM" },
  { symbol: "VWCE", name: "Vanguard FTSE All-World",            ter: "0,14 %", note: "Pays développés et émergents — non éligible PEA" },
  { symbol: "CSPX", name: "iShares Core S&P 500",               ter: "0,07 %", note: "S&P 500 — non éligible PEA" },
  { symbol: "QQQ",  name: "Invesco QQQ Trust, Series 1",        ter: "0,18 %", note: "Nasdaq-100, fonds de droit américain — non éligible PEA" },
];

/** Vrai quand l'ETF a une fiche /etf/[symbole] — sinon le lien serait une 404. */
function aUneFiche(symbol: string): boolean {
  return getETFBySymbol(symbol) !== undefined;
}

// ─── Exemple chiffré, CALCULÉ ────────────────────────────────────────────────
//
// Les montants de l'exemple (« ~54 000 € », « 10 044 € », « 16 956 € »,
// « 6 912 € ») et du bandeau simulateur (« 102 000 € ») étaient écrits à la
// main — et calculés SANS AUCUN FRAIS, alors que la page parle d'ETF. Corrigé le
// 28/09/2026 : ils sortent du moteur, avec le TER de WPEA et DCAM (0,20 %), le
// MSCI World éligible PEA le moins cher de la table de vérité. L'impôt est
// calculé sur le gain ARRONDI affiché, pour que la multiplication écrite dans
// la phrase reste juste.
const TER_EXEMPLE = 0.2;
const GAIN_EXEMPLE =
  Math.round(
    runSimulation({ ...HYPOTHESES_COMPARATIFS, annualFeesPct: TER_EXEMPLE }).base.totalGain / 100,
  ) * 100;

const FAQ = [
  {
    q: "Peut-on avoir à la fois un PEA et un CTO ?",
    a: "Oui. On ne peut détenir qu'un seul PEA par personne, mais vous pouvez très bien ouvrir un CTO en complément pour les ETF non éligibles PEA ou pour dépasser le plafond de 150 000 €.",
  },
  {
    q: "Que se passe-t-il si je retire de l'argent avant 5 ans sur un PEA ?",
    a: "Un retrait avant 5 ans entraîne la clôture automatique du PEA et l'imposition des gains au taux de 31,4 % (flat tax). Après 5 ans, vous pouvez retirer sans fermer le compte et sans payer d'impôt sur le revenu — seuls les prélèvements sociaux (18,6 %) s'appliquent.",
  },
  {
    q: "Quels ETF MSCI World sont éligibles au PEA ?",
    // Corrigé le 28/09/2026 d'après la table de vérité ETF : EWLD est un ETF
    // Amundi (part distribuante du fonds de CW8), pas iShares ; VWCE n'est PAS
    // éligible au PEA ; « les plus utilisées » n'était mesuré nulle part.
    a: "Quatre ETF MSCI World éligibles au PEA ont été vérifiés par nos soins : WPEA (iShares, 0,20 %), DCAM (Amundi, 0,20 %), CW8 (Amundi, 0,38 %) et EWLD (Amundi, 0,38 %, la part distribuante du même fonds que CW8). Pour de nouveaux achats, WPEA et DCAM répliquent le même indice pour presque deux fois moins de frais. VWCE (Vanguard FTSE All-World) et IWDA (iShares Core MSCI World) ne sont PAS éligibles au PEA.",
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
        updatedAt="2026-09-28"
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
          que les prélèvements sociaux à 18,6 % — contre 31,4 % en flat tax sur un
          CTO (12,8 % d&apos;impôt + 18,6 % de PS).
        </p>
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 mb-4">
          <p className="text-sm font-semibold text-primary-800 mb-2">Exemple concret</p>
          <p className="text-sm text-primary-700 leading-relaxed">
            Vous investissez {HYPOTHESES_COMPARATIFS.monthlyAmount} € par mois
            pendant {HYPOTHESES_COMPARATIFS.durationYears} ans à{" "}
            {HYPOTHESES_COMPARATIFS.annualReturnPct} %/an, dans un ETF MSCI
            World à 0,20 % de frais. Gain projeté : ~{gainsPour(TER_EXEMPLE)} €.
            Sur ce gain :<br />
            <span className="font-semibold">• PEA (&gt;5 ans) :</span> {gainsPour(TER_EXEMPLE)} × 18,6 % = <strong>{impotPEA(GAIN_EXEMPLE)} € d&apos;impôts</strong><br />
            <span className="font-semibold">• CTO :</span> {gainsPour(TER_EXEMPLE)} × 31,4 % = <strong>{impotCTO(GAIN_EXEMPLE)} € d&apos;impôts</strong><br />
            Soit <strong>{ecartFiscal(GAIN_EXEMPLE)} € économisés</strong> grâce au PEA.{" "}
            <Link href="/simulateur" className="underline hover:text-primary-900 transition-colors">
              Calculez votre propre scénario →
            </Link>
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Après 5 ans, les retraits partiels sont possibles sans fermer le PEA —
          vous conservez l&apos;antériorité fiscale sur le solde restant.
        </p>
        <p className="text-gray-600 leading-relaxed mt-5">
          Cette enveloppe fiscale prend tout son sens couplée à des versements
          mensuels : une{" "}
          <Link href="/strategie-dca" className="text-primary-700 font-medium hover:underline">
            stratégie DCA
          </Link>
          {" "}consiste précisément à investir mois après mois pour lisser le
          risque de marché tout en laissant l&apos;exonération d&apos;IR jouer
          à plein.
        </p>
      </section>

      {/* ── Section 3: ETF éligibles PEA ──────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Quels ETF sont éligibles au PEA ?
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          {/* Réécrit le 28/09/2026 : « coté sur un marché européen » n'est pas
              le critère, aucun FTSE All-World de la table n'est éligible, et
              « physique avec domiciliation européenne » est faux (IWDA est
              physique, domicilié en Irlande, et non éligible). */}
          Un ETF est éligible au PEA quand il détient au moins 75 %
          d&apos;actions de sociétés européennes. Les ETF « monde » ou
          « S&amp;P 500 » éligibles y parviennent par réplication synthétique
          (swap) : ils détiennent des actions européennes et reçoivent, par
          contrat, la performance de leur indice. Mais un swap ne suffit pas :
          chez Amundi, les versions « Swap » du S&amp;P 500, du Nasdaq-100 et
          des émergents ne sont pas éligibles, leurs versions « PEA » le sont.
          Le nom ne fait pas foi, l&apos;ISIN et la documentation de
          l&apos;émetteur si. Pour une sélection plus
          étoffée que la liste ci-dessous, voyez notre guide{" "}
          <Link href="/guide-5-etf-pea-premium" className="text-primary-700 font-medium hover:underline">
            5 ETF éligibles PEA
          </Link>
          {" "}avec critères de tri, allocations types et points d&apos;attention.
        </p>

        <h3 className="text-base font-semibold text-gray-900 mb-3">
          ✅ ETF éligibles PEA (vérifiés le 28/09/2026)
        </h3>
        <div className="space-y-3 mb-8">
          {ETF_PEA.map((etf) => (
            <div key={etf.symbol} className="flex items-start gap-4 p-4 rounded-xl border border-green-100 bg-green-50/50">
              {aUneFiche(etf.symbol) ? (
                <Link
                  href={`/etf/${etf.symbol}`}
                  className="shrink-0 w-12 h-12 rounded-xl bg-white border border-green-100 flex items-center justify-center hover:border-primary-200 transition-colors"
                >
                  <span className="text-xs font-bold text-gray-800">{etf.symbol}</span>
                </Link>
              ) : (
                <div className="shrink-0 w-12 h-12 rounded-xl bg-white border border-green-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">{etf.symbol}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {aUneFiche(etf.symbol) ? (
                    <Link href={`/etf/${etf.symbol}`} className="hover:text-primary-600 transition-colors">
                      {etf.name}
                    </Link>
                  ) : (
                    etf.name
                  )}
                  <span className="ml-2 text-xs font-normal text-gray-500">TER {etf.ter}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{etf.note}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-3">
          ❌ ETF non éligibles PEA
        </h3>
        <div className="space-y-3">
          {ETF_CTO.map((etf) => (
            <div key={etf.symbol} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
              {aUneFiche(etf.symbol) ? (
                <Link
                  href={`/etf/${etf.symbol}`}
                  className="shrink-0 w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:border-primary-200 transition-colors"
                >
                  <span className="text-xs font-bold text-gray-800">{etf.symbol}</span>
                </Link>
              ) : (
                <div className="shrink-0 w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">{etf.symbol}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {aUneFiche(etf.symbol) ? (
                    <Link href={`/etf/${etf.symbol}`} className="hover:text-primary-600 transition-colors">
                      {etf.name}
                    </Link>
                  ) : (
                    etf.name
                  )}
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
                "Vous visez le MSCI World, le S&P 500 ou le Nasdaq-100",
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
                "Vous voulez des ETF non éligibles au PEA (VWCE, IWDA, QQQ…)",
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
              <span>
                Ouvrez un <strong>PEA</strong> —{" "}
                <Link href="/comparatif" className="text-primary-700 font-medium hover:underline">
                  comparez les courtiers PEA
                </Link>{" "}
                (Trade Republic, Boursorama, Fortuneo) — et commencez à investir sur{" "}
                un MSCI World éligible : <strong>WPEA ou DCAM</strong> (0,20 %),
                plutôt que CW8 (0,38 %) pour de nouveaux achats.
              </span>
            </li>
            <li className="flex gap-3 text-sm text-gray-700">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Si vous voulez des ETF non éligibles au PEA (VWCE, IWDA, QQQ…) ou si vous avez dépassé 150 000 €, <strong>ajoutez un CTO</strong> en complément.</span>
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
        <p className="text-gray-600 leading-relaxed mt-5">
          Si vous hésitez entre CW8 et WPEA, notre face-à-face{" "}
          <Link href="/comparatif-etf/cw8-vs-wpea" className="text-primary-700 font-medium hover:underline">
            CW8 vs WPEA pour PEA
          </Link>
          {" "}chiffre l&apos;impact du TER sur 20 ans et tranche selon votre
          situation (ouverture, encours existant, simplicité).
        </p>
      </section>

      {/* ── CTA simulateur ─────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-7 mb-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <p className="text-white font-semibold text-lg mb-1">
            Simulez votre DCA sur le MSCI World
          </p>
          <p className="text-primary-200 text-sm leading-snug">
            {HYPOTHESES_COMPARATIFS.monthlyAmount} €/mois pendant{" "}
            {HYPOTHESES_COMPARATIFS.durationYears} ans à{" "}
            {HYPOTHESES_COMPARATIFS.annualReturnPct} %/an, avec 0,20 % de
            frais → ~{capitalPour(TER_EXEMPLE)} € projetés.
            Calculez votre propre scénario en quelques secondes.
          </p>
        </div>
        <Link
          href="/simulateur"
          className="btn-white-primary shrink-0"
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
            note: "Plafond 150 000 €, exonération d'IR après 5 ans, prélèvements sociaux 18,6 %.",
          },
          {
            label: "Imposition des plus-values mobilières (CTO)",
            url: "https://www.service-public.fr/particuliers/vosdroits/F1404",
            publisher: "service-public.fr",
            note: "Prélèvement forfaitaire unique (PFU/Flat Tax) à 31,4 % sur CTO.",
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
      {/* FAQPage seul — l'Article est émis par ArticleByline (dédoublonné,
          audit 07/2026). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
    </div>
  );
}
