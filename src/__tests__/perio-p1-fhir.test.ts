// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildFhirBundle } from "../fhir/toFhir";
import { payloadCases } from "./parity/matrix";
import { FDI_SYSTEM, LOCAL_SYSTEM } from "../fhir/codesystems";
import type { OdontogramExportPayload } from "../fhir/types";

// SP-perio P1 Task 3: per-site FHIR Observation export. See
// .superpowers/sdd/task-3-brief.md for the exact LOINC codes/shape.
//
// SP-perio P1 review fix: FHIR R4's Observation.component has no `bodySite`
// element (R5-only) — the fix carries the tooth+probe-site CodeableConcept
// via HL7's published R4 backport extension instead, so these assertions
// read it back from `component.extension[...].valueCodeableConcept` rather
// than a (R4-illegal) `component.bodySite`.
const LOINC = "http://loinc.org";
const COMPONENT_BODYSITE_EXTENSION_URL =
  "http://hl7.org/fhir/5.0/StructureDefinition/extension-Observation.component.bodySite";

/** Read back the tooth+probe-site CodeableConcept carried on a component via
 *  the R4 backport extension (see COMPONENT_BODYSITE_EXTENSION_URL above). */
function componentBodySite(c: any): import("fhir/r4").CodeableConcept {
  return c.extension?.find((e: any) => e.url === COMPONENT_BODYSITE_EXTENSION_URL)?.valueCodeableConcept;
}

const testFileUrl = import.meta.url;
const readGolden = (name: string) =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`./parity/${name}`, testFileUrl)), "utf8"));

function obsOf(b: ReturnType<typeof buildFhirBundle>) {
  return (b.entry ?? []).map((e) => e.resource).filter((r): r is NonNullable<typeof r> => r?.resourceType === "Observation") as import("fhir/r4").Observation[];
}

function panelFor(b: ReturnType<typeof buildFhirBundle>, tooth: string) {
  return obsOf(b).find(
    (o) => o.code.coding?.some((c) => c.system === LOINC && c.code === "74029-0") && o.bodySite?.coding?.[0]?.code === tooth,
  );
}

const perioPayload: OdontogramExportPayload = {
  version: "2.12",
  teeth: {
    // MB has no recession (gm 0); B bleeds AND has recession (gm > 0);
    // ML has a NEGATIVE gm offset (gingiva coronal to CEJ) — no recession
    // component, and proves CAL can be less than PD.
    "26": {
      toothSelection: "tooth-base",
      perio: {
        pd: { MB: 3, B: 5, ML: 4 },
        gm: { MB: 0, B: 2, ML: -1 },
        bop: ["B"],
        sup: [],
      },
    },
    // No perio charted at all on this tooth -> must emit NO perio Observation.
    "11": { toothSelection: "tooth-base" },
  },
};

