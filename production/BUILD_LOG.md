# Build log

**Status:** RELEASE CANDIDATE · Gate S PASS (handoff), awaiting operator approval · not deployed · Critique & Ship 21:00:06 → 21:12:00 IST · Gate B APPROVED · Craft 18:42:12 → 19:01:24 IST · Build complete 17:36:22 IST · Gate B PASS — awaiting operator approval · Craft NOT started

Use this during the four-hour sprint. Record facts, not retrospective perfection.

## Session

- Date: 2026-11-25
- Operator: project owner (approvals) + Claude Code (execution)
- Start time / timezone: 17:15:08 IST (UTC+05:30) — research clock started on approval
- End time / timezone: 21:12:00 IST (UTC+05:30)
- Primary reference URL: https://teenage.engineering/products/op-1
- Extraction hash: `research/extracted/DESIGN.md` SHA-256 `ec140e44a42edf512419cd4b3e13e78a910433ece2b11235aa23800ac86e966b`

## Phase record

| Phase | Planned | Actual start | Actual end | Variance | Gate result |
|---|---:|---|---|---:|---|
| Research | 30 min | 17:15 | 17:23 (work); approved 17:27 | −22 min (unused minutes do not transfer) | R: PASS — operator-approved (limited-evidence) |
| Build | 60 min | 17:27:40 | 17:36:22 | ≈ −50 min (unused minutes do not transfer) | B: PASS — pending operator approval |
| Handcrafted delight | 120 min planned · ≈ 67 min actual focused work · ≈ 53 min unused (does not transfer) | 18:42:12 (+ resumed 19:45:49) | 19:01:24 | ≈ −101 min (unused minutes do not transfer) | C: PASS — pending operator approval |
| Critique and ship | 30 min | 21:00:06 | 21:12:00 | ≈ −17 min | S: PASS (release candidate; deployment not authorized) |

## Decisions

| Time | Evidence label | Decision | Reason | Affected files |
|---|---|---|---|---|
| 17:15 | PROPOSED — DIRECTION (operator-approved) | Single target: OP-1 field product page | Control hierarchy and functional colour relevant to research questions | `research/extracted/PROVENANCE.md` |
| 17:15 | TESTED — PASS | `skillui@1.3.4` default mode via npx in isolated scratch; no Playwright | Operator conditions | `PROVENANCE.md` |
| 17:17 | OBSERVED — tool side effect | Moved auto-installed `~/.claude/skills/teenage-design` into scratch quarantine (byte-identical to preserved `SKILL.md`) | Violated "no global install" condition; also injected "match exactly" instructions into the agent | `PROVENANCE.md` |
| 17:19 | VERIFIED — EXTRACTION | Preserved full run folder unchanged; promoted byte-identical `DESIGN.md`; 25 files hashed | Contract §4, SKILLUI workflow §3 | `research/extracted/*` |
| 17:19 | VERIFIED — reference capture | Live HTML + all 10 stylesheets fetched to check extraction; dark-theme, role and breakpoint claims contradicted | SKILLUI workflow §4 | `PROVENANCE.md` |
| 17:21 | TESTED — PASS | Radial formula locked: **rose**; hypotrochoid rejected (200/1600 degenerate) | Scratch proof | `research/GENERATIVE_MATHEMATICS.md` |
| 17:21 | PROPOSED — DIRECTION | Canvas 2D preview + offscreen 3000² rerender export | Same `render(recipe,w,h)` path | `GENERATIVE_MATHEMATICS.md` |
| 17:29 | PROPOSED — DIRECTION | System font stack only (Helvetica Neue → Arial → system-ui); no webfont | Avoids proprietary/remote fonts; export awaits `document.fonts.ready` | `src/artwork/renderArtwork.ts` |
| 17:30 | PROPOSED — DIRECTION | Preview and export both sample 4,096 segments/trace and use one `renderArtwork` + `coverLayout` + `fitBox` | Removes any sampling divergence between preview and export | `src/artwork/*` |
| 17:30 | PROPOSED — DIRECTION | Rotary = native `input[type=range]` (opacity 0, keyboard/AT) under an SVG dial; pointer = vertical/horizontal drag, 200 px for full range, Shift = ¼ speed | Contract §2/§9; control design is PROPOSED, not extracted | `src/instrument/RotaryControl.tsx` |
| 17:30 | PROPOSED — DIRECTION | Radial accent `#D9481C` used only for the selected-mode square/circle mark and on-cover line art, never small UI text | Locked decision; 3.6:1 on canvas | `src/styles/app.css` |
| 17:34 | TESTED — FAIL → fixed | Remix produced Form = Rhythm in 14.6% of seeds (1:1 = lone line/ellipse/circle); now nudges Rhythm +1 | "Remix returns a composed result" | `src/instrument/remix.ts` |
| 17:22 | PROPOSED — DIRECTION | Token set derived in SLEEVE's own values; proprietary fonts, exact brand hexes, `outline:none` focus rejected | Transfer ledger | `research/DESIGN_DNA_TRANSFER.md` |

## Scope cuts

| Time | Cut | Trigger | Core preserved |
|---|---|---|---|
| 17:36 | None during Build. Deferred to craft (not cut): audio richness, motion/interpolation, any preset list | Sprint plan puts these in Sensory/Motion passes | All Required v1 items present in slice |

## Craft passes

- Visual (18:42:12 → 18:44:46, OBSERVED — BUILD; before = `screens/gate-b/`, `screens/craft/visual-before-extremes.png`; after = `screens/craft/visual-after-*`):
  - Cover meta raised from 0.022·S to 0.032·S, which is ≈ 10.75 CSS px on the 336 px phone cover (was ≈ 7 px). Its cap top now sits on the margin. Art region moved to y 0.155 / h 0.555. Artist 0.088·S, track 0.044·S. The layout is still the single `coverLayout` used by preview and export.
  - The Palette readout is now a value plus a caption ("1" / "Ink") with `nowrap`, so the wrap is gone.
  - The dial value arc uses the current mode accent (`--mode-accent`, non-text mark, ≥ 3:1), tying the controls to the engine. The pointer stays ink.
  - High Density: stroke width scales by √(8/layers) above 8 layers, so density reads as finer texture, not darker mass. Parameter-extreme contact sheet reviewed for both modes × 6 cases.
  - Phone: 12 px page gutter below 480 px (cover 328 → 336 px). Actions become a 2-column grid with Export full-width, instead of a stray right-aligned wrap.
  - Stage placeholder now uses the panel surface instead of #ddd.
  - Kept as intentional sparse extreme: Harmonic 1:1 @ 0° Density 1 is a single diagonal line.
- Interaction (18:44:46 → 18:46:49; TESTED via `scripts/browser/interaction.mjs`, headless Chrome CDP):
  - Drag sensitivity per control: `min(22, max(1, 160/span))` px/step. Measured on a 44 px drag up: Form Δ2, Phase Δ44 (1°/px, was ≈ 1.8°/px), Density Δ6, Palette Δ2. Shift = ¼ speed (Phase +10 over 40 px). Right-drag also increases. Drag is relative, so the dial never jumps to where the pointer lands.
  - Feedback: hover darkens the dial rim. While dragging, the rim thickens and the cursor changes to `grab`/`grabbing` (`.is-dragging`, verified during drag and cleared on release).
  - Touch: `touch-action: pan-y` plus horizontal-only delta for `pointerType=touch`. **Regression found and fixed:** a vertical swipe changed the value (19→23) while scrolling. After the fix, a sideways +60 px drag gives Density 10→19 with no scroll, a vertical swipe scrolls with the value unchanged, a tap focuses without changing the value, and a tap on Remix works.
  - Palette slider now exposes 1–6, matching the visible value. **AX defect found and fixed:** it exposed 0–5 while showing 1–6.
  - Radio accessible name no longer includes the decorative "✓" (`content: ' ✓' / ''`). AX names are now "Harmonic Lissajous" / "Radial Rose".
  - The 48-character limit is shown as `n/48` from 36 characters, linked with `aria-describedby` and not live-announced.
  - AX tree: 2 named regions, an image with a descriptive name, 2 textboxes, a radio group, 5 sliders with min/max/value, 3 buttons (Sound with `pressed`), and a status region.
  - Limitation: `aria-valuetext` ("45 degrees", "1 of 6, Ink") is in the DOM, but Chrome's CDP AX tree reports the numeric value for native ranges. Real screen-reader output is unverified. Chrome exposes the CSS-uppercased label text ("FORM") as the name.
