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

  // IWDA = iShares Core MSCI World UCITS ETF (ISIN IE00B4L5Y983), listing
  // Amsterdam. Concurrent direct du CW8 sur le marché français — même
  // indice, méthode différente. Contenu hérité de l'ancienne entrée EWLD
  // (ticker Lyxor désormais redirigé) car il s'agit du même type d'ETF
  // (iShares MSCI World physique).
  IWDA: {
    whatItTracks: `L'IWDA réplique le même indice MSCI World que le CW8, mais avec une méthode de réplication physique optimisée. Contrairement à la réplication synthétique par swap, l'ETF détient directement un sous-ensemble représentatif des actions composant l'indice (réplication par échantillonnage). iShares, la branche ETF de BlackRock, est le plus grand émetteur d'ETF au monde.

La réplication physique signifie que le fonds possède réellement des parts d'entreprises comme Apple, Microsoft, LVMH ou Toyota. Cela élimine le risque de contrepartie propre aux swaps, au prix d'une légère imperfection de tracking (l'ETF ne détient pas les ~1 500 titres de l'indice, mais une sélection optimisée d'environ 90 % d'entre eux).

L'IWDA est également capitalisant, mais il n'est PAS éligible au PEA : c'est un fonds à réplication physique investi majoritairement hors Union européenne (ISIN irlandais IE00B4L5Y983), ce qui ne satisfait pas le quota de 75 % d'actions UE exigé par le PEA. Il se loge donc en CTO ou en assurance-vie. Son TER (0,20 %) est inférieur à celui du CW8 (0,38 %), bien que d'autres frais implicites (coûts de transaction, écart de suivi) puissent nuancer cet avantage en pratique.`,
    whyChooseIt: [
      "Réplication physique — le fonds détient réellement des actions, éliminant le risque de contrepartie des swaps",
      "TER parmi les plus bas du marché pour un ETF MSCI World (0,20 %), inférieur au CW8",
      "Encours parmi les plus importants d'Europe — liquidité et pérennité du fonds",
      "iShares (BlackRock) : l'émetteur le plus important au monde, infrastructure solide et grande transparence sur les holdings",
    ],
    watchOut: [
      "Non éligible PEA — à loger en CTO (PFU 30 % sur les gains) ou assurance-vie ; pour un PEA, préférez un World synthétique (WPEA, DCAM, CW8)",
      "L'écart de suivi réel peut dépasser le TER affiché selon les conditions de marché (réplication par échantillonnage)",
      "Coté sur Euronext Amsterdam (et non Paris) — vérifiez les frais de place de votre courtier",
    ],
    suitableFor:
      "Convient aux investisseurs qui préfèrent la réplication physique pour des raisons de transparence ou d'aversion au risque de contrepartie, dans le cadre d'un CTO ou d'une assurance-vie — typiquement une fois le PEA plafonné. Pour un cœur de portefeuille en PEA, un ETF World synthétique (WPEA, DCAM, CW8) reste le choix adapté.",
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

  // 500 = Amundi S&P 500 UCITS ETF (ISIN LU1681048804), ticker Euronext
  // Paris "500" depuis le rebrand Lyxor → Amundi (2022). Contenu hérité
  // de l'ancienne entrée SP5 (ticker historique) puisqu'il s'agit du même
  // fonds, simplement renommé.
  "500": {
    whatItTracks: `Le 500 réplique le S&P 500, l'indice des 500 plus grandes entreprises américaines cotées, tout en étant éligible au PEA grâce à la réplication synthétique d'Amundi. L'ETF ne détient pas directement les actions américaines mais conclut un contrat swap avec une contrepartie bancaire qui livre la performance du S&P 500. Le portefeuille physique du fonds est constitué d'actions européennes éligibles PEA — la mécanique du swap fait le reste.

Le S&P 500 est l'indice de référence de la gestion d'actifs mondiale. Il couvre environ 80 % de la capitalisation boursière américaine et surpondère fortement la technologie : les dix premières positions (Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla, Berkshire Hathaway, JPMorgan, Broadcom) représentent plus de 35 % de l'indice.

Avec un TER de 0,15 %, l'Amundi S&P 500 est l'une des façons les moins chères d'accéder au S&P 500 en Europe, et la seule solution PEA-éligible à ce niveau de frais. Note : le ticker historique "SP5" (Lyxor avant 2022) reste actif via redirection — le fonds est aujourd'hui le même, sous bannière Amundi.`,
    whyChooseIt: [
      "Éligible PEA — le seul moyen d'investir sur le S&P 500 avec la fiscalité avantageuse du PEA (17,2 % après 5 ans)",
      "TER ultra-compétitif à 0,15 % — parmi les moins chers de l'univers ETF S&P 500 accessibles en Europe",
      "Capitalisant — les dividendes sont réinvestis automatiquement, sans friction fiscale annuelle",
      "Amundi : émetteur n°1 européen, gestionnaire de référence sur les ETF actions PEA",
    ],
    watchOut: [
      "Réplication synthétique : risque de contrepartie résiduel, encadré à 10 % de l'actif net par la réglementation UCITS",
      "Exposition 100 % américaine — forte concentration géographique sur un seul marché",
      "Sensibilité élevée aux valorisations tech US, qui tirent une large part de la performance de l'indice",
    ],
    suitableFor:
      "Idéal pour les investisseurs français qui souhaitent s'exposer au dynamisme des entreprises américaines dans le cadre fiscal du PEA. Excellent complément à un ETF MSCI World pour surpondérer les États-Unis.",
    suggestedReturn: 8,
  },

  ANX: {
    whatItTracks: `L'ANX réplique le Nasdaq-100, l'indice des 100 plus grandes entreprises non-financières du Nasdaq, massivement orienté technologie (Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla, Broadcom, Costco, Netflix). Il constitue la seule solution disponible sur le marché européen pour accéder au Nasdaq-100 dans le cadre fiscal d'un PEA.

La prouesse technique repose sur la réplication synthétique d'Amundi : le fonds détient des actions européennes éligibles PEA et conclut un swap pour obtenir la performance du Nasdaq-100. Cette structure est identique à celle du SP5 (S&P 500) et du CW8 (MSCI World) chez Amundi.

Le Nasdaq-100 est l'indice le plus performant de l'histoire sur les 20 dernières années, mais aussi l'un des plus volatils. Ses corrections peuvent être brutales : -35 % en 2022, -80 % sur la bulle internet de 2000–2003.`,
    whyChooseIt: [
      "Unique ETF PEA-éligible sur le Nasdaq-100 — opportunité d'expo tech US sans sacrifier l'avantage fiscal",
      "Amundi, le n°1 européen, assure robustesse et liquidité de la structure swap",
      "Capitalisant — optimisation fiscale maximale dans le cadre du PEA",
      "TER raisonnable (0,23 %) pour un accès à l'indice tech américain de référence",
    ],
    watchOut: [
      "Volatilité très élevée — le Nasdaq-100 peut perdre 30–50 % lors des cycles baissiers. Horizon minimum recommandé : 10–15 ans",
      "Concentration sectorielle extrême : technologie ~60 %, sensible aux rotations de taux et aux changements de sentiment sur la croissance",
      "Réplication synthétique — risque de contrepartie, même si encadré réglementairement",
    ],
    suitableFor:
      "Réservé aux investisseurs avec une forte conviction sur la croissance technologique américaine et un horizon long terme (15 ans+). À combiner avec un ETF MSCI World pour équilibrer le risque — ne pas utiliser comme unique ETF d'un portefeuille.",
    suggestedReturn: 9,
  },

  // AEEM = Amundi MSCI Emerging Markets UCITS ETF (ISIN LU1681045370),
  // ticker Euronext Paris "AEEM" depuis le rebrand Lyxor → Amundi (2022).
  // Contenu hérité de l'ancienne entrée PAEEM (ticker historique).
  AEEM: {
    whatItTracks: `L'AEEM réplique le MSCI Emerging Markets, l'indice de référence des marchés en développement. Il regroupe environ 1 400 entreprises dans 24 pays émergents : Chine (~27 %), Inde (~18 %), Taïwan (~15 %), Corée du Sud (~11 %), Brésil (~5 %), Arabie Saoudite, Afrique du Sud, etc. Ces marchés représentent plus de 40 % du PIB mondial mais restent sous-représentés dans les indices développés comme le MSCI World.

Grâce à la réplication synthétique d'Amundi, cet ETF est éligible au PEA — une exception notable, car les marchés émergents sont normalement inaccessibles via PEA. C'est l'un des rares ETF qui permettent une diversification réelle (développés + émergents) entièrement dans le cadre fiscal du PEA.

Les émergents offrent un potentiel de croissance long terme supérieur aux marchés développés, mais avec une volatilité et des risques spécifiques plus importants (risque politique, risque de change, gouvernance d'entreprise, liquidité). Note : le ticker historique "PAEEM" (Lyxor avant 2022) reste actif via redirection — c'est le même fonds, désormais sous bannière Amundi.`,
    whyChooseIt: [
      "Exposition aux marchés émergents dans le PEA — une rareté qui permet une diversification mondiale fiscalement optimisée",
      "Complète idéalement un CW8 ou IWDA : MSCI World (développés) + AEEM (émergents) = couverture mondiale quasi-totale",
      "TER compétitif à 0,20 % pour un ETF marchés émergents",
      "Amundi : structure swap maîtrisée, ETF coté sur Euronext Paris",
    ],
    watchOut: [
      "Volatilité nettement supérieure aux marchés développés — drawdowns plus profonds et récupérations plus lentes",
      "Forte exposition à la Chine (~27 %) : risques réglementaires, tensions géopolitiques et délistings potentiels",
      "Réplication synthétique avec risque de contrepartie, même encadré",
    ],
    suitableFor:
      "Investisseurs souhaitant compléter un portefeuille MSCI World par une exposition aux marchés émergents, tout en conservant l'enveloppe PEA. Une allocation de 10–20 % en émergents aux côtés d'un ETF monde est une approche courante.",
    suggestedReturn: 7,
  },

  PCEU: {
    whatItTracks: `Le PCEU réplique le STOXX Europe 600, l'indice de référence des marchés boursiers européens. Il regroupe 600 grandes, moyennes et petites capitalisations issues de 17 pays européens (dont les pays hors zone euro comme la Suisse, le Royaume-Uni, la Suède et la Norvège). Parmi les plus grandes positions : ASML, Nestlé, Novo Nordisk, LVMH, Shell, AstraZeneca, HSBC, SAP.

Contrairement aux indices MSCI qui se concentrent sur les grandes capitalisations, le STOXX Europe 600 inclut également les moyennes et petites entreprises européennes, offrant une exposition plus complète à l'économie du continent. La répartition sectorielle est plus équilibrée que le Nasdaq ou le S&P 500, avec une forte présence des valeurs financières, pharmaceutiques, industrielles et de consommation.

Amundi utilise la réplication synthétique pour rendre cet ETF éligible au PEA, avec un TER de seulement 0,07 % — un des moins chers de l'univers ETF européen.`,
    whyChooseIt: [
      "TER ultra-compétitif à 0,07 % — l'un des ETF les moins chers disponibles sur le marché européen",
      "Éligible PEA — diversification géographique vers l'Europe sans perdre l'avantage fiscal",
      "Exposition large à l'économie européenne : 600 entreprises dans 17 pays, secteurs équilibrés",
      "Diversification devise : exposure à GBP, CHF, SEK en plus de l'euro",
    ],
    watchOut: [
      "L'Europe affiche une performance historique inférieure aux États-Unis sur les 15 dernières années — croissance structurellement plus faible",
      "Réplication synthétique — risque de contrepartie, même encadré par la réglementation UCITS",
      "Le Royaume-Uni représente ~22 % de l'indice : sensibilité résiduelle aux évolutions post-Brexit",
    ],
    suitableFor:
      "Investisseurs qui souhaitent diversifier géographiquement leur portefeuille vers l'Europe à moindre coût, ou qui cherchent à réduire la dépendance aux marchés américains. Excellent complément à un ETF MSCI World pour surpondérer délibérément l'Europe.",
    suggestedReturn: 6,
  },

  CSPX: {
    whatItTracks: `Le CSPX réplique le S&P 500 par réplication physique complète — le fonds détient directement les 500 actions composant l'indice, dans des proportions reflétant leur poids dans le S&P 500. iShares (BlackRock) gère cet ETF domicilié en Irlande, coté à la Bourse de Londres (LSE) en USD.

Avec un TER de 0,07 %, le CSPX est l'ETF S&P 500 physique le moins cher d'Europe — moins cher que le SPY américain (0,09 %) tout en offrant la transparence totale de la réplication physique. La domiciliation irlandaise bénéficie d'une convention fiscale avantageuse avec les États-Unis (retenue à la source sur dividendes de 15 % au lieu de 30 %), réduisant la friction fiscale sur les dividendes réinvestis.

Capitalisant : les dividendes ne sont pas versés mais réinvestis dans le fonds, optimisant la composition et simplifiant la gestion fiscale pour l'investisseur.`,
    whyChooseIt: [
      "TER le plus bas de la catégorie S&P 500 en Europe (0,07 %) — coût minimal pour une exposition maximale",
      "Réplication physique complète — transparence totale, absence de risque de contrepartie",
      "Domiciliation irlandaise : convention fiscale US-Irlande avantageuse (retenue source 15 % vs 30 %)",
      "Capitalisant — optimisation automatique des dividendes sans déclaration annuelle des revenus",
    ],
    watchOut: [
      "Non éligible PEA — à loger impérativement en CTO, PER ou assurance-vie",
      "Coté à Londres en USD — exposition au risque de change EUR/USD pour un investisseur européen",
      "100 % américain — concentration géographique importante, surpondération technologique (>30 %)",
    ],
    suitableFor:
      "Idéal pour les investisseurs qui veulent le S&P 500 physique le moins cher disponible en Europe, dans un CTO ou une assurance-vie. Solution de référence pour ceux qui préfèrent éviter les swaps et maximiser la transparence.",
    suggestedReturn: 8,
  },

  // VUSA = Vanguard S&P 500 UCITS ETF (ISIN IE00B3XXRP09), TER 0,07 %,
  // listing Euronext Amsterdam. Concurrent direct du CSPX (iShares) sur le
  // segment S&P 500 physique CTO, avec la signature Vanguard (modèle
  // coopératif, frais bas par construction).
  VUSA: {
    whatItTracks: `Le VUSA réplique le S&P 500 par réplication physique complète — le fonds détient directement les 500 actions composant l'indice, dans des proportions reflétant exactement leur poids dans le S&P 500. Vanguard, le gestionnaire, est l'un des deux pionniers historiques de l'investissement passif (avec State Street). Sa structure coopérative unique — les fonds appartiennent à leurs investisseurs — l'incite structurellement à minimiser les frais sur la durée.

Le VUSA est domicilié en Irlande (ISIN IE00B3XXRP09), coté à Amsterdam en USD. Avec un TER de 0,07 %, il est à parité avec le CSPX d'iShares pour le titre de l'ETF S&P 500 physique le moins cher d'Europe. La domiciliation irlandaise bénéficie d'une convention fiscale avantageuse avec les États-Unis : la retenue à la source sur les dividendes est de 15 % au lieu des 30 % standards, réduisant la friction fiscale sur les dividendes réinvestis.

Politique capitalisante : les dividendes ne sont pas distribués mais réinvestis dans le fonds, optimisant l'effet des intérêts composés et simplifiant la gestion fiscale pour l'investisseur français (pas de revenus annuels à déclarer en CTO).

Le S&P 500 lui-même couvre environ 80 % de la capitalisation boursière américaine. Les dix premières positions (Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla, Berkshire Hathaway, JPMorgan, Broadcom) représentent plus de 35 % de l'indice, avec une forte concentration sur la technologie (~30 % du poids).`,
    whyChooseIt: [
      "TER ultra-compétitif (0,07 %) — à parité avec le CSPX iShares pour le titre du S&P 500 physique le moins cher d'Europe",
      "Vanguard : modèle coopératif unique qui aligne structurellement les intérêts du gestionnaire et des investisseurs",
      "Réplication physique complète — le fonds détient les 500 actions du S&P 500, transparence maximale",
      "Domiciliation irlandaise : convention fiscale US-Irlande avantageuse (retenue à la source 15 % vs 30 %), capitalisant pour optimiser la fiscalité",
    ],
    watchOut: [
      "Non éligible PEA — à loger impérativement en CTO, PER ou assurance-vie. Pour le S&P 500 en PEA, voir l'Amundi 500.",
      "Coté en USD — exposition au risque de change EUR/USD pour un investisseur européen (peut amplifier ou atténuer les performances selon la parité)",
      "100 % américain — concentration géographique importante, surpondération technologique (>30 %) qui rend l'ETF sensible aux corrections du secteur",
      "Choix entre VUSA et CSPX : à TER égal (0,07 %), le choix se fait essentiellement sur la disponibilité chez votre courtier et les volumes de marché — les deux sont des solutions équivalentes",
    ],
    suitableFor:
      "Idéal pour les investisseurs qui veulent le S&P 500 physique le moins cher disponible en Europe, dans un CTO ou une assurance-vie. Particulièrement adapté à ceux qui privilégient l'écosystème Vanguard (cohérence avec d'autres ETF Vanguard comme le VWCE pour une couverture monde) ou qui souhaitent un alignement d'intérêts maximal avec leur gestionnaire.",
    suggestedReturn: 8,
  },

  // RS2K = Amundi MSCI Russell 2000 UCITS ETF (ISIN LU1681038755), TER
  // 0,35 %, listing Euronext Paris. Exposition small caps US éligible PEA
  // — combinaison rare et différenciante côté français.
  RS2K: {
    whatItTracks: `Le RS2K réplique le Russell 2000, l'indice de référence des petites et moyennes capitalisations américaines. Il regroupe environ 2 000 entreprises dont la capitalisation se situe entre 300 millions et 2 milliards de dollars — un segment radicalement différent du S&P 500, qui ne couvre que les 500 plus grandes valeurs américaines. Là où le S&P 500 reflète les multinationales matures (Apple, Microsoft, JPMorgan), le Russell 2000 capte les entreprises en croissance, plus régionales, souvent encore en phase d'expansion.

Cet ETF d'Amundi présente une particularité quasi-unique sur le marché européen : il est **éligible au PEA** grâce à la réplication synthétique par swap, alors que les small caps américaines sont normalement inaccessibles via cette enveloppe fiscale. Le fonds détient un portefeuille d'actions européennes éligibles PEA et conclut un contrat d'échange avec une contrepartie bancaire qui livre la performance du Russell 2000.

Historiquement, les small caps américaines ont surperformé les large caps sur le long terme — un phénomène documenté par les chercheurs depuis les travaux de Banz (1981) et popularisé par Fama et French sous le nom de "small cap premium". Sur 30+ ans, l'écart de performance annualisé peut atteindre 1 à 2 points, ce qui se traduit par une différence considérable en cumulé. **Mais ce premium n'est pas garanti** : sur les 5 dernières années, le S&P 500 a largement battu le Russell 2000, principalement à cause de la concentration tech qui a tiré les large caps.

Le RS2K capitalise les dividendes (peu nombreux dans le segment small caps de toute façon) et présente un TER de 0,35 % — supérieur à un ETF S&P 500 PEA (le 500 Amundi est à 0,15 %), ce qui se justifie par la complexité de gestion du swap sur 2 000 sous-jacents.`,
    whyChooseIt: [
      "**Éligible PEA** — l'un des très rares ETF qui permettent une exposition aux small caps américaines dans le cadre fiscal du PEA (17,2 % après 5 ans au lieu de 30 %)",
      "Capture le \"small cap premium\" historiquement observé sur le long terme — diversification de style en plus de la diversification sectorielle",
      "Complète parfaitement un cœur MSCI World ou S&P 500 : le MSCI World ne contient que des large/mid caps, le RS2K vient ajouter le segment des petites capi US",
      "Amundi : émetteur n°1 européen, structure swap éprouvée et liquide, ETF coté sur Euronext Paris",
    ],
    watchOut: [
      "**Volatilité nettement supérieure** aux large caps : drawdowns plus profonds (-30 à -40 % en cas de crise contre -20 à -30 % pour le S&P 500), récupérations plus lentes",
      "**Sous-performance des 5 dernières années** : depuis 2020, le Russell 2000 a sous-performé le S&P 500 de plus de 30 points cumulés. Le \"small cap premium\" est un pari long terme, pas un free lunch sur 5 ans",
      "Réplication synthétique : risque de contrepartie résiduel encadré à 10 % de l'actif net par la réglementation UCITS",
      "TER plus élevé (0,35 %) que les ETF large caps PEA (0,15–0,20 %) — pèse davantage sur la performance long terme",
      "Composition sectorielle déséquilibrée par rapport au S&P 500 : sous-représentation tech, surreprésentation des financières régionales et de l'industrie — peut amplifier les cycles économiques",
    ],
    suitableFor:
      "Convient aux investisseurs qui ont déjà un cœur de portefeuille MSCI World ou S&P 500 (cf CW8, IWDA, 500) et qui veulent ajouter une diversification de style vers les small caps US, tout en restant dans le cadre fiscal du PEA. Une allocation de 5 à 15 % en RS2K, aux côtés d'un ETF monde, est une approche défendable pour qui croit au small cap premium long terme. **À éviter** comme unique ETF — la volatilité et la concentration géographique seraient excessives.",
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
