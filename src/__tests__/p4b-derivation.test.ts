// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { derivePerioClassification, areAdjacent, type PerioMetaInput } from "../perioClassification";

const meta: PerioMetaInput = {
  age: null,
  maxRblPercent: null,
  toothLossPerio: null,
  smokingStatus: "unknown",
  cigarettesPerDay: null,
  diabetesStatus: "unknown",
  hba1c: null,
};
const tooth = (
  toothNo: number,
  interdentalCal = 0,
  buccalOralCal = 0,
  maxPd = 0,
  present = true,
) => ({ toothNo, interdentalCal, buccalOralCal, maxPd, present });
const base = (teeth: ReturnType<typeof tooth>[], extra: Partial<PerioMetaInput> = {}) => ({
  teeth,
  bopPercent: 0,
  maxFurcation: null as number | null,
  meta: { ...meta, ...extra },
});

describe("areAdjacent (arch-adjacency helper)", () => {
  it("consecutive upper-arch teeth are adjacent", () => {
    expect(areAdjacent(11, 12)).toBe(true);
    expect(areAdjacent(18, 17)).toBe(true);
  });
  it("midline pairs (11/21, 41/31) ARE adjacent", () => {
    expect(areAdjacent(11, 21)).toBe(true);
    expect(areAdjacent(41, 31)).toBe(true);
  });
  it("the 28/48 arch boundary is NOT adjacent", () => {
    expect(areAdjacent(28, 48)).toBe(false);
    expect(areAdjacent(18, 48)).toBe(false);
  });
  it("non-consecutive same-arch teeth are not adjacent", () => {
    expect(areAdjacent(11, 26)).toBe(false);
  });
});

describe("diagnosis", () => {
  it("health: no CAL, low BOP", () => {
    expect(derivePerioClassification(base([tooth(11), tooth(21)])).diagnosis).toBe("health");
  });

  it("gingivitis: BOP>=10, no interdental CAL", () => {
    const r = derivePerioClassification({ ...base([tooth(11)]), bopPercent: 25 });
    expect(r.diagnosis).toBe("gingivitis");
    expect(r.stage).toBe("na");
    expect(r.extent).toBe("na");
  });

  it("health at BOP just under 10 boundary", () => {
    const r = derivePerioClassification({ ...base([tooth(11)]), bopPercent: 9.9 });
    expect(r.diagnosis).toBe("health");
  });

  it("gingivitis at BOP exactly 10 boundary", () => {
    const r = derivePerioClassification({ ...base([tooth(11)]), bopPercent: 10 });
    expect(r.diagnosis).toBe("gingivitis");
  });

  it("periodontitis: interdental CAL >=1 at 2 NON-adjacent teeth", () => {
    expect(derivePerioClassification(base([tooth(11, 2), tooth(26, 2)])).diagnosis).toBe("periodontitis");
  });

  it("NOT periodontitis: CAL at 2 ADJACENT teeth only", () => {
    expect(derivePerioClassification(base([tooth(11, 2), tooth(12, 2)])).diagnosis).not.toBe("periodontitis");
  });

  it("NOT periodontitis via midline pair only (11/21 adjacent)", () => {
    expect(derivePerioClassification(base([tooth(11, 2), tooth(21, 2)])).diagnosis).not.toBe("periodontitis");
  });

  it("a single affected tooth alone never qualifies (no pair)", () => {
    expect(derivePerioClassification(base([tooth(11, 5)])).diagnosis).not.toBe("periodontitis");
  });

  it("periodontitis via buccal/oral fallback: >=2 teeth buccalOralCal>=3 AND maxPd>3", () => {
    // Adjacent teeth so the interdental-pair rule cannot fire on its own.
    expect(
      derivePerioClassification(base([tooth(11, 0, 3, 4), tooth(12, 0, 3, 4)])).diagnosis,
    ).toBe("periodontitis");
  });

  it("NOT periodontitis via buccal/oral fallback when maxPd is exactly 3 (needs >3)", () => {
    expect(
      derivePerioClassification(base([tooth(11, 0, 3, 3), tooth(12, 0, 3, 3)])).diagnosis,
    ).not.toBe("periodontitis");
  });

  it("NOT periodontitis via buccal/oral fallback with only 1 qualifying tooth", () => {
    expect(
      derivePerioClassification(base([tooth(11, 0, 3, 4), tooth(12, 0, 2, 4)])).diagnosis,
    ).not.toBe("periodontitis");
  });

  it("a non-present tooth's CAL never counts toward the pair rule", () => {
    expect(
      derivePerioClassification(base([tooth(11, 2), tooth(26, 2, 0, 0, false)])).diagnosis,
    ).not.toBe("periodontitis");
  });
});

