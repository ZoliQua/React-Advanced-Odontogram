"""Clinical overlay registration invariants for generated measured SVG assets."""

from __future__ import annotations

import re
import unittest
import xml.etree.ElementTree as ET

from tools.toothgen import build, occlusal, roots, spec, verify


def by_id(root: ET.Element, element_id: str) -> ET.Element | None:
    return next((el for el in root.iter() if el.get("id") == element_id), None)


def extent(el: ET.Element) -> tuple[float, float, float, float]:
    paths = [child.get("d", "") for child in el.iter() if child.get("d")]
    if el.get("d"):
        paths.insert(0, el.get("d", ""))
    boxes = [build.curve_extent(path) for path in paths if path]
    return (
        min(box[0] for box in boxes),
        min(box[1] for box in boxes),
        max(box[2] for box in boxes),
        max(box[3] for box in boxes),
    )


class SideRegistrationMetadataTests(unittest.TestCase):
    def test_every_side_template_publishes_anatomical_registration(self) -> None:
        for item in spec.SPECS + spec.PRIMARY_SPECS:
            root = ET.parse(build.GENERATED_ASSETS / f"{item.key}.svg").getroot()
            self.assertEqual(root.get("data-tooth-template"), item.key)
            self.assertEqual(root.get("data-root-count"), str(item.roots))
            for name in (
                "data-cej-y",
                "data-cervical-left",
                "data-cervical-right",
                "data-implant-platform-y",
                "data-implant-left",
                "data-implant-right",
                "data-bridge-anchor-y",
                "data-bridge-anchor-height",
            ):
                self.assertIsNotNone(root.get(name), f"{item.key}: missing {name}")
            if item.roots > 1:
                self.assertIsNotNone(root.get("data-furcation-y"), item.key)

    def test_all_bridge_connectors_are_bounded_and_intersect_the_crown(self) -> None:
        tolerance = 0.05
        for item in spec.SPECS + spec.PRIMARY_SPECS:
            root = ET.parse(build.GENERATED_ASSETS / f"{item.key}.svg").getroot()
            vb_x, vb_y, vb_w, vb_h = map(float, root.get("viewBox", "").split())
            crown = by_id(root, "tooth-base")
            self.assertIsNotNone(crown, item.key)
            crown_box = extent(crown)
            connectors = [
                el for el in root.iter()
                if (el.get("id") or "").endswith("-bridge-connector")
            ]
            self.assertGreater(len(connectors), 0, item.key)
            for connector in connectors:
                box = extent(connector)
                self.assertGreaterEqual(box[0], vb_x - tolerance, (item.key, connector.get("id"), box))
                self.assertGreaterEqual(box[1], vb_y - tolerance, (item.key, connector.get("id"), box))
                self.assertLessEqual(box[2], vb_x + vb_w + tolerance, (item.key, connector.get("id"), box))
                self.assertLessEqual(box[3], vb_y + vb_h + tolerance, (item.key, connector.get("id"), box))
                self.assertLess(box[0], crown_box[2], (item.key, connector.get("id")))
                self.assertGreater(box[2], crown_box[0], (item.key, connector.get("id")))
                self.assertLess(box[1], crown_box[3], (item.key, connector.get("id")))
                self.assertGreater(box[3], crown_box[1], (item.key, connector.get("id")))

    def test_crowns_and_wear_layers_are_not_clipped_by_the_viewbox(self) -> None:
        tolerance = 0.05
        for item in spec.SPECS + spec.PRIMARY_SPECS:
            root = ET.parse(build.GENERATED_ASSETS / f"{item.key}.svg").getroot()
            vb_x, vb_y, vb_w, vb_h = map(float, root.get("viewBox", "").split())
            clinical = [
                el for el in root.iter()
                if (el.get("id") or "").endswith("-crown")
                or el.get("id") in {"tooth-bruxism-wear", "tooth-bruxism-neck-wear"}
            ]
            for el in clinical:
                box = extent(el)
                self.assertGreaterEqual(box[0], vb_x - tolerance, (item.key, el.get("id"), box))
                self.assertGreaterEqual(box[1], vb_y - tolerance, (item.key, el.get("id"), box))
                self.assertLessEqual(box[2], vb_x + vb_w + tolerance, (item.key, el.get("id"), box))
                self.assertLessEqual(box[3], vb_y + vb_h + tolerance, (item.key, el.get("id"), box))

    def test_material_crowns_share_geometry_and_fit_the_class_crown_envelope(self) -> None:
        materials = ("zircon", "metal", "metal-ceramic", "gold", "emax", "gradia", "temporary")
        for item in spec.SPECS + spec.PRIMARY_SPECS:
            root = ET.parse(build.GENERATED_ASSETS / f"{item.key}.svg").getroot()
            tooth = by_id(root, "tooth-base")
            self.assertIsNotNone(tooth, item.key)
            tooth_d = tooth.get("d", "")
            cej = float(root.get("data-cej-y", "nan"))
            incisal = build.curve_extent(tooth_d)[3]
            crown_xs: list[float] = []
            for fraction in (0.05, 0.15, 0.3, 0.5, 0.7, 0.9, 0.98):
                crossings = roots.crossings_at(tooth_d, cej + (incisal - cej) * fraction)
                if len(crossings) >= 2:
                    crown_xs.extend((crossings[0], crossings[-1]))
            envelope = (min(crown_xs), cej, max(crown_xs), incisal)
            paths = []
            for material in materials:
                crown = by_id(root, f"{material}-crown")
                self.assertIsNotNone(crown, (item.key, material))
                paths.append(crown.get("d"))
                box = extent(crown)
                self.assertGreaterEqual(box[0], envelope[0] - 1.5, (item.key, material, box, envelope))
                self.assertLessEqual(box[2], envelope[2] + 1.5, (item.key, material, box, envelope))
                self.assertGreaterEqual(box[1], envelope[1] - 2.5, (item.key, material, box, envelope))
                self.assertLessEqual(box[3], envelope[3] + 2.5, (item.key, material, box, envelope))
            self.assertEqual(len(set(paths)), 1, f"{item.key}: material changed crown geometry")

    def test_surface_caries_and_fillings_stay_in_the_class_crown_region(self) -> None:
        surface_prefixes = ("caries-", "subcaries-", "filling-")
        excluded = {"caries-root", "caries-subcrown"}
        for item in spec.SPECS + spec.PRIMARY_SPECS:
            root = ET.parse(build.GENERATED_ASSETS / f"{item.key}.svg").getroot()
            tooth_d = by_id(root, "tooth-base").get("d", "")
            cej = float(root.get("data-cej-y", "nan"))
            incisal = build.curve_extent(tooth_d)[3]
            crown_xs: list[float] = []
            for fraction in (0.05, 0.15, 0.3, 0.5, 0.7, 0.9, 0.98):
                crossings = roots.crossings_at(tooth_d, cej + (incisal - cej) * fraction)
                if len(crossings) >= 2:
                    crown_xs.extend((crossings[0], crossings[-1]))
            envelope = (min(crown_xs), cej, max(crown_xs), incisal)
            for element in root.iter():
                element_id = element.get("id") or ""
                if element_id in excluded or not element_id.startswith(surface_prefixes):
                    continue
                if not element.get("d"):
                    continue
                box = extent(element)
                self.assertGreaterEqual(box[0], envelope[0] - 1.75, (item.key, element_id, box))
                self.assertLessEqual(box[2], envelope[2] + 1.75, (item.key, element_id, box))
                self.assertGreaterEqual(box[1], envelope[1] - 2.5, (item.key, element_id, box))
                self.assertLessEqual(box[3], envelope[3] + 2.5, (item.key, element_id, box))

    def test_root_caries_remains_cervical(self) -> None:
        for item in spec.SPECS + spec.PRIMARY_SPECS:
            root = ET.parse(build.GENERATED_ASSETS / f"{item.key}.svg").getroot()
            lesion = by_id(root, "caries-root")
            if lesion is None:
                continue
            cej = float(root.get("data-cej-y", "nan"))
            box = extent(lesion)
            self.assertLessEqual(abs((box[1] + box[3]) / 2 - cej), 10.0, (item.key, box, cej))

    def test_endo_fillings_and_posts_remain_inside_root_envelope(self) -> None:
        layer_ids = (
            "tooth-healthy-pulp", "endo-medical-filling", "endo-filling-incomplete",
            "endo-filling", "endo-glass-pin", "endo-metal-pin",
        )

        def distance_to_segment(point, start, end) -> float:
            px, py = point
            ax, ay = start
            bx, by = end
            dx, dy = bx - ax, by - ay
            denom = dx * dx + dy * dy
            if denom == 0:
                return ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
            t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / denom))
            qx, qy = ax + t * dx, ay + t * dy
            return ((px - qx) ** 2 + (py - qy) ** 2) ** 0.5

        for item in spec.SPECS + spec.PRIMARY_SPECS:
            root = ET.parse(build.GENERATED_ASSETS / f"{item.key}.svg").getroot()
            tooth_d = by_id(root, "tooth-base").get("d", "")
            tooth_segments = verify._segments(tooth_d)
            apex = build.curve_extent(tooth_d)[1]
            cej = float(root.get("data-cej-y", "nan"))
            for layer_id in layer_ids:
                layer = by_id(root, layer_id)
                self.assertIsNotNone(layer, (item.key, layer_id))
                paths = []
                if layer.get("d"):
                    paths.append(layer.get("d"))
                paths.extend(child.get("d") for child in layer.iter() if child is not layer and child.get("d"))
                polylines = [polyline for path in paths for polyline in roots._polylines(path)]
                for polyline in polylines:
                    for point in polyline:
                        if verify._inside(point, tooth_segments):
                            continue
                        nearest = min(distance_to_segment(point, start, end) for start, end in tooth_segments)
                        self.assertLessEqual(nearest, 0.5, (item.key, layer_id, point, nearest))
                if layer_id == "endo-filling":
                    counts = [
                        len(roots.spans_at(polylines, apex + (cej - apex) * fraction))
                        for fraction in (0.25, 0.5, 0.75)
                    ]
                    self.assertLessEqual(max(counts), item.roots, (item.key, counts))
                    self.assertEqual(max(counts), item.roots, (item.key, counts))


class OcclusalRegistrationMetadataTests(unittest.TestCase):
    def test_every_occlusal_template_publishes_crown_and_bridge_anchors(self) -> None:
        for item in occlusal.OCCL_SPECS:
            root = ET.parse(build.GENERATED_ASSETS / f"{item.key}.svg").getroot()
            self.assertEqual(root.get("data-tooth-template"), item.key)
            for name in (
                "data-crown-left",
                "data-crown-right",
                "data-bridge-anchor-y",
                "data-bridge-anchor-height",
            ):
                self.assertIsNotNone(root.get(name), f"{item.key}: missing {name}")

    def test_generated_ids_are_unique(self) -> None:
        files = [build.GENERATED_ASSETS / f"{s.key}.svg" for s in spec.SPECS + spec.PRIMARY_SPECS]
        files += [build.GENERATED_ASSETS / f"{s.key}.svg" for s in occlusal.OCCL_SPECS]
        for path in files:
            ids = re.findall(r'\bid="([^"]+)"', path.read_text())
            self.assertEqual(len(ids), len(set(ids)), path.name)


if __name__ == "__main__":
    unittest.main()
