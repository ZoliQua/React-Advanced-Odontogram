# A dentin layer for the measured artwork — design and plan

**Status:** proposed 2026-10-18. Raised by
[issue #28](https://github.com/ZoliQua/React-Advanced-Odontogram/issues/28) —
the one item of Jose's seven that the themable-artwork work could not deliver,
because there was nothing to theme: a tooth in these drawings is one silhouette
plus a sheen and a pulp chamber, with no enamel/dentin boundary anywhere in the
markup.

Related: [`2026-10-14-themable-tooth-artwork.md`](./2026-10-14-themable-tooth-artwork.md),
whose token mechanism this builds on.

## Goal

Give the measured templates an inner dentin region, so that

1. a host can colour enamel and dentin separately (`tooth.dentin`), and
2. caries depth — already charted as E1/E2 vs D1–D3 and already driving the
   ICD-10 code — can finally be *seen* on the drawing rather than only coded.

Non-goal: changing the classic profile, or changing what an unthemed chart
looks like in stage 1–3. The clinical rendering of stage 4 is a separate,
separately revertable commit.

## What the investigation established

Four findings decided the shape of this work. Each is a measurement, not an
assumption.

**1. The geometry can be derived; nothing needs to be hand-drawn.**
`build.py` does not draw teeth — it *warps* six donor drawings
(`make_warp`, `crown_shape_xmap`, `rewrite_svg`). And the silhouette's interior
is already computable: `build._crossings(d, y)` returns where a horizontal at
height `y` crosses the contour. An inset region follows from those crossings.

**2. Multi-rooted teeth need no special case.** Measured on the donors:

| template | top of the drawing | mid | bottom |
| --- | --- | --- | --- |
| 11 (incisor) | 1 span, 5.6 wide | 1 span, 14.2 | 1 span, 20.8 |
| 13 (canine) | 1 span, 5.7 | 1 span, 18.2 | 1 span, 6.7 (cusp taper) |
| 14 (premolar) | **2 spans** (two roots) | 1 span, 16.6 | **2 spans** (two cusps) |
| 16 (molar) | **2 spans** | 1 span, 20.7 | **2 spans** |

Insetting each span independently reproduces the furcation and the cusp split
for free.

**3. The inset must run AFTER the warp.** `spec.py` fixes the output scale at
**4.048 units per mm** (line 133); the donors are in their own, different
scale. Enamel thickness is a clinical quantity in millimetres, so it can only
be applied in the output coordinate system. This settles where the code lives:
at the end of `build_one`, on the warped paths — not in the donors.

**4. The parity goldens survive, if this stays in the measured profile.**
`__renderActiveLayers` fingerprints the ordered list of active layer **ids**, so
any new rendered layer would invalidate all 787 fixtures — and
`src/__tests__/parity/capture.ts` states in its header that re-capturing is
forbidden, because it would make the oracle circular. But the fixtures cover
only the six **classic** templates (`11`, `13`, `14`, `16`, `14_occl`,
`16_occl`); `src/assets/teeth-svgs/measured/` is not fingerprinted.

A measured-only dentin layer therefore leaves every golden byte-identical. This
is also the right boundary on its own merits: the measured profile is the
anatomically measured drawing, the classic set is deliberately schematic.

## Construction

For each silhouette path, in the output coordinate system:

1. Sample the contour at N heights between the incisal/occlusal extreme and the
   apex. `_crossings` gives the spans at each height.
2. Inset each span horizontally by `t(y)`, the enamel half-thickness:

   | position | thickness | source |
   | --- | --- | --- |
   | cusp tip / incisal edge | 2.0 mm (8.1 u) | enamel is thickest at the occlusal/incisal surface |
   | mid-crown | 1.0 mm (4.0 u) | linear taper between the two |
   | at the CEJ | 0.1 mm (0.4 u) | enamel ends in a knife edge |
   | below the CEJ | 0.15 mm (0.6 u) | cementum, drawn as a hairline so the dentin never touches the outline |

   `t` is anchored to the template's own CEJ, which the generator already
   computes and publishes as `data-cej-y` — not to the bounding box.
3. Drop any span narrower than `2·t(y)`: where the enamel meets, there is no
   dentin. This is what closes the shape at the cusp tips and the apices.
4. Emit the result as **one path with several overlapping subpaths**, all wound
   the same way, relying on `fill-rule: nonzero` to union them. A three-rooted
   tooth's dentin is a connected trident, and tracing that as a single contour
   is fiddly; overlapping lobes render identically and cannot self-intersect.

### Paint

```xml
style="fill: var(--odon-tooth-dentin, var(--odon-tooth-body, #ebebeb))"
```

Nested deliberately. Set nothing and the dentin is the body colour, so the
region is invisible and the chart is unchanged. Set only `tooth.body` and the
dentin follows it — otherwise setting one documented field would expose an
undocumented boundary, which is the one failure mode worse than having no
dentin at all. Set `tooth.dentin` and it wins.

**This requires a parser change.** `TOKEN_REF` in `src/theme.ts` is
`/var\(\s*(--odon-[\w-]+)\s*,\s*([^)]*)\)/g` — `[^)]*` stops at the first
closing paren, so a nested fallback would flatten to unbalanced garbage on
export. `flattenThemeTokens` needs balanced-paren scanning and a test with a
nested token.

### Where it sits in the document

Directly after the silhouette path it belongs to and before
`tooth-base-beauty`, so the sheen still reads over both regions. Ids:
`tooth-dentin`, `tooth-crownprep-dentin`, `tooth-radix-dentin`.

## Coverage

Three silhouettes in stage 1: `tooth-base`, `tooth-crownprep`, `tooth-radix`.
These are the regular shapes, and the latter two are where exposed dentin is
clinically true rather than decorative.

The seven `tooth-broken-*` variants are deliberately out of stage 1. The same
function would run on them unchanged, but a broken contour is irregular and a
horizontal inset can produce a shape that is merely odd. They are a follow-up,
gated on looking at the result.

## Stages

Each lands on its own.

### Stage 1 — geometry

`tools/toothgen/dentin.py`, called from `build_one`. Regenerate the 40 measured
templates.

**Verify:** `verify.py` (plus a new rule: the dentin contour must stay strictly
inside its silhouette, and its subpath count must not exceed the template's
root count + 1) · `check_roundtrip.py` · `pytest tools/toothgen` with cases for
the single-root, two-root, three-root and cusp-split geometries · **visual
gate**: render all 40 side templates and look at them before going further.
No number proves a drawing looks right.

### Stage 2 — token and API

`--odon-tooth-dentin` in `palette.py`; `tooth.dentin` in
`OdontogramThemeConfig` + `TOOTH_COLOR_MAP`; balanced-paren `TOKEN_REF`.

**Verify:** a test that sets `tooth.body` alone and asserts the dentin follows;
one that sets both and asserts dentin wins; one that exports a themed chart and
asserts no `var(` survives and no paren is stranded.

### Stage 3 — dark palette

One value in the `.dark` block, derived the way the others were: from the
measured light-mode relationship, with the ratio recorded in the comment.

### Stage 4 — the clinical payoff (separate commit)

Caries depth rendered against the boundary: an E1/E2 lesion stays within the
enamel shell, a D1–D3 lesion crosses into the dentin. The depth is already in
the state model and already refines the ICD-10 code (`K02.0` vs `K02.1`), so
this adds no new data — only the drawing that was missing.

This changes default rendering for measured-profile hosts, which is why it is
last and alone in its commit.

### Stage 5 — documentation

CHANGELOG, the 12 READMEs, and a note that `tooth.body` now means the outer
shell — enamel over the crown, cementum over the root — wherever a dentin
region exists. The field is NOT renamed again.

## Risks

- **The drawing may simply look wrong** on some templates. A horizontal inset
  is an approximation of a normal offset; it is good for near-vertical
  contours and worst at the broadest curves. Mitigated by the stage-1 visual
  gate, and the stage is revertable on its own.
- **`verify.py` requires `tooth-base` to be a single continuous subpath**
  (line ~685). The dentin path deliberately is not, so the new rule must be
  written for the dentin layer rather than reusing that one.
- **The nested fallback touches the export path**, which is the one place a
  theming bug is invisible until a user opens an exported file.
- **Silent semantic shift of `tooth.body`.** Documented in stage 5, not
  renamed.
- **Scope.** Generator, 40 assets, `theme.ts`, `index.css`, docs. Five stages
  for that reason.

## What this does not touch

The classic profile, the parity goldens, the FHIR payload, the state model, and
every public API other than the additive `tooth.dentin` field.
