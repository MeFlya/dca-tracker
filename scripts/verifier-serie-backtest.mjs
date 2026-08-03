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
// ─── Sortie non nulle en cas d'échec ────────────────────────────────────────
//
// Ce script n'échouait JAMAIS : il affichait des 🔴 et sortait en 0. Le
// 2 août 2026, le cron a régénéré une série décalée d'un mois, l'a commitée
// avec [skip ci], et rien ne l'a arrêtée — le vérificateur existait depuis
// quatre jours mais n'était branché nulle part, et il n'aurait de toute façon
// pas fait échouer le job.
//
// Un contrôle qui signale sans bloquer suppose que quelqu'un lit les journaux
// d'un cron mensuel. Personne ne les lit.
let echecs = 0;
const echec = (msg) => { echecs++; console.log(msg); };

const trous = [];
for (let i = 1; i < d.length; i++) {
  const [y1, m1] = d[i - 1].month.split("-").map(Number);
  const [y2, m2] = d[i].month.split("-").map(Number);
  if (y2 * 12 + m2 - (y1 * 12 + m1) !== 1) trous.push(`${d[i - 1].month}→${d[i].month}`);
}
if (trous.length) echec(`🔴 ${trous.length} trou(s) : ${trous.join(", ")}`);
else console.log("✓ série continue");

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
    ? (echecs++, "\n🔴 LES ÉTIQUETTES SONT DÉCALÉES : la valeur du mois M porte la clôture de M+1.\n") +
        "   Ne pas publier de chiffre issu de cette série avant de la reconstruire."
    : "\n✓ Alignement cohérent avec les références."
);

// ─── Contrôle 3 : mois de référence en dur ───────────────────────────────────
//
// Aucune dépendance réseau, aucune référence de rendement annuel discutable :
// trois mois dont le SIGNE ne fait aucun doute. C'est ce contrôle qui aurait
// attrapé le décalage le premier jour — c'est la lecture humaine de « mars 2020
// à +9,5 % » qui a fait tilt, autant que ce soit la machine qui le fasse.
const MOIS_REFERENCE = [
  { mois: "2020-03", signe: "négatif", raison: "krach Covid" },
  { mois: "2020-04", signe: "positif", raison: "rebond post-krach" },
  { mois: "2008-10", signe: "négatif", raison: "crise financière" },
];

console.log("\n─── Mois de référence ───");
let refKo = 0;
for (const { mois, signe, raison } of MOIS_REFERENCE) {
  const i = d.findIndex((x) => x.month === mois);
  if (i <= 0) {
    console.log(`  ${mois} — hors série (${raison})`);
    continue;
  }
  const r = (d[i].value / d[i - 1].value - 1) * 100;
  const ok = signe === "négatif" ? r < -3 : r > 3;
  if (!ok) refKo++;
  console.log(
    `  ${ok ? "✓" : "🔴"} ${mois} : ${r >= 0 ? "+" : ""}${r.toFixed(1)} % — attendu ${signe} (${raison})`
  );
}
if (refKo) echec(`  🔴 ${refKo} mois de référence incohérent(s) — série non validée.`);

// ─── Contrôle 4 : le décalage est-il constant de part et d'autre d'un trou ? ──
//
// Un mois manquant peut créer un décalage LOCAL : ce qui suit le trou peut être
// aligné autrement que ce qui le précède. Une moyenne sur toute la période
// masquerait deux erreurs qui se compensent.
if (trous.length) {
  console.log("\n─── Alignement de part et d'autre du trou ───");
  console.log(
    "  ⚠️  Contrôle non automatisable sans référence postérieure au trou.\n" +
      `      Le trou est en ${trous.join(", ")} et les années testées ci-dessus\n` +
      "      lui sont ANTÉRIEURES : elles ne disent rien de la zone qui suit.\n" +
      "      À revalider explicitement après reconstruction."
  );
}

