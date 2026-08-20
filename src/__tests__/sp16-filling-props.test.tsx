// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Issue #17: <OdontogramShell> now accepts the four fillings settings as
// controlled props (fillingComplexity, fillingDefectEnabled,
// fillingMaterialAvailability, fissureSealingEnabled) plus their on*Change
// write-back callbacks.
//
// Contract under test:
//  - Provided prop  -> engine setter called + Settings-modal state mirrors it.
//  - Prop change    -> engine setter re-fired with the new value.
//  - Omitted prop   -> engine setters NEVER called (defined-gated — unlike the
//    `pulpDetailLevel`-style props, which reset the engine to their default on
//    mount); the React state falls back to whatever the engine currently holds.
//  - fillingMaterialAvailability -> an inline literal with identical content
//    must NOT re-fire the sync effect (canonical serialized-key dependency);
//    a content change must.
//  - on*Change callbacks fire from the Settings -> Fillings tab.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import App from "../App";
import {
  getFillingDefectEnabled,
  setFillingDefectEnabled,
  getFillingComplexity,
  setFillingComplexity,
  getFissureSealingEnabled,
  setFissureSealingEnabled,
  getFillingMaterialAvailability,
  setFillingMaterialAvailability,
} from "../odontogram";

vi.mock("../odontogram", () => ({
  initOdontogram: vi.fn().mockResolvedValue(undefined),
  destroyOdontogram: vi.fn(),
  rewireControls: vi.fn(),
  // Composable-UI Tier 3: OrthodonticsCard reads these engine exports.
  getActiveOrtho: vi.fn().mockReturnValue(null),
  getActiveCaries: vi.fn().mockReturnValue({ surfaces: [], subcrownChecked: false, subcrownDisabled: true, subcrownLabel: "", cariesActiveDepth: 2, rootCariesDisplay: "none", cariesDepthVisible: true, rootCariesVisible: true, cariesSectionVisible: true }),
  getCariesDepthOptions: vi.fn().mockReturnValue([]),
  rootCariesOptions: vi.fn().mockReturnValue([]),
  setCariesSurfaceForSelection: vi.fn(),
  setCariesActiveDepthForSelection: vi.fn(),
  setRootCariesForSelection: vi.fn(),
  openCariesDepthPopup: vi.fn(),
  getActiveFillings: vi.fn().mockReturnValue({ surfaces: [], fillingMaterial: "none", fillingOptions: [], surfaceGridVisible: false, defectDisabled: false, simpleMode: false, simpleRowVisible: false, simpleToggleChecked: false, simpleDefectRowVisible: false, simpleDefectValue: "none", simpleDefectOptions: [], fissureSealing: false, fissureRowVisible: true, fillingSectionVisible: true, subcariesSummary: "", defectSummary: "" }),
  setFillingMaterialForSelection: vi.fn(),
  setFillingSurfaceForSelection: vi.fn(),
  setFillingSimpleToggleForSelection: vi.fn(),
  setFillingSimpleDefectForSelection: vi.fn(),
  setFissureSealingForSelection: vi.fn(),
  openFillingDefectPopup: vi.fn(),
  getActiveRootPerio: vi.fn().mockReturnValue({ sectionVisible: true, rootBlockVisible: true, perioBlockVisible: true, pulpEndoValue: "normal", pulpEndoNoneOption: null, pulpEndoGroups: [], pulpEndoDisabled: false, apicalDxValue: "normal", apicalDxOptions: [], apicalDxDisabled: false, apicalDxRowVisible: true, periapicalTypeValue: "none", periapicalTypeOptions: [], periapicalRowVisible: false, resorptionValue: "none", resorptionOptions: [], resorptionDisabled: false, resorptionRowVisible: true, endoResectionChecked: false, endoResectionDisabled: false, parapulpalPinChecked: false, parapulpalPinDisabled: false, mobilityValue: "none", mobilityOptions: [], mobilityDisabled: false, mobilityRowVisible: true, perioRowVisible: true, mods: [], calculusChecked: false, calculusRowVisible: false, periImplantValue: "none", periImplantOptions: [], periImplantRowVisible: false }),
  setPulpEndoForSelection: vi.fn(),
  setApicalDxForSelection: vi.fn(),
  setPeriapicalTypeForSelection: vi.fn(),
  setResorptionForSelection: vi.fn(),
  setEndoResectionForSelection: vi.fn(),
  setParapulpalPinForSelection: vi.fn(),
  setMobilityForSelection: vi.fn(),
  setModForSelection: vi.fn(),
  setCalculusForSelection: vi.fn(),
  setPeriImplantForSelection: vi.fn(),
  // DX-2 Task 4: DiagnosesCard (mounted unconditionally as part of ToothControlsSurface) reads/writes these.
  getActiveDiagnoses: vi.fn().mockReturnValue({ visible: false, rows: [], addableKeys: [] }),
  setDxOverrideForSelection: vi.fn(),
  getActiveToothDetails: vi.fn().mockReturnValue({ toothSelectValue: "tooth-base", toothSelectOptions: [], substrateValue: "natural", substrateOptions: [], substrateRowVisible: true, extractionWoundChecked: false, extractionRowVisible: true, missingClosedChecked: false, missingClosedRowVisible: true, restorationValue: "none|none", restorationOptions: [], restorationRowVisible: true, crownLeakageChecked: false, crownLeakageRowVisible: false, brokenMesialChecked: false, brokenIncisalChecked: false, brokenDistalChecked: false, brokenCrownRowVisible: true, contactMesialChecked: false, contactDistalChecked: false, contactPointRowVisible: true, bruxismRowVisible: true, wearSimple: false, wearEdgeValue: "none", wearEdgeOptions: [], wearEdgeToggleChecked: false, wearCervicalValue: "none", wearCervicalOptions: [], wearCervicalToggleChecked: false, discolorationRowVisible: true, discoSimple: false, discolorationValue: "none", discolorationOptions: [], discolorationToggleChecked: false, crownActionsRowVisible: true, bridgePillarChecked: false, bridgePillarRowVisible: true, extractionPlanChecked: false, extractionPlanRowVisible: true, extractionPlanParent: "crownActionsRow", crownReplaceChecked: false, crownReplaceRowVisible: true, crownNeededChecked: false, crownNeededRowVisible: true }),
  setToothSelectionForSelection: vi.fn(),
  setSubstrateForSelection: vi.fn(),
  setRestorationForSelection: vi.fn(),
  setExtractionWoundForSelection: vi.fn(),
  setExtractionPlanForSelection: vi.fn(),
  setMissingClosedForSelection: vi.fn(),
  setCrownLeakageForSelection: vi.fn(),
  setBrokenMesialForSelection: vi.fn(),
  setBrokenIncisalForSelection: vi.fn(),
  setBrokenDistalForSelection: vi.fn(),
  setContactMesialForSelection: vi.fn(),
  setContactDistalForSelection: vi.fn(),
  setWearEdgeForSelection: vi.fn(),
  setWearCervicalForSelection: vi.fn(),
  setWearEdgeToggleForSelection: vi.fn(),
  setWearCervicalToggleForSelection: vi.fn(),
  setDiscolorationForSelection: vi.fn(),
  setDiscolorationToggleForSelection: vi.fn(),
  setBridgePillarForSelection: vi.fn(),
  setCrownReplaceForSelection: vi.fn(),
  setCrownNeededForSelection: vi.fn(),
  resetTooth: vi.fn(),
  getEdentulous: vi.fn().mockReturnValue(false),
  setEdentulous: vi.fn(),
  resetMouth: vi.fn(),
  applyPrimaryDentition: vi.fn(),
  applyMixedDentition: vi.fn(),
  getStatusExtras: vi.fn().mockReturnValue([]),
  applyStatusExtra: vi.fn(),
  getOrthoApplianceOptions: vi.fn().mockReturnValue([]),
  getOrthoDriftOptions: vi.fn().mockReturnValue([]),
  getOrthoVerticalOptions: vi.fn().mockReturnValue([]),
  setOrthoApplianceForSelection: vi.fn(),
  setOrthoDriftForSelection: vi.fn(),
  setOrthoVerticalForSelection: vi.fn(),
  setOrthoRotationForSelection: vi.fn(),
  rebuildGrid: vi.fn().mockResolvedValue(undefined),
  setNumberingSystem: vi.fn(),
  clearSelection: vi.fn(),
  setOcclusalVisible: vi.fn(),
  setWisdomVisible: vi.fn(),
  setShowBase: vi.fn(),
  setHealthyPulpVisible: vi.fn(),
  registerPlugins: vi.fn(),
  setPluginState: vi.fn(),
  getPluginState: vi.fn(),
  getToothStateSummary: vi.fn().mockReturnValue([]),
  setReadOnly: vi.fn(),
  getReadOnly: vi.fn().mockReturnValue(false),
  setNotesEnabled: vi.fn(),
  getNotesEnabled: vi.fn().mockReturnValue(false),
  setIcdasEnabled: vi.fn(),
  getIcdasEnabled: vi.fn().mockReturnValue(false),
  setPulpDetailLevel: vi.fn(),
  getPulpDetailLevel: vi.fn().mockReturnValue("aae"),
  setSecondaryCariesMode: vi.fn(),
  getSecondaryCariesMode: vi.fn().mockReturnValue("standard"),
  setRootCariesMode: vi.fn(),
  getRootCariesMode: vi.fn().mockReturnValue("simple"),
  setRadiographicDepthMode: vi.fn(),
  getRadiographicDepthMode: vi.fn().mockReturnValue("off"),
  setCariesDepthEnabled: vi.fn(),
  getCariesDepthEnabled: vi.fn().mockReturnValue(true),
  setWearDetailLevel: vi.fn(),
  getWearDetailLevel: vi.fn().mockReturnValue("complex"),
  setDiscolorationDetailLevel: vi.fn(),
  getDiscolorationDetailLevel: vi.fn().mockReturnValue("complex"),
  setSurfaceNotation: vi.fn(),
  getSurfaceNotation: vi.fn().mockReturnValue("full"),
  hasAnyPerioData: vi.fn().mockReturnValue(false),
  getCaseMeta: vi.fn().mockReturnValue({
    age: null, smokingStatus: "unknown", cigarettesPerDay: null,
    diabetesStatus: "unknown", hba1c: null, toothLossPerio: null, maxRblPercent: null,
    diagnosisOverride: null, stageOverride: null, gradeOverride: null, extentOverride: null,
    patientName: null, examDate: null,
  }),
  setPatientName: vi.fn(),
  setExamDate: vi.fn(),
  exportPdf: vi.fn().mockResolvedValue(undefined),
  getOdontogramSummary: vi.fn().mockReturnValue({
    overview: "", permanentList: null, missingList: null,
    sections: [], implants: null, toothTable: { columns: [], rows: [], legend: "" }, periodontalHasFindings: false, periodontalTitle: "", periodontalText: "",
  }),
  onStateChange: vi.fn().mockReturnValue(() => {}),
  openPerioOverlay: vi.fn(),
  closePerioOverlay: vi.fn(),
  isPerioOverlayOpen: vi.fn().mockReturnValue(false),
  getPerioViewMode: vi.fn().mockReturnValue("toggle"),
  getDiagnosisCodingPack: vi.fn().mockReturnValue("none"),
  getSnomedEnabled: vi.fn().mockReturnValue(false),
  getFillingDefectEnabled: vi.fn().mockReturnValue(true),
  setFillingDefectEnabled: vi.fn(),
  getFillingComplexity: vi.fn().mockReturnValue("complex"),
  setFillingComplexity: vi.fn(),
  getFissureSealingEnabled: vi.fn().mockReturnValue(true),
  setFissureSealingEnabled: vi.fn(),
  getFillingMaterialAvailability: vi.fn().mockReturnValue({ amalgam: true, composite: true, gic: true, temporary: true }),
  setFillingMaterialAvailability: vi.fn(),
  setPerioViewMode: vi.fn(),
  setDiagnosisCodingPack: vi.fn(),
  setSnomedEnabled: vi.fn(),
  getToothAnatomy: vi.fn().mockReturnValue("classic"),
  setToothAnatomy: vi.fn(),
  getPerioRowVisibility: vi.fn().mockReturnValue({
    plaque: true, bop: true, cal: true, gm: true, pd: true, furcation: true,
    mobility: true, cej: true, rootConcavity: true, pi: true, gi: true,
    mpi: true, mbi: true, kg: true, gt: true, miller: true,
  }),
  setPerioRowVisibility: vi.fn(),
  getPerioIndexNameMode: vi.fn().mockReturnValue("translated"),
  setPerioIndexNameMode: vi.fn(),
  getPdfSettings: vi.fn().mockReturnValue({ defaultName: "John Doe", defaultDob: "1980-01-01", showAge: true, dateFormat: "iso", colorTheme: "blue", showBone: true, showHealthyPulp: true, toothSpacing: "wide", border: false, borderThickness: "medium", borderColor: "#000000", toothNumberSize: "normal", includeOdontogramText: true, includeOdontogramTable: true, perioToothSpacing: "wide", perioShowEmptyRows: true, perioLabelPlacement: "center", perioFontSize: "normal", includePerioTable: true, includePerioAbbrev: true, showDisclaimer: true, disclaimerText: "", summaryGrouping: "jaw", showGenerator: true }),
  setPdfSettings: vi.fn(),
  isDualStateConfirmPending: vi.fn().mockReturnValue(false),
  acceptDualStateConfirm: vi.fn(),
  cancelDualStateConfirm: vi.fn(),
  exportFhir: vi.fn(),
  exportImage: vi.fn(),
  exportSvg: vi.fn(),
  setImportFormat: vi.fn(),
  getChartMode: vi.fn().mockReturnValue("status"),
  setChartMode: vi.fn(),
  getStatusChart: vi.fn().mockReturnValue({}),
  getPlanChart: vi.fn().mockReturnValue({}),
  setPlanChart: vi.fn(),
  getPlanChanges: vi.fn().mockReturnValue([]),
  exportStatus: vi.fn(),
  importStatus: vi.fn(),
  exportPerioImage: vi.fn().mockResolvedValue(undefined),
  exportPerioSvg: vi.fn().mockResolvedValue(undefined),
}));

