// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP4 final-review fixes:
//  - periapicalRowVisible: the lesion-subtype row must stay authorable on a
//    non-present tooth (implant/missing) carrying mods.inflammation (regression
//    where the apicalDx-only gate hid it for implants).
//  - extraction-socket path locked (was untested by apical-parity, which only
//    covers "none"/"implant"): a socket lesion still renders its glyph.
//
// SP7 Task 2 update: the lesion-subtype row now gates strictly on apicalDx
// being symptomatic/asymptomatic apical periodontitis (see periapicalRowVisible
// doc-comment in odontogram.ts) — granuloma/cyst is a refinement of apical
// periodontitis only, not of the abscess categories. The mods.inflammation-driven
// branch for non-present teeth (implant/missing) is removed; subtype authoring
// on those tooth states is deferred to the peri-implantitis sub-project, so the
// row is hidden for them regardless of mods.inflammation. Assertions below are
// updated to match this narrower, documented contract.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { __renderActiveLayers, periapicalRowVisible } from "../odontogram";

function svgText(name: string): string {
  return readFileSync(fileURLToPath(new NodeURL(`../assets/teeth-svgs/${name}.svg`, import.meta.url)), "utf8");
}
const ids = (toothNo: number, state: Record<string, unknown>): string[] =>
  __renderActiveLayers(svgText(String(toothNo)), toothNo, state).map((l: any) => l.id);

describe("SP4 fix: periapical lesion-subtype row visibility", () => {
  const S = (o: Record<string, unknown>) => ({ apicalDx: "normal", toothSelection: "tooth-base", mods: new Set<string>(), ...o });
  it("present tooth: follows apicalDx, gated to apical-periodontitis only (SP7)", () => {
    expect(periapicalRowVisible(S({ apicalDx: "normal" }))).toBe(false);
    expect(periapicalRowVisible(S({ apicalDx: "chronic-apical-abscess" }))).toBe(false);
    expect(periapicalRowVisible(S({ apicalDx: "asymptomatic-apical-periodontitis" }))).toBe(true);
  });
  it("implant with mods.inflammation: row hidden (subtype authoring deferred, SP7)", () => {
    expect(periapicalRowVisible(S({ toothSelection: "implant", mods: new Set(["inflammation"]) }))).toBe(false);
  });
  it("implant without inflammation: hidden", () => {
    expect(periapicalRowVisible(S({ toothSelection: "implant" }))).toBe(false);
  });
  it("missing tooth with inflammation: row hidden (subtype authoring deferred, SP7)", () => {
    expect(periapicalRowVisible(S({ toothSelection: "none", mods: new Set(["inflammation"]) }))).toBe(false);
  });
});

describe("SP4: extraction-socket apical lesion renders (locked)", () => {
  it("a socket with apicalDx + periapicalType renders the chosen glyph", () => {
    const a = ids(11, { toothSelection: "no-tooth-after-extraction", apicalDx: "asymptomatic-apical-periodontitis", periapicalType: "granuloma" });
    expect(a).toContain("granuloma");
  });
});
