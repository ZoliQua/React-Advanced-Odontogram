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

  it("the measured profile exposes the nine measured templates + occlusal map", async () => {
    await setToothAnatomy("measured");
    const p = activeAnatomyProfile();
    expect(p.tplNos).toEqual([11, 12, 13, 14, 15, 16, 17, 31, 46]);
    expect(p.occlNos).toEqual([14, 16, 34, 46]);
    expect(p.occlusalTemplate).toBeTruthy();
    // A lower first molar occlusal is its OWN template (46), not an upper flipped.
    expect(p.occlusalTemplate!.get(46)?.tpl).toBe(46);
    await setToothAnatomy("classic");
    // Classic keeps its four templates and no separate occlusal map.
    expect(activeAnatomyProfile().tplNos).toEqual([11, 13, 14, 16]);
    expect(activeAnatomyProfile().occlusalTemplate).toBeUndefined();
  });
});
