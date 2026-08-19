// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio PG-C Task 2: two new per-tooth categorical DATA axes —
// `cejVisibility` (none|detectable|not-detectable) and `rootConcavity`
// (none|mild|deep). Data + registry + FHIR + payload only (the Dental Chart
// rows/UI are Task 3; the derived Cairo overlay shipped in Task 1). No SVG
// render (both axes carry NO svgLayer) → SVG-fingerprint parity byte-identical.
//
// Pure data-model + FHIR tests, mirroring perio-p2b-furcation.test.ts. Uses the
// same module-state test seams (__setToothStateForTest / __resetChartStateForTest
// / __getToothStateForTest / __collectExportPayloadForTest /
// __hydrateImportedChartsForTest / __planEditedTeethForTest).
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  setCejVisibility,
  getCejVisibility,
  setRootConcavity,
  getRootConcavity,
  setChartMode,
  __setToothStateForTest,
  __getToothStateForTest,
  __resetChartStateForTest,
  __collectExportPayloadForTest,
  __hydrateImportedChartsForTest,
  __planEditedTeethForTest,
} from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { payloadCases } from "./parity/matrix";
import { AXES } from "../registry/axes";
import { FIELD_MAPPINGS } from "../fhir/fieldMappings";
import { LOCAL_VALUE_MAPS, LOCAL_SYSTEM } from "../fhir/codesystems";
import type { OdontogramExportPayload } from "../fhir/types";

beforeEach(() => {
  __resetChartStateForTest();
});

describe("setCejVisibility / getCejVisibility", () => {
  it("defaults to none on a fresh tooth", () => {
    __setToothStateForTest(11, {});
    expect(getCejVisibility(11)).toBe("none");
  });

  it("sets each valid value", () => {
    __setToothStateForTest(11, {});
    setCejVisibility(11, "detectable");
    expect(getCejVisibility(11)).toBe("detectable");
    setCejVisibility(11, "not-detectable");
    expect(getCejVisibility(11)).toBe("not-detectable");
    setCejVisibility(11, "none");
    expect(getCejVisibility(11)).toBe("none");
  });

  it("rejects an invalid value (state unchanged)", () => {
    __setToothStateForTest(11, {});
    setCejVisibility(11, "detectable");
    setCejVisibility(11, "bogus");
    expect(getCejVisibility(11)).toBe("detectable");
    // @ts-expect-error intentional bad input
    setCejVisibility(11, 42);
    expect(getCejVisibility(11)).toBe("detectable");
  });

  it("vivifies a never-touched tooth on set (never throws) and returns none for get", () => {
    expect(getCejVisibility(11)).toBe("none");
    setCejVisibility(11, "detectable");
    expect(getCejVisibility(11)).toBe("detectable");
  });
});

describe("setRootConcavity / getRootConcavity", () => {
  it("defaults to none on a fresh tooth", () => {
    __setToothStateForTest(11, {});
    expect(getRootConcavity(11)).toBe("none");
  });

  it("sets each valid value", () => {
    __setToothStateForTest(11, {});
    setRootConcavity(11, "mild");
    expect(getRootConcavity(11)).toBe("mild");
    setRootConcavity(11, "deep");
    expect(getRootConcavity(11)).toBe("deep");
    setRootConcavity(11, "none");
    expect(getRootConcavity(11)).toBe("none");
  });

  it("rejects an invalid value (state unchanged)", () => {
    __setToothStateForTest(11, {});
    setRootConcavity(11, "deep");
    setRootConcavity(11, "severe");
    expect(getRootConcavity(11)).toBe("deep");
  });

  it("the two axes are independent", () => {
    __setToothStateForTest(11, {});
    setCejVisibility(11, "not-detectable");
    setRootConcavity(11, "mild");
    expect(getCejVisibility(11)).toBe("not-detectable");
    expect(getRootConcavity(11)).toBe("mild");
  });
});

