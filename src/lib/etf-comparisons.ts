// ETF vs ETF comparison data for /comparatif-etf/*.
// Static educational content. Last reviewed: 2026-03.
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
  title: "MSCI World vs S&P 500 : quel indice pour votre DCA ?",
  metaTitle: "MSCI World ou S&P 500 : comparatif complet pour un DCA en ETF",
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
    subheading: "Amundi S&P 500 UCITS ETF — ISIN LU1681048804",
    type: "ETF",
    coverage: "S&P 500 — 500 plus grandes capitalisations américaines",
    issuer: "Amundi ETF",
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
    { criterion: "Impact TER sur 20 ans (200 €/mois, 7 %)", leftValue: "−7 400 €", rightValue: "−2 900 €" },
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
        "Sur 20 ans à 200 €/mois, 0,23 % de TER en moins représente environ 4 500 € de capital final en plus. Si vous êtes à l'aise avec la concentration US (~70 % du CW8 de toute façon), ESE peut être la meilleure option coûts/performance.",
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
        "CW8 est votre seule option réaliste entre les deux — VWCE n'est pas éligible PEA. Vous perdez l'exposition émergents, mais vous gagnez le bénéfice fiscal du PEA (17,2 % vs 30 % à la sortie). Sur 20 ans, l'avantage fiscal surpasse largement l'avantage de diversification.",
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

// ─── Registry ─────────────────────────────────────────────────────────────────

export const ETF_COMPARISONS: Record<string, ETFComparison> = {
  [MSCI_WORLD_VS_SP500.slug]: MSCI_WORLD_VS_SP500,
  [CW8_VS_ESE.slug]: CW8_VS_ESE,
  [VWCE_VS_CW8.slug]: VWCE_VS_CW8,
};

export const ETF_COMPARISON_LIST: ETFComparison[] = Object.values(ETF_COMPARISONS);

export function getETFComparison(slug: string): ETFComparison | null {
  return ETF_COMPARISONS[slug] ?? null;
}
