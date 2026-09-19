// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";
import { ICDAS_SYSTEM, LOCAL_SYSTEM } from "../fhir/codesystems";
import type { Observation } from "../fhir/types";

const payload = (teeth: Record<string, object>) =>
  ({ version: "2.20", globals: {}, teeth }) as never;

function cariesComponents(bundle: { entry?: Array<{ resource?: unknown }> }) {
  const obs = (bundle.entry ?? [])
    .map((e) => e.resource as Observation)
    .find((r) => r?.resourceType === "Observation" &&
      r.code?.coding?.some((c) => c.system === LOCAL_SYSTEM && c.code === "caries"));
  return obs?.component ?? [];
}

describe("ICDAS/CARS coding on caries components", () => {
  it("adds an ICDAS coding on a primary (unfilled) surface with severity", () => {
    const bundle = buildFhirBundle(payload({
      "11": { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } },
    }));
    const comps = cariesComponents(bundle);
    expect(comps).toHaveLength(1);
    expect(comps[0].valueInteger).toBe(4);
    const icdas = comps[0].code?.coding?.find((c) => c.system === ICDAS_SYSTEM);
    expect(icdas?.code).toBe("ICDAS-4");
    expect(icdas?.display).toMatch(/dark shadow/i);
  });

  it("adds a CARS coding instead on a recurrent (filled) surface", () => {
    const bundle = buildFhirBundle(payload({
      "11": {
        toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 3 },
        fillingSurfaces: ["occlusal"], fillingSurfaceMaterials: { occlusal: "amalgam" },
      },
    }));
    const comps = cariesComponents(bundle);
    const cars = comps[0].code?.coding?.find((c) => c.code === "cars-3");
    expect(cars?.system).toBe(LOCAL_SYSTEM);
    expect(comps[0].code?.coding?.some((c) => c.system === ICDAS_SYSTEM)).toBe(false);
  });

  it("adds no scoring coding when the surface has no severity", () => {
    const bundle = buildFhirBundle(payload({
      "11": { toothSelection: "tooth-base", caries: ["caries-mesial"] },
    }));
    const comps = cariesComponents(bundle);
    expect(comps[0].valueBoolean).toBe(true);
    expect(comps[0].code?.coding?.some((c) => c.system === ICDAS_SYSTEM)).toBe(false);
  });

  it("does not disturb the round-trip (severity still imports intact)", () => {
    const bundle = buildFhirBundle(payload({
      "11": { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 5 } },
    }));
    const parsed = parseFhirBundle(bundle) as { teeth: Record<string, { cariesSeverity?: Record<string, number> }> };
    expect(parsed.teeth["11"].cariesSeverity).toEqual({ occlusal: 5 });
  });
});
