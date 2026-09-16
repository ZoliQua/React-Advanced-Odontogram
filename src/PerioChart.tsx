// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { t } from "./i18n/useI18n";
import { optionsFor } from "./registry/uiOptions";
import {
  PERIO_SITES,
  type PerioSite,
  isUpperTooth,
  formatToothLabel,
  getPerioChart,
  getToothPerio,
  getToothCal,
  getToothRecessionType,
  getPerioSummary,
  setPerioSite,
  getToothMobility,
  setToothMobility,
  furcationEntrances,
  setFurcation,
  getToothFurcation,
  setPlaque,
  getToothPlaque,
  setCejVisibility,
  getCejVisibility,
  setRootConcavity,
  getRootConcavity,
  isPerioRowHidden,
  isToothImplant,
  getPerioToothKind,
  getReadOnly,
  onStateChange,
  nextPerioCell,
  prevPerioCell,
  getPerioOverlayLayer,
  setPerioOverlayLayer,
  getToothAnatomy,
  getPlaqueIndex,
  setPlaqueIndex,
  getGingivalIndex,
  setGingivalIndex,
  getKeratinizedWidth,
  setKeratinizedWidth,
  getGingivalThickness,
  setGingivalThickness,
  getMillerClass,
  setMillerClass,
  getPeriImplantPlaque,
  setPeriImplantPlaque,
  getPeriImplantBleeding,
  setPeriImplantBleeding,
  getPerioRowVisibility,
  getPerioIndexNameMode,
  type PerioCellCoord,
  type PerioOverlayLayer,
  type PerioRowId,
} from "./odontogram";
import { indexName, CANONICAL_INDEX_NAMES } from "./perioIndexNames";
import PerioSidebar from "./PerioSidebar";
import {
  loadTemplateCache,
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  archToothLayout,
  perioCurve,
  buildPerioCurveLayer,
  perioOverlayMarks,
  perioPlaqueMarks,
  perioMmHeatMarks,
  perioCairoMarks,
  perioGradeMarks,
  perioKgMarks,
  buildPerioOverlayLayer,
  PERIO_MM_PX,
  TOOTH_GAP,
  computeFillScale,
  type TemplateDocCache,
  type ArchLayout,
  type PerioCurveSite,
  type PerioOverlaySite,
  type PerioCairoTooth,
  type PerioGradeTooth,
  type PerioKgTooth,
  type SiteOverlayLayer,
  type MmHeatOverlayLayer,
} from "./perioGraphic";

// Width of the sticky left-hand row-label column (px). The arch graphic and
// every number row share ONE CSS grid whose first track is this label column,
// so the tooth columns (tracks 2..N+1) start at the same x in every row. Wide
// enough to hold the longest row-label name ("Peri-implant Bleeding Index
// (mBI)") without truncation; labels that still run longer (several
// translations exceed the English source) wrap onto a second line via
// `.perio-fullgrid-row-label-text` (index.css) instead of clipping, and the
// row grows to fit (grid rows are auto-sized).
const ROW_LABEL_WIDTH = 220;

