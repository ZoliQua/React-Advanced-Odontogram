// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-2 Task 3: translated-vs-canonical periodontal index NAMES.
//
// `perioIndexNameMode` (Settings -> Periodontal tab, T1) toggles how every
// perio-chart index row label renders: "translated" (default) keeps the
// existing localized `t("perio.<x>.row")` (or equivalent) string; "canonical"
// instead shows a fixed English/Latin standard scientific name, regardless of
// the active UI language. This file covers all three surfaces named in the
// UI-2 spec: the grid row labels (`PerioChart.buildArch`), the overlay
// switcher pill labels, and the whole-mouth summary labels (`PerioSidebar`).
// The info-tooltip text (`perio.info.*`) must stay `t(...)`-localized in
// BOTH modes — never affected by this setting.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, act, fireEvent } from "@testing-library/react";
import PerioChart from "../PerioChart";
import PerioSidebar from "../PerioSidebar";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  getPerioIndexNameMode,
  setPerioIndexNameMode,
  onStateChange,
} from "../odontogram";
import { indexName, CANONICAL_INDEX_NAMES } from "../perioIndexNames";

function openGrid() {
  return render(createElement(PerioChart, { open: true, onClose: () => {} }));
}

function rowLabels(): string[] {
  const grid = document.getElementById("perioOverlayGrid")!;
  return Array.from(grid.querySelectorAll(".perio-fullgrid-row-label-text")).map((el) => el.textContent ?? "");
}

function overlayPillLabels(): Record<string, string> {
  const buttons = document.querySelectorAll<HTMLButtonElement>("#perioOverlaySwitch [data-overlay-layer]");
  const out: Record<string, string> = {};
  for (const btn of Array.from(buttons)) {
    out[btn.dataset.overlayLayer!] = btn.textContent ?? "";
  }
  return out;
}

function infoPopoverTextFor(rowLabelText: string): string | null {
  const grid = document.getElementById("perioOverlayGrid")!;
  const labelSpans = Array.from(grid.querySelectorAll(".perio-fullgrid-row-label-text"));
  const span = labelSpans.find((el) => el.textContent === rowLabelText);
  if (!span) return null;
  const cell = span.closest(".perio-fullgrid-row-label")!;
  const btn = cell.querySelector<HTMLButtonElement>(".perio-info-btn");
  if (!btn) return null;
  fireEvent.click(btn);
  const popoverText = document.querySelector(".perio-info-popover-text");
  return popoverText?.textContent ?? null;
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  // UI-3b Task 3: mPI/mBI additionally gate on the arch having an implant
  // (see ui3b-mpi-implant-gate.test.ts) — set one so the rows render across
  // this file's grid-label / info-tooltip / overlay-pill assertions.
  __setToothStateForTest(16, { toothSelection: "implant" });
  setNumberingSystem("FDI");
});

afterEach(() => {
  cleanup();
  setPerioIndexNameMode("translated");
});

describe("UI-2 Task 3: indexName() helper", () => {
  it("defaults to translated mode", () => {
    expect(getPerioIndexNameMode()).toBe("translated");
  });

  it("does NOT fire notifyStateChange when the mode is already the same (idempotent)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setPerioIndexNameMode("translated");
      expect(fired).toBe(false);
    } finally {
      unsub();
    }
  });

  it("returns the canonical string for every row in canonical mode", () => {
    setPerioIndexNameMode("canonical");
    for (const id of Object.keys(CANONICAL_INDEX_NAMES) as (keyof typeof CANONICAL_INDEX_NAMES)[]) {
      expect(indexName(id)).toBe(CANONICAL_INDEX_NAMES[id]);
    }
  });

  it("canonical names use the expected English/Latin standard forms", () => {
    expect(CANONICAL_INDEX_NAMES.pi).toBe("Plaque Index (PI)");
    expect(CANONICAL_INDEX_NAMES.gi).toBe("Gingival Index (GI)");
    expect(CANONICAL_INDEX_NAMES.mpi).toBe("Modified Plaque Index (mPI)");
    expect(CANONICAL_INDEX_NAMES.mbi).toBe("Modified Sulcus Bleeding Index (mBI)");
    expect(CANONICAL_INDEX_NAMES.kg).toBe("Keratinized Gingiva (KG)");
    expect(CANONICAL_INDEX_NAMES.gt).toBe("Gingival Thickness (GT)");
    expect(CANONICAL_INDEX_NAMES.miller).toBe("Miller Class");
    expect(CANONICAL_INDEX_NAMES.cej).toBe("CEJ Visibility");
    expect(CANONICAL_INDEX_NAMES.rootConcavity).toBe("Root Concavity");
    expect(CANONICAL_INDEX_NAMES.plaque).toBe("Plaque (O'Leary)");
    expect(CANONICAL_INDEX_NAMES.furcation).toBe("Furcation");
    expect(CANONICAL_INDEX_NAMES.mobility).toBe("Mobility");
  });
});

