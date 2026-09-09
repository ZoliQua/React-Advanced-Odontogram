// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Issue #23 (HL7 validator): every entry of a `collection` Bundle must carry a
// `fullUrl` (bdl-15), and `urn:uuid:` may only wrap a real RFC 4122 UUID. The
// export now identifies every entry with a deterministic id + an absolute
// https fullUrl under FHIR_BASE. Unit-tests `assignEntryIdentities` on a
// hand-built bundle (ordinal suffix for a repeated key, `case` segment for a
// whole-mouth finding, a pre-set id is honoured, id sanitising), then checks the
// global invariants on a REAL `buildFhirBundle` export.
import { describe, it, expect } from "vitest";
import { buildFhirBundle } from "../fhir/toFhir";
import { assignEntryIdentities, FHIR_BASE, PLACEHOLDER_PATIENT_FULLURL, fhirFullUrl } from "../fhir/primitives";
import { LOCAL_SYSTEM } from "../fhir/codesystems";

const FHIR_ID = /^[A-Za-z0-9.-]{1,64}$/;

function obs(tooth: string | null, code: string, extra: Record<string, unknown> = {}) {
  return {
    resourceType: "Observation",
    status: "final",
    code: { coding: [{ system: LOCAL_SYSTEM, code }] },
    subject: { reference: PLACEHOLDER_PATIENT_FULLURL },
    ...(tooth ? { bodySite: { coding: [{ system: "urn:iso:std:iso:3950", code: tooth }] } } : {}),
    ...extra,
  };
}

describe("assignEntryIdentities (unit)", () => {
  it("derives id + absolute fullUrl from content, with an ordinal suffix for a repeated key", () => {
    const patient = { resourceType: "Patient", id: "odontogram-subject" };
    const bundle: any = {
      resourceType: "Bundle", type: "collection",
      entry: [
        { fullUrl: PLACEHOLDER_PATIENT_FULLURL, resource: patient },   // identified at source — untouched
        { resource: obs("11", "tooth-status") },
        { resource: obs("11", "tooth-status") },                        // same key -> -2
        { resource: obs(null, "edentulous") },                          // whole-mouth -> "case"
        { resource: obs("21", "caries", { id: "my-preset-id" }) },       // pre-set id honoured
        { resource: obs("22", "weird code/with spaces") },               // sanitised
      ],
    };
    assignEntryIdentities(bundle);
    const e = bundle.entry;
    expect(e[0].fullUrl).toBe(PLACEHOLDER_PATIENT_FULLURL);
    expect(e[0].resource.id).toBe("odontogram-subject");
    expect(e[1].resource.id).toBe("odontogram-observation-11-tooth-status");
    expect(e[1].fullUrl).toBe(`${FHIR_BASE}/Observation/odontogram-observation-11-tooth-status`);
    expect(e[2].resource.id).toBe("odontogram-observation-11-tooth-status-2");
    expect(e[3].resource.id).toBe("odontogram-observation-case-edentulous");
    expect(e[4].resource.id).toBe("my-preset-id");
    expect(e[4].fullUrl).toBe(fhirFullUrl("Observation", "my-preset-id"));
    expect(e[5].resource.id).toBe("odontogram-observation-22-weird-code-with-spaces");
    for (const x of e) {
      expect(typeof x.fullUrl).toBe("string");
      expect(x.fullUrl.startsWith("urn:uuid:")).toBe(false);
      expect(x.resource.id).toMatch(FHIR_ID);
    }
    // All fullUrls unique.
    expect(new Set(e.map((x: any) => x.fullUrl)).size).toBe(e.length);
  });

  it("is a no-op on a bundle without entries", () => {
    const b: any = { resourceType: "Bundle", type: "collection" };
    expect(() => assignEntryIdentities(b)).not.toThrow();
  });
});

describe("buildFhirBundle: every entry is identified (HL7 validator bdl-15 / valid UUID)", () => {
  const payload: any = {
    version: "2.22",
    globals: {},
    teeth: {
      "16": { toothSelection: "tooth-base", caries: ["caries-occlusal"] },
      "21": { toothSelection: "implant" },
    },
    case: { caseConditions: { tmjDisorder: "right" } },
  };

  it("gives every entry a non-empty, unique, absolute fullUrl and a valid id — no urn:uuid anywhere", () => {
    const bundle: any = buildFhirBundle(payload);
    expect(bundle.entry.length).toBeGreaterThan(1);
    const fullUrls = bundle.entry.map((e: any) => e.fullUrl);
    for (const [i, e] of bundle.entry.entries()) {
      expect(typeof e.fullUrl, `entry ${i} fullUrl`).toBe("string");
      expect(e.fullUrl.startsWith(`${FHIR_BASE}/`), `entry ${i} absolute`).toBe(true);
      expect(e.resource.id, `entry ${i} id`).toMatch(FHIR_ID);
      expect(e.fullUrl).toBe(fhirFullUrl(e.resource.resourceType, e.resource.id));
    }
    expect(new Set(fullUrls).size).toBe(fullUrls.length);
    expect(JSON.stringify(bundle)).not.toContain("urn:uuid:");
  });

  it("the Patient fullUrl is the subject reference of every Observation/Condition", () => {
    const bundle: any = buildFhirBundle(payload);
    const patient = bundle.entry.find((e: any) => e.resource.resourceType === "Patient");
    expect(patient.fullUrl).toBe(PLACEHOLDER_PATIENT_FULLURL);
    expect(patient.fullUrl).toBe(`${FHIR_BASE}/Patient/odontogram-subject`);
    for (const e of bundle.entry) {
      if (e.resource.resourceType === "Patient" || e.resource.resourceType === "CodeSystem") continue; // a CodeSystem has no subject
      expect(e.resource.subject?.reference).toBe(PLACEHOLDER_PATIENT_FULLURL);
    }
  });

  it("is deterministic — two exports of the same payload yield identical ids/fullUrls", () => {
    const a: any = buildFhirBundle(payload);
    const b: any = buildFhirBundle(payload);
    expect(a.entry.map((e: any) => [e.fullUrl, e.resource.id])).toEqual(b.entry.map((e: any) => [e.fullUrl, e.resource.id]));
  });

  it("honours a host-supplied subject: no placeholder Patient, custom subject, entries still identified", () => {
    const bundle: any = buildFhirBundle(payload, { subject: "Patient/abc-123" } as any);
    expect(bundle.entry.some((e: any) => e.resource.resourceType === "Patient")).toBe(false);
    for (const e of bundle.entry) {
      expect(typeof e.fullUrl).toBe("string");
      if (e.resource.resourceType === "CodeSystem") continue; // no subject on a CodeSystem
      expect(e.resource.subject?.reference).toBe("Patient/abc-123");
    }
  });
});
