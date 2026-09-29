// Produits digitaux en paiement unique — /produits/*.
//
// Source de vérité data-driven : pitchs, bullets, FAQ et prix affichés
// vivent ici. Les PRIX AFFICHÉS doivent correspondre aux prix Stripe
// (créés dans le Dashboard, IDs en env vars).
// Cockpit DCA : argumentaire DÉFINITIF (Cowork, 2026-06-11). Guide : pitch
// aligné sur le PDF v1.0 le 29/09/2026 (voir le commentaire au-dessus de GUIDE).
//
// Positionnement (décision produit, ne pas dévier) : ces produits captent
// les "non" au SaaS (les gens qui veulent du Excel/PDF, pas un abonnement).
// Ils ne doivent JAMAIS être poussés au milieu du funnel Premium — teaser
// en bas de /tarifs uniquement.

export type ProductId = "template-suivi-dca" | "guide-demarrer-dca" | "bundle-dca";

export type Product = {
  id: ProductId;
  slug: string;
  name: string;
  /** Nom court pour les cards/cross-sell. */
  shortName: string;
  tagline: string;
  /** Prix affiché en euros TTC — DOIT matcher le prix Stripe. */
  priceEur: number;
  /** Prix barré (bundle) — somme des produits séparés. */
  compareAtEur?: number;
  /**
   * Note affichée sous le prix. Conformité directive Omnibus : uniquement
   * des affirmations VRAIES (ex. vraie hausse de prix planifiée) — jamais
   * de prix barré fictif ni de fausse urgence.
   */
  priceNote?: string;
  /**
   * Captures du produit réel, dans `public/produits/`.
   *
   * ⚠️ DES CAPTURES DU VRAI FICHIER, jamais une maquette. Ce site vend la
   * vérifiabilité : un visuel reconstitué qui ne correspondrait pas à ce que
   * l'acheteur reçoit serait exactement le contraire de l'argument.
   *
   * Tant que ce champ est absent, la page affiche un cadre vide de la même
   * hauteur — ce qui est honnête mais coûte cher : on demande 19 € pour un
   * fichier que personne ne peut voir. C'est l'état depuis le 11/06/2026.
   *
   * `alt` est lu par les lecteurs d'écran ET par Google Images : décrire ce
   * qu'on voit, pas répéter le nom du produit.
   */
  screenshots?: { src: string; alt: string; width: number; height: number }[];

  /** Tableau comparatif « eux vs nous » — section différenciation. */
  comparison?: {
    intro: string;
    themLabel: string;
    usLabel: string;
    rows: { them: string; us: string }[];
  };
  /** Env var contenant le price ID Stripe (mode payment). */
  priceIdEnv: string;
  /**
   * Price ID Stripe LIVE, utilisé si la variable d'environnement est absente.
   * Un identifiant de prix n'est pas un secret (il transite par le navigateur
   * au checkout). Repli ajouté le 29/09/2026 : la modification des variables
   * Vercel est bloquée derrière une validation à deux facteurs, et le guide
   * devait pouvoir se vendre sans attendre.
   */
  livePriceId?: string;
  metaTitle: string;
  metaDescription: string;
  /** Abstract — 2-3 paragraphes. */
  abstract: string[];
  /** Features — bullets "ce que vous obtenez". */
  features: string[];
  /** Contenu détaillé — sections "ce qu'il y a dedans". */
  contents: { title: string; detail: string }[];
  /** Pour qui / pas pour qui — honnêteté = conversion qualifiée. */
  forWho: string[];
  notForWho: string[];
  faq: { q: string; a: string }[];
  /** Fichiers livrés (clés de PRODUCT_FILES dans la route download). */
  deliverables: { label: string; fileKey?: string; sheetsCopy?: boolean }[];
};

