// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// P4a Task 2: the case-metadata UI panel in the Dental Chart view.
// Task 1 (committed) shipped the data layer only — getCaseMeta() + setters
// (setCaseAge/setSmokingStatus/setCigarettesPerDay/setDiabetesStatus/setHba1c/
// setToothLossPerio/setMaxRblPercent) + resetCaseMeta, no UI. This task wires
// a collapsible case/patient-context panel into the Dental Chart (inline)
// view in `src/PerioChart.tsx`.
//
// Same harness as perio-graphical-presentation.test.ts: <App/> mounted with
// the heavy engine lifecycle mocked out, the full P1/P2/PG-* perio data-core
// surface + the new case-meta getters/setters forwarded from the REAL module
// so the panel's mount + edits exercise actual production wiring.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import App from "../App";
import {
  getCaseMeta,
  resetCaseMeta,
  closePerioOverlay,
  setPerioViewMode,
} from "../odontogram";

vi.mock("../odontogram", async () => {
  const actual = await vi.importActual<typeof import("../odontogram")>("../odontogram");
  return {
    // DX-2 Task 4: DiagnosesCard (mounted unconditionally as part of ToothControlsSurface) reads/writes these.
    getActiveDiagnoses: actual.getActiveDiagnoses,
    setDxOverrideForSelection: actual.setDxOverrideForSelection,
    initOdontogram: vi.fn().mockImplementation(() => {
      const grid = document.getElementById("toothGrid");
      if (grid && !grid.querySelector('[data-fake-tooth-svg]')) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("data-fake-tooth-svg", "11");
        grid.appendChild(svg);
      }
      return Promise.resolve(undefined);
    }),
    destroyOdontogram: vi.fn(),
    rewireControls: vi.fn(),
    // Composable-UI Tier 3: OrthodonticsCard reads these engine exports.
    getActiveOrtho: actual.getActiveOrtho,
    getActiveCaries: actual.getActiveCaries,
    getCariesDepthOptions: actual.getCariesDepthOptions,
    rootCariesOptions: actual.rootCariesOptions,
    setCariesSurfaceForSelection: actual.setCariesSurfaceForSelection,
    setCariesActiveDepthForSelection: actual.setCariesActiveDepthForSelection,
    setRootCariesForSelection: actual.setRootCariesForSelection,
    openCariesDepthPopup: actual.openCariesDepthPopup,
    getActiveFillings: actual.getActiveFillings,
    setFillingMaterialForSelection: actual.setFillingMaterialForSelection,
    setFillingSurfaceForSelection: actual.setFillingSurfaceForSelection,
    setFillingSimpleToggleForSelection: actual.setFillingSimpleToggleForSelection,
    setFillingSimpleDefectForSelection: actual.setFillingSimpleDefectForSelection,
    setFissureSealingForSelection: actual.setFissureSealingForSelection,
    openFillingDefectPopup: actual.openFillingDefectPopup,
    getActiveRootPerio: actual.getActiveRootPerio,
    setPulpEndoForSelection: actual.setPulpEndoForSelection,
    setApicalDxForSelection: actual.setApicalDxForSelection,
    setPeriapicalTypeForSelection: actual.setPeriapicalTypeForSelection,
    setResorptionForSelection: actual.setResorptionForSelection,
    setEndoResectionForSelection: actual.setEndoResectionForSelection,
    setParapulpalPinForSelection: actual.setParapulpalPinForSelection,
    setMobilityForSelection: actual.setMobilityForSelection,
    setModForSelection: actual.setModForSelection,
    setCalculusForSelection: actual.setCalculusForSelection,
    setPeriImplantForSelection: actual.setPeriImplantForSelection,
    getActiveToothDetails: actual.getActiveToothDetails,
    setToothSelectionForSelection: actual.setToothSelectionForSelection,
    setSubstrateForSelection: actual.setSubstrateForSelection,
    setRestorationForSelection: actual.setRestorationForSelection,
    setExtractionWoundForSelection: actual.setExtractionWoundForSelection,
    setExtractionPlanForSelection: actual.setExtractionPlanForSelection,
    setMissingClosedForSelection: actual.setMissingClosedForSelection,
    setCrownLeakageForSelection: actual.setCrownLeakageForSelection,
    setBrokenMesialForSelection: actual.setBrokenMesialForSelection,
    setBrokenIncisalForSelection: actual.setBrokenIncisalForSelection,
    setBrokenDistalForSelection: actual.setBrokenDistalForSelection,
    setContactMesialForSelection: actual.setContactMesialForSelection,
    setContactDistalForSelection: actual.setContactDistalForSelection,
    setWearEdgeForSelection: actual.setWearEdgeForSelection,
    setWearCervicalForSelection: actual.setWearCervicalForSelection,
    setWearEdgeToggleForSelection: actual.setWearEdgeToggleForSelection,
    setWearCervicalToggleForSelection: actual.setWearCervicalToggleForSelection,
    setDiscolorationForSelection: actual.setDiscolorationForSelection,
    setDiscolorationToggleForSelection: actual.setDiscolorationToggleForSelection,
    setBridgePillarForSelection: actual.setBridgePillarForSelection,
    setCrownReplaceForSelection: actual.setCrownReplaceForSelection,
    setCrownNeededForSelection: actual.setCrownNeededForSelection,
    resetTooth: actual.resetTooth,
    getEdentulous: actual.getEdentulous,
    setEdentulous: actual.setEdentulous,
    resetMouth: actual.resetMouth,
    applyPrimaryDentition: actual.applyPrimaryDentition,
    applyMixedDentition: actual.applyMixedDentition,
    getStatusExtras: actual.getStatusExtras,
    applyStatusExtra: actual.applyStatusExtra,
    getOrthoApplianceOptions: actual.getOrthoApplianceOptions,
    getOrthoDriftOptions: actual.getOrthoDriftOptions,
    getOrthoVerticalOptions: actual.getOrthoVerticalOptions,
    setOrthoApplianceForSelection: actual.setOrthoApplianceForSelection,
    setOrthoDriftForSelection: actual.setOrthoDriftForSelection,
    setOrthoVerticalForSelection: actual.setOrthoVerticalForSelection,
    setOrthoRotationForSelection: actual.setOrthoRotationForSelection,
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
    setPatientName: actual.setPatientName,
    setExamDate: actual.setExamDate,
    exportPdf: vi.fn().mockResolvedValue(undefined),
    getOdontogramSummary: vi.fn().mockReturnValue({
      overview: "", permanentList: null, missingList: null,
      sections: [], implants: null, toothTable: { columns: [], rows: [], legend: "" }, periodontalHasFindings: false, periodontalTitle: "", periodontalText: "",
    }),
    exportFhir: vi.fn(),
    exportImage: vi.fn(),
    exportSvg: vi.fn(),
    setImportFormat: vi.fn(),
    // Real exports under test — not part of the imperative DOM/SVG wiring.
    onStateChange: actual.onStateChange,
    openPerioOverlay: actual.openPerioOverlay,
    closePerioOverlay: actual.closePerioOverlay,
    isPerioOverlayOpen: actual.isPerioOverlayOpen,
    getPerioViewMode: actual.getPerioViewMode,
    getDiagnosisCodingPack: actual.getDiagnosisCodingPack,
    getSnomedEnabled: actual.getSnomedEnabled,
    getFillingDefectEnabled: actual.getFillingDefectEnabled,
    setFillingDefectEnabled: actual.setFillingDefectEnabled,
    getFillingComplexity: actual.getFillingComplexity,
    setFillingComplexity: actual.setFillingComplexity,
    getFissureSealingEnabled: actual.getFissureSealingEnabled,
    setFissureSealingEnabled: actual.setFissureSealingEnabled,
    getFillingMaterialAvailability: actual.getFillingMaterialAvailability,
    setFillingMaterialAvailability: actual.setFillingMaterialAvailability,
    setPerioViewMode: actual.setPerioViewMode,
    setDiagnosisCodingPack: actual.setDiagnosisCodingPack,
    setSnomedEnabled: actual.setSnomedEnabled,
    getToothAnatomy: vi.fn().mockReturnValue("classic"),
    getScreenToothSpacing: vi.fn().mockReturnValue("normal"),
    setScreenToothSpacing: vi.fn(),
    getScreenToothNumberSize: vi.fn().mockReturnValue("normal"),
    setScreenToothNumberSize: vi.fn(),
    getSelectionColor: vi.fn().mockReturnValue("#3b7bff"),
    setSelectionColor: vi.fn(),
    getSelectionBorderStyle: vi.fn().mockReturnValue("dashed"),
    setSelectionBorderStyle: vi.fn(),
    getToothInfoVisible: vi.fn().mockReturnValue(true),
    setToothInfoVisible: vi.fn(),
    setToothAnatomy: vi.fn(),
    getPerioRowVisibility: actual.getPerioRowVisibility,
    setPerioRowVisibility: actual.setPerioRowVisibility,
    getPerioIndexNameMode: actual.getPerioIndexNameMode,
    setPerioIndexNameMode: actual.setPerioIndexNameMode,
    getPdfSettings: actual.getPdfSettings,
    setPdfSettings: actual.setPdfSettings,
    getPerioOverlayLayer: actual.getPerioOverlayLayer,
    setPerioOverlayLayer: actual.setPerioOverlayLayer,
    isDualStateConfirmPending: actual.isDualStateConfirmPending,
    acceptDualStateConfirm: actual.acceptDualStateConfirm,
    cancelDualStateConfirm: actual.cancelDualStateConfirm,
    // The full P1/P2 perio data-core surface <PerioChart/> needs to build its
    // grid + summary bar (same list as perio-graphical-presentation.test.ts).
    PERIO_SITES: actual.PERIO_SITES,
    isUpperTooth: actual.isUpperTooth,
    formatToothLabel: actual.formatToothLabel,
    getPerioChart: actual.getPerioChart,
    getToothPerio: actual.getToothPerio,
    getToothCal: actual.getToothCal,
    getPerioSummary: actual.getPerioSummary,
    setPerioSite: actual.setPerioSite,
    getToothMobility: actual.getToothMobility,
    setToothMobility: actual.setToothMobility,
    furcationEntrances: actual.furcationEntrances,
    getToothFurcation: actual.getToothFurcation,
    setFurcation: actual.setFurcation,
    getToothPlaque: actual.getToothPlaque,
    setPlaque: actual.setPlaque,
    isPerioRowHidden: actual.isPerioRowHidden,
    getToothRecessionType: actual.getToothRecessionType,
    getCejVisibility: actual.getCejVisibility,
    setCejVisibility: actual.setCejVisibility,
    getRootConcavity: actual.getRootConcavity,
    setRootConcavity: actual.setRootConcavity,
    nextPerioCell: actual.nextPerioCell,
    prevPerioCell: actual.prevPerioCell,
    getPlaqueIndex: actual.getPlaqueIndex,
    setPlaqueIndex: actual.setPlaqueIndex,
    getGingivalIndex: actual.getGingivalIndex,
    setGingivalIndex: actual.setGingivalIndex,
    getKeratinizedWidth: actual.getKeratinizedWidth,
    setKeratinizedWidth: actual.setKeratinizedWidth,
    getGingivalThickness: actual.getGingivalThickness,
    setGingivalThickness: actual.setGingivalThickness,
    getMillerClass: actual.getMillerClass,
    setMillerClass: actual.setMillerClass,
    isToothImplant: actual.isToothImplant,
    getPeriImplantPlaque: actual.getPeriImplantPlaque,
    setPeriImplantPlaque: actual.setPeriImplantPlaque,
    getPeriImplantBleeding: actual.getPeriImplantBleeding,
    setPeriImplantBleeding: actual.setPeriImplantBleeding,
    // P4a Task 2: case-metadata panel — real getters/setters so mounting +
    // driving the panel exercises the actual production wiring.
    getCaseMeta: actual.getCaseMeta,
    setCaseAge: actual.setCaseAge,
    setSmokingStatus: actual.setSmokingStatus,
    setCigarettesPerDay: actual.setCigarettesPerDay,
    setDiabetesStatus: actual.setDiabetesStatus,
    setHba1c: actual.setHba1c,
    setToothLossPerio: actual.setToothLossPerio,
    setMaxRblPercent: actual.setMaxRblPercent,
    resetCaseMeta: actual.resetCaseMeta,
    // DX-3b Task 5: Case/regional diagnoses picker — <PerioSidebar/> reads/
    // writes these unconditionally on every mount.
    getCaseConditions: actual.getCaseConditions,
    setCaseCondition: actual.setCaseCondition,
    // P4b Task 4: classification panel — <PerioChart/> now reads the final
    // classification + writes the 4 per-axis overrides at mount/render
    // (the classification block extends this same case-metadata panel).
    getPerioClassification: actual.getPerioClassification,
    setDiagnosisOverride: actual.setDiagnosisOverride,
    setStageOverride: actual.setStageOverride,
    setGradeOverride: actual.setGradeOverride,
    setExtentOverride: actual.setExtentOverride,
  };
});

