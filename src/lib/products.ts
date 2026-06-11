// Produits digitaux en paiement unique — /produits/*.
//
// Source de vérité data-driven : pitchs, bullets, FAQ et prix affichés
// vivent ici. Les PRIX AFFICHÉS doivent correspondre aux prix Stripe
// (créés dans le Dashboard, IDs en env vars). Le contenu marketing est
// volontairement structuré pour être remplacé par les pitchs définitifs
// préparés par Maël — chercher les commentaires [À CONFIRMER].
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
  /** Env var contenant le price ID Stripe (mode payment). */
  priceIdEnv: string;
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

// [À CONFIRMER] Prix template : fourchette annoncée 19-29 € → placé à 24 €
// en attendant le prix définitif. Ajuster ici + dans Stripe.
const TEMPLATE: Product = {
  id: "template-suivi-dca",
  slug: "template-suivi-dca",
  name: "Template de suivi DCA & PEA (Excel + Google Sheets)",
  shortName: "Template de suivi DCA",
  tagline: "Le tableur de suivi que votre courtier ne vous donnera jamais.",
  priceEur: 24,
  priceIdEnv: "STRIPE_PRODUCT_TEMPLATE_PRICE_ID",
  metaTitle: "Template Excel / Google Sheets de suivi DCA & PEA (2026)",
  metaDescription:
    "Un tableur prêt à l'emploi pour suivre votre DCA en ETF : versements, valeur de portefeuille, TRI, écart vs projection, vue fiscale PEA. Excel + Google Sheets. Paiement unique, mises à jour incluses.",
  // [À CONFIRMER] — pitch placeholder structuré, à remplacer par le pitch final.
  abstract: [
    "Vous investissez chaque mois, mais votre suivi se résume à l'interface de votre courtier ? Ce template centralise tout : versements, valeur réelle du portefeuille, performance annualisée (TRI) et écart par rapport à votre plan — dans un tableur que vous contrôlez à 100 %.",
    "Conçu pour les investisseurs DCA français : colonnes pensées pour le PEA (plafond, fiscalité), formules déjà câblées, graphiques automatiques. Vous saisissez deux chiffres par mois, le reste se calcule.",
  ],
  features: [
    "Fichier Excel (.xlsx) + version Google Sheets (lien de copie en 1 clic)",
    "Suivi mensuel : versements, valeur de portefeuille, gains cumulés",
    "TRI annualisé calculé automatiquement (formule XIRR pré-câblée)",
    "Écart réel vs projection — savoir si vous êtes en avance ou en retard",
    "Vue PEA : plafond des 150 000 €, suivi des versements éligibles",
    "Graphiques automatiques : courbe de croissance, répartition",
    "Mises à jour du template incluses (lien de re-téléchargement)",
  ],
  contents: [
    { title: "Onglet Suivi mensuel", detail: "La saisie en 2 chiffres/mois (versement + valeur) — tout le reste est calculé : gains, TRI, progression." },
    { title: "Onglet Projection", detail: "Votre plan théorique (montant, durée, rendement) et la comparaison automatique avec le réel." },
    { title: "Onglet PEA & fiscalité", detail: "Suivi du plafond de versements, estimation des prélèvements à la sortie (17,2 % vs 30 %)." },
    { title: "Onglet Allocation", detail: "Répartition par ETF avec pondérations cibles et écarts de rééquilibrage." },
  ],
  forWho: [
    "Vous faites (ou démarrez) un DCA en ETF et voulez un suivi propre sans abonnement",
    "Vous préférez maîtriser vos données dans VOTRE fichier",
    "Vous voulez votre TRI réel, pas juste le « +X % » trompeur du courtier",
  ],
  notForWho: [
    "Vous voulez un suivi automatique sans saisie mensuelle → notre app Premium fait ça",
    "Vous tradez activement (ce template est pensé buy & hold long terme)",
  ],
  faq: [
    {
      q: "Excel ou Google Sheets — les deux versions sont incluses ?",
      a: "Oui. Vous recevez le fichier .xlsx (Excel, LibreOffice, Numbers) ET un lien Google Sheets « créer une copie » pour travailler dans le cloud. Les deux versions ont les mêmes formules.",
    },
    {
      q: "Faut-il savoir utiliser Excel ?",
      a: "Non. Vous remplissez deux cellules par mois (versement du mois, valeur du portefeuille) — tout le reste est calculé et les graphiques se mettent à jour seuls. Les formules sont verrouillées contre les modifications accidentelles.",
    },
    {
      q: "Comment le fichier est-il livré ?",
      a: "Immédiatement après le paiement : lien de téléchargement sur la page de confirmation + email avec les liens (re-téléchargeables). Facture automatique envoyée par email.",
    },
    {
      q: "Y a-t-il un remboursement possible ?",
      a: "Produit numérique livré immédiatement : conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas après téléchargement. En cas de problème réel avec le fichier, écrivez-nous — on trouve toujours une solution.",
    },
  ],
  deliverables: [
    { label: "Template Excel (.xlsx)", fileKey: "template-xlsx" },
    { label: "Version Google Sheets (copie en 1 clic)", sheetsCopy: true },
  ],
};

