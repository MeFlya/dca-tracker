#!/usr/bin/env tsx
/**
 * Yahoo Finance coverage audit — one-shot script.
 *
 * Pour chaque ETF du catalogue (`ETF_LIST` dans src/lib/etf-config.ts),
 * tente de récupérer une cotation via `yahoo-finance2`. Symboles utilisés
 * directement depuis le champ `symbol` (au format Yahoo : CW8.PA, IWDA.AS,
 * SPY, etc.).
 *
 * Si le symbole principal échoue, tente des fallbacks :
 *   - sans suffixe (ex: CW8)
 *   - autres bourses Euronext (.PA ↔ .AS)
 *
 * Usage :
 *   npx tsx scripts/audit-yahoo-finance.ts
 *
 * Pas de clé API requise (Yahoo Finance non-officiel).
 */

import YahooFinance from "yahoo-finance2";
import { ETF_LIST } from "../src/lib/etf-config";

// v3 API : require instantiation (v2's default function export is gone)
const yahooFinance = new YahooFinance();

// ── ANSI colors (no deps) ─────────────────────────────────────────────
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

interface QuoteAttempt {
  symbol: string;
  ok: boolean;
  price?: number;
  currency?: string;
  exchange?: string;
  fullName?: string;
  error?: string;
}

interface AuditRow {
  displaySymbol: string;
  name: string;
  isin: string | undefined;
  primary: string;
  attempts: QuoteAttempt[];
  bestMatch: QuoteAttempt | null;
}

