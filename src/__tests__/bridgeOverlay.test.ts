// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  detectBridgeSpans,
  computeBridgeBars,
  renderBridgeOverlay,
  defaultMaterialColor,
  BRIDGE_OVERLAY_CLASS,
  BRIDGE_BAR_CLASS,
  type BridgeToothState,
  type GetToothState,
  type GridRelativeRect,
} from "../bridgeOverlay";
import { buildOdontogramSvg, __setToothStateForTest, destroyOdontogram } from "../odontogram";

/** Build a getState from a plain map of toothNo -> partial state. */
function stateGetter(map: Record<number, BridgeToothState>): GetToothState {
  return (tn) => map[tn];
}

describe("detectBridgeSpans", () => {
  // NOTE ON ORDER: spans come out in VISUAL left-to-right order (the arch scan
  // order), which is the order the bars require so consecutive-in-array ==
  // visually-adjacent. The upper arch array runs 18..11 then 21..28, so within
  // quadrant 1 (11-18) the FDI numbers descend: a 13-14-15 bridge is therefore
  // returned as [15, 14, 13] (same set, reversed reading direction). This is
  // deliberate; sorting ascending would break adjacency for midline-crossing
  // spans (e.g. 12-11-21-22).
  it("returns a single span for a 13-14-15 bridge run (visual order)", () => {
    const get = stateGetter({
      13: { restorationType: "bridge" },
      14: { restorationType: "bridge" },
      15: { restorationType: "bridge" },
    });
    expect(detectBridgeSpans(get)).toEqual([[15, 14, 13]]);
  });

  it("treats a pillar (bridgePillar) tooth as a bridge tooth", () => {
    const get = stateGetter({
      13: { bridgePillar: true, restorationType: "crown" },
      14: { restorationType: "bridge" },
      15: { bridgePillar: true, restorationType: "crown" },
    });
    expect(detectBridgeSpans(get)).toEqual([[15, 14, 13]]);
  });

  it("emits no span for an isolated bridge tooth", () => {
    const get = stateGetter({ 14: { restorationType: "bridge" } });
    expect(detectBridgeSpans(get)).toEqual([]);
  });

  it("never joins a run across the 28|48 arch boundary", () => {
    // 28 (end of upper arch) and 48 (start of lower arch) are array-adjacent in
    // ALL_TEETH but belong to separate arches.
    const get = stateGetter({
      28: { restorationType: "bridge" },
      48: { restorationType: "bridge" },
    });
    expect(detectBridgeSpans(get)).toEqual([]);
  });

  it("detects independent spans in each arch", () => {
    const get = stateGetter({
      13: { restorationType: "bridge" },
      14: { restorationType: "bridge" },
      36: { restorationType: "bridge" },
      37: { restorationType: "bridge" },
      38: { restorationType: "bridge" },
    });
    // Q1 descends (14 before 13 in the arch array); Q3 (36-38) ascends.
    expect(detectBridgeSpans(get)).toEqual([[14, 13], [36, 37, 38]]);
  });

  it("splits non-adjacent bridge teeth into separate (sub-2 -> dropped) runs", () => {
    const get = stateGetter({
      13: { restorationType: "bridge" },
      15: { restorationType: "bridge" },
    });
    expect(detectBridgeSpans(get)).toEqual([]);
  });

  it("merges two adjacent distinct bridges (documented limitation)", () => {
    // 13-14 and 15-16 as two clinically separate bridges cannot be told apart
    // from state alone; they merge into one run.
    const get = stateGetter({
      13: { restorationType: "bridge" },
      14: { restorationType: "bridge" },
      15: { restorationType: "bridge" },
      16: { restorationType: "bridge" },
    });
    expect(detectBridgeSpans(get)).toEqual([[16, 15, 14, 13]]);
  });

  it("ignores non-bridge teeth entirely", () => {
    const get = stateGetter({
      14: { restorationType: "crown" },
      15: { restorationType: "none" },
    });
    expect(detectBridgeSpans(get)).toEqual([]);
  });
});

