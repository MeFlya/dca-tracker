import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Table2 } from "lucide-react";
import { EducationalHeader } from "@/components/ui/EducationalHeader";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { SourcesReferences } from "@/components/ui/SourcesReferences";
import { JsonLd } from "@/components/ui/JsonLd";
import { RenvoiProduit } from "@/components/products/RenvoiProduit";
import { LienRenvoiProduit } from "@/components/products/LienRenvoiProduit";
import { Fenetre } from "@/components/products/visuels";
import { ModeleGratuitForm } from "@/components/ressources/ModeleGratuitForm";
import { VideoModeleGratuit } from "@/components/ressources/VideoModeleGratuit";
import { getProduct, TEMPLATE_CAPTURES, type Capture } from "@/lib/products";
import { baremeCapital, tauxAffiche } from "@/lib/fiscal/pea-cto";
import { dateEnToutesLettres } from "@/lib/etf-pea-verifies";
import { MODELE_GRATUIT_SHEETS_COPIE } from "@/lib/ressources-gratuites";
import {
  ACHATS_EXEMPLE,
  DATE_CAPTURES,
  OUVERTURE_PEA_EXEMPLE,
  PLAFOND_PEA,
  cinqAnsExemple,
  lignesExemple,
  totauxExemple,
  triExemple,
  versementExemple,
} from "@/lib/cockpit-exemple";

// ─── Pourquoi cette page (01/10/2026) ────────────────────────────────────────
//
// Brief : private-assets/raw/geo/brief-cockpit-2026-10-01.md. Requête visée :
// « suivi pea excel » et son groupe (fichier / template / tableau de suivi
// PEA, version Google Sheets). Les trois premiers résultats de Google sont des
// pages qui EXPLIQUENT et DONNENT un fichier ; la page produit du Cockpit, qui
// vend, ne peut pas prendre cette place sans perdre ses propres requêtes
// (« tableau excel dca », « tableau de bord pea »). D'où une page à part, qui
// ne met jamais « DCA » dans son title ni son H1.
//
// Ce qu'elle donne : la méthode et les formules, recopiables par n'importe
// qui, et un modèle gratuit (journal + Par ETF, tiré du Cockpit v2.0) envoyé
// par email. Le Cockpit est cité deux fois au plus : l'encadré du haut et le
// renvoi de fin d'article.
//
// ⚠️ Chaque chiffre de l'exemple est CALCULÉ (src/lib/cockpit-exemple.ts) sur
// les 87 achats du classeur livré, avec les règles de ses formules : il ne
// peut pas diverger des captures. Rien n'est écrit à la main, sauf les taux
// légaux qui ont leur source en bas de page, la date de la v2.0 (journal des
// changements) et le temps de saisie (page produit).
// ⚠️ 01/10/2026 : ces achats et ces cours étaient FICTIFS, sur trois ETF
// réels ; le cours de PE500 de l'exemple était sous son plus bas sur
// 52 semaines (Google Finance, consulté le 01/10/2026), un cours de marché
// faux daté d'un vrai jour.
// ⚠️ 02/10/2026 : les COURS sont désormais RÉELS (clôtures d'Euronext Paris
// du 15 du mois ou du jour de bourse suivant, cours de Par ETF du 02/10/2026 ;
// sources et recoupements : src/lib/cockpit-exemple.ts). Seuls les ACHATS
// restent fictifs (quantités inventées). La page le dit au premier chiffre
// (section PRU), dans l'intro, dans la FAQ (texte repris en JSON-LD), dans
// les légendes et dans l'avertissement final. Plus-value et TRI sont ceux
// d'un exemple aux quantités arbitraires : datés, présentés comme un chiffre
// passé, jamais comme la performance d'un fonds.
// ⚠️ Cours : dans nos fichiers, le cours manuel (Par ETF, col. F), s'il est
// rempli, passe DEVANT le cours automatique (col. E, GOOGLEFINANCE) — formule
// du cours retenu en G. Ne jamais l'appeler « secours » ni écrire que Sheets
// récupère les cours « tout seul » sans cette condition. Dans Excel, le cours
// se saisit à la main parce que NOS formules ne lisent pas le type de données
// Actions d'Excel pour Microsoft 365, pas parce qu'Excel ne saurait pas.
// ⚠️ Le TRI à 0,0 % touchait les versions antérieures à la 2.0 (vendues
// jusqu'au 1er octobre 2026) : même fond que le journal (src/lib/changelog.ts),
// jamais « la première version ».
// ⚠️ Temps de saisie : « environ 2 minutes par mois pour 3 ETF », comme la page
// produit et le classeur (Par ETF!A4), pas un autre chiffre.
// ⚠️ Aucun conseil : les ETF de l'exemple sont ceux du jeu de démonstration,
// et le versement du mois est un calcul sur une allocation que le lecteur
// fixe lui-même (le site n'a pas le statut de CIF).

const URL_PAGE = "/suivi-pea-excel";
const PUBLIEE_LE = "2026-10-01";
/** 02/10/2026 : exemple passé aux cours réels (captures, chiffres, sources). */
const MISE_A_JOUR_LE = "2026-10-02";
const CONSULTE_LE = dateEnToutesLettres("2026-10-01");
/** Consultation des cours de l'exemple (Euronext, Yahoo Finance, Boursorama). */
const COURS_CONSULTES_LE = dateEnToutesLettres("2026-10-02");

const TITLE = "Suivi PEA Excel et Google Sheets : modèle gratuit et PRU";
const DESCRIPTION =
  "Suivre un PEA d'ETF dans Excel ou Google Sheets : modèle gratuit, formules du PRU frais inclus, du TRI, du plafond, des 5 ans et du versement du mois.";
