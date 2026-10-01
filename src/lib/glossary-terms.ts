// Glossaire data-driven — termes rendus par /glossaire/[slug].
//
// Les 3 entrées historiques (dca, etf, interets-composes) restent des pages
// JSX dédiées (plus riches) : les routes statiques ont priorité sur [slug].
// Ce fichier porte les 12 entrées ajoutées en juin 2026 (AUDIT C2) — chaque
// terme = cible long-tail ("définition TER", "qu'est-ce que le PFU"…) +
// nœud de maillage interne vers les guides et outils du site.
//
// Cohérence YMYL : les chiffres (18,6 %, 31,4 %, 150 000 €, TER…) doivent
// rester alignés avec /pea-ou-cto, /etf-msci-world et les comparatifs.

import {
  ecartFiscalEnviron,
  impotCTO,
  impotCTOEnviron,
  impotPEA,
  impotPEAEnviron,
} from "@/lib/impot-affiche";
import { capitalPour, ecartCapital, gainsPour, HYPOTHESES_COMPARATIFS } from "@/lib/ecart-frais";
import { runSimulation } from "@/lib/simulator";
import { runMonteCarlo } from "@/lib/monte-carlo";
import { TER_REFERENCE_SIMULATEUR } from "@/lib/etf-config";
import { getBacktestStory } from "@/lib/backtest-stories";
import {
  formatEurBacktest,
  formatMonthFr,
  getAvailableRange,
  reculIndice,
} from "@/lib/backtest";
import dataset from "@/data/msci-world-eur.json";

// 28/09/2026 : l'exemple PEA posait « ≈ 102 000 € finaux dont ≈ 54 000 € de
// gains » — le capital SANS AUCUN FRAIS — et un écart fiscal « ≈ 6 900 € »
// écrit à la main. Tout sort maintenant du moteur, au TER de WPEA/DCAM
// (0,20 %, table de vérité ETF du 28/09/2026).
// Chiffres de backtest cités par les termes TRI et drawdown — calculés sur la
// série publiée, comme les pages /backtest-* auxquelles ils renvoient. Jusqu'au
// 28/09/2026 ils étaient écrits à la main : « ~122 000 € », « 197 versements »,
// « TRI 12,7 % », quand /backtest-depuis-2010 affichait 125 734 € et 200
// versements. Deux pages du même site, deux résultats pour le même backtest.
const BT_2010 = getBacktestStory("backtest-depuis-2010");
const BT_COVID = getBacktestStory("backtest-covid-2020").result;
const un = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const TRI_2010 = un(BT_2010.result.irrAnnualPct ?? 0);
const CREUX_2010 = BT_2010.result.maxDrawdown;
const CREUX_INDICE_2010 = CREUX_2010
  ? reculIndice(CREUX_2010.peakMonth, CREUX_2010.troughMonth)
  : null;

// ─── Volatilité et krachs : calculés sur la série publiée (29/09/2026) ───────
//
// Les termes volatilité et drawdown écrivaient « ~15 %/an », « −34 % en cinq
// semaines au printemps 2020 », « −50 %+ en 2008 » et « des baisses de 30 à
// 50 % une à deux fois par décennie » : chiffres sans devise, sans granularité
// ni source. Sur la série des backtests (EUR, clôtures mensuelles), la
// volatilité ressort à 13,8 %/an, la baisse de 2020 à 18,8 % et celle de
// 2008-2009 à 38,8 %. Ils sont désormais CALCULÉS ici. Les deux chiffres MSCI
// (13,45 % de volatilité sur 10 ans, baisse maximale de 53,6 % du 24/05/2001 au
// 09/03/2009) viennent de la fiche MSCI World Index (EUR) au 31/08/2026 : ils
// ne sont pas calculables sur une série qui commence en 2008.
const SERIE_INDICE: { month: string; value: number }[] = dataset.data;
const PERIODE_SERIE = getAvailableRange();
const ANNEE_DEBUT_SERIE = PERIODE_SERIE.min.slice(0, 4);
const ANNEE_FIN_SERIE = PERIODE_SERIE.max.slice(0, 4);

/** Écart-type des rendements mensuels × √12, en %. */
const VOLATILITE_SERIE = (() => {
  const r = SERIE_INDICE.slice(1).map((p, i) => p.value / SERIE_INDICE[i].value - 1);
  const moyenne = r.reduce((s, x) => s + x, 0) / r.length;
  const variance = r.reduce((s, x) => s + (x - moyenne) ** 2, 0) / (r.length - 1);
  return Math.sqrt(variance * 12) * 100;
})();

/**
 * Plus forte baisse de l'indice entre un plus haut et le creux qui le suit, à
 * l'intérieur d'une fenêtre (clôtures mensuelles). Le pourcentage sort de
 * reculIndice(), comme pour les pages /backtest-*.
 */
function pireReculIndice(debut: string, fin: string) {
  const points = SERIE_INDICE.filter((p) => p.month >= debut && p.month <= fin);
  if (points.length === 0) return null;
  let sommet = points[0];
  let pire: { pct: number; peakMonth: string; troughMonth: string } | null = null;
  for (const p of points) {
    if (p.value > sommet.value) sommet = p;
    const pct = reculIndice(sommet.month, p.month);
    if (pct != null && pct > 0 && (pire === null || pct > pire.pct)) {
      pire = { pct, peakMonth: sommet.month, troughMonth: p.month };
    }
  }
  return pire;
}

const KRACH_2008 = pireReculIndice("2008-01", "2009-12");
const KRACH_2020 = pireReculIndice("2019-10", "2020-12");

/** « 38,8 % entre mai 2008 et février 2009 » ; null si la série ne couvre pas. */
function phraseKrach(k: ReturnType<typeof pireReculIndice>): string | null {
  return k
    ? `${un(k.pct)} % entre ${formatMonthFr(k.peakMonth)} et ${formatMonthFr(k.troughMonth)}`
    : null;
}
const PHRASE_KRACH_2008 = phraseKrach(KRACH_2008);
const PHRASE_KRACH_2020 = phraseKrach(KRACH_2020);
/** Les deux krachs de la série, ou rien : pas de chiffre de repli écrit à la main. */
const KRACHS_SERIE =
  PHRASE_KRACH_2008 && PHRASE_KRACH_2020
    ? `sur la série de nos backtests, en euros et en clôtures mensuelles, il a reculé de ${PHRASE_KRACH_2008}, puis de ${PHRASE_KRACH_2020}`
    : null;
const KRACHS_SERIE_PHRASE = KRACHS_SERIE
  ? ` Plus près de nous, ${KRACHS_SERIE} ; des clôtures mensuelles lissent les creux vécus en séance.`
  : "";

// Monte Carlo du simulateur : 15 %/an de volatilité est une HYPOTHÈSE du
// modèle (monte-carlo.ts), un peu au-dessus de la volatilité mesurée. L'exemple
// disait « du simple au double entre le 10e et le 90e percentile » : sur les
// paramètres par défaut du simulateur, l'écart est de près de trois fois.
const MC_EXEMPLE = runMonteCarlo({
  ...HYPOTHESES_COMPARATIFS,
  annualFeesPct: TER_REFERENCE_SIMULATEUR,
});

const TER_EXEMPLE_PEA = 0.2;
const GAIN_EXEMPLE_PEA = (() => {
  const { finalValue, totalInvested } = runSimulation({
    ...HYPOTHESES_COMPARATIFS,
    annualFeesPct: TER_EXEMPLE_PEA,
  }).base;
  return finalValue - totalInvested;
})();