// Provisional per-tooth column width (px) used until the tooth-template cache
// loads and the real, per-tooth arch-layout widths are applied
// (`applyArchColumns`). Wide enough to hold a 3-site cell so the grid is fully
// usable for charting even when the graphic never loads (e.g. no network in a
// unit test) — the graphic + column alignment is a presentation enhancement,
// never a hard dependency for data entry.
const PROVISIONAL_COL_WIDTH = 46;

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Mirrors `ALL_TEETH` in odontogram.ts (not exported — same duplication
// precedent as `bridgeOverlay.ts`'s UPPER_ARCH/LOWER_ARCH). Array-adjacent ==
// visually adjacent within an arch; the two arches never mix.
const UPPER_ARCH: readonly number[] = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH: readonly number[] = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// Literal (not `PERIO_SITES.slice(...)`) so this module never touches the
// "./odontogram" import at module-eval time — several existing tests mount
// <App/> (which always renders <PerioChart open={false}/> in its tree) with
// a hand-curated `vi.mock("../odontogram", ...)` that doesn't necessarily
// forward every export; every real odontogram.ts call in this file is
// deferred until the `open`-gated effect/handlers actually run (see below),
// so a closed PerioChart never touches the (possibly partially-mocked)
// module at all. Order matches PERIO_SITES' own canonical MB/B/DB/ML/L/DL.
const BUCCAL_SITES: readonly PerioSite[] = ["MB", "B", "DB"];
const LINGUAL_SITES: readonly PerioSite[] = ["ML", "L", "DL"];

// The 4 fixed O'Leary plaque-index surfaces (mirrors VALID_PLAQUE_SURFACE in
// odontogram.ts — literal here for the same module-eval-safety reason as
// BUCCAL_SITES above). Order = the clockwise M/D + B/L quadrant order the
// 4-quadrant plaque mark reads in.
const PLAQUE_SURFACES: readonly string[] = ["mesial", "distal", "buccal", "lingual"];

// Single-letter surface tag shown as a faint watermark behind each
// plaque/PI/GI/mPI/mBI marker square, so which surface a mark belongs to is
// unambiguous. Dental-standard letters — language-neutral, no i18n needed.
const SURFACE_LETTER: Record<string, string> = { mesial: "M", distal: "D", buccal: "B", lingual: "L" };

// Does SURFACE "mesial" sit in the LEFT column of a tooth's diamond
// plaque/grade cell (`.perio-fullgrid-plaque-quad`'s `"mes dis"`
// middle row)? Mesial always points toward the arch midline. UPPER_ARCH/
// LOWER_ARCH (above) lay FDI quadrant 1/4 teeth on the screen-LEFT half of
// their arch (the midline sits at the 11|21 / 41|31 boundary, to their
// right) and quadrant 2/3 teeth on the screen-RIGHT half (midline to their
// left) — so mesial is visually on the LEFT for quadrants 2/3 and on the
// RIGHT for quadrants 1/4.
function mesialOnLeft(toothNo: number): boolean {
  const quadrant = Math.floor(toothNo / 10);
  return quadrant === 2 || quadrant === 3;
}

// The diamond `grid-area` a plaque/grade surface button gets on a given
// tooth. Buccal/lingual are always the top-/bottom-centered tips;
// mesial/distal swap the "mes"/"dis" middle-row columns per `mesialOnLeft`
// so mesial stays toward the midline on both sides of the arch. This only
// decides visual placement — the button's `surface`/`data-*` wiring (set by
// the caller) is unaffected.
function diamondGridArea(surface: string, toothNo: number): "buc" | "mes" | "dis" | "lin" {
  if (surface === "buccal") return "buc";
  if (surface === "lingual") return "lin";
  const onLeft = mesialOnLeft(toothNo);
  if (surface === "mesial") return onLeft ? "mes" : "dis";
  return onLeft ? "dis" : "mes"; // distal
}

// Glickman furcation grade -> Roman-numeral face on the cycle control.
// Index 0 (no involvement) shows the em-dash placeholder, 1-4 show I-IV.
const FURCATION_ROMAN = ["–", "I", "II", "III", "IV"];

// cejVisibility / rootConcavity cycle-button value order + compact face
// glyphs (mirrors FURCATION_ROMAN's role). Literal (not imported from
// "./odontogram") for the same module-eval-safety reason as
// BUCCAL_SITES/PLAQUE_SURFACES above — order matches VALID_CEJ_VISIBILITY /
// VALID_ROOT_CONCAVITY (odontogram.ts) / LOCAL_VALUE_MAPS (codesystems.ts).
const CEJ_VISIBILITY_CYCLE: readonly string[] = ["none", "detectable", "not-detectable"];
const CEJ_VISIBILITY_FACE: Record<string, string> = { none: "–", detectable: "D", "not-detectable": "ND" };
const ROOT_CONCAVITY_CYCLE: readonly string[] = ["none", "mild", "deep"];
const ROOT_CONCAVITY_FACE: Record<string, string> = { none: "–", mild: "Mi", deep: "Dp" };

// gingivalThickness (GT) / millerClass cycle-button value order + compact
// face glyphs — mirrors CEJ_VISIBILITY_CYCLE/ROOT_CONCAVITY_CYCLE above
// exactly. Literal (not imported from "./odontogram") for the same
// module-eval-safety reason as those two — order matches
// VALID_GINGIVAL_THICKNESS / VALID_MILLER_CLASS (odontogram.ts) /
// LOCAL_VALUE_MAPS (fhir/codesystems.ts).
const GINGIVAL_THICKNESS_CYCLE: readonly string[] = ["unknown", "thin", "medium", "thick"];
const GINGIVAL_THICKNESS_FACE: Record<string, string> = { unknown: "–", thin: "Tn", medium: "Md", thick: "Tk" };
const MILLER_CLASS_CYCLE: readonly string[] = ["none", "i", "ii", "iii", "iv"];
const MILLER_CLASS_FACE: Record<string, string> = { none: "–", i: "I", ii: "II", iii: "III", iv: "IV" };

// PI/GI (Silness-Löe Plaque Index / Löe-Silness Gingival Index) per-surface
// graded (0-3) cycle face — 0 (healthy/uncharted, matches
// getPlaqueIndex/getGingivalIndex's own "absence" semantics) shows the
// em-dash placeholder, mirroring FURCATION_ROMAN's role for a graded axis.
const GRADE_FACE: readonly string[] = ["–", "1", "2", "3"];

type PerioSiteData = ReturnType<typeof getToothPerio>;
type PerioSummaryData = ReturnType<typeof getPerioSummary>;

const EMPTY_PERIO: PerioSiteData = { pd: {}, gm: {}, bop: [], sup: [] };
const EMPTY_SUMMARY: PerioSummaryData = {
  chartedSites: 0,
  bleedingSites: 0,
  bopPercent: 0,
  worstCal: null,
  worstCalTooth: null,
  maxPd: null,
  avgPd: null,
  avgCal: null,
  maxFurcation: null,
  plaquePercent: 0,
  piScore: null,
  giScore: null,
  kgDeficientTeeth: 0,
  gtDistribution: { thin: 0, medium: 0, thick: 0 },
  millerDistribution: { i: 0, ii: 0, iii: 0, iv: 0 },
  // Whole-mouth peri-implant means (over implant teeth) — computed by
  // getPerioSummary(); null when nothing is charted (empty-chart default here).
  mpiScore: null,
  mbiScore: null,
};

type ToothCellRefs = {
  pd: Partial<Record<PerioSite, HTMLInputElement>>;
  gm: Partial<Record<PerioSite, HTMLInputElement>>;
  bop: Partial<Record<PerioSite, HTMLInputElement>>;
  cal: Partial<Record<PerioSite, HTMLSpanElement>>;
  mobility: HTMLSelectElement | null;
  // Per-entrance furcation cycle buttons (keyed by entrance string — only the
  // furcated-position entrances exist) and the 4 O'Leary plaque-surface toggle
  // buttons.
  furcation: Partial<Record<string, HTMLButtonElement>>;
  plaque: Partial<Record<string, HTMLButtonElement>>;
  // Single per-tooth cycle button each (no site/entrance subdivision —
  // mirrors `mobility` above, which is also one-per-tooth).
  cejVisibility: HTMLButtonElement | null;
  rootConcavity: HTMLButtonElement | null;
  // PI/GI per-surface (0-3) cycle buttons (keyed by the 4 O'Leary surfaces,
  // mirrors `plaque` above); KG is a single per-tooth mm number input (mirrors
  // `mobility`'s one-per-tooth shape); gingivalThickness/millerClass are
  // single per-tooth cycle buttons (mirror cejVisibility/rootConcavity above).
  pi: Partial<Record<string, HTMLButtonElement>>;
  gi: Partial<Record<string, HTMLButtonElement>>;
  kg: HTMLInputElement | null;
  gingivalThickness: HTMLButtonElement | null;
  millerClass: HTMLButtonElement | null;
  // mPI/mBI per-surface (0-3) cycle buttons — mirror `pi`/`gi` above exactly,
  // but IMPLANT-GATED (see syncToothCells): active only on an implant tooth,
  // inert everywhere else.
  mpi: Partial<Record<string, HTMLButtonElement>>;
  mbi: Partial<Record<string, HTMLButtonElement>>;
};

type GridHandlers = {
  onPd: (toothNo: number, site: PerioSite, raw: string) => void;
  onGm: (toothNo: number, site: PerioSite, raw: string) => void;
  onBop: (toothNo: number, site: PerioSite, checked: boolean) => void;
  onMobility: (toothNo: number, value: string) => void;
  onFurcation: (toothNo: number, entrance: string) => void;
  onPlaque: (toothNo: number, surface: string) => void;
  onCejVisibility: (toothNo: number) => void;
  onRootConcavity: (toothNo: number) => void;
  onPiSurface: (toothNo: number, surface: string) => void;
  onGiSurface: (toothNo: number, surface: string) => void;
  onKg: (toothNo: number, raw: string) => void;
  onGingivalThickness: (toothNo: number) => void;
  onMillerClass: (toothNo: number) => void;
  onMpiSurface: (toothNo: number, surface: string) => void;
  onMbiSurface: (toothNo: number, surface: string) => void;
};

// Gather the ordered per-site {pd,gm} readings for one row (buccal MB/B/DB or
// lingual ML/L/DL) plus each site's x for the pocket/margin curve. The 3 sites of a
// tooth spread evenly across that tooth's width (reusing the SAME per-tooth
// x/width `archToothLayout` gives the arch teeth, so the curve tracks them):
// site j lands at x + width*(j+0.5)/3 → the 1/6, 1/2, 5/6 fractions. Reads
// getToothPerio (active chart) → status/plan aware + live-updates.
function collectCurveInput(
  layout: ArchLayout,
  siteKeys: readonly PerioSite[],
): { sites: PerioCurveSite[]; xs: number[] } {
  const sites: PerioCurveSite[] = [];
  const xs: number[] = [];
  for (const tooth of layout.teeth) {
    const perio = getToothPerio(tooth.toothNo);
    // A tooth with ANY charted site on this aspect has its remaining sites
    // treated as 0 (pd=0, gm=0), so the pocket/margin curve is drawn fully
    // across the tooth rather than stopping at the first gap.
    const anyCharted = siteKeys.some((s) => Object.prototype.hasOwnProperty.call(perio.pd, s));
    siteKeys.forEach((site, j) => {
      const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
      const pd = charted ? perio.pd[site] : (anyCharted ? 0 : undefined);
      const gm = pd === undefined ? undefined
        : (Object.prototype.hasOwnProperty.call(perio.gm, site) ? perio.gm[site] : 0);
      sites.push({ site, pd, gm });
      xs.push(tooth.x + (tooth.width * (j + 0.5)) / 3);
    });
  }
  return { sites, xs };
}

// `buildBuccalArchSvg`/`buildPalatalArchSvg` render as two independent
// `<svg class="perio-tooth-arch perio-tooth-arch-buccal|palatal">` elements,
// each mounted into its own grid cell (`buccalCell`/`palatalCell`, see
// `buildArch` below) with the central perio index band between them.
// `resolveAspectSvg` takes `container` rather than the SVG directly because
// `drawArchCurves`/`drawArchOverlay` are called with the whole arch grid
// element — which contains BOTH `buccalCell` and `palatalCell` as descendants
// regardless of the rows sitting between them in the DOM — so one
// `container.querySelector` reaches either aspect's SVG from anywhere in the
// arch.
function resolveAspectSvg(container: Element, aspectClass: string): Element | null {
  return container.querySelector(`svg.${aspectClass}`);
}

// Draw (or redraw) each aspect's curve into its arch SVG (see
// `resolveAspectSvg` above). Stale curve
// layers are removed first (scoped to `container`, i.e. every arch SVG it
// holds), so this is safe to call on every state change. The palatal curve
// is computed in the SAME buccal-space (cejY at the shared baseline); since
// the palatal SVG's row group carries NO net orientation transform (see
// `buildPalatalArchSvg`), the curve needs no transform of its own either —
// it lands directly on the palatal teeth.
function drawArchCurves(cache: TemplateDocCache, container: HTMLElement | null, teeth: readonly number[]): void {
  if (!container) return;
  // Remove any stale curve layers first (safe to call on every state change).
  container.querySelectorAll(".perio-curve").forEach((el) => el.remove());

  const layout = archToothLayout(cache, teeth);
  const opts = { cejY: layout.cejY, mmPx: PERIO_MM_PX };

  const buccalSvg = resolveAspectSvg(container, "perio-tooth-arch-buccal");
  if (buccalSvg) {
    const buccalParent = (buccalSvg.querySelector(".perio-tooth-row-buccal") as SVGGElement | null) ?? buccalSvg;
    const buccalIn = collectCurveInput(layout, BUCCAL_SITES);
    const buccalCurve = perioCurve(buccalIn.sites, { ...opts, siteX: (i) => buccalIn.xs[i] });
    const buccalLayer = buildPerioCurveLayer(buccalCurve, { width: layout.totalWidth, className: "perio-curve perio-curve-buccal" });
    buccalParent.appendChild(buccalLayer);
  }

  const palatalSvg = resolveAspectSvg(container, "perio-tooth-arch-palatal");
  if (palatalSvg) {
    const palatalParent = (palatalSvg.querySelector(".perio-tooth-row-palatal-inner") as SVGGElement | null) ?? palatalSvg;
    const lingualIn = collectCurveInput(layout, LINGUAL_SITES);
    const lingualCurve = perioCurve(lingualIn.sites, { ...opts, siteX: (i) => lingualIn.xs[i] });
    const lingualLayer = buildPerioCurveLayer(lingualCurve, { width: layout.totalWidth, className: "perio-curve perio-curve-palatal" });
    palatalParent.appendChild(lingualLayer);
  }
}

// The overlay layers offered by the switch row, in display order: the
// discrete highlights (bop/plaque/pd5/pd6), the continuous mm heat layers
// (pd/cal/gr), "cairo" (derived per-tooth Cairo recession-TYPE, grouped next
// to "gr" as both are recession-related), "kg" (keratinized gingiva width,
// grouped with the other mucogingival/recession axes), "pi"/"gi" (Silness-Löe/
// Löe-Silness graded indices, grouped next to "plaque" — plaque/gingival-
// inflammation axes), and "mpi"/"mbi" (Mombelli modified Plaque/Bleeding
// indices, grouped next to "pi"/"gi" — same graded shape, but IMPLANT-ONLY
// data, so marks only ever land on implant teeth). GT/Miller are categorical,
// rows-only axes with NO overlay (see the Dental Chart rows).
const SWITCHER_LAYERS: readonly PerioOverlayLayer[] = [
  "none", "pd", "cal", "gr", "cairo", "kg", "bop", "plaque", "pi", "gi", "mpi", "mbi", "pd5", "pd6",
];

// The subset of overlay layers that correspond 1:1 to a toggleable Dental
// Chart index row (`PerioRowId`) — these route their pill label through
// `indexName()` so canonical mode is consistent between the grid row and the
// matching overlay switcher entry. Layers with no row counterpart
// ("none"/"gr"/"cairo"/"pd5"/"pd6") always stay
// `t(\`perio.overlay.${layer}\`)`, unaffected by the name-mode setting.
const OVERLAY_LAYER_TO_ROW: Partial<Record<PerioOverlayLayer, PerioRowId>> = {
  pd: "pd",
  cal: "cal",
  bop: "bop",
  plaque: "plaque",
  pi: "pi",
  gi: "gi",
  kg: "kg",
  mpi: "mpi",
  mbi: "mbi",
};

/** Display label for one overlay-switcher pill, honoring
 *  `getPerioIndexNameMode()` for layers that map to a `PerioRowId`. NOTE:
 *  this deliberately does NOT delegate to `indexName()` — the switcher's
 *  TRANSLATED-mode text is the dedicated short `perio.overlay.<layer>` key
 *  (e.g. "PI"), which differs from the grid row's own translated key
 *  (`perio.pi.row` -> "Plaque Index (PI)"); only CANONICAL mode reuses the
 *  same `CANONICAL_INDEX_NAMES` entry the row uses, so the pill and the row
 *  agree once canonical mode is on. */
function overlaySwitchLabel(layer: PerioOverlayLayer): string {
  const rowId = OVERLAY_LAYER_TO_ROW[layer];
  if (rowId && getPerioIndexNameMode() === "canonical") return CANONICAL_INDEX_NAMES[rowId];
  return t(`perio.overlay.${layer}`);
}

// Gather one row's ordered per-site {x, pd, gm, bop} readings — the SAME
// per-tooth x/width `archToothLayout` gives the arch teeth (and the curve), so
// the overlay marks track the teeth. Reads getToothPerio
// (active chart) -> status/plan aware + live-updates, mirroring
// `collectCurveInput`.
function collectOverlayInput(layout: ArchLayout, siteKeys: readonly PerioSite[]): PerioOverlaySite[] {
  const out: PerioOverlaySite[] = [];
  for (const tooth of layout.teeth) {
    const perio = getToothPerio(tooth.toothNo);
    siteKeys.forEach((site, j) => {
      const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
      out.push({
        x: tooth.x + (tooth.width * (j + 0.5)) / 3,
        pd: charted ? perio.pd[site] : undefined,
        gm: Object.prototype.hasOwnProperty.call(perio.gm, site) ? perio.gm[site] : undefined,
        bop: perio.bop.includes(site),
      });
    });
  }
  return out;
}

// Gather one row's ordered per-site {x, pd, gm, cal} readings for the
// continuous mm heat overlays — same shape/x-positioning as
// `collectOverlayInput`, plus the site's CAL (via the REAL `getToothCal`, not
// a re-derived `pd+gm`, so the heat overlay can never drift from the public
// CAL definition). Reads getToothPerio/getToothCal (active chart) ->
// status/plan aware + live-updates, mirroring `collectOverlayInput`.
function collectMmHeatInput(layout: ArchLayout, siteKeys: readonly PerioSite[]): PerioOverlaySite[] {
  const out: PerioOverlaySite[] = [];
  for (const tooth of layout.teeth) {
    const perio = getToothPerio(tooth.toothNo);
    const cal = getToothCal(tooth.toothNo);
    siteKeys.forEach((site, j) => {
      const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
      out.push({
        x: tooth.x + (tooth.width * (j + 0.5)) / 3,
        pd: charted ? perio.pd[site] : undefined,
        gm: Object.prototype.hasOwnProperty.call(perio.gm, site) ? perio.gm[site] : undefined,
        cal: cal.has(site) ? cal.get(site) : undefined,
      });
    });
  }
  return out;
}

/**
 * Draw (or clear) the overlay for ONE arch band. Each aspect has its OWN
 * standalone arch SVG (`buildBuccalArchSvg`/`buildPalatalArchSvg`), each
 * mounted into its own grid cell (`buccalCell`/`palatalCell` — see
 * `buildArch`), so a buccal-aspect mark is appended into
 * `svg.perio-tooth-arch-buccal` and a palatal-aspect mark into
 * `svg.perio-tooth-arch-palatal`.
 * Stale overlay layers are removed first (scoped to `container`, i.e. both
 * SVGs), so this is safe to call on every state / layer change. The overlay
 * `<g>` is appended INTO the SAME oriented row group the teeth + curve ride
 * in its OWN svg (`.perio-tooth-row-buccal` / `.perio-tooth-row-palatal-
 * inner`), so the occlusal-to-occlusal flip carries the marks along with
 * the teeth — one coordinate space, no divergent geometry (it reuses
 * `archToothLayout` + `PERIO_MM_PX`, exactly like `drawArchCurves`).
 *
 * `none` draws nothing (after the stale clear), so selecting None leaves a
 * bare arch. Exported for direct unit testing against a hand-built template
 * cache; the component calls it from the graphic effect.
 */
export function drawArchOverlay(
  cache: TemplateDocCache,
  container: HTMLElement | null,
  teeth: readonly number[],
  layer: PerioOverlayLayer,
): void {
  if (!container) return;
  // Remove any stale overlay first (safe to call on every state/layer change).
  container.querySelectorAll(".perio-overlay-layer").forEach((el) => el.remove());
  if (layer === "none") return;

  const buccalSvg = resolveAspectSvg(container, "perio-tooth-arch-buccal");
  const palatalSvg = resolveAspectSvg(container, "perio-tooth-arch-palatal");
  const buccalParent = ((buccalSvg?.querySelector(".perio-tooth-row-buccal") as SVGGElement | null) ?? buccalSvg) as
    | SVGGElement
    | Element
    | null;
  const palatalParent = ((palatalSvg?.querySelector(".perio-tooth-row-palatal-inner") as SVGGElement | null) ??
    palatalSvg) as SVGGElement | Element | null;

  const layout = archToothLayout(cache, teeth);
  const opts = { cejY: layout.cejY, mmPx: PERIO_MM_PX };
  const className = `perio-overlay-${layer}`;

  if (layer === "plaque") {
    const plaqueTeeth = layout.teeth.map((tooth) => ({
      x: tooth.x,
      width: tooth.width,
      surfaces: getToothPlaque(tooth.toothNo),
    }));
    buccalParent?.appendChild(
      buildPerioOverlayLayer(perioPlaqueMarks(plaqueTeeth, "buccal", opts), { width: layout.totalWidth, className }),
    );
    palatalParent?.appendChild(
      buildPerioOverlayLayer(perioPlaqueMarks(plaqueTeeth, "palatal", opts), { width: layout.totalWidth, className }),
    );
    return;
  }

  // The Cairo recession-TYPE overlay — a per-TOOTH derived classification
  // (getToothRecessionType), not a per-site reading, so it is
  // collected once per tooth (mirroring the plaque block above) and — since
  // RT is specifically a BUCCAL-recession index — drawn ONLY into the buccal
  // row, never the lingual/palatal row.
  if (layer === "cairo") {
    const cairoTeeth: PerioCairoTooth[] = layout.teeth.map((tooth) => ({
      x: tooth.x,
      width: tooth.width,
      rt: getToothRecessionType(tooth.toothNo),
    }));
    buccalParent?.appendChild(
      buildPerioOverlayLayer(perioCairoMarks(cairoTeeth, opts), { width: layout.totalWidth, className }),
    );
    return;
  }

  // The KG (keratinized gingiva width) overlay — a per-TOOTH buccal mm scalar
  // (getKeratinizedWidth), collected once per tooth
  // (mirrors the Cairo block above) and drawn ONLY into the buccal row (KG is
  // specifically a buccal measure, like Cairo RT).
  if (layer === "kg") {
    const kgTeeth: PerioKgTooth[] = layout.teeth.map((tooth) => ({
      x: tooth.x,
      width: tooth.width,
      kg: getKeratinizedWidth(tooth.toothNo),
    }));
    buccalParent?.appendChild(
      buildPerioOverlayLayer(perioKgMarks(kgTeeth, opts), { width: layout.totalWidth, className }),
    );
    return;
  }

  // The PI/GI graded-index overlays — per-surface 0-3 grades (getPlaqueIndex/
  // getGingivalIndex) over the SAME 4 O'Leary surfaces the "plaque" overlay
  // reads, split across both rows exactly like it. "mpi"/"mbi" (Mombelli
  // modified Plaque/Bleeding indices, getPeriImplantPlaque/
  // getPeriImplantBleeding) share the SAME shape — implant-only data, so a
  // non-implant tooth simply reads grade 0 everywhere and draws no mark, with
  // no extra gating needed here.
  if (layer === "pi" || layer === "gi" || layer === "mpi" || layer === "mbi") {
    const getGrade =
      layer === "pi" ? getPlaqueIndex :
      layer === "gi" ? getGingivalIndex :
      layer === "mpi" ? getPeriImplantPlaque :
      getPeriImplantBleeding;
    const gradeTeeth: PerioGradeTooth[] = layout.teeth.map((tooth) => ({
      x: tooth.x,
      width: tooth.width,
      grades: {
        mesial: getGrade(tooth.toothNo, "mesial"),
        distal: getGrade(tooth.toothNo, "distal"),
        buccal: getGrade(tooth.toothNo, "buccal"),
        lingual: getGrade(tooth.toothNo, "lingual"),
      },
    }));
    buccalParent?.appendChild(
      buildPerioOverlayLayer(perioGradeMarks(gradeTeeth, "buccal", opts), { width: layout.totalWidth, className }),
    );
    palatalParent?.appendChild(
      buildPerioOverlayLayer(perioGradeMarks(gradeTeeth, "palatal", opts), { width: layout.totalWidth, className }),
    );
    return;
  }

  // The continuous mm heat overlays (pd / cal / gr) — every charted site
  // heat-bucketed by depth, over the SAME sites/x-positions the discrete
  // overlays + curve use (`collectMmHeatInput` mirrors `collectOverlayInput`,
  // adding the real `getToothCal` reading for `cal`).
  if (layer === "pd" || layer === "cal" || layer === "gr") {
    const mmHeatLayer = layer as MmHeatOverlayLayer;
    const buccalMarks = perioMmHeatMarks(mmHeatLayer, collectMmHeatInput(layout, BUCCAL_SITES), opts);
    buccalParent?.appendChild(buildPerioOverlayLayer(buccalMarks, { width: layout.totalWidth, className }));
    const lingualMarks = perioMmHeatMarks(mmHeatLayer, collectMmHeatInput(layout, LINGUAL_SITES), opts);
    palatalParent?.appendChild(buildPerioOverlayLayer(lingualMarks, { width: layout.totalWidth, className }));
    return;
  }

  // Site-based discrete overlays (bop / pd5 / pd6).
  const siteLayer = layer as SiteOverlayLayer;
  const buccalMarks = perioOverlayMarks(siteLayer, collectOverlayInput(layout, BUCCAL_SITES), opts);
  buccalParent?.appendChild(buildPerioOverlayLayer(buccalMarks, { width: layout.totalWidth, className }));
  const lingualMarks = perioOverlayMarks(siteLayer, collectOverlayInput(layout, LINGUAL_SITES), opts);
  palatalParent?.appendChild(buildPerioOverlayLayer(lingualMarks, { width: layout.totalWidth, className }));
}

function mkEl<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/** At most ONE row-label info popover is open across the whole perio chart
 *  (upper+lower arch, overlay or inline) at any time — module-scope
 *  singleton, mirroring `odontogram.ts`'s
 *  `showCariesDepthPopup`/`hideCariesDepthPopup` outside-click/Escape
 *  contract. Opening a new popover always closes any previous one first. */
let activeInfoPopover: {
  popover: HTMLDivElement;
  button: HTMLButtonElement;
  cleanup: () => void;
} | null = null;

function hideInfoPopover(): void {
  if (!activeInfoPopover) return;
  const { popover, button, cleanup } = activeInfoPopover;
  cleanup();
  popover.remove();
  button.setAttribute("aria-expanded", "false");
  activeInfoPopover = null;
}

/** Open (or, when the SAME button is clicked again, close) a lightweight
 *  positioned popover explaining one perio index (`t(infoKey)`), anchored
 *  below the row-label "i" button that triggered it. Dismisses on
 *  click-away or Esc via CAPTURE-phase document listeners — added
 *  synchronously (not deferred with `setTimeout`, unlike
 *  `showCariesDepthPopup`): the triggering "i" button's own click handler
 *  runs during the bubble phase of a "click" event, and any "mousedown" for
 *  that SAME user interaction has already fully dispatched by then (mousedown
 *  -> mouseup -> click), so a listener added here can never see a stale event
 *  from the click that opened it. Capture phase (not bubble) also means Esc
 *  is consumed here BEFORE it can bubble up into the perio-overlay dialog's
 *  own Esc-closes-the-whole-overlay handler (`PerioChart`'s `onKeyDown`) —
 *  the popover closes without also closing the overlay. Never stacks with
 *  the confirm modal: `.perio-info-popover`'s z-index sits below
 *  `.odon-confirm-backdrop`'s (200) — see index.css. */
function toggleInfoPopover(infoKey: string, anchor: HTMLButtonElement): void {
  const reopening = activeInfoPopover?.button === anchor;
  hideInfoPopover();
  if (reopening) return;

  const popover = mkEl("div", "perio-info-popover");
  popover.id = "perioInfoPopover";
  popover.setAttribute("role", "dialog");
  popover.setAttribute("aria-modal", "false");
  const text = mkEl("p", "perio-info-popover-text");
  text.textContent = t(infoKey);
  popover.appendChild(text);
  popover.setAttribute("aria-label", text.textContent);
  document.body.appendChild(popover);

  // Position below the anchor, clamped to the viewport (mirrors
  // showCariesDepthPopup's positioning in odontogram.ts).
  const rect = anchor.getBoundingClientRect();
  const pw = popover.offsetWidth || 260;
  const left = Math.min(rect.left, window.innerWidth - pw - 8);
  const top = Math.min(rect.bottom + 6, window.innerHeight - (popover.offsetHeight || 0) - 8);
  popover.style.left = `${Math.max(8, left)}px`;
  popover.style.top = `${Math.max(8, top)}px`;

  anchor.setAttribute("aria-expanded", "true");

  const onDocMouseDown = (e: MouseEvent) => {
    const target = e.target as Node | null;
    if (target && (popover.contains(target) || anchor.contains(target))) return;
    hideInfoPopover();
  };
  const onDocKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      hideInfoPopover();
    }
  };
  document.addEventListener("mousedown", onDocMouseDown, true);
  document.addEventListener("keydown", onDocKeyDown, true);

  activeInfoPopover = {
    popover,
    button: anchor,
    cleanup: () => {
      document.removeEventListener("mousedown", onDocMouseDown, true);
      document.removeEventListener("keydown", onDocKeyDown, true);
    },
  };
}

