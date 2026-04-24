import type { Metadata } from "next";
import Link from "next/link";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE = "Intérêts composés : comment ça marche et simulateur gratuit";
const DESCRIPTION =
  "Les intérêts composés sont la force la plus puissante de l'investissement long terme. Comprendre le principe, le calculer et l'appliquer avec des ETF pour maximiser votre patrimoine.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/interets-composes" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/interets-composes",
    type: "article",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Intérêts composés — DCA Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// ─── Compound interest table data ─────────────────────────────────────────────
// Calculated with FV = PMT × ((1 + r)^n − 1) / r, r = 7%/12, monthly

const COMPOUND_TABLE = [
  {
    duration: "10 ans",
    inv100: "12 000 €",  val100: "17 300 €",  gain100: "+44 %",
    inv200: "24 000 €",  val200: "34 600 €",  gain200: "+44 %",
    inv500: "60 000 €",  val500: "86 400 €",  gain500: "+44 %",
  },
  {
    duration: "20 ans",
    inv100: "24 000 €",  val100: "52 100 €",  gain100: "+117 %",
    inv200: "48 000 €",  val200: "104 200 €", gain200: "+117 %",
    inv500: "120 000 €", val500: "260 500 €", gain500: "+117 %",
  },
  {
    duration: "30 ans",
    inv100: "36 000 €",  val100: "121 900 €", gain100: "+239 %",
    inv200: "72 000 €",  val200: "243 800 €", gain200: "+239 %",
    inv500: "180 000 €", val500: "609 500 €", gain500: "+239 %",
  },
];

const RULE_72 = [
  { rate: "4 %",  years: "18 ans" },
  { rate: "5 %",  years: "14,4 ans" },
  { rate: "6 %",  years: "12 ans" },
  { rate: "7 %",  years: "10,3 ans" },
  { rate: "8 %",  years: "9 ans" },
  { rate: "10 %", years: "7,2 ans" },
];

const FAQ = [
  {
    q: "Quel taux de rendement annuel prévoir pour un ETF monde ?",
    a: "Historiquement, le MSCI World a délivré environ 10 % par an en dollars avant inflation sur 50 ans. En euros et après inflation (environ 2 %), un rendement réel de 5 à 7 % par an est une hypothèse raisonnable pour des projections. Notre simulateur utilise 7 % comme scénario de base, 5 % pour le scénario conservateur et 9 % pour le scénario optimiste.",
  },
  {
    q: "Comment les ETF « capitalisants » amplifient-ils les intérêts composés ?",
    a: "Un ETF capitalisant réinvestit automatiquement les dividendes dans le fonds au lieu de vous les verser. Ces dividendes achètent de nouvelles parts, qui elles-mêmes génèrent de futurs dividendes. Ce mécanisme automatique est la forme la plus pure des intérêts composés — sans action de votre part, sans friction fiscale annuelle.",
  },
  {
    q: "Est-il trop tard pour commencer à 40 ans ?",
    a: "Non. À 40 ans, votre horizon d'investissement est probablement encore de 25 à 30 ans — amplement suffisant pour que les intérêts composés fassent leur travail. Commencer plus tôt est toujours mieux, mais commencer maintenant est toujours mieux que ne pas commencer.",
  },
  {
    q: "Les intérêts composés fonctionnent-ils aussi dans un PEA ?",
    a: "Oui, et le PEA les amplifie encore. Dans un PEA, les gains ne sont pas imposés annuellement — ils se réinvestissent dans leur intégralité. Sur 20-30 ans, cette absence de friction fiscale produit une différence significative par rapport à un compte-titres où la flat tax de 30 % s'applique à chaque retrait.",
  },
  {
    q: "Quelle est la différence entre intérêts simples et intérêts composés ?",
    a: "Les intérêts simples se calculent uniquement sur le capital initial. Les intérêts composés se calculent sur le capital initial PLUS tous les gains accumulés. Sur le long terme, la différence est massive : 10 000 € à 7 % pendant 30 ans avec des intérêts simples donnent 31 000 €. Avec des intérêts composés : 76 000 €.",
  },
];

