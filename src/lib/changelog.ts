// Journal des changements publics.
//
// Règle de rédaction : on inscrit ici tout changement qui touche à un
// ENGAGEMENT pris envers les utilisateurs, ou à un chiffre affiché.
// Y compris — surtout — quand le changement n'est pas flatteur.
//
// La raison est pratique autant qu'éthique : le dépôt est public, donc chaque
// modification est de toute façon traçable dans l'historique git. Entre
// l'assumer soi-même à une date claire et se le faire trouver, il n'y a pas de
// débat. Un journal qui n'enregistre que les bonnes nouvelles ne vaut rien.
//
// Ne pas inscrire ici les changements purement techniques (refactors, correctifs
// invisibles, dépendances) : ce n'est pas une liste de commits.

export type ChangelogKind =
  | "engagement" // une promesse faite aux utilisateurs change
  | "correction" // un contenu ou un chiffre était faux, il est corrigé
  | "produit"; // une fonctionnalité apparaît, change ou disparaît

export interface ChangelogEntry {
  /** Date ISO YYYY-MM-DD du changement effectif. */
  date: string;
  kind: ChangelogKind;
  title: string;
  /** Ce qui change, factuellement. */
  body: string;
  /** Pourquoi. Obligatoire pour un `engagement` : c'est ce qui a de la valeur. */
  why?: string;
}

/** Du plus récent au plus ancien. Garder cet ordre à la main. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-07-29",
    kind: "correction",
    title: "Décalage d'un mois dans la série de données historiques",
    body:
      "La série de prix mensuels qui alimente tous les backtests était décalée d'un cran : la valeur étiquetée « mars 2020 » portait en réalité la clôture d'avril 2020. Le défaut existait depuis la construction initiale de la série. Il a été trouvé en vérifiant une tout autre chose — que la série était bien libellée en euros et non en dollars — quand une valeur impossible est apparue : le mois étiqueté mars 2020, celui du krach Covid, affichait une hausse de 9,5 %. Comparée aux performances annuelles de référence du MSCI World en euros, la série s'écarte de 6,7 points en moyenne telle quelle, et de 0,5 point une fois décalée d'un mois ; neuf années civiles concordent sans exception. Conséquence : les montants affichés SOUS-ESTIMENT le résultat réel d'environ 1 à 2 %. Sur les trois pages publiées, 25 199 € devient 25 641 €, 15 352 € devient 15 686 €, et 123 790 € devient 125 187 €. La série n'a pas été corrigée en décalant simplement les étiquettes — cela aurait remplacé une erreur silencieuse par une autre : elle est reconstruite depuis la source et validée contre une seconde série indépendante, un ETF d'un autre émetteur avec une autre méthode de réplication. En attendant, un bandeau signale l'anomalie sur l'outil et sur les pages concernées.",
    why:
      "Cette erreur était invisible de l'intérieur : la série était continue, cohérente, et toutes ses valeurs étaient plausibles. Rien dans la donnée elle-même ne pouvait la trahir — il a fallu la confronter à ce qui s'est réellement passé à une date connue. C'est devenu la règle pour toute donnée qui alimente une fonctionnalité payante : elle se contrôle contre une source dont elle ne peut pas être dérivée. Deux contrôles automatiques ont été ajoutés — l'un refuse de valider une série si des mois de référence connus n'ont pas le signe attendu, l'autre vérifie que la corrélation entre les deux séries est bien maximale à décalage zéro.",
  },
  {
    date: "2026-07-28",
    kind: "engagement",
    title: "Je reviens sur l'engagement « aucun lien d'affiliation »",
    body:
      "La page À propos affirmait « je ne prendrai pas de commission de broker, aucun lien d'affiliation sur le site ». Cet engagement est retiré. Des liens affiliés vers des courtiers vont être mis en place. Ils seront signalés au-dessus de chaque lien concerné, et la liste des partenaires ainsi que leur rémunération sont publiées sur la page transparence.",
    why:
      "Le site ne dégage aujourd'hui aucun revenu récurrent. Sans revenu, il finit par fermer, ce qui est le seul scénario où les utilisateurs perdent vraiment quelque chose. Entre tenir un engagement absolu jusqu'à l'arrêt du projet et le réviser en le disant clairement, j'ai choisi la seconde option. Ce que je maintiens en revanche : le classement des courtiers n'est pas à vendre, les courtiers non partenaires restent présentés à égalité, et un lien direct non affilié reste disponible sur chaque fiche.",
  },
  {
    date: "2026-07-28",
    kind: "correction",
    title: "Les compteurs de la page d'accueil affichaient des valeurs planchers",
    body:
      "Le bloc de statistiques de la page d'accueil appliquait des valeurs minimales codées en dur — 247 investisseurs, 180 stratégies, 620 mois — sous un libellé « Données réelles ». Tant que les compteurs réels restaient en dessous, ce sont ces minimums qui s'affichaient. Ces planchers sont supprimés. Le bloc affiche désormais soit les compteurs réels au-delà d'un seuil, soit des mesures de contenu du site (nombre de comparatifs, mois de données historiques, termes de glossaire), calculées depuis les sources et donc exactes. Un second défaut, indépendant, a été corrigé au passage : une animation de comptage remettait l'affichage à zéro tant que le bloc n'était pas atteint en défilant, si bien qu'une partie des visiteurs voyait trois zéros.",
    why:
      "Le positionnement du site repose sur des chiffres vérifiables. Un chiffre de réassurance gonflé, sur un site qui vend la transparence, est une contradiction — et le code étant public, il était de toute façon lisible par n'importe qui.",
  },
  {
    date: "2026-07-28",
    kind: "correction",
    title: "Mention « Hébergement en Europe » retirée",
    body:
      "La page de connexion affichait « Hébergement en Europe ». C'est inexact : l'hébergement, l'authentification et l'envoi d'emails passent par des prestataires américains. La mention est retirée. La politique de confidentialité, qui décrivait déjà correctement ces transferts, faisait foi.",
  },
];
