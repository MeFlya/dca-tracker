// Pages "backtest célèbre" — /backtest-covid-2020, /backtest-2022-inflation,
// /backtest-depuis-2010.
//
// Principe : des pages SEO PUBLIQUES qui montrent le résultat RÉEL d'un DCA
// sur un épisode de marché célèbre, calculé au build avec runBacktest sur le
// dataset MSCI World EUR. Les chiffres se rafraîchissent à chaque deploy
// (le dataset est mis à jour mensuellement par GitHub Action).
//
// Différenciation : aucun simulateur FR ne montre ça. C'est aussi la vitrine
// du backtest Premium (l'outil pour tester SON propre scénario).
//
// ⚠️ Server-only de fait (consommé par des server components au build).
// Les fonctions dans la config injectent les chiffres calculés — ne jamais
// hardcoder un résultat dans les textes.

import dataset from "@/data/msci-world-eur.json";
import {
  runBacktest,
  getAvailableRange,
  formatEurBacktest,
  formatMonthFr,
  getDatasetMeta,
  reculIndice,
  type BacktestResult,
  type BacktestSeriesPoint,
  type PricePoint,
} from "./backtest";

export type BacktestStoryDef = {
  slug: string;
  startMonth: string;
  monthlyAmount: number;
  eyebrow: string;
  h1: string;
  metaTitle: (r: BacktestResult) => string;
  metaDescription: (r: BacktestResult) => string;
  /** Paragraphe d'intro — chiffres injectés. */
  intro: (r: BacktestResult) => string;
  /**
   * Sections de récit. Le contexte historique est écrit ; tout chiffre tiré de
   * la série (niveaux, reculs, mois) est calculé au chargement du module —
   * voir KRACH_2020, ANNEE_2022, GAINS_2010 ci-dessous.
   */
  sections: { title: string; paragraphs: string[] }[];
  /** Encadré "la leçon DCA". */
  lesson: (r: BacktestResult) => string;
  faq: (r: BacktestResult) => { q: string; a: string }[];
};

/**
 * Date de révision affichée par ces pages (byline, dateModified, sitemap).
 *
 * Jusqu'au 28/09/2026 elles affichaient « mis à jour le 10 juin 2026 » en dur,
 * alors que leurs chiffres avaient changé trois fois depuis : série
 * reconstruite le 29/07, étendue à 2008 le 04/08, rafraîchie chaque mois. Leur
 * récit est fixe mais leurs montants courent jusqu'au dernier mois publié : la
 * date honnête est la plus récente entre la dernière révision du texte et le
 * dernier rafraîchissement de la série.
 */
const TEXTE_REVISE_LE = "2026-09-28";
export function storyUpdatedAt(): string {
  const serie = getDatasetMeta().fetchedAt;
  return serie > TEXTE_REVISE_LE ? serie : TEXTE_REVISE_LE;
}

const fmtPct = (n: number) => n.toFixed(1).replace(".", ",");
const fmtIrr = (r: BacktestResult) =>
  r.irrAnnualPct === null ? "—" : `${r.irrAnnualPct.toFixed(1).replace(".", ",")} %/an`;

/**
 * Le pire écart entre la valeur du portefeuille et le total versé à cette
 * date — ce qu'on lit sur son relevé. null si le portefeuille n'est jamais
 * passé sous le versé.
 *
 * Pourquoi pas maxDrawdown : il mesure la baisse de la VALEUR d'un sommet à un
 * creux, versements compris. Au début d'un DCA, chaque versement gonfle la
 * valeur au moment où les cours chutent, et masque la perte. Jusqu'au
 * 28/09/2026, la page COVID en concluait que « le pire creux n'a même pas été
 * le COVID » (alors qu'en mars 2020 le portefeuille était à −9,9 % sous le
 * versé), et la page 2022 citait « −8,1 % » comme le creux de 2022 — c'était
 * celui d'avril 2025.
 *
 * Exportée le 30/09/2026 : /backtest cite le pire écart des trois exemples
 * publiés, et doit le mesurer exactement comme ces pages.
 */
export function pireEcart(r: BacktestResult): { pct: number; mois: string } | null {
  let pire = { e: 0, mois: "" };
  for (const p of r.series) {
    const e = p.invested > 0 ? p.value / p.invested - 1 : 0;
    if (e < pire.e) pire = { e, mois: p.month };
  }
  return pire.mois ? { pct: -pire.e * 100, mois: pire.mois } : null;
}

// ─── Chiffres des récits, calculés sur la série publiée ─────────────────────
//
// Jusqu'au 28/09/2026, les sections de récit contenaient des chiffres écrits à
// la main : « 51,8 fin janvier à 46,1 fin février (−10,9 %) » (niveaux de
// l'ancienne série IWDA, remplacée le 04/08/2026), « avant que mars n'efface
// déjà une partie de la baisse » (mars l'a aggravée), des parts « soldées de
// 10 à 15 % » (9 à 19 %), un indice qui ne perdait « que 4 à 5 % » en 2022
// (−14,2 % sur la série), des gains qui dépassaient le versé « vers la dixième
// année » (onze ans et trois mois). Tous sont désormais lus dans la série que
// runBacktest rejoue, et interpolés.

