// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { DiagnosisKey } from "./codes";

export interface DerivedDiagnosis {
  toothNo: string;
  key: DiagnosisKey;
}

/**
 * Pure derivation of coded dental diagnoses from a serialized export payload.
 * DX-0 covers caries only: a tooth with any carious surface -> one `caries`
 * diagnosis. Later sub-projects add the other findings. No dependency on
 * odontogram.ts, so it is deterministic and callable from either live state
 * (via a serialized snapshot) or an exported payload.
 */
export function deriveDentalDiagnoses(payload: unknown): DerivedDiagnosis[] {
  const teeth = (payload as { teeth?: Record<string, { caries?: unknown }> } | null)?.teeth;
  if (!teeth || typeof teeth !== "object") return [];
  const out: DerivedDiagnosis[] = [];
  for (const [toothNo, rec] of Object.entries(teeth)) {
    if (Array.isArray(rec?.caries) && rec.caries.length > 0) {
      out.push({ toothNo, key: "caries" });
    }
  }
  return out;
}
