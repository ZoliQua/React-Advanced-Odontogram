# Adding a National Diagnosis-Coding Pack

This guide explains how to add national diagnosis coding for your country or region to the React Advanced Odontogram engine.

## What is a Coding Pack?

A coding pack is an optional national code overlay on top of the always-on WHO ICD-10 base. There are two classes:

- **Translation pack:** Uses the same codes as WHO ICD-10 but provides localized display text. Example: BNO-10 is the Hungarian translation of WHO ICD-10.
- **Modification pack:** Remaps codes to a national system with different code values. Example: US ICD-10-CM (the "CM" modifier replaces some WHO codes with US-specific ones).

## Steps to Add a Pack

### 1. Add a `CodingPack` to `src/dx/packs.ts`

Define a new `CodingPack` object with the following structure:

```typescript
{
  id: "bno-10",                        // unique pack identifier
  system: "http://hl7.org/fhir/sid/ksh/bno-10",  // national code-system URI
  kind: "translation",                 // "translation" or "modification"
  displays: {                          // tooth-level diagnosis displays
    "caries-primary": "Karies (primer)",
    "caries-recurrent": "Karies (szekunder)",
    // ... one entry per tooth-level DX_CODES key
  },
  caseDisplays: {                      // case-level (whole-mouth) diagnosis displays
    "malocclusion": "Rossz okklúzió",
    // ... one entry per case-level CASE_DX_CODES key
  }
}
```

For a **modification pack**, use `codes` instead of `displays`:

```typescript
codes: {
  "caries-primary": { code: "K02.91", display: "Unspecified caries of unspecified permanent tooth" },
  // ... remapped code + display pairs
}
```

### 2. Register the Pack in `CODING_PACKS`

Add your pack to the `CODING_PACKS` array in `src/dx/packs.ts`:

```typescript
export const CODING_PACKS: CodingPack[] = [
  // ... existing packs
  bno10Pack,
];
```

### 3. Add UI Selectable Option and i18n Labels

#### a. Add the option to `DIAGNOSIS_CODING_OPTIONS` in `src/SettingsModal.tsx`:

```typescript
const DIAGNOSIS_CODING_OPTIONS = [
  { value: "who", label: t("settings.diagnosisCodingSystem.who") },
  { value: "bno-10", label: t("settings.diagnosisCodingSystem.bno10") },
  // ... add your pack here
];
```

#### b. Add the i18n label to all 12 language files in `src/i18n/translations.ts`:

You must add a translation key under `settings.diagnosisCodingSystem` in **all 12 supported languages** (HU, EN, DE, ES, IT, SK, PL, RU, PT-BR, AR, ZH):

```typescript
// Hungarian (hu) — source of truth
"settings.diagnosisCodingSystem.bno10": "BNO-10 (magyar)",

// English (en)
"settings.diagnosisCodingSystem.bno10": "BNO-10 (Hungarian)",

// German (de)
"settings.diagnosisCodingSystem.bno10": "BNO-10 (Ungarisch)",

// ... and so on for all remaining languages
```

### 4. (Recommended) Add Tests

Mirror the test pattern in `src/dx/__tests__/packs.test.ts`:

- A **completeness test** verifying that your pack's `displays` (or `codes`) cover every coded tooth-level and case-level diagnosis key.
- A **packCoding test** verifying that your pack's display/code values are correct.

## Key Catalogs

- **Tooth-level diagnosis keys** live in `src/dx/codes.ts` as `DX_CODES`. These keys represent findings charted on individual teeth (caries, pulp diagnosis, etc.).
- **Case-level (whole-mouth) diagnosis keys** live in `src/dx/caseCodes.ts` as `CASE_DX_CODES`. These represent conditions that apply to the whole mouth or regions (malocclusion, oral cysts, etc.).

## Coverage Requirement

Your pack must provide displays (or codes) for **every coded key** in `DX_CODES` and `CASE_DX_CODES`. There are two uncoded peri-implant keys (`peri-implant-mucositis` and `peri-implant-peri-implantitis-mild` / `-moderate` / `-severe`) that emit no FHIR Condition and need no entry in your pack.

## Example: BNO-10 (Hungarian)

BNO-10 is the dental chapter of the Hungarian translation of WHO ICD-10. Its codes are **identical to WHO ICD-10**; only the display text differs (translated to Hungarian). The pack was added as:

1. A `bno10Pack` object in `src/dx/packs.ts` with `kind: "translation"` and Hungarian displays for every tooth-level and case-level diagnosis.
2. Registered in `CODING_PACKS`.
3. Added to `DIAGNOSIS_CODING_OPTIONS` in `src/SettingsModal.tsx` with the label `"BNO-10 (magyar)"`.
4. Translation keys added to all 12 language files under `settings.diagnosisCodingSystem.bno10`.
5. Tests verifying completeness and correctness of the Hungarian displays.

Users can now select BNO-10 in Settings → General → Diagnosis coding system to see Hungarian labels throughout the app and in the FHIR export.

## Key Points

- A **translation pack never changes the code**, only the display. BNO-10 uses the exact same codes as WHO ICD-10; the code in the FHIR export is unchanged whether BNO-10 or WHO is selected.
- **All 12 languages must have a label** for every new pack option added to `DIAGNOSIS_CODING_OPTIONS`, even if the option is only for one country. This ensures the Settings menu is consistent in every language the app ships.
- **Payload version is unaffected** — adding a pack is a UI-only change. The JSON export does not include which pack is selected (the pack is applied at export time based on the Settings choice).
- **FHIR output changes** — the `Condition.coding` will carry the national code system URI instead of the WHO system URI when the pack is active, and the display text will be localized to the pack's language (for translation packs, the code stays the same; for modification packs, the code changes too).
