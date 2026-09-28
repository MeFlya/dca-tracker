// Per-ETF editorial content — longer-form copy for the detail pages.
// Kept separate from etf-config.ts which holds the mechanical/structural data.
// TODO (premium): Move to a headless CMS for non-technical editing.
//
// ─── Correction du 28/09/2026 ────────────────────────────────────────────────
// Tout ce fichier a été relu contre la table de vérité ETF du 28/09/2026
// (émetteurs d'un côté, justETF / Boursorama / Euronext de l'autre). Il
// présentait 500, ANX et AEEM comme éligibles au PEA — « seule solution »,
// « unique ETF PEA-éligible » — alors que les reportings Amundi du 31/08/2026
// les donnent « Compte-titres, Assurance-vie ». PCEU était décrit sur le mauvais
// indice (STOXX Europe 600 au lieu du MSCI Europe). Les classements invérifiables
// (« n°1 européen », « le moins cher d'Europe », « le plus grand émetteur ») ont
// été retirés : on n'a vérifié que notre sélection, pas le marché entier.
// Les rendus sont en texte brut : pas de **gras** Markdown, il s'affichait tel
// quel (astérisques visibles) sur la fiche RS2K.

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
  // CW8 — corrigé le 28/09/2026 : il se disait « un des ETF monde les moins
  // chers éligibles PEA ». Faux dans notre propre catalogue : WPEA et DCAM
  // suivent le même MSCI World dans le PEA pour 0,20 %, contre 0,38 %.
  CW8: {
    whatItTracks: `Le CW8 réplique l'indice MSCI World, un indice de référence mondial qui regroupe environ 1 500 actions de grandes et moyennes capitalisations dans 23 pays développés. Les États-Unis représentent la plus grande part (environ 65 %), suivis de l'Europe (autour de 20 %) et du Japon (environ 6 %). Cet indice exclut les marchés émergents comme la Chine, l'Inde ou le Brésil.

Amundi utilise une réplication synthétique par swap pour répliquer cet indice tout en rendant l'ETF éligible au Plan d'Épargne en Actions (PEA). Concrètement, le fonds ne détient pas directement les actions du MSCI World, mais conclut un contrat d'échange (swap) avec une contrepartie bancaire qui s'engage à délivrer la performance de l'indice. Le risque de contrepartie est réglementairement plafonné à 10 % de l'actif net.

Les dividendes versés par les entreprises de l'indice ne sont pas distribués aux porteurs de parts : ils sont réinvestis automatiquement dans le fonds, augmentant mécaniquement la valeur de la part (politique capitalisante). C'est particulièrement efficace sur le long terme grâce à l'effet des intérêts composés.

Ses frais (0,38 % par an) sont les plus élevés des MSCI World éligibles PEA de notre sélection : le WPEA (iShares) et le DCAM (Amundi) suivent le même indice, dans la même enveloppe, pour 0,20 %.`,
    whyChooseIt: [
      "Éligible PEA — bénéficiez de la fiscalité avantageuse du plan d'épargne en actions après 5 ans de détention",
      "Politique capitalisante — les dividendes sont réinvestis sans intervention, idéal pour l'investissement passif long terme",
    ],
    watchOut: [
      "Frais de 0,38 % par an : près du double du WPEA et du DCAM (0,20 %), qui suivent le même MSCI World dans le PEA",
      "Réplication synthétique (swap) : introduit un risque de contrepartie résiduel, même s'il est encadré réglementairement",
      "Pas d'exposition aux marchés émergents (Chine, Inde, Brésil…) qui représentent une part croissante de l'économie mondiale",
      "Forte concentration sur les actions américaines (~65 %), ce qui peut amplifier l'impact d'une correction aux États-Unis",
    ],
    suitableFor:
      "Pour un investisseur qui veut un ETF monde capitalisant éligible PEA, en DCA sur le long terme sans gestion active. Sur le même indice et dans la même enveloppe, WPEA et DCAM coûtent 0,20 % au lieu de 0,38 %.",
    suggestedReturn: 7,
  },

  // WPEA — ajouté le 28/09/2026, faits tirés de la table de vérité uniquement.
  WPEA: {
    whatItTracks: `Le WPEA réplique l'indice MSCI World — les grandes et moyennes entreprises des pays développés, sans les pays émergents — dans le cadre du PEA. C'est un fonds iShares (BlackRock) lancé le 26 mars 2024 et coté à Paris depuis le 3 avril 2024. Son encours atteignait environ 2,1 milliards d'euros fin août 2026.

Comme le CW8, il passe par une réplication synthétique (swap) : le fonds détient un panier d'actions qui le rend éligible au PEA, et un contrat d'échange avec une banque lui verse la performance du MSCI World. Même indice, même enveloppe, mais des frais de 0,20 % par an contre 0,38 % pour le CW8.

Il est capitalisant : les dividendes sont réinvestis dans le fonds. Une part vaut moins de 10 €, ce qui permet d'investir un petit montant chaque mois sans reste inutilisé.`,
    whyChooseIt: [
      "Éligible PEA, sur le MSCI World",
      "Frais de 0,20 % par an, contre 0,38 % pour le CW8 sur le même indice",
      "Part à moins de 10 € : un versement mensuel modeste s'investit presque entièrement",
      "Capitalisant — les dividendes sont réinvestis automatiquement",
    ],
    watchOut: [
      "Réplication synthétique (swap) : risque de contrepartie résiduel, encadré par la réglementation UCITS",
      "Historique court : coté à Paris seulement depuis avril 2024",
      "Pas d'exposition aux marchés émergents — l'équivalent PEA pour les ajouter est PAEEM",
      "Forte part des États-Unis dans l'indice, comme tout MSCI World",
    ],
    suitableFor:
      "Pour un investisseur qui veut le MSCI World dans un PEA au coût le plus bas de notre sélection (0,20 %, à égalité avec le DCAM), en versements réguliers.",
    suggestedReturn: 7,
  },

  // PUST — ajouté le 28/09/2026, faits tirés de la table de vérité uniquement.
  PUST: {
    whatItTracks: `Le PUST (Amundi PEA Nasdaq-100) réplique l'indice Nasdaq-100 — les 100 plus grandes entreprises non financières cotées au Nasdaq, très orientées technologie — dans le cadre du PEA. Son encours atteignait environ 1,2 milliard d'euros au 31 août 2026.

Comme les autres ETF qui logent un indice américain dans le PEA, il passe par une réplication synthétique (swap) : le fonds détient un panier d'actions qui le rend éligible, et un contrat d'échange lui verse la performance du Nasdaq-100. Ses frais sont de 0,30 % par an ; il est capitalisant.

Ce n'est pas le seul Nasdaq-100 éligible au PEA. Et l'ANX, l'autre Nasdaq-100 d'Amundi, ne l'est pas du tout : vérifiez l'ISIN (FR0011871110) avant de passer l'ordre.`,
    whyChooseIt: [
      "Éligible PEA, sur le Nasdaq-100",
      "Capitalisant — les dividendes sont réinvestis automatiquement",
      "Encours d'environ 1,2 milliard d'euros (31 août 2026)",
    ],
    watchOut: [
      "Indice très concentré : une centaine de valeurs, dominées par quelques géants de la technologie",
      "Frais de 0,30 % par an : plus que WPEA et DCAM (0,20 %) sur le MSCI World, ou que SPEA et PSP5 (0,10 et 0,12 %) sur le S&P 500",
      "Réplication synthétique (swap) : risque de contrepartie résiduel, encadré par la réglementation UCITS",
      "Ne pas confondre avec l'ANX d'Amundi, non éligible au PEA",
    ],
    suitableFor:
      "Pour ajouter, en part minoritaire, une exposition technologique américaine à un portefeuille PEA déjà diversifié — pas pour en faire le cœur.",
    suggestedReturn: 7,
  },

  // DCAM — ajouté le 28/09/2026, faits tirés de la table de vérité uniquement.
  DCAM: {
    whatItTracks: `Le DCAM (Amundi PEA Monde) réplique l'indice MSCI World — les grandes et moyennes entreprises des pays développés, sans les pays émergents — dans le cadre du PEA. Lancé le 4 mars 2025, il comptait environ 1,4 milliard d'euros d'encours au 31 août 2026.

C'est le même émetteur que le CW8 (Amundi) et le même indice, pour des frais de 0,20 % par an au lieu de 0,38 %. Il est capitalisant : les dividendes sont réinvestis dans le fonds.

Une part vaut moins de 10 €, ce qui permet d'investir un petit montant chaque mois sans reste inutilisé.`,
    whyChooseIt: [
      "Éligible PEA, sur le MSCI World",
      "Frais de 0,20 % par an — le même indice que le CW8, chez le même émetteur, pour environ moitié moins de frais",
      "Part à moins de 10 € : un versement mensuel modeste s'investit presque entièrement",
      "Capitalisant — les dividendes sont réinvestis automatiquement",
    ],
    watchOut: [
      "Historique court : lancé en mars 2025",
      "Pas d'exposition aux marchés émergents — l'équivalent PEA pour les ajouter est PAEEM",
      "Forte part des États-Unis dans l'indice, comme tout MSCI World",
    ],
    suitableFor:
      "Pour un investisseur qui veut le MSCI World dans un PEA au coût le plus bas de notre sélection (0,20 %, à égalité avec le WPEA), en versements réguliers.",
    suggestedReturn: 7,
  },

  // IWDA = iShares Core MSCI World UCITS ETF (ISIN IE00B4L5Y983), listing
  // Amsterdam. Concurrent direct du CW8 sur le marché français — même
  // indice, méthode différente. Corrigé le 28/09/2026 : ce commentaire disait
  // le contenu « hérité de l'ancienne entrée EWLD […] même type d'ETF (iShares
  // MSCI World physique) ». Faux d'après la table de vérité : EWLD est un fonds
  // Amundi à swap, part distribuante du fonds de CW8, éligible PEA.
  IWDA: {
    whatItTracks: `L'IWDA réplique le même indice MSCI World que le CW8, mais avec une méthode de réplication physique optimisée. Contrairement à la réplication synthétique par swap, l'ETF détient directement un sous-ensemble représentatif des actions composant l'indice (réplication par échantillonnage). iShares est la branche ETF de BlackRock.

La réplication physique signifie que le fonds possède réellement des parts d'entreprises comme Apple, Microsoft, LVMH ou Toyota. Cela élimine le risque de contrepartie propre aux swaps, au prix d'une légère imperfection de tracking (l'ETF ne détient pas forcément tous les titres de l'indice).

L'IWDA est également capitalisant, mais il n'est PAS éligible au PEA : c'est un fonds à réplication physique investi majoritairement hors Union européenne (ISIN irlandais IE00B4L5Y983), ce qui ne satisfait pas le quota de 75 % d'actions UE exigé par le PEA. Il se loge donc en CTO ou en assurance-vie. Son TER (0,20 %) est inférieur à celui du CW8 (0,38 %) et égal à celui du WPEA et du DCAM, qui eux sont éligibles au PEA.`,
    whyChooseIt: [
      "Réplication physique — le fonds détient réellement des actions, éliminant le risque de contrepartie des swaps",
      "TER de 0,20 %, inférieur au CW8 (0,38 %)",
      "iShares (BlackRock) : grande transparence sur les titres détenus",
    ],
    watchOut: [
      "Non éligible PEA — à loger en CTO (PFU 31,4 % sur les gains) ou assurance-vie ; pour le MSCI World dans un PEA : WPEA, DCAM ou CW8",
      "L'écart de suivi réel peut dépasser le TER affiché selon les conditions de marché (réplication par échantillonnage)",
      "Coté sur Euronext Amsterdam (et non Paris) — vérifiez les frais de place de votre courtier",
    ],
    suitableFor:
      "Convient aux investisseurs qui préfèrent la réplication physique pour des raisons de transparence ou d'aversion au risque de contrepartie, dans le cadre d'un CTO ou d'une assurance-vie — typiquement une fois le PEA plafonné. Pour un cœur de portefeuille en PEA, les ETF World synthétiques (WPEA, DCAM, CW8) sont ceux qui y sont éligibles.",
    suggestedReturn: 7,
  },

  // VWCE — corrigé le 28/09/2026 : TER 0,22 % périmé, 0,14 % d'après la table.
  VWCE: {
    whatItTracks: `Le VWCE réplique l'indice FTSE All-World, qui couvre environ 3 700 entreprises dans 49 pays, incluant à la fois les marchés développés et les marchés émergents (Chine, Inde, Brésil, Taïwan, Corée du Sud…). C'est l'une des expositions les plus larges disponibles en un seul ETF.

Par rapport au MSCI World (développés uniquement), le FTSE All-World ajoute une pondération d'environ 10–12 % sur les marchés émergents. Ces marchés présentent un potentiel de croissance plus élevé à long terme, mais aussi une volatilité et des risques politiques supérieurs. La Chine représente généralement entre 3 et 4 % de l'indice.

Vanguard, le gestionnaire, est fondé sur un modèle coopératif : ses fonds appartiennent à leurs investisseurs, ce qui l'incite structurellement à minimiser les frais. Le VWCE utilise une réplication physique optimisée et réinvestit les dividendes (politique capitalisante).`,
    whyChooseIt: [
      "Diversification maximale en un seul ETF — pays développés ET émergents",
      "Vanguard : pionnier de l'investissement passif à bas coût, connu pour son alignement d'intérêts avec les investisseurs",
      "Réplication physique — transparence et absence de risque de contrepartie",
      "Frais de 0,14 % par an pour une couverture aussi large",
    ],
    watchOut: [
      "Non éligible PEA (enregistré en Irlande sans structure swap) — à loger en compte-titres ordinaire ou assurance-vie. Pour le monde entier dans un PEA : GPEA (Amundi PEA Global, MSCI ACWI, 0,30 %), ou un MSCI World (WPEA, DCAM, CW8) complété par PAEEM",
      "Exposition aux marchés émergents : volatilité plus élevée, risques de gouvernance et de liquidité",
      "La pondération par capitalisation boursière surpondère les États-Unis (~60 %) malgré une couverture mondiale",
    ],
    suitableFor:
      "Pour un investisseur qui veut une exposition véritablement mondiale en un seul ETF, incluant les marchés émergents, hors PEA. Un seul ETF suffit alors à tout le portefeuille actions.",
    suggestedReturn: 7,
  },

  // SPY — hors table de vérité du 28/09/2026. Classements retirés ce jour-là
  // (« le plus échangé au monde », « parmi les moins chers de l'univers ETF ») :
  // rien ne permet de les recouper.
  SPY: {
    whatItTracks: `Le SPY réplique le S&P 500, l'indice de référence des 500 plus grandes entreprises américaines cotées. Créé en 1993 par State Street Global Advisors, il est très liquide.

Le S&P 500 couvre environ 80 % de la capitalisation boursière américaine. Il est fortement concentré sur la technologie : les dix premières positions (Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla, Berkshire Hathaway, JPMorgan, Broadcom) représentent à elles seules plus de 35 % de l'indice.

Contrairement aux ETF UCITS européens, le SPY est un trust américain. Il distribue trimestriellement les dividendes versés par les entreprises du S&P 500, ce qui génère un événement fiscal à chaque distribution pour les investisseurs résidents en France.

Surtout, un particulier résidant dans l'Union européenne ne peut en principe pas l'acheter. Le règlement européen PRIIPs impose un document d'informations clés (DIC) pour vendre un fonds à un particulier ; State Street ne le publie pas pour le SPY, et les courtiers de l'UE refusent donc l'ordre. Pour le S&P 500, il faut passer par un ETF UCITS : CSPX ou VUSA en compte-titres, PSP5, SPEA ou ESE dans un PEA.`,
    whyChooseIt: [
      "Très liquide — spreads très faibles",
      "Frais bas (TER 0,0945 %)",
      "Référence : le S&P 500 est l'indice contre lequel se mesure la quasi-totalité de la gestion active mondiale",
      "Historique de performance long (depuis 1993) et très documenté",
    ],
    watchOut: [
      "Exposition 100 % américaine — risque de concentration géographique important en cas de correction durable aux États-Unis",
      "Distribuant : les dividendes sont versés trimestriellement, à déclarer et fiscaliser chaque année en France (flat tax 31,4 %)",
      "Pas de DIC : en principe inaccessible à un particulier de l'UE, en PEA comme en compte-titres. Équivalents UCITS : CSPX ou VUSA (compte-titres), PSP5, SPEA ou ESE (PEA)",
      "Libellé en USD — exposition au risque de change EUR/USD pour un investisseur européen",
    ],
    suitableFor:
      "Une référence plus qu'un placement pour un particulier en France : c'est le S&P 500 dont on cite la performance. Pour s'y exposer, l'un des équivalents UCITS ci-dessus fait le même travail et s'achète chez un courtier français.",
    suggestedReturn: 8,
  },

  // 500 = Amundi S&P 500 Swap UCITS ETF EUR Acc (ISIN LU1681048804).
  // Corrigé le 28/09/2026 : la fiche en faisait « la seule solution
  // PEA-éligible » et « le seul moyen d'investir sur le S&P 500 » dans un PEA.
  // Double faute d'après la table de vérité : ce fonds n'est PAS éligible PEA
  // (reporting Amundi du 31/08/2026 : « Compte-titres, Assurance-vie »), et
  // PSP5, SPEA et ESE le sont. L'ancien commentaire (contenu « hérité de SP5,
  // même fonds simplement renommé ») n'est pas confirmé par la table ; retiré.
  "500": {
    whatItTracks: `Le 500 réplique le S&P 500, l'indice des 500 plus grandes entreprises américaines cotées, par réplication synthétique : l'ETF ne détient pas directement les actions américaines, il conclut un contrat d'échange (swap) avec une contrepartie bancaire qui lui verse la performance de l'indice. Ses frais sont de 0,15 % par an.

Il n'est PAS éligible au PEA. Le reporting d'Amundi au 31 août 2026 est explicite : « Éligibilité : Compte-titres, Assurance-vie ». Pour le S&P 500 dans un PEA, les équivalents sont le PSP5 (Amundi PEA S&P 500, 0,12 %), le SPEA (iShares, 0,10 %) et l'ESE (BNP Paribas Easy, 0,14 %).

Le S&P 500 est l'indice de référence de la gestion d'actifs mondiale. Il couvre environ 80 % de la capitalisation boursière américaine et surpondère fortement la technologie : les dix premières positions (Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla, Berkshire Hathaway, JPMorgan, Broadcom) représentent plus de 35 % de l'indice.`,
    whyChooseIt: [
      "Coté à Paris, en euros",
      "Capitalisant — les dividendes sont réinvestis automatiquement",
      "Frais de 0,15 % par an",
    ],
    watchOut: [
      "NON éligible au PEA — compte-titres ou assurance-vie seulement. Pour le S&P 500 en PEA : PSP5 (0,12 %), SPEA (0,10 %) ou ESE (0,14 %)",
      "Hors PEA, pas le moins cher de notre sélection : CSPX et VUSA suivent le S&P 500 pour 0,07 %",
      "Réplication synthétique : risque de contrepartie résiduel, encadré à 10 % de l'actif net par la réglementation UCITS",
      "Exposition 100 % américaine, très sensible aux valorisations de la tech US",
    ],
    suitableFor:
      "Pour un compte-titres ou une assurance-vie qui propose ce fonds et un investisseur qui veut le S&P 500 coté à Paris en euros. Dans un PEA, il faut passer par PSP5, SPEA ou ESE.",
    suggestedReturn: 8,
  },

  // PSP5 — ajouté le 28/09/2026, faits tirés de la table de vérité uniquement.
  PSP5: {
    whatItTracks: `Le PSP5 (Amundi PEA S&P 500) réplique le S&P 500, l'indice des 500 plus grandes entreprises américaines cotées, et il est éligible au PEA. C'est l'équivalent PEA du « 500 » d'Amundi, qui, lui, ne l'est pas.

Ses frais sont de 0,12 % par an. Il est capitalisant : les dividendes sont réinvestis dans le fonds.

Le S&P 500 couvre environ 80 % de la capitalisation boursière américaine et surpondère fortement la technologie : les dix premières positions représentent plus de 35 % de l'indice.`,
    whyChooseIt: [
      "Éligible PEA, sur le S&P 500",
      "Frais de 0,12 % par an",
      "Capitalisant — les dividendes sont réinvestis automatiquement",
    ],
    watchOut: [
      "Pas le S&P 500 éligible PEA le moins cher de notre sélection : le SPEA (iShares) est à 0,10 %",
      "Exposition 100 % américaine — forte concentration géographique et sectorielle (technologie)",
    ],
    suitableFor:
      "Pour un investisseur qui veut le S&P 500 dans un PEA, seul ou en complément d'un MSCI World pour renforcer la part américaine.",
    suggestedReturn: 8,
  },

  // ANX — corrigé le 28/09/2026 : la fiche le présentait comme « la seule
  // solution » et « l'unique ETF PEA-éligible » sur le Nasdaq-100. Faux d'après
  // la table de vérité : ANX n'est PAS éligible PEA (reporting Amundi du
  // 31/08/2026 : « Compte-titres, Assurance-vie ») ; PUST, lui, l'est.
  ANX: {
    whatItTracks: `L'ANX réplique le Nasdaq-100, l'indice des 100 plus grandes entreprises non financières du Nasdaq, massivement orienté technologie (Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla, Broadcom, Costco, Netflix). Il passe par une réplication synthétique (swap) et coûte 0,23 % par an.

Il n'est PAS éligible au PEA : le reporting d'Amundi au 31 août 2026 indique « Éligibilité : Compte-titres, Assurance-vie ». Pour le Nasdaq-100 dans un PEA, l'équivalent de notre sélection est le PUST (Amundi PEA Nasdaq-100, 0,30 %) — et ce n'est pas le seul Nasdaq-100 éligible.

Le Nasdaq-100 a fortement progressé sur les vingt dernières années, mais c'est aussi l'un des indices les plus volatils. Ses corrections peuvent être brutales : -35 % en 2022, -80 % sur la bulle internet de 2000–2003.`,
    whyChooseIt: [
      "Exposition directe à la tech américaine (IA, cloud, semi-conducteurs…)",
      "Coté à Paris, en euros",
      "Capitalisant — les dividendes sont réinvestis automatiquement",
      "Frais de 0,23 % par an",
    ],
    watchOut: [
      "NON éligible au PEA — compte-titres ou assurance-vie seulement. Pour le Nasdaq-100 en PEA : PUST (0,30 %)",
      "Volatilité très élevée — le Nasdaq-100 peut perdre 30–50 % lors des cycles baissiers. Horizon minimum recommandé : 10–15 ans",
      "Concentration sectorielle extrême : technologie ~60 %, sensible aux rotations de taux et aux changements de sentiment sur la croissance",
      "Réplication synthétique — risque de contrepartie, même si encadré réglementairement",
    ],
    suitableFor:
      "Pour un investisseur avec une forte conviction sur la tech américaine et un horizon long (15 ans et plus), en compte-titres ou assurance-vie. À combiner avec un ETF MSCI World pour équilibrer le risque — pas comme unique ETF d'un portefeuille.",
    suggestedReturn: 9,
  },

  // PAEEM = Amundi PEA Emergent (MSCI Emerging) ESG Transition UCITS ETF Acc
  // (ISIN FR0013412020). Ajouté le 28/09/2026 : le contenu « émergents dans le
  // PEA » était accroché à AEEM, un autre fonds, non éligible. Il est déplacé
  // ici, corrigé d'après la table de vérité (TER 0,30 %, indice « ESG
  // Transition »). Les poids par pays de l'indice standard ne sont pas repris :
  // la variante ESG Transition ne les a pas forcément.
  PAEEM: {
    whatItTracks: `Le PAEEM est l'ETF émergents éligible au PEA d'Amundi. Il suit une variante « ESG Transition » de l'indice MSCI Emerging Markets : la liste des entreprises et leurs poids diffèrent donc de l'indice standard. On y retrouve les grands marchés émergents — Chine, Inde, Taïwan, Corée du Sud, Brésil…

Les émergents sont normalement hors de portée du PEA, qui impose de détenir 75 % d'actions européennes. Le PAEEM y accède par une réplication synthétique : il détient un panier d'actions éligibles et un contrat d'échange lui verse la performance de son indice. Ses frais sont de 0,30 % par an.

Les émergents offrent un potentiel de croissance long terme supérieur aux marchés développés, mais avec une volatilité et des risques spécifiques plus importants (risque politique, risque de change, gouvernance d'entreprise, liquidité).`,
    whyChooseIt: [
      "Exposition aux marchés émergents dans le PEA",
      "Complète un MSCI World (WPEA, DCAM, CW8) : développés + émergents, toujours dans le PEA",
      "Capitalisant — les dividendes sont réinvestis automatiquement",
    ],
    watchOut: [
      "Frais de 0,30 % par an — plus que l'AEEM (0,20 %), mais l'AEEM n'est pas éligible au PEA",
      "Indice « ESG Transition » : ce n'est pas le MSCI Emerging Markets standard, la performance peut s'en écarter",
      "Volatilité nettement supérieure aux marchés développés — baisses plus profondes et récupérations plus lentes",
      "Réplication synthétique avec risque de contrepartie, même encadré",
    ],
    suitableFor:
      "Pour un investisseur qui veut ajouter les marchés émergents à un MSCI World sans sortir du PEA. Une part de 10 à 20 % en émergents aux côtés d'un ETF monde est une répartition courante.",
    suggestedReturn: 7,
  },

  // AEEM = Amundi MSCI Emerging Markets Swap UCITS ETF EUR Acc (ISIN
  // LU1681045370). Corrigé le 28/09/2026 : la fiche le disait éligible PEA
  // (« une exception notable ») et « même fonds » que l'ex-PAEEM. Faux d'après
  // la table de vérité : AEEM n'est PAS éligible PEA (reporting Amundi du
  // 31/08/2026) ; PAEEM est un autre fonds (FR0013412020), lui éligible. Le
  // contenu « émergents dans le PEA » est parti sous PAEEM.
  AEEM: {
    whatItTracks: `L'AEEM réplique le MSCI Emerging Markets, l'indice de référence des marchés en développement. Il regroupe environ 1 400 entreprises dans 24 pays émergents : Chine (~27 %), Inde (~18 %), Taïwan (~15 %), Corée du Sud (~11 %), Brésil (~5 %), Arabie Saoudite, Afrique du Sud, etc. Il passe par une réplication synthétique (swap) et coûte 0,20 % par an.

Il n'est PAS éligible au PEA : le reporting d'Amundi au 31 août 2026 indique « Éligibilité : Compte-titres, Assurance-vie ». L'équivalent PEA est le PAEEM (Amundi PEA Emergent ESG Transition, 0,30 %) — un autre fonds, sur une variante de l'indice.

Les émergents offrent un potentiel de croissance long terme supérieur aux marchés développés, mais avec une volatilité et des risques spécifiques plus importants (risque politique, risque de change, gouvernance d'entreprise, liquidité).`,
    whyChooseIt: [
      "Suit le MSCI Emerging Markets standard, sans filtre",
      "Frais de 0,20 % par an",
      "Complète un MSCI World en compte-titres ou en assurance-vie : développés + émergents",
    ],
    watchOut: [
      "NON éligible au PEA — compte-titres ou assurance-vie seulement. Pour les émergents en PEA : PAEEM (0,30 %)",
      "Volatilité nettement supérieure aux marchés développés — baisses plus profondes et récupérations plus lentes",
      "Forte exposition à la Chine (~27 %) : risques réglementaires, tensions géopolitiques et délistings potentiels",
      "Réplication synthétique avec risque de contrepartie, même encadré",
    ],
    suitableFor:
      "Pour un investisseur qui veut ajouter les marchés émergents à un portefeuille hors PEA (compte-titres, assurance-vie). Dans un PEA, c'est le PAEEM qui joue ce rôle.",
    suggestedReturn: 7,
  },

  // PCEU — corrigé le 28/09/2026 : toute la fiche décrivait le STOXX Europe
  // 600 (600 valeurs, 17 pays, petites capitalisations incluses) avec un TER de
  // 0,07 %. D'après la table de vérité, PCEU suit le MSCI Europe (grandes et
  // moyennes capitalisations) et coûte 0,15 %.
  PCEU: {
    whatItTracks: `Le PCEU (Amundi PEA MSCI Europe) réplique le MSCI Europe, l'indice des grandes et moyennes capitalisations des pays développés d'Europe — zone euro, mais aussi Royaume-Uni, Suisse, Suède ou Danemark. On y trouve des groupes comme ASML, Nestlé, LVMH, SAP ou Shell. Les petites capitalisations n'y figurent pas.

La répartition sectorielle est plus équilibrée que celle du Nasdaq ou du S&P 500, avec une forte présence des valeurs financières, pharmaceutiques, industrielles et de consommation.

Il est éligible au PEA, capitalisant, et coûte 0,15 % par an.`,
    whyChooseIt: [
      "Éligible PEA — diversification géographique vers l'Europe sans perdre l'avantage fiscal",
      "Frais de 0,15 % par an",
      "Exposition large aux grandes entreprises européennes, secteurs équilibrés",
      "Diversification devise : exposition à la livre, au franc suisse et aux couronnes nordiques en plus de l'euro",
    ],
    watchOut: [
      "L'Europe affiche une performance historique inférieure aux États-Unis sur les 15 dernières années — croissance structurellement plus faible",
      "Réplication synthétique — risque de contrepartie, même encadré par la réglementation UCITS",
      "Pas de petites capitalisations : l'indice ne couvre que les grandes et moyennes entreprises",
    ],
    suitableFor:
      "Pour un investisseur qui veut diversifier son portefeuille vers l'Europe à moindre coût, ou réduire la dépendance aux marchés américains. Complète un ETF MSCI World pour surpondérer délibérément l'Europe.",
    suggestedReturn: 6,
  },

  // CSPX — corrigé le 28/09/2026 : « le moins cher d'Europe » retiré, seule
  // notre sélection a été vérifiée ; équivalents PEA ajoutés (table de vérité).
  CSPX: {
    whatItTracks: `Le CSPX réplique le S&P 500 par réplication physique complète — le fonds détient directement les 500 actions composant l'indice, dans des proportions reflétant leur poids dans le S&P 500. iShares (BlackRock) gère cet ETF domicilié en Irlande, coté à la Bourse de Londres (LSE) en USD.

Avec un TER de 0,07 %, le CSPX a les frais les plus bas de notre sélection sur le S&P 500, à égalité avec le VUSA — moins que le SPY américain (0,09 %) tout en offrant la transparence de la réplication physique. La domiciliation irlandaise bénéficie d'une convention fiscale avantageuse avec les États-Unis (retenue à la source sur dividendes de 15 % au lieu de 30 %), réduisant la friction fiscale sur les dividendes réinvestis.

Capitalisant : les dividendes ne sont pas versés mais réinvestis dans le fonds, ce qui simplifie la gestion fiscale pour l'investisseur.`,
    whyChooseIt: [
      "Frais de 0,07 % par an — les plus bas de notre sélection sur le S&P 500, à égalité avec le VUSA",
      "Réplication physique complète — transparence totale, absence de risque de contrepartie",
      "Domiciliation irlandaise : convention fiscale US-Irlande avantageuse (retenue source 15 % vs 30 %)",
      "Capitalisant — pas de dividendes à déclarer chaque année, contrairement au VUSA",
    ],
    watchOut: [
      "Non éligible PEA — à loger en CTO, PER ou assurance-vie. Pour le S&P 500 dans un PEA : PSP5, SPEA ou ESE",
      "Coté à Londres en USD — exposition au risque de change EUR/USD pour un investisseur européen",
      "100 % américain — concentration géographique importante, surpondération technologique (>30 %)",
    ],
    suitableFor:
      "Pour un investisseur qui veut le S&P 500 en réplication physique, au coût le plus bas de notre sélection, dans un CTO ou une assurance-vie. Solution de référence pour ceux qui préfèrent éviter les swaps.",
    suggestedReturn: 8,
  },

  // VUSA = Vanguard S&P 500 UCITS ETF (USD) Distributing (ISIN IE00B3XXRP09),
  // TER 0,07 %, listing Euronext Amsterdam. Corrigé le 28/09/2026 d'après la
  // table de vérité : la fiche le disait CAPITALISANT (« pas de revenus annuels
  // à déclarer ») — c'est la part DISTRIBUANTE. Elle renvoyait aussi, pour le
  // PEA, vers « l'Amundi 500 », qui n'est pas éligible. La retenue à la source
  // était donnée à « 15 % au lieu des 31,4 % » : 31,4 % est le PFU français,
  // pas une retenue américaine ; le chiffre est retiré.
  VUSA: {
    whatItTracks: `Le VUSA réplique le S&P 500 par réplication physique complète — le fonds détient directement les 500 actions composant l'indice, dans des proportions reflétant leur poids dans le S&P 500. Vanguard, le gestionnaire, est l'un des pionniers historiques de l'investissement passif. Sa structure coopérative — les fonds appartiennent à leurs investisseurs — l'incite structurellement à minimiser les frais sur la durée.

Le VUSA est domicilié en Irlande (ISIN IE00B3XXRP09), coté à Amsterdam. Avec un TER de 0,07 %, il a les mêmes frais que le CSPX d'iShares — les plus bas de notre sélection sur le S&P 500. La domiciliation irlandaise bénéficie d'une convention fiscale avec les États-Unis qui réduit la retenue à la source américaine sur les dividendes.

C'est une part distribuante : les dividendes sont versés aux porteurs. En compte-titres, ils s'ajoutent aux revenus imposables chaque année — c'est la vraie différence avec le CSPX, capitalisant.

Le S&P 500 lui-même couvre environ 80 % de la capitalisation boursière américaine. Les dix premières positions (Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla, Berkshire Hathaway, JPMorgan, Broadcom) représentent plus de 35 % de l'indice, avec une forte concentration sur la technologie (~30 % du poids).`,
    whyChooseIt: [
      "Frais de 0,07 % par an — les mêmes que le CSPX, les plus bas de notre sélection sur le S&P 500",
      "Vanguard : modèle coopératif qui aligne structurellement les intérêts du gestionnaire et des investisseurs",
      "Réplication physique complète — le fonds détient les 500 actions du S&P 500, transparence maximale",
      "Distribuant — utile pour qui veut percevoir un revenu régulier",
    ],
    watchOut: [
      "Non éligible PEA — à loger en CTO, PER ou assurance-vie. Pour le S&P 500 dans un PEA : PSP5, SPEA ou ESE",
      "Distribuant : en compte-titres, les dividendes sont imposés chaque année (PFU 31,4 %), ce qui freine l'effet des intérêts composés par rapport à un ETF capitalisant",
      "Exposition au risque de change EUR/USD pour un investisseur européen (peut amplifier ou atténuer les performances selon la parité)",
      "100 % américain — concentration géographique importante, surpondération technologique (>30 %) qui rend l'ETF sensible aux corrections du secteur",
    ],
    suitableFor:
      "Pour un investisseur qui veut le S&P 500 en réplication physique au coût le plus bas de notre sélection, dans un CTO ou une assurance-vie, et qui préfère toucher les dividendes. Pour les réinvestir automatiquement, le CSPX fait la même chose en capitalisant.",
    suggestedReturn: 8,
  },

  // RS2K = Amundi Russell 2000 UCITS ETF EUR Acc (ISIN LU1681038672), TER
  // 0,35 %, listing Euronext Paris. Corrigé le 28/09/2026 d'après la table de
  // vérité : ce commentaire donnait l'ISIN LU1681038755 (introuvable) et le
  // nom « MSCI Russell 2000 » (l'indice n'a rien à voir avec MSCI). La fiche
  // comparait son TER au « 500 Amundi » comme ETF PEA : le 500 ne l'est pas,
  // la comparaison passe par PSP5 / SPEA / ESE.
  RS2K: {
    whatItTracks: `Le RS2K réplique le Russell 2000, l'indice de référence des petites et moyennes capitalisations américaines. Il regroupe environ 2 000 entreprises dont la capitalisation se situe entre 300 millions et 2 milliards de dollars — un segment radicalement différent du S&P 500, qui ne couvre que les 500 plus grandes valeurs américaines. Là où le S&P 500 reflète les multinationales matures (Apple, Microsoft, JPMorgan), le Russell 2000 capte les entreprises en croissance, plus régionales, souvent encore en phase d'expansion.

Cet ETF d'Amundi est éligible au PEA grâce à la réplication synthétique par swap, alors que les small caps américaines sont normalement inaccessibles via cette enveloppe fiscale. Le fonds détient un portefeuille d'actions éligibles PEA et conclut un contrat d'échange avec une contrepartie bancaire qui livre la performance du Russell 2000.

Historiquement, les small caps américaines ont surperformé les large caps sur le long terme — un phénomène documenté par les chercheurs depuis les travaux de Banz (1981) et popularisé par Fama et French sous le nom de "small cap premium". Sur 30+ ans, l'écart de performance annualisé peut atteindre 1 à 2 points, ce qui se traduit par une différence considérable en cumulé. Mais ce premium n'est pas garanti : sur les 5 dernières années, le S&P 500 a largement battu le Russell 2000, principalement à cause de la concentration tech qui a tiré les large caps.

Le RS2K capitalise les dividendes (peu nombreux dans le segment small caps de toute façon) et coûte 0,35 % par an — nettement plus qu'un ETF S&P 500 éligible PEA (PSP5 à 0,12 %, SPEA à 0,10 %).`,
    whyChooseIt: [
      "Éligible PEA — exposition aux small caps américaines dans le cadre fiscal du PEA (18,6 % après 5 ans au lieu de 31,4 %)",
      "Capture le \"small cap premium\" historiquement observé sur le long terme — diversification de style en plus de la diversification sectorielle",
      "Complète un cœur MSCI World ou S&P 500 : le MSCI World ne contient que des large/mid caps, le RS2K vient ajouter le segment des petites capi US",
      "Coté sur Euronext Paris, en euros",
    ],
    watchOut: [
      "Volatilité nettement supérieure aux large caps : drawdowns plus profonds (-30 à -40 % en cas de crise contre -20 à -30 % pour le S&P 500), récupérations plus lentes",
      "Sous-performance des 5 dernières années : depuis 2020, le Russell 2000 a sous-performé le S&P 500 de plus de 30 points cumulés. Le \"small cap premium\" est un pari long terme, pas un free lunch sur 5 ans",
      "Réplication synthétique : risque de contrepartie résiduel encadré à 10 % de l'actif net par la réglementation UCITS",
      "Frais de 0,35 % par an, contre 0,10 à 0,14 % pour les ETF S&P 500 éligibles PEA (SPEA, PSP5, ESE) — pèse davantage sur la performance long terme",
      "Composition sectorielle déséquilibrée par rapport au S&P 500 : sous-représentation tech, surreprésentation des financières régionales et de l'industrie — peut amplifier les cycles économiques",
    ],
    suitableFor:
      "Pour un investisseur qui a déjà un cœur de portefeuille MSCI World ou S&P 500 dans son PEA (WPEA, DCAM, CW8, PSP5) et qui veut ajouter une diversification de style vers les small caps US. Une part de 5 à 15 % en RS2K, aux côtés d'un ETF monde, est une répartition courante chez ceux qui croient au small cap premium long terme. Pas comme unique ETF — la volatilité et la concentration géographique seraient excessives.",
    suggestedReturn: 8,
  },

  // QQQ — corrigé le 28/09/2026 d'après la table de vérité : frais de 0,18 %
  // (passés de 0,20 % à 0,18 % le 22/12/2025). Classement « deuxième ETF le
  // plus échangé aux États-Unis » retiré : non recoupé.
  QQQ: {
    whatItTracks: `Le QQQ réplique le Nasdaq-100, un indice regroupant les 100 plus grandes entreprises non-financières listées sur le Nasdaq. Il est extrêmement concentré sur la technologie et la croissance : Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Broadcom, Tesla, Costco et Netflix constituent les dix premières positions et représentent généralement plus de 50 % de l'indice.

Contrairement au S&P 500, le Nasdaq-100 exclut les valeurs financières (banques, assurances) et est délibérément biaisé vers les secteurs à forte croissance : logiciel, semi-conducteurs, e-commerce, streaming, cloud computing, intelligence artificielle. Cette concentration sectorielle explique à la fois ses performances spectaculaires sur certaines périodes et ses corrections brutales sur d'autres.

Le QQQ d'Invesco est un trust américain très échangé. Il distribue des dividendes (faibles, car les entreprises tech en versent peu) et est libellé en USD. Ses frais sont de 0,18 % par an depuis le 22 décembre 2025 (0,20 % auparavant).

Un particulier résidant dans l'Union européenne ne peut en principe pas l'acheter : le règlement européen PRIIPs impose un document d'informations clés (DIC) qu'Invesco ne publie pas pour ce fonds américain, et les courtiers de l'UE refusent donc l'ordre. Le Nasdaq-100 s'achète par un ETF UCITS : CNDX ou ANX en compte-titres, PUST dans un PEA.`,
    whyChooseIt: [
      "Exposition maximale aux secteurs technologiques américains les plus dynamiques (IA, cloud, semi-conducteurs…)",
      "Performance historique exceptionnelle sur 10–20 ans, bien supérieure aux indices monde",
      "ETF très liquide avec d'importants volumes quotidiens et des spreads très faibles",
      "Frais de 0,18 % par an",
    ],
    watchOut: [
      "Concentration sectorielle extrême (technologie ~60 %) — sensibilité élevée aux rotations sectorielles et aux cycles de taux",
      "Volatilité nettement supérieure au MSCI World : drawdowns historiques importants (-80 % en 2000–2002, -35 % en 2022)",
      "Pas de DIC : en principe inaccessible à un particulier de l'UE, en PEA comme en compte-titres. Équivalents UCITS : CNDX ou ANX (compte-titres), PUST (PEA)",
      "Libellé en USD, distribuant — implications fiscales annuelles pour les résidents français",
    ],
    suitableFor:
      "Une référence de performance plus qu'un placement pour un particulier en France. Le Nasdaq-100 lui-même se destine à un horizon long (15 ans et plus) et à une forte tolérance à la volatilité, en complément d'une exposition plus large — jamais comme unique ETF.",
    suggestedReturn: 9,
  },
};

export function getETFDetailContent(
  displaySymbol: string
): ETFDetailContent | undefined {
  return ETF_DETAIL_CONTENT[displaySymbol];
}
