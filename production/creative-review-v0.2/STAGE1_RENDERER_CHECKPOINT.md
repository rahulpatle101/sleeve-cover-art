# v0.2 Stage 1 — optical-press renderer checkpoint

**Status:** IMPLEMENTED, awaiting creative review · 2026-11-25 · panel and design system **not** touched (still the v0.1 instrument UI)

**Scope source:** the eight Stage 1 requirements in the operator's message plus §13.1 of `CREATIVE_GAP_REPORT.md`. The separately referenced "renderer-checkpoint instructions" did not reach this session.

## What changed (IMPLEMENTED)

| Requirement | Implementation |
|---|---|
| Two distinct plates | Plate A (key): even passes, heavier stroke, registered. Plate B: the key contour plus odd passes, finer, carries the misregistration. Per-set blend (multiply / screen / source-over). |
| Phase → registration | Phase still sets δ **and** offsets plate B by `REG_MAX·S·|sin 2φ|` along φ, with a ±0.0035 rad turn. In register at 0°, 90°, 180°, 270°; maximum 0.9 %·S (27 px at 3000) at 45° multiples. |
| Density → passes | Layers are passes split across the two plates. Ink thins and fades with passes × ratio complexity (load-based, carried over). |
| Paper texture | A deterministic 192 px tile seeded from the recipe seed, tiled 6 × 6 (scales with S). Quantised to three levels and drawn crisp, so it compresses (see file sizes). |
| Seed-derived colophon | `PLATE {SEED} · {ENGINE} {F:R} · Φ {PPP}° · {N} PASSES`, from the recipe only. No counter, no SLEEVE watermark. |
| Six press sets | Newsprint, Chalk (**bleed**) · Cobalt Gate, Ember (**optical gate**) · Night Run, Moss (**signal field**). The recipe `palette` integer is unchanged. |
| Three compositions | **Bleed:** figure runs off a seed-chosen top corner; vertical colophon on the free edge; title opposite. **Gate:** circular aperture crops the figure; corner registration marks; colophon across the head. **Field:** additive light on dark stock with scan banding; track and artist at the head. |
| Preview ≡ export | One `renderArtwork` (art layer + type layer), all in fractions of S, clipped to the trim. Settled preview is byte-identical to `renderArtwork` on the same canvas; export vs preview mean \|Δ\| 1.1–1.3/255. |

Files: `src/artwork/renderArtwork.ts`, `src/artwork/palettes.ts`, new `src/artwork/composition.ts` (pure), `scripts/verify.ts`. No UI, recipe, Remix, geometry, audio or export-pipeline changes.

## Evidence (`screens/v02-stage1/`)

- `contact-remix.png`: default plus 24 Remix outcomes. **23/25 worth keeping** (weak: H12 Chalk 4:2 too sparse; R10 Chalk 4:7 crowded).
- `contact-holdout.png`: unseen seed `0xC0FFEE`, 24 outcomes. **21/24** (weak: Hh3 6:2 mostly off-trim, Hh12/Rh1 dense Chalk, Rh10 dense Newsprint 7:8).
- `contact-stress.png`, `contact-long-titles.png`: extremes, empty, caps/numbers, and long artist and track in all six press sets. No truncation, no collisions.
- `registration-comparison.png`: Phase 0/22/45/67/90/180° with 1:1 crops from 3000 px renders. In register 0 px; 18.8 / 27.0 / 19.4 px off register.
- `app-360-top.png`, `app-desktop.png`: in-app preview, phone and desktop (v0.1 panel unchanged).
- `exports/`: six real exports from the production build UI, one per press set, all **3000 × 3000**, **1.1–3.9 MB**. `exports-strip.png` shows all six. `crops/`: 100 % inspections.

## Defects found and fixed during Stage 1

1. Bleed art painted outside the cover square (no trim clip). Fixed: art layer clipped to the trim.
2. Long titles were truncated by the narrower v0.2 slots. Fixed: vertical bleed colophon, mixed-case track fallback, downward artist wrap in field, stacked gate fallback.
3. A wrapped bleed artist collided with the art, and the registration mark collided with a left-aligned title. Fixed: wrap max 0.056·S (cap top 0.761 vs art ≤ 0.739); mark moved to the free top corner.
4. **Export size:** smooth per-pixel grain made PNGs up to **33.6 MB** (Ember). Fixed: quantised crisp grain; worst case now 2.7 MB, all ≤ 3.9 MB.

## Verification

Type check clean · `npm run verify` **39/39** (new: art never enters a type zone across 9,600 combinations × all impositions, in register at 0/90/180/270, misregistration bounded, gate clear of type, wrapped-bleed clearance, colophon deterministic with no brand mark, contrast for artist, track and colophon on every paper ≥ 4.5) · 60 fps at maximum Density (both engines, on battery) · settled preview = renderer (IDENTICAL ×3) · Remix deterministic with identical pixels · keyboard-only export with focus kept · reduced motion still a cut · prod bundle JS 245.3 kB (78.1 kB gzip).

## Open questions for creative review

- **Colophon size on phones:** 0.02–0.021·S renders at ≈ 6.7–7 CSS px on a 336 px cover. Readable at desktop and in exports; tiny on phones. Its content is duplicated in the panel and the accessible name. Raise it, or accept as a print slug?
- **Registration strength:** 0.9 %·S is subtle at thumbnail size and clear at 100 %. One constant (`REG_MAX`) if you want it bolder.
- **Paper texture:** after quantisation it is a quiet tooth; very subtle at full size. Per-set `grain` values control it.
- **Track case:** set in tracked capitals when it fits, mixed case when long. Confirm this editorial rule.
- **Cobalt Gate overprint:** yellow under cobalt still reads slightly olive where dense.
- The stress script's mid-fade "meta label" check is obsolete for v0.2 (the region now holds art), so it isn't counted as evidence.
