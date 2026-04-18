// Per-ETF editorial content — longer-form copy for the detail pages.
// Kept separate from etf-config.ts which holds the mechanical/structural data.
// TODO (premium): Move to a headless CMS for non-technical editing.

export interface ETFDetailContent {
  /** Multi-paragraph explanation of the underlying index and strategy */
  whatItTracks: string;
  /** 3–4 reasons an investor might choose this ETF */
  whyChooseIt: string[];
  /** 2–4 important caveats or risks */
  watchOut: string[];
  /** Plain-language investor profile */
  suitableFor: string;
  /** Suggested gross annual return pre-fill for the simulator (%) */
  suggestedReturn: number;
}

export const ETF_DETAIL_CONTENT: Record<string, ETFDetailContent> = {
  CW8: {
    whatItTracks: `Le CW8 réplique l'indice MSCI World, un indice de référence mondial qui regroupe environ 1 500 actions de grandes et moyennes capitalisations dans 23 pays développés. Les États-Unis représentent la plus grande part (environ 65 %), suivis de l'Europe (autour de 20 %) et du Japon (environ 6 %). Cet indice exclut les marchés émergents comme la Chine, l'Inde ou le Brésil.

Amundi utilise une réplication synthétique par swap pour répliquer cet indice tout en rendant l'ETF éligible au Plan d'Épargne en Actions (PEA). Concrètement, le fonds ne détient pas directement les actions du MSCI World, mais conclut un contrat d'échange (swap) avec une contrepartie bancaire qui s'engage à délivrer la performance de l'indice. Le risque de contrepartie est réglementairement plafonné à 10 % de l'actif net.

Les dividendes versés par les entreprises de l'indice ne sont pas distribués aux porteurs de parts : ils sont réinvestis automatiquement dans le fonds, augmentant mécaniquement la valeur de la part (politique capitalisante). C'est particulièrement efficace sur le long terme grâce à l'effet des intérêts composés.`,
    whyChooseIt: [
      "Éligible PEA — bénéficiez de la fiscalité avantageuse du plan d'épargne en actions après 5 ans de détention",
      "Frais très compétitifs (TER 0,38 %) — un des ETF monde les moins chers éligibles PEA",
      "Politique capitalisante — les dividendes sont réinvestis sans intervention, idéal pour l'investissement passif long terme",
      "Très liquide et disponible chez la grande majorité des courtiers français (Boursorama, Trade Republic, Degiro…)",
    ],
    watchOut: [
      "Réplication synthétique (swap) : introduit un risque de contrepartie résiduel, même s'il est encadré réglementairement",
      "Pas d'exposition aux marchés émergents (Chine, Inde, Brésil…) qui représentent une part croissante de l'économie mondiale",
      "Forte concentration sur les actions américaines (~65 %), ce qui peut amplifier l'impact d'une correction aux États-Unis",
    ],
    suitableFor:
      "Idéal pour les investisseurs français souhaitant un ETF monde capitalisant éligible PEA, à frais bas, adapté à une stratégie DCA sur le long terme sans gestion active.",
    suggestedReturn: 7,
  },

  EWLD: {
    whatItTracks: `L'EWLD réplique le même indice MSCI World que le CW8, mais avec une méthode de réplication physique optimisée. Contrairement à la réplication synthétique, l'ETF détient directement un sous-ensemble représentatif des actions composant l'indice (réplication par échantillonnage). iShares, la branche ETF de BlackRock, est le plus grand émetteur d'ETF au monde.

La réplication physique signifie que le fonds possède réellement des parts d'entreprises comme Apple, Microsoft, LVMH ou Toyota. Cela élimine le risque de contrepartie propre aux swaps, au prix d'une légère imperfection de tracking (l'ETF ne détient pas les ~1 500 titres de l'indice, mais une sélection optimisée).

L'EWLD est également capitalisant et éligible PEA, ce qui en fait un concurrent direct du CW8 sur le marché français. Son TER (0,20 %) est inférieur à celui du CW8, bien que d'autres frais implicites (coûts de transaction, écart de suivi) puissent nuancer cet avantage en pratique.`,
    whyChooseIt: [
      "Réplication physique — le fonds détient réellement des actions, éliminant le risque de contrepartie des swaps",
      "TER parmi les plus bas du marché pour un ETF MSCI World (0,20 %)",
      "Éligible PEA — même avantage fiscal que le CW8",
      "iShares (BlackRock) : l'émetteur le plus important au monde, avec une infrastructure solide et une grande transparence",
    ],
    watchOut: [
      "Liquidité légèrement inférieure au CW8 sur Euronext Paris — le spread peut être plus large sur de petits volumes",
      "L'écart de suivi réel peut dépasser le TER affiché selon les conditions de marché",
      "Disponibilité variable selon les courtiers — à vérifier avant d'ouvrir une position",
    ],
    suitableFor:
      "Convient aux investisseurs qui préfèrent la réplication physique pour des raisons de transparence ou d'aversion au risque de contrepartie, tout en restant sur l'exposition MSCI World avec éligibilité PEA.",
    suggestedReturn: 7,
  },

  VWCE: {
    whatItTracks: `Le VWCE réplique l'indice FTSE All-World, qui couvre environ 3 700 entreprises dans 49 pays, incluant à la fois les marchés développés et les marchés émergents (Chine, Inde, Brésil, Taïwan, Corée du Sud…). C'est l'une des expositions les plus larges disponibles en un seul ETF.

Par rapport au MSCI World (développés uniquement), le FTSE All-World ajoute une pondération d'environ 10–12 % sur les marchés émergents. Ces marchés présentent un potentiel de croissance plus élevé à long terme, mais aussi une volatilité et des risques politiques supérieurs. La Chine représente généralement entre 3 et 4 % de l'indice.

Vanguard, le gestionnaire, est fondé sur un modèle coopératif unique : ses fonds appartiennent à leurs investisseurs, ce qui l'incite structurellement à minimiser les frais. Le VWCE utilise une réplication physique optimisée et réinvestit les dividendes (politique capitalisante).`,
    whyChooseIt: [
      "Diversification maximale en un seul ETF — pays développés ET émergents, soit ~3 700 entreprises dans 49 pays",
      "Vanguard : pionnier de l'investissement passif à bas coût, connu pour son alignement d'intérêts avec les investisseurs",
      "Réplication physique — transparence et absence de risque de contrepartie",
      "TER compétitif (0,22 %) pour une couverture aussi large",
    ],
    watchOut: [
      "Non éligible PEA (enregistré en Irlande sans structure swap) — à loger en compte-titres ordinaire ou assurance-vie",
      "Exposition aux marchés émergents : volatilité plus élevée, risques de gouvernance et de liquidité",
      "La pondération par capitalisation boursière surpondère les États-Unis (~60 %) malgré une couverture mondiale",
    ],
    suitableFor:
      "Idéal pour les investisseurs souhaitant une exposition véritablement mondiale en un seul ETF, incluant les marchés émergents, sans contrainte d'éligibilité PEA. Parfait comme unique ETF dans un portefeuille simple.",
    suggestedReturn: 7,
  },

  SPY: {
    whatItTracks: `Le SPY réplique le S&P 500, l'indice de référence des 500 plus grandes entreprises américaines cotées. Créé en 1993 par State Street Global Advisors, c'est le premier ETF américain et reste à ce jour le plus liquide et le plus échangé au monde, avec des milliards de dollars de volume quotidien.

Le S&P 500 couvre environ 80 % de la capitalisation boursière américaine. Il est fortement concentré sur la technologie : les dix premières positions (Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla, Berkshire Hathaway, JPMorgan, Broadcom) représentent à elles seules plus de 35 % de l'indice.

Contrairement aux ETF UCITS européens, le SPY est un trust américain (grantor trust). Il distribue trimestriellement les dividendes versés par les entreprises du S&P 500, ce qui génère un événement fiscal à chaque distribution pour les investisseurs résidents en France.`,
    whyChooseIt: [
      "L'ETF le plus échangé au monde — liquidité exceptionnelle, spreads très faibles",
      "Frais extrêmement bas (TER 0,0945 %) — parmi les moins chers de l'univers ETF",
      "Référence absolue : le S&P 500 est l'indice contre lequel se mesure la quasi-totalité de la gestion active mondiale",
      "Historique de performance long (depuis 1993) et très documenté",
    ],
    watchOut: [
      "Exposition 100 % américaine — risque de concentration géographique important en cas de correction durable aux États-Unis",
      "Distribuant : les dividendes sont versés trimestriellement, à déclarer et fiscaliser chaque année en France (flat tax 30 %)",
      "Non éligible PEA — à loger en compte-titres ordinaire",
      "Libellé en USD — exposition au risque de change EUR/USD pour un investisseur européen",
    ],
    suitableFor:
      "Convient aux investisseurs qui veulent une exposition pure et maximalement liquide aux grandes capitalisations américaines, ou qui utilisent le S&P 500 comme référence de performance. Adapté aux comptes-titres ordinaires.",
    suggestedReturn: 8,
  },

  QQQ: {
    whatItTracks: `Le QQQ réplique le Nasdaq-100, un indice regroupant les 100 plus grandes entreprises non-financières listées sur le Nasdaq. Il est extrêmement concentré sur la technologie et la croissance : Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Broadcom, Tesla, Costco et Netflix constituent les dix premières positions et représentent généralement plus de 50 % de l'indice.

Contrairement au S&P 500, le Nasdaq-100 exclut les valeurs financières (banques, assurances) et est délibérément biaisé vers les secteurs à forte croissance : logiciel, semi-conducteurs, e-commerce, streaming, cloud computing, intelligence artificielle. Cette concentration sectorielle explique à la fois ses performances spectaculaires sur certaines périodes et ses corrections brutales sur d'autres.

Le QQQ d'Invesco est le deuxième ETF le plus échangé aux États-Unis. Il distribue des dividendes (faibles, car les entreprises tech en versent peu) et est libellé en USD.`,
    whyChooseIt: [
      "Exposition maximale aux secteurs technologiques américains les plus dynamiques (IA, cloud, semi-conducteurs…)",
      "Performance historique exceptionnelle sur 10–20 ans, bien supérieure aux indices monde",
      "ETF très liquide avec d'importants volumes quotidiens et des spreads très faibles",
      "Frais raisonnables (0,20 %) pour un ETF de cette nature",
    ],
    watchOut: [
      "Concentration sectorielle extrême (technologie ~60 %) — sensibilité élevée aux rotations sectorielles et aux cycles de taux",
      "Volatilité nettement supérieure au MSCI World : drawdowns historiques importants (-80 % en 2000–2002, -35 % en 2022)",
      "Non éligible PEA — à loger en compte-titres ordinaire",
      "Libellé en USD, distribuant — implications fiscales annuelles pour les résidents français",
    ],
    suitableFor:
      "Réservé aux investisseurs avec un horizon long terme (15 ans+), une forte tolérance à la volatilité et une conviction sur la croissance technologique américaine. Déconseillé comme unique ETF d'un portefeuille — à combiner avec des expositions plus larges.",
    suggestedReturn: 9,
  },
};

export function getETFDetailContent(
  displaySymbol: string
): ETFDetailContent | undefined {
  return ETF_DETAIL_CONTENT[displaySymbol];
}
