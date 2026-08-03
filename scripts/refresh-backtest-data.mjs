#!/usr/bin/env node
// Refresh des DEUX séries MSCI World en euros : la publiée et son contrôle.
//
// Pourquoi ce script : src/data/msci-world-eur.json est un snapshot statique.
// Sans refresh, il se périme (il manque les mois récents). Une fonction
// serverless Vercel ne peut PAS réécrire un fichier commité (FS read-only),
// donc le refresh se fait via une GitHub Action mensuelle qui exécute ce
// script puis commit le fichier s'il a changé.
//
// Usage :
//   node scripts/refresh-backtest-data.mjs
//
// Sortie :
//   - Réécrit chaque fichier UNIQUEMENT si sa série `data` a changé (évite les
//     commits inutiles dus au seul champ fetched_at).
//   - Exit 0 si OK (changé ou non), exit 1 si erreur (CI doit échouer fort
//     plutôt que committer des données corrompues).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

/**
 * LES DEUX SÉRIES, rafraîchies ensemble.
 *
 * ─── Pourquoi deux, et pourquoi le même script ─────────────────────────────
 *
 * La série publiée est validée par une série de CONTRÔLE issue d'un autre
 * émetteur, d'une autre méthode de réplication et d'une autre place : c'est ce
 * qui en fait une référence non dérivée, et c'est ce qui a permis de détecter
 * deux fois un décalage d'un mois par corrélation croisée.
 *
 * Or la série de contrôle était construite À LA MAIN et n'était rafraîchie par
 * rien. Elle se serait périmée en silence : chaque mois, un mois de plus dans
 * la série publiée sans contrepartie dans la série de contrôle, donc un
 * recouvrement qui rétrécit et un contrôle qui s'affaiblit sans prévenir.
 * Un garde-fou qui se dégrade tout seul est pire qu'un garde-fou absent — on
 * croit être couvert.
 *
 * ─── Pourquoi XMWO est la série publiée depuis le 04/08/2026 ───────────────
 *
 * Elle commence en février 2008 contre octobre 2009 pour IWDA : elle contient
 * la crise de 2008 ENTIÈRE. C'est la seule période qui permette de répondre à
 * la question que les lecteurs se posent réellement — « et si j'avais commencé
 * juste avant le krach » — et sans elle, une pièce éditoriale qui annonce un
 * calcul depuis 2008 renverrait vers un outil incapable de le refaire.
 *
 * Le coût est déclaré, pas dissimulé : réplication synthétique par swap et TER
 * de 0,45 %/an contre 0,20 % pour IWDA. Une fois le décalage corrigé, les deux
 * séries concordent à 0,12 point par an, dans le sens qu'impose cet écart de
 * frais. Et ce TER pèse identiquement sur les deux stratégies comparées dans
 * un backtest DCA : il ne change aucun classement.
 */
const SERIES = [
  {
    role: "publiée",
    symbol: "XMWO.MI",
    start: "2008-01-01",
    fichier: "msci-world-eur.json",
    minPoints: 200,
    source:
      "XMWO.MI — Xtrackers MSCI World Swap UCITS ETF 1C (LU0274208692), coté en EUR sur Borsa Italiana",
    description:
      "Cours mensuel de clôture (dernier jour de bourse du mois) en EUR. Série de référence des backtests publiés : elle couvre la crise de 2008, contrairement à IWDA qui ne commence qu'en octobre 2009.",
    source_url: "https://finance.yahoo.com/quote/XMWO.MI/history",
    notes:
      "Données publiques (cours de marché). ⚠️ Le cours d'un ETF est DÉJÀ net de ses frais de gestion (TER 0,45 %/an) : ils sont prélevés en continu sur l'actif, il ne faut donc pas les retrancher une seconde fois dans un calcul. Ne tient pas compte des frais de courtage ni de la fiscalité. Réplication synthétique (swap), encadrée par UCITS. Performances passées non garantes des performances futures.",
  },
  {
    role: "contrôle",
    symbol: "IWDA.AS",
    start: "2009-08-01",
    fichier: "msci-world-eur-controle.json",
    minPoints: 180,
    source:
      "IWDA.AS — iShares Core MSCI World UCITS ETF (USD Acc), coté EUR sur Euronext Amsterdam",
    description:
      "SÉRIE DE CONTRÔLE. Sert à valider la série publiée par corrélation croisée, PAS à alimenter les backtests. Émetteur, méthode de réplication (physique) et place de cotation différents : c'est ce qui en fait une référence non dérivée.",
    source_url: "https://finance.yahoo.com/quote/IWDA.AS/history",
    notes:
      "Données publiques (cours de marché), déjà nettes du TER de l'ETF (0,20 %/an). Ne pas utiliser pour un chiffre publié : cette série existe pour contredire l'autre, pas pour la remplacer.",
  },
];

function fail(msg) {
  console.error(`[refresh-backtest] ERREUR : ${msg}`);
  process.exit(1);
}

