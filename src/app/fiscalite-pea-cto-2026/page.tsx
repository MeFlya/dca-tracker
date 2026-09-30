import type { Metadata } from "next";
import Link from "next/link";
import { Percent } from "lucide-react";
import { EducationalHeader } from "@/components/ui/EducationalHeader";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import { JsonLd } from "@/components/ui/JsonLd";
import { RenvoiProduit } from "@/components/products/RenvoiProduit";
import { dateEnToutesLettres } from "@/lib/etf-pea-verifies";
import {
  TAUX_VERIFIES_LE,
  baremeCapital,
  computeFiscalComparison,
  formatFiscalEur,
  tauxAffiche,
} from "@/lib/fiscal/pea-cto";

// ─── Pourquoi cette page (30/09/2026) ────────────────────────────────────────
//
// Fin septembre 2026, beaucoup de sites de finance personnelle affichent encore
// des taux périmés (PFU à 30 %, prélèvements sociaux à 17,2 % pour un PEA ou
// un CTO), et les assistants IA les reprennent (relevé du 29/09/2026, questions
// « fiscalité du PEA en 2026 : prélèvements sociaux » et « PFU 2026 : quel taux
// sur les plus-values ? »). Le site n'avait pas de page qui y réponde. Celle-ci
// est courte, datée et sourcée, pour être citée telle quelle.
//
// ─── D'où vient chaque chiffre ──────────────────────────────────────────────
//
// Faits FISC-* (sources du guide « Démarrer le DCA en France »), consultés le
// 28/09/2026 : FISC-PS-03 à 05 (hausse, dates, ce qui reste à 17,2 %),
// FISC-CTO-01 à 03 et 05, FISC-DIV-01 et 02, FISC-PEA-05, 06 et 10. Ajoutés
// le 30/09/2026 après relecture : FISC-PS-06 (BOSS, questions-réponses Q4 à
// Q6) et FISC-DIV-03 (dividendes de 2025 sans prélèvements sociaux retenus
// au versement : 18,6 % sur l'avis d'imposition).
// Les taux du PEA et du CTO sont lus dans BAREMES_CAPITAL (fiscal/pea-cto.ts),
// pour des années ÉCRITES ici et non pour l'année en cours : la page parle de
// 2026, une future loi de finances ne doit pas la réécrire en silence. Les
// montants en euros sortent du même moteur (computeFiscalComparison).
//
// ⚠️ Décision du 29/09/2026 : la hausse ne se décompose pas. Ni « CSG à
// 10,6 % », ni le nom d'une contribution : le BOSS et l'Urssaf désignent la
// hausse de 1,4 point sous le nom de « contribution financière pour
// l'autonomie », ce qui contredit la lecture « CSG » de certains faits. On
// écrit « 18,6 %, soit 1,4 point de plus qu'avant (17,2 %) », et le PFU
// « 31,4 % : 12,8 % d'impôt sur le revenu et 18,6 % de prélèvements sociaux ».
// Seule mention de la CSG : la part déductible des prélèvements sociaux avec
// l'option pour le barème (6,8 points, FISC-CTO-03, CGI art. 154 quinquies),
// qui est le nom du mécanisme dans la loi. La phrase sur la hausse (« elle
// n'est pas déductible ») ne dit PAS que la hausse est de la CSG : elle vient
// du BOSS (FISC-PS-06, Q5), qui la déclare non déductible, et reste juste
// sous les deux lectures. Ne pas la recoller à la phrase sur la CSG.
//
// Requête visée : « PFU 2026 », « prélèvements sociaux 2026 », « ce qui
// change ». Les voisines visent autre chose : /pea-ou-cto le choix de
// l'enveloppe, /calculateur-fiscal-pea-cto le calcul sur son cas,
// /glossaire/pfu et /glossaire/pea les définitions.

const URL_PAGE = "/fiscalite-pea-cto-2026";
const PUBLIEE_LE = "2026-09-30";
/**
 * Date de relecture des taux, lue dans le moteur (TAUX_VERIFIES_LE) comme sur
 * /calculateur-fiscal-pea-cto et dans l'image OG de cette page : les trois ne
 * peuvent pas afficher des dates différentes.
 */
const DATE_VERIF = dateEnToutesLettres(TAUX_VERIFIES_LE);
/**
 * Consultation des sources ajoutées à la relecture du 30/09/2026 (BOSS,
 * brochure IR p. 124 et 132, CMF L. 221-32 relu) : faits FISC-PS-06,
 * FISC-DIV-03, notes de FISC-PEA-06 et 10. Distincte de DATE_VERIF, pour ne
 * pas dater du 28 une lecture faite le 30.
 */
const DATE_COMPLEMENTS = dateEnToutesLettres("2026-09-30");

const TITLE = "PFU et prélèvements sociaux 2026\u00a0: ce qui change (PEA, CTO)";
const DESCRIPTION =
  "Gains d'un PEA ou d'un CTO\u00a0: 18,6\u00a0% de prélèvements sociaux en 2026, soit 1,4\u00a0point de plus, et un PFU de 31,4\u00a0%. Depuis quand, ce qui reste à 17,2\u00a0%.";
const H1 = "Fiscalité du PEA et du CTO en 2026\u00a0: ce qui a changé";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL_PAGE },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL_PAGE,
    type: "article",
    // OG image générée par convention via fiscalite-pea-cto-2026/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// ─── Taux : le barème du moteur, à des années fixées ────────────────────────
