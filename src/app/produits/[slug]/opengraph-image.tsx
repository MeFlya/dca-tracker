// Image de partage des pages produit (1 200 × 630) : la VRAIE capture du
// produit, posée sur le fond sombre du hero, avec son nom et son prix lus
// dans products.ts.
//
// Relecture DA du 01/10/2026 : les pages produit n'avaient aucune og:image.
// Leur `generateMetadata` déclare ses propres objets `openGraph` et `twitter`,
// qui remplacent ceux du layout (et son image de marque). Une image de
// fichier, elle, s'ajoute toujours (convention Next.js) ; twitter:image la
// reprend d'office.
//
// Mêmes règles que les pages (public/produits/README.md) : captures du
// fichier livré, encadrées, jamais retouchées ; rien n'est posé sur une
// capture. Les images sont générées au build (generateStaticParams) : le
// PNG source est lu sur le disque à ce moment-là, jamais en production.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getProduct, prixSepares, PRODUCT_LIST, type Capture, type Product } from "@/lib/products";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ressource DCA Tracker : capture réelle du produit, avec son nom et son prix";
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCT_LIST.map((p) => ({ slug: p.slug }));
}

const estUnePage = (c: Capture) => c.height > c.width;

async function enDonnees(c: Capture): Promise<string> {
  const png = await readFile(join(process.cwd(), "public", c.src));
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** Les captures montrées : celles des cartes et du hero de la page. */
function captures(product: Product): { tableau?: Capture; page?: Capture } {
  const inclus = product.inclut?.length
    ? product.inclut.map((id) => PRODUCT_LIST.find((p) => p.id === id)).filter((p): p is Product => !!p)
    : [product];
  let tableau: Capture | undefined;
  let page: Capture | undefined;
  for (const p of inclus) {
    const caps = p.screenshots ?? [];
    if (caps[0] && estUnePage(caps[0])) page ??= caps[0];
    else if (caps.length) tableau ??= caps.find((c) => c.vignette) ?? caps[0];
  }
  return { tableau, page };
}

/** Le logo du site (LogoMark), redessiné tel quel pour satori. */
function Logo() {
  return (
    <svg width="44" height="44" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#1d4ed8" />
      <path d="M5 21 Q9 21 13 15 Q17 9 22 6.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="22" cy="6.5" r="2.5" fill="white" />
    </svg>
  );
}

function Fenetre({ src, c, largeur }: { src: string; c: Capture; largeur: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: largeur,
        borderRadius: 14,
        overflow: "hidden",
        background: "#ffffff",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          height: 30,
          paddingLeft: 14,
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ width: 9, height: 9, borderRadius: 9, background: "#cbd5e1" }} />
        <div style={{ width: 9, height: 9, borderRadius: 9, background: "#cbd5e1" }} />
        <div style={{ width: 9, height: 9, borderRadius: 9, background: "#cbd5e1" }} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- satori */}
      <img src={src} width={largeur} height={Math.round((largeur * c.height) / c.width)} />
    </div>
  );
}

function Livre({ src, c, hauteur }: { src: string; c: Capture; hauteur: number }) {
  const largeur = Math.round((hauteur * c.width) / c.height);
  return (
    <div style={{ display: "flex", position: "relative", width: largeur + 10, height: hauteur + 10 }}>
      <div style={{ position: "absolute", left: 10, top: 10, width: largeur, height: hauteur, borderRadius: 3, background: "#cbd5e1" }} />
      <div style={{ position: "absolute", left: 5, top: 5, width: largeur, height: hauteur, borderRadius: 3, background: "#f1f5f9" }} />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- satori */}
      <img
        src={src}
        width={largeur}
        height={hauteur}
        style={{ position: "absolute", left: 0, top: 0, borderRadius: 3, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}
      />
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug) ?? PRODUCT_LIST[0];
  const { tableau, page } = captures(product);
  const [srcTableau, srcPage] = await Promise.all([
    tableau ? enDonnees(tableau) : undefined,
    page ? enDonnees(page) : undefined,
  ]);

  const grand = product.titreHero?.principalEnPetit ? product.titreHero.complement : (product.titreHero?.principal ?? product.shortName);
  const petit = product.titreHero
    ? product.titreHero.principalEnPetit
      ? product.titreHero.principal
      : product.titreHero.complement
    : undefined;
  const separes = prixSepares(product);
  const duo = !!(srcTableau && srcPage && tableau && page);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 64,
          gap: 40,
          backgroundColor: "#020617",
          backgroundImage: "radial-gradient(circle at 85% 15%, rgba(37,99,235,0.35), rgba(2,6,23,0) 55%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: duo ? 400 : 440, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo />
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700 }}>
              DCA<span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 6 }}>Tracker</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd" }}>
              {product.format}
            </div>
            {product.titreHero?.principalEnPetit && petit && (
              <div style={{ marginTop: 16, fontSize: 30, fontWeight: 600, color: "#cbd5e1" }}>{petit}</div>
            )}
            <div style={{ marginTop: product.titreHero?.principalEnPetit ? 6 : 16, fontSize: 58, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
              {grand}
            </div>
            {!product.titreHero?.principalEnPetit && petit && (
              <div style={{ marginTop: 14, fontSize: 28, fontWeight: 500, lineHeight: 1.25, color: "#cbd5e1" }}>{petit}</div>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 30 }}>
              <span style={{ fontSize: 46, fontWeight: 700 }}>{`${product.priceEur} €`}</span>
              {separes !== null && (
                <span style={{ fontSize: 28, color: "#64748b", textDecoration: "line-through" }}>{`${separes} €`}</span>
              )}
              <span style={{ fontSize: 22, color: "#94a3b8" }}>paiement unique</span>
            </div>
          </div>
          <div style={{ fontSize: 20, color: "#64748b" }}>dcatracker.fr/produits</div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: 22 }}>
          {duo ? (
            <>
              <Fenetre src={srcTableau!} c={tableau!} largeur={400} />
              <Livre src={srcPage!} c={page!} hauteur={280} />
            </>
          ) : srcTableau && tableau ? (
            <Fenetre src={srcTableau} c={tableau} largeur={590} />
          ) : srcPage && page ? (
            <Livre src={srcPage} c={page} hauteur={480} />
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
