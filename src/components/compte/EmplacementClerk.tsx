"use client";

// Emplacement d'un composant Clerk (connexion, inscription, menu du compte).
// La page ne rend qu'un <div> ; l'îlot (ClerkActif.tsx) y rend le composant
// par un portail, et le charge s'il ne l'était pas encore.
//
// `display: contents` : le <div> ne crée aucune boîte, le composant de Clerk
// se place dans la mise en page exactement comme lorsqu'il était rendu
// directement (élément flex dans l'en-tête, bloc dans les pages de connexion).

import dynamic from "next/dynamic";
import { useId, useLayoutEffect, useRef } from "react";
import { poserWidget, type WidgetClerk } from "./etat-compte";

// Ne rend rien. Rendu côté serveur — ce qui n'arrive qu'aux emplacements de
// /sign-in et /sign-up, celui de l'en-tête n'existant qu'une fois l'état du
// compte connu dans le navigateur —, il fait écrire par Next un préchargement
// du morceau de l'îlot dans le HTML de la page. Sans lui, ce morceau (57 Ko
// gzip) ne partait qu'après le JavaScript de la page : formulaire affiché
// 0,5 s plus tard en mobile bridé (mesuré le 04/10/2026). Même nom de morceau
// que dans IlotClerk.tsx, pour précharger exactement les fichiers chargés.
const PrechargementIlot = dynamic(() =>
  import(/* webpackChunkName: "clerk-ilot" */ "./ClerkActif").then(() => () => null),
);

export function EmplacementClerk({ widget }: { widget: WidgetClerk }) {
  const id = useId();
  const noeud = useRef<HTMLDivElement>(null);
  // Comparé par valeur : un objet écrit en ligne change à chaque rendu.
  const cle = JSON.stringify(widget);

  // Effet de mise en page : le portail est rendu avant que le navigateur ne
  // peigne l'emplacement vide.
  useLayoutEffect(() => {
    if (!noeud.current) return;
    return poserWidget(id, noeud.current, JSON.parse(cle) as WidgetClerk);
  }, [id, cle]);

  return (
    <>
      <div ref={noeud} className="contents" />
      <PrechargementIlot />
    </>
  );
}
