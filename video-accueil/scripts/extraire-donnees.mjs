// Relit, AU MOMENT DU RENDU, chaque chiffre que la vidéo affiche.
//
// Lancer : npm run donnees (fait aussi par npm run rendu et npm run studio).
// Sortie : src/donnees.json, importé par les compositions.
//
// Règle du storyboard (section 7) : « prix, nombres d'ETF et date de
// vérification sont relus dans le code ou dans textes.json. On ne les recopie
// pas à la main dans les compositions. » Ce script est l'endroit où ils sont
// relus. S'il ne trouve pas une valeur, il S'ARRÊTE : mieux vaut pas de vidéo
// qu'une vidéo avec un chiffre périmé.
//
// Sources :
//   - ../src/lib/products.ts        prix du Cockpit DCA (priceEur du TEMPLATE)
//   - ../src/lib/plans.ts           Premium : 4,90 €/mois, 7 jours d'essai
//   - ../src/lib/tarifs-affiches.ts Premium : 49 €/an (et recoupement des deux)
//   - ../src/components/home/Hero.tsx  pastille du bandeau d'accueil
//   - ../src/lib/simulation-params.ts  réglages par défaut du simulateur
//   - ../src/lib/etf-config.ts      frais par défaut du simulateur
//                                   (TER_REFERENCE_SIMULATEUR, le TER de CW8)
//   - public/captures/textes.json   valeurs lues sur le site en production
// Rien n'est lu dans la carte de démonstration de l'accueil (HeroDemoCard),
// que la boucle remplace (04/10/2026).

