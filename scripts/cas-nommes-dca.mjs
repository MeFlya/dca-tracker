// Les quatre cas nommés — versement unique contre étalement, en euros réels.
//
// ─── Ce que ce script produit, et pour qui ──────────────────────────────────
//
// Des chiffres bruts, destinés à être vérifiés par quelqu'un d'autre avant
// publication. Aucune mise en forme, aucune inférence statistique, aucune
// revendication de fréquence : une date réelle, un montant, un résultat.
//
// ⚠️ AUCUN TER N'EST APPLIQUÉ, et c'est délibéré.
//
// La série contient les COURS DE CLÔTURE d'un ETF coté. La valeur liquidative
// d'un fonds est déjà nette de ses frais de gestion — ils sont prélevés en
// continu sur l'actif. Retrancher un TER par-dessus le compterait deux fois.
//
// C'est un défaut du script voisin dca-vs-lumpsum.mjs, qui applique
// TER_ANNUEL = 0,20 %/an à une série de prix : l'effet est petit et ce script
// interdit déjà de publier ses pourcentages, mais l'erreur est réelle et elle
// se verrait sur une pièce qu'on invite un tiers à recalculer.
//
// Le TER du fonds (0,45 %/an pour XMWO) est donc DÉJÀ dans les chiffres. Il se
// déclare en méthodologie, il ne se soustrait pas.
//
// ─── Autres hypothèses, toutes à publier ───────────────────────────────────
//
// · Les liquidités en attente d'investissement ne rapportent rien. Hypothèse
//   conservatrice qui DÉFAVORISE l'étalement — à dire, parce qu'elle joue
//   contre la stratégie que le nom du site pourrait laisser croire qu'on
//   défend.
// · Enveloppe PEA : aucune fiscalité en cours de route.
// · Aucun frais de courtage. Ils pénaliseraient l'étalement (plusieurs ordres
//   au lieu d'un) — seconde hypothèse conservatrice dans le même sens.
// · Parts fractionnées autorisées.
//
// Usage : node scripts/cas-nommes-dca.mjs [--csv]

import { readFileSync } from "node:fs";

const SERIE = "src/data/msci-world-eur.json"; // la série PUBLIÉE — la pièce doit être reproductible avec l'outil
const MONTANT = 24_000;
const ETALEMENTS = [3, 6, 12, 24];
const CSV = process.argv.includes("--csv");

