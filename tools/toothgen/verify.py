"""Verify generated anatomy, clinical contracts, and frozen authored geometry."""

from __future__ import annotations

import math
import re
import sys
import hashlib
import xml.dom.minidom as minidom
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import roots  # noqa: E402
from build import ASSETS, SOURCE, curve_extent, tooth_base_d  # noqa: E402
from spec import PRIMARY_SPECS, SPECS, display_targets  # noqa: E402

TOL_FRAC = 0.015
TOL_LEN = 1.0
TOL_OCCL = 0.15

CLINICAL_GROUP_ORDER = (
    "base", "mods", "tooth-variants", "tooth", "milktooth", "endos",
    "surfaces", "restorations", "ortho", "specials", "plan",
)

DEFAULT_SET = "all"

# A canal may be no wider than this fraction of the root at the same height.
# Generous against LUMEN_HALF_FRAC on purpose: several lumen layers overlap at
# the chamber, and the check is here to catch a canal that fills its root, not
# to re-assert the generator's own constant.
TOL_LUMEN_WIDTH = 0.80

# Apical widening tolerated per quarter unit through the cervical region.
TOL_CERVICAL_STEP = 0.03

# Direction change tolerated along the root shaft, in degrees per unit of
# contour, with the apical tip excluded because a root tip turns sharply by
# nature. The drawn templates measure 3.8 to 8.5 here.
TOL_SHAFT_TURN = 15.0
TIP_EXCLUDED = 3.5


def shaft_turn(base_d: str, apex: float, cej: float, chord: float = 1.0):
    """The sharpest direction change along the root outline.

    A kink is a discontinuity in DIRECTION, not in width, and nothing here
    measured direction: the contour checks ask only whether the outline widens
    again apically. Template 15 passed all of them while a clinician read a kink
    straight off the chart, and a first attempt at repairing it passed them
    while making the outline visibly worse. Measured over a chord rather than
    between adjacent sampled points, because at point spacing a wobble of a
    twentieth of a unit reads as eighty degrees and nothing is learnt.
    """

    pts = roots._polylines(base_d)[0]
    walk = [pts[0]]
    run = 0.0
    for a, b in zip(pts, pts[1:]):
        run += ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) ** 0.5
        if run >= chord:
            walk.append(b)
            run = 0.0

    worst, worst_at = 0.0, None
    for a, b, c in zip(walk, walk[1:], walk[2:]):
        if not (apex + TIP_EXCLUDED < b[1] < cej + 0.5):
            continue
        v1 = (b[0] - a[0], b[1] - a[1])
        v2 = (c[0] - b[0], c[1] - b[1])
        l1 = (v1[0] ** 2 + v1[1] ** 2) ** 0.5
        l2 = (v2[0] ** 2 + v2[1] ** 2) ** 0.5
        if l1 < 0.3 or l2 < 0.3:
            continue
        cosine = (v1[0] * v2[0] + v1[1] * v2[1]) / (l1 * l2)
        angle = math.degrees(math.acos(max(-1.0, min(1.0, cosine))))
        if angle > worst:
            worst, worst_at = angle, b[1]
    return worst, worst_at


def lumen_extremes(txt: str, base_d: str, apex: float, cej: float):
    """How far the lumen reaches past the apex, and how wide it gets.

    Nothing measured lumen before this: verify.py passed on assets in which the
    pulp stood outside the root apex on the canine and a canal came out wider
    than the root containing it. The guard did not fail, it did not look
    (odontogram-66a, odontogram-0ak).
    """

    subs: list = []
    roots._lumen_paths(txt, lambda d: subs.extend(roots._polylines(d)) or None)
    if not subs:
        return None, None

    base = roots._polylines(base_d)
    overhang = apex - min(p[1] for s in subs for p in s)

    widest = 0.0
    for i in range(1, 20):
        y = cej - (cej - apex) * i / 20
        lumen_spans = roots.spans_at(subs, y)
        base_spans = roots.spans_at(base, y)
        if not lumen_spans or not base_spans:
            continue
        base_w = sum(b - a for a, b in base_spans)
        if base_w > 0.2:
            widest = max(widest, sum(b - a for a, b in lumen_spans) / base_w)
    return overhang, widest


