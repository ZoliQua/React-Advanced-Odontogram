// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// `buildPerioSvg()` renders the FULL perio chart (teeth graphic + numeric
// rows) as one standalone vector SVG, built headlessly from state rather than
// from the mounted `PerioChart` DOM. `exportPerioSvg`/`exportPerioImage` and
// the PDF report consume it.
//
// It reuses perioGraphic.ts's builders (`archToothLayout`,
// `buildBuccalArchSvg`/`buildPalatalArchSvg`, `perioCurve`/
// `buildPerioCurveLayer`, `loadTemplateCache`) — the same template-cache
// loader PerioChart.tsx awaits. A load failure returns `null` rather than
// throwing (the graphic is a presentation enhancement, never a hard
// dependency).
//
// Numeric rows are emitted as native `<text>` elements positioned via the
// same `archToothLayout` columns the arch SVGs are built from, so a tooth's
// numbers always sit under/over that tooth's crown. Row order, value sources,
// and gating mirror PerioChart.tsx's live grid: `getPerioRowVisibility()` per
// row, `indexName()` for labels, and the mPI/mBI implant-gate (a row renders
// only in an arch with at least one implant tooth).
//
// A value renders only when it is actually charted: an uncharted
// site/surface/axis emits no `<text>` at all (no placeholder dash), keeping
// the exported vector clean.
import {
  archToothLayout,
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  buildPerioCurveLayer,
  perioCurve,
  loadTemplateCache,
  PERIO_MM_PX,
  type ArchLayout,
  type PerioCurveSite,
  type TemplateDocCache,
} from "./perioGraphic";
import {
  getCejVisibility, getGingivalIndex, getGingivalThickness, getKeratinizedWidth, getMillerClass, getPeriImplantBleeding, getPeriImplantPlaque, getPerioToothKind, getPlaqueIndex, getRootConcavity, getToothCal, getToothFurcation, getToothMobility, getToothPerio, getToothPlaque, isPerioRowHidden, isToothImplant,
} from "./state/perio";
import {
  getPerioRowVisibility,
} from "./state/perioSettings";
import {
  furcationEntrances, type PerioSite,
} from "./state/payload";
import {
  isUpperTooth,
} from "./anatomy/profiles";
import { formatToothLabel } from "./state/numbering";
import { indexName } from "./perioIndexNames";
import { t } from "./i18n/useI18n";

const SVG_NS = "http://www.w3.org/2000/svg";

// The two arches in visual left-to-right order. Neither array is exported from
// odontogram.ts/perioGraphic.ts, so it is duplicated locally (as PerioChart.tsx
// and bridgeOverlay.ts also do). Array-adjacent == visually adjacent within an arch.
const UPPER_ARCH: readonly number[] = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH: readonly number[] = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// The buccal and lingual probing sites, duplicated locally (also in PerioChart.tsx).
const BUCCAL_SITES: readonly PerioSite[] = ["MB", "B", "DB"];
const LINGUAL_SITES: readonly PerioSite[] = ["ML", "L", "DL"];

// The 4 fixed O'Leary surfaces shared by plaque/PI/GI/mPI/mBI.
const PLAQUE_SURFACES: readonly string[] = ["mesial", "distal", "buccal", "lingual"];
// Faint surface-letter guide (dental-standard M/D/B/L) drawn behind each
// plaque/grade value, mirroring the on-screen watermark.
const SURFACE_LETTER: Record<string, string> = { mesial: "M", distal: "D", buccal: "B", lingual: "L" };

