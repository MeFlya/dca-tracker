#!/usr/bin/env node
// Garde-fou SEO : échoue si un <title> ou une <meta description> dépasse la
// limite d'affichage de Google.
//
// Pourquoi lire le HTML PRODUIT et pas les sources : les titres passent par le
// template du layout, par des données (`etf-comparisons.ts`, `etf-index-guides.ts`)
// et par des `generateMetadata` dynamiques. Une regex sur les fichiers `.tsx`
// raterait tout ça, et c'est précisément ce genre de titre — assemblé ailleurs —
// qui dérive sans qu'on le voie. Ici on mesure ce que Google mesure.
//
// Limite connue : seules les pages prérendues en statique sont contrôlées. Les
// routes rendues à la demande n'ont pas de HTML sur disque au moment du build.
// Elles sont listées en fin de rapport pour qu'on sache ce qui échappe au test.
//
// ─── Pourquoi les titres bloquent et pas (encore) les descriptions ──────────
//
// Au moment où ce garde-fou est posé, 0 titre dépasse mais 55 descriptions
// oui — héritage d'avant. Faire échouer le build sur les 55 reviendrait à
// bloquer tout déploiement dès aujourd'hui, donc à désactiver le test dans la
// semaine ; un test désactivé ne sert à rien.
//
// Les titres bloquent parce qu'ils viennent d'être remis à niveau et que
// c'est la régression qu'on veut empêcher. Les descriptions sont signalées
// avec leur compte, et basculeront en bloquant quand le stock sera résorbé :
// passer STRICT_DESCRIPTIONS à true.
//
// Usage :
//   node scripts/check-seo-lengths.mjs            → échoue sur les titres trop longs
//   node scripts/check-seo-lengths.mjs --report   → liste tout sans jamais échouer

const STRICT_DESCRIPTIONS = false;

import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";

// Google tronque autour de 580 px, ce qui correspond en pratique à ~60
// caractères pour du texte français. 155 pour la description est la limite
// usuelle avant coupure sur mobile.
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 155;

const REPORT_ONLY = process.argv.includes("--report");

// distDir vaut ".next.nosync" en local (contournement iCloud) et ".next" sur
// Vercel — cf. next.config.
const DIST = [".next.nosync", ".next"].find((d) => existsSync(join(d, "server", "app")));

if (!DIST) {
  console.error(
    "✗ Aucun build trouvé (.next.nosync ni .next). Lancez `npm run build` d'abord."
  );
  process.exit(1);
}

const ROOT = join(DIST, "server", "app");

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith(".html")) out.push(full);
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

function extract(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc =
    html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) ??
    html.match(/<meta[^>]+content="([^"]*)"[^>]+name="description"/i);
  return {
    title: title ? decode(title[1].trim()) : null,
    description: desc ? decode(desc[1].trim()) : null,
  };
}

/** "/index.html" → "/", "/a/b.html" → "/a/b" */
function toRoute(file) {
  const rel = "/" + relative(ROOT, file).replace(/\\/g, "/");
  return rel.replace(/\/index\.html$/, "/").replace(/\.html$/, "") || "/";
}

const files = await htmlFiles(ROOT);
const problems = [];
const missing = [];

for (const file of files) {
  const route = toRoute(file);
  const { title, description } = extract(await readFile(file, "utf8"));

  if (!title) missing.push(`${route} — pas de <title>`);
  else if (title.length > MAX_TITLE)
    problems.push({ route, champ: "title", len: title.length, max: MAX_TITLE, texte: title });

  if (!description) missing.push(`${route} — pas de meta description`);
  else if (description.length > MAX_DESCRIPTION)
    problems.push({
      route,
      champ: "description",
      len: description.length,
      max: MAX_DESCRIPTION,
      texte: description,
    });
}

console.log(`Pages statiques contrôlées : ${files.length}`);

if (missing.length) {
  console.log(`\n⚠️  ${missing.length} balise(s) absente(s) :`);
  for (const m of missing.slice(0, 20)) console.log(`   ${m}`);
  if (missing.length > 20) console.log(`   … et ${missing.length - 20} autres`);
}

if (!problems.length) {
  console.log("✓ Aucun title > 60 ni description > 155.");
  process.exit(0);
}

problems.sort((a, b) => b.len - a.len);

const blocking = problems.filter(
  (p) => p.champ === "title" || (STRICT_DESCRIPTIONS && p.champ === "description")
);
const warnings = problems.filter((p) => !blocking.includes(p));

function show(list) {
  for (const p of list) {
    console.log(`  ${p.route}`);
    console.log(`    ${p.champ} : ${p.len} caractères (max ${p.max}, +${p.len - p.max})`);
    console.log(`    « ${p.texte} »\n`);
  }
}

if (warnings.length) {
  console.log(`\n⚠️  ${warnings.length} description(s) trop longue(s) — signalées, non bloquantes :\n`);
  if (REPORT_ONLY) show(warnings);
  else {
    for (const p of warnings.slice(0, 5))
      console.log(`   ${p.route} — ${p.len} caractères`);
    if (warnings.length > 5) console.log(`   … et ${warnings.length - 5} autres`);
    console.log(
      "\n   Liste complète : node scripts/check-seo-lengths.mjs --report"
    );
  }
}

if (!blocking.length) {
  console.log("\n✓ Aucun title trop long. Build autorisé.");
  process.exit(0);
}

console.log(`\n✗ ${blocking.length} title(s) au-delà de ${MAX_TITLE} caractères :\n`);
show(blocking);

if (REPORT_ONLY) process.exit(0);

console.log(
  "Google tronque ces titres dans ses résultats. Raccourcissez-les avant de déployer."
);
process.exit(1);
