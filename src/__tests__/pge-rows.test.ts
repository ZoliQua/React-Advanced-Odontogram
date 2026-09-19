// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio PG-E Task 2: surface the Task 1 mPI/mBI (Mombelli modified
// Plaque/Bleeding indices) data axes in the Dental Chart — two per-surface
// graded (0-3) cycle-button rows mirroring PG-D's PI/GI rows exactly
// (buildGradeCell), but IMPLANT-GATED: the cells are only ACTIVE on an
// implant tooth (inert everywhere else, including a present natural tooth) —
// the opposite of PI/GI/plaque's hidden-row gate, since implants are exactly
// the teeth those axes disable. Plus two new index-switcher overlay layers
// (mpi/mbi) reusing perioGradeMarks, and the info popups + i18n. See
// .superpowers/sdd/2026-07-31-odontogram-pge-peri-implant-indices/task-2-brief.md.
//
// Neither axis has an svgLayer (Task 1), so nothing here touches the live
// odontogram render — parity (svg-fingerprints/fhir-golden/roundtrip-golden)
// is unaffected.
//
// Structure mirrors pgd-rows.test.ts: PerioChart is rendered directly (not
// via <App/>), and the overlay integration is exercised against a hand-built
// template cache parsed from the REAL SVG assets (readFileSync + DOMParser,
// no fetch).
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import PerioChart, { drawArchOverlay } from "../PerioChart";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  getPeriImplantPlaque,
  setPeriImplantPlaque,
  getPeriImplantBleeding,
  setPeriImplantBleeding,
  getPerioOverlayLayer,
  setPerioOverlayLayer,
} from "../odontogram";
import { buildBuccalArchSvg, buildPalatalArchSvg, type TemplateDocCache, type TemplateNo } from "../perioGraphic";
import { setI18nLanguage, t } from "../i18n/useI18n";

const testFileUrl = import.meta.url;
const svgText = (tplNo: TemplateNo) =>
  readFileSync(fileURLToPath(new URL(`../assets/teeth-svgs/${tplNo}.svg`, testFileUrl)), "utf8");
const TEMPLATE_NOS: readonly TemplateNo[] = [11, 13, 14, 16];
function buildCache(): TemplateDocCache {
  const cache: TemplateDocCache = new Map();
  for (const tplNo of TEMPLATE_NOS) {
    cache.set(tplNo, new DOMParser().parseFromString(svgText(tplNo), "image/svg+xml"));
  }
  return cache;
}

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];

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
  setPerioOverlayLayer("none");
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  setPerioOverlayLayer("none");
});

describe("PG-E Task 2: row labels render", () => {
  it("both mPI and mBI rows are labeled (both arches, inline chrome)", () => {
    // UI-3b Task 3: mPI/mBI additionally gate per-arch on that arch having an
    // implant (see ui3b-mpi-implant-gate.test.ts) — set one in EACH arch so
    // both rows render in both arches.
    __setToothStateForTest(16, { toothSelection: "implant" }); // upper
    __setToothStateForTest(46, { toothSelection: "implant" }); // lower
    openInline();
    const grid = document.getElementById("perioInlineGrid")!;
    const labels = Array.from(grid.querySelectorAll(".perio-fullgrid-row-label-text")).map((el) => el.textContent);
    for (const key of ["perio.mpi.row", "perio.mbi.row"]) {
      const text = t(key);
      expect(labels.filter((l) => l === text).length).toBe(2); // upper + lower arch
    }
  });

  it("both rows exist in the modal overlay chrome too, for an implant tooth", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    openOverlay();
    const root = document.getElementById("perioOverlayGrid")!;
    expect(root.querySelector("#perio-fg-mpi-16-buccal")).toBeTruthy();
    expect(root.querySelector("#perio-fg-mbi-16-buccal")).toBeTruthy();
  });
});

describe("PG-E Task 2: implant gate — active on an implant tooth, inert on a natural tooth", () => {
  it("an IMPLANT tooth's mPI/mBI cells are ENABLED", () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    openOverlay();
    const mpiBtn = document.getElementById("perio-fg-mpi-21-buccal") as HTMLButtonElement;
    const mbiBtn = document.getElementById("perio-fg-mbi-21-buccal") as HTMLButtonElement;
    expect(mpiBtn.disabled).toBe(false);
    expect(mbiBtn.disabled).toBe(false);
  });

  it("a NATURAL (present, default) tooth's mPI/mBI cells are DISABLED", () => {
    // Tooth 16 is never touched -> defaults to a present natural tooth.
    // UI-3b Task 3: mPI/mBI rows only render in an arch with an implant, so
    // give the (same, upper) arch an implant elsewhere (17) to make the row
    // exist while keeping 16 itself natural/inert.
    __setToothStateForTest(17, { toothSelection: "implant" });
    openOverlay();
    const mpiBtn = document.getElementById("perio-fg-mpi-16-buccal") as HTMLButtonElement;
    const mbiBtn = document.getElementById("perio-fg-mbi-16-buccal") as HTMLButtonElement;
    expect(mpiBtn.disabled).toBe(true);
    expect(mbiBtn.disabled).toBe(true);
  });

  it("a MISSING tooth's mPI/mBI cells are also DISABLED", () => {
    __setToothStateForTest(21, { toothSelection: "none" });
    // UI-3b Task 3: mPI/mBI rows only render in an arch with an implant, so
    // give the (same, upper) arch an implant elsewhere (16) to make the row
    // exist while keeping 21 itself missing/inert.
    __setToothStateForTest(16, { toothSelection: "implant" });
    openOverlay();
    const mpiBtn = document.getElementById("perio-fg-mpi-21-buccal") as HTMLButtonElement;
    expect(mpiBtn.disabled).toBe(true);
  });
});

