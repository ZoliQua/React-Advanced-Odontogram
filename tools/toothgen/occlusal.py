"""Generate restrained class-specific occlusal anatomy.

The two authored drawings remain the canonical source of the outline and every
selectable clinical surface.  A common coordinate transform changes the crown
proportion and therefore keeps caries, fillings, defects and prosthetic layers
registered.  Cusp and groove artwork is baseline anatomy rather than a clinical
surface, so it is replaced with a small independently-authored pattern selected
by class.  That lets a two-cusp premolar, a five-cusp mandibular first molar and
a four-cusp mandibular second molar remain distinguishable without adding
decorative detail or changing the clinical ID contract.
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import roots
import fillings  # noqa: E402
import overlays  # noqa: E402
from build import ASSETS, SOURCE, rewrite_svg, namespace_paint_servers  # noqa: E402


@dataclass(frozen=True)
class OcclSpec:
    key: str
    label: str
    src: str
    ratio: float
    source: str
    teeth: tuple[int, ...]
    cusp_count: int
    groove_pattern: str
    primary: bool = False


# Buccolingual to mesiodistal, measured off the plates in
# zahnrad-odontogram/docs/images by isolating each specimen from its black
# ground. Where a plate shows two crown-type variants, the class value is their
# mean; where two teeth of a class were measured, the mean of the two.
OCCL_SPECS: list[OcclSpec] = [
    OcclSpec(
        key="14_occl",
        label="Upper premolar, occlusal",
        src="14_occl",
        ratio=1.25,
        source="Bild 53 (p. 71) 1.24 / Bild 55 (p. 73) 1.26",
        teeth=(14, 24),
        cusp_count=2,
        groove_pattern="central",
    ),
    OcclSpec(
        key="15_occl",
        label="Upper second premolar, occlusal",
        src="14_occl",
        ratio=1.35,
        source="Wheeler/Ash & Nelson BL/MD means; rounder than first premolar",
        teeth=(15, 25),
        cusp_count=2,
        groove_pattern="short-central",
    ),
    OcclSpec(
        key="34_occl",
        label="Lower first premolar, occlusal",
        src="14_occl",
        ratio=1.05,
        source="Bild 59 (p. 77) + standard BL/MD dimensions",
        teeth=(34, 44),
        cusp_count=2,
        groove_pattern="transverse",
    ),
    OcclSpec(
        key="35_occl",
        label="Lower second premolar, occlusal",
        src="14_occl",
        ratio=1.08,
        source="Bild 61 (p. 78) + standard BL/MD dimensions",
        teeth=(35, 45),
        cusp_count=3,
        groove_pattern="y3",
    ),
    OcclSpec(
        key="16_occl",
        label="Upper molar, occlusal",
        src="16_occl",
        ratio=1.11,
        source="Bild 65 (p. 85) + standard BL/MD dimensions",
        teeth=(16, 26),
        cusp_count=4,
        groove_pattern="oblique",
    ),
    OcclSpec(
        key="17_occl", label="Upper second molar, occlusal", src="16_occl",
        ratio=1.14, source="Bild 69 (p. 87) + standard BL/MD dimensions",
        teeth=(17, 27), cusp_count=4, groove_pattern="compact-oblique",
    ),
    OcclSpec(
        key="18_occl", label="Upper third molar, occlusal", src="16_occl",
        ratio=1.24, source="compact representative; third molars are highly variable",
        teeth=(18, 28), cusp_count=3, groove_pattern="irregular",
    ),
    OcclSpec(
        key="36_occl",
        label="Lower first molar, occlusal",
        src="16_occl",
        ratio=0.94,
        source="Bild 75 (p. 95) + standard BL/MD dimensions",
        teeth=(36, 46),
        cusp_count=5,
        groove_pattern="y5",
    ),
    OcclSpec(
        key="37_occl", label="Lower second molar, occlusal", src="16_occl",
        ratio=0.93, source="Bild 77 (p. 97) + standard BL/MD dimensions",
        teeth=(37, 47), cusp_count=4, groove_pattern="cross",
    ),
    OcclSpec(
        key="38_occl", label="Lower third molar, occlusal", src="16_occl",
        ratio=0.95, source="compact representative; third molars are highly variable",
        teeth=(38, 48), cusp_count=4, groove_pattern="irregular-cross",
    ),
    OcclSpec(
        key="54_occl", label="Upper first primary molar, occlusal", src="14_occl",
        ratio=1.26, source="Bild 91 (p. 113) + primary crown proportions",
        teeth=(54, 64), cusp_count=4, groove_pattern="transverse", primary=True,
    ),
    OcclSpec(
        key="55_occl", label="Upper second primary molar, occlusal", src="14_occl",
        ratio=1.28, source="Bild 92 (p. 114) + primary crown proportions",
        teeth=(55, 65), cusp_count=4, groove_pattern="oblique", primary=True,
    ),
    OcclSpec(
        key="74_occl", label="Lower first primary molar, occlusal", src="14_occl",
        ratio=0.85, source="Bild 93 (p. 117) + primary crown proportions",
        teeth=(74, 84), cusp_count=4, groove_pattern="cross", primary=True,
    ),
    OcclSpec(
        key="75_occl", label="Lower second primary molar, occlusal", src="14_occl",
        ratio=0.91, source="Bild 94 / p. 117 description + primary crown proportions",
        teeth=(75, 85), cusp_count=5, groove_pattern="y5", primary=True,
    ),
]


def outline_extent(txt: str):
    """The `tooth-base` outline's mesiodistal and buccolingual extent."""

    i = txt.find('id="tooth-base"')
    if i < 0:
        raise SystemExit("tooth-base not found")
    m = re.search(r'\sd="([^"]+)"', txt[i : i + 6000])
    pts = [p for sub in roots._polylines(m.group(1)) for p in sub]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return max(xs) - min(xs), max(ys) - min(ys), (min(xs) + max(xs)) / 2


