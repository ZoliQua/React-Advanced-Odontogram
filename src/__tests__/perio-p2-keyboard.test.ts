// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Periodontal-arc sub-project P2, Task 3: keyboard auto-advance + navigation
// on the full-mouth perio-chart grid. P2 Task 2 (committed) shipped the grid
// itself, bound to the P1 data core via plain `change`/`click` listeners.
// THIS task adds a delegated `keydown` handler (see `PerioChart.tsx`) so a
// clinician can chart a full mouth with single keystrokes: a digit on a PD
// cell commits + auto-advances to `nextPerioCell`'s cell; arrow keys move
// focus; Space/Enter toggles BOP. All value writes still go through the
// EXISTING `setPerioSite` path — this suite never bypasses it.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import PerioChart from "../PerioChart";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  getToothPerio,
  getToothCal,
  setReadOnly,
  nextPerioCell,
  prevPerioCell,
} from "../odontogram";

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

function openGrid() {
  return render(createElement(PerioChart, { open: true, onClose: () => {} }));
}

function pd(toothNo: number, site: string): HTMLInputElement {
  return document.getElementById(`perio-fg-pd-${toothNo}-${site}`) as HTMLInputElement;
}
function gm(toothNo: number, site: string): HTMLInputElement {
  return document.getElementById(`perio-fg-gm-${toothNo}-${site}`) as HTMLInputElement;
}
function bop(toothNo: number, site: string): HTMLInputElement {
  return document.getElementById(`perio-fg-bop-${toothNo}-${site}`) as HTMLInputElement;
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setReadOnly(false);
});

afterEach(() => {
  cleanup();
  setReadOnly(false);
});

describe("P2 Task 3: nextPerioCell / prevPerioCell — pure charting order", () => {
  it("advances MB -> B -> DB within a tooth (pd row)", () => {
    expect(nextPerioCell({ toothNo: 18, site: "MB", row: "pd" })).toEqual({ toothNo: 18, site: "B", row: "pd" });
    expect(nextPerioCell({ toothNo: 18, site: "B", row: "pd" })).toEqual({ toothNo: 18, site: "DB", row: "pd" });
  });

  it("after DB, advances to the next tooth's MB, in arch order (upper then lower)", () => {
    expect(nextPerioCell({ toothNo: 18, site: "DB", row: "pd" })).toEqual({ toothNo: 17, site: "MB", row: "pd" });
    // last upper-arch tooth (28) DB -> first lower-arch tooth (48) MB
    expect(nextPerioCell({ toothNo: 28, site: "DB", row: "pd" })).toEqual({ toothNo: 48, site: "MB", row: "pd" });
  });

  it("end of the buccal group (last tooth's DB) wraps into the lingual group's first tooth/site", () => {
    expect(nextPerioCell({ toothNo: 38, site: "DB", row: "pd" })).toEqual({ toothNo: 18, site: "ML", row: "pd" });
  });

  it("end of the pd row (last tooth's DL) wraps into the gm row's first tooth/site", () => {
    expect(nextPerioCell({ toothNo: 38, site: "DL", row: "pd" })).toEqual({ toothNo: 18, site: "MB", row: "gm" });
  });

  it("the very last cell (last tooth's DL, gm row) has no next cell", () => {
    expect(nextPerioCell({ toothNo: 38, site: "DL", row: "gm" })).toBeNull();
  });

  it("an unrecognized cell returns null", () => {
    expect(nextPerioCell({ toothNo: 18, site: "XX", row: "pd" })).toBeNull();
  });

  it("prevPerioCell is the exact reverse of nextPerioCell", () => {
    const cur = { toothNo: 26, site: "L", row: "pd" as const };
    const next = nextPerioCell(cur)!;
    expect(prevPerioCell(next)).toEqual(cur);
    expect(prevPerioCell({ toothNo: 18, site: "MB", row: "pd" })).toBeNull();
  });
});

