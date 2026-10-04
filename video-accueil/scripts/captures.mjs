// Captures du site EN PRODUCTION (https://dcatracker.fr) pour la vidéo d'accueil.
//
// Lancer : npm run captures (depuis video-accueil/).
// Sortie : public/captures/*.png + public/captures/index.json + INDEX.md,
//          public/captures/textes.json (valeurs lues dans le DOM au moment de
//          la capture : ce sont les SEULS chiffres que la vidéo a le droit
//          d'afficher, avec ceux de src/lib/products.ts et src/lib/plans.ts).
//
// Règles : aucune saisie dans un formulaire, aucun clic qui envoie quoi que
// ce soit. Seuls des boutons d'affichage sont cliqués (filtre « PEA
// uniquement », bascule mensuel/annuel).
//
// 04/10/2026 : plus rien n'est lu dans la carte de démonstration de l'accueil
// (HeroDemoCard : « Montant », « Durée », « Tester avec mes chiffres »), que la
// boucle remplace dans le bandeau. Les frais par défaut sont lus dans le
// simulateur (hypothèses de calcul) et dans le code (scripts/extraire-donnees.mjs).
// Le site n'a pas de bandeau cookies (vérifié le 02/10/2026) : rien à refuser.

import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { mkdir, writeFile, stat, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.resolve(ICI, "../public/captures");
const SITE = "https://dcatracker.fr";
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

const index = [];
const textes = {};

await mkdir(path.join(SORTIE, "classeur"), { recursive: true });

const navigateur = await chromium.launch();

// ─── Outils ──────────────────────────────────────────────────────────────────

async function ouvrir(page, chemin) {
  await page.goto(SITE + chemin, { waitUntil: "networkidle" });
  // Les sections [data-reveal] n'apparaissent qu'au défilement : on les force
  // visibles pour les captures pleine page (même rendu qu'après défilement).
  await page.addStyleTag({ content: "[data-reveal]{opacity:1!important;transform:none!important}" });
  // Défilement complet : déclenche les images en chargement différé.
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  // Images encore en chargement (8 s au plus : celles des onglets masqués,
  // en chargement différé, ne se chargent jamais).
  await page.evaluate(() =>
    Promise.race([
      Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }))),
      new Promise((r) => setTimeout(r, 8000)),
    ])
  );
  // Laisse finir les animations d'entrée (courbes, compteurs : 2,8 s au plus).
  await page.waitForTimeout(3200);
}

/**
 * Le plus petit élément visible qui contient TOUS les textes donnés (et, si
 * `classe` est fourni, dont la classe contient ce motif). Renvoie sa boîte en
 * coordonnées du DOCUMENT (pour une capture `fullPage` + `clip`, où l'en-tête
 * collant reste en haut de page au lieu de masquer l'élément).
 */
async function boite(page, morceaux, { classe = null, marge = 0, hauteurMax = null } = {}) {
  // Variante : { selecteur } au lieu d'une liste de textes (images, figures).
  if (!Array.isArray(morceaux)) {
    const loc = page.locator(morceaux.selecteur).first();
    await loc.waitFor({ state: "visible" });
    const r = await loc.evaluate((el) => {
      const b = el.getBoundingClientRect();
      return { x: b.left + window.scrollX, y: b.top + window.scrollY, width: b.width, height: b.height };
    });
    return { x: Math.max(0, r.x - marge), y: Math.max(0, r.y - marge), width: r.width + 2 * marge, height: r.height + 2 * marge };
  }
  const b = await page.evaluate(
    ({ morceaux, classe }) => {
      const norm = (s) => s.replace(/\s+/g, " ").toLowerCase();
      const cibles = morceaux.map(norm);
      let meilleur = null;
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width < 40 || r.height < 20) continue;
        if (classe && !(typeof el.className === "string" && new RegExp(classe).test(el.className))) continue;
        const t = norm(el.innerText || "");
        if (!cibles.every((c) => t.includes(c))) continue;
        const aire = r.width * r.height;
        if (!meilleur || aire < meilleur.aire) {
          meilleur = { aire, x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
        }
      }
      return meilleur;
    },
    { morceaux, classe }
  );
  if (!b) throw new Error(`Élément introuvable : ${morceaux.join(" + ")}`);
  const largeurPage = await page.evaluate(() => document.documentElement.scrollWidth);
  const x = Math.max(0, b.x - marge);
  const y = Math.max(0, b.y - marge);
  const width = Math.min(largeurPage - x, b.width + 2 * marge);
  let height = b.height + 2 * marge;
  if (hauteurMax) height = Math.min(height, hauteurMax);
  return { x, y, width, height };
}

