// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Issue #38: `<OdontogramProvider language="es">` painted the periodontal
// chart's labels in English.
//
// The cause is effect ordering, not translation. React runs child effects
// before the parent's, so a child that builds its DOM imperatively in a
// passive `useEffect` — PerioChart does, resolving labels through the
// module-level `t()`, which reads the GLOBAL language — ran before the
// provider's `useI18n` effect had set that global language. The labels were
// built against the English fallback, and nothing rebuilt them afterwards.
//
// `useI18n` sets the language in a LAYOUT effect now, which React runs before
// any passive effect, child or parent.
//
// A language change AFTER mount is the same bug from the other side: the grid
// is built once and no effect in `PerioChart` depends on the language, so the
// labels stayed in whatever language they were built in. The chart subscribes
// to `onI18nChange` now and rebuilds the grid, exactly as it already does for a
// row-visibility change.
//
// Every case below asserts behaviour, not the hook it is implemented with: the
// first pins the invariant directly, the others pin what the user sees.
import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { createElement, useEffect } from "react";
import { act, render, cleanup } from "@testing-library/react";
import { OdontogramProvider } from "../OdontogramContext";
import PerioChart from "../PerioChart";
import { getI18nLanguage, setI18nLanguage, t } from "../i18n/useI18n";

beforeEach(async () => {
  await setI18nLanguage("en");
});

afterEach(async () => {
  cleanup();
  document.body.innerHTML = "";
  await setI18nLanguage("en");
});

/** A child that reads the global language in a passive effect, exactly as the
 *  imperative chart builders do. */
function LanguageProbe({ seen }: { seen: string[] }) {
  useEffect(() => { seen.push(getI18nLanguage()); }, [seen]);
  return null;
}

describe("the provider's language is in place before its children's effects run (#38)", () => {
  it("a child's passive effect already sees the requested language", () => {
    const seen: string[] = [];
    render(
      createElement(OdontogramProvider, { language: "es" },
        createElement(LanguageProbe, { seen })),
    );
    expect(seen, "the child effect must not run before the language is set").toEqual(["es"]);
  });

  it("the periodontal chart's labels render in the provider's language, not the English fallback", () => {
    const { container } = render(
      createElement(OdontogramProvider, { language: "es" },
        createElement(PerioChart, { open: true, onClose: () => {} })),
    );
    const text = container.textContent ?? "";
    expect(text, "the Spanish label is missing").toContain(t("perio.mobility", "es"));
    expect(text, "the English fallback label is still on screen").not.toContain(t("perio.mobility", "en"));
  });
});

describe("a language change after mount relabels the periodontal chart (#38, second defect)", () => {
  it("switching the provider's language rebuilds the grid in the new language", () => {
    const chart = () => createElement(PerioChart, { open: true, onClose: () => {} });
    const { container, rerender } = render(
      createElement(OdontogramProvider, { language: "en" }, chart()),
    );
    expect(container.textContent ?? "", "the English label should be there to begin with")
      .toContain(t("perio.mobility", "en"));

    act(() => {
      rerender(createElement(OdontogramProvider, { language: "es" }, chart()));
    });

    const text = container.textContent ?? "";
    expect(text, "the Spanish label did not arrive").toContain(t("perio.mobility", "es"));
    expect(text, "the English label survived the switch").not.toContain(t("perio.mobility", "en"));
  });

  // The rebuild replaces every control, so the clinician's place in the grid
  // has to be put back explicitly. Reported by a host whose language toggle
  // sits in the app header rather than in a settings dialog: a clinician can
  // be part-way through a perio cell when the switch happens, and the chart
  // losing the caret costs them their place in the mouth.
  it("puts focus back on the cell that had it", () => {
    const chart = () => createElement(PerioChart, { open: true, onClose: () => {} });
    const { container, rerender } = render(
      createElement(OdontogramProvider, { language: "en" }, chart()),
    );

    const cell = container.querySelector<HTMLInputElement>("#perio-fg-pd-11-MB");
    expect(cell, "the probing cell this test is about is not in the grid").not.toBeNull();
    cell!.focus();
    expect(document.activeElement).toBe(cell);

    act(() => {
      rerender(createElement(OdontogramProvider, { language: "es" }, chart()));
    });

    // The node is a different object now — the grid was rebuilt — so identity
    // is checked through the locator, which is the thing that must survive.
    const rebuilt = container.querySelector<HTMLInputElement>("#perio-fg-pd-11-MB");
    expect(rebuilt, "the cell is gone after the rebuild").not.toBeNull();
    expect(rebuilt).not.toBe(cell);
    expect(document.activeElement, "the clinician lost their place in the chart").toBe(rebuilt);
  });

  it("does not steal focus from outside the chart", () => {
    // The other half of the rule. A rebuild can also be triggered from the
    // host's own UI — the language control itself, a settings dialog — and
    // pulling focus into the chart from there would be worse than losing it.
    const chart = () => createElement(PerioChart, { open: true, onClose: () => {} });
    const { rerender } = render(
      createElement(OdontogramProvider, { language: "en" }, chart()),
    );

    const outside = document.createElement("button");
    outside.id = "host-language-toggle";
    document.body.appendChild(outside);
    outside.focus();
    expect(document.activeElement).toBe(outside);

    act(() => {
      rerender(createElement(OdontogramProvider, { language: "es" }, chart()));
    });

    expect(document.activeElement, "the chart grabbed focus off the host's control").toBe(outside);
    outside.remove();
  });

  it("gives every focusable control in the grid the locator the restore needs", () => {
    // The load-bearing assumption. Focus is put back by `id`, so a control
    // built without one silently degrades to the old lose-your-place
    // behaviour instead of failing visibly — pin it here rather than find out
    // from a report.
    const { container } = render(
      createElement(OdontogramProvider, { language: "en" }, 
        createElement(PerioChart, { open: true, onClose: () => {} })),
    );
    // Scoped to the grid the rebuild actually replaces. The chrome around it
    // — the overlay switch, the close button, the row info buttons — is
    // rendered by React and survives a rebuild untouched, so it needs no
    // locator.
    const grid = container.querySelector<HTMLElement>(".perio-fullgrid-scroll");
    expect(grid, "the grid container this test is scoped to is gone").not.toBeNull();
    const focusable = Array.from(
      grid!.querySelectorAll<HTMLElement>("input, button, select, textarea"),
    );
    expect(focusable.length, "no controls found — this test is not checking anything")
      .toBeGreaterThan(50);
    const anonymous = focusable.filter((el) => !el.id).map((el) => el.className);
    expect(anonymous, "these controls cannot be refocused after a rebuild").toEqual([]);

    // And the locator has to point at ONE control: a duplicate id would send
    // focus to whichever copy came first, which is worse than losing it.
    const ids = focusable.map((el) => el.id);
    const duplicated = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    expect(duplicated, "these ids appear more than once in the grid").toEqual([]);
  });
});
