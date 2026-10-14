import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { Download, ListChecks } from "lucide-react";
import { EducationalHeader } from "@/components/ui/EducationalHeader";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import { JsonLd } from "@/components/ui/JsonLd";
import { RenvoiProduit } from "@/components/products/RenvoiProduit";
import { FiltresListePea } from "@/components/liste-pea/FiltresListePea";
import { formatTer } from "@/lib/utils";
import { ETF_COMPARISON_LIST } from "@/lib/etf-comparisons";
import {
  CORRESPONDANCES_PEA,
  DATE_VERIFICATION_PEA,
  DERNIERE_VERIFICATION_PEA,
  ETF_NON_ELIGIBLES,
  ETF_PEA_VERIFIES,
  URL_LISTE_PEA,
  ancreFonds,
  ancreHorsPea,
  dateEnToutesLettres,
  type EtfNonEligible,
  type RaisonHorsPea,
} from "@/lib/etf-pea-verifies";
import {
  A_UNE_FICHE,
  CHEMIN_CSV_LISTE_PEA,
  DATE_RELEVE_LISTE_PEA,
  DECOMPTE_RELEVE,
  EMETTEURS_LISTE,
  FIRDS,
  GROUPES_LISTE,
  LIBELLE_REPLICATION,
  LIGNES_PEA,
  MISE_EN_LIGNE_LISTE_PEA,
  avecReserve,
  type CategorieId,
  type GroupeListe,
  type LignePea,
} from "@/lib/liste-pea";
import styles from "./liste.module.css";

// ─── Pourquoi cette page ─────────────────────────────────────────────────────
//
// 29/09/2026 : aucune page du site n'était consacrée à la liste des ETF
// éligibles au PEA, et c'est précisément ce qui se périme partout. Première
// version : 14 fonds vérifiés (table de vérité du 28/09/2026, complétée le
// 14/10 par PTPXE).
//
// 28/10/2026 : la liste complète. Les 128 lignes cotées à Paris dont
// l'éligibilité est prouvée par un document daté de l'émetteur et recoupée
// par une source indépendante (relevé du 14/10/2026, src/lib/liste-pea/).
// Les 14 fonds de la première version y sont tous, avec les mêmes ISIN, frais
// et groupes (contrôlé par src/lib/liste-pea/index.ts).
//
// Tous les nombres de la page sont CALCULÉS sur les données : aucun n'est
// écrit à la main. Aucun cours ni aucune performance n'est affiché : la liste
// dit ce qu'est chaque ligne, pas comment elle s'est comportée.

const N = LIGNES_PEA.length;
const N_NON_ELIGIBLES = ETF_NON_ELIGIBLES.length;
/** « 14 octobre 2026 » */
const DATE_RELEVE = dateEnToutesLettres(DATE_RELEVE_LISTE_PEA);
/** « octobre 2026 » (dateEnToutesLettres écrit « 1er » le premier du mois). */
const MOIS_RELEVE = DATE_RELEVE.replace(/^\d+(?:er)?\s/, "");
/** « 28 septembre 2026 » : la première liste, celle de la table de vérité. */
const DATE_TABLE = dateEnToutesLettres(DATE_VERIFICATION_PEA);
/**
 * « du 28 septembre 2026 au 14 octobre 2026 » : la première liste a été
 * vérifiée le jour de la table, puis complétée (PTPXE, 14/10/2026). Même
 * intervalle que llms.txt.
 */
const PERIODE_PREMIERE_LISTE = (() => {
  const fin = dateEnToutesLettres(DERNIERE_VERIFICATION_PEA);
  return fin === DATE_TABLE ? `le ${DATE_TABLE}` : `du ${DATE_TABLE} au ${fin}`;
})();
const URL_CSV_ABSOLUE = `https://dcatracker.fr${CHEMIN_CSV_LISTE_PEA}`;

const N_EMETTEURS = EMETTEURS_LISTE.length;
const N_SANS_RESERVE = LIGNES_PEA.filter((l) => !avecReserve(l)).length;
const N_AVEC_RESERVE = N - N_SANS_RESERVE;
const N_USD = LIGNES_PEA.filter((l) => l.devise === "USD").length;
const LEVIER = LIGNES_PEA.filter((l) => l.levier);
const LEVIER_QUOTIDIEN = LEVIER.filter((l) => l.levier!.quotidien);
const LEVIER_NON_QUOTIDIEN = LEVIER.filter((l) => !l.levier!.quotidien);

/**
 * Groupes ouverts au chargement : les huit de la liste du 28/09/2026, ceux
 * vers lesquels renvoient les fiches et les guides. Les autres sont repliés
 * dans un <details>, leur contenu restant dans le HTML : sur téléphone, les
 * 128 lignes dépliées repoussaient le premier ISIN à 3 662 px et la FAQ à
 * 49 211 px (relecture du 14/10/2026). Les filtres ouvrent les groupes où ils
 * trouvent une ligne, une ancre (#monetaire, #fonds-lqq) ouvre le sien.
 */
const GROUPES_OUVERTS: ReadonlySet<CategorieId> = new Set<CategorieId>([
  "msci-world", "msci-acwi", "sp500", "nasdaq-100", "emergents", "europe", "russell-2000", "japon",
]);
const N_GROUPES_OUVERTS = GROUPES_LISTE.filter((g) => GROUPES_OUVERTS.has(g.id)).length;
const N_GROUPES_REPLIES = GROUPES_LISTE.length - N_GROUPES_OUVERTS;