const H1 = "Suivre votre PEA dans Excel ou Google Sheets : le tableau, onglet par onglet";

// 01/10/2026 : cet openGraph remplace en entier celui du layout, image,
// siteName et locale compris (constat : partage sans visuel). L'image vient
// d'opengraph-image.tsx, à côté (convention Next.js) ; Next la reprend en
// twitter:image tant que `twitter.images` n'est pas défini ici.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL_PAGE },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL_PAGE,
    type: "article",
    siteName: "DCA Tracker",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// ─── Chiffres de l'exemple (calculés) ────────────────────────────────────────

// 02/10/2026 : arrondi d'abord à 15 chiffres significatifs, comme l'affichage
// d'Excel. Sans cela, 0,5 × 10 680,37 = 5 340,18499999… s'affichait
// « 5 340,18 € » ici et « 5 340,19 € » sur la capture du Versement du mois.
const eur = (n: number) =>
  `${Number(n.toPrecision(15)).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
/** 02/10/2026 : « 14 parts d'ETZ », pas « de ETZ » (élision devant une voyelle). */
const de = (ticker: string) => (/^[AEIOUY]/i.test(ticker) ? `d'${ticker}` : `de ${ticker}`);
const pc = (x: number, decimales = 1) =>
  `${(x * 100).toLocaleString("fr-FR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales })} %`;

const LIGNES = lignesExemple();
const TOTAL = totauxExemple();
const PE500 = LIGNES[0];
const VERSEMENT = 300;
const V = versementExemple(VERSEMENT);
/** ETF sans manque après versement : ils ne reçoivent rien ce mois-ci. */
const SANS_MANQUE = V.lignes.filter((l) => l.manque === 0).map((l) => l.ticker);
const TRI = triExemple();
const NB_ACHATS = ACHATS_EXEMPLE.length;
const PREMIER_ACHAT = dateEnToutesLettres(ACHATS_EXEMPLE[0][0]);
const DERNIER_ACHAT = dateEnToutesLettres(ACHATS_EXEMPLE[NB_ACHATS - 1][0]);
const DATE_CAPTURE = dateEnToutesLettres(DATE_CAPTURES);
/** Premier achat dont la clôture a 3 décimales (Euronext cote ces ETF au millième). */
const ACHAT_MILLIEME = ACHATS_EXEMPLE.find((a) => Math.round(a[3] * 1000) % 10 !== 0);
const CINQ_ANS = dateEnToutesLettres(cinqAnsExemple());
const OUVERTURE = dateEnToutesLettres(OUVERTURE_PEA_EXEMPLE);
const PLAFOND_UTILISE = TOTAL.investi / PLAFOND_PEA;
/** Taux des prélèvements sociaux sur un retrait de PEA fait en 2026 (LFSS 2026). */
const TAUX_PS = baremeCapital(2026, "produit-placement").sociaux;
const PS = `${tauxAffiche(TAUX_PS)} %`;
const PS_ESTIMES = TOTAL.plusValue * TAUX_PS;
const PLAFOND = `${PLAFOND_PEA.toLocaleString("fr-FR")} €`;

const COCKPIT = getProduct("template-suivi-dca");
const PRIX_COCKPIT = COCKPIT ? `${COCKPIT.priceEur} €` : null;

// ─── Captures ────────────────────────────────────────────────────────────────

const capture = (fichier: string): Capture => {
  const c = TEMPLATE_CAPTURES.find((x) => x.src.endsWith(fichier));
  if (!c) throw new Error(`Capture introuvable : ${fichier}`);
  return c;
};
const CAPTURE_PAR_ETF = capture("cockpit-v2-par-etf.png");
const CAPTURE_DASHBOARD = capture("cockpit-v2-dashboard.png");
const CAPTURE_PEA = capture("cockpit-v2-pea.png");
const CAPTURE_VERSEMENT = capture("cockpit-v2-versement.png");

const lien = "text-primary-700 font-medium hover:underline";
const code =
  "block overflow-x-auto rounded-xl bg-slate-900 px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-100";

// ─── FAQ (texte brut : repris tel quel dans le JSON-LD) ─────────────────────

