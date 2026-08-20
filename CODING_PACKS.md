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
  id: "xyz10",                         // unique pack identifier
  system: "http://example.org/xyz10",  // national code-system URI
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

Add your pack to the `CODING_PACKS` map in `src/dx/packs.ts` (it is a `Record<string, CodingPack>` keyed by pack id, not an array):

```typescript
export const CODING_PACKS: Record<string, CodingPack> = {
  // ... existing packs
  bno10: BNO10_PACK,
};
```

### 3. Add UI Selectable Option and i18n Labels

#### a. Add the option to `DIAGNOSIS_CODING_OPTIONS` in `src/SettingsModal.tsx`:

```typescript
const DIAGNOSIS_CODING_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "none", labelKey: "settings.diagnosisCoding.none" },
  { value: "bno10", labelKey: "settings.diagnosisCoding.bno10" },
  // ... add your pack here, e.g.:
  // { value: "xyz10", labelKey: "settings.diagnosisCoding.xyz10" },
];
```

`"none"` is the base/no-pack option (WHO ICD-10 only); it is always present and must not be removed.

#### b. Add the i18n label to all 12 language files in `src/i18n/translations.ts`:

You must add a translation key under `settings.diagnosisCoding` in **all 12 supported languages** (HU, EN, DE, ES, IT, SK, PL, RU, PT-BR, ZH, AR, FR):

