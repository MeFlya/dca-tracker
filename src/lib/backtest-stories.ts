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

import {
  runBacktest,
  getAvailableRange,
  formatEurBacktest,
  formatMonthFr,
  type BacktestResult,
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
  /** Sections de récit — faits historiques statiques, vérifiés. */
  sections: { title: string; paragraphs: string[] }[];
  /** Encadré "la leçon DCA". */
  lesson: (r: BacktestResult) => string;
  faq: (r: BacktestResult) => { q: string; a: string }[];
};

const fmtPct = (n: number) => n.toFixed(1).replace(".", ",");
const fmtIrr = (r: BacktestResult) =>
  r.irrAnnualPct === null ? "—" : `${r.irrAnnualPct.toFixed(1).replace(".", ",")} %/an`;

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
    `Janvier 2020 : vous commencez un DCA de 200 €/mois sur le MSCI World. Un mois plus tard, le krach le plus rapide de l'histoire. Résultat réel aujourd'hui : ${formatEurBacktest(r.finalValue)} pour ${formatEurBacktest(r.totalInvested)} investis (TRI ${fmtIrr(r)}). Données réelles, pas une projection.`,
  intro: (r) =>
    `Imaginez le pire timing possible : vous lancez votre DCA de 200 €/mois en janvier 2020. Quelques semaines plus tard, le COVID déclenche le krach le plus rapide de l'histoire des marchés. Voici ce qui s'est réellement passé ensuite — calculé sur les vraies clôtures mensuelles du MSCI World en euros : ${formatEurBacktest(r.totalInvested)} investis sont devenus ${formatEurBacktest(r.finalValue)}, soit ${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} % (TRI ${fmtIrr(r)}).`,
  sections: [
    {
      title: "Février-mars 2020 : le krach le plus rapide de l'histoire",
      paragraphs: [
        "Entre le 19 février et le 23 mars 2020, les marchés mondiaux perdent environ un tiers de leur valeur en séance — la chute la plus rapide jamais enregistrée, plus brutale que 1929 ou 2008 en vitesse. En clôtures mensuelles (la granularité de ce backtest), le MSCI World en euros passe de 51,8 fin janvier à 46,1 fin février (−10,9 %), avant que mars n'efface déjà une partie de la baisse.",
        "Pour un investisseur qui venait de commencer, c'est le scénario cauchemar théorique : tout miser… juste avant l'effondrement. Sauf que le DCA ne « mise » pas tout — il étale.",
      ],
    },
    {
      title: "Ce que le DCA a fait pendant que tout le monde paniquait",
      paragraphs: [
        "En janvier 2020, vous n'aviez investi que 200 €. Quand le krach frappe, votre exposition est minuscule — la baisse ne vous coûte presque rien. Et vos versements de février, mars et avril achètent des parts soldées de 10 à 15 %.",
        "C'est le paradoxe que ce backtest rend visible : commencer juste avant un krach avec un DCA est statistiquement un BON timing, parce que la majorité de votre capital s'investit après la baisse, à prix réduits, et profite de tout le rebond.",
      ],
    },
  ],
  lesson: (r) =>
    `La leçon : votre pire creux de portefeuille sur cette période n'a même pas été le COVID (${r.maxDrawdown ? `−${fmtPct(r.maxDrawdown.pct)} % entre ${formatMonthFr(r.maxDrawdown.peakMonth)} et ${formatMonthFr(r.maxDrawdown.troughMonth)}` : "—"}). Quand on étale ses achats, le moment où l'on commence compte beaucoup moins que le fait de continuer.`,
  faq: (r) => [
    {
      q: "Combien aurait rapporté un DCA commencé juste avant le krach COVID ?",
      a: `Un DCA de 200 €/mois sur le MSCI World (EUR) commencé en janvier 2020 — un mois avant le krach — représente aujourd'hui ${formatEurBacktest(r.finalValue)} pour ${formatEurBacktest(r.totalInvested)} investis, soit ${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} % et un TRI d'environ ${fmtIrr(r)}. Calcul sur clôtures mensuelles réelles. Le cours d’un ETF étant déjà net de ses frais de gestion, ceux du fonds (0,45 %/an) sont dans ces chiffres — les retrancher les compterait deux fois. Hors frais de courtage et fiscalité.`,
    },
    {
      q: "Pourquoi le krach n'a-t-il presque pas pénalisé ce DCA ?",
      a: "Parce qu'au moment du krach, seuls un ou deux versements étaient investis. L'essentiel du capital a été investi APRÈS la chute, à des prix plus bas, et a profité de l'intégralité du rebond de 2020-2021. C'est la mécanique centrale du DCA : étaler les achats neutralise le risque du mauvais point d'entrée.",
    },
    {
      q: "Et si j'avais investi 15 000 € d'un coup en janvier 2020 ?",
      a: "Un investissement unique (lump sum) en janvier 2020 aurait subi de plein fouet la baisse de février-mars (~−11 % en clôtures mensuelles, jusqu'à ~−34 % en séance), avant de se refaire avec le rebond. Il aurait fini positif aussi — les marchés ont largement récupéré — mais avec un stress maximal au pire moment. Le DCA a vécu le même épisode sans drame.",
    },
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
    `Janvier 2022 : inflation record, remontée des taux, guerre en Ukraine — le MSCI World perd ~19 % en dollars sur l'année. Un DCA de 200 €/mois commencé à ce moment vaut aujourd'hui ${formatEurBacktest(r.finalValue)} (TRI ${fmtIrr(r)}). Données réelles.`,
  intro: (r) =>
    `2022 est l'année que les investisseurs veulent oublier : inflation au plus haut depuis 40 ans, banques centrales qui remontent brutalement les taux, guerre en Ukraine. Le MSCI World perd environ 19 % en dollars sur l'année. Et pourtant : un DCA de 200 €/mois commencé en janvier 2022 — en plein dans la tempête — représente aujourd'hui ${formatEurBacktest(r.finalValue)} pour ${formatEurBacktest(r.totalInvested)} investis, soit ${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} % (TRI ${fmtIrr(r)}).`,
  sections: [
    {
      title: "2022 : la pire année pour les marchés depuis 2008",
      paragraphs: [
        "En dollars, le MSCI World recule d'environ 19 % en 2022 — actions ET obligations baissent ensemble, du jamais-vu depuis des décennies. Pour un investisseur en euros, la chute a été partiellement amortie par la force du dollar : en clôtures mensuelles EUR (la devise de ce backtest), l'indice ne perd « que » 4 à 5 % sur l'année, masquant des creux plus profonds en cours de route.",
        "C'est précisément le genre d'année qui fait abandonner les débutants : douze mois de versements qui semblent ne servir à rien, un portefeuille qui stagne ou recule.",
      ],
    },
    {
      title: "Douze mois d'achats à prix réduits",
      paragraphs: [
        "Ce que l'investisseur 2022 ne voyait pas : chacun de ses douze versements achetait des parts moins chères que le pic de fin 2021. Quand le rebond arrive en 2023-2024, tout ce capital accumulé à prix soldés en profite intégralement.",
        "Le TRI de ce backtest est d'ailleurs supérieur à celui d'un DCA commencé des années plus tôt en marché haussier — commencer dans une année rouge n'est pas une malédiction, c'est une remise.",
      ],
    },
  ],
  lesson: (r) =>
    `La leçon : l'année où votre portefeuille fait du surplace est l'année où votre futur rendement se construit. ${r.maxDrawdown ? `Le pire creux traversé sur la période n'a été que de −${fmtPct(r.maxDrawdown.pct)} % (effet moyennage du DCA)` : ""} — bien moins douloureux que les gros titres de 2022 ne le laissaient craindre.`,
  faq: (r) => [
    {
      q: "Combien vaut un DCA commencé en janvier 2022 ?",
      a: `200 €/mois sur le MSCI World (EUR) depuis janvier 2022 représentent aujourd'hui ${formatEurBacktest(r.finalValue)} pour ${formatEurBacktest(r.totalInvested)} investis (${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} %, TRI ${fmtIrr(r)}). Calcul sur les clôtures mensuelles réelles, déjà nettes des frais de gestion du fonds. Hors frais de courtage et fiscalité.`,
    },
    {
      q: "Pourquoi la baisse de 2022 paraît-elle faible en euros ?",
      a: "Le MSCI World a perdu ~19 % en dollars en 2022, mais le dollar s'est fortement apprécié face à l'euro la même année. Pour un investisseur européen non couvert en change, les deux effets se sont partiellement compensés : en clôtures mensuelles EUR, l'indice ne recule que de 4-5 % sur l'année. C'est un exemple concret de l'effet devise sur un portefeuille mondial.",
    },
    {
      q: "Fallait-il attendre que l'inflation baisse pour commencer ?",
      a: "Avec le recul, non : attendre la « fin de la tempête » aurait fait rater les achats à prix réduits de 2022 ET le rebond de 2023. Le market timing exige d'avoir raison deux fois (sortir au bon moment, rentrer au bon moment) — le DCA évite d'avoir à deviner.",
    },
    {
      q: "Ces chiffres incluent-ils l'inflation ?",
      a: "Non — ce sont des montants nominaux. L'inflation cumulée 2022-2026 réduit le pouvoir d'achat de ces gains (de l'ordre de 10-15 % cumulés). Le TRI réel net d'inflation reste néanmoins nettement positif. Notre simulateur permet d'activer la correction d'inflation sur vos propres projections.",
    },
  ],
};

