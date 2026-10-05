"""Anatomy-derived registration helpers for generated clinical overlays.

This module owns geometry that must be regenerated from a transformed crown,
never copied or manually positioned in generated assets.
"""

from __future__ import annotations

import re
from collections.abc import Callable


def fmt(value: float) -> str:
    text = f"{value:.3f}".rstrip("0").rstrip(".")
    return "0" if text in ("-0", "") else text


def add_svg_attributes(text: str, attributes: dict[str, str | int | float]) -> str:
    rendered = " ".join(
        f'{name}="{fmt(value) if isinstance(value, float) else value}"'
        for name, value in attributes.items()
        if value is not None
    )
    return text.replace("<svg ", f"<svg {rendered} ", 1)


def _span_at(
    outline_d: str,
    y: float,
    crossings_at: Callable[[str, float], list[float]],
) -> tuple[float, float]:
    xs = crossings_at(outline_d, y)
    if len(xs) < 2:
        raise ValueError(f"outline has no closed span at y={y:.3f}")
    return xs[0], xs[-1]


def register_bridge_tabs(
    text: str,
    outline_d: str,
    center_y: float,
    height: float,
    crossings_at: Callable[[str, float], list[float]],
    x_bounds: tuple[float, float] | None = None,
) -> tuple[str, dict[str, float]]:
    """Replace every material connector with crown-intersecting proximal tabs.

    Both tabs stay inside the crown envelope. Their single path keeps every
    historical clinical id/material style intact, while the renderer bridges
    only the inter-unit gap using the path's measured bounding box.
    """

    y0 = center_y - height / 2.0
    y1 = center_y + height / 2.0
    left0, right0 = _span_at(outline_d, center_y, crossings_at)
    left1, right1 = _span_at(outline_d, y0, crossings_at)
    left2, right2 = _span_at(outline_d, y1, crossings_at)
    left = max(left0, left1, left2)
    right = min(right0, right1, right2)
    if x_bounds is not None:
        left = max(left, x_bounds[0])
        right = min(right, x_bounds[1])
    width = right - left
    if width <= height * 3:
        raise ValueError("crown is too narrow for two bridge connector tabs")
    depth = min(max(height * 1.25, width * 0.10), width * 0.22)
    left_inner = left + depth
    right_inner = right - depth
    d = (
        f"M{fmt(left)},{fmt(y0)}H{fmt(left_inner)}V{fmt(y1)}H{fmt(left)}Z "
        f"M{fmt(right_inner)},{fmt(y0)}H{fmt(right)}V{fmt(y1)}H{fmt(right_inner)}Z"
    )
    pattern = re.compile(r'(<path id="[^"]+-bridge-connector" d=")[^"]+("[^>]*>)')
    text, count = pattern.subn(lambda match: match.group(1) + d + match.group(2), text)
    if count == 0:
        raise ValueError("no bridge connector paths found")
    return text, {
        "left": left,
        "right": right,
        "y": center_y,
        "height": height,
    }


def normalize_crown_envelopes(text: str) -> str:
    """Use one anatomical crown envelope for every fixed material.

    Material is a style choice. Historical donors carried tiny material-specific
    contour differences, which made changing material also change the crown
    margin. The e.max path is used only as the canonical authored envelope;
    each destination keeps its own id and style.
    """

    match = re.search(r'<path id="emax-crown" d="([^"]+)"', text)
    if not match:
        raise ValueError("emax-crown path not found")
    crown_d = match.group(1)
    ids = (
        "zircon-crown", "metal-crown", "metal-ceramic-crown", "gold-crown",
        "emax-crown", "gradia-crown", "temporary-crown",
        "telescope-crown-outside", "prosthesis-crown",
    )
    for element_id in ids:
        text = re.sub(
            rf'(<path id="{re.escape(element_id)}" d=")[^"]+("[^>]*>)',
            lambda found: found.group(1) + crown_d + found.group(2),
            text,
            count=1,
        )
    return text