const FAQ = [
  {
    id: "pru-plusieurs-achats",
    q: "Comment calculer le PRU d'un ETF acheté plusieurs fois ?",
    a: `Additionnez tout ce que vous avez payé pour cet ETF, frais compris, et divisez par le nombre de parts que vous détenez. Dans l'exemple de cette page (des achats fictifs, aux cours de clôture réels de l'ETF), ${PE500.ticker} a coûté ${eur(PE500.investi)} pour ${PE500.parts} parts, soit un prix de revient unitaire (PRU) de ${eur(PE500.pru)}. Dans un tableur, deux SOMME.SI.ENS sur le journal des achats (les montants, puis les parts) et une division suffisent. Ce calcul suppose que vous n'avez rien vendu, le cas courant d'un DCA sur un PEA.`,
  },
  {
    id: "frais-de-courtage",
    q: "Où mettre les frais de courtage ?",
    a: "Sur la ligne de l'achat, dans le journal : le montant total de l'achat vaut les parts multipliées par le prix, plus les frais. Ils entrent ainsi dans le PRU, qui dit ce que chaque part vous a réellement coûté, et dans le calcul du rendement. Tenus à part, ils disparaissent de ces deux chiffres.",
  },
  {
    id: "cours-google-sheets",
    q: "Comment récupérer le cours d'un ETF dans Google Sheets ?",
    a: "Avec la fonction GOOGLEFINANCE, en préfixant le ticker par la place de cotation : =GOOGLEFINANCE(\"EPA:PE500\";\"price\") pour une part cotée à Paris. Le cours est différé de 20 minutes au plus, selon l'aide de Google. Si un ETF ne renvoie rien, saisissez son cours à la main. Dans nos fichiers, ce cours manuel, s'il est rempli, passe devant le cours automatique : laissez sa colonne vide tant que le cours automatique remonte.",
  },
  {
    id: "tri-a-zero",
    q: "Pourquoi mon TRI affiche-t-il 0 % ?",
    a: "Le plus souvent, la plage donnée à TRI.PAIEMENTS (XIRR) commence par des lignes vides, comptées comme des flux nuls. C'est arrivé dans les versions de notre propre classeur antérieures à la 2.0 (vendues jusqu'au 1er octobre 2026) : Excel affichait 0,0 %. La plage doit commencer au premier achat, avec les achats en négatif et la valeur du jour en positif, à la date du jour.",
  },
  {
    id: "plafond-versements-ou-valeur",
    q: "Le plafond du PEA se compte-t-il en versements ou en valeur ?",
    a: `En versements. Le plafond de ${PLAFOND} vise l'argent que vous déposez sur le plan, pas sa valeur : les plus-values n'en consomment rien, et un PEA peut valoir plus que le plafond. Votre tableau doit donc additionner vos dépôts, et non la valeur du portefeuille.`,
  },
  {
    // 01/10/2026 : « faq- » devant, sinon le même id que le H2 de la section 8.
    id: "faq-excel-ou-google-sheets",
    q: "Excel ou Google Sheets pour suivre un PEA ?",
    a: "Google Sheets garde le fichier dans votre Google Drive, et nos fichiers y prennent les cours de GOOGLEFINANCE tant que la colonne du cours manuel reste vide. Excel garde le fichier sur votre ordinateur. Dans nos fichiers Excel, le cours se saisit à la main, environ 2 minutes par mois pour 3 ETF (Excel pour Microsoft 365 a un type de données Actions, mais nos formules n'en dépendent pas). Les formules du suivi sont les mêmes dans les deux.",
  },
];

