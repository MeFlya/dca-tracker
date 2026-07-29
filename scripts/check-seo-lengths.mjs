#!/usr/bin/env node
// Garde-fou SEO : échoue si un <title> dépasse la limite d'affichage de Google,
// ou si la dette de descriptions trop longues AUGMENTE.
//
// ─── Pourquoi lire le HTML produit, et pas les sources ──────────────────────
//
// Les titres passent par des données (`etf-comparisons.ts`, `etf-index-guides.ts`,
// `backtest-stories.ts`) et par des `generateMetadata` dynamiques. Une regex sur
// les `.tsx` raterait tout ça — et c'est précisément ce genre de titre, assemblé
// ailleurs, qui dérive sans qu'on le voie. `/backtest-depuis-2010` grossit
// littéralement avec la valeur du portefeuille.
//
// ─── Les routes non prérendues ──────────────────────────────────────────────
//
// Les routes rendues à la demande n'ont pas de HTML sur disque au moment du
// build. C'est le cas de `/simulateur`, qui est la page à plus fort trafic du
// site : la laisser hors du test aurait vidé celui-ci de l'essentiel de son
// intérêt. Elles sont donc rattrapées par une seconde passe qui lit les
// littéraux `const TITLE = "…"` / `title: "…"` de leur `page.tsx`.
// Cette passe est volontairement naïve : elle ne comprend que les chaînes
// écrites en clair. Les routes qu'elle ne sait pas lire sont listées en fin de
// rapport — ce qui échappe au test doit rester visible.
//
// ─── Le cliquet sur les descriptions ────────────────────────────────────────
//
// Au moment de poser ce garde-fou, 0 titre dépassait mais 54 descriptions oui,
// en héritage. Faire échouer le build sur les 54 revenait à bloquer tout
// déploiement, donc à désactiver le test dans la semaine.
// Plutôt qu'un interrupteur binaire qu'il faudrait penser à basculer un jour :
// le compte est mémorisé dans `scripts/seo-debt.json` et le build échoue dès
// qu'il AUGMENTE. La dette ne peut que décroître, personne n'a à choisir la
// date de bascule, et le seuil se ferme tout seul en atteignant zéro.
//
// Usage :
//   node scripts/check-seo-lengths.mjs            → contrôle (utilisé en postbuild)
//   node scripts/check-seo-lengths.mjs --report   → liste tout sans jamais échouer
//   node scripts/check-seo-lengths.mjs --accept   → enregistre la dette actuelle

import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";

// Google tronque autour de 580 px, soit ~60 caractères pour du texte français.
// 155 est la limite usuelle de la description avant coupure sur mobile.
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 155;

const REPORT_ONLY = process.argv.includes("--report");
const ACCEPT = process.argv.includes("--accept");

const DEBT_FILE = "scripts/seo-debt.json";

// distDir vaut ".next.nosync" en local (contournement iCloud) et ".next" sur
// Vercel — cf. next.config.
const DIST = [".next.nosync", ".next"].find((d) =>
  existsSync(join(d, "server", "app"))
);

if (!DIST) {
  console.error(
    "✗ Aucun build trouvé (.next.nosync ni .next). Lancez `npm run build` d'abord."
  );
  process.exit(1);
}

const ROOT = join(DIST, "server", "app");
const SRC = join("src", "app");

async function walk(dir, filter) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, filter)));
    else if (filter(entry.name)) out.push(full);
  }
  return out;
}

/** Décode les entités que Next écrit dans le HTML, pour compter les vrais caractères. */
function decode(s) {
  return s
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;|&#160;/g, " ");
}

function fromHtml(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc =
    html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) ??
    html.match(/<meta[^>]+content="([^"]*)"[^>]+name="description"/i);
  return {
    title: title ? decode(title[1].trim()) : null,
    description: desc ? decode(desc[1].trim()) : null,
  };
}

/**
 * Extrait un title/description écrits en clair dans un `page.tsx`.
 * Couvre les deux formes du dépôt : `const TITLE = "…"` puis `title: TITLE`,
 * et `title: "…"` directement dans l'objet `metadata`.
 */
function fromSource(src) {
  const str = (re) => {
    const m = src.match(re);
    if (!m) return null;
    // Recolle les littéraux coupés sur plusieurs lignes par le formateur.
    return m[1].replace(/\\"/g, '"').replace(/\s*\n\s*/g, " ").trim();
  };
  return {
    title:
      str(/const\s+TITLE\s*(?::\s*string\s*)?=\s*\n?\s*"((?:[^"\\]|\\.)*)"/) ??
      str(/\btitle:\s*"((?:[^"\\]|\\.)*)"/),
    description:
      str(
        /const\s+DESCRIPTION\s*(?::\s*string\s*)?=\s*\n?\s*"((?:[^"\\]|\\.)*)"/
      ) ?? str(/\bdescription:\s*"((?:[^"\\]|\\.)*)"/),
  };
}

/** "/index.html" → "/", "/a/b.html" → "/a/b" */
function routeFromHtml(file) {
  const rel = "/" + relative(ROOT, file).replace(/\\/g, "/");
  return rel.replace(/\/index\.html$/, "/").replace(/\.html$/, "") || "/";
}

/** "src/app/simulateur/page.tsx" → "/simulateur" */
function routeFromSource(file) {
  const rel = relative(SRC, dirname(file)).replace(/\\/g, "/");
  return "/" + rel;
}

