// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { buildFhirBundle } from "../fhir/toFhir";
import { buildDerivationInputFromPayload } from "../fhir/toFhirPerio";
import type { OdontogramExportPayload, Condition, Observation } from "../fhir/types";
import { getPerioClassification, __resetChartStateForTest, __hydrateImportedChartsForTest } from "../odontogram";
import { BNO10_PACK, BNO10_SYSTEM } from "../dx/packs";
import { ICD10_SYSTEM } from "../fhir/codesystems";

// SP-perio P4b Task 3: the engine's first FHIR Condition (periodontitis/
// gingivitis, ICD-10/BNO K05) with type-differentiated stage/grade/extent +
// evidence Observations. See .superpowers/sdd/2026-08-01-odontogram-p4b-
// staging-grading-condition/task-3-brief.md.

const ICD10 = "http://hl7.org/fhir/sid/icd-10";
const LOINC = "http://loinc.org";

function conditionsOf(b: ReturnType<typeof buildFhirBundle>): Condition[] {
  return (b.entry ?? [])
    .map((e) => e.resource)
    .filter((r): r is Condition => r?.resourceType === "Condition");
}

function observationsOf(b: ReturnType<typeof buildFhirBundle>): Observation[] {
  return (b.entry ?? [])
    .map((e) => e.resource)
    .filter((r): r is Observation => r?.resourceType === "Observation");
}

function icdCode(c: Condition): string | undefined {
  return c.code?.coding?.find((co) => co.system === ICD10)?.code;
}

// A base periodontitis case: two NON-adjacent, non-molar/non-incisor
// (premolar) teeth with interdental CAL >= 1 (stage II band), plus enough
// case metadata to derive a concrete (non-indeterminate) grade and to
// trigger BOTH evidence Observations (smoking set, HbA1c set — neither
// escalates the grade beyond the direct %RBL/age band, keeping this a
// clean single-driver B case).
const periodontitisPayload: OdontogramExportPayload = {
  version: "2.18",
  teeth: {
    "14": { toothSelection: "tooth-base", perio: { pd: { MB: 3 }, gm: {}, bop: [], sup: [] } },
    "25": { toothSelection: "tooth-base", perio: { pd: { MB: 3 }, gm: {}, bop: [], sup: [] } },
  },
  case: { age: 50, maxRblPercent: 20, smokingStatus: "former", diabetesStatus: "present", hba1c: 5 },
};

// Molar-incisor pattern: one incisor (11) + one molar (26), both affected,
// nothing else — extent must resolve to "molar-incisor" (carried by the extent
// stage entry; the Condition.code stays K05.3), not the percentage-based
// localized/generalized split.
const molarIncisorPayload: OdontogramExportPayload = {
  version: "2.18",
  teeth: {
    "11": { toothSelection: "tooth-base", perio: { pd: { MB: 3 }, gm: {}, bop: [], sup: [] } },
    "26": { toothSelection: "tooth-base", perio: { pd: { MB: 3 }, gm: {}, bop: [], sup: [] } },
  },
};

// Gingivitis: no interdental CAL anywhere, but a charted+bleeding buccal
// site drives whole-mouth %BOP >= 10. No case metadata -> grade also
// indeterminate, so `stage[]` should be entirely empty (no stage/grade/
// extent entries at all).
const gingivitisPayload: OdontogramExportPayload = {
  version: "2.18",
  teeth: {
    "11": { toothSelection: "tooth-base", perio: { pd: { B: 2 }, gm: {}, bop: ["B"], sup: [] } },
  },
};

// Health: nothing charted anywhere, no case metadata.
const healthPayload: OdontogramExportPayload = {
  version: "2.18",
  teeth: {},
};

