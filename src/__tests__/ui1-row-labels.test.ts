// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-1 Task 3: full-name perio-grid row labels + a wider label column.
// Before this task the row-label column was a hardcoded 132px, ellipsis-
// clipping long index names (e.g. "Gingival Index (GI)" -> "Gingival Index
// (..."). This is a structure-level guard (CSS pixels aren't unit-testable):
// it asserts (1) the grid's first `gridTemplateColumns` track — shared by
// EVERY row (header/graphic/data) in the same `.perio-fullgrid-arch` grid —
// is wide enough to hold the longest label, and (2) a long label's rendered
// text NODE is the full, untruncated i18n string (truncation, if any, is a
// CSS-only `text-overflow:ellipsis` presentation concern — never a data-layer
// one; this guards the data layer explicitly).
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import PerioChart from "../PerioChart";
import { __resetChartStateForTest, __setToothStateForTest, setNumberingSystem, setReadOnly } from "../odontogram";
import { t } from "../i18n/useI18n";

function openGrid() {
  return render(createElement(PerioChart, { open: true, onClose: () => {} }));
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setReadOnly(false);
});

afterEach(() => {
  cleanup();
  setReadOnly(false);
});

// The old hardcoded value this task replaces (PerioChart.tsx:94 pre-Task-3).
const OLD_ROW_LABEL_WIDTH = 132;

describe("UI-1 Task 3: row-label column is wide enough for full index names", () => {
  it("the arch grid's first gridTemplateColumns track is wider than the old 132px and fits the longest label (>= 200px)", () => {
    openGrid();
    const arch = document.querySelector(".perio-fullgrid-arch") as HTMLElement;
    expect(arch).toBeTruthy();
    const firstTrack = arch.style.gridTemplateColumns.trim().split(/\s+/)[0];
    const px = parseFloat(firstTrack);
    expect(firstTrack.endsWith("px")).toBe(true);
    expect(px).toBeGreaterThan(OLD_ROW_LABEL_WIDTH);
    expect(px).toBeGreaterThanOrEqual(200);
  });

  it("every arch band (upper + lower) shares the SAME first-track width, keeping header/graphic/data rows aligned", () => {
    openGrid();
    const arches = Array.from(document.querySelectorAll(".perio-fullgrid-arch")) as HTMLElement[];
    expect(arches.length).toBe(2);
    const widths = arches.map((a) => parseFloat(a.style.gridTemplateColumns.trim().split(/\s+/)[0]));
    expect(widths[0]).toBe(widths[1]);
  });
});

describe("UI-1 Task 3: long labels render the full i18n string (no data-layer truncation)", () => {
  it('the mBI row label text node equals t("perio.mbi.row") verbatim, not clipped', () => {
    // UI-3b Task 3: mBI additionally gates on the arch having an implant
    // (see ui3b-mpi-implant-gate.test.ts) — set one so the row renders here.
    __setToothStateForTest(16, { toothSelection: "implant" });
    openGrid();
    const labels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label-text"));
    const mbiLabel = labels.find((el) => el.textContent === t("perio.mbi.row"));
    expect(mbiLabel).toBeTruthy();
    // Exact match — not a prefix/truncated substring of the full string.
    expect(mbiLabel!.textContent).toBe(t("perio.mbi.row"));
    expect(mbiLabel!.textContent!.length).toBe(t("perio.mbi.row").length);
  });

  it("the GI row label also renders in full (regression guard for other long rows)", () => {
    openGrid();
    const labels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label-text"));
    const giLabel = labels.find((el) => el.textContent === t("perio.gi.row"));
    expect(giLabel).toBeTruthy();
    expect(giLabel!.textContent).toBe(t("perio.gi.row"));
  });
});
