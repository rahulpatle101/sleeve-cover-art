# Interaction craft

**Status:** PROPOSED — DIRECTION

## Intent

The instrument should feel immediately causal, precise under deliberate adjustment, and forgiving during playful exploration.

## Interaction hierarchy

1. Tune the artwork.
2. Switch engine.
3. Remix coherently.
4. Edit artist/track identity.
5. Enable or mute optional sound.
6. Export the result.

Do not let secondary settings compete with tuning and export.

## Rotary behavior

- Pointer: drag vertically for a reliable gesture; upward increases, downward decreases. Circular drag may be added only if equally usable.
- Keyboard: Arrow keys change one step; Home/End jump to bounds; Page Up/Down may make larger changes.
- Fine adjustment: Shift + Arrow may use a smaller step only when the parameter supports decimals; integer controls remain integer.
- Touch: do not block page scroll until a clear control gesture begins; provide adequate targets.
- The value updates continuously and the art responds within the next animation frame.
- A reset action may be present in a context menu/button, but never depend on double-click alone.
- Prevent surprising jumps when a pointer lands at an arbitrary angle.

Use native range semantics beneath the visual dial. Preserve standard focus and keyboard behavior.

## Mode switching

- Use labeled options “Harmonic” and “Radial”; color or icons may reinforce but not replace words.
- Shared parameters persist when switching so the person can compare interpretations.
- The selected state must be visually and programmatically unambiguous.
- Mode change may interpolate visually, but input becomes available immediately.

## Remix

- Remix should feel like rolling a musically constrained variation, not erasing the person’s identity.
- Keep artist and track text.
- Change only bounded visual parameters and seed.
- Offer Undo only if trivial within the existing state model; do not build history during this sprint.
- Disable or guard repeated activation only during genuinely expensive work.

## Export

- Label the action with the output: **Export PNG** or **Capture artwork** with format context.
- On activation, announce progress without locking the whole instrument.
- Success confirms filename and dimensions; failure explains recovery.
- Avoid a fake camera flash that harms reduced-motion users.

## Error prevention

- Clamp all parameter routes, including keyboard, pointer, Remix, and loaded defaults.
- Bound text input and show limits before truncation surprises.
- Audio enable/mute and export must remain separate actions.
- Never make a destructive reset look like Remix.

## Pass checklist (25 minutes)

- [ ] Complete the full loop pointer-only, keyboard-only, and touch-emulated.
- [ ] Every control gives immediate, visible cause/effect.
- [ ] Fine and coarse adjustment feel predictable.
- [ ] Focus order follows visual order.
- [ ] Remix preserves identity and never produces invalid values.
- [ ] Mode state is clear without color.
- [ ] Export communicates preparing, success, and failure.
- [ ] No hover-only essential information.

