// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3, PR 3d: declarative-render test for `FillingsCard`.
// Mounts the card as part of `ToothControlsSurface` under `<OdontogramProvider>`
// with the lifecycle-only mock the composable-surface suites use
// (initOdontogram/destroyOdontogram stubbed; every other engine getter/setter
// stays real). The full controls surface is mounted (not the card alone) because
// a selection-scoped write routes through `applyToSelected`, which re-syncs the
// active tooth's sibling controls via `syncControlsFromState`. Proves the card
// renders `#fillingSelect`/`#fillingSurfaceChecks` (with the RIGHT-side
// `.surf-depth` recurrent-caries indicator + the LEFT-side `.surf-defect`
// indicator) / `#fissureSealing` / the two summary lines, that picking a
// material + tapping a surface writes `fillingSurfaces`/`fillingSurfaceMaterials`
// (via `getStatusChart()`), that the defect indicator shows + opens its popup +
// writes `fillingDefect`, that the simple/complex swap renders the right control
// set (driven by `setFillingComplexity`), that fissure sealing toggles + is
// gated per tooth, that `#fillingSection` hides per its predicate (implant /
// crown), and that the whole-selection summary lines reflect state.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import { OdontogramProvider, ToothControlsSurface } from "../App";
import {
  __resetChartStateForTest,
  __setActiveToothForTest,
  __setSelectionForTest,
  __setToothStateForTest,
  setNumberingSystem,
  setChartMode,
  getStatusChart,
  getActiveFillings,
  setFillingComplexity,
} from "../odontogram";

vi.mock("../odontogram", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../odontogram")>();
  return {
    ...actual,
    initOdontogram: vi.fn().mockResolvedValue(undefined),
    destroyOdontogram: vi.fn(),
  };
});

function renderControls() {
  return render(createElement(OdontogramProvider, { language: "en" }, createElement(ToothControlsSurface)));
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  // Clear any stale active tooth BEFORE toggling the module-global filling
  // complexity, so its `syncControlsFromState` re-sync doesn't touch a tooth
  // whose state the reset just cleared.
  __setSelectionForTest([]);
  setChartMode("status");
  setNumberingSystem("FDI");
  setFillingComplexity("complex");
});

