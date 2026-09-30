import { renderOgTemplate } from "@/lib/og-template";
import { TAUX_VERIFIES_LE, baremeCapital, tauxAffiche } from "@/lib/fiscal/pea-cto";
import { dateEnToutesLettres } from "@/lib/etf-pea-verifies";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Fiscalité du PEA et du CTO en 2026\u00a0: ce qui a changé — DCA Tracker";

// Taux lus dans le barème du moteur pour 2026, comme la page : une image
// partagée ne doit pas annoncer un autre chiffre que la page qu'elle illustre.
// Même règle pour la date de vérification : TAUX_VERIFIES_LE, que la page
// affiche aussi (même import que l'image de /etf-eligibles-pea, en edge).
const B_2026 = baremeCapital(2026, "produit-placement");
const B_AVANT = baremeCapital(2025, "produit-placement");

export default async function Image() {
  return renderOgTemplate({
    variant: "light",
    eyebrow: "Fiscalité 2026",
    title: "PEA et CTO\u00a0: ce qui a changé",
    subtitle:
      `Prélèvements sociaux à ${tauxAffiche(B_2026.sociaux)}\u00a0% au lieu de ${tauxAffiche(B_AVANT.sociaux)}\u00a0%, ` +
      `PFU à ${tauxAffiche(B_2026.pfu)}\u00a0%.`,
    accent: { label: "Prélèvements sociaux", value: `${tauxAffiche(B_2026.sociaux)}\u00a0%` },
    footerLeft: `Vérifié le ${dateEnToutesLettres(TAUX_VERIFIES_LE)}`,
  });
}
