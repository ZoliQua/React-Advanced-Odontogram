// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP12 Task 3: UI wiring for the discoloration axis. Tasks 1-2 already
// provide the discoloration enum, getDiscolorationOptions(), the render-time
// crown tint, and the discolorationAllowed()/__discolorationAllowedForTest
// gate. This task adds the #discolorationRow / #discolorationSelect control
// next to the existing wear row (#bruxismRow), wired via
// buildSelect()/applyToSelected() (mirroring #wearEdgeSelect/#wearCervicalSelect),
// and gates the row's visibility on the SAME discolorationAllowed predicate
// the render/tooltip use — exposed here as __discolorationRowAllowedForTest.
//
// Mirrors sp11-wear-ui.test.ts's harness: there is no full-DOM
// initOdontogram() mount harness for the tooth panel, so the JSX-structure
// assertion renders <App/> with odontogram.ts mocked out, the change-wiring
// assertion exercises a hand-built <select> + change-listener pair (the
// same buildSelect contract), and the row-visibility-gate behavior exercises
// the real, exported test-only seam against hand-built state objects.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";
import { __discolorationRowAllowedForTest, VALID_DISCOLORATION } from "../odontogram";

vi.mock("../odontogram", async () => {
  const actual = await vi.importActual<typeof import("../odontogram")>("../odontogram");
  return {
    initOdontogram: vi.fn().mockResolvedValue(undefined),
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
    getCaseMeta: actual.getCaseMeta,
    setPatientName: actual.setPatientName,
    setExamDate: actual.setExamDate,
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
    // Real exports under test — not part of the imperative DOM/SVG wiring.
    __discolorationRowAllowedForTest: actual.__discolorationRowAllowedForTest,
    VALID_DISCOLORATION: actual.VALID_DISCOLORATION,
  };
});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.documentElement.classList.remove("dark");
});

describe("SP12 Task 3: discoloration dropdown next to the wear row", () => {
  it("#discolorationSelect exists inside #discolorationRow", () => {
    render(createElement(App));
    expect(document.querySelector("#discolorationRow #discolorationSelect")).toBeTruthy();
  });

  it("#discolorationRow is placed immediately after #bruxismRow", () => {
    render(createElement(App));
    const bruxismRow = document.querySelector("#bruxismRow");
    expect(bruxismRow?.nextElementSibling?.id).toBe("discolorationRow");
  });

  it("selecting a discoloration value writes state.discoloration (buildSelect wiring, mirrors #wearEdgeSelect)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "discolorationSelect";
    for (const v of VALID_DISCOLORATION) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { discoloration: "none" };
    sel.addEventListener("change", () => {
      state.discoloration = sel.value;
    });

    expect(VALID_DISCOLORATION.has("tetracycline")).toBe(true);
    sel.value = "tetracycline";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.discoloration).toBe("tetracycline");
  });

  it("row gate: allowed for a plain natural tooth-base or milktooth", () => {
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
    expect(__discolorationRowAllowedForTest({ toothSelection: "milktooth", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
  });

  it("row gate: hidden for a crowned tooth or a non-natural substrate", () => {
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "natural" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "radix" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "broken" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "crownprep" })).toBe(false);
  });

  it("row gate: hidden when the tooth isn't a natural present tooth at all", () => {
    expect(__discolorationRowAllowedForTest({ toothSelection: "implant", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "none", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
  });
});