/**
 * Cours de clôture mensuel de la série publiée — le même que celui auquel
 * runBacktest achète. backtest.ts n'expose que des variations (reculIndice) ;
 * les récits citent aussi des niveaux, lus ici plutôt que recopiés.
 */
const COURS = new Map((dataset.data as PricePoint[]).map((p) => [p.month, p.value]));

function cours(mois: string): number {
  const v = COURS.get(mois);
  if (v == null) throw new Error(`backtest-stories : aucun cours pour ${mois} dans la série publiée.`);
  return v;
}

/** reculIndice, qui refuse un mois absent de la série au lieu d'afficher « NaN % ». */
function recul(depuis: string, jusqua: string): number {
  const v = reculIndice(depuis, jusqua);
  if (v == null) throw new Error(`backtest-stories : recul ${depuis} → ${jusqua} incalculable.`);
  return v;
}

function moisSuivant(mois: string): string {
  const [a, m] = mois.split("-").map(Number);
  return m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, "0")}`;
}

/** Premier mois après `depuis` où le cours retrouve au moins son niveau de `depuis`. */
function moisRetour(depuis: string): string | null {
  const niveau = cours(depuis);
  const { max } = getAvailableRange();
  for (let m = moisSuivant(depuis); m <= max; m = moisSuivant(m)) {
    const v = COURS.get(m);
    if (v != null && v >= niveau) return m;
  }
  return null;
}

/** Cours d'une part en euros : « 61,17 € », « 49,685 € ». */
const fmtCours = (n: number) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} €`;

const EN_LETTRES = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"];
const enLettres = (n: number) => EN_LETTRES[n] ?? String(n);

/** « 11 ans et 3 mois » pour 135 versements mensuels. */
function duree(nbMois: number): string {
  const ans = Math.floor(nbMois / 12);
  const mois = nbMois % 12;
  return mois === 0 ? `${ans} ans` : `${ans} ans et ${mois} mois`;
}

/**
 * Le krach de 2020 en clôtures mensuelles : janvier (dernier mois avant la
 * chute), février, mars (le creux), avril (le rebond).
 */
const KRACH_2020 = (() => {
  const k = {
    janvier: cours("2020-01"),
    fevrier: cours("2020-02"),
    mars: cours("2020-03"),
    avril: cours("2020-04"),
    /** Février seul, depuis fin janvier. */
    baisseFevrier: recul("2020-01", "2020-02"),
    /** Mars seul, depuis fin février. */
    baisseMars: recul("2020-02", "2020-03"),
    /** De fin janvier à fin mars : ce qu'a perdu un placement unique. */
    baisseJanvierMars: recul("2020-01", "2020-03"),
    /** Fin avril, encore sous janvier. */
    avrilSousJanvier: recul("2020-01", "2020-04"),
    /** Mois où le cours retrouve son niveau de fin janvier. */
    retour: moisRetour("2020-01"),
  };
  // Le récit (février baisse, mars aggrave, avril rebondit sans effacer la
  // chute) est une LECTURE de ces chiffres. Si la série publiée change au
  // point de la contredire, le build s'arrête : le texte est à réécrire.
  if (!(k.fevrier < k.janvier && k.mars < k.fevrier && k.avril > k.mars && k.avril < k.janvier && k.retour)) {
    throw new Error("backtest-stories : le récit du krach de 2020 ne correspond plus à la série publiée.");
  }
  return { ...k, retour: k.retour as string };
})();

/** Remise des versements de février, mars et avril 2020 par rapport à janvier, en % arrondis. */
const REMISE_2020 = (() => {
  const remises = [KRACH_2020.baisseFevrier, KRACH_2020.baisseJanvierMars, KRACH_2020.avrilSousJanvier];
  return { min: Math.round(Math.min(...remises)), max: Math.round(Math.max(...remises)) };
})();

/**
 * 2022 sur la série publiée : année civile (fin décembre 2021 → fin décembre
 * 2022) et plus bas de l'année depuis le sommet de décembre 2021.
 */
const ANNEE_2022 = (() => {
  const annee = recul("2021-12", "2022-12");
  let creux = { mois: "2022-01", pct: recul("2021-12", "2022-01") };
  for (let m = "2022-02"; m <= "2022-12"; m = moisSuivant(m)) {
    const p = recul("2021-12", m);
    if (p > creux.pct) creux = { mois: m, pct: p };
  }
  if (annee <= 0) {
    throw new Error("backtest-stories : 2022 n'est plus une année de baisse sur la série publiée.");
  }
  return { annee, creux };
})();

/**
 * MSCI World en euros, dividendes nets réinvestis, performance 2022 : −12,78 %.
 * Source : MSCI, Index Factsheet « MSCI World Index (EUR) », données au
 * 31/08/2026 — https://www.msci.com/documents/10199/890dd84d-3750-4656-87f2-1229ed5a5d6e
 * (consulté le 28/09/2026). Fait publié, pas un calcul : il reste écrit. La
 * série du site s'en écarte de 1,4 point cette année-là (dates et heures de
 * clôture de fin d'année).
 */
