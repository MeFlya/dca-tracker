// Bloc de fin d'article — l'étape suivante, et pas un avertissement légal.
//
// ─── Pourquoi ce composant existe ───────────────────────────────────────────
//
// Un audit des cinquante URL de Search Console a montré que les onze pages qui
// reçoivent du trafic se terminent toutes sur un bloc inerte — mention légale
// ou grille de liens — et qu'AUCUNE page du site ne propose d'enregistrer un
// plan de versements. La fonctionnalité ouverte le 29 juillet, devenue la
// totalité du modèle économique, n'existait que dans un bouton situé à
// l'intérieur du simulateur.
//
// Or ces pages attrapent quelqu'un à l'instant exact de la décision : il vient
// de choisir son montant mensuel ou son ETF. C'est le seul moment où
// « enregistrez votre plan et suivez-le » a un sens évident. On lui proposait
// un simulateur générique et on le laissait repartir.
//
// ─── Où le poser, et où NE PAS le poser ─────────────────────────────────────
//
// Les douze premières URL font 83 % des clics du site ; à partir du rang 28,
// plus aucune page n'a le moindre clic sur quatre-vingt-dix jours. Ce bloc va
// donc sur le haut du classement, pas sur les quatre-vingts pages. Sur une
// page que personne ne visite, il coûte le même temps et ne rapporte rien.
//
// Il se place APRÈS le contenu et AVANT l'avertissement légal. L'avertissement
// reste — il est nécessaire et il fait partie du positionnement — mais il ne
// doit pas être la dernière chose que lit quelqu'un au sommet de son intention.

import Link from "next/link";

interface Props {
  /**
   * Montant mensuel à préremplir. La page « investir 300 €/mois » ouvre le
   * simulateur sur 300 €, pas sur la valeur par défaut : refaire saisir au
   * lecteur ce que le titre de la page annonçait déjà est une friction gratuite.
   */
  montantMensuel?: number;
  /** Durée en années. */
  duree?: number;
  /**
   * Frais annuels en points de pourcentage (0.2 = 0,20 %). À ne passer QUE
   * s'il s'agit du TER réel d'un ETF présenté sur la page. Omis, le simulateur
   * applique sa propre valeur par défaut — ce qui vaut mieux qu'un chiffre
   * choisi au jugé, comme le « 0,25 % » qui traînait dans l'ancien appel et
   * n'était le TER d'aucun ETF du site.
   */
  fraisPct?: number;
  /** Titre du bloc. Un défaut correct existe : ne surcharger que si la page appelle une formulation propre. */
  titre?: string;
  className?: string;
}

export function EtapeSuivante({
  montantMensuel,
  duree = 20,
  fraisPct,
  titre = "Passez de la lecture à votre plan",
  className,
}: Props) {
  const params = new URLSearchParams();
  if (montantMensuel) params.set("monthly", String(montantMensuel));
  params.set("years", String(duree));
  params.set("return", "7");
  if (fraisPct != null) params.set("fees", String(fraisPct));

  return (
    <div
      className={`rounded-2xl border border-primary-100 bg-primary-50/40 p-6 mb-10 ${className ?? ""}`}
    >
      <p className="text-base font-bold text-gray-900 mb-2">{titre}</p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-xl">
        {montantMensuel
          ? `Le simulateur s'ouvre sur ${montantMensuel} €/mois. Ajustez si besoin, puis enregistrez votre plan : vous saisissez votre versement chaque mois et vous comparez le réel à la projection.`
          : "Ouvrez le simulateur, réglez votre montant, puis enregistrez votre plan : vous saisissez votre versement chaque mois et vous comparez le réel à la projection."}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/simulateur?${params.toString()}`}
          className="btn-primary text-sm px-5 py-2.5 inline-block btn-lift"
        >
          {montantMensuel
            ? `Ouvrir sur ${montantMensuel} €/mois →`
            : "Ouvrir le simulateur →"}
        </Link>
        {/* La gratuité est dite ICI plutôt que dans le bouton : personne ne
            clique sur un verbe seul, et « sans carte bancaire » est ce qui
            lève l'objection réelle à cet endroit du parcours. */}
        <span className="text-xs text-gray-500">
          Gratuit, sans carte bancaire.
        </span>
      </div>
    </div>
  );
}
