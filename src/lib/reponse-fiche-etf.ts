// Réponse d'ouverture et FAQ des fiches /etf/[symbole] — ajouté le 30/09/2026.
//
// ─── Pourquoi ─────────────────────────────────────────────────────────────────
//
// Relevé du 29/09/2026 : à « IWDA est-il éligible au PEA ? », Copilot place
// /etf/IWDA en tête de ses résultats, puis cite une autre page. La fiche
// disait « Non éligible PEA » au 45e mot, au milieu d'une description, sans
// nommer d'équivalent vérifié ni de date, sans FAQ ni JSON-LD Article. Les
// pages citées répondent dans la première phrase.
//
// ─── Ce que ce module garantit ──────────────────────────────────────────────
//
// Tout est LU dans les données vérifiées (etf-config.ts, etf-pea-verifies.ts),
// rien n'est rédigé fonds par fonds :
//   · la première phrase dit le statut PEA ; pour un fonds éligible, avec son
//     ISIN et son TER ;
//   · pour un fonds non éligible, les équivalents sont ceux de la règle 4 de
//     la table de vérité (CORRESPONDANCES_PEA) — une correspondance d'INDICE,
//     dite comme telle, jamais une recommandation, et « approchée » quand
//     l'indice diffère (VWCE, émergents ; 30/09/2026) ; Japon : aucun, et on le dit ;
//   · la FAQ « même indice » d'un fonds éligible lit le groupe d'indice de la
//     liste vérifiée, pas CORRESPONDANCES_PEA (30/09/2026 : EWLD y manquait) ;
//   · « vérifié le 28 septembre 2026 » n'apparaît que pour un fonds de la
//     table de vérité (SPY n'y est pas : ses frais et son ISIN ne sont pas
//     recoupés, la fiche le dit).

import { ETF_LIST, type ETFConfig } from "@/lib/etf-config";
import {
  CORRESPONDANCES_PEA,
  DATE_VERIFICATION_PEA,
  ETF_NON_ELIGIBLES,
  ETF_PEA_VERIFIES,
  URL_LISTE_PEA,
  ancreFonds,
  dateEnToutesLettres,
  estDansLaTable,
  lienListePea,
  type CorrespondanceId,
  type EtfEligiblePea,
  type FamilleIndice,
  type RaisonHorsPea,
} from "@/lib/etf-pea-verifies";
import { formatTer } from "@/lib/utils";

const DATE_VERIF = dateEnToutesLettres(DATE_VERIFICATION_PEA);

/** « 0,20 % » avec l'espace insécable avant le signe. */
const ter = (v: number) => formatTer(v).replace(" %", "\u00a0%");

// ─── Grammaire des mnémoniques ──────────────────────────────────────────────
// « 500 n'est pas éligible » ne se lit pas : un mnémonique en chiffres ne
// commence pas une phrase. Et « de IWDA » s'élide.
const enChiffres = (s: string) => /^\d/.test(s);
/** « CW8 », « L'ETF 500 » — en début de phrase. */
const sujet = (s: string) => (enChiffres(s) ? `L'ETF ${s}` : s);
/** « de CW8 », « d'IWDA », « de l'ETF 500 ». */
const de = (s: string) => (enChiffres(s) ? `de l'ETF ${s}` : /^[AEIOUY]/.test(s) ? `d'${s}` : `de ${s}`);
/** Les précisions de la liste vérifiée sont écrites pour une case de tableau (« Suit une variante… ») : ici, une phrase. */
const enPhrase = (p: string) => (p.startsWith("Suit ") ? `Il suit ${p.slice("Suit ".length)}` : p);

/**
 * 30/09/2026 — sur une fiche non éligible, les précisions suivent la liste
 * des équivalents : « Ce n'est pas l'ancien PAEEM » ou « Il suit le FTSE
 * All-World », placés juste après « …est PAEEM (0,30 %) », semblaient parler
 * de l'équivalent (sur /etf/AEEM, PAEEM « n'était pas l'ancien PAEEM »). Le
 * sujet est donc nommé : « AEEM n'est pas l'ancien PAEEM ».
 */
