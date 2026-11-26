# SLEEVE v0.2: renderer implementation checkpoint

Status: **stopped for approval.**

Out of scope, as instructed: panel redesign, design system, motion, registration feedback, sound and the Print ritual. The v0.1 release in `release/` is unchanged; `dist.sha256` is 3/3 OK.

Evidence lives in `production/creative-review-v0.2/renderer-checkpoint/`. While the local gallery server is running it is also at `http://127.0.0.1:8791/renderer-checkpoint/`.

## 1. What was implemented

### Six production sets

The `palette` value in the recipe selects the set. The schema is unchanged.

| Value | Set | Family rule as built |
|---|---|---|
| 0 | Ink · Newsprint | Two plates multiplied on warm stock. Plate A carries the key contour. Plate B carries the key contour, misregistered by Phase, plus one secondary contour and up to 5 hairline echoes. FM-screened ink spread, paper tooth and edge breakup. The cropped Big Shoulders name is printed first, so the plates overprint it. The Space Mono notation sits on a clear panel. |
| 1 | Ink · Carbon | The same press on carbon stock. Plates are drawn source-over and the name is `#EDEAE3`. |
| 2 | Light · Spectrum | One spectral band: ultramarine edge, white core, amber edge. Its two halves are the two channels, separated by Phase. Lit Name in Bodoni Moda Italic, with the band's light masked into the letters. Martian Mono track and catalog. |
| 3 | Light · Horizon | Spectrum's band on a night sky, with a lit horizon line and a faint band reflection below it. |
| 4 | Matter · Full Sheet | One continuous graphite surface. The contour is a float height field, pressed into the surface and lit by one light. Flat Bricolage condensed name. No circle, rim or aperture. |
| 5 | Matter · Macro Relief | The same surface, raised and magnified 1.75× as a material crop. Relief amplitude is ×1.15, the approved "slightly clearer at preview size" allowance. |

### Density uses the approved family meanings

These ranges are tested as monotonic and bounded in `scripts/verify.ts`.

- **Ink:**
  - echoes: 0 → 5 (capped);
  - impressions of the same contour: 1 → 5;
  - pressure range: 0.38 → 0.95;
  - screened spread: 0.7 → 3.3 base units;
  - edge breakup: 5 % → 15 %.
- **Light:**
  - band half-width: 2.5 → 9.9 base units;
  - intensity: 0.58 → 1.15;
  - internal filaments: 0 → 6;
  - residue particles: 28 → 672.
- **Matter:**
  - ridge width: 4.8 → 11.7 base units;
  - depth: 1.16 → 2.54;
  - shallow undulations: 0 → 4 (capped);
  - micro-brushing: grows with Density.

### Preserved

- Both engines, the recipe schema, `validateRecipe` and deterministic Remix.
- The registration law: `|sin 2φ|`, in register at 0/90/180/270, maximum `0.009·S`.
- The panel, keyboard model, reduced-motion cut, live-region export status, `aria-disabled` export and filenames.

### Fonts

Only the approved OFL faces are bundled. They are subset to Latin, Latin-1 and Latin Extended-A plus punctuation, and are static instances, so canvas needs no `fontStretch`. Total: 89 kB of woff2.

| Font | Size |
|---|---|
| Big Shoulders Display Black | 13 kB |
| Space Mono Regular | 17 kB |
| Bodoni Moda Italic, opsz 96 | 17 kB |
| Martian Mono 400 + 500, wdth 112.5 | 10 + 10 kB |
| Bricolage Grotesque Condensed ExtraBold | 21 kB |

Licences ship in `dist/licenses/OFL-*.txt`. Nothing from `research/extracted/` or `references/` is imported; I checked `src/` and `dist/assets`.

### Draft and full rendering

- **Tuning** (rotaries, text, palette) draws a simplified **draft** immediately.
  - The **full** material is drawn after 160 ms idle, and only once no pointer is held, so it renders on release.
- **Discrete changes** (engine, Remix) render the **full** material first, then crossfade only the art layer, as before.
- Settled preview and export both call `renderArtwork(…, 'full')`.
  - The canvas exposes `data-settled="true"` when the full frame is on screen. This attribute is for tests.
- There is no shader, and no `ctx.filter` anywhere. Blur is done by downsample/upsample or float box blurs, for Safari parity.

### Files

New:
- `src/artwork/families/{ink,light,matter,types}.ts`
- `src/artwork/raster.ts`, `fonts.ts`, `text.ts`
- `src/export/filename.ts` (pure, so Node checks can import it)
- `src/assets/fonts/*`, `public/licenses/*`

Rewritten:
- `renderArtwork.ts`, `composition.ts`, `palettes.ts`, `ArtworkStage.tsx`