- Motion (18:46:49 → 18:49:59; TESTED via `scripts/browser/motion.mjs` + `fps.mjs`):
  - A mode change or Remix crossfades the cover from what's currently on screen to the new full render, 280 ms ease-out. The new frame is rendered once to a buffer with the same `renderArtwork`, and each frame is just two `drawImage` calls.
  - Measured: mode switch settles at 287 ms (15 blend frames); Remix at 285 ms; 5 mode switches within ≈ 200 ms settle at 473 ms (last click + one fade, **no queue**). Tuning shows 0 blend frames and updates on the next frame.
  - Reduced motion: mode switch and Remix are a **cut** (0 blend frames, final on the first frame), and button transitions are 0.01 ms. **Visual check:** `screens/craft/motion-normal-110ms.png` shows a faint Lissajous ghost under the rose; `motion-reduced-110ms.png` shows a clean final frame.
  - Button press: 1 px press, 90 ms. No camera flash, zoom, rotation, or ambient loop.
  - Performance: the live app holds 60 fps (16.7 ms median and p90 frame interval) at Density 23↔24 with a Phase sweep every frame, both modes, 1468 px preview on an M1 Max. Geometry costs 4.1 ms per render. An earlier 49–120 ms micro-benchmark was dominated by `getImageData` readback and is discarded. Bevel joins were tried, gave no gain, and were reverted.
  - Accepted artifact: during the 280 ms fade the outgoing meta label ("HARMONIC") ghosts faintly behind the new one.
- Sensory (18:49:59 → 18:55:16; TESTED via `scripts/browser/audio-signal.mjs`; human listen: **operator reported "Good as is"** at 18:55:16):
  - Rebuilt as **one persistent two-oscillator voice**. Pitch, filter and pan glide with `setTargetAtTime` (τ 25 ms) and the envelope re-strikes (≈ 20 ms attack, 160 ms decay). Before, each change spawned a new voice, so fast drags stacked up to about 7 voices.
  - Mapping (pure `soundParams`, artistic and not audio analysis): Form:Rhythm sets the interval folded into one octave; Palette sets the root (196 Hz up to 5 semitones higher); Density sets the low-pass cutoff (820–3580 Hz, brightness, not loudness); Phase sets subtle pan (±0.35); Engine sets timbre (Harmonic sine+sine, Radial triangle+sine). Remix sounds as one re-strike. Export success plays a quiet two-step octave chime, only when sound is on.
  - Raw drag events coalesce at 50 ms with a **trailing** pluck, so the sound always ends on the final value. The context suspends while the tab is hidden.
  - Mute fades over about 30 ms, stops the oscillators, then closes the context.
  - No volume control: the operator forbade new controls. Master is fixed at 0.6 and peak is bounded.
  - OfflineAudioContext (48 kHz, the real `Voice` class): theoretical peak ceiling 0.144 FS. Single pluck peak 0.076 / RMS 0.017. A 20-retrigger drag with mode flips peaks at 0.107 (L) / 0.108 (R). Silence before the pluck and after decay, mute mid-note, and mute-then-pluck all measure exactly 0. Click detector: our max sample step 0.0042 and curvature 0.0002, against a deliberately hard-cut reference at 0.056 / 0.056, so the detector catches clicks and ours has none.
  - Live (headless, AudioContext constructor instrumented): 0 contexts before the gesture; 1 after Enable (`running`, `aria-pressed=true`); output tap RMS 0.032 at 60 ms after a Form change and 0 after 1.5 s; Mute gives `pressed=false` and a closed context; muted tuning creates no new context; after reload sound is off with 0 contexts (no persistence).
- Emotional (18:55:16 → 18:56:31; TESTED via `scripts/browser/emotional.mjs`):
  - Export completion: the button goes Rendering… → **Exported ✓** (2.4 s, the ✓ is `aria-hidden`) → Export PNG. The status confirms dimensions and filename. The instrument stays usable throughout. No confetti or achievement language.
  - Empty identity: inputs show "Artist name" / "Track title" placeholders. Export is not blocked, but the status adds "Add an artist and track name to finish the sleeve." The cover keeps its layout. Placeholder text is deliberately **not** drawn on the cover, so preview = export.
  - Failure (forced `toBlob → null`): "The artwork couldn’t be exported. Your composition is safe; try again." The button re-enables and the recipe is unchanged (TESTED — PASS).
  - Recovery: from the weak state 1/1/0°/1 (a single line), one Remix gives 6/5/60°/15 with Ember palette, keeping Harmonic and "Night Office" (`emotional-weak-state.png` → `emotional-remix-recovery.png`).
  - Audio-unavailable copy now reads "Sound isn’t available here. The visual instrument still works." 
- Editorial (18:56:31 → 18:57:55; screenshots `screens/craft/editorial-after-*`):
  - Masthead "SLEEVE / 003" + "Play your next album cover." Tab title "SLEEVE / 003 — Play your next album cover". Meta description is factual (two mathematical engines, 3000 × 3000 PNG).
  - Sound button now names the action, **Enable sound / Mute sound**, with a filled dot when on. `aria-pressed` was removed, so the name no longer changes alongside a pressed state.
  - Status copy: "Rendering 3000 × 3000 artwork…", "Artwork exported — 3000 × 3000 PNG, {file}.", failure "The artwork couldn’t be exported. Your composition is safe; try again.", "Sound isn’t available here…". The meta line reads "Seed … · exports a 3000 × 3000 PNG".
  - Helper copy covers drag up/right, sideways on touch, Shift for fine, and keys.
  - Cover accessible name uses "engine" consistently and lists all parameters and names.
  - Filename is `sleeve-{artist}-{track}-{engine}-{seed}.png`, with fallback `sleeve-003-{engine}-{seed}.png`. Diacritics are folded ("Vélo" → "velo") and hostile input reduces to `[a-z0-9-]`, ≤ 96 chars (TESTED, `verify.ts`). Engine stays in the name because the same seed exists in both engines.
  - Overclaim scan of `src/` + `index.html` for AI / unique / magic / professional / analyse / audio-reactive: none.
  - **Regression found and fixed:** "Enable sound" wrapped to two lines at 360 px. Fixed with `nowrap` and 12 px button padding below 480 px. Overflow check: all buttons and readouts are single-line and 44 px tall.
- Integration (18:57:55 → 19:01:24; full suite against the **production build** (`vite preview`), with audio and the extremes sheet against dev because they import `src/`):
  - Desktop loop (`drive.mjs`): Tab order Artist → Track → Engine → Form → Rhythm → Phase → Density → Palette → Remix → Enable sound → Export PNG. All rotary keys pass (±1, Shift ±coarse, PgUp, Home/End, clamp). Palette range is 1–6. Engine radio arrows work. Pointer drag and clamp work. Remix sequence is identical across reloads: `7bf706a0` 6/5/60/15/p4 → `9a3e097f` 6/4/60/15/p6 → `b6c508d2` 3/4/180/17/p2, with **identical canvas pixels**. Both engines export at 3000×3000. No target < 44 px. 360 px `scrollWidth` = 360. Reduced motion matches. 0 errors.
  - Interaction, touch, AX tree, motion and reduced motion, 60 fps, emotional and failure paths, and audio all re-run with the same results as their passes. 0 errors in every run.
  - Export fidelity (`fidelity.mjs`, real downloaded PNG vs live 1468 px preview, same recipe): Harmonic mean |Δ| 1.93/255, 0.26 % px > 48, worst 12×12 block-mean Δ 4.24/255; Radial 1.09, 0.20 %, 2.87. **Equivalent composition**; residual differences are antialiasing. 100 % crops inspected: `screens/craft/export-*-100pct*.png`.
  - Conflicts and regressions removed this pass: (1) `drive.mjs` found Export by its exact label, which broke when the Exported ✓ state was added, so it now uses `.btn-primary`; (2) "canvas pixels identical: false" was the test capturing mid-crossfade (60 ms after Remix). With a 500 ms settle it is identical, so this was a test-timing artifact, **not** an app regression.
  - Asset boundary: no font, image or reference identifiers in `src/`, `public/`, `dist/` or `index.html`. Bundle URLs are React/W3C constants only. `INTEGRITY.sha256` 25/25 OK, so the extraction is untouched.
  - **Font decision:** keep the deliberate system stack `"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif`. No webfont is bundled. Cover typography may vary across machines (recorded in `SHIP.md`). Export awaits `document.fonts.ready`.

