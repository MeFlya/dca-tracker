import { SimulatorOutput } from "./simulator";

// ─── Palette (RGB tuples matching the site's design tokens) ──────────────────
const C = {
  blue:     [29,  78,  216] as const,
  green:    [5,   150, 105] as const,
  gray900:  [17,  24,  39]  as const,
  gray600:  [75,  85,  99]  as const,
  gray400:  [156, 163, 175] as const,
  gray300:  [209, 213, 219] as const,
  gray200:  [229, 231, 235] as const,
  gray100:  [243, 244, 246] as const,
  slate50:  [248, 250, 252] as const,
  blue50:   [239, 246, 255] as const,
  amber50:  [255, 251, 235] as const,
  amber200: [253, 230, 138] as const,
  amber800: [146, 64,  14]  as const,
  white:    [255, 255, 255] as const,
};

// ─── String helpers ───────────────────────────────────────────────────────────

// jsPDF's built-in Helvetica uses Windows-1252 encoding.
// \u00a0 (no-break space) and \u202f (narrow no-break space) are used by
// Intl.NumberFormat("fr-FR") as thousands separators and won't render as
// visible space in the PDF — replace them with a regular ASCII space.
function pdfStr(s: string): string {
  return s.replace(/[\u00a0\u202f]/g, " ");
}

function pdfEur(value: number): string {
  return pdfStr(
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value)
  );
}

