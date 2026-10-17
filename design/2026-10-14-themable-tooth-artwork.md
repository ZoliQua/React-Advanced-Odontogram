# Themable tooth artwork — design and plan

**Status:** implemented 2026-10-17, all seven stages. Raised by
[issue #28](https://github.com/ZoliQua/React-Advanced-Odontogram/issues/28).

Stage 5 (the default dark palette) was resolved by measurement rather than
taste: light mode puts the crown at only 1.10:1 against the page, so the dark
palette reproduces that relationship instead of dimming a light crown, and
caries flips polarity to stay visible. The reasoning and the full ratio table
live with the values, in the `.dark` artwork block in `src/index.css`.

## What the implementation changed about this plan

Two things turned up once the artwork was actually inventoried, and both made
the work smaller than planned:

1. **The mechanism already existed.** 33 tokens — every restoration and filling
   MATERIAL (`--odon-rest-gold`, `--odon-fill-composite`, the e.max and
   metal-ceramic gradient stops) — were already in the measured artwork,
   flowing through the generator untouched. They were simply undocumented and
   unreachable: no entry in `OdontogramThemeConfig`, no mention in any README.
   So `var()` in an inline style was already proven in-tree, and Stage 2's risk
   largely evaporated.
2. **Threading a palette through `build.py` was unnecessary.** Because the
   generator copies style attributes verbatim, tokenizing the six donor
   drawings is enough for all 40 generated templates. Only the two colours
   `occlusal.py` synthesizes itself (cusp field, fissure lines) needed a change
   in Python. `tools/toothgen/tokenize.py` applies the table to the donors and
   to the six classic assets in one idempotent pass.

A third finding was not a simplification: **the classic and measured sets are
drawn in different colours for the same material** — composite `#feffbf` vs
`#2f7a4d`, zircon `#feffbf` vs `#cfe3ee`, gold `#ece614` vs `#e0a80d`, gradia
`#55ff98` vs `#57b285`. Keying the rules on the LAYER rather than the colour
means one token drives both profiles: unset, each keeps the colour it has
today; set, they finally agree.

Result: **2382 declarations tokenized across 64 tokens in 12 hand-edited
files**, and every one of the 46 installed assets is rendering-identical to
before when no variable is set (verified by flattening `var(token, fallback)`
back to the fallback on both sides and diffing — zero differences).

> **Why this file is not in `docs/`.** `typedoc.json` has `out: "docs"`, and
> typedoc clears that directory on every run — it already destroyed the previous
> `docs/superpowers/specs/` and `docs/superpowers/plans/` in commit `4acbf76`
> (2026-09-10), which is why `tools/toothgen/README.md` now links to a design doc
> that no longer exists. Design documents belong outside the generated output.

## Goal

Let a host recolour the tooth drawings — enamel, dentin, pulp, restorations,
outlines — the way it can already recolour the surrounding UI, so the chart can
match a light or a dark product theme without anyone forking the assets.

Non-goal: changing any tooth *shape*. Geometry stays byte-identical.

## The problem, measured

`applyThemeConfig()` in `src/theme.ts` maps `OdontogramThemeConfig.colors` onto
eight CSS custom properties (`--odon-bg`, `--odon-panel`, `--odon-card`,
`--odon-text`, `--odon-muted`, `--odon-line`, `--odon-accent`,
`--odon-accent2`). Those reach the **UI chrome only**. The tooth artwork is
untouched by them, because every colour in it is an inline `style` attribute
baked into the SVG asset. From `odontogram.ts`:

> each crown path carries its base color ONLY as an inline `style` attribute
> baked into the SVG asset […]; no CSS rule supplies it.

Inventory of what actually renders (40 `measured` assets):

| | count |
| --- | --- |
| `fill:` / `stroke:` declarations | 11,190 |
| distinct (property, colour) pairs | 130 |
| hand-drawn `classic` assets | 6 files |
| distinct hex values in the 6 generator donors | 158 |

The long tail is real: the twelve most common pairs cover only ~55% of
declarations. So the unit of theming cannot be "a hex value" — it has to be
"a semantic layer".

Two facts make that tractable:

1. **The layer ids are already semantic and uniform.** Every side template
   carries the same id set for its class (208 incisor/canine, 219 premolar,
   203 molar; 148/144 occlusal), and the deciduous templates carry *exactly*
   the permanent id set. A token assigned to `tooth-base` is a token assigned
   to all 46 assets at once.
2. **The `measured` colours live in six files, not forty.** They originate in
   `tools/toothgen/source/*.svg` and pass through the generator unchanged
   (`occlusal.py` adds two literals of its own: `#f4f1e8`, `#8f8f8f`).

## Approach: `var()` with a fallback, emitted by the generator

Every themable colour becomes:

```xml
style="fill: var(--odon-tooth-enamel, #ebebeb)"
```

CSS custom properties resolve inside inline `style` attributes, so this needs no
new stylesheet plumbing and no runtime work. The fallback is the colour that is
there today, which makes the change **backward compatible by construction**: a
host that sets nothing gets a pixel-identical chart.

Two alternatives were rejected:

- *Strip the inline styles and colour via CSS classes.* Cleaner in principle,
  but it changes every asset's DOM and breaks any consumer that targets the
  current markup — for no gain over `var()`.
- *Overwrite `style.fill` from JS at render time.* This is what `discoloration`
  does for two layers; doing it for 11,190 declarations would put a measurable
  cost on every repaint.

## Stages

Each stage is independently verifiable and lands on its own.

### Stage 1 — the token map

Add `tools/toothgen/palette.py`:

- `TOKENS: dict[str, str]` — token name → today's default colour.
- `LAYER_TOKENS: dict[str, str]` — layer id (or id prefix) → token name.

Derive the mapping from **layer ids, not hex values** — the same grey means
"metal restoration" in one layer and "outline" in another, and they should be
separately themable. Expect roughly 15–25 tokens: enamel, dentin, pulp
(healthy / inflamed), milk-tooth crown, outline, gum, bone, caries by depth,
amalgam, composite, ceramic, gold, endo filling, post, implant fixture,
bridge connector, wear.

Colours that are genuinely incidental (one-off decorative accents in the tail)
stay literal. The goal is every clinically meaningful surface, not 100% of 130
pairs.

**Verify:** a report listing each token, its default, the layer ids bound to it,
and the declarations left untokenized — reviewed by eye before Stage 2.

### Stage 2 — the generator emits `var()`

Thread `palette.py` through `build.py`, `occlusal.py` and `overlays.py`, then
regenerate all 40 `measured` assets.

**Verify:**
- `python3 tools/toothgen/verify.py` and `check_roundtrip.py` pass — geometry
  untouched (this is exactly what they are for).
- `python3 -m pytest tools/toothgen` passes.
- The rendered output with no variables set is identical to the previous
  assets. Compare by stripping `var(--token, ` / `)` back to the bare colour and
  diffing against the previous files — that diff must be empty.
- `src/__tests__/parity/svg-fingerprints.json` is unchanged. It already will be:
  `collectActiveLayers` reads id, opacity and class only, so fill was never
  fingerprinted.

### Stage 3 — the classic set

The six `classic` assets are hand-drawn, not generated. Apply the same token map
with a one-off script and commit the result as an ordinary asset change.

**Verify:** same strip-and-diff equality check; parity goldens unchanged.

### Stage 4 — the public API

Extend `OdontogramThemeConfig` with a `tooth` group beside `colors`, and extend
`COLOR_MAP` with the new variable names. Every field optional; omitting the
group changes nothing.

```ts
export type OdontogramThemeConfig = {
  colors?: { /* unchanged */ };
  /** Tooth-artwork colours. Omitted keys keep the drawing's own colour. */
  tooth?: { enamel?: string; dentin?: string; pulp?: string; outline?: string; /* … */ };
};
```

**Verify:** a test that sets one token and asserts the resolved
`getComputedStyle(...).fill` on the corresponding layer changes, and that an
unset token keeps its default.

### Stage 5 — a default dark palette

Ship dark defaults under the existing dark-mode selector in `src/index.css`, so
dark mode improves for everyone rather than only for hosts that configure it.
This is the only stage that changes default rendering, and only in dark mode —
it gets its own commit and its own before/after screenshots.

### Stage 6 — export flattening

`exportSvg`/`perioExport` build a standalone SVG and hand it to
`XMLSerializer().serializeToString()`. A serialized SVG, rasterized as an image
or written to a file, is rendered in an isolated document where the host page's
custom properties **do not apply** — so a themed chart would silently export in
default colours.

Before serializing, walk the clone and replace every `var(--odon-*)` in a style
attribute with its resolved computed value. The same function already does this
for text (`cs.color`, `cs.fontFamily` from `getComputedStyle`), so it is a
consistent extension rather than a new mechanism.

**Verify:** export a themed chart and assert the serialized XML contains the
themed hex and no `var(` token; export an unthemed chart and assert the XML is
unchanged from today.

### Stage 7 — the `discoloration` interaction

`applyStateToSvgSingle` is the sole runtime writer of `.style.fill`, on
`tooth-base` / `milktooth-base`. It captures the asset's own fill once into
`data-base-fill` and restores it on every non-tinted render. After Stage 2 that
captured value is the literal `var(--odon-tooth-enamel, #ebebeb)` string, which
restores correctly — but the behaviour must be pinned.

**Verify:** a test that tints a tooth, clears the tint, and asserts the crown
returns to the themed colour (not to the fallback, and not to black — the
failure mode the existing comment warns about).

## Risks

- **Token granularity is a judgement call.** Too few and hosts cannot express
  their theme; too many and the API is unusable. Stage 1's review gate exists
  for this.
- **Scope.** This touches the generator, 46 assets, `theme.ts`, `index.css` and
  the export path. Hence seven separately landable stages rather than one pass.
- **Dark defaults are a visible change.** Isolated to Stage 5 so it can be
  reverted on its own.
- **A host could set an unreadable palette.** Out of scope: the same is already
  true of `--odon-text`.

## What this does not need

No change to the FHIR payload, the state model, the parity harness, or any
public API other than the additive `tooth` group on the theme config.
