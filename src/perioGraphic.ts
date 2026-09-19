// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Periodontal tooth-row graphic — draws the perio arch by REUSING the existing
// `tooth-base` artwork (the same 4 templates the odontogram grid loads),
// instead of drawing new art. Read-only: this module only fetches template SVG
// text and parses it into its OWN, brand-new DOM (via `DOMParser`, the same
// technique `odontogram.ts`'s `loadSvg` uses) — it never touches the live
// odontogram's tiles, so the existing SVG-fingerprint/FHIR/round-trip goldens
// are unaffected (parity-safe by construction).
//
// Two layers, deliberately split for testability (a pure/sync core plus a thin
// async loader):
//   - `loadTemplateCache()` — the async entry point: parses each of the 4
//     templates ONCE (never re-parsed per tooth) and memoizes the resulting
//     `Document`s.
//   - `getToothBaseGroupFromCache()` / `buildBuccalArchSvg()` /
//     `buildPalatalArchSvg()` — pure, sync, operate on an already-built
//     `TemplateDocCache`. Tests build their own cache directly from the SVG
//     asset text (`readFileSync` + `DOMParser`), so they are fast and
//     deterministic in vitest/jsdom.
//
// No per-tooth pointer handlers here — this is read-only chart artwork.
import { activeAnatomyProfile } from "./anatomy/profiles";

// Per-template CEJ baseline anchors now live on the active `AnatomyProfile`
// (`odontogram.ts`), so the perio chart tracks the selected tooth anatomy. The
// three names below are re-exported under their historical identifiers for
// backward compatibility (existing importers/tests). These are *binding*
// re-exports (`export { X as Y } from`), NOT `export const Y = X` — the latter
// would read the imported value at module-eval time, which throws in the UI
// tests that fully mock `./odontogram` (they don't provide these bindings, and
// like every other odontogram import here they're only ever meant to be touched
// at RUNTIME). The runtime `anchorFor()` reads the ACTIVE profile instead (see
// below). See `odontogram.ts` (`CLASSIC_CEJ_Y` etc.) for the measurement notes.
export {
  CLASSIC_CEJ_Y as CEJ_Y,
  CLASSIC_IMPLANT_CEJ_Y as IMPLANT_CEJ_Y,
  CLASSIC_MILKTOOTH_CEJ_Y as MILKTOOTH_CEJ_Y,
} from "./anatomy/profiles";

// The union of every template tooth any anatomy profile can supply. The classic
// profile realizes only 11/13/14/16; the measured profile adds 12/15/17/31/46.
// Widened so the profile-aware anchor/template lookups type-check for both.
export type TemplateNo = 11 | 12 | 13 | 14 | 15 | 16 | 17 | 31 | 46;

const SVG_NS = "http://www.w3.org/2000/svg";

/** Layers that must NEVER appear in a cloned tooth-base group — only the
 *  tooth's own crown/root outline (`#tooth-base`) belongs in this read-only
 *  chart graphic; gum/bone context, the healthy-pulp glyph, the enamel
 *  "beauty" highlight, and the milk-tooth variant are all odontogram-tile
 *  concerns, not perio-row concerns. */
export const EXCLUDED_TOOTH_BASE_IDS: readonly string[] = [
  "gum-base",
  "bone-base",
  "tooth-healthy-pulp",
  "tooth-base-beauty",
  "milktooth-base",
];

/** Predicate telling the arch builders whether a given tooth is an implant on
 *  the active chart, so its graphic uses the implant fixture artwork
 *  (`#implant-base`) instead of the natural `#tooth-base`. Injected by the
 *  caller (`PerioChart` passes `isToothImplant` from odontogram.ts, reading the
 *  SAME active-chart state the number rows read) rather than imported here, so
 *  this module stays DOM-free / state-free and unit-testable from a plain
 *  template cache. Defaults to "no implants" for every existing caller/test. */
export type IsImplantFn = (toothNo: number) => boolean;

/** The artwork kind for one perio-chart tooth, resolved from the active
 *  odontogram chart (injected, like {@link IsImplantFn}, so this module stays
 *  DOM/state-free). `missing` → no crown is drawn (its column stays reserved so
 *  the number rows still align); `milktooth` → deciduous artwork; `implant` →
 *  fixture body; `normal` → the natural tooth. */
export type PerioArtworkKind = "missing" | "milktooth" | "implant" | "normal";
export type ToothKindFn = (toothNo: number) => PerioArtworkKind;

/** The baseline anchor a tooth's graphic aligns on: the implant platform anchor
 *  for an implant, the milk-tooth anchor for a deciduous rendering, else the
 *  natural CEJ. */
function anchorFor(tplNo: TemplateNo, kind: PerioArtworkKind): number {
  const profile = activeAnatomyProfile();
  if (kind === "implant") return profile.implantCejY[tplNo];
  if (kind === "milktooth") return profile.milktoothCejY[tplNo];
  return profile.cejY[tplNo];
}

/** Canine (FDI position 3) root-elongation factor — position 3 renders
 *  `scale(1, CANINE_ROOT_SCALE)` anchored at `CEJ_Y`, so the CEJ itself
 *  (the transform's fixed point) never moves — only the crown/root
 *  proportions around it change. `K > 1`; the exact value is a first-pass
 *  aesthetic choice (canines have a visibly longer root than incisors) —
 *  confirm/tune in a browser. */
const CANINE_ROOT_SCALE = 1.3;

/** Lateral incisor (FDI position 2) width factor — narrower than the
 *  central incisor sharing the same tpl-11 template. */
const LATERAL_INCISOR_WIDTH_SCALE = 0.8;

export type TemplateDocCache = Map<TemplateNo, Document>;

let cachedPromise: Promise<TemplateDocCache> | null = null;

/**
 * Parse each of the 4 tooth templates ONCE into a cached `Document` (never
 * re-parsed per tooth — the returned promise is memoized at module scope so
 * concurrent/repeated calls all await the same settled load). `TEMPLATES` now
 * holds inlined SVG *text* (from `odontogram.ts`'s `?raw` imports), so this
 * parses the markup directly — no `fetch()`. Keeps its OWN cache — the live
 * grid's `tplCache` (inside `buildGrid()`) is a function-local variable, not
 * exported/reachable from here.
 */
export async function loadTemplateCache(): Promise<TemplateDocCache> {
  if (!cachedPromise) {
    cachedPromise = (async () => {
      const cache: TemplateDocCache = new Map();
      const entries = Object.entries(activeAnatomyProfile().templates) as [string, string][];
      for (const [tplNoStr, svgText] of entries) {
        const tplNo = Number(tplNoStr) as TemplateNo;
        if (!svgText) throw new Error(`perioGraphic: missing template SVG for ${tplNoStr}`);
        cache.set(tplNo, new DOMParser().parseFromString(svgText, "image/svg+xml"));
      }
      return cache;
    })().catch((err) => {
      // Let a failed parse be retried on the next call rather than sticking
      // forever on a rejected promise.
      cachedPromise = null;
      throw err;
    });
  }
  return cachedPromise;
}

/** Drop the memoized template cache so the next `loadTemplateCache()` re-parses
 *  from the (now possibly different) active anatomy profile's templates. Called
 *  when the tooth-anatomy profile switches, so the perio chart tracks it. */
export function resetTemplateCache(): void {
  cachedPromise = null;
}

function viewBoxOf(doc: Document): { w: number; h: number } {
  const raw = doc.documentElement.getAttribute("viewBox") || "0 0 40 71";
  const parts = raw.trim().split(/\s+/).map(Number);
  return { w: parts[2] ?? 40, h: parts[3] ?? 71 };
}

