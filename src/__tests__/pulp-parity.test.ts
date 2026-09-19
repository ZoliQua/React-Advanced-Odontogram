// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP4 Task 3 byte-identical proof: `pulpDx` (enum) replaces the retired
// `pulpInflam` boolean. Any non-"normal" pulpDx value must activate the SAME
// pulp-diseased layer that the legacy `pulpInflam:true` boolean activated —
// on BOTH the permanent (`tooth-inflam-pulp`) and milktooth
// (`milktooth-inflam-pulp`) render branches, with `showHealthyPulp` on AND
// off (the bespoke render block in odontogram.ts:~842-887 is gated by both
// the milktooth/permanent split and the global showHealthyPulp toggle).
// Independent of (and complementary to) the golden-fixture parity cases
// appended in `parity/matrix.ts` (pulpDxParityCases) — this test asserts the
// two render paths directly against each other, not against a frozen
// snapshot, so it can't silently "pass" a golden that was mis-captured.
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { __renderActiveLayers, __setShowHealthyPulpForTest } from "../odontogram";

const testFileUrl = import.meta.url;
const svgText = readFileSync(
  fileURLToPath(new URL("../assets/teeth-svgs/11.svg", testFileUrl)),
  "utf8",
);
const render = (state: Record<string, unknown>) => __renderActiveLayers(svgText, 11, state);

// showHealthyPulp is module-level state (defaults to true); restore it after
// every test so this file never leaks a mutated value into another test.
afterEach(() => {
  __setShowHealthyPulpForTest(true);
});

describe("SP4 Task 3: pulpDx renders byte-identical to the retired pulpInflam boolean (permanent tooth)", () => {
  it("pulpDx:irreversible-pulpitis === legacy pulpInflam:true (showHealthyPulp default true)", () => {
    const legacy = render({ toothSelection: "tooth-base", pulpInflam: true });
    const modern = render({ toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis" });
    expect(modern).toEqual(legacy);
    expect(legacy.some(l => l.id === "tooth-inflam-pulp")).toBe(true);
    expect(legacy.some(l => l.id === "tooth-healthy-pulp")).toBe(false);
  });

  it("pulpDx:normal === legacy pulpInflam:false, showHealthyPulp ON (activates tooth-healthy-pulp)", () => {
    __setShowHealthyPulpForTest(true);
    const legacy = render({ toothSelection: "tooth-base", pulpInflam: false });
    const modern = render({ toothSelection: "tooth-base", pulpDx: "normal" });
    expect(modern).toEqual(legacy);
    expect(legacy.some(l => l.id === "tooth-healthy-pulp")).toBe(true);
    expect(legacy.some(l => l.id === "tooth-inflam-pulp")).toBe(false);
  });

  it("pulpDx:normal === legacy pulpInflam:false, showHealthyPulp OFF (neither pulp layer activates)", () => {
    __setShowHealthyPulpForTest(false);
    const legacy = render({ toothSelection: "tooth-base", pulpInflam: false });
    const modern = render({ toothSelection: "tooth-base", pulpDx: "normal" });
    expect(modern).toEqual(legacy);
    expect(legacy.some(l => l.id === "tooth-healthy-pulp")).toBe(false);
    expect(legacy.some(l => l.id === "tooth-inflam-pulp")).toBe(false);
  });

  it("pulpDx:irreversible-pulpitis === legacy pulpInflam:true, showHealthyPulp OFF (diseased pulp still shows)", () => {
    __setShowHealthyPulpForTest(false);
    const legacy = render({ toothSelection: "tooth-base", pulpInflam: true });
    const modern = render({ toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis" });
    expect(modern).toEqual(legacy);
    expect(legacy.some(l => l.id === "tooth-inflam-pulp")).toBe(true);
  });

  it("necrosis activates the SAME single tooth-inflam-pulp layer (with flame sublayers) as irreversible-pulpitis (visually identical); reversible-pulpitis renders a reduced glyph (SP7: no flame sublayers)", () => {
    const irreversible = render({ toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis" });
    const reversible = render({ toothSelection: "tooth-base", pulpDx: "reversible-pulpitis" });
    const necrosis = render({ toothSelection: "tooth-base", pulpDx: "necrosis" });
    expect(necrosis).toEqual(irreversible);
    expect(irreversible.some(l => l.id === "pulp-inflam-path-1")).toBe(true);
    expect(reversible.some(l => l.id === "tooth-inflam-pulp")).toBe(true);
    expect(reversible.some(l => l.id === "pulp-inflam-path-1")).toBe(false);
  });

  it("hydrateState migration: a modern payload's own pulpDx wins over a stray legacy pulpInflam", () => {
    const state = render({ toothSelection: "tooth-base", pulpInflam: true, pulpDx: "normal" });
    expect(state.some(l => l.id === "tooth-inflam-pulp")).toBe(false);
  });

  it("pulp layer is suppressed under gum / on extraction (regression control, unchanged by this task)", () => {
    const underGum = render({ toothSelection: "tooth-under-gum", pulpDx: "irreversible-pulpitis" });
    expect(underGum.some(l => l.id === "tooth-inflam-pulp")).toBe(false);
  });
});

describe("SP4 Task 3: pulpDx renders byte-identical to the retired pulpInflam boolean (milktooth)", () => {
  it("pulpDx:irreversible-pulpitis === legacy pulpInflam:true on a milktooth (showHealthyPulp default true)", () => {
    const legacy = render({ toothSelection: "milktooth", pulpInflam: true });
    const modern = render({ toothSelection: "milktooth", pulpDx: "irreversible-pulpitis" });
    expect(modern).toEqual(legacy);
    expect(legacy.some(l => l.id === "milktooth-inflam-pulp")).toBe(true);
    expect(legacy.some(l => l.id === "milktooth-healthy-pulp")).toBe(false);
  });

  it("pulpDx:normal === legacy pulpInflam:false on a milktooth, showHealthyPulp ON", () => {
    __setShowHealthyPulpForTest(true);
    const legacy = render({ toothSelection: "milktooth", pulpInflam: false });
    const modern = render({ toothSelection: "milktooth", pulpDx: "normal" });
    expect(modern).toEqual(legacy);
    expect(legacy.some(l => l.id === "milktooth-healthy-pulp")).toBe(true);
  });

  it("pulpDx:normal === legacy pulpInflam:false on a milktooth, showHealthyPulp OFF", () => {
    __setShowHealthyPulpForTest(false);
    const legacy = render({ toothSelection: "milktooth", pulpInflam: false });
    const modern = render({ toothSelection: "milktooth", pulpDx: "normal" });
    expect(modern).toEqual(legacy);
    expect(legacy.some(l => l.id === "milktooth-healthy-pulp")).toBe(false);
    expect(legacy.some(l => l.id === "milktooth-inflam-pulp")).toBe(false);
  });

  it("pulpDx:irreversible-pulpitis === legacy pulpInflam:true on a milktooth, showHealthyPulp OFF", () => {
    __setShowHealthyPulpForTest(false);
    const legacy = render({ toothSelection: "milktooth", pulpInflam: true });
    const modern = render({ toothSelection: "milktooth", pulpDx: "irreversible-pulpitis" });
    expect(modern).toEqual(legacy);
    expect(legacy.some(l => l.id === "milktooth-inflam-pulp")).toBe(true);
  });
});
