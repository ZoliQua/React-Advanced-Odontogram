// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-2 Task 1: app-level Settings -> Periodontal tab.
//
// Two new module-level flags (mirroring the existing `perioViewMode`
// precedent): `perioRowVisibility` (per-index show/hide, default all
// visible) and `perioIndexNameMode` ("translated" | "canonical", default
// "translated"). Neither is serialized into the payload — they are app
// preferences, not chart data (the chart doesn't consume them yet; that's
// T2/T3). This file covers: default values, setter/getter round-trip, and
// the declarative Settings tab rendering the grouped toggles + name-mode
// control wired to those setters.
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import {
  getPerioRowVisibility,
  setPerioRowVisibility,
  getPerioIndexNameMode,
  setPerioIndexNameMode,
  type PerioRowId,
} from "../odontogram";
import { SETTINGS_TABS, type SettingsState } from "../SettingsModal";

const ALL_ROW_IDS: PerioRowId[] = [
  "plaque", "bop", "cal", "gm", "pd", "furcation", "mobility", "cej",
  "rootConcavity", "pi", "gi", "mpi", "mbi", "kg", "gt", "miller",
];

afterEach(() => {
  cleanup();
  // Restore module-level defaults so this file doesn't leak state into
  // other test files sharing the same module instance.
  for (const id of ALL_ROW_IDS) setPerioRowVisibility(id, true);
  setPerioIndexNameMode("translated");
});

const t = (key: string) => key;

function makeSettings(overrides: Partial<SettingsState> = {}): SettingsState {
  return {
    numbering: "FDI",
    onNumbering: vi.fn(),
    language: "en",
    onLanguage: vi.fn(),
    isDark: false,
    onToggleDark: vi.fn(),
    toothInfo: false,
    onToothInfo: vi.fn(),
    fillingDefectEnabled: true, onFillingDefectEnabled: vi.fn(),
    fillingComplexity: "complex", onFillingComplexity: vi.fn(),
    fillingMaterials: { amalgam: true, composite: true, gic: true, temporary: true }, onFillingMaterial: vi.fn(),
    fissureSealingEnabled: true, onFissureSealingEnabled: vi.fn(),
    selectionColor: "#3b7bff", onSelectionColor: vi.fn(),
    selectionBorderStyle: "dashed", onSelectionBorderStyle: vi.fn(),
    perioChartAvailable: true, onPerioChartAvailable: vi.fn(),
    planModeAvailable: true, onPlanModeAvailable: vi.fn(),
    screenToothSpacing: "normal", onScreenToothSpacing: vi.fn(),
    screenToothNumberSize: "normal", onScreenToothNumberSize: vi.fn(),
    toothAnatomy: "classic", onToothAnatomy: vi.fn(),
    exportPng: true, onExportPng: vi.fn(),
    exportJpg: true, onExportJpg: vi.fn(),
    exportSvg: true, onExportSvg: vi.fn(),
    exportPdf: true, onExportPdf: vi.fn(),
    importStatus: true, onImportStatus: vi.fn(),
    importFhir: true, onImportFhir: vi.fn(),
    codingPack: "none", onDiagnosisCodingPack: vi.fn(),
    snomedEnabled: false, onSnomedEnabled: vi.fn(),
    secondaryCariesMode: "standard",
    onSecondaryCariesMode: vi.fn(),
    icdas: false,
    onIcdas: vi.fn(),
    cariesDepth: false,
    onCariesDepth: vi.fn(),
    rootCariesMode: "simple",
    onRootCariesMode: vi.fn(),
    radiographicDepthMode: "off",
    onRadiographicDepthMode: vi.fn(),
    pulpLevel: "aae",
    onPulpLevel: vi.fn(),
    wearDetailLevel: "complex",
    onWearDetailLevel: vi.fn(),
    discolorationDetailLevel: "complex",
    onDiscolorationDetailLevel: vi.fn(),
    surfaceNotation: "full",
    onSurfaceNotation: vi.fn(),
    notes: false,
    onNotes: vi.fn(),
    showStatusCard: true,
    onShowStatusCard: vi.fn(),
    showOrthoCard: true,
    onShowOrthoCard: vi.fn(),
    perioViewMode: "toggle",
    onPerioViewMode: vi.fn(),
    perioRowVisibility: getPerioRowVisibility(),
    onPerioRowVisibility: (id, v) => setPerioRowVisibility(id, v),
    perioIndexNameMode: getPerioIndexNameMode(),
    onPerioIndexNameMode: (v) => setPerioIndexNameMode(v),
    pdfSettings: { defaultName: "John Doe", defaultDob: "1980-01-01", showAge: true, dateFormat: "iso", colorTheme: "blue", showBone: true, showHealthyPulp: true, toothSpacing: "wide", border: false, borderThickness: "medium", borderColor: "#000000", toothNumberSize: "normal", includeOdontogramText: true, includeOdontogramTable: true, perioToothSpacing: "wide", perioShowEmptyRows: true, perioLabelPlacement: "center", perioFontSize: "normal", includePerioTable: true, includePerioAbbrev: true, showDisclaimer: true, disclaimerText: "", summaryGrouping: "jaw", showGenerator: true },
    onPdfSettings: () => {},
    ...overrides,
  };
}

