// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { importStatus, exportFhir, setDiagnosisCodingPack, getDiagnosisCodingPack, __resetChartStateForTest } from "../odontogram";
import { BNO10_SYSTEM } from "../dx/packs";

// NOTE: hydrateState (via importStatus) validates `caries` entries against the
// registry's `caries-<surface>` value ids (see VALID_CARIES / LOCAL_VALUE_MAPS.caries
// in src/fhir/codesystems.ts) — NOT the bare surface name. `deriveDentalDiagnoses`
// itself is tolerant of either shape (it only checks array length), but going
// through the real import/hydrate path (as this integration test does) requires
// the prefixed id so the surface survives hydration.
const cariesPayload = { version: "2.20", globals: {}, teeth: { "16": { toothSelection: "tooth-base", caries: ["caries-occlusal"] } } };

function conditionsOf(bundle: any) {
  return (bundle.entry ?? []).map((e: any) => e.resource).filter((r: any) => r?.resourceType === "Condition");
}

describe("exportFhir + diagnosis coding pack", () => {
  beforeEach(() => { __resetChartStateForTest(); setDiagnosisCodingPack("none"); });

  it("defaults to WHO-only (no pack)", () => {
    expect(getDiagnosisCodingPack()).toBe("none");
    importStatus(cariesPayload);
    const conds = conditionsOf(exportFhir());
    expect(conds.length).toBeGreaterThanOrEqual(1);
    // BNO-10 now shares the standard ICD-10 system URI, so "no BNO system" is no
    // longer distinguishable by system. Without a pack (and SNOMED off) each
    // Condition carries exactly the single WHO ICD-10 coding — no pack coding added.
    expect(conds.every((c: any) => c.code.coding.length === 1)).toBe(true);
  });

  it("adds the BNO coding when the pack is selected", () => {
    setDiagnosisCodingPack("bno10");
    importStatus(cariesPayload);
    const conds = conditionsOf(exportFhir());
    const caries = conds.find((c: any) => c.code.coding.some((co: any) => co.code === "K02"));
    // Two codings under the same ICD-10 system: WHO English base + BNO Hungarian
    // display. The Hungarian display is the signal the pack coding was applied.
    expect(caries.code.coding.some((co: any) => co.system === BNO10_SYSTEM && co.code === "K02")).toBe(true);
    expect(caries.code.coding.some((co: any) => co.code === "K02" && co.display === "Fogszuvasodás")).toBe(true);
  });
});
