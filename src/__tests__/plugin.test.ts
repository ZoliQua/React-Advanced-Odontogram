// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { getQuadrant, LAYER_Z, type OdontogramPlugin } from "../plugin";
import { translations } from "../i18n/translations";

describe("plugin.ts", () => {
  describe("getQuadrant", () => {
    it("returns 1 for upper-right teeth (11-18)", () => {
      expect(getQuadrant(11)).toBe(1);
      expect(getQuadrant(18)).toBe(1);
    });
    it("returns 2 for upper-left teeth (21-28)", () => {
      expect(getQuadrant(21)).toBe(2);
      expect(getQuadrant(28)).toBe(2);
    });
    it("returns 3 for lower-left teeth (31-38)", () => {
      expect(getQuadrant(31)).toBe(3);
      expect(getQuadrant(38)).toBe(3);
    });
    it("returns 4 for lower-right teeth (41-48)", () => {
      expect(getQuadrant(41)).toBe(4);
      expect(getQuadrant(48)).toBe(4);
    });
  });

  describe("LAYER_Z", () => {
    it("has correct z-order: base < restoration < overlay", () => {
      expect(LAYER_Z.base).toBeLessThan(LAYER_Z.restoration);
      expect(LAYER_Z.restoration).toBeLessThan(LAYER_Z.overlay);
    });
    it("defines all three layers", () => {
      expect(LAYER_Z).toHaveProperty("base");
      expect(LAYER_Z).toHaveProperty("restoration");
      expect(LAYER_Z).toHaveProperty("overlay");
    });
  });

  describe("OdontogramPlugin type", () => {
    it("can create a valid plugin definition", () => {
      const plugin: OdontogramPlugin = {
        id: "test-plugin",
        label: { en: "Test Plugin", hu: "Teszt Plugin" },
        layer: "overlay",
        renderSvg: (toothNo, quadrant, customState) => {
          if (!customState) return null;
          return `<text x="0" y="0">${toothNo}-Q${quadrant}</text>`;
        },
      };
      expect(plugin.id).toBe("test-plugin");
      expect(plugin.layer).toBe("overlay");
      expect(plugin.renderSvg(11, 1, { active: true })).toContain("11-Q1");
      expect(plugin.renderSvg(11, 1, null)).toBeNull();
    });

    it("can create a plugin with panelSection", () => {
      const plugin: OdontogramPlugin = {
        id: "custom-panel",
        label: { en: "Custom" },
        layer: "base",
        renderSvg: () => null,
        panelSection: "custom",
      };
      expect(plugin.panelSection).toBe("custom");
    });
  });
});

const WARN_KEYS = [
  "warn.endoOnMissing",
  "warn.fillingOnMissing",
  "warn.crownReplaceNoCrown",
  "warn.cariesOnMissing",
  "warn.pillarNoCrown",
];

const LANGS = Object.keys(translations) as (keyof typeof translations)[];

describe("Warning i18n keys", () => {
  it.each(LANGS)("language '%s' has all warning keys", (lang) => {
    for (const key of WARN_KEYS) {
      expect(translations[lang][key], `Missing ${key} for ${lang}`).toBeDefined();
      expect(translations[lang][key].length, `Empty ${key} for ${lang}`).toBeGreaterThan(0);
    }
  });
});
