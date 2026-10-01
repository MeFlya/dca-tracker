// Carte d'une ressource : sombre sur /produits (grammaire des cartes de
// /tarifs), claire dans « Voir aussi ». Vignette réelle, format, prix, et
// les chiffres clés du produit — jamais d'avis, de note ni de compteur.
//
// Le Pack « mis en avant » reprend la carte Premium de /tarifs (halo, liseré
// animé, lueur, reflet), avec un badge qui dit un fait : « Les deux
// ensemble ». Pas de « Meilleure valeur » (superlatif autoproclamé, retiré le
// 01/10/2026).

import Link from "next/link";
import { AuroraSweep } from "@/components/ui/AuroraSweep";
import { Vignette } from "./visuels";
import { euros, nomAvecArticle } from "./blocs";
import { prixSepares, type Product } from "@/lib/products";
import { typo } from "@/lib/typo";

/** « Voir le Cockpit DCA », « Voir le guide », « Voir le pack ». */
const libelleLien = (product: Product) => `Voir ${nomAvecArticle(product)}`;

export function ProductCard({
  product,
  variante,
  misEnAvant = false,
  priority = false,
}: {
  product: Product;
  variante: "sombre" | "claire";
  misEnAvant?: boolean;
  /** Vignette chargée en priorité (première carte de /produits). */
  priority?: boolean;
}) {
  const href = `/produits/${product.slug}`;
  const separes = prixSepares(product);

  if (variante === "claire") {
    return (
      // Carte en colonne, corps extensible et prix collé en bas : d'une
      // carte à l'autre, prix et lien restent alignés quelle que soit la
      // longueur de l'accroche.
      <Link
        href={href}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card card-hover"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-50/70 via-white to-slate-100">
          <Vignette product={product} fond="clair" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">{typo(product.format)}</p>
          <p className="mt-1 font-display text-lg font-bold text-gray-900 transition-colors group-hover:text-primary-700">
            {product.shortName}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{typo(product.tagline)}</p>
          <p className="mt-auto flex items-baseline justify-between gap-3 pt-3">
            <span className="text-lg font-bold tabular-nums text-gray-900">{euros(product.priceEur)}</span>
            <span className="text-sm font-medium text-primary-700">
              {libelleLien(product)} <span className="arrow-nudge">→</span>
            </span>
          </p>
        </div>
      </Link>
    );
  }

  const prix = (
    <div>
      <p className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums text-white">{euros(product.priceEur)}</span>
      </p>
      {separes !== null && (
        // Omnibus : le prix barré est la vraie somme des prix séparés,
        // calculée, et dit ce qu'il est.
        <p className="mt-1 text-xs text-slate-400">
          <s className="tabular-nums text-slate-500">{euros(separes)}</s> si achetés séparément, soit{" "}
          <span className="font-semibold text-emerald-400">{euros(separes - product.priceEur)} de moins</span>
        </p>
      )}
    </div>
  );

  const chiffres = (
    <ul className="my-5 grid grid-cols-2 gap-x-4 gap-y-3">
      {product.chiffresCles.map((c) => (
        <li key={c.libelle}>
          <span className="block font-display text-lg font-bold tabular-nums leading-none text-white">{c.valeur}</span>
          <span className="mt-1 block text-xs leading-snug text-slate-400">{typo(c.libelle)}</span>
        </li>
      ))}
    </ul>
  );

  const bouton = (
    <Link
      href={href}
      className={`group mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        misEnAvant
          ? "bg-primary-600 text-white hover:bg-primary-700"
          : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
      }`}
    >
      {libelleLien(product)}
      <span className="arrow-nudge" aria-hidden>→</span>
    </Link>
  );

  const vignette = (
    // Lien en double du bouton : hors tabulation et caché aux lecteurs
    // d'écran, il rend seulement l'image cliquable.
    //
    // Carte mise en avant, à partir de md : le tapis prend toute la hauteur
    // de la carte, mais la composition garde son format 16/10, centrée. Étirée
    // à la hauteur du texte (environ 590 × 410), elle laissait un grand vide
    // en bas à gauche (relecture DA du 01/10/2026).
    <Link
      href={href}
      tabIndex={-1}
      aria-hidden
      className={`relative block overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 ${
        misEnAvant ? "aspect-[16/10] md:flex md:aspect-auto md:items-center" : "aspect-[16/10]"
      }`}
    >
      {misEnAvant ? (
        <div className="absolute inset-0 md:relative md:inset-auto md:aspect-[16/10] md:w-full">
          <Vignette product={product} fond="sombre" priority={priority} />
        </div>
      ) : (
        <Vignette product={product} fond="sombre" priority={priority} />
      )}
    </Link>
  );

  const corps = (
    <div className="relative flex flex-1 flex-col p-6">
      <p className={`mb-1 text-xs font-semibold uppercase tracking-widest ${misEnAvant ? "text-primary-300" : "text-slate-400"}`}>
        {typo(product.format)}
      </p>
      <h2 className="mb-2 text-xl font-bold text-white">{product.shortName}</h2>
      {/* Deux lignes réservées à partir de md (cartes côte à côte) : prix et
          chiffres clés alignés d'une carte à l'autre. */}
      <p className={`mb-5 text-sm leading-relaxed text-slate-300 ${misEnAvant ? "" : "md:min-h-[2.875rem]"}`}>
        {typo(product.tagline)}
      </p>
      {prix}
      {chiffres}
      {bouton}
    </div>
  );

  if (!misEnAvant) {
    return (
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        {vignette}
        {corps}
      </div>
    );
  }

  return (
    // Enveloppe sans overflow-hidden : le badge déborde au-dessus de la carte.
    <div className="relative pt-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 mt-4 animate-breathe rounded-3xl bg-gradient-to-br from-primary-400/40 via-indigo-500/30 to-sky-400/30 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[2px] top-4 animate-gradient rounded-2xl bg-gradient-to-r from-primary-400 via-indigo-500 via-sky-400 to-primary-500"
      />
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
        <span className="whitespace-nowrap rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-white shadow-lg ring-2 ring-slate-950">
          Les deux ensemble
        </span>
      </div>
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary-500/30 bg-slate-950 md:grid md:grid-cols-[1.15fr_1fr] md:items-stretch">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64"
          style={{ backgroundImage: "radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%)" }}
        />
        <AuroraSweep className="via-white/12" />
        {vignette}
        {corps}
      </div>
    </div>
  );
}