/** FDI last digit (tooth "position" within its quadrant: 1=central incisor
 *  ... 8=third molar), independent of quadrant/arch. */
function fdiPosition(toothNo: number): number {
  return toothNo % 10;
}

/** Collect every gradient id referenced via `url(#id)` in `fill`/`style`
 *  anywhere within `root`'s subtree (inclusive of `root` itself). */
function collectReferencedGradientIds(root: Element): Set<string> {
  const ids = new Set<string>();
  const re = /url\(#([^)]+)\)/g;
  const scan = (el: Element) => {
    const src = `${el.getAttribute("fill") || ""} ${el.getAttribute("style") || ""}`;
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(src))) ids.add(m[1]);
    for (let i = 0; i < el.children.length; i++) scan(el.children[i]);
  };
  scan(root);
  return ids;
}

/** Clone every referenced gradient (`<linearGradient>`/`<radialGradient>`)
 *  out of the template's `<defs>` into a fresh `<defs>` — WITHOUT this, a
 *  cloned tooth-base path with `fill="url(#linear-gradient-...)"` resolves
 *  against nothing once moved into a different document/subtree and renders
 *  solid black. Returns `null` when nothing is referenced (true for all 4
 *  current templates' flat-fill `#tooth-base` — then a documented no-op, not
 *  a bug). */
function cloneReferencedDefs(doc: Document, referencedIds: Set<string>): SVGDefsElement | null {
  if (referencedIds.size === 0) return null;
  const defs = document.createElementNS(SVG_NS, "defs") as unknown as SVGDefsElement;
  let found = false;
  for (const id of referencedIds) {
    // Direct id concatenation (no CSS.escape — matches the existing
    // `svgGetById` fallback's `$("#"+id, root)` precedent in odontogram.ts;
    // every id in these assets is a simple hyphenated alphanumeric token).
    const src = doc.querySelector(`#${id}`);
    if (src) {
      defs.appendChild(src.cloneNode(true));
      found = true;
    }
  }
  return found ? defs : null;
}

/** Remove any descendant (or self) whose id is in `EXCLUDED_TOOTH_BASE_IDS`
 *  — belt-and-braces: `#tooth-base` is a single leaf `<path>` in all 4
 *  current templates (so this is currently a no-op), but a future template
 *  revision could nest excluded layers under it — this keeps the exclusion
 *  guarantee robust to that. */
function stripExcludedLayers(root: Element, ids: readonly string[] = EXCLUDED_TOOTH_BASE_IDS): void {
  const excluded = new Set(ids);
  if (excluded.has(root.getAttribute("id") || "")) {
    root.remove();
    return;
  }
  const toRemove: Element[] = [];
  root.querySelectorAll("[id]").forEach((el) => {
    if (excluded.has(el.getAttribute("id") || "")) toRemove.push(el);
  });
  for (const el of toRemove) el.remove();
}

/**
 * Build ONE tooth's crown/root artwork group for the perio row: a clone of
 * that tooth's `#tooth-base` (+ any gradients it references), oriented
 * (horizontal mirror only) and size-transformed for its FDI position.
 *
 * Orientation: `TOOTH_TEMPLATE.get(toothNo)` gives `{tpl, rot, mirror}`. This
 * reads only `tpl`/`mirror` and IGNORES `rot` — using the odontogram's own
 * per-tooth `.rot` (0 for upper-mapped, 180 for lower-mapped entries in the
 * SAME `tpl`) would give the upper and lower halves of one perio row OPPOSITE
 * vertical orientation (a 180° rotation flips both axes) — wrong for a perio
 * chart, which wants every tooth crown-up, uniformly, in both arches.
 *
 * Every template's raw/un-rotated artwork is root-up / crown-down (the crown/
 * incisal edge sits at LARGER y, the root/apex at SMALLER y). So a uniformly
 * crown-up row still needs a vertical flip — just ONE fixed, uniform flip
 * applied to every tooth alike (never the per-tooth conditional `.rot`), which
 * is what step 1 below is.
 */
export function getToothBaseGroupFromCache(
  cache: TemplateDocCache,
  toothNo: number,
  opts: { implant?: boolean; milktooth?: boolean } = {},
): SVGGElement {
  const map = activeAnatomyProfile().toothTemplate.get(toothNo);
  if (!map) throw new Error(`perioGraphic: no TOOTH_TEMPLATE entry for tooth ${toothNo}`);
  const tplNo = map.tpl as TemplateNo;
  const doc = cache.get(tplNo);
  if (!doc) throw new Error(`perioGraphic: template ${tplNo} not loaded in the given cache (tooth ${toothNo})`);

  // An implant tooth renders the fixture body (`#implant-base`) instead of the
  // natural crown/root outline (`#tooth-base`) — the SAME layer the live
  // odontogram activates for a plain implant (see odontogram.ts's
  // `applyStateToSvgSingle`: `#implant` container un-hidden + `#implant-base`
  // active; the attachment sub-layers — locator/bar/healing-abutment — and the
  // peri-implant overlays stay inactive, so `#implant-base` alone is the visible
  // plain-implant body). Everything downstream (clone-referenced-defs, uniform
  // flip, horizontal mirror, per-position size, baseline align) is identical for
  // both — only the source layer id and the baseline anchor differ.
  const implant = opts.implant === true;
  // A milk tooth only exists in the primary positions (1–5, templates 11/13/14);
  // molar templates carry no `#milktooth-base`. If a milktooth is requested on a
  // template that lacks it (malformed/imported state on a molar), fall back to
  // the natural tooth artwork rather than throwing — robustness over a crash.
  const milktooth = opts.milktooth === true && !implant && !!doc.querySelector("#milktooth-base");
  const kind: PerioArtworkKind = implant ? "implant" : milktooth ? "milktooth" : "normal";
  const layerId = implant ? "implant-base" : milktooth ? "milktooth-base" : "tooth-base";
  const baseLayer = doc.querySelector(`#${layerId}`);
  if (!baseLayer) throw new Error(`perioGraphic: #${layerId} not found in template ${tplNo}`);
  const baseClone = baseLayer.cloneNode(true) as SVGElement;
  // Never strip the layer we are extracting (milktooth-base is itself in the
  // exclusion list, since it must be stripped OUT of a natural tooth-base clone).
  stripExcludedLayers(baseClone, EXCLUDED_TOOTH_BASE_IDS.filter((id) => id !== layerId));

  const referenced = collectReferencedGradientIds(baseClone);
  const defsClone = cloneReferencedDefs(doc, referenced);

  const { w, h } = viewBoxOf(doc);
  const cejY = anchorFor(tplNo, kind);

  const outer = document.createElementNS(SVG_NS, "g") as unknown as SVGGElement;
  outer.setAttribute("data-tooth", String(toothNo));
  outer.setAttribute("data-tpl", String(tplNo));
  if (implant) outer.setAttribute("data-implant", "1");
  if (milktooth) outer.setAttribute("data-milktooth", "1");

  if (defsClone) outer.appendChild(defsClone);

  // 1) Uniform vertical flip: root-up/crown-down (raw) -> crown-up (row
  //    convention), applied unconditionally — see the doc comment above.
  //    matrix(1 0 0 -1 0 h): y' = -y + h = h - y; x unchanged.
  const flipGroup = document.createElementNS(SVG_NS, "g") as unknown as SVGGElement;
  flipGroup.setAttribute("transform", `matrix(1 0 0 -1 0 ${fmt(h)})`);
  flipGroup.appendChild(baseClone);

  // 2) Horizontal mirror for left/right mesial-distal correctness.
  //    matrix(-1 0 0 1 w 0): x' = -x + w = w - x; y unchanged.
  //
  //    The flip must equal the live odontogram's NET horizontal flip, and that
  //    is `mirror XOR rot180`, not `mirror` alone: the live grid places every
  //    lower-arch tooth with `rotate(180)` (see `rotate180` in odontogram.ts),
  //    and a 180° rotation flips BOTH axes — its horizontal half cancels or
  //    adds to `mirror`. Step 1 above only ever flips vertically, so reading
  //    `mirror` alone left every lower tooth mirrored the wrong way round, with
  //    mesial pointing AWAY from the midline in both lower quadrants. Each tooth
  //    looked plausible on its own; only the pair read as swapped, which is why
  //    it went unnoticed (the upper arch has rot 0, where both rules agree).
  const mirrorGroup = document.createElementNS(SVG_NS, "g") as unknown as SVGGElement;
  if (map.mirror !== (map.rot === 180)) {
    mirrorGroup.setAttribute("data-perio-mirror", "1");
    mirrorGroup.setAttribute("transform", `matrix(-1 0 0 1 ${fmt(w)} 0)`);
  }
  mirrorGroup.appendChild(flipGroup);

  // 3) Per-position size transform (FDI last digit), anchored so its fixed
  //    point never moves (keeps CEJ_Y-based row-baseline alignment correct
  //    regardless of which position transform, if any, is applied).
  const pos = fdiPosition(toothNo);
  const sizeGroup = document.createElementNS(SVG_NS, "g") as unknown as SVGGElement;
  if (pos === 2) {
    // scale(0.8,1) anchored at the horizontal center (cx = w/2):
    // x' = 0.8*(x-cx)+cx = 0.8x + cx*0.2 = 0.8x + w*0.1
    sizeGroup.setAttribute("data-perio-size", `position-2-width-${LATERAL_INCISOR_WIDTH_SCALE}`);
    sizeGroup.setAttribute("transform", `matrix(${LATERAL_INCISOR_WIDTH_SCALE} 0 0 1 ${fmt(w * (1 - LATERAL_INCISOR_WIDTH_SCALE) / 2)} 0)`);
  } else if (pos === 3) {
    // scale(1,K) anchored at CEJ_Y: y' = K*(y-cejY)+cejY = K*y + cejY*(1-K)
    const f = cejY * (1 - CANINE_ROOT_SCALE);
    sizeGroup.setAttribute("data-perio-size", `position-3-root-${CANINE_ROOT_SCALE}`);
    sizeGroup.setAttribute("transform", `matrix(1 0 0 ${CANINE_ROOT_SCALE} 0 ${fmt(f)})`);
  }
  sizeGroup.appendChild(mirrorGroup);

  outer.appendChild(sizeGroup);
  return outer;
}

