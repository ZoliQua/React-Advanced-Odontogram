// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { setCaseCondition, resetCaseMeta, getOdontogramSummary } from "../odontogram";

beforeEach(() => resetCaseMeta());

describe("whole-mouth summary: case/regional diagnoses fragment", () => {
  it("lists active case conditions with code + laterality in the summary", () => {
    setCaseCondition("tmjDisorder", "right");
    setCaseCondition("recurrentAphthae", "unspecified");
    const text = JSON.stringify(getOdontogramSummary());
    expect(text).toContain("K07.6");
    expect(text).toContain("K12.0");
  });
});
