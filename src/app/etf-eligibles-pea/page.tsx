import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { ListChecks } from "lucide-react";
import { EducationalHeader } from "@/components/ui/EducationalHeader";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import { JsonLd } from "@/components/ui/JsonLd";
import { RenvoiProduit } from "@/components/products/RenvoiProduit";
import { formatTer } from "@/lib/utils";
import { ETF_COMPARISON_LIST } from "@/lib/etf-comparisons";
import {
  CORRESPONDANCES_PEA,
  DATE_VERIFICATION_PEA,
  ETF_NON_ELIGIBLES,
  ETF_PEA_VERIFIES,
  FAMILLES,
  MAJ_LISTE_PEA,
  URL_LISTE_PEA,
  ancreFonds,
  ancreHorsPea,
  dateEnToutesLettres,
  type EtfEligiblePea,
  type EtfNonEligible,
  type FamilleIndice,
  type RaisonHorsPea,
} from "@/lib/etf-pea-verifies";

// ─── Pourquoi cette page (29/09/2026) ────────────────────────────────────────
//
// Aucune page du site n'était consacrée à la liste des ETF éligibles au PEA,
// et c'est précisément ce qui se périme partout : jusqu'au 28/09/2026, notre
// propre catalogue donnait 500, ANX, AEEM et JPNK pour éligibles. Une liste
// qu'on peut citer doit porter sa date, sa méthode et son périmètre — ici,
// NOTRE sélection vérifiée, pas le marché entier.
//
// Tous les nombres de la page (fonds éligibles, non éligibles, exemples de la
// section « le P ne prouve rien ») sont CALCULÉS sur les données de
// etf-pea-verifies.ts. Aucun n'est écrit à la main : ajouter un fonds vérifié
// met la page à jour, titre et description compris.

const N_ELIGIBLES = ETF_PEA_VERIFIES.length;
const N_NON_ELIGIBLES = ETF_NON_ELIGIBLES.length;
/** « 28 septembre 2026 » */
const DATE_VERIF = dateEnToutesLettres(DATE_VERIFICATION_PEA);
/** « septembre 2026 » */
// 01/10/2026 : dateEnToutesLettres écrit désormais « 1er » le premier du mois.
const MOIS_VERIF = DATE_VERIF.replace(/^\d+(?:er)?\s/, "");

// Requête visée : « ETF éligibles PEA » / « liste ETF PEA ». Les pages voisines
// visent autre chose : /guide-5-etf-pea-premium une sélection courte,
// /etf-msci-world le choix d'un tracker, /pea-ou-cto l'enveloppe,
// /comparatif-etf les face-à-face, /meilleurs-etf-debutants le premier ETF.
const TITLE = `ETF éligibles au PEA\u00a0: la liste vérifiée (${MOIS_VERIF})`;
// « (ISIN, frais) » et pas « réplication » : pour la plupart des fonds, la
// réplication vient de justETF seul (note sous les tableaux). La description
// ne présente comme vérifié un par un que ce qui a été recoupé.
const DESCRIPTION =
  `${N_ELIGIBLES} ETF éligibles au PEA vérifiés un par un le ${DATE_VERIF} (ISIN, frais), ` +
  `et ${N_NON_ELIGIBLES} fonds qui ne le sont pas, dont 500, IWDA et VWCE.`;

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

/** ["A", "B", "C"] → « A, B et C ». */
function enumerer(mots: string[]): string {
  if (mots.length <= 1) return mots.join("");
  return `${mots.slice(0, -1).join(", ")} et ${mots[mots.length - 1]}`;
}

const symboles = (fonds: { displaySymbol: string }[]) => enumerer(fonds.map((f) => f.displaySymbol));

/** Accord du verbe avec un nombre calculé. */
const accord = (n: number, singulier: string, pluriel: string) => (n > 1 ? pluriel : singulier);

const frais = (f: { ter: number }) => formatTer(f.ter);

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

// ─── Données dérivées ────────────────────────────────────────────────────────

