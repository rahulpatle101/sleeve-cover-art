# SLEEVE focused renderer pass

**Status:** IMPLEMENTED — STOPPED FOR REVIEW · 2026-11-26

Scope was limited to cover typography, Ink title layering, and deterministic composition/camera variety. The instrument panel, controls, recipe schema, motion, sound, Print ritual and export filename are unchanged.

## Font decision and licensing

The original local inventory contained no EB Garamond or Monowire font file. It also contained no Monowire licence, so Monowire was not bundled and no personal-use font was downloaded. A later Horizon typography revision selected EB Garamond from the operator's shortlist: the variable italic and OFL text came from the official `google/fonts` `ofl/ebgaramond` distribution.

The strongest supplied, explicitly redistributable substitutions were selected:

| Set | Face | Source | Licence | Shipped subset |
|---|---|---|---|---|
| Horizon | EB Garamond Medium Italic, weight 500 | Official Google Fonts `ofl/ebgaramond/EBGaramond-Italic[wght].ttf` | SIL OFL 1.1; explicitly permits bundling, embedding and redistribution | `src/assets/fonts/EBGaramond-MediumItalic.woff2` · 88.0 kB |
| Spectrum | Syne Bold, weight 700 | `production/creative-review-v0.2/lab2/fonts/Syne-VF.ttf` | SIL OFL 1.1; explicitly permits bundling, embedding and redistribution | `src/assets/fonts/Syne-Bold.woff2` · 18.2 kB |

Both are static WOFF2 instances subset to `U+0020–024F` and `U+2000–206F`. Their OFL texts ship at `public/licenses/OFL-EBGaramond.txt` and `public/licenses/OFL-Syne.txt`. `ensureFonts()` loads the exact same files before preview and export rendering.

Typography stress evidence: `typography-stress.png` covers short, 48-character long, mixed-case and uppercase artist/track pairs on both Light sets. Horizon's artist block now anchors at `x = 0.075 S`, around `y = 0.285 S` in the quiet upper-left field, clear of the bright horizon at `0.64 S` and the track at the foot. Cover output contains artist and track only; the recipe catalog helper remains unused by every family renderer.

## Carbon layering

Ink stock, texture and both plates now render entirely in `renderArtLayer`. Artist and track render afterward in `renderTypeLayer` for both Newsprint and Carbon. The cropped title treatment is preserved, but plate pixels can no longer cover the glyphs.

`composition-pass.mjs` renders the production order and a deliberately wrong `type → art` order at 620 px and 3000 px:

- production `renderArtwork` versus explicit `art → type`: **0 differing channels** for Newsprint and Carbon at both sizes;
- production versus deliberately wrong ordering in the title zone: 107,944–107,995 differing channels at preview size and 2,316,530–2,317,101 at export size.

## Deterministic composition/camera

`compose(recipe)` still derives solely from the existing uint32 seed. It adds no recipe fields, state, controls or randomness during rendering.

Seven bounded treatments are selected from the seed:

1. full figure;
2. asymmetric offset;
3. edge bleed;
4. rotated crop;
5. extreme macro;
6. intersection detail;
7. high-curvature detail.

The camera applies bounded rotation, independent X/Y scale, shear, translation and gentle quadratic deformation. Detail treatments inspect the deformed key contour itself: intersection crops use the nearest non-neighbouring curve pair; high-curvature crops use the strongest sampled turn; macro falls back from intersection to curvature. The selected real curve event is anchored inside the protected upper composition field, so a crop cannot land on an arbitrary empty segment. Family-specific scale caps retain Ink bleed, Light field/horizon, and Matter relief behaviour.

Normalized camera scale and translation are identical at 600 px preview and 3000 px export sizes.

## Hold-out review

`framing-50-seeds.png` contains **50 unseen seeds × 2 engines × 6 Press Sets = 600 covers**. All seven treatments occur:

| Treatment | Seeds |
|---|---:|
| Full figure | 9 |
| Asymmetric offset | 2 |
| Edge bleed | 7 |
| Rotated crop | 3 |
| Extreme macro | 12 |
| Intersection detail | 10 |
| High-curvature detail | 7 |

No case produced a non-finite camera, missing target, empty target crop or nondeterministic camera result.

### Weak combinations observed

- **Matter × Harmonic reduced 1:2 × extreme macro** is the weakest family of outcomes. Seeds `335f59f2`, `6e3ebccb`, `0caa057d`, `77a914c5` and `c48a2b4f` can read as one or two shallow diagonal grooves rather than a recognisable whole figure. The target is a real intersection/turn and the title remains safe, but the figure identity is deliberately subordinate to the material crop.
- **Macro Relief × low-density edge bleed** can read as an isolated bevel at contact-sheet size. At cover size the relief and directional light remain visible. This is retained because forcing a whole figure would erase the approved Macro Relief identity and reduce framing variety.

These are review notes, not hidden failures. No treatment was silently removed after the hold-out review.

## Verification

- `npm run verify`: **ALL PASS**, including 9,600 geometry combinations and the new 600-case camera checks.
- `npm run build`: **PASS**; JS 267.21 kB / 85.76 kB gzip, CSS 13.80 kB / 3.79 kB gzip.
- `composition-pass.mjs`: **PASS**, 600 cases, fonts loaded, deterministic camera, exact preview/3000px Ink layer order, no console errors.
- `v02-panel.mjs`: **28 PASS, 0 FAIL**, no console errors. Tab order, native controls, keyboard model, pointer drag, deterministic New Proof chain, sound toggle, 3000 × 3000 keyboard print, live region, focus retention, reduced motion, accessibility tree, 360/768/1280 layouts and 44 px targets are preserved.
- The raw extraction remains untouched.

## Review evidence

- Framing: `framing-50-seeds.png`
- Typography: `typography-stress.png`
- Numeric results: `results.json`
- Panel check: `panel-check.txt`
- General responsive captures: `screens/`
- Focused captures: `review-screens/desktop-1440-spectrum.png`, `desktop-1440-carbon.png`, `phone-390-horizon.png`, `phone-390-horizon-full.png`

Stopped here for visual review. No deployment was performed.
