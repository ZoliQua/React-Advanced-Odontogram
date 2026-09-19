// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// PG-B Task 1: a small "i" info button on each perio row label
// (`mkRowLabelCell` in PerioChart.tsx) that opens a lightweight popover
// explaining that index. Self-contained (user #2) — NO switcher/overlay
// layers (that's T2/T3 of the PG-B arc). Perio-view DOM only; the live
// odontogram / SVG render / payload / FHIR are all untouched by this task,
// so parity (svg-fingerprints/fhir-golden/roundtrip-golden) is unaffected —
// nothing here needs the parity harness.
//
// PerioChart is rendered directly (not via <App/>), mirroring
// perio-p2-grid.test.ts / perio-p2b-rows.test.ts — nothing exercised here
// needs a live initOdontogram()/SVG-grid mount.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import PerioChart from "../PerioChart";
import { __resetChartStateForTest, __setToothStateForTest, setNumberingSystem } from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

function openInline() {
  return render(createElement(PerioChart, { inline: true }));
}

function openOverlay() {
  return render(createElement(PerioChart, { open: true, onClose: () => {} }));
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  // UI-3b Task 3: mPI/mBI additionally gate on the arch having an implant
  // (see ui3b-mpi-implant-gate.test.ts) — set one in EACH arch so both rows
  // render in both arches, matching this file's BUTTONS_PER_ARCH*2 counts.
  __setToothStateForTest(16, { toothSelection: "implant" });
  __setToothStateForTest(46, { toothSelection: "implant" });
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

// One arch's labelled rows: plaque(1) + bop(buccal+palatal) + cal(buccal+
// palatal) + gm(buccal+palatal) + pd(buccal+palatal) + furcation(1) +
// mobility(1) + cejVisibility(1) + rootConcavity(1) [SP-perio PG-C Task 3] +
// pi(1) + gi(1) + kg(1) + gt(1) + miller(1) [SP-perio PG-D Task 4] +
// mpi(1) + mbi(1) [SP-perio PG-E Task 2] = 20. Two arches (upper+lower) =>
// 40 total. The tooth-number header row and the tooth-graphic placeholder
// row have NO label/infoKey and so get no button.
const BUTTONS_PER_ARCH = 20;

describe("PG-B Task 1: .perio-info-btn on every labelled row", () => {
  it("every labelled row-label cell has exactly one .perio-info-btn", () => {
    openInline();
    const grid = document.getElementById("perioInlineGrid")!;
    expect(grid).toBeTruthy();
    const buttons = grid.querySelectorAll(".perio-info-btn");
    expect(buttons.length).toBe(BUTTONS_PER_ARCH * 2);
  });

  it("the tooth-number header row and the tooth-graphic row have no info button", () => {
    openInline();
    const grid = document.getElementById("perioInlineGrid")!;

    // Every arch's flat grid appends the row-label immediately before that
    // row's first tooth cell (no per-row wrapper element), so the FIRST
    // header cell's previous sibling is its row's label.
    const firstHeaderCell = grid.querySelector("[data-perio-tooth-header]")!;
    const headerRowLabel = firstHeaderCell.previousElementSibling as HTMLElement | null;
    expect(headerRowLabel?.classList.contains("perio-fullgrid-row-label")).toBe(true);
    expect(headerRowLabel?.querySelector(".perio-info-btn")).toBeNull();

    // The graphic placeholder row-label sits right before .perio-fullgrid-graphic-cell.
    const graphicCell = grid.querySelector('[data-perio-arch="upper"]')!;
    const graphicRowLabel = graphicCell.previousElementSibling as HTMLElement | null;
    expect(graphicRowLabel?.classList.contains("perio-fullgrid-row-label")).toBe(true);
    expect(graphicRowLabel?.querySelector(".perio-info-btn")).toBeNull();
  });

  it("each info button has a non-empty, real aria-label", () => {
    openInline();
    const grid = document.getElementById("perioInlineGrid")!;
    const buttons = Array.from(grid.querySelectorAll(".perio-info-btn"));
    expect(buttons.length).toBeGreaterThan(0);
    for (const btn of buttons) {
      const label = btn.getAttribute("aria-label");
      expect(label).toBeTruthy();
      expect(label!.trim().length).toBeGreaterThan(0);
    }
  });

  it("an info button starts collapsed (aria-expanded=false, aria-haspopup=dialog)", () => {
    openInline();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.getAttribute("aria-haspopup")).toBe("dialog");
  });
});