describe("UI-2 Task 3: PerioChart grid row labels", () => {
  it("translated mode (default) renders the existing t(...) labels", () => {
    openGrid();
    const labels = rowLabels();
    expect(labels).toContain("Plaque Index (PI)"); // en t("perio.pi.row")
    expect(labels).toContain("Gingival Index (GI)");
    expect(labels).toContain("Peri-implant Plaque Index (mPI)"); // en t("perio.mpi.row") -- differs from canonical
    expect(labels).toContain("Peri-implant Bleeding Index (mBI)");
    expect(labels).toContain("Mobility");
    expect(labels).toContain("CEJ visibility");
    expect(labels).toContain("Root concavity");
  });

  it("canonical mode renders the fixed canonical strings, including where they differ from en", () => {
    setPerioIndexNameMode("canonical");
    openGrid();
    const labels = rowLabels();
    expect(labels).toContain("Plaque Index (PI)");
    expect(labels).toContain("Gingival Index (GI)");
    expect(labels).toContain("Modified Plaque Index (mPI)"); // canonical differs from en's "Peri-implant..."
    expect(labels).toContain("Modified Sulcus Bleeding Index (mBI)");
    expect(labels).toContain("Mobility");
    expect(labels).toContain("CEJ Visibility");
    expect(labels).toContain("Root Concavity");
    // en's "Peri-implant ..." wording must NOT be present in canonical mode.
    expect(labels).not.toContain("Peri-implant Plaque Index (mPI)");
    expect(labels).not.toContain("Peri-implant Bleeding Index (mBI)");
  });

  it("rebuilds the grid live when the mode flips after mount", () => {
    openGrid();
    expect(rowLabels()).toContain("Peri-implant Plaque Index (mPI)");
    act(() => {
      setPerioIndexNameMode("canonical");
    });
    const labels = rowLabels();
    expect(labels).toContain("Modified Plaque Index (mPI)");
    expect(labels).not.toContain("Peri-implant Plaque Index (mPI)");

    act(() => {
      setPerioIndexNameMode("translated");
    });
    const labelsBack = rowLabels();
    expect(labelsBack).toContain("Peri-implant Plaque Index (mPI)");
  });

  it("the PD/GM/CAL/BOP composed row labels are unaffected (already a fixed abbreviation)", () => {
    openGrid();
    const translatedPdCount = rowLabels().filter((l) => l.endsWith("PD")).length;
    act(() => {
      setPerioIndexNameMode("canonical");
    });
    const canonicalPdCount = rowLabels().filter((l) => l.endsWith("PD")).length;
    expect(canonicalPdCount).toBe(translatedPdCount);
    expect(canonicalPdCount).toBe(4);
  });
});

describe("UI-2 Task 3: info-tooltip text is ALWAYS translated", () => {
  it("stays t('perio.info.pi') in translated mode", () => {
    openGrid();
    expect(infoPopoverTextFor("Plaque Index (PI)")).toMatch(/Silness/i);
  });

  it("stays t('perio.info.pi') in canonical mode too (tooltip never canonicalizes)", () => {
    setPerioIndexNameMode("canonical");
    openGrid();
    expect(infoPopoverTextFor("Plaque Index (PI)")).toMatch(/Silness/i);
  });

  it("stays t('perio.info.mbi') in canonical mode even though the row label itself changed", () => {
    setPerioIndexNameMode("canonical");
    openGrid();
    expect(infoPopoverTextFor("Modified Sulcus Bleeding Index (mBI)")).toMatch(/Mombelli/i);
  });
});