const MSCI_WORLD_EUR_NET_2022 = "12,78";

/** Paramètres du DCA « depuis 2010 », partagés par la page et son récit. */
const DEPUIS_2010_PARAMS = { startMonth: "2010-01", monthlyAmount: 200 };

/**
 * Quand les gains (valeur − versé) du DCA commencé en 2010 dépassent-ils le
 * total versé ? Premier mois, et mois à partir duquel c'est acquis jusqu'au
 * dernier mois publié. Plus la part des gains au bout de dix ans.
 */
const GAINS_2010 = (() => {
  const { series } = runBacktest({ ...DEPUIS_2010_PARAMS, endMonth: getAvailableRange().max });
  const depasse = (p: BacktestSeriesPoint) => p.value - p.invested > p.invested;
  const iPremier = series.findIndex(depasse);
  let iDurable = -1;
  for (let i = series.length - 1; i >= 0 && depasse(series[i]); i--) iDurable = i;
  const dixAns = series[10 * 12 - 1]; // 120e versement : décembre 2019
  return {
    premier: iPremier >= 0 ? { mois: series[iPremier].month, versements: iPremier + 1 } : null,
    durable: iDurable >= 0 ? series[iDurable].month : null,
    dixAns: dixAns
      ? { mois: dixAns.month, partGains: ((dixAns.value - dixAns.invested) / dixAns.invested) * 100 }
      : null,
  };
})();

function recitGains2010(): string {
  const debut =
    "Sur les premières années, le portefeuille ressemble à un livret : la croissance vient surtout des versements.";
  const { premier, durable, dixAns } = GAINS_2010;
  const aDix = dixAns
    ? ` Au bout de dix ans, en ${formatMonthFr(dixAns.mois)}, les gains ne représentaient encore que ${fmtPct(dixAns.partGains)} % des sommes versées.`
    : "";
  if (!premier) {
    return `${debut}${aDix} Sur la série publiée, les gains n'ont pas encore dépassé le total versé.`;
  }
  const quand = `en ${formatMonthFr(premier.mois)}, au ${premier.versements}e versement (${duree(premier.versements)})`;
  const suite =
    durable === premier.mois
      ? ", et ne sont plus repassés dessous depuis"
      : durable
        ? `, puis durablement à partir de ${formatMonthFr(durable)}`
        : ", sans que ce soit encore acquis au dernier mois publié";
  return `${debut}${aDix} Ils dépassent le total versé pour la première fois ${quand}${suite} : le portefeuille a alors gagné davantage que tout ce qu'on y a mis, et ses variations pèsent plus lourd que l'effort d'épargne.`;
}

// ─── COVID 2020 ───────────────────────────────────────────────────────────────

