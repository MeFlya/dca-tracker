#!/usr/bin/env tsx
/**
 * Twelve Data coverage audit — one-shot script.
 *
 * For each ETF in ETF_LIST, queries Twelve Data's /symbol_search endpoint
 * with the ISIN first (more precise), falls back to the ticker if no
 * match. Prints a table with all matching exchanges and a recommendation
 * for the most liquid / preferred symbol to use in the provider.
 *
 * Usage:
 *   export TWELVE_DATA_API_KEY=your_key
 *   npx tsx scripts/audit-twelve-data.ts
 *
 * Rate limit: Twelve Data free tier = 8 req/min. We sleep 8s between
 * calls → ~130s total for 16 ETFs. --fast flag reduces to 2s (for paid
 * plans with 55+ req/min).
 */

import { ETF_LIST } from "../src/lib/etf-config";

// ── ANSI colors (no deps) ─────────────────────────────────────────────
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";

// ── Config ────────────────────────────────────────────────────────────
const API_KEY = process.env.TWELVE_DATA_API_KEY;
const FAST_MODE = process.argv.includes("--fast");
const SLEEP_MS = FAST_MODE ? 2_000 : 8_000;
const BASE_URL = "https://api.twelvedata.com";

// Exchanges we prefer when multiple matches are returned. Higher priority
// means "more likely to be the liquid primary listing for a FR investor".
const EXCHANGE_PREFERENCE: Record<string, number> = {
  Euronext: 100,           // Paris listings (.PA)
  "Euronext Paris": 100,
  XETRA: 95,               // German listings (.DE)
  LSE: 90,                 // London (.L)
  "London Stock Exchange": 90,
  "Euronext Amsterdam": 85, // (.AS)
  Amsterdam: 85,
  "Borsa Italiana": 70,    // (.MI)
  NASDAQ: 60,              // US (for non-UCITS SPY/QQQ/etc.)
  NYSE: 60,
  "NYSE Arca": 60,
  SIX: 50,                 // Swiss
  "SIX Swiss Exchange": 50,
};

// ── Types ─────────────────────────────────────────────────────────────
interface SymbolSearchResult {
  symbol: string;
  instrument_name: string;
  exchange: string;
  mic_code?: string;
  country?: string;
  currency?: string;
  instrument_type?: string;
}

interface AuditRow {
  displaySymbol: string;
  name: string;
  isin: string | undefined;
  internalTicker: string;
  searchedBy: "ISIN" | "TICKER" | "BOTH_FAILED";
  matches: SymbolSearchResult[];
  recommendation: string | null;
  recommendationReason: string;
}

