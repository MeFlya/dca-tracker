import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/ui/JsonLd";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcatracker.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    url: siteUrl,
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
    canonical: siteUrl,
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
      </head>
      <body className="min-h-screen flex flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "DCA Tracker",
            url: siteUrl,
            description:
              "Simulateur d'investissement progressif (DCA) en ETF. Outil éducatif gratuit, transparent, sans inscription.",
            inLanguage: "fr-FR",
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