//
// La hausse ne tombe pas la même année selon le revenu (FISC-PS-04, LFSS 2026
// art. 12, II) :
//   · produits de placement (dividendes, retraits de PEA) : 17,2 % jusqu'en
//     2025, 18,6 % depuis le 1er janvier 2026 — pour les dividendes, À
//     CONDITION que les prélèvements sociaux aient été retenus au versement ;
//   · plus-values de vente sur un CTO : 17,2 % jusqu'aux plus-values de 2024,
//     18,6 % dès celles de 2025. Même règle pour des dividendes de 2025 sur
//     lesquels rien n'a été retenu au versement (FISC-DIV-03 : brochure IR
//     2026 p. 124, BOSS Q4) : ils se déclarent, 18,6 % sur l'avis.
// En 2026, les deux catégories ont le même barème (commentaire de
// BAREMES_CAPITAL) : les taux affichés sont lus sur les produits de placement.

const ANNEE = 2026;
/** Dernière année à l'ancien taux pour les dividendes et les retraits de PEA. */
const AVANT_PLACEMENT = 2025;
/** Dernière année à l'ancien taux pour les plus-values de vente d'un CTO. */
const AVANT_PLUS_VALUE = 2024;

const B_2026 = baremeCapital(ANNEE, "produit-placement");
const B_AVANT = baremeCapital(AVANT_PLACEMENT, "produit-placement");

/** 0.186 → « 18,6 % », espace insécable avant le signe. */
const pc = (t: number) => `${tauxAffiche(t)}\u00a0%`;
const PS = pc(B_2026.sociaux); // « 18,6 % »
const PS_AVANT = pc(B_AVANT.sociaux); // « 17,2 % »
const PFU = pc(B_2026.pfu); // « 31,4 % »
const PFU_AVANT = pc(B_AVANT.pfu); // « 30 % »
const IR = pc(B_2026.pfu - B_2026.sociaux); // « 12,8 % »
/** Hausse des prélèvements sociaux, en points : « 1,4 ». */
const HAUSSE = tauxAffiche(B_2026.sociaux - B_AVANT.sociaux);
/** Écart PEA de plus de 5 ans / CTO, en points : « 12,8 ». */
const ECART_POINTS = tauxAffiche(B_2026.pfu - B_2026.sociaux);
/**
 * Taux MAINTENU pour l'assurance-vie, les PEL et CEL, le PEP, les revenus
 * fonciers et les plus-values immobilières (FISC-PS-03, IV de l'art. L. 136-8
 * CSS). Le moteur ne modélise pas ces placements : le taux est écrit ici, avec
 * sa source.
 */
const PS_MAINTENU = "17,2\u00a0%";

// ─── Exemple : calculé par le moteur ────────────────────────────────────────
//
// Deux plus-values types (des hypothèses, pas des résultats) ; l'impôt, lui,
// vient de computeFiscalComparison, aux taux d'avant la hausse puis à ceux de
// 2026. « Anciens taux » n'est pas employé : sur cette page, il désignerait
// aussi les taux historiques d'un PEA ouvert avant 2018, qui ne sont pas
// 17,2 %.
// Le moteur raisonne en versements et valeur finale : une plus-value seule,
// c'est une valeur finale égale au gain pour zéro versé. Durée de 5 ans : le
// moteur n'applique les prélèvements sociaux seuls qu'à partir de 5 ans.

const PLUS_VALUES_EXEMPLE = [10_000, 50_000];
const DUREE_PEA = 5;

function impotSur(gain: number, annee: number) {
  return computeFiscalComparison({
    totalInvested: 0,
    finalValue: gain,
    holdingYears: DUREE_PEA,
    annee,
  });
}

const EXEMPLES = PLUS_VALUES_EXEMPLE.map((gain) => ({
  gain,
  pea: {
    avant: impotSur(gain, AVANT_PLACEMENT).pea.taxDue,
    apres: impotSur(gain, ANNEE).pea.taxDue,
  },
  cto: {
    avant: impotSur(gain, AVANT_PLUS_VALUE).cto.taxDue,
    apres: impotSur(gain, ANNEE).cto.taxDue,
  },
}));

type Exemple = (typeof EXEMPLES)[number];
const eur = formatFiscalEur;
const hausseDe = (x: { avant: number; apres: number }) => x.apres - x.avant;
const ecartApres = (e: Exemple) => e.cto.apres - e.pea.apres;
const ecartAvant = (e: Exemple) => e.cto.avant - e.pea.avant;
/** Les phrases « même hausse » et « écart inchangé » ne s'écrivent que si le calcul les confirme. */
const MEME_HAUSSE = EXEMPLES.every((e) => Math.round(hausseDe(e.pea)) === Math.round(hausseDe(e.cto)));
const ECART_INCHANGE = EXEMPLES.every((e) => Math.round(ecartApres(e)) === Math.round(ecartAvant(e)));
const PREMIER = EXEMPLES[0];

// ─── Tableau avant / 2026 ────────────────────────────────────────────────────

