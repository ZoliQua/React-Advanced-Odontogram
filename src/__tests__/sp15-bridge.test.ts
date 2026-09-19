// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { composeRestorationLayers } from "../registry/restorations";
import { computeBridgeBars, SADDLE_Y_FRACTION, SADDLE_Y_FRACTION_LOWER, defaultMaterialColor,
  type GetToothState, type GridRelativeRect } from "../bridgeOverlay";
import {
  __parseSvgForTest, __renderActiveLayersOnNode, __setToothStateForTest, __applyStatusExtraForTest,
  onStateChange,
} from "../odontogram";

// NOTE: `import.meta.url` captured in a variable first — see sp14-ortho-render.test.ts
// for why (Vite statically rewrites inline `new URL('literal', import.meta.url)`).
const testFileUrl = import.meta.url;
const svg11Text = readFileSync(fileURLToPath(new URL("../assets/teeth-svgs/11.svg", testFileUrl)), "utf8");

describe("SP15 Task 2: bridge rendering fixes (B8 crown+connector, B8 arch-aware saddle, B9 Statuses overlay trigger)", () => {
  describe("composeRestorationLayers('bridge', ...) — B8 crown cap", () => {
    it("returns BOTH the crown layer and the connector layer for gold", () => {
      const ids = composeRestorationLayers("bridge", "gold", "front");
      expect(ids).toContain("gold-crown");
      expect(ids).toContain("gold-bridge-connector");
    });
    it("returns the 3-id telescope crown set plus the telescope connector", () => {
      const ids = composeRestorationLayers("bridge", "telescope", "front");
      expect(ids).toContain("telescope-crown");
      expect(ids).toContain("telescope-crown-inside");
      expect(ids).toContain("telescope-crown-outside");
      expect(ids).toContain("telescope-bridge-connector");
    });
    it("every bridge material composes a crown id + a connector id", () => {
      const materials = ["emax", "gold", "gradia", "zircon", "metal", "metal-ceramic", "telescope", "temporary"] as const;
      for(const m of materials){
        const ids = composeRestorationLayers("bridge", m, "front");
        expect(ids).toContain(`${m}-bridge-connector`);
        expect(ids.some(id => id.startsWith(`${m}-crown`) || id === "telescope-crown")).toBe(true);
      }
    });
  });

  describe("render: a present bridge tooth activates crown + connector layers", () => {
    const render = (state: Record<string, unknown>) => {
      const node = __parseSvgForTest(svg11Text);
      return __renderActiveLayersOnNode(node, 11, state);
    };
    const ids = (layers: { id: string }[]) => layers.map(l => l.id);

    it("present tooth-base, restorationType:bridge, restorationMaterial:gold activates gold-crown AND gold-bridge-connector", () => {
      const l = render({ toothSelection: "tooth-base", restorationType: "bridge", restorationMaterial: "gold" });
      expect(ids(l)).toContain("gold-crown");
      expect(ids(l)).toContain("gold-bridge-connector");
    });

    it("switching from bridge to none on the SAME node clears both layers (reused-node symmetry)", () => {
      const node = __parseSvgForTest(svg11Text);
      __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base", restorationType: "bridge", restorationMaterial: "gold" });
      const after = __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base", restorationType: "none", restorationMaterial: "none" });
      expect(ids(after)).not.toContain("gold-crown");
      expect(ids(after)).not.toContain("gold-bridge-connector");
    });
  });

  describe("computeBridgeBars — B8 arch-aware saddle y", () => {
    const rowRect = (index: number): GridRelativeRect => ({ x: index * 104, y: 10, width: 100, height: 120 });

    it("places the bar at SADDLE_Y_FRACTION for an UPPER-arch span (e.g. 13-14)", () => {
      const spans = [[13, 14]];
      const idx: Record<number, number> = { 13: 0, 14: 1 };
      const rectFor = (tn: number) => rowRect(idx[tn]);
      const get: GetToothState = () => ({ restorationType: "bridge", restorationMaterial: "gold" });
      const bars = computeBridgeBars(spans, get, rectFor, defaultMaterialColor);
      expect(bars).toHaveLength(1);
      const expectedMidY = 10 + 120 * SADDLE_Y_FRACTION;
      expect(bars[0].y + bars[0].height / 2).toBeCloseTo(expectedMidY, 5);
    });

    it("places the bar at SADDLE_Y_FRACTION_LOWER for a LOWER-arch span (e.g. 46-47), which differs from the upper fraction", () => {
      const spans = [[46, 47]];
      const idx: Record<number, number> = { 46: 0, 47: 1 };
      const rectFor = (tn: number) => rowRect(idx[tn]);
      const get: GetToothState = () => ({ restorationType: "bridge", restorationMaterial: "gold" });
      const bars = computeBridgeBars(spans, get, rectFor, defaultMaterialColor);
      expect(bars).toHaveLength(1);
      const expectedMidY = 10 + 120 * SADDLE_Y_FRACTION_LOWER;
      expect(bars[0].y + bars[0].height / 2).toBeCloseTo(expectedMidY, 5);
      // Sanity: the lower fraction genuinely differs from the upper one.
      expect(SADDLE_Y_FRACTION_LOWER).not.toBeCloseTo(SADDLE_Y_FRACTION, 5);
    });
  });

  describe("applyStatusExtra — B9 Statuses preset triggers the overlay recompute", () => {
    beforeEach(() => {
      __setToothStateForTest(12, { toothSelection: "tooth-base" });
      __setToothStateForTest(11, { toothSelection: "none" });
      __setToothStateForTest(21, { toothSelection: "tooth-base" });
    });

    it("a 'span' bridge preset fires the onStateChange listener (notifyStateChange ran)", () => {
      let fired = false;
      const unsub = onStateChange(() => { fired = true; });
      try{
        __applyStatusExtraForTest({ type: "span", teeth: [12, 11, 21], material: "gold" });
        expect(fired).toBe(true);
      } finally {
        unsub();
      }
    });
  });
});
