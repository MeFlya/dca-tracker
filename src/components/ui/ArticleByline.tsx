// Signature d'auteur pour les pages éducatives (YMYL finance).
//
// Pourquoi : Google met systématiquement la barre plus haut sur les sujets
// "Your Money Your Life" (santé, finance). L'absence d'un auteur identifié
// + d'une date de mise à jour visible = signal "contenu peu fiable" qui
// pénalise l'indexation. C'est probablement une des causes des 35 pages
// "détectée non indexée" du site.
//
// Ce composant fait 2 choses :
// 1. Affiche un bandeau visible : "Par Maël Faleyras · MAJ XX/XX/2026 · X min"
//    → signal humain immédiat pour le lecteur (trust)
// 2. Injecte du JSON-LD Article avec author (référence au Person de /a-propos)
//    + datePublished + dateModified → signal machine pour Google E-E-A-T

import Link from "next/link";
import { Calendar, User, Clock } from "lucide-react";
import { JsonLd } from "@/components/ui/JsonLd";
import { cn } from "@/lib/utils";

interface Props {
  /** ISO 8601 — ex: "2026-04-29" */
  publishedAt: string;
  /** ISO 8601 — ex: "2026-05-25" (la plus récente édition de la page). */
  updatedAt: string;
  /** Temps de lecture estimé en minutes. Optionnel mais améliore l'UX. */
  readingMinutes?: number;
  /** URL canonique de l'article — pour le JSON-LD Article. */
  url: string;
  /** Titre de l'article (= H1) — pour le JSON-LD Article. */
  headline: string;
  /** Description courte (= meta description) — pour le JSON-LD Article. */
  description: string;
  className?: string;
}

const CANONICAL_ORIGIN = "https://dcatracker.fr";
const AUTHOR_ID = `${CANONICAL_ORIGIN}/a-propos#person`;

function formatFrDate(iso: string): string {
  // "2026-05-25" → "25 mai 2026"
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ArticleByline({
  publishedAt,
  updatedAt,
  readingMinutes,
  url,
  headline,
  description,
  className,
}: Props) {
  const fullUrl = url.startsWith("http") ? url : `${CANONICAL_ORIGIN}${url}`;

  // JSON-LD Article — référence Person de /a-propos via @id (pas duplication).
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: fullUrl,
    author: {
      "@type": "Person",
      "@id": AUTHOR_ID,
      name: "Maël Faleyras",
      url: `${CANONICAL_ORIGIN}/a-propos`,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${CANONICAL_ORIGIN}#organization`,
      name: "DCA Tracker",
      url: CANONICAL_ORIGIN,
    },
    datePublished: publishedAt,
    dateModified: updatedAt,
    inLanguage: "fr-FR",
  };

  return (
    <>
      <JsonLd data={articleSchema} />

      {/* Bandeau visible — discret mais identifiable */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-8",
          className
        )}
      >
        <Link
          href="/a-propos"
          className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
        >
          <User size={12} aria-hidden />
          <span>
            Par <strong className="font-semibold text-gray-700">Maël Faleyras</strong>
          </span>
        </Link>

        <span aria-hidden className="text-gray-300">·</span>

        <span className="flex items-center gap-1.5">
          <Calendar size={12} aria-hidden />
          <span>
            Mis à jour le{" "}
            <time dateTime={updatedAt}>{formatFrDate(updatedAt)}</time>
          </span>
        </span>

        {readingMinutes != null && (
          <>
            <span aria-hidden className="text-gray-300">·</span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} aria-hidden />
              <span>{readingMinutes} min de lecture</span>
            </span>
          </>
        )}
      </div>
    </>
  );
}