/** Trim trailing float noise for readable transform strings (purely
 *  cosmetic — does not change the value). */
function fmt(n: number): string {
  return Number(n.toFixed(3)).toString();
}

/** Row-local y-coordinate the shared CEJ baseline is placed at, for every
 *  tooth in a buccal row (arbitrary but fixed — just needs to leave enough
 *  margin above for the tallest crown and below for the longest root; see
 *  `bandViewBox`'s viewBox sizing). Exported so the curve overlay uses the SAME
 *  baseline the arch teeth are laid out on. */
export const ROW_BASELINE_Y = 40;

/** mm -> pixel (row-local unit) scale for the curve overlay: how far one
 *  millimetre of probing depth / gingival recession moves the curve away from
 *  the CEJ baseline. Chosen so a clinically deep pocket (~10 mm) plus its
 *  recession still lands within the drawn root region below `ROW_BASELINE_Y`
 *  (roots reach row-y ~79, canines ~90) rather than overshooting into the
 *  mirrored palatal band. Named constant, not a magic literal — visual scale
 *  is confirmed in a browser. */
export const PERIO_MM_PX = 3;

/** How many 1-mm guide lines the background mm grid draws below the CEJ
 *  baseline toward the root (n = 1..PERIO_MM_GRID_MAX). 15 mm covers the full
 *  clinical probing-depth range (PD is clamped to 1–15 in the P1 API), so a
 *  charted pocket's curve point always has a numbered guide line to read
 *  against; every 5th line (5/10/15) is emphasized + labelled. */
export const PERIO_MM_GRID_MAX = 15;

/** Row-local x the mm-grid numeric labels ("5"/"10"/"15") are anchored at — a
 *  small left inset so the digits sit at the arch's leading edge rather than
 *  under the teeth. */
const MM_LABEL_X = 2;

/** Fixed horizontal footprint (template viewBox width + gap) reused as the
 *  per-tooth cursor advance — approximate, uniform spacing. */
export const TOOTH_GAP = 2;

/** Display magnification (px per row-local viewBox unit) the perio chart
 *  renders the teeth at. The arch <svg> carries NO intrinsic pixel size (it
 *  fills its container via CSS `width:100%`, see `buildBandSvg`); the
 *  number-row grid columns are widened by this factor (`applyArchColumns` in
 *  `PerioChart.tsx`), and since the SVG fills the cell those columns span,
 *  every viewBox unit ends up rendered at this scale — so the teeth read larger
 *  while the columns stay locked to them (one shared `archToothLayout`).
 *
 *  `applyArchColumns` no longer uses this FIXED value at runtime — it computes
 *  a per-render `fillScale` via {@link computeFillScale} so the chart fills the
 *  available container width instead of leaving empty space on a wide screen.
 *  This constant remains the reference/floor value (`MIN_FILL_SCALE` below is
 *  set equal to it, so a narrow container reproduces the fixed layout) and is
 *  still exported for modules/tests that reference it as the base display
 *  scale. */
export const PERIO_DISPLAY_SCALE = 1.5;

/** Floor for the dynamic fill-scale — below this the teeth would read
 *  uncomfortably small, so a narrow container instead relies on
 *  `.perio-fullgrid-scroll`'s horizontal scrollbar rather than shrinking
 *  further. Equal to `PERIO_DISPLAY_SCALE` so a narrow/unmeasured container
 *  (including jsdom, which reports `clientWidth === 0`) renders with the fixed
 *  layout. */
export const MIN_FILL_SCALE = PERIO_DISPLAY_SCALE;

/** Ceiling for the dynamic fill-scale — caps how large the teeth/number cells
 *  grow on an ultra-wide monitor so they don't become absurdly oversized. */
export const MAX_FILL_SCALE = 2.6;

/**
 * Pure scale-fitting math for the dynamic fill-scale (no DOM): given the pixel
 * width available for an arch's tooth columns and the summed base-scale (1x)
 * footprint of that arch's teeth (`ArchLayout.totalWidth`), return the
 * per-tooth column multiplier that makes the columns fill `available`, clamped
 * to `[MIN_FILL_SCALE, MAX_FILL_SCALE]`. Guards a non-finite/non-positive
 * `baseCols` (empty arch, or the template cache not loaded yet) and a
 * non-finite/negative `available` (unmeasured or over-subtracted container
 * width) by falling back to the floor, so "can't measure" degrades to the
 * fixed layout rather than a broken one.
 */
export function computeFillScale(available: number, baseCols: number): number {
  if (!Number.isFinite(available) || !Number.isFinite(baseCols) || baseCols <= 0) {
    return MIN_FILL_SCALE;
  }
  const raw = available / baseCols;
  if (!Number.isFinite(raw)) return MIN_FILL_SCALE;
  return Math.min(MAX_FILL_SCALE, Math.max(MIN_FILL_SCALE, raw));
}

/** One tooth's horizontal footprint within an arch row (row-local x). */
export interface ArchToothLayout {
  toothNo: number;
  /** Left edge of the tooth's viewBox in the row's coordinate space. */
  x: number;
  /** The tooth template's viewBox width. */
  width: number;
}

