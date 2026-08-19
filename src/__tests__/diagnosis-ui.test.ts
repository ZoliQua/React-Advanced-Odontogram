// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP4 Task 5: the diagnosis-authoring UI (3-level pulp control + practical-Latin
// subtypes, apical picker, resorption picker). No full-DOM harness exists, so
// these tests target the pure option/mapping builders and the registry
// feature-flag read path (mirroring how prior SP tasks tested their builders).
import { describe, it, expect, afterEach } from "vitest";
import {
  pulpSelectOptionValues,
  pulpSelectionToState,
  pulpDisplayValue,
  PULP_LATIN_PARENT,
  setPulpDetailLevel,
  getPulpDetailLevel,
  VALID_PULP_DX,
  VALID_PULP_LATIN,
  VALID_APICAL_DX,
  VALID_RESORPTION_TYPE,
  __setToothStateForTest,
  __getToothStateForTest,
  __collectExportPayloadForTest,
} from "../odontogram";
import { isAxisFlagSatisfied } from "../registry/uiOptions";

afterEach(() => {
  // pulpDetailLevel is module state; restore the default so tests don't leak.
  setPulpDetailLevel("aae");
});

describe("pulpSelectOptionValues — option list per detail level", () => {
  it("simple -> 2 options (healthy / pulpitis)", () => {
    const opts = pulpSelectOptionValues("simple");
    expect(opts).toEqual([
      { value: "normal", labelKey: "pulpDx.normal" },
      { value: "irreversible-pulpitis", labelKey: "pulpDx.irreversiblePulpitis" },
    ]);
  });
  it("aae -> the 4 pulpDx values in catalog order", () => {
    const opts = pulpSelectOptionValues("aae");
    expect(opts.map(o => o.value)).toEqual(Array.from(VALID_PULP_DX));
    expect(opts).toHaveLength(4);
    expect(opts[1]).toEqual({ value: "reversible-pulpitis", labelKey: "pulpDx.reversiblePulpitis" });
  });
  it("latin -> the 9 pulpLatin values (excludes 'none'), Latin label keys", () => {
    const opts = pulpSelectOptionValues("latin");
    expect(opts).toHaveLength(9);
    expect(opts.some(o => o.value === "none")).toBe(false);
    expect(opts.map(o => o.value)).toEqual(Array.from(VALID_PULP_LATIN).filter(v => v !== "none"));
    expect(opts.find(o => o.value === "pulpa-sana")).toEqual({ value: "pulpa-sana", labelKey: "pulpLatin.pulpaSana" });
    expect(opts.find(o => o.value === "external-cervical" as string)).toBeUndefined();
  });
});

describe("pulpSelectionToState — select value -> {pulpDx, pulpLatin}", () => {
  it("simple/aae write pulpDx and clear pulpLatin to 'none'", () => {
    expect(pulpSelectionToState("simple", "irreversible-pulpitis")).toEqual({ pulpDx: "irreversible-pulpitis", pulpLatin: "none" });
    expect(pulpSelectionToState("aae", "necrosis")).toEqual({ pulpDx: "necrosis", pulpLatin: "none" });
  });
  it("latin writes the Latin subtype AND its parent pulpDx", () => {
    expect(pulpSelectionToState("latin", "hyperaemia-pulpae")).toEqual({ pulpLatin: "hyperaemia-pulpae", pulpDx: "reversible-pulpitis" });
    expect(pulpSelectionToState("latin", "pulpitis-acuta-purulenta")).toEqual({ pulpLatin: "pulpitis-acuta-purulenta", pulpDx: "irreversible-pulpitis" });
    expect(pulpSelectionToState("latin", "gangraena-pulpae")).toEqual({ pulpLatin: "gangraena-pulpae", pulpDx: "necrosis" });
  });
  it("every Latin subtype's parent is a valid pulpDx value", () => {
    for (const [latin, parent] of Object.entries(PULP_LATIN_PARENT)) {
      expect(VALID_PULP_DX.has(parent), `${latin} -> ${parent}`).toBe(true);
    }
  });
});

