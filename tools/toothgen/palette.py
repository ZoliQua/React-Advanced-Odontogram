"""Canonical colour tokens for the tooth artwork.

Every themable colour in the drawings is emitted as a CSS custom property with
the colour that is there today as its fallback::

    style="fill: var(--odon-tooth-body, #ebebeb)"

A host that sets nothing gets a pixel-identical chart; a host that sets
``--odon-tooth-body`` recolours every enamel surface in both profiles at
once. This is backward compatible by construction.

The mechanism is not new. The restoration and filling MATERIALS have carried
tokens since the measured set was introduced -- they were simply never
documented or exposed. This module makes the whole set explicit, in one place,
and extends it to the rest of the artwork.

Tokens live in the hand-drawn sources (``tools/toothgen/source/*.svg`` and the
six classic assets); ``build.py`` passes style attributes through untouched, so
the generated templates inherit them. ``tokenize.py`` applies this table.

Naming: ``--odon-<group>-<name>``. The groups are tooth, pulp, gum, bone,
caries, wear, fill, rest, endo, ortho, plan, perio and specials.
"""

from __future__ import annotations

# --------------------------------------------------------------------------
# Tokens: name -> (default colour, what it paints)
#
# Where one token carries several defaults, the SAME knob drives slightly
# different shades of one surface (an outline drawn at two weights, a pulp
# drawn lighter in a milk tooth). Unset, each keeps its own colour exactly;
# set, they unify. That is the intended trade: one knob per surface, not one
# knob per shade.
# --------------------------------------------------------------------------