// Compact display faces for the categorical/graded rows — duplicated locally
// (PerioChart.tsx keeps equivalent private maps); display-only, since this
// module renders its own standalone `<text>` rather than cycle-button labels.
const FURCATION_ROMAN: readonly string[] = ["–", "I", "II", "III", "IV"];
const GRADE_FACE: Record<number, string> = { 1: "1", 2: "2", 3: "3" };
const MOBILITY_FACE: Record<string, string> = { m1: "1", m2: "2", m3: "3" };
const CEJ_FACE: Record<string, string> = { detectable: "D", "not-detectable": "ND" };
const ROOT_CONCAVITY_FACE: Record<string, string> = { mild: "Mi", deep: "Dp" };
const GT_FACE: Record<string, string> = { thin: "Tn", medium: "Md", thick: "Tk" };
const MILLER_FACE: Record<string, string> = { i: "I", ii: "II", iii: "III", iv: "IV" };

/** Left column width (svg user units) reserved for the row-label text, so a
 *  wide label ("Peri-implant Bleeding Index (mBI)") still has room before the
 *  tooth columns start at `LABEL_WIDTH`. */
const LABEL_WIDTH = 150;
/** Vertical advance (svg user units) per numeric row + row-label/value font
 *  size. `buildPerioSvg` sets these per call from the PDF perio font-size
 *  setting (default "normal" = 8/13). Every `text()`/append-helper reads them. */
let ROW_HEIGHT = 13;
let ROW_FONT_SIZE = 8;
/** When true, a numeric row with no charted value anywhere is skipped entirely
 *  (label + row). Default false = always show the row. */
let perioSkipEmptyRows = false;
/** y-baseline + width of each numeric row actually emitted — collected by the
 *  append helpers, consumed by `buildPerioSvg` to paint the alternating
 *  row-stripe backgrounds behind the content. */
let perioStripeBands: { y: number; w: number }[] = [];
/** Extra vertical gap (svg user units) between one arch's block and the next
 *  (or the trailing classification block). */
const SECTION_GAP = 6;

/** Inline stylesheet embedded into the exported SVG. The perio curve/mm-grid
 *  elements (`perio-curve-*`, `perio-mm-*`) are styled by CSS CLASSES only (no
 *  inline presentation attributes) — fine on the live, stylesheet-backed page,
 *  but a standalone SVG rasterized without the app CSS falls back to SVG
 *  defaults (a solid-BLACK curve band, invisible mm guide lines, and huge
 *  default-font mm labels). Embedding the exact light-theme rules from
 *  `index.css` as a `<style>` inside the SVG restores the on-screen look in the
 *  PDF/PNG/JPG/SVG exports (the browser applies an SVG's internal stylesheet
 *  when it rasterizes it, and a root `<style>` cascades into the nested arch
 *  `<svg>`s too). Light-theme values only — the report background is white. */
const PERIO_EXPORT_STYLE = `
.perio-curve-cej{ stroke:#e11d48; stroke-width:0.8; opacity:0.85; }
.perio-curve-band{ fill:#3b82f6; fill-opacity:0.18; stroke:none; }
.perio-curve-margin{ fill:none; stroke:#f472b6; stroke-width:0.9; stroke-linejoin:round; stroke-linecap:round; }
.perio-curve-pocket{ fill:none; stroke:#1d4ed8; stroke-width:1.1; stroke-linejoin:round; stroke-linecap:round; }
.perio-mm-line{ stroke:#94a3b8; fill:none; }
.perio-mm-line-minor{ stroke-width:0.35; opacity:0.28; }
.perio-mm-line-major{ stroke-width:0.6; opacity:0.5; }
.perio-mm-label{ fill:#64748b; font-size:5px; font-weight:600; opacity:0.7; dominant-baseline:middle; }
.perio-row-stripe{ fill:#f1f5f9; }
.perio-col-sep{ stroke:#cbd5e1; stroke-width:0.3; opacity:0.55; }
.perio-surface-letter{ fill:#94a3b8; font-weight:700; opacity:0.5; }
`;

/** Trim trailing float noise for readable coordinate strings (purely
 *  cosmetic — mirrors `perioGraphic.ts`'s own `fmt`). */
function fmt(n: number): string {
  return Number(n.toFixed(3)).toString();
}

