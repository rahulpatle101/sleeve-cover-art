# Generative mathematics

**Status:** PROPOSED — DIRECTION · formulas and bounds TESTED — PASS (scratch proof, 2026-11-25 17:20 IST) · Radial formula **LOCKED: rose**. See "Research decision" at the end.

The visual engine offers exactly two bounded, deterministic families. They share the same control vocabulary so the instrument is learnable, while producing recognizably different compositions.

## Mode A — Harmonic / Lissajous

Base curve for `t ∈ [0, 2π]`:

```text
x(t) = sin(a·t + δ)
y(t) = sin(b·t)
```

Proposed mapping:

- **Form 1–8:** frequency ratio numerator `a`.
- **Rhythm 1–8:** frequency ratio denominator `b`.
- **Phase 0–360°:** phase offset `δ`.
- **Density 1–24:** number of layered traces or controlled offsets; cap samples separately.

Layer multiple nearby traces with deterministic offset/opacity. Preserve negative space; density must not simply mean “draw everything darker.”

## Mode B — Radial / hypotrochoid-rose

Simple rose foundation:

```text
r(θ) = cos(k·θ + δ)
x(θ) = r(θ)·cos(θ)
y(θ) = r(θ)·sin(θ)
```

A bounded hypotrochoid variation may replace the rose only if it produces more expressive results within the build time:

```text
x(t) = (R-r)cos(t) + d·cos(((R-r)/r)t)
y(t) = (R-r)sin(t) - d·sin(((R-r)/r)t)
```

Proposed mapping:

- **Form:** lobe or outer-radius family.
- **Rhythm:** inner ratio/rotational repetition.
- **Phase:** rotation or phase offset.
- **Density:** repeated rings/traces, bounded 1–24.

Choose one radial formula at minute 25 and keep it. Do not ship both as hidden submodes.

## Shared guardrails

- Clamp every public parameter to documented bounds.
- Use a fixed maximum sample count proportional to export quality, not a value that can grow without bound.
- Reject or repair NaN, Infinity, divide-by-zero, zero radius, and degenerate all-point-equal output.
- Keep strokes inside a safe art region so typography and edges remain deliberate.
- Derive all offsets, palette choices, and variation from the recipe seed.
- Same recipe version + seed + dimensions must reproduce the same drawing.
- Preview and export use the same formula and layout transforms.

## Visual test matrix

For each mode, inspect:

| Case | Form | Rhythm | Phase | Density | Expectation |
|---|---:|---:|---:|---:|---|
| Minimum | 1 | 1 | 0 | 1 | valid, intentional sparse output |
| Maximum | 8 | 8 | 360 | 24 | bounded, no freeze or solid blob |
| Asymmetric | 3 | 7 | 45 | 9 | visibly complex but legible |
| Symmetric | 4 | 4 | 180 | 12 | stable, centered composition |
| Repeat | any | any | any | any | identical pixels for same recipe |

## Meaningful control language

Expose evocative names—Form, Rhythm, Phase, Density—while always showing a numeric value. Do not imply scientific accuracy or that the visual literally analyzes a user’s music. It is sound-inspired deterministic geometry.


## Research decision — 2026-11-25, locked 17:21 IST (research minute 6, deadline minute 25)

**TESTED — PASS.** This was a disposable Node 24.2 scratch proof, not production code. The script is kept outside the repo (`scratchpad/math/validate.mjs`, SHA-256 `ef858ea8…7d3df6`). It covers the full matrix above plus edge cases (8/1/360/1 and 1/8/0/24), and sweeps every integer Form × Rhythm × Phase in 15° steps (1,600 combinations).

| Check | Harmonic (Lissajous) | Radial — rose | Radial — hypotrochoid |
|---|---|---|---|
| Finite at all bounds | pass | pass | pass |
| Non-degenerate across sweep | 1600/1600 | 1600/1600 | **1400/1600: collapses to a point whenever Form = Rhythm (R − r = 0)** |
| Stays in unit square without per-case rescue | pass | pass | **fail (extent up to ≈ 27)** |
| Max points per render, Density 24 | 24 × 4,097 = 98,328 | same | — |

**Locked Radial formula: rose.** `k = P/Q` where `P = Form/g`, `Q = Rhythm/g`, `g = gcd(Form, Rhythm)`. `r(θ) = s·cos(k·θ + δ)`, `θ ∈ [0, span]`, with `span = π·Q` if `P·Q` is odd, else `2π·Q` (one closed curve). The hypotrochoid is rejected: it degenerates on the diagonal of the control grid and needs ad-hoc normalisation. It won't be shipped as a hidden submode.

**Locked mappings (both modes).** Form 1–8 int; Rhythm 1–8 int; Phase 0–360 int degrees → δ; Density 1–24 int → number of layered traces, each with a deterministic scale step (and a rotation step in Radial). No randomness inside geometry.

**Guardrails found by the proof:**

1. **Fit to the safe art region by bounding box.** A rose with k = 1 (any Form = Rhythm) is a circle through the origin, so it sits off-centre (extent 1.0–1.24). The renderer centres every composition by its computed bounding box into the safe region. This is a pure, deterministic transform shared by preview and export.
2. **Sample cap.** Fixed maximum of 4,096 segments per trace at export. Preview may use fewer per trace by output size, through the same function with a resolution argument. Peak export load is ≈ 98k points per render, which is acceptable for one offscreen 3000² canvas.
3. **Clamp at one boundary.** NaN, Infinity, below-minimum → min; above-maximum → max (tested: `[NaN, ∞, −5, 99] → [1, 1, 1, 8]`).
4. **Remix.** Seeded `mulberry32`, curated sub-ranges (Form 2–7, Rhythm 2–8, Phase in 15° steps, Density 4–18). 10,000 seeds → 0 out-of-bounds values; same seed → byte-identical geometry; artist/track preserved.

**Renderer and export path (Gate R technical proof):** Canvas 2D for both. Preview canvas = CSS size × devicePixelRatio (capped). Export = new offscreen `3000 × 3000` canvas, same `render(recipe, w, h)` call → `toBlob('image/png')`. No upscaling of the visible canvas.
