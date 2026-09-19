// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// jsPDF-native PDF report assembler — vector text via jsPDF `.text`/`.addImage`,
// raster tooth/perio charts, no svg2pdf.js.
//
// Split for testability: this module holds the PURE `assemblePdf(opts, data,
// docFactory)` — no I/O, no SVG rasterization, no `fetch`/`Image`/`canvas`. It
// only decides which sections to add and drives a jsPDF-like `PdfDocLike` doc.
// `exportPdf()` (the impure half that gathers `data` via SVG→PNG rasterization,
// summary text, and `hasAnyPerioData()`, drives the export-progress overlay, and
// calls `assemblePdf`) lives in `odontogram.ts` alongside `exportImage`/
// `exportPerioImage`, sharing a `rasterizeSvgToPng` raster helper with them.
//
// Constructing a real `jsPDF` instance touches browser canvas/font internals
// jsdom doesn't fully provide, so `assemblePdf` is unit-tested exclusively via
// an injected fake `PdfDocLike`, never a real `new jsPDF()`.

// jsPDF is not imported statically — it is lazy-loaded via a dynamic
// `import("jspdf")` in `exportPdf()` so consumers who never export a PDF don't
// pull jspdf (and its html2canvas/dompurify deps) into their bundle.
// `assemblePdf` receives a jsPDF-backed `docFactory` from its caller (or an
// injected fake, in tests) — it never references jsPDF itself.
import { t } from "./i18n/useI18n";

/** Which PDF sections the user opted into. The perio sections are additionally
 *  auto-skipped whenever `data.hasPerio` is false (see {@link assemblePdf}),
 *  regardless of these flags — a blank perio chart never gets an empty
 *  "Periodontal status" page. */
export interface PdfExportOptions {
  patientData: boolean;
  /** The odontogram chart IMAGE — selectable independently of its prose
   *  description in the export dialog. */
  odontogramChart: boolean;
  /** The whole-mouth odontogram summary PROSE. */
  odontogramDescription: boolean;
  /** The per-tooth "Individual notes" section — omitted whenever no tooth
   *  carries a note (`data.individualNotes` empty), regardless of this flag. */
  individualNotes: boolean;
  perioStatus: boolean;
  perioDescription: boolean;
}

/** Minimal case-identity shape the PDF header needs (patient name + exam
 *  date). Deliberately a LOCAL structural type rather than importing
 *  odontogram.ts's `CaseMeta` — `getCaseMeta()`'s return value satisfies it
 *  structurally, and keeping this module free of any `odontogram.ts` import
 *  avoids a circular dependency (odontogram.ts is the one importing FROM
 *  perioPdf.ts). */
export interface PdfCaseIdentity {
  patientName: string | null;
  /** Patient date of birth (ISO `YYYY-MM-DD`), shown 2nd in the header. */
  patientDob: string | null;
  examDate: string | null;
}

/** A labelled key/value pair rendered as one row of a colored table. */
export interface PdfRow {
  label: string;
  value: string;
}

/** One abbreviation-glossary entry (bold term + description). */
export interface PdfAbbrev {
  term: string;
  desc: string;
}

/** Grouped dentition table (structurally matches odontogram.ts's
 *  OdontogramToothTable — a local type keeps this module free of an odontogram
 *  import). Tooth numbers are coloured/emphasized by `status`. */
export interface PdfToothTableCell { toothNo: number; label: string; status: "empty" | "content" | "problem"; }
export interface PdfToothTable {
  columns: { key: string; label: string }[];
  rows: { key: string; label: string; cells: Record<string, PdfToothTableCell[]> }[];
  legend: string;
}

/** End-of-document footer — medical disclaimer + a generation/version stamp
 *  with attribution links (GitHub + DOI). */
export interface PdfFooter {
  disclaimer: string;
  /** "Generated on <date> with <app> v<version>", pre-localized. */
  generated: string;
  repoUrl: string;
  doi: string;
}

/** Pixel dimensions of a rasterized chart, used to keep the embedded PDF
 *  image's aspect ratio correct. Optional — `assemblePdf` falls back to a
 *  reasonable default aspect ratio when omitted (e.g. in the unit test's
 *  minimal fixture). */
