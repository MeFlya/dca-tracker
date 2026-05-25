import type { Metadata } from "next";
import Link from "next/link";
import { Repeat } from "lucide-react";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";
import { EducationalHeader } from "@/components/ui/EducationalHeader";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";

const TITLE = "La stratégie DCA : investir régulièrement pour lisser le risque";
const DESCRIPTION =
  "Qu'est-ce que le DCA (Dollar Cost Averaging) ? Comment ça marche, ses avantages face au lump sum, et comment l'appliquer concrètement avec des ETF en France.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/strategie-dca" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/strategie-dca",
    type: "article",
    // OG image générée par convention via strategie-dca/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// ─── DCA example data ─────────────────────────────────────────────────────────

const DCA_EXAMPLE = [
  { month: "Mois 1", price: 100, invest: 300, shares: "3,00", cumShares: "3,00" },
  { month: "Mois 2", price: 75,  invest: 300, shares: "4,00", cumShares: "7,00" },
  { month: "Mois 3", price: 50,  invest: 300, shares: "6,00", cumShares: "13,00" },
  { month: "Mois 4", price: 75,  invest: 300, shares: "4,00", cumShares: "17,00" },
  { month: "Mois 5", price: 100, invest: 300, shares: "3,00", cumShares: "20,00" },
  { month: "Mois 6", price: 110, invest: 300, shares: "2,73", cumShares: "22,73" },
];

const STEPS = [
  {
    n: "1",
    title: "Ouvrir un PEA",
    body: "Pour la fiscalité la plus avantageuse, ouvrez un PEA chez Boursorama, Trade Republic ou Fortuneo. Gratuit et sans engagement.",
  },
  {
    n: "2",
    title: "Choisir un ETF monde",
    body: "Un seul ETF suffit pour démarrer. Le CW8 (Amundi MSCI World) ou l'EWLD (iShares MSCI World) couvrent 1 500 entreprises mondiales et sont éligibles PEA.",
    href: "/meilleurs-etf-debutants",
  },
  {
    n: "3",
    title: "Fixer un montant mensuel",
    body: "Choisissez un montant que vous pouvez maintenir sans effort — même 50 € par mois. La régularité prime sur le montant.",
    href: "/simulateur",
  },
  {
    n: "4",
    title: "Automatiser si possible",
    body: "Certains courtiers permettent des ordres programmés mensuels. Sinon, posez un rappel le jour de votre virement de salaire.",
  },
];

const MISTAKES = [
  {
    title: "Vouloir trouver le « bon moment »",
    body: "C'est précisément ce que le DCA évite. Attendre le « creux parfait » pour investir est une forme de market timing — qui échoue statistiquement même pour les professionnels.",
  },
  {
    title: "Interrompre en période de baisse",
    body: "Les baisses sont la force du DCA : vous achetez plus d'unités pour le même montant. Arrêter d'investir en baisse, c'est rater l'opportunité que vous vous étiez créée.",
  },
  {
    title: "Changer d'ETF trop souvent",
    body: "Le DCA requiert de la consistance. Changer d'ETF fréquemment multiplie les frais de transaction et rompt la logique de la stratégie.",
  },
  {
    title: "Investir l'argent de son fonds d'urgence",
    body: "Le DCA n'a de sens que sur l'épargne disponible à long terme. Gardez toujours 3 à 6 mois de dépenses en épargne de précaution hors bourse.",
  },
];

const FAQ = [
  {
    q: "DCA ou lump sum : quelle stratégie est la meilleure ?",
    a: "Statistiquement, le lump sum (investir tout d'un coup) surperforme le DCA environ 2/3 du temps sur des marchés haussiers longs. Mais le DCA élimine le risque de mauvais timing, s'adapte mieux aux investisseurs avec un revenu mensuel régulier, et réduit le stress psychologique. Pour la grande majorité des épargnants, le DCA est la stratégie la plus réaliste et la plus sustainable.",
  },
  {
    q: "Combien investir par mois avec le DCA ?",
    a: "Il n'y a pas de minimum absolu. Des montants comme 50 €, 100 € ou 200 € par mois donnent des résultats significatifs sur 20-30 ans grâce aux intérêts composés. L'essentiel est que le montant soit supportable sur la durée — investir moins régulièrement vaut mieux qu'investir trop et devoir interrompre.",
  },
  {
    q: "À quelle fréquence investir avec le DCA ?",
    a: "Une fois par mois est la fréquence standard et la plus pratique. Elle correspond au cycle de salaire, minimise les frais de transaction et produit des résultats quasi-identiques à un investissement hebdomadaire sur le long terme. La fréquence importe beaucoup moins que la régularité.",
  },
  {
    q: "Peut-on faire du DCA avec n'importe quel ETF ?",
    a: "Oui. Le DCA est une méthode d'investissement, pas un produit. Il s'applique à tout ETF coté. En France, les ETF MSCI World éligibles PEA (CW8, EWLD) sont les supports DCA les plus utilisés par les investisseurs particuliers.",
  },
  {
    q: "Combien de temps faut-il garder son DCA actif ?",
    a: "La stratégie DCA montre sa vraie puissance sur 10 ans minimum. Les intérêts composés s'accélèrent de façon non linéaire avec le temps : la dernière décennie d'un investissement 30 ans génère souvent plus de gains que les deux premières réunies. Plus l'horizon est long, plus le DCA est efficace.",
  },
];

