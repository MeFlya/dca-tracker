"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { basculerRecherche, ouvrirRecherche } from "@/lib/search/ouvreur";
import { cn } from "@/lib/utils";
import DialogueRecherche from "./DialogueRecherche";

/**
 * Recherche interne — le bouton de l'en-tête, les raccourcis clavier et la
 * fenêtre (toujours montée, fermée).
 *
 * La fenêtre est importée statiquement (28/09/2026). Chargée auparavant par
 * next/dynamic, elle posait deux problèmes :
 *  - un échec de chargement de son chunk (réseau coupé au premier appui,
 *    onglet ouvert avant un déploiement) remontait jusqu'au layout racine,
 *    faute de limite d'erreur : la page entière était remplacée par
 *    « Application error » (constat n° 14) ;
 *  - à la première ouverture, le rendu suspendu reprenait hors du geste du
 *    lecteur, et iOS n'ouvrait pas le clavier (constat n° 39).
 * Seuls le moteur (MiniSearch) et l'index (~110 Ko compressés) restent
 * chargés à la demande, par la fenêtre elle-même, dans un effet dont l'échec
 * affiche un état d'erreur avec « Réessayer ». Ils sont préchargés dès le
 * survol du bouton, pour que la première recherche soit instantanée.
 */

const MAC =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

function precharger() {
  // Un échec ici est sans conséquence : la fenêtre refera la demande à
  // l'ouverture et affichera l'erreur s'il le faut. Le .catch évite un rejet
  // non géré dans la console.
  import("@/lib/search/moteur")
    .then((m) => m.prechargerIndex())
    .catch(() => {});
}

/** Monté une seule fois, dans l'en-tête. */
export function RechercheRacine() {
  useEffect(() => {
    // Raccourcis : ils appellent l'ouvreur directement, dans le gestionnaire
    // de la touche (cf. src/lib/search/ouvreur.ts).
    const surTouche = (e: KeyboardEvent) => {
      // Chrome envoie des keydown sans `key` lors du remplissage automatique.
      if (typeof e.key !== "string") return;
      // ⌘K sur Mac, Ctrl+K ailleurs : ouvre ou ferme, partout. Pas Ctrl+K sur
      // Mac : c'est « effacer jusqu'à la fin de la ligne » dans les champs.
      const modificateur = MAC ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
      if (modificateur && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        basculerRecherche();
        return;
      }
      // « / » : ouvre, sauf pendant une saisie.
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const t = e.target as HTMLElement | null;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        e.preventDefault();
        ouvrirRecherche();
      }
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, []);

  return <DialogueRecherche />;
}

/**
 * Bouton d'ouverture. « large » : champ factice avec raccourci clavier
 * (grands écrans) ; « icone » : loupe seule (tablette, téléphone, connectés).
 */
export function BoutonRecherche({
  variante,
  className,
}: {
  variante: "large" | "icone";
  className?: string;
}) {
  const [raccourci, setRaccourci] = useState("");
  useEffect(() => {
    // Après le montage : le serveur ne sait pas quel clavier a le lecteur.
    const mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
    setRaccourci(mac ? "⌘K" : "Ctrl K");
  }, []);

  const commun = {
    type: "button" as const,
    // Si la fenêtre n'est pas montée (cas qui ne devrait pas arriver), la
    // page de recherche fait le même travail.
    onClick: () => {
      if (!ouvrirRecherche()) window.location.assign("/recherche");
    },
    onPointerEnter: precharger,
    onFocus: precharger,
    "aria-haspopup": "dialog" as const,
  };

  if (variante === "icone") {
    return (
      <button
        {...commun}
        aria-label="Rechercher sur le site"
        title="Rechercher"
        className={cn(
          "rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900",
          className,
        )}
      >
        <Search size={19} aria-hidden />
      </button>
    );
  }

  return (
    <button
      {...commun}
      aria-label="Rechercher sur le site"
      className={cn(
        "items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 py-1.5 pl-2.5 pr-1.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:bg-white hover:text-gray-700",
        className,
      )}
    >
      <Search size={15} aria-hidden />
      <span className="pr-6">Rechercher…</span>
      {/* Place réservée dès le rendu serveur (constat n° 42) : le raccourci
          n'est connu qu'après le montage, et son apparition élargissait le
          bouton d'environ 41 px, ce qui décalait la navigation centrale
          d'environ 20 px à l'hydratation. Largeur fixe w-11 (44 px) : « Ctrl K »
          en mesure 43,5 bordures comprises, « ⌘K » est centré dedans. */}
      <kbd
        aria-hidden
        className={cn(
          "inline-block w-11 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-center font-sans text-[11px] font-medium text-gray-500",
          !raccourci && "invisible",
        )}
      >
        {raccourci || "Ctrl K"}
      </kbd>
    </button>
  );
}
