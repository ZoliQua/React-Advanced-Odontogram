// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP15 Task 4:
//   B1 — a new "Panels" settings tab (id "panels") is inserted immediately
//        after "general", with two ToggleRows bound to showStatusCard /
//        showOrthoCard.
//   B2 — the standalone "secondaryCaries" tab is removed; its CARS SelectRow
//        is relocated into the "caries" tab, between the RootCariesMode row
//        and the RadiographicDepthMode row.
//
// Structural assertions only: render each tab's `render()` output (mirrors
// settings-modal-a11y.test.tsx's harness — a fully-populated SettingsState
// stub with vi.fn() handlers) and inspect the resulting DOM.
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { SETTINGS_TABS, type SettingsState } from "../SettingsModal";

afterEach(cleanup);

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
    perioRowVisibility: {
      plaque: true, bop: true, cal: true, gm: true, pd: true, furcation: true,
      mobility: true, cej: true, rootConcavity: true, pi: true, gi: true,
      mpi: true, mbi: true, kg: true, gt: true, miller: true,
    },
    onPerioRowVisibility: vi.fn(),
    perioIndexNameMode: "translated",
    onPerioIndexNameMode: vi.fn(),
    pdfSettings: { defaultName: "John Doe", defaultDob: "1980-01-01", showAge: true, dateFormat: "iso", colorTheme: "blue", showBone: true, showHealthyPulp: true, toothSpacing: "wide", border: false, borderThickness: "medium", borderColor: "#000000", toothNumberSize: "normal", includeOdontogramText: true, includeOdontogramTable: true, perioToothSpacing: "wide", perioShowEmptyRows: true, perioLabelPlacement: "center", perioFontSize: "normal", includePerioTable: true, includePerioAbbrev: true, showDisclaimer: true, disclaimerText: "", summaryGrouping: "jaw", showGenerator: true },
    onPdfSettings: vi.fn(),
    ...overrides,
  };
}

describe("SP15 Task 4 (B1): Odontogram settings tab (was Panels)", () => {
  it("is positioned immediately after the general tab", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    const generalIdx = ids.indexOf("general");
    expect(generalIdx).toBeGreaterThanOrEqual(0);
    expect(ids[generalIdx + 1]).toBe("odontogram");
  });

  it("has the expected titleKey", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "odontogram");
    expect(tab?.titleKey).toBe("settings.tab.odontogram");
  });

  it("renders Plan-mode + Tooth-info + Statuses + Orthodontics toggles, each wired to its handler", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "odontogram")!;
    const onPlanModeAvailable = vi.fn();
    const onToothInfo = vi.fn();
    const onShowStatusCard = vi.fn();
    const onShowOrthoCard = vi.fn();
    const s = makeSettings({
      planModeAvailable: true,
      onPlanModeAvailable,
      toothInfo: true,
      onToothInfo,
      showStatusCard: true,
      onShowStatusCard,
      showOrthoCard: false,
      onShowOrthoCard,
    });
    const { container } = render(tab.render({ t, s }));

    // Round 2 (Stage 3): 4 toggles now, in order: plan-mode, tooth-info,
    // statuses, orthodontics (plus three SelectRows: screen spacing / number
    // size / tooth-anatomy).
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(4);
    expect(container.querySelectorAll("select")).toHaveLength(3);

    (checkboxes[0] as HTMLInputElement).click();
    expect(onPlanModeAvailable).toHaveBeenCalledWith(false);

    (checkboxes[1] as HTMLInputElement).click();
    expect(onToothInfo).toHaveBeenCalledWith(false);

    (checkboxes[2] as HTMLInputElement).click();
    expect(onShowStatusCard).toHaveBeenCalledWith(false);

    (checkboxes[3] as HTMLInputElement).click();
    expect(onShowOrthoCard).toHaveBeenCalledWith(true);
  });

  it("renders screen tooth-spacing + tooth-number-size selects wired to their handlers", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "odontogram")!;
    const onScreenToothSpacing = vi.fn();
    const onScreenToothNumberSize = vi.fn();
    const s = makeSettings({ onScreenToothSpacing, onScreenToothNumberSize });
    const { container } = render(tab.render({ t, s }));

    const spacing = container.querySelector('select[aria-label="settings.screen.spacing"]') as HTMLSelectElement;
    const size = container.querySelector('select[aria-label="settings.screen.numberSize"]') as HTMLSelectElement;
    expect(spacing).toBeTruthy();
    expect(size).toBeTruthy();
    expect(Array.from(spacing.options).map((o) => o.value)).toEqual(["wide", "normal", "close"]);
    expect(Array.from(size.options).map((o) => o.value)).toEqual(["small", "normal", "xlarge"]);
  });
});

