# Third-party materials

A2O — Atom to Orbit is an independent Korean science visualization atlas at
[a2o.kr](https://a2o.kr). This inventory distinguishes redistributed materials from
links used as scientific or visual references. It does not grant an open-source
license to A2O's original code, articles, diagrams or brand assets.

| Material                           | Local files                                                                                    | Terms and retained notices                                                                                                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SUIT Variable, SUNN                | `scripts/fonts/SUIT-Variable.woff2`                                                            | SIL Open Font License 1.1; full notice beside the source font and in `static/fonts/OFL.txt`. [Official license](https://github.com/sun-typeface/SUIT/blob/main/LICENSE).                                                                           |
| A2O Sans Subset                    | `static/fonts/A2OSans-Subset.woff2`                                                            | Modified SUIT glyph subset, renamed internally to respect the reserved font name. Same OFL; see `static/fonts/README.md` and `scripts/subset-font.py`.                                                                                             |
| Solar System Scope / INOVE maps    | Ten WebP files under `static/orbit/textures/`                                                  | [CC BY 4.0 collection](https://www.solarsystemscope.com/textures/); creator, source URLs, conversion and resizing are recorded in `static/licenses/orbit-textures.txt`.                                                                            |
| ERFA ICRS–Galactic transform       | `docs/reference-assets/erfa-icrs2g.c`, rotation constants in `src/lib/utils/orbit-model.ts`    | Full copyright, redistribution and non-endorsement conditions retained in the original file and `static/licenses/erfa-icrs2g.txt`.                                                                                                                 |
| Three.js                           | Dependency in `bun.lock`, imported by the orbit renderer                                       | MIT notice in `static/licenses/three-MIT.txt`. Dependencies are installed, not checked into this repository.                                                                                                                                       |
| Canvas Confetti 1.9.4, Kiril Vatev | Dependency in `bun.lock`, loaded on a correct quiz answer by `QuizConfetti.svelte`             | ISC notice in `static/licenses/canvas-confetti-ISC.txt`. [Official source](https://github.com/catdad/canvas-confetti); [Realistic Look and custom canvas examples](https://www.kirilv.com/canvas-confetti/) informed the local burst choreography. |
| Three.js TypeScript definitions    | `docs/reference-assets/types-three-MIT.txt`, development dependency                            | Microsoft MIT notice retained.                                                                                                                                                                                                                     |
| Natural Earth land data            | `docs/reference-assets/ne_110m_land.geojson`, generated `src/lib/data/earth-outline.ts`        | [Public domain](https://www.naturalearthdata.com/about/terms-of-use/). Source and projection recorded in `scripts/generate-earth-outline.mjs`; no D3 distribution is checked in or shipped to the browser.                                         |
| Football SVG, flomar               | `docs/reference-assets/football-flomar-cc0.svg`, adapted panel paths in `FootballGlyph.svelte` | [CC0 source page](<https://commons.wikimedia.org/wiki/File:Football_(soccer_ball).svg>); changes and original hash in `docs/FOOTBALL_SVG.md`.                                                                                                      |

The A2O orbital logo was supplied by the owner; its provenance and unchanged hash
are recorded in `docs/ORBITAL_LOGO.md`. The social image is generated from the local
site by `scripts/render-social.mjs`. Neither is granted a third-party reuse license
by this inventory.

Scientific citations and visual-reference URLs are retained in typed data, articles
and `docs/scale-illustration-references.json`. Those URLs do not license the linked
images for redistribution. Reference captures and downloaded study images remain
in ignored local folders and are not part of the publication manifest. Apart from
the explicitly listed assets, the scientific SVG figures are implemented locally.

Other installed dependencies retain their own licenses in their packages. This
inventory is not a replacement for those terms. No NASA, INOVE or other third-party
endorsement is claimed. Before adding any asset, record its source, applicable
terms, modifications and required notice; do not infer permission from access alone.
