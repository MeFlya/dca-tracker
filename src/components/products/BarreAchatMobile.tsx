"use client";

// Barre d'achat collante, sous 768 px seulement.
//
// Visible quand le bouton du hero est sorti de l'écran par le haut, et tant
// que l'appel final n'est pas atteint (sentinelles #achat-hero et
// #achat-final, posées par ProductPage). C'est le MÊME ProductBuyButton que
// le hero : même appel au checkout, même origine de l'achat.
//
// Cachée : `inert` (ni focus ni clic), aria-hidden et `invisible` (sinon le
// rebond du défilement sur iOS pourrait la laisser apparaître sous l'écran).
// Le glissement de 200 ms est coupé sous prefers-reduced-motion.

import { useEffect, useState } from "react";
import { ProductBuyButton } from "./ProductBuyButton";

export function BarreAchatMobile({
  productId,
  nom,
  priceEur,
}: {
  productId: string;
  nom: string;
  priceEur: number;
}) {
  const [heroPasse, setHeroPasse] = useState(false);
  const [finAtteinte, setFinAtteinte] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("achat-hero");
    const fin = document.getElementById("achat-final");
    if (!hero || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) {
          setHeroPasse(!e.isIntersecting && e.boundingClientRect.top < 0);
        } else if (e.target === fin) {
          setFinAtteinte(e.isIntersecting || e.boundingClientRect.top < 0);
        }
      }
    });
    io.observe(hero);
    if (fin) io.observe(fin);
    return () => io.disconnect();
  }, []);

  const visible = heroPasse && !finAtteinte;

  return (
    <div
      data-nosearch=""
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgb(15_23_42/0.18)] backdrop-blur transition-[transform,visibility] duration-200 ease-out motion-reduce:transition-none md:hidden ${
        visible ? "visible translate-y-0" : "invisible translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{nom}</p>
          <p className="text-xs text-gray-500">{`${priceEur} € · paiement unique`}</p>
        </div>
        <div className="shrink-0">
          <ProductBuyButton
            productId={productId}
            priceEur={priceEur}
            available
            libelle="Acheter"
            note={null}
            className="btn-primary min-h-[44px] px-5 py-2.5 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
