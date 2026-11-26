# Motion craft

**Status:** PROPOSED — DIRECTION

## Intent

Motion makes mathematical cause and effect legible. It should feel responsive and continuous, never like a decorative loading animation.

## Choreography

### First load

Reveal the already-composed cover quickly: surface, geometry, then editorial text and controls. The instrument must be usable without waiting for a theatrical sequence.

### Parameter tuning

- Update geometry immediately.
- Interpolate render parameters just enough to preserve visual continuity; avoid lag behind the hand.
- Numeric value feedback should be instant, not eased.
- Keep continuous ambient movement minimal or absent; the art responds primarily to the person.

### Mode change

Use a short crossfade or point interpolation between engines, roughly 220–400 ms, only if it stays performant. The change should communicate “same recipe, different engine.”

### Remix

Transition to the new recipe as one coherent event. A brief detent or settling gesture can imply a physical instrument; do not cycle through fake intermediate values.

### Export

Give a restrained acknowledgement—press, progress, and resolved confirmation. The true reward is the downloaded sleeve.

## Timing character

- Direct manipulation: immediate values; visual smoothing under ~120 ms where needed.
- Selection/press: ~90–160 ms.
- Mode/Remix composition transition: ~220–400 ms.
- Confirmation: ~400–700 ms, nonblocking.
- Prefer ease-out for responses and symmetric ease-in-out for morphs.

Treat these as proposed ranges to tune by feel, not universal tokens.

## Reduced motion

Under `prefers-reduced-motion: reduce`:

- stop ambient or looping motion;
- make parameter changes direct;
- replace morphs with a near-instant crossfade or cut;
- avoid rotation, flashing, zooming, or simulated camera effects;
- preserve status and causality through value changes and text.

## Performance

- Coalesce visual updates with `requestAnimationFrame`.
- Cancel previous transitions when the user changes direction.
- Pause nonessential work when the page is hidden.
- Do not animate thousands of DOM nodes; draw geometry in Canvas/SVG efficiently.

## Pass checklist (20 minutes)

- [ ] Tuning never feels delayed or rubbery.
- [ ] Rapid direction changes do not queue animations.
- [ ] Mode and Remix feel distinct but related.
- [ ] Export feedback is restrained and accessible.
- [ ] Reduced-motion mode removes continuous and spatial movement.
- [ ] No flashing or large abrupt luminance shift.
- [ ] Frame rate remains usable at maximum Density.

