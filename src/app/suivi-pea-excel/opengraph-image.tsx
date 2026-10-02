import { renderOgTemplate } from "@/lib/og-template";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Suivre votre PEA dans Excel ou Google Sheets : formules et modèle gratuit — DCA Tracker";

// 01/10/2026 : la page partait sans image (son openGraph remplaçait celui du
// layout, image comprise). Aucun chiffre ici : ceux de la page sont calculés
// sur un jeu d'exemple FICTIF, qu'une image partagée seule ne pourrait pas
// signaler comme tel. Next reprend cette image en twitter:image.
// 02/10/2026 : l'exemple passe aux cours réels, mais ses achats (quantités)
// restent fictifs : plus-value et TRI restent ceux d'un exemple, la règle
// « aucun chiffre ici » tient toujours.
export default async function Image() {
  return renderOgTemplate({
    variant: "light",
    eyebrow: "Excel et Google Sheets",
    title: "Suivre votre PEA",
    subtitle: "PRU frais inclus, TRI, plafond et 5 ans : les formules, et un modèle gratuit.",
    footerLeft: "Méthode · Formules · Modèle gratuit",
  });
}
