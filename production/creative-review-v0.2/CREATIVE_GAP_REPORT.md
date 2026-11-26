# SLEEVE — creative gap report and v0.2 direction

**Status:** FOR CREATIVE APPROVAL · 2026-11-25 · application code untouched (release candidate `release/dist` unchanged)

**Labels used:**
- **[IMPLEMENTED]**: behaviour in the current release, observed and tested.
- **[REFERENCE]**: verified extraction evidence (`research/DESIGN_DNA_TRANSFER.md` row numbers).
- **[PROPOSED]**: v0.2 creative direction, not built.

The three concept covers below were rendered with the app's unchanged geometry engine by a throwaway script (`concept-covers.js`). The panel is a static HTML mock (`instrument-panel-concept.html`). Neither is app code.

---

## 1. Why the current interface reads as a settings panel

- **Form order, not signal order [IMPLEMENTED].** The panel reads top to bottom as text fields, a segmented option, a grid of dials, then a footer of buttons. That's the anatomy of a preferences dialog. Nothing says "signal flows from here to the print".
- **Identical, small, ungrouped dials.** Five 56 px dials auto-fill a grid. Form and Rhythm (one ratio) sit apart from each other with the same weight as Palette (a list index). The large number is the loudest thing on each control, so they read as labelled spinners.
- **Controls are disconnected from the art.** The cover sits in one card and the controls in another. Turning a dial changes the image, but no mark on the cover answers back.
- **Palette is an administrative control:** a 1–6 index on a rotary, used for a categorical choice.
- **The two widest elements in the panel are white form boxes** (Artist, Track), so the top of the instrument looks like a sign-up form.
- **Instructional copy** ("Drag a dial up or sideways…") compensates for controls that don't explain themselves.

## 2. Why the covers read as variations of one template

- **One fixed imposition [IMPLEMENTED].** Every cover has the same skeleton: the meta line top-left and top-right, one figure centred in the same box, a light artist bottom-left, a bold track beneath. Only the curve changes (`release/screens/audit-*`).
- **One layering signature.** Density always means concentric scaled copies (scale 1 → 0.42) with an alpha falloff. That "nested echo" is the dominant visual idea in every cover, whatever the engine or ratio.
- **Single centred figure at constant scale.** The bounding-box fit guarantees safety but also guarantees sameness: no bleed, no crop, no tension with the trim.
- **Flat material.** Solid backgrounds, uniform hairlines, alpha strokes. No paper, no ink, no overprint, so nothing feels made by a process.
- **The meta line announces the machine** ("HARMONIC 3:4 · 045°") as a headline rather than a colophon.
- The 96% keep-rate measured "worth keeping", not "distinct from each other". The audit improved quality inside the template; it didn't break the template.

## 3. Where each craft discipline remains shallow

| Discipline | Current [IMPLEMENTED] | Gap |
|---|---|---|
| Visual | Clean hierarchy; system grotesk; flat shell and cover | No material language. Cover type has no relationship to the figure. One imposition. |
| Interaction | Robust drags (dead zone, axis lock), keys, touch | Every dial behaves identically. No control has a *meaningful* resistance or detent. No signature gesture. |
| Motion | 240 ms art crossfade; reduced-motion cut | Motion only hides change. Nothing expresses the maths or the making. Export has no moment. |
| Sensory | Click-free two-voice pluck, balanced | The mapping is arbitrary (palette sets the root note). Sound and image share parameters but not *meaning*. |
| Emotional | Finished first cover; "Exported ✓" | Ownership is a filename. Printing feels like saving a file, not committing a sleeve. The first cover carries someone else's name. |
| Editorial | Honest, concise, no overclaims | Labels name variables (Form, Rhythm, Palette 1), not acts. The meta line is machine-speak. No vocabulary of a craft. |

## 4. Preserve unchanged

- **Recipe, bounds, validation boundary, deterministic seeded Remix** (all curated distributions and their tests).
- **Both geometry engines (Lissajous, rose) and `fitBox`.** v0.2 reinterprets how layers are *inked*, not the maths.
- **One renderer for preview and export**, and the art/type layer split.
- **Native range semantics:** keyboard (±1, coarse, Home/End), dead zone, axis lock, touch scroll split, natural-case names, VoiceOver behaviour.
- **Export pipeline:** synchronous encode, `aria-disabled` focus retention, live-region status, safe filenames.
- **Audio safety model:** opt-in, instant mute, nothing persisted, click-free voice, loudness balance.
- **Reduced-motion architecture** (cut, never slide).
- **Accessibility contract, 44 px targets, the test harness, and the scope:** one screen, two engines, one 3000 × 3000 PNG, no new features.

