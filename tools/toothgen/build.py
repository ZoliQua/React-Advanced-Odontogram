"""Generate the anatomical tooth templates from four source SVGs.

One coordinate transformation is applied to every registered clinical layer.
Root and crown zones use a smooth piecewise-affine vertical warp; root-count
changes are supplied by ``roots`` before the common warp. Generated paint
servers are namespaced per template while clinical layer ids stay stable.
"""

from __future__ import annotations

import argparse
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import svgpath  # noqa: E402
import roots  # noqa: E402
import graft  # noqa: E402
import gum  # noqa: E402
import fillings  # noqa: E402
import overlays  # noqa: E402
from spec import (  # noqa: E402
    PRIMARY_PULP_SCALE,
    PRIMARY_ROOT_SPREAD,
    PRIMARY_SPECS,
    SPECS,
    ToothSpec,
    display_targets,
)

ROOT = Path(__file__).resolve().parents[2]

CLASSIC_ASSETS = ROOT / "src" / "assets" / "teeth-svgs"

GENERATED_ASSETS = CLASSIC_ASSETS / "measured"

# Backwards-compatible helper name. Toothgen output is isolated from the
# hand-maintained classic profile, matching the documented no-argument command.
ASSETS = GENERATED_ASSETS


SOURCE = Path(__file__).resolve().parent / "source"


SRC_CEJ = {11: 32.2, 13: 32.4, 14: 32.1, 16: 31.0}


BAND = 2.5

DEFAULT_SET = "all"

# Superseded generated class keys. They are removed only during a complete
# no-argument build into the canonical measured directory; arbitrary --out
# directories and partial builds are never cleaned.
LEGACY_GENERATED_FILES = ("46.svg", "46_occl.svg")


CROWN_SCALE = 1.0


D_RE = re.compile(r'\sd="([^"]+)"')


def path_bbox(d: str):
    cmds = svgpath.to_absolute(d)
    xs, ys = [], []
    for cmd, a in cmds:
        for i in range(0, len(a), 2):
            xs.append(a[i])
            ys.append(a[i + 1])
    if not xs:
        return None
    return (min(xs), min(ys), max(xs), max(ys))


def tooth_base_d(txt: str) -> str:
    m = re.search(r'<path id="tooth-base" d="([^"]+)"', txt)
    if not m:
        raise SystemExit("tooth-base not found")
    return m.group(1)


def content_bbox(txt: str):

    x0 = y0 = 1e9
    x1 = y1 = -1e9
    for d in D_RE.findall(txt):
        b = path_bbox(d)
        if not b:
            continue
        x0, y0 = min(x0, b[0]), min(y0, b[1])
        x1, y1 = max(x1, b[2]), max(y1, b[3])
    return (x0, y0, x1, y1)


def _crossings(d: str, y: float) -> list[float]:
    """Sorted x of every place the outline crosses the horizontal line ``y``.

    Delegates to ``roots.crossings_at``, which flattens through the adaptive
    subdivision. The obvious shortcut - walking the command list and taking
    each segment's ENDPOINT - is what stood here, and it measures a polygon
    through the Bezier anchors rather than the outline. On a molar, whose crown
    bulges in the MIDDLE of long cubics, it read 24.6 units where the tooth is
    40.0: a third of the width, gone. Every template was then scaled to make
    that undersized number match its target, so the ones drawn with the longest
    curves - the premolars and molars - came out about a third too wide, and it
    looked like their roots were splayed, because the bounding box was the only
    thing telling the truth (odontogram-5ca).
    """
    return roots.crossings_at(d, y)


def silhouette_width(d: str, y: float) -> float:
    """How much TOOTH the line at ``y`` passes through - material, not extent.

    Pairs the crossings, so a line through a furcation counts the two roots and
    not the gap between them. That is what "how wide is the root that has to
    contain this canal" asks for. It is not what a crown width asks for, which
    is why crown_width exists below.
    """
    xs = _crossings(d, y)
    return sum(xs[i + 1] - xs[i] for i in range(0, len(xs) - 1, 2))