import { readFile, writeFile, access, mkdir, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const VIDEO = path.resolve(ICI, "..");
const SITE = path.resolve(VIDEO, "..");

const lire = (chemin) => readFile(path.join(SITE, chemin), "utf8");
function trouver(texte, motif, quoi) {
  const m = texte.match(motif);
  if (!m) throw new Error(`extraire-donnees : introuvable — ${quoi} (motif ${motif})`);
  return m[1];
}
const entier = (s) => Number(String(s).replace(/[^\d]/g, ""));

// ─── Code du site ────────────────────────────────────────────────────────────
const products = await lire("src/lib/products.ts");
const plans = await lire("src/lib/plans.ts");
const tarifs = await lire("src/lib/tarifs-affiches.ts");
const hero = await lire("src/components/home/Hero.tsx");

const cockpitPrix = Number(
  trouver(products, /const TEMPLATE: Product = \{[\s\S]*?\n {2}priceEur: (\d+(?:\.\d+)?),/, "priceEur du Cockpit (TEMPLATE)")
);
const premiumMensuel = Number(trouver(plans, /PREMIUM_PRIX_MENSUEL_EUR = ([\d.]+);/, "PREMIUM_PRIX_MENSUEL_EUR"));
const premiumEssai = Number(trouver(plans, /PREMIUM_ESSAI_JOURS = (\d+);/, "PREMIUM_ESSAI_JOURS"));
const premiumMensuel2 = Number(trouver(tarifs, /PREMIUM_MENSUEL_EUR = ([\d.]+);/, "PREMIUM_MENSUEL_EUR"));
const premiumAnnuel = Number(trouver(tarifs, /PREMIUM_ANNUEL_EUR = ([\d.]+);/, "PREMIUM_ANNUEL_EUR"));
const premiumEssai2 = Number(trouver(tarifs, /ESSAI_JOURS = (\d+);/, "ESSAI_JOURS"));
if (premiumMensuel !== premiumMensuel2 || premiumEssai !== premiumEssai2) {
  throw new Error(
    `extraire-donnees : plans.ts (${premiumMensuel} €, ${premiumEssai} j) et tarifs-affiches.ts (${premiumMensuel2} €, ${premiumEssai2} j) divergent. Corriger le site avant de rendre la vidéo.`
  );
}
const pastille = trouver(hero, /animate-ping[^\n]*\n\s*<\/span>\n\s*([^<\n]+?)\s*\n/, "pastille du bandeau d'accueil (Hero.tsx)");

// ─── Site en production (textes.json) ───────────────────────────────────────
// Espaces insécables (U+00A0, U+202F) ramenées à des espaces simples pour la
// lecture : les motifs ci-dessous restent lisibles.
const brut = await readFile(path.join(VIDEO, "public/captures/textes.json"), "utf8");
const { lu_le: textesLusLe, textes: t } = JSON.parse(brut.replace(/[\u00a0\u202f]/g, " "));

const simu = t.simulateur.resultat;
const versementMensuel = entier(trouver(simu, /En investissant ([\d ]+) €\/mois/, "versement du simulateur"));
const dureeAns = entier(trouver(simu, /pendant (\d+) ans/, "durée du simulateur"));
const hypothese = trouver(simu, /hypothèse de rendement ([\d,]+) %\/an avant frais/, "hypothèse du simulateur");
const valeurFinale = entier(trouver(simu, /\n\n([\d ]+) €\n\nScénario central/, "résultat du simulateur"));
const capitalVerse = entier(trouver(simu, /Capital investi\n\n([\d ]+) €/, "capital investi"));
const mentionSimu = trouver(simu, /(Scénario central : [^\n]+)/, "mention du simulateur");
const scen = t.simulateur.scenarios;
const tauxScenarios = [...scen.matchAll(/(\d+) %\/an brut/g)].map((m) => Number(m[1]));
if (tauxScenarios.length !== 3) throw new Error("extraire-donnees : 3 scénarios attendus");
const valeursScenarios = [...scen.matchAll(/Capital final\n\n([\d ]+) €/g)].map((m) => entier(m[1]));
if (valeursScenarios[1] !== valeurFinale) throw new Error("extraire-donnees : le scénario Base ne recoupe pas le résultat affiché");

// ─── Frais par défaut du simulateur ─────────────────────────────────────────
// Mention « frais de l'ETF (0,38 %) déduits » sous 97 753 € (boucle, version
// carrée, version complète). Jusqu'au 03/10, ils étaient lus sur la carte de
// démonstration de l'accueil (HeroDemoCard), que la boucle remplace. Ils sont
// désormais lus dans le code du simulateur, puis recoupés avec ce que le
// simulateur affiche en production. Arrêt au moindre écart.
const enNombre = (s) => Number(String(s).replace(",", "."));
const params = await lire("src/lib/simulation-params.ts");
const defaut = (cle) =>
  trouver(params, new RegExp(`\\n\\s+${cle}:\\s*\\{[^}\\n]*default:\\s*([\\w.]+)\\s*\\}`), `défaut de ${cle} (simulation-params.ts)`);
if (defaut("annualFeesPct") !== "TER_REFERENCE_SIMULATEUR") {
  throw new Error(
    `extraire-donnees : le défaut des frais du simulateur n'est plus TER_REFERENCE_SIMULATEUR (simulation-params.ts : ${defaut("annualFeesPct")}). Revoir la mention des frais.`
  );
}
// Les autres réglages par défaut du code doivent être ceux lus en production.
for (const [cle, attendu] of [
  ["monthlyAmount", versementMensuel],
  ["durationYears", dureeAns],
  ["annualReturnPct", enNombre(hypothese)],
]) {
  if (Number(defaut(cle)) !== attendu) {
    throw new Error(
      `extraire-donnees : ${cle} vaut ${defaut(cle)} dans simulation-params.ts et ${attendu} sur le simulateur en production (textes.json). Relancer npm run captures après la mise en ligne.`
    );
  }
}
const etfConfig = await lire("src/lib/etf-config.ts");
const symboleFrais = trouver(
  etfConfig,
  /export const TER_REFERENCE_SIMULATEUR =\s*ETF_LIST\.find\(\(e\) => e\.displaySymbol === "([^"]+)"\)\?\.ter/,
  "définition de TER_REFERENCE_SIMULATEUR (etf-config.ts)"
);
const ficheFrais = trouver(
  etfConfig,
  new RegExp(`(\\n  \\{\\n(?:(?!\\n  \\}).)*?\\n\\s+displaySymbol: "${symboleFrais}",[\\s\\S]*?\\n  \\})`, "s"),
  `fiche ${symboleFrais} du catalogue (etf-config.ts)`
);
const terCode = Number(trouver(ficheFrais, /\n\s+ter: ([\d.]+),/, `TER de ${symboleFrais} (etf-config.ts)`));
if (!(terCode > 0 && terCode < 2)) throw new Error(`extraire-donnees : TER de ${symboleFrais} illisible (${terCode})`);
const fraisDefaut = terCode.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
// Recoupement 1 (textes.json du 02/10 et suivants) : hypothèse − frais du code
// = « Rendement net » affiché par le simulateur en production, à 0,005 point près.
const rendementNet = trouver(t.simulateur.indicateurs, /Rendement net : ([\d,]+) %\/an/, "rendement net du simulateur");
if (Math.abs(enNombre(hypothese) - terCode - enNombre(rendementNet)) > 0.005) {
  throw new Error(
    `extraire-donnees : frais du code (${symboleFrais}, ${fraisDefaut} %) et simulateur en production (${hypothese} % brut, ${rendementNet} % net) divergent. Revoir la mention des frais.`
  );
}
// Recoupement 2 (captures faites après le 04/10) : « Rendement net = 7 % −
// 0,38 % (frais TER) » dans les hypothèses de calcul du simulateur, lu par
// scripts/captures.mjs. Les textes du 02/10 n'ont pas cette clé : le
// recoupement 1 suffit alors. Clé présente mais vide (lecture ratée) : arrêt.
if ("hypotheses" in t.simulateur) {
  const terSite = trouver(t.simulateur.hypotheses ?? "", /− ([\d,]+) % \(frais TER\)/, "frais TER des hypothèses de calcul du simulateur");
  if (enNombre(terSite) !== terCode) {
    throw new Error(
      `extraire-donnees : le simulateur en production déduit ${terSite} % de frais, le code ${fraisDefaut} % (${symboleFrais}). Revoir la mention des frais.`
    );
  }
}

const nbEtfComparateur = entier(trouver(t.comparer_etf.chapeau, /^(\d+) ETF analysés/, "nombre d'ETF du comparateur"));
const nbEtfFiltrePea = entier(trouver(t.comparer_etf.compteur_pea_uniquement, /(\d+) ETFs\s*$/, "compteur du filtre PEA"));

const entete = t.etf_eligibles_pea.entete;
const dateVerif = trouver(entete, /VÉRIFIÉE LE ([^\n]+)/, "date de vérification de la liste PEA").toLowerCase();
const nbEtfPea = entier(trouver(entete, /(\d+) ETF éligibles au PEA, vérifiés un par un/, "nombre d'ETF éligibles au PEA"));

// La version complète écrit « 13 ETF éligibles au PEA », puis « Dont les 8 du
// filtre « PEA uniquement » ». Vrai tant que les ETF éligibles du comparateur
// (etf-config.ts) sont aussi ceux du filtre, et que la liste vérifiée les
// reprend tous (etf-pea-verifies.ts les LIT dans le catalogue).
const eligiblesCatalogue = (etfConfig.match(/^\s+peaEligible: true,/gm) ?? []).length;
const verifies = await lire("src/lib/etf-pea-verifies.ts");
if (eligiblesCatalogue !== nbEtfFiltrePea || nbEtfPea < nbEtfFiltrePea || !/TOUS\.filter\(\(f\) => f\.peaEligible\)/.test(verifies) || !/\.\.\.ETF_LIST\.map\(depuisCatalogue\)/.test(verifies)) {
  throw new Error(
    `extraire-donnees : « ${nbEtfPea} ETF éligibles, dont les ${nbEtfFiltrePea} du filtre PEA » n'est plus démontré ` +
      `(${eligiblesCatalogue} éligibles dans etf-config.ts, ${nbEtfFiltrePea} au filtre du site, ${nbEtfPea} dans la liste). Revoir le plan C5.`
  );
}

const taux = t.calculateur_fiscal.taux;
const tauxPea = trouver(taux, /prélèvements sociaux, ([\d,]+ %)/, "taux PEA");
const tauxCto = trouver(taux, /\(PFU\) de ([\d,]+ %)/, "taux CTO");

const cockpitBandeau = t.cockpit.bandeau;
if (!cockpitBandeau.includes(`${cockpitPrix} € · paiement unique`)) {
  throw new Error(`extraire-donnees : le site en production n'affiche pas « ${cockpitPrix} € · paiement unique » (products.ts et la capture divergent : relancer npm run captures ?)`);
}
if (!t.tarifs.annuel.includes(`Essai gratuit ${premiumEssai} jours`)) {
  throw new Error("extraire-donnees : l'essai affiché sur /tarifs ne recoupe pas plans.ts");
}
for (const f of ["Suivi mensuel de stratégie", "Récap fiscal annuel", "Analyse Monte Carlo", "Backtest historique (DCA sur les vrais cours depuis 2008)"]) {
  if (!t.tarifs.mensuel.includes(f)) throw new Error(`extraire-donnees : « ${f} » absent de /tarifs`);
}
// Conditions de l'essai écrites sous le prix (plan C8 de la version carrée) et
// avertissement de la fin (C9) : relus sur le site, pour ne pas promettre
// autre chose que lui.
if (!t.tarifs.mensuel.includes(`Essai gratuit ${premiumEssai} jours · annulable à tout moment`)) {
  throw new Error("extraire-donnees : « annulable à tout moment » absent de /tarifs (mention du plan C8)");
}
const pageTarifs = await lire("src/app/tarifs/page.tsx");
if (!pageTarifs.includes("Un moyen de paiement est requis pour confirmer l'essai")) {
  throw new Error("extraire-donnees : « moyen de paiement requis » absent de la FAQ de /tarifs (mention du plan C8)");
}
const piedDePage = (await lire("src/components/layout/Footer.tsx")).replace(/\s+/g, " ");
for (const f of ["ne constitue pas un conseil en investissement", "Investir comporte un risque de perte en capital"]) {
  if (!piedDePage.includes(f)) throw new Error(`extraire-donnees : « ${f} » absent de Footer.tsx (mention du plan C9)`);
}

// ─── Boucle du Cockpit (BoucleCockpit, STORYBOARD-COCKPIT.md §5) ─────────────
// Tout ce que la boucle du Cockpit écrit ou montre est relu ici. Arrêt au
// moindre écart : mieux vaut pas de vidéo qu'une vidéo qui montre un ancien
// exemple, un ancien prix, ou dit ce que la fiche ne dit plus.
const ficheCockpit = trouver(products, /(const TEMPLATE: Product = \{[\s\S]*?\n\};)/, "fiche TEMPLATE de products.ts");
const cockpitTitre = trouver(ficheCockpit, /titreHero: \{\s*principal: "([^"]+)",/, "titreHero.principal du Cockpit");
const cockpitComplement = trouver(ficheCockpit, /titreHero: \{[^}]*complement: "([^"]+)",/, "titreHero.complement du Cockpit");
// « Tableau de bord PEA (Excel + Google Sheets) » → deux lignes, coupées sur « ( ».
const complementLignes = trouver(cockpitComplement, /^(.+ \(.+\))$/, "forme « … (…) » de titreHero.complement")
  .match(/^(.+) \((.+)\)$/)
  .slice(1, 3);
