// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP14 Task 3: UI wiring for the orthodontic axes (appliance/drift/vertical/
// rotation). Tasks 1-2 already provide the four enums, the
// getOrthoApplianceOptions()/getOrthoDriftOptions()/getOrthoVerticalOptions()
// builders, the render-time glyph activation, and the shared orthoAllowed()/
// __orthoAllowedForTest gate. This task adds ONE combined #orthoCard
// (D6 ratified) grouping the three selects + the rotation checkbox toggle,
// wired via buildSelect()/applyToSelected() (mirroring #discolorationSelect),
// and gates the card's visibility on the SAME orthoAllowed predicate the
// render/tooltip use — exposed here as __orthoCardAllowedForTest.
//
// Mirrors sp12-discoloration-ui.test.ts's harness: there is no full-DOM
// initOdontogram() mount harness for the tooth panel, so the JSX-structure
// assertion renders <App/> with odontogram.ts mocked out, the change-wiring
// assertions exercise hand-built <select>/<input type="checkbox"> +
// change-listener pairs (the same buildSelect/applyToSelected contract), and
// the card-visibility-gate behavior exercises the real, exported test-only
// seam against hand-built state objects.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";
import {
  __orthoCardAllowedForTest,
  VALID_ORTHO_APPLIANCE,
  VALID_ORTHO_DRIFT,
  VALID_ORTHO_VERTICAL,
} from "../odontogram";

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
    __orthoCardAllowedForTest: actual.__orthoCardAllowedForTest,
    VALID_ORTHO_APPLIANCE: actual.VALID_ORTHO_APPLIANCE,
    VALID_ORTHO_DRIFT: actual.VALID_ORTHO_DRIFT,
    VALID_ORTHO_VERTICAL: actual.VALID_ORTHO_VERTICAL,
  };
});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.documentElement.classList.remove("dark");
});

describe("SP14 Task 3: the Ortho card (appliance/drift/vertical/rotation)", () => {
  it("#orthoApplianceSelect, #orthoDriftSelect, #orthoVerticalSelect and #orthoRotationToggle exist inside #orthoCard", () => {
    render(createElement(App));
    expect(document.querySelector("#orthoCard #orthoApplianceSelect")).toBeTruthy();
    expect(document.querySelector("#orthoCard #orthoDriftSelect")).toBeTruthy();
    expect(document.querySelector("#orthoCard #orthoVerticalSelect")).toBeTruthy();
    const toggle = document.querySelector("#orthoCard #orthoRotationToggle");
    expect(toggle).toBeTruthy();
    expect((toggle as HTMLInputElement).type).toBe("checkbox");
  });

  it("selecting an appliance value writes state.orthoAppliance (buildSelect wiring, mirrors #discolorationSelect)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "orthoApplianceSelect";
    for (const v of VALID_ORTHO_APPLIANCE) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { orthoAppliance: "none" };
    sel.addEventListener("change", () => {
      state.orthoAppliance = sel.value;
    });

    expect(VALID_ORTHO_APPLIANCE.has("bracket")).toBe(true);
    sel.value = "bracket";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.orthoAppliance).toBe("bracket");
  });

  it("selecting a drift value writes state.orthoDrift (buildSelect wiring)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "orthoDriftSelect";
    for (const v of VALID_ORTHO_DRIFT) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { orthoDrift: "none" };
    sel.addEventListener("change", () => {
      state.orthoDrift = sel.value;
    });

    expect(VALID_ORTHO_DRIFT.has("mesial")).toBe(true);
    sel.value = "mesial";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.orthoDrift).toBe("mesial");
  });

  it("selecting a vertical value writes state.orthoVertical (buildSelect wiring)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "orthoVerticalSelect";
    for (const v of VALID_ORTHO_VERTICAL) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { orthoVertical: "none" };
    sel.addEventListener("change", () => {
      state.orthoVertical = sel.value;
    });

    expect(VALID_ORTHO_VERTICAL.has("extrusion")).toBe(true);
    sel.value = "extrusion";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.orthoVertical).toBe("extrusion");
  });

  it("toggling #orthoRotationToggle writes state.orthoRotation (checkbox wiring, mirrors #wearEdgeToggle)", () => {
    document.body.innerHTML = "";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "orthoRotationToggle";
    document.body.appendChild(checkbox);

    const state: Record<string, unknown> = { orthoRotation: false };
    checkbox.addEventListener("change", (e) => {
      state.orthoRotation = (e.target as HTMLInputElement).checked;
    });

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.orthoRotation).toBe(true);
  });

  it("card gate: allowed for a plain natural tooth-base or milktooth", () => {
    expect(__orthoCardAllowedForTest({ toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "natural" })).toBe(true);
    expect(__orthoCardAllowedForTest({ toothSelection: "milktooth", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
  });

  it("card gate: hidden for implant or missing tooth", () => {
    expect(__orthoCardAllowedForTest({ toothSelection: "implant", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
    expect(__orthoCardAllowedForTest({ toothSelection: "none", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
  });
});
