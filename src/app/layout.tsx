import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/ui/JsonLd";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { PlausibleScript } from "@/components/analytics/PlausibleScript";
import { AnalyticsContextProvider } from "@/components/analytics/AnalyticsContext";

// Hardcoded — never trust NEXT_PUBLIC_SITE_URL for canonical/metadataBase
// (Vercel preview deployments set it to *.vercel.app which breaks SEO)
const CANONICAL_ORIGIN = "https://dcatracker.fr";

// Fonts self-hostées via next/font (remplace l'@import Google Fonts de
// globals.css). Gains CWV : zéro requête tierce (fonts.googleapis +
// fonts.gstatic supprimées de la chaîne critique), preload automatique du
// WOFF2, et fallback métrique ajusté (size-adjust) → quasi-zéro CLS au swap.
//
// Inter : variable font (toute la plage de graisses en un seul fichier —
// plus léger que les 5 graisses statiques chargées avant).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Newsreader : display serif des H1/H2. Variable wght 200-800 + axe optique
// opsz 6..72 conservé (font-optical-sizing: auto dans globals.css en dépend
// pour le rendu des gros titres).
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  axes: ["opsz"],
});

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_ORIGIN),
  // ⚠️ Titre en `string` simple, et surtout PAS `{ default, template }`.
  // Ne pas réintroduire `template: "%s | DCA Tracker"`.
  //
  // Le suffixe ajoutait 14 caractères à CHAQUE page, soit près d'un quart du
  // budget d'affichage de Google (~60 caractères), pour une valeur nulle : le
  // domaine est déjà affiché au-dessus du titre dans les résultats, et Google
  // rajoute lui-même le nom du site quand il le juge utile. Six des huit pages
  // cibles étaient tronquées à cause de lui.
  //
  // Effet de bord réglé au passage : les pages qui posaient déjà « — DCA
  // Tracker » dans leur propre titre (tarifs, mentions légales, CGV,
  // confidentialité, a-propos, changelog, compte, upgrade…) affichaient la
  // marque DEUX fois. Elles gardent leur suffixe, qui est désormais le seul.
  //
  // En `string`, cette valeur sert de titre aux pages qui n'en définissent pas,
  // et n'est plus concaténée à celles qui en définissent un.
  title: "DCA Tracker — Simulateur ETF & Investissement Progressif",
  description:
    "Simulez votre stratégie d'investissement progressif (DCA) sur des ETF. Visualisez la croissance de votre portefeuille, comparez les ETF populaires et comprenez l'effet des intérêts composés.",
  verification: {
  google: "lvfKBxYVpHuIHP-gtnSN7ka9Z4U2gHWLpsPeZLaQnJU",
},
  other: {
    "impact-site-verification": "73406bba-b2fb-472c-b6ee-a2977543d2b0",
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
    // Image de marque statique (public/og-image.jpg, 1200×630, ~96 Ko —
    // léger pour les previews WhatsApp/iMessage). Les pages qui ont leur
    // propre opengraph-image.tsx (comparatifs, fiches ETF…) l'overrident
    // automatiquement (convention Next.js) — elles restent dynamiques et
    // data-driven. Les autres héritent de cette image.
    images: [
      {
        url: `${CANONICAL_ORIGIN}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "DCA Tracker — Le cockpit DCA long terme : simulez, suivez, restez investi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DCA Tracker — Simulateur ETF & Investissement Progressif",
    description:
      "Projetez vos versements mensuels en ETF avec les intérêts composés. Gratuit, sans inscription.",
    images: [`${CANONICAL_ORIGIN}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: CANONICAL_ORIGIN,
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
    shortcut: "/icon",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${newsreader.variable}`}>
      <head>
        {/* Plus de preconnect Google Fonts : les polices sont self-hostées
            par next/font (servies depuis /_next/static, même origine). */}
        <PlausibleScript />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Sans JS, on n'applique pas l'état caché du scroll-reveal. */}
        <noscript>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {/* Animated ambient background — sits below all content.
            Provides the "premium feel" on every page for free. */}
        <AmbientBackground />
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
            publisher: {
              "@type": "Organization",
              name: "DCA Tracker",
              url: CANONICAL_ORIGIN,
              logo: {
                "@type": "ImageObject",
                url: `${CANONICAL_ORIGIN}/api/logo`,
                width: 512,
                height: 512,
              },
            },
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "DCA Tracker",
            url: CANONICAL_ORIGIN,
            logo: `${CANONICAL_ORIGIN}/api/logo`,
            description:
              "Outil pédagogique français pour simuler et suivre une stratégie d'investissement progressif (DCA) en ETF.",
            sameAs: [],
          }}
        />
        <AnalyticsContextProvider />
        <ScrollReveal />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
