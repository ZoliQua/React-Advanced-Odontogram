// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { AXES } from "../axes";
import { allClearLayers, FIXED_CLEAR_LAYERS } from "../svgLayers";

// Use Node's own URL (not the jsdom-provided global URL, which mis-resolves
// relative `file:` URLs against `window.location` under the jsdom test
// environment) so this always resolves relative to this test file on disk.
// (Same workaround as src/__tests__/svg-assets.test.ts and render-seam.test.ts.)
const FILES = ["11", "13", "14", "16", "14_occl", "16_occl"] as const;
const svg = (n: string) => readFileSync(fileURLToPath(new NodeURL(`../../assets/teeth-svgs/${n}.svg`, import.meta.url)), "utf8");
const ALL = FILES.map(svg).join("\n");

describe("AXES svgLayer metadata", () => {
  it("every declared svgLayer id exists in at least one installed SVG", () => {
    for (const ax of AXES) for (const v of ax.values ?? []) {
      const layers = v.svgLayer == null ? [] : Array.isArray(v.svgLayer) ? v.svgLayer : [v.svgLayer];
      for (const id of layers) expect(ALL.includes(`id="${id}"`), `${ax.id}:${v.id} → ${id}`).toBe(true);
    }
  });

  it("every boolean-axis svgLayer exists in an installed SVG", () => {
    for (const ax of AXES) if (ax.svgLayer)
      expect(ALL.includes(`id="${ax.svgLayer}"`), `${ax.id} → ${ax.svgLayer}`).toBe(true);
  });
});

describe("clear-set derivation", () => {
  it("allClearLayers() is exactly today's clear-set (no id added or dropped)", () => {
    // axisClearLayers() only contributes ids already in FIXED_CLEAR_LAYERS
    // (caries/mods/endo/glyph/toothSelection layers) — so the union set must equal it.
    expect(new Set(allClearLayers())).toEqual(new Set(FIXED_CLEAR_LAYERS));
  });
});
