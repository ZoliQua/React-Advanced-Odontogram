// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Theme configuration for the Odontogram component.
 *
 * Allows host applications to override the default color palette without
 * modifying CSS files. All properties are optional — only the provided
 * values are overridden; the rest fall back to the built-in defaults.
 *
 * Colors are applied as CSS custom properties (`--odon-*`) on the
 * component root element, so they work regardless of whether the host
 * uses Tailwind CSS or plain CSS.
 *
 * @example
 * ```tsx
 * const myTheme: OdontogramThemeConfig = {
 *   colors: {
 *     accent: '#e74c3c',
 *     background: '#fafafa',
 *   },
 * };
 * <App themeConfig={myTheme} />
 * ```
 */
export type OdontogramThemeConfig = {
  colors?: {
    /** Primary background. Default: `#f3f6fb` (light) / `#0f172a` (dark). */
    background?: string;
    /** Panel & card background. Default: `#ffffff` (light) / `#1e293b` (dark). */
    panel?: string;
    /** Card background. Default: same as panel. */
    card?: string;
    /** Primary text color. Default: `#1e2a3a` (light) / `#f1f5f9` (dark). */
    text?: string;
    /** Muted / secondary text color. Default: `#5b6b7d` (light) / `#94a3b8` (dark). */
    muted?: string;
    /** Border / divider color. Default: `#d7e0ec` (light) / `#334155` (dark). */
    line?: string;
    /** Primary accent (buttons, active states). Default: `#3b7bff`. */
    accent?: string;
    /** Secondary accent (success, selected states). Default: `#12b981`. */
    accent2?: string;
  };
};

/** CSS custom property names mapped from theme config keys. */
const COLOR_MAP: Record<string, string> = {
  background: '--odon-bg',
  panel: '--odon-panel',
  card: '--odon-card',
  text: '--odon-text',
  muted: '--odon-muted',
  line: '--odon-line',
  accent: '--odon-accent',
  accent2: '--odon-accent2',
};

/**
 * Apply an {@link OdontogramThemeConfig} to a DOM element by setting
 * CSS custom properties. Pass `null` or `undefined` to clear all
 * theme overrides.
 *
 * @param element - The root element to apply theme variables to.
 * @param config - The theme configuration, or `null`/`undefined` to reset.
 */
export function applyThemeConfig(
  element: HTMLElement | null,
  config: OdontogramThemeConfig | null | undefined,
): void {
  if (!element) return;

  // Clear all --odon-* properties first
  for (const cssVar of Object.values(COLOR_MAP)) {
    element.style.removeProperty(cssVar);
  }

  if (!config?.colors) return;

  for (const [key, cssVar] of Object.entries(COLOR_MAP)) {
    const value = config.colors[key as keyof OdontogramThemeConfig['colors']];
    if (value) {
      element.style.setProperty(cssVar, value);
    }
  }
}
