// ETF vs ETF comparison data for /comparatif-etf/*.
// Static educational content. TER CW8/WPEA/DCAM re-vérifiés via fiches
// émetteurs lors de la création des pages indice.

import { ecartFiscalEnviron, impotCTOEnviron, impotPEAEnviron } from "@/lib/impot-affiche";

import { capitalPour, coutFrais, ecartCapital, gainsPour } from "@/lib/ecart-frais";

/**
 * Mois de dernière revérification des TER et caractéristiques, format YYYY-MM.
 * Exporté et affiché publiquement — cf. commentaire de BROKERS_REVIEWED_ON.
 */
export const ETF_COMPARISONS_REVIEWED_ON = "2026-06";
// Performance figures are approximate — always verify on live data sources
// before investment decisions.

export type ETFSide = {
  heading: string;             // "MSCI World" / "CW8 (Amundi MSCI World)"
  subheading?: string;         // small subtitle, e.g. the ISIN or issuer
  type: "Indice" | "ETF";
  coverage: string;            // scope of the index/ETF
  issuer?: string;             // ETF-only
  ter: string;                 // annual fees
  replication?: string;        // "Physique" | "Synthétique"
  distribution?: string;       // "Capitalisant" | "Distribuant"
  currency?: string;           // "USD" | "EUR"
  peaEligible: string; // "Oui", "Non", or nuanced ("Oui (via synthétique)")
  strongPoint: string;         // headline pro
  weakPoint: string;           // headline con
};

/**
 * TER d'un côté en nombre, ou null s'il n'est pas exploitable.
 *
 * Volontairement STRICT : n'accepte que la forme exacte « 0,20 %/an ». Les
 * pages qui opposent deux INDICES écrivent « ETF à partir de 0,12 % (EWLD,
 * WPEA) » — une fourchette, pas le TER d'un produit. Une regex permissive du
 * type /(\d+,\d+)\s*%/ en tirerait 0,12 et préremplirait un simulateur avec le
 * TER d'un ETF que la page ne compare pas. Ici, un format inattendu renvoie
 * null et l'appelant retombe sur un comportement générique — jamais sur un
 * chiffre deviné.
 */
export function terNumerique(side: ETFSide): number | null {
  const m = /^(\d+),(\d{1,2}) %\/an$/.exec(side.ter.trim());
  if (!m) return null;
  return Number(`${m[1]}.${m[2]}`);
}

/** Le TER le plus bas du duel, quand les DEUX côtés sont exploitables. */
export function terLePlusBas(c: ETFComparison): number | null {
  const g = terNumerique(c.left);
  const d = terNumerique(c.right);
  return g == null || d == null ? null : Math.min(g, d);
}

export type UseCase = {
  profile: string;             // short persona label
  winner: "left" | "right" | "both";
  explanation: string;
};

export type ETFComparison = {
  slug: string;
  left: ETFSide;
  right: ETFSide;
  title: string;               // H1
  metaTitle: string;
  metaDescription: string;
  /**
   * Dates ISO affichées publiquement par ArticleByline et émises en
   * datePublished / dateModified.
   *
   * ⚠️ CE SONT DES AFFIRMATIONS FACTUELLES, pas un levier de référencement.
   * Elles ont été relevées dans l'historique git, duel par duel : date du
   * commit qui a introduit le slug pour `publishedAt`, date du dernier commit
   * ayant réellement modifié CE bloc pour `updatedAt` — pas la date du dernier
   * commit touchant le fichier, qui les daterait toutes du même jour et serait
   * faux pour sept d'entre elles.
   *
   * Antidote au réflexe : quand on met une page à jour, on bouge `updatedAt`.
   * Quand on ne la met PAS à jour, on n'y touche pas. Une date de fraîcheur
   * mensongère est un chiffre inventé, et ce site n'en publie pas.
   * `node scripts/verifier-dates-comparatifs.mjs` compare ces valeurs à git.
   */
  publishedAt: string;
  updatedAt: string;
  verdict: string;              // 2-sentence verdict
  intro: string;                // 1-paragraph intro
  keyDifferences: { criterion: string; leftValue: string; rightValue: string }[];
  useCases: UseCase[];
  analysis: string;             // longer prose analysis
  faq: { q: string; a: string }[];
  tags: string[];               // e.g. ["PEA", "débutant"]
};

// ─── MSCI World vs S&P 500 ────────────────────────────────────────────────────

const MSCI_WORLD_VS_SP500: ETFComparison = {
  slug: "msci-world-vs-sp500",
  publishedAt: "2026-04-19",
  updatedAt: "2026-07-29",
  title: "MSCI World vs S&P 500 : quel indice pour votre DCA ?",
  metaTitle: "MSCI World ou S&P 500 : lequel pour un DCA en ETF ?",
  metaDescription:
    "MSCI World ou S&P 500 ? Comparaison détaillée : couverture, TER, PEA, performance historique, profil d'investisseur. Guide clair pour choisir en 2026.",

  left: {
    heading: "MSCI World",
    subheading: "Indice des marchés développés",
    type: "Indice",
    coverage: "~1 500 sociétés sur 23 pays développés",
    ter: "ETF à partir de 0,12 % (EWLD, WPEA)",
    peaEligible: "Oui",
    strongPoint: "Diversification mondiale automatique",
    weakPoint: "Pas d'exposition aux marchés émergents",
  },

  right: {
    heading: "S&P 500",
    subheading: "Indice des 500 plus grandes capitalisations américaines",
    type: "Indice",
    coverage: "500 plus grandes sociétés cotées aux États-Unis",
    ter: "ETF à partir de 0,07 % (CSPX, VUSA)",
    peaEligible: "Oui (via ETF synthétiques comme ESE)",
    strongPoint: "Frais plus bas · performance historique forte",
    weakPoint: "Concentration sur un seul pays",
  },

  verdict:
    "MSCI World pour la diversification mondiale automatique. S&P 500 pour la concentration US ciblée avec des frais plus bas. Attention : le MSCI World est déjà composé à ~70 % d'actions américaines — la différence réelle est souvent plus faible qu'on ne l'imagine.",

  intro:
    "MSCI World et S&P 500 sont les deux indices les plus utilisés pour un DCA en ETF. Ils sont souvent présentés comme opposés alors qu'ils se chevauchent largement : le MSCI World contient environ 70 % d'actions américaines, la quasi-totalité de la composition du S&P 500 s'y retrouve. Comprendre cette nuance est la clé du choix.",

  keyDifferences: [
    { criterion: "Nombre de sociétés", leftValue: "~1 500", rightValue: "500" },
    { criterion: "Couverture géographique", leftValue: "23 pays développés", rightValue: "États-Unis uniquement" },
    { criterion: "Poids des États-Unis", leftValue: "~70 %", rightValue: "100 %" },
    { criterion: "TER typique", leftValue: "0,12 à 0,40 %", rightValue: "0,07 à 0,20 %" },
    { criterion: "Éligibilité PEA", leftValue: "Oui (ex : CW8, WPEA)", rightValue: "Oui (via synthétique ESE)" },
    { criterion: "Performance 10 ans", leftValue: "~9-11 %/an brut", rightValue: "~11-13 %/an brut" },
    { criterion: "Volatilité", leftValue: "Légèrement inférieure (diversification)", rightValue: "Légèrement supérieure (concentration)" },
  ],

  useCases: [
    {
      profile: "Débutant voulant la simplicité maximale",
      winner: "left",
      explanation:
        "Un seul ETF MSCI World couvre l'exposition mondiale avec un bon équilibre. Pas besoin de se poser la question 'faut-il ajouter de l'Europe ou du Japon ?' — c'est déjà inclus.",
    },
    {
      profile: "Investisseur convaincu de la domination US long-terme",
      winner: "right",
      explanation:
        "Si vous pensez que les États-Unis continueront à surperformer, un S&P 500 seul est plus cohérent et moins cher. Les 70 % d'US dans le MSCI World sont déjà présents — choisir le S&P 500 pur est un pari assumé.",
    },
    {
      profile: "Budget très serré (sensibilité TER)",
      winner: "right",
      explanation:
        "Les ETF S&P 500 ont historiquement des TER plus bas (0,07 %–0,15 %) que les MSCI World (0,12 %–0,40 %). Sur 30 ans, 0,2 % de frais en moins peut représenter 5-7 % de capital final en plus.",
    },
    {
      profile: "Peur de la concentration géographique",
      winner: "left",
      explanation:
        "Le MSCI World reste très exposé aux US (~70 %), mais intègre aussi Japon, Royaume-Uni, France, Allemagne, Suisse, Canada, Australie. Ajouter un ETF émergents (AEEM) en complément est souvent la stratégie de diversification finale.",
    },
  ],

  analysis:
    "Sur la dernière décennie, le S&P 500 a surperformé le MSCI World d'environ 1-2 % par an en moyenne, principalement grâce à la performance exceptionnelle des grandes tech américaines (Apple, Microsoft, Nvidia, etc.). Cela ne garantit rien pour l'avenir — les décennies précédentes (années 1970-2000) ont parfois vu l'Europe et le Japon surperformer les États-Unis. Le MSCI World est un hedge naturel contre ce risque de rotation géographique : vous captez la surperformance US quand elle est là, sans être 100 % exposé si elle s'inverse. Pour la majorité des investisseurs DCA long-terme, un MSCI World simple suffit et libère du cerveau. Ceux qui ont une conviction forte ajoutent une surpondération (S&P 500, émergents, small caps) en complément.",

  faq: [
    {
      q: "Peut-on combiner MSCI World et S&P 500 dans son portefeuille ?",
      a: "Techniquement oui, mais l'utilité est limitée — le MSCI World contient déjà ~70 % de S&P 500. Ajouter un S&P 500 à côté d'un MSCI World revient à surpondérer les États-Unis, ce qui peut être une stratégie assumée (double-down sur les US) mais pas une vraie diversification. Mieux vaut choisir l'un ou l'autre, ou ajouter des marchés émergents si on veut diversifier.",
    },
    {
      q: "Quel est le meilleur ETF MSCI World éligible PEA ?",
      a: "CW8 (Amundi MSCI World) est le plus connu — TER 0,38 %, encours important, bonne liquidité. WPEA (iShares Core MSCI World) est plus récent avec un TER plus bas (0,20 %). EWLD (Amundi MSCI World UCITS II) propose également un TER compétitif. Le meilleur dépend de votre courtier — CW8 est disponible partout.",
    },
    {
      q: "Peut-on avoir un ETF S&P 500 dans un PEA ?",
      a: "Oui, via des ETF synthétiques qui répliquent le S&P 500 avec un swap. Les plus connus : ESE (Amundi S&P 500) à 0,15 % de TER, PE500 (BNP Paribas S&P 500) à 0,15 %. Les ETF S&P 500 physiques cotés en USD (CSPX, VUSA) ne sont pas éligibles PEA — ils sont pour CTO uniquement.",
    },
    {
      q: "Un seul ETF suffit-il vraiment pour toute une vie d'investissement ?",
      a: "Pour 90 % des investisseurs particuliers, oui. Un ETF MSCI World (ou un S&P 500) maintenu 20-30 ans dans un PEA bat statistiquement la grande majorité des portefeuilles diversifiés sur-optimisés. La complexité ajoute plus de risques d'erreurs que d'amélioration de performance.",
    },
  ],

  tags: ["PEA", "MSCI World", "S&P 500"],
};

