"""Check that SVG path parsing and identity serialization preserve geometry."""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import svgpath  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
ASSET_GROUPS = (
    ("canonical source", Path(__file__).resolve().parent / "source"),
    ("classic runtime", ROOT / "src" / "assets" / "teeth-svgs"),
    ("generated measured", ROOT / "src" / "assets" / "teeth-svgs" / "measured"),
)
D_RE = re.compile(r'\sd="([^"]+)"')


def sample(d: str, n: int = 400):

    cmds = svgpath.to_absolute(d)
    pts = []
    cur = (0.0, 0.0)
    start = (0.0, 0.0)
    for cmd, a in cmds:
        if cmd == "M":
            cur = (a[0], a[1])
            start = cur
            pts.append(cur)
        elif cmd == "Z":
            pts.append(start)
            cur = start
        elif cmd == "L":
            p = (a[0], a[1])
            for k in range(1, 5):
                t = k / 4
                pts.append((cur[0] + (p[0] - cur[0]) * t, cur[1] + (p[1] - cur[1]) * t))
            cur = p
        elif cmd == "C":
            p0 = cur
            c1 = (a[0], a[1])
            c2 = (a[2], a[3])
            p3 = (a[4], a[5])
            for k in range(1, 9):
                t = k / 8
                mt = 1 - t
                pts.append(
                    (
                        mt**3 * p0[0]
                        + 3 * mt * mt * t * c1[0]
                        + 3 * mt * t * t * c2[0]
                        + t**3 * p3[0],
                        mt**3 * p0[1]
                        + 3 * mt * mt * t * c1[1]
                        + 3 * mt * t * t * c2[1]
                        + t**3 * p3[1],
                    )
                )
            cur = p3
    return pts


def hausdorff_ish(a, b):

    if len(a) == len(b):
        return max(
            (abs(p[0] - q[0]) + abs(p[1] - q[1]) for p, q in zip(a, b)), default=0.0
        )
    worst = 0.0
    for p in a:
        worst = max(worst, min(abs(p[0] - q[0]) + abs(p[1] - q[1]) for q in b))
    return worst


def main():
    ident = lambda x, y: (x, y)  # noqa: E731
    files = [
        (group, file)
        for group, directory in ASSET_GROUPS
        for file in sorted(directory.glob("*.svg"))
    ]
    total = 0
    worst_overall = 0.0
    worst_where = ""
    current_group = None
    for group, f in files:
        if group != current_group:
            print(f"\n[{group}]")
            current_group = group
        txt = f.read_text()
        ds = D_RE.findall(txt)
        worst = 0.0
        for d in ds:
            before = sample(d)
            out = svgpath.warp_path_d(d, ident, tol=0.05, prec=2)
            after = sample(out)
            err = hausdorff_ish(before, after)
            if err > worst:
                worst = err
        total += len(ds)
        flag = "OK " if worst < 0.05 else "!! "
        print(f"{flag}{f.name:34s} {len(ds):4d} paths   maximum deviation {worst:.4f}")
        if worst > worst_overall:
            worst_overall, worst_where = worst, f"{group}/{f.name}"
    print(
        f"\n{total} paths checked. Worst deviation {worst_overall:.4f} ({worst_where})"
    )
    print(
        "Tolerance 0.05 units (viewBox approximately 40x71) ->",
        "PASSED" if worst_overall < 0.05 else "FAILED",
    )
    return 0 if worst_overall < 0.05 else 1


if __name__ == "__main__":
    raise SystemExit(main())
