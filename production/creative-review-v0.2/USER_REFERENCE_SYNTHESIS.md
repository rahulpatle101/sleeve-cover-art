# SLEEVE v0.2 — user reference synthesis

**Status:** FOR CREATIVE REVIEW · 2026-11-25 · `src/` untouched (Stage 1 snapshot verifies 68/68)

**Synthesis (operator):** precision hardware × radical editorial layout × optical material and light.

**Thesis (operator):** **SLEEVE is a visual mastering instrument: two signal channels register into an album object made from ink, light or matter.**

## Evidence labels used here

- **[USER-REF]**: the 16 operator-curated images in `references/` (cited as R01–R16 below). These are **PROPOSED art-direction inspiration**, *not* extracted design-system evidence.
- **[VERIFIED — EXTRACTION]**: SkillUI design DNA, via `research/DESIGN_DNA_TRANSFER.md` row numbers. This governs the **interface**.
- **[IMPLEMENTED]**: Stage 1 renderer behaviour.
- **[PROPOSED]**: v0.2 direction in this document.

**Reference index** (descriptions only; no names, marks or text reproduced):

| ID | File prefix | What it is |
|---|---|---|
| R01 | `01cb400f` | Grainy grey collage; one repeated red frame, sequenced across the field |
| R02 | `0356c99b` | Black poster; huge cropped display word in the lower third; tiny catalog columns |
| R03 | `2fbfaae8` | Pale synth chassis; one large central knob; two small coloured lamps |
| R04 | `536648db` | Photographic cover with one fluorescent accent and a vertical type band |
| R05 | `6ea7d21b` | Edge-lit transparent letterforms over a blue horizon gradient |
| R06 | `70d0a36f` | Two-tone grainy print; giant cropped shapes; centred word plus phonetic microcopy |
| R07 | `a2be9900` | Graphite turntable; one hero platter; tiny microcopy; two red buttons; meter |
| R08 | `a68e3cc4` | Thermal false-colour light field |
| R09 | `c9b2d806` | Chromatic concentric rings on black |
| R10 | `cc1d3dbb` | Modular panel with calibrated scales, segmented arc and LED row |
| R11 | `ddce2277` | Editorial card: grain, two image panes, catalog microcopy, index codes |
| R12 | `e47ec398` | Horizon band of light with reflection |
| R13 | `ed20319f` | Particle-density sphere on black |
| R14 | `f152a935` | Massive condensed display type, halftone, tracklist microcopy |
| R15 | `f39a14d0` | Chrome disc with a specular streak and spectral flare |
| R16 | `f4deaf1a` | Layered waves, each pass a step on a colour ramp; index numeral; footer specs |

---

## 1. Recurring qualities [USER-REF]

1. **One dominant object on a vast quiet field:** R02, R05, R07, R09, R12, R13, R15. Negative space is the material, not leftover.
2. **One functional accent:** R01 red, R04 fluorescent orange, R07 red buttons, R10 red LEDs. Colour means *this, here*.
3. **Material honesty:** paper tooth, grain, halftone, two-tone print (R01, R06, R11, R14); light as substance (R05, R08, R12, R16); matter with edges and specular response (R05, R13, R15).
4. **Calibration:** numbered tick scales, fractions, segmented arcs, LED rows (R10); one hero control (R03, R07). Instruments show their units.
5. **Quiet chassis:** monochrome bodies (R03, R07, R10) where the only "decoration" is function.
6. **Typography as composition:** a display word cropped by the trim (R02, R14), vertical bands (R04), restrained catalog microcopy in columns (R02, R07, R11, R14, R16), index numerals (R11, R16).
7. **Sequence and offset:** repeated frames (R01), stacked passes on a ramp (R16), concentric repetition (R09). The same idea as SLEEVE's passes and registration.
8. **Intentional crops:** the subject meets or leaves the edge on purpose (R01, R06, R08, R14).

## 2. Borrow, translate, reject [PROPOSED]

| | What | From |
|---|---|---|
| **Borrow (principles)** | Negative space as a compositional element; one accent per object; catalog microcopy as data; calibrated scales and numerals; one hero control; sparse status lamps; grain as material | R02 R03 R07 R10 R11 R16 |
| **Translate** | Ramped passes → **Spectrum**: passes stepped across a two-channel light ramp | R16 |
| | Horizon band and reflection → **Horizon**: the figure sits on a lit line and is coloured by its distance to it | R12 |
| | Edge-lit transparent forms → **Cobalt Glass**: lines as glass (body + lit edge + refraction) | R05 |
| | Specular streak → **Chrome**: one directional highlight band across metallic strokes; no flare | R15 |
| | Two-tone print with one fluorescent → **Carbon**: gloss-black key plate plus one fluorescent channel | R01 R04 R06 |
| | Segmented arc → the Passes meter; numbered scale → the Registration wheel | R10 |
| **Reject** | All logos, wordmarks and label marks; all copy (titles, phonetics, advisories, specs); photographs of people or places; plastic-wrap and vinyl-mockup pastiche; the specific poster, card and cover layouts (R02, R04, R11, R14); product silhouettes (keyboard synth, modular panel with jacks, turntable); the chromatic ring disc (R09) and chrome-disc object (R15) as compositions; star glints and lens flares | all |

