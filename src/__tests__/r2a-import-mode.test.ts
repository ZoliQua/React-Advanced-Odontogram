// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Whole-branch review fix: importing a case file while in PLAN mode must not
// strand the user on an empty/stale plan chart.
//
// R2-A's import path (`importStatus()` / `hydrateImportedCharts()`) is
// status-primary: it always loads `payload.teeth` -> `charts.status`, and
// `payload.plan` -> `charts.plan` (clearing `charts.plan` +
// `planInitialized = false` when the payload carries no `plan` section —
// legacy <=2.10 files, or a 2.11 export where plan matched status and was
// omitted). What `importStatus()` did NOT do before this fix was reset
// `chartMode`/`toothState`: if the user was in Plan mode at import time,
// `chartMode` stayed "plan" and `toothState` kept aliasing `charts.plan` —
// which the import may have just CLEARED. The post-hydrate repaint loop
// then painted from that empty/stale plan chart instead of the freshly
// imported status data, and the `Status | Plan` toggle kept reading "Plan"
// (importStatus() never called syncChartModeUi()). Subsequent edits via
// __setToothStateForTest/applyToSelected landed on the (empty) plan chart,
// not the imported status chart, appearing to silently no-op relative to
// what the user was looking at.
//
// The fix: importStatus() now force-resets `chartMode = "status"` and
// `toothState = charts.status` right after hydrateImportedCharts() (before
// the repaint loop), and calls syncChartModeUi() at the end — landing EVERY
// import (status-only or with a plan) on the status chart, predictably.
//
// The fix logic lives in a small extracted function,
// `resetActiveChartToStatusAfterImport()`, that `importStatus()` calls
// right after `hydrateImportedCharts()`. `__importStatusForTest` (new seam,
// mirrors `__hydrateImportedChartsForTest`) exercises `hydrateImportedCharts()`
// + `resetActiveChartToStatusAfterImport()` together — i.e. the DATA-ONLY
// half of the real import path, including the fix — without requiring a
// live DOM/initOdontogram() token. `importStatus()`'s own UI-sync tail
// (`updateSelectionUI()` -> `syncControlsFromState()`, `syncChartModeUi()`)
// assumes a live control-panel DOM and is out of scope for this seam, same
// as `__hydrateImportedChartsForTest` (see its docstring in odontogram.ts);
// the toggle UI itself is covered separately by r2a-toggle-ui.test.ts.
import { describe, it, expect, beforeEach } from "vitest";
import {
  setChartMode,
  getChartMode,
  __setToothStateForTest,
  __getToothStateForTest,
  __getStatusStateForTest,
  __getPlanStateForTest,
  __resetChartStateForTest,
  __importStatusForTest,
  getPlanChart,
} from "../odontogram";

beforeEach(() => {
  __resetChartStateForTest();
});

describe("importStatus() while in Plan mode — status-only payload", () => {
  it("lands on status mode, repaints the imported status data (not the stale/empty plan), and accepts further edits", () => {
    // Seed a status tooth, then switch to Plan and make it clearly differ
    // from status, so a stale-plan repaint would be visibly wrong.
    __setToothStateForTest(11, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan"); // first entry deep-clones status -> plan
    __setToothStateForTest(11, { toothSelection: "tooth-base", restorationType: "veneer", toothSubstrate: "crownprep" });
    expect(getChartMode()).toBe("plan");
    expect(__getPlanStateForTest(11)?.restorationType).toBe("veneer");

    // Import a status-only payload (no `plan` section) while still in Plan
    // mode.
    __importStatusForTest({
      version: "2.11",
      teeth: {
        11: { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" },
      },
    });

    // Must land on STATUS mode, not stay on the now-cleared plan.
    expect(getChartMode()).toBe("status");
    // The active chart (toothState alias) must show the imported status
    // data, not a stale/empty plan.
    expect(__getToothStateForTest(11)?.restorationType).toBe("crown");
    expect(__getStatusStateForTest(11)?.restorationType).toBe("crown");
    // Plan was cleared by the status-only import (pre-existing, correct
    // hydrate behavior — untouched by this fix).
    expect(__getPlanStateForTest(11)).toBeUndefined();

    // A subsequent edit via the active-chart alias must land (not silently
    // no-op against an empty/detached chart).
    __setToothStateForTest(11, { toothSelection: "tooth-base", restorationType: "inlay", toothSubstrate: "crownprep" });
    expect(__getToothStateForTest(11)?.restorationType).toBe("inlay");
    expect(__getStatusStateForTest(11)?.restorationType).toBe("inlay");
  });

  it("importing a payload WITH a plan section still lands on status mode; getPlanChart() reflects the imported plan", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "onlay", toothSubstrate: "crownprep" });
    expect(getChartMode()).toBe("plan");

    __importStatusForTest({
      version: "2.11",
      teeth: {
        21: { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" },
      },
      plan: {
        21: { toothSelection: "tooth-base", restorationType: "bridge", toothSubstrate: "crownprep" },
      },
    });

    // Lands on status mode regardless of the payload carrying a plan.
    expect(getChartMode()).toBe("status");
    expect(__getToothStateForTest(21)?.restorationType).toBe("crown");
    expect(__getStatusStateForTest(21)?.restorationType).toBe("crown");

    // The imported plan is present in the (inactive) plan chart.
    expect(__getPlanStateForTest(21)?.restorationType).toBe("bridge");
    expect(getPlanChart().teeth[21].restorationType).toBe("bridge");

    // Switching to Plan afterwards surfaces the imported plan (no strand).
    setChartMode("plan");
    expect(__getToothStateForTest(21)?.restorationType).toBe("bridge");
    setChartMode("status");
  });

  it("importing while already in status mode is unaffected (no regression for the common case)", () => {
    expect(getChartMode()).toBe("status");
    __importStatusForTest({
      version: "2.11",
      teeth: { 46: { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" } },
    });
    expect(getChartMode()).toBe("status");
    expect(__getToothStateForTest(46)?.restorationType).toBe("crown");
  });

  it("an invalid/non-object payload is a no-op and does not force a mode switch", () => {
    setChartMode("plan");
    __setToothStateForTest(31, { toothSelection: "tooth-base", restorationType: "veneer", toothSubstrate: "crownprep" });
    __importStatusForTest(null);
    __importStatusForTest(undefined);
    __importStatusForTest("not-an-object");
    expect(getChartMode()).toBe("plan");
    expect(__getPlanStateForTest(31)?.restorationType).toBe("veneer");
    setChartMode("status");
  });
});
