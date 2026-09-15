// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// What happens when the code-split measured chunk does NOT arrive (offline, a
// chunk missing from a deploy, a CDN hiccup). Two properties matter and neither
// is visible in the happy path:
//
//  1. the failed load must not be cached — a rejected promise kept in the module
//     slot made the measured profile permanently unusable until a page reload;
//  2. `setToothAnatomy()` must stay on the current profile and resolve, never
//     reject: hosts call it un-awaited, and an unhandled rejection in a library
//     setter is not an acceptable failure mode.
//
// Own file: it mocks the chunk, so it needs a module registry no other suite
// shares.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const FAKE_PROFILE = {
  templates: {}, templatesOccl: {}, toothTemplate: new Map(), tplNos: [], occlNos: [],
  layout: "twoArch", cejY: {}, implantCejY: {}, milktoothCejY: {},
};

describe("measured anatomy: a chunk that fails to load", () => {
  beforeEach(() => { vi.resetModules(); });
  afterEach(() => { vi.doUnmock("../anatomy/measured"); vi.restoreAllMocks(); });

  it("is not cached: the next selection retries and succeeds", async () => {
    let attempts = 0;
    vi.doMock("../anatomy/measured", () => {
      attempts++;
      if (attempts === 1) throw new Error("chunk 404");
      return { MEASURED_PROFILE: FAKE_PROFILE };
    });
    const profiles = await import("../anatomy/profiles");

    await expect(profiles.ensureMeasuredProfile()).rejects.toThrow();
    expect(profiles.isMeasuredProfileLoaded()).toBe(false);

    await profiles.ensureMeasuredProfile();          // the retry must reach the chunk again
    expect(profiles.isMeasuredProfileLoaded()).toBe(true);
    expect(attempts).toBe(2);
  });

  it("leaves setToothAnatomy on the current profile, resolved and reported", async () => {
    vi.doMock("../anatomy/measured", () => { throw new Error("chunk 404"); });
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const { setToothAnatomy, getToothAnatomy, activeAnatomyProfile } = await import("../odontogram");

    await expect(setToothAnatomy("measured")).resolves.toBeUndefined();   // never rejects
    expect(getToothAnatomy()).toBe("classic");
    expect(activeAnatomyProfile().layout).toBe("uniform16");
    expect(err).toHaveBeenCalled();                                       // and never silent
  });

  it("does not block a later successful selection", async () => {
    let attempts = 0;
    vi.doMock("../anatomy/measured", () => {
      attempts++;
      if (attempts === 1) throw new Error("chunk 404");
      return { MEASURED_PROFILE: FAKE_PROFILE };
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { setToothAnatomy, getToothAnatomy } = await import("../odontogram");

    await setToothAnatomy("measured");
    expect(getToothAnatomy()).toBe("classic");       // first attempt failed
    await setToothAnatomy("measured");
    expect(getToothAnatomy()).toBe("measured");      // second attempt went through
  });
});
