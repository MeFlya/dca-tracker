// Pages "nom d'indice" — /etf-msci-world, /etf-sp500, /etf-nasdaq.
//
// Pourquoi : les débutants cherchent l'INDICE ("etf msci world", "etf s&p 500",
// "etf nasdaq") bien plus que les tickers (CW8, IWDA…). Ces pages captent le
// volume top-funnel et orientent vers le bon tracker + le simulateur DCA.
//
// ⚠️ YMYL : les TER/encours évoluent. Données indicatives revues 2026-06 —
// le composant affiche un disclaimer + les sources. Toujours vérifier la
// fiche officielle de l'émetteur avant d'investir.

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
    "Le MSCI World est l'indice le plus utilisé pour un DCA en ETF : ~1 500 entreprises des 23 pays développés, en un seul fonds. Trois ETF le répliquent en PEA — avec des frais qui font une vraie différence sur le long terme. Voici comment trancher.",
  whatItIs: [
    "Le MSCI World suit environ 1 500 grandes et moyennes entreprises réparties sur 23 pays développés (États-Unis, Japon, Royaume-Uni, France, Allemagne, Suisse, Canada…). Acheter un ETF MSCI World, c'est s'exposer en un seul ordre à l'économie mondiale développée.",
    "Attention à une idée reçue : le MSCI World est composé à environ 70 % d'actions américaines. Ce n'est donc pas un « anti-S&P 500 » — c'est un S&P 500 élargi au reste du monde développé. Il n'inclut PAS les marchés émergents (Chine, Inde, Brésil) ; pour ça, il faut un FTSE All-World (VWCE) ou ajouter un ETF émergents.",
  ],
  trackers: [
    {
      ticker: "CW8",
      name: "Amundi MSCI World UCITS ETF",
      issuer: "Amundi",
      isin: "LU1681043599",
      ter: "0,38 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "La référence historique du MSCI World en PEA. Plus gros encours, liquidité maximale, disponible chez tous les courtiers. Seul défaut : le TER, le plus élevé du trio.",
    },
    {
      ticker: "WPEA",
      name: "iShares Core MSCI World UCITS ETF (PEA)",
      issuer: "iShares (BlackRock)",
      isin: "IE0006WW1TQ4",
      ter: "0,20 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "Lancé en 2024, il a cassé le monopole d'Amundi avec un TER 2× plus bas que le CW8 pour le même indice. Encours en forte croissance.",
      recommended: true,
    },
    {
      ticker: "DCAM",
      name: "Amundi PEA Monde (MSCI World) UCITS ETF",
      issuer: "Amundi",
      ter: "0,20 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "Riposte d'Amundi au WPEA (2025) : même TER de 0,20 %, prix de part bas (~5 €) idéal pour un DCA mensuel de petits montants.",
    },
    {
      ticker: "IWDA",
      name: "iShares Core MSCI World UCITS ETF (Acc)",
      issuer: "iShares (BlackRock)",
      isin: "IE00B4L5Y983",
      ter: "0,20 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      note: "La référence mondiale du MSCI World, mais réplication PHYSIQUE coté en USD → non éligible PEA. À loger en compte-titres ou assurance-vie.",
    },
    {
      ticker: "VWCE",
      name: "Vanguard FTSE All-World UCITS ETF",
      issuer: "Vanguard",
      isin: "IE00BK5BQT80",
      ter: "0,22 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      note: "Va plus loin que le MSCI World : il inclut AUSSI les marchés émergents (~3 700 sociétés). Non éligible PEA. Le choix de la diversification maximale en CTO.",
    },
  ],
  verdict: [
    {
      label: "Pour un débutant en PEA",
      text: "WPEA ou DCAM (0,20 %). Même indice que le CW8, frais 2× plus bas. Sur 20 ans à 200 €/mois et 7 %/an, ces 0,18 % de TER en moins représentent environ 4 500 € de capital final en plus. Prenez DCAM si votre courtier le propose et que vous investissez de petits montants (prix de part bas).",
    },
    {
      label: "Si vous voulez le plus liquide / le plus simple",
      text: "CW8. Disponible partout, énorme encours, spreads minuscules. Le TER plus élevé est le prix de la tranquillité — acceptable si vous privilégiez la disponibilité chez votre courtier.",
    },
    {
      label: "Hors PEA (compte-titres)",
      text: "IWDA (réplication physique, sans risque de contrepartie) ou VWCE si vous voulez aussi les marchés émergents. Ces deux-là ne sont pas éligibles PEA.",
    },
  ],
  keyPoints: [
    "Même indice = même performance brute. Sur le long terme, c'est le TER qui creuse l'écart, pas le nom de l'émetteur.",
    "Les 3 ETF PEA (CW8, WPEA, DCAM) sont en réplication synthétique (swap) — c'est ce qui permet l'éligibilité PEA. Le risque de contrepartie est encadré à 10 % par la réglementation UCITS.",
    "Un seul ETF MSCI World suffit pour démarrer. Inutile de cumuler CW8 + WPEA : c'est le même indice.",
  ],
  faq: [
    {
      q: "Quel est le meilleur ETF MSCI World pour un PEA en 2026 ?",
      a: "Pour une nouvelle position, WPEA (iShares) ou DCAM (Amundi) sont les meilleurs choix : TER de 0,20 % contre 0,38 % pour le CW8, pour exactement le même indice MSCI World. Le CW8 reste pertinent si vous privilégiez la liquidité maximale ou s'il est le seul disponible chez votre courtier.",
    },
    {
      q: "CW8, WPEA ou DCAM : quelle vraie différence ?",
      a: "Ils répliquent tous le MSCI World et sont éligibles PEA en réplication synthétique. WPEA (iShares) et DCAM (Amundi) ont un TER de 0,20 %, contre 0,38 % pour le CW8. DCAM a un prix de part plus bas (~5 €), pratique pour un DCA de petits montants. CW8 a la plus grande antériorité et liquidité.",
    },
    {
      q: "Le MSCI World inclut-il les marchés émergents ?",
      a: "Non. Le MSCI World ne couvre que les 23 pays développés. Pour inclure la Chine, l'Inde, le Brésil, etc., il faut un ETF FTSE All-World (VWCE, non PEA) ou ajouter un ETF marchés émergents (AEEM, éligible PEA) en complément.",
    },
    {
      q: "Pourquoi IWDA n'est-il pas éligible PEA ?",
      a: "IWDA est un ETF à réplication physique coté en dollars : il détient réellement les actions américaines et internationales, ce qui le rend incompatible avec les règles du PEA (qui exige 75 % d'actifs européens ou une réplication synthétique conforme). IWDA se loge en compte-titres ou assurance-vie.",
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
    { label: "Amundi MSCI World UCITS ETF — fiche officielle", url: "https://www.amundietf.fr/fr/particuliers", publisher: "Amundi ETF" },
    { label: "iShares Core MSCI World — fiche officielle", url: "https://www.ishares.com/fr/individual/fr", publisher: "BlackRock — iShares" },
    { label: "MSCI World Index — méthodologie", url: "https://www.msci.com/indexes/index/990100", publisher: "MSCI Inc." },
    { label: "Plan d'Épargne en Actions — éligibilité", url: "https://www.service-public.fr/particuliers/vosdroits/F2385", publisher: "service-public.fr" },
  ],
  publishedAt: "2026-06-02",
  updatedAt: "2026-06-02",
  readingMinutes: 7,
};

