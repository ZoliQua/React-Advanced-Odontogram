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
});
