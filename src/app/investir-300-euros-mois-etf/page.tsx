import type { Metadata } from "next";
import Link from "next/link";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE =
  "Investir 300€ par mois en ETF : simulation et objectif retraite";
const DESCRIPTION =
  "300€/mois en ETF sur 20 ans = 156 000€. Simulation complète avec 3 scénarios, projection retraite, règle des 4%, et analyse Monte Carlo. Sans inscription.";
const CANONICAL = "/investir-300-euros-mois-etf";

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
    years: [
      { y: 10, final: "46 500 €", pct: "+29 %" },
      { y: 15, final: "79 500 €", pct: "+47 %" },
      { y: 20, final: "123 900 €", pct: "+72 %" },
      { y: 25, final: "182 800 €", pct: "+103 %" },
      { y: 30, final: "251 100 €", pct: "+133 %" },
    ],
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-100",
  },
  {
    label: "Réaliste",
    rate: "7 %/an",
    years: [
      { y: 10, final: "51 900 €", pct: "+44 %" },
      { y: 15, final: "95 200 €", pct: "+76 %" },
      { y: 20, final: "156 300 €", pct: "+117 %" },
      { y: 25, final: "243 200 €", pct: "+170 %" },
      { y: 30, final: "366 300 €", pct: "+239 %" },
    ],
    color: "text-primary-700",
    bg: "bg-primary-50 border-primary-100",
    highlight: true,
  },
  {
    label: "Optimiste",
    rate: "9 %/an",
    years: [
      { y: 10, final: "58 200 €", pct: "+62 %" },
      { y: 15, final: "116 100 €", pct: "+115 %" },
      { y: 20, final: "200 400 €", pct: "+178 %" },
      { y: 25, final: "318 700 €", pct: "+254 %" },
      { y: 30, final: "546 900 €", pct: "+406 %" },
    ],
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
  },
];

const FIRE_TABLE = [
  {
    rente: "500 €/mois",
    capital: "150 000 €",
    duree: "~20 ans",
    note: "Complément de retraite confortable",
  },
  {
    rente: "1 000 €/mois",
    capital: "300 000 €",
    duree: "~28 ans",
    note: "Remplace un revenu partiel",
  },
  {
    rente: "1 500 €/mois",
    capital: "450 000 €",
    duree: "~33 ans",
    note: "Autonomie financière complète",
  },
];

const FAQ = [
  {
    q: "Peut-on viser l'indépendance financière avec 300€/mois ?",
    a: "Oui, si l'horizon est suffisamment long. Avec 300€/mois et 7% de rendement sur 28 ans, vous atteignez 300 000€ de capital — ce qui, selon la règle des 4%, permet de retirer 1 000€/mois indéfiniment sans toucher au principal. C'est la base du mouvement FIRE (Financial Independence, Retire Early) appliqué à la réalité d'un salarié français.",
  },
  {
    q: "La règle des 4% est-elle fiable ?",
    a: "La règle des 4% vient de l'étude Trinity (1998) et stipule qu'un portefeuille diversifié (actions + obligations) peut être retiré à 4%/an sur 30 ans sans s'épuiser, avec un taux de succès de 96% sur les données historiques américaines. Elle est une approximation utile, pas une garantie. Pour une planification précise, notre simulateur Monte Carlo (Premium) simule 1 000 marchés possibles et vous donne la distribution de probabilités réelle.",
  },
  {
    q: "300€/mois en PEA : est-ce compatible avec le plafond ?",
    a: "Oui. Le plafond de versement du PEA est de 150 000€. À 300€/mois, vous atteignriez ce plafond au bout de 41,7 ans de versements — bien au-delà de la plupart des horizons d'investissement. Si vous atteignez le plafond, vous pouvez continuer à investir le même ETF dans un CTO en complément.",
  },
  {
    q: "Quels ETF choisir pour 300€/mois ?",
    a: "Pour commencer, un seul ETF MSCI World suffit (CW8 sur PEA, VWCE sur CTO). Avec 300€/mois sur le long terme, certains investisseurs diversifient : 80% MSCI World + 20% Marchés Émergents (AEEM ou PAEEM), ou 70% MSCI World + 30% ETF Small Cap (WSML). La diversification devient pertinente une fois votre stratégie de base bien établie.",
  },
  {
    q: "Comment comparer deux stratégies différentes (300€/mois 20 ans vs 400€/mois 15 ans) ?",
    a: "C'est exactement pour ça qu'existe la fonctionnalité de comparaison A vs B du simulateur. Avec Premium, vous saisissez deux scénarios indépendants et voyez côte à côte quel capital final chacun produit — avec la différence en euros et en pourcentage calculée automatiquement.",
  },
];