/** Builds a sticky row-label cell. When `infoKey` is given, appends a small
 *  `.perio-info-btn` ("i" icon, real `aria-label`) after the label text that
 *  opens a positioned `.perio-info-popover` with `t(infoKey)` on click (see
 *  {@link toggleInfoPopover}). Rows with no label (the tooth-number header /
 *  tooth-graphic placeholder rows) call this with no `infoKey` and get no
 *  button. */
function mkRowLabelCell(text: string, infoKey?: string): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-row-label");
  const label = mkEl("span", "perio-fullgrid-row-label-text");
  label.textContent = text;
  cell.appendChild(label);
  if (infoKey) {
    const btn = mkEl("button", "perio-info-btn") as HTMLButtonElement;
    btn.type = "button";
    btn.textContent = "i";
    btn.setAttribute("aria-label", t("perio.info.button", { label: text }));
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleInfoPopover(infoKey, btn);
    });
    cell.appendChild(btn);
  }
  return cell;
}

/** Sync ONE tooth's already-built cells from the given perio/CAL snapshot —
 *  the targeted-update primitive. Never creates/destroys DOM nodes, only
 *  updates value/checked/disabled/text on existing ones, so it is cheap to
 *  call after every single-site edit AND in a loop over all 32 teeth for a
 *  full resync (dual-state switch / external edits). Follows the tooth-panel's
 *  `syncPerioRow` value-sync contract (omit-when-empty: an uncharted site
 *  renders blank, `?? ""`). */
