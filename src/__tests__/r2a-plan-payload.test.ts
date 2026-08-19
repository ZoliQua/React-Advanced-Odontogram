// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// R2-A Task 2: per-state API + a `plan` section in the JSON export + payload
// version 2.11.
//
// Builds on T1's dual-chart core (charts.status/charts.plan, chartMode,
// planInitialized — see r2a-dual-state.test.ts). This task keeps the
// existing export/import/API STATUS-PRIMARY (D3, ratified): `teeth` is
// always built from `charts.status` explicitly, never the active-chart
// alias `toothState`, so exporting/importing while in PLAN mode still
// targets/yields STATUS. The `plan` section is a NEW, additive,
// separately-addressable layer — present only when the plan chart has been
// initialized AND actually differs from status, so every pre-existing
// status-only caller/golden stays byte-identical apart from the version bump.
//
// Same DOM-free seams as r2a-dual-state.test.ts: `__setToothStateForTest`/
// `__getToothStateForTest` operate on the ACTIVE chart; `__getStatusStateForTest`/
// `__getPlanStateForTest` read a specific chart regardless of which is active;
// `__resetChartStateForTest` clears both charts + planInitialized + mode
// before every test so module-level state never leaks across tests.
// `__hydrateImportedChartsForTest` (new T2 seam) exercises the DATA-ONLY half
// of the import path (importStatus's hydrate step, extracted into
// `hydrateImportedCharts`) without requiring a live DOM/initOdontogram()
// token — importStatus()'s UI-sync tail (updateSelectionUI() ->
// syncControlsFromState()) assumes a live control-panel DOM and is out of
// scope for this task, so the seam targets exactly the new status-primary +
// conditional-plan-restore logic this task introduces, same as every other
// module-state test file avoiding importStatus() itself.
import { describe, it, expect, beforeEach } from "vitest";
import {
  setChartMode,
  getChartMode,
  __setToothStateForTest,
  __getStatusStateForTest,
  __getPlanStateForTest,
  __resetChartStateForTest,
  __collectExportPayloadForTest,
  __hydrateImportedChartsForTest,
  getStatusChart,
  getPlanChart,
  setPlanChart,
} from "../odontogram";

beforeEach(() => {
  __resetChartStateForTest();
});

describe("collectExportPayload — version 2.12, status-primary, conditional plan", () => {
  it("export in STATUS mode: version 2.12, teeth reflects status, NO plan key when plan is uninitialized", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" });
    expect(getChartMode()).toBe("status");

    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    expect(payload.teeth[16].restorationType).toBe("crown");
    expect(payload).not.toHaveProperty("plan");
  });

  it("plan == status after cloning (no plan-only edit made): still NO plan key (plan does not differ)", () => {
    __setToothStateForTest(17, { toothSelection: "tooth-base", restorationType: "onlay", toothSubstrate: "crownprep" });
    setChartMode("plan"); // first entry deep-clones status -> plan, so they are identical
    setChartMode("status");

    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    expect(payload).not.toHaveProperty("plan");
  });

  it("plan 16 != status 16 -> export includes a plan section: payload.plan[16] is the plan value, payload.teeth[16] stays the status value", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" });
    setChartMode("plan"); // clones status -> plan
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "inlay", toothSubstrate: "crownprep" }); // plan-only edit
    setChartMode("status");

    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    expect(payload.teeth[16].restorationType).toBe("crown");
    expect(payload.plan).toBeDefined();
    expect(payload.plan[16].restorationType).toBe("inlay");
  });

  it("export while in PLAN mode still yields STATUS as the primary `teeth` (export is status-primary, unaffected by active mode)", () => {
    __setToothStateForTest(24, { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" });
    setChartMode("plan");
    __setToothStateForTest(24, { toothSelection: "tooth-base", restorationType: "veneer", toothSubstrate: "crownprep" });
    expect(getChartMode()).toBe("plan"); // still active in PLAN mode at export time

    const payload = __collectExportPayloadForTest();
    expect(payload.teeth[24].restorationType).toBe("crown"); // status, NOT the active plan value
    expect(payload.plan).toBeDefined();
    expect(payload.plan[24].restorationType).toBe("veneer");

    setChartMode("status");
  });
});

