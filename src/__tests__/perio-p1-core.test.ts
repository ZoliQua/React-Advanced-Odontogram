// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio P1 Task 1: the 6-site periodontal data core (pd/gm/bop/sup per
// tooth), derived CAL (pd + signed gm), payload version 2.12, and the public
// API (setPerioSite / getToothPerio / getToothCal / getPerioSummary /
// getPerioChart). Pure data-model tests — NO UI, NO FHIR, NO chart render
// (those are later tasks). Uses the same module-state test seams as
// r2a-dual-state.test.ts / r2b-plan-diff.test.ts (__setToothStateForTest
// operates on the ACTIVE chart; __resetChartStateForTest clears both charts +
// planInitialized + mode before every test so module state never leaks).
import { describe, it, expect, beforeEach } from "vitest";
import {
  PERIO_SITES,
  setPerioSite,
  getToothPerio,
  getToothCal,
  getPerioSummary,
  getPerioChart,
  setChartMode,
  getPlanChanges,
  __setToothStateForTest,
  __resetChartStateForTest,
  __collectExportPayloadForTest,
  __hydrateImportedChartsForTest,
} from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

beforeEach(() => {
  __resetChartStateForTest();
  setI18nLanguage("en");
});

describe("PERIO_SITES canonical order", () => {
  it("is the exact 6-site buccal-then-lingual order", () => {
    expect(PERIO_SITES).toEqual(["MB", "B", "DB", "ML", "L", "DL"]);
  });
});

describe("CAL derivation (pd + signed gm)", () => {
  it("pd=6, gm=+2 (recession) -> CAL 8", () => {
    __setToothStateForTest(11, {});
    setPerioSite(11, "B", { pd: 6, gm: 2 });
    expect(getToothCal(11).get("B")).toBe(8);
  });

  it("pd=6, gm=-3 (coronal/pseudopocket) -> CAL 3", () => {
    __setToothStateForTest(11, {});
    setPerioSite(11, "L", { pd: 6, gm: -3 });
    expect(getToothCal(11).get("L")).toBe(3);
  });

  it("pd=4, gm unset -> CAL 4 (gm defaults 0)", () => {
    __setToothStateForTest(11, {});
    setPerioSite(11, "MB", { pd: 4 });
    expect(getToothCal(11).get("MB")).toBe(4);
  });

  it("getToothCal for a tooth with no perio at all returns an empty Map", () => {
    expect(getToothCal(99 as number)).toEqual(new Map());
    __setToothStateForTest(12, {});
    expect(getToothCal(12)).toEqual(new Map());
  });
});

describe("not-charted vs 0: absence means unset, not zero", () => {
  it("an un-charted site is absent from getToothCal and not counted as charted", () => {
    __setToothStateForTest(31, {});
    expect(getToothCal(31).has("MB")).toBe(false);
    expect(getPerioSummary().chartedSites).toBe(0);

    setPerioSite(31, "MB", { pd: 5 });
    expect(getToothCal(31).get("MB")).toBe(5);
    expect(getPerioSummary().chartedSites).toBe(1);
  });

  it("setting pd then clearing it (pd=null) removes gm/bop/sup for that site too (no orphans)", () => {
    __setToothStateForTest(31, {});
    setPerioSite(31, "MB", { pd: 5, gm: 3, bop: true, sup: true });
    expect(getToothPerio(31)).toEqual({
      pd: { MB: 5 }, gm: { MB: 3 }, bop: ["MB"], sup: ["MB"],
    });

    setPerioSite(31, "MB", { pd: null });
    expect(getToothPerio(31)).toEqual({ pd: {}, gm: {}, bop: [], sup: [] });
    expect(getToothCal(31).has("MB")).toBe(false);
    expect(getPerioSummary().chartedSites).toBe(0);
  });
});

describe("validation / clamping", () => {
  it("pd=0 un-charts the site", () => {
    __setToothStateForTest(41, {});
    setPerioSite(41, "DB", { pd: 9 });
    expect(getToothPerio(41).pd.DB).toBe(9);
    setPerioSite(41, "DB", { pd: 0 });
    expect(getToothPerio(41).pd.DB).toBeUndefined();
  });

  it("pd=null un-charts the site", () => {
    __setToothStateForTest(41, {});
    setPerioSite(41, "DB", { pd: 9 });
    setPerioSite(41, "DB", { pd: null });
    expect(getToothPerio(41).pd.DB).toBeUndefined();
  });

  it("pd=20 clamps to 15", () => {
    __setToothStateForTest(41, {});
    setPerioSite(41, "DB", { pd: 20 });
    expect(getToothPerio(41).pd.DB).toBe(15);
  });

  it("gm=-50 clamps to -10", () => {
    __setToothStateForTest(41, {});
    setPerioSite(41, "DB", { pd: 5 });
    setPerioSite(41, "DB", { gm: -50 });
    expect(getToothPerio(41).gm.DB).toBe(-10);
  });

  it("gm=+50 clamps to +20", () => {
    __setToothStateForTest(41, {});
    setPerioSite(41, "DB", { pd: 5 });
    setPerioSite(41, "DB", { gm: 50 });
    expect(getToothPerio(41).gm.DB).toBe(20);
  });

  it("non-integer pd is rejected outright (state unchanged, no partial write)", () => {
    __setToothStateForTest(41, {});
    setPerioSite(41, "ML", { pd: 6.5 });
    expect(getToothPerio(41).pd.ML).toBeUndefined();
    expect(getPerioSummary().chartedSites).toBe(0);
  });

  it("gm/bop/sup are ignored (no-op) on a site that has never been charted", () => {
    __setToothStateForTest(41, {});
    setPerioSite(41, "L", { gm: 4, bop: true, sup: true });
    expect(getToothPerio(41)).toEqual({ pd: {}, gm: {}, bop: [], sup: [] });
  });

  it("an unknown site key is a silent no-op", () => {
    __setToothStateForTest(41, {});
    setPerioSite(41, "XX", { pd: 5 });
    expect(getToothPerio(41)).toEqual({ pd: {}, gm: {}, bop: [], sup: [] });
  });
});

