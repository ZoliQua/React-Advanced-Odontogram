// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP10 Task 3: LEFT-side per-surface filling-defect indicator on the Fillings
// card. Mirrors the RIGHT-side `.surf-depth` / `syncFillingSubcariesIndicator`
// indicator-sync tests in `radiographic-depth-badge.test.ts` (hand-built
// `.surface-cell` + a DOM-free `__sync*ForTest` seam), but for the structural
// filling-defect axis (`fillingDefect`: none | marginal | fracture | wear)
// rather than recurrent caries.
import { describe, it, expect } from "vitest";
import { __syncFillingDefectIndicatorForTest } from "../odontogram";

// Builds a single `.surface-cell` matching the markup the Fillings-card build
// loop produces: a checked filling checkbox (value = bare surface name, e.g.
// "occlusal" — NOT "caries-occlusal", unlike the caries checks) plus a
// `.surf-defect` indicator span.
function buildFillingSurfaceCell(surface: string, checked = true): HTMLElement {
  const cell = document.createElement("div");
  cell.className = "surface-cell";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = surface;
  input.checked = checked;
  const ind = document.createElement("span");
  ind.className = "surf-defect";
  cell.appendChild(input);
  cell.appendChild(ind);
  return cell;
}

describe("SP10 Task 3: filling-defect indicator", () => {
  it("marks the indicator when the surface has a defect", () => {
    const cell = buildFillingSurfaceCell("occlusal");
    const state = {
      fillingSurfaceMaterials: new Map([["occlusal", "composite"]]),
      fillingDefect: new Map([["occlusal", "fracture"]]),
    };
    __syncFillingDefectIndicatorForTest(cell, state);
    const ind = cell.querySelector(".surf-defect")!;
    expect(ind.classList.contains("has-defect")).toBe(true);
    expect(ind.getAttribute("data-defect")).toBe("fracture");
  });

  it("no defect → indicator unmarked", () => {
    const cell = buildFillingSurfaceCell("occlusal");
    const state = {
      fillingSurfaceMaterials: new Map([["occlusal", "composite"]]),
      fillingDefect: new Map(),
    };
    __syncFillingDefectIndicatorForTest(cell, state);
    const ind = cell.querySelector(".surf-defect")!;
    expect(ind.classList.contains("has-defect")).toBe(false);
    expect(ind.hasAttribute("data-defect")).toBe(false);
  });

  it("defect explicitly 'none' → indicator unmarked", () => {
    const cell = buildFillingSurfaceCell("mesial");
    const state = {
      fillingSurfaceMaterials: new Map([["mesial", "amalgam"]]),
      fillingDefect: new Map([["mesial", "none"]]),
    };
    __syncFillingDefectIndicatorForTest(cell, state);
    const ind = cell.querySelector(".surf-defect")!;
    expect(ind.classList.contains("has-defect")).toBe(false);
    expect(ind.hasAttribute("data-defect")).toBe(false);
  });

  it("a defect value with no filling on the surface is NOT shown as a defect (defensive)", () => {
    const cell = buildFillingSurfaceCell("distal");
    const state = {
      fillingSurfaceMaterials: new Map(), // no filling on this surface
      fillingDefect: new Map([["distal", "wear"]]),
    };
    __syncFillingDefectIndicatorForTest(cell, state);
    const ind = cell.querySelector(".surf-defect")!;
    expect(ind.classList.contains("has-defect")).toBe(false);
    expect(ind.hasAttribute("data-defect")).toBe(false);
  });

  it("clears a stale data-defect attribute on re-sync once the value is unset", () => {
    const cell = buildFillingSurfaceCell("lingual");
    const withDefect = {
      fillingSurfaceMaterials: new Map([["lingual", "gic"]]),
      fillingDefect: new Map([["lingual", "marginal"]]),
    };
    __syncFillingDefectIndicatorForTest(cell, withDefect);
    expect(cell.querySelector(".surf-defect")!.getAttribute("data-defect")).toBe("marginal");

    const cleared = {
      fillingSurfaceMaterials: new Map([["lingual", "gic"]]),
      fillingDefect: new Map(),
    };
    __syncFillingDefectIndicatorForTest(cell, cleared);
    const ind = cell.querySelector(".surf-defect")!;
    expect(ind.classList.contains("has-defect")).toBe(false);
    expect(ind.hasAttribute("data-defect")).toBe(false);
  });

  it("tolerates a state with no fillingDefect map at all (defensive optional-chaining)", () => {
    const cell = buildFillingSurfaceCell("buccal");
    const state = { fillingSurfaceMaterials: new Map([["buccal", "composite"]]) };
    expect(() => __syncFillingDefectIndicatorForTest(cell, state)).not.toThrow();
    const ind = cell.querySelector(".surf-defect")!;
    expect(ind.hasAttribute("data-defect")).toBe(false);
  });

  it("a cell with no .surf-defect span or no checkbox is a no-op, not a throw", () => {
    const bare = document.createElement("div");
    bare.className = "surface-cell";
    expect(() => __syncFillingDefectIndicatorForTest(bare, { fillingDefect: new Map() })).not.toThrow();
  });
});