const LIGNES: { revenu: string; avant: string; apres: string; depuis: string }[] = [
  {
    revenu: "PEA de plus de 5\u00a0ans\u00a0: gain retiré",
    avant: `${PS_AVANT} de prélèvements sociaux, sans impôt sur le revenu`,
    apres: `${PS} de prélèvements sociaux, sans impôt sur le revenu`,
    depuis: "Retraits faits depuis le 1er\u00a0janvier 2026",
  },
  {
    revenu: "PEA de moins de 5\u00a0ans\u00a0: gain retiré",
    avant: `PFU de ${PFU_AVANT}`,
    apres: `PFU de ${PFU}`,
    depuis: "Retraits faits depuis le 1er\u00a0janvier 2026",
  },
  {
    revenu: "CTO\u00a0: plus-value de vente",
    avant: `PFU de ${PFU_AVANT}`,
    apres: `PFU de ${PFU}`,
    depuis: "Plus-values réalisées à partir de 2025, déclarées en 2026",
  },
  {
    revenu: "CTO\u00a0: dividendes",
    avant: `PFU de ${PFU_AVANT}`,
    apres: `PFU de ${PFU}`,
    depuis:
      "Dividendes perçus depuis le 1er\u00a0janvier 2026, et ceux de 2025 qui n'ont pas supporté les prélèvements sociaux au versement",
  },
  {
    revenu: "PEA\u00a0: dividendes laissés dans le plan",
    avant: "Rien tant qu'ils restent dans le plan",
    apres: "Rien tant qu'ils restent dans le plan",
    depuis: "Comptés au retrait, dans le gain du plan",
  },
  {
    revenu: "Assurance-vie, PEL, CEL, PEP, revenus fonciers, plus-values immobilières",
    avant: `${PS_MAINTENU} de prélèvements sociaux`,
    apres: `${PS_MAINTENU} de prélèvements sociaux`,
    depuis: "Pas de hausse",
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────
//
// Questions formulées comme on les pose à un assistant. `id` : ancre stable
// pour qui cite une réponse, indépendante du libellé.

const FAQ: { id: string; q: string; a: string }[] = [
  {
    id: "faq-prelevements-sociaux-pea",
    q: "Quel est le taux des prélèvements sociaux sur un PEA en 2026\u00a0?",
    a:
      `${PS} sur le gain retiré d'un PEA depuis le 1er\u00a0janvier 2026, soit ${HAUSSE}\u00a0point de plus qu'avant (${PS_AVANT}). ` +
      `Après 5\u00a0ans, rien d'autre n'est dû\u00a0: le gain est exonéré d'impôt sur le revenu. ` +
      `Avant 5\u00a0ans, s'y ajoutent ${IR} d'impôt sur le revenu, soit ${PFU} au total. ` +
      `Un PEA ouvert avant le 1er\u00a0janvier 2018 garde, sur la part du gain acquise avant cette date, ` +
      `les taux en vigueur à l'époque où ce gain a été acquis (taux dits «\u00a0historiques\u00a0»).`,
  },
  {
    id: "faq-pfu-2026",
    q: "PFU 2026\u00a0: quel taux sur les plus-values\u00a0?",
    a:
      `${PFU}\u00a0: ${IR} d'impôt sur le revenu et ${PS} de prélèvements sociaux. Avant, il était de ${PFU_AVANT}. ` +
      `Il s'applique aux plus-values de vente d'un compte-titres réalisées à partir de 2025, déclarées à partir de 2026, ` +
      `et aux dividendes perçus depuis le 1er\u00a0janvier 2026. ` +
      `Des dividendes de 2025 restent à ${PFU_AVANT} si les prélèvements sociaux ont été retenus au versement, ce qui est le cas le plus courant. ` +
      `Sinon, ils se déclarent et supportent aussi ${PFU}. ` +
      `Sur option globale, le barème progressif de l'impôt sur le revenu peut remplacer les ${IR}.`,
  },
  {
    id: "faq-assurance-vie",
    q: `L'assurance-vie passe-t-elle aussi à ${PS} de prélèvements sociaux\u00a0?`,
    a:
      `Non. Les produits de l'assurance-vie et des contrats de capitalisation gardent ${PS_MAINTENU} de prélèvements sociaux, ` +
      `comme les intérêts des PEL et des CEL, les revenus fonciers, les plus-values immobilières et les produits du PEP. ` +
      `Le PEA, lui, n'est pas dans cette liste\u00a0: ses gains passent à ${PS}.`,
  },
  {
    id: "faq-plus-value-2025",
    q: `Une plus-value réalisée en 2025 sur un CTO est-elle imposée à ${PFU_AVANT} ou à ${PFU}\u00a0?`,
    a:
      `À ${PFU}. Pour les plus-values de vente, la hausse s'applique dès les revenus de 2025, déclarés en 2026\u00a0: ` +
      `${IR} d'impôt sur le revenu et ${PS} de prélèvements sociaux. ` +
      `Pour les dividendes, elle s'applique à ceux perçus depuis le 1er\u00a0janvier 2026, ` +
      `et à ceux de 2025 qui n'ont pas supporté les prélèvements sociaux au versement.`,
  },
  {
    id: "faq-pea-ou-cto-2026",
    q: "Le PEA reste-t-il moins imposé que le CTO en 2026\u00a0?",
    a:
      `Après 5\u00a0ans, oui\u00a0: ${PS} sur le gain d'un PEA, contre ${PFU} sur une plus-value de CTO. ` +
      (ECART_INCHANGE
        ? `L'écart reste de ${ECART_POINTS}\u00a0points, comme avant la hausse, puisque les deux taux ont pris ${HAUSSE}\u00a0point. `
        : `L'écart est de ${ECART_POINTS}\u00a0points. `) +
      `Sur ${eur(PREMIER.gain)} de plus-value, cela fait ${eur(ecartApres(PREMIER))} d'impôt en moins dans le PEA. ` +
      `Avant 5\u00a0ans, le taux est le même dans les deux enveloppes\u00a0: ${PFU}.`,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

const lien = "text-primary-700 font-medium hover:underline";

export default function FiscalitePeaCto2026Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: "/" },
          { name: "Fiscalité PEA et CTO 2026" },
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Fiscalité PEA et CTO 2026</span>
      </nav>

      {/* La réponse d'abord : taux, hausse, exonération du PEA et ce qui ne
          change pas, dans les cent premiers mots. */}
      <EducationalHeader
        icon={Percent}
        eyebrow={`Vérifié le ${DATE_VERIF}`}
        title={H1}
        subtitle={
          `En ${ANNEE}, les gains d'un plan d'épargne en actions (PEA) et d'un compte-titres ordinaire (CTO) supportent ` +
          `${PS} de prélèvements sociaux, soit ${HAUSSE}\u00a0point de plus qu'avant (${PS_AVANT}). ` +
          `Sur un CTO, le prélèvement forfaitaire unique (PFU) passe ainsi à ${PFU}\u00a0: ${IR} d'impôt sur le revenu ` +
          `et ${PS} de prélèvements sociaux. Un PEA de plus de 5\u00a0ans reste exonéré d'impôt sur le revenu\u00a0: au retrait, ` +
          `seuls les ${PS} de prélèvements sociaux sont dus. L'assurance-vie, le PEL, le CEL et les revenus fonciers ` +
          `gardent ${PS_MAINTENU} de prélèvements sociaux.`
        }
      />

      <p className="text-sm text-gray-500 leading-relaxed -mt-4 mb-6">
        Hausse votée par la loi de financement de la sécurité sociale pour 2026
        (loi n°&nbsp;2025-1403 du 30&nbsp;décembre 2025). Taux et dates vérifiés
        le {DATE_VERIF} sur Légifrance, service-public.gouv.fr et
        impots.gouv.fr&nbsp;:{" "}
        <a href="#sources-heading" className="underline underline-offset-2 hover:text-gray-700">
          sources en fin de page
        </a>
        .
      </p>

      <ArticleByline
        publishedAt={PUBLIEE_LE}
        updatedAt={PUBLIEE_LE}
        readingMinutes={6}
        url={URL_PAGE}
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* ── 1. Depuis quand ──────────────────────────────────────────────── */}
      {/* FISC-PS-04 (dates, LFSS 2026 art. 12, II), FISC-CTO-01 et 05,
          FISC-DIV-02 et 03 (dividendes : prélèvements retenus au versement
          ou non, brochure IR 2026 p. 124 et 132, BOSS Q4), FISC-PS-05 (date
          du retrait, taux historiques, FAQ impots.gouv.fr du 17/07/2026). */}
      <section className="mb-14">
        <h2 id="depuis-quand" className="text-2xl font-bold text-gray-900 mb-4">
          Depuis quand&nbsp;: la date dépend du type de revenu
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            La hausse ne s&apos;applique pas à la même date pour tous les
            revenus. Tout dépend de la façon dont ils sont imposés.
          </p>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong className="text-gray-900">Plus-values de vente sur un CTO</strong>&nbsp;:
              {" "}{PS} dès les plus-values réalisées en 2025, déclarées au
              printemps 2026. Une plus-value de 2025 paie donc un PFU de {PFU},
              pas de {PFU_AVANT}.
            </li>
            <li>
              <strong className="text-gray-900">Dividendes versés sur un CTO</strong>&nbsp;:
              {" "}{PS} pour ceux perçus depuis le 1er&nbsp;janvier 2026.
              Pour ceux de 2025, tout dépend du moment où les prélèvements
              sociaux ont été payés. S&apos;ils ont été retenus au versement,
              ce qui est le cas le plus courant, ils restent à {PS_AVANT}.
              Sinon, ils se déclarent et supportent {PS} sur l&apos;avis
              d&apos;imposition, comme les plus-values.
            </li>
            <li>
              <strong className="text-gray-900">Gains d&apos;un PEA</strong>&nbsp;:
              {" "}{PS} pour les retraits faits depuis le 1er&nbsp;janvier 2026.
              Le taux est celui en vigueur à la date du retrait.
            </li>
          </ul>
          <p>
            Pourquoi deux dates&nbsp;? Sur une plus-value de CTO, rien
            n&apos;est prélevé à la source&nbsp;: elle se déclare au printemps
            de l&apos;année suivante, et l&apos;impôt se paie sur l&apos;avis
            d&apos;imposition. Pour les revenus imposés ainsi, la loi applique
            la hausse dès l&apos;imposition des revenus de 2025. Sur les gains
            du PEA, et le plus souvent sur les dividendes, les prélèvements
            sociaux sont retenus directement par l&apos;établissement qui les
            verse&nbsp;: la hausse vaut pour ceux versés depuis le
            1er&nbsp;janvier 2026.
          </p>
          <p>
            <strong className="text-gray-900">Un PEA ouvert avant 2018 fait exception.</strong>{" "}
            Il garde les taux dits «&nbsp;historiques&nbsp;», ceux en vigueur
            au moment où le gain a été acquis, sur la
            part du gain acquise avant le 1er&nbsp;janvier 2018. S&apos;il avait
            moins de 5&nbsp;ans à cette date, il les garde aussi pendant ses
            5&nbsp;premières années. Hors de ces cas, la foire aux questions
            d&apos;impots.gouv.fr applique {PS} au gain d&apos;un retrait fait
            en 2026, sans distinguer la part acquise de 2018 à 2025.
          </p>
        </div>
      </section>

      {/* ── 2. Ce qui ne change pas ──────────────────────────────────────── */}
      {/* FISC-PS-03 : le IV rétabli de l'art. L. 136-8 CSS s'arrête au 4° du
          II de L. 136-7 ; le gain de PEA est au 5°. FISC-CTO-01 : 12,8 %
          non modifié. */}
      <section className="mb-14">
        <h2 id="ce-qui-ne-change-pas" className="text-2xl font-bold text-gray-900 mb-4">
          Ce qui ne change pas&nbsp;: l&apos;assurance-vie, le PEL et le CEL gardent {PS_MAINTENU} de prélèvements sociaux
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            La hausse n&apos;est pas générale. La même loi maintient
            l&apos;ancien taux, {PS_MAINTENU} de prélèvements sociaux, pour&nbsp;:
          </p>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>
              les produits de l&apos;assurance-vie et des contrats de
              capitalisation, un placement voisin de l&apos;assurance-vie&nbsp;;
            </li>
            <li>les intérêts et primes des plans et comptes d&apos;épargne-logement (PEL et CEL)&nbsp;;</li>
            <li>les revenus fonciers&nbsp;;</li>
            <li>les plus-values immobilières&nbsp;;</li>
            <li>les produits du plan d&apos;épargne populaire (PEP).</li>
          </ul>
          <p>
            Le PEA n&apos;est pas dans cette liste&nbsp;: ses gains passent bien
            à {PS}, y compris après 5&nbsp;ans. Des sites affirment le contraire
            pour un PEA de plus de 5&nbsp;ans&nbsp;: c&apos;est contredit par le
            texte de la loi, par impots.gouv.fr et par le Bulletin officiel de
            la sécurité sociale. La fiche de service-public.gouv.fr sur les
            prélèvements sociaux ne range pas non plus le PEA parmi les
            placements maintenus à {PS_MAINTENU}.
          </p>
          <p>
            Ne change pas non plus&nbsp;: la part d&apos;impôt sur le revenu du
            PFU, {IR}. Toute la hausse du PFU, de {PFU_AVANT} à {PFU}, vient des
            prélèvements sociaux.
          </p>
        </div>
      </section>

      {/* ── 3. Tableau avant / 2026 ──────────────────────────────────────── */}
      <section className="mb-14">
        <h2 id="avant-2026" className="text-2xl font-bold text-gray-900 mb-4">
          Avant et en 2026&nbsp;: le tableau par enveloppe
        </h2>
        <p className="text-gray-600 leading-relaxed mb-5">
          Le taux appliqué au gain, selon l&apos;enveloppe et le type de revenu,
          et la date à partir de laquelle le taux de 2026 s&apos;applique.
        </p>
        <TableauAvantApres />
        <p className="text-xs text-gray-500 leading-relaxed mt-3">
          PFU&nbsp;: prélèvement forfaitaire unique, soit {IR} d&apos;impôt sur
          le revenu plus les prélèvements sociaux. Sur option, le barème
          progressif de l&apos;impôt sur le revenu, dont le taux dépend des
          revenus du foyer, peut remplacer les {IR} (voir les pièges plus bas).
          Un PEA ouvert avant 2018 garde en partie les taux historiques, ceux
          en vigueur quand le gain a été acquis (voir plus haut).
        </p>
      </section>

      {/* ── 4. Exemple chiffré ───────────────────────────────────────────── */}
      {/* Montants calculés par computeFiscalComparison (fiscal/pea-cto.ts),
          aux taux d'avant la hausse et à ceux de 2026 : aucun n'est écrit à
          la main. */}
      <section className="mb-14">
        <h2 id="exemple" className="text-2xl font-bold text-gray-900 mb-4">
          Exemple chiffré&nbsp;: ce que la hausse change sur une plus-value
        </h2>
        <p className="text-gray-600 leading-relaxed mb-5">
          L&apos;impôt dû sur une même plus-value, aux taux d&apos;avant la
          hausse ({PS_AVANT} et {PFU_AVANT}) et à ceux de 2026. PEA de plus de
          5&nbsp;ans&nbsp;: prélèvements sociaux seuls.
          CTO&nbsp;: PFU, sans l&apos;option pour le barème. Montants calculés
          par le moteur du calculateur du site, sans frais.
        </p>
        <TableauExemple />
        {MEME_HAUSSE && (
          <p className="text-gray-600 leading-relaxed mt-5">
            Dans les deux enveloppes, la hausse coûte {HAUSSE}&nbsp;% de la
            plus-value&nbsp;: {eur(hausseDe(PREMIER.pea))} sur {eur(PREMIER.gain)}.
            {ECART_INCHANGE && (
              <>
                {" "}L&apos;écart entre le PEA et le CTO, lui, ne bouge
                pas&nbsp;: {ECART_POINTS}&nbsp;points, soit{" "}
                {eur(ecartApres(PREMIER))} sur {eur(PREMIER.gain)}, avant comme
                en 2026.
              </>
            )}
          </p>
        )}
        <p className="text-gray-600 leading-relaxed mt-4">
          Pour votre propre cas, avec vos versements, votre durée et les frais
          de votre ETF, le{" "}
          <Link href="/calculateur-fiscal-pea-cto" className={lien}>
            calculateur fiscal PEA ou CTO
          </Link>
          {" "}fait le même calcul.
        </p>
      </section>

      {/* ── 5. Les pièges ────────────────────────────────────────────────── */}
      {/* FISC-CTO-02 (option globale, case 2OP, tranches 11 % et 30 % selon
          service-public, renonciation possible à partir des revenus 2026,
          case pré-cochée), FISC-DIV-02 (abattement de 40 %), FISC-CTO-03
          (6,8 points de CSG déductible) et FISC-PS-06 (BOSS Q5 : hausse non
          déductible), FISC-PEA-05 (premier versement), FISC-PEA-10 et 06
          (retrait avant 5 ans, exceptions ; L. 221-32 relu le 30/09/2026 :
          quatre dérogations, d'où « notamment trois cas »). */}
      <section className="mb-14">
        <h2 id="pieges" className="text-2xl font-bold text-gray-900 mb-6">
          Trois pièges à connaître
        </h2>

        <h3 className="text-lg font-bold text-gray-900 mb-3">
          1. L&apos;option pour le barème vaut pour toute l&apos;année
        </h3>
        <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
          <p>
            Sur un CTO, le PFU s&apos;applique par défaut. Il est possible de
            choisir à la place le barème progressif de l&apos;impôt sur le
            revenu, dont le taux dépend des revenus du foyer. S&apos;y ajoutent
            toujours les {PS} de prélèvements sociaux. Cette option est
            globale&nbsp;: elle vaut pour tous les
            revenus de capitaux mobiliers (dividendes, intérêts) et toutes les
            plus-values de l&apos;année, pas titre par titre. Elle se coche
            case 2OP de la déclaration de revenus.
          </p>
          <p>
            Selon service-public.gouv.fr, elle est plus favorable pour un foyer
            non imposable ou dans la tranche à 11&nbsp;% du barème, et
            défavorable à partir de la tranche à 30&nbsp;%. La tranche est le
            taux qui s&apos;applique à la dernière part du revenu du foyer. Avec
            l&apos;option, les dividendes bénéficient d&apos;un abattement de
            40&nbsp;%&nbsp;: l&apos;impôt sur le revenu n&apos;est calculé que
            sur le reste de leur montant.
          </p>
          <p>
            Avec l&apos;option, une part des prélèvements sociaux est aussi
            déductible du revenu imposable de l&apos;année où elle est
            payée&nbsp;: 6,8&nbsp;points, au titre de la CSG (contribution
            sociale généralisée, l&apos;une des composantes des prélèvements
            sociaux). Selon le Bulletin officiel de la sécurité sociale, la
            hausse de {HAUSSE}&nbsp;point de 2026 ne change pas ce
            montant&nbsp;: elle n&apos;est pas déductible. Au PFU, aucune part
            n&apos;est déductible.
          </p>
          <p>
            Si la case 2OP était cochée l&apos;année précédente, elle est
            pré-cochée&nbsp;: il faut la décocher pour revenir au PFU.
            Nouveauté&nbsp;: pour les revenus de 2026, déclarés en 2027, et les
            suivants, il est possible de renoncer à l&apos;option après coup,
            si elle s&apos;avère défavorable. Cela se fait dans le délai pour
            contester son impôt (le délai de réclamation) ou lors d&apos;un
            contrôle.
          </p>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-3">
          2. Les 5&nbsp;ans du PEA partent du premier versement
        </h3>
        <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
          <p>
            Le délai de 5&nbsp;ans court à partir de la date d&apos;ouverture du
            plan, et cette date est celle du premier versement, pas celle de la
            signature du contrat. Un plan signé sans versement ne fait donc pas
            courir le délai. D&apos;où l&apos;expression «&nbsp;prendre
            date&nbsp;»&nbsp;: un premier versement, même petit, fait partir le
            compteur. La loi ne fixe pas de versement minimum&nbsp;; un
            éventuel montant minimal relève du courtier.
          </p>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-3">
          3. Un retrait avant 5&nbsp;ans est en principe imposé comme sur un CTO
        </h3>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Avant 5&nbsp;ans, un retrait entraîne en principe la clôture du PEA.
            Le gain net réalisé depuis l&apos;ouverture est alors imposé à {PFU}{" "}
            pour un retrait fait en 2026&nbsp;: {IR} d&apos;impôt sur le revenu
            (ou le barème progressif, sur option) et {PS} de prélèvements
            sociaux. C&apos;est le même taux que sur un CTO&nbsp;:
            l&apos;exonération d&apos;impôt sur le revenu ne vient, en
            principe, qu&apos;après 5&nbsp;ans.
          </p>
          <p>
            Deux cas échappent à l&apos;impôt sur le revenu, sous conditions,
            même avant 5&nbsp;ans. Le premier est un retrait affecté à la
            création ou à la reprise d&apos;une entreprise&nbsp;: seuls les
            prélèvements sociaux sont dus sur le gain. Le second est le décès
            du titulaire.
          </p>
          <p>
            La loi prévoit notamment trois cas de retrait anticipé sans
            clôture&nbsp;: la création ou la reprise d&apos;une entreprise&nbsp;;
            le licenciement, l&apos;invalidité (2e ou 3e catégorie) ou la mise à
            la retraite anticipée du titulaire, de son conjoint ou de son
            partenaire de Pacs&nbsp;; le retrait des titres d&apos;une société en
            liquidation judiciaire. Le détail est dans notre{" "}
            <Link
              href="/pea-ou-cto#que-se-passe-t-il-si-je-retire-de-l-argent-avant-5-ans-sur-un-pea"
              className={lien}
            >
              guide PEA ou CTO
            </Link>
            .
          </p>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mt-8">
          Cette page décrit les règles fiscales, sans tenir compte de votre
          situation&nbsp;: ce n&apos;est pas un conseil en investissement
          personnalisé.
        </p>
      </section>

      {/* Renvoi vers le guide, en fin d'article et avant la FAQ, comme sur
          /etf-eligibles-pea. Accroche descriptive, sur le modèle de
          /simulateur : elle dit ce qu'un taux ne tranche pas, sans consigne
          de comportement (le site n'est pas conseiller en investissements
          financiers). */}
      <RenvoiProduit
        produit="guide-demarrer-dca"
        contexte={
          "Un taux d'imposition ne dit ni quelle enveloppe utiliser, ni chez quel courtier, ni à quel rythme verser\u00a0: " +
          "ce sont d'autres choix."
        }
        className="mb-14"
      />

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {/* <details>/<summary> comme les autres guides : chaque question est un
          passage de la recherche interne, avec son ancre. */}
      <section className="mb-14">
        <h2 id="faq" className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
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
      {/* Adresses exactes des faits FISC-*, consultés le 28/09/2026, et des
          compléments lus le 30/09/2026 (FISC-PS-06 : BOSS ; FISC-DIV-03 ;
          notes de FISC-PEA-06 et 10). Intitulé et note du BOSS neutres : ni
          nom de contribution, ni « 10,6 % » (décision du 29/09/2026). */}
      <SourcesReferences
        intro="Taux, dates et règles de cette page viennent des textes et des fiches officielles ci-dessous. Chaque source indique sa date de consultation."
        sources={[
          {
            label: "Loi n°\u00a02025-1403 du 30\u00a0décembre 2025 de financement de la sécurité sociale pour 2026, article\u00a012",
            url: "https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000053226452",
            publisher: "Légifrance",
            note: `Hausse des prélèvements sociaux sur les revenus du patrimoine et de placement, dates d'application (II), placements maintenus à l'ancien taux (IV de l'article L.\u00a0136-8 du code de la sécurité sociale). Consultée le ${DATE_VERIF}.`,
          },
          {
            label: "Code de la sécurité sociale — article L.\u00a0136-7",
            url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006073189/LEGISCTA000006173129/",
            publisher: "Légifrance",
            note: `Le 5° du II vise le gain net du PEA, absent de la liste des placements maintenus à ${PS_MAINTENU}. Consulté le ${DATE_VERIF}.`,
          },
          {
            label: "Prélèvements sociaux sur les revenus du patrimoine et de placements",
            url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2329",
            publisher: "service-public.gouv.fr",
            note: `${PS} dans le cas général pour les revenus de placement de 2026, ${PS_AVANT} pour ceux de 2025\u00a0; ${PS_MAINTENU} pour l'assurance-vie, les PEL et CEL, le PEP, les revenus fonciers et les plus-values immobilières. Le PEA n'est pas dans cette liste. Fiche vérifiée le 30\u00a0juin 2026, consultée le ${DATE_VERIF}, relue le ${DATE_COMPLEMENTS}.`,
          },
          {
            label: "Plus-values sur valeurs mobilières",
            url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F21618",
            publisher: "service-public.gouv.fr",
            note: `PFU de ${PFU} (${IR} d'impôt sur le revenu et ${PS} de prélèvements sociaux) sur les plus-values d'un CTO. Fiche vérifiée le 15\u00a0avril 2026, consultée le ${DATE_VERIF}.`,
          },
          {
            label: "Revenus d'épargne et de placement",
            url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2613",
            publisher: "service-public.gouv.fr",
            note: `Option pour le barème progressif\u00a0: plus favorable si le foyer est non imposable ou dans la tranche à 11\u00a0%, défavorable à partir de la tranche à 30\u00a0%. Fiche vérifiée le 15\u00a0avril 2026, consultée le ${DATE_VERIF}.`,
          },
          {
            label: "Plan d'épargne en actions (PEA)",
            url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2385",
            publisher: "service-public.gouv.fr",
            note: `«\u00a0La date d'ouverture du plan est celle du 1er versement.\u00a0» Pas de versement minimum légal\u00a0; retraits avant 5\u00a0ans. Fiche vérifiée le 22\u00a0mai 2026, consultée le ${DATE_VERIF}.`,
          },
          {
            label: "J'ai un plan d'épargne en actions (PEA), les retraits sont-ils imposables\u00a0?",
            url: "https://www.impots.gouv.fr/particulier/questions/jai-un-plan-depargne-en-actions-pea-les-retraits-sont-ils-imposables",
            publisher: "impots.gouv.fr",
            note: `Après 5\u00a0ans, ${PS} de prélèvements sociaux sur le gain\u00a0; avant 5\u00a0ans, PFU de ${PFU}, sauf retraits anticipés non soumis à l'impôt sur le revenu (décès, création ou reprise d'entreprise, sous conditions). Page modifiée le 17\u00a0juillet 2026, consultée le ${DATE_VERIF}, relue le ${DATE_COMPLEMENTS}.`,
          },
          {
            label: "Bulletin officiel de la sécurité sociale — CSG sur les revenus du capital, questions-réponses",
            url: "https://boss.gouv.fr/portail/accueil/regles-dassujettissement/contribution-sociale-generalisee.html",
            publisher: "boss.gouv.fr",
            note: `Questions 4 à 6\u00a0: hausse appliquée aux sommes retirées d'un PEA depuis le 1er\u00a0janvier 2026, et dès l'imposition des revenus de 2025 pour les revenus déclarés (revenus du patrimoine)\u00a0; hausse non déductible, part déductible inchangée à 6,8\u00a0points\u00a0; ${PS_AVANT} de prélèvements sociaux avant la hausse, PFU porté à ${PFU}. Page mise à jour le 26\u00a0mai 2026, consultée le ${DATE_COMPLEMENTS}.`,
          },
          {
            label: "Brochure pratique de l'impôt sur le revenu 2026 — Plus-values (p.\u00a0137 à 156)",
            url: "https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/09-plus_values_137a156.pdf",
            publisher: "impots.gouv.fr",
            note: `Plus-values de 2025 soumises à ${IR}, auquel s'ajoutent les prélèvements sociaux de ${PS}\u00a0; option pour le barème, case 2OP. Consultée le ${DATE_VERIF}.`,
          },
          {
            label: "Brochure pratique de l'impôt sur le revenu 2026 — Revenus de capitaux mobiliers (p.\u00a0121 à 136)",
            url: "https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/08-RCM_121a136.pdf",
            publisher: "impots.gouv.fr",
            note: `Revenus de capitaux mobiliers d'un CTO\u00a0: ${IR} d'impôt sur le revenu, plus ${PS} de prélèvements sociaux pour ceux qui ne les ont pas supportés au versement (p.\u00a0124)\u00a0; la plupart les supportent au versement (p.\u00a0132)\u00a0; abattement de 40\u00a0% sur les dividendes en cas d'option pour le barème. Dividendes d'un PEA\u00a0: pas de prélèvement forfaitaire, pas de déclaration. Consultée le ${DATE_VERIF}, relue le ${DATE_COMPLEMENTS}.`,
          },
          {
            label: "Code général des impôts — article 200\u00a0A",
            url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053546896",
            publisher: "Légifrance",
            note: `Taux forfaitaire de ${IR}, option globale pour le barème progressif (version en vigueur depuis le 21\u00a0février 2026). Consulté le ${DATE_VERIF}.`,
          },
          {
            label: "Code général des impôts — article 154\u00a0quinquies",
            url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000047288608",
            publisher: "Légifrance",
            note: `CSG déductible du revenu imposable à hauteur de 6,8\u00a0points en cas d'option pour le barème. Consulté le ${DATE_VERIF}.`,
          },
          {
            label: "Code monétaire et financier — article L.\u00a0221-32",
            url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038612518",
            publisher: "Légifrance",
            note: `Version en vigueur depuis le 21\u00a0février 2026\u00a0: retrait avant 5\u00a0ans et clôture du plan\u00a0; retraits anticipés sans clôture (II et IV). Consulté le ${DATE_VERIF}, relu le ${DATE_COMPLEMENTS}.`,
          },
        ]}
      />

      {/* ── JSON-LD ──────────────────────────────────────────────────────── */}
      {/* FAQPage seul — l'Article est émis par ArticleByline. */}
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
    </div>
  );
}