/** The full geometric layout of one arch row — the SINGLE source of truth for
 *  where each tooth sits and where the shared CEJ baseline / palatal mirror
 *  axis are. The arch artwork AND the curve overlay both derive their positions
 *  from this, so the curve can never drift out of alignment with the teeth. */
export interface ArchLayout {
  /** Shared CEJ baseline (buccal-row coordinate space). */
  cejY: number;
  /** Total horizontal footprint (last cursor position, incl. trailing gap). */
  totalWidth: number;
  teeth: ArchToothLayout[];
}

/**
 * Compute one arch row's per-tooth x-cursor layout — the exact same
 * left-to-right cursor walk `buildBuccalRowGroup` uses to place the teeth
 * (`cursorX += viewBoxWidth + TOOTH_GAP`), extracted so BOTH the arch artwork
 * and the curve overlay read one identical layout (no divergent second
 * hard-coded spacing). Skips any tooth without a `TOOTH_TEMPLATE`/cache entry,
 * exactly like the row builder does.
 */
export function archToothLayout(
  cache: TemplateDocCache,
  teeth: readonly number[],
  gap: number = TOOTH_GAP,
): ArchLayout {
  const out: ArchToothLayout[] = [];
  let cursorX = 0;
  const toothTemplate = activeAnatomyProfile().toothTemplate;
  for (const toothNo of teeth) {
    const map = toothTemplate.get(toothNo);
    if (!map) continue;
    const tplNo = map.tpl as TemplateNo;
    const doc = cache.get(tplNo);
    if (!doc) continue;
    const { w } = viewBoxOf(doc);
    out.push({ toothNo, x: cursorX, width: w });
    cursorX += w + gap;
  }
  return { cejY: ROW_BASELINE_Y, totalWidth: cursorX, teeth: out };
}

/**
 * Build ONE buccal row: each tooth in `teeth` (in the given order) placed
 * left-to-right at the x from `archToothLayout` (shared with the curve
 * overlay), translated vertically so every tooth's `CEJ_Y` sits on the SAME
 * `ROW_BASELINE_Y`.
 */
function buildBuccalRowGroup(
  cache: TemplateDocCache,
  teeth: readonly number[],
  isImplant: IsImplantFn = () => false,
  gap: number = TOOTH_GAP,
  kindFn?: ToothKindFn,
): { group: SVGGElement; width: number } {
  const row = document.createElementNS(SVG_NS, "g") as unknown as SVGGElement;
  row.setAttribute("class", "perio-tooth-row-buccal");
  const layout = archToothLayout(cache, teeth, gap);
  for (const { toothNo, x } of layout.teeth) {
    // Resolve the artwork kind. A `kindFn` (active-chart aware) supersedes the
    // implant-only predicate, so the graphic tracks the odontogram: missing →
    // draw nothing (column stays reserved by the layout above, keeping the
    // number rows aligned), milktooth → deciduous artwork, implant → fixture body.
    const kind: PerioArtworkKind = kindFn ? kindFn(toothNo) : (isImplant(toothNo) ? "implant" : "normal");
    if (kind === "missing") continue;
    const tplNo = activeAnatomyProfile().toothTemplate.get(toothNo)!.tpl as TemplateNo;
    const toothGroup = getToothBaseGroupFromCache(cache, toothNo, {
      implant: kind === "implant",
      milktooth: kind === "milktooth",
    });
    // Align each tooth's baseline anchor onto the SAME shared ROW_BASELINE_Y.
    const translateY = ROW_BASELINE_Y - anchorFor(tplNo, kind);
    toothGroup.setAttribute("transform", `translate(${fmt(x)} ${fmt(translateY)})`);
    row.appendChild(toothGroup);
  }
  return { group: row, width: layout.totalWidth };
}

/** Vertical padding (row-local units) added above/below a band's own content
 *  in its viewBox, so the deepest crown/root tips (the elongated canine root)
 *  are never clipped. */
const ARCH_VIEWBOX_PAD = 14;

// ---------------------------------------------------------------------------
// `buildBuccalArchSvg`/`buildPalatalArchSvg` are the arch-artwork API — one
// per aspect, each uniformly oriented across BOTH arches (buccal always
// crown-down, palatal always crown-up) and each mounted into its own grid cell
// by `PerioChart.tsx`, with the central perio index band (Plaque/PI/GI/mPI/mBI)
// between them.
//
// Both builders share `buildBuccalRowGroup` (the per-tooth CEJ-aligned row
// cursor walk) and `archToothLayout`, so the buccal and palatal SVGs' per-tooth
// x-columns are identical to each other AND to the teeth/curve/overlay/mm-grid/
// number-grid columns everywhere else in the chart (one shared layout).
// ---------------------------------------------------------------------------

/**
 * Half-height (row-local units) reserved above/below the shared CEJ baseline
 * for ONE independently-viewBoxed band's own content. The worst-case
 * single-band content span is the position-3 canine's `CANINE_ROOT_SCALE`-
 * elongated root: `CANINE_ROOT_SCALE * (tpl-13 root length)` = `1.3 * (71.0 -
 * CEJ_Y[13])` = `1.3 * 38.6` ≈ 50.2 — comfortably bigger than the tallest
 * crown (`max(CEJ_Y)` ≈ 32.4) and the mm-grid's 15-line reach
 * (`PERIO_MM_GRID_MAX * PERIO_MM_PX` = 45), so a single symmetric half-span
 * safely bounds either band (buccal-flipped or palatal raw — mirror images
 * about `ROW_BASELINE_Y`) without clipping. Rounded up slightly for margin.
 */
const BAND_CONTENT_HALF_SPAN = 51;

/** Shared viewBox math for either single-band arch SVG: `y` spans
 *  `[ROW_BASELINE_Y - BAND_CONTENT_HALF_SPAN - ARCH_VIEWBOX_PAD, ROW_BASELINE_Y +
 *  BAND_CONTENT_HALF_SPAN + ARCH_VIEWBOX_PAD]`. */
function bandViewBox(width: number): { y: number; w: number; h: number } {
  const top = ROW_BASELINE_Y - BAND_CONTENT_HALF_SPAN - ARCH_VIEWBOX_PAD;
  const h = 2 * (BAND_CONTENT_HALF_SPAN + ARCH_VIEWBOX_PAD);
  return { y: top, w: Math.max(width, 1), h };
}

/** Wrap one already-oriented row `<g>` into a standalone, responsive
 *  `<svg class="perio-tooth-arch ...">` — no fixed width/height, just
 *  `preserveAspectRatio` + `aria-hidden` (CSS `width:100%` fill + a purely
 *  decorative, screen-reader-hidden subtree). Shared by both
 *  `buildBuccalArchSvg`/`buildPalatalArchSvg` below, so the two bands' SVG
 *  contract is identical. */
function buildBandSvg(className: string, row: SVGGElement, width: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg") as unknown as SVGSVGElement;
  svg.setAttribute("class", className);
  const vb = bandViewBox(width);
  svg.setAttribute("viewBox", `0 ${fmt(vb.y)} ${fmt(vb.w)} ${fmt(vb.h)}`);
  svg.setAttribute("preserveAspectRatio", "xMinYMid meet");
  svg.setAttribute("aria-hidden", "true");
  svg.appendChild(row);
  return svg;
}

