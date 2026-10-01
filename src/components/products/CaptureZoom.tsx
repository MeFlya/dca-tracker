"use client";

// Zoom d'une capture produit.
//
// Sans JavaScript, c'est un simple lien vers le PNG (que les navigateurs
// mobiles laissent pincer). Avec JavaScript, le clic ouvre un <dialog> modal :
// Échap le ferme (comportement natif), comme un clic sur le fond ou le bouton
// « Fermer » (44 × 44 px), qui reçoit le focus à l'ouverture. Ce bouton est
// dans une barre AU-DESSUS de l'image, avec le nom de ce qu'on agrandit :
// posé sur l'image, il cachait le texte du coin haut droit (relecture DA du
// 01/10/2026). L'image n'est montée qu'à l'ouverture, donc rien n'est
// téléchargé tant qu'on ne zoome pas.
//
// Aucune pastille posée SUR l'image (elle masquait des montants, relecture du
// 01/10/2026) : l'indication « Agrandir » est dans la barre de la fenêtre
// (`entete`) ou sous le cadre (`sous`). Ces deux boutons doublent le lien de
// l'image pour la souris : hors tabulation et cachés aux lecteurs d'écran. Le
// lien de l'image reste l'unique arrêt clavier ; son focus se voit sur le
// cadre (`has-[a:focus-visible]`), que `overflow-hidden` ne rogne pas.
//
// Taille à l'ouverture :
// - « tableur » : `lecture` px CSS de large (corps de texte voisin d'un onglet
//   à l'autre), ramenée à la fenêtre sur ordinateur (aucun défilement
//   horizontal) ; sur téléphone, défilement horizontal à une échelle plus
//   petite, pour garder les chiffres lisibles ;
// - « page » (guide) : jusqu'à 900 px de large, défilement vertical ; sous
//   640 px, 720 px de large et défilement dans les deux sens : ramenée aux
//   360 px de l'écran, la page entière avait un texte d'environ 5,5 px, plus
//   petit que dans l'extrait qu'on venait de toucher.

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Maximize2, X } from "lucide-react";
import { typo } from "@/lib/typo";

/** Anneau de focus du cadre quand le lien de l'image a le focus clavier. */
/** Largeur d'une page du guide agrandie sur téléphone (texte d'environ 12 px). */
const PAGE_MOBILE = 720;

export const FOCUS_CADRE =
  "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary-400 has-[a:focus-visible]:ring-offset-2";

type Props = {
  src: string;
  width: number;
  height: number;
  alt: string;
  type: "tableur" | "page";
  /** Ce qu'on agrandit, pour le libellé accessible : « Agrandir : … ». */
  libelle: string;
  /** Tableur : largeur de lecture en px CSS (par défaut, 75 % de la largeur native). */
  lecture?: number;
  /** Classes du cadre (fenêtre) : la barre et l'image y sont posées. */
  cadre?: string;
  /** Contenu de la barre de titre, à gauche du bouton « Agrandir ». */
  entete?: ReactNode;
  /** Libellé d'un bouton texte aligné à droite sous le cadre. */
  sous?: string;
  /** Classes du lien de l'image. */
  className?: string;
  children: ReactNode;
};

export function CaptureZoom({
  src,
  width,
  height,
  alt,
  type,
  libelle,
  lecture,
  cadre,
  entete,
  sous,
  className = "",
  children,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const declencheurRef = useRef<HTMLAnchorElement>(null);
  const [largeurImage, setLargeurImage] = useState<number | null>(null);
  const ouvert = largeurImage !== null;

  /** Démonte l'image, rend le défilement et le focus au déclencheur. Idempotent. */
  const apresFermeture = useCallback(() => {
    setLargeurImage(null);
    declencheurRef.current?.focus();
  }, []);

  const fermer = useCallback(() => {
    dialogRef.current?.close();
    apresFermeture();
  }, [apresFermeture]);

  // Échap ferme le <dialog> nativement : on se branche sur son événement
  // « close » (natif, plus sûr que la prop onClose de React pour <dialog>).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.addEventListener("close", apresFermeture);
    return () => dialog.removeEventListener("close", apresFermeture);
  }, [apresFermeture]);

  useEffect(() => {
    if (!ouvert) return;
    const racine = document.documentElement;
    const avant = racine.style.overflow;
    racine.style.overflow = "hidden";
    return () => {
      racine.style.overflow = avant;
    };
  }, [ouvert]);

  function ouvrir(e: React.MouseEvent<HTMLElement>) {
    // Clic du milieu, Cmd/Ctrl + clic : on laisse le navigateur ouvrir le PNG.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const dialog = dialogRef.current;
    if (!dialog || typeof dialog.showModal !== "function") return;
    e.preventDefault();
    const vw = window.innerWidth;
    const base = lecture ?? Math.round(width * 0.75);
    setLargeurImage(
      type === "page"
        ? vw < 640
          ? PAGE_MOBILE
          : Math.min(900, Math.round(vw * 0.96))
        : vw < 640
          ? Math.round(base * 0.8)
          : Math.min(base, vw - 48),
    );
    dialog.showModal();
  }

  const lien = (
    <a
      ref={declencheurRef}
      href={src}
      onClick={ouvrir}
      aria-label={`Agrandir : ${libelle}`}
      className={`relative block cursor-zoom-in focus-visible:outline-none ${className}`}
    >
      {children}
    </a>
  );

  const boutonSouris = (texte: string, classes: string) => (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden
      onClick={ouvrir}
      className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${classes}`}
    >
      <Maximize2 size={12} strokeWidth={2.25} aria-hidden />
      {texte}
    </button>
  );

  return (
    <>
      {cadre ? (
        <div className={`${cadre} ${FOCUS_CADRE}`}>
          {entete && (
            <div className="flex h-9 items-center gap-3 border-b border-slate-200 bg-slate-50 px-4">
              <div aria-hidden className="flex min-w-0 flex-1 items-center gap-3">
                {entete}
              </div>
              {boutonSouris("Agrandir", "shrink-0 text-slate-500 hover:text-slate-900")}
            </div>
          )}
          {lien}
        </div>
      ) : (
        lien
      )}
      {sous && (
        <div className="mt-2 flex justify-end">
          {boutonSouris(sous, "text-gray-500 hover:text-gray-900")}
        </div>
      )}
      <dialog
        ref={dialogRef}
        aria-label={libelle}
        onClick={(e) => {
          // Un clic qui tombe sur le <dialog> lui-même (et pas sur son
          // contenu) est un clic sur le fond.
          if (e.target === e.currentTarget) fermer();
        }}
        style={largeurImage ? { width: `min(96vw, ${largeurImage}px)` } : undefined}
        className="m-auto max-h-[92vh] max-w-[96vw] overflow-hidden rounded-xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/80"
      >
        {ouvert && (
          <div className="flex max-h-[92vh] flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 pl-4 pr-1">
              <p aria-hidden className="min-w-0 truncate text-sm font-medium text-slate-600">
                {typo(libelle.charAt(0).toUpperCase() + libelle.slice(1))}
              </p>
              <button
                type="button"
                onClick={fermer}
                aria-label="Fermer"
                autoFocus
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                <X size={20} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 overflow-auto overscroll-contain">
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                sizes={`${largeurImage}px`}
                style={{ width: largeurImage }}
                className="block h-auto max-w-none"
              />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