const nommerLeSujet = (p: string, sujetNomme: string) =>
  p.replace(/^Ce n'est pas /, `${sujetNomme} n'est pas `).replace(/^Il suit /, `${sujetNomme} suit `);

/**
 * Fonds dont l'indice diffère de celui de sa correspondance PEA (fait
 * non-pea-monde : VWCE suit le FTSE All-World, pas le MSCI World). Choix
 * explicite, pas déduit de `indexLabel`, dont l'orthographe varie d'une entrée
 * à l'autre (« Nasdaq 100 », « Nasdaq-100 »). Avec une `nuance` de
 * correspondance (émergents), la correspondance est dite « approchée », pas
 * « d'indice » — la phrase suivante le disait déjà, la première le contredisait.
 */
const INDICE_DIFFERENT_DE_LA_CORRESPONDANCE = new Set(["VWCE"]);

/**
 * Fonds rangés dans un groupe d'indice mais qui suivent une VARIANTE de cet
 * indice (PRECISIONS d'etf-pea-verifies.ts) : PE500, S&P 500 filtré ESG ;
 * PAEEM, variante « ESG Transition ». Ils ne « suivent pas le même indice »
 * que les autres fonds du groupe, et inversement.
 */
const VARIANTE_D_INDICE = new Set(["PE500", "PAEEM"]);

/** L'indice de chaque groupe, avec son article : « suivent aussi le MSCI World ». */
const INDICE_DU_GROUPE: Record<FamilleIndice, string> = {
  "msci-world": "le MSCI World",
  "msci-acwi": "le MSCI ACWI",
  sp500: "le S&P 500",
  "nasdaq-100": "le Nasdaq-100",
  emergents: "le même indice des marchés émergents",
  europe: "le MSCI Europe",
  "russell-2000": "le Russell 2000",
};

/** Ce que la FAQ dit de l'écart de suivi, sans jargon. */
const ECART_DE_SUIVI = "l'écart de suivi (la différence entre la performance du fonds et celle de son indice)";

/** ["A", "B", "C"] → « A, B et C ». */
function enumerer(mots: string[]): string {
  if (mots.length <= 1) return mots.join("");
  return `${mots.slice(0, -1).join(", ")} et ${mots[mots.length - 1]}`;
}

/**
 * Fonds du catalogue absents de la liste des non éligibles, mais dont
 * l'indice a une correspondance PEA vérifiée. SPY n'est pas dans la table de
 * vérité (ses frais et son ISIN ne sont pas recoupés) ; son indice, le S&P
 * 500, a bien ses équivalents vérifiés (fait non-pea-us-sans-dic).
 */
const CORRESPONDANCE_HORS_LISTE: Record<string, CorrespondanceId> = { SPY: "sp500" };

export interface Equivalent {
  symbole: string;
  /** « 0,12 % » */
  ter: string;
  /** Sa fiche s'il en a une, sinon sa ligne dans la liste vérifiée. */
  href: string;
}

export interface ReponseFiche {
  /** Première phrase : le statut PEA, sans détour. */
  statut: string;
  /**
   * Équivalents PEA de même indice (règle 4 de la table), ou null. `intro`
   * accorde la phrase : « Pour le S&P 500 dans un PEA, les ETF vérifiés par
   * le site sont », « …, l'ETF vérifié par le site est ».
   */
  equivalents: {
    intro: string;
    fonds: Equivalent[];
    /** « une correspondance d'indice », ou « une correspondance approchée » quand l'indice diffère. */
    correspondance: string;
  } | null;
  /** Quand la règle 4 ne donne aucun équivalent vérifié (Japon). */
  sansEquivalent: string | null;
  /** Précisions vérifiées (liste vérifiée) et nuance de la correspondance. */
  precisions: string[];
  /** Date et méthode de la vérification, en une phrase. */
  verification: string;
  /** L'endroit de /etf-eligibles-pea qui parle de ce fonds (ou de son indice). */
  lienListe: string;
  faq: { q: string; a: string }[];
}

function equivalent(f: EtfEligiblePea): Equivalent {
  const symbole = f.displaySymbol;
  const aUneFiche = ETF_LIST.some((e) => e.displaySymbol === symbole);
  return {
    symbole,
    ter: ter(f.ter),
    href: aUneFiche ? `/etf/${symbole}` : `${URL_LISTE_PEA}#${ancreFonds(symbole)}`,
  };
}

