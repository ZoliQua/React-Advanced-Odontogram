// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// `getSelectedTeeth()` — the public read of the multi-tooth selection. Until now
// a host could clear the selection but not ask what it was; only the single
// active tooth was readable. Contributed in a downstream fork
// (sofia-cluadette/React-Odontogram-Modul).
import { describe, it, expect, beforeEach } from "vitest";
import * as App from "../App";
import {
  getSelectedTeeth, clearSelection, __setSelectionForTest, __resetChartStateForTest,
} from "../odontogram";

beforeEach(() => { __resetChartStateForTest(); clearSelection(); });

describe("getSelectedTeeth", () => {
  it("is empty when nothing is selected", () => {
    expect(getSelectedTeeth()).toEqual([]);
  });

  it("returns the selection in the order it was made", () => {
    __setSelectionForTest([26, 11, 47]);
    expect(getSelectedTeeth()).toEqual([26, 11, 47]);
  });

  it("hands out a copy — changing it never changes the selection", () => {
    __setSelectionForTest([16, 17]);
    const got = getSelectedTeeth();
    got.push(18);
    got.length = 0;
    expect(getSelectedTeeth()).toEqual([16, 17]);
  });

  it("follows clearSelection()", () => {
    __setSelectionForTest([21, 22]);
    clearSelection();
    expect(getSelectedTeeth()).toEqual([]);
  });

  it("is part of the public entry point", () => {
    expect(typeof App.getSelectedTeeth).toBe("function");
  });
});
