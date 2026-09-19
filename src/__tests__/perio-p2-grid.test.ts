// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Periodontal-arc sub-project P2, Task 2: the full-mouth perio-chart grid +
// state binding + summary bar, built inside the P2 Task 1 overlay shell's
// `#perioOverlayGrid` placeholder. P1 (v1.34.0) shipped the data core
// (setPerioSite/getToothPerio/getToothCal/getPerioSummary/getPerioChart);
// P2 Task 1 (committed) shipped the overlay shell only. This task fills the
// grid and binds it to that data core. Keyboard auto-advance is Task 3 — not
// exercised here.
//
// PerioChart is rendered directly (not via <App/>) — nothing it needs
// (perio data core, formatToothLabel, isUpperTooth, onStateChange,
// getReadOnly) requires a live initOdontogram()/SVG-grid mount, so the
// heavier <App/> mock harness used by perio-p2-overlay.test.ts is
// unnecessary here.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import PerioChart from "../PerioChart";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  setChartMode,
  getToothPerio,
  getToothCal,
  getPerioSummary,
  setPerioSite,
  PERIO_SITES,
} from "../odontogram";

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

function openGrid() {
  return render(createElement(PerioChart, { open: true, onClose: () => {} }));
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});

afterEach(() => {
  cleanup();
});

describe("P2 Task 2: arch bands + tooth headers", () => {
  it("renders an UPPER arch band (18..11,21..28) then a LOWER band (48..41,31..38), in that order", () => {
    openGrid();
    const grid = document.getElementById("perioOverlayGrid")!;
    expect(grid).toBeTruthy();
    const headers = Array.from(grid.querySelectorAll("[data-perio-tooth-header]")).map((h) =>
      h.getAttribute("data-perio-tooth-header"),
    );
    expect(headers).toEqual([...UPPER_ARCH, ...LOWER_ARCH].map(String));
  });

  it("tooth headers use formatToothLabel (FDI by default)", () => {
    openGrid();
    const header = document.querySelector('[data-perio-tooth-header="26"]')!;
    expect(header.textContent).toBe("26");
  });

  it("each tooth column has 3 buccal + 3 lingual site cells (PD/GM/BOP inputs + CAL readout per site)", () => {
    openGrid();
    for (const site of PERIO_SITES) {
      expect(document.getElementById(`perio-fg-pd-26-${site}`), `pd ${site}`).toBeTruthy();
      expect(document.getElementById(`perio-fg-gm-26-${site}`), `gm ${site}`).toBeTruthy();
      expect(document.getElementById(`perio-fg-bop-26-${site}`), `bop ${site}`).toBeTruthy();
      expect(document.getElementById(`perio-fg-cal-26-${site}`), `cal ${site}`).toBeTruthy();
    }
  });

  it("each tooth has a mobility cell", () => {
    openGrid();
    expect(document.getElementById("perio-fg-mobility-26")).toBeTruthy();
  });
});

describe("P2 Task 2: state binding — authoring", () => {
  it("setting PD on tooth 26 site MB calls through to setPerioSite (getToothPerio updated) and the CAL cell reflects getToothCal", () => {
    openGrid();
    const pdInput = document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement;
    fireEvent.change(pdInput, { target: { value: "4" } });
    expect(getToothPerio(26).pd.MB).toBe(4);
    const calCell = document.getElementById("perio-fg-cal-26-MB")!;
    expect(calCell.textContent).toBe(String(getToothCal(26).get("MB")));
  });

  it("un-charting a site (empty PD) clears the CAL cell and disables GM/BOP for that site", () => {
    openGrid();
    const pdInput = document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement;
    fireEvent.change(pdInput, { target: { value: "4" } });
    fireEvent.change(pdInput, { target: { value: "" } });
    expect(getToothPerio(26).pd.MB).toBeUndefined();
    const calCell = document.getElementById("perio-fg-cal-26-MB")!;
    expect(calCell.textContent).toBe("");
    const gmInput = document.getElementById("perio-fg-gm-26-MB") as HTMLInputElement;
    const bopInput = document.getElementById("perio-fg-bop-26-MB") as HTMLInputElement;
    expect(gmInput.disabled).toBe(true);
    expect(bopInput.disabled).toBe(true);
  });

  it("setting GM on an already-charted site calls through to setPerioSite", () => {
    openGrid();
    const pdInput = document.getElementById("perio-fg-pd-14-B") as HTMLInputElement;
    fireEvent.change(pdInput, { target: { value: "3" } });
    const gmInput = document.getElementById("perio-fg-gm-14-B") as HTMLInputElement;
    fireEvent.change(gmInput, { target: { value: "2" } });
    expect(getToothPerio(14).gm.B).toBe(2);
    const calCell = document.getElementById("perio-fg-cal-14-B")!;
    expect(calCell.textContent).toBe(String(getToothCal(14).get("B")));
    expect(getToothCal(14).get("B")).toBe(5);
  });

  it("toggling BOP calls through to setPerioSite and updates the summary bar %BOP", () => {
    openGrid();
    const pdInput = document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement;
    fireEvent.change(pdInput, { target: { value: "4" } });
    const bopInput = document.getElementById("perio-fg-bop-26-MB") as HTMLInputElement;
    fireEvent.click(bopInput);
    expect(getToothPerio(26).bop).toEqual(["MB"]);
    const summary = getPerioSummary();
    expect(summary.bopPercent).toBe(100);
    const bopSummaryEl = document.getElementById("perio-fg-summary-bop")!;
    expect(bopSummaryEl.textContent).toContain("100");
  });
});