// ─── CW8 vs ESE ───────────────────────────────────────────────────────────────

const CW8_VS_ESE: ETFComparison = {
  slug: "cw8-vs-ese",
  publishedAt: "2026-04-19",
  updatedAt: "2026-04-19",
  title: "CW8 vs ESE : quel ETF pour votre PEA ?",
  metaTitle: "CW8 ou ESE : comparatif des deux ETF PEA les plus populaires",
  metaDescription:
    "CW8 (Amundi MSCI World) ou ESE (Amundi S&P 500) ? Comparatif détaillé des deux ETF PEA les plus utilisés en France : TER, couverture, diversification, performance.",

  left: {
    heading: "CW8",
    subheading: "Amundi MSCI World UCITS ETF — ISIN LU1681043599",
    type: "ETF",
    coverage: "MSCI World — ~1 500 sociétés développées",
    issuer: "Amundi ETF",
    ter: "0,38 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Diversification mondiale dans un PEA",
    weakPoint: "TER élevé par rapport aux alternatives récentes",
  },

  right: {
    heading: "ESE",
    subheading: "BNP Paribas Easy S&P 500 UCITS ETF — ISIN FR0011550185",
    type: "ETF",
    coverage: "S&P 500 — 500 plus grandes capitalisations américaines",
    issuer: "BNP Paribas Easy",
    ter: "0,15 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "TER très bas · éligible PEA",
    weakPoint: "Exposition concentrée sur un seul pays",
  },

  verdict:
    "ESE est moins cher (TER 0,15 % vs 0,38 %) et concentré sur les États-Unis. CW8 est plus diversifié mondialement mais plus cher. Sur 20 ans, l'écart de TER représente environ 5-7 % de capital final. Les deux sont capitalisants et éligibles PEA.",

  intro:
    "CW8 et ESE sont les deux ETF PEA les plus utilisés par les investisseurs français. Tous deux édités par Amundi, tous deux capitalisants, tous deux synthétiques. La différence tient à ce qu'ils répliquent : le monde développé (CW8) ou uniquement les États-Unis (ESE). Leur niveau de TER diffère aussi significativement.",

  keyDifferences: [
    { criterion: "Indice sous-jacent", leftValue: "MSCI World", rightValue: "S&P 500" },
    { criterion: "TER", leftValue: "0,38 %/an", rightValue: "0,15 %/an" },
    { criterion: "Nombre de lignes", leftValue: "~1 500", rightValue: "500" },
    { criterion: "Couverture géographique", leftValue: "23 pays développés", rightValue: "États-Unis" },
    { criterion: "Éligibilité PEA", leftValue: "Oui", rightValue: "Oui" },
    { criterion: "Politique de revenus", leftValue: "Capitalisant", rightValue: "Capitalisant" },
    { criterion: "Réplication", leftValue: "Synthétique", rightValue: "Synthétique" },
    { criterion: "Impact TER sur 20 ans (200 €/mois, 7 %)", leftValue: `${coutFrais(0.38)} €`, rightValue: `${coutFrais(0.15)} €` },
  ],

  useCases: [
    {
      profile: "Vous voulez un seul ETF pour toute votre vie",
      winner: "left",
      explanation:
        "CW8 est la position unique la plus diversifiée disponible en PEA. Si vous cherchez la simplicité maximale et ne voulez plus toucher à votre portefeuille pendant 20-30 ans, c'est un choix solide malgré le TER supérieur.",
    },
    {
      profile: "Vous êtes sensible aux frais cumulés",
      winner: "right",
      explanation:
        `Sur 20 ans à 200 €/mois, 0,23 % de TER en moins représente environ ${ecartCapital(0.38, 0.15)} € de capital final en plus. Si vous êtes à l'aise avec la concentration US (~70 % du CW8 de toute façon), ESE peut être la meilleure option coûts/performance.`,
    },
    {
      profile: "Vous voulez combiner les deux",
      winner: "both",
      explanation:
        "Une approche courante : ESE comme cœur (70 %) + un ETF émergents ou Europe pour diversifier (30 %). Le mix doublé ESE + AEEM revient à un 'MSCI World + émergents' à moindre coût que CW8 seul. Demande en revanche de rééquilibrer manuellement.",
    },
    {
      profile: "Vous débutez et n'avez pas d'avis tranché",
      winner: "left",
      explanation:
        "Commencer avec CW8 est plus prudent : la diversification intrinsèque réduit le risque d'avoir fait 'le mauvais choix'. Vous pouvez toujours ajuster dans 2-3 ans si vous voulez. Le TER supplémentaire est le prix de la tranquillité d'esprit.",
    },
  ],

  analysis:
    "La question CW8 vs ESE se résume souvent à ça : êtes-vous OK avec l'hypothèse implicite du MSCI World (les US resteront dominants sans être absolument tout) ou voulez-vous parier clairement sur l'Amérique ? ESE est clairement un pari géographique. CW8 est un panier plus 'neutre'. Notons que de nouveaux ETF MSCI World sont apparus récemment avec des TER bien plus bas que CW8 — notamment WPEA (iShares Core MSCI World UCITS ETF, TER 0,20 %) qui est également éligible PEA. Si vous ouvrez votre PEA aujourd'hui, WPEA peut être une meilleure option que CW8 sur le plan des frais. CW8 reste pertinent pour les investisseurs déjà positionnés qui ne veulent pas disperser leur encours sur plusieurs lignes.",

  faq: [
    {
      q: "WPEA est-il meilleur que CW8 ?",
      a: "WPEA (iShares Core MSCI World PEA) a un TER de 0,20 % contre 0,38 % pour CW8, tout en répliquant le même indice. Si vous ouvrez votre position aujourd'hui, WPEA est probablement le meilleur choix pour un MSCI World en PEA. CW8 reste historiquement la référence et a plus d'encours, mais le TER est son point faible.",
    },
    {
      q: "Les ETF synthétiques sont-ils risqués ?",
      a: "La réplication synthétique utilise un swap avec une contrepartie bancaire (souvent la maison-mère de l'émetteur). Le risque de contrepartie est réel mais encadré par la réglementation UCITS, qui limite l'exposition à 10 % et impose du collatéral. En pratique, les ETF synthétiques majeurs (ESE, CW8) n'ont jamais causé de pertes aux porteurs depuis leur création. Ce n'est pas un risque qu'il faut sur-pondérer dans la décision.",
    },
    {
      q: "Peut-on transférer des parts de CW8 vers ESE dans un PEA ?",
      a: "Non, il faut vendre puis racheter — mais à l'intérieur du PEA, les plus-values sont capitalisées sans friction fiscale tant que vous ne retirez pas de l'argent du PEA. Vous pouvez donc basculer d'un ETF à l'autre sans impact fiscal immédiat. Les frais d'ordre s'appliquent en revanche à chaque transaction.",
    },
    {
      q: "Quelle est la différence entre capitalisant et distribuant ?",
      a: "Un ETF capitalisant (comme CW8 et ESE) réinvestit automatiquement les dividendes dans l'ETF. Un distribuant verse les dividendes en cash sur votre compte. En PEA, le capitalisant est généralement préféré : pas d'imposition annuelle sur les dividendes, et l'effet intérêts composés est optimal.",
    },
  ],

  tags: ["PEA", "CW8", "ESE", "Amundi"],
};