describe("pulpDisplayValue — collapse a stored value to the current level (no mutation)", () => {
  it("aae shows the stored pulpDx", () => {
    expect(pulpDisplayValue("aae", { pulpDx: "reversible-pulpitis", pulpLatin: "none" })).toBe("reversible-pulpitis");
  });
  it("simple buckets any diseased pulpDx into the single pulpitis option", () => {
    expect(pulpDisplayValue("simple", { pulpDx: "normal" })).toBe("normal");
    expect(pulpDisplayValue("simple", { pulpDx: "reversible-pulpitis" })).toBe("irreversible-pulpitis");
    expect(pulpDisplayValue("simple", { pulpDx: "necrosis" })).toBe("irreversible-pulpitis");
  });
  it("latin shows the stored pulpLatin, else a representative for pulpDx", () => {
    expect(pulpDisplayValue("latin", { pulpDx: "irreversible-pulpitis", pulpLatin: "pulpitis-chronica-clausa" })).toBe("pulpitis-chronica-clausa");
    // aae-authored (pulpLatin 'none'): fall back to a representative Latin value
    expect(pulpDisplayValue("latin", { pulpDx: "necrosis", pulpLatin: "none" })).toBe("necrosis-pulpae");
    expect(pulpDisplayValue("latin", { pulpDx: "normal", pulpLatin: "none" })).toBe("pulpa-sana");
  });
  it("is pure — does not mutate the input state", () => {
    const state = { pulpDx: "irreversible-pulpitis", pulpLatin: "pulpitis-acuta-serosa" };
    const snapshot = { ...state };
    pulpDisplayValue("simple", state);
    pulpDisplayValue("aae", state);
    pulpDisplayValue("latin", state);
    expect(state).toEqual(snapshot);
  });
  it("a Latin-authored value collapses coherently across all three levels", () => {
    const stored = { pulpDx: "irreversible-pulpitis", pulpLatin: "pulpitis-acuta-purulenta" };
    expect(pulpDisplayValue("latin", stored)).toBe("pulpitis-acuta-purulenta");
    expect(pulpDisplayValue("aae", stored)).toBe("irreversible-pulpitis");
    expect(pulpDisplayValue("simple", stored)).toBe("irreversible-pulpitis");
  });
});

describe("setPulpDetailLevel / getPulpDetailLevel accessor", () => {
  it("defaults to aae and round-trips valid levels", () => {
    expect(getPulpDetailLevel()).toBe("aae");
    setPulpDetailLevel("latin");
    expect(getPulpDetailLevel()).toBe("latin");
    expect(pulpSelectOptionValues(getPulpDetailLevel())).toHaveLength(9);
    setPulpDetailLevel("simple");
    expect(pulpSelectOptionValues(getPulpDetailLevel())).toHaveLength(2);
  });
  it("coerces an invalid level to aae", () => {
    // @ts-expect-error deliberate bad input
    setPulpDetailLevel("bogus");
    expect(getPulpDetailLevel()).toBe("aae");
  });
});

describe("ClinicalAxis.flag read path (isAxisFlagSatisfied)", () => {
  it("pulpLatin's flag is satisfied only when latinPulpDetail is set", () => {
    expect(isAxisFlagSatisfied("pulpLatin", { latinPulpDetail: true })).toBe(true);
    expect(isAxisFlagSatisfied("pulpLatin", { latinPulpDetail: false })).toBe(false);
    expect(isAxisFlagSatisfied("pulpLatin", {})).toBe(false);
  });
  it("an un-flagged axis is always satisfied", () => {
    expect(isAxisFlagSatisfied("pulpDx", {})).toBe(true);
    expect(isAxisFlagSatisfied("apicalDx", {})).toBe(true);
  });
});

