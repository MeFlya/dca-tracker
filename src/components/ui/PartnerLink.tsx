"use client";

// Lien sortant vers un courtier partenaire.
//
// Isolé en composant client uniquement pour porter la mesure : sans
// l'événement `invest_cta_click`, activer l'affiliation reviendrait à piloter
// à l'aveugle (impossible de savoir quelle page ou quel courtier convertit).
// `rel="sponsored"` est requis par Google dès qu'un lien est rémunéré.

import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

export function PartnerLink({
  href,
  brokerId,
  accountType,
  className,
  children,
}: {
  href: string;
  brokerId: string;
  /** Enveloppe mise en avant au moment du clic (PEA, CTO…), pour la mesure. */
  accountType: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={() =>
        track({
          name: "invest_cta_click",
          props: { broker_id: brokerId, account_type: accountType },
        })
      }
    >
      {children}
    </a>
  );
}