describe("P2 Task 2: summary bar", () => {
  it("shows charted count, %BOP, worst CAL, and max PD from getPerioSummary()", () => {
    openGrid();
    fireEvent.change(document.getElementById("perio-fg-pd-11-B") as HTMLInputElement, { target: { value: "3" } });
    fireEvent.change(document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement, { target: { value: "6" } });
    fireEvent.change(document.getElementById("perio-fg-gm-26-MB") as HTMLInputElement, { target: { value: "2" } });

    const summary = getPerioSummary();
    expect(summary.chartedSites).toBe(2);
    expect(summary.maxPd).toBe(6);
    expect(summary.worstCal).toBe(8);

    expect(document.getElementById("perio-fg-summary-charted")!.textContent).toContain("2");
    expect(document.getElementById("perio-fg-summary-maxpd")!.textContent).toContain("6");
    expect(document.getElementById("perio-fg-summary-cal")!.textContent).toContain("8");
  });

  it("starts at zero/blank when nothing is charted", () => {
    openGrid();
    expect(document.getElementById("perio-fg-summary-charted")!.textContent).toContain("0");
  });
});

describe("P2 Task 2: dual-state reflow", () => {
  it("switching to plan mode reflows the grid to the plan chart's perio", () => {
    openGrid();
    fireEvent.change(document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement, { target: { value: "4" } });

    act(() => {
      setChartMode("plan");
    });

    // Plan chart is cloned from status at first switch -> same value initially.
    const pdInPlan = document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement;
    expect(pdInPlan.value).toBe("4");

    // Editing the plan chart directly (bypassing the grid's own onChange) must
    // still reflow into the grid via the onStateChange subscription.
    act(() => {
      setPerioSite(26, "MB", { pd: 9 });
    });
    expect((document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement).value).toBe("9");

    act(() => {
      setChartMode("status");
    });
    expect((document.getElementById("perio-fg-pd-26-MB") as HTMLInputElement).value).toBe("4");
  });
});

describe("P2 Task 2: perioRowHidden gate", () => {
  it("a missing tooth's site cells and mobility cell are disabled", () => {
    __setToothStateForTest(11, { toothSelection: "none" });
    openGrid();
    for (const site of PERIO_SITES) {
      expect((document.getElementById(`perio-fg-pd-11-${site}`) as HTMLInputElement).disabled).toBe(true);
    }
    expect((document.getElementById("perio-fg-mobility-11") as HTMLSelectElement).disabled).toBe(true);
  });

  it("an implant tooth's site cells are disabled", () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    openGrid();
    expect((document.getElementById("perio-fg-pd-21-B") as HTMLInputElement).disabled).toBe(true);
  });

  it("a normal present tooth's cells are enabled", () => {
    openGrid();
    expect((document.getElementById("perio-fg-pd-26-B") as HTMLInputElement).disabled).toBe(false);
    expect((document.getElementById("perio-fg-mobility-26") as HTMLSelectElement).disabled).toBe(false);
  });
});
