// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from 'vitest';
import { __setToothStateForTest, getToothStateSummary, getOdontogramSummary } from '../odontogram';
import { setI18nLanguage, t } from '../i18n/useI18n';

// getStateSummary (tooltip) and getOdontogramSummary's prosthetics section used
// to read the now-legacy `crownMaterial`/`bridgeUnit` fields, which no longer
// carry fixed-restoration data for new-model states (Task 3 always leaves
// crownMaterial:"natural" for a plain restoration). Task 5 rewrites both to
// derive their text from toothSubstrate / restorationType / restorationMaterial.
//
// __setToothStateForTest hydrates and stores state directly in the module-level
// map without requiring a full initOdontogram()/DOM setup.
describe('restoration/substrate summaries (tooltip + tooth-information panel)', () => {
  beforeEach(() => {
    setI18nLanguage('en');
  });

  it('tooltip summary shows the fixed restoration (type + material), not "natural"', () => {
    __setToothStateForTest(11, { toothSelection: 'tooth-base', restorationType: 'crown', restorationMaterial: 'zircon' });
    const summary = getToothStateSummary(11);
    expect(summary).toContain(`${t('restoration.type.crown')} – ${t('restoration.material.zircon')}`);
  });

  it('tooltip summary applies the metal -> metal-ceramic material label rename', () => {
    __setToothStateForTest(12, { toothSelection: 'tooth-base', restorationType: 'bridge', restorationMaterial: 'metal-ceramic' });
    const summary = getToothStateSummary(12);
    expect(summary).toContain(`${t('restoration.type.bridge')} – ${t('restoration.material.metalCeramic')}`);
  });

  it('tooltip summary shows tooth substrate (e.g. radix) independently of any restoration', () => {
    __setToothStateForTest(13, { toothSelection: 'tooth-base', toothSubstrate: 'radix' });
    const summary = getToothStateSummary(13);
    expect(summary).toContain(t('substrate.radix'));
  });

  it('tooltip summary shows implant attachments via the new prosthesis axis (SP3b field-move)', () => {
    __setToothStateForTest(14, { toothSelection: 'implant', prosthesis: 'locator' });
    const summary = getToothStateSummary(14);
    expect(summary).toContain(t('prosthesis.type.locator'));
  });

  it('tooth-information prosthetics section lists fixed restorations from the new model', () => {
    __setToothStateForTest(21, { toothSelection: 'tooth-base', restorationType: 'crown', restorationMaterial: 'emax' });
    const s = getOdontogramSummary();
    const prosthetics = s.sections.find((sec) => sec.key === 'prosthetics')!;
    expect(prosthetics.items.some((item) => item.includes(t('restoration.type.crown')) && item.includes(t('restoration.material.emax')))).toBe(true);
  });

  it('tooth-information prosthetics section lists removable dentures via the prosthesis axis (SP3b field-move)', () => {
    __setToothStateForTest(22, { toothSelection: 'none', prosthesis: 'removable-partial' });
    const s = getOdontogramSummary();
    const prosthetics = s.sections.find((sec) => sec.key === 'prosthetics')!;
    expect(prosthetics.items.some((item) => item.includes(t('prosthesis.type.removablePartial')))).toBe(true);
  });

  it('a bridge pontic (restorationType:"bridge" on a missing tooth) shows up in prosthetics', () => {
    __setToothStateForTest(23, { toothSelection: 'none', restorationType: 'bridge', restorationMaterial: 'zircon' });
    const s = getOdontogramSummary();
    const prosthetics = s.sections.find((sec) => sec.key === 'prosthetics')!;
    expect(prosthetics.items.some((item) => item.includes(t('restoration.type.bridge')) && item.includes(t('restoration.material.zircon')))).toBe(true);
  });
});
