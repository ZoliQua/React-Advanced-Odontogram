// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP5 final-review fixes (data integrity + summary visibility).
//
// FIX 1 — version-gate the legacy secondary-caries inference: a surface with
// BOTH primary caries and a filling used to be re-derived as recurrent caries
// (CARS score 3) on every hydrate. That is correct ONLY for legacy (<2.3)
// payloads; a native ≥2.3 payload stores the score deliberately, so an unscored
// caried+filled surface must stay PRIMARY across export→reimport.
//
// FIX 3 — surface rootCaries + radiographicDepth in getOdontogramSummary so a
// tooth carrying only those findings is not summary-invisible.
//
// Driven through `__setToothStateForTest(tooth, raw, version)`, which invokes
// the exact per-tooth `hydrateState(raw, isLegacyPayloadVersion(version))` call
// that importStatus makes for a whole payload — no live DOM/SVG grid required
// (established seam; see payload-2-3-roundtrip.test.ts).
import { describe, it, expect } from "vitest";
import {
  __setToothStateForTest,
  __getToothStateForTest,
  __collectExportPayloadForTest,
  getOdontogramSummary,
} from "../odontogram";

// SP6 Task 1: the recurrent LAYER is now always filling-derived, so the
// version-gate no longer decides primary-vs-recurrent — it decides only whether
// a caries∩filling surface with no stored value gets an INFERRED severity (3)
// baked into the unified `cariesSeverity`, or is left to the render default (2).
const severityOf = (toothNo: number): Record<string, number> => {
  const s = __getToothStateForTest(toothNo) as { cariesSeverity?: Record<string, number> } | undefined;
  return s?.cariesSeverity ?? {};
};

describe("FIX 1: legacy caries∩filling severity inference is version-gated", () => {
  const cariedAndFilled = {
    toothSelection: "tooth-base",
    caries: ["caries-occlusal"],
    fillingSurfaceMaterials: { occlusal: "amalgam" },
  } as const;

  it("native ≥2.3 payload: a caried+filled surface with NO stored value is NOT force-scored (cariesSeverity empty)", () => {
    __setToothStateForTest(16, { ...cariedAndFilled }, "2.4");
    expect(severityOf(16)).toEqual({});
  });

  it("export -> reimport is IDEMPOTENT: no severity is injected on the round-trip", () => {
    __setToothStateForTest(16, { ...cariedAndFilled }, "2.4");
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    const raw16 = payload.teeth[16];
    // Serialized empty map is {} — not a stored severity.
    expect(raw16.cariesSeverity).toEqual({});
    // Re-import the exact exported record (as importStatus would) at 2.4.
    __setToothStateForTest(26, raw16, "2.4");
    expect(severityOf(26)).toEqual({});
  });

  it("legacy payloads (1.4, 2.0, 2.2, no-version) DO infer the caries∩filling surface as recurrent severity 3", () => {
    for (const version of ["1.4", "2.0", "2.2", undefined]) {
      __setToothStateForTest(17, { ...cariedAndFilled }, version as string | undefined);
      expect(severityOf(17)).toEqual({ occlusal: 3 });
    }
  });

  it("a stored native value always wins and is never overwritten by the (disabled) inference", () => {
    __setToothStateForTest(18, { ...cariedAndFilled, cariesSeverity: { occlusal: 5 } }, "2.4");
    expect(severityOf(18)).toEqual({ occlusal: 5 });
  });
});

describe("FIX 3: rootCaries + radiographicDepth appear in the odontogram summary", () => {
  const cariesItems = () =>
    getOdontogramSummary().sections.find((sec) => sec.key === "caries")?.items ?? [];

  it("a rootCaries-only tooth produces a caries summary line", () => {
    // Clear the other slots this suite touched so they don't pollute the summary.
    for (const n of [16, 17, 18, 26]) __setToothStateForTest(n, { toothSelection: "tooth-base" }, "2.3");
    __setToothStateForTest(15, { toothSelection: "tooth-base", rootCaries: "active" }, "2.3");
    expect(cariesItems().some((line) => line.includes("15"))).toBe(true);
  });

  it("a radiographicDepth-only surface produces a caries summary line", () => {
    __setToothStateForTest(14, { toothSelection: "tooth-base", radiographicDepth: { mesial: "D2" } }, "2.3");
    expect(cariesItems().some((line) => line.includes("14"))).toBe(true);
  });
});
