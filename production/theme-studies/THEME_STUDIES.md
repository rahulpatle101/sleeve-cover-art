# SLEEVE panel: three visual-system studies

Date: 2026-11-26. Status: **PROPOSED — INSPIRATION.** These are not VERIFIED SkillUI extraction findings.

The studies borrow broad instrument qualities only. They copy no logos, product layouts, markings or brand assets, and no maker's name appears in the app UI except in the dev-only study label.

## Scope

- **Styling only.** The renderer, information architecture, DOM order, accessibility, controls, recipe and behaviour are unchanged.
- **Same real state:** every capture reloads the default recipe (seed `01352905`). The capture script checks that the seed and width match.
- **Dev-only URLs:** `?theme=braun`, `?theme=buchla`, `?theme=nagra`.
  - `studyTheme()` in `App.tsx` returns nothing outside `import.meta.env.DEV`, so no selector exists in production. The theme CSS ships but is inert.
  - Each study shows a visible "PROPOSED INSPIRATION · …" label in the header.
- **Provenance:** these three themes were first written by the concurrent Codex agent (backed up in `production/renderer-polish/outside-edits/`). For this comparison they were reinstated unchanged on top of the current approved r2 panel, together with `scripts/browser/theme-studies.mjs`. I did not polish them.

## Screenshots (this folder)

| Theme | Desktop 1440 × 900 | Mobile 360 (full page) |
|---|---|---|
| Braun Atelier: warm off-white chassis, charcoal, thin rules, ivory knobs, one vermilion signal | `braun-desktop-1440.png` | `braun-mobile-360.png` |
| Buchla Lab: anodized silver, Ink / Light / Matter colour coding, printed signal-path rail, black-and-cream controls | `buchla-desktop-1440.png` | `buchla-mobile-360.png` |
| Nagra Field: champagne aluminium, dark recessed bays, strong numerals, red only on Print Sleeve | `nagra-desktop-1440.png` | `nagra-mobile-360.png` |

Side-by-side at 360 px: `mobile-360-compare.png`.

## Assessment

| Criterion | Braun Atelier | Buchla Lab | Nagra Field |
|---|---|---|---|
| **Control clarity** | High. Calm rules, one accent, big readouts. | Medium. The blue engine fill, the rail and three family colours compete for attention. | High for numbers (strong readouts). Dark bays make the knobs pop but every section shouts equally. |
| **Relationship to the artwork** | **Best.** The light chassis lets every cover family lead. The warm paper ties to Ink, and dark covers stand out against it. | Fair. The cool silver and blue fight warm Ink covers. | Weak. Dark bays make the panel as heavy as the cover, and the dark chassis competes with dark Light/Matter covers. |
| **Tactile instrument character** | Good. Ivory knobs and a dark hero wheel; quiet. | Good. The rail and colour-coded families feel like a patch panel. | **Strongest.** Recessed bays, engraved numerals, a mechanical feel. |
| **Mobile usability (360 px)** | Good, with one bug: the PRINT SLEEVE label overflows its button. | Fair: "Harmonic ✓" wraps and the type is small. | Fair: the dark bays lengthen the page and "Harmonic ✓" wraps. |
| **Authored vs generic synth UI** | **Most authored.** It reads as a print/press instrument, consistent with the approved concept. | Most "synth UI": the colour-coded routing is a recognisable modular-synth cliché. | Authored, but "pro-audio recorder" rather than "print press". The red Print reads as Record. |

## Recommendation: Braun Atelier

It best serves the product's thesis that the artwork leads and the instrument stays calm and precise:
- it gives the clearest hierarchy, with one signal colour that also matches the vermilion Registration pointer;
- it keeps every cover family the most saturated object on screen;
- it stays closest to the approved concept.

Two ideas from the others are worth keeping as small borrowings later (not built now):
- Nagra's stronger tabular numerals for the Ratio and Registration readouts;
- Buchla's thin family-colour rule above the Ink / Light / Matter swatch groups.

## Defects found in the studies (not fixed: comparison only)

1. **All three at 360 px:** the chassis labels collide ("ARTIST · SLEEVE LABELTRACK").
2. **Braun at 360 px:** the PRINT SLEEVE label overflows its button.
3. **Buchla and Nagra at 360 px:** "Harmonic ✓" wraps onto two lines.
4. **Nagra:** the Registration pointer turns champagne, which weakens the single-signal-colour rule. The red Print Sleeve can read as a recording/record action.
5. **Not tested on any study:** the panel regression suite, focus-ring contrast and the dark bays' contrast. Run these on the winner before adoption.
