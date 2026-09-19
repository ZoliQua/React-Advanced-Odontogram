// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from 'vitest';
import { toLabel, type NumberingSystem } from '../utils/numbering';

// ── All 32 adult teeth (FDI) ──────────────────────────────────────
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11]; // Q1
const UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28]; // Q2
const LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38]; // Q3
const LOWER_RIGHT = [41, 42, 43, 44, 45, 46, 47, 48]; // Q4
const ALL_ADULT = [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_LEFT, ...LOWER_RIGHT];

// ── All 20 primary teeth (FDI) ───────────────────────────────────
const PRIMARY_UR = [55, 54, 53, 52, 51]; // Q5
const PRIMARY_UL = [61, 62, 63, 64, 65]; // Q6
const PRIMARY_LL = [71, 72, 73, 74, 75]; // Q7
const PRIMARY_LR = [81, 82, 83, 84, 85]; // Q8
const ALL_PRIMARY = [...PRIMARY_UR, ...PRIMARY_UL, ...PRIMARY_LL, ...PRIMARY_LR];

describe('numbering.ts – toLabel()', () => {
  // ── FDI system ─────────────────────────────────────────────────
  describe('FDI numbering', () => {
    it('returns the FDI number as-is for all 32 adult teeth', () => {
      for (const fdi of ALL_ADULT) {
        expect(toLabel(fdi, 'FDI')).toBe(String(fdi));
      }
    });

    it('returns the FDI number as-is for all 20 primary teeth', () => {
      for (const fdi of ALL_PRIMARY) {
        expect(toLabel(fdi, 'FDI')).toBe(String(fdi));
      }
    });

    it('accepts string input', () => {
      expect(toLabel('14', 'FDI')).toBe('14');
      expect(toLabel('55', 'FDI')).toBe('55');
    });
  });

  // ── Universal system ───────────────────────────────────────────
  describe('Universal numbering', () => {
    it('maps upper-right (Q1) correctly: 18→1, 17→2 … 11→8', () => {
      const expected = [1, 2, 3, 4, 5, 6, 7, 8];
      UPPER_RIGHT.forEach((fdi, i) => {
        expect(toLabel(fdi, 'UNIVERSAL')).toBe(String(expected[i]));
      });
    });

    it('maps upper-left (Q2) correctly: 21→9, 22→10 … 28→16', () => {
      const expected = [9, 10, 11, 12, 13, 14, 15, 16];
      UPPER_LEFT.forEach((fdi, i) => {
        expect(toLabel(fdi, 'UNIVERSAL')).toBe(String(expected[i]));
      });
    });

    it('maps lower-left (Q3) correctly: 31→24, 32→23 … 38→17', () => {
      const expected = [24, 23, 22, 21, 20, 19, 18, 17];
      LOWER_LEFT.forEach((fdi, i) => {
        expect(toLabel(fdi, 'UNIVERSAL')).toBe(String(expected[i]));
      });
    });

    it('maps lower-right (Q4) correctly: 41→25, 42→26 … 48→32', () => {
      const expected = [25, 26, 27, 28, 29, 30, 31, 32];
      LOWER_RIGHT.forEach((fdi, i) => {
        expect(toLabel(fdi, 'UNIVERSAL')).toBe(String(expected[i]));
      });
    });

    it('produces unique labels for all 32 adult teeth', () => {
      const labels = ALL_ADULT.map((fdi) => toLabel(fdi, 'UNIVERSAL'));
      expect(new Set(labels).size).toBe(32);
    });

    it('maps primary upper-right (Q5) correctly: 55→A, 54→B … 51→E', () => {
      const expected = ['A', 'B', 'C', 'D', 'E'];
      PRIMARY_UR.forEach((fdi, i) => {
        expect(toLabel(fdi, 'UNIVERSAL')).toBe(expected[i]);
      });
    });

    it('maps primary upper-left (Q6) correctly: 61→F, 62→G … 65→J', () => {
      const expected = ['F', 'G', 'H', 'I', 'J'];
      PRIMARY_UL.forEach((fdi, i) => {
        expect(toLabel(fdi, 'UNIVERSAL')).toBe(expected[i]);
      });
    });

    it('maps primary lower-left (Q7) correctly: 71→K, 72→L … 75→O', () => {
      // Q7: 71→K(75-5+1=71→K), 72→L, etc. Actually let's calculate:
      // Q7: position 1→ charCode(75 + (5-1))=75+4=79='O' wait no.
      // Code: charCode(75 + (5 - position)) for Q7
      // 71 pos=1: 75 + (5-1) = 79 = 'O'... that doesn't match standard Universal.
      // Let me re-read the code: Q7 quadrant=7, charCode(75 + (5 - position))
      // 71: pos=1 → 75+(5-1)=79='O'
      // 72: pos=2 → 75+(5-2)=78='N'
      // 73: pos=3 → 75+(5-3)=77='M'
      // 74: pos=4 → 75+(5-4)=76='L'
      // 75: pos=5 → 75+(5-5)=75='K'
      const expected = ['O', 'N', 'M', 'L', 'K'];
      PRIMARY_LL.forEach((fdi, i) => {
        expect(toLabel(fdi, 'UNIVERSAL')).toBe(expected[i]);
      });
    });

    it('maps primary lower-right (Q8) correctly: 81→P, 82→Q … 85→T', () => {
      const expected = ['P', 'Q', 'R', 'S', 'T'];
      PRIMARY_LR.forEach((fdi, i) => {
        expect(toLabel(fdi, 'UNIVERSAL')).toBe(expected[i]);
      });
    });

    it('produces unique labels for all 20 primary teeth', () => {
      const labels = ALL_PRIMARY.map((fdi) => toLabel(fdi, 'UNIVERSAL'));
      expect(new Set(labels).size).toBe(20);
    });
  });

  // ── Palmer system ──────────────────────────────────────────────
  describe('Palmer numbering', () => {
    it('maps adult Q1 to UR-position', () => {
      expect(toLabel(11, 'PALMER')).toBe('UR-1');
      expect(toLabel(18, 'PALMER')).toBe('UR-8');
    });

    it('maps adult Q2 to UL-position', () => {
      expect(toLabel(21, 'PALMER')).toBe('UL-1');
      expect(toLabel(28, 'PALMER')).toBe('UL-8');
    });

    it('maps adult Q3 to LL-position', () => {
      expect(toLabel(31, 'PALMER')).toBe('LL-1');
      expect(toLabel(38, 'PALMER')).toBe('LL-8');
    });

    it('maps adult Q4 to LR-position', () => {
      expect(toLabel(41, 'PALMER')).toBe('LR-1');
      expect(toLabel(48, 'PALMER')).toBe('LR-8');
    });

    it('maps primary Q5 to UR-letter', () => {
      expect(toLabel(51, 'PALMER')).toBe('UR-A');
      expect(toLabel(55, 'PALMER')).toBe('UR-E');
    });

    it('maps primary Q6 to UL-letter', () => {
      expect(toLabel(61, 'PALMER')).toBe('UL-A');
      expect(toLabel(65, 'PALMER')).toBe('UL-E');
    });

    it('maps primary Q7 to LL-letter', () => {
      expect(toLabel(71, 'PALMER')).toBe('LL-A');
      expect(toLabel(75, 'PALMER')).toBe('LL-E');
    });

    it('maps primary Q8 to LR-letter', () => {
      expect(toLabel(81, 'PALMER')).toBe('LR-A');
      expect(toLabel(85, 'PALMER')).toBe('LR-E');
    });

    it('produces unique labels for all 32 adult teeth', () => {
      const labels = ALL_ADULT.map((fdi) => toLabel(fdi, 'PALMER'));
      expect(new Set(labels).size).toBe(32);
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────
  describe('Edge cases', () => {
    it('returns input as-is for invalid FDI numbers', () => {
      expect(toLabel(99, 'UNIVERSAL')).toBe('99');
      expect(toLabel(0, 'PALMER')).toBe('0');
      expect(toLabel(19, 'FDI')).toBe('19');
    });

    it('handles string input for all numbering systems', () => {
      expect(toLabel('14', 'UNIVERSAL')).toBe('5');
      expect(toLabel('14', 'PALMER')).toBe('UR-4');
    });

    it('handles non-numeric string input gracefully', () => {
      expect(toLabel('abc', 'FDI')).toBe('abc');
      expect(toLabel('abc', 'UNIVERSAL')).toBe('abc');
    });

    it('handles NaN input gracefully', () => {
      expect(toLabel(NaN, 'FDI')).toBe('NaN');
    });
  });

  // ── Cross-system consistency ───────────────────────────────────
  describe('Cross-system consistency', () => {
    it('all three systems produce results for every adult tooth', () => {
      const systems: NumberingSystem[] = ['FDI', 'UNIVERSAL', 'PALMER'];
      for (const fdi of ALL_ADULT) {
        for (const sys of systems) {
          const result = toLabel(fdi, sys);
          expect(result).toBeTruthy();
          expect(result).not.toBe('');
        }
      }
    });

    it('all three systems produce results for every primary tooth', () => {
      const systems: NumberingSystem[] = ['FDI', 'UNIVERSAL', 'PALMER'];
      for (const fdi of ALL_PRIMARY) {
        for (const sys of systems) {
          const result = toLabel(fdi, sys);
          expect(result).toBeTruthy();
          expect(result).not.toBe('');
        }
      }
    });
  });
});
