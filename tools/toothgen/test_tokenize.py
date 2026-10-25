"""The tokenizer's INSERTION half: declarations the artwork never carried.

`palette.RULES` rewrite a literal that is already in the markup, and the tests
for that live in the assets themselves. `palette.ENSURE` is the opposite
operation — it adds a declaration where there is none — and it has two ways to
go wrong that the asset checks would not catch: putting the declaration on the
wrong element, and not being idempotent.
"""

from __future__ import annotations

import collections
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from toothgen import palette, tokenize

TINT = 'filter: var(--odon-implant-tint, none);'


def run(markup: str) -> str:
    return tokenize.process(markup, collections.Counter(), collections.Counter())


def wrap(inner: str) -> str:
    """The id chain the implant ENSURE rule is written against."""
    return f'<svg id="x"><g id="restorations"><g id="implant">{inner}</g></g></svg>'


def doc(inner: str) -> str:
    """A bare template root: the <svg> id is never part of a layer path."""
    return f'<svg id="x">{inner}</svg>'


def test_inserts_on_the_named_layer():
    out = run(wrap('<g id="implant-base" data-active="1"><path d="M0 0"/></g>'))
    assert f'<g id="implant-base" data-active="1" style="{TINT}">' in out


def test_leaves_anonymous_children_alone():
    # The layer path is built from ids, so a child without one inherits its
    # parent's path. A prefix/looser match would give every child its own copy.
    out = run(wrap('<g id="implant-base"><path d="M0 0"/><path d="M1 1"/></g>'))
    assert out.count(TINT) == 1


def test_leaves_siblings_alone():
    out = run(wrap('<g id="implant-base"><path d="M0 0"/></g>'
                   '<path id="peri-implant-bone-loss" d="M2 2"/>'))
    assert out.count(TINT) == 1
    assert 'id="peri-implant-bone-loss" d="M2 2"/>' in out


def test_is_idempotent():
    once = run(wrap('<g id="implant-base"><path d="M0 0"/></g>'))
    assert run(once) == once


def test_appends_to_an_existing_style_without_disturbing_it():
    out = run(wrap('<g id="implant-base" style="display: none;"><path d="M0 0"/></g>'))
    assert f'style="display: none; {TINT}"' in out


def test_never_inserted_before_the_id():
    # build.py finds the fixture with a literal `<g id="implant-base"` search
    # (it reads the group to derive the implant platform anchors). An attribute
    # placed in front of the id would make that search miss, silently.
    out = run(wrap('<g id="implant-base" data-active="1"><path d="M0 0"/></g>'))
    assert '<g id="implant-base"' in out


def test_the_rule_matches_the_exact_path_only():
    assert palette.lookup_ensure("restorations/implant/implant-base", "g")
    assert not palette.lookup_ensure("restorations/implant", "g")
    assert not palette.lookup_ensure("restorations/implant/implant-base/inner", "g")


def test_the_rule_matches_the_element_type_too():
    # The same layer id is not always the same kind of element, and an
    # INHERITED property on a wrapping <g> reaches descendants the rule is not
    # about: `stroke-width` on an occlusal `tooth-base` group would widen the
    # fissures inside it. Each rule therefore names the types it may land on.
    assert palette.lookup_ensure("tooth/tooth-base", "path")
    assert not palette.lookup_ensure("tooth/tooth-base", "g")
    # …and the implant filter wants the group, which is not inherited.
    assert palette.lookup_ensure("restorations/implant/implant-base", "g")
    assert not palette.lookup_ensure("restorations/implant/implant-base", "path")


def test_the_width_is_not_inserted_on_a_group():
    # The regression the type guard exists for, end to end through the
    # rewriter: an occlusal `tooth-base` is a <g> holding the stroked
    # `fissure`, and neither may come out carrying a width.
    out = run(doc(
        '<g id="tooth"><g id="tooth-base" data-active="1">'
        '<path id="fissure" style="stroke: #c8c9c9;" d="M0 0"/>'
        "</g></g>"
    ))
    assert "--odon-tooth-outline-width" not in out


def test_the_width_is_inserted_on_the_painted_silhouette():
    out = run(doc('<g id="tooth"><path id="tooth-base" style="fill: #ebebeb;" d="M0 0"/></g>'))
    assert "stroke-width: var(--odon-tooth-outline-width, 1);" in out


def test_every_ensured_token_is_in_the_inventory():
    for _path, _prop, token, fallback, tags in palette.ENSURE:
        assert tags, f"{token}: a rule with no element type can never match"
        assert token in palette.TOKENS, f"{token} missing from the palette table"
        assert palette.TOKENS[token][0] == fallback, (
            f"{token}: the inserted fallback must be the table's default")


def test_the_contour_width_covers_every_silhouette_state():
    # The feature's whole point: one width across every drawing of the SAME
    # silhouette, so the contour does not change thickness when the tooth is
    # charted as a root remnant, a prepared crown or a fracture.
    widths = {
        path for path, prop, _token, _fb, _tags in palette.ENSURE
        if prop == "stroke-width"
    }
    for layer in (
        "tooth/tooth-base",
        "milktooth/milktooth-base",
        "tooth-variants/tooth-radix",
        "tooth-variants/tooth-crownprep",
        "tooth-variants/tooth-under-gum",
    ):
        assert layer in widths, f"{layer} would snap back to the default width"
    broken = {p for p in widths if "tooth-broken-" in p}
    assert len(broken) == 7, f"expected all seven fracture states, got {sorted(broken)}"
