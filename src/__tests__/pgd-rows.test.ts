// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio PG-D Task 4: surface the Task 1-3 PI/GI/KG/GT/Miller data axes in
// the Dental Chart — two per-surface graded (0-3) cycle-button rows (PI/GI,
// mirrors the O'Leary plaque row's 4-quadrant shape), one per-tooth mm number
// cell (KG, mirrors the pd/gm inputs but with no site subdivision), and two
// per-tooth cycle-button rows (GT/Miller, mirror the cejVisibility/
// rootConcavity precedent) — each with an "i" info button (mirrors PG-B
// Task 1) plus 3 new index-switcher overlay layers (pi/gi/kg; GT/Miller are
// categorical, rows-only, no overlay). See
// .superpowers/sdd/2026-07-31-odontogram-pgd-graded-indices-mucogingival/task-4-brief.md.
//
// None of the 5 axes has an svgLayer (Tasks 1-3), so nothing here touches the
// live odontogram render — parity (svg-fingerprints/fhir-golden/
// roundtrip-golden) is unaffected.
//
// Structure mirrors pgc-rows.test.ts (rows) + pgb-mm-overlays.test.ts /
// pgc-cairo.test.ts (overlay integration + switcher UI): PerioChart is
// rendered directly (not via <App/>), and the overlay integration is
// exercised against a hand-built template cache parsed from the REAL SVG
// assets (readFileSync + DOMParser, no fetch).
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
  getPlaqueIndex,
  setPlaqueIndex,
  getGingivalIndex,
  setGingivalIndex,
  getKeratinizedWidth,
  setKeratinizedWidth,
  getGingivalThickness,
  getMillerClass,
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

describe("PG-D Task 4: row labels render", () => {
  it("all five rows are labeled (both arches, inline chrome)", () => {
    openInline();
    const grid = document.getElementById("perioInlineGrid")!;
    const labels = Array.from(grid.querySelectorAll(".perio-fullgrid-row-label-text")).map((el) => el.textContent);
    for (const key of ["perio.pi.row", "perio.gi.row", "perio.kg.row", "perio.gt.row", "perio.miller.row"]) {
      const text = t(key);
      expect(labels.filter((l) => l === text).length).toBe(2); // upper + lower arch
    }
  });

  it("all five rows exist in the modal overlay chrome too", () => {
    openOverlay();
    const root = document.getElementById("perioOverlayGrid")!;
    expect(root.querySelector("#perio-fg-pi-16-buccal")).toBeTruthy();
    expect(root.querySelector("#perio-fg-gi-16-buccal")).toBeTruthy();
    expect(root.querySelector("#perio-fg-kg-16")).toBeTruthy();
    expect(root.querySelector("#perio-fg-gt-16")).toBeTruthy();
    expect(root.querySelector("#perio-fg-miller-16")).toBeTruthy();
  });
});

