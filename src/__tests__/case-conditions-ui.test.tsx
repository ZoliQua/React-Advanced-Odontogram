// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Declarative-render test for the "Case / regional diagnoses" pop-up
// (`<CaseDiagnosesModal/>`) — moved out of `<PerioSidebar/>` into its own dialog
// opened by the "Diagnoses" button beside the view toggle. Mocks only the two
// engine symbols the modal reads/writes (keep everything else real via
// `importOriginal`), and passes an identity `t` so option/label text is the raw
// key — code assertions (ICD-10) are language-independent. Proves: the modal
// renders one row per active condition (code-first label + ICD-10 + × delete), a
// lateralizable row additionally gets a laterality select, the add-select offers
// only catalog keys not already active — code-first and code-sorted — and each
// control calls through to `setCaseCondition` with the right arguments.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import CaseDiagnosesModal from "../CaseDiagnosesModal";
import { __resetChartStateForTest, setNumberingSystem, resetCaseMeta } from "../odontogram";

const getCaseConditionsMock = vi.fn();
const setCaseConditionMock = vi.fn();

vi.mock("../odontogram", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../odontogram")>();
  return {
    ...actual,
    getCaseConditions: (...args: unknown[]) => getCaseConditionsMock(...args),
    setCaseCondition: (...args: unknown[]) => setCaseConditionMock(...args),
  };
});

const t = (k: string) => k; // identity — code assertions are language-independent

function renderModal() {
  return render(createElement(CaseDiagnosesModal, { open: true, t, onClose: () => {} }));
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  getCaseConditionsMock.mockReset();
  setCaseConditionMock.mockReset();
  getCaseConditionsMock.mockReturnValue([]);
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  resetCaseMeta();
});

describe("CaseDiagnosesModal: Case/regional diagnoses pop-up", () => {
  it("renders the dialog with its section, add-select and a placeholder", () => {
    renderModal();
    expect(document.getElementById("caseDiagnosesModal")).toBeTruthy();
    expect(document.getElementById("caseDiagnosesSection")).toBeTruthy();
    const select = document.getElementById("caseDxAddSelect") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("");
  });

  it("renders nothing when open is false", () => {
    render(createElement(CaseDiagnosesModal, { open: false, t, onClose: () => {} }));
    expect(document.getElementById("caseDiagnosesModal")).toBeFalsy();
  });

  it("renders no rows when there are no active conditions", () => {
    renderModal();
    expect(document.querySelectorAll(".case-diagnoses-row").length).toBe(0);
  });

  it("the add-select options are code-first and code-sorted (K00.0 first)", () => {
    renderModal();
    const select = document.getElementById("caseDxAddSelect") as HTMLSelectElement;
    // options[0] is the placeholder; options[1] is the lowest ICD-10 code (K00.0 anodontia).
    expect(select.options[1].textContent?.startsWith("K00.0 ")).toBe(true);
    const codes = Array.from(select.options).slice(1).map((o) => o.textContent!.split(" ")[0]);
    const sorted = [...codes].sort((a, b) => a.localeCompare(b));
    expect(codes).toEqual(sorted);
  });

  it("picking a key from the add-select calls setCaseCondition(key, 'unspecified')", () => {
    renderModal();
    const select = document.getElementById("caseDxAddSelect") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "tmjDisorder" } });
    expect(setCaseConditionMock).toHaveBeenCalledWith("tmjDisorder", "unspecified");
  });

  it("renders an active non-lateralizable row code-first, with no laterality select", () => {
    getCaseConditionsMock.mockReturnValue([
      { key: "malocclusionUnspecified", icd10: "K07.4", laterality: "unspecified", lateralizable: false },
    ]);
    renderModal();
    const rows = document.querySelectorAll(".case-diagnoses-row");
    expect(rows.length).toBe(1);
    expect(rows[0].querySelector(".dx-code")?.textContent).toBe("K07.4");
    expect(rows[0].querySelector("select")).toBeFalsy();
  });

  it("clicking the × delete on an active row calls setCaseCondition(key, null)", () => {
    getCaseConditionsMock.mockReturnValue([
      { key: "malocclusionUnspecified", icd10: "K07.4", laterality: "unspecified", lateralizable: false },
    ]);
    renderModal();
    const removeBtn = document.querySelector(".case-dx-remove") as HTMLButtonElement;
    expect(removeBtn).toBeTruthy();
    fireEvent.click(removeBtn);
    expect(setCaseConditionMock).toHaveBeenCalledWith("malocclusionUnspecified", null);
  });

  it("a lateralizable active row renders a laterality select that calls setCaseCondition(key, value)", () => {
    getCaseConditionsMock.mockReturnValue([
      { key: "tmjDisorder", icd10: "K07.6", laterality: "unspecified", lateralizable: true },
    ]);
    renderModal();
    const row = document.querySelector(".case-diagnoses-row") as HTMLElement;
    const select = row.querySelector("select") as HTMLSelectElement;
    expect(select).toBeTruthy();
    fireEvent.change(select, { target: { value: "left" } });
    expect(setCaseConditionMock).toHaveBeenCalledWith("tmjDisorder", "left");
  });

  it("the add-select excludes catalog keys that are already active", () => {
    getCaseConditionsMock.mockReturnValue([
      { key: "tmjDisorder", icd10: "K07.6", laterality: "unspecified", lateralizable: true },
    ]);
    renderModal();
    const select = document.getElementById("caseDxAddSelect") as HTMLSelectElement;
    const optionValues = Array.from(select.options).map((o) => o.value);
    expect(optionValues).not.toContain("tmjDisorder");
    expect(optionValues).toContain("malocclusionUnspecified");
  });
});