// ─── VWCE vs CW8 ──────────────────────────────────────────────────────────────

const VWCE_VS_CW8: ETFComparison = {
  slug: "vwce-vs-cw8",
  publishedAt: "2026-04-19",
  updatedAt: "2026-04-19",
  title: "VWCE vs CW8 : FTSE All-World ou MSCI World ?",
  metaTitle: "VWCE ou CW8 : quel ETF mondial choisir selon votre compte",
  metaDescription:
    "VWCE (Vanguard FTSE All-World) ou CW8 (Amundi MSCI World) ? Comparatif des deux ETF mondiaux : émergents inclus, PEA, TER, performance. Guide 2026.",

  left: {
    heading: "VWCE",
    subheading: "Vanguard FTSE All-World UCITS ETF — ISIN IE00BK5BQT80",
    type: "ETF",
    coverage: "FTSE All-World — ~3 700 sociétés (développés + émergents)",
    issuer: "Vanguard",
    ter: "0,22 %/an",
    replication: "Physique (échantillonnée)",
    distribution: "Capitalisant",
    currency: "USD",
    peaEligible: "Non",
    strongPoint: "Diversification maximale (émergents inclus) · émetteur Vanguard",
    weakPoint: "Non éligible PEA · libellé en USD",
  },

  right: {
    heading: "CW8",
    subheading: "Amundi MSCI World UCITS ETF — ISIN LU1681043599",
    type: "ETF",
    coverage: "MSCI World — ~1 500 sociétés développées uniquement",
    issuer: "Amundi",
    ter: "0,38 %/an",
    replication: "Synthétique",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Éligible PEA · bon véhicule fiscal en France",
    weakPoint: "Pas de marchés émergents · TER plus élevé",
  },

  verdict:
    "Si vous investissez via un PEA, CW8 est le choix par défaut — VWCE n'y est pas éligible. Sur un CTO, VWCE bat CW8 sur la diversification (émergents inclus) et le TER. En pratique, la plupart des investisseurs français optimisent le PEA avec CW8 (ou WPEA) en priorité, et utilisent VWCE sur un CTO en complément.",

  intro:
    "VWCE et CW8 sont tous deux des ETF 'monde' populaires, mais ils sont très différents : VWCE couvre marchés développés ET émergents (~3 700 sociétés), CW8 couvre uniquement les marchés développés (~1 500 sociétés). Et VWCE n'est pas éligible PEA. Le choix dépend donc avant tout de l'enveloppe fiscale.",

  keyDifferences: [
    { criterion: "Indice", leftValue: "FTSE All-World", rightValue: "MSCI World" },
    { criterion: "Marchés émergents", leftValue: "Oui (~10-12 %)", rightValue: "Non" },
    { criterion: "TER", leftValue: "0,22 %/an", rightValue: "0,38 %/an" },
    { criterion: "Éligibilité PEA", leftValue: "Non (CTO uniquement)", rightValue: "Oui" },
    { criterion: "Réplication", leftValue: "Physique échantillonnée", rightValue: "Synthétique" },
    { criterion: "Émetteur", leftValue: "Vanguard (réputation excellente)", rightValue: "Amundi" },
    { criterion: "Politique de revenus", leftValue: "Capitalisant", rightValue: "Capitalisant" },
    { criterion: "Devise", leftValue: "USD (couverture change non nécessaire)", rightValue: "EUR" },
  ],

  useCases: [
    {
      profile: "Vous débutez avec un PEA uniquement",
      winner: "right",
      explanation:
        "CW8 est votre seule option réaliste entre les deux — VWCE n'est pas éligible PEA. Vous perdez l'exposition émergents, mais vous gagnez le bénéfice fiscal du PEA (18,6 % vs 31,4 % à la sortie). Sur 20 ans, l'avantage fiscal surpasse largement l'avantage de diversification.",
    },
    {
      profile: "Vous investissez sur un CTO",
      winner: "left",
      explanation:
        "Sur un CTO, VWCE est généralement préférable : TER plus bas (0,22 % vs 0,38 %), diversification plus large (émergents inclus), et Vanguard a une réputation solide en tant qu'émetteur. Le fait qu'il soit en USD n'est pas un problème — le risque de change est plutôt un bénéfice diversifiant.",
    },
    {
      profile: "Vous combinez PEA + CTO",
      winner: "both",
      explanation:
        "Stratégie optimale : saturer le PEA avec CW8 ou WPEA (150 000 € de versements), puis ouvrir un CTO avec VWCE pour les versements supplémentaires. Vous bénéficiez de la fiscalité PEA tant que possible, et de la diversification émergents via VWCE au-delà.",
    },
    {
      profile: "Vous voulez la diversification maximale possible",
      winner: "left",
      explanation:
        "Parmi les ETF 'monde' largement disponibles, VWCE est le plus diversifié : ~3 700 sociétés, 49 pays, développés + émergents, en un seul ticker. Difficile de faire mieux sans empiler plusieurs ETF.",
    },
  ],

  analysis:
    "Le vrai débat VWCE vs CW8 n'existe que si vous avez un CTO ouvert ou si vous saturez votre PEA. Pour la majorité des investisseurs français en phase d'accumulation, le PEA est prioritaire (fiscalité bien meilleure après 5 ans), donc CW8 ou WPEA gagnent par défaut. La question devient intéressante quand on dépasse le plafond PEA (150 000 € de versements — atteint en 62 ans à 200 €/mois, mais en 12 ans à 1 000 €/mois). Si vous pensez dépasser ce plafond dans votre horizon d'investissement, VWCE est une excellente option pour prolonger sur CTO. À noter : l'exposition émergents (~10 % du VWCE) ajoute un petit gain de diversification mais aussi de volatilité — les marchés émergents ont historiquement sous-performé les développés sur les 10 dernières années.",

  faq: [
    {
      q: "VWCE est-il vraiment plus diversifié que CW8 ?",
      a: "Oui — le FTSE All-World couvre environ 3 700 sociétés sur 49 pays, contre environ 1 500 sur 23 pays pour le MSCI World. La différence vient principalement des marchés émergents (~10-12 % du VWCE) : Chine, Inde, Taïwan, Corée du Sud, Brésil, etc. Ces pays ne sont pas inclus dans le MSCI World.",
    },
    {
      q: "Pourquoi VWCE n'est-il pas éligible PEA ?",
      a: "L'éligibilité PEA nécessite soit que l'ETF soit domicilié en Europe ET ait 75 % d'actifs européens, soit qu'il soit synthétique (swap avec une contrepartie qui apporte la performance d'un indice non-européen). VWCE est physique et investit réellement dans des actions majoritairement non-européennes (notamment US), donc ne remplit pas le critère. CW8 contourne ce problème avec un swap synthétique.",
    },
    {
      q: "Faut-il avoir peur du risque de change avec VWCE ?",
      a: "VWCE est libellé en USD mais peut se négocier en EUR selon la bourse. Le risque de change existe à court terme mais il est neutre sur le long terme : les devises fluctuent autour de leur juste valeur. Sur 20 ans, l'effet moyen du change est proche de zéro, et vous êtes déjà exposé au dollar via les entreprises américaines dans le MSCI World. Ne pas s'en soucier pour un DCA long-terme.",
    },
    {
      q: "Peut-on acheter VWCE chez Trade Republic / Boursorama / Fortuneo ?",
      a: "Oui, VWCE est disponible chez la quasi-totalité des courtiers européens. Chez Trade Republic, il est dans le catalogue d'épargne programmée gratuite (0 € de frais par versement). Chez Boursorama et Fortuneo, frais d'ordre standards s'appliquent.",
    },
  ],

  tags: ["CTO", "VWCE", "CW8", "Vanguard"],
};

