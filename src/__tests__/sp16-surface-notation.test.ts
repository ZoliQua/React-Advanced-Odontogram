// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP16 Task 2: position-aware surface notation (letters + captions) +
// simple/full setting.
//
// `surfaceNotation` ("simple" | "full", default "full") drives how the
// caries/filling surface letters (`surfaceLetter`) and captions
// (`surfaceLabelKey`) are resolved:
//
//   FULL (default, position-aware): occlusal -> anterior "I" (incisal) /
//   posterior "O" (occlusal); buccal -> anterior "L" (labial) / posterior
//   "B" (buccal); lingual -> upper "P" (palatal) / lower "L" (lingual);
//   mesial -> "M"; distal -> "D"; subcrown -> "SC".
//
//   SIMPLE (always, tooth-independent): buccal "B", occlusal "O", lingual
//   "L", mesial "M", distal "D", subcrown "SC".
//
// KNOWN COLLISION (ratified, implemented anyway): a LOWER ANTERIOR tooth in
// full mode shows "L" for BOTH buccal(labial) and lingual(lingual) — position
// in the surface-cross and the caption disambiguate; a summary "(L, L)" is
// inherently ambiguous, which is accepted.
//
// No live DOM/SVG grid required — driven through the pure/exported helpers
// (surfaceLetter, surfaceLabelKey, isUpperTooth, isAnteriorTooth,
// summarySurfaceLetter is exercised indirectly through subcariesLettersForTooth,
// which is exported), same seam as sp6-task4's tests.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  surfaceLetter,
  surfaceLabelKey,
  isUpperTooth,
  setSurfaceNotation,
  getSurfaceNotation,
  subcariesLettersForTooth,
  onStateChange,
  getOdontogramSummary,
  __setToothStateForTest,
} from "../odontogram";

// Representative teeth: 16 upper-posterior, 11 upper-anterior,
// 36 lower-posterior, 31 lower-anterior.
const UPPER_POST = 16;
const UPPER_ANT = 11;
const LOWER_POST = 36;
const LOWER_ANT = 31;

// setSurfaceNotation is module-level state — isolate it so it never leaks
// into other test files/tests (mirrors the wearDetailLevel afterEach pattern
// in sp13-tooth-details.test.ts).
beforeEach(() => {
  setSurfaceNotation("full");
});
afterEach(() => {
  setSurfaceNotation("full");
});

describe("isUpperTooth", () => {
  it("is true for quadrants 1/2 (permanent upper) and 5/6 (milk upper)", () => {
    for (const tn of [11, 16, 21, 26, 51, 55, 61, 65]) {
      expect(isUpperTooth(tn)).toBe(true);
    }
  });
  it("is false for quadrants 3/4 (permanent lower) and 7/8 (milk lower)", () => {
    for (const tn of [31, 36, 41, 46, 71, 75, 81, 85]) {
      expect(isUpperTooth(tn)).toBe(false);
    }
  });
});

describe("setSurfaceNotation / getSurfaceNotation", () => {
  it("defaults to \"full\"", () => {
    expect(getSurfaceNotation()).toBe("full");
  });
  it("accepts \"simple\"", () => {
    setSurfaceNotation("simple");
    expect(getSurfaceNotation()).toBe("simple");
  });
  it("sanitizes unknown values to \"full\"", () => {
    setSurfaceNotation("simple");
    setSurfaceNotation("bogus" as any);
    expect(getSurfaceNotation()).toBe("full");
  });
});

