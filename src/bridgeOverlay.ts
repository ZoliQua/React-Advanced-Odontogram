// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Multi-tooth bridge-span OVERLAY subsystem.
 *
 * Bridges are rendered PER-TOOTH by the core engine: each bridge tooth draws its
 * own `{material}-bridge-connector` saddle inside its own tile SVG. Because the
 * tiles sit in a CSS grid with a real, variable gap between them, a bridge that
 * spans several teeth shows visible breaks in the saddle at every inter-tile gap.
 *
 * This module derives the multi-tooth spans from tooth state and draws a single
 * engine-owned overlay `<svg>` over `#toothGrid` that fills those gaps with a
 * gum-line saddle bar, so a run of bridge teeth reads as one continuous bridge.
 *
 * The overlay is purely presentational: it reads DOM geometry + tooth state and
 * introduces no new tooth-state field. The same bar geometry is reused by the
 * SVG/PNG/JPG export path so the exported image includes the span bars too.
 *
 * Standalone-library rule: no DentalQuoteCreator-specific dependencies.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

/** Minimal shape of tooth state this module reads. */
export interface BridgeToothState {
  restorationType?: string;
  restorationMaterial?: string;
  bridgePillar?: boolean;
}

/** Reads a tooth's current state by FDI tooth number. May return undefined. */
export type GetToothState = (toothNo: number) => BridgeToothState | undefined | null;

/** Maps a restoration material key to a solid CSS color for the saddle bar. */
export type MaterialColor = (material: string) => string;

/**
 * The two dental arches, in visual left-to-right order (mirrors `ALL_TEETH` in
 * `odontogram.ts`). Array-adjacent == visually adjacent WITHIN an arch. The two
 * arches are scanned independently so a span never joins across the 28|48
 * boundary.
 */
const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const ARCHES: readonly (readonly number[])[] = [UPPER_ARCH, LOWER_ARCH];

// Saddle bar geometry (fractions of the tile box). Shared by the live overlay
// and the export pass so both stay byte-consistent.
/** Vertical center of the saddle bar, as a fraction of tile height (gum line),
 *  for an UPPER-arch tile. */
export const SADDLE_Y_FRACTION = 0.72;
/**
 * Vertical center of the saddle bar for a LOWER-arch tile. Lower-arch tiles are
 * rendered rotated 180°, so the anatomically-correct position is the TRUE
 * mirror of the upper value about the tile mid-line: `1 - SADDLE_Y_FRACTION`.
 * Anchoring the lower fraction to the proven upper value via the geometric
 * mirror keeps both arches consistent by construction. Still a visual quantity
 * — verify on a real render and nudge this single number if the lower saddle
 * needs it.
 */
export const SADDLE_Y_FRACTION_LOWER = 1 - SADDLE_Y_FRACTION;
/** Thickness of the saddle bar, as a fraction of tile height. */
export const SADDLE_THICKNESS = 0.09;
/** How far the bar overlaps into each adjacent tile, as a fraction of tile width. */
export const SADDLE_OVERLAP = 0.12;

/**
 * Default material -> solid color map for the saddle bar, mirroring the fill of
 * the per-tooth `{material}-bridge-connector` layers in the tooth SVGs. The two
 * gradient materials (emax, metal-ceramic) are approximated by a representative
 * solid color; the per-tooth saddle still shows the true gradient inside the tile.
 */
const DEFAULT_MATERIAL_COLORS: Record<string, string> = {
  emax: "#e9e1d2",
  gold: "#ece614",
  gradia: "#55ff98",
  zircon: "#feffbf",
  metal: "#0051bf",
  "metal-ceramic": "#c9ccd1",
  telescope: "#0051bf",
  temporary: "#ffffff",
};

/** Default color resolver used when no `materialColor` dependency is provided. */
export function defaultMaterialColor(material: string): string {
  return DEFAULT_MATERIAL_COLORS[material] ?? "#8a8f98";
}

function isBridgeTooth(s: BridgeToothState | undefined | null): boolean {
  if(!s) return false;
  return s.restorationType === "bridge" || s.bridgePillar === true;
}