// ── Helpers ───────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function symbolSearch(
  query: string
): Promise<{ ok: boolean; matches: SymbolSearchResult[]; error?: string }> {
  const url = `${BASE_URL}/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { ok: false, matches: [], error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      data?: SymbolSearchResult[];
      code?: number;
      message?: string;
      status?: string;
    };
    if (data.code && data.code >= 400) {
      return { ok: false, matches: [], error: data.message ?? `code ${data.code}` };
    }
    return { ok: true, matches: data.data ?? [] };
  } catch (err) {
    return { ok: false, matches: [], error: String(err) };
  }
}

/** Strip exchange suffix (.PA, .DE, .L, .AS) from internal ticker. */
function baseTicker(symbol: string): string {
  return symbol.split(".")[0];
}

/** Score a match — higher is better. */
function scoreMatch(m: SymbolSearchResult, internalTicker: string): number {
  let score = 0;
  // Exact ticker match = strong signal
  if (m.symbol.toLowerCase() === baseTicker(internalTicker).toLowerCase()) {
    score += 50;
  }
  // Preferred exchange
  const exchPref = EXCHANGE_PREFERENCE[m.exchange] ?? 0;
  score += exchPref;
  // ETF instrument type explicit = better than "Common Stock"
  if (m.instrument_type && /ETF|Fund/i.test(m.instrument_type)) {
    score += 30;
  }
  // Penalise duplicate/secondary listings (usually have weird mic codes)
  if (m.country && !/France|Germany|United Kingdom|Netherlands|Ireland|United States|Switzerland|Italy/i.test(m.country)) {
    score -= 20;
  }
  return score;
}

function recommend(
  matches: SymbolSearchResult[],
  internalTicker: string
): { pick: string | null; reason: string } {
  if (matches.length === 0) {
    return { pick: null, reason: "aucun résultat" };
  }
  const scored = matches
    .map((m) => ({ m, s: scoreMatch(m, internalTicker) }))
    .sort((a, b) => b.s - a.s);
  const top = scored[0].m;
  const reason =
    `best match : ${top.symbol} @ ${top.exchange}` +
    (top.instrument_type ? ` (${top.instrument_type})` : "");
  return { pick: `${top.symbol}:${top.exchange}`, reason };
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  if (!API_KEY) {
    console.error(
      `${RED}${BOLD}ERREUR${RESET} : la variable d'environnement ${BOLD}TWELVE_DATA_API_KEY${RESET} n'est pas définie.`
    );
    console.error(
      `Obtenez une clé gratuite sur https://twelvedata.com/pricing (800 req/jour free tier)`
    );
    console.error(`Puis relancez :`);
    console.error(`  ${DIM}export TWELVE_DATA_API_KEY=votre_cle${RESET}`);
    console.error(`  ${DIM}npx tsx scripts/audit-twelve-data.ts${RESET}`);
    process.exit(1);
  }

  console.log(
    `${BOLD}${CYAN}━━━ Twelve Data coverage audit ━━━${RESET}\n`
  );
  console.log(
    `${DIM}ETFs à auditer : ${ETF_LIST.length}${RESET}`
  );
  console.log(
    `${DIM}Mode : ${FAST_MODE ? "fast (2s/req)" : "safe (8s/req, free tier)"}${RESET}`
  );
  console.log(
    `${DIM}Temps estimé : ~${Math.ceil((ETF_LIST.length * SLEEP_MS * 2) / 1000)}s (2 requêtes max par ETF)${RESET}\n`
  );

  const rows: AuditRow[] = [];

  for (let i = 0; i < ETF_LIST.length; i++) {
    const etf = ETF_LIST[i];
    const idx = `[${String(i + 1).padStart(2, "0")}/${ETF_LIST.length}]`;
    process.stdout.write(
      `${idx} ${BOLD}${etf.displaySymbol}${RESET} ${DIM}(${etf.isin ?? "no ISIN"})${RESET}... `
    );

    let matches: SymbolSearchResult[] = [];
    let searchedBy: AuditRow["searchedBy"] = "BOTH_FAILED";

    // Try ISIN first (most precise)
    if (etf.isin) {
      const byIsin = await symbolSearch(etf.isin);
      if (byIsin.ok && byIsin.matches.length > 0) {
        matches = byIsin.matches;
        searchedBy = "ISIN";
      }
      await sleep(SLEEP_MS);
    }

    // Fallback to base ticker if ISIN returned nothing
    if (matches.length === 0) {
      const byTicker = await symbolSearch(baseTicker(etf.symbol));
      if (byTicker.ok && byTicker.matches.length > 0) {
        matches = byTicker.matches;
        searchedBy = "TICKER";
      }
      await sleep(SLEEP_MS);
    }

    const { pick, reason } = recommend(matches, etf.symbol);

    rows.push({
      displaySymbol: etf.displaySymbol,
      name: etf.name,
      isin: etf.isin,
      internalTicker: etf.symbol,
      searchedBy,
      matches,
      recommendation: pick,
      recommendationReason: reason,
    });

    if (matches.length === 0) {
      process.stdout.write(`${RED}✗ aucun résultat${RESET}\n`);
    } else {
      process.stdout.write(
        `${GREEN}✓${RESET} ${matches.length} match${matches.length > 1 ? "es" : ""} ${DIM}(${searchedBy})${RESET}\n`
      );
    }
  }

  // ── Summary table ─────────────────────────────────────────────────
  console.log(`\n${BOLD}${CYAN}━━━ RÉCAPITULATIF ━━━${RESET}\n`);
  console.log(
    `${BOLD}Ticker     ISIN              Recommandé                         Matches${RESET}`
  );
  console.log(DIM + "─".repeat(90) + RESET);

  for (const row of rows) {
    const tickerCol = row.displaySymbol.padEnd(10);
    const isinCol = (row.isin ?? "—").padEnd(18);
    const recoCol = (row.recommendation ?? `${RED}AUCUN${RESET}`).padEnd(
      35 + (row.recommendation ? 0 : RED.length + RESET.length)
    );
    const matchesCount = `${row.matches.length} bourse${row.matches.length !== 1 ? "s" : ""}`;
    const coloredMatches =
      row.matches.length === 0
        ? `${RED}${matchesCount}${RESET}`
        : row.matches.length === 1
        ? `${YELLOW}${matchesCount}${RESET}`
        : `${GREEN}${matchesCount}${RESET}`;
    console.log(`${tickerCol} ${isinCol} ${recoCol} ${coloredMatches}`);
  }

  // ── Detailed matches per ETF ──────────────────────────────────────
  console.log(`\n${BOLD}${CYAN}━━━ DÉTAIL DES BOURSES ━━━${RESET}\n`);
  for (const row of rows) {
    console.log(
      `${BOLD}${row.displaySymbol}${RESET} ${DIM}— ${row.name}${RESET}`
    );
    console.log(
      `  ${DIM}ISIN : ${row.isin ?? "—"} · ticker interne : ${row.internalTicker} · recherche : ${row.searchedBy}${RESET}`
    );
    if (row.matches.length === 0) {
      console.log(`  ${RED}✗ aucun symbole trouvé sur Twelve Data${RESET}`);
    } else {
      for (const m of row.matches.slice(0, 8)) {
        const isRecommended =
          row.recommendation === `${m.symbol}:${m.exchange}`;
        const marker = isRecommended ? `${GREEN}★${RESET}` : " ";
        console.log(
          `  ${marker} ${m.symbol.padEnd(10)} ${DIM}@${RESET} ${m.exchange.padEnd(20)} ${DIM}${m.instrument_type ?? ""}${m.currency ? " · " + m.currency : ""}${m.country ? " · " + m.country : ""}${RESET}`
        );
      }
      if (row.matches.length > 8) {
        console.log(`  ${DIM}… et ${row.matches.length - 8} autre(s)${RESET}`);
      }
    }
    console.log();
  }

  // ── Final verdict ─────────────────────────────────────────────────
  const uncovered = rows.filter((r) => r.matches.length === 0);
  const covered = rows.filter((r) => r.matches.length > 0);

  console.log(`${BOLD}${CYAN}━━━ VERDICT ━━━${RESET}\n`);
  console.log(`${GREEN}✓ Couverts${RESET} : ${covered.length}/${rows.length}`);
  console.log(`${RED}✗ Non couverts${RESET} : ${uncovered.length}/${rows.length}`);

  if (uncovered.length > 0) {
    console.log(`\n${RED}${BOLD}⚠ ETF sans couverture Twelve Data :${RESET}`);
    for (const r of uncovered) {
      console.log(`  · ${r.displaySymbol} (${r.isin ?? "no ISIN"}) — ${r.name}`);
    }
    console.log(
      `\n${YELLOW}Actions possibles :${RESET} remplacer par un équivalent couvert, ou garder en mode démo jusqu'à ce que Twelve Data l'ajoute.`
    );
  } else {
    console.log(`\n${GREEN}${BOLD}🎉 100 % des ETF sont couverts par Twelve Data.${RESET}`);
  }

  console.log();
}

main().catch((err) => {
  console.error(`\n${RED}${BOLD}Échec fatal :${RESET}`, err);
  process.exit(1);
});
