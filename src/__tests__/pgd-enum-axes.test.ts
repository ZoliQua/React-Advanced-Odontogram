// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import {
  setGingivalThickness, getGingivalThickness, setMillerClass, getMillerClass,
  __setToothStateForTest, __resetChartStateForTest,
  __collectExportPayloadForTest, __hydrateImportedChartsForTest,
} from "../odontogram";

beforeEach(() => __resetChartStateForTest());

describe("GT + Miller enum axes", () => {
  it("GT set/get, default unknown", () => {
    __setToothStateForTest(11, {});
    expect(getGingivalThickness(11)).toBe("unknown");
    setGingivalThickness(11, "thin"); expect(getGingivalThickness(11)).toBe("thin");
  });
  it("Miller set/get, default none", () => {
    __setToothStateForTest(11, {});
    expect(getMillerClass(11)).toBe("none");
    setMillerClass(11, "iii"); expect(getMillerClass(11)).toBe("iii");
  });
  it("invalid value is a no-op", () => {
    __setToothStateForTest(11, {});
    setGingivalThickness(11, "bogus"); expect(getGingivalThickness(11)).toBe("unknown");
  });
  it("omit-at-skip serialize + roundtrip", () => {
    __setToothStateForTest(11, {});
    expect(Object.prototype.hasOwnProperty.call(__collectExportPayloadForTest().teeth["11"], "gingivalThickness")).toBe(false);
    setGingivalThickness(11, "thick"); setMillerClass(11, "ii");
    const payload = __collectExportPayloadForTest();
    expect(payload.teeth["11"].gingivalThickness).toBe("thick");
    expect(payload.teeth["11"].millerClass).toBe("ii");
    const json = JSON.parse(JSON.stringify(payload));
    __resetChartStateForTest(); __hydrateImportedChartsForTest(json);
    expect(getGingivalThickness(11)).toBe("thick");
    expect(getMillerClass(11)).toBe("ii");
  });
  it("hydrate self-heals unknown value to default", () => {
    __hydrateImportedChartsForTest({ version: "2.15", teeth: { "11": { gingivalThickness: "bogus", millerClass: "x" } } });
    expect(getGingivalThickness(11)).toBe("unknown");
    expect(getMillerClass(11)).toBe("none");
  });
});
