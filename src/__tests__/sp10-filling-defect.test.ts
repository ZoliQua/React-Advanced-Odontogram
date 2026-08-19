// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { __setToothStateForTest, __getToothStateForTest, __collectExportPayloadForTest, VALID_FILLING_DEFECT, applyFillingDefect } from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";
import { setI18nLanguage, t } from "../i18n/useI18n";

beforeEach(() => setI18nLanguage("en"));

describe("SP10 Task 1: fillingDefect field + round-trip", () => {
  it("VALID_FILLING_DEFECT has none/marginal/fracture/wear", () => {
    expect(Array.from(VALID_FILLING_DEFECT).sort()).toEqual(["fracture","marginal","none","wear"]);
  });
  it("applyFillingDefect sets/clears a surface", () => {
    const m = new Map<string,string>();
    applyFillingDefect(m, "occlusal", "fracture"); expect(m.get("occlusal")).toBe("fracture");
    applyFillingDefect(m, "occlusal", "none"); expect(m.has("occlusal")).toBe(false);
  });
  it("JSON export stamps 2.7 and round-trips fillingDefect", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", fillingSurfaceMaterials: { occlusal: "composite" }, fillingDefect: { occlusal: "fracture" } });
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    expect(payload.teeth[16].fillingDefect).toEqual({ occlusal: "fracture" });
  });
  it("hydrate reads fillingDefect back, drops invalid", () => {
    __setToothStateForTest(17, { toothSelection: "tooth-base", fillingSurfaceMaterials: { mesial: "amalgam" }, fillingDefect: { mesial: "wear", bogus: "x" } });
    const s = __getToothStateForTest(17)!;
    expect(s.fillingDefect).toEqual({ mesial: "wear" });
  });
  it("FHIR round-trips fillingDefect", () => {
    __setToothStateForTest(26, { toothSelection: "tooth-base", fillingSurfaceMaterials: { distal: "gic" }, fillingDefect: { distal: "marginal" } });
    const bundle = buildFhirBundle(__collectExportPayloadForTest());
    const parsed = parseFhirBundle(bundle);
    expect(parsed.teeth["26"].fillingDefect).toEqual({ distal: "marginal" });
  });
  it("i18n labels exist", () => {
    expect(t("fillingDefect.fracture")).not.toContain("fillingDefect.");
  });
});
