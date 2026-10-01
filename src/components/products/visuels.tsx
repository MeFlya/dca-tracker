// Cadres des visuels produit — CSS seulement, autour de VRAIES captures.
//
// Règle (public/produits/README.md) : on encadre (fenêtre, ombre, pages
// empilées, légère perspective) et on compose plusieurs vraies captures, mais
// on ne retouche rien DANS l'image. Deux captures d'un même onglet ne sont
// jamais montrées comme si elles n'en formaient qu'une : chacune garde son
// propre cadre. Rien n'est posé SUR une capture (ni pastille, ni livre) là
// où il y a des chiffres.
//
// - Fenetre : capture de tableur, barre neutre facultative (pastilles grises :
//   n'imite aucun logiciel) avec le nom réel du fichier livré et de l'onglet ;
// - Livre : couverture du guide, deux feuillets décalés et une ombre de
//   reliure ;
// - CompositionPack : les vraies captures des produits inclus (hero du Pack) ;
// - Vignette : visuel des cartes (/produits, Voir aussi, appel final) ;
// - ProductVisual : visuel du hero, selon le produit.

import Image, { getImageProps } from "next/image";
import { CaptureZoom } from "./CaptureZoom";
import {
  largeurLectureClasseur,
  produitsInclus,
  type Capture,
  type Product,
} from "@/lib/products";
import { typoRiche } from "@/lib/typo";

/** Nom du fichier livré : `downloadName` de PRODUCT_FILES (api/products/download). */
const FICHIER_CLASSEUR = "Cockpit-DCA-PEA_dcatracker.xlsx";

type Fond = "sombre" | "clair";

/** Couverture d'abord : une capture plus haute que large est une page. */
const estUnePage = (c: Capture) => c.height > c.width;

/** L'onglet entier d'une capture recadrée, comme capture à part entière. */
export function enEntier(c: Capture): Capture {
  return c.complete ? { ...c, ...c.complete, complete: undefined, mobile: undefined } : c;
}

// ─── Image d'une capture (recadrage mobile facultatif) ──────────────────────

/**
 * Sous 640 px, une capture qui a un `mobile` (recadrage contigu de la même
 * capture) le sert à la place : la capture entière y deviendrait une texture.
 */
function ImageCapture({
  capture,
  sizes,
  priority,
}: {
  capture: Capture;
  sizes: string;
  priority: boolean;
}) {
  if (!capture.mobile) {
    return (
      <Image
        src={capture.src}
        alt={capture.alt}
        width={capture.width}
        height={capture.height}
        sizes={sizes}
        priority={priority}
        className="block h-auto w-full"
      />
    );
  }
  const m = capture.mobile;
  const {
    props: { srcSet: srcSetMobile, sizes: sizesMobile },
  } = getImageProps({
    alt: capture.alt,
    src: m.src,
    width: m.width,
    height: m.height,
    sizes: "calc(100vw - 32px)",
    priority,
  });
  const { props } = getImageProps({
    alt: capture.alt,
    src: capture.src,
    width: capture.width,
    height: capture.height,
    sizes,
    priority,
  });
  return (
    <picture>
      <source
        media="(max-width: 639px)"
        srcSet={srcSetMobile}
        sizes={sizesMobile}
        width={m.width}
        height={m.height}
      />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- props de getImageProps (alt compris) */}
      <img {...props} className="block h-auto w-full" />
    </picture>
  );
}

// ─── Fenêtre de tableur ──────────────────────────────────────────────────────

