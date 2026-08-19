// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// DX-3b Task 4 — i18n-key-presence test for the case/regional diagnoses card.
// `case.diagnoses.section`/`case.diagnoses.add`/`case.diagnoses.remove`, the
// four `caseDx.laterality.*` qualifiers, and a `dx.case.<key>` label for every
// one of the 28 `CaseConditionKey`s (`CASE_DX_CODES`) must exist in ALL 12
// languages — reads the REAL translations table directly, mirroring the
// key-presence pattern in `dx-card.test.tsx`'s "DX-2 Task 4" describe block.
import { describe, it, expect } from "vitest";
import { CASE_DX_CODES } from "../dx/caseCodes";

const CARD_KEYS = [
  "case.diagnoses.section",
  "case.diagnoses.add",
  "case.diagnoses.remove",
  "caseDx.laterality.unspecified",
  "caseDx.laterality.left",
  "caseDx.laterality.right",
  "caseDx.laterality.bilateral",
];
const DX_KEYS = Object.keys(CASE_DX_CODES).map((k) => `dx.case.${k}`);
const ALL_KEYS = [...CARD_KEYS, ...DX_KEYS];
const ALL_LANGUAGES = ["hu", "en", "de", "es", "it", "sk", "pl", "ru", "pt-br", "zh", "ar", "fr"] as const;

describe("DX-3b Task 4: case/regional diagnoses i18n keys present in all languages", () => {
  it("covers all 28 CaseConditionKeys", () => {
    expect(DX_KEYS.length).toBe(28);
  });

  for (const lang of ALL_LANGUAGES) {
    it(`${lang} has all ${ALL_KEYS.length} case-diagnosis keys with non-empty values`, async () => {
      const { translations } = await import("../i18n/translations");
      const table = translations[lang as (typeof ALL_LANGUAGES)[number]];
      const missing = ALL_KEYS.filter((k) => typeof table[k] !== "string" || table[k].trim() === "");
      expect(missing).toEqual([]);
    });
  }
});