const COVID_2020: BacktestStoryDef = {
  slug: "backtest-covid-2020",
  startMonth: "2020-01",
  monthlyAmount: 200,
  eyebrow: "Backtest réel · données MSCI World EUR",
  h1: "Commencer un DCA un mois avant le krach COVID : le backtest réel",
  metaTitle: (r) =>
    `DCA commencé avant le krach COVID : ${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} % malgré tout`,
  metaDescription: (r) =>
    `Janvier 2020 : vous commencez un DCA de 200 €/mois sur le MSCI World. Un mois plus tard, l'un des krachs les plus rapides de l'histoire récente. Résultat réel aujourd'hui : ${formatEurBacktest(r.finalValue)} pour ${formatEurBacktest(r.totalInvested)} investis (TRI ${fmtIrr(r)}). Données réelles, pas une projection.`,
  intro: (r) =>
    `Imaginez le pire timing possible : vous lancez votre DCA de 200 €/mois en janvier 2020. Quelques semaines plus tard, le COVID déclenche l'un des krachs les plus rapides de l'histoire récente des marchés. Voici ce qui s'est réellement passé ensuite — calculé sur les vraies clôtures mensuelles du MSCI World en euros : ${formatEurBacktest(r.totalInvested)} investis sont devenus ${formatEurBacktest(r.finalValue)}, soit ${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} % (TRI ${fmtIrr(r)}).`,
  sections: [
    {
      // Jusqu'au 29/09/2026 : « le krach le plus rapide de l'histoire », « plus
      // brutale que 1929 ou 2008 en vitesse » — superlatif et comparaison sans
      // source (BT-16 ne documente que les dates du 19/02 au 23/03/2020).
      title: "Février-mars 2020 : l'un des krachs les plus rapides de l'histoire récente",
      paragraphs: [
        `Entre le 19 février et le 23 mars 2020, les marchés mondiaux s'effondrent en quelques semaines. En clôtures mensuelles (la granularité de ce backtest), la part de l'ETF qui suit ici le MSCI World en euros passe de ${fmtCours(KRACH_2020.janvier)} fin janvier à ${fmtCours(KRACH_2020.fevrier)} fin février (−${fmtPct(KRACH_2020.baisseFevrier)} %), puis à ${fmtCours(KRACH_2020.mars)} fin mars : −${fmtPct(KRACH_2020.baisseMars)} % sur le seul mois de mars, −${fmtPct(KRACH_2020.baisseJanvierMars)} % depuis janvier. Au plus bas des séances, la baisse a été plus profonde encore. C'est avril qui amorce le rebond : ${fmtCours(KRACH_2020.avril)} fin avril, encore ${fmtPct(KRACH_2020.avrilSousJanvier)} % sous le niveau de janvier.`,
        "Pour un investisseur qui venait de commencer, c'est le scénario cauchemar théorique : tout miser… juste avant l'effondrement. Sauf que le DCA ne « mise » pas tout — il étale.",
      ],
    },
    {
      title: "Ce que le DCA a fait pendant que tout le monde paniquait",
      paragraphs: [
        `En janvier 2020, vous n'aviez investi que 200 €. Quand le krach frappe, votre exposition est minuscule — la baisse ne vous coûte presque rien. Et vos versements de février, mars et avril achètent des parts soldées de ${REMISE_2020.min} à ${REMISE_2020.max} % par rapport à janvier.`,
        `C'est le paradoxe que ce backtest rend visible : commencer un DCA juste avant un krach n'est pas le mauvais timing qu'on imagine, parce que l'essentiel de votre capital s'investit après la baisse. Les versements des mois suivants achètent moins cher qu'en janvier jusqu'à ce que le cours retrouve ce niveau, en ${formatMonthFr(KRACH_2020.retour)} ; tout ce qui est investi ensuite n'a jamais subi le krach.`,
      ],
    },
  ],
  lesson: (r) =>
    `La leçon : ${(() => {
      const p = pireEcart(r);
      return p
        ? `au pire moment, en ${formatMonthFr(p.mois)}, le portefeuille valait ${fmtPct(p.pct)} % de moins que ce qui avait été versé. Ceux qui ont continué ont acheté ces mois-là au plus bas`
        : "le portefeuille n'est jamais passé sous le total versé"
    })()}, et ${formatEurBacktest(r.totalInvested)} versés valent ${formatEurBacktest(r.finalValue)} aujourd'hui. Quand on étale ses achats, le moment où l'on commence compte beaucoup moins que le fait de continuer.`,
  faq: (r) => [
    {
      q: "Combien aurait rapporté un DCA commencé juste avant le krach COVID ?",
      a: `Un DCA de 200 €/mois sur le MSCI World (EUR) commencé en janvier 2020 — un mois avant le krach — représente aujourd'hui ${formatEurBacktest(r.finalValue)} pour ${formatEurBacktest(r.totalInvested)} investis, soit ${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} % et un TRI d'environ ${fmtIrr(r)}. Calcul sur clôtures mensuelles réelles. Le cours d’un ETF étant déjà net de ses frais de gestion, ceux du fonds (0,45 %/an) sont dans ces chiffres — les retrancher les compterait deux fois. Hors frais de courtage et fiscalité.`,
    },
    {
      q: "Pourquoi le krach n'a-t-il presque pas pénalisé ce DCA ?",
      // Réécrit le 28/09/2026 : la réponse disait « seuls un ou deux versements
      // étaient investis » (trois au creux de mars 2020) et « l'essentiel du
      // capital a été investi après la chute, à des prix plus bas » — faux pour
      // tout ce qui a été versé après novembre 2020, au-dessus de janvier.
      a: (() => {
        const creux = r.series.findIndex((p) => p.month === "2020-03");
        if (creux < 0) {
          return "Parce qu'au moment du krach, très peu de versements étaient investis. L'essentiel du capital a été investi après, sans subir la chute. C'est la mécanique centrale du DCA : étaler les achats atténue le risque d'un mauvais point d'entrée, sans le supprimer.";
        }
        const p = r.series[creux];
        return `Parce qu'au creux du krach, fin ${formatMonthFr(p.month)}, seuls ${enLettres(creux + 1)} versements étaient investis (${formatEurBacktest(p.invested)}) : le portefeuille en valait ${formatEurBacktest(p.value)}. Les versements suivants ont acheté moins cher qu'en janvier jusqu'à ce que le cours retrouve ce niveau, en ${formatMonthFr(KRACH_2020.retour)}, et tout le capital investi ensuite n'a jamais subi la chute. C'est la mécanique centrale du DCA : étaler les achats atténue le risque d'un mauvais point d'entrée, sans le supprimer.`;
      })(),
    },
    (() => {
      // Réécrit le 29/09/2026. La mise unique était fixée à 15 000 €, face à
      // un DCA dont le total versé grandit de 200 € chaque mois : la
      // comparaison se déséquilibrait un peu plus à chaque mise à jour de la
      // série, et sa conclusion (« aurait rapporté davantage ») était écrite
      // en dur. On place désormais d'un coup la même somme que le DCA a
      // versée au total, et la phrase suit le résultat calculé.
      // Avant encore (28/09/2026) : « ~−11 % en clôtures mensuelles, jusqu'à
      // ~−34 % en séance », sans source pour le second chiffre.
      const mise = r.totalInvested;
      const fin = r.series[r.series.length - 1].month;
      const auCreux = mise * (1 - KRACH_2020.baisseJanvierMars / 100);
      const aujourdhui = mise * (1 - recul("2020-01", fin) / 100);
      const creux = r.series.find((p) => p.month === "2020-03");
      const gainUnique = aujourdhui - mise;
      const conclusion =
        gainUnique > r.gainAbs
          ? `Avec la même somme disponible dès janvier, tout investir d'un coup aurait donc rapporté davantage que d'étaler (${formatEurBacktest(aujourdhui)} contre ${formatEurBacktest(r.finalValue)} pour le DCA), à condition de tenir pendant la chute.`
          : `Sur cette période, étaler a fini par rapporter autant ou plus que tout investir d'un coup (${formatEurBacktest(r.finalValue)} pour le DCA contre ${formatEurBacktest(aujourdhui)}).`;
      const exposition = creux
        ? ` Le DCA, lui, n'exposait que ${formatEurBacktest(creux.invested)} au pire moment.`
        : "";
      return {
        q: `Et si j'avais investi ${formatEurBacktest(mise)} d'un coup en janvier 2020 ?`,
        a: `Un placement unique de ${formatEurBacktest(mise)} (le total versé par ce DCA) fait fin janvier 2020 aurait encaissé toute la baisse : en clôtures mensuelles, il ne valait plus que ${formatEurBacktest(auCreux)} fin mars (−${fmtPct(KRACH_2020.baisseJanvierMars)} %), et moins encore au plus bas des séances. Il a retrouvé sa valeur de départ en ${formatMonthFr(KRACH_2020.retour)}, puis progressé : ${formatEurBacktest(aujourdhui)} en ${formatMonthFr(fin)}. ${conclusion}${exposition}`,
      };
    })(),
    {
      q: "Ces chiffres sont-ils une projection ?",
      a: "Non — c'est tout l'intérêt. Ce sont les clôtures mensuelles réelles du MSCI World en euros — relevées sur l’ETF Xtrackers MSCI World coté à Milan (XMWO) —, de janvier 2020 à aujourd'hui. Aucune hypothèse de rendement : juste ce qui s'est passé. Un point de méthode : le cours d’un ETF est DÉJÀ net de ses frais de gestion, prélevés en continu sur l’actif — les 0,45 %/an de ce fonds sont donc bien dans ces chiffres, et il serait faux de les retrancher une seconde fois. Ce qui n’y est pas : les frais de courtage et la fiscalité.",
    },
  ],
};

