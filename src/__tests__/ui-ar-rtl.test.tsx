// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Task 4 (Arabic+Chinese sub-project): RTL layout for Arabic.
//
// The shell root (`.odontogram-root`) carries a reactive `dir`/`lang` pair
// driven by the active UI language — `dir="rtl"` for Arabic, `dir="ltr"`
// for every other language (including the newly-added `zh`, which is LTR).
// The dental chart (`#toothGrid`) is a 16-col grid filled 18->28 and must
// NEVER auto-reverse under an RTL shell — it stays `dir="ltr"` regardless
// of the active language. This mirrors `App.test.tsx`'s mock harness
// (odontogram.ts manipulates real DOM/SVGs and is mocked out) since nothing
// here needs a live `initOdontogram()`/SVG-grid mount.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import App from '../App';

// Mock odontogram.ts since it manipulates real DOM and SVGs (same harness as App.test.tsx).
vi.mock('../odontogram', () => ({
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
  getPulpDetailLevel: vi.fn().mockReturnValue('aae'),
  setSecondaryCariesMode: vi.fn(),
  getSecondaryCariesMode: vi.fn().mockReturnValue('standard'),
  setRootCariesMode: vi.fn(),
  getRootCariesMode: vi.fn().mockReturnValue('simple'),
  setRadiographicDepthMode: vi.fn(),
  getRadiographicDepthMode: vi.fn().mockReturnValue('off'),
  setCariesDepthEnabled: vi.fn(),
  getCariesDepthEnabled: vi.fn().mockReturnValue(true),
  setWearDetailLevel: vi.fn(),
  getWearDetailLevel: vi.fn().mockReturnValue('complex'),
  setDiscolorationDetailLevel: vi.fn(),
  getDiscolorationDetailLevel: vi.fn().mockReturnValue('complex'),
  setSurfaceNotation: vi.fn(),
  getSurfaceNotation: vi.fn().mockReturnValue('full'),
  hasAnyPerioData: vi.fn().mockReturnValue(false),
  getCaseMeta: vi.fn().mockReturnValue({
    age: null, smokingStatus: 'unknown', cigarettesPerDay: null,
    diabetesStatus: 'unknown', hba1c: null, toothLossPerio: null, maxRblPercent: null,
    diagnosisOverride: null, stageOverride: null, gradeOverride: null, extentOverride: null,
    patientName: null, examDate: null,
  }),
  setPatientName: vi.fn(),
  setExamDate: vi.fn(),
  exportPdf: vi.fn().mockResolvedValue(undefined),
  getOdontogramSummary: vi.fn().mockReturnValue({
    overview: '', permanentList: null, missingList: null,
    sections: [], implants: null, toothTable: { columns: [], rows: [], legend: "" }, periodontalHasFindings: false, periodontalTitle: '', periodontalText: '',
  }),
  onStateChange: vi.fn().mockReturnValue(() => {}),
  openPerioOverlay: vi.fn(),
  closePerioOverlay: vi.fn(),
  isPerioOverlayOpen: vi.fn().mockReturnValue(false),
  getPerioViewMode: vi.fn().mockReturnValue('toggle'),
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
  getPerioIndexNameMode: vi.fn().mockReturnValue('translated'),
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
}));

describe('Arabic RTL layout', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    document.documentElement.classList.remove('dark');
  });

  it('sets dir=rtl on the shell root for Arabic but keeps the tooth grid LTR', () => {
    const { container } = render(<App language="ar" />);
    const root = container.querySelector('.odontogram-root') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.getAttribute('dir')).toBe('rtl');
    expect(root.getAttribute('lang')).toBe('ar');
    const grid = container.querySelector('#toothGrid') as HTMLElement;
    // chart is pinned LTR (attribute or computed) regardless of the RTL shell
    expect(grid).toBeTruthy();
    expect(grid.getAttribute('dir')).toBe('ltr');
  });

  it('uses dir=ltr on the shell root for a non-RTL language (en)', () => {
    const { container } = render(<App language="en" />);
    const root = container.querySelector('.odontogram-root') as HTMLElement;
    expect(root.getAttribute('dir')).toBe('ltr');
    expect(root.getAttribute('lang')).toBe('en');
  });

  it('uses dir=ltr on the shell root for Chinese (zh is LTR, not RTL)', () => {
    const { container } = render(<App language="zh" />);
    const root = container.querySelector('.odontogram-root') as HTMLElement;
    expect(root.getAttribute('dir')).toBe('ltr');
    expect(root.getAttribute('lang')).toBe('zh');
  });
});
