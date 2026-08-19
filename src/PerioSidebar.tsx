// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { useEffect, useState } from "react";
import { t } from "./i18n/useI18n";
import {
  formatToothLabel,
  getPerioSummary,
  getReadOnly,
  onStateChange,
  getCaseMeta,
  setPatientName,
  setExamDate,
  setCaseAge,
  setSmokingStatus,
  setCigarettesPerDay,
  setDiabetesStatus,
  setHba1c,
  setToothLossPerio,
  setMaxRblPercent,
  getPerioClassification,
  setDiagnosisOverride,
  setStageOverride,
  setGradeOverride,
  setExtentOverride,
  getPerioIndexNameMode,
  getCaseConditions,
  setCaseCondition,
} from "./odontogram";
import { indexName } from "./perioIndexNames";
import { CASE_DX_CODES, type CaseConditionKey, type Laterality } from "./dx/caseCodes";

// Standalone, separately-mountable perio-context panel bundling the whole-mouth
// summary bar, the patient-data case-metadata form, and the 2017 classification
// block. `App.tsx` renders it in the shared right `<aside className="panel">` in
// place of the odontogram controls whenever the perio (Dental Chart) view is
// active, and `PerioChart`'s popup chrome renders it stacked above its own grid
// so the modal overlay stays a complete, self-sufficient surface. It uses the
// same DOM ids/classes as the perio chart, so id-based tests and host CSS
// targeting them keep resolving.
//
// Self-contained: owns its own `summary`/`caseMeta`/`classification` React
// state and a single `onStateChange` subscription, independent of whatever else
// is mounted (the chart grid, another `PerioSidebar` instance in a different
// chrome). No `active` gate is needed because the component is only ever mounted
// by its caller when needed — so `getPerioSummary`/`getCaseMeta`/
// `getPerioClassification` are only called post-mount, in the effect below,
// never at module-eval time.
//
// Every control writes straight through its existing engine setter.

type PerioSummaryData = ReturnType<typeof getPerioSummary>;
const EMPTY_SUMMARY: PerioSummaryData = {
  chartedSites: 0,
  bleedingSites: 0,
  bopPercent: 0,
  worstCal: null,
  worstCalTooth: null,
  maxPd: null,
  avgPd: null,
  avgCal: null,
  maxFurcation: null,
  plaquePercent: 0,
  piScore: null,
  giScore: null,
  kgDeficientTeeth: 0,
  gtDistribution: { thin: 0, medium: 0, thick: 0 },
  millerDistribution: { i: 0, ii: 0, iii: 0, iv: 0 },
  mpiScore: null,
  mbiScore: null,
};

type CaseMetaData = ReturnType<typeof getCaseMeta>;
const EMPTY_CASE_META: CaseMetaData = {
  age: null,
  smokingStatus: "unknown",
  cigarettesPerDay: null,
  diabetesStatus: "unknown",
  hba1c: null,
  toothLossPerio: null,
  maxRblPercent: null,
  diagnosisOverride: null,
  stageOverride: null,
  gradeOverride: null,
  extentOverride: null,
  patientName: null,
  patientDob: null,
  examDate: null,
  caseConditions: new Map(),
};

type ClassificationData = ReturnType<typeof getPerioClassification>;
const EMPTY_CLASSIFICATION: ClassificationData = {
  diagnosis: "health",
  stage: "na",
  grade: "indeterminate",
  extent: "na",
  derived: {
    diagnosis: "health",
    stage: "na",
    grade: "indeterminate",
    extent: "na",
    buckets: { smoking: "A", diabetes: "A", direct: null },
  },
  overridden: { diagnosis: false, stage: false, grade: false, extent: false },
};

// Glickman furcation grade -> Roman-numeral face (mirrors `PerioChart.tsx`'s
// own `FURCATION_ROMAN`).
const FURCATION_ROMAN = ["–", "I", "II", "III", "IV"];

