// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { AXES } from "../axes";
import { FIELD_MAPPINGS } from "../../fhir/fieldMappings";
import { VALID_PERI_IMPLANT } from "../../odontogram";

describe("SP8 Task 1: periImplant axis", () => {
  it("has the 5 values", () => {
    expect(Array.from(VALID_PERI_IMPLANT).sort()).toEqual(
      ["mucositis","none","peri-implantitis-mild","peri-implantitis-moderate","peri-implantitis-severe"]);
  });
  it("axis exists with no svgLayer (explicit activation, apicalDx-style)", () => {
    const ax = AXES.find(a => a.id === "periImplant");
    expect(ax).toBeTruthy();
    expect(ax!.svgLayer).toBeUndefined();
    expect(ax!.skipValue).toBe("none");
  });
  it("has a matching FIELD_MAPPINGS row (parity)", () => {
    const fm = FIELD_MAPPINGS.find(m => m.field === "periImplant");
    expect(fm).toBeTruthy();
    expect(fm!.findingCode).toBe("peri-implant-status");
    expect((fm as { valueGroup?: string }).valueGroup).toBe("periImplant");
  });
});
