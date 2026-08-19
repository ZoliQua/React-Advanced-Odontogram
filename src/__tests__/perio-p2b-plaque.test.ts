// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio P2b Task 3: O'Leary plaque-index axis (per-surface presence ->
// whole-mouth PI%). Data + serialize + FHIR + summary only (the UI row is a
// later task). See .superpowers/sdd/task-3-brief.md for the exact surface
// set / PI% formula.
//
// Pure data-model + FHIR tests — NO UI, NO SVG render (plaque has no chart
// layer yet). Uses the same module-state test seams as the P1 perio core /
// P2b furcation tests (__setToothStateForTest operates on the ACTIVE chart;
// __resetChartStateForTest clears both charts + planInitialized + mode
// before every test so module state never leaks).
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  setPlaque,
  getToothPlaque,
  getPerioSummary,
  setChartMode,
  __setToothStateForTest,
  __resetChartStateForTest,
  __collectExportPayloadForTest,
  __hydrateImportedChartsForTest,
} from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { payloadCases } from "./parity/matrix";
import { FDI_SYSTEM, LOCAL_SYSTEM } from "../fhir/codesystems";
import type { OdontogramExportPayload } from "../fhir/types";

beforeEach(() => {
  __resetChartStateForTest();
});

describe("setPlaque / getToothPlaque", () => {
  it("sets a valid surface present", () => {
    __setToothStateForTest(16, {});
    setPlaque(16, "buccal", true);
    expect(getToothPlaque(16)).toContain("buccal");
  });

  it("sets every valid surface independently", () => {
    __setToothStateForTest(26, {});
    setPlaque(26, "mesial", true);
    setPlaque(26, "distal", true);
    setPlaque(26, "buccal", true);
    setPlaque(26, "lingual", true);
    expect(getToothPlaque(26).sort()).toEqual(["buccal", "distal", "lingual", "mesial"]);
  });

  it("rejects an unrecognized surface string outright", () => {
    __setToothStateForTest(16, {});
    setPlaque(16, "occlusal", true);
    expect(getToothPlaque(16)).toEqual([]);
  });

  it("present=false removes a previously-set surface", () => {
    __setToothStateForTest(16, {});
    setPlaque(16, "buccal", true);
    expect(getToothPlaque(16)).toContain("buccal");
    setPlaque(16, "buccal", false);
    expect(getToothPlaque(16)).toEqual([]);
  });

  it("removing one surface leaves the others untouched", () => {
    __setToothStateForTest(26, {});
    setPlaque(26, "mesial", true);
    setPlaque(26, "distal", true);
    setPlaque(26, "mesial", false);
    expect(getToothPlaque(26)).toEqual(["distal"]);
  });

  it("present=false on a surface never set is a harmless no-op", () => {
    __setToothStateForTest(16, {});
    setPlaque(16, "buccal", false);
    expect(getToothPlaque(16)).toEqual([]);
  });

  it("a tooth never touched at all returns [] (never throws)", () => {
    expect(getToothPlaque(16)).toEqual([]);
  });

  it("an unrecognized surface with present=false is also a no-op", () => {
    __setToothStateForTest(16, {});
    setPlaque(16, "occlusal", false);
    expect(getToothPlaque(16)).toEqual([]);
  });
});

describe("payload round-trip (version 2.16, plaque additive)", () => {
  it("set plaque -> serialize -> version 2.16, plaque present only where present", () => {
    __setToothStateForTest(16, {});
    __setToothStateForTest(11, {}); // no plaque -> must stay omitted
    setPlaque(16, "mesial", true);
    setPlaque(16, "buccal", true);

    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    expect((payload.teeth["16"].plaque as string[]).sort()).toEqual(["buccal", "mesial"]);
    expect(payload.teeth["11"].plaque).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(payload.teeth["11"], "plaque")).toBe(false);
  });

  it("hydrate restores identical set, as a fresh independent instance", () => {
    __setToothStateForTest(26, {});
    setPlaque(26, "distal", true);
    const payload = __collectExportPayloadForTest();

    const jsonRoundTrip = JSON.parse(JSON.stringify(payload));

    __resetChartStateForTest();
    __hydrateImportedChartsForTest(jsonRoundTrip);
    expect(getToothPlaque(26)).toEqual(["distal"]);
    expect(getToothPlaque(11)).toEqual([]);

    // Independence: mutating live re-hydrated state must never reach back
    // into the captured snapshot.
    setPlaque(26, "mesial", true);
    expect(getToothPlaque(26).sort()).toEqual(["distal", "mesial"]);
    expect(payload.teeth["26"].plaque).toEqual(["distal"]);
    expect(jsonRoundTrip.teeth["26"].plaque).toEqual(["distal"]);
  });

  it("legacy payload (version 2.12, no plaque field) hydrates to empty plaque without throwing", () => {
    const legacyPayload = {
      version: "2.12",
      globals: {},
      teeth: { 16: { toothSelection: "tooth-base" } },
    };
    expect(() => __hydrateImportedChartsForTest(legacyPayload)).not.toThrow();
    expect(getToothPlaque(16)).toEqual([]);
  });

  it("a malformed/foreign plaque payload never throws and self-heals", () => {
    const craftedPayload = {
      version: "2.13",
      globals: {},
      teeth: {
        16: {
          toothSelection: "tooth-base",
          plaque: ["mesial", "occlusal", 7, "buccal"],
          // "occlusal" is an unrecognized surface -> dropped;
          // 7 is not a string -> dropped
        },
      },
    };
    expect(() => __hydrateImportedChartsForTest(craftedPayload)).not.toThrow();
    expect(getToothPlaque(16).sort()).toEqual(["buccal", "mesial"]);
  });
});