def _cusp_path(x0: float, y0: float, x1: float, y1: float) -> str:
    """A low-detail rounded cusp lobe, readable in a 40-unit crown."""

    mx = (x0 + x1) / 2
    my = (y0 + y1) / 2
    return (
        f"M{x0:.2f},{my:.2f} "
        f"C{x0:.2f},{y0:.2f} {mx:.2f},{y0:.2f} {mx:.2f},{y0:.2f} "
        f"C{x1:.2f},{y0:.2f} {x1:.2f},{my:.2f} {x1:.2f},{my:.2f} "
        f"C{x1:.2f},{y1:.2f} {mx:.2f},{y1:.2f} {mx:.2f},{y1:.2f} "
        f"C{x0:.2f},{y1:.2f} {x0:.2f},{my:.2f} {x0:.2f},{my:.2f}Z"
    )


def _cusp_cells(count: int, x0: float, y0: float, x1: float, y1: float):
    """Return class topology as simple buccal/lingual cusp territories."""

    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    gap_x = (x1 - x0) * 0.018
    gap_y = (y1 - y0) * 0.018
    if count == 2:
        return [(x0, y0, x1, cy - gap_y), (x0, cy + gap_y, x1, y1)]
    if count == 3:
        return [
            (x0, y0, x1, cy - gap_y),
            (x0, cy + gap_y, cx - gap_x, y1),
            (cx + gap_x, cy + gap_y, x1, y1),
        ]
    if count == 4:
        return [
            (x0, y0, cx - gap_x, cy - gap_y),
            (cx + gap_x, y0, x1, cy - gap_y),
            (x0, cy + gap_y, cx - gap_x, y1),
            (cx + gap_x, cy + gap_y, x1, y1),
        ]
    if count == 5:
        one_third = x0 + (x1 - x0) / 3
        two_thirds = x0 + 2 * (x1 - x0) / 3
        return [
            (x0, y0, one_third - gap_x, cy - gap_y),
            (one_third + gap_x, y0, two_thirds - gap_x, cy - gap_y),
            (two_thirds + gap_x, y0, x1, cy - gap_y),
            (x0, cy + gap_y, cx - gap_x, y1),
            (cx + gap_x, cy + gap_y, x1, y1),
        ]
    raise ValueError(f"unsupported cusp count: {count}")


