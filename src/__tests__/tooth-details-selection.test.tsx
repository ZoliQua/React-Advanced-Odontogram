// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Regression tests for two bugs found after the Tier 3f declarative Tooth-details
// conversion, both with the SAME roots:
//  1. A selected but unedited permanent tooth showed the "fresh extraction wound"
//     and "Closed gap" rows (valid only for a missing tooth) — getActiveToothDetails
//     treated a selected-but-not-yet-vivified tooth as "no active tooth" and
//     returned the no-selection shell (all rows visible).
//  2. After setting one tooth to Missing, selecting a different tooth did NOT update
//     the card — tooth selection ran updateSelectionUI() but never fired
//     notifyStateChange(), so the declarative cards (useEngineState) never re-read.
// Uses REAL init (buildGrid runs under jsdom) so the selection → notify → card
// re-read path is exercised end to end.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import { __resetChartStateForTest, setNumberingSystem, getStatusChart } from "../odontogram";

vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 });

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

beforeEach(() => {
  installDomStubs();
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});
afterEach(() => cleanup());

async function waitForGrid() {
  await waitFor(() => {
    const g = document.getElementById("toothGrid");
    expect(g && g.childElementCount).toBeGreaterThan(0);
  });
}
function tile(n: number): HTMLElement {
  return document.querySelector(`.tooth-tile[data-tooth="${n}"]`) as HTMLElement;
}
const isHidden = (id: string) => document.getElementById(id)!.classList.contains("hidden");

describe("Tooth-details card: selection & row visibility (Tier 3f regressions)", () => {
  it("hides the extraction-wound / closed-gap rows for a selected permanent tooth", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    fireEvent.click(tile(11)); // permanent, unedited (state not yet vivified)

    expect(document.getElementById("activeToothLabel")?.textContent).toBe("11");
    expect((document.getElementById("toothSelect") as HTMLSelectElement).value).toBe("tooth-base");
    expect(isHidden("extractionRow")).toBe(true);
    expect(isHidden("missingClosedRow")).toBe(true);
  });

  it("shows the extraction-wound / closed-gap rows once the tooth is Missing", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    fireEvent.click(tile(11));
    const sel = document.getElementById("toothSelect") as HTMLSelectElement;
    sel.value = "none"; // Missing tooth
    fireEvent.change(sel);

    expect(getStatusChart().teeth[11].toothSelection).toBe("none");
    expect(isHidden("extractionRow")).toBe(false);
    expect(isHidden("missingClosedRow")).toBe(false);
  });

  it("follows selection: after setting one tooth Missing, selecting another shows that tooth's own state", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    // Set tooth 11 to Missing.
    fireEvent.click(tile(11));
    const sel = document.getElementById("toothSelect") as HTMLSelectElement;
    sel.value = "none";
    fireEvent.change(sel);
    expect(getStatusChart().teeth[11].toothSelection).toBe("none");

    // Select a different, still-permanent tooth — the card must follow.
    fireEvent.click(tile(22));
    expect(document.getElementById("activeToothLabel")?.textContent).toBe("22");
    expect((document.getElementById("toothSelect") as HTMLSelectElement).value).toBe("tooth-base");
    expect(isHidden("extractionRow")).toBe(true);
    expect(isHidden("missingClosedRow")).toBe(true);
  });
});