const GUIDE: Product = {
  id: "guide-demarrer-dca",
  slug: "guide-demarrer-dca",
  name: "Guide PDF — Démarrer le DCA en France",
  shortName: "Guide Démarrer le DCA",
  tagline: "De zéro à votre premier versement programmé, sans jargon.",
  priceEur: 19,
  priceIdEnv: "STRIPE_PRODUCT_GUIDE_PRICE_ID",
  metaTitle: "Guide PDF : Démarrer le DCA en France (PEA, ETF, courtiers)",
  metaDescription:
    "Le guide pas-à-pas pour lancer votre DCA en France : choisir l'enveloppe (PEA/CTO), le courtier, l'ETF, programmer ses versements et éviter les 7 erreurs classiques. PDF, paiement unique.",
  // [À CONFIRMER] — pitch placeholder structuré, à remplacer par le pitch final.
  abstract: [
    "Toutes les informations pour démarrer un DCA existent gratuitement, éparpillées sur cent sites contradictoires. Ce guide les condense en un parcours unique : de « je ne sais pas par où commencer » à votre premier versement programmé.",
    "Spécifique à la France : PEA vs CTO chiffré, courtiers comparés, ETF éligibles avec leurs vrais frais, fiscalité expliquée simplement — et les 7 erreurs qui coûtent le plus cher aux débutants.",
  ],
  features: [
    "PDF structuré, lisible en une soirée, consultable à vie",
    "Le choix d'enveloppe (PEA/CTO) tranché avec des chiffres, pas des généralités",
    "Quel courtier selon votre profil (frais réels comparés)",
    "Quel ETF pour commencer — et lesquels éviter",
    "Programmer ses versements : la mise en place pas à pas",
    "Les 7 erreurs de débutant les plus chères (et comment les éviter)",
    "Mises à jour du guide incluses",
  ],
  contents: [
    { title: "Partie 1 — Comprendre", detail: "Le DCA, les ETF, les intérêts composés : le minimum vital, sans théorie inutile." },
    { title: "Partie 2 — Choisir", detail: "Enveloppe (PEA/CTO), courtier, ETF : trois décisions, trois arbres de décision chiffrés." },
    { title: "Partie 3 — Mettre en place", detail: "Ouvrir le compte, passer le premier ordre, automatiser — captures et étapes concrètes." },
    { title: "Partie 4 — Tenir", detail: "Quoi faire (et ne pas faire) pendant les baisses ; le suivi minimal qui suffit." },
  ],
  forWho: [
    "Vous voulez démarrer mais vous tournez en rond entre les avis contradictoires",
    "Vous préférez un parcours structuré à 40 onglets ouverts",
    "Vous voulez éviter les erreurs coûteuses des 12 premiers mois",
  ],
  notForWho: [
    "Vous investissez déjà en DCA depuis des années (le contenu vous semblera basique)",
    "Vous cherchez des conseils boursiers ou du stock picking — il n'y en a pas ici",
  ],
  faq: [
    {
      q: "En quoi ce guide diffère du contenu gratuit du site ?",
      a: "Le site couvre chaque sujet séparément ; le guide est le parcours assemblé dans le bon ordre, avec les arbres de décision et les étapes de mise en place détaillées. C'est la différence entre une encyclopédie et un itinéraire.",
    },
    {
      q: "Est-ce un conseil en investissement ?",
      a: "Non. C'est un guide pédagogique sur la mécanique du DCA en France (enveloppes, frais, mise en place). Aucune recommandation personnalisée — pour cela, consultez un conseiller agréé AMF.",
    },
    {
      q: "Le guide est-il maintenu à jour ?",
      a: "Oui : frais des courtiers, TER des ETF et règles fiscales évoluent. Votre lien de téléchargement donne accès à la dernière version.",
    },
    {
      q: "Puis-je me faire rembourser ?",
      a: "Produit numérique livré immédiatement : le droit de rétractation ne s'applique pas après téléchargement (art. L221-28). Mais si le guide ne tient pas sa promesse, écrivez-nous.",
    },
  ],
  deliverables: [{ label: "Guide PDF", fileKey: "guide-pdf" }],
};

