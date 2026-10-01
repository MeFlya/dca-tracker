// Rendu partagé des pages produit (/produits/[slug]).
//
// Refonte du 01/10/2026 (cahier private-assets/raw/geo/design-ressources-spec.md),
// dans le langage de /tarifs : deux sections OPAQUES — sombre pour la vente,
// blanche pour la lecture. C'est cette opacité qui masque la grille et les
// taches de l'AmbientBackground du layout, cause principale du rendu
// « gabarit » des anciennes pages.
//
// Ordre : hero (H1, prix, bouton, une ligne de réassurance, vrai visuel en
// grand, chiffres clés) → présentation → visite du classeur / pages du guide /
// contenu du pack → détail → ce que vous obtenez → pour qui → comparatif →
// auteur → après le paiement → FAQ → appel final → voir aussi → note de
// transparence. L'appel final vient APRÈS la FAQ : la barre d'achat mobile,
// masquée dès qu'il est atteint, reste ainsi visible pendant la FAQ.
//
// Les textes de products.ts passent par `typo()` à l'affichage (espaces
// insécables) ; le JSON-LD les reçoit tels quels.
//
// Invariants : `generateMetadata` (route), texte du H1 = `name`, JSON-LD
// BreadcrumbList / Product / FAQPage, tunnel d'achat (ProductBuyButton,
// identique partout).
//
// 01/10/2026 (décisions de Maël) : le fil d'Ariane et le BreadcrumbList
// disent « Ressources », comme le menu (l'URL /produits ne change pas) ; le
// JSON-LD Product porte les images réelles du produit (`imagesDuProduit`).

import type { CSSProperties } from "react";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/ui/BreadcrumbSchema";
import { JsonLd } from "@/components/ui/JsonLd";
import { BarreAchatMobile } from "./BarreAchatMobile";
import {
  AppelFinal,
  ApresPaiement,
  BlocAuteur,
  BOUTON_ACHAT_SOMBRE,
  ChiffresCles,
  Comparatif,
  EnTeteBloc,
  euros,
  Faq,
  Feuilleter,
  ListeFeatures,
  nomAvecArticle,
  PourQui,
  Sommaire,
  Coche,
} from "./blocs";
import { FondSombre } from "./FondSombre";
import { ProductBuyButton } from "./ProductBuyButton";
import { ProductCard } from "./ProductCard";
import { enEntier, Fenetre, Livre, piecesDuPack, ProductVisual } from "./visuels";
import { VisiteOnglets, type OngletVisite } from "./VisiteOnglets";
import {
  getProductPriceId,
  largeurVisiteClasseur,
  prixSepares,
  produitsInclus,
  PRODUCT_LIST,
  type Capture,
  type Product,
} from "@/lib/products";
import { PREMIUM_ESSAI_JOURS } from "@/lib/plans";
import { typo, typoRiche } from "@/lib/typo";

const CANONICAL_ORIGIN = "https://dcatracker.fr";

const estUnePage = (c?: Capture) => !!c && c.height > c.width;

/**
 * Images réelles du produit pour le JSON-LD `image`, en URL absolues : ses
 * captures (recadrages compris, ce sont des vues du fichier livré), ou, pour
 * un pack, celles que sa page montre (couverture du guide, Dashboard du hero,
 * Versement des cartes).
 */
function imagesDuProduit(product: Product): string[] {
  const captures = product.screenshots?.length
    ? product.screenshots
    : Object.values(piecesDuPack(product)).filter((c): c is Capture => !!c);
  return [...new Set(captures.map((c) => `${CANONICAL_ORIGIN}${c.src}`))];
}

/** « Versement du mois » → « versement-du-mois » (ancre de l'onglet). */
const slugOnglet = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ─── Hero ────────────────────────────────────────────────────────────────────