export function Fenetre({
  capture,
  fond,
  barre = false,
  zoom = true,
  priority = false,
  sizes,
  largeur,
  sous,
  className = "",
}: {
  capture: Capture;
  fond: Fond;
  barre?: boolean;
  zoom?: boolean;
  priority?: boolean;
  sizes: string;
  /** Largeur maximale en px CSS (centrée) : même échelle d'une capture à l'autre. */
  largeur?: number;
  /** Bouton texte « Agrandir… » sous le cadre (quand il n'y a pas de barre). */
  sous?: string;
  className?: string;
}) {
  const image = <ImageCapture capture={capture} sizes={sizes} priority={priority} />;
  const cadre = `overflow-hidden rounded-xl bg-white ${
    fond === "sombre"
      ? "shadow-2xl shadow-black/40 ring-1 ring-white/10"
      : "shadow-card-lg ring-1 ring-slate-200/80"
  } ${className}`;
  const entete = (
    <>
      <span className="flex shrink-0 gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      </span>
      {/* Sous 640 px, l'onglet seul : « Cockpit-DCA-PEA_dcatrack… » était
          tronqué avant le nom de l'onglet (relecture DA du 01/10/2026). */}
      <span className="truncate text-xs font-medium text-slate-500">
        <span className={capture.repere ? "hidden sm:inline" : undefined}>{FICHIER_CLASSEUR}</span>
        {capture.repere && (
          <span className="sm:text-slate-400">
            <span className="hidden sm:inline"> · </span>
            {capture.repere}
          </span>
        )}
      </span>
    </>
  );
  const cible = enEntier(capture);

  return (
    <div style={largeur ? { maxWidth: largeur } : undefined} className={largeur ? "mx-auto w-full" : undefined}>
      {zoom ? (
        <CaptureZoom
          src={cible.src}
          width={cible.width}
          height={cible.height}
          alt={cible.alt}
          type="tableur"
          lecture={largeurLectureClasseur(cible)}
          libelle={capture.repere ? `onglet ${capture.repere}` : capture.alt}
          cadre={cadre}
          entete={barre ? entete : undefined}
          sous={sous}
        >
          {image}
        </CaptureZoom>
      ) : (
        <div className={cadre}>
          {barre && (
            <div aria-hidden className="flex h-9 items-center gap-3 border-b border-slate-200 bg-slate-50 px-4">
              {entete}
            </div>
          )}
          {image}
        </div>
      )}
    </div>
  );
}

// ─── Livre (couverture et pages du guide) ───────────────────────────────────

/**
 * Page du guide en volume. La taille vient du parent : fixer la largeur OU la
 * hauteur via `className`, le ratio réel de la page fait le reste.
 */
export function Livre({
  couverture,
  fond = "sombre",
  feuillets = true,
  zoom = false,
  priority = false,
  sizes,
  className = "",
}: {
  couverture: Capture;
  fond?: Fond;
  /** Deux feuillets décalés sous la page (épaisseur du livre). */
  feuillets?: boolean;
  zoom?: boolean;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  const image = (
    <Image
      src={couverture.src}
      alt={couverture.alt}
      width={couverture.width}
      height={couverture.height}
      sizes={sizes}
      priority={priority}
      className="block h-full w-full object-cover"
    />
  );
  const anneau = fond === "sombre" ? "ring-1 ring-white/10" : "ring-1 ring-slate-900/10";
  return (
    <div
      className={`relative ${className}`}
      style={{ aspectRatio: `${couverture.width} / ${couverture.height}` }}
    >
      {feuillets && (
        <>
          <div
            aria-hidden
            className={`absolute inset-0 translate-x-[10px] translate-y-[10px] rounded-[3px] bg-slate-300/90 ${anneau}`}
          />
          <div
            aria-hidden
            className={`absolute inset-0 translate-x-[5px] translate-y-[5px] rounded-[3px] bg-slate-100 ${anneau}`}
          />
        </>
      )}
      {zoom ? (
        <CaptureZoom
          src={couverture.src}
          width={couverture.width}
          height={couverture.height}
          alt={couverture.alt}
          type="page"
          libelle={couverture.titre ? `${couverture.titre} (${couverture.repere})` : couverture.alt}
          cadre={`relative h-full w-full overflow-hidden rounded-[3px] bg-white ${anneau} ${
            fond === "sombre" ? "shadow-2xl shadow-black/50" : "shadow-xl shadow-slate-900/20"
          }`}
          className="h-full w-full"
        >
          {image}
          {feuillets && <Reliure />}
        </CaptureZoom>
      ) : (
        <div
          className={`relative h-full w-full overflow-hidden rounded-[3px] bg-white ${anneau} ${
            fond === "sombre" ? "shadow-2xl shadow-black/50" : "shadow-xl shadow-slate-900/20"
          }`}
        >
          {image}
          {feuillets && <Reliure />}
        </div>
      )}
    </div>
  );
}

function Reliure() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/25 to-transparent"
    />
  );
}

// ─── Pack : composition des vraies captures des produits inclus ─────────────

