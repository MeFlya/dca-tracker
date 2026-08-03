#!/usr/bin/env node
// Refresh des données de backtest MSCI World (proxy IWDA.AS EUR).
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
//   - Réécrit src/data/msci-world-eur.json UNIQUEMENT si la série `data` a
//     changé (évite les commits inutiles dus au seul champ fetched_at).
//   - Exit 0 si OK (changé ou non), exit 1 si erreur (CI doit échouer fort
//     plutôt que committer des données corrompues).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "src", "data", "msci-world-eur.json");

const SYMBOL = "IWDA.AS"; // iShares Core MSCI World UCITS ETF, Euronext Amsterdam, coté EUR
const START = "2009-08-01"; // ~ firstTradeDate de l'ETF

function fail(msg) {
  console.error(`[refresh-backtest] ERREUR : ${msg}`);
  process.exit(1);
}

async function main() {
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
  if (data.length < 180) {
    fail(`série trop courte (${data.length} points, attendu ≥ 180). On garde l'ancien fichier.`);
  }

  // Compare à l'existant : on ne réécrit QUE si la série `data` a changé
  // (sinon on créerait un commit inutile juste à cause de fetched_at).
  if (existsSync(OUT_PATH)) {
    try {
      const prev = JSON.parse(readFileSync(OUT_PATH, "utf-8"));
      if (JSON.stringify(prev.data) === JSON.stringify(data)) {
        console.log(`[refresh-backtest] Aucun changement (${data.length} points). Fichier inchangé.`);
        process.exit(0);
      }
    } catch {
      // fichier illisible → on régénère
    }
  }

  const output = {
    source:
      "IWDA.AS — iShares Core MSCI World UCITS ETF (USD Acc), coté EUR sur Euronext Amsterdam",
    description:
      "Cours mensuel de clôture (dernier jour de bourse du mois) en EUR. Utilisé comme proxy de l'indice MSCI World pour backtests DCA.",
    currency: "EUR",
    source_url: "https://finance.yahoo.com/quote/IWDA.AS/history",
    fetched_at: new Date().toISOString().slice(0, 10),
    notes:
      "Données publiques (quotes de marché). Ne tient pas compte du TER de l'ETF (~0,20 %), ni des frais de courtage, ni de la fiscalité. Performances passées non garantes des performances futures.",
    data,
  };

  writeFileSync(OUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf-8");
  console.log(
    `[refresh-backtest] Écrit ${data.length} points (${data[0].month} → ${data[data.length - 1].month}).`,
  );
}

main();
