# Product — SLEEVE

**Status:** PROPOSED — DIRECTION

## Product sentence

SLEEVE is a browser-based generative album-art instrument for musicians and designers who want to make a distinctive cover by tuning a small set of expressive controls.

## Core promise

**Play your next album cover.** The person is composing, not choosing a template and not prompting an AI.

## Primary user

An independent electronic musician or visually curious designer who needs compelling square artwork and enjoys hands-on experimentation. The creator of this project is the first real user.

## Experience loop

1. **Arrive:** a finished but editable cover is already alive on the stage.
2. **Identify:** enter artist and track names.
3. **Choose:** switch between Harmonic and Radial engines.
4. **Tune:** adjust Form, Rhythm, Phase, Density, and color-related parameters.
5. **Discover:** use Remix for a deterministic, coherent variation.
6. **Listen, optionally:** explicitly enable an original synthesized response.
7. **Keep:** export the exact composition as a 3000 × 3000 PNG.

## Required v1

- One responsive screen with the cover stage and instrument panel.
- Two and only two visual engines:
  - **Harmonic:** Lissajous-based line composition.
  - **Radial:** hypotrochoid/rose-based rotational composition.
- Shared typed recipe with a seed and bounded parameters.
- Artist and track text reflected in the composition.
- Accessible rotary controls with visible numeric values.
- Deterministic Remix: same recipe and seed produce the same art.
- Optional, muted-by-default, original Web Audio synthesis.
- Reduced-motion behavior.
- 3000 × 3000 PNG export that matches the preview composition.
- Responsive keyboard-usable experience from 360 px to desktop.

## Explicit non-goals

- More than two engines or a plug-in architecture.
- Accounts, cloud saving, database, collaboration, comments, or sharing feeds.
- AI prompting, image generation, uploads, sampling, or copyrighted audio.
- Timeline editing, layers, freeform canvas tools, or Canva-like templates.
- Multiple export formats, print color management, video, animation export, or social crops.
- Marketplace, onboarding tour, analytics dashboard, or localization.
- Perfect emulation of physical hardware or any reference brand.

## Scope-cut order

If time slips, cut in this order:

1. multiple presets beyond one Remix action;
2. audio richness (keep a simple optional tone or remove audio before harming core use);
3. secondary color controls;
4. decorative motion;
5. nonessential labels or informational panels.

Never cut keyboard control, reduced motion, text legibility, deterministic rendering, export fidelity, or the second mathematical mode.

## Acceptance criteria

- [ ] The preview is meaningful on first load; no blank state.
- [ ] Both engines visibly differ and respond continuously to the same core controls.
- [ ] Every rotary works with pointer and keyboard and exposes name, range, and current value.
- [ ] Audio begins only after explicit action, can be muted immediately, and uses no external samples.
- [ ] With reduced motion, no essential information is lost and continuous nonessential animation stops.
- [ ] Artist/track typography remains legible against every allowed palette.
- [ ] Remix produces a coherent result and never leaves parameters outside bounds.
- [ ] Export is exactly 3000 × 3000, sharp, and visually equivalent to the preview.
- [ ] The app has no network dependency after its static assets load.
- [ ] A new user can export a cover within three minutes without instructions from the maker.

