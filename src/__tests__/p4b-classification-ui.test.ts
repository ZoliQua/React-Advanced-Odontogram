// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// P4b Task 4: the periodontal classification UI panel (Dental Chart) — the
// 2017 World Workshop diagnosis/stage/grade/extent classification, extending
// the P4a case-metadata panel (`src/PerioChart.tsx`) with a block that shows,
// per axis, the DERIVED value (`getPerioClassification().derived`) and an
// override <select> wired to the matching T2 setter
// (setDiagnosisOverride/setStageOverride/setGradeOverride/setExtentOverride).
//
// Same harness as p4a-case-panel.test.ts: <App/> mounted with the heavy
// engine lifecycle mocked out, the full P1/P2/PG-*/P4a perio data-core
// surface + the new classification getter/setters forwarded from the REAL
// module so the panel's mount + edits exercise actual production wiring.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import App from "../App";
import {
  getCaseMeta,
  resetCaseMeta,
  getPerioClassification,
  setPerioSite,
  __resetChartStateForTest,
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
    // P4b Task 4: classification panel — real getter + the 4 override setters
    // so mounting + driving the panel exercises actual production wiring.
    getPerioClassification: actual.getPerioClassification,
    setDiagnosisOverride: actual.setDiagnosisOverride,
    setStageOverride: actual.setStageOverride,
    setGradeOverride: actual.setGradeOverride,
    setExtentOverride: actual.setExtentOverride,
    // Test-only reset seam (already used by other App-mount test files) —
    // this file additionally charts real perio data (setPerioSite) in one
    // test, so it needs a full state reset between tests, not just
    // resetCaseMeta().
    __resetChartStateForTest: actual.__resetChartStateForTest,
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
  __resetChartStateForTest();
});

describe("P4b Task 4: classification block renders in the Dental Chart", () => {
  it("renders the 4 axis override selects + derived-value displays", async () => {
    await openDentalChart();
    expect(document.getElementById("perioClassDiagnosisDerived")).toBeTruthy();
    expect(document.getElementById("perioClassDiagnosisOverride")).toBeTruthy();
    expect(document.getElementById("perioClassStageDerived")).toBeTruthy();
    expect(document.getElementById("perioClassStageOverride")).toBeTruthy();
    expect(document.getElementById("perioClassGradeDerived")).toBeTruthy();
    expect(document.getElementById("perioClassGradeOverride")).toBeTruthy();
    expect(document.getElementById("perioClassExtentDerived")).toBeTruthy();
    expect(document.getElementById("perioClassExtentOverride")).toBeTruthy();
  });

  it("shows the derived values for an untouched (healthy) case", async () => {
    await openDentalChart();
    const derived = getPerioClassification().derived;
    expect((document.getElementById("perioClassDiagnosisDerived")!.textContent || "").toLowerCase()).toContain(derived.diagnosis);
    expect(document.getElementById("perioClassStageDerived")).toBeTruthy();
    expect(document.getElementById("perioClassGradeDerived")).toBeTruthy();
    expect(document.getElementById("perioClassExtentDerived")).toBeTruthy();
  });

  it("indeterminate/na derived values are shown as such, not blank", async () => {
    await openDentalChart();
    // Untouched case: diagnosis derives to "health", which forces stage AND
    // extent to the non-authorable "na" placeholder (derivePerioClassification's
    // entry point only computes a real stage/extent once diagnosis is
    // "periodontitis"); grade is computed independent of diagnosis and reads
    // "indeterminate" (no age/RBL/smoking/diabetes charted yet).
    const derived = getPerioClassification().derived;
    expect(derived.stage).toBe("na");
    expect(derived.grade).toBe("indeterminate");
    expect(derived.extent).toBe("na");
    const stageText = document.getElementById("perioClassStageDerived")!.textContent || "";
    const gradeText = document.getElementById("perioClassGradeDerived")!.textContent || "";
    const extentText = document.getElementById("perioClassExtentDerived")!.textContent || "";
    expect(stageText.trim().length).toBeGreaterThan(0);
    expect(gradeText.trim().length).toBeGreaterThan(0);
    expect(extentText.trim().length).toBeGreaterThan(0);
    expect(stageText).not.toContain("perio.class."); // must be a resolved label, not a raw i18n key
    expect(gradeText).not.toContain("perio.class.");
    expect(extentText).not.toContain("perio.class.");
  });
});

