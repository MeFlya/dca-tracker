"use client";

// Lien sortant vers un courtier partenaire.
//
// Isolé en composant client uniquement pour porter la mesure : sans
// l'événement `invest_cta_click`, activer l'affiliation reviendrait à piloter
// à l'aveugle (impossible de savoir quelle page ou quel courtier convertit).
// `rel="sponsored"` est requis par Google dès qu'un lien est rémunéré.
//
// 14/10/2026 — `invest_cta_click` n'est enregistré nulle part sur le plan
// Hobby de Vercel. Le clic envoie donc aussi une page vue fictive
// /evt/courtier/<courtier>/<compte>/depuis/<page> (mesurerEtape, tableau des
// chemins dans src/lib/analytics.ts). Rien ne part tant que l'affiliation est
// éteinte : ce composant n'est rendu que pour un partenaire actif.

import type { ReactNode } from "react";
import { mesurerEtape, track } from "@/lib/analytics";

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
      onClick={() => {
        track({
          name: "invest_cta_click",
          props: { broker_id: brokerId, account_type: accountType },
        });
        mesurerEtape({ etape: "courtier", courtier: brokerId, compte: accountType });
      }}
    >
      {children}
    </a>
  );
}
