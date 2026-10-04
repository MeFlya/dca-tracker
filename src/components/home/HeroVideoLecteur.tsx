"use client";

// Lecture d'une boucle muette (bandeau d'accueil, et depuis le 04/10/2026
// bandeau de la page du Cockpit), et fenêtre FACULTATIVE de la version avec le
// son (accueil seulement). Les fichiers sont passés par le composant serveur
// (HeroVideo.tsx, products/VideoCockpit.tsx), lus dans src/lib/video-accueil.ts.
// Reprend le comportement testé dans video-accueil/apercu.html :
//
// 1. La <video> n'a NI autoplay NI source dans le HTML. `autoplay` l'emporte
//    sur `preload` et ferait télécharger toute la boucle dès l'arrivée. Les
//    sources (WebM puis MP4) sont posées ici, après l'événement `load` de la
//    page, après son premier rendu ET quand le cadre est visible.
// 2. Moins d'animations demandées (prefers-reduced-motion) ou économiseur de
//    données : jamais de vidéo, l'affiche reste (elle porte l'information).
// 3. La boucle fait TOURS tours puis s'arrête sur sa dernière image, identique
//    à l'affiche. Le bouton devient « Revoir ».
// 4. Bouton pause (WCAG 2.2.2) : son état suit les événements de la vidéo, il
//    n'est jamais supposé. Lecture automatique refusée (iPhone en économie
//    d'énergie) : il propose « Lancer l'animation ». La boucle s'arrête hors
//    de l'écran et ne repart jamais d'elle-même si le visiteur l'a arrêtée.
//    « Moins d'animations » activé en cours de route : elle s'arrête et seul
//    un clic du visiteur peut la relancer. Si aucune source n'est lisible,
//    l'affiche reste seule, sans bouton.
// 5. (Seulement si `avecSon` est fourni.) La version avec le son ne charge
//    rien, pas même son affiche, avant le clic. Le clic lance la lecture avec le son (geste du visiteur). À la
//    fermeture, la vidéo est libérée (plus aucun téléchargement) et la boucle
//    ne reprend que si elle tournait.
//
// Mesure : le plan Hobby de Vercel n'enregistre pas les événements
// personnalisés (voir src/lib/analytics.ts). L'ouverture et la fin de la
// version avec le son sont donc comptées comme des pages vues fictives,
// /video/son-ouvert et /video/son-fini, que le tableau de bord affiche.

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { pageview } from "@vercel/analytics";

const TOURS = 3;

type Etat =
  | "affiche" // vidéo pas chargée (ou jamais : moins d'animations, économie de données, échec)
  | "lecture"
  | "pause"
  | "bloquee" // play() refusé par le navigateur
  | "finie"; // arrêtée sur sa dernière image après TOURS tours

const LIBELLES: Record<Exclude<Etat, "affiche">, string> = {
  lecture: "Mettre l'animation en pause",
  pause: "Reprendre l'animation",
  bloquee: "Lancer l'animation",
  finie: "Revoir l'animation",
};

function ajouterSource(video: HTMLVideoElement, src: string, type: string) {
  const source = document.createElement("source");
  source.src = src;
  source.type = type;
  video.appendChild(source);
  return source;
}

function moinsDAnimations() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Version avec le son, ouverte dans une fenêtre (accueil seulement). */
export type VideoAvecSon = {
  mp4: string;
  affiche: string;
  /** Durée affichée sur le lien, en secondes. */
  dureeSecondes: number;
  /** Équivalent textuel de la version avec le son (aucune voix, tout est écrit à l'image). */
  description: string;
};

/**
 * Mise en page du cadre, selon la page. « accueil » : classes d'origine,
 * inchangées. « produit » : bandeau sombre de la page du Cockpit, centré, et
 * bouton en HAUT à droite. En bas, sur l'image où la boucle s'arrête, il
 * couvre les mentions « Exemple pré-rempli » et « pas un conseil » (à gauche)
 * ou les touche dès 343 px de large (à droite) ; le coin haut-droit est vide
 * sur tous les plans (titre le plus large : x = 860 sur 1080).
 */
const VARIANTES = {
  accueil: {
    conteneur: "relative w-full max-w-md lg:max-w-[480px]",
    cadre:
      "relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-950 shadow-card-lg",
    coinBouton: "left-3 bottom-3",
  },
  produit: {
    conteneur: "relative mx-auto w-full max-w-[480px]",
    cadre: "relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-950 shadow-2xl ring-1 ring-white/10",
    coinBouton: "right-3 top-3",
  },
} as const;

