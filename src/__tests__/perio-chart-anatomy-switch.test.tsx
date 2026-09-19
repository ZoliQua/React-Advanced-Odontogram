// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Switching the tooth-anatomy profile while the perio chart is OPEN.
//
// The chart parses its own copy of the tooth templates into `archCacheRef`, and
// that cache used to live for the lifetime of the `[active]` effect.
// `resetPerioTemplateCache()` (which `setToothAnatomy` calls) only clears
// `perioGraphic`'s promise, so the mounted chart kept drawing MEASURED tooth
// positions out of CLASSIC documents — the measured profile adds templates
// (12/15/17/31/46) the classic set does not have, so those teeth silently
// vanished from the arch. The cache now depends on the profile.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, act } from "@testing-library/react";
import PerioChart from "../PerioChart";
import { loadTemplateCache, buildBuccalArchSvg } from "../perioGraphic";
import { __resetChartStateForTest, setNumberingSystem, setToothAnatomy } from "../odontogram";

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];

/** Just the TOOTH GEOMETRY of a buccal row — the part that comes straight from
 *  the parsed templates, without the mm grid / curves / overlay the mounted
 *  chart draws on top. */
const toothGeometry = (root: Element | null | undefined): string =>
  Array.from(root?.querySelectorAll("[data-tooth]") ?? []).map((el) => el.outerHTML).join("");

/** The buccal arch the MOUNTED chart is currently showing. */
const mountedArch = () => toothGeometry(document.querySelector(".perio-tooth-row-buccal"));

/** The buccal arch built headlessly from a cache loaded RIGHT NOW — i.e. from
 *  whichever profile is active at this moment. */
async function freshArch(): Promise<string> {
  const cache = await loadTemplateCache();
  return toothGeometry(buildBuccalArchSvg(cache, UPPER_ARCH).querySelector(".perio-tooth-row-buccal"));
}

const settle = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});

afterEach(async () => {
  await act(async () => { await setToothAnatomy("classic"); });
  cleanup();
});

describe("perio chart: a live anatomy switch re-parses the templates", () => {
  it("draws from the profile that is active, not the one that was active on mount", async () => {
    render(createElement(PerioChart, { open: true, onClose: () => {} }));
    await settle();
    const classicMounted = mountedArch();
    expect(classicMounted.length).toBeGreaterThan(0);
    expect(classicMounted).toBe(await freshArch());        // baseline: agrees on mount

    await act(async () => { await setToothAnatomy("measured"); });
    await settle();

    // The measured profile has its OWN template set (it adds 12/15/17/31/46).
    // A cache kept from mount would keep drawing the classic documents, so the
    // mounted chart would no longer match a freshly built measured arch.
    const measuredFresh = await freshArch();
    expect(measuredFresh, "the two profiles draw identically — the probe proves nothing")
      .not.toBe(classicMounted);
    expect(mountedArch(), "the chart is still drawing the classic templates").toBe(measuredFresh);

    await act(async () => { await setToothAnatomy("classic"); });
    await settle();
    expect(mountedArch()).toBe(await freshArch());
  });
});
