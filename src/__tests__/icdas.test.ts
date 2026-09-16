// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { icdasTier, threeLevelToIcdas, icdasToThreeLevel } from "../odontogram";
import { deriveCariesDetail } from "../dx/derive";

describe("ICDAS mapping helpers", () => {
  it("icdasTier groups 1-2/3-4/5-6", () => {
    expect([1,2].map(icdasTier)).toEqual([1,1]);
    expect([3,4].map(icdasTier)).toEqual([2,2]);
    expect([5,6].map(icdasTier)).toEqual([3,3]);
  });
  it("threeLevelToIcdas maps to representative codes", () => {
    expect(threeLevelToIcdas("surface")).toBe(2);
    expect(threeLevelToIcdas("dentin")).toBe(4);
    expect(threeLevelToIcdas("deep")).toBe(6);
    expect(threeLevelToIcdas("nonsense")).toBe(2);
  });
  it("icdasToThreeLevel is the inverse grouping", () => {
    expect([1,2].map(icdasToThreeLevel)).toEqual(["surface","surface"]);
    expect([3,4].map(icdasToThreeLevel)).toEqual(["dentin","dentin"]);
    expect([5,6].map(icdasToThreeLevel)).toEqual(["deep","deep"]);
  });

  // The visual ramp and the CODING depth axis are two different scales, and a
  // code review flagged their disagreement on ICDAS 3 as a possible defect. It
  // is intentional: ICDAS 3 is localized enamel breakdown with NO visible
  // dentin, so the exported code is "limited to enamel", while the chart shows
  // it at mid severity because the lesion has broken the surface. Pinned side
  // by side so nobody "aligns" one to the other by accident.
  it("the visual ramp and the exported depth axis diverge on ICDAS 3, deliberately", () => {
    expect(icdasToThreeLevel(3)).toBe("dentin");                          // mid-severity bar
    expect(deriveCariesDetail({ caries: ["caries-occlusal"], cariesSeverity: { occlusal: 3 } }).depth)
      .toBe("enamel");                                                    // K02.0, per ICDAS
    // …and they agree everywhere else.
    expect(icdasToThreeLevel(4)).toBe("dentin");
    expect(deriveCariesDetail({ caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } }).depth)
      .toBe("dentine");
  });
});
