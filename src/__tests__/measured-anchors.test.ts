// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * The measured profile's perio-chart baseline anchors are DERIVED from the
 * artwork (each generated template publishes its measured registration points
 * as root `data-*` attributes) rather than restated as literals, so that
 * regenerating `src/assets/teeth-svgs/measured` cannot leave the CEJ baseline
 * behind on the previous geometry.
 *
 * These tests pin that derivation end to end: every side template contributes
 * an anchor, and each anchor equals `viewBoxHeight - publishedValue` — the
 * flip the perio chart applies (`y' = h - y`, see `buildPerioTooth`).
 */

import { describe, it, expect } from "vitest";
import { setToothAnatomy } from "../odontogram";
import { activeAnatomyProfile } from "../anatomy/profiles";

const templateSvgs = import.meta.glob("../assets/teeth-svgs/measured/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function svgFor(tplNo: number): string {
  const entry = Object.entries(templateSvgs).find(([path]) => path.endsWith(`/${tplNo}.svg`));
  if (!entry) throw new Error(`no measured asset for template ${tplNo}`);
  return entry[1];
}

function published(svgText: string, attribute: string): number {
  const height = /\sviewBox="\s*[-\d.eE+]+\s+[-\d.eE+]+\s+[-\d.eE+]+\s+([-\d.eE+]+)\s*"/.exec(svgText);
  const value = new RegExp(`\\s${attribute}="([-\\d.eE+]+)"`).exec(svgText);
  if (!height || !value) throw new Error(`missing ${attribute} or viewBox`);
  return Number((Number(height[1]) - Number(value[1])).toFixed(3));
}

describe("measured anatomy: registration anchors follow the artwork", () => {
  it("derives every side template's CEJ and implant anchor from its published metadata", async () => {
    await setToothAnatomy("measured");
    const p = activeAnatomyProfile();
    expect(p.tplNos.length).toBe(16);
    for (const tplNo of p.tplNos) {
      const svgText = svgFor(tplNo);
      expect(p.cejY[tplNo], `CEJ anchor for ${tplNo}`).toBe(published(svgText, "data-cej-y"));
      expect(p.implantCejY[tplNo], `implant anchor for ${tplNo}`).toBe(
        published(svgText, "data-implant-platform-y"),
      );
      // The implant platform sits coronal to the natural CEJ in row space
      // (the fixture's shoulder is below the crown-root boundary of the tooth
      // it replaces), so the anchor is always the smaller of the two.
      expect(p.implantCejY[tplNo]).toBeLessThan(p.cejY[tplNo]);
    }
    await setToothAnatomy("classic");
  });

  it("leaves no template without an anchor, and no anchor without a template", async () => {
    await setToothAnatomy("measured");
    const p = activeAnatomyProfile();
    const tplNos = [...p.tplNos].sort((a, b) => a - b);
    expect(Object.keys(p.cejY).map(Number).sort((a, b) => a - b)).toEqual(tplNos);
    expect(Object.keys(p.implantCejY).map(Number).sort((a, b) => a - b)).toEqual(tplNos);
    expect(Object.keys(p.milktoothCejY).map(Number).sort((a, b) => a - b)).toEqual(tplNos);
    await setToothAnatomy("classic");
  });

  it("negative probe: the assertion would catch an anchor read in raw (unflipped) space", async () => {
    await setToothAnatomy("measured");
    const p = activeAnatomyProfile();
    const svgText = svgFor(11);
    const raw = Number(/\sdata-cej-y="([-\d.eE+]+)"/.exec(svgText)![1]);
    // The raw value and the flipped anchor are genuinely different numbers, so
    // storing the un-flipped one would fail the test above rather than pass it.
    expect(p.cejY[11]).not.toBe(raw);
    expect(Math.abs(p.cejY[11] - raw)).toBeGreaterThan(0.5);
    await setToothAnatomy("classic");
  });
});
