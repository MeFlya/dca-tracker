// Le vrai LogoMark (src/components/ui/LogoMark.tsx) dans les images de partage
// (30/10/2026). Elles dessinaient une flèche « ↗ » dans un carré bleu : un logo
// inventé, contraire à la charte (vrai LogoMark sur tous les livrables). Même
// courbe, même point et mêmes proportions que l'en-tête, en blanc ; le carré
// arrondi (rx 7 sur 28, soit le quart de la taille) reste le div de l'appelant,
// qui choisit le fond (#1d4ed8, ou blanc translucide sur fond bleu).
// Images générées au build (routes statiques) : aucun effet sur le CPU.

export function OgLogoTrait({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 21 Q9 21 13 15 Q17 9 22 6.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="22" cy="6.5" r="2.5" fill="white" />
    </svg>
  );
}
