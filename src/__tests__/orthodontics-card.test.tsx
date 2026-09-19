// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3, PR 3a: declarative-render test for `OrthodonticsCard`.
// Mounts the card as part of `ToothControlsSurface` under `<OdontogramProvider>`
// with the lifecycle-only mock the composable-surface suites use
// (initOdontogram/destroyOdontogram stubbed; every other engine getter/setter
// stays real). The full controls surface is mounted (not the card alone) because
// a selection-scoped write routes through `applyToSelected`, which re-syncs the
// active tooth's controls via `syncControlsFromState` — that reads the sibling
// controls DOM (#apicalDxSelect, …). Proves the card renders
// `#orthoApplianceSelect` with its real options, that changing a control writes
// engine state (`getStatusChart()`), and that it hides per
// `getActiveOrtho().visible`.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { OdontogramProvider, ToothControlsSurface } from "../App";
import {
  __resetChartStateForTest,
  __setActiveToothForTest,
  __setSelectionForTest,
  __setToothStateForTest,
  setNumberingSystem,
  getStatusChart,
  getActiveOrtho,
  VALID_ORTHO_APPLIANCE,
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
  setNumberingSystem("FDI");
});

describe("PR 3a: <OrthodonticsCard/> renders declaratively", () => {
  it("renders #orthoCard with the appliance select and its real options", () => {
    renderControls();
    const select = document.getElementById("orthoApplianceSelect") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(document.querySelector("#orthoCard #orthoApplianceSelect")).toBeTruthy();
    expect(document.getElementById("orthoDriftSelect")).toBeTruthy();
    expect(document.getElementById("orthoVerticalSelect")).toBeTruthy();
    expect(document.getElementById("orthoRotationToggle")).toBeTruthy();
    // The declarative card renders the same option set the imperative wiring did.
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).toEqual(Array.from(VALID_ORTHO_APPLIANCE));
    expect(values).toContain("bracket");
  });

  it("changing #orthoApplianceSelect writes ortho state to the status chart", () => {
    __setSelectionForTest([11]);
    renderControls();
    const select = document.getElementById("orthoApplianceSelect") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "bracket" } });

    expect(getActiveOrtho()?.appliance).toBe("bracket");
    expect(getStatusChart().teeth[11].orthoAppliance).toBe("bracket");
  });

  it("toggling #orthoRotationToggle writes rotation and reflects the checked state", () => {
    __setSelectionForTest([11]);
    renderControls();
    const toggle = document.getElementById("orthoRotationToggle") as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    fireEvent.click(toggle);
    expect(getActiveOrtho()?.rotation).toBe(true);
    expect(getStatusChart().teeth[11].orthoRotation).toBe(true);
    expect(toggle.checked).toBe(true);
  });

  it("shows #orthoCard for a natural tooth and hides it for an implant (gate)", () => {
    // A plain natural tooth-base passes `orthoAllowed` → card visible.
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setActiveToothForTest(11);
    renderControls();
    expect(document.getElementById("orthoCard")).toBeTruthy();
    expect(document.getElementById("orthoCard")?.classList.contains("hidden")).toBe(false);
    cleanup();

    // An implant fails `orthoAllowed` → card present in the DOM but class-hidden.
    __resetChartStateForTest();
    setNumberingSystem("FDI");
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setActiveToothForTest(11);
    renderControls();
    expect(document.getElementById("orthoCard")).toBeTruthy();
    expect(document.getElementById("orthoCard")?.classList.contains("hidden")).toBe(true);
  });
});
