// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP5 Task 2: `rootCaries` (enum) wires the previously-dormant `caries-root`
// SVG artwork layer (present since v2.5.0 in the 4 main-view templates —
// 11/13/14/16 — but NOT in the 2 occlusal templates — 14_occl/16_occl — and
// never toggled by any code before this task). This finding was never
// modeled/rendered before, so unlike resorption-parity.test.ts / apical-
// parity.test.ts there is no legacy boolean/field to assert byte-identical
// equivalence against — instead this asserts the new render directly:
// activates on a present tooth on a main-view template, does NOT activate on
// an occlusal template (no artwork there), and does NOT activate on a
// missing/implant tooth (appliesWhen: toothPresent, mirrored from
// src/registry/axes.ts). Independent of (and complementary to) the golden-
// fixture parity cases appended in parity/matrix.ts (rootCariesParityCases).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { __renderActiveLayers } from "../odontogram";

const testFileUrl = import.meta.url;
const readSvg = (name: string) => readFileSync(fileURLToPath(new URL(`../assets/teeth-svgs/${name}.svg`, testFileUrl)), "utf8");

const mainSvg = readSvg("11");
const occlSvg = readSvg("16_occl");
const renderMain = (state: Record<string, unknown>) => __renderActiveLayers(mainSvg, 11, state);
const renderOccl = (state: Record<string, unknown>) => __renderActiveLayers(occlSvg, 16, state);

describe("SP5 Task 2: rootCaries wires the dormant caries-root layer", () => {
  it("rootCaries:active on a present tooth activates caries-root on a MAIN-view template", () => {
    const layers = renderMain({ toothSelection: "tooth-base", rootCaries: "active" });
    expect(layers.some(l => l.id === "caries-root")).toBe(true);
  });

  it("rootCaries:arrested / active-cavitated also activate caries-root (any non-'none' value)", () => {
    expect(renderMain({ toothSelection: "tooth-base", rootCaries: "arrested" }).some(l => l.id === "caries-root")).toBe(true);
    expect(renderMain({ toothSelection: "tooth-base", rootCaries: "active-cavitated" }).some(l => l.id === "caries-root")).toBe(true);
  });

  it("rootCaries:none does not activate caries-root (regression control)", () => {
    const none = renderMain({ toothSelection: "tooth-base", rootCaries: "none" });
    const absent = renderMain({ toothSelection: "tooth-base" });
    expect(none.some(l => l.id === "caries-root")).toBe(false);
    expect(absent.some(l => l.id === "caries-root")).toBe(false);
  });

  it("rootCaries:active on a present tooth does NOT activate caries-root on an OCCLUSAL-view template (no artwork there)", () => {
    const layers = renderOccl({ toothSelection: "tooth-base", rootCaries: "active" });
    expect(layers.some(l => l.id === "caries-root")).toBe(false);
  });

  it("rootCaries is gated on a present tooth: a missing tooth does not activate caries-root", () => {
    const missing = renderMain({ toothSelection: "none", rootCaries: "active" });
    expect(missing.some(l => l.id === "caries-root")).toBe(false);
  });

  it("rootCaries is gated on a present tooth: an implant does not activate caries-root", () => {
    const implant = renderMain({ toothSelection: "implant", rootCaries: "active" });
    expect(implant.some(l => l.id === "caries-root")).toBe(false);
  });
});
