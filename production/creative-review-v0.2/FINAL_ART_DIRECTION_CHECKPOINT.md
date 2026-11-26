# v0.2 final static art-direction checkpoint

**Status:** FOR FINAL ART-DIRECTION APPROVAL · 2026-11-25 · `src/` untouched (Stage 1 snapshot verifies 68/68) · no panel built

All evidence is in `final-studies/`. Every cover uses **one recipe**: Harmonic 3:4 · Φ 045° · 10 passes · "Mira Okafor / Tidewater". Covers are rendered at **3000 × 3000** by `final-studies.js`, a throwaway study script that reads the app's unchanged geometry and composition. Material crops are 1:1 (900 × 900 px from the 3000 render). All of this is **[PROPOSED]** art direction, not implemented behaviour.

| Brief item | Result | Files |
|---|---|---|
| 1 · Revise Cobalt Glass | Translucent wide bodies (overlaps stack); **one directional bright edge** fading top-left → bottom-right; **darker opposite edge** strengthening away from the light; restrained channel-B refraction (thin, 55 % of the registration offset); **one caustic** (a soft ellipse on the stock below-right); faint blurred depth shadow; rim lit on one side and shaded on the other, no full bright outline. No bloom, flare, glints or chrome text. | `cover-glass.png`, `crop-glass-100pct.png` |
| 2 · Create Spectrum | Two channels; passes step through **one controlled ramp**, ultramarine (outer) → neutral → amber (inner). Each pass is a thin core plus a faint energy band (signal, not neon). One accent relationship (blue ↔ amber); no magenta/cyan. Calibration ticks at the margins on the figure's axis instead of a drawn baseline. No scanlines, glitch, grid floor, text bloom or aberration. Large black field; shared catalog column and index "03". | `cover-spectrum.png` |
| 3 · Create Chrome | Geometry rendered as metal: brushed bodies with **one specular band** crossing diagonally; a dark lower-right bevel and a light upper-left bevel (directional reflection); cast shadow (thickness); neutral graphite and silver; **one restrained accent**: brass channel B and the track label. Matter aperture with a machined rim. No disc or record object, flare, glint, chrome text or black futuristic UI. | `cover-chrome.png`, `crop-chrome-100pct.png` |
| 4 · Family comparison | One sheet grouped **INK · LIGHT · MATTER**, each with two related sets, same recipe and identity text. | `family-contact-sheet.png` |

## What the family sheet demonstrates

- **Three distinct material families:** Ink (stock + overprinted plates, bleed crop), Light (emitted signal on dark stock, field or horizon), Matter (lit solid inside an aperture).
- **Two related sets per family:**
  - Newsprint and Carbon share layout, index numeral and catalog column.
  - Spectrum and Horizon share dark stock, emitted light and the amber accent relationship.
  - Cobalt Glass and Chrome share the aperture, top-left light, rim treatment and head colophon.
- **One SLEEVE grammar:** the same two channels and registration law; the same type system (light-weight artist, tracked-capitals track); the same catalog vocabulary (`FAMILY · NN`, `PLATE …`, `HARMONIC 3:4`, `Φ 045° · OFF REGISTER`, `10 PASSES`); one accent per cover; no brand watermark.
- **No copied reference layouts** (checked against R01–R16 in `USER_REFERENCE_SYNTHESIS.md`): no reference grid, object, mark or text is reproduced. Spectrum uses margin calibration ticks *instead of* the reference's drawn baseline. Chrome is applied to the geometry, not to a disc.
- **No cyberpunk or hardware pastiche:** no neon pair, scanlines, glitch, flare or glints; glow only in the Light family, where it is the subject; the UI is not depicted on covers.

## Notes for the reviewer

- Cobalt Glass took two iterations. The first revision still had uniformly bright edges at 100 %; the directional gradient on both edges fixed that.
- Studies are at full export size and range from 7.4 to 15.3 MB per PNG, because the study script uses per-pixel grain and blur. The production renderer will need the same compression discipline used in Stage 1 (quantised, crisp grain), so these sizes are not representative of exports.
- Implementation of these six sets, the panel and the design system remains **paused** pending your approval.
