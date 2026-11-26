# Critique — 12-minute severity pass

**Status:** COMPLETE · 21:00:06 → 21:03:30 IST · production build (`vite build` + `vite preview`), fresh browser profiles

Critique the running experience and one real export, not screenshots of intentions. Use the acceptance criteria in `../PRODUCT.md`.

## Method

1. Reset to first load.
2. Complete one cover without maker commentary.
3. Repeat with keyboard only and reduced motion.
4. Inspect the exported PNG at 100%.
5. Record evidence and severity before changing anything.

## Five lenses

### 1. Product clarity

- Can a new person say what SLEEVE makes within ten seconds?
- Is the first useful action obvious?
- Does the loop end with a real, useful file?

### 2. Instrument feel

- Does each control have a distinct, learnable effect?
- Is adjustment responsive and precise?
- Does Remix feel coherent rather than random?

### 3. Artwork quality

- Do both modes produce plausible covers at parameter extremes?
- Are hierarchy, negative space, and typography intentional?
- Does the export match the preview and remain sharp?

### 4. Access and resilience

- Can the loop be completed without a pointer, motion, or audio?
- Are focus, labels, values, status, and recovery clear?
- Does mobile preserve target size and reading order?

### 5. Emotional finish

- Is there a moment of discovery?
- Does adding identity text create ownership?
- Does export feel like finishing rather than merely downloading?

## Severity

- **S1 — blocks ship:** cannot complete loop, inaccessible essential action, broken/incorrect export, data loss, runtime crash.
- **S2 — damages core:** unclear control, major visual collision, severe lag, confusing state. Fix if safely possible within critique time.
- **S3 — polish:** minor alignment, nuance, secondary copy. Record; fix only if trivial.
- **Future:** new capability or expanded scope. Do not build today.

## Findings

| Severity | Evidence | Finding | Decision | Result |
|---|---|---|---|---|
| **S1-1** | `scripts/browser/kb-loop.mjs` with a stage trace (`TRACE=1`) | **Export could stall for seconds.** In the strict keyboard-only loop, `toBlob` started at 2852 ms and had not resolved by 9263 ms; status stuck on "Rendering…" with no file. In isolation the same encode takes 64 ms. Cause: Chrome's async `toBlob` encodes PNG in idle periods and can be starved. This also explains the ≈ 7 s export in the desktop critique run. | Fix (S1, broken/unreliable export): yield one frame so "Rendering…" paints, then encode synchronously with `toDataURL` (≈ 100 ms, no idle dependency), decoded locally to a Blob (no fetch, no network). | **Fixed** — keyboard loop exports immediately, normal and reduced motion |
| **S1-2** | `kb-loop.mjs` | **Keyboard focus lost on Export.** `disabled={exporting}` made the focused button drop focus to `<body>` mid-export, so a keyboard user lost their place (inaccessible essential action). | Fix: `aria-disabled` plus a ref guard against double activation; the button keeps focus and its ring. | **Fixed** — focus stays on "Exported ✓", ring visible |
| — (S1 scan) | `scripts/browser/critique.mjs`, desktop 1280 and 360 touch, real input only | No further S1 in the pointer/touch runs. The loop completes end to end (identity, Form and Phase drags, Radial, 4× Remix, export) on both viewports. The file is correct and named; the status is announced; the network is same-origin only (4 requests); 0 console errors. | — | PASS |
| S2-1 | `critique-360-05-remix-*.png`, `critique-360-06-exported.png` | On a 360 px phone, Remix, Export and the lower dials sit below the cover, so the art change from Remix happens off-screen; you must scroll up to see it. | **Recorded, not fixed.** Any fix (sticky compact preview, or reordering actions above the controls) changes the layout or the visual/focus order, so it isn't safe and contained within critique. Mitigations: values update in view; the operator's real-phone test rated the layout comfortable. → Future F1. | Open (documented limitation) |
| S3-1 | `fix-s3-1-palette-min-cap.png` | At its minimum value a dial shows no value arc, so the categorical "Palette 1 · Ink" reads as empty or off. | Trivial and contained: draw a 2.6 px mode-accent cap at the arc start when the value is at minimum. | **Fixed**, type-check and build pass |
| S3-2 | `critique-*-06-exported.png` | After further edits, the status still reads "Artwork exported — …" for the earlier file. It's past tense and accurate, but slightly stale. | Record only. | Open |
| S3-3 | `audit-remix-after.png`, `audit-holdout-after.png` | **Weak vs strong Remix outcomes:** the strongest are Radial blooms (e.g. Ember 6:5, Moss 3:2) and Harmonic S, Z and chevron forms. The weakest still worth recording are Harmonic 4:3 (busy, tuned chain H10) and 4:5 (boxy, hold-out Hh12). Keep rate is 47/49. | Record only; the Remix distribution was already tuned in craft. | Open |
| S3-4 | `motion-frame-midfade-56.jpg` | During a 240 ms engine crossfade the two geometries overlap briefly. This is intended; type stays crisp. | Record only. | Accepted |
| S3-5 | first-load screenshots | The engine sublabels "Lissajous" and "Rose" are formula names, which may be jargon for some musicians. They're also honest technique credit. | Record only. | Accepted |
| — (not a finding) | export timing probe | The desktop critique run took ≈ 7 s from export click to file. A clean re-measure of 5 exports gave 61–113 ms from click to announcement. The delay was stray headless Chrome instances from a failed harness launch (killed) plus polling interval. | — | Not reproducible |
| Future F1 | S2-1 | Compact sticky preview, or an in-view Remix echo, on narrow screens. | Do not build today. | — |
| Future F2 | product | Remix undo/history. | Out of scope per operator. | — |
| Future F3 | sensory | Volume control. | Operator constraint. | — |
| Future F4 | typography | Bundled, redistribution-licensed font for identical exports across machines. | Do not build today. | — |

## Cold-use observation

- Observer/context: no separate cold user was available during this phase. The scripted critique run used real input in fresh profiles, plus the operator's earlier human checks (trackpad feel, audio across extremes, Safari, VoiceOver, physical phone), accepted as evidence.
- Time to first meaningful adjustment (scripted run): 2.3 s (identity typed), 3.0 s (first dial drag).
- Time to export (scripted run, 360 px): 9.5 s for the full loop including 4 Remixes.
- Moment of hesitation: on a phone, the art is off-screen when Remix is tapped (S2-1).
- Quote or behavior (with permission): operator — dial feel "Feels right"; audio "Good as is" / "All comfortable"; Safari, VoiceOver and phone "All worked" / "All announced well".
- Changes made: S1-1 synchronous PNG encode; S1-2 export button keeps focus; S3-1 dial minimum cap.

## Verdict

- [ ] Ship
- [x] Ship with recorded S2/S3 limitations (both S1s found during verification were fixed and re-verified; S2-1 phone off-screen Remix effect and S3-2..S3-5 recorded)
- [ ] Hold because an S1 remains

