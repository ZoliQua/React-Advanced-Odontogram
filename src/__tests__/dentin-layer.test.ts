// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// The measured templates carry a dentin core after each silhouette that has an
// enamel/dentin boundary (tools/toothgen/dentin.py). A core is meaningless
// without the silhouette it was derived from, so `syncDentinLayers` derives its
// visibility from the owner rather than deciding it. These tests pin that
// relationship from the outside: exactly the shown silhouette's core is shown.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  __renderActiveLayers,
  __parseSvgForTest,
  __renderActiveLayersOnNode,
} from "../odontogram";

// Resolved via process.cwd() (the package root under vitest), not
// import.meta.url: for a non-entry module that resolves to a fake http origin
// here, and fileURLToPath then rejects it.
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const measured = read("src/assets/teeth-svgs/measured/16.svg");
const classic = read("src/assets/teeth-svgs/16.svg");

const ids = (svg: string, state: Record<string, unknown>) =>
  __renderActiveLayers(svg, 16, state).map(l => l.id);

const cores = (list: string[]) => list.filter(id => id.endsWith("-dentin"));

describe("dentin cores follow their silhouette", () => {
  it("an intact tooth shows the tooth-base core and no other", () => {
    const list = ids(measured, { toothSelection: "tooth-base" });
    expect(list).toContain("tooth-base");
    expect(cores(list)).toEqual(["tooth-base-dentin"]);
  });

  it("a prepared crown swaps both the silhouette and its core", () => {
    const list = ids(measured, { toothSelection: "tooth-base", toothSubstrate: "crownprep" });
    expect(list).toContain("tooth-crownprep");
    expect(list).not.toContain("tooth-base");
    expect(cores(list)).toEqual(["tooth-crownprep-dentin"]);
  });

  it("a retained root shows the radix core", () => {
    const list = ids(measured, { toothSelection: "tooth-base", toothSubstrate: "radix" });
    expect(list).toContain("tooth-radix");
    expect(cores(list)).toEqual(["tooth-radix-dentin"]);
  });

  it("a broken crown drops the core with the silhouette it belonged to", () => {
    // The broken variants have no core of their own yet, so the correct
    // outcome is none at all — NOT the intact core left behind over a
    // silhouette that is no longer drawn.
    const list = ids(measured, {
      toothSelection: "tooth-base",
      toothSubstrate: "broken",
      brokenIncisal: true,
    });
    expect(list).toContain("tooth-broken-incisal");
    expect(list).not.toContain("tooth-base");
    expect(cores(list)).toEqual([]);
  });

  it("a missing tooth and an implant show no core", () => {
    expect(cores(ids(measured, { toothSelection: "none" }))).toEqual([]);
    expect(cores(ids(measured, { toothSelection: "implant" }))).toEqual([]);
  });

  it("is a no-op on the classic profile, which has no cores", () => {
    const list = ids(classic, { toothSelection: "tooth-base" });
    expect(list).toContain("tooth-base");
    expect(cores(list)).toEqual([]);
  });

  it("a reused node does not strand a core from the previous state", () => {
    // The live app keeps ONE parsed node per tooth and renders onto it again,
    // so a layer the previous state switched on has to be switched off by the
    // next one. A fresh parse per render would never catch that.
    const node = __parseSvgForTest(measured);
    const render = (state: Record<string, unknown>) =>
      __renderActiveLayersOnNode(node, 16, state).map(l => l.id);

    expect(cores(render({ toothSelection: "tooth-base", toothSubstrate: "crownprep" })))
      .toEqual(["tooth-crownprep-dentin"]);
    expect(cores(render({ toothSelection: "tooth-base" })))
      .toEqual(["tooth-base-dentin"]);
    expect(cores(render({ toothSelection: "none" }))).toEqual([]);
  });
});
