// Effets sonores de la version complète, calculés par formule.
//
// Lancer : npm run sons
//          npm run sons -- --tonalite C --bpm 118 --decalage-ms 120
//
// Sortie : public/sons/*.wav (PCM 16 bits, 48 kHz ; mono, sauf les souffles en
//          stéréo) et src/reglages-sons.json (tempo et calage, lus par la
//          composition « Complete »).
//
// Aucun fichier externe : oscillateurs, bruit pseudo-aléatoire à graine fixe
// (le rendu est identique d'une exécution à l'autre), enveloppes et filtres
// biquad (formules de R. Bristow-Johnson) écrits ici. Recettes : STORYBOARD.md,
// section 6.
//
// --tonalite : accorde les notes sur le morceau de Maël (A par défaut, gamme
//              pentatonique : fondamentale, tierce majeure, quinte, octave).
// --bpm, --decalage-ms : ne changent AUCUN son ; ils servent à placer les sons
//              et les coupes dans la vidéo (src/tempo.ts).

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.resolve(ICI, "../public/sons");
const REGLAGES = path.resolve(ICI, "../src/reglages-sons.json");
const FE = 48000; // fréquence d'échantillonnage

// ─── Arguments ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const arg = (nom, defaut) => {
  const i = args.indexOf(`--${nom}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : defaut;
};
const NOTES = { C: 3, "C#": 4, DB: 4, D: 5, "D#": 6, EB: 6, E: 7, F: 8, "F#": 9, GB: 9, G: 10, "G#": 11, AB: 11, A: 0, "A#": 1, BB: 1, B: 2 };
const tonalite = String(arg("tonalite", "A")).toUpperCase();
if (!(tonalite in NOTES)) throw new Error(`--tonalite inconnue : ${tonalite} (attendu : C, C#, D… B)`);
// Décalage en demi-tons depuis La, ramené entre -6 et +5 pour rester dans le
// même registre.
let demiTons = NOTES[tonalite];
if (demiTons > 5) demiTons -= 12;
const bpm = Number(arg("bpm", "120"));
const decalageMs = Number(arg("decalage-ms", "0"));
if (!(bpm >= 60 && bpm <= 200)) throw new Error(`--bpm hors limites : ${bpm}`);

// ─── Outils ──────────────────────────────────────────────────────────────────
function aleatoire(graine) {
  // mulberry32 : générateur à graine fixe, rendu reproductible.
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const blanc = (graine) => {
  const r = aleatoire(graine);
  return () => r() * 2 - 1;
};
function rose(graine) {
  // Bruit rose, méthode de Paul Kellet.
  const w = blanc(graine);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  return () => {
    const x = w();
    b0 = 0.99886 * b0 + x * 0.0555179;
    b1 = 0.99332 * b1 + x * 0.0750759;
    b2 = 0.969 * b2 + x * 0.153852;
    b3 = 0.8665 * b3 + x * 0.3104856;
    b4 = 0.55 * b4 + x * 0.5329522;
    b5 = -0.7616 * b5 - x * 0.016898;
    const y = b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362;
    b6 = x * 0.115926;
    return y * 0.11;
  };
}
/** Biquad (RBJ) dont la fréquence peut changer à chaque échantillon. */
function biquad(type) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, f, q) => {
    const w0 = (2 * Math.PI * f) / FE;
    const cos = Math.cos(w0);
    const alpha = Math.sin(w0) / (2 * q);
    let b0, b1, b2;
    if (type === "passe-bande") { b0 = alpha; b1 = 0; b2 = -alpha; }
    else { b0 = (1 - cos) / 2; b1 = 1 - cos; b2 = (1 - cos) / 2; } // passe-bas
    const a0 = 1 + alpha, a1 = -2 * cos, a2 = 1 - alpha;
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}
const n = (secondes) => Math.round(secondes * FE);
const dB = (v) => Math.pow(10, v / 20);
/** Glissando exponentiel de f1 à f2 sur la durée, phase continue. */
function oscillateurGlisse(f1, f2, duree) {
  let phase = 0;
  return (i) => {
    const t = Math.min(1, i / n(duree));
    const f = f1 * Math.pow(f2 / f1, t);
    phase += (2 * Math.PI * f) / FE;
    return Math.sin(phase);
  };
}
/** Fondu de 1 ms aux deux bouts : aucun claquement au début ni à la fin. */
function adoucirBords(canaux) {
  const m = n(0.001);
  for (const c of canaux) {
    for (let i = 0; i < m && i < c.length; i++) {
      c[i] *= i / m;
      c[c.length - 1 - i] *= i / m;
    }
  }
}
/** Ramène la crête (tous canaux) à `cible` dBFS. */
function normaliser(canaux, cible) {
  let crete = 0;
  for (const c of canaux) for (const v of c) crete = Math.max(crete, Math.abs(v));
  const g = dB(cible) / crete;
  for (const c of canaux) for (let i = 0; i < c.length; i++) c[i] *= g;
}
function wav(canaux) {
  const nc = canaux.length, ns = canaux[0].length;
  const buf = Buffer.alloc(44 + ns * nc * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + ns * nc * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(nc, 22);
  buf.writeUInt32LE(FE, 24); buf.writeUInt32LE(FE * nc * 2, 28); buf.writeUInt16LE(nc * 2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(ns * nc * 2, 40);
  let o = 44;
  for (let i = 0; i < ns; i++) for (let c = 0; c < nc; c++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(canaux[c][i] * 32767))), o);
    o += 2;
  }
  return buf;
}
const fichiers = [];
async function ecrire(nom, canaux, crete) {
  adoucirBords(canaux);
  normaliser(canaux, crete);
  await writeFile(path.join(SORTIE, nom), wav(canaux));
  fichiers.push(`${nom} (${(canaux[0].length / FE).toFixed(3)} s, ${canaux.length === 2 ? "stéréo" : "mono"}, crête ${crete} dBFS)`);
}

// ─── Recettes ────────────────────────────────────────────────────────────────

/** Souffle : bruit rose dans un passe-bande dont le centre glisse, enveloppe
 * sinus², panoramique de -0,3 à +0,3 (loi à puissance constante). */
function souffle(duree, f1, f2, graine) {
  const total = n(duree);
  const bruit = rose(graine);
  const filtre = biquad("passe-bande");
  const g = [], d = [];
  for (let i = 0; i < total; i++) {
    const t = i / total;
    const f = f1 * Math.pow(f2 / f1, t);
    const env = Math.pow(Math.sin(Math.PI * t), 2);
    const v = filtre(bruit(), f, 1.2) * env;
    const pan = -0.3 + 0.6 * t;
    const angle = ((pan + 1) * Math.PI) / 4;
    g.push(v * Math.cos(angle));
    d.push(v * Math.sin(angle));
  }
  return [g, d];
}

/** Clic : 2 ms de bruit blanc + sinus à 1 800 Hz qui décroît (τ = 6 ms). */
function clic(graine = 7) {
  const total = n(0.03);
  const bruit = blanc(graine);
  const s = [];
  for (let i = 0; i < total; i++) {
    const t = i / FE;
    const b = t < 0.002 ? bruit() * (1 - t / 0.002) * 0.6 : 0;
    s.push(b + Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t / 0.006));
  }
  return s;
}

