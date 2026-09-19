// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { translations } from "../i18n/translations";

const TOUCH_KEYS = [
  "touch.zoom.title",
  "touch.zoom.select",
  "touch.zoom.deselect",
  "touch.zoom.info",
  "touch.zoom.close",
  "touch.ctx.select",
  "touch.ctx.multiSelect",
  "touch.ctx.deselect",
  "touch.ctx.reset",
  "touch.arch.upper",
  "touch.arch.lower",
  "touch.arch.both",
  "chart.hint.touch",
];

const LANGS = Object.keys(translations) as (keyof typeof translations)[];

describe("Touch i18n keys", () => {
  it.each(LANGS)("language '%s' has all touch keys", (lang) => {
    for (const key of TOUCH_KEYS) {
      expect(translations[lang][key], `Missing ${key} for ${lang}`).toBeDefined();
      expect(translations[lang][key].length, `Empty ${key} for ${lang}`).toBeGreaterThan(0);
    }
  });

  it("touch.zoom.title contains {{tooth}} placeholder in all languages", () => {
    for (const lang of LANGS) {
      expect(translations[lang]["touch.zoom.title"]).toContain("{{tooth}}");
    }
  });

  it("touch keys are consistent across all languages", () => {
    const huKeys = TOUCH_KEYS.filter((k) => k in translations.hu);
    for (const lang of LANGS) {
      const langKeys = TOUCH_KEYS.filter((k) => k in translations[lang]);
      expect(langKeys).toEqual(huKeys);
    }
  });
});
