// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3, PR 3e: declarative-render test for `RootPeriodontiumCard`.
// Mounts the card as part of `ToothControlsSurface` under `<OdontogramProvider>`
// with the lifecycle-only mock the composable-surface suites use
// (initOdontogram/destroyOdontogram stubbed; every other engine getter/setter
// stays real). Proves the card renders both sub-blocks with real options, that
// the merged pulp/endo optgroup select applies AND enforces the endo↔pulpDx
// mutual exclusion, that apical/resorption/mobility/peri-implant selects and the
// mods checkboxes + calculus toggle write to `getStatusChart()`, that the root
// vs perio sub-blocks hide per base, and that the still-imperative `#perioGrid`
// probing carve-out renders + syncs (a `setPerioSite`-driven value shows).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import { OdontogramProvider, ToothControlsSurface } from "../App";
import {
  __resetChartStateForTest,
  __setActiveToothForTest,
  __setSelectionForTest,
  __setToothStateForTest,
  __buildPerioGridForTest,
  __syncPerioRowForTest,
  setNumberingSystem,
  setChartMode,
  getStatusChart,
  getActiveRootPerio,
  setPerioSite,
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

describe("PR 3e: <RootPeriodontiumCard/> renders declaratively", () => {
  it("renders both sub-blocks with the merged pulp/endo optgroups + real option sets", () => {
    __setSelectionForTest([11]);
    renderControls();
    // Root block controls.
    const pulpEndo = document.getElementById("pulpEndoSelect") as HTMLSelectElement;
    expect(pulpEndo).toBeTruthy();
    // Grouped select: two <optgroup>s (vital pulp + treated endo) in Status.
    expect(pulpEndo.querySelectorAll("optgroup").length).toBe(2);
    expect(pulpEndo.options.length).toBeGreaterThan(1);
    expect((document.getElementById("apicalDxSelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    expect((document.getElementById("resorptionSelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    expect(document.getElementById("endoResection")).toBeTruthy();
    expect(document.getElementById("parapulpalPin")).toBeTruthy();
    // Perio block controls.
    expect((document.getElementById("mobilitySelect") as HTMLSelectElement).options.length).toBeGreaterThan(0);
    expect(document.getElementById("perioGrid")).toBeTruthy();
    // #modsChecks renders both modifier checkboxes with their canonical ids.
    expect(document.getElementById("chk-parodontal")).toBeTruthy();
    expect(document.getElementById("chk-inflammation")).toBeTruthy();
    expect(document.getElementById("calculusToggle")).toBeTruthy();
  });

  it("applies a treated endo value and normalizes pulpDx (endo↔pulpDx exclusion)", () => {
    // Start from a diseased pulp so the normalization is observable.
    __setToothStateForTest(11, { toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis" });
    __setSelectionForTest([11]);
    renderControls();
    const pulpEndo = document.getElementById("pulpEndoSelect") as HTMLSelectElement;
    fireEvent.change(pulpEndo, { target: { value: "endo-filling" } });
    expect(getStatusChart().teeth[11].endo).toBe("endo-filling");
    // Setting a treated endo normalizes the (now-suppressed) pulp diagnosis.
    expect(getStatusChart().teeth[11].pulpDx).toBe("normal");
  });

  it("applies apical / resorption / mobility / peri-implant selects", () => {
    __setSelectionForTest([11]);
    renderControls();
    fireEvent.change(document.getElementById("apicalDxSelect") as HTMLSelectElement, { target: { value: "chronic-apical-abscess" } });
    expect(getStatusChart().teeth[11].apicalDx).toBe("chronic-apical-abscess");
    fireEvent.change(document.getElementById("resorptionSelect") as HTMLSelectElement, { target: { value: "internal" } });
    expect(getStatusChart().teeth[11].resorptionType).toBe("internal");
    fireEvent.change(document.getElementById("mobilitySelect") as HTMLSelectElement, { target: { value: "m2" } });
    expect(getStatusChart().teeth[11].mobility).toBe("m2");

    // Peri-implant status is authored on an implant tooth.
    cleanup();
    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setSelectionForTest([11]);
    renderControls();
    const periImplant = document.getElementById("periImplantSelect") as HTMLSelectElement;
    expect(document.getElementById("periImplantRow")?.classList.contains("hidden")).toBe(false);
    fireEvent.change(periImplant, { target: { value: "mucositis" } });
    expect(getStatusChart().teeth[11].periImplant).toBe("mucositis");
  });

  it("writes a #modsChecks modifier and toggles calculus", () => {
    __setSelectionForTest([11]);
    renderControls();
    fireEvent.click(document.getElementById("chk-parodontal") as HTMLInputElement);
    expect(getStatusChart().teeth[11].mods).toContain("parodontal");
    fireEvent.click(document.getElementById("chk-parodontal") as HTMLInputElement);
    expect(getStatusChart().teeth[11].mods).not.toContain("parodontal");

    fireEvent.click(document.getElementById("calculusToggle") as HTMLInputElement);
    expect(getStatusChart().teeth[11].calculus).toBe(true);
  });

  it("checkboxes reflect stored state and endoResection writes", () => {
    __setSelectionForTest([11]);
    renderControls();
    const resection = document.getElementById("endoResection") as HTMLInputElement;
    expect(resection.checked).toBe(false);
    fireEvent.click(resection);
    expect(getStatusChart().teeth[11].endoResection).toBe(true);
    expect(getActiveRootPerio().endoResectionChecked).toBe(true);
  });

  it("hides the root block on a missing tooth and the perio block in Plan mode", () => {
    // A present natural tooth-base → both blocks visible.
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setActiveToothForTest(11);
    renderControls();
    expect(document.getElementById("rpRootBlock")?.classList.contains("hidden")).toBe(false);
    expect(document.getElementById("rpPerioBlock")?.classList.contains("hidden")).toBe(false);

    // Plan mode: the (status-only) perio block hides, the root block stays.
    act(() => { setChartMode("plan"); });
    expect(document.getElementById("rpPerioBlock")?.classList.contains("hidden")).toBe(true);
    expect(document.getElementById("rpRootBlock")?.classList.contains("hidden")).toBe(false);
    cleanup();

    // A missing tooth (base "none") hides the root block.
    __resetChartStateForTest();
    setChartMode("status");
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "none" });
    __setActiveToothForTest(11);
    renderControls();
    expect(document.getElementById("rpRootBlock")?.classList.contains("hidden")).toBe(true);
  });

  it("still renders #perioGrid and the imperative probing carve-out works", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setActiveToothForTest(11);
    renderControls();
    const grid = document.getElementById("perioGrid") as HTMLElement;
    expect(grid).toBeTruthy();
    // The declaratively-rendered container starts empty; the imperative builder
    // (Tier 3 PR 3e carve-out) populates it with the 6-site inputs.
    __buildPerioGridForTest(grid);
    expect(grid.querySelector("#perio-pd-MB")).toBeTruthy();
    // A setPerioSite-driven value shows after the imperative row sync.
    setPerioSite(11, "MB", { pd: 5 });
    __syncPerioRowForTest(getStatusChart().teeth[11], 11);
    expect((document.getElementById("perio-pd-MB") as HTMLInputElement).value).toBe("5");
  });
});
