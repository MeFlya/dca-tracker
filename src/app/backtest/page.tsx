// /backtest — Page Premium : "ce qu'aurait DONNÉ votre DCA dans la vraie vie".
//
// Différence avec /simulateur : le simulateur projette à partir d'un rendement
// THÉORIQUE constant (6-7 %/an). Cette page utilise des données HISTORIQUES
// RÉELLES du MSCI World (série publiée : XMWO.MI en EUR, cf. src/data/) → on
// voit les vrais creux COVID,
// 2022, 2018, etc.
//
// Pourquoi Premium : c'est la seule feature intrinsèquement RÉCURRENTE
// (on revient à chaque doute, chaque krach, chaque ajustement de stratégie),
// ce qui justifie l'abonnement vs un achat ponctuel.
//
// SEO : on tient à indexer cette page car le mot-clé "backtest DCA" est très
// peu adressé en FR. Mais le contenu sera "teaser" pour les non-Premium
// (formulaire visible mais grisé + CTA upgrade).
//
// ─── Rendu sans JavaScript (30/09/2026) ─────────────────────────────────────
//
// Un relevé du 29/09 (30 questions posées à ChatGPT, au mode IA de Google et
// à Copilot) a montré que le HTML servi ne contenait dans <main> qu'un
// squelette « Chargement du backtest… ». loading.tsx enveloppait toute la
// page dans une frontière Suspense ; la page attendait l'abonnement avant de
// rendre quoi que ce soit ; le h1 et le texte arrivaient donc dans un
// <div hidden> après le pied de page, que les robots qui n'exécutent pas le
// JavaScript ignorent souvent. Et même là, ils ne lisaient ni résultat ni
// date : seulement « Premium » et « Débloquer ».
//
// Désormais : loading.tsx est supprimé, la page elle-même n'attend plus rien
// et rend tout de suite le h1, les exemples déjà calculés (texte et tableau),
// la FAQ et la méthodologie. Seul l'outil, qui dépend de l'abonnement, attend
// dans sa propre frontière Suspense (<OutilBacktest />), avec le squelette
// qu'affichait loading.tsx. Le verrou Premium n'a pas bougé : c'est toujours
// BacktestClient qui le tient, avec le même booléen décidé côté serveur.

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getUserSubscription, isPremium } from "@/lib/subscription";
import {
  getAvailableRange,
  getDatasetMeta,
  formatEurBacktest,
  formatMonthFr,
  type BacktestResult,
} from "@/lib/backtest";
import {
  getBacktestStory,
  pireEcart,
  pireDepartSurLaSerie,
  backtestUpdatedAt,
} from "@/lib/backtest-stories";
import { dateEnToutesLettres } from "@/lib/etf-pea-verifies";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { JsonLd } from "@/components/ui/JsonLd";
import { BacktestClient } from "./BacktestClient";

const TITLE = "Backtest DCA MSCI World : ce qu'aurait donné votre stratégie";
const DESCRIPTION =
  "Reconstituez ce qu'un DCA mensuel sur le MSCI World aurait donné depuis 2008. Données réelles en EUR : krach 2008, COVID 2020, inflation 2022. TRI calculé, drawdown affiché. 3 scénarios célèbres en accès libre.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/backtest" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/backtest",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// La page ne lit plus l'abonnement à son niveau : seul <OutilBacktest /> le
// fait. On la garde rendue à chaque requête, comme avant, pour ne pas dépendre
// de la façon dont Next traite une lecture de session dont l'erreur est
// rattrapée (le .catch plus bas) : une version pré-rendue « gratuit » servie à
// un abonné serait le pire des cas.
export const dynamic = "force-dynamic";

// ─── Chiffres : tous calculés sur la série publiée ──────────────────────────
//
// Au niveau du module : la série est un fichier statique, ces calculs ne
// dépendent ni de la requête ni du visiteur. Aucun chiffre n'est écrit à la
// main — les montants, pourcentages et mois viennent de getBacktestStory()
// (les mêmes que sur les trois pages publiées) et de pireDepartSurLaSerie().

const META = getDatasetMeta();
const RANGE = getAvailableRange();