// Phrases de la fiche que la vidéo reprend ou résume (plans P1 à P5). Si
// l'une disparaît de la fiche, la vidéo ne doit plus la dire.
const ficheAplatie = ficheCockpit.replace(/\s+/g, " ");
for (const [phrase, plan] of [
  ["en parts entières par ETF pour revenir vers votre allocation cible", "P3, sous-titre"],
  ["il vous dit où verser", "P3, titre"],
  ["il vous dit où verser : combien de parts de chaque ETF acheter", "P1, question et sous-titre"],
  ["répartition réelle vs cible", "P2"],
  ["valeur du portefeuille, total versé, plus-value €/%, TRI annualisé (XIRR), frais cumulés", "P4, cases montrées (valeur, versé, frais)"],
  ["cases bleues = à remplir — tout le reste est automatique", "P4, sous-titre « recalculés depuis vos achats »"],
  ["Conçu 100 % pour le PEA français", "P5, titre"],
  ["paiement unique", "P6, pastille"],
]) {
  if (!ficheAplatie.includes(phrase)) throw new Error(`extraire-donnees : « ${phrase} » absent de la fiche du Cockpit (products.ts) — ${plan} de la boucle du Cockpit à revoir`);
}
// Le sous-titre de P5 est COPIÉ de la fiche (abstract[2]), pas retapé.
const pea = trouver(ficheAplatie, /Conçu 100 % pour le PEA français — ([^—]+?) —/, "« plafond, cap des 5 ans, prélèvements sociaux » (abstract[2])");
if (pea !== "plafond, cap des 5 ans, prélèvements sociaux") {
  throw new Error(`extraire-donnees : abstract[2] du Cockpit dit maintenant « ${pea} » : revoir le plan P5 (zones de la capture PEA)`);
}
// Mention du versement du mois : la légende de la capture sur le site.
if (!products.replace(/\s+/g, " ").includes("Calcul fait sur l'allocation que vous fixez, pas un conseil")) {
  throw new Error("extraire-donnees : « Calcul fait sur l'allocation que vous fixez, pas un conseil » absent de products.ts (mention du plan P3)");
}