## 5. Decisions to reinterpret, not extend

| Existing decision | Reinterpretation [PROPOSED] |
|---|---|
| Density = concentric alpha copies | **Passes:** layers are ink passes. Two plates (A and B) print the same figure; passes thin and lighten as they build. |
| Phase = Lissajous δ only | **Registration:** Phase still sets δ *and* sets plate B's misregistration. The offset magnitude follows \|sin 2φ\|, so 0°, 90°, 180° and 270° are "in register". One control, two visible consequences. |
| Palette 1–6 (bg + 2 inks) | **Press set:** a curated paper + two-ink + blend (multiply/screen) + imposition. Still the same integer 0–5 in the recipe; shown as six physical swatches with radio semantics. |
| Meta headline | **Colophon:** small print slug from the recipe, e.g. "PLATE 01352905 · HARMONIC 3:4 · Φ 045° · 10 PASSES". Deterministic from the seed; no session counter. |
| Form + Rhythm as two equal dials | **Ratio pair** with one shared readout ("3 : 4 · perfect fourth"), which is honest because it's the audio frequency ratio too. |
| Remix | **New proof:** the same deterministic action, named as a press act. |
| Export PNG | **Print sleeve:** the same pipeline, given a commit ritual (§11). |
| Sound pluck per change | **Monitor:** plate A and plate B are the two voices; misregistration is heard as beating. |

---

## 6. Creative thesis [PROPOSED]

**SLEEVE is a two-plate optical press: you tune a figure through two ink channels until the plates register, then pull a print that is yours.**

## 7. Current vs proposed

| | Current v0.1 [IMPLEMENTED] | v0.2 [PROPOSED] |
|---|---|---|
| Metaphor | Settings for a generator | Calibrated optical printing press |
| Layering | Concentric alpha copies | Two overprinted plates × passes; misregistration as expression |
| Material | Flat fills, alpha hairlines | Paper stock, deterministic grain, multiply/screen inks |
| Composition | One centred imposition | Three impositions bound to press sets: bleed corner, optical gate, signal band |
| Type | Meta headline + artist/track | Title set in relation to the trim; colophon as print slug |
| Panel | Fields → options → dial grid → footer | Signal path: Plate → Ratio → Registration → Passes → Press set → Print |
| Signature | None | Register the plates (detented registration wheel) |
| Sound | Pluck; palette = root | Two plate voices; misregistration = audible beating; print = roller sweep |
| Capture | "Exported ✓" | Plate A and plate B pass, colophon stamps, "Printed" |

## 8. Three static covers from the same recipe [PROPOSED]

Recipe: Harmonic · Form 3 · Rhythm 4 · Phase 45° · Density 10 · "Mira Okafor / Tidewater". Only the press set differs. Comparison: `cover-v01.png` (current release, same recipe).

1. **Newsprint** (`cover-newsprint.png`): warm stock; vermilion plate under a black plate (multiply), misregistered along 45°. The figure bleeds off the top-left trim. The title sits right-aligned in clear paper; the colophon is a single slug bottom-left with a registration mark.
2. **Cobalt gate** (`cover-gate.png`): cool stock; yellow and cobalt plates seen through a circular optical gate with corner registration marks. The colophon runs across the head; artist and track sit on one baseline at the foot.
3. **Night run** (`cover-night.png`): black stock; light instead of ink. Two additive signal channels (orange and cyan) recombine to near-white where they register, with faint scan banding. The track label and artist are at the top; the colophon and maker's mark at the foot.

The same maths gives three objects that feel printed by different runs of one press. **Concept caveats:**
- The Cobalt gate overprint is still slightly heavy where the plates cross.
- The colophons in the renders say "PROOF 01"; v0.2 must derive the slug from the seed (deterministic), not a counter.
- Grain must be a deterministic tile scaled to the cover size so preview and export stay identical.

## 9. Instrument-panel composition [PROPOSED]

