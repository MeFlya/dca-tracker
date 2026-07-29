import type { Metadata } from "next";
import Link from "next/link";
import { Repeat } from "lucide-react";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { JsonLd } from "@/components/ui/JsonLd";
import { EducationalHeader } from "@/components/ui/EducationalHeader";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";

// Repositionnement, pas simple réécriture : les requêtes « méthode dca » et
// « dca investissement » sont à la position 47+. La question réellement posée
// est « DCA ou tout investir d'un coup ? », et la littérature disponible est
// américaine et en dollars. La page a déjà la section #dca-vs-lump-sum pour y
// répondre.
const TITLE = "DCA ou tout investir d'un coup ? Ce que disent les chiffres";
// ⚠️ Cette meta a été fausse deux fois de suite. Elle a promis un backtest
// MSCI World en euros (inexistant), puis « ce que dit l'étude Vanguard » —
// alors que Vanguard n'apparaît QUE dans le bloc de sources en bas de page :
// la section ne reprend aucun de ses chiffres. Elle décrit désormais ce que la
// page contient réellement : un comparatif point par point et un verdict.
//
// 🔴 Le vrai problème est dans la section, pas dans la balise. L'illustration
// chiffrée (DCA +38,9 % contre lump sum +10 %) repose sur un scénario à six
// mois choisi avec une correction au milieu, pendant que la FAQ de la même page
// écrit que le lump sum gagne « environ 2/3 du temps ». Sur un site dont
// l'argument est « hypothèses transparentes », c'est la section la plus faible.
// Le backtest IWDA en euros depuis 2009 existe déjà dans /backtest : comparer
// lump sum au départ contre DCA sur cette série est une variante du code
// existant, pas une nouvelle étude. À traiter — la meta pourra alors
// revendiquer des chiffres réels.
const DESCRIPTION =
  "DCA contre investissement en une fois : le comparatif point par point, et pourquoi le DCA reste la seule option réaliste quand on épargne chaque mois.";

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
    href: "/comparatif",
    linkLabel: "Comparer les courtiers PEA →",
  },
  {
    n: "2",
    title: "Choisir un ETF monde",
    body: "Un seul ETF suffit pour démarrer. Le CW8 (Amundi MSCI World) ou l'EWLD (iShares MSCI World) couvrent 1 500 entreprises mondiales et sont éligibles PEA.",
    href: "/meilleurs-etf-debutants",
    linkLabel: "Voir les meilleurs ETF →",
  },
  {
    n: "3",
    title: "Fixer un montant mensuel",
    body: "Choisissez un montant que vous pouvez maintenir sans effort — même 50 € par mois. La régularité prime sur le montant.",
    href: "/simulateur",
    linkLabel: "Simuler ma projection →",
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
        <p className="text-gray-600 leading-relaxed mt-4">
          Le moteur mathématique sous-jacent, ce sont{" "}
          <Link href="/interets-composes" className="text-primary-700 font-medium hover:underline">
            les intérêts composés
          </Link>
          {" "}: chaque versement mensuel s&apos;ajoute au capital qui produit
          déjà des gains, et ce sont ces gains réinvestis qui font la différence
          sur 20-30 ans.
        </p>
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
        {/* ⚠️ Ce bloc reste une DÉMONSTRATION DE MÉCANIQUE, jamais un verdict.
            Le scénario est construit pour que le DCA gagne : le prix baisse puis
            remonte exactement dans la fenêtre de versement. Présenté seul, il
            contredisait la section statistique plus bas — la page se
            contredisait sur son propre sujet. L'avertissement est donc passé
            AVANT le chiffre, pas après, et le chiffre du versement unique est
            annoncé dans la même phrase. */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            Attention : ce scénario est construit pour montrer le mécanisme
          </p>
          <p className="text-sm text-amber-700 leading-relaxed">
            Le prix baisse puis remonte exactement pendant la période de
            versement — c&apos;est le cas de figure le plus favorable au
            versement programmé, et il est choisi pour rendre la mécanique
            visible. Sur ce scénario précis, le versement programmé fait{" "}
            <strong>+38,9 %</strong> contre <strong>+10 %</strong> pour un
            placement unique au mois 1 (1 800 € à 100 € l&apos;unité = 18 parts,
            revendues 110 € = 1 980 €).
            <br />
            <br />
            <strong>Ne tirez aucune conclusion de ce chiffre.</strong> Sur
            l&apos;historique réel, c&apos;est l&apos;inverse qui domine : tout
            investir d&apos;un coup l&apos;emporte environ deux fois sur trois.
            Les chiffres, leur cadre et la seule situation où l&apos;étalement
            gagne vraiment sont plus bas.
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          <Link href="#dca-vs-lump-sum" className="underline hover:text-gray-600 transition-colors">
            Voir la comparaison complète →
          </Link>
        </p>
      </section>

      {/* ── Section 3: DCA vs Lump Sum ────────────────────────────────────── */}
      {/* ─── DCA vs lump sum ────────────────────────────────────────────────
          Section entièrement réécrite. L'ancienne version citait Vanguard dans
          le bloc de sources SANS en reprendre un seul chiffre, puis illustrait
          avec un scénario à six mois construit pour que le DCA gagne (+38,9 %
          contre +10 %) — alors que la FAQ de la même page écrivait que le lump
          sum gagne « environ 2/3 du temps ». La page se contredisait sur son
          propre sujet.
          Tous les chiffres ci-dessous ont été relevés page par page dans le PDF
          de l'étude ; le relevé est consigné dans VERIF-VANGUARD.md à la racine
          du dépôt. Ne modifier aucun de ces nombres sans y retourner. */}
      <section className="mb-14" id="dca-vs-lump-sum">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ce que disent les chiffres — et dans quel cadre exactement
        </h2>

        <p className="text-gray-600 leading-relaxed mb-6">
          <strong className="text-gray-900">
            Pour la plupart des gens, la question ne se pose pas.
          </strong>{" "}
          Si vous investissez une part de votre salaire chaque mois, vous
          n&apos;avez pas de somme à placer d&apos;un coup : le versement
          programmé n&apos;est pas une stratégie que vous choisissez face à une
          autre, c&apos;est la seule dont vous disposez. Le débat qui suit ne
          concerne qu&apos;une situation précise — vous venez de recevoir une
          somme exceptionnelle : un héritage, une prime, le produit d&apos;une
          vente. Et vous vous demandez s&apos;il faut tout placer maintenant ou
          étaler sur quelques mois.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Le chiffre, et son cadre
        </h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          L&apos;étude de référence est celle de Vanguard,{" "}
          <em>Cost averaging: Invest now or temporarily hold your cash?</em>,
          publiée en février 2023. Son résultat principal :
        </p>
        <blockquote className="border-l-4 border-primary-200 pl-5 py-1 mb-5">
          <p className="text-lg font-semibold text-gray-900 leading-snug">
            Tout investir d&apos;un coup a produit plus de richesse que
            l&apos;étalement dans 68 % des cas.
          </p>
        </blockquote>
        <p className="text-gray-600 leading-relaxed mb-4">
          Ce chiffre ne veut rien dire sans son cadre, alors le voici en entier :
          portefeuille <strong>100 % actions</strong>, somme étalée sur{" "}
          <strong>trois mois</strong> en trois versements égaux, richesse
          comparée <strong>au bout d&apos;un an</strong>, sur l&apos;indice{" "}
          <strong>MSCI World en dollars de 1976 à 2022</strong>, l&apos;argent en
          attente ne rapportant <strong>aucun intérêt</strong>.
        </p>
        <p className="text-gray-600 leading-relaxed mb-5">
          Chacune de ces conditions compte. Si l&apos;on rémunère l&apos;argent
          en attente au taux du bon du Trésor américain à trois mois, le taux
          tombe à <strong>65 %</strong>. Et pour un investisseur en euros, la
          série disponible dans l&apos;étude ne commence pas en 1976 mais en{" "}
          <strong>1998</strong> :
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 bg-gray-50 font-semibold text-gray-500 border-b border-gray-100">
                  Somme étalée sur
                </th>
                <th className="text-center px-4 py-3 bg-gray-50 font-semibold text-gray-600 border-b border-gray-100">
                  Tout d&apos;un coup l&apos;emporte
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { d: "3 mois", v: "66,4 %", fort: false },
                { d: "4 mois", v: "66,8 %", fort: false },
                { d: "5 mois", v: "67,2 %", fort: false },
                { d: "6 mois", v: "67,9 %", fort: true },
              ].map((row, i) => (
                <tr key={row.d} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 text-gray-600 font-medium border-b border-gray-50">
                    {row.d}
                  </td>
                  <td className={`px-4 py-3 text-center border-b border-gray-50 tabular-nums ${row.fort ? "font-bold text-gray-900" : "text-gray-600"}`}>
                    {row.v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* ⚠️ Ligne « Global EUR » de la Figure 6, PAS la ligne « Europe » :
            celle-ci est adossée au MSCI Europe, un portefeuille d'actions
            européennes, et sa courbe est plate. Le lecteur de cette page
            investit en MSCI World. */}
        <p className="text-xs text-gray-500 mb-6">
          MSCI World en euros, 1998-2022, 100 % actions, mesure à un an.
        </p>

        <p className="text-gray-600 leading-relaxed mb-8">
          Le sens de la pente est la seule chose vraiment utile de ce tableau :{" "}
          <strong className="text-gray-900">
            plus on étale longtemps, plus souvent le versement unique
            l&apos;emporte.
          </strong>{" "}
          L&apos;étude le formule ainsi : plus l&apos;horizon d&apos;étalement
          est long, plus le coût d&apos;opportunité est élevé. Étaler, c&apos;est
          rester en liquidités plus longtemps, et rester en liquidités a un prix.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Pourquoi mesurer à un an ne change rien
        </h3>
        <p className="text-gray-600 leading-relaxed mb-8">
          L&apos;objection naturelle est qu&apos;un an, c&apos;est court. Elle
          tombe pour une raison mécanique : une fois l&apos;étalement terminé,
          les deux portefeuilles détiennent exactement les mêmes actifs. Celui
          qui en détient le plus à cet instant le restera indéfiniment. Le
          classement est décidé à la fin de l&apos;étalement, et il ne
          s&apos;inverse plus jamais — seul l&apos;écart en euros continue de
          grandir. Autrement dit, la décision se joue sur quelques mois, et pas
          sur la durée de votre investissement.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Ce que l&apos;étude dit aussi, et qu&apos;on ne cite jamais
        </h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          <strong className="text-gray-900">
            L&apos;étalement l&apos;emporte exactement là où on a peur.
          </strong>{" "}
          Sur 100 000 $ placés en actions, au bout d&apos;un an, dans les 5 % de
          scénarios les plus défavorables :
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-5">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 bg-gray-50 font-semibold text-gray-500 border-b border-gray-100"></th>
                <th className="text-center px-4 py-3 bg-gray-50 font-semibold text-gray-600 border-b border-gray-100">
                  Tout d&apos;un coup
                </th>
                <th className="text-center px-4 py-3 bg-primary-50 font-bold text-primary-700 border-b border-primary-100">
                  Étalé sur 3 mois
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-4 py-3 text-gray-600 font-medium">5ᵉ percentile</td>
                <td className="px-4 py-3 text-center font-bold text-gray-900 tabular-nums">82 947 $</td>
                <td className="px-4 py-3 text-center font-bold text-primary-700 tabular-nums">85 906 $</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-gray-600 leading-relaxed mb-6">
          L&apos;étude le dit dans ses propres termes : le versement unique
          l&apos;emporte dans tous les cas <strong>sauf les pires</strong> — en
          dessous du 25ᵉ percentile. Le versement unique gagne plus souvent et
          gagne davantage : <strong>2,2 % de plus à la médiane</strong>, en
          actions, au bout d&apos;un an. L&apos;étalement, lui, ne gagne que dans
          le scénario dont vous avez peur. Ce n&apos;est pas un compromis :
          c&apos;est le seul argument valable en sa faveur, et il est suffisant
          si c&apos;est ce scénario-là qui vous empêche d&apos;appuyer sur le
          bouton.
        </p>

        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 mb-8">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Et attendre reste la pire option des trois
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Étaler sa mise a battu le fait de rester en liquidités{" "}
            <strong>69 % du temps</strong>. Si l&apos;hésitation porte non pas
            sur <em>comment</em> entrer mais sur <em>quand</em>, l&apos;étude
            répond que ne pas entrer perd contre les deux.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Ce que ces chiffres ne disent pas
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Ils portent sur des dollars, sur des étalements de trois à six mois, et
          sur une richesse mesurée au bout d&apos;un an. Ils ne disent rien de ce
          qui serait arrivé à quelqu&apos;un qui aurait tout placé au sommet
          d&apos;octobre 2007, en euros, et de ce qu&apos;il serait devenu
          jusqu&apos;à aujourd&apos;hui. C&apos;est la question que nous
          calculons, et nous publierons le résultat qu&apos;il soit favorable ou
          non à l&apos;étalement.
        </p>
        <p className="text-gray-600 leading-relaxed mt-5">
          Quelle que soit l&apos;approche retenue, le choix du support compte
          autant que le rythme : notre{" "}
          <Link href="/comparatif-etf" className="text-primary-700 font-medium hover:underline">
            comparatif des ETF
          </Link>
          {" "}met face à face les principales options MSCI World et S&amp;P 500
          pour vous aider à choisir le bon ETF avant de lancer vos versements.
        </p>
      </section>

      {/* ── Section 4: Comment démarrer ───────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comment démarrer une stratégie DCA avec des ETF
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Avant les quatre étapes pratiques, une décision en amont conditionne
          tout : le choix de l&apos;enveloppe fiscale. Notre comparatif{" "}
          <Link href="/pea-ou-cto" className="text-primary-700 font-medium hover:underline">
            PEA ou CTO
          </Link>
          {" "}détaille l&apos;enveloppe qui maximise un DCA long terme en
          France, avec un calcul chiffré de l&apos;économie d&apos;impôt sur
          20 ans.
        </p>
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
                  {step.href && step.linkLabel && (
                    <>
                      {" "}
                      <Link href={step.href} className="text-primary-600 hover:text-primary-700 underline transition-colors">
                        {step.linkLabel}
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

      <SourcesReferences
        sources={[
          {
            // Source des chiffres de la section « Ce que disent les chiffres ».
            // Relevé page par page dans VERIF-VANGUARD.md.
            label: "Cost averaging: Invest now or temporarily hold your cash? (étude)",
            url: "https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf",
            publisher: "Vanguard Research, février 2023",
            note: "Source des 68 %, du tableau par durée d'étalement et des percentiles cités. Cadre : 100 % actions, étalement sur 3 mois, mesure à 1 an, liquidités non rémunérées.",
          },
          {
            label: "Dollar-Cost Averaging Just Means Taking Risk Later (étude)",
            url: "https://corporate.vanguard.com/content/dam/corp/research/pdf/Dollar-cost-averaging-just-means-taking-risk-later.pdf",
            publisher: "Vanguard Research",
            note: "Étude antérieure sur 64 ans de données US/UK/Australie. Conclusions convergentes ; aucun chiffre de la page n'en est tiré.",
          },
          {
            label: "Espace épargnants — investir progressivement",
            url: "https://www.amf-france.org/fr/espace-epargnants",
            publisher: "Autorité des marchés financiers (AMF)",
          },
          {
            label: "MSCI World Index — méthodologie et historique",
            url: "https://www.msci.com/indexes/index/990100",
            publisher: "MSCI Inc.",
            note: "Indice de référence pour la diversification mondiale utilisée dans les exemples DCA.",
          },
          {
            label: "Risques liés à l'investissement en actions",
            url: "https://www.amf-france.org/fr/espace-epargnants/savoir-bien-investir/principes-pour-bien-investir/diversifier",
            publisher: "AMF",
          },
        ]}
      />

      <EmailCapture source="guide_dca" />
    </div>
  );
}