async function openDentalChart() {
  render(createElement(App));
  await Promise.resolve();
  fireEvent.click(document.getElementById("appViewDentalChart")!);
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.clearAllMocks();
  document.documentElement.classList.remove("dark");
  closePerioOverlay();
  setPerioViewMode("toggle");
  resetCaseMeta();
});

describe("P4a Task 2: case-metadata panel renders in the Dental Chart", () => {
  it("renders the panel title", async () => {
    await openDentalChart();
    expect(document.getElementById("caseMetaPanel")).toBeTruthy();
  });

  it("renders all 7 controls", async () => {
    await openDentalChart();
    expect(document.getElementById("caseMetaAge")).toBeTruthy();
    expect(document.getElementById("caseMetaSmoking")).toBeTruthy();
    expect(document.getElementById("caseMetaCigarettesPerDay")).toBeTruthy();
    expect(document.getElementById("caseMetaDiabetes")).toBeTruthy();
    expect(document.getElementById("caseMetaHba1c")).toBeTruthy();
    expect(document.getElementById("caseMetaRbl")).toBeTruthy();
    expect(document.getElementById("caseMetaToothLoss")).toBeTruthy();
  });
});

describe("P4a Task 2: each control calls its setter", () => {
  it("age input calls setCaseAge", async () => {
    await openDentalChart();
    const input = document.getElementById("caseMetaAge") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "54" } });
    expect(getCaseMeta().age).toBe(54);
  });

  it("smoking select calls setSmokingStatus", async () => {
    await openDentalChart();
    const select = document.getElementById("caseMetaSmoking") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "current" } });
    expect(getCaseMeta().smokingStatus).toBe("current");
  });

  it("cigarettes/day input calls setCigarettesPerDay (once smoking=current)", async () => {
    await openDentalChart();
    const select = document.getElementById("caseMetaSmoking") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "current" } });
    const cigs = document.getElementById("caseMetaCigarettesPerDay") as HTMLInputElement;
    fireEvent.change(cigs, { target: { value: "12" } });
    expect(getCaseMeta().cigarettesPerDay).toBe(12);
  });

  it("diabetes select calls setDiabetesStatus", async () => {
    await openDentalChart();
    const select = document.getElementById("caseMetaDiabetes") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "present" } });
    expect(getCaseMeta().diabetesStatus).toBe("present");
  });

  it("HbA1c input calls setHba1c (once diabetes=present)", async () => {
    await openDentalChart();
    const select = document.getElementById("caseMetaDiabetes") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "present" } });
    const hba1c = document.getElementById("caseMetaHba1c") as HTMLInputElement;
    fireEvent.change(hba1c, { target: { value: "7.8" } });
    expect(getCaseMeta().hba1c).toBe(7.8);
  });

  it("RBL % input calls setMaxRblPercent", async () => {
    await openDentalChart();
    const input = document.getElementById("caseMetaRbl") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "45" } });
    expect(getCaseMeta().maxRblPercent).toBe(45);
  });

  it("tooth-loss input calls setToothLossPerio", async () => {
    await openDentalChart();
    const input = document.getElementById("caseMetaToothLoss") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "3" } });
    expect(getCaseMeta().toothLossPerio).toBe(3);
  });

  it("clearing the age input (empty string) sets it back to null", async () => {
    await openDentalChart();
    const input = document.getElementById("caseMetaAge") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "54" } });
    expect(getCaseMeta().age).toBe(54);
    fireEvent.change(input, { target: { value: "" } });
    expect(getCaseMeta().age).toBeNull();
  });
});