# Re-taken on 2026-08-10 for odontogram-66a: the lumen repair moves lumen `d`
# attributes on all nine templates, which is an intended, reviewed correction,
# not drift. The previous set was captured on 2026-08-09 from
# origin/feat/tooth-anatomy-9-templates and is recorded in that bead.
# Re-taken on 2026-08-11 for odontogram-3y9: `root_frac` on all nine permanent
# templates is now Dirk's reading off the Odontographie plates, and the two
# display constants changed with it - `ROOT_DISPLAY_SCALE` 0.60 -> 0.75 (less
# root compression, as he asked) and the new `LENGTH_SPREAD` 0.45. Both move
# geometry on every template, primary ones included, and both are intended,
# reviewed corrections rather than drift. `OCCL_MARGIN` went 7.5 -> 8.0 in the
# same change because the longer crown region pushed gum past the old viewBox
# bottom. The previous set was taken on 2026-08-10 and is recorded below.
# Re-taken on 2026-08-11 for odontogram-qyc: `gum-base` and `bone-base` are no
# longer warped out of the source drawings, they are DRAWN by tools/toothgen/
# gum.py in each template's final coordinates. That was the only way to make the
# gingiva read as one line across the arch - a papilla is shared between two
# teeth, and two hand-drawn halves have no way to agree on its height. The same
# change levels the bone block and absorbs the viewBox rounding into the shift,
# so the occlusal plane lands exactly OCCL_MARGIN above the written bottom;
# both move geometry on every template. Intended, reviewed corrections. SVG
# fingerprint parity is byte-identical throughout - the fingerprint reads id,
# opacity and class, never geometry.
# 31 and 71 re-taken again the same day: the lower incisors now stand in a 31 px
# column instead of 44, so their gum papilla moves with the joint. That change
# is what puts the lower canine in the embrasure between the upper lateral and
# the upper canine, which is where the mouth puts it.
# Re-taken TWICE on 2026-08-11 for odontogram-5ca. First, `width_frac` was set
# from the standard mean mesiodistal crown diameters, since the values it had
# carried no source and did not agree with each other. Then the measurement the
# generator fits those targets against turned out to be broken: it flattened
# the outline through the Bezier ANCHORS instead of the curve, so a molar read
# 24.6 units wide where it is 40.0, and the templates drawn with the longest
# curves - the premolars and molars - had been scaled up by a third to make
# that undersized number match. Both are intended, reviewed corrections. Every
# template scales horizontally, so every digest moves.
# Re-taken again on 2026-08-11 for odontogram-3y9: LENGTH_SPREAD 0.45 -> 0.30.
# The apex line was still 15.1 px ragged, essentially all of it the canine
# standing proud of the second molars; at 0.30 it is 9.6 px and the canine is
# still visibly the longest tooth, which is what "almost equal" asked for. One
# constant, every template's length moves. Intended, reviewed correction.
# Re-taken on 2026-08-28 after the canonical-anatomy overhaul was reviewed in
# the running full-mouth, primary-dentition, periodontal, and mixed-clinical
# views. The intentional changes are: 16 explicit permanent and 10 explicit
# primary classes, class-specific crown/root maps, distinct upper/lower
# premolar and molar topology, cervical bulbosity in every primary class, and
# registered root/pulp/filling/periodontal transforms. The obsolete generated
# class 46 is replaced by the explicit mandibular first-molar class 36. Every
# generated side and occlusal class is frozen below; a new class may no longer
# remain silently unfingerprinted.
# Re-taken on 2026-08-28 for the clinical-overlay registration pass. Every
# class now derives bounded proximal bridge tabs from its crown envelope;
# material crowns share one class-specific contour; measured side SVGs publish
# CEJ/cervical/implant/furcation registration metadata; and wide posterior
# canvases expand instead of clipping crown/wear geometry. These are reviewed,
# intentional generator changes rather than anatomy drift.
AUTHORED_GEOMETRY_SHA256 = {
    "11": "740406b88b1dfce2f44456004a8878ab4b27239521ca8c7a105fdd86a680a124",
    "12": "4a63aa52f1d50010951a9e7e291bd844e0378384bb5a46a4ada0309b4539a7aa",
    "13": "37c920bd682fe9e9a2cf1a1017371a2536bddcb6c27cb4d4ce962fb95ccd2062",
    "14": "530aa35cf5ecac79283661e76742047fd615303b57067e31408893622587b1dd",
    "15": "02264cb56e7c5275573de5c1ca9ce73456683636312e0ff6d4c7373f6420d5a6",
    "16": "bd3868a6f28c1cc41e9402c8ae4bda411d12d25674a301065c1b5434ef3ab4c4",
    "17": "b5170eaa25fcd3a82edca0010c97648796003766e0748213f1a289cc571838cb",
    "18": "a8201154137a13ffe7289ac711a3508049c0d31b2770f3bc9da9e1058dba20fa",
    "31": "479327c627d36bd3e14b13a7abfda64b892456f071284fe12b6f44dde2bf5b1e",
    "32": "58e9c2b6eb73d01e7ba89e85454b70406c479cb83bcf95dfeb08a82c278c585e",
    "33": "42829c3a815f39c1cc459f32d5a8001f0268eef44dec731a6e156a4e7321e5c8",
    "34": "96c057e8c348df6fcb35fd68c5ae0f1a1157a25bb4f3a2cc9b10a18f1a62f9a9",
    "35": "6126a29e620592e4afe2e80809043e95891e6f719265edb2c6ca934e5ea65bb8",
    "36": "14703608a33aa4be61894be597d1378236f412b2b1888f9b474bba9b4f2bad99",
    "37": "5aae26ac663a8b39f068274b15ef5969ec4939f3c309ac076003a65e30114feb",
    "38": "b74204a244022c3e9893f32b906933f914138419a73c5b9925960721ed15df19",
    "51": "48db0a802cb43dea9d5176a53555302f029a259bf7fa797a5be49bb5ef3c3727",
    "52": "d613f455992989e14e56ee96c8ab16325aae710901c1b697630a27263b7586a3",
    "53": "49513c6e1c474f4ef6daf627c08e33cae21061df78ba2069c49dcb780a4964be",
    "54": "b4b282a806cf1c5a620d2a1a176be1dfc734895b0c4a3020bd189eae0dd4bec0",
    "55": "50b576c88ea2a2464b48b94d9238849fa06cc98e8e6742b8c7e92498a9850c7a",
    "71": "3a95a6b18a0d436dbac09db0aa25502333cebfb4a3e767c1638d22c35fb12096",
    "72": "7b385566d84679fd3083cbdcedcf1016ae76e3f6e956e99deeb2b74cab6528d5",
    "73": "8f589ac5cc938ff9eb7901e76e2addb90d61b99feda72e1b6fd36f3b23c2aaf0",
    "74": "3cf7e222f663512bc0925213bc512395509ab9844a57f0c89751c9a8b736b60e",
    "75": "8906ff3df0640b5f77d3f1e4730ed53a1c5659ddaa7f35c52185cb8dcaf590cb",
}

