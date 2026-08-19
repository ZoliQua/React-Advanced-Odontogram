// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio P2b Task 2: furcation involvement (Glickman I-IV, per entrance).
// Data + serialize + FHIR + summary only (the UI row is a later task). See
// .superpowers/sdd/task-2-brief.md for the exact entrance sets / LOINC code.
//
// Pure data-model + FHIR tests — NO UI, NO SVG render (furcation has no
// chart layer yet). Uses the same module-state test seams as the P1 perio
// core tests (__setToothStateForTest operates on the ACTIVE chart;
// __resetChartStateForTest clears both charts + planInitialized + mode
// before every test so module state never leaks).
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  furcationEntrances,
  setFurcation,
  getToothFurcation,
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

describe("furcationEntrances(toothNo) — position-based entrance sets", () => {
  it("upper molars (16/17/18, 26/27/28) -> mesial/distal/buccal", () => {
    expect(furcationEntrances(16)).toEqual(["mesial", "distal", "buccal"]);
    expect(furcationEntrances(17)).toEqual(["mesial", "distal", "buccal"]);
    expect(furcationEntrances(18)).toEqual(["mesial", "distal", "buccal"]);
    expect(furcationEntrances(26)).toEqual(["mesial", "distal", "buccal"]);
    expect(furcationEntrances(27)).toEqual(["mesial", "distal", "buccal"]);
    expect(furcationEntrances(28)).toEqual(["mesial", "distal", "buccal"]);
  });

  it("lower molars (36/37/38, 46/47/48) -> buccal/lingual", () => {
    expect(furcationEntrances(36)).toEqual(["buccal", "lingual"]);
    expect(furcationEntrances(37)).toEqual(["buccal", "lingual"]);
    expect(furcationEntrances(38)).toEqual(["buccal", "lingual"]);
    expect(furcationEntrances(46)).toEqual(["buccal", "lingual"]);
    expect(furcationEntrances(47)).toEqual(["buccal", "lingual"]);
    expect(furcationEntrances(48)).toEqual(["buccal", "lingual"]);
  });

  it("upper FIRST premolars only (14, 24) -> mesial/distal", () => {
    expect(furcationEntrances(14)).toEqual(["mesial", "distal"]);
    expect(furcationEntrances(24)).toEqual(["mesial", "distal"]);
  });

  it("upper SECOND premolars (15, 25) and lower premolars (34/35/44/45) -> []", () => {
    expect(furcationEntrances(15)).toEqual([]);
    expect(furcationEntrances(25)).toEqual([]);
    expect(furcationEntrances(34)).toEqual([]);
    expect(furcationEntrances(35)).toEqual([]);
    expect(furcationEntrances(44)).toEqual([]);
    expect(furcationEntrances(45)).toEqual([]);
  });

  it("anteriors -> []", () => {
    expect(furcationEntrances(11)).toEqual([]);
    expect(furcationEntrances(21)).toEqual([]);
    expect(furcationEntrances(33)).toEqual([]);
    expect(furcationEntrances(43)).toEqual([]);
  });

  it("returns a fresh array each call (safe to mutate)", () => {
    const a = furcationEntrances(16);
    a.push("bogus");
    expect(furcationEntrances(16)).toEqual(["mesial", "distal", "buccal"]);
  });
});

