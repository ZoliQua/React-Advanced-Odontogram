// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio PG-C Task 1: the derived Cairo (2011) recession-TYPE (RT1-3) —
// a DERIVED index computed purely from the already-charted per-site CAL
// (getToothCal) + the buccal gingival margin (perio.gm.get("B")). No new
// state axis, no storage, no payload/FHIR change — the overlay lives
// entirely in the perio-view DOM (Dental Chart), the live odontogram is
// untouched, so parity (svg-fingerprints/fhir-golden/roundtrip-golden) is
// unaffected. Nothing here needs the parity harness.
//
// Structure mirrors pgb-switcher.test.ts / pgb-mm-overlays.test.ts: the pure
// rule (getToothRecessionType) and pure geometry (perioCairoMarks) are
// tested in isolation, the arch integration is exercised against a
// hand-built template cache parsed from the REAL SVG assets (readFileSync +
// DOMParser, no fetch), and the switcher UI + tooltip/summary surfacing are
// exercised by rendering the real components/functions directly.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import PerioChart, { drawArchOverlay } from "../PerioChart";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  setPerioSite,
  getPerioOverlayLayer,
  setPerioOverlayLayer,
  getToothRecessionType,
  getToothStateSummary,
  getOdontogramSummary,
} from "../odontogram";
import {
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  perioCairoMarks,
  type TemplateDocCache,
  type TemplateNo,
} from "../perioGraphic";
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

// ---------------------------------------------------------------------------
// Pure rule (odontogram.ts): getToothRecessionType.
// ---------------------------------------------------------------------------
describe("PG-C Task 1: getToothRecessionType (pure rule)", () => {
  it("no perio charted at all -> 'none'", () => {
    expect(getToothRecessionType(16)).toBe("none");
  });

  it("buccal margin at/coronal to CEJ (gm.B <= 0) -> 'none'", () => {
    setPerioSite(16, "B", { pd: 3, gm: 0 });
    expect(getToothRecessionType(16)).toBe("none");
    setPerioSite(17, "B", { pd: 2, gm: -1 }); // pseudopocket, not recession
    expect(getToothRecessionType(17)).toBe("none");
  });

  it("buccal recession + no interproximal CAL charted -> 'rt1'", () => {
    setPerioSite(16, "B", { pd: 3, gm: 2 }); // CAL[B] = 5, MB/DB uncharted
    expect(getToothRecessionType(16)).toBe("rt1");
  });

  it("buccal recession + interproximal CAL below the RT1 threshold -> 'rt1'", () => {
    setPerioSite(16, "B", { pd: 3, gm: 2 }); // CAL[B] = 5
    setPerioSite(16, "MB", { pd: 1, gm: -1 }); // CAL[MB] = 0 (< 1mm threshold)
    expect(getToothRecessionType(16)).toBe("rt1");
  });

  it("interproximal CAL <= buccal CAL -> 'rt2'", () => {
    setPerioSite(16, "B", { pd: 3, gm: 2 }); // CAL[B] = 5
    setPerioSite(16, "MB", { pd: 2, gm: 1 }); // CAL[MB] = 3 <= 5
    expect(getToothRecessionType(16)).toBe("rt2");
  });

  it("interproximal CAL == buccal CAL (boundary) -> 'rt2'", () => {
    setPerioSite(16, "B", { pd: 3, gm: 1 }); // CAL[B] = 4
    setPerioSite(16, "DB", { pd: 3, gm: 1 }); // CAL[DB] = 4 == 4
    expect(getToothRecessionType(16)).toBe("rt2");
  });

  it("interproximal CAL > buccal CAL -> 'rt3'", () => {
    setPerioSite(16, "B", { pd: 2, gm: 1 }); // CAL[B] = 3
    setPerioSite(16, "MB", { pd: 3, gm: 3 }); // CAL[MB] = 6 > 3
    expect(getToothRecessionType(16)).toBe("rt3");
  });

  it("uses the WORSE of MB/DB (max) for interprox", () => {
    setPerioSite(16, "B", { pd: 2, gm: 1 }); // CAL[B] = 3
    setPerioSite(16, "MB", { pd: 1, gm: 0 }); // CAL[MB] = 1 (<=3 -> would be rt2 alone)
    setPerioSite(16, "DB", { pd: 3, gm: 3 }); // CAL[DB] = 6 (>3 -> rt3)
    expect(getToothRecessionType(16)).toBe("rt3");
  });

  it("un-charting the buccal site (pd cleared) reverts to 'none'", () => {
    setPerioSite(16, "B", { pd: 3, gm: 2 });
    expect(getToothRecessionType(16)).toBe("rt1");
    setPerioSite(16, "B", { pd: null });
    expect(getToothRecessionType(16)).toBe("none");
  });
});

