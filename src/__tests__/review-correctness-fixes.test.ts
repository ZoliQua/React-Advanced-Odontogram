// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Review round two: the smaller correctness defects. Each block pins one, and
// each was invisible to the existing suite because the wrong answer was a
// PLAUSIBLE one — a code that is merely more specific than the data supports, a
// plan chart that differs from status by a value nobody entered, a margin of
// "0" where none was measured.
import { describe, it, expect, beforeEach } from "vitest";
import { importDiagnosisConditions } from "../fhir/importConditions";
import { importPerioObservations } from "../fhir/importPerio";
import { parseFhirBundle } from "../fhir/fromFhir";
import { deriveCariesDetail } from "../dx/derive";
import { SNOMED_SYSTEM, FDI_SYSTEM, LOCAL_SYSTEM } from "../fhir/codesystems";
import { LOINC, LOINC_SYSTEM } from "../fhir/toFhirPerio";
import {
  __resetChartStateForTest, importStatus, exportFhir, getToothDiagnoses,
  setChartMode, getStatusChart, getPlanChart, getPlanChanges, getCaseMeta,
  setSmokingStatus, setCigarettesPerDay, setDiabetesStatus, setHba1c,
  setPerioSite, PERIO_SITES, getToothPerio,
} from "../odontogram";

const EXT = "http://hl7.org/fhir/5.0/StructureDefinition/extension-Observation.component.bodySite";
const tooth = (extra: Record<string, unknown> = {}) => ({
  toothSelection: "tooth-base", caries: ["caries-occlusal"], ...extra,
});

describe("caries depth: a CARS score is not an ICDAS depth", () => {
  beforeEach(() => __resetChartStateForTest());

  // On a FILLED surface `cariesSeverity` grades a RECURRENT lesion's extent, not
  // how deep it reaches — and hydrate INFERS the representative score 3 for a
  // legacy payload's unscored caried+filled surface. Reading either as a depth
  // exported "Caries limited to enamel" from a number that never said so.
  it("a recurrent lesion with no radiographic depth stays unspecified", () => {
    const rec = tooth({ cariesSeverity: { occlusal: 3 }, fillingSurfaces: ["occlusal"], fillingSurfaceMaterials: { occlusal: "composite" } });
    expect(deriveCariesDetail(rec).depth).toBe(null);
  });

  it("a legacy payload no longer exports a depth nobody assessed", () => {
    // Pre-2.3: no explicit CARS score, so hydrate infers the placeholder 3.
    importStatus({ version: "2.2", globals: {}, teeth: { "16": tooth({
      fillingSurfaces: ["occlusal"], fillingSurfaceMaterials: { occlusal: "composite" } }) } });
    expect(getToothDiagnoses(16).map((d) => d.icd10)).toEqual(["K02"]);
  });

  it("a radiographic depth still refines a recurrent lesion", () => {
    const rec = tooth({ radiographicDepth: { occlusal: "D2" }, cariesSeverity: { occlusal: 3 }, fillingSurfaces: ["occlusal"], fillingSurfaceMaterials: { occlusal: "composite" } });
    expect(deriveCariesDetail(rec).depth).toBe("dentine");
  });

  it("a PRIMARY lesion's ICDAS severity still refines, as before", () => {
    expect(deriveCariesDetail(tooth({ cariesSeverity: { occlusal: 2 } })).depth).toBe("enamel");
    expect(deriveCariesDetail(tooth({ cariesSeverity: { occlusal: 5 } })).depth).toBe("dentine");
  });

  it("a prototype key in radiographicDepth is not a crash", () => {
    // `buildFhirBundle(payload)` is public and takes an unvalidated payload; a
    // plain-object lookup returned an inherited Object.prototype value here.
    const rec = tooth({ radiographicDepth: { occlusal: "constructor" }, cariesSeverity: { occlusal: 5 } });
    expect(() => deriveCariesDetail(rec)).not.toThrow();
    expect(deriveCariesDetail(rec).depth).toBe("dentine");   // falls through to the ICDAS severity
  });
});

describe("plan chart: the lazy clone invents nothing", () => {
  beforeEach(() => __resetChartStateForTest());

  it("a caried+filled surface left unscored stays unscored in the plan", () => {
    importStatus({ version: "2.22", globals: {}, teeth: { "16": tooth({
      fillingSurfaces: ["occlusal"], fillingSurfaceMaterials: { occlusal: "composite" } }) } });
    const statusSeverity = getStatusChart().teeth["16"].cariesSeverity ?? {};
    const statusDx = getToothDiagnoses(16).map((d) => d.icd10);

    setChartMode("plan");

    expect(getPlanChart().teeth["16"].cariesSeverity ?? {}).toEqual(statusSeverity);
    expect(getToothDiagnoses(16).map((d) => d.icd10)).toEqual(statusDx);
    expect(getPlanChanges()).toEqual([]);      // and the diff agreed all along
  });
});

describe("import: a SNOMED-only case Condition is recognised", () => {
  it("maps through the case catalog's SNOMED slots", () => {
    const r = importDiagnosisConditions(
      [{ resource: { resourceType: "Condition", code: { coding: [{ system: SNOMED_SYSTEM, code: "81256000" }] } } }],
      {},
    );
    expect(r.caseConditions).toEqual({ toothPositionAnomaly: "unspecified" });
  });
});