function text(x: number, y: number, content: string, anchor: "start" | "middle" | "end" = "middle"): SVGTextElement {
  const el = document.createElementNS(SVG_NS, "text") as unknown as SVGTextElement;
  el.setAttribute("x", fmt(x));
  el.setAttribute("y", fmt(y));
  el.setAttribute("font-size", String(ROW_FONT_SIZE));
  el.setAttribute("text-anchor", anchor);
  el.textContent = content;
  return el;
}

function appendRowLabel(root: Element, y: number, label: string): void {
  if (!label) return;
  root.appendChild(text(4, y, label, "start"));
}

/** Append one site-subdivided row (PD/GM/CAL/BOP) — up to 3 sub-columns per
 *  tooth, spread across the tooth's width via the same fraction formula the
 *  curve/overlay marks use (`x + width*(j+0.5)/n`), so a site's number sits
 *  exactly where that site's curve point / overlay mark lands. `valueFor`
 *  returning `null` means "not charted" — no `<text>` is emitted for it. */
function appendSiteRow(
  root: Element,
  y: number,
  label: string,
  layout: ArchLayout,
  sites: readonly PerioSite[],
  valueFor: (toothNo: number, site: PerioSite) => string | null,
): boolean {
  const items: { x: number; v: string }[] = [];
  for (const tooth of layout.teeth) {
    sites.forEach((site, j) => {
      const v = valueFor(tooth.toothNo, site);
      if (v === null) return;
      items.push({ x: LABEL_WIDTH + tooth.x + (tooth.width * (j + 0.5)) / sites.length, v });
    });
  }
  if (perioSkipEmptyRows && items.length === 0) return false;
  perioStripeBands.push({ y, w: LABEL_WIDTH + layout.totalWidth });
  appendRowLabel(root, y, label);
  for (const it of items) root.appendChild(text(it.x, y, it.v));
  return true;
}

/** Append one 4-surface diamond row (Plaque/PI/GI/mPI/mBI) — mirrors
 *  `appendSiteRow` but spread over `PLAQUE_SURFACES` (mesial/distal/buccal/
 *  lingual) instead of probing sites. */
function appendSurfaceRow(
  root: Element,
  y: number,
  label: string,
  layout: ArchLayout,
  valueFor: (toothNo: number, surface: string) => string | null,
): boolean {
  const items: { x: number; v: string }[] = [];
  const guides: { x: number; letter: string }[] = [];
  for (const tooth of layout.teeth) {
    PLAQUE_SURFACES.forEach((surface, j) => {
      const x = LABEL_WIDTH + tooth.x + (tooth.width * (j + 0.5)) / PLAQUE_SURFACES.length;
      guides.push({ x, letter: SURFACE_LETTER[surface] ?? "" });
      const v = valueFor(tooth.toothNo, surface);
      if (v !== null) items.push({ x, v });
    });
  }
  if (perioSkipEmptyRows && items.length === 0) return false;
  perioStripeBands.push({ y, w: LABEL_WIDTH + layout.totalWidth });
  appendRowLabel(root, y, label);
  // Faint per-surface letter behind each value (M/D/B/L).
  for (const g of guides) {
    const el = text(g.x, y, g.letter);
    el.setAttribute("class", "perio-surface-letter");
    root.appendChild(el);
  }
  for (const it of items) root.appendChild(text(it.x, y, it.v));
  return true;
}

/** Append one single-value-per-tooth row (Miller/mobility/CEJ/root
 *  concavity/KG/GT) — centered on the tooth, no site/surface subdivision. */
function appendSingleRow(
  root: Element,
  y: number,
  label: string,
  layout: ArchLayout,
  valueFor: (toothNo: number) => string | null,
): boolean {
  const items: { x: number; v: string }[] = [];
  for (const tooth of layout.teeth) {
    const v = valueFor(tooth.toothNo);
    if (v === null) continue;
    items.push({ x: LABEL_WIDTH + tooth.x + tooth.width / 2, v });
  }
  if (perioSkipEmptyRows && items.length === 0) return false;
  perioStripeBands.push({ y, w: LABEL_WIDTH + layout.totalWidth });
  appendRowLabel(root, y, label);
  for (const it of items) root.appendChild(text(it.x, y, it.v));
  return true;
}