def _groove_paths(pattern: str, x0: float, y0: float, x1: float, y1: float):
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    sx, sy = x1 - x0, y1 - y0
    p = lambda x, y: f"{x:.2f},{y:.2f}"
    if pattern == "central":
        return [f"M{p(x0+.14*sx,cy)} C{p(cx-.12*sx,cy-.03*sy)} {p(cx+.12*sx,cy+.03*sy)} {p(x1-.14*sx,cy)}"]
    if pattern == "short-central":
        return [f"M{p(x0+.25*sx,cy)} C{p(cx-.08*sx,cy-.02*sy)} {p(cx+.08*sx,cy+.02*sy)} {p(x1-.25*sx,cy)}"]
    if pattern == "transverse":
        return [f"M{p(x0+.15*sx,cy)} L{p(x1-.15*sx,cy)}", f"M{p(cx,cy)} L{p(cx-.12*sx,y0+.24*sy)}"]
    if pattern == "y3":
        return [f"M{p(cx,y0+.18*sy)} L{p(cx,cy)} L{p(x0+.25*sx,y1-.18*sy)}", f"M{p(cx,cy)} L{p(x1-.25*sx,y1-.18*sy)}"]
    if pattern in ("oblique", "compact-oblique"):
        inset = .20 if pattern == "oblique" else .25
        return [f"M{p(x0+inset*sx,y0+.22*sy)} C{p(cx-.12*sx,cy-.12*sy)} {p(cx+.12*sx,cy+.12*sy)} {p(x1-inset*sx,y1-.22*sy)}", f"M{p(x0+.18*sx,cy)} L{p(cx,cy)} L{p(x1-.18*sx,cy)}"]
    if pattern == "irregular":
        return [f"M{p(cx,y0+.18*sy)} L{p(cx-.06*sx,cy)} L{p(x0+.25*sx,y1-.20*sy)}", f"M{p(cx-.06*sx,cy)} L{p(x1-.28*sx,y1-.16*sy)}"]
    if pattern == "y5":
        return [f"M{p(x0+.12*sx,cy)} L{p(cx,cy)} L{p(x1-.12*sx,cy)}", f"M{p(cx,cy)} L{p(cx,y1-.14*sy)}", f"M{p(x0+.33*sx,y0+.16*sy)} L{p(cx,cy)} L{p(x0+.67*sx,y0+.16*sy)}"]
    if pattern == "cross":
        return [f"M{p(x0+.14*sx,cy)} L{p(x1-.14*sx,cy)}", f"M{p(cx,y0+.14*sy)} L{p(cx,y1-.14*sy)}"]
    if pattern == "irregular-cross":
        return [f"M{p(x0+.16*sx,cy-.04*sy)} L{p(cx,cy)} L{p(x1-.14*sx,cy+.05*sy)}", f"M{p(cx+.03*sx,y0+.16*sy)} L{p(cx,cy)} L{p(cx-.07*sx,y1-.16*sy)}"]
    raise ValueError(f"unsupported groove pattern: {pattern}")