describe("serialize omit-when-none + round-trip (payload 2.16)", () => {
  it("omits both fields entirely when none; version is 2.16", () => {
    __setToothStateForTest(11, {}); // untouched -> both none -> omitted
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    expect(Object.prototype.hasOwnProperty.call(payload.teeth["11"], "cejVisibility")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(payload.teeth["11"], "rootConcavity")).toBe(false);
  });

  it("emits each field only when set (not none)", () => {
    __setToothStateForTest(11, {});
    __setToothStateForTest(12, {});
    setCejVisibility(11, "detectable");
    setRootConcavity(12, "deep");
    const payload = __collectExportPayloadForTest();
    expect(payload.teeth["11"].cejVisibility).toBe("detectable");
    expect(Object.prototype.hasOwnProperty.call(payload.teeth["11"], "rootConcavity")).toBe(false);
    expect(payload.teeth["12"].rootConcavity).toBe("deep");
    expect(Object.prototype.hasOwnProperty.call(payload.teeth["12"], "cejVisibility")).toBe(false);
  });

  it("round-trips both values through serialize -> hydrate", () => {
    __setToothStateForTest(16, {});
    setCejVisibility(16, "not-detectable");
    setRootConcavity(16, "mild");
    const payload = __collectExportPayloadForTest();
    const json = JSON.parse(JSON.stringify(payload));
    __resetChartStateForTest();
    __hydrateImportedChartsForTest(json);
    expect(getCejVisibility(16)).toBe("not-detectable");
    expect(getRootConcavity(16)).toBe("mild");
  });

  it("legacy payload (version 2.13, no fields) hydrates both to none without throwing", () => {
    const legacy = {
      version: "2.13",
      globals: {},
      teeth: { 16: { toothSelection: "tooth-base" } },
    };
    expect(() => __hydrateImportedChartsForTest(legacy)).not.toThrow();
    expect(getCejVisibility(16)).toBe("none");
    expect(getRootConcavity(16)).toBe("none");
  });

  it("a malformed/foreign value on import self-heals to none", () => {
    const crafted = {
      version: "2.16",
      globals: {},
      teeth: { 16: { toothSelection: "tooth-base", cejVisibility: "nope", rootConcavity: 7 } },
    };
    expect(() => __hydrateImportedChartsForTest(crafted)).not.toThrow();
    expect(getCejVisibility(16)).toBe("none");
    expect(getRootConcavity(16)).toBe("none");
  });
});

describe("registry parity — AXES <-> FIELD_MAPPINGS stay 1:1 for the new axes", () => {
  it("both axes are registered in AXES with matching FIELD_MAPPINGS rows and NO svgLayer", () => {
    for (const field of ["cejVisibility", "rootConcavity"]) {
      const ax = AXES.find((a) => a.field === field);
      const fm = FIELD_MAPPINGS.find((m) => m.field === field);
      expect(ax, field).toBeTruthy();
      expect(fm, field).toBeTruthy();
      expect(ax!.kind).toBe("enum");
      expect(ax!.skipValue).toBe("none");
      expect((ax as any).svgLayer).toBeUndefined();
      expect(ax!.finding.local).toBe((fm as any).findingCode);
      expect(ax!.finding.display).toBe((fm as any).findingDisplay);
      expect(ax!.valueGroup).toBe((fm as any).valueGroup);
      // Axis values equal their LOCAL_VALUE_MAPS group exactly.
      const expected = Object.values(LOCAL_VALUE_MAPS[ax!.valueGroup!]).map((e) => e.code).sort();
      expect((ax!.values ?? []).map((v) => v.id).sort()).toEqual(expected);
    }
  });

  it("value groups carry the exact allowed enum values", () => {
    expect(Object.keys(LOCAL_VALUE_MAPS.cejVisibility).sort()).toEqual(["detectable", "none", "not-detectable"]);
    expect(Object.keys(LOCAL_VALUE_MAPS.rootConcavity).sort()).toEqual(["deep", "mild", "none"]);
  });
});

