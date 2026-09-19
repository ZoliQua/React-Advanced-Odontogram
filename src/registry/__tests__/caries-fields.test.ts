// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP5 Task 1: caries fields foundation — additive registry scaffolding only
// (no render/UI wiring yet; see later SP5 tasks). Mirrors
// diagnosis-axes.test.ts's shape for the new `rootCaries` enum axis, and
// fhir-import.test.ts's cariesDepths round-trip for the new `secondaryCaries`/
// `radiographicDepth` per-surface scalar-map fields (handled exactly like
// `cariesDepths` — special-cased outside AXES/FIELD_MAPPINGS, with their own
// independent FHIR finding codes).
import { describe, it, expect } from "vitest";
import { VALID_ROOT_CARIES, VALID_CARS, VALID_RADIOGRAPHIC_DEPTH, __setToothStateForTest, __getToothStateForTest } from "../../odontogram";
import { AXES } from "../axes";
import { FIELD_MAPPINGS } from "../../fhir/fieldMappings";
import { buildFhirBundle } from "../../fhir/toFhir";
import { parseFhirBundle } from "../../fhir/fromFhir";
import { baseObservation, findingConcept, valueConcept, PLACEHOLDER_PATIENT_FULLURL } from "../../fhir/primitives";

describe("SP5 Task 1: caries fields VALID_* sets", () => {
  it("VALID_ROOT_CARIES has none/active/arrested/active-cavitated", () => {
    expect(VALID_ROOT_CARIES).toEqual(new Set(["none", "active", "arrested", "active-cavitated"]));
  });

  it("VALID_CARS has the 7 CARS scores (0..6)", () => {
    expect(VALID_CARS).toEqual(new Set([0, 1, 2, 3, 4, 5, 6]));
  });

  it("VALID_RADIOGRAPHIC_DEPTH has none/E1/E2/D1/D2/D3", () => {
    expect(VALID_RADIOGRAPHIC_DEPTH).toEqual(new Set(["none", "E1", "E2", "D1", "D2", "D3"]));
  });
});

describe("SP5 Task 1: registry catalog stays 1:1 after adding rootCaries", () => {
  it("AXES.length === FIELD_MAPPINGS.length", () => {
    expect(AXES.length).toBe(FIELD_MAPPINGS.length);
  });

  it("rootCaries has a matching FIELD_MAPPINGS row (finding code, kind, valueGroup, skipValue)", () => {
    const ax = AXES.find(a => a.field === "rootCaries");
    const m = FIELD_MAPPINGS.find(f => f.field === "rootCaries");
    expect(ax).toBeTruthy();
    expect(m).toBeTruthy();
    expect(ax!.finding.local).toBe(m!.findingCode);
    expect(ax!.finding.display).toBe(m!.findingDisplay);
    expect(ax!.kind).toBe(m!.kind);
    expect(ax!.valueGroup).toBe((m as { valueGroup?: string }).valueGroup);
    expect(ax!.skipValue).toBe((m as { skipValue?: string }).skipValue);
  });

  it("rootCaries applies only to a present tooth and carries the caries-root svgLayer", () => {
    const ax = AXES.find(a => a.id === "rootCaries");
    expect(ax?.svgLayer).toBe("caries-root");
    expect(ax?.appliesWhen?.({ toothPresent: true } as never, {} as never)).toBe(true);
    expect(ax?.appliesWhen?.({ toothPresent: false } as never, {} as never)).toBe(false);
  });

  it("secondaryCaries/radiographicDepth have NO AXES/FIELD_MAPPINGS row (special-cased like cariesDepths)", () => {
    expect(AXES.find(a => a.field === "secondaryCaries")).toBeUndefined();
    expect(AXES.find(a => a.field === "radiographicDepth")).toBeUndefined();
    expect(FIELD_MAPPINGS.find(m => m.field === "secondaryCaries")).toBeUndefined();
    expect(FIELD_MAPPINGS.find(m => m.field === "radiographicDepth")).toBeUndefined();
  });
});

