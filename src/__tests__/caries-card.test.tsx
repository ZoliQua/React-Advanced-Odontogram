// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3, PR 3c: declarative-render test for `CariesCard`.
// Mounts the card as part of `ToothControlsSurface` under `<OdontogramProvider>`
// with the lifecycle-only mock the composable-surface suites use
// (initOdontogram/destroyOdontogram stubbed; every other engine getter/setter
// stays real). The full controls surface is mounted (not the card alone) because
// a selection-scoped write routes through `applyToSelected`, which re-syncs the
// active tooth's sibling controls via `syncControlsFromState`. Proves the card
// renders `#cariesChecks`/`#cariesSubcrownRow`/`#cariesDepthSelect`/
// `#rootCariesSelect` with real options, that toggling a surface writes
// `s.caries`/`cariesSeverity` (via `getStatusChart()`), that the depth select
// applies, that the non-collapsing root-caries display value is shown, that the
// `#cariesSection` hides per its predicate (plan-mode / radix base), and that
// clicking a `.surf-depth` indicator opens the severity popup.
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
  getActiveCaries,
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
  setChartMode("status");
  setNumberingSystem("FDI");
});

describe("PR 3c: <CariesCard/> renders declaratively", () => {
  it("renders the caries cross (5 cells), subcrown, depth + root-caries selects", () => {
    renderControls();
    const checks = document.getElementById("cariesChecks");
    expect(checks).toBeTruthy();
    expect(checks?.querySelector(".surface-cross")).toBeTruthy();
    expect(checks?.querySelectorAll(".surface-cell").length).toBe(5);
    expect(document.getElementById("chk-caries-buccal")).toBeTruthy();
    // Each cell carries its right-side `.surf-depth` severity indicator.
    expect(checks?.querySelectorAll(".surf-depth").length).toBe(5);
    // Subcrown row.
    expect(document.getElementById("chk-caries-subcrown")).toBeTruthy();
    // Both selects render their real option sets (non-empty).
    const depth = document.getElementById("cariesDepthSelect") as HTMLSelectElement;
    const root = document.getElementById("rootCariesSelect") as HTMLSelectElement;
    expect(depth.options.length).toBeGreaterThan(0);
    expect(root.options.length).toBeGreaterThan(0);
  });

  it("toggling a surface writes s.caries + cariesSeverity to the status chart", () => {
    __setSelectionForTest([11]);
    renderControls();
    const buccal = document.getElementById("chk-caries-buccal") as HTMLInputElement;
    fireEvent.click(buccal);

    expect(getActiveCaries().surfaces.find((s) => s.surface === "buccal")?.checked).toBe(true);
    expect(getStatusChart().teeth[11].caries).toContain("caries-buccal");
    // Severity recorded from the active depth (default 2).
    expect(getStatusChart().teeth[11].cariesSeverity.buccal).toBe(2);

    fireEvent.click(buccal);
    expect(getStatusChart().teeth[11].caries).not.toContain("caries-buccal");
    expect(getStatusChart().teeth[11].cariesSeverity.buccal).toBeUndefined();
  });

  it("changing #cariesDepthSelect sets the active depth for newly tapped surfaces", () => {
    __setSelectionForTest([11]);
    renderControls();
    const depth = document.getElementById("cariesDepthSelect") as HTMLSelectElement;
    // Default (non-ICDAS) options are 2/4/6; pick "deep" (6).
    fireEvent.change(depth, { target: { value: "6" } });
    expect(getActiveCaries().cariesActiveDepth).toBe(6);

    const distal = document.getElementById("chk-caries-distal") as HTMLInputElement;
    fireEvent.click(distal);
    expect(getStatusChart().teeth[11].cariesSeverity.distal).toBe(6);
  });

  it("shows the NON-collapsing root-caries display value and writes on change", () => {
    __setSelectionForTest([11]);
    renderControls();
    const root = document.getElementById("rootCariesSelect") as HTMLSelectElement;
    // Simple mode maps "present" → canonical "active-cavitated".
    fireEvent.change(root, { target: { value: "active-cavitated" } });
    expect(getStatusChart().teeth[11].rootCaries).toBe("active-cavitated");
    // The select displays that value back (display-only collapse in simple mode).
    expect(root.value).toBe("active-cavitated");
  });

  it("hides #cariesSection in Plan mode and on a radix-substrate tooth", () => {
    // A plain natural tooth-base → section visible.
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setActiveToothForTest(11);
    renderControls();
    expect(document.getElementById("cariesSection")?.classList.contains("hidden")).toBe(false);

    // Switching to Plan mode hides the (status-only diagnosis) caries section.
    act(() => { setChartMode("plan"); });
    expect(document.getElementById("cariesSection")?.classList.contains("hidden")).toBe(true);
    cleanup();

    // A radix substrate hides the caries section.
    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "tooth-base", toothSubstrate: "radix" });
    __setActiveToothForTest(11);
    renderControls();
    expect(document.getElementById("cariesSection")?.classList.contains("hidden")).toBe(true);
  });

  it("clicking a caried surface's .surf-depth indicator opens the severity popup", () => {
    __setSelectionForTest([11]);
    renderControls();
    // Caries must be present on the surface for the indicator to act.
    const buccal = document.getElementById("chk-caries-buccal") as HTMLInputElement;
    fireEvent.click(buccal);

    const cell = document.querySelector(".surface-cell.pos-buccal") as HTMLElement;
    const ind = cell.querySelector(".surf-depth") as HTMLElement;
    expect(document.querySelector(".odon-depth-popup")).toBeFalsy();
    fireEvent.click(ind);
    expect(document.querySelector(".odon-depth-popup")).toBeTruthy();
  });
});