async function noter(fichier, meta) {
  const chemin = path.join(SORTIE, fichier);
  const { size } = await stat(chemin);
  const buf = await readFile(chemin);
  const largeur = buf.readUInt32BE(16);
  const hauteur = buf.readUInt32BE(20);
  index.push({
    fichier,
    page: meta.page,
    url: meta.url ?? SITE + meta.page,
    quoi: meta.quoi,
    appareil: meta.appareil,
    pixels: `${largeur}×${hauteur}`,
    octets: size,
    capturee_le: new Date().toISOString(),
  });
  console.log(`✓ ${fichier} (${largeur}×${hauteur})`);
}

async function vue(page, fichier, meta) {
  await page.screenshot({ path: path.join(SORTIE, fichier) });
  await noter(fichier, { ...meta, quoi: meta.quoi ?? "Écran au-dessus de la ligne de flottaison" });
}

async function pleinePage(page, fichier, meta) {
  await page.screenshot({ path: path.join(SORTIE, fichier), fullPage: true });
  await noter(fichier, { ...meta, quoi: meta.quoi ?? "Page entière" });
}

const echecs = [];
async function zone(page, fichier, morceaux, meta, options = {}) {
  try {
    const clip = await boite(page, morceaux, options);
    await page.screenshot({ path: path.join(SORTIE, fichier), fullPage: true, clip });
    await noter(fichier, meta);
  } catch (e) {
    echecs.push(`${fichier} : ${e.message}`);
    console.log(`✗ ${fichier} : ${e.message}`);
  }
}

/** Rectangle qui englobe plusieurs zones (ex. deux barres de filtres voisines). */
async function zoneUnion(page, fichier, listes, meta, { marge = 12 } = {}) {
  try {
    const bs = [];
    for (const morceaux of listes) bs.push(await boite(page, morceaux));
    const x = Math.max(0, Math.min(...bs.map((b) => b.x)) - marge);
    const y = Math.max(0, Math.min(...bs.map((b) => b.y)) - marge);
    const droite = Math.max(...bs.map((b) => b.x + b.width)) + marge;
    const bas = Math.max(...bs.map((b) => b.y + b.height)) + marge;
    await page.screenshot({ path: path.join(SORTIE, fichier), fullPage: true, clip: { x, y, width: droite - x, height: bas - y } });
    await noter(fichier, meta);
  } catch (e) {
    echecs.push(`${fichier} : ${e.message}`);
    console.log(`✗ ${fichier} : ${e.message}`);
  }
}

async function lire(page, morceaux, options = {}) {
  return page.evaluate(
    ({ morceaux, classe }) => {
      const norm = (s) => s.replace(/\s+/g, " ").toLowerCase();
      const cibles = morceaux.map(norm);
      let meilleur = null;
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width < 40 || r.height < 20) continue;
        if (classe && !(typeof el.className === "string" && new RegExp(classe).test(el.className))) continue;
        const t = norm(el.innerText || "");
        if (!cibles.every((c) => t.includes(c))) continue;
        const aire = r.width * r.height;
        if (!meilleur || aire < meilleur.aire) meilleur = { aire, t: el.innerText };
      }
      return meilleur ? meilleur.t.replace(/[ \t]+/g, " ").trim() : null;
    },
    { morceaux, classe: options.classe ?? null }
  );
}

// ─── Bureau (1440×900, ×2) ──────────────────────────────────────────────────

const bureau = await navigateur.newContext({ ...DESKTOP, locale: "fr-FR", timezoneId: "Europe/Paris" });
const p = await bureau.newPage();
p.setDefaultTimeout(30000);
const D = "bureau 1440×900 @2x";

