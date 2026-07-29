// Obligations d'information des comparateurs en ligne — SOURCE DE VÉRITÉ UNIQUE.
//
// ─── Pourquoi ce fichier existe ──────────────────────────────────────────────
//
// Un site qui compare les frais et caractéristiques de courtiers nommés dans un
// tableau est un « comparateur en ligne » au sens de l'art. L.111-7 II du code
// de la consommation. La qualification ne dépend ni de l'audience ni du statut :
// l'art. L.111-7-1, qui portait un seuil, est ABROGÉ depuis le 17/02/2024.
// Sanction d'un manquement : amende administrative jusqu'à 75 000 € pour une
// personne physique (art. L.131-4) — une micro-entreprise en nom propre en est
// une. Ce n'est pas théorique : CAA Paris, 30 octobre 2025, n° 23PA02514, a
// confirmé 230 000 € d'amende sur ce fondement.
//
// ─── État du droit au 28/07/2026 (vérifié sur Legifrance) ────────────────────
//
// Le décret n° 2024-753 du 7 juillet 2024 (en vigueur le 9 juillet 2024) a
// redistribué la matière. Les références antérieures circulent encore beaucoup
// et sont fausses aujourd'hui :
//
//   ❌ D.111-8 ne concerne PLUS les comparateurs — il régit les places de
//      marché en ligne. Le bandeau « en haut de chaque page de résultats » est
//      désormais au II de l'art. D.111-7.
//   ❌ D.111-6 n'est pas la liste « spéciale comparateurs » — il porte les
//      modalités de référencement / déréférencement / classement, et il
//      s'applique en plus de D.111-7, pas à sa place.
//   ✅ D.111-7 est l'article propre aux comparateurs.
//
// Ce que doit couvrir le site, et où :
//
//   D.111-6 I   → rubrique accessible depuis toutes les pages : conditions de
//                 référencement et de déréférencement, critères de classement
//                 par défaut et leurs paramètres, existence d'une rémunération
//                 influençant le classement.            → /transparence
//   D.111-7 I   → rubrique : critères + définitions, relations contractuelles,
//                 rémunération et son impact, éléments constitutifs du prix,
//                 garanties commerciales, exhaustivité + nombre de références,
//                 périodicité et méthode d'actualisation. → /transparence
//   D.111-7 II  → en haut de CHAQUE page de résultats, avant le classement :
//                 critère par défaut + définition, exhaustivité + nombre,
//                 caractère payant ou non du référencement.
//                                                        → <ComparisonDisclosure />
//   D.111-6 II  → sur chaque page de résultats, le critère utilisé (renvoi à la
//                 rubrique autorisé) ; et un marqueur distinctif sur tout
//                 résultat dont le CLASSEMENT est influencé par une
//                 rémunération.                          → <ComparisonDisclosure />
//   D.111-7 IV  → mention « Annonces » — seul libellé littéralement imposé,
//                 et uniquement si le RANG dépend d'une rémunération.
//                 Non applicable ici : voir RANKING_IS_PAID_INFLUENCED.
//
//   D.111-7 III → 🔴 NON COUVERT À CE JOUR. Le texte impose, à proximité de
//                 CHAQUE offre comparée, les caractéristiques essentielles et
//                 « le prix total à payer par le consommateur », frais compris.
//                 Le site affiche les frais en TEXTE LIBRE (« 0,20 % par ordre
//                 (minimum applicable) ») : aucun total n'est calculable, et le
//                 minimum d'ordre de Fortuneo n'est même pas documenté.
//                 Structurer `BrokerSpecs` en valeurs numériques n'est donc pas
//                 une amélioration produit, c'est la condition pour se
//                 conformer — et le même chantier débloque le calcul du coût
//                 réel d'un DCA courtier par courtier.
//                 → lot dédié, avec revérification sourcée et datée de chaque
//                   grille tarifaire. Ne pas prétendre à la conformité D.111-7
//                   tant que ce point n'est pas traité.
//
// ⚠️ Ne pas dupliquer ces informations en dur dans une page. Elles doivent
// rester dérivées d'ici, sinon elles divergeront de la réalité du site — ce qui
// est exactement le manquement que les textes sanctionnent.