describe("getStatusChart / getPlanChart / setPlanChart — per-state API", () => {
  it("getStatusChart()/getPlanChart() return the two charts' payloads independently", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", discoloration: "tetracycline" });
    setChartMode("plan");
    __setToothStateForTest(11, { toothSelection: "tooth-base", discoloration: "fluorosis" });
    setChartMode("status");

    const statusPayload = getStatusChart();
    const planPayload = getPlanChart();
    expect(statusPayload.version).toBe("2.21");
    expect(planPayload.version).toBe("2.21");
    expect(statusPayload.teeth[11].discoloration).toBe("tetracycline");
    expect(planPayload.teeth[11].discoloration).toBe("fluorosis");
    // getStatusChart() is exactly the status-primary export (same shape/rules).
    expect(statusPayload).toEqual(__collectExportPayloadForTest());
  });

  it("setPlanChart(payload) loads the PLAN chart only — status is left untouched — and marks planInitialized", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "none" });
    expect(getChartMode()).toBe("status");

    setPlanChart({
      version: "2.11",
      teeth: { 21: { toothSelection: "tooth-base", restorationType: "veneer", toothSubstrate: "crownprep" } },
    });

    // Status untouched by setPlanChart.
    expect(__getStatusStateForTest(21)?.restorationType).toBe("none");
    // Plan reflects the loaded payload.
    expect(__getPlanStateForTest(21)?.restorationType).toBe("veneer");
    expect(getPlanChart().teeth[21].restorationType).toBe("veneer");

    // planInitialized is now true, so entering plan mode must NOT re-clone
    // from status over the freshly-loaded plan value.
    setChartMode("plan");
    expect(__getPlanStateForTest(21)?.restorationType).toBe("veneer");
    expect(__getStatusStateForTest(21)?.restorationType).toBe("none");
    setChartMode("status");
  });

  it("setPlanChart does not visibly repaint while STATUS is active, but the plan data is present once PLAN is activated", () => {
    __setToothStateForTest(31, { toothSelection: "tooth-base", restorationType: "none" });
    expect(getChartMode()).toBe("status");
    // Active chart (status) must be unaffected regardless of DOM repaint timing.
    setPlanChart({ version: "2.11", teeth: { 31: { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" } } });
    expect(__getStatusStateForTest(31)?.restorationType).toBe("none");

    setChartMode("plan");
    expect(__getPlanStateForTest(31)?.restorationType).toBe("crown");
    setChartMode("status");
  });
});

describe("import hydrate — status-primary teeth + conditional plan restore (hydrateImportedCharts via __hydrateImportedChartsForTest)", () => {
  it("importing a payload WITH a `plan` section restores BOTH charts (round-trip)", () => {
    const payload = {
      version: "2.11",
      teeth: { 36: { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" } },
      plan: { 36: { toothSelection: "tooth-base", restorationType: "bridge", toothSubstrate: "crownprep" } },
    };
    __hydrateImportedChartsForTest(payload);

    expect(__getStatusStateForTest(36)?.restorationType).toBe("crown");
    expect(__getPlanStateForTest(36)?.restorationType).toBe("bridge");

    // planInitialized must be true after an import that carried a plan
    // section — re-entering plan mode must not re-clone from status.
    setChartMode("plan");
    expect(__getPlanStateForTest(36)?.restorationType).toBe("bridge");
    setChartMode("status");

    // Exporting again reproduces both sections (status differs from plan).
    const reExported = __collectExportPayloadForTest();
    expect(reExported.teeth[36].restorationType).toBe("crown");
    expect(reExported.plan[36].restorationType).toBe("bridge");
  });

  it("importing a legacy 2.10 payload (NO plan) leaves plan uninitialized; the first setChartMode(\"plan\") deep-copies status", () => {
    const payload = {
      version: "2.10",
      teeth: { 44: { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" } },
    };
    __hydrateImportedChartsForTest(payload);

    expect(__getStatusStateForTest(44)?.restorationType).toBe("crown");
    // Plan chart has no entry yet — it was cleared/never populated by the import.
    expect(__getPlanStateForTest(44)).toBeUndefined();

    setChartMode("plan");
    // First entry into plan mode deep-copies the freshly-imported status.
    expect(__getPlanStateForTest(44)?.restorationType).toBe("crown");
    setChartMode("status");
  });

  it("importing a payload without a plan section AFTER a plan was already initialized clears the stale plan (planInitialized reset false)", () => {
    // Seed an initialized plan that differs from status.
    __setToothStateForTest(12, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    __setToothStateForTest(12, { toothSelection: "tooth-base", restorationType: "veneer", toothSubstrate: "crownprep" });
    setChartMode("status");
    expect(__getPlanStateForTest(12)?.restorationType).toBe("veneer");

    // Now import a status-only (no plan) payload for a different tooth.
    __hydrateImportedChartsForTest({
      version: "2.11",
      teeth: { 13: { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" } },
    });

    // The stale plan chart must be cleared, not left dangling.
    expect(__getPlanStateForTest(12)).toBeUndefined();
    expect(__getPlanStateForTest(13)).toBeUndefined();

    // First plan-mode entry after this import re-clones from the new status.
    setChartMode("plan");
    expect(__getPlanStateForTest(13)?.restorationType).toBe("crown");
    expect(__getPlanStateForTest(12)?.restorationType).toBe("none"); // default state for a tooth never set in status
    setChartMode("status");
  });
});
