# Analog UI control test bench: record and recommendation

Date: 2026-11-26. **Status:** temporary study, stopped before any production integration.

## Provenance and labelling

- **Source:** Analog UI by TechSquidTV (https://github.com/TechSquidTV/Analog-UI, docs https://analogui.com/docs/components/), commit `fa43e9420034`.
- **Licence:** **MIT**. The licence text is vendored at `studies/analog-bench/vendor/analog-ui/LICENSE`.
- **Classification:** **PROPOSED — INSPIRATION** and a candidate dependency. It is **not** VERIFIED SkillUI extraction evidence.
- **Extraction untouched:** `research/extracted/DESIGN.md` is unchanged (SHA-256 `ec140e44…`; `INTEGRITY.sha256` passes).
- **Distribution:** Analog UI is **not on npm** (`analog-ui` returns 404). It ships as a shadcn-style registry that copies source into a project. The bench follows that route: the MIT source is vendored into the bench only.

## Isolation

- SLEEVE has **no Tailwind**; it was checked before anything was installed. SLEEVE was **not** migrated.
- The bench is a separate mini-project, `studies/analog-bench/`, with its own `package.json`, its own `node_modules`, and these packages: Tailwind v4, `@tailwindcss/vite`, `@base-ui/react`, `motion`, `lucide-react`, `clsx` and `tailwind-merge`.
- The bench imports SLEEVE's **real** recipe, Remix, renderer (`ArtworkStage`), export and audio modules read-only, with one deduplicated React.
- SLEEVE's own `package.json`, renderer, cover and export are **unchanged**. The SLEEVE production build is unaffected.
- **Run it:** `cd studies/analog-bench && npm run dev`, then open http://localhost:5190/.

## What the bench contains

All controls are driven by the live SLEEVE state.

| Control | Analog component | Accessibility model kept |
|---|---|---|
| Form, Rhythm (small) | `Dial` chrome, recoloured warm off-white | Native `input[type=range]` on top; Analog dial is `aria-hidden`, out of the tab order, pointer-inert |
| Registration (oversized) | `Dial` black, 360° sweep, signal pointer, 0/90/180/270° detent marks | Same native range; the value text reads "45 degrees, off register" |
| Passes + compact meter | `Dial` chrome + `Meter` (24 segments, ink on warm track) | Native range; meter hidden from screen readers (the value is announced by the slider) |
| Engine rocker | `Toggle` (two-position rocker), inert | Two native radios over the rocker halves |
| New Proof / Sound / Print Sleeve | `PushButton` chrome, `PushToggle` (`aria-pressed`), `PushButton` black | Real `<button>`s with natural-case names; the polite live region is kept |
| Seed / status LCD | `LCDDisplay`, neutral tone (warm glass) | Hidden from screen readers; the seed is mirrored in the live status |

**Token adaptation** (scoped to the bench):
- bloom 0.70 → 0.42;
- foil 0.30 → 0.18 (0.07 on off-white hardware);
- shadow depth 0.90 → 0.55;
- grain 0.36 → 0.22;
- bevel ×0.6.

These are 35–50 % reductions. There is **one static light** (`baseAngle` 135°, power 0.6), with **no pointer or tilt lighting**. Colour is used only for the signal pointer and off-register dot, the family chip, and Sound's active indicator. There are no screws, vents, cables, connectors, or per-section panels.

**Composition:** an asymmetric 12-column "printed circuit editorial" sheet:
- the cover on the left;
- reference-designator annotations (R1–R4, SW1, U1) on printed trace rules;
- oversized numerals (`3 : 4`, `045°`, `10`).

## Checks (`bench-check.txt`): **13 PASS, 0 FAIL**, no console errors

- Tab order: Form → Rhythm → Registration → Passes → Engine → New Proof → Sound → Print Sleeve.
- Keyboard on all four native sliders: Arrow, Shift for coarse steps, Home, End. The Analog visuals follow.
- **Pointer:** drag uses SLEEVE's relative model (dead zone, axis lock, Shift for fine) and keeps focus on the native slider.
- Engine radios work with the arrow keys.
- New Proof remixes the real recipe.
- **VoiceOver structure** (Chrome accessibility tree):
  - 4 named sliders with value text, 2 named radios;
  - buttons named "New Proof", "Sound" (pressed state) and "Print Sleeve";
  - **no** Analog spinbuttons exposed.
- At 1440 px and 390 px every target is at least 44 × 44 and there is no horizontal scroll.
- Reduced motion is honoured.

## Findings that matter for adoption

1. **Analog's interaction model conflicts with SLEEVE's.**
   - The `Dial` is a `div` with `role="spinbutton"`, not a native range.
   - Its drag is **absolute-angle**: pressing anywhere jumps the value (measured 45° → 0°).
   - It pulls focus onto itself.
   
   To keep SLEEVE's behaviour, the bench uses Analog **only as a visual skin**; the interaction is SLEEVE's.
2. **Target sizes:** the real `<button>` inside `PushButton` is inset 6 px, so a 48 px button gives a 36 px target. 56 px was needed.
3. **Uppercase in accessible names:** the CSS uppercase leaked into the names, the same issue fixed earlier in the panel. Explicit labels were needed.
4. **Colour overrides fight the library:**
   - Material tokens are re-declared on every `[data-analog-variant]` element.
   - The meter ignores `tone` and uses traffic-light zones.
   - The black button inherits the ink label colour.
   
   Each needed scoped overrides or `!important`.
5. **The secondary hardware still reads as brushed aluminium.** The conic brushing is part of the dial geometry, so even at foil 0.07 the warm off-white reads as metal rather than enamel. Getting the approved ivory knob would mean writing a custom `renderSurface`, which amounts to rebuilding our own knob.
6. **Weight:**

   | | JS | CSS |
   |---|---|---|
   | Bench production build | 643 kB (197 kB gzip) | 93 kB |
   | Current SLEEVE | 269 kB (86 kB gzip) | 15 kB |
   
   That is about **+111 kB gzip (2.3×)** of JavaScript for a visual skin, plus a Tailwind toolchain.
7. **Maturity:** version 0.0.0, not on npm, 12 GitHub stars. Adopting it means owning a vendored fork.

## Comparison with the current panel

Screenshots: `compare-desktop-1440.png`, `compare-mobile-390.png`.

| Criterion | Current SLEEVE panel | Analog UI bench |
|---|---|---|
| **Registration as hero** | Strong | **Stronger**: the large black wheel and huge `045°` dominate. |
| **Relationship to the cover** | Calm frame; the dark chassis ties the cover in | Cover floats on the sheet; the chrome dials compete with Ink covers |
| **Tactile character** | Ivory calibrated knobs, knurled wheel | More "real hardware", but reads as an audio plugin (chrome dials, plunger buttons, LCD) |
| **Authored vs generic** | Authored print instrument | The editorial layer (designators, numerals) is authored; the hardware layer is generic |
| **Clarity of Engine** | Labelled segments, obvious state | Rocker is ambiguous: "Radial" sits far from its half on desktop |
| **Mobile** | Compact; sticky actions | Much longer page; no sticky bar in this study |
| **Cost** | No extra dependencies | +111 kB gzip, Tailwind, Base UI, Motion; interaction bypassed |

## Recommendation: **do not adopt Analog UI as a dependency.** Borrow three ideas natively.

The parts that worked in the bench are SLEEVE-side ideas, not Analog components:

1. **A bigger Registration hero:**
   - the wheel at about 200 px on desktop;
   - the `045°` numeral at about 140 px;
   - a signal-coloured offset dot beside the state text.
2. **Printed-circuit annotations:** reference designators (R1–R4, SW1, U1) and node dots on the existing strong rules, as a typographic layer.
3. **One restrained mono "LCD" line for seed and status,** set in our own tokens and type, not a skeuomorphic glass display.

Everything Analog itself contributes would need to be fought or overridden to fit SLEEVE:
- the brushed-chrome dials;
- the plunger buttons;
- the LCD glass;
- the rocker;
- the absolute-drag spinbutton model.

All of it costs 2.3× the JavaScript. Our own knob and wheel components already carry the tactile intent, with SLEEVE's accessibility model built in.

If you still want Analog's look, the lowest-risk path is to **copy only the dial's surface CSS idea into our own `RotaryControl`**, with no package and no Tailwind. That would need its own scoped test.

**Stopped here; no production integration.** The bench stays in `studies/analog-bench/`, outside the SLEEVE build, and can be deleted in one step.