describe("PG-E Task 2: mPI row (Mombelli modified Plaque Index, per-surface graded)", () => {
  it("clicking a surface button on an IMPLANT tooth cycles 0 -> 1 -> 2 -> 3 -> 0, via setPeriImplantPlaque", () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    openOverlay();
    const btn = document.getElementById("perio-fg-mpi-21-buccal") as HTMLButtonElement;
    expect(getPeriImplantPlaque(21, "buccal")).toBe(0);
    fireEvent.click(btn);
    expect(getPeriImplantPlaque(21, "buccal")).toBe(1);
    fireEvent.click(btn);
    expect(getPeriImplantPlaque(21, "buccal")).toBe(2);
    fireEvent.click(btn);
    expect(getPeriImplantPlaque(21, "buccal")).toBe(3);
    fireEvent.click(btn);
    expect(getPeriImplantPlaque(21, "buccal")).toBe(0);
  });

  it("each of the 4 O'Leary surfaces has its own independent button", () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    openOverlay();
    for (const surface of ["mesial", "distal", "buccal", "lingual"]) {
      expect(document.getElementById(`perio-fg-mpi-21-${surface}`)).toBeTruthy();
    }
    fireEvent.click(document.getElementById("perio-fg-mpi-21-mesial") as HTMLButtonElement);
    expect(getPeriImplantPlaque(21, "mesial")).toBe(1);
    expect(getPeriImplantPlaque(21, "distal")).toBe(0);
  });
});

describe("PG-E Task 2: mBI row (Mombelli modified sulcus Bleeding Index, per-surface graded)", () => {
  it("clicking a surface button on an IMPLANT tooth cycles 0 -> 1 -> 2 -> 3 -> 0, via setPeriImplantBleeding", () => {
    __setToothStateForTest(26, { toothSelection: "implant" });
    openOverlay();
    const btn = document.getElementById("perio-fg-mbi-26-mesial") as HTMLButtonElement;
    expect(getPeriImplantBleeding(26, "mesial")).toBe(0);
    fireEvent.click(btn);
    expect(getPeriImplantBleeding(26, "mesial")).toBe(1);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(getPeriImplantBleeding(26, "mesial")).toBe(3);
    fireEvent.click(btn);
    expect(getPeriImplantBleeding(26, "mesial")).toBe(0);
  });
});

describe("PG-E Task 2: info buttons open the right popover", () => {
  const cases: Array<{ rowKey: string; infoKey: string }> = [
    { rowKey: "perio.mpi.row", infoKey: "perio.info.mpi" },
    { rowKey: "perio.mbi.row", infoKey: "perio.info.mbi" },
  ];
  for (const { rowKey, infoKey } of cases) {
    it(`${rowKey}'s info button opens a popover with t("${infoKey}")`, () => {
      // UI-3b Task 3: mPI/mBI rows only render in an arch with an implant.
      __setToothStateForTest(16, { toothSelection: "implant" });
      openInline();
      const rowLabels = Array.from(document.querySelectorAll(".perio-fullgrid-row-label"));
      const target = rowLabels.find((el) => el.textContent?.includes(t(rowKey)));
      const btn = target!.querySelector(".perio-info-btn") as HTMLButtonElement;
      expect(btn).toBeTruthy();
      fireEvent.click(btn);
      const popover = document.querySelector(".perio-info-popover");
      expect(popover).toBeTruthy();
      expect(popover!.textContent).toBe(t(infoKey));
    });
  }
});

// ---------------------------------------------------------------------------
// Index switcher + overlays: mpi/mbi select + draw without throwing.
// ---------------------------------------------------------------------------
describe("PG-E Task 2: #perioOverlaySwitch offers mPI/mBI", () => {
  it("renders a button for mpi/mbi alongside the existing layers", () => {
    openInline();
    const sw = document.getElementById("perioOverlaySwitch")!;
    for (const layer of ["mpi", "mbi"]) {
      const btn = sw.querySelector(`[data-overlay-layer="${layer}"]`);
      expect(btn, layer).toBeTruthy();
      expect(btn!.textContent).toBe(t(`perio.overlay.${layer}`));
    }
  });

  it("clicking mPI selects it (getPerioOverlayLayer + active state)", () => {
    openInline();
    const btn = document.querySelector('[data-overlay-layer="mpi"]') as HTMLButtonElement;
    act(() => { fireEvent.click(btn); });
    expect(getPerioOverlayLayer()).toBe("mpi");
    expect(btn.getAttribute("aria-checked")).toBe("true");
  });

  it("clicking mBI then None switches the active selection cleanly", () => {
    openInline();
    const mbiBtn = document.querySelector('[data-overlay-layer="mbi"]') as HTMLButtonElement;
    act(() => { fireEvent.click(mbiBtn); });
    expect(getPerioOverlayLayer()).toBe("mbi");
    expect(mbiBtn.getAttribute("aria-checked")).toBe("true");

    const noneBtn = document.querySelector('[data-overlay-layer="none"]') as HTMLButtonElement;
    act(() => { fireEvent.click(noneBtn); });
    expect(getPerioOverlayLayer()).toBe("none");
    expect(mbiBtn.getAttribute("aria-checked")).toBe("false");
  });
});