describe("UI-2 Task 1: module flags (odontogram.ts)", () => {
  it("defaults: every row visible, name mode 'translated'", () => {
    const visibility = getPerioRowVisibility();
    for (const id of ALL_ROW_IDS) {
      expect(visibility[id]).toBe(true);
    }
    expect(Object.keys(visibility).sort()).toEqual([...ALL_ROW_IDS].sort());
    expect(getPerioIndexNameMode()).toBe("translated");
  });

  it("setPerioRowVisibility flips a single row and persists via the getter", () => {
    expect(getPerioRowVisibility().pi).toBe(true);
    setPerioRowVisibility("pi", false);
    expect(getPerioRowVisibility().pi).toBe(false);
    // Other rows are untouched.
    expect(getPerioRowVisibility().gi).toBe(true);
    setPerioRowVisibility("pi", true);
    expect(getPerioRowVisibility().pi).toBe(true);
  });

  it("setPerioIndexNameMode flips the mode and persists via the getter", () => {
    expect(getPerioIndexNameMode()).toBe("translated");
    setPerioIndexNameMode("canonical");
    expect(getPerioIndexNameMode()).toBe("canonical");
    setPerioIndexNameMode("translated");
    expect(getPerioIndexNameMode()).toBe("translated");
  });
});

describe("UI-2 Task 1: Periodontal settings tab", () => {
  it("is registered with the expected id/titleKey", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "periodontalChart");
    expect(tab).toBeTruthy();
    expect(tab?.titleKey).toBe("settings.tab.periodontalChart");
  });

  it("renders one checkbox ToggleRow per the 16 row ids (+ the availability toggle), all checked by default", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "periodontalChart")!;
    const s = makeSettings();
    const { container } = render(tab.render({ t, s }));

    const checkboxes = Array.from(
      container.querySelectorAll('input[type="checkbox"]'),
    ) as HTMLInputElement[];
    // Round 2 (Stage 4): + the "Periodontal chart available" toggle at the top.
    expect(checkboxes.length).toBe(ALL_ROW_IDS.length + 1);
    for (const cb of checkboxes) {
      expect(cb.checked).toBe(true);
    }
  });

  it("renders group sub-headings", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "periodontalChart")!;
    const s = makeSettings();
    const { container } = render(tab.render({ t, s }));

    const headings = Array.from(
      container.querySelectorAll(".odon-settings-group-title"),
    ).map((el) => el.textContent);
    // Round 2 (Stage 4): a "General" group heads the tab (availability + view).
    expect(headings).toEqual([
      "settings.perio.group.general",
      "settings.perio.group.pocket",
      "settings.perio.group.hygiene",
      "settings.perio.group.mucogingival",
      "settings.perio.group.support",
      "settings.perio.group.periimplant",
    ]);
  });

  it("renders an index-name mode select bound to perioIndexNameMode", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "periodontalChart")!;
    const s = makeSettings({ perioIndexNameMode: "canonical" });
    const { container } = render(tab.render({ t, s }));

    const select = container.querySelector(
      'select[aria-label="settings.perioIndexNameMode"]',
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("canonical");
  });

  it("toggling a row's checkbox calls onPerioRowVisibility(id, false)", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "periodontalChart")!;
    const onPerioRowVisibility = vi.fn();
    const s = makeSettings({ onPerioRowVisibility });
    const { container } = render(tab.render({ t, s }));

    // "pi" is charted as the label t("settings.perio.row.pi") — locate its
    // checkbox via the aria-label wired by ToggleRow.
    const checkbox = container.querySelector(
      'input[aria-label="settings.perio.row.pi"]',
    ) as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);

    checkbox.click();
    expect(onPerioRowVisibility).toHaveBeenCalledWith("pi", false);
  });

  it("changing the index-name select calls onPerioIndexNameMode('canonical')", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "periodontalChart")!;
    const onPerioIndexNameMode = vi.fn();
    const s = makeSettings({ onPerioIndexNameMode });
    const { container } = render(tab.render({ t, s }));

    const select = container.querySelector(
      'select[aria-label="settings.perioIndexNameMode"]',
    ) as HTMLSelectElement;
    select.value = "canonical";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(onPerioIndexNameMode).toHaveBeenCalledWith("canonical");
  });

  it("Round 2 (Stage 4): availability toggle is wired; disabling it disables the other perio controls", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "periodontalChart")!;
    const onPerioChartAvailable = vi.fn();

    // Available: the availability toggle is on and enabled; sub-controls enabled.
    const on = render(tab.render({ t, s: makeSettings({ perioChartAvailable: true, onPerioChartAvailable }) }));
    const availOn = on.container.querySelector('input[aria-label="settings.perioChart.available"]') as HTMLInputElement;
    expect(availOn).toBeTruthy();
    expect(availOn.checked).toBe(true);
    expect(availOn.disabled).toBe(false);
    expect((on.container.querySelector('input[aria-label="settings.perio.row.pi"]') as HTMLInputElement).disabled).toBe(false);
    expect((on.container.querySelector('select[aria-label="settings.perioViewMode"]') as HTMLSelectElement).disabled).toBe(false);
    availOn.click();
    expect(onPerioChartAvailable).toHaveBeenCalledWith(false);
    on.unmount();

    // Unavailable: every OTHER perio control is disabled (the toggle itself stays on).
    const off = render(tab.render({ t, s: makeSettings({ perioChartAvailable: false }) }));
    expect((off.container.querySelector('input[aria-label="settings.perioChart.available"]') as HTMLInputElement).disabled).toBe(false);
    expect((off.container.querySelector('input[aria-label="settings.perio.row.pi"]') as HTMLInputElement).disabled).toBe(true);
    expect((off.container.querySelector('select[aria-label="settings.perioViewMode"]') as HTMLSelectElement).disabled).toBe(true);
    expect((off.container.querySelector('select[aria-label="settings.perioIndexNameMode"]') as HTMLSelectElement).disabled).toBe(true);
  });
});
