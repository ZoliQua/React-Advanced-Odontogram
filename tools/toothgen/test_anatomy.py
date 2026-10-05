"""Regression tests for the canonical dental-anatomy specification.

These tests intentionally avoid parsing generator implementation details.  The
public contract is the explicit class map and the location/topology of assets it
produces.
"""

from __future__ import annotations

import unittest
from pathlib import Path

from tools.toothgen import build, check_roundtrip, occlusal, spec, verify


class PermanentMappingTests(unittest.TestCase):
    def test_each_clinically_distinct_permanent_class_has_a_template(self) -> None:
        self.assertEqual(
            [s.key for s in spec.SPECS],
            [
                "11", "12", "13", "14", "15", "16", "17", "18",
                "31", "32", "33", "34", "35", "36", "37", "38",
            ],
        )

    def test_permanent_fdi_mapping_is_explicit_and_complete(self) -> None:
        expected = {
            11: "11", 21: "11", 12: "12", 22: "12", 13: "13", 23: "13",
            14: "14", 24: "14", 15: "15", 25: "15", 16: "16", 26: "16",
            17: "17", 27: "17", 18: "18", 28: "18", 31: "31", 41: "31",
            32: "32", 42: "32", 33: "33", 43: "33", 34: "34", 44: "34",
            35: "35", 45: "35", 36: "36", 46: "36", 37: "37", 47: "37",
            38: "38", 48: "38",
        }
        self.assertEqual(spec.tooth_to_template(), expected)
        self.assertEqual(spec.check_coverage(), [])

    def test_premolar_and_molar_root_topology_is_class_specific(self) -> None:
        by_key = {s.key: s for s in spec.SPECS}
        self.assertEqual(
            {key: by_key[key].roots for key in ("14", "15", "34", "35")},
            {"14": 2, "15": 1, "34": 1, "35": 1},
        )
        self.assertEqual(
            {key: by_key[key].roots for key in ("16", "17", "18")},
            {"16": 3, "17": 3, "18": 3},
        )
        self.assertEqual(
            {key: by_key[key].roots for key in ("36", "37", "38")},
            {"36": 2, "37": 2, "38": 2},
        )

    def test_posterior_sequence_changes_shape_not_only_dimensions(self) -> None:
        by_key = {s.key: s for s in spec.SPECS}
        self.assertGreater(by_key["16"].root_spread, by_key["17"].root_spread)
        self.assertGreater(by_key["17"].root_spread, by_key["18"].root_spread)
        self.assertGreater(by_key["36"].root_spread, by_key["37"].root_spread)
        self.assertGreater(by_key["37"].root_spread, by_key["38"].root_spread)
        self.assertNotEqual(by_key["34"].crown_taper, by_key["35"].crown_taper)

    def test_anterior_proportions_preserve_clinically_useful_ordering(self) -> None:
        by_key = {s.key: s for s in spec.SPECS}
        self.assertGreater(by_key["13"].length_rel, by_key["11"].length_rel)
        self.assertGreater(by_key["13"].length_rel, by_key["14"].length_rel)
        self.assertLess(by_key["31"].width_frac, by_key["11"].width_frac)
        self.assertLess(by_key["33"].width_frac, by_key["13"].width_frac)


class PrimaryMappingTests(unittest.TestCase):
    def test_primary_classes_do_not_collapse_arch_or_incisor_morphology(self) -> None:
        self.assertEqual(
            [s.key for s in spec.PRIMARY_SPECS],
            ["51", "52", "53", "54", "55", "71", "72", "73", "74", "75"],
        )
        self.assertEqual(spec.primary_coverage(), [])
        assignments = [tooth for item in spec.PRIMARY_SPECS for tooth in item.teeth]
        self.assertEqual(len(assignments), 20)
        self.assertEqual(len(set(assignments)), 20)

    def test_primary_molars_keep_arch_specific_root_counts(self) -> None:
        by_key = {s.key: s for s in spec.PRIMARY_SPECS}
        self.assertEqual([by_key[k].roots for k in ("54", "55")], [3, 3])
        self.assertEqual([by_key[k].roots for k in ("74", "75")], [2, 2])
        for key in ("54", "55", "74", "75"):
            self.assertTrue(by_key[key].primary)

    def test_primary_assets_use_their_permanent_position_column(self) -> None:
        permanent = {s.key: s for s in spec.SPECS}
        primary = {s.key: s for s in spec.PRIMARY_SPECS}
        position_pairs = {
            "51":"11", "52":"12", "53":"13", "54":"14", "55":"15",
            "71":"31", "72":"32", "73":"33", "74":"34", "75":"35",
        }
        for primary_key, permanent_key in position_pairs.items():
            self.assertEqual(primary[primary_key].col_px, permanent[permanent_key].col_px)

    def test_primary_crowns_have_explicit_cervical_bulbosity(self) -> None:
        for item in spec.PRIMARY_SPECS:
            self.assertGreater(item.cervical_bulge, 0.0, item.key)


