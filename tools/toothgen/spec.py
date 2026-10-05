"""Literature-referenced anatomy and display targets for tooth generation.

Raw ratios remain the clinical source values. ``display_targets`` derives the
screen representation by applying one root-length compression factor without
changing relative tooth-class dimensions.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ToothSpec:
    key: str
    label: str
    source: str
    src_template: int
    root_frac: float
    width_frac: float
    roots: int
    # Explicit classification keeps anatomy decisions in one source of truth.
    arch: str = ""
    family: str = ""
    sequence: int = 0
    length_rel: float = 1.0
    furc_frac: float = 0.0
    teeth: tuple[int, ...] = field(default=())
    note: str = ""
    # Take the root from another source template instead of converting this
    # one's root count. See tools/toothgen/graft.py.
    graft_root_from: int | None = None
    # A primary tooth is not a permanent tooth drawn smaller. It carries its own
    # measured proportions above, and `primary` additionally requests the two
    # shape changes that separate the dentitions and cannot be expressed as
    # numbers: a relatively larger pulp, and roots that diverge around the
    # permanent germ. `size_scale` is the overall reduction on top of that.
    size_scale: float = 1.0
    primary: bool = False
    # Pull the roots TOWARDS each other (1.0 = as drawn, <1 = converge).
    #
    # A source that draws two roots well apart is showing the PROXIMAL aspect:
    # on an upper first premolar the buccal and palatal roots separate
    # bucco-palatally, along the line of sight. Every other template in the set
    # is a buccal view, where the palatal root stands BEHIND the buccal one and
    # shows only past its edge - a broad trunk that parts into two close tips
    # near the apex, the palatal one slightly shorter.
    #
    # Done as an x-map, so it composes with the vertical warp and every layer -
    # contour, canal, gum, bone - travels through the same transformation. The
    # two roots are a NOTCH in one closed contour rather than two subpaths, so
    # converging them narrows the notch instead of overlapping two shapes: no
    # second outline to hide, and nothing added that the parity fingerprint
    # would see.
    root_converge: float = 1.0
    # Smooth generator-level morphology. ``root_spread`` changes divergence
    # below the CEJ; crown values change the outline above it. All are applied
    # to every clinical path, not only to the visible enamel contour.
    root_spread: float = 1.0
    crown_taper: float = 0.0
    cervical_bulge: float = 0.0
    # Width of the grid column this template stands in, in CSS pixels; MUST
    # match `grid-template-columns` in src/index.css (verify.py checks it).
    #
    # Only the gum needs it, and it needs it for one reason: the papilla has to
    # peak exactly where two teeth meet. Half a column plus half the grid gap,
    # measured from each of two neighbouring tooth centres, always adds up to
    # the pitch between them - (a+g)/2 + (b+g)/2 = (a+b)/2 + g - so both
    # templates put their knee on the same point without either knowing which
    # tooth is standing next to it. Every permanent and primary anatomy class
    # now carries the column of the position it occupies, so generation never
    # guesses from a shared compromise template.
    col_px: float = 44.0


# `root_frac` below is Dirk's own reading off the Odontographie plates
# (2026-08-11): view a, vestibular, read mid-facial, counted in cells of the
# plate's Linienraster. Crown / root in cells, and the fraction they give:
#
#   11  4.4 / 6.4 = 0.593    14  4.0 / 6.9 = 0.633    31  3.6 / 6.4 = 0.640
#   12  3.8 / 6.2 = 0.620    15  3.8 / 7.5 = 0.664    46  3.2 / 6.8 = 0.680
#   13  4.4 / 7.9 = 0.642    16  3.6 / 5.6 = 0.609
#                            17  3.6 / 5.4 = 0.600
#
# Rounded to two places, which is the precision the readings carry.
#
# They corrected TWO inversions this table had. The canine used to hold a LOWER
# root fraction than the central incisor (0.60 against 0.62) where the plates
# give 0.642 against 0.593; and the lower molar a lower one than the lower
# incisor (0.62 against 0.68) where the plates give 0.680 against 0.640.
#
# The same cell counts also confirm the class length order. Normalized to the
# canine, that agreement establishes the Linienraster as one shared scale across the
# archive - which no measurement of the photographs themselves could settle,
# since the pages are photographed at different distances. The one exception is
# tpl 15 at +0.104, the GRAFTED template, whose length may have been set to
# serve the graft rather than the plate; left alone here, noted in
# odontogram-3y9.
# `width_frac` is each class's MESIODISTAL CROWN WIDTH as a fraction of its own
# length, and the rendered width comes out as `width_frac * length_rel *
# size_scale * H_REF` - so the number below is an anatomical width-to-length
# ratio, not a display choice.
#
# Corrected on 2026-08-11 (odontogram-t4c). The previous values carried no
# source and were not consistent with each other: measured against the mean
# mesiodistal crown diameters, the canine and both premolars came out about a
# fifth too wide and the incisors about a seventh too narrow, which is why the
# lower front looked sparse and the premolars overbearing. Unlike `root_frac`
# and `length_rel`, these are NOT read off the Odontographie plates - measuring
# a width automatically off those pages was tried and produced a fragment for
# tpl 31 and a clipped specimen for tpl 46, the same failure mode that made the
# cervical line unreadable (odontogram-3y9). They are the standard mean
# mesiodistal crown diameters (Wheeler / Ash & Nelson), averaged over the
# anatomy class. The old nine-template averages were split during the
# 2026-08-27 overhaul so arch-specific canines, both lower incisors, all four
# premolar classes and first/second/third molars no longer share compromise
# dimensions. The underlying means remain the Wheeler / Ash & Nelson values
# documented in README.md:
#
#   11 8.5  12 6.5  13 7.5  33 7.0   31 5.0  32 5.5
#   14 7.0  15 6.5  34 7.0  35 7.2   16 10.0 17 9.0 18 8.5
#   36 11.0 37 10.5 38 10.0
#
# Corrected AGAIN the same day, once the generator started measuring a crown
# width as the outline's full extent rather than as the tooth material a
# horizontal line passes through (`crown_width` vs `silhouette_width` in
# build.py). The old measure dropped the groove between the buccal cusps, so
# every posterior template read about a third narrower than it is and was then
# scaled up to match its target. The values here are unchanged in KIND - the
# same table, the same reasoning - only the scale they are fitted against is
# now the right one.
#
# The scale is 4.048 units per mm, chosen so the upper arch's columns still add
# up to the width the chart had. The correction redistributes width between
# tooth classes; it does not make the chart wider or narrower.
#
# `col_px` follows from the same numbers: each column is its tooth plus 6 px, so
# every contact is 10 px. That is also where the Class I canine relationship now
# comes from. Both arches use the same rule, the lower incisors are narrower
# teeth, and 43 therefore ends up in the embrasure between 12 and 13 without
# anything being arranged by hand - see the note on `col_px` in ToothSpec.
SPECS: list[ToothSpec] = [
    ToothSpec(key="11", col_px=62, label="Upper central incisor", source="Fig. 32a (p. 49)", src_template=11, root_frac=0.59, width_frac=0.4120, roots=1, arch="maxillary", family="incisor", sequence=1, crown_taper=0.04, length_rel=0.870, teeth=(11, 21)),
    ToothSpec(key="12", col_px=49, label="Upper lateral incisor", source="Fig. 35a (p. 51)", src_template=11, root_frac=0.62, width_frac=0.3363, roots=1, arch="maxillary", family="incisor", sequence=2, crown_taper=-0.02, length_rel=0.815, teeth=(12, 22), note="narrower with a relatively longer root than the central incisor"),
    ToothSpec(key="13", col_px=55, label="Maxillary canine", source="Fig. 45a (p. 61)", src_template=13, root_frac=0.64, width_frac=0.3163, roots=1, arch="maxillary", family="canine", sequence=1, crown_taper=0.02, length_rel=1.000, teeth=(13, 23), note="longest-rooted representative class"),
    ToothSpec(key="14", col_px=52, label="Upper first premolar", source="Fig. 54a (p. 71)", src_template=14, root_frac=0.63, width_frac=0.3544, roots=2, arch="maxillary", family="premolar", sequence=1, crown_taper=0.02, length_rel=0.833, furc_frac=0.55, root_converge=0.45, teeth=(14, 24), note="representative bifurcated/two-root form; close buccal projection"),
    ToothSpec(key="15", col_px=49, label="Maxillary second premolar", source="Fig. 56a (p. 73)", src_template=14, root_frac=0.66, width_frac=0.3363, roots=1, arch="maxillary", family="premolar", sequence=2, crown_taper=-0.02, cervical_bulge=0.02, length_rel=0.815, teeth=(15, 25), graft_root_from=13, note="predominantly single-rooted class; continuous grafted root"),
    ToothSpec(key="16", col_px=72, label="Upper first molar", source="derived from Fig. 70a and Fig. 3", src_template=16, root_frac=0.61, width_frac=0.5691, roots=3, arch="maxillary", family="molar", sequence=1, root_spread=1.12, crown_taper=0.03, length_rel=0.741, furc_frac=0.58, teeth=(16, 26), note="broadest and most divergent maxillary molar representative"),
    ToothSpec(key="17", col_px=65, label="Upper second molar", source="Fig. 70a (p. 88)", src_template=16, root_frac=0.60, width_frac=0.5256, roots=3, arch="maxillary", family="molar", sequence=2, root_spread=0.94, length_rel=0.722, furc_frac=0.62, teeth=(17, 27), note="smaller and more convergent than the first molar"),
    ToothSpec(key="18", col_px=62, label="Upper third molar", source="Fig. 70a (p. 88), simplified representative", src_template=16, root_frac=0.60, width_frac=0.5271, roots=3, arch="maxillary", family="molar", sequence=3, root_spread=0.78, crown_taper=-0.05, length_rel=0.680, furc_frac=0.66, teeth=(18, 28), note="variable class represented by a compact convergent three-root form"),
    ToothSpec(key="31", col_px=39, label="Lower central incisor", source="Fig. 38a (p. 52)", src_template=11, root_frac=0.64, width_frac=0.2778, roots=1, arch="mandibular", family="incisor", sequence=1, crown_taper=-0.06, length_rel=0.759, teeth=(31, 41), note="narrowest permanent tooth"),
    ToothSpec(key="32", col_px=42, label="Lower lateral incisor", source="Fig. 38a (p. 52), lateral dimensions", src_template=11, root_frac=0.64, width_frac=0.2973, roots=1, arch="mandibular", family="incisor", sequence=2, crown_taper=-0.03, length_rel=0.780, teeth=(32, 42)),
    ToothSpec(key="33", col_px=52, label="Mandibular canine", source="Fig. 45a (p. 61), mandibular dimensions", src_template=13, root_frac=0.64, width_frac=0.3075, roots=1, arch="mandibular", family="canine", sequence=1, crown_taper=-0.03, length_rel=0.960, teeth=(33, 43), note="narrower and slightly shorter than the maxillary canine"),
    ToothSpec(key="34", col_px=52, label="Mandibular first premolar", source="Fig. 62a (p. 78)", src_template=14, root_frac=0.65, width_frac=0.3514, roots=1, arch="mandibular", family="premolar", sequence=1, crown_taper=-0.12, cervical_bulge=0.03, length_rel=0.840, teeth=(34, 44), graft_root_from=13, note="single root; strong buccal cusp and reduced lingual cusp"),
    ToothSpec(key="35", col_px=53, label="Mandibular second premolar", source="Fig. 62a (p. 78)", src_template=14, root_frac=0.64, width_frac=0.3658, roots=1, arch="mandibular", family="premolar", sequence=2, crown_taper=0.05, cervical_bulge=0.04, length_rel=0.830, teeth=(35, 45), graft_root_from=13, note="single root; broader and more molar-like crown"),
    ToothSpec(key="36", col_px=78, label="Lower first molar", source="Fig. 76a (p. 95)", src_template=16, root_frac=0.68, width_frac=0.5827, roots=2, arch="mandibular", family="molar", sequence=1, root_spread=1.12, crown_taper=0.04, length_rel=0.796, furc_frac=0.60, teeth=(36, 46), note="broadest and most divergent mandibular molar representative"),
    ToothSpec(key="37", col_px=75, label="Lower second molar", source="Fig. 76a (p. 95), second-molar dimensions", src_template=16, root_frac=0.66, width_frac=0.5826, roots=2, arch="mandibular", family="molar", sequence=2, root_spread=0.92, length_rel=0.760, furc_frac=0.63, teeth=(37, 47), note="more regular and convergent than the first molar"),
    ToothSpec(key="38", col_px=72, label="Lower third molar", source="Fig. 76a (p. 95), simplified representative", src_template=16, root_frac=0.64, width_frac=0.6024, roots=2, arch="mandibular", family="molar", sequence=3, root_spread=0.75, crown_taper=-0.06, length_rel=0.700, furc_frac=0.67, teeth=(38, 48), note="variable class represented by a compact convergent two-root form"),
]

SPEC_BY_KEY = {s.key: s for s in SPECS}


# ---- Display, not anatomy ----------------------------------------------
#
# The two constants below are the ONLY place where the drawing knowingly departs
# from what the plates say, and they exist for one reason: in the odontogram the
# tooth is an icon in a row of thirty-two, not a specimen.
#
# ROOT_DISPLAY_SCALE draws roots at a fraction of their measured length, because
# the apical third carries almost no information at chart size. It is 0.75 since
# 2026-08-11, raised from 0.60 at Dirk's request for less compression.
#
# ANY change here must be mirrored in `src/perioGraphic.ts`, whose
# `ROOT_RESTORE_SCALE` has to stay the RECIPROCAL of this value. There the tooth
# is not an icon but the scale a probing depth is read against, so the perio
# chart undoes this compression. Leave the two out of step and pockets are read
# against a scale their own artwork disagrees with.
ROOT_DISPLAY_SCALE = 0.75

# LENGTH_SPREAD compresses the length DIFFERENCES between tooth classes toward
# their mean; 1.0 leaves anatomy untouched, 0.0 would draw every tooth the same
# length. It exists because a row aligned on the occlusal plane leaves the
# apices ragged, and measurement showed that raggedness is not a defect to be
# corrected but the anatomy itself: with the plate-measured values above the
# apex spread is 30 px, and correcting the anatomy moved it by only 3 px. So an
# even apex line cannot be had honestly - it can only be CHOSEN, which is what
# this constant does, in the open rather than by quietly editing `length_rel`.
#
# At 0.45, with ROOT_DISPLAY_SCALE at 0.75, the spread halves (33 px -> 15 px)
# while the tallest tooth stays where it is (117.7 px -> 116.9 px) and the
# canine stays visibly the longest. The mean is taken PER DENTITION, so the
# primary set keeps its own scale instead of being pulled toward the permanent
# one.
LENGTH_SPREAD = 0.30

_MEAN_LENGTH_REL: dict[bool, float] = {}


def _mean_length_rel(primary: bool) -> float:
    if primary not in _MEAN_LENGTH_REL:
        src = PRIMARY_SPECS if primary else SPECS
        _MEAN_LENGTH_REL[primary] = sum(x.length_rel for x in src) / len(src)
    return _MEAN_LENGTH_REL[primary]


def displayed_length_rel(s: ToothSpec, spread: float | None = None) -> float:
    """`length_rel` with the between-class differences compressed. See LENGTH_SPREAD."""
    f = LENGTH_SPREAD if spread is None else spread
    m = _mean_length_rel(s.primary)
    return m + (s.length_rel - m) * f


def display_targets(
    s: ToothSpec, root_scale: float | None = None, spread: float | None = None
) -> tuple[float, float, float]:

    k = ROOT_DISPLAY_SCALE if root_scale is None else root_scale

    shrink = (1.0 - s.root_frac) + k * s.root_frac
    d_len = displayed_length_rel(s, spread)
    length_rel = d_len * s.size_scale * shrink
    root_frac = k * s.root_frac / shrink
    # `width_frac` is a fraction of the tooth's own LENGTH, and the builder
    # multiplies it by the displayed length to get an absolute width. Both
    # display factors therefore have to be divided back out, or a purely
    # vertical decision would silently change how wide a tooth is drawn:
    # `shrink` (root compression) as it always did, and now `d_len/length_rel`
    # as well, which would otherwise make the canine narrower and the molars
    # wider for no anatomical reason.
    width_frac = s.width_frac * (s.length_rel / d_len) / shrink
    return length_rel, root_frac, width_frac


PRIMARY_SIZE_SCALE = 0.8

PRIMARY_PULP_SCALE = 1.05

PRIMARY_ROOT_SPREAD = 1.25

PRIMARY_SPECS: list[ToothSpec] = [
    ToothSpec(
        key="51",
        col_px=62,
        label="Upper primary central incisor",
        source="derived from 11, Bild 83 (overview)",
        src_template=11,
        root_frac=0.62,
        width_frac=0.3938,
        roots=1,
        arch="maxillary",
        family="incisor",
        sequence=1,
        cervical_bulge=0.07,
        length_rel=0.87,
        size_scale=PRIMARY_SIZE_SCALE,
        primary=True,
        teeth=(51, 61),
    ),
    ToothSpec(
        key="52",
        col_px=49,
        label="Upper primary lateral incisor",
        source="derived from 12, Bild 83 (overview)",
        src_template=11,
        root_frac=0.65,
        width_frac=0.3299,
        roots=1,
        arch="maxillary",
        family="incisor",
        sequence=2,
        cervical_bulge=0.06,
        length_rel=0.815,
        size_scale=PRIMARY_SIZE_SCALE,
        primary=True,
        teeth=(52, 62),
    ),
    ToothSpec(
        key="53",
        col_px=55,
        label="Maxillary primary canine",
        source="Bild 89 (p. 111) / Bild 90 (p. 112) + Bild 83",
        src_template=13,
        root_frac=0.62,
        width_frac=0.3163,
        roots=1,
        arch="maxillary",
        family="canine",
        sequence=1,
        cervical_bulge=0.08,
        length_rel=1.0,
        size_scale=PRIMARY_SIZE_SCALE,
        primary=True,
        teeth=(53, 63),
        note="upper primary canine class",
    ),
    ToothSpec(
        key="54",
        col_px=52,
        label="Upper first primary molar",
        source="Bild 91 (p. 113)",
        src_template=14,
        root_frac=0.69,
        width_frac=0.5193,
        roots=3,
        arch="maxillary",
        family="molar",
        sequence=1,
        cervical_bulge=0.12,
        length_rel=0.741,
        size_scale=PRIMARY_SIZE_SCALE,
        primary=True,
        teeth=(54, 64),
        note="three-rooted like every upper primary molar, unlike the "
        "two-rooted permanent premolar it is built from. Root fraction read off "
        "Bild 91 on 2026-08-10: the cervix runs at 31% of tooth height, the "
        "same figure Dirk took for the lower first primary molar, and both "
        "views a and b show it at that line. It was 0.60, inherited from a "
        "permanent parent - primary molars have short crowns and long divergent "
        "roots in both arches",
    ),
    ToothSpec(
        key="55",
        col_px=49,
        label="Upper second primary molar",
        source="Bild 92 (p. 114)",
        src_template=16,
        root_frac=0.62,
        width_frac=0.5577,
        roots=3,
        arch="maxillary",
        family="molar",
        sequence=2,
        cervical_bulge=0.10,
        length_rel=0.775,
        size_scale=PRIMARY_SIZE_SCALE,
        primary=True,
        teeth=(55, 65),
        note="root fraction read off Bild 92 by Dirk on 2026-08-10: the cervical "
        "seam runs at 38% of tooth height in both views a and b, so the root is "
        "0.62. The derived value had it at 40%, which is the closest any of "
        "these came before being measured - unlike its first-molar neighbours "
        "54 and 74, whose crowns were a third too long. The second primary "
        "molar really is close to a scaled-down permanent molar, as the text "
        "says outright about the lower one",
    ),
    ToothSpec(
        key="71",
        col_px=39,
        label="Lower primary central incisor",
        source="derived from 31, Bild 83 (overview)",
        src_template=11,
        root_frac=0.68,
        width_frac=0.2779,
        roots=1,
        arch="mandibular",
        family="incisor",
        sequence=1,
        cervical_bulge=0.06,
        length_rel=0.759,
        size_scale=PRIMARY_SIZE_SCALE,
        primary=True,
        teeth=(71, 81),
    ),
    ToothSpec(
        key="72",
        col_px=42,
        label="Lower primary lateral incisor",
        source="derived from 32, Bild 83 (overview)",
        src_template=11,
        root_frac=0.67,
        width_frac=0.3041,
        roots=1,
        arch="mandibular",
        family="incisor",
        sequence=2,
        cervical_bulge=0.06,
        length_rel=0.780,
        size_scale=PRIMARY_SIZE_SCALE,
        primary=True,
        teeth=(72, 82),
    ),
    ToothSpec(
        key="73",
        col_px=52,
        label="Lower primary canine",
        source="Bild 90 (p. 112) + Bild 83",
        src_template=13,
        root_frac=0.62,
        width_frac=0.3163,
        roots=1,
        arch="mandibular",
        family="canine",
        sequence=1,
        cervical_bulge=0.08,
        length_rel=0.900,
        size_scale=PRIMARY_SIZE_SCALE,
        primary=True,
        teeth=(73, 83),
        note="separate lower-arch proportions; not a runtime scale exception",
    ),
    ToothSpec(
        key="74",
        col_px=52,
        label="Lower first primary molar",
        source="Bild 93 (p. 117)",
        src_template=16,
        root_frac=0.69,
        width_frac=0.5341,
        roots=2,
        arch="mandibular",
        family="molar",
        sequence=1,
        cervical_bulge=0.13,
        length_rel=0.760,
        size_scale=PRIMARY_SIZE_SCALE,
        primary=True,
        teeth=(74, 84),
        note="root fraction read off Bild 93 by Dirk on 2026-08-10: the cervix "
        "runs as a wavy line and he takes 31% of tooth height as its mean, so "
        "the root is 0.69 - it was 0.62, derived from the permanent lower "
        "molar, which put the cervix at 38% where the photograph already shows "
        "the furcation. That parent was the mistake: the same page states that "
        "the SECOND primary molar is the scaled-down permanent molar, which is "
        "why 75 keeps it and this one does not",
    ),
    ToothSpec(
        key="75",
        col_px=53,
        label="Lower second primary molar",
        source="p. 117 section 3.4.3.2 + derived from 36",
        src_template=16,
        root_frac=0.62,
        width_frac=0.6556,
        roots=2,
        arch="mandibular",
        family="molar",
        sequence=2,
        cervical_bulge=0.11,
        length_rel=0.796,
        size_scale=PRIMARY_SIZE_SCALE,
        primary=True,
        teeth=(75, 85),
        note="the text on that page states it outright - the lower second "
        "primary molar is the scaled-down lower first permanent molar - so "
        "this one keeps the lower first-permanent-molar class as its parent "
        "where 74 must not. Bild 94 itself "
        "was not supplied; the citation is the text, not the plate",
    ),
]

PRIMARY_SPEC_BY_KEY = {s.key: s for s in PRIMARY_SPECS}


def tooth_to_template() -> dict[int, str]:

    out: dict[int, str] = {}
    for s in SPECS:
        for t in s.teeth:
            out[t] = s.key
    return out


def check_coverage() -> list[int]:

    all_teeth = [q * 10 + i for q in (1, 2, 3, 4) for i in range(1, 9)]
    have = tooth_to_template()
    return [t for t in all_teeth if t not in have]


def primary_coverage() -> list[int]:

    all_teeth = [q * 10 + i for q in (5, 6, 7, 8) for i in range(1, 6)]
    have = {t for s in PRIMARY_SPECS for t in s.teeth}
    return [t for t in all_teeth if t not in have]


def _report(specs: list[ToothSpec], missing: list[int], title: str) -> None:
    print(
        f"{title}: {len(specs)} templates, "
        f"{sum(len(s.teeth) for s in specs)} teeth assigned"
    )
    for s in specs:
        print(
            f"  {s.key:3s} {s.label:32s} {s.roots} roots  root fraction {s.root_frac:.0%}"
            f"  relative length {s.length_rel:.2f}  <- {s.source}"
        )
    print("  missing teeth:", missing or "none")


if __name__ == "__main__":
    _report(SPECS, check_coverage(), "Permanent")
    print()
    _report(PRIMARY_SPECS, primary_coverage(), "Primary")