// L'exemple pré-rempli, recalculé par le code du site (mêmes formules que le
// classeur) : ce que montrent les pixels des captures doit en sortir. Le
// fichier TypeScript est lu par Node (types retirés), copié sous une
// extension .mts pour être chargé comme module.
const exempleTs = await lire("src/lib/cockpit-exemple.ts");
if (/^import /m.test(exempleTs)) throw new Error("extraire-donnees : cockpit-exemple.ts importe un module : le chargement direct n'est plus possible");
const TMP = path.join(VIDEO, "out/.donnees");
await mkdir(TMP, { recursive: true });
const copieExemple = path.join(TMP, "cockpit-exemple.mts");
await writeFile(copieExemple, exempleTs);
const ex = await import(`${pathToFileURL(copieExemple).href}?v=${Date.now()}`);
await rm(TMP, { recursive: true, force: true });

const dateIso = ex.DATE_CAPTURES;
if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) throw new Error(`extraire-donnees : DATE_CAPTURES illisible (${dateIso})`);
const dateExemple = new Date(`${dateIso}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
// Versement de l'exemple (« 300 € à verser » dans la légende de la fiche) et
// répartition qui en sort : la capture du plan P3 montre 300,00 € et 14 parts
// d'ETZ, rien pour les deux autres ; l'anneau entoure la ligne d'ETZ.
const versementEx = Number(trouver(products, /exemple pré-rempli \(achats fictifs, cours réels\) : (\d+) € à verser/, "versement de l'exemple (légende de la fiche)"));
const repartition = ex.versementExemple(versementEx).lignes;
const achetes = repartition.filter((l) => l.parts > 0);
if (achetes.length !== 1 || achetes[0].ticker !== "ETZ" || achetes[0].parts !== 14 || repartition.findIndex((l) => l.ticker === "ETZ") !== 1) {
  throw new Error(
    `extraire-donnees : le versement de l'exemple ne donne plus « 14 parts d'ETZ, 2e ligne » (${repartition.map((l) => `${l.ticker} ${l.parts}`).join(", ")}) : refaire les captures et les zones de la boucle du Cockpit`
  );
}
if (!products.includes(`le tableau propose ${achetes[0].parts} parts d'${achetes[0].ticker}`)) {
  throw new Error("extraire-donnees : la légende de la fiche ne recoupe plus le versement de l'exemple");
}
// Plan P2 : l'anneau entoure l'écart d'ETZ (2e ligne), seul ETF sous sa cible.
const lignesEx = ex.lignesExemple();
const ecartPct = (l) => (l.ecart * 100).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "always" });
const sousCible = lignesEx.filter((l) => l.ecart < 0);
if (sousCible.length !== 1 || sousCible[0].ticker !== "ETZ" || ecartPct(sousCible[0]) !== "-6,7") {
  throw new Error(`extraire-donnees : l'exemple n'a plus ETZ seul sous sa cible à -6,7 % (${lignesEx.map((l) => `${l.ticker} ${ecartPct(l)}`).join(", ")}) : revoir le plan P2`);
}
// Plan P5 : la date du cap des 5 ans (elle ne dépend pas du jour d'ouverture du fichier).
const cap = ex.cinqAnsExemple();
const capAffiche = cap.split("-").reverse().join("/");
if (capAffiche !== "15/01/2029") throw new Error(`extraire-donnees : cap des 5 ans de l'exemple = ${capAffiche} : revoir le plan P5`);

