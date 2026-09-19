// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from 'vitest';
import { translations, type Language } from '../i18n/translations';

const ALL_LANGUAGES: Language[] = ['hu', 'en', 'de', 'es', 'it', 'sk', 'pl', 'ru', 'pt-br', 'zh', 'ar', 'fr'];
const PRIMARY_LANGUAGE: Language = 'hu';

describe('translations.ts', () => {
  it('exports all languages', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(translations[lang]).toBeDefined();
      expect(typeof translations[lang]).toBe('object');
    }
  });

  it('primary language (hu) has at least 100 keys', () => {
    const keys = Object.keys(translations[PRIMARY_LANGUAGE]);
    expect(keys.length).toBeGreaterThanOrEqual(100);
  });

  describe('every language has all keys from the primary language (hu)', () => {
    const primaryKeys = Object.keys(translations[PRIMARY_LANGUAGE]).sort();

    for (const lang of ALL_LANGUAGES) {
      if (lang === PRIMARY_LANGUAGE) continue;

      it(`${lang} has all ${primaryKeys.length} keys`, () => {
        const langKeys = Object.keys(translations[lang]);
        const missing = primaryKeys.filter((key) => !langKeys.includes(key));

        if (missing.length > 0) {
          // Provide a helpful error message listing missing keys
          expect(missing).toEqual([]);
        }
        expect(langKeys.length).toBe(primaryKeys.length);
      });
    }
  });

  describe('no language has extra keys not in the primary language', () => {
    const primaryKeys = new Set(Object.keys(translations[PRIMARY_LANGUAGE]));

    for (const lang of ALL_LANGUAGES) {
      if (lang === PRIMARY_LANGUAGE) continue;

      it(`${lang} has no extra keys`, () => {
        const langKeys = Object.keys(translations[lang]);
        const extra = langKeys.filter((key) => !primaryKeys.has(key));
        expect(extra).toEqual([]);
      });
    }
  });

  describe('no translation value is empty or only whitespace', () => {
    for (const lang of ALL_LANGUAGES) {
      it(`${lang} has no empty values`, () => {
        const entries = Object.entries(translations[lang]);
        const emptyKeys = entries
          .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
          .map(([key]) => key);
        expect(emptyKeys).toEqual([]);
      });
    }
  });

  describe('template placeholders are consistent', () => {
    const primaryEntries = Object.entries(translations[PRIMARY_LANGUAGE]);
    const placeholderRegex = /\{\{(\w+)\}\}/g;

    // Collect keys that have placeholders in the primary language
    const keysWithPlaceholders: { key: string; placeholders: string[] }[] = [];
    for (const [key, value] of primaryEntries) {
      const matches = [...value.matchAll(placeholderRegex)];
      if (matches.length > 0) {
        keysWithPlaceholders.push({
          key,
          placeholders: matches.map((m) => m[1]),
        });
      }
    }

    for (const lang of ALL_LANGUAGES) {
      if (lang === PRIMARY_LANGUAGE) continue;

      it(`${lang} has the same placeholders as ${PRIMARY_LANGUAGE}`, () => {
        for (const { key, placeholders } of keysWithPlaceholders) {
          const translated = translations[lang][key];
          if (!translated) continue;
          for (const ph of placeholders) {
            expect(
              translated.includes(`{{${ph}}}`),
              `${lang}.${key} is missing placeholder {{${ph}}} (value: "${translated}")`
            ).toBe(true);
          }
        }
      });
    }
  });

  describe('all values are strings', () => {
    for (const lang of ALL_LANGUAGES) {
      it(`${lang} values are all strings`, () => {
        for (const [key, value] of Object.entries(translations[lang])) {
          expect(typeof value, `${lang}.${key} should be string`).toBe('string');
        }
      });
    }
  });
});