function ProductHero({ product, available }: { product: Product; available: boolean }) {
  const separes = prixSepares(product);
  const inclus = produitsInclus(product);
  const tableur = !product.inclut?.length && !estUnePage(product.screenshots?.[0]);

  return (
    <section className="relative overflow-hidden bg-slate-950 pb-16 pt-10 md:pb-20 md:pt-12">
      <FondSombre />

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <nav
          aria-label="Fil d'ariane"
          className="mb-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-400 md:mb-8"
        >
          <Link href="/" className="transition-colors hover:text-slate-200">Accueil</Link>
          <span aria-hidden>/</span>
          <Link href="/produits" className="transition-colors hover:text-slate-200">Ressources</Link>
          <span aria-hidden>/</span>
          <span className="text-slate-200" aria-current="page">{product.shortName}</span>
        </nav>

        {/* Pas de surtitre quand le H1 a deux niveaux : il redisait le format
            (« Excel + Google Sheets » deux fois). */}
        {!product.titreHero && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-300">{product.format}</p>
        )}

        {/* Le texte du H1 reste exactement `name` (vérifié dans products.ts) :
            le séparateur « — » est lu, pas affiché. */}
        {product.titreHero?.principalEnPetit ? (
          <h1 className="text-balance font-bold text-white">
            <span className="block text-xl font-semibold leading-snug text-slate-300 md:text-2xl">
              {product.titreHero.principal}
            </span>
            <span className="sr-only"> — </span>
            <span className="mt-2 block text-3xl leading-[1.1] md:text-5xl">{product.titreHero.complement}</span>
          </h1>
        ) : product.titreHero ? (
          <h1 className="text-balance text-3xl font-bold leading-[1.1] text-white md:text-5xl">
            {product.titreHero.principal}
            <span className="sr-only"> — </span>
            <span className="mt-2 block text-xl font-semibold leading-snug text-slate-300 md:text-2xl">
              {product.titreHero.complement}
            </span>
          </h1>
        ) : (
          <h1 className="text-balance text-3xl font-bold leading-tight text-white md:text-4xl">{product.name}</h1>
        )}

        <p className="mt-4 text-pretty text-lg leading-relaxed text-slate-300">{typo(product.tagline)}</p>

        <div className="mt-6 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
          <span className="text-4xl font-bold tabular-nums text-white">{euros(product.priceEur)}</span>
          {separes !== null && (
            <s className="text-lg tabular-nums text-slate-500">{euros(separes)}</s>
          )}
          <span className="text-sm text-slate-400">paiement unique · TVA non applicable</span>
        </div>
        {/* Omnibus : le prix barré est la somme réelle des prix séparés, et
            le dit. TVA : mention promise par les CGV (article 6) sur chaque
            fiche produit, le vendeur étant en franchise (art. 293 B du CGI). */}
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          {separes !== null && (
            <>
              Prix barré&nbsp;: les deux produits achetés séparément,{" "}
              <span className="whitespace-nowrap">{inclus.map((p) => euros(p.priceEur)).join(" + ")}.</span>{" "}
            </>
          )}
          TVA non applicable, art.&nbsp;293&nbsp;B du CGI.
        </p>
        {product.priceNote && (
          <p className="mt-1 text-sm text-slate-400">{typo(product.priceNote)}</p>
        )}

        <div className="mt-6">
          <ProductBuyButton
            productId={product.id}
            priceEur={product.priceEur}
            available={available}
            ton="sombre"
            libelle={`Acheter ${nomAvecArticle(product)}`}
            note={"Livraison immédiate par email · Satisfait ou remboursé 14\u00a0jours · Paiement sécurisé Stripe"}
            className={BOUTON_ACHAT_SOMBRE}
          />
        </div>
        {/* Sentinelle de la barre d'achat mobile. */}
        <span id="achat-hero" aria-hidden className="block h-px" />
      </div>

      <div className={`relative mx-auto mt-10 px-4 sm:px-6 md:mt-14 ${tableur ? "max-w-6xl" : "max-w-5xl"}`}>
        <ProductVisual product={product} />
      </div>

      <div className="relative mx-auto mt-12 max-w-4xl px-4 sm:px-6 md:mt-16">
        <ChiffresCles product={product} />
      </div>
    </section>
  );
}