/**
 * Derive multi-tooth bridge spans from tooth state.
 *
 * A span is a maximal run of consecutive teeth WITHIN a single arch where each
 * tooth is a bridge tooth (`restorationType === "bridge"` OR `bridgePillar`).
 * Only runs of length >= 2 are returned (an isolated bridge tooth is not a span).
 *
 * Documented limitation: two distinct bridges that happen to sit on adjacent
 * teeth (e.g. 13-14 and 15-16 with a shared-looking gum line) are merged into a
 * single run, because state carries no per-bridge grouping id. This matches the
 * per-tooth rendering, which likewise cannot tell them apart.
 *
 * @param getState - Reads a tooth's state by FDI number.
 * @returns Arrays of consecutive tooth numbers, each of length >= 2.
 */
export function detectBridgeSpans(getState: GetToothState): number[][] {
  const spans: number[][] = [];
  for(const arch of ARCHES){
    let run: number[] = [];
    for(const tn of arch){
      if(isBridgeTooth(getState(tn))){
        run.push(tn);
      }else{
        if(run.length >= 2) spans.push(run);
        run = [];
      }
    }
    if(run.length >= 2) spans.push(run);
  }
  return spans;
}

/**
 * Pick the material color for a span: prefer the first bridge tooth with an
 * explicit restoration material, then any pillar's material, else "metal".
 */
function spanMaterial(span: number[], getState: GetToothState): string {
  for(const tn of span){
    const s = getState(tn);
    if(s && s.restorationType === "bridge" && s.restorationMaterial && s.restorationMaterial !== "none"){
      return s.restorationMaterial;
    }
  }
  for(const tn of span){
    const s = getState(tn);
    if(s && s.restorationMaterial && s.restorationMaterial !== "none") return s.restorationMaterial;
  }
  return "metal";
}

/** A tile's box in grid-relative coordinates (x = left - gridLeft, etc.). */
export interface GridRelativeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Resolves a tooth's tile box in grid-relative coordinates, or null if hidden. */
export type RectFor = (toothNo: number) => GridRelativeRect | null;