describe("setFurcation / getToothFurcation", () => {
  it("sets a valid entrance+grade for a furcated tooth", () => {
    __setToothStateForTest(16, {});
    setFurcation(16, "buccal", 2);
    expect(getToothFurcation(16).buccal).toBe(2);
  });

  it("sets every valid entrance for an upper molar independently", () => {
    __setToothStateForTest(26, {});
    setFurcation(26, "mesial", 1);
    setFurcation(26, "distal", 3);
    setFurcation(26, "buccal", 4);
    expect(getToothFurcation(26)).toEqual({ mesial: 1, distal: 3, buccal: 4 });
  });

  it("rejects an entrance not valid for this tooth's position (lingual on an upper molar)", () => {
    __setToothStateForTest(16, {});
    setFurcation(16, "lingual", 2);
    expect(getToothFurcation(16)).toEqual({});
  });

  it("rejects any entrance on a non-furcated tooth (anterior)", () => {
    __setToothStateForTest(11, {});
    setFurcation(11, "mesial", 1);
    setFurcation(11, "buccal", 1);
    expect(getToothFurcation(11)).toEqual({});
  });

  it("rejects an unrecognized entrance string outright", () => {
    __setToothStateForTest(16, {});
    setFurcation(16, "occlusal", 2);
    expect(getToothFurcation(16)).toEqual({});
  });

  it("rejects a grade outside 1-4 (0, 5, negative)", () => {
    __setToothStateForTest(16, {});
    setFurcation(16, "buccal", 0);
    expect(getToothFurcation(16).buccal).toBeUndefined();
    setFurcation(16, "buccal", 5);
    expect(getToothFurcation(16).buccal).toBeUndefined();
    setFurcation(16, "buccal", -1);
    expect(getToothFurcation(16).buccal).toBeUndefined();
  });

  it("rejects a non-integer grade", () => {
    __setToothStateForTest(16, {});
    setFurcation(16, "buccal", 2.5);
    expect(getToothFurcation(16).buccal).toBeUndefined();
  });

  it("grade null clears a previously-set entrance", () => {
    __setToothStateForTest(16, {});
    setFurcation(16, "buccal", 3);
    expect(getToothFurcation(16).buccal).toBe(3);
    setFurcation(16, "buccal", null);
    expect(getToothFurcation(16).buccal).toBeUndefined();
    expect(getToothFurcation(16)).toEqual({});
  });

  it("clearing one entrance leaves the others untouched", () => {
    __setToothStateForTest(26, {});
    setFurcation(26, "mesial", 1);
    setFurcation(26, "distal", 2);
    setFurcation(26, "mesial", null);
    expect(getToothFurcation(26)).toEqual({ distal: 2 });
  });

  it("a tooth never touched at all returns {} (never throws)", () => {
    expect(getToothFurcation(16)).toEqual({});
  });
});

describe("payload round-trip (version 2.16)", () => {
  it("set furcation -> serialize -> version 2.16, furcation present only where graded", () => {
    __setToothStateForTest(16, {});
    __setToothStateForTest(11, {}); // no furcation -> must stay omitted
    setFurcation(16, "mesial", 2);
    setFurcation(16, "buccal", 4);

    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    expect(payload.teeth["16"].furcation).toEqual({ mesial: 2, buccal: 4 });
    expect(payload.teeth["11"].furcation).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(payload.teeth["11"], "furcation")).toBe(false);
  });

  it("hydrate restores identical map, as a fresh independent instance", () => {
    __setToothStateForTest(26, {});
    setFurcation(26, "distal", 3);
    const payload = __collectExportPayloadForTest();

    const jsonRoundTrip = JSON.parse(JSON.stringify(payload));

    __resetChartStateForTest();
    __hydrateImportedChartsForTest(jsonRoundTrip);
    expect(getToothFurcation(26)).toEqual({ distal: 3 });
    expect(getToothFurcation(11)).toEqual({});

    // Independence: mutating live re-hydrated state must never reach back
    // into the captured snapshot.
    setFurcation(26, "distal", 1);
    expect(getToothFurcation(26).distal).toBe(1);
    expect(payload.teeth["26"].furcation!.distal).toBe(3);
    expect(jsonRoundTrip.teeth["26"].furcation.distal).toBe(3);
  });

  it("legacy payload (version 2.12, no furcation field) hydrates to empty furcation without throwing", () => {
    const legacyPayload = {
      version: "2.12",
      globals: {},
      teeth: { 16: { toothSelection: "tooth-base" } },
    };
    expect(() => __hydrateImportedChartsForTest(legacyPayload)).not.toThrow();
    expect(getToothFurcation(16)).toEqual({});
  });

  it("a malformed/foreign furcation payload never throws and self-heals", () => {
    const craftedPayload = {
      version: "2.13",
      globals: {},
      teeth: {
        16: {
          toothSelection: "tooth-base",
          furcation: { mesial: 2, occlusal: 3, buccal: 7, distal: 1.5 },
          // occlusal is an unrecognized entrance key -> dropped;
          // buccal=7 out of range -> dropped; distal=1.5 non-integer -> dropped
        },
      },
    };
    expect(() => __hydrateImportedChartsForTest(craftedPayload)).not.toThrow();
    expect(getToothFurcation(16)).toEqual({ mesial: 2 });
  });
});

describe("getPerioSummary().maxFurcation", () => {
  it("is null when nothing is graded anywhere", () => {
    expect(getPerioSummary().maxFurcation).toBeNull();
  });

  it("is the single highest grade across the whole mouth", () => {
    __setToothStateForTest(16, {});
    __setToothStateForTest(46, {});
    setFurcation(16, "buccal", 2);
    setFurcation(46, "lingual", 4);
    setFurcation(46, "buccal", 1);
    expect(getPerioSummary().maxFurcation).toBe(4);
  });

  it("tracks furcation independently of perio-site charting (a furcation-only tooth still counts)", () => {
    __setToothStateForTest(26, {});
    setFurcation(26, "distal", 3);
    expect(getPerioSummary().maxFurcation).toBe(3);
  });
});

