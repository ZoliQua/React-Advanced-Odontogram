"""Derive a dentin core from a tooth silhouette.

The drawings carry one silhouette per tooth: crown and root in a single shape,
with no enamel/dentin boundary anywhere in the markup. This module computes
that boundary as an inset of the silhouette the generator has already produced.

Why here and not in the donors: `spec.py` fixes the OUTPUT scale at
`UNITS_PER_MM`, and the donors are drawn in their own, different one. Enamel
thickness is a clinical quantity in millimetres, so it can only be applied
after `build_one` has warped the template to its measured size.

The construction, per silhouette:

1. Sample the contour on a horizontal grid. `roots.crossings_at` reports where
   each row meets the outline; consecutive pairs are the spans of tooth
   material that row passes through.
2. Inset each span by the enamel half-thickness at that height, and drop what
   is left if it is thinner than `MIN_CORE_MM` — that is what closes the shape
   under a cusp tip and at an apex.
3. Chain overlapping spans of neighbouring rows into lobes. A multi-rooted
   tooth splits into one lobe per root at the furcation and into one per cusp
   near the occlusal surface; no case distinction is needed to get that.
4. Emit the lobes as subpaths of a single path. They are wound the same way and
   overlap by half a row where one grew out of another, so `fill-rule: nonzero`
   unions them into the connected core a tooth actually has. Tracing that
   outline as one contour would be the same shape at much greater risk.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import roots  # noqa: E402
import spec  # noqa: E402
import svgpath  # noqa: E402

# Enamel is thickest over the cusp tips and incisal edge and ends in a knife
# edge at the cervical line; cementum is a few hundredths of a millimetre, drawn
# here as a hairline only so the core never touches the outline it sits in.
CUSP_MM = 2.0
CEJ_MM = 0.1
CEMENTUM_MM = 0.15

# Below this the core is a sliver that reads as a rendering artefact.
MIN_CORE_MM = 0.35

# Rows across the whole silhouette. 180 puts a sample every ~0.35 u on the
# tallest template, well under one device pixel at PX_PER_UNIT = 1.62.
ROWS = 180

# Chain simplification. 0.05 u is ~0.08 px: invisible, and it halves the point
# count on the long straight flanks of a root.
SIMPLIFY_U = 0.05

Span = tuple[float, float]


def half_thickness(y: float, cej: float, occl: float, *, exposed: bool = False) -> float:
    """Enamel (or cementum) half-thickness at height ``y``, in units.

    ``y`` grows towards the crown: apex < cej < occl. ``exposed`` is for a
    silhouette whose enamel is gone — a prepared crown — where the remaining
    shape is dentin up to a cementum-thin rim.
    """
    u = spec.UNITS_PER_MM
    if exposed or y <= cej or occl <= cej:
        return CEMENTUM_MM * u
    frac = min(1.0, (y - cej) / (occl - cej))
    # Floored at the cementum rim. Enamel really is thinner than cementum for
    # the first fraction of a millimetre above the cervical line, and letting
    # the core follow that puts a step in the outline just above the gum —
    # anatomically true, and at 0.2 px it reads as a drawing defect.
    return max(CEMENTUM_MM, CEJ_MM + (CUSP_MM - CEJ_MM) * frac) * u


def _inset_spans(base_d: str, y: float, cej: float, occl: float,
                 exposed: bool) -> list[Span]:
    """The core's spans on one horizontal, inset and de-slivered."""
    t = half_thickness(y, cej, occl, exposed=exposed)
    floor = MIN_CORE_MM * spec.UNITS_PER_MM
    xs = roots.crossings_at(base_d, y)
    spans = []
    for a, b in zip(xs[0::2], xs[1::2]):
        lo, hi = a + t, b - t
        if hi - lo >= floor:
            spans.append((lo, hi))
    return spans


