// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from 'vitest';
import { translations, type Language } from '../i18n/translations';

const LANGUAGES = Object.keys(translations) as Language[];

describe('Accessibility & Read-only i18n', () => {
  it('all languages have readOnly.label key', () => {
    for (const lang of LANGUAGES) {
      const t = translations[lang] as Record<string, string>;
      expect(t['readOnly.label'], `${lang} missing readOnly.label`).toBeDefined();
      expect(t['readOnly.label'].length).toBeGreaterThan(0);
    }
  });

  it('readOnly.label key count matches across all languages', () => {
    const huKeys = Object.keys(translations.hu).filter(k => k.startsWith('readOnly.'));
    for (const lang of LANGUAGES) {
      const langKeys = Object.keys(translations[lang] as Record<string, string>).filter(k => k.startsWith('readOnly.'));
      expect(langKeys.length, `${lang} readOnly key count mismatch`).toBe(huKeys.length);
    }
  });

  it('all languages have chart.aria.toothGrid key', () => {
    for (const lang of LANGUAGES) {
      const t = translations[lang] as Record<string, string>;
      expect(t['chart.aria.toothGrid'], `${lang} missing chart.aria.toothGrid`).toBeDefined();
    }
  });
});

describe('Notes i18n', () => {
  const NOTE_KEYS = ['note.title', 'note.save', 'note.delete', 'note.placeholder'];

  it('all languages have all note keys', () => {
    for (const lang of LANGUAGES) {
      const t = translations[lang] as Record<string, string>;
      for (const key of NOTE_KEYS) {
        expect(t[key], `${lang} missing ${key}`).toBeDefined();
        expect(t[key].length, `${lang} empty ${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('note key count matches across all languages', () => {
    const huKeys = Object.keys(translations.hu).filter(k => k.startsWith('note.'));
    for (const lang of LANGUAGES) {
      const langKeys = Object.keys(translations[lang] as Record<string, string>).filter(k => k.startsWith('note.'));
      expect(langKeys.length, `${lang} note key count mismatch`).toBe(huKeys.length);
    }
  });
});

describe('ARIA navigation rows', () => {
  const UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
  const LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

  it('upper row has 16 teeth', () => {
    expect(UPPER).toHaveLength(16);
  });

  it('lower row has 16 teeth', () => {
    expect(LOWER).toHaveLength(16);
  });

  it('no duplicates in navigation rows', () => {
    const all = [...UPPER, ...LOWER];
    expect(new Set(all).size).toBe(all.length);
  });

  it('all teeth are in valid FDI range', () => {
    const all = [...UPPER, ...LOWER];
    for (const tooth of all) {
      const quadrant = Math.floor(tooth / 10);
      const position = tooth % 10;
      expect(quadrant).toBeGreaterThanOrEqual(1);
      expect(quadrant).toBeLessThanOrEqual(4);
      expect(position).toBeGreaterThanOrEqual(1);
      expect(position).toBeLessThanOrEqual(8);
    }
  });
});