export default function StrategieDCAPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": TITLE,
        "description": DESCRIPTION,
        "url": `${siteUrl}/strategie-dca`,
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

      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: "/" },
          { name: "Stratégie DCA" },
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Stratégie DCA</span>
      </nav>

      <EducationalHeader
        icon={Repeat}
        eyebrow="Stratégie passive"
        title="La stratégie DCA : investir régulièrement pour lisser le risque"
        subtitle="Le DCA (Dollar Cost Averaging) est la stratégie d'investissement la plus simple et la plus efficace pour les investisseurs particuliers. Pas de prédiction de marché, pas de stress du timing — juste une régularité disciplinée qui, sur le long terme, bat la majorité des approches actives."
      />

      <ArticleByline
        publishedAt="2026-04-10"
        updatedAt="2026-05-25"
        readingMinutes={10}
        url="/strategie-dca"
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* ── Section 1: Définition ──────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Qu&apos;est-ce que le DCA ?
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Le Dollar Cost Averaging (DCA) — ou investissement programmé en
          français — consiste à investir un montant fixe à intervalles
          réguliers, quel que soit le niveau du marché. Chaque mois, vous
          achetez pour le même montant : 100 €, 200 € ou 500 €, indépendamment
          de si les marchés ont monté ou baissé.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          L&apos;effet mécanique est simple mais puissant : quand les prix
          baissent, votre budget mensuel achète <strong>plus d&apos;unités</strong>.
          Quand les prix montent, il en achète <strong>moins</strong>. Sur la
          durée, votre prix d&apos;achat moyen s&apos;améliore automatiquement
          lors des phases de correction — sans aucune décision active de votre
          part.
        </p>
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5">
          <p className="text-sm font-semibold text-primary-800 mb-1">En une phrase</p>
          <p className="text-sm text-primary-700 leading-relaxed">
            Le DCA transforme la volatilité des marchés — habituellement perçue
            comme un risque — en avantage mécanique pour l&apos;investisseur patient.
          </p>
        </div>
      </section>

      {/* ── Section 2: Exemple chiffré ────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Comment ça marche : un exemple concret
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Imaginez un ETF dont le prix passe par une phase de correction, puis
          se redresse. Vous investissez 300 € par mois pendant 6 mois.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">Mois</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">Prix unitaire</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">Investi</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">Parts achetées</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">Parts cumulées</th>
              </tr>
            </thead>
            <tbody>
              {DCA_EXAMPLE.map((row, i) => (
                <tr key={row.month} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 font-medium text-gray-700 border-b border-gray-50">{row.month}</td>
                  <td className="px-4 py-3 text-right text-gray-700 border-b border-gray-50">{row.price} €</td>
                  <td className="px-4 py-3 text-right text-gray-700 border-b border-gray-50">{row.invest} €</td>
                  <td className={`px-4 py-3 text-right font-semibold border-b border-gray-50 ${row.price <= 75 ? "text-gain-default" : "text-gray-700"}`}>
                    {row.shares}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 border-b border-gray-50">{row.cumShares}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Total investi</p>
            <p className="text-xl font-bold text-gray-900">1 800 €</p>
          </div>
          <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 text-center">
            <p className="text-xs text-primary-600 mb-1">Valeur finale (à 110 €)</p>
            <p className="text-xl font-bold text-primary-700">2 500 €</p>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
            <p className="text-xs text-gain-default mb-1">Performance DCA</p>
            <p className="text-xl font-bold text-gain-default">+38,9 %</p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">Comparaison : et si vous aviez tout investi au mois 1 ?</p>
          <p className="text-sm text-amber-700 leading-relaxed">
            1 800 € investis en une fois à 100 € l&apos;unité = 18 parts.
            Valeur finale : 18 × 110 € = <strong>1 980 €</strong> (+10 %).
            <br />
            Le DCA fait +38,9 % sur le même scénario, grâce aux achats
            supplémentaires pendant la correction.
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Note : ce scénario favorise le DCA (marché qui baisse puis remonte).
          Sur un marché en hausse continue, le lump sum peut surperformer.{" "}
          <Link href="#dca-vs-lump-sum" className="underline hover:text-gray-600 transition-colors">
            Voir la comparaison complète →
          </Link>
        </p>
      </section>

      {/* ── Section 3: DCA vs Lump Sum ────────────────────────────────────── */}
      <section className="mb-14" id="dca-vs-lump-sum">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          DCA vs Lump Sum : lequel est le meilleur ?
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          C&apos;est l&apos;une des questions les plus débattues en finance
          personnelle. La réponse honnête : les deux ont leurs mérites, selon
          votre situation.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 bg-gray-50 font-semibold text-gray-500 border-b border-gray-100"></th>
                <th className="text-center px-4 py-3 bg-primary-50 font-bold text-primary-700 border-b border-primary-100">DCA</th>
                <th className="text-center px-4 py-3 bg-gray-50 font-semibold text-gray-600 border-b border-gray-100">Lump Sum</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Risque de mauvais timing",       dca: "Éliminé",           ls: "Élevé" },
                { label: "Performance sur marchés haussiers", dca: "Légèrement inférieure", ls: "Optimale" },
                { label: "Performance en correction",      dca: "Avantageuse",       ls: "Pénalisée" },
                { label: "Discipline psychologique",       dca: "Facile à maintenir", ls: "Exige de la conviction" },
                { label: "Adapté au revenu mensuel",       dca: "Oui",               ls: "Rare en pratique" },
                { label: "Idéal pour",                     dca: "Salariés, débutants", ls: "Capital ponctuel (héritage, bonus)" },
              ].map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 text-gray-600 font-medium border-b border-gray-50">{row.label}</td>
                  <td className="px-4 py-3 text-center text-primary-700 font-semibold border-b border-gray-50">{row.dca}</td>
                  <td className="px-4 py-3 text-center text-gray-600 border-b border-gray-50">{row.ls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">Notre verdict</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Pour un salarié qui investit son revenu mensuel, la question ne se
            pose pas : le DCA est la seule option réaliste. Pour quelqu&apos;un qui
            dispose d&apos;un capital ponctuel (bonus, héritage, vente
            immobilière), le lump sum est statistiquement optimal — mais un
            DCA sur 6 à 12 mois reste une option valide si le risque de
            mauvais timing vous préoccupe.
          </p>
        </div>
      </section>

      {/* ── Section 4: Comment démarrer ───────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comment démarrer une stratégie DCA avec des ETF
        </h2>
        <div className="space-y-4">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-white">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-700">{step.n}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.body}
                  {step.href && (
                    <>
                      {" "}
                      <Link href={step.href} className="text-primary-600 hover:text-primary-700 underline transition-colors">
                        {step.n === "2" ? "Voir les meilleurs ETF →" : "Simuler ma projection →"}
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Erreurs à éviter ───────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          4 erreurs qui sabotent une stratégie DCA
        </h2>
        <div className="space-y-4">
          {MISTAKES.map((m) => (
            <div key={m.title} className="p-5 rounded-2xl border border-loss-light bg-loss-light/30">
              <p className="font-semibold text-gray-900 mb-2">⚠ {m.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Simulator CTA ─────────────────────────────────────────────────── */}
      <section className="mb-14 rounded-2xl bg-primary-600 p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Projetez votre DCA avec l&apos;outil de simulation
        </h2>
        <p className="text-primary-200 text-sm mb-6 leading-relaxed">
          Choisissez un ETF, un montant mensuel et une durée. Le simulateur
          calcule votre projection en trois scénarios de marché.
        </p>
        <Link href="/simulateur" className="btn-secondary text-sm px-5 py-2.5 inline-flex">
          Voir ce que vaut mon argent →
        </Link>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Questions fréquentes sur la stratégie DCA
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
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Pour aller plus loin
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: "/meilleurs-etf-debutants", title: "Quels ETF choisir pour débuter ?", desc: "Notre sélection commentée pour une stratégie DCA efficace." },
            { href: "/interets-composes",        title: "La puissance des intérêts composés", desc: "Visualisez l'effet du temps sur votre portefeuille." },
            { href: "/pea-ou-cto",               title: "PEA ou CTO pour votre DCA ?",     desc: "Choisir la bonne enveloppe pour optimiser votre fiscalité." },
            { href: "/investir-en-etf",          title: "Comment investir en ETF",          desc: "Le guide complet du débutant, étape par étape." },
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

      <EmailCapture source="guide_dca" />
    </div>
  );
}