describe("P2 Task 3: digit keydown commits + auto-advances (PD)", () => {
  it("dispatching keydown '3' on a PD cell sets the value AND moves focus to the next site's PD cell", () => {
    openGrid();
    const cell = pd(18, "MB");
    cell.focus();
    expect(document.activeElement).toBe(cell);

    fireEvent.keyDown(cell, { key: "3" });

    expect(getToothPerio(18).pd.MB).toBe(3);
    expect(document.activeElement).toBe(pd(18, "B"));
  });

  it("chains across an entire tooth (MB,B,DB) then to the next tooth", () => {
    openGrid();
    pd(18, "MB").focus();
    fireEvent.keyDown(pd(18, "MB"), { key: "5" });
    expect(document.activeElement).toBe(pd(18, "B"));
    fireEvent.keyDown(pd(18, "B"), { key: "4" });
    expect(document.activeElement).toBe(pd(18, "DB"));
    fireEvent.keyDown(pd(18, "DB"), { key: "3" });
    expect(document.activeElement).toBe(pd(17, "MB"));

    expect(getToothPerio(18).pd).toEqual({ MB: 5, B: 4, DB: 3 });
  });

  it("digit '0' un-charts the site via the existing setPerioSite semantics, and still advances", () => {
    openGrid();
    const cell = pd(26, "MB");
    fireEvent.change(cell, { target: { value: "4" } });
    expect(getToothPerio(26).pd.MB).toBe(4);

    cell.focus();
    fireEvent.keyDown(cell, { key: "0" });

    expect(getToothPerio(26).pd.MB).toBeUndefined();
    expect(document.activeElement).toBe(pd(26, "B"));
  });
});

// Deferred fix (P2 follow-up, Task 1): PD values 10-15 were unreachable via
// single-digit auto-advance (digits 2-9 commit+advance immediately, but a
// PD of 10-15 needs a two-digit '1' + '0'-'5' composition). Mirrors the GM
// `dataset.pendingSign` prime/compose pattern: a leading '1' commits an
// interim value of 1, primes `dataset.pendingTens`, and withholds
// auto-advance so a following digit can complete the tens value.
describe("P2 Task 1 (deferred fix): PD digit '1' primes a tens composition for 10-15", () => {
  it("digit '1' on PD commits value 1, primes pendingTens, and does NOT advance focus", () => {
    openGrid();
    const cell = pd(18, "MB");
    cell.focus();

    fireEvent.keyDown(cell, { key: "1" });

    expect(getToothPerio(18).pd.MB).toBe(1);
    expect(cell.dataset.pendingTens).toBe("1");
    expect(document.activeElement).toBe(cell); // no advance yet
  });

  it("a primed '1' followed by a digit 0-5 composes 10-15, clears the prime, and advances", () => {
    openGrid();
    const cell = pd(18, "MB");
    cell.focus();
    fireEvent.keyDown(cell, { key: "1" });

    fireEvent.keyDown(cell, { key: "4" });

    expect(getToothPerio(18).pd.MB).toBe(14);
    expect(cell.dataset.pendingTens).toBeUndefined();
    expect(document.activeElement).toBe(pd(18, "B"));
  });

  it("'1' then '0' composes 10", () => {
    openGrid();
    const cell = pd(18, "MB");
    cell.focus();
    fireEvent.keyDown(cell, { key: "1" });
    fireEvent.keyDown(cell, { key: "0" });
    expect(getToothPerio(18).pd.MB).toBe(10);
  });

  it("'1' then '5' composes 15 (upper clamp boundary)", () => {
    openGrid();
    const cell = pd(18, "MB");
    cell.focus();
    fireEvent.keyDown(cell, { key: "1" });
    fireEvent.keyDown(cell, { key: "5" });
    expect(getToothPerio(18).pd.MB).toBe(15);
  });

  it("a primed '1' followed by a digit 6-9 clears the prime and lets the digit act normally (overwrites + advances)", () => {
    openGrid();
    const cell = pd(18, "MB");
    cell.focus();
    fireEvent.keyDown(cell, { key: "1" });

    fireEvent.keyDown(cell, { key: "7" });

    expect(getToothPerio(18).pd.MB).toBe(7);
    expect(cell.dataset.pendingTens).toBeUndefined();
    expect(document.activeElement).toBe(pd(18, "B"));
  });

  it("a primed '1' followed by ArrowRight clears the prime (value stays 1) and moves focus normally", () => {
    openGrid();
    const cell = pd(18, "MB");
    cell.focus();
    fireEvent.keyDown(cell, { key: "1" });

    fireEvent.keyDown(cell, { key: "ArrowRight" });

    expect(getToothPerio(18).pd.MB).toBe(1);
    expect(cell.dataset.pendingTens).toBeUndefined();
    expect(document.activeElement).toBe(pd(18, "B"));
  });

  it("digits 2-9 still commit + advance immediately (no priming) — existing behavior preserved", () => {
    openGrid();
    const cell = pd(18, "MB");
    cell.focus();

    fireEvent.keyDown(cell, { key: "6" });

    expect(getToothPerio(18).pd.MB).toBe(6);
    expect(cell.dataset.pendingTens).toBeUndefined();
    expect(document.activeElement).toBe(pd(18, "B"));
  });

  // Regression test mirroring the GM pendingSign stale-prime fix: a primed
  // '1' must NOT survive a non-keyboard focus change (blur/focusout), or a
  // later return-and-type would silently compose a wrong tens value.
  it("a primed '1' does NOT survive blur (focusout clears pendingTens) — no stale-prime regression", () => {
    openGrid();
    const cell = pd(18, "MB");
    const other = pd(18, "B");
    cell.focus();

    fireEvent.keyDown(cell, { key: "1" });
    expect(cell.dataset.pendingTens).toBe("1");

    // Leave the cell via a plain focus change — NO further keydown fires on `cell`.
    other.focus();
    fireEvent.focusOut(cell, { relatedTarget: other });

    expect(cell.dataset.pendingTens).toBeUndefined();

    // Return to the SAME cell and type a plain digit — must commit that
    // digit alone, NOT compose with the stale '1'.
    cell.focus();
    fireEvent.keyDown(cell, { key: "3" });

    expect(getToothPerio(18).pd.MB).toBe(3);
  });

  it("read-only mode is a no-op for the tens-priming flow", () => {
    openGrid();
    setReadOnly(true);
    const cell = pd(18, "MB");

    fireEvent.keyDown(cell, { key: "1" });

    expect(getToothPerio(18).pd.MB).toBeUndefined();
    expect(cell.dataset.pendingTens).toBeUndefined();
  });
});

