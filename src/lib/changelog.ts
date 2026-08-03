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
//
// ⚠️ RÈGLE SUR LE TEMPS DES VERBES, apprise en la enfreignant le 29/07/2026.
// Une entrée annonçait « la série est reconstruite et validée » alors que la
// reconstruction n'avait pas commencé — pendant qu'un bandeau, à deux clics de
// là, annonçait « reconstruction en cours ». Deux surfaces du même site, le même
// jour, dont l'une donnait pour fait ce que l'autre donnait pour en cours.
//
// Dans un journal des changements, LE TEMPS DE CHAQUE VERBE EST UNE AFFIRMATION
// FACTUELLE, au même titre qu'un chiffre. Ce qui n'est pas encore vrai s'écrit
// au futur, et l'entrée se met à jour quand ça le devient. Un titre « ce qu'on a
// fait » n'autorise pas à écrire au passé ce qui reste à faire.

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
    date: "2026-08-03",
    kind: "correction",
    title: "Le décalage d'un mois était revenu, et cette page affirmait le contraire",
    body:
      "Du 2 au 3 août 2026, la série de prix qui alimente les backtests était de nouveau décalée d'un cran : le mois de mars 2020, celui du krach Covid, affichait une hausse de 9,5 %. C'est exactement le défaut annoncé comme corrigé le 29 juillet, et pendant deux jours cette page a donc affirmé qu'il était réglé alors qu'il ne l'était plus. Voici pourquoi. Le 29 juillet, le fichier de données a été reconstruit à la main, mais le script qui le régénère automatiquement chaque mois n'a pas été corrigé. Le 2 août, ce script a tourné comme prévu, a réappliqué la mauvaise conversion de fuseau horaire et a réécrit la série fausse — sans que rien ne s'y oppose. Les montants affichés sous-estimaient de nouveau le résultat réel : un versement de 100 € par mois depuis janvier 2020 affichait 12 494 € au lieu de 12 713 €. La cause est corrigée dans le script lui-même, et non plus seulement dans le fichier : l'horodatage est désormais ramené à l'heure de la place de cotation avant d'en lire le mois, et le script refuse de produire une série si cette information manque, au lieu de deviner. Deux défauts voisins ont été corrigés au passage : la série se terminait par le mois en cours, incomplet — deux jours de bourse présentés comme un mois entier — et il est désormais retiré.",
    why:
      "Un contrôle automatique existait pourtant depuis le 29 juillet, et il détectait précisément ce décalage. Il n'a rien empêché pour deux raisons qui valent d'être dites. D'abord il n'était branché nulle part : aucun automate ne l'exécutait. Ensuite, et c'est pire, il n'échouait jamais — il affichait des alertes et se terminait normalement, si bien que même branché il aurait laissé passer. Un garde-fou qui signale sans bloquer suppose que quelqu'un lit les journaux d'une tâche mensuelle, ce que personne ne fait. Il s'arrête maintenant en erreur, et le rafraîchissement mensuel refuse de publier une série qui ne passe pas ses contrôles : mieux vaut une mise à jour qui échoue qu'un chiffre faux en ligne. La leçon est moins technique qu'il n'y paraît : corriger le symptôme sans corriger ce qui le produit garantit son retour, et le rend plus difficile à voir la seconde fois puisqu'on le croit réglé.",
  },
  {
    date: "2026-07-29",
    kind: "correction",
    title: "Décalage d'un mois dans la série de données historiques",
    body:
      "La série de prix mensuels qui alimente tous les backtests était décalée d'un cran : la valeur étiquetée « mars 2020 » portait en réalité la clôture d'avril 2020. Le défaut existait depuis la construction initiale de la série. Il a été trouvé en vérifiant une tout autre chose — que la série était bien libellée en euros et non en dollars — quand une valeur impossible est apparue : le mois étiqueté mars 2020, celui du krach Covid, affichait une hausse de 9,5 %. Comparée aux performances annuelles de référence du MSCI World en euros, la série s'écarte de 6,7 points en moyenne telle quelle, et de 0,5 point une fois décalée d'un mois ; neuf années civiles concordent sans exception. Conséquence : les montants affichés SOUS-ESTIMENT le résultat réel d'environ 1 à 2 %. Sur les trois pages publiées, 25 199 € devient 25 641 €, 15 352 € devient 15 686 €, et 123 790 € devient 125 187 €. La cause a été identifiée : l'interface de données renvoie, pour chaque barre mensuelle, un horodatage de DÉBUT de période exprimé à l'heure de la place de cotation. Le convertir en temps universel le recule d'un jour et le fait basculer dans le mois précédent — d'où le décalage d'un cran sur toute la série. La série a été reconstruite avec la bonne conversion, et le mois en cours, incomplet, en a été retiré. Contrôles passés : le mois de mars 2020 affiche désormais −10,9 % et avril 2020 +9,5 %, et l'écart aux performances annuelles de référence est tombé de 6,7 à 0,5 point. Les chiffres corrigés sont en ligne : 25 199 € devient 25 408 €, 15 352 € devient 15 467 €, et 123 790 € devient 124 828 €. Un contrôle supplémentaire reste à faire — la comparaison avec une seconde série indépendante, issue d'un autre émetteur — et il sera consigné ici.",
    why:
      "Cette erreur était invisible de l'intérieur : la série était continue, cohérente, et toutes ses valeurs étaient plausibles. Rien dans la donnée elle-même ne pouvait la trahir — il a fallu la confronter à ce qui s'est réellement passé à une date connue. C'est devenu la règle pour toute donnée qui alimente une fonctionnalité payante : elle se contrôle contre une source dont elle ne peut pas être dérivée. Un premier contrôle automatique est en place et refuse désormais de valider une série si des mois de référence connus — mars 2020, avril 2020, octobre 2008 — n'ont pas le signe attendu. Un second est écrit mais ne pourra s'activer qu'avec la seconde série : il vérifiera que la corrélation entre les deux est bien maximale à décalage zéro. À noter, parce que c'est la partie instructive : une première tentative de vérification a conclu à tort que la série d'origine était juste, parce qu'elle la comparait à une extraction refaite avec la MÊME conversion de fuseau — donc au même défaut. Une vérification qui reproduit le bug qu'elle cherche ne prouve rien.",
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