def crown_width(d: str, y: float) -> float:
    """Mesial surface to distal surface at ``y`` - the outline's full extent.

    The mesiodistal crown diameter is the greatest distance between the mesial
    and the distal surface, so a fissure between two cusps - which lies INSIDE
    the tooth - must not be subtracted from it. On the shipped templates the
    crown outline is convex at every height the generator samples, so this and
    silhouette_width agree there; they are kept apart because they answer
    different questions and only one of them is a width.
    """
    xs = _crossings(d, y)
    return (xs[-1] - xs[0]) if len(xs) >= 2 else 0.0


def make_warp(
    apex: float, cej: float, inc: float, kr: float, kc: float, band: float = BAND
):

    def ymap(y: float) -> float:
        def root_branch(v):
            return cej + (v - cej) * kr

        def crown_branch(v):
            return inc + (v - inc) * kc

        shift = crown_branch(cej) - cej
        if y <= cej - band:
            return root_branch(y) + shift
        if y >= cej + band:
            return crown_branch(y)
        t = (y - (cej - band)) / (2 * band)
        s = t * t * (3 - 2 * t)
        a = root_branch(y) + shift
        b = crown_branch(y)
        return a + (b - a) * s

    return lambda x, y: (x, ymap(y)), ymap


def solve_scales(
    apex: float, cej: float, inc: float, root_frac: float, crown_scale: float
):

    crown_old = inc - cej
    root_old = cej - apex
    crown_new = crown_old * crown_scale
    root_new = crown_new * root_frac / (1.0 - root_frac)
    return root_new / root_old, crown_scale, root_new, crown_new


def parse_transform(s: str):

    m = (1.0, 0.0, 0.0, 1.0, 0.0, 0.0)

    def mul(p, q):
        a1, b1, c1, d1, e1, f1 = p
        a2, b2, c2, d2, e2, f2 = q
        return (
            a1 * a2 + c1 * b2,
            b1 * a2 + d1 * b2,
            a1 * c2 + c1 * d2,
            b1 * c2 + d1 * d2,
            a1 * e2 + c1 * f2 + e1,
            b1 * e2 + d1 * f2 + f1,
        )

    import math as _m

    for name, argstr in re.findall(r"(\w+)\s*\(([^)]*)\)", s or ""):
        v = [float(x) for x in svgpath.NUM_RE.findall(argstr)]
        if name == "translate":
            t = (1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0)
        elif name == "scale":
            t = (v[0], 0, 0, v[1] if len(v) > 1 else v[0], 0, 0)
        elif name == "rotate":
            r = _m.radians(v[0])
            t = (_m.cos(r), _m.sin(r), -_m.sin(r), _m.cos(r), 0, 0)
            if len(v) == 3:
                t = mul(mul((1, 0, 0, 1, v[1], v[2]), t), (1, 0, 0, 1, -v[1], -v[2]))
        elif name == "matrix":
            t = tuple(v[:6])
        else:
            continue
        m = mul(m, t)
    return m


def apply_mat(m, x, y):
    a, b, c, d, e, f = m
    return (a * x + c * y + e, b * x + d * y + f)


def warp_gradients(txt: str, ymap) -> str:

    y_a, y_b = 0.0, 5.0
    kr = (ymap(y_b) - ymap(y_a)) / (y_b - y_a)
    off = ymap(y_a) - kr * y_a
    pre = f"matrix(1,0,0,{kr:.5f},0,{off:.5f})"

    def repl(m):
        head, attrs = m.group(1), m.group(2)
        gt = re.search(r'gradientTransform="([^"]*)"', attrs)
        mat = parse_transform(gt.group(1) if gt else "")
        ys = []
        if head == "linearGradient":
            pairs = [("x1", "y1"), ("x2", "y2")]
        else:
            pairs = [("cx", "cy"), ("fx", "fy")]
        for ax, ay in pairs:
            mx = re.search(rf'\b{ax}="([-\d.]+)"', attrs)
            my = re.search(rf'\b{ay}="([-\d.]+)"', attrs)
            if mx and my:
                ys.append(apply_mat(mat, float(mx.group(1)), float(my.group(1)))[1])
        if not ys:
            return m.group(0)

        if all(abs(ymap(y) - y) < 1e-6 for y in ys):
            return m.group(0)
        if gt:
            attrs2 = re.sub(
                r'gradientTransform="([^"]*)"',
                lambda g: f'gradientTransform="{pre} {g.group(1)}"',
                attrs,
            )
        else:
            attrs2 = attrs + f' gradientTransform="{pre}"'
        return f"<{head}{attrs2}"

    return re.sub(
        r"<(linearGradient|radialGradient)((?:\s+[a-zA-Z-]+=\"[^\"]*\")*)", repl, txt
    )