/**
 * Build the BUCCAL-aspect arch as a standalone `<svg>`, oriented crown-DOWN
 * for BOTH arches: the row builder's raw output is crown-up (per
 * `getToothBaseGroupFromCache`'s uniform per-tooth flip), so this applies ONE
 * unconditional vertical flip about the CEJ baseline (`matrix(1 0 0 -1 0
 * 2*ROW_BASELINE_Y)`) — the baseline itself is the transform's fixed point, so
 * it never moves. Own mm-grid, counter-flipped (`flip: true`) so its numeric
 * labels read upright inside this net-flipped row.
 */
export function buildBuccalArchSvg(
  cache: TemplateDocCache,
  teeth: readonly number[],
  isImplant: IsImplantFn = () => false,
  gap: number = TOOTH_GAP,
  kindFn?: ToothKindFn,
): SVGSVGElement {
  const { group: row, width } = buildBuccalRowGroup(cache, teeth, isImplant, gap, kindFn);
  row.setAttribute("class", "perio-tooth-row-buccal");
  row.setAttribute("transform", `matrix(1 0 0 -1 0 ${fmt(2 * ROW_BASELINE_Y)})`);
  row.insertBefore(
    buildMmGridLayer({ cejY: ROW_BASELINE_Y, mmPx: PERIO_MM_PX, width, flip: true }),
    row.firstChild,
  );
  return buildBandSvg("perio-tooth-arch perio-tooth-arch-buccal", row, width);
}

/**
 * Build the PALATAL/LINGUAL-aspect arch as a standalone `<svg>`, oriented
 * crown-UP for BOTH arches — the vertical mirror of `buildBuccalArchSvg`'s
 * uniform crown-down flip, about the SAME `ROW_BASELINE_Y` fixed point.
 * Mirroring the SAME axis twice cancels back to the identity transform, so
 * "mirror of buccal" here is exactly the row builder's own un-flipped
 * (crown-up) output — i.e. no orientation transform is applied at all; only
 * the horizontal per-tooth mesial/distal mirror (already baked into each
 * tooth group by `getToothBaseGroupFromCache`) and the uniform per-tooth
 * crown-up flip remain. Own mm-grid, NOT counter-flipped (`flip: false`) —
 * this row is never net-flipped, so its labels already read upright.
 */
export function buildPalatalArchSvg(
  cache: TemplateDocCache,
  teeth: readonly number[],
  isImplant: IsImplantFn = () => false,
  gap: number = TOOTH_GAP,
  kindFn?: ToothKindFn,
): SVGSVGElement {
  const { group: row, width } = buildBuccalRowGroup(cache, teeth, isImplant, gap, kindFn);
  row.setAttribute("class", "perio-tooth-row-palatal-inner");
  row.insertBefore(
    buildMmGridLayer({ cejY: ROW_BASELINE_Y, mmPx: PERIO_MM_PX, width, flip: false }),
    row.firstChild,
  );
  return buildBandSvg("perio-tooth-arch perio-tooth-arch-palatal", row, width);
}

// ---------------------------------------------------------------------------
// The curve overlay (CEJ + gingival margin + pocket base + filled band).
// ---------------------------------------------------------------------------

/** A single ordered site's PD/GM reading for the curve. `pd` absent/undefined
 *  == "not charted" (a gap in the line), matching the P1 omit-when-empty API.
 *  `site` is carried only for readability/debugging — the curve math uses the
 *  positional index, never the site name. */
