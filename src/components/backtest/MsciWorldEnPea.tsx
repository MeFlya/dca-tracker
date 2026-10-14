// « Ce même indice dans un PEA » — 14/10/2026, backlog SEO QW-01.
//
// Les backtests rejouent le MSCI World en euros (série XMWO) et ne renvoyaient
// vers aucune fiche des ETF éligibles au PEA qui suivent cet indice. Les fonds
// cités sont LUS dans la liste vérifiée (groupe « msci-world » de
// etf-pea-verifies.ts), ceux qui ont une fiche, par ordre alphabétique : un
// fonds ajouté ou retiré de la liste suit sans retoucher ce texte. Une
// correspondance d'indice, pas une recommandation.

import Link from "next/link";
import { Fragment } from "react";
import { ETF_PEA_VERIFIES, URL_LISTE_PEA } from "@/lib/etf-pea-verifies";

const FONDS = ETF_PEA_VERIFIES.filter((f) => f.famille === "msci-world" && f.aUneFiche)
  .map((f) => f.displaySymbol)
  .sort((a, b) => a.localeCompare(b, "fr"));

export function MsciWorldEnPea({ className }: { className?: string }) {
  if (FONDS.length === 0) return null;
  return (
    <p className={className}>
      Dans un PEA, ce même indice se suit avec des ETF éligibles dont nous avons vérifié l&apos;ISIN et
      les frais, comme{" "}
      {FONDS.map((s, i) => (
        <Fragment key={s}>
          {i > 0 && (i === FONDS.length - 1 ? " et " : ", ")}
          <Link href={`/etf/${s}`} className="font-semibold text-primary-700 hover:underline">
            {s}
          </Link>
        </Fragment>
      ))}{" "}
      (par ordre alphabétique&nbsp;; tous les fonds vérifiés de cet indice sont dans la{" "}
      <Link href={`${URL_LISTE_PEA}#msci-world`} className="underline underline-offset-2 hover:text-gray-900">
        liste des ETF éligibles au PEA
      </Link>
      ). C&apos;est une correspondance d&apos;indice, pas une recommandation.
    </p>
  );
}
