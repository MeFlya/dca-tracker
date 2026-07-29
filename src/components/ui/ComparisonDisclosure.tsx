// Bandeau d'information des pages de comparaison — art. D.111-7 II du code de
// la consommation, complété par le renvoi de l'art. D.111-6 II 2e alinéa.
//
// Le texte impose que ces trois informations figurent « en haut de chaque page
// de résultats de comparaison et avant le classement des offres, de manière
// lisible et compréhensible » :
//   1° le critère de classement utilisé par défaut ET sa définition, la
//      définition devant être indiquée à proximité du critère ;
//   2° le caractère exhaustif ou non des offres comparées et le nombre
//      d'entreprises référencées ;
//   3° le caractère payant ou non du référencement.
//
// D'où deux choix de rendu qui ne sont pas cosmétiques :
//   - le bloc se place AVANT la liste, jamais en pied de page ;
//   - il reste en gris lisible plutôt qu'en fine print à 11 px. « Lisible et
//     compréhensible » est le standard du texte, et un bandeau qu'on ne lit pas
//     ne remplit pas l'obligation.
//
// Le contenu est dérivé de comparison-disclosure.ts : les compteurs viennent
// des listes réelles, donc ils ne peuvent pas devenir faux en ajoutant un
// courtier ou un comparatif.

import Link from "next/link";
import {
  getComparisonSurface,
  REFERENCING_IS_PAID,
  RANKING_IS_PAID_INFLUENCED,
  type SurfaceKind,
} from "@/lib/comparison-disclosure";
import { cn } from "@/lib/utils";

interface Props {
  kind: SurfaceKind;
  className?: string;
}

export function ComparisonDisclosure({ kind, className }: Props) {
  const { criterion, count, countLabel } = getComparisonSurface(kind);

  return (
    <aside
      className={cn(
        "rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-600 leading-relaxed",
        className
      )}
      aria-label="Informations sur ce comparatif"
    >
      <p>
        <span className="font-semibold text-gray-900">
          Classement par {criterion.label}
        </span>{" "}
        — {criterion.definition}.{" "}
        <span className="text-gray-500">
          Comparaison non exhaustive, portant sur {count} {countLabel}.{" "}
          {REFERENCING_IS_PAID
            ? "Le référencement est payant."
            : "Le référencement est gratuit : aucun acteur ne peut payer pour figurer ici"}
          {!REFERENCING_IS_PAID &&
            (RANKING_IS_PAID_INFLUENCED ? ", " : " ni pour être mieux placé")}
          .{" "}
        </span>
        <Link
          href="/transparence"
          className="text-primary-600 hover:underline font-medium whitespace-nowrap"
        >
          Critères détaillés →
        </Link>
      </p>
    </aside>
  );
}
