// Fiche ETF v2 — « Les ETF du PEA, vérifiés à la source » (14/10/2026).
//
// Gabarit de la spécification private-assets/raw/geo/fiche-etf-v2-spec.md :
// chaque chiffre vient d'un fait de src/data/etf/<mnémo>.ts, avec le document
// de l'émetteur et sa date. Rien n'est écrit à la main ici : les nombres sont
// formatés au rendu (textes.ts).
//
// Ce que la v2 retire par rapport à la fiche actuelle : le cours Yahoo (ses
// conditions interdisent l'usage commercial, plan §3.6), les cartes
// « Pourquoi le choisir ? » et « À qui il convient » (formulation de conseil,
// plan §1.4), le renvoi vers le guide payant (plan §4.3), le bandeau
// d'affiliation, le rendement supposé du simulateur et le mur des 18 autres
// ETF (remplacé par les fonds proches et les comparatifs).

import Link from "next/link";
import { Fragment } from "react";
import type { ETFConfig } from "@/lib/etf-config";
import type { Fait, FicheEtfV2, MesureRisque, Periode } from "@/lib/fiche-etf-v2/types";
import {
  DCA_VERSEMENT_ANNUEL,
  DCA_VERSEMENT_MENSUEL,
  FRAICHEUR_JOURS,
  dateCourte,
  dateLongue,
  dateModifieeV2,
  dcaAnnuel,
  descriptionV2,
  encoursArrondi,
  euros,
  frais,
  joursEntre,
  millions,
  pct,
  points,
  rendements,
  titreV2,
} from "@/lib/fiche-etf-v2/textes";
import { MNEMOS_V2 } from "@/data/etf";
import { IssuerLogoMark } from "@/components/ui/IssuerLogoMark";
import { RegionMark } from "@/components/ui/RegionMark";
import { JsonLd } from "@/components/ui/JsonLd";
import { ETF_COMPARISON_LIST } from "@/lib/etf-comparisons";
import { ETF_PEA_VERIFIES, URL_LISTE_PEA, ancreFonds, lienListePea } from "@/lib/etf-pea-verifies";
import { FRAIS_ORDRE_ETF_PEA, fraisOrdreEtf, gammeDeLEtf } from "@/lib/brokers";
import { isBrokerCTAActive } from "@/lib/broker-config";

const ORIGINE = "https://dcatracker.fr";

/**
 * Signature nominative : décidée par Maël le 14/10/2026 (pages signées de son
 * nom, sans photo). Les fiches v1 portent déjà « Par Maël Faleyras » depuis le
 * 30/09/2026 ; la v2 la garde (visible et JSON-LD).
 */
const AUTEUR_NOMME = true;

/** Indices dont un guide existe (sous-hub de la fiche). */
const GUIDE_INDICE: Record<string, { href: string; label: string }> = {
  "msci-world": { href: "/etf-msci-world", label: "le guide des ETF MSCI World" },
  sp500: { href: "/etf-sp500", label: "le guide des ETF S&P 500" },
  "nasdaq-100": { href: "/etf-nasdaq", label: "le guide des ETF Nasdaq-100" },
};

/** Fonds qui suivent une variante de l'indice de leur groupe (comme reponse-fiche-etf.ts). */
const VARIANTE_D_INDICE = new Set(["PE500", "PAEEM"]);

const LIBELLE_PERIODE: Record<Periode, string> = {
  ytd: "Depuis le début de l'année",
  "1m": "1 mois",
  "3m": "3 mois",
  "6m": "6 mois",
  "1a": "1 an",
  "3a": "3 ans (cumulé)",
  "5a": "5 ans (cumulé)",
  origine: "Depuis l'origine (cumulé)",
};
const LIBELLE_RISQUE: Record<MesureRisque["periode"], string> = { "1a": "1 an", "3a": "3 ans", origine: "depuis le lancement" };

/** « le reporting… », « la fiche… » : l'article d'un libellé de document. */
function leDoc(d: { type: string; libelle: string }, majuscule = false): string {
  const la = d.type === "fiche-mensuelle" || d.type === "page-emetteur" || d.type === "grille-courtier";
  const art = la ? "la" : "le";
  return `${majuscule ? art.charAt(0).toUpperCase() + art.slice(1) : art} ${d.libelle}`;
}

/** « d'Amundi », « d'iShares », « de BlackRock ». */
const de = (nom: string) => (/^[AEIOUYÉaeiouy]/.test(nom) ? `d'${nom}` : `de ${nom}`);

/** « 0,05 % sur 1 an », « 0,05 % depuis le lancement ». */
const mesure = (x: MesureRisque) =>
  `${pct(x.valeur)} ${x.periode === "origine" ? "depuis le lancement" : `sur ${LIBELLE_RISQUE[x.periode]}`}`;

/** ["A", "B", "C"] → « A, B et C ». */
function enumerer(mots: string[]): string {
  if (mots.length <= 1) return mots.join("");
  return `${mots.slice(0, -1).join(", ")} et ${mots[mots.length - 1]}`;
}

/** « aux États-Unis », « à Taïwan », « au Japon », « en Chine » ; sinon « (Pays) ». */
const PREPOSITION_PAYS: Record<string, string> = {
  "États-Unis": "aux États-Unis",
  "Pays-Bas": "aux Pays-Bas",
  Japon: "au Japon",
  "Royaume-Uni": "au Royaume-Uni",
  Taïwan: "à Taïwan",
  Corée: "en Corée",
  Chine: "en Chine",
  Inde: "en Inde",
  Irlande: "en Irlande",
};
const dansLePays = (nom: string) => PREPOSITION_PAYS[nom] ?? `(${nom})`;

/** Frontière d'un tableau de performances : ce qui commence avant n'est pas comparable. */
interface Frontiere {
  date: string;
  legende: string;
}

export interface FicheEtfV2Props {
  fiche: FicheEtfV2;
  etf: ETFConfig;
  /** Date de création de l'URL (PUBLIEE_LE de la page). */
  publieeLe: string;
}