describe("P4b Task 4: each override select calls its OWN setter (no cross-wiring)", () => {
  it("diagnosis select calls setDiagnosisOverride only", async () => {
    await openDentalChart();
    const select = document.getElementById("perioClassDiagnosisOverride") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "periodontitis" } });
    const c = getPerioClassification();
    expect(c.diagnosis).toBe("periodontitis");
    expect(c.overridden).toEqual({ diagnosis: true, stage: false, grade: false, extent: false });
  });

  it("stage select calls setStageOverride only", async () => {
    await openDentalChart();
    const select = document.getElementById("perioClassStageOverride") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "III" } });
    const c = getPerioClassification();
    expect(c.stage).toBe("III");
    expect(c.overridden).toEqual({ diagnosis: false, stage: true, grade: false, extent: false });
  });

  it("grade select calls setGradeOverride only", async () => {
    await openDentalChart();
    const select = document.getElementById("perioClassGradeOverride") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "B" } });
    const c = getPerioClassification();
    expect(c.grade).toBe("B");
    expect(c.overridden).toEqual({ diagnosis: false, stage: false, grade: true, extent: false });
  });

  it("extent select calls setExtentOverride only", async () => {
    await openDentalChart();
    const select = document.getElementById("perioClassExtentOverride") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "generalized" } });
    const c = getPerioClassification();
    expect(c.extent).toBe("generalized");
    expect(c.overridden).toEqual({ diagnosis: false, stage: false, grade: false, extent: true });
  });

  it("picking the first '(use derived)' option clears the override back to null", async () => {
    await openDentalChart();
    const select = document.getElementById("perioClassStageOverride") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "III" } });
    expect(getPerioClassification().overridden.stage).toBe(true);
    fireEvent.change(select, { target: { value: "" } });
    expect(getPerioClassification().overridden.stage).toBe(false);
    expect(getCaseMeta().stageOverride).toBeNull();
  });
});

describe("P4b Task 4: panel re-reads getPerioClassification() on notifyStateChange", () => {
  it("charting perio data (via another API call) refreshes the derived-value display", async () => {
    await openDentalChart();
    // Two non-adjacent present teeth with interdental CAL >= 1mm qualifies
    // the 2017 periodontitis primary case definition — same shape T2/T3's
    // own tests use to reach a non-health derived diagnosis.
    act(() => {
      setPerioSite(16, "MB", { pd: 3, gm: 2 }); // CAL 5
      setPerioSite(36, "MB", { pd: 3, gm: 2 }); // CAL 5, non-adjacent arch
    });
    const derived = getPerioClassification().derived;
    expect(derived.diagnosis).toBe("periodontitis");
    const text = document.getElementById("perioClassDiagnosisDerived")!.textContent || "";
    expect(text.toLowerCase()).toContain(derived.diagnosis);
  });
});

describe("P4b Task 4: i18n keys resolve", () => {
  it("classification block labels are not raw i18n keys", async () => {
    await openDentalChart();
    const panel = document.getElementById("caseMetaPanel")!;
    const text = panel.textContent || "";
    expect(text).not.toContain("perio.class.title");
    expect(text).not.toContain("perio.class.diagnosis");
    expect(text).not.toContain("perio.class.stage");
    expect(text).not.toContain("perio.class.grade");
    expect(text).not.toContain("perio.class.extent");
    expect(text).not.toContain("perio.class.useDerived");
  });
});
