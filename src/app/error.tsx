"use client";

// Error boundary global (AUDIT U1) — avant ce fichier, AUCUNE route n'avait
// d'error.tsx : une erreur serveur ou de rendu plantait silencieusement,
// sans feedback ni porte de sortie. Inacceptable pour des utilisateurs
// payants (dashboard, import, fiscal).
//
// Next.js App Router : ce boundary attrape les erreurs de TOUTES les routes
// en dessous du layout racine (le layout lui-même resterait couvert par un
// éventuel global-error.tsx — non nécessaire ici, le layout est trivial).

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Visible dans les logs Vercel (runtime) — pas de PII, juste l'erreur.
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div
        className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5"
        aria-hidden
      >
        <AlertTriangle size={22} className="text-amber-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Une erreur est survenue
      </h1>
      <p className="text-sm text-gray-600 leading-relaxed mb-8 max-w-md mx-auto">
        Quelque chose s&apos;est mal passé de notre côté. Vos données ne sont
        pas affectées — réessayez, et si le problème persiste, écrivez-nous à{" "}
        <a
          href="mailto:hello@dcatracker.fr"
          className="text-primary-700 font-medium hover:underline"
        >
          hello@dcatracker.fr
        </a>
        .
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          type="button"
          onClick={reset}
          className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2"
        >
          <RotateCcw size={14} aria-hidden />
          Réessayer
        </button>
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 text-[11px] text-gray-400 tabular-nums">
          Code erreur : {error.digest}
        </p>
      )}
    </div>
  );
}
