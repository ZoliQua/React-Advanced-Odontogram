// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP4 Task 1: pulp/apical/resorption diagnosis axes — additive registry
// scaffolding only (no render/UI wiring yet; see later SP4 tasks). Verifies
// the 4 new VALID_* sets and that AXES/FIELD_MAPPINGS stay 1:1 after adding
// them. See docs/superpowers/specs/2026-07-13-odontogram-sp4-endo-pulp-diagnosis-design.md.
import { describe, it, expect } from "vitest";
import {
  VALID_PULP_DX, VALID_PULP_LATIN, VALID_APICAL_DX, VALID_RESORPTION_TYPE,
} from "../../odontogram";
import { AXES } from "../axes";
import { FIELD_MAPPINGS } from "../../fhir/fieldMappings";

describe("SP4 Task 1: diagnosis axes VALID_* sets", () => {
  it("VALID_PULP_DX has the 4 canonical AAE-parent values", () => {
    expect(VALID_PULP_DX).toEqual(new Set([
      "normal", "reversible-pulpitis", "irreversible-pulpitis", "necrosis",
    ]));
  });

  it("VALID_PULP_LATIN has the 9 practical-Latin subtypes + none", () => {
    expect(VALID_PULP_LATIN).toEqual(new Set([
      "none", "pulpa-sana", "hyperaemia-pulpae", "pulpitis-acuta-serosa",
      "pulpitis-acuta-purulenta", "pulpitis-chronica-clausa", "pulpitis-chronica-ulcerosa",
      "pulpitis-chronica-hyperplastica", "necrosis-pulpae", "gangraena-pulpae",
    ]));
  });

  it("VALID_APICAL_DX has the AAE apical diagnosis values", () => {
    expect(VALID_APICAL_DX).toEqual(new Set([
      "normal", "symptomatic-apical-periodontitis", "asymptomatic-apical-periodontitis",
      "acute-apical-abscess", "chronic-apical-abscess", "condensing-osteitis",
    ]));
  });

  it("VALID_RESORPTION_TYPE has none/internal/external-cervical", () => {
    expect(VALID_RESORPTION_TYPE).toEqual(new Set(["none", "internal", "external-cervical"]));
  });
});

describe("SP4 Task 1: registry catalog stays 1:1 after adding the 4 diagnosis axes", () => {
  it("AXES.length === FIELD_MAPPINGS.length", () => {
    expect(AXES.length).toBe(FIELD_MAPPINGS.length);
  });

  it("each new axis has a matching FIELD_MAPPINGS row (finding code, kind, valueGroup, skipValue)", () => {
    for (const field of ["pulpDx", "pulpLatin", "apicalDx", "resorptionType"]) {
      const ax = AXES.find(a => a.field === field);
      const m = FIELD_MAPPINGS.find(f => f.field === field);
      expect(ax, field).toBeTruthy();
      expect(m, field).toBeTruthy();
      expect(ax!.finding.local).toBe(m!.findingCode);
      expect(ax!.finding.display).toBe(m!.findingDisplay);
      expect(ax!.kind).toBe(m!.kind);
      expect(ax!.valueGroup).toBe((m as { valueGroup?: string }).valueGroup);
      expect(ax!.skipValue).toBe((m as { skipValue?: string }).skipValue);
    }
  });

  it("pulpLatin carries the latinPulpDetail flag (unused until a later SP4 task)", () => {
    const ax = AXES.find(a => a.id === "pulpLatin");
    expect(ax?.flag).toBe("latinPulpDetail");
  });

  it("resorptionType applies only to a present tooth and does not gate pulpDx/apicalDx svgLayer", () => {
    const resorption = AXES.find(a => a.id === "resorptionType");
    const pulpDx = AXES.find(a => a.id === "pulpDx");
    const apicalDx = AXES.find(a => a.id === "apicalDx");
    expect(resorption?.svgLayer).toBe("endo-resorption");
    expect(resorption?.appliesWhen?.({ toothPresent: true } as never, {} as never)).toBe(true);
    expect(resorption?.appliesWhen?.({ toothPresent: false } as never, {} as never)).toBe(false);
    // Bespoke render lands in a later SP4 task — no svgLayer yet.
    expect(pulpDx?.svgLayer).toBeUndefined();
    expect(apicalDx?.svgLayer).toBeUndefined();
  });
});

import { optionsFor } from "../uiOptions";

describe("SP7 Task 1: periapicalType uiOptions drop abscess (kept in values for import)", () => {
  it("offers only none/granuloma/cyst", () => {
    const vals = optionsFor("periapicalType").map(o => o.value);
    expect(vals).toEqual(["none", "granuloma", "cyst"]);
    expect(vals).not.toContain("abscess");
  });
});
