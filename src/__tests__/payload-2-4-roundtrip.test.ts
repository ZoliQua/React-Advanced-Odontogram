// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP6 Task 1: payload version 2.4 — the SP5 `cariesDepths` (ICDAS) +
// `secondaryCaries` (CARS) pair was unified into a single per-surface
// `cariesSeverity` (0..6), read as ICDAS on a primary surface and CARS on a
// recurrent (filled) one. This task bumps the export/parse version tag to 2.4
// and proves the round-trip of the unified field alongside the unchanged
// `rootCaries` / `radiographicDepth`.
//
// `importStatus`/`hydrateState` are field-presence-driven and only branch on
// `payload.version` for the version-gated legacy inference (see
// sp5-final-fixes.test.ts) — the tag is otherwise informational. Exercised via
// `__setToothStateForTest`, the exact per-tooth `hydrateState(raw)` call
// `importStatus` makes, without a live DOM/SVG grid.
import { describe, it, expect } from "vitest";
import { __setToothStateForTest, __getToothStateForTest, __collectExportPayloadForTest } from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";

// `__getToothStateForTest` converts `cariesSeverity` to a plain object but leaves
// `radiographicDepth` as a Map (it is not in that seam's conversion list), so
// read it back through Object.fromEntries.
type Read = {
  rootCaries: string;
  cariesSeverity: Record<string, number>;
  radiographicDepth: Map<string, string>;
};

describe("SP6 Task 1: payload version 2.4", () => {
  it("collectExportPayload emits version 2.4", () => {
    // The current export version has since moved on (now 2.6, via SP8 Task 4);
    // this assertion tracks the current value (see sp7-payload-version.test.ts
    // for the dedicated version-bump test) while the historical describe/it
    // titles are left as-is, matching the existing convention (e.g. diagnosis-ui.test.ts).
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.22");
  });

  it("parseFhirBundle (fromFhir) emits version 2.4, independent of the input payload's own version tag", () => {
    const bundle = buildFhirBundle({ version: "1.4", teeth: {} } as never);
    const out = parseFhirBundle(bundle);
    expect(out.version).toBe("2.20");
  });

  it("rootCaries/cariesSeverity/radiographicDepth survive a JSON export(2.4) -> import round-trip", () => {
    __setToothStateForTest(17, {
      toothSelection: "tooth-base",
      caries: ["caries-mesial", "caries-occlusal"],
      rootCaries: "active-cavitated",
      cariesSeverity: { mesial: 5, occlusal: 2 },
      radiographicDepth: { mesial: "D2", occlusal: "E1" },
    });
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.22");
    const raw17 = payload.teeth[17];
    expect(raw17.rootCaries).toBe("active-cavitated");
    expect(raw17.cariesSeverity).toEqual({ mesial: 5, occlusal: 2 });
    expect(raw17.radiographicDepth).toEqual({ mesial: "D2", occlusal: "E1" });

    // Re-hydrate the exported raw tooth record (as importStatus would for
    // every tooth) into a different slot and confirm lossless round-trip.
    __setToothStateForTest(27, raw17);
    const s = __getToothStateForTest(27) as unknown as Read;
    expect(s.rootCaries).toBe("active-cavitated");
    expect(s.cariesSeverity).toEqual({ mesial: 5, occlusal: 2 });
    expect(Object.fromEntries(s.radiographicDepth)).toEqual({ mesial: "D2", occlusal: "E1" });
  });

  it("rootCaries/cariesSeverity/radiographicDepth survive a full FHIR export(2.4) -> import round-trip", () => {
    const payload = {
      version: "2.4",
      teeth: {
        "36": {
          toothSelection: "tooth-base",
          caries: ["caries-buccal", "caries-lingual"],
          rootCaries: "arrested",
          cariesSeverity: { buccal: 6, lingual: 1 },
          radiographicDepth: { buccal: "D3", lingual: "E2" },
        },
      },
    };
    const bundle = buildFhirBundle(payload as never);
    const out = parseFhirBundle(bundle);
    expect(out.version).toBe("2.20");
    expect(out.teeth["36"].rootCaries).toBe("arrested");
    expect(out.teeth["36"].cariesSeverity).toEqual({ buccal: 6, lingual: 1 });
    expect(out.teeth["36"].radiographicDepth).toEqual({ buccal: "D3", lingual: "E2" });
  });

  it("importer is field-presence-driven: 1.4/2.0/2.1/2.2/2.3/2.4-tagged payloads all hydrate the unified fields identically", () => {
    for (const version of ["1.4", "2.0", "2.1", "2.2", "2.3", "2.4"]) {
      __setToothStateForTest(15, {
        version, // a per-tooth raw record never carries/needs this; included only to prove it's harmless if present
        toothSelection: "tooth-base",
        caries: ["caries-distal"],
        rootCaries: "active",
        cariesSeverity: { distal: 4 },
        radiographicDepth: { distal: "D1" },
      } as never);
      const s = __getToothStateForTest(15) as unknown as Read;
      expect(s.rootCaries).toBe("active");
      expect(s.cariesSeverity).toEqual({ distal: 4 });
      expect(Object.fromEntries(s.radiographicDepth)).toEqual({ distal: "D1" });
    }
  });
});
