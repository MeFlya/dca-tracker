// Broker comparison data for /comparatif/*.
// Static content — update carefully when broker pricing changes.
// Always link to the broker's official page for live prices.
//
// ─── Revue du 28/09/2026 ─────────────────────────────────────────────────────
//
// Les trois fiches ont été réécrites contre les grilles en vigueur (citées en
// commentaire au-dessus de chacune, avec date et URL : c'est la trace de
// vérification). Ce qui était faux avant cette revue, pour mémoire :
//   · PEA Trade Republic « depuis 2023 » : lancé le 9 janvier 2025 ;
//   · le FGDR appliqué à Trade Republic, banque allemande qui relève de l'EdB ;
//   · plafond légal de transfert de PEA « 150 € par ligne, 500 € au total » :
//     c'est 15 € par ligne cotée et 150 € au total (art. D221-111-1 CMF) ;
//   · Fortuneo « 0,20 % par ordre » : ancien tarif, réservé aux anciens clients ;
//   · Bourso « 0,60 % » sans le plafond de 0,5 % du PEA, ni l'ordre minimum
//     de 200 € sur ETF, ni les ETF Boursomarkets à 0 € ;
//   · « Matla » présenté comme l'assurance-vie de Bourso : c'est son PER ;
//   · « 3 000 à 5 000 € » d'économies sur 20 ans pour 1 € par ordre de 200 € :
//     le moteur répond environ 490 € (coutFraisOrdre, fait BT-33).
// Tout montant qui sort d'une projection est désormais interpolé depuis
// ecart-frais.ts ; les montants écrits à la main sont des faits tarifaires.

import { TER_REFERENCE_SIMULATEUR } from "@/lib/etf-config";
import { coutFraisOrdre, fraisOrdrePayes, HYPOTHESES_COMPARATIFS } from "@/lib/ecart-frais";
import { dateEnToutesLettres } from "@/lib/etf-pea-verifies";

/**
 * Mois de dernière revérification des conditions tarifaires, format YYYY-MM.
 *
 * ⚠️ Exporté et AFFICHÉ publiquement (page /transparence + bandeau des pages de
 * comparaison) au titre de l'art. D.111-7 I 7° du code de la consommation
 * — « la périodicité et la méthode d'actualisation des offres comparées ».
 * À bumper à chaque revue réelle des tarifs, jamais par confort.
 */
export const BROKERS_REVIEWED_ON = "2026-09";

export type BrokerSpecs = {
  pea: boolean;
  cto: boolean;
  assuranceVie: boolean;
  custodyFees: string;      // "Gratuit" / "0 €"
  orderFeesText: string;    // e.g. "1 € par ordre" ; le 2e segment après « · » est mis en avant sur /comparatif
  minDeposit: string;       // "0 €"
  regulation: string;       // "BaFin (Allemagne) + AMF"
  mobile: 1 | 2 | 3 | 4 | 5;
  savingsPlan: "Oui" | "Non" | "Partielle"; // épargne programmée auto sur ETF
};