/**
 * Libellés délibérément prudents, et deux cas plutôt qu'un.
 *
 * Le sommet MONDIAL de l'indice est d'octobre 2007, hors de portée de cette
 * série qui démarre en janvier 2008. On n'écrit donc jamais « au sommet » sans
 * préciser de quoi.
 *
 * Mesuré sur les données disponibles, le plus haut de la fenêtre 2008-2009 est
 * MAI 2008 (22,69), et la chute qui suit atteint −38,8 % en février 2009.
 * Février 2008 (22,10) se situe 2,7 % en dessous : c'est un plateau
 * d'avant-krach, pas un sommet.
 *
 * Les deux sont calculés, et c'est délibéré : ne garder que le plus favorable
 * serait choisir son cas après avoir vu le résultat.
 *
 * ⚠️ LES LIBELLÉS VOYAGENT SEULS. Ils partent dans un CSV sous CC-BY, donc
 * dans ce que republiera n'importe qui, détaché de cette page et de ses
 * précautions. « Au sommet de la série » était exact et n'aurait pas survécu à
 * la première citation — la parenthèse tombe, « au sommet » reste. Chaque
 * libellé porte donc sa propre restriction — et une seule chacun. « février
 * 2009 — le creux, cas défavorable à l'étalement » en revendiquait DEUX, dont
 * la seconde est fausse : voir ci-dessous.
 *
 * ─── LE CREUX N'EST PAS LE PIRE MOMENT POUR ÉTALER ──────────────────────────
 *
 * C'est la trouvaille de la grille, et elle est contre-intuitive.
 *
 * Partir du creux (février 2009) rend l'étalement MOINS perdant que partir un
 * mois après : −17,8 % contre −18,9 % à douze mois, et l'écart tient aux quatre
 * durées sans exception.
 *
 * La formule dit pourquoi. Le creux minimise P₀ ; le pire cas maximise H/P₀.
 * Rien n'oblige les deux à tomber le même mois. En partant du creux, la fenêtre
 * d'achat attrape encore le creux lui-même et le mois suivant — deux mois bas
 * qui tirent H vers le bas. Un mois plus tard, on perd ces deux mois et on gagne
 * un mois de remontée à l'autre bout : H monte plus vite que P₀ ne baisse.
 * Mesuré : P₀ recule de 1,8 %, H de 3,1 %.
 *
 * VÉRIFIÉ SUR TOUTE LA SÉRIE, pas seulement sur 2009 — sinon ce serait une
 * anecdote et pas un mécanisme. Sur les 211 fenêtres de douze mois disponibles,
 * le minimum de P₀/H tombe en mars 2009, soit un mois après le minimum de P₀
 * (février 2009). Et les mois suivants du classement — octobre 2020, mars 2020,
 * octobre 2023 — sont eux aussi des phases de remontée, pas des creux.
 *
 * Ce qui pénalise l'étalement n'est donc pas d'entrer au plus bas, c'est
 * d'acheter pendant une remontée. Et la remontée la plus raide commence juste
 * APRÈS le creux.
 *
 * LES DEUX MOIS SONT PUBLIÉS. Affirmer « mars est pire que février » sans
 * fournir les deux rendrait l'affirmation non recalculable, ce qui est
 * exactement ce qu'on reproche aux autres. Six cas, vingt-quatre lignes.
 *
 * (Ironie à noter : on allait supprimer mars 2009 au nom de la rigueur
 * méthodologique, et c'est mars 2009 qui porte la seule observation
 * contre-intuitive de la grille. Retirer un cas parce qu'il est « moins pur »
 * aurait retiré l'information.)
 */
const CAS = [
  { debut: "2008-05", nom: "mai 2008 — plus haut de la série, pas du marché" },
  { debut: "2008-02", nom: "février 2008 — 2,7 % sous le plus haut de la série" },
  { debut: "2020-01", nom: "janvier 2020 — juste avant le Covid" },
  { debut: "2022-01", nom: "janvier 2022 — le krach que les gens ont vécu" },
  { debut: "2009-02", nom: "février 2009 — le creux de la série" },
  { debut: "2009-03", nom: "mars 2009 — le pire mois pour l'étalement, un mois après le creux" },
];

const serie = JSON.parse(readFileSync(SERIE, "utf8")).data;
const idx = (m) => serie.findIndex((d) => d.month === m);

/**
 * Trajectoire mois par mois. `D = 1` est le versement unique.
 * Renvoie la valeur finale, le nombre de parts, et le nombre de mois passés
 * sous le capital effectivement versé à cet instant.
 */
function simuler(debut, D) {
  const i0 = idx(debut);
  const versement = MONTANT / D;
  let parts = 0;
  let verse = 0;
  let moisSousEau = 0;

  for (let t = i0; t < serie.length; t++) {
    if (t - i0 < D) {
      parts += versement / serie[t].value;
      verse += versement;
    }
    // « Sous l'eau » : la valeur du portefeuille est inférieure à ce qui a été
    // versé À CET INSTANT. Comparer au montant TOTAL pendant la phase
    // d'étalement compterait comme perte de l'argent pas encore investi.
    if (parts * serie[t].value < verse - 0.01) moisSousEau++;
  }

  return {
    parts,
    valeur: parts * serie.at(-1).value,
    moisSousEau,
  };
}

