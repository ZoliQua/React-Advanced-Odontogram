// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { validValues, validSurfaces } from "../validate";

const EXPECT: Record<string, string[]> = {
  toothSelection: ["none","tooth-base","milktooth","implant","tooth-under-gum","no-tooth-after-extraction"],
  endo: ["none","endo-medical-filling","endo-filling","endo-filling-incomplete","endo-glass-pin","endo-metal-pin"],
  fillingMaterial: ["none","amalgam","composite","gic","temporary"],
  mobility: ["none","m1","m2","m3"],
  toothSubstrate: ["natural","radix","broken","crownprep"],
  restorationType: ["none","crown","inlay","onlay","veneer","bridge"],
  restorationMaterial: ["none","emax","gold","gradia","zircon","metal","metal-ceramic","telescope","temporary"],
  mods: ["inflammation","parodontal","mobility"],
  periapicalType: ["none","granuloma","cyst","abscess"],
  caries: ["caries-subcrown","caries-buccal","caries-lingual","caries-mesial","caries-distal","caries-occlusal"],
};

describe("registry validation vocabulary equals today's VALID_* sets", () => {
  for (const [axis, expected] of Object.entries(EXPECT)) {
    it(`validValues("${axis}")`, () => expect(validValues(axis)).toEqual(new Set(expected)));
  }
  it("validSurfaces()", () => expect(validSurfaces()).toEqual(new Set(["buccal","lingual","mesial","distal","occlusal"])));
});