// Prix (stratégie validée) : 19 € au lancement, puis VRAIE hausse à 24 €
// à date annoncée — pas de prix barré fictif (directive Omnibus). Au moment
// de la hausse : priceEur → 24, retirer priceNote, recalculer le bundle,
// mettre à jour le « 19 € » de la metaDescription, et créer le nouveau
// prix dans Stripe.
const TEMPLATE: Product = {
  id: "template-suivi-dca",
  screenshots: [
    {
      src: "/produits/cockpit-versement-du-mois.png",
      alt: "Onglet Versement du mois : 300 € à verser, et le tableau qui indique combien de parts de chaque ETF acheter pour revenir à l'allocation cible",
      width: 1400,
      height: 773,
    },
    {
      src: "/produits/cockpit-dashboard.png",
      alt: "Tableau de bord du Cockpit : valeur du portefeuille, plus-value, TRI annualisé, frais de courtage cumulés et répartition par ETF",
      width: 1400,
      height: 1303,
    },
  ],
  slug: "template-suivi-dca",
  name: "Cockpit DCA — Tableau de bord PEA (Excel + Google Sheets)",
  shortName: "Cockpit DCA",
  tagline: "Le tableau de bord que votre courtier aurait dû vous donner.",
  priceEur: 19,
  priceNote: "Prix de lancement — passera ensuite à 24 €",
  priceIdEnv: "STRIPE_PRODUCT_TEMPLATE_PRICE_ID",
  metaTitle: "Cockpit DCA — Tableau de bord PEA (Excel + Google Sheets)",
  metaDescription:
    "Suivez votre PEA en 2 min/mois : PRU, TRI annualisé, plus-value — et chaque mois, où verser pour rester aligné. 100 % PEA français. Paiement unique, 19 €.",
  abstract: [
    "Le Cockpit DCA, c'est le tableau de bord que votre courtier aurait dû vous donner. Suivez votre PEA en 2 minutes par mois : PRU, plus-value, TRI annualisé, répartition réelle vs cible.",
    "Et surtout, chaque mois, il vous dit où verser : combien de parts de chaque ETF acheter pour rester aligné sur VOTRE allocation. Pas un constat de plus — une décision claire à chaque versement.",
    "Conçu 100 % pour le PEA français — plafond, cap des 5 ans, prélèvements sociaux — en double format : Google Sheets (cours automatiques) + Excel.",
  ],
  features: [
    "Dashboard complet : valeur du portefeuille, total versé, plus-value €/%, TRI annualisé (XIRR), frais cumulés, répartition réelle vs cible — tout se met à jour seul",
    "« Versement du mois » : saisissez votre montant, il le répartit en parts entières par ETF pour revenir vers votre allocation cible",
    "Onglet PEA : jauge du plafond de 150 000 €, compte à rebours des 5 ans, estimation des prélèvements sociaux (18,6 %) si retrait",
    "Journal de transactions : 1 000 lignes pré-câblées (date, ETF, parts, prix, frais), PRU frais inclus — rien ne casse quand vous ajoutez des lignes",
    "Vue Par ETF : PRU, valeur actuelle, performance, poids réel vs cible — jusqu'à 10 ETF",
    "Projection : simulateur d'intérêts composés paramétrable (versement, rendement, horizon 1 à 40 ans) avec graphique capital vs versements",
    "Frais : ce que le courtage et le TER vous coûtent réellement sur 10, 20 et 30 ans, en euros",
    "Double format Google Sheets (cours automatiques) + Excel, exemple pré-rempli avec 3 ETF PEA réels, mode d'emploi 5 minutes, mises à jour incluses",
  ],
  contents: [
    { title: "Dashboard", detail: "Les 6 indicateurs clés (valeur, versé, plus-value, TRI, frais, répartition) + graphiques — votre PEA en un coup d'œil." },
    { title: "Versement du mois", detail: "Le calculateur de rééquilibrage par les flux : votre montant est réparti en parts entières par ETF pour revenir vers la cible." },
    { title: "Transactions", detail: "Le journal de vos achats : 1 000 lignes pré-câblées, PRU frais inclus calculé automatiquement." },
    { title: "Par ETF", detail: "PRU, valeur actuelle, performance et poids réel vs cible pour chacun de vos ETF (jusqu'à 10)." },
    { title: "PEA", detail: "Jauge du plafond de 150 000 €, compte à rebours des 5 ans, estimation des prélèvements sociaux (18,6 %) en cas de retrait." },
    { title: "Projection", detail: "Intérêts composés paramétrables (versement, rendement, 1 à 40 ans) avec graphique capital vs versements." },
    { title: "Frais", detail: "L'impact réel du courtage et du TER sur votre patrimoine à 10, 20 et 30 ans — en euros, pas en pourcentages abstraits." },
    { title: "Mode d'emploi", detail: "La prise en main en 5 minutes : cases jaunes = à remplir, tout le reste est automatique. Exemple pré-rempli à remplacer par vos données." },
  ],
  forWho: [
    "Vous versez régulièrement sur un PEA et voulez une décision claire chaque mois — pas juste un constat",
    "Vous voulez votre vrai rendement (TRI annualisé), pas un « +X % » incomplet qui ignore vos dates de versement",
    "Vous refusez les connexions bancaires : vos données restent dans VOTRE fichier",
  ],
  notForWho: [
    "Vous voulez un suivi automatique sans saisie mensuelle → notre app Premium fait ça",
    "Vous tradez activement (le Cockpit est pensé DCA buy & hold long terme)",
  ],
  comparison: {
    intro:
      "Votre courtier et les agrégateurs vous montrent où vous en êtes. Aucun ne vous dit quoi faire de vos 300 € ce mois-ci. Les outils gratuits constatent — le Cockpit décide.",
    themLabel: "Les autres",
    usLabel: "Cockpit DCA",
    rows: [
      {
        them: "Templates gratuits (YouTube, Reddit) : génériques, pensés pour l'investisseur américain, en anglais ou en dollars",
        us: "100 % PEA français : plafond, cap des 5 ans, 18,6 %, PRU frais inclus, vocabulaire FR",
      },
      {
        them: "Plus-value simple, qui ment en DCA (elle ignore le calendrier de vos versements)",
        us: "TRI annualisé (XIRR) : la vraie mesure de performance d'un DCA",
      },
      {
        them: "Aucun pilotage du versement mensuel",
        us: "Calculateur de rééquilibrage par les flux, en parts entières",
      },
      {
        them: "Fichiers figés, qui cassent à la première ligne ajoutée, jamais maintenus",
        us: "1 000 lignes pré-câblées, cours auto + manuel en secours, mises à jour incluses",
      },
      {
        them: "Agrégateurs type Finary : centrés sur la connexion bancaire, version complète sur abonnement annuel",
        us: "Aucune connexion bancaire, vos données restent chez vous, paiement unique",
      },
      {
        them: "Courtier : PRU brut, généralement ni projection ni analyse de frais",
        us: "Projection composée + impact des frais sur 30 ans, en euros",
      },
    ],
  },
  faq: [
    {
      q: "Excel ou Google Sheets ?",
      a: "Les deux sont inclus. Google Sheets récupère les cours automatiquement ; Excel fonctionne partout, la mise à jour manuelle des cours tient dans vos 2 minutes mensuelles. Mêmes formules, même structure.",
    },
    {
      q: "Je débute, c'est pour moi ?",
      a: "Oui : mode d'emploi 5 minutes intégré, exemple pré-rempli à remplacer par vos données, cases jaunes = à remplir — tout le reste est automatique.",
    },
    {
      q: "Et si un cours automatique tombe en panne ?",
      a: "Le fichier est conçu pour : le cours manuel prend toujours le relais, rien ne casse. Et les mises à jour du fichier sont incluses.",
    },
    {
      q: "Pourquoi payer pour un tableur ?",
      a: "Vous n'achetez pas un tableur : vous achetez 2 minutes par mois et une décision claire à chaque versement. L'équivalent d'un seul ordre de bourse en frais — une fois, à vie.",
    },
    {
      q: "Comment le fichier est-il livré ?",
      a: "Immédiatement après le paiement : lien de téléchargement sur la page de confirmation + email avec les liens (valables 7 jours, régénérés sur simple demande). Facture automatique envoyée par email.",
    },
    {
      q: "Et si ça ne me convient pas ?",
      a: "Satisfait ou remboursé pendant 14 jours : un email à hello@dcatracker.fr suffit, remboursement intégral sans justification à fournir.",
    },
    {
      q: "Est-ce un conseil en investissement ?",
      a: "Non — c'est un outil éducatif de suivi et de simulation, basé sur l'allocation que VOUS définissez (disclaimer intégré au fichier). Aucune recommandation personnalisée.",
    },
  ],
  deliverables: [
    { label: "Cockpit DCA — fichier Excel (.xlsx)", fileKey: "template-xlsx" },
    { label: "Cockpit DCA — version Google Sheets (copie en 1 clic)", sheetsCopy: true },
  ],
};

