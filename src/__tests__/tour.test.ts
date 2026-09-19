// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, afterEach } from "vitest";
import { TOUR_STEPS, clampStep, startIntroTour } from "../tour";
import { translations } from "../i18n/translations";

function counterText(): string | null {
  return document.querySelector(".odon-tour-counter")?.textContent ?? null;
}
function press(key: string){
  document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

afterEach(() => {
  press("Escape"); // full teardown (removes overlay + key handler)
  document.body.innerHTML = "";
});

describe("intro tour model", () => {
  it("has 18 steps with semantic i18n keys and no dead selectors", () => {
    expect(TOUR_STEPS).toHaveLength(18);
    for (const s of TOUR_STEPS) {
      expect(typeof s.selector).toBe("string");
      expect(s.titleKey).toMatch(/^intro\.[a-zA-Z]+\.title$/);
      expect(s.textKey).toMatch(/^intro\.[a-zA-Z]+\.text$/);
    }
    const selectors = TOUR_STEPS.map((s) => s.selector);
    // The old broken target is gone; the real controls are targeted.
    expect(selectors).not.toContain("#crownSelect");
    expect(selectors).toContain("#restorationSelect");   // step 6 fix
    expect(selectors).toContain("#rootPeriodontiumSection"); // root canal (new)
    expect(selectors).toContain("#languageMenu");         // step 9 language (fix)
    expect(selectors).toContain("#btnSettingsMenu");      // settings/numbering (fix)
    expect(selectors).toContain("#appViewToggle");        // perio view (new)
    expect(selectors).toContain("#perioInlinePanel");     // perio charting (new)
    expect(selectors).toContain("#diagnosesSection");     // diagnoses card (2.5.0)
    expect(selectors).toContain("#openCaseDiagnosesBtn"); // case/regional diagnoses pop-up (2.5.0)
  });

  it("has every tour i18n key in all 12 languages", () => {
    const langs = Object.keys(translations);
    expect(langs).toHaveLength(12);
    for (const lang of langs) {
      const table = translations[lang as keyof typeof translations];
      for (const s of TOUR_STEPS) {
        expect(table[s.titleKey], `${lang}:${s.titleKey}`).toBeDefined();
        expect(table[s.textKey], `${lang}:${s.textKey}`).toBeDefined();
      }
      for (const k of ["intro.start", "intro.next", "intro.back", "intro.skip", "intro.finish"]) {
        expect(table[k], `${lang}:${k}`).toBeDefined();
      }
    }
  });

  it("clampStep keeps the index within bounds", () => {
    expect(clampStep(-1)).toBe(0);
    expect(clampStep(99)).toBe(17);
    expect(clampStep(5)).toBe(5);
  });
});

describe("intro tour navigation (jsdom)", () => {
  it("renders a card and steps forward with the ArrowRight key across re-renders", () => {
    // Regression: render() used to null the key handler, so arrow stepping died
    // after the first step. It must survive repeated re-renders.
    startIntroTour();
    expect(document.querySelector(".odon-tour-card")).not.toBeNull();
    // No #appViewToggle and no #openCaseDiagnosesBtn in the DOM -> the three gated
    // steps (perio view, perio chart, case-diagnoses pop-up) are skipped -> 15 shown.
    expect(counterText()).toBe("1 / 15");
    press("ArrowRight");
    expect(counterText()).toBe("2 / 15");
    press("ArrowRight");
    expect(counterText()).toBe("3 / 15"); // handler persisted
    press("ArrowLeft");
    expect(counterText()).toBe("2 / 15");
  });

  it("Escape tears the overlay down", () => {
    startIntroTour();
    expect(document.querySelector(".odon-tour-backdrop")).not.toBeNull();
    press("Escape");
    expect(document.querySelector(".odon-tour-backdrop")).toBeNull();
    expect(document.querySelector(".odon-tour-card")).toBeNull();
  });

  it("includes the perio steps only when the periodontal view toggle is present", () => {
    const toggle = document.createElement("div");
    toggle.id = "appViewToggle";
    toggle.innerHTML =
      '<button id="appViewOdontogram" class="is-active"></button><button id="appViewDentalChart"></button>';
    document.body.appendChild(toggle);
    startIntroTour();
    // The two perio steps are available; the case-diagnoses step still is not
    // (its own button, #openCaseDiagnosesBtn, is absent here) -> 18 - 1 = 17.
    expect(counterText()).toBe("1 / 17");
  });
});
