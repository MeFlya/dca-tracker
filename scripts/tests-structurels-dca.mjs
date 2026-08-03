// Tests structurels de la décomposition dérive / dispersion.
//
// ─── Ce qu'on teste et pourquoi ─────────────────────────────────────────────
//
// Le rapport du nombre de parts obtenues par étalement (B) et par versement
// unique (A) se décompose exactement :
//
//     N_B / N_A  =  P₀ / H  =  (P₀ / A) × (A / H)
//                               ╰─dérive─╯ ╰dispersion╯
//
// où P₀ est le prix de départ, A la moyenne ARITHMÉTIQUE des prix de la
// fenêtre et H leur moyenne HARMONIQUE. L'identité est algébrique, pas
// empirique : l'étalement achète M/H parts, le versement unique M/P₀.
//
// A ≥ H toujours (inégalité des moyennes), donc le terme de dispersion est
// toujours ≥ 1 : la volatilité aide TOUJOURS l'étalement, mais faiblement. Le
// terme de dérive, lui, joue contre dès que le marché monte.
//
// DEUX QUESTIONS, et elles décident d'un argument éditorial :
//
//   1. Le rapport dispersion / dérive est-il PLAT selon la durée d'étalement D ?
//      S'il l'est, aucune durée d'étalement n'est structurellement plus
//      favorable qu'une autre : étaler plus longtemps n'achète pas plus de
//      bénéfice de dispersion par unité de dérive subie.
//
//   2. Le rapport moyenne / écart-type du terme de dérive croît-il en √D ?
//      C'est la signature d'une somme de rendements indépendants : la moyenne
//      croît comme D, l'écart-type comme √D, donc leur rapport comme √D.
//      Si c'est vrai, ça EXPLIQUE le tableau de Vanguard avec notre formule :
//      le versement unique ne gagne pas DAVANTAGE quand on étale longtemps,
//      il gagne plus SOUVENT — parce que la dérive devient plus régulière.
//
// Si l'un des deux ne tient pas, on ne publie pas le pont : on garde le
// tableau brut. Un résultat négatif est un résultat.
//
// Usage : node scripts/tests-structurels-dca.mjs [dataset.json]

import { readFileSync } from "node:fs";

const DATASET = process.argv[2] ?? "src/data/msci-world-eur-controle.json";

/** Durées d'étalement testées, en mois. */
const DUREES = [2, 3, 4, 6, 9, 12, 18, 24, 36];

const serie = JSON.parse(readFileSync(DATASET, "utf8")).data;
const prix = serie.map((d) => d.value);

const moyenne = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const ecartType = (xs) => {
  const m = moyenne(xs);
  // Écart-type d'échantillon (n−1) : on estime, on ne décrit pas une population.
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
};

/**
 * Toutes les fenêtres de D mois : pour chacune, les deux termes.
 *
 * Le prix de départ P₀ est celui du PREMIER versement, et il fait partie de la
 * fenêtre d'étalement — l'étalement achète aussi ce mois-là. Prendre le mois
 * précédent comme référence donnerait un avantage artificiel à l'une des deux
 * stratégies selon le sens du marché ce mois-là.
 */
function fenetres(D) {
  const out = [];
  for (let i = 0; i + D <= prix.length; i++) {
    const p = prix.slice(i, i + D);
    const P0 = p[0];
    const A = moyenne(p);
    const H = p.length / p.reduce((s, x) => s + 1 / x, 0);
    out.push({
      debut: serie[i].month,
      // En log, la décomposition devient additive — c'est la forme qui se prête
      // aux moyennes et aux écarts-types.
      derive: Math.log(P0 / A),
      dispersion: Math.log(A / H),
      total: Math.log(P0 / H),
      gagneEtalement: H < P0,
    });
  }
  return out;
}

console.log(`\nSérie : ${DATASET}`);
console.log(`${serie.length} points, ${serie[0].month} → ${serie.at(-1).month}\n`);

// ─── Contrôle préalable : l'identité algébrique tient-elle sur ces données ? ─
{
  const f = fenetres(12);
  const pire = Math.max(...f.map((x) => Math.abs(x.derive + x.dispersion - x.total)));
  console.log(`Contrôle de l'identité  ln(P₀/H) = ln(P₀/A) + ln(A/H)`);
  console.log(`  écart maximal sur ${f.length} fenêtres de 12 mois : ${pire.toExponential(2)}`);
  console.log(`  ${pire < 1e-12 ? "✓ exacte à la précision machine" : "✗ ANOMALIE — ne pas publier"}\n`);
}

// ─── Test 1 — le rapport dispersion / dérive est-il plat ? ───────────────────
console.log("═══ TEST 1 — rapport dispersion / dérive par durée d'étalement ═══\n");
console.log("   D   fenêtres   dispersion    |dérive|     rapport   étalement gagne");
console.log("  ───────────────────────────────────────────────────────────────────");

