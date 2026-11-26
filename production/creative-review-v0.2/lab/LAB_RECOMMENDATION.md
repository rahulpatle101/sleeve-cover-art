# Material, Wave & Typography Lab — recommendation

**Status:** FOR CREATIVE APPROVAL · 2026-11-26 · static lab only · `src/` untouched (Stage 1 snapshot 68/68) · no panel, no new modes

The lab is `lab.js`, run in the dev-server page. It only *reads* the app's geometry and composition modules. All outputs are in `out/`. **Recipes:** Harmonic 3:4 and Radial 3:2, both Φ 045° · 10 passes · seed `01352905`. All covers are rendered at 3000 × 3000; all crops are **true 1:1** slices of the 3000 render.

## How every treatment is driven by the recipe

| Recipe input | Ink | Light | Matter |
|---|---|---|---|
| Form / Rhythm | silhouette | silhouette | silhouette |
| Density | ink build-up (more overlapping ribbons / higher screen tone) | signal intensity (band energy scales with passes; particles = 40 + 14·passes) | material stacking (more translucent layers / more metal bodies) |
| Phase / Registration | plate-B misregistration (and the overprint plate on the display name) | wavelength separation of the hot core (amber / neutral / ultramarine); zero at 0°/90°/180°/270° | refraction offset (glass) / brass channel offset (metal), 55 % of registration |
| Seed | ink pressure profile, paper tooth, screen dots | particle positions | (grain only) |

`registration-sequence.png` shows all three from 0° to 90°, with 1:1 detail rows: **IN REGISTER at 0° and 90°**, with 18.8 / 27.0 / 19.4 px offsets at 22° / 45° / 67°.

## Deliverables

| # | Deliverable | File(s) in `out/` |
|---|---|---|
| 1 | Family sheet, two treatments each | `family-treatments-sheet.png` (Ink: dry-ink ribbon / stochastic screen · Light: spectral bands / signal residue · Matter: glass ribbon / brushed metal) |
| 2 | Harmonic **and** Radial | same sheet: columns A-Harmonic, A-Radial, B-Harmonic, B-Radial |
| 3 | Typography specimen (normal / long / uppercase) | `typography-specimen.png` |
| 4 | True 100 % crops | `crop-100pct-{inkRibbon,inkScreen,lightBands,lightResidue,matterGlass,matterMetal}.png`, `crop-100pct-type-ink.png`, `crop-100pct-catalog-ink.png`, `crop-100pct-type-light.png` |
| 5 | Registration sequence 0° → 90° | `registration-sequence.png` |
| 6 | Integrated cover per family | `integrated-ink.png`, `integrated-light.png`, `integrated-matter-metal.png` (recommended) and `integrated-matter.png` (glass alternative) |

## Typography — three pairings, two faces per cover (all SIL Open Font License 1.1)

| Family | Display | Support | Treatment on large type only |
|---|---|---|---|
| **Ink** | **Anton** (condensed) | **IBM Plex Mono** 400/500 | Vermilion overprint plate offset by ½ registration + light paper-tooth dropout. Catalog untreated |
| **Light** | **Inter** 300 (grotesk) | **IBM Plex Mono** (catalog); Inter 500 for the track label | Faint amber/ultramarine fringes that exist **only off register**; neutral body; no glow |
| **Matter** | **Archivo** extra-expanded 500 | **IBM Plex Sans** 400/500 | 1-unit bevel (lit edge toward the light, shade opposite); solid fill, **no chrome** |

| Font | Source | Licence | File (SHA-256 in `fonts/FONTS.sha256`) |
|---|---|---|---|
| Anton | github.com/google/fonts `ofl/anton` | OFL 1.1 (`fonts/OFL-Anton.txt`) | `Anton-Regular.ttf` |
| IBM Plex Mono | `ofl/ibmplexmono` | OFL 1.1 (`fonts/OFL-IBMPlexMono.txt`) | `IBMPlexMono-Regular.ttf`, `-Medium.ttf` |
| IBM Plex Sans | `ofl/ibmplexsans` | OFL 1.1 (`fonts/OFL-IBMPlexSans.txt`) | `IBMPlexSans-VF.ttf` (wdth, wght) |
| Inter | `ofl/inter` | OFL 1.1 (`fonts/OFL-Inter.txt`) | `Inter-VF.ttf` (opsz, wght) |
| Archivo | `ofl/archivo` | OFL 1.1 (`fonts/OFL-Archivo.txt`) | `Archivo-VF.ttf` (wdth, wght) |