OCCLUSAL_GEOMETRY_SHA256 = {
    "14_occl": "bd231b7a927492467edc46067fb771e8af54684939657f5aa9ad5a36bf464437",
    "15_occl": "ab9c4ed87628f9aa15de57fb6becfa6ebd6296de9a7f23d18210adecb9e0c7ce",
    "34_occl": "8be150bce513bb73f3281608cb6b03e3a64da68068e1e47f1ebec9e3a8bb6000",
    "35_occl": "9bd84b9e63b1ad8fa5254f62e90c0eb12b0d0494d8aa095b9e10797ffa847938",
    "16_occl": "647ccab4e41262e7bc8c519975721a7ab309267a9ea4b1513a2af862a7db95d0",
    "17_occl": "f7a86ea9bcfafc5cc64c522f90d55566372dfa1130761537509507cf28646bbe",
    "18_occl": "9dfe6a633f92966dfcf8c210db03fc9579b1b90afc8b33d36927672b3e9cf2d9",
    "36_occl": "f7d4a49e2a50aac6d5b9c745025a626a6011d57bcc3116889fdf44358737979d",
    "37_occl": "dca2e2aa27ae121857129757cf5b87ca41a03924db01fe8be78fb2a6b2cec69a",
    "38_occl": "54f896ec4c8ca314d996b41cfb911a02d661be3a2330c708c3217d3dd9632d45",
    "54_occl": "469480e94cee0360310eeffc040f9e3c6eb9a7f45947f86abd1026213beb4bcc",
    "55_occl": "e19b5253abca2f3815d78a728a35085779654233e29dc2d018022e11ec9215ed",
    "74_occl": "48010631f5f024be179e999e309cc2a8ffd7a438e9aea8960eb65df195e3af61",
    "75_occl": "4f52373b603814b922efd5ee5b156fa089a7e4f208933cb0fd5664d160e0db4d",
}

GEOMETRY_ATTRIBUTES = (
    "d",
    "points",
    "x",
    "y",
    "x1",
    "y1",
    "x2",
    "y2",
    "cx",
    "cy",
    "fx",
    "fy",
    "r",
    "rx",
    "ry",
    "width",
    "height",
    "transform",
)

# Geometry is not only expressible as an XML attribute. SVG 2 / CSS also accept
# several of these as CSS properties, so `style="transform: scale(2)"` moves a
# contour just as `transform="scale(2)"` does. Hashing attributes alone would
# leave that route unguarded and let authored anatomy drift while the frozen
# digest still matched. Only the geometry-bearing declarations are taken from
# `style`: the rest of it is paint, and paint is not what these digests freeze.
GEOMETRY_STYLE_PROPERTIES = frozenset(GEOMETRY_ATTRIBUTES)


