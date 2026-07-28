// Métriques de contenu du site — CALCULÉES, jamais codées en dur.
//
// Servent de réassurance honnête tant que les compteurs d'usage réels n'ont
// pas atteint un volume présentable (cf. LiveSocialProof). Comme elles sont
// dérivées des sources de vérité, elles ne peuvent pas devenir fausses quand
// le contenu évolue : ajouter un comparatif met le chiffre à jour tout seul.
//
// Server-only par nature (importe des modules de données volumineux) : ne pas
// appeler depuis un composant client, passer le résultat en props.

import { ETF_COMPARISON_LIST } from "./etf-comparisons";
import { GLOSSARY_TERMS } from "./glossary-terms";
import { getAvailableRange, getDatasetMeta } from "./backtest";
import type { ContentMetrics } from "@/components/home/LiveSocialProof";

// Trois termes ont leur propre page approfondie au lieu de passer par la route
// [slug] partagée. Ils ne sont donc PAS dans GLOSSARY_TERMS et doivent être
// comptés à part, sinon le total est sous-évalué de 3 (12 au lieu de 15, alors
// que le sitemap déclare bien 15 pages de termes).
// ⚠️ Ajouter ici tout nouveau terme qui recevrait sa page dédiée.
const DEDICATED_GLOSSARY_PAGES = ["dca", "etf", "interets-composes"] as const;

export function getSiteContentMetrics(): ContentMetrics {
  return {
    comparisons: ETF_COMPARISON_LIST.length,
    glossaryTerms:
      Object.keys(GLOSSARY_TERMS).length + DEDICATED_GLOSSARY_PAGES.length,
    // pointsCount = nombre de clôtures mensuelles réelles du dataset.
    backtestMonths: getDatasetMeta().pointsCount,
    backtestFromYear: Number(getAvailableRange().min.slice(0, 4)),
  };
}