// ─── S&P 500 ──────────────────────────────────────────────────────────────────

const SP500: IndexGuide = {
  slug: "etf-sp500",
  indexName: "S&P 500",
  icon: "Landmark",
  simulator: { monthly: 200, years: 20, returnPct: 8, feesPct: 0.15 },
  allocationTicker: "500",
  metaTitle: "ETF S&P 500 en PEA : lequel choisir en 2026 ?",
  metaDescription:
    "ETF S&P 500 éligible PEA : ESE (0,15 %, le plus liquide), PSP5 (0,12 %, le moins cher), PE500 (ESG). Comparatif clair des frais + simulateur DCA pour bien choisir.",
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
      ticker: "ESE",
      name: "BNP Paribas Easy S&P 500 UCITS ETF",
      issuer: "BNP Paribas",
      isin: "FR0011550185",
      ter: "0,15 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "Le plus liquide des S&P 500 PEA, gros encours, prix de part accessible (~30 €) idéal pour un DCA mensuel. Le choix par défaut pour la majorité des débutants.",
      recommended: true,
    },
    {
      ticker: "PSP5",
      name: "Amundi PEA S&P 500 UCITS ETF",
      issuer: "Amundi",
      isin: "FR0013412285",
      ter: "0,12 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "Le TER le plus bas du marché pour un S&P 500 PEA. Suit le S&P 500 classique. Excellent si votre courtier le propose et que vous optimisez les frais à fond.",
    },
    {
      ticker: "PE500",
      name: "Amundi PEA S&P 500 ESG UCITS ETF",
      issuer: "Amundi",
      ter: "0,25 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "Version ESG : suit un S&P 500 filtré des controverses. Plus cher (0,25 %), à choisir uniquement si le filtre ESG compte pour vous.",
    },
    {
      ticker: "CSPX",
      name: "iShares Core S&P 500 UCITS ETF (Acc)",
      issuer: "iShares (BlackRock)",
      isin: "IE00B5BMR087",
      ter: "0,07 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      note: "TER imbattable (0,07 %) et réplication physique, mais coté en USD → non éligible PEA. La référence pour un S&P 500 en compte-titres.",
    },
    {
      ticker: "VUSA",
      name: "Vanguard S&P 500 UCITS ETF",
      issuer: "Vanguard",
      isin: "IE00B3XXRP09",
      ter: "0,07 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      note: "Équivalent Vanguard du CSPX, version distribuante existante. Non éligible PEA. Pour un CTO.",
    },
  ],
  verdict: [
    {
      label: "Pour un débutant en PEA",
      text: "ESE (BNP Paribas, 0,15 %). Le plus liquide, prix de part accessible, disponible chez la plupart des courtiers. C'est le choix « sans prise de tête » pour démarrer un DCA S&P 500 en PEA.",
    },
    {
      label: "Pour optimiser les frais au maximum",
      text: "PSP5 (Amundi, 0,12 %). Le TER le plus bas pour un S&P 500 PEA. La différence avec l'ESE est minime (0,03 %), mais sur 30 ans chaque point compte. À prendre si votre courtier le propose.",
    },
    {
      label: "Hors PEA (compte-titres)",
      text: "CSPX ou VUSA (0,07 %, réplication physique). Deux fois moins chers que les versions PEA et sans risque de contrepartie — mais réservés au CTO, pas au PEA.",
    },
  ],
  keyPoints: [
    "Le S&P 500 est déjà inclus à ~70 % dans un MSCI World. Choisir le S&P 500 pur, c'est parier sur la poursuite de la domination américaine.",
    "En PEA, tous les ETF S&P 500 sont synthétiques (swap) — c'est obligatoire pour l'éligibilité. Le risque de contrepartie est encadré par la réglementation UCITS.",
    "Concentration sur un seul pays = volatilité un peu plus élevée qu'un indice mondial. À assumer en connaissance de cause.",
  ],
  faq: [
    {
      q: "Quel est le meilleur ETF S&P 500 pour un PEA ?",
      a: "Pour la majorité des débutants, ESE (BNP Paribas Easy S&P 500, TER 0,15 %) est le meilleur choix : très liquide, prix de part accessible, disponible partout. Si vous voulez le TER absolu le plus bas, PSP5 (Amundi, 0,12 %) est légèrement moins cher.",
    },
    {
      q: "Peut-on vraiment mettre un S&P 500 dans un PEA ?",
      a: "Oui, via des ETF à réplication synthétique (swap) comme ESE, PSP5 ou PE500. Le fonds n'achète pas directement les actions américaines : il échange la performance du S&P 500 contre un panier d'actions européennes. C'est légal, courant, et encadré par la réglementation UCITS.",
    },
    {
      q: "Pourquoi CSPX est-il moins cher (0,07 %) mais pas éligible PEA ?",
      a: "CSPX est en réplication physique et coté en dollars : il détient réellement les actions américaines, ce qui est incompatible avec le PEA. Son TER plus bas (0,07 %) est réservé au compte-titres. En PEA, la réplication synthétique impose un coût légèrement supérieur (0,12-0,15 %).",
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
    { label: "Amundi PEA S&P 500 — fiche", url: "https://www.amundietf.fr/fr/particuliers", publisher: "Amundi ETF" },
    { label: "S&P 500 — méthodologie de l'indice", url: "https://www.spglobal.com/spdji/fr/indices/equity/sp-500/", publisher: "S&P Dow Jones Indices" },
    { label: "Plan d'Épargne en Actions — éligibilité", url: "https://www.service-public.fr/particuliers/vosdroits/F2385", publisher: "service-public.fr" },
  ],
  publishedAt: "2026-06-02",
  updatedAt: "2026-06-02",
  readingMinutes: 7,
};