describe("surfaceLetter — FULL mode (default) mapping table", () => {
  it("16 (upper posterior): buccal->B, occlusal->O, lingual->P, mesial->M, distal->D", () => {
    expect(surfaceLetter("buccal", UPPER_POST)).toBe("B");
    expect(surfaceLetter("occlusal", UPPER_POST)).toBe("O");
    expect(surfaceLetter("lingual", UPPER_POST)).toBe("P");
    expect(surfaceLetter("mesial", UPPER_POST)).toBe("M");
    expect(surfaceLetter("distal", UPPER_POST)).toBe("D");
  });
  it("11 (upper anterior): buccal->L (labial), occlusal->I (incisal), lingual->P (palatal)", () => {
    expect(surfaceLetter("buccal", UPPER_ANT)).toBe("L");
    expect(surfaceLetter("occlusal", UPPER_ANT)).toBe("I");
    expect(surfaceLetter("lingual", UPPER_ANT)).toBe("P");
    expect(surfaceLetter("mesial", UPPER_ANT)).toBe("M");
    expect(surfaceLetter("distal", UPPER_ANT)).toBe("D");
  });
  it("36 (lower posterior): buccal->B, occlusal->O, lingual->L (lingual)", () => {
    expect(surfaceLetter("buccal", LOWER_POST)).toBe("B");
    expect(surfaceLetter("occlusal", LOWER_POST)).toBe("O");
    expect(surfaceLetter("lingual", LOWER_POST)).toBe("L");
    expect(surfaceLetter("mesial", LOWER_POST)).toBe("M");
    expect(surfaceLetter("distal", LOWER_POST)).toBe("D");
  });
  it("31 (lower anterior): buccal->L (labial), occlusal->I (incisal), lingual->L (lingual) — KNOWN COLLISION, ratified", () => {
    expect(surfaceLetter("buccal", LOWER_ANT)).toBe("L");
    expect(surfaceLetter("occlusal", LOWER_ANT)).toBe("I");
    expect(surfaceLetter("lingual", LOWER_ANT)).toBe("L");
    expect(surfaceLetter("mesial", LOWER_ANT)).toBe("M");
    expect(surfaceLetter("distal", LOWER_ANT)).toBe("D");
    // The collision: both buccal and lingual letter identically as "L".
    expect(surfaceLetter("buccal", LOWER_ANT)).toBe(surfaceLetter("lingual", LOWER_ANT));
  });
  it("subcrown is always \"SC\", regardless of tooth", () => {
    expect(surfaceLetter("subcrown", UPPER_POST)).toBe("SC");
    expect(surfaceLetter("subcrown", LOWER_ANT)).toBe("SC");
    expect(surfaceLetter("subcrown")).toBe("SC");
  });
  it("with no toothNo (or null), anterior/upper are treated as false (posterior/lower defaults)", () => {
    expect(surfaceLetter("occlusal")).toBe("O");
    expect(surfaceLetter("buccal", null)).toBe("B");
    expect(surfaceLetter("lingual", null)).toBe("L");
  });
});

describe("surfaceLetter — SIMPLE mode: always tooth-independent B/O/L/M/D/SC", () => {
  beforeEach(() => setSurfaceNotation("simple"));

  it("16 (upper posterior)", () => {
    expect(surfaceLetter("buccal", UPPER_POST)).toBe("B");
    expect(surfaceLetter("occlusal", UPPER_POST)).toBe("O");
    expect(surfaceLetter("lingual", UPPER_POST)).toBe("L");
  });
  it("11 (upper anterior) — occlusal stays \"O\", buccal stays \"B\", NOT I/L", () => {
    expect(surfaceLetter("occlusal", UPPER_ANT)).toBe("O");
    expect(surfaceLetter("buccal", UPPER_ANT)).toBe("B");
    expect(surfaceLetter("lingual", UPPER_ANT)).toBe("L");
  });
  it("36 (lower posterior)", () => {
    expect(surfaceLetter("buccal", LOWER_POST)).toBe("B");
    expect(surfaceLetter("occlusal", LOWER_POST)).toBe("O");
    expect(surfaceLetter("lingual", LOWER_POST)).toBe("L");
  });
  it("31 (lower anterior) — even upper lingual stays \"L\", not \"P\"", () => {
    expect(surfaceLetter("occlusal", LOWER_ANT)).toBe("O");
    expect(surfaceLetter("buccal", LOWER_ANT)).toBe("B");
    expect(surfaceLetter("lingual", LOWER_ANT)).toBe("L");
  });
  it("mesial/distal/subcrown are unaffected by the mode", () => {
    expect(surfaceLetter("mesial", UPPER_ANT)).toBe("M");
    expect(surfaceLetter("distal", UPPER_ANT)).toBe("D");
    expect(surfaceLetter("subcrown", UPPER_ANT)).toBe("SC");
  });
});

describe("surfaceLabelKey — FULL mode (default): arch/anterior-aware caption keys", () => {
  it("16 (upper posterior): occlusal/buccal/lingual use the generic keys", () => {
    expect(surfaceLabelKey("occlusal", UPPER_POST)).toBe("surface.occlusal");
    expect(surfaceLabelKey("buccal", UPPER_POST)).toBe("surface.buccal");
    expect(surfaceLabelKey("lingual", UPPER_POST)).toBe("surface.palatal");
  });
  it("11 (upper anterior): incisal / labial / palatal", () => {
    expect(surfaceLabelKey("occlusal", UPPER_ANT)).toBe("surface.incisal");
    expect(surfaceLabelKey("buccal", UPPER_ANT)).toBe("surface.labial");
    expect(surfaceLabelKey("lingual", UPPER_ANT)).toBe("surface.palatal");
  });
  it("36 (lower posterior): occlusal/buccal generic, lingual -> surface.lingual", () => {
    expect(surfaceLabelKey("occlusal", LOWER_POST)).toBe("surface.occlusal");
    expect(surfaceLabelKey("buccal", LOWER_POST)).toBe("surface.buccal");
    expect(surfaceLabelKey("lingual", LOWER_POST)).toBe("surface.lingual");
  });
  it("31 (lower anterior): incisal / labial / lingual", () => {
    expect(surfaceLabelKey("occlusal", LOWER_ANT)).toBe("surface.incisal");
    expect(surfaceLabelKey("buccal", LOWER_ANT)).toBe("surface.labial");
    expect(surfaceLabelKey("lingual", LOWER_ANT)).toBe("surface.lingual");
  });
  it("mesial/distal are position-independent", () => {
    expect(surfaceLabelKey("mesial", UPPER_ANT)).toBe("surface.mesial");
    expect(surfaceLabelKey("distal", LOWER_ANT)).toBe("surface.distal");
  });
});