import { BROKER_LIST, BROKERS_REVIEWED_ON } from "./brokers";
import {
  ETF_COMPARISON_LIST,
  ETF_COMPARISONS_REVIEWED_ON,
} from "./etf-comparisons";
import { ETF_LIST } from "./etf-config";

/**
 * Le rang d'affichage dépend-il d'une rémunération ?
 *
 * NON, et ce doit rester non. Les partenariats d'affiliation rémunèrent une
 * ouverture de compte, jamais une position dans une liste. Tant que cette
 * constante vaut false :
 *   - aucune mention « Annonces » n'est due (D.111-7 IV) ;
 *   - aucun marqueur par résultat n'est dû (D.111-6 II, 1er alinéa).
 *
 * 🚫 Si un partenaire obtient un jour une position contre paiement, il faut
 * passer ceci à true ET implémenter les deux obligations ci-dessus. Ne pas
 * basculer cette valeur sans ça.
 */
export const RANKING_IS_PAID_INFLUENCED = false;

/** Peut-on payer pour figurer dans une comparaison ? Non. (D.111-7 II 3°) */
export const REFERENCING_IS_PAID = false;

export interface RankingCriterion {
  /** Formulation courte du critère par défaut, affichée dans le bandeau. */
  label: string;
  /** Définition du critère — imposée à proximité du critère (D.111-7 II 1°). */
  definition: string;
  /** Paramètres principaux, du plus au moins déterminant (D.111-6 I 2°). */
  parameters: string[];
}

export interface ComparisonSurface {
  criterion: RankingCriterion;
  /** Nombre d'acteurs ou d'offres référencés — dérivé, jamais écrit à la main. */
  count: number;
  /** Ce que compte `count`, au singulier/pluriel déjà accordé. */
  countLabel: string;
  /** Mois de dernière revérification des données comparées. */
  reviewedOn: string;
}

// ─── Critères de classement ───────────────────────────────────────────────────
//
// ⚠️ Ces critères décrivent une appréciation ÉDITORIALE, pas un tri automatique.
// C'est volontairement dit tel quel sur /transparence : l'ordre d'affichage des
// courtiers vient du tableau `BROKER_LIST`, il n'est pas calculé. Publier
// « classé par coût croissant » serait faux — les frais sont stockés en texte
// libre (« 0,60 % par ordre (min 1,99 €) »), donc non comparables par le code,
// et le minimum d'ordre de Fortuneo n'est pas documenté.
//
// Pour passer un jour à un vrai classement calculé, il faut d'abord structurer
// les frais en nombres dans BrokerSpecs. C'est aussi ce qui débloquerait le
// « combien VOTRE DCA coûte chez chacun ».

const BROKER_CRITERION: RankingCriterion = {
  label: "pertinence pour un DCA en ETF",
  definition:
    "le coût réel d'un versement mensuel récurrent en ETF sur le long terme, apprécié avant tout autre paramètre",
  parameters: [
    "Le coût réel d'un DCA : frais d'ordre, gratuité ou non de l'épargne programmée, frais de tenue de compte. C'est le paramètre dominant, parce que c'est celui qui pèse sur vingt ans.",
    "Les enveloppes disponibles — PEA, compte-titres — et leur éligibilité aux ETF concernés.",
    "La régulation et la garantie des dépôts, avec l'entité juridique réellement teneuse de compte.",
    "Le montant minimum d'investissement, décisif en dessous de 150 € par mois.",
    "L'expérience d'usage, en dernier, parce qu'elle se juge mal à la place de quelqu'un d'autre.",
  ],
};

const ETF_CRITERION: RankingCriterion = {
  label: "coût et adéquation à un DCA long terme",
  definition:
    "les frais de gestion annuels (TER) à indice répliqué équivalent, corrigés de l'éligibilité au PEA",
  parameters: [
    "Les frais de gestion (TER), à indice répliqué identique.",
    "L'indice répliqué et la couverture réelle — deux ETF « monde » ne couvrent pas toujours la même chose.",
    "L'éligibilité au PEA, qui pèse souvent plus lourd que le TER.",
    "La méthode de réplication et la politique de distribution (capitalisant ou distribuant).",
    "L'encours et la liquidité, ainsi que le prix de part quand il détermine ce qu'on peut acheter avec 100 €.",
  ],
};

// ─── Surfaces de comparaison ──────────────────────────────────────────────────

export type SurfaceKind = "brokers" | "etf-comparisons" | "etf-list";

