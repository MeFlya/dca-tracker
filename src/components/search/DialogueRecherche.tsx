"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  type KeyboardEvent as KeyboardEventReact,
  type MouseEvent as MouseEventReact,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
// Type seulement : le moteur (et MiniSearch) est chargé par import() à
// l'ouverture, jamais dans le bundle commun de l'en-tête.
import type { Moteur } from "@/lib/search/moteur";
import { enregistrerOuvreur } from "@/lib/search/ouvreur";
import { PAGES_SUGGEREES, RECHERCHES_EXEMPLES } from "@/lib/search/suggestions";
import type { Morceau } from "@/lib/search/types";
import { LONGUEUR_MAX_REQUETE } from "@/lib/search/limites";
import { cn } from "@/lib/utils";
import { Extrait } from "./Extrait";

/**
 * La fenêtre de recherche — toujours montée (fermée) par <RechercheRacine />.
 * Le moteur et l'index ne sont téléchargés qu'à la première ouverture (ou au
 * survol du bouton).
 *
 * Élément <dialog> natif : le navigateur gère la mise au premier plan, le
 * piège du focus, Échap et l'inertie du reste de la page. Plein écran sur
 * téléphone, fenêtre centrée en haut sur ordinateur. Clavier : ↑ ↓ pour
 * choisir, Entrée pour ouvrir, Échap pour fermer ; ⌘K / Ctrl+K ou « / »
 * l'ouvrent depuis n'importe quelle page.
 */

type Ligne = {
  cle: string;
  href: string;
  categorie: string;
  titre: string;
  /** Page du passage, affichée au-dessus quand le titre est celui d'une section. */
  page?: string;
  extrait: Morceau[];
};

