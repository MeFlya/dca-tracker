"use client";

// Pied de page des fiches ETF v2 (14/10/2026). Elles n'affichent plus de cours
// de bourse (valeur liquidative datée de l'émetteur) : « les données de marché
// peuvent être différées » y laissait croire le contraire. Ce composant masque
// ses enfants sur /etf/<mnémo> des fiches v2, et seulement là ; le rendu des
// autres pages est inchangé. La liste vient du registre (src/data/etf).

import { usePathname } from "next/navigation";

export function SaufFichesV2({ mnemos, children }: { mnemos: readonly string[]; children: React.ReactNode }) {
  const chemin = usePathname();
  if (chemin && mnemos.some((m) => chemin === `/etf/${m}`)) return null;
  return <>{children}</>;
}