// ---------------------------------------------------------------------------
// Pure geometry (perioGraphic.ts): perioCairoMarks.
// ---------------------------------------------------------------------------
describe("PG-C Task 1: perioCairoMarks (pure geometry)", () => {
  const opts = { cejY: 40 };

  it("one centered mark per tooth with a non-'none' RT; 'none' yields no mark", () => {
    const teeth = [
      { x: 0, width: 40, rt: "rt1" as const },
      { x: 40, width: 40, rt: "none" as const },
      { x: 80, width: 40, rt: "rt3" as const },
    ];
    const marks = perioCairoMarks(teeth, opts);
    expect(marks.length).toBe(2);
    expect(marks[0]).toEqual({ x: 0 + 40 * 0.5, y: 40, kind: "rt1" });
    expect(marks[1]).toEqual({ x: 80 + 40 * 0.5, y: 40, kind: "rt3" });
  });

  it("an all-'none' tooth list yields no marks", () => {
    const teeth = [{ x: 0, width: 40, rt: "none" as const }];
    expect(perioCairoMarks(teeth, opts)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Integration: drawArchOverlay("cairo") appends marks into the buccal
// oriented row group only (Cairo RT is a buccal-recession index); None
// clears; parity byte-identical (perio-view DOM only).
// ---------------------------------------------------------------------------
describe("PG-C Task 1: drawArchOverlay integration (real templates)", () => {
  const cache = buildCache();

  function mountArch(): HTMLDivElement {
    const container = document.createElement("div");
    container.appendChild(buildBuccalArchSvg(cache, UPPER_ARCH));
    container.appendChild(buildPalatalArchSvg(cache, UPPER_ARCH));
    return container;
  }

  it("renders one RT-classed mark for each tooth with a derived RT, buccal row only", () => {
    const container = mountArch();
    setPerioSite(16, "B", { pd: 3, gm: 2 }); // rt1
    setPerioSite(17, "B", { pd: 2, gm: 1 }); // CAL[B]=3
    setPerioSite(17, "MB", { pd: 3, gm: 3 }); // CAL[MB]=6 -> rt3
    expect(getToothRecessionType(16)).toBe("rt1");
    expect(getToothRecessionType(17)).toBe("rt3");

    drawArchOverlay(cache, container, UPPER_ARCH, "cairo");

    const buccalGroup = container.querySelector(".perio-tooth-row-buccal")!;
    const palatalGroup = container.querySelector(".perio-tooth-row-palatal-inner")!;
    const buccalOverlay = buccalGroup.querySelector(".perio-overlay-layer")!;
    expect(buccalOverlay).toBeTruthy();
    expect(buccalOverlay.getAttribute("aria-hidden")).toBe("true");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-rt1").length).toBe(1);
    expect(buccalOverlay.querySelectorAll(".perio-overlay-rt3").length).toBe(1);
    // Cairo RT is buccal-only -> no overlay layer appended to the palatal row.
    expect(palatalGroup.querySelector(".perio-overlay-layer")).toBeNull();
  });

  it("a tooth with no recession produces no mark", () => {
    const container = mountArch();
    setPerioSite(16, "B", { pd: 3, gm: 0 }); // charted, no recession -> 'none'

    drawArchOverlay(cache, container, UPPER_ARCH, "cairo");

    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.querySelectorAll(".perio-overlay-mark").length).toBe(0);
  });

  it("None clears any previously-drawn Cairo overlay", () => {
    const container = mountArch();
    setPerioSite(16, "B", { pd: 3, gm: 2 });
    drawArchOverlay(cache, container, UPPER_ARCH, "cairo");
    expect(container.querySelector(".perio-overlay-layer")).toBeTruthy();

    drawArchOverlay(cache, container, UPPER_ARCH, "none");
    expect(container.querySelector(".perio-overlay-layer")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Switcher UI (PerioChart inline): #perioOverlaySwitch offers a "cairo"
// button; selecting it drives getPerioOverlayLayer.
// ---------------------------------------------------------------------------
describe("PG-C Task 1: #perioOverlaySwitch offers Cairo", () => {
  function openInline() {
    return render(createElement(PerioChart, { inline: true }));
  }

  it("renders a Cairo button labeled via perio.overlay.cairo", () => {
    openInline();
    const sw = document.getElementById("perioOverlaySwitch")!;
    const btn = sw.querySelector('[data-overlay-layer="cairo"]');
    expect(btn).toBeTruthy();
    expect(btn!.textContent).toBe(t("perio.overlay.cairo"));
  });

  it("clicking Cairo selects it (getPerioOverlayLayer + active state)", () => {
    openInline();
    const cairoBtn = document.querySelector('[data-overlay-layer="cairo"]') as HTMLButtonElement;
    act(() => { fireEvent.click(cairoBtn); });
    expect(getPerioOverlayLayer()).toBe("cairo");
    expect(cairoBtn.getAttribute("aria-checked")).toBe("true");
  });

  it("selecting None after Cairo clears the active selection", () => {
    openInline();
    const cairoBtn = document.querySelector('[data-overlay-layer="cairo"]') as HTMLButtonElement;
    act(() => { fireEvent.click(cairoBtn); });
    expect(getPerioOverlayLayer()).toBe("cairo");
    const noneBtn = document.querySelector('[data-overlay-layer="none"]') as HTMLButtonElement;
    act(() => { fireEvent.click(noneBtn); });
    expect(getPerioOverlayLayer()).toBe("none");
  });
});

// ---------------------------------------------------------------------------
// Tooltip / whole-mouth summary surfacing (odontogram.ts).
// ---------------------------------------------------------------------------
describe("PG-C Task 1: tooltip + whole-mouth summary surface the RT", () => {
  it("getToothStateSummary includes the perio.recession.rtN line when RT is derived", () => {
    setPerioSite(16, "B", { pd: 3, gm: 2 }); // rt1
    const lines = getToothStateSummary(16);
    expect(lines).toContain(t("perio.recession.rt1"));
  });

  it("getToothStateSummary omits the line when RT is 'none'", () => {
    setPerioSite(16, "B", { pd: 3, gm: 0 });
    const lines = getToothStateSummary(16);
    expect(lines.some((l) => l === t("perio.recession.rt1") || l === t("perio.recession.rt2") || l === t("perio.recession.rt3"))).toBe(false);
  });

  it("getOdontogramSummary's periodontalText surfaces the RT alongside other periodontal findings", () => {
    setPerioSite(16, "B", { pd: 2, gm: 1 });
    setPerioSite(16, "MB", { pd: 3, gm: 3 }); // rt3
    const summary = getOdontogramSummary();
    expect(summary.periodontalText).toContain(t("perio.recession.rt3"));
  });
});
