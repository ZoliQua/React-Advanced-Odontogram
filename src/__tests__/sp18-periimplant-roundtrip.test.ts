// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { VALID_PERI_IMPLANT, __setToothStateForTest, __getToothStateForTest,
  __collectExportPayloadForTest } from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";
import { setI18nLanguage } from "../i18n/useI18n";

beforeEach(() => setI18nLanguage("en"));

// SP18 bugfix: `periImplant` (peri-implant status) was authored, rendered, and
// already read back by hydrateState, but `serializeState` omitted it — an SP8
// omission that silently dropped a non-"none" peri-implant status on export.
// This regression test locks the fix: the axis must survive BOTH the native
// JSON export→hydrate path and the FHIR export→import path.
describe("SP18: periImplant serialize/round-trip fix", () => {
  it("serializeState now includes periImplant in the JSON export payload", () => {
    __setToothStateForTest(16, { toothSelection: "implant", periImplant: "peri-implantitis-moderate" });
    const payload = __collectExportPayloadForTest();
    expect(payload.teeth[16].periImplant).toBe("peri-implantitis-moderate");
  });

  it("JSON export -> hydrate round-trips a non-none periImplant value", () => {
    __setToothStateForTest(16, { toothSelection: "implant", periImplant: "peri-implantitis-moderate" });
    const payload = __collectExportPayloadForTest();
    // Re-hydrate the exported raw tooth payload into a fresh tooth slot, exactly
    // as importStatus() would when loading a previously exported JSON file.
    __setToothStateForTest(17, payload.teeth[16], payload.version);
    expect(__getToothStateForTest(17)!.periImplant).toBe("peri-implantitis-moderate");
  });

  it("FHIR export -> import round-trips a non-none periImplant value", () => {
    __setToothStateForTest(26, { toothSelection: "implant", periImplant: "peri-implantitis-severe" });
    const parsed = parseFhirBundle(buildFhirBundle(__collectExportPayloadForTest()));
    // NOTE: `ToothRecord` (src/fhir/types.ts) doesn't declare `periImplant` even
    // though FIELD_MAPPINGS carries it through generically at runtime — a
    // pre-existing type-declaration gap, out of scope for this fix (see report).
    // Cast narrowly here rather than widening the shared type as a side effect
    // of this test.
    const tooth26 = parsed.teeth["26"] as unknown as Record<string, unknown>;
    expect(tooth26.periImplant).toBe("peri-implantitis-severe");
  });

  it("default/none periImplant still round-trips (no regression for the common case)", () => {
    __setToothStateForTest(36, { toothSelection: "implant" });
    const payload = __collectExportPayloadForTest();
    expect(payload.teeth[36].periImplant).toBe("none");
    __setToothStateForTest(37, payload.teeth[36], payload.version);
    expect(__getToothStateForTest(37)!.periImplant).toBe("none");
  });

  it("unknown/invalid value falls back to none on hydrate", () => {
    __setToothStateForTest(46, { toothSelection: "implant", periImplant: "bogus" });
    expect(__getToothStateForTest(46)!.periImplant).toBe("none");
  });

  it("value set is unchanged", () => {
    expect(Array.from(VALID_PERI_IMPLANT).sort()).toEqual([
      "mucositis", "none", "peri-implantitis-mild", "peri-implantitis-moderate", "peri-implantitis-severe",
    ]);
  });
});
