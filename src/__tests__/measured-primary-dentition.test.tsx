// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// The measured profile draws a milk tooth from its OWN deciduous template
// instead of the permanent template's `#milktooth-base` layer. Both drawings
// live in the same tile and exactly one is displayed, so switching a tooth to
// or from `milktooth` flips artwork without rebuilding the tile — which would
// drop its selection, focus and listeners.
//
// These tests run the REAL engine (initOdontogram / buildGrid are not mocked)
// for the same reason `measured-anatomy.test.tsx` does: the behaviour under
// test IS the wiring.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, waitFor, act } from "@testing-library/react";
import App from "../App";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  setPerioViewMode,
  setToothAnatomy,
  getStatusChart,
} from "../odontogram";
import { activeAnatomyProfile } from "../anatomy/profiles";
import { archToothLayout, loadTemplateCache, getToothBaseGroupFromCache } from "../perioGraphic";

vi.setConfig({ testTimeout: 60000, hookTimeout: 60000 });

function installDomStubs() {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  })) as unknown as typeof window.matchMedia;
  if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver === "undefined") {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
}

beforeEach(async () => {
  installDomStubs();
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  await setToothAnatomy("classic");
  setPerioViewMode("toggle");
  setNumberingSystem("FDI");
});

afterEach(async () => {
  await setToothAnatomy("classic");
  cleanup();
});

async function waitForGrid() {
  await waitFor(() => {
    const grid = document.getElementById("toothGrid");
    expect(grid && grid.childElementCount).toBeGreaterThan(0);
  });
}

async function switchAnatomy(v: "classic" | "measured") {
  await act(async () => { await setToothAnatomy(v); });
}

function sideTile(toothNo: number): HTMLElement {
  return document.querySelector(`.tooth-tile.side-view[data-tooth="${toothNo}"]`) as HTMLElement;
}

function rootsOf(toothNo: number): SVGElement[] {
  return Array.from(sideTile(toothNo).querySelectorAll("svg")) as unknown as SVGElement[];
}

function setSelection(toothNo: number, value: string) {
  fireEvent.click(sideTile(toothNo));
  const toothSelect = document.getElementById("toothSelect") as HTMLSelectElement;
  toothSelect.value = value;
  fireEvent.change(toothSelect);
}

describe("measured anatomy: the deciduous dentition", () => {
  it("gives every milk-capable position two artwork variants, and the molars one", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();
    await switchAnatomy("measured");
    await waitForGrid();

    // Positions 1-5 can carry a milk tooth (PRIMARY_MILK) -> permanent + primary.
    for (const toothNo of [11, 12, 13, 14, 15, 24, 35, 41]) {
      const roots = rootsOf(toothNo);
      expect(roots.map((r) => r.getAttribute("data-variant")), `tooth ${toothNo}`)
        .toEqual(["permanent", "primary"]);
    }
    // Positions 6-8 are MILKTOOTH_BLOCKED -> a single, unlabelled root.
    for (const toothNo of [16, 17, 18, 47]) {
      const roots = rootsOf(toothNo);
      expect(roots, `tooth ${toothNo}`).toHaveLength(1);
      expect(roots[0].getAttribute("data-variant")).toBeNull();
    }
  });

  it("flips which variant is displayed when a tooth becomes a milk tooth, and back", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();
    await switchAnatomy("measured");
    await waitForGrid();

    const tile = sideTile(14);
    const [permanent, primary] = rootsOf(14);
    expect(permanent.style.display).not.toBe("none");
    expect(primary.style.display).toBe("none");

    setSelection(14, "milktooth");
    expect(getStatusChart().teeth[14].toothSelection).toBe("milktooth");
    expect(permanent.style.display).toBe("none");
    expect(primary.style.display).not.toBe("none");
    // The tile itself survived: same node, same roots, selection intact.
    expect(sideTile(14)).toBe(tile);
    expect(rootsOf(14)).toEqual([permanent, primary]);
    expect(tile.getAttribute("aria-selected")).toBe("true");

    setSelection(14, "tooth-base");
    expect(permanent.style.display).not.toBe("none");
    expect(primary.style.display).toBe("none");
  });

  it("paints BOTH variants from the same state, so the flip shows no stale tooth", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();
    await switchAnatomy("measured");
    await waitForGrid();

    // Chart an implant on 15 while the permanent variant is the visible one;
    // the hidden deciduous root must have been painted too.
    setSelection(15, "implant");
    for (const root of rootsOf(15)) {
      const implantBase = root.querySelector('[id="implant-base"]');
      expect(implantBase, "implant-base layer").toBeTruthy();
      expect(implantBase!.getAttribute("data-active")).not.toBe("0");
    }
  });

  it("the classic profile is untouched: one root per tile, no variant attribute", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    for (const toothNo of [11, 14, 16, 35]) {
      const roots = rootsOf(toothNo);
      expect(roots, `tooth ${toothNo}`).toHaveLength(1);
      expect(roots[0].getAttribute("data-variant")).toBeNull();
    }
    expect(activeAnatomyProfile().primaryToothTemplate).toBeUndefined();
  });
});