// Les captures du classeur de la vidéo sont-elles celles du site ? Si l'exemple
// est régénéré (public/produits/), le rendu s'arrête au lieu de montrer l'ancien.
const empreinte = async (f) => createHash("sha256").update(await readFile(f)).digest("hex");
for (const nom of ["cockpit-v2-dashboard.png", "cockpit-v2-pea.png", "cockpit-v2-versement.png"]) {
  const video = await empreinte(path.join(VIDEO, "public/captures/classeur", nom));
  const site = await empreinte(path.join(SITE, "public/produits", nom));
  if (video !== site) {
    throw new Error(`extraire-donnees : public/captures/classeur/${nom} n'est plus la capture du site (public/produits/${nom}) : relancer npm run captures, puis revoir zones-cockpit.ts`);
  }
}
// La fenêtre « Versement du mois » (P3) est une capture de la page produit,
// prise par npm run captures : elle doit dater d'après l'exemple aux cours du
// DATE_CAPTURES.
if (textesLusLe.slice(0, 10) < dateIso) {
  throw new Error(`extraire-donnees : captures du site du ${textesLusLe.slice(0, 10)}, antérieures à l'exemple du ${dateIso} : relancer npm run captures`);
}
// …et c'est l'AFFICHE (seule image à montrer « 300,00 € → 14 »), mais elle
// n'est pas versionnée et ne peut pas être comparée octet par octet au PNG du
// site (c'est une capture de la page, à une autre échelle). Elle a été relue à
// l'œil le 04/10/2026 (300,00 € ; ETZ 14 ; 291,76 € ; reliquat 8,24 €, qui
// recoupent versementExemple()), alors que public/produits/cockpit-v2-versement.png
// avait l'empreinte ci-dessous. Si l'une des deux empreintes change (nouvelle
// capture, nouvel exemple), le rendu s'arrête : relire la capture, puis
// remplacer les empreintes.
const AFFICHE_RELUE = {
  capture: "4181c9d3ab6c7f34b87e06720593be4351a030bf9f4c0284e32d55af67cdd872",
  versementDuSite: "b562816bba755b0b6a3993aa4a90571211d21d1bccca5ed1ce2e1910d1b86c24",
};
{
  const capture = await empreinte(path.join(VIDEO, "public/captures/cockpit-bureau-fenetre-versement.png"));
  const site = await empreinte(path.join(SITE, "public/produits/cockpit-v2-versement.png"));
  if (capture !== AFFICHE_RELUE.capture || site !== AFFICHE_RELUE.versementDuSite) {
    throw new Error(
      "extraire-donnees : la capture de l'affiche de la boucle du Cockpit (cockpit-bureau-fenetre-versement.png) ou le PNG du versement du site a changé depuis la relecture du 04/10 : " +
        "relire la capture (montant, parts, reliquat contre cockpit-exemple.ts), puis mettre à jour AFFICHE_RELUE"
    );
  }
}

// ─── Boucle du modèle gratuit (BoucleModeleGratuit, STORYBOARD-MODELE-GRATUIT.md §5) ─
// Tout ce que la boucle du modèle gratuit écrit ou montre est relu ici, dans
// la page /suivi-pea-excel, le formulaire, l'email, la route de
// téléchargement et l'exemple du site. Arrêt au moindre écart : la vidéo ne
// doit jamais dire ce que la page ne dit plus, ni montrer un ancien exemple.
//
// Le JSX est mis à plat pour la lecture : entités (&apos; &nbsp;), {" "} et
// retours à la ligne ramenés à du texte simple.
const aplatirJsx = (s) =>
  s
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\{" "\}/g, " ")
    .replace(/[  ]/g, " ")
    .replace(/\s+/g, " ");
const pageModele = aplatirJsx(await lire("src/app/suivi-pea-excel/page.tsx"));
const formModele = aplatirJsx(await lire("src/components/ressources/ModeleGratuitForm.tsx"));
const emailModele = aplatirJsx(await lire("src/lib/emails/modele-gratuit.ts"));
const ressources = await lire("src/lib/ressources-gratuites.ts");
const routeTelechargement = await lire("src/app/api/products/download/route.ts");

// 1. La copie Google Sheets existe. Si MODELE_GRATUIT_SHEETS_COPIE passe à
//    null, la page et l'email ne parlent plus de Sheets : la pastille, le
//    plan P4 et la fin deviendraient faux.
if (!/export const MODELE_GRATUIT_SHEETS_COPIE: string \| null =\s*"https:\/\/docs\.google\.com\/spreadsheets\/[^"]+\/copy";/.test(ressources)) {
  throw new Error(
    "extraire-donnees : MODELE_GRATUIT_SHEETS_COPIE n'est plus un lien de copie Google Sheets (ressources-gratuites.ts) : la boucle du modèle gratuit (pastille, P4, fin) dit « Excel + Google Sheets », elle ne doit plus être rendue ni affichée"
  );
}

