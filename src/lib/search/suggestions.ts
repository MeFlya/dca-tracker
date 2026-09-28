// Ce que la recherche propose avant la première lettre, et quand rien ne
// correspond. Les pages qui reçoivent le plus de visites (Vercel Analytics,
// 30 jours au 28/09/2026) et les questions qu'elles traitent.

export const PAGES_SUGGEREES = [
  { href: "/simulateur", titre: "Simulateur DCA", sousTitre: "Projection avec intérêts composés" },
  { href: "/meilleurs-etf-debutants", titre: "Quel ETF choisir pour débuter", sousTitre: "Un seul suffit — lequel" },
  { href: "/comparatif-etf/wpea-vs-dcam", titre: "WPEA ou DCAM", sousTitre: "Les deux MSCI World du PEA à 0,20 %" },
  { href: "/pea-ou-cto", titre: "PEA ou CTO", sousTitre: "Fiscalité comparée pour vos ETF" },
  { href: "/backtest", titre: "Backtest sur les vrais cours", sousTitre: "Ce qu'aurait donné un DCA depuis 2008" },
  { href: "/comparatif", titre: "Comparatif des courtiers", sousTitre: "Frais d'un DCA mensuel" },
] as const;

export const RECHERCHES_EXEMPLES = [
  "plafond PEA",
  "frais Trade Republic",
  "WPEA",
  "200 € par mois",
  "ISIN",
  "fiscalité après 5 ans",
] as const;