// Accueil
await ouvrir(p, "/");
await vue(p, "accueil-bureau-ecran.png", { page: "/", appareil: D });
// Le bandeau est repéré par son titre seul : il marche avec la carte de
// démonstration comme avec la boucle vidéo qui la remplace.
await zone(p, "accueil-bureau-hero.png", ["Combien peut valoir votre argent"], { page: "/", appareil: D, quoi: "Bandeau d'accueil entier (titre + colonne de droite)" }, { classe: "relative max-w-7xl" });
await zone(p, "accueil-bureau-chiffres-site.png", ["Ce que contient le site"], { page: "/", appareil: D, quoi: "Bandeau « Ce que contient le site » (comparatifs, mois de données, glossaire)" });
await zone(p, "accueil-bureau-comment-ca-marche.png", ["Comment ça marche", "Entrez vos paramètres", "Suivez votre progression"], { page: "/", appareil: D, quoi: "Section « De la simulation au pilotage réel » (3 étapes)" }, { classe: "max-w-5xl" });
await zone(p, "accueil-bureau-fonctions.png", ["Des outils simples", "Comparez les principaux ETF", "Données de marché en direct"], { page: "/", appareil: D, quoi: "Section « Des outils simples pour des décisions éclairées »" }, { classe: "max-w-7xl" });
await zone(p, "accueil-bureau-section-sombre.png", ["Un cockpit qui grandit avec votre DCA", "Essayez le suivi complet"], { page: "/", appareil: D, quoi: "Section sombre slate-950 (référence de style ; la carte « Suivi de stratégie » est une MAQUETTE, ses chiffres ne sont pas réels)" }, { classe: "bg-slate-950" });
await zone(p, "accueil-bureau-engagements.png", ["Transparent par conception", "Pas de conseil personnalisé"], { page: "/", appareil: D, quoi: "Section « Transparent par conception » (4 engagements)" });
textes.accueil = {
  titre: await p.locator("h1").innerText(),
  chiffres_site: await lire(p, ["Ce que contient le site"]),
};
await pleinePage(p, "accueil-bureau-page.png", { page: "/", appareil: D });

// Simulateur (réglages par défaut : 200 €/mois, 20 ans, 7 %, TER 0,38 %)
await ouvrir(p, "/simulateur");
await vue(p, "simulateur-bureau-ecran.png", { page: "/simulateur", appareil: D, quoi: "Écran d'arrivée : paramètres + résultat affiché (réglages par défaut)" });
await zone(p, "simulateur-bureau-resultat.png", ["Scénario central", "Voir tous les scénarios"], { page: "/simulateur", appareil: D, quoi: "Carte résultat sombre : 97 753 € (200 €/mois, 20 ans, 7 %/an avant frais)" });
await zone(p, "simulateur-bureau-parametres.png", ["Paramètres", "Réinitialiser", "Versement mensuel", "Intégrer l'inflation"], { page: "/simulateur", appareil: D, quoi: "Panneau Paramètres (curseurs)" });
await zone(p, "simulateur-bureau-indicateurs.png", ["Capital investi", "Valeur estimée", "Gains potentiels", "240 versements"], { page: "/simulateur", appareil: D, quoi: "Quatre indicateurs (capital investi, valeur estimée, gains, durée)" });
await zone(p, "simulateur-bureau-graphique.png", ["Évolution du portefeuille", "Projection hypothétique"], { page: "/simulateur", appareil: D, quoi: "Graphique « Évolution du portefeuille » (3 courbes de scénarios + versé)" }, { classe: "rounded|\\bcard" });
await zone(p, "simulateur-bureau-repartition.png", ["Répartition de votre projection", "Multiplicateur"], { page: "/simulateur", appareil: D, quoi: "Anneau « Répartition de votre projection »" }, { classe: "rounded|\\bcard" });
await zone(p, "simulateur-bureau-scenarios.png", ["3 scénarios comparés", "Conservateur", "Optimiste"], { page: "/simulateur", appareil: D, quoi: "3 scénarios comparés (5 %, 7 %, 9 % brut)" });
await zone(p, "simulateur-bureau-annee-par-annee.png", ["Votre simulation année par année", "Plus-value"], { page: "/simulateur", appareil: D, quoi: "Tableau année par année" }, { classe: "rounded|\\bcard" });
textes.simulateur = {
  resultat: await lire(p, ["Scénario central", "Voir tous les scénarios"]),
  indicateurs: await lire(p, ["Capital investi", "Valeur estimée", "Gains potentiels", "240 versements"]),
  scenarios: await lire(p, ["3 scénarios comparés", "Conservateur", "Optimiste"]),
  // « Rendement net = 7 % − 0,38 % (frais TER) = 6,62 %/an » : les frais que le
  // simulateur déduit par défaut (mention « frais de l'ETF (0,38 %) déduits »
  // de la vidéo, recoupée par extraire-donnees.mjs). Le bloc est replié dans
  // un <details> : lu par textContent, sans clic. null si introuvable, et
  // extraire-donnees.mjs s'arrête alors.
  hypotheses: await p.evaluate(() => {
    const d = [...document.querySelectorAll("details")].find((el) => /Hypothèses de calcul/.test(el.textContent) && /frais TER/.test(el.textContent));
    return d ? d.textContent.replace(/\s+/g, " ").trim() : null;
  }),
};
if (!textes.simulateur.hypotheses) echecs.push("textes.simulateur.hypotheses : bloc « Hypothèses de calcul » (frais TER) introuvable sur /simulateur");
await pleinePage(p, "simulateur-bureau-page.png", { page: "/simulateur", appareil: D });