describe("stage (periodontitis only, else na)", () => {
  it("stage from worst interdental CAL: 3mm -> II", () => {
    expect(derivePerioClassification(base([tooth(11, 3), tooth(26, 2)])).stage).toBe("II");
  });

  it("boundary: CAL 2mm -> I", () => {
    // Need a qualifying periodontitis pair; keep worst CAL at 2 via a 3rd tooth is not
    // allowed (would raise the band), so use two non-adjacent teeth each at CAL 2.
    expect(derivePerioClassification(base([tooth(11, 2), tooth(26, 2)])).stage).toBe("I");
  });

  it("boundary: CAL 3mm -> II (band floor)", () => {
    expect(derivePerioClassification(base([tooth(11, 3), tooth(26, 3)])).stage).toBe("II");
  });

  it("boundary: CAL 5mm -> III (band floor)", () => {
    expect(derivePerioClassification(base([tooth(11, 5), tooth(26, 1)])).stage).toBe("III");
  });

  it("stage escalates to III by RBL >33%", () => {
    expect(
      derivePerioClassification(base([tooth(11, 2), tooth(26, 2)], { maxRblPercent: 40 })).stage,
    ).toBe("III");
  });

  it("boundary: RBL exactly 15% -> II", () => {
    expect(
      derivePerioClassification(base([tooth(11, 1), tooth(26, 1)], { maxRblPercent: 15 })).stage,
    ).toBe("II");
  });

  it("boundary: RBL just under 15% (14.9) -> I", () => {
    expect(
      derivePerioClassification(base([tooth(11, 1), tooth(26, 1)], { maxRblPercent: 14.9 })).stage,
    ).toBe("I");
  });

  it("boundary: RBL exactly 33% -> II (not III yet)", () => {
    expect(
      derivePerioClassification(base([tooth(11, 1), tooth(26, 1)], { maxRblPercent: 33 })).stage,
    ).toBe("II");
  });

  it("boundary: RBL just over 33% (33.1) -> III", () => {
    expect(
      derivePerioClassification(base([tooth(11, 1), tooth(26, 1)], { maxRblPercent: 33.1 })).stage,
    ).toBe("III");
  });

  it("complexity escalates to III via maxPd>=6 even with low CAL band", () => {
    expect(
      derivePerioClassification(base([tooth(11, 1, 0, 6), tooth(26, 1)])).stage,
    ).toBe("III");
  });

  it("maxPd exactly 5 does NOT escalate complexity (needs >=6)", () => {
    expect(
      derivePerioClassification(base([tooth(11, 1, 0, 5), tooth(26, 1)])).stage,
    ).toBe("I");
  });

  it("complexity escalates to III via maxFurcation>=2", () => {
    expect(
      derivePerioClassification({
        ...base([tooth(11, 1), tooth(26, 1)]),
        maxFurcation: 2,
      }).stage,
    ).toBe("III");
  });

  it("maxFurcation of 1 does NOT escalate complexity (needs >=2)", () => {
    expect(
      derivePerioClassification({
        ...base([tooth(11, 1), tooth(26, 1)]),
        maxFurcation: 1,
      }).stage,
    ).toBe("I");
  });

  it("complexity never downgrades an already-higher band", () => {
    expect(
      derivePerioClassification(base([tooth(11, 5, 0, 6), tooth(26, 5)])).stage,
    ).toBe("III");
  });

  it("stage IV by tooth-loss >=5", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 6), tooth(26, 6)], { toothLossPerio: 5, maxRblPercent: 40 }),
      ).stage,
    ).toBe("IV");
  });

  it("toothLossPerio of 4 does NOT trigger stage IV", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 6), tooth(26, 6)], { toothLossPerio: 4, maxRblPercent: 40 }),
      ).stage,
    ).toBe("III");
  });

  it("indeterminate: periodontitis (via buccal/oral fallback) but no CAL & no RBL charted", () => {
    const r = derivePerioClassification(
      base([tooth(11, 0, 3, 4), tooth(12, 0, 3, 4)]),
    );
    expect(r.diagnosis).toBe("periodontitis");
    expect(r.stage).toBe("indeterminate");
  });

  it("na when diagnosis is not periodontitis", () => {
    expect(derivePerioClassification(base([tooth(11)])).stage).toBe("na");
  });
});