describe("computeBridgeBars", () => {
  // A tidy row of tiles 100px wide, 120px tall, 4px gap.
  const rowRect = (index: number): GridRelativeRect => ({
    x: index * 104,
    y: 10,
    width: 100,
    height: 120,
  });

  it("produces one bar per consecutive pair (2 bars for a 3-tooth span)", () => {
    const spans = [[13, 14, 15]];
    const idx: Record<number, number> = { 13: 0, 14: 1, 15: 2 };
    const rectFor = (tn: number) => rowRect(idx[tn]);
    const get = stateGetter({
      13: { restorationType: "bridge", restorationMaterial: "gold" },
      14: { restorationType: "bridge", restorationMaterial: "gold" },
      15: { restorationType: "bridge", restorationMaterial: "gold" },
    });
    const bars = computeBridgeBars(spans, get, rectFor, defaultMaterialColor);
    expect(bars).toHaveLength(2);
    expect(bars[0].fill).toBe(defaultMaterialColor("gold"));
    // Bar sits at the gum line (~0.72 of tile height) with positive width.
    for(const bar of bars){
      expect(bar.width).toBeGreaterThan(0);
      expect(bar.y).toBeGreaterThan(10 + 120 * 0.6);
    }
  });

  it("skips a pair whose tile rect is missing (hidden tooth)", () => {
    const spans = [[13, 14, 15]];
    const rectFor = (tn: number): GridRelativeRect | null =>
      tn === 14 ? null : rowRect(tn === 13 ? 0 : 2);
    const get = stateGetter({
      13: { restorationType: "bridge" },
      14: { restorationType: "bridge" },
      15: { restorationType: "bridge" },
    });
    // Both pairs (13-14, 14-15) touch the hidden tooth -> no bars.
    expect(computeBridgeBars(spans, get, rectFor, defaultMaterialColor)).toHaveLength(0);
  });

  it("skips a zero-sized tile rect", () => {
    const spans = [[13, 14]];
    const rectFor = (tn: number): GridRelativeRect =>
      tn === 13 ? { x: 0, y: 0, width: 0, height: 0 } : rowRect(1);
    const get = stateGetter({ 13: { restorationType: "bridge" }, 14: { restorationType: "bridge" } });
    expect(computeBridgeBars(spans, get, rectFor, defaultMaterialColor)).toHaveLength(0);
  });
});

describe("renderBridgeOverlay (jsdom)", () => {
  let grid: HTMLElement;

  function addSideTile(toothNo: number, rect: { left: number; top: number; width: number; height: number }) {
    const tile = document.createElement("div");
    tile.className = "tooth-tile side-view";
    tile.setAttribute("data-tooth", String(toothNo));
    tile.getBoundingClientRect = () =>
      ({ left: rect.left, top: rect.top, width: rect.width, height: rect.height,
         right: rect.left + rect.width, bottom: rect.top + rect.height, x: rect.left, y: rect.top,
         toJSON: () => ({}) }) as DOMRect;
    grid.appendChild(tile);
    return tile;
  }

  beforeEach(() => {
    document.body.innerHTML = "";
    grid = document.createElement("div");
    grid.id = "toothGrid";
    grid.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 1600, height: 300, right: 1600, bottom: 300, x: 0, y: 0,
         toJSON: () => ({}) }) as DOMRect;
    document.body.appendChild(grid);
  });

  it("draws 2 saddle bars for a 13-14-15 bridge", () => {
    addSideTile(13, { left: 0, top: 10, width: 100, height: 120 });
    addSideTile(14, { left: 104, top: 10, width: 100, height: 120 });
    addSideTile(15, { left: 208, top: 10, width: 100, height: 120 });
    const get: GetToothState = (tn) =>
      [13, 14, 15].includes(tn) ? { restorationType: "bridge", restorationMaterial: "zircon" } : undefined;

    renderBridgeOverlay({ grid, getState: get });

    const overlay = grid.querySelector(`svg.${BRIDGE_OVERLAY_CLASS}`);
    expect(overlay).toBeTruthy();
    expect(overlay!.querySelectorAll(`rect.${BRIDGE_BAR_CLASS}`)).toHaveLength(2);
  });

  it("draws 0 bars for an isolated bridge tooth", () => {
    addSideTile(14, { left: 104, top: 10, width: 100, height: 120 });
    const get: GetToothState = (tn) =>
      tn === 14 ? { restorationType: "bridge" } : undefined;

    renderBridgeOverlay({ grid, getState: get });

    const overlay = grid.querySelector(`svg.${BRIDGE_OVERLAY_CLASS}`);
    const count = overlay ? overlay.querySelectorAll(`rect.${BRIDGE_BAR_CLASS}`).length : 0;
    expect(count).toBe(0);
  });

  it("clears stale bars when the bridge is removed", () => {
    addSideTile(13, { left: 0, top: 10, width: 100, height: 120 });
    addSideTile(14, { left: 104, top: 10, width: 100, height: 120 });
    let bridge = true;
    const get: GetToothState = (tn) =>
      bridge && [13, 14].includes(tn) ? { restorationType: "bridge" } : undefined;

    renderBridgeOverlay({ grid, getState: get });
    expect(grid.querySelectorAll(`rect.${BRIDGE_BAR_CLASS}`)).toHaveLength(1);

    bridge = false;
    renderBridgeOverlay({ grid, getState: get });
    expect(grid.querySelectorAll(`rect.${BRIDGE_BAR_CLASS}`)).toHaveLength(0);
  });

  it("never throws when the grid is absent", () => {
    expect(() => renderBridgeOverlay({ grid: null, getState: () => undefined })).not.toThrow();
  });
});