def apply_baseline_anatomy(txt: str, spec: OcclSpec) -> str:
    """Replace non-interactive cusp/fissure art without touching surface IDs."""

    i = txt.find('id="tooth-base"')
    match = re.search(r'\sd="([^"]+)"', txt[i : i + 6000])
    pts = [point for sub in roots._polylines(match.group(1)) for point in sub]
    lo_x, hi_x = min(p[0] for p in pts), max(p[0] for p in pts)
    lo_y, hi_y = min(p[1] for p in pts), max(p[1] for p in pts)
    pad_x, pad_y = (hi_x - lo_x) * .11, (hi_y - lo_y) * .10
    x0, x1 = lo_x + pad_x, hi_x - pad_x
    y0, y1 = lo_y + pad_y, hi_y - pad_y

    cusp_paths = "\n".join(
        f'        <path d="{_cusp_path(*cell)}" data-active="1" '
        f'style="fill: #f4f1e8;" />'
        for cell in _cusp_cells(spec.cusp_count, x0, y0, x1, y1)
    )
    cusp_body = (
        f'<g id="cusps" data-active="1" data-toothgen-anatomy="cusps" '
        f'data-cusp-count="{spec.cusp_count}">\n{cusp_paths}\n      </g>'
    )
    txt, n = re.subn(r'<g id="cusps"[^>]*>.*?</g>', cusp_body, txt, count=1, flags=re.S)
    if n != 1:
        raise ValueError(f"{spec.key}: canonical cusp group not found")

    groove_paths = "\n".join(
        f'        <path d="{path}" data-active="1" '
        f'style="fill: none; stroke: #8f8f8f; stroke-linecap: round; '
        f'stroke-linejoin: round; stroke-width: .65px;" />'
        for path in _groove_paths(spec.groove_pattern, x0, y0, x1, y1)
    )
    groove_body = (
        f'<g id="fissure" data-active="1" data-toothgen-anatomy="grooves" '
        f'data-groove-pattern="{spec.groove_pattern}">\n{groove_paths}\n      </g>'
    )
    txt, n = re.subn(r'<g id="fissure"[^>]*>.*?</g>', groove_body, txt, count=1, flags=re.S)
    if n != 1:
        raise ValueError(f"{spec.key}: canonical fissure group not found")

    if spec.primary:
        primary_cusps = (
            f'<g data-toothgen-anatomy="primary-cusps" data-cusp-count="{spec.cusp_count}">\n'
            f'{cusp_paths}\n      </g>'
        )
        txt, n = re.subn(
            r'(<path id="background-cusp1"[^>]*/>)',
            lambda m: m.group(1) + "\n      " + primary_cusps,
            txt,
            count=1,
        )
        if n != 1:
            raise ValueError(f"{spec.key}: canonical primary cusp outline not found")
        primary_grooves = (
            f'<g id="fissure1" data-active="1" data-toothgen-anatomy="primary-grooves" '
            f'data-groove-pattern="{spec.groove_pattern}">\n{groove_paths}\n      </g>'
        )
        txt, n = re.subn(r'<g id="fissure1"[^>]*>.*?</g>', primary_grooves, txt, count=1, flags=re.S)
        if n != 1:
            raise ValueError(f"{spec.key}: canonical primary fissure group not found")
    return txt


def connect_fillings(txt: str) -> str:
    """Join each proximal filling to the occlusal one. See fillings.py.

    Seen from above the box grows toward the middle of the tooth, so the axis is
    x - mesial toward -x, distal toward +x - where on the side view it is y.
    That is the only difference; the stretch itself is the same code.
    """
    band = re.search(r'<path id="filling-composite-occlusal" d="([^"]+)"', txt)
    # tooth-base is not written as `<path id=... d=...>` in these sources, so it
    # is located the same way outline_extent already does it rather than by a
    # regex that happens to fit the filling layers.
    i = txt.find('id="tooth-base"')
    base = re.search(r'\sd="([^"]+)"', txt[i : i + 6000]) if i >= 0 else None
    if not band or not base:
        return txt
    pts = [p for sub in roots._polylines(base.group(1)) for p in sub]
    x_lo, x_hi = min(p[0] for p in pts), max(p[0] for p in pts)
    # `edge` is the edge the box grows TOWARD, so it is the far side of the
    # tooth in the direction of the stretch, not the side the shape starts on.
    for surf, sign, edge in (("mesial", -1.0, x_lo), ("distal", 1.0, x_hi)):
        m = re.search(rf'<path id="filling-composite-{surf}" d="([^"]+)"', txt)
        if not m:
            continue
        # No contour-following here, deliberately. On the side view the crown
        # narrows gently toward the cusp tips and a box that grows occlusally
        # should narrow with it. Seen from ABOVE the outline is a rounded lobe:
        # a proximal box moved toward the centre would be scaled up by how much
        # taller the tooth is there, and it ballooned sixteen units outside the
        # contour when it was. A box keeps its buccolingual extent.
        new = fillings.stretch_to_band(
            m.group(1), band.group(1), edge, None, axis="x", sign=sign
        )
        if new is None or new == m.group(1):
            continue
        for mat in fillings.MATERIALS:
            txt = re.sub(
                rf'(<path id="filling-{mat}-{surf}" d=")[^"]+(")',
                lambda mm: mm.group(1) + new + mm.group(2),
                txt,
                count=1,
            )
    return txt