// ─── CW8 vs WPEA ──────────────────────────────────────────────────────────────
// Requête GSC captée : 15 impressions/mois, 0 clic. Capter ce trafic latent.
// WPEA = iShares Core MSCI World UCITS ETF (PEA), arrivé fin 2024 — alternative
// récente au CW8 historique d'Amundi, avec un TER deux fois plus bas.

const CW8_VS_WPEA: ETFComparison = {
  slug: "cw8-vs-wpea",
  publishedAt: "2026-05-25",
  updatedAt: "2026-07-29",
  title: "CW8 vs WPEA : quel ETF MSCI World pour votre PEA ?",
  // Le titre portait « (vs DCAM) » pour couvrir la SERP 3-way (audit 07/2026).
  // Retiré : le CTR mesuré était de 0,5 %, DCAM a sa propre page, et la
  // parenthèse diluait le match principal — qui est aussi la requête la plus
  // volumineuse du site. L'intent DCAM reste couvert par la meta, qui n'a pas
  // la même contrainte de longueur.
  // « sauf dans deux cas précis » n'est pas une accroche : la page contient
  // exactement deux profils où CW8 l'emporte (encours CW8 existant, recherche
  // de simplicité). Si un troisième est ajouté, corriger ce titre.
  metaTitle: "CW8 vs WPEA : WPEA gagne, sauf dans deux cas précis",
  metaDescription:
    `WPEA à 0,20 % bat CW8 à 0,38 % : ~${ecartCapital(0.38, 0.2)} € d'écart sur 20 ans à 200 €/mois. Les deux cas où garder CW8, et où se place DCAM.`,

  left: {
    heading: "CW8",
    subheading: "Amundi MSCI World UCITS ETF — ISIN LU1681043599",
    type: "ETF",
    coverage: "MSCI World — ~1 500 sociétés des 23 pays développés",
    issuer: "Amundi ETF",
    ter: "0,38 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Référence historique du MSCI World en PEA · gros encours · liquidité maximale",
    weakPoint: "TER élevé (0,38 %) — le plus cher des ETF MSCI World PEA en 2026",
  },

  right: {
    heading: "WPEA",
    subheading: "iShares Core MSCI World UCITS ETF (PEA) — ISIN IE0006WW1TQ4",
    type: "ETF",
    coverage: "MSCI World — ~1 500 sociétés des 23 pays développés",
    issuer: "iShares (BlackRock)",
    ter: "0,20 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "TER deux fois inférieur au CW8 · iShares = leader mondial ETF",
    weakPoint: "ETF récent (lancé fin 2024) — encours et liquidité encore inférieurs au CW8",
  },

  verdict:
    `WPEA gagne sur les frais (0,20 % vs 0,38 %) pour la même exposition MSCI World et la même éligibilité PEA. Sur 20 ans à 200 €/mois et 7 %/an net, ces 0,18 % de TER en moins représentent environ ${ecartCapital(0.38, 0.2)} € de capital final supplémentaire. CW8 garde l'avantage de l'antériorité (gros encours, liquidité, présence chez tous les courtiers). Pour une ouverture de position en 2026, WPEA est probablement le meilleur choix.`,

  intro:
    "Pendant des années, CW8 (Amundi MSCI World) a été l'ETF de référence pour s'exposer au monde développé dans un PEA français. Fin 2024, iShares a sorti WPEA — un MSCI World PEA-éligible à un TER deux fois plus bas. Deux ETF qui répliquent le même indice, avec des frais qui changent significativement la performance à long terme. Voici comment trancher.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "MSCI World", rightValue: "MSCI World (identique)" },
    { criterion: "Émetteur", leftValue: "Amundi", rightValue: "iShares (BlackRock)" },
    { criterion: "TER", leftValue: "0,38 %/an", rightValue: "0,20 %/an" },
    { criterion: "Encours (AUM)", leftValue: "Plusieurs Md€ — large", rightValue: "Encours en croissance — ETF récent" },
    { criterion: "Liquidité", leftValue: "Très élevée — spreads faibles", rightValue: "Bonne mais inférieure au CW8" },
    { criterion: "Éligibilité PEA", leftValue: "Oui", rightValue: "Oui" },
    { criterion: "Réplication", leftValue: "Synthétique", rightValue: "Synthétique" },
    { criterion: "Distribution", leftValue: "Capitalisant", rightValue: "Capitalisant" },
    { criterion: "Impact TER sur 20 ans (200 €/mois, 7 %)", leftValue: `${coutFrais(0.38)} €`, rightValue: `${coutFrais(0.2)} €` },
  ],

  useCases: [
    {
      profile: "Vous ouvrez votre PEA en 2026",
      winner: "right",
      explanation:
        "WPEA est probablement le meilleur choix : même indice, moitié des frais. Sur un horizon 20-30 ans, l'écart de TER se traduit directement en capital final. L'argument 'CW8 a plus de liquidité' compte peu pour un investisseur DCA long terme qui passe des ordres mensuels de quelques centaines d'euros.",
    },
    {
      profile: "Vous avez déjà du CW8 dans votre PEA",
      winner: "left",
      explanation:
        "Inutile de tout basculer dans la précipitation. Vous pouvez arrêter d'alimenter CW8 et orienter vos versements suivants vers WPEA — votre encours CW8 historique continue de capitaliser. Bascule complète seulement si vous avez peu de plus-values latentes (les frais d'ordre pour vendre + racheter peuvent dépasser l'économie de TER sur petits montants).",
    },
    {
      profile: "Vous valorisez la simplicité maximale",
      winner: "left",
      explanation:
        "CW8 reste l'ETF qui se trouve partout, recommandé partout, sans surprise. Si vous voulez zéro friction (disponibilité chez tous les courtiers, ETF que vos proches reconnaissent), CW8 fonctionne. C'est un compromis confort/coût.",
    },
    {
      profile: "Vous êtes pure performance",
      winner: "right",
      explanation:
        "TER plus bas + même indice = surperformance mécanique sur le long terme. iShares est aussi un émetteur de référence (filiale de BlackRock, premier gestionnaire d'actifs mondial). Aucune raison rationnelle de payer 90 % de frais en plus pour exactement la même exposition.",
    },
  ],

  analysis:
    "L'arrivée de WPEA en 2024 a cassé un quasi-monopole : pendant des années, CW8 était LA solution MSCI World pour PEA, sans alternative crédible à frais bas. iShares a comblé ce vide en proposant exactement le même indice, à un TER moitié moins cher, via un swap synthétique conforme à l'éligibilité PEA. Pour qui démarre aujourd'hui, le calcul est net : 0,18 % de TER en moins par an, ça représente environ 4 % de capital final en plus sur 20 ans (à hypothèses constantes 7 %/an). Pour qui a déjà construit une position CW8 significative, la question est plus nuancée : vendre génère des frais d'ordre + casse l'historique de la ligne — pas critique en PEA (zéro friction fiscale tant qu'on ne retire pas) mais demande un calcul cas par cas. La règle de pouce : si votre encours CW8 est < 10 000 €, basculer reste avantageux long terme. Au-delà, garder CW8 et alimenter WPEA pour les versements futurs.",

  faq: [
    {
      q: "WPEA est-il vraiment équivalent à CW8 ?",
      a: "Oui, sur l'exposition : même indice MSCI World, même couverture (1 500 sociétés, 23 pays développés), même politique capitalisante, même éligibilité PEA via réplication synthétique. La seule vraie différence est le TER (0,20 % vs 0,38 %) et l'émetteur (iShares vs Amundi). En termes de risque sous-jacent, ils sont substituables.",
    },
    {
      q: "Pourquoi WPEA est-il moins cher que CW8 ?",
      a: "iShares (BlackRock) est le plus gros gestionnaire d'ETF au monde et bénéficie d'économies d'échelle massives. Le marché ETF français étant longtemps verrouillé par Amundi sur le segment PEA, l'arrivée d'iShares en 2024 a dû s'accompagner d'un prix agressif pour gagner des parts. Avantage pour les investisseurs particuliers.",
    },
    {
      q: "WPEA est-il disponible chez tous les courtiers ?",
      a: "WPEA est disponible chez la plupart des courtiers français modernes (Trade Republic, Bourse Direct, Boursorama, Fortuneo). À vérifier chez votre courtier avant d'ouvrir la position — certaines banques traditionnelles tardent à référencer les ETF récents. Si non disponible, demandez-le au service client : la pression utilisateur fait souvent débloquer.",
    },
    {
      q: "Le risque de contrepartie est-il identique entre CW8 et WPEA ?",
      a: "Les deux utilisent une réplication synthétique par swap. Le risque de contrepartie est encadré par la réglementation UCITS (limite à 10 % de l'actif net) et collatéralisé. En pratique, ni Amundi ni iShares n'ont causé de pertes de ce type à leurs porteurs. Le risque est équivalent et négligeable pour un investisseur particulier.",
    },
    {
      q: "Vaut-il le coup de vendre mon CW8 pour racheter du WPEA ?",
      a: "Cela dépend de votre encours et de votre horizon. Sous 10 000 € d'encours CW8 + horizon 15+ ans : oui, l'économie de TER cumulée justifie la bascule (en PEA, la vente n'a aucun coût fiscal). Au-dessus de 10 000 € ou horizon < 10 ans : pas urgent, vous pouvez simplement orienter vos versements futurs vers WPEA et laisser CW8 capitaliser de son côté.",
    },
    {
      q: "Et DCAM dans tout ça ? Faut-il le préférer à WPEA ?",
      a: "DCAM (Amundi PEA MSCI World ESG) joue dans la même catégorie que WPEA : TER 0,20 %, réplication synthétique, éligible PEA. Deux différences pratiques : DCAM suit une variante ESG de l'indice (filtrage extra-financier, performance historiquement très proche) et son prix de part (~5 €) est bien plus adapté aux petits DCA mensuels que celui de WPEA. Notre comparatif détaillé WPEA vs DCAM tranche selon votre montant mensuel et votre courtier. Face à CW8, les deux gagnent sur les frais.",
    },
  ],

  tags: ["PEA", "CW8", "WPEA", "DCAM", "MSCI World", "iShares", "Amundi"],
};