describe("grade (A<B<C)", () => {
  it("grade C by %RBL/age >1.0", () => {
    expect(
      derivePerioClassification(base([tooth(11, 5), tooth(26, 5)], { age: 30, maxRblPercent: 40 })).grade,
    ).toBe("C");
  });

  it("boundary: ratio exactly 0.25 -> B", () => {
    expect(
      derivePerioClassification(base([tooth(11, 5), tooth(26, 5)], { age: 40, maxRblPercent: 10 })).grade,
    ).toBe("B");
  });

  it("boundary: ratio just under 0.25 -> A", () => {
    expect(
      derivePerioClassification(base([tooth(11, 5), tooth(26, 5)], { age: 100, maxRblPercent: 24 })).grade,
    ).toBe("A");
  });

  it("boundary: ratio exactly 1.0 -> B (not C yet)", () => {
    expect(
      derivePerioClassification(base([tooth(11, 5), tooth(26, 5)], { age: 40, maxRblPercent: 40 })).grade,
    ).toBe("B");
  });

  it("boundary: ratio just over 1.0 -> C", () => {
    expect(
      derivePerioClassification(base([tooth(11, 5), tooth(26, 5)], { age: 40, maxRblPercent: 40.1 })).grade,
    ).toBe("C");
  });

  it("grade escalates by heavy smoking", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 5), tooth(26, 5)], {
          age: 60,
          maxRblPercent: 10,
          smokingStatus: "current",
          cigarettesPerDay: 15,
        }),
      ).grade,
    ).toBe("C");
  });

  it("boundary: cigarettes exactly 10/day -> C", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 5), tooth(26, 5)], { smokingStatus: "current", cigarettesPerDay: 10 }),
      ).grade,
    ).toBe("C");
  });

  it("boundary: cigarettes 9/day (current smoker) -> B, not C", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 5), tooth(26, 5)], { smokingStatus: "current", cigarettesPerDay: 9 }),
      ).grade,
    ).toBe("B");
  });

  it("current smoker with unknown cigarette count -> B (never A)", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 5), tooth(26, 5)], { smokingStatus: "current", cigarettesPerDay: null }),
      ).grade,
    ).toBe("B");
  });

  it("a KNOWN non-current smoking status (former) never escalates, but is also not indeterminate (only literal 'unknown' qualifies for that)", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 5), tooth(26, 5)], { smokingStatus: "former", cigarettesPerDay: 40 }),
      ).grade,
    ).toBe("B");
  });

  it("boundary: HbA1c exactly 7.0 -> C", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 5), tooth(26, 5)], { diabetesStatus: "present", hba1c: 7.0 }),
      ).grade,
    ).toBe("C");
  });

  it("boundary: HbA1c 6.9 (present diabetes) -> B, not C", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 5), tooth(26, 5)], { diabetesStatus: "present", hba1c: 6.9 }),
      ).grade,
    ).toBe("B");
  });

  it("diabetes present with unknown HbA1c -> B (never A)", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 5), tooth(26, 5)], { diabetesStatus: "present", hba1c: null }),
      ).grade,
    ).toBe("B");
  });

  it("a KNOWN diabetesStatus of 'none' never escalates, but is also not indeterminate", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 5), tooth(26, 5)], { diabetesStatus: "none", hba1c: 9 }),
      ).grade,
    ).toBe("B");
  });

  it("smoking + diabetes both escalate independently -> worse of the two wins", () => {
    expect(
      derivePerioClassification(
        base([tooth(11, 5), tooth(26, 5)], {
          smokingStatus: "current",
          cigarettesPerDay: 5, // B
          diabetesStatus: "present",
          hba1c: 9, // C
        }),
      ).grade,
    ).toBe("C");
  });

  it("grade indeterminate: no age/RBL and no modifiers", () => {
    expect(derivePerioClassification(base([tooth(11, 5), tooth(26, 5)])).grade).toBe("indeterminate");
  });

  it("age present but RBL null -> no direct grade; still indeterminate if no modifiers", () => {
    expect(
      derivePerioClassification(base([tooth(11, 5), tooth(26, 5)], { age: 50 })).grade,
    ).toBe("indeterminate");
  });

  it("age zero never divides by zero and is treated as no direct grade", () => {
    expect(
      derivePerioClassification(base([tooth(11, 5), tooth(26, 5)], { age: 0, maxRblPercent: 10 })).grade,
    ).toBe("indeterminate");
  });
});

