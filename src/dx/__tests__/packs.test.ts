import { describe, it, expect } from "vitest";
import { BNO10_PACK, BNO10_SYSTEM, resolveCodingPack, packCoding } from "../packs";

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
});
