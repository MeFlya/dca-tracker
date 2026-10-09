import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import type { ETFComparison, ETFSide, UseCase } from "@/lib/etf-comparisons";
import { ETF_COMPARISON_LIST, terLePlusBas } from "@/lib/etf-comparisons";
import { JsonLd } from "@/components/ui/JsonLd";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { IssuerLogoMark } from "@/components/ui/IssuerLogoMark";
import { AuroraSweep } from "@/components/ui/AuroraSweep";
import { RenvoiProduit } from "@/components/products/RenvoiProduit";
import { FICHE_ETF, FICHE_MSCI_WORLD, SOURCE_ENCOURS, type FicheCitee } from "@/lib/sources-etf";
import {
  FRAIS_ORDRE_ETF_PEA,
  GRILLES_CONSULTEES_LE,
  fraisOrdreEtf,
  gammeDeLEtf,
  type FraisOrdreEtfPea,
} from "@/lib/brokers";
import { HYPOTHESES_COMPARATIFS } from "@/lib/ecart-frais";
import {
  DATE_VERIFICATION_PEA,
  ETF_PEA_VERIFIES,
  URL_LISTE_PEA,
  ancreFonds,
  dateEnToutesLettres,
  lienListePea,
} from "@/lib/etf-pea-verifies";
import { getETFBySymbol } from "@/lib/etf-config";
import { getProduct } from "@/lib/products";
import { MODELE_GRATUIT_SHEETS_COPIE } from "@/lib/ressources-gratuites";
import { LienRenvoiProduit } from "@/components/products/LienRenvoiProduit";

// ─── Liens vers la suite du choix (09/10/2026) ───────────────────────────────
// Search Console au 09/10 : wpea-vs-dcam fait la moitié des clics du site
// depuis dix jours, et aucun comparatif ne liait la fiche des fonds comparés,
// la liste vérifiée des ETF éligibles au PEA ni le modèle de suivi gratuit.
// Les cibles sont CALCULÉES, jamais écrites `/etf/${ticker}` : ESE n'a pas de
// fiche (/etf/ESE = 404), et un fonds absent de la liste PEA n'y a pas de place.

/** Guides d'indice, pour les duels d'indices (MSCI World vs S&P 500). */
const GUIDE_INDICE: Record<string, string> = {
  "MSCI World": "/etf-msci-world",
  "S&P 500": "/etf-sp500",
};
/** Groupe de la liste vérifiée qui réunit les ETF éligibles de cet indice. */
const GROUPE_PEA_INDICE: Record<string, string> = {
  "MSCI World": `${URL_LISTE_PEA}#msci-world`,
  "S&P 500": `${URL_LISTE_PEA}#sp500`,
};

/** Page du site qui décrit ce côté du duel : fiche ETF ou guide d'indice. */
function pageDuCote(side: ETFSide): string | null {
  if (side.type === "Indice") return GUIDE_INDICE[side.heading] ?? null;
  const etf = getETFBySymbol(side.heading);
  return etf ? `/etf/${etf.displaySymbol}` : null;
}

/** Endroit de la liste vérifiée qui parle de ce côté du duel (ou rien). */
function lienPeaDuCote(side: ETFSide): string | null {
  if (side.type === "Indice") return GROUPE_PEA_INDICE[side.heading] ?? null;
  return lienListePea(side.heading);
}

const estEligibleVerifie = (symbole: string) => ETF_PEA_VERIFIES.some((f) => f.displaySymbol === symbole);
/** « de CW8 », « d'ESE ». */
const de = (nom: string) => (/^[AEIOUYH]/i.test(nom) ? `d'${nom}` : `de ${nom}`);

function PEAPill({ value, href }: { value: string; href?: string | null }) {
  const normalized = value.toLowerCase();
  const positive = normalized.startsWith("oui");
  const negative = normalized.startsWith("non");
  const cls = positive
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : negative
    ? "bg-orange-50 text-orange-700 border-orange-200"
    : "bg-gray-50 text-gray-700 border-gray-200";
  const pastille = `text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border ${cls}`;
  // 09/10/2026 : même patron que la pastille des fiches /etf/[symbol]. Le
  // texte ne change pas ; le lien mène à l'endroit de la liste vérifiée qui
  // parle de ce fonds (ou de cet indice). Sans place dans la liste, pas de lien.
  if (href) {
    return (
      <Link
        href={href}
        title="Liste vérifiée des ETF éligibles au PEA"
        className={`${pastille} inline-block transition-colors hover:border-current`}
      >
        PEA : {value}
      </Link>
    );
  }
  return <span className={pastille}>PEA : {value}</span>;
}

