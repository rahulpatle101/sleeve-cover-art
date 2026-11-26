# SLEEVE visual-system comparison

Status: **PROPOSED — INSPIRATION**, not verified SkillUI extraction. Completed 2026-11-26 as a timeboxed styling comparison.

These studies translate broad instrument qualities only. They do not copy logos, product layouts, proprietary markings or source typography. The real application state, DOM order, information architecture, accessibility semantics, controls, recipe, motion, sound and behavior are unchanged. The development query parameter only applies a `data-theme` attribute; production builds ignore it and expose no theme selector.

## Studies

| Study | Control clarity | Artwork relationship | Tactile character | Mobile | Authorship |
|---|---|---|---|---|---|
| Braun Atelier | Excellent; quiet rules and generous spacing | Strongest as a neutral gallery frame | Refined but least mechanical | Excellent | Calm, though closest to a generic editorial system |
| Buchla Lab | Good; colour makes family and engine state explicit | Energetic, but competes slightly with vivid covers | Experimental and physical | Good; routing rail adds density | Distinctive, though closest to a familiar modular-synth language |
| Nagra Field | Excellent; dark bays group tuning stages and numeric readouts dominate | Dark bays echo the cover chassis while champagne metal stays neutral | Strongest mechanical/instrument read | Excellent; modules remain clearly chunked | Most authored and least like a generic web synth |

## Recommendation

**Winner: Nagra Field.** It gives the tuning path the clearest hierarchy, makes Ratio and Registration feel like precision readings, and preserves the artwork as the loudest object. On 360 px mobile, each dark bay becomes a legible task-sized module instead of a long undifferentiated control stack. Reserving red for Print Sleeve also creates the clearest action hierarchy.

Braun Atelier is the strongest fallback if maximum restraint is preferred. Buchla Lab is the most playful, but its colour coding and routing rail create more visual competition with the six Press Set swatches.

## Captures

- `braun-desktop-1440.png`
- `braun-mobile-360.png`
- `buchla-desktop-1440.png`
- `buchla-mobile-360.png`
- `nagra-desktop-1440.png`
- `nagra-mobile-360.png`

Every capture uses seed `01352905`, Harmonic `3:4`, Phase `045°`, Density `10`, and Newsprint. Desktop viewport: 1440 × 900. Mobile document width: exactly 360 px with no horizontal overflow.

## Renderer corrections completed alongside the study

- Spectrum and Horizon now use a stronger artist/track hierarchy: dominant artist at the upper crown, with Spectrum's track right-aligned and Horizon's track left-aligned at the foot.
- Light uses the same scale and crop envelope as Ink/Newsprint (`1.04` base, `2.45` ceiling).
- Light radial compositions damp extreme non-uniform scale, shear and bend while remaining entirely seed-derived.
- `npm run verify`: all checks passed, including 50 unseen seeds × 2 engines × 6 sets.
- Renderer browser pass: 600 cases, all seven framing treatments, deterministic, fonts loaded, and preview/export layering checks passed.
- Recommended Nagra panel regression: 28 passed, 0 failed, including keyboard order, named controls, reduced motion, 3000 × 3000 export, 44 px targets and no horizontal overflow at 360/768/1280 px.
- `npm run build`: passed.

Shape references added during review are recorded in `references/SHAPE_INSPIRATION.md`; no new engine or shape generator was added in this timeboxed pass.