## 3. The SkillUI design DNA still governs the interface [VERIFIED — EXTRACTION]

The user references steer the **artwork** and the *character* of the controls. The verified ledger still sets the **interface rules**:

- **Row 1, light neutral shell:** the cover is the darkest and most saturated object. The chassis stays quiet and light, never a dark neon UI.
- **Row 2, grey ramp carries hierarchy:** labels, scales and microcopy stay in the grey ramp.
- **Row 3, scarce functional hues:** one lamp colour (register/monitor) plus the selected material's accent, always paired with text.
- **Row 4, value-first readouts:** large numerals ("045°", "3", "4", "10"), small caps labels.
- **Row 5, zero radius except turnables:** keys and swatches are square; only the wheel and knobs are round.
- **Row 6, one solid primary action:** Print sleeve.
- **Row 7, inset selection ring:** engine and material.
- **Row 10, fluid scale with fixed minimums:** 44 px targets.
- **Row 11, breakpoints:** 480 / 768 / 1200.
- **Row 12, reduced motion:** continuous motion stops.
- **Row 13, flat surfaces:** **no glassmorphism, blur or glow in the UI**. Glow and glass exist only *inside the artwork*, where they are the subject.

## 4. Revised six-set structure [PROPOSED]

The recipe `palette` integer (0–5) is unchanged. Each family owns one composition, so material and layout move together.

| Family | Set | Stock | Channel A (key) | Channel B (registered) | Finish | Composition | Replaces (Stage 1) |
|---|---|---|---|---|---|---|---|
| **Ink** | **Newsprint** | warm newsprint | vermilion, multiply | black, multiply | paper tooth | bleed crop | Newsprint |
| | **Carbon** | charcoal stock | gloss black (varnish, a step above the stock) | one fluorescent ink | fine tooth | bleed crop + index numeral | Chalk |
| **Light** | **Spectrum** | black | cool light | warm light, screen | passes stepped along the A→B ramp | signal field | Night Run |
| | **Horizon** | night gradient | cool → white by height | amber, screen | lit horizon band + faint reflection | figure on the horizon | Moss |
| **Matter** | **Cobalt Glass** | cobalt gradient | glass: soft body + directionally lit edge | refraction (thin, offset) | shadowed thickness | aperture | Cobalt Gate |
| | **Chrome** | graphite | brushed metal stroke (light→dark→light) | one specular band | no flare, no bloom | aperture or edge crop | Ember |

Stage 1's **Night Run** (orange and cyan glow plus scanlines) is the set closest to the cyberpunk line. It is retired into Spectrum and Horizon, where light is physically motivated.

## 5. Shared visual grammar (why six sets are one instrument) [PROPOSED]

1. **The same two channels everywhere.** Channel A (key) and channel B (registered) are always both visible. Material changes *how* a channel renders, never *whether* it exists.
2. **The same registration law.** Phase drives `|sin 2φ|` offset in every set [IMPLEMENTED]; plate B misregisters along the phase angle. "In register" means the same thing in ink, light and matter.
3. **The same trim grid and type system.**
   - 7 % margins.
   - Artist in a light grotesk; track in tracked capitals.
   - Catalog microcopy in one small-caps style.
   - The registration-mark glyph.
4. **The same catalog vocabulary:** `FAMILY · NN`, `PLATE {SEED}`, `{ENGINE} {F:R}`, `Φ {PPP}° · IN/OFF REGISTER`, `{N} PASSES`. Recipe-derived only; never a brand watermark.
5. **One accent per object.** Each set has exactly one hue that is "the colour"; everything else is stock and value.
6. **Material = three properties only:** stock, channel rendering, finish. No set may add a fourth kind of decoration.
7. **Composition is a family trait:** bleed (Ink), field or horizon (Light), aperture (Matter).

## 6. Interface principles [PROPOSED, within §3]

- **One dominant Registration wheel**, about 2.5–3× the other knobs.
  - Calibrated degree scale with numerals every 45° and ticks every 5°.
  - Four register detents (0/90/180/270) marked with the lamp colour.
  - Large readout beneath ("045°", "OFF 0.9 %").