/** « 214,3 » : une décimale, virgule française. */
const un = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** « +214,3 % » — espace insécable avant le signe pour cent. */
const gainPct = (r: BacktestResult) => `${r.gainPct >= 0 ? "+" : "−"}${un(Math.abs(r.gainPct))}\u00a0%`;
/** « 12,6 % par an », ou un tiret si le TRI ne converge pas. */
const tri = (r: BacktestResult) =>
  r.irrAnnualPct === null ? "—" : `${un(r.irrAnnualPct)}\u00a0% par an`;

/**
 * Les trois histoires publiées, dans l'ordre de leur départ. Le contexte suit
 * « Départ en <mois> » : il ne redit pas le mois (30/09/2026, « Départ en
 * janvier 2022 (au début de 2022, …) » répétait l'année). La baisse de 2022 est
 * celle de la série, de fin 2021 à fin 2022 (ANNEE_2022 dans backtest-stories.ts,
 * −14,2 % au relevé du 2 septembre 2026).
 */
const EXEMPLES = [
  { slug: "backtest-depuis-2010", contexte: "le plus long des trois" },
  { slug: "backtest-covid-2020", contexte: "un mois avant le krach du COVID" },
  { slug: "backtest-2022-inflation", contexte: "juste avant une année de baisse" },
].map(({ slug, contexte }) => {
  const story = getBacktestStory(slug);
  return { ...story, contexte, pire: pireEcart(story.result) };
});

const [DEPUIS_2010] = EXEMPLES;
/** Le versement des trois histoires. Les phrases le disent commun : on le vérifie. */
const MENSUEL = DEPUIS_2010.def.monthlyAmount;
if (EXEMPLES.some((e) => e.def.monthlyAmount !== MENSUEL)) {
  throw new Error("/backtest : les exemples n'ont plus le même versement mensuel, le texte est à réécrire.");
}
const FIN = formatMonthFr(RANGE.max);
const RELEVE_LE = dateEnToutesLettres(META.fetchedAt);
const TER_FONDS = `${META.terAnnuelPct.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}\u00a0%`;

/**
 * Fiche de cotation de l'ETF dont la série reprend les cours (vérifiée le
 * 28/09/2026, cf. BacktestStoryPage). Revérifiée le 30/09/2026 : réponse 200,
 * page intitulée « Xtrackers Msci World Swap Ucits Etf […] LU0274208692 ». Elle
 * n'est pas dans les fichiers de faits, qui citent la série elle-même (fait
 * BT-00 : src/data/msci-world-eur.json).
 */
const SOURCE_SERIE_URL = "https://www.borsaitaliana.it/borsa/etf/scheda/LU0274208692-ETFP.html?lang=it";

const PIRE = pireDepartSurLaSerie(MENSUEL);
const COVID = EXEMPLES.find((e) => e.def.slug === "backtest-covid-2020");