describe("SP15 Task 4 (B2): merged Caries / Secondary-caries settings", () => {
  it("removes the standalone secondaryCaries tab", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    expect(ids).not.toContain("secondaryCaries");
  });

  it("caries tab renders the CARS select between root-caries and radiographic-depth", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "caries")!;
    const s = makeSettings();
    const { container } = render(tab.render({ t, s }));

    const selects = Array.from(container.querySelectorAll("select"));
    // aria-label on each <select> is the row's label text (t() is identity here).
    const labels = selects.map((el) => el.getAttribute("aria-label"));

    const rootIdx = labels.indexOf("caries.rootLabel");
    const carsIdx = labels.indexOf("caries.secondaryLabel");
    const radioIdx = labels.indexOf("caries.radiographicLabel");

    expect(rootIdx).toBeGreaterThanOrEqual(0);
    expect(carsIdx).toBeGreaterThanOrEqual(0);
    expect(radioIdx).toBeGreaterThanOrEqual(0);
    expect(carsIdx).toBeGreaterThan(rootIdx);
    expect(radioIdx).toBeGreaterThan(carsIdx);
  });

  it("caries tab CARS select is wired to secondaryCariesMode / onSecondaryCariesMode", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "caries")!;
    const onSecondaryCariesMode = vi.fn();
    const s = makeSettings({ secondaryCariesMode: "full", onSecondaryCariesMode });
    const { container } = render(tab.render({ t, s }));

    const select = container.querySelector(
      'select[aria-label="caries.secondaryLabel"]',
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("full");
  });

  it("does not duplicate the total tab count (net zero: -1 secondaryCaries, +1 panels)", () => {
    // Guards against accidentally leaving a stray/duplicate tab entry behind.
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("UI-2 Task 1: Periodontal settings tab", () => {
  it("is present in the tab registry, uniquely", () => {
    const ids = SETTINGS_TABS.map((tab) => tab.id);
    // Round 2 restructure: Panels→Odontogram, Periodontal→Periodontal Chart
    // (moved up), PDF Settings→Export; Pulp+Notes tabs folded into Tooth details;
    // new Fillings tab.
    expect(ids).toEqual([
      "general",
      "odontogram",
      "periodontalChart",
      "toothDetails",
      "caries",
      "fillings",
      "export",
    ]);
  });

  it("has the expected titleKey", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "periodontalChart");
    expect(tab?.titleKey).toBe("settings.tab.periodontalChart");
  });
});

describe("Round 2 (Stage 2): General export/import availability", () => {
  it("renders the export (PNG/JPG/SVG/PDF) + import (Status/FHIR) toggles wired to handlers", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "general")!;
    const onExportPng = vi.fn();
    const onExportPdf = vi.fn();
    const onImportFhir = vi.fn();
    const s = makeSettings({ exportPng: true, onExportPng, exportPdf: true, onExportPdf, importFhir: true, onImportFhir });
    const { container } = render(tab.render({ t, s }));

    const png = container.querySelector('input[aria-label="settings.export.png"]') as HTMLInputElement;
    const pdf = container.querySelector('input[aria-label="settings.export.pdf"]') as HTMLInputElement;
    const fhir = container.querySelector('input[aria-label="settings.import.fhir"]') as HTMLInputElement;
    expect(png).toBeTruthy();
    expect(pdf).toBeTruthy();
    expect(fhir).toBeTruthy();
    // JPG + SVG + Status toggles also present.
    expect(container.querySelector('input[aria-label="settings.export.jpg"]')).toBeTruthy();
    expect(container.querySelector('input[aria-label="settings.export.svg"]')).toBeTruthy();
    expect(container.querySelector('input[aria-label="settings.import.status"]')).toBeTruthy();

    png.click();
    expect(onExportPng).toHaveBeenCalledWith(false);
    pdf.click();
    expect(onExportPdf).toHaveBeenCalledWith(false);
    fhir.click();
    expect(onImportFhir).toHaveBeenCalledWith(false);
  });

  it("no longer renders the coming-soon export/import placeholder", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "general")!;
    const { container } = render(tab.render({ t, s: makeSettings() }));
    expect(container.querySelector(".odon-settings-badge")).toBeNull();
  });
});

describe("Round 2 (Stage 6): Fillings tab", () => {
  it("renders defect + fissure + 4 material toggles and a complexity select, wired to handlers", () => {
    const tab = SETTINGS_TABS.find((t) => t.id === "fillings")!;
    const onFillingDefectEnabled = vi.fn();
    const onFillingComplexity = vi.fn();
    const onFillingMaterial = vi.fn();
    const onFissureSealingEnabled = vi.fn();
    const s = makeSettings({ onFillingDefectEnabled, onFillingComplexity, onFillingMaterial, onFissureSealingEnabled });
    const { container } = render(tab.render({ t, s }));

    // 1 defect + 4 materials + 1 fissure = 6 checkboxes; 1 complexity select.
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(6);
    const complexity = container.querySelector('select[aria-label="settings.filling.complexity"]') as HTMLSelectElement;
    expect(complexity).toBeTruthy();
    expect(Array.from(complexity.options).map((o) => o.value)).toEqual(["complex", "simple"]);

    (container.querySelector('input[aria-label="settings.filling.defect"]') as HTMLInputElement).click();
    expect(onFillingDefectEnabled).toHaveBeenCalledWith(false);

    (container.querySelector('input[aria-label="filling.option.amalgam"]') as HTMLInputElement).click();
    expect(onFillingMaterial).toHaveBeenCalledWith("amalgam", false);

    (container.querySelector('input[aria-label="settings.filling.fissure"]') as HTMLInputElement).click();
    expect(onFissureSealingEnabled).toHaveBeenCalledWith(false);
  });
});