// ─── Depuis 2010 ──────────────────────────────────────────────────────────────

const DEPUIS_2010: BacktestStoryDef = {
  slug: "backtest-depuis-2010",
  startMonth: "2010-01",
  monthlyAmount: 200,
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
        "Le DCA les a tous traversés de la même façon : un virement le même jour chaque mois, sans lire les gros titres. Les mois de panique sont devenus, mécaniquement, les meilleurs points d'entrée de la série.",
      ],
    },
    {
      title: "Là où les intérêts composés deviennent visibles",
      paragraphs: [
        "Sur les premières années, le portefeuille ressemble à un livret : la croissance vient surtout des versements. C'est vers la dixième année que la courbe change de nature — les gains générés dépassent les sommes versées, et le portefeuille se met à croître plus vite que l'effort d'épargne.",
        "C'est exactement ce que la théorie des intérêts composés promet, vérifié ici sur des données réelles : la patience n'est pas une vertu morale, c'est un levier mathématique.",
      ],
    },
  ],
  lesson: (r) =>
    `La leçon : sur ${r.monthsInvested} mois, le pire creux traversé n'a été que de ${r.maxDrawdown ? `−${fmtPct(r.maxDrawdown.pct)} % (${formatMonthFr(r.maxDrawdown.troughMonth)})` : "—"} — l'effet moyennage du DCA amortit même les krachs. La régularité a transformé ${formatEurBacktest(r.totalInvested)} d'épargne en ${formatEurBacktest(r.finalValue)} de patrimoine.`,
  faq: (r) => [
    {
      q: "Combien rapporte 200 €/mois investis depuis 2010 ?",
      a: `Sur les données réelles du MSCI World en euros : ${formatEurBacktest(r.totalInvested)} investis depuis janvier 2010 valent aujourd'hui ${formatEurBacktest(r.finalValue)}, soit ${r.gainPct >= 0 ? "+" : ""}${fmtPct(r.gainPct)} % et un TRI d'environ ${fmtIrr(r)}. Le cours d’un ETF est déjà net de ses frais de gestion : ceux du fonds (0,45 %/an) sont dans ces chiffres. Hors frais de courtage et fiscalité.`,
    },
    {
      q: "Ce rendement va-t-il se reproduire sur les 16 prochaines années ?",
      a: "Personne ne le sait — et ce backtest ne le promet pas. La période 2010-2026 a été particulièrement favorable aux actions américaines (qui pèsent ~70 % du MSCI World). Les performances passées ne préjugent pas des performances futures ; l'intérêt du backtest est de montrer le COMPORTEMENT du DCA à travers les crises, pas de garantir un chiffre.",
    },
    {
      q: "Quel ETF concret pour répliquer ce backtest en PEA ?",
      a: "Le backtest utilise le MSCI World en euros — relevé sur l’ETF Xtrackers MSCI World (XMWO), retenu parce qu’il couvre la crise de 2008 —. En PEA, les équivalents sont WPEA ou DCAM (TER 0,20 %) — voire CW8 (0,38 %), la référence historique. Voir notre guide des ETF MSCI World pour choisir.",
    },
    {
      q: "Que serait-il arrivé en commençant en 2008, avant la crise financière ?",
      a: "Notre dataset commence en août 2009 (date de création de l'ETF de référence), donc ce backtest ne couvre pas Lehman Brothers. Mais la mécanique observée sur le COVID s'applique : un DCA débuté juste avant 2008 aurait investi l'essentiel de son capital APRÈS la chute, à prix cassés — le krach initial n'aurait touché que les premiers versements.",
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
