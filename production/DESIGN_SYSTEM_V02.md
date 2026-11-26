# SLEEVE v0.2: interface design system and instrument panel

Status: PROPOSED — DIRECTION. Revision 2 (2026-11-26) is a visual-fidelity pass whose binding target is `production/creative-review-v0.2/instrument-panel-concept.png`. See §0 for the corrections. Scope: the interface around the cover only. The renderer is approved and frozen. Nothing here touches the artwork.

**Principle.** The artwork may be expressive. The instrument around it stays calm, precise and functional: light-neutral, grey-led, flat, value-first. Colour appears only where it carries a function, and always together with text.

## 0. Revision 2: corrections to PROPOSED rules (the concept is binding)

The VERIFIED findings in §1 are unchanged. The following PROPOSED rules from revision 1 conflicted with the approved concept and are corrected:

| Revision 1 rule (PROPOSED) | Correction (PROPOSED, to match the concept) |
|---|---|
| "Circles only for turnable controls" | Circles also appear as **ink dots in Press Set swatches** and in the **registration crosshair**, because they depict channels, not controls. Containers stay square. |
| Flat interface; depth only from rules and one cover shadow | **Low-relief physical depth is allowed on the knobs**: ivory knobs with a soft drop shadow, and a dark knurled Registration wheel. These are SLEEVE control styling, not extraction claims. There is still no glow, glass or texture on surfaces. |
| Coloured value arcs on every rotary (mode accent) | **No coloured arcs.** Knobs are neutral, with calibrated tick rings and a near-black pointer. Colour is limited to the Registration pointer and state crosshair (vermilion `#D9481C`) and the Press Set swatches. |
| One white panel card on a canvas | **No card.** The controls sit directly on the light-neutral instrument surface, divided by **strong near-black horizontal rules**. |
| Engine selected state = inset ring + accent mark | Engine selected state = **near-black filled segment**, white text, ✓. Inactive = ivory segment with a 1 px ink border. |
| Artist and Track as the first panel section | Artist and Track live **inside the dark cover chassis**, under the cover, as large light text on underline rules. Focus order is unchanged: they still come first. |
| Seed and print size in the action bar | A **mono status line** in the header: `PRESS 01 · NEWSPRINT · SEED 01352905`. |
| Section heads `01 LABEL` | Section heads `1 · LABEL` (bold, tracked) with a right-aligned lowercase technical alias in grey, e.g. `phase · signature control`. |

## 1. Evidence basis

The traits below are VERIFIED — EXTRACTION. They come from the preserved SkillUI output, `research/extracted/` (SHA-256 `ec140e44…6966b`), as translated in `research/DESIGN_DNA_TRANSFER.md` (rows cited as T1–T13). Only the abstract principle transfers. No source values, fonts, layout, copy or silhouettes are used.

| VERIFIED source trait | Ledger | SLEEVE decision (PROPOSED — DIRECTION) |
|---|---|---|
| Light-neutral page, near-black ink, no dark theme | T1 | Quiet light shell (`#ECEBE7` / `#F7F6F3`). The cover is the only dark, saturated object on screen. |
| A graduated grey ramp carries the hierarchy; colour is scarce | T2 | Four greys: canvas, panel, secondary text, primary ink. Section order, size and weight make the hierarchy, not hue. |
| A few saturated functional hues | T3 | Exactly two functional accents, Harmonic blue and Radial vermilion, shown on dial fills and the engine mark. Each always sits beside its text label. |
| Large value with a small adjacent label | T4 | Every control is value-first: a compact uppercase label above a large tabular numeral. Registration's value is the largest type in the panel. |
| Zero-radius fields, tiles and steppers | T5 | All containers, fields, buttons and Press Set tiles are square (radius 0). **Circles mean "turnable":** only rotaries are round. The Radial engine mark keeps its circle because it names the circular figure. |
| Black primary button; inset 2 px ring as the state cue | T6, T7 | One solid-ink primary action (Print Sleeve). Selection uses an inset 2 px ink ring, a filled mark and a ✓ glyph. |
| Light display weight | T8 | Only the wordmark uses light/large type. Labels and values are ≥ 500, inputs 16 px. |
| Breakpoints 480 / 768 / 1200; layout switches at 768 | T11 | Stacked below 768 px; cover left and panel right from 768 px; wider cover from 1200 px. |
| Motion pauses under reduced motion | T12 | No ambient interface motion. Press feedback ≤ 120 ms, removed under `prefers-reduced-motion`. |
| Flat surfaces, no blur | T13 | No glow, glass, gradient, texture or backdrop blur anywhere in the interface. Depth comes only from thin rules and the one cover shadow. |

Rejected from the source (unchanged from the ledger): its fonts, brand hexes, `outline:none` focus, 9–10 px type, device silhouette, logo, copy and header layout.

The extraction captured **no UI control components** (ledger §Evidence limits). So the shapes of the Registration wheel, the ratio pair, the Press Set tiles and the action bar are **SLEEVE proposals, not extracted fact.**

## 2. Tokens (`src/styles/tokens.css`)