- **Supporting controls:** Form and Rhythm flank the wheel as a ratio pair with one shared label ("RATIO 3 : 4 · PERFECT FOURTH"). Passes is a 24-segment meter with a numeral. Engine is two square keys.
- **Calibrated markings:** scale, tick and segment marks in the grey ramp. Numerals are tabular.
- **Sparse functional lights:** two lamps only, IN REGISTER and MONITOR, each with a text label. Lit = lamp colour; unlit = chassis grey.
- **Quiet chassis:** light neutral, one top rule, no cards inside cards, no glow.
- **Material selector:** three labelled families (INK / LIGHT / MATTER), two swatch keys each, with radio semantics.
- **Phone:** the cover shrinks slightly so the cover, the wheel and a **sticky New proof · Sound · Print bar** share one viewport. This addresses critique S2-1 (Remix effect off-screen).

## 7. Editorial principles [PROPOSED]

- **Intentional crops:** the figure meets or leaves the trim on purpose (Ink bleed). Centred only where the material demands it (Matter aperture, Light horizon).
- **Extreme negative space:** at least about 40 % of each cover stays stock. The figure is an event in a field, not wallpaper.
- **Typography as composition:** the artist name is set large enough to be a shape (up to about 0.12·S light), anchored to a corner, with the track in tracked capitals as its counterweight. Index numerals act as display marks (Carbon "02"). Names are never cropped: only art crops.
- **Restrained catalog microcopy:** one style; stacked in a right-aligned column or one head line; recipe facts only.
- **Interface copy:** instrument verbs ("New proof", "Print sleeve", "Sound"); no icon-only labels; units always shown.

## 8. Anti-copying and anti-cyberpunk rules [PROPOSED, binding]

**Anti-copying:**
1. No logos, wordmarks, label marks or brand names from any reference, on covers, UI or docs.
2. No copied text: titles, phonetics, slogans, advisories, specs or tracklists.
3. No one-to-one layouts: never reproduce a reference's grid, column structure or object placement.
4. No product silhouettes: no keyboard-synth body, modular panel with jacks, or turntable arm.
5. No photography or photographic subjects; SLEEVE's subject is always its own two-channel geometry.
6. No pastiche effects as identity: no plastic-wrap overlays, vinyl mockups or parental-advisory blocks.
7. Every set must pass the test "would this be mistaken for the reference?" before shipping.

**Anti-cyberpunk:**
1. No neon pairings as identity (magenta/cyan glow on black); one accent per object.
2. Glow only where light is the *subject* (Light family) and physically motivated (a horizon, a source). Never as a UI effect.
3. No CRT scanlines, glitch, chromatic-aberration fringes, grid floors, lens flares or star glints. Stage 1's field scanlines are to be retired.
4. No chrome *text*, no bloom around type, no dark glowing UI chassis.
5. Matter is rendered with physics (edge light, thickness, a single specular band), never with "futuristic" decoration.

---

## Static studies (in `reference-synthesis/`) [PROPOSED]

All three covers share **one recipe**: Harmonic 3:4 · Φ 45° (maximum misregistration) · 10 passes · "Mira Okafor / Tidewater". Only the material and its family composition change. They're rendered by `study-covers.js`, which reads the app's unchanged geometry and composition; no app code was edited.

| Study | File | Notes |
|---|---|---|
| Ink · Carbon | `study-cover-ink.png` | Charcoal stock; gloss-black key plate; one fluorescent channel; bleed crop; index "02" plus catalog column; large artist |
| Light · Horizon | `study-cover-light.png` | Night gradient; lit horizon line; strokes coloured by distance to the horizon; faint mirrored reflection |
| Matter · Cobalt Glass | `study-cover-matter.png` | Glass strokes (shadowed thickness, soft body, directional edge), refraction channel, one specular arc on the aperture. **The weakest study:** still reads partly as blueprint lines |
| Desktop panel | `study-panel-desktop.png` (+ `.html`) | Quiet light chassis, dominant calibrated wheel with register detents, ratio pair, passes meter, Ink/Light/Matter selector, two lamps |
| Mobile panel | `study-panel-mobile.png` (+ `.html`) | 360 × 780: cover + wheel + sticky New proof / Sound / Print in one viewport |

**Corrections made while producing the studies:**
- The Horizon glow first rendered as a hard-edged box (a partial-rect fill).
- The Matter colophon collided with the aperture rim.
- The desktop ratio label and readout collided with the scale.
- The mobile Sound button was icon-only.

## Open questions for creative review

1. **Cobalt Glass:** push further toward physical glass (per-pass refraction offsets, a caustic), or accept restraint?
2. **Carbon:** is the index numeral ("02", the set number) the right display mark, or should the artist name carry all the scale?
3. **Colophon on phones** (carried from Stage 1): at phone size it is about 5–7 px, which is decorative. Raise it, or accept?
4. **Chrome and Spectrum** have no studies yet (the brief asked for one per family). They should be studied before implementation, Chrome especially, since it is closest to the cyberpunk boundary.