class GeneratorContractTests(unittest.TestCase):
    def test_generated_assets_have_a_separate_default_directory(self) -> None:
        expected = (
            Path(__file__).resolve().parents[2]
            / "src"
            / "assets"
            / "teeth-svgs"
            / "measured"
        )
        self.assertEqual(build.GENERATED_ASSETS, expected)
        self.assertNotEqual(build.GENERATED_ASSETS, build.CLASSIC_ASSETS)

    def test_no_argument_build_covers_both_dentitions(self) -> None:
        self.assertEqual(build.DEFAULT_SET, "all")
        self.assertEqual(build.LEGACY_GENERATED_FILES, ("46.svg", "46_occl.svg"))

    def test_verifier_defaults_to_all_generated_assets_and_real_stylesheet(self) -> None:
        self.assertEqual(verify.DEFAULT_SET, "all")
        self.assertEqual(
            verify.INDEX_CSS,
            Path(__file__).resolve().parents[2] / "src" / "index.css",
        )

    def test_every_reviewed_generated_class_has_a_geometry_fingerprint(self) -> None:
        self.assertEqual(
            set(verify.AUTHORED_GEOMETRY_SHA256),
            {item.key for item in spec.SPECS + spec.PRIMARY_SPECS},
        )
        self.assertEqual(
            set(verify.OCCLUSAL_GEOMETRY_SHA256),
            {item.key for item in occlusal.OCCL_SPECS},
        )

    def test_roundtrip_covers_sources_classic_and_generated_assets(self) -> None:
        self.assertEqual(
            [name for name, _ in check_roundtrip.ASSET_GROUPS],
            ["canonical source", "classic runtime", "generated measured"],
        )


class OcclusalMappingTests(unittest.TestCase):
    def test_each_posterior_class_has_explicit_occlusal_geometry(self) -> None:
        self.assertEqual(
            [item.key for item in occlusal.OCCL_SPECS],
            [
                "14_occl", "15_occl", "34_occl", "35_occl",
                "16_occl", "17_occl", "18_occl",
                "36_occl", "37_occl", "38_occl",
                "54_occl", "55_occl", "74_occl", "75_occl",
            ],
        )

    def test_occlusal_fdi_assignments_are_unique_and_complete(self) -> None:
        permanent = [
            tooth
            for item in occlusal.OCCL_SPECS
            if not item.primary
            for tooth in item.teeth
        ]
        primary = [
            tooth
            for item in occlusal.OCCL_SPECS
            if item.primary
            for tooth in item.teeth
        ]
        self.assertEqual(len(permanent), 20)
        self.assertEqual(len(set(permanent)), 20)
        self.assertEqual(len(primary), 8)
        self.assertEqual(len(set(primary)), 8)

    def test_cusp_topology_and_grooves_are_anatomy_class_specific(self) -> None:
        by_key = {item.key: item for item in occlusal.OCCL_SPECS}
        self.assertEqual(
            {key: by_key[key].cusp_count for key in by_key},
            {
                "14_occl": 2, "15_occl": 2,
                "34_occl": 2, "35_occl": 3,
                "16_occl": 4, "17_occl": 4, "18_occl": 3,
                "36_occl": 5, "37_occl": 4, "38_occl": 4,
                "54_occl": 4, "55_occl": 4,
                "74_occl": 4, "75_occl": 5,
            },
        )
        self.assertEqual(by_key["16_occl"].groove_pattern, "oblique")
        self.assertEqual(by_key["36_occl"].groove_pattern, "y5")
        self.assertEqual(by_key["37_occl"].groove_pattern, "cross")
        self.assertNotEqual(
            by_key["34_occl"].groove_pattern,
            by_key["35_occl"].groove_pattern,
        )

    def test_primary_occlusal_donor_contains_primary_clinical_layers(self) -> None:
        for item in occlusal.OCCL_SPECS:
            if not item.primary:
                continue
            donor = (build.SOURCE / f"{item.src}.svg").read_text()
            self.assertIn('id="milktooth-base"', donor, item.key)


if __name__ == "__main__":
    unittest.main()
