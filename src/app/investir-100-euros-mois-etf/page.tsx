import type { Metadata } from "next";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import Link from "next/link";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE =
  "Investir 100 € par mois en ETF = 52 000 € en 20 ans (simulation)";
const DESCRIPTION =
  "100 €/mois en ETF pendant 20 ans ≈ 52 000 €, dont 28 000 € générés par les intérêts composés (scénario 7 %/an). Simulation complète sur 10, 20 et 30 ans, 3 scénarios de rendement, sans inscription.";
const CANONICAL = "/investir-100-euros-mois-etf";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// ─── Données ──────────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    label: "Pessimiste",
    rate: "5 %/an",
    years10: { final: "15 500 €", gain: "3 500 €", pct: "+29 %" },
    years20: { final: "41 300 €", gain: "17 300 €", pct: "+72 %" },
    years30: { final: "83 700 €", gain: "47 700 €", pct: "+133 %" },
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-100",
  },
  {
    label: "Réaliste",
    rate: "7 %/an",
    years10: { final: "17 300 €", gain: "5 300 €", pct: "+44 %" },
    years20: { final: "52 100 €", gain: "28 100 €", pct: "+117 %" },
    years30: { final: "122 100 €", gain: "86 100 €", pct: "+239 %" },
    color: "text-primary-700",
    bg: "bg-primary-50 border-primary-100",
    highlight: true,
  },
  {
    label: "Optimiste",
    rate: "9 %/an",
    years10: { final: "19 400 €", gain: "7 400 €", pct: "+62 %" },
    years20: { final: "66 800 €", gain: "42 800 €", pct: "+178 %" },
    years30: { final: "182 300 €", gain: "146 300 €", pct: "+406 %" },
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
  },
];

const YEARLY = [
  { year: 1,  invested: "1 200 €",  final: "1 250 €",  gain: "50 €",    gainPct: "+4 %" },
  { year: 3,  invested: "3 600 €",  final: "3 940 €",  gain: "340 €",   gainPct: "+9 %" },
  { year: 5,  invested: "6 000 €",  final: "7 160 €",  gain: "1 160 €", gainPct: "+19 %" },
  { year: 10, invested: "12 000 €", final: "17 300 €", gain: "5 300 €", gainPct: "+44 %" },
  { year: 15, invested: "18 000 €", final: "31 700 €", gain: "13 700 €", gainPct: "+76 %" },
  { year: 20, invested: "24 000 €", final: "52 100 €", gain: "28 100 €", gainPct: "+117 %" },
  { year: 25, invested: "30 000 €", final: "81 100 €", gain: "51 100 €", gainPct: "+170 %" },
  { year: 30, invested: "36 000 €", final: "122 100 €", gain: "86 100 €", gainPct: "+239 %" },
];

const FAQ = [
  {
    q: "100€ par mois, est-ce vraiment suffisant pour investir ?",
    a: "Oui, sans hésiter. Il n'y a pas de minimum absolu pour démarrer une stratégie DCA. 100€/mois investi régulièrement pendant 20 ans à 7% de rendement donne plus de 52 000€ — dont 28 000€ générés par les marchés sans effort supplémentaire de votre part. L'essentiel est la régularité, pas le montant.",
  },
  {
    q: "Quel ETF choisir pour investir 100€ par mois ?",
    a: "Un seul ETF suffit pour commencer : le CW8 (Amundi MSCI World) ou l'EWLD (iShares MSCI World) sont des références pour les investisseurs français. Ils répliquent 1 500 à 1 600 entreprises mondiales, ont des frais très bas (TER ≈ 0,12 à 0,20%/an) et sont éligibles au PEA.",
  },
  {
    q: "PEA ou CTO pour investir 100€ par mois ?",
    a: "Le PEA est presque toujours préférable pour les résidents français. Après 5 ans d'ouverture, les retraits sont exonérés d'impôt sur les plus-values (seuls les prélèvements sociaux à 17,2% s'appliquent). Sur 20 ans avec 28 100€ de gains, cette différence fiscale représente environ 3 500 à 5 000€ économisés versus un CTO.",
  },
  {
    q: "Quand verra-t-on vraiment les effets des intérêts composés ?",
    a: "Les premières années semblent peu spectaculaires : à 5 ans, vous avez investi 6 000€ et vous avez 7 160€ (+19%). Mais l'accélération est exponentielle : à 20 ans, vous avez investi 24 000€ et vous avez 52 100€ (+117%). La dernière décennie (année 20 à 30) génère à elle seule 70 000€ de gains — plus que les deux premières réunies.",
  },
  {
    q: "Que se passe-t-il si je saute un mois ?",
    a: "Rien de dramatique sur 20 ans. Rater un ou deux versements ponctuellement n'affecte presque pas le résultat final. Ce qui compte, c'est de ne pas interrompre la stratégie durablement — surtout en période de baisse des marchés, qui sont précisément les moments où le DCA est le plus avantageux.",
  },
];

