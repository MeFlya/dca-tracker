// Broker comparison data for /comparatif/*.
// Static content — update carefully when broker pricing changes.
// Always link to the broker's official page for live prices.

/**
 * Mois de dernière revérification des conditions tarifaires, format YYYY-MM.
 *
 * ⚠️ Exporté et AFFICHÉ publiquement (page /transparence + bandeau des pages de
 * comparaison) au titre de l'art. D.111-7 I 7° du code de la consommation
 * — « la périodicité et la méthode d'actualisation des offres comparées ».
 * À bumper à chaque revue réelle des tarifs, jamais par confort.
 */
export const BROKERS_REVIEWED_ON = "2026-03";

export type BrokerSpecs = {
  pea: boolean;
  cto: boolean;
  assuranceVie: boolean;
  custodyFees: string;      // "Gratuit" / "0 €"
  orderFeesText: string;    // e.g. "1 € par ordre" or "0,60 % (plafonné à 12 €)"
  minDeposit: string;       // "0 €"
  regulation: string;       // "BaFin (Allemagne) + AMF"
  mobile: 1 | 2 | 3 | 4 | 5;
  savingsPlan: "Oui" | "Non" | "Partielle"; // épargne programmée auto sur ETF
};

export type BrokerData = {
  slug: string;
  name: string;
  shortName?: string;
  tagline: string;
  homepageUrl: string;
  metaTitle: string;
  metaDescription: string;
  heroIntro: string;
  specs: BrokerSpecs;
  pros: string[];
  cons: string[];
  dcaFitTitle: string;
  dcaFitBody: string;
  bestFor: string[];
  notIdealFor: string[];
  feeExample: string;       // concrete example for a 200€/mois DCA
  faq: { q: string; a: string }[];
};

// ─── Brokers ──────────────────────────────────────────────────────────────────