// ─── Registry ─────────────────────────────────────────────────────────────────

// ─── WPEA vs DCAM ─────────────────────────────────────────────────────────────

const WPEA_VS_DCAM: ETFComparison = {
  slug: "wpea-vs-dcam",
  publishedAt: "2026-06-10",
  updatedAt: "2026-07-29",
  title: "WPEA vs DCAM : quel MSCI World à 0,20 % pour votre PEA ?",
  // Les deux formulations « vs » et « ou » sont recherchées : « ou » dans le
  // titre, « vs » conservé dans le H1 de la page (champ `title` ci-dessus).
  metaTitle: "WPEA ou DCAM : égalité technique, un détail décide",
  metaDescription:
    "Même indice, même TER de 0,20 %, même réplication : le match se joue sur le prix de part. DCAM à ~5 € pour un DCA mensuel, WPEA pour les gros montants.",

  left: {
    heading: "WPEA",
    subheading: "iShares Core MSCI World UCITS ETF (PEA) — ISIN IE0006WW1TQ4",
    type: "ETF",
    coverage: "MSCI World — ~1 500 sociétés des 23 pays développés",
    issuer: "iShares (BlackRock)",
    ter: "0,20 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Le premier à avoir cassé le monopole d'Amundi (2024) · iShares = n°1 mondial de l'ETF",
    weakPoint: "Prix de part plus élevé que DCAM — moins souple pour les petits versements mensuels",
  },

  right: {
    heading: "DCAM",
    subheading: "Amundi PEA Monde (MSCI World) UCITS ETF — ISIN FR001400U5Q4",
    type: "ETF",
    coverage: "MSCI World — ~1 500 sociétés des 23 pays développés",
    issuer: "Amundi",
    ter: "0,20 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Prix de part ~5 € — le plus pratique pour un DCA de petits montants · croissance d'encours très rapide (≈ 1 Md€ en un an)",
    weakPoint: "Le plus récent du marché (mars 2025) — historique de réplication encore court",
  },

  verdict:
    "Égalité technique : même indice MSCI World, même TER de 0,20 %, même réplication synthétique, même éligibilité PEA. La performance sera quasi identique. Le départage se fait sur deux critères pratiques : le prix de part (~5 € pour DCAM contre quelques centaines d'euros pour WPEA — décisif si vous investissez 50-150 €/mois sans fractionné) et la disponibilité chez votre courtier. À montants élevés, prenez celui que votre courtier traite le mieux.",

  intro:
    "C'est le match le plus récent du PEA : iShares a lancé WPEA en avril 2024 pour casser le quasi-monopole d'Amundi sur le MSCI World PEA, et Amundi a répliqué en mars 2025 avec DCAM — même indice, même 0,20 %. Pour l'investisseur, c'est une excellente nouvelle : la guerre des frais a divisé le coût par deux par rapport au CW8 historique (0,38 %). Reste à choisir entre deux jumeaux.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "MSCI World", rightValue: "MSCI World (identique)" },
    { criterion: "TER", leftValue: "0,20 %/an", rightValue: "0,20 %/an (identique)" },
    { criterion: "Émetteur", leftValue: "iShares (BlackRock)", rightValue: "Amundi (Crédit Agricole)" },
    { criterion: "Lancement", leftValue: "Avril 2024", rightValue: "Mars 2025" },
    { criterion: "Prix de part indicatif", leftValue: "Élevé (centaines d'€)", rightValue: "~5 € — pensé pour le DCA" },
    { criterion: "Encours", leftValue: "En forte croissance", rightValue: "≈ 1 Md€ en moins d'un an" },
    { criterion: "Réplication", leftValue: "Synthétique", rightValue: "Synthétique" },
    { criterion: "Éligibilité PEA", leftValue: "Oui", rightValue: "Oui" },
  ],

  useCases: [
    {
      profile: "DCA de petits montants (50-200 €/mois) sans fractionné",
      winner: "right",
      explanation:
        "Avec une part à ~5 €, DCAM permet d'investir la quasi-totalité de votre versement chaque mois, sans laisser de liquidités dormantes. Avec une part chère, une partie de votre versement attend le mois suivant.",
    },
    {
      profile: "Courtier avec achat fractionné (Trade Republic…)",
      winner: "both",
      explanation:
        "Si votre courtier permet d'acheter des fractions de part, le prix de part ne compte plus. Choisissez celui qui est disponible avec les frais d'ordre les plus bas chez votre courtier.",
    },
    {
      profile: "Préférence pour la diversification des émetteurs",
      winner: "left",
      explanation:
        "Si votre portefeuille est déjà très exposé à Amundi (CW8, PSP5, PUST…), prendre l'émetteur concurrent répartit le risque opérationnel — un argument de confort plus que de performance.",
    },
    {
      profile: "Investisseur qui veut le maximum d'antériorité",
      winner: "left",
      explanation:
        "WPEA a un an de plus de track record de réplication. C'est court dans les deux cas, mais si l'historique vous rassure, WPEA a l'avantage — en sachant que les deux émetteurs sont des géants éprouvés.",
    },
  ],

  analysis:
    "Ce duel illustre la meilleure dynamique possible pour les épargnants : la concurrence par les frais. Pendant des années, le CW8 d'Amundi (0,38 %) était l'option par défaut faute d'alternative. L'arrivée de WPEA à 0,20 % a forcé Amundi à répondre avec DCAM au même tarif — et un prix de part délibérément bas, calibré pour le DCA mensuel des particuliers. Sur la performance, n'attendez aucune différence significative : même indice, même mécanisme de swap encadré par UCITS, même TER. Les écarts de tracking se joueront au centième de pourcent. La vraie décision est logistique : prix de part, disponibilité et frais d'ordre chez VOTRE courtier. C'est aussi un rappel utile : si vous détenez du CW8 acheté avant 2024, il n'y a pas urgence à vendre (pas de friction fiscale en PEA, mais pas de raison de payer 0,38 % sur vos NOUVEAUX versements non plus — basculez simplement vos achats futurs vers WPEA ou DCAM).",

  faq: [
    {
      q: "WPEA et DCAM ont-ils exactement la même performance ?",
      a: "En théorie oui : même indice MSCI World, même TER de 0,20 %, même réplication synthétique. En pratique, de micro-écarts de tracking (qualité du swap, frais de rééquilibrage) peuvent apparaître, de l'ordre du centième de pourcent par an. Aucun des deux n'a d'avantage structurel sur l'autre.",
    },
    {
      q: "Je détiens déjà du CW8 : dois-je vendre pour acheter WPEA ou DCAM ?",
      a: "Pas nécessairement. Dans un PEA, vendre du CW8 pour racheter du WPEA/DCAM n'a pas de coût fiscal, mais génère des frais d'ordre. La stratégie la plus simple : conserver le CW8 existant et diriger vos nouveaux versements vers WPEA ou DCAM (0,20 % au lieu de 0,38 %). À gros encours, un arbitrage complet peut se justifier — faites le calcul frais d'ordre vs économie de TER.",
    },
    {
      q: "Pourquoi le prix de part de DCAM est-il si bas (~5 €) ?",
      a: "C'est un choix délibéré d'Amundi pour cibler le DCA des particuliers : avec une part à 5 €, un versement de 100 €/mois s'investit presque intégralement chaque mois, sans liquidités dormantes. Le prix de part n'a aucun impact sur la performance — c'est uniquement une question de granularité d'achat.",
    },
    {
      q: "Les deux sont-ils éligibles au PEA chez tous les courtiers ?",
      a: "Les deux sont juridiquement éligibles au PEA (réplication synthétique conforme). En pratique, la disponibilité dépend du catalogue de votre courtier — DCAM et WPEA sont désormais référencés chez les principaux courtiers français (Boursorama, Fortuneo, Bourse Direct…). Vérifiez les frais d'ordre, qui peuvent différer d'un ETF à l'autre.",
    },
  ],

  tags: ["PEA", "MSCI World", "frais"],
};

