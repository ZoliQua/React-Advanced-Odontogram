// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP6 Task 2: contextual per-surface caries popup + recurrent-caries indicator
// on the filling-surface cell + CARS 0..6 names. No full-DOM harness exists for
// the tooth panel, so — as prior SP tasks did — these tests target the pure
// bits: the CARS-labelled option builder, the two extracted state-machine
// transitions (applyRecurrentCariesScore), and the extracted filling-surface
// indicator sync (dark-border `.has-subcaries` toggle).
import { describe, it, expect, afterEach } from "vitest";
import {
  secondaryCariesOptions,
  applyRecurrentCariesScore,
  __syncFillingSubcariesIndicatorForTest,
  setSecondaryCariesMode,
  setCariesDepthEnabled,
} from "../odontogram";
import { t } from "../i18n/useI18n";

afterEach(() => {
  setSecondaryCariesMode("standard");
  setCariesDepthEnabled(true);
});

describe("secondaryCariesOptions — CARS names (spec §5)", () => {
  it("labels resolve to the caries.cars.{n} names (default language en)", () => {
    const opts = secondaryCariesOptions("full");
    // one label per 0..6 value, and each equals its caries.cars.{n} key.
    expect(opts.map(o => o.value)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    for (const o of opts) {
      expect(o.label).toBe(t(`caries.cars.${o.value}`));
      expect(o.label.length).toBeGreaterThan(0);
    }
  });
  it("CARS 0 label is the 'Sound' name (not the raw key or a number)", () => {
    const zero = secondaryCariesOptions("full").find(o => o.value === 0)!;
    expect(zero.label).toBe(t("caries.cars.0"));
    expect(zero.label).toBe("Sound");
  });
  it("all three modes reuse the same CARS names", () => {
    for (const mode of ["simple", "standard", "full"] as const) {
      for (const o of secondaryCariesOptions(mode)) {
        expect(o.label).toBe(t(`caries.cars.${o.value}`));
      }
    }
  });
});

// A minimal surface-state slice matching what applyRecurrentCariesScore mutates.
function makeState(opts: { filled?: boolean; caried?: boolean; severity?: number } = {}) {
  const surface = "occlusal";
  const caries = new Set<string>();
  const cariesSeverity = new Map<string, number>();
  const fillingSurfaceMaterials = new Map<string, string>();
  if (opts.filled) fillingSurfaceMaterials.set(surface, "composite");
  if (opts.caried) caries.add(`caries-${surface}`);
  if (opts.severity != null) cariesSeverity.set(surface, opts.severity);
  return { surface, caries, cariesSeverity, fillingSurfaceMaterials };
}

describe("applyRecurrentCariesScore — the two filling-surface transitions (spec §2)", () => {
  it("filling + no caries, pick CARS > 0 → ADDS caries (becomes recurrent) and stores the score", () => {
    const s = makeState({ filled: true });
    applyRecurrentCariesScore(s, s.surface, 4);
    expect(s.caries.has("caries-occlusal")).toBe(true);
    expect(s.cariesSeverity.get("occlusal")).toBe(4);
  });
  it("filling + caries, pick CARS 0 (Sound) → REMOVES caries (revert to plain filling) and clears severity", () => {
    const s = makeState({ filled: true, caried: true, severity: 5 });
    applyRecurrentCariesScore(s, s.surface, 0);
    expect(s.caries.has("caries-occlusal")).toBe(false);
    expect(s.cariesSeverity.has("occlusal")).toBe(false);
    // The filling itself is untouched.
    expect(s.fillingSurfaceMaterials.has("occlusal")).toBe(true);
  });
  it("filling + caries, pick a new CARS > 0 → updates the stored severity, keeps the caries", () => {
    const s = makeState({ filled: true, caried: true, severity: 2 });
    applyRecurrentCariesScore(s, s.surface, 6);
    expect(s.caries.has("caries-occlusal")).toBe(true);
    expect(s.cariesSeverity.get("occlusal")).toBe(6);
  });
  it("NO filling on the surface → guarded no-op (a CARS score never lands as primary caries)", () => {
    const s = makeState({ caried: false });
    applyRecurrentCariesScore(s, s.surface, 4);
    expect(s.caries.has("caries-occlusal")).toBe(false);
    expect(s.cariesSeverity.has("occlusal")).toBe(false);
  });
});

// Builds a filling `.surface-cell` (input value = bare surface, e.g. "occlusal").
function buildFillingCell(surface: string): HTMLElement {
  const cell = document.createElement("div");
  cell.className = "surface-cell";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = surface;
  const ind = document.createElement("span");
  ind.className = "surf-depth";
  ind.innerHTML = "<i></i><i></i><i></i>";
  cell.appendChild(input);
  cell.appendChild(ind);
  return cell;
}

describe("syncFillingSubcariesIndicator — dark-border indicator on the filling cell (spec §4)", () => {
  it("filling + caries (recurrent) → adds `.has-subcaries` and shows the CARS badge value", () => {
    const cell = buildFillingCell("occlusal");
    const state = {
      caries: new Set(["caries-occlusal"]),
      cariesSeverity: new Map([["occlusal", 5]]),
      fillingSurfaceMaterials: new Map([["occlusal", "composite"]]),
    };
    __syncFillingSubcariesIndicatorForTest(cell, state);
    const ind = cell.querySelector(".surf-depth")!;
    expect(ind.classList.contains("has-subcaries")).toBe(true);
    expect(ind.getAttribute("data-icdas")).toBe("5");
  });
  it("filling but no caries → no `.has-subcaries`, neutral affordance (no CARS badge)", () => {
    const cell = buildFillingCell("occlusal");
    const state = {
      caries: new Set<string>(),
      cariesSeverity: new Map<string, number>(),
      fillingSurfaceMaterials: new Map([["occlusal", "composite"]]),
    };
    __syncFillingSubcariesIndicatorForTest(cell, state);
    const ind = cell.querySelector(".surf-depth")!;
    expect(ind.classList.contains("has-subcaries")).toBe(false);
    expect(ind.hasAttribute("data-icdas")).toBe(false);
  });
  it("caries but no filling on the surface → NOT recurrent, no `.has-subcaries`", () => {
    const cell = buildFillingCell("occlusal");
    const state = {
      caries: new Set(["caries-occlusal"]),
      cariesSeverity: new Map([["occlusal", 3]]),
      fillingSurfaceMaterials: new Map<string, string>(),
    };
    __syncFillingSubcariesIndicatorForTest(cell, state);
    expect(cell.querySelector(".surf-depth")!.classList.contains("has-subcaries")).toBe(false);
  });
});