describe("P2 Task 3: GM digit entry (leading '-' for recession-negative)", () => {
  it("a bare digit on GM commits a positive reading and advances", () => {
    openGrid();
    // Chart pd on both B and DB so the DB gm cell nextPerioCell lands on is
    // enabled (gm is only editable for an already-charted site).
    fireEvent.change(pd(14, "B"), { target: { value: "3" } });
    fireEvent.change(pd(14, "DB"), { target: { value: "5" } });
    const cell = gm(14, "B");
    cell.focus();

    fireEvent.keyDown(cell, { key: "2" });

    expect(getToothPerio(14).gm.B).toBe(2);
    expect(document.activeElement).toBe(gm(14, "DB"));
  });

  it("'-' then a digit commits a negative (coronal/pseudopocket) reading", () => {
    openGrid();
    fireEvent.change(pd(14, "B"), { target: { value: "3" } });
    fireEvent.change(pd(14, "DB"), { target: { value: "5" } });
    const cell = gm(14, "B");
    cell.focus();

    fireEvent.keyDown(cell, { key: "-" });
    expect(cell.dataset.pendingSign).toBe("-"); // primed, not yet committed
    expect(getToothPerio(14).gm.B).toBeUndefined();

    fireEvent.keyDown(cell, { key: "2" });

    expect(getToothPerio(14).gm.B).toBe(-2);
    expect(getToothCal(14).get("B")).toBe(1); // CAL = pd(3) + gm(-2)
    expect(document.activeElement).toBe(gm(14, "DB"));
  });

  // Regression test for review Finding 1 (Medium, silent clinical data
  // corruption): a primed '-' must NOT survive a non-keyboard focus change
  // (e.g. a mouse click to another cell fires no keydown on the primed
  // input at all, so the old keydown-only clearing never ran). Before the
  // fix, refocusing the SAME gm cell later and typing a plain digit would
  // silently compose a negative value even though '-' was never pressed
  // this time.
  it("a primed '-' does NOT survive a non-keyboard focus change (blur/focusout clears it)", () => {
    openGrid();
    fireEvent.change(pd(14, "B"), { target: { value: "3" } });
    fireEvent.change(pd(14, "DB"), { target: { value: "5" } });
    const cell = gm(14, "B");
    const other = gm(14, "DB");
    cell.focus();

    fireEvent.keyDown(cell, { key: "-" });
    expect(cell.dataset.pendingSign).toBe("-"); // primed, not yet committed

    // Leave the cell via a plain focus change — NO keydown fires on `cell`.
    other.focus();
    fireEvent.focusOut(cell, { relatedTarget: other });

    expect(cell.dataset.pendingSign).toBeUndefined(); // prime must be cleared

    // Return to the SAME cell and type a plain digit — must commit POSITIVE.
    cell.focus();
    fireEvent.keyDown(cell, { key: "7" });

    expect(getToothPerio(14).gm.B).toBe(7);
  });
});