/** Append the furcation row — a tooth with no furcated entrance for its
 *  position, OR whose perio rows are hidden (`isPerioRowHidden` —
 *  missing/implant/under-gum/extraction), gets NO marks at all (not even a "–"
 *  placeholder), unlike the graded-index rows above. An existing-but-ungraded
 *  entrance still gets its "–" face (`FURCATION_ROMAN[0]`), since the entrance's
 *  positional existence is itself informative. */
function appendFurcationRow(root: Element, y: number, label: string, layout: ArchLayout): boolean {
  const items: { x: number; v: string }[] = [];
  for (const tooth of layout.teeth) {
    const entrances = furcationEntrances(tooth.toothNo);
    if (entrances.length === 0 || isPerioRowHidden(tooth.toothNo)) continue;
    const furc = getToothFurcation(tooth.toothNo);
    entrances.forEach((entrance, j) => {
      const grade = furc[entrance] ?? 0;
      items.push({ x: LABEL_WIDTH + tooth.x + (tooth.width * (j + 0.5)) / entrances.length, v: FURCATION_ROMAN[grade] ?? "–" });
    });
  }
  if (perioSkipEmptyRows && items.length === 0) return false;
  perioStripeBands.push({ y, w: LABEL_WIDTH + layout.totalWidth });
  appendRowLabel(root, y, label);
  for (const it of items) root.appendChild(text(it.x, y, it.v));
  return true;
}

/** Build one aspect's arch graphic (buccal or palatal) — the standalone
 *  `<svg>` from `buildBuccalArchSvg`/`buildPalatalArchSvg` (own `viewBox`,
 *  already carrying its own mm-grid layer), positioned as a nested `<svg>` at
 *  `(LABEL_WIDTH, y)` with `width`/`height` set 1:1 to its `viewBox` dimensions
 *  (no rescale), so its internal x=0 column lines up exactly under `LABEL_WIDTH
 *  + tooth.x`, the offset every numeric row/curve x uses. The curve overlay is
 *  then built and appended into the same oriented row group the teeth ride
 *  (`.perio-tooth-row-buccal` / `.perio-tooth-row-palatal-inner`), so the curve
 *  rides the same flip/mirror transforms as the teeth. Returns the vertical
 *  space (svg user units) the graphic consumed, so the caller can advance its
 *  row cursor. */
