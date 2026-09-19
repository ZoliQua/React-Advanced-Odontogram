// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3, PR 3f: declarative-render test for `ToothDetailsCard`
// (the hardest card). Mounts the card as part of `ToothControlsSurface` under
// `<OdontogramProvider>` with the lifecycle-only mock the composable-surface
// suites use (initOdontogram/destroyOdontogram stubbed; every other engine
// getter/setter stays real). Proves the card renders every row with real
// options, that base/substrate/restoration selects (incl. the combined
// `${type}|${material}` + prosthesis encode/decode) and the representative
// checkboxes write to `getStatusChart()`, that the wear/discoloration
// select-vs-toggle swap follows the detail level, that row visibility follows the
// predicates, that `#extractionPlanRow` reparents to the correct container per
// state, and that the title `#btnResetTooth` resets the active tooth.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { OdontogramProvider, ToothControlsSurface } from "../App";
import {
  __resetChartStateForTest,
  __setSelectionForTest,
  __setToothStateForTest,
  setNumberingSystem,
  setChartMode,
  getStatusChart,
  getActiveToothDetails,
  setWearDetailLevel,
  setDiscolorationDetailLevel,
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
  setWearDetailLevel("complex");
  setDiscolorationDetailLevel("complex");
});

afterEach(() => {
  setWearDetailLevel("complex");
  setDiscolorationDetailLevel("complex");
});

