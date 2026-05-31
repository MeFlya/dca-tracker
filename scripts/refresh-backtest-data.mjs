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

  // Normalise au mois (YYYY-MM) ; valeur = close de fin de mois ; filtre les nulls.
  const byMonth = new Map();
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (c === null || c === undefined || !(c > 0)) continue;
    const d = new Date(ts[i] * 1000);
    const month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    byMonth.set(month, Number(c.toFixed(4))); // le dernier point d'un mois écrase (close le plus récent)
  }

  const data = [...byMonth.entries()]
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => a.month.localeCompare(b.month));

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