// ─── Collecte ─────────────────────────────────────────────────────────────────

const pages = new Map(); // route → { title, description, origine }

for (const file of await walk(ROOT, (n) => n.endsWith(".html"))) {
  const { title, description } = fromHtml(await readFile(file, "utf8"));
  pages.set(routeFromHtml(file), { title, description, origine: "html" });
}
const staticCount = pages.size;

// Seconde passe : les routes présentes dans les sources mais absentes du build
// statique (rendu à la demande). C'est ici que `/simulateur` est rattrapé.
const dynamicUnreadable = [];
for (const file of await walk(SRC, (n) => n === "page.tsx")) {
  const route = routeFromSource(file);
  // Les segments dynamiques ([slug]) et les groupes de routes ne correspondent
  // pas à une URL unique : leurs pages générées sont déjà couvertes par le HTML.
  if (route.includes("[") || route.includes("(")) continue;
  if (pages.has(route)) continue;

  const { title, description } = fromSource(await readFile(file, "utf8"));
  if (!title && !description) {
    dynamicUnreadable.push(route);
    continue;
  }
  pages.set(route, { title, description, origine: "source" });
}
const sourceCount = pages.size - staticCount;

// ─── Contrôle ─────────────────────────────────────────────────────────────────

const problems = [];
const missing = [];

for (const [route, { title, description, origine }] of pages) {
  if (!title) missing.push(`${route} — pas de <title>`);
  else if (title.length > MAX_TITLE)
    problems.push({ route, champ: "title", len: title.length, max: MAX_TITLE, texte: title, origine });

  if (!description) missing.push(`${route} — pas de meta description`);
  else if (description.length > MAX_DESCRIPTION)
    problems.push({ route, champ: "description", len: description.length, max: MAX_DESCRIPTION, texte: description, origine });
}

console.log(
  `Pages contrôlées : ${pages.size} (${staticCount} prérendues, ${sourceCount} lues dans les sources)`
);
if (dynamicUnreadable.length) {
  console.log(
    `⚠️  ${dynamicUnreadable.length} route(s) hors contrôle (métadonnées non littérales) : ${dynamicUnreadable.join(", ")}`
  );
}

const titleProblems = problems.filter((p) => p.champ === "title");
const descProblems = problems.filter((p) => p.champ === "description");

problems.sort((a, b) => b.len - a.len);

function show(list) {
  for (const p of list) {
    console.log(`  ${p.route}${p.origine === "source" ? "  (source)" : ""}`);
    console.log(`    ${p.champ} : ${p.len} caractères (max ${p.max}, +${p.len - p.max})`);
    console.log(`    « ${p.texte} »\n`);
  }
}

// ─── Cliquet sur les descriptions ─────────────────────────────────────────────

let debt = { descriptions: Number.POSITIVE_INFINITY };
if (existsSync(DEBT_FILE)) debt = JSON.parse(await readFile(DEBT_FILE, "utf8"));

if (ACCEPT) {
  await writeFile(
    DEBT_FILE,
    JSON.stringify({ descriptions: descProblems.length }, null, 2) + "\n"
  );
  console.log(
    `\n✓ Dette enregistrée : ${descProblems.length} description(s) trop longue(s).\n` +
      "  Le build échouera si ce nombre augmente."
  );
  process.exit(0);
}

if (missing.length) {
  console.log(`\n⚠️  ${missing.length} balise(s) absente(s) :`);
  for (const m of missing.slice(0, 10)) console.log(`   ${m}`);
  if (missing.length > 10) console.log(`   … et ${missing.length - 10} autres`);
}

const debtGrew = descProblems.length > debt.descriptions;

if (descProblems.length) {
  const delta = descProblems.length - debt.descriptions;
  console.log(
    `\n${debtGrew ? "✗" : "⚠️ "} ${descProblems.length} description(s) > ${MAX_DESCRIPTION} ` +
      `(dette enregistrée : ${debt.descriptions}${delta === 0 ? ", inchangée" : delta > 0 ? `, +${delta}` : `, ${delta}`})`
  );
  if (REPORT_ONLY) show(descProblems);
  else if (debtGrew) {
    console.log("\n   Nouvelles ou rallongées — la dette ne doit que décroître :\n");
    show(descProblems.slice(0, 8));
  } else {
    console.log("   Liste complète : npm run seo:check");
    if (delta < 0)
      console.log(
        `   ↓ ${-delta} de moins qu'avant. Enregistrez le nouveau seuil :\n` +
          "     node scripts/check-seo-lengths.mjs --accept"
      );
  }
}

if (titleProblems.length) {
  console.log(`\n✗ ${titleProblems.length} title(s) au-delà de ${MAX_TITLE} caractères :\n`);
  show(titleProblems);
}

if (REPORT_ONLY) process.exit(0);

if (!titleProblems.length && !debtGrew) {
  console.log("\n✓ Aucun title trop long, dette de descriptions stable ou en baisse.");
  process.exit(0);
}

if (titleProblems.length)
  console.log("Google tronque ces titres dans ses résultats. Raccourcissez-les avant de déployer.");
if (debtGrew)
  console.log("La dette de descriptions a augmenté. Raccourcissez, ou justifiez avec --accept.");

process.exit(1);
