// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-2 Task 2: the perio chart consumes `getPerioRowVisibility()` (the
// Settings -> Periodontal tab flags added in Task 1) and hides the
// corresponding index rows. Default (all-visible) must render every row
// exactly as before Task 2; toggling a row off via `setPerioRowVisibility`
// must remove it from the DOM (both aspects for a two-block id like `pd`),
// while the tooth-number header + the tooth-row graphic — which are never
// gated — always stay present. Re-enabling restores the row.
//
// PerioChart is rendered directly (not via <App/>), same precedent as
// perio-p2-grid.test.ts — nothing exercised here needs a live
// initOdontogram()/SVG-grid mount (the tooth-row graphic's template-cache
// fetch fails harmlessly in jsdom and is caught, leaving the always-visible
// header/placeholder row present regardless).
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, act } from "@testing-library/react";
import PerioChart from "../PerioChart";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  getPerioRowVisibility,
  setPerioRowVisibility,
  onStateChange,
  type PerioRowId,
} from "../odontogram";

const ALL_ROW_IDS: PerioRowId[] = [
  "plaque", "bop", "cal", "gm", "pd", "furcation", "mobility", "cej",
  "rootConcavity", "pi", "gi", "mpi", "mbi", "kg", "gt", "miller",
];

function openGrid() {
  return render(createElement(PerioChart, { open: true, onClose: () => {} }));
}

function rowLabels(): string[] {
  const grid = document.getElementById("perioOverlayGrid")!;
  return Array.from(grid.querySelectorAll(".perio-fullgrid-row-label-text")).map((el) => el.textContent ?? "");
}

function toothHeaders(): string[] {
  const grid = document.getElementById("perioOverlayGrid")!;
  return Array.from(grid.querySelectorAll("[data-perio-tooth-header]")).map((el) => el.getAttribute("data-perio-tooth-header")!);
}

function graphicCellCount(): number {
  const grid = document.getElementById("perioOverlayGrid")!;
  return grid.querySelectorAll(".perio-fullgrid-graphic-cell").length;
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});

afterEach(() => {
  cleanup();
  // Restore module-level defaults so this file doesn't leak state into other
  // test files sharing the same module instance (mirrors
  // ui2-perio-settings.test.tsx's own afterEach precedent).
  for (const id of ALL_ROW_IDS) setPerioRowVisibility(id, true);
});

describe("UI-2 Task 2: default visibility (all true)", () => {
  it("getPerioRowVisibility() defaults every id to true", () => {
    const visibility = getPerioRowVisibility();
    for (const id of ALL_ROW_IDS) expect(visibility[id], id).toBe(true);
  });

  it("does NOT fire notifyStateChange when the visibility is already the same (idempotent)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setPerioRowVisibility("pi", true);
      expect(fired).toBe(false);
    } finally {
      unsub();
    }
  });

  it("every index row label is present", () => {
    // UI-3b Task 3: mPI/mBI additionally gate on the arch having an implant
    // (see ui3b-mpi-implant-gate.test.ts) — set one so both rows render here.
    __setToothStateForTest(16, { toothSelection: "implant" });
    openGrid();
    const labels = rowLabels();
    expect(labels).toContain("Plaque Index (PI)");
    expect(labels).toContain("Gingival Index (GI)");
    expect(labels).toContain("Peri-implant Plaque Index (mPI)");
    expect(labels).toContain("Peri-implant Bleeding Index (mBI)");
    expect(labels).toContain("Keratinized Gingiva (KG)");
    expect(labels).toContain("Gingival Thickness (GT)");
    expect(labels).toContain("Miller Class");
    expect(labels).toContain("Mobility");
    expect(labels).toContain("Plaque");
    expect(labels).toContain("Furcation");
    // pd/gm/cal/bop each render TWO rows (buccal + palatal aspect) PER ARCH
    // (upper + lower), so 4 occurrences total.
    expect(labels.filter((l) => l.endsWith("PD"))).toHaveLength(4);
    expect(labels.filter((l) => l.endsWith("GM"))).toHaveLength(4);
    expect(labels.filter((l) => l.endsWith("CAL"))).toHaveLength(4);
    expect(labels.filter((l) => l.endsWith("BOP"))).toHaveLength(4);
  });

  it("the tooth-number header and the tooth-row graphic placeholder are present", () => {
    openGrid();
    expect(toothHeaders().length).toBe(32);
    expect(graphicCellCount()).toBe(4); // buccal + palatal cells, per arch (upper + lower)
  });
});

describe("UI-2 Task 2: hiding a single-block row (pi)", () => {
  it("removes the PI row label after a rebuild, keeps every other row, restores on re-enable", () => {
    openGrid();
    expect(rowLabels()).toContain("Plaque Index (PI)");

    act(() => {
      setPerioRowVisibility("pi", false);
    });

    const labelsHidden = rowLabels();
    expect(labelsHidden).not.toContain("Plaque Index (PI)");
    // Everything else is untouched.
    expect(labelsHidden).toContain("Gingival Index (GI)");
    expect(labelsHidden).toContain("Mobility");
    expect(labelsHidden.filter((l) => l.endsWith("PD"))).toHaveLength(4);

    // The always-rendered rows never gate.
    expect(toothHeaders().length).toBe(32);
    expect(graphicCellCount()).toBe(4);

    act(() => {
      setPerioRowVisibility("pi", true);
    });
    expect(rowLabels()).toContain("Plaque Index (PI)");
  });
});

describe("UI-2 Task 2: hiding a two-block row (pd — buccal + palatal)", () => {
  it("removes BOTH the buccal and palatal PD row labels, restores both on re-enable", () => {
    openGrid();
    expect(rowLabels().filter((l) => l.endsWith("PD"))).toHaveLength(4);

    act(() => {
      setPerioRowVisibility("pd", false);
    });
    const labelsHidden = rowLabels();
    expect(labelsHidden.filter((l) => l.endsWith("PD"))).toHaveLength(0);
    // Sibling two-block rows (gm/cal/bop) are untouched.
    expect(labelsHidden.filter((l) => l.endsWith("GM"))).toHaveLength(4);
    expect(labelsHidden.filter((l) => l.endsWith("CAL"))).toHaveLength(4);
    expect(labelsHidden.filter((l) => l.endsWith("BOP"))).toHaveLength(4);
    // The always-rendered rows never gate.
    expect(toothHeaders().length).toBe(32);
    expect(graphicCellCount()).toBe(4);

    act(() => {
      setPerioRowVisibility("pd", true);
    });
    expect(rowLabels().filter((l) => l.endsWith("PD"))).toHaveLength(4);
  });
});

describe("UI-2 Task 2: hiding every row still leaves the header + graphic", () => {
  it("hiding all 16 ids empties every row label but keeps the header + graphic placeholder", () => {
    openGrid();
    act(() => {
      for (const id of ALL_ROW_IDS) setPerioRowVisibility(id, false);
    });
    expect(rowLabels().filter((l) => l !== "")).toHaveLength(0);
    expect(toothHeaders().length).toBe(32);
    expect(graphicCellCount()).toBe(4);
  });
});