describe("SP5 Task 1: FHIR round-trip", () => {
  it("rootCaries survives export -> import losslessly (registered axis)", () => {
    const payload = { version: "2.2", teeth: { "16": { rootCaries: "active-cavitated" } } };
    const bundle = buildFhirBundle(payload as never);
    const codes = (bundle.entry ?? []).map((e) => (e.resource as { code?: { coding?: Array<{ code?: string }> } } | undefined)?.code?.coding?.[0]?.code);
    expect(codes).toContain("root-caries");
    const out = parseFhirBundle(bundle);
    expect(out.teeth["16"].rootCaries).toBe("active-cavitated");
  });

  it("rootCaries is omitted from the bundle when 'none' (skipValue) and does not round-trip a stray value", () => {
    const bundle = buildFhirBundle({ version: "2.2", teeth: { "21": { rootCaries: "none" } } } as never);
    const codes = (bundle.entry ?? []).map((e) => (e.resource as { code?: { coding?: Array<{ code?: string }> } } | undefined)?.code?.coding?.[0]?.code);
    expect(codes).not.toContain("root-caries");
    expect(parseFhirBundle(bundle).teeth["21"]?.rootCaries).toBeUndefined();
  });

  it("cariesSeverity (unified per-surface map) rides on the caries Observation's component valueInteger", () => {
    // SP6 Task 1: the unified severity rides on each caries component as
    // `valueInteger` (replacing the SP5 standalone `secondary-caries`
    // Observation). Only surfaces present in `caries` carry a component.
    const payload = { version: "2.4", teeth: { "37": { caries: ["caries-mesial", "caries-occlusal"], cariesSeverity: { mesial: 4, occlusal: 6 } } } };
    const bundle = buildFhirBundle(payload as never);
    const obs = (bundle.entry ?? []).map((e) => e.resource as { code?: { coding?: Array<{ code?: string }> }; component?: Array<{ code?: { coding?: Array<{ code?: string }> }; valueInteger?: number }> } | undefined)
      .find((o) => o?.code?.coding?.[0]?.code === "caries");
    expect(obs).toBeDefined();
    const bySurface = Object.fromEntries((obs?.component ?? []).map((c) => [c.code?.coding?.[0]?.code?.replace("caries-", ""), c.valueInteger]));
    expect(bySurface).toEqual({ mesial: 4, occlusal: 6 });
    // No standalone secondary-caries finding is emitted anymore.
    const codes = (bundle.entry ?? []).map((e) => (e.resource as { code?: { coding?: Array<{ code?: string }> } } | undefined)?.code?.coding?.[0]?.code);
    expect(codes).not.toContain("secondary-caries");

    const out = parseFhirBundle(bundle);
    expect(out.teeth["37"].cariesSeverity).toEqual({ mesial: 4, occlusal: 6 });
  });

  it("radiographicDepth (per-surface enum map) round-trips through its own Observation", () => {
    const payload = { version: "2.2", teeth: { "26": { radiographicDepth: { distal: "D2", buccal: "E1" } } } };
    const bundle = buildFhirBundle(payload as never);
    const obs = (bundle.entry ?? []).map((e) => e.resource as { code?: { coding?: Array<{ code?: string }> }; component?: Array<{ code?: { coding?: Array<{ code?: string }> }; valueCodeableConcept?: { coding?: Array<{ code?: string }> } }> } | undefined)
      .find((o) => o?.code?.coding?.[0]?.code === "radiographic-caries-depth");
    expect(obs).toBeDefined();
    const bySurface = Object.fromEntries((obs?.component ?? []).map((c) => [c.code?.coding?.[0]?.code, c.valueCodeableConcept?.coding?.[0]?.code]));
    expect(bySurface).toEqual({ distal: "D2", buccal: "E1" });

    const out = parseFhirBundle(bundle);
    expect(out.teeth["26"].radiographicDepth).toEqual({ distal: "D2", buccal: "E1" });
  });

  it("empty/absent secondaryCaries and radiographicDepth emit nothing", () => {
    const bundle = buildFhirBundle({ version: "2.2", teeth: { "11": { secondaryCaries: {}, radiographicDepth: {} } } } as never);
    const codes = (bundle.entry ?? []).map((e) => (e.resource as { code?: { coding?: Array<{ code?: string }> } } | undefined)?.code?.coding?.[0]?.code);
    expect(codes).not.toContain("secondary-caries");
    expect(codes).not.toContain("radiographic-caries-depth");
  });
});

