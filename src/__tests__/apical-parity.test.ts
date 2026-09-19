// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP4 Task 4 byte-identical proof: the `apicalDx` clinical axis drives the
// periapical glyph on a PRESENT tooth, decoupled from `mods.inflammation`.
// A legacy present-tooth payload `{mods:["inflammation"], periapicalType:X}`
// must migrate to `{apicalDx:<derived>, periapicalType:X}` (inflammation mod
// stripped) and render the IDENTICAL glyph set — including the `inflammationHome`
// z-order lift (odontogram.ts ~1075-1110) when the glyph coincides with an
// active endo-resection / endo-resorption layer. Meanwhile `mods.inflammation`
// KEEPS its SECOND, periodontal role on a NON-present (missing / implant) tooth:
// there it still drives the glyph and is LEFT in mods untouched.
//
// This asserts the two render paths directly against each other (and the
// migration output via the state getters), NOT against a frozen snapshot, so it
// can't silently "pass" a golden that was mis-captured. Complementary to the
// appended golden fixtures in parity/matrix.ts (apicalDxParityCases).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { __renderActiveLayers, __setToothStateForTest, __getToothStateForTest } from "../odontogram";

const testFileUrl = import.meta.url;
const svgText = readFileSync(
  fileURLToPath(new URL("../assets/teeth-svgs/11.svg", testFileUrl)),
  "utf8",
);
const render = (state: Record<string, unknown>) => __renderActiveLayers(svgText, 11, state);
const ids = (layers: { id: string }[]) => layers.map(l => l.id);
const indexOf = (layers: { id: string }[], id: string) => layers.findIndex(l => l.id === id);

describe("SP4 Task 4: apicalDx drives the periapical glyph on a PRESENT tooth (byte-identical to legacy mods.inflammation)", () => {
  it("legacy {mods:[inflammation], periapicalType:cyst} === modern {apicalDx:asymptomatic-apical-periodontitis, periapicalType:cyst} (cysta glyph)", () => {
    const legacy = render({ toothSelection: "tooth-base", mods: ["inflammation"], periapicalType: "cyst" });
    const modern = render({ toothSelection: "tooth-base", apicalDx: "asymptomatic-apical-periodontitis", periapicalType: "cyst" });
    expect(modern).toEqual(legacy);
    expect(ids(legacy)).toContain("cysta");
    expect(ids(legacy)).not.toContain("granuloma");
  });

  it("legacy {mods:[inflammation]} (no periapicalType) === modern {apicalDx:asymptomatic-apical-periodontitis} (granuloma default)", () => {
    const legacy = render({ toothSelection: "tooth-base", mods: ["inflammation"] });
    const modern = render({ toothSelection: "tooth-base", apicalDx: "asymptomatic-apical-periodontitis" });
    expect(modern).toEqual(legacy);
    expect(ids(legacy)).toContain("granuloma");
  });

  it("legacy {mods:[inflammation], periapicalType:abscess} === modern {apicalDx:acute-apical-abscess, periapicalType:abscess} (abscess glyph)", () => {
    const legacy = render({ toothSelection: "tooth-base", mods: ["inflammation"], periapicalType: "abscess" });
    const modern = render({ toothSelection: "tooth-base", apicalDx: "acute-apical-abscess", periapicalType: "abscess" });
    expect(modern).toEqual(legacy);
    expect(ids(legacy)).toContain("abscess");
  });

  it("apicalDx suggests abscess even without periapicalType (chronic-apical-abscess -> abscess glyph)", () => {
    const acute = render({ toothSelection: "tooth-base", apicalDx: "acute-apical-abscess" });
    const chronic = render({ toothSelection: "tooth-base", apicalDx: "chronic-apical-abscess" });
    expect(ids(acute)).toContain("abscess");
    expect(ids(chronic)).toContain("abscess");
  });

  it("apicalDx:normal renders no periapical glyph (regression control)", () => {
    const layers = render({ toothSelection: "tooth-base", apicalDx: "normal" });
    expect(ids(layers)).not.toContain("granuloma");
    expect(ids(layers)).not.toContain("cysta");
    expect(ids(layers)).not.toContain("abscess");
    expect(ids(layers)).not.toContain("inflammation");
  });
});

