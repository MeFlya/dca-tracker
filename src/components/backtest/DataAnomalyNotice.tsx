// Bandeau d'anomalie sur la série historique — TEMPORAIRE.
//
// ─── Pourquoi il existe ─────────────────────────────────────────────────────
//
// Le 29 juillet 2026, la série de prix mensuels qui alimente tous les backtests
// s'est révélée décalée d'un cran : la valeur étiquetée « mars 2020 » portait la
// clôture d'avril 2020. Les montants affichés SOUS-ESTIMENT le résultat réel
// d'environ 1 à 2 %.
//
// Entre le moment où on sait et le moment où la série corrigée est en ligne, des
// pages publiques affichent des chiffres faux présentés comme réels, sur une
// fonctionnalité vendue. Un défaut qu'on ignore et un défaut qu'on connaît ne
// relèvent pas de la même catégorie : le second se signale.
//
// ─── Comment le retirer ─────────────────────────────────────────────────────
//
// Passer ANOMALIE_ACTIVE à false une fois la série reconstruite ET validée par
// `node scripts/verifier-serie-backtest.mjs`. Un seul endroit à toucher : ne pas
// dupliquer ce texte dans les pages, sinon il en restera un quelque part.

// Éteint le 29/07/2026 : la série a été reconstruite avec la bonne conversion
// de fuseau et revalidée (mars 2020 à −10,9 %, avril à +9,5 %, 0,5 point d'écart
// aux références annuelles). Les chiffres publiés sont justes.
// Le composant est conservé : il resservira, et le rallumer coûte une ligne.
const ANOMALIE_ACTIVE = false;

/** Date de détection — celle du commit de diagnostic, pas celle d'écriture. */
const DETECTEE_LE = "29 juillet 2026";

export function DataAnomalyNotice({
  variant = "page",
}: {
  /** `page` : pages éditoriales. `tool` : au-dessus d'un résultat calculé. */
  variant?: "page" | "tool";
}) {
  if (!ANOMALIE_ACTIVE) return null;

  return (
    <div
      role="note"
      className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 mb-6"
    >
      <p className="text-sm font-semibold text-amber-900 mb-1.5">
        {variant === "tool"
          ? "Résultat provisoire"
          : `Correction en cours — anomalie détectée le ${DETECTEE_LE}`}
      </p>
      <p className="text-sm text-amber-800 leading-relaxed">
        {variant === "tool" ? (
          <>
            Une anomalie d&apos;alignement détectée le {DETECTEE_LE} fait{" "}
            <strong>sous-estimer</strong> ce calcul d&apos;environ 1 à 2 %.
            Reconstruction de la série en cours —{" "}
            <a href="/changelog" className="underline hover:text-amber-900">
              détail au journal des changements
            </a>
            .
          </>
        ) : (
          <>
            Un décalage d&apos;un mois dans l&apos;alignement de notre série de
            données affecte les valeurs de cette page. Les montants affichés{" "}
            <strong>sous-estiment</strong> le résultat réel d&apos;environ 1 à
            2 %. La série est en cours de reconstruction et de validation contre
            une source indépendante ; les chiffres corrigés et le détail de
            l&apos;anomalie sont publiés au{" "}
            <a href="/changelog" className="underline hover:text-amber-900">
              journal des changements
            </a>
            .
          </>
        )}
      </p>
    </div>
  );
}
