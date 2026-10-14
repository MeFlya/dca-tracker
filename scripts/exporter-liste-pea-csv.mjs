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
// donnees.ts n'importe rien : il est transpilé par TypeScript (dépendance du
// projet, déjà nécessaire à next build) puis chargé comme un module JavaScript.
// 14/10/2026 : le script comptait sur le retrait des types par Node (22.18 et
// plus) et, sur un Node plus ancien, AVERTISSAIT sans bloquer. La version de
// Node de Vercel n'est déclarée nulle part dans le dépôt : le contrôle ne doit
// pas en dépendre. Il tourne désormais à l'identique sur toute version de Node.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(RACINE, "src", "lib", "liste-pea", "donnees.ts");
const { outputText } = ts.transpileModule(readFileSync(SOURCE, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: SOURCE,
});
if (/^\s*import\s/m.test(outputText)) {
  console.error(`✗ ${path.relative(RACINE, SOURCE)} importe un module : ce script ne sait pas le charger.`);
  process.exit(1);
}
const donnees = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const { csvListePea, CHEMIN_CSV_LISTE_PEA, LIGNES_PEA } = donnees;

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