Small edits:
- `exportPng.ts`: awaits `ensureFonts()`.
- `App.tsx`: the stage label and palette value text name the family, e.g. "2 of 6, ink Carbon".

## 2. Evidence index (`renderer-checkpoint/`)

| Requested | File(s) |
|---|---|
| All six sets × Harmonic and Radial × Density 2/10/24 | `grid-harmonic.png`, `grid-radial.png` |
| Normal / long / uppercase names | `names.png` (row 2 is "The Extraordinarily Long Weekend Ensemble" / "Songs For The Long Drive Home (Extended)") |
| One contact sheet, shared test recipe | `shared-recipe.png`: the default recipe (Night Office / Phase Garden, 3:4, 45°, d10), 6 sets × 2 engines |
| Unseen hold-out Remix sheet | `holdout-remix.png`: start seed `0x7E57A11E` ("Lumen Archive / Second Light"), never used in labs or tuning; 24 chained Remixes alternating engines |
| Real 3000 × 3000 exports | `exports/01…12-*.png`, downloaded through the app's **Export PNG** button: 6 sets × 2 engines |
| True 100 % crops | `crops/*.png`, native pixels cut from the real exports (ink line/name/notation, Lit Name, band, horizon, catalog, relief, macro relief and its catalog) |
| Preview/export comparison, file sizes, export times | `app-run.txt` (table in §3) |
| Settled-render and draft times | `timing.txt` (table in §3) |
| Desktop and mobile screenshots, existing panel | `screens/desktop-1280-*.png`, `screens/desktop-dragging-draft.png`, `screens/mobile-390-*.png` |
| Scripts (rerunnable) | `scripts/browser/v02-sheets.mjs`, `scripts/browser/v02-app.mjs` |

## 3. Measurements

All numbers are TESTED in headless Chrome on this Mac. The preview canvas is 734 CSS px at DPR 2, so 1468 px.

### Render times (`timing.txt`)

Medians in ms. Each timed render includes a 1-pixel `getImageData` flush, so deferred GPU work is counted.

| Family | Draft @1468 | Full @1468 (settled preview) | Full @3000 | PNG encode @3000 |
|---|---|---|---|---|
| Ink (both sets) | 6–15 | 33–54 | 96–147 | 92–111 |
| Light Spectrum | 6–11 | 18–28 | 45–89 | 70–101 |
| Light Horizon | 22–25 | 34–42 | 45–70 | 168–186 |
| Matter (both sets) | 2–9 | **262–283** | **1203–1270** | 78–137 |

### Real UI exports (`app-run.txt`)

| Set | Click → file (ms) | PNG size (MB), H / R | Export vs preview, max 12×12 block mean diff (/255) |
|---|---|---|---|
| Ink Newsprint | 308 | 4.62 / 4.76 | 3.41 / 3.13 |
| Ink Carbon | 307 | 4.03 / 4.09 | 3.42 / 3.11 |
| Light Spectrum | 207 | 3.98 / 3.58 | 3.68 / 4.53 |
| Light Horizon | 307 | **8.77 / 8.63** | 4.37 / 4.89 |
| Matter Full Sheet | 1420 | 5.16 / 4.34 | 3.28 / 3.27 |
| Matter Macro Relief | 1418 | 5.37 / 6.27 | 5.29 / 3.57 |

All 12 exports are 3000 × 3000. The live region announced "Artwork exported — 3000 × 3000 PNG." each time. The per-pixel mean difference for Ink (17–19) comes from the stochastic screen resolving at a different scale; it is expected, and the block means show the composition matches.

### Settled preview ≡ renderer

- For all 12 set × engine cases, the settled stage equals `renderArtLayer('full')` + `renderTypeLayer` rerun from scratch through the same stage pipeline: **0 differing channels**.
- Drawing `renderArtwork` straight onto the on-page canvas differs only on Light, inside the Lit Name box: about 7.1k channels, max 134, roughly 0.06 % of the frame. The cause is that Chrome rasterises glyph edges slightly differently on an on-page canvas than on an off-page one. Offscreen, Light is bit-identical across direct, two-step and over-drawn renders.

### Settle behaviour

- Keyboard step: draft on the same frame; the full frame arrives 174–189 ms later.
- Pointer drag held still for 500 ms: the frame stays draft (`settled=false`). The full frame arrives at release.
- Palette changes to Matter settle in 406–432 ms: 160 ms idle plus about 270 ms full render.

### Regression

- `node scripts/verify.ts`: **ALL PASS**. This includes the new Density-meaning, placement, catalog and per-set contrast checks; minimum cover-text contrast is 6.25.
- `npm run build`: **PASS**. JS is 255.8 kB (82.0 kB gzip), plus 89 kB of fonts.
- `scripts/browser/drive.mjs` passes:
  - tab order unchanged;
  - Arrow, Shift, Home/End and PageUp all behave;
  - pointer drag clamps;
  - Remix is deterministic across reloads, with **canvas pixels identical**;
  - export works;
  - no targets under 44 px;
  - 360 px width with no horizontal scroll;
  - reduced motion is honoured;
  - **no console errors**.

