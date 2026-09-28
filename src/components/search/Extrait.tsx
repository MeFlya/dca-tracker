import type { Morceau } from "@/lib/search/types";

/**
 * Extrait avec les mots trouvés surlignés. Rendu morceau par morceau, jamais
 * en HTML brut : le texte vient de l'index, il n'est pas interprété.
 */
export function Extrait({ morceaux }: { morceaux: Morceau[] }) {
  return (
    <>
      {morceaux.map((m, i) =>
        m.surligne ? (
          <mark key={i} className="bg-amber-100 text-gray-900 rounded-sm px-0.5 -mx-0.5">
            {m.texte}
          </mark>
        ) : (
          <span key={i}>{m.texte}</span>
        ),
      )}
    </>
  );
}
