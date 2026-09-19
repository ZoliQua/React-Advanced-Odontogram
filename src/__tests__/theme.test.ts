// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from 'vitest';
import { applyThemeConfig, type OdontogramThemeConfig } from '../theme';

describe('theme.ts – applyThemeConfig()', () => {
  let root: HTMLDivElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  it('sets CSS custom properties from config', () => {
    const config: OdontogramThemeConfig = {
      colors: {
        accent: '#e74c3c',
        background: '#fafafa',
        text: '#222222',
      },
    };

    applyThemeConfig(root, config);

    expect(root.style.getPropertyValue('--odon-accent')).toBe('#e74c3c');
    expect(root.style.getPropertyValue('--odon-bg')).toBe('#fafafa');
    expect(root.style.getPropertyValue('--odon-text')).toBe('#222222');
  });

  it('does not set properties for missing keys', () => {
    applyThemeConfig(root, { colors: { accent: '#ff0000' } });

    expect(root.style.getPropertyValue('--odon-accent')).toBe('#ff0000');
    expect(root.style.getPropertyValue('--odon-bg')).toBe('');
    expect(root.style.getPropertyValue('--odon-panel')).toBe('');
  });

  it('clears all properties when config is null', () => {
    applyThemeConfig(root, { colors: { accent: '#ff0000', text: '#111' } });
    expect(root.style.getPropertyValue('--odon-accent')).toBe('#ff0000');

    applyThemeConfig(root, null);
    expect(root.style.getPropertyValue('--odon-accent')).toBe('');
    expect(root.style.getPropertyValue('--odon-text')).toBe('');
  });

  it('clears all properties when config is undefined', () => {
    applyThemeConfig(root, { colors: { line: '#ccc' } });
    applyThemeConfig(root, undefined);
    expect(root.style.getPropertyValue('--odon-line')).toBe('');
  });

  it('clears previous properties when switching configs', () => {
    applyThemeConfig(root, { colors: { accent: '#aaa', muted: '#bbb' } });
    applyThemeConfig(root, { colors: { accent: '#ccc' } });

    expect(root.style.getPropertyValue('--odon-accent')).toBe('#ccc');
    expect(root.style.getPropertyValue('--odon-muted')).toBe('');
  });

  it('handles empty colors object', () => {
    applyThemeConfig(root, { colors: {} });
    expect(root.style.getPropertyValue('--odon-accent')).toBe('');
  });

  it('handles null element gracefully', () => {
    // Should not throw
    applyThemeConfig(null, { colors: { accent: '#000' } });
  });

  it('sets all 8 color properties when fully configured', () => {
    const full: OdontogramThemeConfig = {
      colors: {
        background: '#111',
        panel: '#222',
        card: '#333',
        text: '#444',
        muted: '#555',
        line: '#666',
        accent: '#777',
        accent2: '#888',
      },
    };

    applyThemeConfig(root, full);

    expect(root.style.getPropertyValue('--odon-bg')).toBe('#111');
    expect(root.style.getPropertyValue('--odon-panel')).toBe('#222');
    expect(root.style.getPropertyValue('--odon-card')).toBe('#333');
    expect(root.style.getPropertyValue('--odon-text')).toBe('#444');
    expect(root.style.getPropertyValue('--odon-muted')).toBe('#555');
    expect(root.style.getPropertyValue('--odon-line')).toBe('#666');
    expect(root.style.getPropertyValue('--odon-accent')).toBe('#777');
    expect(root.style.getPropertyValue('--odon-accent2')).toBe('#888');
  });
});
