// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP3a Task 4 + SP3b Task 3: explicit new-behavior / migration assertions for the
// crown-material -> toothSubstrate + restorationType x restorationMaterial swap,
// including implant fixed crowns/bridges folding into the same axis (SP3b Task 3,
// which removes the SP3a interim implant-crown deferral). Parity goldens
// (svg-fingerprints.json / fhir-golden.json / roundtrip-golden.json) already cover
// this broadly via the matrix; these tests pin down the specific, human-readable
// behaviors using the real hydrate (via __renderActiveLayers, the only exported
// seam that runs hydrateState) and FHIR-export entry points (same as
// render-seam.test.ts / fhir.test.ts).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { __renderActiveLayers, __setToothStateForTest, __getToothStateForTest, __collectExportPayloadForTest } from "../../odontogram";
import { buildFhirBundle } from "../../fhir/toFhir";
import { restorationOptions } from "../../registry/restorations";

// Node's own URL (not jsdom's) so this resolves relative to this file on disk
// regardless of test environment — same workaround as render-seam.test.ts.
function svgText(name: string): string {
  return readFileSync(fileURLToPath(new NodeURL(`../../assets/teeth-svgs/${name}.svg`, import.meta.url)), "utf8");
}

function findCoding(bundle: ReturnType<typeof buildFhirBundle>, code: string) {
  return bundle.entry
    ?.map((e) => e.resource)
    .find((r: any) => r?.code?.coding?.[0]?.code === code);
}

describe("restoration behavior: legacy migration (crownMaterial/bridgeUnit -> new axes)", () => {
  it("a 1.4 crownMaterial:'metal' state hydrates to restorationMaterial:'metal-ceramic' (deliberate PFM rename)", () => {
    const ids = __renderActiveLayers(svgText("11"), 11, { toothSelection: "tooth-base", crownMaterial: "metal" }).map((l) => l.id);
    // metal-ceramic wrapper group + crown layer active — proves restorationMaterial
    // resolved to "metal-ceramic", not the legacy "metal" id.
    expect(ids).toContain("metal-ceramic");
    expect(ids).toContain("metal-ceramic-crown");
    expect(ids).not.toContain("metal");
    expect(ids).not.toContain("metal-crown");
  });

  it("a bridgeUnit:'zircon' state hydrates to restorationType:'bridge', restorationMaterial:'zircon'", () => {
    const ids = __renderActiveLayers(svgText("11"), 11, { toothSelection: "tooth-base", bridgeUnit: "zircon" }).map((l) => l.id);
    // zircon wrapper group + bridge-connector layer active — proves restorationType
    // resolved to "bridge" and restorationMaterial to "zircon" (not left on bridgeUnit).
    expect(ids).toContain("zircon");
    expect(ids).toContain("zircon-bridge-connector");
  });

  it("a crownMaterial:'radix' state hydrates to toothSubstrate:'radix'", () => {
    const ids = __renderActiveLayers(svgText("11"), 11, { toothSelection: "tooth-base", crownMaterial: "radix" }).map((l) => l.id);
    expect(ids).toContain("tooth-radix");
    expect(ids).not.toContain("tooth-base");
  });

  // SP3b Task 3: implant fixed crowns are now first-class in the restoration
  // model. A legacy implant carrying a fixed crown folds into
  // restorationType:"crown"+restorationMaterial exactly like a non-implant tooth
  // (same metal->metal-ceramic rename) — it no longer stays on `crownMaterial`.
  it("a 1.4 implant with crownMaterial:'zircon' hydrates to restorationType:'crown', restorationMaterial:'zircon' (NOT preserved on crownMaterial)", () => {
    __setToothStateForTest(14, { toothSelection: "implant", crownMaterial: "zircon" });
    const s = __getToothStateForTest(14)!;
    expect(s.toothSelection).toBe("implant");
    expect(s).not.toHaveProperty("crownMaterial"); // Task 4: field retired from state entirely
    expect(s.restorationType).toBe("crown"); // folded into the new axis
    expect(s.restorationMaterial).toBe("zircon");
  });

  it("a 1.4 implant with crownMaterial:'metal' hydrates to restorationMaterial:'metal-ceramic' (same PFM rename as non-implant)", () => {
    __setToothStateForTest(15, { toothSelection: "implant", crownMaterial: "metal" });
    const s = __getToothStateForTest(15)!;
    expect(s.restorationType).toBe("crown");
    expect(s.restorationMaterial).toBe("metal-ceramic");
  });

  it("a 1.4 implant with crownMaterial:'zircon' renders implant-connector + the composed zircon-crown layers (not the legacy interim branch)", () => {
    const ids = __renderActiveLayers(svgText("14"), 14, { toothSelection: "implant", crownMaterial: "zircon" }).map((l) => l.id);
    expect(ids).toContain("implant-connector");
    expect(ids).toContain("zircon");
    expect(ids).toContain("zircon-crown");
    expect(ids).not.toContain("metal-ceramic");
  });

  it("a 1.4 implant with crownMaterial:'metal' renders implant-connector + the composed metal-ceramic-crown layers", () => {
    const ids = __renderActiveLayers(svgText("14"), 14, { toothSelection: "implant", crownMaterial: "metal" }).map((l) => l.id);
    expect(ids).toContain("implant-connector");
    expect(ids).toContain("metal-ceramic");
    expect(ids).toContain("metal-ceramic-crown");
    expect(ids).not.toContain("metal-crown");
  });
});