export default function InteretsComposesPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": TITLE,
        "description": DESCRIPTION,
        "url": `${siteUrl}/interets-composes`,
        "author": { "@type": "Organization", "name": "DCA Tracker" },
        "publisher": { "@type": "Organization", "name": "DCA Tracker", "url": siteUrl },
        "inLanguage": "fr",
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

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Intérêts composés</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Les intérêts composés : le moteur silencieux de la richesse à long terme
      </h1>
      <p className="text-lg text-gray-500 mb-12 leading-relaxed">
        Les intérêts composés, c&apos;est le principe selon lequel vos gains
        génèrent à leur tour des gains. Une mécanique simple qui, sur 20 ou
        30 ans, transforme un investissement modeste en capital significatif.
        Comprendre ce principe, c&apos;est comprendre pourquoi commencer tôt
        est la décision financière la plus importante de votre vie.
      </p>

      {/* ── Section 1: Le principe ─────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Comment fonctionnent les intérêts composés
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Imaginez que vous placez 1 000 € à 7 % de rendement annuel.
          La première année, vous gagnez 70 €. Simple. La deuxième année,
          vous ne gagnez pas 70 € sur 1 000 € — vous gagnez 7 % sur 1 070 €,
          soit 74,90 €. La troisième année, 7 % sur 1 144,90 €, soit 80,14 €.
        </p>
        <p className="text-gray-600 leading-relaxed mb-6">
          Ce cycle — <strong>les gains reinvestis génèrent à leur tour des gains</strong> —
          crée une croissance exponentielle. Au bout de 30 ans, ce capital
          initial de 1 000 € vaut 7 612 € sans jamais avoir ajouté un centime.
        </p>
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 mb-6">
          <p className="text-sm font-semibold text-primary-800 mb-3">La formule</p>
          <div className="bg-white rounded-xl p-4 text-center font-mono text-sm text-gray-800 border border-primary-100 mb-3">
            <p className="mb-1">Valeur finale = Versement × ((1 + r)ⁿ − 1) / r</p>
            <p className="text-xs text-gray-500 mt-2">r = taux mensuel (rendement annuel ÷ 12) · n = nombre de mois</p>
          </div>
          <p className="text-xs text-primary-700 leading-relaxed">
            Pour 200 €/mois à 7 %/an pendant 20 ans :<br />
            r = 0,07 ÷ 12 ≈ 0,5833 % · n = 240 mois<br />
            <strong>Valeur finale ≈ 104 200 €</strong> pour 48 000 € investis (+117 %)
          </p>
        </div>
        <p className="text-gray-600 leading-relaxed">
          La subtilité est dans la progression non linéaire : vos 10 premières
          années génèrent beaucoup moins de gains que vos 10 dernières.
          C&apos;est pourquoi commencer tôt a une valeur très difficile à
          rattraper en investissant plus tard.
        </p>
      </section>

      {/* ── Section 2: Tableau ────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Le tableau qui change les perspectives
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Hypothèse : 7 % de rendement annuel brut, intérêts composés mensuellement. Hors inflation et fiscalité.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">Durée</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600 border-b border-gray-100 border-l border-gray-100" colSpan={2}>100 €/mois</th>
                <th className="text-center px-3 py-3 font-bold text-primary-700 bg-primary-50/50 border-b border-primary-100 border-l border-gray-100" colSpan={2}>200 €/mois</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600 border-b border-gray-100 border-l border-gray-100" colSpan={2}>500 €/mois</th>
              </tr>
              <tr className="bg-gray-50/50 text-xs text-gray-500">
                <th className="px-4 py-2 text-left border-b border-gray-100"></th>
                <th className="px-3 py-2 text-center border-b border-gray-100 border-l border-gray-100">Investi</th>
                <th className="px-3 py-2 text-center border-b border-gray-100">Valeur</th>
                <th className="px-3 py-2 text-center border-b border-primary-100 border-l border-gray-100 bg-primary-50/30">Investi</th>
                <th className="px-3 py-2 text-center border-b border-primary-100 bg-primary-50/30">Valeur</th>
                <th className="px-3 py-2 text-center border-b border-gray-100 border-l border-gray-100">Investi</th>
                <th className="px-3 py-2 text-center border-b border-gray-100">Valeur</th>
              </tr>
            </thead>
            <tbody>
              {COMPOUND_TABLE.map((row, i) => (
                <tr key={row.duration} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                  <td className="px-4 py-4 font-bold text-gray-900 border-b border-gray-50">{row.duration}</td>
                  <td className="px-3 py-4 text-center text-gray-500 border-b border-gray-50 border-l border-gray-50 text-xs">{row.inv100}</td>
                  <td className="px-3 py-4 text-center font-semibold text-gray-700 border-b border-gray-50">
                    {row.val100}
                    <span className="block text-xs font-normal text-gain-default">{row.gain100}</span>
                  </td>
                  <td className="px-3 py-4 text-center text-primary-700 border-b border-gray-50 border-l border-gray-50 text-xs bg-primary-50/20">{row.inv200}</td>
                  <td className="px-3 py-4 text-center font-bold text-primary-700 border-b border-gray-50 bg-primary-50/20">
                    {row.val200}
                    <span className="block text-xs font-semibold text-gain-default">{row.gain200}</span>
                  </td>
                  <td className="px-3 py-4 text-center text-gray-500 border-b border-gray-50 border-l border-gray-50 text-xs">{row.inv500}</td>
                  <td className="px-3 py-4 text-center font-semibold text-gray-700 border-b border-gray-50">
                    {row.val500}
                    <span className="block text-xs font-normal text-gain-default">{row.gain500}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Calcul : FV = PMT × ((1 + r)ⁿ − 1) / r. Les résultats sont indicatifs et ne garantissent pas les performances futures.{" "}
          <Link href="/methodologie" className="underline hover:text-gray-600 transition-colors">Voir la méthodologie →</Link>
        </p>
      </section>

      {/* ── Section 3: Le temps est l'ingrédient principal ────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pourquoi le temps compte plus que le montant
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Voici une comparaison qui illustre mieux que tout discours pourquoi
          commencer tôt est la décision la plus impactante.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
            <p className="text-xs font-semibold text-primary-600 mb-3 uppercase tracking-wider">Sophie — commence à 25 ans</p>
            <p className="text-sm text-primary-700 leading-relaxed mb-3">
              Investit <strong>200 €/mois</strong> pendant 30 ans (jusqu&apos;à 55 ans).<br />
              Total investi : <strong>72 000 €</strong><br />
              Valeur à 55 ans à 7 %/an : <strong>243 800 €</strong>
            </p>
            <p className="text-xs text-primary-600">Les gains couvrent 70 % du capital final.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Thomas — commence à 35 ans</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Investit <strong>400 €/mois</strong> pendant 20 ans (jusqu&apos;à 55 ans).<br />
              Total investi : <strong>96 000 €</strong><br />
              Valeur à 55 ans à 7 %/an : <strong>208 000 €</strong>
            </p>
            <p className="text-xs text-gray-500">Thomas investit 33 % de plus, mais accumule 15 % de moins.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">Ce que cet exemple révèle</p>
          <p className="text-sm text-amber-700 leading-relaxed">
            Les 10 années d&apos;avance de Sophie valent plus que les 200 €/mois
            supplémentaires de Thomas. Le temps dans le marché prime sur le
            montant investi — c&apos;est l&apos;essence des intérêts composés.
          </p>
        </div>
      </section>

      {/* ── Section 4: La règle des 72 ───────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          La règle des 72 : estimer le doublement de capital
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          La règle des 72 est une heuristique simple : divisez 72 par votre
          taux de rendement annuel pour obtenir le nombre d&apos;années
          nécessaires pour doubler votre capital.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">Rendement annuel</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">Temps pour doubler</th>
              </tr>
            </thead>
            <tbody>
              {RULE_72.map((row, i) => (
                <tr key={row.rate} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} ${row.rate === "7 %" ? "bg-primary-50/50" : ""}`}>
                  <td className={`px-4 py-3 font-medium border-b border-gray-50 ${row.rate === "7 %" ? "text-primary-700 font-bold" : "text-gray-700"}`}>
                    {row.rate} {row.rate === "7 %" && <span className="text-xs font-normal text-primary-700 ml-2">(scénario base)</span>}
                  </td>
                  <td className={`px-4 py-3 text-center font-semibold border-b border-gray-50 ${row.rate === "7 %" ? "text-primary-700" : "text-gray-700"}`}>
                    {row.years}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          À 7 % de rendement annuel (scénario base du simulateur), votre capital
          double tous les 10,3 ans. Un portefeuille de 50 000 € devient
          100 000 € en une décennie sans versement supplémentaire.
        </p>
      </section>

      {/* ── Section 5: ETF et intérêts composés ──────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pourquoi les ETF sont le meilleur véhicule pour les intérêts composés
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Tous les placements bénéficient en théorie des intérêts composés,
          mais les ETF présentent des avantages structurels uniques.
        </p>
        <div className="space-y-3">
          {[
            {
              title: "ETF capitalisants : dividendes automatiquement réinvestis",
              body: "Un ETF capitalisant (comme le CW8, EWLD ou VWCE) réinvestit les dividendes sans intervention de votre part. Pas de virement, pas de décision, pas de friction fiscale annuelle. Les dividendes achètent de nouvelles parts, qui génèrent de futurs dividendes — le cycle de composition est parfait.",
            },
            {
              title: "PEA : zéro friction fiscale pendant la période de composition",
              body: "Dans un PEA, les gains ne sont pas taxés annuellement. Toute la croissance se réinvestit intégralement. Sur 30 ans, l'absence de la flat tax 30 % sur les dividendes intermédiaires représente une différence de patrimoine très significative par rapport à un CTO.",
            },
            {
              title: "Frais bas : chaque centime de frais est un centime qui ne compose pas",
              body: "Un TER de 0,07 % (PCEU, CSPX) vs 1,5 % (fonds actif) représente 1,43 % de rendement supplémentaire par an qui compose à votre avantage. Sur 30 ans à 7 % brut, la différence de frais peut représenter 30 à 50 % du capital final.",
            },
            {
              title: "Diversification : réduit le risque de composition zéro",
              body: "Un ETF MSCI World investit dans 1 500 entreprises. Si l'une d'elles fait faillite, son impact est négligeable. Un titre individuel peut tomber à zéro, interrompant brutalement la composition. La diversification protège la continuité du mécanisme.",
            },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl border border-gray-100 bg-white">
              <p className="font-semibold text-gray-900 text-sm mb-2">{item.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Simulator CTA ─────────────────────────────────────────────────── */}
      <section className="mb-14 rounded-2xl bg-primary-600 p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Visualisez votre courbe de composition
        </h2>
        <p className="text-primary-200 text-sm mb-6 leading-relaxed">
          Le simulateur DCA Tracker calcule votre projection avec les intérêts
          composés en temps réel — trois scénarios, hypothèses transparentes.
        </p>
        <Link href="/simulateur" className="btn-secondary text-sm px-5 py-2.5 inline-flex">
          Voir ce que vaut mon argent →
        </Link>
        <p className="text-primary-300 text-xs mt-3">Sans inscription · Résultats immédiats</p>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
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

      {/* ── Internal links ────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Pour aller plus loin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: "/strategie-dca",           title: "La stratégie DCA expliquée",           desc: "Comment investir régulièrement pour tirer parti des intérêts composés." },
            { href: "/meilleurs-etf-debutants",  title: "Les meilleurs ETF pour débutants",     desc: "Choisir un ETF capitalisant et diversifié pour maximiser la composition." },
            { href: "/pea-ou-cto",               title: "PEA vs CTO : impact fiscal",           desc: "Comment le PEA amplifie les intérêts composés sur 20-30 ans." },
            { href: "/investir-en-etf",          title: "Commencer à investir en ETF",          desc: "Le guide pas à pas pour ouvrir un compte et passer son premier ordre." },
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

      <EmailCapture source="guide_interets_composes" />
    </div>
  );
}