export default function DialogueRecherche() {
  const router = useRouter();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLDivElement>(null);
  const idBase = useId();
  const idListe = `${idBase}-liste`;

  const [ouvert, setOuvert] = useState(false);
  const [q, setQ] = useState("");
  const [moteur, setMoteur] = useState<Moteur | null>(null);
  const [erreur, setErreur] = useState(false);
  const [essai, setEssai] = useState(0);
  const [actif, setActif] = useState(0);
  const requete = useDeferredValue(q).trim();

  const fermer = useCallback(() => {
    const d = dialogRef.current;
    if (d?.open) d.close();
    setOuvert(false);
  }, []);

  // Ouverture DANS le geste du lecteur (constat n° 39) : showModal() et le
  // focus sont faits ici, tout de suite, par le bouton ou le raccourci qui
  // appelle ouvrirRecherche() ; l'état React suit. iOS n'ouvre le clavier que
  // pour un focus donné pendant le toucher — pas de requestAnimationFrame ni
  // d'effet entre les deux. Enregistré en effet de mise en page pour être prêt
  // dès l'hydratation de l'en-tête.
  useLayoutEffect(
    () =>
      enregistrerOuvreur({
        ouvrir: (requeteInitiale) => {
          const d = dialogRef.current;
          const champ = inputRef.current;
          if (!d || !champ) return;
          if (!d.open) d.showModal();
          champ.focus();
          // Sans requête imposée, la précédente est sélectionnée : la frappe
          // la remplace.
          if (requeteInitiale === undefined) champ.select();
          else setQ(requeteInitiale);
          // La liste est remontée à chaque ouverture (rendue fenêtre ouverte
          // seulement) : on repart de la première option.
          setActif(0);
          setOuvert(true);
        },
        fermer,
        estOuverte: () => !!dialogRef.current?.open,
      }),
    [fermer],
  );

  // Un changement de page ferme la recherche.
  useEffect(() => {
    fermer();
  }, [pathname, fermer]);

  // Moteur et index, à la première ouverture. Le module du moteur est lui
  // aussi chargé ici (constat n° 14) : un échec — réseau coupé, chunk périmé
  // après un déploiement — tombe dans l'état d'erreur de la fenêtre au lieu
  // de remplacer toute la page par l'erreur globale de Next. « Réessayer »
  // relance l'import : webpack oublie un chunk en échec.
  useEffect(() => {
    if (!ouvert || moteur) return;
    let annule = false;
    setErreur(false);
    import("@/lib/search/moteur")
      .then((m) => m.chargerMoteur())
      .then((m) => {
        if (!annule) setMoteur(m);
      })
      .catch(() => {
        if (!annule) setErreur(true);
      });
    return () => {
      annule = true;
    };
  }, [ouvert, moteur, essai]);

  // Page figée derrière la fenêtre.
  useEffect(() => {
    if (!ouvert) return;
    const html = document.documentElement;
    const avant = { overflow: html.style.overflow, gouttiere: html.style.scrollbarGutter };
    // Barre de défilement classique (Windows, certains Linux, ~15 px) :
    // overflow hidden la retire, et toute la page glissait d'environ 8 px vers
    // la droite derrière le fond translucide, puis revenait à la fermeture
    // (constat n° 45). On réserve sa place le temps du verrou seulement — une
    // gouttière permanente laisserait une bande vide sur les pages courtes.
    if (window.innerWidth > html.clientWidth) html.style.scrollbarGutter = "stable";
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = avant.overflow;
      html.style.scrollbarGutter = avant.gouttiere;
    };
  }, [ouvert]);

  // Téléphone : hauteur de la zone réellement visible (constat n° 17). Le
  // clavier virtuel ne réduit que le viewport visuel (iOS Safari, Chrome
  // Android ≥ 108) et 100dvh n'en tient pas compte : le bas de la fenêtre —
  // « Tous les résultats » et les derniers résultats — restait sous le
  // clavier, sans moyen de le faire remonter. On suit visualViewport tant que
  // la fenêtre est ouverte ; offsetTop compense le décalage qu'iOS applique
  // quand il fait glisser la vue. Réglage limité à la fenêtre :
  // interactiveWidget="resizes-content" aurait redimensionné toutes les pages.
  useEffect(() => {
    const d = dialogRef.current;
    const vv = window.visualViewport;
    if (!ouvert || !d || !vv) return;
    const ajuster = () => {
      d.style.setProperty("--hauteur-visible", `${vv.height}px`);
      d.style.setProperty("--haut-visible", `${vv.offsetTop}px`);
    };
    ajuster();
    vv.addEventListener("resize", ajuster);
    vv.addEventListener("scroll", ajuster);
    return () => {
      vv.removeEventListener("resize", ajuster);
      vv.removeEventListener("scroll", ajuster);
      d.style.removeProperty("--hauteur-visible");
      d.style.removeProperty("--haut-visible");
    };
  }, [ouvert]);

  const lignes: Ligne[] = useMemo(() => {
    if (!requete) {
      return PAGES_SUGGEREES.map((p) => ({
        cle: p.href,
        href: p.href,
        categorie: "Page",
        titre: p.titre,
        extrait: [{ texte: p.sousTitre, surligne: false }],
      }));
    }
    if (!moteur) return [];
    return moteur.rechercher(requete, 8).map((r) => {
      const p = r.passages[0];
      return {
        cle: r.href,
        href: r.href,
        categorie: r.page.c,
        titre: p.titre || r.page.t,
        page: p.titre ? r.page.t : undefined,
        extrait: p.extrait,
      };
    });
  }, [requete, moteur]);

  // Nouvelle liste : première option active, liste revenue en haut.
  useEffect(() => {
    setActif(0);
    if (listeRef.current) listeRef.current.scrollTop = 0;
  }, [lignes]);

  const pageTousResultats = `/recherche?q=${encodeURIComponent(requete)}`;

  function aller(href: string) {
    fermer();
    const cible = new URL(href, window.location.href);
    if (cible.pathname === window.location.pathname && cible.hash) {
      // Même page : <AncresTitres /> fait défiler (constat n° 38).
      // Pas `location.hash = …` : l'entrée d'historique ainsi créée n'a pas
      // d'état, et le routeur de Next ignore le retour arrière vers elle (l'URL
      // change, la page affichée non). Le pushState remplacé par Next recopie
      // son état. Même ancre qu'actuellement : pas de nouvelle entrée, mais
      // l'événement est envoyé quand même — sinon, rien ne défile.
      const avant = window.location.href;
      if (cible.hash !== window.location.hash) window.history.pushState(null, "", cible.hash);
      window.dispatchEvent(
        new HashChangeEvent("hashchange", { oldURL: avant, newURL: window.location.href }),
      );
      return;
    }
    router.push(href);
  }

  /** Clic simple : navigation interne. Ctrl/⌘-clic ou clic milieu : laissé au navigateur. */
  function surClic(e: MouseEventReact<HTMLAnchorElement>, href: string) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    aller(href);
  }

  // Le défilement vers l'option active est réservé au clavier (constat n° 43) :
  // fait dans un effet, il suivait aussi le survol, et la liste sautait sous
  // le pointeur quand il passait sur un résultat à moitié visible.
  function deplacer(n: number) {
    setActif(n);
    document.getElementById(`${idBase}-opt-${n}`)?.scrollIntoView({ block: "nearest" });
  }

  function surTouche(e: KeyboardEventReact<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (lignes.length) deplacer((actif + 1) % lignes.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (lignes.length) deplacer((actif - 1 + lignes.length) % lignes.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (e.nativeEvent.isComposing) return;
      const ligne = lignes[actif];
      if (ligne) aller(ligne.href);
      else if (requete) aller(pageTousResultats);
    }
  }

  const chargement = !!requete && !moteur && !erreur;
  const aucun = !!requete && !!moteur && lignes.length === 0;
  // L'erreur d'abord (constat n° 41) : sans elle, un index indisponible était
  // annoncé « 0 résultat » alors que l'écran dit que la recherche n'a pas pu
  // se charger.
  const annonce = !requete
    ? ""
    : erreur
      ? "La recherche n'a pas pu se charger"
      : chargement
        ? "Chargement de la recherche"
        : aucun
          ? `Aucun résultat pour ${requete}`
          : `${lignes.length} résultat${lignes.length > 1 ? "s" : ""}`;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Rechercher sur le site"
      // Hors de l'index de recherche, par précaution (la fenêtre est dans
      // l'en-tête, que le script d'index ne lit pas).
      data-nosearch=""
      onClose={() => {
        // Échap ou fermeture native. L'événement arrive après coup : si la
        // fenêtre a été rouverte entre-temps, on ne touche à rien.
        if (!dialogRef.current?.open) setOuvert(false);
      }}
      // Un clic sur le fond (hors du panneau) ferme la recherche.
      onMouseDown={(e) => {
        if (e.target === dialogRef.current) fermer();
      }}
      className={cn(
        "m-0 h-[var(--hauteur-visible,100dvh)] max-h-none w-full max-w-none bg-white p-0 text-gray-900",
        "max-sm:top-[var(--haut-visible,0px)]",
        "open:flex open:flex-col",
        "backdrop:bg-slate-900/40 backdrop:backdrop-blur-[2px]",
        "sm:mx-auto sm:mb-auto sm:mt-[10vh] sm:h-auto sm:max-h-[min(40rem,80vh)]",
        "sm:w-[min(42rem,calc(100vw-2rem))] sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl",
      )}
    >
      {/* Toujours rendu, même fenêtre fermée : le champ doit exister au moment
          du geste qui ouvre, pour y placer le focus tout de suite. */}
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-100 px-3 sm:px-4"
      >
        <Search size={18} className="shrink-0 text-gray-400" aria-hidden />
        <input
          ref={inputRef}
          type="text"
          maxLength={LONGUEUR_MAX_REQUETE}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={surTouche}
          placeholder="ETF, frais, PEA, courtier, ISIN…"
          aria-label="Rechercher sur le site"
          role="combobox"
          aria-expanded={ouvert && lignes.length > 0}
          aria-controls={idListe}
          aria-autocomplete="list"
          aria-activedescendant={ouvert && lignes.length ? `${idBase}-opt-${actif}` : undefined}
          enterKeyHint="search"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
        />
        {chargement && <Loader2 size={16} className="shrink-0 animate-spin text-gray-400" aria-hidden />}
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Effacer la recherche"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={fermer}
          className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-primary-700 hover:bg-primary-50 sm:hidden"
        >
          Fermer
        </button>
        <button
          type="button"
          onClick={fermer}
          className="hidden shrink-0 items-center rounded-md border border-gray-200 px-1.5 py-0.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-50 sm:inline-flex"
          aria-label="Fermer la recherche"
        >
          Échap
        </button>
      </form>

      <p className="sr-only" aria-live="polite">
        {annonce}
      </p>

      {/* Le reste n'est rendu que fenêtre ouverte : inutile dans le HTML de
          chaque page. */}
      {ouvert && (
        <>
          <div ref={listeRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-3">
            {erreur && requete && (
              <div className="px-3 py-8 text-center text-sm text-gray-600">
                <p className="mb-3">La recherche n&apos;a pas pu se charger. Vérifiez votre connexion.</p>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErreur(false);
                      setEssai((n) => n + 1);
                    }}
                    className="btn-secondary px-4 py-2 text-xs"
                  >
                    Réessayer
                  </button>
                  {/* Lien ordinaire, sans navigation côté client : un
                      rechargement complet récupère aussi les fichiers d'un
                      déploiement plus récent que l'onglet. */}
                  <a href={pageTousResultats} className="text-xs font-medium text-primary-700 hover:underline">
                    Ouvrir la page de recherche
                  </a>
                </div>
              </div>
            )}

            {chargement && (
              <p className="px-3 py-8 text-center text-sm text-gray-500">Chargement de la recherche…</p>
            )}

            {!requete && (
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Les plus consultées
              </p>
            )}

            {lignes.length > 0 && (
              <ul id={idListe} role="listbox" aria-label={requete ? "Résultats" : "Pages suggérées"}>
                {lignes.map((l, i) => (
                  <li key={l.cle} id={`${idBase}-opt-${i}`} role="option" aria-selected={i === actif}>
                    <a
                      href={l.href}
                      tabIndex={-1}
                      onClick={(e) => surClic(e, l.href)}
                      onMouseMove={() => i !== actif && setActif(i)}
                      className={cn(
                        "block rounded-xl px-3 py-2.5 transition-colors",
                        i === actif ? "bg-primary-50" : "hover:bg-gray-50",
                      )}
                    >
                      {requete && (
                        <span className="mb-0.5 flex min-w-0 items-center gap-2 text-[11px] font-medium text-gray-500">
                          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">{l.categorie}</span>
                          {l.page && <span className="truncate">{l.page}</span>}
                        </span>
                      )}
                      <span className="line-clamp-2 block text-sm font-semibold leading-snug text-gray-900">{l.titre}</span>
                      {l.extrait.length > 0 && (
                        <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-gray-600">
                          <Extrait morceaux={l.extrait} />
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {aucun && (
              <div className="px-3 py-6 text-sm text-gray-600">
                <p className="mb-1 font-semibold text-gray-900">Aucun résultat pour « {requete} ».</p>
                <p>
                  Essayez un mot plus court ou plus courant : un ticker (WPEA), un courtier, un terme
                  (plafond, frais, fiscalité).
                </p>
              </div>
            )}

            {(!requete || aucun) && (
              <div className="px-3 pb-2 pt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Essayez</p>
                <div className="flex flex-wrap gap-2">
                  {RECHERCHES_EXEMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => {
                        setQ(ex);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {requete && (
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 px-4 py-2.5 text-xs text-gray-500">
              <a
                href={pageTousResultats}
                onClick={(e) => surClic(e, pageTousResultats)}
                className="inline-flex min-w-0 items-center gap-1 font-medium text-primary-700 hover:underline"
              >
                <span className="truncate">Tous les résultats pour « {requete} »</span>
                <ArrowRight size={12} className="shrink-0" aria-hidden />
              </a>
              <span className="hidden shrink-0 items-center gap-3 sm:flex" aria-hidden>
                <span>
                  <kbd className="rounded border border-gray-200 px-1">↑</kbd>{" "}
                  <kbd className="rounded border border-gray-200 px-1">↓</kbd> choisir
                </span>
                <span>
                  <kbd className="rounded border border-gray-200 px-1">↵</kbd> ouvrir
                </span>
              </span>
            </div>
          )}
        </>
      )}
    </dialog>
  );
}
