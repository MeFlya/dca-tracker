// Registre des fiches ETF v2 (14/10/2026).
//
// Une fiche /etf/<mnémo> passe au gabarit v2 dès que son fichier de faits est
// inscrit ici ; les autres gardent le rendu actuel (page.tsx). Le title et la
// meta v2 suivent le même registre : ils changent dans le même déploiement
// que le contenu qui les rend vrais (plan §1.7, règle 9).
//
// Le contrôle tourne à l'import, donc à chaque build : un fait sans source ou
// sans date, un document inconnu, une date future, un title trop long…
// arrêtent le build (src/lib/fiche-etf-v2/valider.ts).

import { ETF_LIST } from "@/lib/etf-config";
import type { FicheEtfV2 } from "@/lib/fiche-etf-v2/types";
import { validerFiches } from "@/lib/fiche-etf-v2/valider";
import {
  DCA_VERSEMENT_MENSUEL,
  MISE_EN_LIGNE_V2,
  dcaAnnuel,
  descriptionV2,
  moisDepuis,
  titreV2,
} from "@/lib/fiche-etf-v2/textes";
import { FICHE_CW8 } from "./cw8";
import { FICHE_DCAM } from "./dcam";
import { FICHE_PAEEM } from "./paeem";
import { FICHE_PUST } from "./pust";
import { FICHE_WPEA } from "./wpea";

const FICHES: FicheEtfV2[] = [FICHE_CW8, FICHE_DCAM, FICHE_PAEEM, FICHE_PUST, FICHE_WPEA];

const AUJOURDHUI = new Date().toISOString().slice(0, 10);

validerFiches(FICHES, {
  catalogue: ETF_LIST.map((e) => e.displaySymbol),
  aujourdhui: AUJOURDHUI,
  titre: titreV2,
  description: descriptionV2,
  dca: dcaAnnuel,
  moisDepuis,
  versementMensuel: DCA_VERSEMENT_MENSUEL,
});

// Mise en ligne (14/10/2026) : une build de production avant MISE_EN_LIGNE_V2
// publierait les fiches v2 trop tôt, avec un dateModified dans le futur.
// Aperçu local seulement : FICHES_V2_APERCU=1 npm run build.
if (MISE_EN_LIGNE_V2 > AUJOURDHUI && process.env.FICHES_V2_APERCU !== "1") {
  throw new Error(
    `Fiches ETF v2 : mise en ligne prévue le ${MISE_EN_LIGNE_V2} (textes.ts, MISE_EN_LIGNE_V2), nous sommes le ${AUJOURDHUI}. ` +
      "Pour un aperçu local : FICHES_V2_APERCU=1. Pour déployer : mettre MISE_EN_LIGNE_V2 à la date du jour.",
  );
}

/** Mnémoniques des fiches v2, dans l'ordre du registre (cités par /methodologie). */
export const MNEMOS_V2: readonly string[] = FICHES.map((f) => f.mnemo);

export const FICHES_V2: Readonly<Record<string, FicheEtfV2>> = Object.fromEntries(FICHES.map((f) => [f.mnemo, f]));

export function ficheV2(mnemo: string): FicheEtfV2 | null {
  return FICHES_V2[mnemo] ?? null;
}