| Token | Value | Use |
|---|---|---|
| `--surface-canvas` / `--surface-panel` / `--surface-field` | `#ECEBE7` / `#F7F6F3` / `#FFFFFF` | Shell, instrument, input wells |
| `--text-primary` / `--text-secondary` | `#141416` / `#5A5A60` | Ink 17.0:1; secondary 6.3:1 on panel |
| `--line-subtle` / `--line-control` | `#C9C8C3` / `#8A8A90` | Section rules (decorative) / control boundaries (≥ 3:1) |
| `--accent-mode-a` / `--accent-mode-b` | `#2B4FD8` / `#D9481C` | Harmonic / Radial. Non-text marks only. |
| `--focus-ring` + `--focus-offset` | 3 px `#141416` + 2 px `#F7F6F3` | Every focusable element, on every surface |
| `--target` | 44 px | Minimum hit target |
| `--radius-control` | 0 | All containers. Rotaries use 50 % (circles = turnable). |
| Type scale | 12 (label, 600, +0.1em caps) · 13 (hint) · 16 (input, body) · 24 (value) · 56 (hero value) | System grotesk; values use tabular numerals |
| Space | 4 · 8 · 12 · 16 · 24 · fluid 24–40 | Sections separated by 1 px rules, not cards |

## 3. Components

1. **Section head.** A two-digit signal index (`01`…`07`, mono, secondary) followed by an uppercase label. It shows the signal path without adding colour.
2. **Text field.** Square well, 44 px tall, 16 px text, persistent label, character count near the 48-character limit. Artist and Track sit side by side from a 400 px panel width.
3. **Engine selector.** Two native radios as square segments. The selected one has an inset ring, a filled mark (square or circle) in its accent and a ✓.
4. **Ratio pair.** Form and Rhythm are two compact rotaries joined by a large `:`, read as one relationship `3 : 4`. A secondary line reports the reduced ratio when they share a factor ("plays as 1 : 2"). Each dial still owns its label and visible value.
5. **Registration wheel (hero).** The dominant control, about 176 px.
   - It is a full 360° wheel: the pointer angle equals the value, and fixed ticks mark the four detents 0/90/180/270, where the channels are in register.
   - Value-first readout: `45°` at 56 px, then "Off register" or "In register" as text. The state is never colour-only.
   - The semantic core is the native range input (0–360) that held Phase. Only the interface name changes; the recipe still stores `phase`.
6. **Passes.** A compact rotary that sets `density` (1–24).
7. **Press Set.** Six native radios in one group, laid out as three rows (Ink / Light / Matter) with two square tiles each.
   - Each tile has a flat two-colour chip (stock plus mark colour) and the set name.
   - Selected state: an inset ring and a ✓.
   - This replaces the Palette dial; the recipe still stores `palette` 0–5.
8. **Action bar.**
   - **New Proof** (secondary outline; it was Remix).
   - **Sound** (a toggle with `aria-pressed` and an On/Off word).
   - **Print Sleeve** (solid primary; it was Export). It still produces the 3000 × 3000 PNG.
   - Status (polite live region) and seed sit with the bar. The bar is sticky at the bottom of the viewport at every width.

## 4. Layout

- **≥ 768 px:** cover on the left (sticky), the panel on the right as a single signal path 01 → 07, then the sticky action bar.
  - Registration and Passes share one row, so the hero sits at the visual centre of the panel.
- **< 768 px:** the cover comes first, then the same path in the same DOM order, so focus order matches reading order.
  - The sticky bar keeps New Proof, Sound and Print Sleeve reachable at all times.
  - No horizontal scroll at 360 px, and every target is ≥ 44 px.

## 5. Accessibility contract (kept)

- Native ranges for Form, Rhythm, Registration and Passes. Arrow keys ±1; Shift+Arrow or PageUp/Down coarse; Home/End to the limits. Pointer drag with dead zone and axis lock is unchanged.
- Native radios for Engine and Press Set. Arrow keys move and select.
- Every control keeps a persistent visible label and value. Registration announces e.g. "45 degrees, off register". Press Set announces e.g. "Newsprint, Ink".
- One polite live region for proof, print and sound messages. Print Sleeve uses `aria-disabled` while rendering, so focus is never dropped.
- Colour is never the only indicator: engine (shape + text), selection (ring + ✓), register state (text), sound (word + `aria-pressed`).

## 6. Not in this stage

Print animation, expressive motion, registration feedback motion and new sound behaviour.

## 7. Where the design library lives (implementation map)

| Layer | Source | Notes |
|---|---|---|
| Tokens | `src/styles/tokens.css` | The **only** place interface values are defined, in 12 groups: surface, text, signal, chassis, knob, wheel, meter/swatch, shadow, focus, size, type, space. `app.css` has no literal colours. |
| Styles | `src/styles/app.css` | Component styling; consumes tokens only. |
| Components | `src/ui/` (`index.ts` exports all) | `SectionHead`, `ChassisField` / `CharCount`, `EngineSelector`, `RatioModule`, `RegistrationWheel` / `RegMark`, `PassesModule` / `PassesMeter`, `ActionBar`; plus `RotaryControl` and `PressSetPicker` in `src/instrument/`. `App.tsx` only composes them. |
| Cover typefaces | `src/artwork/fonts.ts` | Artwork, not interface. Bundled OFL faces; licences in `public/licenses/`. |
| Cover colours | `src/artwork/palettes.ts` | Artwork data, not interface tokens. The Press Set swatch dots depict these. |
| **Live library** | `/library.html` on the dev server (`src/library/`) | Renders every token (read live from the stylesheet), interface and cover type, and each component in its states. It is not a Vite build input, so it never ships. |
