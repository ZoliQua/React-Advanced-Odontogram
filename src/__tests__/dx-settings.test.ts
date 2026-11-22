import { describe, it, expect, beforeEach } from "vitest";
import { translations } from "../i18n/translations";
import { LANGUAGES } from "../i18n/languages";
import { getSnomedEnabled, setSnomedEnabled } from "../odontogram";

describe("diagnosis coding-pack i18n", () => {
  it("has the coding-pack setting keys in every supported language", () => {
    const keys = ["settings.diagnosisCoding", "settings.diagnosisCoding.desc", "settings.diagnosisCoding.none", "settings.diagnosisCoding.bno10"];
    // Against the registry, not a literal: a language added to LANGUAGES but
    // missing from `translations` should fail here rather than be skipped.
    expect(Object.keys(translations).sort()).toEqual([...LANGUAGES].sort());
    for (const lang of Object.keys(translations)) {
      for (const k of keys) {
        expect(translations[lang as keyof typeof translations][k], `${lang}:${k}`).toBeDefined();
      }
    }
  });

  it("has the ICD-10-CM settings option label in all 12 languages", () => {
    for (const lang of Object.keys(translations)) {
      const v = translations[lang as keyof typeof translations]["settings.diagnosisCoding.icd10cm"];
      expect(typeof v === "string" && v.length > 0, `${lang}:settings.diagnosisCoding.icd10cm`).toBe(true);
    }
  });
});

describe("snomedEnabled flag", () => {
  beforeEach(() => setSnomedEnabled(false));

  it("defaults off and round-trips", () => {
    expect(getSnomedEnabled()).toBe(false);
    setSnomedEnabled(true);
    expect(getSnomedEnabled()).toBe(true);
    setSnomedEnabled(false);
    expect(getSnomedEnabled()).toBe(false);
  });

  it("has the SNOMED settings label in all 12 languages", () => {
    for (const lang of Object.keys(translations)) {
      const v = translations[lang as keyof typeof translations]["settings.snomed"];
      expect(typeof v === "string" && v.length > 0, `${lang}:settings.snomed`).toBe(true);
    }
  });

  it("has the SNOMED settings description in all 12 languages", () => {
    for (const lang of Object.keys(translations)) {
      const v = translations[lang as keyof typeof translations]["settings.snomed.desc"];
      expect(typeof v === "string" && v.length > 0, `${lang}:settings.snomed.desc`).toBe(true);
    }
  });
});
