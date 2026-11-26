# Matter — final two alternatives (static art-direction correction)

**Status:** FOR CREATIVE APPROVAL · 2026-11-26 · `src/` untouched · no new fonts, palettes, families or layouts

Decisions applied:
- The circle, rim and aperture are **removed** entirely.
- The embossed and dimensional name is **removed**. Type is flat: Bricolage Grotesque condensed for the name, Martian Mono for track and catalog, the existing Matter fonts in the existing layout.

Both alternatives use the existing waveform as a **float height field** on **one continuous surface**, lit by **one directional light** with a restrained highlight (specular ×0.55) and shadow. There are no tubes, bevel filters or containers. The source is `lab3.js`, which only reads the app's geometry and registration.

| | Alt 1 · Full-bleed relief sheet | Alt 2 · Macro material crop |
|---|---|---|
| Surface | The whole square is one coated graphite sheet | The same sheet, seen as a macro photograph (gentle light fall-off across the frame) |
| Form | Waveform **pressed into** the sheet (deboss), fitted large but whole | Waveform **raised**, enlarged 1.75× past every edge (height scales with the magnification); only a section is visible: crossings (Harmonic), hub and petals (Radial) |
| Density 2 / 10 / 24 | Relief depth 1.2 → 1.7 → 2.5; 0 → 2 → 4 shallow undulations; micro-brushing strength | Same law, magnified |
| Phase | Channel-B groove offset; at register it sits in the crest (one profile) | Same |
| Sheet (Harmonic + Radial × d2/10/24) | `out/matter-alt1-sheet.png` | `out/matter-alt2-sheet.png` |
| Integrated 3000 × 3000 | `out/matter-alt1-integrated.png` | `out/matter-alt2-integrated.png` |
| True 1:1 crops | `out/matter-alt1-crop-100pct.png`, `…-type.png` | `out/matter-alt2-crop-100pct.png`, `…-type.png` |

**Corrected while producing:** the first Alt 2 pass widened the relief with the zoom but kept its height, so the macro relief nearly vanished. Height now scales with magnification, and crops were reframed onto the form's crossings and hub.

**Render cost:** about 90–120 ms at 900 px and about 1.2 s at 3000 px (export). This relies on the accepted draft-while-dragging approach.