describe("FHIR export — declarative enum path", () => {
  const obsOf = (b: ReturnType<typeof buildFhirBundle>) =>
    (b.entry ?? []).map((e) => e.resource).filter((r): r is any => r?.resourceType === "Observation");
  const findByCode = (b: ReturnType<typeof buildFhirBundle>, code: string) =>
    obsOf(b).filter((o) => o.code.coding?.some((c: any) => c.code === code));

  it("emits a coding for a set tooth and none for a default tooth", () => {
    const payload: OdontogramExportPayload = {
      version: "2.16",
      teeth: {
        "16": { toothSelection: "tooth-base", cejVisibility: "detectable", rootConcavity: "deep" },
        "11": { toothSelection: "tooth-base" }, // both none -> nothing emitted
      },
    };
    const b = buildFhirBundle(payload);

    const cej = findByCode(b, "cej-visibility");
    expect(cej).toHaveLength(1);
    expect(cej[0].bodySite?.coding?.[0].code).toBe("16");
    expect(cej[0].valueCodeableConcept?.coding?.[0].system).toBe(LOCAL_SYSTEM);
    expect(cej[0].valueCodeableConcept?.coding?.[0].code).toBe("detectable");

    const rc = findByCode(b, "root-concavity");
    expect(rc).toHaveLength(1);
    expect(rc[0].bodySite?.coding?.[0].code).toBe("16");
    expect(rc[0].valueCodeableConcept?.coding?.[0].code).toBe("deep");
  });

  it("emits nothing for an explicit none value (skipValue)", () => {
    const payload: OdontogramExportPayload = {
      version: "2.16",
      teeth: { "16": { toothSelection: "tooth-base", cejVisibility: "none", rootConcavity: "none" } },
    };
    const b = buildFhirBundle(payload);
    expect(findByCode(b, "cej-visibility")).toHaveLength(0);
    expect(findByCode(b, "root-concavity")).toHaveLength(0);
  });
});

describe("existing FHIR golden stays byte-identical", () => {
  const testFileUrl = import.meta.url;
  const readGolden = (name: string) =>
    JSON.parse(readFileSync(fileURLToPath(new URL(`./parity/${name}`, testFileUrl)), "utf8"));

  it("matches fhir-golden.json exactly for every existing parity payload case", () => {
    const golden = readGolden("fhir-golden.json");
    payloadCases().forEach((p, i) => {
      expect(buildFhirBundle(p.payload), p.name).toEqual(golden[i].bundle);
    });
  });
});

describe("DS-1 gate honored (interactive per-tooth edits route through gateToothEdit)", () => {
  it("a plan-mode edit marks the tooth plan-edited", () => {
    __setToothStateForTest(16, {});
    setChartMode("plan"); // first entry -> deep clone of status into plan
    expect(__planEditedTeethForTest()).not.toContain(16);
    setCejVisibility(16, "detectable");
    expect(__planEditedTeethForTest()).toContain(16);
  });

  it("a rejected (invalid/no-op) edit does NOT mark the tooth plan-edited", () => {
    __setToothStateForTest(16, {});
    setChartMode("plan");
    setCejVisibility(16, "bogus"); // rejected
    setCejVisibility(16, "none"); // no-op (already none)
    expect(__planEditedTeethForTest()).not.toContain(16);
  });

  it("dual-state isolation: status value survives a plan-only edit", () => {
    __setToothStateForTest(16, {});
    setCejVisibility(16, "detectable");
    setRootConcavity(16, "mild");

    setChartMode("plan"); // clone
    setCejVisibility(16, "not-detectable"); // edit PLAN only
    setRootConcavity(16, "deep");

    setChartMode("status");
    expect(getCejVisibility(16)).toBe("detectable");
    expect(getRootConcavity(16)).toBe("mild");

    setChartMode("plan");
    expect(getCejVisibility(16)).toBe("not-detectable");
    expect(getRootConcavity(16)).toBe("deep");
  });

  it("in status mode on a non-plan-edited tooth, an edit mirrors to plan (no confirm, no diff)", () => {
    __setToothStateForTest(16, {});
    setChartMode("plan"); // initialize plan by cloning status
    setChartMode("status");
    setCejVisibility(16, "detectable"); // status edit, tooth not plan-edited -> mirrors to plan
    setChartMode("plan");
    expect(getCejVisibility(16)).toBe("detectable");
  });
});

// Cross-check against the frozen parity oracle: both new axes must appear in
// AXES/FIELD_MAPPINGS with a 1:1 count (parity.test.ts asserts AXES.length ===
// FIELD_MAPPINGS.length, so a mismatch there would fail globally).
describe("AXES / FIELD_MAPPINGS count parity", () => {
  it("has equal axis and field-mapping counts", () => {
    expect(AXES.length).toBe(FIELD_MAPPINGS.length);
  });
});
