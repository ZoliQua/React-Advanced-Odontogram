// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { hasAnyPerioData, setPerioSite, setPlaque, setFurcation, setCejVisibility, setRootConcavity, setKeratinizedWidth, __resetChartStateForTest } from "../odontogram";

describe("UI-3b T2: hasAnyPerioData", () => {
  beforeEach(() => __resetChartStateForTest());

  it("false on a blank chart", () => {
    expect(hasAnyPerioData()).toBe(false);
  });

  it("true once a PD site is charted", () => {
    setPerioSite(11, "MB", { pd: 4 });
    expect(hasAnyPerioData()).toBe(true);
  });

  it("true when only plaque is charted (no PD)", () => {
    setPlaque(11, "buccal", true);
    expect(hasAnyPerioData()).toBe(true);
  });

  it("true when only furcation is charted (no PD)", () => {
    setFurcation(16, "buccal", 2);
    expect(hasAnyPerioData()).toBe(true);
  });

  // These three axes are NOT surfaced by getPerioSummary()'s counters, so the
  // predicate scans for them directly (regression guard for the T2 review's
  // Important finding — else a chart with ONLY such a finding auto-skips perio).
  it("true when only CEJ visibility is charted (no PD)", () => {
    setCejVisibility(11, "detectable");
    expect(hasAnyPerioData()).toBe(true);
  });

  it("true when only root concavity is charted (no PD)", () => {
    setRootConcavity(11, "mild");
    expect(hasAnyPerioData()).toBe(true);
  });

  it("true when only a NON-deficient KG width is charted (kg>=2, no PD)", () => {
    setKeratinizedWidth(11, 5);
    expect(hasAnyPerioData()).toBe(true);
  });
});
