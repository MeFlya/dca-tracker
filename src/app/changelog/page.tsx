// Page /changelog — journal public et daté des changements d'engagement.
//
// Elle existe d'abord pour une raison précise : l'engagement « aucun lien
// d'affiliation » a été retiré de /a-propos. Le supprimer sans trace aurait été
// la mauvaise manière de le faire, le dépôt étant public.
// Contenu dans src/lib/changelog.ts.

import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { CHANGELOG, type ChangelogEntry, type ChangelogKind } from "@/lib/changelog";

const TITLE = "Journal des changements — DCA Tracker";
const DESCRIPTION =
  "Chaque changement d'engagement ou de chiffre affiché sur DCA Tracker, daté et expliqué. Y compris les corrections qui ne m'arrangent pas.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/changelog" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/changelog",
    type: "article",
  },
};

const KIND_LABEL: Record<ChangelogKind, string> = {
  engagement: "Engagement",
  correction: "Correction",
  produit: "Produit",
};

const KIND_STYLE: Record<ChangelogKind, string> = {
  engagement: "bg-amber-50 text-amber-800 border-amber-200",
  correction: "bg-loss/10 text-loss-dark border-loss/20",
  produit: "bg-primary-50 text-primary-700 border-primary-200",
};

export default function ChangelogPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav
        aria-label="Fil d'ariane"
        className="flex items-center gap-2 text-sm text-gray-500 mb-8"
      >
        <Link href="/" className="hover:text-gray-600 transition-colors">
          Accueil
        </Link>
        <span aria-hidden>/</span>
        <span className="text-gray-600" aria-current="page">
          Journal des changements
        </span>
      </nav>

      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: "https://dcatracker.fr" },
          {
            name: "Journal des changements",
            url: "https://dcatracker.fr/changelog",
          },
        ]}
      />

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        Journal des changements
      </h1>
      <p className="text-lg text-gray-600 leading-relaxed mb-10">
        Quand un engagement pris ici change, ou quand un chiffre affiché était
        faux, c&apos;est écrit sur cette page, à la date où c&apos;est arrivé.
        Les changements qui ne m&apos;arrangent pas y figurent aussi — un
        journal qui n&apos;enregistre que les bonnes nouvelles ne vaut rien.
      </p>

      <ol className="space-y-8">
        {CHANGELOG.map((entry) => (
          <Entry key={`${entry.date}-${entry.title}`} entry={entry} />
        ))}
      </ol>

      <div className="mt-12 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-600 leading-relaxed">
        <p>
          Le détail du modèle économique est sur la page{" "}
          <Link
            href="/transparence"
            className="text-primary-600 hover:underline font-medium"
          >
            transparence
          </Link>
          , et les formules de calcul sur la page{" "}
          <Link
            href="/methodologie"
            className="text-primary-600 hover:underline font-medium"
          >
            méthodologie
          </Link>
          . Une erreur repérée ?{" "}
          <a
            href="mailto:contact@dcatracker.fr"
            className="text-primary-600 hover:underline font-medium"
          >
            contact@dcatracker.fr
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function Entry({ entry }: { entry: ChangelogEntry }) {
  return (
    <li className="border-l-2 border-gray-100 pl-5 sm:pl-6">
      <div className="flex flex-wrap items-center gap-2.5 mb-2">
        <time
          dateTime={entry.date}
          className="text-xs font-mono text-gray-500 tabular-nums"
        >
          {formatDate(entry.date)}
        </time>
        <span
          className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${KIND_STYLE[entry.kind]}`}
        >
          {KIND_LABEL[entry.kind]}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 leading-snug mb-2">
        {entry.title}
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed">{entry.body}</p>

      {entry.why && (
        <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Pourquoi
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">{entry.why}</p>
        </div>
      )}
    </li>
  );
}

/** "2026-07-28" → "28 juillet 2026". Format figé, indépendant de la locale du serveur. */
function formatDate(iso: string): string {
  const MONTHS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const [year, month, day] = iso.split("-");
  const name = MONTHS[Number(month) - 1];
  return name ? `${Number(day)} ${name} ${year}` : iso;
}
