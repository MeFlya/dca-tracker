#!/usr/bin/env node
// DCA contre investissement en une fois — protocole de fenêtres glissantes.
//
// ─── À lire avant d'utiliser les résultats ──────────────────────────────────
//
// Ce script produit une statistique. Une statistique n'est valide que si les
// tirages sont indépendants et couvrent plusieurs régimes de marché. Avec le
// dataset actuel (IWDA depuis août 2009), ce n'est le cas d'AUCUN horizon :
//
//   5 ans  : 143 fenêtres chevauchantes →  3 périodes indépendantes
//   10 ans :  83 fenêtres chevauchantes →  1 période indépendante
//   15 ans :  23 fenêtres chevauchantes →  1 période indépendante
//
// Et toutes démarrent après le creux de mars 2009 : le résultat est 100 % de
// victoires du lump sum sur les trois horizons, contre ~65-70 % dans la
// littérature. Ce n'est pas un résultat, c'est la signature du biais.
//
// ⚠️ NE PAS PUBLIER de pourcentage tiré de ce dataset. Le script imprime lui-même
// un avertissement quand la couverture est insuffisante.
//
// Usage :
//   node scripts/dca-vs-lumpsum.mjs [chemin/vers/dataset.json] [--csv]
//
// Format attendu : { data: [{ month: "YYYY-MM", value: number }, …] }

import { readFile } from "node:fs/promises";

const DATASET = process.argv[2] ?? "src/data/msci-world-eur.json";
const AS_CSV = process.argv.includes("--csv");

// ─── Hypothèses, toutes explicites parce qu'elles seront publiées ───────────
const TER_ANNUEL = 0.002; // 0,20 %/an, prélevé mensuellement
const MONTANT = 24_000; // référence ronde : 10 ans de DCA = 200 €/mois
const HORIZONS = [5, 10, 15];
// Les liquidités en attente d'investissement (côté DCA) ne rapportent rien.
// Hypothèse conservatrice qui DÉFAVORISE le DCA : à dire dans la méthodologie.
const TAUX_LIQUIDITES = 0;

const raw = JSON.parse(await readFile(DATASET, "utf8"));
const serie = Array.isArray(raw) ? raw : raw.data;
const frais = (1 - TER_ANNUEL) ** (1 / 12);

/** Trajectoire mois par mois de la valeur du portefeuille. */
function trajectoire(depart, horizonAns, mode) {
  const n = horizonAns * 12;
  const versement = MONTANT / n;
  let parts = 0;
  let liquide = mode === "lump" ? 0 : MONTANT;
  const valeurs = [];

  if (mode === "lump") parts = MONTANT / serie[depart].value;

  for (let k = 0; k <= n; k++) {
    if (mode === "dca" && k < n) {
      parts += versement / serie[depart + k].value;
      liquide -= versement;
    }
    if (k > 0) {
      parts *= frais;
      liquide *= (1 + TAUX_LIQUIDITES) ** (1 / 12);
    }
    valeurs.push(parts * serie[depart + k].value + Math.max(0, liquide));
  }
  return valeurs;
}

/** Pire perte latente traversée, en %. C'est là que le DCA se défend. */
function pireBaisse(valeurs) {
  let sommet = 0;
  let pire = 0;
  for (const v of valeurs) {
    sommet = Math.max(sommet, v);
    if (sommet > 0) pire = Math.min(pire, (v - sommet) / sommet);
  }
  return pire * 100;
}

const pct = (tri, p) => tri[Math.min(tri.length - 1, Math.floor(p * tri.length))];
const eur = (n) => Math.round(n).toLocaleString("fr-FR") + " €";

const lignes = [];

for (const H of HORIZONS) {
  const n = H * 12;
  const dernier = serie.length - 1 - n;
  if (dernier < 0) continue;

  const ecarts = [];
  let lumpGagne = 0;
  let lumpSous30 = 0;
  let pireLump = Infinity;
  let pireDca = Infinity;

  for (let i = 0; i <= dernier; i++) {
    const L = trajectoire(i, H, "lump");
    const D = trajectoire(i, H, "dca");
    const fl = L[L.length - 1];
    const fd = D[D.length - 1];
    if (fl > fd) lumpGagne++;
    ecarts.push(fl - fd);
    if (pireBaisse(L) <= -30) lumpSous30++;
    pireLump = Math.min(pireLump, fl);
    pireDca = Math.min(pireDca, fd);
    lignes.push({
      horizon_ans: H,
      depart: serie[i].month,
      lump_sum_eur: Math.round(fl),
      dca_eur: Math.round(fd),
      ecart_eur: Math.round(fl - fd),
      pire_baisse_lump_pct: +pireBaisse(L).toFixed(1),
      pire_baisse_dca_pct: +pireBaisse(D).toFixed(1),
    });
  }

  ecarts.sort((a, b) => a - b);
  const total = dernier + 1;
  const independantes = Math.floor((serie.length - 1) / n);

  if (AS_CSV) continue;

  console.log(`\n═══ Horizon ${H} ans — ${MONTANT.toLocaleString("fr-FR")} € investis ═══`);
  console.log(`  fenêtres            : ${total} (départs ${serie[0].month} → ${serie[dernier].month})`);
  console.log(`  périodes réellement indépendantes : ${independantes}`);
  if (independantes < 3) {
    console.log(
      `  🔴 STATISTIQUE NON PUBLIABLE — ${independantes} période(s) indépendante(s).\n` +
        `     Les fenêtres se chevauchent presque entièrement : ce n'est pas une\n` +
        `     distribution, c'est un scénario échantillonné ${total} fois.`
    );
  }
  console.log(`  lump sum devant     : ${((100 * lumpGagne) / total).toFixed(0)} % des fenêtres`);
  console.log(`  écart médian        : ${eur(pct(ecarts, 0.5))}`);
  console.log(`  écart 10e / 90e     : ${eur(pct(ecarts, 0.1))} / ${eur(pct(ecarts, 0.9))}`);
  console.log(`  pire issue lump sum : ${eur(pireLump)}`);
  console.log(`  pire issue DCA      : ${eur(pireDca)}`);
  console.log(
    `  fenêtres où le lump sum a fait traverser une perte latente > 30 % : ${lumpSous30} / ${total}`
  );
}

if (AS_CSV) {
  const cols = Object.keys(lignes[0]);
  console.log(cols.join(","));
  for (const l of lignes) console.log(cols.map((c) => l[c]).join(","));
} else {
  console.log(
    `\nSource : ${raw.source ?? DATASET}` +
      `\nPériode : ${serie[0].month} → ${serie[serie.length - 1].month} (${serie.length} points)` +
      `\nHypothèses : TER ${(TER_ANNUEL * 100).toFixed(2).replace(".", ",")} %/an prélevé mensuellement · ` +
      `liquidités en attente à ${TAUX_LIQUIDITES * 100} % · enveloppe PEA (aucune fiscalité en cours de route)` +
      `\n\nCSV complet : node ${process.argv[1].split("/").pop()} ${DATASET} --csv > resultats.csv`
  );
}