export interface PdfImageSize {
  width: number;
  height: number;
}

/** Pre-rendered input for {@link assemblePdf} — every PNG/text value is
 *  already computed by `exportPdf()` before this is built; `assemblePdf`
 *  itself performs no I/O. */
export interface PdfAssembleData {
  /** `hasAnyPerioData()` — when false, BOTH perio sections are omitted no
   *  matter what `opts.perioStatus`/`opts.perioDescription` ask for. */
  hasPerio: boolean;
  /** Document title shown once at the very top (e.g. "Odontogram Report"). */
  reportTitle: string;
  /** End-of-document disclaimer + generation/version/attribution stamp. */
  footer: PdfFooter;
  /** Colour theme palette (all table/heading colours derive from this). */
  palette: PdfPalette;
  /** Patient identity rows (name / DOB (+age) / exam date) — pre-formatted by
   *  `exportPdf` per the PDF settings (default name/DOB, age toggle, date
   *  format), so the assembler just lays them out. */
  patient: PdfRow[];
  odontogramPng: string;
  /** One-sentence dental-chart overview, rendered as a caption above the
   *  findings table. */
  odontogramCaption: string;
  /** Grouped dentition table (null when the odontogram-table toggle is off). */
  toothTable?: PdfToothTable | null;
  /** Dental-chart findings (permanent/missing lists live in the caption; these
   *  are the per-axis sections + implants) as key/value table rows. */
  odontogramFindings: PdfRow[];
  /** Per-tooth notes as `{ tooth, note }` rows — empty when none. */
  individualNotes: PdfRow[];
  odontogramImageSize?: PdfImageSize;
  /** Optional frame around the dental-chart image (null = none). */
  odontogramBorder?: { widthMm: number; color: RGB } | null;
  perioPng: string;
  /** Periodontal metrics + 2017 classification as key/value table rows. */
  perioMetrics: PdfRow[];
  perioImageSize?: PdfImageSize;
  /** Abbreviation glossary (bold term + description) rows. */
  abbreviations: PdfAbbrev[];
  /** jsPDF font family to render with (the caller registers it on the doc via
   *  the docFactory). Falls back to built-in "helvetica" when omitted — e.g.
   *  the unit-test fixture. */
  fontFamily?: string;
  /** Per-string transform applied before every `doc.text` (Arabic shaping +
   *  bidi; identity for other scripts). Omitted = identity. */
  shapeText?: (s: string) => string;
}

/** The minimal jsPDF surface `assemblePdf` drives — lets tests inject a
 *  lightweight fake without constructing a real `jsPDF` (see the jsdom note
 *  above). A real `jsPDF` instance satisfies this structurally. */
export interface PdfDocLike {
  text: (text: string, x: number, y: number, options?: any) => PdfDocLike;
  addImage: (imageData: string, format: string, x: number, y: number, width: number, height: number) => PdfDocLike;
  addPage: (...args: any[]) => PdfDocLike;
  setFontSize: (size: number) => PdfDocLike;
  setFont: (fontName: string, fontStyle?: string) => PdfDocLike;
  // Embedded-font registration (present on a real jsPDF, absent on the test
  // fake) — optional so the fake still satisfies this interface.
  addFileToVFS?: (fileName: string, data: string) => void;
  addFont?: (fileName: string, fontName: string, fontStyle: string) => void;
  // Colored-table drawing surface (all present on a real jsPDF instance).
  setTextColor: (r: number, g?: number, b?: number) => PdfDocLike;
  setFillColor: (r: number, g?: number, b?: number) => PdfDocLike;
  setDrawColor: (r: number, g?: number, b?: number) => PdfDocLike;
  setLineWidth: (w: number) => PdfDocLike;
  rect: (x: number, y: number, w: number, h: number, style?: string) => PdfDocLike;
  line: (x1: number, y1: number, x2: number, y2: number) => PdfDocLike;
  save: (filename?: string) => void;
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
}

