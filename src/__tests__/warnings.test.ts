// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from 'vitest';
import { __getStateWarnings } from '../odontogram';
import { setI18nLanguage, t } from '../i18n/useI18n';

// getStateWarnings' crownReplace/bridgePillar checks used to test the now-legacy
// `crownMaterial` field, which is hard-coded to "natural" for every new-model
// restoration (Task 3). That made the checks fire falsely whenever crownReplace/
// bridgePillar were set on a tooth with a real (new-model) restoration. Task 5
// rewrites them against `restorationType`, mirroring the crownReplace axis's
// appliesWhen in src/registry/axes.ts (tooth-base + restorationType !== "none").
describe('getStateWarnings (via __getStateWarnings)', () => {
  const base = () => ({
    toothSelection: 'tooth-base',
    endo: 'none',
    fillingMaterial: 'none',
    caries: new Set<string>(),
    crownReplace: false,
    bridgePillar: false,
    restorationType: 'none',
    restorationMaterial: 'none',
  });

  it('does NOT fire crownReplace/pillar warnings on a plain new-model restoration (regression: false positive)', () => {
    setI18nLanguage('en');
    const state = {
      ...base(),
      restorationType: 'crown',
      restorationMaterial: 'zircon',
      crownReplace: true,
      bridgePillar: true,
    };
    const warnings = __getStateWarnings(state);
    expect(warnings).not.toContain(t('warn.crownReplaceNoCrown'));
    expect(warnings).not.toContain(t('warn.pillarNoCrown'));
  });

  it('still fires the crownReplace warning when the flag is set but no restoration is present', () => {
    setI18nLanguage('en');
    const state = { ...base(), crownReplace: true, restorationType: 'none' };
    const warnings = __getStateWarnings(state);
    expect(warnings).toContain(t('warn.crownReplaceNoCrown'));
  });

  it('still fires the bridgePillar warning when the flag is set but no restoration is present', () => {
    setI18nLanguage('en');
    const state = { ...base(), bridgePillar: true, restorationType: 'none' };
    const warnings = __getStateWarnings(state);
    expect(warnings).toContain(t('warn.pillarNoCrown'));
  });

  it('fires the crownReplace warning when the restoration exists but the tooth is not tooth-base (e.g. a bridge pontic gap)', () => {
    setI18nLanguage('en');
    const state = {
      ...base(),
      toothSelection: 'none',
      restorationType: 'bridge',
      restorationMaterial: 'zircon',
      crownReplace: true,
    };
    const warnings = __getStateWarnings(state);
    expect(warnings).toContain(t('warn.crownReplaceNoCrown'));
  });

  it('does not fire either warning when the flags are unset, regardless of restoration', () => {
    setI18nLanguage('en');
    const state = { ...base(), restorationType: 'crown', restorationMaterial: 'emax' };
    const warnings = __getStateWarnings(state);
    expect(warnings).not.toContain(t('warn.crownReplaceNoCrown'));
    expect(warnings).not.toContain(t('warn.pillarNoCrown'));
  });

  // Unrelated warning checks are untouched by Task 5; a quick sanity check that
  // they still work against the same state shape.
  it('still fires endo/filling/caries-on-missing warnings unaffected by this change', () => {
    setI18nLanguage('en');
    const state = { ...base(), toothSelection: 'none', endo: 'endo-filling', fillingMaterial: 'composite', caries: new Set(['caries-occlusal']) };
    const warnings = __getStateWarnings(state);
    expect(warnings).toContain(t('warn.endoOnMissing'));
    expect(warnings).toContain(t('warn.fillingOnMissing'));
    expect(warnings).toContain(t('warn.cariesOnMissing'));
  });

  // Task 6 (spec §9 gap): defense-in-depth. hydrateState() coerces an invalid
  // (restorationType, restorationMaterial) pair on import, so this check should
  // never fire for a state that only ever went through hydrateState — but it
  // reuses the SAME warning mechanism (getStateWarnings) as a safety net for any
  // state built by another path (e.g. a hand-built object, as here) that skips
  // that coercion.
  it('fires an invalid-restoration-combo warning for a pair not in RESTORATION_MATRIX', () => {
    setI18nLanguage('en');
    const state = { ...base(), restorationType: 'inlay', restorationMaterial: 'metal' };
    const warnings = __getStateWarnings(state);
    expect(warnings).toContain(t('warn.invalidRestorationCombo'));
  });

  it('does NOT fire the invalid-restoration-combo warning for a valid pair', () => {
    setI18nLanguage('en');
    const state = { ...base(), restorationType: 'crown', restorationMaterial: 'zircon' };
    const warnings = __getStateWarnings(state);
    expect(warnings).not.toContain(t('warn.invalidRestorationCombo'));
  });

  it('does NOT fire the invalid-restoration-combo warning for restorationType:"none"/restorationMaterial:"none"', () => {
    setI18nLanguage('en');
    const state = { ...base() };
    const warnings = __getStateWarnings(state);
    expect(warnings).not.toContain(t('warn.invalidRestorationCombo'));
  });
});
