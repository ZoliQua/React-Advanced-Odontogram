// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import {
  getCaseMeta, setCaseAge, setSmokingStatus, setCigarettesPerDay,
  setDiabetesStatus, setHba1c, setToothLossPerio, setMaxRblPercent, resetCaseMeta,
  __resetChartStateForTest, __collectExportPayloadForTest, __hydrateImportedChartsForTest,
  getOdontogramSummary, getPerioClassification,
  setDiagnosisOverride, setStageOverride, setGradeOverride, setExtentOverride,
  setPerioSite,
} from "../odontogram";
import { t } from "../i18n/useI18n";

beforeEach(() => __resetChartStateForTest());

describe("case metadata object", () => {
  it("defaults are empty", () => {
    const c = getCaseMeta();
    expect(c.age).toBeNull();
    expect(c.smokingStatus).toBe("unknown");
    expect(c.diabetesStatus).toBe("unknown");
    expect(c.hba1c).toBeNull();
    expect(c.maxRblPercent).toBeNull();
    expect(c.toothLossPerio).toBeNull();
    expect(c.cigarettesPerDay).toBeNull();
  });
  it("sets and clamps numeric fields", () => {
    setCaseAge(54); expect(getCaseMeta().age).toBe(54);
    setCaseAge(999); expect(getCaseMeta().age).toBe(120);   // clamp hi
    setCaseAge(-5); expect(getCaseMeta().age).toBe(0);       // clamp lo
    setHba1c(7.8); expect(getCaseMeta().hba1c).toBe(7.8);
    setMaxRblPercent(150); expect(getCaseMeta().maxRblPercent).toBe(100);
    setToothLossPerio(40); expect(getCaseMeta().toothLossPerio).toBe(32);
    setCigarettesPerDay(12); expect(getCaseMeta().cigarettesPerDay).toBe(12);
  });
  it("non-finite numeric input is a no-op / null", () => {
    setCaseAge(54); setCaseAge(NaN); expect(getCaseMeta().age).toBe(54); // NaN ignored
  });
  it("explicit null clears a numeric field", () => {
    setCaseAge(54); setCaseAge(null); expect(getCaseMeta().age).toBeNull();
    setHba1c(7.2); setHba1c(null); expect(getCaseMeta().hba1c).toBeNull();
    setMaxRblPercent(40); setMaxRblPercent(null); expect(getCaseMeta().maxRblPercent).toBeNull();
  });
  it("validates enum fields", () => {
    setSmokingStatus("current"); expect(getCaseMeta().smokingStatus).toBe("current");
    setSmokingStatus("bogus"); expect(getCaseMeta().smokingStatus).toBe("current"); // invalid ignored
    setDiabetesStatus("present"); expect(getCaseMeta().diabetesStatus).toBe("present");
  });
  it("serializes omit-when-empty and bumps version to 2.17", () => {
    const empty = __collectExportPayloadForTest();
    expect(empty.version).toBe("2.21");
    expect(Object.prototype.hasOwnProperty.call(empty, "case")).toBe(false);
    setCaseAge(54); setSmokingStatus("current"); setMaxRblPercent(45);
    const p = __collectExportPayloadForTest();
    expect(p.case).toMatchObject({ age: 54, smokingStatus: "current", maxRblPercent: 45 });
  });
  it("roundtrips through hydrate", () => {
    setCaseAge(60); setDiabetesStatus("present"); setHba1c(7.2); setToothLossPerio(5);
    const json = JSON.parse(JSON.stringify(__collectExportPayloadForTest()));
    __resetChartStateForTest();
    expect(getCaseMeta().age).toBeNull(); // reset cleared it
    __hydrateImportedChartsForTest(json);
    expect(getCaseMeta().age).toBe(60);
    expect(getCaseMeta().diabetesStatus).toBe("present");
    expect(getCaseMeta().hba1c).toBe(7.2);
    expect(getCaseMeta().toothLossPerio).toBe(5);
  });
  it("hydrate self-heals bad values", () => {
    __hydrateImportedChartsForTest({ version: "2.18", teeth: {}, case: { age: 999, smokingStatus: "bogus", hba1c: "x" } });
    expect(getCaseMeta().age).toBe(120);
    expect(getCaseMeta().smokingStatus).toBe("unknown");
    expect(getCaseMeta().hba1c).toBeNull();
  });
  it("resetCaseMeta clears everything", () => {
    setCaseAge(50); resetCaseMeta(); expect(getCaseMeta().age).toBeNull();
  });
});