TOKENS: dict[str, tuple[str, str]] = {
    # -- tooth structure ---------------------------------------------------
    "--odon-tooth-body": ("#ebebeb", "natural crown and every broken/prepared variant"),
    "--odon-tooth-outline": ("#c8c9c9", "crown and root outline"),
    "--odon-tooth-highlight": ("#fefefe", "crown sheen (the 'beauty' layer)"),
    "--odon-tooth-cusp": ("#f4f1e8", "occlusal cusp field"),
    "--odon-tooth-groove": ("#8f8f8f", "occlusal fissure lines"),
    "--odon-milktooth-body": ("#fff", "deciduous crown"),
    "--odon-milktooth-highlight": ("#eaeaea", "deciduous crown sheen"),
    "--odon-pulp-healthy": ("#fcc5bc", "healthy pulp chamber"),
    "--odon-pulp-inflamed": ("#ff422a", "inflamed pulp"),
    "--odon-pulp-inflamed-halo": ("#ffa46a", "inflamed-pulp surround"),
    "--odon-gum": ("#f79f9a", "gingiva"),
    "--odon-bone": ("#fdecc5", "alveolar bone, and bone seen through a resorption/resection"),
    # -- pathology ---------------------------------------------------------
    "--odon-caries": ("#0a1018", "caries and subcrown caries body"),
    "--odon-caries-highlight": ("#fff", "caries inner highlight"),
    "--odon-caries-outline": ("#000", "caries outline"),
    "--odon-wear": ("#fff", "bruxism wear facet"),
    "--odon-wear-outline": ("#aaa", "bruxism wear outline"),
    "--odon-calculus": ("#9e1f63", "calculus deposit"),
    "--odon-calculus-light": ("#c4ff98", "calculus highlight"),
    "--odon-fracture": ("#ed1c24", "fracture line"),
    "--odon-fracture-alt": ("#9e00e9", "fracture line, secondary"),
    "--odon-crown-leakage": ("#9e00e9", "crown margin leakage"),
    "--odon-mobility": ("#f99", "mobility arcs"),
    "--odon-parodontal": ("#ffa46a", "periodontal involvement"),
    "--odon-inflammation": ("#feffd5", "cyst / granuloma / abscess body"),
    "--odon-inflammation-edge": ("#ffa46a", "cyst / granuloma / abscess edge"),
    "--odon-extraction-socket": ("#fff", "socket after extraction"),
    "--odon-extraction-socket-outline": ("#f99", "socket outline"),
    # -- fillings ----------------------------------------------------------
    "--odon-fill-amalgam": ("#aaa", "amalgam filling"),
    "--odon-fill-amalgam-outline": ("#aaa", "amalgam filling outline"),
    "--odon-fill-composite": ("#2f7a4d", "composite filling"),
    "--odon-fill-composite-outline": ("#24603c", "composite filling outline"),
    "--odon-fill-gic": ("#f9ae94", "glass-ionomer filling"),
    "--odon-fill-gic-outline": ("#f99", "glass-ionomer filling outline"),
    "--odon-fill-temporary": ("#fff", "temporary filling"),
    "--odon-fill-temporary-outline": ("#eee", "temporary filling outline"),
    "--odon-fill-defect": ("#f5ff15", "filling defect"),
    "--odon-fill-defect-outline": ("#2e3192", "filling defect outline"),
    "--odon-fissure-sealing": ("#3fb6ff", "fissure sealant"),
    "--odon-contact-point": ("#aaa", "missing contact point marker"),
    # -- endodontics -------------------------------------------------------
    "--odon-endo-filling": ("#388aca", "root canal filling"),
    "--odon-endo-metal-pin": ("#3951a3", "metal post"),
    "--odon-endo-glass-pin": ("#c8c9c9", "glass-fibre post"),
    "--odon-endo-medical-filling": ("#fff", "medicated temporary root filling"),
    "--odon-endo-medical-filling-outline": ("#f9ae94", "medicated root filling outline"),
    # -- restorations: materials (pre-existing tokens, ratified here) ------
    "--odon-rest-zircon": ("#cfe3ee", "zirconia restoration"),
    "--odon-rest-gold": ("#e0a80d", "gold restoration"),
    "--odon-rest-gradia": ("#57b285", "Gradia restoration"),
    "--odon-rest-metal": ("#0051bf", "metal restoration"),
    "--odon-rest-temporary": ("#fff", "temporary restoration"),
    "--odon-rest-telescope": ("#0051bf", "telescope crown"),
    "--odon-rest-telescope-inner": ("#aaa", "telescope crown inner coping"),
    "--odon-rest-telescope-connector": ("#0051bf", "telescope bridge connector"),
    "--odon-rest-telescope-connector-anterior": ("#388aca", "telescope bridge connector, anterior"),
    "--odon-rest-denture-tooth": ("#a8ddb9", "denture tooth"),
    "--odon-rest-denture-base": ("#f9ae94", "denture base"),
    "--odon-rest-denture-gum": ("#ffa46a", "denture gum over an implant"),
    # e.max and metal-ceramic are drawn with a nine-stop gradient each; the
    # stops are individually themable so a host can retune the ramp.
    **{f"--odon-rest-emax-{i}": (c, f"e.max gradient stop {i}") for i, c in enumerate(
        ["#fff", "#fdf3ea", "#f9d8b9", "#f5c18f", "#f2ae6c", "#f09f52", "#ef953f", "#ee8f33", "#ee8d30"])},
    **{f"--odon-rest-metal-ceramic-{i}": (c, f"metal-ceramic gradient stop {i}") for i, c in enumerate(
        ["#feff5f", "#f9fc60", "#edf564", "#d8ea6b", "#bbd975", "#95c482", "#68ab91", "#328da3", "#0071b5"])},
    # -- shared outlines ---------------------------------------------------
    "--odon-rest-outline": ("#1b3f1c", "restoration outline"),
    "--odon-outline-dark": ("#0a1018", "dark structural outline"),
    # -- orthodontics ------------------------------------------------------
    "--odon-ortho-arrow": ("#2e3192", "movement arrows"),
    "--odon-ortho-metal": ("#737373", "bracket / band metal"),
    "--odon-ortho-metal-light": ("#bfbfbf", "bracket / band highlight"),
    "--odon-ortho-outline": ("#000", "bracket / band / closed-gap outline"),
    # -- treatment plan ----------------------------------------------------
    "--odon-plan-extraction": ("#b70000", "planned extraction"),
    "--odon-plan-crown": ("#c83014", "planned / replaced crown marker"),
    "--odon-plan-crown-fill": ("#feffbf", "planned crown marker fill"),
}

# --------------------------------------------------------------------------
# Rules: (owning layer path, property, literal colour) -> token
#
# The path is the slash-joined id chain from the top-level group, matched as a
# PREFIX, and the most specific matching rule wins. Matching on the layer and
# not on the colour alone is what keeps two surfaces that happen to share a hex
# -- "#ffa46a" is both an inflamed-pulp halo and a denture gum -- separately
# themable.
# --------------------------------------------------------------------------

