// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { LOCAL_VALUE_MAPS, LOCAL_SYSTEM, FDI_SYSTEM } from "../fhir/codesystems";

// Mirror of the engine's VALID_* sets (src/odontogram.ts:2145-2153).
// Kept here so the test fails loudly if a new enum value is added without a code.
const EXPECTED = {
  toothSelection: ["none","tooth-base","milktooth","implant","tooth-under-gum","no-tooth-after-extraction"],
  endo: ["none","endo-medical-filling","endo-filling","endo-filling-incomplete","endo-glass-pin","endo-metal-pin"],
  fillingMaterial: ["none","amalgam","composite","gic","temporary"],
  mobility: ["none","m1","m2","m3"],
  mods: ["inflammation","parodontal","mobility"],
  periapicalType: ["none","granuloma","cyst","abscess"],
  caries: ["caries-subcrown","caries-buccal","caries-lingual","caries-mesial","caries-distal","caries-occlusal"],
  fillingSurfaces: ["buccal","lingual","mesial","distal","occlusal"],
} as const;

describe("FHIR code systems", () => {
  it("exposes stable canonical URLs", () => {
    expect(LOCAL_SYSTEM).toMatch(/^https?:\/\//);
    expect(FDI_SYSTEM).toMatch(/iso|fdi|3950/i);
  });

  it("maps every enum value to a non-empty local code and display", () => {
    for (const [group, values] of Object.entries(EXPECTED)) {
      const map = LOCAL_VALUE_MAPS[group as keyof typeof LOCAL_VALUE_MAPS];
      expect(map, `missing value map for ${group}`).toBeDefined();
      for (const v of values) {
        const entry = map[v];
        expect(entry, `missing code for ${group}.${v}`).toBeDefined();
        expect(entry.code.length).toBeGreaterThan(0);
        expect(entry.display.length).toBeGreaterThan(0);
      }
    }
  });
});

import { FIELD_MAPPINGS } from "../fhir/fieldMappings";
import { LOCAL_VALUE_MAPS as MAPS } from "../fhir/codesystems";

describe("FHIR field mappings", () => {
  it("references only known value-map groups", () => {
    for (const m of FIELD_MAPPINGS) {
      if (m.kind !== "boolean") {
        expect(MAPS[m.valueGroup], `unknown valueGroup ${m.valueGroup}`).toBeDefined();
      }
      expect(m.findingCode.length).toBeGreaterThan(0);
      expect(m.findingDisplay.length).toBeGreaterThan(0);
    }
  });

  it("covers every serialized tooth field (mapped, surface, or special-cased)", () => {
    const mapped = new Set(FIELD_MAPPINGS.map((m) => m.field));
    const surfaceFields = new Set(
      FIELD_MAPPINGS.flatMap((m) => (m.kind === "restoration" ? [m.surfacesField] : [])),
    );
    // Handled outside FIELD_MAPPINGS by design (special-cased in buildFhirBundle):
    // fillingSurfaceMaterials is consumed inline by the restoration emitter (per-surface materials).
    // Handled outside FIELD_MAPPINGS by design: fillingSurfaceMaterials (consumed
    // inline by the restoration emitter) + caries depth. Task 4 retired the legacy
    // `crownMaterial`/`bridgeUnit` fields entirely (from state, serialize, and the
    // `bridgeUnit` FHIR mapping) — neither is emitted by serializeState() anymore.
    const SPECIAL = new Set(["customStates", "note", "fillingSurfaceMaterials", "cariesActiveDepth", "cariesDepths"]);
    // Full output of serializeState():
    const SERIALIZED = [
      "toothSelection", "pulpDx", "pulpLatin", "apicalDx", "endoResection", "mods", "periapicalType", "endo", "caries",
      "cariesActiveDepth", "cariesDepths", "calculus", "resorptionType",
      "fillingMaterial", "fillingSurfaces", "fillingSurfaceMaterials", "fissureSealing", "contactMesial", "contactDistal",
      "wearEdge", "wearCervical", "brokenMesial", "brokenIncisal", "brokenDistal",
      "extractionWound", "extractionPlan", "parapulpalPin", "crownReplace", "crownNeeded",
      "missingClosed", "bridgePillar", "prosthesis", "mobility",
      "toothSubstrate", "restorationType", "restorationMaterial", "crownLeakage",
      "customStates", "note",
    ];
    for (const f of SERIALIZED) {
      expect(
        mapped.has(f) || surfaceFields.has(f) || SPECIAL.has(f),
        `serialized field "${f}" is not covered by the FHIR export`,
      ).toBe(true);
    }
    expect(new Set(FIELD_MAPPINGS.map((m) => m.field)).size).toBe(FIELD_MAPPINGS.length); // no duplicates
  });
});

import { buildFhirBundle } from "../fhir/toFhir";
import type { OdontogramExportPayload } from "../fhir/types";

const emptyPayload: OdontogramExportPayload = { version: "1.3", globals: {}, teeth: {} };

describe("buildFhirBundle — skeleton & subject", () => {
  it("returns a valid empty collection Bundle with a placeholder Patient", () => {
    const b = buildFhirBundle(emptyPayload);
    expect(b.resourceType).toBe("Bundle");
    expect(b.type).toBe("collection");
    const patients = (b.entry ?? []).filter((e) => e.resource?.resourceType === "Patient");
    expect(patients).toHaveLength(1);
  });

  it("uses the supplied subject and omits the placeholder Patient", () => {
    const b = buildFhirBundle(emptyPayload, { subject: "Patient/abc" });
    const patients = (b.entry ?? []).filter((e) => e.resource?.resourceType === "Patient");
    expect(patients).toHaveLength(0);
  });

  it("never throws on null/garbage input", () => {
    // Note: directive omitted on the null case because this engine's tsconfig
    // uses `strict: false`, so `null` is assignable here and would make
    // `@ts-expect-error` unused (TS2578). The runtime assertion is unchanged.
    expect(() => buildFhirBundle(null as unknown as OdontogramExportPayload)).not.toThrow();
    // @ts-expect-error intentional bad input
    const b = buildFhirBundle({ teeth: "nope" });
    expect(b.resourceType).toBe("Bundle");
  });
});

import { LOCAL_SYSTEM as LS, FDI_SYSTEM as FS } from "../fhir/codesystems";

function obsOf(b: ReturnType<typeof buildFhirBundle>) {
  return (b.entry ?? []).map((e) => e.resource).filter((r): r is NonNullable<typeof r> => r?.resourceType === "Observation") as import("fhir/r4").Observation[];
}

describe("buildFhirBundle — review fixes", () => {
  it("emits a chart-level edentulous Observation (no bodySite) when globals.edentulous is true", () => {
    const b = buildFhirBundle({ version: "1.3", globals: { edentulous: true }, teeth: {} });
    const ed = obsOf(b).find((o) => o.code.coding?.[0].code === "edentulous");
    expect(ed).toBeDefined();
    expect(ed?.valueBoolean).toBe(true);
    expect(ed?.bodySite).toBeUndefined();
  });

  it("does not emit edentulous when the flag is false/absent", () => {
    const b = buildFhirBundle({ version: "1.3", globals: { edentulous: false }, teeth: {} });
    expect(obsOf(b).some((o) => o.code.coding?.[0].code === "edentulous")).toBe(false);
  });

  it("maps primitive customStates and skips non-primitive shapes", () => {
    const b = buildFhirBundle({
      version: "1.3",
      teeth: { "11": { customStates: { pluginA: "hello", pluginB: 3, pluginC: true, pluginD: { nested: 1 } } } },
    });
    const custom = obsOf(b).filter((o) => o.code.coding?.[0].code?.startsWith("custom-state:"));
    expect(custom).toHaveLength(3); // pluginD (object) skipped
    expect(custom.find((o) => o.code.coding?.[0].code === "custom-state:pluginA")?.valueString).toBe("hello");
    expect(custom.find((o) => o.code.coding?.[0].code === "custom-state:pluginB")?.valueQuantity?.value).toBe(3);
    expect(custom.find((o) => o.code.coding?.[0].code === "custom-state:pluginC")?.valueBoolean).toBe(true);
  });

  it("gives set components an explicit valueBoolean and restoration components a per-surface material", () => {
    const b = buildFhirBundle({
      version: "1.3",
      teeth: { "21": { caries: ["caries-mesial"], fillingMaterial: "composite", fillingSurfaces: ["occlusal"] } },
    });
    const caries = obsOf(b).find((o) => o.code.coding?.[0].code === "caries");
    expect(caries?.component?.[0].valueBoolean).toBe(true);
    const rest = obsOf(b).find((o) => o.code.coding?.[0].code === "restoration");
    expect(rest?.component?.[0].code.coding?.[0].code).toBe("occlusal");
    expect(rest?.component?.[0].valueCodeableConcept?.coding?.[0].code).toBe("composite");
  });

  it("gives the placeholder Patient a fullUrl that every Observation.subject resolves to", () => {
    const b = buildFhirBundle({ version: "1.3", teeth: { "11": { mobility: "m1" } } });
    const patientEntry = (b.entry ?? []).find((e) => e.resource?.resourceType === "Patient");
    // Absolute, deterministic fullUrl (issue #23: `urn:uuid:` needs a real UUID).
    expect(patientEntry?.fullUrl).toBe("https://github.com/ZoliQua/React-Advanced-Odontogram/fhir/Patient/odontogram-subject");
    const obs = obsOf(b);
    expect(obs.length).toBeGreaterThan(0);
    for (const o of obs) {
      expect(o.subject?.reference).toBe("https://github.com/ZoliQua/React-Advanced-Odontogram/fhir/Patient/odontogram-subject");
    }
  });
});

describe("buildFhirBundle — mapping behavior", () => {
  it("emits an enum finding with correct tooth bodySite and skips defaults", () => {
    const b = buildFhirBundle({
      version: "1.3",
      teeth: {
        "11": { toothSelection: "implant" },
        "12": { toothSelection: "tooth-base" }, // default -> skipped
      },
    });
    const obs = obsOf(b);
    expect(obs).toHaveLength(1);
    expect(obs[0].bodySite?.coding?.[0].system).toBe(FS);
    expect(obs[0].bodySite?.coding?.[0].code).toBe("11");
    expect(obs[0].valueCodeableConcept?.coding?.[0].system).toBe(LS);
    expect(obs[0].valueCodeableConcept?.coding?.[0].code).toBe("implant");
  });

  it("emits caries as one Observation with a component per surface", () => {
    const b = buildFhirBundle({ version: "1.3", teeth: { "21": { caries: ["caries-mesial", "caries-occlusal"] } } });
    const caries = obsOf(b).filter((o) => o.code.coding?.[0].code === "caries");
    expect(caries).toHaveLength(1);
    expect(caries[0].component).toHaveLength(2);
    expect(caries[0].component?.map((c) => c.code.coding?.[0].code).sort()).toEqual(["caries-mesial", "caries-occlusal"]);
  });

  it("emits restoration with per-surface material components", () => {
    const b = buildFhirBundle({ version: "1.3", teeth: { "36": { fillingMaterial: "composite", fillingSurfaces: ["occlusal"] } } });
    const r = obsOf(b).filter((o) => o.code.coding?.[0].code === "restoration");
    expect(r).toHaveLength(1);
    // No top-level material value; material lives on each surface component.
    expect(r[0].valueCodeableConcept).toBeUndefined();
    expect(r[0].component?.[0].code.coding?.[0].code).toBe("occlusal");
    expect(r[0].component?.[0].valueCodeableConcept?.coding?.[0].code).toBe("composite");
  });

  it("emits boolean findings only when true", () => {
    const b = buildFhirBundle({ version: "1.3", teeth: { "46": { extractionPlan: true, crownNeeded: false } } });
    const codes = obsOf(b).map((o) => o.code.coding?.[0].code);
    expect(codes).toContain("extraction-planned");
    expect(codes).not.toContain("crown-needed");
  });

  it("attaches per-tooth note as an Observation note", () => {
    const b = buildFhirBundle({ version: "1.3", teeth: { "11": { note: "watch this tooth" } } });
    const note = obsOf(b).find((o) => o.code.coding?.[0].code === "tooth-note");
    expect(note?.note?.[0].text).toBe("watch this tooth");
  });

  it("tolerates unknown enum values via a local code, no throw", () => {
    const b = buildFhirBundle({ version: "2.0", teeth: { "11": { restorationMaterial: "future-material-xyz" } } });
    const cm = obsOf(b).find((o) => o.code.coding?.[0].code === "restoration-material");
    expect(cm?.valueCodeableConcept?.coding?.[0].code).toBe("future-material-xyz");
  });

  it("always includes a local coding and a status on every Observation", () => {
    const b = buildFhirBundle({ version: "1.3", teeth: { "11": { mobility: "m2" } } });
    for (const o of obsOf(b)) {
      expect(o.status).toBe("final");
      expect(o.code.coding?.some((c) => c.system === LS)).toBe(true);
    }
  });
});

describe("buildFhirBundle — per-surface restoration materials", () => {
  it("emits one component per surface carrying that surface's material", () => {
    const b = buildFhirBundle({
      version: "1.4",
      teeth: { "36": { fillingSurfaceMaterials: { buccal: "amalgam", distal: "composite" } } },
    });
    const rest = obsOf(b).find((o) => o.code.coding?.[0].code === "restoration");
    expect(rest).toBeDefined();
    const comps = rest?.component ?? [];
    expect(comps).toHaveLength(2);
    const bySurface = Object.fromEntries(
      comps.map((c) => [c.code.coding?.[0].code, c.valueCodeableConcept?.coding?.[0].code]),
    );
    expect(bySurface["buccal"]).toBe("amalgam");
    expect(bySurface["distal"]).toBe("composite");
  });

  it("still maps legacy single-material restorations (fillingMaterial + fillingSurfaces)", () => {
    const b = buildFhirBundle({
      version: "1.3",
      teeth: { "36": { fillingMaterial: "composite", fillingSurfaces: ["occlusal"] } },
    });
    const rest = obsOf(b).find((o) => o.code.coding?.[0].code === "restoration");
    expect(rest?.component?.[0].code.coding?.[0].code).toBe("occlusal");
    expect(rest?.component?.[0].valueCodeableConcept?.coding?.[0].code).toBe("composite");
  });
});
