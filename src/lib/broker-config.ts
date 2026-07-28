/**
 * Configuration des partenariats courtiers (affiliation).
 *
 * ─── Source de vérité unique ────────────────────────────────────────────────
 *
 * Ce fichier ne pilote pas seulement l'affichage des boutons : il pilote AUSSI
 * les mentions légales du site, via <AffiliationNotice />. Tant que `enabled`
 * vaut false, le site affirme partout qu'il n'est affilié à aucun courtier ;
 * dès qu'un partenaire est actif, la mention bascule automatiquement en
 * divulgation « lien affilié ».
 *
 * ⚠️ Ne JAMAIS réécrire une mention d'affiliation en dur dans une page. Le
 * risque n'est pas cosmétique : un site qui touche une commission en affirmant
 * le contraire tombe sous l'art. L.121-2 du Code de la consommation (pratique
 * commerciale trompeuse). Passer par le composant garantit que les deux états
 * restent cohérents.
 *
 * ─── Pré-requis avant activation ────────────────────────────────────────────
 *
 *  A. SIRET obligatoire — bloquant, à faire en premier.
 *     TimeOne exige « une société, un entrepreneur individuel » à l'inscription.
 *     Awin et Kwanko acceptent un particulier mais bloquent le paiement sans
 *     identifiant fiscal. Micro-entreprise via le guichet unique INPI (gratuit),
 *     activité « régie publicitaire / mise à disposition d'espaces publicitaires
 *     sur site internet », code APE 7311Z, régime micro-BIC prestations de
 *     services (abattement 50 %, contre 34 % en BNC).
 *
 *  B. Conformité affichée — c'est aussi ce qui fait passer les validations
 *     manuelles des plateformes :
 *       - mention « lien affilié » AVANT le clic (art. L.111-7 Code conso +
 *         LCEN) → <AffiliateDisclaimer />, déjà rendu par <InvestCTA />
 *       - page /transparence détaillant le modèle économique
 *       - « ne constitue pas un conseil en investissement personnalisé »
 *       - risque de perte en capital sur chaque page produit
 *
 *  C. Une fois A + B faits : remplir `partners` puis passer `enabled` à true.
 *     Aucun autre changement de code n'est nécessaire.
 *
 * ─── Cadre réglementaire (vérifié le 28/07/2026) ────────────────────────────
 *
 *  Aucun statut CIF, ORIAS ou IOBSP n'est requis pour un comparateur qui ne
 *  délivre pas de recommandation personnalisée (AMF DOC-2008-23), et l'art.
 *  R.519-2 CMF exclut la « simple indication » d'un établissement.
 *
 *  La loi influenceurs de 2023 (art. L.533-12-7 CMF) ne couvre PAS ce périmètre :
 *  la position AMF DOC-2017-01 exclut explicitement actions, ETF, PEA et CTO.
 *  Elle vise les CFD, le forex et les options binaires.
 *
 *  🚫 CONSÉQUENCE DIRECTE : ne jamais ajouter XTB ni Trading 212 comme
 *  partenaires. Ce sont des brokers CFD ; promouvoir leur offre à effet de
 *  levier ferait entrer le site dans le périmètre interdit (2 ans de prison,
 *  300 000 € d'amende).
 *
 *  🚫 Ne jamais ajouter de programme assurance-vie (Linxea, Yomoni, Nalo,
 *  Goodvest, Ramify) : cela ferait basculer le site sous la directive
 *  distribution d'assurance et imposerait une immatriculation ORIAS.
 *
 * ─── Programmes identifiés (dossier du 28/07/2026) ──────────────────────────
 *
 *  Trade Republic  — Impact.com · PEA + plans DCA ETF · barème NON PUBLIC
 *                    → meilleur fit : c'est littéralement le sujet du site
 *  Fortuneo        — TimeOne (ID 1325) · barème NON PUBLIC, négociable
 *                    → seul programme du lot qui commissionne réellement du PEA/CTO
 *  BoursoBank      — Awin (ID 6992) · 80 € par compte BANCAIRE ouvert
 *                    ⚠️ ne rémunère PAS la Bourse. Revenu adjacent, pas le cœur.
 *                    Durée de cookie contradictoire entre deux sources officielles
 *                    (30 j côté Awin, 24 h côté Boursorama) — à faire trancher.
 *  LYNX Broker FR  — en direct · minimum 70 € par lead (seul barème PUBLIC)
 *                    cookie 30 j, orienté CTO, adossé à Interactive Brokers
 *
 *  Écartés : Bourse Direct (pas de programme), Degiro (aucune entrée France),
 *  Freedom24 (seuil de paiement 500 €/mois), Revolut, Interactive Brokers (CPC,
 *  pas de self-service), Scalable Capital (pas de programme FR public).
 */

