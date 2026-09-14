// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Stage B — the selectable MEASURED tooth-anatomy profile. These tests exercise
// the REAL engine wiring (initOdontogram / buildGrid / rebuildGrid are NOT
// mocked; the measured SVG templates are `?raw`-inlined and parsed via DOMParser
// under jsdom), because the point of the tier is that switching to the measured
// profile rebuilds the grid into the two-arch layout, its measured tiles render,
// state edits still activate the right layers, and switching back restores the
// classic uniform grid.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, waitFor, act } from "@testing-library/react";
import App from "../App";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  setPerioViewMode,
  setToothAnatomy,
  getToothAnatomy,
  rebuildGrid,
  getStatusChart,
} from "../odontogram";

// Real init/build under jsdom is heavy and each case rebuilds the grid two or
// three times (profile switches); give the file generous headroom.
vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 });

// jsdom lacks matchMedia (isTouchDevice) and ResizeObserver (bridge-overlay /
// perio fill-scale); stub both so a REAL initOdontogram()/buildGrid() runs
// cleanly without unhandled rejections.
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
  // The anatomy profile is module-level session state (NOT part of chart reset);
  // pin it classic before each case so tests don't leak into one another.
  await setToothAnatomy("classic");
  setPerioViewMode("toggle");
  setNumberingSystem("FDI");
});

afterEach(async () => {
  // Never leave the measured profile selected for other test files.
  await setToothAnatomy("classic");
  cleanup();
});

async function waitForGrid() {
  await waitFor(() => {
    const grid = document.getElementById("toothGrid");
    expect(grid && grid.childElementCount).toBeGreaterThan(0);
  });
}

/** Switch the active anatomy profile and rebuild the grid, exactly the way the
 *  Settings `onToothAnatomy` handler does (setToothAnatomy + rebuildGrid). */
async function switchAnatomy(v: "classic" | "measured") {
  await act(async () => {
    await setToothAnatomy(v);
    await rebuildGrid();
  });
}

function sideTile(toothNo: number): HTMLElement {
  return document.querySelector(`.tooth-tile.side-view[data-tooth="${toothNo}"]`) as HTMLElement;
}

describe("measured anatomy profile", () => {
  it("classic is the default and produces a flat uniform grid (no arches)", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    expect(getToothAnatomy()).toBe("classic");
    const grid = document.getElementById("toothGrid")!;
    expect(grid.querySelector(".upper-arch")).toBeNull();
    expect(grid.querySelector(".lower-arch")).toBeNull();
    // Classic tiles are direct children of #toothGrid.
    expect(grid.querySelector(":scope > .tooth-tile.side-view")).toBeTruthy();
  });

  it("switching to measured rebuilds into a two-arch grid with tooth tiles", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    await switchAnatomy("measured");
    await waitForGrid();

    const grid = document.getElementById("toothGrid")!;
    const upper = grid.querySelector(".tooth-arch.upper-arch");
    const lower = grid.querySelector(".tooth-arch.lower-arch");
    expect(upper).toBeTruthy();
    expect(lower).toBeTruthy();
    // Each arch carries clickable side-view tiles.
    expect(upper!.querySelectorAll(".tooth-tile.side-view").length).toBeGreaterThan(0);
    expect(lower!.querySelectorAll(".tooth-tile.side-view").length).toBeGreaterThan(0);
    // Both arches present in the accessibility tree as presentation containers.
    expect(upper!.getAttribute("role")).toBe("presentation");
  });

  it("renders the id-different measured tiles (15/17/46) and their occlusal tile", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();
    await switchAnatomy("measured");
    await waitForGrid();

    for (const toothNo of [15, 17, 46]) {
      const tile = sideTile(toothNo);
      expect(tile, `side tile ${toothNo}`).toBeTruthy();
      expect(tile.querySelector("svg"), `svg for ${toothNo}`).toBeTruthy();
    }
    // The measured occlusal map draws a lower first-molar occlusal from its OWN
    // template (34/46_occl), not an upper one rotated: tooth 46 has an occl tile.
    expect(document.querySelector('.tooth-tile.occl-view[data-tooth="46"] svg')).toBeTruthy();
  });

  it("a state edit on a measured molar activates the expected layer", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();
    await switchAnatomy("measured");
    await waitForGrid();

    // Tooth 46 (lower molar, one of the reduced-id measured templates) -> implant.
    fireEvent.click(sideTile(46));
    const toothSelect = document.getElementById("toothSelect") as HTMLSelectElement;
    expect(toothSelect).toBeTruthy();
    toothSelect.value = "implant";
    fireEvent.change(toothSelect);

    expect(getStatusChart().teeth[46].toothSelection).toBe("implant");
    // The measured 46 template's implant-base layer is now active in the DOM.
    // (Use an attribute selector — jsdom's `#id` CSS selector is unreliable on
    // elements in the SVG namespace.)
    const svg = document.querySelector('.tooth-tile.side-view[data-tooth="46"] svg')!;
    const implantBase = svg.querySelector('[id="implant-base"]');
    expect(implantBase).toBeTruthy();
    expect(implantBase!.getAttribute("data-active")).not.toBe("0");
  });

  it("switching back to classic restores the flat uniform grid", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    await switchAnatomy("measured");
    await waitForGrid();
    expect(document.querySelector("#toothGrid .upper-arch")).toBeTruthy();

    await switchAnatomy("classic");
    await waitForGrid();

    const grid = document.getElementById("toothGrid")!;
    expect(grid.querySelector(".upper-arch")).toBeNull();
    expect(grid.querySelector(".lower-arch")).toBeNull();
    expect(grid.querySelector(":scope > .tooth-tile.side-view")).toBeTruthy();
    // Selection/edit still works on the restored classic grid.
    fireEvent.click(sideTile(16));
    expect(sideTile(16).classList.contains("active")).toBe(true);
  });
});
