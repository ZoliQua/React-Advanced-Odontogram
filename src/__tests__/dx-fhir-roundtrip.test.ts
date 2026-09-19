// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";

describe("DX-7: FHIR round-trip of case conditions + per-tooth dxOverrides", () => {
  it("round-trips a case condition through FHIR export -> import", () => {
    const payload: any = { version: "2.22", globals: {}, teeth: {}, case: { caseConditions: { tmjDisorder: "right", anodontia: "unspecified" } } };
    const out: any = parseFhirBundle(buildFhirBundle(payload));
    expect(out.case?.caseConditions).toMatchObject({ tmjDisorder: "right", anodontia: "unspecified" });
  });

  it("round-trips a dxOverride 'add' through FHIR export -> import", () => {
    // tooth 11 has no chart finding but an added 'calculus' override
    const payload: any = { version: "2.22", globals: {}, teeth: { "11": { toothSelection: "tooth-base", dxOverrides: { calculus: "add" } } } };
    const out = parseFhirBundle(buildFhirBundle(payload));
    expect(out.teeth["11"]?.dxOverrides).toEqual({ calculus: "add" });
  });

  it("round-trips a dxOverride 'suppress' through FHIR export -> import", () => {
    // tooth 11 derives caries but suppresses it; another finding keeps the dental section present
    const payload: any = { version: "2.22", globals: {}, teeth: { "11": { toothSelection: "tooth-base", caries: ["occlusal"], calculus: true, dxOverrides: { caries: "suppress" } } } };
    const out = parseFhirBundle(buildFhirBundle(payload));
    expect(out.teeth["11"]?.dxOverrides).toEqual({ caries: "suppress" });
  });
});
