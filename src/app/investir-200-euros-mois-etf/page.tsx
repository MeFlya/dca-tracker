import type { Metadata } from "next";
import Link from "next/link";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";

const TITLE =
  "Investir 200€ par mois en ETF : simulation complète sur 10, 20 et 30 ans";
const DESCRIPTION =
  "200€/mois investi en ETF pendant 20 ans = 104 000€. Simulation avec 3 scénarios (5%, 7%, 9%), impact des frais, fiscalité PEA vs CTO. Résultat interactif, sans inscription.";
const CANONICAL = "/investir-200-euros-mois-etf";

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

const MATRIX = [
  {
    rate: "5 %/an",
    label: "Pessimiste",
    color: "text-orange-600",
    headerBg: "bg-orange-50",
    years: [
      { y: 10, invested: "24 000 €", final: "31 000 €", pct: "+29 %" },
      { y: 20, invested: "48 000 €", final: "82 600 €", pct: "+72 %" },
      { y: 30, invested: "72 000 €", final: "167 400 €", pct: "+133 %" },
    ],
  },
  {
    rate: "7 %/an",
    label: "Réaliste",
    color: "text-primary-700",
    headerBg: "bg-primary-50",
    years: [
      { y: 10, invested: "24 000 €", final: "34 600 €", pct: "+44 %" },
      { y: 20, invested: "48 000 €", final: "104 200 €", pct: "+117 %" },
      { y: 30, invested: "72 000 €", final: "244 200 €", pct: "+239 %" },
    ],
  },
  {
    rate: "9 %/an",
    label: "Optimiste",
    color: "text-emerald-700",
    headerBg: "bg-emerald-50",
    years: [
      { y: 10, invested: "24 000 €", final: "38 800 €", pct: "+62 %" },
      { y: 20, invested: "48 000 €", final: "133 600 €", pct: "+178 %" },
      { y: 30, invested: "72 000 €", final: "364 600 €", pct: "+406 %" },
    ],
  },
];

const FAQ = [
  {
    q: "Combien vaut 200€/mois en ETF après 20 ans ?",
    a: "Avec un rendement annuel moyen de 7% (référence historique MSCI World), 200€/mois pendant 20 ans donne environ 104 200€. Vous avez investi 48 000€ de votre poche — les 56 200€ restants sont générés par les marchés via les intérêts composés. En scénario pessimiste à 5%, le résultat est de 82 600€. En scénario optimiste à 9%, il dépasse 133 600€.",
  },
  {
    q: "L'inflation réduit-elle vraiment les gains ?",
    a: "Oui, l'inflation érode le pouvoir d'achat du capital final. Avec 2%/an d'inflation sur 20 ans, 104 200€ nominaux valent environ 70 000€ en euros constants d'aujourd'hui — soit tout de même un gain réel de +46% sur votre mise. Pour intégrer l'inflation dans votre simulation, utilisez notre simulateur et activez le paramètre inflation.",
  },
  {
    q: "DCA à 200€/mois ou mettre 48 000€ d'un coup (lump sum) ?",
    a: "Statistiquement, le lump sum surperforme le DCA environ 2/3 du temps sur les marchés longs et haussiers. Mais le DCA élimine le risque de mauvais timing. Si vous avez 48 000€ d'un coup et que vous êtes à l'aise avec la volatilité, le lump sum peut être optimal. Pour la grande majorité des salariés qui investissent depuis leur revenu mensuel, le DCA est la seule stratégie réaliste — et elle fonctionne très bien.",
  },
  {
    q: "Peut-on augmenter progressivement son versement ?",
    a: "Oui, et c'est même recommandé. Commencer à 200€ et augmenter de 10% chaque année est une stratégie courante : votre versement suit l'évolution de votre salaire sans effort psychologique. Si vous passez de 200€ à 220€ après un an, puis 242€ l'année suivante, etc., votre capital final à 20 ans dépasse 130 000€ — soit 25 000€ de plus que si vous êtes resté à 200€ fixe.",
  },
  {
    q: "Quel est le meilleur courtier pour investir 200€/mois en ETF ?",
    a: "Pour un PEA avec 200€/mois, les options populaires en France sont Boursorama (PEA gratuit, ordres à partir de 0,99€), Trade Republic (interface simple, 1€ par ordre — et 0€ en plan d'épargne programmée), et Fortuneo (PEA avec ordres gratuits sous conditions). La priorité : zéro frais de tenue de compte, frais d'ordre faibles et ETF MSCI World disponibles.",
  },
];