const TRADE_REPUBLIC: BrokerData = {
  slug: "trade-republic",
  name: "Trade Republic",
  shortName: "Trade Republic",
  tagline: "Courtier allemand, 0 € sur l'épargne programmée",
  homepageUrl: "https://traderepublic.com",
  metaTitle:
    "Trade Republic pour un DCA ETF : avis, frais et PEA en 2026",
  metaDescription:
    "Trade Republic est-il adapté à un DCA ETF ? Analyse complète des frais, du PEA, de l'épargne programmée et comparaison avec Boursorama et Fortuneo.",

  heroIntro:
    "Trade Republic est un courtier allemand qui a séduit plus de 4 millions d'investisseurs européens grâce à ses frais minimalistes et son épargne programmée gratuite. Depuis 2023, il propose le PEA aux résidents français, ce qui en fait une option très compétitive pour un DCA long-terme sur ETF.",

  specs: {
    pea: true,
    cto: true,
    assuranceVie: false,
    custodyFees: "Gratuit",
    orderFeesText: "1 € par ordre · 0 € sur épargne programmée",
    minDeposit: "0 €",
    regulation: "BaFin (Allemagne) · AMF pour le PEA",
    mobile: 5,
    savingsPlan: "Oui",
  },

  pros: [
    "Épargne programmée automatique en ETF à 0 € de frais (l'argument phare pour un DCA)",
    "Interface mobile parmi les meilleures du marché",
    "PEA disponible depuis 2023 pour les résidents français",
    "Frais de tenue de compte gratuits, pas de frais cachés",
    "Large catalogue d'ETF (dont MSCI World, S&P 500, FTSE All-World)",
  ],

  cons: [
    "Pas d'assurance-vie — si vous cherchez à diversifier les enveloppes fiscales",
    "Support client en ligne uniquement (pas d'agences physiques)",
    "Régulation principale en Allemagne (FGDR garantit le PEA, mais dépôts banques = German Compensation Scheme jusqu'à 100 000 €)",
  ],

  dcaFitTitle: "Trade Republic est l'option référence pour un DCA débutant",
  dcaFitBody:
    "L'épargne programmée à 0 € de frais est ce qui fait la différence sur le long terme. Sur un DCA de 200 €/mois pendant 20 ans, les économies de frais par rapport à un courtier 'classique' facturant 0,5 % par ordre se chiffrent en milliers d'euros. L'interface mobile est également très fluide pour l'automatisation mensuelle. Le PEA disponible depuis 2023 couvre la majorité des besoins fiscaux français.",

  bestFor: [
    "Débutants qui veulent automatiser leur DCA sans réfléchir aux frais",
    "Investisseurs mobile-first qui gèrent tout depuis leur smartphone",
    "Ceux qui veulent minimiser les frais sur le long terme",
  ],

  notIdealFor: [
    "Investisseurs qui veulent une assurance-vie ETF (produit non proposé)",
    "Ceux qui ont besoin d'un conseiller en agence physique",
  ],

  feeExample:
    "Pour 200 €/mois en épargne programmée ETF : 0 € de frais annuels. Sur 20 ans, cela représente une économie d'environ 3 000 à 5 000 € par rapport à un courtier facturant 0,5 % par ordre.",

  faq: [
    {
      q: "Le PEA Trade Republic est-il aussi sûr qu'un PEA classique ?",
      a: "Oui, au sens où il est soumis aux mêmes règles fiscales françaises (plafond 150 000 €, exonération d'impôt sur les plus-values après 5 ans). Les titres sont conservés par un établissement européen régulé. Le FGDR garantit jusqu'à 70 000 € de titres par client et par établissement. Les espèces dans le compte PEA sont également protégées.",
    },
    {
      q: "Puis-je transférer mon PEA existant vers Trade Republic ?",
      a: "Oui, Trade Republic accepte les transferts de PEA depuis d'autres établissements. La démarche prend généralement 2 à 4 semaines. Les frais de transfert sortant sont plafonnés par la loi à 150 € par ligne et ne peuvent pas dépasser 500 € au total. Trade Republic rembourse parfois ces frais sous conditions — vérifiez les offres en cours.",
    },
    {
      q: "Quel est le meilleur ETF à acheter chez Trade Republic pour un DCA ?",
      a: "Pour un PEA : un ETF MSCI World comme WPEA ou DCAM (TER 0,20 %) — ou CW8, la référence historique (0,38 %, plus liquide). Pour le S&P 500 en PEA : ESE (0,15 %). Pour un CTO : VWCE (Vanguard FTSE All-World, émergents inclus) ou VUSA (Vanguard S&P 500). L'épargne programmée Trade Republic à 0 € de frais d'ordre rend le DCA mensuel particulièrement efficace sur ces ETF — vérifiez la disponibilité de chacun dans le catalogue.",
    },
    {
      q: "Y a-t-il un montant minimum d'investissement mensuel ?",
      a: "Non, l'épargne programmée démarre à partir de 10 € par mois par ETF. Vous pouvez donc diversifier sur plusieurs ETF même avec un budget modeste.",
    },
  ],
};

