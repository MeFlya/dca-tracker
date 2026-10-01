"use client";

// Visite du classeur, un onglet à la fois (modèle Aspire Budgeting : un
// onglet, une capture lisible, une légende chiffrée).
//
// Les panneaux sont rendus côté serveur et TOUS présents dans le HTML : les
// inactifs portent `hidden`, donc leur texte est lu par les moteurs, et leurs
// images (lazy) ne se chargent qu'à l'affichage. Sans JavaScript, seul le
// panneau par défaut se voit : les autres onglets restent décrits dans la
// liste « Huit onglets », et un lien `#onglet-x` n'y fait que défiler.
//
// Accessibilité : motif « tabs » de l'APG (tablist / tab / tabpanel, focus
// itinérant, flèches gauche-droite, Début, Fin). Un lien `#onglet-<id>`
// (cartes « Les huit onglets ») active l'onglet visé. Les panneaux ne sont
// pas des arrêts de tabulation : ils contiennent déjà des liens (zoom).

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type OngletVisite = { id: string; libelle: string; contenu: ReactNode };

export function VisiteOnglets({
  onglets,
  actifParDefaut,
}: {
  onglets: OngletVisite[];
  actifParDefaut: string;
}) {
  const [actif, setActif] = useState(
    onglets.some((o) => o.id === actifParDefaut) ? actifParDefaut : onglets[0]?.id,
  );
  const boutons = useRef<Record<string, HTMLButtonElement | null>>({});

  const activerDepuisAncre = useCallback(() => {
    const id = window.location.hash.replace(/^#onglet-/, "");
    if (id && onglets.some((o) => o.id === id)) setActif(id);
  }, [onglets]);

  useEffect(() => {
    activerDepuisAncre();
    window.addEventListener("hashchange", activerDepuisAncre);
    return () => window.removeEventListener("hashchange", activerDepuisAncre);
  }, [activerDepuisAncre]);

  function clavier(e: KeyboardEvent<HTMLDivElement>) {
    const i = onglets.findIndex((o) => o.id === actif);
    let cible: number | null = null;
    if (e.key === "ArrowRight") cible = (i + 1) % onglets.length;
    else if (e.key === "ArrowLeft") cible = (i - 1 + onglets.length) % onglets.length;
    else if (e.key === "Home") cible = 0;
    else if (e.key === "End") cible = onglets.length - 1;
    if (cible === null) return;
    e.preventDefault();
    const id = onglets[cible].id;
    setActif(id);
    boutons.current[id]?.focus();
  }

  // Sous 640 px, la liste d'onglets défile : un fondu à droite montre qu'elle
  // continue (pr-10 : le dernier onglet sort du fondu en fin de course).
  return (
    <div>
      <div
        role="tablist"
        aria-label="Onglets du classeur"
        onKeyDown={clavier}
        className="-mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-2 pr-10 [mask-image:linear-gradient(to_right,black_calc(100%_-_3rem),transparent)] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0 sm:[mask-image:none]"
      >
        {onglets.map((o) => {
          const estActif = o.id === actif;
          return (
            <button
              key={o.id}
              ref={(el) => {
                boutons.current[o.id] = el;
              }}
              id={`onglet-${o.id}`}
              type="button"
              role="tab"
              aria-selected={estActif}
              aria-controls={`panneau-${o.id}`}
              tabIndex={estActif ? 0 : -1}
              onClick={() => setActif(o.id)}
              className={`min-h-[44px] shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                estActif
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-gray-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {o.libelle}
            </button>
          );
        })}
      </div>
      {onglets.map((o) => (
        <div
          key={o.id}
          id={`panneau-${o.id}`}
          role="tabpanel"
          aria-labelledby={`onglet-${o.id}`}
          hidden={o.id !== actif}
          className="mt-6"
        >
          {o.contenu}
        </div>
      ))}
    </div>
  );
}