const t1 = [];
for (const D of DUREES) {
  const f = fenetres(D);
  if (f.length < 12) continue;
  const disp = moyenne(f.map((x) => x.dispersion));
  // On compare une amplitude à une amplitude : la dérive change de signe selon
  // le sens du marché, sa moyenne signée ne mesure pas ce qu'on veut ici.
  const der = moyenne(f.map((x) => Math.abs(x.derive)));
  const ratio = disp / der;
  const gagne = (100 * f.filter((x) => x.gagneEtalement).length) / f.length;
  t1.push({ D, ratio });
  console.log(
    `  ${String(D).padStart(3)}   ${String(f.length).padStart(6)}   ` +
      `${(disp * 100).toFixed(3).padStart(9)} %  ${(der * 100).toFixed(3).padStart(8)} %   ` +
      `${ratio.toFixed(3).padStart(7)}   ${gagne.toFixed(1).padStart(6)} %`
  );
}

{
  const rs = t1.map((x) => x.ratio);
  const m = moyenne(rs);
  const cv = ecartType(rs) / m;
  console.log(
    `\n  Rapport moyen ${m.toFixed(3)}, min ${Math.min(...rs).toFixed(3)}, ` +
      `max ${Math.max(...rs).toFixed(3)}, coefficient de variation ${(cv * 100).toFixed(1)} %`
  );
  // Seuil déclaré AVANT de regarder : au-delà de 25 % de dispersion relative,
  // on ne peut pas parler d'un rapport « plat ».
  console.log(
    cv < 0.25
      ? "  ✓ PLAT — aucune durée d'étalement n'est structurellement avantagée."
      : "  ✗ NON PLAT — le rapport dépend de la durée. Ne pas publier le pont."
  );
}

// ─── Test 2 — la régularité de la dérive croît-elle en √D ? ──────────────────
console.log("\n═══ TEST 2 — régularité du terme de dérive : moyenne / écart-type ═══\n");
console.log("   D   fenêtres    moyenne    écart-type   moy/σ    (moy/σ)/√D");
console.log("  ────────────────────────────────────────────────────────────");

const t2 = [];
for (const D of DUREES) {
  const f = fenetres(D);
  if (f.length < 12) continue;
  const xs = f.map((x) => x.derive);
  const m = moyenne(xs);
  const s = ecartType(xs);
  const rapport = Math.abs(m) / s;
  const normalise = rapport / Math.sqrt(D);
  t2.push({ D, normalise });
  console.log(
    `  ${String(D).padStart(3)}   ${String(f.length).padStart(6)}   ` +
      `${(m * 100).toFixed(3).padStart(8)} % ${(s * 100).toFixed(3).padStart(9)} %   ` +
      `${rapport.toFixed(3).padStart(6)}   ${normalise.toFixed(4).padStart(9)}`
  );
}