export default function Investir300EurosMoisPage() {
  return (
    // Wrapper opaque bg-white pour stopper le leak AmbientBackground mesh.
    // Page longue de lecture → fond calme et lisible.
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          url: `https://dcatracker.fr${CANONICAL}`,
          author: { "@type": "Organization", name: "DCA Tracker" },
          publisher: {
            "@type": "Organization",
            name: "DCA Tracker",
            url: "https://dcatracker.fr",
          },
          inLanguage: "fr",
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
          Investir 300€/mois en ETF
        </span>
      </nav>

      {/* H1 + intro */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Investir 300€ par mois en ETF : simulation et objectif retraite
      </h1>
      <p className="text-lg text-gray-500 mb-12 leading-relaxed">
        300€ par mois est le versement qui, sur 20 à 30 ans, ouvre des
        possibilités concrètes d&apos;indépendance financière. À 7% de
        rendement annuel sur 20 ans, ce montant génère{" "}
        <strong className="text-gray-700">156 300€</strong> — dont
        84 300€ produits par les marchés. Sur 30 ans, ce capital dépasse{" "}
        <strong className="text-gray-700">366 000€</strong>. Voici la
        simulation complète, avec l&apos;objectif retraite intégré.
      </p>

      {/* ── Bloc résultat mis en avant — slate-950 + radial halo (Premium
          identity, cohérent avec SimulatorHero et TrackingPitch). ─────── */}
      <div className="relative rounded-2xl bg-slate-950 p-8 text-white mb-14 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(600px circle at 50% 30%, rgba(59, 130, 246, 0.22), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <p className="text-slate-400 text-sm font-medium mb-2">
            300€/mois · 20 ans · 7%/an
          </p>
          <p className="text-5xl font-bold tabular-nums mb-1 text-white">156 300 €</p>
          <p className="text-slate-400 text-sm mb-6">
            dont 72 000€ versés — et 84 300€ générés automatiquement par les marchés
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-slate-400 text-xs mb-1">Capital investi</p>
              <p className="font-bold text-white">72 000 €</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-slate-400 text-xs mb-1">Gain marché</p>
              <p className="font-bold text-emerald-400">+84 300 €</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-slate-400 text-xs mb-1">Performance</p>
              <p className="font-bold text-emerald-400">+117 %</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-slate-400 text-xs mb-1">Sur 30 ans</p>
              <p className="font-bold text-emerald-400">366 300 €</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 1 : Tableau complet ───────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Simulation complète : 3 scénarios sur 5 horizons
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Capital investi : 300€ × 12 mois × durée.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Durée
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Investi
                </th>
                <th className="text-right px-4 py-3 font-semibold text-orange-500 border-b border-gray-100">
                  5%/an
                </th>
                <th className="text-right px-4 py-3 font-semibold text-primary-600 border-b border-gray-100">
                  7%/an
                </th>
                <th className="text-right px-4 py-3 font-semibold text-emerald-600 border-b border-gray-100">
                  9%/an
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { y: 10, inv: "36 000 €", p5: "46 500 €", p7: "51 900 €", p9: "58 200 €" },
                { y: 15, inv: "54 000 €", p5: "79 500 €", p7: "95 200 €", p9: "116 100 €" },
                { y: 20, inv: "72 000 €", p5: "123 900 €", p7: "156 300 €", p9: "200 400 €", highlight: true },
                { y: 25, inv: "90 000 €", p5: "182 800 €", p7: "243 200 €", p9: "318 700 €" },
                { y: 30, inv: "108 000 €", p5: "251 100 €", p7: "366 300 €", p9: "546 900 €" },
              ].map((row, i) => (
                <tr
                  key={row.y}
                  className={row.highlight ? "bg-primary-50/60 font-semibold" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-50 font-semibold">
                    {row.y} ans
                    {row.highlight && (
                      <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">
                        référence
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 border-b border-gray-50">
                    {row.inv}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-600 font-semibold border-b border-gray-50">
                    {row.p5}
                  </td>
                  <td className="px-4 py-3 text-right text-primary-700 font-bold border-b border-gray-50">
                    {row.p7}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-semibold border-b border-gray-50">
                    {row.p9}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500">
          Rendements nets de frais TER 0,20%/an. Hors inflation et fiscalité.
          Données historiques ne garantissent pas les performances futures.
        </p>
      </section>

      {/* ── Section 2 : Objectif retraite + FIRE ──────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Objectif retraite : combien de temps faut-il ?
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          La règle des 4% est une approximation utilisée dans la planification
          de l&apos;indépendance financière : un portefeuille peut être retiré
          à 4%/an sans s&apos;épuiser sur 30 ans, selon les données historiques.
        </p>
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 mb-6">
          <p className="text-sm font-semibold text-primary-800 mb-2">
            Comment lire ce tableau
          </p>
          <p className="text-sm text-primary-700 leading-relaxed">
            Capital cible = rente mensuelle souhaitée × 300.
            Exemple : pour 1 000€/mois de rente, il faut 300 000€ de capital.
            Avec 300€/mois à 7%/an, ce capital est atteint en environ 28 ans.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Rente souhaitée
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Capital cible
                </th>
                <th className="text-right px-4 py-3 font-semibold text-primary-600 border-b border-gray-100">
                  Durée (7%/an)
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Usage typique
                </th>
              </tr>
            </thead>
            <tbody>
              {FIRE_TABLE.map((row, i) => (
                <tr
                  key={row.rente}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-3 font-bold text-gray-900 border-b border-gray-50">
                    {row.rente}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 border-b border-gray-50">
                    {row.capital}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary-700 border-b border-gray-50">
                    {row.duree}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs border-b border-gray-50">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Ce que ces chiffres signifient concrètement
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Un salarié de 30 ans qui commence à investir 300€/mois aujourd&apos;hui
            peut espérer atteindre 156 000€ à 50 ans (avec 7%/an) — soit
            environ <strong>520€/mois de rente via la règle des 4%</strong>.
            Cela ne remplace pas un salaire complet, mais complète
            significativement la retraite par répartition. À 60 ans (30 ans
            d&apos;investissement), le capital atteint 366 000€, soit{" "}
            <strong>1 220€/mois de rente</strong>.
          </p>
        </div>
      </section>

      {/* ── CTA Simulateur — slate-950 glass (mirror TrackingPitch) ───── */}
      <section className="relative mb-14 rounded-2xl bg-slate-950 p-8 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(500px circle at 50% 40%, rgba(59, 130, 246, 0.2), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <h2 className="text-xl font-bold text-white mb-2">
            Projetez votre horizon retraite personnalisé
          </h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed max-w-md mx-auto">
            Ajustez le versement, la durée et les frais selon votre situation.
            Pour les utilisateurs Premium : l&apos;analyse Monte Carlo simule
            1 000 marchés possibles et donne la distribution réelle de vos
            résultats — pas juste une ligne optimiste.
          </p>
          <Link
            href="/simulateur?monthly=300&years=20&return=7&fees=0.2"
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-950 font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Simuler avec 300€/mois →
          </Link>
          <p className="mt-4 text-slate-400 text-xs">
            Gratuit · 3 scénarios · Export PDF · Analyse Monte Carlo en Premium
          </p>
        </div>
      </section>

      {/* ── Section 3 : Comparaison A vs B ───────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          300€/mois 20 ans vs 400€/mois 15 ans : lequel gagne ?
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Une question courante : vaut-il mieux investir plus longtemps avec
          moins, ou moins longtemps avec plus ? La simulation chiffrée surprend
          souvent.
        </p>
        {/* 2 cards siblings au même traitement visuel (bg-white + border
            slate-200/70). Différenciation de A via un pill "Recommandée"
            uniquement. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Stratégie A
              </p>
              <span className="inline-flex items-center bg-primary-50 text-primary-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-primary-100 uppercase tracking-wide">
                Recommandée
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              300€/mois · <strong>20 ans</strong>
            </p>
            <p className="text-3xl font-bold text-primary-700 mb-1 tabular-nums">
              156 300 €
            </p>
            <p className="text-xs text-gray-500">
              total investi : 72 000€
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Stratégie B
            </p>
            <p className="text-sm text-gray-600 mb-1">
              400€/mois · <strong>15 ans</strong>
            </p>
            <p className="text-3xl font-bold text-gray-700 mb-1 tabular-nums">
              126 900 €
            </p>
            <p className="text-xs text-gray-500">
              total investi : 72 000€
            </p>
          </div>
        </div>
        {/* Insight callout — container neutre, amber UNIQUEMENT sur un
            petit pill d'ouverture. */}
        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card p-5">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3">
            <span>⚡ Insight</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Même montant total investi — mais 29 400€ d&apos;écart
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Les deux stratégies impliquent 72 000€ de versements totaux.
            Pourtant, A bat B de 29 400€ — uniquement grâce à 5 ans
            supplémentaires de capitalisation. Le temps, pas le montant,
            est le paramètre le plus puissant de l&apos;investissement
            à long terme.
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Comparez vos propres stratégies en temps réel avec la{" "}
          <Link
            href="/simulateur"
            className="text-primary-600 underline hover:text-primary-700 transition-colors"
          >
            fonctionnalité A vs B du simulateur →
          </Link>
        </p>
      </section>

      {/* ── Section 4 : Incertitude / Monte Carlo ─────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          L&apos;incertitude des marchés : pourquoi 7% n&apos;est pas garanti
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Ces projections utilisent un rendement annuel moyen fixe. En
          réalité, les marchés sont volatils : certaines années +20%,
          d&apos;autres −30%. L&apos;ordre de ces rendements change
          significativement le résultat final.
        </p>
        {/* 3 tiles siblings au même traitement (bg-white + border slate-200/70).
            La couleur ne vit QUE sur la valeur et sur le label de percentile,
            jamais sur le fond de la tile. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Pire cas (10e percentile)",
              value: "≈ 98 000 €",
              sub: "1 marché sur 10",
              color: "text-orange-600",
            },
            {
              label: "Médiane (50e percentile)",
              value: "≈ 148 000 €",
              sub: "résultat médian",
              color: "text-primary-700",
            },
            {
              label: "Meilleur cas (90e percentile)",
              value: "≈ 218 000 €",
              sub: "1 marché sur 10",
              color: "text-emerald-700",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200/70 bg-white shadow-card p-4 text-center"
            >
              <p className="text-xs text-gray-500 mb-2 leading-snug">
                {s.label}
              </p>
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>
                {s.value}
              </p>
              <p className={`text-xs mt-1 ${s.color}`}>{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Ces chiffres viennent d&apos;une analyse Monte Carlo
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            L&apos;analyse Monte Carlo simule 1 000 marchés différents avec
            la volatilité historique des ETF actions (≈ 15%/an). Elle donne
            une distribution de probabilités — bien plus utile qu&apos;une
            seule projection à 7%.
          </p>
          <Link
            href="/simulateur?monthly=300&years=20&return=7&fees=0.2"
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            Voir l&apos;analyse Monte Carlo dans le simulateur →
          </Link>
        </div>
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
              href: "/investir-100-euros-mois-etf",
              title: "Simulation avec 100€/mois",
              desc: "Le point d'entrée pour commencer petit.",
            },
            {
              href: "/investir-200-euros-mois-etf",
              title: "Simulation avec 200€/mois",
              desc: "La simulation complète pour un budget intermédiaire.",
            },
            {
              href: "/strategie-dca",
              title: "La stratégie DCA expliquée",
              desc: "Principes, avantages, erreurs courantes.",
            },
            {
              href: "/interets-composes",
              title: "Les intérêts composés",
              desc: "La mécanique derrière l'accélération du capital.",
            },
            {
              href: "/pea-ou-cto",
              title: "PEA ou CTO pour 300€/mois",
              desc: "Fiscalité, plafonds, comparatif complet.",
            },
            {
              href: "/meilleurs-etf-debutants",
              title: "Quels ETF choisir ?",
              desc: "CW8, VWCE, PAEEM — notre sélection commentée.",
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

      <EmailCapture source="simulation_300" />
      </div>
    </div>
  );
}
