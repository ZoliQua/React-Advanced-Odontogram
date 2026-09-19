// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { VALID_PROSTHESIS } from "../../odontogram";
import { AXES } from "../axes";
import { FIELD_MAPPINGS } from "../../fhir/fieldMappings";
import { LOCAL_VALUE_MAPS } from "../../fhir/codesystems";
import { buildFhirBundle } from "../../fhir/toFhir";
import { parseFhirBundle } from "../../fhir/fromFhir";

describe("prosthesis axis (SP3b foundation)", () => {
  it("VALID_PROSTHESIS has the 8 expected values", () => {
    expect(VALID_PROSTHESIS).toEqual(new Set([
      "none",
      "healing-abutment",
      "locator",
      "locator-denture",
      "bar",
      "bar-denture",
      "removable-partial",
      "removable-full",
    ]));
  });

  it("has a matching LOCAL_VALUE_MAPS.prosthesis entry for every VALID_PROSTHESIS value", () => {
    expect(Object.keys(LOCAL_VALUE_MAPS.prosthesis).sort()).toEqual([...VALID_PROSTHESIS].sort());
  });

  it("AXES and FIELD_MAPPINGS stay 1:1 (structural parity) after adding prosthesis", () => {
    expect(AXES.length).toBe(FIELD_MAPPINGS.length);

    const mapping = FIELD_MAPPINGS.find(m => m.field === "prosthesis");
    expect(mapping).toBeTruthy();
    expect(mapping!.kind).toBe("enum");
    expect(mapping!.findingCode).toBe("prosthesis-type");
    expect(mapping!.findingDisplay).toBe("Prosthesis / attachment");

    const axis = AXES.find(a => a.id === "prosthesis");
    expect(axis).toBeTruthy();
    expect(axis!.field).toBe("prosthesis");
    expect(axis!.kind).toBe("enum");
    expect(axis!.valueGroup).toBe("prosthesis");
    expect(axis!.skipValue).toBe("none");
    expect(axis!.finding.local).toBe("prosthesis-type");
    expect(axis!.finding.display).toBe("Prosthesis / attachment");
  });
});

// Task 4: with `bridgeUnit` retired, `prosthesis` is now the only axis carrying
// implant-attachment / removable-denture state. Before the prosthesis axis
// existed (SP3a), a payload authored with `crownMaterial` on an implant tooth
// FHIR round-tripped to nothing (crownMaterial was never FHIR-mapped) — this
// pins down that a payload authored on the (now sole) `prosthesis` field
// round-trips losslessly through export -> import.
describe("prosthesis axis FHIR round-trip (Task 4 — implant attachments no longer dropped)", () => {
  it("healing-abutment/locator/bar implant attachments survive buildFhirBundle -> parseFhirBundle", () => {
    const payload = {
      version: "2.1",
      teeth: {
        "14": { toothSelection: "implant", prosthesis: "healing-abutment" },
        "15": { toothSelection: "implant", prosthesis: "locator" },
        "16": { toothSelection: "implant", prosthesis: "locator-denture" },
        "17": { toothSelection: "implant", prosthesis: "bar" },
        "18": { toothSelection: "implant", prosthesis: "bar-denture" },
      },
    };
    const bundle = buildFhirBundle(payload as never);
    const out = parseFhirBundle(bundle);
    expect(out.teeth["14"].prosthesis).toBe("healing-abutment");
    expect(out.teeth["15"].prosthesis).toBe("locator");
    expect(out.teeth["16"].prosthesis).toBe("locator-denture");
    expect(out.teeth["17"].prosthesis).toBe("bar");
    expect(out.teeth["18"].prosthesis).toBe("bar-denture");
  });

  it("removable/bar dentures on a gap (none) tooth also survive the round-trip", () => {
    const payload = {
      version: "2.1",
      teeth: {
        "24": { toothSelection: "none", prosthesis: "removable-partial" },
        "25": { toothSelection: "none", prosthesis: "removable-full" },
        "26": { toothSelection: "none", prosthesis: "bar-denture" },
      },
    };
    const out = parseFhirBundle(buildFhirBundle(payload as never));
    expect(out.teeth["24"].prosthesis).toBe("removable-partial");
    expect(out.teeth["25"].prosthesis).toBe("removable-full");
    expect(out.teeth["26"].prosthesis).toBe("bar-denture");
  });
});
