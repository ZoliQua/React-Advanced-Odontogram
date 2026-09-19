// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import {
  registerPlugins,
  importStatus,
  setChartMode,
  getPluginState,
  __resetChartStateForTest,
} from "../odontogram";
import type { OdontogramPlugin } from "../plugin";

// Regression: the status and plan charts are cloned via serializeState ->
// hydrateState, and serializeState passes `customStates` by reference. An
// object-valued plugin state used to be SHARED between the two charts, so
// mutating it in one silently mutated the other, breaking dual-state isolation.

const plugin: OdontogramPlugin = {
  id: "p1",
  label: { en: "P1" },
  layer: "overlay",
  renderSvg: () => null,
};

describe("plugin customStates: status/plan isolation", () => {
  beforeEach(() => {
    __resetChartStateForTest();
    registerPlugins([plugin]);
  });

  it("deep-copies an object-valued customState so the charts never share it", () => {
    importStatus({
      version: "2.20",
      globals: {},
      teeth: { "11": { toothSelection: "tooth-base", customStates: { p1: { n: 1 } } } },
    });

    setChartMode("status");
    const statusObj = getPluginState(11, "p1") as { n: number };
    expect(statusObj).toEqual({ n: 1 });

    setChartMode("plan"); // lazily clones status -> plan
    const planObj = getPluginState(11, "p1") as { n: number };
    expect(planObj).toEqual({ n: 1 });
    expect(planObj).not.toBe(statusObj); // a distinct object, not a shared reference

    planObj.n = 999; // mutate the plan copy
    setChartMode("status");
    expect((getPluginState(11, "p1") as { n: number }).n).toBe(1); // status is untouched
  });
});