describe("P4a Task 2: conditional fields", () => {
  it("cigarettes/day is disabled unless smoking = current", async () => {
    await openDentalChart();
    const cigs = document.getElementById("caseMetaCigarettesPerDay") as HTMLInputElement;
    expect(cigs.disabled).toBe(true);
    const select = document.getElementById("caseMetaSmoking") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "current" } });
    expect((document.getElementById("caseMetaCigarettesPerDay") as HTMLInputElement).disabled).toBe(false);
    fireEvent.change(select, { target: { value: "former" } });
    expect((document.getElementById("caseMetaCigarettesPerDay") as HTMLInputElement).disabled).toBe(true);
  });

  it("HbA1c is disabled unless diabetes = present", async () => {
    await openDentalChart();
    const hba1c = document.getElementById("caseMetaHba1c") as HTMLInputElement;
    expect(hba1c.disabled).toBe(true);
    const select = document.getElementById("caseMetaDiabetes") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "present" } });
    expect((document.getElementById("caseMetaHba1c") as HTMLInputElement).disabled).toBe(false);
    fireEvent.change(select, { target: { value: "none" } });
    expect((document.getElementById("caseMetaHba1c") as HTMLInputElement).disabled).toBe(true);
  });
});

describe("P4a Task 2: i18n keys resolve", () => {
  it("panel title + control labels are not raw i18n keys", async () => {
    await openDentalChart();
    const panel = document.getElementById("caseMetaPanel")!;
    const text = panel.textContent || "";
    expect(text).not.toContain("case.panelTitle");
    expect(text).not.toContain("case.age");
    expect(text).not.toContain("case.smoking.label");
    expect(text).not.toContain("case.diabetes.label");
    expect(text).not.toContain("case.hba1c");
    expect(text).not.toContain("case.rbl");
    expect(text).not.toContain("case.toothLoss");
  });
});