export type BrokerData = {
  /** Dates ISO relevées dans git, courtier par courtier — cf. etf-comparisons.ts.
   *  Elles étaient écrites en dur dans BrokerPage.tsx : les trois fiches
   *  affichaient « 10 juin 2026 », ce qui était vrai pour une seule d’entre
   *  elles. Sur des pages dont le sujet EST les frais, une date fausse invite
   *  le lecteur à douter du reste. */
  publishedAt: string;
  updatedAt: string;
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

// ─── Montants calculés (jamais recopiés) ──────────────────────────────────────
//
// Hypothèses de la prose : 200 €/mois pendant 20 ans, 7 %/an avant frais,
// TER de référence du simulateur. 1 € par ordre de 200 € = 0,5 % du versement,
// soit exactement le plafond légal des frais d'ordre en PEA.

const MENSUEL = HYPOTHESES_COMPARATIFS.monthlyAmount;
const DUREE = HYPOTHESES_COMPARATIFS.durationYears;
const RENDEMENT = HYPOTHESES_COMPARATIFS.annualReturnPct;
const TER_HYP = TER_REFERENCE_SIMULATEUR.toLocaleString("fr-FR", {
  minimumFractionDigits: 2,
});
/** 1 € × 12 × 20 ans = 240 (frais payés). */
const FRAIS_1_EURO_PAYES = fraisOrdrePayes(1);
/** Capital final en moins avec 1 € prélevé sur chaque versement ≈ 490 (BT-33). */
const FRAIS_1_EURO_CAPITAL = coutFraisOrdre(1, TER_REFERENCE_SIMULATEUR);

/** Plafond légal des frais d'ordre dans un PEA : 0,5 % du montant (CMF art. D221-111-1). */
export const PLAFOND_ORDRE_PEA = 0.005;

// ─── BoursoBank : grille au 5 octobre 2026 (relue le 09/10/2026) ─────────────
//
// Déclarés ici, avant la fiche, parce que la fiche ET le tableau des
// comparatifs d'ETF (FRAIS_ORDRE_ETF_PEA, plus bas) les emploient : un seul
// endroit à changer à la prochaine grille. Sources et archives : commentaire
// au-dessus de BOURSORAMA.

/**
 * BoursoBank : montant minimum d'un ordre d'achat d'ETF, en PEA comme en
 * compte-titres, gamme Boursomarkets ou non (brochure au 05/10/2026, p. 23,
 * identique dans les quatre colonnes ; 200 € dans la brochure au 04/09/2026).
 * Exporté : les pages qui citent ce minimum l'interpolent, au lieu de le
 * recopier.
 */
export const BOURSO_MINIMUM_ORDRE_ETF = 100;

/** Date d'effet de la brochure tarifaire BoursoBank que le site cite. */
export const BOURSO_BROCHURE_DU = "5 octobre 2026";

/**
 * BoursoBank, forfait Découverte, ETF hors Boursomarkets, dans un PEA :
 * 1,99 € jusqu'à 500 €, puis 0,60 % (brochure au 05/10/2026, p. 20), ramené au
 * plafond légal de 0,5 % (note 1 de la même page).
 */
function fraisBoursoDecouvertePea(montant: number): { tarif: number; frais: number } {
  const tarif = montant <= 500 ? 1.99 : montant * 0.006;
  return { tarif, frais: Math.min(tarif, montant * PLAFOND_ORDRE_PEA) };
}

/** Frais d'un ordre hors Boursomarkets au minimum d'ordre, en PEA (0,50 € au 05/10/2026). */
const BOURSO_FRAIS_PEA_AU_MINIMUM = euros(fraisBoursoDecouvertePea(BOURSO_MINIMUM_ORDRE_ETF).frais);

/**
 * Ordre de MENSUEL € hors Boursomarkets, forfait Découverte : tarif et frais
 * en PEA (1,99 € ramenés à 1,00 € pour 200 €, brochure au 05/10/2026). La
 * prose de la fiche les interpole : si le versement des hypothèses change,
 * elle suit, comme le tableau des comparatifs.
 */
const BOURSO_ORDRE_MENSUEL = fraisBoursoDecouvertePea(MENSUEL);
/** Le plafond de 0,5 % joue-t-il sur un ordre de MENSUEL € ? */
const BOURSO_MENSUEL_PLAFONNE = BOURSO_ORDRE_MENSUEL.frais < BOURSO_ORDRE_MENSUEL.tarif;

/** 12 → « 12 € » ; 23.88 → « 23,88 € » : sommes annuelles, sans centimes inutiles. */
function eurosAnnuels(v: number): string {
  const centimes = Math.round(v * 100) % 100 !== 0;
  return `${v.toLocaleString("fr-FR", { minimumFractionDigits: centimes ? 2 : 0, maximumFractionDigits: 2 })} €`;
}

/**
 * Date du constat de la gamme Boursomarkets et de son partenaire ETF (page
 * Boursomarkets de BoursoBank, fiches Boursorama), YYYY-MM-DD. 09/10/2026 :
 * la brochure au 05/10/2026 ne nomme pas le partenaire ; que le passage
 * d'iShares à Amundi date du 5 octobre, seule la presse le dit. La prose date
 * donc le partenaire du jour du constat, pas de la brochure.
 */
const BOURSO_GAMME_CONSTATEE_LE = "2026-10-09";

// ─── Brokers ──────────────────────────────────────────────────────────────────

// Grilles et documents utilisés (consultés le 28/09/2026) :
//  · Trade Republic, grille tarifaire publique (modale pricing-scheme du site
//    fr-fr, entrée mise à jour le 30/06/2026) :
//    https://traderepublic.com/fr-fr?openModal=pricing-scheme
//  · Trade Republic, Contrat client version CA 07.08 (8/2026), annexe 12
//    (conditions particulières du PEA) :
//    https://assets.traderepublic.com/assets/files/CA_FR-en-fr.pdf
//  · Trade Republic, page PEA : https://traderepublic.com/fr-fr/pea
//  · Centre d'aide : https://support.traderepublic.com/fr-fr/378 (frais des
//    plans), /380 (dates d'exécution), /760 (plans et fractions), /3293
//    (1 € déposé à l'ouverture du PEA), /3295 (ouverture ou transfert)
//  · Communiqué du 9 janvier 2025 (lancement du PEA) :
//    https://assets.traderepublic.com/assets/files/250109_TradeRepublic_PressRelease_BirthdayAnnouncement_FR_FR.pdf
//  · Fiche d'information du déposant (EdB, 100 000 €) :
//    https://assets.traderepublic.com/assets/files/TradeRepublic_DepositorInformationSheet.pdf
//  · Indemnisation des investisseurs (90 %, 20 000 €) : BaFin,
//    https://www.bafin.de/DE/verbraucherinnen-verbraucher/themen-finanzprodukte/geldanlage/einlagensicherung-anlegerentschaedigung/einlagensicherung-anlegerentschaedigung.html
//    et EdB, https://edb-banken.de/en/faqs
//  · Plafonds légaux des frais du PEA : CMF art. D221-111-1,
//    https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043790337
// Non confirmé officiellement (donc jamais affirmé ci-dessous) : les parts
// entières obligatoires dans le PEA (sources secondaires seulement ; le centre
// d'aide dit que les plans peuvent acheter des fractions, sans parler du PEA),
// le montant minimum d'un plan, le coût d'un transfert sortant du PEA.
const TRADE_REPUBLIC: BrokerData = {
  slug: "trade-republic",
  publishedAt: "2026-04-19",
  updatedAt: "2026-09-28",
  name: "Trade Republic",
  shortName: "Trade Republic",
  tagline: "Banque allemande, plans d'investissement programmé sans frais d'achat",
  homepageUrl: "https://traderepublic.com",
  metaTitle:
    "Trade Republic pour un DCA ETF : avis, frais et PEA en 2026",
  metaDescription:
    "Trade Republic est-il adapté à un DCA ETF ? Analyse complète des frais, du PEA, de l'épargne programmée et comparaison avec BoursoBank et Fortuneo.",

  heroIntro:
    "Trade Republic est une banque allemande en ligne qui revendique plus de 10 millions de clients (chiffre annoncé par le courtier lui-même). Son PEA existe depuis le 9 janvier 2025, date de l'ouverture de sa succursale française. Pour un DCA en ETF, son argument tient en deux lignes de sa grille tarifaire : les plans d'investissement programmé s'exécutent sans frais d'achat, et un ordre ponctuel coûte 1 €.",

  specs: {
    pea: true,
    cto: true,
    assuranceVie: false,
    custodyFees: "0 € (aucun frais de garde ni d'inactivité dans la grille publique)",
    orderFeesText: "1 € par ordre (2 € avec Direct Price) · 0 € par plan d'investissement programmé",
    minDeposit: "0 € (1 € déposé par Trade Republic à l'ouverture du PEA)",
    regulation: "BaFin (maison mère, Allemagne) · ACPR et AMF (succursale France) · garantie allemande EdB, pas le FGDR (100 000 € d'espèces ; titres : 90 % dans la limite de 20 000 €)",
    mobile: 5,
    savingsPlan: "Oui",
  },

  pros: [
    "Plans d'investissement programmé en ETF sans frais d'achat, chaque semaine, deux fois par mois, chaque mois ou chaque trimestre, modifiables et résiliables sans frais",
    "Ordre ponctuel à 1 € fixe, quel que soit le montant (2 € sur une bourse avec « Direct Price »)",
    "PEA proposé depuis le 9 janvier 2025, ouverture gratuite et sans versement minimum : Trade Republic dépose 1 € pour lancer le délai fiscal de 5 ans",
    "Aucun frais de tenue de compte, de garde ni d'inactivité dans la grille tarifaire publique",
    "PEA Jeune possible pour les 18-25 ans",
  ],

  cons: [
    "Pas d'assurance-vie, ni d'agence physique",
    "Garantie allemande, pas le FGDR : dépôts couverts jusqu'à 100 000 € ; pour les titres, l'indemnisation allemande couvre 90 % des créances liées aux opérations sur titres, plafonnée à 20 000 €",
    "Dans le PEA, le centre d'aide ne dit pas si les plans achètent des fractions de parts ou seulement des parts entières : à vérifier dans l'application avant de programmer un petit montant",
    "Coût d'un transfert sortant du PEA absent de la grille publique (la loi le plafonne à 15 € par ligne cotée et 150 € au total)",
    "La liste complète des tarifs n'est consultable que dans l'application",
  ],

  dcaFitTitle: "Trade Republic convient à un DCA automatique, sans frais d'achat",
  dcaFitBody:
    `Le point fort pour un DCA est le plan d'investissement programmé : l'achat part tout seul, à date fixe (le 2, le 9, le 16 ou le 23 du mois selon le rythme choisi), sans frais d'achat. Face à des ordres ponctuels à 1 €, soit 0,5 % d'un achat de ${MENSUEL} € et le plafond légal des frais d'ordre en PEA, l'économie est réelle mais mesurée : sur ${MENSUEL} €/mois pendant ${DUREE} ans, ${FRAIS_1_EURO_PAYES} € de frais évités, et environ ${FRAIS_1_EURO_CAPITAL} € de capital en plus à l'arrivée en comptant ce que ces frais auraient rapporté (hypothèse de ${RENDEMENT} %/an). L'intérêt principal est ailleurs : un versement qui s'exécute sans y penser. En contrepartie, le PEA est couvert par la garantie allemande et non par le FGDR.`,

  bestFor: [
    "Épargnants qui veulent automatiser un versement mensuel en ETF sans frais d'achat",
    "Investisseurs à l'aise avec une gestion entièrement dans l'application",
    "Ceux qui veulent ouvrir un PEA sans versement minimum ni frais de garde",
  ],

  notIdealFor: [
    "Investisseurs qui veulent une assurance-vie (produit non proposé)",
    "Ceux qui tiennent à la garantie française du FGDR ou à une agence physique",
  ],

  // Calcul (grille publique Trade Republic, consultée le 28/09/2026) :
  //   plan programmé : 0 € par exécution → 0 €/an → 0 € sur 20 ans (240 versements) ;
  //   ordre ponctuel : 1 € × 12 = 12 €/an ; 1 € × 240 = 240 € sur 20 ans ;
  //   capital en moins avec 1 € prélevé sur chaque versement de 200 € :
  //   runSimulation 200 contre 199 €/mois, 20 ans, 7 %, TER 0,38 % → 488 €,
  //   arrondi à 490 € (coutFraisOrdre, fait BT-33) ;
  //   revente : 1 € par ordre (frais de règlement externe pour un plan).
  feeExample:
    `Pour ${MENSUEL} €/mois via un plan d'investissement programmé : 0 € de frais d'achat, soit 0 € sur ${DUREE} ans. En ordres ponctuels : 1 € par ordre, soit 12 €/an et ${FRAIS_1_EURO_PAYES} € sur ${DUREE} ans, qui amputent le capital final d'environ ${FRAIS_1_EURO_CAPITAL} € (hypothèses : ${RENDEMENT} %/an, ETF à ${TER_HYP} % de frais). La revente coûte 1 € par ordre. L'écart entre prix d'achat et prix de vente (fourchette) n'est pas compté.`,

  faq: [
    {
      q: "Le PEA Trade Republic est-il aussi sûr qu'un PEA classique ?",
      a: "Sur le plan fiscal, oui : ce sont les règles de tout PEA (150 000 € de versements au maximum, gains exonérés d'impôt sur le revenu après 5 ans, prélèvements sociaux dus au retrait). La garantie, en revanche, n'est pas celle d'une banque française. Trade Republic est une banque allemande : elle relève du fonds de garantie allemand (EdB), pas du FGDR. Les dépôts sont couverts jusqu'à 100 000 € par client. Les titres, vos ETF, restent votre propriété et ne sont pas « garantis » en tant que tels : si la banque ne pouvait plus les restituer, l'indemnisation allemande couvre 90 % des créances liées aux opérations sur titres, dans la limite de 20 000 €. Les 70 000 € de garantie des titres du FGDR ne s'appliquent pas à Trade Republic.",
    },
    {
      q: "Puis-je transférer mon PEA existant vers Trade Republic ?",
      a: "Oui, sous conditions : le transfert doit porter sur tout le PEA (pas de transfert partiel), tous les titres doivent être négociables chez Trade Republic, sinon le transfert est annulé, et le plan ne doit contenir aucun titre non coté. Trade Republic annonce 4 à 5 semaines en général, jusqu'à 3 mois dans des cas exceptionnels. Votre ancien établissement peut facturer le transfert, mais la loi plafonne ces frais à 15 € par ligne cotée et à 150 € au total (art. D221-111-1 du code monétaire et financier). Le transfert ne fait pas perdre l'antériorité fiscale du PEA.",
    },
    {
      q: "Quel est le meilleur ETF à acheter chez Trade Republic pour un DCA ?",
      // 28/09/2026 (table de vérité ETF) : TER d'ESE 0,15 → 0,14 % ; ajout de
      // PSP5 et SPEA, moins chers ; « CW8 plus liquide » retiré faute de
      // source ; TER de VWCE (0,14 %) précisé ; VUSA est distribuant.
      a: "Pour un PEA : un ETF MSCI World comme WPEA ou DCAM (TER 0,20 %) — ou CW8, la référence historique (0,38 %). Pour le S&P 500 en PEA : SPEA (0,10 %), PSP5 (0,12 %) ou ESE (0,14 %). Pour un CTO : VWCE (Vanguard FTSE All-World, émergents inclus, 0,14 %) ou VUSA (Vanguard S&P 500, distribuant, 0,07 %). Les plans d'investissement programmé s'exécutent sans frais d'achat : vérifiez dans l'application que l'ETF choisi y est proposé, dans le PEA comme dans le compte-titres.",
    },
    {
      q: "Y a-t-il un montant minimum d'investissement mensuel ?",
      a: "Trade Republic ne publie pas de minimum pour les plans d'investissement programmé dans ses documents officiels. Son centre d'aide indique que les plans peuvent acheter des fractions de parts, sans préciser ce qu'il en est dans le PEA ; plusieurs comparateurs affirment que seules des parts entières y sont achetées. Si c'est le cas, un montant inférieur au prix d'une part n'achète rien, et le reste demeure en espèces, non rémunérées dans un PEA. Vérifiez dans l'application avant de programmer un petit montant.",
    },
  ],
};

// Grilles et documents utilisés (BoursoBank relue le 09/10/2026) :
//  · BoursoBank, brochure tarifaire « Tarifs applicables au 5 octobre 2026 »
//    (courtage p. 20, montants minimum et autres frais p. 23, transfert et
//    changement d'offre p. 25), même URL que la brochure « au 4 septembre
//    2026 » qu'elle remplace (« annulent et remplacent à compter du
//    05/10/2026 », p. 2) ; archive sha1 10c057e2… :
//    https://www.boursobank.com/content/brochure_tarifaire/boursorama_bt.pdf
//  · BoursoBank, Conditions générales applicables au 15/04/2026 (adhésion au
//    FGDR) : https://www.boursorama.com/content/pdf/conditions-generales/conditions-generales.pdf
//  · Pages officielles : https://www.boursobank.com/bourse/pea-plan-epargne-actions
//    (relue le 09/10/2026 : versement initial de 10 €, « dès 0,50 € de frais
//    de courtage hors Boursomarkets ») ,
//    https://www.boursobank.com/bourse/plan-epargne ,
//    https://www.boursobank.com/aide-en-ligne/bourse/plan-d-epargne/question/quels-sont-les-frais-associes-au-plan-d-epargne-41162016 ,
//    https://www.boursobank.com/bourse/boursomarkets-courtage-bourse-gratuit
//    (relue le 09/10/2026 : partenaire ETF « Amundi Investment Solutions »,
//    0 € à l'achat seulement) ,
//    https://www.boursobank.com/bourse/transfert-compte-titres-pea
//  · Boursorama, fiche de chaque ETF du site (pastille « Produit
//    Boursomarkets ») et liste « ETF à 0 € de frais de courtage à l'achat »,
//    relues le 09/10/2026 : voir FRAIS_ORDRE_ETF_PEA, plus bas.
//  · FGDR, plaquette explicative (novembre 2025) :
//    https://www.garantiedesdepots.fr/fr/plaquette-explicative-la-protection-de-votre-argent-en-cas-de-defaillance-de-votre-etablissement
// Relevé complet, URL et archives (dépôt privé) :
// private-assets/raw/geo/boursobank-grille-2026-10-09.json.
//
// 09/10/2026 — grille du 5 octobre 2026 reportée. Le minimum d'un ordre
// d'achat d'ETF passe de 200 € à 100 € (BOURSO_MINIMUM_ORDRE_ETF, interpolé
// partout, y compris sur /comparatif et /meilleurs-etf-debutants), la gamme
// Boursomarkets passe d'iShares à Amundi ; le forfait Découverte, le plafond
// PEA et les autres frais repris ici sont inchangés. Non repris, faute de
// source officielle : « plus de 275 ETF dont 75 éligibles au PEA » (email
// client relayé par la presse ; 271 lignes constatées dans la liste). Non
// revérifié ce jour : les 0,59 %/an du Plan d'Épargne (la brochure renvoie au
// DIC) et la prime de transfert de PEA entrant.
// Le slug reste « boursorama-bourse » : changer l'URL casserait les liens.
const BOURSORAMA: BrokerData = {
  slug: "boursorama-bourse",
  publishedAt: "2026-04-19",
  updatedAt: "2026-10-09",
  name: "BoursoBank",
  shortName: "BoursoBank",
  tagline: "Banque en ligne française (ex-Boursorama), 0 € à l'achat sur les ETF Boursomarkets",
  homepageUrl: "https://www.boursobank.com",
  metaTitle:
    "BoursoBank (ex-Boursorama) pour un DCA ETF : frais et PEA",
  metaDescription:
    `BoursoBank (ex-Boursorama) pour un DCA ETF : frais d'ordre, ${BOURSO_MINIMUM_ORDRE_ETF} € minimum par ordre (brochure du ${BOURSO_BROCHURE_DU}), Plan d'Épargne, face à Trade Republic.`,

  heroIntro:
    `BoursoBank, l'ancienne Boursorama Banque, est la banque en ligne du groupe Société Générale. Elle réunit compte courant, PEA, compte-titres et assurance-vie (Bourso Vie) dans la même application. Pour un DCA en ETF, deux lignes de sa grille comptent plus que les autres : un ordre d'achat d'ETF doit faire au moins ${BOURSO_MINIMUM_ORDRE_ETF} €, et les ETF de la gamme Boursomarkets, dont le partenaire ETF est Amundi au ${dateEnToutesLettres(BOURSO_GAMME_CONSTATEE_LE)} selon sa page Boursomarkets, s'achètent sans frais de courtage.`,

  specs: {
    pea: true,
    cto: true,
    assuranceVie: true,
    custodyFees: "0 € (droits de garde gratuits)",
    orderFeesText: "Forfait Découverte : 1,99 € jusqu'à 500 €, puis 0,60 %, plafonné à 0,5 % en PEA · 0 € à l'achat sur les ETF Boursomarkets",
    minDeposit: `10 € à l'ouverture du PEA · ordre d'achat d'ETF : ${BOURSO_MINIMUM_ORDRE_ETF} € minimum`,
    regulation: "ACPR · AMF · FGDR (100 000 € d'espèces, 70 000 € de titres)",
    mobile: 4,
    savingsPlan: "Non", // Plan d'Épargne = 8 fonds maison à 0,59 %/an, pas un ETF au choix (bourso-plan-epargne)
  },

  pros: [
    "Compte courant, PEA, compte-titres et assurance-vie Bourso Vie dans la même banque",
    "0 € de courtage à l'achat sur les ETF de la gamme Boursomarkets (la revente est au tarif normal)",
    // 09/10/2026 : « un achat d'ETF de 200 € coûte 1,00 € » n'est vrai que
    // hors Boursomarkets depuis la brochure au 05/10/2026 (CW8, DCAM, GPEA,
    // PSP5 : 0 € à l'achat). Montant et frais interpolés.
    `En PEA, frais d'ordre plafonnés à 0,5 % : hors Boursomarkets, un achat d'ETF de ${MENSUEL} € coûte ${euros(BOURSO_ORDRE_MENSUEL.frais)} en forfait Découverte`,
    "Droits de garde gratuits, et pas de frais d'inactivité avec le forfait Découverte",
    "Banque française adhérente au FGDR : si la banque faisait défaut, titres couverts jusqu'à 70 000 € et espèces jusqu'à 100 000 € (aucune protection contre une baisse des marchés)",
    "Transfert de PEA entrant gratuit, avec une prime égale à deux fois les frais facturés par l'ancien établissement (conditions sur le site officiel)",
  ],

  cons: [
    `Ordre d'achat minimum de ${BOURSO_MINIMUM_ORDRE_ETF} € sur les ETF, en PEA comme en compte-titres : un DCA de 50 € par mois en ETF est impossible par ordre de bourse`,
    "Le Plan d'Épargne (dès 10 €/mois, sans frais de transaction) n'investit pas dans l'ETF de votre choix, mais dans 8 fonds maison à 0,59 %/an de frais de gestion",
    "En compte-titres, hors Boursomarkets : 1,99 € par ordre jusqu'à 500 €, près de 1 % d'un achat de 200 €",
    "Changer de forfait coûte 119 € (un changement gratuit par année civile) ; en forfaits Classic et Trader, 5,95 € par mois sans ordre exécuté",
  ],

  dcaFitTitle: `BoursoBank convient si chaque achat atteint ${BOURSO_MINIMUM_ORDRE_ETF} €`,
  dcaFitBody:
    `BoursoBank se prête à un DCA en PEA à condition que chaque achat atteigne ${BOURSO_MINIMUM_ORDRE_ETF} €, le minimum par ordre d'ETF. Un ETF de la gamme Boursomarkets s'achète à 0 €. Hors gamme, le plafond légal de 0,5 % ramène le forfait Découverte à ${BOURSO_FRAIS_PEA_AU_MINIMUM} pour un ordre de ${BOURSO_MINIMUM_ORDRE_ETF} € et à ${euros(BOURSO_ORDRE_MENSUEL.frais)} pour un ordre de ${MENSUEL} €${BOURSO_ORDRE_MENSUEL.frais === 1 ? " (autant qu'un ordre ponctuel chez Trade Republic)" : ""}. En dessous de ${BOURSO_MINIMUM_ORDRE_ETF} €, reste le Plan d'Épargne pour automatiser : dès 10 €/mois, sans frais de transaction, mais sur 8 fonds maison à 0,59 %/an de frais de gestion, là où un ordre de bourse permet de choisir son ETF.`,

  bestFor: [
    "Investisseurs qui veulent compte courant, PEA et assurance-vie dans la même banque",
    `DCA d'au moins ${BOURSO_MINIMUM_ORDRE_ETF} € par achat, a fortiori sur un ETF Boursomarkets`,
    "Ceux qui tiennent à une banque française couverte par le FGDR",
  ],

  notIdealFor: [
    `DCA de 50 € par mois en ETF choisis soi-même (ordre minimum de ${BOURSO_MINIMUM_ORDRE_ETF} €)`,
    "Ceux qui veulent automatiser l'achat d'un ETF précis : le Plan d'Épargne ne porte que sur des fonds maison",
  ],

  // Calcul (brochure BoursoBank au 05/10/2026, p. 20, forfait Découverte,
  // inchangé par rapport à la brochure au 04/09/2026) :
  //   PEA, ETF hors Boursomarkets, ordre de 200 € : tarif 1,99 € (jusqu'à
  //   500 €), plafonné à 0,5 % × 200 € = 1,00 € → 12 €/an → 240 € sur 20 ans ;
  //   PEA ou CTO, ETF Boursomarkets : 0 € à l'achat → 0 € ;
  //   CTO, ETF hors Boursomarkets, sans plafond : 1,99 € × 12 = 23,88 €/an ;
  //   Plan d'Épargne : 0 € de transaction, 0,59 %/an de frais de gestion.
  feeExample:
    `En PEA, forfait Découverte, sur un ETF hors Boursomarkets : un ordre de ${MENSUEL} € coûte ${euros(BOURSO_ORDRE_MENSUEL.frais)}${BOURSO_MENSUEL_PLAFONNE ? ` (${euros(BOURSO_ORDRE_MENSUEL.tarif)} ramenés au plafond légal de 0,5 %)` : ""}, soit ${eurosAnnuels(BOURSO_ORDRE_MENSUEL.frais * 12)}/an et ${fraisOrdrePayes(BOURSO_ORDRE_MENSUEL.frais)} € sur ${DUREE} ans. Sur un ETF Boursomarkets : 0 € à l'achat. En compte-titres, sans plafond : ${euros(BOURSO_ORDRE_MENSUEL.tarif)} par ordre, soit ${eurosAnnuels(BOURSO_ORDRE_MENSUEL.tarif * 12)}/an. En dessous de ${BOURSO_MINIMUM_ORDRE_ETF} € par ordre d'ETF, l'achat n'est pas possible.`,

  faq: [
    {
      q: "Peut-on loger un ETF MSCI World dans le PEA BoursoBank ?",
      // 28/09/2026 (table de vérité ETF) : ESE est un ETF BNP Paribas Easy, pas
      // Amundi ; « iShares Core MSCI World » est IWDA, NON éligible PEA — le nom
      // exact de WPEA est « iShares MSCI World Swap PEA ». Un lecteur qui
      // cherchait « iShares Core MSCI World » dans son PEA tombait sur le mauvais
      // fonds.
      // 09/10/2026 : gamme Boursomarkets relue fiche par fiche sur Boursorama
      // (pastille et liste officielle) : CW8 et DCAM y sont, WPEA et ESE non.
      a: `Oui, s'il est éligible au PEA : CW8 (Amundi MSCI World Swap), WPEA (iShares MSCI World Swap PEA), DCAM (Amundi PEA Monde) ou, pour le S&P 500, ESE (BNP Paribas Easy S&P 500, synthétique). Au 9 octobre 2026, CW8 et DCAM font partie de la gamme Boursomarkets (0 € à l'achat), WPEA et ESE non. Hors gamme Boursomarkets, un ETF est facturé comme une action Euronext selon votre forfait. Dans les deux cas, chaque ordre d'achat doit faire au moins ${BOURSO_MINIMUM_ORDRE_ETF} €. Cherchez l'ETF par son ISIN pour être sûr d'acheter le bon fonds.`,
    },
    {
      q: "L'assurance-vie Bourso Vie peut-elle remplacer le PEA pour un DCA ?",
      a: "Elle ne le remplace pas, elle le complète. L'assurance-vie de BoursoBank s'appelle Bourso Vie ; MATLA est le nom de son Plan d'Épargne Retraite, un produit différent. L'assurance-vie obéit à d'autres règles fiscales et de transmission, à lire dans la documentation du contrat. Pour un DCA en ETF, le PEA reste l'enveloppe la plus directe : après 5 ans, les gains sont exonérés d'impôt sur le revenu et seuls les prélèvements sociaux sont dus. La liste des supports et les frais de Bourso Vie sont à vérifier dans sa documentation.",
    },
    {
      q: "BoursoBank propose-t-elle une épargne programmée automatique ?",
      a: `Oui, dans le PEA, avec le Plan d'Épargne lancé en avril 2025 : un versement automatique dès 10 € par mois, exécuté le 10 de chaque mois, sans frais de transaction ni droits d'entrée. Mais il ne porte pas sur l'ETF de votre choix : il investit dans 8 fonds maison (Bourso Monde, US, Europe, France, Climat, Santé, Tech, Luxe), gérés par SG IS (groupe Société Générale), qui placent chacun dans un ETF. Leurs frais de gestion sont de 0,59 % par an tout compris. Pour acheter un ETF précis, il faut passer l'ordre soi-même, ${BOURSO_MINIMUM_ORDRE_ETF} € au minimum.`,
    },
    {
      q: "Quel montant minimum pour investir en ETF chez BoursoBank ?",
      a: `Selon la brochure tarifaire du ${BOURSO_BROCHURE_DU} : ${BOURSO_MINIMUM_ORDRE_ETF} € par ordre d'achat d'ETF, en PEA comme en compte-titres, ETF Boursomarkets compris (la grille précédente exigeait 200 €). Le versement initial minimum du PEA est de 10 €, et il faut ouvrir un compte bancaire BoursoBank (gratuit). Les tarifs peuvent changer : vérifiez la grille en vigueur avant d'ouvrir un compte.`,
    },
    {
      q: "Quel est le meilleur usage de BoursoBank pour un DCA ?",
      a: `Le levier le plus net est la gamme Boursomarkets : 0 € à l'achat, dès ${BOURSO_MINIMUM_ORDRE_ETF} € par ordre. Hors Boursomarkets, regrouper ses achats fait gagner peu en PEA, grâce au plafond de 0,5 % : investir 1 000 € en cinq ordres de 200 € coûte 5 × 1,00 € = 5,00 €, contre 2 × 1,99 € = 3,98 € en deux ordres de 500 €. En compte-titres, sans plafond, l'écart est plus net : 5 × 1,99 € = 9,95 € contre 3,98 €. Regrouper retarde aussi l'investissement : à comparer avec la régularité que vous visez.`,
    },
  ],
};

// Grilles et documents utilisés (consultés le 28/09/2026) :
//  · Fortuneo, « Conditions tarifaires au 6 août 2026 » (réf. Conditions
//    tarifaires#2606 ; courtage, garde et encours d'ouverture p. 10 ; clôture,
//    changement de tarif et transfert de PEA p. 13) :
//    https://www.fortuneo.fr/files/tarifs_fortuneo.pdf
//  · Pages officielles : https://www.fortuneo.fr/bourse (tarif Starter),
//    https://www.fortuneo.fr/bourse/plan-epargne-actions (PEA Jeune non
//    commercialisé), https://www.fortuneo.fr/bourse/offres ,
//    https://www.fortuneo.fr/bourse/freetrade-amundi (offre du 01/09 au
//    31/12/2026), https://www.fortuneo.fr/mentions-legales-avertissement-legal
//  · FGDR, plaquette explicative (novembre 2025) :
//    https://www.garantiedesdepots.fr/fr/plaquette-explicative-la-protection-de-votre-argent-en-cas-de-defaillance-de-votre-etablissement
// Le « 0,20 % par ordre » affiché jusqu'ici venait de l'ancien tarif Optimum,
// réservé aux anciens clients. Absence de plan programmé sur ETF : constat sur
// la grille officielle (aucune ligne de ce type) et une source secondaire.
const FORTUNEO: BrokerData = {
  slug: "fortuneo",
  publishedAt: "2026-04-19",
  updatedAt: "2026-09-29",
  name: "Fortuneo",
  shortName: "Fortuneo",
  tagline: "Banque en ligne française, 1er ordre du mois à 0 € jusqu'à 500 € (tarif Starter)",
  homepageUrl: "https://www.fortuneo.fr",
  metaTitle:
    "Fortuneo pour un DCA ETF : avis, frais et PEA en 2026",
  metaDescription:
    "Fortuneo est-il adapté à un DCA ETF ? Tarif Starter, frais du PEA, absence de plan programmé et comparaison avec Trade Republic et BoursoBank.",

  heroIntro:
    "Fortuneo est la marque d'Arkéa Direct Bank, banque en ligne du groupe Crédit Mutuel Arkéa. Elle propose PEA, compte-titres et assurance-vie. Sa grille du 6 août 2026 compte trois tarifs bourse (Starter, Progress, Trader Pro), dont un, Starter, taillé pour un petit DCA : le premier ordre du mois est gratuit s'il ne dépasse pas 500 €. En revanche, Fortuneo ne propose pas de plan d'investissement programmé sur ETF : chaque achat se passe à la main.",

  specs: {
    pea: true,
    cto: true,
    assuranceVie: true,
    custodyFees: "0 € (garde et tenue de compte gratuites)",
    orderFeesText: "Tarif Starter : 0,35 % par ordre · 0 € pour le 1er ordre du mois jusqu'à 500 €",
    minDeposit: "100 € à l'ouverture (encours minimum)",
    regulation: "ACPR · AMF · FGDR (100 000 € d'espèces, 70 000 € de titres)",
    mobile: 4,
    savingsPlan: "Non",
  },

  pros: [
    "Tarif Starter : 0 € pour le premier ordre du mois s'il ne dépasse pas 500 €, sans condition d'encours ni de nombre d'ordres",
    "Pas de montant minimum d'ordre sur Euronext",
    "Garde et tenue de compte gratuites, pas de frais d'inactivité sur le PEA",
    "Banque française adhérente au FGDR : si la banque faisait défaut, titres couverts jusqu'à 70 000 € et espèces jusqu'à 100 000 € (aucune protection contre une baisse des marchés)",
    "Transfert de PEA entrant : frais de transfert remboursés pour un premier transfert d'au moins 5 000 € (la loi plafonne de toute façon ces frais à 150 € pour un PEA), et 100 ordres sans frais de courtage à la première ouverture ou au premier transfert (sous conditions)",
    "Offre temporaire FreeTrade Amundi jusqu'au 31/12/2026 : 0 € sur environ 120 ETF Amundi pour les achats de 500 € à 100 000 €",
  ],

  cons: [
    "Pas de plan d'investissement programmé sur ETF : il faut passer l'ordre soi-même chaque mois",
    "Au-delà du premier ordre du mois, ou au-dessus de 500 €, le tarif Starter facture 0,35 % par ordre",
    "Clôture du PEA hors transfert : 85 € ; changement de tarif de courtage après l'ouverture : 60 €",
    "100 € à déposer pour activer le compte, et pas de PEA Jeune",
  ],

  dcaFitTitle: "Fortuneo convient à un DCA d'un achat par mois, passé soi-même",
  dcaFitBody:
    "Pour un DCA d'un seul achat mensuel de 500 € au plus, le tarif Starter ne coûte rien : un ordre de 50, 100 ou 200 € est gratuit s'il est le premier du mois. Le prix à payer est l'effort, puisque Fortuneo n'a pas de plan d'investissement programmé sur ETF : chaque mois, il faut passer l'ordre soi-même. Un deuxième ordre dans le mois coûte 0,35 %, soit 0,70 € pour 200 €, et un ordre de 1 000 € coûte 3,50 € (hors offre temporaire sur une sélection d'ETF Amundi). Deux frais sont à connaître avant d'ouvrir : fermer le PEA sans le transférer coûte 85 €, et le tarif se choisit à l'ouverture, car en changer ensuite coûte 60 €.",

  bestFor: [
    "DCA d'un seul achat mensuel jusqu'à 500 €, passé soi-même",
    "Ceux qui veulent une banque française couverte par le FGDR, avec PEA et assurance-vie",
    "Ceux qui transfèrent un PEA existant (frais de transfert remboursés sous conditions)",
  ],

  notIdealFor: [
    "Ceux qui veulent un investissement automatique (pas de plan programmé sur ETF)",
    "Les jeunes majeurs qui cherchent un PEA Jeune, que Fortuneo ne commercialise pas",
  ],

  // Calcul (conditions tarifaires Fortuneo au 06/08/2026, p. 10, tarif
  // Starter, Euronext, PEA dans la limite légale de 0,5 %) :
  //   1 achat de 200 € par mois = 1er ordre du mois, inférieur ou égal à
  //   500 € → 0 € → 0 €/an → 0 € sur 20 ans, à grille inchangée ;
  //   2e ordre de 200 € dans le mois : 0,35 % × 200 € = 0,70 € ;
  //   ordre de 1 000 € : 0,35 % × 1 000 € = 3,50 €.
  feeExample:
    `Pour un seul achat de ${MENSUEL} € par mois en tarif Starter : 0 € de frais d'ordre, soit 0 € par an et 0 € sur ${DUREE} ans si la grille ne change pas. Un deuxième achat dans le même mois coûterait 0,35 %, soit 0,70 €. À prévoir à part : 85 € si vous fermez un jour le PEA sans le transférer.`,

  faq: [
    {
      q: "Fortuneo est-il moins cher que Trade Republic pour un DCA ?",
      a: "Pour un seul achat mensuel de 500 € au plus, les deux reviennent à 0 € : premier ordre du mois gratuit en tarif Starter chez Fortuneo, plan d'investissement programmé sans frais d'achat chez Trade Republic. La différence est ailleurs. Trade Republic automatise l'achat, Fortuneo non : il faut passer l'ordre soi-même. Fortuneo est une banque française couverte par le FGDR (70 000 € pour les titres), Trade Republic relève de la garantie allemande. Et Fortuneo facture 85 € la clôture d'un PEA hors transfert.",
    },
    {
      q: "Fortuneo propose-t-il une assurance-vie ETF ?",
      a: "Fortuneo propose l'assurance-vie Fortuneo Vie, le contrat que cite sa grille tarifaire du 6 août 2026, avec des versements programmés possibles. La liste des ETF disponibles et les frais du contrat sont à vérifier dans sa documentation. L'assurance-vie complète le PEA, notamment pour la transmission ; elle ne le remplace pas pour un DCA en ETF.",
    },
    {
      q: "Quels sont les frais cachés de Fortuneo ?",
      a: "Rien de caché, mais trois frais sont à connaître avant d'ouvrir : fermer un PEA sans le transférer coûte 85 € ; changer de tarif de courtage après l'ouverture coûte 60 € ; un transfert sortant du PEA coûte 15 € par ligne cotée, dans la limite légale de 150 € par PEA. La garde et la tenue de compte sont gratuites, et la grille ne prévoit pas de frais d'inactivité sur le PEA. Il faut aussi déposer au moins 100 € pour activer le compte. Pour les ordres, le minimum est nul sur Euronext, mais de 400 € en PEA sur les bourses allemande, anglaise et suisse.",
    },
    {
      q: "Puis-je avoir un PEA chez Fortuneo et un CTO chez Trade Republic ?",
      a: "Oui. On ne peut détenir qu'un seul PEA classique par personne, mais le PEA et le compte-titres peuvent être tenus par des établissements différents. Rien n'empêche donc d'avoir le PEA chez un courtier et le compte-titres chez un autre, en comparant chaque fois les frais de l'enveloppe concernée.",
    },
  ],
};

// ─── Frais d'un ordre d'ETF dans un PEA, courtier par courtier ───────────────
//
// Ajouté le 30/09/2026 pour les comparatifs d'ETF. Leur verdict dit que « le
// vrai départage est chez votre courtier » ; le relevé du 29/09/2026 montre
// que les pages citées par les assistants IA nomment alors les courtiers, et
// que les nôtres renvoyaient le lecteur chercher seul. Le tableau qui en sort
// décrit une grille, il ne classe rien : ordre alphabétique, aucun « meilleur ».
//
// Les RÈGLES tarifaires sont des faits (grilles citées au-dessus de chaque
// fiche ; faits tr-frais-ordre, bourso-pea-courtage-etf,
// bourso-montant-minimum-ordre, fortuneo-courtage-pea, synthese-frais-ordre-pea).
// Le montant d'un ordre donné, lui, se CALCULE sur ces règles : la page passe
// le versement de ses hypothèses (200 € aujourd'hui), et si l'hypothèse
// change, le frais suit.
//
// 30/09/2026 — gammes à frais réduits. Le tableau disait « un ordre sur WPEA
// coûte autant qu'un ordre sur DCAM, sauf offre réservée à une gamme », sans
// dire qui en profite. Chaque courtier déclare donc sa gamme ET les ETF du
// site qu'on y a constatés, datés : la page calcule le frais ETF par ETF et
// nomme l'exception au lieu de la taire.
//
// 09/10/2026 — BoursoBank relue sur sa brochure au 5 octobre 2026. La gamme
// Boursomarkets est passée d'iShares à Amundi : WPEA en est sorti, CW8, DCAM,
// GPEA et PSP5 y sont entrés ; le minimum d'ordre est passé de 200 € à 100 €.
// Les pages de production affichaient l'inverse de la réalité sur
// wpea-vs-dcam et cw8-vs-wpea (« WPEA 0 €, DCAM/CW8 1,00 € »), et « ni l'un
// ni l'autre » sur cw8-vs-ese et ese-vs-psp5. Chaque grille porte désormais
// sa propre date de consultation (consulteeLe) : Fortuneo et Trade Republic
// n'ont pas été relues le 09/10/2026, une date commune aurait menti pour eux.

/** Offre d'un courtier réservée à certains ETF (Boursomarkets chez BoursoBank). */
export interface GammeFraisReduits {
  /** « gamme Boursomarkets » */
  nom: string;
  /**
   * Mnémoniques des ETF du site constatés dans la gamme, un par un, sur une
   * page du courtier. Un ETF absent de la liste est facturé au tarif normal :
   * n'y ajouter qu'un fonds vérifié, jamais un fonds « probablement » inclus.
   */
  symboles: readonly string[];
  /** Date du constat, YYYY-MM-DD. */
  constateLe: string;
  /** Frais d'un ordre d'achat sur un ETF de la gamme, pour ce montant. */
  frais: (montant: number) => string;
}

export interface FraisOrdreEtfPea {
  /** Fiche /comparatif/<slug>. */
  slug: string;
  nom: string;
  /** Formule ou mode d'achat auquel s'applique le frais. */
  offre: string;
  /** Document officiel qui fixe le tarif. */
  grille: { libelle: string; url: string };
  /** Date à laquelle cette grille a été consultée, YYYY-MM-DD (affichée). */
  consulteeLe: string;
  /**
   * Frais d'un ordre d'achat d'ETF coté sur Euronext, dans un PEA, pour ce
   * montant — hors gamme à frais réduits.
   */
  frais: (montant: number) => string;
  /** Gamme à frais réduits du courtier, s'il en a une. */
  gamme?: GammeFraisReduits;
  /** Ce qui change le coût, sans rien recommander. */
  precision: string;
}

/** La gamme à frais réduits de ce courtier dont fait partie cet ETF, ou null. */
export function gammeDeLEtf(courtier: FraisOrdreEtfPea, symbole: string): GammeFraisReduits | null {
  return courtier.gamme?.symboles.includes(symbole) ? courtier.gamme : null;
}

/** Frais d'un ordre d'achat de cet ETF chez ce courtier : tarif de la gamme s'il en fait partie. */
export function fraisOrdreEtf(courtier: FraisOrdreEtfPea, symbole: string, montant: number): string {
  return (gammeDeLEtf(courtier, symbole) ?? courtier).frais(montant);
}

/** 0.7 → « 0,70 € ». Deux décimales : ce sont des frais facturés au centime. */
function euros(v: number): string {
  return `${v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/** BoursoBank : libellé d'un ordre sous le minimum (BOURSO_MINIMUM_ORDRE_ETF, plus haut). */
const BOURSO_SOUS_LE_MINIMUM = `Ordre impossible sous ${BOURSO_MINIMUM_ORDRE_ETF} €`;

/** Fortuneo : montant d'achat à partir duquel joue l'offre FreeTrade Amundi (fait fortuneo-freetrade-amundi). */
const FORTUNEO_SEUIL_FREETRADE_AMUNDI = 500;

export const FRAIS_ORDRE_ETF_PEA: FraisOrdreEtfPea[] = [
  {
    slug: "boursorama-bourse",
    nom: "BoursoBank",
    offre: "forfait Découverte",
    grille: {
      libelle: `brochure tarifaire au ${BOURSO_BROCHURE_DU}`,
      url: "https://www.boursobank.com/content/brochure_tarifaire/boursorama_bt.pdf",
    },
    consulteeLe: "2026-10-09",
    // 1,99 € jusqu'à 500 €, puis 0,60 % ; plafond de 0,5 % en PEA ; 100 €
    // minimum par ordre d'achat d'ETF (brochure au 05/10/2026, p. 20 et 23).
    frais: (m) => {
      if (m < BOURSO_MINIMUM_ORDRE_ETF) return BOURSO_SOUS_LE_MINIMUM;
      const { tarif, frais } = fraisBoursoDecouvertePea(m);
      return frais < tarif
        ? `${euros(frais)} (${euros(tarif)} ramenés au plafond légal de 0,5 %)`
        : euros(tarif);
    },
    // Boursomarkets : 0 € à l'ACHAT seulement (la vente suit « même
    // tarification que sur Actions Euronext Paris »), même minimum, en PEA
    // comme en compte-titres (brochure au 05/10/2026, p. 20 et 23). Partenaire
    // ETF : « Amundi Investment Solutions » (page Boursomarkets officielle).
    // Constat du 09/10/2026 sur boursorama.com, ETF par ETF, deux preuves
    // concordantes : pastille « Produit Boursomarkets » sur la fiche (HTML
    // servi et rendu Chromium) ET présence dans la liste officielle « ETF à
    // 0 € de frais de courtage à l'achat » (271 lignes, 19 pages). Dans la
    // gamme : les 12 ETF du site ci-dessous. Hors gamme : WPEA, ESE, SPEA
    // (« Négociable chez BoursoBank » seulement), ETZ ; IWDA, CSPX, VUSA,
    // VWCE, CNDX (compte-titres). Comme au 30/09, on ne déduit rien de
    // l'émetteur : un ETF n'entre ici qu'après constat sur sa fiche.
    // Archives : private-assets/raw/geo/sources-bourso-2026-10-09/.
    gamme: {
      nom: "gamme Boursomarkets",
      symboles: ["CW8", "DCAM", "GPEA", "PSP5", "PAEEM", "PUST", "PCEU", "PE500", "500", "AEEM", "ANX", "JPNK"],
      constateLe: BOURSO_GAMME_CONSTATEE_LE,
      frais: (m) => (m < BOURSO_MINIMUM_ORDRE_ETF ? BOURSO_SOUS_LE_MINIMUM : "0 € à l'achat"),
    },
    // 09/10/2026 : la phrase « Selon la presse, BoursoBank changerait… » est
    // retirée : le changement figure dans la brochure officielle.
    precision:
      `0 € à l'achat sur les ETF de la gamme Boursomarkets, dont le partenaire ETF est Amundi au ${dateEnToutesLettres(BOURSO_GAMME_CONSTATEE_LE)} ; ` +
      "la revente, et l'achat des autres ETF, suivent le tarif du forfait. " +
      `${BOURSO_MINIMUM_ORDRE_ETF} € minimum par ordre d'achat d'ETF.`,
  },
  {
    slug: "fortuneo",
    nom: "Fortuneo",
    offre: "tarif Starter",
    grille: {
      libelle: "conditions tarifaires au 6 août 2026",
      url: "https://www.fortuneo.fr/files/tarifs_fortuneo.pdf",
    },
    consulteeLe: "2026-09-28",
    // 0 € pour le 1er ordre du mois jusqu'à 500 €, sinon 0,35 % (p. 10).
    // 30/09/2026 : l'offre FreeTrade Amundi (fait fortuneo-freetrade-amundi,
    // jusqu'au 31/12/2026) rend gratuits les achats de 500 € et plus sur une
    // sélection d'ETF Amundi, dont la liste n'a pas été relue ETF par ETF.
    // Sous 500 €, elle ne change rien ; au-delà, ce tableau afficherait
    // 0,35 % là où certains ETF du duel coûtent 0 €. Le build s'arrête plutôt
    // que de publier ce chiffre : relire la sélection et la déclarer en gamme.
    frais: (m) => {
      if (m >= FORTUNEO_SEUIL_FREETRADE_AMUNDI) {
        throw new Error(
          `brokers.ts : ordre de ${FORTUNEO_SEUIL_FREETRADE_AMUNDI} € ou plus chez Fortuneo — l'offre FreeTrade Amundi n'est pas modélisée. ` +
            "Relisez la sélection d'ETF Amundi concernés et déclarez-la dans le champ gamme.",
        );
      }
      // Sous le seuil ci-dessus, donc toujours dans la tranche « 1er ordre du mois ≤ 500 € ».
      return `0\u00a0€ si c'est le 1er ordre du mois, sinon ${euros(m * 0.0035)}`;
    },
    precision: "Pas de plan d'investissement programmé sur ETF\u00a0: chaque ordre se passe à la main.",
  },
  {
    slug: "trade-republic",
    nom: "Trade Republic",
    offre: "ordre ponctuel ou plan programmé",
    grille: {
      libelle: "grille tarifaire publique, mise à jour le 30 juin 2026",
      url: "https://traderepublic.com/fr-fr?openModal=pricing-scheme",
    },
    consulteeLe: "2026-09-28",
    // 1 € par ordre ponctuel quel que soit le montant ; plan programmé sans
    // frais d'achat (faits tr-frais-ordre, tr-plan-epargne-frais).
    frais: () => `${euros(1)} par ordre ponctuel, 0\u00a0€ par plan programmé`,
    precision:
      "Dans le PEA, le centre d'aide ne dit pas si les plans achètent des fractions de parts\u00a0: à vérifier dans l'application.",
  },
];

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
