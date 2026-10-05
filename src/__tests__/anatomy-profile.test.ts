// Stage A — tooth-anatomy profile abstraction (classic only). Verifies the
// session flag accessors and that the active profile resolves to the classic
// (uniform16) profile, including the fallback when an unrealized value is set.
import { describe, it, expect, afterEach } from "vitest";
import {
  getToothAnatomy,
  setToothAnatomy,
  activeAnatomyProfile,
} from "../odontogram";

describe("tooth-anatomy profile (Stage A)", () => {
  afterEach(async () => {
    // Restore the default so ordering never leaks between assertions.
    await setToothAnatomy("classic");
  });

  it("defaults to classic", async () => {
    expect(getToothAnatomy()).toBe("classic");
  });

  it("setToothAnatomy round-trips the flag", async () => {
    await setToothAnatomy("measured");
    expect(getToothAnatomy()).toBe("measured");
  });

  it("activeAnatomyProfile resolves the layout per the selected profile", async () => {
    // Stage B realizes the measured profile — it now resolves to the two-arch
    // layout rather than falling back to classic.
    await setToothAnatomy("measured");
    expect(activeAnatomyProfile().layout).toBe("twoArch");
    await setToothAnatomy("classic");
    expect(activeAnatomyProfile().layout).toBe("uniform16");
  });

  it("the measured profile draws every position from its own template", async () => {
    await setToothAnatomy("measured");
    const p = activeAnatomyProfile();
    // One side template per clinically distinct position: the generator draws
    // the maxillary right and mandibular left quadrants, nothing else.
    expect(p.tplNos).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 31, 32, 33, 34, 35, 36, 37, 38]);
    // Occlusal tiles exist for the posterior positions only (premolars/molars).
    expect(p.occlNos).toEqual([14, 15, 16, 17, 18, 34, 35, 36, 37, 38]);
    expect(p.occlusalTemplate).toBeTruthy();
    // A lower first molar occlusal is its OWN template (36), not an upper flipped.
    expect(p.occlusalTemplate!.get(36)?.tpl).toBe(36);
    // Mirroring happens ONLY across the midline, never between arches: a tooth
    // is always drawn from a template in its own arch, and the two teeth of a
    // mirror pair share one template with opposite `mirror` flags.
    for (const [toothNo, map] of p.toothTemplate) {
      const upperTooth = [1, 2, 5, 6].includes(Math.floor(toothNo / 10));
      const upperTpl = [1, 2, 5, 6].includes(Math.floor(map.tpl / 10));
      expect(upperTpl, `tooth ${toothNo} uses template ${map.tpl}`).toBe(upperTooth);
      expect(map.tpl % 10, `tooth ${toothNo} keeps its position`).toBe(toothNo % 10);
    }
    expect(p.toothTemplate.get(16)).toEqual({ tpl: 16, rot: 0, mirror: false });
    expect(p.toothTemplate.get(26)).toEqual({ tpl: 16, rot: 0, mirror: true });
    expect(p.toothTemplate.get(36)).toEqual({ tpl: 36, rot: 180, mirror: false });
    expect(p.toothTemplate.get(46)).toEqual({ tpl: 36, rot: 180, mirror: true });
    await setToothAnatomy("classic");
    // Classic keeps its four templates and no separate occlusal map.
    expect(activeAnatomyProfile().tplNos).toEqual([11, 13, 14, 16]);
    expect(activeAnatomyProfile().occlusalTemplate).toBeUndefined();
  });
});
