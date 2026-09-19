// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// DS-1 whole-branch review — three Minor fixes:
//   Fix 1: PER-TOOTH reset paths (zoom-popover / context-menu single-tooth
//          reset + "Reset selected teeth") route through the edit GATE, so a
//          reset mirrors on an un-planned tooth (no spurious status->plan diff)
//          and CONFIRMS on a plan-edited tooth — parity with clearing the same
//          tooth via the restoration dropdown. The whole-mouth reset stays
//          UNGATED (not covered here).
//   Fix 2: `importStatus()` / `setPlanChart()` clear any pending dual-state
//          confirm, so a later accept can never run a stale deferred edit
//          against freshly-hydrated state.
//   Fix 3: the dentition presets flip `edentulous` INSIDE their gated closure,
//          so on Cancel the global stays at its prior value (no flag/teeth
//          mismatch).
//
// Drive the REAL module through its public API + the DS-1 review-fix test seams
// — no live DOM/SVG grid.
import { describe, it, expect, beforeEach } from "vitest";
import {
  setChartMode,
  getPlanChanges,
  getStatusChart,
  setPerioSite,
  getToothPerio,
  setPlanChart,
  isDualStateConfirmPending,
  acceptDualStateConfirm,
  cancelDualStateConfirm,
  __resetChartStateForTest,
  __planEditedTeethForTest,
  __setEdentulousForTest,
  __resetToothForTest,
  __resetTeethForTest,
  __applyDentitionPresetForTest,
  __importStatusForTest,
  __getStatusStateForTest,
} from "../odontogram";

beforeEach(() => {
  __resetChartStateForTest();
  __setEdentulousForTest(false); // global is NOT reset by __resetChartStateForTest
});

// ---------------------------------------------------------------------------
// Fix 1 — per-tooth reset routes through the gate
// ---------------------------------------------------------------------------
describe("Fix 1: per-tooth reset of an UN-PLANNED tooth mirrors (no diff)", () => {
  it("resetting a status-mode tooth (plan initialized, un-planned) leaves NO getPlanChanges entry", () => {
    // Initialize the plan, then edit an un-planned tooth in status mode — the
    // edit mirrors into the plan (no diff yet).
    setChartMode("plan");
    setChartMode("status");
    setPerioSite(26, "MB", { pd: 4 });
    expect(getPlanChanges().some((c) => c.toothNo === 26)).toBe(false);

    // Reset the same tooth. Because 26 was never plan-edited, the reset must
    // MIRROR status->plan — so still no diff (an ungated reset would leave the
    // plan holding pd=4 while status goes default -> a spurious diff).
    __resetToothForTest(26);

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(26).pd.MB).toBeUndefined(); // status reset to default
    expect(getPlanChanges().some((c) => c.toothNo === 26)).toBe(false);
  });
});

describe("Fix 1: per-tooth reset of a PLAN-EDITED tooth opens the confirm", () => {
  it("resetting a plan-edited tooth in status mode defers behind the dual-state confirm", () => {
    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 }); // plan-edit 16
    expect(__planEditedTeethForTest()).toContain(16);
    setChartMode("status");

    __resetToothForTest(16); // status reset of a plan-edited tooth -> diverges

    expect(isDualStateConfirmPending()).toBe(true);
    // Deferred: nothing applied yet.
    expect(getToothPerio(16).pd.MB).toBe(5);

    acceptDualStateConfirm();
    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(16).pd.MB).toBeUndefined(); // status now reset
    // Plan untouched -> the reset diverges from the still-planned tooth.
    expect(getPlanChanges().some((c) => c.toothNo === 16 && c.axis === "perio")).toBe(true);
  });
});

