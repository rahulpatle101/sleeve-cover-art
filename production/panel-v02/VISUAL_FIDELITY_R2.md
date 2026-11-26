# SLEEVE v0.2 panel, revision 2: visual-fidelity pass

Date: 2026-11-26. Binding target: `production/creative-review-v0.2/instrument-panel-concept.png`.

**Status: stopped for visual approval.**

What changed and what didn't:
- **Changed:** styling and presentation markup only.
- **Unchanged:** the renderer, recipe, behaviour, accessibility semantics, control order and focus order.
- **Design system:** `DESIGN_SYSTEM_V02.md` §0 lists the PROPOSED rules corrected to match the concept. The VERIFIED SkillUI findings are unchanged.

## What was built

| Concept element | Implementation |
|---|---|
| **Dark cover chassis + corner crosshairs** | `#2A2A2D` chassis with a restrained shadow, and ring + cross marks centred on its four corners. The cover canvas is untouched. |
| **Artist / Track in the chassis** | Large light text on underline rules, labelled `ARTIST · SLEEVE LABEL` and `TRACK`. They are still the first two focus stops. |
| **Light instrument surface, strong rules** | No card. Sections sit on `#EDEAE4`, divided by 1.5 px near-black rules. |
| **Top status line** | Mono, tracked: `PRESS 01 · NEWSPRINT · SEED 01352905`. |
| **Section heads** | `n · LABEL` with a grey technical alias: `plate`, `form : rhythm`, `phase · signature control`, `density`, `paper + two channels`. |
| **Engine** | Strong segmented selector. Active = near-black fill with white text and ✓; inactive = ivory with an ink border. Native radios. |
| **Ratio** | Ivory knobs with calibrated tick rings (minor and major ticks) on either side of a central `3 : 4` readout. Beneath it: `PLATE RATIO · PERFECT FOURTH` or `PLAYS AS 3 : 2 · PERFECT FIFTH`. |
| **Registration** | Dark knurled wheel (96 knurls) with low-relief shadow; it rotates with the value. Vermilion pointer, fixed detent marks at 0/90/180/270. The readout is zero-padded (`045°`). The explanation reads "Plate B offset from plate A. The plates register at 0°, 90°, 180° and 270°." (it does not claim the detents lock). The state indicator is two crosshairs, ink and vermilion, offset by the real registration, with `OFF REGISTER · 2.7 MM` or `IN REGISTER`. |
| **Passes** | Ivory calibrated knob plus a 24-bar descending meter, filled up to the value. The caption gives the family meaning: `10 PASSES · INK BUILDS, EDGES BREAK UP`. |
| **Press Set** | Six swatch tiles showing paper or surface with two channel dots, under INK / LIGHT / MATTER labels. Selected = 2 px ink border, ✓ and bold name. Native radios. |
| **Actions** | A wide three-part sticky row: `↻ New Proof` and `○ Sound Off` (secondary, ivory) and `PRINT SLEEVE` (near-black, tracked caps). |
| **Colour** | Every blue arc is removed. Colour now appears only in the Registration pointer and state crosshair, the Press Set swatches, the cover, and the active Sound mark. |

**Mobile and tablet** use the same system, adapted rather than scaled:
- Below 1024 px the layout stacks: chassis, then panel.
- Below 480 px:
  - engine hints are hidden;
  - the wheel is 124 px and the state text wraps;
  - Press Set tiles stack within each family column;
  - the action row tightens to 14 px type.

## Evidence

| Requested | File |
|---|---|
| Concept vs implementation, desktop | `concept-vs-implementation-1440.png` |
| 1440, 1280, 768, 390 (+ 360) | `screens/desktop-1440(-full).png`, `screens/desktop-1280(-full).png`, `screens/tablet-768(-full).png`, `screens/phone-390(-full).png`, `screens/phone-360(-full).png` |
| Focused | `screens/state-1440-focus-engine.png`, `…-registration-090-in-register-focused.png`, `…-registration-135-off-register-focused.png`, `…-pressset-horizon-selected-focused.png` |
| Selected | `…-pressset-horizon-selected-focused.png`, `…-radial-selected.png` |
| Dragging | `…-dragging-form-draft.png` (knob pressed, draft cover) → `…-after-drag-release-full.png` |
| Registration in register / off register | `…-registration-090-in-register-focused.png` / `…-registration-135-off-register-focused.png` |
| Phone, Registration in view | `screens/state-390-scrolled-registration.png` |

### Tests (TESTED — PASS)

- **`panel-check-r2.txt`: 28 / 28 PASS, no console errors.**
  - Tab order follows the signal path.
  - All four rotaries keep the Arrow / Shift / Page / Home / End keyboard model, and their visible values track (Form and Rhythm in the ratio readout, Passes in the caption).
  - The Registration readout and value text report register state.
  - Arrow keys select the engine and cycle and wrap all six Press Sets.
  - Drag works on the wheel and on Passes.
  - New Proof is deterministic.
  - The Sound toggle uses `aria-pressed`.
  - Print Sleeve prints a real 3000 × 3000 PNG from the keyboard and announces it.
  - Reduced motion is honoured.
  - The accessibility tree has natural-case names, 4 sliders and 8 radios, and nothing unnamed.
  - At 360 / 768 / 1280: no horizontal scroll, every target ≥ 44 px, and focus never lands under the sticky bar.
- **Renderer snapshots: 144 / 144 identical to the approved checkpoint** in two consecutive runs. A first run showed 143/144: one Ink Carbon render differed, which is the known ±1 GPU variance. No file under `src/artwork/` was modified in this pass.
- `node scripts/verify.ts`: ALL PASS.
- `npm run build`: PASS. JS is 262.5 kB (83.9 kB gzip); CSS is 13.8 kB.

## Remaining differences and polish issues

1. **Tablet (768 portrait) stacks the chassis above the panel.** The cover is large, and Registration starts about 1100 px down; the sticky actions stay visible.
2. **Phone (360 × 780):** the Registration head is at 742 px, so the wheel needs one short scroll.
3. **Differences from the concept that are kept on purpose:**
   - Family labels above the swatches (grouping was required).
   - A keyboard/drag hint line.
   - Our six real sets instead of the concept's placeholder names.
   - No "PROOF 01" counter; the status line shows press set and seed instead.
4. **"2.7 mm" assumes a 12-inch (304.8 mm) sleeve.** It is |sin 2φ| × 0.009 × side. The mm unit is presentational.
5. **The Registration explanation wraps to three lines** at 1440, leaving "270°." alone on the last line.
6. **The cover's catalog line still says "PHASE 045°"** (the renderer is frozen).
7. **Full Sheet and Macro Relief swatches** differ only in dot scale, and Horizon only by a thin amber line.
8. **Pressing a knob with the pointer shows the focus ring** (focus moves to the native input on drag). This is existing behaviour, kept for consistency.
9. **Knob and wheel depth uses CSS `drop-shadow` on SVG.** It is untested in Safari and Firefox, which are deferred to final QA.
10. **Older browser scripts still use pre-panel selectors.** These are `drive.mjs`, `kb-loop.mjs`, `v02-app.mjs` and others.