function equivalentsDe(id: CorrespondanceId): Equivalent[] {
  return CORRESPONDANCES_PEA[id].symboles.map((symbole) => {
    const f = ETF_PEA_VERIFIES.find((x) => x.displaySymbol === symbole);
    if (!f) {
      // etf-pea-verifies.ts refuse déjà ce cas au build ; ceinture et bretelles.
      throw new Error(`reponse-fiche-etf.ts : l'équivalent ${symbole} n'est pas dans la liste vérifiée.`);
    }
    return equivalent(f);
  });
}

/**
 * Les autres ETF éligibles de la liste vérifiée qui suivent le même indice.
 * 30/09/2026 : la FAQ « même indice » lisait CORRESPONDANCES_PEA.monde (WPEA,
 * DCAM, CW8), qui sert aux équivalents des fonds NON éligibles (règle 4) et
 * n'est pas la liste des fonds du même indice : EWLD, part distribuante du
 * fonds de CW8, manquait sur les fiches CW8, WPEA et DCAM. On lit désormais
 * le groupe d'indice (famille) de la liste, sans les variantes filtrées.
 */
function memeIndice(symbole: string): { indice: string; fonds: EtfEligiblePea[] } | null {
  const moi = ETF_PEA_VERIFIES.find((f) => f.displaySymbol === symbole);
  if (!moi || VARIANTE_D_INDICE.has(symbole)) return null;
  const fonds = ETF_PEA_VERIFIES.filter(
    (f) => f.famille === moi.famille && f.displaySymbol !== symbole && !VARIANTE_D_INDICE.has(f.displaySymbol),
  );
  return fonds.length > 0 ? { indice: INDICE_DU_GROUPE[moi.famille], fonds } : null;
}

/** Première phrase d'un fonds non éligible, selon la raison établie. */
function statutHorsPea(symbole: string, raison: RaisonHorsPea | null, sansDic: boolean): string {
  const s = sujet(symbole);
  if (sansDic || raison === "sans-dic") {
    // 30/09/2026 : l'absence de DIC était affirmée fonds par fonds, alors que
    // le fait non-pea-us-sans-dic ne l'a pas recontrôlée chez SSGA ni chez
    // Invesco. On dit ce que l'AMF établit : la règle des fonds américains.
    return `${s} n'est pas éligible au PEA, et un courtier européen en refuse en principe l'achat à un particulier, même en compte-titres\u00a0: c'est un fonds américain, et ces fonds ne publient pas, en règle générale, le document d'informations clés (DIC) exigé en Europe.`;
  }
  switch (raison) {
    // 30/09/2026 : la ligne « Enveloppe fiscale » ne figure que dans la
    // version du reporting pour professionnels (lien sous la phrase,
    // sources-etf.ts) ; celle pour particuliers ne l'a pas.
    case "swap-hors-pea":
      return `${s} n'est pas éligible au PEA, malgré sa réplication synthétique\u00a0: le reporting mensuel d'Amundi du 31 août 2026, dans sa version pour professionnels, indique «\u00a0Enveloppe fiscale\u00a0: -\u00a0», sans aucune mention du PEA, là où celui de CW8 affiche «\u00a0Enveloppe fiscale\u00a0: Eligible au PEA\u00a0».`;
    case "physique":
      return `${s} n'est pas éligible au PEA\u00a0: il détient lui-même des actions de son indice, et elles ne sont pas, à plus de 75\u00a0%, des actions de sociétés de l'Union européenne ou de l'Espace économique européen, comme l'exige le PEA.`;
    default:
      return `${s} n'est pas éligible au PEA, d'après les documents de son émetteur recoupés le ${DATE_VERIF}.`;
  }
}