describe("P2 Task 3: arrow-key navigation", () => {
  it("ArrowRight/ArrowLeft move focus within a row (site-by-site, tooth-to-tooth) without writing state", () => {
    openGrid();
    const start = pd(18, "MB");
    start.focus();

    fireEvent.keyDown(start, { key: "ArrowRight" });
    expect(document.activeElement).toBe(pd(18, "B"));

    fireEvent.keyDown(pd(18, "B"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(pd(18, "DB"));

    fireEvent.keyDown(pd(18, "DB"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(pd(18, "B"));

    // No PD was ever set by pure navigation.
    expect(getToothPerio(18).pd).toEqual({});
  });

  it("ArrowDown moves from a charted PD cell to its (now-enabled) GM cell; ArrowUp moves back", () => {
    openGrid();
    fireEvent.change(pd(26, "L"), { target: { value: "4" } });
    const pdCell = pd(26, "L");
    pdCell.focus();

    fireEvent.keyDown(pdCell, { key: "ArrowDown" });
    expect(document.activeElement).toBe(gm(26, "L"));

    fireEvent.keyDown(gm(26, "L"), { key: "ArrowUp" });
    expect(document.activeElement).toBe(pdCell);
  });

  it("ArrowDown to an un-charted (disabled) GM cell does not move focus", () => {
    openGrid();
    const pdCell = pd(26, "DL");
    pdCell.focus();

    fireEvent.keyDown(pdCell, { key: "ArrowDown" });

    expect(document.activeElement).toBe(pdCell);
  });
});

describe("P2 Task 3: Space/Enter toggles BOP", () => {
  it("Space on a focused BOP cell toggles it via setPerioSite", () => {
    openGrid();
    fireEvent.change(pd(26, "MB"), { target: { value: "4" } });
    const bopCell = bop(26, "MB");
    bopCell.focus();

    fireEvent.keyDown(bopCell, { key: " " });
    expect(getToothPerio(26).bop).toEqual(["MB"]);
    expect(bopCell.checked).toBe(true);

    fireEvent.keyDown(bopCell, { key: " " });
    expect(getToothPerio(26).bop).toEqual([]);
    expect(bopCell.checked).toBe(false);
  });

  it("Enter on a focused BOP cell also toggles it", () => {
    openGrid();
    fireEvent.change(pd(26, "MB"), { target: { value: "4" } });
    const bopCell = bop(26, "MB");
    bopCell.focus();

    fireEvent.keyDown(bopCell, { key: "Enter" });
    expect(getToothPerio(26).bop).toEqual(["MB"]);
  });
});

describe("P2 Task 3: clearing a PD cell un-charts (existing change-event path)", () => {
  it("emptying a charted PD cell removes pd/gm/bop/cal for that site", () => {
    openGrid();
    const pdCell = pd(26, "MB");
    fireEvent.change(pdCell, { target: { value: "4" } });
    fireEvent.change(gm(26, "MB"), { target: { value: "2" } });
    fireEvent.click(bop(26, "MB"));
    expect(getToothPerio(26).pd.MB).toBe(4);
    expect(getToothCal(26).get("MB")).toBe(6);
    expect(getToothPerio(26).bop).toEqual(["MB"]);

    fireEvent.change(pdCell, { target: { value: "" } });

    expect(getToothPerio(26).pd.MB).toBeUndefined();
    expect(getToothPerio(26).gm.MB).toBeUndefined();
    expect(getToothPerio(26).bop).toEqual([]);
    expect(getToothCal(26).get("MB")).toBeUndefined();
    expect(document.getElementById("perio-fg-cal-26-MB")!.textContent).toBe("");
  });
});

describe("P2 Task 3: read-only mode disables keyboard entry", () => {
  it("a digit keydown on a PD cell is a no-op when read-only", () => {
    openGrid();
    setReadOnly(true);
    const cell = pd(18, "MB");

    fireEvent.keyDown(cell, { key: "3" });

    expect(getToothPerio(18).pd.MB).toBeUndefined();
    expect(document.activeElement).not.toBe(pd(18, "B"));
  });

  it("PD/GM cells are disabled (not focusable) when read-only, mirroring Task 2's gating", () => {
    setReadOnly(true);
    openGrid();
    expect(pd(18, "MB").disabled).toBe(true);
    setReadOnly(false);
  });
});

// Deferred fix (P2 follow-up, Task 1): toggling readOnly while the perio
// chart is already open used to be a no-op (the grid's disabled state is
// baked in at open/resync, and setReadOnly() in odontogram.ts only ever
// toggled `.read-only` on `.panel`/`.tooth-grid` — never the perio
// container). This extends `setReadOnly()` to ALSO toggle `.read-only` on
// the perio container(s) — `#perioOverlay` (popup) and `#perioInlinePanel`
// (inline "Dental Chart" housing) — so the CSS pointer-events lock applies
// live, exactly like `.panel`.
describe("P2 Task 1 (deferred fix): setReadOnly() locks the perio chart live", () => {
  it("popup mode: setReadOnly(true) adds .read-only to #perioOverlay live; setReadOnly(false) removes it", () => {
    openGrid(); // renders <PerioChart open onClose={...} /> -> #perioOverlay
    const overlay = document.getElementById("perioOverlay")!;
    expect(overlay).toBeTruthy();
    expect(overlay.classList.contains("read-only")).toBe(false);

    setReadOnly(true);
    expect(overlay.classList.contains("read-only")).toBe(true);

    setReadOnly(false);
    expect(overlay.classList.contains("read-only")).toBe(false);
  });

  it("inline mode: setReadOnly(true) adds .read-only to #perioInlinePanel live; setReadOnly(false) removes it", () => {
    render(createElement(PerioChart, { inline: true }));
    const panel = document.getElementById("perioInlinePanel")!;
    expect(panel).toBeTruthy();
    expect(panel.classList.contains("read-only")).toBe(false);

    setReadOnly(true);
    expect(panel.classList.contains("read-only")).toBe(true);

    setReadOnly(false);
    expect(panel.classList.contains("read-only")).toBe(false);
  });

  it("setReadOnly() is a safe no-op when no perio container is mounted (neither overlay nor inline panel present)", () => {
    expect(document.getElementById("perioOverlay")).toBeNull();
    expect(document.getElementById("perioInlinePanel")).toBeNull();
    expect(() => setReadOnly(true)).not.toThrow();
    setReadOnly(false);
  });
});

describe("P2 Task 3: arch-order sanity (matches the grid's own UPPER/LOWER arrays)", () => {
  it("the first tooth of the pd row is the first upper-arch tooth and the row spans into the lower arch", () => {
    expect(UPPER_ARCH[0]).toBe(18);
    expect(LOWER_ARCH[0]).toBe(48);
    expect(nextPerioCell({ toothNo: UPPER_ARCH[UPPER_ARCH.length - 1], site: "DB", row: "pd" })).toEqual({
      toothNo: LOWER_ARCH[0],
      site: "MB",
      row: "pd",
    });
  });
});