export type GlossaryTerm = {
  slug: string;
  /** Nom complet affiché en H1 — ex: "PEA — Plan d'Épargne en Actions". */
  term: string;
  /** Définition en 1 phrase (hub, meta, schema DefinedTerm). */
  shortDef: string;
  metaTitle: string;
  metaDescription: string;
  /** Corps de la définition — 2-3 paragraphes. */
  definition: string[];
  /** Points "en pratique pour votre DCA". */
  inPractice: { title: string; text: string }[];
  /** Exemple chiffré optionnel (encadré). */
  example?: string;
  faq: { q: string; a: string }[];
  related: { href: string; label: string }[];
  /** Catégorie pour le regroupement sur le hub. */
  category: "Enveloppes & fiscalité" | "Frais & mécanique des ETF" | "Stratégie & risque";
  /**
   * Dernière modification RÉELLE du contenu du terme (YYYY-MM-DD). Affichée
   * par la byline, déclarée en dateModified et reprise par le sitemap.
   * Jusqu'au 28/09/2026, la page écrivait « 10 juin 2026 » pour les douze
   * termes alors que neuf avaient changé depuis — dont six le jour même, pour
   * des erreurs de fait. À bumper quand on touche le terme, pas au déploiement.
   */
  updatedAt: string;
};