const MARGIN_MM = 15;
const LINE_HEIGHT_MM = 6;
/** Rough default aspect ratio (height/width) for a chart image when the
 *  caller didn't supply real pixel dimensions (e.g. the unit test's minimal
 *  fixture) — the odontogram/perio charts are both wider than tall. */
const DEFAULT_IMAGE_ASPECT = 0.55;

/** Greedy plain-text word-wrap to a fixed character budget per line. No
 *  dependency on jsPDF's own `splitTextToSize` (which the fake test doc
 *  doesn't implement, and which needs a real font metrics table) — an
 *  approximate char-count wrap is more than sufficient for a report's prose
 *  paragraphs. */
function wrapPlainText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if(words.length === 0) return [];
  const lines: string[] = [];
  let current = "";
  for(const word of words){
    const candidate = current ? `${current} ${word}` : word;
    if(candidate.length > maxCharsPerLine && current){
      lines.push(current);
      current = word;
    }else{
      current = candidate;
    }
  }
  if(current) lines.push(current);
  return lines;
}

// Filesystem-safe timestamp (`YYYY-MM-DD-HH-MM-SS`) for the download filename.
function pdfStamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}


// Report colour palette (RGB) for the tabular layout — a colored section heading
// bar (white text), light key-cell + alternating row shading, subtle borders.
// Selectable via the PDF-settings colour theme.
type RGB = readonly [number, number, number];
export interface PdfPalette {
  header: RGB;      // section-heading bar fill (white text)
  headerText: RGB;
  labelBg: RGB;     // key/label cell fill
  rowBg: RGB;       // value cell (even rows)
  rowAlt: RGB;      // value cell (odd rows)
  border: RGB;      // table gridlines
  text: RGB;        // primary text
  muted: RGB;       // secondary/value text
}

/** Selectable report colour themes — the default is "blue"; the other three are
 *  distinct but equally calm/medical. */
export type PdfColorTheme = "blue" | "teal" | "amber" | "slate";
export const PDF_PALETTES: Record<PdfColorTheme, PdfPalette> = {
  blue:  { header: [37, 99, 235],  headerText: [255, 255, 255], labelBg: [219, 234, 254], rowBg: [255, 255, 255], rowAlt: [244, 248, 253], border: [199, 210, 224], text: [15, 23, 42], muted: [51, 65, 85] },
  teal:  { header: [13, 148, 136], headerText: [255, 255, 255], labelBg: [204, 251, 241], rowBg: [255, 255, 255], rowAlt: [240, 253, 250], border: [178, 213, 207], text: [12, 34, 31], muted: [47, 79, 74] },
  amber: { header: [180, 83, 9],   headerText: [255, 255, 255], labelBg: [254, 243, 199], rowBg: [255, 255, 255], rowAlt: [255, 251, 235], border: [228, 214, 180], text: [41, 30, 12], muted: [92, 71, 40] },
  slate: { header: [51, 65, 85],   headerText: [255, 255, 255], labelBg: [226, 232, 240], rowBg: [255, 255, 255], rowAlt: [248, 250, 252], border: [203, 213, 225], text: [15, 23, 42], muted: [71, 85, 105] },
};
export const DEFAULT_PDF_THEME: PdfColorTheme = "blue";
// Fixed warning colour for "problem" tooth numbers in the dentition table
// (bold-italic red), independent of the chosen theme.
const C_PROBLEM: RGB = [190, 40, 40];

/**
 * Assemble the PDF report from pre-rendered `data`, gated by `opts`. PURE —
 * no I/O, no rasterization; `docFactory` defaults to a real `new jsPDF()`
 * but tests always inject a fake (see the jsdom note above).
 *
 * Medical, tabular layout — each section opens with a colored heading bar;
 * identity/findings/metrics/abbreviations render as colored key/value tables.
 * Section order: (1) Patient data (name, DOB + age, exam date) when
 * `opts.patientData`; (2) Dental chart — image (`opts.odontogramChart`) and/or
 * caption + findings table (`opts.odontogramDescription`); (3) Individual notes
 * when `opts.individualNotes` AND at least one note exists; (4) Periodontal
 * status chart on its OWN page when `data.hasPerio && opts.perioStatus`;
 * (5) Periodontal description (metrics + classification table) + the
 * abbreviation glossary when `data.hasPerio && opts.perioDescription`.
 */