// Requête visée : « ETF éligibles PEA » / « liste ETF PEA ». Les pages voisines
// visent autre chose : /guide-5-etf-pea-premium une sélection courte,
// /etf-msci-world le choix d'un tracker, /pea-ou-cto l'enveloppe,
// /comparatif-etf les face-à-face, /meilleurs-etf-debutants le premier ETF.
// 14/10/2026 : le nombre de lignes entre dans le title, pour que les résultats
// de recherche disent que la liste est désormais complète. 60 caractères au
// plus (scripts/check-seo-lengths.mjs) ; le site n'ajoute aucun suffixe.
const TITLE = `Liste des ${N} ETF éligibles au PEA, vérifiés (${MOIS_RELEVE})`;
const DESCRIPTION =
  `${N} ETF cotés à Paris et éligibles au PEA, vérifiés un par un sur les documents de l'émetteur (ISIN, frais, indice). ` +
  `Et ${N_NON_ELIGIBLES} fonds qui ne le sont pas.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL_LISTE_PEA },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL_LISTE_PEA,
    type: "article",
    // OG image générée par convention via etf-eligibles-pea/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// ─── Outils de rédaction ─────────────────────────────────────────────────────

/** ["A", "B", "C"] → « A, B et C » ; avec « ou » : « A, B ou C ». */
function enumerer(mots: string[], conjonction = "et"): string {
  if (mots.length <= 1) return mots.join("");
  return `${mots.slice(0, -1).join(", ")} ${conjonction} ${mots[mots.length - 1]}`;
}

const symboles = (fonds: { displaySymbol: string }[]) => enumerer(fonds.map((f) => f.displaySymbol));

/** Accord du verbe avec un nombre calculé. */
const accord = (n: number, singulier: string, pluriel: string) => (n > 1 ? pluriel : singulier);

/** « 2026-04-18 » → « 18/04/2026 » ; la date longue est dans le détail de la ligne. */
const dateCourte = (iso: string) => iso.split("-").reverse().join("/");

/** Date d'un document : « 30 septembre 2026 », ou « août 2026 » quand il ne porte qu'un mois. */
const dateDocument = (d: string) =>
  d.length === 7 ? dateEnToutesLettres(`${d}-01`).replace(/^1er\s/, "") : dateEnToutesLettres(d);

/** Mnémoniques en gras, séparés comme dans une phrase : « A, B et C ». */
function Mnemoniques({ fonds }: { fonds: { displaySymbol: string }[] }) {
  return (
    <>
      {fonds.map((f, i) => (
        <Fragment key={f.displaySymbol}>
          {i > 0 && (i === fonds.length - 1 ? " et " : ", ")}
          <strong className="font-semibold text-gray-900">{f.displaySymbol}</strong>
        </Fragment>
      ))}
    </>
  );
}

/** Libellé de l'effet de levier : « Levier x2, recalculé chaque jour ». */
function libelleLevier(l: LignePea): string {
  const lv = l.levier!;
  const base =
    lv.facteur === "x2"
      ? "Levier x2"
      : lv.facteur === "x-2"
        ? "Inverse (x-2)"
        : lv.facteur === "x-1"
          ? "Inverse (x-1)"
          : "Exposition d'environ 150 % (actions et contrats à terme obligataires)";
  return [
    base + (lv.quotidien ? ", recalculé chaque jour" : ""),
    lv.risqueDic ? `indicateur de risque du DIC : ${lv.risqueDic}` : null,
    lv.detentionDic
      ? `durée de détention recommandée par le DIC : ${lv.detentionDic}`
      : // Sans durée relevée, le dire : une ligne muette se lirait « pas de limite ».
        "durée de détention recommandée : non relevée, lisez le DIC avant tout achat",
  ]
    .filter(Boolean)
    .join(" · ");
}

// ─── Données dérivées ────────────────────────────────────────────────────────

const parTicker = (t: string) => LIGNES_PEA.find((l) => l.ticker === t)!;
const groupe = (id: CategorieId) => GROUPES_LISTE.find((g) => g.id === id)!;

/** Les 14 fonds de la première liste, par ordre alphabétique : les exemples de la page. */
const PREMIERE_LISTE = [...ETF_PEA_VERIFIES].sort((a, b) => a.displaySymbol.localeCompare(b.displaySymbol, "fr"));

// Section « le P ne prouve rien » : comptes sur la liste complète, exemples
// pris parmi les fonds de la première liste (les plus connus).
const commenceParP = (t: string) => t.startsWith("P");
const N_SANS_P = LIGNES_PEA.filter((l) => !commenceParP(l.ticker)).length;
const EXEMPLES_SANS_P = PREMIERE_LISTE.filter((f) => !commenceParP(f.displaySymbol));
const AMUNDI = LIGNES_PEA.filter((l) => l.emetteur === "Amundi");
const N_AMUNDI_P = AMUNDI.filter((l) => commenceParP(l.ticker)).length;
const N_AMUNDI_SANS_P = AMUNDI.length - N_AMUNDI_P;
const N_SANS_MOT_PEA = LIGNES_PEA.filter((l) => !/\bPEA\b/.test(l.nom)).length;
const SWAP_ELIGIBLES = PREMIERE_LISTE.filter((f) => /\bSwap\b/.test(f.name));
const SWAP_NON_ELIGIBLES = ETF_NON_ELIGIBLES.filter((f) => /\bSwap\b/.test(f.name));

// Section « pourquoi un ETF monde » : synthétique et physique, par indice.
const HORS_EUROPE: CategorieId[] = [
  "msci-world", "msci-acwi", "sp500", "nasdaq-100", "etats-unis", "russell-2000", "themes-monde", "emergents", "japon",
];
// Les lignes à effet de levier sont rangées à part, quel que soit leur indice :
// l'indice d'origine de chacune est donc écrit ici. 14/10/2026 : « les 39 qui
// suivent un indice hors d'Europe » oubliait LQQ (Nasdaq-100), CL2 (MSCI USA)
// et LWLD (MSCI World). Une ligne à levier non classée ici, ou classée deux
// fois, arrête la construction du site.
const LEVIER_INDICE_HORS_EUROPE = new Set(["CL2", "LQQ", "LWLD"]);
const LEVIER_INDICE_EUROPEEN = new Set(["BSX", "BX4", "LVC", "LVD", "LVE", "NTSZ", "SHC"]);
for (const l of LEVIER) {
  if (LEVIER_INDICE_HORS_EUROPE.has(l.ticker) === LEVIER_INDICE_EUROPEEN.has(l.ticker)) {
    throw new Error(
      `etf-eligibles-pea : ${l.ticker}, à effet de levier, doit figurer dans LEVIER_INDICE_HORS_EUROPE ou LEVIER_INDICE_EUROPEEN (page.tsx), et dans un seul.`,
    );
  }
}
for (const t of [...LEVIER_INDICE_HORS_EUROPE, ...LEVIER_INDICE_EUROPEEN]) {
  if (!LEVIER.some((l) => l.ticker === t)) throw new Error(`etf-eligibles-pea : ${t} n'est plus une ligne à effet de levier de la liste.`);
}
const LIGNES_HORS_EUROPE = LIGNES_PEA.filter(
  (l) => HORS_EUROPE.includes(l.categorie) || LEVIER_INDICE_HORS_EUROPE.has(l.ticker),
);
const N_LEVIER_HORS_EUROPE = LIGNES_HORS_EUROPE.filter((l) => l.levier).length;
const TOUTES_HORS_EUROPE_SYNTHETIQUES = LIGNES_HORS_EUROPE.every((l) => l.replication === "synthetique");
const PHYSIQUES = LIGNES_PEA.filter((l) => l.replication === "physique");
const PHYSIQUES_EUROPEENNES = PHYSIQUES.every((l) => !HORS_EUROPE.includes(l.categorie) && l.categorie !== "levier");
const N_SYNTHETIQUES = LIGNES_PEA.filter((l) => l.replication === "synthetique").length;

const SWAP_HORS_PEA = ETF_NON_ELIGIBLES.filter((f) => f.raison === "swap-hors-pea");
// Chez Amundi, chaque fonds « Swap » non éligible face à sa version « PEA »,
// éligible, sur le même indice : 500 / PSP5, ANX / PUST, AEEM / PAEEM.
const PAIRES_AMUNDI = SWAP_HORS_PEA.flatMap((swap) => {
  const pea = ETF_PEA_VERIFIES.find(
    (f) =>
      CORRESPONDANCES_PEA[swap.correspondance].symboles.includes(f.displaySymbol) &&
      f.name.startsWith("Amundi PEA"),
  );
  return pea ? [{ swap, pea }] : [];
});
const CW8_SWAP_ELIGIBLE = SWAP_ELIGIBLES.some((f) => f.displaySymbol === "CW8");
const SANS_DIC = ETF_NON_ELIGIBLES.filter((f) => f.raison === "sans-dic");
const PRESENTES_ELIGIBLES_ICI = ETF_NON_ELIGIBLES.filter((f) => f.presenteEligibleParLeSite);

const RAISON: Record<RaisonHorsPea, string> = {
  "swap-hors-pea":
    "Réplication synthétique (swap), et pourtant non éligible : le reporting mensuel d'Amundi du 31 août 2026, dans sa version pour professionnels, indique « Enveloppe fiscale : - », sans aucune mention du PEA, là où celui de CW8 affiche « Enveloppe fiscale : Eligible au PEA ». La page du fonds chez Amundi indique « Eligibilité au PEA : Non ».",
  physique:
    "Réplication physique : le fonds détient lui-même les actions de son indice, et ce ne sont pas, à plus de 75 %, des actions de sociétés de l'Union européenne ou de l'Espace économique européen, comme l'exige le PEA.",
  // Ce qui l'exclut du PEA, c'est d'être un fonds américain (fait
  // pea-regle-75 : SICAV, FCP ou OPCVM européen). L'absence de DIC dit
  // seulement qu'on ne peut pas l'acheter, même en compte-titres.
  "sans-dic":
    "Fonds américain : la loi ne prévoit dans un PEA que des fonds français ou européens (SICAV, FCP, OPCVM européens), et celui-ci n'en est pas un. " +
    "Il n'a pas non plus de document d'informations clés (DIC) : depuis le 1er janvier 2018, il ne peut plus être proposé aux particuliers de l'Espace économique européen, " +
    "et un courtier européen en refuse en principe l'achat, même en compte-titres.",
  "non-eligible": `Non éligible au PEA d'après les documents de l'émetteur, recoupés le ${DATE_TABLE}.`,
};

// ─── FAQ ─────────────────────────────────────────────────────────────────────
//
// Réponses calculées sur les mêmes données que la liste : une FAQ écrite à la
// main la contredirait à la première ligne ajoutée. `id` : ancre stable pour
// qui cite une réponse (#faq-japon), indépendante du libellé.

/** « CW8 (0,38 %), CW8U (0,38 %, cotée en dollars) » */
function avecFrais(lignes: LignePea[]): string {
  return enumerer(
    lignes.map((l) => {
      const precisions = [
        formatTer(l.frais),
        l.devise === "USD" ? "cotée en dollars" : null,
        /couvert en euros/.test(l.indice) ? "couverte contre le change" : null,
        /\bDist\b/.test(l.nom) ? "distribuante" : null,
      ].filter(Boolean);
      return `${l.ticker} (${precisions.join(", ")})`;
    }),
  );
}

