// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// DX-3b Task 5 — declarative-render test for the "Case / regional diagnoses"
// section of `<PerioSidebar/>`. Mirrors `dx-card.test.tsx`'s mocking pattern
// (mock only the two engine symbols the section reads/writes, keep everything
// else real via `importOriginal`), rendering `<PerioSidebar/>` directly — same
// precedent as `ui1-perio-sidebar.test.tsx` part (a), nothing the section needs
// requires a live initOdontogram()/SVG-grid mount. Proves: the section renders
// one row per active condition (label + ICD-10 code + remove button), a
// lateralizable row additionally gets a laterality select, the add-select
// offers only catalog keys not already active, and each control calls through
// to `setCaseCondition` with the right arguments.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import PerioSidebar from "../PerioSidebar";
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

function renderSidebar() {
  return render(createElement(PerioSidebar));
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

describe("DX-3b Task 5: Case/regional diagnoses picker in <PerioSidebar/>", () => {
  it("renders the section with its title and an add-select with a placeholder", () => {
    renderSidebar();
    const section = document.getElementById("caseDiagnosesSection");
    expect(section).toBeTruthy();
    const select = document.getElementById("caseDxAddSelect") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("");
  });

  it("renders no rows when there are no active conditions", () => {
    renderSidebar();
    expect(document.querySelectorAll(".case-diagnoses-row").length).toBe(0);
  });

  it("picking a key from the add-select calls setCaseCondition(key, 'unspecified')", () => {
    renderSidebar();
    const select = document.getElementById("caseDxAddSelect") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "tmjDisorder" } });
    expect(setCaseConditionMock).toHaveBeenCalledWith("tmjDisorder", "unspecified");
  });

  it("renders an active non-lateralizable row with its label, code and no laterality select", () => {
    getCaseConditionsMock.mockReturnValue([
      { key: "malocclusionUnspecified", icd10: "K07.4", laterality: "unspecified", lateralizable: false },
    ]);
    renderSidebar();
    const rows = document.querySelectorAll(".case-diagnoses-row");
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain("K07.4");
    expect(rows[0].querySelector("select")).toBeFalsy();
  });

  it("clicking the remove button on an active row calls setCaseCondition(key, null)", () => {
    getCaseConditionsMock.mockReturnValue([
      { key: "malocclusionUnspecified", icd10: "K07.4", laterality: "unspecified", lateralizable: false },
    ]);
    renderSidebar();
    const removeBtn = document.querySelector(".case-dx-remove") as HTMLButtonElement;
    expect(removeBtn).toBeTruthy();
    fireEvent.click(removeBtn);
    expect(setCaseConditionMock).toHaveBeenCalledWith("malocclusionUnspecified", null);
  });

  it("a lateralizable active row renders a laterality select that calls setCaseCondition(key, value)", () => {
    getCaseConditionsMock.mockReturnValue([
      { key: "tmjDisorder", icd10: "K07.6", laterality: "unspecified", lateralizable: true },
    ]);
    renderSidebar();
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
    renderSidebar();
    const select = document.getElementById("caseDxAddSelect") as HTMLSelectElement;
    const optionValues = Array.from(select.options).map((o) => o.value);
    expect(optionValues).not.toContain("tmjDisorder");
    expect(optionValues).toContain("malocclusionUnspecified");
  });
});
