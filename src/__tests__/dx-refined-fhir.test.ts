// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// DX-8 end-to-end: the refined codes reach the FHIR export (WHO + BNO + CM), the
// perio Condition's CM code follows the emitted stage/extent, the refined WHO
// code round-trips through the importer, and the Diagnoses card / tooth
// diagnoses show the refined code. No payload change (2.22).
import { describe, it, expect, beforeEach } from "vitest";
import { buildFhirBundle } from "../fhir/toFhir";
import { importDiagnosisConditions } from "../fhir/importConditions";
import { ICD10_SYSTEM, FDI_SYSTEM } from "../fhir/codesystems";
import { BNO10_PACK, ICD10CM_PACK } from "../dx/packs";
import { refineCm } from "../dx/refine";
import {
  __resetChartStateForTest, __setSelectionForTest, importStatus, exportFhir,
  getToothDiagnoses, getActiveDiagnoses, setPerioSite, setCaseAge, setMaxRblPercent, PERIO_SITES,
} from "../odontogram";

const payloadWith = (rec: Record<string, unknown>) => ({ version: "2.22", globals: {}, teeth: { "11": { toothSelection: "tooth-base", ...rec } } }) as never;
const cariesCondition = (b: any) => b.entry.map((e: any) => e.resource).find((r: any) => r.resourceType === "Condition" && r.id === "odontogram-dx-caries-11");

describe("DX-8 export: caries refined by depth", () => {
  it("ICDAS 4 on an occlusal surface -> WHO K02.1; BNO shows the NEAK title; CM K02.52", () => {
    const rec = { caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } };
    const who = cariesCondition(buildFhirBundle(payloadWith(rec)));
    expect(who.code.coding[0]).toEqual({ system: ICD10_SYSTEM, code: "K02.1", display: "Caries of dentine" });
    expect(who.code.text).toBe("Caries of dentine");
    const bno = cariesCondition(buildFhirBundle(payloadWith(rec), { codingPack: BNO10_PACK }));
    expect(bno.code.coding[1]).toMatchObject({ code: "K02.1", display: "A dentin szuvasodása" });
    const cm = cariesCondition(buildFhirBundle(payloadWith(rec), { codingPack: ICD10CM_PACK }));
    expect(cm.code.coding[1]).toMatchObject({ code: "K02.52", display: "Dental caries on pit and fissure surface penetrating into dentin" });
  });
  it("radiographic E1 wins over ICDAS 5 -> K02.0; CM smooth-surface enamel -> K02.61", () => {
    const rec = { caries: ["caries-mesial"], radiographicDepth: { mesial: "E1" }, cariesSeverity: { mesial: 5 } };
    expect(cariesCondition(buildFhirBundle(payloadWith(rec))).code.coding[0].code).toBe("K02.0");
    expect(cariesCondition(buildFhirBundle(payloadWith(rec), { codingPack: ICD10CM_PACK })).code.coding[1].code).toBe("K02.61");
  });
  it("no depth information keeps the flat codes (K02 / K02.9 / Fogszuvasodás)", () => {
    const rec = { caries: ["caries-occlusal"] };
    expect(cariesCondition(buildFhirBundle(payloadWith(rec))).code.coding[0]).toEqual({ system: ICD10_SYSTEM, code: "K02", display: "Dental caries" });
    expect(cariesCondition(buildFhirBundle(payloadWith(rec), { codingPack: ICD10CM_PACK })).code.coding[1].code).toBe("K02.9");
    expect(cariesCondition(buildFhirBundle(payloadWith(rec), { codingPack: BNO10_PACK })).code.coding[1].display).toBe("Fogszuvasodás");
  });
  it("the Condition id and the SNOMED base concept are unchanged by the refinement", () => {
    const c = cariesCondition(buildFhirBundle(payloadWith({ caries: ["caries-occlusal"], cariesSeverity: { occlusal: 5 } }), { snomed: true }));
    expect(c.id).toBe("odontogram-dx-caries-11");
    expect(c.code.coding.find((x: any) => x.system === "http://snomed.info/sct")).toMatchObject({ code: "80967001" });
  });
});

describe("DX-8 export: chronic periodontitis refined by stage/extent (ICD-10-CM)", () => {
  beforeEach(() => __resetChartStateForTest());
  it("the CM code follows the emitted stage/extent summaries; WHO stays K05.3", () => {
    const teeth: Record<string, unknown> = {};
    for (const n of [16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 36, 46]) teeth[String(n)] = { toothSelection: "tooth-base" };
    importStatus({ version: "2.22", globals: {}, teeth });
    for (const n of [16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26]) for (const site of PERIO_SITES) setPerioSite(n, site, { pd: 6, gm: 2, bop: true });
    setCaseAge(55); setMaxRblPercent(45);
    const b: any = exportFhir({ codingPack: ICD10CM_PACK });
    const cond = b.entry.map((e: any) => e.resource).find((r: any) => r.resourceType === "Condition" && r.id === "odontogram-perio-condition");
    expect(cond).toBeTruthy();
    expect(cond.code.coding[0]).toMatchObject({ system: ICD10_SYSTEM, code: "K05.3" });
    const summaries: string[] = (cond.stage ?? []).map((s: any) => s.summary?.coding?.[0]?.code ?? "");
    const stage = (summaries.find((c) => c.startsWith("stage-")) ?? "stage-na").slice("stage-".length);
    const extent = (summaries.find((c) => c.startsWith("extent-")) ?? "extent-na").slice("extent-".length);
    const expected = refineCm("periodontitis", { stage: stage as never, extent: extent as never });
    expect(expected).toBeTruthy();
    expect(cond.code.coding[1]).toMatchObject({ system: ICD10CM_PACK.system, code: expected!.code, display: expected!.display });
    expect(cond.code.coding[1].code).toMatch(/^K05\.3(0|[12][1239])$/);
  });
});

describe("DX-8 import: a refined WHO code maps back to its key", () => {
  const cond = (code: string) => ({ resource: { resourceType: "Condition", code: { coding: [{ system: ICD10_SYSTEM, code }] }, bodySite: [{ coding: [{ system: FDI_SYSTEM, code: "11" }] }] } });
  const teeth = { "11": { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } } };
  it("K02.1 / K02.0 / K02.9 -> caries (no false suppress/add); K02.2 still means cariesCementum", () => {
    for (const code of ["K02.1", "K02.0", "K02.9"]) {
      const r = importDiagnosisConditions([cond(code)], teeth);
      expect(r.dxOverridesByTooth["11"] ?? {}).toEqual({});               // effective == raw -> no override
    }
    const r2 = importDiagnosisConditions([cond("K02.2")], teeth);
    expect(r2.dxOverridesByTooth["11"]).toMatchObject({ cariesCementum: "add", caries: "suppress" }); // exact key wins
  });
});

describe("DX-8 UI: tooth diagnoses and the Diagnoses card show the refined code", () => {
  beforeEach(() => __resetChartStateForTest());
  it("getToothDiagnoses / getActiveDiagnoses expose K02.1 Caries of dentine", () => {
    importStatus({ version: "2.22", globals: {}, teeth: { "11": { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } } } });
    const td = getToothDiagnoses(11).find((d) => d.key === "caries")!;
    expect(td.icd10).toBe("K02.1"); expect(td.icd10Display).toBe("Caries of dentine");
    __setSelectionForTest([11]);
    const row = getActiveDiagnoses().rows.find((r) => r.key === "caries")!;
    expect(row.icd10).toBe("K02.1");
  });
});
