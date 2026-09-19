// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// FIX 2 (a11y): the settings-modal tablist uses a roving tabindex, so without
// an Arrow-key handler only the active tab is keyboard/AT reachable (the other
// four are mouse-only). This verifies APG-tabs keyboard support: Left/Right
// (and Up/Down) move + activate wrapping; Home → first, End → last.
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import SettingsModal, { type SettingsState } from "../SettingsModal";

afterEach(cleanup);

const t = (key: string) => key;

const settings: SettingsState = {
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
};

const renderModal = () =>
  render(<SettingsModal open onClose={vi.fn()} t={t} settings={settings} />);

const tabs = () => screen.getAllByRole("tab");
const selectedTab = () => tabs().find((el) => el.getAttribute("aria-selected") === "true");

describe("FIX 2: SettingsModal tablist keyboard navigation", () => {
  it("ArrowRight moves and activates the next tab (wrapping at the end)", () => {
    renderModal();
    const all = tabs();
    expect(selectedTab()).toBe(all[0]);

    fireEvent.keyDown(all[0], { key: "ArrowRight" });
    expect(selectedTab()).toBe(all[1]);
    expect(document.activeElement).toBe(all[1]);

    // wrap: ArrowRight from the last tab returns to the first
    fireEvent.keyDown(selectedTab()!, { key: "End" });
    expect(selectedTab()).toBe(all[all.length - 1]);
    fireEvent.keyDown(selectedTab()!, { key: "ArrowRight" });
    expect(selectedTab()).toBe(all[0]);
  });

  it("ArrowLeft wraps from the first tab to the last", () => {
    renderModal();
    const all = tabs();
    fireEvent.keyDown(all[0], { key: "ArrowLeft" });
    expect(selectedTab()).toBe(all[all.length - 1]);
    expect(document.activeElement).toBe(all[all.length - 1]);
  });

  it("Home selects the first tab and End the last", () => {
    renderModal();
    const all = tabs();
    fireEvent.keyDown(all[0], { key: "End" });
    expect(selectedTab()).toBe(all[all.length - 1]);
    fireEvent.keyDown(selectedTab()!, { key: "Home" });
    expect(selectedTab()).toBe(all[0]);
    expect(document.activeElement).toBe(all[0]);
  });

  it("keeps the roving tabindex: exactly one tab has tabIndex 0 after navigation", () => {
    renderModal();
    fireEvent.keyDown(tabs()[0], { key: "ArrowRight" });
    const zero = tabs().filter((el) => el.getAttribute("tabindex") === "0");
    expect(zero).toHaveLength(1);
    expect(zero[0]).toBe(selectedTab());
  });
});