function pdfPct(value: number, forceSign = false): string {
  const sign = forceSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} %`;
}

function ratio(finalValue: number, invested: number): string {
  if (invested === 0) return "—";
  return `x${(finalValue / invested).toFixed(2)}`;
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function generateSimulationPDF(
  output: SimulatorOutput
): Promise<void> {
  // Lazy-load jsPDF — keeps it out of the initial JS bundle entirely.
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const PW = 210;   // page width (mm)
  const PH = 297;   // page height (mm)
  const M  = 18;    // margin
  const CW = PW - M * 2; // content width = 174mm

  // ── Low-level drawing helpers ──────────────────────────────────────────────

  function fill(color: readonly [number, number, number]) {
    doc.setFillColor(color[0], color[1], color[2]);
  }
  function stroke(color: readonly [number, number, number], width = 0.3) {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(width);
  }
  function textColor(color: readonly [number, number, number]) {
    doc.setTextColor(color[0], color[1], color[2]);
  }
  function font(size: number, style: "normal" | "bold" = "normal") {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
  }
function hline(
  y: number,
  color: readonly [number, number, number] = C.gray200
) {
  stroke(color, 0.25);
  doc.line(M, y, PW - M, y);
}

  // Advances y and draws a labelled section header.
  // Returns the new y position (after the header).
  function sectionHead(label: string, y: number): number {
    font(7, "bold");
    textColor(C.blue);
    doc.text(label.toUpperCase(), M, y);
    return y + 7;
  }

  let y = 0;

  // ── 1. Header ──────────────────────────────────────────────────────────────

  // Blue accent bar across the full page width
  fill(C.blue);
  doc.rect(0, 0, PW, 2.5, "F");

  y = 15;
  font(17, "bold");
  textColor(C.blue);
  doc.text("DCA Tracker", M, y);

  y = 22;
  font(8.5, "normal");
  textColor(C.gray400);
  doc.text("Rapport de simulation d'investissement progressif", M, y);

  // Right-aligned: date + legal note
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  font(7.5, "normal");
  textColor(C.gray400);
  doc.text(pdfStr(`Genere le ${today}`), PW - M, 15, { align: "right" });
  doc.text("Simulation hypothetique — pas un conseil financier", PW - M, 22, {
    align: "right",
  });

  y = 29;
  hline(y, C.gray300);
  y = 38;

  // ── 2. Parameters ──────────────────────────────────────────────────────────

  const { base, conservative, optimistic, input } = output;
  const netReturn = input.annualReturnPct - input.annualFeesPct;

  y = sectionHead("Parametres de la simulation", y);

  // 6 params in 2 columns (3 rows each)
  const params: [string, string][] = [
    ["Versement mensuel",        pdfStr(`${input.monthlyAmount.toLocaleString("fr-FR")} EUR`)],
    ["Duree d'investissement",   `${input.durationYears} ans`],
    ["Rendement annuel brut",    `${input.annualReturnPct} %`],
    ["Frais annuels (TER)",      `${input.annualFeesPct} %`],
    ["Rendement net apres frais",`${netReturn.toFixed(2)} %`],
    ["Inflation prise en compte",input.annualInflationPct ? `${input.annualInflationPct} %` : "Non renseignee"],
  ];

  const colR = M + CW / 2 + 5; // x-start of right column
  const ROW_H = 10;

  params.forEach(([label, value], i) => {
    const col = i % 2 === 0 ? M : colR;
    const row = Math.floor(i / 2);
    const ry  = y + row * ROW_H;

    font(7, "normal"); textColor(C.gray400);
    doc.text(label, col, ry);
    font(9, "bold");   textColor(C.gray900);
    doc.text(value, col, ry + 4.5);
  });

  y += Math.ceil(params.length / 2) * ROW_H + 4;
  hline(y);
  y += 9;

  // ── 3. Base scenario — big numbers ────────────────────────────────────────

  y = sectionHead("Scenario de base", y);

  const BOX_GAP = 4;
  const BOX_W   = (CW - BOX_GAP * 2) / 3; // ~55.3mm
  const BOX_H   = 23;

  const boxes = [
    {
      label:  "Montant investi",
      value:  pdfEur(base.totalInvested),
      accent: C.gray300,
      vColor: C.gray900,
    },
    {
      label:  "Valeur projetee",
      value:  pdfEur(base.finalValue),
      accent: C.blue,
      vColor: C.blue,
    },
    {
      label:  "Gains projetes",
      value:  pdfEur(base.totalGain),
      accent: C.green,
      vColor: C.green,
    },
  ] as const;

  boxes.forEach((box, i) => {
    const bx = M + i * (BOX_W + BOX_GAP);
    const by = y;

    // Background + border
    fill(C.slate50);
    stroke(C.gray200);
    doc.roundedRect(bx, by, BOX_W, BOX_H, 2, 2, "FD");

    // Coloured top accent strip
    fill(box.accent);
    doc.rect(bx, by, BOX_W, 2, "F");

    // Label
    font(7, "normal"); textColor(C.gray400);
    doc.text(box.label, bx + 3.5, by + 8);

    // Value
    font(11, "bold"); textColor(box.vColor);
    doc.text(box.value, bx + 3.5, by + 17);
  });

  y += BOX_H + 5;

  // Gain % and optional inflation-adjusted value on one line
  font(8, "normal"); textColor(C.gray600);
  doc.text("Rendement sur capital investi : ", M, y);
  font(8, "bold"); textColor(C.green);
  doc.text(pdfPct(base.gainPercent, true), M + 57, y);

  if (base.inflationAdjustedValue !== undefined) {
    font(8, "normal"); textColor(C.gray600);
    doc.text("Valeur reelle apres inflation : ", M + 88, y);
    font(8, "bold"); textColor(C.gray900);
    doc.text(pdfEur(base.inflationAdjustedValue), M + 145, y);
  }

  y += 8;
  hline(y);
  y += 9;

  // ── 4. Scenarios table ────────────────────────────────────────────────────

  y = sectionHead("Comparaison des scenarios (+/- 2 %)", y);

  // Column definitions [label, x, width]
  const COLS: [string, number, number][] = [
    ["Scenario",        M,       38],
    ["Rendement",       M + 38,  22],
    ["Investi",         M + 60,  30],
    ["Valeur finale",   M + 90,  30],
    ["Gains",           M + 120, 30],
    ["Ratio",           M + 150, 24],
  ];

  const HEAD_H = 8;
  const ROW_TH = 9;

  // Header background
  fill(C.gray100); stroke(C.gray200);
  doc.rect(M, y, CW, HEAD_H, "F");

  font(7, "bold"); textColor(C.gray600);
  COLS.forEach(([label, cx]) => doc.text(label, cx + 2, y + 5.5));
  y += HEAD_H;

  // Data rows
  const scenarios = [
    { s: conservative, isBase: false, label: "Conservateur" },
    { s: base,         isBase: true,  label: "Base (votre sim.)" },
    { s: optimistic,   isBase: false, label: "Optimiste" },
  ] as const;

  scenarios.forEach(({ s, isBase, label }, rowIdx) => {
    const ry = y + rowIdx * ROW_TH;

    // Row background
    if (isBase) {
      fill(C.blue50);
    } else {
      fill(rowIdx % 2 === 0 ? C.slate50 : C.white);
    }
    doc.rect(M, ry, CW, ROW_TH, "F");

    const gainPositive = s.totalGain >= 0;
    const cells: [string, number][] = [
      [label,                   COLS[0][1]],
      [`${s.annualReturnPct} %`, COLS[1][1]],
      [pdfEur(s.totalInvested), COLS[2][1]],
      [pdfEur(s.finalValue),    COLS[3][1]],
      [pdfEur(s.totalGain),     COLS[4][1]],
      [ratio(s.finalValue, s.totalInvested), COLS[5][1]],
    ];

    cells.forEach(([text, cx], ci) => {
      const isGain  = ci === 4;
      const isLabel = ci === 0;
      const color =
        isGain    ? (gainPositive ? C.green : C.gray900) :
        isLabel && isBase ? C.blue :
        C.gray900;

      font(isLabel && isBase ? 8 : 7.5, isLabel && isBase ? "bold" : "normal");
      textColor(color);
      doc.text(text, cx + 2, ry + 6);
    });
  });

  y += scenarios.length * ROW_TH;

  // Table bottom border
  stroke(C.gray200);
  doc.line(M, y, PW - M, y);
  y += 9;

  // ── 5. Assumptions ────────────────────────────────────────────────────────

  y = sectionHead("Hypotheses de calcul", y);

  const assumptions = [
    `Versement de ${pdfStr(input.monthlyAmount.toLocaleString("fr-FR"))} EUR en debut de mois, capitalise mensuellement`,
    `Rendement net = ${input.annualReturnPct} % - ${input.annualFeesPct} % (frais) = ${netReturn.toFixed(2)} %/an (constant sur toute la duree)`,
    `Scenarios conservateur / optimiste : +/- 2 points par rapport au scenario de base`,
    ...(input.annualInflationPct
      ? [`Valeur reelle calculee en deflatant par ${input.annualInflationPct} %/an sur ${input.durationYears} ans`]
      : []),
  ];

  font(7.5, "normal"); textColor(C.gray600);
  assumptions.forEach((line, i) => {
    doc.text(`• ${line}`, M, y + i * 5.5, { maxWidth: CW });
  });

  // ── 6. Disclaimer (pinned near page bottom) ───────────────────────────────

  const disclaimerY = PH - 38;

  hline(disclaimerY - 4, C.gray300);

  // Amber box
  fill(C.amber50); stroke(C.amber200);
  doc.rect(M, disclaimerY, CW, 25, "FD");

  font(7, "bold"); textColor(C.amber800);
  doc.text("Avertissement legal :", M + 3.5, disclaimerY + 6);

  font(6.5, "normal"); textColor(C.amber800);
  doc.text(
    "Ce document est fourni a titre informatif et educatif uniquement. Il ne constitue pas un conseil en investissement financier personnalise. Les simulations sont hypothetiques et ne garantissent pas les performances futures. Les marches financiers comportent un risque de perte en capital. Consultez un conseiller financier agree avant toute decision d'investissement.",
    M + 3.5,
    disclaimerY + 12,
    { maxWidth: CW - 7 }
  );

  // Footer
  font(6.5, "normal"); textColor(C.gray400);
  doc.text("dcatracker.fr — outil éducatif, pas de conseil en investissement", M, PH - 7);
  doc.text(pdfStr(today), PW - M, PH - 7, { align: "right" });

  // ── 7. Save ───────────────────────────────────────────────────────────────

  const year = new Date().getFullYear();
  doc.save(
    `simulation-dca-${input.monthlyAmount}eur-${input.durationYears}ans-${year}.pdf`
  );
}