// 2. Phrases de la page, du formulaire et de l'email que la boucle reprend
//    ou résume. Si l'une disparaît, le plan correspondant est à revoir.
for (const [texte, ou, phrase, plan] of [
  [pageModele, "page.tsx", "ce que chaque part vous a réellement coûté", "P1, question"],
  [pageModele, "page.tsx", "le PRU inclut les frais de courtage", "P1, sous-titre « Frais de courtage compris »"],
  [pageModele, "page.tsx", "Une ligne par achat : la date, le ticker de l'ETF, le nombre de parts, le prix unitaire et les frais", "P2, titre et sous-titre"],
  [pageModele, "page.tsx", "Le journal des achats et la vue par ETF (PRU frais inclus,", "P3, réponse « la part, frais compris »"],
  [pageModele, "page.tsx", "Le PRU est le total investi divisé par les parts", "P3, colonnes Parts détenues, Total investi et PRU"],
  [pageModele, "page.tsx", 'soit un PRU de <strong className="text-gray-900">{eur(PE500.pru)}</strong>, frais compris', "P3, réponse « → 44,40 € la part, frais compris »"],
  [pageModele, "page.tsx", "const PE500 = LIGNES[0];", "P3, réponse (le PRU de la page est celui de la 1re ligne de l'exemple)"],
  [pageModele, "page.tsx", "L'onglet Par ETF (Cockpit et modèle gratuit)", "P3, capture Par ETF du Cockpit montrée comme celle du modèle gratuit"],
  [pageModele, "page.tsx", 'const CAPTURE_PAR_ETF = capture("cockpit-v2-par-etf.png");', "P3, capture"],
  [pageModele, "page.tsx", "Achats fictifs ; cours : clôtures du", "P2 et P3, mentions"],
  [pageModele, "page.tsx", "Suivre votre PEA dans Excel ou Google Sheets", "P3 et P4, titres"],
  [pageModele, "page.tsx", "Les formules du suivi sont les mêmes dans les deux", "P4, sous-titre « Les mêmes formules de suivi dans les deux »"],
  [pageModele, "page.tsx", "Dans un fichier, sur votre ordinateur", "P4, carte Excel"],
  [pageModele, "page.tsx", "Dans votre Google Drive", "P4, carte Google Sheets"],
  [pageModele, "page.tsx", "Saisis à la main dans nos fichiers", "P4, carte « Fichier Excel », « Ses cours, saisis à la main »"],
  [pageModele, "page.tsx", "mais nos formules n'en dépendent pas", "P4, carte « Fichier Excel » (la vidéo parle de NOS fichiers, pas d'Excel)"],
  [pageModele, "page.tsx", "Automatiques avec GOOGLEFINANCE, différés de 20 min au plus", "P4, mention « différés de 20 min au plus »"],
  [pageModele, "page.tsx", "tant que la colonne du cours manuel reste vide", "P4, mention des cours automatiques"],
  [pageModele, "page.tsx", "GOOGLEFINANCE", "P4, mention des cours automatiques"],
  [pageModele, "page.tsx", "le journal et la vue par ETF du Cockpit, avec son mode d'emploi", "P5, « avec son mode d'emploi »"],
  [pageModele, "page.tsx", "un modèle gratuit à recevoir par email", "P3 et P5, « Modèle gratuit », « Gratuit · reçu par email »"],
  [formModele, "ModeleGratuitForm.tsx", '{MODELE_GRATUIT_SHEETS_COPIE ? "Fichier Excel et copie Google Sheets" : "Fichier Excel"}, par email.', "P3 et P5, « Excel + Google Sheets », « reçu par email »"],
  [emailModele, "emails/modele-gratuit.ts", "tant que la colonne « Cours manuel » reste vide", "P4, mention « « Cours manuel » reste vide »"],
  [emailModele, "emails/modele-gratuit.ts", "Votre modèle de suivi PEA", "P5, titre « Modèle de suivi PEA »"],
]) {
  if (!texte.includes(phrase)) throw new Error(`extraire-donnees : « ${phrase} » absent de ${ou} — ${plan} de la boucle du modèle gratuit à revoir`);
}
// Nom du fichier livré (barre de fenêtre des plans P2 et P3).
const fichierModele = trouver(
  routeTelechargement,
  /"modele-gratuit-xlsx": \{[^}]*?downloadName: "([^"]+\.xlsx)"/,
  "downloadName du modèle gratuit (api/products/download/route.ts)"
);