describe("UI-2 Task 3: overlay switcher pill labels", () => {
  it("translated mode shows the existing t('perio.overlay.<layer>') text", () => {
    openGrid();
    const pills = overlayPillLabels();
    expect(pills.pi).toBe("PI");
    expect(pills.gi).toBe("GI");
    expect(pills.mpi).toBe("mPI");
    expect(pills.mbi).toBe("mBI");
    expect(pills.pd).toBe("PD");
    expect(pills.cal).toBe("CAL");
    expect(pills.bop).toBe("BOP");
    expect(pills.plaque).toBe("Plaque");
    // Layers with no PerioRowId counterpart stay plain t(...).
    expect(pills.none).toBe("None");
    expect(pills.gr).toBe("Recession");
    expect(pills.cairo).toBe("Cairo");
  });

  it("canonical mode routes matching layers through indexName(), unaffected layers stay translated", () => {
    setPerioIndexNameMode("canonical");
    openGrid();
    const pills = overlayPillLabels();
    // pd/cal/bop/pi/gi/kg/mpi/mbi/plaque: canonical text (same abbreviation
    // for pd/cal/bop, but the FULL canonical form for pi/gi/mpi/mbi/plaque).
    expect(pills.pd).toBe("PD");
    expect(pills.cal).toBe("CAL");
    expect(pills.bop).toBe("BOP");
    expect(pills.pi).toBe("Plaque Index (PI)");
    expect(pills.gi).toBe("Gingival Index (GI)");
    expect(pills.kg).toBe("Keratinized Gingiva (KG)");
    expect(pills.mpi).toBe("Modified Plaque Index (mPI)");
    expect(pills.mbi).toBe("Modified Sulcus Bleeding Index (mBI)");
    expect(pills.plaque).toBe("Plaque (O'Leary)");
    // Layers with no PerioRowId counterpart are untouched by the mode.
    expect(pills.none).toBe("None");
    expect(pills.gr).toBe("Recession");
    expect(pills.cairo).toBe("Cairo");
  });
});

describe("UI-2 Task 3: PerioSidebar whole-mouth summary labels", () => {
  function summaryLabelText(id: string): string | null {
    const value = document.getElementById(id);
    const item = value?.closest(".perio-fullgrid-summary-item");
    return item?.querySelector(".perio-fullgrid-summary-label")?.textContent ?? null;
  }

  it("translated mode (default) renders the existing composed summary labels", () => {
    render(createElement(PerioSidebar));
    expect(summaryLabelText("perio-fg-summary-avgpd")).toBe("Avg PD");
    expect(summaryLabelText("perio-fg-summary-avgcal")).toBe("Avg CAL");
    expect(summaryLabelText("perio-fg-summary-maxpd")).toBe("Max PD");
    expect(summaryLabelText("perio-fg-summary-cal")).toBe("Worst CAL");
    expect(summaryLabelText("perio-fg-summary-maxfurc")).toBe("Max furcation");
  });

  it("canonical mode renders the fixed English/Latin composed summary labels", () => {
    setPerioIndexNameMode("canonical");
    render(createElement(PerioSidebar));
    expect(summaryLabelText("perio-fg-summary-avgpd")).toBe("Avg PD");
    expect(summaryLabelText("perio-fg-summary-avgcal")).toBe("Avg CAL");
    expect(summaryLabelText("perio-fg-summary-maxpd")).toBe("Max PD");
    expect(summaryLabelText("perio-fg-summary-cal")).toBe("Worst CAL");
    expect(summaryLabelText("perio-fg-summary-maxfurc")).toBe("Max Furcation");
  });

  it("re-renders live when the mode flips after mount (onStateChange)", () => {
    let unmount: (() => void) | undefined;
    act(() => {
      const result = render(createElement(PerioSidebar));
      unmount = result.unmount;
    });
    expect(summaryLabelText("perio-fg-summary-maxfurc")).toBe("Max furcation");
    act(() => {
      setPerioIndexNameMode("canonical");
    });
    expect(summaryLabelText("perio-fg-summary-maxfurc")).toBe("Max Furcation");
    unmount?.();
  });
});
