// Pages "nom d'indice" — /etf-msci-world, /etf-sp500, /etf-nasdaq.
//
// Pourquoi : les débutants cherchent l'INDICE ("etf msci world", "etf s&p 500",
// "etf nasdaq") bien plus que les tickers (CW8, IWDA…). Ces pages captent le
// volume top-funnel et orientent vers le bon tracker + le simulateur DCA.
//
// ⚠️ YMYL : les TER/encours évoluent. Données indicatives revues 2026-06 —
// le composant affiche un disclaimer + les sources. Toujours vérifier la
// fiche officielle de l'émetteur avant d'investir.
//
// ─── Revue du 28/09/2026 contre la table de vérité ETF ─────────────────────
// Noms, ISIN, TER et éligibilités recoupés émetteur + justETF/Boursorama/
// Euronext. Ce qui ne s'y trouvait pas (encours « le plus gros », liquidité,
// « le seul », prix de part au jugé) a été retiré plutôt que deviné : sur ces
// pages, un lecteur recopie l'ISIN pour passer son ordre.

import { ecartCapital } from "@/lib/ecart-frais";
import type { ProductId } from "@/lib/products";

export type IndexTracker = {
  ticker: string;
  name: string;
  issuer: string;
  isin?: string;
  ter: string;
  replication: "Synthétique" | "Physique";
  /** Enveloppe principale. « Non commercialisé (EEE) » : ETF américain sans
   *  DIC PRIIPs, qu'un particulier de l'EEE ne peut plus acheter depuis le
   *  01/01/2018 (AMF) — l'afficher « CTO / AV » laissait croire le contraire. */
  envelope: "PEA + CTO" | "CTO / AV" | "Non commercialisé (EEE)";
  pea: boolean;
  note: string;
  /** Met en avant la ligne (le choix recommandé pour la majorité). */
  recommended?: boolean;
};

export type IndexGuide = {
  slug: string; // "etf-msci-world"
  indexName: string; // "MSCI World"
  /** Icône Lucide (nom) utilisée par l'EducationalHeader. */
  icon: "Globe" | "Landmark" | "Cpu";
  metaTitle: string;
  metaDescription: string;
  h1: string;
  eyebrow: string;
  subtitle: string;
  /** "Qu'est-ce que l'indice" — 1-2 paragraphes. */
  whatItIs: string[];
  /** Liste des trackers (PEA d'abord, puis CTO). */
  trackers: IndexTracker[];
  /** Verdict en 3 angles. */
  verdict: { label: string; text: string }[];
  /** Points clés / à retenir. */
  keyPoints: string[];
  /**
   * Renvoi vers un produit, posé après la FAQ (RenvoiProduit). L'accroche est
   * écrite pour l'indice : une page sans accroche n'a pas de renvoi.
   */
  renvoiProduit?: { produit: ProductId; contexte: string };
  faq: { q: string; a: string }[];
  related: { label: string; href: string }[];
  /** `note` : précision affichée sous la source (date de consultation…). */
  sources: { label: string; url: string; publisher?: string; note?: string }[];
  /**
   * Pré-remplissage du simulateur depuis le CTA de la page.
   * - feesPct : factuel (TER du tracker PEA de référence)
   * - returnPct : hypothèse de base raisonnable pour cet indice (l'user
   *   l'ajuste ; le simulateur affiche 3 scénarios + disclaimer). On reste
   *   modéré pour ne rien promettre (pas les plus hauts historiques).
   */
  simulator: { monthly: number; years: number; returnPct: number; feesPct: number };
  /** Ticker (displaySymbol de etf-config) pré-sélectionné sur la page allocation. */
  allocationTicker: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
};

// ─── MSCI World ───────────────────────────────────────────────────────────────

