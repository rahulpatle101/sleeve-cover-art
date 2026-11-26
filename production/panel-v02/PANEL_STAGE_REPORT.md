# SLEEVE v0.2: interface design system and instrument panel stage report

Date: 2026-11-26. Specification: `production/DESIGN_SYSTEM_V02.md`.

Built:
- the panel rebuilt as a seven-step signal path (01 → 07);
- a sticky action bar at every width;
- the hero Registration wheel;
- the Form : Rhythm ratio pair;
- Passes;
- six square Press Set tiles grouped Ink / Light / Matter;
- New Proof / Sound / Print Sleeve.

The renderer is unchanged: all 144 recorded renderer hashes are identical to the approved checkpoint. The recipe schema is unchanged too: `phase`, `density` and `palette` keep their names and values; only the interface labels change.

## Files

| File | Change |
|---|---|
| `src/app/App.tsx` | Rebuilt structure |
| `src/styles/app.css` | Rewritten |
| `src/styles/tokens.css` | Added `--surface-field` |
| `src/instrument/RotaryControl.tsx` | Added `hero` variant (360° sweep, detent ticks), `describedBy` |
| `src/instrument/PressSetPicker.tsx` | New |
| `scripts/browser/v02-panel.mjs`, `v02-panel-shots.mjs` | New checks |

## Evidence (`production/panel-v02/`)

### Screenshots (`screens/`)

| Width | Files |
|---|---|
| Phone | `phone-360(-full).png`, `phone-390(-full).png`, `phone-390-scrolled-registration.png` |
| Tablet | `tablet-768(-full).png` |
| Desktop | `desktop-1280(-full).png`, `desktop-1440(-full).png` |
| States | `desktop-1280-focus-registration-90.png` (in register), `desktop-1280-focus-pressset-spectrum.png` (keyboard focus on a tile), `desktop-1280-radial-spectrum.png` |

### `panel-check.txt`: **28 PASS, 0 FAIL**, no console errors

- **Tab order:** Artist → Track → Engine → Form → Rhythm → Registration → Passes → Press Set → New Proof → Sound → Print Sleeve.
- **Rotaries:** Form, Rhythm, Registration and Passes each pass Arrow ±1, Shift/Page coarse, Home/End and clamping. The visible value tracks every change.
- **Registration:** the readout and `aria-valuetext` read "45 degrees, off register" and "90 degrees, in register".
- **Ratio:** reads "plays as 1 : 2" when the ratio reduces.
- **Engine and Press Set:** arrow keys select the engine and cycle all six press sets (with wrap). Both reach the recipe and the cover description.
- **Pointer drag:** works on the hero wheel and Passes, and focus is kept.
- **New Proof:** deterministic across reloads, with the same chain as the old Remix.
- **Sound:** `aria-pressed` plus a visible On/Off word; muted by default.
- **Print Sleeve:**
  - pressing Enter prints a real **3000 × 3000 PNG** in about 0.7 s;
  - `aria-disabled` while printing, with the label "Printing…";
  - focus stays on the button;
  - the polite live region announces "Sleeve printed — 3000 × 3000 PNG.".
- **Reduced motion:** honoured.
- **Screen-reader structure** (Chrome accessibility tree):
  - Regions: Cover / Instrument / Proof and print.
  - Named groups: Artist and track / Engine / Ratio, Form to Rhythm / Press set (Ink, Light, Matter).
  - Four named sliders with value text, eight named radios, and no unnamed controls.
  - Names use natural case; CSS uppercase no longer leaks into them.
- **360 / 768 / 1280 px:**
  - no horizontal scroll;
  - every target ≥ 44 px;
  - tabbing never leaves focus hidden under the sticky bar;
  - on phones the action bar is pinned to the viewport bottom from first load.

### Other checks

- `node scripts/verify.ts`: ALL PASS.
- `npm run build`: PASS. JS is 258.9 kB (82.8 kB gzip); CSS is 12.4 kB.

## Remaining polish issues

1. **On phones, Registration starts just below the first screen.** At 360 × 780 its heading is at 785 px, so one short scroll (about 200 px) is needed. The cover and the sticky actions are visible immediately. I kept DOM order equal to the signal path rather than moving Registration ahead of Artist and Track.
2. **The cover's catalog line still reads "PHASE 045°".** The interface now says Registration. The renderer is frozen, so this vocabulary mismatch is left for an approved renderer touch.
3. **At 768 px tablet portrait,** the cover column is only about 370 px wide, with empty canvas under it, while the panel runs long. A stacked layout up to about 900 px may suit tablets better.
4. **At 1280 × 900,** the page is 9 px taller than the viewport. A print status message adds a line to the sticky bar while it shows.
5. **Press Set loses Home/End.** Native radio groups don't support them, though the old Palette dial did. Arrow keys cycle and wrap.
6. **The Registration wheel draws 0° and 360° at the same pointer position.** The numeric readout tells them apart.
7. **Section headings are still announced in capitals** ("ARTIST & TRACK") because of CSS text-transform. Group and field names are natural case.
8. **Full Sheet and Macro Relief chips** differ only by mark size, so they're told apart mainly by their names.
9. **Below 480 px the engine hints (Lissajous / Rose) are hidden** to save height.
10. **Older browser scripts still use the v0.1/v0.2-renderer selectors** (Remix text, Palette as dial 5). These are `drive.mjs`, `kb-loop.mjs`, `v02-app.mjs` and others; they need updating before final QA. `v02-panel.mjs` replaces their functional coverage for now.
11. **Deferred:** Safari and Firefox checks (final QA); the draft→full swap transition and all Print, motion and sound work (later stages).
