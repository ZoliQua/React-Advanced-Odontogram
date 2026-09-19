// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// PG-B Task 2: the Dental Chart index switcher (#perioOverlaySwitch) + the
// discrete-highlight overlay layers (BOP / Plakk / >=5mm / >=6mm). T1 shipped
// the row info buttons; T3 later adds the continuous PD/CAL/GR heat.
//
// All overlays are display-only over EXISTING perio data (no new axis, no
// mutation) and live entirely in the perio-view DOM — the live odontogram /
// SVG render / payload / FHIR are untouched, so parity
// (svg-fingerprints/fhir-golden/roundtrip-golden) is unaffected. Nothing here
// needs the parity harness.
//
// Structure mirrors the T3 curve tests (perio-graphic-curve.test.ts) +
// perio-graphic-toothrow.test.ts: the pure geometry/DOM builders in
// perioGraphic.ts are tested in isolation, the arch integration is exercised
// against a hand-built template cache parsed from the REAL SVG assets
// (readFileSync + DOMParser, no fetch), and the switcher UI is exercised by
// rendering <PerioChart inline/> directly (like pgb-info-buttons.test.ts).
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
  setPlaque,
  getPerioOverlayLayer,
  setPerioOverlayLayer,
  onStateChange,
} from "../odontogram";
import {
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  perioOverlayMarks,
  perioPlaqueMarks,
  buildPerioOverlayLayer,
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
// State (odontogram.ts): getPerioOverlayLayer / setPerioOverlayLayer.
// ---------------------------------------------------------------------------
describe("PG-B Task 2: perioOverlayLayer state", () => {
  it("defaults to 'none'", () => {
    expect(getPerioOverlayLayer()).toBe("none");
  });

  it("setPerioOverlayLayer reflects the selection", () => {
    setPerioOverlayLayer("bop");
    expect(getPerioOverlayLayer()).toBe("bop");
    setPerioOverlayLayer("pd6");
    expect(getPerioOverlayLayer()).toBe("pd6");
    setPerioOverlayLayer("none");
    expect(getPerioOverlayLayer()).toBe("none");
  });

  it("setPerioOverlayLayer fires notifyStateChange", () => {
    let fired = 0;
    const unsub = onStateChange(() => { fired++; });
    setPerioOverlayLayer("plaque");
    unsub();
    expect(fired).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Pure geometry (perioGraphic.ts): reuse the SAME cejY/mmPx coordinate math
// the curve uses (marginY = cejY + gm*mmPx, pocketY = marginY + pd*mmPx).
// ---------------------------------------------------------------------------
describe("PG-B Task 2: perioOverlayMarks (pure geometry)", () => {
  const MM = 3;
  const cejY = 40;
  const opts = { cejY, mmPx: MM };

  it("BOP places a dot only on bleeding, charted sites (at the gingival margin)", () => {
    const marks = perioOverlayMarks(
      "bop",
      [
        { x: 0, pd: 4, gm: 2, bop: true },   // bleeding + charted -> mark at margin
        { x: 10, pd: 3, gm: 0, bop: false }, // charted, not bleeding -> no mark
        { x: 20, bop: true },                // bleeding but NOT charted -> no mark
      ],
      opts,
    );
    expect(marks.length).toBe(1);
    expect(marks[0]).toEqual({ x: 0, y: cejY + 2 * MM, kind: "bop" });
  });

  it(">=5mm highlights sites with pd>=5 at the pocket base; <5 excluded", () => {
    const marks = perioOverlayMarks(
      "pd5",
      [
        { x: 0, pd: 5, gm: 0 },
        { x: 10, pd: 4, gm: 0 },
        { x: 20, pd: 7, gm: 1 },
        { x: 30 }, // uncharted
      ],
      opts,
    );
    expect(marks.map((m) => m.x)).toEqual([0, 20]);
    expect(marks.every((m) => m.kind === "pd5")).toBe(true);
    // pocket base of the pd7/gm1 site: cejY + (1 + 7)*mm
    expect(marks[1].y).toBe(cejY + (1 + 7) * MM);
  });

  it(">=6mm highlights only sites with pd>=6", () => {
    const marks = perioOverlayMarks(
      "pd6",
      [
        { x: 0, pd: 5 },
        { x: 10, pd: 6 },
        { x: 20, pd: 9 },
      ],
      opts,
    );
    expect(marks.map((m) => m.x)).toEqual([10, 20]);
    expect(marks.every((m) => m.kind === "pd6")).toBe(true);
  });
});

describe("PG-B Task 2: perioPlaqueMarks (pure geometry)", () => {
  const opts = { cejY: 40, mmPx: 3 };
  it("the buccal aspect renders mesial/buccal/distal surface marks; palatal renders lingual", () => {
    const teeth = [{ x: 0, width: 40, surfaces: ["mesial", "buccal", "distal", "lingual"] }];
    const buccal = perioPlaqueMarks(teeth, "buccal", opts);
    expect(buccal.length).toBe(3);
    expect(buccal.every((m) => m.kind === "plaque")).toBe(true);
    const palatal = perioPlaqueMarks(teeth, "palatal", opts);
    expect(palatal.length).toBe(1); // lingual only
    expect(palatal[0].kind).toBe("plaque");
  });

  it("a tooth with no plaque surfaces yields no marks", () => {
    const teeth = [{ x: 0, width: 40, surfaces: [] }];
    expect(perioPlaqueMarks(teeth, "buccal", opts)).toEqual([]);
    expect(perioPlaqueMarks(teeth, "palatal", opts)).toEqual([]);
  });
});

describe("PG-B Task 2: buildPerioOverlayLayer (pure DOM)", () => {
  it("builds an aria-hidden <g> with one classed circle per mark", () => {
    const g = buildPerioOverlayLayer(
      [
        { x: 5, y: 40, kind: "bop" },
        { x: 15, y: 52, kind: "pd6" },
      ],
      { width: 100, className: "perio-overlay-bop" },
    );
    expect(g.getAttribute("aria-hidden")).toBe("true");
    expect(g.classList.contains("perio-overlay-layer")).toBe(true);
    const circles = g.querySelectorAll("circle");
    expect(circles.length).toBe(2);
    expect(circles[0].getAttribute("class")).toContain("perio-overlay-bop");
    expect(circles[0].getAttribute("cx")).toBe("5");
    expect(circles[1].getAttribute("class")).toContain("perio-overlay-pd6");
  });

  it("an empty mark list yields an (aria-hidden) empty <g>", () => {
    const g = buildPerioOverlayLayer([], { width: 100 });
    expect(g.getAttribute("aria-hidden")).toBe("true");
    expect(g.querySelectorAll("circle").length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Integration: drawArchOverlay appends the overlay INTO the same oriented row
// groups the teeth/curve ride, reusing archToothLayout + PERIO_MM_PX.
// ---------------------------------------------------------------------------
describe("PG-B Task 2: drawArchOverlay integration (real templates)", () => {
  const cache = buildCache();

  function mountArch(): HTMLDivElement {
    const container = document.createElement("div");
    container.appendChild(buildBuccalArchSvg(cache, UPPER_ARCH));
    container.appendChild(buildPalatalArchSvg(cache, UPPER_ARCH));
    return container;
  }

  it("BOP renders one dot per bleeding site, into the buccal/palatal oriented groups, aria-hidden", () => {
    const container = mountArch();
    setPerioSite(16, "MB", { pd: 4, bop: true }); // buccal-aspect site
    setPerioSite(16, "ML", { pd: 4, bop: true }); // lingual-aspect site
    setPerioSite(16, "B", { pd: 5 });             // charted, not bleeding

    drawArchOverlay(cache, container, UPPER_ARCH, "bop");

    const buccalGroup = container.querySelector(".perio-tooth-row-buccal")!;
    const palatalGroup = container.querySelector(".perio-tooth-row-palatal-inner")!;
    const buccalOverlay = buccalGroup.querySelector(".perio-overlay-layer")!;
    const palatalOverlay = palatalGroup.querySelector(".perio-overlay-layer")!;
    expect(buccalOverlay).toBeTruthy();
    expect(buccalOverlay.getAttribute("aria-hidden")).toBe("true");
    expect(buccalOverlay.querySelectorAll(".perio-overlay-bop").length).toBe(1);
    expect(palatalOverlay.querySelectorAll(".perio-overlay-bop").length).toBe(1);
  });

  it(">=5mm / >=6mm highlight the right sites", () => {
    const container = mountArch();
    setPerioSite(16, "MB", { pd: 4 });
    setPerioSite(16, "B", { pd: 5 });
    setPerioSite(16, "DB", { pd: 6 });

    drawArchOverlay(cache, container, UPPER_ARCH, "pd5");
    let buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.querySelectorAll(".perio-overlay-pd5").length).toBe(2); // pd 5 and 6

    drawArchOverlay(cache, container, UPPER_ARCH, "pd6");
    buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    expect(buccalOverlay.querySelectorAll(".perio-overlay-pd6").length).toBe(1); // only pd 6
  });

  it("Plakk renders marks on the charted plaque surfaces", () => {
    const container = mountArch();
    setPlaque(16, "buccal", true);
    setPlaque(16, "lingual", true);

    drawArchOverlay(cache, container, UPPER_ARCH, "plaque");
    const buccalOverlay = container.querySelector(".perio-tooth-row-buccal .perio-overlay-layer")!;
    const palatalOverlay = container.querySelector(".perio-tooth-row-palatal-inner .perio-overlay-layer")!;
    expect(buccalOverlay.querySelectorAll(".perio-overlay-plaque").length).toBe(1); // buccal surface
    expect(palatalOverlay.querySelectorAll(".perio-overlay-plaque").length).toBe(1); // lingual surface
  });

  it("None clears any previously-drawn overlay", () => {
    const container = mountArch();
    setPerioSite(16, "MB", { pd: 6, bop: true });
    drawArchOverlay(cache, container, UPPER_ARCH, "bop");
    expect(container.querySelector(".perio-overlay-layer")).toBeTruthy();

    drawArchOverlay(cache, container, UPPER_ARCH, "none");
    expect(container.querySelector(".perio-overlay-layer")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Switcher UI (PerioChart inline): #perioOverlaySwitch in the Dental Chart
// header; clicking a layer button drives setPerioOverlayLayer + shows the
// active selection; header shows %BOP / PI% when relevant.
// ---------------------------------------------------------------------------
describe("PG-B Task 2: #perioOverlaySwitch", () => {
  function openInline() {
    return render(createElement(PerioChart, { inline: true }));
  }

  it("renders a radio-style switch row with a button per implemented layer", () => {
    openInline();
    const sw = document.getElementById("perioOverlaySwitch")!;
    expect(sw).toBeTruthy();
    for (const layer of ["none", "bop", "plaque", "pd5", "pd6"]) {
      const btn = sw.querySelector(`[data-overlay-layer="${layer}"]`);
      expect(btn, layer).toBeTruthy();
      expect(btn!.textContent).toBe(t(`perio.overlay.${layer}`));
    }
  });

  it("None is active by default", () => {
    openInline();
    const noneBtn = document.querySelector('[data-overlay-layer="none"]')!;
    expect(noneBtn.getAttribute("aria-checked")).toBe("true");
  });

  it("clicking BOP selects it (getPerioOverlayLayer + active state) and shows %BOP", () => {
    // one bleeding site so bopPercent is non-zero
    setPerioSite(16, "MB", { pd: 4, bop: true });
    openInline();
    const bopBtn = document.querySelector('[data-overlay-layer="bop"]') as HTMLButtonElement;
    act(() => { fireEvent.click(bopBtn); });
    expect(getPerioOverlayLayer()).toBe("bop");
    expect(bopBtn.getAttribute("aria-checked")).toBe("true");
    const readout = document.getElementById("perioOverlayReadout");
    expect(readout).toBeTruthy();
    expect(readout!.textContent).toContain(t("perio.bopPercent"));
    expect(readout!.textContent).toContain("%");
  });

  it("clicking Plakk selects it and shows PI%", () => {
    setPlaque(16, "buccal", true);
    openInline();
    const plaqueBtn = document.querySelector('[data-overlay-layer="plaque"]') as HTMLButtonElement;
    act(() => { fireEvent.click(plaqueBtn); });
    expect(getPerioOverlayLayer()).toBe("plaque");
    const readout = document.getElementById("perioOverlayReadout");
    expect(readout!.textContent).toContain(t("plaque.percent"));
  });

  it("selecting None clears the active selection + read-out", () => {
    openInline();
    const bopBtn = document.querySelector('[data-overlay-layer="bop"]') as HTMLButtonElement;
    act(() => { fireEvent.click(bopBtn); });
    expect(getPerioOverlayLayer()).toBe("bop");
    const noneBtn = document.querySelector('[data-overlay-layer="none"]') as HTMLButtonElement;
    act(() => { fireEvent.click(noneBtn); });
    expect(getPerioOverlayLayer()).toBe("none");
    expect(noneBtn.getAttribute("aria-checked")).toBe("true");
    expect(document.getElementById("perioOverlayReadout")).toBeNull();
  });
});