def build_one(spec: OcclSpec, out_dir: Path, dry: bool) -> None:
    txt = (SOURCE / f"{spec.src}.svg").read_text()
    txt = apply_baseline_anatomy(txt, spec)
    w, h, cx = outline_extent(txt)
    have = h / w
    k = have / spec.ratio  # scaling x by k turns ratio h/w into h/(w*k)

    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', txt).group(1).split()]
    vb_new = (vb[0], vb[1], vb[2], vb[3])

    def fn(x, y):
        return (cx + (x - cx) * k, y)

    out = rewrite_svg(txt, fn, lambda y: y, vb_new)
    out = connect_fillings(out)
    out = namespace_paint_servers(out, spec.key)
    out = overlays.normalize_crown_envelopes(out)

    got_w, got_h, _ = outline_extent(out)
    base_i = out.find('id="tooth-base"')
    base_match = re.search(r'\sd="([^"]+)"', out[base_i : base_i + 6000])
    if base_i < 0 or not base_match:
        raise SystemExit(f"{spec.key}: tooth-base not found after transform")
    outline_d = base_match.group(1)
    points = [point for sub in roots._polylines(outline_d) for point in sub]
    crown_left = min(point[0] for point in points)
    crown_right = max(point[0] for point in points)
    crown_top = min(point[1] for point in points)
    crown_bottom = max(point[1] for point in points)
    bridge_y = (crown_top + crown_bottom) / 2.0
    bridge_h = min(2.8, max(1.6, got_h * 0.10))
    out, bridge = overlays.register_bridge_tabs(
        out,
        outline_d,
        bridge_y,
        bridge_h,
        roots.crossings_at,
        (vb_new[0], vb_new[0] + vb_new[2]),
    )
    out = overlays.add_svg_attributes(out, {
        "data-crown-left": crown_left,
        "data-crown-right": crown_right,
        "data-bridge-anchor-y": bridge["y"],
        "data-bridge-anchor-height": bridge["height"],
    })
    meta = (
        f"<!-- toothgen: template={spec.key} src={spec.src} view=occlusal"
        f" ratio={got_h / got_w:.3f} target={spec.ratio:.2f}"
        f' source="{spec.source}" -->\n'
    )
    out = out.replace(
        "<svg ",
        meta
        + f'<svg data-tooth-template="{spec.key}" '
        + f'data-cusp-count="{spec.cusp_count}" '
        + f'data-groove-pattern="{spec.groove_pattern}" ',
        1,
    )

    if not dry:
        (out_dir / f"{spec.key}.svg").write_text(out)
    print(
        f"{'DRY ' if dry else ''}{spec.key:9s} {spec.label:28s} "
        f"b/m {have:.2f} -> {got_h / got_w:.2f} (target {spec.ratio:.2f})  "
        f"x-scale {k:.3f}  {len(out) // 1024} KB"
    )


def main(argv: list[str]) -> int:
    dry = "--dry-run" in argv
    out_dir = ASSETS
    for spec in OCCL_SPECS:
        build_one(spec, out_dir, dry)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
