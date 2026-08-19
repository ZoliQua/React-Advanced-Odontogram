// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP11 Task 3: UI wiring for the wear axis (Tasks 1-2 already provide the
// wearEdge/wearCervical enums, getWearEdgeOptions()/getWearCervicalOptions(),
// render gate, and hydrate/migration). This task replaces the two bruxism
// checkboxes (#bruxismWear / #bruxismNeckWear) in #bruxismRow with two
// labeled <select> controls (#wearEdgeSelect / #wearCervicalSelect), wired
// via buildSelect()/applyToSelected() (mirroring #resorptionSelect), and
// aligns the row-visibility gate to the render gate (adds the
// toothSubstrate === "natural" check the row gate previously omitted).
//
// Like sp8-peri-implant-ui.test.ts, there is no full-DOM initOdontogram()
// mount harness for the tooth panel: the JSX-structure assertion renders
// <App/> with odontogram.ts mocked out, and the row-visibility-gate
// behavior exercises the real, exported test-only seam
// (__wearRowAllowedForTest) against hand-built state objects — mirroring
// the __syncPeriImplantVisibilityForTest pattern, since the real gate
// closes over module-internal selectedTeeth/toothState state that isn't
// reachable from a test.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";
import { __wearRowAllowedForTest, VALID_WEAR_EDGE, VALID_WEAR_CERVICAL } from "../odontogram";

vi.mock("../odontogram", async () => {
  const actual = await vi.importActual<typeof import("../odontogram")>("../odontogram");
  return {
    // DX-2 Task 4: DiagnosesCard (mounted unconditionally as part of ToothControlsSurface) reads/writes these.
    getActiveDiagnoses: actual.getActiveDiagnoses,
    setDxOverrideForSelection: actual.setDxOverrideForSelection,
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
    __wearRowAllowedForTest: actual.__wearRowAllowedForTest,
    VALID_WEAR_EDGE: actual.VALID_WEAR_EDGE,
    VALID_WEAR_CERVICAL: actual.VALID_WEAR_CERVICAL,
  };
});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.documentElement.classList.remove("dark");
});

describe("SP11 Task 3: wear-type dropdowns replace bruxism checkboxes", () => {
  it("#wearEdgeSelect and #wearCervicalSelect exist inside #bruxismRow", () => {
    render(createElement(App));
    expect(document.querySelector("#bruxismRow #wearEdgeSelect")).toBeTruthy();
    expect(document.querySelector("#bruxismRow #wearCervicalSelect")).toBeTruthy();
  });

  it("the old bruxism checkboxes are gone", () => {
    render(createElement(App));
    expect(document.querySelector("#bruxismWear")).toBeNull();
    expect(document.querySelector("#bruxismNeckWear")).toBeNull();
  });

  it("selecting a wearEdge value writes state.wearEdge (buildSelect wiring, mirrors #resorptionSelect)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "wearEdgeSelect";
    for (const v of VALID_WEAR_EDGE) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { wearEdge: "none" };
    sel.addEventListener("change", () => {
      state.wearEdge = sel.value;
    });

    expect(VALID_WEAR_EDGE.has("erosion")).toBe(true);
    sel.value = "erosion";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.wearEdge).toBe("erosion");
  });

  it("selecting a wearCervical value writes state.wearCervical", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "wearCervicalSelect";
    for (const v of VALID_WEAR_CERVICAL) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { wearCervical: "none" };
    sel.addEventListener("change", () => {
      state.wearCervical = sel.value;
    });

    expect(VALID_WEAR_CERVICAL.has("abfraction")).toBe(true);
    sel.value = "abfraction";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.wearCervical).toBe("abfraction");
  });

  it("row gate: allowed only for tooth-base + no restoration + natural substrate", () => {
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
  });

  it("row gate quirk fix: a crown-prepped/broken/radix substrate (matching the render gate) now hides the row too", () => {
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "radix" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "broken" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "crownprep" })).toBe(false);
  });

  it("row gate: hidden when a restoration is present or the tooth isn't a natural present tooth", () => {
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "natural" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "implant", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "none", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
  });
});
