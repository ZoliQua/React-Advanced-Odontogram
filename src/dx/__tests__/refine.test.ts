// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// DX-8 — data-driven code specificity: the caries detail derivation rules and
// the WHO / ICD-10-CM refinement tables (titles verbatim from icd.who.int 2019
// and the NLM Clinical Tables ICD-10-CM service), plus the pack integration.
import { describe, it, expect } from "vitest";
import { deriveDentalDiagnoses, deriveCariesDetail } from "../derive";
import { refineWho, refineCm } from "../refine";
import { packCoding, BNO10_PACK, ICD10CM_PACK } from "../packs";

const tooth = (rec: Record<string, unknown>) => ({ toothSelection: "tooth-base", ...rec });
const cariesDetail = (rec: Record<string, unknown>) =>
  deriveDentalDiagnoses({ teeth: { "11": tooth(rec) } }).find((d) => d.key === "caries")?.detail;

describe("deriveCariesDetail — depth source and most-severe rule", () => {
  it("radiographic depth: E1/E2 -> enamel, D1-D3 -> dentine", () => {
    expect(deriveCariesDetail(tooth({ caries: ["caries-mesial"], radiographicDepth: { mesial: "E1" } }))).toEqual({ depth: "enamel", surface: "smooth" });
    expect(deriveCariesDetail(tooth({ caries: ["caries-mesial"], radiographicDepth: { mesial: "E2" } })).depth).toBe("enamel");
    for (const d of ["D1", "D2", "D3"]) expect(deriveCariesDetail(tooth({ caries: ["caries-occlusal"], radiographicDepth: { occlusal: d } }))).toEqual({ depth: "dentine", surface: "pit-fissure" });
  });
  it("radiographic depth beats the ICDAS severity on the same surface", () => {
    expect(deriveCariesDetail(tooth({ caries: ["caries-occlusal"], radiographicDepth: { occlusal: "E1" }, cariesSeverity: { occlusal: 5 } })).depth).toBe("enamel");
  });
  it("ICDAS fallback: 1-3 -> enamel, 4-6 -> dentine, 0 -> unknown", () => {
    expect(deriveCariesDetail(tooth({ caries: ["caries-buccal"], cariesSeverity: { buccal: 3 } })).depth).toBe("enamel");
    expect(deriveCariesDetail(tooth({ caries: ["caries-buccal"], cariesSeverity: { buccal: 4 } })).depth).toBe("dentine");
    expect(deriveCariesDetail(tooth({ caries: ["caries-buccal"], cariesSeverity: { buccal: 0 } })).depth).toBeNull();
  });
  it("no data at all -> unknown depth, surface type still known", () => {
    expect(deriveCariesDetail(tooth({ caries: ["caries-occlusal"] }))).toEqual({ depth: null, surface: "pit-fissure" });
    expect(deriveCariesDetail(tooth({ caries: ["caries-distal"] }))).toEqual({ depth: null, surface: "smooth" });
    expect(deriveCariesDetail(tooth({ caries: [] }))).toEqual({ depth: null, surface: null });
  });
  it("takes the most severe surface; the surface type follows the deepest one", () => {
    // occlusal enamel + mesial dentine -> dentine, smooth (mesial is the deepest)
    expect(deriveCariesDetail(tooth({ caries: ["caries-occlusal", "caries-mesial"], cariesSeverity: { occlusal: 2, mesial: 5 } }))).toEqual({ depth: "dentine", surface: "smooth" });
    // both dentine -> tie: an occlusal surface among the deepest wins pit-fissure
    expect(deriveCariesDetail(tooth({ caries: ["caries-mesial", "caries-occlusal"], cariesSeverity: { mesial: 5, occlusal: 4 } }))).toEqual({ depth: "dentine", surface: "pit-fissure" });
  });
  it("subcrown counts as a smooth surface; malformed maps are tolerated", () => {
    expect(deriveCariesDetail(tooth({ caries: ["caries-subcrown"], cariesSeverity: { subcrown: 6 } }))).toEqual({ depth: "dentine", surface: "smooth" });
    expect(deriveCariesDetail(tooth({ caries: ["caries-occlusal"], cariesSeverity: "nope", radiographicDepth: 42 }))).toEqual({ depth: null, surface: "pit-fissure" });
  });
  it("deriveDentalDiagnoses attaches the detail to `caries` only", () => {
    const items = deriveDentalDiagnoses({ teeth: { "11": tooth({ caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 }, calculus: true }) } });
    expect(items.find((d) => d.key === "caries")?.detail).toEqual({ depth: "dentine", surface: "pit-fissure" });
    expect("detail" in (items.find((d) => d.key === "calculus") ?? {})).toBe(false);
    expect(cariesDetail({ caries: ["caries-occlusal"], radiographicDepth: { occlusal: "D2" } })).toEqual({ depth: "dentine", surface: "pit-fissure" });
  });
});