```typescript
// Hungarian (hu) — source of truth
"settings.diagnosisCoding.bno10": "BNO-10 (magyar)",

// English (en)
"settings.diagnosisCoding.bno10": "BNO-10 (Hungarian)",

// German (de)
"settings.diagnosisCoding.bno10": "BNO-10 (Ungarisch)",

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

Your pack must provide displays (or codes) for **every coded key** in `DX_CODES` and `CASE_DX_CODES`. There are two uncoded peri-implant `DiagnosisKey`s (`periImplantMucositis` and `periImplantitis` — they have no `icd10` field in `DX_CODES`) that emit no FHIR Condition and need no entry in your pack.

## Example: BNO-10 (Hungarian)

BNO-10 is the dental chapter of the Hungarian translation of WHO ICD-10. Its codes are **identical to WHO ICD-10**; only the display text differs (translated to Hungarian). The pack was added as:

1. A `BNO10_PACK` object in `src/dx/packs.ts` (`id: "bno10"`, `system: "http://ksh.hu/bno10"`) with `kind: "translation"` and Hungarian displays for every tooth-level and case-level diagnosis.
2. Registered in `CODING_PACKS`.
3. Added to `DIAGNOSIS_CODING_OPTIONS` in `src/SettingsModal.tsx` as `{ value: "bno10", labelKey: "settings.diagnosisCoding.bno10" }`, whose Hungarian label is `"BNO-10 (magyar)"`.
4. Translation keys added to all 12 language files under `settings.diagnosisCoding.bno10`.
5. Tests verifying completeness and correctness of the Hungarian displays.

Users can now select BNO-10 in Settings → General → Diagnosis coding system to see Hungarian labels throughout the app and in the FHIR export.

## Example: US ICD-10-CM (a modification pack)

US ICD-10-CM (Clinical Modification) is the engine's first **modification**-class
pack — unlike BNO-10's translation pack, it doesn't just relabel the WHO code, it
**remaps the code itself** to the US-specific value. It was added as:

1. An `ICD10CM_PACK` object in `src/dx/packs.ts` (`id: "icd10cm"`,
   `system: ICD10CM_SYSTEM` = `"http://hl7.org/fhir/sid/icd-10-cm"`) with
   `kind: "modification"`. Because it's a modification pack it uses `codes` (tooth-level,
   keyed by `DiagnosisKey`) and `caseCodes` (case-level, keyed by `CaseConditionKey`)
   instead of `displays`/`caseDisplays` — each entry is a `{ code, display }` pair, e.g.:

   ```typescript
   codes: {
     caries: { code: "K02.9", display: "Dental caries, unspecified" },
     // ...
   },
   caseCodes: {
     tmjDisorder: { code: "M26.609", display: "Unspecified temporomandibular joint disorder, unspecified side" },
     // the K07 dentofacial-anomaly case keys remap into the M26 range in ICD-10-CM
     // ...
   },
   ```

2. Registered in `CODING_PACKS` as `icd10cm: ICD10CM_PACK`.
3. Added to `DIAGNOSIS_CODING_OPTIONS` in `src/SettingsModal.tsx` as
   `{ value: "icd10cm", labelKey: "settings.diagnosisCoding.icd10cm" }`.
4. Translation keys added to all 12 language files under
   `settings.diagnosisCoding.icd10cm` (e.g. `"ICD-10-CM (US)"` in English,
   `"ICD-10-CM (USA)"` in Hungarian).

Selecting ICD-10-CM in Settings changes the code that lands in the FHIR export's
`Condition.coding` — not just the display text — for both tooth-level and case-level
diagnoses, while the always-on WHO ICD-10 base coding is still carried alongside it.

**Reference/best-effort caveat:** most K-codes the engine uses are identical between
WHO ICD-10 and ICD-10-CM, so the pack only remaps the genuinely-divergent keys and
otherwise reuses flat, non-data-driven codes per diagnosis key (no laterality/encounter
specificity yet). Treat `ICD10CM_PACK`'s codes as a reference starting point — **verify
every code against the official CMS/CDC ICD-10-CM tabular list before any US
clinical or billing use.**

## Key Points

- A **translation pack never changes the code**, only the display. BNO-10 uses the exact same codes as WHO ICD-10; the code in the FHIR export is unchanged whether BNO-10 or WHO is selected.
- **All 12 languages must have a label** for every new pack option added to `DIAGNOSIS_CODING_OPTIONS`, even if the option is only for one country. This ensures the Settings menu is consistent in every language the app ships.
- **Payload version is unaffected** — adding a pack is a UI-only change. The JSON export does not include which pack is selected (the pack is applied at export time based on the Settings choice).
- **FHIR output changes** — the `Condition.coding` will carry the national code system URI instead of the WHO system URI when the pack is active, and the display text will be localized to the pack's language (for translation packs, the code stays the same; for modification packs, the code changes too).

## SNOMED CT Overlay

The **SNOMED CT overlay** is an independent diagnostic coding system that rides alongside the WHO ICD-10 base and the national packs (if selected). It is toggled via **Settings → General → SNOMED CT** (default **off**).

When enabled, each FHIR `Condition` gains an additional **SNOMED CT coding** whenever the charted diagnosis has a verified SNOMED CT concept ID in `src/dx/codes.ts` or `src/dx/caseCodes.ts`. The overlay is independent — the WHO ICD-10 base coding is always present, and the national pack (if selected) still overlays its codes; SNOMED CT codes are *added* without replacing them.

### Key Points

- **Seeded concept IDs are provisional.** The SNOMED CT IDs currently seeded in the codebase are a reference starting point — **verify every code against the official SNOMED CT browser before any clinical use.** This is not a complete or authoritative SNOMED clinical mapping.
- **Unset slots emit nothing.** If a diagnosis has no `snomed` concept ID defined in the code catalog, the overlay does not emit a SNOMED coding for that diagnosis — it is maintainer's responsibility to complete the mapping.
- **Two concrete effects:**
  1. **Peri-implant findings (no WHO code)** — the diagnoses `periImplantMucositis` and `periImplantitis` have no WHO ICD-10 code. When the SNOMED CT overlay is enabled, they emit a **SNOMED-only `Condition`** (no WHO base code, since none exists).
  2. **Case-condition laterality qualifier** — case-level diagnoses that carry a `laterality` (left/right/bilateral) gain a **SNOMED CT `bodySite` qualifier** encoding the laterality, in addition to the laterality captured by the case-condition key itself.

### No Payload Impact

The SNOMED CT overlay is a pure export-time feature (like the national packs). It does not change the JSON export payload format or version — the toggle is applied only during FHIR export based on the Settings selection.