def _rows(base_d: str, cej: float, occl: float, apex: float,
          exposed: bool) -> list[tuple[float, list[Span]]]:
    """Inset spans per sampled row, apex first.

    The rows stop short of the occlusal surface by the same thickness they are
    inset by. A horizontal inset does nothing to a horizontal contour, so
    without this the core would run to within a hairline of the incisal edge —
    the one place on a tooth where the enamel is thickest.
    """
    out: list[tuple[float, list[Span]]] = []
    ceiling = occl - (CEMENTUM_MM if exposed else CUSP_MM) * spec.UNITS_PER_MM
    if ceiling <= apex:
        return out
    step = (ceiling - apex) / ROWS
    for i in range(1, ROWS):
        y = apex + step * i
        out.append((y, _inset_spans(base_d, y, cej, occl, exposed)))
    return out


def _overlap(a: Span, b: Span) -> bool:
    return a[0] < b[1] and b[0] < a[1]


def _lobes(rows: list[tuple[float, list[Span]]],
           spans_at) -> list[list[tuple[float, float, float]]]:
    """Chain row spans into lobes of (y, left, right).

    A lobe that begins or ends because its neighbour row split or merged is
    extended half a row into that neighbour, so the subpaths overlap instead of
    meeting on a zero-height edge where a seam could show through.
    """
    closed: list[list[tuple[float, float, float]]] = []
    open_lobes: list[list[tuple[float, float, float]]] = []
    prev_y: float | None = None

    for y, spans in rows:
        linked: list[list[tuple[float, float, float]]] = []
        for span in spans:
            parents = [lb for lb in open_lobes if _overlap((lb[-1][1], lb[-1][2]), span)]
            if len(parents) == 1 and sum(
                1 for s in spans if _overlap((parents[0][-1][1], parents[0][-1][2]), s)
            ) == 1:
                lobe = parents[0]
            else:
                # A split, a merge, or a span with no predecessor. Start a lobe;
                # where it has parents, reach half a row back into them. The
                # start is clamped into the parent's own span, so the extension
                # can never leave the region the parents already cover.
                lobe = []
                if parents and prev_y is not None:
                    mid = (y + prev_y) / 2.0
                    lo = max(span[0], min(p[-1][1] for p in parents))
                    hi = min(span[1], max(p[-1][2] for p in parents))
                    # Clamp into the core as it actually is at `mid`. Carrying
                    # a neighbouring row's width into the gap between rows
                    # pushes the extension outside the silhouette wherever the
                    # contour tapers.
                    for a, b in spans_at(mid):
                        if a < hi and lo < b:
                            lo, hi = max(lo, a), min(hi, b)
                            break
                    else:
                        lo = hi = 0.0
                    if hi > lo:
                        lobe.append((mid, lo, hi))
            lobe.append((y, span[0], span[1]))
            linked.append(lobe)

        linked_ids = {id(lb) for lb in linked}
        for lobe in open_lobes:
            if id(lobe) not in linked_ids:
                closed.append(lobe)
        open_lobes = linked
        prev_y = y

    closed.extend(open_lobes)
    return [lb for lb in closed if len(lb) >= 2]