def geometry_style(value: str) -> str:
    """The geometry-bearing declarations of a `style` attribute, normalized."""

    kept = []
    for declaration in value.split(";"):
        name, separator, setting = declaration.partition(":")
        if not separator:
            continue
        name = name.strip().lower()
        if name in GEOMETRY_STYLE_PROPERTIES:
            kept.append(f"{name}:{' '.join(setting.split())}")
    return ";".join(kept)


def clinical_ids(txt: str) -> list[str]:

    without_defs = re.sub(r"<defs>.*?</defs>", "", txt, flags=re.S)
    return re.findall(r'id="([^"]+)"', without_defs)


def geometry_digest(txt: str) -> str:

    root = ET.fromstring(txt)
    parts: list[str] = []

    def walk(node: ET.Element, inside_defs: bool = False) -> None:
        local_name = node.tag.rsplit("}", 1)[-1]
        blocked = inside_defs or local_name == "defs"
        if not blocked:
            values = "|".join(
                f"{name}={node.attrib[name]}"
                for name in GEOMETRY_ATTRIBUTES
                if name in node.attrib
            )
            styled = geometry_style(node.attrib.get("style", ""))
            if styled:
                values = f"{values}|style[{styled}]" if values else f"style[{styled}]"
            parts.append(f"{local_name}|{values}")
        for child in node:
            walk(child, blocked)

    walk(root)
    return hashlib.sha256("\n".join(parts).encode()).hexdigest()


def root_count(base_d: str, apex: float, cej: float) -> int:

    subs = roots._polylines(base_d)
    counts = []
    for f in (0.25, 0.35, 0.45, 0.55):
        y = apex + (cej - apex) * f
        sp = roots.spans_at(subs, y)

        merged = 1
        for a, b in zip(sp, sp[1:]):
            if b[0] - a[1] > 0.25:
                merged += 1
        counts.append(merged if sp else 0)
    return max(set(counts), key=counts.count)


def check_occlusal(out_dir: Path, failures: list[str]) -> None:
    """The occlusal templates: the proportion the generator was asked for, and
    every clinical layer of the drawing it came from.

    odontogram-vlw AC3 asks for the coordinate transformation to be verified
    here, not merely produced. AC4 asks for the clinical layer ids, hidden
    defaults and activation paths to survive it - an x-scale should preserve all
    of them, and this is what says so rather than assuming it.
    """

    from occlusal import OCCL_SPECS, outline_extent

    print(f"\n{'Occl':9s} {'Ratio b/m':>18s}  {'id/Tags':>8s}  {'hidden':>8s}")
    print("-" * 50)
    for spec in OCCL_SPECS:
        f = out_dir / f"{spec.key}.svg"
        if not f.exists():
            failures.append(f"{spec.key}: file is missing")
            continue
        txt = f.read_text()
        src = (SOURCE / f"{spec.src}.svg").read_text()

        w, h, _ = outline_extent(txt)
        ratio = h / w
        ok_r = abs(ratio - spec.ratio) <= 0.02

        ids_ok = clinical_ids(txt) == clinical_ids(src)

        # Cusp/fissure paths are intentionally generated class anatomy. Remove
        # only those marked/known baseline interiors before checking structural
        # tag parity; every clinical surface and all surrounding structure must
        # still match the canonical source exactly.
        def without_baseline(value: str) -> str:
            value = re.sub(
                r'<g[^>]+data-toothgen-anatomy="primary-cusps"[^>]*>.*?</g>',
                "",
                value,
                flags=re.S,
            )
            for group_id in ("cusps", "fissure", "fissure1"):
                value = re.sub(
                    rf'(<g id="{group_id}"[^>]*>).*?(</g>)',
                    rf"\1\2",
                    value,
                    count=1,
                    flags=re.S,
                )
            return value

        tags_ok = re.findall(r"<(\w+)", without_baseline(txt)) == re.findall(
            r"<(\w+)", without_baseline(src)
        )

        cusp_attr = re.search(r'<svg[^>]+data-cusp-count="(\d+)"', txt)
        groove_attr = re.search(r'<svg[^>]+data-groove-pattern="([^"]+)"', txt)
        marker = "primary-cusps" if spec.primary else "cusps"
        cusp_group = re.search(
            rf'<g[^>]+data-toothgen-anatomy="{marker}"[^>]*>(.*?)</g>',
            txt,
            re.S,
        )
        groove_marker = "primary-grooves" if spec.primary else "grooves"
        groove_group = re.search(
            rf'<g[^>]+data-toothgen-anatomy="{groove_marker}"[^>]*>(.*?)</g>',
            txt,
            re.S,
        )
        anatomy_ok = (
            cusp_attr is not None
            and int(cusp_attr.group(1)) == spec.cusp_count
            and cusp_group is not None
            and len(re.findall(r"<path\b", cusp_group.group(1))) == spec.cusp_count
            and groove_attr is not None
            and groove_attr.group(1) == spec.groove_pattern
            and groove_group is not None
            and len(re.findall(r"<path\b", groove_group.group(1))) >= 1
        )

        all_ids = re.findall(r'\bid="([^"]+)"', txt)
        ids_unique = len(all_ids) == len(set(all_ids))
        paint_refs = set(re.findall(r'url\(#([^)]+)\)', txt))
        paint_ok = paint_refs.issubset(set(all_ids))
        # A layer switched off in the drawing must still be switched off here,
        # or a finding would render on a tooth nobody charted it on.
        hidden_ok = txt.count("display: none") == src.count("display: none")
        geometry_ok = geometry_digest(txt) == OCCLUSAL_GEOMETRY_SHA256.get(spec.key)

        mark = lambda b: "OK" if b else "!!"  # noqa: E731
        print(
            f"{spec.key:9s} {mark(ok_r)} {ratio:5.2f} (target {spec.ratio:.2f})  "
            f"{mark(ids_ok and tags_ok and anatomy_ok and ids_unique and paint_ok):>8s}  "
            f"{mark(hidden_ok):>8s}"
        )
        if not ok_r:
            failures.append(
                f"{spec.key}: outline ratio {ratio:.2f} instead of {spec.ratio:.2f}"
            )
        if not ids_ok:
            failures.append(f"{spec.key}: clinical id order differs from its drawing")
        if not tags_ok:
            failures.append(
                f"{spec.key}: non-anatomy element tags differ from its drawing"
            )
        if not anatomy_ok:
            failures.append(
                f"{spec.key}: generated cusp/groove topology does not match its spec"
            )
        if not ids_unique:
            failures.append(f"{spec.key}: duplicate SVG ids within the asset")
        if not paint_ok:
            failures.append(f"{spec.key}: unresolved paint-server reference")
        if not hidden_ok:
            failures.append(
                f"{spec.key}: {txt.count('display: none')} hidden defaults against "
                f"the drawing's {src.count('display: none')}"
            )
        if not geometry_ok:
            failures.append(f"{spec.key}: authored occlusal geometry changed")