// ─── IWDA vs CW8 ──────────────────────────────────────────────────────────────

const IWDA_VS_CW8: ETFComparison = {
  slug: "iwda-vs-cw8",
  publishedAt: "2026-06-10",
  updatedAt: "2026-06-10",
  title: "IWDA vs CW8 : physique en CTO ou synthétique en PEA ?",
  metaTitle: "IWDA ou CW8 : CTO ou PEA pour votre MSCI World ?",
  metaDescription:
    `IWDA (physique, CTO) ou CW8 (synthétique, PEA) ? Même indice MSCI World, mais l'enveloppe change tout : ~${ecartFiscalEnviron(54000)} € d'impôt en moins en PEA sur 20 ans à 200 €/mois. Le vrai match est fiscal — comparatif complet.`,

  left: {
    heading: "IWDA",
    subheading: "iShares Core MSCI World UCITS ETF (Acc) — ISIN IE00B4L5Y983",
    type: "ETF",
    coverage: "MSCI World — ~1 500 sociétés des 23 pays développés",
    issuer: "iShares (BlackRock)",
    ter: "0,20 %/an",
    replication: "Physique optimisée",
    distribution: "Capitalisant",
    currency: "USD (cotation EUR sur Euronext Amsterdam)",
    peaEligible: "Non — CTO ou assurance-vie uniquement",
    strongPoint: "Réplication physique (détient réellement les actions) · l'un des plus gros ETF d'Europe · TER 0,20 %",
    weakPoint: "Non éligible PEA → fiscalité CTO (PFU 31,4 %) sur les gains",
  },

  right: {
    heading: "CW8",
    subheading: "Amundi MSCI World UCITS ETF — ISIN LU1681043599",
    type: "ETF",
    coverage: "MSCI World — ~1 500 sociétés des 23 pays développés",
    issuer: "Amundi",
    ter: "0,38 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Éligible PEA → 18,6 % de prélèvements après 5 ans au lieu de 31,4 %",
    weakPoint: "TER le plus élevé des MSCI World (0,38 %) — préférez WPEA/DCAM à 0,20 % pour de nouveaux achats en PEA",
  },

  verdict:
    `Le match n'est pas « physique vs synthétique » mais « PEA vs CTO » — et le PEA gagne presque toujours. Sur 20 ans à 200 €/mois (≈ ${capitalPour(0)} € avant frais, dont ≈ ${gainsPour(0)} € de gains), la fiscalité PEA (18,6 %) économise environ ${ecartFiscalEnviron(54000)} € d'impôt par rapport au CTO (PFU 31,4 %). Cet écart écrase largement les 0,18 % de TER d'avantage d'IWDA. Si votre PEA n'est pas plein : MSCI World en PEA (et plutôt WPEA ou DCAM à 0,20 % que CW8 pour de nouveaux achats). IWDA se justifie en CTO une fois le PEA plafonné, ou si la réplication physique est une exigence personnelle.`,

  intro:
    "IWDA est la référence européenne du MSCI World : réplication physique, encours massif, TER de 0,20 %. CW8 est la référence française en PEA. Beaucoup de débutants comparent leurs TER et concluent qu'IWDA est « meilleur » — en oubliant que l'enveloppe fiscale pèse dix fois plus lourd que les frais dans le résultat final. Voici le vrai calcul.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "MSCI World", rightValue: "MSCI World (identique)" },
    { criterion: "Réplication", leftValue: "Physique optimisée", rightValue: "Synthétique (swap)" },
    { criterion: "TER", leftValue: "0,20 %/an", rightValue: "0,38 %/an" },
    { criterion: "Éligibilité PEA", leftValue: "Non", rightValue: "Oui" },
    { criterion: "Fiscalité des gains (après 5 ans)", leftValue: "PFU 31,4 % (CTO)", rightValue: "18,6 % (PEA)" },
    { criterion: "Impact fiscal — 20 ans à 200 €/mois", leftValue: `≈ ${impotCTOEnviron(54000)} € de prélèvements`, rightValue: `≈ ${impotPEAEnviron(54000)} € de prélèvements` },
    { criterion: "Encours", leftValue: "Énorme — l'un des plus gros d'Europe", rightValue: "Très important (~5-6 Md€)" },
    { criterion: "Risque de contrepartie", leftValue: "Aucun (détention directe)", rightValue: "Encadré à 10 % max (UCITS)" },
  ],

  useCases: [
    {
      profile: "PEA non plafonné (moins de 150 000 € de versements)",
      winner: "right",
      explanation:
        "L'avantage fiscal du PEA (18,6 % vs 31,4 % sur les gains) écrase l'écart de TER. Et pour de NOUVEAUX achats en PEA, WPEA ou DCAM (0,20 %) font encore mieux que CW8 — même enveloppe, frais divisés par deux.",
    },
    {
      profile: "PEA plafonné, on continue d'investir",
      winner: "left",
      explanation:
        "Une fois les 150 000 € de versements PEA atteints, le CTO devient la suite logique — et IWDA y est le choix de référence : physique, énorme encours, 0,20 %.",
    },
    {
      profile: "Exigence de réplication physique",
      winner: "left",
      explanation:
        "Si le mécanisme de swap vous dérange par principe, IWDA détient réellement les ~1 500 actions de l'indice. C'est un confort psychologique légitime — mais il se paie 13 points de fiscalité en sortant du PEA.",
    },
    {
      profile: "Expatriation prévue / situation fiscale non française",
      winner: "left",
      explanation:
        "Le PEA est un dispositif fiscal français. Si vous prévoyez de quitter la France à moyen terme, l'avantage PEA s'érode et la portabilité d'un CTO avec IWDA peut être préférable. Cas particulier — à valider avec un conseiller.",
    },
  ],

  analysis:
    `La comparaison IWDA vs CW8 est l'exemple type d'une optimisation au mauvais étage. L'écart de TER (0,18 %) représente environ ${ecartCapital(0.38, 0.2)} € sur 20 ans à 200 €/mois. L'écart d'enveloppe fiscale (18,6 % vs 31,4 % sur ~54 000 € de gains) en représente environ ${ecartFiscalEnviron(54000)} € — et il s'applique APRÈS l'effet des frais. Autrement dit : même le pire ETF MSCI World du PEA bat IWDA en CTO pour un résident fiscal français qui n'a pas plafonné son PEA. La hiérarchie de décision correcte : 1) l'enveloppe (PEA d'abord), 2) les frais à l'intérieur de l'enveloppe (WPEA/DCAM 0,20 % plutôt que CW8 0,38 % pour de nouveaux achats), 3) la réplication, qui est un critère de confort. Le swap des ETF synthétiques est encadré par UCITS (exposition de contrepartie limitée à 10 %, collatéralisée en pratique quotidiennement) — un risque réel mais faible, sans commune mesure avec 13 points de fiscalité.`,

  faq: [
    {
      q: "IWDA peut-il être logé dans un PEA ?",
      a: "Non. IWDA est en réplication physique : il détient majoritairement des actions non européennes (~70 % US), ce qui le rend incompatible avec les règles du PEA. Seuls les ETF World à réplication synthétique (CW8, WPEA, DCAM, EWLD…) sont éligibles PEA.",
    },
    {
      q: "Le TER plus bas d'IWDA ne compense-t-il jamais la fiscalité ?",
      a: `Sur les hypothèses classiques (20 ans, 200 €/mois, 7 %/an), non : l'économie de TER (~${ecartCapital(0.38, 0.2)} €) reste inférieure au surcoût fiscal du CTO (~${ecartFiscalEnviron(54000)} €). Et ce raisonnement compare IWDA au CW8 (0,38 %) — face à WPEA ou DCAM (0,20 % en PEA), IWDA n'a plus aucun avantage de frais, il ne reste que le débat physique vs synthétique.`,
    },
    {
      q: "La réplication synthétique est-elle dangereuse ?",
      a: "Le swap introduit un risque de contrepartie, mais la réglementation UCITS le limite à 10 % de l'actif et les émetteurs le collatéralisent en pratique quotidiennement. En 20 ans d'ETF synthétiques européens, ce risque ne s'est jamais matérialisé en perte pour les porteurs. Il est raisonnable de le considérer comme faible — sans le nier.",
    },
    {
      q: "Et en assurance-vie ?",
      a: "IWDA (ou des fonds World équivalents) est disponible dans certaines assurances-vie en unités de compte. La fiscalité de l'AV après 8 ans (abattement annuel + taux réduit) peut s'approcher de celle du PEA, mais les frais d'UC (0,5-1 %/an de frais de gestion du contrat) dégradent souvent le bilan. Le PEA reste l'enveloppe la plus efficace pour un DCA actions long terme.",
    },
  ],

  tags: ["PEA", "CTO", "MSCI World", "réplication"],
};