function SideCard({ side, accent }: { side: ETFSide; accent: "left" | "right" }) {
  const border = accent === "left" ? "border-primary-200 bg-primary-50/30" : "border-amber-200 bg-amber-50/30";
  const labelColor = accent === "left" ? "text-primary-700" : "text-amber-700";
  const page = pageDuCote(side);

  return (
    <div className={`rounded-2xl border-2 p-5 ${border}`}>
      <div className="flex items-start gap-3 mb-3">
        {side.issuer && (
          <IssuerLogoMark name={side.issuer} height={38} className="mt-0.5" />
        )}
        <div className="min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${labelColor}`}>
            {side.type}
          </p>
          <h3 className="text-lg font-bold text-gray-900 mb-0.5 leading-tight">
            {page ? (
              <Link
                href={page}
                className="text-gray-900 underline decoration-primary-300 decoration-2 underline-offset-4 transition-colors hover:text-primary-700 hover:decoration-primary-500"
              >
                {side.heading}
              </Link>
            ) : (
              side.heading
            )}
          </h3>
          {side.subheading && (
            <p className="text-xs text-gray-500">{side.subheading}</p>
          )}
        </div>
      </div>

      <dl className="space-y-1.5 text-sm mb-3">
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500 shrink-0">Couverture</dt>
          <dd className="text-gray-900 text-right">{side.coverage}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">TER</dt>
          <dd className="text-gray-900 font-semibold tabular-nums text-right">{side.ter}</dd>
        </div>
        {side.replication && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Réplication</dt>
            <dd className="text-gray-900 text-right">{side.replication}</dd>
          </div>
        )}
        {side.distribution && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Distribution</dt>
            <dd className="text-gray-900 text-right">{side.distribution}</dd>
          </div>
        )}
        {side.currency && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Devise</dt>
            <dd className="text-gray-900 text-right">{side.currency}</dd>
          </div>
        )}
      </dl>

      <PEAPill value={side.peaEligible} href={lienPeaDuCote(side)} />

      <div className="mt-4 space-y-1.5 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          <strong className="text-emerald-700">Point fort :</strong> {side.strongPoint}
        </p>
        <p className="text-xs text-gray-500">
          <strong className="text-orange-700">Point faible :</strong> {side.weakPoint}
        </p>
      </div>
    </div>
  );
}