// ─── Inflation 2022 ───────────────────────────────────────────────────────────

const INFLATION_2022: BacktestStoryDef = {
  slug: "backtest-2022-inflation",
  startMonth: "2022-01",
  monthlyAmount: 200,
  eyebrow: "Backtest réel · données MSCI World EUR",
  h1: "Commencer un DCA en janvier 2022, l'année rouge : le backtest réel",
  metaTitle: (r) =>
    `DCA commencé en 2022, l'année rouge : ${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} % aujourd'hui`,
  metaDescription: (r) =>
    `Janvier 2022 : inflation record, remontée des taux, guerre en Ukraine — dans ce backtest, le MSCI World en euros perd ${fmtPct(ANNEE_2022.annee)} % sur l'année. Un DCA de 200 €/mois commencé à ce moment vaut aujourd'hui ${formatEurBacktest(r.finalValue)} (TRI ${fmtIrr(r)}). Données réelles.`,
  intro: (r) =>
    `2022 est l'année que les investisseurs veulent oublier : inflation au plus haut depuis 40 ans, banques centrales qui remontent brutalement les taux, guerre en Ukraine. Sur la série de ce backtest, le MSCI World en euros perd ${fmtPct(ANNEE_2022.annee)} % sur l'année. Et pourtant : un DCA de 200 €/mois commencé en janvier 2022 — en plein dans la tempête — représente aujourd'hui ${formatEurBacktest(r.finalValue)} pour ${formatEurBacktest(r.totalInvested)} investis, soit ${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} % (TRI ${fmtIrr(r)}).`,
  sections: [
    {
      title: "2022 : la pire année pour les marchés depuis 2008",
      paragraphs: [
        // Jusqu'au 28/09/2026 : « l'indice ne perd "que" 4 à 5 % sur l'année »
        // en euros, et « environ 19 % » en dollars, sans source. La série donne
        // −14,2 %, l'indice officiel −12,78 % : le dollar a amorti, pas effacé.
        `En 2022, actions ET obligations baissent ensemble, du jamais-vu depuis des décennies. En dollars, la baisse du MSCI World est plus forte encore ; pour un investisseur en euros, la hausse du dollar en a amorti une partie, sans l'effacer. Sur la série de ce backtest (clôtures mensuelles en euros), l'indice perd ${fmtPct(ANNEE_2022.annee)} % de fin décembre 2021 à fin décembre 2022, après un point bas à −${fmtPct(ANNEE_2022.creux.pct)} % en ${formatMonthFr(ANNEE_2022.creux.mois)}. Selon MSCI, l'indice officiel MSCI World en euros (dividendes nets réinvestis) recule de ${MSCI_WORLD_EUR_NET_2022} % en 2022 ; l'écart avec la série tient surtout aux dates et heures de clôture de fin d'année.`,
        "C'est précisément le genre d'année qui fait abandonner les débutants : douze mois de versements qui semblent ne servir à rien, un portefeuille qui stagne ou recule.",
      ],
    },
    {
      title: "Douze mois d'achats à prix réduits",
      paragraphs: [
        "Ce que l'investisseur 2022 ne voyait pas : chacun de ses douze versements achetait des parts moins chères que le pic de fin 2021. Quand le rebond arrive en 2023-2024, tout ce capital accumulé à prix soldés en profite intégralement.",
        // Jusqu'au 28/09/2026, ce paragraphe tirait une leçon de la comparaison
        // de TRI sur des durées différentes — un artefact de calcul (un TRI sur
        // quatre ans et demi ne se compare pas à un TRI sur seize ans).
        "Commencer dans une année rouge n'est donc pas une malédiction : c'est une remise. Le TRI élevé de ce backtest se lit toutefois avec prudence : il porte sur quelques années seulement, portées par la hausse qui a suivi, et ne se compare pas à celui d'un DCA tenu quinze ans.",
      ],
    },
  ],
  lesson: (r) =>
    `La leçon : l'année où votre portefeuille fait du surplace est l'année où votre futur rendement se construit. ${(() => {
      const p = pireEcart(r);
      return p
        ? `Au pire moment, en ${formatMonthFr(p.mois)}, il valait ${fmtPct(p.pct)} % de moins que le total versé ; les versements de ces mois-là ont été achetés à prix bas.`
        : "Le portefeuille n'est jamais passé sous le total versé."
    })()}`,
  faq: (r) => [
    {
      q: "Combien vaut un DCA commencé en janvier 2022 ?",
      a: `200 €/mois sur le MSCI World (EUR) depuis janvier 2022 représentent aujourd'hui ${formatEurBacktest(r.finalValue)} pour ${formatEurBacktest(r.totalInvested)} investis (${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} %, TRI ${fmtIrr(r)}). Calcul sur les clôtures mensuelles réelles, déjà nettes des frais de gestion du fonds. Hors frais de courtage et fiscalité.`,
    },
    {
      q: "Pourquoi la baisse de 2022 est-elle moins forte en euros qu'en dollars ?",
      a: `Parce que le dollar s'est fortement apprécié face à l'euro en 2022. Pour un investisseur européen non couvert en change, cette hausse a compensé une partie de la baisse des actions, sans l'effacer : sur la série de ce backtest, l'indice recule de ${fmtPct(ANNEE_2022.annee)} % sur l'année en euros, et l'indice officiel MSCI World en euros (dividendes nets réinvestis) de ${MSCI_WORLD_EUR_NET_2022} % selon MSCI. C'est un exemple concret de l'effet devise sur un portefeuille mondial.`,
    },
    {
      q: "Fallait-il attendre que l'inflation baisse pour commencer ?",
      a: "Avec le recul, non : attendre la « fin de la tempête » aurait fait rater les achats à prix réduits de 2022 ET le rebond de 2023. Le market timing exige d'avoir raison deux fois (sortir au bon moment, rentrer au bon moment) — le DCA évite d'avoir à deviner.",
    },
    {
      q: "Ces chiffres incluent-ils l'inflation ?",
      // Jusqu'au 29/09/2026 : « de l'ordre de 10-15 % cumulés » et « le TRI
      // réel reste nettement positif », ni sourcés ni calculés.
      a: "Non — ce sont des montants nominaux. L'inflation cumulée depuis 2022 réduit le pouvoir d'achat de ces gains. Notre simulateur permet d'activer la correction d'inflation sur vos propres projections.",
    },
  ],
};

