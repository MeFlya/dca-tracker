// Produits digitaux en paiement unique — /produits/*.
//
// Source de vérité data-driven : pitchs, bullets, FAQ et prix affichés
// vivent ici. Les PRIX AFFICHÉS doivent correspondre aux prix Stripe
// (créés dans le Dashboard, IDs en env vars).
// Cockpit DCA : argumentaire DÉFINITIF (Cowork, 2026-06-11), captures du
// classeur v2.0 le 01/10/2026. Guide : pitch aligné sur le PDF v1.0 le
// 29/09/2026, captures et version passées à la v1.1 le 01/10/2026 (voir le
// commentaire au-dessus de GUIDE).
//
// Positionnement (décision produit, ne pas dévier) : ces produits captent
// les "non" au SaaS (les gens qui veulent du Excel/PDF, pas un abonnement).
// Ils ne doivent JAMAIS être poussés au milieu du funnel Premium — teaser
// en bas de /tarifs uniquement.

export type ProductId = "template-suivi-dca" | "guide-demarrer-dca" | "bundle-dca";

/**
 * Une capture du produit réel, dans `public/produits/` (voir son README).
 *
 * ⚠️ DES CAPTURES DU VRAI FICHIER, jamais une maquette. Recadrer selon un
 * rectangle contigu, encadrer en CSS, composer plusieurs vraies captures :
 * oui. Retoucher un chiffre, effacer une ligne, recoller deux zones : non.
 *
 * `alt` est lu par les lecteurs d'écran ET par Google Images : décrire ce
 * qu'on voit, pas répéter le nom du produit.
 */
export type Capture = {
  src: string;
  alt: string;
  /** Dimensions RÉELLES du fichier : c'est ce qui évite que la page saute. */
  width: number;
  height: number;
  /**
   * Classeur : nom RÉEL de l'onglet (« Versement du mois »), qui sert aussi
   * de libellé dans la visite. Guide : page du PDF (« p. 19 »).
   */
  repere?: string;
  /** Guide : ce que montre la page, en quelques mots (légende sous la page). */
  titre?: string;
  /**
   * Ce qu'on lit dans la capture. UNIQUEMENT des valeurs visibles dans
   * l'image : refaire la légende chaque fois qu'on refait la capture.
   */
  legende?: string;
  /**
   * L'onglet entier, ouvert par le zoom quand la capture affichée est un
   * recadrage (règle du README : l'onglet complet reste à un clic), et montré
   * tel quel dans la visite. Sa `legende` (facultative) remplace alors celle
   * du recadrage : elle peut citer ce que seul l'onglet entier montre.
   */
  complete?: { src: string; alt: string; width: number; height: number; legende?: string };
  /**
   * Recadrage contigu de la MÊME capture, servi sous 640 px (la capture
   * entière y deviendrait une texture). Même `alt` : il doit montrer ce que
   * l'alt décrit.
   */
  mobile?: { src: string; width: number; height: number };
  /** Guide : page montrée en éventail derrière la couverture (hero, cartes). */
  eventail?: boolean;
  /** Guide : page absente de « Feuilleter » (le sommaire, déjà en HTML). */
  horsFeuilleter?: boolean;
  /**
   * Guide : extrait lisible d'une page (rectangle contigu), montré en grand
   * en tête de « Feuilleter » ; `complete` est la page entière.
   */
  extrait?: boolean;
  /** Classeur : capture montrée sur les cartes (/produits, Voir aussi, appel final). */
  vignette?: boolean;
  /** Version du produit capturée (guide : "1.1"). À refaire si la page change. */
  version?: string;
};

export type SommaireEntree = {
  /** Numéro de chapitre, « E », lettre d'annexe ou « — », tel que dans le PDF. */
  repere: string;
  titre: string;
  resume: string;
  page: number;
};
export type SommairePartie = { partie: string; entrees: SommaireEntree[] };