describe("PR 3f: <ToothDetailsCard/> renders declaratively", () => {
  it("renders all rows with real option sets", () => {
    __setSelectionForTest([11]);
    renderControls();
    expect((document.getElementById("toothSelect") as HTMLSelectElement).options.length).toBeGreaterThan(1);
    expect((document.getElementById("substrateSelect") as HTMLSelectElement).options.length).toBe(4);
    expect((document.getElementById("restorationSelect") as HTMLSelectElement).options.length).toBeGreaterThan(1);
    expect((document.getElementById("wearEdgeSelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    expect((document.getElementById("wearCervicalSelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    expect((document.getElementById("discolorationSelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    // Every checkbox is present with its canonical id.
    for (const id of ["extractionWound", "missingClosed", "crownLeakage", "brokenMesial", "brokenIncisal", "brokenDistal", "contactMesial", "contactDistal", "bridgePillar", "extractionPlan", "crownReplace", "crownNeeded"]) {
      expect(document.getElementById(id)).toBeTruthy();
    }
  });

  it("base + substrate selects write state", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    renderControls();
    fireEvent.change(document.getElementById("substrateSelect") as HTMLSelectElement, { target: { value: "radix" } });
    expect(getStatusChart().teeth[11].toothSubstrate).toBe("radix");
    fireEvent.change(document.getElementById("toothSelect") as HTMLSelectElement, { target: { value: "implant" } });
    expect(getStatusChart().teeth[11].toothSelection).toBe("implant");
  });

  it("restoration select decodes `${type}|${material}` and a prosthesis value", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    renderControls();
    fireEvent.change(document.getElementById("restorationSelect") as HTMLSelectElement, { target: { value: "crown|emax" } });
    expect(getStatusChart().teeth[11].restorationType).toBe("crown");
    expect(getStatusChart().teeth[11].restorationMaterial).toBe("emax");
    expect(getStatusChart().teeth[11].prosthesis).toBe("none");

    // A prosthesis attachment on an implant: encodes distinctly + clears the
    // fixed restoration axes (applyRestorationSelection decode).
    cleanup();
    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setSelectionForTest([11]);
    renderControls();
    fireEvent.change(document.getElementById("restorationSelect") as HTMLSelectElement, { target: { value: "prosthesis|healing-abutment" } });
    expect(getStatusChart().teeth[11].prosthesis).toBe("healing-abutment");
    expect(getStatusChart().teeth[11].restorationType).toBe("none");
  });

  it("wear/discoloration swap between select and toggle per detail level", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    // Complex (default): the selects are shown, the toggles hidden.
    renderControls();
    expect(document.getElementById("wearEdgeSelectLabel")?.classList.contains("hidden")).toBe(false);
    expect(document.getElementById("wearEdgeToggleLabel")?.classList.contains("hidden")).toBe(true);
    expect(document.getElementById("discolorationSelectLabel")?.classList.contains("hidden")).toBe(false);
    expect(document.getElementById("discolorationToggleLabel")?.classList.contains("hidden")).toBe(true);

    // Simple: the toggles are shown, the selects hidden (level flips them, never
    // mutating the stored value).
    cleanup();
    setWearDetailLevel("simple");
    setDiscolorationDetailLevel("simple");
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    renderControls();
    expect(document.getElementById("wearEdgeSelectLabel")?.classList.contains("hidden")).toBe(true);
    expect(document.getElementById("wearEdgeToggleLabel")?.classList.contains("hidden")).toBe(false);
    expect(document.getElementById("discolorationSelectLabel")?.classList.contains("hidden")).toBe(true);
    expect(document.getElementById("discolorationToggleLabel")?.classList.contains("hidden")).toBe(false);
    // The simple-mode toggle writes the canonical value.
    fireEvent.click(document.getElementById("wearEdgeToggle") as HTMLInputElement);
    expect(getStatusChart().teeth[11].wearEdge).toBe("attrition");
  });

  it("representative checkboxes write state", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    renderControls();
    fireEvent.click(document.getElementById("contactMesial") as HTMLInputElement);
    expect(getStatusChart().teeth[11].contactMesial).toBe(true);

    // Missing-closed is authored on a gap tooth.
    cleanup();
    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "none" });
    __setSelectionForTest([11]);
    renderControls();
    fireEvent.click(document.getElementById("missingClosed") as HTMLInputElement);
    expect(getStatusChart().teeth[11].missingClosed).toBe(true);
  });

  it("row visibility follows the predicates", () => {
    // #crownLeakageRow: hidden without a crown, visible with a crown/bridge.
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    renderControls();
    expect(document.getElementById("crownLeakageRow")?.classList.contains("hidden")).toBe(true);
    cleanup();

    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "emax" });
    __setSelectionForTest([11]);
    renderControls();
    expect(document.getElementById("crownLeakageRow")?.classList.contains("hidden")).toBe(false);
    cleanup();

    // #restorationRow is hidden on a radix substrate; #substrateRow hidden on an implant.
    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "tooth-base", toothSubstrate: "radix" });
    __setSelectionForTest([11]);
    renderControls();
    expect(document.getElementById("restorationRow")?.classList.contains("hidden")).toBe(true);
    cleanup();

    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setSelectionForTest([11]);
    renderControls();
    expect(document.getElementById("substrateRow")?.classList.contains("hidden")).toBe(true);
  });

  it("#extractionPlanRow reparents to the correct container per state", () => {
    // Broken substrate on a permanent tooth → moved into #brokenCrownRow.
    __setToothStateForTest(11, { toothSelection: "tooth-base", toothSubstrate: "broken" });
    __setSelectionForTest([11]);
    renderControls();
    let epr = document.getElementById("extractionPlanRow") as HTMLElement;
    expect(epr).toBeTruthy();
    expect(epr.closest("#brokenCrownRow")).toBeTruthy();
    // The getter agrees on the resolved parent.
    expect(getActiveToothDetails().extractionPlanParent).toBe("brokenCrownRow");
    cleanup();

    // A wear-eligible natural permanent tooth → moved into #bruxismRow.
    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setSelectionForTest([11]);
    renderControls();
    epr = document.getElementById("extractionPlanRow") as HTMLElement;
    expect(epr.closest("#bruxismRow")).toBeTruthy();
    cleanup();

    // An implant (no wear, not broken) → stays in #crownActionsRow.
    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setSelectionForTest([11]);
    renderControls();
    epr = document.getElementById("extractionPlanRow") as HTMLElement;
    expect(epr.closest("#crownActionsRow")).toBeTruthy();
  });

  it("#btnResetTooth resets the active tooth", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setSelectionForTest([11]);
    renderControls();
    expect(getStatusChart().teeth[11].toothSelection).toBe("implant");
    fireEvent.click(document.getElementById("btnResetTooth") as HTMLButtonElement);
    // defaultState() base is "tooth-base".
    expect(getStatusChart().teeth[11].toothSelection).toBe("tooth-base");
  });
});