describe("PG-D Task 4: PI row (Silness-Löe Plaque Index, per-surface graded)", () => {
  it("clicking a surface button cycles 0 -> 1 -> 2 -> 3 -> 0, via setPlaqueIndex", () => {
    openOverlay();
    const btn = document.getElementById("perio-fg-pi-16-buccal") as HTMLButtonElement;
    expect(getPlaqueIndex(16, "buccal")).toBe(0);
    fireEvent.click(btn);
    expect(getPlaqueIndex(16, "buccal")).toBe(1);
    fireEvent.click(btn);
    expect(getPlaqueIndex(16, "buccal")).toBe(2);
    fireEvent.click(btn);
    expect(getPlaqueIndex(16, "buccal")).toBe(3);
    fireEvent.click(btn);
    expect(getPlaqueIndex(16, "buccal")).toBe(0);
  });

  it("each of the 4 O'Leary surfaces has its own independent button", () => {
    openOverlay();
    for (const surface of ["mesial", "distal", "buccal", "lingual"]) {
      expect(document.getElementById(`perio-fg-pi-16-${surface}`)).toBeTruthy();
    }
    fireEvent.click(document.getElementById("perio-fg-pi-16-mesial") as HTMLButtonElement);
    expect(getPlaqueIndex(16, "mesial")).toBe(1);
    expect(getPlaqueIndex(16, "distal")).toBe(0);
  });

  it("a MISSING tooth's PI buttons are disabled", () => {
    __setToothStateForTest(21, { toothSelection: "none" });
    openOverlay();
    const btn = document.getElementById("perio-fg-pi-21-buccal") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("an IMPLANT tooth's PI buttons are disabled", () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    openOverlay();
    const btn = document.getElementById("perio-fg-pi-21-buccal") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("PG-D Task 4: GI row (Löe-Silness Gingival Index, per-surface graded)", () => {
  it("clicking a surface button cycles 0 -> 1 -> 2 -> 3 -> 0, via setGingivalIndex", () => {
    openOverlay();
    const btn = document.getElementById("perio-fg-gi-26-mesial") as HTMLButtonElement;
    expect(getGingivalIndex(26, "mesial")).toBe(0);
    fireEvent.click(btn);
    expect(getGingivalIndex(26, "mesial")).toBe(1);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(getGingivalIndex(26, "mesial")).toBe(3);
    fireEvent.click(btn);
    expect(getGingivalIndex(26, "mesial")).toBe(0);
  });
});

describe("PG-D Task 4: KG row (keratinized gingiva width, per-tooth mm)", () => {
  it("a present natural tooth (16) has a KG mm cell", () => {
    openOverlay();
    expect(document.getElementById("perio-fg-kg-16")).toBeTruthy();
  });

  it("typing a value + change commits it via setKeratinizedWidth", () => {
    openOverlay();
    const input = document.getElementById("perio-fg-kg-16") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "4" } });
    expect(getKeratinizedWidth(16)).toBe(4);
  });

  it("an empty value clears it (null)", () => {
    openOverlay();
    const input = document.getElementById("perio-fg-kg-16") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "4" } });
    expect(getKeratinizedWidth(16)).toBe(4);
    fireEvent.change(input, { target: { value: "" } });
    expect(getKeratinizedWidth(16)).toBeNull();
  });

  it("a MISSING tooth's KG cell is disabled", () => {
    __setToothStateForTest(21, { toothSelection: "none" });
    openOverlay();
    const input = document.getElementById("perio-fg-kg-21") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});

describe("PG-D Task 4: GT row (gingival thickness)", () => {
  it("clicking cycles unknown -> thin -> medium -> thick -> unknown, via setGingivalThickness", () => {
    openOverlay();
    const btn = document.getElementById("perio-fg-gt-16") as HTMLButtonElement;
    expect(getGingivalThickness(16)).toBe("unknown");
    fireEvent.click(btn);
    expect(getGingivalThickness(16)).toBe("thin");
    fireEvent.click(btn);
    expect(getGingivalThickness(16)).toBe("medium");
    fireEvent.click(btn);
    expect(getGingivalThickness(16)).toBe("thick");
    fireEvent.click(btn);
    expect(getGingivalThickness(16)).toBe("unknown");
  });

  it("an IMPLANT tooth's GT control is disabled", () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    openOverlay();
    const btn = document.getElementById("perio-fg-gt-21") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("PG-D Task 4: Miller-class row", () => {
  it("clicking cycles none -> i -> ii -> iii -> iv -> none, via setMillerClass", () => {
    openOverlay();
    const btn = document.getElementById("perio-fg-miller-26") as HTMLButtonElement;
    expect(getMillerClass(26)).toBe("none");
    fireEvent.click(btn);
    expect(getMillerClass(26)).toBe("i");
    fireEvent.click(btn);
    expect(getMillerClass(26)).toBe("ii");
    fireEvent.click(btn);
    expect(getMillerClass(26)).toBe("iii");
    fireEvent.click(btn);
    expect(getMillerClass(26)).toBe("iv");
    fireEvent.click(btn);
    expect(getMillerClass(26)).toBe("none");
  });

  it("a MISSING tooth's Miller-class control is disabled", () => {
    __setToothStateForTest(36, { toothSelection: "none" });
    openOverlay();
    const btn = document.getElementById("perio-fg-miller-36") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("PG-D Task 4: info buttons open the right popover", () => {
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
    });
  }
});

// ---------------------------------------------------------------------------
// Index switcher + overlays: pi/gi/kg select + draw without throwing.
// ---------------------------------------------------------------------------
describe("PG-D Task 4: #perioOverlaySwitch offers PI/GI/KG", () => {
  it("renders a button for pi/gi/kg alongside the existing layers", () => {
    openInline();
    const sw = document.getElementById("perioOverlaySwitch")!;
    for (const layer of ["pi", "gi", "kg"]) {
      const btn = sw.querySelector(`[data-overlay-layer="${layer}"]`);
      expect(btn, layer).toBeTruthy();
      expect(btn!.textContent).toBe(t(`perio.overlay.${layer}`));
    }
  });

  it("clicking PI selects it (getPerioOverlayLayer + active state)", () => {
    openInline();
    const btn = document.querySelector('[data-overlay-layer="pi"]') as HTMLButtonElement;
    act(() => { fireEvent.click(btn); });
    expect(getPerioOverlayLayer()).toBe("pi");
    expect(btn.getAttribute("aria-checked")).toBe("true");
  });

  it("clicking GI then KG switches the active selection cleanly", () => {
    openInline();
    const giBtn = document.querySelector('[data-overlay-layer="gi"]') as HTMLButtonElement;
    act(() => { fireEvent.click(giBtn); });
    expect(getPerioOverlayLayer()).toBe("gi");

    const kgBtn = document.querySelector('[data-overlay-layer="kg"]') as HTMLButtonElement;
    act(() => { fireEvent.click(kgBtn); });
    expect(getPerioOverlayLayer()).toBe("kg");
    expect(kgBtn.getAttribute("aria-checked")).toBe("true");
    expect(giBtn.getAttribute("aria-checked")).toBe("false");
  });
});

describe("PG-D Task 4: drawArchOverlay integration (real templates)", () => {
  const cache = buildCache();

  function mountArch(): HTMLDivElement {
    const container = document.createElement("div");
    container.appendChild(buildBuccalArchSvg(cache, UPPER_ARCH));
    container.appendChild(buildPalatalArchSvg(cache, UPPER_ARCH));
    return container;
  }

  it("PI heat-colours every charted surface, split across buccal/palatal rows, aria-hidden", () => {
    const container = mountArch();
    setPlaqueIndex(16, "buccal", 1); // shallow, buccal aspect
    setPlaqueIndex(16, "mesial", 2); // moderate, buccal aspect
    setPlaqueIndex(16, "lingual", 3); // deep, lingual/palatal aspect

    expect(() => drawArchOverlay(cache, container, UPPER_ARCH, "pi")).not.toThrow();

    const buccalGroup = container.querySelector(".perio-tooth-row-buccal")!;
    const palatalGroup = container.querySelector(".perio-tooth-row-palatal-inner")!;
    const buccalOverlay = buccalGroup.querySelector(".perio-overlay-layer")!;
    const palatalOverlay = palatalGroup.querySelector(".perio-overlay-layer")!;
    expect(buccalOverlay).toBeTruthy();
    expect(buccalOverlay.getAttribute("aria-hidden")).toBe("true");
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-pi");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-shallow").length).toBe(1);
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-moderate").length).toBe(1);
    expect(palatalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
  });

  it("GI heat-colours the charted surfaces the same way", () => {
    const container = mountArch();
    setGingivalIndex(16, "distal", 3);

    drawArchOverlay(cache, container, UPPER_ARCH, "gi");
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-gi");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
  });

  it("a grade-0 (uncharted) surface produces no mark", () => {
    const container = mountArch();
    setPlaqueIndex(16, "buccal", 0);
    drawArchOverlay(cache, container, UPPER_ARCH, "pi");
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.querySelectorAll(".perio-overlay-mark").length).toBe(0);
  });

  it("KG draws one heat mark for a charted tooth, buccal row only", () => {
    const container = mountArch();
    setKeratinizedWidth(16, 1); // thin -> deep bucket

    expect(() => drawArchOverlay(cache, container, UPPER_ARCH, "kg")).not.toThrow();
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.getAttribute("class")).toContain("perio-overlay-kg");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-heat-deep").length).toBe(1);
    // KG is buccal-only — no overlay layer is appended to the palatal row at all.
    const palatalGroup = container.querySelector(".perio-tooth-row-palatal-inner")!;
    expect(palatalGroup.querySelector(".perio-overlay-layer")).toBeNull();
  });

  it("switching to None clears a previously-drawn pi/gi/kg overlay", () => {
    const container = mountArch();
    setPlaqueIndex(16, "buccal", 2);
    drawArchOverlay(cache, container, UPPER_ARCH, "pi");
    expect(container.querySelector(".perio-overlay-layer")).toBeTruthy();

    drawArchOverlay(cache, container, UPPER_ARCH, "none");
    expect(container.querySelector(".perio-overlay-layer")).toBeNull();
  });
});