describe("appendPerioCondition — periodontitis/gingivitis Condition (K05)", () => {
  it("periodontitis: ONE Condition, K05.3, stage+grade+extent entries, evidence refs", () => {
    const b = buildFhirBundle(periodontitisPayload);
    const conditions = conditionsOf(b);
    expect(conditions).toHaveLength(1);
    const c = conditions[0];
    expect(icdCode(c)).toBe("K05.3");
    expect(c.subject?.reference).toBe("urn:uuid:odontogram-subject");

    const stageEntry = c.stage?.find((s) => s.summary?.coding?.some((co) => co.code === "stage-II"));
    expect(stageEntry).toBeDefined();
    const gradeEntry = c.stage?.find((s) => s.summary?.coding?.some((co) => co.code === "grade-B"));
    expect(gradeEntry).toBeDefined();
    const extentEntry = c.stage?.find((s) => s.summary?.coding?.some((co) => co.code === "extent-localized"));
    expect(extentEntry).toBeDefined();
    // type-differentiated: each entry carries a distinct `type`
    expect(stageEntry?.type?.coding?.[0]?.code).not.toBe(gradeEntry?.type?.coding?.[0]?.code);
    expect(gradeEntry?.type?.coding?.[0]?.code).not.toBe(extentEntry?.type?.coding?.[0]?.code);

    // Evidence: smoking (LOINC 72166-2) + HbA1c (LOINC 4548-4) Observations,
    // both present (smokingStatus + hba1c are set on this payload), and both
    // referenced from Condition.evidence.
    const smokingObs = observationsOf(b).find((o) => o.code.coding?.some((co) => co.system === LOINC && co.code === "72166-2"));
    const hba1cObs = observationsOf(b).find((o) => o.code.coding?.some((co) => co.system === LOINC && co.code === "4548-4"));
    expect(smokingObs).toBeDefined();
    expect(hba1cObs).toBeDefined();
    expect(hba1cObs?.valueQuantity?.value).toBe(5);

    const evidenceRefs = (c.evidence ?? []).flatMap((e) => (e.detail ?? []).map((d) => d.reference));
    expect(evidenceRefs.length).toBeGreaterThanOrEqual(2);
    // Both evidence Observations must actually be resolvable entries in the bundle.
    const fullUrls = new Set((b.entry ?? []).map((e) => e.fullUrl).filter(Boolean));
    for (const ref of evidenceRefs) expect(fullUrls.has(ref as string)).toBe(true);
  });

  it("molar-incisor extent -> Condition.code K05.3, pattern carried by the extent entry", () => {
    const b = buildFhirBundle(molarIncisorPayload);
    const conditions = conditionsOf(b);
    expect(conditions).toHaveLength(1);
    const c = conditions[0];
    // K05.3 (chronic periodontitis). K05.2 is "Acute periodontitis" in WHO
    // ICD-10 and must NOT be used for the molar-incisor pattern.
    expect(icdCode(c)).toBe("K05.3");
    // The molar-incisor pattern is still represented, via the extent stage entry.
    const extentEntry = c.stage?.find((s) => s.summary?.coding?.some((co) => co.code === "extent-molar-incisor"));
    expect(extentEntry).toBeDefined();
  });

  it("gingivitis -> K05.1, NO stage entry (stage na), no extent entry", () => {
    const b = buildFhirBundle(gingivitisPayload);
    const conditions = conditionsOf(b);
    expect(conditions).toHaveLength(1);
    const c = conditions[0];
    expect(icdCode(c)).toBe("K05.1");
    const stageEntry = c.stage?.find((s) => s.type?.coding?.some((co) => co.code === "periodontal-stage"));
    const extentEntry = c.stage?.find((s) => s.type?.coding?.some((co) => co.code === "periodontal-extent"));
    expect(stageEntry).toBeUndefined();
    expect(extentEntry).toBeUndefined();
    // No case metadata at all -> no evidence Observations, no evidence[] refs.
    expect(observationsOf(b).some((o) => o.code.coding?.some((co) => co.code === "72166-2" || co.code === "4548-4"))).toBe(false);
    expect(c.evidence ?? []).toHaveLength(0);
  });

  it("health -> NO Condition, NO smoking/HbA1c evidence Observations", () => {
    const b = buildFhirBundle(healthPayload);
    expect(conditionsOf(b)).toHaveLength(0);
    expect(observationsOf(b).some((o) => o.code.coding?.some((co) => co.code === "72166-2" || co.code === "4548-4"))).toBe(false);
  });

  it("stageOverride reflected in the emitted Condition", () => {
    const overridden: OdontogramExportPayload = {
      ...periodontitisPayload,
      case: { ...periodontitisPayload.case, stageOverride: "IV" },
    };
    const b = buildFhirBundle(overridden);
    const c = conditionsOf(b)[0];
    expect(c.stage?.some((s) => s.summary?.coding?.some((co) => co.code === "stage-IV"))).toBe(true);
    expect(c.stage?.some((s) => s.summary?.coding?.some((co) => co.code === "stage-II"))).toBe(false);
  });

  it("determinism: buildFhirBundle on the same payload twice is byte-identical", () => {
    const b1 = buildFhirBundle(periodontitisPayload);
    const b2 = buildFhirBundle(periodontitisPayload);
    expect(JSON.stringify(b1)).toBe(JSON.stringify(b2));
  });

  it("carries the BNO-10 pack coding on the K05 Condition when a pack is active", () => {
    const b = buildFhirBundle(periodontitisPayload, { codingPack: BNO10_PACK });
    const c = conditionsOf(b)[0];
    // WHO base coding is still first and unchanged.
    expect(c.code?.coding?.[0]).toEqual({ system: ICD10_SYSTEM, code: "K05.3", display: "Chronic periodontitis" });
    // A BNO coding (same K05.3 code) is present.
    expect(c.code?.coding?.some((co) => co.system === BNO10_SYSTEM && co.code === "K05.3")).toBe(true);
  });
});

