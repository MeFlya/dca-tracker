// Cliquet sur les montants en euros écrits à la main dans le contenu.
//
// ─── Ce que ce script ne fait PAS, et pourquoi ──────────────────────────────
//
// Il ne cherche pas à deviner si un nombre « aurait dû » venir du moteur de
// simulation. C'était la première idée, et elle est mauvaise : il faudrait
// inférer l'intention d'une phrase, et un détecteur qui rate une occurrence
// rassure sans protéger. Ce projet a déjà payé le prix d'une vérification qui
// donne un faux feu vert — une série de données fausse validée par un contrôle
// qui reproduisait le bug qu'il cherchait.
//
// La vraie défense est ailleurs : src/lib/ecart-frais.ts fait CALCULER les
// montants par le moteur et la prose les interpole. Un nombre interpolé ne
// peut pas diverger, puisqu'il n'existe pas en tant que texte.
//
// ─── Ce que ce script fait ─────────────────────────────────────────────────
//
// Il tient l'inventaire de ce qui reste écrit à la main, et refuse que
// l'inventaire GROSSISSE. Même mécanique que la dette de descriptions SEO de
// check-seo-lengths.mjs : on ne prétend pas que l'existant est propre, on
// garantit qu'il ne se dégrade plus. Chaque montant du fichier de référence
// est une dette assumée, pas un montant validé.
//
// Ajouter un montant écrit à la main casse donc le build. Deux issues :
//   · le bon réflexe — le faire produire par ecart-frais.ts ;
//   · sinon, `node scripts/check-montants-calcules.mjs --accept`, qui
//     l'inscrit dans la dette, et il faut committer le JSON.
//
// Un montant RETIRÉ ne casse rien : la dette ne peut que décroître.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const DETTE = join(RACINE, "scripts", "montants-ecrits.json");

/** Fichiers de contenu dont la prose est rendue sur des pages publiques. */
const SOURCES = [
  "src/lib/etf-comparisons.ts",
  "src/lib/etf-index-guides.ts",
  "src/lib/etf-detail-content.ts",
  "src/lib/glossary-terms.ts",
  "src/lib/brokers.ts",
];

/**
 * Montant en euros à l'intérieur d'un littéral de chaîne.
 *
 * Seuil à 100 : en dessous, ce sont des prix de part, des frais d'ordre ou des
 * versements mensuels — des faits tarifaires qui ne sortent pas d'une
 * projection. Au-dessus, on est presque toujours sur un capital projeté, donc
 * sur un nombre que le moteur sait produire.
 *
 * Les montants interpolés (`${ecartCapital(...)} €`) sont invisibles ici : le
 * texte ne contient pas leurs chiffres. C'est exactement l'effet recherché.
 */
const MONTANT = /(\d{1,3}(?:[  ]\d{3})+|\d{3,})\s*€/g;

function extraire(chemin) {
  const src = readFileSync(join(RACINE, chemin), "utf8");
  const trouves = [];
  // On ne regarde que l'intérieur des littéraux "..." — pas les gabarits `...`,
  // dont les montants sont produits à l'exécution.
  for (const lit of src.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
    for (const m of lit[1].matchAll(MONTANT)) {
      const valeur = Number(m[1].replace(/[  ]/g, ""));
      if (valeur >= 100) trouves.push(m[0].trim());
    }
  }
  return trouves.sort();
}

// ─── Contrôle 1 : aucun montant à cheval ────────────────────────────────────
//
// RÈGLE ABSOLUE, sans dette possible — contrairement au cliquet ci-dessous.
//
// Elle existe parce que le cliquet a un angle mort structurel : il compte les
// montants ÉCRITS. Un remplacement automatisé a mordu à l'intérieur de
// « 102 000 € » et laissé `≈ 10${ecartCapital(0.38, 0.2)} €` sur deux pages
// indexées. Le montant n'avait pas disparu — il avait CHANGÉ DE CATÉGORIE,
// devenant moitié littéral, moitié calculé. Il est sorti de l'inventaire sans
// sortir du code, et ne rendait juste que par coïncidence : le jour où l'appel
// retourne autre chose que « 2 000 », la page affiche un capital absurde.
//
// La leçon générale : un garde-fou défini comme « compter les mauvaises
// choses » est aveugle à une mauvaise chose qui a changé de catégorie. Il faut
// donc aussi INTERDIRE UN MOTIF, sans tolérance.
//
// Le principe éditorial correspondant : un montant est soit entièrement
// calculé, soit entièrement écrit. Jamais à cheval.
const FUSION = [
  { motif: /\d\s*\$\{/g, quoi: "un chiffre collé devant une interpolation" },
  { motif: /\}\s*\d/g, quoi: "un chiffre collé derrière une interpolation" },
];