describe("SP4 Task 4: inflammationHome z-order lift still fires for the apicalDx-driven glyph", () => {
  it("endo-resection: legacy {mods:[inflammation], endoResection} === modern {apicalDx, endoResection}, glyph lifted above endo-resection", () => {
    const legacy = render({ toothSelection: "tooth-base", mods: ["inflammation"], endoResection: true });
    const modern = render({ toothSelection: "tooth-base", apicalDx: "asymptomatic-apical-periodontitis", endoResection: true });
    expect(modern).toEqual(legacy);
    // The lift re-parents the inflammation group AFTER endo-resection in document
    // order, so the glyph paints on top — confirm in both, not merely absent.
    expect(indexOf(modern, "inflammation")).toBeGreaterThan(indexOf(modern, "endo-resection"));
    expect(indexOf(legacy, "inflammation")).toBeGreaterThan(indexOf(legacy, "endo-resection"));
  });

  it("endo-resorption: legacy {mods:[inflammation], rootResorption} === modern {apicalDx, resorptionType}, glyph lifted above endo-resorption", () => {
    const legacy = render({ toothSelection: "tooth-base", mods: ["inflammation"], rootResorption: true });
    const modern = render({ toothSelection: "tooth-base", apicalDx: "asymptomatic-apical-periodontitis", resorptionType: "external-cervical" });
    expect(modern).toEqual(legacy);
    expect(indexOf(modern, "inflammation")).toBeGreaterThan(indexOf(modern, "endo-resorption"));
    expect(indexOf(legacy, "inflammation")).toBeGreaterThan(indexOf(legacy, "endo-resorption"));
  });
});

describe("SP4 Task 4: mods.inflammation keeps its PERIODONTAL role on a NON-present tooth (unchanged)", () => {
  it("missing tooth + mods.inflammation still renders the periapical/periodontal glyph (granuloma by default)", () => {
    const layers = render({ toothSelection: "none", mods: ["inflammation"] });
    expect(ids(layers)).toContain("inflammation");
    expect(ids(layers)).toContain("granuloma");
  });

  it("missing tooth + mods.inflammation + periapicalType:cyst renders the cysta glyph (subtype preserved)", () => {
    const layers = render({ toothSelection: "none", mods: ["inflammation"], periapicalType: "cyst" });
    expect(ids(layers)).toContain("cysta");
  });

  it("missing tooth: apicalDx alone does NOT drive a glyph (the axis is present-tooth-only)", () => {
    const layers = render({ toothSelection: "none", apicalDx: "acute-apical-abscess" });
    expect(ids(layers)).not.toContain("abscess");
    expect(ids(layers)).not.toContain("granuloma");
    expect(ids(layers)).not.toContain("inflammation");
  });

  // SP8 Task 3: an implant is the one non-present toothSelection where
  // mods.inflammation's periodontal role is now retired — the finding is
  // expressed via the periImplant axis instead (see sp8-peri-implant-render.test.ts).
  // This narrows the "NON-present tooth (unchanged)" describe block: implant
  // no longer matches missing/extraction-socket, which keep the legacy glyph
  // (still asserted above/below).
  it("implant + mods.inflammation no longer renders the glyph (retired in favor of the periImplant axis)", () => {
    const layers = render({ toothSelection: "implant", mods: ["inflammation"] });
    expect(ids(layers)).not.toContain("granuloma");
    expect(ids(layers)).not.toContain("inflammation");
  });
});

describe("SP4 Task 4: hydrateState migration derivation + present-tooth mods.inflammation removal", () => {
  it("present tooth: mods.inflammation -> apicalDx derived and the inflammation mod is REMOVED", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", mods: ["inflammation"] });
    const s = __getToothStateForTest(11)!;
    expect(s.apicalDx).toBe("asymptomatic-apical-periodontitis");
    expect(s.mods).not.toContain("inflammation");
  });

  it("present tooth: periapicalType:abscess -> apicalDx:acute-apical-abscess", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", mods: ["inflammation"], periapicalType: "abscess" });
    const s = __getToothStateForTest(11)!;
    expect(s.apicalDx).toBe("acute-apical-abscess");
    // SP7 Task 2: the legacy `abscess` subtype is redundant with the apicalDx
    // abscess category it migrates to, so the hydrate reconcile clears it —
    // the finding is preserved on apicalDx alone.
    expect(s.periapicalType).toBe("none");
    expect(s.mods).not.toContain("inflammation");
  });

  it("present tooth: periapicalType:cyst is preserved as the lesion subtype; apicalDx:asymptomatic-apical-periodontitis", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", mods: ["inflammation"], periapicalType: "cyst" });
    const s = __getToothStateForTest(11)!;
    expect(s.apicalDx).toBe("asymptomatic-apical-periodontitis");
    expect(s.periapicalType).toBe("cyst");
  });

  it("MISSING tooth: mods.inflammation is LEFT untouched (periodontal) and apicalDx stays normal", () => {
    __setToothStateForTest(11, { toothSelection: "none", mods: ["inflammation"] });
    const s = __getToothStateForTest(11)!;
    expect(s.mods).toContain("inflammation");
    expect(s.apicalDx).toBe("normal");
  });

  it("a modern payload's own apicalDx wins over the derived legacy value", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", mods: ["inflammation"], apicalDx: "condensing-osteitis" });
    const s = __getToothStateForTest(11)!;
    expect(s.apicalDx).toBe("condensing-osteitis");
  });
});
