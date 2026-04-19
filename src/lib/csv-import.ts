// Generic CSV parser for broker transaction exports.
// Works with Trade Republic, Boursorama, Fortuneo exports out of the box
// by detecting common column names. Falls back to heuristics.
//
// Client-safe (no server imports).

export type ParsedTransaction = {
  date: string;    // "YYYY-MM-DD"
  amount: number;  // positive € amount (investments only)
  note?: string;   // raw description if available
};

export type ParsedMonth = {
  month: string;              // "YYYY-MM"
  contributions: ParsedTransaction[];
  total: number;              // sum of contributions.amount
};

export type ParseResult = {
  ok: boolean;
  error?: string;
  months: ParsedMonth[];
  skippedRows: number;
  detectedFormat: "trade-republic" | "boursorama" | "fortuneo" | "generic";
};

// ─── CSV tokenizer ────────────────────────────────────────────────────────────

function parseCsvLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === separator && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map((s) => s.trim());
}

function detectSeparator(firstLine: string): string {
  const candidates = [",", ";", "\t"];
  let best = ",";
  let bestCount = 0;
  for (const c of candidates) {
    const count = firstLine.split(c).length;
    if (count > bestCount) {
      bestCount = count;
      best = c;
    }
  }
  return best;
}

// ─── Column detection ────────────────────────────────────────────────────────

const DATE_HEADERS = ["date", "date de", "trade date", "value date", "fecha"];
const AMOUNT_HEADERS = [
  "amount", "montant", "value", "valeur", "total", "net amount",
  "montant net", "net", "prix total", "transaction amount",
];
const NOTE_HEADERS = ["description", "note", "libellé", "libelle", "asset", "name", "details"];
const TYPE_HEADERS = ["type", "operation", "opération", "side"];

function findColumn(headers: string[], candidates: string[]): number {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const candidate of candidates) {
    const idx = lower.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return -1;
}

function detectFormat(headers: string[]): ParseResult["detectedFormat"] {
  const joined = headers.join("|").toLowerCase();
  if (joined.includes("trade republic") || joined.includes("tradereupublic")) {
    return "trade-republic";
  }
  if (joined.includes("boursorama")) return "boursorama";
  if (joined.includes("fortuneo")) return "fortuneo";
  return "generic";
}

// ─── Value parsers ────────────────────────────────────────────────────────────

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  // Remove currency symbols and whitespace
  let cleaned = raw.replace(/[€$£\s]/g, "");
  // If both comma and dot present, assume the last one is the decimal.
  // European format '1.234,56' → '1234.56' ; Anglo '1,234.56' stays.
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (lastComma > -1) {
    cleaned = cleaned.replace(",", ".");
  }
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n)) return null;
  return n;
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw.trim();

  // ISO format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // French DD/MM/YYYY or DD-MM-YYYY
  const frMatch = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (frMatch) {
    const dd = frMatch[1].padStart(2, "0");
    const mm = frMatch[2].padStart(2, "0");
    return `${frMatch[3]}-${mm}-${dd}`;
  }

  return null;
}

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseBrokerCsv(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      ok: false,
      error: "Fichier vide ou sans données.",
      months: [],
      skippedRows: 0,
      detectedFormat: "generic",
    };
  }

  const separator = detectSeparator(lines[0]);
  const headers = parseCsvLine(lines[0], separator);
  const detectedFormat = detectFormat(headers);

  const dateCol = findColumn(headers, DATE_HEADERS);
  const amountCol = findColumn(headers, AMOUNT_HEADERS);
  const noteCol = findColumn(headers, NOTE_HEADERS);
  const typeCol = findColumn(headers, TYPE_HEADERS);

  if (dateCol === -1 || amountCol === -1) {
    return {
      ok: false,
      error:
        "Colonnes Date et Montant introuvables. Vérifiez que votre CSV contient bien ces colonnes.",
      months: [],
      skippedRows: 0,
      detectedFormat,
    };
  }

  const transactions: ParsedTransaction[] = [];
  let skippedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i], separator);
    if (row.length < Math.max(dateCol, amountCol) + 1) {
      skippedRows++;
      continue;
    }

    const date = parseDate(row[dateCol]);
    if (!date) {
      skippedRows++;
      continue;
    }

    const rawAmount = row[amountCol];
    const amount = parseAmount(rawAmount);
    if (amount === null) {
      skippedRows++;
      continue;
    }

    // Skip non-investment rows if we can detect a type
    if (typeCol !== -1) {
      const type = row[typeCol].toLowerCase();
      const isPurchase =
        type.includes("buy") ||
        type.includes("achat") ||
        type.includes("purchase") ||
        type.includes("credit") ||
        type.includes("saving plan") ||
        type.includes("epargne");
      const isWithdrawal =
        type.includes("withdrawal") ||
        type.includes("retrait") ||
        type.includes("payout");
      if (isWithdrawal) {
        skippedRows++;
        continue;
      }
      // If it's clearly not a purchase and we can tell, skip
      if (!isPurchase && (type.includes("sell") || type.includes("vente") || type.includes("fee"))) {
        skippedRows++;
        continue;
      }
    }

    // Keep positive amounts only (investments / credits)
    const finalAmount = Math.abs(amount);
    if (finalAmount < 0.01) {
      skippedRows++;
      continue;
    }

    transactions.push({
      date,
      amount: Math.round(finalAmount * 100) / 100,
      note: noteCol !== -1 ? row[noteCol] || undefined : undefined,
    });
  }

  // Group by month
  const monthMap = new Map<string, ParsedTransaction[]>();
  for (const tx of transactions) {
    const month = tx.date.slice(0, 7); // YYYY-MM
    const existing = monthMap.get(month) ?? [];
    existing.push(tx);
    monthMap.set(month, existing);
  }

  const months: ParsedMonth[] = Array.from(monthMap.entries())
    .map(([month, contributions]) => ({
      month,
      contributions: contributions.sort((a, b) => a.date.localeCompare(b.date)),
      total: Math.round(contributions.reduce((s, c) => s + c.amount, 0) * 100) / 100,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    ok: true,
    months,
    skippedRows,
    detectedFormat,
  };
}
