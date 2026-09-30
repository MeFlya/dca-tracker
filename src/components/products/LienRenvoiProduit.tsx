"use client";

// Lien d'un renvoi de fin d'article vers une page produit.
//
// Isolé en composant client uniquement pour porter la mesure, comme
// PartnerLink : RenvoiProduit reste un composant serveur, et products.ts (pitchs,
// FAQ, argumentaires) ne part pas dans le JavaScript de chaque article.
//
// La page est lue ici plutôt que passée par chaque appelant : un chemin écrit à
// la main dans dix pages finit toujours par diverger de l'adresse réelle.
//
// ⚠️ Au 29/09/2026, track() n'envoie rien : les événements personnalisés
// demandent le plan Pro de Vercel (voir EVENEMENTS_PERSONNALISES_ACTIFS dans
// analytics.ts). L'appel est posé pour le jour où le drapeau passe à `true`.
//
// 30/09/2026 — le clic met aussi la page de côté (sessionStorage, chemin seul)
// pour qu'elle parte avec le paiement, dans metadata.origine de la session
// Stripe : c'est la mesure qui fonctionne sans le plan Pro. Détail et lecture
// du résultat dans src/lib/origine-achat.ts.

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";
import { memoriserPageDOrigine } from "@/lib/origine-achat";

export function LienRenvoiProduit({
  href,
  produitId,
  className,
  children,
}: {
  href: string;
  produitId: string;
  className?: string;
  children: ReactNode;
}) {
  const page = usePathname();

  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        memoriserPageDOrigine(page);
        track({
          name: "product_renvoi_click",
          props: { product_id: produitId, page },
        });
      }}
    >
      {children}
    </Link>
  );
}