/** Try fetching a single symbol; never throws. */
async function tryQuote(symbol: string): Promise<QuoteAttempt> {
  try {
    const q = await yahooFinance.quote(symbol);
    if (!q || typeof q.regularMarketPrice !== "number") {
      return { symbol, ok: false, error: "no price in response" };
    }
    return {
      symbol,
      ok: true,
      price: q.regularMarketPrice,
      currency: q.currency ?? "?",
      exchange: q.fullExchangeName ?? q.exchange ?? "?",
      fullName: q.longName ?? q.shortName ?? undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { symbol, ok: false, error: msg };
  }
}

/**
 * Build fallback symbol candidates:
 *  - if "CW8.PA" → also try "CW8.AS" (other Euronext venue)
 *  - if "SPY" (no suffix) → also try "SPY" alone (already done) — skip
 *  - last resort : strip the suffix entirely
 */
function fallbackCandidates(primary: string): string[] {
  const out: string[] = [];
  const dotIdx = primary.lastIndexOf(".");
  if (dotIdx === -1) return out; // no suffix to swap

  const base = primary.slice(0, dotIdx);
  const suffix = primary.slice(dotIdx);

  // Euronext sister venues
  if (suffix === ".PA") out.push(`${base}.AS`);
  if (suffix === ".AS") out.push(`${base}.PA`);
  // Sometimes ETFs are also on .DE (Xetra) or .L (London)
  if (suffix === ".PA" || suffix === ".AS") {
    out.push(`${base}.DE`);
    out.push(`${base}.L`);
  }
  // Last resort: bare ticker
  out.push(base);

  return out;
}

async function main() {
  console.log(`${BOLD}${CYAN}━━━ Yahoo Finance coverage audit ━━━${RESET}\n`);
  console.log(`${DIM}ETFs à auditer : ${ETF_LIST.length}${RESET}`);
  console.log(`${DIM}Lib : yahoo-finance2 (non-officiel, gratuit, sans clé)${RESET}\n`);

  const rows: AuditRow[] = [];

  for (let i = 0; i < ETF_LIST.length; i++) {
    const etf = ETF_LIST[i];
    const idx = `[${String(i + 1).padStart(2, "0")}/${ETF_LIST.length}]`;
    process.stdout.write(`${idx} ${BOLD}${etf.displaySymbol}${RESET} ${DIM}(${etf.symbol})${RESET}... `);

    const attempts: QuoteAttempt[] = [];
    const primary = await tryQuote(etf.symbol);
    attempts.push(primary);

    let bestMatch: QuoteAttempt | null = primary.ok ? primary : null;

    if (!primary.ok) {
      // Try fallbacks
      for (const cand of fallbackCandidates(etf.symbol)) {
        const att = await tryQuote(cand);
        attempts.push(att);
        if (att.ok) {
          bestMatch = att;
          break;
        }
      }
    }

    rows.push({
      displaySymbol: etf.displaySymbol,
      name: etf.name,
      isin: etf.isin,
      primary: etf.symbol,
      attempts,
      bestMatch,
    });

    if (bestMatch) {
      const tag = bestMatch.symbol === etf.symbol ? "" : ` ${YELLOW}(via fallback)${RESET}`;
      process.stdout.write(
        `${GREEN}✓${RESET} ${bestMatch.price} ${bestMatch.currency} @ ${bestMatch.exchange}${tag}\n`
      );
    } else {
      process.stdout.write(`${RED}✗ ${attempts.length} tentatives échouées${RESET}\n`);
    }
  }

  // ── Summary table ─────────────────────────────────────────────────
  console.log(`\n${BOLD}${CYAN}━━━ RÉCAPITULATIF ━━━${RESET}\n`);
  console.log(
    `${BOLD}Ticker     ISIN              Yahoo symbol     Prix          Bourse${RESET}`
  );
  console.log(DIM + "─".repeat(95) + RESET);

  for (const row of rows) {
    const tickerCol = row.displaySymbol.padEnd(10);
    const isinCol = (row.isin ?? "—").padEnd(18);
    if (row.bestMatch) {
      const sym = row.bestMatch.symbol.padEnd(15);
      const price = `${row.bestMatch.price} ${row.bestMatch.currency}`.padEnd(13);
      const exch = row.bestMatch.exchange ?? "?";
      const altMark = row.bestMatch.symbol !== row.primary ? `${YELLOW}*${RESET}` : " ";
      console.log(
        `${tickerCol} ${isinCol} ${sym} ${altMark} ${price} ${DIM}${exch}${RESET}`
      );
    } else {
      console.log(
        `${tickerCol} ${isinCol} ${RED}AUCUN${RESET}${" ".repeat(11)}${RED}—${RESET}`
      );
    }
  }

  // ── Detailed failures ─────────────────────────────────────────────
  const failed = rows.filter((r) => !r.bestMatch);
  const fallbacked = rows.filter(
    (r) => r.bestMatch && r.bestMatch.symbol !== r.primary
  );

  if (fallbacked.length > 0) {
    console.log(`\n${BOLD}${YELLOW}━━━ FALLBACKS UTILISÉS ━━━${RESET}\n`);
    for (const r of fallbacked) {
      console.log(
        `${YELLOW}*${RESET} ${BOLD}${r.displaySymbol}${RESET} : symbole catalogue ${BOLD}${r.primary}${RESET} a échoué, ${BOLD}${r.bestMatch!.symbol}${RESET} fonctionne`
      );
      console.log(
        `  ${DIM}→ envisager mise à jour etf-config.ts (symbol: "${r.bestMatch!.symbol}") pour éliminer le fallback${RESET}`
      );
    }
  }

  if (failed.length > 0) {
    console.log(`\n${BOLD}${RED}━━━ ÉCHECS COMPLETS ━━━${RESET}\n`);
    for (const r of failed) {
      console.log(`${RED}✗${RESET} ${BOLD}${r.displaySymbol}${RESET} ${DIM}(ISIN ${r.isin})${RESET}`);
      console.log(`  Tentatives :`);
      for (const a of r.attempts) {
        console.log(`    · ${a.symbol} → ${RED}${a.error}${RESET}`);
      }
    }
  }

  // ── Verdict ───────────────────────────────────────────────────────
  console.log(`\n${BOLD}${CYAN}━━━ VERDICT ━━━${RESET}\n`);
  console.log(`${GREEN}✓ Couverts${RESET} : ${rows.length - failed.length}/${rows.length}`);
  if (fallbacked.length > 0) {
    console.log(`${YELLOW}⚠ Via fallback${RESET} : ${fallbacked.length} (catalogue à mettre à jour)`);
  }
  console.log(`${RED}✗ Non couverts${RESET} : ${failed.length}/${rows.length}`);

  if (failed.length === 0) {
    console.log(`\n${GREEN}${BOLD}🎉 100 % des ETF sont couverts par Yahoo Finance.${RESET}`);
  } else {
    console.log(
      `\n${YELLOW}Action requise${RESET} : décider quoi faire des ETF non couverts (retirer du catalogue, fallback statique, ou autre provider).`
    );
  }

  console.log();
}

main().catch((err) => {
  console.error(`\n${RED}${BOLD}Échec fatal :${RESET}`, err);
  process.exit(1);
});