// FIX 1 (final review, silent data loss): a legacy SP5/v1.17.0-era FHIR bundle
// exported recurrent caries as a STANDALONE `secondary-caries` Observation
// (CARS score), separate from the `caries` set's own `valueInteger` (ICDAS
// depth) — see `git show 3c70174:src/registry/fhir.ts`. SP6 retired the
// standalone Observation on the EMIT side (the caries-fields test above,
// "cariesSeverity ... rides on the caries Observation's component
// valueInteger", proves no native bundle emits it), but the IMPORT side had no
// reader for it at all, so re-importing an old bundle silently dropped the
// CARS score and mis-read the ICDAS depth as if it were the unified severity.
// This bundle is hand-crafted (not built via the current `buildFhirBundle`,
// which no longer knows how to produce this legacy shape) to reproduce
// exactly what a 1.17.0 export looked like.
describe("FIX 1 (final review): legacy secondary-caries FHIR import", () => {
  it("a legacy bundle (caries ICDAS depth + filling + standalone secondary-caries CARS) imports the CARS score, not the ICDAS depth", () => {
    const tooth = "26";
    const cariesObs = baseObservation(PLACEHOLDER_PATIENT_FULLURL, tooth, findingConcept("caries", "Dental caries"));
    cariesObs.component = [{ code: valueConcept("caries", "caries-occlusal"), valueInteger: 2 }]; // legacy ICDAS depth
    const fillingObs = baseObservation(PLACEHOLDER_PATIENT_FULLURL, tooth, findingConcept("restoration", "Dental restoration"));
    fillingObs.component = [{ code: valueConcept("fillingSurfaces", "occlusal"), valueCodeableConcept: valueConcept("fillingMaterial", "composite") }];
    const secondaryCariesObs = baseObservation(PLACEHOLDER_PATIENT_FULLURL, tooth, findingConcept("secondary-caries", "Secondary/recurrent caries (CARS)"));
    secondaryCariesObs.component = [{ code: valueConcept("fillingSurfaces", "occlusal"), valueInteger: 5 }]; // CARS score

    const bundle = { resourceType: "Bundle", type: "collection", entry: [
      { resource: cariesObs }, { resource: fillingObs }, { resource: secondaryCariesObs },
    ] };

    const out = parseFhirBundle(bundle as never);
    const rec = out.teeth[tooth];
    expect(rec.caries).toEqual(["caries-occlusal"]);
    expect(rec.fillingSurfaceMaterials).toEqual({ occlusal: "composite" });
    // The retired legacy field is populated (not silently dropped)...
    expect(rec.secondaryCaries).toEqual({ occlusal: 5 });
    // ...and the ambiguous cariesSeverity guess (from the caries component's
    // ICDAS-depth valueInteger) is reconciled away for that surface, so
    // hydrateState's existing raw-source priority picks up the CARS score.
    expect(rec.cariesSeverity).toBeUndefined();

    __setToothStateForTest(26, rec as never, out.version);
    const state = __getToothStateForTest(26);
    expect(state?.cariesSeverity).toEqual({ occlusal: 5 });
  });

  it("bundle entry order does not affect the reconciliation (secondary-caries before the caries Observation)", () => {
    const tooth = "36";
    const cariesObs = baseObservation(PLACEHOLDER_PATIENT_FULLURL, tooth, findingConcept("caries", "Dental caries"));
    cariesObs.component = [{ code: valueConcept("caries", "caries-mesial"), valueInteger: 1 }];
    const fillingObs = baseObservation(PLACEHOLDER_PATIENT_FULLURL, tooth, findingConcept("restoration", "Dental restoration"));
    fillingObs.component = [{ code: valueConcept("fillingSurfaces", "mesial"), valueCodeableConcept: valueConcept("fillingMaterial", "amalgam") }];
    const secondaryCariesObs = baseObservation(PLACEHOLDER_PATIENT_FULLURL, tooth, findingConcept("secondary-caries", "Secondary/recurrent caries (CARS)"));
    secondaryCariesObs.component = [{ code: valueConcept("fillingSurfaces", "mesial"), valueInteger: 6 }];

    const bundle = { resourceType: "Bundle", type: "collection", entry: [
      { resource: secondaryCariesObs }, { resource: fillingObs }, { resource: cariesObs },
    ] };

    const out = parseFhirBundle(bundle as never);
    expect(out.teeth[tooth].secondaryCaries).toEqual({ mesial: 6 });
    expect(out.teeth[tooth].cariesSeverity).toBeUndefined();

    __setToothStateForTest(37, out.teeth[tooth] as never, out.version);
    expect(__getToothStateForTest(37)?.cariesSeverity).toEqual({ mesial: 6 });
  });

  it("a NATIVE (>=2.4) bundle with no secondary-caries Observation is unaffected: cariesSeverity round-trips exactly as before", () => {
    const payload = { version: "2.4", teeth: { "17": { caries: ["caries-distal"], cariesSeverity: { distal: 4 } } } };
    const bundle = buildFhirBundle(payload as never);
    const out = parseFhirBundle(bundle);
    expect(out.teeth["17"].cariesSeverity).toEqual({ distal: 4 });
    expect(out.teeth["17"].secondaryCaries).toBeUndefined();
  });
});