describe("appendPerioObservations — periodontal panel export", () => {
  it("emits exactly one periodontal-panel Observation for the tooth with charted sites", () => {
    const b = buildFhirBundle(perioPayload);
    const panels = obsOf(b).filter((o) => o.code.coding?.some((c) => c.system === LOINC && c.code === "74029-0"));
    expect(panels).toHaveLength(1);
    expect(panels[0].bodySite?.coding?.[0]).toEqual({ system: FDI_SYSTEM, code: "26" });
  });

  it("emits NO perio Observation for a tooth with no charted sites", () => {
    const b = buildFhirBundle(perioPayload);
    expect(panelFor(b, "11")).toBeUndefined();
  });

  it("mirrors the standard Observation conventions (status/subject/category)", () => {
    const b = buildFhirBundle(perioPayload);
    const panel = panelFor(b, "26")!;
    expect(panel.resourceType).toBe("Observation");
    expect(panel.status).toBe("final");
    expect(panel.subject?.reference).toBe("https://github.com/ZoliQua/React-Advanced-Odontogram/fhir/Patient/odontogram-subject");
    expect(panel.category?.[0]?.coding?.[0]?.code).toBe("exam");
  });

  it("emits a PD component (LOINC 32910-2, mm) per charted site with the correct bodySite", () => {
    const b = buildFhirBundle(perioPayload);
    const panel = panelFor(b, "26")!;
    const pdComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "32910-2");
    expect(pdComps).toHaveLength(3);
    const bySite = Object.fromEntries(pdComps.map((c: any) => [componentBodySite(c).coding[1].code, c.valueQuantity]));
    expect(bySite["perio-site:MB"]).toEqual({ value: 3, unit: "mm" });
    expect(bySite["perio-site:B"]).toEqual({ value: 5, unit: "mm" });
    expect(bySite["perio-site:ML"]).toEqual({ value: 4, unit: "mm" });
    for (const c of pdComps as any[]) {
      expect(c.code.coding[0].system).toBe(LOINC);
      expect(componentBodySite(c).coding[0]).toEqual({ system: FDI_SYSTEM, code: "26" });
      expect(componentBodySite(c).coding[1].system).toBe(LOCAL_SYSTEM);
    }
  });

  it("emits a recession component (LOINC 32911-0, mm) ONLY for sites with gm > 0", () => {
    const b = buildFhirBundle(perioPayload);
    const panel = panelFor(b, "26")!;
    const recComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "32911-0");
    expect(recComps).toHaveLength(1); // only "B" (gm=2); MB (gm=0) and ML (gm=-1) are excluded
    expect(componentBodySite(recComps[0] as any).coding[1].code).toBe("perio-site:B");
    expect((recComps[0] as any).valueQuantity).toEqual({ value: 2, unit: "mm" });
  });

  it("emits a derived CAL component (LOINC 32912-8, mm = pd + gm) for every charted site", () => {
    const b = buildFhirBundle(perioPayload);
    const panel = panelFor(b, "26")!;
    const calComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "32912-8");
    expect(calComps).toHaveLength(3);
    const bySite = Object.fromEntries(calComps.map((c: any) => [componentBodySite(c).coding[1].code, c.valueQuantity.value]));
    expect(bySite["perio-site:MB"]).toBe(3); // 3 + 0
    expect(bySite["perio-site:B"]).toBe(7);  // 5 + 2
    expect(bySite["perio-site:ML"]).toBe(3); // 4 + (-1) — CAL can be < PD
  });

  it("emits a boolean BOP component (no dedicated LOINC) for every charted site, true only where bled", () => {
    const b = buildFhirBundle(perioPayload);
    const panel = panelFor(b, "26")!;
    const bopComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "perio-bop");
    expect(bopComps).toHaveLength(3);
    // No LOINC coding on this component — documented as having no dedicated code.
    for (const c of bopComps as any[]) expect(c.code.coding?.[0]?.system).toBe(LOCAL_SYSTEM);
    const bySite = Object.fromEntries(bopComps.map((c: any) => [componentBodySite(c).coding[1].code, c.valueBoolean]));
    expect(bySite["perio-site:MB"]).toBe(false);
    expect(bySite["perio-site:B"]).toBe(true);
    expect(bySite["perio-site:ML"]).toBe(false);
  });

  it("tolerates malformed/empty perio shapes without throwing and emits nothing", () => {
    const garbage: OdontogramExportPayload = {
      version: "2.12",
      teeth: {
        "31": { toothSelection: "tooth-base", perio: { pd: {}, gm: {}, bop: [], sup: [] } },
        // @ts-expect-error intentional malformed input
        "32": { toothSelection: "tooth-base", perio: { pd: "nope" } },
      },
    };
    expect(() => buildFhirBundle(garbage)).not.toThrow();
    const b = buildFhirBundle(garbage);
    expect(panelFor(b, "31")).toBeUndefined();
    expect(panelFor(b, "32")).toBeUndefined();
  });

  it("respects an explicit subject option instead of the placeholder", () => {
    const b = buildFhirBundle(perioPayload, { subject: "Patient/xyz" });
    const panel = panelFor(b, "26")!;
    expect(panel.subject?.reference).toBe("Patient/xyz");
  });
});

describe("appendPerioObservations — existing (no-perio) FHIR golden stays byte-identical", () => {
  it("matches fhir-golden.json exactly for every existing parity payload case", () => {
    const golden = readGolden("fhir-golden.json");
    payloadCases().forEach((p, i) => {
      expect(buildFhirBundle(p.payload), p.name).toEqual(golden[i].bundle);
    });
  });
});