function appendArchGraphic(
  root: Element,
  cache: TemplateDocCache,
  teeth: readonly number[],
  layout: ArchLayout,
  y: number,
  aspect: "buccal" | "palatal",
  gap: number,
): number {
  // Build the arch artwork with the same inter-tooth gap the number rows were
  // re-spaced with, so the teeth and every value column share one geometry.
  const svg =
    aspect === "buccal"
      ? buildBuccalArchSvg(cache, teeth, isToothImplant, gap, getPerioToothKind)
      : buildPalatalArchSvg(cache, teeth, isToothImplant, gap, getPerioToothKind);

  const vb = (svg.getAttribute("viewBox") || "0 0 1 1").trim().split(/\s+/).map(Number);
  const vbW = vb[2] ?? Math.max(layout.totalWidth, 1);
  const vbH = vb[3] ?? 1;
  svg.setAttribute("x", fmt(LABEL_WIDTH));
  svg.setAttribute("y", fmt(y));
  svg.setAttribute("width", fmt(vbW));
  svg.setAttribute("height", fmt(vbH));

  const rowSelector = aspect === "buccal" ? ".perio-tooth-row-buccal" : ".perio-tooth-row-palatal-inner";
  const rowGroup = svg.querySelector(rowSelector) ?? svg;
  const sites = aspect === "buccal" ? BUCCAL_SITES : LINGUAL_SITES;

  const curveSites: PerioCurveSite[] = [];
  const xs: number[] = [];
  for (const tooth of layout.teeth) {
    // A missing/extraction-socket tooth has no crown to probe — draw no curve
    // over its (now empty) column, even if stale perio data lingers.
    if (getPerioToothKind(tooth.toothNo) === "missing") {
      sites.forEach((site, j) => { curveSites.push({ site, pd: undefined, gm: undefined }); xs.push(tooth.x + (tooth.width * (j + 0.5)) / 3); });
      continue;
    }
    const perio = getToothPerio(tooth.toothNo);
    // If a tooth has any charted site on this aspect, treat its remaining sites
    // as 0 (pd=0, gm=0) so the curve is drawn fully across the tooth instead of
    // stopping mid-tooth at the first uncharted site.
    const anyCharted = sites.some((s) => Object.prototype.hasOwnProperty.call(perio.pd, s));
    sites.forEach((site, j) => {
      const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
      const pd = charted ? perio.pd[site] : (anyCharted ? 0 : undefined);
      const gm = pd === undefined ? undefined
        : (Object.prototype.hasOwnProperty.call(perio.gm, site) ? perio.gm[site] : 0);
      curveSites.push({ site, pd, gm });
      xs.push(tooth.x + (tooth.width * (j + 0.5)) / 3);
    });
  }
  const curve = perioCurve(curveSites, { cejY: layout.cejY, mmPx: PERIO_MM_PX, siteX: (i) => xs[i] });
  const curveLayer = buildPerioCurveLayer(curve, {
    width: layout.totalWidth,
    className: aspect === "buccal" ? "perio-curve perio-curve-buccal" : "perio-curve perio-curve-palatal",
  });
  rowGroup.appendChild(curveLayer);

  root.appendChild(svg);
  return vbH;
}

/**
 * Build the FULL perio chart (teeth graphic + numeric rows) as one standalone
 * vector SVG, from the active chart's state — headless, no mounted DOM read.
 * Returns `null` when the shared tooth-template cache (`loadTemplateCache()`)
 * fails to load (templates are inlined, so this is only an internal parse
 * fault — the guard is defensive).
 */