export type AccountType = "PEA" | "CTO";

export interface BrokerPartner {
  id: string;
  name: string;
  url: string;
  accountTypes: AccountType[];
  /** Court libellé mis en avant à côté du bouton — 25 caractères max. */
  badge?: string;
  /**
   * Slug de la fiche courtier correspondante dans `brokers.ts`, quand elle
   * existe. Sert à <AffiliationNotice /> pour savoir si la page courante parle
   * d'un partenaire rémunéré ou non — les deux cas n'ont pas la même mention.
   */
  brokerSlug?: string;
  /** Plateforme d'affiliation, affichée sur /transparence. */
  network?: string;
  /**
   * Rémunération TELLE QU'ANNONCÉE par le programme, mot pour mot.
   * ⚠️ Jamais une estimation, jamais un ordre de grandeur reconstitué : cette
   * valeur est publiée sur /transparence. Si le barème n'est pas public (cas de
   * Trade Republic et Fortuneo), laisser vide — la page le dira explicitement,
   * ce qui est plus crédible qu'un chiffre inventé.
   */
  commission?: string;
  /** Mois de vérification de `commission`, format YYYY-MM. Obligatoire si `commission` est renseigné. */
  commissionVerifiedOn?: string;
}

export interface BrokerCTAConfig {
  /** Interrupteur maître. Ne passer à true qu'avec de vraies URLs en place. */
  enabled: boolean;
  partners: BrokerPartner[];
  /** Fine print affiché sous les boutons partenaires. */
  disclosureText: string;
}

// ─── Configuration active ─────────────────────────────────────────────────────

export const BROKER_CONFIG: BrokerCTAConfig = {
  // false = le site affirme partout qu'il n'est affilié à aucun courtier.
  // C'est vrai aujourd'hui. Ne basculer qu'une fois les candidatures acceptées.
  enabled: false,

  partners: [
    // Décommenter au fur et à mesure des acceptations. Un partenaire dont
    // l'URL n'est pas réelle ne doit PAS rester dans ce tableau : `enabled`
    // ne vérifie que la présence, pas la validité des liens.
    //
    // {
    //   id: "trade-republic",
    //   name: "Trade Republic",
    //   url: "[URL d'affiliation Impact.com]",
    //   accountTypes: ["PEA", "CTO"],
    //   badge: "Sans commission",
    //   brokerSlug: "trade-republic",
    //   network: "Impact.com",
    //   commission: "",              // barème non public — laisser vide
    // },
    // {
    //   id: "fortuneo",
    //   name: "Fortuneo",
    //   url: "[URL d'affiliation TimeOne — programme 1325]",
    //   accountTypes: ["PEA", "CTO"],
    //   brokerSlug: "fortuneo",
    //   network: "TimeOne",
    //   commission: "",              // barème non public, négocié — laisser vide
    // },
    // {
    //   id: "lynx",
    //   name: "LYNX Broker",
    //   url: "[URL d'affiliation LYNX]",
    //   accountTypes: ["CTO"],
    //   network: "Programme direct",
    //   commission: "70 € minimum par compte ouvert",
    //   commissionVerifiedOn: "2026-07",
    // },
  ],

  disclosureText:
    "DCA Tracker peut percevoir une commission si vous ouvrez un compte via les liens ci-dessus. Cela ne change rien au coût pour vous. Aucun classement payant : l'ordre des courtiers dépend uniquement de leur pertinence pour un DCA en ETF, et les courtiers avec lesquels je n'ai aucun partenariat restent présentés à égalité.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Vrai seulement si le bloc doit s'afficher (activé + au moins un partenaire). */
export function isBrokerCTAActive(): boolean {
  return BROKER_CONFIG.enabled && BROKER_CONFIG.partners.length > 0;
}

/** Partenaires filtrés par type de compte. `undefined` renvoie tout. */
export function getPartners(accountType?: AccountType): BrokerPartner[] {
  if (!accountType) return BROKER_CONFIG.partners;
  return BROKER_CONFIG.partners.filter((p) =>
    p.accountTypes.includes(accountType)
  );
}

/**
 * Le courtier dont le slug est passé est-il un partenaire rémunéré ?
 * Renvoie toujours null tant que l'affiliation est désactivée, pour qu'une
 * config à moitié remplie ne puisse pas déclencher une mention prématurée.
 */
export function getPartnerForBroker(brokerSlug: string): BrokerPartner | null {
  if (!isBrokerCTAActive()) return null;
  return (
    BROKER_CONFIG.partners.find((p) => p.brokerSlug === brokerSlug) ?? null
  );
}
