// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import {
  getPerioClassification,
  setDiagnosisOverride, setStageOverride, setGradeOverride, setExtentOverride,
  getCaseMeta, resetCaseMeta,
  __resetChartStateForTest, __collectExportPayloadForTest, __hydrateImportedChartsForTest,
} from "../odontogram";

beforeEach(() => __resetChartStateForTest());

describe("P4b Task 2: per-field override + final classification", () => {
  it("defaults: all overrides null, final == derived, overridden all false", () => {
    const c = getPerioClassification();
    expect(c.overridden).toEqual({ diagnosis: false, stage: false, grade: false, extent: false });
    expect(c.diagnosis).toBe(c.derived.diagnosis);
    expect(c.stage).toBe(c.derived.stage);
    expect(c.grade).toBe(c.derived.grade);
    expect(c.extent).toBe(c.derived.extent);
  });

  it("diagnosis override wins over derived, and can be cleared", () => {
    setDiagnosisOverride("periodontitis");
    let c = getPerioClassification();
    expect(c.diagnosis).toBe("periodontitis");
    expect(c.overridden.diagnosis).toBe(true);
    setDiagnosisOverride(null);
    c = getPerioClassification();
    expect(c.diagnosis).toBe(c.derived.diagnosis);
    expect(c.overridden.diagnosis).toBe(false);
  });

  it("stage override wins over derived, and can be cleared", () => {
    setStageOverride("III");
    let c = getPerioClassification();
    expect(c.stage).toBe("III");
    expect(c.overridden.stage).toBe(true);
    setStageOverride(null);
    c = getPerioClassification();
    expect(c.stage).toBe(c.derived.stage);
    expect(c.overridden.stage).toBe(false);
  });

  it("grade override wins over derived, and can be cleared", () => {
    setGradeOverride("C");
    let c = getPerioClassification();
    expect(c.grade).toBe("C");
    expect(c.overridden.grade).toBe(true);
    setGradeOverride(null);
    c = getPerioClassification();
    expect(c.grade).toBe(c.derived.grade);
    expect(c.overridden.grade).toBe(false);
  });

  it("extent override wins over derived, and can be cleared", () => {
    setExtentOverride("generalized");
    let c = getPerioClassification();
    expect(c.extent).toBe("generalized");
    expect(c.overridden.extent).toBe(true);
    setExtentOverride(null);
    c = getPerioClassification();
    expect(c.extent).toBe(c.derived.extent);
    expect(c.overridden.extent).toBe(false);
  });

  it("invalid override values are rejected (no-op)", () => {
    setDiagnosisOverride("bogus");
    expect(getCaseMeta().diagnosisOverride).toBeNull();
    setStageOverride("V");
    expect(getCaseMeta().stageOverride).toBeNull();
    setGradeOverride("D");
    expect(getCaseMeta().gradeOverride).toBeNull();
    setExtentOverride("everywhere");
    expect(getCaseMeta().extentOverride).toBeNull();
  });

  it("valid override values are accepted for every axis enum", () => {
    for (const v of ["health", "gingivitis", "periodontitis"]) { setDiagnosisOverride(v); expect(getCaseMeta().diagnosisOverride).toBe(v); }
    for (const v of ["I", "II", "III", "IV"]) { setStageOverride(v); expect(getCaseMeta().stageOverride).toBe(v); }
    for (const v of ["A", "B", "C"]) { setGradeOverride(v); expect(getCaseMeta().gradeOverride).toBe(v); }
    for (const v of ["localized", "generalized", "molar-incisor"]) { setExtentOverride(v); expect(getCaseMeta().extentOverride).toBe(v); }
  });

  it("serialize omits null overrides, includes set overrides", () => {
    const empty = __collectExportPayloadForTest();
    if (empty.case) {
      expect(Object.prototype.hasOwnProperty.call(empty.case, "diagnosisOverride")).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(empty.case, "stageOverride")).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(empty.case, "gradeOverride")).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(empty.case, "extentOverride")).toBe(false);
    }
    setStageOverride("II");
    setGradeOverride("B");
    const p = __collectExportPayloadForTest();
    expect(p.case).toMatchObject({ stageOverride: "II", gradeOverride: "B" });
    expect(Object.prototype.hasOwnProperty.call(p.case, "diagnosisOverride")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(p.case, "extentOverride")).toBe(false);
  });

  it("roundtrips overrides through export/hydrate", () => {
    setDiagnosisOverride("periodontitis");
    setStageOverride("IV");
    setGradeOverride("C");
    setExtentOverride("molar-incisor");
    const json = JSON.parse(JSON.stringify(__collectExportPayloadForTest()));
    __resetChartStateForTest();
    expect(getCaseMeta().diagnosisOverride).toBeNull();
    __hydrateImportedChartsForTest(json);
    expect(getCaseMeta().diagnosisOverride).toBe("periodontitis");
    expect(getCaseMeta().stageOverride).toBe("IV");
    expect(getCaseMeta().gradeOverride).toBe("C");
    expect(getCaseMeta().extentOverride).toBe("molar-incisor");
    const c = getPerioClassification();
    expect(c.diagnosis).toBe("periodontitis");
    expect(c.stage).toBe("IV");
    expect(c.grade).toBe("C");
    expect(c.extent).toBe("molar-incisor");
  });

  it("hydrate self-heals bad override values to null", () => {
    __hydrateImportedChartsForTest({
      version: "2.18", teeth: {},
      case: { diagnosisOverride: "bogus", stageOverride: "V", gradeOverride: "Z", extentOverride: "nowhere" },
    });
    expect(getCaseMeta().diagnosisOverride).toBeNull();
    expect(getCaseMeta().stageOverride).toBeNull();
    expect(getCaseMeta().gradeOverride).toBeNull();
    expect(getCaseMeta().extentOverride).toBeNull();
  });

  it("resetCaseMeta clears all overrides", () => {
    setDiagnosisOverride("health");
    setStageOverride("I");
    setGradeOverride("A");
    setExtentOverride("localized");
    resetCaseMeta();
    const c = getCaseMeta();
    expect(c.diagnosisOverride).toBeNull();
    expect(c.stageOverride).toBeNull();
    expect(c.gradeOverride).toBeNull();
    expect(c.extentOverride).toBeNull();
  });

  it("payload version bumped to 2.18", () => {
    const p = __collectExportPayloadForTest();
    expect(p.version).toBe("2.21");
  });
});
