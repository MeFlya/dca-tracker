// Fond des sections sombres des pages Ressources : la texture de points et
// les deux halos de /tarifs, aux mêmes valeurs (pas de filtre blur, donc
// peu coûteux). À poser dans un conteneur `relative overflow-hidden` opaque
// (bg-slate-950) : c'est cette opacité qui masque la grille et les taches de
// l'AmbientBackground du layout, la cause principale du rendu « gabarit »
// relevé le 01/10/2026.
//
// /tarifs garde son propre code : on ne la touche pas.

export function FondSombre({
  maille = 24,
  halos = true,
}: {
  /** Pas de la texture : 24 px pour une section, 20 px dans une carte. */
  maille?: 20 | 24;
  halos?: boolean;
}) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: `${maille}px ${maille}px`,
        }}
      />
      {halos && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              "radial-gradient(800px circle at 15% 20%, rgba(59, 130, 246, 0.18), transparent 55%)",
              "radial-gradient(900px circle at 85% 75%, rgba(99, 102, 241, 0.15), transparent 55%)",
            ].join(", "),
          }}
        />
      )}
    </>
  );
}