describe("refineWho — WHO ICD-10 2019 titles", () => {
  it("caries depth -> K02.0 / K02.1; unknown depth keeps K02", () => {
    expect(refineWho("caries", { depth: "enamel", surface: "smooth" })).toEqual({ icd10: "K02.0", display: "Caries limited to enamel" });
    expect(refineWho("caries", { depth: "dentine", surface: "pit-fissure" })).toEqual({ icd10: "K02.1", display: "Caries of dentine" });
    expect(refineWho("caries", { depth: null, surface: "smooth" })).toEqual({ icd10: "K02", display: "Dental caries" });
    expect(refineWho("caries")).toEqual({ icd10: "K02", display: "Dental caries" });
  });
  it("other keys are unchanged; uncoded keys stay null", () => {
    expect(refineWho("pulpitis")).toEqual({ icd10: "K04.0", display: "Pulpitis" });
    expect(refineWho("periodontitis", { stage: "II", extent: "generalized" })).toEqual({ icd10: "K05.3", display: "Chronic periodontitis" });
    expect(refineWho("periImplantitis").icd10).toBeNull();
  });
});

describe("refineCm — ICD-10-CM (NLM Clinical Tables titles)", () => {
  it("caries surface x depth", () => {
    expect(refineCm("caries", { depth: "enamel", surface: "pit-fissure" })).toEqual({ code: "K02.51", display: "Dental caries on pit and fissure surface limited to enamel" });
    expect(refineCm("caries", { depth: "dentine", surface: "pit-fissure" })).toEqual({ code: "K02.52", display: "Dental caries on pit and fissure surface penetrating into dentin" });
    expect(refineCm("caries", { depth: "enamel", surface: "smooth" })).toEqual({ code: "K02.61", display: "Dental caries on smooth surface limited to enamel" });
    expect(refineCm("caries", { depth: "dentine", surface: "smooth" })).toEqual({ code: "K02.62", display: "Dental caries on smooth surface penetrating into dentin" });
    expect(refineCm("caries", { depth: null, surface: "smooth" })).toBeNull();
    expect(refineCm("caries")).toBeNull();
  });
  it("chronic periodontitis extent x severity", () => {
    expect(refineCm("periodontitis", { stage: "I", extent: "localized" })).toEqual({ code: "K05.311", display: "Chronic periodontitis, localized, slight" });
    expect(refineCm("periodontitis", { stage: "II", extent: "generalized" })).toEqual({ code: "K05.322", display: "Chronic periodontitis, generalized, moderate" });
    expect(refineCm("periodontitis", { stage: "III", extent: "generalized" })).toEqual({ code: "K05.323", display: "Chronic periodontitis, generalized, severe" });
    expect(refineCm("periodontitis", { stage: "IV", extent: "molar-incisor" })).toEqual({ code: "K05.313", display: "Chronic periodontitis, localized, severe" });
    expect(refineCm("periodontitis", { stage: "indeterminate", extent: "localized" })).toEqual({ code: "K05.319", display: "Chronic periodontitis, localized, unspecified severity" });
    expect(refineCm("periodontitis", { stage: "na", extent: "generalized" })).toEqual({ code: "K05.329", display: "Chronic periodontitis, generalized, unspecified severity" });
    expect(refineCm("periodontitis", { stage: "III", extent: "na" })).toEqual({ code: "K05.30", display: "Chronic periodontitis, unspecified" });
  });
  it("nothing to refine for other keys", () => {
    expect(refineCm("gingivitis", { stage: "I", extent: "localized" })).toBeNull();
    expect(refineCm("pulpitis")).toBeNull();
  });
});

describe("packCoding — refined codes through the packs", () => {
  it("BNO-10 (translation): refined WHO code keeps the code and shows the NEAK title", () => {
    expect(packCoding(BNO10_PACK, "caries", "K02.1", "Caries of dentine", { depth: "dentine", surface: "smooth" }))
      .toEqual({ system: BNO10_PACK.system, code: "K02.1", display: "A dentin szuvasodása" });
    expect(packCoding(BNO10_PACK, "caries", "K02.0", "Caries limited to enamel", { depth: "enamel", surface: "smooth" })?.display).toBe("A zománcra korlátozódó szuvasodás");
    expect(packCoding(BNO10_PACK, "caries", "K02", "Dental caries", { depth: null, surface: "smooth" })?.display).toBe("Fogszuvasodás");
  });
  it("ICD-10-CM (modification): refined code first, flat remap as fallback", () => {
    expect(packCoding(ICD10CM_PACK, "caries", "K02.1", "Caries of dentine", { depth: "dentine", surface: "pit-fissure" })?.code).toBe("K02.52");
    expect(packCoding(ICD10CM_PACK, "caries", "K02", "Dental caries", { depth: null, surface: "pit-fissure" })?.code).toBe("K02.9");
    expect(packCoding(ICD10CM_PACK, "caries", "K02", "Dental caries")?.code).toBe("K02.9");
    expect(packCoding(ICD10CM_PACK, "periodontitis", "K05.3", "Chronic periodontitis", { stage: "II", extent: "localized" })?.code).toBe("K05.312");
    expect(packCoding(ICD10CM_PACK, "periodontitis", "K05.3", "Chronic periodontitis")?.code).toBe("K05.30");
  });
});