// P4a Task 2: the labelled case-context fragment appended to
// getOdontogramSummary().periodontalText.
describe("case metadata summary line", () => {
  it("empty case: periodontalText has no case-context fragment", () => {
    const before = getOdontogramSummary().periodontalText;
    expect(before).not.toContain("54");
    expect(before).not.toContain("smoker");
  });

  it("with case data set, periodontalText includes the case-context fragment", () => {
    setCaseAge(54);
    setSmokingStatus("current");
    setCigarettesPerDay(12);
    setDiabetesStatus("present");
    setHba1c(7.8);
    setMaxRblPercent(45);
    setToothLossPerio(3);
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).toContain("54");
    expect(periodontalText).toContain("12");
    expect(periodontalText).toContain("7.8");
    expect(periodontalText).toContain("45");
    expect(periodontalText).toContain("3");
  });

  it("only age set: fragment contains age, not smoking/diabetes text", () => {
    setCaseAge(30);
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).toContain("30");
  });
});

// P4b Task 4: the FINAL (override-aware) periodontal classification appended
// to periodontalText via getPerioClassification(). An untouched case (no
// perio data charted, no override on any axis) is left byte-identical to the
// pre-P4b "healthy" text — the classification fragment only appears once
// there is something to report (a non-health final diagnosis, or an explicit
// override on any axis).
describe("P4b Task 4: classification line in periodontalText", () => {
  it("untouched, healthy case: periodontalText is unchanged (no classification fragment)", () => {
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).toBe(t("toothInfo.periodontalHealthy"));
  });

  it("real perio data deriving periodontitis: periodontalText includes Dx + Stage (grade stays indeterminate, omitted)", () => {
    // Two non-adjacent present teeth with interdental CAL >= 1mm qualifies the
    // 2017 periodontitis primary case definition (mirrors T1/T2/T3's own
    // fixtures) — no case-level age/RBL/smoking/diabetes charted, so grade
    // stays "indeterminate" and must NOT appear in the fragment.
    setPerioSite(16, "MB", { pd: 3, gm: 2 }); // CAL 5 -> stage III band
    setPerioSite(36, "MB", { pd: 3, gm: 2 }); // CAL 5, non-adjacent arch
    const cls = getPerioClassification();
    expect(cls.diagnosis).toBe("periodontitis");
    expect(cls.stage).toBe("III");
    expect(cls.grade).toBe("indeterminate");
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).toContain(t("perio.class.summary.dx", { dx: t("perio.class.dx.periodontitis") }));
    expect(periodontalText).toContain(t("perio.class.summary.stage", { stage: "III" }));
    expect(periodontalText).not.toContain(t("perio.class.summary.grade", { grade: "A" }));
    expect(periodontalText).not.toContain(t("perio.class.summary.grade", { grade: "B" }));
    expect(periodontalText).not.toContain(t("perio.class.summary.grade", { grade: "C" }));
  });

  it("diagnosis override alone (no charted data) is reflected in the FINAL classification", () => {
    setDiagnosisOverride("periodontitis");
    const cls = getPerioClassification();
    expect(cls.derived.diagnosis).toBe("health"); // derived is untouched
    expect(cls.diagnosis).toBe("periodontitis"); // final reflects override
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).toContain(t("perio.class.summary.dx", { dx: t("perio.class.dx.periodontitis") }));
  });

  it("overriding diagnosis back to health (while derived would be non-health) shows the explicit health Dx, not silence", () => {
    setPerioSite(16, "MB", { pd: 3, gm: 2 });
    setPerioSite(36, "MB", { pd: 3, gm: 2 });
    expect(getPerioClassification().derived.diagnosis).toBe("periodontitis");
    setDiagnosisOverride("health");
    const cls = getPerioClassification();
    expect(cls.diagnosis).toBe("health");
    expect(cls.overridden.diagnosis).toBe(true);
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).toContain(t("perio.class.dx.health"));
  });

  it("stage/grade/extent overrides are all reflected together for a periodontitis case", () => {
    setPerioSite(16, "MB", { pd: 3, gm: 2 });
    setPerioSite(36, "MB", { pd: 3, gm: 2 });
    setStageOverride("IV");
    setGradeOverride("C");
    setExtentOverride("generalized");
    const cls = getPerioClassification();
    expect(cls.stage).toBe("IV");
    expect(cls.grade).toBe("C");
    expect(cls.extent).toBe("generalized");
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).toContain(t("perio.class.summary.stage", { stage: "IV" }));
    expect(periodontalText).toContain(t("perio.class.summary.grade", { grade: "C" }));
    expect(periodontalText).toContain(t("perio.class.extent.generalized"));
  });

  it("an explicit stage override on an otherwise-healthy case is NOT silently dropped from the summary", () => {
    // No perio data → derived diagnosis "health"; clinician overrides ONLY stage.
    // The override must surface in the summary even though the diagnosis isn't
    // periodontitis (independent per-field override model).
    setStageOverride("III");
    const cls = getPerioClassification();
    expect(cls.diagnosis).toBe("health");
    expect(cls.overridden.diagnosis).toBe(false);
    expect(cls.stage).toBe("III");
    expect(cls.overridden.stage).toBe(true);
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).toContain(t("perio.class.summary.stage", { stage: "III" }));
  });
});
