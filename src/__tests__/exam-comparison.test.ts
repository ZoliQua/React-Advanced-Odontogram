// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// `compareExams()` — the same mouth charted on two different days, which is the
// question a recall appointment asks. `getPlanChanges()` answers a different
// one (the two charts of ONE exam), and until now nothing answered this one: a
// host keeping a timeline of exports held both payloads and could only diff
// them by hand.
import { describe, it, expect, beforeEach } from "vitest";
import {
  compareExams, __resetChartStateForTest, importStatus, getStatusChart, setChartMode,
} from "../odontogram";
import { comparePerioExams, PROGRESSION_MM } from "../state/examCompare";

type Payload = Record<string, unknown>;

const exam = (teeth: Record<string, unknown>, extra: Record<string, unknown> = {}): Payload =>
  ({ version: "2.22", globals: {}, teeth, ...extra });

/** Six charted sites on one tooth, at a uniform depth. */
const perioTooth = (pd: number, gm = 0, bop: string[] = []) => ({
  toothSelection: "tooth-base",
  perio: {
    pd: { MB: pd, B: pd, DB: pd, ML: pd, L: pd, DL: pd },
    gm: { MB: gm, B: gm, DB: gm, ML: gm, L: gm, DL: gm },
    bop, sup: [],
  },
});

describe("compareExams: nothing moved", () => {
  it("two identical exams compare as unchanged", () => {
    const e = exam({ "11": perioTooth(3), "16": { toothSelection: "tooth-base", caries: ["caries-occlusal"] } });
    const c = compareExams(e, structuredClone(e));
    expect(c.changes).toEqual([]);
    expect(c.perio.changed).toEqual([]);
    expect(c.perio.attachmentLoss).toEqual([]);
    expect(c.classification.from).toEqual(c.classification.to);
  });
});

describe("compareExams: what the clinician changed", () => {
  it("reports an axis change with the same labels the plan diff uses", () => {
    const before = exam({ "16": { toothSelection: "tooth-base" } });
    const after = exam({ "16": { toothSelection: "no-tooth-after-extraction" } });
    const { changes } = compareExams(before, after);
    const presence = changes.filter((ch) => ch.toothNo === 16);
    expect(presence.length).toBeGreaterThan(0);
    expect(presence[0].from).not.toBe(presence[0].to);
    expect(typeof presence[0].from).toBe("string");
  });

  it("a tooth missing from one exam compares against the clinical default, not a crash", () => {
    const { changes } = compareExams(exam({}), exam({ "21": { toothSelection: "implant" } }));
    expect(changes.some((ch) => ch.toothNo === 21)).toBe(true);
  });
});