describe("getPerioSummary().plaquePercent", () => {
  it("is 0 when there are no present teeth at all", () => {
    expect(getPerioSummary().plaquePercent).toBe(0);
  });

  it("is 0 when present teeth exist but have no plaque", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base" });
    expect(getPerioSummary().plaquePercent).toBe(0);
  });

  it("computes K plaque surfaces / (N present teeth * 4) * 100 — 2 present teeth, 3 surfaces -> 37.5%", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base" });
    __setToothStateForTest(26, { toothSelection: "tooth-base" });
    setPlaque(16, "mesial", true);
    setPlaque(16, "distal", true);
    setPlaque(26, "buccal", true);
    expect(getPerioSummary().plaquePercent).toBe(37.5);
  });

  it("adding a missing tooth (toothSelection none) does not change the denominator", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base" });
    __setToothStateForTest(26, { toothSelection: "tooth-base" });
    setPlaque(16, "mesial", true);
    setPlaque(16, "distal", true);
    setPlaque(26, "buccal", true);
    __setToothStateForTest(11, { toothSelection: "none" }); // missing -> excluded
    expect(getPerioSummary().plaquePercent).toBe(37.5);
  });

  it("adding an implant tooth does not change the denominator", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base" });
    __setToothStateForTest(26, { toothSelection: "tooth-base" });
    setPlaque(16, "mesial", true);
    setPlaque(16, "distal", true);
    setPlaque(26, "buccal", true);
    __setToothStateForTest(36, { toothSelection: "implant" }); // implant -> excluded
    expect(getPerioSummary().plaquePercent).toBe(37.5);
  });

  it("a fully plaque-covered present tooth (all 4 surfaces) yields 100% with 1 present tooth", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base" });
    setPlaque(16, "mesial", true);
    setPlaque(16, "distal", true);
    setPlaque(16, "buccal", true);
    setPlaque(16, "lingual", true);
    expect(getPerioSummary().plaquePercent).toBe(100);
  });

  it("tracks plaque independently of perio-site charting (a plaque-only tooth still counts)", () => {
    __setToothStateForTest(26, { toothSelection: "tooth-base" });
    setPlaque(26, "distal", true);
    expect(getPerioSummary().plaquePercent).toBe(25);
  });
});

describe("dual-state isolation", () => {
  it("set plaque in status, enter plan (clone), edit plan plaque -> status unchanged", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base" });
    setPlaque(16, "buccal", true);

    setChartMode("plan"); // first entry -> deep clone of status into plan
    setPlaque(16, "buccal", false); // edit PLAN only
    setPlaque(16, "mesial", true);

    setChartMode("status");
    expect(getToothPlaque(16)).toEqual(["buccal"]);

    setChartMode("plan");
    expect(getToothPlaque(16)).toEqual(["mesial"]);
  });
});

// ---- FHIR export ----

const LOINC = "http://loinc.org";
const COMPONENT_BODYSITE_EXTENSION_URL =
  "http://hl7.org/fhir/5.0/StructureDefinition/extension-Observation.component.bodySite";

function componentBodySite(c: any): import("fhir/r4").CodeableConcept {
  return c.extension?.find((e: any) => e.url === COMPONENT_BODYSITE_EXTENSION_URL)?.valueCodeableConcept;
}

function obsOf(b: ReturnType<typeof buildFhirBundle>) {
  return (b.entry ?? []).map((e) => e.resource).filter((r): r is NonNullable<typeof r> => r?.resourceType === "Observation") as import("fhir/r4").Observation[];
}

