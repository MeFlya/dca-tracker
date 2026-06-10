// Glossaire data-driven — termes rendus par /glossaire/[slug].
//
// Les 3 entrées historiques (dca, etf, interets-composes) restent des pages
// JSX dédiées (plus riches) : les routes statiques ont priorité sur [slug].
// Ce fichier porte les 12 entrées ajoutées en juin 2026 (AUDIT C2) — chaque
// terme = cible long-tail ("définition TER", "qu'est-ce que le PFU"…) +
// nœud de maillage interne vers les guides et outils du site.
//
// Cohérence YMYL : les chiffres (17,2 %, 30 %, 150 000 €, TER…) doivent
// rester alignés avec /pea-ou-cto, /etf-msci-world et les comparatifs.

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
};

export const GLOSSARY_TERMS: Record<string, GlossaryTerm> = {
  // ─── Enveloppes & fiscalité ─────────────────────────────────────────────────

  pea: {
    slug: "pea",
    term: "PEA — Plan d'Épargne en Actions",
    shortDef:
      "Enveloppe fiscale française : après 5 ans, les gains ne supportent que 17,2 % de prélèvements sociaux au lieu de 30 %.",
    metaTitle: "PEA : définition, plafond, fiscalité — le guide simple",
    metaDescription:
      "Le PEA en clair : plafond de 150 000 €, exonération d'impôt sur le revenu après 5 ans (reste 17,2 % de prélèvements sociaux), ETF éligibles. Définition + exemple chiffré pour un DCA.",
    definition: [
      "Le Plan d'Épargne en Actions est une enveloppe fiscale française destinée à l'investissement en actions européennes — et, grâce aux ETF synthétiques, en indices mondiaux comme le MSCI World ou le S&P 500. Son atout : après 5 ans de détention, les gains sont exonérés d'impôt sur le revenu. Seuls les prélèvements sociaux de 17,2 % restent dus, contre 30 % de flat tax sur un compte-titres ordinaire.",
      "Le plafond de versement est de 150 000 € par personne (les gains peuvent faire croître le portefeuille au-delà sans limite). Un retrait avant 5 ans entraîne en principe la clôture du plan — d'où la règle d'or : n'y investir que de l'épargne de long terme.",
    ],
    inPractice: [
      {
        title: "L'enveloppe par défaut d'un DCA français",
        text: "Pour un investisseur résident fiscal français qui démarre un DCA en ETF, le PEA est presque toujours le bon point de départ : sur 20 ans, l'écart de fiscalité représente plusieurs milliers d'euros.",
      },
      {
        title: "Ouvrir tôt, même avec peu",
        text: "C'est la date d'ouverture qui déclenche le compteur des 5 ans, pas les montants versés. Ouvrir un PEA avec 10 € « prend date » et débloque la fiscalité réduite plus tôt.",
      },
    ],
    example:
      "200 €/mois pendant 20 ans à 7 %/an ≈ 102 000 € finaux dont ≈ 54 000 € de gains. Prélèvements à la sortie : ≈ 9 300 € en PEA (17,2 %) contre ≈ 16 200 € en CTO (30 %) — environ 6 900 € d'écart.",
    faq: [
      {
        q: "Quels ETF peut-on loger dans un PEA ?",
        a: "Les ETF investis à 75 % minimum en actions européennes, ou les ETF synthétiques qui répliquent des indices mondiaux via un swap : MSCI World (CW8, WPEA, DCAM), S&P 500 (ESE, PSP5), Nasdaq-100 (PUST)… Les ETF physiques à dominante américaine (IWDA, VWCE, CSPX) ne sont pas éligibles.",
      },
      {
        q: "Que se passe-t-il si je retire avant 5 ans ?",
        a: "Un retrait avant 5 ans entraîne en principe la clôture du plan et l'imposition des gains au PFU de 30 % (sauf cas particuliers : licenciement, invalidité, création d'entreprise…). Après 5 ans, les retraits sont libres sans clôture.",
      },
    ],
    related: [
      { href: "/pea-ou-cto", label: "PEA ou CTO : le comparatif complet" },
      { href: "/etf-msci-world", label: "ETF MSCI World éligibles PEA" },
      { href: "/comparatif", label: "Chez quel courtier ouvrir un PEA ?" },
      { href: "/calculateur-fiscal-pea-cto", label: "Calculer l'écart fiscal sur votre cas" },
    ],
    category: "Enveloppes & fiscalité",
  },

  cto: {
    slug: "cto",
    term: "CTO — Compte-Titres Ordinaire",
    shortDef:
      "Compte d'investissement sans plafond ni restriction d'actifs, mais fiscalisé au PFU de 30 % sur les gains.",
    metaTitle: "CTO (compte-titres) : définition, fiscalité, quand l'utiliser",
    metaDescription:
      "Le compte-titres ordinaire en clair : aucun plafond, tous les ETF du monde accessibles (IWDA, VWCE, CSPX), mais 30 % de flat tax sur les gains. Quand le préférer au PEA — définition + cas d'usage.",
    definition: [
      "Le compte-titres ordinaire est le compte d'investissement « sans contrainte » : aucun plafond de versement, accès à tous les titres cotés du monde (actions, ETF physiques américains ou mondiaux, obligations…). En contrepartie, les gains — plus-values comme dividendes — sont imposés au Prélèvement Forfaitaire Unique de 30 % dès le premier euro.",
      "Pour un investisseur DCA français, le CTO est le complément du PEA, pas son concurrent : il prend le relais quand le PEA est plafonné (150 000 € de versements) ou pour loger des ETF non éligibles comme IWDA ou VWCE.",
    ],
    inPractice: [
      {
        title: "La suite logique du PEA plein",
        text: "L'ordre fiscal optimal pour la plupart des résidents français : remplir le PEA d'abord, puis continuer le DCA en CTO. Inverser l'ordre coûte 13 points de fiscalité sur les gains.",
      },
      {
        title: "Le terrain des ETF physiques",
        text: "IWDA, VWCE, CSPX — les grands ETF physiques à bas frais ne sont accessibles qu'en CTO (ou assurance-vie). Si la réplication physique est une exigence pour vous, c'est ici que ça se passe.",
      },
    ],
    faq: [
      {
        q: "PEA ou CTO pour commencer un DCA ?",
        a: "PEA dans la grande majorité des cas pour un résident fiscal français : la fiscalité après 5 ans (17,2 % vs 30 %) représente plusieurs milliers d'euros d'écart sur un DCA long terme. Le CTO devient pertinent une fois le PEA plafonné, ou pour des besoins spécifiques (ETF non éligibles, expatriation prévue).",
      },
      {
        q: "Peut-on avoir plusieurs CTO ?",
        a: "Oui, sans limite — chez plusieurs courtiers si besoin. Contrairement au PEA (un seul par personne), le CTO n'a aucune restriction de nombre ni de plafond.",
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
    term: "PFU — Prélèvement Forfaitaire Unique (flat tax)",
    shortDef:
      "Imposition forfaitaire de 30 % sur les revenus du capital : 12,8 % d'impôt sur le revenu + 17,2 % de prélèvements sociaux.",
    metaTitle: "PFU (flat tax 30 %) : définition et impact sur vos ETF",
    metaDescription:
      "Le Prélèvement Forfaitaire Unique en clair : 30 % sur les plus-values et dividendes en CTO (12,8 % IR + 17,2 % sociaux). Comment le PEA permet d'y échapper en partie — définition + exemple chiffré.",
    definition: [
      "Le Prélèvement Forfaitaire Unique — souvent appelé « flat tax » — s'applique depuis 2018 aux revenus du capital : plus-values de cession, dividendes, intérêts. Son taux global est de 30 %, décomposé en 12,8 % d'impôt sur le revenu et 17,2 % de prélèvements sociaux.",
      "C'est le régime par défaut des gains réalisés sur un compte-titres ordinaire. L'option pour le barème progressif de l'impôt sur le revenu reste possible si elle est plus avantageuse (revenus modestes), mais elle s'applique alors à l'ensemble des revenus du capital de l'année.",
    ],
    inPractice: [
      {
        title: "Le chiffre qui justifie le PEA",
        text: "L'écart entre le PFU (30 %) et la fiscalité PEA après 5 ans (17,2 %) est LE levier d'optimisation d'un DCA français : 12,8 points sur la totalité des gains, sans aucun risque supplémentaire.",
      },
      {
        title: "Imposé seulement à la vente",
        text: "Le PFU s'applique aux gains RÉALISÉS. Tant que vous ne vendez pas (et qu'un ETF capitalisant réinvestit ses dividendes en interne), aucune imposition ne tombe — la capitalisation travaille sur le montant brut.",
      },
    ],
    example:
      "54 000 € de gains réalisés en CTO → 16 200 € de PFU (30 %). Les mêmes gains dans un PEA de plus de 5 ans → 9 288 € de prélèvements sociaux (17,2 %). Écart : ≈ 6 900 €.",
    faq: [
      {
        q: "Le PFU s'applique-t-il dans un PEA ?",
        a: "Non, tant que le plan a plus de 5 ans : les retraits ne supportent que les prélèvements sociaux de 17,2 %. Un retrait avant 5 ans fait en revanche basculer les gains dans le régime du PFU (30 %) et entraîne en principe la clôture du plan.",
      },
      {
        q: "Les ETF capitalisants évitent-ils le PFU ?",
        a: "Ils le diffèrent. Un ETF capitalisant réinvestit les dividendes sans distribution, donc sans imposition annuelle — le PFU ne s'applique qu'à la vente finale, sur la plus-value globale. Ce report est un avantage réel : la somme non prélevée continue de composer.",
      },
    ],
    related: [
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
    term: "TER — Total Expense Ratio (frais courants)",
    shortDef:
      "Frais annuels d'un ETF, prélevés automatiquement sur la performance — de 0,07 % à 0,40 % pour les grands indices.",
    metaTitle: "TER d'un ETF : définition et vrai impact sur 20 ans",
    metaDescription:
      "Le TER (frais annuels d'un ETF) en clair : comment il est prélevé, pourquoi 0,18 % d'écart représente ~4 500 € sur 20 ans de DCA, et à partir de quel écart il doit guider votre choix. Définition + exemples.",
    definition: [
      "Le Total Expense Ratio représente les frais courants annuels d'un ETF : gestion, licence de l'indice, frais administratifs. Il s'exprime en pourcentage de l'encours et il est prélevé automatiquement, jour après jour, sur la valeur du fonds — vous ne recevez jamais de facture, la performance affichée est déjà nette de TER.",
      "Sur les grands indices, les TER s'échelonnent d'environ 0,07 % (S&P 500 physique en CTO) à 0,38 % (CW8). La guerre des frais de 2024-2025 a divisé par deux le coût du MSCI World en PEA : WPEA et DCAM à 0,20 % contre 0,38 % pour le CW8 historique.",
    ],
    inPractice: [
      {
        title: "L'effet est composé, comme les gains",
        text: "Un TER de 0,38 % au lieu de 0,20 % ne coûte pas « 0,18 % » : il coûte 0,18 % par an sur un capital qui grossit, soit environ 4 500 € sur 20 ans à 200 €/mois. Les frais composent contre vous comme les gains composent pour vous.",
      },
      {
        title: "Le seuil de pertinence",
        text: "Un écart de 0,15 %+ justifie de changer d'ETF pour les nouveaux achats. Un écart de 0,03 % (ESE vs PSP5) pèse moins que vos frais d'ordre — choisissez vite et investissez tôt.",
      },
    ],
    example:
      "200 €/mois sur 20 ans à 7 %/an brut : avec un TER de 0,20 %, capital final ≈ 102 000 € ; avec 0,38 %, ≈ 97 500 €. L'écart (~4 500 €) part en frais — pour exactement le même indice.",
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
    term: "Réplication physique",
    shortDef:
      "L'ETF détient réellement les titres de l'indice qu'il réplique — pas d'intermédiaire, pas de contrat d'échange.",
    metaTitle: "Réplication physique d'un ETF : définition et limites en PEA",
    metaDescription:
      "Un ETF à réplication physique détient réellement les actions de son indice (IWDA, VWCE, CSPX). Avantage : pas de risque de contrepartie. Limite : inéligible au PEA pour les indices mondiaux. Définition claire.",
    definition: [
      "Un ETF à réplication physique achète et détient réellement les titres de l'indice qu'il suit : un MSCI World physique comme IWDA possède les ~1 500 actions de l'indice (réplication « totale » ou « optimisée » s'il se contente d'un échantillon représentatif). La performance vient directement de la détention des titres.",
      "C'est l'approche la plus intuitive et la plus transparente — mais elle a une conséquence fiscale française : un ETF qui détient majoritairement des actions américaines ou mondiales ne respecte pas les règles d'éligibilité du PEA. IWDA, VWCE ou CSPX sont donc réservés au compte-titres ou à l'assurance-vie.",
    ],
    inPractice: [
      {
        title: "Le choix par défaut en CTO",
        text: "Une fois le PEA plafonné (ou pour les non-résidents), les ETF physiques à bas frais — IWDA (0,20 %), VWCE (0,22 %), CSPX (0,07 %) — sont les références mondiales.",
      },
      {
        title: "Ne pas en faire un dogme",
        text: "Préférer le physique « par principe » en sortant du PEA coûte 13 points de fiscalité sur les gains. Le confort psychologique de la détention directe a un prix — qu'il faut chiffrer avant de le payer.",
      },
    ],
    faq: [
      {
        q: "La réplication physique est-elle plus sûre que la synthétique ?",
        a: "Marginalement : elle élimine le risque de contrepartie du swap. Mais ce risque est lui-même très encadré (limité à 10 % de l'actif par UCITS, collatéralisé en pratique quotidiennement) et ne s'est jamais matérialisé en perte pour les porteurs d'ETF européens. La différence de sécurité réelle est faible.",
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
    term: "Réplication synthétique (swap)",
    shortDef:
      "L'ETF reproduit la performance de l'indice via un contrat d'échange — c'est ce qui rend le MSCI World ou le S&P 500 éligibles au PEA.",
    metaTitle: "ETF synthétique (swap) : définition, risques réels, intérêt PEA",
    metaDescription:
      "Un ETF synthétique réplique son indice via un swap : il détient des actions européennes et échange leur performance contre celle de l'indice. C'est le mécanisme qui met le MSCI World dans le PEA. Risques encadrés UCITS expliqués.",
    definition: [
      "Un ETF à réplication synthétique ne détient pas les titres de son indice : il possède un panier de substitution (typiquement des actions européennes) et conclut avec une banque un contrat d'échange — le swap — qui troque la performance de ce panier contre celle de l'indice visé. Résultat : la performance du MSCI World ou du S&P 500, avec un portefeuille juridiquement composé d'actions européennes.",
      "C'est précisément cette structure qui rend les indices mondiaux éligibles au PEA : CW8, WPEA, DCAM (MSCI World), ESE, PSP5 (S&P 500) ou PUST (Nasdaq-100) sont tous synthétiques. Sans le swap, pas de S&P 500 dans un PEA.",
    ],
    inPractice: [
      {
        title: "Le passage obligé du PEA mondial",
        text: "Si vous voulez du MSCI World, du S&P 500 ou du Nasdaq dans votre PEA, la question « physique ou synthétique » ne se pose pas : seul le synthétique est éligible. L'avantage fiscal compense très largement le risque résiduel du swap.",
      },
      {
        title: "Un risque réel mais borné",
        text: "Le risque de contrepartie (la banque du swap fait défaut) est limité par la réglementation UCITS à 10 % de l'actif du fonds, et les émetteurs collatéralisent en pratique quotidiennement. En vingt ans d'ETF synthétiques européens, ce risque ne s'est jamais matérialisé en perte pour les porteurs.",
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
      { href: "/etf-sp500", label: "Le S&P 500 en PEA (ESE, PSP5)" },
    ],
    category: "Frais & mécanique des ETF",
  },

  "capitalisant-distribuant": {
    slug: "capitalisant-distribuant",
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
    term: "Lump sum (investissement en une fois)",
    shortDef:
      "Investir tout son capital disponible immédiatement, plutôt que de l'étaler dans le temps comme le DCA.",
    metaTitle: "Lump sum vs DCA : définition et quand investir d'un coup",
    metaDescription:
      "Le lump sum (tout investir d'un coup) bat statistiquement le DCA ~2 fois sur 3 — mais expose au pire timing. Définition, l'étude Vanguard, et pourquoi le DCA reste le bon choix pour un revenu mensuel.",
    definition: [
      "Le lump sum consiste à investir immédiatement l'intégralité d'un capital disponible — héritage, prime, épargne accumulée — plutôt que de l'étaler par versements réguliers. C'est l'alternative au DCA, et le sujet d'un débat classique de l'investissement passif.",
      "Statistiquement, le lump sum l'emporte environ deux fois sur trois : les marchés montent plus souvent qu'ils ne baissent, donc chaque mois passé hors du marché a, en moyenne, un coût d'opportunité. L'étude de référence de Vanguard chiffre l'avantage moyen à 1-2 % sur les périodes d'étalement de 6-12 mois. Mais la moyenne cache la distribution : le tiers restant inclut les scénarios où tout investir la veille d'un krach fait très mal — financièrement et psychologiquement.",
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
        a: "En espérance mathématique, oui (≈ 2 fois sur 3, +1-2 % en moyenne selon Vanguard). En pratique, le meilleur plan est celui que vous tiendrez : un DCA qui vous évite de paniquer en cas de krach immédiat bat un lump sum abandonné au premier −20 %. Et pour l'épargne mensuelle sur salaire, le DCA est la seule option logique.",
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
    term: "Volatilité",
    shortDef:
      "L'amplitude des variations d'un actif autour de sa tendance — la mesure standard du « risque » en finance.",
    metaTitle: "Volatilité : définition simple et impact sur un DCA",
    metaDescription:
      "La volatilité mesure l'amplitude des variations d'un actif (~15 %/an pour les ETF actions monde). Pourquoi elle est le prix à payer du rendement, et pourquoi le DCA la transforme en alliée. Définition claire.",
    definition: [
      "La volatilité mesure l'amplitude des fluctuations d'un actif autour de sa tendance, généralement exprimée en pourcentage annualisé. Un ETF actions monde affiche une volatilité historique d'environ 15 %/an : les années à +25 % et les années à −15 % font partie du même paysage statistique, même si la tendance de long terme est haussière.",
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
    example:
      "Notre analyse Monte Carlo simule 1 000 trajectoires de marché avec une volatilité de ~15 %/an : pour un même DCA, les arrivées s'étalent du simple au double entre le 10e et le 90e percentile. La moyenne ne suffit pas pour piloter une stratégie.",
    faq: [
      {
        q: "Quelle est la volatilité d'un ETF MSCI World ?",
        a: "Historiquement autour de 15 % par an (un peu moins que le S&P 500 seul, nettement moins qu'un Nasdaq-100 à ~20-25 %). La diversification sur ~1 500 entreprises et 23 pays lisse les chocs individuels sans supprimer le risque de marché global.",
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
    term: "Drawdown (perte maximale)",
    shortDef:
      "La baisse entre un sommet du portefeuille et le creux qui suit — la mesure la plus parlante du risque vécu.",
    metaTitle: "Drawdown : définition et chiffres réels d'un DCA MSCI World",
    metaDescription:
      "Le drawdown mesure la chute pic-à-creux d'un portefeuille — le « pire moment » vécu. Sur un DCA MSCI World réel depuis 2010 : −17,8 % au pire (COVID). Pourquoi le DCA amortit les drawdowns de l'indice. Définition claire.",
    definition: [
      "Le drawdown mesure la baisse d'un portefeuille entre un sommet (pic) et le point bas qui suit (creux), avant de retrouver le sommet. Le « maximum drawdown » est la pire de ces baisses sur une période : c'est la réponse à la question qui compte vraiment — « au pire moment, combien aurais-je vu fondre ? ».",
      "Contrairement à la volatilité (une moyenne statistique), le drawdown raconte l'expérience vécue : −34 % en séance pour le MSCI World pendant le COVID, −50 %+ en 2008. C'est lui qui teste les nerfs, pas l'écart-type.",
    ],
    inPractice: [
      {
        title: "Le drawdown d'un DCA est plus doux que celui de l'indice",
        text: "Effet moyennage : votre portefeuille DCA contient des parts achetées à tous les prix, y compris pendant les creux. Sur notre backtest réel 2010-2026, le pire drawdown du portefeuille n'a été que de −17,8 % (COVID) — quand l'indice perdait bien davantage en séance.",
      },
      {
        title: "Dimensionner avant d'investir",
        text: "Avant de choisir une allocation, posez-vous la question en euros, pas en pourcents : « si mon portefeuille de 50 000 € affiche −15 000 € pendant six mois, est-ce que je tiens ? ». Si la réponse est non, l'allocation est trop agressive — quelle que soit son espérance de rendement.",
      },
    ],
    faq: [
      {
        q: "Quel drawdown faut-il anticiper sur un ETF monde ?",
        a: "Historiquement, des baisses de 30 à 50 % de l'indice surviennent une à deux fois par décennie (2008, 2020, 2022 dans une moindre mesure). Un portefeuille en construction par DCA encaisse des drawdowns plus faibles grâce à l'étalement des achats — mais plus le capital grossit, plus il se comporte comme un lump sum face aux baisses.",
      },
      {
        q: "Où voir le drawdown réel de mon scénario ?",
        a: "Notre backtest calcule le drawdown maximum réellement traversé pour votre montant et votre période, sur les données MSCI World depuis 2009 — avec les dates exactes du pic et du creux.",
      },
    ],
    related: [
      { href: "/backtest", label: "Calculer le drawdown réel de votre DCA" },
      { href: "/backtest-depuis-2010", label: "16 ans de DCA : −17,8 % au pire" },
      { href: "/glossaire/volatilite", label: "La volatilité" },
    ],
    category: "Stratégie & risque",
  },

  rebalancing: {
    slug: "rebalancing",
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
        a: "Non — c'est l'un des arguments de la simplicité : un ETF MSCI World seul se rééquilibre en interne (l'indice ajuste lui-même les poids des 1 500 entreprises). Le rebalancing ne concerne que les portefeuilles multi-lignes (World + émergents, actions + obligations…).",
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
    term: "TRI — Taux de Rendement Interne",
    shortDef:
      "Le rendement annualisé qui tient compte des dates et montants de chaque versement — la vraie mesure de performance d'un DCA.",
    metaTitle: "TRI : définition et pourquoi c'est LA mesure d'un DCA",
    metaDescription:
      "Le Taux de Rendement Interne annualise la performance en tenant compte de CHAQUE versement et de sa date — indispensable pour juger un DCA (le simple « +60 % » ne dit rien du temps). Définition + exemple réel.",
    definition: [
      "Le Taux de Rendement Interne est le taux annualisé qui égalise la valeur de tous vos versements (avec leurs dates) et la valeur finale du portefeuille. C'est l'équivalent de la fonction TRI.PAIEMENTS d'Excel — et la seule mesure honnête de la performance d'un DCA.",
      "Pourquoi pas un simple pourcentage de gain ? Parce qu'avec des versements étalés, chaque euro n'a pas travaillé la même durée : l'euro investi il y a 15 ans a eu 15 ans pour composer, celui du mois dernier, un mois. Un gain total de « +210 % » sur 16 ans de DCA correspond ainsi à un TRI d'environ 12,7 %/an — c'est ce chiffre qui se compare aux rendements annoncés des autres placements.",
    ],
    inPractice: [
      {
        title: "Comparer ce qui est comparable",
        text: "Livret à 3 %, fonds euros à 2,5 %, « +180 % en 15 ans » d'un collègue : seul le TRI met tout le monde sur la même échelle annualisée. Avant de comparer deux placements, convertissez en TRI.",
      },
      {
        title: "Le gain en % brut surestime toujours l'impression",
        text: "« J'ai fait +60 % » sonne mieux que « TRI de 14,9 %/an » — pourtant c'est la même performance sur notre backtest COVID. Méfiez-vous des pourcentages bruts sans durée ni dates de versement.",
      },
    ],
    example:
      "Backtest réel : 200 €/mois depuis janvier 2010 = 39 400 € investis, ~122 000 € aujourd'hui. Gain brut : +210 %. TRI : ≈ 12,7 %/an — le chiffre à retenir, calculé sur les dates réelles des 197 versements.",
    faq: [
      {
        q: "Quelle différence entre TRI et rendement annuel moyen ?",
        a: "Le « rendement annuel moyen » d'un indice suppose un capital investi en une fois au départ. Le TRI pondère chaque versement par sa durée réelle d'investissement — indispensable dès que les flux sont étalés (DCA, apports irréguliers). Pour un investissement unique sans flux, les deux coïncident.",
      },
      {
        q: "Comment calculer le TRI de mon propre DCA ?",
        a: "Notre backtest le calcule automatiquement pour un DCA sur le MSCI World (méthode Newton-Raphson sur les flux mensuels réels). Pour un portefeuille quelconque, la fonction TRI.PAIEMENTS (XIRR) d'Excel ou Google Sheets fait le même calcul à partir de vos dates et montants.",
      },
    ],
    related: [
      { href: "/backtest", label: "Le backtest calcule votre TRI réel" },
      { href: "/backtest-depuis-2010", label: "Exemple réel : TRI 12,7 %/an depuis 2010" },
      { href: "/interets-composes", label: "Les intérêts composés" },
    ],
    category: "Stratégie & risque",
  },
};

export const GLOSSARY_TERM_LIST = Object.values(GLOSSARY_TERMS);

export function getGlossaryTerm(slug: string): GlossaryTerm | null {
  return GLOSSARY_TERMS[slug] ?? null;
}