// Pitch aligné sur le contenu réel du PDF v1.0 (29/09/2026) : 63 pages,
// chiffres vérifiés au 28/09/2026. L'ancien pitch promettait des « captures »
// d'applications que le guide ne contient pas, et « quel ETF pour commencer »,
// ce que le guide refuse de dire (pas de conseil personnalisé).
const GUIDE: Product = {
  id: "guide-demarrer-dca",
  slug: "guide-demarrer-dca",
  name: "Guide PDF — Démarrer le DCA en France",
  shortName: "Guide Démarrer le DCA",
  tagline: "De zéro à votre premier investissement, puis une routine mensuelle qui tient dans la durée.",
  priceEur: 19,
  priceIdEnv: "STRIPE_PRODUCT_GUIDE_PRICE_ID",
  livePriceId: "price_1UL1rCLVB4yZ8CXvoFZG1wOj",
  screenshots: [
    {
      src: "/produits/guide-couverture.png",
      alt: "Couverture du guide « Démarrer le DCA en France », édition septembre 2026, chiffres vérifiés au 28 septembre 2026",
      width: 1397,
      height: 1977,
    },
    {
      src: "/produits/guide-courtiers.png",
      alt: "Page du chapitre 5 : Trade Republic, BoursoBank et Fortuneo comparés d'après leurs grilles officielles, et le coût d'un achat d'ETF de 50 à 1 000 €",
      width: 1397,
      height: 1977,
    },
    {
      src: "/produits/guide-charte.png",
      alt: "Annexe A, la charte d'investisseur à remplir : épargne de précaution, enveloppe, courtier, ETF, montant mensuel et règles de conduite",
      width: 1397,
      height: 1977,
    },
  ],
  metaTitle: "Guide PDF : Démarrer le DCA en France (PEA, ETF, courtiers)",
  metaDescription:
    "Lancer un DCA en France pas à pas : PEA ou CTO, 3 courtiers et 13 ETF vérifiés, baisses chiffrées, 7 erreurs à éviter. PDF de 63 pages, 19 €.",
  abstract: [
    "Tout ce qu'il faut pour démarrer un DCA existe gratuitement, éparpillé sur de nombreux sites qui se contredisent, et beaucoup ne sont pas à jour : fiscalité 2026, tarifs des courtiers. Ce guide assemble le parcours dans l'ordre, de « je ne sais pas par où commencer » à votre premier investissement, puis à une routine mensuelle.",
    "Chaque chiffre est sourcé et daté, vérifié au 28 septembre 2026 : prélèvements sociaux à 18,6 %, grilles officielles de Trade Republic, BoursoBank et Fortuneo, 13 ETF éligibles au PEA vérifiés un par un, baisses passées chiffrées en euros. Il ne vous dit pas quoi acheter : il vous donne des critères, des arbres de décision et des outils à remplir.",
  ],
  features: [
    "PDF de 63 pages, chiffres vérifiés au 28 septembre 2026, chaque source citée",
    "PEA ou CTO : les règles de 2026 et l'écart en euros, ramenés à quelques critères que vous appliquez à votre situation",
    "Trois courtiers (Trade Republic, BoursoBank, Fortuneo) comparés sur leurs grilles officielles, et le coût d'un achat selon votre montant",
    "Les 13 ETF éligibles au PEA vérifiés (ISIN, frais), et les pièges : fonds non éligibles, versions plus chères du même indice",
    "Ouvrir le PEA, passer le premier ordre, automatiser : étapes numérotées, check-lists et fiches à remplir",
    "Les baisses de 2008 à 2025 chiffrées en euros, et les 7 erreurs les plus chères, chacune chiffrée avec ses hypothèses",
    "Trois arbres de décision, une charte d'investisseur et un plan de crise à remplir, un calendrier annuel",
    "Mises à jour incluses : chaque version est datée, la suivante vous est envoyée sur simple demande",
  ],
  contents: [
    { title: "Avant de commencer", detail: "Le parcours dans l'ordre, ce que le guide ne fait pas, la méthode et la date de vérification des chiffres." },
    { title: "Partie 1 — Comprendre", detail: "Le DCA face à l'investissement en une fois, les ETF en dix minutes, le temps, le rendement et le risque, en euros." },
    { title: "Partie 2 — Choisir", detail: "Enveloppe, courtier, ETF : trois décisions, trois arbres de décision, les grilles tarifaires et les frais vérifiés." },
    { title: "Partie 3 — Mettre en place", detail: "Épargne de précaution, ouverture du PEA, premier ordre, automatisation, montant : étapes numérotées, check-lists et fiches à remplir." },
    { title: "Partie 4 — Tenir", detail: "Les baisses passées chiffrées (2008, 2020, 2022, 2025), le suivi minimal, la revue annuelle, le rééquilibrage et les retraits après 5 ans." },
    { title: "Les 7 erreurs et les annexes", detail: "Les erreurs les plus chères chiffrées en euros ; charte d'investisseur, plan de crise, calendrier annuel, glossaire et sources." },
  ],
  forWho: [
    "Vous voulez démarrer mais vous tournez en rond entre les avis contradictoires",
    "Vous préférez un parcours structuré à 40 onglets ouverts",
    "Vous voulez éviter les erreurs qui coûtent le plus cher, chiffrées en euros",
  ],
  notForWho: [
    "Vous investissez déjà en DCA depuis des années (le contenu vous semblera basique)",
    "Vous cherchez des conseils boursiers ou du stock picking — il n'y en a pas ici",
  ],
  faq: [
    {
      q: "En quoi ce guide diffère du contenu gratuit du site ?",
      a: "Le site couvre chaque sujet séparément ; le guide est le parcours assemblé dans le bon ordre, avec les arbres de décision, les étapes de mise en place, les fiches à remplir et les chiffres regroupés et datés. C'est la différence entre une encyclopédie et un itinéraire.",
    },
    {
      q: "Est-ce un conseil en investissement ?",
      a: "Non. C'est un guide pédagogique sur la mécanique du DCA en France (enveloppes, frais, mise en place). Aucune recommandation personnalisée : pour cela, consultez un conseiller en investissements financiers (CIF) immatriculé à l'ORIAS.",
    },
    {
      q: "Le guide est-il maintenu à jour ?",
      a: "Oui : frais des courtiers, frais des ETF et fiscalité évoluent. Chaque version indique la date de vérification de ses chiffres. Quand une nouvelle version paraît, écrivez à hello@dcatracker.fr depuis votre email d'achat : nous vous l'envoyons.",
    },
    {
      q: "Y a-t-il des captures d'écran des applications ?",
      a: "Non, volontairement : les applications changent souvent et une capture périmée induit en erreur. Le guide donne des étapes écrites valables chez les trois courtiers, avec ce qu'il faut vérifier à chaque étape.",
    },
    {
      q: "Et si ça ne me convient pas ?",
      a: "Satisfait ou remboursé pendant 14 jours : un email à hello@dcatracker.fr suffit, remboursement intégral sans justification à fournir.",
    },
  ],
  deliverables: [{ label: "Guide PDF", fileKey: "guide-pdf" }],
};