function panelFor(b: ReturnType<typeof buildFhirBundle>, tooth: string) {
  return obsOf(b).find(
    (o) => o.code.coding?.some((c) => c.system === LOINC && c.code === "74029-0") && o.bodySite?.coding?.[0]?.code === tooth,
  );
}

const plaquePayload: OdontogramExportPayload = {
  version: "2.13",
  teeth: {
    "26": {
      toothSelection: "tooth-base",
      plaque: ["mesial", "distal", "buccal"],
    },
    // A perfectly clean tooth -> no perio, no furcation, no plaque -> no panel at all.
    "11": { toothSelection: "tooth-base" },
  },
};

describe("plaque FHIR export — additional components on the periodontal panel", () => {
  it("emits a plaque component (no LOINC) per present surface, with tooth+surface bodySite", () => {
    const b = buildFhirBundle(plaquePayload);
    const panel = panelFor(b, "26")!;
    expect(panel).toBeDefined();
    const plaqueComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "plaque-surface");
    expect(plaqueComps).toHaveLength(3);
    for (const c of plaqueComps as any[]) {
      // No LOINC coding — engine-local only.
      expect(c.code.coding?.[0]?.system).toBe(LOCAL_SYSTEM);
      expect(c.valueBoolean).toBe(true);
      expect(componentBodySite(c).coding[0]).toEqual({ system: FDI_SYSTEM, code: "26" });
      expect(componentBodySite(c).coding[1].system).toBe(LOCAL_SYSTEM);
    }
    const bySurface = Object.fromEntries(plaqueComps.map((c: any) => [componentBodySite(c).coding[1].code, c.valueBoolean]));
    expect(bySurface["plaque-surface:mesial"]).toBe(true);
    expect(bySurface["plaque-surface:distal"]).toBe(true);
    expect(bySurface["plaque-surface:buccal"]).toBe(true);
    expect(bySurface["plaque-surface:lingual"]).toBeUndefined();
  });

  it("emits the panel (with only plaque components) for a plaque-only tooth (no perio sites, no furcation)", () => {
    const b = buildFhirBundle(plaquePayload);
    const panels = obsOf(b).filter((o) => o.code.coding?.some((c) => c.system === LOINC && c.code === "74029-0"));
    expect(panels).toHaveLength(1);
    const panel = panels[0];
    const pdComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "32910-2");
    expect(pdComps).toHaveLength(0);
    const furcationComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "34015-8");
    expect(furcationComps).toHaveLength(0);
  });

  it("emits NO perio/furcation/plaque Observation for a clean tooth", () => {
    const b = buildFhirBundle(plaquePayload);
    expect(panelFor(b, "11")).toBeUndefined();
  });

  it("emits plaque components alongside perio-site and furcation components on the SAME panel when all three are charted", () => {
    const payload: OdontogramExportPayload = {
      version: "2.13",
      teeth: {
        "16": {
          toothSelection: "tooth-base",
          perio: { pd: { MB: 4 }, gm: { MB: 0 }, bop: [], sup: [] },
          furcation: { buccal: 2 },
          plaque: ["buccal"],
        },
      },
    };
    const b = buildFhirBundle(payload);
    const panels = obsOf(b).filter((o) => o.code.coding?.some((c) => c.system === LOINC && c.code === "74029-0"));
    expect(panels).toHaveLength(1);
    const panel = panels[0];
    expect((panel.component ?? []).some((c: any) => c.code.coding?.[0]?.code === "32910-2")).toBe(true);
    expect((panel.component ?? []).some((c: any) => c.code.coding?.[0]?.code === "34015-8")).toBe(true);
    expect((panel.component ?? []).some((c: any) => c.code.coding?.[0]?.code === "plaque-surface")).toBe(true);
  });

  it("tolerates a malformed/foreign plaque shape without throwing and emits nothing", () => {
    const garbage: OdontogramExportPayload = {
      version: "2.13",
      teeth: {
        // @ts-expect-error intentional malformed input
        "31": { toothSelection: "tooth-base", plaque: "nope" },
        "32": { toothSelection: "tooth-base", plaque: [] },
      },
    };
    expect(() => buildFhirBundle(garbage)).not.toThrow();
    const b = buildFhirBundle(garbage);
    expect(panelFor(b, "31")).toBeUndefined();
    expect(panelFor(b, "32")).toBeUndefined();
  });
});

describe("existing (no-plaque) FHIR golden stays byte-identical", () => {
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
