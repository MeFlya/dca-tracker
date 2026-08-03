import Link from "next/link";
import type { Metadata } from "next";
import {
  Activity,
  Save,
  FileText,
  Scale,
  Receipt,
  ArrowRight,
  Lock,
} from "lucide-react";
import { runSimulation, formatEur } from "@/lib/simulator";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { PremiumTrialLink } from "@/components/checkout/PremiumTrialLink";
import type { SimulatorInput } from "@/lib/simulator";
import { runMonteCarlo } from "@/lib/monte-carlo";
import { theoreticalValueAtMonth } from "@/lib/strategy-math";

// Icône Lucide associée à chaque feature pour la section "inclut aussi".
// Garde l'emoji (FeatureCopy.icon) pour le hero, et un SVG propre pour la
// liste des features sœurs en bas de page.
const FEATURE_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  "monte-carlo": Activity,
  "save-strategy": Save,
  "pdf-export": FileText,
  "ab-comparison": Scale,
  "recap-fiscal": Receipt,
};

export const metadata: Metadata = {
  title: "Passer Premium — DCA Tracker",
  robots: { index: false, follow: false },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type FeatureKey = "monte-carlo" | "save-strategy" | "pdf-export" | "ab-comparison" | "recap-fiscal";

type FeatureCopy = {
  plan: "Premium";
  planColor: string;
  price: string;
  priceYear: string;
  yearSavings: string;
  icon: string;

  /** Short noun for the "X inclut aussi" cards — 2-4 words max. */
  shortLabel: string;
  /** One-line tagline for the same cards — 5-9 words. */
  shortDesc: string;

  hero: {
    eyebrow: string;
    title: string;
    pain: string;
  };

  loss: {
    headline: string;
    items: { icon: string; title: string; desc: string }[];
  };

  projection: {
    title: string;
    intro: string;
    rows: {
      label: string;
      value: string;
      /** Surlignage « apporté par Premium ». Purement visuel. */
      locked?: boolean;
      baseline?: boolean;
      /**
       * Masque réellement la valeur.
       *
       * ⚠️ À ne mettre QUE sur une valeur qu'un visiteur ne peut pas obtenir
       * autrement. Masquer un chiffre calculable avec le simulateur gratuit
       * n'est pas un verrou, c'est un décor — la même faute que le flou CSS.
       * Aujourd'hui seuls les percentiles Monte Carlo le méritent : lib/
       * monte-carlo.ts est server-only.
       *
       * ⚠️ Et vérifier qu'aucune valeur ni phrase VISIBLE ne permet de le
       * reconstituer par calcul. Un « écart de X € » à côté d'un pire cas
       * affiché redonne le meilleur cas par addition.
       */
      secret?: boolean;
    }[];
    conclusion: string;
  };

  beforeAfter: {
    before: { label: string; lines: string[] };
    after: { label: string; lines: string[] };
  };

  value: {
    title: string;
    body: string;
  };

  priceAnchors: string[];

  faq: { q: string; a: string }[];
};

// ─── Copy — Monte Carlo ───────────────────────────────────────────────────────

const MONTE_CARLO: FeatureCopy = {
  plan: "Premium",
  planColor: "bg-primary-600",
  price: "4,90 €/mois",
  priceYear: "49 €/an",
  yearSavings: "soit 2 mois offerts",
  icon: "📊",
  shortLabel: "Monte Carlo",
  shortDesc: "1 000 scénarios de marché simulés",

  hero: {
    eyebrow: "❌ Vous voyez un seul chiffre.",
    title: "Les marchés, eux, ne sont jamais uniques.",
    pain: "Votre projection à 102 000 € suppose que les 20 prochaines années ressemblent exactement à vos hypothèses. Spoiler : ce ne sera jamais le cas.",
  },

  loss: {
    headline: "Actuellement, vous ne voyez pas :",
    items: [
      {
        icon: "🔒",
        title: "Votre pire scénario réaliste",
        desc: "Si les 20 prochaines années sont défavorables, combien vous reste-t-il ?",
      },
      {
        icon: "🔒",
        title: "Votre probabilité d'être en plus-value",
        desc: "87 % ? 65 % ? Vous l'ignorez totalement.",
      },
      {
        icon: "🔒",
        title: "L'amplitude de vos résultats possibles",
        desc: "De 68 000 € à 158 000 € ? L'écart est énorme — et il change tout.",
      },
    ],
  },

  projection: {
    title: "Exemple : 200 €/mois · 20 ans · 7 %/an",
    intro: "Voici ce que Monte Carlo révèle que le simulateur de base cache :",
    rows: [
      { label: "Scénario moyen", value: "102 000 €", baseline: true },
      { label: "Pire cas réaliste (10e percentile)", value: "68 400 €", locked: true },
      { label: "Meilleur cas réaliste (90e percentile)", value: "158 200 €", locked: true, secret: true },
      { label: "Probabilité d'être en plus-value", value: "87 %", locked: true, secret: true },
    ],
    conclusion: "Le meilleur cas est plus de deux fois supérieur au pire. C'est exactement l'écart que vous devez comprendre avant d'engager 48 000 € sur 20 ans.",
  },

  beforeAfter: {
    before: {
      label: "Simulateur gratuit",
      lines: [
        "1 chiffre (102 000 €)",
        "1 hypothèse de rendement",
        "Aucune notion de risque",
        "\"Est-ce que ce sera vraiment ça ?\"",
      ],
    },
    after: {
      label: "Avec Monte Carlo",
      lines: [
        "1 000 scénarios de marché",
        "Distribution complète (p10/p50/p90)",
        "Probabilité de gain chiffrée",
        "Vous savez à quoi vous attendre",
      ],
    },
  },

  value: {
    title: "Pourquoi Monte Carlo change tout",
    body: "Le simulateur classique fait une hypothèse unique : 7 % par an, chaque année, sans exception. Monte Carlo simule 1 000 trajectoires alternatives avec la volatilité réelle du marché (≈ 15 %/an pour les ETF actions). Vous ne payez pas un graphique : vous payez la seule façon de vérifier que votre stratégie tient face aux pires 10 % de l'histoire des marchés.",
  },

  priceAnchors: [
    "≈ 1 café par mois",
    "≈ 0,16 € par jour",
    "≈ 0,01 % de votre portefeuille final projeté",
  ],

  faq: [
    {
      q: "Puis-je annuler à tout moment ?",
      a: "Oui, en 1 clic depuis votre dashboard. Aucune rétention, pas d'engagement.",
    },
    {
      q: "Mes données restent-elles si j'annule ?",
      a: "Oui, votre stratégie et votre historique restent en base. Vous perdez l'accès aux analyses avancées, mais vous pouvez réactiver à tout moment.",
    },
    {
      q: "Quelle différence avec le simulateur gratuit ?",
      a: "Le gratuit suppose un seul futur possible. Monte Carlo en simule 1 000, basés sur la volatilité historique du marché. C'est la différence entre \"probable\" et \"possible\".",
    },
  ],
};

// ─── Copy — Save Strategy ─────────────────────────────────────────────────────

const SAVE_STRATEGY: FeatureCopy = {
  plan: "Premium",
  planColor: "bg-primary-600",
  price: "4,90 €/mois",
  priceYear: "49 €/an",
  yearSavings: "soit 2 mois offerts",
  icon: "💾",
  shortLabel: "Suivi de stratégie",
  shortDesc: "Comparez votre portefeuille au plan, mois après mois",

  hero: {
    eyebrow: "❌ Votre stratégie disparaît à chaque fermeture d'onglet.",
    title: "Chaque mois sans suivi, c'est un mois qui ne reviendra pas.",
    pain: "Vous pouvez simuler votre DCA autant de fois que vous voulez. Mais sans sauvegarde, impossible de savoir dans 6 mois si vous êtes en avance, en retard, ou juste au bon rythme.",
  },

  loss: {
    headline: "Sans sauvegarde, vous ne saurez jamais :",
    items: [
      {
        icon: "🔒",
        title: "Si vous êtes en avance ou en retard",
        desc: "Votre portefeuille réel comparé à votre projection théorique, chaque mois.",
      },
      {
        icon: "🔒",
        title: "Combien les intérêts composés ont ajouté",
        desc: "La somme générée sans effort ce mois — invisible sans tracking.",
      },
      {
        icon: "🔒",
        title: "Votre série de mois consécutifs",
        desc: "Le streak qui transforme votre DCA en vraie habitude.",
      },
    ],
  },

  projection: {
    title: "Ce qui apparaît au mois 12",
    intro: "Exemple type d'un utilisateur qui a loggé régulièrement :",
    rows: [
      { label: "Total investi sur 12 mois", value: "2 400 €", baseline: true },
      { label: "Valeur théorique attendue", value: "2 547 €", locked: true },
      { label: "Votre portefeuille réel", value: "2 680 €", locked: true },
      { label: "Intérêts composés générés", value: "+ 280 €", locked: true },
    ],
    conclusion: "Toutes ces informations sont perdues si vous ne sauvegardez pas. Dans 12 mois, vous ne pourrez plus les reconstituer.",
  },

  beforeAfter: {
    before: {
      label: "Sans sauvegarde",
      lines: [
        "Simulation oubliée après fermeture",
        "Aucun suivi mensuel",
        "Pas de comparaison réel vs projection",
        "Zéro historique",
      ],
    },
    after: {
      label: "Avec sauvegarde + tracking",
      lines: [
        "Stratégie sauvegardée, toujours accessible",
        "Log mensuel en 10 secondes",
        "Insight \"En avance / En retard\"",
        "Historique complet mois par mois",
      ],
    },
  },

  value: {
    title: "Pourquoi le tracking change tout",
    body: "Le simulateur seul est un outil one-shot. Sauvegarder votre stratégie transforme DCA Tracker en tableau de bord personnel. Chaque mois, vous voyez si votre portefeuille réel dépasse ou traîne sur votre projection — et vous ajustez en connaissance de cause. C'est la différence entre simuler une stratégie et piloter une stratégie.",
  },

  priceAnchors: [
    "≈ 1 café par mois",
    "≈ 1 % de votre versement mensuel à 500 €/mois",
    "Moins cher que n'importe quel courtier en frais de tenue de compte",
  ],

  faq: [
    {
      q: "Combien de stratégies puis-je sauvegarder ?",
      a: "Vous pouvez sauvegarder jusqu'à 10 simulations en plus de votre stratégie principale.",
    },
    {
      q: "Je peux modifier ma stratégie plus tard ?",
      a: "Oui — à tout moment depuis le simulateur. L'historique loggé est conservé, vous pouvez ajuster le montant ou la durée cible.",
    },
    {
      q: "Mon historique disparaît si j'annule ?",
      a: "Non. Les données restent, mais les insights avancés (valeur théorique comparée, streak, intérêts composés) se verrouillent jusqu'à réactivation.",
    },
  ],
};

// ─── Copy — PDF Export ────────────────────────────────────────────────────────

const PDF_EXPORT: FeatureCopy = {
  plan: "Premium",
  planColor: "bg-primary-600",
  price: "4,90 €/mois",
  priceYear: "49 €/an",
  yearSavings: "soit 2 mois offerts",
  icon: "📄",
  shortLabel: "Export PDF propre",
  shortDesc: "Sans filigrane, prêt à partager",

  hero: {
    eyebrow: "❌ Un filigrane sur votre plan financier.",
    title: "Un plan pro ne se partage pas avec un watermark en travers.",
    pain: "Que ce soit pour votre conseiller, votre partenaire, ou pour archiver — un document filigrané n'a pas la même crédibilité qu'un document propre.",
  },

  loss: {
    headline: "Avec l'export gratuit vous avez :",
    items: [
      {
        icon: "🔒",
        title: "Un filigrane 'DCA Tracker' en diagonale",
        desc: "Visible sur chaque page, impossible à cacher ou exporter proprement.",
      },
      {
        icon: "🔒",
        title: "Un document amateur",
        desc: "Pas partageable sérieusement avec un conseiller ou un partenaire.",
      },
      {
        icon: "🔒",
        title: "Aucune possibilité d'archivage propre",
        desc: "Dans 5 ans, vous relirez un PDF avec un filigrane DCA Tracker.",
      },
    ],
  },

  projection: {
    title: "Ce que contient l'export Premium",
    intro: "Un document PDF 2 pages, propre, prêt à partager :",
    rows: [
      { label: "Résumé de stratégie (montant, durée, rendement)", value: "✓", baseline: true },
      { label: "Graphique de projection (3 scénarios)", value: "✓", locked: true },
      { label: "Hypothèses transparentes (frais, inflation)", value: "✓", locked: true },
      { label: "Filigrane", value: "Aucun", locked: true },
    ],
    conclusion: "Un document crédible, archivable, partageable sans gêne.",
  },

  beforeAfter: {
    before: {
      label: "Export gratuit",
      lines: [
        "Filigrane sur chaque page",
        "\"Non partageable pro\"",
        "Aspect amateur",
        "Impossible à archiver proprement",
      ],
    },
    after: {
      label: "Export Premium",
      lines: [
        "PDF propre, aucun filigrane",
        "Prêt à partager conseiller / partenaire",
        "Archivable sur 20 ans",
        "Mise en page soignée",
      ],
    },
  },

  value: {
    title: "Un document, une décision",
    body: "Présenter votre plan DCA à un tiers (conseiller, partenaire, famille) nécessite un document qui inspire confiance. Un PDF filigrané vous dessert avant même qu'on ait lu le contenu. Premium vous donne un export propre, daté, cohérent — le type de document qui rend une décision crédible.",
  },

  priceAnchors: [
    "≈ 1 café par mois",
    "Coût de 10 impressions en photocopie",
    "Inclus : tout le reste de Premium (Monte Carlo, tracking, etc.)",
  ],

  faq: [
    {
      q: "Combien d'exports puis-je faire ?",
      a: "Illimité, tant que votre abonnement est actif.",
    },
    {
      q: "Le format est-il modifiable ?",
      a: "Le PDF est standardisé (2 pages, mise en page optimisée impression). Pour des versions custom, exportez les données et recomposez dans votre outil.",
    },
    {
      q: "Est-ce que ça inclut les autres features Premium ?",
      a: "Oui. Premium vous débloque aussi Monte Carlo, le suivi de stratégie, les simulations sauvegardées et les insights mensuels.",
    },
  ],
};

// ─── Copy — A/B Comparison ────────────────────────────────────────────────────

const AB_COMPARISON: FeatureCopy = {
  plan: "Premium",
  planColor: "bg-primary-600",
  price: "4,90 €/mois",
  priceYear: "49 €/an",
  yearSavings: "soit 2 mois offerts",
  icon: "⚖️",
  shortLabel: "Comparaison A/B",
  shortDesc: "Deux stratégies côte à côte, écart chiffré",

  hero: {
    eyebrow: "❌ Vous choisissez à l'aveugle.",
    title: "200 €/mois pendant 25 ans vs 300 €/mois pendant 20 ans. Lequel gagne ?",
    pain: "Répondre 'j'ai l'impression que c'est A' n'est pas une stratégie. Sans comparaison côte à côte, vous tranchez sur une intuition — pas sur des chiffres.",
  },

  loss: {
    headline: "Sans comparaison A/B, vous ne pouvez pas répondre :",
    items: [
      {
        icon: "🔒",
        title: "Montant plus élevé ou durée plus longue ?",
        desc: "300 €/mois × 20 ans vs 200 €/mois × 30 ans : même total investi, résultats très différents.",
      },
      {
        icon: "🔒",
        title: "+1 % de rendement en vaut-il l'effort ?",
        desc: "Passer de 6 % à 7 % sur 20 ans change combien exactement ? Impossible à visualiser sans comparaison.",
      },
      {
        icon: "🔒",
        title: "Frais de 0,3 % vs 0,5 %",
        desc: "Un écart anodin en apparence, des dizaines de milliers d'euros à l'arrivée.",
      },
    ],
  },

  projection: {
    title: "Exemple concret",
    intro: "Deux stratégies à total investi équivalent — le gagnant n'est pas celui que vous croyez :",
    rows: [
      { label: "A : 200 €/mois × 25 ans (60 000 € investis)", value: "167 000 €", baseline: true },
      { label: "B : 300 €/mois × 20 ans (72 000 € investis)", value: "156 000 €", locked: true },
      { label: "Différence finale", value: "+11 000 € pour A", locked: true },
      { label: "Total investi en moins (A)", value: "− 12 000 €", locked: true },
    ],
    conclusion: "Moins investir sur plus longtemps bat plus investir sur moins longtemps. Le temps vaut plus que le montant. Cette intuition, seule la comparaison A/B la révèle chiffres à l'appui.",
  },

  beforeAfter: {
    before: {
      label: "Sans comparaison",
      lines: [
        "Une simulation à la fois",
        "Jugement à l'intuition",
        "Aucun arbitrage chiffré",
        "Décisions à long terme sans données",
      ],
    },
    after: {
      label: "Avec comparaison A/B",
      lines: [
        "Deux stratégies côte à côte",
        "Écart calculé en temps réel",
        "Arbitrage montant vs durée chiffré",
        "Tous les paramètres modifiables",
      ],
    },
  },

  value: {
    title: "La décision la plus importante de votre DCA",
    body: "Fixer le bon montant et la bonne durée est la seule décision qui compte vraiment dans une stratégie DCA. Le choix de l'ETF a un impact marginal à côté. La comparaison A/B vous donne la seule vraie vision : deux futurs possibles, chiffrés, côte à côte — pour que vous tranchiez sur des chiffres, pas sur une intuition.",
  },

  priceAnchors: [
    "≈ 2 cafés par mois",
    "1 décision correcte = plusieurs milliers d'euros gagnés",
    "Inclus : tout Premium + simulations illimitées + A/B",
  ],

  faq: [
    {
      q: "Qu'est-ce qu'une comparaison A/B ?",
      a: "Deux jeux de paramètres (montant, durée, rendement, frais) simulés côte à côte, avec l'écart final chiffré. Idéal pour arbitrer entre deux stratégies concrètes.",
    },
    {
      q: "Puis-je comparer plus de 2 stratégies ?",
      a: "La comparaison A/B affiche 2 stratégies simultanément. Pour évaluer plus de scénarios, créez plusieurs simulations sauvegardées et relancez la comparaison deux par deux.",
    },
    {
      q: "Puis-je annuler à tout moment ?",
      a: "Oui, en 1 clic depuis votre dashboard. Aucun engagement, pas de frais cachés.",
    },
  ],
};

// ─── Copy — Récap fiscal annuel ──────────────────────────────────────────────

const RECAP_FISCAL: FeatureCopy = {
  plan: "Premium",
  planColor: "bg-primary-600",
  price: "4,90 €/mois",
  priceYear: "49 €/an",
  yearSavings: "soit 2 mois offerts",
  icon: "🧾",
  shortLabel: "Récap fiscal annuel",
  shortDesc: "Cases 2042 et 2074 pré-calculées",

  hero: {
    eyebrow: "❌ Mai approche. Vous savez quoi reporter dans la 2074 ?",
    title: "Votre récap fiscal pré-calculé chaque année.",
    pain: "Plus-values PEA, prélèvements selon durée de détention, cases 2042 et 2074 : sans outil, c'est des heures sur les forums et un risque réel d'erreur de déclaration.",
  },

  loss: {
    headline: "Sans le récap fiscal, vous devez :",
    items: [
      {
        icon: "🔒",
        title: "Reconstituer vos plus-values manuellement",
        desc: "Recouper l'IFU de votre courtier, calculer les gains réalisés vs latents, gérer les prélèvements selon durée de détention.",
      },
      {
        icon: "🔒",
        title: "Identifier les bonnes cases 2042 et 2074",
        desc: "PFU 31,4 % ou 18,6 % ? Quelle case selon le type de gain ? Vous googlez, vous lisez, vous doutez.",
      },
      {
        icon: "🔒",
        title: "Stocker votre historique année par année",
        desc: "Pour les contrôles fiscaux (3-10 ans), il faut conserver tous les détails. Excel devient vite ingérable.",
      },
    ],
  },

  projection: {
    title: "Ce que contient votre récap fiscal annuel",
    intro: "Pour chaque année fiscale, une synthèse PDF prête pour votre déclaration :",
    rows: [
      { label: "Plus-values réalisées (PEA et CTO)", value: "Calculées", baseline: true },
      { label: "Prélèvements applicables (PFU 31,4 % ou PS 18,6 %)", value: "Pré-déterminés", locked: true },
      { label: "Montants à reporter case 2042", value: "Calculés", locked: true },
      { label: "Montants à reporter case 2074", value: "Calculés", locked: true },
      { label: "Export CSV pour archivage", value: "Inclus", locked: true },
    ],
    conclusion: "Une aide à la déclaration concrète — qui ne remplace ni l'IFU de votre courtier ni un expert-comptable pour les cas complexes, mais qui élimine 80 % du travail manuel et des risques d'erreur.",
  },

  beforeAfter: {
    before: {
      label: "Sans récap fiscal",
      lines: [
        "Recouper l'IFU à la main",
        "Googler les bonnes cases",
        "Risque d'erreur de déclaration",
        "Aucun historique structuré",
      ],
    },
    after: {
      label: "Avec récap fiscal Premium",
      lines: [
        "Synthèse PDF en 2 clics",
        "Cases 2042 et 2074 pré-calculées",
        "PFU vs PS automatiquement appliqués",
        "Historique année par année",
      ],
    },
  },

  value: {
    title: "Pourquoi cet outil change la déclaration",
    body: "La fiscalité du DCA en France est simple sur le papier mais piégeuse en pratique : règle des 5 ans pour le PEA, PFU vs prélèvements sociaux, cases différentes selon retrait/cession, plafond 150 000 €, etc. Le récap fiscal annuel élimine la friction : vous voyez chaque année les bons chiffres et les bonnes cases. C'est le seul outil français qui suit votre situation réelle année après année — pas une simulation générique.",
  },

  priceAnchors: [
    "≈ 1 café par mois",
    "1 erreur de déclaration évitée = bien plus que l'abonnement annuel",
    "Inclus : tout Premium + récap fiscal pour les années suivantes",
  ],

  faq: [
    {
      q: "C'est un document fiscal officiel ?",
      a: "Non — c'est une aide à la déclaration. L'IFU fourni par votre courtier reste le document de référence. Le récap Premium calcule pour vous les montants à reporter case 2042 et 2074, mais ne remplace pas un expert-comptable pour les situations complexes (succession, étranger, optimisation pluriannuelle).",
    },
    {
      q: "Le calcul fonctionne pour PEA et CTO ?",
      a: "Oui. Le récap distingue automatiquement les plus-values PEA (PFU 31,4 % avant 5 ans, PS 18,6 % après) et CTO (PFU 31,4 % systématique sauf option barème).",
    },
    {
      q: "Et si je n'ai rien retiré dans l'année ?",
      a: "Pas de souci — le récap est utile aussi pour visualiser vos plus-values latentes et préparer les retraits futurs. La déclaration n'est nécessaire que sur les gains réalisés (cessions, retraits PEA, dividendes).",
    },
    {
      q: "Puis-je annuler à tout moment ?",
      a: "Oui, en 1 clic depuis votre dashboard. Vos données fiscales restent stockées et accessibles si vous réactivez.",
    },
  ],
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const FEATURES: Record<FeatureKey, FeatureCopy> = {
  "monte-carlo": MONTE_CARLO,
  "save-strategy": SAVE_STRATEGY,
  "pdf-export": PDF_EXPORT,
  "ab-comparison": AB_COMPARISON,
  "recap-fiscal": RECAP_FISCAL,
};

const FALLBACK = MONTE_CARLO;

// ─── Dynamic projection ──────────────────────────────────────────────────────
// Replaces the static projection rows with numbers computed from the user's
// current simulator params. Pass-through if feature doesn't support it.

function buildDynamicProjection(
  key: FeatureKey,
  base: FeatureCopy,
  input: SimulatorInput,
  explicit: boolean,
): FeatureCopy["projection"] {
  const strategyLabel = `${input.monthlyAmount} €/mois · ${input.durationYears} ans · ${input.annualReturnPct} %/an`;
  const titlePrefix = explicit ? "Pour votre stratégie" : "Exemple";

  switch (key) {
    case "monte-carlo": {
      const sim = runSimulation(input);
      const mc = runMonteCarlo(input);
      const totalInvested = input.monthlyAmount * input.durationYears * 12;

      return {
        title: `${titlePrefix} : ${strategyLabel}`,
        intro: "Voici ce que Monte Carlo révèle que le simulateur de base cache :",
        rows: [
          { label: "Scénario moyen", value: formatEur(sim.base.finalValue), baseline: true },
          { label: "Pire cas réaliste (10e percentile)", value: formatEur(mc.finalP10), locked: true },
          { label: "Meilleur cas réaliste (90e percentile)", value: formatEur(mc.finalP90), locked: true, secret: true },
          { label: "Probabilité d'être en plus-value", value: `${mc.probabilityPositive} %`, locked: true, secret: true },
        ],
        conclusion: `Le meilleur cas est plus de ${Math.max(2, Math.floor(mc.finalP90 / Math.max(1, mc.finalP10)))} fois supérieur au pire. C'est exactement l'écart que vous devez comprendre avant d'engager ${formatEur(totalInvested)} sur ${input.durationYears} ans.`,
      };
    }

    case "save-strategy": {
      const theo12 = theoreticalValueAtMonth(input, 12);
      const totalAt12 = input.monthlyAmount * 12;
      const interest12 = theo12 - totalAt12;
      // Example "your real portfolio" offset by +5% to show a realistic ahead scenario.
      const realExample = Math.round(theo12 * 1.05);

      return {
        title: `${titlePrefix} : ${strategyLabel}`,
        intro: "Voici ce qui apparaît sur votre dashboard au mois 12 :",
        rows: [
          { label: "Total investi sur 12 mois", value: formatEur(totalAt12), baseline: true },
          { label: "Valeur théorique attendue", value: formatEur(theo12), locked: true },
          { label: "Votre portefeuille réel (exemple)", value: formatEur(realExample), locked: true },
          { label: "Intérêts composés générés", value: `+ ${formatEur(interest12)}`, locked: true },
        ],
        conclusion: "Toutes ces informations sont perdues si vous ne sauvegardez pas. Dans 12 mois, vous ne pourrez plus les reconstituer.",
      };
    }

    case "ab-comparison": {
      // Keep the A/B example narrative-driven — user's exact strategy isn't
      // enough for a meaningful comparison (we'd need a second strategy).
      // Just reflect their monthly amount in the A label when explicit.
      if (!explicit) return base.projection;
      const altMonthly = Math.round(input.monthlyAmount * 1.5);
      const altYears = Math.max(5, input.durationYears - 5);
      const simA = runSimulation(input);
      const simB = runSimulation({ ...input, monthlyAmount: altMonthly, durationYears: altYears });
      const aInvested = input.monthlyAmount * input.durationYears * 12;
      const bInvested = altMonthly * altYears * 12;

      return {
        title: "Votre stratégie vs une alternative",
        intro: "Deux arbitrages concrets à partir de vos paramètres actuels :",
        rows: [
          {
            label: `A : ${input.monthlyAmount} €/mois × ${input.durationYears} ans (${formatEur(aInvested)} investis)`,
            value: formatEur(simA.base.finalValue),
            baseline: true,
          },
          {
            label: `B : ${altMonthly} €/mois × ${altYears} ans (${formatEur(bInvested)} investis)`,
            value: formatEur(simB.base.finalValue),
            locked: true,
          },
          {
            label: "Différence finale",
            value: formatEur(Math.abs(simA.base.finalValue - simB.base.finalValue)) +
                   (simA.base.finalValue >= simB.base.finalValue ? " pour A" : " pour B"),
            locked: true,
          },
        ],
        conclusion: "Montant vs durée : l'arbitrage n'est jamais évident. La comparaison A/B le chiffre pour vous.",
      };
    }

    case "pdf-export":
    default:
      return base.projection;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = {
  searchParams: Promise<{
    feature?: string;
    monthly?: string;
    years?: string;
    return?: string;
    fees?: string;
  }>;
};

export default async function UpgradePage({ searchParams }: Props) {
  const params = await searchParams;
  const key = (params.feature ?? "") as FeatureKey;
  const base = FEATURES[key] ?? FALLBACK;

  // Parse strategy params (fallback to defaults if missing or invalid).
  const rawMonthly = Number(params.monthly);
  const rawYears = Number(params.years);
  const rawReturn = Number(params.return);
  const rawFees = Number(params.fees);

  const input: SimulatorInput = {
    monthlyAmount: Number.isFinite(rawMonthly) && rawMonthly >= 1 ? rawMonthly : 200,
    durationYears: Number.isFinite(rawYears) && rawYears >= 1 ? rawYears : 20,
    annualReturnPct: Number.isFinite(rawReturn) && rawReturn >= 0 ? rawReturn : 7,
    annualFeesPct: Number.isFinite(rawFees) && rawFees >= 0 ? rawFees : 0.3,
  };

  const hasExplicitParams = params.monthly != null && params.years != null;

  // Override projection with dynamic values per feature.
  const f: FeatureCopy = {
    ...base,
    projection: buildDynamicProjection(key, base, input, hasExplicitParams),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <VisitTracker event={{ name: "open_upgrade", props: { feature: key || "fallback" } }} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 pb-32 sm:pb-12">

        {/* Back link */}
        <Link
          href="/simulateur"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-600 transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour au simulateur
        </Link>

        {/* Plan badge */}
        <div className="mb-5">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full text-white ${f.planColor}`}>
            {f.plan} — {f.price}
          </span>
        </div>

        {/* ── HERO ───────────────────────────────────────────────────────────── */}
        <section className="mb-10">
          <p className="text-sm font-semibold text-red-600 mb-3 leading-snug">
            {f.hero.eyebrow}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-[1.15] tracking-tight">
            {f.hero.title}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            {f.hero.pain}
          </p>
          <PremiumTrialLink className="btn-primary text-base px-6 py-3 inline-flex items-center justify-center" />
        </section>

        {/* ── LOSS AVERSION ─────────────────────────────────────────────────── */}
        {/*
          Reskin DA Premium dark (cohérence avec PremiumLockedOverlay /
          PremiumFix / UpgradePrompt). Le bloc qui ÉNUMÈRE ce qui est
          verrouillé doit visuellement APPARTENIR à l'identité Premium —
          pas être un encart rouge alerte indépendant. Le rouge alerte
          du eyebrow ("❌ Vous voyez un seul chiffre") porte déjà le
          signal pain ; ici on bascule sur "valeur exclusive".
        */}
        <section className="relative mb-10 rounded-2xl border border-slate-800 bg-slate-950 p-6 overflow-hidden">
          {/* Dot texture */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
            aria-hidden
          />
          {/* Soft blue glow */}
          <div
            className="absolute -top-16 -right-16 w-56 h-56 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%)",
            }}
            aria-hidden
          />

          <p className="relative text-xs font-bold text-primary-300 uppercase tracking-wider mb-4">
            {f.loss.headline}
          </p>
          <div className="relative space-y-4">
            {f.loss.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Lock
                  size={18}
                  strokeWidth={1.8}
                  className="text-primary-400 mt-0.5 shrink-0"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{item.title}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROJECTION ────────────────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{f.projection.title}</h2>
          <p className="text-sm text-gray-500 mb-5">{f.projection.intro}</p>

          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            {f.projection.rows.map((row, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i < f.projection.rows.length - 1 ? "border-b border-gray-50" : ""
                } ${row.locked ? "bg-primary-50/40" : ""}`}
              >
                <span className={`text-sm ${row.baseline ? "text-gray-500" : row.locked ? "text-gray-900 font-medium" : "text-gray-700"}`}>
                  {row.locked && <span className="inline-block mr-2">🔒</span>}
                  {row.label}
                </span>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    row.locked
                      ? "text-primary-700"
                      : row.baseline
                      ? "text-gray-500"
                      : "text-gray-900"
                  }`}
                >
                  {/* ⚠️ Une ligne « locked » affichait sa valeur EN CLAIR, avec
                      un simple cadenas à côté du libellé. Sur une page publique
                      qui calcule le vrai Monte Carlo de la stratégie passée en
                      paramètre, ça revenait à vendre la fonctionnalité en la
                      donnant : P10, P90 et probabilité étaient lisibles par
                      n'importe qui. Seule la PREMIÈRE ligne verrouillée reste
                      révélée — c'est l'accroche, elle est vraie et elle
                      concerne le visiteur ; les suivantes sont remplacées. */}
                  {row.secret ? (
                    <span className="text-gray-300 tracking-widest select-none" aria-label="Réservé au plan Premium">
                      ••••••
                    </span>
                  ) : (
                    row.value
                  )}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-gray-700 leading-relaxed italic">
            {f.projection.conclusion}
          </p>
        </section>

        {/* ── BEFORE / AFTER ────────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                {f.beforeAfter.before.label}
              </p>
              <ul className="space-y-2">
                {f.beforeAfter.before.lines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                    <span className="text-gray-500 mt-0.5">✕</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-primary-200 bg-primary-50/50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-3 text-primary-700">
                {f.beforeAfter.after.label}
              </p>
              <ul className="space-y-2">
                {f.beforeAfter.after.lines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-primary-900">
                    <span className="text-primary-600 mt-0.5 font-bold">✓</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── VALUE DEEP-DIVE ───────────────────────────────────────────────── */}
        <section className="mb-10 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">💡 {f.value.title}</h2>
          <p className="text-gray-700 leading-relaxed">{f.value.body}</p>
        </section>

        {/* ── PRICE ANCHOR ──────────────────────────────────────────────────── */}
        <section className="mb-10 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {f.plan} — {f.price}
          </p>
          <p className="text-xs text-gray-500">
            {f.priceYear} <span className="text-gray-500">· {f.yearSavings}</span>
          </p>
          <div className="mt-5 space-y-1">
            {f.priceAnchors.map((anchor, i) => (
              <p key={i} className="text-sm text-gray-500">{anchor}</p>
            ))}
          </div>
        </section>

        {/* ── CTA principal ───────────────────────────────────────────────────
            Mène à /tarifs (page de DÉCISION : choix mensuel/annuel + comparatif
            des plans), PAS directement à Stripe ni un scroll. Le bouton
            "Continuer en Gratuit" reste un Link vers le simulateur. */}
        <section className="mb-10">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1">
              <PremiumTrialLink className="btn-primary text-base px-8 py-4 text-center inline-flex items-center justify-center w-full" />
            </div>
            <Link
              href="/simulateur"
              className="btn-secondary text-base px-6 py-4 text-center"
            >
              Continuer en Gratuit
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            7 jours d&apos;essai gratuit · Annulation en 1 clic · Pas d&apos;engagement
          </p>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Questions fréquentes</h2>
          <div className="space-y-3">
            {f.faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-gray-100 bg-white p-4 open:bg-gray-50/50"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-gray-900">{item.q}</span>
                  <svg
                    className="w-4 h-4 text-gray-500 shrink-0 transition-transform group-open:rotate-180"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Other features teaser ─────────────────────────────────────────── */}
        <section className="mb-10 pt-10 border-t border-gray-100">
          <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1">
                {f.plan} inclut aussi
              </p>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                Tout ce que vous débloquez en 1 abonnement
              </h2>
            </div>
            <Link
              href="/tarifs"
              className="text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors"
            >
              Voir tout sur /tarifs →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(FEATURES)
              .filter(([k, copy]) => k !== key && copy.plan === f.plan)
              .map(([k, copy]) => {
                const Icon = FEATURE_ICONS[k] ?? Activity;
                return (
                  <Link
                    key={k}
                    href={`/upgrade?feature=${k}`}
                    className="group relative flex items-start gap-3.5 rounded-2xl border border-gray-100 bg-white p-4 hover:border-primary-300 hover:bg-primary-50/30 hover:shadow-sm transition-all"
                  >
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 group-hover:bg-primary-100 transition-colors">
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors leading-tight">
                        {copy.shortLabel}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 leading-snug">
                        {copy.shortDesc}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="shrink-0 mt-1 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all"
                      aria-hidden
                    />
                  </Link>
                );
              })}
          </div>
        </section>
      </div>

      {/* ── Sticky mobile CTA ──────────────────────────────────────────────────
          Idem : mène à /tarifs (page de décision). */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white border-t border-gray-100 shadow-lg">
        <PremiumTrialLink className="btn-primary w-full justify-center text-sm py-3 inline-flex items-center" />
      </div>
    </div>
  );
}