INDEX_CSS = ASSETS.parents[2] / "index.css"


def check_columns(specs, failures):
    """`ToothSpec.col_px` has to name a column the grid actually has.

    The gum puts its papilla half a column plus half a gap from the tooth's
    centre, which is what makes two neighbours peak on the same point without
    either knowing the other (see tools/toothgen/gum.py). That only holds while
    the number in the spec is the number in the stylesheet, and nothing else
    ties the two together - so widening a column in src/index.css and leaving
    the spec alone would silently walk every papilla off its joint. This is the
    check that says so.
    """
    try:
        css = INDEX_CSS.read_text()
    except OSError:
        failures.append(f"cannot read {INDEX_CSS}")
        return
    # Both arches, because they no longer have the same columns: the lower
    # incisors stand in 31 px where the upper ones stand in 44.
    decls = re.findall(r"grid-template-columns:([^;]+);", css, re.S)
    if not decls:
        failures.append("grid-template-columns not found in src/index.css")
        return
    have = {
        float(v)
        for d in decls
        for v in re.findall(r"minmax\([^,]+,\s*([\d.]+)px\)", d)
    }
    if not have:
        failures.append("no minmax() columns found in src/index.css")
        return
    print(f"\nGrid columns in src/index.css: {sorted(have)}")
    for s in specs:
        if s.col_px not in have:
            failures.append(
                f"{s.key}: col_px {s.col_px:g} is not a column the grid has "
                f"({sorted(have)}); the papilla would miss the joint"
            )


# Adjacent filling surfaces that a clinician charts as ONE restoration. MO, OD
# and MOD are cut through the occlusal surface, so the proximal box and the
# occlusal part are one piece of material and have to be drawn as one shape.
FILLING_PAIRS = (("mesial", "occlusal"), ("occlusal", "distal"))


def _segments(d: str):
    return [
        (a, b) for sub in roots._polylines(d) for a, b in zip(sub, sub[1:])
    ]


def _crosses(p1, p2, p3, p4) -> bool:
    def side(a, b, c):
        return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])

    d1, d2 = side(p3, p4, p1), side(p3, p4, p2)
    d3, d4 = side(p1, p2, p3), side(p1, p2, p4)
    return ((d1 > 0) != (d2 > 0)) and ((d3 > 0) != (d4 > 0))


def _inside(pt, segs) -> bool:
    x, y = pt
    n = 0
    for (ax, ay), (bx, by) in segs:
        if (ay > y) != (by > y):
            t = (y - ay) / (by - ay)
            if ax + t * (bx - ax) > x:
                n += 1
    return n % 2 == 1