// ─── Cockpit : visite par onglets ────────────────────────────────────────────

/** Marges du tapis (sm:p-6), écart entre deux captures (gap-6), ligne « Agrandir » (mt-2 + 16 px). */
const SCENE_MARGES = 2 * 24;
const SCENE_ECART = 24;
const SCENE_SOUS = 8 + 16;

/**
 * Hauteur minimale commune de la scène, en CSS : celle du plus haut onglet À
 * LA LARGEUR AFFICHÉE, calculée depuis les dimensions réelles des captures.
 * `100cqw` est la largeur du tapis (conteneur `inline-size`) ; chaque capture
 * y prend `min(largeur de visite, largeur utile)`, comme `Fenetre`.
 *
 * Relecture DA du 01/10/2026 : avec un `min-h-[600px]` fixe, la scène
 * mesurait de 600 px (Par ETF, Frais) à 806 px (Projection) à 1 280 px, et la
 * page sautait d'un onglet à l'autre. Une hauteur fixe de 806 px, elle,
 * aurait laissé plus de 400 px de tapis vide autour de Par ETF à 900 px.
 */
function hauteurScene(groupes: Capture[][]): string {
  const utile = `(100cqw - ${SCENE_MARGES}px)`;
  const hauteurs = groupes.map((caps) => {
    const fixe = SCENE_MARGES + SCENE_ECART * (caps.length - 1) + SCENE_SOUS * caps.length;
    const images = caps.map((c) => `min(${largeurVisiteClasseur(c)}px, ${utile}) * ${(c.height / c.width).toFixed(5)}`);
    return `calc(${fixe}px + ${images.join(" + ")})`;
  });
  return `max(${hauteurs.join(", ")})`;
}

/**
 * Une scène fixe : chaque onglet sur le même tapis, pleine largeur et, à
 * partir de md, d'une hauteur minimale commune (`hauteurScene`) : la page ne
 * saute plus d'un onglet à l'autre. Chaque capture à la MÊME échelle
 * (`largeurVisiteClasseur`), centrée ; seule une capture plus large que le
 * tapis y est ramenée. Sous la scène : le nom de l'onglet et ce qu'on lit
 * dans la capture (la légende de l'onglet entier quand il en a une) ; le rôle
 * de chaque onglet est dit une seule fois, dans la liste « Huit onglets ».
 */
function onglets(product: Product): OngletVisite[] {
  const captures = product.screenshots ?? [];
  const parOnglet = new Map<string, Capture[]>();
  for (const c of captures) {
    if (!c.repere) continue;
    parOnglet.set(c.repere, [...(parOnglet.get(c.repere) ?? []), c]);
  }
  // Ordre réel des feuilles du classeur (celui de `contents`). Dans la
  // visite, l'onglet entier quand on l'a (`enEntier`), avec sa légende.
  const ordre = product.contents.map((c) => c.title);
  const groupes = [...parOnglet.entries()]
    .sort(([a], [b]) => ordre.indexOf(a) - ordre.indexOf(b))
    .map(([repere, caps]) => ({ repere, caps: caps.map(enEntier) }));
  const minScene = { "--scene-min": hauteurScene(groupes.map((g) => g.caps)) } as CSSProperties;
  return groupes.map(({ repere, caps }) => {
      const legende = caps.find((c) => c.legende)?.legende;
      return {
        id: slugOnglet(repere),
        libelle: repere,
        contenu: (
          <div className="[container-type:inline-size]">
            <div
              style={minScene}
              className="flex flex-col items-center justify-center gap-6 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70 sm:p-6 md:min-h-[var(--scene-min)]"
            >
              {caps.map((montree) => {
                return (
                  <Fenetre
                    key={montree.src}
                    capture={montree}
                    fond="clair"
                    largeur={largeurVisiteClasseur(montree)}
                    sous="Agrandir"
                    sizes="(max-width: 1152px) calc(100vw - 56px), 1056px"
                  />
                );
              })}
            </div>
            {/* Trois lignes de légende réservées à partir de md : de deux à
                trois lignes selon l'onglet, la suite de la page sautait de 22 px. */}
            <div className="mt-5 grid gap-x-8 gap-y-2 md:min-h-[5.5rem] md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <h3 className="text-base font-bold text-gray-900">Onglet «&nbsp;{repere}&nbsp;»</h3>
              {legende && (
                <div className="text-sm leading-relaxed text-gray-700">
                  {typoRiche(legende)}
                  <p className="mt-1 text-xs text-gray-500">Jeu de démonstration, à remplacer par vos données.</p>
                </div>
              )}
            </div>
          </div>
        ),
      };
    });
}

