// Les prix affichés, en un seul endroit — et calculés là où ils se déduisent.
//
// ─── Pourquoi ce module existe ──────────────────────────────────────────────
//
// Le 22 août 2026, un audit a relevé que le site annonçait DEUX prix pour le
// même abonnement : « 4,90 €/mois » sur l'accueil, /produits et /upgrade,
// « 4,08 €/mois » sur /tarifs et /a-propos.
//
// Les deux sont vrais — 4,90 est le tarif mensuel, 4,08 est l'annuel ramené au
// mois (49 ÷ 12). Ce n'est donc pas la grille qui est incohérente, c'est son
// affichage. Mais le visiteur qui vient de l'accueil lit 4,90 puis découvre
// 4,08 au moment de décider, sur un site dont l'argument central est
// « transparence totale, pas de boîte noire ». Deux nombres voisins pour la
// même chose, et il cesse de faire confiance au reste.
//
// La cause est celle qu'on a déjà corrigée deux fois cette semaine, sur les
// taux fiscaux puis sur les montants de projection : UN NOMBRE QUE LE SYSTÈME
// CONNAÎT, RECOPIÉ À LA MAIN. Il l'était à une douzaine d'endroits, sans
// source commune — plans.ts ne portait que les identifiants Stripe.
//
// ─── La règle appliquée ici ─────────────────────────────────────────────────
//
// Deux nombres seulement sont saisis : le tarif mensuel et le tarif annuel.
// Tout le reste — l'équivalent mensuel de l'annuel, l'économie en euros, en
// pourcentage — en découle. Aucun de ces dérivés ne doit être réécrit ailleurs.
//
// ⚠️ CES DEUX NOMBRES DOIVENT CORRESPONDRE À STRIPE. Ils sont l'affichage, pas
// la facturation : le montant réellement prélevé vient des price IDs de
// plans.ts. Les faire diverger afficherait un prix et en prélèverait un autre,
// ce qui relève de la pratique commerciale trompeuse (art. L.121-2 code conso)
// bien avant d'être un défaut technique.

/** Tarif mensuel, en euros. Doit correspondre à STRIPE_PREMIUM_MONTHLY_PRICE_ID. */
export const PREMIUM_MENSUEL_EUR = 4.9;

/** Tarif annuel, en euros. Doit correspondre à STRIPE_PREMIUM_YEARLY_PRICE_ID. */
export const PREMIUM_ANNUEL_EUR = 49;

/** Durée de l'essai, en jours. */
export const ESSAI_JOURS = 7;

/** 4.9 → « 4,90 ». Deux décimales, virgule, comme partout sur le site. */
function fr(v: number): string {
  return v.toFixed(2).replace(".", ",");
}

/** « 4,90 €/mois » — le tarif mensuel. */
export const prixMensuel = `${fr(PREMIUM_MENSUEL_EUR)} €/mois`;

/** « 49 €/an » — le tarif annuel. */
export const prixAnnuel = `${PREMIUM_ANNUEL_EUR} €/an`;

/** L'annuel ramené au mois, en nombre — 49/12 = 4,0833… */
export const annuelParMois = PREMIUM_ANNUEL_EUR / 12;

/** « 4,08 €/mois » — l'annuel ramené au mois. TOUJOURS accompagné de `prixAnnuel`. */
export const prixAnnuelParMois = `${fr(annuelParMois)} €/mois`;

/** Ce que l'annuel fait économiser sur douze mois, en euros. */
export const economieAnnuelleEur = PREMIUM_MENSUEL_EUR * 12 - PREMIUM_ANNUEL_EUR;

/** « 9,80 € » — l'économie, formatée. */
export const economieAnnuelle = `${fr(economieAnnuelleEur)} €`;

/** « 17 % » — l'économie en pourcentage, arrondie à l'entier. */
export const economieAnnuellePct = `${Math.round(
  (economieAnnuelleEur / (PREMIUM_MENSUEL_EUR * 12)) * 100
)} %`;
