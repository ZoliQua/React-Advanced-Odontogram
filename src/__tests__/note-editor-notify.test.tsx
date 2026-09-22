// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// The per-tooth note is part of the export payload, so saving or deleting one
// from the note-editor popover must fire notifyStateChange() like any other
// tooth edit — otherwise the localStorage autosave and hosts persisting the
// chart through onStateChange miss it until the next unrelated edit.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import {
  __resetChartStateForTest,
  getStatusChart,
  onStateChange,
  rebuildGrid,
  setNotesEnabled,
  setNumberingSystem,
} from "../odontogram";

vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 });

// Same jsdom stubs as tier2-rewire.test.tsx: a real initOdontogram() needs them.
function installDomStubs() {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  })) as unknown as typeof window.matchMedia;
  if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver === "undefined") {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
}

beforeEach(() => {
  installDomStubs();
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
});

afterEach(() => {
  setNotesEnabled(false);
  cleanup();
});

async function waitForGrid() {
  await waitFor(() => {
    const grid = document.getElementById("toothGrid");
    expect(grid && grid.childElementCount).toBeGreaterThan(0);
  });
}

function openNoteEditor(toothNo: number): { textarea: HTMLTextAreaElement; save: HTMLButtonElement; del: HTMLButtonElement } {
  const tile = document.querySelector(`.tooth-tile.side-view[data-tooth="${toothNo}"]`) as HTMLElement;
  fireEvent.dblClick(tile);
  const popover = document.querySelector(".odon-note-popover") as HTMLElement;
  expect(popover).toBeTruthy();
  const [save, del] = Array.from(popover.querySelectorAll<HTMLButtonElement>(".odon-note-actions button"));
  return { textarea: popover.querySelector("textarea") as HTMLTextAreaElement, save: save!, del: del! };
}

function notifiesFor(action: () => void): number {
  const spy = vi.fn();
  const unsub = onStateChange(spy);
  action();
  unsub();
  return spy.mock.calls.length;
}

describe("note editor: save/delete notify onStateChange", () => {
  it("saving a new note notifies once and lands in the payload", async () => {
    render(createElement(App, { language: "en", enableNotes: true }));
    await waitForGrid();

    const { textarea, save } = openNoteEditor(11);
    textarea.value = "  sensitive to cold  ";
    expect(notifiesFor(() => fireEvent.click(save))).toBe(1);
    expect(getStatusChart().teeth[11].note).toBe("sensitive to cold");
    expect(document.querySelector(".odon-note-popover")).toBeNull();
  });

  it("re-saving the same note does not notify", async () => {
    render(createElement(App, { language: "en", enableNotes: true }));
    await waitForGrid();

    const first = openNoteEditor(11);
    first.textarea.value = "same";
    fireEvent.click(first.save);

    const second = openNoteEditor(11);
    expect(second.textarea.value).toBe("same");
    expect(notifiesFor(() => fireEvent.click(second.save))).toBe(0);
  });

  it("deleting a note notifies once and removes it from the payload", async () => {
    render(createElement(App, { language: "en", enableNotes: true }));
    await waitForGrid();

    const first = openNoteEditor(11);
    first.textarea.value = "to be removed";
    fireEvent.click(first.save);

    const second = openNoteEditor(11);
    expect(notifiesFor(() => fireEvent.click(second.del))).toBe(1);
    expect(getStatusChart().teeth[11].note).toBeUndefined();

    // Deleting an already-empty note is a no-op.
    const third = openNoteEditor(11);
    expect(notifiesFor(() => fireEvent.click(third.del))).toBe(0);
  });

  it("the label badge survives a grid rebuild", async () => {
    render(createElement(App, { language: "en", enableNotes: true }));
    await waitForGrid();

    const { textarea, save } = openNoteEditor(11);
    textarea.value = "keep me";
    fireEvent.click(save);
    const badge = () => document.querySelectorAll(".tooth-label-cell .tooth-note-icon").length;
    expect(badge()).toBe(1);

    await rebuildGrid();
    await waitForGrid();
    expect(badge()).toBe(1);
  });
});
