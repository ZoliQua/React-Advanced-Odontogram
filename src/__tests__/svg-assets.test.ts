// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";

const FRONT = ["11", "13", "14", "16"] as const;
const ALL = ["11", "13", "14", "16", "14_occl", "16_occl"] as const;

function readSvg(name: string): string {
  // Use Node's own URL (not the jsdom-provided global URL, which mis-resolves
  // relative `file:` URLs against `window.location` under the jsdom test
  // environment) so this always resolves relative to this test file on disk.
  const url = new NodeURL(`../assets/teeth-svgs/${name}.svg`, import.meta.url);
  return readFileSync(fileURLToPath(url), "utf8");
}

// Drawable leaf ids that are NEW clinical layers; each MUST carry inline
// display:none so the engine hides it at load (it is never toggled in SP1).
const NEW_LEAVES_ALL = [
  "metal-ceramic-crown", "metal-ceramic-bridge-connector",
  "gold-crown", "gold-bridge-connector",
  "gradia-crown", "gradia-bridge-connector",
  "crown-leakage",
];
const NEW_LEAVES_FRONT = ["caries-root", "fracture-horizontal-1", "fracture-vertical-1", "ortho-ring", "ortho-bracket", "arrow-up", "arrow-down"];

describe("installed tooth SVG assets", () => {
  it("every file carries SVG Version 2.5.0", () => {
    for (const n of ALL) expect(readSvg(n), n).toContain("SVG Version: 2.5.0");
  });

  it("no file still carries an old SVG version tag", () => {
    for (const n of ALL) {
      const s = readSvg(n);
      expect(s, n).not.toContain("SVG Version: 2.1");
      expect(s, n).not.toContain("Build 109"); // raw Illustrator tag must be gone
    }
  });

  it("16_occl uses prosthesis-connector, not the bridge-connector typo", () => {
    const s = readSvg("16_occl");
    expect(s).toContain('id="prosthesis-connector"');
    expect(s).not.toContain('id="prosthesis-bridge-connector"');
  });

  it("front teeth use the corrected 'incisal' broken-crown ids (no 'inicisal')", () => {
    for (const n of FRONT) {
      const s = readSvg(n);
      expect(s, n).not.toContain("inicisal");
      expect(s, n).toContain('id="tooth-broken-incisal"');
    }
  });

  it("all 7 broken-crown variant ids exist in each front template", () => {
    const variants = [
      "tooth-broken-mesial", "tooth-broken-distal", "tooth-broken-incisal",
      "tooth-broken-mesial-distal", "tooth-broken-mesial-incisal",
      "tooth-broken-distal-incisal", "tooth-broken-mesial-distal-incisal",
    ];
    for (const n of FRONT) {
      const s = readSvg(n);
      for (const v of variants) expect(s, `${n}:${v}`).toContain(`id="${v}"`);
    }
  });

  it("existing metal-crown layer is preserved (no visual change for crownMaterial=metal)", () => {
    for (const n of ALL) expect(readSvg(n), n).toContain('id="metal-crown"');
  });

  it("new dormant clinical leaves are hidden by default (display:none on the element or an ancestor)", () => {
    const isHiddenByDefault = (svg: string, id: string): boolean => {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const start = doc.getElementById(id);
      for (let cur: Element | null = start; cur; cur = cur.parentElement) {
        if (/display\s*:\s*none/i.test(cur.getAttribute("style") || "")) return true;
      }
      return false;
    };
    for (const n of ALL) {
      const s = readSvg(n);
      for (const id of NEW_LEAVES_ALL) {
        if (s.includes(`id="${id}"`)) expect(isHiddenByDefault(s, id), `${n}:${id}`).toBe(true);
      }
    }
    for (const n of FRONT) {
      const s = readSvg(n);
      for (const id of NEW_LEAVES_FRONT) {
        if (s.includes(`id="${id}"`)) expect(isHiddenByDefault(s, id), `${n}:${id}`).toBe(true);
      }
    }
  });

  it("engine-toggled container groups are not display:none (plan/specials), so their children can be shown", () => {
    const containerNotHidden = (svg: string, id: string): boolean => {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const el = doc.getElementById(id);
      if (!el) return true; // absent is fine (e.g. occlusal files have no `specials`)
      return !/display\s*:\s*none/i.test(el.getAttribute("style") || "");
    };
    for (const n of ALL) {
      const s = readSvg(n);
      for (const id of ["plan", "specials"]) {
        expect(containerNotHidden(s, id), `${n}:${id} container must not be display:none`).toBe(true);
      }
    }
  });

  it("base anatomy layers are present", () => {
    for (const n of ["11", "13", "14", "16"]) {
      const s = readSvg(n);
      for (const id of ["tooth-base", "bone-base", "gum-base"]) expect(s, `${n}:${id}`).toContain(`id="${id}"`);
    }
  });
});