def namespace_paint_servers(txt: str, template_key: str) -> str:

    match = re.search(r"<defs>.*?</defs>", txt, re.S)
    if not match:
        return txt

    defs = match.group(0)
    paint_ids = re.findall(r'\bid="([^"]+)"', defs)
    replacements = {
        paint_id: f"toothgen-{template_key}-{paint_id}" for paint_id in paint_ids
    }
    for old, new in replacements.items():
        defs = re.sub(
            rf'(\bid="){re.escape(old)}(")',
            rf"\g<1>{new}\g<2>",
            defs,
        )

    out = txt[: match.start()] + defs + txt[match.end() :]
    for old, new in replacements.items():
        out = out.replace(f"url(#{old})", f"url(#{new})")
        out = re.sub(
            rf'((?:href|xlink:href)=")#{re.escape(old)}(")',
            rf"\g<1>#{new}\g<2>",
            out,
        )
    return out


def rewrite_svg(txt: str, fn, ymap, vb_new: tuple[float, float, float, float]) -> str:

    def repl_d(m):
        return ' d="' + svgpath.warp_path_d(m.group(1), fn) + '"'

    out = D_RE.sub(repl_d, txt)

    def local_sy(y):
        h = 0.05
        return (ymap(y + h) - ymap(y - h)) / (2 * h)

    def repl_circle(m):
        tag, attrs = m.group(1), m.group(2)
        cy = re.search(r'\bcy="([-\d.]+)"', attrs)
        r = re.search(r'\br="([-\d.]+)"', attrs)
        if not cy:
            return m.group(0)
        y = float(cy.group(1))
        ny = ymap(y)
        attrs2 = re.sub(r'\bcy="[-\d.]+"', f'cy="{ny:.2f}"', attrs)
        if tag == "circle" and r:
            pass
        return f"<{tag}{attrs2}"

    out = re.sub(r"<(circle|ellipse)((?:\s+[a-zA-Z-]+=\"[^\"]*\")*)", repl_circle, out)

    def repl_rect(m):
        attrs = m.group(1)
        ym = re.search(r'\by="([-\d.]+)"', attrs)
        hm = re.search(r'\bheight="([-\d.]+)"', attrs)
        if not ym:
            return m.group(0)
        y = float(ym.group(1))
        ny = ymap(y)
        attrs2 = re.sub(r'\by="[-\d.]+"', f'y="{ny:.2f}"', attrs)
        if hm:
            h = float(hm.group(1))
            nh = ymap(y + h) - ny
            attrs2 = re.sub(r'\bheight="[-\d.]+"', f'height="{nh:.2f}"', attrs2)
        return f"<rect{attrs2}"

    out = re.sub(r"<rect((?:\s+[a-zA-Z-]+=\"[^\"]*\")*)", repl_rect, out)

    def repl_line(m):
        attrs = m.group(1)
        for a in ("y1", "y2"):
            mm = re.search(rf'\b{a}="([-\d.]+)"', attrs)
            if mm:
                attrs = re.sub(
                    rf'\b{a}="[-\d.]+"', f'{a}="{ymap(float(mm.group(1))):.2f}"', attrs
                )
        return f"<line{attrs}"

    out = re.sub(r"<line((?:\s+[a-zA-Z-]+=\"[^\"]*\")*)", repl_line, out)

    def repl_points(m):
        nums = [float(x) for x in svgpath.NUM_RE.findall(m.group(1))]
        pts = []
        for i in range(0, len(nums) - 1, 2):
            x, y = fn(nums[i], nums[i + 1])
            pts.append(f"{x:.2f},{y:.2f}")
        return ' points="' + " ".join(pts) + '"'

    out = re.sub(r'\spoints="([^"]+)"', repl_points, out)

    out = warp_gradients(out, ymap)

    vb = " ".join(f"{v:.1f}" for v in vb_new)
    out = re.sub(r'viewBox="[^"]*"', f'viewBox="{vb}"', out, count=1)
    return out