const BOURSORAMA: BrokerData = {
  slug: "boursorama-bourse",
  name: "Boursorama Bourse",
  shortName: "Boursorama",
  tagline: "Banque en ligne française + courtier bourse intégré",
  homepageUrl: "https://www.boursorama-banque.com",
  metaTitle:
    "Boursorama Bourse pour un DCA ETF : avis, frais et PEA en 2026",
  metaDescription:
    "Boursorama Bourse est-il adapté à un DCA ETF ? Analyse complète des frais, du PEA et comparaison avec Trade Republic et Fortuneo.",

  heroIntro:
    "Boursorama Bourse est le pôle investissement de Boursorama, la banque en ligne filiale de Société Générale. Elle combine compte courant, livret, assurance-vie et PEA dans une seule interface — un argument solide pour ceux qui veulent simplifier leur vie financière. Ses frais d'ordre sont corrects sans être les plus bas du marché.",

  specs: {
    pea: true,
    cto: true,
    assuranceVie: true,
    custodyFees: "Gratuit",
    orderFeesText: "0,60 % par ordre (min 1,99 €, plafond selon plan)",
    minDeposit: "0 €",
    regulation: "ACPR · AMF · Groupe Société Générale",
    mobile: 4,
    savingsPlan: "Partielle",
  },

  pros: [
    "Écosystème complet : PEA + CTO + assurance-vie + banque en ligne dans une seule interface",
    "Régulation 100 % française, filiale d'un groupe bancaire majeur",
    "Assurance-vie 'Matla Banque' avec support ETF — option intéressante pour la transmission",
    "Outils d'analyse boursière avancés inclus",
    "Primes de bienvenue régulières à l'ouverture",
  ],

  cons: [
    "Frais d'ordre (0,60 %) nettement supérieurs à Trade Republic ou Fortuneo sur un DCA mensuel",
    "Pas d'épargne programmée ETF à 0 € (vous payez des frais sur chaque versement)",
    "Interface de trading datée par rapport à Trade Republic",
  ],

  dcaFitTitle: "Boursorama convient si vous voulez tout centraliser",
  dcaFitBody:
    "Boursorama Bourse est pertinent pour ceux qui valorisent l'intégration banque + bourse dans une même appli, et qui ouvrent une assurance-vie en parallèle du PEA. En revanche, pour un DCA mensuel pur ETF sur PEA, ses frais d'ordre à 0,60 % sont désavantageux. Sur 20 ans à 200 €/mois, les frais cumulés peuvent atteindre 200-300 € — acceptable mais améliorable chez la concurrence.",

  bestFor: [
    "Investisseurs qui veulent PEA + assurance-vie + compte courant au même endroit",
    "Ceux qui valorisent une régulation 100 % française via un groupe bancaire",
    "Profils mixtes qui font du DCA mais aussi des investissements ponctuels",
  ],

  notIdealFor: [
    "DCA mensuel pur low-cost (les frais d'ordre pèsent vite)",
    "Utilisateurs mobile-first qui veulent une expérience ultra-fluide",
  ],

  feeExample:
    "Pour 200 €/mois en ordre simple : environ 14 €/an de frais d'ordre (0,60 % avec minimum). Sur 20 ans, environ 280 € de frais cumulés si versements inchangés.",

  faq: [
    {
      q: "Peut-on loger un ETF MSCI World sur le PEA Boursorama ?",
      a: "Oui, le PEA Boursorama accepte tous les ETF éligibles PEA, incluant CW8 (Amundi MSCI World), ESE (Amundi S&P 500 synthétique), WPEA (iShares Core MSCI World), etc. L'inventaire est mis à jour régulièrement en fonction de la réglementation.",
    },
    {
      q: "L'assurance-vie Boursorama peut-elle remplacer le PEA pour un DCA ?",
      a: "Elle ne remplace pas le PEA, elle le complète. L'assurance-vie Boursorama 'Matla Banque' propose un choix restreint d'ETF et offre un avantage fiscal après 8 ans (abattement annuel + fiscalité réduite) ainsi qu'un cadre de transmission favorable. Le PEA reste plus avantageux fiscalement après 5 ans sur les gains.",
    },
    {
      q: "Boursorama propose-t-il une épargne programmée automatique ?",
      a: "Boursorama propose des virements récurrents et des achats programmés, mais les frais d'ordre standards s'appliquent à chaque transaction — contrairement à Trade Republic qui offre l'épargne programmée à 0 €. Si votre priorité est le DCA à faibles frais, c'est un point à considérer.",
    },
    {
      q: "Quel est le meilleur usage de Boursorama pour un DCA ?",
      a: "Pour tirer le meilleur parti des frais, effectuer des versements de plus gros montants moins souvent (par ex. 600 € tous les 3 mois au lieu de 200 €/mois) réduit le poids relatif du minimum de 1,99 €. C'est une astuce classique pour optimiser chez les courtiers à frais minimum par ordre.",
    },
  ],
};

