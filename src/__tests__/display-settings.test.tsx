// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Settings -> Odontogram chart styling + the tooth-info toggle used to be React
// state private to the provider, so a host persisting the doctor's preferences
// could neither read nor restore them. They now live in ./state/displaySettings
// (getter + idempotent notifying setter, like perioViewMode), the provider
// mirrors them through onStateChange, and each is a controlled prop.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, screen, act } from "@testing-library/react";
import App from "../App";
import {
  getScreenToothSpacing,
  setScreenToothSpacing,
  getScreenToothNumberSize,
  setScreenToothNumberSize,
  getSelectionColor,
  setSelectionColor,
  getSelectionBorderStyle,
  setSelectionBorderStyle,
  getToothInfoVisible,
  setToothInfoVisible,
  getNumberingSystem,
  setNumberingSystem,
  onStateChange,
} from "../odontogram";

vi.mock("../odontogram", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../odontogram")>();
  return {
    ...actual,
    initOdontogram: vi.fn().mockResolvedValue(undefined),
    destroyOdontogram: vi.fn(),
  };
});

const resetDefaults = () => {
  setScreenToothSpacing("normal");
  setScreenToothNumberSize("normal");
  setSelectionColor("#3b7bff");
  setSelectionBorderStyle("dashed");
  setToothInfoVisible(true);
  setNumberingSystem("FDI");
};

function fires(fn: () => void): boolean {
  let fired = false;
  const unsub = onStateChange(() => { fired = true; });
  try { fn(); } finally { unsub(); }
  return fired;
}

describe("display-settings setters: idempotent + notifyStateChange", () => {
  afterEach(resetDefaults);

  it("setScreenToothSpacing", () => {
    expect(getScreenToothSpacing()).toBe("normal");
    expect(fires(() => setScreenToothSpacing("wide"))).toBe(true);
    expect(getScreenToothSpacing()).toBe("wide");
    expect(fires(() => setScreenToothSpacing("wide"))).toBe(false);
    // An invalid value sanitizes to "normal" — a real change from "wide".
    expect(fires(() => setScreenToothSpacing("bogus" as "wide"))).toBe(true);
    expect(getScreenToothSpacing()).toBe("normal");
  });

  it("setScreenToothNumberSize", () => {
    expect(fires(() => setScreenToothNumberSize("xlarge"))).toBe(true);
    expect(getScreenToothNumberSize()).toBe("xlarge");
    expect(fires(() => setScreenToothNumberSize("xlarge"))).toBe(false);
  });

  it("setSelectionColor accepts #rrggbb only and normalizes case", () => {
    expect(getSelectionColor()).toBe("#3b7bff");
    expect(fires(() => setSelectionColor("#FF0000"))).toBe(true);
    expect(getSelectionColor()).toBe("#ff0000");
    expect(fires(() => setSelectionColor("#ff0000"))).toBe(false);
    expect(fires(() => setSelectionColor("red"))).toBe(false);
    expect(fires(() => setSelectionColor("#fff"))).toBe(false);
    expect(getSelectionColor()).toBe("#ff0000");
  });

  it("setSelectionBorderStyle", () => {
    expect(fires(() => setSelectionBorderStyle("solid"))).toBe(true);
    expect(getSelectionBorderStyle()).toBe("solid");
    expect(fires(() => setSelectionBorderStyle("solid"))).toBe(false);
  });

  it("setToothInfoVisible", () => {
    expect(getToothInfoVisible()).toBe(true);
    expect(fires(() => setToothInfoVisible(false))).toBe(true);
    expect(getToothInfoVisible()).toBe(false);
    expect(fires(() => setToothInfoVisible(false))).toBe(false);
  });

  it("getNumberingSystem reads what setNumberingSystem wrote", () => {
    expect(getNumberingSystem()).toBe("FDI");
    setNumberingSystem("UNIVERSAL");
    expect(getNumberingSystem()).toBe("UNIVERSAL");
  });
});

describe("provider mirrors the display settings", () => {
  beforeEach(() => { cleanup(); document.body.innerHTML = ""; resetDefaults(); });
  afterEach(() => { cleanup(); resetDefaults(); });

  const grid = () => document.getElementById("toothGrid") as HTMLElement;

  it("renders the engine defaults byte-for-byte as before", () => {
    render(createElement(App, { language: "en" }));
    expect(grid().getAttribute("data-screen-spacing")).toBe("normal");
    expect(grid().getAttribute("data-tooth-num")).toBe("normal");
    expect(grid().style.getPropertyValue("--odon-select-border-style")).toBe("dashed");
    expect(grid().style.getPropertyValue("--odon-select-rgb")).toBe("59,123,255");
    expect(document.querySelector(".tooth-info")).not.toBeNull();
  });

  it("controlled props write the engine and the chart", () => {
    render(createElement(App, {
      language: "en",
      screenToothSpacing: "close",
      screenToothNumberSize: "small",
      selectionColor: "#00ff00",
      selectionBorderStyle: "dotted",
      toothInfo: false,
    }));
    expect(getScreenToothSpacing()).toBe("close");
    expect(getSelectionBorderStyle()).toBe("dotted");
    expect(getToothInfoVisible()).toBe(false);
    expect(grid().getAttribute("data-screen-spacing")).toBe("close");
    expect(grid().getAttribute("data-tooth-num")).toBe("small");
    expect(grid().style.getPropertyValue("--odon-select-border-style")).toBe("dotted");
    expect(grid().style.getPropertyValue("--odon-select-rgb")).toBe("0,255,0");
    expect(document.querySelector(".tooth-info")).toBeNull();
  });

  it("a host calling the setters after mount re-renders the chart", () => {
    render(createElement(App, { language: "en" }));
    act(() => {
      setScreenToothSpacing("wide");
      setSelectionBorderStyle("solid");
    });
    expect(grid().getAttribute("data-screen-spacing")).toBe("wide");
    expect(grid().style.getPropertyValue("--odon-select-border-style")).toBe("solid");
  });

  it("the Settings modal writes through to the engine", () => {
    render(createElement(App, { language: "en" }));
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog.querySelector("#odon-settings-tab-odontogram") as HTMLElement);

    const spacing = Array.from(dialog.querySelectorAll("select")).find((s) =>
      Array.from(s.options).some((o) => o.value === "wide"));
    expect(spacing).toBeTruthy();
    fireEvent.change(spacing as HTMLSelectElement, { target: { value: "wide" } });
    expect(getScreenToothSpacing()).toBe("wide");
    expect(grid().getAttribute("data-screen-spacing")).toBe("wide");

    // The selection ring lives on the Tooth details tab.
    fireEvent.click(dialog.querySelector("#odon-settings-tab-toothDetails") as HTMLElement);
    const border = Array.from(dialog.querySelectorAll("select")).find((s) =>
      Array.from(s.options).some((o) => o.value === "dotted"));
    expect(border).toBeTruthy();
    fireEvent.change(border as HTMLSelectElement, { target: { value: "solid" } });
    expect(getSelectionBorderStyle()).toBe("solid");
  });
});
