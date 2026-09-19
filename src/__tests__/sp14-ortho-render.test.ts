// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { __parseSvgForTest, __renderActiveLayersOnNode, __orthoAllowedForTest } from "../odontogram";

// NOTE: `import.meta.url` is captured in a variable first (rather than passed
// inline) because Vite statically pattern-matches `new URL('literal', import.meta.url)`
// as its asset-URL syntax and rewrites it, breaking fileURLToPath resolution here
// (see src/__tests__/parity.test.ts / sp8-peri-implant-render.test.ts for the same
// workaround).
const testFileUrl = import.meta.url;
const svg11Text = readFileSync(fileURLToPath(new URL("../assets/teeth-svgs/11.svg", testFileUrl)), "utf8");
const svg14OcclText = readFileSync(fileURLToPath(new URL("../assets/teeth-svgs/14_occl.svg", testFileUrl)), "utf8");

const ids = (layers: { id: string }[]) => layers.map(l => l.id);
const render = (state: Record<string, unknown>) => {
  const node = __parseSvgForTest(svg11Text);
  return __renderActiveLayersOnNode(node, 11, state);
};

describe("SP14 Task 2: orthodontic glyph render (appliance/drift/vertical/rotation)", () => {
  describe("appliance", () => {
    it('"bracket" activates ortho-bracket, not ortho-ring', () => {
      const l = render({ toothSelection: "tooth-base", orthoAppliance: "bracket" });
      expect(ids(l)).toContain("ortho-bracket");
      expect(ids(l)).not.toContain("ortho-ring");
    });
    it('"band" activates ortho-ring, not ortho-bracket', () => {
      const l = render({ toothSelection: "tooth-base", orthoAppliance: "band" });
      expect(ids(l)).toContain("ortho-ring");
      expect(ids(l)).not.toContain("ortho-bracket");
    });
    it('"none" activates neither', () => {
      const l = render({ toothSelection: "tooth-base", orthoAppliance: "none" });
      expect(ids(l)).not.toContain("ortho-bracket");
      expect(ids(l)).not.toContain("ortho-ring");
    });
  });

  describe("drift", () => {
    it('"mesial" activates arrow-mesial, not arrow-distal', () => {
      const l = render({ toothSelection: "tooth-base", orthoDrift: "mesial" });
      expect(ids(l)).toContain("arrow-mesial");
      expect(ids(l)).not.toContain("arrow-distal");
    });
    it('"distal" activates arrow-distal, not arrow-mesial', () => {
      const l = render({ toothSelection: "tooth-base", orthoDrift: "distal" });
      expect(ids(l)).toContain("arrow-distal");
      expect(ids(l)).not.toContain("arrow-mesial");
    });
    it('"none" activates neither', () => {
      const l = render({ toothSelection: "tooth-base", orthoDrift: "none" });
      expect(ids(l)).not.toContain("arrow-mesial");
      expect(ids(l)).not.toContain("arrow-distal");
    });
  });

  describe("vertical (extrusion -> arrow-up, intrusion -> arrow-down; see odontogram.ts SP14 comment for the geometry verification)", () => {
    it('"extrusion" activates arrow-up, not arrow-down', () => {
      const l = render({ toothSelection: "tooth-base", orthoVertical: "extrusion" });
      expect(ids(l)).toContain("arrow-up");
      expect(ids(l)).not.toContain("arrow-down");
    });
    it('"intrusion" activates arrow-down, not arrow-up', () => {
      const l = render({ toothSelection: "tooth-base", orthoVertical: "intrusion" });
      expect(ids(l)).toContain("arrow-down");
      expect(ids(l)).not.toContain("arrow-up");
    });
    it('"none" activates neither', () => {
      const l = render({ toothSelection: "tooth-base", orthoVertical: "none" });
      expect(ids(l)).not.toContain("arrow-up");
      expect(ids(l)).not.toContain("arrow-down");
    });
  });

  describe("rotation", () => {
    it("true activates arrow-rotation", () => {
      const l = render({ toothSelection: "tooth-base", orthoRotation: true });
      expect(ids(l)).toContain("arrow-rotation");
    });
    it("false leaves it inactive", () => {
      const l = render({ toothSelection: "tooth-base", orthoRotation: false });
      expect(ids(l)).not.toContain("arrow-rotation");
    });
  });

  describe("gated: only a present natural tooth (tooth-base/milktooth) may show ortho glyphs", () => {
    it("implant: no ortho glyph active even with every field set", () => {
      const l = render({
        toothSelection: "implant", orthoAppliance: "bracket", orthoDrift: "mesial",
        orthoVertical: "extrusion", orthoRotation: true,
      });
      expect(ids(l)).not.toContain("ortho-bracket");
      expect(ids(l)).not.toContain("ortho-ring");
      expect(ids(l)).not.toContain("arrow-mesial");
      expect(ids(l)).not.toContain("arrow-distal");
      expect(ids(l)).not.toContain("arrow-up");
      expect(ids(l)).not.toContain("arrow-down");
      expect(ids(l)).not.toContain("arrow-rotation");
    });
    it('missing (toothSelection:"none", also the pontic/gap shape) : no ortho glyph active even with every field set', () => {
      const l = render({
        toothSelection: "none", orthoAppliance: "bracket", orthoDrift: "distal",
        orthoVertical: "intrusion", orthoRotation: true,
      });
      expect(ids(l)).not.toContain("ortho-bracket");
      expect(ids(l)).not.toContain("ortho-ring");
      expect(ids(l)).not.toContain("arrow-mesial");
      expect(ids(l)).not.toContain("arrow-distal");
      expect(ids(l)).not.toContain("arrow-up");
      expect(ids(l)).not.toContain("arrow-down");
      expect(ids(l)).not.toContain("arrow-rotation");
    });
  });

  describe("reused-node symmetry (SP7 lesson: a reused per-tooth DOM node must clear a stale glyph)", () => {
    it("bracket then none on the SAME node clears ortho-bracket", () => {
      const node = __parseSvgForTest(svg11Text);
      __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base", orthoAppliance: "bracket" });
      const after = __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base", orthoAppliance: "none" });
      expect(ids(after)).not.toContain("ortho-bracket");
    });
    it("extrusion then intrusion on the SAME node flips arrow-up off / arrow-down on", () => {
      const node = __parseSvgForTest(svg11Text);
      __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base", orthoVertical: "extrusion" });
      const after = __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base", orthoVertical: "intrusion" });
      expect(ids(after)).not.toContain("arrow-up");
      expect(ids(after)).toContain("arrow-down");
    });
  });

  describe("occlusal template (14_occl.svg) lacks ortho-bracket/ortho-ring/arrow-up/arrow-down: null-guarded", () => {
    it("orthoAppliance:'bracket' does not crash; arrow-mesial (present on this template) still works", () => {
      const node = __parseSvgForTest(svg14OcclText);
      expect(() => {
        __renderActiveLayersOnNode(node, 14, {
          toothSelection: "tooth-base", orthoAppliance: "bracket", orthoDrift: "mesial",
        });
      }).not.toThrow();
      const l = __renderActiveLayersOnNode(node, 14, { toothSelection: "tooth-base", orthoDrift: "mesial" });
      expect(ids(l)).not.toContain("ortho-bracket");
      expect(ids(l)).not.toContain("ortho-ring");
      expect(ids(l)).not.toContain("arrow-up");
      expect(ids(l)).not.toContain("arrow-down");
      expect(ids(l)).toContain("arrow-mesial");
    });
  });

  describe("__orthoAllowedForTest truth table", () => {
    it("tooth-base and milktooth are allowed", () => {
      expect(__orthoAllowedForTest({ toothSelection: "tooth-base" })).toBe(true);
      expect(__orthoAllowedForTest({ toothSelection: "milktooth" })).toBe(true);
    });
    it("implant, missing (none), and a bridge-pontic gap (none) are not allowed", () => {
      expect(__orthoAllowedForTest({ toothSelection: "implant" })).toBe(false);
      expect(__orthoAllowedForTest({ toothSelection: "none" })).toBe(false);
      expect(__orthoAllowedForTest({ toothSelection: "none", restorationType: "bridge" })).toBe(false);
    });
  });
});
