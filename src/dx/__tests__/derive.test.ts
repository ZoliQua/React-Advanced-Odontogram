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

describe("deriveDentalDiagnoses — DX-1 hard-tissue & status", () => {
  const one = (tooth: Record<string, unknown>) =>
    deriveDentalDiagnoses({ teeth: { "16": tooth } }).map((d) => d.key);
  it("root caries: active -> cariesCementum, arrested -> cariesArrested", () => {
    expect(one({ toothSelection: "tooth-base", rootCaries: "active" })).toContain("cariesCementum");
    expect(one({ toothSelection: "tooth-base", rootCaries: "active-cavitated" })).toContain("cariesCementum");
    expect(one({ toothSelection: "tooth-base", rootCaries: "arrested" })).toContain("cariesArrested");
  });
  it("wear: attrition/erosion/abrasion/abfraction map to K03.x keys, deduped", () => {
    expect(one({ toothSelection: "tooth-base", wearEdge: "attrition" })).toEqual(["attrition"]);
    expect(one({ toothSelection: "tooth-base", wearCervical: "abrasion" })).toEqual(["abrasion"]);
    expect(one({ toothSelection: "tooth-base", wearCervical: "abfraction" })).toEqual(["abfraction"]);
    // both edges erosion -> a single erosion diagnosis (deduped)
    expect(one({ toothSelection: "tooth-base", wearEdge: "erosion", wearCervical: "erosion" })).toEqual(["erosion"]);
  });
  it("resorption/calculus/discoloration", () => {
    expect(one({ toothSelection: "tooth-base", resorptionType: "internal" })).toContain("resorption");
    expect(one({ toothSelection: "tooth-base", calculus: true })).toContain("calculus");
    expect(one({ toothSelection: "tooth-base", discoloration: "fluorosis" })).toContain("fluorosis");
    expect(one({ toothSelection: "tooth-base", discoloration: "tetracycline" })).toContain("tetracyclineStain");
    expect(one({ toothSelection: "tooth-base", discoloration: "nonvital" })).toContain("postEruptiveColour");
  });
  it("tooth loss & retained root", () => {
    expect(one({ toothSelection: "no-tooth-after-extraction" })).toEqual(["toothLoss"]);
    expect(one({ toothSelection: "tooth-base", toothSubstrate: "radix" })).toContain("retainedRoot");
  });
  it("presence gating: caries/wear on an implant or missing tooth is NOT emitted", () => {
    expect(one({ toothSelection: "implant", caries: ["occlusal"] })).toEqual([]);
    expect(one({ toothSelection: "no-tooth-after-extraction", wearEdge: "attrition" })).toEqual(["toothLoss"]);
  });
});
