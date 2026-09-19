// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { __renderActiveLayers, __parseSvgForTest, __renderActiveLayersOnNode } from "../odontogram";

const svgUrl = import.meta.url;
const svgText = readFileSync(fileURLToPath(new NodeURL("../assets/teeth-svgs/16.svg", svgUrl)), "utf8");
const render = (state: Record<string, unknown>) => __renderActiveLayers(svgText, 16, state);
const ids = (layers: { id: string }[]) => layers.map(l => l.id);

describe("SP10 Task 2: filling-defect render", () => {
  it("a defect on a filled surface activates defect-{surface}", () => {
    const l = render({ toothSelection: "tooth-base", fillingSurfaceMaterials: { occlusal: "composite" }, fillingDefect: { occlusal: "fracture" } });
    expect(ids(l)).toContain("defect-occlusal");
  });
  it("no defect → defect-{surface} inactive", () => {
    const l = render({ toothSelection: "tooth-base", fillingSurfaceMaterials: { occlusal: "composite" } });
    expect(ids(l)).not.toContain("defect-occlusal");
  });
  it("defect on an UNFILLED surface does not render", () => {
    const l = render({ toothSelection: "tooth-base", fillingDefect: { occlusal: "fracture" } });
    expect(ids(l)).not.toContain("defect-occlusal");
  });
  it("coexists with subcaries on the same surface", () => {
    const l = render({ toothSelection: "tooth-base", fillingSurfaceMaterials: { occlusal: "composite" }, caries: ["caries-occlusal"], cariesSeverity: { occlusal: 5 }, fillingDefect: { occlusal: "wear" } });
    expect(ids(l)).toContain("subcaries-occlusal");
    expect(ids(l)).toContain("defect-occlusal");
  });
  it("clears on a reused node (defect then none)", () => {
    const node = __parseSvgForTest(svgText);
    __renderActiveLayersOnNode(node, 16, { toothSelection: "tooth-base", fillingSurfaceMaterials: { occlusal: "composite" }, fillingDefect: { occlusal: "fracture" } });
    const after = __renderActiveLayersOnNode(node, 16, { toothSelection: "tooth-base", fillingSurfaceMaterials: { occlusal: "composite" } });
    expect(ids(after)).not.toContain("defect-occlusal");
  });
  it("a crown on the tooth suppresses defect-{surface} even with a recorded filling+defect (surface masked by crown, matches sibling filling-render gating)", () => {
    const l = render({ toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon", fillingSurfaceMaterials: { occlusal: "composite" }, fillingDefect: { occlusal: "fracture" } });
    expect(ids(l)).not.toContain("defect-occlusal");
  });
});