export async function buildPerioSvg(opts: {
  fontSize?: number;
  rowHeight?: number;
  toothGap?: number;
  showEmptyRows?: boolean;
  labelPlacement?: "center" | "edge";
} = {}): Promise<{ xml: string; width: number; height: number } | null> {
  let cache: TemplateDocCache;
  try {
    cache = await loadTemplateCache();
  } catch {
    return null;
  }

  // Apply the perio PDF settings (font size, row height, empty-row skipping) via
  // the shared module state the text/append helpers read. Defaults: "normal"
  // font (8/13), show all rows, wide spacing, centered band labels.
  ROW_FONT_SIZE = opts.fontSize ?? 8;
  ROW_HEIGHT = opts.rowHeight ?? 13;
  perioSkipEmptyRows = opts.showEmptyRows === false;
  const toothGap = opts.toothGap ?? 2;
  const labelPlacement = opts.labelPlacement ?? "center";
  /** Re-space a raw arch layout with the requested inter-tooth gap (default 2 =
   *  the on-screen TOOTH_GAP, i.e. "wide"; smaller/negative packs teeth closer,
   *  shrinking the chart width so it scales up taller in the PDF). */
  const respace = (l: ArchLayout): ArchLayout => {
    let x = 0;
    const teeth = l.teeth.map((tt) => { const nt = { ...tt, x }; x += tt.width + toothGap; return nt; });
    return { ...l, teeth, totalWidth: x };
  };

  const svg = document.createElementNS(SVG_NS, "svg") as unknown as SVGSVGElement;
  // Embed the perio curve/mm-grid stylesheet so the standalone SVG rasterizes
  // with the on-screen look (translucent blue band, faint mm guide lines, small
  // mm labels) instead of the CSS-less SVG defaults (solid black band, no grid).
  const styleEl = document.createElementNS(SVG_NS, "style");
  styleEl.textContent = PERIO_EXPORT_STYLE;
  svg.appendChild(styleEl);
  // A background layer appended before all content so its row-stripes + column
  // separators paint behind the teeth/numbers.
  const bgLayer = document.createElementNS(SVG_NS, "g");
  bgLayer.setAttribute("aria-hidden", "true");
  svg.appendChild(bgLayer);
  perioStripeBands = [];

  let cursorY = ROW_HEIGHT;
  let maxWidth = LABEL_WIDTH;
  const visible = getPerioRowVisibility();

  const buildOneArch = (teeth: readonly number[]) => {
    const layout = respace(archToothLayout(cache, teeth));
    if (layout.teeth.length === 0) return;
    maxWidth = Math.max(maxWidth, LABEL_WIDTH + layout.totalWidth);
    const isUpper = isUpperTooth(teeth[0]);
    const buccalLabel = t("perio.buccal");
    const lingualLabel = isUpper ? t("perio.palatal") : t("perio.lingual");
    const archHasImplant = teeth.some((n) => isToothImplant(n));

    // Centered arch title ("Upper Teeth" / "Lower Teeth").
    const archTitle = text(LABEL_WIDTH + layout.totalWidth / 2, cursorY, isUpper ? t("perio.export.upperTeeth") : t("perio.export.lowerTeeth"), "middle");
    archTitle.setAttribute("font-weight", "700");
    archTitle.setAttribute("font-size", String(ROW_FONT_SIZE * 1.15));
    svg.appendChild(archTitle);
    cursorY += ROW_HEIGHT;
    // Column separators span from the top of the header row down to the last row.
    const archStartY = cursorY - ROW_HEIGHT * 0.7;

    // --- Tooth-number header row (chrome, always present, not gated). ---
    for (const tooth of layout.teeth) {
      const x = LABEL_WIDTH + tooth.x + tooth.width / 2;
      svg.appendChild(text(x, cursorY, formatToothLabel(tooth.toothNo)));
    }
    cursorY += ROW_HEIGHT;

    // --- Miller-class row (top, near the buccal aspect). ---
    if (visible.miller) {
      if (appendSingleRow(svg, cursorY, indexName("miller"), layout, (n) => {
        const v = getMillerClass(n);
        return v === "none" ? null : MILLER_FACE[v] ?? v;
      })) cursorY += ROW_HEIGHT;
    }

    // --- Buccal-aspect rows, PD nearest the teeth (append order: BOP, CAL, GM, PD). ---
    if (visible.bop) {
      if (appendSiteRow(svg, cursorY, `${buccalLabel} ${indexName("bop")}`, layout, BUCCAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        return charted && perio.bop.includes(site) ? "•" : null;
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.cal) {
      if (appendSiteRow(svg, cursorY, `${buccalLabel} ${indexName("cal")}`, layout, BUCCAL_SITES, (n, site) => {
        const v = getToothCal(n).get(site);
        return v === undefined ? null : String(v);
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.gm) {
      if (appendSiteRow(svg, cursorY, `${buccalLabel} ${indexName("gm")}`, layout, BUCCAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        if (!charted || !Object.prototype.hasOwnProperty.call(perio.gm, site)) return null;
        return String(perio.gm[site]);
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.pd) {
      if (appendSiteRow(svg, cursorY, `${buccalLabel} ${indexName("pd")}`, layout, BUCCAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        return charted ? String(perio.pd[site]) : null;
      })) cursorY += ROW_HEIGHT;
    }

    // --- Furcation row, nearest the teeth (just above the buccal graphic). ---
    if (visible.furcation) {
      if (appendFurcationRow(svg, cursorY, indexName("furcation"), layout)) cursorY += ROW_HEIGHT;
    }

    // --- BUCCAL tooth-row graphic + curve overlay. ---
    cursorY += appendArchGraphic(svg, cache, teeth, layout, cursorY, "buccal", toothGap);

    // --- Band-orientation legend: buccal aspect above, lingual/palatal below.
    //     Chrome only. "center" (default) puts a centered "▲ Buccal ▲" above the
    //     Plaque row and a centered "▼ Lingual/Palatal ▼" below the GI row;
    //     "edge" uses a single row (buccal left, lingual right). ---
    const bandBuccal = t("perio.band.buccal");
    const bandLingual = t("perio.band.lingual");
    const bandCenterX = LABEL_WIDTH + layout.totalWidth / 2;
    if (labelPlacement === "center") {
      svg.appendChild(text(bandCenterX, cursorY, `▲ ${bandBuccal} ▲`, "middle"));
    } else {
      svg.appendChild(text(4, cursorY, `▲ ${bandBuccal}`, "start"));
      svg.appendChild(text(LABEL_WIDTH + layout.totalWidth, cursorY, `${bandLingual} ▼`, "end"));
    }
    cursorY += ROW_HEIGHT;

    // --- Central perio index band: Plaque -> PI -> GI -> mPI -> mBI. ---
    if (visible.plaque) {
      if (appendSurfaceRow(svg, cursorY, indexName("plaque"), layout, (n, surface) =>
        getToothPlaque(n).includes(surface) ? "•" : null,
      )) cursorY += ROW_HEIGHT;
    }
    if (visible.pi) {
      if (appendSurfaceRow(svg, cursorY, indexName("pi"), layout, (n, surface) => {
        const g = getPlaqueIndex(n, surface);
        return g > 0 ? GRADE_FACE[g] ?? String(g) : null;
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.gi) {
      if (appendSurfaceRow(svg, cursorY, indexName("gi"), layout, (n, surface) => {
        const g = getGingivalIndex(n, surface);
        return g > 0 ? GRADE_FACE[g] ?? String(g) : null;
      })) cursorY += ROW_HEIGHT;
    }
    // Centered lingual/palatal band label, below the GI row.
    if (labelPlacement === "center") {
      svg.appendChild(text(bandCenterX, cursorY, `▼ ${bandLingual} ▼`, "middle"));
      cursorY += ROW_HEIGHT;
    }
    // Implant-gate: mPI/mBI render only in an arch with >= 1 implant tooth.
    if (visible.mpi && archHasImplant) {
      if (appendSurfaceRow(svg, cursorY, indexName("mpi"), layout, (n, surface) => {
        const g = getPeriImplantPlaque(n, surface);
        return g > 0 ? GRADE_FACE[g] ?? String(g) : null;
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.mbi && archHasImplant) {
      if (appendSurfaceRow(svg, cursorY, indexName("mbi"), layout, (n, surface) => {
        const g = getPeriImplantBleeding(n, surface);
        return g > 0 ? GRADE_FACE[g] ?? String(g) : null;
      })) cursorY += ROW_HEIGHT;
    }

    // --- PALATAL tooth-row graphic + curve overlay. ---
    cursorY += appendArchGraphic(svg, cache, teeth, layout, cursorY, "palatal", toothGap);

    // --- Palatal-aspect rows, PD nearest the teeth (append order: PD, GM, CAL, BOP). ---
    if (visible.pd) {
      if (appendSiteRow(svg, cursorY, `${lingualLabel} ${indexName("pd")}`, layout, LINGUAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        return charted ? String(perio.pd[site]) : null;
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.gm) {
      if (appendSiteRow(svg, cursorY, `${lingualLabel} ${indexName("gm")}`, layout, LINGUAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        if (!charted || !Object.prototype.hasOwnProperty.call(perio.gm, site)) return null;
        return String(perio.gm[site]);
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.cal) {
      if (appendSiteRow(svg, cursorY, `${lingualLabel} ${indexName("cal")}`, layout, LINGUAL_SITES, (n, site) => {
        const v = getToothCal(n).get(site);
        return v === undefined ? null : String(v);
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.bop) {
      if (appendSiteRow(svg, cursorY, `${lingualLabel} ${indexName("bop")}`, layout, LINGUAL_SITES, (n, site) => {
        const perio = getToothPerio(n);
        const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
        return charted && perio.bop.includes(site) ? "•" : null;
      })) cursorY += ROW_HEIGHT;
    }

    // --- Mobility, CEJ visibility, root concavity, KG, GT (foot rows). ---
    if (visible.mobility) {
      if (appendSingleRow(svg, cursorY, indexName("mobility"), layout, (n) => {
        const v = getToothMobility(n);
        return v === "none" ? null : MOBILITY_FACE[v] ?? v;
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.cej) {
      if (appendSingleRow(svg, cursorY, indexName("cej"), layout, (n) => {
        const v = getCejVisibility(n);
        return v === "none" ? null : CEJ_FACE[v] ?? v;
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.rootConcavity) {
      if (appendSingleRow(svg, cursorY, indexName("rootConcavity"), layout, (n) => {
        const v = getRootConcavity(n);
        return v === "none" ? null : ROOT_CONCAVITY_FACE[v] ?? v;
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.kg) {
      if (appendSingleRow(svg, cursorY, indexName("kg"), layout, (n) => {
        const mm = getKeratinizedWidth(n);
        return mm === null ? null : String(mm);
      })) cursorY += ROW_HEIGHT;
    }
    if (visible.gt) {
      if (appendSingleRow(svg, cursorY, indexName("gt"), layout, (n) => {
        const v = getGingivalThickness(n);
        return v === "unknown" ? null : GT_FACE[v] ?? v;
      })) cursorY += ROW_HEIGHT;
    }

    // Vertical column separators between teeth (left edge of each tooth + the
    // right edge), spanning the arch's numeric block — drawn into the background
    // layer so they sit behind the teeth/numbers.
    const sep = (x: number) => {
      const ln = document.createElementNS(SVG_NS, "line");
      ln.setAttribute("class", "perio-col-sep");
      ln.setAttribute("x1", fmt(x)); ln.setAttribute("y1", fmt(archStartY));
      ln.setAttribute("x2", fmt(x)); ln.setAttribute("y2", fmt(cursorY));
      bgLayer.appendChild(ln);
    };
    for (const tooth of layout.teeth) sep(LABEL_WIDTH + tooth.x);
    sep(LABEL_WIDTH + layout.totalWidth);

    cursorY += SECTION_GAP;
  };

  buildOneArch(UPPER_ARCH);
  buildOneArch(LOWER_ARCH);

  // Alternating row-stripe backgrounds behind every other emitted numeric row
  // (collected by the append helpers), for readability.
  perioStripeBands.forEach((b, i) => {
    if (i % 2 === 0) return;
    const r = document.createElementNS(SVG_NS, "rect");
    r.setAttribute("class", "perio-row-stripe");
    r.setAttribute("x", "0");
    r.setAttribute("y", fmt(b.y - ROW_HEIGHT * 0.72));
    r.setAttribute("width", fmt(b.w));
    r.setAttribute("height", fmt(ROW_HEIGHT));
    bgLayer.appendChild(r);
  });

  // The 2017 classification (Diagnosis/Stage/Grade/Extent) is intentionally not
  // drawn into the chart image — it already appears in the PDF's "Periodontal
  // description" metrics table.

  const width = maxWidth;
  const height = cursorY;
  svg.setAttribute("viewBox", `0 0 ${fmt(width)} ${fmt(height)}`);
  svg.setAttribute("width", fmt(width));
  svg.setAttribute("height", fmt(height));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(svg)}`;
  return { xml, width, height };
}
