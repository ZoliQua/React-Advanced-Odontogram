// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-1 Task 2: style the `<PerioSidebar/>` case-meta/classification/summary
// block into a clean, responsive sidebar (`src/index.css`) and rename its
// title to "Páciens adatok" (hu) / "Patient data" (en). This test is
// structure-level only — CSS pixels aren't unit-testable — it just guards
// that: (1) the sidebar renders three titled cards, (2) the metadata form
// uses a labelled row structure (each control has an associated label), and
// (3) `case.panelTitle` resolves to the renamed value. Companion to
// `ui1-perio-sidebar.test.tsx` (Task 1, which covers extraction/wiring, not
// styling/copy).
import { describe, it, expect, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import PerioSidebar from "../PerioSidebar";
import { t } from "../i18n/useI18n";
import { __resetChartStateForTest, setNumberingSystem, resetCaseMeta } from "../odontogram";

function renderSidebar() {
  return render(createElement(PerioSidebar));
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  resetCaseMeta();
});

describe("UI-1 Task 2: <PerioSidebar/> renders three titled cards", () => {
  it("renders the case-meta (Páciens adatok) panel as a titled card", () => {
    renderSidebar();
    const panel = document.getElementById("caseMetaPanel");
    expect(panel).toBeTruthy();
    expect(panel!.className).toContain("case-meta-panel");
    const title = panel!.querySelector(".case-meta-panel-title");
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe(t("case.panelTitle"));
  });

  it("renders the 2017 classification block under its own subheading inside the card", () => {
    renderSidebar();
    const subheading = document.querySelector(".case-meta-panel-subheading");
    expect(subheading).toBeTruthy();
    expect(subheading!.textContent).toBe(t("perio.class.title"));
    // Classification axis rows carry a dedicated class hook for styling
    // (aligned label / derived value / override select).
    const classRows = document.querySelectorAll(".perio-class-row");
    expect(classRows.length).toBe(4); // diagnosis, stage, grade, extent
  });

  it("renders the whole-mouth summary as its own titled card", () => {
    renderSidebar();
    const summaryCard = document.querySelector(".perio-summary-card");
    expect(summaryCard).toBeTruthy();
    const title = summaryCard!.querySelector(".perio-summary-card-title");
    expect(title).toBeTruthy();
    expect(title!.textContent!.length).toBeGreaterThan(0);
    // The existing summary items still resolve inside the titled card.
    expect(summaryCard!.querySelector("#perio-fg-summary-avgpd")).toBeTruthy();
  });
});

describe("UI-1 Task 2: Páciens adatok metadata uses a labelled row structure", () => {
  it("every metadata control has an associated <label>", () => {
    renderSidebar();
    const controlIds = [
      "caseMetaPatientName",
      "caseMetaExamDate",
      "caseMetaAge",
      "caseMetaSmoking",
      "caseMetaCigarettesPerDay",
      "caseMetaDiabetes",
      "caseMetaHba1c",
      "caseMetaRbl",
      "caseMetaToothLoss",
    ];
    for (const id of controlIds) {
      const control = document.getElementById(id) as HTMLElement;
      expect(control).toBeTruthy();
      // Associated via a <label for=id> in the same row.
      const label = document.querySelector(`label[for="${id}"]`);
      expect(label, `expected a <label for="${id}"> to exist`).toBeTruthy();
    }
  });

  it("metadata rows use the two-column grid row class", () => {
    renderSidebar();
    const rows = document.querySelectorAll(".case-meta-row");
    // 9 metadata rows (patientName, examDate, age, smoking, cigs, diabetes, hba1c, rbl, toothLoss)
    expect(rows.length).toBe(9);
  });

  it("conditional fields (cigarettes/day, HbA1c) carry the disabled-row class when gated off", () => {
    renderSidebar();
    const cigsRow = document.getElementById("caseMetaCigarettesPerDay")!.closest(".case-meta-row");
    const hba1cRow = document.getElementById("caseMetaHba1c")!.closest(".case-meta-row");
    // Default case-meta: smoking=unknown, diabetes=unknown -> both gated off.
    expect(cigsRow!.className).toContain("case-meta-row-disabled");
    expect(hba1cRow!.className).toContain("case-meta-row-disabled");
  });
});

describe("UI-1 Task 2: case.panelTitle renamed", () => {
  it("resolves to the renamed 'Patient data' value (default test language: en)", () => {
    expect(t("case.panelTitle")).toBe("Patient data");
  });
});