describe("perio import: a foreign panel is read, not discarded", () => {
  const panel = (component: unknown[], extra: Record<string, unknown> = {}) => ({
    resource: {
      resourceType: "Observation", code: { coding: [{ system: LOINC_SYSTEM, code: LOINC.panel.code }] },
      bodySite: { coding: [{ system: FDI_SYSTEM, code: "11" }] }, component, ...extra,
    },
  });
  const comp = (code: string, site: string, value: number) => ({
    code: { coding: [{ system: LOINC_SYSTEM, code }] },
    extension: [{ url: EXT, valueCodeableConcept: { coding: [{ system: LOCAL_SYSTEM, code: `perio-site:${site}` }] } }],
    valueQuantity: { value },
  });

  it("a half-millimetre probing depth is rounded, not dropped with its whole site", () => {
    // `clampPerio` rejects a non-integer with null, which un-charts the site and
    // takes its GM and BOP with it (the no-orphan rule).
    const teeth: Record<string, unknown> = {};
    importPerioObservations([panel([comp(LOINC.pd.code, "MB", 3.5)])], teeth as never);
    expect((teeth["11"] as { perio?: { pd?: Record<string, number> } })?.perio?.pd).toEqual({ MB: 4 });
  });

  it("several panels for one tooth merge instead of overwriting each other", () => {
    const teeth: Record<string, unknown> = {};
    importPerioObservations([
      panel([comp(LOINC.pd.code, "MB", 5)]),
      panel([comp(LOINC.pd.code, "DB", 6)]),
    ], teeth as never);
    expect((teeth["11"] as { perio?: { pd?: Record<string, number> } })?.perio?.pd).toEqual({ MB: 5, DB: 6 });
  });
});

describe("perio round trip: what was not measured stays unmeasured", () => {
  beforeEach(() => __resetChartStateForTest());

  it("a blank gingival margin does not come back as a measured 0", () => {
    importStatus({ version: "2.22", globals: {}, teeth: { "11": { toothSelection: "tooth-base" } } });
    for (const s of PERIO_SITES) setPerioSite(11, s, { pd: 4 });      // probing depth only
    expect(getToothPerio(11).gm).toEqual({});

    const parsed = parseFhirBundle(exportFhir()) as { teeth: Record<string, { perio?: { gm?: unknown } }> };
    expect(parsed.teeth["11"]?.perio?.gm).toBeUndefined();
  });

  it("a real margin still round-trips, in both directions", () => {
    importStatus({ version: "2.22", globals: {}, teeth: { "11": { toothSelection: "tooth-base" } } });
    setPerioSite(11, "MB", { pd: 4, gm: 2 });      // recession
    setPerioSite(11, "B", { pd: 4, gm: -1 });      // pseudopocket
    const parsed = parseFhirBundle(exportFhir()) as { teeth: Record<string, { perio?: { gm?: Record<string, number> } }> };
    expect(parsed.teeth["11"]?.perio?.gm).toEqual({ MB: 2, B: -1 });
  });
});

describe("case risk factors survive the FHIR round trip", () => {
  beforeEach(() => __resetChartStateForTest());

  function reimport() {
    const parsed = parseFhirBundle(exportFhir());
    __resetChartStateForTest();
    importStatus(parsed);
    return getCaseMeta();
  }

  it("a periodontally HEALTHY patient keeps them", () => {
    // They used to be emitted only as `evidence` of a perio Condition, so a
    // healthy patient's risk factors never reached the bundle at all.
    importStatus({ version: "2.22", globals: {}, teeth: { "11": { toothSelection: "tooth-base" } } });
    setSmokingStatus("current"); setCigarettesPerDay(15);
    setDiabetesStatus("present"); setHba1c(7.8);

    const meta = reimport();
    expect(meta.smokingStatus).toBe("current");
    expect(meta.cigarettesPerDay).toBe(15);
    expect(meta.diabetesStatus).toBe("present");
    expect(meta.hba1c).toBe(7.8);
  });

  it("diabetes status and the daily count round-trip alongside a diagnosis too", () => {
    importStatus({ version: "2.22", globals: {}, teeth: Object.fromEntries(
      [11, 16, 21, 26, 31, 36, 41, 46].map((n) => [String(n), { toothSelection: "tooth-base" }])) });
    for (const n of [11, 16, 21, 26, 31, 36, 41, 46]) {
      for (const s of PERIO_SITES) setPerioSite(n, s, { pd: 7, gm: 3, bop: true });   // clearly diseased
    }
    setSmokingStatus("former"); setCigarettesPerDay(5); setDiabetesStatus("none");

    const meta = reimport();
    expect(meta.smokingStatus).toBe("former");
    expect(meta.cigarettesPerDay).toBe(5);
    expect(meta.diabetesStatus).toBe("none");
  });

  it("an uncharted risk factor stays absent", () => {
    importStatus({ version: "2.22", globals: {}, teeth: { "11": { toothSelection: "tooth-base" } } });
    const meta = reimport();
    expect(meta.smokingStatus).toBe("unknown");
    expect(meta.diabetesStatus).toBe("unknown");
    expect(meta.cigarettesPerDay).toBe(null);
  });
});