/**
 * Les vraies captures que montre un pack :
 * - `tableau` (hero) : le haut du Dashboard, la capture `vignette` du
 *   classeur. Presque aussi haute que le livre (rapport 1,6), elle remplit la
 *   composition, et montre ce que le pack annonce (TRI, répartition) ;
 * - `versement` (cartes, appel final) : le recadrage Versement du mois, pour
 *   que le hub ne montre pas deux fois le Dashboard (déjà sur la carte du
 *   Cockpit). Relecture DA du 01/10/2026 : en hero, ce recadrage très large
 *   (rapport 2,9) laissait un grand vide sombre sous la fenêtre, et la même
 *   capture revenait trois fois sur la page du pack.
 */
export function piecesDuPack(product: Product) {
  const inclus = produitsInclus(product);
  const guide = inclus.find((p) => p.screenshots?.[0] && estUnePage(p.screenshots[0]));
  const classeur = inclus.find((p) => p !== guide && p.screenshots?.length);
  const captures = classeur?.screenshots ?? [];
  return {
    couverture: guide?.screenshots?.[0],
    tableau: captures.find((c) => c.vignette) ?? captures[0],
    versement: captures[0],
  };
}

export function CompositionPack({ product }: { product: Product }) {
  const { couverture, tableau } = piecesDuPack(product);
  if (!couverture || !tableau) return null;
  return (
    // Côte à côte : le livre commence là où la fenêtre finit (71 % / 72 %),
    // il ne recouvre aucune cellule, et tient dans la hauteur de la fenêtre
    // (environ 355 px contre 425 à 1 280 px) ; sous 640 px, il passe dessous.
    <div className="relative mx-auto max-w-4xl">
      <div className="sm:mr-[29%]">
        <Fenetre
          capture={tableau}
          fond="sombre"
          barre
          priority
          sizes="(max-width: 640px) calc(100vw - 32px), 640px"
        />
      </div>
      <div className="mx-auto mt-8 w-[44%] sm:absolute sm:right-0 sm:top-[11%] sm:mt-0 sm:w-[28%]">
        <Livre couverture={couverture} fond="sombre" zoom sizes="(max-width: 640px) 44vw, 250px" />
      </div>
    </div>
  );
}

// ─── Vignettes des cartes ────────────────────────────────────────────────────

/**
 * Visuel d'une carte : à poser dans un conteneur `relative overflow-hidden`
 * dont le ratio est fixé par l'appelant (aspect-[16/10]…). Purement
 * illustratif : pas de zoom, la page produit montre les captures en grand.
 * Chaque capture tient entière dans la carte : aucune case coupée avant sa
 * valeur.
 */
export function Vignette({
  product,
  fond,
  priority = false,
}: {
  product: Product;
  fond: Fond;
  /** Première carte visible au chargement (/produits) : image LCP. */
  priority?: boolean;
}) {
  const tailles = "(max-width: 768px) 90vw, 480px";

  if (product.inclut?.length) {
    const { couverture, versement: onglet } = piecesDuPack(product);
    if (!couverture || !onglet) return null;
    // En diagonale, comme la carte du Cockpit : l'onglet en haut à gauche, le
    // livre en bas à droite, SOUS l'onglet (il masquait « Parts à acheter » et
    // le reliquat, relecture du 01/10/2026). Onglet large de 68 % (16/10 ou
    // 16/9) : son bas reste au-dessus du haut du livre (44 %).
    return (
      <>
        <div className="absolute left-[6%] right-[26%] top-[8%]">
          <Fenetre capture={onglet} fond={fond} zoom={false} priority={priority} sizes={tailles} className="!rounded-lg" />
        </div>
        <div className="absolute bottom-[6%] right-[6%] h-[50%]">
          <Livre couverture={couverture} fond={fond} priority={priority} sizes="(max-width: 768px) 30vw, 160px" className="h-full" />
        </div>
      </>
    );
  }

  const captures = product.screenshots ?? [];
  if (!captures.length) return null;

  if (estUnePage(captures[0])) {
    const [gauche, droite] = captures.filter((c) => c.eventail);
    return (
      <>
        {gauche && (
          <div className="absolute left-[15%] top-[18%] h-[68%] -rotate-6">
            <Livre couverture={gauche} fond={fond} feuillets={false} sizes="160px" className="h-full" />
          </div>
        )}
        {droite && (
          <div className="absolute right-[15%] top-[18%] h-[68%] rotate-6">
            <Livre couverture={droite} fond={fond} feuillets={false} sizes="160px" className="h-full" />
          </div>
        )}
        <div className="absolute inset-x-0 top-[8%] flex h-[84%] justify-center">
          <Livre couverture={captures[0]} fond={fond} priority={priority} sizes="200px" className="h-full" />
        </div>
      </>
    );
  }

  // Classeur : les captures marquées `vignette`, chacune dans son cadre,
  // contenues dans la carte. Une seule (le haut du Dashboard, v2.0) : centrée
  // en hauteur. Sur les cartes claires (16/9, « Voir aussi »), 76 % de large
  // au lieu de 88 % : à 88 %, elle touchait presque le haut et le bas de la
  // carte (235 px sur 246, relecture DA du 01/10/2026).
  const [haut, bas] = captures.filter((c) => c.vignette);
  const premiere = haut ?? captures[0];
  const marges = !bas && fond === "clair" ? "left-[12%] right-[12%]" : "left-[6%] right-[6%]";
  return (
    <>
      <div className={`absolute ${marges} ${bas ? "top-[9%]" : "top-1/2 -translate-y-1/2"}`}>
        <Fenetre capture={premiere} fond={fond} zoom={false} priority={priority} sizes={tailles} className="!rounded-lg" />
      </div>
      {bas && (
        <div className="absolute left-[16%] right-[6%] top-[50%]">
          <Fenetre capture={bas} fond={fond} zoom={false} sizes={tailles} className="!rounded-lg" />
        </div>
      )}
    </>
  );
}

