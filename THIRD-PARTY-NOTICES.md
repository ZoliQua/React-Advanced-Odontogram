# Third-party notices

React Advanced Odontogram is released under the MIT License (see [`LICENSE`](./LICENSE)).
Everything in this repository is covered by it **except** the third-party components
listed below, which keep their own terms.

All of them permit commercial use and redistribution. Each one only asks that its
notice travel with it — which is what this file is for: if you redistribute this
library, ship this file too and you have covered them.

> This is an engineering inventory, not legal advice. If you are shipping a
> commercial product, have your own counsel confirm it.

---

## 1. What is NOT third party

The point most often asked about: **the tooth drawings are not third-party assets.**

- Every SVG in `src/assets/teeth-svgs/` (classic and `measured/`) and
  `src/assets/icon-svgs/` is original work by Zoltán Dul, and each file carries
  its own in-file notice: `Created by Zoltan Dul in 2026 - free to use with MIT
  license`. They are covered by the MIT License, commercial use included.
- The `measured` profile's templates are **generated** by `tools/toothgen` from
  six hand-drawn donor SVGs in `tools/toothgen/source/`, which are likewise
  original work in this repository.
- `tools/toothgen/spec.py` cites published anatomy figures (`Fig. 32a (p. 49)`,
  `Bild 91 (p. 113)`, Wheeler / Ash & Nelson means, and the *Odontographie*
  plate grid). These are cited as the source of **measurements** — mesiodistal
  dimensions, crown/root proportions, root counts, furcation positions. No
  external illustration is traced or reproduced; the drawn geometry is generated
  over this repository's own donors. See
  [`tools/toothgen/README.md`](./tools/toothgen/README.md) § "Evidence and
  display choices".
- Parts of the `measured` anatomy originated in third-party **forks of this
  MIT-licensed project** (see the contributor list in the README). Those forks
  carry this repository's unchanged MIT License and copyright notice; no separate
  or additional rights are asserted over them.

---

## 2. Fonts embedded in the published package

These are base64-embedded in the library so that PDF export works fully offline.
They are **subsets** — reduced to the glyphs the report needs — which counts as a
modification under their licenses.

### Roboto (subset)

- **File:** `src/fonts/roboto.ts` (Regular + Bold)
- **Upstream:** Roboto, by Google Inc. — https://fonts.google.com/specimen/Roboto
- **License:** Apache License 2.0 — https://www.apache.org/licenses/LICENSE-2.0
- **Notice:** `Copyright Google Inc., licensed under the Apache License, Version 2.0.`

Used for every Latin and Cyrillic UI language in the PDF report, because jsPDF's
built-in Helvetica cannot encode Hungarian double-acute accents or Cyrillic.

### Noto Naskh Arabic (subset)

- **File:** `src/fonts/notoArabic.ts` (Regular + Bold), lazy-loaded
- **Upstream:** Noto Naskh Arabic, by The Noto Project Authors —
  https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic
- **License:** SIL Open Font License, Version 1.1 (full text in § 4)

### Noto Sans SC (subset)

- **File:** `src/fonts/notoSC.ts` (Regular), lazy-loaded
- **Upstream:** Noto Sans Simplified Chinese, by The Noto Project Authors —
  https://fonts.google.com/noto/specimen/Noto+Sans+SC
- **License:** SIL Open Font License, Version 1.1 (full text in § 4)

> **Note on the OFL and modified versions.** Both Noto subsets are modified
> (subsetted) versions. The OFL permits this, and permits selling the result
> *bundled in* software — it only forbids selling the font software on its own.
> If you subset or re-generate these fonts yourself, confirm the exact copyright
> line and any Reserved Font Name declaration in the specific upstream font files
> you start from, and carry them forward.

`src/fonts/arabicShaper.ts` is original work in this repository (MIT), not a
third-party shaping library.

---

## 3. Runtime dependencies

Declared in `package.json` and installed from npm — not vendored into this
repository, but they do end up in a consuming application's bundle.

| Package | Version range | License |
| --- | --- | --- |
| [jspdf](https://github.com/parallax/jsPDF) | `^4.2.1` | MIT |
| [DOMPurify](https://github.com/cure53/DOMPurify) | `^3.4.13` | MPL-2.0 **OR** Apache-2.0 (your choice) |

`react` and `react-dom` are **peer** dependencies (MIT) — supplied by the host
application, not bundled here.

Each package ships its own license file in `node_modules/<name>/`; consult those
for the authoritative text.

---

## 4. SIL Open Font License, Version 1.1

Applies to the Noto Naskh Arabic and Noto Sans SC subsets listed in § 2.

```
Copyright (c) The Noto Project Authors

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is available with a FAQ at: https://openfontlicense.org

-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical writer
or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

---

## 5. If you redistribute this library

The short version:

1. Keep [`LICENSE`](./LICENSE) and its copyright notice (MIT requires this).
2. Ship this file alongside it — that carries the Apache-2.0 and OFL notices.
3. If you modify the tooth drawings, nothing further is required by the MIT
   License, though noting your changes is good practice.
4. If you strip the PDF export and its fonts from your build, § 2 no longer
   applies to you.