function syncToothCells(
  cells: ToothCellRefs,
  toothNo: number,
  perio: PerioSiteData,
  cal: Map<string, number>,
  readOnly: boolean,
): void {
  const hidden = isPerioRowHidden(toothNo);
  for (const site of PERIO_SITES) {
    const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
    const pdInput = cells.pd[site];
    if (pdInput) {
      pdInput.value = charted ? String(perio.pd[site]) : "";
      pdInput.disabled = readOnly || hidden;
    }
    const gmInput = cells.gm[site];
    if (gmInput) {
      gmInput.value = charted && Object.prototype.hasOwnProperty.call(perio.gm, site) ? String(perio.gm[site]) : "";
      gmInput.disabled = readOnly || hidden || !charted;
    }
    const bopInput = cells.bop[site];
    if (bopInput) {
      bopInput.checked = perio.bop.includes(site);
      bopInput.disabled = readOnly || hidden || !charted;
    }
    const calSpan = cells.cal[site];
    if (calSpan) {
      const calVal = cal.get(site);
      calSpan.textContent = calVal === undefined ? "" : String(calVal);
    }
  }
  if (cells.mobility) {
    cells.mobility.value = getToothMobility(toothNo);
    cells.mobility.disabled = readOnly || hidden;
  }
  // Furcation cycle buttons — face + grade + pressed state from the active
  // chart's per-entrance grade (getToothFurcation).
  // Buttons only exist for furcated-position + present teeth (built once,
  // see buildFurcationCell), so `hidden` here is belt-and-braces.
  const furc = getToothFurcation(toothNo);
  for (const entrance of Object.keys(cells.furcation)) {
    const btn = cells.furcation[entrance];
    if (!btn) continue;
    const grade = furc[entrance] ?? 0;
    btn.textContent = FURCATION_ROMAN[grade];
    btn.dataset.grade = String(grade);
    btn.setAttribute("aria-pressed", grade > 0 ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  // Plaque toggles — present/absent mark + pressed state from the active
  // chart's plaque surface set (getToothPlaque). Disabled on
  // a non-present tooth (mirrors the PD/GM disable gate).
  const plaque = getToothPlaque(toothNo);
  for (const surface of Object.keys(cells.plaque)) {
    const btn = cells.plaque[surface];
    if (!btn) continue;
    const present = plaque.includes(surface);
    btn.dataset.present = present ? "1" : "0";
    btn.setAttribute("aria-pressed", present ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  // cejVisibility / rootConcavity cycle buttons — face + value +
  // pressed/disabled state from the active chart (getCejVisibility/
  // getRootConcavity). Same hidden-row disable gate as PD/GM/mobility above
  // (both axes are per-tooth, not gated to a furcated position like furcation).
  if (cells.cejVisibility) {
    const value = getCejVisibility(toothNo);
    const btn = cells.cejVisibility;
    btn.textContent = CEJ_VISIBILITY_FACE[value] ?? "–";
    btn.dataset.value = value;
    btn.setAttribute("aria-pressed", value !== "none" ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  if (cells.rootConcavity) {
    const value = getRootConcavity(toothNo);
    const btn = cells.rootConcavity;
    btn.textContent = ROOT_CONCAVITY_FACE[value] ?? "–";
    btn.dataset.value = value;
    btn.setAttribute("aria-pressed", value !== "none" ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  // PI/GI per-surface grade buttons — face + grade + pressed state from the
  // active chart (getPlaqueIndex/getGingivalIndex). Same hidden-row disable
  // gate as the plaque toggles above.
  for (const surface of Object.keys(cells.pi)) {
    const btn = cells.pi[surface];
    if (!btn) continue;
    const grade = getPlaqueIndex(toothNo, surface);
    btn.textContent = GRADE_FACE[grade] ?? "–";
    btn.dataset.grade = String(grade);
    btn.setAttribute("aria-pressed", grade > 0 ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  for (const surface of Object.keys(cells.gi)) {
    const btn = cells.gi[surface];
    if (!btn) continue;
    const grade = getGingivalIndex(toothNo, surface);
    btn.textContent = GRADE_FACE[grade] ?? "–";
    btn.dataset.grade = String(grade);
    btn.setAttribute("aria-pressed", grade > 0 ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  // mPI/mBI per-surface grade buttons — mirror PI/GI's value sync exactly,
  // but IMPLANT-GATED: active only on an implant tooth (`isToothImplant`,
  // status/plan aware — mirrors `setSurfaceGrade`'s own implant guard in
  // odontogram.ts). Deliberately NOT gated on `hidden`
  // (`isPerioRowHidden`) like every other row above — that predicate hides
  // implant teeth precisely because they have no periodontal PROBING site,
  // the opposite of what these peri-implant indices need; it still respects
  // the global readOnly lock.
  const implant = isToothImplant(toothNo);
  for (const surface of Object.keys(cells.mpi)) {
    const btn = cells.mpi[surface];
    if (!btn) continue;
    const grade = getPeriImplantPlaque(toothNo, surface);
    btn.textContent = GRADE_FACE[grade] ?? "–";
    btn.dataset.grade = String(grade);
    btn.setAttribute("aria-pressed", grade > 0 ? "true" : "false");
    btn.disabled = readOnly || !implant;
  }
  for (const surface of Object.keys(cells.mbi)) {
    const btn = cells.mbi[surface];
    if (!btn) continue;
    const grade = getPeriImplantBleeding(toothNo, surface);
    btn.textContent = GRADE_FACE[grade] ?? "–";
    btn.dataset.grade = String(grade);
    btn.setAttribute("aria-pressed", grade > 0 ? "true" : "false");
    btn.disabled = readOnly || !implant;
  }
  // KG — a single per-tooth mm number input (mirrors the pd/gm inputs'
  // omit-when-empty value sync).
  if (cells.kg) {
    const mm = getKeratinizedWidth(toothNo);
    cells.kg.value = mm === null ? "" : String(mm);
    cells.kg.disabled = readOnly || hidden;
  }
  // gingivalThickness / millerClass cycle buttons — mirror
  // cejVisibility/rootConcavity above exactly.
  if (cells.gingivalThickness) {
    const value = getGingivalThickness(toothNo);
    const btn = cells.gingivalThickness;
    btn.textContent = GINGIVAL_THICKNESS_FACE[value] ?? "–";
    btn.dataset.value = value;
    btn.setAttribute("aria-pressed", value !== "unknown" ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
  if (cells.millerClass) {
    const value = getMillerClass(toothNo);
    const btn = cells.millerClass;
    btn.textContent = MILLER_CLASS_FACE[value] ?? "–";
    btn.dataset.value = value;
    btn.setAttribute("aria-pressed", value !== "none" ? "true" : "false");
    btn.disabled = readOnly || hidden;
  }
}

/** One arch band's built grid plus the two placeholder cells the buccal/
 *  palatal tooth-row graphic SVGs are injected into (each spans all tooth
 *  columns; `buccalCell` sits above the central perio index band
 *  (Plaque/PI/GI/mPI/mBI), `palatalCell` below it). */
type BuiltArch = { grid: HTMLDivElement; buccalCell: HTMLDivElement; palatalCell: HTMLDivElement };

/** Build ONE tooth's field cell for a given field/site-set. Shared by the
 *  buccal-aspect rows (built ABOVE the graphic) and the palatal-aspect rows
 *  (built BELOW it). Every id / `dataset.perio` is the stable locator the
 *  keyboard + sync code uses to find cells — WHERE the cell sits in the DOM
 *  can move, but those identifiers must not. */
function buildFieldCell(
  toothNo: number,
  field: "pd" | "gm" | "cal" | "bop",
  sites: readonly PerioSite[],
  aspect: "buccal" | "palatal",
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell");
  cell.dataset.perioAspect = aspect;
  cell.dataset.perioField = field;
  const group = mkEl("div", "perio-fullgrid-sitegroup");
  for (const site of sites) {
    if (field === "cal") {
      const span = mkEl("span", "perio-fullgrid-cal");
      span.id = `perio-fg-cal-${toothNo}-${site}`;
      group.appendChild(span);
      cells.cal[site] = span;
    } else if (field === "bop") {
      const input = mkEl("input", "perio-fullgrid-bop");
      input.type = "checkbox";
      input.id = `perio-fg-bop-${toothNo}-${site}`;
      input.title = t(`perio.site.${site}`);
      input.dataset.perio = `${toothNo}:${site}:bop`;
      input.addEventListener("change", () => handlers.onBop(toothNo, site, input.checked));
      group.appendChild(input);
      cells.bop[site] = input;
    } else if (field === "pd") {
      const input = mkEl("input", "perio-fullgrid-input");
      input.type = "number";
      input.min = "1";
      input.max = "15";
      input.step = "1";
      input.id = `perio-fg-pd-${toothNo}-${site}`;
      input.title = t(`perio.site.${site}`);
      input.dataset.perio = `${toothNo}:${site}:pd`;
      input.addEventListener("change", () => handlers.onPd(toothNo, site, input.value));
      group.appendChild(input);
      cells.pd[site] = input;
    } else {
      const input = mkEl("input", "perio-fullgrid-input");
      input.type = "number";
      input.min = "-10";
      input.max = "20";
      input.step = "1";
      input.id = `perio-fg-gm-${toothNo}-${site}`;
      input.title = t(`perio.site.${site}`);
      input.dataset.perio = `${toothNo}:${site}:gm`;
      input.addEventListener("change", () => handlers.onGm(toothNo, site, input.value));
      group.appendChild(input);
      cells.gm[site] = input;
    }
  }
  cell.appendChild(group);
  return cell;
}

/** Build ONE tooth's FURCATION cell — a compact cycle-button per
 *  {@link furcationEntrances} entrance (Glickman none->I->II->III->IV->none
 *  on click, via `setFurcation`). A tooth with NO furcated
 *  entrance for its position, OR one whose perio rows are hidden (missing /
 *  implant / under-gum / extraction — `isPerioRowHidden`), gets an EMPTY cell
 *  (no controls at all — furcation involvement only exists on a present,
 *  furcated tooth). The cell still occupies the tooth's grid column so the row
 *  stays column-aligned with the teeth. */
function buildFurcationCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-furcation");
  cell.dataset.perioField = "furcation";
  const entrances = furcationEntrances(toothNo);
  if (entrances.length === 0 || isPerioRowHidden(toothNo)) return cell; // empty placeholder
  const group = mkEl("div", "perio-fullgrid-sitegroup");
  for (const entrance of entrances) {
    const btn = mkEl("button", "perio-fullgrid-furc");
    btn.type = "button";
    btn.id = `perio-fg-furc-${toothNo}-${entrance}`;
    btn.dataset.furcEntrance = entrance;
    btn.title = t(`furcation.entrance.${entrance}`);
    btn.setAttribute("aria-label", t(`furcation.entrance.${entrance}`));
    btn.addEventListener("click", () => handlers.onFurcation(toothNo, entrance));
    group.appendChild(btn);
    cells.furcation[entrance] = btn;
  }
  cell.appendChild(group);
  return cell;
}

/** Build ONE tooth's PLAQUE cell — a 4-quadrant mark of toggle buttons
 *  (mesial/distal/buccal/lingual), each flipping O'Leary plaque
 *  presence for that surface via `setPlaque` on click. Built for EVERY tooth
 *  (the 4 surfaces are the same fixed set regardless of position) and disabled
 *  on a non-present tooth via `syncToothCells`, mirroring the PD/GM rows. */
function buildPlaqueCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-plaque");
  cell.dataset.perioField = "plaque";
  const group = mkEl("div", "perio-fullgrid-plaque-quad");
  for (const surface of PLAQUE_SURFACES) {
    const btn = mkEl("button", `perio-fullgrid-plaque perio-fullgrid-plaque-${surface}`);
    btn.type = "button";
    btn.id = `perio-fg-plaque-${toothNo}-${surface}`;
    btn.dataset.plaqueSurface = surface;
    btn.dataset.surfaceLetter = SURFACE_LETTER[surface] ?? "";
    btn.style.gridArea = diamondGridArea(surface, toothNo);
    btn.title = t(`surface.${surface}`);
    btn.setAttribute("aria-label", t(`surface.${surface}`));
    btn.addEventListener("click", () => handlers.onPlaque(toothNo, surface));
    group.appendChild(btn);
    cells.plaque[surface] = btn;
  }
  cell.appendChild(group);
  return cell;
}

/** Build ONE tooth's CEJ-VISIBILITY cell — a single compact cycle button
 *  (none -> detectable -> not-detectable -> none on
 *  click, via `setCejVisibility`). Built for EVERY tooth (mirrors the
 *  mobility select below — this axis applies to any present tooth, not just
 *  a furcated-position subset) and disabled on a hidden-row tooth (missing /
 *  implant / under-gum / extraction — `isPerioRowHidden`) via
 *  `syncToothCells`, the same gate PD/GM/mobility use. */
function buildCejVisibilityCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-cej");
  cell.dataset.perioField = "cejVisibility";
  const btn = mkEl("button", "perio-fullgrid-cej") as HTMLButtonElement;
  btn.type = "button";
  btn.id = `perio-fg-cej-${toothNo}`;
  btn.title = t("perio.cej.label");
  btn.setAttribute("aria-label", t("perio.cej.label"));
  btn.addEventListener("click", () => handlers.onCejVisibility(toothNo));
  cell.appendChild(btn);
  cells.cejVisibility = btn;
  return cell;
}

/** Build ONE tooth's ROOT-CONCAVITY cell — mirrors
 *  {@link buildCejVisibilityCell} exactly (none -> mild -> deep -> none via
 *  `setRootConcavity`). */
function buildRootConcavityCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-rootconcavity");
  cell.dataset.perioField = "rootConcavity";
  const btn = mkEl("button", "perio-fullgrid-rootconcavity") as HTMLButtonElement;
  btn.type = "button";
  btn.id = `perio-fg-rootconcavity-${toothNo}`;
  btn.title = t("perio.rootConcavity.label");
  btn.setAttribute("aria-label", t("perio.rootConcavity.label"));
  btn.addEventListener("click", () => handlers.onRootConcavity(toothNo));
  cell.appendChild(btn);
  cells.rootConcavity = btn;
  return cell;
}

/** Build ONE tooth's PI or GI cell — a 4-quadrant mark of cycle buttons
 *  (mesial/distal/buccal/lingual, mirrors {@link buildPlaqueCell}'s shape
 *  exactly), each cycling its own 0->1->2->3->0 grade via
 *  `setPlaqueIndex`/`setGingivalIndex` on click. Built for EVERY tooth (the 4
 *  surfaces are the same fixed set regardless of position) and disabled on a
 *  hidden-row tooth via `syncToothCells`, mirroring the plaque toggles.
 *  The same builder serves "mpi"/"mbi" (Mombelli modified Plaque/Bleeding
 *  indices, `setPeriImplantPlaque`/`setPeriImplantBleeding`) — same 4-surface
 *  shape, but built for EVERY tooth and gated ACTIVE-only-on-an-implant in
 *  `syncToothCells` (opposite of the hidden-row gate PI/GI/plaque use, since
 *  implants are exactly the teeth those axes disable). */
function buildGradeCell(
  toothNo: number,
  mapKey: "pi" | "gi" | "mpi" | "mbi",
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", `perio-fullgrid-cell perio-fullgrid-cell-${mapKey}`);
  cell.dataset.perioField = mapKey;
  const group = mkEl("div", "perio-fullgrid-plaque-quad");
  const onSurface =
    mapKey === "pi" ? handlers.onPiSurface :
    mapKey === "gi" ? handlers.onGiSurface :
    mapKey === "mpi" ? handlers.onMpiSurface :
    handlers.onMbiSurface;
  const registry =
    mapKey === "pi" ? cells.pi :
    mapKey === "gi" ? cells.gi :
    mapKey === "mpi" ? cells.mpi :
    cells.mbi;
  for (const surface of PLAQUE_SURFACES) {
    const btn = mkEl("button", `perio-fullgrid-${mapKey} perio-fullgrid-${mapKey}-${surface}`);
    btn.type = "button";
    btn.id = `perio-fg-${mapKey}-${toothNo}-${surface}`;
    btn.dataset.gradeSurface = surface;
    btn.dataset.surfaceLetter = SURFACE_LETTER[surface] ?? "";
    btn.style.gridArea = diamondGridArea(surface, toothNo);
    btn.title = t(`surface.${surface}`);
    btn.setAttribute("aria-label", t(`surface.${surface}`));
    btn.addEventListener("click", () => onSurface(toothNo, surface));
    group.appendChild(btn);
    registry[surface] = btn;
  }
  cell.appendChild(group);
  return cell;
}

/** Build ONE tooth's KG (keratinized gingiva width) cell — a single per-tooth
 *  mm number input (0-15, empty clears), mirroring
 *  the pd/gm cells' `<input type="number">` shape but with NO site
 *  subdivision (mirrors the mobility cell's one-per-tooth shape). Writes go
 *  through `setKeratinizedWidth` on `change`, like the pd/gm inputs. */
function buildKgCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-kg");
  cell.dataset.perioField = "kg";
  const input = mkEl("input", "perio-fullgrid-input perio-fullgrid-kg") as HTMLInputElement;
  input.type = "number";
  input.min = "0";
  input.max = "15";
  input.step = "1";
  input.id = `perio-fg-kg-${toothNo}`;
  input.title = t("perio.kg.row");
  input.addEventListener("change", () => handlers.onKg(toothNo, input.value));
  cell.appendChild(input);
  cells.kg = input;
  return cell;
}

/** Build ONE tooth's gingival-thickness (GT) cell — a single compact cycle
 *  button (unknown -> thin -> medium -> thick -> unknown
 *  on click, via `setGingivalThickness`). Mirrors
 *  {@link buildCejVisibilityCell} exactly. */
function buildGingivalThicknessCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-gt");
  cell.dataset.perioField = "gingivalThickness";
  const btn = mkEl("button", "perio-fullgrid-gt") as HTMLButtonElement;
  btn.type = "button";
  btn.id = `perio-fg-gt-${toothNo}`;
  btn.title = t("perio.gt.row");
  btn.setAttribute("aria-label", t("perio.gt.row"));
  btn.addEventListener("click", () => handlers.onGingivalThickness(toothNo));
  cell.appendChild(btn);
  cells.gingivalThickness = btn;
  return cell;
}

/** Build ONE tooth's Miller-class cell — mirrors
 *  {@link buildGingivalThicknessCell} exactly (none -> i -> ii -> iii -> iv ->
 *  none via `setMillerClass`). */
function buildMillerClassCell(
  toothNo: number,
  cells: ToothCellRefs,
  handlers: GridHandlers,
): HTMLDivElement {
  const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-miller");
  cell.dataset.perioField = "millerClass";
  const btn = mkEl("button", "perio-fullgrid-miller") as HTMLButtonElement;
  btn.type = "button";
  btn.id = `perio-fg-miller-${toothNo}`;
  btn.title = t("perio.miller.row");
  btn.setAttribute("aria-label", t("perio.miller.row"));
  btn.addEventListener("click", () => handlers.onMillerClass(toothNo));
  cell.appendChild(btn);
  cells.millerClass = btn;
  return cell;
}

/**
 * Build ONE arch band, laid out buccal-graphic-top → central perio index
 * band → palatal-graphic-bottom: the tooth-number header and
 * the Miller-class row sit at the very top (near the buccal aspect), then
 * the buccal-aspect number rows (PD innermost / nearest the teeth), the
 * furcation row, the BUCCAL tooth graphic (`buccalCell`), a band-orientation
 * legend, the central index band (Plaque → PI → GI → mPI → mBI), the
 * PALATAL tooth graphic (`palatalCell`), the palatal-aspect number rows,
 * mobility, and the remaining mucogingival/support rows (CEJ visibility,
 * root concavity, KG, GT) at the foot. Everything shares ONE CSS grid
 * (`ROW_LABEL_WIDTH` label column + one column per tooth), so both tooth
 * graphics (each spanning tracks 2..N+1) and every number column line up in
 * the same coordinate space — the columns are widened to the real per-tooth
 * arch-layout widths once the template cache loads (`applyArchColumns`).
 * Reuses the cell wiring via `buildFieldCell`; built ONCE per active
 * session (not React-controlled) — see the calling `useEffect`.
 */
function buildArch(teeth: readonly number[], registry: Map<number, ToothCellRefs>, handlers: GridHandlers): BuiltArch {
  const arch = mkEl("div", "perio-fullgrid-arch");
  arch.style.gridTemplateColumns = `${ROW_LABEL_WIDTH}px repeat(${teeth.length}, ${PROVISIONAL_COL_WIDTH}px)`;
  const isUpper = teeth.length > 0 && isUpperTooth(teeth[0]);
  // Per-index row visibility (Settings -> Periodontal tab). Read ONCE per
  // build — a rebuild is triggered by the caller whenever the
  // underlying flag changes (see the grid effect's `visibilitySig`/`buildGrid`
  // in the PerioChart component below). The tooth-number header + the tooth
  // graphic (below) are NEVER gated.
  const visible = getPerioRowVisibility();
  // The peri-implant Mombelli indices (mPI/mBI) are meaningless without an
  // implant, so their rows only render in an arch that has at
  // least one implant tooth. Per-arch because buildArch runs once per arch
  // (UPPER/LOWER) — an upper-only implant must not show a phantom lower row.
  const archHasImplant = teeth.some((n) => isToothImplant(n));
  // Every row-label text below goes through `indexName(id)`
  // (`src/perioIndexNames.ts`) instead of a raw `t(...)` call, so a row's
  // NAME switches between the localized string and a fixed English/Latin
  // canonical form per `getPerioIndexNameMode()`. The `infoKey` (2nd arg to
  // `mkRowLabelCell`) is UNCHANGED — tooltips stay `t("perio.info.*")` in
  // both modes. A mode flip is part of the same rebuild trigger as row
  // visibility (see `visibilitySig` below), since this function reads the
  // mode once per build, same as `visible` above.

  // Initialise every tooth's cell registry up front — the buccal rows built
  // below reference these entries before any later row does.
  for (const toothNo of teeth) {
    registry.set(toothNo, {
      pd: {}, gm: {}, bop: {}, cal: {}, mobility: null, furcation: {}, plaque: {},
      cejVisibility: null, rootConcavity: null,
      pi: {}, gi: {}, kg: null, gingivalThickness: null, millerClass: null,
      mpi: {}, mbi: {},
    });
  }

  const buccalLabel = t("perio.buccal");
  const lingualLabel = isUpper ? t("perio.palatal") : t("perio.lingual");

  // Append one full field row (label cell + one field cell per tooth). The
  // row-label's info button always wires to `perio.info.<field>` — PD/GM/CAL/
  // BOP each has exactly ONE explanation, shared by both its buccal- and
  // palatal-aspect rows.
  const appendFieldRow = (
    field: "pd" | "gm" | "cal" | "bop",
    sites: readonly PerioSite[],
    aspect: "buccal" | "palatal",
    label: string,
  ) => {
    arch.appendChild(mkRowLabelCell(label, `perio.info.${field}`));
    for (const toothNo of teeth) {
      arch.appendChild(buildFieldCell(toothNo, field, sites, aspect, registry.get(toothNo)!, handlers));
    }
  };

  // --- Tooth-number header row, at the very top of the arch ---
  arch.appendChild(mkRowLabelCell(""));
  for (const toothNo of teeth) {
    const header = mkEl("div", "perio-fullgrid-header-cell");
    header.setAttribute("data-perio-tooth-header", String(toothNo));
    header.textContent = formatToothLabel(toothNo);
    arch.appendChild(header);
  }

  // --- Miller-class row (single per-tooth cycle button) at the top buccal
  //     area — recession classification reads next to the tooth numbers,
  //     closest to the buccal aspect it's measured on. ---
  if (visible.miller) {
    arch.appendChild(mkRowLabelCell(indexName("miller"), "perio.info.miller"));
    for (const toothNo of teeth) {
      arch.appendChild(buildMillerClassCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- Buccal-aspect rows, ABOVE the graphic (PD innermost / nearest teeth) ---
  // The aspect qualifier (buccal/palatal/lingual) stays translated in BOTH
  // name modes — only the index NAME (`indexName(...)`) switches between
  // `t(...)` and the canonical form.
  if (visible.bop) appendFieldRow("bop", BUCCAL_SITES, "buccal", `${buccalLabel} ${indexName("bop")}`);
  if (visible.cal) appendFieldRow("cal", BUCCAL_SITES, "buccal", `${buccalLabel} ${indexName("cal")}`);
  if (visible.gm) appendFieldRow("gm", BUCCAL_SITES, "buccal", `${buccalLabel} ${indexName("gm")}`);
  if (visible.pd) appendFieldRow("pd", BUCCAL_SITES, "buccal", `${buccalLabel} ${indexName("pd")}`);

  // --- Furcation row, nearest the teeth (just above the buccal graphic) ---
  if (visible.furcation) {
    arch.appendChild(mkRowLabelCell(indexName("furcation"), "perio.info.furcation"));
    for (const toothNo of teeth) {
      arch.appendChild(buildFurcationCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- BUCCAL tooth-row graphic cell: spans all tooth columns, crown-DOWN,
  //     filled by the graphic effect once the template cache loads. An empty
  //     sticky label cell keeps the label column continuous. ---
  arch.appendChild(mkRowLabelCell(""));
  const buccalCell = mkEl("div", "perio-fullgrid-graphic-cell");
  buccalCell.dataset.perioArch = isUpper ? "upper" : "lower";
  buccalCell.dataset.perioAspect = "buccal";
  buccalCell.style.gridColumn = "2 / -1";
  arch.appendChild(buccalCell);

  // --- Band-orientation legend: a larger-font row marking the central
  //     index band's buccal (top, adjacent to the graphic above) / lingual-
  //     palatal (bottom, adjacent to the graphic below) anatomy. Chrome only
  //     (like the header/graphic placeholder rows above) — its row-label
  //     cell stays EMPTY and carries no info button, so it is never gated by
  //     `getPerioRowVisibility()` and never shows up in a row-label-text
  //     collection alongside the real index rows. ---
  arch.appendChild(mkRowLabelCell(""));
  const bandLabelTop = mkEl("div", "perio-fullgrid-band-label");
  bandLabelTop.style.gridColumn = "2 / -1";
  bandLabelTop.setAttribute("role", "note");
  bandLabelTop.setAttribute("aria-label", t("perio.band.title"));
  const bandBuccal = mkEl("span", "perio-fullgrid-band-label-buccal");
  bandBuccal.textContent = `▲ ${t("perio.band.buccal")} ▲`;
  bandLabelTop.appendChild(bandBuccal);
  arch.appendChild(bandLabelTop);

  // --- Central perio index band: Plaque -> PI -> GI -> mPI -> mBI, between
  //     the buccal and palatal graphics. ---
  if (visible.plaque) {
    arch.appendChild(mkRowLabelCell(indexName("plaque"), "perio.info.plaque"));
    for (const toothNo of teeth) {
      arch.appendChild(buildPlaqueCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- PI row (Silness-Löe Plaque Index, per-surface graded 0-3) — mirrors
  //     the O'Leary plaque row's 4-quadrant shape. ---
  if (visible.pi) {
    arch.appendChild(mkRowLabelCell(indexName("pi"), "perio.info.pi"));
    for (const toothNo of teeth) {
      arch.appendChild(buildGradeCell(toothNo, "pi", registry.get(toothNo)!, handlers));
    }
  }

  // --- GI row (Löe-Silness Gingival Index, per-surface graded 0-3). ---
  if (visible.gi) {
    arch.appendChild(mkRowLabelCell(indexName("gi"), "perio.info.gi"));
    for (const toothNo of teeth) {
      arch.appendChild(buildGradeCell(toothNo, "gi", registry.get(toothNo)!, handlers));
    }
  }

  // --- mPI row (Mombelli modified Plaque Index, implant-only, per-surface
  //     graded 0-3). Built for EVERY tooth like PI/GI, but the cells are only
  //     ACTIVE on an implant tooth (see syncToothCells). ---
  if (visible.mpi && archHasImplant) {
    arch.appendChild(mkRowLabelCell(indexName("mpi"), "perio.info.mpi"));
    for (const toothNo of teeth) {
      arch.appendChild(buildGradeCell(toothNo, "mpi", registry.get(toothNo)!, handlers));
    }
  }

  // --- mBI row (Mombelli modified sulcus Bleeding Index, implant-only). ---
  if (visible.mbi && archHasImplant) {
    arch.appendChild(mkRowLabelCell(indexName("mbi"), "perio.info.mbi"));
    for (const toothNo of teeth) {
      arch.appendChild(buildGradeCell(toothNo, "mbi", registry.get(toothNo)!, handlers));
    }
  }

  // --- Band-orientation legend (bottom): the lingual/palatal edge of the
  //     central index band, adjacent to the palatal graphic below. Centered,
  //     mirroring the buccal legend at the top of the band. ---
  arch.appendChild(mkRowLabelCell(""));
  const bandLabelBottom = mkEl("div", "perio-fullgrid-band-label");
  bandLabelBottom.style.gridColumn = "2 / -1";
  bandLabelBottom.setAttribute("role", "note");
  bandLabelBottom.setAttribute("aria-label", t("perio.band.title"));
  const bandLingual = mkEl("span", "perio-fullgrid-band-label-lingual");
  bandLingual.textContent = `▼ ${t("perio.band.lingual")} ▼`;
  bandLabelBottom.appendChild(bandLingual);
  arch.appendChild(bandLabelBottom);

  // --- PALATAL tooth-row graphic cell: spans all tooth columns, crown-UP,
  //     filled by the graphic effect once the template cache loads. ---
  arch.appendChild(mkRowLabelCell(""));
  const palatalCell = mkEl("div", "perio-fullgrid-graphic-cell");
  palatalCell.dataset.perioArch = isUpper ? "upper" : "lower";
  palatalCell.dataset.perioAspect = "palatal";
  palatalCell.style.gridColumn = "2 / -1";
  arch.appendChild(palatalCell);

  // --- Palatal-aspect rows, BELOW the graphic (PD innermost / nearest teeth) ---
  if (visible.pd) appendFieldRow("pd", LINGUAL_SITES, "palatal", `${lingualLabel} ${indexName("pd")}`);
  if (visible.gm) appendFieldRow("gm", LINGUAL_SITES, "palatal", `${lingualLabel} ${indexName("gm")}`);
  if (visible.cal) appendFieldRow("cal", LINGUAL_SITES, "palatal", `${lingualLabel} ${indexName("cal")}`);
  if (visible.bop) appendFieldRow("bop", LINGUAL_SITES, "palatal", `${lingualLabel} ${indexName("bop")}`);

  // --- Mobility row: one select per tooth, no site subdivision. ---
  if (visible.mobility) {
    arch.appendChild(mkRowLabelCell(indexName("mobility"), "perio.info.mobility"));
    const mobilityOptions = optionsFor("mobility").map((o) => ({ value: o.value, label: t(o.labelKey) }));
    for (const toothNo of teeth) {
      const cell = mkEl("div", "perio-fullgrid-cell perio-fullgrid-cell-mobility");
      const select = mkEl("select", "perio-fullgrid-mobility-select");
      select.id = `perio-fg-mobility-${toothNo}`;
      for (const opt of mobilityOptions) {
        const optionEl = mkEl("option");
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        select.appendChild(optionEl);
      }
      select.addEventListener("change", () => handlers.onMobility(toothNo, select.value));
      cell.appendChild(select);
      arch.appendChild(cell);
      registry.get(toothNo)!.mobility = select;
    }
  }

  // --- CEJ-visibility row: single per-tooth cycle button, no site
  //     subdivision (mirrors the mobility row above). ---
  if (visible.cej) {
    arch.appendChild(mkRowLabelCell(indexName("cej"), "perio.info.cej"));
    for (const toothNo of teeth) {
      arch.appendChild(buildCejVisibilityCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- Root-concavity row: mirrors the CEJ-visibility row above. ---
  if (visible.rootConcavity) {
    arch.appendChild(mkRowLabelCell(indexName("rootConcavity"), "perio.info.rootConcavity"));
    for (const toothNo of teeth) {
      arch.appendChild(buildRootConcavityCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- KG row (keratinized gingiva width, single per-tooth mm cell). ---
  if (visible.kg) {
    arch.appendChild(mkRowLabelCell(indexName("kg"), "perio.info.kg"));
    for (const toothNo of teeth) {
      arch.appendChild(buildKgCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  // --- GT row (gingival thickness, single per-tooth cycle button). ---
  if (visible.gt) {
    arch.appendChild(mkRowLabelCell(indexName("gt"), "perio.info.gt"));
    for (const toothNo of teeth) {
      arch.appendChild(buildGingivalThicknessCell(toothNo, registry.get(toothNo)!, handlers));
    }
  }

  return { grid: arch, buccalCell, palatalCell };
}

// A small allowance subtracted from the measured scroll container width
// before fitting columns to it, so the fitted columns never
// sit exactly flush with the container edge (which could otherwise trip a
// horizontal scrollbar into existing JUST from its own width, oscillating
// between fitting and not).
const GRID_SCROLLBAR_ALLOWANCE = 2;

/** Widen an already-built arch grid's tooth columns to the real per-tooth
 *  arch-layout widths (viewBox width + `TOOTH_GAP`, baked in — NO CSS
 *  column-gap — so the cumulative column edges match the arch SVG's per-tooth
 *  x positions exactly, with no progressive drift), scaled by a DYNAMIC
 *  fill-scale so the arch fills the available width of `scrollContainer`.
 *  Called once the template cache loads AND on every resize of
 *  `scrollContainer` (see the `ResizeObserver` below), so a tooth's number
 *  columns keep sitting directly under/over that tooth in the graphic at any
 *  width. `scrollContainer`
 *  is `.perio-fullgrid-scroll` (the `scrollRef` div, NOT the grid itself —
 *  the grid's own width is a computed OUTPUT of this function, so measuring
 *  it here would be circular / risk a resize feedback loop); its width is
 *  driven by the surrounding flex layout, not by this grid's content
 *  (`overflow: auto` on the scroll container absorbs any column overflow), so
 *  reading `clientWidth` here never reacts to the change this function itself
 *  makes. A `null`/unmounted/zero-width container (including jsdom, which
 *  never lays out `clientWidth`) measures as `0`, which `computeFillScale`
 *  clamps down to `MIN_FILL_SCALE` — reproducing a fixed layout when width
 *  can't be measured. */
function applyArchColumns(
  grid: HTMLElement | null,
  teeth: readonly number[],
  cache: TemplateDocCache,
  scrollContainer: HTMLElement | null,
): void {
  if (!grid) return;
  const layout = archToothLayout(cache, teeth);
  if (layout.teeth.length === 0) return;
  const containerWidth = scrollContainer?.clientWidth ?? 0;
  const available = containerWidth - ROW_LABEL_WIDTH - GRID_SCROLLBAR_ALLOWANCE;
  const fillScale = computeFillScale(available, layout.totalWidth);
  // Scale each tooth column by the fitted `fillScale`: the arch SVG fills the
  // graphic cell these columns span (CSS `width:100%`, no fixed width), so
  // scaling the columns scales the rendered teeth to match — one shared
  // layout (teeth/curve/overlays/mm-grid all derive from the SAME
  // `archToothLayout` + this one scale), columns stay locked to the teeth
  // (no divergent geometry).
  const cols = layout.teeth
    .map((tooth) => `${((tooth.width + TOOTH_GAP) * fillScale).toFixed(3)}px`)
    .join(" ");
  grid.style.gridTemplateColumns = `${ROW_LABEL_WIDTH}px ${cols}`;
}

/**
 * Full-mouth perio-chart. The 32-tooth x 6-site grid (~450+ interactive
 * cells) is built with plain DOM (`buildArch`), NOT JSX/React state, and
 * updated via targeted `syncToothCells` calls rather than a full React
 * re-render — see `syncOneTooth`/`fullResync` below. Only the compact summary
 * bar is React-controlled (`useState`), since re-rendering ~4 numbers on every
 * edit is cheap. `suppressResyncRef` prevents the grid's own edits from ALSO
 * triggering a redundant full resync via the `onStateChange` subscription
 * (setPerioSite/setToothMobility both fire it synchronously) — external edits
 * (dual-state chart-mode switch, or another consumer editing perio data while
 * the overlay is open) still trigger the full resync normally. All writes go
 * through the data core (`setPerioSite`/`getToothPerio`/`getToothCal`/
 * `getPerioSummary`/`getPerioChart`); keyboard auto-advance between cells is
 * handled by `handleGridKeyDown`.
 *
 * Layers OVER the odontogram, which it never unmounts: `position: fixed`,
 * full-screen, high z-index (`.perio-overlay` in `index.css`). Mirrors
 * `SettingsModal`'s dialog contract — `role="dialog"` + `aria-modal`, Esc
 * closes, backdrop click closes, focus trap + focus-restore on close — on a
 * single element (`#perioOverlay` itself is the dialog; there is no separate
 * backdrop element, unlike `SettingsModal`).
 *
 * The optional `inline` prop selects a second chrome for the SAME body (grid +
 * summary bar) — a plain panel (`#perioInlinePanel`) meant to fill the chart
 * area in place of the hidden-but-mounted odontogram, instead of the
 * fixed-position modal dialog. `open`/`onClose` are the MODAL chrome's
 * contract and are ignored when `inline` is true (the caller controls
 * mount/unmount of an inline instance directly via conditional rendering) —
 * there is nothing to "close" in an embedded panel. Dialog-only concerns
 * (focus trap/restore, Esc-to-close, backdrop click, `role="dialog"`) do not
 * apply to the inline chrome at all.
 */
export default function PerioChart({
  open = false,
  onClose,
  inline = false,
}: {
  open?: boolean;
  onClose?: () => void;
  inline?: boolean;
}) {
  const active = inline || open;
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  // The tooth-row graphic containers (`buccalCell`/`palatalCell`) and the grid
  // elements are created inside the plain-DOM grid build (`buildArch`), NOT
  // rendered as JSX — the two graphics sit INSIDE the number-row grid
  // (buccal graphic above the central index band, palatal below it), so these
  // refs are assigned by the grid-building effect and read
  // by the graphic effect (which runs after it on the same commit).
  // `drawArchCurves`/`drawArchOverlay` take the whole arch GRID (not either
  // cell individually) as their "container" argument — both `buccalCell` and
  // `palatalCell` are descendants of it regardless of the rows sitting
  // between them, and `resolveAspectSvg` finds each aspect's SVG by class
  // from anywhere within it.
  const buccalUpperRef = useRef<HTMLDivElement | null>(null);
  const palatalUpperRef = useRef<HTMLDivElement | null>(null);
  const buccalLowerRef = useRef<HTMLDivElement | null>(null);
  const palatalLowerRef = useRef<HTMLDivElement | null>(null);
  const gridUpperRef = useRef<HTMLDivElement | null>(null);
  const gridLowerRef = useRef<HTMLDivElement | null>(null);
  const archCacheRef = useRef<TemplateDocCache | null>(null);
  const registryRef = useRef<Map<number, ToothCellRefs> | null>(null);
  const suppressResyncRef = useRef(false);
  // Static default, NOT getPerioSummary() — this hook runs on every mount
  // regardless of `open` (PerioChart is always in <App/>'s tree, just
  // returns null while closed), so calling into "./odontogram" here would
  // defeat the point of deferring every real module call to the
  // `open`-gated effect below. Replaced with the real summary as soon as
  // that effect's first fullResync() runs.
  const [summary, setSummary] = useState<PerioSummaryData>(EMPTY_SUMMARY);
  // The active overlay layer, mirrored from the module-level flag
  // (odontogram.ts) into React state so the switcher's active button + the
  // header read-out re-render on change. Static default ("none") — like
  // `summary` above, this hook runs on every mount regardless of `open`, so
  // the real value is read in the `active`-gated effect below (never at module
  // eval), keeping the partial-mock tests unaffected.
  const [overlayLayer, setOverlayLayer] = useState<PerioOverlayLayer>("none");
  // The tooth-anatomy profile, mirrored so the template-cache effect below can
  // depend on it. The two profiles have DIFFERENT template sets (the measured
  // one adds 12/15/17/31/46), and `archCacheRef` holds documents parsed from
  // whichever profile was active when the chart loaded: switching profiles with
  // the chart open otherwise redrew measured positions out of classic
  // documents, dropping half the teeth from the arch.
  const [anatomy, setAnatomy] = useState(() => getToothAnatomy());

  const fullResync = useCallback(() => {
    const registry = registryRef.current;
    if (!registry) return;
    const chart = getPerioChart();
    const readOnly = getReadOnly();
    for (const [toothNo, cells] of registry) {
      const perio = chart[String(toothNo)] ?? EMPTY_PERIO;
      syncToothCells(cells, toothNo, perio, getToothCal(toothNo), readOnly);
    }
    setSummary(getPerioSummary());
  }, []);

  const syncOneTooth = useCallback((toothNo: number) => {
    const registry = registryRef.current;
    if (!registry) return;
    const cells = registry.get(toothNo);
    if (!cells) return;
    syncToothCells(cells, toothNo, getToothPerio(toothNo), getToothCal(toothNo), getReadOnly());
    setSummary(getPerioSummary());
  }, []);

  // Move focus to a `nextPerioCell`/`prevPerioCell` coordinate's INPUT, if it
  // exists and is currently enabled (an uncharted/hidden/read-only cell is
  // `disabled` — never steal focus onto an element that can't accept it; a
  // real browser silently refuses `.focus()` on a disabled control anyway,
  // this guard just makes that explicit/verifiable rather than incidental).
  const focusPerioCell = useCallback((coord: PerioCellCoord | null) => {
    if (!coord) return;
    const registry = registryRef.current;
    if (!registry) return;
    const cells = registry.get(coord.toothNo);
    if (!cells) return;
    const el = cells[coord.row][coord.site];
    if (el && !el.disabled) el.focus();
  }, []);

  // Keyboard auto-advance + navigation, delegated on the grid container (the
  // ~450+ cells are plain DOM, not JSX — see the component doc comment — so
  // this is one native `keydown` listener, not a per-cell React handler).
  // Cells are located via `data-perio="{toothNo}:{site}:{row}"` (set in
  // `buildArch`). ALL value writes still go through `setPerioSite` (never a
  // second mutation path) — this only decides WHAT to write and WHERE to move
  // focus next; `syncOneTooth` re-syncs the edited cell from state exactly
  // like the existing `change`-event handlers do.
  //
  // PD digit: a single 2-9 keystroke commits `pd` immediately (0 un-charts —
  // `setPerioSite`'s own semantics, no special-casing needed here) and
  // advances to `nextPerioCell`. A `1` keystroke commits an interim `pd` of
  // 1, primes `dataset.pendingTens` (mirrors `dataset.pendingSign` below —
  // NOT `.value`, for the same jsdom/browser value-sanitization reason), and
  // withholds the advance so a FOLLOWING `0`-`5` digit can compose 10-15.
  // Any other key while primed (not `0`-`5`) clears the prime — the
  // already-committed value of 1 stands — and is NOT swallowed: it falls
  // through to be handled normally below (arrow keys navigate, a digit 6-9
  // overwrites+advances as a fresh single-digit entry, anything else is a
  // no-op at the current cell). GM digit: same auto-advance, except a leading
  // `-` keystroke first primes the field — tracked ONLY via a
  // `dataset.pendingSign` marker on the input, NOT its `.value` (a bare `-` is
  // not a valid `<input type="number">` value, so the browser's, and jsdom's,
  // own value-sanitization algorithm silently resets it back to `""` the
  // instant it's assigned, making `.value` an unreliable place to stash an
  // in-progress sign) — so the FOLLOWING digit composes a negative reading; a
  // bare digit with no primed `-` commits a positive reading. Any other key
  // on a gm cell (arrows, Tab, etc.) clears a stale prime, so navigating away
  // via a KEY without finishing the digit never leaks a sign into a later,
  // unrelated entry; the delegated `focusout` handler below (see
  // `handleGridFocusOut`) covers the same case for a NON-keyboard focus change
  // (e.g. a mouse click to another cell), which this keydown handler alone
  // cannot see. Arrow keys move focus only — never write state. Space/Enter on
  // a BOP cell toggles it. `getReadOnly()` is checked explicitly up front
  // (belt-and-braces on top of the cells' own `disabled` attribute, which
  // already blocks real browser focus/keydown on a read-only grid) so the
  // no-op is verifiable even when a test dispatches a keydown directly at a
  // DOM node.
  const handleGridKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (getReadOnly()) return;
      const target = e.target as HTMLElement | null;
      const coordStr = target?.dataset?.perio;
      if (!coordStr) return;
      const [toothStr, siteStr, rowStr] = coordStr.split(":");
      const toothNo = Number(toothStr);
      const site = siteStr as PerioSite;

      if (rowStr === "bop") {
        if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
          e.preventDefault();
          const checkbox = target as HTMLInputElement;
          const next = !checkbox.checked;
          suppressResyncRef.current = true;
          setPerioSite(toothNo, site, { bop: next });
          suppressResyncRef.current = false;
          syncOneTooth(toothNo);
        }
        return;
      }

      const row = rowStr as "pd" | "gm";
      const cur: PerioCellCoord = { toothNo, site, row };
      const input = target as HTMLInputElement;
      const isDigit = /^[0-9]$/.test(e.key);

      // Any key other than the `-`/digit pair that composes a gm reading
      // cancels a pending sign (see the doc comment above).
      if (row === "gm" && input.dataset.pendingSign && e.key !== "-" && !isDigit) {
        delete input.dataset.pendingSign;
      }

      // PD tens-composition (see doc comment above): a primed '1' composes
      // with a following 0-5 digit into 10-15. Any other key just clears
      // the prime and falls through unswallowed to the rest of this
      // handler (arrow keys / a fresh digit / anything else).
      if (row === "pd" && input.dataset.pendingTens === "1") {
        if (/^[0-5]$/.test(e.key)) {
          e.preventDefault();
          delete input.dataset.pendingTens;
          suppressResyncRef.current = true;
          setPerioSite(toothNo, site, { pd: Number(`1${e.key}`) });
          suppressResyncRef.current = false;
          syncOneTooth(toothNo);
          focusPerioCell(nextPerioCell(cur));
          return;
        }
        delete input.dataset.pendingTens;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        focusPerioCell(nextPerioCell(cur));
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusPerioCell(prevPerioCell(cur));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        focusPerioCell({ toothNo, site, row: "pd" });
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusPerioCell({ toothNo, site, row: "gm" });
        return;
      }

      if (row === "gm" && e.key === "-") {
        e.preventDefault();
        input.dataset.pendingSign = "-";
        return;
      }

      if (isDigit) {
        e.preventDefault();
        if (row === "pd" && e.key === "1") {
          suppressResyncRef.current = true;
          setPerioSite(toothNo, site, { pd: 1 });
          suppressResyncRef.current = false;
          syncOneTooth(toothNo);
          input.dataset.pendingTens = "1";
          return; // withhold advance — a following 0-5 digit may compose 10-15
        }
        suppressResyncRef.current = true;
        if (row === "pd") {
          setPerioSite(toothNo, site, { pd: Number(e.key) });
        } else {
          const composed = input.dataset.pendingSign === "-" ? `-${e.key}` : e.key;
          delete input.dataset.pendingSign;
          setPerioSite(toothNo, site, { gm: Number(composed) });
        }
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
        focusPerioCell(nextPerioCell(cur));
      }
    },
    [focusPerioCell, syncOneTooth],
  );

  // A primed `-` (`dataset.pendingSign`, see the doc comment above
  // `handleGridKeyDown`) must be cleared on ANY loss of focus from the gm cell
  // that primed it, not only by a subsequent keydown on that same input.
  // Without this, priming `-` then leaving the cell via a non-keyboard focus
  // change (mouse click on another cell — no keydown fires on the primed input
  // at all) leaves the marker stuck on that DOM node; returning to the SAME
  // cell later and typing a plain digit would then silently compose a NEGATIVE
  // value even though no `-` was pressed this time — clinically wrong (gm sign
  // flips recession vs. pseudopocket meaning). Delegated via `focusout`
  // (bubbles, unlike `blur`) on the grid container, mirroring the delegated
  // `keydown` handler. Only ever clears the marker — never touches the cell's
  // value or calls `setPerioSite`. The same stale-prime hazard applies to a
  // primed PD `dataset.pendingTens` — cleared here too, so leaving a primed PD
  // cell via a non-keyboard focus change and later typing a plain digit can't
  // silently compose it as a tens-completion.
  const handleGridFocusOut = useCallback((e: FocusEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.dataset?.pendingSign) delete target.dataset.pendingSign;
    if (target?.dataset?.pendingTens) delete target.dataset.pendingTens;
  }, []);

  // Capture the opener + move focus into the dialog when it opens; restore
  // focus to the opener when it closes/unmounts. MODAL-ONLY — an inline panel
  // is embedded page content, not a dialog, so mounting it must never steal
  // focus the way opening a modal legitimately does.
  useEffect(() => {
    if (inline || !open) return;
    openerRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();
    return () => {
      openerRef.current?.focus?.();
    };
  }, [inline, open]);

  // Build the grid fresh each time this becomes active — either the modal
  // opens, or an inline instance mounts (its DOM is fully torn down when
  // inactive — `if (!active) return null` below — so `scrollRef` is a
  // brand-new node each time) — and subscribe to onStateChange for the
  // lifetime of this active session only.
  useEffect(() => {
    if (!active) return;
    const container = scrollRef.current;
    if (!container) return;
    const handlers: GridHandlers = {
      onPd: (toothNo, site, raw) => {
        const trimmed = raw.trim();
        suppressResyncRef.current = true;
        setPerioSite(toothNo, site, { pd: trimmed === "" ? null : Number(trimmed) });
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      onGm: (toothNo, site, raw) => {
        const trimmed = raw.trim();
        if (trimmed === "") return; // no explicit gm edit -> no-op (gm has no "unset" signal)
        suppressResyncRef.current = true;
        setPerioSite(toothNo, site, { gm: Number(trimmed) });
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      onBop: (toothNo, site, checked) => {
        suppressResyncRef.current = true;
        setPerioSite(toothNo, site, { bop: checked });
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      onMobility: (toothNo, value) => {
        suppressResyncRef.current = true;
        setToothMobility(toothNo, value);
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      // Cycle the Glickman grade none->I->II->III->IV->none for one entrance.
      // The current grade is read from the ACTIVE chart (getToothFurcation) so
      // a dual-state switch cycles the right
      // chart; the write always goes through setFurcation (no new mutation
      // path). grade 4 wraps to `null` (clears the entrance).
      onFurcation: (toothNo, entrance) => {
        const cur = getToothFurcation(toothNo)[entrance];
        const next = cur === undefined ? 1 : cur >= 4 ? null : cur + 1;
        suppressResyncRef.current = true;
        setFurcation(toothNo, entrance, next);
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      // Toggle one O'Leary plaque surface via setPlaque.
      onPlaque: (toothNo, surface) => {
        const present = getToothPlaque(toothNo).includes(surface);
        suppressResyncRef.current = true;
        setPlaque(toothNo, surface, !present);
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      // Cycle none->detectable->not-detectable->none for one tooth's CEJ
      // visibility. The current value is read from the ACTIVE
      // chart (getCejVisibility) so a dual-state switch cycles the right
      // chart; the write always goes through setCejVisibility (no new
      // mutation path).
      onCejVisibility: (toothNo) => {
        const cur = getCejVisibility(toothNo);
        const idx = CEJ_VISIBILITY_CYCLE.indexOf(cur);
        const next = CEJ_VISIBILITY_CYCLE[(idx + 1) % CEJ_VISIBILITY_CYCLE.length];
        suppressResyncRef.current = true;
        setCejVisibility(toothNo, next);
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      // Cycle none->mild->deep->none for one tooth's root concavity. Mirrors
      // onCejVisibility above.
      onRootConcavity: (toothNo) => {
        const cur = getRootConcavity(toothNo);
        const idx = ROOT_CONCAVITY_CYCLE.indexOf(cur);
        const next = ROOT_CONCAVITY_CYCLE[(idx + 1) % ROOT_CONCAVITY_CYCLE.length];
        suppressResyncRef.current = true;
        setRootConcavity(toothNo, next);
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      // Cycle one surface's PI/GI grade 0->1->2->3->0 (0 clears —
      // setPlaqueIndex/setGingivalIndex's own no-op-free "grade 0 clears"
      // semantics). The current grade is read from the ACTIVE chart
      // (getPlaqueIndex/getGingivalIndex) so a dual-state switch cycles the
      // right chart.
      onPiSurface: (toothNo, surface) => {
        const next = ((getPlaqueIndex(toothNo, surface) + 1) % 4) as 0 | 1 | 2 | 3;
        suppressResyncRef.current = true;
        setPlaqueIndex(toothNo, surface, next);
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      onGiSurface: (toothNo, surface) => {
        const next = ((getGingivalIndex(toothNo, surface) + 1) % 4) as 0 | 1 | 2 | 3;
        suppressResyncRef.current = true;
        setGingivalIndex(toothNo, surface, next);
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      // Cycle one surface's mPI/mBI grade 0->1->2->3->0, mirroring
      // onPiSurface/onGiSurface exactly. On a non-implant tooth the
      // cell is disabled (see syncToothCells) so this never fires from the UI;
      // setPeriImplantPlaque/setPeriImplantBleeding are ALSO implant-gated at
      // the data layer (no-op on a non-implant tooth), so this stays a no-op
      // even if invoked directly.
      onMpiSurface: (toothNo, surface) => {
        const next = ((getPeriImplantPlaque(toothNo, surface) + 1) % 4) as 0 | 1 | 2 | 3;
        suppressResyncRef.current = true;
        setPeriImplantPlaque(toothNo, surface, next);
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      onMbiSurface: (toothNo, surface) => {
        const next = ((getPeriImplantBleeding(toothNo, surface) + 1) % 4) as 0 | 1 | 2 | 3;
        suppressResyncRef.current = true;
        setPeriImplantBleeding(toothNo, surface, next);
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      // KG mm — trimmed-empty clears (mirrors onPd's empty-un-charts
      // semantics), otherwise the raw string is parsed and
      // clamped by setKeratinizedWidth itself.
      onKg: (toothNo, raw) => {
        const trimmed = raw.trim();
        suppressResyncRef.current = true;
        setKeratinizedWidth(toothNo, trimmed === "" ? null : Number(trimmed));
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      // Cycle unknown->thin->medium->thick->unknown for one tooth's gingival
      // thickness. Mirrors onCejVisibility above.
      onGingivalThickness: (toothNo) => {
        const cur = getGingivalThickness(toothNo);
        const idx = GINGIVAL_THICKNESS_CYCLE.indexOf(cur);
        const next = GINGIVAL_THICKNESS_CYCLE[(idx + 1) % GINGIVAL_THICKNESS_CYCLE.length];
        suppressResyncRef.current = true;
        setGingivalThickness(toothNo, next);
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
      // Cycle none->i->ii->iii->iv->none for one tooth's Miller class. Mirrors
      // onRootConcavity above.
      onMillerClass: (toothNo) => {
        const cur = getMillerClass(toothNo);
        const idx = MILLER_CLASS_CYCLE.indexOf(cur);
        const next = MILLER_CLASS_CYCLE[(idx + 1) % MILLER_CLASS_CYCLE.length];
        suppressResyncRef.current = true;
        setMillerClass(toothNo, next);
        suppressResyncRef.current = false;
        syncOneTooth(toothNo);
      },
    };

    // Current Settings -> Periodontal-tab row-visibility + index-name-mode +
    // implant-set snapshot, as a compact string so the rebuild below only
    // fires when any of them actually changes (mirrors the `implantSig`
    // pattern for the tooth-row graphic, see the effect further down).
    // `buildArch` reads `getPerioRowVisibility()`, `getPerioIndexNameMode()`,
    // and each arch's implant set (`archHasImplant`) once per build, so a
    // rebuild triggered by any of them changing re-renders row presence
    // (including the per-arch mPI/mBI gate) AND row label text from the
    // current snapshot.
    const visibilitySig = () => JSON.stringify([
      getPerioRowVisibility(),
      getPerioIndexNameMode(),
      // The mPI/mBI rows are gated per-arch on whether that arch contains an
      // implant (see `archHasImplant` in `buildArch`) — the
      // implant SET affects row presence, so a rebuild must also fire when it
      // changes (adding/removing an implant), not just on a visibility/name
      // flag flip.
      [...UPPER_ARCH, ...LOWER_ARCH].filter((n) => isToothImplant(n)).join(","),
    ]);
    let lastVisibilitySig: string | null = null;

    // (Re)build the entire arch grid's DOM from scratch — row presence is
    // gated inside `buildArch` itself on the CURRENT `getPerioRowVisibility()`
    // snapshot, so re-running this after a Settings toggle is what actually
    // hides/shows a row. Also used for the initial mount build. Clearing the
    // grid discards the tooth-row graphic containers (`buccalCell`/
    // `palatalCell`) too, so on a REBUILD (not the initial mount, when the
    // template cache hasn't loaded yet) this repopulates them from the
    // already-loaded cache — cheap, no network — so a row toggle never blanks
    // the always-visible tooth graphics/curves/overlay while the grid rows
    // around them change.
    const buildGrid = () => {
      const registry = new Map<number, ToothCellRefs>();
      container.innerHTML = "";
      const upper = buildArch(UPPER_ARCH, registry, handlers);
      const lower = buildArch(LOWER_ARCH, registry, handlers);
      container.appendChild(upper.grid);
      container.appendChild(lower.grid);
      registryRef.current = registry;
      gridUpperRef.current = upper.grid;
      gridLowerRef.current = lower.grid;
      buccalUpperRef.current = upper.buccalCell;
      palatalUpperRef.current = upper.palatalCell;
      buccalLowerRef.current = lower.buccalCell;
      palatalLowerRef.current = lower.palatalCell;
      lastVisibilitySig = visibilitySig();

      const cache = archCacheRef.current;
      if (cache) {
        applyArchColumns(gridUpperRef.current, UPPER_ARCH, cache, scrollRef.current);
        applyArchColumns(gridLowerRef.current, LOWER_ARCH, cache, scrollRef.current);
        // Each aspect gets its OWN grid cell — buccal into `buccalCell`,
        // palatal into `palatalCell`.
        buccalUpperRef.current.appendChild(buildBuccalArchSvg(cache, UPPER_ARCH, isToothImplant, undefined, getPerioToothKind));
        palatalUpperRef.current.appendChild(buildPalatalArchSvg(cache, UPPER_ARCH, isToothImplant, undefined, getPerioToothKind));
        buccalLowerRef.current.appendChild(buildBuccalArchSvg(cache, LOWER_ARCH, isToothImplant, undefined, getPerioToothKind));
        palatalLowerRef.current.appendChild(buildPalatalArchSvg(cache, LOWER_ARCH, isToothImplant, undefined, getPerioToothKind));
        drawArchCurves(cache, gridUpperRef.current, UPPER_ARCH);
        drawArchCurves(cache, gridLowerRef.current, LOWER_ARCH);
        const layer = getPerioOverlayLayer();
        drawArchOverlay(cache, gridUpperRef.current, UPPER_ARCH, layer);
        drawArchOverlay(cache, gridLowerRef.current, LOWER_ARCH, layer);
      }
    };

    buildGrid();
    fullResync();
    container.addEventListener("keydown", handleGridKeyDown);
    container.addEventListener("focusout", handleGridFocusOut);

    const unsubscribe = onStateChange(() => {
      if (suppressResyncRef.current) return;
      if (visibilitySig() !== lastVisibilitySig) buildGrid();
      fullResync();
    });
    return () => {
      container.removeEventListener("keydown", handleGridKeyDown);
      container.removeEventListener("focusout", handleGridFocusOut);
      unsubscribe();
      // The info popover is appended to document.body (outside `container`),
      // so it would otherwise be orphaned when the grid is torn down (dialog
      // close / inline unmount) — close it explicitly.
      hideInfoPopover();
      registryRef.current = null;
      gridUpperRef.current = null;
      gridLowerRef.current = null;
      buccalUpperRef.current = null;
      palatalUpperRef.current = null;
      buccalLowerRef.current = null;
      palatalLowerRef.current = null;
    };
  }, [active, fullResync, syncOneTooth, handleGridKeyDown, handleGridFocusOut]);

  // The tooth-row graphic — draws the perio arch by reusing the odontogram's
  // own `tooth-base` artwork (see `perioGraphic.ts`). Fully READ-ONLY (no
  // pointer handlers) and independent of the grid-building effect above — it
  // fetches + parses the 4 tooth templates once (`loadTemplateCache()`,
  // memoized at module scope in `perioGraphic.ts`, so re-opening/re-mounting
  // this component never re-fetches) and, once loaded, builds one composite
  // arch SVG per arch band into its own container. A load failure (e.g. no
  // network) is swallowed — this graphic is a presentation enhancement over
  // the existing data grid, never a hard dependency for charting to work.
  //
  // The curve overlay (CEJ + gingival-margin + pocket-base line + a filled
  // band) is drawn OVER each arch SVG here, driven by the per-site PD/GM data
  // via `perioCurve` / `buildPerioCurveLayer` (see `drawArchCurves`). It
  // reuses the SAME layout constants (`archToothLayout` / `ROW_BASELINE_Y`)
  // the teeth are laid out with, so it can never drift out of alignment. A
  // dedicated `onStateChange` subscription (NOT gated by `suppressResyncRef` —
  // the grid suppress flag only exists to skip a redundant *grid* fullResync
  // on the grid's own edit; the curve genuinely must redraw on every edit,
  // grid or external) recomputes the curves from the active chart, so they
  // live-update and reflect the status/plan chart. All still READ-ONLY — no
  // pointer handlers, all data via the data core API.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    // A tooth's graphic uses the implant fixture artwork when it's an implant on
    // the ACTIVE chart (`isToothImplant`, status/plan aware). The teeth are laid
    // out once when the template cache loads (below); a change to WHICH teeth are
    // implants (a dual-state chart switch, or an external edit while the chart is
    // open) is detected by this compact signature so the arch is rebuilt only
    // then — never on every perio keystroke, which merely redraws the curves.
    const implantSig = () =>
      [...UPPER_ARCH, ...LOWER_ARCH].filter((n) => isToothImplant(n)).join(",");
    let lastImplantSig: string | null = null;

    // Rebuild both arch tooth-row graphics from the cache, reading the current
    // implant selection. Wipes each container (removing any curve layers), so
    // the caller must redraw the curves afterwards.
    const buildArches = (cache: TemplateDocCache) => {
      const buccalUpper = buccalUpperRef.current;
      const palatalUpper = palatalUpperRef.current;
      const buccalLower = buccalLowerRef.current;
      const palatalLower = palatalLowerRef.current;
      if (buccalUpper) {
        buccalUpper.innerHTML = "";
        buccalUpper.appendChild(buildBuccalArchSvg(cache, UPPER_ARCH, isToothImplant, undefined, getPerioToothKind));
      }
      if (palatalUpper) {
        palatalUpper.innerHTML = "";
        palatalUpper.appendChild(buildPalatalArchSvg(cache, UPPER_ARCH, isToothImplant, undefined, getPerioToothKind));
      }
      if (buccalLower) {
        buccalLower.innerHTML = "";
        buccalLower.appendChild(buildBuccalArchSvg(cache, LOWER_ARCH, isToothImplant, undefined, getPerioToothKind));
      }
      if (palatalLower) {
        palatalLower.innerHTML = "";
        palatalLower.appendChild(buildPalatalArchSvg(cache, LOWER_ARCH, isToothImplant, undefined, getPerioToothKind));
      }
      lastImplantSig = implantSig();
    };

    const redraw = () => {
      const cache = archCacheRef.current;
      if (!cache) return;
      // Rebuild the teeth first if the implant set changed (cheap 32-tooth check),
      // then (re)draw the curves + the discrete overlay into the
      // fresh/existing arch SVGs. The overlay reads the active layer from the
      // module flag (getPerioOverlayLayer), so switching layers — which fires
      // notifyStateChange -> this redraw — repaints it.
      if (implantSig() !== lastImplantSig) buildArches(cache);
      drawArchCurves(cache, gridUpperRef.current, UPPER_ARCH);
      drawArchCurves(cache, gridLowerRef.current, LOWER_ARCH);
      const layer = getPerioOverlayLayer();
      drawArchOverlay(cache, gridUpperRef.current, UPPER_ARCH, layer);
      drawArchOverlay(cache, gridLowerRef.current, LOWER_ARCH, layer);
    };
    // (Re-)fit both arches' tooth columns to the CURRENT `scrollRef` width —
    // shared by the initial cache-load path and the
    // `ResizeObserver` callback below, so there is exactly one place that
    // reads the container width and calls `applyArchColumns`.
    const fitColumns = () => {
      const cache = archCacheRef.current;
      if (!cache) return;
      // Guard the debounced ResizeObserver path: an uncaught throw inside the
      // setTimeout callback would silently stop all future refits (matches the
      // try/catch shape of setupBridgeOverlayResize in odontogram.ts).
      try {
        applyArchColumns(gridUpperRef.current, UPPER_ARCH, cache, scrollRef.current);
        applyArchColumns(gridLowerRef.current, LOWER_ARCH, cache, scrollRef.current);
      } catch (e) {
        console.error("perio fitColumns failed", e);
      }
    };
    loadTemplateCache()
      .then((cache) => {
        if (cancelled) return;
        archCacheRef.current = cache;
        // Align the number-row columns to the real per-tooth arch widths,
        // scaled to fill the available container width, so the grid lines up
        // column-for-column with the teeth and leaves no empty space.
        fitColumns();
        buildArches(cache);
        drawArchCurves(cache, gridUpperRef.current, UPPER_ARCH);
        drawArchCurves(cache, gridLowerRef.current, LOWER_ARCH);
        const layer = getPerioOverlayLayer();
        drawArchOverlay(cache, gridUpperRef.current, UPPER_ARCH, layer);
        drawArchOverlay(cache, gridLowerRef.current, LOWER_ARCH, layer);
      })
      .catch((err) => {
         
        console.error("perio tooth-row graphic: failed to load tooth templates", err);
      });
    const unsubscribe = onStateChange(() => {
      if (!cancelled) redraw();
    });

    // Re-fit the columns whenever the SCROLL CONTAINER's own width changes
    // (window resize, sidebar collapse/expand, modal/inline
    // chrome swap, etc.) — mirrors `setupBridgeOverlayResize` in
    // odontogram.ts (same guard + debounce shape). Observes `scrollRef`
    // (`.perio-fullgrid-scroll`) deliberately, NOT the grid this resizes: the
    // scroll container's width is driven by the surrounding flex layout
    // (`align-items: stretch` cross-axis sizing) and is unaffected by its own
    // scrollable content (`overflow: auto` absorbs any column overflow), so
    // widening the grid columns here can never itself retrigger this
    // observer — no feedback loop. Debounced (like the bridge-overlay
    // observer) so a drag-resize doesn't recompute on every intermediate
    // frame.
    let resizeObserver: ResizeObserver | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    if (typeof ResizeObserver !== "undefined" && scrollRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          resizeTimer = null;
          if (!cancelled) fitColumns();
        }, 100);
      });
      resizeObserver.observe(scrollRef.current);
    }

    return () => {
      cancelled = true;
      unsubscribe();
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
      archCacheRef.current = null;
    };
  }, [active, anatomy]);

  // Mirror the module-level overlay-layer flag into React state so the
  // switcher's active button + header read-out re-render on change.
  // Active-gated (like every other real-module effect here) so a closed/
  // unmounted PerioChart never touches "./odontogram". `setPerioOverlayLayer`
  // fires notifyStateChange, so a click anywhere (this instance or another
  // consumer) keeps every mounted switcher in sync.
  useEffect(() => {
    if (!active) return;
    setOverlayLayer(getPerioOverlayLayer());
    const unsubscribe = onStateChange(() => setOverlayLayer(getPerioOverlayLayer()));
    return unsubscribe;
  }, [active]);

  // Same mirror for the anatomy profile. `setToothAnatomy` notifies AFTER the
  // profile is in place, so this lands once and the effect below re-parses the
  // new profile's templates.
  useEffect(() => {
    if (!active) return;
    setAnatomy(getToothAnatomy());
    return onStateChange(() => setAnatomy(getToothAnatomy()));
  }, [active]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;
      if (e.shiftKey && activeEl === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && activeEl === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    },
    [onClose],
  );

  if (!active) return null;

  // The Dental Chart index switcher — a radio-style toggle row that drives
  // `setPerioOverlayLayer`, showing the active selection and the matching
  // whole-mouth read-out. Rendered in the Dental Chart header (inline chrome)
  // and the overlay header (popup chrome). Every read-out-bearing overlay
  // (bop/plaque/pi/gi/kg/mpi/mbi) sources its score from `summary` — labelled
  // via `t("perio.overlay.<layer>")` (or the dedicated %BOP/plaque% label),
  // showing "—" when the score is null (e.g. a graded index with nothing
  // charted yet).
  const overlayReadout =
    overlayLayer === "bop"
      ? `${t("perio.bopPercent")} ${summary.bopPercent}%`
      : overlayLayer === "plaque"
      ? `${t("plaque.percent")} ${summary.plaquePercent}%`
      : overlayLayer === "pi"
      ? `${t("perio.overlay.pi")} ${summary.piScore ?? "—"}`
      : overlayLayer === "gi"
      ? `${t("perio.overlay.gi")} ${summary.giScore ?? "—"}`
      : overlayLayer === "kg"
      ? `${t("perio.overlay.kg")} ${summary.kgDeficientTeeth}`
      : overlayLayer === "mpi"
      ? `${t("perio.overlay.mpi")} ${summary.mpiScore ?? "—"}`
      : overlayLayer === "mbi"
      ? `${t("perio.overlay.mbi")} ${summary.mbiScore ?? "—"}`
      : null;
  const overlaySwitch = (
    <div id="perioOverlaySwitch" className="perio-overlay-switch" role="radiogroup" aria-label={t("perio.overlay.label")}>
      {SWITCHER_LAYERS.map((layer) => (
        <button
          key={layer}
          type="button"
          role="radio"
          aria-checked={overlayLayer === layer}
          className={"perio-overlay-switch-btn" + (overlayLayer === layer ? " is-active" : "")}
          data-overlay-layer={layer}
          onClick={() => setPerioOverlayLayer(layer)}
        >
          {overlaySwitchLabel(layer)}
        </button>
      ))}
      {overlayReadout && (
        <span className="perio-overlay-readout" id="perioOverlayReadout">
          {overlayReadout}
        </span>
      )}
    </div>
  );

  // The whole-mouth summary bar + case-metadata/2017 classification panel
  // live in a standalone `<PerioSidebar/>` (`src/PerioSidebar.tsx`). The
  // shared right `<aside className="panel">` in `<App/>` renders it in place
  // of the odontogram controls whenever the perio (Dental Chart) view is
  // active, so the INLINE chrome doesn't repeat it in the chart body. The
  // POPUP chrome (this component's `!inline` branch, below) DOES render it
  // directly — the modal overlay must be a complete surface on its own, since
  // `<App/>`'s aside is NOT perio-gated while `viewMode === "popup"`.
  //
  // `gridBody` is just the grid itself, shared unchanged by both chrome
  // variants — only the wrapping id/class differs (`#perioInlineGrid` vs
  // `#perioOverlayGrid`) so the two never collide with each other or with the
  // tooth-panel's always-present `#perioGrid`.
  const gridBody = (
    <div id={inline ? "perioInlineGrid" : "perioOverlayGrid"} className="perio-overlay-body" aria-label={t("perio.chart.title")}>
      <div className="perio-fullgrid-scroll" ref={scrollRef}></div>
    </div>
  );

  if (inline) {
    // Plain embedded panel — no dialog semantics, no close button, no
    // backdrop/Esc/focus-trap (see the class-level doc comment). Reuses the
    // existing `.chart`/`.chart-header`/`.chart-title` card look (index.css)
    // so it visually matches the odontogram card it's replacing in place.
    return (
      <section id="perioInlinePanel" className="chart perio-inline-panel" aria-label={t("perio.chart.title")}>
        <div className="chart-header perio-chart-header">
          <div className="chart-title">{t("perio.chart.title")}</div>
          {overlaySwitch}
        </div>
        {gridBody}
      </section>
    );
  }

  return (
    <div
      ref={dialogRef}
      id="perioOverlay"
      className="perio-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="perio-overlay-panel">
        <div className="perio-overlay-header">
          <h2 className="perio-overlay-title" id={titleId}>
            {t("perio.chart.title")}
          </h2>
          {overlaySwitch}
          <button
            type="button"
            className="perio-overlay-close"
            onClick={onClose}
            aria-label={t("perio.close")}
            title={t("perio.close")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <PerioSidebar />
        {gridBody}
      </div>
    </div>
  );
}