// Per-axis derived-value label helpers (mirror `PerioChart.tsx`'s own
// identically-named helpers).
function diagnosisLabel(v: string): string {
  return t(`perio.class.dx.${v}`);
}
function stageLabel(v: string): string {
  if (v === "na") return t("perio.class.stage.na");
  if (v === "indeterminate") return t("perio.class.stage.indeterminate");
  return t(`perio.class.stage.${v}`);
}
function gradeLabel(v: string): string {
  if (v === "indeterminate") return t("perio.class.grade.indeterminate");
  return t(`perio.class.grade.${v}`);
}
function extentLabel(v: string): string {
  if (v === "na") return t("perio.class.extent.na");
  if (v === "molar-incisor") return t("perio.class.extent.molarIncisor");
  return t(`perio.class.extent.${v}`);
}

type CaseConditionsData = ReturnType<typeof getCaseConditions>;
const EMPTY_CASE_CONDITIONS: CaseConditionsData = [];

export default function PerioSidebar() {
  const [summary, setSummary] = useState<PerioSummaryData>(EMPTY_SUMMARY);
  const [caseMeta, setCaseMetaState] = useState<CaseMetaData>(EMPTY_CASE_META);
  const [classification, setClassification] = useState<ClassificationData>(EMPTY_CLASSIFICATION);
  const [caseConds, setCaseConds] = useState<CaseConditionsData>(EMPTY_CASE_CONDITIONS);

  useEffect(() => {
    setSummary(getPerioSummary());
    setCaseMetaState(getCaseMeta());
    setClassification(getPerioClassification());
    setCaseConds(getCaseConditions());
    const unsubscribe = onStateChange(() => {
      setSummary(getPerioSummary());
      setCaseMetaState(getCaseMeta());
      setClassification(getPerioClassification());
      setCaseConds(getCaseConditions());
    });
    return unsubscribe;
  }, []);

  // Read directly (not React state) — safe post-mount. Only gates the
  // case-metadata/classification panel's inputs (`disabled`).
  const readOnly = getReadOnly();

  const worstCalText =
    summary.worstCal === null
      ? "–"
      : `${summary.worstCal}${summary.worstCalTooth !== null ? ` (${formatToothLabel(summary.worstCalTooth)})` : ""}`;

  const cigsDisabled = caseMeta.smokingStatus !== "current";
  const hba1cDisabled = caseMeta.diabetesStatus !== "present";

  // Whole-mouth summary items that name a specific index (PD/CAL/BOP/Furcation/
  // Plaque) compose their label from the qualifier (Avg/Worst/Max/%) +
  // `indexName(...)`, so canonical mode swaps in the fixed English/Latin index
  // name instead of the localized `t(...)` string. The qualifier itself is a
  // plain English literal in canonical mode by design: canonical mode is not
  // localized, so it never round-trips through `t()`. "Charted sites" isn't tied
  // to one specific index — left translated in both modes.
  const canonicalNames = getPerioIndexNameMode() === "canonical";
  const avgPdLabel = canonicalNames ? `Avg ${indexName("pd")}` : t("perio.summary.avgPd");
  const avgCalLabel = canonicalNames ? `Avg ${indexName("cal")}` : t("perio.summary.avgCal");
  const bopSummaryLabel = canonicalNames ? `${indexName("bop")}%` : t("perio.bopPercent");
  const worstCalLabel = canonicalNames ? `Worst ${indexName("cal")}` : t("perio.summary.worstCal");
  const maxPdLabel = canonicalNames ? `Max ${indexName("pd")}` : t("perio.summary.maxPd");
  const maxFurcationLabel = canonicalNames ? `Max ${indexName("furcation")}` : t("perio.summary.maxFurcation");
  const plaquePercentLabel = canonicalNames ? `${indexName("plaque")}%` : t("plaque.percent");

  return (
    <div className="panel-body">
      <div className="perio-summary-card">
        <div className="perio-summary-card-title">{t("perio.summary.title")}</div>
        <div className="perio-fullgrid-summary" role="status">
          <span className="perio-fullgrid-summary-item">
            <span className="perio-fullgrid-summary-label">{avgPdLabel}</span>
            <span className="perio-fullgrid-summary-value" id="perio-fg-summary-avgpd">
              {summary.avgPd === null ? "–" : summary.avgPd}
            </span>
          </span>
          <span className="perio-fullgrid-summary-item">
            <span className="perio-fullgrid-summary-label">{avgCalLabel}</span>
            <span className="perio-fullgrid-summary-value" id="perio-fg-summary-avgcal">
              {summary.avgCal === null ? "–" : summary.avgCal}
            </span>
          </span>
          <span className="perio-fullgrid-summary-item">
            <span className="perio-fullgrid-summary-label">{bopSummaryLabel}</span>
            <span className="perio-fullgrid-summary-value" id="perio-fg-summary-bop">
              {summary.bopPercent}%
            </span>
          </span>
          <span className="perio-fullgrid-summary-item">
            <span className="perio-fullgrid-summary-label">{t("perio.summary.charted")}</span>
            <span className="perio-fullgrid-summary-value" id="perio-fg-summary-charted">
              {summary.chartedSites}
            </span>
          </span>
          <span className="perio-fullgrid-summary-item">
            <span className="perio-fullgrid-summary-label">{worstCalLabel}</span>
            <span className="perio-fullgrid-summary-value" id="perio-fg-summary-cal">
              {worstCalText}
            </span>
          </span>
          <span className="perio-fullgrid-summary-item">
            <span className="perio-fullgrid-summary-label">{maxPdLabel}</span>
            <span className="perio-fullgrid-summary-value" id="perio-fg-summary-maxpd">
              {summary.maxPd === null ? "–" : summary.maxPd}
            </span>
          </span>
          <span className="perio-fullgrid-summary-item">
            <span className="perio-fullgrid-summary-label">{maxFurcationLabel}</span>
            <span className="perio-fullgrid-summary-value" id="perio-fg-summary-maxfurc">
              {summary.maxFurcation === null ? "–" : FURCATION_ROMAN[summary.maxFurcation]}
            </span>
          </span>
          <span className="perio-fullgrid-summary-item">
            <span className="perio-fullgrid-summary-label">{plaquePercentLabel}</span>
            <span className="perio-fullgrid-summary-value" id="perio-fg-summary-plaque">
              {summary.plaquePercent}%
            </span>
          </span>
        </div>
      </div>
      <details id="caseMetaPanel" className="case-meta-panel" open>
        <summary className="case-meta-panel-title">{t("case.panelTitle")}</summary>
        <div className="case-meta-panel-body">
          <div className="case-meta-row">
            <label className="case-meta-row-label" htmlFor="caseMetaPatientName">{t("case.patientName")}</label>
            <input
              id="caseMetaPatientName"
              className="case-meta-input"
              type="text"
              disabled={readOnly}
              value={caseMeta.patientName ?? ""}
              onChange={(e) => setPatientName(e.target.value === "" ? null : e.target.value)}
            />
          </div>
          <div className="case-meta-row">
            <label className="case-meta-row-label" htmlFor="caseMetaExamDate">{t("case.examDate")}</label>
            <input
              id="caseMetaExamDate"
              className="case-meta-input"
              type="date"
              disabled={readOnly}
              value={caseMeta.examDate ?? ""}
              onChange={(e) => setExamDate(e.target.value === "" ? null : e.target.value)}
            />
          </div>
          <div className="case-meta-row">
            <label className="case-meta-row-label" htmlFor="caseMetaAge">{t("case.age")}</label>
            <input
              id="caseMetaAge"
              className="case-meta-input case-meta-input-narrow"
              type="number"
              min={0}
              max={120}
              disabled={readOnly}
              value={caseMeta.age ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setCaseAge(v === "" ? null : Number(v));
              }}
            />
          </div>
          <div className="case-meta-row">
            <label className="case-meta-row-label" htmlFor="caseMetaSmoking">{t("case.smoking.label")}</label>
            <select
              id="caseMetaSmoking"
              className="odon-settings-select case-meta-select"
              disabled={readOnly}
              value={caseMeta.smokingStatus}
              onChange={(e) => setSmokingStatus(e.target.value)}
            >
              <option value="unknown">{t("case.smoking.unknown")}</option>
              <option value="never">{t("case.smoking.never")}</option>
              <option value="former">{t("case.smoking.former")}</option>
              <option value="current">{t("case.smoking.current")}</option>
            </select>
          </div>
          <div className={"case-meta-row" + (cigsDisabled ? " case-meta-row-disabled" : "")}>
            <label className="case-meta-row-label" htmlFor="caseMetaCigarettesPerDay">{t("case.cigarettesPerDay")}</label>
            <input
              id="caseMetaCigarettesPerDay"
              className="case-meta-input case-meta-input-narrow"
              type="number"
              min={0}
              max={99}
              disabled={readOnly || cigsDisabled}
              value={caseMeta.cigarettesPerDay ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setCigarettesPerDay(v === "" ? null : Number(v));
              }}
            />
          </div>
          <div className="case-meta-row">
            <label className="case-meta-row-label" htmlFor="caseMetaDiabetes">{t("case.diabetes.label")}</label>
            <select
              id="caseMetaDiabetes"
              className="odon-settings-select case-meta-select"
              disabled={readOnly}
              value={caseMeta.diabetesStatus}
              onChange={(e) => setDiabetesStatus(e.target.value)}
            >
              <option value="unknown">{t("case.diabetes.unknown")}</option>
              <option value="none">{t("case.diabetes.none")}</option>
              <option value="present">{t("case.diabetes.present")}</option>
            </select>
          </div>
          <div className={"case-meta-row" + (hba1cDisabled ? " case-meta-row-disabled" : "")}>
            <label className="case-meta-row-label" htmlFor="caseMetaHba1c">{t("case.hba1c")}</label>
            <input
              id="caseMetaHba1c"
              className="case-meta-input case-meta-input-narrow"
              type="number"
              min={3}
              max={20}
              step={0.1}
              disabled={readOnly || hba1cDisabled}
              value={caseMeta.hba1c ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setHba1c(v === "" ? null : Number(v));
              }}
            />
          </div>
          <div className="case-meta-row">
            <label className="case-meta-row-label" htmlFor="caseMetaRbl">{t("case.rbl")}</label>
            <input
              id="caseMetaRbl"
              className="case-meta-input case-meta-input-narrow"
              type="number"
              min={0}
              max={100}
              disabled={readOnly}
              value={caseMeta.maxRblPercent ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setMaxRblPercent(v === "" ? null : Number(v));
              }}
            />
          </div>
          <div className="case-meta-row">
            <label className="case-meta-row-label" htmlFor="caseMetaToothLoss">{t("case.toothLoss")}</label>
            <input
              id="caseMetaToothLoss"
              className="case-meta-input case-meta-input-narrow"
              type="number"
              min={0}
              max={32}
              disabled={readOnly}
              value={caseMeta.toothLossPerio ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setToothLossPerio(v === "" ? null : Number(v));
              }}
            />
          </div>
          <div id="caseDiagnosesSection" className="case-diagnoses">
            <div className="case-diagnoses-title">{t("case.diagnoses.section")}</div>
            {caseConds.map((c) => (
              <div className="case-diagnoses-row" key={c.key}>
                <span className="case-dx-label">{t(`dx.case.${c.key}`)}</span>
                <span className="case-dx-code">{c.icd10}</span>
                {c.lateralizable && (
                  <select
                    value={c.laterality}
                    disabled={readOnly}
                    onChange={(e) => setCaseCondition(c.key, e.target.value as Laterality)}
                  >
                    {(["unspecified", "left", "right", "bilateral"] as Laterality[]).map((l) => (
                      <option key={l} value={l}>{t(`caseDx.laterality.${l}`)}</option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  className="case-dx-remove"
                  disabled={readOnly}
                  onClick={() => setCaseCondition(c.key, null)}
                >
                  {t("case.diagnoses.remove")}
                </button>
              </div>
            ))}
            <select
              id="caseDxAddSelect"
              value=""
              disabled={readOnly}
              onChange={(e) => { if (e.target.value) setCaseCondition(e.target.value, "unspecified"); }}
            >
              <option value="">{t("case.diagnoses.add")}</option>
              {(Object.keys(CASE_DX_CODES) as CaseConditionKey[])
                .filter((k) => !caseConds.some((c) => c.key === k))
                .map((k) => (<option key={k} value={k}>{t(`dx.case.${k}`)}</option>))}
            </select>
          </div>
          <div className="case-meta-panel-subheading">{t("perio.class.title")}</div>
          <div className="perio-class-row">
            <label className="perio-class-row-label" htmlFor="perioClassDiagnosisOverride">{t("perio.class.diagnosis")}</label>
            <div className="perio-class-derived" id="perioClassDiagnosisDerived">
              {diagnosisLabel(classification.derived.diagnosis)}
            </div>
            <select
              id="perioClassDiagnosisOverride"
              className="odon-settings-select case-meta-select"
              disabled={readOnly}
              value={caseMeta.diagnosisOverride ?? ""}
              onChange={(e) => setDiagnosisOverride(e.target.value === "" ? null : e.target.value)}
            >
              <option value="">{t("perio.class.useDerived", { value: diagnosisLabel(classification.derived.diagnosis) })}</option>
              <option value="health">{t("perio.class.dx.health")}</option>
              <option value="gingivitis">{t("perio.class.dx.gingivitis")}</option>
              <option value="periodontitis">{t("perio.class.dx.periodontitis")}</option>
            </select>
          </div>
          <div className="perio-class-row">
            <label className="perio-class-row-label" htmlFor="perioClassStageOverride">{t("perio.class.stage")}</label>
            <div className="perio-class-derived" id="perioClassStageDerived">
              {stageLabel(classification.derived.stage)}
            </div>
            <select
              id="perioClassStageOverride"
              className="odon-settings-select case-meta-select"
              disabled={readOnly}
              value={caseMeta.stageOverride ?? ""}
              onChange={(e) => setStageOverride(e.target.value === "" ? null : e.target.value)}
            >
              <option value="">{t("perio.class.useDerived", { value: stageLabel(classification.derived.stage) })}</option>
              <option value="I">{t("perio.class.stage.I")}</option>
              <option value="II">{t("perio.class.stage.II")}</option>
              <option value="III">{t("perio.class.stage.III")}</option>
              <option value="IV">{t("perio.class.stage.IV")}</option>
            </select>
          </div>
          <div className="perio-class-row">
            <label className="perio-class-row-label" htmlFor="perioClassGradeOverride">{t("perio.class.grade")}</label>
            <div className="perio-class-derived" id="perioClassGradeDerived">
              {gradeLabel(classification.derived.grade)}
            </div>
            <select
              id="perioClassGradeOverride"
              className="odon-settings-select case-meta-select"
              disabled={readOnly}
              value={caseMeta.gradeOverride ?? ""}
              onChange={(e) => setGradeOverride(e.target.value === "" ? null : e.target.value)}
            >
              <option value="">{t("perio.class.useDerived", { value: gradeLabel(classification.derived.grade) })}</option>
              <option value="A">{t("perio.class.grade.A")}</option>
              <option value="B">{t("perio.class.grade.B")}</option>
              <option value="C">{t("perio.class.grade.C")}</option>
            </select>
          </div>
          <div className="perio-class-row">
            <label className="perio-class-row-label" htmlFor="perioClassExtentOverride">{t("perio.class.extent")}</label>
            <div className="perio-class-derived" id="perioClassExtentDerived">
              {extentLabel(classification.derived.extent)}
            </div>
            <select
              id="perioClassExtentOverride"
              className="odon-settings-select case-meta-select"
              disabled={readOnly}
              value={caseMeta.extentOverride ?? ""}
              onChange={(e) => setExtentOverride(e.target.value === "" ? null : e.target.value)}
            >
              <option value="">{t("perio.class.useDerived", { value: extentLabel(classification.derived.extent) })}</option>
              <option value="localized">{t("perio.class.extent.localized")}</option>
              <option value="generalized">{t("perio.class.extent.generalized")}</option>
              <option value="molar-incisor">{t("perio.class.extent.molarIncisor")}</option>
            </select>
          </div>
        </div>
      </details>
    </div>
  );
}
