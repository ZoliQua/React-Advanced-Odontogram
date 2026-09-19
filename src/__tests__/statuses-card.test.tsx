// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3, PR 3b: declarative-render test for `StatusesCard`.
// Mounts the card as part of `ToothControlsSurface` under `<OdontogramProvider>`
// with the lifecycle-only mock the composable-surface suites use
// (initOdontogram/destroyOdontogram stubbed; every other engine getter/setter
// stays real). Proves the whole-mouth Statuses body is now declarative: the
// #btnEdentulous toggle's `aria-pressed` reflects `getEdentulous()` and flips on
// click; #btnResetAll/#btnPrimaryDentition/#btnMixedDentition fire their engine
// effects; and the #statusExtraSelect + #statusExtraApply row applies a preset.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { OdontogramProvider, ToothControlsSurface } from "../App";
import {
  __resetChartStateForTest,
  __setToothStateForTest,
  setNumberingSystem,
  getStatusChart,
  getEdentulous,
  getStatusExtras,
} from "../odontogram";

vi.mock("../odontogram", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../odontogram")>();
  return {
    ...actual,
    initOdontogram: vi.fn().mockResolvedValue(undefined),
    destroyOdontogram: vi.fn(),
  };
});

function renderControls() {
  return render(createElement(OdontogramProvider, { language: "en" }, createElement(ToothControlsSurface)));
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});

describe("PR 3b: <StatusesCard/> renders declaratively", () => {
  it("renders the status action buttons + the statusExtra row", () => {
    renderControls();
    expect(document.getElementById("btnResetAll")).toBeTruthy();
    expect(document.getElementById("btnPrimaryDentition")).toBeTruthy();
    expect(document.getElementById("btnMixedDentition")).toBeTruthy();
    expect(document.getElementById("btnEdentulous")).toBeTruthy();
    const select = document.getElementById("statusExtraSelect") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(document.getElementById("statusExtraApply")).toBeTruthy();
    // The declarative card renders the same option set the imperative wiring did.
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).toEqual(getStatusExtras().map((o) => o.id));
    expect(values.length).toBeGreaterThan(0);
  });

  it("#btnEdentulous aria-pressed reflects getEdentulous() and toggles on click", () => {
    renderControls();
    const btn = document.getElementById("btnEdentulous") as HTMLButtonElement;
    expect(getEdentulous()).toBe(false);
    expect(btn.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(btn);
    expect(getEdentulous()).toBe(true);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    // Turning edentulous on sets every tooth to a sound-missing gap.
    expect(getStatusChart().teeth[11].toothSelection).toBe("none");

    fireEvent.click(btn);
    expect(getEdentulous()).toBe(false);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  it("#btnResetAll resets the mouth (clears edentulous + tooth edits)", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    renderControls();
    // Turn edentulous on first, so reset has to clear both it and the edits.
    const edn = document.getElementById("btnEdentulous") as HTMLButtonElement;
    fireEvent.click(edn);
    expect(getEdentulous()).toBe(true);

    fireEvent.click(document.getElementById("btnResetAll") as HTMLButtonElement);
    expect(getEdentulous()).toBe(false);
    expect(edn.getAttribute("aria-pressed")).toBe("false");
    // Every tooth back to the default base — no lingering implant / gap.
    expect(getStatusChart().teeth[11].toothSelection).toBe("tooth-base");
  });

  it("#btnPrimaryDentition and #btnMixedDentition apply their presets", () => {
    renderControls();
    fireEvent.click(document.getElementById("btnPrimaryDentition") as HTMLButtonElement);
    // 11 is a primary-milk position → becomes a milk tooth; 18 is not → gap.
    expect(getStatusChart().teeth[11].toothSelection).toBe("milktooth");
    expect(getStatusChart().teeth[18].toothSelection).toBe("none");

    fireEvent.click(document.getElementById("btnMixedDentition") as HTMLButtonElement);
    // 13 is a mixed-milk position → milk tooth in the mixed preset.
    expect(getStatusChart().teeth[13].toothSelection).toBe("milktooth");
  });

  it("selecting a statusExtra preset and clicking apply writes it to the status chart", () => {
    renderControls();
    const select = document.getElementById("statusExtraSelect") as HTMLSelectElement;
    // Apply the first zircon-span preset (upper 12→22 pillars/pontics).
    fireEvent.change(select, { target: { value: "upper-12-22-zircon" } });
    fireEvent.click(document.getElementById("statusExtraApply") as HTMLButtonElement);
    // The span's endpoint pillar (12) becomes a zircon crown.
    expect(getStatusChart().teeth[12].restorationMaterial).toBe("zircon");
    expect(getStatusChart().teeth[12].restorationType).toBe("crown");
  });
});