describe("PG-B Task 1: clicking an info button opens the right popover text", () => {
  const cases: Array<{ field: string; infoKey: string }> = [
    { field: "plaque", infoKey: "perio.info.plaque" },
    { field: "furcation", infoKey: "perio.info.furcation" },
    { field: "mobility", infoKey: "perio.info.mobility" },
  ];

  for (const { field, infoKey } of cases) {
    it(`${field} row's info button opens a popover with t("${infoKey}")`, () => {
      openInline();
      const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
      const target = field === "plaque"
        ? rowLabels.find((el) => el.textContent?.includes(t("plaque.label")))
        : field === "furcation"
        ? rowLabels.find((el) => el.textContent?.includes(t("furcation.label")))
        : rowLabels.find((el) => el.textContent?.includes(t("perio.mobility")));
      const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
      expect(btn).toBeTruthy();
      fireEvent.click(btn);

      const popover = document.querySelector(".perio-info-popover");
      expect(popover).toBeTruthy();
      expect(popover!.textContent).toBe(t(infoKey));
      expect(btn.getAttribute("aria-expanded")).toBe("true");
    });
  }

  it("every PD row (buccal + palatal/lingual, both arches) opens perio.info.pd", () => {
    openInline();
    const pdRows = Array.from(document.querySelectorAll(".perio-fullgrid-row-label")).filter((el) =>
      el.textContent?.includes(t("perio.pd")),
    );
    // 2 aspects (buccal + palatal/lingual) x 2 arches (upper + lower) = 4.
    expect(pdRows.length).toBe(4);
    for (const row of pdRows) {
      const btn = row.querySelector(".perio-info-btn") as HTMLButtonElement;
      fireEvent.click(btn);
      const popover = document.querySelector(".perio-info-popover");
      expect(popover!.textContent).toBe(t("perio.info.pd"));
      fireEvent.click(btn); // close again before the next iteration (toggle)
    }
  });

  it("GM/CAL/BOP rows open perio.info.gm/.cal/.bop respectively", () => {
    openInline();
    const findRow = (labelSubstr: string) =>
      Array.from(document.querySelectorAll(".perio-fullgrid-row-label")).find((el) =>
        el.textContent?.includes(labelSubstr),
      )!;

    const gmBtn = findRow(t("perio.gm")).querySelector(".perio-info-btn") as HTMLButtonElement;
    fireEvent.click(gmBtn);
    expect(document.querySelector(".perio-info-popover")!.textContent).toBe(t("perio.info.gm"));

    const calBtn = findRow(t("perio.cal")).querySelector(".perio-info-btn") as HTMLButtonElement;
    fireEvent.click(calBtn);
    expect(document.querySelector(".perio-info-popover")!.textContent).toBe(t("perio.info.cal"));

    const bopBtn = findRow(t("perio.bop")).querySelector(".perio-info-btn") as HTMLButtonElement;
    fireEvent.click(bopBtn);
    expect(document.querySelector(".perio-info-popover")!.textContent).toBe(t("perio.info.bop"));
  });
});

describe("SP-perio PG-D Task 4: the five new info buttons resolve their keys", () => {
  const cases: Array<{ rowKey: string; infoKey: string }> = [
    { rowKey: "perio.pi.row", infoKey: "perio.info.pi" },
    { rowKey: "perio.gi.row", infoKey: "perio.info.gi" },
    { rowKey: "perio.kg.row", infoKey: "perio.info.kg" },
    { rowKey: "perio.gt.row", infoKey: "perio.info.gt" },
    { rowKey: "perio.miller.row", infoKey: "perio.info.miller" },
  ];

  for (const { rowKey, infoKey } of cases) {
    it(`${rowKey}'s info button opens a popover with t("${infoKey}")`, () => {
      openInline();
      const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
      const target = rowLabels.find((el) => el.textContent?.includes(t(rowKey)));
      const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
      expect(btn).toBeTruthy();
      fireEvent.click(btn);
      const popover = document.querySelector(".perio-info-popover");
      expect(popover).toBeTruthy();
      expect(popover!.textContent).toBe(t(infoKey));
      expect(t(infoKey).trim().length).toBeGreaterThan(0);
    });
  }
});