// ─── FAQ ─────────────────────────────────────────────────────────────────────
//
// `id` : ancre stable pour qui cite une réponse (#faq-pire-moment), comme sur
// /etf-eligibles-pea. Les réponses chiffrées sont calculées ci-dessus ; celles
// qui ne portent aucun chiffre restent des littéraux, que l'index de recherche
// sait lire (scripts/build-search-index.mjs, lireSource()).
//
// « Pire moment » = le pire écart entre la valeur du portefeuille et le total
// versé (pireEcart), jamais maxDrawdown : au début d'un DCA, les versements
// masquent la baisse de la valeur (voir backtest-stories.ts).
const FAQ: { id: string; q: string; a: string }[] = [
  {
    id: "faq-pire-moment",
    q: "Quel a été le pire moment pour commencer un DCA sur le MSCI World\u00a0?",
    a: [
      `Sur la série que rejoue ce site (clôtures mensuelles en euros, de ${formatMonthFr(PIRE.debutSerie)} à ${formatMonthFr(PIRE.finSerie)}), le départ le plus éprouvé est ${formatMonthFr(PIRE.depart)}${PIRE.depart === PIRE.debutSerie ? ", le premier mois de la série" : ""}.`,
      `Au pire moment, en ${formatMonthFr(PIRE.creux.mois)}, un DCA de ${formatEurBacktest(MENSUEL)} par mois commencé en ${formatMonthFr(PIRE.depart)} valait ${formatEurBacktest(PIRE.creux.valeur)} pour ${formatEurBacktest(PIRE.creux.verse)} versés, soit ${un(PIRE.creux.pct)}\u00a0% de moins que le total versé.`,
      `En continuant d'acheter pendant la baisse, il valait ${formatEurBacktest(PIRE.resultat.finalValue)} en ${formatMonthFr(PIRE.finSerie)} pour ${formatEurBacktest(PIRE.resultat.totalInvested)} versés.`,
      COVID?.pire
        ? `Parmi les exemples publiés, le départ de ${formatMonthFr(COVID.def.startMonth)}, juste avant le krach du COVID, n'est descendu qu'à ${un(COVID.pire.pct)}\u00a0% sous le total versé, en ${formatMonthFr(COVID.pire.mois)}.`
        : "",
      PIRE.nbEnPerte === 0
        ? `Sur les ${PIRE.nbDeparts} départs mensuels rejoués, aucun ne finit sous le total versé en ${formatMonthFr(PIRE.finSerie)}\u00a0; ce constat dépend du mois d'arrivée.`
        : `Sur les ${PIRE.nbDeparts} départs mensuels rejoués, ${PIRE.nbEnPerte} finissent sous le total versé en ${formatMonthFr(PIRE.finSerie)}.`,
      // Le sommet d'octobre 2007 (commentaire d'en-tête de backtest.ts, fait
      // BT-15) : la phrase ne vaut que tant que la série commence après lui.
      PIRE.debutSerie > "2007-10"
        ? "La série ne couvre pas le sommet d'octobre 2007\u00a0: un départ plus tôt aurait pu faire pire."
        : "",
      "Les performances passées ne préjugent pas des performances futures.",
    ]
      .filter(Boolean)
      .join(" "),
  },
  {
    id: "faq-gratuit",
    q: "Le backtest est-il gratuit\u00a0?",
    a: "Les exemples de cette page le sont, comme les trois pages qui les détaillent\u00a0: ils sont calculés sur la même série que l'outil. L'outil interactif, qui rejoue votre montant et votre période, fait partie de l'abonnement Premium.",
  },
  {
    id: "faq-donnees",
    q: "Quelles données utilise ce backtest\u00a0?",
    a: `Les cours de clôture mensuels en euros de l'ETF Xtrackers MSCI World Swap UCITS ETF 1C (XMWO, ISIN LU0274208692), coté à Milan, de ${formatMonthFr(RANGE.min)} à ${FIN}, relevés le ${RELEVE_LE}. Ce fonds suit le MSCI World et réinvestit ses dividendes. Achat supposé au cours de clôture du dernier jour de bourse de chaque mois.`,
  },
  {
    id: "faq-frais",
    q: "Les frais et les impôts sont-ils déduits\u00a0?",
    a: `Les frais de gestion du fonds, oui\u00a0: ils sont prélevés en continu sur son actif, donc déjà dans les cours (${TER_FONDS} par an). Les frais de courtage et l'impôt, non\u00a0: ils dépendent de votre courtier et de votre enveloppe, PEA ou compte-titres. Le calculateur fiscal PEA/CTO chiffre l'impôt à part.`,
  },
  {
    id: "faq-avenir",
    q: "Un backtest dit-il ce que rapportera un DCA demain\u00a0?",
    a: "Non. Il rejoue une période passée, crises comprises. Une autre période, ou un autre mois d'arrivée, donne un autre résultat. Les performances passées ne préjugent pas des performances futures.",
  },
];

// ─── Outil : la seule partie qui dépend du visiteur ─────────────────────────

async function OutilBacktest({ minMonth, maxMonth }: { minMonth: string; maxMonth: string }) {
  // Subscription côté serveur — l'isPremium ne fuite jamais dans le HTML
  // public à part le boolean. Pas de PII.
  //
  // Repli en « gratuit » si la lecture échoue (30/09/2026), comme sur
  // /simulateur : un incident d'authentification affichait la page d'erreur
  // au lieu de la page. Le sens du repli est le bon — un incident n'ouvre
  // jamais une fonctionnalité payante.
  const premium = await getUserSubscription()
    .then((sub) => isPremium(sub.plan))
    .catch(() => false);

  return <BacktestClient isPremium={premium} minMonth={minMonth} maxMonth={maxMonth} />;
}

