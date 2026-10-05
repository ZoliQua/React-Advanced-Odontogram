# Tooth anatomy generator

This toolchain builds the optional `measured` odontogram profile from a small
set of canonical SVG donors plus an explicit dental-anatomy specification. It
does not alter the historical `classic` profile.

## Ownership and data flow

```text
spec.py permanent/primary classes and FDI assignments
        ↓
source/*.svg canonical donor geometry (manual-edit boundary)
        ↓
build.py + roots.py + graft.py + gum.py + fillings.py + overlays.py
occlusal.py class-specific outline/cusp/groove generation
        ↓
src/assets/teeth-svgs/measured/*.svg (generated; never hand-edit)
        ↓
src/odontogram.ts AnatomyProfile mapping/orientation/primary swap
src/perioGraphic.ts CEJ, root restoration and furcation rendering
        ↓
verify.py + check_roundtrip.py + Python/Vitest/render tests
```

The six SVGs directly in `src/assets/teeth-svgs/` are manually maintained
classic runtime assets. The six SVGs in `tools/toothgen/source/` are canonical
measured donors. Files in `src/assets/teeth-svgs/measured/` are reproducible
generator output; edit the spec, donor, or transform instead of those files.

All anatomy-dependent paths pass through the same coordinate maps. This keeps
caries, fillings, crowns, pulp/endo, root fillings/posts, implants, fractures,
gum, bone and periodontal artwork aligned. Clinical IDs are an API contract and
remain unchanged. Paint-server IDs are namespaced per generated class.

Each generated root SVG also carries registration metadata on its root element:
the measured CEJ, cervical/crown span, furcation (when present), implant fixture
span/platform, and bridge-tab Y/height. Runtime periodontal and bridge graphics
consume these values after the same viewBox/orientation transform as the tooth;
they do not maintain a second set of measured-tooth coordinates.

`overlays.py` keeps geometry and presentation separate. Full-coverage material
variants reuse the class-specific crown envelope while retaining their existing
material IDs/styles. Bridge units receive paired proximal tabs derived from that
same envelope; the cross-tile renderer only fills the measured gap between the
facing tabs. Status/plan presentation is applied by the renderer and does not
change any clinical path.

## Permanent side-view mapping

| Class | FDI teeth | Anatomy | Roots |
|---|---|---|---:|
| `11` | 11, 21 | maxillary central incisor | 1 |
| `12` | 12, 22 | maxillary lateral incisor | 1 |
| `13` | 13, 23 | maxillary canine | 1 |
| `14` | 14, 24 | maxillary first premolar, close buccal/palatal projection | 2 |
| `15` | 15, 25 | maxillary second premolar | 1 |
| `16` | 16, 26 | maxillary first molar | 3 |
| `17` | 17, 27 | maxillary second molar | 3 |
| `18` | 18, 28 | compact representative maxillary third molar | 3 |
| `31` | 31, 41 | mandibular central incisor | 1 |
| `32` | 32, 42 | mandibular lateral incisor | 1 |
| `33` | 33, 43 | mandibular canine | 1 |
| `34` | 34, 44 | mandibular first premolar | 1 |
| `35` | 35, 45 | mandibular second premolar | 1 |
| `36` | 36, 46 | mandibular first molar | 2 |
| `37` | 37, 47 | mandibular second molar | 2 |
| `38` | 38, 48 | compact representative mandibular third molar | 2 |

Contralateral teeth mirror the same class. Maxillary and mandibular classes are
never obtained by rotating one displayed molar into the other; they have their
own output specs, root topology, dimensions and occlusal mapping.

The `14` projection deliberately shows two close roots rather than two wide
lateral branches. `15`, `34`, and `35` use a continuous single-root graft, not a
collapsed two-root seam. First molars are broader/more divergent; second molars
are more regular and convergent; third molars are intentionally simplified
representatives because real third-molar morphology is highly variable.

## Primary mapping

Primary classes are `51`, `52`, `53`, `54`, `55`, `71`, `72`, `73`, `74`, and
`75`, mirrored to the opposite quadrant. They occupy permanent chart positions
11–15 and 31–35, but the renderer swaps in the primary SVG and displays the
primary FDI number while retaining the saved state key. Upper primary molars
have three roots; lower primary molars have two. Primary output adds greater
root spread, a larger pulp, shorter/bulbous crowns and stronger cervical
constriction rather than merely scaling a permanent rendering.

## Occlusal mapping

Every posterior class has explicit output: `14`, `15`, `34`, `35`, `16`, `17`,
`18`, `36`, `37`, `38`, plus primary `54`, `55`, `74`, and `75`. The canonical
outline and selectable clinical regions receive one common transform. A sparse
generated baseline distinguishes two-cusp premolars, the three-cusp lower
second-premolar representative, four-cusp maxillary/mandibular molars, and the
five-cusp mandibular first-molar pattern. Grooves remain deliberately restrained
at odontogram scale.

## Evidence and display choices

`spec.py` records source notes, anatomical root fractions, relative lengths,
mesiodistal dimensions, root counts and class transforms. Measurements use the
repository's documented *Odontographie* plate grid and Wheeler/Ash & Nelson
means. Supporting university and peer-reviewed references and the full rationale
are in `docs/superpowers/specs/2026-08-27-canonical-tooth-anatomy-overhaul-design.md`.

`ROOT_DISPLAY_SCALE` shortens roots for icon-scale display and
`LENGTH_SPREAD` reduces distracting apex-line variation. These are explicit
display transforms, not changes to source measurements. The periodontal
renderer restores the root scale around the generated CEJ. No external
illustration is copied; the generator uses anatomical facts and independently
generated geometry over repository-owned donors.

## Build and verification

With `uv` installed, use:

```bash
uv run tools/toothgen/build.py
uv run tools/toothgen/verify.py
uv run tools/toothgen/check_roundtrip.py
```

The scripts have no third-party Python dependency and can equivalently be run
with `python` when `uv` is unavailable. A no-argument build produces both
dentitions and all occlusal classes. `verify.py` checks XML, root/furcation
topology, proportions, continuous contours, lumen bounds, clinical ID/tag
parity, cusp/groove topology, duplicate IDs, paint-server resolution, filling
continuity, CEJ/grid registration, clinical layer order, material-independent
crown/connector geometry, connector bounds, occlusal alignment and frozen
geometry digests. `test_overlay_geometry.py` adds tolerant containment and
registration invariants for pulp/RCT/posts, root caries, crown and surface
overlays, bridge tabs, viewBoxes and endodontic topology. `check_roundtrip.py`
covers canonical, classic and generated SVGs.

```bash
python -m unittest tools.toothgen.test_overlay_geometry -v
```

Run the generator twice and compare the generated tree to confirm byte-for-byte
determinism. Geometry digests may be changed only after intentional visual
review, with a dated explanation in `verify.py`.
