#!/usr/bin/env node
// Notifie IndexNow des URL du site — Bing, et par lui DuckDuckGo, Ecosia, Qwant
// (en partie), Yandex, Seznam.
//
// ─── Pourquoi ce script existe ─────────────────────────────────────────────
//
// Vercel Analytics, 30 jours au 28/09/2026 : sur ~330 visites venues d'un moteur,
// ~80 ne viennent PAS de Google — DuckDuckGo 28, Bing 27, Brave 13, Qwant 9,
// Ecosia 4. Un quart du trafic de recherche, obtenu sans aucune action.
//
// Google explore à son rythme et ne connaît pas IndexNow. Bing, lui, prend en
// compte une notification dans l'heure. C'est le seul levier d'indexation qui ne
// dépend ni de l'autorité du domaine ni du bon vouloir d'un robot.
//
// La clé est PUBLIQUE par construction : elle prouve qu'on contrôle le domaine en
// étant servie à la racine. Elle ne donne accès à rien.
//
// Usage :
//   node scripts/indexnow.mjs                  → toutes les URL du sitemap servi
//   node scripts/indexnow.mjs /page-a /page-b  → seulement celles-là
//
// À lancer APRÈS un déploiement : notifier une URL dont la nouvelle version n'est
// pas encore en ligne fait explorer l'ancienne.

const HOTE = "dcatracker.fr";
const CLE = "789f4aa0980ae70c4d76f8c0ed2f8fad";
const EMPLACEMENT_CLE = `https://${HOTE}/${CLE}.txt`;

async function urls() {
  const demandees = process.argv.slice(2);
  if (demandees.length) return demandees.map((p) => `https://${HOTE}${p.startsWith("/") ? p : "/" + p}`);
  const xml = await (await fetch(`https://${HOTE}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

// La clé doit être servie AVANT d'être invoquée, sinon IndexNow rejette tout le
// lot — et le rejette en silence côté moteurs qui ne renvoient pas de détail.
const verif = await fetch(EMPLACEMENT_CLE);
const servie = verif.ok ? (await verif.text()).trim() : "";
if (servie !== CLE) {
  console.error(`✖ La clé n'est pas servie à ${EMPLACEMENT_CLE} (HTTP ${verif.status}). Déployer d'abord.`);
  process.exit(1);
}

const liste = await urls();
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOTE, key: CLE, keyLocation: EMPLACEMENT_CLE, urlList: liste }),
});
// 200 = accepté · 202 = reçu, clé en cours de validation · 422 = URL hors du domaine
console.log(`IndexNow : HTTP ${res.status} pour ${liste.length} URL`);
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}
