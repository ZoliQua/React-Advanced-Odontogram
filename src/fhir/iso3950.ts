// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// ISO 3950 deciduous (primary) tooth designation. The engine stores milk teeth
// on their PERMANENT FDI position (11-48) with `toothSelection: "milktooth"`;
// standards-correct interchange requires the deciduous range 51-85 on the
// FHIR bodySite. Only positions 1-5 per quadrant have deciduous equivalents —
// permanent-molar positions (6-8) never represent milk teeth and stay as-is.

const FDI_TO_DECIDUOUS: Record<string, string> = {};
const DECIDUOUS_TO_FDI: Record<string, string> = {};
for (let quadrant = 1; quadrant <= 4; quadrant++) {
  for (let position = 1; position <= 5; position++) {
    const fdi = `${quadrant}${position}`;
    const deciduous = `${quadrant + 4}${position}`;
    FDI_TO_DECIDUOUS[fdi] = deciduous;
    DECIDUOUS_TO_FDI[deciduous] = fdi;
  }
}

/** Permanent FDI (11-15, 21-25, 31-35, 41-45) → deciduous (51-55, 61-65, 71-75, 81-85); null otherwise. */
export function fdiToDeciduous(fdi: string): string | null {
  return FDI_TO_DECIDUOUS[fdi] ?? null;
}

/** Deciduous ISO 3950 code → the engine's permanent FDI storage key; null otherwise. */
export function deciduousToFdi(code: string): string | null {
  return DECIDUOUS_TO_FDI[code] ?? null;
}

/** The bodySite code to emit for a tooth record: deciduous when it is a milk tooth with an equivalent, else the FDI key. */
export function toothBodySiteCode(fdi: string, rec: { toothSelection?: string }): string {
  if (rec?.toothSelection !== "milktooth") return fdi;
  const deciduous = FDI_TO_DECIDUOUS[fdi];
  if (!deciduous) {
    console.warn(`odontogram FHIR export: tooth ${fdi} is flagged milktooth but has no ISO 3950 deciduous equivalent — exporting the permanent code`);
    return fdi;
  }
  return deciduous;
}