def _simplify(points: list[tuple[float, float]], tol: float) -> list[tuple[float, float]]:
    """Ramer-Douglas-Peucker, iterative so a long chain cannot blow the stack."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        ax, ay = points[i]
        bx, by = points[j]
        dx, dy = bx - ax, by - ay
        norm = (dx * dx + dy * dy) ** 0.5
        worst, worst_k = -1.0, -1
        for k in range(i + 1, j):
            px, py = points[k]
            if norm == 0:
                dist = ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
            else:
                dist = abs(dy * px - dx * py + bx * ay - by * ax) / norm
            if dist > worst:
                worst, worst_k = dist, k
        if worst > tol:
            keep[worst_k] = True
            stack.append((i, worst_k))
            stack.append((worst_k, j))
    return [p for p, k in zip(points, keep) if k]


# `svgpath.serialize` emits RELATIVE commands, so its rounding accumulates
# along the chain: measured at 0.357 u over 120 points at 2 decimals, against
# 0.012 u at 3. A core chain is long and mostly straight, and where the
# silhouette's shoulder runs nearly horizontal a drift of even a tenth in y
# moves the contour a whole unit in x — far enough to put the core outside the
# tooth. The third decimal costs ~30% of a path that is under a kilobyte.
PRECISION = 3


def _lobe_d(lobe: list[tuple[float, float, float]], prec: int = PRECISION) -> str:
    left = _simplify([(x0, y) for y, x0, _ in lobe], SIMPLIFY_U)
    right = _simplify([(x1, y) for y, _, x1 in lobe], SIMPLIFY_U)
    ring = left + right[::-1]
    cmds = [("M", [ring[0][0], ring[0][1]])]
    cmds += [("L", [x, y]) for x, y in ring[1:]]
    cmds.append(("Z", []))
    return svgpath.serialize(cmds, prec=prec)


def dentin_d(base_d: str, *, cej: float, occl: float, apex: float,
             exposed: bool = False) -> str:
    """Path data for the dentin core of ``base_d``, or "" if there is none."""
    lobes = _lobes(
        _rows(base_d, cej, occl, apex, exposed),
        lambda y: _inset_spans(base_d, y, cej, occl, exposed),
    )
    return " ".join(_lobe_d(lb) for lb in lobes)


# Nested deliberately: unset, the core is the body colour and the boundary is
# invisible; set `--odon-tooth-body` alone and the core follows it, so colouring
# the tooth through the documented field cannot expose an undocumented seam.
STYLE = "fill: var(--odon-tooth-dentin, var(--odon-tooth-body, #ebebeb))"

# The silhouettes that get a core, and whether their enamel is gone. A prepared
# crown has been ground away, so what is left of it IS dentin up to a
# cementum-thin rim; the seven broken variants are irregular contours and are
# deliberately not here yet.
OWNERS: tuple[tuple[str, bool], ...] = (
    ("tooth-base", False),
    ("tooth-crownprep", True),
    ("tooth-radix", False),
)

# The closing quote is the delimiter, so this cannot run on into
# `tooth-base-beauty`; a \b after it would never match, because a quote and a
# space are both non-word characters.
TAG_RE = r'<path id="%s"[^>]*/>'


def insert_layers(txt: str, *, cej: float, occl: float,
                  apex: float) -> tuple[str, dict[str, int]]:
    """Add a `<owner>-dentin` path after each silhouette that gets a core.

    Each core inherits its owner's initial visibility, so a hidden variant does
    not ship a visible core; the engine keeps the pair in step from there.
    """
    counts: dict[str, int] = {}
    for owner, exposed in OWNERS:
        m = re.search(TAG_RE % re.escape(owner), txt)
        if not m:
            continue
        owner_tag = m.group(0)
        dm = re.search(r'\sd="([^"]+)"', owner_tag)
        if not dm:
            continue
        d = dentin_d(dm.group(1), cej=cej, occl=occl, apex=apex, exposed=exposed)
        if not d:
            continue
        hidden = "display: none" in owner_tag
        style = ("display: none; " if hidden else "") + STYLE
        tag = f'<path id="{owner}-dentin" d="{d}" data-active="1" style="{style}" />'
        txt = txt[:m.end()] + tag + txt[m.end():]
        counts[owner] = d.count("M")
    return txt, counts


def contains(base_d: str, dentin: str, *, margin: float = 0.0) -> list[tuple[float, float]]:
    """Points of ``dentin`` that fall outside ``base_d`` — empty when nested.

    The verification counterpart of `dentin_d`: an inset that escapes its own
    silhouette is the one failure mode that would be visible on the chart and
    invisible in a diff.
    """
    bad: list[tuple[float, float]] = []
    for sub in roots._polylines(dentin):
        for x, y in sub:
            xs = roots.crossings_at(base_d, y)
            inside = any(a - margin <= x <= b + margin
                         for a, b in zip(xs[0::2], xs[1::2]))
            if not inside:
                bad.append((x, y))
    return bad
