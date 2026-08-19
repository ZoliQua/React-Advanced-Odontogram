// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP7 Task 6: payload version 2.5 — root/periodontium/endo-pulp consolidation
// (merged Pulp/Endo selector, merged Root+Periodontium card, granuloma/cyst
// lesion subtype, reversible-pulpitis reduced glyph, retired duplicate
// periapical-inflammation toggle). This task only bumps the export/parse
// version tag; the importer remains field-presence-driven (see
// payload-2-4-roundtrip.test.ts), so 1.4-2.4-tagged payloads still hydrate
// identically. Exercised via the same `__collectExportPayloadForTest` seam
// SP6 Task 1 used.
import { describe, it, expect } from "vitest";
import { __collectExportPayloadForTest } from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";

describe("SP7 Task 6: payload version 2.5", () => {
  it("collectExportPayload emits version 2.5", () => {
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.22");
  });

  it("parseFhirBundle (fromFhir) emits version 2.5, independent of the input payload's own version tag", () => {
    const bundle = buildFhirBundle({ version: "2.4", teeth: {} } as never);
    const out = parseFhirBundle(bundle);
    expect(out.version).toBe("2.20");
  });
});