// ─── Contrôle 5 : corrélation croisée avec une seconde série ─────────────────
//
// Le test générique du défaut trouvé le 29/07 : entre les rendements mensuels
// de deux séries indépendantes, le maximum de corrélation DOIT être au retard 0.
// S'il est ailleurs, le retard dit exactement de combien on s'est trompé.
// Fonctionne sur n'importe quelle paire, sans aucune connaissance du marché.
//
// ⚠️ La seconde série doit être NON DÉRIVÉE de la première : un autre émetteur,
// un autre fonds, une autre chaîne d'extraction. Deux extractions du même
// fournisseur sont deux copies du même angle mort.
export function correlationCroisee(serieA, serieB, retardsMax = 3) {
  const rend = (s) =>
    s.slice(1).map((p, i) => ({ month: p.month, r: p.value / s[i].value - 1 }));
  const a = rend(serieA);
  const b = new Map(rend(serieB).map((x) => [x.month, x.r]));

  const decalerMois = (m, k) => {
    const [y, mo] = m.split("-").map(Number);
    const t = y * 12 + (mo - 1) + k;
    return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
  };

  const out = [];
  for (let k = -retardsMax; k <= retardsMax; k++) {
    const paires = a
      .map((x) => [x.r, b.get(decalerMois(x.month, k))])
      .filter(([, y]) => y !== undefined);
    if (paires.length < 24) continue;
    const mx = paires.reduce((s, [x]) => s + x, 0) / paires.length;
    const my = paires.reduce((s, [, y]) => s + y, 0) / paires.length;
    let num = 0, dx = 0, dy = 0;
    for (const [x, y] of paires) {
      num += (x - mx) * (y - my);
      dx += (x - mx) ** 2;
      dy += (y - my) ** 2;
    }
    out.push({ retard: k, correlation: num / Math.sqrt(dx * dy), n: paires.length });
  }
  const meilleur = out.reduce((a2, b2) => (b2.correlation > a2.correlation ? b2 : a2));
  return { retards: out, meilleur, aligne: meilleur.retard === 0 };
}

console.log("\n─── Corrélation croisée avec la série de contrôle ───");
try {
  const ctrl = JSON.parse(
    await readFile("src/data/msci-world-eur-controle.json", "utf8")
  );
  const { retards, meilleur, aligne } = correlationCroisee(d, ctrl.data);
  for (const r of retards) {
    const marque = r.retard === meilleur.retard ? " ←" : "";
    console.log(
      `  retard ${r.retard >= 0 ? "+" : ""}${r.retard} : ${r.correlation.toFixed(4)} (${r.n} mois)${marque}`
    );
  }
  console.log(
    aligne
      ? "  ✓ maximum au retard 0 — les deux séries sont alignées."
      : (echecs++, `  🔴 maximum au retard ${meilleur.retard} — DÉCALAGE de ${Math.abs(meilleur.retard)} mois.`)
  );

  // Résidu : il doit être petit, sans structure, et de l'ordre de l'écart de TER.
  const rend = (s2) =>
    s2.slice(1).map((pt, i) => ({ month: pt.month, r: pt.value / s2[i].value - 1 }));
  const b = new Map(rend(ctrl.data).map((x) => [x.month, x.r]));
  const res = rend(d)
    .filter((x) => b.has(x.month))
    .map((x) => (x.r - b.get(x.month)) * 100);
  const moy = res.reduce((a2, b2) => a2 + b2, 0) / res.length;
  const et = Math.sqrt(res.reduce((a2, b2) => a2 + (b2 - moy) ** 2, 0) / res.length);
  console.log(
    `  résidu : ${moy.toFixed(3)} pt/mois (${(moy * 12).toFixed(2)} pt/an), écart-type ${et.toFixed(3)} pt`
  );
  if (Math.abs(moy * 12) > 2) {
    echec("  🔴 Résidu moyen trop élevé — les deux séries ne suivent pas le même indice.");
  }
} catch {
  console.log("  ⏸  Série de contrôle absente (src/data/msci-world-eur-controle.json).");
}

// ─── Verdict ────────────────────────────────────────────────────────────────
if (echecs > 0) {
  console.log(
    `\n🔴 ${echecs} contrôle(s) en échec — NE PAS PUBLIER cette série.\n` +
      "   Le cron de rafraîchissement s'arrête ici plutôt que de committer."
  );
  process.exit(1);
}
console.log("\n✓ Tous les contrôles passent — série publiable.");
