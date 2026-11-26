# Architecture — one instrument, one recipe

**Status:** PROPOSED — DIRECTION · validate after extraction and build

## System boundary

SLEEVE is a static React + TypeScript + Vite application. All state, math, drawing, audio, and export occur in the browser. Deployment may serve static assets; there is no runtime server requirement.

```text
Inputs + rotary controls
          ↓
Validated serializable recipe ← deterministic Remix(seed)
          ↓
   ┌──────┴────────┐
   ↓               ↓
Preview renderer   Optional audio mapper
   ↓
High-resolution renderer → 3000 × 3000 PNG
```

## Suggested modules

```text
src/
  app/
    App.tsx
  instrument/
    recipe.ts
    bounds.ts
    remix.ts
    RotaryControl.tsx
    InstrumentPanel.tsx
  artwork/
    ArtworkStage.tsx
    renderArtwork.ts
    harmonic.ts
    radial.ts
    typography.ts
    palettes.ts
  audio/
    audioEngine.ts
    mapRecipeToSound.ts
  export/
    exportPng.ts
  styles/
    tokens.css
    app.css
```

This is a target shape, not a requirement to produce abstractions before they are needed.

## Canonical recipe

Use one plain, versioned, serializable object as the source of truth.

```ts
type Mode = 'harmonic' | 'radial';

type ArtworkRecipeV1 = {
  version: 1;
  seed: number;
  mode: Mode;
  artist: string;
  track: string;
  form: number;      // integer 1..8
  rhythm: number;    // integer 1..8
  phase: number;     // degrees 0..360
  density: number;   // integer 1..24
  palette: number;   // bounded palette index
};
```

All renderers receive a validated recipe. Randomness exists only in seeded recipe generation, never inside geometry or export.

## Rendering

### Shared normalized coordinate system

Write geometry in normalized square coordinates and scale at draw time. The same render function must serve preview and export.

- Preview: render at CSS size × device pixel ratio, capped if necessary for performance.
- Export: create an offscreen 3000 × 3000 canvas and rerun the complete render.
- Never export a screenshot or upscale the visible canvas.
- Use consistent line-width and typographic scale rules derived from output dimensions.

### Mode A — Harmonic

Use Lissajous families: `x(t) = sin(a·t + δ)`, `y(t) = sin(b·t)`. Map Form and Rhythm to bounded integer ratios, Phase to `δ`, and Density to repeated lines/offsets or sample resolution. Avoid unbounded point counts.

### Mode B — Radial

Use a hypotrochoid or rose family with bounded ratios. A useful rose foundation is `r(θ) = cos(k·θ + δ)` projected to Cartesian space. Map the same controls consistently, but allow the visual result to be distinctly radial.

Exact mappings and guardrails live in `research/GENERATIVE_MATHEMATICS.md`.

## Typography in export

- Sanitize text length; define truncation or adaptive size rules rather than letting it collide.
- Await `document.fonts.ready` before export.
- Use a bundled/licensed font or explicit system fallback; do not depend on a remote font at export time.
- Calculate text placement from the 3000-square layout, not DOM coordinates.
- Test short, long, uppercase, lowercase, numbers, and empty fields.

## Accessible rotary primitive

Use a native range input as the semantic input, visually paired with a dial. The native input may be visually integrated but must remain focusable and operable.

Required behavior:

- persistent label, current value, min/max, and optional units;
- Arrow keys change by one step; Page Up/Down may change coarsely; Home/End reach bounds;
- pointer drag supports a forgiving vertical or circular gesture without trapping scrolling on touch;
- double-click/reset is optional and must not be the only reset route;
- visible focus and disabled states;
- 44 × 44 px minimum target;
- `onInput` or equivalent gives continuous feedback without overwhelming rendering;
- any custom fine-adjust modifier is documented visually and does not replace standard keys.

Do not apply `role="slider"` to a `div` if native range semantics can do the job.

## Audio architecture

Audio is enhancement, never a requirement.

- Initial state: off/muted; create or resume `AudioContext` only from an explicit user action.
- Synthesis: original oscillators/noise/envelopes created with Web Audio; no samples.
- Map bounded recipe values to safe, musical ranges; smooth parameter changes to prevent clicks.
- Provide persistent Enable/Mute and modest volume control.
- Stop/disconnect nodes and close or suspend context appropriately.
- Do not encode audio in the exported PNG or pretend the image contains sound.

Suggested relationship: Form/Rhythm choose a frequency ratio, Phase affects stereo or modulation phase subtly, and Density affects timbral brightness. Keep levels conservative.

## Remix

Remix changes the seed and derives every variable within bounds. It should return a composed result, not indiscriminate noise.

- Keep artist and track unchanged.
- Choose mode intentionally; avoid switching on every remix if that feels disorienting.
- Draw palette and parameters from curated ranges.
- The same seed and recipe version must reproduce the same composition.
- Consider exposing the seed in export metadata or filename only if time remains; not required for v1.

## Error and status handling

- Render failures keep the last good frame and show a plain recovery action.
- Export announces preparing/success/failure in a polite live region.
- Audio failure leaves the visual instrument fully functional.
- Invalid recipe values are clamped at the boundary and logged during development.

## Performance budget

- Target responsive continuous manipulation on a current mid-range laptop and phone.
- Bound samples and layers; quality can scale by preview size while export uses final quality.
- Avoid React state per generated point.
- Use `requestAnimationFrame` to coalesce preview draws.
- Respect reduced motion and page visibility; pause ambient work when hidden.

## Verification seams

Pure functions should allow focused tests for bounds, seeded Remix, geometry finiteness, and recipe-to-filename behavior. Browser checks cover rotary keyboard behavior, mode selection, audio opt-in, reduced motion, and export dimensions.