describe("dual-state isolation", () => {
  it("set furcation in status, enter plan (clone), edit plan furcation -> status unchanged", () => {
    __setToothStateForTest(16, {});
    setFurcation(16, "buccal", 2);

    setChartMode("plan"); // first entry -> deep clone of status into plan
    setFurcation(16, "buccal", 4); // edit PLAN only
    setFurcation(16, "mesial", 1);

    setChartMode("status");
    expect(getToothFurcation(16)).toEqual({ buccal: 2 });

    setChartMode("plan");
    expect(getToothFurcation(16)).toEqual({ buccal: 4, mesial: 1 });
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

const furcationPayload: OdontogramExportPayload = {
  version: "2.13",
  teeth: {
    "26": {
      toothSelection: "tooth-base",
      furcation: { mesial: 2, distal: 1, buccal: 3 },
    },
    // A perfectly clean tooth -> no perio, no furcation -> no panel at all.
    "11": { toothSelection: "tooth-base" },
  },
};

describe("furcation FHIR export — additional components on the periodontal panel", () => {
  it("emits a furcation component (LOINC 34015-8) per graded entrance, with tooth+entrance bodySite", () => {
    const b = buildFhirBundle(furcationPayload);
    const panel = panelFor(b, "26")!;
    expect(panel).toBeDefined();
    const furcationComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "34015-8");
    expect(furcationComps).toHaveLength(3);
    for (const c of furcationComps as any[]) {
      expect(c.code.coding[0].system).toBe(LOINC);
      expect(componentBodySite(c).coding[0]).toEqual({ system: FDI_SYSTEM, code: "26" });
      expect(componentBodySite(c).coding[1].system).toBe(LOCAL_SYSTEM);
    }
    const bySite = Object.fromEntries(furcationComps.map((c: any) => [componentBodySite(c).coding[1].code, c.valueInteger]));
    expect(bySite["furcation-entrance:mesial"]).toBe(2);
    expect(bySite["furcation-entrance:distal"]).toBe(1);
    expect(bySite["furcation-entrance:buccal"]).toBe(3);
  });

  it("emits the panel (with only furcation components) for a furcation-only tooth (no perio sites)", () => {
    const b = buildFhirBundle(furcationPayload);
    const panels = obsOf(b).filter((o) => o.code.coding?.some((c) => c.system === LOINC && c.code === "74029-0"));
    expect(panels).toHaveLength(1);
    const panel = panels[0];
    const pdComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "32910-2");
    expect(pdComps).toHaveLength(0);
  });

  it("emits NO perio/furcation Observation for a clean tooth (no perio, no furcation)", () => {
    const b = buildFhirBundle(furcationPayload);
    expect(panelFor(b, "11")).toBeUndefined();
  });

  it("emits furcation components alongside perio-site components on the SAME panel when both are charted", () => {
    const payload: OdontogramExportPayload = {
      version: "2.13",
      teeth: {
        "16": {
          toothSelection: "tooth-base",
          perio: { pd: { MB: 4 }, gm: { MB: 0 }, bop: [], sup: [] },
          furcation: { buccal: 2 },
        },
      },
    };
    const b = buildFhirBundle(payload);
    const panels = obsOf(b).filter((o) => o.code.coding?.some((c) => c.system === LOINC && c.code === "74029-0"));
    expect(panels).toHaveLength(1);
    const panel = panels[0];
    expect((panel.component ?? []).some((c: any) => c.code.coding?.[0]?.code === "32910-2")).toBe(true);
    expect((panel.component ?? []).some((c: any) => c.code.coding?.[0]?.code === "34015-8")).toBe(true);
  });

  it("tolerates a malformed/foreign furcation shape without throwing and emits nothing", () => {
    const garbage: OdontogramExportPayload = {
      version: "2.13",
      teeth: {
        // @ts-expect-error intentional malformed input
        "31": { toothSelection: "tooth-base", furcation: "nope" },
        "32": { toothSelection: "tooth-base", furcation: {} },
      },
    };
    expect(() => buildFhirBundle(garbage)).not.toThrow();
    const b = buildFhirBundle(garbage);
    expect(panelFor(b, "31")).toBeUndefined();
    expect(panelFor(b, "32")).toBeUndefined();
  });
});

describe("existing (no-furcation) FHIR golden stays byte-identical", () => {
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