describe("%BOP derivation", () => {
  it("3 charted sites, 1 in bop -> 33.3%", () => {
    __setToothStateForTest(17, {});
    setPerioSite(17, "MB", { pd: 3, bop: true });
    setPerioSite(17, "B", { pd: 3 });
    setPerioSite(17, "DB", { pd: 3 });

    const summary = getPerioSummary();
    expect(summary.chartedSites).toBe(3);
    expect(summary.bleedingSites).toBe(1);
    expect(summary.bopPercent).toBeCloseTo(33.3, 1);
  });

  it("bop set on an un-charted site is ignored, so bopPercent can never exceed 100", () => {
    __setToothStateForTest(17, {});
    setPerioSite(17, "MB", { pd: 3, bop: true });
    setPerioSite(17, "ML", { bop: true }); // never charted -> must be ignored

    const summary = getPerioSummary();
    expect(summary.chartedSites).toBe(1);
    expect(summary.bleedingSites).toBe(1);
    expect(summary.bopPercent).toBe(100);
    expect(summary.bopPercent).toBeLessThanOrEqual(100);
  });

  it("getPerioSummary with nothing charted returns zeros/nulls, never NaN", () => {
    const summary = getPerioSummary();
    expect(summary).toEqual({
      chartedSites: 0, bleedingSites: 0, bopPercent: 0,
      worstCal: null, worstCalTooth: null, maxPd: null,
      avgPd: null, avgCal: null, maxFurcation: null, plaquePercent: 0,
      // SP-perio PG-D Task 5 additions:
      piScore: null, giScore: null, kgDeficientTeeth: 0,
      gtDistribution: { thin: 0, medium: 0, thick: 0 },
      millerDistribution: { i: 0, ii: 0, iii: 0, iv: 0 },
      // SP-perio PG-E Task 2 stopgap (Task 3 fills in the real computation):
      mpiScore: null, mbiScore: null,
    });
  });

  it("worstCal / worstCalTooth / maxPd track the deepest across the whole mouth", () => {
    __setToothStateForTest(11, {});
    __setToothStateForTest(46, {});
    setPerioSite(11, "B", { pd: 4 });
    setPerioSite(46, "DL", { pd: 6, gm: 3 }); // CAL 9, the worst
    setPerioSite(46, "ML", { pd: 9 }); // maxPd 9, CAL 9 too (tie keeps first-seen worst)

    const summary = getPerioSummary();
    expect(summary.maxPd).toBe(9);
    expect(summary.worstCal).toBe(9);
    expect(summary.worstCalTooth).toBe(46);
  });
});

describe("getPerioChart()", () => {
  it("includes only teeth with at least one charted site, keyed by tooth number", () => {
    __setToothStateForTest(21, {});
    __setToothStateForTest(22, {});
    setPerioSite(21, "MB", { pd: 4 });

    const chart = getPerioChart();
    expect(Object.keys(chart)).toEqual(["21"]);
    expect(chart["21"]).toEqual({ pd: { MB: 4 }, gm: {}, bop: [], sup: [] });
  });

  it("reflects the ACTIVE chart (status vs plan)", () => {
    __setToothStateForTest(21, {});
    setPerioSite(21, "MB", { pd: 4 });
    setChartMode("plan");
    setPerioSite(21, "B", { pd: 5 });

    expect(Object.keys(getPerioChart())).toEqual(["21"]);
    expect(getPerioChart()["21"].pd).toEqual({ MB: 4, B: 5 });

    setChartMode("status");
    expect(getPerioChart()["21"].pd).toEqual({ MB: 4 });
  });
});

