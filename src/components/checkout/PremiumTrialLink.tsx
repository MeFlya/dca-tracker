"use client";

// CTA "Essayer Premium" — destination UNIQUE et centralisée : /tarifs.
//
// Pourquoi ce composant existe : garantir que TOUS les CTA "Essayer Premium"
// du site mènent à la page de DÉCISION /tarifs (où l'utilisateur choisit
// mensuel/annuel, voit le comparatif des plans, PUIS déclenche le paiement).
// Jamais directement la page Stripe. Jamais un scroll vers une section.
//
// En centralisant la destination dans un seul composant, ce bug de routing
// ne peut plus se reproduire : si demain on veut changer la destination de
// tous les CTA d'un coup, c'est ici et nulle part ailleurs.
//
// SEULE exception légitime au "→ /tarifs" : la page /tarifs elle-même va
// directement à Stripe (via son CheckoutButton local). C'est l'étape FINALE
// du funnel (l'user a déjà choisi son plan), pas un CTA d'entrée.

import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  /** Texte du CTA. Une flèche "→" est ajoutée automatiquement. */
  label?: string;
  /** Classes Tailwind du Link (override complet du style). */
  className?: string;
  /** Ligne de réassurance optionnelle sous le bouton. */
  fineprint?: ReactNode;
  /** Classes Tailwind du paragraphe fineprint (adapter selon fond clair/dark). */
  fineprintClassName?: string;
  /**
   * Handler analytics optionnel au clic. Ne peut être passé que depuis un
   * composant client (fonction non sérialisable côté serveur).
   */
  onClick?: () => void;
}

const DEFAULT_LABEL = "Essayer Premium — 7 jours gratuits";
const DEFAULT_CLASS =
  "btn-primary text-base px-6 py-3 inline-flex items-center justify-center";
const DEFAULT_FINEPRINT_CLASS = "text-xs text-gray-500 mt-3";

export function PremiumTrialLink({
  label = DEFAULT_LABEL,
  className = DEFAULT_CLASS,
  fineprint,
  fineprintClassName = DEFAULT_FINEPRINT_CLASS,
  onClick,
}: Props) {
  return (
    <>
      <Link href="/tarifs" onClick={onClick} className={className}>
        {label}
        <span aria-hidden className="ml-1">
          →
        </span>
      </Link>
      {fineprint !== null && fineprint !== undefined && fineprint !== false && (
        <p className={fineprintClassName}>{fineprint}</p>
      )}
    </>
  );
}
