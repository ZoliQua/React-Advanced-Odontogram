// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP6 Task 1: caries is a per-surface STATE MACHINE (corrects the SP5 model).
// A caried surface is exactly ONE of:
//   - PRIMARY caries   (no filling on the surface) → `caries-{surface}` at the
//     ICDAS depth tier (opacity 0.45 / 0.7 / 1 + `caries-deep`), or
//   - RECURRENT caries (a filling on the same surface) → `subcaries-{surface}`
//     at the CARS opacity `0.30 + (sev-1)/5 * 0.70` (the primary layer is NOT
//     activated).
// Recurrence is DERIVED from the filling — never an independent stored flag — so
// a surface is NEVER both `caries-X` and `subcaries-X`. The single unified
// `cariesSeverity` score (default 2) is read as ICDAS on a primary surface and
// as CARS on a recurrent one, and it carries UNCHANGED across the transition.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { __renderActiveLayers, __setToothStateForTest, __getToothStateForTest, getOdontogramSummary } from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

const testFileUrl = import.meta.url;
const readSvg = (name: string) => readFileSync(fileURLToPath(new URL(`../assets/teeth-svgs/${name}.svg`, testFileUrl)), "utf8");

const occlSvg = readSvg("16_occl");
const render = (state: Record<string, unknown>) => __renderActiveLayers(occlSvg, 16, state);
const find = (layers: { id: string; opacity: string; cls: string }[], id: string) => layers.find(l => l.id === id);
// Local loose type for reading back test state (Sets/Maps -> arrays/objects).
type Read = { cariesSeverity: Record<string, number> };
const get = (n: number) => __getToothStateForTest(n) as unknown as Read;

describe("SP6 Task 1: caries/subcaries surface state machine", () => {
  it("primary caries (no filling) → caries-{s} at the ICDAS depth tier, NO subcaries", () => {
    // cariesSeverity read as ICDAS: 2 → tier1 (0.45), 4 → tier2 (0.7), 6 → tier3 (1 + caries-deep).
    const l2 = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 2 } });
    expect(find(l2, "caries-occlusal")?.opacity).toBe("0.45");
    expect(find(l2, "subcaries-occlusal")).toBeUndefined();

    const l4 = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } });
    expect(find(l4, "caries-occlusal")?.opacity).toBe("0.7");

    const l6 = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 6 } });
    expect(find(l6, "caries-occlusal")?.opacity).toBe("1");
    expect(find(l6, "caries-occlusal")?.cls.split(/\s+/)).toContain("caries-deep");
  });

  it("primary caries with no stored severity defaults to ICDAS-2 (opacity 0.45), no subcaries", () => {
    const l = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"] });
    expect(find(l, "caries-occlusal")?.opacity).toBe("0.45");
    expect(find(l, "subcaries-occlusal")).toBeUndefined();
  });

  it("recurrent caries (caries + filling) → subcaries-{s} at the CARS opacity, NO caries-{s}", () => {
    const l = render({
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 3 },
    });
    expect(find(l, "subcaries-occlusal")).toBeTruthy();
    expect(find(l, "subcaries-occlusal")?.opacity).toBe("0.58"); // CARS 3
    expect(find(l, "subcaries-occlusal")?.cls).toBe("");         // no caries-deep on the recurrent path
    // The primary layer is NEVER co-active with the recurrent one.
    expect(find(l, "caries-occlusal")).toBeUndefined();
  });

  it("CARS opacity formula across the scale (recurrent surface): 6→1 … 1→0.3", () => {
    const at = (sev: number) => find(render({
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: sev },
    }), "subcaries-occlusal")?.opacity;
    expect(at(6)).toBe("1");
    expect(at(5)).toBe("0.86");
    expect(at(4)).toBe("0.72");
    expect(at(3)).toBe("0.58");
    expect(at(2)).toBe("0.44");
    expect(at(1)).toBe("0.3");
  });

  it("transition: adding a filling to a primary caried surface flips caries-X → subcaries-X and CARRIES the severity value", () => {
    // Primary: severity 4 read as ICDAS → caries-occlusal at tier-2 opacity 0.7.
    const primary = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } });
    expect(find(primary, "caries-occlusal")?.opacity).toBe("0.7");
    expect(find(primary, "subcaries-occlusal")).toBeUndefined();

    // SAME severity value (4), now WITH a filling → recurrent: the value is read
    // as CARS → subcaries-occlusal at 0.72, and the primary layer is gone.
    const recurrent = render({
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 4 },
    });
    expect(find(recurrent, "subcaries-occlusal")?.opacity).toBe("0.72"); // CARS 4
    expect(find(recurrent, "caries-occlusal")).toBeUndefined();
  });

  it("migration: a legacy caries∩filling surface with NO stored recurrent value → cariesSeverity 3", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
    });
    expect(get(16).cariesSeverity.occlusal).toBe(3);
  });

  it("migration: a 2.3 payload with cariesDepths (primary) + secondaryCaries (recurrent) merges per surface state", () => {
    // occlusal: caries + filling + secondaryCaries 5 → RECURRENT, CARS wins → 5.
    // mesial:   caries, no filling, cariesDepths 4      → PRIMARY, ICDAS depth  → 4.
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal", "caries-mesial"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesDepths: { mesial: 4, occlusal: 2 },
      secondaryCaries: { occlusal: 5 },
    });
    const s = get(16);
    expect(s.cariesSeverity.occlusal).toBe(5); // recurrent surface: secondaryCaries wins over cariesDepths
    expect(s.cariesSeverity.mesial).toBe(4);   // primary surface: cariesDepths
  });

  it("migration: a native cariesSeverity value ALWAYS wins over legacy cariesDepths/secondaryCaries", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 2 },
      secondaryCaries: { occlusal: 5 },
    });
    expect(get(16).cariesSeverity.occlusal).toBe(2);
  });

  it("migration: a caries surface with NO filling is never forced to recurrent (renders as primary)", () => {
    const l = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"] });
    expect(find(l, "caries-occlusal")).toBeTruthy();
    expect(find(l, "subcaries-occlusal")).toBeUndefined();
  });

  it("summary: a caried surface WITH a filling is reported recurrent/secondary; without a filling, primary", () => {
    setI18nLanguage("en");
    // occlusal has a filling → recurrent; mesial has none → primary. No stored
    // recurrent score is needed — recurrence is DERIVED from the filling.
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal", "caries-mesial"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
    });
    const summary = getOdontogramSummary();
    const caries = summary.sections.find(sec => sec.key === "caries");
    const item = caries?.items.find(i => i.includes("16")) ?? "";
    expect(item).toContain(t("toothInfo.secondary", "en"));
    expect(item).toContain("O");
    expect(item).toContain("M");
  });
});