{
  const ns = t2.map((x) => x.normalise);
  const cv = ecartType(ns) / moyenne(ns);
  console.log(
    `\n  (moy/σ)/√D : moyenne ${moyenne(ns).toFixed(4)}, ` +
      `coefficient de variation ${(cv * 100).toFixed(1)} %`
  );

  // ⚠️ Le coefficient de variation est un MAUVAIS critère ici, et il a failli
  // laisser passer un faux positif : 24,7 % contre un seuil à 25 %, alors que
  // la grandeur censée être plate croît de façon monotone d'un facteur deux.
  // Une quantité plate ne tendance pas. On mesure donc l'exposant réel par
  // régression en log-log — ça répond à la question posée (« croît-il comme
  // √D ? ») au lieu de la contourner par un seuil de dispersion.
  const X = t2.map((x) => Math.log(x.D));
  const Y = DUREES.filter((D) => t2.some((t) => t.D === D)).map((D) => {
    const t = t2.find((x) => x.D === D);
    return Math.log(t.normalise * Math.sqrt(D)); // = ln(moy/σ)
  });
  const mx = moyenne(X);
  const my = moyenne(Y);
  const pente =
    X.reduce((s, x, i) => s + (x - mx) * (Y[i] - my), 0) /
    X.reduce((s, x) => s + (x - mx) ** 2, 0);
  // R² : une pente sans qualité d'ajustement ne dit rien.
  const yChap = X.map((x) => my + pente * (x - mx));
  const ssRes = Y.reduce((s, y, i) => s + (y - yChap[i]) ** 2, 0);
  const ssTot = Y.reduce((s, y) => s + (y - my) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;

  console.log(
    `\n  Ajustement  moy/σ ∝ D^k  :  k = ${pente.toFixed(3)}  (R² = ${r2.toFixed(4)})`
  );
  console.log(`  √D correspondrait à k = 0,500.`);

  const ecart = Math.abs(pente - 0.5);
  console.log(
    ecart < 0.06
      ? "\n  ✓ CROISSANCE EN √D — la dérive devient plus régulière avec la durée.\n" +
          "    Le versement unique ne gagne pas PLUS en étalant longtemps, il gagne\n" +
          "    plus SOUVENT. C'est le pont vers le tableau de Vanguard."
      : `\n  ✗ PAS DE CROISSANCE EN √D : l'exposant vaut ${pente.toFixed(2)}, pas 0,50.\n` +
          "    La régularité de la dérive croît BEAUCOUP plus vite que ne le prédit\n" +
          "    une somme de rendements indépendants. Le pont éditorial n'existe pas\n" +
          "    sous cette forme — garder le tableau brut sans cette explication."
  );
}

// ─── Le test 2 est-il seulement TESTABLE sur ces données ? ──────────────────
//
// Contrôle obligatoire, et il change la réponse. Les fenêtres glissantes se
// recouvrent : à D = 36 mois sur 221 points, deux fenêtres consécutives
// partagent 35 mois sur 36. L'écart-type estimé sur des tirages aussi corrélés
// est biaisé VERS LE BAS aux longues durées — ce qui gonfle mécaniquement le
// rapport moyenne/écart-type et donc l'exposant.
//
// On refait donc le même calcul sur des fenêtres DISJOINTES (pas = D). Si les
// deux exposants divergent, celui des fenêtres glissantes ne mesure pas une
// propriété du marché mais la structure du protocole.
console.log("\n═══ CONTRÔLE DE RECOUVREMENT — le test 2 est-il testable ? ═══\n");
console.log("   D   glissantes : n / σ / moy·σ⁻¹      disjointes : n / σ / moy·σ⁻¹");
console.log("  ──────────────────────────────────────────────────────────────────");

function derives(D, pas) {
  const out = [];
  for (let i = 0; i + D <= prix.length; i += pas) {
    const w = prix.slice(i, i + D);
    out.push(Math.log(w[0] / moyenne(w)));
  }
  return out;
}

const expG = [];
const expD = [];
for (const D of DUREES) {
  const g = derives(D, 1);
  const d = derives(D, D);
  const rg = Math.abs(moyenne(g)) / ecartType(g);
  expG.push([D, rg]);
  let colD = `${String(d.length).padStart(4)}   (trop peu)`;
  if (d.length >= 4) {
    const rd = Math.abs(moyenne(d)) / ecartType(d);
    expD.push([D, rd]);
    colD = `${String(d.length).padStart(4)} ${(ecartType(d) * 100).toFixed(2).padStart(7)} % ${rd.toFixed(3).padStart(7)}`;
  }
  console.log(
    `  ${String(D).padStart(3)}   ${String(g.length).padStart(4)} ${(ecartType(g) * 100).toFixed(2).padStart(7)} % ${rg.toFixed(3).padStart(7)}    ${colD}`
  );
}

{
  const k = (pts) => {
    const X = pts.map((x) => Math.log(x[0]));
    const Y = pts.map((x) => Math.log(x[1]));
    const mx = moyenne(X);
    const my = moyenne(Y);
    return (
      X.reduce((s, x, i) => s + (x - mx) * (Y[i] - my), 0) /
      X.reduce((s, x) => s + (x - mx) ** 2, 0)
    );
  };
  const kG = k(expG);
  const kD = k(expD);
  console.log(`\n  exposant sur fenêtres glissantes : ${kG.toFixed(3)}`);
  console.log(`  exposant sur fenêtres disjointes : ${kD.toFixed(3)}`);
  console.log(`  valeur théorique (√D)            : 0.500`);
  console.log(
    Math.abs(kG - kD) < 0.1
      ? "\n  Les deux protocoles concordent : l'exposant mesure bien une propriété\n  des données."
      : "\n  ⚠️ LES DEUX PROTOCOLES DIVERGENT. L'exposant des fenêtres glissantes\n" +
          "  mesure le recouvrement, pas le marché. Et les fenêtres disjointes ne\n" +
          "  sauvent rien : à D = 36 mois, dix-huit ans de données n'en fournissent\n" +
          "  que six. LE TEST 2 N'EST PAS TESTABLE ICI — ni confirmé, ni infirmé.\n" +
          "  Ne rien publier qui en dépende."
  );
}

// ─── Contrôle du critère H < P₀, qui doit prédire à 100 % ───────────────────
console.log("\n═══ CONTRÔLE — « l'étalement gagne ⟺ H < P₀ » ═══\n");
for (const D of [3, 6, 12, 24]) {
  const f = fenetres(D);
  if (!f.length) continue;
  const faux = f.filter((x) => x.gagneEtalement !== x.total > 0).length;
  console.log(
    `  D = ${String(D).padStart(2)} mois : ${f.length} fenêtres, ${faux} contre-exemple(s) ` +
      `${faux === 0 ? "✓" : "✗"}`
  );
}
console.log("");
