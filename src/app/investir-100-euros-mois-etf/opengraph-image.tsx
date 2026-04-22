import { renderMoneyPageOg } from "@/lib/og-money-page";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Investir 100€/mois en ETF — projection sur 20 ans";

export default async function Image() {
  return renderMoneyPageOg({ monthlyAmount: 100, projection20Years: "52 000 €" });
}
