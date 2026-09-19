// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import {
  periapicalRowVisible,
  __setToothStateForTest,
  __getToothStateForTest,
} from "../odontogram";

describe("SP7 Task 2: lesion subtype visible only under apical periodontitis", () => {
  it("visible for symptomatic and asymptomatic AP, hidden otherwise", () => {
    expect(periapicalRowVisible({ toothSelection: "tooth-base", apicalDx: "symptomatic-apical-periodontitis" })).toBe(true);
    expect(periapicalRowVisible({ toothSelection: "tooth-base", apicalDx: "asymptomatic-apical-periodontitis" })).toBe(true);
    expect(periapicalRowVisible({ toothSelection: "tooth-base", apicalDx: "acute-apical-abscess" })).toBe(false);
    expect(periapicalRowVisible({ toothSelection: "tooth-base", apicalDx: "condensing-osteitis" })).toBe(false);
    expect(periapicalRowVisible({ toothSelection: "tooth-base", apicalDx: "normal" })).toBe(false);
  });
});

describe("SP7 Task 2: hydrate reconciles present-tooth periapicalType", () => {
  it("orphaned abscess subtype with no apical diagnosis is cleared, not resurrected", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", apicalDx: "normal", periapicalType: "abscess" });
    const s = __getToothStateForTest(11)!;
    expect(s.apicalDx).toBe("normal");
    expect(s.periapicalType).toBe("none");
  });
  it("granuloma under condensing-osteitis (invalid combo) -> subtype cleared", () => {
    __setToothStateForTest(12, { toothSelection: "tooth-base", apicalDx: "condensing-osteitis", periapicalType: "granuloma" });
    expect(__getToothStateForTest(12)!.periapicalType).toBe("none");
  });
  it("granuloma under asymptomatic AP is kept", () => {
    __setToothStateForTest(13, { toothSelection: "tooth-base", apicalDx: "asymptomatic-apical-periodontitis", periapicalType: "granuloma" });
    expect(__getToothStateForTest(13)!.periapicalType).toBe("granuloma");
  });
});