`instrument-panel-concept.png` (1440 × 900):
- **Press bed (left):** the cover sits on a graphite bed with trim registration marks. Artist and Track become the **sleeve label** beneath the print: underlined fields set in cover type, not white form boxes.
- **Signal path (right), numbered:**
  1. **Plate**: Engine keys.
  2. **Ratio**: Form and Rhythm knobs with tick rings flank one large "3 : 4" readout.
  3. **Registration**: the large knurled wheel, the signature control, with an "off register · 0.6 mm" meter.
  4. **Passes**: Density knob with a pass ladder.
  5. **Press set**: six paper-and-ink swatches.
- **Actions:** New proof · Monitor · **Print sleeve**.
- **Reference vs proposal:**
  - **[REFERENCE]** value-first readouts (row 4); scarce functional hue (row 3); circles reserved for turnables (row 5); inset selection ring (row 7); flat depth (row 13).
  - **[PROPOSED]** every control's physical character (tick rings, knurling, detents, the press-bed material). The extraction captured **no** UI controls.
  - **Impersonation check:** no device silhouette, keycap grid or brand colours; the press metaphor is SLEEVE's own.

## 10. Signature interaction: "Register the plates" [PROPOSED]

1. **Grab** the Registration wheel (or focus it). Plate B's crosshair appears at the cover margin beside plate A's.
2. **Turn.** Plate B slides along the registration angle. The meter reads the offset; with Monitor on, the two plate voices beat faster as the offset grows.
3. **Approach a register point** (0°, 90°, 180° or 270°, within ±3°). Drag gain halves (magnetic resistance) and the crosshairs converge.
4. **Detent.** At exact register the crosshairs merge, the meter reads **IN REGISTER**, the beating resolves to a pure interval, and the wheel gives a 1 px detent tick (dropped under reduced motion).
5. **Keyboard:** arrows keep ±1°. Page Up/Down **jumps to the next register point**, which reinterprets the coarse step rather than adding a feature.

## 11. Motion choreography [PROPOSED]

- **Tuning:** values change instantly; plates move with the hand (no easing lag).
- **New proof:** a 240 ms crossfade of the art layer only. Type stays crisp (kept from v0.1).
- **Print sleeve, about 900 ms, non-blocking:**
  1. The button depresses and reads "PRINTING".
  2. **Plate A rolls on** top to bottom (350 ms wipe), with the roller sweep in sound if Monitor is on.
  3. **Plate B follows**, offset by registration (350 ms).
  4. The colophon **stamps** (100 ms, no scale effect).
  5. The PNG encodes *after* the wipe, then the live region announces "Sleeve printed — 3000 × 3000 PNG" and the button reads **Printed ✓**.
- **Reduced motion:** no wipes or stamp; an immediate final frame, the same announcement, the same file.

## 12. Deliberately unchanged

The scope, the recipe and its determinism, both engines and their bounds, preview = export, the native-slider accessibility model, the export reliability fixes, the audio safety model, reduced-motion behaviour, 44 px targets, and the test harness. **No new controls:** Press set and Registration are reinterpretations of Palette and Phase.

## 13. Smallest change set for a major perceptual improvement [PROPOSED]

**Two moves, in this order:**
1. **Renderer: two-plate overprint and press sets** (`renderArtwork` + `palettes` only).
   - Draw the existing traces twice as plate A and plate B, with plate B offset by \|sin 2φ\|.
   - Use per-set blend (multiply/screen) and a deterministic paper grain.
   - Bind three impositions (bleed corner, optical gate, signal band) to the six press sets.
   - Turn the meta line into a seed-derived colophon.
   - This alone turns "variations of a template" into "prints from a press", and export inherits it for free.
2. **Panel re-composition plus the Registration wheel.**
   - Regroup into the signal path, with the ratio readout, the larger detented Registration wheel, swatch radios for Press set (same integer), and the sleeve label under the cover.
   - Rename the actions (New proof, Print sleeve).
   - Implemented inside the existing `RotaryControl` (size and detent options), not a new control.

The print ritual and the beating-based audio mapping are the next layer. They're high value but secondary to the two moves above.

**Main risks:**
- **Type contrast:** type must stay on paper and never sit over ink.
- **Fidelity:** grain must be identical between preview and export.
- **Phone layout:** the panel must stay comfortable at 360 px.
- **Familiarity:** the press metaphor must stay legible to musicians who've never seen a press. A short sublabel under each section ("engine", "density") keeps the old vocabulary.
