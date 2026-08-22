// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// DX-2 Task 4 — declarative-render test for `DiagnosesCard`. Mounts the card as
// part of `ToothControlsSurface` under `<OdontogramProvider>` with the
// lifecycle-only mock the composable-surface suites use (initOdontogram/
// destroyOdontogram stubbed), PLUS `getActiveDiagnoses`/`setDxOverrideForSelection`/
// `addDiagnosisToSelection` mocked to a canned view-model — unlike the other
// card tests, the diagnoses card's view-model comes from a pure derivation
// (`deriveDentalDiagnoses`) over a fully-populated tooth state, which is out of
// scope to assemble here; a canned view-model (one derived row + one added row +
// two addable keys) is enough to prove the card's OWN rendering/wiring contract.
// Proves the card renders `#diagnosesRows` with a derived row's CODE-FIRST
// label+code+suppress checkbox and an added row's code-first label+code+remove
// button+`added` tag, that toggling suppress / clicking remove still call
// `setDxOverrideForSelection`, that picking an addable option (rendered
// code-first, e.g. "K04.0 Pulpitis") calls `addDiagnosisToSelection` (task 2 —
// NOT `setDxOverrideForSelection(key,"add")`), and that `#diagnosesSection`
// hides per `dx.visible`.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { OdontogramProvider, ToothControlsSurface } from "../App";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  setChartMode,
} from "../odontogram";

const getActiveDiagnosesMock = vi.fn();
const setDxOverrideForSelectionMock = vi.fn();
const addDiagnosisToSelectionMock = vi.fn();

vi.mock("../odontogram", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../odontogram")>();
  return {
    ...actual,
    initOdontogram: vi.fn().mockResolvedValue(undefined),
    destroyOdontogram: vi.fn(),
    getActiveDiagnoses: (...args: unknown[]) => getActiveDiagnosesMock(...args),
    setDxOverrideForSelection: (...args: unknown[]) => setDxOverrideForSelectionMock(...args),
    addDiagnosisToSelection: (...args: unknown[]) => addDiagnosisToSelectionMock(...args),
  };
});

function renderControls() {
  return render(createElement(OdontogramProvider, { language: "en" }, createElement(ToothControlsSurface)));
}

const VIEW_MODEL_VISIBLE = {
  visible: true,
  rows: [
    { key: "caries", icd10: "K02", source: "derived" as const, suppressed: false },
    { key: "toothLoss", icd10: "K08.1", source: "added" as const, suppressed: false },
  ],
  addableKeys: [{ key: "pulpitis", icd10: "K04.0" }, { key: "calculus", icd10: "K03.6" }],
};

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  getActiveDiagnosesMock.mockReset();
  setDxOverrideForSelectionMock.mockReset();
  addDiagnosisToSelectionMock.mockReset();
  getActiveDiagnosesMock.mockReturnValue(VIEW_MODEL_VISIBLE);
  __resetChartStateForTest();
  setChartMode("status");
  setNumberingSystem("FDI");
});