describe("buildDerivationInputFromPayload — payload adapter", () => {
  it("reduces per-tooth interdental CAL/present from a serialized payload", () => {
    const input = buildDerivationInputFromPayload(periodontitisPayload);
    const t14 = input.teeth.find((t) => t.toothNo === 14);
    const t25 = input.teeth.find((t) => t.toothNo === 25);
    expect(t14?.interdentalCal).toBe(3);
    expect(t25?.interdentalCal).toBe(3);
    expect(t14?.present).toBe(true);
    expect(input.meta.age).toBe(50);
    expect(input.meta.maxRblPercent).toBe(20);
  });

  it("tolerates malformed/empty payloads without throwing", () => {
    expect(() => buildDerivationInputFromPayload({ version: "2.18", teeth: {} })).not.toThrow();
    expect(() => buildDerivationInputFromPayload(null as unknown as OdontogramExportPayload)).not.toThrow();
  });
});

// Regression: `presentFromSelection` (the payload-side adapter) must mirror
// `isToothPresent()` in odontogram.ts EXACTLY — present = not missing
// ("none") AND not an implant. Before the fix it only excluded "none"/
// "no-tooth-after-extraction", so an implant was WRONGLY counted as present,
// diluting the extent denominator and letting the FHIR-derived
// classification disagree with the on-screen (module-state) one for the
// same case.
//
// Case: 2 non-adjacent affected premolars (14, 35 — interdental CAL 3mm,
// PD 3) driving periodontitis/stage II, plus 4 more present natural
// (unaffected) teeth, plus 2 implant teeth, with every other FDI position
// explicitly missing. Excluding implants from the denominator (correct):
// 2 affected / 6 present natural = 33.3% -> generalized. Including them
// (the bug): 2 / 8 = 25% -> localized. The two answers straddle the 30%
// localized/generalized boundary, so this test actually discriminates the
// fix from the bug.
const MISSING_TEETH = [
  18, 17, 16, 15, 12, 11, 21, 22, 24, 25, 27, 28,
  48, 47, 46, 45, 44, 42, 41, 31, 32, 34, 37, 38,
];

const implantExtentPayload: OdontogramExportPayload = {
  version: "2.18",
  teeth: {
    "14": { toothSelection: "tooth-base", perio: { pd: { MB: 3 }, gm: {}, bop: [], sup: [] } },
    "35": { toothSelection: "tooth-base", perio: { pd: { MB: 3 }, gm: {}, bop: [], sup: [] } },
    "13": { toothSelection: "tooth-base" },
    "23": { toothSelection: "tooth-base" },
    "33": { toothSelection: "tooth-base" },
    "43": { toothSelection: "tooth-base" },
    "26": { toothSelection: "implant" },
    "36": { toothSelection: "implant" },
    ...Object.fromEntries(MISSING_TEETH.map((t) => [String(t), { toothSelection: "none" }])),
  },
};

describe("presentFromSelection regression — implants excluded from the extent denominator", () => {
  it("implant teeth are NOT present in the payload adapter's derivation input", () => {
    const input = buildDerivationInputFromPayload(implantExtentPayload);
    expect(input.teeth.find((t) => t.toothNo === 26)?.present).toBe(false);
    expect(input.teeth.find((t) => t.toothNo === 36)?.present).toBe(false);
    expect(input.teeth.find((t) => t.toothNo === 14)?.present).toBe(true);
    expect(input.teeth.find((t) => t.toothNo === 13)?.present).toBe(true);
  });

  it("implants do not dilute the affected percentage across the 30% boundary (generalized, not localized)", () => {
    const b = buildFhirBundle(implantExtentPayload);
    const conditions = conditionsOf(b);
    expect(conditions).toHaveLength(1);
    const c = conditions[0];
    expect(icdCode(c)).toBe("K05.3");

    const extentEntry = c.stage?.find((s) => s.summary?.coding?.some((co) => co.code === "extent-generalized"));
    expect(extentEntry).toBeDefined();
    const localizedEntry = c.stage?.find((s) => s.summary?.coding?.some((co) => co.code === "extent-localized"));
    expect(localizedEntry).toBeUndefined();
  });

  it("equivalence: module-state classification (UI path) agrees with the FHIR-derived classification for the same case", () => {
    __resetChartStateForTest();
    try {
      __hydrateImportedChartsForTest(implantExtentPayload);
      const stateClassification = getPerioClassification();

      const b = buildFhirBundle(implantExtentPayload);
      const c = conditionsOf(b)[0];
      const extentCode = c.stage
        ?.find((s) => s.type?.coding?.some((co) => co.code === "periodontal-extent"))
        ?.summary?.coding?.[0]?.code;

      expect(stateClassification.derived.diagnosis).toBe("periodontitis");
      expect(icdCode(c)).toBe("K05.3");
      expect(extentCode).toBe(`extent-${stateClassification.derived.extent}`);
      expect(stateClassification.derived.extent).toBe("generalized");
    } finally {
      __resetChartStateForTest();
    }
  });
});
