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
// Both cases below assert behaviour, not the hook it is implemented with: the
// first pins the invariant directly, the second pins what the user sees.
import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { createElement, useEffect } from "react";
import { render, cleanup } from "@testing-library/react";
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