describe("restoration behavior: implant fixed crowns (Task 3 — first-class in the restoration model)", () => {
  it("an implant with restorationType:'crown', restorationMaterial:'zircon' renders implant-connector + zircon-crown (+ zircon wrapper)", () => {
    const ids = __renderActiveLayers(svgText("14"), 14, {
      toothSelection: "implant", restorationType: "crown", restorationMaterial: "zircon",
    }).map((l) => l.id);
    expect(ids).toContain("implant-connector");
    expect(ids).toContain("zircon");
    expect(ids).toContain("zircon-crown");
  });

  it("an implant with restorationType:'crown', restorationMaterial:'metal-ceramic' authored directly renders metal-ceramic-crown", () => {
    const ids = __renderActiveLayers(svgText("14"), 14, {
      toothSelection: "implant", restorationType: "crown", restorationMaterial: "metal-ceramic",
    }).map((l) => l.id);
    expect(ids).toContain("implant-connector");
    expect(ids).toContain("metal-ceramic");
    expect(ids).toContain("metal-ceramic-crown");
  });

  it("restorationOptions({isImplant:true}) offers implant crown/bridge combos, not inlay/onlay/veneer", () => {
    const opts = restorationOptions("front", { isImplant: true });
    expect(opts.some((o) => o.restorationType === "crown" && o.restorationMaterial === "zircon")).toBe(true);
    expect(opts.some((o) => o.restorationType === "bridge")).toBe(true);
    expect(opts.some((o) => o.restorationType === "inlay")).toBe(false);
    expect(opts.some((o) => o.restorationType === "onlay")).toBe(false);
    expect(opts.some((o) => o.restorationType === "veneer")).toBe(false);
  });

  it("restorationOptions(view) with no ctx (non-implant) still offers inlay/onlay/veneer", () => {
    const opts = restorationOptions("occlusal", {});
    expect(opts.some((o) => o.restorationType === "inlay")).toBe(true);
    expect(opts.some((o) => o.restorationType === "onlay")).toBe(true);
    expect(opts.some((o) => o.restorationType === "veneer")).toBe(true);
  });
});

describe("restoration behavior: new-model axes authored directly", () => {
  it("a gold-inlay state renders the gold-inlay layer", () => {
    const ids = __renderActiveLayers(svgText("11"), 11, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "inlay", restorationMaterial: "gold",
    }).map((l) => l.id);
    expect(ids).toContain("gold"); // wrapper <g>
    expect(ids).toContain("gold-inlay"); // composed child layer
    expect(ids).not.toContain("gold-crown");
  });

  it("an emax crown FHIR-exports a restoration-type + restoration-material coding", () => {
    const bundle = buildFhirBundle({
      version: "2.0",
      teeth: { "11": { toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "crown", restorationMaterial: "emax" } },
    });
    const typeObs = findCoding(bundle, "restoration-type");
    const materialObs = findCoding(bundle, "restoration-material");
    expect((typeObs as any)?.valueCodeableConcept?.coding?.[0]?.code).toBe("crown");
    expect((materialObs as any)?.valueCodeableConcept?.coding?.[0]?.code).toBe("emax");
  });
});

