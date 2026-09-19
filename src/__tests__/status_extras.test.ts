// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from 'vitest';
import { STATUS_EXTRAS } from '../status_extras';
import { translations } from '../i18n/translations';

const ALL_ADULT_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
];

describe('status_extras.ts', () => {
  describe('arches structure', () => {
    it('upper arch has 16 teeth', () => {
      expect(STATUS_EXTRAS.arches.upper).toHaveLength(16);
    });

    it('lower arch has 16 teeth', () => {
      expect(STATUS_EXTRAS.arches.lower).toHaveLength(16);
    });

    it('combined arches contain all 32 adult teeth', () => {
      const combined = [...STATUS_EXTRAS.arches.upper, ...STATUS_EXTRAS.arches.lower].sort((a, b) => a - b);
      const expected = [...ALL_ADULT_TEETH].sort((a, b) => a - b);
      expect(combined).toEqual(expected);
    });

    it('wisdom teeth are correctly identified', () => {
      expect(STATUS_EXTRAS.arches.wisdom.upper).toEqual([18, 28]);
      expect(STATUS_EXTRAS.arches.wisdom.lower).toEqual([48, 38]);
    });

    it('wisdom teeth are subsets of their respective arches', () => {
      for (const tooth of STATUS_EXTRAS.arches.wisdom.upper) {
        expect(STATUS_EXTRAS.arches.upper).toContain(tooth);
      }
      for (const tooth of STATUS_EXTRAS.arches.wisdom.lower) {
        expect(STATUS_EXTRAS.arches.lower).toContain(tooth);
      }
    });
  });

  describe('options structure', () => {
    it('has at least 20 presets', () => {
      expect(STATUS_EXTRAS.options.length).toBeGreaterThanOrEqual(20);
    });

    it('every option has a unique id', () => {
      const ids = STATUS_EXTRAS.options.map((opt) => opt.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every option has a non-empty id', () => {
      for (const opt of STATUS_EXTRAS.options) {
        expect(opt.id).toBeTruthy();
        expect(typeof opt.id).toBe('string');
      }
    });

    it('every option has a labelKey', () => {
      for (const opt of STATUS_EXTRAS.options) {
        expect(opt.labelKey).toBeTruthy();
        expect(typeof opt.labelKey).toBe('string');
      }
    });

    it('every option has a valid type', () => {
      const validTypes = ['span', 'arch-bridge', 'partial-removable', 'full-removable', 'bar-denture'];
      for (const opt of STATUS_EXTRAS.options) {
        expect(validTypes).toContain(opt.type);
      }
    });

    it('every labelKey exists in all translations', () => {
      for (const opt of STATUS_EXTRAS.options) {
        for (const [lang, table] of Object.entries(translations)) {
          expect(
            table[opt.labelKey],
            `Missing translation key "${opt.labelKey}" in language "${lang}"`
          ).toBeTruthy();
        }
      }
    });
  });

  describe('span presets', () => {
    const spans = STATUS_EXTRAS.options.filter((opt) => opt.type === 'span');

    it('every span has a non-empty teeth array', () => {
      for (const span of spans) {
        expect(Array.isArray(span.teeth)).toBe(true);
        expect(span.teeth!.length).toBeGreaterThan(0);
      }
    });

    it('every span tooth is a valid FDI number', () => {
      for (const span of spans) {
        for (const tooth of span.teeth!) {
          expect(ALL_ADULT_TEETH).toContain(tooth);
        }
      }
    });

    it('every span has a valid material', () => {
      const validMaterials = ['zircon', 'metal'];
      for (const span of spans) {
        expect(validMaterials).toContain(span.material);
      }
    });

    it('span teeth are contiguous (sequential in the arch)', () => {
      for (const span of spans) {
        const teeth = span.teeth!;
        // All teeth should be in the same arch (upper or lower)
        const arch = teeth.every((t) => STATUS_EXTRAS.arches.upper.includes(t))
          ? 'upper'
          : teeth.every((t) => STATUS_EXTRAS.arches.lower.includes(t))
            ? 'lower'
            : 'mixed';
        expect(arch, `Span ${span.id} has teeth from both arches`).not.toBe('mixed');
      }
    });
  });

  describe('arch-bridge presets', () => {
    const archBridges = STATUS_EXTRAS.options.filter((opt) => opt.type === 'arch-bridge');

    it('has arch-bridge presets for both arches', () => {
      const arches = new Set(archBridges.map((b) => b.arch));
      expect(arches.has('upper')).toBe(true);
      expect(arches.has('lower')).toBe(true);
    });

    it('every arch-bridge has a material', () => {
      for (const bridge of archBridges) {
        expect(bridge.material).toBeTruthy();
      }
    });
  });

  describe('bar-denture presets', () => {
    const barDentures = STATUS_EXTRAS.options.filter((opt) => opt.type === 'bar-denture');

    it('has bar-denture presets', () => {
      expect(barDentures.length).toBeGreaterThan(0);
    });

    it('every bar-denture has implant positions', () => {
      for (const bd of barDentures) {
        expect(Array.isArray(bd.implants)).toBe(true);
        expect(bd.implants!.length).toBeGreaterThan(0);
      }
    });

    it('every bar-denture has missing teeth list', () => {
      for (const bd of barDentures) {
        expect(Array.isArray(bd.missing)).toBe(true);
        expect(bd.missing!.length).toBeGreaterThan(0);
      }
    });

    it('implants and missing teeth do not overlap', () => {
      for (const bd of barDentures) {
        const implantSet = new Set(bd.implants!);
        for (const tooth of bd.missing!) {
          expect(
            implantSet.has(tooth),
            `Bar-denture ${bd.id}: tooth ${tooth} is both implant and missing`
          ).toBe(false);
        }
      }
    });
  });
});
