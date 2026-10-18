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
import type { SelectionBorderStyle } from "./state/displaySettings";

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
  /**
   * Tooth-artwork colours.
   *
   * The drawings carry their colours as palette tokens with today's colour as
   * the fallback (`fill: var(--odon-tooth-body, #ebebeb)`), so an omitted
   * key leaves that surface exactly as drawn. Setting a key recolours that
   * surface across BOTH anatomy profiles at once, even where the classic and
   * measured artwork happen to be drawn in different shades.
   *
   * This is a curated subset. Every token — including the gradient stops and
   * the per-material restoration colours — can be set by name through
   * {@link OdontogramThemeConfig.tokens}.
   */
  tooth?: {
    /** The tooth's own silhouette — crown AND root — and every broken or
     *  prepared variant of it.
     *
     *  In the `classic` profile this is the whole tooth: those drawings are one
     *  shape, with no inner structure. In `measured` it is the outer shell —
     *  enamel over the crown, cementum over the root — around
     *  {@link OdontogramThemeConfig.tooth.dentin}, which takes this colour
     *  unless it is set. Setting only `body` therefore looks the same in both
     *  profiles. */
    body?: string;
    /** The dentin core inside the crown and root (`measured` profile only —
     *  the classic drawings have no enamel/dentin boundary to colour).
     *
     *  Unset, it follows `body`, so the boundary is invisible until you ask
     *  for it. The occlusal view has no core: nothing of the dentin shows from
     *  above. */
    dentin?: string;
    /** Crown and root outline. */
    outline?: string;
    /** Crown sheen (the "beauty" layer). */
    highlight?: string;
    /** The deciduous tooth's silhouette. */
    milktoothBody?: string;
    /** Deciduous crown sheen. */
    milktoothHighlight?: string;
    /** Occlusal cusp field. */
    cusp?: string;
    /** Occlusal fissure lines. */
    groove?: string;
    /** Healthy pulp chamber. */
    pulpHealthy?: string;
    /** Inflamed pulp. */
    pulpInflamed?: string;
    /** Gingiva. */
    gum?: string;
    /** Alveolar bone. */
    bone?: string;
    /** Caries body. */
    caries?: string;
    /** Caries outline. */
    cariesOutline?: string;
    /** Bruxism wear facet. */
    wear?: string;
    /** Calculus deposit. */
    calculus?: string;
    /** Restoration outline. */
    restorationOutline?: string;
    /** Dark structural outline. */
    outlineDark?: string;
  };
  /**
   * Any palette token by its full CSS custom-property name, for the surfaces
   * {@link OdontogramThemeConfig.tooth} does not name — the per-material
   * restoration colours (`--odon-rest-gold`, `--odon-fill-composite`, …) and
   * the e.max / metal-ceramic gradient stops.
   *
   * Keys must start with `--odon-`; anything else is ignored, so this cannot
   * be used to set unrelated custom properties on the host's element.
   *
   * @example
   * { tokens: { "--odon-rest-gold": "#d4af37", "--odon-fill-composite": "#eae0c8" } }
   */
  tokens?: Record<string, string>;
  /**
   * The tooth-selection highlight.
   *
   * Selection is an interaction state, not artwork — it is drawn by the chart
   * around a tile, not by any tooth drawing — but hosts look for it here when
   * they are deciding "what colour is everything". It is applied through the
   * existing session setters (`setSelectionColor` / `setSelectionBorderStyle`),
   * so it is NOT a CSS custom property and does not appear on the themed
   * element.
   *
   * The dedicated `selectionColor` / `selectionBorderStyle` props on the
   * provider are the more specific control and win when both are given.
   */
  selection?: {
    color?: string;
    borderStyle?: SelectionBorderStyle;
  };
};

/** CSS custom property names mapped from theme config keys. */
/** Curated tooth-artwork fields -> the palette token each one drives. The
 *  authoritative token table lives with the artwork, in
 *  `tools/toothgen/palette.py`; these are the ones worth a named API field. */
const TOOTH_COLOR_MAP: Record<string, string> = {
  body: '--odon-tooth-body',
  dentin: '--odon-tooth-dentin',
  outline: '--odon-tooth-outline',
  highlight: '--odon-tooth-highlight',
  milktoothBody: '--odon-milktooth-body',
  milktoothHighlight: '--odon-milktooth-highlight',
  cusp: '--odon-tooth-cusp',
  groove: '--odon-tooth-groove',
  pulpHealthy: '--odon-pulp-healthy',
  pulpInflamed: '--odon-pulp-inflamed',
  gum: '--odon-gum',
  bone: '--odon-bone',
  caries: '--odon-caries',
  cariesOutline: '--odon-caries-outline',
  wear: '--odon-wear',
  calculus: '--odon-calculus',
  restorationOutline: '--odon-rest-outline',
  outlineDark: '--odon-outline-dark',
};

/** Prefix every settable token shares. `tokens` entries outside it are
 *  ignored, so a host config can never reach an unrelated custom property. */
const TOKEN_PREFIX = '--odon-';