/** Ce qu'affichait loading.tsx pour l'outil (pastilles + formulaire), sans le reste de la page. */
function SqueletteOutil() {
  return (
    <div aria-busy="true">
      <div className="motion-safe:animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-16 rounded-xl border border-gray-100 bg-white" />
          ))}
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i}>
                <div className="h-3 w-32 rounded bg-gray-50 mb-2" />
                <div className="h-11 rounded-xl bg-gray-50" />
              </div>
            ))}
          </div>
          <div className="h-12 w-48 rounded-xl bg-gray-100" />
        </div>
      </div>
      <span className="sr-only">Chargement de l&apos;outil de backtest…</span>
    </div>
  );
}

export default function BacktestPage() {
  const range = RANGE;
  const meta = META;
  const r2010 = DEPUIS_2010.result;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Fil d'ariane"
          className="flex items-center gap-2 text-sm text-gray-500 mb-6"
        >
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <Link href="/simulateur" className="hover:text-gray-700 transition-colors">
            Simulateur
          </Link>
          <span aria-hidden>/</span>
          <span className="text-gray-700" aria-current="page">
            Backtest historique
          </span>
        </nav>

        {/* Header — la réponse d'abord (30/09/2026). Le badge « Premium » qui
            précédait le h1 est descendu sur l'outil, seule partie payante :
            les exemples ci-dessous sont en accès libre.
            Relecture du 30/09/2026 : c'est la phrase qu'un assistant citera,
            elle doit se suffire. DCA, TRI et ETF y sont donc expliqués à leur
            première apparition (la liste et le tableau reprennent « TRI »), et
            l'avertissement sur les performances passées suit le chiffre au lieu
            d'attendre la FAQ. */}
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Backtest historique · données réelles
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">
            Backtest DCA sur le MSCI World&nbsp;: ce qu&apos;aurait <em className="not-italic text-primary-700">vraiment</em> donné votre stratégie
          </h1>
          <ArticleByline
            publishedAt="2026-05-26"
            updatedAt={backtestUpdatedAt()}
            readingMinutes={4}
            url="/backtest"
            headline={TITLE}
            description={DESCRIPTION}
            className="mb-5"
          />
          <p className="text-lg text-gray-600 leading-relaxed">
            Sur les vrais cours du MSCI World en euros, un DCA, c&apos;est-à-dire{" "}
            {formatEurBacktest(MENSUEL)} investis chaque mois quel que soit le
            cours, commencé en {formatMonthFr(DEPUIS_2010.def.startMonth)}, valait{" "}
            <strong>{formatEurBacktest(r2010.finalValue)}</strong> en {FIN}, pour{" "}
            {formatEurBacktest(r2010.totalInvested)} versés&nbsp;: {gainPct(r2010)}, soit un
            rendement d&apos;environ {tri(r2010)}, mesuré par le{" "}
            <Link href="/glossaire/tri" className="text-primary-700 hover:underline">
              taux de rendement interne (TRI)
            </Link>
            , qui tient compte de la date de chaque versement. Ce n&apos;est pas
            une projection&nbsp;: ce sont les clôtures mensuelles d&apos;un ETF
            (fonds indiciel coté en bourse) qui suit le MSCI World, de{" "}
            {formatMonthFr(range.min)} à {FIN}, relevées le {RELEVE_LE}, frais du
            fonds compris, hors courtage et impôt. Les performances passées ne
            préjugent pas des performances futures.
          </p>
        </header>

        {/* ── Exemples déjà calculés — en texte ET en tableau ─────────────────
            Les trois histoires publiées, recalculées par getBacktestStory() :
            ce sont exactement les chiffres de leurs pages. */}
        <section aria-labelledby="exemples-deja-calcules" className="mb-12">
          <h2 id="exemples-deja-calcules" className="text-2xl font-bold text-gray-900 mb-3">
            Exemples déjà calculés
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Trois DCA de {formatEurBacktest(MENSUEL)} par mois,
            rejoués jusqu&apos;en {FIN}. «&nbsp;Pire écart&nbsp;»&nbsp;: l&apos;écart le plus
            défavorable entre la valeur du portefeuille et le total versé à ce
            moment-là, c&apos;est-à-dire la perte lue sur le relevé.
          </p>

          <ul className="space-y-3 mb-6">
            {EXEMPLES.map(({ def, result, contexte, pire }) => (
              <li key={def.slug} className="text-gray-700 leading-relaxed">
                <Link href={`/${def.slug}`} className="font-semibold text-primary-700 hover:underline">
                  Départ en {formatMonthFr(def.startMonth)}
                </Link>{" "}
                ({contexte})&nbsp;: {result.monthsInvested} versements, soit{" "}
                {formatEurBacktest(result.totalInvested)} versés, valaient{" "}
                {formatEurBacktest(result.finalValue)} en {FIN} ({gainPct(result)}, TRI
                d&apos;environ {tri(result)}).{" "}
                {pire
                  ? `Au pire moment, en ${formatMonthFr(pire.mois)}, le portefeuille valait ${un(pire.pct)}\u00a0% de moins que le total versé.`
                  : "Le portefeuille n'est jamais passé sous le total versé."}
              </li>
            ))}
          </ul>

          {/* Un vrai <table> sur écran large, replié en cartes sous 640 px
              (même idiome que /etf-eligibles-pea) : pas de défilement
              horizontal à 375 px. */}
          <TableauExemples />

          <p className="text-sm text-gray-500 leading-relaxed mt-4">
            Données&nbsp;: clôtures mensuelles en euros de l&apos;ETF{" "}
            <a
              href={SOURCE_SERIE_URL}
              target="_blank"
              rel="noopener"
              className="underline hover:text-gray-900 transition-colors"
            >
              Xtrackers MSCI World Swap UCITS ETF 1C (XMWO, LU0274208692)
            </a>
            , coté à Milan, de {formatMonthFr(range.min)} à {FIN}, relevées le{" "}
            {RELEVE_LE}. Les frais de gestion du fonds ({TER_FONDS} par an) sont
            déjà dans les cours&nbsp;; courtage et impôt non compris. Ces
            résultats passés ne préjugent pas des performances futures.
          </p>
        </section>

        {/* ── L'outil Premium — après les exemples ──────────────────────────── */}
        <section aria-labelledby="votre-scenario" className="mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h2 id="votre-scenario" className="text-2xl font-bold text-gray-900">
              Votre propre scénario
            </h2>
            <span className="inline-flex items-center bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
              Premium
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed mb-6">
            L&apos;outil Premium rejoue le même calcul avec votre montant mensuel,
            votre date de départ et votre date de fin, au mois près depuis{" "}
            {formatMonthFr(range.min)}&nbsp;: total versé, valeur finale, TRI, pire
            écart sous le total versé et courbe mois par mois.
          </p>

          {/* Le client component gère tout : inputs, calcul, graphique, paywall. */}
          <Suspense fallback={<SqueletteOutil />}>
            <OutilBacktest minMonth={range.min} maxMonth={range.max} />
          </Suspense>
        </section>

        {/* ── Questions fréquentes ─────────────────────────────────────────── */}
        {/* <details>/<summary> comme les autres guides : chaque question est un
            passage de la recherche interne, avec son ancre. */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.id}
                id={item.id}
                className="group rounded-2xl border border-gray-100 bg-white overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none">
                  {item.q}
                  <span aria-hidden className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Disclaimer / méthodo */}
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">
            Méthodologie & limites
          </h2>
          <ul className="text-sm text-gray-600 space-y-2 leading-relaxed">
            <li>
              <strong>Source des données :</strong> {meta.source}. Récupéré le{" "}
              {RELEVE_LE}.
            </li>
            <li>
              <strong>Hypothèse :</strong> achat le dernier jour de chaque mois
              au cours de clôture. Pas de frais de courtage modélisés.
            </li>
            <li>
              <strong>Le TER est déjà compté, et une seule fois :</strong> les
              frais de gestion du fonds ({meta.terAnnuelPct.toFixed(2).replace(".", ",")} %/an)
              sont prélevés en continu sur l&apos;actif — le cours de clôture
              en est donc déjà net. Les retrancher une seconde fois les
              compterait deux fois. L&apos;ETF est capitalisant : les
              dividendes sont réinvestis dans le cours, ils ne manquent pas
              davantage.
            </li>
            <li>
              <strong>Ne tient PAS compte :</strong> de la fiscalité (PFU,
              prélèvements sociaux, voir les{" "}
              <Link href="/fiscalite-pea-cto-2026" className="text-primary-700 underline underline-offset-2">
                taux de 2026
              </Link>
              ) ni des frais de courtage. Ces derniers
              pénalisent le versement mensuel plus qu&apos;un achat unique —
              plusieurs ordres au lieu d&apos;un.
            </li>
            <li>
              <strong>Drawdown :</strong> calculé sur la valeur du portefeuille
              DCA, pas sur l&apos;indice brut. Le DCA amortit le drawdown grâce
              à l&apos;effet moyennage — donc votre vraie perte papier est
              toujours plus douce qu&apos;une lecture brute de l&apos;indice.
            </li>
            <li>
              <strong>Performances passées :</strong> ne préjugent en rien des
              performances futures. Outil pédagogique uniquement, pas de
              conseil en investissement.{" "}
              <Link
                href="/methodologie"
                className="underline hover:text-gray-900 transition-colors"
              >
                Méthodologie détaillée
              </Link>
              .
            </li>
          </ul>
        </section>

        {/* FAQPage seul — l'Article est émis par ArticleByline. */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }}
        />
      </div>
    </div>
  );
}