## Gate C evaluation — 19:01:24 IST

| Pass | Allocated | Actual | Recorded |
|---|---:|---|---|
| Visual | 25 min | 18:42:12–18:44:46 (2 m 34 s) | yes |
| Interaction | 25 min | 18:44:46–18:46:49 (2 m 03 s) | yes |
| Motion | 20 min | 18:46:49–18:49:59 (3 m 10 s) | yes |
| Sensory | 15 min | 18:49:59–18:55:16 (5 m 17 s, includes the operator listening) | yes |
| Emotional | 15 min | 18:55:16–18:56:31 (1 m 15 s) | yes |
| Editorial | 10 min | 18:56:31–18:57:55 (1 m 24 s) | yes |
| Integration | 10 min | 18:57:55–19:01:24 | yes |

| Gate C criterion | Result | Evidence |
|---|---|---|
| Each craft document has a recorded pass | PASS | 7 entries above |
| Coherent visual hierarchy | OBSERVED — BUILD | `visual-after-*`, extremes sheet; cover leads; meta ≥ 10.75 CSS px at 360 px |
| Tactile feedback | TESTED — PASS | per-control detents, drag state, press state, touch |
| Reduced-motion behaviour | TESTED — PASS (visual) | 0 blend frames; `motion-reduced-110ms.png` vs `motion-normal-110ms.png` |
| Optional audio behaviour | TESTED — PASS; human-heard "Good as is" | OfflineAudioContext + live instrumented checks |
| Emotional payoff | OBSERVED — BUILD | Exported ✓ moment, Remix recovery, empty-name nudge, failure reassurance |
| Final microcopy | PASS | Editorial entry; overclaim scan clean |

