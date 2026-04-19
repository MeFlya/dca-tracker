import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/ui/JsonLd";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { PlausibleScript, GoogleAnalyticsScript } from "@/components/analytics/PlausibleScript";
import { AnalyticsContextProvider } from "@/components/analytics/AnalyticsContext";

// Hardcoded — never trust NEXT_PUBLIC_SITE_URL for canonical/metadataBase
// (Vercel preview deployments set it to *.vercel.app which breaks SEO)
const CANONICAL_ORIGIN = "https://dcatracker.fr";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_ORIGIN),
  title: {
    default: "DCA Tracker — Simulateur ETF & Investissement Progressif",
    template: "%s | DCA Tracker",
  },
  description:
    "Simulez votre stratégie d'investissement progressif (DCA) sur des ETF. Visualisez la croissance de votre portefeuille, comparez les ETF populaires et comprenez l'effet des intérêts composés.",
  verification: {
  google: "lvfKBxYVpHuIHP-gtnSN7ka9Z4U2gHWLpsPeZLaQnJU",
},
  keywords: [
    "DCA",
    "Dollar Cost Averaging",
    "ETF",
    "simulateur investissement",
    "MSCI World",
    "S&P 500",
    "intérêts composés",
    "investissement long terme",
    "CW8",
    "VWCE",
  ],
  authors: [{ name: "DCA Tracker" }],
  creator: "DCA Tracker",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: CANONICAL_ORIGIN,
    siteName: "DCA Tracker",
    title: "DCA Tracker — Simulateur ETF & Investissement Progressif",
    description:
      "Simulez vos versements mensuels en ETF avec les intérêts composés. Gratuit, sans inscription, hypothèses transparentes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DCA Tracker — Simulateur d'investissement progressif en ETF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DCA Tracker — Simulateur ETF & Investissement Progressif",
    description:
      "Projetez vos versements mensuels en ETF avec les intérêts composés. Gratuit, sans inscription.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: CANONICAL_ORIGIN,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <PlausibleScript />
        <GoogleAnalyticsScript />
      </head>
      <body className="min-h-screen flex flex-col">
        <ClerkProvider appearance={clerkAppearance}>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "DCA Tracker",
            url: CANONICAL_ORIGIN,
            description:
              "Le cockpit DCA ETF long-terme : simulez votre stratégie, sauvegardez-la, suivez votre progression mois après mois. Transparent, sans inscription.",
            inLanguage: "fr-FR",
          }}
        />
        <AnalyticsContextProvider />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
