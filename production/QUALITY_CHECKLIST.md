# Quality checklist

**Status:** COMPLETE · 2026-11-25 21:03–21:12 IST · final production build (`dist/assets/index-DMBWh0uM.js`) · verified after all critique fixes

Marked with evidence, not optimism. Scripts are in `scripts/` (pure) and `scripts/browser/` (headless Chrome over CDP). Results are recorded in `production/BUILD_LOG.md` and `production/CRITIQUE.md`.

## Product and scope

- [x] One screen, two engines, one export outcome. Harmonic (Lissajous) and Radial (rose) only; 3000 × 3000 PNG only.
- [x] No backend, account, AI generation, upload, third engine, or hidden scope expansion. The bundle is static; network APIs are limited to Vite's same-origin modulepreload polyfill.
- [x] Artist and track meaningfully appear in the sleeve. Shrink-to-fit plus a two-line artist wrap; filename includes both (`release/exports/*`).
- [x] Remix stays deterministic and bounded. 10,000 chained Remixes: 0 out of bounds, never 1:1, density cap respected, Harmonic only figure-like ratios, palette never repeats, identical sequence and pixels across reloads (`drive.mjs`).

## Extraction integrity

- [x] `research/extracted/DESIGN.md` exists and was not manually authored. Byte-identical to the SkillUI run output.
- [x] Provenance includes URL, time, viewport and SkillUI version/workflow (`research/extracted/PROVENANCE.md`), plus the Microlink disclosure.
- [x] Integrity hash matches. `shasum -c INTEGRITY.sha256` 25/25 OK; `DESIGN.md` SHA-256 `ec140e44a42edf512419cd4b3e13e78a910433ece2b11235aa23800ac86e966b`.
- [x] Transfer ledger cites evidence and labels proposed adaptations (`research/DESIGN_DNA_TRANSFER.md`).
- [x] No brand asset, copy, or one-to-one layout was copied. 0 font or image files in `src/`, `public/`, `dist/`; no proprietary identifiers, SkillUI instructions or screenshots in the bundle (grep scan).

## Visual and responsive

- [x] 360 px viewport has no horizontal overflow or clipped essential action. `scrollWidth` = 360; widths 360/768/1024/1280 show no overflow (`widths.mjs`).
- [x] Desktop hierarchy prioritizes the artwork (`release/screens/desktop-1280-first-load.png`).
- [x] Long/short/empty artist and track states remain legible (`audit-stress-after.png`: long wraps, empty, artist-only, caps/numbers).
- [x] Every palette preserves text and focus contrast. Cover text 5.61–16.02:1; UI secondary text 5.74/6.34:1; control lines ≥ 3:1; focus ring is ink with a light offset.
- [x] Minimum and maximum Density remain intentional. The sparse extremes are deliberate; maxima become woven texture via load-based thinning (`audit-maxima-900.png`).

## Interaction and accessibility

- [x] Full loop works keyboard-only (`kb-loop.mjs`: Tab, arrows, Space/Enter and typing only → file downloaded, normal and reduced motion). **Two S1 defects found here were fixed:** export stall and focus loss.
- [x] Every rotary exposes label, min, max and current value. AX tree shows natural-case names and value text; VoiceOver (operator) "All announced well".
- [x] Arrow and Home/End behavior works; focus is visible. ±1, Shift/PgUp ±coarse, Home/End, clamp; the focus ring stays on Export during and after export.
- [x] Targets are at least 44 × 44 CSS px (`drive.mjs`: "SMALL TARGETS none").
- [x] Selection, mute and focus do not rely on color alone. Engine has shape marks, ✓, inset ring and `checked`; sound uses the "Enable/Mute sound" text plus a filled dot; focus is an outline.
- [x] Export progress and result are announced. Polite live region: "Rendering 3000 × 3000 artwork…" then "Artwork exported — 3000 × 3000 PNG." plus the filename; the failure path is announced with recovery copy.
- [x] Reduced-motion mode removes continuous/spatial motion without losing meaning. 0 blend frames on engine switch and Remix; transitions are 0.01 ms; `release/motion/reduced-motion.webm` shows single-frame cuts.
- [x] Essential instructions are not hover-only. A visible one-line hint plus visible values.

## Audio

- [x] No autoplay; explicit user action is required. 0 AudioContexts before the gesture (instrumented).
- [x] Mute is immediate while audio is active, and audio resets to off on reload. ~30 ms fade, then the context closes; no preference persisted.
- [x] Audio is original procedural synthesis with no external samples (Web Audio oscillators, filter, panner, envelope only).
- [x] Parameter changes do not click or jump in loudness. Max step 0.0046 against a 0.056 hard-cut reference; loudness spread 2.1 dB across 50 recipes; Remix steps ≤ +0.7 dB; operator listened: "All comfortable".
- [x] Audio failure and silent use are fully supported. Failure copy is non-blocking; the visual loop needs no audio.

## Rendering and export

- [x] Both formulas remain finite at all documented bounds (9,600 combinations finite, non-degenerate, inside the safe region).
- [x] Preview and export use the same recipe/render logic. Settled preview is byte-identical to `renderArtwork` (same canvas); export vs preview mean |Δ| 0.84/255, worst 12×12 block 1.5/255.
- [x] PNG pixel dimensions are exactly 3000 × 3000 (`sips`, both final exports).
- [x] Export was opened and inspected at 100% for sharpness, clipping, font and color (`release/crops/*`).
- [x] Export matches the selected mode, parameters, artist and track (meta line, filename and recipe checked).
- [x] Filename is safe, useful and bounded. ASCII `[a-z0-9-]`, ≤ 96 chars, cut at word boundaries, fallback `sleeve-003-…`.
- [x] Export still works after repeated parameter changes and repeated captures. 6 consecutive exports after Remix took 52–96 ms from click to announcement.

## Engineering

- [x] Type check passes (`tsc -b`).
- [x] Production build passes (`vite build`).
- [x] No blocking console error during the core loop (0 errors across all runs).
- [x] No network runtime dependency beyond static asset delivery. Full loop made 4 requests, all same-origin; no fetch/XHR/WebSocket/beacon code beyond the modulepreload polyfill.
- [x] Animation and audio resources are cleaned up: rAF cancelled on change and unmount; AudioContext closed on mute and unmount; oscillators stopped; tab-hidden suspend.
- [x] Maximum Density remains responsive on the test device. 60 fps at Density 23↔24 with a Phase sweep on an M1 Max on mains power; 30 fps cap observed only on battery at 12%.

## Evidence

- Build command/result: `npm run build` → `dist/index.html` 0.59 kB · `index-DMBWh0uM.js` 240.2 kB (75.5 kB gzip) · `index-BhV40skO.css` 7.1 kB (2.2 kB gzip) · total 248 kB.
- Browser/device/viewports: headless Chrome (automated) at 360/768/1024/1280; Safari macOS (operator, manual); physical phone via LAN (operator); VoiceOver + Safari (operator). Firefox 160: headless smoke attempt produced no screenshot (untested).
- Keyboard check: `kb-loop.mjs` PASS (normal and reduced motion) after S1-1/S1-2 fixes.
- Reduced-motion check: `motion.mjs` 0 blend frames; recording comparison.
- Export file/dimensions: `release/exports/sleeve-night-office-phase-garden-harmonic-01352905.png` and `…/sleeve-mira-okafor-tidewater-radial-01352905.png`, both 3000 × 3000.
- Remaining issues: S2-1 (phone, Remix effect off-screen) and S3-2..S3-5. See `CRITIQUE.md`.
