import { describe, it, expect } from "vitest";
import { applyDxOverrides, deriveDentalDiagnoses } from "../derive";

describe("deriveDentalDiagnoses (DX-0: caries)", () => {
  it("derives one caries diagnosis per tooth that has any carious surface", () => {
    const payload = { teeth: { "16": { caries: ["occlusal"] }, "21": { caries: [] }, "26": { caries: ["mesial", "distal"] } } };
    // DX-8: `caries` items carry a refinement detail (depth unknown here; surface type from the ids).
    expect(deriveDentalDiagnoses(payload)).toEqual([
      { toothNo: "16", key: "caries", detail: { depth: null, surface: "pit-fissure" } },
      { toothNo: "26", key: "caries", detail: { depth: null, surface: "smooth" } },
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

describe("deriveDentalDiagnoses — DX-1 pulp & apical", () => {
  const one = (tooth: Record<string, unknown>) =>
    deriveDentalDiagnoses({ teeth: { "16": tooth } }).map((d) => d.key);
  it("pulp: pulpitis (reversible+irreversible) and necrosis", () => {
    expect(one({ toothSelection: "tooth-base", pulpDx: "reversible-pulpitis" })).toContain("pulpitis");
    expect(one({ toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis" })).toContain("pulpitis");
    expect(one({ toothSelection: "tooth-base", pulpDx: "necrosis" })).toContain("pulpNecrosis");
  });
  it("apical: symptomatic/asymptomatic/abscess/condensing", () => {
    expect(one({ toothSelection: "tooth-base", apicalDx: "symptomatic-apical-periodontitis" })).toContain("apicalPeriodontitisAcute");
    expect(one({ toothSelection: "tooth-base", apicalDx: "asymptomatic-apical-periodontitis" })).toContain("apicalPeriodontitisChronic");
    expect(one({ toothSelection: "tooth-base", apicalDx: "acute-apical-abscess" })).toContain("periapicalAbscess");
    expect(one({ toothSelection: "tooth-base", apicalDx: "chronic-apical-abscess" })).toContain("periapicalAbscessSinus");
    expect(one({ toothSelection: "tooth-base", apicalDx: "condensing-osteitis" })).toContain("condensingOsteitis");
  });
  it("periapicalType cyst overrides the apical periodontitis code with radicularCyst", () => {
    const keys = one({ toothSelection: "tooth-base", apicalDx: "asymptomatic-apical-periodontitis", periapicalType: "cyst" });
    expect(keys).toContain("radicularCyst");
    expect(keys).not.toContain("apicalPeriodontitisChronic");
  });
});

describe("deriveDentalDiagnoses — DX-3a fracture", () => {
  it("derives toothFracture from a broken crown", () => {
    const out = deriveDentalDiagnoses({ teeth: { "11": { toothSelection: "tooth-base", brokenMesial: true } } });
    expect(out.map((d) => d.key)).toContain("toothFracture");
  });
  it("does not derive toothFracture on an intact tooth", () => {
    const out = deriveDentalDiagnoses({ teeth: { "11": { toothSelection: "tooth-base" } } });
    expect(out.map((d) => d.key)).not.toContain("toothFracture");
  });
});

describe("deriveDentalDiagnoses — DX-3a peri-implant disease", () => {
  it("derives periImplantitis from an implant's peri-implantitis (any severity)", () => {
    const out = deriveDentalDiagnoses({ teeth: { "36": { toothSelection: "implant", periImplant: "peri-implantitis-moderate" } } });
    expect(out.map((d) => d.key)).toContain("periImplantitis");
  });
  it("derives periImplantMucositis from implant mucositis", () => {
    const out = deriveDentalDiagnoses({ teeth: { "36": { toothSelection: "implant", periImplant: "mucositis" } } });
    expect(out.map((d) => d.key)).toContain("periImplantMucositis");
  });
  it("ignores a stale periImplant value on a non-implant tooth", () => {
    const out = deriveDentalDiagnoses({ teeth: { "36": { toothSelection: "tooth-base", periImplant: "peri-implantitis-severe" } } });
    expect(out.map((d) => d.key)).not.toContain("periImplantitis");
  });
});

describe("dxOverrides (DX-2)", () => {
  it("applyDxOverrides: suppress removes, add includes, unknown/invalid ignored", () => {
    // applyDxOverrides mutates+returns its input Set (by design, see derive.ts), so each
    // assertion below gets its OWN fresh base Set rather than reusing one across calls.
    const base = () => new Set(["caries", "pulpitis"] as const);
    expect([...applyDxOverrides(base() as Set<any>, { caries: "suppress" })].sort()).toEqual(["pulpitis"]);
    expect([...applyDxOverrides(base() as Set<any>, { calculus: "add" })].sort()).toEqual(["calculus", "caries", "pulpitis"]);
    expect([...applyDxOverrides(base() as Set<any>, { nope: "add", caries: "bogus" })].sort()).toEqual(["caries", "pulpitis"]);
  });
  it("deriveDentalDiagnoses honours a tooth's dxOverrides", () => {
    const p = { teeth: { "16": { toothSelection: "tooth-base", caries: ["occlusal"], dxOverrides: { caries: "suppress", calculus: "add" } } } };
    expect(deriveDentalDiagnoses(p).map((d) => d.key).sort()).toEqual(["calculus"]);
  });
  it("add is presence-gated: NOT emitted on a non-present tooth, IS emitted on a present tooth", () => {
    const p = {
      teeth: {
        "16": { toothSelection: "none", dxOverrides: { calculus: "add" } },
        "26": { toothSelection: "tooth-base", dxOverrides: { calculus: "add" } },
      },
    };
    const keysByTooth = deriveDentalDiagnoses(p).reduce<Record<string, string[]>>((acc, d) => {
      (acc[d.toothNo] ??= []).push(d.key);
      return acc;
    }, {});
    expect(keysByTooth["16"] ?? []).not.toContain("calculus");
    expect(keysByTooth["26"] ?? []).toContain("calculus");
  });
  it("suppress stays global: still un-codes toothLoss on a non-present (extraction-socket) tooth", () => {
    const p = { teeth: { "16": { toothSelection: "no-tooth-after-extraction", dxOverrides: { toothLoss: "suppress" } } } };
    expect(deriveDentalDiagnoses(p).map((d) => d.key)).not.toContain("toothLoss");
  });
  it("applyDxOverrides: allowAdd=false blocks add but suppress still applies; allowAdd=true (or omitted) allows add", () => {
    expect([...applyDxOverrides(new Set(["caries"]) as Set<any>, { calculus: "add" }, false)].sort()).toEqual(["caries"]);
    expect([...applyDxOverrides(new Set(["caries"]) as Set<any>, { calculus: "add" }, true)].sort()).toEqual(["calculus", "caries"]);
    expect([...applyDxOverrides(new Set(["caries"]) as Set<any>, { calculus: "add" })].sort()).toEqual(["calculus", "caries"]);
    expect([...applyDxOverrides(new Set(["caries"]) as Set<any>, { caries: "suppress" }, false)]).toEqual([]);
  });
});