describe("extent (periodontitis only, else na)", () => {
  it("na when diagnosis is not periodontitis", () => {
    expect(derivePerioClassification(base([tooth(11)])).extent).toBe("na");
  });

  it("extent localized: <30% affected", () => {
    // Two non-adjacent PREMOLARS (14/24, position 4) affected — deliberately
    // not molars/incisors, so the molar-incisor precondition can't fire and
    // this cleanly exercises the percentage-based branch.
    const teeth = [tooth(14, 2), tooth(24, 2), tooth(11), tooth(12), tooth(13), tooth(15), tooth(16), tooth(17)];
    const r = derivePerioClassification(base(teeth));
    expect(r.diagnosis).toBe("periodontitis");
    expect(r.extent).toBe("localized");
  });

  it("extent generalized: >=30% affected (including a non-molar/incisor tooth, so the molar-incisor pattern does not apply)", () => {
    // NOTE: corrected from the brief's literal fixture, which affected ONLY
    // incisors+first-molars (11,21,31,41,26,36) — per the derivation's own
    // priority order ("molar-incisor if ALL affected are molars/incisors...
    // ; ELSE percentage-based"), that exact fixture actually satisfies the
    // molar-incisor precondition and would correctly derive "molar-incisor",
    // not "generalized" (2017 literature: the molar-incisor pattern is NOT
    // gated by the 30% threshold — it can affect well over 30% of teeth by
    // count and still be "molar-incisor", precisely because canines/
    // premolars are spared). Adding an affected premolar (15) here breaks
    // the molar-incisor precondition so this fixture actually exercises the
    // percentage-based generalized branch, matching the test's stated intent.
    const teeth = [11, 21, 31, 41, 26, 36].map((n) => tooth(n, 2)).concat([tooth(15, 2), tooth(25)]);
    const r = derivePerioClassification(base(teeth));
    expect(r.diagnosis).toBe("periodontitis");
    expect(r.extent).toBe("generalized");
  });

  it("extent molar-incisor: only molars+incisors affected", () => {
    expect(
      derivePerioClassification(base([tooth(11, 3), tooth(26, 3), tooth(15), tooth(24)])).extent,
    ).toBe("molar-incisor");
  });

  it("molar-incisor requires BOTH a molar and an incisor affected — molars only stays percentage-based", () => {
    // Two non-adjacent molars only (no incisor affected) -> not molar-incisor,
    // falls through to the percentage split.
    const r = derivePerioClassification(base([tooth(16, 3), tooth(26, 3), tooth(11), tooth(21)]));
    expect(r.diagnosis).toBe("periodontitis");
    expect(r.extent).not.toBe("molar-incisor");
  });

  it("a single affected premolar breaks the molar-incisor pattern even alongside molars+incisors", () => {
    const teeth = [tooth(11, 3), tooth(26, 3), tooth(14, 3), tooth(15), tooth(16), tooth(17), tooth(18), tooth(21)];
    const r = derivePerioClassification(base(teeth));
    expect(r.extent).not.toBe("molar-incisor");
  });

  it("a non-present tooth is excluded from the affected/present percentage AND from the molar-incisor pattern check", () => {
    // 16/26 (present, affected, molars-only -> not molar-incisor-eligible on
    // their own) plus 4 NON-present "phantom" incisors carrying CAL themselves.
    // If `present` filtering were broken (phantom teeth wrongly counted), the
    // affected set would include incisors too and mis-derive "molar-incisor"
    // instead of "generalized".
    const teeth = [
      tooth(16, 2), tooth(26, 2),
      tooth(11, 2, 0, 0, false), tooth(21, 2, 0, 0, false),
      tooth(31, 2, 0, 0, false), tooth(41, 2, 0, 0, false),
    ];
    const r = derivePerioClassification(base(teeth));
    expect(r.extent).toBe("generalized");
  });
});