// Ordre alphabétique dans chaque groupe : un classement par frais se lirait
// comme une recommandation, et le site n'a pas le statut CIF.
const GROUPES = FAMILLES.map((famille) => ({
  ...famille,
  fonds: ETF_PEA_VERIFIES.filter((f) => f.famille === famille.id).sort((a, b) =>
    a.displaySymbol.localeCompare(b.displaySymbol, "fr"),
  ),
})).filter((g) => g.fonds.length > 0);

const parFamille = (id: FamilleIndice) => GROUPES.find((g) => g.id === id)?.fonds ?? [];

/** Guide d'indice existant, pour comparer les fonds d'un groupe. */
const GUIDE_INDICE: Partial<Record<FamilleIndice, { href: string; label: string }>> = {
  "msci-world": { href: "/etf-msci-world", label: "notre guide des ETF MSCI World" },
  sp500: { href: "/etf-sp500", label: "notre guide des ETF S&P 500" },
  "nasdaq-100": { href: "/etf-nasdaq", label: "notre guide des ETF Nasdaq 100" },
};

/** Les éligibles par ordre alphabétique, pour les énumérations et les sources. */
const ELIGIBLES_TRIES = [...ETF_PEA_VERIFIES].sort((a, b) => a.displaySymbol.localeCompare(b.displaySymbol, "fr"));

// Section « le P ne prouve rien » : exemples tirés des données, pas choisis.
const commenceParP = (f: { displaySymbol: string }) => f.displaySymbol.startsWith("P");
const ELIGIBLES_SANS_P = ELIGIBLES_TRIES.filter((f) => !commenceParP(f));
const AMUNDI_ELIGIBLES = ELIGIBLES_TRIES.filter((f) => f.name.startsWith("Amundi "));
const AMUNDI_AVEC_P = AMUNDI_ELIGIBLES.filter(commenceParP);
const AMUNDI_SANS_P = AMUNDI_ELIGIBLES.filter((f) => !commenceParP(f));
const ELIGIBLES_SANS_MOT_PEA = ELIGIBLES_TRIES.filter((f) => !/\bPEA\b/.test(f.name));
const SWAP_ELIGIBLES = ELIGIBLES_TRIES.filter((f) => /\bSwap\b/.test(f.name));
const SWAP_NON_ELIGIBLES = ETF_NON_ELIGIBLES.filter((f) => /\bSwap\b/.test(f.name));

const N_SYNTHETIQUES = ETF_PEA_VERIFIES.filter((f) => f.replicationMethod.startsWith("Synthétique")).length;
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
    "Réplication synthétique (swap), et pourtant non éligible\u00a0: le reporting mensuel d'Amundi du 31 août 2026, dans sa version pour professionnels, indique «\u00a0Enveloppe fiscale\u00a0: -\u00a0», sans aucune mention du PEA, là où celui de CW8 affiche «\u00a0Enveloppe fiscale\u00a0: Eligible au PEA\u00a0». La page du fonds chez Amundi indique «\u00a0Eligibilité au PEA\u00a0: Non\u00a0».",
  physique:
    "Réplication physique\u00a0: le fonds détient lui-même les actions de son indice, et ce ne sont pas, à plus de 75\u00a0%, des actions de sociétés de l'Union européenne ou de l'Espace économique européen, comme l'exige le PEA.",
  // Ce qui l'exclut du PEA, c'est d'être un fonds américain (fait
  // pea-regle-75 : SICAV, FCP ou OPCVM européen). L'absence de DIC dit
  // seulement qu'on ne peut pas l'acheter, même en compte-titres.
  "sans-dic":
    "Fonds américain\u00a0: la loi ne prévoit dans un PEA que des fonds français ou européens (SICAV, FCP, OPCVM européens), et celui-ci n'en est pas un. " +
    "Il n'a pas non plus de document d'informations clés (DIC)\u00a0: depuis le 1er janvier 2018, il ne peut plus être proposé aux particuliers de l'Espace économique européen, " +
    "et un courtier européen en refuse en principe l'achat, même en compte-titres.",
  "non-eligible": `Non éligible au PEA d'après les documents de l'émetteur, recoupés le ${DATE_VERIF}.`,
};

