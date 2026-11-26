# Renderer polish pass (final, time-boxed): record

Date: 2026-11-26.

## Implemented, as the brief specified

1. **Metadata removed from every cover.** Ink keeps only the track (Space Mono, top right). Light keeps only the track (Martian Mono, foot). Matter keeps only the track and name. `catalog()` is no longer drawn anywhere.
2. **Seed-driven composition** (`compose()` in `composition.ts`). It is deterministic, varied, and identical at preview and export size; verify checks all of this. Per seed:
   - bounded rotation (±0.38 rad);
   - asymmetric scale (0.8–1.2);
   - extra crop zoom;
   - an offset per family;
   - a curve-emphasis stretch of the key contour, drawn heavier in each family: a hard impression in Ink, a hotter band in Light, a swelling ridge in Matter.
3. **Matter:**
   - relief depth ×1.65;
   - Full Sheet relief 1.45× broader;
   - macro crop 2.3× (was 1.75×);
   - a warm key light and a cool fill light;
   - a stronger specular highlight with a broad sheen;
   - directional falloff from the upper left;
   - fine seeded material grain;
   - albedo slightly lighter.
4. **Light typography:**
   - Spectrum uses **Anybody Expanded Light** (width 150, weight 300, uppercase, tracked).
   - Horizon uses **Instrument Serif Italic**.
   - The two-line balanced wrap is unchanged.
   - Both fonts are static, subset WOFF2 files with their OFL licences in `public/licenses/`. Bodoni has been removed from the bundle.
5. **Horizon atmosphere:**
   - a deep navy sky;
   - a cobalt volume above the horizon;
   - one concentrated amber source at a seeded x position;
   - a horizon line that fades away from the source;
   - a vertical reflection column with soft falloff;
   - crisp seeded dither.

## Concurrent-edit incident

While this pass was running, another agent edited the project: **Codex** (the ChatGPT app and the VS Code extension). Between about 02:11 and 02:33 it changed:
- the Light fonts, to Syne Bold and EB Garamond Medium Italic, and re-added Bodoni;
- the composition system, adding `compositionForSet`, `focusPoint` and `FRAMING_TREATMENTS`;
- `light.ts`, `renderArtwork.ts` and `verify.ts`;
- the **panel** (`App.tsx` and `app.css`), adding development-only `?theme=braun|buchla|nagra` studies.

The operator chose to restore this brief's version. Everything Codex changed is backed up unmodified in `production/renderer-polish/outside-edits/`.

During the final test run, Codex's browser scripts also drove the same headless Chrome debugging port (the page was found at `127.0.0.1:5173/?theme=nagra`). The panel suite therefore stalled and was stopped. **The panel regression suite and the desktop screenshot are NOT re-run for this pass.** Re-run them once only one agent is working in the folder.

## Tests

| Check | Result |
|---|---|
| `node scripts/verify.ts` | ALL PASS, including 3 new composition checks over 2000 seeds |
| `npm run build` | PASS. JS is 265.2 kB (84.9 kB gzip). Fonts: Anybody 13.9 kB, Instrument Serif 24.4 kB. |
| `scripts/browser/v02-panel.mjs` | **NOT COMPLETED** (blocked by the concurrent agent) |

The renderer snapshots change intentionally in this pass, so the 144-snapshot identity no longer applies.

## Evidence

- `six-covers.png`: one cover per set, seeds from a single Remix chain.
- `shared-recipe.png`: the default recipe across 6 sets × 2 engines.

## Imperfections recorded for final critique (not iterated)

1. **Matter still reads more as a grey surface than as a photographed embossed object.** The warm/cool shift is subtle and Full Sheet's grooves are still thin at preview size. This is the biggest remaining gap.
2. **Spectrum's Anybody Light name is thin and small** (its size is capped by expanded-width fitting), so it competes with the band at small sizes.
3. **Some seeds still give a near-complete, centred Light figure.** For example, Spectrum 3:4 on the contact sheet, where zoom and offset happened to be small.
4. **Horizon:**
   - The amber source is placed at a random x, so the name can cover it (Halden on the contact sheet).
   - The cobalt volume stops at a hard horizontal edge on the horizon. That is a natural edge, but it is crisp.
5. **The Ink emphasis stroke is solid black** and can read as a marker line on Newsprint.
6. **Matter grain is resolution-relative** (about 1/1500 of the side), so preview and export grain differ slightly in texture.
7. **Horizon PNG size** has not been re-measured with the dither; it was about 8.7 MB before.