H_REF = 96.0


PX_PER_UNIT = 1.62


# Distance from the occlusal plane to the viewBox bottom. It has to be the SAME
# on every template - verify.py asserts it - because that is what puts every
# tooth's occlusal plane on one line when the row is assembled.
#
# Raised from 7.5 on 2026-08-11: at ROOT_DISPLAY_SCALE 0.75 the crown region of
# the warp is longer than at 0.60, and the gum drawn below the incisal edge
# followed it past the old bottom by 0.29 on tpl 11.
OCCL_MARGIN = 8.0


# How far the palatal root tip is pulled down relative to the buccal one, as a
# fraction of the distance from the furcation to the apex. Depth cue: the root
# standing further from the viewer ends higher up the picture.
PALATAL_TIP_DROP = 0.34


def curve_extent(d: str):

    pts = [p for sub in roots._polylines(d) for p in sub]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def connect_fillings(txt: str, occl: float) -> str:
    """Join each proximal filling shape to the occlusal one. See fillings.py."""

    band = re.search(
        r'<path id="filling-composite-occlusal" d="([^"]+)"', txt
    )
    if not band:
        return txt
    for surf in fillings.SURFACES:
        m = re.search(rf'<path id="filling-composite-{surf}" d="([^"]+)"', txt)
        if not m:
            continue
        new = fillings.stretch_to_band(
            m.group(1), band.group(1), occl, tooth_base_d(txt), axis="y", sign=1.0
        )
        if new is None or new == m.group(1):
            continue
        # The four direct materials share ONE geometry per surface and differ
        # only in fill, so the same stretch is written to all four.
        for mat in fillings.MATERIALS:
            txt = re.sub(
                rf'(<path id="filling-{mat}-{surf}" d=")[^"]+(")',
                lambda mm: mm.group(1) + new + mm.group(2),
                txt,
                count=1,
            )
    return txt


def replace_gum(
    txt: str,
    occl: float,
    cej: float,
    cx: float,
    neck_half: float,
    col_px: float,
) -> str:

    for lid, d in (
        ("bone-base", gum.bone_path(occl, cx, col_px)),
        ("gum-base", gum.gum_path(occl, cej, cx, neck_half, col_px)),
    ):
        txt, n = re.subn(
            rf'(<path id="{lid}" d=")[^"]+(")',
            lambda m, d=d: m.group(1) + d + m.group(2),
            txt,
            count=1,
        )
        if n != 1:
            raise SystemExit(f"{lid} not found")
    return txt


def source_root_count(base_d: str, apex: float, cej: float) -> int:

    subs = roots._polylines(base_d)
    y = apex + (cej - apex) * 0.35
    return max(1, len(roots.spans_at(subs, y)))


def compose_maps(*maps):
    """Compose optional coordinate maps in declaration order."""

    active = [fn for fn in maps if fn is not None]
    if not active:
        return None

    def composed(x: float, y: float):
        for fn in active:
            x, y = fn(x, y)
        return x, y

    return composed


def crown_shape_xmap(s: ToothSpec, cx: float, cej: float, inc: float):
    """Smooth class-level crown form, fixed at the CEJ.

    Taper differentiates incisal/occlusal outline; the asymmetric polynomial
    bulge peaks in the cervical third. Because this map is part of the common
    rewrite path, fillings, caries, pulp and prosthetic layers remain registered.
    """

    if s.crown_taper == 0.0 and s.cervical_bulge == 0.0:
        return None
    span = inc - cej

    def fn(x: float, y: float):
        if y <= cej or span <= 0:
            return x, y
        t = min(1.0, (y - cej) / span)
        ease = t * t * (3.0 - 2.0 * t)
        # Normalized beta polynomial: peak at t=1/3, with zero slope at both
        # CEJ and incisal/occlusal boundaries. The former is essential—using a
        # linear t term makes a visible tangent kink where crown meets root.
        cervical = 45.5625 * t * t * (1.0 - t) ** 4
        factor = 1.0 + s.crown_taper * ease + s.cervical_bulge * cervical
        return cx + (x - cx) * factor, y

    return fn