/** Prix de départ, moyennes arithmétique et harmonique de la fenêtre. */
function termes(debut, D) {
  const i0 = idx(debut);
  const p = serie.slice(i0, i0 + D).map((d) => d.value);
  const A = p.reduce((s, x) => s + x, 0) / p.length;
  const H = p.length / p.reduce((s, x) => s + 1 / x, 0);
  return { P0: p[0], A, H };
}

const eur = (v) =>
  Math.round(v).toLocaleString("fr-FR").replace(/ | /g, " ") + " €";

if (CSV) {
  console.log("cas,debut,strategie,etalement_mois,valeur_finale_eur,ecart_vs_unique_eur,mois_sous_eau,P0,H,H_inferieur_P0");
}

console.log(`\nSérie : ${JSON.parse(readFileSync(SERIE, "utf8")).source}`);
console.log(
  "⚠️ LES QUATRE DURÉES SONT RAPPORTÉES, TOUJOURS. Choisir après coup celle qui\n" +
    "   arrange revient à fabriquer le résultat : sur janvier 2020, l'étalement\n" +
    "   gagne à 3, 6 et 12 mois et PERD à 24. Une durée se fixe AVANT de regarder,\n" +
    "   et la pièce publie les quatre."
);
console.log(`Période : ${serie[0].month} → ${serie.at(-1).month}`);
console.log(`Montant : ${eur(MONTANT)} · aucun TER ajouté (les cours sont déjà nets) · liquidités à 0 %\n`);

for (const cas of CAS) {
  if (idx(cas.debut) < 0) {
    console.log(`  ${cas.debut} — HORS SÉRIE, ignoré\n`);
    continue;
  }
  const unique = simuler(cas.debut, 1);

  console.log(`═══ ${cas.debut} — ${cas.nom} ═══\n`);
  console.log("  stratégie          valeur au " + serie.at(-1).month + "     écart      mois sous l'eau   H < P₀");
  console.log("  ────────────────────────────────────────────────────────────────────────");
  console.log(
    `  versement unique   ${eur(unique.valeur).padStart(12)}         —        ` +
      `${String(unique.moisSousEau).padStart(3)} mois          —`
  );

  for (const D of ETALEMENTS) {
    const e = simuler(cas.debut, D);
    const { P0, H } = termes(cas.debut, D);
    const gagne = H < P0;
    const ecart = e.valeur - unique.valeur;
    console.log(
      `  étalé sur ${String(D).padStart(2)} mois   ${eur(e.valeur).padStart(12)}  ${(ecart >= 0 ? "+" : "") + eur(ecart).padStart(9)}   ` +
        `${String(e.moisSousEau).padStart(3)} mois      ${gagne ? "oui ✓" : "non ✗"}   ` +
        `${gagne === ecart > 0 ? "" : "⚠️ DÉSACCORD"}`
    );
    if (CSV) {
      console.log(
        `"${cas.nom}",${cas.debut},etalement,${D},${e.valeur.toFixed(2)},${ecart.toFixed(2)},${e.moisSousEau},${P0.toFixed(4)},${H.toFixed(4)},${gagne}`
      );
    }
  }
  console.log("");
}

// ─── Contrôle : le critère H < P₀ prédit-il le gagnant sans exception ? ─────
{
  let total = 0;
  let desaccords = 0;
  for (const cas of CAS) {
    if (idx(cas.debut) < 0) continue;
    const u = simuler(cas.debut, 1);
    for (const D of ETALEMENTS) {
      const e = simuler(cas.debut, D);
      const { P0, H } = termes(cas.debut, D);
      total++;
      if (H < P0 !== e.valeur > u.valeur) desaccords++;
    }
  }
  console.log(`Contrôle « l'étalement gagne ⟺ H < P₀ » : ${total} cas, ${desaccords} désaccord(s) ${desaccords === 0 ? "✓" : "✗"}`);
  console.log("Chaque résultat s'explique par la formule, pas seulement par la simulation.\n");
}