export function FicheEtfV2({ fiche: f, etf, publieeLe }: FicheEtfV2Props) {
  const m = f.mnemo;
  const docs = new Map(f.documents.map((d) => [d.id, d]));
  const doc = (id: string) => docs.get(id)!;
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const age = joursEntre(f.relueLe, aujourdhui);
  const aRevérifier = age > FRAICHEUR_JOURS;
  const ch = f.chiffres;
  const reporting = doc(ch.source);
  const url = `${ORIGINE}/etf/${m}`;
  const lienListe = lienListePea(m) ?? URL_LISTE_PEA;

  const moi = ETF_PEA_VERIFIES.find((x) => x.displaySymbol === m);
  const famille = moi?.famille;
  const memeIndice =
    famille && !VARIANTE_D_INDICE.has(m)
      ? ETF_PEA_VERIFIES.filter(
          (x) => x.famille === famille && x.displaySymbol !== m && !VARIANTE_D_INDICE.has(x.displaySymbol),
        ).sort((a, b) => a.displaySymbol.localeCompare(b.displaySymbol, "fr"))
      : [];
  const moinsChers = memeIndice.filter((x) => x.ter < f.ter.valeur);
  const guide = famille ? GUIDE_INDICE[famille] : undefined;
  const comparatifs = ETF_COMPARISON_LIST.filter((c) => c.left.heading === m || c.right.heading === m);

  // Encours dans la phrase : celui de la part s'il est publié dans un document
  // consultable, sinon celui du fonds, dit comme tel.
  const encoursPhrase = f.encours.part
    ? { fait: f.encours.part, quoi: "l'encours de cette part" }
    : { fait: f.encours.fonds, quoi: f.encours.autresPartsLibelle ? "l'encours du fonds, toutes parts confondues," : "son encours" };

  const synthetique = f.replication.valeur.mode === "synthetique";
  const derniereAnnee = ch.perfCalendaires.valeur[0];
  const ecartDe = (p: { fonds: number; indice: number; ecart?: number }) =>
    p.ecart ?? Math.round((p.fonds - p.indice) * 100) / 100;
  const perf1a = ch.perfCumulees.valeur.find((p) => p.periode === "1a");
  const dca = dcaAnnuel(f);
  const vl = f.vl;
  const montants = [DCA_VERSEMENT_MENSUEL, 2 * DCA_VERSEMENT_MENSUEL].filter((x) => !vl || vl.valeur <= x);
  const autresFichesV2 = MNEMOS_V2.filter((x) => x !== m);
  const emergentsVerifies = ETF_PEA_VERIFIES.filter((x) => x.famille === "emergents" && x.aUneFiche);
  const changementIndice = f.changements.find((c) => c.type === "indice");

  // Lignes de performance qui commencent avant la part actuelle (historique
  // rattaché, CW8) ou avant un changement d'indice (PAEEM) : marquées d'un
  // astérisque, avec la légende AU-DESSUS du tableau (relecture du 14/10/2026).
  const frontiere: Frontiere | null = changementIndice
    ? {
        date: changementIndice.date,
        legende: `période qui commence avant le changement d'indice du ${dateLongue(changementIndice.date)} : elle porte, en tout ou partie, sur l'ancien indice du fonds.`,
      }
    : f.dates.premiereVl
      ? {
          date: f.dates.creationPart.valeur,
          legende: `période qui commence avant la création de la part actuelle, le ${dateLongue(f.dates.creationPart.valeur)} : historique ${/^[AEIOUYÉ]/.test(f.emetteur.nom) ? `qu'${f.emetteur.nom}` : `que ${f.emetteur.nom}`} rattache à cette part.`,
        }
      : null;
  const avant = (debut: string) => (frontiere ? debut < frontiere.date : false);

  // Part « C/D » : ce qu'une seconde famille de sources en dit (PAEEM : justETF, « Capitalisation »).
  const distributionLue = f.distribution.recoupements.find((r) => /capitalisation/i.test(r.valeurLue));

  // Le contenu de l'indice, en mots simples, pour la réponse en tête.
  const premierPays = ch.paysIndice?.valeur[0];

  // ── Phrase-réponse (spécification §2.1), assemblée à partir des faits ─────
  const reponse = (
    <>
      <strong className="font-semibold text-gray-900">
        {m} ({f.isin.valeur}) est un ETF {f.emetteur.nom} qui suit l&apos;indice {f.indice.valeur.nom}
        {synthetique ? " par réplication synthétique (swap)" : " par réplication physique"}.
      </strong>{" "}
      Cet indice regroupe {f.indice.valeur.enClair}
      {ch.nbValeursIndice ? (
        <>
          &nbsp;: {ch.nbValeursIndice.valeur.toLocaleString("fr-FR")} valeurs au {dateCourte(ch.au)}
          {premierPays ? `, dont ${pct(premierPays.poids)} ${dansLePays(premierPays.nom)}` : ""} (
          <Source fait={ch.nbValeursIndice} doc={reporting} />)
        </>
      ) : memeIndice.some((x) => x.aUneFiche) ? (
        <>
          &nbsp;; c&apos;est le même indice que celui de{" "}
          {memeIndice
            .filter((x) => x.aUneFiche)
            .map((x, i, t) => (
              <Fragment key={x.displaySymbol}>
                {i > 0 && (i === t.length - 1 ? " et " : ", ")}
                <Link href={`/etf/${x.displaySymbol}`} className="font-semibold text-primary-700 hover:underline">
                  {x.displaySymbol}
                </Link>
              </Fragment>
            ))}
          , dont les fiches détaillent le contenu
        </>
      ) : null}
      . Il est {f.pea.statut.valeur ? "éligible au PEA" : "hors PEA"} (<Source fait={f.pea.preuve} doc={doc(f.pea.preuve.source)} />), ses frais
      courants sont de {frais(f.ter.valeur)} par an (<Source fait={f.ter} doc={doc(f.ter.source)} />) et{" "}
      {encoursPhrase.quoi} est de {encoursArrondi(encoursPhrase.fait.valeur)} au{" "}
      {dateLongue(encoursPhrase.fait.dateValeur)} (<Source fait={encoursPhrase.fait} doc={doc(encoursPhrase.fait.source)} />).
    </>
  );
  const reponseTexte =
    `${m} (${f.isin.valeur}) est un ETF ${f.emetteur.nom} qui suit l'indice ${f.indice.valeur.nom}` +
    `${synthetique ? " par réplication synthétique (swap)" : " par réplication physique"}. ` +
    `Cet indice regroupe ${f.indice.valeur.enClair}` +
    (ch.nbValeursIndice
      ? ` : ${ch.nbValeursIndice.valeur.toLocaleString("fr-FR")} valeurs au ${dateCourte(ch.au)}` +
        (premierPays ? `, dont ${pct(premierPays.poids)} ${dansLePays(premierPays.nom)}` : "") +
        ` selon ${f.emetteur.nom}`
      : "") +
    `. Il est ${f.pea.statut.valeur ? "éligible au PEA" : "hors PEA"}, ses frais courants sont de ${frais(f.ter.valeur)} par an ` +
    `(${doc(f.ter.source).libelle}) et ${encoursPhrase.quoi} est de ${encoursArrondi(encoursPhrase.fait.valeur)} au ${dateLongue(encoursPhrase.fait.dateValeur)}.`;

  // ── FAQ (bloc 16), réponses assemblées à partir des faits ─────────────────
  const avertissement = "Les performances passées ne préjugent pas des performances futures.";
  const faq: { q: string; a: string }[] = [
    { q: `Qu'est-ce que ${m} ?`, a: reponseTexte },
    {
      q: `${m} est-il éligible au PEA ?`,
      a:
        `${f.pea.statut.valeur ? "Oui" : "Non"}. ${leDoc(doc(f.pea.preuve.source), true)}${doc(f.pea.preuve.source).libelle.includes(",") ? "," : ""} indique « ${f.pea.preuve.citation ?? f.pea.preuve.valeur} »` +
        (f.pea.preuveSecondaire
          ? `, et ${leDoc(doc(f.pea.preuveSecondaire.source))} « ${f.pea.preuveSecondaire.citation ?? f.pea.preuveSecondaire.valeur} »`
          : "") +
        `. Recoupé sur ${enumerer([...new Set(f.pea.statut.recoupements.filter((r) => r.concorde).map((r) => r.libelle.split(",")[0]))])}. ` +
        `L'éligibilité peut changer ; dernière relecture le ${dateLongue(f.relueLe)}. Au moment de l'ordre, c'est l'ISIN (${f.isin.valeur}) qui identifie le fonds.`,
    },
    {
      q: `Quels sont les frais de ${m} ?`,
      a:
        `${frais(f.ter.valeur)} par an de frais courants, selon ${leDoc(doc(f.ter.source))}, soit ${euros(f.ter.valeur)} pour 100 € investis pendant un an. ` +
        "Ils sont prélevés au jour le jour sur l'actif du fonds : les performances publiées en sont déjà nettes. Les frais de courtage s'y ajoutent, selon le courtier.",
    },
    derniereAnnee
      ? {
          q: `Quelle a été la performance de ${m} en ${derniereAnnee.annee} ?`,
          a:
            `${pct(derniereAnnee.fonds)} selon ${f.emetteur.nom}, contre ${pct(derniereAnnee.indice)} pour son indice, soit un écart de ${points(ecartDe(derniereAnnee))}` +
            `${ch.ecartImprime ? "" : " (calculé par différence)"}. Performance nette des frais du fonds, hors frais de courtage et fiscalité. ${avertissement}`,
        }
      : {
          q: `Quelle est la performance de ${m} depuis sa création ?`,
          a: (() => {
            const o = ch.perfCumulees.valeur.find((p) => p.periode === "origine");
            return o
              ? `${pct(o.fonds)} du ${dateLongue(o.depuis)} au ${dateLongue(ch.au)} selon ${f.emetteur.nom}, contre ${pct(o.indice)} pour son indice. Aucune année civile complète n'est encore écoulée. ${avertissement}`
              : `Aucune année civile complète n'est encore écoulée. ${avertissement}`;
          })(),
        },
    ...(() => {
      const r = rendements(f);
      if (r.length === 0) return [];
      const libelle = (x: (typeof r)[number]) => `${x.ans} an${x.ans > 1 ? "s" : ""}`;
      const annualises = r.filter((x) => x.annualise !== null);
      return [
        {
          q: `Quel a été le rendement de ${m} sur ${enumerer(r.map(libelle))} ?`,
          a:
            `Selon ${f.emetteur.nom}, au ${dateLongue(ch.au)} : ${enumerer(r.map((x) => `${pct(x.cumule)} sur ${libelle(x)}`))}` +
            `${r.length > 1 ? " (performances cumulées)" : ""}.` +
            (annualises.length > 0
              ? ` Soit, en moyenne par an, environ ${enumerer(annualises.map((x) => `${pct(x.annualise!, 1)} sur ${libelle(x)}`))} (équivalent annuel calculé par DCA Tracker).`
              : "") +
            ` Performance nette des frais du fonds, hors frais de courtage et fiscalité. ${avertissement}`,
        },
      ];
    })(),
    ...(ch.nbValeursIndice || ch.paysIndice
      ? [
          {
            q: `Quelle est la composition de ${m} ?`,
            a:
              (ch.nbValeursIndice
                ? `Son indice comptait ${ch.nbValeursIndice.valeur.toLocaleString("fr-FR")} valeurs au ${dateLongue(ch.au)} selon ${f.emetteur.nom}. `
                : "") +
              (ch.paysIndice
                ? `Premiers pays de l'indice : ${enumerer(ch.paysIndice.valeur.map((p) => `${p.nom} ${pct(p.poids)}`))}. `
                : "") +
              (synthetique
                ? "Le fonds ne détient pas ces actions : il détient un panier de substitution et reçoit la performance de l'indice par un swap."
                : ""),
          },
        ]
      : []),
    ...f.autresParts.map((p) => ({
      q: `Quelle différence entre ${m} et ${p.valeur.mnemo} ?`,
      a:
        `${p.valeur.mnemo} (${p.valeur.isin}) est une autre part du même fonds, créée le ${dateLongue(p.valeur.creation)} : une ${p.valeur.difference}. ` +
        `Ses frais courants sont de ${frais(p.valeur.ter)} par an. Ce n'est pas un fonds concurrent.`,
    })),
  ];

  // ── JSON-LD : un seul @graph (spécification §6) ──────────────────────────
  const citationsLd = f.documents
    .filter((d) => d.famille === "emetteur" && d.consultable !== false)
    .map((d) => ({
      "@type": "DigitalDocument",
      name: d.libelle,
      url: d.url,
      dateModified: d.dateDocument,
      publisher: { "@type": "Organization", name: f.emetteur.nom },
    }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: titreV2(f),
        description: descriptionV2(f),
        inLanguage: "fr-FR",
        datePublished: publieeLe,
        dateModified: dateModifieeV2(f),
        isPartOf: { "@type": "WebSite", name: "DCA Tracker", url: ORIGINE },
        // Sans @id : l'Organization du layout n'en a pas (relecture SEO du 14/10/2026).
        publisher: { "@type": "Organization", name: "DCA Tracker", url: ORIGINE },
        ...(AUTEUR_NOMME
          ? { author: { "@type": "Person", "@id": `${ORIGINE}/a-propos#person`, name: "Maël Faleyras", url: `${ORIGINE}/a-propos` } }
          : {}),
        about: { "@id": `${url}#fonds` },
        breadcrumb: { "@id": `${url}#fil` },
        citation: citationsLd,
      },
      {
        "@type": "InvestmentFund",
        "@id": `${url}#fonds`,
        name: f.nomOfficiel.valeur,
        alternateName: m,
        identifier: { "@type": "PropertyValue", propertyID: "ISIN", value: f.isin.valeur },
        provider: { "@type": "Organization", name: f.emetteur.nom, url: f.emetteur.site },
        feesAndCommissionsSpecification: `Frais courants : ${frais(f.ter.valeur)} par an (${doc(f.ter.source).libelle}).`,
        url: doc(f.documents.find((d) => d.type === "page-emetteur")?.id ?? f.ter.source).url,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#fil`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: `${ORIGINE}/` },
          { "@type": "ListItem", position: 2, name: "ETF éligibles au PEA", item: `${ORIGINE}${URL_LISTE_PEA}` },
          { "@type": "ListItem", position: 3, name: m },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
  };

  const pageEmetteur = f.documents.find((d) => d.type === "page-emetteur");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={jsonLd} />

      {/* ── Fil d'Ariane (QW-03) : par la liste PEA ───────────────────────── */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Fil d'ariane">
        <Link href="/" className="hover:text-gray-700 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <Link href={URL_LISTE_PEA} className="hover:text-gray-700 transition-colors">ETF éligibles au PEA</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-700 font-medium" aria-current="page">{m}</span>
      </nav>

      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <header className="card-primary mb-6">
        <div className="flex items-start gap-4 mb-5">
          <IssuerLogoMark name={f.nomOfficiel.valeur} height={44} className="shrink-0 mt-1" />
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {m}&nbsp;: {f.nomOfficiel.valeur}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
              <span>
                ISIN <span className="font-mono text-gray-900 select-all">{f.isin.valeur}</span>
              </span>
              <span aria-hidden className="text-gray-300">·</span>
              <span>{f.emetteur.nom}</span>
              <span aria-hidden className="text-gray-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <RegionMark region={etf.region} size={14} />
                {f.indice.valeur.nom}
              </span>
              <span aria-hidden className="text-gray-300">·</span>
              <Link
                href={lienListe}
                className="px-2.5 py-0.5 rounded-full border text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-100 hover:border-emerald-300 transition-colors"
              >
                {f.pea.statut.valeur ? "Éligible au PEA" : "Hors PEA"}
              </Link>
            </p>
            <p className="mt-1.5 text-xs text-gray-500">Les ETF du PEA, vérifiés à la source.</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-gray-100">
          <Cle libelle="Frais courants" valeur={frais(f.ter.valeur)} fait={f.ter} doc={doc(f.ter.source)} fort />
          {vl && <Cle libelle="Valeur liquidative" valeur={euros(vl.valeur)} fait={vl} doc={doc(vl.source)} />}
          {/* 14/10/2026 : la même grandeur sur les cinq fiches, l'encours du
              fonds ; celui de la part, quand il est publié, est au bloc 7. */}
          <Cle
            libelle="Encours du fonds"
            sousLibelle={f.encours.autresPartsLibelle ? "toutes parts" : undefined}
            valeur={millions(f.encours.fonds.valeur)}
            fait={f.encours.fonds}
            doc={doc(f.encours.fonds.source)}
          />
          <Cle
            libelle="Réplication"
            valeur={synthetique ? "Synthétique (swap)" : "Physique"}
            fait={f.replication}
            doc={doc(f.replication.source)}
          />
        </dl>
        {vl && (
          <p className="mt-4 text-xs text-gray-500 leading-relaxed">
            Pas de cours en direct ici&nbsp;: la valeur liquidative est le prix officiel d&apos;une part, calculé une
            fois par jour par {f.emetteur.nom} (ici au {dateCourte(vl.dateValeur)}). Le cours en bourse, qui varie
            pendant la séance&nbsp;:{" "}
            {pageEmetteur ? (
              <a href={pageEmetteur.url} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-gray-800">
                la page du fonds chez {f.emetteur.nom}
              </a>
            ) : (
              "la page du fonds chez l'émetteur"
            )}{" "}
            ou votre courtier.
          </p>
        )}
      </header>

      {/* ── 1. La réponse d'abord ────────────────────────────────────────── */}
      <section aria-label="En bref" className="mb-10">
        <p className="text-base text-gray-800 leading-relaxed">{reponse}</p>
        <p data-nosearch="" className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
          {AUTEUR_NOMME && (
            <>
              <span>
                Par{" "}
                <Link href="/a-propos" className="font-semibold text-gray-700 hover:underline">
                  Maël Faleyras
                </Link>
              </span>
              <span aria-hidden>·</span>
            </>
          )}
          <span>
            Chiffres {de(f.emetteur.nom)} au <time dateTime={ch.au}>{dateCourte(ch.au)}</time>
            {vl && vl.dateValeur !== ch.au && (
              <>
                {" "}(valeur liquidative au <time dateTime={vl.dateValeur}>{dateCourte(vl.dateValeur)}</time>)
              </>
            )}
          </span>
          <span aria-hidden>·</span>
          <span>
            relus le <time dateTime={f.relueLe}>{dateCourte(f.relueLe)}</time>
          </span>
          <span aria-hidden>·</span>
          <Link href="/methodologie#verification" className="underline underline-offset-2 hover:text-gray-700">
            Méthode de vérification
          </Link>
          {aRevérifier && (
            <span className="ml-1 px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 font-semibold">
              À revérifier&nbsp;: relus il y a {age} jours
            </span>
          )}
        </p>
      </section>

      {/* ── 2. Identité vérifiée ─────────────────────────────────────────── */}
      {/* Relecture du 14/10/2026 : à 390 px, les 13 lignes sourcées repoussaient
          l'éligibilité et les frais de deux écrans. Les 4 lignes utiles d'abord,
          le reste (avec ses sources) dans un bloc dépliable. */}
      <Bloc id="identite" titre={`Identité de ${m}`}>
        <dl className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white text-sm">
          <Ligne libelle="ISIN" fait={f.isin} doc={doc(f.isin.source)}>
            <span className="font-mono select-all">{f.isin.valeur}</span>
          </Ligne>
          <Ligne libelle="Mnémonique à Paris" fait={f.isin} doc={doc(f.isin.source)}>
            {m}
          </Ligne>
          <Ligne libelle="Émetteur" fait={f.societeDeGestion} doc={doc(f.societeDeGestion.source)}>
            {f.emetteur.nom}, société de gestion {f.societeDeGestion.valeur}
          </Ligne>
          <Ligne libelle="Dividendes" fait={f.distribution} doc={doc(f.distribution.source)}>
            <Link href="/glossaire/capitalisant-distribuant" className="text-primary-700 hover:underline">
              {f.distribution.valeur === "capitalisation" ? "Capitalisation" : "Capitalisation et/ou distribution"}
            </Link>
            {f.distribution.valeur === "capitalisation" ? (
              " : les dividendes sont réinvestis dans le fonds."
            ) : (
              <>
                {" "}: c&apos;est la mention {de(f.emetteur.nom)} (part «&nbsp;C/D&nbsp;»).
                {/\bAcc\b/.test(f.nomOfficiel.valeur) && " Le nom officiel porte «\u00a0Acc\u00a0»"}
                {/\bAcc\b/.test(f.nomOfficiel.valeur) && (distributionLue ? ` et ${distributionLue.libelle} classe le fonds en capitalisation.` : ".")}
              </>
            )}
          </Ligne>
        </dl>
        <details className="group mt-3 rounded-2xl border border-gray-100 bg-white text-sm">
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-gray-700 flex items-center justify-between gap-3">
            Toutes les caractéristiques, avec leurs sources
            <span className="text-gray-500 group-open:rotate-180 transition-transform" aria-hidden>
              ▾
            </span>
          </summary>
          <dl className="divide-y divide-gray-100 border-t border-gray-100">
          <Ligne libelle="Nom officiel" fait={f.nomOfficiel} doc={doc(f.nomOfficiel.source)}>
            {f.nomOfficiel.valeur}
          </Ligne>
          <Ligne libelle="Indice" fait={f.indice} doc={doc(f.indice.source)}>
            {f.indice.valeur.nom}
            <span className="block text-xs text-gray-500">{f.indice.valeur.detail}</span>
          </Ligne>
          <Ligne libelle="Réplication" fait={f.replication} doc={doc(f.replication.source)}>
            {synthetique ? (
              <>
                <Link href="/glossaire/replication-synthetique" className="text-primary-700 hover:underline">
                  Synthétique
                </Link>
                , {f.replication.valeur.detail}
              </>
            ) : (
              <>Physique, {f.replication.valeur.detail}</>
            )}
          </Ligne>
          {f.contreparties && (
            <Ligne
              libelle={`Contrepartie${f.contreparties.valeur.length > 1 ? "s" : ""} du swap`}
              fait={f.contreparties}
              doc={doc(f.contreparties.source)}
            >
              {enumerer(f.contreparties.valeur)}
            </Ligne>
          )}
          <Ligne libelle="Domicile" fait={f.domicile} doc={doc(f.domicile.source)}>
            {f.domicile.valeur.pays}, {f.domicile.valeur.forme}
          </Ligne>
          <Ligne libelle="Création de la part" fait={f.dates.creationPart} doc={doc(f.dates.creationPart.source)}>
            {dateLongue(f.dates.creationPart.valeur)}
          </Ligne>
          {f.dates.premiereVl && (
            <Ligne libelle="Début de l'historique publié" fait={f.dates.premiereVl} doc={doc(f.dates.premiereVl.source)}>
              {dateLongue(f.dates.premiereVl.valeur)} (première valeur liquidative)
            </Ligne>
          )}
          <Ligne
            libelle="Première cotation à Paris"
            fait={f.dates.premiereCotationParis}
            doc={doc(f.dates.premiereCotationParis.source)}
          >
            {dateLongue(f.dates.premiereCotationParis.valeur)}
          </Ligne>
          {f.autresParts.map((p) => (
            <Ligne key={p.valeur.mnemo} libelle="Autre part du même fonds" fait={p} doc={doc(p.source)}>
              {p.valeur.mnemo} ({p.valeur.isin}), créée le {dateLongue(p.valeur.creation)}, {frais(p.valeur.ter)} de frais
              courants&nbsp;: une {p.valeur.difference}.
            </Ligne>
          ))}
          </dl>
        </details>
      </Bloc>

      {/* ── 3. Éligibilité au PEA, avec sa preuve ────────────────────────── */}
      <Bloc id="pea" titre="Éligibilité au PEA">
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong className="text-gray-900">
            {m} est {f.pea.statut.valeur ? "éligible" : "non éligible"} au{" "}
            <Link href="/glossaire/pea" className="text-primary-700 hover:underline">
              PEA
            </Link>
            .
          </strong>{" "}
          La preuve, chez l&apos;émetteur&nbsp;: «&nbsp;{f.pea.preuve.citation}&nbsp;» (
          <Source fait={f.pea.preuve} doc={doc(f.pea.preuve.source)} long />
          {f.pea.preuve.ou ? `, ${f.pea.preuve.ou}` : ""})
          {f.pea.preuveSecondaire && (
            <>
              , et «&nbsp;{f.pea.preuveSecondaire.citation}&nbsp;» (
              <Source fait={f.pea.preuveSecondaire} doc={doc(f.pea.preuveSecondaire.source)} long />)
            </>
          )}
          .
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          Recoupé sur{" "}
          {f.pea.statut.recoupements
            .filter((r) => r.concorde)
            .map((r, i, t) => (
              <Fragment key={r.libelle}>
                {i > 0 && (i === t.length - 1 ? " et " : ", ")}
                <a href={r.url} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-gray-900">
                  {r.libelle.split(",")[0]}
                </a>{" "}
                (le {dateCourte(r.releveLe)})
              </Fragment>
            ))}
          . L&apos;éligibilité peut changer&nbsp;: nous la relisons chaque mois, dernière relecture le{" "}
          {dateLongue(f.relueLe)}. Ce qu&apos;un PEA accepte, et pourquoi un fonds à swap peut y entrer&nbsp;:{" "}
          <Link href="/pea-ou-cto" className="text-primary-700 hover:underline">
            PEA ou compte-titres
          </Link>
          {" "}; les autres fonds vérifiés sont dans la{" "}
          <Link href={lienListe} className="text-primary-700 hover:underline">
            liste des ETF éligibles au PEA
          </Link>
          .
        </p>
      </Bloc>

      {/* ── 4. Ce qu'il coûte ────────────────────────────────────────────── */}
      <Bloc id="frais" titre={`Frais de ${m}`}>
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong className="text-gray-900">
            {frais(f.ter.valeur)} par an de{" "}
            <Link href="/glossaire/ter" className="text-primary-700 hover:underline">
              frais courants (TER)
            </Link>
          </strong>
          , selon le <Source fait={f.ter} doc={doc(f.ter.source)} />, soit {euros(f.ter.valeur)} pour 100&nbsp;€ investis
          pendant un an. Ils sont prélevés au jour le jour sur l&apos;actif du fonds&nbsp;: les performances publiées en sont
          déjà nettes.
          {moinsChers.length > 0 && (
            <>
              {" "}Dans notre liste vérifiée, d&apos;autres ETF éligibles au PEA suivent le même indice pour moins
              cher&nbsp;:{" "}
              {moinsChers.map((x, i) => (
                <Fragment key={x.displaySymbol}>
                  {i > 0 && (i === moinsChers.length - 1 ? " et " : ", ")}
                  <Link
                    href={x.aUneFiche ? `/etf/${x.displaySymbol}` : `${URL_LISTE_PEA}#${ancreFonds(x.displaySymbol)}`}
                    className="font-semibold text-primary-700 hover:underline"
                  >
                    {x.displaySymbol}
                  </Link>{" "}
                  ({frais(x.ter)})
                </Fragment>
              ))}
              .
            </>
          )}{" "}
          Les frais du courtier s&apos;y ajoutent&nbsp;:{" "}
          <a href="#courtiers" className="text-primary-700 hover:underline">
            ce que coûte un ordre
          </a>
          .
        </p>
      </Bloc>

      {/* ── 5. Performances publiées par l'émetteur ──────────────────────── */}
      <Bloc
        id="performances"
        titre={`Performances et rendement de ${m} au ${dateCourte(ch.au)}`}
        sousTitre={
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Publiées par {f.emetteur.nom}, en euros. {AVERTISSEMENT_COURT} Source&nbsp;: <SourceBloc doc={reporting} inline />,
            lu le {dateCourte(reporting.releveLe)}.
          </p>
        }
      >
        {frontiere && (
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            <span aria-hidden>*</span>&nbsp;: {frontiere.legende}
          </p>
        )}
        {ch.perfCalendaires.valeur.length > 0 && (
          <TableauPerf
            legende={`Performances de ${m} par année civile, en euros`}
            premiere="Année"
            ecartCalcule={!ch.ecartImprime}
            lignes={ch.perfCalendaires.valeur.map((p) => ({
              cle: String(p.annee),
              libelle: String(p.annee),
              ...p,
              ecart: ecartDe(p),
              avant: avant(`${p.annee}-01-01`),
            }))}
          />
        )}
        <div className={ch.perfCalendaires.valeur.length > 0 ? "mt-5" : ""}>
          <TableauPerf
            legende={`Performances cumulées de ${m}, en euros`}
            premiere="Période"
            ecartCalcule={!ch.ecartImprime}
            lignes={ch.perfCumulees.valeur.map((p) => ({
              cle: p.periode,
              libelle: LIBELLE_PERIODE[p.periode],
              detail: `depuis le ${dateCourte(p.depuis)}`,
              ...p,
              ecart: ecartDe(p),
              avant: avant(p.depuis),
            }))}
          />
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mt-3">
          Écart&nbsp;: performance du fonds moins celle de l&apos;indice, en points de pourcentage&nbsp;; négatif, le fonds a
          fait un peu moins que son indice.
        </p>
        {f.notesPerformances.map((n) => (
          <p key={n} className="text-xs text-gray-600 leading-relaxed mt-3">
            {n}
          </p>
        ))}
        <Avertissement doc={reporting} />
      </Bloc>

      {/* ── 6. Écart à l'indice ──────────────────────────────────────────── */}
      <Bloc id="ecart" titre={`Écart de ${m} à son indice`}>
        <p className="text-sm text-gray-700 leading-relaxed">
          {derniereAnnee ? (
            <>
              En {derniereAnnee.annee}, {m} a fait {pct(derniereAnnee.fonds)} et son indice {pct(derniereAnnee.indice)}
              &nbsp;: un écart de {points(ecartDe(derniereAnnee))}
            </>
          ) : perf1a ? (
            <>
              Sur un an au {dateCourte(ch.au)}, {m} a fait {pct(perf1a.fonds)} et son indice {pct(perf1a.indice)}&nbsp;: un
              écart de {points(ecartDe(perf1a))}
            </>
          ) : null}
          {ch.ecartImprime ? ", tel que l'imprime l'émetteur" : ", calculé par différence entre les deux performances publiées"}
          . Ses frais courants sont de {frais(f.ter.valeur)} par an. L&apos;écart à l&apos;indice mesure ce que le fonds a
          rendu de moins (ou de plus) que l&apos;indice qu&apos;il suit, frais compris.
        </p>
        {(ch.trackingError || ch.volatilite) && (
          <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
            {ch.trackingError && (
              <li>
                <strong className="text-gray-800">Écart de suivi</strong> (la dispersion de cet écart au jour le jour, une
                autre mesure)&nbsp;:{" "}
                {ch.trackingError.valeur.map(mesure).join(", ")}.
              </li>
            )}
            {ch.volatilite && (
              <li>
                <strong className="text-gray-800">
                  <Link href="/glossaire/volatilite" className="text-primary-700 hover:underline">
                    Volatilité
                  </Link>
                </strong>{" "}
                du fonds&nbsp;: {ch.volatilite.valeur.map(mesure).join(", ")}.
              </li>
            )}
          </ul>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Source&nbsp;: <SourceBloc doc={reporting} inline />.
        </p>
      </Bloc>

      {/* ── 7 et 8. Valeur liquidative et encours ────────────────────────── */}
      <Bloc id="valeur-encours" titre="Valeur liquidative et encours">
        <ul className="space-y-2 text-sm text-gray-700">
          {vl ? (
            <li>
              <strong className="text-gray-900">Valeur liquidative au {dateCourte(vl.dateValeur)}&nbsp;: {euros(vl.valeur)}</strong>{" "}
              (<Source fait={vl} doc={doc(vl.source)} />).{" "}
              {vl.valeur > 100
                ? "Une part vaut plus que 100 € : un versement de 100 € n'en achète pas une entière, sauf chez un courtier qui vend des fractions de parts."
                : `À ce prix, 100 € achètent ${Math.floor(100 / vl.valeur)} parts entières.`}
            </li>
          ) : (
            <li>Valeur liquidative de fin de mois&nbsp;: non publiée dans les documents de l&apos;émetteur que nous avons lus.</li>
          )}
          {f.encours.part && (
            <li>
              <strong className="text-gray-900">
                Encours de la part au {dateCourte(f.encours.part.dateValeur)}&nbsp;: {millions(f.encours.part.valeur)}
              </strong>{" "}
              (<Source fait={f.encours.part} doc={doc(f.encours.part.source)} />).
            </li>
          )}
          <li>
            <strong className="text-gray-900">
              Encours du fonds au {dateCourte(f.encours.fonds.dateValeur)}
              {f.encours.autresPartsLibelle ? `, toutes parts confondues (${f.encours.autresPartsLibelle})` : ""}&nbsp;:{" "}
              {millions(f.encours.fonds.valeur)}
            </strong>{" "}
            (<Source fait={f.encours.fonds} doc={doc(f.encours.fonds.source)} />).
          </li>
          <li className="text-gray-600">
            Le cours en bourse change en continu pendant la séance&nbsp;: nous ne le reproduisons pas. Il figure sur{" "}
            {pageEmetteur ? (
              <a href={pageEmetteur.url} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-gray-900">
                la page du fonds chez {f.emetteur.nom}
              </a>
            ) : (
              "la page du fonds chez l'émetteur"
            )}{" "}
            et chez votre courtier.
          </li>
        </ul>
      </Bloc>

      {/* ── 9. Ce qu'il suit ─────────────────────────────────────────────── */}
      <Bloc
        id="contenu"
        titre={
          ch.nbValeursIndice || ch.paysIndice
            ? `Composition de l'indice de ${m} au ${dateCourte(ch.au)}`
            : `Composition : ce que suit ${m}`
        }
      >
        {ch.nbValeursIndice || ch.paysIndice || ch.secteursIndice ? (
          <>
            {ch.nbValeursIndice && (
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">
                  {ch.nbValeursIndice.valeur.toLocaleString("fr-FR")} valeurs dans l&apos;indice
                </strong>{" "}
                {f.indice.valeur.nom}.
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              {ch.paysIndice && <Top3 titre="Premiers pays de l'indice" lignes={ch.paysIndice.valeur} />}
              {ch.secteursIndice && <Top3 titre="Premiers secteurs de l'indice" lignes={ch.secteursIndice.valeur} />}
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Données de l&apos;indice publiées par {f.emetteur.nom} (<SourceBloc doc={reporting} inline />)&nbsp;; la
              composition complète n&apos;est pas reprise ici.
              {/^MSCI/.test(f.indice.valeur.nom)
                ? ` ${f.indice.valeur.nom} est un indice de MSCI Inc.`
                : /^Nasdaq/.test(f.indice.valeur.nom)
                  ? ` ${f.indice.valeur.nom} est un indice de Nasdaq, Inc.`
                  : ""}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed">
            {f.emetteur.nom} ne publie pas la répartition de l&apos;indice par pays ni par secteurs.
            {memeIndice.some((x) => x.aUneFiche) && (
              <>
                {" "}Pour le même indice, elle figure sur les fiches{" "}
                {memeIndice
                  .filter((x) => x.aUneFiche)
                  .map((x, i, t) => (
                    <Fragment key={x.displaySymbol}>
                      {i > 0 && (i === t.length - 1 ? " et " : ", ")}
                      <Link href={`/etf/${x.displaySymbol}`} className="font-semibold text-primary-700 hover:underline">
                        {x.displaySymbol}
                      </Link>
                    </Fragment>
                  ))}
                .
              </>
            )}
          </p>
        )}
        {synthetique && (
          <p className="text-sm text-gray-700 leading-relaxed mt-3">
            Le fonds ne détient pas ces actions&nbsp;: il détient un panier de substitution
            {f.panier && (
              <>
                {" "}({f.panier.valeur.toLocaleString("fr-FR")} titres au {dateCourte(f.panier.dateValeur)},{" "}
                <Source fait={f.panier} doc={doc(f.panier.source)} />)
              </>
            )}{" "}
            et reçoit la performance de l&apos;indice par un contrat d&apos;échange, le swap.
          </p>
        )}
      </Bloc>

      {/* ── 10. Points à connaître ───────────────────────────────────────── */}
      <Bloc id="points" titre="Points à connaître">
        <ul className="space-y-2 text-sm text-gray-700 leading-relaxed list-disc pl-5">
          {synthetique && (
            <li>
              Réplication synthétique&nbsp;: la performance de l&apos;indice est livrée par un contrat d&apos;échange avec
              {f.contreparties ? ` ${enumerer(f.contreparties.valeur)}` : " une ou plusieurs banques"}
              . La réglementation des OPCVM plafonne le risque pris sur chaque contrepartie.
            </li>
          )}
          {famille === "msci-world" && (
            <li>
              Le MSCI World ne contient aucun pays émergent&nbsp;: ni la Chine, ni l&apos;Inde, ni le Brésil.
              {emergentsVerifies.length > 0 && (
                <>
                  {" "}Dans un PEA, les pays émergents passent par des ETF à part&nbsp;; dans notre liste vérifiée,{" "}
                  {emergentsVerifies.map((x, i, t) => (
                    <Fragment key={x.displaySymbol}>
                      {i > 0 && (i === t.length - 1 ? " et " : ", ")}
                      <Link href={`/etf/${x.displaySymbol}`} className="font-semibold text-primary-700 hover:underline">
                        {x.displaySymbol}
                      </Link>
                    </Fragment>
                  ))}
                  .
                </>
              )}
            </li>
          )}
          {f.pointsAConnaitre.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </Bloc>

      {/* ── 11. 100 € par mois ───────────────────────────────────────────── */}
      {/* Relecture du 14/10/2026 : le titre disait « chaque mois » et le calcul
          plaçait 1 200 € en 2026, alors que 9 mois seulement étaient écoulés.
          Le titre dit maintenant l'approximation, l'année en cours ne compte
          que ses mois écoulés, et le biais du placement en janvier est écrit en
          clair, pas en petits caractères. */}
      <Bloc
        id="dca"
        titre={`Investir ${euros(DCA_VERSEMENT_MENSUEL, 0)} par mois dans ${m} : une approximation`}
      >
        {dca ? (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">
              Les douze versements de {euros(DCA_VERSEMENT_MENSUEL, 0)} d&apos;une année sont regroupés en un seul, de{" "}
              {euros(DCA_VERSEMENT_ANNUEL, 0)}, placé dans {m} le 1er janvier, de {dca.depuis} à{" "}
              {dca.depuis + dca.anneesCloses - 1}
              {dca.anneeEnCours.mois > 0 && (
                <>
                  &nbsp;; pour {dca.anneeEnCours.annee}, {euros(dca.anneeEnCours.verse, 0)}, pour les{" "}
                  {dca.anneeEnCours.mois} mois écoulés au {dateCourte(ch.au)}
                </>
              )}
              . Au total, {euros(dca.totalVerse, 0)} versés auraient valu{" "}
              <strong className="text-gray-900">{euros(Math.round(dca.valeurFinale), 0)}</strong> au {dateCourte(ch.au)}.{" "}
              {dca.pire
                ? `Au pire moment relevé, fin ${dca.pire.annee}, la valeur était ${pct(Math.abs(dca.pire.pct), 1)} sous les sommes versées.`
                : "À aucune fin d'année la valeur n'est passée sous les sommes versées ; ce calcul annuel ne voit pas les baisses en cours d'année."}{" "}
              {dca.depuis === Number(f.dates.creationPart.valeur.slice(0, 4)) + 1
                ? `${dca.depuis} est la première année civile complète depuis la création de la part, le ${dateLongue(f.dates.creationPart.valeur)}.`
                : `${dca.depuis} est la plus ancienne année civile que publie ${f.emetteur.nom} pour cette part.`}
              {changementIndice && changementIndice.date > `${dca.depuis}-01-01` && (
                <> Les années antérieures au {dateLongue(changementIndice.date)} portent, en tout ou partie, sur l&apos;ancien indice du fonds.</>
              )}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2">
              Placer l&apos;argent dès janvier donne en général plus qu&apos;un vrai versement de{" "}
              {euros(DCA_VERSEMENT_MENSUEL, 0)} chaque mois quand l&apos;année monte, et moins quand elle baisse&nbsp;: ce
              montant est un ordre de grandeur, pas le résultat exact d&apos;un investissement mensuel.
            </p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Calcul de DCA Tracker sur les performances par année civile et depuis le début de l&apos;année publiées par{" "}
              {f.emetteur.nom} (<SourceBloc doc={reporting} inline />), reproductible par le lecteur&nbsp;: frais du fonds
              inclus, hors frais de courtage et fiscalité. Ce n&apos;est pas un rendement promis. {avertissement}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed">
            Pas encore calculé&nbsp;: {f.emetteur.nom} publie moins de trois années civiles complètes pour cette part,
            trop peu pour un calcul représentatif à partir de ses chiffres publiés.
          </p>
        )}
        <p className="text-sm mt-3">
          <Link
            href={`/simulateur?etfs=${m}:100&monthly=${DCA_VERSEMENT_MENSUEL}&years=20`}
            className="font-semibold text-primary-700 hover:underline"
          >
            Simuler {euros(DCA_VERSEMENT_MENSUEL, 0)} par mois avec {m}
          </Link>{" "}
          <span className="text-gray-500">
            (projection, avec ses frais
            {vl && vl.valeur > DCA_VERSEMENT_MENSUEL ? " ; suppose un courtier qui vend des fractions de parts" : ""}) ·{" "}
          </span>
          <Link href="/methodologie" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
            méthode
          </Link>
        </p>
      </Bloc>

      {/* ── 12. Où l'acheter : frais d'un ordre (sans affiliation) ────────── */}
      <Bloc
        id="courtiers"
        titre={
          montants.length > 0
            ? "Frais d'un ordre chez les courtiers dont nous avons relu la grille"
            : "Courtiers dont nous avons relu la grille"
        }
      >
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Ordre alphabétique. Les frais viennent de la grille officielle de chaque courtier, à la date indiquée.
          {!isBrokerCTAActive() && " Le site ne reçoit aucune commission de ces courtiers."}{" "}
          {montants.length === 0 && vl && (
            <>
              Une part de {m} vaut {euros(vl.valeur)} au {dateCourte(vl.dateValeur)}&nbsp;: un achat de{" "}
              {euros(DCA_VERSEMENT_MENSUEL, 0)} ou {euros(2 * DCA_VERSEMENT_MENSUEL, 0)} n&apos;en achète pas une entière,
              sauf chez un courtier qui vend des fractions de parts. Le tableau donne donc les frais d&apos;un achat
              d&apos;une part, au prix de cette valeur liquidative (le cours en bourse en diffère un peu).{" "}
            </>
          )}
          Le site a vérifié, fonds par fonds, la gamme Boursomarkets de BoursoBank&nbsp;; il n&apos;a pas vérifié que ce
          fonds est proposé chez Fortuneo et Trade Republic.
        </p>
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 hidden sm:table-header-group">
              <tr>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-500">Courtier</th>
                {montants.map((x) => (
                  <th key={x} scope="col" className="text-left px-4 py-3 font-semibold text-gray-500">
                    Achat de {x}&nbsp;€ en PEA
                  </th>
                ))}
                {montants.length === 0 && vl && (
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-500">
                    Achat d&apos;une part ({euros(vl.valeur)}) en PEA
                  </th>
                )}
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-500">Gamme à frais réduits</th>
              </tr>
            </thead>
            <tbody className="block sm:table-row-group divide-y divide-gray-100">
              {FRAIS_ORDRE_ETF_PEA.map((c) => {
                const gamme = gammeDeLEtf(c, m);
                return (
                  <tr key={c.slug} className="block sm:table-row py-2 sm:py-0">
                    <td className="block sm:table-cell px-4 py-2 sm:py-3 align-top">
                      <Link href={`/comparatif/${c.slug}`} className="font-semibold text-gray-900 hover:text-primary-700">
                        {c.nom}
                      </Link>
                      <span className="block text-xs text-gray-500">{c.offre}</span>
                      <a
                        href={c.grille.url}
                        target="_blank"
                        rel="noopener"
                        className="block mt-0.5 text-xs text-gray-500 underline underline-offset-2 hover:text-primary-700"
                      >
                        {c.grille.libelle}, consultée le {dateCourte(c.consulteeLe)}
                      </a>
                    </td>
                    {montants.map((x) => (
                      <td key={x} className="flex gap-3 sm:table-cell px-4 py-1 sm:py-3 align-top text-gray-800">
                        <span className="w-28 shrink-0 text-gray-500 sm:hidden">Achat de {x}&nbsp;€</span>
                        <span>{fraisOrdreEtf(c, m, x)}</span>
                      </td>
                    ))}
                    {montants.length === 0 && vl && (
                      <td className="flex gap-3 sm:table-cell px-4 py-1 sm:py-3 align-top text-gray-800">
                        <span className="w-28 shrink-0 text-gray-500 sm:hidden">Achat d&apos;une part</span>
                        <span>{fraisDUnePart(c, m, vl.valeur)}</span>
                      </td>
                    )}
                    <td className="flex gap-3 sm:table-cell px-4 py-1 sm:py-3 align-top text-gray-700">
                      <span className="w-28 shrink-0 text-gray-500 sm:hidden">Gamme réduite</span>
                      <span>
                        {gamme
                          ? `${m} fait partie de la ${gamme.nom} (constaté le ${dateCourte(gamme.constateLe)})`
                          : c.gamme
                            ? `${m} n'en fait pas partie (constaté le ${dateCourte(c.gamme.constateLe)})`
                            : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Bloc>

      {/* ── 13. Ce qui a changé ──────────────────────────────────────────── */}
      <Bloc id="changements" titre={`Ce qui a changé pour ${m}`}>
        {f.changements.length > 0 ? (
          <ol className="space-y-3">
            {[...f.changements]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((c) => (
                <li key={`${c.date}-${c.type}`} className="text-sm text-gray-700 leading-relaxed">
                  <time dateTime={c.date} className="font-semibold text-gray-900">
                    {dateLongue(c.date)}
                  </time>{" "}
                  · {c.texte}{" "}
                  <span className="text-xs text-gray-500">
                    Source&nbsp;:{" "}
                    <LienDoc doc={doc(c.source)} className="underline underline-offset-2 hover:text-gray-800">
                      {doc(c.source).libelle}
                    </LienDoc>
                    {c.recoupement ? ` ; recoupé : ${c.recoupement}` : ""}.
                  </span>
                </li>
              ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-600">Aucun changement relevé à ce jour.</p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Nos corrections sur cette fiche</h3>
        {f.corrections.length > 0 ? (
          <ul className="space-y-2">
            {f.corrections.map((c) => (
              <li key={c.date + c.texte} className="text-sm text-gray-600 leading-relaxed">
                <time dateTime={c.date} className="font-semibold text-gray-800">
                  {dateLongue(c.date)}
                </time>{" "}
                · {c.texte}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Aucune correction depuis la mise en ligne de la fiche.</p>
        )}
        <p className="text-xs text-gray-500 mt-3">
          Toutes nos corrections, datées&nbsp;:{" "}
          <Link href="/changelog" className="underline underline-offset-2 hover:text-gray-800">
            journal des changements
          </Link>
          .
        </p>
      </Bloc>

      {/* ── 14. Documents et méthode ─────────────────────────────────────── */}
      <Bloc id="documents" titre="Documents de l'émetteur et sources">
        <ul className="space-y-2 text-sm">
          {f.documents.map((d) => (
            <li key={d.id} className="text-gray-700">
              <LienDoc doc={d} className="text-primary-700 hover:underline">
                {d.libelle.charAt(0).toUpperCase() + d.libelle.slice(1)}
              </LienDoc>{" "}
              <span className="text-xs text-gray-500">
                {d.consultable === false
                  ? "(pas de page lisible à cette adresse : chaque donnée qui en vient est recoupée, avec un lien, sur sa ligne)"
                  : `(document du ${dateCourte(d.dateDocument)}, lu le ${dateCourte(d.releveLe)})`}
              </span>
            </li>
          ))}
          <li className="text-gray-700">
            Recoupement&nbsp;:{" "}
            <a href={f.recoupementPrincipal.url} target="_blank" rel="noopener" className="text-primary-700 hover:underline">
              {f.recoupementPrincipal.libelle}
            </a>{" "}
            <span className="text-xs text-gray-500">(lue le {dateCourte(f.recoupementPrincipal.releveLe)})</span>
          </li>
        </ul>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          Comment nous vérifions&nbsp;:{" "}
          <Link href="/methodologie#verification" className="text-primary-700 hover:underline">
            méthode de vérification
          </Link>{" "}
          ·{" "}
          <Link href="/methodologie#classement" className="text-primary-700 hover:underline">
            comment nous classons
          </Link>
          . Une erreur&nbsp;?{" "}
          <a href="mailto:hello@dcatracker.fr" className="text-primary-700 hover:underline">
            Écrivez-nous
          </a>
          &nbsp;; chaque correction est datée sur cette page.
        </p>
      </Bloc>

      {/* ── 15. Fonds proches et comparatifs ─────────────────────────────── */}
      <Bloc id="fonds-proches" titre="Fonds proches et comparatifs">
        <ul className="space-y-2 text-sm text-gray-700 leading-relaxed">
          {memeIndice.length > 0 && (
            <li>
              Même indice, éligibles au PEA (liste vérifiée, ordre alphabétique)&nbsp;:{" "}
              {memeIndice.map((x, i) => (
                <Fragment key={x.displaySymbol}>
                  {i > 0 && (i === memeIndice.length - 1 ? " et " : ", ")}
                  <Link
                    href={x.aUneFiche ? `/etf/${x.displaySymbol}` : `${URL_LISTE_PEA}#${ancreFonds(x.displaySymbol)}`}
                    className="font-semibold text-primary-700 hover:underline"
                  >
                    {x.displaySymbol}
                  </Link>{" "}
                  ({frais(x.ter)}
                  {x.distributionPolicy !== "Capitalisant" ? ", distribuant" : ""})
                </Fragment>
              ))}
              .
            </li>
          )}
          {f.equivalentsHorsPea.map((e) => (
            <li key={e.mnemo}>
              Hors PEA&nbsp;:{" "}
              <Link href={`/etf/${e.mnemo}`} className="font-semibold text-primary-700 hover:underline">
                {e.mnemo}
              </Link>
              , {e.note}
            </li>
          ))}
          {comparatifs.length > 0 && (
            <li>
              Comparatifs&nbsp;:{" "}
              {comparatifs.map((c, i) => (
                <Fragment key={c.slug}>
                  {i > 0 && " · "}
                  <Link href={`/comparatif-etf/${c.slug}`} className="text-primary-700 hover:underline">
                    {c.title}
                  </Link>
                </Fragment>
              ))}
            </li>
          )}
          {guide && (
            <li>
              Pour comparer les fonds de cet indice&nbsp;:{" "}
              <Link href={guide.href} className="text-primary-700 hover:underline">
                {guide.label}
              </Link>
              .
            </li>
          )}
          {autresFichesV2.length > 0 && (
            <li>
              Les autres fiches vérifiées à la source&nbsp;:{" "}
              {autresFichesV2.map((x, i) => (
                <Fragment key={x}>
                  {i > 0 && (i === autresFichesV2.length - 1 ? " et " : ", ")}
                  <Link href={`/etf/${x}`} className="font-semibold text-primary-700 hover:underline">
                    {x}
                  </Link>
                </Fragment>
              ))}
              .
            </li>
          )}
          <li>
            Tous les fonds vérifiés, indice par indice&nbsp;:{" "}
            <Link href={URL_LISTE_PEA} className="text-primary-700 hover:underline">
              la liste des ETF éligibles au PEA
            </Link>
            .
          </li>
        </ul>
      </Bloc>

      {/* ── 16. FAQ ──────────────────────────────────────────────────────── */}
      <section aria-labelledby="faq-etf" className="mb-10">
        <h2 id="faq-etf" className="text-lg font-semibold text-gray-900 mb-4">
          Questions fréquentes sur {m}
        </h2>
        <div className="space-y-3">
          {faq.map(({ q, a }) => (
            <details key={q} open className="group rounded-xl border border-gray-100 bg-white p-4 open:bg-gray-50/50">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gray-900">{q}</span>
                <span className="text-gray-500 group-open:rotate-180 transition-transform" aria-hidden>
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer data-nosearch="" className="p-4 rounded-xl bg-amber-50 border border-amber-200">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Avertissement&nbsp;:</strong> cette fiche décrit un fonds, elle ne le recommande pas. DCA Tracker
          n&apos;est pas conseiller en investissements financiers&nbsp;; les informations présentées sont à caractère
          éducatif et ne constituent pas un conseil en investissement personnalisé. Les performances passées ne
          préjugent pas des performances futures. Consultez un conseiller financier agréé (CGP/CIF) avant toute
          décision d&apos;investissement.
        </p>
      </footer>
    </div>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────────

type Doc = FicheEtfV2["documents"][number];

/** Libellé court d'un document : « reporting Amundi du 30/09/2026 », « DIC du 28/04/2026 ». */
function libelleCourt(d: Doc): string {
  const le = dateCourte(d.dateDocument);
  switch (d.type) {
    case "reporting-pro":
    case "reporting": {
      const part = d.libelle.match(/de la part (\S+)/)?.[1];
      return `reporting Amundi${part ? ` de ${part}` : ""} du ${le}`;
    }
    case "dic":
      return `DIC du ${le}`;
    case "prospectus":
      return `prospectus du ${le}`;
    case "fiche-mensuelle":
      return `fiche mensuelle iShares au ${le}`;
    case "avis-porteurs":
      return `avis aux porteurs du ${le}`;
    case "registre":
      return `registre ESMA FIRDS du ${le}`;
    case "page-emetteur":
      return d.libelle;
    case "donnees-emetteur":
      return `données produit ${de(d.libelle.match(/d'(\S+)/)?.[1] ?? "l'émetteur")} relevées le ${le}`;
    default:
      return d.libelle;
  }
}

/**
 * Frais d'achat d'une part (fiche dont la part vaut plus de 200 €). brokers.ts
 * refuse de chiffrer un montant que sa grille ne modélise pas (Fortuneo, offre
 * FreeTrade Amundi à partir de 500 €) : la fiche le dit au lieu d'inventer.
 */
function fraisDUnePart(c: (typeof FRAIS_ORDRE_ETF_PEA)[number], m: string, montant: number): string {
  try {
    return fraisOrdreEtf(c, m, montant);
  } catch {
    return "Non calculé : la grille de ce courtier n'est pas modélisée à ce montant";
  }
}

/** Avertissement court, au-dessus des tableaux de performances (relecture du 14/10/2026). */
const AVERTISSEMENT_COURT =
  "Performances passées, nettes des frais du fonds, hors courtage et fiscalité : elles ne préjugent pas des performances futures.";

/** Lien vers un document ; texte simple quand le document n'a pas de page lisible (données de l'émetteur). */
function LienDoc({ doc, className, title, children }: { doc: Doc; className?: string; title?: string; children: React.ReactNode }) {
  if (doc.consultable === false) {
    return (
      <span title={title} className="text-gray-600">
        {children}
      </span>
    );
  }
  return (
    <a href={doc.url} target="_blank" rel="noopener" title={title} className={className}>
      {children}
    </a>
  );
}

/**
 * Lien vers le document qui porte un fait. Libellé court par défaut ; le
 * libellé complet et la citation exacte sont dans l'infobulle et dans la liste
 * des documents. `long` : quand la version du document compte (la ligne
 * « Enveloppe fiscale » n'est que dans le reporting pour professionnels).
 */
function Source({ fait, doc, long }: { fait: Fait<unknown>; doc: Doc; long?: boolean }) {
  return (
    <LienDoc
      doc={doc}
      title={`${doc.libelle}${fait.citation ? ` : « ${fait.citation} »` : ""}${fait.ou ? ` (${fait.ou})` : ""}`}
      className="underline underline-offset-2 decoration-gray-300 hover:text-primary-700 hover:decoration-primary-300"
    >
      {long ? doc.libelle : libelleCourt(doc)}
    </LienDoc>
  );
}

function SourceBloc({ doc, inline }: { doc: Doc; inline?: boolean }) {
  const lien = (
    <a href={doc.url} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-gray-800">
      {doc.libelle}
    </a>
  );
  if (inline) return lien;
  return (
    <p className="text-xs text-gray-500 mt-1">
      Source&nbsp;: {lien}, lu le {dateCourte(doc.releveLe)}.
    </p>
  );
}

function Bloc({
  id,
  titre,
  sousTitre,
  children,
}: {
  id: string;
  titre: string;
  sousTitre?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-titre`} id={id} className="mb-10 scroll-mt-24">
      <h2 id={`${id}-titre`} className="text-xl font-bold text-gray-900">
        {titre}
      </h2>
      {sousTitre}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Cle({
  libelle,
  sousLibelle,
  valeur,
  fait,
  doc,
  fort,
}: {
  libelle: string;
  sousLibelle?: string;
  valeur: string;
  fait: Fait<unknown>;
  doc: Doc;
  fort?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {libelle}
        {sousLibelle && <span className="block normal-case tracking-normal font-normal">{sousLibelle}</span>}
      </dt>
      <dd className={`text-base font-semibold tabular-nums ${fort ? "text-primary-700" : "text-gray-900"}`}>{valeur}</dd>
      <dd className="text-[11px] text-gray-500 leading-snug">
        <a href={doc.url} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-gray-800">
          au {dateCourte(fait.dateValeur)}
        </a>
      </dd>
    </div>
  );
}

function Ligne({
  libelle,
  fait,
  doc,
  children,
}: {
  libelle: string;
  fait: Fait<unknown>;
  doc: Doc;
  children: React.ReactNode;
}) {
  const recoupe = fait.recoupements.filter((r) => r.concorde).map((r) => r.libelle.split(" (")[0].split(",")[0]);
  return (
    <div className="px-4 py-3 sm:grid sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-gray-500">{libelle}</dt>
      <dd className="text-gray-900 min-w-0 break-words">
        {children}
        <span className="block text-[11px] text-gray-500 mt-0.5">
          <Source fait={fait} doc={doc} />
          {doc.consultable === false
            ? fait.recoupements
                .filter((r) => r.concorde)
                .map((r) => (
                  <Fragment key={r.libelle}>
                    {" "}· recoupé&nbsp;:{" "}
                    <a href={r.url} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-gray-800">
                      {r.libelle}
                    </a>
                  </Fragment>
                ))
            : recoupe.length > 0 && <> · recoupé&nbsp;: {[...new Set(recoupe)].join(", ")}</>}
        </span>
      </dd>
    </div>
  );
}

function TableauPerf({
  legende,
  premiere,
  lignes,
  ecartCalcule,
}: {
  legende: string;
  premiere: string;
  lignes: { cle: string; libelle: string; detail?: string; fonds: number; indice: number; ecart: number; avant?: boolean }[];
  ecartCalcule: boolean;
}) {
  const th = "px-3 py-2 text-left font-semibold text-gray-500";
  const td = "px-3 py-2 tabular-nums";
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <caption className="sr-only">{legende}</caption>
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className={th}>{premiere}</th>
            <th scope="col" className={`${th} text-right`}>Fonds</th>
            <th scope="col" className={`${th} text-right`}>Indice</th>
            <th scope="col" className={`${th} text-right`}>
              Écart (points){ecartCalcule ? <span className="block font-normal">calculé</span> : null}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {lignes.map((l) => (
            <tr key={l.cle} className={l.avant ? "bg-gray-50" : undefined}>
              <th scope="row" className="px-3 py-2 text-left font-medium text-gray-800">
                {l.libelle}
                {l.avant && <span aria-label="avant la frontière indiquée au-dessus du tableau">&nbsp;*</span>}
                {l.detail && <span className="block text-[11px] font-normal text-gray-500">{l.detail}</span>}
              </th>
              <td className={`${td} text-right text-gray-900`}>{pct(l.fonds)}</td>
              <td className={`${td} text-right text-gray-600`}>{pct(l.indice)}</td>
              <td className={`${td} text-right text-gray-600`}>{points(l.ecart).replace(/\u00a0points?$/, "")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Top3({ titre, lignes }: { titre: string; lignes: { nom: string; poids: number }[] }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{titre}</h3>
      <ul className="space-y-1 text-sm">
        {lignes.map((l) => (
          <li key={l.nom} className="flex justify-between gap-3">
            <span className="text-gray-700">{l.nom}</span>
            <span className="tabular-nums text-gray-900">{pct(l.poids)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Avertissement({ doc }: { doc: Doc }) {
  return (
    <p className="text-xs text-gray-500 leading-relaxed mt-3">
      Performances passées, en euros, nettes des frais du fonds, hors frais de courtage et fiscalité. Elles ne
      préjugent pas des performances futures. Source&nbsp;:{" "}
      <a href={doc.url} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-gray-800">
        {doc.libelle}
      </a>
      .
    </p>
  );
}