describe("buckets (grade provenance)", () => {
  it("heavy smoker -> buckets.smoking === 'C'", () => {
    const r = derivePerioClassification(
      base([tooth(11, 5), tooth(26, 5)], { smokingStatus: "current", cigarettesPerDay: 15 }),
    );
    expect(r.buckets.smoking).toBe("C");
  });

  it("uncontrolled diabetic (hba1c>=7) -> buckets.diabetes === 'C'", () => {
    const r = derivePerioClassification(
      base([tooth(11, 5), tooth(26, 5)], { diabetesStatus: "present", hba1c: 7.5 }),
    );
    expect(r.buckets.diabetes).toBe("C");
  });

  it("age+RBL giving ratio>1 -> buckets.direct === 'C'", () => {
    const r = derivePerioClassification(
      base([tooth(11, 5), tooth(26, 5)], { age: 30, maxRblPercent: 40 }),
    );
    expect(r.buckets.direct).toBe("C");
  });

  it("no age/RBL -> buckets.direct === null", () => {
    const r = derivePerioClassification(base([tooth(11, 5), tooth(26, 5)]));
    expect(r.buckets.direct).toBeNull();
  });

  it("never-smoker/no-diabetes/no-direct -> buckets all 'A' (direct excepted, which is null)", () => {
    const r = derivePerioClassification(
      base([tooth(11, 5), tooth(26, 5)], { smokingStatus: "never", diabetesStatus: "none" }),
    );
    expect(r.buckets.smoking).toBe("A");
    expect(r.buckets.diabetes).toBe("A");
    expect(r.buckets.direct).toBeNull();
  });

  it("buckets surfaced even when diagnosis is not periodontitis (grade computation is diagnosis-independent)", () => {
    const r = derivePerioClassification(
      base([tooth(11)], { smokingStatus: "current", cigarettesPerDay: 15 }),
    );
    expect(r.diagnosis).toBe("health");
    expect(r.buckets.smoking).toBe("C");
  });
});

describe("FIX 2: deriveStage gates per-tooth CAL/PD reductions on `present`", () => {
  it("stage ignores a NON-present tooth's stale high CAL (present CAL 3 + extracted-tooth CAL 8 -> II, not III/IV)", () => {
    const r = derivePerioClassification(
      base([tooth(11, 3), tooth(26, 3), tooth(16, 8, 0, 0, false)]),
    );
    expect(r.diagnosis).toBe("periodontitis");
    expect(r.stage).toBe("II");
  });

  it("stage ignores a NON-present tooth's stale high maxPd for the complexity escalation (present maxPd 1 + extracted-tooth maxPd 9 -> stays I, not III)", () => {
    const r = derivePerioClassification(
      base([tooth(11, 1, 0, 1), tooth(26, 1), tooth(16, 0, 0, 9, false)]),
    );
    expect(r.diagnosis).toBe("periodontitis");
    expect(r.stage).toBe("I");
  });

  it("all-present-teeth cases are unaffected by the present-gating (regression: pre-existing III-by-maxPd case still III)", () => {
    expect(
      derivePerioClassification(base([tooth(11, 1, 0, 6), tooth(26, 1)])).stage,
    ).toBe("III");
  });
});

describe("FIX 3: indeterminate (no CAL/RBL evidence) takes precedence over toothLossPerio>=5 Stage IV escalation", () => {
  it("periodontitis with toothLossPerio=6 but zero interdental CAL and null RBL -> indeterminate, NOT IV", () => {
    // Periodontitis qualified via the buccal/oral fallback (2 adjacent teeth,
    // so the interdental-pair rule can't fire on its own) — zero interdentalCal
    // means calBand is null, and maxRblPercent stays null (rBand null too), so
    // deriveStage's early "cBand===null && rBand===null -> indeterminate" return
    // fires BEFORE the toothLossPerio>=5 override ever gets a chance to run.
    const r = derivePerioClassification(
      base([tooth(11, 0, 3, 4), tooth(12, 0, 3, 4)], { toothLossPerio: 6 }),
    );
    expect(r.diagnosis).toBe("periodontitis");
    expect(r.stage).toBe("indeterminate");
  });
});

describe("determinism", () => {
  it("same input always produces the same output (no Date/random)", () => {
    const input = base([tooth(11, 5), tooth(26, 5)], {
      age: 30,
      maxRblPercent: 40,
      smokingStatus: "current",
      cigarettesPerDay: 20,
    });
    const a = derivePerioClassification(input);
    const b = derivePerioClassification(input);
    expect(a).toEqual(b);
  });
});