export const GLOSSARY_TERMS: Record<string, GlossaryTerm> = {
  // ─── Enveloppes & fiscalité ─────────────────────────────────────────────────

  pea: {
    slug: "pea",
    // 30/09/2026 : lien vers /fiscalite-pea-cto-2026 dans « Pour aller plus loin ».
    // 01/10/2026 : lien vers /suivi-pea-excel (plafond et date des 5 ans).
    updatedAt: "2026-10-01",
    term: "PEA — Plan d'Épargne en Actions",
    shortDef:
      "Enveloppe fiscale française : après 5 ans, les gains ne supportent que 18,6 % de prélèvements sociaux au lieu de 31,4 %.",
    metaTitle: "PEA : définition, plafond, fiscalité — le guide simple",
    metaDescription:
      "Le PEA en clair : plafond de 150 000 €, exonération d'impôt sur le revenu après 5 ans (reste 18,6 % de prélèvements sociaux), ETF éligibles. Définition + exemple chiffré pour un DCA.",
    definition: [
      "Le Plan d'Épargne en Actions est une enveloppe fiscale française destinée à l'investissement en actions de sociétés de l'Union européenne ou de l'Espace économique européen — et, grâce aux ETF synthétiques, en indices mondiaux comme le MSCI World ou le S&P 500. Son atout : après 5 ans de détention, les gains sont exonérés d'impôt sur le revenu. Seuls les prélèvements sociaux de 18,6 % restent dus, contre 31,4 % de flat tax sur un compte-titres ordinaire.",
      "Le plafond de versement est de 150 000 € par personne (les gains peuvent faire croître le portefeuille au-delà sans limite). Un retrait avant 5 ans entraîne en principe la clôture du plan — d'où la règle d'or : n'y investir que de l'épargne de long terme.",
    ],
    inPractice: [
      {
        title: "L'enveloppe par défaut d'un DCA français",
        text: "Pour un investisseur résident fiscal français qui démarre un DCA en ETF, le PEA est presque toujours le bon point de départ : sur 20 ans, l'écart de fiscalité représente plusieurs milliers d'euros.",
      },
      {
        title: "Ouvrir tôt, même avec peu",
        // 29/09/2026 (FISC-PEA-05, service-public F2385 et F22449) : le délai
        // de 5 ans part du PREMIER VERSEMENT, qui fixe la date d'ouverture du
        // plan. Un PEA ouvert sans versement ne prend pas date.
        text: "Le compteur des 5 ans part de la date du premier versement, quel qu'en soit le montant : c'est elle qui fixe la date d'ouverture du plan. Ouvrir un PEA et y verser une petite somme « prend date » et débloque la fiscalité réduite plus tôt. La loi ne fixe pas de versement minimum ; certains courtiers en demandent un à l'ouverture.",
      },
    ],
    example:
      `200 €/mois pendant 20 ans à 7 %/an, avec 0,20 % de frais annuels ≈ ${capitalPour(TER_EXEMPLE_PEA)} € finaux dont ≈ ${gainsPour(TER_EXEMPLE_PEA)} € de gains. Prélèvements à la sortie : ≈ ${impotPEAEnviron(GAIN_EXEMPLE_PEA)} € en PEA (18,6 %) contre ≈ ${impotCTOEnviron(GAIN_EXEMPLE_PEA)} € en CTO (31,4 %) — environ ${ecartFiscalEnviron(GAIN_EXEMPLE_PEA)} € d'écart.`,
    faq: [
      {
        q: "Quels ETF peut-on loger dans un PEA ?",
        // 28/09/2026 : « les ETF synthétiques qui répliquent des indices
        // mondiaux » laissait croire qu'un swap suffit — 500, ANX et AEEM sont
        // des swaps Amundi NON éligibles (table de vérité ETF). SPEA ajouté.
        // 29/09/2026 (FISC-PEA-14, CMF L221-31) : « au moins 75 % d'actions
        // européennes » → PLUS de 75 % de l'actif en actions de sociétés de
        // l'UE ou de l'EEE ; les sociétés britanniques ou suisses n'en sont pas.
        a: "Les ETF qui investissent plus de 75 % de leurs actifs en actions de sociétés de l'Union européenne ou de l'Espace économique européen (les sociétés britanniques ou suisses n'en font pas partie). Pour suivre un indice mondial, ils reçoivent sa performance par un swap tout en détenant ces actions : MSCI World (WPEA, DCAM, CW8), S&P 500 (SPEA, PSP5, ESE), Nasdaq-100 (PUST), émergents (PAEEM)… Un swap ne suffit pas : l'Amundi S&P 500 Swap (500), l'Amundi Nasdaq-100 Swap (ANX) et l'Amundi MSCI Emerging Markets Swap (AEEM) ne sont pas éligibles. Les ETF physiques à dominante américaine (IWDA, VWCE, CSPX) non plus.",
      },
      {
        q: "Que se passe-t-il si je retire avant 5 ans ?",
        // Jusqu'au 29/09/2026, la parenthèse « sauf cas particuliers :
        // licenciement, invalidité, création d'entreprise… » faisait passer ces
        // retraits pour exonérés. Ils ne clôturent pas le plan, mais le gain
        // reste imposable, sauf création ou reprise d'entreprise (exonérée
        // d'IR) — BOFiP BOI-RPPM-RCM-40-50 § 30 ; brochure IR 2026 p. 143.
        a: "Un retrait avant 5 ans entraîne en principe la clôture du plan, et le gain est imposé au PFU de 31,4 % (ou au barème sur option). Certains retraits ne clôturent pas le plan : licenciement, invalidité ou mise à la retraite anticipée, création ou reprise d'entreprise, titres d'une société en liquidation. Le gain reste alors imposable, sauf en cas de création ou de reprise d'entreprise, exonérée d'impôt sur le revenu. Après 5 ans, les retraits sont libres sans clôture.",
      },
    ],
    related: [
      { href: "/pea-ou-cto", label: "PEA ou CTO : le comparatif complet" },
      { href: "/fiscalite-pea-cto-2026", label: "Fiscalité du PEA en 2026 : ce qui a changé" },
      { href: "/suivi-pea-excel#plafond-et-5-ans", label: "Suivre votre plafond et la date des 5 ans dans un tableur" },
      { href: "/etf-msci-world", label: "ETF MSCI World éligibles PEA" },
      { href: "/comparatif", label: "Chez quel courtier ouvrir un PEA ?" },
      { href: "/calculateur-fiscal-pea-cto", label: "Calculer l'écart fiscal sur votre cas" },
    ],
    category: "Enveloppes & fiscalité",
  },

  cto: {
    slug: "cto",
    updatedAt: "2026-09-29",
    term: "CTO — Compte-Titres Ordinaire",
    shortDef:
      "Compte d'investissement sans plafond ni restriction d'actifs, mais fiscalisé au PFU de 31,4 % sur les gains.",
    metaTitle: "CTO (compte-titres) : définition, fiscalité et usages",
    metaDescription:
      "Le compte-titres ordinaire en clair : aucun plafond, tous les ETF du monde accessibles (IWDA, VWCE, CSPX), mais 31,4 % de flat tax sur les gains. Quand le préférer au PEA — définition + cas d'usage.",
    definition: [
      "Le compte-titres ordinaire est le compte d'investissement « sans contrainte » : aucun plafond de versement, accès à tous les titres cotés du monde (actions, ETF physiques américains ou mondiaux, obligations…). En contrepartie, les gains — plus-values comme dividendes — sont imposés au Prélèvement Forfaitaire Unique de 31,4 % dès le premier euro.",
      "Pour un investisseur DCA français, le CTO est le complément du PEA, pas son concurrent : il prend le relais quand le PEA est plafonné (150 000 € de versements) ou pour loger des ETF non éligibles comme IWDA ou VWCE.",
    ],
    inPractice: [
      {
        title: "La suite logique du PEA plein",
        // 29/09/2026 : « 13 points » → 12,8 (31,4 % − 18,6 %, FISC-PEA-10),
        // comme l'écrit déjà l'entrée PFU de ce même glossaire.
        text: "L'ordre fiscal optimal pour la plupart des résidents français : remplir le PEA d'abord, puis continuer le DCA en CTO. Inverser l'ordre coûte 12,8 points de fiscalité sur les gains (31,4 % au lieu de 18,6 % après 5 ans de PEA).",
      },
      {
        title: "Le terrain des ETF physiques",
        text: "IWDA, VWCE, CSPX — les grands ETF physiques à bas frais ne sont accessibles qu'en CTO (ou assurance-vie). Si la réplication physique est une exigence pour vous, c'est ici que ça se passe.",
      },
    ],
    faq: [
      {
        q: "PEA ou CTO pour commencer un DCA ?",
        a: "PEA dans la grande majorité des cas pour un résident fiscal français : la fiscalité après 5 ans (18,6 % vs 31,4 %) représente plusieurs milliers d'euros d'écart sur un DCA long terme. Le CTO devient pertinent une fois le PEA plafonné, ou pour des besoins spécifiques (ETF non éligibles, expatriation prévue).",
      },
      {
        q: "Peut-on avoir plusieurs CTO ?",
        // 29/09/2026 (FISC-PEA-04) : l'interdiction vise les PEA classiques ;
        // un PEA-PME-ETI peut s'y ajouter.
        a: "Oui, sans limite — chez plusieurs courtiers si besoin. Contrairement au PEA (un seul PEA classique par personne, auquel peut s'ajouter un PEA-PME-ETI), le CTO n'a aucune restriction de nombre ni de plafond.",
      },
    ],
    related: [
      { href: "/pea-ou-cto", label: "PEA ou CTO : le comparatif complet" },
      { href: "/comparatif-etf/iwda-vs-cw8", label: "IWDA (CTO) vs CW8 (PEA)" },
      { href: "/comparatif-etf/vwce-vs-wpea", label: "VWCE (CTO) vs WPEA (PEA)" },
      { href: "/glossaire/pfu", label: "Le PFU (flat tax) expliqué" },
    ],
    category: "Enveloppes & fiscalité",
  },

  pfu: {
    slug: "pfu",
    // 30/09/2026 : lien vers /fiscalite-pea-cto-2026 ; « qui a relevé la CSG »
    // → « qui a relevé les prélèvements sociaux de 1,4 point » (décision du
    // 29/09/2026 : la hausse ne se décompose pas, l'administration la nomme
    // autrement que « CSG ») ; dividendes et intérêts de 2025 : 30 % seulement
    // si les prélèvements sociaux ont été retenus au versement (FISC-DIV-03,
    // brochure IR 2026 p. 124, BOSS Q4) ; « LE levier […] sans aucun risque
    // supplémentaire » → l'écart seul, sans superlatif ni promesse.
    updatedAt: "2026-09-30",
    term: "PFU — Prélèvement Forfaitaire Unique (flat tax)",
    shortDef:
      "Imposition forfaitaire des revenus du capital : 31,4 % en 2026 sur les plus-values et dividendes d'un compte-titres (12,8 % d'impôt sur le revenu + 18,6 % de prélèvements sociaux).",
    metaTitle: "PFU (flat tax 31,4 %) : définition et impact sur vos ETF",
    metaDescription:
      "Le Prélèvement Forfaitaire Unique en clair : 31,4 % sur les plus-values et dividendes en CTO (12,8 % IR + 18,6 % sociaux). Comment le PEA permet d'y échapper en partie — définition + exemple chiffré.",
    definition: [
      // 29/09/2026 (FISC-PS-01 à 04, BAREMES_CAPITAL) : le taux global n'est
      // de 31,4 % que depuis la LFSS 2026 — 30 % de 2018 à 2025 — et il n'est
      // pas universel : l'assurance-vie, le PEL et le CEL gardent 17,2 % de
      // prélèvements sociaux.
      "Le Prélèvement Forfaitaire Unique — souvent appelé « flat tax » — s'applique depuis 2018 aux revenus du capital : plus-values de cession, dividendes, intérêts. Créé au taux global de 30 %, il est passé à 31,4 % avec la loi de financement de la sécurité sociale pour 2026, qui a relevé les prélèvements sociaux de 1,4 point : 12,8 % d'impôt sur le revenu et 18,6 % de prélèvements sociaux. Ce taux vaut pour les plus-values réalisées depuis 2025 et pour les dividendes et intérêts perçus depuis le 1er janvier 2026. Ceux de 2025 restent à 30 % si les prélèvements sociaux ont été retenus au versement, ce qui est le cas le plus courant ; sinon, ils supportent aussi 31,4 %. Il ne vaut pas pour tout : l'assurance-vie, le PEL et le CEL, notamment, gardent 17,2 % de prélèvements sociaux.",
      "C'est le régime par défaut des gains réalisés sur un compte-titres ordinaire. L'option pour le barème progressif de l'impôt sur le revenu reste possible si elle est plus avantageuse (revenus modestes), mais elle s'applique alors à l'ensemble des revenus du capital de l'année.",
    ],
    inPractice: [
      {
        title: "Le chiffre qui justifie le PEA",
        text: "L'écart entre le PFU (31,4 %) et la fiscalité du PEA après 5 ans (18,6 %) est de 12,8 points sur la totalité des gains.",
      },
      {
        title: "Imposé seulement à la vente",
        text: "Le PFU s'applique aux gains RÉALISÉS. Tant que vous ne vendez pas (et qu'un ETF capitalisant réinvestit ses dividendes en interne), aucune imposition ne tombe — la capitalisation travaille sur le montant brut.",
      },
    ],
    example:
      `54 000 € de gains réalisés en CTO → ${impotCTO(54000)} € de PFU (31,4 %). Les mêmes gains dans un PEA de plus de 5 ans → ${impotPEA(54000)} € de prélèvements sociaux (18,6 %). Écart : ≈ ${ecartFiscalEnviron(54000)} €.`,
    faq: [
      {
        q: "Le PFU s'applique-t-il dans un PEA ?",
        a: "Non, tant que le plan a plus de 5 ans : les retraits ne supportent que les prélèvements sociaux de 18,6 %. Un retrait avant 5 ans fait en revanche basculer les gains dans le régime du PFU (31,4 %) et entraîne en principe la clôture du plan.",
      },
      {
        q: "Les ETF capitalisants évitent-ils le PFU ?",
        a: "Ils le diffèrent. Un ETF capitalisant réinvestit les dividendes sans distribution, donc sans imposition annuelle — le PFU ne s'applique qu'à la vente finale, sur la plus-value globale. Ce report est un avantage réel : la somme non prélevée continue de composer.",
      },
    ],
    related: [
      { href: "/fiscalite-pea-cto-2026", label: "PFU et prélèvements sociaux : ce qui change en 2026" },
      { href: "/pea-ou-cto", label: "PEA ou CTO : l'impact fiscal complet" },
      { href: "/glossaire/pea", label: "Le PEA expliqué" },
      { href: "/calculateur-fiscal-pea-cto", label: "Calculer le PFU sur votre cas" },
      { href: "/glossaire/capitalisant-distribuant", label: "Capitalisant vs distribuant" },
    ],
    category: "Enveloppes & fiscalité",
  },

  // ─── Frais & mécanique des ETF ──────────────────────────────────────────────

  ter: {
    slug: "ter",
    updatedAt: "2026-09-28",
    term: "TER — Total Expense Ratio (frais courants)",
    shortDef:
      "Frais annuels d'un ETF, prélevés automatiquement sur la performance — de 0,07 % à 0,40 % pour les grands indices.",
    metaTitle: "TER d'un ETF : définition et vrai impact sur 20 ans",
    metaDescription:
      `Le TER (frais annuels d'un ETF) en clair : comment il est prélevé, pourquoi 0,18 % d'écart représente ~${ecartCapital(0.38, 0.2)} € sur 20 ans de DCA, et à partir de quel écart il doit guider votre choix. Définition + exemples.`,
    definition: [
      "Le Total Expense Ratio représente les frais courants annuels d'un ETF : gestion, licence de l'indice, frais administratifs. Il s'exprime en pourcentage de l'encours et il est prélevé automatiquement, jour après jour, sur la valeur du fonds — vous ne recevez jamais de facture, la performance affichée est déjà nette de TER.",
      "Sur les grands indices, les TER s'échelonnent d'environ 0,07 % (S&P 500 physique en CTO) à 0,38 % (CW8). La guerre des frais de 2024-2025 a presque divisé par deux le coût du MSCI World en PEA : WPEA et DCAM à 0,20 % contre 0,38 % pour le CW8 historique.",
    ],
    inPractice: [
      {
        title: "L'effet est composé, comme les gains",
        text: `Un TER de 0,38 % au lieu de 0,20 % ne coûte pas « 0,18 % » : il coûte 0,18 % par an sur un capital qui grossit, soit environ ${ecartCapital(0.38, 0.2)} € sur 20 ans à 200 €/mois. Les frais composent contre vous comme les gains composent pour vous.`,
      },
      {
        title: "Le seuil de pertinence",
        text: "Un écart de 0,15 %+ justifie de changer d'ETF pour les nouveaux achats. Un écart de 0,03 % (ESE vs PSP5) pèse moins que vos frais d'ordre — choisissez vite et investissez tôt.",
      },
    ],
    example:
      `200 €/mois sur 20 ans à 7 %/an brut : avec un TER de 0,20 %, capital final ≈ ${capitalPour(0.2)} € ; avec 0,38 %, ≈ ${capitalPour(0.38)} €. L’écart (~${ecartCapital(0.38, 0.2)} €) part en frais — pour exactement le même indice.`,
    faq: [
      {
        q: "Le TER est-il le seul coût d'un ETF ?",
        a: "Non. S'ajoutent les frais de courtage (par ordre, selon votre courtier), le spread (écart achat/vente, surtout sur les ETF peu liquides) et d'éventuels frais de tenue de compte. Pour un DCA mensuel, TER + frais d'ordre sont les deux postes qui comptent.",
      },
      {
        q: "Un TER plus bas garantit-il une meilleure performance ?",
        a: "À indice identique, oui sur le long terme — c'est mathématique. Mais comparer les TER de deux ETF qui suivent des indices DIFFÉRENTS n'a pas de sens : un Nasdaq-100 à 0,30 % et un MSCI World à 0,20 % ne sont pas comparables sur les frais, ce sont des expositions différentes.",
      },
    ],
    related: [
      { href: "/comparatif-etf/cw8-vs-wpea", label: "CW8 vs WPEA : 0,18 % d'écart chiffré" },
      { href: "/comparatif-etf/ese-vs-psp5", label: "ESE vs PSP5 : le seuil de pertinence" },
      { href: "/interets-composes", label: "Pourquoi les frais composent aussi" },
      { href: "/simulateur", label: "Simuler l'impact des frais sur votre DCA" },
    ],
    category: "Frais & mécanique des ETF",
  },

  "replication-physique": {
    slug: "replication-physique",
    updatedAt: "2026-09-29",
    term: "Réplication physique",
    shortDef:
      "L'ETF détient réellement les titres de l'indice qu'il réplique — pas d'intermédiaire, pas de contrat d'échange.",
    metaTitle: "Réplication physique d'un ETF : définition et limites en PEA",
    metaDescription:
      "Un ETF à réplication physique détient réellement les actions de son indice (IWDA, VWCE, CSPX). Avantage : pas de risque de contrepartie. Limite : inéligible au PEA pour les indices mondiaux. Définition claire.",
    definition: [
      "Un ETF à réplication physique achète et détient réellement les titres de l'indice qu'il suit : un MSCI World physique comme IWDA possède les actions de l'indice (réplication « totale » ou « optimisée » s'il se contente d'un échantillon représentatif). La performance vient directement de la détention des titres.",
      "C'est l'approche la plus intuitive et la plus transparente — mais elle a une conséquence fiscale française : un ETF qui détient majoritairement des actions américaines ou mondiales ne respecte pas les règles d'éligibilité du PEA. IWDA, VWCE ou CSPX sont donc réservés au compte-titres ou à l'assurance-vie.",
    ],
    inPractice: [
      {
        title: "Le choix par défaut en CTO",
        // 28/09/2026 : VWCE à 0,22 % → 0,14 % (table de vérité ETF) ;
        // « les références mondiales » (classement invérifiable) retiré.
        text: "Une fois le PEA plafonné (ou pour les non-résidents), les ETF physiques à bas frais prennent le relais en compte-titres : IWDA (0,20 %), VWCE (0,14 %), CSPX (0,07 %).",
      },
      {
        title: "Ne pas en faire un dogme",
        text: "Préférer le physique « par principe » en sortant du PEA coûte 12,8 points de fiscalité sur les gains. Le confort psychologique de la détention directe a un prix — qu'il faut chiffrer avant de le payer.",
      },
    ],
    faq: [
      {
        q: "La réplication physique est-elle plus sûre que la synthétique ?",
        // 29/09/2026 (ucits-contrepartie-10pc, CMF R214-21) : « ne s'est jamais
        // matérialisé en perte » n'avait aucune source — retiré. Plafond
        // précisé : 10 % par contrepartie bancaire, 5 % sinon.
        a: "Marginalement : elle élimine le risque de contrepartie du swap. Mais ce risque est lui-même très encadré : l'exposition à une même contrepartie est plafonnée à 10 % de l'actif du fonds quand c'est une banque (5 % sinon), et elle est collatéralisée en pratique quotidiennement. La différence de sécurité réelle est faible.",
      },
      {
        q: "Les ETF physiques prêtent-ils leurs titres ?",
        a: "Souvent, oui — le prêt de titres génère un revenu d'appoint pour le fonds (qui réduit le coût effectif), contre un risque de contrepartie… réintroduit. Ironie utile à connaître : un ETF « physique » avec prêt de titres n'est pas si éloigné, en risque, d'un synthétique bien collatéralisé.",
      },
    ],
    related: [
      { href: "/glossaire/replication-synthetique", label: "La réplication synthétique" },
      { href: "/comparatif-etf/iwda-vs-cw8", label: "IWDA (physique) vs CW8 (synthétique)" },
      { href: "/pea-ou-cto", label: "PEA ou CTO : où loger quoi" },
    ],
    category: "Frais & mécanique des ETF",
  },

  "replication-synthetique": {
    slug: "replication-synthetique",
    updatedAt: "2026-09-29",
    term: "Réplication synthétique (swap)",
    shortDef:
      "L'ETF reproduit la performance de l'indice via un contrat d'échange — c'est ce qui rend le MSCI World ou le S&P 500 éligibles au PEA.",
    metaTitle: "ETF synthétique (swap) : définition, risques et intérêt PEA",
    metaDescription:
      "Un ETF synthétique réplique son indice via un swap : il détient des actions européennes et échange leur performance contre celle de l'indice. C'est le mécanisme qui met le MSCI World dans le PEA. Risques encadrés UCITS expliqués.",
    definition: [
      "Un ETF à réplication synthétique ne détient pas les titres de son indice : il possède un panier de substitution (typiquement des actions européennes) et conclut avec une banque un contrat d'échange — le swap — qui troque la performance de ce panier contre celle de l'indice visé. Résultat : la performance du MSCI World ou du S&P 500, avec un portefeuille juridiquement composé d'actions européennes.",
      // 28/09/2026 : « tous synthétiques » pour DCAM, ESE, PSP5, PUST n'est pas
      // établi par la table de vérité ETF, et un swap ne rend pas éligible à
      // lui seul (500, ANX, AEEM sont des swaps NON éligibles).
      "C'est cette structure qui permet de loger un indice mondial dans un PEA : CW8, WPEA (MSCI World) et SPEA (S&P 500) sont des ETF à swap, leur nom l'indique. Mais le swap ne suffit pas : l'Amundi S&P 500 Swap (500), l'Amundi Nasdaq-100 Swap (ANX) et l'Amundi MSCI Emerging Markets Swap (AEEM) ne sont pas éligibles au PEA. Le statut se vérifie ETF par ETF.",
    ],
    inPractice: [
      {
        title: "Le passage obligé du PEA mondial",
        text: "Si vous voulez du MSCI World, du S&P 500 ou du Nasdaq dans votre PEA, la question « physique ou synthétique » ne se pose pas : les ETF éligibles sur ces indices sont synthétiques — ils détiennent des actions européennes et échangent leur performance contre celle de l'indice. L'inverse n'est pas vrai : un ETF synthétique n'est pas éligible pour autant. L'avantage fiscal compense très largement le risque résiduel du swap.",
      },
      {
        title: "Un risque réel mais borné",
        // 29/09/2026 : même correction que pour la réplication physique —
        // l'affirmation « jamais matérialisé en perte » n'était pas sourcée.
        text: "Le risque de contrepartie (la banque du swap fait défaut) est limité par la réglementation UCITS à 10 % de l'actif du fonds par contrepartie bancaire (5 % pour une autre contrepartie), et les émetteurs collatéralisent en pratique quotidiennement. Borné ne veut pas dire nul : c'est un risque faible, pas un risque absent.",
      },
    ],
    faq: [
      {
        q: "Que se passe-t-il si la banque du swap fait faillite ?",
        a: "Le fonds conserve son panier de substitution (les actions européennes qu'il détient réellement) et l'exposition non collatéralisée est plafonnée à 10 % par UCITS. La perte potentielle est donc limitée à l'écart de valeur non couvert au moment du défaut — en pratique proche de zéro avec la collatéralisation quotidienne.",
      },
      {
        q: "Un ETF synthétique verse-t-il les dividendes de l'indice ?",
        a: "La performance échangée via le swap intègre les dividendes (indices « net return » en général). Sur un ETF capitalisant comme CW8 ou WPEA, ils sont donc réinvestis dans la valeur de part, comme pour un physique capitalisant.",
      },
    ],
    related: [
      { href: "/glossaire/replication-physique", label: "La réplication physique" },
      { href: "/etf-msci-world", label: "Les MSCI World synthétiques du PEA" },
      { href: "/etf-sp500", label: "Le S&P 500 en PEA (SPEA, PSP5, ESE)" },
    ],
    category: "Frais & mécanique des ETF",
  },

  "capitalisant-distribuant": {
    slug: "capitalisant-distribuant",
    updatedAt: "2026-06-10",
    term: "Capitalisant vs distribuant",
    shortDef:
      "Un ETF capitalisant réinvestit automatiquement les dividendes ; un distribuant les verse en cash sur votre compte.",
    metaTitle: "ETF capitalisant ou distribuant : lequel pour un DCA ?",
    metaDescription:
      "Capitalisant (Acc) : dividendes réinvestis automatiquement, zéro friction fiscale en cours de route. Distribuant (Dist) : cash versé, imposé en CTO. Pour un DCA long terme, le capitalisant gagne presque toujours — explication.",
    definition: [
      "La politique de distribution d'un ETF détermine le sort des dividendes versés par les entreprises du portefeuille. Un ETF capitalisant (« Acc » pour accumulating) les réinvestit automatiquement dans le fonds : la valeur de part grossit, sans action de votre part. Un ETF distribuant (« Dist ») vous les verse périodiquement en liquidités.",
      "Pour un DCA de long terme, le capitalisant est presque toujours préférable : le réinvestissement est automatique (pas de cash qui dort, pas d'ordre à passer) et, en CTO, il évite l'imposition annuelle des dividendes — tout compose en brut jusqu'à la vente.",
    ],
    inPractice: [
      {
        title: "Le standard du DCA",
        text: "CW8, WPEA, DCAM, IWDA, VWCE, ESE… : les ETF de référence pour un DCA sont capitalisants. La composition des dividendes réinvestis représente une part substantielle de la performance totale sur 20 ans.",
      },
      {
        title: "Le distribuant a son public",
        text: "En phase de consommation du capital (retraite), un distribuant fournit un revenu régulier sans avoir à vendre des parts. C'est un outil de fin de parcours, pas d'accumulation.",
      },
    ],
    faq: [
      {
        q: "Comment reconnaître un ETF capitalisant ?",
        a: "Par le suffixe de son nom : « Acc » (accumulating) ou « C » = capitalisant ; « Dist », « D » ou « Inc » = distribuant. Exemple : iShares Core MSCI World UCITS ETF USD (Acc) = capitalisant. L'information figure aussi dans le DIC de l'émetteur.",
      },
      {
        q: "Dans un PEA, le choix a-t-il une importance fiscale ?",
        a: "Moins qu'en CTO : dans le PEA, les dividendes versés ne sont pas imposés tant qu'ils restent dans le plan. Le capitalisant garde l'avantage pratique (réinvestissement automatique, pas de cash dormant), mais l'écart fiscal du CTO disparaît.",
      },
    ],
    related: [
      { href: "/glossaire/pfu", label: "Le PFU sur les dividendes en CTO" },
      { href: "/interets-composes", label: "Pourquoi le réinvestissement compose" },
      { href: "/meilleurs-etf-debutants", label: "Les ETF capitalisants recommandés" },
    ],
    category: "Frais & mécanique des ETF",
  },

  // ─── Stratégie & risque ─────────────────────────────────────────────────────

  "lump-sum": {
    slug: "lump-sum",
    updatedAt: "2026-09-29",
    term: "Lump sum (investissement en une fois)",
    shortDef:
      "Investir tout son capital disponible immédiatement, plutôt que de l'étaler dans le temps comme le DCA.",
    metaTitle: "Lump sum vs DCA : définition et quand investir d'un coup",
    metaDescription:
      "Le lump sum (tout investir d'un coup) bat statistiquement le DCA ~2 fois sur 3 — mais expose au pire timing. Définition, l'étude Vanguard, et pourquoi le DCA reste le bon choix pour un revenu mensuel.",
    definition: [
      "Le lump sum consiste à investir immédiatement l'intégralité d'un capital disponible — héritage, prime, épargne accumulée — plutôt que de l'étaler par versements réguliers. C'est l'alternative au DCA, et le sujet d'un débat classique de l'investissement passif.",
      // 29/09/2026 (vanguard-2012-lsi-deux-tiers, vanguard-2012-ecart-moyen) :
      // « 1-2 % sur 6-12 mois » ne correspond pas à l'étude — l'écart moyen
      // face à un étalement sur 12 mois y va de 1,3 % (Australie) à 2,3 %
      // (États-Unis).
      "Statistiquement, le lump sum l'emporte environ deux fois sur trois : les marchés montent plus souvent qu'ils ne baissent, donc chaque mois passé hors du marché a, en moyenne, un coût d'opportunité. Dans son étude de 2012, Vanguard chiffre l'avantage moyen du versement unique, face à un étalement sur 12 mois, entre 1,3 % et 2,3 % de capital final en plus au bout de dix ans, selon le pays (États-Unis, Royaume-Uni, Australie), pour un portefeuille 60 % actions / 40 % obligations. Mais la moyenne cache la distribution : le tiers restant inclut les scénarios où tout investir la veille d'un krach fait très mal — financièrement et psychologiquement.",
    ],
    inPractice: [
      {
        title: "La vraie question : d'où vient l'argent ?",
        text: "Si vous épargnez sur votre salaire, le débat est sans objet : vous investissez l'argent quand il arrive, chaque mois — c'est un DCA par construction, et c'est optimal. Le dilemme lump sum ne se pose que pour un capital déjà constitué.",
      },
      {
        title: "Pour un capital reçu, un étalement court",
        text: "Compromis pragmatique pour un héritage ou une prime : étaler sur 6 à 12 mois. Vous capturez l'essentiel de l'espérance du lump sum tout en bornant le regret du pire timing — et vous dormez mieux, ce qui évite l'erreur la plus chère : paniquer et vendre.",
      },
    ],
    faq: [
      {
        q: "Le lump sum est-il « meilleur » que le DCA ?",
        a: "En espérance mathématique, oui (environ 2 fois sur 3 et, en moyenne, 1,3 % à 2,3 % de capital en plus au bout de dix ans face à un étalement sur 12 mois, portefeuille 60/40, selon l'étude Vanguard de 2012). En pratique, le meilleur plan est celui que vous tiendrez : un DCA qui vous évite de paniquer en cas de krach immédiat bat un lump sum abandonné au premier −20 %. Et pour l'épargne mensuelle sur salaire, le DCA est la seule option logique.",
      },
      {
        q: "Que disait le backtest COVID sur ce sujet ?",
        a: "Notre backtest réel montre qu'un DCA commencé un mois avant le krach COVID a transformé la chute en opportunité (l'essentiel du capital s'est investi après la baisse). Un lump sum à la même date aurait subi la chute de plein fouet avant de se refaire — même destination, trajet beaucoup plus stressant.",
      },
    ],
    related: [
      { href: "/strategie-dca", label: "La stratégie DCA (avec l'étude Vanguard)" },
      { href: "/backtest-covid-2020", label: "Backtest réel : DCA commencé avant le krach" },
      { href: "/simulateur", label: "Simuler votre DCA" },
    ],
    category: "Stratégie & risque",
  },

  volatilite: {
    slug: "volatilite",
    updatedAt: "2026-09-29",
    term: "Volatilité",
    shortDef:
      "L'amplitude des variations d'un actif autour de sa tendance — la mesure standard du « risque » en finance.",
    metaTitle: "Volatilité : définition simple et impact sur un DCA",
    metaDescription:
      "La volatilité mesure l'amplitude des variations d'un actif (13 à 14 %/an pour un ETF actions monde). Pourquoi elle est le prix à payer du rendement, et pourquoi le DCA la transforme en alliée. Définition claire.",
    definition: [
      // 29/09/2026 (BT-20, fiche MSCI World EUR au 31/08/2026) : « environ
      // 15 %/an » → 13 à 14 %. La valeur de la série est calculée plus haut
      // (VOLATILITE_SERIE) ; « +25 % / −15 % » (années non sourcées) retiré.
      `La volatilité mesure l'amplitude des fluctuations d'un actif autour de sa tendance, généralement exprimée en pourcentage annualisé. Un ETF actions monde affiche une volatilité historique de l'ordre de 13 à 14 % par an : ${un(VOLATILITE_SERIE)} % sur la série mensuelle en euros de nos backtests (de ${ANNEE_DEBUT_SERIE} à ${ANNEE_FIN_SERIE}), 13,45 % sur dix ans selon MSCI (MSCI World en euros, rendements mensuels, au 31 août 2026). Les années de forte hausse et celles de forte baisse font partie du même paysage statistique, même si la tendance de long terme a été haussière.`,
      "En finance classique, volatilité = risque. Pour l'investisseur long terme, c'est plus nuancé : la volatilité est surtout le prix d'entrée du rendement des actions. Les actifs « sans volatilité » (livrets) sont aussi ceux sans rendement réel après inflation.",
    ],
    inPractice: [
      {
        title: "Le DCA en fait une alliée",
        text: "Avec des versements fixes, la volatilité joue mécaniquement pour vous : le même montant achète plus de parts quand les prix baissent, moins quand ils montent. Sans les creux, pas d'achats soldés — un DCA sur un actif sans volatilité n'aurait aucun intérêt de lissage.",
      },
      {
        title: "Le vrai risque : votre réaction",
        text: "Sur 20 ans, le danger n'est pas la volatilité elle-même mais la vente panique pendant un creux — transformer une baisse temporaire en perte définitive. C'est le comportement, pas la variance, qui détruit les patrimoines.",
      },
    ],
    // 29/09/2026 : les 15 %/an du Monte Carlo sont une hypothèse du modèle, et
    // l'écart entre percentiles est calculé (MC_EXEMPLE) au lieu d'être écrit.
    example:
      `Notre analyse Monte Carlo simule 1 000 trajectoires de marché en supposant une volatilité de 15 %/an, une hypothèse un peu plus prudente que la volatilité mesurée. Pour ${HYPOTHESES_COMPARATIFS.monthlyAmount} €/mois pendant ${HYPOTHESES_COMPARATIFS.durationYears} ans à ${HYPOTHESES_COMPARATIFS.annualReturnPct} %/an avant frais et ${TER_REFERENCE_SIMULATEUR.toLocaleString("fr-FR")} % de frais annuels, les arrivées vont de ${formatEurBacktest(MC_EXEMPLE.finalP10)} au 10e percentile à ${formatEurBacktest(MC_EXEMPLE.finalP90)} au 90e, soit ${un(MC_EXEMPLE.finalP90 / MC_EXEMPLE.finalP10)} fois plus. La moyenne ne suffit pas pour piloter une stratégie.`,
    faq: [
      {
        q: "Quelle est la volatilité d'un ETF MSCI World ?",
        // 29/09/2026 : « autour de 15 % » → 13 à 14 %, avec la série et la
        // source MSCI ; les comparaisons S&P 500 / Nasdaq-100 (« ~20-25 % »)
        // n'étaient pas sourcées, retirées.
        a: `De l'ordre de 13 à 14 % par an : ${un(VOLATILITE_SERIE)} % sur la série mensuelle en euros de nos backtests (de ${ANNEE_DEBUT_SERIE} à ${ANNEE_FIN_SERIE}), 13,45 % sur dix ans selon MSCI (MSCI World en euros, au 31 août 2026). Mesurée sur des cours quotidiens, elle ressortirait un peu plus élevée. La diversification sur l'ensemble des pays développés lisse les chocs individuels sans supprimer le risque de marché global.`,
      },
      {
        q: "Comment réduire la volatilité d'un portefeuille DCA ?",
        a: "En ajoutant des actifs moins corrélés : obligations, fonds euros… au prix d'un rendement attendu plus faible. Pour un horizon de 15-20 ans et un tempérament qui supporte les creux, la volatilité actions se « paie toute seule » via le rendement supplémentaire. Notre outil d'allocation permet de tester des mix.",
      },
    ],
    related: [
      { href: "/glossaire/drawdown", label: "Le drawdown (perte maximale)" },
      { href: "/simulateur", label: "Monte Carlo : 1 000 scénarios de volatilité" },
      { href: "/allocation-portefeuille", label: "Tester un mix actions/obligations" },
    ],
    category: "Stratégie & risque",
  },

  drawdown: {
    slug: "drawdown",
    updatedAt: "2026-09-29",
    term: "Drawdown (perte maximale)",
    shortDef:
      "La baisse entre un sommet du portefeuille et le creux qui suit — la mesure la plus parlante du risque vécu.",
    metaTitle: "Drawdown : définition et chiffres réels d'un DCA MSCI World",
    // 29/09/2026 : « −17,8 % » était écrit à la main ; le backtest calcule
    // −17,9 % (BT-12). Le chiffre et le mois du creux sortent du moteur.
    metaDescription: CREUX_2010
      ? `Le drawdown mesure la chute pic-à-creux d'un portefeuille — le « pire moment » vécu. Sur un DCA MSCI World réel depuis 2010 : −${un(CREUX_2010.pct)} % au pire (${formatMonthFr(CREUX_2010.troughMonth)}). Pourquoi le DCA amortit les drawdowns de l'indice. Définition claire.`
      : "Le drawdown mesure la chute pic-à-creux d'un portefeuille — le « pire moment » vécu, sur un DCA MSCI World réel depuis 2010. Pourquoi le DCA amortit les drawdowns de l'indice. Définition claire.",
    definition: [
      "Le drawdown mesure la baisse d'un portefeuille entre un sommet (pic) et le point bas qui suit (creux), avant de retrouver le sommet. Le « maximum drawdown » est la pire de ces baisses sur une période : c'est la réponse à la question qui compte vraiment — « au pire moment, combien aurais-je vu fondre ? ».",
      // 29/09/2026 : « −34 % en cinq semaines au printemps 2020, −50 %+ en
      // 2008 » n'avait ni devise, ni granularité, ni source. MSCI : −53,6 % du
      // 24/05/2001 au 09/03/2009 (fiche MSCI World EUR au 31/08/2026) — une
      // baisse sur 2001-2009, pas sur la seule année 2008. Série du site :
      // calculée (KRACH_2008, KRACH_2020).
      `Contrairement à la volatilité (une moyenne statistique), le drawdown raconte l'expérience vécue. Selon MSCI, le MSCI World en euros (dividendes nets réinvestis) a perdu jusqu'à 53,6 % entre le 24 mai 2001 et le 9 mars 2009.${KRACHS_SERIE_PHRASE} C'est le drawdown qui teste les nerfs, pas l'écart-type.`,
    ],
    inPractice: [
      {
        // Réécrit le 28/09/2026. Le titre promettait un drawdown « plus doux
        // que celui de l'indice » et le texte ajoutait « quand l'indice perdait
        // bien davantage ». Calculé sur la même série, en clôtures mensuelles :
        // le portefeuille −17,9 %, l'indice −18,8 %. Après dix ans de
        // versements, un DCA encaisse la baisse presque en entier ; l'effet
        // amortisseur n'existe qu'au début, quand chaque versement pèse lourd.
        title: "Après quelques années, un DCA encaisse la baisse presque en entier",
        text:
          CREUX_2010 && CREUX_INDICE_2010 != null
            ? `Les versements amortissent une baisse au début, quand chacun pèse lourd face au capital déjà investi. Dix ans plus tard, ce n'est plus vrai : sur notre backtest réel depuis 2010, le portefeuille a reculé de −${un(CREUX_2010.pct)} % entre ${formatMonthFr(CREUX_2010.peakMonth)} et ${formatMonthFr(CREUX_2010.troughMonth)}, quand l'indice perdait −${un(CREUX_INDICE_2010)} % en clôtures mensuelles. Presque autant.`
            : "Les versements amortissent une baisse au début, quand chacun pèse lourd face au capital déjà investi. Après une dizaine d'années, le portefeuille encaisse la baisse presque en entier.",
      },
      {
        title: "Dimensionner avant d'investir",
        text: "Avant de choisir une allocation, posez-vous la question en euros, pas en pourcents : « si mon portefeuille de 50 000 € affiche −15 000 € pendant six mois, est-ce que je tiens ? ». Si la réponse est non, l'allocation est trop agressive — quelle que soit son espérance de rendement.",
      },
    ],
    faq: [
      {
        q: "Quel drawdown faut-il anticiper sur un ETF monde ?",
        // 29/09/2026 : « des baisses de 30 à 50 % une à deux fois par
        // décennie » n'était ni sourcé ni cohérent avec la série du site
        // (2020 : moins de 20 % en clôtures mensuelles). Chiffres MSCI et
        // chiffres calculés sur la série, chacun avec son périmètre.
        a: `Aucun chiffre ne se prévoit, mais l'historique donne des ordres de grandeur. Selon MSCI, le MSCI World en euros a perdu jusqu'à 53,6 % entre mai 2001 et mars 2009.${KRACHS_SERIE_PHRASE} Un portefeuille en construction par DCA encaisse des drawdowns plus faibles au début grâce à l'étalement des achats — mais plus le capital grossit, plus il se comporte comme un lump sum face aux baisses.`,
      },
      {
        q: "Où voir le drawdown réel de mon scénario ?",
        a: "Notre backtest calcule le drawdown maximum réellement traversé pour votre montant et votre période, sur les données MSCI World depuis 2008 — avec les dates exactes du pic et du creux.",
      },
    ],
    related: [
      { href: "/backtest", label: "Calculer le drawdown réel de votre DCA" },
      {
        href: "/backtest-depuis-2010",
        label: CREUX_2010
          ? `${Math.floor(BT_2010.result.monthsInvested / 12)} ans de DCA : −${un(CREUX_2010.pct)} % au pire`
          : "16 ans de DCA sur les vrais cours",
      },
      { href: "/glossaire/volatilite", label: "La volatilité" },
    ],
    category: "Stratégie & risque",
  },

  rebalancing: {
    slug: "rebalancing",
    updatedAt: "2026-09-28",
    term: "Rebalancing (rééquilibrage)",
    shortDef:
      "Ramener périodiquement son portefeuille à son allocation cible, quand les performances ont déformé les poids.",
    metaTitle: "Rebalancing : définition et méthode simple pour un DCA",
    metaDescription:
      "Le rééquilibrage ramène votre portefeuille à son allocation cible (ex. 80/20 monde/émergents) quand les marchés l'ont déformée. La méthode sans frais pour un DCA : rééquilibrer par les versements. Définition + méthode.",
    definition: [
      "Le rebalancing consiste à ramener périodiquement un portefeuille à son allocation cible. Exemple : vous visez 80 % MSCI World / 20 % émergents ; après une année où le World surperforme, vous êtes à 85/15 — le rééquilibrage restaure le 80/20, en vendant un peu de ce qui a monté pour racheter ce qui a baissé.",
      "L'intérêt n'est pas d'abord la performance (les études le montrent neutre à légèrement positif selon les périodes) mais le contrôle du risque : sans rééquilibrage, votre portefeuille dérive vers ses lignes les plus performantes — souvent les plus risquées — et votre allocation réelle ne correspond plus à celle que vous aviez choisie.",
    ],
    inPractice: [
      {
        title: "La méthode du DCA : rééquilibrer par les versements",
        text: "Plutôt que de vendre (frais, fiscalité en CTO), dirigez vos prochains versements vers la ligne sous-pondérée jusqu'à retrouver la cible. À l'échelle d'un DCA mensuel, c'est gratuit, fiscalement neutre et largement suffisant.",
      },
      {
        title: "Une fois par an suffit",
        text: "Un contrôle annuel — ou quand une ligne dévie de plus de 5 points de sa cible — est un bon rythme. Rééquilibrer trop souvent multiplie les frais pour un bénéfice nul ; un portefeuille mono-ETF (World seul) n'a, lui, rien à rééquilibrer.",
      },
    ],
    faq: [
      {
        q: "Faut-il rééquilibrer un portefeuille composé d'un seul ETF ?",
        a: "Non — c'est l'un des arguments de la simplicité : un ETF MSCI World seul se rééquilibre en interne (l'indice ajuste lui-même les poids de ses entreprises). Le rebalancing ne concerne que les portefeuilles multi-lignes (World + émergents, actions + obligations…).",
      },
      {
        q: "Le rééquilibrage déclenche-t-il des impôts ?",
        a: "En PEA, non (aucune fiscalité sur les arbitrages internes). En CTO, vendre une ligne en plus-value déclenche le PFU — raison de plus pour privilégier le rééquilibrage par les versements, qui n'implique aucune vente.",
      },
    ],
    related: [
      { href: "/allocation-portefeuille", label: "Construire une allocation multi-ETF" },
      { href: "/strategie-dca", label: "La stratégie DCA" },
      { href: "/glossaire/volatilite", label: "La volatilité" },
    ],
    category: "Stratégie & risque",
  },

  tri: {
    slug: "tri",
    // 01/10/2026 : mise en place dans un tableur (/suivi-pea-excel#tri) et
    // piège de la plage qui commence par des flux nuls.
    updatedAt: "2026-10-01",
    term: "TRI — Taux de Rendement Interne",
    shortDef:
      "Le rendement annualisé qui tient compte des dates et montants de chaque versement — la vraie mesure de performance d'un DCA.",
    metaTitle: "TRI : définition et pourquoi c'est LA mesure d'un DCA",
    metaDescription:
      "Le Taux de Rendement Interne annualise la performance en tenant compte de CHAQUE versement et de sa date — indispensable pour juger un DCA (le simple « +60 % » ne dit rien du temps). Définition + exemple réel.",
    definition: [
      "Le Taux de Rendement Interne est le taux annualisé qui égalise la valeur de tous vos versements (avec leurs dates) et la valeur finale du portefeuille. C'est l'équivalent de la fonction TRI.PAIEMENTS d'Excel — et la seule mesure honnête de la performance d'un DCA.",
      // 29/09/2026 : « +210 % » et « 12,7 %/an » étaient écrits à la main pour
      // le backtest depuis 2010, qui calcule +214 % et 12,6 %/an (BT-11). Ils
      // sortent désormais du même moteur que la page /backtest-depuis-2010.
      `Pourquoi pas un simple pourcentage de gain ? Parce qu'avec des versements étalés, chaque euro n'a pas travaillé la même durée : l'euro investi il y a 15 ans a eu 15 ans pour composer, celui du mois dernier, un mois. Sur notre backtest depuis 2010, un gain total de « +${Math.round(BT_2010.result.gainPct)} % » en ${Math.floor(BT_2010.result.monthsInvested / 12)} ans de DCA correspond ainsi à un TRI d'environ ${TRI_2010} %/an — c'est ce chiffre qui se compare aux rendements annoncés des autres placements.`,
    ],
    inPractice: [
      {
        title: "Comparer ce qui est comparable",
        text: "Livret à 3 %, fonds euros à 2,5 %, « +180 % en 15 ans » d'un collègue : seul le TRI met tout le monde sur la même échelle annualisée. Avant de comparer deux placements, convertissez en TRI.",
      },
      {
        title: "Le gain en % brut surestime toujours l'impression",
        text: `« J'ai fait +${Math.round(BT_COVID.gainPct)} % » sonne mieux que « TRI de ${un(BT_COVID.irrAnnualPct ?? 0)} %/an » — pourtant c'est la même performance sur notre backtest COVID. Méfiez-vous des pourcentages bruts sans durée ni dates de versement.`,
      },
    ],
    example:
      `Backtest réel : 200 €/mois depuis janvier 2010 = ${formatEurBacktest(BT_2010.result.totalInvested)} investis, ${formatEurBacktest(BT_2010.result.finalValue)} en ${formatMonthFr(BT_2010.endMonth)}. Gain brut : +${Math.round(BT_2010.result.gainPct)} %. TRI : ≈ ${TRI_2010} %/an — le chiffre à retenir, calculé sur les dates réelles des ${BT_2010.result.monthsInvested} versements.`,
    faq: [
      {
        q: "Quelle différence entre TRI et rendement annuel moyen ?",
        a: "Le « rendement annuel moyen » d'un indice suppose un capital investi en une fois au départ. Le TRI pondère chaque versement par sa durée réelle d'investissement — indispensable dès que les flux sont étalés (DCA, apports irréguliers). Pour un investissement unique sans flux, les deux coïncident.",
      },
      {
        q: "Comment calculer le TRI de mon propre DCA ?",
        a: "Notre backtest le calcule automatiquement pour un DCA sur le MSCI World (méthode Newton-Raphson sur les flux mensuels réels). Pour un portefeuille quelconque, la fonction TRI.PAIEMENTS (XIRR) d'Excel ou Google Sheets fait le même calcul à partir de vos dates et montants : chaque achat en négatif, la valeur du jour en positif. Attention à la plage : si elle commence par des lignes vides, comptées comme des flux nuls, le tableur peut afficher 0 %. La mise en place pas à pas est dans notre guide du suivi PEA sur Excel ou Google Sheets.",
      },
    ],
    related: [
      { href: "/suivi-pea-excel#tri", label: "Calculer le TRI de votre PEA dans Excel ou Google Sheets" },
      { href: "/backtest", label: "Le backtest calcule votre TRI réel" },
      { href: "/backtest-depuis-2010", label: `Exemple réel : TRI ${TRI_2010} %/an depuis 2010` },
      { href: "/interets-composes", label: "Les intérêts composés" },
    ],
    category: "Stratégie & risque",
  },
};

export const GLOSSARY_TERM_LIST = Object.values(GLOSSARY_TERMS);

export function getGlossaryTerm(slug: string): GlossaryTerm | null {
  return GLOSSARY_TERMS[slug] ?? null;
}