/** A single saddle bar to draw, in grid-relative coordinates. */
export interface BridgeBar {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

/**
 * Compute the saddle bars that fill the inter-tile gaps of every span. This is
 * the single source of truth for bar geometry, shared by the live overlay and
 * the export pass.
 *
 * Guards: any pair whose tile rect is missing or zero-sized (occlusal view,
 * collapsed arch) is skipped rather than throwing. A pair whose computed width
 * is non-positive (overlapping tiles) is also skipped.
 *
 * @param spans - Output of {@link detectBridgeSpans}.
 * @param getState - Reads a tooth's state by FDI number (for material color).
 * @param rectFor - Resolves each tooth's grid-relative tile box.
 * @param materialColor - Resolves a material key to a solid color.
 */
export function computeBridgeBars(
  spans: number[][],
  getState: GetToothState,
  rectFor: RectFor,
  materialColor: MaterialColor,
): BridgeBar[] {
  const bars: BridgeBar[] = [];
  for(const span of spans){
    const fill = materialColor(spanMaterial(span, getState));
    // Lower-arch tooth numbers are 31-48 (see LOWER_ARCH); every tooth in a
    // span belongs to the same arch (detectBridgeSpans never crosses the
    // 28|48 boundary), so the first tooth number tells the whole span's arch.
    const isLower = span[0] >= 31;
    const yFraction = isLower ? SADDLE_Y_FRACTION_LOWER : SADDLE_Y_FRACTION;
    for(let i = 0; i < span.length - 1; i++){
      const a = rectFor(span[i]);
      const b = rectFor(span[i + 1]);
      if(!a || !b) continue;
      if(a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) continue;
      // Left/right inner edges of the gap, in case array order and visual order
      // ever diverge, derive from actual geometry.
      const leftRect = a.x <= b.x ? a : b;
      const rightRect = a.x <= b.x ? b : a;
      const overlap = Math.min(leftRect.width, rightRect.width) * SADDLE_OVERLAP;
      const x0 = leftRect.x + leftRect.width - overlap;
      const x1 = rightRect.x + overlap;
      const width = x1 - x0;
      if(width <= 0) continue;
      const height = leftRect.height * SADDLE_THICKNESS;
      const midY = leftRect.y + leftRect.height * yFraction;
      bars.push({ x: x0, y: midY - height / 2, width, height, fill });
    }
  }
  return bars;
}

/** Dependencies for {@link renderBridgeOverlay}. */
export interface RenderBridgeOverlayDeps {
  /** The `#toothGrid` element (host of the overlay). */
  grid: HTMLElement | null;
  /** Reads a tooth's state by FDI number. */
  getState: GetToothState;
  /** Optional material -> color resolver; defaults to {@link defaultMaterialColor}. */
  materialColor?: MaterialColor;
}

/** The class marking the single engine-owned overlay SVG. */
export const BRIDGE_OVERLAY_CLASS = "bridge-overlay";
/** The class marking each saddle bar rect (live + export). */
export const BRIDGE_BAR_CLASS = "bridge-overlay-bar";

/** Locate the side-view tile for a tooth (the tile that draws the saddle). */
function sideTile(grid: HTMLElement, toothNo: number): HTMLElement | null {
  return grid.querySelector(
    `.tooth-tile.side-view[data-tooth="${toothNo}"]`,
  ) as HTMLElement | null;
}

/**
 * Resolve a tooth's side-view tile box in grid-relative coordinates, or null if
 * the tile is absent or hidden (zero-sized). Shared by the live overlay and the
 * export pass so both read geometry identically.
 *
 * @param grid - The `#toothGrid` element.
 * @param gridRect - The grid's own `getBoundingClientRect()` (origin).
 * @param toothNo - FDI tooth number.
 */
export function tileRectFor(
  grid: HTMLElement,
  gridRect: { left: number; top: number },
  toothNo: number,
): GridRelativeRect | null {
  const tile = sideTile(grid, toothNo);
  if(!tile) return null;
  const r = tile.getBoundingClientRect();
  if(r.width === 0 || r.height === 0) return null;
  return { x: r.left - gridRect.left, y: r.top - gridRect.top, width: r.width, height: r.height };
}

/**
 * Ensure a single `<svg class="bridge-overlay">` child of the grid and (re)draw
 * the bridge-span saddle bars into it. Idempotent: clears and redraws on every
 * call. No-op (never throws) when the grid is absent or there are no spans.
 *
 * The overlay is positioned by CSS (`position:absolute; inset:0`); its intrinsic
 * size/viewBox is synced to the grid box so bar coordinates map 1:1 to pixels.
 */
export function renderBridgeOverlay(deps: RenderBridgeOverlayDeps): void {
  const { grid } = deps;
  if(!grid) return;
  const materialColor = deps.materialColor ?? defaultMaterialColor;

  let overlay = grid.querySelector(
    `:scope > svg.${BRIDGE_OVERLAY_CLASS}`,
  ) as SVGSVGElement | null;

  const spans = detectBridgeSpans(deps.getState);
  if(spans.length === 0){
    // Clear any stale bars but do not create a fresh overlay for an empty grid.
    if(overlay){ while(overlay.firstChild) overlay.removeChild(overlay.firstChild); }
    return;
  }

  const gridRect = grid.getBoundingClientRect();
  const rectFor: RectFor = (toothNo) => tileRectFor(grid, gridRect, toothNo);

  const bars = computeBridgeBars(spans, deps.getState, rectFor, materialColor);

  if(!overlay){
    overlay = document.createElementNS(SVG_NS, "svg");
    overlay.setAttribute("class", BRIDGE_OVERLAY_CLASS);
    overlay.setAttribute("aria-hidden", "true");
    grid.appendChild(overlay);
  }
  while(overlay.firstChild) overlay.removeChild(overlay.firstChild);

  const W = Math.max(1, Math.round(gridRect.width));
  const H = Math.max(1, Math.round(gridRect.height));
  overlay.setAttribute("width", String(W));
  overlay.setAttribute("height", String(H));
  overlay.setAttribute("viewBox", `0 0 ${W} ${H}`);

  for(const bar of bars){
    overlay.appendChild(barRect(bar));
  }
}

/**
 * Build a saddle-bar `<rect>` SVG element in the current document. Shared by the
 * live overlay and the export path so the two draw identical geometry.
 */
export function barRect(bar: BridgeBar): SVGRectElement {
  const rect = document.createElementNS(SVG_NS, "rect");
  rect.setAttribute("class", BRIDGE_BAR_CLASS);
  rect.setAttribute("x", String(bar.x));
  rect.setAttribute("y", String(bar.y));
  rect.setAttribute("width", String(bar.width));
  rect.setAttribute("height", String(bar.height));
  const r = Math.min(bar.height / 2, bar.width / 2);
  rect.setAttribute("rx", String(r));
  rect.setAttribute("ry", String(r));
  rect.setAttribute("fill", bar.fill);
  rect.setAttribute("stroke", "#1b3f1c");
  rect.setAttribute("stroke-width", "0.5");
  return rect;
}