describe("surfaceLabelKey — SIMPLE mode: always the generic, tooth-independent keys", () => {
  beforeEach(() => setSurfaceNotation("simple"));

  it("11 (upper anterior) stays generic — no incisal/labial/palatal swap", () => {
    expect(surfaceLabelKey("occlusal", UPPER_ANT)).toBe("surface.occlusal");
    expect(surfaceLabelKey("buccal", UPPER_ANT)).toBe("surface.buccal");
    expect(surfaceLabelKey("lingual", UPPER_ANT)).toBe("surface.lingualPalatal");
  });
  it("31 (lower anterior) stays generic too", () => {
    expect(surfaceLabelKey("occlusal", LOWER_ANT)).toBe("surface.occlusal");
    expect(surfaceLabelKey("buccal", LOWER_ANT)).toBe("surface.buccal");
    expect(surfaceLabelKey("lingual", LOWER_ANT)).toBe("surface.lingualPalatal");
  });
});

describe("summarySurfaceLetter reflects the surfaceNotation setting (via subcariesLettersForTooth)", () => {
  // subcariesLettersForTooth(toothNo, state) delegates every letter through
  // summarySurfaceLetter -> surfaceLetter, so it's a faithful exported proxy
  // for the module-private summarySurfaceLetter.
  function makeState(surface: string) {
    return {
      caries: new Set([`caries-${surface}`]),
      fillingSurfaceMaterials: new Map([[surface, "composite"]]),
    };
  }

  it("FULL (default): tooth 11 occlusal letters \"I\", not \"O\"", () => {
    expect(getSurfaceNotation()).toBe("full");
    expect(subcariesLettersForTooth(UPPER_ANT, makeState("occlusal"))).toBe("I");
  });
  it("SIMPLE: tooth 11 occlusal letters \"O\", not \"I\"", () => {
    setSurfaceNotation("simple");
    expect(subcariesLettersForTooth(UPPER_ANT, makeState("occlusal"))).toBe("O");
  });
  it("FULL (default): tooth 16 lingual letters \"P\" (palatal, upper)", () => {
    expect(subcariesLettersForTooth(UPPER_POST, makeState("lingual"))).toBe("P");
  });
  it("SIMPLE: tooth 16 lingual letters \"L\", not \"P\"", () => {
    setSurfaceNotation("simple");
    expect(subcariesLettersForTooth(UPPER_POST, makeState("lingual"))).toBe("L");
  });
});

// Whole-branch review fix: toggling surfaceNotation must live-refresh the
// whole-mouth summary panel and per-tooth tooltips, not just the active
// tooth's picker. setSurfaceNotation() now calls notifyStateChange() (the
// same hook the App uses to re-run getOdontogramSummary()) and refreshes
// every tooth's tooltip, mirroring registerPlugins()'s ALL_TEETH loop.
describe("setSurfaceNotation live-refreshes the whole-mouth summary + tooltips (whole-branch review fix)", () => {
  // Tooth 11 (upper anterior) with an occlusal filling carrying a defect:
  // FULL mode letters it "I" (incisal), SIMPLE mode "O" (occlusal) — the
  // concrete repro from the finding.
  beforeEach(() => {
    __setToothStateForTest(11, {
      toothSelection: "tooth-base",
      restorationType: "none",
      fillingSurfaceMaterials: { occlusal: "composite" },
      fillingDefect: { occlusal: "marginal" },
    });
  });
  afterEach(() => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
  });

  it("fires the onStateChange listener (proves notifyStateChange() ran)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setSurfaceNotation("simple");
      expect(fired).toBe(true);
    } finally {
      unsub();
    }
  });

  it("does NOT fire notifyStateChange when the notation is already the same (idempotent)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setSurfaceNotation("full");
      expect(fired).toBe(false);
    } finally {
      unsub();
    }
  });

  it("getOdontogramSummary()'s fillings line recomputes from \"I\" to \"O\" after toggling to simple", () => {
    expect(getSurfaceNotation()).toBe("full");
    const fillingsSection = (s: ReturnType<typeof getOdontogramSummary>) =>
      s.sections.find((sec) => sec.key === "fillings")!.items;

    const beforeLine = fillingsSection(getOdontogramSummary()).find((line) => line.includes("(I)"));
    expect(beforeLine).toBeTruthy();

    setSurfaceNotation("simple");
    const afterLine = fillingsSection(getOdontogramSummary()).find((line) => line.startsWith(beforeLine!.split(" ")[0]));
    expect(afterLine).toBeTruthy();
    expect(afterLine).toContain("(O)");
    expect(afterLine).not.toContain("(I)");
  });
});