describe("apical + resorption option catalogs", () => {
  it("apicalDx exposes the 6 AAE apical diagnoses", () => {
    expect(VALID_APICAL_DX.size).toBe(6);
    expect(VALID_APICAL_DX.has("condensing-osteitis")).toBe(true);
  });
  it("resorptionType exposes none / internal / external-cervical", () => {
    expect(Array.from(VALID_RESORPTION_TYPE)).toEqual(["none", "internal", "external-cervical"]);
  });
});

describe("stored pulpLatin + apicalDx round-trip through migration + serialization", () => {
  it("a Latin subtype survives migration and re-serializes regardless of level", () => {
    setPulpDetailLevel("aae"); // non-latin level must not drop a stored Latin value
    __setToothStateForTest(11, { toothSelection: "tooth-base", pulpDx: "necrosis", pulpLatin: "gangraena-pulpae" });
    const s = __getToothStateForTest(11)!;
    expect(s.pulpLatin).toBe("gangraena-pulpae");
    expect(s.pulpDx).toBe("necrosis");
    const payload = __collectExportPayloadForTest();
    expect(payload.teeth[11].pulpLatin).toBe("gangraena-pulpae");
  });
  it("apicalDx is serialized (and thus reaches the FHIR export)", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", apicalDx: "chronic-apical-abscess" });
    const s = __getToothStateForTest(21)!;
    expect(s.apicalDx).toBe("chronic-apical-abscess");
    const payload = __collectExportPayloadForTest();
    expect(payload.teeth[21].apicalDx).toBe("chronic-apical-abscess");
  });
  it("an invalid stored pulpLatin degrades to 'none'", () => {
    __setToothStateForTest(31, { toothSelection: "tooth-base", pulpLatin: "not-a-real-subtype" });
    expect(__getToothStateForTest(31)!.pulpLatin).toBe("none");
  });
});

// SP4 Task 6: a legacy 1.4/2.0/2.1 payload combining the retired `pulpInflam`/
// `rootResorption` booleans with the legacy periapical encoding
// ({mods:["inflammation"], periapicalType}) on a PRESENT tooth must migrate
// to all three modern diagnosis axes at once, and the re-export must be
// payload version 2.3 with neither legacy key present anywhere in the payload
// (the export version was bumped 2.2 -> 2.3 by SP5 Task 7; this test's
// migration assertions are otherwise unchanged since SP4).
describe("SP4 Task 6: combined legacy migration (pulpInflam + rootResorption + inflammation mod) -> payload 2.3 export", () => {
  it("migrates to pulpDx/resorptionType/apicalDx and drops both legacy booleans on export", () => {
    __setToothStateForTest(14, {
      toothSelection: "tooth-base",
      pulpInflam: true,
      rootResorption: true,
      mods: ["inflammation"],
      periapicalType: "cyst",
    });

    const s = __getToothStateForTest(14)!;
    expect(s.pulpDx).toBe("irreversible-pulpitis");
    expect(s.resorptionType).toBe("external-cervical");
    expect(s.apicalDx).toBe("asymptomatic-apical-periodontitis");
    expect(s.periapicalType).toBe("cyst");
    expect(s).not.toHaveProperty("pulpInflam");
    expect(s).not.toHaveProperty("rootResorption");

    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    const tooth14 = payload.teeth[14];
    expect(tooth14).not.toHaveProperty("pulpInflam");
    expect(tooth14).not.toHaveProperty("rootResorption");
    expect(tooth14.pulpDx).toBe("irreversible-pulpitis");
    expect(tooth14.resorptionType).toBe("external-cervical");
    expect(tooth14.apicalDx).toBe("asymptomatic-apical-periodontitis");
    expect(tooth14.periapicalType).toBe("cyst");
    // No `pulpInflam`/`rootResorption` key anywhere in the export, not just tooth 14.
    for (const tooth of Object.values(payload.teeth) as Record<string, unknown>[]) {
      expect(tooth).not.toHaveProperty("pulpInflam");
      expect(tooth).not.toHaveProperty("rootResorption");
    }
  });
});
