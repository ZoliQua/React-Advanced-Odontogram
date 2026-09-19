// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 1: the four surface components (OdontogramTopbar,
// OdontogramChartSurface, ToothInfoSurface, ToothControlsSurface) can be placed
// in a host-provided layout — different wrappers and order than the default
// OdontogramShell — as long as they sit under one OdontogramProvider and share
// its session. This proves the composability contract; the default shell's
// byte-identical DOM is proven separately by parity/shell-dom.test.tsx.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import {
  OdontogramProvider,
  OdontogramTopbar,
  OdontogramChartSurface,
  ToothInfoSurface,
  ToothControlsSurface,
} from "../App";
import { __resetChartStateForTest, setNumberingSystem } from "../odontogram";

// Stub only the lifecycle so initOdontogram() does not populate the SVG grid —
// same technique as parity/shell-dom.test.tsx; every other engine getter/setter
// stays real, so the surfaces render against genuine state.
vi.mock("../odontogram", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../odontogram")>();
  return {
    ...actual,
    initOdontogram: vi.fn().mockResolvedValue(undefined),
    destroyOdontogram: vi.fn(),
  };
});

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});

// A host layout that places the surfaces in its own regions, in a different
// order and nesting than the default shell.
function CustomComposition() {
  return createElement(
    OdontogramProvider,
    { language: "en" },
    createElement("div", { "data-testid": "host-aside" },
      createElement(ToothControlsSurface),
    ),
    createElement("div", { "data-testid": "host-main" },
      createElement(OdontogramChartSurface),
      createElement(ToothInfoSurface),
    ),
    createElement("div", { "data-testid": "host-header" },
      createElement(OdontogramTopbar),
    ),
  );
}

describe("composable surfaces under a host-provided layout", () => {
  it("renders each surface's region markup inside the host's own regions", () => {
    const { getByTestId } = render(createElement(CustomComposition));

    // Each surface renders its region markup where the HOST placed it, not in
    // the default shell arrangement.
    expect(getByTestId("host-header").querySelector("header.topbar")).toBeTruthy();
    expect(getByTestId("host-main").querySelector("section.chart")).toBeTruthy();
    expect(getByTestId("host-main").querySelector("#toothGrid")).toBeTruthy();
    expect(getByTestId("host-aside").querySelector(".panel-odontogram-controls")).toBeTruthy();
  });

  it("shares one provider — the control panel and chart coexist from a single session", () => {
    render(createElement(CustomComposition));
    // Both a control (from ToothControlsSurface) and the tooth grid (from the
    // chart surface) are present, driven by the same OdontogramProvider.
    expect(document.getElementById("toothSelect")).toBeTruthy();
    expect(document.getElementById("toothGrid")).toBeTruthy();
  });

  it("ToothInfoSurface renders its region inside the host's main region", () => {
    const { getByTestId } = render(createElement(CustomComposition));
    // The whole-mouth summary is available at mount, so the tooth-info section
    // renders where the host placed the surface (next to the chart), not in the
    // default shell arrangement.
    expect(getByTestId("host-main").querySelector("section.tooth-info")).toBeTruthy();
  });

  it("a surface used outside an OdontogramProvider throws a clear error", () => {
    // Silence React's expected error boundary logging for this render.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(createElement(OdontogramTopbar))).toThrow(/OdontogramProvider/);
    spy.mockRestore();
  });
});