function UseCaseCard({ useCase, leftName, rightName }: { useCase: UseCase; leftName: string; rightName: string }) {
  const winnerLabel =
    useCase.winner === "both"
      ? "Les deux"
      : useCase.winner === "left"
      ? leftName
      : rightName;
  const winnerCls =
    useCase.winner === "both"
      ? "bg-primary-50 text-primary-700 border-primary-100"
      : useCase.winner === "left"
      ? "bg-primary-50 text-primary-700 border-primary-100"
      : "bg-amber-50 text-amber-800 border-amber-100";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
        <p className="text-sm font-semibold text-gray-900">{useCase.profile}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${winnerCls}`}>
          → {winnerLabel}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{useCase.explanation}</p>
    </div>
  );
}

export function ETFComparisonPage({ comparison }: { comparison: ETFComparison }) {
  const canonical = `/comparatif-etf/${comparison.slug}`;
  const terBas = terLePlusBas(comparison);
  const otherComparisons = ETF_COMPARISON_LIST.filter((c) => c.slug !== comparison.slug);

  // ─── Accroche du renvoi vers le guide (29/09/2026) ─────────────────────────
  // Ces pages font un tiers des clics du site (Search Console, 90 jours au
  // 28/09) et se terminaient sur le simulateur, sans chemin vers le guide.
  // L'accroche est construite à partir du duel pour convenir aux huit : qui
  // finit un comparatif a tranché la question de l'ETF (ou de l'indice, pour
  // MSCI World vs S&P 500).
  // Deux formes, lues dans `peaEligible` (30/09/2026). Quand les deux côtés
  // entrent dans un PEA, l'enveloppe et le courtier se choisissent avant le
  // duel. Quand un seul y entre (IWDA vs CW8, VWCE vs CW8, VWCE vs WPEA),
  // choisir l'ETF, c'est déjà choisir l'enveloppe : dire qu'elle se choisit
  // « avant » contredirait la page.
  // Aucun chiffre ni aucun nom de fonds de plus que ceux du duel : le reste de
  // la phrase décrit, il ne recommande rien.
  // Un indice prend l'article (« le MSCI World »), un ticker non (« WPEA »).
  const indices = comparison.left.type === "Indice";
  const nommer = (side: ETFSide) => (side.type === "Indice" ? `le ${side.heading}` : side.heading);
  const estPea = (side: ETFSide) => side.peaEligible.startsWith("Oui");
  const enveloppeEnJeu = estPea(comparison.left) !== estPea(comparison.right);
  const [enPea, horsPea] = estPea(comparison.left)
    ? [comparison.left, comparison.right]
    : [comparison.right, comparison.left];
  // ─── Sources et frais d'ordre (30/09/2026) ─────────────────────────────────
  // Relevé du 29/09/2026 : les pages que citent les assistants IA lient la
  // fiche de chaque fonds et nomment les courtiers. Les nôtres disaient
  // « vérifié » sans montrer où, et « le vrai départage est chez votre
  // courtier » sans dire ce qu'il coûte.
  // Fiches : seulement celles dont l'adresse exacte est connue (sources-etf.ts).
  const fiches = [comparison.left, comparison.right]
    .filter((side) => side.type === "ETF")
    .flatMap((side) => {
      const fiche = FICHE_ETF[side.heading];
      return fiche ? [{ symbole: side.heading, fiche }] : [];
    });
  const parleDuMsciWorld = [comparison.left, comparison.right].some(
    (side) => side.heading === "MSCI World" || side.coverage.startsWith("MSCI World"),
  );
  // 09/10/2026 : un duel qui déclare sa propre vérification (date, documents
  // de l'émetteur cités) l'affiche à la place de celle du 28/09/2026 ; ses
  // cellules d'encours portent leur source, la note justETF ne s'applique pas.
  // Les huit premiers duels n'ont pas ce champ : leur note ne change pas.
  const verif = comparison.verification;
  const aUnEncours = !verif && comparison.keyDifferences.some((row) => row.criterion === "Encours");
  // Tableau des frais d'ordre : seulement quand les deux côtés sont des ETF
  // éligibles au PEA. Face à un fonds hors PEA (IWDA, VWCE), l'ordre se passe
  // en compte-titres, où les trois grilles ne sont pas celles-là (pas de
  // plafond légal, autres bourses) : on ne les a pas relevées, on n'affiche rien.
  // 09/10/2026 : un duel peut écarter ce tableau (champ sansFraisOrdre),
  // quand la grille d'un courtier a changé depuis le relevé du 30/09/2026.
  const fraisOrdreVisibles =
    !comparison.sansFraisOrdre &&
    comparison.left.type === "ETF" &&
    estPea(comparison.left) &&
    estPea(comparison.right);
  const montantOrdre = HYPOTHESES_COMPARATIFS.monthlyAmount;

  const accrocheGuide = enveloppeEnJeu
    ? `Choisir entre ${nommer(comparison.left)} et ${nommer(comparison.right)}, c'est aussi choisir l'enveloppe\u00a0: ` +
      `${nommer(horsPea)} n'entre pas dans un PEA, ${nommer(enPea)} oui. ` +
      `Il reste le courtier, qui fixe le coût de chaque achat, puis le premier ordre et un rythme à tenir.`
    : `Choisir entre ${nommer(comparison.left)} et ${nommer(comparison.right)} règle la question ` +
      `${indices ? "de l'indice" : "de l'ETF"}. ` +
      `Deux choix se font avant elle\u00a0: l'enveloppe, qui fixe l'impôt, et le courtier, qui fixe le coût de chaque achat.`;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Le schema Article est émis par ArticleByline (author Person Maël +
          datePublished/dateModified) au lieu de l'ancien JsonLd Article
          anonyme, qui n'avait ni auteur identifié ni dates. Ces pages étaient
          la DERNIÈRE famille éditoriale à ne pas avoir été migrée le
          10/06/2026 — d'où l'absence de date dans les résultats de recherche
          alors que les guides d'indice et les fiches courtiers en affichent
          une. Deux schemas Article sur la même page se contrediraient : ne pas
          réintroduire celui-ci. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: comparison.faq.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
        <span aria-hidden>/</span>
        <Link href="/comparatif-etf" className="hover:text-gray-600 transition-colors">Comparatifs ETF</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600 truncate" aria-current="page">
          {comparison.left.heading} vs {comparison.right.heading}
        </span>
      </nav>

      {/* Hero */}
      <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">
        Comparatif ETF
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {comparison.title}
      </h1>

      <ArticleByline
        publishedAt={comparison.publishedAt}
        updatedAt={comparison.updatedAt}
        readingMinutes={6}
        url={canonical}
        headline={comparison.metaTitle}
        description={comparison.metaDescription}
      />

      {/* Verdict AVANT l'introduction (30/09/2026). Il arrivait au 100e mot,
          après un paragraphe de contexte : les pages que citent les assistants
          IA donnent la réponse d'abord. « Verdict en 2 phrases » devient
          « Verdict » : plusieurs en comptent trois ou quatre. */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-6 mb-8 text-white">
        <AuroraSweep className="via-white/30" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary-200">
            Verdict
          </p>
          <p className="text-base leading-relaxed">{comparison.verdict}</p>
        </div>
      </div>

      <p className="text-base text-gray-600 leading-relaxed mb-10">
        {comparison.intro}
      </p>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 relative">
        <SideCard side={comparison.left} accent="left" />
        <SideCard side={comparison.right} accent="right" />
        {/* VS divider */}
        <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-100 items-center justify-center text-gray-500 shadow-sm">
          <ArrowLeftRight size={14} />
        </div>
      </div>

      {/* Key differences table */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Différences clés point par point
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-3">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Critère</th>
              <th className="text-left px-4 py-3 font-semibold text-primary-700">{comparison.left.heading}</th>
              <th className="text-left px-4 py-3 font-semibold text-amber-700">{comparison.right.heading}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comparison.keyDifferences.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-4 py-3 text-gray-500">{row.criterion}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{row.leftValue}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{row.rightValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Date et sources de ce qui précède (30/09/2026). Hors recherche
          interne : c'est une note de méthode, pas un passage à trouver. */}
      {verif ? (
        <p data-nosearch="" className="mb-10 text-xs text-gray-500 leading-relaxed">
          ISIN, frais (TER) et{" "}
          <Link href={URL_LISTE_PEA} className="text-gray-600 underline underline-offset-2 hover:text-primary-700">
            éligibilité au PEA
          </Link>{" "}
          vérifiés le {dateEnToutesLettres(verif.le)} sur les documents {verif.aupres}, recoupés sur{" "}
          {verif.recoupeSur}. Sources&nbsp;:{" "}
          {verif.sources.map(({ symbole, fiche }, i) => (
            <span key={fiche.url}>
              {i > 0 && " · "}
              {symbole}, <LienSource fiche={fiche} />
            </span>
          ))}
          .
        </p>
      ) : (
      <p data-nosearch="" className="mb-10 text-xs text-gray-500 leading-relaxed">
        {comparison.left.type === "ETF" ? (
          <>
            ISIN, frais (TER) et{" "}
            <Link href={URL_LISTE_PEA} className="text-gray-600 underline underline-offset-2 hover:text-primary-700">
              éligibilité au PEA
            </Link>{" "}
            vérifiés le{" "}
          </>
        ) : (
          "Frais (TER) des ETF cités vérifiés le "
        )}
        {dateEnToutesLettres(DATE_VERIFICATION_PEA)} sur les documents des émetteurs, recoupés
        sur justETF, Boursorama et Euronext.
        {aUnEncours && <> {SOURCE_ENCOURS}</>}
        {(fiches.length > 0 || parleDuMsciWorld) && <> Sources&nbsp;: </>}
        {fiches.map(({ symbole, fiche }, i) => (
          <span key={symbole}>
            {i > 0 && " · "}
            {symbole}, <LienSource fiche={fiche} />
          </span>
        ))}
        {parleDuMsciWorld && (
          <>
            {fiches.length > 0 && " · "}
            <LienSource fiche={FICHE_MSCI_WORLD} />
          </>
        )}
        {(fiches.length > 0 || parleDuMsciWorld) && "."}
      </p>
      )}

      {fraisOrdreVisibles && (
        <FraisOrdreParCourtier
          montant={montantOrdre}
          gauche={comparison.left.heading}
          droite={comparison.right.heading}
        />
      )}

      {/* Use cases */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Lequel choisir selon votre profil ?
      </h2>
      <div className="space-y-3 mb-10">
        {comparison.useCases.map((uc, i) => (
          <UseCaseCard
            key={i}
            useCase={uc}
            leftName={comparison.left.heading}
            rightName={comparison.right.heading}
          />
        ))}
      </div>

      {/* Long-form analysis */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Analyse approfondie</h2>
      <p className={`text-base text-gray-700 leading-relaxed ${comparison.slug === "cw8-vs-wpea" || comparison.voirAussi ? "mb-4" : "mb-10"}`}>
        {comparison.analysis}
      </p>
      {/* Liens vers les duels voisins (09/10/2026), écrits par le duel
          lui-même : un texte d'ancre qui dit ce qu'on trouvera de l'autre
          côté. Liens sortants seulement ; les huit premiers duels n'ont pas
          ce champ et ne changent pas. */}
      {comparison.voirAussi && (
        <ul className="mb-10 space-y-2 text-base text-gray-700 leading-relaxed">
          {comparison.voirAussi.map((l) => (
            <li key={l.href}>
              {l.avant}{" "}
              <Link href={l.href} className="text-primary-700 font-medium hover:underline">
                {l.ancre}
              </Link>
              {l.apres ?? "."}
            </li>
          ))}
        </ul>
      )}
      {comparison.slug === "cw8-vs-wpea" && (
        <p className="text-base text-gray-700 leading-relaxed mb-10">
          Pour situer ce face-à-face dans l&apos;univers plus large des trackers
          disponibles aux investisseurs français, notre{" "}
          <Link href="/comparatif-etf" className="text-primary-700 font-medium hover:underline">
            vue d&apos;ensemble des comparatifs ETF
          </Link>
          {" "}met en regard les autres décisions classiques (MSCI World vs
          S&amp;P 500, VWCE vs CW8, IWDA vs CW8). Si vous cherchez plutôt une
          short-list opérationnelle de cinq trackers fréquemment retenus en
          PEA, le guide{" "}
          <Link href="/guide-5-etf-pea-premium" className="text-primary-700 font-medium hover:underline">
            5 ETF Premium pour PEA
          </Link>
          {" "}détaille critères de sélection et allocations types. Et avant de
          trancher entre CW8 et WPEA, vérifiez que le{" "}
          <Link href="/pea-ou-cto" className="text-primary-700 font-medium hover:underline">
            cadre fiscal du PEA
          </Link>
          {" "}est bien celui qui correspond à votre horizon : l&apos;arbitrage
          PEA vs CTO conditionne l&apos;intérêt réel de ces deux MSCI World.
        </p>
      )}

      {/* FAQ */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
      <div className="space-y-3 mb-10">
        {/* `open` par défaut, et une ancre par question.
            Les réponses étaient repliées : sur une page dont l'argument est
            « on vous donne la réponse », six réponses derrière un accordéon
            fermé sont une contradiction — quelqu'un qui arrive de la recherche
            veut lire, pas cliquer six fois.
            Le bénéfice technique vient en prime : Google ne propose de liens
            vers une section que si le contenu est « not hidden behind an
            expandable section », et ce sont les ANCRES qu'il suit, pas la
            forme interrogative des titres. On garde <details> — l'affordance
            de repli reste utile à la lecture, seul le défaut change. */}
        {comparison.faq.map(({ q, a }) => (
          <details
            key={q}
            id={ancre(q)}
            open
            className="group rounded-xl border border-gray-100 bg-white p-4 open:bg-gray-50/50"
          >
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-900">{q}</span>
              <span className="text-gray-500 group-open:rotate-180 transition-transform" aria-hidden>▾</span>
            </summary>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      {/* Renvoi vers le guide, après la FAQ (30/09/2026) : c'est la fin du
          contenu. Placé juste après l'analyse, il suivait sur cw8-vs-wpea un
          paragraphe qui cite déjà « le guide 5 ETF Premium pour PEA » —
          deux guides différents, l'un gratuit, l'autre payant, à une ligne
          d'écart. */}
      <RenvoiProduit produit="guide-demarrer-dca" contexte={accrocheGuide} className="mb-10" />

      <ApresLeChoix comparison={comparison} />

      {/* Étape suivante.
          Ce bloc terminait sur « Ouvrir le simulateur → » et un TER de 0,25 %
          qui n'était le TER d'aucun ETF de la page — un chiffre sans source
          sur un site qui vend la vérifiabilité.
          Quelqu'un qui finit cette page vient de choisir son ETF : l'étape
          utile n'est pas de rejouer une simulation générique, c'est de poser
          son plan et de pouvoir le suivre. On préremplit donc avec le TER
          RÉEL le plus bas du duel, et on mène à l'enregistrement, devenu
          gratuit le 29/07.
          Formulation neutre à dessein : on annonce un paramètre de calcul, pas
          un conseil d'achat — nommer un instrument comme recommandation
          relèverait du statut de conseiller en investissements financiers.
          data-nosearch sur ce bloc, « Autres comparatifs » et la mention
          légale (recherche interne, 28/09/2026) : sans titre h2/h3 à eux, ils
          se collaient à la dernière question de FAQ — « ESE vs PSP5 » ouvrait
          alors « Et en assurance-vie ? » sur cinq autres comparatifs. */}
      <div data-nosearch="" className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center mb-10">
        <p className="text-base font-bold text-gray-900 mb-2">
          {terBas != null
            ? "Passez du comparatif à votre plan"
            : "Chiffrez l'impact des frais sur 20 ans"}
        </p>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          {terBas != null ? (
            <>
              Le simulateur s&apos;ouvre avec {formatTer(terBas)} de frais — le
              TER le plus bas de ce comparatif. Ajustez votre montant, puis
              enregistrez votre plan pour pointer vos versements mois après
              mois. C&apos;est gratuit.
            </>
          ) : (
            <>
              Quelques dixièmes de point de frais changent le capital final sur
              vingt ans. Testez votre montant, puis enregistrez votre plan pour
              le suivre — c&apos;est gratuit.
            </>
          )}
        </p>
        <Link
          // Sans TER exploitable, on omet `fees` : le simulateur applique sa
          // propre valeur par défaut. Poser un nombre ici reviendrait à
          // réintroduire le 0,25 % qu'on vient de retirer.
          href={`/simulateur?monthly=200&years=20&return=7${terBas != null ? `&fees=${terBas}` : ""}`}
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          {terBas != null
            ? `Ouvrir avec ${formatTer(terBas)} de frais →`
            : "Ouvrir le simulateur →"}
        </Link>
      </div>

      {/* Other comparisons */}
      <div data-nosearch="" className="pt-8 border-t border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Autres comparatifs
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {otherComparisons.map((c) => (
            <Link
              key={c.slug}
              href={`/comparatif-etf/${c.slug}`}
              className="rounded-xl border border-gray-100 bg-white p-4 card-hover"
            >
              {/* ─── Le titre du duel, PAS son verdict ────────────────────
                  Cette carte affichait `c.verdict`. Comme le bloc est rendu au
                  pied de CHAQUE duel, la phrase qui répond à « cw8 vs wpea »
                  était donc publiée verbatim sur les huit pages de la grappe —
                  chacune devenant une correspondance littérale légitime pour
                  la requête. Ce n'est pas Google qui hésitait entre huit
                  pages : c'était huit pages qui contenaient la réponse.

                  Le hub avait le même défaut, corrigé le 04/08. Le corriger
                  là et pas ici, c'était corriger UN consommateur du champ et
                  pas le champ : la même forme d'échec que la série de données
                  réparée sans réparer le script qui la produit.

                  Une carte de navigation annonce où l'on va. La réponse est
                  sur la page qui la démontre, et nulle part ailleurs. */}
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {c.left.heading} vs {c.right.heading}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {c.title}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Legal */}
      <p data-nosearch="" className="mt-10 text-[11px] text-gray-500 leading-relaxed">
        Cet article est fourni à titre informatif et ne constitue pas un conseil
        en investissement personnalisé. Les performances historiques ne préjugent
        pas des performances futures. TER et caractéristiques sont indicatifs et
        susceptibles d&apos;évoluer — vérifiez toujours les DICI/KID à jour chez
        l&apos;émetteur avant tout investissement.
      </p>
    </article>
  );
}

/**
 * « Après le choix : vérifier, puis tenir vos achats dans un tableur »
 * (09/10/2026). Titre distinct du bloc simulateur qui suit (plan enregistré,
 * versements pointés) : ici, les pages à relire et un tableur.
 *
 * Qui finit un comparatif a choisi son ETF. La suite logique tenait en un
 * renvoi vers le guide et le simulateur ; il manquait la fiche des fonds,
 * leur statut PEA vérifié, et l'outil de suivi gratuit.
 *
 * Placé APRÈS la FAQ et le renvoi du guide, AVANT le bloc simulateur : rien
 * n'est inséré dans la zone de réponse (verdict en tête, intro, tableaux),
 * l'ordre des sections existantes ne bouge pas. Pas de h2 (le plan des titres
 * reste celui que Google connaît), data-nosearch comme les blocs voisins.
 *
 * Seule la première ligne varie selon le duel, et c'est voulu : les deux
 * suivantes sont identiques sur les huit pages, donc courtes et factuelles.
 * Textes repris de /suivi-pea-excel (modèle gratuit) et de products.ts
 * (Cockpit : versement du mois, prix, format). Aucun chiffre écrit ici.
 *
 * Exception assumée à « une page = un produit » (RenvoiProduit.tsx) : l'appel
 * principal est le modèle GRATUIT ; le Cockpit n'est qu'une phrase, sans
 * bouton, pour qui veut le versement du mois en parts entières.
 */
function ApresLeChoix({ comparison }: { comparison: ETFComparison }) {
  const cockpit = getProduct("template-suivi-dca");
  const cotes = [comparison.left, comparison.right];

  type Etape = { key: string; avant?: string; lien: string; href: string };
  const etapes: Etape[] = [];
  let precedente: "fiche" | "guide" | null = null;
  let peaCouvert = false;

  for (const side of cotes) {
    const page = pageDuCote(side);
    if (side.type === "Indice" && page) {
      etapes.push({
        key: `guide-${side.heading}`,
        lien: precedente === "guide" ? `celui du ${side.heading}` : `le guide du ${side.heading}`,
        href: page,
      });
      precedente = "guide";
    } else if (page) {
      etapes.push({
        key: `fiche-${side.heading}`,
        lien: precedente === "fiche" ? `celle ${de(side.heading)}` : `la fiche ${de(side.heading)}`,
        href: page,
      });
      precedente = "fiche";
    } else if (side.type === "ETF" && estEligibleVerifie(side.heading)) {
      // Pas de fiche (ESE) : sa ligne dans la liste vérifiée en tient lieu.
      etapes.push({
        key: `ligne-${side.heading}`,
        avant: `la ligne ${de(side.heading)} dans la `,
        lien: "liste vérifiée des ETF éligibles au PEA",
        href: `${URL_LISTE_PEA}#${ancreFonds(side.heading)}`,
      });
      precedente = null;
      peaCouvert = true;
    }
  }

  // Un fonds hors PEA : sa carte dans la liste dit pourquoi, et donne son
  // équivalent éligible. Sinon, la place des deux côtés dans la liste.
  const horsPea = cotes.filter(
    (side) => side.type === "ETF" && !estEligibleVerifie(side.heading) && lienListePea(side.heading),
  );
  for (const side of horsPea) {
    etapes.push({
      key: `hors-pea-${side.heading}`,
      lien: `pourquoi ${side.heading} n'entre pas dans un PEA`,
      href: lienListePea(side.heading)!,
    });
  }
  if (horsPea.length === 0 && !peaCouvert) {
    const liens = cotes.map(lienPeaDuCote);
    const commun = liens[0] && liens[0] === liens[1] ? liens[0] : URL_LISTE_PEA;
    etapes.push({
      key: "liste-pea",
      avant: comparison.left.type === "Indice" ? "les ETF de ces deux indices dans la " : "leur place dans la ",
      lien: "liste vérifiée des ETF éligibles au PEA",
      href: commun,
    });
  }

  return (
    <section
      data-nosearch=""
      aria-labelledby="apres-le-choix"
      className="rounded-2xl border border-gray-100 bg-white p-6 mb-10"
    >
      <p id="apres-le-choix" className="text-base font-bold text-gray-900 mb-3">
        Après le choix&nbsp;: vérifier, puis tenir vos achats dans un tableur
      </p>
      {etapes.length > 0 && (
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Pour vérifier&nbsp;:{" "}
          {etapes.map((e, i) => (
            <span key={e.key}>
              {i > 0 && (i === etapes.length - 1 ? " et " : ", ")}
              {e.avant}
              <Link href={e.href} className="text-primary-700 font-medium underline underline-offset-2 hover:text-primary-800">
                {e.lien}
              </Link>
            </span>
          ))}
          .
        </p>
      )}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Le modèle gratuit, reçu par email, réunit le journal des achats et la vue par ETF (PRU frais
        inclus, valeur, plus-value, poids), en{MODELE_GRATUIT_SHEETS_COPIE ? " Excel et Google\u00a0Sheets" : " Excel"}.
      </p>
      <Link href="/suivi-pea-excel#modele-gratuit" className="btn-secondary text-sm">
        Demander le modèle gratuit →
      </Link>
      {cockpit?.renvoi && (
        <p className="text-sm text-gray-500 leading-relaxed mt-4">
          Le{" "}
          <LienRenvoiProduit
            href={`/produits/${cockpit.slug}`}
            produitId={cockpit.id}
            className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800 transition-colors"
          >
            {cockpit.shortName}
          </LienRenvoiProduit>{" "}
          ({cockpit.priceEur}&nbsp;€, paiement unique) ajoute le versement du mois&nbsp;: la somme
          répartie en parts entières par ETF, vers l&apos;allocation que vous fixez, avec le TRI et la
          feuille PEA.
        </p>
      )}
    </section>
  );
}

/**
 * Lien vers une source externe. Même patron que <SourcesReferences /> :
 * nouvel onglet, `noopener`, et surtout pas de `nofollow` — citer une source,
 * c'est assumer le lien.
 */
function LienSource({ fiche }: { fiche: FicheCitee }) {
  return (
    <a
      href={fiche.url}
      target="_blank"
      rel="noopener"
      className="text-gray-600 underline underline-offset-2 hover:text-primary-700"
    >
      {fiche.libelle}
    </a>
  );
}

/**
 * Frais d'un ordre d'achat dans un PEA chez trois courtiers (30/09/2026).
 *
 * Le verdict de plusieurs duels renvoie au courtier ; ce tableau dit ce qu'il
 * coûte, grille officielle à l'appui. Il décrit, il ne classe pas : ordre
 * alphabétique (celui de FRAIS_ORDRE_ETF_PEA), pas de colonne « notre avis ».
 * Deux colonnes seulement, pour tenir à 375 px sans défilement.
 * Les montants sont calculés sur les règles de chaque grille, pour le
 * versement des hypothèses de la page : ils suivent si l'hypothèse change.
 */
function FraisOrdreParCourtier({
  montant,
  gauche,
  droite,
}: {
  montant: number;
  gauche: string;
  droite: string;
}) {
  // 30/09/2026 : l'introduction disait « coûte autant…, sauf offre réservée à
  // une gamme d'ETF » sans dire laquelle ni pour quel fonds — alors que WPEA
  // est dans la gamme Boursomarkets de BoursoBank et DCAM ou CW8 non. Elle
  // nomme désormais l'exception, calculée sur les gammes de brokers.ts, et le
  // tableau donne alors le frais de chaque ETF sur la ligne du courtier.
  const aUneException = (c: FraisOrdreEtfPea) =>
    Boolean(gammeDeLEtf(c, gauche)) !== Boolean(gammeDeLEtf(c, droite));
  const exceptions = FRAIS_ORDRE_ETF_PEA.filter(aUneException);
  const gammes = FRAIS_ORDRE_ETF_PEA.flatMap((c) => (c.gamme ? [{ courtier: c.nom, gamme: c.gamme }] : []));

  return (
    <section aria-labelledby="frais-ordre-courtier" className="mb-10">
      <h2 id="frais-ordre-courtier" className="text-xl font-bold text-gray-900 mb-2">
        Frais d&apos;un ordre sur ces ETF selon le courtier
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        {exceptions.length > 0 ? (
          <>
            Chez un même courtier, un ordre sur {gauche} coûte en général autant qu&apos;un ordre
            sur {droite}, sauf quand l&apos;un des deux fait partie d&apos;une gamme à frais réduits.
            {exceptions.map((c) => {
              const dedans = gammeDeLEtf(c, gauche) ? gauche : droite;
              const dehors = dedans === gauche ? droite : gauche;
              const gamme = gammeDeLEtf(c, dedans)!;
              return (
                <span key={c.slug}>
                  {" "}C&apos;est le cas chez {c.nom}&nbsp;: au {dateEnToutesLettres(gamme.constateLe)},{" "}
                  {dedans} fait partie de sa {gamme.nom}, {dehors} non.
                </span>
              );
            })}
          </>
        ) : (
          <>
            Pour un achat de {montant}&nbsp;€, un ordre sur {gauche} coûte autant qu&apos;un ordre
            sur {droite} chez chacun de ces courtiers
            {gammes.length > 0 && (
              <>
                &nbsp;: au {dateEnToutesLettres(gammes[0].gamme.constateLe)}, ni l&apos;un ni l&apos;autre
                ne fait partie de{" "}
                {gammes.map(({ courtier, gamme }, i) => (
                  <span key={courtier}>
                    {i > 0 && " ou de "}la {gamme.nom} de {courtier}
                  </span>
                ))}
              </>
            )}
            .
          </>
        )}{" "}
        Voici ce que coûte un achat de {montant}&nbsp;€
        dans un PEA, d&apos;après la grille officielle de chaque courtier, consultée le{" "}
        {dateEnToutesLettres(GRILLES_CONSULTEES_LE)}. Dans un PEA, la loi plafonne ces frais à
        0,5&nbsp;% du montant de l&apos;ordre (
        <a
          href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043790337"
          target="_blank"
          rel="noopener"
          className="underline underline-offset-2 hover:text-primary-700"
        >
          article D221-111-1 du code monétaire et financier
        </a>
        ).
      </p>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-500">Courtier</th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-500">
                Achat de {montant}&nbsp;€ en PEA
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {FRAIS_ORDRE_ETF_PEA.map((c) => (
              <tr key={c.slug}>
                <td className="px-4 py-3 align-top">
                  <Link href={`/comparatif/${c.slug}`} className="font-semibold text-gray-900 hover:text-primary-700">
                    {c.nom}
                  </Link>
                  <span className="block text-xs text-gray-500">{c.offre}</span>
                  <a
                    href={c.grille.url}
                    target="_blank"
                    rel="noopener"
                    className="block mt-1 text-xs text-gray-500 underline underline-offset-2 hover:text-primary-700"
                  >
                    {c.grille.libelle}
                  </a>
                </td>
                <td className="px-4 py-3 align-top">
                  {aUneException(c) ? (
                    // Un ETF du duel est dans la gamme, l'autre non : un frais par ETF.
                    [gauche, droite].map((symbole) => {
                      const gamme = gammeDeLEtf(c, symbole);
                      return (
                        <span key={symbole} className="block font-medium text-gray-900">
                          {symbole}&nbsp;: {fraisOrdreEtf(c, symbole, montant)}
                          {gamme && <span className="font-normal text-gray-500"> ({gamme.nom})</span>}
                        </span>
                      );
                    })
                  ) : (
                    <span className="font-medium text-gray-900">{fraisOrdreEtf(c, gauche, montant)}</span>
                  )}
                  <span className="block mt-1 text-xs text-gray-500 leading-relaxed">{c.precision}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Classés par ordre alphabétique. Hors écart entre prix d&apos;achat et de vente, et hors
        frais de l&apos;ETF (TER), déjà déduits de sa performance.
      </p>
    </section>
  );
}

/** 0.2 → « 0,20 % ». Virgule décimale et deux décimales, comme le reste du site. */
function formatTer(v: number): string {
  return `${v.toFixed(2).replace(".", ",")} %`;
}

/**
 * Ancre stable pour une question de FAQ. Sert de cible aux liens de section
 * que Google génère « completely algorithmically, based on page structure » —
 * sans ancre, un titre de question ne produit rien.
 * Volontairement déterministe : une ancre qui change casse les liens entrants.
 */
function ancre(question: string): string {
  return (
    "faq-" +
    question
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
  );
}