const BUNDLE: Product = {
  id: "bundle-dca",
  slug: "pack-demarrage-dca",
  name: "Pack Démarrage DCA — Guide + Template",
  shortName: "Pack Démarrage DCA",
  tagline: "Comprendre, démarrer, suivre : le pack complet.",
  priceEur: 39,
  compareAtEur: 43, // 24 + 19 — recalculer si les prix unitaires changent
  priceIdEnv: "STRIPE_PRODUCT_BUNDLE_PRICE_ID",
  metaTitle: "Pack Démarrage DCA : guide PDF + template de suivi (-10 %)",
  metaDescription:
    "Le guide pour lancer votre DCA en France + le template Excel/Google Sheets pour le suivre. Tout pour démarrer proprement, en paiement unique. Économisez par rapport aux achats séparés.",
  abstract: [
    "Le parcours complet du débutant sérieux : le guide vous amène jusqu'à votre premier versement programmé, le template prend le relais pour suivre votre stratégie mois après mois — TRI, écart vs plan, vue PEA.",
    "Les deux produits, achetés ensemble, moins chers qu'en séparé.",
  ],
  features: [
    "Tout le Guide « Démarrer le DCA en France » (PDF)",
    "Tout le Template de suivi DCA & PEA (Excel + Google Sheets)",
    "Économie par rapport aux achats séparés",
    "Mises à jour des deux produits incluses",
  ],
  contents: [
    { title: "Le Guide (PDF)", detail: "Comprendre, choisir (PEA/courtier/ETF), mettre en place, tenir — le parcours complet." },
    { title: "Le Template (Excel + Sheets)", detail: "Suivi mensuel, TRI automatique, écart vs projection, vue PEA et allocation." },
  ],
  forWho: [
    "Vous partez de zéro et voulez l'équipement complet en un achat",
    "Vous offrez un kit de démarrage sérieux à un proche qui veut s'y mettre",
  ],
  notForWho: [
    "Vous avez déjà un système de suivi qui vous convient → prenez le guide seul",
    "Vous savez déjà tout mettre en place → prenez le template seul",
  ],
  faq: [
    {
      q: "Que contient exactement le pack ?",
      a: "Les deux produits complets : le Guide PDF « Démarrer le DCA en France » et le Template de suivi (fichier Excel + lien Google Sheets), avec leurs mises à jour respectives. Livraison immédiate des trois liens après paiement.",
    },
    {
      q: "Puis-je acheter les produits séparément ?",
      a: "Oui — le guide et le template sont disponibles individuellement. Le pack existe pour ceux qui veulent les deux : il revient moins cher que les achats séparés.",
    },
  ],
  deliverables: [
    { label: "Guide PDF", fileKey: "guide-pdf" },
    { label: "Template Excel (.xlsx)", fileKey: "template-xlsx" },
    { label: "Version Google Sheets (copie en 1 clic)", sheetsCopy: true },
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
  return process.env[product.priceIdEnv] ?? null;
}
