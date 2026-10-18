"""Regression tests for the derived dentin core.

The shape itself is a drawing and is judged by eye. What is tested here is what
a drawing cannot tell you: that the thickness follows the clinical profile, that
the core splits where the tooth does, and that it never leaves the silhouette it
was derived from — on the SHIPPED assets, not on a freshly computed path, so the
serialized file is what gets checked.
"""

from __future__ import annotations

import re
import unittest
from pathlib import Path

from tools.toothgen import dentin, roots, spec

ASSETS = Path(__file__).resolve().parents[2] / "src/assets/teeth-svgs/measured"
META_RE = re.compile(r"apex=([-\d.]+) cej=([-\d.]+) occl=([-\d.]+)")

# A rectangle 10 mm wide and 20 mm tall, cervical line halfway up. Straight
# flanks make every expected number exact.
U = spec.UNITS_PER_MM
RECT_APEX, RECT_CEJ, RECT_OCCL = 0.0, 10 * U, 20 * U
RECT = f"M 0,{RECT_APEX} L {10 * U},{RECT_APEX} L {10 * U},{RECT_OCCL} L 0,{RECT_OCCL} Z"


def _points(d: str) -> list[tuple[float, float]]:
    """Absolute points of a path. `dentin_d` writes relative commands, so the
    numbers in the string itself are deltas and cannot be read directly."""
    return [pt for sub in roots._polylines(d) for pt in sub]


def _templates() -> list[tuple[str, str]]:
    return [(p.stem, p.read_text()) for p in sorted(ASSETS.glob("*.svg"))
            if not p.stem.endswith("_occl")]


class ThicknessProfileTests(unittest.TestCase):
    def test_root_carries_a_cementum_hairline(self) -> None:
        for frac in (0.1, 0.5, 0.99):
            y = RECT_CEJ * frac
            self.assertAlmostEqual(
                dentin.half_thickness(y, RECT_CEJ, RECT_OCCL),
                dentin.CEMENTUM_MM * U,
            )

    def test_enamel_runs_out_at_the_cervical_line(self) -> None:
        self.assertAlmostEqual(
            dentin.half_thickness(RECT_CEJ, RECT_CEJ, RECT_OCCL),
            dentin.CEMENTUM_MM * U,
        )
        # Above the line the enamel has not started yet, so the core keeps the
        # same rim it has along the root instead of stepping out.
        just_above = dentin.half_thickness(RECT_CEJ + 0.01, RECT_CEJ, RECT_OCCL)
        self.assertAlmostEqual(just_above, dentin.CEMENTUM_MM * U)

    def test_enamel_is_thickest_at_the_occlusal_surface(self) -> None:
        self.assertAlmostEqual(
            dentin.half_thickness(RECT_OCCL, RECT_CEJ, RECT_OCCL),
            dentin.CUSP_MM * U,
        )

    def test_thickness_grows_monotonically_up_the_crown(self) -> None:
        values = [
            dentin.half_thickness(RECT_CEJ + (RECT_OCCL - RECT_CEJ) * f,
                                  RECT_CEJ, RECT_OCCL)
            for f in (0.0, 0.25, 0.5, 0.75, 1.0)
        ]
        self.assertEqual(values, sorted(values))

    def test_a_prepared_crown_is_dentin_up_to_a_rim(self) -> None:
        mid_crown = RECT_CEJ + (RECT_OCCL - RECT_CEJ) * 0.5
        self.assertAlmostEqual(
            dentin.half_thickness(mid_crown, RECT_CEJ, RECT_OCCL, exposed=True),
            dentin.CEMENTUM_MM * U,
        )


class GeometryTests(unittest.TestCase):
    def test_core_of_a_rectangle_is_inset_by_the_enamel_thickness(self) -> None:
        # The widest part of the core is the root, where only cementum is
        # subtracted; the crown is pulled in by the enamel on top of that.
        xs = [x for x, _ in _points(
            dentin.dentin_d(RECT, cej=RECT_CEJ, occl=RECT_OCCL, apex=RECT_APEX))]
        self.assertAlmostEqual(min(xs), dentin.CEMENTUM_MM * U, places=1)
        self.assertAlmostEqual(max(xs), 10 * U - dentin.CEMENTUM_MM * U, places=1)

    def test_the_crown_is_pulled_in_further_than_the_root(self) -> None:
        pts = _points(dentin.dentin_d(RECT, cej=RECT_CEJ, occl=RECT_OCCL,
                                      apex=RECT_APEX))
        crown = [x for x, y in pts if y > RECT_CEJ + (RECT_OCCL - RECT_CEJ) * 0.7]
        self.assertGreater(min(crown), dentin.CUSP_MM * U * 0.7)

    def test_core_stops_short_of_the_occlusal_surface(self) -> None:
        ys = [y for _, y in _points(
            dentin.dentin_d(RECT, cej=RECT_CEJ, occl=RECT_OCCL, apex=RECT_APEX))]
        self.assertLessEqual(max(ys), RECT_OCCL - dentin.CUSP_MM * U + 0.5)

    def test_a_two_root_silhouette_splits_into_two_lobes(self) -> None:
        # Two 4 mm roots on a shared crown: a notch cut down from the apex.
        w, half = 10 * U, 5 * U
        notch = 6 * U
        d = (f"M 0,{RECT_APEX} L {4 * U},{RECT_APEX} L {4 * U},{notch} "
             f"L {6 * U},{notch} L {6 * U},{RECT_APEX} L {w},{RECT_APEX} "
             f"L {w},{RECT_OCCL} L 0,{RECT_OCCL} Z")
        core = dentin.dentin_d(d, cej=half, occl=RECT_OCCL, apex=RECT_APEX)
        self.assertGreaterEqual(core.count("M"), 3)
        self.assertEqual(dentin.contains(d, core, margin=0.02), [])

    def test_a_wobble_does_not_become_a_floating_speck(self) -> None:
        # A notch two rows deep in an otherwise straight flank used to chain
        # into a lobe of its own — 0.04 mm tall on template 35, invisible until
        # someone themes the dentin and finds a speck in the crown.
        w, nick = 10 * U, 0.1 * U
        d = (f"M 0,{RECT_APEX} L {w},{RECT_APEX} L {w},{RECT_OCCL} "
             f"L {w / 2 + nick},{RECT_OCCL} L {w / 2},{RECT_OCCL - nick} "
             f"L {w / 2 - nick},{RECT_OCCL} L 0,{RECT_OCCL} Z")
        core = dentin.dentin_d(d, cej=RECT_CEJ, occl=RECT_OCCL, apex=RECT_APEX)
        for lobe in roots._polylines(core):
            ys = [y for _, y in lobe]
            self.assertGreaterEqual(max(ys) - min(ys), dentin.MIN_LOBE_MM * U * 0.99)

    def test_derivation_is_deterministic(self) -> None:
        args = dict(cej=RECT_CEJ, occl=RECT_OCCL, apex=RECT_APEX)
        self.assertEqual(dentin.dentin_d(RECT, **args), dentin.dentin_d(RECT, **args))

    def test_a_silhouette_too_short_to_hold_a_core_gets_none(self) -> None:
        tiny = f"M 0,0 L {0.2 * U},0 L {0.2 * U},{0.5 * U} L 0,{0.5 * U} Z"
        self.assertEqual(
            dentin.dentin_d(tiny, cej=0.2 * U, occl=0.5 * U, apex=0.0), ""
        )


