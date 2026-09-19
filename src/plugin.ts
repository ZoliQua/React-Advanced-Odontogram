// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { Language } from "./i18n/languages";

/**
 * Defines the SVG layer where a plugin's visual output will be inserted.
 *
 * | Layer         | Z-order | Description                             |
 * |---------------|---------|----------------------------------------|
 * | `base`        | 0       | Below the tooth — background indicators |
 * | `restoration` | 3       | Between endo and crown layers           |
 * | `overlay`     | 6       | Top-most — badges, markers, highlights  |
 */
export type PluginLayer = "base" | "restoration" | "overlay";

/**
 * Custom SVG plugin definition for the Odontogram engine.
 *
 * Plugins can inject custom SVG content into each tooth's rendering and
 * maintain per-tooth custom state that is automatically included in
 * JSON export/import.
 *
 * @example
 * ```typescript
 * const implantBrandPlugin: OdontogramPlugin = {
 *   id: "implant-brand",
 *   label: { hu: "Implantátum márka", en: "Implant brand", de: "Implantat-Marke", ... },
 *   layer: "overlay",
 *   renderSvg: (toothNo, _quadrant, customState) => {
 *     if (!customState?.brand) return null;
 *     return `<text x="16" y="60" font-size="6" fill="#3b7bff">${customState.brand}</text>`;
 *   },
 * };
 * ```
 */
export type OdontogramPlugin = {
  /** Unique plugin identifier (used as key in customStates). */
  id: string;
  /** Localized display label for the plugin (shown in the state tooltip). */
  label: Partial<Record<Language, string>>;
  /**
   * SVG layer where this plugin's output will be rendered.
   * @see {@link PluginLayer}
   */
  layer: PluginLayer;
  /**
   * Render SVG markup for a specific tooth. Return an SVG fragment string
   * (will be wrapped in a `<g>` element) or `null`/`undefined` to render nothing.
   *
   * @param toothNo - The FDI tooth number (11–48).
   * @param quadrant - The quadrant (1–4) derived from the tooth number.
   * @param customState - The plugin's custom state for this tooth, or `undefined`.
   */
  renderSvg: (toothNo: number, quadrant: 1 | 2 | 3 | 4, customState: unknown) => string | null | undefined;
  /**
   * Optional: which panel section this plugin adds controls to.
   * When set to `"custom"`, the engine will render a dedicated panel
   * section for the plugin (future expansion).
   */
  panelSection?: "custom";
};

/**
 * Get the quadrant number (1–4) for a given FDI tooth number.
 */
export function getQuadrant(toothNo: number): 1 | 2 | 3 | 4 {
  const first = Math.floor(toothNo / 10);
  if (first === 1) return 1;
  if (first === 2) return 2;
  if (first === 3) return 3;
  return 4;
}

/** Z-index priority for SVG plugin layers. */
export const LAYER_Z: Record<PluginLayer, number> = {
  base: 0,
  restoration: 3,
  overlay: 6,
};