// Comparateur d'ETF
await ouvrir(p, "/comparer-etf");
await vue(p, "comparer-etf-bureau-ecran.png", { page: "/comparer-etf", appareil: D });
await zoneUnion(p, "comparer-etf-bureau-filtres.png", [["Monde", "Émergents", "PEA uniquement"], ["Trier", "Alphabétique"]], { page: "/comparer-etf", appareil: D, quoi: "Barres de filtres (région, PEA uniquement, TER, tri), filtre PEA désactivé" });
await zone(p, "comparer-etf-bureau-carte-wpea.png", ["WPEA", "Simuler", "Voir le détail", "IE0002XZSHO1"], { page: "/comparer-etf", appareil: D, quoi: "Carte WPEA (TER, réplication, ISIN, cours indicatif)" }, { classe: "rounded|\\bcard" });
await zone(p, "comparer-etf-bureau-carte-dcam.png", ["DCAM", "Simuler", "Voir le détail", "FR001400U5Q4"], { page: "/comparer-etf", appareil: D, quoi: "Carte DCAM" }, { classe: "rounded|\\bcard" });
await zone(p, "comparer-etf-bureau-carte-cw8.png", ["CW8", "Simuler", "Voir le détail", "LU1681043599"], { page: "/comparer-etf", appareil: D, quoi: "Carte CW8" }, { classe: "rounded|\\bcard" });
textes.comparer_etf = {
  chapeau: await lire(p, ["ETF analysés"]),
};
await pleinePage(p, "comparer-etf-bureau-page.png", { page: "/comparer-etf", appareil: D });
// Filtre « PEA uniquement » (affichage seul)
// L'interrupteur est le <div> juste avant le libellé (ETFGrid.tsx).
await p.locator("span", { hasText: /^PEA uniquement$/ }).locator("xpath=preceding-sibling::div[1]").click();
await p.waitForTimeout(1200);
await vue(p, "comparer-etf-bureau-pea-uniquement.png", { page: "/comparer-etf", appareil: D, quoi: "Filtre « PEA uniquement » activé" });
await zoneUnion(p, "comparer-etf-bureau-filtres-pea.png", [["Monde", "Émergents", "PEA uniquement"], ["Trier", "Alphabétique"]], { page: "/comparer-etf", appareil: D, quoi: "Barres de filtres, « PEA uniquement » activé (compteur d'ETF à droite)" });
textes.comparer_etf.compteur_pea_uniquement = await lire(p, ["TER", "Tous", "0,20 %", "ETF"]);

