#!/usr/bin/env node
// Écrit le CSV de la liste des ETF éligibles au PEA dans public/.
//
//   node scripts/exporter-liste-pea-csv.mjs              → écrit le CSV
//   node scripts/exporter-liste-pea-csv.mjs --verifier   → échoue s'il a divergé (postbuild)
//
// Le CSV est un fichier statique, servi tel quel (public/donnees/…), daté du
// relevé. Son contenu est calculé par csvListePea() (src/lib/liste-pea/
// donnees.ts) ; le postbuild refuse un CSV publié qui ne correspond plus aux
// lignes : après toute correction de donnees.ts, relancer ce script et
// committer le CSV avec. (Contrôle hors de la page : lire public/ depuis un
// module de page fait tracer tout public/ dans le bundle serveur.)
//
// donnees.ts n'importe rien : Node le charge directement en retirant les
// types (Node 22.18 et plus).

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Avertissement de Node sur le format du module (.ts sans "type") : sans objet ici.
process.removeAllListeners("warning");

const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let module;
try {
  module = await import(path.join(RACINE, "src", "lib", "liste-pea", "donnees.ts"));
} catch (e) {
  // Node sans retrait des types (avant 22.18) : le contrôle ne peut pas
  // tourner. Il le dit, sans bloquer un déploiement pour autant.
  if (process.argv.includes("--verifier")) {
    console.warn(
      `⚠️  CSV de la liste PEA NON contrôlé : Node ${process.version} ne charge pas un module .ts ` +
        `(${e.code ?? e.message}). Contrôlez en local : node scripts/exporter-liste-pea-csv.mjs --verifier`,
    );
    process.exit(0);
  }
  throw e;
}
const { csvListePea, CHEMIN_CSV_LISTE_PEA, LIGNES_PEA } = module;

const sortie = path.join(RACINE, "public", ...CHEMIN_CSV_LISTE_PEA.split("/").filter(Boolean));
if (process.argv.includes("--verifier")) {
  if (!existsSync(sortie) || readFileSync(sortie, "utf8") !== csvListePea()) {
    console.error(
      `✗ ${path.relative(RACINE, sortie)} ne correspond plus à src/lib/liste-pea/donnees.ts.\n` +
        "  Lancez node scripts/exporter-liste-pea-csv.mjs et committez le CSV.",
    );
    process.exit(1);
  }
  console.log(`✓ CSV de la liste PEA à jour (${LIGNES_PEA.length} lignes).`);
  process.exit(0);
}
mkdirSync(path.dirname(sortie), { recursive: true });
writeFileSync(sortie, csvListePea());
console.log(`✓ ${LIGNES_PEA.length} lignes → ${path.relative(RACINE, sortie)}`);