describe("compareExams: the periodontal numbers", () => {
  it("a pocket that deepened by 2 mm is attachment loss, and shows both readings", () => {
    const c = compareExams(exam({ "16": perioTooth(4) }), exam({ "16": perioTooth(6) }));
    expect(c.perio.deepened).toHaveLength(6);
    expect(c.perio.attachmentLoss).toHaveLength(6);
    const mb = c.perio.attachmentLoss.find((d) => d.site === "MB")!;
    expect(mb).toMatchObject({ toothNo: 16, pdFrom: 4, pdTo: 6, calFrom: 4, calTo: 6 });
    expect(c.perio.from.maxPd).toBe(4);
    expect(c.perio.to.maxPd).toBe(6);
  });

  it("recession counts as attachment loss even when the pocket did not deepen", () => {
    // pd unchanged at 3, margin receded 3 mm: CAL 3 -> 6.
    const c = compareExams(exam({ "16": perioTooth(3, 0) }), exam({ "16": perioTooth(3, 3) }));
    expect(c.perio.deepened).toEqual([]);
    expect(c.perio.attachmentLoss).toHaveLength(6);
    expect(c.perio.attachmentLoss[0]).toMatchObject({ calFrom: 3, calTo: 6 });
  });

  it("treatment that worked shows up as attachment gain", () => {
    const c = compareExams(exam({ "16": perioTooth(7) }), exam({ "16": perioTooth(4) }));
    expect(c.perio.attachmentGain).toHaveLength(6);
    expect(c.perio.attachmentLoss).toEqual([]);
  });

  it("a 1 mm move is reported but is NOT called progression — that is measurement noise", () => {
    const c = compareExams(exam({ "16": perioTooth(4) }), exam({ "16": perioTooth(5) }));
    expect(PROGRESSION_MM).toBe(2);
    expect(c.perio.changed).toHaveLength(6);
    expect(c.perio.attachmentLoss).toEqual([]);
    expect(c.perio.deepened).toEqual([]);
  });

  it("sites charted in only one exam are reported, never counted as progression", () => {
    const before = exam({ "16": { toothSelection: "tooth-base", perio: { pd: { MB: 3 }, gm: {}, bop: [], sup: [] } } });
    const after = exam({ "16": { toothSelection: "tooth-base", perio: { pd: { MB: 3, DB: 9 }, gm: {}, bop: [], sup: [] } } });
    const c = compareExams(before, after);
    expect(c.perio.newlyCharted).toBe(1);
    expect(c.perio.noLongerCharted).toBe(0);
    expect(c.perio.changed).toHaveLength(1);
    expect(c.perio.changed[0]).toMatchObject({ site: "DB", pdFrom: null, pdTo: 9 });
    expect(c.perio.attachmentLoss).toEqual([]);
  });

  it("the whole-mouth figures follow each exam", () => {
    const c = compareExams(
      exam({ "16": perioTooth(3, 0, ["MB", "B"]) }),
      exam({ "16": perioTooth(5, 0, ["MB", "B", "DB", "ML", "L", "DL"]) }),
    );
    expect(c.perio.from).toMatchObject({ chartedSites: 6, bleedingSites: 2, bopPercent: 33.3, maxPd: 3, worstCal: 3 });
    expect(c.perio.to).toMatchObject({ chartedSites: 6, bleedingSites: 6, bopPercent: 100, maxPd: 5, worstCal: 5 });
  });
});

describe("compareExams: the 2017 classification of each exam", () => {
  it("a mouth that got worse moves diagnosis or stage", () => {
    const healthy = exam(Object.fromEntries([11, 16, 21, 26, 31, 36, 41, 46].map((n) => [String(n), perioTooth(2, -2)])));
    const diseased = exam(Object.fromEntries([11, 16, 21, 26, 31, 36, 41, 46].map((n) => [String(n), perioTooth(7, 3, ["MB", "B", "DB", "ML", "L", "DL"])])));
    const c = compareExams(healthy, diseased);
    expect(c.classification.from.diagnosis).toBe("health");
    expect(c.classification.to.diagnosis).not.toBe("health");
  });

  it("the clinician's own override is what gets compared, not just the derivation", () => {
    const teeth = Object.fromEntries([11, 16, 21, 26].map((n) => [String(n), perioTooth(2, -2)]));
    const c = compareExams(exam(teeth), exam(teeth, { case: { diagnosisOverride: "gingivitis" } }));
    expect(c.classification.from.diagnosis).toBe("health");
    expect(c.classification.to.diagnosis).toBe("gingivitis");
  });
});

describe("compareExams: robustness and purity", () => {
  beforeEach(() => __resetChartStateForTest());

  it("never throws on an empty or malformed payload", () => {
    for (const bad of [null, undefined, {}, { teeth: null }, { teeth: { "16": null } }, "nonsense", 42]) {
      expect(() => compareExams(bad, exam({ "16": perioTooth(4) })), String(bad)).not.toThrow();
      expect(() => compareExams(exam({ "16": perioTooth(4) }), bad), String(bad)).not.toThrow();
    }
  });

  it("leaves the live chart alone — it can be called mid-session", () => {
    importStatus(exam({ "16": { toothSelection: "implant" } }));
    setChartMode("plan");
    const snapshot = JSON.stringify(getStatusChart());
    compareExams(exam({ "16": perioTooth(4) }), exam({ "16": perioTooth(9) }));
    expect(JSON.stringify(getStatusChart())).toBe(snapshot);
  });

  it("the pure periodontal half can be used on its own", () => {
    const c = comparePerioExams(exam({ "16": perioTooth(4) }), exam({ "16": perioTooth(6) }));
    expect(c.attachmentLoss).toHaveLength(6);
  });
});