// ─── Sous-composants (propres à la page) ─────────────────────────────────────

/**
 * Un vrai <table> sur écran large (copiable, lisible par un robot), replié en
 * cartes sous 640 px : une ligne par revenu, chaque cellule avec son intitulé.
 * Pas de défilement horizontal à 375 px. Même principe que TableauFonds sur
 * /etf-eligibles-pea.
 */
function TableauAvantApres() {
  const th = "px-3 py-3 text-left font-semibold text-gray-500 border-b border-gray-100";
  const td = "flex gap-3 px-4 py-1 sm:table-cell sm:px-3 sm:py-3 sm:align-top";
  const intitule = "w-20 shrink-0 text-gray-500 sm:hidden";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <caption className="sr-only">
          Taux appliqué au gain avant la hausse et en {ANNEE}, par enveloppe et type de revenu
        </caption>
        <thead className="hidden sm:table-header-group bg-gray-50">
          <tr>
            <th scope="col" className={`${th} pl-4`}>Revenu</th>
            <th scope="col" className={th}>Avant</th>
            <th scope="col" className={th}>En {ANNEE}</th>
            <th scope="col" className={th}>Quand le taux de {ANNEE} s&apos;applique</th>
          </tr>
        </thead>
        <tbody className="block sm:table-row-group">
          {LIGNES.map((l) => (
            <tr
              key={l.revenu}
              className="block py-3 border-b border-gray-100 last:border-b-0 sm:table-row sm:py-0"
            >
              <th
                scope="row"
                className="block px-4 pb-2 text-left font-semibold text-gray-900 sm:table-cell sm:py-3 sm:align-top"
              >
                {l.revenu}
              </th>
              <td className={td}>
                <span className={intitule}>Avant</span>
                <span className="text-gray-600">{l.avant}</span>
              </td>
              <td className={td}>
                <span className={intitule}>En {ANNEE}</span>
                <span className="font-semibold text-gray-900">{l.apres}</span>
              </td>
              <td className={td}>
                <span className={intitule}>Quand</span>
                <span className="text-gray-600">{l.depuis}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Impôt sur chaque plus-value type, taux d'avant la hausse et taux de 2026. Quatre
 * colonnes de montants courts : le tableau tient à 375 px.
 */
function TableauExemple() {
  const th = "px-2.5 sm:px-4 py-3 font-semibold text-gray-600";
  const td = "text-right px-2.5 sm:px-4 py-3 tabular-nums whitespace-nowrap";

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
      <table className="w-full text-xs sm:text-sm">
        <caption className="sr-only">
          Impôt dû sur une plus-value, aux taux d&apos;avant la hausse et aux taux de {ANNEE}
        </caption>
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className={`${th} text-left`}>Enveloppe</th>
            <th scope="col" className={`${th} text-right`}>Avant la hausse</th>
            <th scope="col" className={`${th} text-right`}>Taux {ANNEE}</th>
            <th scope="col" className={`${th} text-right`}>Hausse</th>
          </tr>
        </thead>
        {EXEMPLES.map((e) => (
          <tbody key={e.gain} className="divide-y divide-slate-100 border-t border-slate-200/70">
            <tr className="bg-slate-50/60">
              <th scope="rowgroup" colSpan={4} className="text-left px-2.5 sm:px-4 py-2 font-semibold text-gray-900">
                Plus-value de {eur(e.gain)}
              </th>
            </tr>
            <tr>
              <th scope="row" className="text-left px-2.5 sm:px-4 py-3 font-medium text-gray-700">
                PEA de plus de 5&nbsp;ans ({PS_AVANT} puis {PS})
              </th>
              <td className={`${td} text-gray-700`}>{eur(e.pea.avant)}</td>
              <td className={`${td} text-gray-900 font-semibold`}>{eur(e.pea.apres)}</td>
              <td className={`${td} text-gray-700`}>+{eur(hausseDe(e.pea))}</td>
            </tr>
            <tr>
              <th scope="row" className="text-left px-2.5 sm:px-4 py-3 font-medium text-gray-700">
                CTO, PFU ({PFU_AVANT} puis {PFU})
              </th>
              <td className={`${td} text-gray-700`}>{eur(e.cto.avant)}</td>
              <td className={`${td} text-gray-900 font-semibold`}>{eur(e.cto.apres)}</td>
              <td className={`${td} text-gray-700`}>+{eur(hausseDe(e.cto))}</td>
            </tr>
          </tbody>
        ))}
      </table>
    </div>
  );
}