const ALL_MATERIALS = { amalgam: true, composite: true, gic: true, temporary: true };

const openFillingsTab = () => {
  fireEvent.click(screen.getByRole("button", { name: /Settings/i }));
  fireEvent.click(screen.getByRole("tab", { name: "Fillings" }));
  return screen.getByRole("tabpanel");
};

describe("Issue #17: fillings settings as controlled props", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    // Restore the default engine-state mocks the shell reads at mount.
    vi.mocked(getFillingDefectEnabled).mockReturnValue(true);
    vi.mocked(getFillingComplexity).mockReturnValue("complex");
    vi.mocked(getFissureSealingEnabled).mockReturnValue(true);
    vi.mocked(getFillingMaterialAvailability).mockReturnValue({ ...ALL_MATERIALS });
  });

  it("restores all four fillings settings from props on mount (engine + modal in sync)", () => {
    render(
      <App
        language="en"
        fillingComplexity="simple"
        fillingDefectEnabled={false}
        fissureSealingEnabled={false}
        fillingMaterialAvailability={{ composite: true, amalgam: false, gic: true, temporary: true }}
      />,
    );
    expect(setFillingComplexity).toHaveBeenCalledWith("simple");
    expect(setFillingDefectEnabled).toHaveBeenCalledWith(false);
    expect(setFissureSealingEnabled).toHaveBeenCalledWith(false);
    expect(setFillingMaterialAvailability).toHaveBeenCalledTimes(4);
    expect(setFillingMaterialAvailability).toHaveBeenCalledWith("amalgam", false);
    expect(setFillingMaterialAvailability).toHaveBeenCalledWith("composite", true);
    expect(setFillingMaterialAvailability).toHaveBeenCalledWith("gic", true);
    expect(setFillingMaterialAvailability).toHaveBeenCalledWith("temporary", true);

    // The Settings -> Fillings tab reflects the restored values, not the
    // library defaults (the desync this issue is about).
    const panel = openFillingsTab();
    expect(within(panel).getByLabelText("Filling complexity") as HTMLSelectElement).toHaveValue("simple");
    expect(within(panel).getByLabelText("Filling defect") as HTMLInputElement).not.toBeChecked();
    expect(within(panel).getByLabelText("Fissure sealing") as HTMLInputElement).not.toBeChecked();
    expect(within(panel).getByLabelText("Amalgam filling") as HTMLInputElement).not.toBeChecked();
    expect(within(panel).getByLabelText("Composite filling") as HTMLInputElement).toBeChecked();
  });

  it("re-syncs engine + modal when a prop changes", () => {
    const { rerender } = render(<App language="en" fillingComplexity="simple" />);
    expect(setFillingComplexity).toHaveBeenCalledWith("simple");
    rerender(<App language="en" fillingComplexity="complex" />);
    expect(setFillingComplexity).toHaveBeenLastCalledWith("complex");
    const panel = openFillingsTab();
    expect(within(panel).getByLabelText("Filling complexity") as HTMLSelectElement).toHaveValue("complex");
  });

  it("an inline-literal material prop does not re-fire the sync effect on identical content", () => {
    const { rerender } = render(<App language="en" fillingMaterialAvailability={{ ...ALL_MATERIALS }} />);
    expect(setFillingMaterialAvailability).toHaveBeenCalledTimes(4);
    // Same content, brand-new object literal -> no additional engine writes.
    rerender(<App language="en" fillingMaterialAvailability={{ ...ALL_MATERIALS }} />);
    expect(setFillingMaterialAvailability).toHaveBeenCalledTimes(4);
    // Content change -> re-sync fires.
    rerender(<App language="en" fillingMaterialAvailability={{ ...ALL_MATERIALS, amalgam: false }} />);
    expect(setFillingMaterialAvailability).toHaveBeenCalledTimes(5);
    expect(setFillingMaterialAvailability).toHaveBeenLastCalledWith("amalgam", false);
  });

  it("standalone mode: omitted props never touch the engine, and the engine value seeds the modal", () => {
    render(<App language="en" />);
    expect(setFillingComplexity).not.toHaveBeenCalled();
    expect(setFillingDefectEnabled).not.toHaveBeenCalled();
    expect(setFissureSealingEnabled).not.toHaveBeenCalled();
    expect(setFillingMaterialAvailability).not.toHaveBeenCalled();
    const panel = openFillingsTab();
    expect(within(panel).getByLabelText("Filling complexity") as HTMLSelectElement).toHaveValue("complex");
    expect(within(panel).getByLabelText("Filling defect") as HTMLInputElement).toBeChecked();
  });

  it("an imperative setX call before mount is not clobbered by a missing prop", () => {
    // Simulate a host calling the imperative setter before mounting; the
    // shell's initializers must pick up the engine value, not the library
    // default, and the mount effects must NOT reset it.
    vi.mocked(getFillingComplexity).mockReturnValue("simple");
    render(<App language="en" />);
    expect(setFillingComplexity).not.toHaveBeenCalled();
    const panel = openFillingsTab();
    expect(within(panel).getByLabelText("Filling complexity") as HTMLSelectElement).toHaveValue("simple");
  });

  it("fires on*Change callbacks from the Settings -> Fillings tab", () => {
    const onFillingComplexityChange = vi.fn();
    const onFillingDefectEnabledChange = vi.fn();
    const onFillingMaterialAvailabilityChange = vi.fn();
    const onFissureSealingEnabledChange = vi.fn();
    render(
      <App
        language="en"
        onFillingComplexityChange={onFillingComplexityChange}
        onFillingDefectEnabledChange={onFillingDefectEnabledChange}
        onFillingMaterialAvailabilityChange={onFillingMaterialAvailabilityChange}
        onFissureSealingEnabledChange={onFissureSealingEnabledChange}
      />,
    );
    const panel = openFillingsTab();

    fireEvent.change(within(panel).getByLabelText("Filling complexity"), { target: { value: "simple" } });
    expect(onFillingComplexityChange).toHaveBeenCalledWith("simple");
    expect(setFillingComplexity).toHaveBeenCalledWith("simple");

    fireEvent.click(within(panel).getByLabelText("Filling defect"));
    expect(onFillingDefectEnabledChange).toHaveBeenCalledWith(false);

    fireEvent.click(within(panel).getByLabelText("Composite filling"));
    expect(onFillingMaterialAvailabilityChange).toHaveBeenCalledWith("composite", false);
    expect(setFillingMaterialAvailability).toHaveBeenCalledWith("composite", false);

    fireEvent.click(within(panel).getByLabelText("Fissure sealing"));
    expect(onFissureSealingEnabledChange).toHaveBeenCalledWith(false);
    expect(setFissureSealingEnabled).toHaveBeenCalledWith(false);
  });

  it("does not fire on*Change callbacks for prop-driven restores", () => {
    const onFillingComplexityChange = vi.fn();
    render(<App language="en" fillingComplexity="simple" onFillingComplexityChange={onFillingComplexityChange} />);
    expect(onFillingComplexityChange).not.toHaveBeenCalled();
  });
});