describe("Fix 1: multi-tooth (selection) reset routes through the batch gate", () => {
  it("confirms ONCE when the selection includes a plan-edited tooth; cancel applies none", () => {
    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 }); // plan-edit 16 (diverges from status pd=5)
    expect(__planEditedTeethForTest()).toContain(16);
    setChartMode("status");
    setPerioSite(26, "MB", { pd: 4 }); // un-planned tooth (mirrors)

    __resetTeethForTest([16, 26]); // batch reset touching plan-edited 16

    expect(isDualStateConfirmPending()).toBe(true);
    // Nothing applied while pending.
    expect(getToothPerio(16).pd.MB).toBe(5);
    expect(getToothPerio(26).pd.MB).toBe(4);

    cancelDualStateConfirm();
    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(16).pd.MB).toBe(5); // untouched
    expect(getToothPerio(26).pd.MB).toBe(4); // untouched
  });
});

// ---------------------------------------------------------------------------
// Fix 2 — hydrate paths clear a pending confirm
// ---------------------------------------------------------------------------
describe("Fix 2: importStatus clears a pending dual-state confirm", () => {
  it("a pending confirm is dropped after importStatus (no stale deferred edit)", () => {
    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    setChartMode("status");
    setPerioSite(16, "MB", { pd: 3 }); // opens the confirm
    expect(isDualStateConfirmPending()).toBe(true);

    __importStatusForTest({ version: "2.13", teeth: {} });

    expect(isDualStateConfirmPending()).toBe(false);
    // The freshly-imported status[16] is a plain default (no perio).
    expect(getToothPerio(16).pd.MB).toBeUndefined();
    // A later accept must be a no-op — it must NOT run the stale deferred edit
    // (which would have set pd=3) against the freshly-imported state.
    acceptDualStateConfirm();
    expect(getToothPerio(16).pd.MB).toBeUndefined();
    expect((__getStatusStateForTest(16) as any).toothSelection).toBe("tooth-base");
  });
});

describe("Fix 2: setPlanChart clears a pending dual-state confirm", () => {
  it("a pending confirm is dropped after setPlanChart", () => {
    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    setChartMode("status");
    setPerioSite(16, "MB", { pd: 3 }); // opens the confirm
    expect(isDualStateConfirmPending()).toBe(true);

    setPlanChart({ version: "2.13", teeth: {} });

    expect(isDualStateConfirmPending()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Fix 3 — dentition preset flips `edentulous` inside the gate
// ---------------------------------------------------------------------------
describe("Fix 3: a dentition preset over a plan-edited tooth, then Cancel", () => {
  it("leaves globals.edentulous unchanged from its prior value (true)", () => {
    // Make the mouth edentulous BEFORE the plan exists (pure passthrough, no
    // confirm) so `edentulous` is true and every tooth is 'none'.
    __setEdentulousForTest(true);
    expect(getStatusChart().globals.edentulous).toBe(true);

    // Plan-edit tooth 15 (a PRIMARY_MILK position). Under the primary preset it
    // becomes 'milktooth' (differs from the current 'none'), so the preset's
    // `changed` set includes it -> the confirm fires.
    setChartMode("plan");
    setPerioSite(15, "MB", { pd: 6 });
    expect(__planEditedTeethForTest()).toContain(15);
    setChartMode("status");

    __applyDentitionPresetForTest("primary"); // touches plan-edited 15 -> confirm
    expect(isDualStateConfirmPending()).toBe(true);

    cancelDualStateConfirm();
    expect(isDualStateConfirmPending()).toBe(false);
    // The bug flipped `edentulous` off BEFORE the gate deferred; on cancel it
    // must stay at its prior value (true).
    expect(getStatusChart().globals.edentulous).toBe(true);
  });

  it("accept flips globals.edentulous off (the preset re-populates the arch)", () => {
    __setEdentulousForTest(true);
    setChartMode("plan");
    setPerioSite(15, "MB", { pd: 6 });
    setChartMode("status");

    __applyDentitionPresetForTest("primary");
    acceptDualStateConfirm();

    expect(getStatusChart().globals.edentulous).toBe(false);
  });
});