export function HeroVideoLecteur({
  children,
  sources,
  avecSon,
  variante = "accueil",
}: {
  children: ReactNode;
  /** Boucle muette : WebM (VP9) d'abord, MP4 (H.264 High) en secours. */
  sources: { webm: string; mp4: string };
  /** Facultatif : sans lui, ni lien « Regarder avec le son » ni fenêtre. */
  avecSon?: VideoAvecSon;
  variante?: keyof typeof VARIANTES;
}) {
  const classes = VARIANTES[variante];
  const cadreRef = useRef<HTMLDivElement>(null);
  const boucleRef = useRef<HTMLVideoElement>(null);
  const fenetreRef = useRef<HTMLDialogElement>(null);
  const completeRef = useRef<HTMLVideoElement>(null);
  const ouvrirRef = useRef<HTMLButtonElement>(null);
  const fermerRef = useRef<HTMLButtonElement>(null);

  const [etat, setEtat] = useState<Etat>("affiche");
  const [videoVisible, setVideoVisible] = useState(false);

  // État mutable lu par les gestionnaires d'événements (pas de rendu).
  const r = useRef({
    chargee: false, // sources posées
    visible: false, // cadre à l'écran
    arretVoulu: false, // le visiteur a arrêté : on ne relance jamais tout seul
    bloquee: false, // lecture automatique refusée : on attend un clic
    echec: false, // aucune source lisible : l'affiche reste, définitivement
    tours: 0,
    dernierTemps: 0,
    reprendre: false, // la boucle tournait à l'ouverture de la fenêtre
    finVue: false, // /video/son-fini déjà compté pour cette ouverture
    appuiSurFond: false, // le pointeur a été enfoncé sur le fond de la fenêtre
    defilementBloque: false, // la page derrière la fenêtre est figée
  });

  // Aucune source lisible (fichier introuvable, réseau coupé, format refusé) :
  // on garde l'affiche, qui porte l'information, sans bouton qui ne ferait rien.
  function abandonner() {
    r.current.echec = true;
    setVideoVisible(false);
    setEtat("affiche");
  }

  function lancer() {
    const v = boucleRef.current;
    if (!v || r.current.echec) return;
    v.play().then(
      () => {
        r.current.bloquee = false;
      },
      (err: unknown) => {
        // NotAllowedError : lecture automatique refusée. Une AbortError (pause
        // demandée pendant le démarrage) n'est pas un refus.
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          r.current.bloquee = true;
          setEtat("bloquee");
        } else if (
          v.error ||
          // NotSupportedError : aucune source lisible. (networkState n'est pas
          // testé : il vaut NETWORK_NO_SOURCE un instant à chaque load(), une
          // AbortError tombée à ce moment ferait abandonner à tort.)
          (err instanceof DOMException && err.name === "NotSupportedError")
        ) {
          abandonner();
        } else if (v.paused) {
          setEtat(v.ended ? "finie" : "pause");
        }
      },
    );
  }

  useEffect(() => {
    const cadre = cadreRef.current;
    const v = boucleRef.current;
    if (!cadre || !v) return;
    const s = r.current;

    const preferenceMouvement = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connexion = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    const economieDeDonnees = connexion?.saveData === true;
    let pageChargee = document.readyState === "complete";
    // Premier rendu de la page déjà affiché ? Sur un appareil lent (et sur la
    // machine de PageSpeed), l'événement `load` peut précéder le premier
    // rendu : la boucle (près de 1 Mo) partait alors avant que le texte du
    // bandeau ne s'affiche, et PageSpeed la comptait dans le LCP mobile
    // (mesuré le 04/10/2026). Sans Paint Timing (vieux navigateurs), on ne
    // l'attend pas.
    let premierRendu =
      typeof PerformanceObserver === "undefined" ||
      !PerformanceObserver.supportedEntryTypes?.includes("paint") ||
      performance.getEntriesByName("first-contentful-paint").length > 0;

    function charger() {
      if (!v || s.chargee || !s.visible || !pageChargee || !premierRendu) return;
      if (preferenceMouvement.matches || economieDeDonnees) return;
      s.chargee = true;
      v.muted = true;
      v.setAttribute("muted", "");
      v.loop = true;
      ajouterSource(v, sources.webm, 'video/webm; codecs="vp9"');
      // L'erreur de la DERNIÈRE source signifie qu'aucune n'a pu être lue.
      ajouterSource(v, sources.mp4, 'video/mp4; codecs="avc1.640028"').addEventListener(
        "error",
        abandonner,
      );
      v.preload = "auto";
      v.load();
      lancer();
    }

    // Arrêt hors de l'écran (cadre défilé, ou onglet en arrière-plan), reprise
    // au retour si rien ne s'y oppose (y compris « moins d'animations », relu
    // à chaque fois). Chrome met lui-même en pause une vidéo muette d'un
    // onglet caché, sans toujours la relancer au retour.
    function suivreVisibilite() {
      if (!v) return;
      const aLEcran = s.visible && document.visibilityState === "visible";
      if (!aLEcran) {
        if (!v.paused) v.pause();
      } else if (
        v.paused &&
        !v.ended &&
        !s.arretVoulu &&
        !s.bloquee &&
        !s.echec &&
        !preferenceMouvement.matches &&
        !fenetreRef.current?.open
      ) {
        lancer();
      }
    }

    const observateur = new IntersectionObserver(
      ([entree]) => {
        s.visible = entree.isIntersecting;
        if (!s.chargee) charger();
        else suivreVisibilite();
      },
      { threshold: 0.25 },
    );
    observateur.observe(cadre);

    function surVisibilitePage() {
      if (s.chargee) suivreVisibilite();
    }
    document.addEventListener("visibilitychange", surVisibilitePage);

    function rendu() {
      if (premierRendu) return;
      premierRendu = true;
      observateurRendu?.disconnect();
      charger();
    }
    let observateurRendu: PerformanceObserver | undefined;
    if (!premierRendu) {
      observateurRendu = new PerformanceObserver((liste) => {
        if (liste.getEntriesByName("first-contentful-paint").length > 0) rendu();
      });
      observateurRendu.observe({ type: "paint", buffered: true });
    }
    // Filet de sécurité : si le premier rendu n'était jamais signalé (cas non
    // prévu), la boucle part quand même 3 s après `load`.
    let filet: number | undefined;
    function armerFilet() {
      if (!premierRendu) filet = window.setTimeout(rendu, 3000);
    }

    function surChargement() {
      pageChargee = true;
      armerFilet();
      charger();
    }
    if (!pageChargee) window.addEventListener("load", surChargement, { once: true });
    else armerFilet();

    // « Moins d'animations » activé en cours de route : on arrête, même si la
    // boucle était déjà en pause (hors de l'écran, onglet caché, fenêtre
    // ouverte), pour qu'aucune reprise automatique ne la relance.
    function surPreference(e: MediaQueryListEvent) {
      if (e.matches) {
        if (s.chargee) {
          s.arretVoulu = true;
          if (v && !v.paused) v.pause();
        }
      } else {
        charger();
      }
    }
    preferenceMouvement.addEventListener("change", surPreference);

    return () => {
      observateur.disconnect();
      document.removeEventListener("visibilitychange", surVisibilitePage);
      window.removeEventListener("load", surChargement);
      observateurRendu?.disconnect();
      window.clearTimeout(filet);
      preferenceMouvement.removeEventListener("change", surPreference);
      if (s.defilementBloque) debloquerDefilement();
    };
    // lancer() ne lit que des refs, et les sources ne changent pas (fichiers
    // versionnés, fixés au build) : le monter une fois suffit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compte les tours : la boucle native (loop) est sans couture ; avant le
  // dernier tour, on la coupe pour que la vidéo s'arrête sur sa dernière image.
  function surTemps() {
    const v = boucleRef.current;
    if (!v) return;
    const s = r.current;
    if (v.currentTime + 1 < s.dernierTemps) {
      s.tours += 1;
      if (s.tours >= TOURS - 1) v.loop = false;
    }
    s.dernierTemps = v.currentTime;
  }

  function surBouton() {
    const v = boucleRef.current;
    if (!v) return;
    const s = r.current;
    if (etat === "finie") {
      s.tours = 0;
      s.dernierTemps = 0;
      s.arretVoulu = false;
      v.loop = true;
      v.currentTime = 0;
      lancer();
    } else if (etat === "lecture") {
      s.arretVoulu = true;
      v.pause();
    } else {
      s.arretVoulu = false;
      s.bloquee = false;
      lancer();
    }
  }

  // La page ne défile pas derrière la fenêtre. La largeur de la barre de
  // défilement est compensée, pour que le fond ne saute pas (Windows).
  function bloquerDefilement() {
    const html = document.documentElement;
    const barre = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    if (barre > 0) html.style.paddingRight = `${barre}px`;
    r.current.defilementBloque = true;
  }
  function debloquerDefilement() {
    const html = document.documentElement;
    html.style.overflow = "";
    html.style.paddingRight = "";
    r.current.defilementBloque = false;
  }

  function ouvrir() {
    const fenetre = fenetreRef.current;
    const c = completeRef.current;
    const v = boucleRef.current;
    if (!fenetre || !c || !avecSon) return;
    const s = r.current;

    s.reprendre = s.chargee && !!v && !v.paused;
    if (s.reprendre) v?.pause();

    if (!c.querySelector("source")) {
      c.poster = avecSon.affiche;
      ajouterSource(c, avecSon.mp4, "video/mp4");
      c.load();
    }
    bloquerDefilement();
    fenetre.showModal();
    fermerRef.current?.focus();
    s.finVue = false;
    c.currentTime = 0;
    // Appelé dans le gestionnaire du clic : le navigateur autorise le son.
    c.play().catch(() => {
      /* refus improbable après un clic : les contrôles restent disponibles */
    });
    pageview({ path: "/video/son-ouvert" });
  }

  function surFermeture() {
    debloquerDefilement();
    // Libère la vidéo : une simple pause laisse le navigateur continuer à
    // télécharger ses 5 Mo. La source est reposée à la prochaine ouverture
    // (ce qui est déjà téléchargé revient du cache, noms versionnés).
    const c = completeRef.current;
    if (c) {
      c.pause();
      c.querySelectorAll("source").forEach((source) => source.remove());
      c.removeAttribute("src");
      c.load();
    }
    const s = r.current;
    if (s.reprendre && !s.arretVoulu && s.visible && !moinsDAnimations()) lancer();
    s.reprendre = false;
    ouvrirRef.current?.focus();
  }

  function surFinComplete() {
    if (r.current.finVue) return;
    r.current.finVue = true;
    pageview({ path: "/video/son-fini" });
  }

  // Focus piégé (showModal rend déjà le reste de la page inerte ; ceci évite
  // en plus de sortir vers la barre du navigateur). Tab vers l'avant n'est
  // JAMAIS intercepté : les commandes natives de la vidéo (lecture, temps,
  // son, plein écran) sont des boutons internes que document.activeElement ne
  // distingue pas de la vidéo. Après la dernière commande, le focus arrive sur
  // une sentinelle qui le renvoie à « Fermer ». Maj+Tab depuis « Fermer » va
  // sur la vidéo.
  function surToucheFenetre(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== "Tab" || !e.shiftKey) return;
    const actif = document.activeElement;
    if (actif === fermerRef.current || actif === e.currentTarget) {
      e.preventDefault();
      completeRef.current?.focus();
    }
  }

  return (
    <div data-nosearch="" className={classes.conteneur}>
      {/* Halo bleu derrière le cadre, comme l'ancienne carte de démonstration. */}
      <div
        className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary-400/30 via-primary-300/10 to-sky-300/20 blur-2xl opacity-80 pointer-events-none"
        aria-hidden
      />

      <div
        ref={cadreRef}
        className={classes.cadre}
      >
        {/* L'affiche, rendue côté serveur (HeroVideo.tsx, VideoCockpit.tsx). */}
        {children}

        <video
          ref={boucleRef}
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => {
            setVideoVisible(true);
            setEtat("lecture");
          }}
          onPause={(e) => {
            if (!r.current.echec) setEtat(e.currentTarget.ended ? "finie" : "pause");
          }}
          onEnded={() => setEtat("finie")}
          onError={abandonner}
          onTimeUpdate={surTemps}
          className={`absolute inset-0 block w-full h-full object-cover transition-opacity duration-200 ease-out motion-reduce:transition-none ${
            videoVisible ? "opacity-100" : "opacity-0"
          }`}
        />

        {etat !== "affiche" && (
          <button
            type="button"
            onClick={surBouton}
            aria-label={LIBELLES[etat]}
            title={LIBELLES[etat]}
            // Accueil : coin bas-GAUCHE, car sur l'image où la boucle
            // s'arrête (le simulateur, identique à l'affiche), le coin
            // bas-droit est l'axe « 17 ans / 20 ans » du graphique. Cockpit :
            // coin haut-DROIT (voir VARIANTES). Icône seule dans tous les
            // états, pour ne jamais masquer l'image ni doubler visuellement
            // le lien « Regarder avec le son » ; le libellé est dans
            // aria-label et title.
            className={`absolute ${classes.coinBouton} inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-slate-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
          >
            <IconeBouton etat={etat} />
          </button>
        )}
      </div>

      {avecSon && (
        <>
          {/* Sur ordinateur, le lien sort du flux : seul le carré est centré
              verticalement face au texte de gauche (sinon il remonte de 22 px). */}
          <div className="mt-4 flex justify-center lg:absolute lg:inset-x-0 lg:top-full">
            <button
              ref={ouvrirRef}
              type="button"
              onClick={ouvrir}
              aria-haspopup="dialog"
              aria-label={`Regarder avec le son, ${avecSon.dureeSecondes} secondes`}
              className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-medium text-gray-600 underline-offset-4 transition-colors duration-150 hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
                <path d="M3 1.8v8.4l7-4.2z" fill="currentColor" />
              </svg>
              Regarder avec le son
              <span className="text-gray-400" aria-hidden>
                ·
              </span>
              <span className="tabular-nums">{avecSon.dureeSecondes} s</span>
            </button>
          </div>

          {/* Fenêtre de la version avec le son. Vide jusqu'au clic. */}
          <dialog
            ref={fenetreRef}
            aria-labelledby="video-son-titre"
            aria-describedby="video-son-description"
            onClose={surFermeture}
            onKeyDown={surToucheFenetre}
            onPointerDown={(e) => {
              r.current.appuiSurFond = e.target === e.currentTarget;
            }}
            onClick={(e) => {
              // Clic sur le fond : la cible est la fenêtre elle-même, ET l'appui a
              // commencé sur le fond. Un glisser parti de la barre de temps ou du
              // volume, relâché sur le fond, ne ferme donc pas la fenêtre.
              if (r.current.appuiSurFond && e.target === e.currentTarget) e.currentTarget.close();
              r.current.appuiSurFond = false;
            }}
            // svh : la plus petite hauteur d'écran (barres du navigateur
            // affichées), pour que la barre de commandes de la vidéo reste
            // visible sur un téléphone à l'horizontale.
            style={{ width: "min(640px, calc(100vw - 2rem), calc(100svh - 7rem))" }}
            className="m-auto max-h-[calc(100svh-1rem)] max-w-none overflow-auto overscroll-contain rounded-2xl border border-white/10 bg-slate-950 p-0 text-slate-300 shadow-2xl backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-3 py-2.5 pl-4 pr-2.5">
              <p id="video-son-titre" className="text-sm font-medium text-slate-200">
                DCA Tracker en {avecSon.dureeSecondes} secondes
              </p>
              <button
                ref={fermerRef}
                type="button"
                onClick={() => fenetreRef.current?.close()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Fermer
              </button>
            </div>
            <video
              ref={completeRef}
              controls
              playsInline
              preload="none"
              aria-labelledby="video-son-titre"
              aria-describedby="video-son-description"
              onEnded={surFinComplete}
              className="block aspect-square w-full bg-slate-950"
            />
            <p id="video-son-description" className="sr-only">
              {avecSon.description}
            </p>
            {/* Sentinelle : après la dernière commande de la vidéo, Tab revient
                sur « Fermer ». */}
            <span tabIndex={0} onFocus={() => fermerRef.current?.focus()} className="sr-only" />
          </dialog>
        </>
      )}
    </div>
  );
}

function IconeBouton({ etat }: { etat: Exclude<Etat, "affiche"> }) {
  if (etat === "lecture") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <rect x="2.5" y="2" width="3" height="10" rx="1" fill="currentColor" />
        <rect x="8.5" y="2" width="3" height="10" rx="1" fill="currentColor" />
      </svg>
    );
  }
  if (etat === "finie") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9M2.5 2.5v3h3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M4 2.5v9l7.5-4.5z" fill="currentColor" />
    </svg>
  );
}
