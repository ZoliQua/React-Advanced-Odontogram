// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { optionsFor } from "../uiOptions";

describe("registry stable option lists match today's option functions", () => {
  it("toothSelection", () => expect(optionsFor("toothSelection")).toEqual([
    { value: "none", labelKey: "toothSelect.none" }, { value: "tooth-base", labelKey: "toothSelect.permanent" },
    { value: "milktooth", labelKey: "toothSelect.milk" }, { value: "implant", labelKey: "toothSelect.implant" },
    { value: "tooth-under-gum", labelKey: "toothSelect.underGum" }]));
  it("mobility", () => expect(optionsFor("mobility")).toEqual([
    { value: "none", labelKey: "mobility.none" }, { value: "m1", labelKey: "mobility.m1" },
    { value: "m2", labelKey: "mobility.m2" }, { value: "m3", labelKey: "mobility.m3" }]));
  it("periapicalType", () => expect(optionsFor("periapicalType")).toEqual([
    { value: "none", labelKey: "periapical.type.none" }, { value: "granuloma", labelKey: "periapical.type.granuloma" },
    { value: "cyst", labelKey: "periapical.type.cyst" }]));
  it("mods", () => expect(optionsFor("mods")).toEqual([
    { value: "parodontal", labelKey: "mods.parodontal" }, { value: "inflammation", labelKey: "mods.periapicalInflammation" }]));
  it("endo permanent", () => expect(optionsFor("endo").map(o => o.value)).toEqual([
    "none", "endo-medical-filling", "endo-filling", "endo-filling-incomplete", "endo-glass-pin", "endo-metal-pin"]));
  it("endo milktooth", () => expect(optionsFor("endo", { isMilktooth: true }).map(o => o.value)).toEqual([
    "none", "endo-medical-filling"]));
});