def build_one(s: ToothSpec, out_dir: Path, dry: bool, root_scale: float | None = None):
    src = SOURCE / f"{s.src_template}.svg"
    txt = src.read_text()
    cej = SRC_CEJ[s.src_template]

    graft_note = ""
    if s.graft_root_from is not None:
        donor = (SOURCE / f"{s.graft_root_from}.svg").read_text()
        txt, done, closed, skipped = graft.graft_root(
            txt, donor, cej, SRC_CEJ[s.graft_root_from]
        )
        graft_note = (
            f" graft<-{s.graft_root_from} ({len(done)} layers, "
            f"{len(closed)} closed, {len(skipped)} kept)"
        )

    base_d = tooth_base_d(txt)
    bx0, by0, bx1, by1 = curve_extent(base_d)
    have = source_root_count(base_d, by0, cej)
    shape_maps = []
    root_note = f"{have} roots{graft_note}"

    if s.roots == 3 and have == 2:
        furc = roots.find_furcation(base_d, by0, cej)
        txt, hit = roots.palatal_root_subpaths(txt, (bx0 + bx1) / 2, by0, cej, furc)
        root_note = f"2->3 roots ({len(hit)} layers)"
        base_d = tooth_base_d(txt)
        bx0, by0, bx1, by1 = curve_extent(base_d)
    elif s.roots == 1 and have == 2:
        cxs = (bx0 + bx1) / 2
        txt, hit = roots.single_root_layers(txt, cxs, cej, by0)
        base_d = tooth_base_d(txt)
        # The canal can only be sized once the root that contains it exists, so
        # the redrawn root is measured here and the lumen pass is capped to a
        # fraction of it. Measured just apical to the cervical line, which is
        # where the lumen cut falls and where the taper starts from.
        root_half = silhouette_width(base_d, cej - 2.0) / 2.0
        txt, hit_l = roots.single_root_layers(
            txt,
            cxs,
            cej,
            by0,
            lumen=True,
            max_half=root_half * roots.LUMEN_HALF_FRAC,
        )
        root_note = f"2->1 roots ({len(hit)}+{len(hit_l)} lumen layers)"
        base_d = tooth_base_d(txt)
        bx0, by0, bx1, by1 = curve_extent(base_d)
    elif s.roots != have:
        raise SystemExit(
            f"{s.key}: source has {have} roots, target has {s.roots}; no conversion is defined"
        )

    if s.primary:
        cxs = (bx0 + bx1) / 2.0
        # The apex cap stays, even though clamp_lumen_apex could now catch an
        # overhang after the warp. Letting the pulp grow apically and relying on
        # the clamp was tried and is wrong: the clamp compresses it back from
        # the coronal end, which drags the wide chamber down to where the root
        # is narrow, and the primary incisors came out with a lumen at 92% of
        # their root width. So the enlargement Dirk asked for reaches the WIDTH
        # only, and the cap reports itself in the build line when it bites.
        txt, pulp_hit, fy = roots.scale_pulp(txt, PRIMARY_PULP_SCALE, cxs, by0)
        shape_maps.append(roots.spread_roots_xmap(cxs, by0, cej, PRIMARY_ROOT_SPREAD))
        capped = "" if fy >= PRIMARY_PULP_SCALE - 1e-9 else f", capped to {fy:.3f}"
        root_note += f" +pulp {len(pulp_hit)}{capped} +spread"
        base_d = tooth_base_d(txt)

    if s.root_converge != 1.0:
        txt, hit_c = roots.converge_roots_layers(
            txt, (bx0 + bx1) / 2, by0, cej, s.root_converge
        )
        furc_y = cej - (cej - by0) * s.furc_frac
        txt, hit_s = roots.shorten_one_root_layers(
            txt, (bx0 + bx1) / 2, by0, furc_y, PALATAL_TIP_DROP
        )
        root_note += (
            f" +converge {s.root_converge:.2f} ({len(hit_c)} layers)"
            f" +palatal tip -{PALATAL_TIP_DROP:.0%} ({len(hit_s)})"
        )
        base_d = tooth_base_d(txt)
        bx0, by0, bx1, by1 = curve_extent(base_d)

    if s.root_spread != 1.0 and s.roots > 1:
        shape_maps.append(
            roots.spread_roots_xmap((bx0 + bx1) / 2.0, by0, cej, s.root_spread)
        )
    shape_maps.append(crown_shape_xmap(s, (bx0 + bx1) / 2.0, cej, by1))
    merge_fn = compose_maps(*shape_maps)

    apex, inc = by0, by1

    d_length_rel, d_root_frac, d_width_frac = display_targets(s, root_scale)
    total_new = H_REF * d_length_rel
    root_new = total_new * d_root_frac
    crown_new = total_new * (1.0 - d_root_frac)
    kr = root_new / (cej - apex)
    kc = crown_new / (inc - cej)
    fn_y, ymap = make_warp(apex, cej, inc, kr, kc)

    meas_d = svgpath.warp_path_d(base_d, merge_fn) if merge_fn else base_d
    w_src = max(
        crown_width(meas_d, y)
        for y in [inc - (inc - cej) * f for f in (0.2, 0.35, 0.5, 0.65, 0.8)]
    )
    w_dst = d_width_frac * total_new
    sx = w_dst / w_src
    cx = (bx0 + bx1) / 2.0

    vb_old = [float(v) for v in re.search(r'viewBox="([^"]+)"', txt).group(1).split()]
    cx0, cy0, cx1, cy1 = content_bbox(txt)
    new_occl = ymap(inc)
    bottom = new_occl + OCCL_MARGIN
    if ymap(cy1) > bottom + 0.01:
        raise SystemExit(
            f"{s.key}: content exceeds the viewBox bottom by {ymap(cy1) - bottom:.2f}; "
            f"increase OCCL_MARGIN"
        )
    top = min(ymap(cy0) - 1.0, new_occl - (total_new + 1.0))

    # The viewBox is written to one decimal, so its height is rounded - and the
    # occlusal plane is positioned FROM the bottom, which means that rounding
    # walked the plane by up to 0.05 units per template. That was invisible
    # while every tooth was an island; now that bone and gum draw one line
    # across the arch it showed as a step at every joint. Absorb the rounding
    # into the shift instead, so the plane lands exactly OCCL_MARGIN above the
    # written bottom in every template.
    h_vb = round(bottom - top, 1)
    shift = -top + (h_vb - (bottom - top))

    def fn(x, y):

        if merge_fn is not None:
            x, y = merge_fn(x, y)
        _, ny = fn_y(x, y)
        return (cx + (x - cx) * sx, ny + shift)

    def ymap_shift(y):
        return ymap(y) + shift

    # A class may legitimately be wider than its donor viewBox (notably the
    # mandibular first molar). Expand the canvas around the transformed crown
    # rather than clipping class-registered crowns/wear at the donor boundary.
    horizontal_margin = 2.0
    vb_left = min(vb_old[0], cx - w_dst / 2.0 - horizontal_margin)
    vb_right = max(vb_old[0] + vb_old[2], cx + w_dst / 2.0 + horizontal_margin)
    vb_left = math.floor(vb_left * 10.0) / 10.0
    vb_right = math.ceil(vb_right * 10.0) / 10.0
    vb_new = (vb_left, 0.0, vb_right - vb_left, h_vb)

    out = rewrite_svg(txt, fn, ymap_shift, vb_new)

    # Pull back any lumen that would stand outside the root apex. Must run AFTER
    # the warp: the overhang the source drawings carry grows with the root
    # stretching (canine: 2.00 -> 2.46 units).
    apex_now = curve_extent(re.search(r'<path id="tooth-base" d="([^"]+)"', out).group(1))[1]
    out, clamped = roots.clamp_lumen_apex(out, apex_now)
    out = namespace_paint_servers(out, s.key)

    nb = curve_extent(re.search(r'<path id="tooth-base" d="([^"]+)"', out).group(1))
    n_apex, n_inc = nb[1], nb[3]
    n_cej = ymap_shift(cej)

    # The gingiva is drawn here, not warped from the source. Two neighbouring
    # halves of one papilla come from two different drawings and cannot agree
    # on its height; a generated band can, because gum.py measures from the
    # occlusal plane, which every template shares. See gum.py for the shape.
    out = replace_gum(
        out,
        n_inc,
        n_cej,
        (nb[0] + nb[2]) / 2.0,
        crown_width(
            re.search(r'<path id="tooth-base" d="([^"]+)"', out).group(1),
            n_cej + gum.MARGIN_DOWN,
        )
        / 2.0,
        s.col_px,
    )

    out = connect_fillings(out, n_inc)
    out = overlays.normalize_crown_envelopes(out)

    # Bridge connectors are not independent saddles. Regenerate two short
    # proximal tabs from this class's transformed crown envelope so every
    # material shares exact anatomy while retaining its historical id/style.
    final_base_d = re.search(r'<path id="tooth-base" d="([^"]+)"', out).group(1)
    bridge_y = n_cej + (n_inc - n_cej) * 0.64
    bridge_h = min(2.8, max(1.8, (n_inc - n_cej) * 0.065))
    out, bridge = overlays.register_bridge_tabs(
        out,
        final_base_d,
        bridge_y,
        bridge_h,
        roots.crossings_at,
        (vb_new[0], vb_new[0] + vb_new[2]),
    )

    got_root = (n_cej - n_apex) / (n_inc - n_apex)
    got_total = n_inc - n_apex
    got_w = max(
        crown_width(
            final_base_d, y
        )
        for y in [n_inc - (n_inc - n_cej) * f for f in (0.2, 0.35, 0.5, 0.65, 0.8)]
    )

    im = re.search(r'<g id="implant-base".*?</g>', out, re.S)
    n_impl = None
    implant_left = implant_right = None
    if im:
        ds = re.findall(r'\sd="([^"]+)"', im.group(0))
        pts = [pt for d2 in ds for sub in roots._polylines(d2) for pt in sub]
        if pts:
            n_impl = max(pt[1] for pt in pts)
            implant_left = min(pt[0] for pt in pts)
            implant_right = max(pt[0] for pt in pts)

    cervical_y = n_cej + min(1.0, (n_inc - n_cej) * 0.04)
    cervical_xs = roots.crossings_at(final_base_d, cervical_y)
    if len(cervical_xs) < 2:
        raise SystemExit(f"{s.key}: cannot derive cervical span")
    crown_samples = [
        roots.crossings_at(final_base_d, n_cej + (n_inc - n_cej) * frac)
        for frac in (0.25, 0.5, 0.75)
    ]
    crown_left = min(xs[0] for xs in crown_samples if len(xs) >= 2)
    crown_right = max(xs[-1] for xs in crown_samples if len(xs) >= 2)
    registration = {
        "data-cej-y": n_cej,
        "data-cervical-left": cervical_xs[0],
        "data-cervical-right": cervical_xs[-1],
        "data-crown-left": crown_left,
        "data-crown-right": crown_right,
        "data-implant-platform-y": n_impl if n_impl is not None else n_cej,
        "data-implant-left": implant_left if implant_left is not None else cervical_xs[0],
        "data-implant-right": implant_right if implant_right is not None else cervical_xs[-1],
        "data-bridge-anchor-y": bridge["y"],
        "data-bridge-anchor-height": bridge["height"],
    }
    if s.roots > 1:
        registration["data-furcation-y"] = n_cej - (n_cej - n_apex) * s.furc_frac
    out = overlays.add_svg_attributes(out, registration)

    meta = (
        f"<!-- toothgen: template={s.key} src={s.src_template} roots={s.roots}"
        f" apex={n_apex:.2f} cej={n_cej:.2f} occl={n_inc:.2f}"
        f" root_frac={got_root:.4f} length={got_total:.2f}"
        f' source="{s.source}" -->\n'
    )
    out = out.replace(
        "<svg ",
        meta + f'<svg data-tooth-template="{s.key}" data-root-count="{s.roots}" ',
        1,
    )

    dst = out_dir / f"{s.key}.svg"
    if not dry:
        dst.write_text(out)
    px_w = vb_new[2] * PX_PER_UNIT
    px_h = vb_new[3] * PX_PER_UNIT
    print(
        f"{'DRY ' if dry else ''}{s.key:3s} {s.label:30s} "
        f"root {d_root_frac:.0%}/{got_root:.0%}  "
        f"length {total_new:5.1f}/{got_total:5.1f}  "
        f"width {w_dst:4.1f}/{got_w:4.1f}  "
        f"px {px_w:3.0f}x{px_h:3.0f}  {root_note:16s} {len(out) // 1024} KB"
    )
    return dict(
        key=s.key,
        vb=vb_new,
        px=(px_w, px_h),
        cej=n_cej,
        impl=n_impl,
        root=got_root,
        total=got_total,
        occl=n_inc,
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(ASSETS))
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--only", default=None)
    ap.add_argument(
        "--set",
        choices=("permanent", "primary", "all"),
        default=DEFAULT_SET,
        help="Which dentition to build (default: all permanent and primary classes)",
    )
    ap.add_argument(
        "--root-scale",
        type=float,
        default=None,
        help="Root compression for display; overrides "
        "spec.ROOT_DISPLAY_SCALE (1.0 = anatomical)",
    )
    args = ap.parse_args()
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    if (
        not args.dry_run
        and not args.only
        and args.set == "all"
        and out_dir.resolve() == GENERATED_ASSETS.resolve()
    ):
        for name in LEGACY_GENERATED_FILES:
            stale = out_dir / name
            if stale.exists():
                stale.unlink()
                print(f"removed superseded generated asset {name}")
    build_set: list[ToothSpec] = []
    if args.set in ("permanent", "all"):
        build_set += SPECS
    if args.set in ("primary", "all"):
        build_set += PRIMARY_SPECS

    rows = []
    for s in build_set:
        if args.only and s.key != args.only:
            continue
        rows.append(build_one(s, out_dir, args.dry_run, args.root_scale))

    # Occlusal anatomy is part of the same generated profile. Keeping it in the
    # no-argument build makes the documented command reproduce the complete
    # runtime asset set instead of relying on stale files from a separate step.
    if not args.only:
        import occlusal  # local import avoids a module-level build/occlusal cycle

        for item in occlusal.OCCL_SPECS:
            if args.set == "permanent" and item.primary:
                continue
            if args.set == "primary" and not item.primary:
                continue
            occlusal.build_one(item, out_dir, args.dry_run)

    print("\n--- CSS (src/index.css) ---")
    for r in rows:
        print(
            # Two decimals, not whole pixels. Rounding the two sides
            # independently gave each template a slightly different scale, and
            # `preserveAspectRatio` then centred the shortfall - which moved the
            # occlusal plane by up to half a pixel from tile to tile. Invisible
            # per tooth; a step in every shared line across the arch.
            f".tooth-tile.tpl-{r['key']} .tooth-svg svg{{width:{r['px'][0]:.2f}px;height:{r['px'][1]:.2f}px}}"
        )
    print("\n--- perioGraphic.ts: CEJ_Y (mirrored frame, finalY = h - rawY) ---")
    for r in rows:
        print(f"  {r['key']}: {r['vb'][3] - r['cej']:.1f},")
    print("\n--- perioGraphic.ts: IMPLANT_CEJ_Y ---")
    for r in rows:
        v = f"{r['vb'][3] - r['impl']:.1f}" if r["impl"] is not None else "?"
        print(f"  {r['key']}: {v},")
    print("\n--- Occlusal plane (distance from viewBox bottom; must be identical) ---")
    for r in rows:
        vb = r["vb"]
        print(f"  {r['key']:3s} {vb[1] + vb[3] - r['occl']:.2f}")


if __name__ == "__main__":
    main()
