import { describe, it, expect } from "vitest";
import { translations } from "../i18n/translations";

describe("diagnosis coding-pack i18n", () => {
  it("has the coding-pack setting keys in all 12 languages", () => {
    const keys = ["settings.diagnosisCoding", "settings.diagnosisCoding.desc", "settings.diagnosisCoding.none", "settings.diagnosisCoding.bno10"];
    expect(Object.keys(translations)).toHaveLength(12);
    for (const lang of Object.keys(translations)) {
      for (const k of keys) {
        expect(translations[lang as keyof typeof translations][k], `${lang}:${k}`).toBeDefined();
      }
    }
  });
});