// ─── Sous-composant (propre à la page) ───────────────────────────────────────

/** « janvier 2010 » → « Janvier 2010 », en tête de cellule. */
const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function TableauExemples() {
  const th = "px-3 py-3 text-left font-semibold text-gray-500 border-b border-gray-100";
  const td = "flex gap-3 px-4 py-1 sm:table-cell sm:px-3 sm:py-3 sm:align-top";
  const intitule = "w-32 shrink-0 text-gray-500 sm:hidden";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <caption className="sr-only">
          DCA mensuels rejoués sur les cours réels du MSCI World en euros, jusqu&apos;en {FIN}
        </caption>
        <thead className="hidden sm:table-header-group bg-gray-50">
          <tr>
            <th scope="col" className={`${th} pl-4`}>Départ</th>
            <th scope="col" className={th}>Total versé</th>
            <th scope="col" className={th}>Valeur en {FIN}</th>
            <th scope="col" className={th}>Gain</th>
            <th scope="col" className={th}>TRI</th>
            <th scope="col" className={th}>Pire écart</th>
          </tr>
        </thead>
        <tbody className="block sm:table-row-group">
          {EXEMPLES.map(({ def, result, pire }) => (
            <tr
              key={def.slug}
              className="block py-3 border-b border-gray-100 last:border-b-0 sm:table-row sm:py-0"
            >
              <th scope="row" className="block px-4 pb-2 text-left font-normal sm:table-cell sm:py-3 sm:align-top">
                <Link href={`/${def.slug}`} className="font-bold text-primary-700 hover:underline">
                  {majuscule(formatMonthFr(def.startMonth))}
                </Link>
                <span className="block text-gray-500 leading-snug mt-0.5">
                  {formatEurBacktest(def.monthlyAmount)} par mois · {result.monthsInvested} versements
                </span>
              </th>
              <td className={`${td} sm:whitespace-nowrap`}>
                <span className={intitule}>Total versé</span>
                <span className="tabular-nums text-gray-900">{formatEurBacktest(result.totalInvested)}</span>
              </td>
              <td className={`${td} sm:whitespace-nowrap`}>
                <span className={intitule}>Valeur en {FIN}</span>
                <span className="tabular-nums font-semibold text-gray-900">{formatEurBacktest(result.finalValue)}</span>
              </td>
              <td className={`${td} sm:whitespace-nowrap`}>
                <span className={intitule}>Gain</span>
                <span className="tabular-nums text-gray-900">{gainPct(result)}</span>
              </td>
              <td className={`${td} sm:whitespace-nowrap`}>
                <span className={intitule}>TRI</span>
                <span className="tabular-nums text-gray-900">{tri(result)}</span>
              </td>
              <td className={td}>
                <span className={intitule}>Pire écart</span>
                <span className="tabular-nums text-gray-900">
                  {pire ? `−${un(pire.pct)}\u00a0% (${formatMonthFr(pire.mois)})` : "jamais sous le versé"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
