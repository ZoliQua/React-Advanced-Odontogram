// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { __renderActiveLayers, __setToothStateForTest, __getToothStateForTest, __collectExportPayloadForTest, VALID_WEAR_EDGE, VALID_WEAR_CERVICAL } from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";

const svgText = readFileSync(fileURLToPath(new NodeURL("../assets/teeth-svgs/11.svg", import.meta.url)), "utf8");
const render = (state: Record<string, unknown>) => __renderActiveLayers(svgText, 11, state);
const ids = (l: { id: string }[]) => l.map(x => x.id);

describe("SP11: wear enums replace bruxism booleans", () => {
  it("valid sets", () => {
    expect(Array.from(VALID_WEAR_EDGE).sort()).toEqual(["attrition","erosion","none"]);
    expect(Array.from(VALID_WEAR_CERVICAL).sort()).toEqual(["abfraction","abrasion","erosion","none"]);
  });
  it("byte-identical: legacy {bruxismWear:true} === modern {wearEdge:attrition}", () => {
    const legacy = render({ toothSelection: "tooth-base", bruxismWear: true });
    const modern = render({ toothSelection: "tooth-base", wearEdge: "attrition" });
    expect(modern).toEqual(legacy);
    expect(ids(legacy)).toContain("tooth-bruxism-wear");
  });
  it("byte-identical: legacy {bruxismNeckWear:true} === modern {wearCervical:abrasion}", () => {
    const legacy = render({ toothSelection: "tooth-base", bruxismNeckWear: true });
    const modern = render({ toothSelection: "tooth-base", wearCervical: "abrasion" });
    expect(modern).toEqual(legacy);
    expect(ids(legacy)).toContain("tooth-bruxism-neck-wear");
  });
  it("edge + cervical independent; erosion renders its own layer per location", () => {
    const l = render({ toothSelection: "tooth-base", wearEdge: "erosion", wearCervical: "abfraction" });
    expect(ids(l)).toContain("tooth-bruxism-wear");
    expect(ids(l)).toContain("tooth-bruxism-neck-wear");
  });
  it("none renders neither; gated off under a restoration / non-natural substrate", () => {
    expect(ids(render({ toothSelection: "tooth-base" }))).not.toContain("tooth-bruxism-wear");
    expect(ids(render({ toothSelection: "tooth-base", wearEdge: "attrition", restorationType: "crown" }))).not.toContain("tooth-bruxism-wear");
    expect(ids(render({ toothSelection: "tooth-base", wearEdge: "attrition", toothSubstrate: "radix" }))).not.toContain("tooth-bruxism-wear");
  });
  it("migration + modern-wins + FHIR/JSON round-trip", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", bruxismWear: true, bruxismNeckWear: true });
    const s = __getToothStateForTest(11)!;
    expect(s.wearEdge).toBe("attrition");
    expect(s.wearCervical).toBe("abrasion");
    expect(s).not.toHaveProperty("bruxismWear");
    __setToothStateForTest(12, { toothSelection: "tooth-base", bruxismWear: true, wearEdge: "erosion" });
    expect(__getToothStateForTest(12)!.wearEdge).toBe("erosion"); // modern wins
    __setToothStateForTest(13, { toothSelection: "tooth-base", wearEdge: "erosion", wearCervical: "abfraction" });
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    const parsed = parseFhirBundle(buildFhirBundle(payload));
    expect(parsed.teeth["13"].wearEdge).toBe("erosion");
    expect(parsed.teeth["13"].wearCervical).toBe("abfraction");
  });
});