/** What the last `applyThemeConfig` set on each element, so the next call can
 *  clear exactly that — including arbitrary `tokens` keys — without touching
 *  `--odon-*` properties the host set by itself. */
const appliedProps = new WeakMap<HTMLElement, string[]>();

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

  // Clear what the previous call set — the fixed chrome variables, plus
  // whatever artwork tokens that call applied. Tracking them is what lets the
  // open-ended `tokens` map reset cleanly while leaving any `--odon-*` the
  // host set outside this function alone.
  for (const cssVar of Object.values(COLOR_MAP)) {
    element.style.removeProperty(cssVar);
  }
  for (const cssVar of appliedProps.get(element) ?? []) {
    element.style.removeProperty(cssVar);
  }
  appliedProps.delete(element);

  if (!config) return;

  const applied: string[] = [];
  const set = (cssVar: string, value: string) => {
    element.style.setProperty(cssVar, value);
    applied.push(cssVar);
  };

  if (config.colors) {
    for (const [key, cssVar] of Object.entries(COLOR_MAP)) {
      const value = config.colors[key as keyof NonNullable<OdontogramThemeConfig['colors']>];
      if (value) element.style.setProperty(cssVar, value);
    }
  }

  if (config.tooth) {
    for (const [key, cssVar] of Object.entries(TOOTH_COLOR_MAP)) {
      const value = config.tooth[key as keyof NonNullable<OdontogramThemeConfig['tooth']>];
      if (value) set(cssVar, value);
    }
  }

  // Raw tokens last, so a `tokens` entry deliberately wins over the curated
  // field that names the same token.
  if (config.tokens) {
    for (const [cssVar, value] of Object.entries(config.tokens)) {
      if (!cssVar.startsWith(TOKEN_PREFIX) || !value) continue;
      set(cssVar, value);
    }
  }

  if (applied.length) appliedProps.set(element, applied);
}

/** Where a `var(--odon-…)` reference begins. The closing paren is found by
 *  counting, not by matching: a fallback may be another token reference
 *  (`--odon-tooth-dentin` defaults to `var(--odon-tooth-body, #ebebeb)`), and a
 *  `[^)]*` fallback group stops at the inner `)`. That leaves the inner
 *  reference in the exported markup, where nothing resolves it and the fill
 *  falls back to the SVG initial value — black, silently. */
const TOKEN_START = 'var(--odon-';

/** Replace every token reference in `text`, resolving fallbacks recursively.
 *  `valueOf` returns the host's value for a token, or `""` when it is unset. */
function resolveTokenRefs(text: string, valueOf: (token: string) => string): string {
  let out = '';
  let cursor = 0;
  for (;;) {
    const open = text.indexOf(TOKEN_START, cursor);
    if (open < 0) return out + text.slice(cursor);
    // `open + 3` is the '(' of `var(`.
    let depth = 0;
    let end = -1;
    for (let i = open + 3; i < text.length; i++) {
      const ch = text[i];
      if (ch === '(') depth++;
      else if (ch === ')' && --depth === 0) { end = i; break; }
    }
    // Unbalanced markup is not ours to repair: leave the rest untouched.
    if (end < 0) return out + text.slice(cursor);
    const inner = text.slice(open + 4, end);
    const comma = inner.indexOf(',');
    const token = (comma < 0 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma < 0 ? '' : inner.slice(comma + 1).trim();
    const value = valueOf(token);
    out += text.slice(cursor, open) + (value || resolveTokenRefs(fallback, valueOf));
    cursor = end + 1;
  }
}

/**
 * Resolve every palette token in serialized SVG markup to a concrete colour.
 *
 * The tooth artwork is painted through CSS custom properties, which a browser
 * resolves against the cascade of the document the markup lives in. An export
 * leaves that document: `XMLSerializer` produces a standalone SVG that is
 * written to a file or rasterized through an `<img>`, and in that isolated
 * context the host page's `--odon-*` values do not apply — every token would
 * silently fall back to its default, so a themed chart would export in the
 * stock colours.
 *
 * This flattens them first, reading each token's value from `element` (custom
 * properties inherit, so the chart's own node sees the host's cascade). A
 * token the host never set resolves to `""` and keeps its own fallback, which
 * makes an unthemed export byte-identical to one produced before theming
 * existed.
 *
 * @param xml - Serialized SVG markup.
 * @param element - The node to resolve token values against. Defaults to the
 *   document element; pass the chart's own container when one is at hand.
 */
export function flattenThemeTokens(xml: string, element?: Element | null): string {
  if (!xml.includes('var(--odon-')) return xml;
  const scope = element ?? (typeof document !== 'undefined' ? document.documentElement : null);
  if (!scope || typeof getComputedStyle !== 'function') {
    return resolveTokenRefs(xml, () => '');
  }
  const computed = getComputedStyle(scope);
  const cache = new Map<string, string>();
  return resolveTokenRefs(xml, token => {
    let value = cache.get(token);
    if (value === undefined) {
      value = computed.getPropertyValue(token).trim();
      cache.set(token, value);
    }
    return value;
  });
}
