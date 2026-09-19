// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP3b Task 6: crown-marginal-leakage toggle. The SVG artwork has shipped a
// dormant `crown-leakage` layer since v2.5.0 (never toggled — see
// svg-assets.test.ts's NEW_LEAVES_ALL), but no clinical axis, state field, or
// UI control ever activated it before this task. These tests pin down the new
// axis's render gating (appliesWhen: restorationType ∈ {crown,bridge}), state
// hydration/serialization, and FHIR round-trip — mirroring the patterns used
// for other boolean axes in prosthesis-render.test.ts / restoration-behavior.test.ts.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { __renderActiveLayers, __setToothStateForTest, __getToothStateForTest } from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";
import type { OdontogramExportPayload } from "../fhir/types";

function svgText(name: string): string {
  return readFileSync(fileURLToPath(new NodeURL(`../assets/teeth-svgs/${name}.svg`, import.meta.url)), "utf8");
}
const ids = (toothNo: number, state: Record<string, unknown>): string[] =>
  __renderActiveLayers(svgText(String(toothNo)), toothNo, state).map((l) => l.id);

describe("crown-leakage axis: render gating", () => {
  it("crown + crownLeakage:true activates the crown-leakage layer", () => {
    const a = ids(11, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep",
      restorationType: "crown", restorationMaterial: "zircon", crownLeakage: true,
    });
    expect(a).toContain("crown-leakage");
  });

  it("bridge + crownLeakage:true activates the crown-leakage layer", () => {
    const a = ids(11, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep",
      restorationType: "bridge", restorationMaterial: "gold", crownLeakage: true,
    });
    expect(a).toContain("crown-leakage");
  });

  it("crown + crownLeakage:false does NOT activate the layer", () => {
    const a = ids(11, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep",
      restorationType: "crown", restorationMaterial: "zircon", crownLeakage: false,
    });
    expect(a).not.toContain("crown-leakage");
  });

  it("crownLeakage:true on an inlay (not crown/bridge) does NOT activate the layer (appliesWhen gate)", () => {
    const a = ids(11, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep",
      restorationType: "inlay", restorationMaterial: "gold", crownLeakage: true,
    });
    expect(a).not.toContain("crown-leakage");
  });

  it("crownLeakage:true with no restoration at all does NOT activate the layer", () => {
    const a = ids(11, { toothSelection: "tooth-base", crownLeakage: true });
    expect(a).not.toContain("crown-leakage");
  });
});

describe("crown-leakage axis: state hydration/serialization", () => {
  it("hydrateState persists crownLeakage:true", () => {
    __setToothStateForTest(21, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep",
      restorationType: "crown", restorationMaterial: "emax", crownLeakage: true,
    });
    const s = __getToothStateForTest(21)!;
    expect(s.crownLeakage).toBe(true);
  });

  it("defaults to false when omitted from the raw payload", () => {
    __setToothStateForTest(22, { toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "crown", restorationMaterial: "emax" });
    const s = __getToothStateForTest(22)!;
    expect(s.crownLeakage).toBe(false);
  });

  it("coerces a non-boolean raw value to a strict boolean (!!raw.field, matches every other boolean field)", () => {
    __setToothStateForTest(23, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep",
      restorationType: "crown", restorationMaterial: "emax", crownLeakage: 1 as unknown as boolean,
    });
    expect(__getToothStateForTest(23)!.crownLeakage).toBe(true); // truthy raw value -> true

    __setToothStateForTest(29, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep",
      restorationType: "crown", restorationMaterial: "emax", crownLeakage: "" as unknown as boolean,
    });
    expect(__getToothStateForTest(29)!.crownLeakage).toBe(false); // falsy raw value -> false
  });
});

describe("crown-leakage axis: FHIR round-trip", () => {
  it("a crown with crownLeakage:true emits a crown-leakage Observation and round-trips", () => {
    const payload: OdontogramExportPayload = {
      version: "2.1",
      teeth: { "11": { toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "crown", restorationMaterial: "zircon", crownLeakage: true } },
    };
    const bundle = buildFhirBundle(payload);
    const finding = bundle.entry
      ?.map((e) => e.resource)
      .find((r: any) => r?.code?.coding?.[0]?.code === "crown-leakage");
    expect(finding).toBeTruthy();
    expect((finding as any)?.valueBoolean).toBe(true);

    const out = parseFhirBundle(bundle);
    expect(out.teeth["11"].crownLeakage).toBe(true);
  });

  it("crownLeakage:false emits no Observation (boolean axes only emit when true)", () => {
    const payload: OdontogramExportPayload = {
      version: "2.1",
      teeth: { "12": { toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "crown", restorationMaterial: "zircon", crownLeakage: false } },
    };
    const bundle = buildFhirBundle(payload);
    const finding = bundle.entry
      ?.map((e) => e.resource)
      .find((r: any) => r?.code?.coding?.[0]?.code === "crown-leakage");
    expect(finding).toBeFalsy();
  });
});
