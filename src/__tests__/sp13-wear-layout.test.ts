// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP13 Task 1: Wear-row layout restructure (the overflow fix).
// #bruxismRow was a no-wrap horizontal .row holding two 220px-min wear
// <select>s, with #extractionPlanRow reparented in as a third child at
// runtime (see odontogram.ts ~2650-2673) — overflowing the panel. This task
// splits the two wear controls onto their own rows inside a vertical
// #bruxismRow (class "wear-stack", not "row"), so the reparented
// #extractionPlanRow lands below them automatically. Pure DOM/CSS — no
// behavior change (the new toggle checkboxes are inert until Task 2).
//
// Mirrors sp11-wear-ui.test.ts / sp12-discoloration-ui.test.ts's harness:
// there is no full-DOM initOdontogram() mount harness for the tooth panel,
// so this is a JSX-structure assertion rendering <App/> with odontogram.ts
// mocked out. The runtime reparent itself lives in odontogram.ts's internal
// (unexported) syncControlsFromState() and can't be invoked directly from a
// mocked-odontogram render; instead we replicate the exact reparent step
// (bruxismRow.appendChild(extractionPlanRow), the same call odontogram.ts
// makes when the wear row is visible) to prove the new column-stack layout
// places the appended row after the two wear rows in DOM order.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";

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

describe("SP13 Task 1: wear controls on separate rows, extraction below (overflow fix)", () => {
  it("#wearEdgeSelect is inside #wearEdgeRow, #wearCervicalSelect is inside #wearCervicalRow (separate rows)", () => {
    render(createElement(App));
    expect(document.querySelector("#wearEdgeRow #wearEdgeSelect")).toBeTruthy();
    expect(document.querySelector("#wearCervicalRow #wearCervicalSelect")).toBeTruthy();
    // They must NOT share a row.
    const edgeRow = document.querySelector("#wearEdgeRow");
    const cervicalRow = document.querySelector("#wearCervicalRow");
    expect(edgeRow).not.toBe(cervicalRow);
    expect(edgeRow?.querySelector("#wearCervicalSelect")).toBeNull();
    expect(cervicalRow?.querySelector("#wearEdgeSelect")).toBeNull();
  });

  it("#wearEdgeRow and #wearCervicalRow are both descendants of #bruxismRow", () => {
    render(createElement(App));
    const bruxismRow = document.querySelector("#bruxismRow");
    expect(bruxismRow?.querySelector("#wearEdgeRow")).toBeTruthy();
    expect(bruxismRow?.querySelector("#wearCervicalRow")).toBeTruthy();
  });

  it("#bruxismRow has class \"wear-stack\" and NOT class \"row\"", () => {
    render(createElement(App));
    const bruxismRow = document.querySelector("#bruxismRow");
    expect(bruxismRow?.classList.contains("wear-stack")).toBe(true);
    expect(bruxismRow?.classList.contains("row")).toBe(false);
  });

  it("after a render with the wear row visible, #extractionPlanRow's parent is #bruxismRow and it comes AFTER #wearCervicalRow in DOM order", () => {
    render(createElement(App));
    const bruxismRow = document.querySelector("#bruxismRow") as HTMLElement;
    const wearCervicalRow = document.querySelector("#wearCervicalRow") as HTMLElement;
    const extractionPlanRow = document.querySelector("#extractionPlanRow") as HTMLElement;
    expect(bruxismRow).toBeTruthy();
    expect(wearCervicalRow).toBeTruthy();
    expect(extractionPlanRow).toBeTruthy();

    // The wear row is visible by default (no "hidden" class in the static
    // JSX), matching the state odontogram.ts's runtime gate would leave it
    // in for a selected natural tooth-base tooth. Replicate the exact
    // reparent call odontogram.ts makes in that branch (~2662-2663):
    //   bruxismRow.appendChild(extractionPlanRow)
    expect(bruxismRow.classList.contains("hidden")).toBe(false);
    bruxismRow.appendChild(extractionPlanRow);

    expect(extractionPlanRow.parentElement).toBe(bruxismRow);
    const position = wearCervicalRow.compareDocumentPosition(extractionPlanRow);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("#wearEdgeToggle / #wearCervicalToggle / #discolorationToggle exist and are type=checkbox", () => {
    render(createElement(App));
    const edgeToggle = document.querySelector("#wearEdgeToggle") as HTMLInputElement | null;
    const cervicalToggle = document.querySelector("#wearCervicalToggle") as HTMLInputElement | null;
    const discolorationToggle = document.querySelector("#discolorationToggle") as HTMLInputElement | null;
    expect(edgeToggle).toBeTruthy();
    expect(cervicalToggle).toBeTruthy();
    expect(discolorationToggle).toBeTruthy();
    expect(edgeToggle?.type).toBe("checkbox");
    expect(cervicalToggle?.type).toBe("checkbox");
    expect(discolorationToggle?.type).toBe("checkbox");
  });

  it("the toggle-labels start hidden (default complex mode unchanged)", () => {
    render(createElement(App));
    expect(document.querySelector("#wearEdgeToggleLabel")?.classList.contains("hidden")).toBe(true);
    expect(document.querySelector("#wearCervicalToggleLabel")?.classList.contains("hidden")).toBe(true);
    expect(document.querySelector("#discolorationToggleLabel")?.classList.contains("hidden")).toBe(true);
  });
});