// ─── FAQ ─────────────────────────────────────────────────────────────────────
//
// Réponses calculées sur les mêmes données que le tableau : une FAQ écrite à
// la main contredirait la liste au premier fonds ajouté. `id` : ancre stable
// pour qui cite une réponse (#faq-japon), indépendante du libellé.

const MSCI_WORLD = parFamille("msci-world");
const SP500 = parFamille("sp500");
const SP500_MEME_INDICE = SP500.filter((f) => CORRESPONDANCES_PEA.sp500.symboles.includes(f.displaySymbol));
const SP500_AUTRES = SP500.filter((f) => !CORRESPONDANCES_PEA.sp500.symboles.includes(f.displaySymbol));
const SP500_HORS_PEA = ETF_NON_ELIGIBLES.filter((f) => f.correspondance === "sp500");
const JAPON = CORRESPONDANCES_PEA.japon.symboles;
/** « PSP5 (0,12 %), SPEA (0,10 %) et ESE (0,14 %) » */
const avecFrais = (fonds: { displaySymbol: string; ter: number }[]) =>
  enumerer(fonds.map((f) => `${f.displaySymbol} (${frais(f)})`));

const FAQ: { id: string; q: string; a: string }[] = [
  {
    id: "faq-combien",
    q: "Combien d'ETF sont éligibles au PEA\u00a0?",
    a:
      `Nous ne le savons pas pour le marché entier\u00a0: nous avons vérifié notre sélection, pas tous les ETF cotés. ` +
      `Au ${DATE_VERIF}, ${N_ELIGIBLES} ETF de cette sélection sont éligibles, répartis en ${GROUPES.length} groupes d'indices. ` +
      `D'autres existent\u00a0: PNAS, par exemple, est une ligne Nasdaq-100 éligible au PEA que nous n'avons pas vérifiée.`,
  },
  {
    id: "faq-msci-world",
    q: "Quels ETF MSCI World sont éligibles au PEA\u00a0?",
    a:
      `Nous en avons vérifié ${MSCI_WORLD.length} le ${DATE_VERIF}\u00a0: ${avecFrais(MSCI_WORLD)}. ` +
      `EWLD est la part distribuante du même fonds que CW8. ` +
      `IWDA (iShares Core MSCI World), qui suit le même indice en réplication physique, n'est pas éligible.`,
  },
  // « Quels ETF S&P 500… » et non « Peut-on mettre un S&P 500… » : c'est déjà
  // la question de /etf-sp500. Même forme que la question MSCI World.
  {
    id: "faq-sp500",
    q: "Quels ETF S&P 500 sont éligibles au PEA\u00a0?",
    a:
      `Nous en avons vérifié ${SP500.length} le ${DATE_VERIF}. ` +
      `${avecFrais(SP500_MEME_INDICE)} ${accord(SP500_MEME_INDICE.length, "suit", "suivent")} le S&P 500` +
      (SP500_AUTRES.length
        ? `, ${avecFrais(SP500_AUTRES)} une version de l'indice filtrée sur des critères ESG. `
        : ". ") +
      `En revanche, ${symboles(SP500_HORS_PEA)} ${accord(SP500_HORS_PEA.length, "n'est pas éligible", "ne sont pas éligibles")}.`,
  },
  {
    id: "faq-japon",
    q: "Existe-t-il un ETF Japon éligible au PEA\u00a0?",
    a: JAPON.length
      ? `Oui\u00a0: ${enumerer(JAPON)}, vérifié le ${DATE_VERIF}. JPNK (Amundi JPX-Nikkei 400), lui, n'est pas éligible.`
      : `Nous n'en avons vérifié aucun. JPNK (Amundi JPX-Nikkei 400) n'est pas éligible, alors que notre site le présentait comme tel jusqu'au ${DATE_VERIF}. ` +
        `Cela ne prouve pas qu'il n'en existe aucun\u00a0: nous ne l'avons pas établi.`,
  },
  {
    id: "faq-p",
    q: "Un ETF dont le mnémonique commence par P est-il éligible au PEA\u00a0?",
    a:
      `Le P n'est pas une règle. Sur les ${N_ELIGIBLES} ETF éligibles de notre liste, ${ELIGIBLES_SANS_P.length} ` +
      `${accord(ELIGIBLES_SANS_P.length, "ne commence", "ne commencent")} pas par P\u00a0: ${symboles(ELIGIBLES_SANS_P)}. ` +
      `Et rien ne permet de dire qu'un P suffise\u00a0: seul un document de l'émetteur, lu sur l'ISIN du fonds, établit l'éligibilité.`,
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
        eyebrow={`Vérifiée le ${DATE_VERIF}`}
        title={"ETF éligibles au PEA\u00a0: la liste vérifiée"}
        subtitle={
          `${N_ELIGIBLES} ETF éligibles au PEA, vérifiés un par un avec leur ISIN et leurs frais. ` +
          `Et ${N_NON_ELIGIBLES} fonds qui ne le sont pas, avec la raison pour chacun.`
        }
      />

      <ArticleByline
        publishedAt="2026-09-30"
        updatedAt={MAJ_LISTE_PEA}
        readingMinutes={8}
        url={URL_LISTE_PEA}
        headline={TITLE}
        description={DESCRIPTION}
      />

      {/* ── Périmètre et méthode ─────────────────────────────────────────── */}
      {/* En tête, pas en note de bas de page : c'est ce qui distingue cette
          liste d'une liste périmée, et ce qu'un site qui la cite doit pouvoir
          reprendre avec elle. */}
      <section
        aria-labelledby="perimetre"
        className="mb-12 rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6"
      >
        <h2 id="perimetre" className="text-lg font-bold text-gray-900 mb-3">
          Ce que cette liste est, et ce qu&apos;elle n&apos;est pas
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong className="text-gray-900">Notre sélection vérifiée, pas le marché entier.</strong>{" "}
            {N_ELIGIBLES} ETF éligibles au PEA et {N_NON_ELIGIBLES} fonds qui ne le
            sont pas, contrôlés un par un le {DATE_VERIF}. D&apos;autres ETF
            éligibles existent&nbsp;: s&apos;ils ne sont pas ici, c&apos;est que
            nous ne les avons pas vérifiés, pas qu&apos;ils seraient moins bons.
          </p>
          <p>
            <strong className="text-gray-900">La méthode.</strong> Pour chaque
            fonds, deux familles de sources indépendantes&nbsp;: l&apos;émetteur
            d&apos;abord (page du fonds, document d&apos;informations clés,
            reporting mensuel), puis justETF, Boursorama et Euronext. Le nom,
            l&apos;ISIN, les frais et l&apos;éligibilité ne sont retenus que là
            où les deux concordent. La réplication, que les documents recoupés
            ne donnent pas toujours, vient pour plusieurs fonds de justETF
            seul&nbsp;: nous le signalons sous les tableaux.
          </p>
          <p>
            <strong className="text-gray-900">Pourquoi cette page.</strong>{" "}
            Jusqu&apos;au {DATE_VERIF}, notre propre site présentait{" "}
            <Mnemoniques fonds={PRESENTES_ELIGIBLES_ICI} /> comme éligibles au
            PEA. Aucun ne l&apos;est. Une liste d&apos;ETF se périme sans
            prévenir&nbsp;: celle-ci porte sa date, et chaque ligne son ISIN,
            pour que vous puissiez la vérifier à votre tour.
          </p>
        </div>
      </section>

      {/* Accès direct aux groupes : utile sur mobile, où la liste est longue.
          Un <nav> : l'index de recherche l'ignore, ce ne sont que des liens. */}
      <nav aria-label="Aller à un indice" className="mb-10 flex flex-wrap gap-2">
        {GROUPES.map((g) => (
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
          La liste&nbsp;: {N_ELIGIBLES} ETF éligibles au PEA, par indice
        </h2>
        <p className="text-gray-600 leading-relaxed mb-8">
          Pour chaque fonds&nbsp;: son mnémonique (le code court sous lequel il
          est coté, cliquable quand nous avons une fiche), son nom exact, son
          ISIN (le code qui désigne sans ambiguïté une part précise du
          fonds&nbsp;: c&apos;est lui que vous saisissez chez le courtier), ses
          frais courants annuels (le TER, prélevé chaque jour sur l&apos;actif
          du fonds), sa réplication et ce qu&apos;il fait des dividendes. La
          réplication dit comment le fonds suit son indice&nbsp;: physique, il
          détient les actions de l&apos;indice&nbsp;; synthétique, il en reçoit
          la performance par un contrat d&apos;échange avec une banque, le
          swap, expliqué plus bas. Capitalisant, le fonds réinvestit les
          dividendes&nbsp;; distribuant, il vous les verse. Dans chaque groupe,
          les fonds sont rangés par ordre alphabétique, pas par préférence.
        </p>

        <div className="space-y-10">
          {GROUPES.map((g) => {
            const guide = GUIDE_INDICE[g.id];
            return (
              <div key={g.id}>
                <h3 id={g.id} className="text-lg font-bold text-gray-900 mb-1">
                  {g.titre}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">
                  {g.description}
                  {guide && (
                    <>
                      {" "}
                      {g.fonds.length > 1 ? "Pour les comparer" : "Pour le comparer aux autres ETF de cet indice"}
                      &nbsp;:{" "}
                      <Link href={guide.href} className="text-primary-700 font-medium hover:underline">
                        {guide.label}
                      </Link>
                      .
                    </>
                  )}
                </p>
                <TableauFonds fonds={g.fonds} titre={g.titre} />
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mt-6">
          La réplication n&apos;est pas dans tous les documents recoupés&nbsp;:
          pour la plupart de ces fonds, elle vient de justETF seul, ou du nom
          officiel quand il contient «&nbsp;Swap&nbsp;». L&apos;encours (la
          taille du fonds) n&apos;est pas affiché&nbsp;: nos deux familles de
          sources ne donnent pas les mêmes montants, et nous ne publions pas un
          chiffre que nous n&apos;avons pas pu trancher.
        </p>
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
          éligible. Chaque exemple est filtré dans les données : si la
          gamme change, les exemples suivent, et un exemple qui cesserait
          d'exister disparaîtrait au lieu de rester faux. */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Le P du mnémonique ne prouve rien, le nom non plus
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          {ELIGIBLES_SANS_P.length > 0 && (
            <p>
              Le P devant un mnémonique n&apos;est pas une règle. Sur les{" "}
              {N_ELIGIBLES} fonds éligibles de
              notre liste, {ELIGIBLES_SANS_P.length}{" "}
              {accord(ELIGIBLES_SANS_P.length, "ne commence", "ne commencent")} pas
              par P&nbsp;: <Mnemoniques fonds={ELIGIBLES_SANS_P} />.
              {AMUNDI_AVEC_P.length > 0 && AMUNDI_SANS_P.length > 0 && (
                <>
                  {" "}Chez Amundi même, {AMUNDI_AVEC_P.length} fonds éligibles
                  portent un P (<Mnemoniques fonds={AMUNDI_AVEC_P} />) et{" "}
                  {AMUNDI_SANS_P.length}{" "}
                  {accord(AMUNDI_SANS_P.length, "n'en porte", "n'en portent")} pas
                  (<Mnemoniques fonds={AMUNDI_SANS_P} />).
                </>
              )}
            </p>
          )}
          {ELIGIBLES_SANS_MOT_PEA.length > 0 && (
            <p>
              Le nom ne suffit pas davantage&nbsp;:{" "}
              {ELIGIBLES_SANS_MOT_PEA.length} fonds éligibles n&apos;ont pas le
              mot «&nbsp;PEA&nbsp;» dans leur nom (
              <Mnemoniques fonds={ELIGIBLES_SANS_MOT_PEA} />).
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
          )}
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
            {N_SYNTHETIQUES === N_ELIGIBLES
              ? `Les ${N_ELIGIBLES} fonds éligibles de notre liste sont tous synthétiques.`
              : `${N_SYNTHETIQUES} des ${N_ELIGIBLES} fonds éligibles de notre liste sont synthétiques.`}
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
      {/* Seulement ce que les faits établissent. Rien sur une mention PEA
          dans le DIC : la vérification du 28/09/2026 ne l'a pas établie. */}
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
            </>,
            <>
              <strong className="text-gray-900">Recoupez avec une source indépendante de l&apos;émetteur</strong>&nbsp;:
              justETF, Boursorama ou Euronext. C&apos;est notre méthode&nbsp;:
              l&apos;ISIN, les frais et l&apos;éligibilité n&apos;entrent dans
              cette liste que si les deux concordent.
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
              {DATE_VERIF}. Une liste sans date de vérification ne dit pas si
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
          "Savoir qu'un fonds entre dans un PEA ne dit pas par où commencer\u00a0: ouvrir le plan, choisir un courtier " +
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
      {/* Textes officiels, documents Amundi (fait swap-non-eligible, 30/09/2026)
          et fiche justETF de chaque fonds éligible (faits
          etf-pea-*, consultés le 28/09/2026). L'adresse justETF se construit
          sur l'ISIN : c'est celle que citent les faits, pour les treize. */}
      <SourcesReferences
        intro={`Chaque fonds a été vérifié le ${DATE_VERIF} sur les documents de son émetteur, puis recoupé sur justETF, Boursorama et Euronext. Ci-dessous, les textes officiels cités, les documents d'Amundi qui tranchent l'éligibilité de 500, ANX et AEEM, et la fiche justETF de chaque fonds éligible.`}
        sources={[
          {
            label: "Code monétaire et financier — article L221-31",
            url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051218125",
            publisher: "Légifrance",
            note: "Fonds éligibles au PEA\u00a0: plus de 75\u00a0% de l'actif en actions de sociétés de l'UE ou de l'EEE. Version en vigueur depuis le 16 février 2025, consultée le 28 septembre 2026.",
          },
          {
            label: "Plan d'épargne en actions (PEA)",
            url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2385",
            publisher: "service-public.gouv.fr",
            note: "Titres et fonds que l'on peut placer dans un PEA. Fiche vérifiée le 22 mai 2026, consultée le 28 septembre 2026.",
          },
          {
            label: "Les ETF\u00a0: caractéristiques, état des lieux et analyse des risques (février 2017)",
            url: "https://www.amf-france.org/sites/institutionnel/files/contenu_simple/lettre_ou_cahier/risques_tendances/Les%20ETF%20%20caracteristiques,%20etat%20des%20lieux%20et%20analyse%20des%20risques%20-%20Le%20cas%20du%20marche%20francais.pdf",
            publisher: "Autorité des marchés financiers (AMF)",
            note: "Réplication physique et synthétique, contrat d'échange de performance. Consulté le 28 septembre 2026.",
          },
          {
            label: "MSCI World Index — fiche de l'indice (données au 31 août 2026)",
            url: "https://www.msci.com/documents/10199/255599/msci-world-index.pdf",
            publisher: "MSCI Inc.",
            note: "Poids des États-Unis\u00a0: 72,14\u00a0% au 31 août 2026. Consultée le 28 septembre 2026.",
          },
          {
            label: "Code monétaire et financier — article R214-21",
            url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000027797309",
            publisher: "Légifrance",
            note: "Plafond du risque de contrepartie d'un fonds\u00a0: 10\u00a0% de l'actif sur un établissement de crédit, 5\u00a0% sinon. Consulté le 28 septembre 2026.",
          },
          {
            label: "Application du règlement PRIIPs\u00a0: quel sort pour les produits packagés américains\u00a0?",
            url: "https://www.amf-france.org/en/amf-ombudsman/ombudsman-online-diary/latest/application-priips-regulation-what-happens-us-packaged-products-subscribed-regulation-came-force",
            publisher: "AMF — journal de bord de la médiatrice, 9 mars 2023",
            note: "Fonds américains sans DIC\u00a0: plus commercialisés auprès des particuliers de l'EEE depuis le 1er janvier 2018. Consulté le 28 septembre 2026.",
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
            note: "«\u00a0Enveloppe fiscale\u00a0: -\u00a0», aucune mention du PEA dans le document. Consulté le 30 septembre 2026.",
          },
          {
            label: "Amundi Nasdaq-100 Swap UCITS ETF EUR Acc (ANX) — reporting mensuel au 31 août 2026, version pour professionnels",
            url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/LU1681038243/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
            publisher: "Amundi ETF",
            note: "«\u00a0Enveloppe fiscale\u00a0: -\u00a0», aucune mention du PEA dans le document. Consulté le 30 septembre 2026.",
          },
          {
            label: "Amundi MSCI Emerging Markets Swap UCITS ETF EUR Acc (AEEM) — reporting mensuel au 31 août 2026, version pour professionnels",
            url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/LU1681045370/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
            publisher: "Amundi ETF",
            note: "«\u00a0Enveloppe fiscale\u00a0: -\u00a0», aucune mention du PEA dans le document. Consulté le 30 septembre 2026.",
          },
          {
            label: "Amundi MSCI World Swap UCITS ETF EUR Acc (CW8) — reporting mensuel au 31 août 2026, version pour professionnels",
            url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/LU1681043599/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
            publisher: "Amundi ETF",
            note: "«\u00a0Enveloppe fiscale\u00a0: Eligible au PEA\u00a0». La ligne «\u00a0Éligibilité\u00a0» y indique pourtant «\u00a0Compte-titres, Assurance-vie\u00a0», comme pour 500, ANX et AEEM. Consulté le 30 septembre 2026.",
          },
          {
            label: "Amundi PEA Emergent (MSCI Emerging) ESG Transition UCITS ETF Acc (PAEEM) — reporting mensuel au 31 août 2026, version pour professionnels",
            url: "https://www.amundietf.fr/pdfDocuments/monthly-factsheet/FR0013412020/FRA/FRA/INSTITUTIONNEL/ETF/20260831",
            publisher: "Amundi ETF",
            note: "«\u00a0Enveloppe fiscale\u00a0: Eligible au PEA\u00a0». La ligne «\u00a0Éligibilité\u00a0» y indique pourtant «\u00a0Compte-titres, Assurance-vie\u00a0», comme pour 500, ANX et AEEM. Consulté le 30 septembre 2026.",
          },
          {
            label: "Amundi S&P 500 Swap UCITS ETF EUR Acc (500) — page du fonds",
            url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-sp-500-swap-ucits-etf-eur-acc/lu1681048804",
            publisher: "Amundi ETF",
            note: "«\u00a0Eligibilité au PEA\u00a0: Non\u00a0». Consultée le 30 septembre 2026.",
          },
          {
            label: "Amundi Nasdaq-100 Swap UCITS ETF EUR Acc (ANX) — page du fonds",
            url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-nasdaq100-swap-ucits-etf-eur-acc/lu1681038243",
            publisher: "Amundi ETF",
            note: "«\u00a0Eligibilité au PEA\u00a0: Non\u00a0». Consultée le 30 septembre 2026.",
          },
          {
            label: "Amundi MSCI Emerging Markets Swap UCITS ETF EUR Acc (AEEM) — page du fonds",
            url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-msci-emerging-markets-swap-ucits-etf-eur-acc/lu1681045370",
            publisher: "Amundi ETF",
            note: "«\u00a0Eligibilité au PEA\u00a0: Non\u00a0». Consultée le 30 septembre 2026.",
          },
          {
            label: "Amundi MSCI World Swap UCITS ETF EUR Acc (CW8) — page du fonds",
            url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-msci-world-swap-ucits-etf-eur-acc/lu1681043599",
            publisher: "Amundi ETF",
            note: "«\u00a0Eligibilité au PEA\u00a0: Oui\u00a0». Consultée le 30 septembre 2026.",
          },
          {
            label: "Amundi PEA Emergent (MSCI Emerging) ESG Transition UCITS ETF Acc (PAEEM) — page du fonds",
            url: "https://www.amundietf.fr/fr/particuliers/produits/equity/amundi-pea-emergent-msci-emerging-esg-transition-ucits-etf-acc/fr0013412020",
            publisher: "Amundi ETF",
            note: "«\u00a0Eligibilité au PEA\u00a0: Oui\u00a0». Consultée le 30 septembre 2026.",
          },
          ...ELIGIBLES_TRIES.map((f) => ({
              label: `justETF — ${f.displaySymbol} (${f.isin})`,
              url: `https://www.justetf.com/fr/etf-profile.html?isin=${f.isin}`,
              publisher: "justETF",
              note: `Source de recoupement\u00a0: nom, ISIN, frais, réplication. Consultée le ${DATE_VERIF}.`,
            })),
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
 * Un vrai <table> sur écran large (copiable, lisible par un robot), qui se
 * replie en cartes sous 640 px : une ligne par fonds, chaque cellule sur sa
 * ligne avec son intitulé. Pas de défilement horizontal à 375 px, et un seul
 * DOM — les ancres #fonds-xxx n'existent qu'une fois.
 */
function TableauFonds({ fonds, titre }: { fonds: EtfEligiblePea[]; titre: string }) {
  const th = "px-3 py-3 text-left font-semibold text-gray-500 border-b border-gray-100";
  const td = "flex gap-3 px-4 py-1 sm:table-cell sm:px-3 sm:py-3 sm:align-top";
  const intitule = "w-24 shrink-0 text-gray-500 sm:hidden";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <caption className="sr-only">
          ETF {titre} éligibles au PEA, vérifiés le {DATE_VERIF}
        </caption>
        <thead className="hidden sm:table-header-group bg-gray-50">
          <tr>
            <th scope="col" className={`${th} pl-4`}>Fonds</th>
            <th scope="col" className={th}>ISIN</th>
            <th scope="col" className={th}>Frais</th>
            <th scope="col" className={th}>Réplication</th>
            <th scope="col" className={th}>Dividendes</th>
          </tr>
        </thead>
        <tbody className="block sm:table-row-group">
          {fonds.map((f) => (
            <tr
              key={f.displaySymbol}
              id={ancreFonds(f.displaySymbol)}
              className="block py-3 border-b border-gray-100 last:border-b-0 sm:table-row sm:py-0"
            >
              <td className="block px-4 pb-2 sm:table-cell sm:py-3 sm:align-top">
                {f.aUneFiche ? (
                  <Link
                    href={`/etf/${f.displaySymbol}`}
                    className="font-bold text-primary-700 hover:underline"
                  >
                    {f.displaySymbol}
                  </Link>
                ) : (
                  <span className="font-bold text-gray-900">{f.displaySymbol}</span>
                )}
                <span className="block text-gray-600 leading-snug mt-0.5">{f.name}</span>
                {f.precision && (
                  <span className="block text-xs text-gray-500 leading-snug mt-1">{f.precision}</span>
                )}
                {/* 09/10/2026 : un fonds sans fiche (GPEA, ESE) renvoie à ses
                    comparatifs, faute de fiche qui le ferait. */}
                {!f.aUneFiche &&
                  ETF_COMPARISON_LIST.filter(
                    (c) => c.left.heading === f.displaySymbol || c.right.heading === f.displaySymbol,
                  ).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/comparatif-etf/${c.slug}`}
                      className="block text-xs font-medium text-primary-700 hover:underline mt-1"
                    >
                      Comparatif {c.left.heading} vs {c.right.heading}
                    </Link>
                  ))}
              </td>
              <td className={td}>
                <span className={intitule}>ISIN</span>
                <span className="font-mono text-[13px] text-gray-900 select-all">{f.isin}</span>
              </td>
              <td className={`${td} sm:whitespace-nowrap`}>
                <span className={intitule}>Frais</span>
                <span className="font-semibold text-gray-900 tabular-nums">{frais(f)}</span>
              </td>
              <td className={td}>
                <span className={intitule}>Réplication</span>
                <span className="text-gray-600">{f.replicationMethod}</span>
              </td>
              <td className={td}>
                <span className={intitule}>Dividendes</span>
                <span className="text-gray-600">{f.distributionPolicy}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
