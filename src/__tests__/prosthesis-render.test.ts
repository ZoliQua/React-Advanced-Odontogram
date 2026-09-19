// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP3b Task 2 byte-identical proof: implant attachments + removable dentures now
// render off the dedicated `prosthesis` axis (field-move from the legacy
// crownMaterial/bridgeUnit). Each value must activate the SAME SVG layer set the
// pre-move render did at a549534. Asserted via __renderActiveLayers (the seam
// that runs hydrateState), same pattern as restoration-behavior.test.ts.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { __renderActiveLayers } from "../odontogram";

function svgText(name: string): string {
  return readFileSync(fileURLToPath(new NodeURL(`../assets/teeth-svgs/${name}.svg`, import.meta.url)), "utf8");
}
const ids = (toothNo: number, state: Record<string, unknown>): string[] =>
  __renderActiveLayers(svgText(String(toothNo)), toothNo, state).map((l: any) => l.id);

describe("prosthesis axis render (SP3b field-move, byte-identical to a549534)", () => {
  it("implant + healing-abutment -> implant-healing-abutment", () => {
    const a = ids(14, { toothSelection: "implant", prosthesis: "healing-abutment" });
    expect(a).toContain("implant-healing-abutment");
  });
  it("implant + locator -> connector + locator-screw", () => {
    const a = ids(14, { toothSelection: "implant", prosthesis: "locator" });
    expect(a).toEqual(expect.arrayContaining(["implant", "implant-connector", "implant-locator-screw"]));
    expect(a).not.toContain("implant-bar");
    expect(a).not.toContain("prosthesis-implant-crown");
  });
  it("implant + locator-denture -> locator + prosthesis-implant trio", () => {
    const a = ids(14, { toothSelection: "implant", prosthesis: "locator-denture" });
    expect(a).toEqual(expect.arrayContaining([
      "implant", "implant-connector", "implant-locator-screw",
      "prosthesis-implant", "prosthesis-implant-crown", "prosthesis-implant-gum",
    ]));
  });
  it("implant + bar -> adds implant-bar", () => {
    const a = ids(14, { toothSelection: "implant", prosthesis: "bar" });
    expect(a).toEqual(expect.arrayContaining(["implant", "implant-connector", "implant-locator-screw", "implant-bar"]));
    expect(a).not.toContain("prosthesis-implant-crown");
  });
  it("implant + bar-denture -> bar + prosthesis-implant trio", () => {
    const a = ids(14, { toothSelection: "implant", prosthesis: "bar-denture" });
    expect(a).toEqual(expect.arrayContaining([
      "implant", "implant-connector", "implant-locator-screw", "implant-bar",
      "prosthesis-implant", "prosthesis-implant-crown", "prosthesis-implant-gum",
    ]));
  });
  it("gap tooth (none) + removable-partial -> prosthesis saddle", () => {
    const a = ids(14, { toothSelection: "none", prosthesis: "removable-partial" });
    expect(a).toEqual(expect.arrayContaining(["prosthesis", "prosthesis-crown", "prosthesis-connector"]));
  });
  it("gap tooth (none) + bar-denture -> implant-bar + prosthesis-implant trio (no connector/locator-screw on a gap)", () => {
    const a = ids(14, { toothSelection: "none", prosthesis: "bar-denture" });
    expect(a).toEqual(expect.arrayContaining([
      "implant", "implant-bar", "prosthesis-implant", "prosthesis-implant-crown", "prosthesis-implant-gum",
    ]));
    expect(a).not.toContain("implant-connector");
    expect(a).not.toContain("implant-locator-screw");
  });
});
