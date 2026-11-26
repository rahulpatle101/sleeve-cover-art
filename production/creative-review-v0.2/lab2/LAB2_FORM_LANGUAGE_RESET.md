# Lab 2 — form-language and typography reset

**Status:** FOR CREATIVE APPROVAL · 2026-11-26 · static lab only · `src/` untouched (Stage 1 snapshot 68/68) · fonts are NOT added to the app

Lab source: `lab2.js` (run in the dev-server page; it only *reads* the app's geometry and registration). Outputs are in `out/`. **Recipe:** Φ 045° · seed `01352905` · "Mira Okafor / Tidewater", Harmonic 3:4 and Radial 3:2. Integrated covers are rendered at 3000 × 3000; crops are true 1:1 slices.

| Deliverable | File |
|---|---|
| 1 · Reference-to-rule ledger | `REFERENCE_TO_RULE_LEDGER.md` |
| 2 · Form sheet: Ink / Light / Matter at Density 2 · 10 · 24 | `out/form-sheet.png` |
| 3 · Harmonic **and** Radial per family | same sheet (two rows per family) |
| 4 · Typography: two compositional concepts per family (normal + long names) | `out/typography-sheet.png` |
| 5 · Integrated covers, one per family | `out/integrated-ink.png`, `out/integrated-light.png`, `out/integrated-matter.png` |
| 6 · True 100 % crops | `out/crop-100pct-*.png` (ink contour, ink overprint type, ink notation, light band, light lit name, matter relief, matter emboss, plus each family at Density 24) |
| 7 · Rejection list | §5 below |

## 1. Geometry model per family, and what Density means now

| Family | Model | Density 2 → 10 → 24 means | Phase means | Hierarchy guarantee |
|---|---|---|---|---|
| **Ink: contour and print** | Plate A prints the key contour (vermilion). Plate B prints the key contour misregistered, one secondary contour and **≤ 5** thin echoes (black). The figure is enlarged past the trim for a decisive crop. | **Ink build-up**: impressions per contour 1 → 2 → 5 (seeded jitter); pressure range widens; ink spread grows and is **FM-screened** (solids stay solid, tints become dots); edge breakup increases. Echoes 0 → 2 → 5 maximum. | Plate-B misregistration | 1 dominant contour + 1 secondary + ≤ 5 hairline echoes; paper stays dominant |
| **Light: band and field** | Only the key contour exists, as **one band** with a spectral gradient across its width (ultramarine edge → white core → amber edge) inside a faint energy field. | **Band width** (2.2 → 9.9 units), **intensity**, internal **filaments** (0 → 2 → 6, following the same path inside the band), **residue** particles (56 → 280 → 672). Never more outlines. | The band's two halves (channels) separate; at 0°/90°/180°/270° they rejoin into **one clear signal** with a single bright core | One silhouette; no outline stacking; black field stays dominant |
| **Matter: surface and relief** | **One object**: a graphite plate whose aperture is a concave bowl with a raised lip. The key contour is a soft Gaussian swell in that surface; channel B is a fine groove. Shaded per pixel from one light (float height field, anisotropic brushed micro-texture). | **Relief depth** (1.2 → 1.7 → 2.5), swell width, **surface frequency** (0 → 2 → 4 shallow undulations under the main relief), brushed micro-texture strength | The groove separates from the swell; at register it sits in the crest → one rolled profile | One lit object; no tubes, bevel filters or outlines |

## 2. Typography — two compositional concepts per family (≤ 2 faces per cover; one display treatment)

| Concept | Faces | Compositional behaviour | Single display treatment |
|---|---|---|---|
| **Ink A · Crop** | Big Shoulders Display (Black) + Space Mono | Oversized condensed name, bottom of the letters cropped by the trim; tiny notation column top-right (scale contrast > 15:1) | Contour **overprints** the name |
| **Ink B · Column** | Instrument Serif (+ italic) + Space Mono | Words stacked in a narrow serif column; italic track above it; notation at the opposite corner | Ink plates **knocked out** around the letters |
| **Light A · Axis** | Anybody (150 % width, light) + Martian Mono | Ultra-extended thin caps laid **on the signal axis**; track and catalog as corner notation | Band **masked by a slot** where the type sits |
| **Light B · Lit name** | Bodoni Moda italic + Martian Mono | Very large hairline italic **crossing** the signal | Light field **masked into the letterforms** (legible base; brighter where the band passes) |
| **Matter A · Blind emboss** | Bricolage Grotesque (condensed ExtraBold) + Martian Mono | Name **pressed into the same surface** as the relief; printed track and catalog only | **Surface embossing** (no ink) |
| **Matter B · Rim notation** | Syne (ExtraBold) + Martian Mono | Name set **around the aperture rim**, track around the inner foot, like a scale printed on an instrument edge | None |

Metadata is never treated. In Ink A the plates are cleared behind the notation block (a clear panel), so the catalog stays crisp (`crop-100pct-ink-notation.png`).

**Fonts** (all SIL Open Font License 1.1, from the official `github.com/google/fonts` repository; licence files and SHA-256 hashes in `fonts/`; not added to the app):

| Font | Repository path | Licence file |
|---|---|---|
| Big Shoulders Display (wght) | `ofl/bigshouldersdisplay` | `OFL-BigShouldersDisplay.txt` |
| Instrument Serif (Regular, Italic) | `ofl/instrumentserif` | `OFL-InstrumentSerif.txt` |
| Anybody (wdth, wght) | `ofl/anybody` | `OFL-Anybody.txt` |
| Bodoni Moda (opsz, wght; + Italic) | `ofl/bodonimoda` | `OFL-BodoniModa.txt` |
| Bricolage Grotesque (opsz, wdth, wght) | `ofl/bricolagegrotesque` | `OFL-BricolageGrotesque.txt` |
| Syne (wght) | `ofl/syne` | `OFL-Syne.txt` |
| Space Mono (Regular) | `ofl/spacemono` | `OFL-SpaceMono.txt` |
| Martian Mono (wdth, wght) | `ofl/martianmono` | `OFL-MartianMono.txt` |

## 3. Recommendation (strongest per family)

- **Ink → Ink A · Crop** (`integrated-ink.png`). The cropped condensed name is the dominant object. The printed contour crosses and overprints it, and a tiny notation column sits on a clear panel. This is the strongest scale tension in the lab. Ink B is a credible alternative for quieter releases.
- **Light → Light B · Lit name** (`integrated-light.png`). One luminous band crossing a large hairline italic name. The type literally *receives* the signal, which ties typography to the image without any chromatic effect on the type.
- **Matter → Matter A · Blind emboss** (`integrated-matter.png`). The plate, the relief and the name are one pressed object lit by one light. Matter B (rim notation) is a strong second and more legible in low light. It may be preferable if you find the emboss too quiet.

## 4. Known issues in this lab

- Light: at 100 % the band shows slight striation from the 16 offset strokes that build it (`crop-100pct-light-band.png`). A production version would need more offsets or a single gradient stroke per side.
- Matter: per-pixel shading costs about 1.5 s at 3000 px and about 110 ms at 900 px. It is fine for export and for the release (full) render; draft-while-dragging is required (already accepted).
- Ink B's knockout and Light A's slot are subtle at thumbnail size.

**Defects found and fixed during the lab:**
- Matter first read as outlines: an 8-bit height field quantised the swell into terraces. Fixed with a float height field and smoothing, plus a concave bowl surface.
- The Light gradient was swamped by the core.
- Ink A long names were over-cropped.
- Light B names were illegible outside the band.
- Matter A type was doubled and mushy, and its long track collided.
- Light B's long track collided with the catalog.
- The Ink catalog sat over contour lines.

## 5. Rejection list (removed from the previous lab)

| Removed | Why |
|---|---|
| Anton, Inter and Archivo as hero cover type | Generic, not characterful (operator decision); Plex is kept only as a future UI candidate |
| Colour fringes on Light typography | Read as generic chromatic aberration (operator decision) |
| Rendering every pass as an equal outline (10–24 similar contours) | No hierarchy; replaced by dominant contour + capped echoes (Ink), one band (Light), one relief (Matter) |
| Density = more full copies of the curve | Now build-up / intensity / depth (see §1) |
| Glass and metal applied per line; bevelled tubes; anisotropic per-segment metal strokes | Literal material effects on every curve; replaced by one lit surface |
| Light "spectral bands" built from many glowing passes, and the three-wavelength core split | A bundle of glowing wires; replaced by one band with a cross-width gradient and a two-channel core |
| Signal-residue-only Light treatment | Too faint to carry a cover; residue survives only as Density-driven particles inside the band |
| Separate stochastic-screen Ink treatment | Folded into Ink as how tints print (the ink spread is screened), not a separate look |
| Per-pixel paper grain | Replaced by a crisp, quantised tooth tile (export-size discipline from Stage 1) |
