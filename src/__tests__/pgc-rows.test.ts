// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio PG-C Task 3: surface the T2 cejVisibility / rootConcavity data
// axes in the Dental Chart — two per-tooth cycle-button rows (mirrors the
// P2b furcation/plaque rows), each with an "i" info button (mirrors PG-B
// Task 1), plus tooltip + whole-mouth summary lines (mirrors PG-C Task 1's
// recession-type surfacing). Both axes have NO svgLayer (T2), so nothing
// here touches the live odontogram render — parity (svg-fingerprints/
// fhir-golden/roundtrip-golden) is unaffected.
//
// PerioChart is rendered directly (not via <App/>), mirroring
// perio-p2b-rows.test.ts / pgb-info-buttons.test.ts.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import PerioChart from "../PerioChart";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  getCejVisibility,
  getRootConcavity,
  getToothStateSummary,
  getOdontogramSummary,
} from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

function openOverlay() {
  return render(createElement(PerioChart, { open: true, onClose: () => {} }));
}
function openInline() {
  return render(createElement(PerioChart, { inline: true }));
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(() => {
  cleanup();
});

describe("PG-C Task 3: cejVisibility row", () => {
  it("a present natural tooth (16) has a cej-visibility control", () => {
    openOverlay();
    expect(document.getElementById("perio-fg-cej-16")).toBeTruthy();
  });

  it("clicking cycles none -> detectable -> not-detectable -> none, via setCejVisibility", () => {
    openOverlay();
    const btn = document.getElementById("perio-fg-cej-16") as HTMLButtonElement;
    expect(getCejVisibility(16)).toBe("none");
    fireEvent.click(btn);
    expect(getCejVisibility(16)).toBe("detectable");
    fireEvent.click(btn);
    expect(getCejVisibility(16)).toBe("not-detectable");
    fireEvent.click(btn);
    expect(getCejVisibility(16)).toBe("none");
  });

  it("a MISSING tooth's cej-visibility control is disabled", () => {
    __setToothStateForTest(21, { toothSelection: "none" });
    openOverlay();
    const btn = document.getElementById("perio-fg-cej-21") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("an IMPLANT tooth's cej-visibility control is disabled", () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    openOverlay();
    const btn = document.getElementById("perio-fg-cej-21") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("PG-C Task 3: rootConcavity row", () => {
  it("a present natural tooth (26) has a root-concavity control", () => {
    openOverlay();
    expect(document.getElementById("perio-fg-rootconcavity-26")).toBeTruthy();
  });

  it("clicking cycles none -> mild -> deep -> none, via setRootConcavity", () => {
    openOverlay();
    const btn = document.getElementById("perio-fg-rootconcavity-26") as HTMLButtonElement;
    expect(getRootConcavity(26)).toBe("none");
    fireEvent.click(btn);
    expect(getRootConcavity(26)).toBe("mild");
    fireEvent.click(btn);
    expect(getRootConcavity(26)).toBe("deep");
    fireEvent.click(btn);
    expect(getRootConcavity(26)).toBe("none");
  });

  it("a MISSING tooth's root-concavity control is disabled", () => {
    __setToothStateForTest(36, { toothSelection: "none" });
    openOverlay();
    const btn = document.getElementById("perio-fg-rootconcavity-36") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("an IMPLANT tooth's root-concavity control is disabled", () => {
    __setToothStateForTest(36, { toothSelection: "implant" });
    openOverlay();
    const btn = document.getElementById("perio-fg-rootconcavity-36") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("PG-C Task 3: rows exist on both chrome variants (overlay + inline)", () => {
  it("the modal overlay renders both rows", () => {
    openOverlay();
    const root = document.getElementById("perioOverlayGrid")!;
    expect(root.querySelector("#perio-fg-cej-16")).toBeTruthy();
    expect(root.querySelector("#perio-fg-rootconcavity-16")).toBeTruthy();
  });

  it("the inline panel renders both rows", () => {
    openInline();
    const root = document.getElementById("perioInlineGrid")!;
    expect(root.querySelector("#perio-fg-cej-16")).toBeTruthy();
    expect(root.querySelector("#perio-fg-rootconcavity-16")).toBeTruthy();
  });
});

describe("PG-C Task 3: info buttons", () => {
  it("the CEJ-visibility row's info button opens a popover with t(\"perio.info.cej\")", () => {
    openInline();
    const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
    const target = rowLabels.find((el) => el.textContent?.includes(t("perio.cej.label")));
    const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    const popover = document.querySelector(".perio-info-popover");
    expect(popover).toBeTruthy();
    expect(popover!.textContent).toBe(t("perio.info.cej"));
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("the root-concavity row's info button opens a popover with t(\"perio.info.rootConcavity\")", () => {
    openInline();
    const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
    const target = rowLabels.find((el) => el.textContent?.includes(t("perio.rootConcavity.label")));
    const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    const popover = document.querySelector(".perio-info-popover");
    expect(popover).toBeTruthy();
    expect(popover!.textContent).toBe(t("perio.info.rootConcavity"));
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("PG-C Task 3: tooltip + whole-mouth summary surface both axes", () => {
  it("getToothStateSummary includes the perio.cej.* line when cejVisibility is set", () => {
    openOverlay();
    fireEvent.click(document.getElementById("perio-fg-cej-16") as HTMLButtonElement); // -> detectable
    const lines = getToothStateSummary(16);
    expect(lines).toContain(t("perio.cej.detectable"));
  });

  it("getToothStateSummary omits the cej line when cejVisibility is 'none'", () => {
    const lines = getToothStateSummary(16);
    expect(lines).not.toContain(t("perio.cej.detectable"));
    expect(lines).not.toContain(t("perio.cej.notDetectable"));
  });

  it("getToothStateSummary includes the perio.rootConcavity.* line when rootConcavity is set", () => {
    openOverlay();
    const btn = document.getElementById("perio-fg-rootconcavity-16") as HTMLButtonElement;
    fireEvent.click(btn); // -> mild
    fireEvent.click(btn); // -> deep
    const lines = getToothStateSummary(16);
    expect(lines).toContain(t("perio.rootConcavity.deep"));
  });

  it("getToothStateSummary omits the root-concavity line when it is 'none'", () => {
    const lines = getToothStateSummary(16);
    expect(lines).not.toContain(t("perio.rootConcavity.mild"));
    expect(lines).not.toContain(t("perio.rootConcavity.deep"));
  });

  it("getOdontogramSummary's periodontalText surfaces both axes alongside other periodontal findings", () => {
    openOverlay();
    fireEvent.click(document.getElementById("perio-fg-cej-16") as HTMLButtonElement); // -> detectable
    const rcBtn = document.getElementById("perio-fg-rootconcavity-26") as HTMLButtonElement;
    fireEvent.click(rcBtn); // -> mild
    const summary = getOdontogramSummary();
    expect(summary.periodontalText).toContain(t("perio.cej.detectable"));
    expect(summary.periodontalText).toContain(t("perio.rootConcavity.mild"));
  });

  it("getOdontogramSummary's periodontalText is healthy when neither axis is set anywhere", () => {
    const summary = getOdontogramSummary();
    expect(summary.periodontalText).toBe(t("toothInfo.periodontalHealthy"));
  });
});
