// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// The dual-chart core's INVARIANTS, pinned before the chart container moves out
// of odontogram.ts into src/state/chart.ts.
//
// The suite covers dual-state BEHAVIOUR extensively, but not the aliasing
// contract the extraction could break silently: `toothState` is a reassignable
// alias for the active chart, and after the move it becomes an ES module live
// binding. A stale alias (a captured local, a copied reference) would still let
// most tests pass while writes silently landed in the wrong chart. These four
// invariants fail loudly in that case.
import { describe, it, expect, beforeEach } from "vitest";
import {
  setChartMode, getChartMode, getStatusChart, getPlanChart,
  __resetChartStateForTest, __setToothStateForTest, __getStatusStateForTest, __getPlanStateForTest,
} from "../odontogram";

const caries = (surfaces: string[]) => ({ toothSelection: "tooth-base", caries: surfaces });

describe("chart core: the active-chart alias follows the mode", () => {
  beforeEach(() => __resetChartStateForTest());

  it("a write lands in the chart the current mode names, never the other one", () => {
    __setToothStateForTest(11, caries(["caries-occlusal"]));
    expect(__getStatusStateForTest(11)?.caries).toEqual(["caries-occlusal"]);

    setChartMode("plan");
    expect(getChartMode()).toBe("plan");
    __setToothStateForTest(11, caries(["caries-mesial", "caries-distal"]));
    // the plan write must NOT have touched status
    expect(__getStatusStateForTest(11)?.caries).toEqual(["caries-occlusal"]);
    expect((__getPlanStateForTest(11)?.caries as string[]).sort()).toEqual(["caries-distal", "caries-mesial"]);

    setChartMode("status");
    expect(getChartMode()).toBe("status");
    __setToothStateForTest(11, caries(["caries-buccal"]));
    expect(__getStatusStateForTest(11)?.caries).toEqual(["caries-buccal"]);
    // …and the status write must NOT have touched plan
    expect((__getPlanStateForTest(11)?.caries as string[]).sort()).toEqual(["caries-distal", "caries-mesial"]);
  });

  it("the exported payloads agree with the per-chart read seams", () => {
    __setToothStateForTest(16, caries(["caries-occlusal"]));
    setChartMode("plan");
    __setToothStateForTest(16, { toothSelection: "no-tooth-after-extraction" });
    expect(getStatusChart().teeth["16"].caries).toEqual(["caries-occlusal"]);
    expect(getPlanChart().teeth["16"].toothSelection).toBe("no-tooth-after-extraction");
    expect(getStatusChart().teeth["16"].toothSelection).toBe("tooth-base");
  });
});

describe("chart core: the plan chart is cloned lazily, exactly once", () => {
  beforeEach(() => __resetChartStateForTest());

  it("entering plan mode again keeps the plan's own edits (no re-clone from status)", () => {
    __setToothStateForTest(21, caries(["caries-occlusal"]));
    setChartMode("plan");
    __setToothStateForTest(21, { toothSelection: "implant" });   // diverge
    setChartMode("status");
    __setToothStateForTest(21, caries(["caries-mesial"]));        // status moves on
    setChartMode("plan");
    // still the plan's own value — a re-clone would have overwritten it
    expect(__getPlanStateForTest(21)?.toothSelection).toBe("implant");
  });

  it("the lazy clone deep-copies: the two charts share no Set/Map/object", () => {
    __setToothStateForTest(31, caries(["caries-occlusal", "caries-mesial"]));
    setChartMode("plan");
    __setToothStateForTest(31, caries(["caries-distal"]));        // mutate the plan copy
    expect((__getStatusStateForTest(31)?.caries as string[]).sort()).toEqual(["caries-mesial", "caries-occlusal"]);
    setChartMode("status");
    __setToothStateForTest(31, caries(["caries-lingual"]));       // mutate status back
    expect(__getPlanStateForTest(31)?.caries).toEqual(["caries-distal"]);
  });
});

describe("chart core: reset returns to a blank status chart", () => {
  it("clears both charts, drops the plan and returns the mode to status", () => {
    __setToothStateForTest(41, caries(["caries-occlusal"]));
    setChartMode("plan");
    __setToothStateForTest(41, { toothSelection: "implant" });
    expect(getChartMode()).toBe("plan");

    __resetChartStateForTest();

    expect(getChartMode()).toBe("status");
    // The per-chart Maps are cleared. (getStatusChart() serializes ALL 32 teeth,
    // defaults included, so emptiness is only observable through the read seams.)
    expect(__getStatusStateForTest(41)).toBeUndefined();
    expect(__getPlanStateForTest(41)).toBeUndefined();
    // the plan is uninitialized again: a fresh entry clones the (empty) status
    __setToothStateForTest(41, caries(["caries-buccal"]));
    setChartMode("plan");
    expect(__getPlanStateForTest(41)?.caries).toEqual(["caries-buccal"]);
  });
});
