// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Every selection change enables or disables the whole control panel, and hides
// the label of each disabled control. Each control's `label[for]` used to be
// looked up with its own `document.querySelector` — across a tooth grid of some
// twenty thousand nodes — and a control with an id but no such label paid that
// full scan on every click. Under jsdom that was ~340 ms of a ~380 ms selection
// change; gathering the labels in one pass brought a click to ~65 ms.
//
// Timing is not asserted (it would be flaky); the CAUSE is: a selection change
// must not look a label up per control. The behaviour itself — disabled control,
// hidden label — is pinned alongside, since the fix rewrote the loop that does it.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import { __resetChartStateForTest, setNumberingSystem, clearSelection } from "../odontogram";

vi.setConfig({ testTimeout: 60000, hookTimeout: 60000 });

beforeEach(() => {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  })) as unknown as typeof window.matchMedia;
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});

afterEach(() => { vi.restoreAllMocks(); cleanup(); });

const tile = (n: number) => document.querySelector(`.tooth-tile.side-view[data-tooth="${n}"]`) as HTMLElement;

async function mountWithFixture() {
  render(createElement(App, { language: "en" }));
  await waitFor(() => expect(document.getElementById("toothGrid")!.childElementCount).toBeGreaterThan(0));
  // A control with a SEPARATE `label[for]` — the case the per-control lookup
  // served. The label sits outside the panel on purpose: the lookup has always
  // been document-wide, and that must not quietly narrow.
  const panel = document.querySelector(".panel-body")!;
  const input = document.createElement("input");
  input.id = "zz-fixture-control";
  panel.appendChild(input);
  const label = document.createElement("label");
  label.htmlFor = "zz-fixture-control";
  document.body.appendChild(label);
  // …and one wrapped in its label, the other supported shape.
  const wrapper = document.createElement("label");
  const wrapped = document.createElement("input");
  wrapper.appendChild(wrapped);
  panel.appendChild(wrapper);
  return { input, label, wrapped, wrapper };
}

describe("selection change: control panel enable/disable", () => {
  it("disables controls and hides their labels with no tooth selected, and restores them on selection", async () => {
    const f = await mountWithFixture();

    fireEvent.click(tile(16));
    expect(f.input.disabled).toBe(false);
    expect(f.label.style.display).toBe("");
    expect(f.wrapped.disabled).toBe(false);
    expect(f.wrapper.style.display).toBe("");

    clearSelection();
    expect(f.input.disabled).toBe(true);
    expect(f.label.style.display).toBe("none");
    expect(f.wrapped.disabled).toBe(true);
    expect(f.wrapper.style.display).toBe("none");

    fireEvent.click(tile(21));
    expect(f.input.disabled).toBe(false);
    expect(f.label.style.display).toBe("");
  });

  it("does not look a label up per control on a selection change", async () => {
    await mountWithFixture();
    const spy = vi.spyOn(Document.prototype, "querySelector");
    fireEvent.click(tile(16));
    clearSelection();
    fireEvent.click(tile(21));
    const perControlLookups = spy.mock.calls.filter(([sel]) => String(sel).startsWith("label[for="));
    expect(perControlLookups, "a selection change scanned the whole document once per control").toEqual([]);
  });
});
