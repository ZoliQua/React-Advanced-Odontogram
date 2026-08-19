// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { DiagnosisKey } from "./codes";

/**
 * A national code overlay. `translation` packs keep the WHO codes and only
 * localize the display (cheap: BNO-10, MKCH-10, and the dental chapter of
 * ICD-10-GM/CIM-10). `modification` packs remap the code itself (US ICD-10-CM,
 * added in DX-5).
 */
export interface CodingPack {
  id: string;
  system: string;
  kind: "translation" | "modification";
  displays?: Partial<Record<DiagnosisKey, string>>;
  codes?: Partial<Record<DiagnosisKey, { code: string; display: string }>>;
}

// BNO-10 (Hungarian ICD-10). The Hungarian codes are identical to WHO ICD-10
// (KSH: BNO-10 == WHO 2019); only the display language differs.
// NOTE: confirm the official BNO-10 canonical URI before release; this is a
// stable stand-in.
export const BNO10_SYSTEM = "http://ksh.hu/bno10";

export const BNO10_PACK: CodingPack = {
  id: "bno10",
  system: BNO10_SYSTEM,
  kind: "translation",
  displays: {
    caries: "Fogszuvasodás",
    gingivitis: "Idült fogínygyulladás",
    periodontitis: "Idült fogágygyulladás",
  },
};

export const CODING_PACKS: Record<string, CodingPack> = {
  bno10: BNO10_PACK,
};

/** Resolve a pack id to its definition. "none"/null/unknown -> undefined. */
export function resolveCodingPack(id: string | null | undefined): CodingPack | undefined {
  if (!id || id === "none") return undefined;
  return CODING_PACKS[id];
}

/**
 * The extra `coding[]` entry a pack contributes for one diagnosis, or null when
 * the pack has nothing for that key. Translation: same code, localized display.
 * Modification: the remapped code + its display.
 */
export function packCoding(
  pack: CodingPack,
  key: DiagnosisKey,
  baseCode: string,
  baseDisplay: string,
): { system: string; code: string; display: string } | null {
  if (pack.kind === "modification") {
    const m = pack.codes?.[key];
    return m ? { system: pack.system, code: m.code, display: m.display } : null;
  }
  return { system: pack.system, code: baseCode, display: pack.displays?.[key] ?? baseDisplay };
}