// ─── Visuel du hero ──────────────────────────────────────────────────────────

export function ProductVisual({ product }: { product: Product }) {
  if (product.inclut?.length) return <CompositionPack product={product} />;

  const captures = product.screenshots ?? [];
  // Pas de capture : pas de cadre de repli. Un cadre vide « Aperçu — … »
  // annonçait un produit qu'on ne pouvait pas voir (constat du 01/10/2026).
  if (!captures.length) return null;
  const premiere = captures[0];

  if (estUnePage(premiere)) {
    const [gauche, droite] = captures.filter((c) => c.eventail);
    const pages = [gauche, droite].filter(Boolean) as Capture[];
    return (
      <figure>
        <div className="relative mx-auto h-[320px] max-w-3xl sm:h-[380px] md:h-[440px]">
          {gauche && (
            <div className="absolute left-[calc(50%-330px)] top-10 hidden w-[210px] -rotate-6 md:block">
              <Livre couverture={gauche} fond="sombre" feuillets={false} zoom sizes="210px" />
            </div>
          )}
          {droite && (
            <div className="absolute right-[calc(50%-330px)] top-10 hidden w-[210px] rotate-6 md:block">
              <Livre couverture={droite} fond="sombre" feuillets={false} zoom sizes="210px" />
            </div>
          )}
          <Livre
            couverture={premiere}
            fond="sombre"
            zoom
            priority
            sizes="(max-width: 640px) 230px, (max-width: 768px) 270px, 315px"
            className="relative z-10 mx-auto h-full md:[transform:perspective(1200px)_rotateY(-8deg)]"
          />
        </div>
        <figcaption className="mt-8 text-center text-sm text-slate-400">
          <span className="md:hidden">Couverture, telle que dans le PDF</span>
          <span className="hidden md:inline">
            Couverture
            {pages.length > 0 &&
              ` et ${pages.length > 1 ? "pages" : "page"} ${pages
                .map((p) => (p.repere ?? "").replace(/^p\.\s*/, ""))
                .join(" et ")}`}
            , telles que dans le PDF
          </span>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure>
      <Fenetre
        capture={premiere}
        fond="sombre"
        barre
        priority
        sizes="(max-width: 1152px) calc(100vw - 32px), 1104px"
      />
      {premiere.legende && (
        <figcaption className="mx-auto mt-5 max-w-2xl text-left text-sm leading-relaxed text-slate-300 sm:text-center">
          {typoRiche(premiere.legende)}
          <span className="mt-1 block text-xs text-slate-500">
            Jeu de démonstration, à remplacer par vos données.
          </span>
        </figcaption>
      )}
    </figure>
  );
}