export default function SuiviPeaExcelPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema items={[{ name: "Accueil", url: "/" }, { name: "Suivi PEA sur Excel ou Google Sheets" }]} />

      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">Suivi PEA sur Excel ou Google Sheets</span>
      </nav>

      {/* La réponse d'abord, lisible sans JavaScript. */}
      <EducationalHeader
        icon={Table2}
        eyebrow="Méthode, formules et modèle gratuit"
        title={H1}
        subtitle={
          "Un tableau de suivi de PEA tient en quatre feuilles : un journal de vos achats, une vue par ETF " +
          "(prix de revient, valeur, poids), un tableau de bord (versé, valeur, plus-value, rendement annualisé) et " +
          "une feuille PEA (plafond de versements, date des 5 ans). Voici leurs formules, pour Excel et Google Sheets, " +
          "sur les captures d'un classeur réel, avec son exemple (achats fictifs, cours réels), et un modèle gratuit à recevoir par email."
        }
      />

      <ArticleByline
        publishedAt={PUBLIEE_LE}
        updatedAt={MISE_A_JOUR_LE}
        readingMinutes={9}
        url={URL_PAGE}
        headline={TITLE}
        description={DESCRIPTION}
        images={["/ressources/modele-suivi-pea-transactions.png", CAPTURE_PAR_ETF.src, CAPTURE_VERSEMENT.src]}
      />

      {/* ── Deux façons de faire ─────────────────────────────────────────── */}
      <section aria-labelledby="deux-facons" className="mb-14 rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6">
        <h2 id="deux-facons" className="text-lg font-bold text-gray-900 mb-4">Deux façons de faire</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div id="modele-gratuit" className="scroll-mt-24">
            <p className="font-semibold text-gray-900">Partir du modèle gratuit</p>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              Le journal des achats et la vue par ETF (PRU frais inclus, valeur, plus-value, poids), en
              {MODELE_GRATUIT_SHEETS_COPIE ? " Excel et Google Sheets" : " Excel"}. Puis ajoutez ce qui vous
              manque avec les formules de cette page.
            </p>
            <ModeleGratuitForm source="suivi-pea-excel-haut" id="email-modele-haut" className="mt-3" />
          </div>
          {/* 04/10/2026 : la boucle du modèle gratuit, APRÈS le formulaire
              (une colonne : formulaire, vidéo, Cockpit ; deux colonnes : en
              deuxième rangée). Le formulaire ne bouge sur aucun format.
              STORYBOARD-MODELE-GRATUIT.md §6. */}
          <VideoModeleGratuit className="sm:col-span-2 sm:order-last" />
          <div className="sm:border-l sm:border-primary-100 sm:pl-6">
            <p className="font-semibold text-gray-900">Ou prendre le classeur complet</p>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              Le Cockpit DCA ajoute le tableau de bord avec le TRI, le versement du mois, la feuille PEA, la
              projection et les frais{PRIX_COCKPIT ? <> ({PRIX_COCKPIT}, paiement unique, Excel et Google Sheets)</> : null}.
              Ce sont ses captures qui illustrent cette page.
            </p>
            <LienRenvoiProduit
              href="/produits/template-suivi-dca"
              produitId="template-suivi-dca"
              className="mt-3 inline-block text-sm font-semibold text-primary-700 hover:underline"
            >
              Voir le Cockpit DCA →
            </LienRenvoiProduit>
          </div>
        </div>
      </section>

      {/* ── 1. Ce que le tableau doit dire ───────────────────────────────── */}
      <section className="mb-14">
        <h2 id="ce-qu-il-doit-dire" className="text-2xl font-bold text-gray-900 mb-4">
          Ce qu&apos;un tableau de suivi doit vous dire chaque mois
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Votre courtier affiche déjà la valeur de votre PEA. Un tableau de suivi sert à ce qu&apos;il ne
            montre pas, ou mal&nbsp;:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong className="text-gray-900">combien vous avez versé</strong>, frais compris, et ce que
              cela vaut aujourd&apos;hui&nbsp;;
            </li>
            <li>
              <strong className="text-gray-900">ce que cela rapporte par an</strong>, en tenant compte de la
              date de chaque versement&nbsp;;
            </li>
            <li>
              <strong className="text-gray-900">le poids de chaque ETF</strong> face à la répartition que
              vous vous êtes fixée, et donc où mettre le prochain versement&nbsp;;
            </li>
            <li>
              <strong className="text-gray-900">où vous en êtes du PEA</strong>&nbsp;: la part du plafond de
              versements déjà utilisée et la date des 5&nbsp;ans.
            </li>
          </ul>
          <p>
            Tout part d&apos;un seul tableau rempli à la main, le journal des achats. Le reste se calcule.
          </p>
        </div>
      </section>

      {/* ── 2. Les onglets ───────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 id="onglets" className="text-2xl font-bold text-gray-900 mb-4">Les onglets, un rôle chacun</h2>
        <p className="text-gray-600 leading-relaxed mb-5">
          {/* 01/10/2026 : plus de « dans leur ordre ». La liste commence par le
              journal ; le classeur, lui, par le Mode d'emploi et le Dashboard
              (ordre réel : TEMPLATE_CONTENTS, products.ts). Pas de « dont tout
              le reste dépend » non plus : l'onglet Frais ne lit aucune autre
              feuille (formules du .xlsx v2.0, relues le 01/10/2026). */}
          Voici les feuilles de calcul du Cockpit DCA, en commençant par le journal des achats. Les deux
          premières de la liste sont aussi celles du modèle gratuit.
        </p>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <caption className="sr-only">Onglets d&apos;un classeur de suivi de PEA et leur rôle</caption>
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Onglet</th>
                <th scope="col" className="px-4 py-3 font-semibold">Ce qu&apos;il fait</th>
                <th scope="col" className="px-4 py-3 font-semibold text-right">Modèle gratuit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {[
                ["Transactions", "Le journal : une ligne par achat, saisie à partir de l'avis d'opéré.", true],
                ["Par ETF", "Parts, total investi, PRU, valeur, plus-value, poids face à la cible.", true],
                ["Dashboard", "Valeur, total versé, plus-value, TRI annualisé, répartition.", false],
                ["Versement du mois", "Combien de parts de chaque ETF acheter avec le versement du mois.", false],
                ["PEA", "Plafond de versements utilisé, date des 5 ans, prélèvements sociaux estimés.", false],
                ["Projection", "Capital estimé selon le versement, le rendement supposé et la durée.", false],
                ["Frais", "Ce que coûtent le courtage et les frais de gestion (TER) sur 10, 20 et 30 ans.", false],
              ].map(([nom, role, gratuit]) => (
                <tr key={nom as string}>
                  <th scope="row" className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">{nom}</th>
                  <td className="px-4 py-3">{role}</td>
                  <td className="px-4 py-3 text-right">{gratuit ? "Oui" : <span className="text-gray-400">Non</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          Le TER, ce sont les frais de gestion annuels de l&apos;ETF&nbsp;:{" "}
          <Link href="/glossaire/ter" className={lien}>comment ils se calculent</Link>.
        </p>
      </section>

      {/* ── 3. Le journal ────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 id="journal" className="scroll-mt-24 text-2xl font-bold text-gray-900 mb-4">Le journal des achats</h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Une ligne par achat&nbsp;: la date, le ticker de l&apos;ETF, le nombre de parts, le prix unitaire et
            les frais, recopiés de l&apos;avis d&apos;opéré de votre courtier. Le tableur calcule le montant total
            de la ligne. On n&apos;efface jamais une ligne passée&nbsp;: le journal est l&apos;historique dont tout
            le reste dépend.
          </p>
          <p>Le montant total d&apos;un achat, frais compris, en colonne F&nbsp;:</p>
          <code className={code}>=SI(OU(A9=&quot;&quot;;C9=&quot;&quot;;D9=&quot;&quot;);&quot;&quot;;C9*D9+SI(E9=&quot;&quot;;0;E9))</code>
          <p>
            Le «&nbsp;SI&nbsp;» laisse la cellule vide tant que la ligne n&apos;est pas remplie&nbsp;: vous
            pouvez préparer des centaines de lignes d&apos;avance sans fausser les totaux. Pour le ticker, une
            liste déroulante qui reprend les ETF de l&apos;onglet suivant évite les fautes de frappe&nbsp;;
            la liste des{" "}
            <Link href="/etf-eligibles-pea" className={lien}>ETF éligibles au PEA</Link> donne les tickers et
            les ISIN.
          </p>
        </div>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-xl bg-white shadow-card-lg ring-1 ring-slate-200/80">
            <Image
              src="/ressources/modele-suivi-pea-transactions.png"
              alt="Onglet Transactions du modèle gratuit : date, ticker, parts achetées, prix unitaire et frais dans les cases bleues, montant total calculé"
              width={1882}
              height={1301}
              sizes="(min-width: 768px) 720px, calc(100vw - 32px)"
              className="block h-auto w-full"
            />
          </div>
          <figcaption className="mt-2 text-xs text-gray-500">
            L&apos;onglet Transactions, identique dans le modèle gratuit et dans le Cockpit. Exemple à remplacer
            par vos données&nbsp;: {NB_ACHATS} achats fictifs (quantités inventées), du {PREMIER_ACHAT} au{" "}
            {DERNIER_ACHAT}, aux cours de clôture réels sur Euronext Paris du 15 du mois ou du jour de bourse
            suivant.
            {ACHAT_MILLIEME ? (
              <>
                {" "}Ces clôtures sont publiées au millième ({ACHAT_MILLIEME[3].toLocaleString("fr-FR", { minimumFractionDigits: 3 })}&nbsp;€
                pour {ACHAT_MILLIEME[1]} le {dateEnToutesLettres(ACHAT_MILLIEME[0])})&nbsp;: la colonne du prix
                les affiche au centime, le montant total est calculé sur le prix exact.
              </>
            ) : null}
          </figcaption>
        </figure>
      </section>

      {/* ── 4. PRU et valeur ─────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 id="pru" className="scroll-mt-24 text-2xl font-bold text-gray-900 mb-4">
          Le prix de revient (PRU) frais inclus et la valeur de chaque ETF
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            La vue par ETF additionne le journal ligne par ligne. Pour l&apos;ETF dont le ticker est en A9, les
            parts détenues puis le total investi&nbsp;:
          </p>
          <code className={code}>=SOMME.SI.ENS(Transactions!$C$9:$C$1008;Transactions!$B$9:$B$1008;$A9)</code>
          <code className={code}>=SOMME.SI.ENS(Transactions!$F$9:$F$1008;Transactions!$B$9:$B$1008;$A9)</code>
          <p>
            Le PRU est le total investi divisé par les parts. Dans l&apos;exemple (achats fictifs, aux cours de
            clôture réels de trois ETF), {PE500.ticker} a coûté{" "}
            {eur(PE500.investi)} pour {PE500.parts}&nbsp;parts, soit un PRU de{" "}
            <strong className="text-gray-900">{eur(PE500.pru)}</strong>, frais compris. Au cours de clôture du{" "}
            {DATE_CAPTURE}, {eur(PE500.cours)}, la ligne vaut {eur(PE500.valeur)}&nbsp;: {eur(PE500.plusValue)} de plus-value,
            soit {pc(PE500.perf)}.
          </p>
          <p>
            Le poids d&apos;un ETF est sa valeur divisée par la valeur totale du portefeuille ({eur(TOTAL.valeur)}{" "}
            dans l&apos;exemple)&nbsp;: {pc(PE500.poids)} pour {PE500.ticker}, pour une cible de {pc(PE500.cible, 0)}.
          </p>
          <p>
            <strong className="text-gray-900">Les cours.</strong> Dans Google Sheets, une formule les récupère&nbsp;:
          </p>
          <code className={code}>=SI($A9=&quot;&quot;;&quot;&quot;;SIERREUR(GOOGLEFINANCE(&quot;EPA:&quot;&amp;$A9;&quot;price&quot;);&quot;&quot;))</code>
          <p>
            «&nbsp;EPA&nbsp;» désigne la cotation à Paris. Le cours est différé de 20&nbsp;minutes au plus, selon
            l&apos;aide de Google, ce qui suffit pour un suivi mensuel. Nos fichiers ont aussi une colonne de
            cours saisi à la main (F), et le cours retenu (G) suit une règle simple&nbsp;: le cours manuel,
            s&apos;il est rempli, passe devant le cours automatique (E).
          </p>
          <code className={code}>{`=SI($A9="";"";SI($F9<>"";$F9;SI($E9<>"";$E9;"")))`}</code>
          <p>
            Dans Excel, saisissez donc le cours en F, environ 2&nbsp;minutes par mois pour 3&nbsp;ETF. Dans Google
            Sheets, laissez la colonne F vide pour que le cours automatique serve, et ne la remplissez que si un
            cours ne remonte pas&nbsp;; videz-la quand il remonte de nouveau.
          </p>
        </div>
        <div className="mt-6">
          <Fenetre
            capture={CAPTURE_PAR_ETF}
            fond="clair"
            barre
            sizes="(min-width: 768px) 720px, calc(100vw - 32px)"
          />
          <p className="mt-2 text-xs text-gray-500">
            L&apos;onglet Par ETF (Cockpit et modèle gratuit). Achats fictifs&nbsp;; cours&nbsp;: clôtures du{" "}
            {DATE_CAPTURE} sur Euronext Paris. À remplacer par vos données.
          </p>
        </div>
      </section>

      {/* ── 5. TRI ───────────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 id="tri" className="scroll-mt-24 text-2xl font-bold text-gray-900 mb-4">
          Le rendement annualisé&nbsp;: TRI.PAIEMENTS (XIRR)
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Dans l&apos;exemple, la plus-value est de {pc(TOTAL.perf)}. Ce chiffre ne dit rien du temps&nbsp;:
            les {NB_ACHATS}&nbsp;achats se sont étalés sur plus de deux ans, et une partie de l&apos;argent
            n&apos;est investie que depuis quelques mois. Le{" "}
            <Link href="/glossaire/tri" className={lien}>taux de rendement interne (TRI)</Link> en tient
            compte&nbsp;: sur ces achats fictifs aux cours réels, à la date de la capture ({DATE_CAPTURE}), il
            est de <strong className="text-gray-900">{pc(TRI)} par an</strong>, un chiffre passé, propre à ces
            dates et à ces quantités.
          </p>
          <p>
            Dans le tableur, la fonction s&apos;appelle TRI.PAIEMENTS en français et XIRR en anglais, dans Excel
            comme dans Google Sheets (selon la langue des fonctions). Elle prend deux colonnes&nbsp;: les flux et
            leurs dates. Chaque achat y figure en négatif (l&apos;argent sort de votre poche), et une dernière
            ligne porte la valeur du portefeuille en positif, à la date du jour&nbsp;:
          </p>
          <code className={code}>{`=TRI.PAIEMENTS(I9:I${9 + NB_ACHATS};H9:H${9 + NB_ACHATS})`}</code>
          <p className="text-sm text-gray-500">
            Ici, les {NB_ACHATS}&nbsp;achats occupent les lignes 9 à {8 + NB_ACHATS}, et la valeur du jour la
            ligne {9 + NB_ACHATS}.
          </p>
          <p>
            <strong className="text-gray-900">Le piège&nbsp;:</strong> une plage qui commence par des lignes
            vides, comptées comme des flux nuls. Dans les versions de notre classeur antérieures à la 2.0
            (vendues jusqu&apos;au 1er octobre 2026), Excel affichait alors 0,0&nbsp;%&nbsp;: c&apos;est consigné
            dans notre <Link href="/changelog" className={lien}>journal des changements</Link>. La plage doit
            commencer au premier achat. Le modèle gratuit ne calcule pas le TRI&nbsp;: ces deux colonnes
            s&apos;y ajoutent à côté du journal.
          </p>
        </div>
        <div className="mt-6">
          <Fenetre
            capture={CAPTURE_DASHBOARD}
            fond="clair"
            barre
            sizes="(min-width: 768px) 720px, calc(100vw - 32px)"
            largeur={640}
          />
          <p className="mt-2 text-xs text-gray-500 text-center">
            Le Dashboard du Cockpit&nbsp;: plus-value et TRI côte à côte. Capture du {DATE_CAPTURE}&nbsp;;
            achats fictifs, cours réels.
          </p>
        </div>
      </section>

      {/* ── 6. PEA ───────────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 id="plafond-et-5-ans" className="scroll-mt-24 text-2xl font-bold text-gray-900 mb-4">
          La feuille PEA&nbsp;: plafond, 5&nbsp;ans, prélèvements sociaux
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            <strong className="text-gray-900">Le plafond se compte en versements</strong>, pas en valeur&nbsp;:
            {" "}{PLAFOND} d&apos;argent déposé sur le plan, plus-values non comprises. Additionner les achats du
            journal en donne une bonne mesure&nbsp;; si des liquidités dorment sur le plan, c&apos;est le total
            de vos dépôts qu&apos;il faut retenir. Dans l&apos;exemple, {eur(TOTAL.investi)} de versements
            utilisent <strong className="text-gray-900">{pc(PLAFOND_UTILISE)}</strong> du plafond.
          </p>
          <p>
            <strong className="text-gray-900">Les 5&nbsp;ans partent du premier versement</strong>, qui fixe la
            date d&apos;ouverture du plan. Premier versement le {OUVERTURE}&nbsp;: le cap des 5&nbsp;ans tombe le{" "}
            {CINQ_ANS}.
          </p>
          <p>
            <strong className="text-gray-900">Les prélèvements sociaux</strong>, {PS} sur les gains d&apos;un
            retrait fait en 2026, s&apos;estiment sur la plus-value&nbsp;: {eur(TOTAL.plusValue)} × {PS} ={" "}
            {eur(PS_ESTIMES)} dans l&apos;exemple. Le taux et ses dates sont détaillés sur notre page{" "}
            <Link href="/fiscalite-pea-cto-2026" className={lien}>fiscalité du PEA et du CTO en 2026</Link>.
          </p>
        </div>
        <div className="mt-6">
          <Fenetre
            capture={CAPTURE_PEA}
            fond="clair"
            barre
            sizes="(min-width: 768px) 720px, calc(100vw - 32px)"
            largeur={600}
          />
          <p className="mt-2 text-xs text-gray-500 text-center">
            L&apos;onglet PEA du Cockpit. Les compteurs dépendent de la date&nbsp;: capture du {DATE_CAPTURE}.
          </p>
        </div>
      </section>

      {/* ── 7. Versement du mois ─────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 id="versement-du-mois" className="scroll-mt-24 text-2xl font-bold text-gray-900 mb-4">
          Le versement du mois&nbsp;: où mettre vos prochains euros
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Plutôt que de vendre ce qui a monté, on dirige chaque versement vers les ETF passés sous leur
            cible&nbsp;: c&apos;est le{" "}
            <Link href="/glossaire/rebalancing" className={lien}>rééquilibrage par les versements</Link>. Le
            calcul se fait sur l&apos;allocation que vous avez fixée&nbsp;: ce n&apos;est pas un conseil.
          </p>
          <p>
            Dans l&apos;exemple, {eur(VERSEMENT)} à verser sur un portefeuille de {eur(TOTAL.valeur)}, qui
            vaudra donc {eur(V.totalApres)}. Pour chaque ETF&nbsp;: la cible après versement, ce qui manque pour
            l&apos;atteindre, la part du versement au prorata de ces manques, puis le nombre de parts entières
            que cela achète au cours du jour.
          </p>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200/70">
          <table className="w-full text-xs sm:text-sm">
            <caption className="sr-only">Répartition d&apos;un versement de {VERSEMENT} euros dans l&apos;exemple</caption>
            <thead className="bg-slate-50 text-gray-600">
              <tr>
                <th scope="col" className="px-2.5 sm:px-4 py-3 text-left font-semibold">ETF</th>
                <th scope="col" className="px-2.5 sm:px-4 py-3 text-right font-semibold">Cible après versement</th>
                <th scope="col" className="px-2.5 sm:px-4 py-3 text-right font-semibold">Manque</th>
                <th scope="col" className="px-2.5 sm:px-4 py-3 text-right font-semibold">Part du versement</th>
                <th scope="col" className="px-2.5 sm:px-4 py-3 text-right font-semibold">Parts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-gray-700">
              {V.lignes.map((l) => (
                <tr key={l.ticker}>
                  <th scope="row" className="px-2.5 sm:px-4 py-3 text-left font-semibold text-gray-900">
                    {l.ticker} <span className="font-normal text-gray-500">({pc(l.cible, 0)})</span>
                  </th>
                  <td className="px-2.5 sm:px-4 py-3 text-right tabular-nums whitespace-nowrap">{eur(l.cibleApres)}</td>
                  <td className="px-2.5 sm:px-4 py-3 text-right tabular-nums whitespace-nowrap">{l.manque > 0 ? eur(l.manque) : "aucun"}</td>
                  <td className="px-2.5 sm:px-4 py-3 text-right tabular-nums whitespace-nowrap">{eur(l.suggere)}</td>
                  <td className="px-2.5 sm:px-4 py-3 text-right tabular-nums font-semibold text-gray-900">{l.parts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
          <p>
            {V.lignes
              .filter((l) => l.parts > 0)
              .map((l) => `${l.parts} parts ${de(l.ticker)} à ${eur(l.cours)}, soit ${eur(l.arrondi)}`)
              .join(" ; ")}
            .{" "}
            {SANS_MANQUE.length > 0 && SANS_MANQUE.length < V.lignes.length ? (
              <>
                {SANS_MANQUE.join(" et ")}{" "}
                {SANS_MANQUE.length > 1 ? "restent au-dessus de leur cible" : "reste au-dessus de sa cible"} après
                versement&nbsp;: rien ne {SANS_MANQUE.length > 1 ? "leur" : "lui"} est attribué ce mois-ci.{" "}
              </>
            ) : null}
            Il reste {eur(V.reliquat)}, qui attendent en liquidités sur le PEA et s&apos;ajoutent au versement
            du mois suivant. Avec deux ou trois ETF, ce calcul suffit à garder la{" "}
            <Link href="/allocation-portefeuille" className={lien}>répartition que vous avez choisie</Link>{" "}
            sans jamais vendre.
          </p>
        </div>
        <div className="mt-6">
          <Fenetre
            capture={CAPTURE_VERSEMENT}
            fond="clair"
            barre
            sizes="(min-width: 768px) 720px, calc(100vw - 32px)"
          />
          <p className="mt-2 text-xs text-gray-500">
            L&apos;onglet Versement du mois du Cockpit, sur les mêmes chiffres (achats fictifs, cours réels).
          </p>
        </div>
      </section>

      {/* ── 8. Excel ou Google Sheets ────────────────────────────────────── */}
      <section className="mb-14">
        <h2 id="excel-ou-google-sheets" className="text-2xl font-bold text-gray-900 mb-4">Excel ou Google Sheets&nbsp;?</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <caption className="sr-only">Excel et Google Sheets pour suivre un PEA</caption>
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold"></th>
                <th scope="col" className="px-4 py-3 font-semibold">Excel</th>
                <th scope="col" className="px-4 py-3 font-semibold">Google Sheets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              <tr>
                <th scope="row" className="px-4 py-3 text-left font-semibold text-gray-900">Cours</th>
                <td className="px-4 py-3">
                  Saisis à la main dans nos fichiers, environ 2&nbsp;minutes par mois pour 3&nbsp;ETF (Excel pour
                  Microsoft&nbsp;365 a un type de données Actions, mais nos formules n&apos;en dépendent pas)
                </td>
                <td className="px-4 py-3">
                  Automatiques avec GOOGLEFINANCE, différés de 20&nbsp;min au plus&nbsp;; dans nos fichiers, tant
                  que la colonne du cours manuel reste vide
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 text-left font-semibold text-gray-900">Vos données</th>
                <td className="px-4 py-3">Dans un fichier, sur votre ordinateur</td>
                <td className="px-4 py-3">Dans votre Google Drive</td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 text-left font-semibold text-gray-900">Formules</th>
                <td className="px-4 py-3" colSpan={2}>Les mêmes&nbsp;: SOMME.SI.ENS (SUMIFS), TRI.PAIEMENTS (XIRR), SI (IF), SIERREUR (IFERROR), en français ou en anglais selon la langue des fonctions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 9. Un modèle gratuit suffit-il ? ─────────────────────────────── */}
      <section className="mb-14">
        <h2 id="modele-gratuit-suffit-il" className="text-2xl font-bold text-gray-900 mb-4">
          Un modèle gratuit vous suffit-il&nbsp;?
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Avec un seul ETF, oui, le plus souvent&nbsp;: il n&apos;y a pas de répartition à tenir, et le journal
            plus la vue par ETF disent l&apos;essentiel. Quel que soit le modèle, gratuit ou non, vérifiez quatre
            points&nbsp;:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>le PRU inclut les frais de courtage&nbsp;;</li>
            <li>le rendement est annualisé (TRI), pas une simple plus-value en pourcentage&nbsp;;</li>
            <li>le plafond se compte en versements, pas en valeur&nbsp;;</li>
            <li>la date des 5&nbsp;ans part du premier versement.</li>
          </ul>
          <p>Le nôtre&nbsp;: le journal et la vue par ETF du Cockpit, avec son mode d&apos;emploi.</p>
        </div>
        <div className="mt-5 rounded-2xl border border-primary-100 bg-primary-50/40 p-5">
          <p className="font-semibold text-gray-900">Recevoir le modèle gratuit</p>
          <ModeleGratuitForm source="suivi-pea-excel-bas" id="email-modele-bas" className="mt-3" />
        </div>
      </section>

      <RenvoiProduit
        produit="template-suivi-dca"
        contexte={
          "Le TRI, le versement du mois, le plafond et la date des 5 ans demandent chacun quelques formules de plus que le modèle gratuit, et autant de cas à vérifier."
        }
        className="mb-14"
      />

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 id="faq" className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <details key={item.id} id={item.id} className="group rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors list-none">
                {item.q}
                <span aria-hidden className="shrink-0 text-gray-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <p className="text-xs text-gray-500 leading-relaxed mb-10">
        Cette page décrit une méthode de suivi et des formules. Dans l&apos;exemple, les achats sont fictifs
        (quantités inventées) et les cours réels (clôtures d&apos;Euronext Paris), sur trois ETF pris pour la
        démonstration&nbsp;: la plus-value et le TRI de l&apos;exemple dépendent de ces quantités et de ces
        dates, ce sont des performances passées qui ne préjugent pas des performances futures, et le choix de
        ces ETF n&apos;est pas un conseil en investissement personnalisé. Investir comporte un risque de perte
        en capital.
      </p>

      <SourcesReferences
        intro="Règles du PEA, taux, fonctions des tableurs et cours de l'exemple cités sur cette page. Chaque source indique sa date de consultation."
        sources={[
          {
            label: "Plan d'épargne en actions (PEA)",
            url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2385",
            publisher: "service-public.gouv.fr",
            note: `Plafond de versement de ${PLAFOND} ; « La date d'ouverture du plan est celle du 1er versement. » Consultée le ${CONSULTE_LE}.`,
          },
          {
            label: "Loi n° 2025-1403 du 30 décembre 2025 de financement de la sécurité sociale pour 2026, article 12",
            url: "https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000053226452",
            publisher: "Légifrance",
            note: `Prélèvements sociaux portés à ${PS} sur les revenus de placement, dont les gains d'un PEA retirés depuis le 1er janvier 2026. Détail et autres sources : /fiscalite-pea-cto-2026.`,
          },
          {
            label: "GOOGLEFINANCE",
            url: "https://support.google.com/docs/answer/3093281?hl=fr",
            publisher: "Aide Éditeurs Google Docs",
            note: `Attribut « price » : cours en temps réel, différé de 20 minutes maximum. Consultée le ${CONSULTE_LE}.`,
          },
          {
            label: "Fonction TRI.PAIEMENTS",
            url: "https://support.microsoft.com/fr-fr/excel/functions/xirr-function",
            publisher: "Support Microsoft",
            note: `Au moins un flux positif et un flux négatif ; actualisation sur une année de 365 jours. Consultée le ${CONSULTE_LE}.`,
          },
          // 02/10/2026 : sources des cours de l'exemple (prix des achats et cours de Par ETF).
          {
            label: "Historique des cours de PE500 (FR0013412285), ETZ (FR0011550193) et PAEEM (FR0013412020)",
            url: "https://live.euronext.com/fr/product/etfs/FR0013412285-XPAR",
            publisher: "Euronext",
            note: `Clôture officielle (« Close ») sur Euronext Paris : prix des achats de l'exemple depuis le 3 octobre 2024 et cours du ${DATE_CAPTURE}. Pages d'ETZ et de PAEEM : même adresse avec leur ISIN. Le téléchargement ne remonte que deux ans. Consultée le ${COURS_CONSULTES_LE}.`,
          },
          {
            // 02/10/2026 : fr.finance.yahoo.com. L'adresse finance.yahoo.com de
            // ces trois tickers répond 404 (vérifié par curl le 02/10/2026) ;
            // la version française répond 200 et affiche bien l'ETF.
            label: "Historique des cours de PE500.PA, ETZ.PA et PAEEM.PA",
            url: "https://fr.finance.yahoo.com/quote/PE500.PA/history/",
            publisher: "Yahoo Finance",
            note: `Clôtures des achats de l'exemple avant le 3 octobre 2024 ; ensuite, recoupement d'Euronext (mêmes valeurs à toutes les dates d'achat). Consultée le ${COURS_CONSULTES_LE}.`,
          },
          {
            label: "Cours de PE500, ETZ et PAEEM",
            url: "https://www.boursorama.com/bourse/trackers/cours/1rTPE500/",
            publisher: "Boursorama",
            // 02/10/2026 : la cause des écarts n'est prouvée que depuis le
            // 03/10/2024 (à chaque écart, Boursorama = « Last » d'Euronext).
            // Avant, Euronext ne fournit pas l'historique : le plus grand écart
            // (0,28 %, PAEEM, 15/05/2024) reste sans explication vérifiée.
            note: `Recoupement à toutes les dates d'achat : écarts de 0,3 % au plus. Depuis le 3 octobre 2024, chaque écart vient de ce que Boursorama donne le dernier cours échangé, et non la clôture officielle ; avant, l'historique d'Euronext ne permet pas de le vérifier. Consultée le ${COURS_CONSULTES_LE}.`,
          },
        ]}
      />

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