describe("PG-E Task 2: drawArchOverlay integration (real templates)", () => {
  const cache = buildCache();

  function mountArch(): HTMLDivElement {
    const container = document.createElement("div");
    container.appendChild(buildBuccalArchSvg(cache, UPPER_ARCH));
    container.appendChild(buildPalatalArchSvg(cache, UPPER_ARCH));
    return container;
  }

  it("mPI heat-colours every charted surface on an implant tooth, split across buccal/palatal rows, aria-hidden", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    const container = mountArch();
    setPeriImplantPlaque(16, "buccal", 1);
    setPeriImplantPlaque(16, "mesial", 2);
    setPeriImplantPlaque(16, "lingual", 3);

    expect(() => drawArchOverlay(cache, container, UPPER_ARCH, "mpi")).not.toThrow();

    const buccalGroup = container.querySelector(".perio-tooth-row-buccal")!;
    const palatalGroup = container.querySelector(".perio-tooth-row-palatal-inner")!;
    const buccalOverlay = buccalGroup.querySelector(".perio-overlay-layer")!;
    const palatalOverlay = palatalGroup.querySelector(".perio-overlay-layer")!;
    expect(buccalOverlay).toBeTruthy();
    expect(buccalOverlay.getAttribute("aria-hidden")).toBe("true");
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-mpi");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-shallow").length).toBe(1);
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-moderate").length).toBe(1);
    expect(palatalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
  });

  it("mBI heat-colours the charted surfaces the same way", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    const container = mountArch();
    setPeriImplantBleeding(16, "distal", 3);

    expect(() => drawArchOverlay(cache, container, UPPER_ARCH, "mbi")).not.toThrow();
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-mbi");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
  });

  it("a non-implant tooth produces no mark (mpi/mbi are implant-only data)", () => {
    // Tooth 16 stays a default (natural) tooth here — setPeriImplantPlaque is
    // a data-layer no-op on it, so nothing is ever charted to draw.
    const container = mountArch();
    setPeriImplantPlaque(16, "buccal", 2);
    expect(getPeriImplantPlaque(16, "buccal")).toBe(0); // confirms the no-op
    drawArchOverlay(cache, container, UPPER_ARCH, "mpi");
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.querySelectorAll(".perio-overlay-mark").length).toBe(0);
  });

  it("switching to None clears a previously-drawn mpi/mbi overlay", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    const container = mountArch();
    setPeriImplantPlaque(16, "buccal", 2);
    drawArchOverlay(cache, container, UPPER_ARCH, "mpi");
    expect(container.querySelector(".perio-overlay-layer")).toBeTruthy();

    drawArchOverlay(cache, container, UPPER_ARCH, "none");
    expect(container.querySelector(".perio-overlay-layer")).toBeNull();
  });
});

describe("PG-E Task 2: overlay read-out consolidation", () => {
  it("selecting mpi/mbi shows the whole-mouth score read-out (stopgap '—' until Task 3)", () => {
    openInline();
    const mpiBtn = document.querySelector('[data-overlay-layer="mpi"]') as HTMLButtonElement;
    act(() => { fireEvent.click(mpiBtn); });
    const readout = document.getElementById("perioOverlayReadout");
    expect(readout).toBeTruthy();
    expect(readout!.textContent).toBe(`${t("perio.overlay.mpi")} —`);

    const mbiBtn = document.querySelector('[data-overlay-layer="mbi"]') as HTMLButtonElement;
    act(() => { fireEvent.click(mbiBtn); });
    expect(document.getElementById("perioOverlayReadout")!.textContent).toBe(`${t("perio.overlay.mbi")} —`);
  });

  it("selecting pi/gi/kg also shows a read-out now (closes the PG-D gap)", () => {
    openInline();
    const piBtn = document.querySelector('[data-overlay-layer="pi"]') as HTMLButtonElement;
    act(() => { fireEvent.click(piBtn); });
    expect(document.getElementById("perioOverlayReadout")).toBeTruthy();

    const kgBtn = document.querySelector('[data-overlay-layer="kg"]') as HTMLButtonElement;
    act(() => { fireEvent.click(kgBtn); });
    const readout = document.getElementById("perioOverlayReadout")!;
    expect(readout.textContent).toBe(`${t("perio.overlay.kg")} 0`);
  });
});