describe("measured anatomy: the perio chart agrees with the grid", () => {
  it("draws a milk tooth from the deciduous template, not the permanent one", async () => {
    await setToothAnatomy("measured");
    const cache = await loadTemplateCache();
    const profile = activeAnatomyProfile();

    const permanentTpl = profile.toothTemplate.get(14)!.tpl;
    const primaryTpl = profile.primaryToothTemplate!.get(14)!.tpl;
    expect(permanentTpl).toBe(14);
    expect(primaryTpl).toBe(54);

    expect(getToothBaseGroupFromCache(cache, 14, {}).getAttribute("data-tpl")).toBe("14");
    expect(getToothBaseGroupFromCache(cache, 14, { milktooth: true }).getAttribute("data-tpl")).toBe("54");
    // An implant wins over a milk tooth — it is a fixture, not a deciduous tooth.
    expect(getToothBaseGroupFromCache(cache, 14, { milktooth: true, implant: true }).getAttribute("data-tpl")).toBe("14");
    await setToothAnatomy("classic");
  });

  it("reserves the deciduous molar's own, wider column", async () => {
    await setToothAnatomy("measured");
    const cache = await loadTemplateCache();
    // The lower deciduous molars are the widest divergence: template 74 is 42.9
    // units wide against permanent 34's 39.8, and 75 is 44.2 against 35's 39.8.
    // (Not every pair diverges — deciduous 54 matches permanent 14 exactly —
    // which is precisely why the column must be read from the artwork in use.)
    const teeth = [34, 35] as const;

    const permanentOnly = archToothLayout(cache, teeth);
    const asMilkTeeth = archToothLayout(cache, teeth, undefined, () => "milktooth");

    const permanentWidths = permanentOnly.teeth.map((t) => t.width);
    const milkWidths = asMilkTeeth.teeth.map((t) => t.width);
    expect(milkWidths[0]).toBeGreaterThan(permanentWidths[0]);
    expect(milkWidths[1]).toBeGreaterThan(permanentWidths[1]);
    expect(asMilkTeeth.totalWidth).toBeGreaterThan(permanentOnly.totalWidth);
    // …and the second tooth's x shifts with the first tooth's width, so the
    // neighbour is pushed along rather than overlapped.
    expect(asMilkTeeth.teeth[1].x).toBeGreaterThan(permanentOnly.teeth[1].x);
    await setToothAnatomy("classic");
  });

  it("negative probe: a kind-blind layout would have reused the permanent column", async () => {
    await setToothAnatomy("measured");
    const cache = await loadTemplateCache();
    // Passing a kindFn that never reports a milk tooth must reproduce the
    // permanent-only layout exactly — so the previous assertion is measuring
    // the deciduous template, not merely the presence of a kindFn.
    const blind = archToothLayout(cache, [34, 35], undefined, () => "normal");
    const none = archToothLayout(cache, [34, 35]);
    expect(blind.teeth).toEqual(none.teeth);
    expect(blind.totalWidth).toBe(none.totalWidth);
    await setToothAnatomy("classic");
  });
});