// 3. Les captures de la vidéo sont-elles celles du site, et celles relues ?
//    Les lignes du journal et les valeurs de Par ETF ont été lues à l'œil le
//    04/10/2026 sur les captures dont voici les empreintes, puis comparées à
//    l'exemple recalculé ci-dessous. Si une capture change (nouvel exemple),
//    le rendu s'arrête : relire la capture, puis mettre à jour CAPTURES_RELUES
//    et LU_SUR_LES_CAPTURES.
const CAPTURES_RELUES = {
  "modele/modele-suivi-pea-transactions.png": {
    site: "public/ressources/modele-suivi-pea-transactions.png",
    sha256: "7af4c06d7a1398f72e5a19e83d85ad0fa91aa8c6753f81860bc09a903be57326",
  },
  "classeur/cockpit-v2-par-etf.png": {
    site: "public/produits/cockpit-v2-par-etf.png",
    sha256: "72e3c796f7ad91ac7fb283eaeeb6df9d0b224fde150b5f7ce428e30cff50b483",
  },
};
for (const [nom, { site, sha256 }] of Object.entries(CAPTURES_RELUES)) {
  const video = await empreinte(path.join(VIDEO, "public/captures", nom));
  const surLeSite = await empreinte(path.join(SITE, site));
  if (video !== surLeSite) {
    throw new Error(`extraire-donnees : public/captures/${nom} n'est plus la capture du site (${site}) : la recopier, la relire, puis revoir zones-modele-gratuit.ts`);
  }
  if (video !== sha256) {
    throw new Error(`extraire-donnees : ${site} a changé depuis la relecture du 04/10 : relire la capture (lignes du journal, valeurs de Par ETF), puis mettre à jour CAPTURES_RELUES`);
  }
}

// 4. L'exemple recalculé par le code du site (même module que pour le
//    Cockpit) : ce que montrent les pixels doit en sortir.
const LU_SUR_LES_CAPTURES = {
  // Les sept lignes gardées du journal (P2) : date, ticker, parts, prix, frais.
  journal: [
    "15/01/2024 PE500 4 35,70 1,99",
    "15/01/2024 ETZ 4 14,53 1,99",
    "15/01/2024 PAEEM 2 20,23 1,99",
    "15/02/2024 PE500 4 37,92 1,99",
    "15/02/2024 ETZ 4 14,98 1,99",
    "15/02/2024 PAEEM 2 20,81 1,99",
    "15/03/2024 PE500 4 38,27 1,99",
  ],
  // Par ETF (P3) : ticker, parts détenues, total investi, PRU (colonnes
  // montrées depuis la relecture du 04/10 ; Valeur actuelle est coupée).
  parEtf: ["PE500 101 4 484,17 44,40", "ETZ 116 2 056,70 17,73", "PAEEM 60 1 566,34 26,11"],
};
const deuxDecimales = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, " ");
const journalCalcule = ex.ACHATS_EXEMPLE.slice(0, 7).map(
  ([date, ticker, parts, prix, frais]) => `${date.split("-").reverse().join("/")} ${ticker} ${parts} ${deuxDecimales(prix)} ${deuxDecimales(frais)}`
);
const parEtfCalcule = lignesEx.map((l) => `${l.ticker} ${l.parts} ${deuxDecimales(l.investi)} ${deuxDecimales(l.pru)}`);
for (const [quoi, lu, calcule] of [
  ["journal (P2)", LU_SUR_LES_CAPTURES.journal, journalCalcule],
  ["Par ETF (P3)", LU_SUR_LES_CAPTURES.parEtf, parEtfCalcule],
]) {
  if (lu.join(" | ") !== calcule.join(" | ")) {
    throw new Error(`extraire-donnees : l'exemple du site ne donne plus ce que montre la capture du ${quoi} :\n  capture : ${lu.join(" | ")}\n  calcul  : ${calcule.join(" | ")}`);
  }
}
const pe500 = lignesEx[0];
if (pe500.ticker !== "PE500") throw new Error(`extraire-donnees : la 1re ligne de l'exemple n'est plus PE500 (${pe500.ticker}) : l'anneau et la réponse de l'affiche du modèle gratuit sont à revoir`);

// 5. Le fichier réellement envoyé aux inscrits. La boucle dit « extrait du
//    fichier » : le 04/10/2026, le modèle livré (clair de l'.enc ci-dessous)
//    a été relu et donne exactement les lignes du journal et les valeurs de
//    Par ETF ci-dessus (Transactions!A9:E15, Par ETF!H9:J11). Le modèle
//    gratuit se reconstruit à part (construire_modele_gratuit.py) : s'il
//    change, la vidéo pourrait montrer un exemple qu'il ne contient plus.
const MODELE_LIVRE_RELU = {
  fichier: "private-assets/modele-suivi-pea-gratuit.enc",
  sha256: "8d2d6c0fc5e5da42e48cae3d9a7623daeac46bc7c136b0116260583d09ae9623",
};
if ((await empreinte(path.join(SITE, MODELE_LIVRE_RELU.fichier))) !== MODELE_LIVRE_RELU.sha256) {
  throw new Error(
    `extraire-donnees : le modèle gratuit livré (${MODELE_LIVRE_RELU.fichier}) a changé depuis la relecture du 04/10 : relire Transactions!A9:E15 et Par ETF!H9:J11 du fichier déchiffré contre LU_SUR_LES_CAPTURES, puis mettre à jour MODELE_LIVRE_RELU.sha256`
  );
}

