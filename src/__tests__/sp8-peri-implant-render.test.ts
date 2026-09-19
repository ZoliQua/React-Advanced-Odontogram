// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { __renderActiveLayers, __parseSvgForTest, __renderActiveLayersOnNode } from "../odontogram";

// NOTE: `import.meta.url` is captured in a variable first (rather than passed
// inline) because Vite statically pattern-matches `new URL('literal', import.meta.url)`
// as its asset-URL syntax and rewrites it, breaking fileURLToPath resolution here
// (see src/__tests__/parity.test.ts for the same workaround).
const testFileUrl = import.meta.url;
const svgText = readFileSync(fileURLToPath(new URL("../assets/teeth-svgs/11.svg", testFileUrl)), "utf8");
const render = (state: Record<string, unknown>) => __renderActiveLayers(svgText, 11, state);
const ids = (layers: { id: string }[]) => layers.map(l => l.id);
const opacityOf = (layers: { id: string; opacity: string }[], id: string) => layers.find(l => l.id === id)?.opacity;

describe("SP8 Task 3: peri-implant glyph (implants only)", () => {
  it("mucositis → parodontal only, no bone-loss", () => {
    const l = render({ toothSelection: "implant", periImplant: "mucositis" });
    expect(ids(l)).toContain("parodontal");
    expect(ids(l)).not.toContain("peri-implant-bone-loss");
  });
  it("peri-implantitis-mild → parodontal + bone-loss @0.4", () => {
    const l = render({ toothSelection: "implant", periImplant: "peri-implantitis-mild" });
    expect(ids(l)).toContain("parodontal");
    expect(ids(l)).toContain("peri-implant-bone-loss");
    expect(opacityOf(l, "peri-implant-bone-loss")).toBe("0.4");
  });
  it("severe → bone-loss @1", () => {
    expect(opacityOf(render({ toothSelection: "implant", periImplant: "peri-implantitis-severe" }), "peri-implant-bone-loss")).toBe("1");
  });
  it("none → neither", () => {
    const l = render({ toothSelection: "implant", periImplant: "none" });
    expect(ids(l)).not.toContain("peri-implant-bone-loss");
  });
  it("non-implant tooth ignores periImplant", () => {
    const l = render({ toothSelection: "tooth-base", periImplant: "peri-implantitis-severe" });
    expect(ids(l)).not.toContain("peri-implant-bone-loss");
  });
});

describe("SP8 Task 3: implant no longer shows the periapical glyph via mods.inflammation", () => {
  it("implant + mods.inflammation → NO periapical (inflammation/granuloma) glyph", () => {
    const l = render({ toothSelection: "implant", mods: ["inflammation"] });
    expect(ids(l)).not.toContain("granuloma");
    expect(ids(l)).not.toContain("inflammation");
  });
  it("missing/socket + mods.inflammation → periapical glyph unchanged", () => {
    const l = render({ toothSelection: "none", mods: ["inflammation"] });
    expect(ids(l)).toContain("granuloma");
  });
});

describe("SP8 Task 3: symmetric render on a reused node (SP7 lesson)", () => {
  it("severe then mucositis on the SAME node deactivates bone-loss", () => {
    const node = __parseSvgForTest(svgText);
    __renderActiveLayersOnNode(node, 11, { toothSelection: "implant", periImplant: "peri-implantitis-severe" });
    const after = __renderActiveLayersOnNode(node, 11, { toothSelection: "implant", periImplant: "mucositis" });
    expect(ids(after)).toContain("parodontal");
    expect(ids(after)).not.toContain("peri-implant-bone-loss");
  });
});
