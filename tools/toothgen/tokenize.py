"""Rewrite literal colours in the hand-drawn sources as palette tokens.

The generator copies style attributes through untouched, so tokenizing the six
donor SVGs is enough for all 40 generated templates. The six classic assets are
not generated, so they are rewritten in place by the same pass.

Idempotent: a declaration that already reads `var(--odon-…, #hex)` is left
alone, so this can be re-run after editing a source drawing.

Usage::

    python3 tools/toothgen/tokenize.py            # report only, writes nothing
    python3 tools/toothgen/tokenize.py --write    # apply
    python3 tools/toothgen/tokenize.py --audit    # list what stays literal

Run `build.py` afterwards to propagate into `src/assets/teeth-svgs/measured/`.
"""

from __future__ import annotations

import argparse
import collections
import re
import sys
from pathlib import Path

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from toothgen import palette
else:
    from . import palette

ROOT = Path(__file__).resolve().parents[2]
DONORS = sorted((ROOT / "tools/toothgen/source").glob("*.svg"))
CLASSIC = sorted(p for p in (ROOT / "src/assets/teeth-svgs").glob("*.svg"))

TAG = re.compile(r"<(/?)([A-Za-z][\w:.-]*)((?:[^>\"']|\"[^\"]*\"|'[^']*')*?)(/?)>", re.S)
ID_ATTR = re.compile(r'\bid\s*=\s*"([^"]*)"')
STYLE_ATTR = re.compile(r'\bstyle\s*=\s*"([^"]*)"')
DECL = re.compile(r"(^|;)(\s*)(fill|stroke)(\s*:\s*)([^;]+)")

VOID = {"path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "use", "image", "stop"}


def _rewrite_style(style: str, path: str, stats: collections.Counter,
                   literals: collections.Counter) -> str:
    """Replace every themable literal in one style attribute."""
    def sub(m: re.Match[str]) -> str:
        head, space, prop, sep, value = m.groups()
        raw = value.strip()
        low = raw.lower()
        if low == "none" or low.startswith("var(") or low.startswith("url("):
            return m.group(0)
        token = palette.lookup(path, prop, low)
        if token is None:
            literals[f"{path}  {prop}:{low}"] += 1
            return m.group(0)
        stats[token] += 1
        return f"{head}{space}{prop}{sep}var({token}, {raw})"
    return DECL.sub(sub, style)


def process(text: str, stats: collections.Counter,
            literals: collections.Counter) -> str:
    """Walk the markup, tracking the id chain, and rewrite style attributes."""
    out: list[str] = []
    cursor = 0
    stack: list[str | None] = []
    for m in TAG.finditer(text):
        closing, name, attrs, selfclose = m.groups()
        if name in ("defs", "style") and not closing:
            pass  # still tracked below; rules never match inside them anyway
        if closing:
            if stack:
                stack.pop()
            continue
        # The root <svg> carries a per-template id (`incisor_x5F_tooth`, …);
        # it is not part of the semantic layer path the rules are written
        # against, so it never enters the chain.
        own = None if name == "svg" else ID_ATTR.search(attrs)
        chain = [i for i in stack if i] + ([own.group(1)] if own else [])
        path = "/".join(chain)
        sm = STYLE_ATTR.search(attrs)
        if sm:
            new_style = _rewrite_style(sm.group(1), path, stats, literals)
            if new_style != sm.group(1):
                a0, a1 = m.start(3) + sm.start(1), m.start(3) + sm.end(1)
                out.append(text[cursor:a0])
                out.append(new_style)
                cursor = a1
        if not (selfclose or name in VOID):
            stack.append(own.group(1) if own else None)
    out.append(text[cursor:])
    return "".join(out)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true", help="apply the rewrite")
    ap.add_argument("--audit", action="store_true", help="list declarations left literal")
    args = ap.parse_args()

    stats: collections.Counter = collections.Counter()
    literals: collections.Counter = collections.Counter()
    changed = 0

    for p in DONORS + CLASSIC:
        text = p.read_text()
        new = process(text, stats, literals)
        if new != text:
            changed += 1
            if args.write:
                p.write_text(new)
        print(f"{'rewrote' if new != text else 'unchanged':10} {p.relative_to(ROOT)}")

    print(f"\n{sum(stats.values())} declarations tokenized across {len(stats)} tokens"
          f" in {changed} file(s){'' if args.write else '  (dry run — pass --write)'}")

    unused = sorted(set(palette.TOKENS) - set(stats) - set(palette.SYNTHESIZED.values()))
    if unused:
        print(f"\ntokens in the table that matched nothing ({len(unused)}):")
        for t in unused:
            print(f"  {t}")

    if args.audit:
        print(f"\ndeclarations left literal ({sum(literals.values())}):")
        for key, n in literals.most_common():
            print(f"  {n:5}  {key}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
