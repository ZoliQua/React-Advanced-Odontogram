// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP13 Task 3: "Tooth details" settings tab (wear/discoloration detail level).
// Exercises the real SETTINGS_TABS registry entry — not a rendered DOM, since
// this file must stay plain TS (no JSX) per the task brief. We call the tab's
// `render({ t, s })` directly and inspect the returned React element tree.
import { describe, it, expect, vi } from "vitest";
import { Children, isValidElement, type ReactElement } from "react";
import { SETTINGS_TABS, type SettingsState } from "../SettingsModal";

const t = (key: string) => key;

function stubSettings(): SettingsState {
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
  };
}

describe("SP13 Task 3: toothDetails settings tab", () => {
  // Round 2 restructure: tabs are now general, odontogram, periodontalChart,
  // toothDetails, … — so toothDetails is general+3. Tooth details also gained the
  // Pulp-detail select (moved from the removed Pulp tab) first and the Notes
  // toggle (moved from the removed Notes tab) last → 5 controls.
  it("exists in SETTINGS_TABS after general/odontogram/periodontalChart", () => {
    const generalIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "general");
    const odontogramIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "odontogram");
    const toothDetailsIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "toothDetails");

    expect(generalIdx).toBe(0);
    expect(odontogramIdx).toBe(generalIdx + 1);
    expect(toothDetailsIdx).toBe(generalIdx + 3);
    expect(SETTINGS_TABS[toothDetailsIdx].titleKey).toBe("settings.tab.toothDetails");
  });

  it("renders selection color/border, pulp-detail, wear, discoloration, surface-notation and notes controls", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "toothDetails")!;
    const s = stubSettings();
    const node = tab.render({ t, s });

    const children = Children.toArray((node as ReactElement).props.children).filter(
      isValidElement,
    ) as ReactElement<any>[];
    // Round 2 (Stage 5): selection color + border prepended → 7 controls, order:
    // selection-color, selection-border, pulp, wear, discoloration, notation, notes.
    expect(children).toHaveLength(7);

    const [, , , wearRow, discoRow, notationRow] = children;

    expect(wearRow.props.value).toBe(s.wearDetailLevel);
    expect(wearRow.props.descKey).toBe("settings.wearDetail.desc");
    expect(wearRow.props.label).toBe(t("settings.wearDetail.label"));
    expect((wearRow.props.options as { value: string; labelKey: string }[]).map((o) => o.value).sort()).toEqual([
      "complex",
      "simple",
    ]);

    expect(discoRow.props.value).toBe(s.discolorationDetailLevel);
    expect(discoRow.props.descKey).toBe("settings.discolorationDetail.desc");
    expect(discoRow.props.label).toBe(t("settings.discolorationDetail.label"));
    expect(
      (discoRow.props.options as { value: string; labelKey: string }[]).map((o) => o.value).sort(),
    ).toEqual(["complex", "simple"]);

    // SP16 Task 2: a new SelectRow bound to surfaceNotation ("full"/"simple").
    expect(notationRow.props.value).toBe(s.surfaceNotation);
    expect(notationRow.props.descKey).toBe("settings.surfaceNotation.desc");
    expect(notationRow.props.label).toBe(t("settings.surfaceNotation.label"));
    expect(
      (notationRow.props.options as { value: string; labelKey: string }[]).map((o) => o.value).sort(),
    ).toEqual(["full", "simple"]);
  });

  it("invoking each control's onChange calls the matching settings handler with the new value", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "toothDetails")!;
    const s = stubSettings();
    const node = tab.render({ t, s });
    const children = Children.toArray((node as ReactElement).props.children).filter(
      isValidElement,
    ) as ReactElement<any>[];
    const [, , , wearRow, discoRow, notationRow] = children;

    wearRow.props.onChange("simple");
    expect(s.onWearDetailLevel).toHaveBeenCalledTimes(1);
    expect(s.onWearDetailLevel).toHaveBeenCalledWith("simple");
    expect(s.onDiscolorationDetailLevel).not.toHaveBeenCalled();

    discoRow.props.onChange("simple");
    expect(s.onDiscolorationDetailLevel).toHaveBeenCalledTimes(1);
    expect(s.onDiscolorationDetailLevel).toHaveBeenCalledWith("simple");

    notationRow.props.onChange("simple");
    expect(s.onSurfaceNotation).toHaveBeenCalledTimes(1);
    expect(s.onSurfaceNotation).toHaveBeenCalledWith("simple");
  });
});
