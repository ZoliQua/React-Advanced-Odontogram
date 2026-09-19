// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// NOTE: capture `import.meta.url` in a variable first — inlining it in the
// `new URL(...)` call causes Vite to rewrite the literal and breaks
// fileURLToPath resolution under Vitest (see parity.test.ts for the same fix).
const testFileUrl = import.meta.url;
const read = (f: string) => readFileSync(fileURLToPath(new URL(`../assets/teeth-svgs/${f}`, testFileUrl)), "utf8");

describe("SP8 Task 2: peri-implant-bone-loss layer", () => {
  for (const f of ["11.svg","13.svg","14.svg","16.svg"]) {
    it(`${f} has a dormant peri-implant-bone-loss layer inside the implant group`, () => {
      const svg = read(f);
      expect(svg).toContain('id="peri-implant-bone-loss"');
      // dormant by default
      const m = svg.match(/id="peri-implant-bone-loss"[^>]*style="([^"]*)"/);
      expect(m).toBeTruthy();
      expect(m![1]).toContain("display: none");
    });
  }
  // NOTE: this repo has no per-FDI-number SVG file (e.g. no literal "21.svg") —
  // all 32 teeth map onto 4 shape templates (11/13/14/16, see TOOTH_TEMPLATE in
  // odontogram.ts). "21.svg" from the brief doesn't exist, so we assert
  // absence against the occlusal template variants instead: they DO carry an
  // `implant`/`implant-base` group (14_occl.svg, 16_occl.svg) but must NOT
  // carry the new layer, since the brief scopes it to only 11/13/14/16.svg.
  it("occlusal template variants do NOT carry the layer (out of scope for this task)", () => {
    expect(read("14_occl.svg")).not.toContain("peri-implant-bone-loss");
    expect(read("16_occl.svg")).not.toContain("peri-implant-bone-loss");
  });
});
