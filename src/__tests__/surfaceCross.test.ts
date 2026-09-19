// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { buildSurfaceCross } from "../odontogram";

describe("buildSurfaceCross", () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("renders five positioned surface cells with checkbox inputs", () => {
    const items = [
      { value: "buccal", labelKey: "surface.buccal", letter: "B", pos: "buccal" },
      { value: "mesial", labelKey: "surface.mesial", letter: "M", pos: "mesial" },
      { value: "occlusal", labelKey: "surface.occlusal", letter: "O", pos: "occlusal" },
      { value: "distal", labelKey: "surface.distal", letter: "D", pos: "distal" },
      { value: "lingual", labelKey: "surface.lingualPalatal", letter: "L", pos: "lingual" },
    ];
    const seen: Array<[string, boolean]> = [];
    buildSurfaceCross(container, items, (v: string, on: boolean) => seen.push([v, on]));
    const inputs = container.querySelectorAll('input[type="checkbox"]');
    expect(inputs).toHaveLength(5);
    expect(container.querySelector(".surface-cross")).toBeTruthy();
    expect(container.querySelector(".surface-cell.pos-buccal")).toBeTruthy();
    expect(container.querySelector(".surface-cell.pos-occlusal .surf-letter")?.textContent).toBe("O");
    // toggle wiring
    (inputs[0] as HTMLInputElement).checked = true;
    inputs[0].dispatchEvent(new Event("change"));
    expect(seen[0][0]).toBe("buccal");
    expect(seen[0][1]).toBe(true);
  });
});
