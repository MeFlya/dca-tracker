import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand palette — trustworthy, finance-grade
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e3163",
        },
        // Accent — teal/sage profond pour signature visuelle.
        // Utilisé sur les eyebrows uppercase, certains états hover, et les
        // touches "premium" qui doivent se démarquer du blue dominant.
        // Choisi pour son ton "finance/sage" qui contraste avec primary
        // sans entrer dans les conventions tech (purple) ou alerte (rouge).
        accent: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        // Gain/positive indicators
        gain: {
          DEFAULT: "#059669",
          light: "#d1fae5",
          dark: "#047857",
        },
        // Loss/negative indicators
        loss: {
          DEFAULT: "#dc2626",
          light: "#fee2e2",
          dark: "#b91c1c",
        },
        // Neutral surfaces
        surface: {
          DEFAULT: "#f8fafc",
          card: "#ffffff",
          border: "#e2e8f0",
        },
      },
      fontFamily: {
        // Les variables --font-inter / --font-newsreader sont injectées sur
        // <html> par next/font dans app/layout.tsx (self-host, preload,
        // fallback métrique anti-CLS intégré).
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        // Display font — appliquée automatiquement sur h1/h2 via globals.css.
        // Newsreader — serif éditorial moderne. Variable wght 200-800 + opsz
        // 6..72 → bold propre, optical sizing automatique selon font-size.
        display: [
          "var(--font-newsreader)",
          "ui-serif",
          "Georgia",
          "serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover":
          "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "card-lg":
          "0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