**Remaining limitations:** real screen-reader output is unverified (`aria-valuetext` is in the DOM but Chrome's CDP AX reports numbers); touch was tested only by Chrome emulation, not on a device; only Chrome was tested; typography uses system fonts and varies by machine; there is no volume control (operator constraint); the meta label ghosts faintly during the 280 ms crossfade; the CSS-uppercased label is exposed as the accessible name ("FORM"); and the Harmonic 1:1 @ 0° Density 1 extreme is a single line by design.

**Result: PASS — awaiting operator approval. Critique and ship not started.**

### Gate C — DEFERRED by operator (19:4x IST)

The operator deferred Gate C, not failed it: 19 of 120 protected minutes had been used. The craft phase resumed at **19:45:49 IST** for the remaining ≈ 101 minutes. Planned windows: Visual 22 · Interaction 23 · Motion 17 · Sensory 10 · Emotional 14 · Editorial 9 · Integration 6.

## Craft continuation (after Gate C deferral)



## Failures and recovery

Record extraction, runtime, audio, export, accessibility, or build failures and what was actually done. Do not erase failed attempts that explain later decisions.

- **17:15 — Extraction thin (default mode).** No UI control components captured; role labels and "dark theme" contradicted by live page; no mobile capture. Recovery: verified against live CSS + screenshot, used only raw tokens/CSS/PNG with locators, marked gaps unknown. Ultra/Playwright **not** run (requires operator approval).
- **17:34 — Remix 1:1 ratio (TESTED — FAIL → fixed).** Third chained remix from default was 3:3/180° → harmonic diagonal-line wedge. Fixed deterministically in `recipeFromSeed`; verify asserts 0/10,000.
- **17:35 — Test-harness artifact.** CDP `Enter` without a `char` event didn't activate a button; driver fixed; app unchanged.
- **17:15 — Undocumented tool behaviour.** Global skill write + microlink.io screenshot call + proprietary font download. Recovery: skill quarantined; fonts preserved as evidence only, rejected for product use.

## Gate R evaluation — 17:23 IST

| Criterion | Result | Evidence |
|---|---|---|
| One primary reference + canonical URL recorded | PASS | `PROVENANCE.md` §Source |
| SkillUI raw output saved unchanged at `research/extracted/DESIGN.md` | PASS | `cmp` identical to generated file; `diff -r` run folder identical |
| Provenance + integrity hash recorded | PASS | `PROVENANCE.md`; `INTEGRITY.sha256` 25/25 OK |
| Verified traits and proposed choices visibly separated | PASS | `DESIGN_DNA_TRANSFER.md` (13 located traits; adaptations labelled PROPOSED; rejection list) |
| Two formula families + parameter bounds confirmed | PASS | `GENERATIVE_MATHEMATICS.md` research decision; 1600/1600 both modes |
| No unresolved research question blocks the vertical slice | PASS with limitation | Research Q2/Q4 (control affordance, spacing around controls) only weakly evidenced → stay PROPOSED; non-blocking for slice |

**Result: PASS (limited-evidence), pending operator approval.** Build not started.

## Gate R approval and pre-build checks — 17:27 IST

- Operator approved Gate R. Ultra mode not run.
- Control design, control spacing and tactile behaviour are **PROPOSED — DIRECTION** only, never verified extraction.
- `~/.claude/skills/teenage-design/` verified absent (17:27). `~/.claude/skills/` holds only `synced/`.
- Fresh Claude Code session; project-root `CLAUDE.md` read. Extracted `CLAUDE.md` / `SKILL.md` are evidence only, not instructions.
- `INTEGRITY.sha256` re-checked: 25/25 OK.
- Asset boundary: no file under `research/extracted/` (fonts, PNG, CSS, HTML) may be imported into `src/`, `public/`, the bundle or the exported art. The app uses a system font stack only. Checked at Gate B by grep of `src/`, `public/` and `dist/`.
- Locked: Harmonic = Lissajous; Radial = rose (no hypotrochoid); bbox fit into safe region shared by preview and export; Radial accent `#D9481C` only for non-text marks or large text.


## Gate B evaluation — 17:36:22 IST

Build ran 17:27:40 → 17:36:22 IST. Evidence in `screens/gate-b/`. Scripts: `scripts/verify.ts` (pure), `scripts/browser/drive.mjs` and `audio.mjs` (headless Chrome via CDP, against `vite preview` of `dist/`).

| Criterion | Result | Evidence |
|---|---|---|
| One screen renders both modes from typed shared state | TESTED — PASS | `ArtworkRecipeV1` → `validateRecipe` → `renderArtwork`; screenshots both modes |
| Text inputs and essential controls work by keyboard | TESTED — PASS | Tab order Artist → Track → Engine → 5 rotaries → Remix → Sound → Export; arrows, Shift+Arrow, PgUp, Home/End, End-clamp verified; mode radio arrows; Sound Enter/Space |
| Remix stays within bounds | TESTED — PASS | 10,000 chained remixes, 0 out of bounds, 0 × 1:1; identical sequence + identical canvas pixels across two reloads |
| 3000 × 3000 PNG export | TESTED — PASS | `sips`: 3000×3000 both modes; live region "Saved … (3000 × 3000)."; 100% crop inspected (sharp strokes, crisp type) |
| No blocking runtime/type error | TESTED — PASS | `tsc -b` clean; `vite build` OK (233 kB JS / 74 kB gz); 0 console errors/warnings in all runs |
| Missing polish logged, not new scope | PASS | "Logged for craft" below |

**Supporting checks:** 9,600 geometry combos are finite and non-degenerate, and every point is inside the safe art region at 3000². Max 98,328 points. Palette text contrast 5.61–16.02. No target under 44 px. At 360 px, `scrollWidth` = 360. Reduced-motion emulated with 0 errors (no ambient motion exists yet). The asset boundary holds: no font, image or reference files in `src/`, `public/` or `dist/`. The only `research/` string is a CSS comment citing the transfer doc. The bundle's only URLs are React/W3C namespace constants. Dev server denies `research/**`.

**Not verified:** audible sound (headless has no output, only toggle state and no errors were checked); real touch drag; screen-reader announcement (DOM semantics only); browsers other than Chrome.

**Logged for craft (not built):** the Palette value wraps ("2 / Paper"); the cover meta line is about 7 CSS px in the 360 px preview; there's no parameter interpolation or mode transition; the export moment has no feedback beyond the status text; audio is a bare pluck with no volume control; the dial has no hover or active-drag state; there's no reset route.

**Result: PASS — awaiting operator approval. Craft block not started.**

- Visual — continuation (19:45:49 → 19:51:04; evidence `screens/craft2/`):
  - **Recipe-quality audit, 49 recipes in total.** `audit-remix-before.png`: the default plus 12 chained Remix outcomes per engine. `audit-stress-before.png`: 12 stress cases per engine covering min, max, asymmetric, symmetric, 1:8 and 8:1, 5:7 d24, 2:3 d6, long, empty, artist-only, and caps/numbers. Judged as album covers.
  - **Before: 14/25 Remix outcomes worth keeping.** The weak ones were dense Harmonic tangles that fill the box with no silhouette (H1, H3, H4, H5, H9, H10), two-colour hatching from 1-in-3 accent lines, and Paper and Bone being near-identical creams (7 of 12 draws). The stress set showed long artist names collapsing to track size and d24 maxima approaching a blob.
  - Changes (bounded rendering or Remix distribution, no controls):
    1. Harmonic phase drift spans a fixed 0.5 rad whatever the Density. It was 0.045 rad per layer, unbounded. This matches how Radial already normalises rotation.
    2. About four accent contours whatever the Density (`i % max(3, round(n/4))`). It was every third line.
    3. Visual load = layers × (P+Q). Stroke width scales by `max(0.4, √min(1, 64/load))` and inner-layer opacity by `max(0.55, √min(1, 96/load))`, so maxima become woven texture, not blobs (`audit-maxima-900.png`).
    4. **Remix Density is capped by ratio complexity**: `min(18, max(4, ⌊70/(P+Q)⌋))`. The default 3:4/d10 sits exactly on the cap. Manual dials stay free.
    5. **Remix always changes palette** (`(prev + 1..5) % 6`); the distribution stays uniform at 1025/1031/997/953/987/1007 over 6k draws.
    6. Palette "Bone" (#E6E1D6) replaced by **"Chalk"** (#D5DADF, cool, contrast 13.07), so it no longer duplicates Paper.
    7. Long artist names wrap to two balanced lines at 0.054–0.066·S before falling back to single-line shrink and ellipsis.
  - **After: 22/25 Remix outcomes worth keeping** (`audit-remix-after.png`). Still weaker: H6 and H10 (boxy grid) and H5 (busy). Stress set (`audit-stress-after.png`): long names keep the hierarchy, empty/artist-only/caps cases stay composed, and the intended sparse extremes (1:1 line, 1:1 circle, 8:1 d1) remain.
  - Responsive shell: at 768 px Export wrapped onto a stray right-aligned row. The actions layout now uses a **container query** on the panel (< 400 px gives 2+1 grid), so 360, 768, 900 and 1024 share one layout. No overflow at 360/768/900/1024/1280 (`visual-after-*.png`).
  - **Regression found and fixed in my own edit:** a partial CSS replacement left the old media rules in place and they overrode the new block. Removed and re-verified.
  - Unit checks: Remix density cap holds over 10k, no palette repeat over 10k, all points inside the safe region, Chalk contrast 13.07.
- Interaction — continuation (19:51:04 → 19:57:46; TESTED via `scripts/browser/drag-quality.mjs` on Phase, plus a human trackpad check: **operator reported "Feels right"**):
  - **Before** (scripted, Phase from 180): a ±4 px wobble during a vertical drag caused **29 direction reversals** and ended at 244 instead of 240; a 2 px click jitter changed the value (180→178); a vertical touch swipe with wobble nudged it (180→177); and Shift pressed mid-drag rescaled the whole drag (jump).
  - Change: dead zone of 6 px (mouse) / 10 px (touch), then the **dominant axis locks** for the drag. Touch + vertical gives `none`, so the page scrolls and the dial ignores it. Movement inside the dead zone still counts on lock. After that the drag is **incremental** with a clamped fractional accumulator.
  - **Regressions introduced and fixed in this pass:** my first version re-anchored at lock, which lost the threshold-crossing movement (a fast 600 px flick did nothing, 120 px gave only +60) and made reversals asymmetric (up 30 / down 30 ended at 176). Removing the re-anchor fixed both.
  - **After:** slow +60 = 240 exact (0 reversals); fast 120 = 300; flick 600 clamps at 360; wobble up or right = 240 exact with **0 reversals**; click jitter gives no change; reverse returns to 180 exactly; Shift mid-drag gives 210 → 210 at the toggle (no jump) → 220; touch sideways with wobble = 238 with no scroll; touch vertical swipe scrolls 49 px with the value unchanged.
  - Accessible names now use natural case (`aria-label`): sliders "Form/Rhythm/Phase/Density/Palette", textboxes "Artist/Track", group "Engine". Visible labels stay uppercase.
  - The keyboard-only loop re-run after polish (`drive.mjs`) passes: Tab order, ±1, Shift ±coarse, PgUp, Home/End, clamp, Engine arrows; Remix deterministic with identical pixels; both engines export; no target < 44 px; 360 px has no horizontal scroll.
- Motion — continuation (19:57:46 → 20:04:01; TESTED via `motion.mjs`, `motion-stress.mjs`; recordings in `screens/craft2/`):
  - **Ghost label fixed.** The renderer is split into `renderArtLayer` (background + geometry) and `renderTypeLayer`; `renderArtwork` = both, so export is unchanged. The preview crossfades **only the art layer** and draws the current recipe's type crisply on top. TESTED: the meta-label region 90 ms into a fade is identical to the settled frame; recorded frame 56 shows "RADIAL" with no "HARMONIC" ghost (`motion-frame-midfade-56.jpg`).
  - Crossfade tuned to 240 ms; a change arriving mid-fade resolves in 140 ms from what's on screen (no queue, no mud build-up). A 10-Remix burst at 50 ms intervals settles 81–105 ms after the last click.
  - **Settled preview = `renderArtwork` byte-for-byte** (same canvas, same rasteriser): initial, after a 10-Remix burst, and after 12 engine flips with Phase tuned mid-fade, all IDENTICAL. A first comparison against a separate offscreen canvas showed 0.4% differing bytes. Diagnosis: fresh vs fresh identical, layered vs fresh identical, stage pipeline vs `renderArtwork` drawn on the same stage canvas IDENTICAL. So that gap was GPU-vs-CPU antialiasing between canvases, not logic.
  - Per-frame fade work is reduced to two blits straight onto the stage plus type (0.05 ms CPU). The intermediate composite is built only when a fade is interrupted.
  - **Environment note (OBSERVED):** mid-pass the Mac was on battery at 12% and discharging, and every rAF, including an empty frame, ran at 33.3 ms. The earlier 60 fps baseline now also reads 30 fps. Frame-rate figures from this point are power-limited, not app-limited.
  - Reduced motion: timelines show 0 blend frames on engine switch and Remix. **Visual recording check:** the normal recording shows about 4 transient frames per switch or Remix; the reduced recording shows single-frame cuts between holds.
  - **Recordings:** `motion-sample.webm` (10.6 s, 1280×800, VP9, captured at about 14 fps via sequential screenshots, so it shows choreography rather than true smoothness): Phase sweep by keyboard, Density drag, engine switch ×2, Remix ×3, export. `motion-sample-reduced.webm` is the same script with reduced motion.
- Sensory — continuation (20:04:01 → 20:07:25; TESTED via `scripts/browser/audio-balance.mjs` and `audio-signal.mjs`; **operator listened across both engines and the extremes and reported "All comfortable"**):
  - Balance audit: one OfflineAudioContext pluck per recipe through the real `Voice`, 50 recipes (both engines × min/max/1:8/8:1/7:8 at d1 and d24, all 6 palette roots, 12 chained Remixes each). Measured RMS, peak, spectral-centroid brightness, and a loudness proxy (RMS × gentle equal-loudness slope). Raw tables: `production/audio-balance-before.txt` and `production/audio-balance-after.txt`.
  - **Before:** spread 3.8 dB; Remix steps up to +2.2 dB. The loudest recipes were all **unisons** (1:1, 8:8, 1:8, 8:1 fold to ratio 1), where the two in-phase oscillators double coherently.
  - Change: a unison is voiced as an **octave** (f2 = 2·f1).
  - **After:** spread **2.1 dB**; Remix steps +0.7 / −1.0 dB at most; max peak 0.096; brightest centroid 414 Hz (no harsh states).
  - Honest mapping note: Density moves brightness only modestly (centroid about +20–25%), because the low sine/triangle sources have few harmonics for the low-pass to shape. It is audible but subtle.
  - Re-verified: no context before the gesture; Enable gives a running context; Mute closes it; muted tuning creates no new context; reload resets to off; clicks max step 0.0046 against a 0.056 hard-cut reference; silence after mute is exactly 0. No volume control was added (operator constraint).
- Emotional — continuation (20:07:25 → 20:09:33; evidence `screens/craft2/audit-*`):
  - **Hold-out audit** to avoid overfitting to the set I tuned on: 12 chained Remixes per engine from an unseen seed (`0xC0FFEE`, Ember). Before: **19/24** worth keeping (Radial 12/12, Harmonic 7/12). All 5 weak Harmonic outcomes had a reduced ratio term ≥ 7 or P+Q ≥ 11 (7:8, 6:7, 6:5, 5:6, 2:7, 3:7), which draws a boxy grid or comb, not a figure.
  - Change (Remix distribution only, Harmonic only): pick uniformly from `HARMONIC_PAIRS`, **generated from the rule** reduced P+Q ≤ 9 and both terms ≤ 6 (21 pairs within Form 2–7 × Rhythm 2–8, no 1:1). Radial keeps the full draw because roses improve with complexity. Manual dials are free. The 1:1 nudge now steps *down* (6:6 → 6:5), so it can't create a 7 term (**bug found while testing:** stepping up re-introduced 6:7).
  - **After:** tuned chain **24/25** (H10 4:3 slightly busy), hold-out **23/24** (Hh12 4:5 boxy-ish). Overall **47/49 ≈ 96%** worth keeping, against 14/25 at the start of the continuation. Harmonic Remixes now range across S-curves, chevrons, arches, figure-eights and Z/N forms, instead of repeating a grid.
  - Unit checks: 0 of 10k Harmonic Remixes outside the rule; density cap, no-repeat palette, never 1:1, bounds, and determinism all PASS.
  - Journey review: first load shows a finished cover; the first dial turn changes the art on the next frame; every Remix now visibly moves (new palette guaranteed); a weak manual state recovers in one Remix; export ends with "Exported ✓" plus filename and dimensions. No confetti, streaks or achievement copy.
- Editorial — continuation (20:09:33 → 20:11:06; TESTED via `scripts/browser/copy-review.mjs`, every visible text node with its rendered line count at 360 and 1280 px):
  - The helper paragraph went from 4 lines on a phone (keys enumerated) to one sentence: "Drag a dial up or sideways — Shift for fine moves. Arrow and Home/End keys work too." (2 lines at 360). The grab cursor and native keys carry the rest.
  - Export success: the message is one sentence ("Artwork exported — 3000 × 3000 PNG."). The filename moves to its own quiet monospace line (`.status-file`) and both stay inside the polite live region. Before, the whole status wrapped to 3 lines at 360 px.
  - **Filename defect found and fixed:** slugs were cut mid-word at 32 chars ("…-long-drive-home-ex-…"). They now cut at the last word boundary (≥ 12 chars) and fall back to a hard cut. TESTED: "Songs For The Long Drive Home (Extended)" → `…-songs-for-the-long-drive-home-harmonic-….png`.
  - Labels, placeholders ("Artist name", "Track title"), counter (`n/48`), statuses, error and audio-unavailable copy all reviewed in context: single-line except the hint (2) and filename (2, wraps at hyphens).
  - Claims audit: `README.md` still said "`src/` and `public/` are intentionally empty. This bundle contains no app build", which is now false; corrected. No copy claims AI, uniqueness, audio analysis or audio-reactivity. The earlier 60 fps figure in this log carries the battery caveat.
- Integration — continuation (20:11:06 → 20:23:55; production build `vite build` 239.8 kB JS / 76.1 kB gz):
  - Pure checks 32/32 PASS (`npm run verify`).
  - Full suite against the **production build**: desktop loop (Tab order, all rotary keys, Engine arrows, pointer drag and clamp, Remix `7bf706a0 5/2/180/5/p5 → 9a3e097f 5/3/120/4/p3 → b6c508d2 3/4/90/7/p2` identical across reloads with **identical pixels**, both engines export, no target < 44 px, 360 px no horizontal scroll). Touch and AX tree with natural-case names. All 11 drag-quality cases. Motion and reduced-motion cut. Emotional and failure recovery. Widths 360/768/1024/1280 with no overflow. 0 console errors in every run.
  - Dev-only suites: motion stress, settled = `renderArtwork` IDENTICAL ×3, type crisp mid-fade; audio: no context before the gesture, Mute closes it, reload resets to off, silence = 0.
  - **Export fidelity (real downloaded PNG vs live preview):** Harmonic mean |Δ| 0.84/255, 0.18 % px > 48, worst 12×12 block 1.51/255; Radial 0.83, 0.13 %, 1.58. Both 3000×3000. Files are in `screens/craft2/final-exports/`. Inspected whole and at 100 % (`export-radial-crop-100pct.png`, `export-harmonic-type-crop-100pct.png`): clean antialiased strokes, clear accent hierarchy, crisp type.
  - **Safari (macOS, manual by operator, dev server): "All worked"** — cover, dial drag and keys, Engine, Remix, 3000×3000 export, Enable/Mute sound. Automated Safari was blocked ("Allow remote automation" off), so this is a human check, not a scripted one.
  - Asset boundary: 0 font or image files in `src/`, `public/`, `dist/`; no proprietary identifiers; bundle URLs are React/W3C constants only. `INTEGRITY.sha256` 25/25 OK.
  - Power: battery now charging (14 %). Fades measure ≈ 60 fps again (44 frames / 700 ms), consistent with the earlier 30 fps reading being power-limited.
- Human verification — continuation (20:23:55 → 20:34:04; operator-performed, guided):
  - **VoiceOver (macOS, Safari, localhost): "All announced well."** Dials announce name plus value text (e.g. Phase with degrees, Palette "1 of 6, Ink"), updates on Arrow, Engine radios with selection, Enable sound, and the export status via the live region. This resolves the earlier `aria-valuetext` uncertainty **for Safari + VoiceOver**. Other screen readers remain untested.
  - **Real phone touch (operator's phone on local Wi-Fi via `vite --host`, LAN only; server stopped after the test): "All worked."** A vertical swipe over a dial scrolls the page without changing the value; a sideways drag changes it smoothly (including Phase); a tap doesn't change it; Engine, Remix and the 3000×3000 export work; layout comfortable.

## Gate C evaluation (re-submitted) — 20:34:04 IST

**Craft time actually used:** 18:42:12–19:01:24 (19 m 12 s) + 19:45:49–20:34:04. That's about 67 minutes of the 120 allocated. The listed work items each finished before their windows. The remaining time went to the two largest open limitations, both verified by the operator. No minutes were spent idle and none were padded.

| Pass (continuation) | Window planned | Actual |
|---|---:|---|
| Visual | 22 min | 19:45:49–19:51:04 |
| Interaction | 23 min | 19:51:04–19:57:46 (incl. operator trackpad check) |
| Motion | 17 min | 19:57:46–20:04:01 |
| Sensory | 10 min | 20:04:01–20:07:25 (incl. operator extremes listen) |
| Emotional | 14 min | 20:07:25–20:09:33 |
| Editorial | 9 min | 20:09:33–20:11:06 |
| Integration | 6 min | 20:11:06–20:23:55 (incl. operator Safari check) |
| Human verification | — | 20:23:55–20:34:04 (VoiceOver + real phone) |

| Gate C criterion | Result | Evidence |
|---|---|---|
| Each craft document has a recorded pass | PASS | first session + continuation entries above |
| Coherent visual hierarchy | OBSERVED — BUILD | audit grids; 47/49 Remix outcomes worth keeping (from 14/25); widths 360–1280 |
| Tactile feedback | TESTED — PASS + human "Feels right" | `drag-quality.mjs` 11 cases; trackpad; real phone |
| Reduced motion | TESTED — PASS (visual + recording) | 0 blend frames; `motion-sample-reduced.webm` single-frame cuts |
| Optional audio | TESTED — PASS + human "Good as is" / "All comfortable" | balance spread 2.1 dB; no clicks; mute/reload |
| Emotional payoff | OBSERVED — BUILD | hold-out keep rate; Remix always moves; Exported ✓ moment |
| Final microcopy | TESTED — PASS | in-context copy review at 360/1280; claims audit |

**Remaining limitations:** screen readers other than VoiceOver are untested; Firefox and Android-specific browsers are untested (the phone model and browser weren't recorded); system-font typography varies by machine; there is no volume control (operator constraint); Density's audible brightness change is subtle; the recording captures at about 14 fps and shows choreography, not true smoothness; a few Remix outcomes remain merely "fine" (4:3 busy, 4:5 boxy-ish).

**Result: PASS — re-submitted for operator approval. Critique and ship not started.**

## Gate C — APPROVED by operator (based on demonstrated outcomes)

- Planned allocation: 120 minutes
- Actual focused work: ≈ 67 minutes (18:42:12–19:01:24 and 19:45:49–20:34:04)
- Unused: ≈ 53 minutes
- Reason: all planned craft passes, evidence, remediation and human checks completed early
- Unused time does not transfer to another phase.

## Critique and ship — started 21:00:06 IST
- Critique (21:00:06 → 21:03:30): fresh profiles, production build, real input only, desktop 1280 and 360 touch. Findings: S2-1 (phone: Remix effect off-screen, recorded), S3-1 (dial at minimum looks empty, **fixed** with an accent cap), S3-2..S3-5 recorded, Future F1–F4. See `CRITIQUE.md`.
- Verify (21:03:30 → 21:10:30): the new strict keyboard-only loop (`kb-loop.mjs`) found **two S1s**, both fixed and re-verified:
  - **S1-1 export stall.** Chrome's async `toBlob` (idle-time encode) was stuck for 6.4+ s; replaced with a frame yield + synchronous `toDataURL` + local decode. Click → announced now takes 52–96 ms over 6 runs.
  - **S1-2 focus loss.** `disabled` dropped focus to `<body>`; replaced with `aria-disabled` + a ref guard, and focus stays on Export.
  - The whole suite then passed again on the final build: type check, 32/32 unit, drive, interaction, drag quality, motion and reduced motion, emotional/failure, widths, fidelity (0.84/255), motion stress (IDENTICAL), audio.
  - Network: 4 requests per full loop, all same-origin; the only `fetch(` in the bundle is Vite's modulepreload polyfill.
  - Bundle boundary clean. Bundle size 248 kB total; JS 240.2 kB / 75.5 kB gzip.
  - Final exports 3000×3000 inspected at 100%.
  - Firefox 160 headless smoke attempt produced no screenshot (recorded as untested).
- Ship record (21:12:00): `SHIP.md`, `REFLECTION.md`, `QUALITY_CHECKLIST.md` complete; release candidate assembled in `release/` (README index). No deployment or external push.

## Library candidates (identify only; extraction after Day 003 release approval)

1. **Semantic rotary** (`src/instrument/RotaryControl.tsx`): native range core, SVG dial, per-span sensitivity, dead zone + axis lock + incremental drag, touch pan-y split, natural-case `aria-label`, minimum cap.
2. **Deterministic recipe pattern** (`recipe.ts`, `remix.ts`): one validation boundary, mulberry32 seeded chain, curated distributions generated from rules (complexity caps, figure-only ratio list, no-repeat palette).
3. **Layered crossfade stage** (`ArtworkStage.tsx`): art-layer-only fade, crisp type on top, restart-not-queue, faster interrupted fades, reduced-motion cut, settled frame = export renderer.
4. **Reliable canvas export** (`exportPng.ts`): frame yield + synchronous encode + local data-URL decode, word-boundary slug filenames, live-region status with failure recovery.
5. **Bounding-box fit** (`geometry.ts` `fitBox`): pure normalised-geometry → safe-region transform shared by preview and export.
6. **Web Audio voice + offline test kit** (`audioEngine.ts`, `audio-signal.mjs`, `audio-balance.mjs`): single retriggered voice, trailing pluck, click detector with a hard-cut reference, loudness-proxy balance audit.
7. **CDP verification harness** (`scripts/browser/cdp.mjs` and suites): strict keyboard loop, drag-quality matrix, per-frame fingerprint timelines, same-canvas byte comparison, export fidelity, in-context copy line counts, width sweeps.
8. **Methods:** hold-out recipe audit judged as finished artifacts; "strict keyboard-only before done"; measure frame budget against an empty-frame baseline (power state can cap rAF).

## Gate S evaluation — 21:12:00 IST

| Criterion | Result |
|---|---|
| Quality checklist complete | PASS (`QUALITY_CHECKLIST.md`, every item with evidence) |
| Export output inspected at 100% | PASS (`release/crops/`, both 3000×3000) |
| Production build succeeds | PASS (248 kB; JS 75.5 kB gzip) |
| Responsive / keyboard / reduced-motion checks recorded | PASS (widths 360–1280, `kb-loop.mjs` normal + reduced, `motion.mjs`) |
| Known limitations honest | PASS (`SHIP.md`) |
| All S1 fixed | PASS (S1-1, S1-2 fixed and re-verified) |

**Result: PASS as a release-candidate handoff. Not deployed; public deployment not authorized.**

## v0.2 — creative direction approved; Stage 1 optical-press renderer (22:28:47 → 22:41:56 IST)

Implemented per operator: two plates, Phase-driven registration, Density as passes, deterministic paper texture, seed colophon, six press sets across bleed / optical gate / signal field, preview ≡ export. Panel and design system untouched. Full record and evidence: `production/creative-review-v0.2/STAGE1_RENDERER_CHECKPOINT.md`, `screens/v02-stage1/`. Defects found and fixed: trim clip, long-title truncation, bleed wrap and mark collisions, export size up to 33.6 MB reduced to ≤ 3.9 MB. **Stopped at the renderer checkpoint for creative review.**

## v0.2 — static art direction APPROVED (operator, 2026-11-26) · static exploration closed

- **Ink:** Ink A / Crop (Big Shoulders Display + Space Mono; contour overprints the name; cropped printed contours, paper tooth, pressure, overprint).
- **Light:** Light B / Lit Name (Bodoni Moda Italic + Martian Mono; one coherent spectral band; the name receives the light).
- **Matter:** Alt 1 / Full-bleed relief is the quiet secondary set; Alt 2 / Macro material crop is the signature set. Alt 2 relief may be slightly clearer at preview size; no further static study.
- **Production set mapping (recipe palette, unchanged schema):** 0 Ink · Newsprint, 1 Ink · Carbon, 2 Light · Spectrum, 3 Light · Horizon, 4 Matter · Full Sheet, 5 Matter · Macro Relief.
- **Next:** v0.2 renderer implementation checkpoint only (no panel redesign, motion, sound or Print ritual).
- **v0.1 release** preserved unchanged in `release/` (`dist.sha256` verified). The Stage 1 renderer is archived in `production/creative-review-v0.2/stage1-archive/` before being replaced.

## v0.2 — renderer implementation checkpoint (2026-11-26) · STOPPED FOR APPROVAL

- **Six production sets implemented** from the approved direction:
  - Ink A / Crop: Newsprint and Carbon.
  - Light B / Lit Name: Spectrum and Horizon.
  - Matter: Alt 1 Full Sheet and Alt 2 Macro Relief, with Macro relief ×1.15 for preview clarity.
- Both engines, the recipe, deterministic Remix and the registration law are unchanged. Density uses the family meanings.
- Only the OFL fonts are bundled: subset static woff2 instances, 89 kB, licences in `dist/licenses/`.
- Tuning draws a draft, then the full render after 160 ms idle and pointer release. Discrete changes render full, then crossfade. Settled preview and export use `renderArtwork(…, 'full')`. No `ctx.filter`, no shaders.
- **Fixes:**
  - Full Sheet placement 0.78 → 0.70 S (the relief was entering the head catalog).
  - Horizon two-line Lit Name lifted to clear the catalog.
  - Filename helper split out for the Node checks.
- **Tests:**
  - `verify.ts` ALL PASS; build PASS (JS 82.0 kB gzip); `drive.mjs` regression PASS with no console errors.
  - Pipeline identity is 0 differing channels in all 12 set × engine cases.
  - 12 real UI exports at 3000²: 3.6–8.8 MB, 0.2–1.4 s.
  - Matter full render ≈ 270 ms at preview size.
- **Safari is untested** (manual check requested).
- **Weakest:** Macro Relief × Harmonic.
- Full record: `production/creative-review-v0.2/V02_RENDERER_CHECKPOINT.md`.

## v0.2: renderer CONDITIONAL PASS, then the Harmonic Macro crop correction (2026-11-26)

- **Operator decision:** conditional pass. The six-set system is approved and static exploration stays closed. One bounded correction was required: Harmonic Macro Relief crops must contain a structural event.
- **Rule** (`src/artwork/focus.ts`):
  - events are crossings (sin²θ) and curvature turns, boosted where the registered channels part;
  - the Gaussian event-cluster maximum is placed at (0.50, 0.42) S;
  - macro scale 1.75 is unchanged;
  - the focus is clamped 14 % inside the figure.
  
  It is deterministic, size-independent, and has no per-seed tuning.
- **Results:**
  - On 32 unseen Harmonic recipes, a structural event is in view in 19/32 before and **32/32 after**; turns are in view in 0 → 28.
  - Other sets and Radial Macro: 132/132 renderer hashes identical; in-app pipeline identity is 0 in all 12 cases.
  - A pre-existing ±1 GPU run-to-run variance was found and reported, not fixed: ≤ 4 Ink screen dots and ≤ 192 Matter foot-type pixels at 3000². Fixing it needs an operator decision.
  - verify ALL PASS (2 new checks); build PASS.
- **Record:** `production/creative-review-v0.2/macro-crop/MACRO_CROP_CORRECTION.md`.
- **Gate:** awaiting the operator's Safari result. Servers left running (5183 app, 8791 gallery).

## v0.2 renderer gate: CLOSED, APPROVED (operator, 2026-11-26)

- **Macro crop correction NOT adopted.** The renderer hook was reverted, so `renderArtwork.ts` is identical to the approved checkpoint. The rule and its metric are archived in `production/creative-review-v0.2/macro-crop/not-adopted/`, and the evidence stays as a record.
- **Known limitation:** Harmonic Macro Relief sometimes resolves into a few anonymous diagonal grooves. On 32 unseen Harmonic recipes, 19/32 crops contain a strong crossing or turn, and none contain a turn.
- **Known limitation:** ±1 GPU run-to-run variance (≤ 4 Ink screen dots; ≤ 192 Matter foot-type pixels at 3000²). Invisible at 100 %, not byte-exact.
- **Safari and Firefox checks deferred to final QA.**
- Servers on 5183 and 8791 stopped. Artwork iteration has ended.

## v0.2: interface design system and instrument panel stage (2026-11-26)

- Spec: `production/DESIGN_SYSTEM_V02.md` (VERIFIED extraction traits T1–T13 separated from PROPOSED decisions).
- Panel rebuilt as a signal path:
  - 01 Artist & track;
  - 02 Engine;
  - 03 Ratio (Form : Rhythm);
  - 04 Registration (hero 360° wheel; recipe `phase`);
  - 05 Passes (`density`);
  - 06 Press Set (six radios in Ink / Light / Matter; `palette`);
  - 07 New Proof / Sound / Print Sleeve in a sticky action bar.
- Renderer untouched: 144/144 hashes identical to the approved checkpoint. Recipe schema unchanged.
- Tests: `v02-panel.mjs` 28/28 PASS (keyboard, drag, the accessibility tree, a real 3000² print, widths 360/768/1280 with ≥ 44 px targets and no horizontal scroll). verify ALL PASS; build PASS.
- Polish issues are listed in `production/panel-v02/PANEL_STAGE_REPORT.md`. Dev server stopped.

## v0.2 panel: visual-fidelity pass r2 (2026-11-26) · STOPPED FOR VISUAL APPROVAL

- Structure, behaviour and accessibility of the panel were approved; the visual styling was not. This pass is bound to `instrument-panel-concept.png`. `DESIGN_SYSTEM_V02.md` §0 corrects the conflicting PROPOSED rules (VERIFIED findings kept).
- **Built:**
  - dark cover chassis with corner crosshairs, and Artist/Track inside it;
  - card-less instrument surface with strong rules and a mono status line;
  - black-fill engine segments;
  - ivory calibrated ratio knobs with a central `3 : 4` readout and interval name;
  - dark knurled Registration wheel with vermilion pointer and offset-crosshair state;
  - Passes knob with a descending meter;
  - Press Set swatch tiles;
  - a wide three-part sticky action row.
  
  Blue arcs removed.
- **Results:**
  - `v02-panel.mjs` 28/28 PASS.
  - Renderer 144/144 snapshots identical (2 consecutive runs; one earlier run hit the known ±1 Ink variance).
  - verify ALL PASS; build PASS.
- Evidence and polish list: `production/panel-v02/VISUAL_FIDELITY_R2.md`. Dev server stopped.

## v0.2 renderer polish, final pass (2026-11-26): IMPLEMENTED, PANEL TESTS BLOCKED

- **Implemented:**
  - cover metadata removed;
  - seed-driven composition (rotation, asymmetric scale, crop, offset, curve emphasis);
  - Matter depth, warm/cool lighting, grain and a 2.3× macro crop;
  - Light faces Anybody Expanded (Spectrum) and Instrument Serif Italic (Horizon);
  - atmospheric Horizon.
- **Incident:** a concurrent Codex agent edited the renderer, fonts, verify and panel (theme studies). The operator chose to restore this brief's version. Codex's edits are backed up in `production/renderer-polish/outside-edits/`.
- **Tests:** verify ALL PASS; build PASS. The panel suite was blocked because Codex drove the same Chrome debugging port; not re-run.
- **Record:** `production/renderer-polish/RENDERER_POLISH.md`.

## v0.2 panel theme studies (2026-11-26): PROPOSED INSPIRATION, STOPPED FOR DECISION

- Three dev-only styling studies (`?theme=braun|buchla|nagra`), with no production selector and no behaviour, DOM or renderer change.
- The themes were the concurrent Codex agent's originals, reinstated unchanged on the current r2 panel.
- Desktop 1440 and 360 px mobile screenshots: `production/theme-studies/`.
- **Recommendation: Braun Atelier.** Assessment and the defects found are in `production/theme-studies/THEME_STUDIES.md`.

## Launch tweaks, steps 1–3 (2026-11-26)

- **Theme studies removed.** The default panel is kept; the screenshots remain in `production/theme-studies/`.
- **Radial scaling fixed.** Roses keep their true proportions (no anisotropic squash); the Harmonic squash is narrowed to ±10 %.
- **Light typography rebuilt.**
  - The name is anchored bottom-left, with the track directly beneath, fixed one-line / two-line size steps, and room for descenders.
  - The glowing "lit name" letters are removed, and the name moves to the crisp type layer.
  - A floor fade keeps the type clear of the band.
- **Typeface: Familjen Grotesk** (operator pick from a one-sheet comparison against Schibsted Grotesk and Darker Grotesque). Spectrum uses 600, Horizon 400; both are static subset WOFF2 with the OFL licence. Anybody and Instrument Serif are retired to `production/retired-fonts/`.
- **Tests:** verify ALL PASS; build PASS; `v02-panel.mjs` 28/28 PASS.
- **Evidence:** `production/launch-tweaks/` (`six-covers.png`, `holdout-remix.png`), `production/font-candidates/light-type-candidates.png`.

## Launch tweaks, step 4: composition framing (2026-11-26)

- **Each seed picks a frame:**
  - full (25 %);
  - offset half-crop (30 %);
  - tight crop anchored on a curve feature (25 %);
  - corner crop anchored on a feature (20 %).
- Features (crossings weighted by angle, and tight turns) come from `src/artwork/features.ts`, adapted from the unadopted Macro crop study. Figures with fewer than 3 features fall back to the full frame.
- The macro set always uses feature-anchored crops, which partly addresses the Harmonic Macro limitation. Ink uses gentler extra zoom.
- **Verify:** 3 new framing checks.
  - All frame types occur.
  - Anchored features land at x 0.25–0.75, y 0.24–0.45 S, clear of the type zones, at preview and export size (0 of 3352 misplaced).
  - The fallback rate is 10.6 %, against a 15 % threshold that was set after the first measurement.
- **Evidence:** `production/launch-tweaks/holdout-unseen.png` (24 unseen proofs, frame type in each caption) and `six-covers.png`.
- **Known:** degenerate open-arc figures (e.g. 1:2 at certain phases) can still give sparse covers (#21, Ink corner).
- verify ALL PASS; build PASS.

## Light typography: bulky faces (operator request, 2026-11-26)

- **Spectrum:** Schibsted Grotesk **Black 900** (tracking −0.03).
- **Horizon:** Funnel Display **ExtraBold 800** (tracking −0.025).
- Both are OFL, static subset WOFF2 (28.8 kB and 11.0 kB), with licences in `public/licenses/`. Neither is an "AI-default" face.
- Familjen Grotesk is retired to `production/retired-fonts/`. The anchored bottom-left layout is unchanged.
- verify ALL PASS; build PASS.
- Evidence: `production/launch-tweaks/light-names.png` (normal / long / short names × both engines) and `six-covers.png`.

## Kerning and Macro Relief detail (operator request, 2026-11-26)

- **Kerning:**
  - Canvas `fontKerning = 'normal'` is set for every cover face, so the faces' kern pairs apply.
  - Light tracking eased: Schibsted Black −0.03 → −0.012; Funnel ExtraBold −0.025 → −0.01. Letters no longer collide (`light-names.png`).
- **Macro Relief across Passes.** Before this change, higher Passes widened and blurred the ridge and added horizontal brushing streaks, so the relief looked "weak" beyond about 8 passes (`before-passes.png`). Now:
  - ridge width is capped at its 8-pass value;
  - Passes add 1 → 7 fine engraved grooves parallel to the ridge on both sides, with smoothed normals so they don't serrate;
  - depth grows with passes;
  - macro brushing is cut to ×0.25.
  
  Result: `after-passes.png`, plus a clean, machined 100 % crop at the 1468 px preview.
- **Cost:** settled Macro preview ≈ 450 ms (was ≈ 280 ms); 3000 px export ≈ 1.9 s (was ≈ 1.3 s). Drafts are unchanged while dragging.
- **Known:** at very small render sizes (contact sheets, about 520 px) the grooves are only about 3 px apart and alias into a ripple. At the 1468 px preview and on export they are clean; the 360 px phone canvas (about 720 px) is not yet checked.
- verify ALL PASS; build PASS.

## Design library (operator request, 2026-11-26)

- **Tokens:** `src/styles/tokens.css` rewritten as 50 grouped tokens. Every hard-coded colour and shadow in `app.css` (about 25) and in the SVG gradient stops was moved to a token. 6 dead tokens were removed (`accent-mode-a/b`, `shadow-lift`, `surface-panel`, `surface-field`, `space-6`).
- **Components:** the inline pieces of `App.tsx` were extracted into `src/ui/` (SectionHead, ChassisField, EngineSelector, RatioModule, RegistrationWheel/RegMark, PassesModule/PassesMeter, ActionBar). `App.tsx` dropped from about 300 to 152 lines. The DOM and ARIA are identical: `v02-panel.mjs` 28/28 PASS; verify ALL PASS.
- **Library page:** `/library.html` (dev only; not in `dist/`). It shows tokens, interface type, cover typefaces, the chassis with a live cover, and every component with its states.
- **Evidence:** `production/design-library/library-full.png` (split into `library-part1.png`, `library-part2.png`, `library-part3.png`).
- `DESIGN_SYSTEM_V02.md` §7 now maps where everything lives.

## Analog UI control test bench (PROPOSED inspiration, 2026-11-26): STOPPED BEFORE INTEGRATION

- **Analog UI** (TechSquidTV, MIT, commit `fa43e9420034`) is not on npm. It is vendored into an **isolated** bench, `studies/analog-bench/`, with its own deps (Tailwind v4, Base UI, Motion…).
- SLEEVE has no Tailwind and was **not** migrated. SLEEVE's `package.json`, renderer, cover and export are unchanged. The SkillUI `DESIGN.md` is untouched (`INTEGRITY.sha256` OK).
- **Bench:** small Form/Rhythm dials; an oversized black Registration dial with 0/90/180/270 detents; Passes with a meter; an Engine rocker; New Proof / Sound / Print Sleeve; a seed LCD. All run on the real SLEEVE state, with native sliders and radios underneath.
- Finish strength reduced by 35–50 %. One static light, no pointer or tilt lighting.
- **Checks:** 13/13 PASS (keyboard, SLEEVE relative drag, accessibility tree, 44 px at 1440 and 390, reduced motion).
- **Findings:**
  - Analog's dial is a spinbutton `div` with absolute-angle drag (bypassed).
  - Inset 36 px button targets (raised to 56 px).
  - Colour overrides fight the library.
  - Brushed-chrome geometry persists.
  - +111 kB gzip JS (2.3×).
- **Recommendation: do not adopt as a dependency.** Natively borrow a bigger Registration hero, printed-circuit annotations and a mono seed/status line.
- **Record:** `production/analog-bench/ANALOG_BENCH.md`, with screenshots (`bench-desktop-1440.png`, `bench-mobile-390.png`, `compare-*.png`).

## Analog bench, v2 (operator feedback, 2026-11-26)

- Added Artist and Track (IN1–IN2) under the cover.
- Right column reduced about 10 % proportionately (dials 84/210/72 → 76/190/64, numerals −10 %). It is now one stack, which fixes the empty band beside the cover.
- Removed the LCD module; the seed is a quiet mono line under the cover.
- Engine labels hug the rocker (HARMONIC · rocker · RADIAL).
- Removed the "Proposed inspiration…" header line (provenance stays in `ANALOG_BENCH.md`).
- Removed duplicate dial labels and cut the Registration note to one line.
- **Checks:** 14/14 PASS. Still a temporary study; not integrated.

## Analog bench, baseline grid (operator feedback, 2026-11-26)

- The page ruling is now a real 48 px baseline grid. Every rule (header, cover top, sleeve label, Ratio, Registration, Passes/Engine, action row) is snapped onto a page line by measuring the layout, re-run on resize and font load. Measured offsets are 0 at 1440, 1280 and 390 px.
- The sticky mobile action bar floats over the page, so it is deliberately not snapped.
- "Off register · 2.7 mm" no longer orphans "MM".
- Checks: 14/14 PASS.

## Light typography: Ink-level boldness (operator request, 2026-11-26)

- The name moved into the artwork layer as a **giant uppercase block** (up to 0.26 S, two balanced lines up to 0.19 S), printed *before* the light so the spectral band passes over it additively. This is the Light analogue of Ink's overprint.
  - **Spectrum:** Schibsted Grotesk Black, cropped by the bottom trim like Newsprint. The track is in tracked mono, top-left.
  - **Horizon:** Funnel Display ExtraBold, standing on the horizon line with a mirrored, fading reflection. The track sits at the foot.
- The old corner layout and floor fade are removed.
- verify ALL PASS; build PASS; panel suite re-run.
- Evidence: `production/launch-tweaks/light-names.png`.

## v0.2 instrument: the Analog bench integrated as the main app (operator decision, 2026-11-26)

- The 5190 bench design is now `src/app/App.tsx`. Analog UI (MIT) is vendored at `src/vendor/analog-ui` with a NOTICE; `@ts-nocheck` was added to 4 vendored files for SLEEVE's strict tsconfig, with logic unmodified.
- Dependencies are now in SLEEVE: Tailwind v4 (`@tailwindcss/vite`), `@base-ui/react`, `motion`, `lucide-react`, `clsx`, `tailwind-merge`. The interface stylesheet is `src/styles/sleeve.css`.
- **Press Set** (P1) added under the controls. The full Print / Sound / status logic from the previous app is kept.
- **Harness fix:** Vite now ignores `production/`, `studies/`, `research/`, `screens/` and `release/`, and the test browser profile lives outside the project. Chrome writing profile files inside the project had triggered page reloads mid-test.
- **Tests:**
  - `instrument-check.mjs` 16/16 PASS (tab order, keyboard on 4 sliders, relative drag, artist, engine, press-set cycle, New Proof, a real 3000² Print, accessibility tree, 44 px at 1440 and 390, reduced motion);
  - verify ALL PASS; build PASS.
- **Bundle:** JS 647 kB (198 kB gzip), CSS 102 kB, as measured in the bench study.
- **Repository:** `.gitignore` excludes the SkillUI extraction (proprietary fonts), reference images, evidence images, exports, builds and `node_modules`.
