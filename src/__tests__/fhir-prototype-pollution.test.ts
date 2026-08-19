// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, afterEach } from "vitest";
import { parseFhirBundle } from "../fhir/fromFhir";
import { LOCAL_SYSTEM } from "../fhir/codesystems";

// Regression: a crafted FHIR bundle whose bodySite carries the tooth code
// "__proto__" used to reach ensureTooth, where `if (!teeth["__proto__"])` is
// falsy (it resolves to Object.prototype), so ensureTooth returned
// Object.prototype and the subsequent `rec.note = ...` write leaked onto it —
// realm-wide prototype pollution triggered by importing untrusted FHIR.

function bundleWithToothNote(toothCode: string, text: string) {
  return {
    resourceType: "Bundle",
    type: "collection",
    entry: [
      {
        resource: {
          resourceType: "Observation",
          status: "final",
          code: { coding: [{ system: LOCAL_SYSTEM, code: "tooth-note" }] },
          bodySite: { coding: [{ system: "urn:iso:std:iso:3950", code: toothCode }] },
          note: [{ text }],
        },
      },
    ],
  };
}

describe("FHIR import: prototype-pollution guard", () => {
  afterEach(() => {
    // Belt and suspenders: if a regression ever pollutes, don't leak into others.
    delete (Object.prototype as Record<string, unknown>).note;
  });

  it("ignores a __proto__ bodySite code and never pollutes Object.prototype", () => {
    const parsed = parseFhirBundle(bundleWithToothNote("__proto__", "polluted")) as {
      teeth: Record<string, unknown>;
    };
    // No global pollution: a fresh object has no `note`.
    expect((({}) as Record<string, unknown>).note).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(Object.prototype, "note")).toBe(false);
    // The bogus tooth is dropped, not stored as a key.
    expect(Object.prototype.hasOwnProperty.call(parsed.teeth, "__proto__")).toBe(false);
  });

  it("still imports a note on a valid FDI tooth", () => {
    const parsed = parseFhirBundle(bundleWithToothNote("11", "hello")) as {
      teeth: Record<string, { note?: string }>;
    };
    expect(parsed.teeth["11"]?.note).toBe("hello");
  });

  it("rejects the other prototype-polluting keys too (constructor)", () => {
    const parsed = parseFhirBundle(bundleWithToothNote("constructor", "nope")) as {
      teeth: Record<string, unknown>;
    };
    expect(Object.prototype.hasOwnProperty.call(parsed.teeth, "constructor")).toBe(false);
    // A plain object's constructor is still the Object constructor, untouched.
    expect(({}).constructor).toBe(Object);
  });
});