describe("DX-2 Task 4: <DiagnosesCard/> renders declaratively", () => {
  it("renders a derived row code-first, with a suppress control", () => {
    renderControls();
    const rows = document.getElementById("diagnosesRows");
    expect(rows).toBeTruthy();

    const row = document.getElementById("dxRow-caries");
    expect(row).toBeTruthy();
    expect(row?.getAttribute("data-source")).toBe("derived");
    expect(row?.textContent).toContain("K02");
    // Code-first: the code precedes the label in both DOM order and text order.
    expect(row?.querySelector(".dx-code")?.textContent).toBe("K02");
    expect(row?.querySelector(".dx-label")?.textContent).toBe("Dental caries");
    const codeIndex = row?.textContent?.indexOf("K02") ?? -1;
    const labelIndex = row?.textContent?.indexOf("Dental caries") ?? -1;
    expect(codeIndex).toBeGreaterThanOrEqual(0);
    expect(codeIndex).toBeLessThan(labelIndex);

    const suppress = document.getElementById("dxSuppress-caries") as HTMLInputElement;
    expect(suppress).toBeTruthy();
    expect(suppress.type).toBe("checkbox");
    expect(suppress.checked).toBe(false);
    // No remove button on a derived row.
    expect(document.getElementById("dxRemove-caries")).toBeFalsy();
  });

  it("renders an added row code-first, with an 'added' tag and a remove button", () => {
    renderControls();
    const row = document.getElementById("dxRow-toothLoss");
    expect(row).toBeTruthy();
    expect(row?.getAttribute("data-source")).toBe("added");
    expect(row?.textContent).toContain("K08.1");
    expect(row?.textContent).toContain("added");
    // Code-first here too.
    const codeIndex = row?.textContent?.indexOf("K08.1") ?? -1;
    const labelIndex = row?.textContent?.indexOf("Tooth loss") ?? -1;
    expect(codeIndex).toBeGreaterThanOrEqual(0);
    expect(codeIndex).toBeLessThan(labelIndex);

    const remove = document.getElementById("dxRemove-toothLoss") as HTMLButtonElement;
    expect(remove).toBeTruthy();
    expect(remove.tagName).toBe("BUTTON");
    // No suppress checkbox on an added row.
    expect(document.getElementById("dxSuppress-toothLoss")).toBeFalsy();
  });

  it("renders a row with no code with just the label (no empty .dx-code)", () => {
    getActiveDiagnosesMock.mockReturnValue({
      visible: true,
      rows: [{ key: "caries", icd10: "", source: "derived" as const, suppressed: false }],
      addableKeys: [],
    });
    renderControls();
    const row = document.getElementById("dxRow-caries");
    expect(row).toBeTruthy();
    expect(row?.querySelector(".dx-code")).toBeFalsy();
    expect(row?.querySelector(".dx-label")?.textContent).toBe("Dental caries");
  });

  it("toggling the suppress checkbox calls setDxOverrideForSelection(key, 'suppress'/null)", () => {
    renderControls();
    const suppress = document.getElementById("dxSuppress-caries") as HTMLInputElement;
    fireEvent.click(suppress);
    expect(setDxOverrideForSelectionMock).toHaveBeenCalledWith("caries", "suppress");
  });

  it("toggling suppress OFF on an already-suppressed row calls setDxOverrideForSelection(key, null)", () => {
    getActiveDiagnosesMock.mockReturnValue({
      visible: true,
      rows: [{ key: "caries", icd10: "K02", source: "derived" as const, suppressed: true }],
      addableKeys: [],
    });
    renderControls();
    const suppress = document.getElementById("dxSuppress-caries") as HTMLInputElement;
    expect(suppress.checked).toBe(true);
    fireEvent.click(suppress);
    expect(setDxOverrideForSelectionMock).toHaveBeenCalledWith("caries", null);
  });

  it("clicking the remove button on an added row calls setDxOverrideForSelection(key, null)", () => {
    renderControls();
    const remove = document.getElementById("dxRemove-toothLoss") as HTMLButtonElement;
    fireEvent.click(remove);
    expect(setDxOverrideForSelectionMock).toHaveBeenCalledWith("toothLoss", null);
  });

  it("renders #dxAddSelect options code-first, and selecting one calls addDiagnosisToSelection(key) — NOT setDxOverrideForSelection", () => {
    renderControls();
    const select = document.getElementById("dxAddSelect") as HTMLSelectElement;
    expect(select).toBeTruthy();
    // Placeholder + the two addable keys.
    expect(select.options.length).toBe(3);
    expect(select.value).toBe("");
    // Code-first option labels.
    expect(select.options[1].value).toBe("pulpitis");
    expect(select.options[1].textContent).toBe("K04.0 Pulpitis");
    expect(select.options[2].value).toBe("calculus");
    expect(select.options[2].textContent).toBe("K03.6 Dental calculus");

    fireEvent.change(select, { target: { value: "pulpitis" } });
    expect(addDiagnosisToSelectionMock).toHaveBeenCalledWith("pulpitis");
    expect(setDxOverrideForSelectionMock).not.toHaveBeenCalledWith("pulpitis", "add");
    // Controlled select snaps back to the placeholder.
    expect(select.value).toBe("");
  });

  it("renders an addable option with no code with just the label", () => {
    getActiveDiagnosesMock.mockReturnValue({
      visible: true,
      rows: [],
      addableKeys: [{ key: "pulpitis", icd10: "" }],
    });
    renderControls();
    const select = document.getElementById("dxAddSelect") as HTMLSelectElement;
    expect(select.options[1].textContent).toBe("Pulpitis");
  });

  it("hides #diagnosesSection when dx.visible is false", () => {
    getActiveDiagnosesMock.mockReturnValue({ visible: false, rows: [], addableKeys: [] });
    renderControls();
    expect(document.getElementById("diagnosesSection")?.classList.contains("hidden")).toBe(true);
  });

  it("shows #diagnosesSection when dx.visible is true", () => {
    renderControls();
    expect(document.getElementById("diagnosesSection")?.classList.contains("hidden")).toBe(false);
  });
});

// i18n-key-presence: `card.diagnoses`/`diagnoses.add`/`diagnoses.suppress`/
// `diagnoses.added` and a `dx.<key>` label for every tooth-level diagnosis key
// (DX_CODES minus the two summary-level keys `periodontitis`/`gingivitis`, i.e.
// the same set `TOOTH_LEVEL_DX_KEYS` exposes) must exist in ALL 12 languages —
// reads the REAL (unmocked) translations table directly, independent of the
// `../../odontogram` mock above.
describe("DX-2 Task 4: diagnoses i18n keys present in all languages", () => {
  const TOOTH_LEVEL_DX_KEYS = [
    "caries", "cariesCementum", "cariesArrested", "pulpitis", "pulpNecrosis",
    "apicalPeriodontitisAcute", "apicalPeriodontitisChronic", "radicularCyst",
    "periapicalAbscess", "periapicalAbscessSinus", "condensingOsteitis",
    "resorption", "attrition", "abrasion", "erosion", "abfraction", "calculus",
    "fluorosis", "tetracyclineStain", "postEruptiveColour", "toothLoss", "retainedRoot",
    "toothFracture",
  ];
  const CARD_KEYS = ["card.diagnoses", "diagnoses.add", "diagnoses.suppress", "diagnoses.added", "diagnoses.noCode"];
  const ALL_KEYS = [...CARD_KEYS, ...TOOTH_LEVEL_DX_KEYS.map((k) => `dx.${k}`)];
  const ALL_LANGUAGES = ["hu", "en", "de", "es", "it", "sk", "pl", "ru", "pt-br", "zh", "ar", "fr"] as const;

  it("matches the real TOOTH_LEVEL_DX_KEYS set (DX_CODES minus periodontitis/gingivitis)", async () => {
    const { TOOTH_LEVEL_DX_KEYS: real } = await import("../odontogram");
    expect(new Set(TOOTH_LEVEL_DX_KEYS)).toEqual(real);
  });

  for (const lang of ALL_LANGUAGES) {
    it(`${lang} has all ${ALL_KEYS.length} diagnoses keys with non-empty values`, async () => {
      const { translations } = await import("../i18n/translations");
      const table = translations[lang as (typeof ALL_LANGUAGES)[number]];
      const missing = ALL_KEYS.filter((k) => typeof table[k] !== "string" || table[k].trim() === "");
      expect(missing).toEqual([]);
    });
  }
});