// ETF éligibles au PEA
await ouvrir(p, "/etf-eligibles-pea");
await vue(p, "etf-eligibles-pea-bureau-ecran.png", { page: "/etf-eligibles-pea", appareil: D });
await zone(p, "etf-eligibles-pea-bureau-entete.png", ["Vérifiée le", "ETF éligibles au PEA : la liste vérifiée"], { page: "/etf-eligibles-pea", appareil: D, quoi: "En-tête « ETF éligibles au PEA : la liste vérifiée »" }, { classe: "rounded|\\bcard" });
await zoneUnion(p, "etf-eligibles-pea-bureau-msci-world.png", [["Environ 1 300 grandes"], ["Réplication", "Dividendes", "CW8", "EWLD", "Lancé le 26 mars 2024"]], { page: "/etf-eligibles-pea", appareil: D, quoi: "Tableau MSCI World (CW8, DCAM, EWLD, WPEA : ISIN, frais, réplication, dividendes)" });
await zone(p, "etf-eligibles-pea-bureau-carte-iwda.png", ["IWDA", "Non éligible au PEA", "Pour le MSCI World dans un PEA"], { page: "/etf-eligibles-pea", appareil: D, quoi: "Carte IWDA : non éligible, la raison, et les équivalents PEA vérifiés (porte la mention « Présenté à tort comme éligible sur ce site »)" }, { marge: 4 });
await zone(p, "etf-eligibles-pea-bureau-non-eligibles.png", ["Ils ne sont pas éligibles au PEA", "Aucun de ces"], { page: "/etf-eligibles-pea", appareil: D, quoi: "Début de la section « Ils ne sont pas éligibles au PEA » (raison + équivalent PEA)" }, { marge: 16, hauteurMax: 1000 });
textes.etf_eligibles_pea = {
  entete: await lire(p, ["Vérifiée le", "ETF éligibles au PEA : la liste vérifiée"]),
  h2_liste: await p.locator("h2", { hasText: "La liste" }).first().innerText(),
};

// Cockpit DCA (produit, 19 €)
await ouvrir(p, "/produits/template-suivi-dca");
await vue(p, "cockpit-bureau-ecran.png", { page: "/produits/template-suivi-dca", appareil: D, quoi: "Bandeau sombre du Cockpit DCA : prix, capture « Versement du mois »" });
await zoneUnion(p, "cockpit-bureau-fenetre-versement.png", [["Cockpit-DCA-PEA_dcatracker.xlsx", "Agrandir"], { selecteur: 'img[alt^="Onglet Versement du mois"]' }], { page: "/produits/template-suivi-dca", appareil: D, quoi: "Fenêtre du classeur, onglet « Versement du mois » (exemple pré-rempli)" }, { marge: 2 });
await zone(p, "cockpit-bureau-chiffres.png", ["onglets, du mode d'emploi aux frais", "ETF suivis au maximum"], { page: "/produits/template-suivi-dca", appareil: D, quoi: "Chiffres clés (8 onglets, 1 000 lignes, 10 ETF, 2 formats)" }, { marge: 16 });
await zone(p, "cockpit-bureau-visite.png", ["Ce que vous verrez en ouvrant le fichier", "Onglet « Dashboard »"], { page: "/produits/template-suivi-dca", appareil: D, quoi: "Visite du classeur, onglet Dashboard" });
await zone(p, "cockpit-bureau-onglets.png", ["Huit onglets, un rôle chacun", "Mode d'emploi", "Frais"], { page: "/produits/template-suivi-dca", appareil: D, quoi: "Grille « Huit onglets, un rôle chacun »" });
textes.cockpit = {
  bandeau: await lire(p, ["Cockpit DCA", "paiement unique", "Acheter le Cockpit DCA"]),
};
await pleinePage(p, "cockpit-bureau-page.png", { page: "/produits/template-suivi-dca", appareil: D });

// Captures du classeur telles que servies par le site (images publiques).
for (const nom of [
  "cockpit-v2-dashboard.png",
  "cockpit-v2-versement.png",
  "cockpit-v2-versement-complet.png",
  "cockpit-v2-pea.png",
  "cockpit-v2-par-etf.png",
  "cockpit-v2-projection.png",
  "cockpit-v2-frais.png",
]) {
  const url = `${SITE}/produits/${nom}`;
  const rep = await p.request.get(url);
  if (!rep.ok()) throw new Error(`${url} → ${rep.status()}`);
  const corps = await rep.body();
  await writeFile(path.join(SORTIE, "classeur", nom), corps);
  await noter(`classeur/${nom}`, { page: "/produits/template-suivi-dca", url, appareil: "image du site (capture du classeur, 01/10/2026)", quoi: "Capture du classeur Cockpit v2.0 servie par le site" });
  index.at(-1).sha256 = createHash("sha256").update(corps).digest("hex");
}