def shapes_meet(d1: str, d2: str) -> bool:
    """Do two filled outlines share any point - i.e. is their union ONE region?

    Exact for these shapes and free of dependencies: two filled regions overlap
    exactly when their outlines cross, or when one lies wholly inside the other.
    Deliberately NOT an area or a bounding-box test - the shapes this was
    written for had overlapping bounding boxes for years while missing each
    other entirely, and a guard that does not measure what the clinician looks
    at passes while the drawing gets worse (odontogram-9cl).
    """
    s1, s2 = _segments(d1), _segments(d2)
    for a, b in s1:
        for c, e in s2:
            if _crosses(a, b, c, e):
                return True
    return _inside(s1[0][0], s2) or _inside(s2[0][0], s1)


def check_fillings(out_dir: Path, failures):
    """Every MO and OD pair, on every template, must be one connected shape."""
    for f in sorted(out_dir.glob("*.svg")):
        txt = f.read_text()
        for a, b in FILLING_PAIRS:
            da = re.search(rf'<path id="filling-composite-{a}" d="([^"]+)"', txt)
            db = re.search(rf'<path id="filling-composite-{b}" d="([^"]+)"', txt)
            if not da or not db:
                continue
            if not shapes_meet(da.group(1), db.group(1)):
                failures.append(
                    f"{f.stem}: filling {a[0].upper()}{b[0].upper()} is two "
                    f"separate shapes; it has to read as one restoration"
                )


def _element_extent(element: ET.Element):
    paths = []
    if element.get("d"):
        paths.append(element.get("d"))
    paths.extend(
        child.get("d") for child in element.iter()
        if child is not element and child.get("d")
    )
    boxes = [curve_extent(path) for path in paths]
    if not boxes:
        return None
    return (
        min(box[0] for box in boxes), min(box[1] for box in boxes),
        max(box[2] for box in boxes), max(box[3] for box in boxes),
    )


def check_clinical_registration(out_dir: Path, failures: list[str]) -> None:
    """Validate the shared anatomy-to-overlay registration contract."""

    required_side = (
        "data-cej-y", "data-cervical-left", "data-cervical-right",
        "data-implant-platform-y", "data-implant-left", "data-implant-right",
        "data-bridge-anchor-y", "data-bridge-anchor-height",
    )
    required_occlusal = (
        "data-crown-left", "data-crown-right",
        "data-bridge-anchor-y", "data-bridge-anchor-height",
    )
    checked = 0
    for item in SPECS + PRIMARY_SPECS:
        root = ET.parse(out_dir / f"{item.key}.svg").getroot()
        missing = [name for name in required_side if root.get(name) is None]
        if item.roots > 1 and root.get("data-furcation-y") is None:
            missing.append("data-furcation-y")
        if missing:
            failures.append(f"{item.key}: missing registration metadata {missing}")
        vb_x, vb_y, vb_w, vb_h = map(float, root.get("viewBox").split())
        top_ids = [child.get("id") for child in root if child.get("id")]
        present = [name for name in CLINICAL_GROUP_ORDER if name in top_ids]
        if [name for name in top_ids if name in present] != present:
            failures.append(f"{item.key}: clinical group stacking differs from contract")
        connectors = [
            element for element in root.iter()
            if (element.get("id") or "").endswith("-bridge-connector")
        ]
        if not connectors or len({element.get("d") for element in connectors}) != 1:
            failures.append(f"{item.key}: material connector geometry diverges")
        for element in connectors:
            box = _element_extent(element)
            if box and (
                box[0] < vb_x - 0.05 or box[1] < vb_y - 0.05
                or box[2] > vb_x + vb_w + 0.05
                or box[3] > vb_y + vb_h + 0.05
            ):
                failures.append(f"{item.key}: {element.get('id')} leaves the viewBox")
                break
        checked += 1

    from occlusal import OCCL_SPECS
    for item in OCCL_SPECS:
        root = ET.parse(out_dir / f"{item.key}.svg").getroot()
        missing = [name for name in required_occlusal if root.get(name) is None]
        if missing:
            failures.append(f"{item.key}: missing registration metadata {missing}")
        connectors = [
            element for element in root.iter()
            if (element.get("id") or "").endswith("-bridge-connector")
        ]
        if not connectors or len({element.get("d") for element in connectors}) != 1:
            failures.append(f"{item.key}: material connector geometry diverges")
        checked += 1
    print(f"Clinical overlay registration: {checked} templates checked")