const NOMBRES_EN_LETTRES = ["Zéro", "Un", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf", "Dix"];

function HuitOnglets({ product, avecCapture }: { product: Product; avecCapture: Set<string> }) {
  const n = product.contents.length;
  return (
    <>
      <EnTeteBloc
        surtitre="Les onglets"
        titre={`${NOMBRES_EN_LETTRES[n] ?? n} onglets, un rôle chacun`}
        sousTitre="Dans l'ordre où vous les trouverez dans le classeur."
      />
      <ol className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
        {product.contents.map((c, i) => {
          const id = slugOnglet(c.title);
          return (
            <li key={c.title} className="card flex gap-4 p-5">
              <span className="font-display text-sm tabular-nums text-primary-700" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900">{c.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{typo(c.detail)}</p>
                {avecCapture.has(id) && (
                  <a
                    href={`#onglet-${id}`}
                    className="group mt-2 inline-flex text-sm font-medium text-primary-700 hover:text-primary-800"
                  >
                    Voir l&apos;onglet <span className="arrow-nudge ml-1">→</span>
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

// ─── Pack : ce que contient le pack ──────────────────────────────────────────

function ContenuDuPack({ product }: { product: Product }) {
  const inclus = produitsInclus(product);
  const separes = prixSepares(product);
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        {inclus.map((p, i) => {
          const premiere = p.screenshots?.[0];
          // Le résumé du pack (`contents`, même ordre que `inclut`), à défaut
          // la tagline du produit.
          const resume = product.contents[i]?.detail ?? p.tagline;
          return (
            <div key={p.id} className="contents">
              {i > 0 && (
                <span
                  aria-hidden
                  className="mx-auto flex h-10 w-10 items-center justify-center self-center rounded-full bg-white text-lg font-semibold text-slate-500 shadow-card ring-1 ring-slate-200"
                >
                  +
                </span>
              )}
              <div className="card flex flex-col p-6">
                <div className="relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-50/70 via-white to-slate-100 p-4">
                  {premiere && estUnePage(premiere) ? (
                    <Livre couverture={premiere} fond="clair" sizes="120px" className="h-full" />
                  ) : premiere ? (
                    <Fenetre capture={premiere} fond="clair" zoom={false} sizes="(max-width: 768px) 90vw, 400px" className="w-full" />
                  ) : null}
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">{p.format}</p>
                <h3 className="mt-1 font-display text-lg font-bold text-gray-900">{p.shortName}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{typo(resume)}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  {p.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Coche />
                      <span className="leading-relaxed">{typo(f)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-baseline justify-between gap-3 pt-5">
                  <Link href={`/produits/${p.slug}`} className="group text-sm font-medium text-primary-700 hover:text-primary-800">
                    Voir le détail <span className="arrow-nudge">→</span>
                  </Link>
                  <span className="text-sm tabular-nums text-gray-500">{euros(p.priceEur)} seul</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {separes !== null && (
        <div className="mt-6 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 rounded-2xl bg-slate-950 px-6 py-4 text-white">
          <span className="text-slate-400">
            Séparément&nbsp;: {inclus.map((p) => euros(p.priceEur)).join(" + ")} ={" "}
            <s className="tabular-nums">{euros(separes)}</s>
          </span>
          <span className="text-lg font-bold">Le pack&nbsp;: {euros(product.priceEur)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function ProductPage({ product }: { product: Product }) {
  const available = getProductPriceId(product) !== null;
  const url = `/produits/${product.slug}`;
  const others = PRODUCT_LIST.filter((p) => p.id !== product.id);
  const captures = product.screenshots ?? [];
  const estPack = !!product.inclut?.length;
  const estGuide = !estPack && estUnePage(captures[0]);
  const estClasseur = !estPack && !estGuide && captures.length > 0;
  const visite = estClasseur ? onglets(product) : [];
  const [premier, ...suite] = product.abstract;
  const images = imagesDuProduit(product);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: `${CANONICAL_ORIGIN}/` },
          { name: "Ressources", url: `${CANONICAL_ORIGIN}/produits` },
          { name: product.shortName },
        ]}
      />

      <ProductHero product={product} available={available} />

      {/* -mb-12 : recouvre la marge haute du pied de page (mt-12), sinon le
          fond du layout réapparaît sur 48 px avant le footer. */}
      <section className="relative -mb-12 bg-white pb-28 pt-16 md:pb-32 md:pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Présentation */}
          <div data-reveal className="mx-auto mb-16 max-w-3xl space-y-4 md:mb-20">
            {premier && <p className="text-lg leading-relaxed text-gray-700">{typo(premier)}</p>}
            {suite.map((p) => (
              <p key={p} className="leading-relaxed text-gray-600">{typo(p)}</p>
            ))}
          </div>

          {estClasseur && visite.length > 0 && (
            <div data-reveal id="visite" className="mb-16 md:mb-20">
              <EnTeteBloc
                surtitre="Dans le classeur"
                titre="Ce que vous verrez en ouvrant le fichier"
                sousTitre={
                  <>
                    Les vrais onglets du fichier livré, avec son exemple pré&#8209;rempli.{" "}
                    <span className="sm:hidden">Agrandissez une capture pour lire ses cellules.</span>
                    <span className="hidden sm:inline">Cliquez sur une capture pour l&apos;agrandir.</span>
                  </>
                }
              />
              <VisiteOnglets
                onglets={visite}
                actifParDefaut={visite.find((o) => o.id === "dashboard")?.id ?? visite[0].id}
              />
            </div>
          )}

          {estClasseur && (
            <div data-reveal className="mb-16 md:mb-20">
              <HuitOnglets product={product} avecCapture={new Set(visite.map((o) => o.id))} />
            </div>
          )}

          {estGuide && (
            <>
              <div data-reveal className="mb-16 md:mb-20">
                <EnTeteBloc
                  surtitre="Feuilleter"
                  titre="Quelques pages, telles que vous les recevrez"
                  sousTitre={(() => {
                    const pages = captures.slice(1).filter((c) => !c.horsFeuilleter);
                    const n = new Set(pages.map((c) => c.repere)).size;
                    return (
                      <>
                        {`${n}\u00a0pages${product.pages ? ` sur ${product.pages}` : ""}, extraites du PDF tel qu'il est livré.`}{" "}
                        <span className="sm:hidden">Touchez une page pour l&apos;agrandir.</span>
                        <span className="hidden sm:inline">Cliquez sur une page pour l&apos;agrandir.</span>
                      </>
                    );
                  })()}
                />
                <Feuilleter pages={captures.slice(1)} />
              </div>
              {product.sommaire && (
                <div data-reveal className="mb-16 md:mb-20">
                  <EnTeteBloc
                    surtitre="Sommaire"
                    titre="Le sommaire complet"
                    sousTitre={(() => {
                      const entrees = product.sommaire.flatMap((p) => p.entrees);
                      const premiere = entrees[0]?.titre;
                      const derniere = entrees[entrees.length - 1]?.titre;
                      return `${entrees.length} entrées, de « ${premiere} » à « ${derniere} ». Sommaire de la version ${product.version ?? ""}.`;
                    })()}
                  />
                  <Sommaire product={product} />
                </div>
              )}
            </>
          )}

          {estPack && (
            <div data-reveal className="mb-16 md:mb-20">
              <EnTeteBloc
                surtitre="Le pack"
                titre="Ce que contient le pack"
                sousTitre={"Tout le guide, plus tout le Cockpit DCA\u00a0: les deux produits complets, avec leurs mises à jour."}
              />
              <ContenuDuPack product={product} />
            </div>
          )}

          {/* Ce que vous obtenez */}
          <div data-reveal className="mb-16 md:mb-20">
            <EnTeteBloc titre="Ce que vous obtenez" />
            <ListeFeatures features={product.features} />
          </div>

          {/* Pour qui / pas pour qui */}
          <div data-reveal className="mb-16 md:mb-20">
            <EnTeteBloc titre={"Est-ce pour vous\u00a0?"} />
            <PourQui product={product} />
          </div>

          {product.comparison && (
            <div data-reveal className="mb-16 md:mb-20">
              <EnTeteBloc titre={"Pourquoi pas un outil gratuit\u00a0?"} />
              <Comparatif comparison={product.comparison} />
            </div>
          )}

          {!estPack && (
            <div data-reveal className="mb-16 md:mb-20">
              <BlocAuteur product={product} />
            </div>
          )}

          <div data-reveal className="mb-16 md:mb-20">
            <EnTeteBloc titre="Après le paiement" />
            <ApresPaiement product={product} />
          </div>

          <div data-reveal className="mb-16 md:mb-20">
            <Faq faq={product.faq} />
          </div>

          <div className="mb-16 md:mb-20">
            <AppelFinal product={product} available={available} />
          </div>

          {!estPack && (
            <div data-reveal className="mx-auto mb-16 max-w-4xl md:mb-20">
              <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Voir aussi</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {others.map((p) => (
                  <ProductCard key={p.id} product={p} variante="claire" />
                ))}
              </div>
            </div>
          )}

          {/* Note de transparence (anti-cannibalisation honnête) */}
          <p className="mx-auto max-w-3xl border-t border-slate-200/70 pt-6 text-xs leading-relaxed text-gray-500">
            Vous préférez un suivi automatique plutôt qu&apos;un fichier à remplir&nbsp;?
            Notre application{" "}
            <Link href="/tarifs" className="underline hover:text-gray-700">
              DCA Tracker Premium
            </Link>{" "}
            fait le suivi, le Monte Carlo et le récap fiscal pour vous (essai{" "}
            {PREMIUM_ESSAI_JOURS}&nbsp;jours). Les produits de cette page sont
            autonomes et n&apos;exigent aucun abonnement.
          </p>
        </div>
      </section>

      {available && (
        <BarreAchatMobile productId={product.id} nom={product.shortName} priceEur={product.priceEur} />
      )}

      {/* Schema.org Product */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.metaDescription,
          url: `${CANONICAL_ORIGIN}${url}`,
          ...(images.length > 0 && { image: images }),
          brand: { "@type": "Brand", name: "DCA Tracker" },
          offers: {
            "@type": "Offer",
            price: product.priceEur.toFixed(2),
            priceCurrency: "EUR",
            availability: available
              ? "https://schema.org/InStock"
              : "https://schema.org/PreOrder",
            url: `${CANONICAL_ORIGIN}${url}`,
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: product.faq.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
    </>
  );
}
