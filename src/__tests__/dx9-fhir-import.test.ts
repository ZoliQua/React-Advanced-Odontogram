// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// DX-9 — FHIR import: periodontal round-trip (LOINC panel + evidence) and
// external-bundle tolerance (ICD-10-CM / SNOMED-coded Conditions).
import { describe, it, expect, beforeEach } from "vitest";
import { parseFhirBundle } from "../fhir/fromFhir";
import { importDiagnosisConditions } from "../fhir/importConditions";
import { ICD10_SYSTEM, FDI_SYSTEM, SNOMED_SYSTEM } from "../fhir/codesystems";
import { ICD10CM_PACK } from "../dx/packs";
import {
  __resetChartStateForTest, importStatus, exportFhir, PERIO_SITES,
  setPerioSite, setFurcation, setPlaque, setPlaqueIndex, setGingivalIndex, setKeratinizedWidth,
  setPeriImplantPlaque, setPeriImplantBleeding, setSmokingStatus, setHba1c,
} from "../odontogram";

const perioPanels = (b: any) => b.entry.map((e: any) => e.resource)
  .filter((r: any) => r.resourceType === "Observation" && r.code?.coding?.some((c: any) => c.code === "74029-0"))
  .sort((a: any, b: any) => String(a.bodySite?.coding?.[0]?.code).localeCompare(String(b.bodySite?.coding?.[0]?.code)));