const FORTUNEO: BrokerData = {
  slug: "fortuneo",
  name: "Fortuneo",
  shortName: "Fortuneo",
  tagline: "Courtier français bon rapport qualité-prix",
  homepageUrl: "https://www.fortuneo.fr",
  metaTitle:
    "Fortuneo pour un DCA ETF : avis, frais et PEA en 2026",
  metaDescription:
    "Fortuneo est-il adapté à un DCA ETF ? Analyse des frais, du PEA, de l'expérience utilisateur et comparaison avec Trade Republic et Boursorama.",

  heroIntro:
    "Fortuneo est un courtier français, filiale du Crédit Mutuel Arkéa, régulièrement récompensé pour son rapport qualité-prix. Ses frais d'ordre sont parmi les plus compétitifs chez les courtiers régulés en France, et sa plateforme propose tous les produits classiques (PEA, CTO, assurance-vie).",

  specs: {
    pea: true,
    cto: true,
    assuranceVie: true,
    custodyFees: "Gratuit",
    orderFeesText: "0,20 % par ordre (minimum applicable) · PEA dédié",
    minDeposit: "0 €",
    regulation: "ACPR · AMF · Groupe Crédit Mutuel Arkéa",
    mobile: 4,
    savingsPlan: "Partielle",
  },

  pros: [
    "Frais d'ordre parmi les plus bas chez les courtiers français régulés (0,20 % typique)",
    "Offre complète : PEA + CTO + assurance-vie + bourse internationale",
    "Plateforme web et mobile modernes, bons outils de recherche",
    "Service client français avec support téléphonique",
    "Primes d'ouverture régulières (souvent 80-150 € pour un PEA)",
  ],

  cons: [
    "Frais d'ordre encore présents — Trade Republic reste moins cher pour l'épargne programmée",
    "Minimum d'ordre ou palier tarifaire sur certains ETF (à vérifier au cas par cas)",
    "Interface d'investissement plus classique que Trade Republic",
  ],

  dcaFitTitle: "Fortuneo est un bon compromis qualité / frais / écosystème",
  dcaFitBody:
    "Fortuneo est le choix classique pour un investisseur français qui veut faire un DCA sérieux sans sacrifier la flexibilité. Ses frais d'ordre à 0,20 % sont compétitifs, l'offre est complète (PEA + AV + CTO) et la régulation est française. Sur un DCA de 200 €/mois pendant 20 ans, les frais cumulés restent contenus (environ 100-150 € de frais d'ordre sur la durée).",

  bestFor: [
    "Investisseurs français qui veulent un courtier régulé localement à prix compétitifs",
    "Profils qui ouvrent PEA + assurance-vie en parallèle",
    "Ceux qui valorisent un support client en français avec téléphone",
  ],

  notIdealFor: [
    "DCA micro-budget (l'épargne programmée gratuite de Trade Republic est imbattable sur petites sommes)",
    "Ceux qui veulent une interface mobile ultra-moderne",
  ],

  feeExample:
    "Pour 200 €/mois en ordre simple : environ 5 €/an de frais d'ordre (0,20 %). Sur 20 ans, environ 100 € de frais cumulés — très raisonnable.",

  faq: [
    {
      q: "Fortuneo est-il moins cher que Trade Republic pour un DCA ?",
      a: "Non, Trade Republic reste moins cher sur l'épargne programmée ETF (0 € vs 0,20 % sur Fortuneo). En revanche, Fortuneo offre l'écosystème complet (PEA + assurance-vie) sous régulation française, ce que Trade Republic ne propose pas pour l'assurance-vie. Le choix dépend de vos priorités.",
    },
    {
      q: "Fortuneo propose-t-il une assurance-vie ETF ?",
      a: "Oui, Fortuneo propose plusieurs contrats d'assurance-vie (Symphonis Vie, Fortuneo Vie), dont certains incluent une sélection d'ETF. L'assurance-vie en ETF devient fiscalement avantageuse après 8 ans (abattement annuel sur les gains + fiscalité réduite). Elle est utile en complément du PEA pour la transmission.",
    },
    {
      q: "Quels sont les frais cachés de Fortuneo ?",
      a: "Fortuneo affiche des frais transparents : frais d'ordre par transaction, frais de tenue de compte (souvent gratuits selon les conditions), frais de transfert sortant. Il n'y a pas de frais cachés significatifs, mais vérifiez toujours les conditions tarifaires à jour sur le site officiel avant d'ouvrir un compte.",
    },
    {
      q: "Puis-je avoir un PEA chez Fortuneo et un CTO chez Trade Republic ?",
      a: "Oui, rien ne l'empêche — la règle est qu'on ne peut détenir qu'un seul PEA par personne, mais le PEA et le CTO peuvent être chez des établissements différents. C'est une stratégie courante : optimiser le PEA chez un courtier français régulé, et utiliser un courtier low-cost pour les investissements complémentaires en CTO.",
    },
  ],
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const BROKERS: Record<string, BrokerData> = {
  [TRADE_REPUBLIC.slug]: TRADE_REPUBLIC,
  [BOURSORAMA.slug]: BOURSORAMA,
  [FORTUNEO.slug]: FORTUNEO,
};

export const BROKER_LIST: BrokerData[] = Object.values(BROKERS);

export function getBroker(slug: string): BrokerData | null {
  return BROKERS[slug] ?? null;
}
