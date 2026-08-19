import { describe, it, expect } from "vitest";
import { deriveDentalDiagnoses } from "../derive";

describe("deriveDentalDiagnoses (DX-0: caries)", () => {
  it("derives one caries diagnosis per tooth that has any carious surface", () => {
    const payload = { teeth: { "16": { caries: ["occlusal"] }, "21": { caries: [] }, "26": { caries: ["mesial", "distal"] } } };
    expect(deriveDentalDiagnoses(payload)).toEqual([
      { toothNo: "16", key: "caries" },
      { toothNo: "26", key: "caries" },
    ]);
  });
  it("returns [] for no teeth / no caries / malformed input", () => {
    expect(deriveDentalDiagnoses({ teeth: {} })).toEqual([]);
    expect(deriveDentalDiagnoses({ teeth: { "11": { caries: [] } } })).toEqual([]);
    expect(deriveDentalDiagnoses(null)).toEqual([]);
    expect(deriveDentalDiagnoses({})).toEqual([]);
  });
});
