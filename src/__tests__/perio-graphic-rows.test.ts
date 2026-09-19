// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Periodontal-arc "Dental Chart" graphical redesign, Task 4: the number rows
// (PD/GM/CAL/BOP/mobility) re-laid into the reference structure AROUND the
// tooth graphic — buccal-aspect rows ABOVE the buccal teeth, palatal-aspect
// rows BELOW the palatal teeth (per periodontalchart-online.com), with each
// cell column aligned to its tooth's x from the arch layout. This suite
// verifies the STRUCTURE (buccal above / palatal below), that authoring a PD
// via a cell still updates state AND moves the T3 curve overlay's pocket
// point, that keyboard auto-advance still advances in the new layout, and
// that the summary bar surfaces avg PD / avg CAL / %BOP. It reuses the SAME
// `perio-fg-*` cell ids / `data-perio` locators P2 shipped — the keyboard +
// sync code is unchanged, only the layout moves.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import PerioChart from "../PerioChart";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  getToothPerio,
  getPerioSummary,
  setPerioSite,
  setReadOnly,
} from "../odontogram";

// Serve the real tooth-base SVG assets to `loadTemplateCache()`'s `fetch`
// (jsdom has no real network) so the arch graphic + T3 curve overlay actually
// render and can be asserted on — keyed only by the trailing `NN.svg`
// filename, robust to however Vite rewrites the asset URL in the test env.
const testFileUrl = import.meta.url;
function svgFor(name: string): string {
  return readFileSync(fileURLToPath(new URL(`../assets/teeth-svgs/${name}`, testFileUrl)), "utf8");
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setReadOnly(false);
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: unknown) => {
      const m = String(url).match(/(\d+\.svg)(?:\?.*)?$/);
      if (!m) throw new Error(`unexpected fetch: ${String(url)}`);
      return { ok: true, status: 200, text: async () => svgFor(m[1]) } as unknown as Response;
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  setReadOnly(false);
});

function openGrid() {
  return render(createElement(PerioChart, { open: true, onClose: () => {} }));
}

function cellOf(id: string): HTMLElement {
  return (document.getElementById(id) as HTMLElement).closest(".perio-fullgrid-cell") as HTMLElement;
}

describe("P2 Task 4: reference structure (buccal above / palatal below)", () => {
  it("lays every buccal-aspect number row above the tooth graphic and every palatal row below it", () => {
    openGrid();
    const grid = cellOf("perio-fg-pd-16-MB").closest(".perio-fullgrid-arch") as HTMLElement;
    const archCell = grid.querySelector("[data-perio-arch]") as HTMLElement;
    expect(archCell).toBeTruthy();

    const kids = Array.from(grid.children);
    const archIdx = kids.indexOf(archCell);
    expect(archIdx).toBeGreaterThan(0);

    // Buccal aspect cells (MB/B/DB, all four fields) precede the graphic.
    for (const site of ["MB", "B", "DB"]) {
      for (const field of ["pd", "gm", "cal", "bop"]) {
        const idx = kids.indexOf(cellOf(`perio-fg-${field}-16-${site}`));
        expect(idx, `buccal ${field} ${site}`).toBeGreaterThanOrEqual(0);
        expect(idx, `buccal ${field} ${site} before graphic`).toBeLessThan(archIdx);
      }
    }
    // Palatal aspect cells (ML/L/DL, all four fields) follow the graphic.
    for (const site of ["ML", "L", "DL"]) {
      for (const field of ["pd", "gm", "cal", "bop"]) {
        const idx = kids.indexOf(cellOf(`perio-fg-${field}-16-${site}`));
        expect(idx, `palatal ${field} ${site}`).toBeGreaterThanOrEqual(0);
        expect(idx, `palatal ${field} ${site} after graphic`).toBeGreaterThan(archIdx);
      }
    }
  });

  it("aligns the grid tooth columns to the arch layout once the graphic loads", async () => {
    openGrid();
    await waitFor(() => {
      expect(document.querySelector("[data-perio-arch] svg.perio-tooth-arch")).toBeTruthy();
    });
    const grid = cellOf("perio-fg-pd-16-MB").closest(".perio-fullgrid-arch") as HTMLElement;
    // Column template is derived from the per-tooth arch layout (16 tooth
    // columns + the leading row-label column), not a uniform placeholder.
    const cols = grid.style.gridTemplateColumns.trim().split(/\s+/);
    expect(cols.length).toBe(17);
  });
});