// ─── NASDAQ 100 ───────────────────────────────────────────────────────────────

const NASDAQ: IndexGuide = {
  slug: "etf-nasdaq",
  indexName: "Nasdaq 100",
  icon: "Cpu",
  simulator: { monthly: 200, years: 20, returnPct: 9, feesPct: 0.3 },
  allocationTicker: "ANX",
  metaTitle: "ETF Nasdaq 100 en PEA : lequel choisir en 2026 ?",
  metaDescription:
    "ETF Nasdaq 100 éligible PEA : PUST (Amundi, la référence), PNAS (fractionné pour le DCA), PANX (ESG). Frais, éligibilité et choix selon votre profil + simulateur DCA.",
  h1: "ETF Nasdaq 100 : lequel choisir pour votre PEA ?",
  eyebrow: "Guide ETF · indice tech",
  subtitle:
    "Le Nasdaq 100 regroupe les 100 plus grandes valeurs technologiques américaines. Plus performant mais plus volatil que le S&P 500. En PEA, l'accès passe presque exclusivement par Amundi. Voici le guide.",
  whatItIs: [
    "Le Nasdaq 100 réunit les 100 plus grandes entreprises non-financières cotées au Nasdaq, très majoritairement technologiques (Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla…). C'est l'indice de la « tech » américaine.",
    "Conséquence : un potentiel de performance supérieur sur les phases de croissance tech, mais une volatilité nettement plus forte que le S&P 500 ou le MSCI World, et une concentration sectorielle extrême. À réserver à une part de votre portefeuille, pas à la totalité.",
  ],
  trackers: [
    {
      ticker: "PUST",
      name: "Amundi PEA Nasdaq-100 UCITS ETF (Acc)",
      issuer: "Amundi",
      isin: "FR0011871110",
      ter: "0,30 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "LA référence du Nasdaq-100 en PEA : le seul à répliquer fidèlement l'indice classique tout en étant éligible PEA. Encours > 700 M€.",
      recommended: true,
    },
    {
      ticker: "PNAS",
      name: "Amundi PEA Nasdaq-100 — part fractionnée",
      issuer: "Amundi",
      ter: "0,30 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "Même fonds que le PUST, mais prix de part très bas (~5 €) : idéal pour un DCA mensuel de petits montants sans laisser de cash dormant.",
    },
    {
      ticker: "PANX",
      name: "Amundi PEA Nasdaq ESG UCITS ETF",
      issuer: "Amundi",
      ter: "0,30 %",
      replication: "Synthétique",
      envelope: "PEA + CTO",
      pea: true,
      note: "⚠️ Ne suit PAS le Nasdaq-100 classique mais un indice ESG (Solactive ISS ESG US Tech 100). Composition différente — à choisir seulement si le filtre ESG vous importe.",
    },
    {
      ticker: "CNDX",
      name: "iShares Nasdaq 100 UCITS ETF (Acc)",
      issuer: "iShares (BlackRock)",
      isin: "IE00B53SZB19",
      ter: "0,30 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      note: "Réplication physique du Nasdaq-100, coté en USD → non éligible PEA. La référence pour un Nasdaq en compte-titres.",
    },
    {
      ticker: "QQQ",
      name: "Invesco QQQ Trust",
      issuer: "Invesco",
      ter: "0,20 %",
      replication: "Physique",
      envelope: "CTO / AV",
      pea: false,
      note: "L'ETF Nasdaq-100 le plus connu au monde, mais coté aux États-Unis : difficilement accessible aux particuliers européens (réglementation PRIIPs). Réservé aux profils avancés en CTO.",
    },
  ],
  verdict: [
    {
      label: "Pour un PEA",
      text: "PUST (Amundi, 0,30 %) — c'est essentiellement le seul choix sérieux pour un Nasdaq-100 classique en PEA. Si vous faites un DCA de petits montants, prenez la part fractionnée PNAS (même fonds, prix de part ~5 €).",
    },
    {
      label: "Attention au piège ESG",
      text: "Ne confondez pas PUST (Nasdaq-100 classique) et PANX (indice ESG différent). Pour répliquer le vrai Nasdaq-100, c'est PUST/PNAS.",
    },
    {
      label: "Hors PEA (compte-titres)",
      text: "CNDX (iShares, physique). Le QQQ américain est mieux connu mais difficilement accessible aux particuliers européens — privilégiez le CNDX en CTO.",
    },
  ],
  keyPoints: [
    "Le Nasdaq 100 est plus performant ET plus volatil que le S&P 500. Concentration tech extrême : c'est un pari sectoriel, pas un fonds « tout-terrain ».",
    "En PEA, l'offre se résume quasiment à Amundi (PUST / PNAS). Peu de concurrence, donc un TER de 0,30 % qui ne baisse pas comme sur le MSCI World.",
    "Bonne pratique : le Nasdaq en satellite (10-20 % du portefeuille), un MSCI World ou S&P 500 en cœur. Tout miser sur le Nasdaq augmente fortement le risque.",
  ],
  faq: [
    {
      q: "Quel est le meilleur ETF Nasdaq 100 pour un PEA ?",
      a: "PUST (Amundi PEA Nasdaq-100, TER 0,30 %) est la référence et quasiment le seul à répliquer fidèlement le Nasdaq-100 classique en PEA. Pour un DCA de petits montants, la part fractionnée PNAS (même fonds, ~5 € la part) est plus pratique.",
    },
    {
      q: "PUST ou PANX : quelle différence ?",
      a: "PUST suit le Nasdaq-100 classique. PANX suit un indice ESG différent (Solactive ISS ESG US Tech 100), avec une composition qui n'est pas identique au Nasdaq-100. Si vous voulez répliquer le vrai Nasdaq-100, choisissez PUST (ou PNAS), pas PANX.",
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
  updatedAt: "2026-06-02",
  readingMinutes: 6,
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const INDEX_GUIDES: Record<string, IndexGuide> = {
  "etf-msci-world": MSCI_WORLD,
  "etf-sp500": SP500,
  "etf-nasdaq": NASDAQ,
};

export const INDEX_GUIDE_LIST: IndexGuide[] = Object.values(INDEX_GUIDES);