describe("DX-9: periodontal round-trip through FHIR", () => {
  beforeEach(() => __resetChartStateForTest());

  function chart() {
    importStatus({ version: "2.22", globals: {}, teeth: { "11": { toothSelection: "tooth-base" }, "16": { toothSelection: "tooth-base" }, "21": { toothSelection: "implant" } } });
    for (const s of PERIO_SITES) setPerioSite(11, s, { pd: 5, gm: 2, bop: true, sup: true });   // recession + BOP (+ sup: not exported)
    for (const s of PERIO_SITES) setPerioSite(16, s, { pd: 4, gm: -2, bop: false });             // pseudopocket: gm < 0, only recoverable via CAL
    setFurcation(16, "mesial", 2);
    setPlaque(11, "buccal", true);
    setPlaqueIndex(11, "mesial", 2);
    setGingivalIndex(11, "distal", 1);
    setKeratinizedWidth(11, 3);
    setPeriImplantPlaque(21, "buccal", 2);
    setPeriImplantBleeding(21, "lingual", 1);
    setSmokingStatus("current");
    setHba1c(7.8);
  }

  it("parses the LOINC panels back into the perio record (GM from CAL, incl. negative), indices, and the case evidence", () => {
    chart();
    const out: any = parseFhirBundle(exportFhir());
    const t11 = out.teeth["11"], t16 = out.teeth["16"], t21 = out.teeth["21"];
    expect(t11.perio.pd).toEqual(Object.fromEntries(PERIO_SITES.map((s) => [s, 5])));
    expect(t11.perio.gm).toEqual(Object.fromEntries(PERIO_SITES.map((s) => [s, 2])));
    expect([...t11.perio.bop].sort()).toEqual([...PERIO_SITES].sort());
    expect(t11.perio.sup).toBeUndefined();                       // documented: suppuration is not exported
    expect(t16.perio.pd.MB).toBe(4);
    expect(t16.perio.gm).toEqual(Object.fromEntries(PERIO_SITES.map((s) => [s, -2])));  // CAL − PD
    expect(t16.perio.bop).toBeUndefined();
    expect(t16.furcation).toEqual({ mesial: 2 });
    expect(t11.plaque).toEqual(["buccal"]);
    expect(t11.pi).toEqual({ mesial: 2 });
    expect(t11.gi).toEqual({ distal: 1 });
    expect(t11.kg).toBe(3);
    expect(t21.mpi).toEqual({ buccal: 2 });
    expect(t21.mbi).toEqual({ lingual: 1 });
    expect(out.case).toMatchObject({ smokingStatus: "current", hba1c: 7.8 });
  });

  it("is idempotent: export → import → import into the engine → export yields byte-equal perio panels and evidence", () => {
    chart();
    const first: any = exportFhir();
    const parsed = parseFhirBundle(first);
    __resetChartStateForTest();
    importStatus(parsed);
    const second: any = exportFhir();
    expect(perioPanels(second)).toEqual(perioPanels(first));
    const evidence = (b: any) => b.entry.map((e: any) => e.resource).filter((r: any) => r.resourceType === "Observation" && r.code?.coding?.some((c: any) => ["72166-2", "4548-4"].includes(c.code)));
    expect(evidence(second)).toEqual(evidence(first));
  });

  it("tolerates a malformed panel (no tooth, junk sites/values) without throwing", () => {
    const junk = { resourceType: "Bundle", type: "collection", entry: [
      { resource: { resourceType: "Observation", code: { coding: [{ system: "http://loinc.org", code: "74029-0" }] }, component: [{ code: { coding: [{ system: "http://loinc.org", code: "32910-2" }] }, valueQuantity: { value: 5 } }] } },
      { resource: { resourceType: "Observation", code: { coding: [{ system: "http://loinc.org", code: "74029-0" }] }, bodySite: { coding: [{ code: "11" }] }, component: [
        { code: { coding: [{ system: "http://loinc.org", code: "32910-2" }] }, valueQuantity: { value: "five" }, extension: [{ url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-Observation.component.bodySite", valueCodeableConcept: { coding: [{ system: "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram", code: "perio-site:XX" }] } }] },
        null, {} ] } },
    ] };
    const out: any = parseFhirBundle(junk);
    expect(out.teeth["11"]?.perio).toBeUndefined();
  });
});

describe("DX-9: external-bundle tolerance for Conditions", () => {
  const fdi = (t: string) => ({ bodySite: [{ coding: [{ system: FDI_SYSTEM, code: t }] }] });
  const cond = (system: string, code: string, extra: Record<string, unknown> = {}) =>
    ({ resource: { resourceType: "Condition", code: { coding: [{ system, code }] }, ...extra } });
  const teeth = { "11": { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } } };

  it("an ICD-10-CM-only tooth Condition maps to its key (exact and DX-8 refined codes)", () => {
    // A SECOND caried tooth is the discriminator: `{}` for tooth 11 alone is
    // also what an UNRECOGNISED code produces, so the assertion has to be made
    // where a recognised code changes the answer — once the diagnosis section is
    // engaged, tooth 16's derived caries becomes a `suppress`.
    const twoTeeth = { ...teeth, "16": { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } } };
    for (const code of ["K02.9", "K02.52", "K02.61"]) {
      const r = importDiagnosisConditions([cond(ICD10CM_PACK.system, code, fdi("11"))], twoTeeth);
      expect(r.dxOverridesByTooth["11"] ?? {}).toEqual({});           // recognised as caries -> no override
      expect(r.dxOverridesByTooth["16"], `${code} was not recognised`).toEqual({ caries: "suppress" });
    }
    const add = importDiagnosisConditions([cond(ICD10CM_PACK.system, "K08.409", fdi("11"))], teeth); // CM tooth loss
    expect(add.dxOverridesByTooth["11"]).toMatchObject({ toothLoss: "add", caries: "suppress" });
  });
  it("an ICD-10-CM-only case Condition maps to its case key", () => {
    const r = importDiagnosisConditions([cond(ICD10CM_PACK.system, "M26.609")], teeth);
    expect(r.caseConditions).toEqual({ tmjDisorder: "unspecified" });
  });
  it("a SNOMED-only tooth Condition maps where the catalog has the concept", () => {
    const r = importDiagnosisConditions([cond(SNOMED_SYSTEM, "80967001", fdi("11"))], teeth); // Dental caries
    expect(r.dxOverridesByTooth["11"] ?? {}).toEqual({});
  });
  it("WHO codes still win and a CM chronic-periodontitis Condition (no tooth) is ignored safely", () => {
    const r = importDiagnosisConditions([
      cond(ICD10_SYSTEM, "K02.1", fdi("11")),
      cond(ICD10CM_PACK.system, "K05.312"),
    ], teeth);
    expect(r.dxOverridesByTooth["11"] ?? {}).toEqual({});
    expect(r.caseConditions).toEqual({});
  });
});