describe("P2 Task 4: PD cell drives state AND the curve overlay", () => {
  it("authoring a PD via a cell updates getToothPerio and moves the pocket point", async () => {
    openGrid();
    await waitFor(() => {
      expect(document.querySelector("[data-perio-arch] svg.perio-tooth-arch")).toBeTruthy();
    });
    const archSvg = cellOf("perio-fg-pd-18-MB")
      .closest(".perio-fullgrid-arch")!
      .querySelector("[data-perio-arch] svg.perio-tooth-arch") as SVGSVGElement;

    // No buccal pocket line before any buccal site is charted.
    expect(archSvg.querySelector(".perio-curve-buccal .perio-curve-pocket")).toBeNull();

    const pd = document.getElementById("perio-fg-pd-18-MB") as HTMLInputElement;
    fireEvent.change(pd, { target: { value: "6" } });
    expect(getToothPerio(18).pd.MB).toBe(6);

    const pocket6 = archSvg.querySelector(".perio-curve-buccal .perio-curve-pocket");
    expect(pocket6).toBeTruthy();
    const y6 = Number(pocket6!.getAttribute("points")!.trim().split(/[\s,]+/)[1]);

    // A deeper pocket pushes the pocket point further from the CEJ (larger y).
    fireEvent.change(pd, { target: { value: "9" } });
    const pocket9 = archSvg.querySelector(".perio-curve-buccal .perio-curve-pocket");
    const y9 = Number(pocket9!.getAttribute("points")!.trim().split(/[\s,]+/)[1]);
    expect(y9).toBeGreaterThan(y6);
  });
});

describe("P2 Task 4: keyboard auto-advance in the new layout", () => {
  it("commits a digit and advances MB -> B in the pd row", () => {
    openGrid();
    const mb = document.getElementById("perio-fg-pd-18-MB") as HTMLInputElement;
    mb.focus();
    fireEvent.keyDown(mb, { key: "3" });
    expect(getToothPerio(18).pd.MB).toBe(3);
    expect(document.activeElement).toBe(document.getElementById("perio-fg-pd-18-B"));
  });
});

describe("P2 Task 4: summary averages", () => {
  it("getPerioSummary returns null averages when nothing is charted", () => {
    const s = getPerioSummary();
    expect(s.avgPd).toBeNull();
    expect(s.avgCal).toBeNull();
  });

  it("getPerioSummary computes avg PD and avg CAL over charted sites", () => {
    setPerioSite(16, "MB", { pd: 4, gm: 1 }); // cal 5
    setPerioSite(16, "B", { pd: 2, gm: 0 }); // cal 2
    const s = getPerioSummary();
    expect(s.avgPd).toBe(3); // (4 + 2) / 2
    expect(s.avgCal).toBe(3.5); // (5 + 2) / 2
  });

  it("the summary bar surfaces avg PD, avg CAL and %BOP", () => {
    openGrid();
    fireEvent.change(document.getElementById("perio-fg-pd-16-MB") as HTMLInputElement, {
      target: { value: "4" },
    });
    fireEvent.change(document.getElementById("perio-fg-bop-16-MB") as HTMLInputElement, {
      target: { checked: true },
    });
    expect(document.getElementById("perio-fg-summary-avgpd")!.textContent).toContain("4");
    expect(document.getElementById("perio-fg-summary-avgcal")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-bop")!.textContent).toContain("100");
  });
});
