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
        Le lien est peut-être erroné ou la page a été déplacée. Voici par où
        continuer.
      </p>
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
