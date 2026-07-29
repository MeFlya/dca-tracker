#!/usr/bin/env node
// Contrôle d'intégrité de la série historique qui alimente /backtest.
//
// Pourquoi ce script existe : la série a été trouvée DÉCALÉE D'UN MOIS le
// 29 juillet 2026. La valeur étiquetée « 2020-03 » affichait +9,5 % alors que
// mars 2020 est le mois du krach COVID. Rien dans le fichier ne le signalait,
// et les pages /backtest publient ces chiffres comme « données réelles ».
//
// Le contrôle est autonome : il compare les rendements par année civile aux
// références publiques du MSCI World en euros, sous deux hypothèses
// d'étiquetage. Aucune dépendance réseau.
//
//   node scripts/verifier-serie-backtest.mjs

import { readFile } from "node:fs/promises";

// Références publiques, MSCI World net return en EUR, par année civile.
// ⚠️ Ordres de grandeur destinés au DIAGNOSTIC, pas à la publication.
const REF_EUR = {
  2014: 19.5, 2015: 10.4, 2016: 10.7, 2017: 7.5, 2018: -4.1,
  2019: 30.0, 2021: 31.1, 2022: -12.8, 2023: 19.6,
};

const raw = JSON.parse(await readFile("src/data/msci-world-eur.json", "utf8"));
const d = raw.data;
const at = (m) => d.find((x) => x.month === m)?.value ?? null;
const perf = (a, b) => {
  const x = at(a), y = at(b);
  return x && y ? (y / x - 1) * 100 : null;
};

console.log(`Série : ${d[0].month} → ${d[d.length - 1].month} · ${d.length} points\n`);

// 1. Continuité
const trous = [];
for (let i = 1; i < d.length; i++) {
  const [y1, m1] = d[i - 1].month.split("-").map(Number);
  const [y2, m2] = d[i].month.split("-").map(Number);
  if (y2 * 12 + m2 - (y1 * 12 + m1) !== 1) trous.push(`${d[i - 1].month}→${d[i].month}`);
}
console.log(trous.length ? `🔴 ${trous.length} trou(s) : ${trous.join(", ")}` : "✓ série continue");

// 2. Alignement des étiquettes
let eBrut = 0, eDec = 0, n = 0;
for (const [y, ref] of Object.entries(REF_EUR)) {
  const brut = perf(`${+y - 1}-12`, `${y}-12`);
  const dec = perf(`${+y - 1}-11`, `${y}-11`);
  if (brut === null || dec === null) continue;
  eBrut += Math.abs(brut - ref);
  eDec += Math.abs(dec - ref);
  n++;
}
console.log(
  `\nÉcart moyen aux références sur ${n} années :\n` +
    `  étiquettes telles quelles : ${(eBrut / n).toFixed(1)} pts\n` +
    `  étiquettes décalées d'un mois : ${(eDec / n).toFixed(1)} pts`
);
console.log(
  eDec < eBrut - 1
    ? "\n🔴 LES ÉTIQUETTES SONT DÉCALÉES : la valeur du mois M porte la clôture de M+1.\n" +
        "   Ne pas publier de chiffre issu de cette série avant de la reconstruire."
    : "\n✓ Alignement cohérent avec les références."
);