export default function Investir100EurosMoisPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      {/* Breadcrumb */}
      <nav
        aria-label="Fil d'ariane"
        className="flex items-center gap-2 text-sm text-gray-500 mb-8"
      >
        <Link href="/" className="hover:text-gray-600 transition-colors">
          Accueil
        </Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">
          Investir 100€/mois en ETF
        </span>
      </nav>

      {/* H1 + intro */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Investir 100€ par mois en ETF : simulation sur 10, 20 et 30 ans
      </h1>
      <p className="text-lg text-gray-500 mb-12 leading-relaxed">
        100€ par mois vous semble peu ? Les chiffres disent le contraire.
        Grâce aux intérêts composés, ce montant modeste devient{" "}
        <strong className="text-gray-700">plus de 52 000€ en 20 ans</strong>{" "}
        — dont 28 000€ générés par les marchés, pas par votre effort.
        Voici la simulation complète.
      </p>

      <ArticleByline
        publishedAt="2026-04-19"
        updatedAt="2026-06-10"
        readingMinutes={8}
        url="/investir-100-euros-mois-etf"
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* ── Section 1 : Hypothèses ─────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Les hypothèses de la simulation
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Une simulation n&apos;est utile que si ses paramètres sont
          transparents. Voici ce que nous utilisons :
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Versement mensuel", value: "100 €" },
            { label: "ETF de référence", value: "MSCI World" },
            { label: "Frais TER", value: "0,20 %/an" },
            { label: "Capital initial", value: "0 €" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center"
            >
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5">
          <p className="text-sm font-semibold text-primary-800 mb-1">
            Sur le rendement annuel
          </p>
          <p className="text-sm text-primary-700 leading-relaxed">
            Le MSCI World a rendu en moyenne{" "}
            <strong>7 à 8%/an</strong> sur les 30 dernières années,
            dividendes réinvestis. Nous simulons 3 scénarios (5%, 7%, 9%)
            pour couvrir les marchés atones, normaux et favorables.
            Ce ne sont pas des promesses — les performances passées ne
            garantissent pas l&apos;avenir.
          </p>
        </div>
      </section>

      {/* ── Section 2 : Tableau des 3 scénarios ───────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Résultats : 3 scénarios sur 10, 20 et 30 ans
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Capital investi = 100€ × 12 mois × nombre d&apos;années. Le reste
          est généré par les marchés.
        </p>

        <div className="space-y-4">
          {SCENARIOS.map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border p-5 ${s.bg}${s.highlight ? " ring-2 ring-primary-200" : ""}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={`font-bold text-base ${s.color}`}>
                    {s.label}
                  </span>
                  {s.highlight && (
                    <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold">
                      hypothèse centrale
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  {s.rate}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { label: "10 ans", data: s.years10, invested: "12 000 €" },
                    { label: "20 ans", data: s.years20, invested: "24 000 €" },
                    { label: "30 ans", data: s.years30, invested: "36 000 €" },
                  ] as const
                ).map(({ label, data, invested }) => (
                  <div key={label} className="bg-white/70 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      {label}
                    </p>
                    <p className={`text-lg font-bold tabular-nums ${s.color}`}>
                      {data.final}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      investi : {invested}
                    </p>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">
                      {data.pct}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3 : Progression année par année ───────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          La progression année par année (scénario 7%)
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Les premières années semblent lentes. Puis la courbe s&apos;emballe.
          C&apos;est l&apos;effet boule de neige des intérêts composés.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Année
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Capital investi
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Capital total
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Gain marché
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Perf.
                </th>
              </tr>
            </thead>
            <tbody>
              {YEARLY.map((row, i) => (
                <tr
                  key={row.year}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-50">
                    {row.year} an{row.year > 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 border-b border-gray-50">
                    {row.invested}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 border-b border-gray-50">
                    {row.final}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium border-b border-gray-50">
                    {row.gain}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-semibold border-b border-gray-50">
                    {row.gainPct}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            La décennie qui change tout
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            De l&apos;année 1 à l&apos;année 20, les marchés génèrent{" "}
            <strong>28 100€</strong> de gains. De l&apos;année 20 à
            l&apos;année 30, ils en génèrent <strong>70 000€</strong>{" "}
            supplémentaires — pour le même versement mensuel. Plus la base de
            capital est grande, plus les intérêts composés s&apos;accélèrent.
          </p>
        </div>
      </section>

      {/* ── Section 4 : Coût de l'attente ─────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Le coût de l&apos;attente : commencer maintenant vs dans 5 ans
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          L&apos;argument le plus courant pour ne pas commencer :
          &ldquo;J&apos;attendrai d&apos;avoir plus d&apos;argent.&rdquo;
          Voici ce que cette attente coûte réellement.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-3">
              Commencer aujourd&apos;hui
            </p>
            <p className="text-sm text-gray-600 mb-1">
              100€/mois × <strong>20 ans</strong>
            </p>
            <p className="text-2xl font-bold text-primary-700 mb-1">
              52 100 €
            </p>
            <p className="text-xs text-gray-500">dont 24 000€ investis</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Attendre 5 ans
            </p>
            <p className="text-sm text-gray-600 mb-1">
              100€/mois × <strong>15 ans</strong>
            </p>
            <p className="text-2xl font-bold text-gray-700 mb-1">31 700 €</p>
            <p className="text-xs text-gray-500">dont 18 000€ investis</p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            Le bilan de 5 ans d&apos;attente
          </p>
          <p className="text-sm text-amber-700 leading-relaxed">
            En attendant 5 ans, vous perdez <strong>20 400€</strong> de
            capital final. Pourtant, vous n&apos;aurez épargné que 6 000€ de
            moins. Les 14 400€ restants sont des gains manqués — de
            l&apos;argent que les marchés auraient généré pour vous, et que
            vous n&apos;aurez pas.
          </p>
        </div>
      </section>

      {/* ── Section 5 : Impact des frais ──────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          L&apos;impact des frais : 0,12% vs 1% sur 20 ans
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Les frais de gestion (TER) sont prélevés chaque année sur
          l&apos;encours. Ils semblent négligeables — jusqu&apos;à ce
          qu&apos;on les simule sur 20 ans.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Type de fonds
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  TER
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Capital final (20 ans)
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Coût des frais
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: "ETF indiciel (CW8, EWLD)", ter: "0,12 %", final: "51 900 €", cost: "— (référence)" },
                { type: "ETF indiciel (standard)", ter: "0,20 %", final: "51 600 €", cost: "300 €" },
                { type: "Fonds actif classique",   ter: "0,50 %", final: "49 600 €", cost: "2 300 €" },
                { type: "Assurance-vie générique", ter: "1,00 %", final: "46 200 €", cost: "5 700 €" },
              ].map((row, i) => (
                <tr
                  key={row.type}
                  className={i === 0 ? "bg-primary-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-50">
                    {row.type}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 border-b border-gray-50">
                    {row.ter}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 border-b border-gray-50">
                    {row.final}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold border-b border-gray-50 ${i === 0 ? "text-primary-600" : "text-orange-500"}`}>
                    {row.cost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Les ETF indiciels à bas coûts ne sont pas juste une préférence
          théorique — ils valent concrètement 2 300 à 5 700€ supplémentaires
          sur 20 ans pour un versement de 100€/mois.
        </p>
      </section>

      {/* ── CTA Simulateur ────────────────────────────────────────────────── */}
      <section className="mb-14 rounded-2xl bg-primary-600 p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Simulez votre propre projection
        </h2>
        <p className="text-primary-200 text-sm mb-6 leading-relaxed max-w-md mx-auto">
          Ces chiffres sont basés sur des hypothèses moyennes. Ajustez le
          versement, la durée et le rendement selon votre situation réelle.
          La simulation se met à jour en temps réel.
        </p>
        <Link
          href="/simulateur?monthly=100&years=20&return=7&fees=0.2"
          className="btn-secondary text-sm px-6 py-2.5 inline-flex"
        >
          Ouvrir le simulateur avec 100€/mois →
        </Link>
        <p className="mt-4 text-primary-300 text-xs">
          Gratuit · Sans inscription · 3 scénarios comparés
        </p>
      </section>

      {/* ── Section 6 : PEA vs CTO ────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          PEA ou CTO : ça change combien sur 20 ans ?
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          L&apos;enveloppe fiscale change significativement le résultat net
          après impôts. Sur 20 ans avec 100€/mois à 7% :
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
            <p className="font-bold text-primary-700 mb-3">Plan Épargne en Actions (PEA)</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Capital final</span>
                <span className="font-bold text-gray-900">52 100 €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gains à la sortie (après 5 ans)</span>
                <span className="font-medium text-gray-700">28 100 €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Imposition (prélèv. sociaux 17,2%)</span>
                <span className="font-medium text-orange-600">− 4 833 €</span>
              </div>
              <div className="flex justify-between border-t border-primary-100 pt-2">
                <span className="font-semibold text-primary-700">Net en poche</span>
                <span className="font-bold text-primary-700">47 267 €</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="font-bold text-gray-700 mb-3">Compte-Titres Ordinaire (CTO)</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Capital final</span>
                <span className="font-bold text-gray-900">52 100 €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gains imposables</span>
                <span className="font-medium text-gray-700">28 100 €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Imposition (PFU 30%)</span>
                <span className="font-medium text-orange-600">− 8 430 €</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-semibold text-gray-700">Net en poche</span>
                <span className="font-bold text-gray-700">43 670 €</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Avantage PEA : +3 597 € sur 20 ans
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Pour 100€/mois, ouvrez un PEA dès maintenant — même sans y
            mettre d&apos;argent. Le délai des 5 ans avant de bénéficier
            de la fiscalité avantageuse commence à l&apos;ouverture, pas
            au premier versement.
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Calcul simplifié. La fiscalité réelle dépend de votre situation
          personnelle.{" "}
          <Link
            href="/pea-ou-cto"
            className="underline hover:text-gray-600 transition-colors"
          >
            Voir le guide complet PEA vs CTO →
          </Link>
        </p>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl border border-gray-100 bg-white overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none">
                {q}
                <span className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                {a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Liens internes ────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Continuez votre exploration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              href: "/investir-200-euros-mois-etf",
              title: "Simulation avec 200€/mois",
              desc: "Capital doublé, même principe — voir ce que change le montant.",
            },
            {
              href: "/investir-300-euros-mois-etf",
              title: "Simulation avec 300€/mois",
              desc: "L'horizon retraite avec un versement plus confortable.",
            },
            {
              href: "/strategie-dca",
              title: "La stratégie DCA expliquée",
              desc: "DCA vs lump sum, comment démarrer, les erreurs à éviter.",
            },
            {
              href: "/meilleurs-etf-debutants",
              title: "Quels ETF choisir ?",
              desc: "Notre sélection commentée pour une stratégie DCA efficace.",
            },
            {
              href: "/pea-ou-cto",
              title: "PEA ou CTO ?",
              desc: "Comparatif complet pour choisir la bonne enveloppe fiscale.",
            },
            {
              href: "/interets-composes",
              title: "Les intérêts composés",
              desc: "La mécanique derrière ces projections, expliquée simplement.",
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group p-4 rounded-xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all"
            >
              <p className="font-semibold text-sm text-gray-900 group-hover:text-primary-700 mb-1 transition-colors">
                {link.title} →
              </p>
              <p className="text-xs text-gray-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>


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

      <EmailCapture source="simulation_100" />
    </div>
  );
}
