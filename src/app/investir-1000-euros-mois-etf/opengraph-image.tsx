import { renderMoneyPageOg } from "@/lib/og-money-page";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Investir 1000€/mois en ETF — projection sur 20 ans";

export default async function Image() {
  return renderMoneyPageOg({ monthlyAmount: 1000, projection20Years: "520 000 €" });
}
