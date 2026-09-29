import { renderOgTemplate } from "@/lib/og-template";
import { DATE_VERIFICATION_PEA, ETF_PEA_VERIFIES, dateEnToutesLettres } from "@/lib/etf-pea-verifies";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ETF éligibles au PEA\u00a0: la liste vérifiée — DCA Tracker";

// Le nombre de fonds et la date sont lus dans les données de la page, comme
// son titre : une image partagée ne doit pas annoncer un compte périmé.
export default async function Image() {
  return renderOgTemplate({
    variant: "light",
    eyebrow: "Liste vérifiée",
    title: "ETF éligibles au PEA",
    subtitle: "ISIN, frais, réplication. Et les fonds qui ne sont pas éligibles, avec la raison.",
    accent: { label: "Éligibles vérifiés", value: String(ETF_PEA_VERIFIES.length) },
    footerLeft: `Vérifiée le ${dateEnToutesLettres(DATE_VERIFICATION_PEA)}`,
  });
}