const MSCI_WORLD: IndexGuide = {
  slug: "etf-msci-world",
  indexName: "MSCI World",
  icon: "Globe",
  simulator: { monthly: 200, years: 20, returnPct: 7, feesPct: 0.2 },
  allocationTicker: "CW8",
  // Les tickers dans le titre captent les requêtes secondaires (« cw8 »,
  // « tracker world ») que la formulation générique laissait passer.
  metaTitle: "ETF MSCI World en PEA : CW8, WPEA ou DCAM ? (2026)",
  metaDescription:
    "CW8 à 0,38 %, WPEA et DCAM à 0,20 % : même indice, des frais qui changent tout sur 20 ans. Comparatif chiffré et simulateur pour tester votre cas.",
  h1: "ETF MSCI World : lequel choisir pour votre PEA ?",
  eyebrow: "Guide ETF · indice mondial",
  subtitle:
    // 28/09/2026 : disait « Trois ETF le répliquent en PEA ». La table en
    // recense quatre (CW8, WPEA, DCAM, et EWLD, part distribuante du fonds de
    // CW8) — et rien ne prouve qu'il n'y en a pas d'autres.
    "Le MSCI World est l'indice le plus utilisé pour un DCA en ETF : ~1 300 entreprises des 23 pays développés, en un seul fonds. Plusieurs ETF le répliquent en PEA — avec des frais qui font une vraie différence sur le long terme. Voici comment trancher.",
  whatItIs: [
    // 29/09/2026 : « environ 1 500 » entreprises contredisait le sous-titre
    // (~1 300). Fiche MSCI au 31/08/2026 : 1 280 constituants, 23 pays
    // développés (fait msci-world-composition).
    "Le MSCI World suit environ 1 300 grandes et moyennes entreprises (1 280 au 31 août 2026, selon la fiche de l'indice) réparties sur 23 pays développés (États-Unis, Japon, Royaume-Uni, France, Allemagne, Suisse, Canada…). Acheter un ETF MSCI World, c'est s'exposer en un seul ordre à l'économie mondiale développée.",
    // 28/09/2026 : ajout de GPEA (table de vérité : FR0014017NX3, MSCI ACWI,
    // 0,30 %, fonds créé le 06/07/2026). Le texte laissait croire qu'en PEA,
    // les émergents ne s'ajoutaient qu'avec une deuxième ligne.
    // 29/09/2026 : « environ 70 % » → 72,14 % au 31/08/2026 (fiche MSCI, fait
    // msci-world-poids-pays). « Un S&P 500 élargi » retiré : la poche
    // américaine du MSCI World n'est pas le S&P 500 (autre indice, autres
    // règles de sélection).
    "Attention à une idée reçue : le MSCI World est composé à environ 72 % d'actions américaines (72,14 % au 31 août 2026, selon la fiche de l'indice). Ce n'est donc pas un « anti-S&P 500 » : les grandes sociétés américaines y dominent, complétées par celles du reste du monde développé. Il n'inclut PAS les marchés émergents (Chine, Inde, Brésil). Pour les couvrir aussi : un FTSE All-World (VWCE, hors PEA), un ETF émergents en complément (PAEEM en PEA — pas AEEM, qui n'y est pas éligible), ou, toujours en PEA, GPEA (Amundi PEA Global), qui suit un autre indice — le MSCI ACWI, monde entier émergents inclus — pour 0,30 % de frais. Fonds créé en juillet 2026 : il n'a donc presque aucun historique.",
  ],
  trackers: [
    {
      ticker: "CW8",
      // 28/09/2026 : nom complet d'après la table (« Swap », « EUR Acc »
      // manquaient). Retirés : « plus gros encours », « liquidité maximale »,
      // « disponible chez tous les courtiers » — la table ne donne pas
      // l'encours de CW8, et WPEA y dépasse 2 milliards d'euros.
      name: "Amundi MSCI World Swap UCITS ETF EUR Acc",
      issuer: "Amundi",
      isin: "LU1681043599",
      ter: "0,38 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "Le MSCI World d'Amundi en PEA, en réplication par swap. Même indice que WPEA et DCAM, mais 0,38 % de frais par an contre 0,20 % : avec EWLD, sa part distribuante au même tarif, c'est le plus cher des ETF MSCI World éligibles PEA de ce guide.",
    },
    {
      ticker: "WPEA",
      // 28/09/2026 : l'ISIN affiché (IE0006WW1TQ4) n'était pas celui de WPEA,
      // et le nom (« iShares Core MSCI World ») était celui d'un autre fonds,
      // IWDA. Corrigés d'après la table : IE0002XZSHO1, nom exact ci-dessous.
      // « Cassé le monopole d'Amundi » retiré : la table ne dit rien de l'offre
      // avant 2024.
      name: "iShares MSCI World Swap PEA UCITS ETF EUR (Acc)",
      issuer: "iShares (BlackRock)",
      isin: "IE0002XZSHO1",
      ter: "0,20 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      // 29/09/2026 : encours chiffré (≈ 2,1 Md€) retiré — la table et justETF
      // divergent (part ou fonds ?, fait encours-a-trancher). Les deux
      // s'accordent sur le classement WPEA > DCAM, qui reste.
      note: "Lancé en mars 2024 et coté à Paris depuis avril 2024 : même indice que le CW8 pour des frais presque deux fois plus bas (0,20 % contre 0,38 %). Encours plus important que celui de DCAM, part sous 10 €.",
      recommended: true,
    },
    {
      ticker: "DCAM",
      // 28/09/2026 : ISIN ajouté (absent), nom complété. Le prix de part était
      // donné à « ~5 € » : la table l'établit autour de 6 €, et une part se
      // périme — « sous 10 € » suffit.
      name: "Amundi PEA Monde (MSCI World) UCITS ETF Acc",
      issuer: "Amundi",
      isin: "FR001400U5Q4",
      ter: "0,20 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      // 29/09/2026 : encours chiffré (≈ 1,4 Md€) retiré, même raison que WPEA.
      note: "Lancé par Amundi en mars 2025, au même TER que WPEA (0,20 %), avec un encours plus petit. Part sous 10 € : pratique pour un DCA mensuel de petits montants.",
    },
    {
      ticker: "IWDA",
      // 28/09/2026 : « coté en USD → non éligible PEA » donnait la mauvaise
      // cause. Ce qui l'exclut du PEA est ce qu'il détient (actions mondiales
      // en direct), pas sa devise de cotation.
      name: "iShares Core MSCI World UCITS ETF USD (Acc)",
      issuer: "iShares (BlackRock)",
      isin: "IE00B4L5Y983",
      ter: "0,20 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      note: "Le MSCI World d'iShares en réplication PHYSIQUE : il détient les actions en direct, majoritairement américaines → non éligible PEA. À loger en compte-titres ou assurance-vie. En PEA, le même indice passe par WPEA, DCAM ou CW8.",
    },
    {
      ticker: "VWCE",
      // 28/09/2026 : TER périmé (0,22 %) → 0,14 % d'après la table ; nom exact.
      name: "Vanguard FTSE All-World UCITS ETF (USD) Accumulating",
      issuer: "Vanguard",
      isin: "IE00BK5BQT80",
      ter: "0,14 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      // 29/09/2026 : « ~3 700 sociétés » → justETF compte 3 759 positions au
      // 31/08/2026 (fait non-pea-monde) : « plus de 3 700 » est exact.
      note: "Va plus loin que le MSCI World : il inclut AUSSI les marchés émergents (plus de 3 700 positions au 31 août 2026). Non éligible PEA. En PEA, l'équivalent « monde entier » est GPEA (MSCI ACWI, 0,30 %), beaucoup plus récent.",
    },
  ],
  verdict: [
    {
      label: "Pour un débutant en PEA",
      // 28/09/2026 : « Prenez DCAM… (prix de part plus bas), WPEA sinon »
      // retiré. Les deux parts sont sous 10 € d'après la table : l'écart ne
      // justifie pas une règle, et le site ne donne pas de conseil personnalisé.
      // L'écart de frais est désormais CALCULÉ (il était écrit « en milliers
      // d'euros »).
      text: `WPEA et DCAM (0,20 %) : même indice que le CW8, frais presque deux fois plus bas — environ ${ecartCapital(0.38, 0.2)} € d'écart de capital final sur vingt ans de versements mensuels, selon les hypothèses de notre comparatif CW8 vs WPEA. Leurs parts sont toutes deux sous 10 €, ce qui laisse peu de liquidités dormantes à chaque versement.`,
    },
    {
      // 28/09/2026 : « Disponible partout, énorme encours, spreads minuscules »
      // retiré — rien de cela n'est dans la table.
      label: "Si votre courtier ne propose que le CW8",
      text: "Le CW8 réplique le même MSCI World, dans le PEA, pour 0,38 % de frais par an. La performance brute est identique ; l'écart de frais avec WPEA et DCAM est le prix payé, et il est chiffré dans notre comparatif CW8 vs WPEA.",
    },
    {
      label: "Hors PEA (compte-titres)",
      text: "IWDA (réplication physique, sans swap) ou VWCE (0,14 %) pour avoir aussi les marchés émergents. Ces deux-là ne sont pas éligibles PEA.",
    },
  ],
  keyPoints: [
    // 29/09/2026 : « c'est le TER qui creuse l'écart » laissait croire que
    // l'écart de TER se retrouve tel quel dans la performance. Le TER exclut
    // notamment les frais de swap : c'est l'écart de suivi qui mesure l'écart
    // réel (fait ter-definition).
    "Même indice = même performance avant frais. Ce qui sépare ensuite deux ETF, c'est leur écart de suivi (tracking difference) : le TER en est la part la plus visible, mais pas la seule — les frais de swap, par exemple, n'y figurent pas.",
    // 29/09/2026 : « encadré à 10 % » était incomplet — 10 % par contrepartie
    // quand c'est un établissement de crédit, 5 % sinon (CMF art. R214-21,
    // fait ucits-contrepartie-10pc). Source ajoutée ci-dessous.
    // 30/09/2026 : la phrase disait « une même banque contrepartie (5 % pour
    // une contrepartie qui n'est pas un établissement de crédit) » — une
    // banque qui n'est pas un établissement de crédit, elle se contredisait.
    // Alignée sur la formulation de /etf-eligibles-pea, fidèle à R214-21.
    "Les ETF MSCI World éligibles PEA de ce guide (CW8, WPEA, DCAM) sont en réplication synthétique (swap) — c'est ce qui permet l'éligibilité PEA. Le risque de contrepartie est plafonné par la réglementation : au titre de ces contrats, il ne peut pas dépasser 10 % de l'actif du fonds sur une même contrepartie quand c'est un établissement de crédit, 5 % dans les autres cas.",
    "Un seul ETF MSCI World suffit pour démarrer. Inutile de cumuler CW8 + WPEA : c'est le même indice.",
  ],
  // 29/09/2026 : 1 169 impressions en 90 jours (Search Console au 28/09), et
  // aucun chemin vers le guide. L'accroche suppose le choix fait (le guide
  // compare les trackers, « un seul ETF suffit ») : reste à l'acheter.
  // ISIN (30/09/2026) : le code d'une PART de fonds, pas d'un fonds — CW8 et
  // EWLD, cités plus haut, sont deux parts du même fonds.
  renvoiProduit: {
    produit: "guide-demarrer-dca",
    contexte:
      "Une fois le tracker choisi, il reste à l'acheter\u00a0: ouvrir le PEA ou le compte-titres chez un courtier " +
      "dont les frais conviennent à votre montant, passer le premier ordre sur le bon ISIN (le code qui désigne une part précise d'un fonds), " +
      "puis répéter le versement chaque mois.",
  },
  faq: [
    {
      q: "Quel est le meilleur ETF MSCI World pour un PEA en 2026 ?",
      a: "À indice identique, les frais les plus bas de notre sélection sont à 0,20 % : c'est le niveau de WPEA (iShares) et de DCAM (Amundi), contre 0,38 % pour le CW8. Entre ces deux-là, les différences d'encours et de prix de part sont faibles ; l'écart entre eux et le CW8 est chiffré sur vingt ans dans notre comparatif CW8 vs WPEA.",
    },
    {
      q: "CW8, WPEA ou DCAM : quelle vraie différence ?",
      // ─── Cette réponse tranchait un duel qui a sa propre page ─────────────
      // Mesuré sur 90 jours : la requête n°1 de CETTE page est « cw8 vs
      // wpea », avec 87 impressions — loin devant ses requêtes propres, qui
      // en cumulent 5. Google l'associe donc à une question qu'elle ne fait
      // que recopier, pendant que /comparatif-etf/cw8-vs-wpea, qui la
      // démontre, se bat pour la même place.
      // Une page d'indice pose le cadre et oriente ; le face-à-face tranche.
      a: "Ils répliquent tous le MSCI World et sont éligibles au PEA en réplication synthétique — c'est ce qui les distingue des ETF physiques comme IWDA. Là où ils diffèrent, c'est sur les frais annuels, l'encours et le prix de la part, et ces écarts pèsent différemment selon le montant que vous versez chaque mois. Nous les avons chiffrés côte à côte dans notre comparatif CW8 vs WPEA, qui tranche la question sur vingt ans.",
    },
    {
      q: "Le MSCI World inclut-il les marchés émergents ?",
      // 28/09/2026 : présentait AEEM comme « éligible PEA » — faux d'après le
      // reporting Amundi du 31/08/2026 (version pour professionnels :
      // « Enveloppe fiscale : - »). L'ETF émergents éligible PEA de la table
      // est PAEEM.
      a: "Non. Le MSCI World ne couvre que les 23 pays développés. Pour inclure la Chine, l'Inde, le Brésil, etc., trois voies : un ETF FTSE All-World (VWCE, non éligible PEA) ; en PEA, un ETF émergents en complément — PAEEM (Amundi PEA Emergent, 0,30 %), et non AEEM, qui n'est pas éligible PEA ; ou, toujours en PEA, GPEA (Amundi PEA Global, 0,30 %), qui suit le MSCI ACWI, monde entier émergents inclus. GPEA a été créé en juillet 2026 : très peu de recul.",
    },
    {
      q: "Pourquoi IWDA n'est-il pas éligible PEA ?",
      // 29/09/2026 : « au moins 75 % d'actions européennes » → la règle est
      // « plus de 75 % » en actions de sociétés de l'UE ou de l'EEE (CMF art.
      // L221-31, fait pea-regle-75) : le Royaume-Uni et la Suisse n'en sont pas.
      a: "IWDA est un ETF à réplication physique : il détient réellement les actions américaines et internationales, ce qui le rend incompatible avec les règles du PEA. Pour y être éligible, un fonds doit investir plus de 75 % de son actif en actions de sociétés ayant leur siège dans l'Union européenne ou l'Espace économique européen — le Royaume-Uni et la Suisse, pourtant européens, n'en font pas partie. Les ETF MSCI World éligibles y parviennent en détenant un panier d'actions de ces pays dont ils échangent la performance contre celle de l'indice (swap). IWDA se loge en compte-titres ou assurance-vie ; en PEA, le même indice passe par WPEA, DCAM ou CW8.",
    },
  ],
  related: [
    { label: "CW8 vs WPEA : le comparatif détaillé", href: "/comparatif-etf/cw8-vs-wpea" },
    { label: "MSCI World vs S&P 500", href: "/comparatif-etf/msci-world-vs-sp500" },
    { label: "PEA ou CTO : quelle enveloppe ?", href: "/pea-ou-cto" },
    { label: "Chez quel courtier ouvrir votre PEA ?", href: "/comparatif" },
    { label: "Simuler mon DCA sur le MSCI World", href: "/simulateur" },
  ],
  sources: [
    // 28/09/2026 : libellés alignés sur les noms exacts (la source iShares
    // portait le nom d'IWDA alors qu'elle renvoyait à WPEA).
    { label: "Amundi MSCI World Swap UCITS ETF (CW8) et Amundi PEA Monde (DCAM) — fiches officielles", url: "https://www.amundietf.fr/fr/particuliers", publisher: "Amundi ETF" },
    // 29/09/2026 : ishares.com/fr/individual/fr redirigeait vers une 404
    // (blackrock.com/fr/particuliers/fr). Remplacé par la fiche produit de
    // WPEA, vérifiée (ISIN IE0002XZSHO1, TER 0,20 %).
    { label: "iShares MSCI World Swap PEA UCITS ETF (WPEA) — fiche officielle", url: "https://www.blackrock.com/fr/particuliers/products/335178/ishares-msci-world-swap-pea-ucits-etf", publisher: "BlackRock — iShares", note: "Consultée le 28/09/2026." },
    { label: "MSCI World Index — méthodologie", url: "https://www.msci.com/indexes/index/990100", publisher: "MSCI Inc." },
    // 29/09/2026 : sources des chiffres de composition (1 280 sociétés,
    // 72,14 % d'États-Unis), de la règle des 75 % et du plafond de contrepartie.
    { label: "MSCI World Index — fiche de l'indice (données au 31/08/2026)", url: "https://www.msci.com/documents/10199/255599/msci-world-index.pdf", publisher: "MSCI Inc.", note: "Nombre de sociétés et poids des pays. Consultée le 28/09/2026." },
    { label: "Code monétaire et financier, art. L221-31 — titres éligibles au PEA", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051218125", publisher: "Légifrance", note: "Plus de 75 % de l'actif en actions de sociétés de l'UE ou de l'EEE. Consulté le 28/09/2026." },
    { label: "Code monétaire et financier, art. R214-21 — risque de contrepartie d'un OPCVM", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000027797309", publisher: "Légifrance", note: "10 % de l'actif par contrepartie établissement de crédit, 5 % dans les autres cas. Consulté le 28/09/2026." },
    { label: "Plan d'Épargne en Actions — éligibilité", url: "https://www.service-public.fr/particuliers/vosdroits/F2385", publisher: "service-public.fr" },
  ],
  publishedAt: "2026-06-02",
  // 30/09/2026 : phrase sur le plafond de contrepartie corrigée (keyPoints).
  updatedAt: "2026-09-30",
  readingMinutes: 7,
};

// ─── S&P 500 ──────────────────────────────────────────────────────────────────

const SP500: IndexGuide = {
  slug: "etf-sp500",
  indexName: "S&P 500",
  icon: "Landmark",
  // 28/09/2026 : feesPct était 0,15 (ancien TER d'ESE, 0,14 % d'après la
  // table). Le tracker de référence est désormais SPEA, le moins cher de la
  // table (0,10 %).
  simulator: { monthly: 200, years: 20, returnPct: 8, feesPct: 0.1 },
  // 28/09/2026 : « 500 » (LU1681048804) n'est PAS éligible PEA d'après la
  // table de vérité. PSP5 (éligible, 0,12 %) est entré au catalogue le même
  // jour ; le mode « Mes ETF » du simulateur ne lit que ETF_LIST (région + TER),
  // aucune série de cours n'est nécessaire. SPEA, moins cher, n'est pas au
  // catalogue.
  allocationTicker: "PSP5",
  metaTitle: "ETF S&P 500 en PEA : lequel choisir en 2026 ?",
  // 28/09/2026 : « ESE 0,15 %, le plus liquide » et « PSP5, le moins cher »
  // étaient faux ou invérifiables — ESE est à 0,14 %, SPEA (0,10 %) est moins
  // cher que PSP5, et la table ne dit rien de la liquidité.
  metaDescription:
    "ETF S&P 500 éligibles PEA : SPEA (0,10 %), PSP5 (0,12 %), ESE (0,14 %) ou PE500 (filtre ESG, 0,25 %). Frais comparés, ISIN vérifiés, simulateur DCA.",
  h1: "ETF S&P 500 : lequel choisir pour votre PEA ?",
  eyebrow: "Guide ETF · indice américain",
  subtitle:
    "Le S&P 500 regroupe les 500 plus grandes entreprises américaines — l'indice le plus suivi au monde. En PEA, on y accède via des ETF synthétiques (swap). Voici lesquels, et comment choisir selon vos frais et votre courtier.",
  whatItIs: [
    "Le S&P 500 réunit les 500 plus grandes capitalisations cotées aux États-Unis (Apple, Microsoft, Nvidia, Amazon, Alphabet…). C'est l'indice de référence de la bourse américaine, et historiquement l'un des plus performants sur le long terme.",
    "En PEA, vous ne pouvez pas détenir directement des actions américaines. Les ETF S&P 500 éligibles PEA utilisent donc une réplication synthétique (swap) : le fonds échange la performance du S&P 500 contre un panier d'actions européennes. C'est parfaitement légal et encadré — c'est le mécanisme qui rend le S&P 500 accessible dans un PEA.",
  ],
  trackers: [
    {
      // 28/09/2026 : AJOUTÉ. SPEA manquait alors que c'est, d'après la table,
      // le S&P 500 éligible PEA le moins cher (0,10 %, lancé le 29/05/2025).
      // Le badge « Recommandé » passe d'ESE à SPEA : il reposait sur une
      // liquidité et un encours que la table ne permet pas d'établir, alors
      // que l'avantage de frais de SPEA, lui, est vérifié.
      ticker: "SPEA",
      name: "iShares S&P 500 Swap PEA UCITS ETF EUR (Acc)",
      issuer: "iShares (BlackRock)",
      isin: "IE000DQLYVB9",
      ter: "0,10 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      // 29/09/2026 : la petite taille du fonds était signalée sur /guide-5-…
      // et /meilleurs-etf-debutants, pas ici, où SPEA porte le badge. Aucun
      // montant d'encours : les sources divergent (encours-a-trancher).
      note: "Le S&P 500 éligible PEA le moins cher de notre sélection (0,10 %). Suit le S&P 500 classique, par swap. Fonds récent (lancé le 29 mai 2025) et encore petit : d'après justETF, son encours est très inférieur à celui de PSP5 au 31/08/2026, et un petit fonds est plus exposé au risque de fermeture.",
      recommended: true,
    },
    {
      ticker: "PSP5",
      // 28/09/2026 : l'ISIN affiché (FR0013412285) était celui du PE500, un
      // autre fonds qui suit un autre indice. ISIN de PSP5 d'après la table :
      // FR0011871128. « Le TER le plus bas du marché » était faux : SPEA est à
      // 0,10 %.
      name: "Amundi PEA S&P 500 UCITS ETF Acc",
      issuer: "Amundi",
      isin: "FR0011871128",
      ter: "0,12 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "Le S&P 500 classique chez Amundi, à 0,12 % : deuxième TER le plus bas de notre sélection, derrière SPEA. Ne pas le confondre avec le PE500, qui suit un indice filtré.",
    },
    {
      ticker: "ESE",
      // 28/09/2026 : TER 0,15 % → 0,14 % et nom exact d'après la table.
      // Retirés : « le plus liquide », « gros encours », « ~30 € » la part —
      // rien de cela n'est dans la table.
      name: "BNP Paribas Easy S&P 500 UCITS ETF EUR C",
      issuer: "BNP Paribas",
      isin: "FR0011550185",
      ter: "0,14 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "Le S&P 500 classique chez BNP Paribas (et non Amundi), à 0,14 % : quatre centièmes de plus que SPEA, deux de plus que PSP5.",
    },
    {
      ticker: "PE500",
      // 28/09/2026 : nom périmé (« S&P 500 ESG ») → « S&P 500 Screened » ; ISIN
      // ajouté (FR0013412285, celui qu'on affichait à tort pour PSP5). « Filtré
      // des controverses » retiré : la table dit « filtre ESG », sans détail.
      name: "Amundi PEA S&P 500 Screened UCITS ETF Acc",
      issuer: "Amundi",
      isin: "FR0013412285",
      ter: "0,25 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      // 29/09/2026 : « le S&P 500 Screened » donné comme nom d'indice retiré —
      // la table dit « S&P 500 Screened », justETF « S&P 500 Scored &
      // Screened+ » (fait etf-pea-pe500) : non tranché, à lire dans le DIC.
      note: "Ne suit PAS le S&P 500 classique mais une version filtrée sur des critères ESG — anciennement « Amundi PEA S&P 500 ESG ». Le nom exact de son indice figure dans son DIC. Plus cher (0,25 %) : son seul argument est le filtre.",
    },
    {
      ticker: "CSPX",
      // 28/09/2026 : « imbattable » retiré (on n'a pas vérifié tout le marché) ;
      // la cause de l'inéligibilité est la réplication physique, pas l'USD.
      name: "iShares Core S&P 500 UCITS ETF USD (Acc)",
      issuer: "iShares (BlackRock)",
      isin: "IE00B5BMR087",
      ter: "0,07 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      note: "TER de 0,07 % et réplication physique : il détient les actions américaines en direct → non éligible PEA. La référence pour un S&P 500 en compte-titres. En PEA : SPEA, PSP5 ou ESE.",
    },
    {
      ticker: "VUSA",
      name: "Vanguard S&P 500 UCITS ETF (USD) Distributing",
      issuer: "Vanguard",
      isin: "IE00B3XXRP09",
      ter: "0,07 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      note: "Équivalent Vanguard du CSPX, en version distribuante : les dividendes sont versés, pas réinvestis. Non éligible PEA. Pour un CTO.",
    },
  ],
  verdict: [
    {
      // 28/09/2026 : le verdict désignait ESE sur sa liquidité et son prix de
      // part, deux points absents de la table, et PSP5 comme « le TER le plus
      // bas », ce qui est faux. Réécrit sur ce qui est vérifié : les frais.
      // L'écart SPEA/ESE est calculé par le moteur.
      label: "Frais les plus bas en PEA",
      text: `SPEA (iShares, 0,10 %), puis PSP5 (Amundi, 0,12 %) et ESE (BNP Paribas, 0,14 %). Les trois suivent le même S&P 500 : entre le moins cher et le plus cher, l'écart représente environ ${ecartCapital(0.14, 0.1)} € de capital final sur vingt ans de versements mensuels, selon les hypothèses de nos comparatifs. Réel, mais faible.`,
    },
    {
      label: "Attention au nom commercial",
      text: "PE500 ne suit pas le S&P 500 mais une version filtrée sur des critères ESG, pour 0,25 % de frais. Et PSP5 et PE500 sont deux fonds distincts, avec deux ISIN distincts : vérifiez l'ISIN avant de passer l'ordre.",
    },
    {
      label: "Hors PEA (compte-titres)",
      text: "CSPX ou VUSA (0,07 %, réplication physique, sans swap). Moins chers que les versions PEA (0,10 à 0,14 %) — mais réservés au CTO, pas au PEA.",
    },
  ],
  keyPoints: [
    // 29/09/2026 : « le S&P 500 est déjà inclus à ~70 % dans un MSCI World »
    // confondait la poche américaine du MSCI World avec le S&P 500. Fiche
    // MSCI au 31/08/2026 : États-Unis 72,14 % (fait msci-world-poids-pays).
    "Un MSCI World contient déjà environ 72 % d'actions américaines (72,14 % au 31 août 2026). Choisir le S&P 500 pur, c'est parier sur la poursuite de la domination américaine.",
    "En PEA, un ETF S&P 500 passe par la réplication synthétique (swap) : les actions américaines ne sont pas éligibles en direct. Le risque de contrepartie est encadré par la réglementation UCITS.",
    "Concentration sur un seul pays = volatilité un peu plus élevée qu'un indice mondial. À assumer en connaissance de cause.",
  ],
  faq: [
    {
      q: "Quel est le meilleur ETF S&P 500 pour un PEA ?",
      // 28/09/2026 : désignait ESE (« très liquide, disponible partout ») et
      // PSP5 comme « le TER absolu le plus bas » — faux depuis SPEA (0,10 %).
      a: "Sur les frais, SPEA (iShares, 0,10 %) est le moins cher de notre sélection, devant PSP5 (Amundi, 0,12 %) et ESE (BNP Paribas, 0,14 %). Les trois suivent le S&P 500 classique ; SPEA est aussi le plus récent (lancé en mai 2025) et encore petit, donc plus exposé au risque de fermeture qu'un fonds installé comme PSP5. PE500 (0,25 %) suit une version du S&P 500 filtrée sur des critères ESG. Entre les trois premiers, l'écart de frais est faible.",
    },
    {
      q: "Peut-on vraiment mettre un S&P 500 dans un PEA ?",
      a: "Oui, via des ETF à réplication synthétique (swap) comme SPEA, PSP5, ESE ou PE500. Le fonds n'achète pas directement les actions américaines : il échange la performance du S&P 500 contre un panier d'actions européennes. C'est légal, courant, et encadré par la réglementation UCITS.",
    },
    {
      q: "Pourquoi CSPX est-il moins cher (0,07 %) mais pas éligible PEA ?",
      a: "CSPX est en réplication physique : il détient réellement les actions américaines, ce qui est incompatible avec le PEA. Son TER plus bas (0,07 %) est réservé au compte-titres. En PEA, les S&P 500 de notre sélection coûtent de 0,10 % (SPEA) à 0,14 % (ESE), hors version filtrée.",
    },
    {
      q: "S&P 500 ou MSCI World pour débuter ?",
      a: "Le MSCI World est plus diversifié (23 pays développés, dont environ 72 % d'actions américaines au 31 août 2026). Le S&P 500 est plus concentré sur les US mais a historiquement mieux performé sur la dernière décennie. Pour un débutant qui veut la simplicité maximale, le MSCI World est souvent recommandé ; le S&P 500 est un pari assumé sur les États-Unis.",
    },
  ],
  related: [
    { label: "MSCI World vs S&P 500 : le comparatif", href: "/comparatif-etf/msci-world-vs-sp500" },
    { label: "CW8 vs ESE", href: "/comparatif-etf/cw8-vs-ese" },
    { label: "PEA ou CTO : quelle enveloppe ?", href: "/pea-ou-cto" },
    { label: "Chez quel courtier ouvrir votre PEA ?", href: "/comparatif" },
    { label: "Simuler mon DCA sur le S&P 500", href: "/simulateur" },
  ],
  sources: [
    { label: "BNP Paribas Easy S&P 500 — fiche", url: "https://www.bnpparibas-am.fr/particulier/", publisher: "BNP Paribas AM" },
    { label: "Amundi PEA S&P 500 et PEA S&P 500 Screened — fiches", url: "https://www.amundietf.fr/fr/particuliers", publisher: "Amundi ETF" },
    // 29/09/2026 : lien iShares mort (redirection vers une 404) remplacé par la
    // fiche produit de SPEA, vérifiée (ISIN IE000DQLYVB9, TER 0,10 %).
    { label: "iShares S&P 500 Swap PEA UCITS ETF (SPEA) — fiche", url: "https://www.blackrock.com/fr/particuliers/products/342916/ishares-s-p-500-swap-pea-ucits-etf", publisher: "BlackRock — iShares", note: "Consultée le 28/09/2026." },
    { label: "iShares S&P 500 Swap PEA UCITS ETF EUR (Acc) — fiche justETF (IE000DQLYVB9)", url: "https://www.justetf.com/fr/etf-profile.html?isin=IE000DQLYVB9", publisher: "justETF", note: "Date de lancement et taille du fonds. Consultée le 28/09/2026." },
    { label: "S&P 500 — méthodologie de l'indice", url: "https://www.spglobal.com/spdji/fr/indices/equity/sp-500/", publisher: "S&P Dow Jones Indices" },
    { label: "MSCI World Index — fiche de l'indice (données au 31/08/2026)", url: "https://www.msci.com/documents/10199/255599/msci-world-index.pdf", publisher: "MSCI Inc.", note: "Poids des États-Unis dans le MSCI World. Consultée le 28/09/2026." },
    { label: "Code monétaire et financier, art. R214-21 — risque de contrepartie d'un OPCVM", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000027797309", publisher: "Légifrance", note: "Plafond du risque de contrepartie d'un ETF synthétique : 10 % de l'actif par établissement de crédit, 5 % sinon. Consulté le 28/09/2026." },
    { label: "Plan d'Épargne en Actions — éligibilité", url: "https://www.service-public.fr/particuliers/vosdroits/F2385", publisher: "service-public.fr" },
  ],
  publishedAt: "2026-06-02",
  updatedAt: "2026-09-28",
  readingMinutes: 7,
};

// ─── NASDAQ 100 ───────────────────────────────────────────────────────────────

const NASDAQ: IndexGuide = {
  slug: "etf-nasdaq",
  indexName: "Nasdaq 100",
  icon: "Cpu",
  simulator: { monthly: 200, years: 20, returnPct: 9, feesPct: 0.3 },
  // ⚠️ « ANX » (LU1681038243) n'est PAS éligible PEA d'après la table. Il reste
  // ici faute d'entrée PUST dans etf-config.ts (displaySymbol exigé) ; à
  // remplacer dès qu'elle existe.
  // 28/09/2026 : présélectionnait ANX, NON éligible PEA, sur une page titrée
  // « Nasdaq 100 en PEA ». PUST est l'équivalent éligible (table de vérité).
  allocationTicker: "PUST",
  metaTitle: "ETF Nasdaq 100 en PEA : lequel choisir en 2026 ?",
  // 28/09/2026 : citait PNAS (« fractionné ») et PANX (« ESG ») avec des
  // caractéristiques que la table ne confirme pas. Réécrite sur les faits
  // vérifiés.
  metaDescription:
    "ETF Nasdaq 100 éligible PEA : PUST (Amundi, 0,30 %), ISIN vérifié. Pourquoi CNDX et QQQ restent hors PEA, frais comparés et simulateur DCA.",
  h1: "ETF Nasdaq 100 : lequel choisir pour votre PEA ?",
  eyebrow: "Guide ETF · indice tech",
  // 28/09/2026 : « l'accès passe presque exclusivement par Amundi » retiré —
  // d'autres Nasdaq-100 éligibles PEA existent (la table cite PNAS).
  // 29/09/2026 : « les 100 plus grandes valeurs technologiques américaines »
  // était faux deux fois — l'indice prend les 100 plus grandes sociétés NON
  // FINANCIÈRES cotées au Nasdaq, tous secteurs confondus, et laisse de côté
  // les grandes tech cotées au NYSE. Aligné sur la définition du paragraphe
  // suivant.
  subtitle:
    "Le Nasdaq 100 regroupe les 100 plus grandes sociétés non financières cotées au Nasdaq, tous secteurs confondus — la technologie y pèse lourd. Plus concentré et plus volatil que le S&P 500. En PEA, on y accède par des ETF synthétiques (swap). Voici le guide.",
  whatItIs: [
    "Le Nasdaq 100 réunit les 100 plus grandes entreprises non-financières cotées au Nasdaq, très majoritairement technologiques (Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla…). C'est l'indice de la « tech » américaine.",
    "Conséquence : un potentiel de performance supérieur sur les phases de croissance tech, mais une volatilité nettement plus forte que le S&P 500 ou le MSCI World, et une concentration sectorielle extrême. À réserver à une part de votre portefeuille, pas à la totalité.",
  ],
  trackers: [
    {
      ticker: "PUST",
      // 28/09/2026 : « le seul à répliquer fidèlement l'indice classique tout
      // en étant éligible PEA » était faux — d'autres Nasdaq-100 éligibles PEA
      // existent (la table cite PNAS). Encours « > 700 M€ » périmé : ≈ 1,17
      // milliard d'euros au 31/08/2026 d'après la table. Nom exact.
      name: "Amundi PEA Nasdaq-100 UCITS ETF Acc",
      issuer: "Amundi",
      isin: "FR0011871110",
      ter: "0,30 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      // 29/09/2026 : encours chiffré (≈ 1,2 Md€) retiré — table 1,17 Md€,
      // justETF 1 255 M€ (fait encours-a-trancher) : écart non tranché.
      note: "Le Nasdaq-100 classique d'Amundi en PEA, par swap. D'autres lignes Nasdaq-100 éligibles PEA existent (PNAS par exemple) : nous ne les détaillons pas tant que leurs données ne sont pas vérifiées.",
      recommended: true,
    },
    // 28/09/2026 : PNAS et PANX RETIRÉS du tableau. Leurs lignes affirmaient
    // des faits absents de la table de vérité — PNAS « même fonds que PUST »,
    // « ~5 € la part » ; PANX, son nom, son indice (Solactive ISS ESG US Tech
    // 100) et son TER — sans ISIN pour les vérifier. Sur une page où un lecteur
    // recopie la ligne pour passer son ordre, mieux vaut une ligne en moins
    // qu'une ligne fausse. À réintroduire une fois vérifiées, ISIN compris.
    {
      ticker: "CNDX",
      // 28/09/2026 : nom exact ; cause de l'inéligibilité corrigée (physique,
      // pas la cotation en USD).
      name: "iShares NASDAQ 100 UCITS ETF USD (Acc)",
      issuer: "iShares (BlackRock)",
      isin: "IE00B53SZB19",
      ter: "0,30 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      note: "Réplication physique du Nasdaq-100 : il détient les actions américaines en direct → non éligible PEA. La référence pour un Nasdaq en compte-titres. En PEA : PUST, au même TER.",
    },
    {
      ticker: "QQQ",
      // 28/09/2026 : TER 0,20 % → 0,18 % (baisse du 22/12/2025, d'après la
      // table) ; nom exact et ISIN ajoutés.
      // 29/09/2026 : « difficilement accessible… réservé aux profils avancés
      // en CTO » était faux — sans DIC PRIIPs, il ne peut plus être
      // commercialisé auprès d'un particulier de l'EEE depuis le 01/01/2018,
      // quel que soit son niveau (AMF, fait non-pea-us-sans-dic). etf-config.ts
      // le disait déjà : les deux textes se contredisaient.
      name: "Invesco QQQ Trust, Series 1",
      issuer: "Invesco",
      isin: "US46090E1038",
      ter: "0,18 %",
      replication: "Physique",
      envelope: "Non commercialisé (EEE)",
      pea: false,
      note: "L'ETF Nasdaq-100 le plus connu au monde, mais domicilié aux États-Unis et sans document d'informations clés (DIC) européen : depuis le 1er janvier 2018, il ne peut plus être commercialisé auprès des particuliers de l'Espace économique européen, et un courtier européen en refuse en principe l'achat à un client non professionnel. Non éligible PEA. En compte-titres, l'équivalent accessible est CNDX.",
    },
  ],
  verdict: [
    {
      // 28/09/2026 : « essentiellement le seul choix sérieux » retiré, ainsi
      // que la part « fractionnée » PNAS à ~5 € (non vérifiée).
      label: "Pour un PEA",
      text: "PUST (Amundi, 0,30 %) réplique le Nasdaq-100 classique et c'est la ligne de ce guide dont nous avons vérifié l'ISIN, le TER et l'éligibilité au PEA. D'autres Nasdaq-100 éligibles PEA existent : comparez leur TER et leur indice exact avant de choisir.",
    },
    {
      // 28/09/2026 : l'exemple PANX (non vérifié) est remplacé par un cas de
      // la table, PE500, qui suit le S&P 500 Screened et non le S&P 500.
      label: "Attention au nom commercial",
      text: "Le nom commercial ne suffit pas : un ETF peut suivre une version filtrée de l'indice qu'il évoque. C'est le cas côté S&P 500, où PE500 suit une version du S&P 500 filtrée sur des critères ESG. Vérifiez le nom exact de l'indice dans le document d'information clé (DIC).",
    },
    {
      label: "Hors PEA (compte-titres)",
      text: "CNDX (iShares, physique, 0,30 %). Le QQQ américain (0,18 %) est plus connu, mais faute de DIC européen, il ne peut pas être commercialisé auprès des particuliers de l'Espace économique européen : en CTO, CNDX est la voie accessible.",
    },
  ],
  keyPoints: [
    "Le Nasdaq 100 est plus volatil que le S&P 500, avec une concentration tech extrême : c'est un pari sectoriel, pas un fonds « tout-terrain ».",
    // 28/09/2026 : « l'offre se résume quasiment à Amundi (PUST / PNAS). Peu de
    // concurrence » retiré — d'autres Nasdaq-100 éligibles PEA existent.
    "En PEA, PUST coûte 0,30 % par an : plus que les MSCI World (0,20 % pour WPEA et DCAM) ou les S&P 500 (0,10 à 0,14 %) éligibles PEA de nos guides.",
    "Bonne pratique : le Nasdaq en satellite (10-20 % du portefeuille), un MSCI World ou S&P 500 en cœur. Tout miser sur le Nasdaq augmente fortement le risque.",
  ],
  faq: [
    {
      q: "Quel est le meilleur ETF Nasdaq 100 pour un PEA ?",
      // 28/09/2026 : « quasiment le seul » et la part PNAS « même fonds, ~5 € »
      // retirés (faux pour le premier, non vérifié pour le second).
      // 29/09/2026 : encours chiffré retiré (écart table / justETF non tranché).
      a: "PUST (Amundi PEA Nasdaq-100, TER 0,30 %, ISIN FR0011871110) réplique le Nasdaq-100 classique en PEA. Ce n'est pas la seule ligne Nasdaq-100 éligible PEA (PNAS en est une autre) : à indice identique, c'est le TER qui les départage.",
    },
    {
      q: "Tous les ETF « Nasdaq » éligibles PEA suivent-ils le Nasdaq-100 ?",
      a: "Pas forcément. Le nom commercial ne suffit pas : un ETF peut suivre une version filtrée de l'indice qu'il évoque. Côté S&P 500, par exemple, PE500 suit une version du S&P 500 filtrée sur des critères ESG, pas le S&P 500 lui-même. PUST, lui, suit le Nasdaq-100 classique. Avant d'acheter, le nom exact de l'indice figure dans le document d'information clé (DIC).",
    },
    {
      q: "Le Nasdaq 100 est-il un bon choix pour débuter ?",
      a: "Comme unique support, non : il est très concentré sur la tech américaine et beaucoup plus volatil qu'un MSCI World ou un S&P 500. Il convient mieux en complément (satellite) d'un cœur de portefeuille diversifié, pour une part limitée (10-20 %).",
    },
    {
      // 29/09/2026 : « pas facilement accessible », « la plupart des courtiers
      // européens ne le proposent donc pas » minimisaient une interdiction de
      // commercialisation (AMF, fait non-pea-us-sans-dic).
      q: "Pourquoi ne peut-on pas acheter le QQQ en France ?",
      a: "Le QQQ (Invesco) est un ETF domicilié aux États-Unis qui ne publie pas le document d'informations clés (DIC) exigé par le règlement européen PRIIPs. Depuis le 1er janvier 2018, un tel produit ne peut plus être commercialisé auprès des particuliers de l'Espace économique européen : un courtier européen refuse en principe son achat à un client non professionnel, quel que soit son niveau d'expérience. Des parts achetées avant 2018 peuvent en revanche être revendues. En compte-titres, l'équivalent accessible est le CNDX (iShares) ; en PEA, PUST.",
    },
  ],
  related: [
    { label: "Comparatifs ETF", href: "/comparatif-etf" },
    { label: "ETF S&P 500 en PEA", href: "/etf-sp500" },
    { label: "PEA ou CTO : quelle enveloppe ?", href: "/pea-ou-cto" },
    { label: "Chez quel courtier ouvrir votre PEA ?", href: "/comparatif" },
    { label: "Simuler mon DCA sur le Nasdaq", href: "/simulateur" },
  ],
  sources: [
    // 29/09/2026 : la fiche Amundi (…/products/equity/…) renvoyait une 404 et
    // la page produit actuelle d'amundietf.fr affiche un autre fonds aux
    // robots : remplacée par le reporting mensuel officiel de PUST au
    // 31/08/2026, version « non professionnels » (…/RETAIL/…) — la version
    // …/INSTITUTIONNEL/… est « destinée exclusivement aux investisseurs
    // professionnels ». Vérifiée : ISIN FR0011871110, données au 31/08/2026,
    // « éligible au Plan d'Epargne en Actions ». Lien iShares mort remplacé
    // par la fiche produit de CNDX (IE00B53SZB19).
    { label: "Amundi PEA Nasdaq-100 UCITS ETF Acc — reporting mensuel au 31/08/2026", url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/FR0011871110/FRA/FRA/RETAIL/ETF/20260831", publisher: "Amundi ETF", note: "Document officiel de l'émetteur (PDF). Consulté le 28/09/2026." },
    { label: "iShares Nasdaq 100 UCITS ETF (CNDX) — fiche", url: "https://www.blackrock.com/fr/particuliers/products/253741/ishares-nasdaq-100-ucits-etf", publisher: "BlackRock — iShares", note: "Consultée le 28/09/2026." },
    { label: "Application du règlement PRIIPs : quel sort pour les produits packagés américains ? (journal de bord du médiateur, 2023)", url: "https://www.amf-france.org/fr/actualites-publications/dossiers-thematiques/les-dossiers-du-moment/application-du-reglement-priips-quel-sort-pour-les-produits-packages-americains-souscrits-avant-son", publisher: "Autorité des marchés financiers (AMF)", note: "Pourquoi un ETF américain sans DIC, comme le QQQ, n'est plus commercialisé auprès des particuliers depuis 2018. Consulté le 28/09/2026." },
    { label: "Nasdaq-100 — composition de l'indice", url: "https://www.nasdaq.com/market-activity/quotes/nasdaq-ndx-index", publisher: "Nasdaq" },
    { label: "Plan d'Épargne en Actions — éligibilité", url: "https://www.service-public.fr/particuliers/vosdroits/F2385", publisher: "service-public.fr" },
  ],
  publishedAt: "2026-06-02",
  updatedAt: "2026-09-28",
  readingMinutes: 6,
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const INDEX_GUIDES: Record<string, IndexGuide> = {
  "etf-msci-world": MSCI_WORLD,
  "etf-sp500": SP500,
  "etf-nasdaq": NASDAQ,
};

export const INDEX_GUIDE_LIST: IndexGuide[] = Object.values(INDEX_GUIDES);
