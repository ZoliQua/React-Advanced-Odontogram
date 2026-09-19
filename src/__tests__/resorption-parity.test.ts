// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP4 Task 2 byte-identical proof: `resorptionType` (enum) replaces the
// retired `rootResorption` boolean. Both `internal` and `external-cervical`
// must activate the SAME single `endo-resorption` layer that the legacy
// `rootResorption:true` boolean activated — including the `inflammationHome`
// z-order lift interaction (odontogram.ts ~1043-1072), which fires when the
// `inflammation` glyph coincides with an active `endo-resorption` layer.
// Independent of (and complementary to) the golden-fixture parity cases
// appended in `parity/matrix.ts` (resorptionTypeParityCases) — this test
// asserts the two render paths directly against each other, not against a
// frozen snapshot, so it can't silently "pass" a golden that was mis-captured.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { __renderActiveLayers } from "../odontogram";

const testFileUrl = import.meta.url;
const svgText = readFileSync(
  fileURLToPath(new URL("../assets/teeth-svgs/11.svg", testFileUrl)),
  "utf8",
);
const render = (state: Record<string, unknown>) => __renderActiveLayers(svgText, 11, state);

describe("SP4 Task 2: resorptionType renders byte-identical to the retired rootResorption boolean", () => {
  it("resorptionType:external-cervical === legacy rootResorption:true", () => {
    const legacy = render({ toothSelection: "tooth-base", rootResorption: true });
    const modern = render({ toothSelection: "tooth-base", resorptionType: "external-cervical" });
    expect(modern).toEqual(legacy);
    expect(legacy.some(l => l.id === "endo-resorption")).toBe(true);
  });

  it("resorptionType:internal activates the SAME single endo-resorption layer (visually identical to external-cervical)", () => {
    const external = render({ toothSelection: "tooth-base", resorptionType: "external-cervical" });
    const internal = render({ toothSelection: "tooth-base", resorptionType: "internal" });
    expect(internal).toEqual(external);
  });

  it("inflammationHome z-order lift: inflammation + resorptionType:external-cervical === inflammation + legacy rootResorption:true", () => {
    const legacy = render({ toothSelection: "tooth-base", mods: ["inflammation"], rootResorption: true });
    const modern = render({ toothSelection: "tooth-base", mods: ["inflammation"], resorptionType: "external-cervical" });
    expect(modern).toEqual(legacy);
    // Confirm the lift actually fired in both (inflammation re-parented to
    // AFTER endo-resorption in document order, so it paints on top) rather
    // than both merely omitting the layer for an unrelated reason.
    const indexOf = (layers: typeof legacy, id: string) => layers.findIndex(l => l.id === id);
    expect(indexOf(legacy, "inflammation")).toBeGreaterThan(indexOf(legacy, "endo-resorption"));
    expect(indexOf(modern, "inflammation")).toBeGreaterThan(indexOf(modern, "endo-resorption"));
  });

  it("resorptionType:none does not activate endo-resorption (regression control)", () => {
    const none = render({ toothSelection: "tooth-base", resorptionType: "none" });
    const absent = render({ toothSelection: "tooth-base" });
    expect(none.some(l => l.id === "endo-resorption")).toBe(false);
    expect(absent.some(l => l.id === "endo-resorption")).toBe(false);
  });

  it("resorptionType is gated on a present tooth (mirrors the retired axis's appliesWhen: toothPresent)", () => {
    const missing = render({ toothSelection: "none", resorptionType: "external-cervical" });
    expect(missing.some(l => l.id === "endo-resorption")).toBe(false);
  });

  it("hydrateState migration: a modern payload's own resorptionType wins over a stray legacy rootResorption", () => {
    const state = render({ toothSelection: "tooth-base", rootResorption: true, resorptionType: "none" });
    expect(state.some(l => l.id === "endo-resorption")).toBe(false);
  });
});