/** Réponse complète à « pourquoi pas dans un PEA ? », pour la FAQ. */
function raisonLongue(raison: RaisonHorsPea | null, sansDic: boolean): string {
  if (sansDic || raison === "sans-dic") {
    return (
      // 30/09/2026 : « fonds français ou européens » était imprécis. L'article
      // L221-31 du code monétaire et financier (relu ce jour) vise les fonds
      // français et les OPCVM établis dans l'UE ou l'EEE : le Royaume-Uni et la
      // Suisse, européens, n'en font pas partie (fait pea-regle-75).
      "C'est un fonds américain\u00a0: la loi n'admet dans un PEA que des fonds établis dans l'Union européenne ou l'Espace économique européen. " +
      "Et, comme les fonds américains en règle générale, il ne publie pas de document d'informations clés (DIC)\u00a0: depuis le 1er janvier 2018, un tel fonds ne peut plus être proposé aux particuliers de l'Espace économique européen, " +
      "et un courtier européen en refuse en principe l'achat, même en compte-titres."
    );
  }
  switch (raison) {
    case "swap-hors-pea":
      return (
        "Sa réplication est synthétique, comme celle des ETF qui entrent dans un PEA, mais le reporting mensuel d'Amundi du 31 août 2026, dans sa version pour professionnels, indique " +
        "«\u00a0Enveloppe fiscale\u00a0: -\u00a0», sans aucune mention du PEA, là où ceux de CW8 et PAEEM, éligibles, affichent «\u00a0Enveloppe fiscale\u00a0: Eligible au PEA\u00a0». " +
        "La page du fonds chez Amundi, dans sa version pour particuliers, indique «\u00a0Eligibilité au PEA\u00a0: Non\u00a0»\u00a0: c'est l'émetteur qui fait foi, pas le nom ni le mode de réplication. " +
        "(La ligne «\u00a0Éligibilité\u00a0» du reporting affiche «\u00a0Compte-titres, Assurance-vie\u00a0» pour CW8 et PAEEM comme pour ce fonds\u00a0: elle ne tranche pas.)"
      );
    case "physique":
      return (
        "Il détient lui-même des actions de son indice. Or un fonds n'entre dans un PEA que s'il investit plus de 75\u00a0% de son actif " +
        "en actions de sociétés de l'Union européenne ou de l'Espace économique européen."
      );
    default:
      return `D'après les documents de son émetteur, recoupés le ${DATE_VERIF} sur justETF, Boursorama et Euronext, il n'est pas éligible au PEA.`;
  }
}