// ─── ESE vs PSP5 ──────────────────────────────────────────────────────────────

const ESE_VS_PSP5: ETFComparison = {
  slug: "ese-vs-psp5",
  publishedAt: "2026-06-10",
  updatedAt: "2026-06-10",
  title: "ESE vs PSP5 : quel ETF S&P 500 pour votre PEA ?",
  metaTitle: "ESE ou PSP5 : quel ETF S&P 500 choisir en PEA en 2026 ?",
  metaDescription:
    `PSP5 (Amundi) est le moins cher (0,12 %), ESE (BNP Paribas) le plus liquide (0,15 %). Écart réel : ~${ecartCapital(0.15, 0.12)} € sur 20 ans à 200 €/mois — vos frais d'ordre comptent plus. Comparatif des deux S&P 500 éligibles PEA.`,

  left: {
    heading: "ESE",
    subheading: "BNP Paribas Easy S&P 500 UCITS ETF — ISIN FR0011550185",
    type: "ETF",
    coverage: "S&P 500 — les 500 plus grandes sociétés cotées américaines",
    issuer: "BNP Paribas Asset Management",
    ter: "0,15 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Le S&P 500 PEA le plus répandu et le plus liquide · part ~30 € adaptée au DCA",
    weakPoint: "TER légèrement supérieur à PSP5 (0,15 % vs 0,12 %)",
  },

  right: {
    heading: "PSP5",
    subheading: "Amundi PEA S&P 500 UCITS ETF — ISIN FR0013412285",
    type: "ETF",
    coverage: "S&P 500 — les 500 plus grandes sociétés cotées américaines",
    issuer: "Amundi",
    ter: "0,12 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "Le TER le plus bas du S&P 500 en PEA (0,12 %)",
    weakPoint: "Liquidité et disponibilité courtier légèrement inférieures à ESE",
  },

  verdict:
    `PSP5 gagne sur le papier (0,12 % vs 0,15 %) mais l'écart réel est minime : environ ${ecartCapital(0.15, 0.12)} € sur 20 ans à 200 €/mois. À ce niveau, vos frais d'ordre et la disponibilité chez votre courtier pèsent plus lourd que le TER. Règle simple : si votre courtier propose les deux aux mêmes conditions, prenez PSP5 ; sinon, prenez celui qui vous coûte le moins en frais de transaction — probablement ESE, le plus répandu.`,

  intro:
    "Pour s'exposer au S&P 500 dans un PEA, deux ETF synthétiques dominent : ESE (BNP Paribas), la référence historique, et PSP5 (Amundi), l'option la moins chère. Contrairement au match CW8 vs WPEA où l'écart de frais était massif (×2), ici les deux sont déjà très bon marché — le choix se joue sur des détails.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "S&P 500", rightValue: "S&P 500 (identique)" },
    { criterion: "TER", leftValue: "0,15 %/an", rightValue: "0,12 %/an" },
    { criterion: "Émetteur", leftValue: "BNP Paribas AM", rightValue: "Amundi" },
    { criterion: "Impact TER — 20 ans à 200 €/mois", leftValue: "Référence", rightValue: `≈ +${ecartCapital(0.15, 0.12)} € de capital final` },
    { criterion: "Liquidité / spread", leftValue: "Très bonne — le plus traité", rightValue: "Bonne" },
    { criterion: "Prix de part indicatif", leftValue: "~30 €", rightValue: "~30 €" },
    { criterion: "Réplication", leftValue: "Synthétique", rightValue: "Synthétique" },
    { criterion: "Éligibilité PEA", leftValue: "Oui", rightValue: "Oui" },
  ],

  useCases: [
    {
      profile: "Optimisation maximale des frais",
      winner: "right",
      explanation:
        "PSP5 à 0,12 % est le S&P 500 le moins cher du PEA. Si votre courtier le référence aux mêmes frais d'ordre qu'ESE, il n'y a pas de raison de payer 0,03 % de plus.",
    },
    {
      profile: "Courtier au catalogue limité",
      winner: "left",
      explanation:
        "ESE est référencé quasi partout avec de bons volumes. Si PSP5 n'est pas disponible (ou avec des frais d'ordre supérieurs) chez votre courtier, l'écart de TER ne justifie pas de changer de courtier.",
    },
    {
      profile: "Gros ordres ponctuels (lump sum)",
      winner: "left",
      explanation:
        "Sur un ordre important, le spread (écart achat/vente) compte : la liquidité supérieure d'ESE peut faire gagner plus que les 0,03 % de TER annuels de PSP5.",
    },
    {
      profile: "DCA mensuel automatisé",
      winner: "both",
      explanation:
        "Sur de petits ordres réguliers, le spread est négligeable et les deux conviennent parfaitement. Prenez le moins cher en frais d'ordre chez votre courtier, et n'y pensez plus.",
    },
  ],

  analysis:
    `Ce match illustre la notion de seuil de pertinence des frais. Passer de 0,38 % à 0,20 % (CW8 → WPEA) économise ~${ecartCapital(0.38, 0.2)} € sur 20 ans : ça vaut une décision. Passer de 0,15 % à 0,12 % en économise ~${ecartCapital(0.15, 0.12)} € : c'est réel, mais du même ordre de grandeur que quelques années de frais d'ordre, un spread défavorable répété, ou un mois de retard à investir. Autrement dit : choisissez vite, investissez tôt — l'erreur coûteuse serait de passer trois mois à hésiter entre deux excellents ETF. Rappel utile : le S&P 500 en PEA passe par la réplication synthétique (les actions américaines ne sont pas éligibles en direct), mécanisme encadré par UCITS. Et si vous hésitez encore entre S&P 500 et MSCI World, c'est une décision plus structurante que ESE vs PSP5 — le World contient déjà ~70 % de S&P 500.`,

  faq: [
    {
      q: "ESE ou PSP5 : lequel performe le mieux ?",
      a: `Même indice, même mécanisme : la différence théorique est l'écart de TER (0,03 %/an en faveur de PSP5), soit ~${ecartCapital(0.15, 0.12)} € sur 20 ans à 200 €/mois. Les écarts de tracking réels peuvent ponctuellement inverser ce classement une année donnée. En pratique : équivalents.`,
    },
    {
      q: "Pourquoi pas un S&P 500 physique comme CSPX ou VUSA ?",
      a: "CSPX (iShares) et VUSA (Vanguard) sont d'excellents ETF S&P 500 physiques à 0,07 % — mais ils ne sont PAS éligibles PEA (actions américaines détenues en direct). Ils se logent en CTO ou assurance-vie. En PEA, la réplication synthétique est le passage obligé pour le S&P 500.",
    },
    {
      q: "Puis-je détenir ESE et PSP5 en même temps ?",
      a: "Techniquement oui, mais c'est inutile : ils répliquent le même indice. Détenir les deux n'apporte aucune diversification — uniquement de la complexité. Si vous avez déjà l'un, conservez-le et concentrez vos nouveaux versements sur un seul.",
    },
    {
      q: "S&P 500 ou MSCI World pour mon PEA ?",
      a: "Question plus importante que ESE vs PSP5 ! Le MSCI World est composé à ~70 % de S&P 500 mais ajoute le Japon, l'Europe, le Canada… Le S&P 500 pur est un pari assumé sur la poursuite de la domination américaine. Pour la simplicité maximale d'un débutant, le World est souvent recommandé — voir notre comparatif MSCI World vs S&P 500.",
    },
  ],

  tags: ["PEA", "S&P 500", "frais"],
};

// ─── VWCE vs WPEA ─────────────────────────────────────────────────────────────