export type Product = {
  id: ProductId;
  slug: string;
  name: string;
  /** Nom court pour les cards/cross-sell. */
  shortName: string;
  tagline: string;
  /**
   * Fin de phrase du renvoi de fin d'article (RenvoiProduit), après
   * l'accroche propre à chaque page : `avantLien` + lien + `role`, puis le
   * prix (lu dans `priceEur`, jamais ici), « paiement unique » et `format`.
   *
   * Décrit l'OBJET — ce qu'il contient, sous quelle forme — et jamais ce que
   * le lecteur devrait faire de son argent (pas de statut CIF). Un produit
   * sans ce champ ne peut pas être renvoyé depuis un article.
   */
  renvoi?: {
    /** Ce qui précède le lien, quand le nom seul ne se lit pas en début de phrase. */
    avantLien?: string;
    /** Texte du lien. Par défaut : `shortName`. */
    lien?: string;
    role: string;
    format: string;
  };
  /** Prix payé en euros (TVA non applicable) — DOIT matcher le prix Stripe. */
  priceEur: number;
  /**
   * Pack : produits inclus. Le prix barré n'est écrit nulle part : il se
   * CALCULE à partir d'eux (`prixSepares`), pour rester la vraie somme des
   * prix séparés (directive Omnibus) le jour où un prix unitaire change.
   */
  inclut?: ProductId[];
  /**
   * Note affichée sous le prix. Conformité directive Omnibus : uniquement
   * des affirmations VRAIES (ex. une hausse de prix datée, puis tenue) — jamais
   * de prix barré fictif ni de fausse urgence.
   */
  priceNote?: string;
  /**
   * Captures du produit réel (voir `Capture`).
   *
   * ⚠️ DES CAPTURES DU VRAI FICHIER, jamais une maquette. Ce site vend la
   * vérifiabilité : un visuel reconstitué qui ne correspondrait pas à ce que
   * l'acheteur reçoit serait exactement le contraire de l'argument.
   *
   * Ordre lu par les pages (ProductVisual, VisiteOnglets, Feuilleter) :
   * - classeur : la 1re est le hero, puis une capture (ou plusieurs, même
   *   `repere`) par onglet de la visite ;
   * - guide : la 1re est la couverture, les suivantes les pages à feuilleter.
   * Sans capture, la page n'affiche AUCUN cadre de repli (le Pack compose
   * celles des produits qu'il inclut).
   */
  screenshots?: Capture[];
  /**
   * Phrase sous le comparatif « Pourquoi pas un outil gratuit ? », avec un
   * lien interne (le comparatif est rendu en texte brut, sans lien).
   */
  apresComparatif?: { avant: string; lien: { href: string; libelle: string }; apres?: string };
  /**
   * Mise en page du H1 en deux niveaux. Le texte rendu DOIT rester égal à
   * `name` (référencement) : vérifié au chargement du module, plus bas.
   */
  titreHero?: {
    principal: string;
    complement: string;
    /** `principal` en petit au-dessus, `complement` en grand (guide). */
    principalEnPetit?: boolean;
  };
  /** Format en une ligne : surtitre du hero et des cartes. */
  format: string;
  /**
   * Quatre faits du produit, chacun déjà écrit dans `features` ou `contents`
   * (ou calculé). Jamais d'avis, de note ni de nombre d'acheteurs.
   */
  chiffresCles: { valeur: string; libelle: string }[];
  /** Ligne sous les chiffres clés (guide : date de vérification, version). */
  chiffresClesNote?: string;
  /** Guide : sommaire réel du PDF. */
  sommaire?: SommairePartie[];
  /** Guide : nombre de pages, version du PDF vendu et date de vérification de ses chiffres. */
  pages?: number;
  version?: string;
  dateVerification?: string;

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

// Prix : 19 €, sans hausse prévue (décision de Maël du 01/10/2026). La
// mention « Prix de lancement — passera ensuite à 24 € », affichée sans
// date depuis le lancement, est retirée le même jour : une hausse annoncée
// sans échéance finit par ressembler à une fausse urgence. Si un prix change
// un jour : `priceEur`, le prix Stripe, le « 19 € » de la metaDescription,
// puis le prix du pack (son prix barré se recalcule seul, pas son prix), et
// une entrée au journal (changelog.ts) : celle du 01/10/2026 écrit que le
// prix reste 19 € et qu'aucune hausse n'est prévue.
//
// Faits du classeur, écrits UNE fois puis lus par `features`, `contents` et
// les chiffres clés : journal de 1 000 lignes, 10 ETF au plus (onglet Par
// ETF : 3 lignes d'exemple + 7 vides). Les 8 onglets sont `contents`, dans
// l'ordre RÉEL des feuilles du classeur (vérifié le 01/10/2026 dans
// workbook.xml) : la page les numérote 01 à 08 et la visite suit cet ordre.
const TEMPLATE_LIGNES = 1000;
const TEMPLATE_ETF_MAX = 10;
/** « 1 000 » avec l'espace ordinaire des textes existants (meta inchangées). */
const milliers = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/**
 * Captures du classeur : toutes rendues à la même échelle depuis le PDF
 * vectoriel d'Excel (230 ppp, soit 3,19 px par point : le texte des cellules,
 * en Arial 10, y fait 32 px), donc un même facteur donne partout le même
 * corps de texte. Visite : environ 12,5 px CSS ; zoom : environ 16 px. Une
 * capture plus large que la scène (Par ETF, Projection, Frais) y est ramenée.
 */
export const largeurVisiteClasseur = (c: { width: number }) => Math.round(c.width * 0.39);
export const largeurLectureClasseur = (c: { width: number }) => Math.round(c.width * 0.5);

// Captures du 01/10/2026, classeur v2.0 (celui qui est livré : cases de
// saisie bleues, TRI corrigé) : chaque zone exportée en PDF par Excel (Mac)
// à échelle fixe, depuis une copie, puis rastérisée et recadrée sur son
// contenu (README de public/produits/). Pas de bandeau de titre en v2.0 :
// chaque onglet est montré depuis son titre, sauf le recadrage mobile.
// 02/10/2026 : refaites aux mêmes zones et à la même échelle (mêmes
// dimensions) sur l'exemple aux COURS RÉELS : achats fictifs (mêmes parts),
// prix = clôtures réelles d'Euronext Paris, cours de Par ETF du 02/10/2026
// (src/lib/cockpit-exemple.ts). Frais est inchangée (onglet indépendant de
// l'exemple).
// Les légendes ne citent QUE des valeurs visibles dans l'image. Celles qui
// dépendent de la date d'ouverture du fichier (TRI, âge du plan, jours avant
// les 5 ans) sont datées : « Capture du 2 octobre 2026 ». Plus-value et TRI
// sont ceux d'un exemple aux quantités arbitraires : jamais présentés comme
// la performance d'un fonds.
export const TEMPLATE_CAPTURES: Capture[] = [
  {
    src: "/produits/cockpit-v2-versement.png",
    alt: "Onglet Versement du mois : 300 € à verser dans la case bleue, et pour chacun des trois ETF de l'exemple l'allocation cible, le poids actuel, le montant suggéré et le nombre de parts à acheter (0, 14 et 0)",
    width: 2452,
    height: 846,
    repere: "Versement du mois",
    // Seulement ce que montre le recadrage du hero (le total et les notes de
    // lecture ne sont que dans l'onglet entier, ouvert par le zoom).
    legende:
      "Dans l'exemple pré-rempli (achats fictifs, cours réels) : 300 € à verser. ETZ est le seul ETF sous sa cible : le tableau propose 14 parts d'ETZ, aucune de PE500 ni de PAEEM. Calcul fait sur l'allocation que vous fixez, pas un conseil.",
    complete: {
      src: "/produits/cockpit-v2-versement-complet.png",
      alt: "Onglet Versement du mois en entier : le tableau des ETF avec la ligne TOTAL, les notes de lecture et l'avertissement",
      width: 2452,
      height: 1574,
      // Visite : la ligne TOTAL et la note de lecture, absentes du recadrage
      // du hero (relecture DA du 01/10/2026 : la visite redisait la légende
      // du hero mot pour mot).
      legende:
        "Dans l'exemple pré-rempli (achats fictifs, cours réels), sur les 300 € versés, 291,76 € achètent des parts entières (14 d'ETZ) ; le reliquat de 8,24 € reste en liquidités et sera réinvesti le mois prochain.",
    },
    // Du montant à verser à la colonne « Parts à acheter », lignes 1 à 3.
    mobile: { src: "/produits/cockpit-v2-versement-mobile.png", width: 2011, height: 595 },
  },
  // Le TRI corrigé (5,5 % au lieu de 0,0 % le 01/10/2026 ; 17,0 % le
  // 02/10/2026 sur l'exemple aux cours réels) permet de montrer le haut du
  // Dashboard d'un seul tenant : les six indicateurs, la répartition et son
  // camembert. Onglet ouvert par défaut dans la visite, vignette des cartes
  // du Cockpit, hero du Pack (`piecesDuPack`) et images de partage.
  {
    src: "/produits/cockpit-v2-dashboard.png",
    alt: "Dashboard : six indicateurs (valeur du portefeuille 10 380,37 €, total versé frais inclus 8 107,21 €, plus-value latente +2 273,16 € soit +28,0 %, TRI annualisé 17,0 %, frais de courtage cumulés 173,13 €, 32 mois et 87 achats), puis la répartition par ETF face à la cible et son camembert",
    width: 2586,
    height: 1580,
    repere: "Dashboard",
    vignette: true,
    // TRI et « 32 mois » se calculent à la date d'ouverture : d'où la date.
    legende:
      "Capture du 2 octobre 2026. Dans l'exemple pré-rempli (achats fictifs, cours réels) : 8 107,21 € versés frais inclus, 10 380,37 € de valeur, 2 273,16 € de plus-value latente (+28,0 %) et un TRI annualisé de 17,0 %, un chiffre passé propre à ces dates. PE500 pèse 55,2 % pour une cible de 50 %.",
  },
  {
    src: "/produits/cockpit-v2-pea.png",
    alt: "Onglet PEA : date d'ouverture, plafond légal et taux des prélèvements sociaux dans les cases bleues, puis plafond de versements utilisé à 5,4 % avec sa jauge, ancienneté du plan et cap des 5 ans, fiscalité estimée en cas de retrait",
    width: 2365,
    height: 1715,
    repere: "PEA",
    // L'image contient des valeurs liées à la date d'ouverture du fichier
    // (« 2 an(s) et 8 mois », « encore 836 jour(s) » le 02/10/2026) : d'où la date.
    legende:
      "Capture du 2 octobre 2026. Plafond utilisé : 5,4 % (8 107,21 € de versements retenus). Cap des 5 ans le 15/01/2029. Prélèvements sociaux estimés sur la plus-value : 422,81 €.",
  },
  {
    src: "/produits/cockpit-v2-par-etf.png",
    alt: "Onglet Par ETF : pour chaque ETF, allocation cible, TER, cours, parts détenues, total investi, PRU, valeur, plus-value, performance, poids et écart à la cible",
    width: 3698,
    height: 1319,
    repere: "Par ETF",
    legende:
      // 01/10/2026 : le cours manuel (col. F), s'il est rempli, passe devant
      // le cours automatique (col. E) : la légende le dit, sans quoi « récupéré
      // automatiquement » est faux dès qu'un cours est saisi en F.
      "PRU, valeur et performance de chaque ligne, dans l'exemple (achats fictifs, cours de clôture du 2 octobre 2026) : +27,8 % pour PE500, +17,5 % pour ETZ, +42,6 % pour PAEEM. Dans Excel, le cours se saisit à la main ; dans Google Sheets, il est récupéré automatiquement tant que la colonne du cours manuel reste vide.",
  },
  {
    src: "/produits/cockpit-v2-projection.png",
    alt: "Onglet Projection : hypothèses dans les cases bleues (capital de départ, versement, rendement, horizon), capital estimé à 25 ans, tableau des années 1 à 20 et courbe du capital face aux versements cumulés",
    width: 3279,
    height: 2280,
    repere: "Projection",
    legende:
      "Avec 10 380,37 € de départ (la valeur de l'exemple), 300 € par mois et un rendement hypothétique de 7 % par an, le capital estimé à 25 ans est de 291 251 €, dont 100 380 € versés. C'est une hypothèse que vous choisissez, pas une promesse.",
  },
  {
    src: "/produits/cockpit-v2-frais.png",
    alt: "Onglet Frais : hypothèses dans les cases bleues, coût des frais à 10, 20 et 30 ans, capital à 30 ans selon le TER de l'ETF et graphique du capital avec et sans frais",
    width: 3701,
    height: 1835,
    repere: "Frais",
    legende:
      "Sur 30 ans, les frais de l'exemple coûteraient 21 821 €, soit 6,2 % du capital. À 0,50 % de TER au lieu de 0,10 %, le capital à 30 ans serait inférieur de 24 329 €.",
  },
];

const TEMPLATE_CONTENTS: Product["contents"] = [
  { title: "Mode d'emploi", detail: "La prise en main en 5 minutes : cases bleues = à remplir, tout le reste est automatique. Exemple pré-rempli à remplacer par vos données." },
  // Les six cases du haut du Dashboard (capture du 01/10/2026) : la sixième
  // est « Votre DCA », qui donne la durée et le nombre d'achats (l'ancienne
  // liste se lisait comme sept éléments pour « 6 indicateurs »).
  { title: "Dashboard", detail: "Les 6 indicateurs clés (valeur, total versé, plus-value, TRI, frais, et « Votre DCA » : durée et nombre d'achats), la répartition réelle face à la cible et deux graphiques — votre PEA en un coup d'œil." },
  { title: "Versement du mois", detail: "Le calculateur de rééquilibrage par les flux : votre montant est réparti en parts entières par ETF pour revenir vers la cible." },
  { title: "Transactions", detail: `Le journal de vos achats : ${milliers(TEMPLATE_LIGNES)} lignes pré-câblées, PRU frais inclus calculé automatiquement.` },
  { title: "Par ETF", detail: `PRU, valeur actuelle, performance et poids réel vs cible pour chacun de vos ETF (jusqu'à ${TEMPLATE_ETF_MAX}).` },
  { title: "PEA", detail: "Jauge du plafond de 150 000 €, compte à rebours des 5 ans, estimation des prélèvements sociaux (18,6 %) en cas de retrait." },
  { title: "Projection", detail: "Intérêts composés paramétrables (versement, rendement, 1 à 40 ans) avec graphique capital vs versements." },
  { title: "Frais", detail: "L'impact réel du courtage et du TER sur votre patrimoine à 10, 20 et 30 ans — en euros, pas en pourcentages abstraits." },
];

const TEMPLATE: Product = {
  id: "template-suivi-dca",
  screenshots: TEMPLATE_CAPTURES,
  titreHero: {
    principal: "Cockpit DCA",
    complement: "Tableau de bord PEA (Excel + Google Sheets)",
  },
  format: "Classeur Excel + Google Sheets",
  chiffresCles: [
    { valeur: String(TEMPLATE_CONTENTS.length), libelle: "onglets, du mode d'emploi aux frais" },
    { valeur: TEMPLATE_LIGNES.toLocaleString("fr-FR").replace(/\s/g, " "), libelle: "lignes de transactions pré-câblées" },
    { valeur: String(TEMPLATE_ETF_MAX), libelle: "ETF suivis au maximum" },
    { valeur: "2", libelle: "formats : Excel et Google Sheets" },
  ],
  slug: "template-suivi-dca",
  name: "Cockpit DCA — Tableau de bord PEA (Excel + Google Sheets)",
  shortName: "Cockpit DCA",
  tagline: "Le tableau de bord que votre courtier aurait dû vous donner.",
  // Texte du renvoi posé le 23/08/2026 sur /investir-200 et /investir-500,
  // sorti du composant le 29/09/2026 quand il a dû renvoyer aussi au guide :
  // rendu identique, mot pour mot.
  renvoi: {
    role: "est le classeur qu'on utilise pour ça",
    format: "Excel et Google\u00a0Sheets",
  },
  priceEur: 19,
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
    `Journal de transactions : ${milliers(TEMPLATE_LIGNES)} lignes pré-câblées (date, ETF, parts, prix, frais), PRU frais inclus — rien ne casse quand vous ajoutez des lignes`,
    `Vue Par ETF : PRU, valeur actuelle, performance, poids réel vs cible — jusqu'à ${TEMPLATE_ETF_MAX} ETF`,
    "Projection : simulateur d'intérêts composés paramétrable (versement, rendement, horizon 1 à 40 ans) avec graphique capital vs versements",
    "Frais : ce que le courtage et le TER vous coûtent réellement sur 10, 20 et 30 ans, en euros",
    "Double format Google Sheets (cours automatiques) + Excel, exemple pré-rempli avec 3 ETF PEA réels, mode d'emploi 5 minutes, mises à jour incluses",
  ],
  contents: TEMPLATE_CONTENTS,
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
      "Votre courtier et les agrégateurs vous montrent où vous en êtes. Le Cockpit calcule en plus où placer vos 300 € ce mois-ci, selon l'allocation que vous avez fixée.",
    themLabel: "Les autres",
    usLabel: "Cockpit DCA",
    rows: [
      {
        // 01/10/2026 : remplace « Templates gratuits (YouTube, Reddit) :
        // génériques, pensés pour l'investisseur américain ». Faux : des
        // modèles gratuits français et propres au PEA existent (étude du
        // 01/10/2026), et le site en donne un lui-même (/suivi-pea-excel).
        them: "Modèles gratuits, dont le nôtre : un journal des achats et une vue par ETF (PRU, valeur, poids)",
        us: "Les mêmes bases, plus le PEA (plafond, cap des 5 ans, 18,6 %), le TRI, le versement du mois, la projection et les frais",
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
        // 01/10/2026 : remplace « cours auto + manuel en secours ». Le cours
        // manuel n'est pas un secours : s'il est rempli, il passe DEVANT le
        // cours automatique (formule du cours retenu, Par ETF!G).
        them: "Un fichier fait maison : à étendre et à corriger soi-même",
        us: `${milliers(TEMPLATE_LIGNES)} lignes pré-câblées, cours automatiques dans Google Sheets tant que la colonne du cours manuel reste vide, mises à jour incluses`,
      },
      {
        them: "Agrégateurs type Finary : centrés sur la connexion bancaire, version complète sur abonnement annuel",
        us: "Aucune connexion bancaire, vos données restent chez vous, paiement unique",
      },
      {
        // 01/10/2026 : « PRU brut » retiré. Faux : BoursoBank, par exemple,
        // compte courtage et TTF dans le prix de revient (aide en ligne), et
        // notre propre Mode d'emploi rappelle que c'est l'usage français. Ne
        // reste que ce que la colonne « nous » montre et qu'un espace client
        // de courtier, en général, n'a pas.
        them: "Courtier : en général, ni projection, ni coût des frais sur 30 ans, ni calcul du versement du mois",
        us: "Projection composée + impact des frais sur 30 ans, en euros",
      },
    ],
  },
  apresComparatif: {
    avant: "Vous préférez construire le vôtre ? La méthode et les formules sont détaillées dans notre guide du ",
    lien: { href: "/suivi-pea-excel", libelle: "suivi PEA sur Excel ou Google Sheets" },
    apres: ", avec un modèle gratuit à télécharger.",
  },
  faq: [
    {
      q: "Excel ou Google Sheets ?",
      a: "Les deux sont inclus. Google Sheets récupère les cours automatiquement, tant que la colonne du cours manuel reste vide ; Excel fonctionne partout, la mise à jour manuelle des cours tient dans vos 2 minutes mensuelles. Mêmes formules, même structure.",
    },
    {
      q: "Je débute, c'est pour moi ?",
      a: "Oui : mode d'emploi 5 minutes intégré, exemple pré-rempli à remplacer par vos données, cases bleues = à remplir — tout le reste est automatique.",
    },
    // 01/10/2026 : l'ancienne réponse (« le cours manuel prend toujours le
    // relais ») taisait la règle réelle : le cours manuel ne prend le relais
    // que si on le saisit, et tant qu'il est saisi, il passe devant le cours
    // automatique, même quand celui-ci remonte.
    {
      q: "Et si un cours automatique tombe en panne ?",
      a: "Saisissez ce cours dans la colonne du cours manuel : tant qu'il est rempli, le fichier le retient à la place du cours automatique. Videz la case quand le cours automatique remonte, sinon le cours saisi reste figé. Et les mises à jour du fichier sont incluses.",
    },
    {
      q: "Pourquoi payer pour un tableur ?",
      a: "Vous n'achetez pas un tableur : vous achetez 2 minutes par mois et une décision claire à chaque versement, en un paiement unique, sans abonnement.",
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
//
// Nombre de pages et prix : écrits UNE fois. La meta, la liste « ce que vous
// obtenez » et le renvoi de fin d'article les lisent ici : trois « 63 » à
// retrouver à la main, c'est un oubli garanti (la v1.1 en a aussi 63). Le prix, lui, doit rester
// égal au prix Stripe (`livePriceId`) : un « 19 € » recopié dans la meta
// survivrait à sa hausse.
const GUIDE_PAGES = 63;
const GUIDE_PRIX = 19;
// Version, date de vérification et nombre d'ETF vérifiés : écrits une fois
// eux aussi, pour la même raison. Version 1.1 le 01/10/2026 : c'est le PDF
// préparé pour la livraison (private-assets/raw/guide-demarrer-dca.pdf), dont
// les pages sont montrées plus bas. Sa couverture garde « Chiffres vérifiés au
// 28 septembre 2026 » et ajoute « mise à jour du 30 septembre 2026 ».
const GUIDE_VERSION = "1.1";
const GUIDE_MAJ = "30 septembre 2026";
const GUIDE_DATE_VERIF = "28 septembre 2026";
const GUIDE_ETF = 13;

/**
 * Sommaire du PDF, pages 2 et 3, relu contre le rendu des pages de la v1.1 le
 * 01/10/2026 : mêmes numéros de page qu'en v1.0 ; seul le résumé de « Comment
 * lire ce guide » a changé (il annonce ce qui change en version 1.1).
 */
const GUIDE_SOMMAIRE: SommairePartie[] = [
  {
    partie: "Avant de commencer",
    entrees: [
      { repere: "—", titre: "Comment lire ce guide", resume: "Le parcours, ce que le guide ne fait pas, ses chiffres et ce qui change en version 1.1", page: 4 },
    ],
  },
  {
    partie: "Partie 1 · Comprendre",
    entrees: [
      { repere: "1", titre: "Le DCA : ce qu'il fait, ce qu'il ne fait pas", resume: "Une discipline pour l'épargne tirée du salaire, pas une méthode pour battre le marché", page: 8 },
      { repere: "2", titre: "Les ETF en dix minutes", resume: "Lire la fiche d'un ETF, savoir ce qu'il contient et ne pas se fier à son nom", page: 11 },
      { repere: "3", titre: "Le temps, le rendement et le risque", resume: "200 € par mois sur 10, 20 ou 30 ans, l'hypothèse de 7 % et le risque année par année", page: 14 },
    ],
  },
  {
    partie: "Partie 2 · Choisir",
    entrees: [
      { repere: "4", titre: "Décision n° 1 : PEA, CTO ou les deux", resume: "Les sept règles du PEA, le coût de la sortie en 2026 et l'arbre pour trancher", page: 17 },
      { repere: "5", titre: "Décision n° 2 : le courtier", resume: "Trois grilles officielles comparées, le coût d'un achat à votre montant, l'arbre n° 2", page: 21 },
      { repere: "6", titre: "Décision n° 3 : l'ETF", resume: `L'exposition d'abord, le fonds ensuite : ${GUIDE_ETF} ETF éligibles au PEA vérifiés, et les pièges`, page: 26 },
    ],
  },
  {
    partie: "Partie 3 · Mettre en place",
    entrees: [
      { repere: "7", titre: "Étape 0 : l'épargne de précaution", resume: "Chiffrer votre matelas en mois de revenus, le placer sur un livret, jamais dans le PEA", page: 30 },
      { repere: "8", titre: "Étape 1 : ouvrir le PEA et prendre date", resume: "Conditions, pièces, délais, questionnaire, et le versement qui lance les 5 ans", page: 31 },
      { repere: "9", titre: "Étape 2 : passer votre premier ordre", resume: "Le bon type d'ordre, le bon moment, et sept étapes valables chez les trois courtiers", page: 33 },
      { repere: "10", titre: "Étape 3 : automatiser", resume: "Le virement permanent d'abord, puis l'achat : plan programmé, Plan d'Épargne ou routine", page: 35 },
      { repere: "11", titre: "Étape 4 : fixer votre montant", resume: "Un montant tenable, sa projection à 20 ans, et les minimums, frais et prix de la part", page: 37 },
    ],
  },
  {
    partie: "Partie 4 · Tenir",
    entrees: [
      { repere: "12", titre: "Les baisses, chiffrées", resume: "Les baisses de 2008 à 2025 en euros, le pire départ de la série, et pourquoi continuer", page: 39 },
      { repere: "13", titre: "Le suivi minimal et la revue annuelle", resume: "Trois vérifications par mois, le vrai rendement, la revue annuelle et la déclaration", page: 42 },
      { repere: "14", titre: "Rééquilibrer (ou pas)", resume: "Rien à faire avec un seul ETF ; avec deux lignes, les versements font le travail", page: 45 },
      { repere: "15", titre: "Retirer après 5 ans", resume: "Retirer sans fermer le plan, ce que la banque retient, et l'arbre « j'ai besoin d'argent »", page: 46 },
    ],
  },
  {
    partie: "Les 7 erreurs les plus chères",
    entrees: [
      { repere: "E", titre: "Sept erreurs, classées par ce qu'elles coûtent", resume: "Ce que coûte chaque erreur, son signal d'alerte et sa parade", page: 49 },
    ],
  },
  {
    partie: "Annexes",
    entrees: [
      { repere: "A", titre: "Ma charte d'investisseur", resume: "Vos fondations, votre dispositif et vos règles de conduite, écrits à froid et signés", page: 52 },
      { repere: "B", titre: "Mon plan de crise, écrit à l'avance", resume: "Les situations qui font abandonner un DCA, et ce que vous avez décidé d'y faire, à froid", page: 54 },
      { repere: "C", titre: "Le calendrier annuel", resume: "Ce qu'il y a à faire chaque mois et à chaque saison, et une grille pour vos propres dates", page: 56 },
      { repere: "D", titre: "Glossaire", resume: "Chaque terme technique du guide en une ou deux lignes, avec le chapitre qui l'explique", page: 58 },
      { repere: "S", titre: "Sources et dates de vérification", resume: "Les documents de référence et leur version, et ce qu'il faut revérifier avant d'agir", page: 61 },
    ],
  },
];

// Pages rendues depuis le PDF v1.1 le 01/10/2026 (pymupdf, 1 600 × 2 265 :
// la page A4 de 594,96 × 841,92 pt à 1 600 px de large). Mêmes numéros de
// page qu'avec la v1.0 : le texte des pages 19, 39, 49 et 52 est identique
// (seul le pied de page change : logo du site, « v1.1 ») ; la couverture est
// refaite sur la base de marque (« Version 1.1 / mise à jour du 30 septembre
// 2026 ») et le sommaire change d'une ligne de résumé.
// Pages 22 (les courtiers) et 34 (le premier ordre) NON montrées : elles
// restent à revérifier après le 5/10/2026 (annonce BoursoBank,
// CHANGEMENTS.md), et la page de vente afficherait une grille périmée sous
// « chiffres vérifiés ».
const guidePage = (
  fichier: string,
  page: number,
  titre: string,
  alt: string,
  options: Partial<Pick<Capture, "eventail" | "horsFeuilleter">> = {},
): Capture => ({
  src: `/produits/${fichier}.png`,
  alt,
  width: 1600,
  height: 2265,
  repere: `p. ${page}`,
  titre,
  version: GUIDE_VERSION,
  ...options,
});

const GUIDE: Product = {
  id: "guide-demarrer-dca",
  format: `PDF de ${GUIDE_PAGES} pages`,
  chiffresCles: [
    { valeur: String(GUIDE_PAGES), libelle: "pages, chaque source citée" },
    { valeur: String(GUIDE_ETF), libelle: "ETF éligibles au PEA vérifiés un par un" },
    { valeur: "3", libelle: "arbres de décision numérotés : enveloppe, courtier, exposition" },
    { valeur: "7", libelle: "erreurs chiffrées en euros" },
  ],
  chiffresClesNote: `Chiffres vérifiés au ${GUIDE_DATE_VERIF} · version ${GUIDE_VERSION}`,
  sommaire: GUIDE_SOMMAIRE,
  pages: GUIDE_PAGES,
  version: GUIDE_VERSION,
  dateVerification: GUIDE_DATE_VERIF,
  slug: "guide-demarrer-dca",
  name: "Guide PDF — Démarrer le DCA en France",
  titreHero: { principal: "Guide PDF", complement: "Démarrer le DCA en France", principalEnPetit: true },
  shortName: "Guide Démarrer le DCA",
  tagline: "De zéro à votre premier investissement, puis une routine mensuelle qui tient dans la durée.",
  // « Le guide » devant le lien : « Guide Démarrer le DCA » ne se lit pas en
  // début de phrase. Le rôle reprend ce que la partie 2 et les annexes
  // contiennent réellement (voir `contents`) : l'ordre des décisions, les
  // arbres de décision, les fiches à remplir. Pas de « quel ETF acheter ».
  renvoi: {
    avantLien: "Le guide",
    lien: "«\u00a0Démarrer le DCA en France\u00a0»",
    role: "assemble le parcours dans l'ordre, de l'enveloppe à la routine mensuelle, avec arbres de décision et fiches à remplir",
    format: `PDF de ${GUIDE_PAGES}\u00a0pages`,
  },
  priceEur: GUIDE_PRIX,
  priceIdEnv: "STRIPE_PRODUCT_GUIDE_PRICE_ID",
  livePriceId: "price_1UL1rCLVB4yZ8CXvoFZG1wOj",
  screenshots: [
    {
      src: "/produits/guide-v1-1-couverture.png",
      alt: `Couverture du guide « Démarrer le DCA en France », édition septembre 2026 : chiffres vérifiés au ${GUIDE_DATE_VERIF}, version ${GUIDE_VERSION} mise à jour du ${GUIDE_MAJ}`,
      width: 1600,
      height: 2265,
      repere: "p. 1",
      titre: "Couverture",
      version: GUIDE_VERSION,
    },
    // Le sommaire : en éventail dans le hero, pas dans « Feuilleter » (il
    // est déjà sur la page en HTML).
    guidePage(
      "guide-v1-1-sommaire", 2, "Sommaire, parties 1 à 3",
      "Sommaire du guide, page 2 : Comment lire ce guide, puis les parties Comprendre, Choisir et Mettre en place, chapitres 1 à 11 avec leurs numéros de page",
      { eventail: true, horsFeuilleter: true },
    ),
    // Extrait lisible de la p. 19 (du titre au bas de l'encadré), rendu à
    // 3 px par point : même rectangle de pixels qu'avec la v1.0, contenu
    // identique au pixel près ; le zoom ouvre la page entière.
    {
      src: "/produits/guide-v1-1-arbre-enveloppe-extrait.png",
      alt: "Arbre de décision n° 1, page 19 : « Où loger votre DCA ? », cinq lignes, de « Si vous n'êtes pas fiscalement domicilié en France » à « Dans tous les autres cas : le PEA d'abord »",
      width: 1543,
      height: 1184,
      repere: "p. 19",
      titre: "Arbre de décision n° 1 : votre enveloppe",
      version: GUIDE_VERSION,
      extrait: true,
      complete: {
        src: "/produits/guide-v1-1-arbre-enveloppe.png",
        alt: "Page 19 : l'encadré « À retenir — prendre date, même avec peu », l'arbre de décision n° 1 pour choisir votre enveloppe, puis le début de « Et le CTO ? »",
        width: 1600,
        height: 2265,
      },
    },
    guidePage(
      "guide-v1-1-baisses", 39, "Les baisses, chiffrées",
      "Page 39 : ouverture du chapitre 12 « Les baisses, chiffrées » et le tableau des quatre baisses d'un ETF MSCI World en euros, de la crise financière au printemps 2025, avec leur délai de retour",
    ),
    guidePage(
      "guide-v1-1-sept-erreurs", 49, "Sept erreurs, classées par ce qu'elles coûtent",
      "Page 49 : les sept erreurs classées par ce qu'elles coûtent pour 200 € par mois, d'attendre le « bon moment » (environ 25 100 €) à investir son épargne de précaution",
      { eventail: true },
    ),
    guidePage(
      "guide-v1-1-charte", 52, "Annexe A : ma charte d'investisseur",
      "Annexe A, page 52 : la charte d'investisseur à remplir, avec vos fondations (épargne de précaution, objectif), votre dispositif (enveloppe, courtier, ETF) et votre rythme",
    ),
  ],
  metaTitle: "Guide PDF : Démarrer le DCA en France (PEA, ETF, courtiers)",
  metaDescription:
    `Lancer un DCA en France pas à pas\u00a0: PEA ou CTO, 3 courtiers et ${GUIDE_ETF} ETF vérifiés, baisses chiffrées, 7 erreurs à éviter. PDF de ${GUIDE_PAGES} pages, ${GUIDE_PRIX}\u00a0€.`,
  abstract: [
    "Tout ce qu'il faut pour démarrer un DCA existe gratuitement, éparpillé sur de nombreux sites qui se contredisent, et beaucoup ne sont pas à jour : fiscalité 2026, tarifs des courtiers. Ce guide assemble le parcours dans l'ordre, de « je ne sais pas par où commencer » à votre premier investissement, puis à une routine mensuelle.",
    `Chaque chiffre est sourcé et daté, vérifié au ${GUIDE_DATE_VERIF} : prélèvements sociaux à 18,6 %, grilles officielles de Trade Republic, BoursoBank et Fortuneo, ${GUIDE_ETF} ETF éligibles au PEA vérifiés un par un, baisses passées chiffrées en euros. Il ne vous dit pas quoi acheter : il vous donne des critères, des arbres de décision et des outils à remplir.`,
  ],
  features: [
    `PDF de ${GUIDE_PAGES} pages, chiffres vérifiés au ${GUIDE_DATE_VERIF}, chaque source citée`,
    "PEA ou CTO : les règles de 2026 et l'écart en euros, ramenés à quelques critères que vous appliquez à votre situation",
    "Trois courtiers (Trade Republic, BoursoBank, Fortuneo) comparés sur leurs grilles officielles, et le coût d'un achat selon votre montant",
    `Les ${GUIDE_ETF} ETF éligibles au PEA vérifiés (ISIN, frais), et les pièges : fonds non éligibles, versions plus chères du même indice`,
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
// 29/09/2026, price_1UL1t9LVB4yZ8CXvb69XgEnn), soit environ 13 % de moins.
// Le Cockpit reste à 19 € : aucune hausse prévue (décision du 01/10/2026),
// donc aucun recalcul du pack à prévoir.
//
// 01/10/2026 — le prix barré n'est plus écrit à la main (`compareAtEur: 38`) :
// `prixSepares` le calcule à partir de `inclut`. Si un prix unitaire change
// un jour, il suivra tout seul ; seul `priceEur` (et son prix Stripe) serait
// à revoir.
const BUNDLE_INCLUT: ProductId[] = ["guide-demarrer-dca", "template-suivi-dca"];
const BUNDLE_DELIVERABLES: Product["deliverables"] = [
  { label: "Guide PDF", fileKey: "guide-pdf" },
  { label: "Cockpit DCA — fichier Excel (.xlsx)", fileKey: "template-xlsx" },
  { label: "Cockpit DCA — version Google Sheets (copie en 1 clic)", sheetsCopy: true },
];
const BUNDLE_PRIX = 33;

const BUNDLE: Product = {
  id: "bundle-dca",
  slug: "pack-demarrage-dca",
  name: "Pack Démarrage DCA — Guide + Cockpit",
  shortName: "Pack Démarrage DCA",
  tagline: "Comprendre, démarrer, piloter : le pack complet.",
  titreHero: { principal: "Pack Démarrage DCA", complement: "Guide + Cockpit" },
  format: "PDF + classeur Excel et Google\u00a0Sheets",
  inclut: BUNDLE_INCLUT,
  // Tous calculés : jamais écrits. L'écart de prix n'y est plus : le prix
  // barré et sa ligne d'explication le disent déjà.
  chiffresCles: [
    { valeur: String(BUNDLE_INCLUT.length), libelle: "produits complets, avec leurs mises à jour" },
    { valeur: String(GUIDE_PAGES), libelle: "pages de guide, chaque source citée" },
    { valeur: String(TEMPLATE_CONTENTS.length), libelle: "onglets de classeur, du mode d'emploi aux frais" },
    { valeur: String(BUNDLE_DELIVERABLES.length), libelle: "liens livrés\u00a0: PDF, Excel, copie Google\u00a0Sheets" },
  ],
  priceEur: BUNDLE_PRIX,
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
  deliverables: BUNDLE_DELIVERABLES,
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

/**
 * Prix des produits inclus, achetés séparément : le seul prix barré permis
 * (directive Omnibus : une référence réelle et explicite, pas un ancien prix).
 * `null` pour un produit qui n'inclut rien.
 */
export function prixSepares(product: Product): number | null {
  if (!product.inclut?.length) return null;
  return product.inclut.reduce((somme, id) => somme + PRODUCTS[id].priceEur, 0);
}

/** Produits inclus dans un pack, dans l'ordre de `inclut`. */
export function produitsInclus(product: Product): Product[] {
  return (product.inclut ?? []).map((id) => PRODUCTS[id]);
}

// Garde-fous, évalués au chargement du module (donc au build et en dev) :
// - le H1 mis en page (`titreHero`) doit dire exactement `name` ;
// - le pack doit coûter moins que ses produits achetés séparément, sinon
//   « de moins qu'en achats séparés » deviendrait faux.
for (const p of PRODUCT_LIST) {
  if (p.titreHero && `${p.titreHero.principal} — ${p.titreHero.complement}` !== p.name) {
    throw new Error(`products.ts : titreHero de « ${p.id} » ne redonne pas son name.`);
  }
  const separes = prixSepares(p);
  if (separes !== null && separes <= p.priceEur) {
    throw new Error(`products.ts : le pack « ${p.id} » (${p.priceEur} €) n'est pas moins cher que ses produits séparés (${separes} €).`);
  }
}