// Task 4: retire the legacy `crownMaterial`/`bridgeUnit` STATE fields entirely
// (the input-side hydrateState migration above stays for backward compat with
// 1.4/2.0 payloads). The export payload version itself was bumped to 2.1 here,
// then 2.2 (SP4 Task 6), then 2.3 (SP5 Task 7), then 2.4 (SP6 Task 1); this
// test asserts the CURRENT export version, not the historical one, so it tracks
// collectExportPayload's version literal.
describe("restoration behavior: Task 4 — crownMaterial/bridgeUnit retirement + current payload version", () => {
  it("a 2.0 payload with an interim implant crownMaterial + a legacy removable bridgeUnit migrates to restorationType/prosthesis, and re-exports at the current version with no legacy keys", () => {
    __setToothStateForTest(24, { toothSelection: "implant", crownMaterial: "locator" });
    __setToothStateForTest(25, { toothSelection: "none", bridgeUnit: "removable" });

    const implant = __getToothStateForTest(24)!;
    expect(implant.prosthesis).toBe("locator");
    expect(implant.restorationType).toBe("none");
    expect(implant).not.toHaveProperty("crownMaterial");

    const pontic = __getToothStateForTest(25)!;
    expect(pontic.prosthesis).toBe("removable-partial");
    expect(pontic).not.toHaveProperty("bridgeUnit");

    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    for (const tooth of Object.values(payload.teeth) as Record<string, unknown>[]) {
      expect(tooth).not.toHaveProperty("crownMaterial");
      expect(tooth).not.toHaveProperty("bridgeUnit");
    }
    expect(payload.teeth["24"].prosthesis).toBe("locator");
    expect(payload.teeth["25"].prosthesis).toBe("removable-partial");
  });
});

// Task 6 (spec §9 gap): restorationType and restorationMaterial are validated
// independently in hydrateState (each against its own enum), so a hand-edited
// or imported payload can still pair a legal type with a material that type
// never supports (e.g. inlay+metal — RESTORATION_MATRIX.inlay only allows
// emax/gold/gradia/zircon/temporary). hydrateState must coerce this PAIR to a
// valid combo — never leave/render a "sane-looking but impossible" state.
describe("restoration behavior: Task 6 — invalid (restorationType, restorationMaterial) combo hardening", () => {
  it("inlay+metal (invalid: metal is not in RESTORATION_MATRIX.inlay) coerces to inlay+emax (first valid material), never throws", () => {
    expect(() => __setToothStateForTest(26, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "inlay", restorationMaterial: "metal",
    })).not.toThrow();
    const s = __getToothStateForTest(26)!;
    expect(s.restorationType).toBe("inlay"); // type itself is legitimate — kept
    expect(s.restorationMaterial).toBe("emax"); // RESTORATION_MATRIX.inlay.materials[0]
  });

  it("veneer+metal-ceramic (invalid) coerces to veneer+emax", () => {
    __setToothStateForTest(27, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "veneer", restorationMaterial: "metal-ceramic",
    });
    const s = __getToothStateForTest(27)!;
    expect(s.restorationType).toBe("veneer");
    expect(s.restorationMaterial).toBe("emax");
  });

  it("a legal type with no material authored (material defaults to \"none\", itself invalid for a non-none type) coerces to that type's first valid material", () => {
    __setToothStateForTest(28, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "crown",
      // restorationMaterial intentionally omitted -> defaults to "none", which
      // RESTORATION_MATRIX.crown does not list as a valid material.
    });
    const s = __getToothStateForTest(28)!;
    expect(s.restorationType).toBe("crown");
    expect(s.restorationMaterial).toBe("emax"); // RESTORATION_MATRIX.crown.materials[0]
  });

  it("a stray restorationMaterial with restorationType left at \"none\" drops both to none", () => {
    __setToothStateForTest(36, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationMaterial: "gold",
      // restorationType intentionally omitted -> defaults to "none"; (none, gold) is invalid.
    });
    const s = __getToothStateForTest(36)!;
    expect(s.restorationType).toBe("none");
    expect(s.restorationMaterial).toBe("none");
  });

  it("a valid onlay+material combo is preserved even though hydrate has no view context (onlay is occlusal-only, but view-gating is a render/UI concern, not a data-validity one)", () => {
    __setToothStateForTest(37, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "onlay", restorationMaterial: "gold",
    });
    const s = __getToothStateForTest(37)!;
    expect(s.restorationType).toBe("onlay");
    expect(s.restorationMaterial).toBe("gold"); // NOT coerced away
  });

  it("a valid combo (crown+zircon) is left completely untouched", () => {
    __setToothStateForTest(38, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "crown", restorationMaterial: "zircon",
    });
    const s = __getToothStateForTest(38)!;
    expect(s.restorationType).toBe("crown");
    expect(s.restorationMaterial).toBe("zircon");
  });
});