def main(argv):
    argv = list(argv)
    which = DEFAULT_SET
    for flag in ("--primary", "--all"):
        if flag in argv:
            which = flag[2:]
            argv.remove(flag)

    specs = []
    if which in ("permanent", "all"):
        specs += SPECS
    if which in ("primary", "all"):
        specs += PRIMARY_SPECS

    out_dir = Path(argv[1]) if len(argv) > 1 else ASSETS
    failures = []
    occl_offsets = []

    print(f"Checking {out_dir}\n")
    hdr = (
        f"{'Tpl':4s} {'Roots':>10s}  {'Root fraction':>20s}  {'Length':>14s}  "
        f"{'Lumen apex':>11s} {'Lumen width':>11s}  {'id/Tags':>8s}"
    )
    print(hdr)
    print("-" * len(hdr))

    for s in specs:
        f = out_dir / f"{s.key}.svg"
        if not f.exists():
            failures.append(f"{s.key}: file is missing")
            continue
        txt = f.read_text()
        try:
            minidom.parseString(txt)
        except Exception as e:
            failures.append(f"{s.key}: invalid XML ({e})")
            continue

        all_ids = re.findall(r'\bid="([^"]+)"', txt)
        if len(all_ids) != len(set(all_ids)):
            failures.append(f"{s.key}: duplicate SVG ids within the asset")
        paint_refs = set(re.findall(r'url\(#([^)]+)\)', txt))
        if not paint_refs.issubset(set(all_ids)):
            missing = sorted(paint_refs - set(all_ids))
            failures.append(
                f"{s.key}: unresolved paint-server reference(s) {missing}"
            )
        declared_roots = re.search(r'<svg[^>]+data-root-count="(\d+)"', txt)
        if declared_roots is None or int(declared_roots.group(1)) != s.roots:
            failures.append(
                f"{s.key}: data-root-count does not match the anatomy spec"
            )

        src = (SOURCE / f"{s.src_template}.svg").read_text()
        ids_ok = clinical_ids(src) == clinical_ids(txt)
        tags_ok = re.findall(r"<(\w+)", src) == re.findall(r"<(\w+)", txt)
        # A template with no recorded digest is not yet frozen, which is a
        # state, not a fault. The digests exist to report geometry that moved
        # when nobody meant it to; they are not a gate a new drawing has to pass
        # before it may exist (odontogram-0ak).
        frozen = AUTHORED_GEOMETRY_SHA256.get(s.key)
        geometry_ok = frozen is None or geometry_digest(txt) == frozen

        base_d = tooth_base_d(txt)
        x0, apex, x1, inc = curve_extent(base_d)
        vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', txt).group(1).split()]

        mm = re.search(r"<!-- toothgen:.*?\bcej=([-\d.]+)", txt)
        if not mm:
            failures.append(f"{s.key}: toothgen metadata block is missing")
            continue
        cej = float(mm.group(1))

        n_sub = len(roots._polylines(base_d))
        if n_sub != 1:
            failures.append(
                f"{s.key}: tooth-base contains {n_sub} subpaths; "
                f"the contour must be continuous"
            )

        if s.roots == 1:
            subs = roots._polylines(base_d)
            # A lumen may fall into several lobes inside the chamber, but below
            # the cervical line a single-rooted tooth has ONE canal. Anything
            # else is the twin structure of a two-rooted source surviving the
            # conversion, which is what template 15 shipped with
            # (odontogram-ay4).
            # Counted as a RUN over consecutive millimetre depths. A single
            # height with two spans is a shape - a post with a shoulder, one
            # mark of a hatch pattern - while surviving twin canals persist over
            # several units, which is how template 15 read: four spans holding
            # from the cervical line to four units below it.
            def lumen_spans(d):
                sub = roots._polylines(d)
                run = best = 0
                worst = 0
                depth = 1.0
                while cej - depth > apex + 1.0:
                    n = len(roots.spans_at(sub, cej - depth))
                    run = run + 1 if n > 1 else 0
                    best = max(best, run)
                    worst = max(worst, n)
                    depth += 1.0
                if best >= 2:
                    multi.append(worst)
                return None

            multi: list[int] = []
            roots._lumen_paths(txt, lumen_spans)
            if multi:
                failures.append(
                    f"{s.key}: {len(multi)} lumen layer(s) hold up to "
                    f"{max(multi)} spans over consecutive depths below the "
                    f"cervical line; the twin canals of the two-rooted source "
                    f"survive"
                )

            # The cervical region on its own fine grid. The coarse sweep below
            # starts at 8 % of root length and steps in whole units, so it
            # walked straight over template 15's step, which sat within the
            # first unit and measured 0.058 per quarter unit. Every other
            # single-rooted template measures 0.000 there, so the threshold is
            # read off a clean separation rather than guessed.
            prev_w, cerv_at = None, None
            y = cej
            while y > cej - 4.0 and y > apex:
                sp = roots.spans_at(subs, y)
                if len(sp) == 1:
                    w = sp[0][1] - sp[0][0]
                    if prev_w is not None and w > prev_w + TOL_CERVICAL_STEP:
                        cerv_at = y
                    prev_w = w
                y -= 0.25
            if cerv_at is not None:
                failures.append(
                    f"{s.key}: contour widens apically at CEJ-{cej - cerv_at:.2f}; "
                    f"a step sits in the cervical region"
                )

            turn, turn_at = shaft_turn(base_d, apex, cej)
            if turn > TOL_SHAFT_TURN:
                failures.append(
                    f"{s.key}: the root outline turns {turn:.0f} degrees at "
                    f"CEJ-{cej - turn_at:.1f}; the shaft is not continuous"
                )

            prev, step_at = None, None
            for k in range(24):
                y = cej - (cej - apex) * (0.01 + 0.95 * k / 23)
                sp = roots.spans_at(subs, y)
                if len(sp) != 1:
                    continue
                w = sp[0][1] - sp[0][0]
                if prev is not None and w > prev + 0.12:
                    step_at = y
                prev = w
            if step_at is not None:
                failures.append(
                    f"{s.key}: root widens apically again at y={step_at:.1f}; "
                    f"the contour contains a step"
                )

            raw = roots.spans_at(subs, (apex + cej) / 2)
            if len(raw) > 1:
                failures.append(
                    f"{s.key}: root splits into {len(raw)} spans at half height; "
                    f"the former two-root seam remains"
                )

        overhang, lumen_w = lumen_extremes(txt, base_d, apex, cej)
        if overhang is None:
            failures.append(f"{s.key}: no lumen layer found")
        else:
            if overhang > 0:
                failures.append(
                    f"{s.key}: lumen stands {overhang:.2f} outside the root apex"
                )
            if lumen_w > TOL_LUMEN_WIDTH:
                failures.append(
                    f"{s.key}: lumen reaches {lumen_w:.0%} of the root width; "
                    f"a canal is drawn as wide as the root that contains it"
                )

        n = root_count(base_d, apex, cej)
        if s.roots > 1:
            furc = roots.find_furcation(base_d, apex, cej)
            root_trunk = (cej - furc) / (cej - apex)
            # A zero-height split looks like detached root pieces; an extremely
            # long trunk hides the clinically useful furcation. These broad
            # bounds tolerate normal class variation and protect topology, not
            # harmless subpixel shape changes.
            if not 0.08 <= root_trunk <= 0.38:
                failures.append(
                    f"{s.key}: furcation/root-trunk fraction {root_trunk:.1%} "
                    "falls outside the credible display range 8%-38%"
                )
        frac = (cej - apex) / (inc - apex)
        length = inc - apex
        occl_offsets.append((s.key, vb[1] + vb[3] - inc))

        _, want_frac, _ = display_targets(s)

        ok_n = n == s.roots
        ok_f = abs(frac - want_frac) <= TOL_FRAC
        ok_l = True
        mark = lambda b: "OK" if b else "!!"  # noqa: E731
        ok_lo = overhang is not None and overhang <= 0
        ok_lw = lumen_w is not None and lumen_w <= TOL_LUMEN_WIDTH
        print(
            f"{s.key:4s} {mark(ok_n)} {n} (target {s.roots})  "
            f"{mark(ok_f)} {frac:5.1%} (target {want_frac:.0%}, anatomical {s.root_frac:.0%})  "
            f"{length:8.1f}  "
            f"{mark(ok_lo)} {overhang if overhang is not None else 0:+6.2f} "
            f"{mark(ok_lw)} {lumen_w if lumen_w is not None else 0:8.0%}  "
            f"{mark(ids_ok and tags_ok):>8s}"
        )
        if not ok_n:
            failures.append(f"{s.key}: {n} roots instead of {s.roots}")
        if not ok_f:
            failures.append(
                f"{s.key}: root fraction {frac:.1%} instead of {want_frac:.0%}"
            )
        if not ids_ok:
            failures.append(
                f"{s.key}: clinical id order differs from the source template"
            )
        if not tags_ok:
            failures.append(f"{s.key}: element tags differ from the source template")
        if not geometry_ok:
            failures.append(f"{s.key}: authored geometry changed")

    check_occlusal(out_dir, failures)
    check_fillings(out_dir, failures)
    check_clinical_registration(out_dir, failures)
    check_columns(specs, failures)

    if occl_offsets:
        vals = [v for _, v in occl_offsets]
        spread = max(vals) - min(vals)
        print(
            f"\nOcclusal plane above viewBox bottom: {min(vals):.2f} .. {max(vals):.2f} "
            f"(spread {spread:.2f})"
        )
        if spread > TOL_OCCL:
            failures.append(
                f"occlusal plane spreads by {spread:.2f}; crowns do not align"
            )

    print()
    if failures:
        print(f"{len(failures)} problem(s):")
        for x in failures:
            print("  !!", x)
        return 1
    print("All checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