## 4. Failures found and fixed during this checkpoint

1. **Full Sheet placement.** The lab used 0.78 S at y 0.42. On every tall figure the relief reached 0.03 S, through the head catalog, and with ridge and offset it touched the foot track. Changed to **0.70 S at y 0.445**. A verify check now covers 9,600 combinations: the relief stays within 0.055–0.835 S. This is a **compromise**: the figure is about 10 % smaller than in the approved study.
2. **Horizon, long two-line Lit Name.** The second line collided with the right-aligned catalog. The name block now lifts so its last baseline is at or above 0.80 S (`crops/10-light-horizon-*.png`).
3. **Verify imported the font URLs** through `exportPng.ts`, which Node can't load. The pure filename function moved to `src/export/filename.ts`.
4. **Harness bugs, not app bugs:**
   - My first identity test reconstructed the palette from the 1-based dial and reported false mismatches.
   - Duplicate download names were overwritten, because the filename has no palette.
   - Light timings looked unrealistically fast without a GPU flush.
   
   All three were fixed in the scripts and re-run.

## 5. Compromises and weakest combinations (honest list)

1. **Weakest: Matter Macro Relief × Harmonic.** At 1.75× the crop of a Lissajous figure often reads as a few diagonal grooves (`grid-harmonic.png` column 6; hold-out #21). It is material-true but the figure is unrecognisable. Radial macro reads well. A placement-only fix, a different crop centre for Harmonic, is possible but needs your call, since static exploration is closed.
2. **Matter full render blocks the main thread** for about 270 ms at preview size, after the 160 ms idle, and for about 1.2 s on export. There is no jank while dragging, because drafts are used. A Worker/OffscreenCanvas port would remove it; that is not done.
3. **Draft → full is an instant swap.** The draft is clean vector line work; the full frame adds screen, tooth, band glow or relief. The change is visible on release. Smoothing it belongs to the motion stage, which you held back.
4. **Ink Newsprint at Density 18–24** gets heavily speckled. That is the approved "ink spread + breakup" meaning, but it sits at the edge of noise (`crops/01-ink-newsprint-line.png`).
5. **The Lit Name effect is subtle.** Letters are mostly the legible base fill and brighten only where the band crosses them. That is legible by design, but quieter than the hero study at small sizes.
6. **Horizon PNGs are about 8.7 MB**, the largest, because of the smooth sky gradient and reflection. All other sets are 3.6–6.3 MB.
7. **The notation clear panel** (Ink) is visible as a clean rectangle where heavy plates pass behind the notation. This is the approved rule; it is noticeable at Density 24.
8. **Canvas `letterSpacing`** is feature-guarded. Where a browser lacks it, tracking falls back to 0, with no layout break, because widths are measured with the same state.

## 6. Not verified (needs you): Safari font and blur check

Safari automation is disabled on this machine, so **Safari is UNTESTED**. Firefox is also untested; its headless screenshot failed earlier. To check by hand, open `http://localhost:5183/` in Safari and look for:

- **Fonts:**
  - condensed black caps on Ink;
  - an italic high-contrast serif on Light;
  - a condensed bold sans on Matter;
  - mono notation.
  
  Any Helvetica-looking cover type means a font failed to load.
- **Blur:**
  - the Light band has a soft spectral glow rather than hard stripes;
  - the Ink spread is a speckled halo;
  - the Matter relief is smooth with no terracing.
- **Export:** a 3000 × 3000 PNG downloads and looks the same as the preview.

The design itself avoids the known Safari gaps: no `ctx.filter`, static font instances, and FontFace loading awaited before every render.

## 7. Gate status

| Check | Result |
|---|---|
| Six sets in both engines, from one recipe | TESTED — PASS |
| Density = approved family meanings | TESTED — PASS (verify plus grids) |
| Deterministic Remix, registration | TESTED — PASS |
| Only approved OFL fonts bundled, licences shipped | TESTED — PASS |
| Draft while dragging, full after release | TESTED — PASS |
| Settled preview and export share the full renderer | TESTED — PASS (pipeline identity 0; export block diff ≤ 5.3/255) |
| Keyboard, accessibility, reduced motion, export behaviour | TESTED — PASS (`drive.mjs`) |
| v0.1 release preserved | TESTED — PASS (`release/dist.sha256` OK) |
| Safari fonts / blur | **UNTESTED** (manual check requested) |

**Stopped here for approval.** Not started: design system, panel, motion, registration feedback, sound, Print ritual.
