import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import type { ETFComparison, ETFSide, UseCase } from "@/lib/etf-comparisons";
import { ETF_COMPARISON_LIST, terLePlusBas } from "@/lib/etf-comparisons";
import { JsonLd } from "@/components/ui/JsonLd";
import { ArticleByline } from "@/components/ui/ArticleByline";
import { IssuerLogoMark } from "@/components/ui/IssuerLogoMark";
import { AuroraSweep } from "@/components/ui/AuroraSweep";

function PEAPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const positive = normalized.startsWith("oui");
  const negative = normalized.startsWith("non");
  const cls = positive
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : negative
    ? "bg-orange-50 text-orange-700 border-orange-200"
    : "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border ${cls}`}>
      PEA : {value}
    </span>
  );
}

function SideCard({ side, accent }: { side: ETFSide; accent: "left" | "right" }) {
  const border = accent === "left" ? "border-primary-200 bg-primary-50/30" : "border-amber-200 bg-amber-50/30";
  const labelColor = accent === "left" ? "text-primary-700" : "text-amber-700";

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
            {side.heading}
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

      <PEAPill value={side.peaEligible} />

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

      <p className="text-base text-gray-600 leading-relaxed mb-10">
        {comparison.intro}
      </p>

      {/* Verdict callout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-blue-700 p-6 mb-10 text-white">
        <AuroraSweep className="via-white/30" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary-200">
            Verdict en 2 phrases
          </p>
          <p className="text-base leading-relaxed">{comparison.verdict}</p>
        </div>
      </div>

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
      <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-10">
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
      <p className={`text-base text-gray-700 leading-relaxed ${comparison.slug === "cw8-vs-wpea" ? "mb-4" : "mb-10"}`}>
        {comparison.analysis}
      </p>
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
          relèverait du statut de conseiller en investissements financiers. */}
      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-6 text-center mb-10">
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
      <div className="pt-8 border-t border-gray-100">
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
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {c.left.heading} vs {c.right.heading}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {c.verdict}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Legal */}
      <p className="mt-10 text-[11px] text-gray-500 leading-relaxed">
        Cet article est fourni à titre informatif et ne constitue pas un conseil
        en investissement personnalisé. Les performances historiques ne préjugent
        pas des performances futures. TER et caractéristiques sont indicatifs et
        susceptibles d&apos;évoluer — vérifiez toujours les DICI/KID à jour chez
        l&apos;émetteur avant tout investissement.
      </p>
    </article>
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