export function reponseFiche(etf: ETFConfig): ReponseFiche {
  const s = etf.displaySymbol;
  const S = sujet(s);
  const verifie = estDansLaTable(s);
  const sansDic = etf.sansDicUE === true;
  const frais = ter(etf.ter);

  const verification = verifie
    ? `Statut PEA, ISIN et frais vérifiés le ${DATE_VERIF} sur les documents de l'émetteur, recoupés sur justETF, Boursorama et Euronext.`
    : `Équivalents PEA vérifiés le ${DATE_VERIF}. Les frais et l'ISIN ${de(s)}, eux, n'ont pas été recoupés par le site.`;

  const faqFrais = verifie
    ? [
        {
          q: `Quels sont les frais ${de(s)}\u00a0?`,
          a:
            `${frais} par an de frais courants (TER), prélevés au jour le jour sur l'actif du fonds\u00a0: la performance affichée en est déjà nette. ` +
            "Le TER ne comprend ni les frais de courtage, ni l'écart entre prix d'achat et prix de vente.",
        },
      ]
    : [];

  // ── Fonds éligible ────────────────────────────────────────────────────────
  if (etf.peaEligible) {
    const liste = ETF_PEA_VERIFIES.find((f) => f.displaySymbol === s);
    const isin = etf.isin ?? liste?.isin ?? null;
    // FAQ « même indice » : le groupe d'indice de la liste vérifiée (voir
    // memeIndice). Si l'un des fonds ne traite pas ses dividendes comme
    // celui-ci (EWLD distribue, CW8 capitalise), la réponse le dit.
    const memes = memeIndice(s);
    const distributionDiffere = memes?.fonds.some((f) => f.distributionPolicy !== etf.distributionPolicy) ?? false;

    const faq = [
      {
        q: `${S} est-il éligible au PEA\u00a0?`,
        a:
          `Oui. ${S} (${etf.name}${isin ? `, ISIN ${isin}` : ""}) est éligible au PEA` +
          (verifie
            ? `\u00a0: nous l'avons vérifié le ${DATE_VERIF} sur les documents de l'émetteur, recoupés sur justETF, Boursorama et Euronext. `
            : ". ") +
          "Au moment de passer l'ordre, c'est l'ISIN, pas le mnémonique, qui identifie le fonds.",
      },
      ...faqFrais,
      ...(memes
        ? [
            {
              q: "D'autres ETF éligibles au PEA suivent-ils le même indice\u00a0?",
              a:
                `Oui. Dans notre sélection vérifiée, ${enumerer(
                  memes.fonds.map((f) =>
                    f.distributionPolicy === etf.distributionPolicy
                      ? `${f.displaySymbol} (${ter(f.ter)})`
                      : `${f.displaySymbol} (${ter(f.ter)}, ${f.distributionPolicy.toLowerCase()})`,
                  ),
                )} ` +
                `${memes.fonds.length > 1 ? "suivent" : "suit"} aussi ${memes.indice}. À indice identique, ce qui les sépare, ce sont les frais (TER), ` +
                (distributionDiffere ? "le sort des dividendes (versés ou réinvestis), " : "") +
                `${ECART_DE_SUIVI} et les frais d'ordre du courtier.`,
            },
          ]
        : []),
    ];

    return {
      statut: isin
        ? `${S} est éligible au PEA\u00a0: son ISIN est ${isin} et ses frais courants (TER) sont de ${frais} par an.`
        : `${S} est éligible au PEA\u00a0; ses frais courants (TER) sont de ${frais} par an.`,
      equivalents: null,
      sansEquivalent: null,
      precisions: liste?.precision ? [enPhrase(liste.precision)] : [],
      verification,
      lienListe: lienListePea(s) ?? URL_LISTE_PEA,
      faq,
    };
  }

  // ── Fonds non éligible ────────────────────────────────────────────────────
  const horsPea = ETF_NON_ELIGIBLES.find((f) => f.displaySymbol === s);
  const raison = horsPea?.raison ?? null;
  const correspondance = horsPea?.correspondance ?? CORRESPONDANCE_HORS_LISTE[s] ?? null;
  const fonds = correspondance ? equivalentsDe(correspondance) : [];
  const pluriel = fonds.length > 1;
  const nuance = correspondance ? CORRESPONDANCES_PEA[correspondance].nuance : undefined;
  // 30/09/2026 : « une correspondance d'indice » sur /etf/VWCE, suivi de « le
  // MSCI World n'en est qu'une correspondance partielle » : la première
  // phrase contredisait la seconde. Approchée quand l'indice diffère.
  const approchee = INDICE_DIFFERENT_DE_LA_CORRESPONDANCE.has(s) || Boolean(nuance);
  const equivalents =
    correspondance && fonds.length > 0
      ? {
          intro:
            `Pour ${CORRESPONDANCES_PEA[correspondance].libelle} dans un PEA, ` +
            (pluriel ? "les ETF vérifiés par le site sont" : "l'ETF vérifié par le site est"),
          fonds,
          correspondance: approchee ? "une correspondance approchée" : "une correspondance d'indice",
        }
      : null;
  const sansEquivalent =
    correspondance && fonds.length === 0
      ? `Pour ${CORRESPONDANCES_PEA[correspondance].libelle}, aucun ETF éligible au PEA n'a été vérifié par le site\u00a0: nous n'en citons donc aucun, ce qui ne veut pas dire qu'il n'en existe pas.`
      : null;
  const precisions = [horsPea?.precision, nuance]
    .filter((p): p is string => Boolean(p))
    .map(enPhrase)
    .map((p) => nommerLeSujet(p, S));

  const faqEquivalent = equivalents
    ? [
        {
          q: `Quel équivalent ${de(s)} dans un PEA\u00a0?`,
          a:
            `${equivalents.intro} ${enumerer(fonds.map((f) => `${f.symbole} (${f.ter})`))}. ` +
            `C'est ${equivalents.correspondance}, pas une recommandation.` +
            (precisions.length > 0 ? ` ${precisions.join(" ")}` : ""),
        },
      ]
    : sansEquivalent
      ? [{ q: `Quel équivalent ${de(s)} dans un PEA\u00a0?`, a: sansEquivalent }]
      : [];

  const faq = [
    {
      q: `${S} est-il éligible au PEA\u00a0?`,
      a:
        `Non. ${raisonLongue(raison, sansDic)}` +
        (sansDic || raison === "sans-dic" ? "" : " Il se loge en compte-titres ou, selon les contrats, en assurance-vie."),
    },
    ...faqFrais,
    ...faqEquivalent,
  ];

  // Lien vers la liste : la carte du fonds s'il y figure ; pour SPY, le groupe
  // S&P 500 (même identifiant d'ancre que la correspondance) ; sinon, la page.
  const lienListe =
    lienListePea(s) ?? (correspondance === "sp500" ? `${URL_LISTE_PEA}#sp500` : URL_LISTE_PEA);

  return {
    statut: statutHorsPea(s, raison, sansDic),
    equivalents,
    sansEquivalent,
    precisions,
    verification,
    lienListe,
    faq,
  };
}
