import { describe, it, expect } from "vitest";
import { BNO10_PACK, BNO10_SYSTEM, resolveCodingPack, packCoding } from "../packs";
import { DX_CODES, type DiagnosisKey } from "../codes";

describe("coding packs", () => {
  it("resolves a pack id, or undefined for none/unknown", () => {
    expect(resolveCodingPack("bno10")).toBe(BNO10_PACK);
    expect(resolveCodingPack("none")).toBeUndefined();
    expect(resolveCodingPack(null)).toBeUndefined();
    expect(resolveCodingPack("nope")).toBeUndefined();
  });
  it("a translation pack keeps the SAME code and only localizes the display", () => {
    const c = packCoding(BNO10_PACK, "caries", "K02", "Dental caries");
    expect(c).toEqual({ system: BNO10_SYSTEM, code: "K02", display: "Fogszuvasodás" });
  });
  it("has a Hungarian display for every CODED tooth-level diagnosis", () => {
    for (const key of Object.keys(DX_CODES) as DiagnosisKey[]) {
      if (!DX_CODES[key].icd10) continue; // uncoded (peri-implant) — no display needed
      const d = BNO10_PACK.displays?.[key];
      expect(typeof d === "string" && d.length > 0).toBe(true);
    }
  });
  it("localizes a newly-added tooth key display under the BNO system, same code", () => {
    const c = packCoding(BNO10_PACK, "pulpitis", "K04.0", "Pulpitis");
    expect(c).toEqual({ system: BNO10_SYSTEM, code: "K04.0", display: "Fogbélgyulladás (pulpitis)" });
  });
});