All five can be bundled with the app; OFL requires shipping the licence text alongside and not selling the fonts on their own. No reference or proprietary typography is used. The extracted SkillUI fonts were not touched.

**Long names:** artists wrap to two balanced lines. Long tracks wrap (Light) or shrink to a floor; no truncation in the specimen. **Defect found and fixed:** the long Light track first collided with the catalog column.

## Recommendation

### Strongest direction per family

- **Ink → dry-ink ribbon + Anton/Plex Mono** (`integrated-ink.png`). Pressure-varying ribbons, ink spread, paper tooth showing through and broken edges read as printed matter; the overprinted display name is the most "album cover" result in the lab. The **stochastic screen** is the more convincing *print* at 100 % but slightly heavier; keep it as Newsprint's or Carbon's plate-B option rather than a separate set.
- **Light → spectral bands + Inter/Plex Mono** (`integrated-light.png`). Broad low-energy bands stepped along the approved ramp, with one bright core, replace "many equal outlines". **Signal residue is not recommended as a main treatment:** too faint and small at cover scale. Its particles could be a subtle add-on to Spectrum at high Density only.
- **Matter → brushed metal + Archivo Expanded/Plex Sans** (`integrated-matter-metal.png`). The anisotropic highlight (bright only where the stroke crosses the light) is the most *physical* effect in the lab and needs no decoration. **Glass** is credible but still the least differentiated; it can remain the second Matter set (Cobalt Glass) with the ribbon bodies from this lab.

### Meaningful vs decorative

| Meaningful (keep; each encodes a recipe input or a material law) | Decorative (rejected or limited) |
|---|---|
| Plate-B misregistration (Phase) · ink build-up (Density) · seeded pressure / tooth / screen (seed) | Generic grain on every set (keep only where it is the material: paper) |
| Core wavelength separation tied to Phase, zero at the detents | Permanent RGB split; the first version's green channel (removed: ramp colours only) |
| Anisotropic metal highlight from stroke direction vs light | Bloom/halo around type (not used) |
| Glass bevel + thickness shadow + refraction offset (Phase) | Caustic: a single faint one is acceptable; more would be decoration |
| Overprint plate on the Ink display name (follows registration) | Optical fringes on Light type are borderline: keep at the current 0.15× strength or drop |

### Is a shader necessary?

**Not for the approved looks.** Every treatment was produced by the existing Canvas 2D approach: paths, per-segment strokes, compositing modes, `filter: blur()`, and one CPU per-pixel pass (the stochastic screen). Nothing approved needs WebGL to *look* right.

The open question is **interactive frame rate**. Full material renders at the 1468 px preview take about **41–75 ms** (Light residue 41 · Glass 42 · Light bands 58 · Ink ribbon 71 · Metal 75 · Ink screen 75, including a readback), against a 16.7 ms frame. Recommended approach before considering shaders:

1. During an active drag, draw a **draft pass** (geometry + plate colours, no texture, blur or screen) at 60 fps.
2. On settle (about 120 ms idle), render the full material once. The settled preview stays byte-identical to export.
3. Cache texture tiles per seed (already the Stage 1 pattern).

A shader becomes justified **only if** you want the full material visible *during* the drag (live ink screening, live blur bands, live anisotropic shading at 60 fps). That is an interaction-feel decision, not an image-quality one.

### Performance and export risks

- **PNG size:** the lab's integrated covers are **9.1–15.1 MB**, because the lab uses per-pixel grain, blur and FM screening. Stage 1's fix (quantised, crisp, tiled texture) must be applied to the tooth and grain; the FM screen and blur bands are inherently high-entropy. **Plan:** budget ≤ 8 MB per export, measured per set; offer JPEG only if the PNG budget fails (a product decision).
- **Export render time:** 134–356 ms per 3000 render, acceptable for a click-to-print action.
- **Cross-browser:** `CanvasRenderingContext2D.filter` (blur) has historically lagged in Safari. It must be verified on the operator's Safari before relying on it, with a fallback (multi-stroke soft bands without `filter`). `fontStretch` for Archivo's width axis also needs a Safari check. Variable fonts must be loaded via `FontFace` and awaited before export (pattern already in place).
- **Determinism:** all texture is seeded, so the same recipe gives the same pixels in one browser. Blur and antialiasing may differ slightly across browsers; this is acceptable (preview and export come from the same browser).
- **Bundle:** the five fonts total about 2.5 MB (variable TTFs). Subset to Latin and convert to WOFF2 at implementation time (licence permits).

## What stays unchanged

Recipe schema, both engines, Remix, registration law, compositions per family, accessibility model, export pipeline, and the Stage 1 renderer (paused, snapshot intact).