Rule = tuple[str, str, str, str]  # (path prefix, property, colour, token)

RULES: tuple[Rule, ...] = (
    # tooth structure
    ("tooth/tooth-base-beauty", "fill", "#fefefe", "--odon-tooth-highlight"),
    ("tooth/tooth-base-beauty", "fill", "#fefdfd", "--odon-tooth-highlight"),
    ("tooth/tooth-healthy-pulp", "fill", "#fcc5bc", "--odon-pulp-healthy"),
    ("tooth/tooth-healthy-pulp", "fill", "#f6a09b", "--odon-pulp-healthy"),
    ("tooth/tooth-inflam-pulp", "fill", "#ff422a", "--odon-pulp-inflamed"),
    ("tooth/tooth-inflam-pulp", "fill", "#ffa46a", "--odon-pulp-inflamed-halo"),
    ("tooth/tooth-bruxism", "fill", "#fff", "--odon-wear"),
    ("tooth/tooth-bruxism", "stroke", "#aaa", "--odon-wear-outline"),
    ("milktooth/milktooth-base", "fill", "#fff", "--odon-milktooth-body"),
    ("milktooth/milktooth-beauty", "fill", "#eaeaea", "--odon-milktooth-highlight"),
    ("milktooth/milktooth-healthy-pulp", "fill", "#fcc5bc", "--odon-pulp-healthy"),
    ("milktooth/milktooth-inflam-pulp", "fill", "#b70000", "--odon-pulp-inflamed"),
    ("base/gum-base", "fill", "#f79f9a", "--odon-gum"),
    ("base/bone-base", "fill", "#fdecc5", "--odon-bone"),
    # enamel + outline across the crown and all its variants
    ("tooth/tooth-base", "fill", "#ebebeb", "--odon-tooth-body"),
    ("tooth-variants/", "fill", "#ebebeb", "--odon-tooth-body"),
    ("tooth-variants/tooth-crownprep", "fill", "#eaeaea", "--odon-tooth-body"),
    ("tooth/tooth-base", "stroke", "#c8c9c9", "--odon-tooth-outline"),
    ("tooth/tooth-base", "stroke", "#c8c8c8", "--odon-tooth-outline"),
    ("tooth/tooth-base", "stroke", "#9f9f9f", "--odon-tooth-outline"),
    ("tooth-variants/", "stroke", "#c8c9c9", "--odon-tooth-outline"),
    ("tooth-variants/", "stroke", "#c8c8c8", "--odon-tooth-outline"),
    ("milktooth/milktooth-base", "stroke", "#c8c9c9", "--odon-tooth-outline"),
    ("milktooth/milktooth-base", "stroke", "#c8c8c8", "--odon-tooth-outline"),
    ("milktooth/milktooth-base", "stroke", "#9f9f9f", "--odon-tooth-outline"),
    ("tooth-variants/no-tooth-after-extraction", "fill", "#fff", "--odon-extraction-socket"),
    ("tooth-variants/no-tooth-after-extraction", "stroke", "#f99", "--odon-extraction-socket-outline"),
    # pathology
    ("surfaces/caries", "fill", "#0a1018", "--odon-caries"),
    ("surfaces/caries", "fill", "#fff", "--odon-caries-highlight"),
    ("surfaces/caries", "stroke", "#000", "--odon-caries-outline"),
    ("surfaces/subcaries", "fill", "#0a1018", "--odon-caries"),
    ("surfaces/subcaries", "stroke", "#000", "--odon-caries-outline"),
    ("surfaces/fissure-sealing", "fill", "#3fb6ff", "--odon-fissure-sealing"),
    ("surfaces/fissure-sealing", "stroke", "#3fb6ff", "--odon-fissure-sealing"),
    ("surfaces/contact-point", "stroke", "#aaa", "--odon-contact-point"),
    ("mods/mobility", "stroke", "#f99", "--odon-mobility"),
    ("mods/parodontal", "fill", "#ffa46a", "--odon-parodontal"),
    ("mods/inflammation", "fill", "#feffd5", "--odon-inflammation"),
    ("mods/inflammation", "fill", "#ffa46a", "--odon-inflammation-edge"),
    ("mods/inflammation", "stroke", "#ffa46a", "--odon-inflammation-edge"),
    ("specials/calculus", "fill", "#9e1f63", "--odon-calculus"),
    ("specials/calculus", "fill", "#c4ff98", "--odon-calculus-light"),
    ("specials/fracture", "stroke", "#ed1c24", "--odon-fracture"),
    ("specials/fracture", "stroke", "#9e00e9", "--odon-fracture-alt"),
    ("specials/fracture", "stroke", "#fdecc5", "--odon-bone"),
    ("restorations/crown-leakage", "fill", "#9e00e9", "--odon-crown-leakage"),
    ("restorations/crown-leakage", "stroke", "#9e00e9", "--odon-crown-leakage"),
    # filling outlines (their fills are already tokenized in the sources)
    ("surfaces/fillings/amalgam", "stroke", "#aaa", "--odon-fill-amalgam-outline"),
    ("surfaces/fillings/amalgam", "stroke", "#c8c8c8", "--odon-fill-amalgam-outline"),
    ("surfaces/fillings/composite", "stroke", "#24603c", "--odon-fill-composite-outline"),
    # the classic composite is outlined in its own (lighter) shades
    ("surfaces/fillings/composite", "stroke", "#feffbf", "--odon-fill-composite-outline"),
    ("surfaces/fillings/composite", "stroke", "#feffd5", "--odon-fill-composite-outline"),
    ("surfaces/fillings/gic", "stroke", "#f99", "--odon-fill-gic-outline"),
    ("surfaces/fillings/temporary", "stroke", "#eee", "--odon-fill-temporary-outline"),
    ("surfaces/fillings/defect", "fill", "#f5ff15", "--odon-fill-defect"),
    ("surfaces/fillings/defect", "stroke", "#2e3192", "--odon-fill-defect-outline"),
    # endodontics
    ("endos/endo-filling", "fill", "#388aca", "--odon-endo-filling"),
    ("endos/endo-metal-pin", "fill", "#3951a3", "--odon-endo-metal-pin"),
    ("endos/endo-glass-pin", "fill", "#c8c9c9", "--odon-endo-glass-pin"),
    ("endos/endo-medical-filling", "fill", "#fff", "--odon-endo-medical-filling"),
    ("endos/endo-medical-filling", "stroke", "#f9ae94", "--odon-endo-medical-filling-outline"),
    ("endos/endo-resorption", "fill", "#fdecc5", "--odon-bone"),
    ("endos/endo-resection", "fill", "#fdecc5", "--odon-bone"),
    # restorations: shared outlines, and the denture gum
    ("restorations/prosthesis-implant", "fill", "#ffa46a", "--odon-rest-denture-gum"),
    ("restorations/", "stroke", "#1b3f1c", "--odon-rest-outline"),
    ("restorations/", "stroke", "#0a1018", "--odon-outline-dark"),
    # orthodontics
    ("ortho/arrows", "stroke", "#2e3192", "--odon-ortho-arrow"),
    ("ortho/ortho-bracket", "stroke", "#737373", "--odon-ortho-metal"),
    ("ortho/ortho-bracket", "fill", "#bfbfbf", "--odon-ortho-metal-light"),
    ("ortho/ortho-ring", "stroke", "#737373", "--odon-ortho-metal"),
    ("ortho/ortho-ring", "fill", "#bfbfbf", "--odon-ortho-metal-light"),
    # Material fills in the CLASSIC assets. The measured sources already carry
    # these tokens; the classic six never did, and in several cases they use a
    # DIFFERENT colour for the same material (composite #feffbf vs #2f7a4d,
    # zircon #feffbf vs #cfe3ee, gold #ece614 vs #e0a80d, gradia #55ff98 vs
    # #57b285). Keying on the layer rather than the colour is what lets one
    # token drive both profiles while each keeps its own default unset.
    ("surfaces/fillings/amalgam", "fill", "#aaa", "--odon-fill-amalgam"),
    ("surfaces/fillings/amalgam", "fill", "#a0a0a0", "--odon-fill-amalgam"),
    ("surfaces/fillings/composite", "fill", "#feffbf", "--odon-fill-composite"),
    ("surfaces/fillings/gic", "fill", "#f9ae94", "--odon-fill-gic"),
    ("surfaces/fillings/temporary", "fill", "#fff", "--odon-fill-temporary"),
    ("restorations/zircon", "fill", "#feffbf", "--odon-rest-zircon"),
    ("restorations/gold", "fill", "#ece614", "--odon-rest-gold"),
    ("restorations/gradia", "fill", "#55ff98", "--odon-rest-gradia"),
    ("restorations/metal", "fill", "#0051bf", "--odon-rest-metal"),
    ("restorations/temporary-restorations", "fill", "#fff", "--odon-rest-temporary"),
    ("restorations/temporary-restorations", "fill", "#fffffb", "--odon-rest-temporary"),
    ("restorations/telescope/telescope-bridge-connector", "fill", "#388aca",
     "--odon-rest-telescope-connector-anterior"),
    ("restorations/telescope/telescope-bridge-connector", "fill", "#0051bf",
     "--odon-rest-telescope-connector"),
    ("restorations/telescope/telescope-crown/telescope-crown-outside", "fill", "#0051bf",
     "--odon-rest-telescope"),
    ("restorations/telescope/telescope-crown/telescope-crown-inside", "fill", "#aaa",
     "--odon-rest-telescope-inner"),
    ("restorations/telescope/telescope-crown/telescope-crown-inside", "fill", "#a0a0a0",
     "--odon-rest-telescope-inner"),
    ("restorations/prosthesis/prosthesis-crown", "fill", "#f9ae94", "--odon-rest-denture-tooth"),
    ("restorations/prosthesis/prosthesis-connector", "fill", "#f9ae94", "--odon-rest-denture-base"),
    ("restorations/prosthesis-implant/prosthesis-implant-gum", "fill", "#f9ae94",
     "--odon-rest-denture-base"),
    ("restorations/prosthesis-implant/prosthesis-implant-crown", "fill", "#f9ae94",
     "--odon-rest-denture-base"),
    # shared dark outlines the groups above draw with
    ("restorations/", "stroke", "#000", "--odon-outline-dark"),
    ("ortho/", "stroke", "#000", "--odon-ortho-outline"),
    ("plan/", "stroke", "#000", "--odon-outline-dark"),
    # treatment plan
    ("plan/extraction-plan", "stroke", "#b70000", "--odon-plan-extraction"),
    ("plan/crown-needed", "fill", "#c83014", "--odon-plan-crown"),
    ("plan/crown-needed", "fill", "#feffbf", "--odon-plan-crown-fill"),
    ("plan/crown-needed", "stroke", "#1b3f1c", "--odon-rest-outline"),
    ("plan/crown-replace", "stroke", "#c83014", "--odon-plan-crown"),
)

