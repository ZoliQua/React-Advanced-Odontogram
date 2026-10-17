// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { __parseSvgForTest, __renderActiveLayersOnNode, __discolorationAllowedForTest } from "../odontogram";

const svg11 = readFileSync(fileURLToPath(new NodeURL("../assets/teeth-svgs/11.svg", import.meta.url)), "utf8");
const fillOf = (node: any, id: string) => (node.querySelector("#" + id) as any)?.style.fill ?? "";
// jsdom normalizes `.style.fill` hex writes to `rgb(r, g, b)` on read-back
// (confirmed empirically: setting "#9c8f7a" reads back as "rgb(156, 143, 122)").
// Convert the brief's hex constants the same way rather than hardcoding the
// normalized strings, so the assertions stay traceable to the spec'd hex values.
const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

// Asset-original crown fills for 11.svg, read out of the SVG's inline `style`
// attribute — still the ONLY place these colors live, but since the artwork
// was tokenized they are palette tokens carrying the same colour as their
// fallback: `fill: var(--odon-tooth-enamel, #ebebeb)`.
//
// Derived from the asset rather than restated as a literal, because the
// invariant under test is a ROUND TRIP: whatever the asset's own value is, the
// tint must restore exactly that. Pinning a hex here made the test fail when
// the value legitimately changed shape, while a genuine regression — restoring
// "" and blackening the crown, which the odontogram.ts comment warns about —
// is what the assertions below actually have to catch.
const assetFill = (layerId: string) => {
  const m = new RegExp(`id="${layerId}"[^>]*style="([^"]*)"`).exec(svg11);
  const f = /(?:^|;)\s*fill:\s*([^;]+)/.exec(m?.[1] ?? "");
  if (!f) throw new Error(`no inline fill on #${layerId} in 11.svg`);
  return f[1].trim();
};
const TOOTH_BASE_ORIGINAL = assetFill("tooth-base");
const MILKTOOTH_BASE_ORIGINAL = assetFill("milktooth-base");

describe("SP12 Task 2: discoloration crown tint", () => {
  it("tints tooth-base for a permanent tooth", () => {
    const node = __parseSvgForTest(svg11);
    __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base", discoloration: "tetracycline" });
    expect(fillOf(node, "tooth-base")).toBe(hexToRgb("#9c8f7a"));
  });
  it("tints milktooth-base for a milk tooth (and restores tooth-base's own base color, not '')", () => {
    const node = __parseSvgForTest(svg11);
    __renderActiveLayersOnNode(node, 11, { toothSelection: "milktooth", discoloration: "fluorosis" });
    expect(fillOf(node, "milktooth-base")).toBe(hexToRgb("#d9c9a3"));
    expect(fillOf(node, "tooth-base")).toBe(TOOTH_BASE_ORIGINAL);
  });
  it("none / gated-off restores the asset's original base fill on a reused node (not '')", () => {
    const node = __parseSvgForTest(svg11);
    __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base", discoloration: "tetracycline" });
    __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base", discoloration: "none" });
    expect(fillOf(node, "tooth-base")).toBe(TOOTH_BASE_ORIGINAL);
  });
  it("suppressed under a restoration / non-natural substrate restores the original base fill (not '')", () => {
    const n1 = __parseSvgForTest(svg11);
    __renderActiveLayersOnNode(n1, 11, { toothSelection: "tooth-base", discoloration: "tetracycline", restorationType: "crown" });
    expect(fillOf(n1, "tooth-base")).toBe(TOOTH_BASE_ORIGINAL);
    const n2 = __parseSvgForTest(svg11);
    __renderActiveLayersOnNode(n2, 11, { toothSelection: "tooth-base", discoloration: "tetracycline", toothSubstrate: "radix" });
    expect(fillOf(n2, "tooth-base")).toBe(TOOTH_BASE_ORIGINAL);
  });
  it("gate predicate", () => {
    expect(__discolorationAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
    expect(__discolorationAllowedForTest({ toothSelection: "milktooth", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
    expect(__discolorationAllowedForTest({ toothSelection: "implant", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
    expect(__discolorationAllowedForTest({ toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "natural" })).toBe(false);
  });

  // Regression tests for the Critical finding: `el.style.fill = ""` DELETES the
  // inline `fill` longhand instead of reverting to the asset's baked-in color,
  // so the crown would render black. These reproduce the reviewer's empirical
  // finding directly (fresh node, default state, discoloration never touched —
  // the path every real tooth takes on first render).
  it("REGRESSION: default state on a FRESH node preserves the crown's original fill (does not delete it)", () => {
    const node = __parseSvgForTest(svg11);
    const originalBeforeRender = fillOf(node, "tooth-base");
    expect(originalBeforeRender).toBe(TOOTH_BASE_ORIGINAL);
    // Default/empty state: discoloration is never set (defaults to "none").
    __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base" });
    expect(fillOf(node, "tooth-base")).toBe(originalBeforeRender);
    expect(fillOf(node, "tooth-base")).not.toBe("");
  });
  it("REGRESSION: tint applied then cleared to 'none' on a reused node returns to the ORIGINAL base color, not ''", () => {
    const node = __parseSvgForTest(svg11);
    const original = fillOf(node, "tooth-base");
    __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base", discoloration: "tetracycline" });
    expect(fillOf(node, "tooth-base")).toBe(hexToRgb("#9c8f7a"));
    __renderActiveLayersOnNode(node, 11, { toothSelection: "tooth-base", discoloration: "none" });
    expect(fillOf(node, "tooth-base")).toBe(original);
    expect(fillOf(node, "tooth-base")).not.toBe("");
  });
  it("REGRESSION: milktooth-base default state on a fresh node preserves its original fill", () => {
    const node = __parseSvgForTest(svg11);
    const original = fillOf(node, "milktooth-base");
    expect(original).toBe(MILKTOOTH_BASE_ORIGINAL);
    __renderActiveLayersOnNode(node, 11, { toothSelection: "milktooth" });
    expect(fillOf(node, "milktooth-base")).toBe(original);
    expect(fillOf(node, "milktooth-base")).not.toBe("");
  });
});