export default function Investir200EurosMoisPage() {
  return (
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
          Investir 200€/mois en ETF
        </span>
      </nav>

      {/* H1 + intro */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Investir 200€ par mois en ETF : simulation complète
      </h1>
      <p className="text-lg text-gray-500 mb-12 leading-relaxed">
        200€ par mois. Un montant accessible pour de nombreux salariés.
        Investi régulièrement en ETF sur 20 ans à 7% de rendement, ce
        versement donne{" "}
        <strong className="text-gray-700">104 200€</strong> — dont{" "}
        <strong className="text-gray-700">56 200€ générés par les marchés</strong>{" "}
        sans effort supplémentaire. Voici la simulation dans tous ses détails.
      </p>

      {/* ── Bloc résultat mis en avant ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-8 text-white mb-14">
        <p className="text-primary-200 text-sm font-medium mb-2">
          200€/mois · 20 ans · 7%/an · TER 0,20%
        </p>
        <p className="text-5xl font-bold tabular-nums mb-1">104 200 €</p>
        <p className="text-primary-200 text-sm mb-6">
          dont 48 000€ que vous avez versés — et 56 200€ que les marchés
          ont générés à votre place
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-primary-200 text-xs mb-1">Capital investi</p>
            <p className="font-bold text-base">48 000 €</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-primary-200 text-xs mb-1">Gain marché</p>
            <p className="font-bold text-base text-emerald-300">+56 200 €</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-primary-200 text-xs mb-1">Performance</p>
            <p className="font-bold text-base text-emerald-300">+117 %</p>
          </div>
        </div>
      </div>

      {/* ── Section 1 : Matrice scénarios × durées ────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          La matrice complète : 3 scénarios × 3 durées
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Personne ne connaît le rendement futur des marchés. La bonne
          approche : simuler les trois cas de figure et décider en
          connaissance de cause.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  Scénario
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  10 ans
                  <span className="block text-xs font-normal text-gray-500">
                    investi 24 000€
                  </span>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  20 ans
                  <span className="block text-xs font-normal text-gray-500">
                    investi 48 000€
                  </span>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 border-b border-gray-100">
                  30 ans
                  <span className="block text-xs font-normal text-gray-500">
                    investi 72 000€
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row, i) => (
                <tr
                  key={row.rate}
                  className={row.label === "Réaliste" ? "bg-primary-50/60" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-4 border-b border-gray-50">
                    <span className={`font-bold ${row.color}`}>
                      {row.label}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {row.rate}
                    </span>
                  </td>
                  {row.years.map(({ y, final, pct }) => (
                    <td
                      key={y}
                      className="px-4 py-4 text-right border-b border-gray-50"
                    >
                      <span className={`font-bold text-base block ${row.color}`}>
                        {final}
                      </span>
                      <span className="text-xs text-gray-500">{pct}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Les rendements historiques du MSCI World se situent autour de 7-8%/an
          sur 30 ans. Ils ne garantissent pas les performances futures.
        </p>
      </section>

      {/* ── Section 2 : Coût du retard ────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Commencer maintenant vs dans 5 ans : le vrai coût
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5 sm:col-span-2">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-3">
              Commencer aujourd&apos;hui · 20 ans
            </p>
            <p className="text-3xl font-bold text-primary-700 mb-1">
              104 200 €
            </p>
            <p className="text-xs text-gray-500">dont 48 000€ investis</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Attendre 5 ans · 15 ans
            </p>
            <p className="text-3xl font-bold text-gray-600 mb-1">63 400 €</p>
            <p className="text-xs text-gray-500">dont 36 000€ investis</p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            5 ans d&apos;attente = 40 800€ perdus
          </p>
          <p className="text-sm text-amber-700 leading-relaxed">
            En attendant 5 ans, vous investissez 12 000€ de moins — mais vous
            perdez 40 800€ de capital final. La différence (28 800€) correspond
            aux gains que les marchés auraient générés pendant ces 5 ans
            supplémentaires. Le temps est l&apos;ingrédient le plus précieux
            de l&apos;investissement.
          </p>
        </div>
      </section>

      {/* ── Section 3 : Effet des frais ───────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          L&apos;ennemi silencieux : l&apos;impact des frais sur 20 ans
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Pour un versement de 200€/mois sur 20 ans, voici ce que chaque
          niveau de frais annuels (TER) vous coûte réellement :
        </p>
        <div className="space-y-3">
          {[
            {
              label: "ETF MSCI World (CW8, EWLD)",
              ter: "0,12 %",
              final: "103 800 €",
              note: "Référence",
              color: "text-primary-700",
              bg: "bg-primary-50 border-primary-100",
            },
            {
              label: "ETF généraliste",
              ter: "0,20 %",
              final: "103 200 €",
              note: "−600 €",
              color: "text-gray-700",
              bg: "bg-white border-gray-100",
            },
            {
              label: "Fonds actif standard",
              ter: "0,50 %",
              final: "99 200 €",
              note: "−4 600 €",
              color: "text-orange-600",
              bg: "bg-white border-gray-100",
            },
            {
              label: "Assurance-vie classique",
              ter: "1,00 %",
              final: "92 400 €",
              note: "−11 400 €",
              color: "text-red-600",
              bg: "bg-white border-gray-100",
            },
          ].map((row) => (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${row.bg}`}
            >
              <div>
                <p className={`font-semibold text-sm ${row.color}`}>
                  {row.label}
                </p>
                <p className="text-xs text-gray-500">TER : {row.ter}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-bold tabular-nums ${row.color}`}>
                  {row.final}
                </p>
                <p className={`text-xs font-semibold ${row.color}`}>
                  {row.note}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Sur 20 ans avec 200€/mois, le choix d&apos;un ETF à 0,12% vs
          une assurance-vie à 1% représente{" "}
          <strong className="text-gray-700">11 400€ de différence</strong>.
          Les frais bas ne sont pas un détail — c&apos;est une décision
          financière majeure.
        </p>
      </section>

      {/* ── CTA Simulateur ────────────────────────────────────────────────── */}
      <section className="mb-14 rounded-2xl bg-primary-600 p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Ajustez selon votre situation réelle
        </h2>
        <p className="text-primary-200 text-sm mb-6 leading-relaxed max-w-md mx-auto">
          Modifiez le versement, la durée, l&apos;inflation et les frais.
          Les 3 scénarios se recalculent instantanément. Vous pouvez aussi
          comparer deux stratégies côte à côte.
        </p>
        <Link
          href="/simulateur?monthly=200&years=20&return=7&fees=0.2"
          className="btn-secondary text-sm px-6 py-2.5 inline-flex"
        >
          Simuler avec 200€/mois →
        </Link>
        <p className="mt-4 text-primary-300 text-xs">
          Gratuit · Sans inscription · Export PDF disponible
        </p>
      </section>

      {/* ── Section 4 : Fiscalité ─────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          La fiscalité : ce que vous gardez vraiment
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          104 200€ en PEA après 20 ans. Mais combien toucherez-vous réellement
          au moment du retrait ?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
            <p className="font-bold text-primary-700 mb-3">PEA — après 5 ans</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Capital final</span>
                <span className="font-bold text-gray-900">104 200 €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gains imposables</span>
                <span className="font-medium text-gray-700">56 200 €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Prélèvements sociaux (17,2%)</span>
                <span className="font-medium text-orange-600">−9 666 €</span>
              </div>
              <div className="flex justify-between border-t border-primary-100 pt-2">
                <span className="font-semibold text-primary-700">Net en poche</span>
                <span className="font-bold text-primary-700">94 534 €</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="font-bold text-gray-700 mb-3">CTO</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Capital final</span>
                <span className="font-bold text-gray-900">104 200 €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gains imposables</span>
                <span className="font-medium text-gray-700">56 200 €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">PFU (30%)</span>
                <span className="font-medium text-orange-600">−16 860 €</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-semibold text-gray-700">Net en poche</span>
                <span className="font-bold text-gray-700">87 340 €</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Avantage PEA : +7 194€ sur 20 ans
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Le PEA est le cadre fiscal optimal pour les résidents français
            investissant en ETF éligibles. Ouvrir un PEA maintenant (même
            vide) fait courir le délai des 5 ans dès aujourd&apos;hui.{" "}
            <Link
              href="/pea-ou-cto"
              className="text-primary-600 underline hover:text-primary-700 transition-colors"
            >
              Guide complet PEA vs CTO →
            </Link>
          </p>
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
              desc: "Même approche pour un budget plus modeste.",
            },
            {
              href: "/investir-300-euros-mois-etf",
              title: "Simulation avec 300€/mois",
              desc: "Accélérer sa trajectoire vers l'indépendance financière.",
            },
            {
              href: "/strategie-dca",
              title: "La stratégie DCA complète",
              desc: "Principes, exemples, erreurs à éviter.",
            },
            {
              href: "/interets-composes",
              title: "Les intérêts composés expliqués",
              desc: "Comprendre la mécanique derrière ces projections.",
            },
            {
              href: "/meilleurs-etf-debutants",
              title: "Quels ETF choisir ?",
              desc: "Notre sélection avec comparatif TER et liquidité.",
            },
            {
              href: "/pea-ou-cto",
              title: "PEA ou CTO ?",
              desc: "Quelle enveloppe pour 200€/mois — guide détaillé.",
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

      <EmailCapture source="simulation_200" />
    </div>
  );
}