export interface PerioCurveSite {
  site?: string;
  /** Probing depth in mm; undefined/null when the site is not charted. */
  pd?: number | null;
  /** Gingival margin vs CEJ (SIGNED: recession +, coronal −); defaults 0. */
  gm?: number | null;
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface PerioCurveResult {
  cejY: number;
  /** Gingival-margin point per input site (null == uncharted gap). */
  marginPts: (CurvePoint | null)[];
  /** Pocket-base point per input site (null == uncharted gap). */
  pocketPts: (CurvePoint | null)[];
}

/**
 * Pure curve geometry — turn ordered per-site {pd,gm} readings into the
 * gingival-margin and pocket-base point arrays, in the arch row's LOCAL
 * coordinate space (crown up = smaller y, root down = larger y; the shared
 * CEJ baseline at `opts.cejY`). No DOM.
 *
 * Orientation (buccal row): `y` grows downward toward the root, so
 *   marginY = cejY + (gm ?? 0)*mmPx   → recession (gm>0) pushes the margin
 *                                        DOWN toward the root; a coronal
 *                                        margin (gm<0) lifts it above the CEJ.
 *   pocketY = marginY + pd*mmPx       → a deeper pocket dips the pocket line
 *                                        FURTHER from the CEJ toward the root.
 * The palatal row reuses this same buccal-space result; its band renders in an
 * independent SVG (crown-up, identity transform — no net mirror), so "toward
 * the root" stays anatomically consistent on both rows.
 *
 * An uncharted site (`pd` undefined/null) yields `null` at that index in BOTH
 * arrays, so the caller can break the polyline/band there (line gaps).
 */
export function perioCurve(
  sites: readonly PerioCurveSite[],
  opts: { cejY: number; mmPx: number; siteX: (i: number) => number },
): PerioCurveResult {
  const { cejY, mmPx, siteX } = opts;
  const marginPts: (CurvePoint | null)[] = [];
  const pocketPts: (CurvePoint | null)[] = [];
  sites.forEach((s, i) => {
    if (s.pd === undefined || s.pd === null) {
      marginPts.push(null);
      pocketPts.push(null);
      return;
    }
    const x = siteX(i);
    const marginY = cejY + (s.gm ?? 0) * mmPx;
    const pocketY = marginY + s.pd * mmPx;
    marginPts.push({ x, y: marginY });
    pocketPts.push({ x, y: pocketY });
  });
  return { cejY, marginPts, pocketPts };
}

/** Split a point array into maximal contiguous runs of non-null points (a
 *  `null` breaks the run — the "line gap" at an uncharted site). */
function contiguousRuns(pts: readonly (CurvePoint | null)[]): CurvePoint[][] {
  const runs: CurvePoint[][] = [];
  let cur: CurvePoint[] = [];
  for (const p of pts) {
    if (p) {
      cur.push(p);
    } else if (cur.length) {
      runs.push(cur);
      cur = [];
    }
  }
  if (cur.length) runs.push(cur);
  return runs;
}

function polylinePoints(run: readonly CurvePoint[]): string {
  return run.map((p) => `${fmt(p.x)},${fmt(p.y)}`).join(" ");
}

/**
 * Build the curve overlay <g> for ONE row: a red horizontal CEJ line at
 * `cejY`, a filled band `<path>` between the margin and pocket lines, and the
 * margin + pocket polylines — each broken into separate segments at uncharted
 * gaps. Pure DOM (jsdom `document` in tests / the browser at runtime) — no
 * perio-module call, so it is trivially unit-testable and parity-irrelevant
 * (brand-new DOM, never near the live odontogram).
 */
export function buildPerioCurveLayer(
  curve: PerioCurveResult,
  opts: { width: number; className?: string },
): SVGGElement {
  const g = document.createElementNS(SVG_NS, "g") as unknown as SVGGElement;
  g.setAttribute("class", opts.className ?? "perio-curve");

  // CEJ baseline — always drawn, even for an all-uncharted arch.
  const cej = document.createElementNS(SVG_NS, "line");
  cej.setAttribute("class", "perio-curve-cej");
  cej.setAttribute("x1", "0");
  cej.setAttribute("y1", fmt(curve.cejY));
  cej.setAttribute("x2", fmt(opts.width));
  cej.setAttribute("y2", fmt(curve.cejY));
  g.appendChild(cej);

  const marginRuns = contiguousRuns(curve.marginPts);
  const pocketRuns = contiguousRuns(curve.pocketPts);

  // Filled band between the two lines, per contiguous run (margin/pocket share
  // the same null pattern, so the runs line up index-for-index): trace the
  // margin left→right, then the pocket right→left, and close.
  for (let r = 0; r < marginRuns.length; r++) {
    const mRun = marginRuns[r];
    const pRun = pocketRuns[r];
    if (!pRun || mRun.length === 0) continue;
    const forward = mRun.map((p, i) => `${i === 0 ? "M" : "L"}${fmt(p.x)} ${fmt(p.y)}`).join(" ");
    const back = [...pRun].reverse().map((p) => `L${fmt(p.x)} ${fmt(p.y)}`).join(" ");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("class", "perio-curve-band");
    path.setAttribute("d", `${forward} ${back} Z`);
    g.appendChild(path);
  }

  for (const run of marginRuns) {
    const pl = document.createElementNS(SVG_NS, "polyline");
    pl.setAttribute("class", "perio-curve-margin");
    pl.setAttribute("points", polylinePoints(run));
    g.appendChild(pl);
  }
  for (const run of pocketRuns) {
    const pl = document.createElementNS(SVG_NS, "polyline");
    pl.setAttribute("class", "perio-curve-pocket");
    pl.setAttribute("points", polylinePoints(run));
    g.appendChild(pl);
  }

  return g;
}

// ---------------------------------------------------------------------------
// The background millimetre guide grid.
// ---------------------------------------------------------------------------

/**
 * Build the background mm-grid layer for ONE row: faint horizontal guide lines
 * every 1 mm below the CEJ baseline toward the root (`y = cejY + n*mmPx`, n =
 * 1..maxMm), with every 5th line emphasized (`perio-mm-line-major`) and given a
 * small numeric label ("5"/"10"/"15"). Pure DOM (jsdom in tests / the browser
 * at runtime) — no perio-module call, so it is trivially unit-testable and
 * parity-irrelevant (brand-new DOM, never near the live odontogram).
 *
 * The grid is drawn in the SAME row-local coordinate space as the teeth and the
 * curve (crown up = smaller y, root down = larger y; shared CEJ baseline at
 * `cejY`), so a line at "n mm from the CEJ" lands EXACTLY where an n-mm (gm=0)
 * pocket's curve point lands (`perioCurve` → `pocketY = cejY + n*mmPx`). The
 * caller appends it INTO the SAME oriented/mirrored row group as the teeth
 * (`.perio-tooth-row-buccal` / `.perio-tooth-row-palatal-inner`), so the
 * per-arch flip carries the grid along with the teeth — the mm lines stay on the
 * ROOT side of the CEJ (away from the occlusal mid-line) on both arches.
 *
 * `flip`: when the containing row group is NET vertically flipped on screen
 * (the upper arch's crown-down buccal row, or the lower arch's mirrored palatal
 * row), the numeric labels would render upside-down. Passing `flip: true`
 * counter-flips each label about its own baseline (`matrix(1 0 0 -1 0 2y)`) so
 * the digits read upright regardless of the row's orientation — the LINES,
 * being horizontal, are unaffected either way.
 *
 * The whole `<g>` is `aria-hidden` — a decorative measurement guide; the
 * accessible data lives in the number cells/summary alongside the graphic.
 */
export function buildMmGridLayer(opts: {
  cejY: number;
  mmPx: number;
  width: number;
  maxMm?: number;
  flip?: boolean;
}): SVGGElement {
  const { cejY, mmPx, width } = opts;
  const maxMm = opts.maxMm ?? PERIO_MM_GRID_MAX;
  const flip = opts.flip ?? false;

  const g = document.createElementNS(SVG_NS, "g") as unknown as SVGGElement;
  g.setAttribute("class", "perio-mm-grid");
  g.setAttribute("aria-hidden", "true");

  for (let n = 1; n <= maxMm; n++) {
    const y = cejY + n * mmPx;
    const major = n % 5 === 0;

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("class", major ? "perio-mm-line perio-mm-line-major" : "perio-mm-line perio-mm-line-minor");
    line.setAttribute("data-mm", String(n));
    line.setAttribute("x1", "0");
    line.setAttribute("y1", fmt(y));
    line.setAttribute("x2", fmt(width));
    line.setAttribute("y2", fmt(y));
    g.appendChild(line);

    if (major) {
      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("class", "perio-mm-label");
      label.setAttribute("data-mm", String(n));
      label.setAttribute("x", fmt(MM_LABEL_X));
      label.setAttribute("y", fmt(y));
      // Counter-flip about the label's own baseline so the digits read upright
      // inside a net-flipped row group (see the doc comment). Horizontal lines
      // need no such correction.
      if (flip) label.setAttribute("transform", `matrix(1 0 0 -1 0 ${fmt(2 * y)})`);
      label.textContent = String(n);
      g.appendChild(label);
    }
  }

  return g;
}

// ---------------------------------------------------------------------------
// The discrete-highlight overlay layers (BOP / plaque / >=5mm / >=6mm).
// Display-only marks drawn OVER the arch, in the SAME row-local coordinate
// space (and via the SAME `archToothLayout` site x-positions + `PERIO_MM_PX`)
// the teeth + curve ride — so a mark lands on exactly the site it describes, on
// both arches, after the per-arch flip.
//
// The pure geometry (`perioOverlayMarks`/`perioPlaqueMarks`) turns per-site /
// per-tooth-surface readings into positioned marks; the pure DOM builder
// (`buildPerioOverlayLayer`) renders them into an aria-hidden `<g>`. Both are
// DOM-free logic tested in isolation; `PerioChart.drawArchOverlay` wires them
// to the live perio data + appends the result into the oriented row groups.
// ---------------------------------------------------------------------------

/** A single positioned overlay mark (row-local coordinate space). `kind`
 *  selects the CSS class / colour: a red BOP dot, a plaque mark, or a
 *  pocket-threshold heat spot (`pd5`/`pd6`). */
export interface OverlayMark {
  x: number;
  y: number;
  kind: "bop" | "plaque" | "pd5" | "pd6" | "heat-shallow" | "heat-moderate" | "heat-deep" | "rt1" | "rt2" | "rt3";
}

/** One ordered site's reading for the discrete site-based overlays. `pd`
 *  absent/undefined == "not charted" (never marked). Same shape/orientation
 *  convention as {@link PerioCurveSite}, plus the site's `x` and its `bop`
 *  flag. */
export interface PerioOverlaySite {
  x: number;
  pd?: number | null;
  gm?: number | null;
  bop?: boolean;
  /** Clinical attachment level (= pd + gm), as returned by `getToothCal`. Only
   *  populated/consumed by the CAL heat overlay; every other discrete overlay
   *  (bop/pd5/pd6) ignores it. Kept on this shared shape (rather than a parallel
   *  interface) since it reuses the exact same x/pd/gm fields
   *  `collectOverlayInput` already builds. */
  cal?: number | null;
}

/** Discrete overlay layers that are site-based (one mark per probing site). */
export type SiteOverlayLayer = "bop" | "pd5" | "pd6";

/**
 * Pure geometry for the site-based discrete overlays. Uses the EXACT same
 * coordinate math as `perioCurve` (`marginY = cejY + gm*mmPx`, `pocketY =
 * marginY + pd*mmPx`), so a mark sits on the same point the curve draws:
 *   - `bop`      : a dot at the gingival MARGIN of every bleeding, charted
 *                  site (a bop flag on an uncharted site is ignored, mirroring
 *                  `getPerioSummary().bopPercent`).
 *   - `pd5`/`pd6`: a heat spot at the POCKET BASE of every charted site whose
 *                  probing depth is >= 5 / >= 6 mm.
 * An uncharted site (`pd` undefined/null) never produces a mark.
 */
export function perioOverlayMarks(
  layer: SiteOverlayLayer,
  sites: readonly PerioOverlaySite[],
  opts: { cejY: number; mmPx: number },
): OverlayMark[] {
  const { cejY, mmPx } = opts;
  const out: OverlayMark[] = [];
  for (const s of sites) {
    const charted = s.pd !== undefined && s.pd !== null;
    if (!charted) continue;
    const pd = s.pd as number;
    const marginY = cejY + (s.gm ?? 0) * mmPx;
    if (layer === "bop") {
      if (s.bop) out.push({ x: s.x, y: marginY, kind: "bop" });
    } else {
      const threshold = layer === "pd5" ? 5 : 6;
      if (pd >= threshold) out.push({ x: s.x, y: marginY + pd * mmPx, kind: layer });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// The continuous mm heat overlays (PD / CAL / GR). Unlike the discrete
// threshold marks (bop/pd5/pd6, each a fixed pass/fail highlight), these
// heat-colour EVERY charted site by how deep its reading is, via a small pure
// value->bucket ramp. Bucket names double as the mark `kind` (prefixed
// "heat-"), so `buildPerioOverlayLayer` classes/sizes a circle purely from
// `mark.kind`.
// ---------------------------------------------------------------------------

/** Severity bucket for a continuous mm heat overlay — shallow/moderate/deep,
 *  reused across PD, CAL, and GR (each with its own threshold ramp below). */
export type MmHeatBucket = "shallow" | "moderate" | "deep";

/**
 * Pure ramp for a probing-style distance in mm — PD (raw probing depth) or
 * CAL (`pd + gm`, i.e. attachment loss from the CEJ). Thresholds mirror the
 * pd5/pd6 discrete-overlay thresholds (>=4mm starts to matter clinically,
 * >=6mm is a deep/severe pocket), so the heat scale and the discrete
 * >=5mm/>=6mm highlights read consistently side by side.
 */
export function pdCalHeatBucket(mm: number): MmHeatBucket {
  if (mm >= 6) return "deep";
  if (mm >= 4) return "moderate";
  return "shallow";
}

/**
 * Pure ramp for gingival recession (`gm`, in mm — only meaningful when
 * `gm > 0`; a non-positive `gm` is a pseudopocket/coronal margin, never
 * recession, and must be filtered out by the caller before ramping). Lower
 * thresholds than {@link pdCalHeatBucket}: recession is measured on a
 * shallower clinical scale than pocket/attachment depth.
 */
export function recessionHeatBucket(mm: number): MmHeatBucket {
  if (mm >= 4) return "deep";
  if (mm >= 2) return "moderate";
  return "shallow";
}

/** The 3 continuous mm heat overlay layers. */
export type MmHeatOverlayLayer = "pd" | "cal" | "gr";

/**
 * Pure geometry for the continuous mm heat overlays. Reuses the EXACT same
 * coordinate math as `perioCurve`/`perioOverlayMarks` (`marginY = cejY +
 * gm*mmPx`, `pocketY = marginY + pd*mmPx`):
 *   - `pd` : every charted site, heat-bucketed by probing depth, marked at the
 *            pocket base (same point the pd5/pd6 discrete marks use).
 *   - `cal`: every charted site, heat-bucketed by CAL (`site.cal`, falling
 *            back to `pd + gm` if the caller didn't attach it — the two are
 *            always numerically identical, see `getToothCal`), marked at the
 *            SAME pocket-base point (`cejY + cal*mmPx === cejY + (pd+gm)*mmPx`
 *            — CAL measured from the CEJ IS the pocket base).
 *   - `gr` : only sites with recession (`gm > 0`) are marked, heat-bucketed by
 *            `gm` via {@link recessionHeatBucket}, at the gingival margin
 *            (the same point the recession sits at — mirrors `bop`'s
 *            margin-point placement).
 * An uncharted site (`pd` undefined/null) never produces a mark, matching
 * every other site-based overlay.
 */
export function perioMmHeatMarks(
  layer: MmHeatOverlayLayer,
  sites: readonly PerioOverlaySite[],
  opts: { cejY: number; mmPx: number },
): OverlayMark[] {
  const { cejY, mmPx } = opts;
  const out: OverlayMark[] = [];
  for (const s of sites) {
    const charted = s.pd !== undefined && s.pd !== null;
    if (!charted) continue;
    const pd = s.pd as number;
    const gm = s.gm ?? 0;

    if (layer === "gr") {
      if (gm <= 0) continue;
      out.push({ x: s.x, y: cejY + gm * mmPx, kind: `heat-${recessionHeatBucket(gm)}` });
      continue;
    }

    const mm = layer === "cal" ? s.cal ?? pd + gm : pd;
    const y = cejY + (gm + pd) * mmPx; // pocket base — equals cejY + cal*mmPx for CAL
    out.push({ x: s.x, y, kind: `heat-${pdCalHeatBucket(mm)}` });
  }
  return out;
}

/** One tooth's plaque input for {@link perioPlaqueMarks}: its row-local x +
 *  viewBox width and the set of O'Leary surfaces that carry plaque. */
export interface PerioPlaqueTooth {
  x: number;
  width: number;
  surfaces: readonly string[];
}

/**
 * Pure geometry for the plaque overlay: one mark per charted O'Leary surface,
 * placed on the tooth's cervical band (at the shared CEJ baseline). Plaque is
 * a whole-tooth, 4-surface index (mesial/distal/buccal/lingual) rather than a
 * per-probing-site reading, so the marks split across the two rows:
 *   - the BUCCAL aspect shows mesial/buccal/distal (interproximal + facial),
 *   - the PALATAL/LINGUAL aspect shows lingual.
 * This way every charted surface is drawn exactly once across the two rows.
 */
export function perioPlaqueMarks(
  teeth: readonly PerioPlaqueTooth[],
  aspect: "buccal" | "palatal",
  opts: { cejY: number; mmPx: number },
): OverlayMark[] {
  const out: OverlayMark[] = [];
  for (const tooth of teeth) {
    const has = (surface: string) => tooth.surfaces.includes(surface);
    if (aspect === "buccal") {
      if (has("mesial")) out.push({ x: tooth.x + tooth.width * 0.2, y: opts.cejY, kind: "plaque" });
      if (has("buccal")) out.push({ x: tooth.x + tooth.width * 0.5, y: opts.cejY, kind: "plaque" });
      if (has("distal")) out.push({ x: tooth.x + tooth.width * 0.8, y: opts.cejY, kind: "plaque" });
    } else {
      if (has("lingual")) out.push({ x: tooth.x + tooth.width * 0.5, y: opts.cejY, kind: "plaque" });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// The Cairo (2011) recession-TYPE overlay. Unlike every overlay above (one
// mark per PROBING SITE or per O'Leary SURFACE), Cairo's RT is a single,
// per-TOOTH derived classification (see `getToothRecessionType` in
// odontogram.ts) — the caller collects one RT per tooth (not per site) and
// passes it in here, mirroring the shape `perioPlaqueMarks` uses for its own
// whole-tooth index. RT is specifically a BUCCAL-recession classification (it
// reads `perio.gm.get("B")`), so — unlike plaque, which splits across both
// rows — a mark is only ever placed on the BUCCAL aspect, at the tooth's
// cervical/CEJ point (the same point the buccal margin sits at when gm=0).
// ---------------------------------------------------------------------------

/** One tooth's Cairo-overlay input for {@link perioCairoMarks}: its row-local
 *  x + viewBox width and its derived recession TYPE (`"none"` -> no mark). */
export interface PerioCairoTooth {
  x: number;
  width: number;
  rt: "none" | "rt1" | "rt2" | "rt3";
}

/**
 * Pure geometry for the Cairo recession-type overlay: one mark per tooth
 * whose derived RT is not `"none"`, centered on the tooth at the shared CEJ
 * baseline (the same `cejY` every other overlay/curve anchors to). A tooth
 * with `"none"` (no buccal recession, or not charted) yields no mark.
 */
export function perioCairoMarks(
  teeth: readonly PerioCairoTooth[],
  opts: { cejY: number },
): OverlayMark[] {
  const out: OverlayMark[] = [];
  for (const tooth of teeth) {
    if (tooth.rt === "none") continue;
    out.push({ x: tooth.x + tooth.width * 0.5, y: opts.cejY, kind: tooth.rt });
  }
  return out;
}

// ---------------------------------------------------------------------------
// The PI/GI graded-index overlays + the KG keratinized-gingiva-width overlay.
// PI/GI (Silness-Löe Plaque Index / Löe-Silness Gingival Index, 0-3 per
// O'Leary surface) mirror `perioPlaqueMarks`' whole-tooth-surface shape
// (mesial/buccal/distal on the buccal aspect, lingual on the palatal aspect)
// but heat-bucket the grade instead of marking bare presence — reusing the
// same shallow/moderate/deep heat vocabulary the mm ramps use, so
// `buildPerioOverlayLayer` needs no new mark kinds. KG (a single per-tooth
// BUCCAL mm scalar) mirrors `perioCairoMarks`' one-mark-per-tooth, buccal-only
// shape.
// ---------------------------------------------------------------------------

/** One tooth's graded-index input (PI/GI) for {@link perioGradeMarks}: its
 *  row-local x + viewBox width and each of the 4 O'Leary surfaces' grade
 *  (0-3; 0/absent = healthy/uncharted — matches getPlaqueIndex/
 *  getGingivalIndex's own "absence" semantics, never marked). */
export interface PerioGradeTooth {
  x: number;
  width: number;
  grades: Partial<Record<"mesial" | "distal" | "buccal" | "lingual", 0 | 1 | 2 | 3>>;
}

/** Severity bucket for a CHARTED graded per-surface index reading (PI/GI,
 *  1-3) — reuses the same shallow/moderate/deep heat vocabulary as the
 *  continuous mm ramps ({@link pdCalHeatBucket}/{@link recessionHeatBucket}).
 *  Callers only ever bucket a grade >0 (0/uncharted is filtered out before
 *  reaching here, mirroring `perioPlaqueMarks`' presence-only marking). */
export function gradeHeatBucket(grade: 1 | 2 | 3): MmHeatBucket {
  if (grade >= 3) return "deep";
  if (grade >= 2) return "moderate";
  return "shallow";
}

/**
 * Pure geometry for the PI/GI graded-index overlays: one heat-bucketed mark
 * per CHARTED (grade>0) O'Leary surface, at the SAME cervical/CEJ points
 * {@link perioPlaqueMarks} uses — the marks split across the two rows exactly
 * like the plaque overlay (buccal aspect: mesial/buccal/distal; palatal/
 * lingual aspect: lingual), so every charted surface is drawn exactly once.
 */
export function perioGradeMarks(
  teeth: readonly PerioGradeTooth[],
  aspect: "buccal" | "palatal",
  opts: { cejY: number },
): OverlayMark[] {
  const out: OverlayMark[] = [];
  for (const tooth of teeth) {
    const mark = (x: number, g: 0 | 1 | 2 | 3 | undefined) => {
      if (!g) return; // 0/undefined -> healthy/uncharted, no mark
      out.push({ x, y: opts.cejY, kind: `heat-${gradeHeatBucket(g)}` });
    };
    if (aspect === "buccal") {
      mark(tooth.x + tooth.width * 0.2, tooth.grades.mesial);
      mark(tooth.x + tooth.width * 0.5, tooth.grades.buccal);
      mark(tooth.x + tooth.width * 0.8, tooth.grades.distal);
    } else {
      mark(tooth.x + tooth.width * 0.5, tooth.grades.lingual);
    }
  }
  return out;
}

/** One tooth's keratinized-gingiva-width input for {@link perioKgMarks}: its
 *  row-local x + viewBox width and its KG mm reading (`null` = not charted,
 *  never marked). */
export interface PerioKgTooth {
  x: number;
  width: number;
  kg: number | null;
}

/**
 * Pure ramp for keratinized (attached) gingiva width in mm. Unlike a probing
 * depth/CAL ramp, a NARROW band is the mucogingival risk here — the severity
 * direction is inverted: <2mm inadequate ("deep"), <4mm borderline
 * ("moderate"), >=4mm adequate ("shallow" — reusing the shallow/moderate/deep
 * heat vocabulary purely as a severity ramp, not a literal depth reading).
 */
export function kgHeatBucket(mm: number): MmHeatBucket {
  if (mm < 2) return "deep";
  if (mm < 4) return "moderate";
  return "shallow";
}

/**
 * Pure geometry for the KG overlay: one heat-bucketed mark per tooth with a
 * charted (non-null) KG reading, centered on the tooth's BUCCAL cervical/CEJ
 * point (KG is specifically a buccal measure — mirrors {@link perioCairoMarks}'
 * buccal-only placement). A tooth with `kg === null` (never charted) yields
 * no mark.
 */
export function perioKgMarks(teeth: readonly PerioKgTooth[], opts: { cejY: number }): OverlayMark[] {
  const out: OverlayMark[] = [];
  for (const tooth of teeth) {
    if (tooth.kg === null) continue;
    out.push({ x: tooth.x + tooth.width * 0.5, y: opts.cejY, kind: `heat-${kgHeatBucket(tooth.kg)}` });
  }
  return out;
}

/** Per-kind marker radius (row-local units). BOP dots read small + crisp; the
 *  pocket-threshold heat spots are larger fills; plaque sits between. The
 *  Cairo RT badges scale with severity, mirroring the heat-bucket ramp. */
const OVERLAY_MARK_RADIUS: Record<OverlayMark["kind"], number> = {
  bop: 2,
  plaque: 2.6,
  pd5: 3.4,
  pd6: 4,
  "heat-shallow": 2.4,
  "heat-moderate": 3.2,
  "heat-deep": 4.2,
  rt1: 2.8,
  rt2: 3.5,
  rt3: 4.2,
};

/**
 * Build the overlay `<g>` for ONE row from a positioned mark list: an
 * aria-hidden group (decorative — the accessible data lives in the number
 * cells/summary) of one `<circle>` per mark, classed `perio-overlay-{kind}`
 * so CSS colours the BOP dot red, the plaque mark, and the pd5/pd6 heat spots.
 * Pure DOM (jsdom in tests / the browser at runtime) — no perio-module call,
 * so it is trivially unit-testable and parity-irrelevant.
 */
export function buildPerioOverlayLayer(
  marks: readonly OverlayMark[],
  opts: { width: number; className?: string },
): SVGGElement {
  const g = document.createElementNS(SVG_NS, "g") as unknown as SVGGElement;
  g.setAttribute("class", `perio-overlay-layer${opts.className ? ` ${opts.className}` : ""}`);
  g.setAttribute("aria-hidden", "true");
  for (const mark of marks) {
    const c = document.createElementNS(SVG_NS, "circle");
    c.setAttribute("class", `perio-overlay-mark perio-overlay-${mark.kind}`);
    c.setAttribute("data-kind", mark.kind);
    c.setAttribute("cx", fmt(mark.x));
    c.setAttribute("cy", fmt(mark.y));
    c.setAttribute("r", fmt(OVERLAY_MARK_RADIUS[mark.kind]));
    g.appendChild(c);
  }
  return g;
}