const VWCE_VS_WPEA: ETFComparison = {
  slug: "vwce-vs-wpea",
  publishedAt: "2026-06-10",
  updatedAt: "2026-06-10",
  title: "VWCE vs WPEA : All-World en CTO ou MSCI World en PEA ?",
  metaTitle: "VWCE ou WPEA : All-World ou MSCI World pour votre DCA ?",
  metaDescription:
    "VWCE ajoute les marchés émergents (~10 %) mais se loge en CTO (31,4 % d'impôt). WPEA s'arrête aux pays développés mais profite du PEA (18,6 %). Sur 20 ans, la fiscalité l'emporte presque toujours — comparatif chiffré.",

  left: {
    heading: "VWCE",
    subheading: "Vanguard FTSE All-World UCITS ETF (Acc) — ISIN IE00BK5BQT80",
    type: "ETF",
    coverage: "FTSE All-World — ~3 700 sociétés, pays développés ET émergents (49 pays)",
    issuer: "Vanguard",
    ter: "0,22 %/an",
    replication: "Physique optimisée",
    distribution: "Capitalisant",
    currency: "USD (cotation EUR disponible)",
    peaEligible: "Non — CTO ou assurance-vie uniquement",
    strongPoint: "La diversification maximale en un seul ETF (développés + émergents) · Vanguard, pionnier du passif",
    weakPoint: "Non éligible PEA → PFU 31,4 % sur les gains en CTO",
  },

  right: {
    heading: "WPEA",
    subheading: "iShares Core MSCI World UCITS ETF (PEA) — ISIN IE0006WW1TQ4",
    type: "ETF",
    coverage: "MSCI World — ~1 500 sociétés des 23 pays développés (pas d'émergents)",
    issuer: "iShares (BlackRock)",
    ter: "0,20 %/an",
    replication: "Synthétique (swap)",
    distribution: "Capitalisant",
    currency: "EUR",
    peaEligible: "Oui",
    strongPoint: "MSCI World à 0,20 % dans l'enveloppe fiscale la plus avantageuse de France",
    weakPoint: "Pas d'exposition aux marchés émergents (Chine, Inde, Brésil…)",
  },

  verdict:
    `Pour un résident fiscal français avec un PEA non plafonné, WPEA gagne dans la grande majorité des cas : l'avantage fiscal du PEA (18,6 % vs 31,4 % sur les gains, soit ≈ ${ecartFiscalEnviron(54000)} € sur 20 ans à 200 €/mois) dépasse largement le bénéfice attendu des ~10 % d'émergents de VWCE. Et si les émergents vous tiennent à cœur, l'association WPEA + AEEM (émergents PEA) réplique l'exposition All-World… en restant dans le PEA. VWCE redevient le meilleur choix en CTO (PEA plein) ou en assurance-vie.`,

  intro:
    "VWCE est l'ETF chouchou des investisseurs européens : tout le marché mondial, émergents compris, en un seul fonds Vanguard. WPEA est le MSCI World optimisé pour le PEA français. Le débat « faut-il les émergents ? » est légitime — mais pour un investisseur français, il est presque toujours tranché par un facteur que les comparatifs européens ignorent : l'enveloppe fiscale.",

  keyDifferences: [
    { criterion: "Indice répliqué", leftValue: "FTSE All-World (~3 700 sociétés)", rightValue: "MSCI World (~1 500 sociétés)" },
    { criterion: "Marchés émergents", leftValue: "Oui (~10 % de l'indice)", rightValue: "Non" },
    { criterion: "TER", leftValue: "0,22 %/an", rightValue: "0,20 %/an" },
    { criterion: "Réplication", leftValue: "Physique optimisée", rightValue: "Synthétique (swap)" },
    { criterion: "Éligibilité PEA", leftValue: "Non", rightValue: "Oui" },
    { criterion: "Fiscalité des gains (après 5 ans)", leftValue: "PFU 31,4 % (CTO)", rightValue: "18,6 % (PEA)" },
    { criterion: "Impact fiscal — 20 ans à 200 €/mois", leftValue: `≈ ${impotCTOEnviron(54000)} € de prélèvements`, rightValue: `≈ ${impotPEAEnviron(54000)} € de prélèvements` },
    { criterion: "Équivalent émergents en PEA", leftValue: "—", rightValue: "Possible via WPEA + AEEM (~90/10)" },
  ],

  useCases: [
    {
      profile: "PEA non plafonné, simplicité maximale",
      winner: "right",
      explanation:
        "WPEA seul en PEA : la fiscalité fait plus pour votre patrimoine que les ~10 % d'émergents manquants. Le MSCI World a historiquement délivré des rendements proches de l'All-World, avec une volatilité légèrement inférieure.",
    },
    {
      profile: "Conviction émergents, PEA disponible",
      winner: "right",
      explanation:
        "Combinez WPEA (~90 %) + AEEM (Amundi MSCI Emerging Markets, éligible PEA) (~10 %) : vous répliquez l'exposition All-World en conservant la fiscalité PEA. Un ordre de plus par mois, quelques milliers d'euros d'impôt en moins à l'arrivée.",
    },
    {
      profile: "PEA plafonné ou non-résident",
      winner: "left",
      explanation:
        "Sans l'avantage PEA, VWCE redevient l'option de référence : diversification maximale, réplication physique, émetteur Vanguard, un seul fonds à gérer en CTO.",
    },
    {
      profile: "Allergie au synthétique",
      winner: "left",
      explanation:
        "WPEA est synthétique (obligatoire pour l'éligibilité PEA d'un indice mondial). Si vous refusez le swap par principe, VWCE physique en CTO est l'alternative cohérente — en connaissance du surcoût fiscal.",
    },
  ],

  analysis:
    `Les comparatifs européens de VWCE ne tiennent jamais compte du PEA — c'est pourtant le facteur décisif pour un investisseur français. Posons les ordres de grandeur sur 20 ans à 200 €/mois et 7 %/an : capital avant frais ≈ ${capitalPour(0)} €, dont ≈ ${gainsPour(0)} € de gains. En PEA (WPEA), prélèvements sociaux de 18,6 % ≈ 10 000 €. En CTO (VWCE), PFU de 31,4 % ≈ 16 956 €. L'écart (~${ecartFiscalEnviron(54000)} €) représente plusieurs fois l'impact espéré des émergents : sur les 30 dernières années, développés et émergents ont alterné les périodes de sur/sous-performance, sans gagnant structurel — et les émergents ne pèsent que ~10 % de l'All-World, diluant leur effet. Conclusion pragmatique : l'enveloppe d'abord, l'indice ensuite. WPEA (ou WPEA + AEEM) en PEA tant qu'il n'est pas plein ; VWCE en CTO au-delà. Les deux stratégies sont excellentes — c'est l'ordre qui compte.`,

  faq: [
    {
      q: "VWCE est-il éligible au PEA ?",
      a: "Non. VWCE est en réplication physique et détient majoritairement des actions non européennes, ce qui l'exclut du PEA. Il se loge en compte-titres ordinaire ou, selon les contrats, en assurance-vie. En PEA, l'exposition mondiale passe par les ETF synthétiques (WPEA, DCAM, CW8).",
    },
    {
      q: "Comment répliquer VWCE dans un PEA ?",
      a: "Avec deux ETF : WPEA (MSCI World, pays développés) pour ~90 % et AEEM (Amundi MSCI Emerging Markets, éligible PEA) pour ~10 %. Cette combinaison approxime l'exposition FTSE All-World de VWCE tout en conservant la fiscalité PEA. Notre outil d'allocation permet de simuler ce portefeuille.",
    },
    {
      q: "Les émergents ne vont-ils pas surperformer et inverser le calcul ?",
      a: "C'est possible — mais il faudrait une surperformance massive et durable des émergents pour que ~10 % d'allocation compensent 13 points de fiscalité sur la totalité des gains. Historiquement, développés et émergents alternent les cycles sans gagnant de long terme évident. Et l'option WPEA + AEEM capture ce scénario sans sacrifier le PEA.",
    },
    {
      q: "J'ai déjà du VWCE en CTO : dois-je vendre pour passer en PEA ?",
      a: "Vendre déclencherait l'imposition immédiate des plus-values latentes (PFU 31,4 %) — souvent contre-productif. La stratégie habituelle : conserver le VWCE existant et diriger les NOUVEAUX versements vers le PEA (WPEA/DCAM) jusqu'au plafond. Cas par cas selon les montants — un conseiller peut affiner.",
    },
  ],

  tags: ["PEA", "CTO", "MSCI World", "All-World", "émergents"],
};

export const ETF_COMPARISONS: Record<string, ETFComparison> = {
  [MSCI_WORLD_VS_SP500.slug]: MSCI_WORLD_VS_SP500,
  [CW8_VS_ESE.slug]: CW8_VS_ESE,
  [VWCE_VS_CW8.slug]: VWCE_VS_CW8,
  [CW8_VS_WPEA.slug]: CW8_VS_WPEA,
  [WPEA_VS_DCAM.slug]: WPEA_VS_DCAM,
  [IWDA_VS_CW8.slug]: IWDA_VS_CW8,
  [ESE_VS_PSP5.slug]: ESE_VS_PSP5,
  [VWCE_VS_WPEA.slug]: VWCE_VS_WPEA,
};

export const ETF_COMPARISON_LIST: ETFComparison[] = Object.values(ETF_COMPARISONS);

export function getETFComparison(slug: string): ETFComparison | null {
  return ETF_COMPARISONS[slug] ?? null;
}
