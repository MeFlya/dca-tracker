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

import { readFile, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
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
    `Cockpit ${cockpitPrix} €, Premium ${premiumMensuel} €/mois ou ${premiumAnnuel} €/an (${premiumEssai} j), musique : ${musique || "aucune"}`
);