// ─── Musique (optionnelle) ───────────────────────────────────────────────────
// Nom du fichier de public/ que la bande-son charge (src/son/BandeSon.tsx), ou
// false. Le WAV (rendu de musique/composer.py, sans perte) passe en premier ;
// un MP3 fourni à la main reste accepté en second choix.
let musique = false;
for (const nom of ["musique.wav", "musique.mp3"]) {
  try {
    await access(path.join(VIDEO, "public", nom));
    musique = nom;
    break;
  } catch {}
}

// ─── Formats d'affichage (comme le site : espace fine insécable U+202F pour
// les milliers, espace insécable U+00A0 avant € et %) ────────────────────────
const NNBSP = " ";
const NBSP = " ";
const milliers = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
const euros = (n) => {
  const s = Number.isInteger(n) ? milliers(n) : n.toFixed(2).replace(".", ",");
  return `${s}${NBSP}€`;
};

const donnees = {
  _avertissement: "Fichier généré par scripts/extraire-donnees.mjs : ne pas modifier à la main.",
  genere_le: new Date().toISOString(),
  textes_lus_le: textesLusLe,
  musique,
  pastilleAccueil: pastille,
  simulateur: {
    versementMensuel,
    dureeAns,
    hypothese,
    valeurFinale,
    capitalVerse,
    mention: mentionSimu,
    fraisDefaut: `${fraisDefaut}${NBSP}%`,
    // ETF dont le TER sert de frais par défaut au simulateur (« Frais de l'ETF CW8
    // (0,38 %/an) déduits » dans la boucle : sans le nom, on prenait ces frais
    // pour ceux de la carte WPEA montrée juste après, TER 0,20 %).
    etfFrais: symboleFrais,
    tauxScenarios,
    valeursScenarios,
  },
  comparateur: { nbEtf: nbEtfComparateur, nbEtfFiltrePea },
  listePea: { nbEtf: nbEtfPea, dateVerif },
  fiscal: { tauxPea: tauxPea.replace(" %", NBSP + "%"), tauxCto: tauxCto.replace(" %", NBSP + "%") },
  cockpit: { prix: cockpitPrix },
  // Boucle du Cockpit (BoucleCockpit). `exemple` ne s'affiche pas en texte (les
  // chiffres de la vidéo sont les pixels des captures) : il prouve que ces
  // pixels sont ceux de l'exemple du site, et sert au texte alternatif.
  cockpitBoucle: {
    titre: cockpitTitre,
    complement: complementLignes,
    pastille: `${euros(cockpitPrix)} · paiement unique`,
    sousTitrePea: pea.charAt(0).toUpperCase() + pea.slice(1),
    dateExemple,
    exemple: {
      date: dateIso,
      versement: euros(versementEx),
      etf: achetes[0].ticker,
      parts: achetes[0].parts,
      // Pour le texte alternatif : 14 parts ne font pas 300 € (le fichier
      // affiche le montant arrondi et le reliquat, que la vidéo coupe).
      montantArrondi: euros(Math.round(achetes[0].arrondi * 100) / 100),
      reliquat: euros(Math.round((versementEx - repartition.reduce((s, l) => s + l.arrondi, 0)) * 100) / 100),
      ecart: `${ecartPct(sousCible[0])}${NBSP}%`,
      cap5ans: capAffiche,
    },
  },
  // Boucle du modèle gratuit (BoucleModeleGratuit). Comme pour le Cockpit, les
  // chiffres de l'exemple sont les pixels des captures ; `exemple` prouve
  // qu'ils sortent de l'exemple du site et sert au texte alternatif.
  modeleBoucle: {
    fichier: fichierModele,
    dateExemple,
    sheets: true,
    exemple: {
      date: dateIso,
      tickers: lignesEx.map((l) => l.ticker),
      premierAchat: journalCalcule[0],
      pruPe500: euros(Math.round(pe500.pru * 100) / 100),
    },
  },
  premium: { mensuel: premiumMensuel, annuel: premiumAnnuel, essaiJours: premiumEssai },
  affichage: {
    valeurFinale: euros(valeurFinale),
    capitalVerse: euros(capitalVerse),
    versementMensuel: `${milliers(versementMensuel)}${NBSP}€/mois`,
    cockpitPrix: euros(cockpitPrix),
    premiumMensuel: `${euros(premiumMensuel)}/mois`,
    premiumAnnuel: `${euros(premiumAnnuel)}/an`,
  },
};

await writeFile(path.join(VIDEO, "src/donnees.json"), JSON.stringify(donnees, null, 2) + "\n");
console.log(
  `✓ src/donnees.json — ${donnees.affichage.valeurFinale} (${versementMensuel} €/mois, ${dureeAns} ans, ${hypothese} %), ` +
    `${nbEtfComparateur} ETF (${nbEtfFiltrePea} avec PEA), ${nbEtfPea} ETF PEA vérifiés le ${dateVerif}, ` +
    `Cockpit ${cockpitPrix} € (exemple du ${dateExemple} : ${versementEx} € → ${achetes[0].parts} ${achetes[0].ticker}), Premium ${premiumMensuel} €/mois ou ${premiumAnnuel} €/an (${premiumEssai} j), modèle gratuit (${fichierModele}, PRU PE500 ${donnees.modeleBoucle.exemple.pruPe500}), musique : ${musique || "aucune"}`
);