export function getComparisonSurface(kind: SurfaceKind): ComparisonSurface {
  switch (kind) {
    case "brokers":
      return {
        criterion: BROKER_CRITERION,
        count: BROKER_LIST.length,
        countLabel: "courtiers référencés",
        reviewedOn: BROKERS_REVIEWED_ON,
      };
    case "etf-comparisons":
      return {
        criterion: ETF_CRITERION,
        count: ETF_COMPARISON_LIST.length,
        countLabel: "comparaisons publiées",
        reviewedOn: ETF_COMPARISONS_REVIEWED_ON,
      };
    case "etf-list":
      return {
        criterion: ETF_CRITERION,
        count: ETF_LIST.length,
        countLabel: "ETF suivis",
        reviewedOn: ETF_COMPARISONS_REVIEWED_ON,
      };
  }
}

/** Toutes les surfaces, pour la rubrique récapitulative de /transparence. */
export const ALL_SURFACES = [
  { kind: "brokers" as const, title: "Courtiers", href: "/comparatif" },
  {
    kind: "etf-comparisons" as const,
    title: "Comparaisons d'ETF",
    href: "/comparatif-etf",
  },
  { kind: "etf-list" as const, title: "ETF suivis", href: "/comparer-etf" },
];

// ─── Conditions de référencement et de déréférencement (D.111-6 I 1°) ─────────

export const REFERENCING_RULES = {
  inclusion: [
    "être accessible à un résident fiscal français",
    "être régulé dans l'Espace économique européen",
    "proposer des ETF en versement récurrent, ou être un ETF accessible depuis une enveloppe française",
    "publier des conditions tarifaires que je peux vérifier moi-même sur le site officiel",
  ],
  exclusion: [
    "ses conditions tarifaires ne sont plus vérifiables publiquement",
    "il cesse d'être accessible depuis la France",
    "je constate une information trompeuse dans sa communication commerciale",
  ],
  /** Périmètres exclus par principe, quelle que soit la qualité de l'acteur. */
  outOfScope: [
    "l'assurance-vie et la gestion pilotée, qui relèvent de la distribution d'assurance et exigeraient une immatriculation ORIAS",
    "les CFD, le forex et les options binaires, dont la promotion est pénalement encadrée",
  ],
} as const;

// ─── Prix (D.111-7 I 4°) ──────────────────────────────────────────────────────

export const PRICE_COMPOSITION = {
  included: [
    "les frais d'ordre annoncés par le courtier, et le cas échéant leur minimum ou leur plafond",
    "les frais de tenue de compte ou de garde",
    "les frais de gestion annuels de l'ETF (TER), quand un ETF est comparé",
  ],
  excluded: [
    "les frais de change, qui dépendent de la devise de l'ordre et du jour",
    "les frais de transfert sortant, propres à chaque situation",
    "la fiscalité, qui dépend de l'enveloppe, de la date d'ouverture et de la situation personnelle",
  ],
  /** D.111-7 I 5° — « le cas échéant ». Il n'y a pas de garantie commerciale ici. */
  commercialGuarantees:
    "Aucune garantie commerciale n'est comprise dans les prix comparés : il s'agit de tarifs de services financiers, pas de biens vendus avec garantie.",
} as const;

// ─── Actualisation (D.111-7 I 7°) ─────────────────────────────────────────────

export const UPDATE_POLICY = {
  cadence:
    "Les conditions tarifaires des courtiers et les frais des ETF sont revérifiés au moins deux fois par an, et à chaque fois qu'un changement est annoncé par l'établissement ou l'émetteur.",
  method:
    "La vérification se fait à la main, sur la page tarifaire officielle de chaque établissement. Aucune donnée tarifaire n'est récupérée automatiquement : une grille tarifaire mal lue par un robot est pire qu'une grille datée.",
  quotes:
    "Les cours affichés ailleurs sur le site suivent leur propre fréquence, indiquée à côté de chaque cours, et sont potentiellement différés.",
} as const;

/**
 * Date de dernière révision de la page /transparence elle-même.
 * ⚠️ À bumper à CHAQUE modification de ce fichier ou de la liste des
 * partenaires. Une date saisie et oubliée est une date qui ment.
 */
export const DISCLOSURE_REVISED_ON = "2026-07-28";