describe("SP-perio PG-E Task 2: the two new mPI/mBI info buttons resolve their keys", () => {
  const cases: Array<{ rowKey: string; infoKey: string }> = [
    { rowKey: "perio.mpi.row", infoKey: "perio.info.mpi" },
    { rowKey: "perio.mbi.row", infoKey: "perio.info.mbi" },
  ];

  for (const { rowKey, infoKey } of cases) {
    it(`${rowKey}'s info button opens a popover with t("${infoKey}")`, () => {
      openInline();
      const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
      const target = rowLabels.find((el) => el.textContent?.includes(t(rowKey)));
      const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
      expect(btn).toBeTruthy();
      fireEvent.click(btn);
      const popover = document.querySelector(".perio-info-popover");
      expect(popover).toBeTruthy();
      expect(popover!.textContent).toBe(t(infoKey));
      expect(t(infoKey).trim().length).toBeGreaterThan(0);
    });
  }
});

describe("PG-B Task 1: dismissal + one-open-at-a-time", () => {
  it("click-away (mousedown outside the popover/button) dismisses it", () => {
    openInline();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(document.querySelector(".perio-info-popover")).toBeTruthy();

    fireEvent.mouseDown(document.body);

    expect(document.querySelector(".perio-info-popover")).toBeNull();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("clicking inside the popover itself does NOT dismiss it", () => {
    openInline();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    fireEvent.click(btn);
    const popover = document.querySelector(".perio-info-popover") as HTMLElement;
    expect(popover).toBeTruthy();

    fireEvent.mouseDown(popover);

    expect(document.querySelector(".perio-info-popover")).toBeTruthy();
  });

  it("Escape dismisses the open popover", () => {
    openInline();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(document.querySelector(".perio-info-popover")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(document.querySelector(".perio-info-popover")).toBeNull();
  });

  it("Escape closes ONLY the popover, not the whole perio-overlay dialog (no DS-1-style stacking conflict)", () => {
    openOverlay();
    const dialog = document.getElementById("perioOverlay");
    expect(dialog).toBeTruthy();
    const btn = dialog!.querySelector(".perio-info-btn") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(document.querySelector(".perio-info-popover")).toBeTruthy();

    // Fire from an element INSIDE #perioOverlay so the event actually traverses the
    // overlay's DOM subtree — this genuinely exercises the capture-phase interception
    // (a keyDown on `document` would pass trivially, never reaching the dialog handler).
    fireEvent.keyDown(btn, { key: "Escape" });

    // The popover is gone, but the overlay dialog itself is still open.
    expect(document.querySelector(".perio-info-popover")).toBeNull();
    expect(document.getElementById("perioOverlay")).toBeTruthy();
  });

  it("clicking a second row's info button closes the first popover (only one open at a time)", () => {
    openInline();
    const rows = Array.from(document.querySelectorAll(".perio-fullgrid-row-label")).filter((el) =>
      el.querySelector(".perio-info-btn"),
    );
    const btnA = rows[0].querySelector(".perio-info-btn") as HTMLButtonElement;
    const btnB = rows[1].querySelector(".perio-info-btn") as HTMLButtonElement;

    fireEvent.click(btnA);
    expect(document.querySelectorAll(".perio-info-popover").length).toBe(1);
    expect(btnA.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(btnB);
    expect(document.querySelectorAll(".perio-info-popover").length).toBe(1);
    expect(btnA.getAttribute("aria-expanded")).toBe("false");
    expect(btnB.getAttribute("aria-expanded")).toBe("true");
  });

  it("clicking the SAME button twice toggles the popover closed", () => {
    openInline();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(document.querySelector(".perio-info-popover")).toBeTruthy();

    fireEvent.click(btn);
    expect(document.querySelector(".perio-info-popover")).toBeNull();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("unmounting the grid while a popover is open removes the (body-appended) popover too", () => {
    const { unmount } = openInline();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(document.querySelector(".perio-info-popover")).toBeTruthy();

    act(() => {
      unmount();
    });

    expect(document.querySelector(".perio-info-popover")).toBeNull();
  });
});

describe("PG-B Task 1: popover accessibility", () => {
  it("the popover carries role=dialog and a non-modal aria-modal", () => {
    openInline();
    const btn = document.querySelector(".perio-info-btn") as HTMLButtonElement;
    fireEvent.click(btn);
    const popover = document.querySelector(".perio-info-popover")!;
    expect(popover.getAttribute("role")).toBe("dialog");
    expect(popover.getAttribute("aria-modal")).toBe("false");
  });
});