// Suivi PEA Excel (modèle gratuit)
await ouvrir(p, "/suivi-pea-excel");
await vue(p, "suivi-pea-excel-bureau-ecran.png", { page: "/suivi-pea-excel", appareil: D });
await zone(p, "suivi-pea-excel-bureau-deux-facons.png", ["Deux façons de faire", "Partir du modèle gratuit", "Ou prendre le classeur complet"], { page: "/suivi-pea-excel", appareil: D, quoi: "Encadré « Deux façons de faire » (modèle gratuit / Cockpit)" }, { classe: "rounded|\\bcard" });
await zone(p, "suivi-pea-excel-bureau-onglets.png", ["Onglet", "Ce qu'il fait", "Modèle gratuit", "Transactions", "Frais"], { page: "/suivi-pea-excel", appareil: D, quoi: "Tableau des onglets : lesquels sont dans le modèle gratuit" }, { marge: 8 });
await zone(p, "suivi-pea-excel-bureau-transactions.png", { selecteur: 'figure:has(img[alt^="Onglet Transactions du modèle gratuit"])' }, { page: "/suivi-pea-excel", appareil: D, quoi: "Onglet Transactions (identique dans le modèle gratuit et le Cockpit) + légende" }, { marge: 12 });
textes.suivi_pea_excel = { deux_facons: await lire(p, ["Deux façons de faire", "Partir du modèle gratuit"]) };

// Tarifs (annuel par défaut, puis mensuel)
await ouvrir(p, "/tarifs");
await vue(p, "tarifs-bureau-ecran.png", { page: "/tarifs", appareil: D, quoi: "Écran d'arrivée /tarifs (bascule sur Annuel)" });
await zone(p, "tarifs-bureau-cartes-annuel.png", ["Tout pour démarrer votre DCA", "Le plus populaire", "Support par email"], { page: "/tarifs", appareil: D, quoi: "Cartes Gratuit / Premium, tarif annuel" }, { marge: 24 });
textes.tarifs = { annuel: await lire(p, ["Tout pour démarrer votre DCA", "Le plus populaire", "Support par email"]) };
await p.getByRole("switch", { name: "Basculer entre tarif mensuel et annuel" }).click();
await p.waitForTimeout(800);
await zone(p, "tarifs-bureau-cartes-mensuel.png", ["Tout pour démarrer votre DCA", "Le plus populaire", "Support par email"], { page: "/tarifs", appareil: D, quoi: "Cartes Gratuit / Premium, tarif mensuel" }, { marge: 24 });
textes.tarifs.mensuel = await lire(p, ["Tout pour démarrer votre DCA", "Le plus populaire", "Support par email"]);
// Premium sans le badge « Le plus populaire » (affirmation que la vidéo ne reprend pas).
await zone(p, "tarifs-bureau-premium-prix.png", ["Premium", "4,90 €", "facturé annuellement"], { page: "/tarifs", appareil: D, quoi: "Bloc prix Premium, tarif mensuel (sans le badge)" }, { marge: 16 });
await zone(p, "tarifs-bureau-premium-liste.png", ["Suivi mensuel de stratégie + emails", "Support par email"], { page: "/tarifs", appareil: D, quoi: "Liste des fonctions Premium (sans le badge)" }, { marge: 16 });
await zone(p, "tarifs-bureau-gratuit-liste.png", ["Simulateur DCA (3 scénarios, 30 ans)", "Comparaison A vs B"], { page: "/tarifs", appareil: D, quoi: "Liste des fonctions du plan Gratuit (inclus / non inclus)" }, { marge: 16 });

// Backtest (Premium ; exemples en accès libre)
await ouvrir(p, "/backtest");
await vue(p, "backtest-bureau-ecran.png", { page: "/backtest", appareil: D });
await zone(p, "backtest-bureau-scenarios.png", ["Scénarios populaires", "DCA depuis COVID", "DCA 10 ans glissants"], { page: "/backtest", appareil: D, quoi: "Boutons des scénarios (Premium)" }, { marge: 8 });