# --------------------------------------------------------------------------
# Deliberately NOT tokenized.
#
# These two layers are photorealistic shaded illustrations, not flat clinical
# surfaces: the implant fixture carries ~65 near-identical metal greys and the
# parapulpal pin ~20. Those shades encode a light source, not a meaning, and a
# host that recoloured them one by one would destroy the shading rather than
# retheme it. Changing their look means supplying a different drawing.
# --------------------------------------------------------------------------

UNTOKENIZED_BY_DESIGN: tuple[str, ...] = (
    "restorations/implant",
    "specials/parapulpal-pin",
)

# Colours the generator synthesizes itself rather than copying from a source
# drawing (see occlusal.py); listed here so the table stays the single
# inventory even though the substitution happens in Python.
SYNTHESIZED: dict[str, str] = {
    "#f4f1e8": "--odon-tooth-cusp",
    "#8f8f8f": "--odon-tooth-groove",
}


def css(token: str) -> str:
    """Render a token as a CSS value with its default as the fallback."""
    default, _ = TOKENS[token]
    return f"var({token}, {default})"


def lookup(path: str, prop: str, colour: str) -> str | None:
    """The token for one declaration, or None to leave it literal.

    `path` is the slash-joined id chain of the declaration's owning layers.
    The most specific (longest) matching prefix wins, so a rule on
    `surfaces/fillings/defect` beats one on `surfaces/`.
    """
    colour = colour.strip().lower()
    if any(path.startswith(skip) for skip in UNTOKENIZED_BY_DESIGN):
        return None
    best: tuple[int, str] | None = None
    for prefix, rule_prop, rule_colour, token in RULES:
        if rule_prop != prop or rule_colour != colour:
            continue
        if not path.startswith(prefix):
            continue
        if best is None or len(prefix) > best[0]:
            best = (len(prefix), token)
    return best[1] if best else None