describe("payload round-trip (version 2.12)", () => {
  it("set perio -> serialize -> version 2.12, perio present only where charted", () => {
    __setToothStateForTest(16, {});
    __setToothStateForTest(11, {}); // no perio -> must stay omitted
    setPerioSite(16, "MB", { pd: 5, gm: 1, bop: true });
    setPerioSite(16, "B", { pd: 6 });

    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    expect(payload.teeth["16"].perio).toEqual({
      pd: { MB: 5, B: 6 }, gm: { MB: 1 }, bop: ["MB"], sup: [],
    });
    expect(payload.teeth["11"].perio).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(payload.teeth["11"], "perio")).toBe(false);
  });

  it("hydrate restores identical maps/sets, as fresh independent instances", () => {
    __setToothStateForTest(16, {});
    setPerioSite(16, "MB", { pd: 5, gm: 1, bop: true });
    const payload = __collectExportPayloadForTest();

    // Real JSON round-trip (network/file transfer), not just object reuse.
    const jsonRoundTrip = JSON.parse(JSON.stringify(payload));

    __resetChartStateForTest();
    __hydrateImportedChartsForTest(jsonRoundTrip);
    expect(getToothPerio(16)).toEqual({
      pd: { MB: 5 }, gm: { MB: 1 }, bop: ["MB"], sup: [],
    });
    // A tooth never charted hydrates to the empty-but-defined perio shape.
    expect(getToothPerio(11)).toEqual({ pd: {}, gm: {}, bop: [], sup: [] });

    // Independence: mutating the live re-hydrated state must never reach back
    // into the captured snapshot (proves hydrateState built fresh Map/Set
    // instances, not references into the raw parsed payload).
    setPerioSite(16, "MB", { pd: 9 });
    expect(getToothPerio(16).pd.MB).toBe(9);
    expect(payload.teeth["16"].perio!.pd.MB).toBe(5);
    expect(jsonRoundTrip.teeth["16"].perio.pd.MB).toBe(5);
  });
});

describe("legacy import (payload 2.11, no perio field)", () => {
  it("hydrates to empty perio without throwing", () => {
    const legacyPayload = {
      version: "2.11",
      globals: {},
      teeth: { 16: { toothSelection: "tooth-base" } },
    };
    expect(() => __hydrateImportedChartsForTest(legacyPayload)).not.toThrow();
    expect(getToothPerio(16)).toEqual({ pd: {}, gm: {}, bop: [], sup: [] });
  });

  it("a malformed/foreign perio payload (orphaned gm, out-of-range pd, unknown site) never throws and self-heals", () => {
    const craftedPayload = {
      version: "2.12",
      globals: {},
      teeth: {
        16: {
          toothSelection: "tooth-base",
          perio: {
            pd: { MB: 30, XX: 5, DB: 3.5 }, // 30 clamps to 15, XX is unknown, DB non-integer is dropped
            gm: { MB: 2, B: 4 }, // B has no charted pd -> orphan, must be dropped
            bop: ["MB", "B"], // B not charted -> dropped
            sup: ["MB"],
          },
        },
      },
    };
    expect(() => __hydrateImportedChartsForTest(craftedPayload)).not.toThrow();
    expect(getToothPerio(16)).toEqual({
      pd: { MB: 15 }, gm: { MB: 2 }, bop: ["MB"], sup: ["MB"],
    });
  });
});

describe("dual-state isolation", () => {
  it("set perio in status, enter plan (clone), edit plan perio -> status unchanged (independent Maps/Sets)", () => {
    __setToothStateForTest(24, {});
    setPerioSite(24, "MB", { pd: 4 });

    setChartMode("plan"); // first entry -> deep clone of status into plan
    setPerioSite(24, "MB", { pd: 9, bop: true }); // edit PLAN only
    setPerioSite(24, "DL", { pd: 3 });

    setChartMode("status");
    expect(getToothPerio(24)).toEqual({ pd: { MB: 4 }, gm: {}, bop: [], sup: [] });

    setChartMode("plan");
    expect(getToothPerio(24)).toEqual({
      pd: { MB: 9, DL: 3 }, gm: {}, bop: ["MB"], sup: [],
    });
  });
});

describe("DIFF_AXES perio entry (status -> plan diff, R2-B integration)", () => {
  it("a tooth's perio change narrates as ONE summary entry, not per-site", () => {
    __setToothStateForTest(14, {});
    setChartMode("plan");
    setPerioSite(14, "MB", { pd: 5, bop: true });
    setPerioSite(14, "B", { pd: 6 });
    setPerioSite(14, "DB", { pd: 4 });
    setChartMode("status");

    const changes = getPlanChanges().filter((c) => c.toothNo === 14 && c.axis === "perio");
    expect(changes.length).toBe(1);
    expect(changes[0].from).toBe(t("planChange.none"));
    expect(changes[0].to).not.toBe(t("planChange.none"));
  });

  it("no perio change between status and plan -> no perio diff entry", () => {
    __setToothStateForTest(15, {});
    setPerioSite(15, "MB", { pd: 4 });
    setChartMode("plan");
    setChartMode("status");
    expect(getPlanChanges().some((c) => c.toothNo === 15 && c.axis === "perio")).toBe(false);
  });
});
