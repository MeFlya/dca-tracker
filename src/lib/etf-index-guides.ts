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

export type IndexTracker = {
  ticker: string;
  name: string;
  issuer: string;
  isin?: string;
  ter: string;
  replication: "Synthétique" | "Physique";
  /** Enveloppe principale. */
  envelope: "PEA + CTO" | "CTO / AV";
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
  faq: { q: string; a: string }[];
  related: { label: string; href: string }[];
  sources: { label: string; url: string; publisher?: string }[];
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
    "Le MSCI World suit environ 1 500 grandes et moyennes entreprises réparties sur 23 pays développés (États-Unis, Japon, Royaume-Uni, France, Allemagne, Suisse, Canada…). Acheter un ETF MSCI World, c'est s'exposer en un seul ordre à l'économie mondiale développée.",
    // 28/09/2026 : ajout de GPEA (table de vérité : FR0014017NX3, MSCI ACWI,
    // 0,30 %, fonds créé le 06/07/2026). Le texte laissait croire qu'en PEA,
    // les émergents ne s'ajoutaient qu'avec une deuxième ligne.
    "Attention à une idée reçue : le MSCI World est composé à environ 70 % d'actions américaines. Ce n'est donc pas un « anti-S&P 500 » — c'est un S&P 500 élargi au reste du monde développé. Il n'inclut PAS les marchés émergents (Chine, Inde, Brésil). Pour les couvrir aussi : un FTSE All-World (VWCE, hors PEA), un ETF émergents en complément (PAEEM en PEA — pas AEEM, qui n'y est pas éligible), ou, toujours en PEA, GPEA (Amundi PEA Global), qui suit un autre indice — le MSCI ACWI, monde entier émergents inclus — pour 0,30 % de frais. Fonds créé en juillet 2026 : il n'a donc presque aucun historique.",
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
      note: "Lancé en mars 2024 et coté à Paris depuis avril 2024 : même indice que le CW8 pour des frais presque deux fois plus bas (0,20 % contre 0,38 %). Encours d'environ 2,1 milliards d'euros fin août 2026, part sous 10 €.",
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
      note: "Lancé par Amundi en mars 2025, au même TER que WPEA (0,20 %). Encours d'environ 1,4 milliard d'euros fin août 2026, part sous 10 € : pratique pour un DCA mensuel de petits montants.",
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
      note: "Va plus loin que le MSCI World : il inclut AUSSI les marchés émergents (~3 700 sociétés). Non éligible PEA. En PEA, l'équivalent « monde entier » est GPEA (MSCI ACWI, 0,30 %), beaucoup plus récent.",
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
    "Même indice = même performance brute. Sur le long terme, c'est le TER qui creuse l'écart, pas le nom de l'émetteur.",
    "Les ETF MSCI World éligibles PEA de ce guide (CW8, WPEA, DCAM) sont en réplication synthétique (swap) — c'est ce qui permet l'éligibilité PEA. Le risque de contrepartie est encadré à 10 % par la réglementation UCITS.",
    "Un seul ETF MSCI World suffit pour démarrer. Inutile de cumuler CW8 + WPEA : c'est le même indice.",
  ],
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
      // reporting Amundi du 31/08/2026 (compte-titres et assurance-vie
      // seulement). L'ETF émergents éligible PEA de la table est PAEEM.
      a: "Non. Le MSCI World ne couvre que les 23 pays développés. Pour inclure la Chine, l'Inde, le Brésil, etc., trois voies : un ETF FTSE All-World (VWCE, non éligible PEA) ; en PEA, un ETF émergents en complément — PAEEM (Amundi PEA Emergent, 0,30 %), et non AEEM, qui n'est pas éligible PEA ; ou, toujours en PEA, GPEA (Amundi PEA Global, 0,30 %), qui suit le MSCI ACWI, monde entier émergents inclus. GPEA a été créé en juillet 2026 : très peu de recul.",
    },
    {
      q: "Pourquoi IWDA n'est-il pas éligible PEA ?",
      a: "IWDA est un ETF à réplication physique : il détient réellement les actions américaines et internationales, ce qui le rend incompatible avec les règles du PEA, qui exigent de détenir au moins 75 % d'actions européennes. Les ETF MSCI World éligibles y parviennent en détenant un panier européen dont ils échangent la performance contre celle de l'indice (swap). IWDA se loge en compte-titres ou assurance-vie ; en PEA, le même indice passe par WPEA, DCAM ou CW8.",
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
    { label: "iShares MSCI World Swap PEA UCITS ETF (WPEA) — fiche officielle", url: "https://www.ishares.com/fr/individual/fr", publisher: "BlackRock — iShares" },
    { label: "MSCI World Index — méthodologie", url: "https://www.msci.com/indexes/index/990100", publisher: "MSCI Inc." },
    { label: "Plan d'Épargne en Actions — éligibilité", url: "https://www.service-public.fr/particuliers/vosdroits/F2385", publisher: "service-public.fr" },
  ],
  publishedAt: "2026-06-02",
  updatedAt: "2026-09-28",
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
      note: "Le S&P 500 éligible PEA le moins cher de notre sélection (0,10 %). Suit le S&P 500 classique, par swap. Fonds récent : lancé le 29 mai 2025.",
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
      note: "Ne suit PAS le S&P 500 classique mais le S&P 500 Screened (filtre ESG) — anciennement « Amundi PEA S&P 500 ESG ». Plus cher (0,25 %) : son seul argument est le filtre.",
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
      text: "PE500 ne suit pas le S&P 500 mais le S&P 500 Screened, une version filtrée (ESG), pour 0,25 % de frais. Et PSP5 et PE500 sont deux fonds distincts, avec deux ISIN distincts : vérifiez l'ISIN avant de passer l'ordre.",
    },
    {
      label: "Hors PEA (compte-titres)",
      text: "CSPX ou VUSA (0,07 %, réplication physique, sans swap). Moins chers que les versions PEA (0,10 à 0,14 %) — mais réservés au CTO, pas au PEA.",
    },
  ],
  keyPoints: [
    "Le S&P 500 est déjà inclus à ~70 % dans un MSCI World. Choisir le S&P 500 pur, c'est parier sur la poursuite de la domination américaine.",
    "En PEA, un ETF S&P 500 passe par la réplication synthétique (swap) : les actions américaines ne sont pas éligibles en direct. Le risque de contrepartie est encadré par la réglementation UCITS.",
    "Concentration sur un seul pays = volatilité un peu plus élevée qu'un indice mondial. À assumer en connaissance de cause.",
  ],
  faq: [
    {
      q: "Quel est le meilleur ETF S&P 500 pour un PEA ?",
      // 28/09/2026 : désignait ESE (« très liquide, disponible partout ») et
      // PSP5 comme « le TER absolu le plus bas » — faux depuis SPEA (0,10 %).
      a: "Sur les frais, SPEA (iShares, 0,10 %) est le moins cher de notre sélection, devant PSP5 (Amundi, 0,12 %) et ESE (BNP Paribas, 0,14 %). Les trois suivent le S&P 500 classique ; SPEA est aussi le plus récent (lancé en mai 2025). PE500 (0,25 %) suit une version filtrée ESG, le S&P 500 Screened. Entre les trois premiers, l'écart de frais est faible.",
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
      a: "Le MSCI World est plus diversifié (23 pays, dont déjà ~70 % de S&P 500). Le S&P 500 est plus concentré sur les US mais a historiquement mieux performé sur la dernière décennie. Pour un débutant qui veut la simplicité maximale, le MSCI World est souvent recommandé ; le S&P 500 est un pari assumé sur les États-Unis.",
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
    { label: "iShares S&P 500 Swap PEA UCITS ETF (SPEA) — fiche", url: "https://www.ishares.com/fr/individual/fr", publisher: "BlackRock — iShares" },
    { label: "S&P 500 — méthodologie de l'indice", url: "https://www.spglobal.com/spdji/fr/indices/equity/sp-500/", publisher: "S&P Dow Jones Indices" },
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
  subtitle:
    "Le Nasdaq 100 regroupe les 100 plus grandes valeurs technologiques américaines. Plus concentré et plus volatil que le S&P 500. En PEA, on y accède par des ETF synthétiques (swap). Voici le guide.",
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
      note: "Le Nasdaq-100 classique d'Amundi en PEA, par swap. Encours d'environ 1,2 milliard d'euros fin août 2026. D'autres lignes Nasdaq-100 éligibles PEA existent (PNAS par exemple) : nous ne les détaillons pas tant que leurs données ne sont pas vérifiées.",
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
      name: "Invesco QQQ Trust, Series 1",
      issuer: "Invesco",
      isin: "US46090E1038",
      ter: "0,18 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      note: "L'ETF Nasdaq-100 le plus connu au monde, mais coté aux États-Unis : difficilement accessible aux particuliers européens (réglementation PRIIPs). Réservé aux profils avancés en CTO.",
    },
  ],
  verdict: [
    {
      // 28/09/2026 : « essentiellement le seul choix sérieux » retiré, ainsi
      // que la part « fractionnée » PNAS à ~5 € (non vérifiée).
      label: "Pour un PEA",
      text: "PUST (Amundi, 0,30 %) réplique le Nasdaq-100 classique et c'est la ligne de ce guide dont nous avons vérifié l'ISIN, le TER et l'encours. D'autres Nasdaq-100 éligibles PEA existent : comparez leur TER et leur indice exact avant de choisir.",
    },
    {
      // 28/09/2026 : l'exemple PANX (non vérifié) est remplacé par un cas de
      // la table, PE500, qui suit le S&P 500 Screened et non le S&P 500.
      label: "Attention au nom commercial",
      text: "Le nom commercial ne suffit pas : un ETF peut suivre une version filtrée de l'indice qu'il évoque. C'est le cas côté S&P 500, où PE500 suit le S&P 500 Screened. Vérifiez le nom exact de l'indice dans le document d'information clé (DIC).",
    },
    {
      label: "Hors PEA (compte-titres)",
      text: "CNDX (iShares, physique, 0,30 %). Le QQQ américain (0,18 %) est plus connu mais difficilement accessible aux particuliers européens — en CTO, CNDX est la voie simple.",
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
      a: "PUST (Amundi PEA Nasdaq-100, TER 0,30 %, ISIN FR0011871110) réplique le Nasdaq-100 classique en PEA, avec un encours d'environ 1,2 milliard d'euros fin août 2026. Ce n'est pas la seule ligne Nasdaq-100 éligible PEA (PNAS en est une autre) : à indice identique, c'est le TER qui les départage.",
    },
    {
      q: "Tous les ETF « Nasdaq » éligibles PEA suivent-ils le Nasdaq-100 ?",
      a: "Pas forcément. Le nom commercial ne suffit pas : un ETF peut suivre une version filtrée de l'indice qu'il évoque. Côté S&P 500, par exemple, PE500 suit le S&P 500 Screened (filtre ESG), pas le S&P 500. PUST, lui, suit le Nasdaq-100 classique. Avant d'acheter, le nom exact de l'indice figure dans le document d'information clé (DIC).",
    },
    {
      q: "Le Nasdaq 100 est-il un bon choix pour débuter ?",
      a: "Comme unique support, non : il est très concentré sur la tech américaine et beaucoup plus volatil qu'un MSCI World ou un S&P 500. Il convient mieux en complément (satellite) d'un cœur de portefeuille diversifié, pour une part limitée (10-20 %).",
    },
    {
      q: "Pourquoi le QQQ n'est-il pas facilement accessible en France ?",
      a: "Le QQQ (Invesco) est coté aux États-Unis et n'a pas de document d'information clé (KID) conforme à la réglementation européenne PRIIPs. La plupart des courtiers européens ne le proposent donc pas aux particuliers. En CTO, l'équivalent accessible est le CNDX (iShares).",
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
    { label: "Amundi PEA Nasdaq-100 UCITS ETF — fiche officielle", url: "https://www.amundietf.fr/fr/particuliers/products/equity/amundi-pea-nasdaq100-ucits-etf-acc/fr0011871110", publisher: "Amundi ETF" },
    { label: "iShares Nasdaq 100 UCITS ETF — fiche", url: "https://www.ishares.com/fr/individual/fr", publisher: "BlackRock — iShares" },
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