/**
 * Le DCA de 200 €/mois commencé en janvier 2008, rejoué sur la série publiée :
 * pire écart entre valeur et total versé (ce qu'on lisait sur son relevé), et
 * résultat au dernier mois disponible.
 */
function depart2008(): string {
  const { min, max } = getAvailableRange();
  if (min > "2008-01") {
    return "La série publiée ne remonte pas jusqu'à 2008 : ce départ ne peut pas être rejoué ici.";
  }
  const r = runBacktest({ monthlyAmount: 200, startMonth: "2008-01", endMonth: max });
  const pire = pireEcart(r);
  const creux = pire
    ? ` Au pire moment, en ${formatMonthFr(pire.mois)}, le portefeuille valait ${fmtPct(pire.pct)} % de moins que ce qui avait été versé.`
    : "";
  return (
    "La série publiée remonte à janvier 2008 : ce départ se rejoue. Le même DCA de 200 €/mois commencé en janvier 2008 a pris la chute de Lehman Brothers dès sa première année." +
    creux +
    ` En continuant les versements, il a ensuite acheté à prix bas : ${formatEurBacktest(r.totalInvested)} versés valent ${formatEurBacktest(r.finalValue)} en ${formatMonthFr(max)}, soit un TRI d'environ ${fmtIrr(r)}.`
  );
}

// ─── Depuis 2010 ──────────────────────────────────────────────────────────────