const fusions = [];
for (const f of SOURCES) {
  if (!existsSync(join(RACINE, f))) continue;
  const src = readFileSync(join(RACINE, f), "utf8");
  const lignes = src.split("\n");
  lignes.forEach((ligne, i) => {
    for (const { motif, quoi } of FUSION) {
      motif.lastIndex = 0;
      if (motif.test(ligne)) {
        fusions.push({ fichier: `${f}:${i + 1}`, quoi, extrait: ligne.trim().slice(0, 120) });
      }
    }
  });
}

if (fusions.length > 0) {
  console.error(`\n✗ ${fusions.length} montant(s) à cheval entre littéral et calcul :\n`);
  for (const { fichier, quoi, extrait } of fusions) {
    console.error(`   ${fichier} — ${quoi}`);
    console.error(`      ${extrait}\n`);
  }
  console.error(
    `   Un montant est soit entièrement calculé, soit entièrement écrit.\n` +
      `   À cheval, il ne rend juste que par coïncidence.\n` +
      `   Aucune dette n'est acceptée sur ce motif : corriger l'expression.\n`
  );
  process.exit(1);
}

// ─── Contrôle 2 : cliquet sur les montants écrits à la main ─────────────────

const actuel = {};
for (const f of SOURCES) {
  if (existsSync(join(RACINE, f))) actuel[f] = extraire(f);
}

const accepter = process.argv.includes("--accept");

if (accepter || !existsSync(DETTE)) {
  writeFileSync(DETTE, JSON.stringify(actuel, null, 2) + "\n");
  const n = Object.values(actuel).flat().length;
  console.log(`✓ dette enregistrée : ${n} montant(s) écrit(s) à la main.`);
  process.exit(0);
}

const reference = JSON.parse(readFileSync(DETTE, "utf8"));
const nouveaux = [];

for (const [f, montants] of Object.entries(actuel)) {
  const connus = [...(reference[f] ?? [])];
  for (const m of montants) {
    const i = connus.indexOf(m);
    if (i === -1) nouveaux.push({ fichier: f, montant: m });
    else connus.splice(i, 1); // consommé — gère les doublons légitimes
  }
}

const totalActuel = Object.values(actuel).flat().length;
const totalRef = Object.values(reference).flat().length;

console.log(
  `\nMontants écrits à la main : ${totalActuel} (dette enregistrée : ${totalRef})`
);

if (nouveaux.length > 0) {
  console.error(`\n✗ ${nouveaux.length} montant(s) écrit(s) à la main non déclaré(s) :\n`);
  for (const { fichier, montant } of nouveaux) {
    console.error(`   ${fichier} — « ${montant} »`);
  }
  console.error(
    `\n   Un montant que le moteur sait produire ne doit pas être recopié :\n` +
      `   utiliser ecartCapital()/coutFrais() de src/lib/ecart-frais.ts.\n` +
      `   S'il ne vient pas d'une projection (prix de part, frais d'ordre,\n` +
      `   seuil tarifaire), l'inscrire dans la dette :\n` +
      `   node scripts/check-montants-calcules.mjs --accept\n`
  );
  process.exit(1);
}

if (totalActuel < totalRef) {
  console.log(`✓ dette en baisse (${totalRef} → ${totalActuel}). Pensez à --accept.`);
} else {
  console.log("✓ aucun nouveau montant écrit à la main.");
}
