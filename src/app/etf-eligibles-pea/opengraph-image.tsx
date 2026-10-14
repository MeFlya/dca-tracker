import { renderOgTemplate } from "@/lib/og-template";
import { dateEnToutesLettres } from "@/lib/etf-pea-verifies";
import { DATE_RELEVE_LISTE_PEA, LIGNES_PEA } from "@/lib/liste-pea/donnees";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ETF éligibles au PEA : la liste vérifiée — DCA Tracker";

// Le nombre de lignes et la date sont lus dans les données de la page, comme
// son titre : une image partagée ne doit pas annoncer un compte périmé.
// 28/10/2026 : la liste complète (relevé du 14/10/2026) remplace les 14 fonds
// de la table de vérité.
export default async function Image() {
  return renderOgTemplate({
    variant: "light",
    eyebrow: "Liste vérifiée",
    title: "ETF éligibles au PEA",
    subtitle: "Cotés à Paris\u00a0: ISIN, frais, indice, et la preuve de l'émetteur. Et les fonds qui ne sont pas éligibles.",
    accent: { label: "Éligibles vérifiés", value: String(LIGNES_PEA.length) },
    footerLeft: `Relevé du ${dateEnToutesLettres(DATE_RELEVE_LISTE_PEA)}`,
  });
}
