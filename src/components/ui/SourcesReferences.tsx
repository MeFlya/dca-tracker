// Section "Sources & références" pour les pages YMYL (Your Money Your Life).
//
// Pourquoi : citer des sources externes faisant autorité (AMF, factsheets
// constructeurs ETF, service-public.fr, etc.) est le signal #1 d'E-E-A-T
// que Google demande sur les sujets financiers. Sans ça, on dit "j'écris
// sur la finance" mais on ne PROUVE pas qu'on s'appuie sur des sources
// reconnues.
//
// Choix techniques :
//   - dofollow par défaut (on VEUT passer du jus de lien vers ces autorités —
//     c'est ce qui prouve qu'on n'a rien à cacher). rel="noopener" pour la
//     sécurité, mais surtout PAS nofollow.
//   - target="_blank" pour ne pas faire sortir l'user du flow de lecture.
//   - JSON-LD non émis ici (Article schema déjà fait par ArticleByline).
//     Cette section est un signal HTML + UX, pas un schema-only.

import { ExternalLink } from "lucide-react";

export interface SourceItem {
  /** Titre de la source citée — ex: "AMF — Guide PEA 2024". */
  label: string;
  /** URL externe canonique. */
  url: string;
  /** Auteur/éditeur de la source — ex: "Autorité des marchés financiers". */
  publisher?: string;
  /** Précision optionnelle — type de doc, page, date de consultation. */
  note?: string;
}

interface Props {
  sources: SourceItem[];
  /** Titre du bloc — défaut "Sources & références". */
  heading?: string;
  /** Petit paragraphe sous le titre — défaut texte standard YMYL. */
  intro?: string;
}

export function SourcesReferences({
  sources,
  heading = "Sources & références",
  intro = "Cet article s'appuie sur des sources publiques faisant autorité. Les liens ci-dessous vous permettent de vérifier chaque affirmation.",
}: Props) {
  if (sources.length === 0) return null;

  return (
    <section
      className="mt-12 rounded-2xl border border-gray-200 bg-gray-50/60 p-6"
      aria-labelledby="sources-heading"
    >
      <h2
        id="sources-heading"
        className="text-lg font-bold text-gray-900 mb-2"
      >
        {heading}
      </h2>
      <p className="text-sm text-gray-600 mb-5">{intro}</p>

      <ol className="space-y-3 list-none m-0 p-0">
        {sources.map((src, i) => (
          <li
            key={src.url}
            className="flex gap-3 text-sm leading-relaxed"
          >
            <span className="shrink-0 w-6 text-xs font-mono text-gray-400 tabular-nums pt-0.5">
              [{i + 1}]
            </span>
            <span className="min-w-0 flex-1">
              <a
                href={src.url}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 font-medium text-gray-900 hover:text-primary-700 transition-colors underline-offset-2 hover:underline"
              >
                {src.label}
                <ExternalLink
                  size={11}
                  className="text-gray-400 shrink-0"
                  aria-hidden
                />
              </a>
              {src.publisher && (
                <span className="text-gray-500"> — {src.publisher}</span>
              )}
              {src.note && (
                <span className="block text-xs text-gray-500 mt-0.5">
                  {src.note}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>

      <p className="text-xs text-gray-500 mt-5 pt-4 border-t border-gray-200">
        Cette page est mise à jour régulièrement. Si une source semble obsolète
        ou erronée, signalez-le à{" "}
        <a
          href="mailto:hello@dcatracker.fr"
          className="underline hover:text-gray-600"
        >
          hello@dcatracker.fr
        </a>
        .
      </p>
    </section>
  );
}