const DEPUIS_2010: BacktestStoryDef = {
  slug: "backtest-depuis-2010",
  ...DEPUIS_2010_PARAMS,
  eyebrow: "Backtest réel · données MSCI World EUR",
  h1: "200 € par mois depuis 2010 : le backtest réel sur 16 ans",
  metaTitle: (r) =>
    `200 €/mois depuis 2010 : ${formatEurBacktest(r.finalValue)} aujourd'hui`,
  metaDescription: (r) =>
    `Un DCA de 200 €/mois sur le MSCI World commencé en janvier 2010 : ${formatEurBacktest(r.totalInvested)} investis, ${formatEurBacktest(r.finalValue)} aujourd'hui (${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} %, TRI ${fmtIrr(r)}). Crise de l'euro, COVID, 2022 : tout est dedans. Données réelles.`,
  intro: (r) =>
    `C'est le backtest le plus parlant du site : 200 €/mois sur le MSCI World, sans interruption, depuis janvier 2010. ${r.monthsInvested} versements à travers la crise de la dette européenne, le Brexit, le COVID et l'inflation de 2022. Résultat réel : ${formatEurBacktest(r.totalInvested)} investis sont devenus ${formatEurBacktest(r.finalValue)} — ${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} %, soit un TRI d'environ ${fmtIrr(r)}.`,
  sections: [
    {
      title: "Seize ans de crises traversées sans rien faire",
      paragraphs: [
        "2011 : crise de la dette souveraine européenne. 2015-2016 : ralentissement chinois et Brexit. 2018 : krach de fin d'année. 2020 : COVID. 2022 : inflation et remontée des taux. Chacun de ces épisodes a fait la une avec des prédictions de catastrophe durable.",
        "Le DCA les a tous traversés de la même façon : un virement le même jour chaque mois, sans lire les gros titres. Les mois de panique sont devenus, mécaniquement, des achats à prix réduit par rapport aux mois qui les entouraient.",
      ],
    },
    {
      title: "Là où les intérêts composés deviennent visibles",
      paragraphs: [
        // Jusqu'au 28/09/2026 : « c'est vers la dixième année que […] les gains
        // générés dépassent les sommes versées ». À dix ans, ils en valaient
        // 85,6 % ; le croisement arrive à onze ans et trois mois.
        recitGains2010(),
        "C'est exactement ce que la théorie des intérêts composés promet, vérifié ici sur des données réelles : la patience n'est pas une vertu morale, c'est un levier mathématique.",
      ],
    },
  ],
  lesson: (r) =>
    `La leçon : ${(() => {
      const p = pireEcart(r);
      const dd = r.maxDrawdown;
      const indice = dd ? reculIndice(dd.peakMonth, dd.troughMonth) : null;
      const debut = p
        ? `sur ${r.monthsInvested} mois, le pire écart sous le total versé a été de −${fmtPct(p.pct)} % (${formatMonthFr(p.mois)}). `
        : `sur ${r.monthsInvested} mois, le portefeuille n'est jamais passé sous le total versé. `;
      const recul =
        dd && indice != null
          ? `Plus tard, il a reculé de −${fmtPct(dd.pct)} % entre ${formatMonthFr(dd.peakMonth)} et ${formatMonthFr(dd.troughMonth)}, presque autant que l'indice (−${fmtPct(indice)} %) : après dix ans, un DCA ne protège plus d'une baisse, il permet de continuer à acheter pendant qu'elle dure. `
          : "";
      return debut + recul;
    })()}La régularité a transformé ${formatEurBacktest(r.totalInvested)} d'épargne en ${formatEurBacktest(r.finalValue)} de patrimoine.`,
  faq: (r) => [
    {
      q: "Combien rapporte 200 €/mois investis depuis 2010 ?",
      a: `Sur les données réelles du MSCI World en euros : ${formatEurBacktest(r.totalInvested)} investis depuis janvier 2010 valent aujourd'hui ${formatEurBacktest(r.finalValue)}, soit ${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} % et un TRI d'environ ${fmtIrr(r)}. Le cours d’un ETF est déjà net de ses frais de gestion : ceux du fonds (0,45 %/an) sont dans ces chiffres. Hors frais de courtage et fiscalité.`,
    },
    {
      q: "Ce rendement va-t-il se reproduire sur les 16 prochaines années ?",
      a: "Personne ne le sait — et ce backtest ne le promet pas. La période 2010-2026 a été particulièrement favorable aux actions américaines (environ 72 % du MSCI World : 72,14 % au 31/08/2026 selon MSCI). Les performances passées ne préjugent pas des performances futures ; l'intérêt du backtest est de montrer le COMPORTEMENT du DCA à travers les crises, pas de garantir un chiffre.",
    },
    {
      q: "Quel ETF concret pour répliquer ce backtest en PEA ?",
      a: "Le backtest utilise le MSCI World en euros — relevé sur l’ETF Xtrackers MSCI World (XMWO), retenu parce qu’il couvre la crise de 2008 —. En PEA, les équivalents sont WPEA ou DCAM (TER 0,20 %) — voire CW8 (0,38 %), la référence historique. Voir notre guide des ETF MSCI World pour choisir.",
    },
    {
      q: "Que serait-il arrivé en commençant en 2008, avant la crise financière ?",
      // Réécrit le 28/09/2026 : la réponse disait « notre dataset commence en
      // août 2009, ce backtest ne couvre pas Lehman Brothers » alors que la
      // série publiée remonte à janvier 2008 depuis le 04/08 — et que les pages
      // « investir N €/mois » affichent justement un départ en janvier 2008.
      // On rejoue donc le départ de 2008 au lieu de le raconter.
      a: depart2008(),
    },
  ],
};