describe("buildOdontogramSvg export includes span bars", () => {
  function mockRect(el: Element, r: { left: number; top: number; width: number; height: number }) {
    (el as HTMLElement).getBoundingClientRect = () =>
      ({ left: r.left, top: r.top, width: r.width, height: r.height,
         right: r.left + r.width, bottom: r.top + r.height, x: r.left, y: r.top,
         toJSON: () => ({}) }) as DOMRect;
  }

  function addSideTile(grid: HTMLElement, toothNo: number, left: number) {
    const tile = document.createElement("div");
    tile.className = "tooth-tile side-view";
    tile.setAttribute("data-tooth", String(toothNo));
    const svgWrap = document.createElement("div");
    svgWrap.className = "tooth-svg";
    tile.appendChild(svgWrap);
    grid.appendChild(tile);
    mockRect(tile, { left, top: 10, width: 100, height: 120 });
  }

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    // Engine was never initialized, so destroyOdontogram() is a no-op for the
    // module state map; reset the teeth we touched to defaults to avoid bleed.
    for(const tn of [13, 14, 15]) __setToothStateForTest(tn, {});
    destroyOdontogram();
  });

  it("emits bridge-overlay-bar <rect> elements into the export SVG", () => {
    const grid = document.createElement("div");
    grid.id = "toothGrid";
    grid.className = "tooth-grid";
    mockRect(grid, { left: 0, top: 0, width: 1600, height: 300 });
    document.body.appendChild(grid);

    addSideTile(grid, 13, 0);
    addSideTile(grid, 14, 104);
    addSideTile(grid, 15, 208);

    __setToothStateForTest(13, { restorationType: "bridge", restorationMaterial: "gold" });
    __setToothStateForTest(14, { restorationType: "bridge", restorationMaterial: "gold" });
    __setToothStateForTest(15, { restorationType: "bridge", restorationMaterial: "gold" });

    const built = buildOdontogramSvg();
    expect(built).toBeTruthy();
    const occurrences = built!.xml.split(`class="${BRIDGE_BAR_CLASS}"`).length - 1;
    expect(occurrences).toBe(2); // two inter-tile gaps in a 3-tooth span
    expect(built!.xml).toContain(defaultMaterialColor("gold"));
  });

  it("emits no bars when there is no multi-tooth span", () => {
    const grid = document.createElement("div");
    grid.id = "toothGrid";
    grid.className = "tooth-grid";
    mockRect(grid, { left: 0, top: 0, width: 1600, height: 300 });
    document.body.appendChild(grid);

    addSideTile(grid, 14, 104);
    __setToothStateForTest(14, { restorationType: "bridge" });

    const built = buildOdontogramSvg();
    expect(built).toBeTruthy();
    expect(built!.xml).not.toContain(`class="${BRIDGE_BAR_CLASS}"`);
  });
});
