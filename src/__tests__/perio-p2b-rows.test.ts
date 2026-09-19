// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Periodontal-arc sub-project P2b, Task 4: surface the furcation (T2) and
// plaque (T3) data as ROWS in the perio chart (both chrome variants — the
// modal overlay `#perioOverlayGrid` and the inline `#perioInlineGrid` panel)
// plus max-furcation + PI% in the summary bar. Data/API already shipped
// (setFurcation/getToothFurcation, setPlaque/getToothPlaque, getPerioSummary
// .maxFurcation/.plaquePercent) — THIS is the UI over it.
//
// PerioChart is rendered directly (not via <App/>), mirroring perio-p2-grid.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import PerioChart from "../PerioChart";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  getToothFurcation,
  getToothPlaque,
  getPerioSummary,
} from "../odontogram";

function openOverlay() {
  return render(createElement(PerioChart, { open: true, onClose: () => {} }));
}
function openInline() {
  return render(createElement(PerioChart, { inline: true }));
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});

afterEach(() => {
  cleanup();
});

describe("P2b Task 4: furcation row", () => {
  it("a furcated + present upper molar (16) shows one control per entrance (mesial/distal/buccal)", () => {
    openOverlay();
    expect(document.getElementById("perio-fg-furc-16-mesial")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-16-distal")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-16-buccal")).toBeTruthy();
    // No lingual entrance on an upper molar.
    expect(document.getElementById("perio-fg-furc-16-lingual")).toBeNull();
  });

  it("a lower molar (46) shows buccal/lingual; an upper first premolar (14) shows mesial/distal", () => {
    openOverlay();
    expect(document.getElementById("perio-fg-furc-46-buccal")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-46-lingual")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-46-mesial")).toBeNull();
    expect(document.getElementById("perio-fg-furc-14-mesial")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-14-distal")).toBeTruthy();
    expect(document.getElementById("perio-fg-furc-14-buccal")).toBeNull();
  });

  it("a non-furcated tooth (15, second premolar) shows no furcation cell", () => {
    openOverlay();
    const furcCells = document.querySelectorAll('[id^="perio-fg-furc-15-"]');
    expect(furcCells.length).toBe(0);
  });

  it("a MISSING furcated tooth (16 = none) shows no furcation cell", () => {
    __setToothStateForTest(16, { toothSelection: "none" });
    openOverlay();
    const furcCells = document.querySelectorAll('[id^="perio-fg-furc-16-"]');
    expect(furcCells.length).toBe(0);
  });

  it("clicking a furcation control cycles the Glickman grade none->I->II->III->IV->none", () => {
    openOverlay();
    const btn = document.getElementById("perio-fg-furc-16-buccal") as HTMLButtonElement;
    expect(getToothFurcation(16).buccal).toBeUndefined();
    fireEvent.click(btn);
    expect(getToothFurcation(16).buccal).toBe(1);
    fireEvent.click(btn);
    expect(getToothFurcation(16).buccal).toBe(2);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(getToothFurcation(16).buccal).toBe(4);
    fireEvent.click(btn); // wraps back to none
    expect(getToothFurcation(16).buccal).toBeUndefined();
  });

  it("furcation controls on each entrance are independent", () => {
    openOverlay();
    fireEvent.click(document.getElementById("perio-fg-furc-16-mesial") as HTMLButtonElement);
    fireEvent.click(document.getElementById("perio-fg-furc-16-distal") as HTMLButtonElement);
    fireEvent.click(document.getElementById("perio-fg-furc-16-distal") as HTMLButtonElement);
    expect(getToothFurcation(16)).toEqual({ mesial: 1, distal: 2 });
  });
});

describe("P2b Task 4: plaque row", () => {
  it("a present tooth (26) shows a 4-surface plaque control (mesial/distal/buccal/lingual)", () => {
    openOverlay();
    for (const surface of ["mesial", "distal", "buccal", "lingual"]) {
      expect(document.getElementById(`perio-fg-plaque-26-${surface}`), surface).toBeTruthy();
    }
  });

  it("clicking a plaque surface toggles it (getToothPlaque updates) and the summary PI% changes", () => {
    openOverlay();
    expect(getToothPlaque(26)).toEqual([]);
    const btn = document.getElementById("perio-fg-plaque-26-buccal") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(getToothPlaque(26)).toContain("buccal");
    expect(getPerioSummary().plaquePercent).toBeGreaterThan(0);
    const plaqueSummary = document.getElementById("perio-fg-summary-plaque")!;
    expect(plaqueSummary.textContent).toContain(String(getPerioSummary().plaquePercent));
    fireEvent.click(btn); // toggle off
    expect(getToothPlaque(26)).toEqual([]);
  });

  it("a MISSING tooth's plaque controls are disabled", () => {
    __setToothStateForTest(21, { toothSelection: "none" });
    openOverlay();
    const btn = document.getElementById("perio-fg-plaque-21-buccal") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("P2b Task 4: summary bar", () => {
  it("shows a max-furcation and a PI% item reflecting getPerioSummary()", () => {
    openOverlay();
    // Both summary items exist.
    expect(document.getElementById("perio-fg-summary-maxfurc")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-plaque")).toBeTruthy();

    fireEvent.click(document.getElementById("perio-fg-furc-16-buccal") as HTMLButtonElement);
    fireEvent.click(document.getElementById("perio-fg-furc-16-buccal") as HTMLButtonElement);
    fireEvent.click(document.getElementById("perio-fg-furc-16-buccal") as HTMLButtonElement); // grade III
    fireEvent.click(document.getElementById("perio-fg-plaque-26-buccal") as HTMLButtonElement);

    const summary = getPerioSummary();
    expect(summary.maxFurcation).toBe(3);
    // Summary shows the Glickman grade in Roman numerals (III), matching the
    // row's cycle-control faces.
    expect(document.getElementById("perio-fg-summary-maxfurc")!.textContent).toBe("III");
    expect(document.getElementById("perio-fg-summary-plaque")!.textContent).toContain(
      String(summary.plaquePercent),
    );
  });

  it("starts with a blank max furcation when nothing is graded", () => {
    openOverlay();
    expect(document.getElementById("perio-fg-summary-maxfurc")!.textContent).toContain("–");
  });
});

describe("P2b Task 4: both chrome variants (overlay + inline) carry the rows", () => {
  it("the modal overlay renders both rows", () => {
    openOverlay();
    const root = document.getElementById("perioOverlayGrid")!;
    expect(root.querySelector('[id^="perio-fg-furc-16-"]')).toBeTruthy();
    expect(root.querySelector('[id^="perio-fg-plaque-26-"]')).toBeTruthy();
  });

  it("the inline panel renders both rows", () => {
    openInline();
    const root = document.getElementById("perioInlineGrid")!;
    expect(root.querySelector('[id^="perio-fg-furc-16-"]')).toBeTruthy();
    expect(root.querySelector('[id^="perio-fg-plaque-26-"]')).toBeTruthy();
  });
});