// Fiscalité 2026 et calculateur fiscal (gratuits)
await ouvrir(p, "/fiscalite-pea-cto-2026");
await vue(p, "fiscalite-2026-bureau-ecran.png", { page: "/fiscalite-pea-cto-2026", appareil: D });
textes.fiscalite_2026 = { h1: await p.locator("h1").innerText() };
await ouvrir(p, "/calculateur-fiscal-pea-cto");
await vue(p, "calculateur-fiscal-bureau-ecran.png", { page: "/calculateur-fiscal-pea-cto", appareil: D });
await zone(p, "calculateur-fiscal-bureau-taux.png", ["En 2026, un gain retiré d'un", "12,8 points"], { page: "/calculateur-fiscal-pea-cto", appareil: D, quoi: "Paragraphe des taux 2026 (18,6 % de prélèvements sociaux, PFU de 31,4 %)" }, { marge: 16 });
await zone(p, "calculateur-fiscal-bureau-resultat.png", ["Comparaison fiscale", "même stratégie"], { page: "/calculateur-fiscal-pea-cto", appareil: D, quoi: "Carte sombre « Comparaison fiscale » (réglages par défaut du calculateur)" });
textes.calculateur_fiscal = {
  h1: await p.locator("h1").innerText(),
  taux: await lire(p, ["En 2026, un gain retiré d'un", "12,8 points"]),
  resultat: await lire(p, ["Comparaison fiscale", "même stratégie"]),
};

await bureau.close();

// ─── Mobile (390×844, ×3) ───────────────────────────────────────────────────

const mobile = await navigateur.newContext({ ...MOBILE, locale: "fr-FR", timezoneId: "Europe/Paris" });
const m = await mobile.newPage();
m.setDefaultTimeout(30000);
const M = "mobile 390×844 @3x";
for (const [chemin, nom] of [
  ["/", "accueil"],
  ["/simulateur", "simulateur"],
  ["/comparer-etf", "comparer-etf"],
  ["/etf-eligibles-pea", "etf-eligibles-pea"],
  ["/produits/template-suivi-dca", "cockpit"],
  ["/suivi-pea-excel", "suivi-pea-excel"],
  ["/tarifs", "tarifs"],
]) {
  await ouvrir(m, chemin);
  await vue(m, `${nom}-mobile-ecran.png`, { page: chemin, appareil: M });
}
await ouvrir(m, "/simulateur");
await zone(m, "simulateur-mobile-resultat.png", ["Scénario central", "Voir tous les scénarios"], { page: "/simulateur", appareil: M, quoi: "Carte résultat sombre, mobile" });
await mobile.close();

await navigateur.close();

// ─── Index ───────────────────────────────────────────────────────────────────

const date = new Date().toISOString();
await writeFile(path.join(SORTIE, "index.json"), JSON.stringify({ site: SITE, genere_le: date, captures: index }, null, 2) + "\n");
await writeFile(path.join(SORTIE, "textes.json"), JSON.stringify({ site: SITE, lu_le: date, textes }, null, 2) + "\n");

const ko = (n) => `${Math.round(n / 1024)} Ko`;
const lignes = [
  "# Captures du site en production",
  "",
  `Source : ${SITE}. Générées le ${date} par \`npm run captures\` (scripts/captures.mjs, Playwright Chromium).`,
  "Bureau : 1440×900, deviceScaleFactor 2. Mobile : 390×844, deviceScaleFactor 3. Aucun bandeau cookies sur le site.",
  "Les valeurs lues dans le DOM au même moment sont dans `textes.json`.",
  "",
  "| Fichier | Page | Contenu | Appareil | Pixels | Poids |",
  "|---|---|---|---|---|---|",
  ...index.map((c) => `| \`${c.fichier}\` | ${c.page} | ${c.quoi} | ${c.appareil} | ${c.pixels} | ${ko(c.octets)} |`),
  "",
];
await writeFile(path.join(SORTIE, "INDEX.md"), lignes.join("\n"));
console.log(`\n${index.length} captures → ${SORTIE}`);
if (echecs.length) {
  console.log(`\n${echecs.length} zone(s) introuvable(s) :\n${echecs.join("\n")}`);
  process.exitCode = 1;
}
