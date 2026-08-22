// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// DX-2 Task 4 — declarative-render test for `DiagnosesCard`. Mounts the card as
// part of `ToothControlsSurface` under `<OdontogramProvider>` with the
// lifecycle-only mock the composable-surface suites use (initOdontogram/
// destroyOdontogram stubbed), PLUS `getActiveDiagnoses`/`setDxOverrideForSelection`
// mocked to a canned view-model — unlike the other card tests, the diagnoses
// card's view-model comes from a pure derivation (`deriveDentalDiagnoses`) over
// a fully-populated tooth state, which is out of scope to assemble here; a
// canned view-model (one derived row + one added row + two addable keys) is
// enough to prove the card's OWN rendering/wiring contract. Proves the card
// renders `#diagnosesRows` with a derived row's label+code+suppress checkbox and
// an added row's label+code+remove button+`added` tag, that toggling suppress /
// clicking remove / picking an addable option call `setDxOverrideForSelection`
// with the right arguments, and that `#diagnosesSection` hides per `dx.visible`.
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

vi.mock("../odontogram", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../odontogram")>();
  return {
    ...actual,
    initOdontogram: vi.fn().mockResolvedValue(undefined),
    destroyOdontogram: vi.fn(),
    getActiveDiagnoses: (...args: unknown[]) => getActiveDiagnosesMock(...args),
    setDxOverrideForSelection: (...args: unknown[]) => setDxOverrideForSelectionMock(...args),
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
  getActiveDiagnosesMock.mockReturnValue(VIEW_MODEL_VISIBLE);
  __resetChartStateForTest();
  setChartMode("status");
  setNumberingSystem("FDI");
});

describe("DX-2 Task 4: <DiagnosesCard/> renders declaratively", () => {
  it("renders a derived row with its label, code and a suppress control", () => {
    renderControls();
    const rows = document.getElementById("diagnosesRows");
    expect(rows).toBeTruthy();

    const row = document.getElementById("dxRow-caries");
    expect(row).toBeTruthy();
    expect(row?.getAttribute("data-source")).toBe("derived");
    expect(row?.textContent).toContain("K02");

    const suppress = document.getElementById("dxSuppress-caries") as HTMLInputElement;
    expect(suppress).toBeTruthy();
    expect(suppress.type).toBe("checkbox");
    expect(suppress.checked).toBe(false);
    // No remove button on a derived row.
    expect(document.getElementById("dxRemove-caries")).toBeFalsy();
  });

  it("renders an added row with its label, code, an 'added' tag and a remove button", () => {
    renderControls();
    const row = document.getElementById("dxRow-toothLoss");
    expect(row).toBeTruthy();
    expect(row?.getAttribute("data-source")).toBe("added");
    expect(row?.textContent).toContain("K08.1");
    expect(row?.textContent).toContain("added");

    const remove = document.getElementById("dxRemove-toothLoss") as HTMLButtonElement;
    expect(remove).toBeTruthy();
    expect(remove.tagName).toBe("BUTTON");
    // No suppress checkbox on an added row.
    expect(document.getElementById("dxSuppress-toothLoss")).toBeFalsy();
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

  it("renders #dxAddSelect over addableKeys with a placeholder, and selecting one calls setDxOverrideForSelection(key, 'add')", () => {
    renderControls();
    const select = document.getElementById("dxAddSelect") as HTMLSelectElement;
    expect(select).toBeTruthy();
    // Placeholder + the two addable keys.
    expect(select.options.length).toBe(3);
    expect(select.value).toBe("");

    fireEvent.change(select, { target: { value: "pulpitis" } });
    expect(setDxOverrideForSelectionMock).toHaveBeenCalledWith("pulpitis", "add");
    // Controlled select snaps back to the placeholder.
    expect(select.value).toBe("");
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
