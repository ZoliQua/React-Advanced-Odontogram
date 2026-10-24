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
    """The id chain the ENSURE rule is written against."""
    return f'<svg id="x"><g id="restorations"><g id="implant">{inner}</g></g></svg>'


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
    assert palette.lookup_ensure("restorations/implant/implant-base")
    assert not palette.lookup_ensure("restorations/implant")
    assert not palette.lookup_ensure("restorations/implant/implant-base/inner")


def test_every_ensured_token_is_in_the_inventory():
    for _path, _prop, token, fallback in palette.ENSURE:
        assert token in palette.TOKENS, f"{token} missing from the palette table"
        assert palette.TOKENS[token][0] == fallback, (
            f"{token}: the inserted fallback must be the table's default")