class ShippedAssetTests(unittest.TestCase):
    def test_every_side_template_carries_a_core_for_each_owner(self) -> None:
        for key, txt in _templates():
            for owner, _exposed in dentin.OWNERS:
                with self.subTest(template=key, owner=owner):
                    self.assertIsNotNone(
                        re.search(dentin.TAG_RE % re.escape(owner + "-dentin"), txt)
                    )

    def test_no_core_leaves_its_silhouette(self) -> None:
        for key, txt in _templates():
            for owner, _exposed in dentin.OWNERS:
                own = re.search(dentin.TAG_RE % re.escape(owner), txt)
                core = re.search(dentin.TAG_RE % re.escape(owner + "-dentin"), txt)
                with self.subTest(template=key, owner=owner):
                    outside = dentin.contains(
                        re.search(r'\sd="([^"]+)"', own.group(0)).group(1),
                        re.search(r'\sd="([^"]+)"', core.group(0)).group(1),
                        margin=0.02,
                    )
                    self.assertEqual(outside, [])

    def test_cores_are_painted_through_the_nested_token(self) -> None:
        # Unset, the core takes the body colour and the boundary is invisible;
        # setting the body alone must not expose it.
        for key, txt in _templates():
            for owner, _exposed in dentin.OWNERS:
                core = re.search(dentin.TAG_RE % re.escape(owner + "-dentin"), txt)
                with self.subTest(template=key, owner=owner):
                    self.assertIn(
                        "fill: var(--odon-tooth-dentin, var(--odon-tooth-body,",
                        core.group(0),
                    )

    def test_a_core_ships_as_visible_as_its_owner(self) -> None:
        for key, txt in _templates():
            for owner, _exposed in dentin.OWNERS:
                own = re.search(dentin.TAG_RE % re.escape(owner), txt).group(0)
                core = re.search(dentin.TAG_RE % re.escape(owner + "-dentin"), txt).group(0)
                with self.subTest(template=key, owner=owner):
                    self.assertEqual(
                        "display: none" in own, "display: none" in core
                    )

    def test_no_shipped_lobe_is_a_sliver(self) -> None:
        for key, txt in _templates():
            for owner, _exposed in dentin.OWNERS:
                core = re.search(dentin.TAG_RE % re.escape(owner + "-dentin"), txt)
                d = re.search(r'\sd="([^"]+)"', core.group(0)).group(1)
                for i, lobe in enumerate(roots._polylines(d)):
                    ys = [y for _, y in lobe]
                    with self.subTest(template=key, owner=owner, lobe=i):
                        self.assertGreaterEqual(
                            (max(ys) - min(ys)) / U, dentin.MIN_LOBE_MM * 0.99
                        )

    def test_a_core_follows_a_space_less_display_none(self) -> None:
        # The variants ship "display: none"; nothing guarantees the spelling,
        # and matching the literal would put a visible core over a hidden
        # silhouette.
        self.assertTrue(dentin.HIDDEN_RE.search('style="display:none;fill:#fff"'))
        self.assertTrue(dentin.HIDDEN_RE.search('style="display: none; fill:#fff"'))
        self.assertIsNone(dentin.HIDDEN_RE.search('style="fill:#fff"'))
        tight = ('<path id="tooth-radix" d="%s" style="display:none;fill:#fff" />'
                 % RECT)
        out, _ = dentin.insert_layers(tight, cej=RECT_CEJ, occl=RECT_OCCL,
                                      apex=RECT_APEX)
        core = re.search(dentin.TAG_RE % "tooth-radix-dentin", out).group(0)
        self.assertIn("display: none", core)

    def test_occlusal_templates_have_no_core(self) -> None:
        # Nothing of the dentin is visible from above on an intact tooth.
        for path in sorted(ASSETS.glob("*_occl.svg")):
            with self.subTest(template=path.stem):
                self.assertNotIn("-dentin", path.read_text())


if __name__ == "__main__":
    unittest.main()