export function assemblePdf(
  opts: PdfExportOptions,
  data: PdfAssembleData,
  docFactory: () => PdfDocLike = () => {
    throw new Error("assemblePdf: a docFactory is required — jsPDF is lazy-loaded by exportPdf()");
  },
): PdfDocLike {
  const doc = docFactory();
  // The bundled Unicode font is registered by the caller's docFactory (see
  // exportPdf → loadPdfFont) so Hungarian ő/ű, Cyrillic, Arabic and CJK render.
  // `data.fontFamily` names it; `shape` applies Arabic joining/bidi to every
  // string (identity for other scripts). Both fall back for the test doc.
  const FONT = data.fontFamily ?? "helvetica";
  const shape = data.shapeText ?? ((s: string) => s);
  doc.setFont(FONT, "normal");
  // All text goes through `drawText` so the per-script transform (Arabic
  // joining/bidi) is applied uniformly right before rendering.
  const drawText = (s: string, x: number, y: number, options?: any) => doc.text(shape(s), x, y, options);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN_MM * 2;
  let y = MARGIN_MM;

  // All colours come from the chosen theme palette.
  const { header: C_HEADER, headerText: C_HEADER_TEXT, labelBg: C_LABEL_BG,
    rowBg: C_ROW_BG, rowAlt: C_ROW_ALT, border: C_BORDER, text: C_TEXT, muted: C_MUTED } = data.palette;

  const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const stroke = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const ink = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

  const ensureSpace = (neededMm: number) => {
    if(y + neededMm > pageHeight - MARGIN_MM){ doc.addPage(); y = MARGIN_MM; }
  };

  // Colored section-heading bar.
  const sectionBar = (title: string) => {
    const barH = 7.5;
    ensureSpace(barH + 3);
    fill(C_HEADER);
    doc.rect(MARGIN_MM, y, contentWidth, barH, "F");
    ink(C_HEADER_TEXT);
    doc.setFontSize(11.5);
    doc.setFont(FONT, "bold");
    drawText(title, MARGIN_MM + 2.5, y + 5.1);
    y += barH + 3;
    ink(C_TEXT);
    doc.setFont(FONT, "normal");
    doc.setFontSize(10);
  };

  // Small italic caption line(s) under a heading.
  const caption = (txt: string) => {
    if(!txt) return;
    const maxChars = Math.max(20, Math.floor(contentWidth / 1.6));
    doc.setFontSize(9);
    doc.setFont(FONT, "italic");
    ink(C_MUTED);
    for(const raw of txt.split("\n")){
      const lines = raw.trim() === "" ? [""] : wrapPlainText(raw, maxChars);
      for(const line of lines){ ensureSpace(4.4); drawText(line, MARGIN_MM, y + 3.1); y += 4.4; }
    }
    y += 1.5;
    ink(C_TEXT);
    doc.setFont(FONT, "normal");
    doc.setFontSize(10);
  };

  // Colored two-column key/value table (bold label cell + wrapped value cell,
  // alternating row shading, gridlines; page-breaks per row).
  const table = (rows: PdfRow[], o: { labelWidth: number; fontSize?: number }) => {
    if(!rows.length) return;
    const fontSize = o.fontSize ?? 9;
    const labelW = o.labelWidth;
    const valX = MARGIN_MM + labelW;
    const valW = contentWidth - labelW;
    const pad = 1.8;
    const lineH = fontSize * 0.48;
    const mmPerChar = (1.7 * fontSize) / 10;
    const labelBudget = Math.max(4, Math.floor((labelW - pad * 2) / mmPerChar));
    const valBudget = Math.max(6, Math.floor((valW - pad * 2) / mmPerChar));

    rows.forEach((row, i) => {
      const labelLines = row.label ? wrapPlainText(row.label, labelBudget) : [""];
      const valueLines = row.value ? wrapPlainText(row.value, valBudget) : [""];
      const n = Math.max(labelLines.length, valueLines.length, 1);
      const rowH = n * lineH + pad * 2;
      if(y + rowH > pageHeight - MARGIN_MM){ doc.addPage(); y = MARGIN_MM; }

      fill(C_LABEL_BG);
      doc.rect(MARGIN_MM, y, labelW, rowH, "F");
      fill(i % 2 ? C_ROW_ALT : C_ROW_BG);
      doc.rect(valX, y, valW, rowH, "F");
      stroke(C_BORDER);
      doc.setLineWidth(0.15);
      doc.rect(MARGIN_MM, y, contentWidth, rowH, "S");
      doc.line(valX, y, valX, y + rowH);

      doc.setFontSize(fontSize);
      let ty = y + pad + lineH * 0.72;
      doc.setFont(FONT, "bold");
      ink(C_TEXT);
      for(const ln of labelLines){ drawText(ln, MARGIN_MM + pad, ty); ty += lineH; }
      ty = y + pad + lineH * 0.72;
      doc.setFont(FONT, "normal");
      ink(C_MUTED);
      for(const ln of valueLines){ drawText(ln, valX + pad, ty); ty += lineH; }
      y += rowH;
    });
    y += 3;
    ink(C_TEXT);
    doc.setFont(FONT, "normal");
    doc.setFontSize(10);
  };

  // The grouped dentition table — category columns × anatomical group rows,
  // tooth numbers coloured by status (content = bold accent, problem =
  // bold-italic red, empty = muted). Followed by the emphasis legend.
  const drawToothTable = (tt: PdfToothTable) => {
    const nCols = tt.columns.length;
    if(nCols === 0 || tt.rows.length === 0) return;
    const fontSize = 8;
    const lineH = fontSize * 0.5;
    const pad = 1.6;
    // Wider label column + wrapping (below) so a long group label ("Upper right
    // posterior") doesn't overflow into the first data cell.
    const labelW = 34;
    const catW = (contentWidth - labelW) / nCols;
    const mmPerChar = (1.7 * fontSize) / 10;
    const budget = (colW: number) => Math.max(4, Math.floor((colW - pad * 2) / mmPerChar));
    type Tok = { text: string; status: string };
    const layout = (arr: PdfToothTableCell[]): Tok[][] => {
      const b = budget(catW);
      const lines: Tok[][] = [[]];
      arr.forEach((c, i) => {
        const tok = c.label + (i < arr.length - 1 ? "," : "");
        const line = lines[lines.length - 1];
        const curChars = line.reduce((a, t) => a + t.text.length + 1, 0);
        if(curChars + tok.length + 1 > b && line.length) lines.push([]);
        lines[lines.length - 1].push({ text: tok, status: c.status });
      });
      return lines;
    };

    // Header row.
    const headerH = lineH + pad * 2;
    ensureSpace(headerH + 4);
    fill(C_HEADER);
    doc.rect(MARGIN_MM, y, contentWidth, headerH, "F");
    ink(C_HEADER_TEXT);
    doc.setFont(FONT, "bold");
    doc.setFontSize(fontSize);
    tt.columns.forEach((col, ci) => drawText(col.label, MARGIN_MM + labelW + ci * catW + pad, y + pad + lineH * 0.72));
    y += headerH;

    // Group rows.
    const labelBudget = budget(labelW);
    tt.rows.forEach((row, ri) => {
      const cellLines = tt.columns.map((col) => layout(row.cells[col.key] ?? []));
      const labelLines = wrapPlainText(row.label, labelBudget);
      const nLines = Math.max(1, labelLines.length, ...cellLines.map((l) => l.length));
      const rowH = nLines * lineH + pad * 2;
      if(y + rowH > pageHeight - MARGIN_MM){ doc.addPage(); y = MARGIN_MM; }
      fill(C_LABEL_BG);
      doc.rect(MARGIN_MM, y, labelW, rowH, "F");
      fill(ri % 2 ? C_ROW_ALT : C_ROW_BG);
      doc.rect(MARGIN_MM + labelW, y, contentWidth - labelW, rowH, "F");
      stroke(C_BORDER);
      doc.setLineWidth(0.15);
      doc.rect(MARGIN_MM, y, contentWidth, rowH, "S");
      doc.line(MARGIN_MM + labelW, y, MARGIN_MM + labelW, y + rowH);
      for(let ci = 1; ci < nCols; ci++){ const x = MARGIN_MM + labelW + ci * catW; doc.line(x, y, x, y + rowH); }
      doc.setFont(FONT, "bold");
      doc.setFontSize(fontSize);
      ink(C_TEXT);
      labelLines.forEach((ln, li) => drawText(ln, MARGIN_MM + pad, y + pad + lineH * (li + 0.72)));
      tt.columns.forEach((col, ci) => {
        const cellX = MARGIN_MM + labelW + ci * catW;
        cellLines[ci].forEach((line, li) => {
          let tx = cellX + pad;
          const ty = y + pad + lineH * (li + 0.72);
          for(const tk of line){
            if(tk.status === "problem"){ doc.setFont(FONT, "bolditalic"); ink(C_PROBLEM); }
            else if(tk.status === "content"){ doc.setFont(FONT, "bold"); ink(C_HEADER); }
            else { doc.setFont(FONT, "normal"); ink(C_MUTED); }
            drawText(tk.text, tx, ty);
            tx += (tk.text.length + 1) * mmPerChar;
          }
        });
      });
      y += rowH;
    });

    // Emphasis legend.
    y += 1;
    doc.setFont(FONT, "italic");
    doc.setFontSize(7);
    ink(C_MUTED);
    for(const ln of wrapPlainText(tt.legend, Math.max(20, Math.floor(contentWidth / 1.3)))){ ensureSpace(3.4); drawText(ln, MARGIN_MM, y + 2.4); y += 3.4; }
    y += 2;
    ink(C_TEXT);
    doc.setFont(FONT, "normal");
    doc.setFontSize(10);
  };

  const image = (png: string, size?: PdfImageSize, border?: { widthMm: number; color: RGB } | null) => {
    if(!png) return;
    const aspect = size && size.width > 0 ? size.height / size.width : DEFAULT_IMAGE_ASPECT;
    const imgWidth = contentWidth;
    const maxImgHeight = pageHeight - MARGIN_MM * 2;
    const imgHeight = Math.min(maxImgHeight, imgWidth * aspect);
    ensureSpace(imgHeight);
    doc.addImage(png, "PNG", MARGIN_MM, y, imgWidth, imgHeight);
    // Optional frame around the chart.
    if(border){
      doc.setDrawColor(border.color[0], border.color[1], border.color[2]);
      doc.setLineWidth(border.widthMm);
      doc.rect(MARGIN_MM, y, imgWidth, imgHeight, "S");
    }
    y += imgHeight + LINE_HEIGHT_MM;
  };

  // Document title at the very top (once), with an accent rule under it.
  const documentTitle = (title: string) => {
    if(!title) return;
    ink(C_HEADER);
    doc.setFontSize(20);
    doc.setFont(FONT, "bold");
    drawText(title, MARGIN_MM, y + 7);
    y += 10;
    stroke(C_HEADER);
    doc.setLineWidth(0.6);
    doc.line(MARGIN_MM, y, MARGIN_MM + contentWidth, y);
    y += 6;
    ink(C_TEXT);
    doc.setFont(FONT, "normal");
    doc.setFontSize(10);
  };

  // End-of-document footer — disclaimer + generation/version stamp with GitHub
  // + DOI attribution links. Anchored to the bottom of the last page.
  const footerBlock = (f: PdfFooter) => {
    const lineH = 3.6;
    const discBudget = Math.max(20, Math.floor(contentWidth / 1.35));
    const discLines = f.disclaimer ? wrapPlainText(f.disclaimer, discBudget) : [];
    const genLines = (f.generated ? 1 : 0) + (f.repoUrl ? 1 : 0) + (f.doi ? 1 : 0);
    // Disclaimer and generator stamp are independently toggled — skip whichever
    // is empty, and the whole block (incl. separator) if both are.
    if(discLines.length === 0 && genLines === 0) return;
    const gap = discLines.length && genLines ? 2 : 0;
    const blockH = 3 + discLines.length * lineH + gap + genLines * lineH + 2;
    if(y + 8 + blockH > pageHeight - MARGIN_MM){ doc.addPage(); y = MARGIN_MM; }
    y = Math.max(y + 8, pageHeight - MARGIN_MM - blockH);
    stroke(C_BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_MM, y, MARGIN_MM + contentWidth, y);
    y += 3;
    doc.setFontSize(7.5);
    if(discLines.length){
      doc.setFont(FONT, "italic");
      ink(C_MUTED);
      for(const ln of discLines){ drawText(ln, MARGIN_MM, y + 2.6); y += lineH; }
    }
    if(genLines){
      if(discLines.length) y += 2;
      doc.setFont(FONT, "normal");
      ink(C_MUTED);
      if(f.generated){ drawText(f.generated, MARGIN_MM, y + 2.6); y += lineH; }
      ink(C_HEADER);
      if(f.repoUrl){ drawText(`GitHub: ${f.repoUrl}`, MARGIN_MM, y + 2.6); y += lineH; }
      if(f.doi){ drawText(`DOI: ${f.doi}`, MARGIN_MM, y + 2.6); y += lineH; }
    }
    ink(C_TEXT);
  };

  documentTitle(data.reportTitle);

  if(opts.patientData){
    sectionBar(t("pdf.section.patientData"));
    // Rows are pre-built by exportPdf per the PDF settings (default name/DOB
    // fallbacks, age toggle, date format).
    table(data.patient, { labelWidth: 45, fontSize: 10 });
  }

  if(opts.odontogramChart || opts.odontogramDescription){
    sectionBar(t("pdf.section.odontogram"));
    if(opts.odontogramChart) image(data.odontogramPng, data.odontogramImageSize, data.odontogramBorder);
    if(opts.odontogramDescription){
      caption(data.odontogramCaption);
      // Grouped dentition table between the overview caption and the per-axis
      // findings table (rendered only when the caller supplies it).
      if(data.toothTable) drawToothTable(data.toothTable);
    }
  }

  // The per-axis findings (caries, endo, diagnoses, wear, …) get their own
  // titled section, a label/value table merging both fields.
  if(opts.odontogramDescription && data.odontogramFindings.length){
    sectionBar(t("pdf.section.findings"));
    table(data.odontogramFindings, { labelWidth: 48, fontSize: 9 });
  }

  if(opts.individualNotes && data.individualNotes.length){
    sectionBar(t("toothInfo.notes"));
    table(data.individualNotes, { labelWidth: 24, fontSize: 9 });
  }

  if(data.hasPerio && opts.perioStatus){
    // The periodontal-status chart always starts on its own page — it is a
    // full-width diagram and reads far better without the odontogram section
    // crowding above it. Only break when the current page already has content
    // (so a perio-only report doesn't open with a blank first page).
    if(y > MARGIN_MM){ doc.addPage(); y = MARGIN_MM; }
    sectionBar(t("pdf.section.perioStatus"));
    image(data.perioPng, data.perioImageSize);
  }

  if(data.hasPerio && opts.perioDescription){
    // The metrics table and the abbreviation glossary are each independently
    // toggleable — an empty array skips that whole sub-section.
    if(data.perioMetrics.length){
      sectionBar(t("pdf.section.perioDescription"));
      table(data.perioMetrics, { labelWidth: 55, fontSize: 9.5 });
    }
    if(data.abbreviations.length){
      // Abbreviation glossary — smaller font, bold term (in the label cell).
      sectionBar(t("pdf.footer.title"));
      table(data.abbreviations.map((a) => ({ label: a.term, value: a.desc })), { labelWidth: 22, fontSize: 7.5 });
    }
  }

  footerBlock(data.footer);

  doc.save(`odontogram-report-${pdfStamp()}.pdf`);
  return doc;
}