async function fetchSerie({ role, symbol, start, fichier, minPoints, source, description, source_url, notes }) {
  const OUT_PATH = join(DATA_DIR, fichier);
  const SYMBOL = symbol;
  const START = start;
  const period1 = Math.floor(new Date(START + "T00:00:00Z").getTime() / 1000);
  const period2 = Math.floor(Date.now() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${SYMBOL}?period1=${period1}&period2=${period2}&interval=1mo`;

  console.log(`[refresh-backtest] Fetch ${SYMBOL} (${START} → now)…`);

  let json;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; dcatracker-data-refresh/1.0)" },
    });
    if (!res.ok) fail(`HTTP ${res.status} depuis Yahoo`);
    json = await res.json();
  } catch (e) {
    fail(`fetch a échoué : ${e?.message ?? e}`);
  }

  const result = json?.chart?.result?.[0];
  if (!result) fail("structure inattendue : chart.result[0] absent");

  const ts = result.timestamp;
  const closes = result.indicators?.quote?.[0]?.close;
  const currency = result.meta?.currency;

  if (!Array.isArray(ts) || !Array.isArray(closes) || ts.length !== closes.length) {
    fail("timestamps/closes manquants ou de longueurs différentes");
  }
  if (currency !== "EUR") {
    fail(`devise inattendue : ${currency} (attendu EUR). L'ETF a peut-être changé de cotation.`);
  }

  // ─── Étiquetage des mois : LE PIÈGE DE CE SCRIPT ──────────────────────────
  //
  // Yahoo renvoie, pour chaque barre mensuelle, un horodatage de DÉBUT DE
  // PÉRIODE exprimé à l'heure de la PLACE DE COTATION (ici Europe/Amsterdam,
  // gmtoffset = +7200 s en été). Le 1er du mois à 00:00 heure locale vaut
  // 22:00 la veille en temps universel : lire ce timestamp avec
  // `getUTCMonth()` le recule d'un jour et le fait basculer dans le mois
  // PRÉCÉDENT. Toute la série se décale d'un cran.
  //
  // C'est le défaut du 29/07/2026 : le krach Covid apparaissait en février
  // 2020 et un rebond de +9,5 % en mars. Le fichier de données avait été
  // reconstruit à la main — mais PAS ce script, qui l'a donc re-cassé au
  // rafraîchissement suivant. Corriger le cas et pas la cause : la série est
  // repartie fausse en production le 2 août, quatre jours après le correctif
  // annoncé publiquement au journal des changements.
  //
  // On applique donc le décalage de la place, fourni par l'API elle-même.
  // Si `gmtoffset` manque, on échoue plutôt que de deviner : produire une
  // série silencieusement décalée coûte infiniment plus cher qu'un cron rouge.
  const gmtoffset = result.meta?.gmtoffset;
  if (typeof gmtoffset !== "number") {
    fail(
      "meta.gmtoffset absent — impossible d'étiqueter les mois de façon sûre. " +
        "Ne pas deviner : c'est exactement ce qui a produit le décalage du 29/07/2026."
    );
  }

  const byMonth = new Map();
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (c === null || c === undefined || !(c > 0)) continue;
    // On ramène l'horodatage à l'heure de la place AVANT d'en lire le mois.
    const d = new Date((ts[i] + gmtoffset) * 1000);
    const month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    byMonth.set(month, Number(c.toFixed(4))); // le dernier point d'un mois écrase (close le plus récent)
  }

  const data = [...byMonth.entries()]
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // ─── Le mois en cours est INCOMPLET : on le retire ────────────────────────
  //
  // Le cron tourne le 2 de chaque mois. Sans ce filtre, la série se termine
  // par un « mois » de un ou deux jours de bourse, présenté au même titre que
  // les 200 autres : un backtest le traiterait comme un mois plein et un
  // versement mensuel s'y ferait au prix du 1er. C'est une valeur fausse, pas
  // une valeur manquante — et la seconde est toujours préférable.
  //
  // Le mois de référence est celui de la place, pas celui du serveur : un
  // runner en UTC le 1er du mois à 00h30 doit voir le même mois qu'un lecteur
  // à Paris. Même principe que l'étiquetage ci-dessus, même piège.
  const maintenant = new Date(Date.now() + gmtoffset * 1000);
  const moisCourant = `${maintenant.getUTCFullYear()}-${String(
    maintenant.getUTCMonth() + 1
  ).padStart(2, "0")}`;
  const retire = data.length && data[data.length - 1].month === moisCourant;
  if (retire) data.pop();

  // Garde-fou : on refuse d'écrire si la série est anormalement courte
  // (signe d'une réponse Yahoo dégradée). Mieux vaut garder l'ancien fichier.
  if (data.length < minPoints) {
    fail(`${symbol} : série trop courte (${data.length} points, attendu ≥ ${minPoints}). On garde l'ancien fichier.`);
  }

  // Compare à l'existant : on ne réécrit QUE si la série `data` a changé
  // (sinon on créerait un commit inutile juste à cause de fetched_at).
  if (existsSync(OUT_PATH)) {
    try {
      const prev = JSON.parse(readFileSync(OUT_PATH, "utf-8"));
      if (JSON.stringify(prev.data) === JSON.stringify(data)) {
        console.log(`[refresh-backtest] ${symbol} (${role}) : aucun changement (${data.length} points).`);
        return false;
      }
    } catch {
      // fichier illisible → on régénère
    }
  }

  const output = {
    source,
    role,
    description,
    currency: "EUR",
    source_url,
    fetched_at: new Date().toISOString().slice(0, 10),
    notes,
    data,
  };

  writeFileSync(OUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf-8");
  console.log(
    `[refresh-backtest] ${symbol} (${role}) : écrit ${data.length} points (${data[0].month} → ${data[data.length - 1].month}).`
  );
  return true;
}

async function main() {
  let modifie = 0;
  for (const serie of SERIES) {
    if (await fetchSerie(serie)) modifie++;
  }
  console.log(
    modifie === 0
      ? "[refresh-backtest] Les deux séries sont à jour."
      : `[refresh-backtest] ${modifie} série(s) réécrite(s).`
  );
  // ⚠️ Le script s'arrête ici SANS valider. La validation appartient au
  // workflow, qui doit exécuter verifier-serie-backtest.mjs AVANT de committer :
  // un script qui se valide lui-même à la fin de sa propre exécution est juge
  // et partie, et c'est ce qui a laissé passer le décalage du 2 août.
}

main();