/** Tic : sinus à 3 200 Hz, décroissance τ = 3 ms. */
function tic() {
  const total = n(0.015);
  const s = [];
  for (let i = 0; i < total; i++) {
    const t = i / FE;
    s.push(Math.sin(2 * Math.PI * 3200 * t) * Math.exp(-t / 0.003));
  }
  return s;
}

/** Pop : sinus de 880 à 440 Hz (glissando exponentiel) + clic à -10 dB. */
function pop() {
  const total = n(0.12);
  const osc = oscillateurGlisse(880, 440, 0.12);
  const c = clic(11);
  const s = [];
  for (let i = 0; i < total; i++) {
    const t = i / FE;
    const env = Math.min(1, t / 0.003) * Math.exp(-t / 0.04);
    s.push(osc(i) * env + (i < c.length ? c[i] * dB(-10) : 0));
  }
  return s;
}

/** Note pincée : fondamentale + harmoniques 2 (-12 dB) et 3 (-20 dB), attaque
 * 5 ms, décroissance τ = 250 ms (les harmoniques s'éteignent un peu plus vite,
 * comme sur une corde). */
function note(f) {
  const total = n(0.9);
  const s = [];
  for (let i = 0; i < total; i++) {
    const t = i / FE;
    const attaque = Math.min(1, t / 0.005);
    const v =
      Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.25) +
      dB(-12) * Math.sin(2 * Math.PI * 2 * f * t) * Math.exp(-t / 0.16) +
      dB(-20) * Math.sin(2 * Math.PI * 3 * f * t) * Math.exp(-t / 0.1);
    s.push(v * attaque);
  }
  return s;
}

/** Impact doux : sinus de 55 à 45 Hz + bruit dans un passe-bas à 200 Hz,
 * attaque 8 ms, décroissance τ = 350 ms ; reflet aigu à 1 760 Hz, -28 dB. */
function impact() {
  const total = n(1.2);
  const osc = oscillateurGlisse(55, 45, 1.2);
  const bruit = blanc(23);
  const pb = biquad("passe-bas");
  const s = [];
  for (let i = 0; i < total; i++) {
    const t = i / FE;
    const env = Math.min(1, t / 0.008) * Math.exp(-t / 0.35);
    const grave = osc(i) + 0.5 * pb(bruit(), 200, 0.707);
    const reflet = dB(-28) * Math.sin(2 * Math.PI * 1760 * t) * Math.exp(-t / 0.5);
    s.push(grave * env + reflet * Math.min(1, t / 0.008));
  }
  return s;
}

// ─── Écriture ────────────────────────────────────────────────────────────────
await mkdir(SORTIE, { recursive: true });

await ecrire("whoosh-doux.wav", souffle(0.7, 400, 2500, 1), -14);
await ecrire("whoosh-court.wav", souffle(0.35, 600, 3000, 2), -18);
await ecrire("clic.wav", [clic()], -16);
await ecrire("tic.wav", [tic()], -24);
await ecrire("pop.wav", [pop()], -14);
// Pentatonique : fondamentale, tierce majeure, quinte, octave.
const LA4 = 440 * Math.pow(2, demiTons / 12);
const intervalles = [0, 4, 7, 12];
for (const [i, demi] of intervalles.entries()) {
  await ecrire(`note-${i + 1}.wav`, [note(LA4 * Math.pow(2, demi / 12))], -16);
}
await ecrire("impact-doux.wav", [impact()], -12);

await writeFile(
  REGLAGES,
  JSON.stringify({ _avertissement: "Écrit par scripts/generer-sons.mjs (--bpm, --decalage-ms, --tonalite).", bpm, decalageMs, tonalite }, null, 2) + "\n"
);

console.log(`✓ ${fichiers.length} sons dans public/sons/ (tonalité ${tonalite}, ${bpm} BPM, décalage ${decalageMs} ms)`);
for (const f of fichiers) console.log("  " + f);