// FIX 2 (final review, minor): a legacy raw payload can carry a contradictory
// "recurrent surface with Sound severity" — `caries` + a filling on the same
// surface + an explicit `cariesSeverity`/`secondaryCaries` 0 (CARS "Sound") on
// it. The popup can never author this (picking CARS 0 there already removes
// the caries via `applyRecurrentCariesScore` — see `caries.secondaryLabel` ~
// odontogram.ts:2767), so it's only reachable via raw import. Left as-is it
// renders `subcaries-{surface}` at the SVG's default opacity (an explicit 0
// isn't distinguished from "no score" by the render), silently keeping a
// caries indicator that contradicts its own Sound score. `hydrateState`
// normalizes it away, input-side only, by reusing `applyRecurrentCariesScore`
// (score 0 → remove from `caries`, clear `cariesSeverity`) — the exact same
// transition the popup performs.
describe("FIX 2 (final review): explicit CARS 0 on a recurrent surface is normalized to Sound on hydrate", () => {
  it("caries+filling+cariesSeverity 0 (native field) hydrates as a plain filling: removed from caries, severity cleared", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 0 },
    });
    const s = get(16);
    expect(s.cariesSeverity.occlusal).toBeUndefined();
    const raw = __getToothStateForTest(16) as unknown as { caries: string[] };
    expect(raw.caries).not.toContain("caries-occlusal");
  });

  it("caries+filling+secondaryCaries 0 (legacy field, resolves to severity 0) is normalized the same way", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      secondaryCaries: { occlusal: 0 },
    });
    const s = get(16);
    expect(s.cariesSeverity.occlusal).toBeUndefined();
    const raw = __getToothStateForTest(16) as unknown as { caries: string[] };
    expect(raw.caries).not.toContain("caries-occlusal");
  });

  it("renders identically to a plain (non-caried) filling — no caries-X or subcaries-X layer active", () => {
    const l = render({
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 0 },
    });
    expect(find(l, "subcaries-occlusal")).toBeUndefined();
    expect(find(l, "caries-occlusal")).toBeUndefined();
  });

  it("is scoped to RECURRENT surfaces only: a primary (unfilled) surface with cariesSeverity 0 is left untouched", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      cariesSeverity: { occlusal: 0 },
    });
    const s = get(16);
    expect(s.cariesSeverity.occlusal).toBe(0);
    const raw = __getToothStateForTest(16) as unknown as { caries: string[] };
    expect(raw.caries).toContain("caries-occlusal");
  });

  it("does not disturb an ordinary recurrent surface with a nonzero severity", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      cariesSeverity: { occlusal: 4 },
    });
    const s = get(16);
    expect(s.cariesSeverity.occlusal).toBe(4);
    const raw = __getToothStateForTest(16) as unknown as { caries: string[] };
    expect(raw.caries).toContain("caries-occlusal");
  });
});
