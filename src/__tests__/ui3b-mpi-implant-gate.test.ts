// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-3b Task 3: per-arch mPI/mBI implant-gating.
//
// The Mombelli mPI/mBI rows (SP-perio PG-E) are per-surface graded indices
// that only make clinical sense for an implant — there is no "modified
// plaque index" for a natural tooth. Before this task the two rows always
// rendered in BOTH arches whenever `getPerioRowVisibility()` had them on,
// regardless of whether either arch actually contained an implant (the cells
// were merely disabled on non-implant teeth — see pge-rows.test.ts). This
// task additionally gates the ROW itself: an arch's mPI/mBI row only renders
// when that arch (`teeth.some(isToothImplant)`) contains at least one
// implant tooth. Per-arch, since `buildArch` runs once per arch (UPPER vs
// LOWER) — an upper-only implant must not show a phantom lower mPI/mBI row.
//
// Harness: PerioChart is rendered directly (not via <App/>), mirroring
// pge-rows.test.ts / ui2-row-visibility.test.ts — nothing exercised here
// needs a live initOdontogram()/SVG-grid mount. Implant teeth are set via
// `__setToothStateForTest(toothNo, { toothSelection: "implant" })`, the same
// API pge-rows.test.ts and pge-peri-implant.test.ts use. Row presence is
// asserted the same way ui2-index-names.test.ts does: by scanning
// `.perio-fullgrid-row-label-text` nodes in `#perioOverlayGrid` for the
// row's `t("perio.mpi.row")`/`t("perio.mbi.row")` text — one occurrence per
// arch that renders the row.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, act } from "@testing-library/react";
import PerioChart from "../PerioChart";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  setPerioRowVisibility,
} from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

function openGrid() {
  return render(createElement(PerioChart, { open: true, onClose: () => {} }));
}

function rowLabels(): string[] {
  const grid = document.getElementById("perioOverlayGrid")!;
  return Array.from(grid.querySelectorAll(".perio-fullgrid-row-label-text")).map((el) => el.textContent ?? "");
}

function mpiRowCount(): number {
  return rowLabels().filter((l) => l === t("perio.mpi.row")).length;
}

function mbiRowCount(): number {
  return rowLabels().filter((l) => l === t("perio.mbi.row")).length;
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  setPerioRowVisibility("mpi", true);
  setPerioRowVisibility("mbi", true);
});

describe("UI-3b Task 3: per-arch mPI/mBI implant gating", () => {
  it("hides mPI/mBI rows in both arches when no implant exists anywhere (even with visibility ON)", () => {
    openGrid();
    expect(mpiRowCount()).toBe(0);
    expect(mbiRowCount()).toBe(0);
  });

  it("shows the mPI/mBI rows ONLY in the arch that has an implant (upper)", () => {
    __setToothStateForTest(16, { toothSelection: "implant" }); // upper-right first molar
    openGrid();
    expect(mpiRowCount()).toBe(1);
    expect(mbiRowCount()).toBe(1);
  });

  it("shows the mPI/mBI rows ONLY in the arch that has an implant (lower)", () => {
    __setToothStateForTest(46, { toothSelection: "implant" }); // lower-right first molar
    openGrid();
    expect(mpiRowCount()).toBe(1);
    expect(mbiRowCount()).toBe(1);
  });

  it("shows the rows in BOTH arches when both arches have an implant", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    __setToothStateForTest(46, { toothSelection: "implant" });
    openGrid();
    expect(mpiRowCount()).toBe(2);
    expect(mbiRowCount()).toBe(2);
  });

  it("the UI-2 visibility toggle still hides the row even when an implant is present", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    openGrid();
    expect(mpiRowCount()).toBe(1);
    act(() => {
      setPerioRowVisibility("mpi", false);
    });
    expect(mpiRowCount()).toBe(0);
    // mBI (untouched) still renders — the two rows gate independently.
    expect(mbiRowCount()).toBe(1);

    act(() => {
      setPerioRowVisibility("mpi", true);
    });
    expect(mpiRowCount()).toBe(1);
  });
});

// NOTE: live-rebuild-on-implant-change (the `visibilitySig` extension that
// makes the grid re-run `buildGrid` when a tooth becomes/stops being an
// implant, so the mPI/mBI row appears/disappears without a remount) is NOT
// independently unit-tested here. `__setToothStateForTest` — the only
// implant-setting API this file's harness (and every other perio DOM test
// file) has access to — mutates state directly and does not call
// `notifyStateChange()`, so it cannot drive the live `onStateChange` rebuild
// path in a test; only the app's real interactive tooth-selection control
// (App.tsx, gated through `gateToothEdit`) does. See task-3-report.md for
// the manual verification steps covering this path in the running app.