const MSCI_WORLD = groupe("msci-world").lignes;
const SP500 = groupe("sp500").lignes;
const SP500_INDICE = SP500.filter((l) => /^S&P 500( \(|$)/.test(l.indice));
const SP500_FILTRES = SP500.filter((l) => !SP500_INDICE.includes(l));
const SP500_HORS_PEA = ETF_NON_ELIGIBLES.filter((f) => f.correspondance === "sp500");
const JAPON = groupe("japon").lignes;
const MONETAIRE = groupe("monetaire").lignes;
// ETF à effet de levier. 14/10/2026 : l'indicateur de risque est celui des
// seules lignes à détention d'un jour ; NTSZ (4/7, 5 ans, sans recalcul
// quotidien) est décrit à part.
const DETENTION_1_JOUR = LEVIER.filter((l) => l.levier!.detentionDic === "1 jour");
const N_DETENTION_1_JOUR = DETENTION_1_JOUR.length;
/** Toutes les lignes à recalcul quotidien, et elles seules, ont une détention d'un jour. */
const QUOTIDIEN_1_JOUR =
  N_DETENTION_1_JOUR === LEVIER_QUOTIDIEN.length && DETENTION_1_JOUR.every((l) => l.levier!.quotidien);
const RISQUES_LEVIER = [
  ...new Set(DETENTION_1_JOUR.flatMap((l) => (l.levier!.risqueDic ? [l.levier!.risqueDic] : []))),
].sort();
/** « x2, -1x ou -2x » : les multiples recalculés chaque jour, dans cet ordre. */
const LIBELLE_MULTIPLE: Record<string, string> = { x2: "x2", "x-1": "-1x", "x-2": "-2x" };
const MULTIPLES_QUOTIDIENS = Object.keys(LIBELLE_MULTIPLE)
  .filter((f) => LEVIER_QUOTIDIEN.some((l) => l.levier!.facteur === f))
  .map((f) => LIBELLE_MULTIPLE[f]);
if (LEVIER_QUOTIDIEN.some((l) => !LIBELLE_MULTIPLE[l.levier!.facteur])) {
  throw new Error("etf-eligibles-pea : multiple quotidien sans libellé (LIBELLE_MULTIPLE, page.tsx).");
}
/** Chaque ligne à levier a son indicateur de risque et sa durée de détention relevés. */
const LEVIER_DOCUMENTE = LEVIER.every((l) => l.levier!.risqueDic && l.levier!.detentionDic);
const LEVIER_HORS_BOURSORAMA = LEVIER_QUOTIDIEN.filter((l) => !l.recoupe.includes("Boursorama")).length;
const LWLD = LIGNES_PEA.find((l) => l.ticker === "LWLD");

/** « NTSZ, lui, expose à environ 150 % (…), sans recalcul quotidien : son DIC… » */
function phraseNonQuotidien(l: LignePea): string {
  const lv = l.levier!;
  const exposition =
    lv.facteur === "x1,5"
      ? "expose à environ 150 % (actions et contrats à terme obligataires)"
      : `a un effet de levier ${lv.facteur}`;
  const dic = [
    lv.risqueDic ? `lui donne un indicateur de risque de ${lv.risqueDic}` : null,
    lv.detentionDic ? `recommande une durée de détention de ${lv.detentionDic}` : null,
  ].filter(Boolean) as string[];
  return (
    `${l.ticker}, lui, ${exposition}, sans recalcul quotidien` +
    (dic.length ? ` : son DIC ${enumerer(dic)}. ` : ". ")
  );
}

const FAQ: { id: string; q: string; a: string }[] = [
  {
    id: "faq-combien",
    q: "Combien d'ETF sont éligibles au PEA ?",
    a:
      `À Euronext Paris, nous en avons vérifié ${N} au ${DATE_RELEVE}, un par ISIN, sur ${DECOMPTE_RELEVE.examinees} cotations examinées : ` +
      `chacun est déclaré éligible par un document daté de son émetteur, et recoupé par une source indépendante. ` +
      `Ce n'est pas un compte exhaustif : ${DECOMPTE_RELEVE.douteuses} lignes ne sont pas publiées, parce que les documents de leur émetteur n'établissent pas leur éligibilité ou un fait essentiel, et un lancement récent peut manquer. ` +
      `Plusieurs lignes sont des parts d'un même fonds : PUST et PNAS, par exemple.`,
  },
  {
    id: "faq-msci-world",
    q: "Quels ETF MSCI World sont éligibles au PEA ?",
    a:
      `Notre liste en compte ${MSCI_WORLD.length}, relevés le ${DATE_RELEVE} : ${avecFrais(MSCI_WORLD)}. ` +
      `EWLD est la part distribuante du même fonds que CW8. ` +
      (LWLD ? `LWLD, à effet de levier, est rangé avec les ETF à levier. ` : "") +
      `IWDA (iShares Core MSCI World), qui suit le même indice en réplication physique, n'est pas éligible.`,
  },
  // « Quels ETF S&P 500… » et non « Peut-on mettre un S&P 500… » : c'est déjà
  // la question de /etf-sp500. Même forme que la question MSCI World.
  {
    id: "faq-sp500",
    q: "Quels ETF S&P 500 sont éligibles au PEA ?",
    a:
      `Notre liste en compte ${SP500.length}, relevés le ${DATE_RELEVE}. ` +
      `${avecFrais(SP500_INDICE)} ${accord(SP500_INDICE.length, "suit", "suivent")} le S&P 500` +
      (SP500_FILTRES.length
        ? ` ; ${avecFrais(SP500_FILTRES)}, une version de l'indice filtrée sur des critères ESG. `
        : ". ") +
      `En revanche, ${symboles(SP500_HORS_PEA)} ${accord(SP500_HORS_PEA.length, "n'est pas éligible", "ne sont pas éligibles")}.`,
  },
  {
    id: "faq-japon",
    q: "Existe-t-il un ETF Japon éligible au PEA ?",
    // 14/10/2026 : la réponse disait « Nous n'en avons vérifié aucun » ;
    // PTPXE l'est (reporting Amundi au 30/09/2026, prospectus du 05/06/2026,
    // recoupés sur justETF et Boursorama). La réponse dit la correction.
    a:
      `Oui : ${enumerer(JAPON.map((l) => `${l.ticker} (${l.nom}, ISIN ${l.isin}, ${formatTer(l.frais)} de frais courants)`))}, ` +
      `tous deux sur l'indice TOPIX, la seconde couverte contre le change. ` +
      `${CORRESPONDANCES_PEA.japon.nuance ?? ""} JPNK (Amundi JPX-Nikkei 400), lui, n'est pas éligible. ` +
      `Jusqu'au 14 octobre 2026, cette réponse disait que nous n'en avions vérifié aucun.`,
  },
  {
    id: "faq-p",
    q: "Un ETF dont le mnémonique commence par P est-il éligible au PEA ?",
    a:
      `Le P n'est pas une règle. Sur les ${N} lignes de notre liste, ${N_SANS_P} ` +
      `${accord(N_SANS_P, "ne commence", "ne commencent")} pas par P, dont ${symboles(EXEMPLES_SANS_P)}. ` +
      `Et rien ne permet de dire qu'un P suffise : seul un document de l'émetteur, lu sur l'ISIN du fonds, établit l'éligibilité.`,
  },
  {
    id: "faq-levier",
    q: "Les ETF à effet de levier sont-ils éligibles au PEA ?",
    // 14/10/2026 : réécrite (« dont… dont », l'inverse x2 oublié, et un
    // indicateur de risque calculé avec NTSZ). Les multiples, les indicateurs
    // et la phrase sur Boursorama portent sur les seules lignes quotidiennes.
    a:
      `Certains, oui : notre liste en compte ${LEVIER.length}. ` +
      `Pour ${LEVIER_QUOTIDIEN.length} d'entre eux, l'exposition (${enumerer(MULTIPLES_QUOTIDIENS, "ou")}) est recalculée chaque jour : ` +
      `sur plusieurs jours, leur performance peut s'écarter fortement de ce multiple, y compris dans le mauvais sens. ` +
      (QUOTIDIEN_1_JOUR
        ? `Leur document d'informations clés (DIC) recommande une durée de détention d'un jour, et leur indicateur de risque y est de ${enumerer(RISQUES_LEVIER, "ou")} selon le fonds. `
        : `Pour ${N_DETENTION_1_JOUR} d'entre eux, le document d'informations clés (DIC) recommande une durée de détention d'un jour, avec un indicateur de risque de ${enumerer(RISQUES_LEVIER, "ou")}. `) +
      LEVIER_NON_QUOTIDIEN.map(phraseNonQuotidien).join("") +
      (LEVIER_HORS_BOURSORAMA === LEVIER_QUOTIDIEN.length
        ? `Au ${DATE_RELEVE}, le filtre PEA de Boursorama n'affichait aucun des ${LEVIER_QUOTIDIEN.length} ETF à levier quotidien.`
        : ""),
  },
  {
    id: "faq-monetaire",
    q: "Existe-t-il des ETF monétaires éligibles au PEA ?",
    a:
      `Oui, notre liste en compte ${MONETAIRE.length} : ${avecFrais(MONETAIRE)}. ` +
      `Ils ne suivent pas la Bourse mais un taux d'intérêt au jour le jour, l'€STR, par un contrat d'échange, et détiennent des actions européennes pour rester éligibles. ` +
      `Leur valeur suit ce taux, moins les frais : une poche de liquidités à l'intérieur du PEA, sans garantie en capital.`,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EtfEligiblesPeaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: "/" },
          { name: "ETF éligibles au PEA" },
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">ETF éligibles au PEA</span>
      </nav>

      <EducationalHeader
        icon={ListChecks}
        eyebrow={`Relevé du ${DATE_RELEVE}`}
        title={"ETF éligibles au PEA : la liste vérifiée"}
        subtitle={
          `${N} ETF (ou trackers) cotés à Paris et éligibles au PEA, chacun avec son ISIN, ses frais et le document de l'émetteur qui le prouve. ` +
          `Et ${N_NON_ELIGIBLES} fonds qui ne le sont pas, avec la raison pour chacun.`
        }
      />

      <ArticleByline
        publishedAt="2026-09-30"
        updatedAt={MISE_EN_LIGNE_LISTE_PEA}
        readingMinutes={10}
        url={URL_LISTE_PEA}
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* ── Périmètre ────────────────────────────────────────────────────── */}
      {/* En tête, pas en note de bas de page : c'est ce qui distingue cette
          liste d'une liste périmée, et ce qu'un site qui la cite doit pouvoir
          reprendre avec elle. 14/10/2026 : seulement le périmètre et la mise
          en garde ; la méthode et la raison d'être de la page sont après la
          liste (#methode). Sur téléphone, les quatre paragraphes et les
          pastilles repoussaient le premier ISIN de 2 136 à 3 662 px. */}
      <section
        aria-labelledby="perimetre"
        className="mb-10 rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6"
      >
        <h2 id="perimetre" className="text-lg font-bold text-gray-900 mb-3">
          Ce que cette liste est, et ce qu&apos;elle n&apos;est pas
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong className="text-gray-900">Les ETF cotés à Paris dont l&apos;éligibilité est prouvée.</strong>{" "}
            {N} lignes de cotation, une par ISIN, de {N_EMETTEURS} émetteurs,
            relevées le {DATE_RELEVE} sur {DECOMPTE_RELEVE.examinees} examinées.
            Chacune a un document daté de son émetteur qui la dit éligible au
            PEA, recoupé par au moins une source indépendante de lui.{" "}
            {DECOMPTE_RELEVE.douteuses} autres ne sont pas publiées&nbsp;: les
            documents de leur émetteur n&apos;établissent pas leur éligibilité,
            ou un fait essentiel comme les frais. {DECOMPTE_RELEVE.exclues} ont
            été écartées, non éligibles d&apos;après leur émetteur ou liquidées.
          </p>
          <p>
            Ce n&apos;est ni une liste exhaustive (un lancement récent peut
            manquer), ni un conseil d&apos;investissement&nbsp;: lisez le
            document d&apos;informations clés d&apos;un fonds avant de
            l&apos;acheter.{" "}
            <a href="#methode" className="font-medium text-primary-700 hover:underline">
              Notre méthode
            </a>{" "}
            est détaillée après la liste.
          </p>
        </div>
      </section>

      {/* Accès direct aux groupes, sur écran large seulement : sous 640 px,
          les 21 pastilles occupaient un écran entier, et le menu « Indice ou
          catégorie » des filtres fait le même travail. Un <nav> : l'index de
          recherche l'ignore, ce ne sont que des liens. */}
      <nav aria-label="Aller à un indice" className="mb-10 hidden flex-wrap gap-2 sm:flex">
        {GROUPES_LISTE.map((g) => (
          <a
            key={g.id}
            href={`#${g.id}`}
            className="text-xs font-semibold text-primary-700 bg-white border border-primary-100 hover:border-primary-300 px-3 py-1.5 rounded-full transition-colors"
          >
            {g.titre}
          </a>
        ))}
        <a
          href="#non-eligibles"
          className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-full transition-colors"
        >
          Non éligibles
        </a>
      </nav>

      {/* ── 1. La liste ──────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 id="liste" className="text-2xl font-bold text-gray-900 mb-4">
          La liste&nbsp;: {N} ETF éligibles au PEA, par indice
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Rangées par indice, puis par ordre alphabétique.{" "}
          {N_GROUPES_OUVERTS} groupes sont ouverts&nbsp;; les {N_GROUPES_REPLIES}{" "}
          autres s&apos;ouvrent d&apos;un clic sur leur titre, ou dès qu&apos;un
          filtre y trouve une ligne.
        </p>
        {/* Replié : le mode d'emploi passait avant le premier ISIN. */}
        <details className="group mb-6 rounded-2xl border border-gray-100 bg-white">
          <summary className="flex items-center justify-between gap-4 px-5 py-3 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none [&::-webkit-details-marker]:hidden">
            Comment lire la liste
            <span aria-hidden className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
              ▾
            </span>
          </summary>
          <div className="px-5 pb-4 pt-1 space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            Pour chaque ligne&nbsp;: son mnémonique (le code court sous lequel
            elle est cotée, cliquable quand nous avons une fiche), son nom
            officiel, son émetteur et l&apos;indice suivi&nbsp;; son ISIN (le
            code qui désigne sans ambiguïté une part précise du fonds&nbsp;:
            c&apos;est lui que vous saisissez chez le courtier)&nbsp;; ses frais
            courants annuels, prélevés chaque jour sur l&apos;actif du
            fonds&nbsp;; sa réplication&nbsp;; et la date depuis laquelle cet
            ISIN cote à Paris, d&apos;après le registre FIRDS.
          </p>
          <p>
            La réplication dit comment le fonds suit son indice&nbsp;: physique,
            il détient les actions de l&apos;indice&nbsp;; synthétique, il en
            reçoit la performance par un contrat d&apos;échange avec une banque,
            le swap, expliqué plus bas. Dans le nom officiel, «&nbsp;Acc&nbsp;»
            ou «&nbsp;Capitalisation&nbsp;» signale une part qui réinvestit les
            dividendes, «&nbsp;Dist&nbsp;» ou «&nbsp;Distribution&nbsp;» une part
            qui les verse. Sous chaque ligne, «&nbsp;Preuve PEA&nbsp;» ouvre le
            document de l&apos;émetteur, sa date, ce qu&apos;il dit, et la
            réserve éventuelle.
          </p>
          </div>
        </details>

        {/* Hors de la recherche interne : des contrôles, pas une réponse. */}
        <div data-nosearch="" className="mb-4 lg:-mx-24">
          <FiltresListePea
            groupes={GROUPES_LISTE.map((g) => ({ id: g.id, titre: g.titre, n: g.lignes.length }))}
            emetteurs={EMETTEURS_LISTE}
            total={N}
          />
        </div>
        <p data-nosearch="" className="mb-10 lg:-mx-24 text-sm">
          <a
            href={CHEMIN_CSV_LISTE_PEA}
            download
            className="inline-flex items-center gap-2 font-semibold text-primary-700 hover:underline"
          >
            <Download size={16} aria-hidden />
            Télécharger la liste (CSV, {N} lignes, relevé du {DATE_RELEVE})
          </a>
          <span className="block text-xs text-gray-500 mt-1">
            Une ligne par ISIN, avec la preuve de chacune. Licence CC BY 4.0&nbsp;:
            réutilisation libre en citant DCA Tracker et la date du relevé.
          </span>
        </p>

        <div className={`${styles.groupes} lg:-mx-24`}>
          {GROUPES_LISTE.map((g) => (
            <GroupeDeLaListe key={g.id} groupe={g} />
          ))}
        </div>

        <div className="text-xs text-gray-500 leading-relaxed mt-8 space-y-2">
          <p>
            «&nbsp;Cotée à Paris depuis&nbsp;» est la date de 1re cotation de
            l&apos;ISIN à Paris dans le registre FIRDS de l&apos;Autorité
            européenne des marchés financiers ({FIRDS.fichier}). Elle peut être
            plus récente que le fonds lui-même, quand une part a changé
            d&apos;ISIN ou de place&nbsp;: la date de 1re valeur liquidative
            publiée par l&apos;émetteur est dans le détail de la ligne, quand
            justETF la confirme. {N_USD} lignes cotées en dollars n&apos;y ont
            pas de date&nbsp;: elle n&apos;est pas établie.
          </p>
          <p>
            L&apos;encours (la taille du fonds) n&apos;est pas affiché&nbsp;:
            nos sources ne donnent pas toujours les mêmes montants, et nous ne
            publions pas un chiffre que nous n&apos;avons pas pu trancher.
          </p>
        </div>
      </section>

      {/* ── Méthode ──────────────────────────────────────────────────────── */}
      {/* 14/10/2026 : déplacée du haut de la page (bloc #perimetre), qui ne
          garde que le périmètre et la mise en garde. Les liens vers
          #perimetre restent valables. */}
      <section aria-labelledby="methode" className="mb-14">
        <h2 id="methode" className="text-2xl font-bold text-gray-900 mb-4 scroll-mt-20">
          Comment cette liste a été établie
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            <strong className="text-gray-900">La méthode.</strong> Point de
            départ&nbsp;: les ETF cotés à Euronext Paris (registre FIRDS de
            l&apos;Autorité européenne des marchés financiers, liste
            d&apos;Euronext), croisés avec le filtre PEA de Boursorama et les
            fonds qu&apos;Amundi déclare éligibles. Pour chaque ligne&nbsp;:
            l&apos;éligibilité lue dans un document de l&apos;émetteur (reporting
            mensuel, document d&apos;informations clés, prospectus ou fiche
            mensuelle), puis recoupée sur justETF ou Boursorama&nbsp;; la clé de
            contrôle de l&apos;ISIN vérifiée&nbsp;; les frais courants lus dans
            le document d&apos;informations clés. Quand un document contredit
            l&apos;autre, la ligne porte une réserve qui le dit&nbsp;: {N_AVEC_RESERVE}{" "}
            lignes sur {N} en ont une, dont les {LEVIER.length} à effet de levier.
          </p>
          <p>
            <strong className="text-gray-900">Ce qu&apos;elle ne dit pas.</strong>{" "}
            Ni cours, ni performance, ni encours&nbsp;: elle dit ce qu&apos;est
            chaque fonds, pas comment il s&apos;est comporté. Dans chaque groupe,
            les lignes sont rangées par ordre alphabétique, pas par préférence.
          </p>
          <p>
            <strong className="text-gray-900">Pourquoi cette page.</strong>{" "}
            Jusqu&apos;au {DATE_TABLE}, notre propre site présentait{" "}
            <Mnemoniques fonds={PRESENTES_ELIGIBLES_ICI} /> comme éligibles au
            PEA. Aucun ne l&apos;est. Une liste d&apos;ETF se périme sans
            prévenir&nbsp;: celle-ci porte sa date, et chaque ligne son ISIN et
            sa preuve, pour que vous puissiez la vérifier à votre tour. Les{" "}
            {ETF_PEA_VERIFIES.length} fonds de notre première liste, vérifiés{" "}
            {PERIODE_PREMIERE_LISTE}, y figurent tous.
          </p>
        </div>
      </section>

      {/* ── 2. Les faux amis ─────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 id="non-eligibles" className="text-2xl font-bold text-gray-900 mb-4">
          Ils ne sont pas éligibles au PEA
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Aucun de ces {N_NON_ELIGIBLES} fonds n&apos;entre dans un PEA, et{" "}
          {PRESENTES_ELIGIBLES_ICI.length}{" "}
          {accord(PRESENTES_ELIGIBLES_ICI.length, "a été présenté", "ont été présentés")} comme
          éligibles sur ce site même. Pour chacun, la raison, puis les fonds
          éligibles vérifiés qui en sont l&apos;équivalent en PEA, quand il en
          existe&nbsp;: une correspondance d&apos;indice, parfois approchée, pas
          une recommandation d&apos;achat.
        </p>
        <ul className="space-y-3">
          {ETF_NON_ELIGIBLES.map((f) => (
            <CarteNonEligible key={f.displaySymbol} fonds={f} />
          ))}
        </ul>
      </section>

      {/* ── 3. Le P ne prouve rien ───────────────────────────────────────── */}
      {/* Répond à l'idée qu'un P devant le mnémonique signalerait un ETF
          éligible. Comptes calculés sur la liste complète ; les exemples
          nommés viennent de la première liste, la plus connue. */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Le P du mnémonique ne prouve rien, le nom non plus
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Le P devant un mnémonique n&apos;est pas une règle. Sur les {N}{" "}
            lignes éligibles de notre liste, {N_SANS_P}{" "}
            {accord(N_SANS_P, "ne commence", "ne commencent")} pas par P, dont{" "}
            <Mnemoniques fonds={EXEMPLES_SANS_P} />.
            {N_AMUNDI_P > 0 && N_AMUNDI_SANS_P > 0 && (
              <>
                {" "}Chez Amundi même, {N_AMUNDI_P} lignes éligibles portent un P
                et {N_AMUNDI_SANS_P} n&apos;en portent pas.
              </>
            )}
          </p>
          <p>
            Le nom ne suffit pas davantage&nbsp;: {N_SANS_MOT_PEA} lignes
            éligibles n&apos;ont pas le mot «&nbsp;PEA&nbsp;» dans leur nom.
            {SWAP_ELIGIBLES.length > 0 && SWAP_NON_ELIGIBLES.length > 0 && (
              <>
                {" "}Et «&nbsp;Swap&nbsp;» ne dit rien de l&apos;éligibilité&nbsp;:{" "}
                <Mnemoniques fonds={SWAP_ELIGIBLES} />{" "}
                {accord(SWAP_ELIGIBLES.length, "le porte et est éligible", "le portent et sont éligibles")}
                ,{" "}<Mnemoniques fonds={SWAP_NON_ELIGIBLES} />{" "}
                {accord(SWAP_NON_ELIGIBLES.length, "le porte et ne l'est pas", "le portent et ne le sont pas")}.
              </>
            )}
          </p>
          <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            Ce qui fait foi&nbsp;: l&apos;ISIN, pour savoir de quel fonds on
            parle, et un document de l&apos;émetteur, pour savoir s&apos;il est
            éligible.
          </p>
        </div>
      </section>

      {/* ── 4. Pourquoi un ETF monde peut entrer dans un PEA ─────────────── */}
      {/* Faits pea-regle-75 (CMF L221-31), etf-synthetique-pourquoi-pea,
          swap-non-eligible, msci-world-poids-pays et ucits-contrepartie-10pc
          (CMF R214-21), vérifiés le 28/09/2026. « Plus de 75 % », pas « au
          moins » : c'est le texte de la loi. */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pourquoi un ETF «&nbsp;monde&nbsp;» ou «&nbsp;S&amp;P 500&nbsp;» peut entrer dans un PEA
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            La règle est dans la loi (article L221-31 du Code monétaire et
            financier)&nbsp;: un fonds n&apos;entre dans un PEA que s&apos;il
            investit plus de 75&nbsp;% de ses actifs en actions de sociétés qui
            ont leur siège dans l&apos;Union européenne, ou dans un pays de
            l&apos;Espace économique européen lié à la France par une convention
            d&apos;assistance administrative en matière fiscale.
            «&nbsp;Européen&nbsp;» ne suffit pas&nbsp;: les sociétés britanniques
            ou suisses ne comptent pas.
          </p>
          <p>
            Un ETF qui détient directement les actions du MSCI World ne peut pas
            y arriver&nbsp;: au 31 août 2026, les États-Unis pesaient 72,14&nbsp;%
            de l&apos;indice. La solution s&apos;appelle la{" "}
            <Link href="/glossaire/replication-synthetique" className="text-primary-700 font-medium hover:underline">
              réplication synthétique
            </Link>
            . Le fonds ne détient pas les actions de son indice&nbsp;: il détient
            un panier d&apos;actions de sociétés de l&apos;Union européenne ou de
            l&apos;Espace économique européen, pour plus de 75&nbsp;% de son
            actif, et signe avec une banque un contrat d&apos;échange, le swap,
            qui lui verse la performance de l&apos;indice.{" "}
            {N_SYNTHETIQUES} des {N} lignes de notre liste sont synthétiques
            {TOUTES_HORS_EUROPE_SYNTHETIQUES && (
              <>
                , dont les {LIGNES_HORS_EUROPE.length} qui suivent un indice
                hors d&apos;Europe (monde, États-Unis, pays émergents, Japon…)
                {N_LEVIER_HORS_EUROPE > 0 && (
                  <>, y compris {N_LEVIER_HORS_EUROPE} à effet de levier</>
                )}
              </>
            )}
            .
            {PHYSIQUES_EUROPEENNES && (
              <>
                {" "}Les {PHYSIQUES.length} lignes en réplication physique suivent,
                elles, des indices d&apos;actions européennes&nbsp;: le fonds peut
                détenir directement leurs actions.
              </>
            )}
          </p>
          {SWAP_HORS_PEA.length > 0 && (
            <p>
              L&apos;inverse ne tient pas&nbsp;: être synthétique ne rend pas
              éligible. <Mnemoniques fonds={SWAP_HORS_PEA} /> utilisent un swap et
              ne sont pas éligibles&nbsp;; leur reporting Amundi du 31 août 2026,
              dans sa version pour professionnels, indique «&nbsp;Enveloppe
              fiscale&nbsp;: -&nbsp;», sans aucune mention du PEA, là où celui de
              CW8 affiche «&nbsp;Enveloppe fiscale&nbsp;: Eligible au PEA&nbsp;».
              {PAIRES_AMUNDI.length > 0 && (
                <>
                  {" "}Pour{" "}
                  {enumerer(PAIRES_AMUNDI.map((p) => CORRESPONDANCES_PEA[p.swap.correspondance].libelle))},
                  Amundi propose une version «&nbsp;PEA&nbsp;», éligible, et une
                  version «&nbsp;Swap&nbsp;», qui ne l&apos;est pas (
                  {PAIRES_AMUNDI.map((p, i) => (
                    <Fragment key={p.swap.displaySymbol}>
                      {i > 0 && ", "}
                      <strong className="font-semibold text-gray-900">{p.pea.displaySymbol}</strong> face à{" "}
                      <strong className="font-semibold text-gray-900">{p.swap.displaySymbol}</strong>
                    </Fragment>
                  ))}
                  ).
                </>
              )}
              {CW8_SWAP_ELIGIBLE && (
                <>
                  {" "}Le nom trompe aussi dans l&apos;autre sens&nbsp;: CW8
                  s&apos;appelle «&nbsp;Swap&nbsp;» et il est éligible.
                </>
              )}
            </p>
          )}
          <p>
            Le swap a une contrepartie&nbsp;: l&apos;établissement qui verse au
            fonds la performance de l&apos;indice. Le risque de dépendre de lui,
            dit risque de contrepartie, est plafonné par la réglementation des
            fonds&nbsp;: au titre de ces contrats, il ne peut pas dépasser
            10&nbsp;% de l&apos;actif du fonds sur une même contrepartie quand
            c&apos;est un établissement de crédit, 5&nbsp;% dans les autres
            cas.
          </p>
        </div>
      </section>

      {/* ── 5. Vérifier soi-même ─────────────────────────────────────────── */}
      {/* Seulement ce que les faits établissent. */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Vérifier vous-même avant d&apos;acheter
        </h2>
        <ol className="space-y-4">
          {[
            <>
              <strong className="text-gray-900">Partez de l&apos;ISIN.</strong>{" "}
              Ni le nom ni le mnémonique ne suffisent, on vient de le voir.
              L&apos;ISIN désigne une part précise d&apos;un fonds&nbsp;: CW8 et
              EWLD sont deux parts du même fonds Amundi, l&apos;une
              capitalisante, l&apos;autre distribuante, avec deux ISIN
              différents. C&apos;est l&apos;ISIN que vous saisissez chez votre
              courtier.
            </>,
            <>
              <strong className="text-gray-900">Lisez l&apos;éligibilité chez l&apos;émetteur</strong>,
              sur la page du fonds et dans son reporting mensuel, le point que
              l&apos;émetteur publie chaque mois. Chez Amundi, la page du fonds
              l&apos;affiche en clair&nbsp;: «&nbsp;Eligibilité au PEA&nbsp;:
              Oui&nbsp;» pour CW8 et PAEEM, «&nbsp;Non&nbsp;» pour{" "}
              <Mnemoniques fonds={SWAP_HORS_PEA} /> (pages consultées le 30
              septembre 2026). Dans le reporting, c&apos;est la ligne
              «&nbsp;Enveloppe fiscale&nbsp;» qui tranche, et elle ne figure que
              dans la version pour professionnels, pas dans celle pour
              particuliers&nbsp;: au 31 août 2026, elle indiquait «&nbsp;Eligible
              au PEA&nbsp;» pour CW8 et PAEEM, et «&nbsp;-&nbsp;» pour les fonds
              non éligibles, dont le document ne mentionne le PEA nulle part. La
              ligne «&nbsp;Éligibilité&nbsp;» ne prouve rien&nbsp;: elle affiche
              «&nbsp;Compte-titres, Assurance-vie&nbsp;» aussi bien pour CW8 et
              PAEEM, éligibles au PEA, que pour les fonds qui ne le sont pas.
              Chaque ligne de notre liste donne le document qui fait foi pour
              elle, et sa date.
            </>,
            <>
              <strong className="text-gray-900">Recoupez avec une source indépendante de l&apos;émetteur</strong>&nbsp;:
              justETF, Boursorama ou Euronext. C&apos;est notre méthode&nbsp;: une
              ligne n&apos;entre dans cette liste que si une source indépendante
              confirme ce que dit l&apos;émetteur. Aucune n&apos;est
              infaillible&nbsp;: au {DATE_RELEVE}, le filtre PEA de Boursorama
              omettait les ETF à effet de levier d&apos;Amundi, et classait
              éligibles des fonds que leur émetteur déclare non éligibles.
            </>,
            <>
              <strong className="text-gray-900">Vérifiez que le fonds a un DIC</strong>,
              le document d&apos;informations clés qu&apos;exige le règlement
              européen PRIIPs pour le vendre à un particulier. Sans lui, un
              courtier européen en refuse en principe l&apos;achat&nbsp;:
              c&apos;est le cas de <Mnemoniques fonds={SANS_DIC} />.
            </>,
            <>
              <strong className="text-gray-900">Regardez la date.</strong> Une
              gamme bouge&nbsp;: GPEA n&apos;existe que depuis le 6 juillet 2026,
              et notre propre catalogue s&apos;est trompé jusqu&apos;au{" "}
              {DATE_TABLE}. Une liste sans date de vérification ne dit pas si
              elle est encore juste.
            </>,
          ].map((etape, i) => (
            <li key={i} className="flex gap-3 text-gray-600 leading-relaxed">
              <span className="shrink-0 w-6 h-6 mt-0.5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <span>{etape}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Renvoi vers le guide (29/09/2026), à la fin de l'article, avant la
          FAQ comme sur /pea-ou-cto et les guides d'indice : la page vient de
          dire comment vérifier un fonds avant l'achat ; le guide prend la
          suite, dans l'ordre. */}
      <RenvoiProduit
        produit="guide-demarrer-dca"
        contexte={
          "Savoir qu'un fonds entre dans un PEA ne dit pas par où commencer : ouvrir le plan, choisir un courtier " +
          "dont les frais conviennent à votre montant, passer le premier ordre sur l'ISIN, puis tenir le rythme les mois de baisse."
        }
        className="mb-14"
      />

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {/* <details>/<summary> comme les autres guides : chaque question est un
          passage de la recherche interne, avec son ancre. */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.id}
              id={item.id}
              className="group rounded-2xl border border-gray-100 bg-white overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none">
                {item.q}
                <span aria-hidden className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Sources ──────────────────────────────────────────────────────── */}
      {/* Textes officiels, registre FIRDS, documents Amundi qui tranchent les
          faux amis (fait swap-non-eligible, 30/09/2026) et PTPXE (14/10/2026).
          Le document de l'émetteur de CHAQUE ligne est dans son détail et dans
          le CSV : les 128 adresses ne sont pas répétées ici. */}
      <SourcesReferences
        intro={`Chaque ligne de la liste cite, dans son détail et dans le CSV, le document de son émetteur qui établit l'éligibilité, avec sa date. Ci-dessous, les textes officiels cités, le registre d'où viennent les dates de cotation, les sources de recoupement relevées le ${DATE_RELEVE}, et les documents d'Amundi qui tranchent l'éligibilité de 500, ANX et AEEM.`}
        sources={[
          {
            label: "Code monétaire et financier — article L221-31",
            url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051218125",
            publisher: "Légifrance",
            note: "Fonds éligibles au PEA : plus de 75 % de l'actif en actions de sociétés de l'UE ou de l'EEE. Version en vigueur depuis le 16 février 2025, consultée le 28 septembre 2026.",
          },
          {
            label: "Plan d'épargne en actions (PEA)",
            url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2385",
            publisher: "service-public.gouv.fr",
            note: "Titres et fonds que l'on peut placer dans un PEA. Fiche vérifiée le 22 mai 2026, consultée le 28 septembre 2026.",
          },
          {
            label: `Registre FIRDS — ${FIRDS.fichier}`,
            url: FIRDS.url,
            publisher: "Autorité européenne des marchés financiers (ESMA)",
            note: `Liste des instruments cotés à Euronext Paris, avec leur date de 1re cotation : source de la colonne « Cotée à Paris depuis ». Réutilisation autorisée avec citation de la source. Téléchargé le ${DATE_RELEVE}.`,
          },
          {
            label: "Liste des ETF cotés sur Euronext",
            url: "https://live.euronext.com/fr/products/etfs/list",
            publisher: "Euronext",
            note: `Mnémoniques et devises de cotation à Paris, recoupés avec le registre FIRDS. Consultée le ${DATE_RELEVE}.`,
          },
          {
            label: "justETF — fiche de chaque ETF",
            url: "https://www.justetf.com/fr/",
            publisher: "justETF",
            note: `Source de recoupement : mention « Éligible au PEA », frais, réplication, date de lancement. Fiches consultées le ${DATE_RELEVE}, à l'adresse justetf.com/fr/etf-profile.html?isin= suivie de l'ISIN.`,
          },
          {
            label: "Boursorama — recherche de trackers, filtre « Éligibilité PEA »",
            url: "https://www.boursorama.com/bourse/trackers/recherche/",
            publisher: "Boursorama",
            note: `Source de recoupement de l'éligibilité. Relevé le ${DATE_RELEVE}.`,
          },
          {
            label: "Les ETF : caractéristiques, état des lieux et analyse des risques (février 2017)",
            url: "https://www.amf-france.org/sites/institutionnel/files/contenu_simple/lettre_ou_cahier/risques_tendances/Les%20ETF%20%20caracteristiques,%20etat%20des%20lieux%20et%20analyse%20des%20risques%20-%20Le%20cas%20du%20marche%20francais.pdf",
            publisher: "Autorité des marchés financiers (AMF)",
            note: "Réplication physique et synthétique, contrat d'échange de performance. Consulté le 28 septembre 2026.",
          },
          {
            label: "MSCI World Index — fiche de l'indice (données au 31 août 2026)",
            url: "https://www.msci.com/documents/10199/255599/msci-world-index.pdf",
            publisher: "MSCI Inc.",
            note: "Poids des États-Unis : 72,14 % au 31 août 2026. Consultée le 28 septembre 2026.",
          },
          {
            label: "Code monétaire et financier — article R214-21",
            url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000027797309",
            publisher: "Légifrance",
            note: "Plafond du risque de contrepartie d'un fonds : 10 % de l'actif sur un établissement de crédit, 5 % sinon. Consulté le 28 septembre 2026.",
          },
          {
            label: "Application du règlement PRIIPs : quel sort pour les produits packagés américains ?",
            url: "https://www.amf-france.org/en/amf-ombudsman/ombudsman-online-diary/latest/application-priips-regulation-what-happens-us-packaged-products-subscribed-regulation-came-force",
            publisher: "AMF — journal de bord de la médiatrice, 9 mars 2023",
            note: "Fonds américains sans DIC : plus commercialisés auprès des particuliers de l'EEE depuis le 1er janvier 2018. Consulté le 28 septembre 2026.",
          },
          // 30/09/2026 : …/particuliers/products/… répondait 404 (adresse du
          // fait etf-pea-pust, fausse) ; …/particuliers/produits/… répond 200.
          {
            label: "Amundi PEA Nasdaq-100 UCITS ETF Acc (PUST) — fiche produit",
            url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-pea-nasdaq100-ucits-etf-acc/fr0011871110",
            publisher: "Amundi ETF",
            note: "Consultée le 30 septembre 2026.",
          },
          // 30/09/2026 : les documents d'Amundi qui établissent l'éligibilité
          // (fait swap-non-eligible). Reportings : la version pour
          // professionnels, datée, seule à porter la ligne « Enveloppe
          // fiscale » ; celle pour particuliers ne l'a pas.
          {
            label: "Amundi S&P 500 Swap UCITS ETF EUR Acc (500) — reporting mensuel au 31 août 2026, version pour professionnels",
            url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/LU1681048804/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
            publisher: "Amundi ETF",
            note: "« Enveloppe fiscale : - », aucune mention du PEA dans le document. Consulté le 30 septembre 2026.",
          },
          {
            label: "Amundi Nasdaq-100 Swap UCITS ETF EUR Acc (ANX) — reporting mensuel au 31 août 2026, version pour professionnels",
            url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/LU1681038243/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
            publisher: "Amundi ETF",
            note: "« Enveloppe fiscale : - », aucune mention du PEA dans le document. Consulté le 30 septembre 2026.",
          },
          {
            label: "Amundi MSCI Emerging Markets Swap UCITS ETF EUR Acc (AEEM) — reporting mensuel au 31 août 2026, version pour professionnels",
            url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/LU1681045370/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
            publisher: "Amundi ETF",
            note: "« Enveloppe fiscale : - », aucune mention du PEA dans le document. Consulté le 30 septembre 2026.",
          },
          {
            label: "Amundi MSCI World Swap UCITS ETF EUR Acc (CW8) — reporting mensuel au 31 août 2026, version pour professionnels",
            url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/LU1681043599/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
            publisher: "Amundi ETF",
            note: "« Enveloppe fiscale : Eligible au PEA ». La ligne « Éligibilité » y indique pourtant « Compte-titres, Assurance-vie », comme pour 500, ANX et AEEM. Consulté le 30 septembre 2026.",
          },
          {
            label: "Amundi PEA Emergent (MSCI Emerging) ESG Transition UCITS ETF Acc (PAEEM) — reporting mensuel au 31 août 2026, version pour professionnels",
            url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/FR0013412020/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
            publisher: "Amundi ETF",
            note: "« Enveloppe fiscale : Eligible au PEA ». La ligne « Éligibilité » y indique pourtant « Compte-titres, Assurance-vie », comme pour 500, ANX et AEEM. Consulté le 30 septembre 2026.",
          },
          {
            label: "Amundi S&P 500 Swap UCITS ETF EUR Acc (500) — page du fonds",
            url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-sp-500-swap-ucits-etf-eur-acc/lu1681048804",
            publisher: "Amundi ETF",
            note: "« Eligibilité au PEA : Non ». Consultée le 30 septembre 2026.",
          },
          {
            label: "Amundi Nasdaq-100 Swap UCITS ETF EUR Acc (ANX) — page du fonds",
            url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-nasdaq100-swap-ucits-etf-eur-acc/lu1681038243",
            publisher: "Amundi ETF",
            note: "« Eligibilité au PEA : Non ». Consultée le 30 septembre 2026.",
          },
          {
            label: "Amundi MSCI Emerging Markets Swap UCITS ETF EUR Acc (AEEM) — page du fonds",
            url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-msci-emerging-markets-swap-ucits-etf-eur-acc/lu1681045370",
            publisher: "Amundi ETF",
            note: "« Eligibilité au PEA : Non ». Consultée le 30 septembre 2026.",
          },
          {
            label: "Amundi MSCI World Swap UCITS ETF EUR Acc (CW8) — page du fonds",
            url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-msci-world-swap-ucits-etf-eur-acc/lu1681043599",
            publisher: "Amundi ETF",
            note: "« Eligibilité au PEA : Oui ». Consultée le 30 septembre 2026.",
          },
          {
            label: "Amundi PEA Emergent (MSCI Emerging) ESG Transition UCITS ETF Acc (PAEEM) — page du fonds",
            url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-pea-emergent-msci-emerging-esg-transition-ucits-etf-acc/fr0013412020",
            publisher: "Amundi ETF",
            note: "« Eligibilité au PEA : Oui ». Consultée le 30 septembre 2026.",
          },
          // 14/10/2026 : les documents d'Amundi qui établissent l'éligibilité
          // et les frais de PTPXE (archives : private-assets/raw/geo/
          // sources-vague1-2026-10/).
          {
            label: "Amundi PEA Japon (TOPIX) UCITS ETF — prospectus du 5 juin 2026",
            url: "https://www.amundietf.fr/pdfDocuments/prospectus/FR0013411980/FRA/FRA/20260605",
            publisher: "Amundi ETF",
            note: "« Le Fonds est éligible au Plan d'Epargne en Actions ». Consulté le 14 octobre 2026.",
          },
          {
            label: "Amundi PEA Japon (TOPIX) UCITS ETF EUR Acc (PTPXE) — document d'informations clés du 5 juin 2026",
            url: "https://www.amundietf.fr/pdfDocuments/kid-priips/FR0013411980/FRA/FRA/20260605",
            publisher: "Amundi ETF",
            note: "Frais courants : 0,20 % de la valeur de l'investissement par an. Consulté le 14 octobre 2026.",
          },
        ]}
      />

      {/* ── JSON-LD ──────────────────────────────────────────────────────── */}
      {/* FAQPage et Dataset (le CSV) — l'Article est émis par ArticleByline.
          Les deux portent la date de mise en ligne, comme la byline et le
          sitemap (MISE_EN_LIGNE_LISTE_PEA). */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "ETF éligibles au PEA cotés à Euronext Paris",
          description:
            `${N} ETF cotés à Paris et éligibles au PEA au ${DATE_RELEVE}, un par ISIN : mnémonique, nom, émetteur, indice, réplication, frais courants, devise, ` +
            `date de 1re cotation à Paris, effet de levier, et le document de l'émetteur qui établit l'éligibilité, avec sa date.`,
          url: `https://dcatracker.fr${URL_LISTE_PEA}`,
          inLanguage: "fr-FR",
          isAccessibleForFree: true,
          license: "https://creativecommons.org/licenses/by/4.0/",
          creator: { "@id": "https://dcatracker.fr/a-propos#person" },
          publisher: { "@id": "https://dcatracker.fr#organization" },
          datePublished: MISE_EN_LIGNE_LISTE_PEA,
          dateModified: MISE_EN_LIGNE_LISTE_PEA,
          temporalCoverage: DATE_RELEVE_LISTE_PEA,
          distribution: {
            "@type": "DataDownload",
            encodingFormat: "text/csv",
            contentUrl: URL_CSV_ABSOLUE,
          },
        }}
      />
    </div>
  );
}

// ─── Sous-composants (propres à la page) ─────────────────────────────────────

/**
 * Un groupe de la liste : un vrai <table> sur écran large (copiable, lisible
 * par un robot), qui se replie en cartes sous 640 px. Styles dans
 * liste.module.css, posés une fois par sélecteurs descendants : les 128
 * lignes n'ont presque pas de classes, et les textes sont assemblés en une
 * seule chaîne par élément (pas de fragments React), pour que la page reste
 * légère. Un seul DOM — les ancres #fonds-xxx n'existent qu'une fois.
 *
 * Les groupes hors de GROUPES_OUVERTS sont dans un <details> fermé, leur titre
 * (h3 avec son id) dans le <summary> : le contenu reste dans le HTML, pour les
 * robots, la recherche du navigateur et les filtres.
 */
function GroupeDeLaListe({ groupe: g }: { groupe: GroupeListe }) {
  const guide: Partial<Record<CategorieId, { href: string; label: string }>> = {
    "msci-world": { href: "/etf-msci-world", label: "notre guide des ETF MSCI World" },
    sp500: { href: "/etf-sp500", label: "notre guide des ETF S&P 500" },
    "nasdaq-100": { href: "/etf-nasdaq", label: "notre guide des ETF Nasdaq 100" },
  };
  const lien = guide[g.id];
  const ouvert = GROUPES_OUVERTS.has(g.id);
  const titre = (
    <h3 id={g.id} className={`text-lg font-bold text-gray-900 scroll-mt-20${ouvert ? " mb-1" : ""}`}>
      {g.titre}{" "}
      <span className="text-sm font-medium text-gray-500">
        {`· ${g.lignes.length} ${accord(g.lignes.length, "ligne", "lignes")}`}
      </span>
    </h3>
  );
  const contenu = (
    <>
      <p className="text-sm text-gray-500 leading-relaxed mb-3">
        {g.description}
        {lien && (
          <>
            {" "}Pour les comparer&nbsp;:{" "}
            <Link href={lien.href} className="text-primary-700 font-medium hover:underline">
              {lien.label}
            </Link>
            .
          </>
        )}
      </p>
      {g.id === "levier" && <BandeauLevier />}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <table className={styles.t}>
          <caption className="sr-only">{`ETF ${g.titre} éligibles au PEA, relevés le ${DATE_RELEVE}`}</caption>
          <thead>
            <tr>
              <th scope="col">Fonds</th>
              <th scope="col">ISIN</th>
              <th scope="col">Frais</th>
              <th scope="col">Réplication</th>
              <th scope="col">Cotée à Paris depuis</th>
            </tr>
          </thead>
          <tbody>
            {g.lignes.map((l) => (
              <LigneDeLaListe key={l.ticker} l={l} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
  if (ouvert) {
    return (
      <div data-groupe="">
        {titre}
        {contenu}
      </div>
    );
  }
  return (
    <details data-groupe="" className={styles.replie}>
      <summary>
        {titre}
        <span aria-hidden>▾</span>
      </summary>
      <div>{contenu}</div>
    </details>
  );
}

/**
 * Mise en garde du groupe « levier ». 14/10/2026 : elle annonçait 7 lignes à
 * détention d'un jour ; les DIC de LWLD et LVD en recommandent aussi un (9),
 * et celui de NTSZ, 5 ans. Tout est calculé sur les lignes.
 */
function BandeauLevier() {
  return (
    <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 leading-relaxed mb-3">
      Ces fonds sont éligibles au PEA, mais{" "}
      {QUOTIDIEN_1_JOUR ? (
        <>
          {LEVIER_QUOTIDIEN.length} d&apos;entre eux ont une exposition
          recalculée chaque jour, et leur document d&apos;informations clés
          (DIC) recommande une durée de détention d&apos;un jour.
        </>
      ) : (
        <>
          pour {N_DETENTION_1_JOUR} d&apos;entre eux, le document
          d&apos;informations clés (DIC) recommande une durée de détention
          d&apos;un jour.
        </>
      )}
      {LEVIER_NON_QUOTIDIEN.map((l) =>
        l.levier!.detentionDic ? (
          <Fragment key={l.ticker}>
            {" "}{l.ticker}, sans recalcul quotidien, a une durée recommandée de{" "}
            {l.levier!.detentionDic}.
          </Fragment>
        ) : null,
      )}{" "}
      {LEVIER_DOCUMENTE
        ? "L'indicateur de risque du DIC et cette durée sont donnés sur chaque ligne."
        : "L'indicateur de risque du DIC et cette durée sont donnés sur chaque ligne où nous les avons relevés."}
    </p>
  );
}

function LigneDeLaListe({ l }: { l: LignePea }) {
  const comparatifs = A_UNE_FICHE.has(l.ticker)
    ? []
    : ETF_COMPARISON_LIST.filter((c) => c.left.heading === l.ticker || c.right.heading === l.ticker);
  // data-passage : la ligne est un passage de la recherche interne à elle
  // seule, titré « CW8 — Amundi MSCI World… », ancre #fonds-cw8
  // (scripts/build-search-index.mjs). data-l : intitulé de la cellule, affiché
  // sur téléphone par td::before (liste.module.css), sans élément en plus.
  return (
    <tr
      id={ancreFonds(l.ticker)}
      data-passage={`${l.ticker} — ${l.nom}`}
      data-ligne=""
      data-cat={l.categorie}
      data-em={l.emetteur}
      data-dev={l.devise}
      {...(l.levier ? { "data-lev": "1" } : {})}
    >
      <td>
        <p>
          {A_UNE_FICHE.has(l.ticker) ? (
            <Link href={`/etf/${l.ticker}`}>{l.ticker}</Link>
          ) : (
            <strong>{l.ticker}</strong>
          )}
          {l.devise === "USD" && <em>en dollars</em>}
          {l.partCD && <em>part C/D</em>}
          {l.levier && <em className="r">{l.levier.quotidien ? "levier quotidien" : "levier"}</em>}
        </p>
        <p>{l.nom}</p>
        <p>{`${l.emetteur} · ${l.indice}`}</p>
        {l.levier && <p className="lv">{libelleLevier(l)}</p>}
        {l.note && <p className="nt">{l.note}</p>}
        {comparatifs.map((c) => (
          <Link key={c.slug} href={`/comparatif-etf/${c.slug}`}>
            {`Comparatif ${c.left.heading} vs ${c.right.heading}`}
          </Link>
        ))}
        <DetailLigne l={l} />
      </td>
      <td data-l="ISIN">
        <span className="i">{l.isin}</span>
      </td>
      <td data-l="Frais">
        <b>
          {formatTer(l.frais)}
          {l.fraisEstimes && <small>estimés</small>}
        </b>
      </td>
      <td data-l="Réplication">{LIBELLE_REPLICATION[l.replication]}</td>
      <td data-l="Cotée à Paris depuis">
        {l.coteeDepuis ? <time dateTime={l.coteeDepuis}>{dateCourte(l.coteeDepuis)}</time> : "non établie"}
      </td>
    </tr>
  );
}

/**
 * La preuve de la ligne, et ce qu'il faut savoir d'elle. Fermé par défaut.
 * Un <p> par fait, son intitulé en <b> (affiché en bloc) : 14/10/2026, le
 * <dl> et ses <div>/<dt>/<dd> faisaient environ 1 500 éléments sur la page.
 * L'espace finale de chaque intitulé sépare les mots dans le texte extrait
 * (recherche interne, copier-coller) ; elle ne se voit pas.
 */
function DetailLigne({ l }: { l: LignePea }) {
  const p = l.preuve;
  const mention = p.paraphrase ? p.mention : `« ${p.mention} »`;
  const vl = l.premiereVl ? `${dateEnToutesLettres(l.premiereVl)}, selon l'émetteur` : "non établie";
  const cotee = l.coteeDepuis
    ? `cotée à Paris depuis le ${dateEnToutesLettres(l.coteeDepuis)} (registre FIRDS)`
    : "date de 1re cotation à Paris non établie";
  return (
    <details>
      {/* Le mnémonique, pour les lecteurs d'écran : sinon 128 boutons
          « Preuve PEA » identiques. */}
      <summary className={l.reserve ? "r" : undefined}>
        {l.reserve ? "Preuve PEA · réserve" : "Preuve PEA"}
        <span className="sr-only">{` ${l.ticker}`}</span>
      </summary>
      <p>
        <b>Éligibilité au PEA </b>
        {`${p.document}, ${dateDocument(p.date)} : ${mention}. `}
        <a href={p.url} target="_blank" rel="noopener">
          Lire le document
        </a>
      </p>
      <p>
        <b>Recoupé par </b>
        {`${enumerer(l.recoupe)}, le ${DATE_RELEVE}`}
      </p>
      <p>
        <b>Dates </b>
        {`1re valeur liquidative : ${vl} ; ${cotee}.`}
      </p>
      {l.reserve && (
        <p className="r">
          <b>Réserve </b>
          {l.reserve}
        </p>
      )}
      {l.equivalentEuros && (
        <p>
          <b>Ligne en euros du même fonds </b>
          <a href={`#${ancreFonds(l.equivalentEuros)}`}>{l.equivalentEuros}</a>
          {` (${parTicker(l.equivalentEuros).isin})`}
        </p>
      )}
    </details>
  );
}

function CarteNonEligible({ fonds: f }: { fonds: EtfNonEligible }) {
  const c = CORRESPONDANCES_PEA[f.correspondance];
  return (
    <li id={ancreHorsPea(f.displaySymbol)} className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-1">
        {f.aUneFiche ? (
          <Link href={`/etf/${f.displaySymbol}`} className="text-base font-bold text-primary-700 hover:underline">
            {f.displaySymbol}
          </Link>
        ) : (
          <span className="text-base font-bold text-gray-900">{f.displaySymbol}</span>
        )}
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full border text-slate-600 bg-slate-50 border-slate-200">
          Non éligible au PEA
        </span>
        {/* Texte court : à 375 px, la version datée passait sur deux lignes
            dans la pastille. La date est dans l'encadré « Pourquoi cette
            page ». */}
        {f.presenteEligibleParLeSite && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border text-amber-800 bg-amber-50 border-amber-200">
            Présenté à tort comme éligible sur ce site
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600">{f.name}</p>
      <p className="text-xs text-gray-500 mt-1">
        ISIN <span className="font-mono text-gray-700 select-all">{f.isin}</span> · Frais {formatTer(f.ter)}
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mt-3">{RAISON[f.raison]}</p>
      {f.precision && <p className="text-sm text-gray-600 leading-relaxed mt-2">{f.precision}</p>}
      <p className="text-sm text-gray-700 leading-relaxed mt-3 pt-3 border-t border-gray-100">
        {c.symboles.length > 0 ? (
          <>
            <span className="font-semibold text-gray-900">Pour {c.libelle} dans un PEA</span>, fonds
            vérifiés&nbsp;:{" "}
            {c.symboles.map((s, i) => (
              <Fragment key={s}>
                {i > 0 && (i === c.symboles.length - 1 ? " et " : ", ")}
                <a href={`#${ancreFonds(s)}`} className="font-semibold text-primary-700 hover:underline">
                  {s}
                </a>
              </Fragment>
            ))}
            .{c.nuance && <> {c.nuance}</>}
          </>
        ) : (
          <>
            <span className="font-semibold text-gray-900">Pour {c.libelle} dans un PEA</span>, nous
            n&apos;avons vérifié aucun fonds. Cela ne veut pas dire qu&apos;il n&apos;en existe pas.
          </>
        )}
      </p>
    </li>
  );
}
