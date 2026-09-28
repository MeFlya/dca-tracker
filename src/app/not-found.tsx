import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

// 404 globale brandée — vit sous le layout racine, hérite donc du header,
// du footer et des polices de marque. Remplace le 404 anglais par défaut de
// Next.js (sans marque), qui s'affichait sur toute URL invalide hors /etf.
export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
        Erreur 404
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
        Cette page n&apos;existe pas
      </h1>
      <p className="text-gray-500 mb-8 leading-relaxed">
        Le lien est peut-être erroné ou la page a été déplacée. Cherchez ce
        qu&apos;elle devait contenir, ou repartez d&apos;un outil.
      </p>
      {/* Formulaire GET simple : fonctionne sans JavaScript, mène à /recherche. */}
      <form
        role="search"
        action="/recherche"
        className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left shadow-sm focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100"
      >
        <input
          name="q"
          type="search"
          maxLength={150}
          placeholder="ETF, frais, PEA, courtier…"
          aria-label="Rechercher sur le site"
          className="min-w-0 flex-1 bg-transparent py-1 text-base text-gray-900 outline-none placeholder:text-gray-400"
        />
        <button type="submit" className="btn-primary px-4 py-2 text-xs">
          Rechercher
        </button>
      </form>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/simulateur" className="btn-primary">
          Lancer une simulation
        </Link>
        <Link href="/comparer-etf" className="btn-secondary">
          Comparer les ETF
        </Link>
      </div>
      <p className="mt-8 text-sm text-gray-500">
        Ou revenir à{" "}
        <Link href="/" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">
          l&apos;accueil
        </Link>
        .
      </p>
    </div>
  );
}