// Prix bundle : 19 + 19 = 38 € séparés, pack à 33 € (prix Stripe créé le
// 29/09/2026, price_1UL1t9LVB4yZ8CXvb69XgEnn). Ancienne note : recalculé après passage du Cockpit à 19 €
// (lancement) → 19 + 19 = 38 € séparés, bundle à 33 € (~-13 %). Quand le
// Cockpit repassera à 24 € : séparés 43 €, revoir le prix du pack.
const BUNDLE: Product = {
  id: "bundle-dca",
  slug: "pack-demarrage-dca",
  name: "Pack Démarrage DCA — Guide + Cockpit",
  shortName: "Pack Démarrage DCA",
  tagline: "Comprendre, démarrer, piloter : le pack complet.",
  priceEur: 33,
  compareAtEur: 38, // 19 + 19 — recalculer si les prix unitaires changent
  priceIdEnv: "STRIPE_PRODUCT_BUNDLE_PRICE_ID",
  livePriceId: "price_1UL1t9LVB4yZ8CXvb69XgEnn",
  metaTitle: "Pack Démarrage DCA : guide PDF + Cockpit DCA (suivi PEA)",
  metaDescription:
    "Le guide pour lancer votre DCA en France + le Cockpit DCA (tableau de bord Excel/Google Sheets) pour le piloter. Tout pour démarrer proprement, en paiement unique. Moins cher qu'en séparé.",
  abstract: [
    "Le parcours complet du débutant sérieux : le guide vous amène jusqu'à votre premier versement programmé, le Cockpit DCA prend le relais pour piloter votre PEA mois après mois — TRI, versement du mois, plafond PEA.",
    "Les deux produits, achetés ensemble, moins chers qu'en séparé.",
  ],
  features: [
    "Tout le Guide « Démarrer le DCA en France » (PDF)",
    "Tout le Cockpit DCA — tableau de bord PEA (Excel + Google Sheets)",
    "Économie par rapport aux achats séparés",
    "Mises à jour des deux produits incluses",
  ],
  contents: [
    { title: "Le Guide (PDF)", detail: "Comprendre, choisir (PEA/courtier/ETF), mettre en place, tenir — le parcours complet." },
    { title: "Le Cockpit DCA (Excel + Sheets)", detail: "Dashboard, versement du mois en parts entières, TRI annualisé, onglets PEA, projection et frais." },
  ],
  forWho: [
    "Vous partez de zéro et voulez l'équipement complet en un achat",
    "Vous offrez un kit de démarrage sérieux à un proche qui veut s'y mettre",
  ],
  notForWho: [
    "Vous avez déjà un système de suivi qui vous convient → prenez le guide seul",
    "Vous savez déjà tout mettre en place → prenez le Cockpit seul",
  ],
  faq: [
    {
      q: "Que contient exactement le pack ?",
      a: "Les deux produits complets : le Guide PDF « Démarrer le DCA en France » et le Cockpit DCA (fichier Excel + lien Google Sheets), avec leurs mises à jour respectives. Livraison immédiate des trois liens après paiement.",
    },
    {
      q: "Puis-je acheter les produits séparément ?",
      a: "Oui — le guide et le Cockpit DCA sont disponibles individuellement. Le pack existe pour ceux qui veulent les deux : il revient moins cher que les achats séparés.",
    },
    {
      q: "Et si ça ne me convient pas ?",
      a: "Satisfait ou remboursé pendant 14 jours : un email à hello@dcatracker.fr suffit, remboursement intégral sans justification à fournir.",
    },
    {
      q: "Est-ce un conseil en investissement ?",
      a: "Non — le guide est pédagogique et le Cockpit est un outil de suivi basé sur l'allocation que VOUS définissez. Aucune recommandation personnalisée : pour cela, consultez un conseiller en investissements financiers (CIF) immatriculé à l'ORIAS.",
    },
  ],
  deliverables: [
    { label: "Guide PDF", fileKey: "guide-pdf" },
    { label: "Cockpit DCA — fichier Excel (.xlsx)", fileKey: "template-xlsx" },
    { label: "Cockpit DCA — version Google Sheets (copie en 1 clic)", sheetsCopy: true },
  ],
};

export const PRODUCTS: Record<ProductId, Product> = {
  "template-suivi-dca": TEMPLATE,
  "guide-demarrer-dca": GUIDE,
  "bundle-dca": BUNDLE,
};

export const PRODUCT_LIST: Product[] = [TEMPLATE, GUIDE, BUNDLE];

export function getProduct(idOrSlug: string): Product | null {
  return (
    PRODUCTS[idOrSlug as ProductId] ??
    PRODUCT_LIST.find((p) => p.slug === idOrSlug) ??
    null
  );
}

/** Price ID Stripe du produit (null si non configuré → produit "bientôt dispo"). */
export function getProductPriceId(product: Product): string | null {
  return process.env[product.priceIdEnv] ?? product.livePriceId ?? null;
}