describe("PR 3d: <FillingsCard/> renders declaratively", () => {
  it("renders the filling material select, the 5-cell cross with BOTH indicators, and the fissure toggle", () => {
    __setSelectionForTest([11]);
    renderControls();
    const sel = document.getElementById("fillingSelect") as HTMLSelectElement;
    expect(sel).toBeTruthy();
    expect(sel.options.length).toBeGreaterThan(0);

    const checks = document.getElementById("fillingSurfaceChecks");
    expect(checks?.querySelector(".surface-cross")).toBeTruthy();
    expect(checks?.querySelectorAll(".surface-cell").length).toBe(5);
    expect(document.getElementById("chk-buccal")).toBeTruthy();
    // Each cell carries BOTH the right-side recurrent-caries indicator and the
    // left-side filling-defect indicator.
    expect(checks?.querySelectorAll(".surf-depth").length).toBe(5);
    expect(checks?.querySelectorAll(".surf-defect").length).toBe(5);

    expect(document.getElementById("fissureSealing")).toBeTruthy();
  });

  it("picking a material then tapping a surface writes fillingSurfaces + material to the status chart", () => {
    __setSelectionForTest([11]);
    renderControls();
    const sel = document.getElementById("fillingSelect") as HTMLSelectElement;
    fireEvent.change(sel, { target: { value: "composite" } });
    expect(getActiveFillings().fillingMaterial).toBe("composite");

    const buccal = document.getElementById("chk-buccal") as HTMLInputElement;
    fireEvent.click(buccal);
    expect(getStatusChart().teeth[11].fillingSurfaces).toContain("buccal");
    expect(getStatusChart().teeth[11].fillingSurfaceMaterials.buccal).toBe("composite");
    // The cell reflects the material via its data-material attribute (CSS hook).
    const cell = document.querySelector("#fillingSurfaceChecks .surface-cell.pos-buccal") as HTMLElement;
    expect(cell.getAttribute("data-material")).toBe("composite");

    // Un-tapping clears the surface + its material.
    fireEvent.click(buccal);
    expect(getStatusChart().teeth[11].fillingSurfaces).not.toContain("buccal");
    expect(getStatusChart().teeth[11].fillingSurfaceMaterials.buccal).toBeUndefined();
  });

  it("the .surf-defect indicator opens the defect popup and writes fillingDefect", () => {
    __setSelectionForTest([11]);
    renderControls();
    fireEvent.change(document.getElementById("fillingSelect") as HTMLSelectElement, { target: { value: "composite" } });
    fireEvent.click(document.getElementById("chk-buccal") as HTMLInputElement);

    const cell = document.querySelector("#fillingSurfaceChecks .surface-cell.pos-buccal") as HTMLElement;
    const defect = cell.querySelector(".surf-defect") as HTMLElement;
    expect(document.querySelector(".odon-depth-popup")).toBeFalsy();
    fireEvent.click(defect);
    const popup = document.querySelector(".odon-depth-popup");
    expect(popup).toBeTruthy();
    // Options are none/marginal/fracture/wear — pick "marginal" (index 1).
    const options = popup!.querySelectorAll(".odon-depth-option");
    // The popup option uses a raw (non-React) click listener; wrap in act so the
    // `onStateChange`-driven card re-render flushes before we read the indicator.
    act(() => { fireEvent.click(options[1]); });
    expect(getStatusChart().teeth[11].fillingDefect.buccal).toBe("marginal");
    // The indicator now carries the has-defect state.
    const defect2 = (document.querySelector("#fillingSurfaceChecks .surface-cell.pos-buccal") as HTMLElement).querySelector(".surf-defect") as HTMLElement;
    expect(defect2.classList.contains("has-defect")).toBe(true);
    expect(defect2.getAttribute("data-defect")).toBe("marginal");
  });

  it("the simple/complex swap shows the grid in complex mode and the toggle in simple mode", () => {
    __setSelectionForTest([11]);
    renderControls();
    fireEvent.change(document.getElementById("fillingSelect") as HTMLSelectElement, { target: { value: "composite" } });
    // Complex (default): grid visible, simple row hidden.
    expect(document.getElementById("fillingSurfaceChecks")?.classList.contains("hidden")).toBe(false);
    expect(document.getElementById("fillingSimpleRow")?.classList.contains("hidden")).toBe(true);

    // Switch to simple: grid hidden, simple toggle row shown.
    act(() => { setFillingComplexity("simple"); });
    expect(document.getElementById("fillingSurfaceChecks")?.classList.contains("hidden")).toBe(true);
    expect(document.getElementById("fillingSimpleRow")?.classList.contains("hidden")).toBe(false);

    // The simple toggle fills ALL surfaces.
    fireEvent.click(document.getElementById("fillingSimpleToggle") as HTMLInputElement);
    expect(getStatusChart().teeth[11].fillingSurfaces.sort()).toEqual(["buccal", "distal", "lingual", "mesial", "occlusal"]);
  });

  it("fissure sealing toggles on a fissure-eligible tooth and is gated on an anterior tooth", () => {
    // Tooth 14 (upper first premolar) is fissure-eligible.
    __setSelectionForTest([14]);
    renderControls();
    expect(document.getElementById("fissureSealingRow")?.classList.contains("hidden")).toBe(false);
    fireEvent.click(document.getElementById("fissureSealing") as HTMLInputElement);
    expect(getStatusChart().teeth[14].fissureSealing).toBe(true);
    cleanup();

    // Tooth 11 (central incisor) is NOT fissure-eligible → row hidden.
    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setSelectionForTest([11]);
    renderControls();
    expect(document.getElementById("fissureSealingRow")?.classList.contains("hidden")).toBe(true);
  });

  it("hides #fillingSection on an implant tooth and on a crowned tooth", () => {
    // A plain natural tooth-base → section visible.
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setActiveToothForTest(11);
    renderControls();
    expect(document.getElementById("fillingSection")?.classList.contains("hidden")).toBe(false);
    cleanup();

    // An implant tooth hides the fillings section.
    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setActiveToothForTest(11);
    renderControls();
    expect(document.getElementById("fillingSection")?.classList.contains("hidden")).toBe(true);
    cleanup();

    // A crowned present tooth hides the fillings section.
    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon" });
    __setActiveToothForTest(11);
    renderControls();
    expect(document.getElementById("fillingSection")?.classList.contains("hidden")).toBe(true);
  });

  it("the subcaries summary line reflects a recurrent-caries surface", () => {
    __setSelectionForTest([11]);
    renderControls();
    const summary = document.getElementById("fillingSubcariesSummary") as HTMLElement;
    expect(summary.classList.contains("hidden")).toBe(true);

    // Fill a surface, then add caries on the same surface → recurrent caries.
    fireEvent.change(document.getElementById("fillingSelect") as HTMLSelectElement, { target: { value: "composite" } });
    fireEvent.click(document.getElementById("chk-buccal") as HTMLInputElement);
    __setToothStateForTest(11, {
      toothSelection: "tooth-base",
      fillingMaterial: "composite",
      fillingSurfaces: ["buccal"],
      fillingSurfaceMaterials: { buccal: "composite" },
      caries: ["caries-buccal"],
    });
    __setActiveToothForTest(11);
    __setSelectionForTest([11]);
    // Re-render to pull the freshly-seeded state.
    cleanup();
    renderControls();
    const summary2 = document.getElementById("fillingSubcariesSummary") as HTMLElement;
    expect(summary2.classList.contains("hidden")).toBe(false);
    expect(summary2.textContent).toContain("11");
  });
});