// ─── Registry + compute ───────────────────────────────────────────────────────

export const BACKTEST_STORIES: Record<string, BacktestStoryDef> = {
  [COVID_2020.slug]: COVID_2020,
  [INFLATION_2022.slug]: INFLATION_2022,
  [DEPUIS_2010.slug]: DEPUIS_2010,
};

export const BACKTEST_STORY_LIST = Object.values(BACKTEST_STORIES);

export type ComputedStory = {
  def: BacktestStoryDef;
  result: BacktestResult;
  endMonth: string;
};

/** Calcule le backtest d'une story (au build — dataset statique). */
export function getBacktestStory(slug: string): ComputedStory {
  const def = BACKTEST_STORIES[slug];
  if (!def) throw new Error(`Backtest story inconnue : ${slug}`);
  const endMonth = getAvailableRange().max;
  const result = runBacktest({
    monthlyAmount: def.monthlyAmount,
    startMonth: def.startMonth,
    endMonth,
  });
  return { def, result, endMonth };
}

// ─── /backtest : exemples publiés et « pire moment pour commencer » ─────────
//
// Ajouté le 30/09/2026. Un relevé du 29/09 (30 questions posées à trois
// assistants) a montré que /backtest ne donnait à lire, sans JavaScript, ni
// résultat ni date : seulement « Premium » et « Débloquer ». La page publie
// désormais les trois histoires ci-dessus et répond à « quel a été le pire
// moment pour commencer un DCA sur le MSCI World ? ». Les deux se calculent
// ici, sur la série publiée, jamais à la main.

/** Dernière révision du TEXTE de /backtest (la série a sa propre date). */
const BACKTEST_OUTIL_REVISE_LE = "2026-09-30";

/**
 * Date de révision de /backtest (byline, dateModified, sitemap) : ses exemples
 * courent jusqu'au dernier mois publié, comme ceux des histoires.
 */
export function backtestUpdatedAt(): string {
  const serie = getDatasetMeta().fetchedAt;
  return serie > BACKTEST_OUTIL_REVISE_LE ? serie : BACKTEST_OUTIL_REVISE_LE;
}

export type PireDepart = {
  /** Mois de départ du DCA le plus éprouvé (YYYY-MM). */
  depart: string;
  /** Pire écart sous le total versé de ce DCA, et son mois. */
  creux: { pct: number; mois: string; valeur: number; verse: number };
  /** Le même DCA au dernier mois publié. */
  resultat: BacktestResult;
  /** Nombre de départs mensuels rejoués, et combien finissent sous le versé. */
  nbDeparts: number;
  nbEnPerte: number;
  /** Premier et dernier mois de la série. */
  debutSerie: string;
  finSerie: string;
};

/**
 * Rejoue un DCA partant de chaque mois de la série jusqu'au dernier mois
 * publié, et retient le départ dont le pire écart sous le total versé est le
 * plus profond — la mesure de pireEcart(), pas maxDrawdown (voir plus haut).
 *
 * Ce « pire » est celui de la SÉRIE, qui commence en janvier 2008 : le sommet
 * d'octobre 2007 n'y figure pas, un départ plus tôt aurait pu faire pire. Le
 * pourcentage ne dépend pas du montant mensuel (tous les versements sont
 * égaux) ; `monthlyAmount` ne sert qu'aux montants affichés.
 */
export function pireDepartSurLaSerie(monthlyAmount: number): PireDepart {
  const { min, max } = getAvailableRange();
  let pire: { depart: string; pct: number; mois: string; r: BacktestResult } | null = null;
  let nbDeparts = 0;
  let nbEnPerte = 0;
  for (let depart = min; depart < max; depart = moisSuivant(depart)) {
    const r = runBacktest({ monthlyAmount, startMonth: depart, endMonth: max });
    nbDeparts++;
    if (r.finalValue < r.totalInvested) nbEnPerte++;
    const p = pireEcart(r);
    if (p && (!pire || p.pct > pire.pct)) pire = { depart, pct: p.pct, mois: p.mois, r };
  }
  if (!pire) {
    throw new Error("backtest-stories : aucun départ de la série n'est passé sous le total versé.");
  }
  const { depart, pct, mois, r } = pire;
  const point = r.series.find((p) => p.month === mois);
  if (!point) throw new Error(`backtest-stories : mois ${mois} absent de la série rejouée.`);
  return {
    depart,
    creux: { pct, mois, valeur: point.value, verse: point.invested },
    resultat: r,
    nbDeparts,
    nbEnPerte,
    debutSerie: min,
    finSerie: max,
  };
}
